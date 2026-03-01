/**
 * Backend communication. Frontend renders strictly from backend layout state;
 * persist after changes and sync on undo/redo.
 */

const LAYOUT_NAME = "default";
const API_BASE = "/layout";

export interface LayoutPayload {
  name: string;
  config: object;
  version: number;
}

/** Fetch layout config from backend. Returns null if 404. */
export async function fetchLayout(): Promise<LayoutPayload | null> {
  const res = await fetch(`${API_BASE}/${LAYOUT_NAME}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch layout: ${res.status}`);
  return res.json() as Promise<LayoutPayload>;
}

/** Persist layout config to backend (POST/PATCH). Returns saved payload. */
export async function persistLayout(config: object, version: number): Promise<LayoutPayload> {
  const body: LayoutPayload = { name: LAYOUT_NAME, config, version };
  const res = await fetch(`${API_BASE}/${LAYOUT_NAME}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 404) {
    const createRes = await fetch(`${API_BASE}/${LAYOUT_NAME}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) throw new Error(`Failed to create layout: ${createRes.status}`);
    return createRes.json() as Promise<LayoutPayload>;
  }
  if (!res.ok) throw new Error(`Failed to persist layout: ${res.status}`);
  return res.json() as Promise<LayoutPayload>;
}
