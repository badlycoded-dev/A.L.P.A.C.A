import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { PanelLeft, Settings2, Trash2, AlertCircle } from "lucide-react";
import { useChatStore } from "../../store/chatStore.js";
import MessageList from "./MessageList.jsx";
import ChatInput from "./ChatInput.jsx";
import ConversationSettings from "./ConversationSettings.jsx";

export default function ChatView({ onToggleSidebar, sidebarOpen }) {
  const { id } = useParams();
  const { loadConversation, activeChat, streaming } = useChatStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) loadConversation(id);
    setError("");
    setSettingsOpen(false);
  }, [id]);

  if (!activeChat) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        <span className="spin" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", marginRight: 10 }} />
        loading conversation...
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {!sidebarOpen && (
            <button className="btn btn-ghost btn-icon" onClick={onToggleSidebar}>
              <PanelLeft size={16} />
            </button>
          )}
          <div style={styles.chatTitle}>
            <span style={styles.titleText}>{activeChat.name || "Untitled"}</span>
            {activeChat.model && (
              <span className="badge badge-accent" style={{ marginLeft: 8 }}>
                {activeChat.model.split(":")[0]}
              </span>
            )}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setSettingsOpen((v) => !v)}
          style={settingsOpen ? { background: "var(--bg-active)" } : {}}
          data-tip="Chat settings"
        >
          <Settings2 size={15} />
        </button>
      </header>

      {/* Settings panel */}
      {settingsOpen && (
        <ConversationSettings chat={activeChat} onClose={() => setSettingsOpen(false)} />
      )}

      {/* Error banner */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={14} />
          {error}
          <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>✕</button>
        </div>
      )}

      {/* Messages */}
      <MessageList chat={activeChat} />

      {/* Input */}
      <ChatInput
        conversationId={id}
        disabled={!activeChat.model || streaming}
        noModel={!activeChat.model}
        onError={setError}
      />
    </div>
  );
}

const styles = {
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg-base)",
  },
  header: {
    height: "var(--header-height)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px 0 14px",
    borderBottom: "1px solid var(--border-subtle)",
    background: "var(--bg-surface)",
    flexShrink: 0,
    gap: 8,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 },
  chatTitle: { display: "flex", alignItems: "center", minWidth: 0, flex: 1 },
  titleText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "rgba(248,113,113,0.08)",
    borderBottom: "1px solid rgba(248,113,113,0.2)",
    color: "var(--red)",
    fontSize: 12,
    flexShrink: 0,
  },
};
