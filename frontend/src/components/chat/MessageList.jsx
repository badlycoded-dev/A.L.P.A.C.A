import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/chatStore.js";
import MessageBubble from "./MessageBubble.jsx";

export default function MessageList({ chat }) {
  const { streaming, streamingContent } = useChatStore();
  const bottomRef = useRef(null);
  const messages = chat?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingContent]);

  if (messages.length === 0 && !streaming) {
    return (
      <div style={styles.empty}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {chat?.model ? `Send a message to start chatting with ${chat.model.split(":")[0]}` : "Select a model in chat settings to begin"}
        </span>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      <div style={styles.inner}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}

        {/* Streaming assistant bubble */}
        {streaming && (
          <MessageBubble
            message={{ role: "assistant", content: streamingContent }}
            isStreaming={true}
          />
        )}

        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}

const styles = {
  list: { flex: 1, overflowY: "auto", padding: "0 0 8px" },
  inner: { maxWidth: 780, margin: "0 auto", padding: "16px 20px" },
  empty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
};
