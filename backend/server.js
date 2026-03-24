import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import conversationRoutes from "./routes/conversations.js";
import ollamaRoutes from "./routes/ollama.js";
import fileRoutes from "./routes/files.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;
const USERDATA_DIR = path.join(__dirname, "userdata");

// Ensure userdata directory exists
if (!fs.existsSync(USERDATA_DIR)) fs.mkdirSync(USERDATA_DIR, { recursive: true });

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving for uploaded/generated files
app.use("/userdata", express.static(USERDATA_DIR));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/ollama", ollamaRoutes);
app.use("/api/files", fileRoutes);

// Serve frontend in production
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 Ollama Chat backend running at http://localhost:${PORT}`);
  console.log(`📁 User data stored in: ${USERDATA_DIR}`);
  console.log(`🤖 Proxying Ollama at: http://localhost:11434\n`);
});
