import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface Choice {
  value: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  /**
   * Runs inside the click handler, so it still counts as a user gesture —
   * needed for window.open, which browsers block outside one.
   */
  onSelect?: () => void;
}

export interface ChoiceRequest {
  title: string;
  body?: ReactNode;
  choices: Choice[];
  /** Marks the request as coming from an AI agent rather than the user's own click */
  fromAgent?: boolean;
  /** Aborting closes the dialog and resolves with null */
  signal?: AbortSignal;
}

interface Pending {
  id: number;
  request: ChoiceRequest;
  resolve: (value: string | null) => void;
}

let nextId = 0;

/**
 * Promise-based modal. `ask()` resolves with the chosen value, or null when
 * dismissed. Requests made while one is open wait their turn.
 */
export function useChoiceDialog() {
  const [queue, setQueue] = useState<Pending[]>([]);

  const settle = useCallback((pending: Pending, value: string | null) => {
    pending.resolve(value);
    setQueue((q) => q.filter((p) => p !== pending));
  }, []);

  const ask = useCallback((request: ChoiceRequest) => {
    return new Promise<string | null>((resolve) => {
      if (request.signal?.aborted) return resolve(null);
      const pending: Pending = { id: ++nextId, request, resolve };
      request.signal?.addEventListener("abort", () => settle(pending, null), { once: true });
      setQueue((q) => [...q, pending]);
    });
  }, [settle]);

  const current = queue[0];
  const dialog = current ? <ChoiceDialog key={current.id} pending={current} onSettle={settle} /> : null;

  return { ask, dialog };
}

function ChoiceDialog({ pending, onSettle }: { pending: Pending; onSettle: (p: Pending, v: string | null) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { title, body, choices, fromAgent } = pending.request;

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    // Agent requests start on the first button (decline), so a stray Enter can't approve them
    if (!fromAgent) el?.querySelector<HTMLElement>("[data-default]")?.focus();
    return () => el?.close();
  }, [fromAgent]);

  const variantClass = { primary: "btn-primary", secondary: "btn-secondary", ghost: "btn-ghost" };

  return (
    <dialog
      ref={ref}
      aria-labelledby="choice-title"
      className="m-auto w-[min(28rem,calc(100%-2rem))] p-0 bg-transparent text-ink-soft backdrop:bg-black/60"
      onCancel={(e) => {
        e.preventDefault();
        onSettle(pending, null);
      }}
    >
      <div className="panel p-5 shadow-elevated">
        {fromAgent && (
          <p className="eyebrow mb-2 flex items-center gap-1.5 !text-caution">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-caution" />
            Request from an AI agent
          </p>
        )}
        <h2 id="choice-title" className="font-serif text-lg font-semibold text-ink">{title}</h2>
        {body && <div className="mt-2 text-sm leading-relaxed">{body}</div>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {choices.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`btn btn-sm focus-ring ${variantClass[c.variant ?? "secondary"]}`}
              data-default={c.variant === "primary" || undefined}
              onClick={() => {
                c.onSelect?.();
                onSettle(pending, c.value);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
