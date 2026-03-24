import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getUsers, saveUsers, getUserDir } from "../utils/storage.js";
import { authMiddleware, JWT_SECRET } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const users = getUsers();
  if (users.find((u) => u.username === username))
    return res.status(409).json({ error: "Username already taken" });

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    id: uuidv4(),
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  getUserDir(user.id); // create user directory

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({ token, user: { id: user.id, username: user.username } });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({ token, user: { id: user.id, username: user.username } });
});

// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username } });
});

// POST /api/auth/change-password
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(401).json({ error: "Current password incorrect" });

  user.password = await bcrypt.hash(newPassword, 12);
  saveUsers(users);
  res.json({ success: true });
});

export default router;
