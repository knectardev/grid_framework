# Grid – Golden Layout proof-of-concept

Standalone experimental app to validate Golden Layout as a workspace framework with configuration-driven layout persistence (ntree-aligned).

## Stack

- **Backend:** Python 3.11+, FastAPI, Pydantic, JSON file storage
- **Frontend:** Vite, TypeScript, Golden Layout (official package)

## Run

**Backend** (from repo root):

```bash
.\.venv\Scripts\activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend** (Vite dev server with proxy to backend):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Features

- Panels (Explorer, Editor, Inspector) can be resized and rearranged
- Layout persists after reload (backend owns persistence)
- **Ctrl+Z** undoes layout change (previous snapshot)
- **Ctrl+Shift+Z** redoes
- Layout stored as JSON; backend maintains version; round-trip integrity

## API

- `GET /layout/{name}` – fetch layout config
- `POST /layout/{name}` – create/replace layout
- `PATCH /layout/{name}` – update layout (same as POST for this PoC)

## Layout persistence

- Frontend serializes layout with Golden Layout’s `saveLayout()` (resolved config)
- On load, config is converted with `LayoutConfig.fromResolved()` then passed to `loadLayout()`
- Undo/redo: application-level history (max 50 states); each step is a full layout JSON snapshot; undo/redo destroys and reinitializes Golden Layout from the chosen snapshot and syncs to backend
