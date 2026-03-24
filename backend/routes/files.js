import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middleware/auth.js";
import { getConversationDir, USERDATA_DIR } from "../utils/storage.js";

const router = express.Router();
router.use(authMiddleware);

// Dynamic multer storage - puts files in correct conversation/uploads dir
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { conversationId } = req.params;
    const dir = path.join(getConversationDir(req.user.id, conversationId), "uploads");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// POST /api/files/:conversationId/upload
router.post("/:conversationId/upload", upload.array("files", 10), (req, res) => {
  const files = req.files.map((f) => ({
    originalName: f.originalname,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
    url: `/userdata/${req.user.id}/${req.params.conversationId}/uploads/${f.filename}`,
  }));
  res.json({ files });
});

// GET /api/files/:conversationId/list
router.get("/:conversationId/list", (req, res) => {
  const uploadsDir = path.join(
    getConversationDir(req.user.id, req.params.conversationId),
    "uploads"
  );
  if (!fs.existsSync(uploadsDir)) return res.json({ files: [] });

  const files = fs.readdirSync(uploadsDir).map((filename) => {
    const stat = fs.statSync(path.join(uploadsDir, filename));
    return {
      filename,
      size: stat.size,
      url: `/userdata/${req.user.id}/${req.params.conversationId}/uploads/${filename}`,
    };
  });
  res.json({ files });
});

// DELETE /api/files/:conversationId/:filename
router.delete("/:conversationId/:filename", (req, res) => {
  const filePath = path.join(
    USERDATA_DIR,
    req.user.id,
    req.params.conversationId,
    "uploads",
    req.params.filename
  );
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
});

export default router;
