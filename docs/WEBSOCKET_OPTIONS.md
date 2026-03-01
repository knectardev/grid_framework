# WebSocket options for layout ↔ other local app

High-level options for the Golden Layout app to communicate with another local application over WebSockets. No implementation yet—suggestions only.

---

## Why WebSockets

- **Real-time, bidirectional** – Layout or the other app can push updates without polling.
- **Single long-lived connection** – Good for commands, layout sync, or live state.

---

## Possible patterns

### 1. Backend as hub (recommended baseline)

- **FastAPI** exposes a WebSocket endpoint (e.g. `/ws`).
- **Layout frontend** connects to `ws://localhost:8000/ws` (or same origin).
- **Other local app** (e.g. Electron, Python script, another backend) also connects to the same FastAPI WebSocket endpoint.
- Backend forwards messages between clients or applies rules (e.g. “layout events → broadcast to other app”, “other app → update layout config”).
- **Pros:** Single place for auth, routing, and persistence; layout state already lives in backend.  
- **Cons:** All traffic goes through the backend.

### 2. Frontend talks directly to the other app

- **Other app** runs its own WebSocket server (e.g. on `localhost:8765`).
- **Layout frontend** opens a second WebSocket to that server (e.g. `ws://localhost:8765`).
- Layout sends/receives messages (e.g. “open panel X”, “selection changed”) without going through the grid backend.
- **Pros:** Simple if the other app already has a WS server; low latency.  
- **Cons:** CORS/security if the other app is on another origin; frontend must know the other app’s URL/port.

### 3. Other app connects only to backend (no frontend WS)

- **Other app** connects to FastAPI WebSocket.
- **Layout frontend** does not hold a WebSocket; it only uses REST (e.g. GET/PATCH layout).
- Backend pushes to the other app (e.g. “layout saved”) or receives commands and updates layout storage; frontend sees changes on next fetch or page reload.
- **Pros:** Frontend stays REST-only; good if updates are infrequent.  
- **Cons:** Not real-time on the layout UI unless you add polling or a separate WS later.

---

## Tech notes (for later implementation)

- **Backend (FastAPI):** `fastapi.WebSocket`, `await websocket.send_json()` / `receive_json()`, and a way to track multiple clients (e.g. by app type: “layout”, “other_app”) if you use the hub pattern.
- **Frontend:** `new WebSocket(url)`, `onmessage` / `send()`; use the same host as the Vite proxy (e.g. `ws://localhost:5173/ws` proxied to backend) to avoid cross-origin issues in dev.
- **Other local app:** Any stack that can open a WebSocket client or run a WebSocket server (e.g. Python `websockets`, Node, Electron).

---

## Suggested next step

- Decide who initiates and who listens (layout ↔ other app).
- Then choose one of the patterns above and add a single WebSocket endpoint (backend or other app) and one message type (e.g. “layout.updated” or “command.openPanel”) as a minimal proof of concept.
