import { useState } from "react";
import { useAuthStore } from "../store/authStore.js";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.grid} aria-hidden="true" />
      <div style={styles.card} className="fade-in">
        <div style={styles.logo}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="var(--accent-dim)" />
            <circle cx="18" cy="18" r="7" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
            <circle cx="18" cy="18" r="3" fill="var(--accent)" />
            <path d="M18 7v4M18 25v4M7 18h4M25 18h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </svg>
          <span style={styles.logoText}>Ollama Chat</span>
        </div>

        <h1 style={styles.title}>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p style={styles.subtitle}>
          {mode === "login" ? "Sign in to your local AI workspace" : "Start your local AI journey"}
        </p>

        <form onSubmit={submit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }} disabled={loading}>
            {loading ? (
              <span className="spin" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
            ) : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={styles.switchRow}>
          <span style={{ color: "var(--text-muted)" }}>
            {mode === "login" ? "No account?" : "Already have one?"}
          </span>
          <button
            style={styles.switchBtn}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-base)",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    opacity: 0.5,
    maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)",
  },
  card: {
    position: "relative",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "36px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 0 60px rgba(124,106,255,0.07)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  logoText: {
    fontFamily: "var(--font-mono)",
    fontWeight: 500,
    fontSize: 15,
    color: "var(--text-primary)",
  },
  title: { fontSize: 20, fontWeight: 600, marginBottom: 4 },
  subtitle: { color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 },
  form: { marginBottom: 16 },
  error: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: "var(--radius-sm)",
    color: "var(--red)",
    padding: "8px 12px",
    fontSize: 12,
    marginBottom: 14,
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 13,
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "var(--font-sans)",
    padding: 0,
  },
};
