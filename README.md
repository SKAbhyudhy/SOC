# NEXUS SOC Command Center

NEXUS is a SOC automation platform with a FastAPI backend and a React frontend.

## What is in this repo
- `backend/` — FastAPI APIs and SOC service modules.
- `frontend/` — React dashboard (Vite).
- `docker-compose.yml` — local multi-service stack.
- `k8s/` — Kubernetes manifest.

## Prerequisites
- Docker + Docker Compose **or** local runtimes:
  - Python 3.11+
  - Node.js 18+
  - npm 9+

---

## Run with Docker (recommended)
From repository root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend docs: `http://localhost:8000/docs`
- Redis: `localhost:6379`
- Ollama: `http://localhost:11434`

Default login:
- username: `admin`
- password: `admin123`

Stop services:

```bash
docker compose down
```

---

## Run locally (without Docker)

### 1) Backend
From repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main_api:app --host 0.0.0.0 --port 8000 --reload
```

### 2) Frontend
Open another terminal:

```bash
cd frontend
npm install
npm start
```

Frontend will be available at `http://localhost:3000`.

Build production assets:

```bash
cd frontend
npm run build
```

---

## Common errors and fixes

### `npm run build` → `sh: 1: vite: not found`
Cause: frontend dependencies are not installed.

Fix:

```bash
cd frontend
npm install
npm run build
```

If `npm install` returns `403 Forbidden`, your environment blocks access to npm registry. Use a network that allows `https://registry.npmjs.org` (or configure your internal mirror/proxy), then retry.

### Playwright screenshot error `net::ERR_EMPTY_RESPONSE` for `http://localhost:3000`
Cause: frontend server is not running.

Fix:

```bash
cd frontend
npm install
npm start
```

Then run Playwright screenshot again.

### Backend dependency install fails with `403 Forbidden`
Cause: restricted Python package index/proxy policy.

Fix: allow access to your configured Python package index (or set a permitted internal mirror), then rerun:

```bash
pip install -r backend/requirements.txt
```

---

## Quick health checks

Backend:

```bash
curl -s http://localhost:8000/health
```

Frontend (when running):

```bash
curl -I http://localhost:3000
```
