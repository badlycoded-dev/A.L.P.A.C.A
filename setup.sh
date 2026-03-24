#!/usr/bin/env bash
set -e

# ─────────────────────────────────────────────────────────
#  Ollama Chat — Linux setup script
# ─────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${CYAN}[info]${NC}  $1"; }
success() { echo -e "${GREEN}[ok]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[warn]${NC}  $1"; }
error()   { echo -e "${RED}[error]${NC} $1"; exit 1; }

echo ""
echo "  ██████╗ ██╗     ██╗      █████╗ ███╗   ███╗ █████╗"
echo "  ██╔══██╗██║     ██║     ██╔══██╗████╗ ████║██╔══██╗"
echo "  ██║  ██║██║     ██║     ███████║██╔████╔██║███████║"
echo "  ██║  ██║██║     ██║     ██╔══██║██║╚██╔╝██║██╔══██║"
echo "  ██████╔╝███████╗███████╗██║  ██║██║ ╚═╝ ██║██║  ██║"
echo "  ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝"
echo ""
echo "  Chat UI for Ollama — Local AI Workspace"
echo ""

# ── Check Node.js ─────────────────────────────────────────
info "Checking Node.js..."
if ! command -v node &>/dev/null; then
  error "Node.js not found. Install it from https://nodejs.org (v18+)"
fi
NODE_VER=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_VER" -lt 18 ]; then
  error "Node.js v18+ required (found v$(node -v))"
fi
success "Node.js $(node -v)"

# ── Check npm ────────────────────────────────────────────
info "Checking npm..."
if ! command -v npm &>/dev/null; then error "npm not found"; fi
success "npm $(npm -v)"

# ── Check / start Ollama ─────────────────────────────────
info "Checking Ollama..."
if ! command -v ollama &>/dev/null; then
  warn "Ollama not found. Install from https://ollama.com"
  warn "After install, run:  ollama serve"
  warn "Then pull a model:   ollama pull llama3.2"
else
  success "Ollama found: $(ollama --version 2>/dev/null || echo 'installed')"
  # Try to start ollama in background if not running
  if ! curl -s http://localhost:11434 &>/dev/null; then
    info "Starting ollama serve in background..."
    ollama serve &>/dev/null &
    sleep 2
    success "Ollama started"
  else
    success "Ollama already running on :11434"
  fi
fi

# ── Install dependencies ──────────────────────────────────
info "Installing root dependencies..."
npm install --silent

info "Installing backend dependencies..."
cd backend && npm install --silent && cd ..

info "Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..

success "All dependencies installed"

# ── Done ─────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}Setup complete!${NC}"
echo ""
echo "  To start the app:"
echo -e "    ${CYAN}npm run dev${NC}"
echo ""
echo "  Then open:  http://localhost:5173"
echo ""
echo "  Backend API: http://localhost:3001"
echo "  Ollama API:  http://localhost:11434"
echo ""
