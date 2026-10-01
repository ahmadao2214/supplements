import { beforeEach, describe, expect, test } from "bun:test";
import { catalogTools } from "./catalog-tools";
import { createCartTools, type CartToolDeps, type ConfirmRequest } from "./cart-tools";
import { allTemplates, withCheckout, withSaved, withoutSaved, type CartItems, type StoredTemplates } from "../templates";
import type { ModelContextTool } from "./model-context";

type Result = { content: { text: string }[]; isError?: boolean };
const parse = (r: unknown) => {
  const res = r as Result;
  return { data: JSON.parse(res.content[0].text), isError: !!res.isError };
};
const run = async (tools: ModelContextTool[], name: string, input: unknown = {}, signal?: AbortSignal) =>
  parse(await tools.find((t) => t.name === name)!.execute(input, { signal }));

describe("catalog tools", () => {
  test("search by tier and condition", async () => {
    const { data } = await run(catalogTools, "search_supplements", { tier: "core", condition: "Sleep" });
    expect(data.count).toBeGreaterThan(0);
    expect(data.results.every((r: any) => r.tier === "Core" && r.treats.includes("Sleep"))).toBe(true);
  });

  test("invalid enum values return a correctable error", async () => {
    const { data, isError } = await run(catalogTools, "search_supplements", { tier: "Premium" });
    expect(isError).toBe(true);
    expect(data.error).toContain("Core");
  });

  test("details accept names as typed", async () => {
    const { data } = await run(catalogTools, "get_supplement_details", { supplement: "lions mane" });
    expect(data.name).toBe("Lion's Mane");
    expect(data.sideEffects).toBeTruthy();
    expect(data.related.length).toBeGreaterThan(0);
  });

  test("ambiguous names return candidates", async () => {
    const { data, isError } = await run(catalogTools, "get_supplement_details", { supplement: "vitamin" });
    expect(isError).toBe(true);
    expect(data.candidates.length).toBeGreaterThan(1);
  });
});

describe("cart tools", () => {
  let cart: CartItems;
  let stored: StoredTemplates;
  let asked: ConfirmRequest[];
  let answer: (r: ConfirmRequest) => string | null;
  let checkouts: number;
  let notices: string[];
  let tools: ModelContextTool[];

  beforeEach(() => {
    cart = new Map();
    stored = { saved: [], checkouts: [] };
    asked = [];
    answer = () => "allow";
    checkouts = 0;
    notices = [];
    const deps: CartToolDeps = {
      getCart: () => cart,
      setCart: (next) => { cart = next; },
      getPrices: () => ({ 1: 10, 2: 20 }),
      getTemplates: () => allTemplates(stored),
      saveTemplate: (name, c) => {
        stored = withSaved(stored, name, c);
        return stored.saved.find((t) => t.name === name.trim())!;
      },
      deleteTemplate: (id) => { stored = withoutSaved(stored, id); },
      confirm: async (req) => {
        asked.push(req);
        const value = answer(req);
        // A real click runs onSelect for the chosen button
        req.choices.find((c) => c.value === value)?.onSelect?.();
        return value;
      },
      checkout: () => { checkouts++; },
      notify: (m) => notices.push(m),
    };
    tools = createCartTools(deps);
  });

  test("update_cart asks first and shows the change", async () => {
    const { data } = await run(tools, "update_cart", { items: [{ supplement: "magnesium", quantity: 2 }] });
    expect(asked).toHaveLength(1);
    expect(asked[0].lines).toEqual(["Add Magnesium ×2"]);
    expect(data.status).toBe("updated");
    expect(cart.get(2)).toBe(2);
    expect(notices).toHaveLength(1);
  });

  test("declining leaves the cart alone", async () => {
    answer = () => "decline";
    const { data } = await run(tools, "update_cart", { items: [{ supplement: "zinc", quantity: 1 }] });
    expect(data.status).toBe("declined");
    expect(cart.size).toBe(0);
  });

  test("dismissing the dialog (null) also declines", async () => {
    answer = () => null;
    const { data } = await run(tools, "clear_cart");
    expect(data.status).toBe("unchanged"); // empty cart: nothing to ask
    cart = new Map([[1, 1]]);
    expect((await run(tools, "clear_cart")).data.status).toBe("declined");
    expect(cart.size).toBe(1);
  });

  test("unknown supplements fail without asking", async () => {
    const { isError } = await run(tools, "update_cart", { items: [{ supplement: "unobtainium", quantity: 1 }] });
    expect(isError).toBe(true);
    expect(asked).toHaveLength(0);
  });

  test("Main stack loads into an empty cart after approval", async () => {
    const { data } = await run(tools, "apply_template", { template: "main stack" });
    expect(data.status).toBe("updated");
    expect(cart.size).toBe(12);
  });

  test("with items already in the cart and no mode, the user picks replace or add", async () => {
    cart = new Map([[2, 3], [5, 1]]); // Magnesium ×3, Iron
    answer = (r) => {
      expect(r.choices.map((c) => c.value)).toEqual(["decline", "add", "replace"]);
      return "add";
    };
    const { data } = await run(tools, "apply_template", { template: "Main stack" });
    expect(data.mode).toBe("add");
    expect(cart.get(2)).toBe(3); // kept the larger quantity
    expect(cart.get(5)).toBe(1); // kept
    expect(cart.size).toBe(13);
  });

  test("reorder the last checkout", async () => {
    stored = withCheckout(stored, new Map([[1, 2]]));
    cart = new Map([[3, 1]]);
    const { data } = await run(tools, "apply_template", { template: "last checkout", mode: "replace" });
    expect(data.status).toBe("updated");
    expect([...cart]).toEqual([[1, 2]]);
  });

  test("save, then overwrite only after approval", async () => {
    cart = new Map([[1, 1]]);
    await run(tools, "save_cart_as_template", { name: "Sleep" });
    expect(asked).toHaveLength(0); // new name: just saved, with a notice
    expect(notices[0]).toContain("Sleep");

    cart = new Map([[2, 1]]);
    answer = () => "decline";
    expect((await run(tools, "save_cart_as_template", { name: "sleep" })).data.status).toBe("declined");
    expect(stored.saved[0].items).toEqual([[1, 1]]);
  });

  test("starter stack can't be deleted", async () => {
    const { isError } = await run(tools, "delete_template", { template: "Main stack" });
    expect(isError).toBe(true);
  });

  test("checkout opens only when the user clicks the button", async () => {
    cart = new Map([[1, 1], [2, 1]]);
    answer = () => "decline";
    expect((await run(tools, "prepare_checkout")).data.status).toBe("declined");
    expect(checkouts).toBe(0);

    answer = () => "open";
    const { data } = await run(tools, "prepare_checkout");
    expect(data.status).toBe("opened");
    expect(checkouts).toBe(1);
    expect(asked[1].note).toContain("$30.00");
  });

  test("get_cart reports prices and subtotal", async () => {
    cart = new Map([[1, 2], [3, 1]]);
    const { data } = await run(tools, "get_cart");
    expect(data.itemCount).toBe(3);
    expect(data.subtotal).toBe(20);
    expect(data.subtotalComplete).toBe(false); // id 3 has no price
  });
});
