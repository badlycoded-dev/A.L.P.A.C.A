import { create } from "zustand";
import { useAuthStore } from "./authStore.js";

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeId: null,
  activeChat: null,
  models: [],
  modelsLoading: false,
  streaming: false,
  streamingContent: "",

  // Load conversation list
  loadConversations: async () => {
    const { authFetch } = useAuthStore.getState();
    const res = await authFetch("/api/conversations");
    if (res.ok) {
      const data = await res.json();
      set({ conversations: data });
    }
  },

  // Load single conversation with messages
  loadConversation: async (id) => {
    const { authFetch } = useAuthStore.getState();
    const res = await authFetch(`/api/conversations/${id}`);
    if (res.ok) {
      const chat = await res.json();
      set({ activeId: id, activeChat: chat });
      return chat;
    }
    return null;
  },

  // Create new conversation
  createConversation: async (opts = {}) => {
    const { authFetch } = useAuthStore.getState();
    const res = await authFetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    if (res.ok) {
      const chat = await res.json();
      set((s) => ({ conversations: [chat, ...s.conversations] }));
      return chat;
    }
    return null;
  },

  // Update conversation settings
  updateConversation: async (id, updates) => {
    const { authFetch } = useAuthStore.getState();
    const res = await authFetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      set((s) => ({
        conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        activeChat: s.activeId === id ? { ...s.activeChat, ...updated } : s.activeChat,
      }));
      return updated;
    }
  },

  // Delete conversation
  deleteConversation: async (id) => {
    const { authFetch } = useAuthStore.getState();
    await authFetch(`/api/conversations/${id}`, { method: "DELETE" });
    set((s) => {
      const conversations = s.conversations.filter((c) => c.id !== id);
      return {
        conversations,
        activeId: s.activeId === id ? null : s.activeId,
        activeChat: s.activeId === id ? null : s.activeChat,
      };
    });
  },

  // Clear messages
  clearMessages: async (id) => {
    const { authFetch } = useAuthStore.getState();
    await authFetch(`/api/conversations/${id}/messages`, { method: "DELETE" });
    set((s) => ({
      activeChat: s.activeChat ? { ...s.activeChat, messages: [] } : null,
    }));
  },

  // Send message + stream response
  sendMessage: async (content, uploadedFiles = []) => {
    const { activeId, activeChat } = get();
    if (!activeId || !activeChat) return;

    const { authFetch } = useAuthStore.getState();

    // Build user message
    const userMsgContent = [];
    if (content) userMsgContent.push({ type: "text", text: content });
    uploadedFiles.forEach((f) => {
      if (f.mimetype?.startsWith("image/")) {
        userMsgContent.push({ type: "image_url", url: f.url, name: f.originalName });
      } else {
        userMsgContent.push({ type: "file_ref", url: f.url, name: f.originalName, mimetype: f.mimetype });
      }
    });

    const userMessage = {
      role: "user",
      content: userMsgContent,
      files: uploadedFiles,
    };

    // Persist user message
    await authFetch(`/api/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userMessage),
    });

    // Optimistically update UI
    set((s) => ({
      activeChat: {
        ...s.activeChat,
        messages: [...(s.activeChat?.messages || []), { ...userMessage, id: Date.now() }],
      },
      streaming: true,
      streamingContent: "",
    }));

    // Also update conversation name in list
    setTimeout(() => get().loadConversations(), 500);

    // Build ollama messages history
    const historyMessages = (activeChat.messages || []).map((m) => ({
      role: m.role,
      content: Array.isArray(m.content)
        ? m.content.filter((c) => c.type === "text").map((c) => c.text).join("\n")
        : m.content || "",
    }));

    const ollamaMessages = [];
    if (activeChat.systemPrompt) {
      ollamaMessages.push({ role: "system", content: activeChat.systemPrompt });
    }
    ollamaMessages.push(...historyMessages);
    ollamaMessages.push({
      role: "user",
      content: Array.isArray(userMsgContent)
        ? userMsgContent.filter((c) => c.type === "text").map((c) => c.text).join("\n")
        : content,
    });

    try {
      const res = await authFetch("/api/ollama/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: activeChat.model, messages: ollamaMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ollama request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj.message?.content) {
              fullContent += obj.message.content;
              set({ streamingContent: fullContent });
            }
          } catch {}
        }
      }

      // Persist assistant message
      const assistantMessage = { role: "assistant", content: fullContent };
      await authFetch(`/api/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assistantMessage),
      });

      set((s) => ({
        activeChat: {
          ...s.activeChat,
          messages: [
            ...(s.activeChat?.messages || []),
            { ...assistantMessage, id: Date.now() + 1 },
          ],
        },
        streaming: false,
        streamingContent: "",
      }));
    } catch (err) {
      set({ streaming: false, streamingContent: "" });
      throw err;
    }
  },

  // Load available Ollama models
  loadModels: async () => {
    set({ modelsLoading: true });
    const { authFetch } = useAuthStore.getState();
    try {
      const res = await authFetch("/api/ollama/models");
      if (res.ok) {
        const data = await res.json();
        set({ models: data.models || [] });
      }
    } finally {
      set({ modelsLoading: false });
    }
  },
}));
