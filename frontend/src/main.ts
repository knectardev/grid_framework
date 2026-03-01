/**
 * Entry: fetch layout from backend, init Golden Layout, history, sync.
 * Undo/redo recreates layout from snapshot and syncs to backend.
 */
import type { LayoutConfig, ResolvedLayoutConfig } from "golden-layout";
import {
  createGoldenLayout,
  getDefaultLayoutConfig,
  saveLayoutSnapshot,
  resolvedToConfig,
} from "./layout/golden";
import { createHistory } from "./layout/history";
import { fetchLayout, persistLayout } from "./layout/sync";

type GoldenLayoutInstance = ReturnType<typeof createGoldenLayout>;
let gl: GoldenLayoutInstance | null = null;
const history = createHistory();
let applyingUndoRedo = false;

function getContainer(): HTMLElement {
  const el = document.getElementById("app");
  if (!el) throw new Error("#app not found");
  return el;
}

function onStateChanged(): void {
  if (applyingUndoRedo || !gl) return;
  const resolved = saveLayoutSnapshot(gl);
  const configObj = resolved as unknown as object;
  history.push(configObj);
  persistLayout(configObj, 0).catch(console.error);
}

async function loadInitialConfig(): Promise<{ config: object; isResolved: boolean }> {
  const saved = await fetchLayout();
  if (!saved?.config) return { config: getDefaultLayoutConfig(), isResolved: false };
  return { config: saved.config, isResolved: true };
}

function initLayout(config: object, isResolved: boolean): void {
  const layoutConfig: LayoutConfig = isResolved
    ? resolvedToConfig(config as ResolvedLayoutConfig)
    : (config as LayoutConfig);
  gl = createGoldenLayout(layoutConfig, onStateChanged);
  const snapshot = saveLayoutSnapshot(gl);
  history.replaceTop(snapshot as unknown as object);
}

function destroyLayout(): void {
  if (!gl) return;
  gl.destroy();
  gl = null;
  const container = getContainer();
  container.innerHTML = "";
}

function applyHistoryState(state: { config: object }): void {
  applyingUndoRedo = true;
  destroyLayout();
  const layoutConfig = resolvedToConfig(state.config as ResolvedLayoutConfig);
  gl = createGoldenLayout(layoutConfig, onStateChanged);
  history.replaceTop(state.config);
  persistLayout(state.config, 0).catch(console.error);
  applyingUndoRedo = false;
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    if (e.shiftKey) {
      const state = history.redo();
      if (state) applyHistoryState(state);
    } else {
      const state = history.undo();
      if (state) applyHistoryState(state);
    }
  }
}

async function main(): Promise<void> {
  const { config, isResolved } = await loadInitialConfig();
  initLayout(config, isResolved);
  document.addEventListener("keydown", onKeyDown);
}

main().catch(console.error);
