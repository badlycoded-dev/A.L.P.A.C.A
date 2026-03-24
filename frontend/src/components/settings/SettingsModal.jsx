import { useState, useEffect } from "react";
import { X, Download, Trash2, RefreshCw, Shield, Cpu } from "lucide-react";
import { useChatStore } from "../../store/chatStore.js";
import { useAuthStore } from "../../store/authStore.js";

function ModelManager() {
  const { models, loadModels, modelsLoading } = useChatStore();
  const { authFetch } = useAuthStore.getState();
  const [pullName, setPullName] = useState("");
  const [pulling, setPulling] = useState(false);
  const [pullLog, setPullLog] = useState("");
  const [deleting, setDeleting] = useState(null);

  const pullModel = async () => {
    if (!pullName.trim()) return;
    setPulling(true);
    setPullLog("");
    try {
      const res = await authFetch("/api/ollama/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pullName.trim() }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj.status) setPullLog(obj.status + (obj.completed ? ` (${Math.round((obj.completed / obj.total) * 100)}%)` : ""));
          } catch {}
        }
      }
      await loadModels();
      setPullName("");
      setPullLog("✓ Model pulled successfully");
    } catch (err) {
      setPullLog("Error: " + err.message);
    } finally {
      setPulling(false);
    }
  };

  const deleteModel = async (name) => {
    if (!confirm(`Delete model "${name}"?`)) return;
    setDeleting(name);
    try {
      await authFetch(`/api/ollama/models/${encodeURIComponent(name)}`, { method: "DELETE" });
      await loadModels();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div style={sectionStyles.title}><Cpu size={14} /> Model Management</div>

      {/* Pull new model */}
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Pull New Model</label>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            className="input"
            value={pullName}
            onChange={(e) => setPullName(e.target.value)}
            placeholder="e.g. llama3.2, mistral, phi3"
            onKeyDown={(e) => e.key === "Enter" && pullModel()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary btn-sm" onClick={pullModel} disabled={pulling || !pullName.trim()}>
            {pulling ? <RefreshCw size={12} className="spin" /> : <Download size={12} />}
            {pulling ? "Pulling…" : "Pull"}
          </button>
        </div>
        {pullLog && (
          <div style={{ marginTop: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: pullLog.startsWith("Error") ? "var(--red)" : "var(--green)", padding: "4px 8px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
            {pullLog}
          </div>
        )}
      </div>

      {/* Installed models */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <label className="form-label" style={{ margin: 0 }}>Installed Models</label>
        <button className="btn btn-ghost btn-sm" onClick={() => loadModels()} disabled={modelsLoading}>
          <RefreshCw size={11} className={modelsLoading ? "spin" : ""} />
        </button>
      </div>

      {models.length === 0 ? (
        <div style={sectionStyles.empty}>No models installed. Pull one above.</div>
      ) : (
        <div style={sectionStyles.modelList}>
          {models.map((m) => (
            <div key={m.name} style={sectionStyles.modelRow}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-primary)" }}>{m.name}</div>
                {m.size && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{(m.size / 1e9).toFixed(2)} GB</div>}
              </div>
              <button
                className="btn btn-danger btn-sm btn-icon"
                onClick={() => deleteModel(m.name)}
                disabled={deleting === m.name}
              >
                {deleting === m.name ? <RefreshCw size={12} className="spin" /> : <Trash2 size={12} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountSettings() {
  const { user, authFetch, logout } = useAuthStore();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (!currentPw || !newPw) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("✓ Password changed");
      setCurrentPw(""); setNewPw("");
    } catch (err) {
      setMsg("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={sectionStyles.title}><Shield size={14} /> Account</div>
      <div style={{ marginBottom: 12, padding: "8px 12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
        Signed in as <strong style={{ fontFamily: "var(--font-mono)" }}>{user?.username}</strong>
      </div>

      <label className="form-label">Change Password</label>
      <div className="form-group">
        <input className="input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" style={{ marginBottom: 6 }} />
        <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" />
      </div>
      {msg && <div style={{ fontSize: 11, color: msg.startsWith("Error") ? "var(--red)" : "var(--green)", marginBottom: 8 }}>{msg}</div>}
      <button className="btn btn-outline btn-sm" onClick={changePassword} disabled={loading || !currentPw || !newPw}>
        {loading ? "Saving…" : "Update password"}
      </button>
    </div>
  );
}

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState("models");

  const tabs = [
    { id: "models", label: "Models" },
    { id: "account", label: "Account" },
  ];

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="fade-in">
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>Settings</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={styles.body}>
          {tab === "models" && <ModelManager />}
          {tab === "account" && <AccountSettings />}
        </div>
      </div>
    </div>
  );
}

const sectionStyles = {
  title: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 12, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.07em", color: "var(--text-muted)",
    marginBottom: 14,
  },
  empty: { fontSize: 12, color: "var(--text-muted)", padding: "8px 0" },
  modelList: { display: "flex", flexDirection: "column", gap: 6 },
  modelRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 12px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
  },
};

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    width: "100%", maxWidth: 480,
    maxHeight: "80vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border-subtle)",
    flexShrink: 0,
  },
  modalTitle: { fontSize: 14, fontWeight: 600 },
  tabs: {
    display: "flex",
    gap: 2,
    padding: "8px 12px",
    borderBottom: "1px solid var(--border-subtle)",
    flexShrink: 0,
  },
  tab: {
    background: "none", border: "none",
    cursor: "pointer",
    padding: "5px 12px",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    color: "var(--text-secondary)",
    fontFamily: "var(--font-sans)",
    transition: "all 0.1s",
  },
  tabActive: { background: "var(--bg-active)", color: "var(--text-primary)", fontWeight: 500 },
  body: { padding: "16px", overflowY: "auto", flex: 1 },
};
