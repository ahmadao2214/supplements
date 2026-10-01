// Cart and template tools. Anything that changes the cart or saved templates
// waits for the user to approve it in the page; checkout only happens when the
// user clicks the button themselves.

import { supplementMap } from "../supplement-utils";
import { resolveSupplement } from "../supplement-query";
import { formatPrice } from "../format-utils";
import { applyTemplate, diffCart, type ApplyMode, type CartItems, type Template } from "../templates";
import { fail, ok, type ModelContextTool } from "./model-context";

export interface ConfirmChoice {
  value: string;
  label: string;
  primary?: boolean;
  /** Runs inside the user's click (needed for window.open) */
  onSelect?: () => void;
}

export interface ConfirmRequest {
  title: string;
  lines?: string[];
  note?: string;
  choices: ConfirmChoice[];
  signal?: AbortSignal;
}

export interface CartToolDeps {
  getCart(): CartItems;
  setCart(next: CartItems): void;
  getPrices(): Record<number, number>;
  getTemplates(): Template[];
  saveTemplate(name: string, cart: CartItems): Template;
  deleteTemplate(id: string): void;
  /** Shows an in-page dialog; resolves with the chosen value or null if dismissed */
  confirm(request: ConfirmRequest): Promise<string | null>;
  /** Opens the Swanson cart and records the checkout; only called from a user click */
  checkout(): void;
  notify(message: string): void;
}

const DECLINED = {
  status: "declined",
  message: "The user declined in the page. Don't retry unless they ask again.",
};

const nameOf = (id: number) => supplementMap.get(id)?.name ?? `#${id}`;
const itemLine = ([id, qty]: [number, number]) => (qty > 1 ? `${nameOf(id)} ×${qty}` : nameOf(id));

function changeLines(before: CartItems, after: CartItems): string[] {
  return diffCart(before, after).map(({ id, from, to }) =>
    from === 0 ? `Add ${itemLine([id, to])}` : to === 0 ? `Remove ${nameOf(id)}` : `${nameOf(id)}: ${from} → ${to}`
  );
}

function cartSnapshot(cart: CartItems, prices: Record<number, number>) {
  let subtotal = 0;
  let allPriced = true;
  const items = [...cart].map(([id, quantity]) => {
    const s = supplementMap.get(id);
    const price = prices[id];
    if (price) subtotal += price * quantity;
    else allPriced = false;
    return { name: s?.name, form: s?.form || undefined, slug: s?.slug, quantity, price, lineTotal: price ? +(price * quantity).toFixed(2) : undefined };
  });
  return {
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: +subtotal.toFixed(2),
    subtotalComplete: allPriced,
  };
}

const templateTypeLabel = { stack: "starter", saved: "saved", checkout: "recent checkout" } as const;

function displayName(t: Template) {
  return t.kind === "checkout" && t.date ? `Checkout on ${t.date.slice(0, 10)}` : t.name;
}

const LAST_CHECKOUT = /^(last|latest|most recent|previous)\s+(checkout|order|purchase)$/;

function findTemplate(templates: Template[], input: unknown): { template: Template } | { error: string } {
  const raw = String(input ?? "").trim();
  if (!raw) return { error: "Provide a template name or id (see list_templates)." };
  const key = raw.toLowerCase();
  const byId = templates.find((t) => t.id === raw);
  if (byId) return { template: byId };
  if (LAST_CHECKOUT.test(key)) {
    const last = templates.find((t) => t.kind === "checkout");
    return last ? { template: last } : { error: "There are no recent checkouts on this device yet." };
  }
  const named = templates.filter((t) => t.kind !== "checkout" && t.name.toLowerCase() === key);
  if (named.length === 1) return { template: named[0] };
  const partial = templates.filter((t) => displayName(t).toLowerCase().includes(key));
  if (partial.length === 1) return { template: partial[0] };
  return { error: `No single template matches "${raw}". Available: ${templates.map((t) => `${displayName(t)} (${t.id})`).join(", ")}` };
}

const allowChoices: ConfirmChoice[] = [
  { value: "decline", label: "Decline" },
  { value: "allow", label: "Allow", primary: true },
];

export function createCartTools(deps: CartToolDeps): ModelContextTool[] {
  const snapshot = () => cartSnapshot(deps.getCart(), deps.getPrices());

  /** Ask, then apply `change` to whatever the cart is at approval time. */
  async function confirmCartChange(
    title: string,
    change: (cart: CartItems) => CartItems,
    signal?: AbortSignal,
    note?: string
  ) {
    const preview = change(deps.getCart());
    const lines = changeLines(deps.getCart(), preview);
    if (!lines.length) return ok({ status: "unchanged", message: "The cart already matches.", cart: snapshot() });
    const choice = await deps.confirm({ title, lines, note, choices: allowChoices, signal });
    if (choice !== "allow") return ok(DECLINED);
    deps.setCart(change(deps.getCart()));
    deps.notify("Cart updated at an AI agent's request");
    return ok({ status: "updated", changes: lines, cart: snapshot() });
  }

  const getCart: ModelContextTool = {
    name: "get_cart",
    title: "Get cart",
    description: "Returns the supplements in the user's cart with quantities, prices and subtotal.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute: () => ok(snapshot()),
  };

  const updateCart: ModelContextTool = {
    name: "update_cart",
    title: "Update cart",
    description:
      "Sets the quantity of one or more supplements in the cart. Quantity 0 removes an item; items not listed stay as they are. " +
      "The user approves the change in the page before it applies.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              supplement: { type: "string", description: "Supplement name or slug" },
              quantity: { type: "integer", minimum: 0, maximum: 20, description: "New quantity; 0 removes it" },
            },
            required: ["supplement", "quantity"],
          },
        },
      },
      required: ["items"],
    },
    async execute(input: { items?: { supplement: string; quantity: number }[] } = {}, options) {
      if (!Array.isArray(input.items) || !input.items.length) return fail("Provide at least one item.");
      const sets: [number, number][] = [];
      const problems: string[] = [];
      for (const item of input.items) {
        const r = resolveSupplement(item?.supplement ?? "");
        const qty = Number(item?.quantity);
        if (!r.ok) problems.push(r.candidates.length ? `${r.error} Did you mean: ${r.candidates.join(", ")}?` : r.error);
        else if (!r.supplement.purchaseUrl) problems.push(`${r.supplement.name} can't be bought through this site.`);
        else if (!Number.isInteger(qty) || qty < 0 || qty > 20) problems.push(`Quantity for ${r.supplement.name} must be a whole number from 0 to 20.`);
        else sets.push([r.supplement.id, qty]);
      }
      if (problems.length) return fail(problems.join(" "));
      return confirmCartChange("Update your cart?", (cart) => {
        const next = new Map(cart);
        for (const [id, qty] of sets) qty === 0 ? next.delete(id) : next.set(id, qty);
        return next;
      }, options?.signal);
    },
  };

  const clearCart: ModelContextTool = {
    name: "clear_cart",
    title: "Clear cart",
    description: "Removes everything from the cart. The user approves it in the page first.",
    inputSchema: { type: "object", properties: {} },
    execute: (_input, options) => confirmCartChange("Empty your cart?", () => new Map(), options?.signal),
  };

  const listTemplates: ModelContextTool = {
    name: "list_templates",
    title: "List templates",
    description:
      "Lists cart templates: the built-in starter stack, templates the user saved, and their recent checkouts " +
      "(carts sent to Swanson from this device, newest first — use these to reorder).",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute() {
      const prices = deps.getPrices();
      return ok({
        templates: deps.getTemplates().map((t) => {
          const snap = cartSnapshot(new Map(t.items), prices);
          return {
            id: t.id,
            name: displayName(t),
            type: templateTypeLabel[t.kind],
            description: t.description,
            date: t.date,
            items: snap.items.map((i) => ({ name: i.name, quantity: i.quantity })),
            itemCount: snap.itemCount,
            total: snap.subtotal,
          };
        }),
      });
    },
  };

  const applyTemplateTool: ModelContextTool = {
    name: "apply_template",
    title: "Load template into cart",
    description:
      "Loads a template into the cart. mode \"replace\" swaps the cart for the template; \"add\" adds what's missing and keeps " +
      "the larger quantity for items already in the cart. Leave mode out to let the user choose. Use \"last checkout\" to reorder. " +
      "The user approves in the page first.",
    inputSchema: {
      type: "object",
      properties: {
        template: { type: "string", description: "Template name or id from list_templates, or \"last checkout\"" },
        mode: { type: "string", enum: ["replace", "add"] },
      },
      required: ["template"],
    },
    async execute(input: { template?: string; mode?: string } = {}, options) {
      const found = findTemplate(deps.getTemplates(), input.template);
      if ("error" in found) return fail(found.error);
      const t = found.template;
      if (input.mode !== undefined && input.mode !== "replace" && input.mode !== "add") {
        return fail('mode must be "replace" or "add".');
      }
      const title = `Load ${displayName(t)} into your cart?`;
      const cartSize = deps.getCart().size;

      // An empty cart has nothing to replace, and a given mode leaves nothing to choose
      if (cartSize === 0 || input.mode) {
        const mode = (input.mode ?? "replace") as ApplyMode;
        return confirmCartChange(title, (cart) => applyTemplate(cart, t.items, mode), options?.signal);
      }

      const choice = await deps.confirm({
        title,
        lines: t.items.map(itemLine),
        note: `Your cart already has ${cartSize} ${cartSize === 1 ? "supplement" : "supplements"}. Adding keeps the larger quantity, so nothing doubles up.`,
        choices: [
          { value: "decline", label: "Decline" },
          { value: "add", label: "Add to cart" },
          { value: "replace", label: "Replace cart", primary: true },
        ],
        signal: options?.signal,
      });
      if (choice !== "add" && choice !== "replace") return ok(DECLINED);
      const before = deps.getCart();
      const after = applyTemplate(before, t.items, choice);
      deps.setCart(after);
      deps.notify(`${choice === "add" ? "Added" : "Loaded"} ${displayName(t)} at an AI agent's request`);
      return ok({ status: "updated", mode: choice, changes: changeLines(before, after), cart: snapshot() });
    },
  };

  const saveCartAsTemplate: ModelContextTool = {
    name: "save_cart_as_template",
    title: "Save cart as template",
    description:
      "Saves the current cart as a named template on this device so it can be loaded later. " +
      "Saving under an existing template's name replaces it, after the user approves.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", maxLength: 60, description: "Template name, e.g. \"Sleep stack\"" } },
      required: ["name"],
    },
    async execute(input: { name?: string } = {}, options) {
      const name = String(input.name ?? "").trim().slice(0, 60);
      if (!name) return fail("Provide a template name.");
      const cart = deps.getCart();
      if (!cart.size) return fail("The cart is empty, so there is nothing to save.");
      const existing = deps.getTemplates().find((t) => t.kind === "saved" && t.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        const choice = await deps.confirm({
          title: `Replace your saved template "${existing.name}"?`,
          lines: [...cart].map(itemLine),
          note: "The template will be overwritten with the current cart.",
          choices: allowChoices,
          signal: options?.signal,
        });
        if (choice !== "allow") return ok(DECLINED);
      }
      const saved = deps.saveTemplate(name, cart);
      deps.notify(`Saved "${saved.name}" at an AI agent's request`);
      return ok({ status: "saved", template: { id: saved.id, name: saved.name, items: saved.items.map(itemLine) } });
    },
  };

  const deleteTemplateTool: ModelContextTool = {
    name: "delete_template",
    title: "Delete template",
    description: "Deletes a template the user saved. The starter stack and recent checkouts can't be deleted. The user approves first.",
    inputSchema: {
      type: "object",
      properties: { template: { type: "string", description: "Saved template name or id" } },
      required: ["template"],
    },
    async execute(input: { template?: string } = {}, options) {
      const found = findTemplate(deps.getTemplates(), input.template);
      if ("error" in found) return fail(found.error);
      const t = found.template;
      if (t.kind !== "saved") return fail(`${displayName(t)} is a ${templateTypeLabel[t.kind]} template and can't be deleted.`);
      const choice = await deps.confirm({ title: `Delete your saved template "${t.name}"?`, lines: t.items.map(itemLine), choices: allowChoices, signal: options?.signal });
      if (choice !== "allow") return ok(DECLINED);
      deps.deleteTemplate(t.id);
      deps.notify(`Deleted "${t.name}" at an AI agent's request`);
      return ok({ status: "deleted", name: t.name });
    },
  };

  const prepareCheckout: ModelContextTool = {
    name: "prepare_checkout",
    title: "Prepare checkout",
    description:
      "Shows the user a checkout summary with a button that opens their cart on swansonvitamins.com. " +
      "Only the user can press it; payment happens on Swanson's site. Resolves once they choose.",
    inputSchema: { type: "object", properties: {} },
    async execute(_input, options) {
      const cart = deps.getCart();
      if (!cart.size) return fail("The cart is empty.");
      const snap = snapshot();
      const choice = await deps.confirm({
        title: "Ready to check out?",
        lines: [...cart].map(itemLine),
        note: `Subtotal ${formatPrice(snap.subtotal)}${snap.subtotalComplete ? "" : "+"}. Opens your cart on swansonvitamins.com in a new tab; you review and pay there.`,
        choices: [
          { value: "decline", label: "Not now" },
          { value: "open", label: "Open Swanson cart", primary: true, onSelect: deps.checkout },
        ],
        signal: options?.signal,
      });
      if (choice !== "open") return ok(DECLINED);
      return ok({ status: "opened", message: "The user opened their Swanson cart in a new tab. Payment happens there.", cart: snap });
    },
  };

  return [getCart, updateCart, clearCart, listTemplates, applyTemplateTool, saveCartAsTemplate, deleteTemplateTool, prepareCheckout];
}
