import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PanelLeftClose, PanelLeft, Plus, Trash2, MessageSquare, Settings, LogOut, ChevronDown } from "lucide-react";
import { useChatStore } from "../../store/chatStore.js";
import { useAuthStore } from "../../store/authStore.js";

export default function Sidebar({ open, onToggle, onOpenSettings }) {
  const { conversations, createConversation, deleteConversation, models } = useChatStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [deleting, setDeleting] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNew = async () => {
    const chat = await createConversation({ model: models[0]?.name || null });
    navigate(`/c/${chat.id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleting(id);
    await deleteConversation(id);
    setDeleting(null);
    if (activeId === id) navigate("/");
  };

  return (
    <>
      {/* Sidebar panel */}
      <aside style={{ ...styles.sidebar, transform: open ? "translateX(0)" : "translateX(-100%)" }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="var(--accent-dim)" />
              <circle cx="18" cy="18" r="7" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
              <circle cx="18" cy="18" r="3" fill="var(--accent)" />
              <path d="M18 7v4M18 25v4M7 18h4M25 18h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
            <span style={styles.brandName}>Ollama Chat</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onToggle} data-tip="Collapse">
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* New chat button */}
        <div style={styles.newChatWrap}>
          <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={handleNew}>
            <Plus size={14} />
            New Chat
          </button>
        </div>

        <div className="divider" style={{ margin: "0 0 8px" }} />

        {/* Conversation list */}
        <nav style={styles.nav}>
          {conversations.length === 0 ? (
            <div style={styles.empty}>
              <MessageSquare size={24} style={{ opacity: 0.2, marginBottom: 6 }} />
              <span>No conversations yet</span>
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                style={{
                  ...styles.convItem,
                  ...(c.id === activeId ? styles.convItemActive : {}),
                }}
                onClick={() => navigate(`/c/${c.id}`)}
              >
                <div style={styles.convIcon}>
                  <MessageSquare size={13} />
                </div>
                <div style={styles.convInfo}>
                  <span style={styles.convName}>{c.name || "Untitled"}</span>
                  {c.model && (
                    <span style={styles.convModel}>{c.model.split(":")[0]}</span>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ ...styles.deleteBtn, opacity: deleting === c.id ? 1 : undefined }}
                  onClick={(e) => handleDelete(e, c.id)}
                  data-tip="Delete"
                >
                  {deleting === c.id
                    ? <span className="spin" style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid var(--border)", borderTopColor: "var(--red)", borderRadius: "50%" }} />
                    : <Trash2 size={12} />}
                </button>
              </div>
            ))
          )}
        </nav>

        {/* Footer */}
        <div style={styles.footer}>
          <div className="divider" style={{ margin: "0 0 8px" }} />
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }} onClick={onOpenSettings}>
            <Settings size={14} />
            Settings
          </button>
          <div style={styles.userRow} onClick={() => setUserMenuOpen((v) => !v)}>
            <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
            <span style={styles.userName}>{user?.username}</span>
            <ChevronDown size={12} style={{ marginLeft: "auto", color: "var(--text-muted)", transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </div>
          {userMenuOpen && (
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", color: "var(--red)" }} onClick={logout}>
              <LogOut size={14} />
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Floating toggle when sidebar is closed */}
      {!open && (
        <button
          className="btn btn-ghost btn-icon"
          style={styles.floatingToggle}
          onClick={onToggle}
          data-tip="Open sidebar"
        >
          <PanelLeft size={16} />
        </button>
      )}
    </>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    top: 0, left: 0, bottom: 0,
    width: "var(--sidebar-width)",
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border-subtle)",
    display: "flex",
    flexDirection: "column",
    zIndex: 50,
    transition: "transform 0.2s ease",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 12px 12px 14px",
    height: "var(--header-height)",
    flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandName: { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" },
  newChatWrap: { padding: "0 10px 8px" },
  nav: { flex: 1, overflowY: "auto", padding: "4px 8px" },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 0",
    color: "var(--text-muted)",
    fontSize: 12,
    gap: 2,
  },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 8px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "background 0.1s",
    position: "relative",
    userSelect: "none",
  },
  convItemActive: {
    background: "var(--bg-active)",
  },
  convIcon: { color: "var(--text-muted)", flexShrink: 0 },
  convInfo: { flex: 1, minWidth: 0 },
  convName: {
    display: "block",
    fontSize: 13,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convModel: {
    fontSize: 10,
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
  },
  deleteBtn: {
    flexShrink: 0,
    opacity: 0,
    color: "var(--red)",
    transition: "opacity 0.1s",
    ".convItem:hover &": { opacity: 1 },
  },
  footer: { padding: "0 8px 12px", flexShrink: 0 },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  avatar: {
    width: 26, height: 26,
    borderRadius: "50%",
    background: "var(--accent-dim)",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  userName: { fontSize: 13, color: "var(--text-primary)", fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  floatingToggle: {
    position: "fixed",
    top: 10,
    left: 10,
    zIndex: 40,
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
  },
};
