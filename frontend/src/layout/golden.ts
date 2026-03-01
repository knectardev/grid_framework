/**
 * Golden Layout initialization. No custom layout math; layout engine is Golden Layout only.
 * Components are decoupled: they only render content, layout logic lives here and in history/sync.
 */
import {
  GoldenLayout,
  LayoutConfig,
  type ComponentContainer,
  type JsonValue,
  type ResolvedLayoutConfig,
} from "golden-layout";
import "golden-layout/dist/css/goldenlayout-base.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

const LAYOUT_CONTAINER_ID = "app";

/** Default config when no layout exists: row with Explorer, Editor, Inspector, Output. */
export function getDefaultLayoutConfig(): LayoutConfig {
  return {
    root: {
      type: "row",
      content: [
        {
          type: "component",
          componentType: "Explorer",
          id: "explorer",
        },
        {
          type: "component",
          componentType: "Editor",
          id: "editor",
        },
        {
          type: "component",
          componentType: "Inspector",
          id: "inspector",
        },
        {
          type: "component",
          componentType: "Output",
          id: "output",
        },
      ],
    },
  };
}

/** Create demo panel element; components remain decoupled from layout. */
function createPanelContent(componentType: string): HTMLElement {
  const el = document.createElement("div");
  el.className = `panel-${componentType.toLowerCase()}`;
  if (componentType === "Explorer") {
    el.textContent = "Explorer — file tree placeholder";
  } else if (componentType === "Editor") {
    el.textContent = "Editor — document placeholder";
  } else if (componentType === "Inspector") {
    el.textContent = "Inspector — properties placeholder";
  } else {
    el.textContent = "Output — console placeholder";
  }
  return el;
}

/** Instance type for layout (avoids package class/namespace merge issues). */
export interface GoldenLayoutInstance {
  saveLayout(): ResolvedLayoutConfig;
  loadLayout(config: LayoutConfig): void;
  destroy(): void;
  on(event: string, handler: () => void): void;
}

/** Build and return Golden Layout instance: register components, load config, mount. */
export function createGoldenLayout(
  initialConfig: LayoutConfig,
  onStateChanged: () => void
): GoldenLayoutInstance {
  const container = document.getElementById(LAYOUT_CONTAINER_ID);
  if (!container) throw new Error("Layout container #app not found");

  const gl = new GoldenLayout(container);
  const bind = (
    cont: ComponentContainer,
    _state: JsonValue | undefined,
    _virtual: boolean,
    componentType: string
  ) => {
    cont.element.appendChild(createPanelContent(componentType));
    return undefined;
  };
  gl.registerComponentFactoryFunction(
    "Explorer",
    (c: ComponentContainer, s: JsonValue | undefined, v: boolean) => bind(c, s, v, "Explorer")
  );
  gl.registerComponentFactoryFunction(
    "Editor",
    (c: ComponentContainer, s: JsonValue | undefined, v: boolean) => bind(c, s, v, "Editor")
  );
  gl.registerComponentFactoryFunction(
    "Inspector",
    (c: ComponentContainer, s: JsonValue | undefined, v: boolean) => bind(c, s, v, "Inspector")
  );
  gl.registerComponentFactoryFunction(
    "Output",
    (c: ComponentContainer, s: JsonValue | undefined, v: boolean) => bind(c, s, v, "Output")
  );

  gl.on("stateChanged", () => onStateChanged());

  gl.loadLayout(initialConfig);
  return gl as unknown as GoldenLayoutInstance;
}

/** Serialize current layout for persistence and undo stack. Uses Resolved Config for determinism. */
export function saveLayoutSnapshot(gl: GoldenLayoutInstance): ResolvedLayoutConfig {
  return gl.saveLayout();
}

/** Convert saved (resolved) config back to Config for loadLayout, per Golden Layout v2 docs. */
export function resolvedToConfig(resolved: ResolvedLayoutConfig): LayoutConfig {
  return LayoutConfig.fromResolved(resolved) as LayoutConfig;
}
