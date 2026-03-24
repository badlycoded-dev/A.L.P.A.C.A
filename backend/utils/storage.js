import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "../userdata/users.json");
const USERDATA_DIR = path.join(__dirname, "../userdata");

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

export function saveUsers(users) {
  ensureDir(path.dirname(USERS_FILE));
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function getUserDir(userId) {
  const dir = path.join(USERDATA_DIR, userId);
  ensureDir(dir);
  return dir;
}

export function getConversationDir(userId, conversationId) {
  const dir = path.join(getUserDir(userId), conversationId);
  ensureDir(dir);
  ensureDir(path.join(dir, "uploads"));
  ensureDir(path.join(dir, "files"));
  return dir;
}

export function getChatJsonPath(userId, conversationId) {
  return path.join(getConversationDir(userId, conversationId), "chat.json");
}

export function readChatJson(userId, conversationId) {
  const p = getChatJsonPath(userId, conversationId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function writeChatJson(userId, conversationId, data) {
  const p = getChatJsonPath(userId, conversationId);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

export function listConversations(userId) {
  const userDir = getUserDir(userId);
  const entries = fs.readdirSync(userDir, { withFileTypes: true });
  const conversations = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const chatPath = path.join(userDir, entry.name, "chat.json");
    if (fs.existsSync(chatPath)) {
      const chat = JSON.parse(fs.readFileSync(chatPath, "utf-8"));
      conversations.push({
        id: entry.name,
        name: chat.name,
        model: chat.model,
        systemPrompt: chat.systemPrompt,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messages?.length || 0,
      });
    }
  }

  return conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export { USERDATA_DIR };
