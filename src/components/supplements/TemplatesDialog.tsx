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

  const groups: { kind: Template["kind"]; label: string; empty?: string }[] = [
    { kind: "stack", label: "Starter" },
    { kind: "saved", label: "Saved", empty: "Templates you save from your cart show up here." },
    { kind: "checkout", label: "Recent checkouts", empty: "Carts you send to Swanson show up here, so you can reorder." },
  ];

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

        <div className="px-5 py-4 space-y-6">
          {cartCount > 0 && (
            <form
              className="space-y-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                onSave(name);
                setName("");
              }}
            >
              <label htmlFor="template-name" className="eyebrow block">
                Save current cart ({cartCount} {cartCount === 1 ? "item" : "items"})
              </label>
              <div className="flex gap-2">
                <input
                  id="template-name"
                  className="field"
                  placeholder="e.g. Sleep stack"
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary shrink-0 focus-ring" disabled={!name.trim()}>
                  Save
                </button>
              </div>
            </form>
          )}

          {groups.map((g) => {
            const list = templates.filter((t) => t.kind === g.kind);
            if (!list.length && !g.empty) return null;
            return (
              <section key={g.kind} aria-labelledby={`tpl-${g.kind}`}>
                <h3 id={`tpl-${g.kind}`} className="eyebrow mb-2">{g.label}</h3>
                {list.length ? (
                  <ul className="space-y-2">
                    {list.map((t) => (
                      <TemplateRow key={t.id} template={t} prices={prices} onLoad={onLoad} onDelete={onDelete} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-muted">{g.empty}</p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}

function TemplateRow({ template: t, prices, onLoad, onDelete }: {
  template: Template;
  prices: Record<number, number>;
  onLoad: (t: Template) => void;
  onDelete: (t: Template) => void;
}) {
  const [copied, setCopied] = useState(false);
  const count = t.items.reduce((n, [, qty]) => n + qty, 0);
  const total = t.items.reduce((sum, [id, qty]) => sum + (prices[id] ?? 0) * qty, 0);
  const allPriced = t.items.every(([id]) => prices[id]);
  const names = t.items
    .map(([id, qty]) => {
      const s = getSupplementById(id);
      return s ? (qty > 1 ? `${s.name} ×${qty}` : s.name) : null;
    })
    .filter(Boolean)
    .join(", ");
  const title = t.kind === "checkout" ? `Checkout · ${formatDate(t.date)}` : t.name;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(templateLink(t));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — nothing useful to show */ }
  };

  return (
    <li className="rounded-[var(--radius-md)] border border-surface-border bg-surface-900/40 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-ink-muted">
            {count} {count === 1 ? "item" : "items"}
            {total > 0 && <span className="font-mono font-tabular"> · {formatPrice(total)}{!allPriced && "+"}</span>}
            {t.kind === "saved" && t.date && <> · saved {formatDate(t.date)}</>}
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm shrink-0 focus-ring" onClick={() => onLoad(t)}>
          Load
        </button>
      </div>
      {t.description && <p className="mt-2 text-xs text-ink-soft">{t.description}</p>}
      <p className="mt-1.5 text-xs text-ink-muted line-clamp-2">{names}</p>
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
