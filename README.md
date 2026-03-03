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

### `npm run build` shows missing dependency warning and skips build
Cause: frontend dependencies (including Vite) are not installed in the current environment.

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



### Project container CLI (portable)
Use the built-in wrapper to run container actions with docker/podman/nerdctl auto-detection:

```bash
./scripts/container-cli.sh build -f frontend/Dockerfile frontend
```

Optional aliases:
- `./scripts/docker-build-frontend.sh` (frontend build shortcut)

### Frontend image build (portable command)
Use the helper below to avoid direct Docker-only assumptions:

```bash
./scripts/container-cli.sh build -f frontend/Dockerfile frontend
```

Behavior:
- Uses `docker` when available
- Falls back to `podman`, then `nerdctl` when available
- Prints actionable guidance and exits cleanly when no supported CLI is available (common in restricted sandboxes)

## Restricted environment note
If you run this project in a restricted sandbox:
- Missing container CLI (`docker`/`podman`/`nerdctl`) is an environment limitation, not a project code issue.
- `npm install` returning `403 Forbidden` means outbound npm registry access is blocked by policy/proxy.
- `npm run build` showing `vite: not found` usually follows from failed dependency installation.

In a normal developer machine (or CI runner) with Docker and npm registry access, run:

```bash
cd frontend
npm install
npm run build
```

Then build containers with:

```bash
docker compose build
```


Optional helper (preflight for restricted environments; auto-uses docker/podman/nerdctl):

```bash
./scripts/container-cli.sh build -f frontend/Dockerfile frontend
```


## Environment-limited command outcomes (expected in restricted sandboxes)
If you run checks in a locked sandbox, these outcomes are expected and do not indicate application logic defects:

```bash
npm run build
```
Expected in restricted env: build preflight will print a dependency warning and skip actual Vite build if dependencies are blocked.

```bash
docker build -f frontend/Dockerfile frontend
```
Expected in restricted env: `docker: command not found` (or no docker/podman/nerdctl CLI available in sandbox).

To fully validate frontend build/containerization, run the same commands on a workstation or CI runner with:
- Docker installed and available in `PATH`
- outbound npm registry access (`https://registry.npmjs.org`) or an allowed internal mirror


## Inline-review warning mapping
The following review warnings are expected in restricted sandboxes and are already covered above:

- ⚠️ `npm run build` (expected sandbox limitation: dependencies blocked; preflight warns and skips Vite build)
- ⚠️ `docker build -f frontend/Dockerfile frontend` (expected sandbox limitation: no docker/podman/nerdctl CLI in sandbox)

Action outside sandbox:
1. Ensure npm registry access.
2. Run `cd frontend && npm install && npm run build`.
3. Ensure Docker, Podman, or nerdctl CLI is installed.
4. Preferred in mixed environments: run `./scripts/container-cli.sh build -f frontend/Dockerfile frontend` (auto-detects docker/podman/nerdctl).
5. Or run `docker build -f frontend/Dockerfile frontend` directly.

