import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import AuthPage from "./pages/AuthPage.jsx";
import ChatLayout from "./pages/ChatLayout.jsx";

export default function App() {
  const { user, loading, init } = useAuthStore();

  useEffect(() => { init(); }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        <span className="spin" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }} />
        loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/*" element={user ? <ChatLayout /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
