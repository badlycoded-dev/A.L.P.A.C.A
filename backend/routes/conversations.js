import express from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/auth.js";
import {
  listConversations,
  readChatJson,
  writeChatJson,
  getConversationDir,
  getUserDir,
} from "../utils/storage.js";

const router = express.Router();
router.use(authMiddleware);

// GET /api/conversations - list all for user
router.get("/", (req, res) => {
  const conversations = listConversations(req.user.id);
  res.json(conversations);
});

// POST /api/conversations - create new
router.post("/", (req, res) => {
  const { name, model, systemPrompt } = req.body;
  const conversationId = uuidv4();
  const now = new Date().toISOString();

  const chat = {
    id: conversationId,
    name: name || "New Chat",
    userId: req.user.id,
    model: model || null,
    systemPrompt: systemPrompt || "",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  writeChatJson(req.user.id, conversationId, chat);
  res.json(chat);
});

// GET /api/conversations/:id
router.get("/:id", (req, res) => {
  const chat = readChatJson(req.user.id, req.params.id);
  if (!chat) return res.status(404).json({ error: "Conversation not found" });
  if (chat.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  res.json(chat);
});

// PATCH /api/conversations/:id - update name, model, systemPrompt
router.patch("/:id", (req, res) => {
  const chat = readChatJson(req.user.id, req.params.id);
  if (!chat) return res.status(404).json({ error: "Conversation not found" });
  if (chat.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  const { name, model, systemPrompt } = req.body;
  if (name !== undefined) chat.name = name;
  if (model !== undefined) chat.model = model;
  if (systemPrompt !== undefined) chat.systemPrompt = systemPrompt;
  chat.updatedAt = new Date().toISOString();

  writeChatJson(req.user.id, req.params.id, chat);
  res.json(chat);
});

// DELETE /api/conversations/:id
router.delete("/:id", (req, res) => {
  const chat = readChatJson(req.user.id, req.params.id);
  if (!chat) return res.status(404).json({ error: "Conversation not found" });
  if (chat.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  const dir = getConversationDir(req.user.id, req.params.id);
  fs.rmSync(dir, { recursive: true, force: true });
  res.json({ success: true });
});

// POST /api/conversations/:id/messages - append a message record
router.post("/:id/messages", (req, res) => {
  const chat = readChatJson(req.user.id, req.params.id);
  if (!chat) return res.status(404).json({ error: "Conversation not found" });
  if (chat.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  const message = { ...req.body, id: uuidv4(), timestamp: new Date().toISOString() };
  chat.messages.push(message);
  chat.updatedAt = new Date().toISOString();

  // Auto-name from first user message
  if (chat.messages.filter((m) => m.role === "user").length === 1 && chat.name === "New Chat") {
    const text = message.content?.find?.((c) => c.type === "text")?.text || message.content || "";
    chat.name = text.slice(0, 60) || "New Chat";
  }

  writeChatJson(req.user.id, req.params.id, chat);
  res.json(message);
});

// DELETE /api/conversations/:id/messages - clear all messages
router.delete("/:id/messages", (req, res) => {
  const chat = readChatJson(req.user.id, req.params.id);
  if (!chat) return res.status(404).json({ error: "Conversation not found" });
  if (chat.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  chat.messages = [];
  chat.updatedAt = new Date().toISOString();
  writeChatJson(req.user.id, req.params.id, chat);
  res.json({ success: true });
});

export default router;
