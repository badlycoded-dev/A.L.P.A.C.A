import { useRef, useState, useCallback } from "react";
import { Send, Paperclip, X, Image, FileText, Loader2 } from "lucide-react";
import { useChatStore } from "../../store/chatStore.js";
import { useAuthStore } from "../../store/authStore.js";

export default function ChatInput({ conversationId, disabled, noModel, onError }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { sendMessage, streaming } = useChatStore();
  const { authFetch } = useAuthStore.getState();

  const uploadFiles = async (rawFiles) => {
    if (!rawFiles.length) return [];
    setUploading(true);
    const form = new FormData();
    rawFiles.forEach((f) => form.append("files", f));
    try {
      const res = await authFetch(`/api/files/${conversationId}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.files;
    } catch (err) {
      onError(err.message);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const raw = Array.from(e.target.files || []);
    if (!raw.length) return;
    const uploaded = await uploadFiles(raw);
    setFiles((prev) => [...prev, ...uploaded]);
    e.target.value = "";
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    const raw = Array.from(e.dataTransfer.files);
    if (!raw.length) return;
    const uploaded = await uploadFiles(raw);
    setFiles((prev) => [...prev, ...uploaded]);
  }, [conversationId]);

  const handleSubmit = async () => {
    if ((!text.trim() && !files.length) || disabled || streaming) return;
    const msgText = text.trim();
    const msgFiles = [...files];
    setText("");
    setFiles([]);
    try {
      await sendMessage(msgText, msgFiles);
    } catch (err) {
      onError(err.message || "Failed to send message");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  return (
    <div
      style={{ ...styles.wrap, ...(dragOver ? styles.wrapDrag : {}) }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {noModel && (
        <div style={styles.noModelWarn}>
          ⚠ No model selected. Open chat settings (top-right) to choose a model.
        </div>
      )}

      {/* Attached files preview */}
      {files.length > 0 && (
        <div style={styles.filePreview}>
          {files.map((f, i) => {
            const isImage = f.mimetype?.startsWith("image/");
            return (
              <div key={i} style={styles.fileChip}>
                {isImage ? <Image size={11} /> : <FileText size={11} />}
                <span style={styles.fileChipName}>{f.originalName}</span>
                <button
                  style={styles.fileChipRemove}
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.inputRow}>
        {/* File button */}
        <button
          className="btn btn-ghost btn-icon"
          style={{ flexShrink: 0, color: "var(--text-muted)" }}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled && !streaming}
          data-tip="Attach files"
        >
          {uploading ? <Loader2 size={16} className="spin" /> : <Paperclip size={16} />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileChange}
          accept="image/*,.pdf,.txt,.md,.json,.csv,.py,.js,.ts,.jsx,.tsx,.html,.css"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          value={text}
          onChange={(e) => { setText(e.target.value); autoResize(e); }}
          onKeyDown={handleKeyDown}
          placeholder={noModel ? "Select a model to start chatting…" : "Message… (Enter to send, Shift+Enter for new line)"}
          rows={1}
          disabled={disabled && !files.length}
        />

        {/* Send button */}
        <button
          className="btn btn-primary btn-icon"
          style={{ flexShrink: 0, alignSelf: "flex-end" }}
          onClick={handleSubmit}
          disabled={(!text.trim() && !files.length) || (disabled && !files.length) || uploading}
        >
          {streaming
            ? <Loader2 size={15} className="spin" />
            : <Send size={15} />}
        </button>
      </div>

      {dragOver && (
        <div style={styles.dropOverlay}>
          <Paperclip size={24} style={{ marginBottom: 6 }} />
          Drop files to attach
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    padding: "10px 16px 14px",
    borderTop: "1px solid var(--border-subtle)",
    background: "var(--bg-surface)",
    flexShrink: 0,
    position: "relative",
    transition: "border-color 0.15s",
  },
  wrapDrag: { borderColor: "var(--accent)" },
  noModelWarn: {
    background: "rgba(251,191,36,0.07)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "var(--radius-sm)",
    padding: "6px 10px",
    fontSize: 11,
    color: "var(--yellow)",
    marginBottom: 8,
  },
  filePreview: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  fileChip: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "3px 8px",
    fontSize: 11,
    color: "var(--text-secondary)",
    maxWidth: 200,
  },
  fileChipName: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 },
  fileChipRemove: {
    background: "none", border: "none", cursor: "pointer",
    color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 0,
    flexShrink: 0,
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "6px 8px",
    transition: "border-color 0.15s",
  },
  textarea: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    resize: "none",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    fontSize: 13.5,
    lineHeight: 1.55,
    padding: "3px 0",
    minHeight: 24,
    maxHeight: 200,
    overflowY: "auto",
  },
  dropOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(124,106,255,0.12)",
    border: "2px dashed var(--accent)",
    borderRadius: "var(--radius-md)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent)",
    fontSize: 13,
    fontWeight: 500,
    pointerEvents: "none",
    zIndex: 10,
  },
};
