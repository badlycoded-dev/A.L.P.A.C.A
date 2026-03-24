import { useNavigate } from "react-router-dom";
import { Plus, Cpu, PanelLeft } from "lucide-react";
import { useChatStore } from "../../store/chatStore.js";
import { useAuthStore } from "../../store/authStore.js";

export default function WelcomeView({ onToggleSidebar, sidebarOpen }) {
  const { createConversation, models } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleNew = async () => {
    const chat = await createConversation({ model: models[0]?.name || null });
    navigate(`/c/${chat.id}`);
  };

  return (
    <div style={styles.root}>
      {!sidebarOpen && (
        <button className="btn btn-ghost btn-icon" style={styles.sidebarBtn} onClick={onToggleSidebar}>
          <PanelLeft size={16} />
        </button>
      )}
      <div style={styles.content} className="fade-in">
        <div style={styles.iconWrap}>
          <Cpu size={40} style={{ color: "var(--accent)", opacity: 0.8 }} />
        </div>
        <h1 style={styles.title}>Hello, {user?.username}</h1>
        <p style={styles.subtitle}>
          Your local AI workspace. All models run on your machine via Ollama.
        </p>

        {models.length === 0 ? (
          <div style={styles.noModels}>
            <span style={{ color: "var(--yellow)" }}>⚠</span>
            No Ollama models found. Make sure Ollama is running and pull a model first.
            <br />
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginTop: 6, display: "block" }}>
              ollama pull llama3.2
            </code>
          </div>
        ) : (
          <div style={styles.modelList}>
            {models.slice(0, 4).map((m) => (
              <div key={m.name} style={styles.modelChip}>
                <span style={{ color: "var(--accent)", marginRight: 4, fontFamily: "var(--font-mono)" }}>▸</span>
                {m.name}
              </div>
            ))}
            {models.length > 4 && (
              <div style={styles.modelChip}>+{models.length - 4} more</div>
            )}
          </div>
        )}

        <button className="btn btn-primary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={handleNew}>
          <Plus size={15} />
          Start new chat
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    background: "var(--bg-base)",
  },
  sidebarBtn: { position: "absolute", top: 10, left: 10 },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 16,
    maxWidth: 440,
    padding: 32,
  },
  iconWrap: {
    width: 72, height: 72,
    borderRadius: "50%",
    background: "var(--accent-glow)",
    border: "1px solid var(--accent-dim)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" },
  subtitle: { color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, maxWidth: 340 },
  noModels: {
    background: "rgba(251,191,36,0.07)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    textAlign: "left",
  },
  modelList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  modelChip: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "4px 10px",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
  },
};
