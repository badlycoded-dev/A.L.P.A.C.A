import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useChatStore } from "../store/chatStore.js";
import Sidebar from "../components/sidebar/Sidebar.jsx";
import ChatView from "../components/chat/ChatView.jsx";
import WelcomeView from "../components/chat/WelcomeView.jsx";
import SettingsModal from "../components/settings/SettingsModal.jsx";

export default function ChatLayout() {
  const { loadConversations, loadModels } = useChatStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadConversations();
    loadModels();
  }, []);

  return (
    <div style={styles.layout}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <main style={{ ...styles.main, marginLeft: sidebarOpen ? "var(--sidebar-width)" : 0 }}>
        <Routes>
          <Route path="/" element={<WelcomeView onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />} />
          <Route path="/c/:id" element={<ChatView onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />} />
        </Routes>
      </main>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

const styles = {
  layout: { display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", transition: "margin-left 0.2s ease", minWidth: 0 },
};
