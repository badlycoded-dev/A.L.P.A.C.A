# A.L.P.A.C.A (Any-model Limitless Personal Ai Coding Agent)

A Claude.ai-style web app for chatting with local AI models via [Ollama](https://ollama.com).  
All models run on your machine. Your data never leaves your computer.

---

## Features

- 🔐 **Local auth** — username/password, JWT sessions, multi-user
- 💬 **Multi-conversation** — per-chat history, auto-named from first message
- 🤖 **Per-chat model selection** — choose from any pulled Ollama model
- 🧠 **System prompts** — set a persona per conversation
- 📎 **File & image upload** — attach files to messages (stored locally)
- 📝 **Markdown + syntax highlighting** — full GFM + code blocks with copy button
- 📁 **Structured storage** — `userdata/{userId}/{conversationId}/chat.json`
- 🔄 **Streaming responses** — token-by-token streaming from Ollama
- ⬆️ **Model management** — pull/delete Ollama models from the UI

---

## Requirements

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **Ollama** — [ollama.com](https://ollama.com)
- At least one pulled model (e.g. `ollama pull llama3.2`)

---

## Quick Start

```bash
# 1. Clone / download this folder, then:
cd ollama-chat

# 2. Run setup (installs all dependencies)
./setup.sh

# 3. Start both backend + frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Manual Start

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm install
node server.js

# Terminal 2 — Frontend dev server (port 5173)
cd frontend
npm install
npm run dev
```

---

## Production Build

```bash
# Build frontend
cd frontend && npm run build

# Start backend only (serves built frontend too)
cd ../backend && node server.js
```

Then open **http://localhost:3001**

---

<!--## Storage Structure

```
backend/
└── userdata/
    ├── users.json                     ← hashed credentials
    └── {userId}/
        └── {conversationId}/
            ├── chat.json              ← messages, model, system prompt
            ├── uploads/               ← user-uploaded files
            └── files/                 ← AI-generated downloadable files
```

### chat.json schema

```json
{
  "id": "uuid",
  "name": "Chat name (auto-set from first message)",
  "userId": "uuid",
  "model": "llama3.2",
  "systemPrompt": "You are a helpful assistant...",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": [{ "type": "text", "text": "Hello!" }],
      "files": [],
      "timestamp": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Hi there! How can I help?",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
``` 

---

## Environment Variables

Create `backend/.env` to override defaults:

```bash
PORT=3001                           # Backend port
OLLAMA_HOST=http://localhost:11434  # Ollama API URL
JWT_SECRET=your-secret-here        # Change in production!
```

---

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/change-password` | Change password |

### Conversations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations` | List all |
| POST | `/api/conversations` | Create new |
| GET | `/api/conversations/:id` | Get with messages |
| PATCH | `/api/conversations/:id` | Update name/model/prompt |
| DELETE | `/api/conversations/:id` | Delete |
| POST | `/api/conversations/:id/messages` | Append message |
| DELETE | `/api/conversations/:id/messages` | Clear messages |

### Ollama Proxy
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ollama/models` | List pulled models |
| POST | `/api/ollama/chat` | Stream chat (SSE) |
| POST | `/api/ollama/pull` | Pull model (SSE) |
| DELETE | `/api/ollama/models/:name` | Delete model |

### Files
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/files/:convId/upload` | Upload files |
| GET | `/api/files/:convId/list` | List uploads |
| DELETE | `/api/files/:convId/:filename` | Delete file |

----->

## Pulling Models

From the **Settings → Models** tab in the UI, or via CLI:

```bash
ollama pull llama3.2          # 2GB — fast, capable
ollama pull mistral           # 4GB — great for code
ollama pull phi3              # 2.3GB — lightweight
ollama pull codellama         # 4GB — code specialist
ollama pull llava             # 4.7GB — vision model
```

---

## Troubleshooting

**"Cannot reach Ollama"**  
→ Run `ollama serve` in a terminal and keep it open.

**Port 3001 already in use**  
→ `PORT=3002 node server.js`

**Frontend can't reach backend**  
→ Check `vite.config.js` proxy target matches your backend port.

**Models not showing**  
→ Click the refresh button in Settings → Models or Chat Settings.
