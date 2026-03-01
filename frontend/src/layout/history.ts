/**
 * Application-level undo/redo using layout JSON snapshots (max 50 states).
 * Undo/redo: pop snapshot, destroy current layout, reinit from config, sync backend.
 */

const MAX_HISTORY = 50;

export interface HistoryState {
  /** Resolved layout config snapshot (serializable). */
  config: object;
}

export function createHistory() {
  let undoStack: HistoryState[] = [];
  let redoStack: HistoryState[] = [];

  function push(config: object): void {
    undoStack.push({ config: JSON.parse(JSON.stringify(config)) });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
  }

  function canUndo(): boolean {
    return undoStack.length > 1;
  }

  function canRedo(): boolean {
    return redoStack.length > 0;
  }

  /** Pop previous snapshot for undo. Returns undefined if nothing to undo. */
  function undo(): HistoryState | undefined {
    if (!canUndo()) return undefined;
    redoStack.push(undoStack.pop()!);
    return undoStack[undoStack.length - 1];
  }

  /** Pop redo stack for redo. Returns undefined if nothing to redo. */
  function redo(): HistoryState | undefined {
    if (!canRedo()) return undefined;
    const state = redoStack.pop()!;
    undoStack.push(state);
    return state;
  }

  /** Replace entire undo stack with a single state (e.g. after load or undo/redo apply). */
  function replaceTop(config: object): void {
    undoStack = [{ config: JSON.parse(JSON.stringify(config)) }];
    redoStack.length = 0;
  }

  return { push, undo, redo, canUndo, canRedo, replaceTop };
}

export type History = ReturnType<typeof createHistory>;
