// Minimal WebMCP typings and registration helpers.
// Spec: https://webmachinelearning.github.io/webmcp/ (Draft CG Report, Sept 2026).
// The API is still changing, so everything here degrades to a no-op when absent.

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  consequentialHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: any, options?: { signal?: AbortSignal }) => unknown | Promise<unknown>;
  annotations?: ToolAnnotations;
}

interface ModelContext {
  registerTool(tool: ModelContextTool, options?: { signal?: AbortSignal }): unknown;
  /** Early Chrome previews only; current spec unregisters via AbortSignal */
  unregisterTool?(name: string): unknown;
}

/**
 * `document.modelContext` is current (spec moved it from Navigator in May 2026);
 * `navigator.modelContext` is the deprecated name older Chrome builds still use.
 */
export function getModelContext(): ModelContext | undefined {
  if (typeof document === "undefined") return undefined;
  const fromDocument = (document as any).modelContext as ModelContext | undefined;
  if (fromDocument) return fromDocument;
  return (navigator as any).modelContext as ModelContext | undefined;
}

/** Register tools until `signal` aborts. Does nothing in browsers without WebMCP. */
export function registerTools(tools: ModelContextTool[], signal: AbortSignal) {
  const mc = getModelContext();
  if (!mc || signal.aborted) return;
  for (const tool of tools) {
    try {
      // registerTool returns a promise in the current spec and nothing in older builds
      Promise.resolve(mc.registerTool(tool, { signal })).catch((e) => warn(tool.name, e));
    } catch (e) {
      warn(tool.name, e);
      continue;
    }
    // Builds that ignore the signal still need an explicit unregister
    signal.addEventListener("abort", () => {
      try { mc.unregisterTool?.(tool.name); } catch { /* already gone */ }
    }, { once: true });
  }
}

function warn(name: string, e: unknown) {
  console.warn(`[webmcp] could not register ${name}:`, e);
}

// --- Tool results -------------------------------------------------------------
// MCP-style content works with browser implementations (which serialize the
// return value) and with MCP bridge extensions (which expect this shape).

export function ok(data: unknown) {
  return { content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data) }] };
}

export function fail(message: string, extra?: Record<string, unknown>) {
  return { content: [{ type: "text", text: JSON.stringify({ error: message, ...extra }) }], isError: true };
}
