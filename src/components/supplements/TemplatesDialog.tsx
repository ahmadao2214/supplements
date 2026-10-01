import { useEffect, useRef, useState } from "react";
import { getSupplementById, serializeCart } from "../../lib/cart-utils";
import { formatPrice } from "../../lib/format-utils";
import type { Template } from "../../lib/templates";

interface TemplatesDialogProps {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  cartCount: number;
  prices: Record<number, number>;
  onLoad: (t: Template) => void;
  onSave: (name: string) => void;
  onDelete: (t: Template) => void;
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

export function templateLink(t: Template): string {
  return `${window.location.origin}/?cart=${serializeCart(new Map(t.items))}`;
}

export function TemplatesDialog({ open, onClose, templates, cartCount, prices, onLoad, onSave, onDelete }: TemplatesDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const single = templates.length === 1;

  return (
    <dialog
      ref={ref}
      aria-labelledby="templates-title"
      className="m-auto w-[min(34rem,calc(100%-2rem))] max-h-[85dvh] p-0 bg-transparent text-ink-soft backdrop:bg-black/60"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="panel shadow-elevated">
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-surface-border">
          <h2 id="templates-title" className="font-serif text-xl font-semibold text-ink">Templates</h2>
          <button type="button" className="btn btn-ghost btn-sm focus-ring -mr-2" onClick={onClose} aria-label="Close templates">
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <form
            className="space-y-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || cartCount === 0) return;
              onSave(name);
              setName("");
            }}
          >
            <label htmlFor="template-name" className="eyebrow block">New template</label>
            <div className="flex gap-2">
              <input
                id="template-name"
                className="field disabled:opacity-60"
                placeholder={cartCount > 0 ? "Name" : "Cart is empty"}
                value={name}
                maxLength={60}
                disabled={cartCount === 0}
                onChange={(e) => setName(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary shrink-0 focus-ring disabled:opacity-60" disabled={cartCount === 0 || !name.trim()}>
                Save
              </button>
            </div>
          </form>

          <ul className="space-y-2">
            {templates.map((t) => (
              <TemplateRow key={t.id} template={t} prices={prices} expanded={single} onLoad={onLoad} onDelete={onDelete} />
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}

function TemplateRow({ template: t, prices, expanded, onLoad, onDelete }: {
  template: Template;
  prices: Record<number, number>;
  /** Show the item list without a toggle */
  expanded: boolean;
  onLoad: (t: Template) => void;
  onDelete: (t: Template) => void;
}) {
  const [copied, setCopied] = useState(false);
  const count = t.items.reduce((n, [, qty]) => n + qty, 0);
  const total = t.items.reduce((sum, [id, qty]) => sum + (prices[id] ?? 0) * qty, 0);
  const allPriced = t.items.every(([id]) => prices[id]);
  const title = t.kind === "checkout" ? `Checkout · ${formatDate(t.date)}` : t.name;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(templateLink(t));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — nothing useful to show */ }
  };

  const summary = (
    <span className="text-xs text-ink-muted">
      {count} {count === 1 ? "item" : "items"}
      {total > 0 && <span className="font-mono font-tabular"> · {formatPrice(total)}{!allPriced && "+"}</span>}
    </span>
  );

  const itemList = (
    <ul className="mt-2 divide-y divide-surface-border text-sm">
      {t.items.map(([id, qty]) => {
        const s = getSupplementById(id);
        if (!s) return null;
        return (
          <li key={id} className="flex items-baseline justify-between gap-3 py-1.5">
            <span className="min-w-0 text-ink-soft">
              {s.name}
              {s.form && <span className="text-ink-muted"> · {s.form}</span>}
            </span>
            {qty > 1 && <span className="shrink-0 font-tabular text-ink-muted">×{qty}</span>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <li className="rounded-[var(--radius-md)] border border-surface-border bg-surface-900/40 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {expanded && summary}
        </div>
        <button type="button" className="btn btn-secondary btn-sm shrink-0 focus-ring" onClick={() => onLoad(t)}>
          Load
        </button>
      </div>

      {expanded ? itemList : (
        <details className="group">
          <summary className="mt-1 inline-flex items-center gap-1.5 cursor-pointer list-none rounded focus-ring [&::-webkit-details-marker]:hidden">
            {summary}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-muted transition-transform group-open:rotate-180">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          {itemList}
        </details>
      )}

      <div className="mt-2 -ml-2 flex gap-1">
        <button type="button" className="btn btn-ghost btn-sm focus-ring" onClick={copyLink}>
          {copied ? "✓ Link copied" : "Copy link"}
        </button>
        {t.kind === "saved" && (
          <button type="button" className="btn btn-ghost btn-sm focus-ring" onClick={() => onDelete(t)}>
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
