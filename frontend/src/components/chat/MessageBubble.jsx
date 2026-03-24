import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check, Download, FileText, Image } from "lucide-react";

function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const lang = className?.replace("language-", "") || "";

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.codeWrap}>
      <div style={styles.codeHeader}>
        <span style={styles.codeLang}>{lang || "code"}</span>
        <button onClick={copy} style={styles.copyBtn} title="Copy">
          {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
          <span style={{ fontSize: 11 }}>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="hljs" style={{ margin: 0, padding: "14px 16px", overflowX: "auto", background: "#0f0f14" }}>
        <code className={className} {...props}>{children}</code>
      </pre>
    </div>
  );
}

function FileAttachment({ file }) {
  const isImage = file.mimetype?.startsWith("image/") || file.type === "image_url";
  return (
    <div style={styles.fileAttach}>
      {isImage ? (
        <>
          <img src={file.url} alt={file.name || file.originalName} style={styles.attachImg} />
          <span style={styles.attachName}>{file.name || file.originalName}</span>
        </>
      ) : (
        <>
          <FileText size={14} style={{ color: "var(--accent)" }} />
          <span style={styles.attachName}>{file.name || file.originalName}</span>
          <a href={file.url} download style={styles.attachDl}>
            <Download size={12} />
          </a>
        </>
      )}
    </div>
  );
}

export default function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const textContent = Array.isArray(message.content)
    ? message.content.filter((c) => c.type === "text").map((c) => c.text).join("\n")
    : message.content || "";

  const files = message.files || [];

  const copyAll = async () => {
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ ...styles.row, ...(isUser ? styles.rowUser : styles.rowAssistant) }} className="fade-in">
      {/* Avatar */}
      <div style={{ ...styles.avatar, ...(isUser ? styles.avatarUser : styles.avatarBot) }}>
        {isUser ? "U" : "AI"}
      </div>

      <div style={styles.bubble}>
        {/* File attachments */}
        {files.length > 0 && (
          <div style={styles.attachments}>
            {files.map((f, i) => <FileAttachment key={i} file={f} />)}
          </div>
        )}

        {/* Text content */}
        {isStreaming && !textContent ? (
          <div className="thinking-dots">
            <span /><span /><span />
          </div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  if (inline) return <code className={className} {...props}>{children}</code>;
                  return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
                },
              }}
            >
              {textContent}
            </ReactMarkdown>
            {isStreaming && <span style={styles.cursor} />}
          </div>
        )}

        {/* Copy button for assistant */}
        {!isUser && !isStreaming && textContent && (
          <button onClick={copyAll} style={styles.copyAllBtn} title="Copy response">
            {copied ? <Check size={11} color="var(--green)" /> : <Copy size={11} />}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  rowUser: { flexDirection: "row-reverse" },
  rowAssistant: { flexDirection: "row" },
  avatar: {
    width: 28, height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 600,
    flexShrink: 0,
    fontFamily: "var(--font-mono)",
    marginTop: 2,
  },
  avatarUser: { background: "var(--accent-dim)", color: "var(--accent)" },
  avatarBot: { background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" },
  bubble: {
    flex: 1,
    minWidth: 0,
    maxWidth: "88%",
    position: "relative",
  },
  cursor: {
    display: "inline-block",
    width: 2, height: "1em",
    background: "var(--accent)",
    marginLeft: 2,
    verticalAlign: "text-bottom",
    animation: "pulse 1s ease-in-out infinite",
  },
  copyAllBtn: {
    position: "absolute",
    top: 0, right: 0,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    color: "var(--text-muted)",
    opacity: 0,
    transition: "opacity 0.1s",
    borderRadius: "var(--radius-sm)",
  },
  attachments: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 8,
  },
  fileAttach: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "6px 10px",
    maxWidth: 320,
  },
  attachImg: {
    maxWidth: "100%",
    maxHeight: 300,
    borderRadius: "var(--radius-sm)",
    display: "block",
  },
  attachName: { fontSize: 12, color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  attachDl: { color: "var(--text-muted)", display: "flex", alignItems: "center" },
  codeWrap: { borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", margin: "0.5em 0" },
  codeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 14px",
    background: "var(--bg-elevated)",
    borderBottom: "1px solid var(--border)",
  },
  codeLang: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    fontFamily: "var(--font-sans)",
    padding: "2px 4px",
    borderRadius: 3,
    transition: "color 0.1s",
  },
};
