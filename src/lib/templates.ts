// Cart templates: built-in stacks, user-saved carts and recent checkouts.
// Saved data lives in localStorage on this device only — nothing is sent anywhere.

import { supplements } from "../data/supplements";
import { stacks, stackItems } from "../data/stacks";

export type CartItems = Map<number, number>;
export type TemplateKind = "stack" | "saved" | "checkout";
export type ApplyMode = "replace" | "add";

export interface Template {
  id: string;
  kind: TemplateKind;
  name: string;
  items: [number, number][];
  /** ISO timestamp; saved templates and checkouts only */
  date?: string;
}

export interface StoredTemplates {
  saved: Template[];
  checkouts: Template[];
}

export const STORAGE_KEY = "supplements:templates:v1";
export const MAX_CHECKOUTS = 5;

const purchasable = new Set(supplements.filter((s) => s.purchaseUrl).map((s) => s.id));

/** Drop ids that no longer exist or can't be bought, and nonsense quantities. */
function cleanItems(items: unknown): [number, number][] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((pair) => {
    if (!Array.isArray(pair)) return [];
    const [id, qty] = pair.map(Number);
    return purchasable.has(id) && Number.isInteger(qty) && qty > 0 ? [[id, qty] as [number, number]] : [];
  });
}

function cleanList(list: unknown, kind: TemplateKind): Template[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((t) => {
    if (!t || typeof t.id !== "string" || typeof t.name !== "string") return [];
    const items = cleanItems(t.items);
    return items.length ? [{ id: t.id, kind, name: t.name, items, date: typeof t.date === "string" ? t.date : undefined }] : [];
  });
}

// --- Storage ------------------------------------------------------------------

export function readStored(storage: Storage | undefined = globalThis.localStorage): StoredTemplates {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return { saved: [], checkouts: [] };
    const data = JSON.parse(raw);
    return { saved: cleanList(data.saved, "saved"), checkouts: cleanList(data.checkouts, "checkout") };
  } catch {
    return { saved: [], checkouts: [] };
  }
}

export function writeStored(data: StoredTemplates, storage: Storage | undefined = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked — templates just won't persist */
  }
}

// --- Pure operations ----------------------------------------------------------

export function builtInTemplates(): Template[] {
  return stacks.map((s) => ({ id: `stack:${s.id}`, kind: "stack", name: s.name, items: stackItems(s) }));
}

/** Name for headings and messages, e.g. "Main stack" or "your Sep 30 checkout". */
export function templateLabel(t: Template): string {
  if (t.kind !== "checkout" || !t.date) return `"${t.name}"`;
  const day = new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `your ${day} checkout`;
}

export function allTemplates(stored: StoredTemplates): Template[] {
  return [...builtInTemplates(), ...stored.saved, ...stored.checkouts];
}

const newId = (prefix: string) => `${prefix}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Save the cart under a name; an existing saved template with the same name is overwritten. */
export function withSaved(stored: StoredTemplates, name: string, cart: CartItems, now = new Date()): StoredTemplates {
  const trimmed = name.trim();
  const existing = stored.saved.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  const template: Template = {
    id: existing?.id ?? newId("saved"),
    kind: "saved",
    name: trimmed,
    items: cleanItems([...cart]),
    date: now.toISOString(),
  };
  const saved = existing
    ? stored.saved.map((t) => (t.id === existing.id ? template : t))
    : [...stored.saved, template];
  return { ...stored, saved };
}

export function withoutSaved(stored: StoredTemplates, id: string): StoredTemplates {
  return { ...stored, saved: stored.saved.filter((t) => t.id !== id) };
}

const sameItems = (a: [number, number][], b: [number, number][]) =>
  a.length === b.length && a.every(([id, qty]) => b.some(([id2, qty2]) => id === id2 && qty === qty2));

/** Record a checkout, newest first. Repeating the latest checkout only refreshes its date. */
export function withCheckout(stored: StoredTemplates, cart: CartItems, now = new Date()): StoredTemplates {
  const items = cleanItems([...cart]);
  if (!items.length) return stored;
  const latest = stored.checkouts[0];
  const repeat = !!latest && sameItems(latest.items, items);
  const entry: Template = { id: repeat ? latest.id : newId("checkout"), kind: "checkout", name: "Checkout", items, date: now.toISOString() };
  const rest = repeat ? stored.checkouts.slice(1) : stored.checkouts;
  return { ...stored, checkouts: [entry, ...rest].slice(0, MAX_CHECKOUTS) };
}

/**
 * Replace swaps the cart for the template. Add puts in anything missing and,
 * for items already in the cart, keeps the larger quantity so nothing doubles up.
 */
export function applyTemplate(cart: CartItems, items: [number, number][], mode: ApplyMode): CartItems {
  const next: CartItems = mode === "replace" ? new Map() : new Map(cart);
  for (const [id, qty] of items) next.set(id, Math.max(next.get(id) ?? 0, qty));
  return next;
}

export interface CartChange {
  id: number;
  from: number;
  to: number;
}

/** Line-by-line difference between two carts; unchanged lines are left out. */
export function diffCart(before: CartItems, after: CartItems): CartChange[] {
  const ids = new Set([...before.keys(), ...after.keys()]);
  return [...ids]
    .map((id) => ({ id, from: before.get(id) ?? 0, to: after.get(id) ?? 0 }))
    .filter((c) => c.from !== c.to);
}
