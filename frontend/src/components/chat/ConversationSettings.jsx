import { useState } from "react";
import { X, RefreshCw, Trash2 } from "lucide-react";
import { useChatStore } from "../../store/chatStore.js";

export default function ConversationSettings({ chat, onClose }) {
  const { models, modelsLoading, loadModels, updateConversation, clearMessages } = useChatStore();
  const [name, setName] = useState(chat.name || "");
  const [model, setModel] = useState(chat.model || "");
  const [systemPrompt, setSystemPrompt] = useState(chat.systemPrompt || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clearing, setClearing] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateConversation(chat.id, { name, model, systemPrompt });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const clear = async () => {
    if (!confirm("Clear all messages in this conversation?")) return;
    setClearing(true);
    await clearMessages(chat.id);
    setClearing(false);
  };

  return (
    <div style={styles.panel} className="fade-in">
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>Chat Settings</span>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={14} /></button>
      </div>

      <div style={styles.panelBody}>
        {/* Chat name */}
        <div className="form-group">
          <label className="form-label">Chat Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Untitled" />
        </div>

        {/* Model selector */}
        <div className="form-group">
          <label className="form-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Model</span>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: "2px 6px", fontSize: 10, gap: 4 }}
              onClick={() => loadModels()}
              disabled={modelsLoading}
            >
              <RefreshCw size={10} className={modelsLoading ? "spin" : ""} />
              Refresh
            </button>
          </label>
          {models.length === 0 ? (
            <div style={styles.noModels}>
              No models found. Make sure Ollama is running.
            </div>
          ) : (
            <select
              className="input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">— Select a model —</option>
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                  {m.size ? ` (${(m.size / 1e9).toFixed(1)}GB)` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* System prompt */}
        <div className="form-group">
          <label className="form-label">System Prompt</label>
          <textarea
            className="textarea mono"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant..."
            rows={5}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
          </button>
          <button className="btn btn-danger btn-sm" onClick={clear} disabled={clearing}>
            <Trash2 size={12} />
            {clearing ? "Clearing…" : "Clear messages"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
    animation: "fadeIn 0.15s ease",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderBottom: "1px solid var(--border-subtle)",
  },
  panelTitle: { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" },
  panelBody: { padding: "14px 16px", maxHeight: 340, overflowY: "auto" },
  noModels: {
    padding: "8px 12px",
    background: "rgba(251,191,36,0.07)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "var(--radius-sm)",
    fontSize: 12,
    color: "var(--yellow)",
  },
  actions: { display: "flex", gap: 8, flexWrap: "wrap" },
};
