import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const OLLAMA_BASE = process.env.OLLAMA_HOST || "http://localhost:11434";

router.use(authMiddleware);

// GET /api/ollama/models - list pulled models
router.get("/models", async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!response.ok) throw new Error(`Ollama responded with ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Cannot reach Ollama. Is it running?", detail: err.message });
  }
});

// POST /api/ollama/chat - streaming chat proxy
router.post("/chat", async (req, res) => {
  const { model, messages, options } = req.body;
  if (!model || !messages) return res.status(400).json({ error: "model and messages required" });

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true, options: options || {} }),
    });

    if (!ollamaRes.ok) {
      const err = await ollamaRes.text();
      return res.status(502).json({ error: "Ollama error", detail: err });
    }

    // Stream the response back to client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: "Cannot reach Ollama", detail: err.message });
    }
  }
});

// POST /api/ollama/pull - pull a model (streamed progress)
router.post("/pull", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Model name required" });

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stream: true }),
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) res.status(502).json({ error: err.message });
  }
});

// DELETE /api/ollama/models/:name - delete a model
router.delete("/models/:name", async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: req.params.name }),
    });
    res.status(response.status).json({ success: response.ok });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
