import { describe, expect, test } from "bun:test";
import { supplements } from "../data/supplements";
import { stacks, stackItems } from "../data/stacks";
import {
  applyTemplate, diffCart, readStored, writeStored, withSaved, withoutSaved, withCheckout,
  builtInTemplates, MAX_CHECKOUTS, STORAGE_KEY, type StoredTemplates,
} from "./templates";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}
const memory = () => new MemoryStorage() as unknown as Storage;
const empty = (): StoredTemplates => ({ saved: [], checkouts: [] });

describe("Main stack", () => {
  test("is every Core supplement plus the four Add-On picks", () => {
    const main = stacks.find((s) => s.id === "main")!;
    const items = stackItems(main);
    expect(items).toHaveLength(main.slugs.length); // every slug resolves
    const ids = new Set(items.map(([id]) => id));
    for (const s of supplements.filter((s) => s.tier === 1)) expect(ids.has(s.id)).toBe(true);
    const addOns = supplements.filter((s) => ids.has(s.id) && s.tier !== 1).map((s) => s.name).sort();
    expect(addOns).toEqual(["Lion's Mane", "Probiotics", "Saffron", "Vitamin K2"]);
    expect(items.every(([, qty]) => qty === 1)).toBe(true);
  });

  test("is listed as a built-in template", () => {
    expect(builtInTemplates().map((t) => t.name)).toContain("Main stack");
  });
});

describe("applyTemplate", () => {
  const cart = new Map([[1, 1], [2, 3]]);
  const template: [number, number][] = [[2, 1], [3, 2]];

  test("replace swaps the cart", () => {
    expect([...applyTemplate(cart, template, "replace")]).toEqual([[2, 1], [3, 2]]);
  });

  test("add keeps the larger quantity and never doubles up", () => {
    const next = applyTemplate(cart, template, "add");
    expect(next.get(1)).toBe(1); // untouched
    expect(next.get(2)).toBe(3); // cart already had more
    expect(next.get(3)).toBe(2); // added
  });

  test("does not mutate the input cart", () => {
    applyTemplate(cart, template, "replace");
    expect([...cart]).toEqual([[1, 1], [2, 3]]);
  });
});

test("diffCart lists only changed lines", () => {
  const changes = diffCart(new Map([[1, 1], [2, 2]]), new Map([[2, 3], [4, 1]]));
  expect(changes).toEqual([{ id: 1, from: 1, to: 0 }, { id: 2, from: 2, to: 3 }, { id: 4, from: 0, to: 1 }]);
});

describe("saved templates", () => {
  test("save, overwrite by name, delete", () => {
    let s = withSaved(empty(), "Sleep", new Map([[2, 1]]));
    expect(s.saved).toHaveLength(1);
    s = withSaved(s, "  sleep ", new Map([[2, 2], [3, 1]]));
    expect(s.saved).toHaveLength(1);
    expect(s.saved[0].items).toEqual([[2, 2], [3, 1]]);
    s = withoutSaved(s, s.saved[0].id);
    expect(s.saved).toHaveLength(0);
  });

  test("round-trips through storage and drops unknown ids", () => {
    const storage = memory();
    writeStored(withSaved(empty(), "Focus", new Map([[1, 1], [9999, 1]])), storage);
    const back = readStored(storage);
    expect(back.saved[0].name).toBe("Focus");
    expect(back.saved[0].items).toEqual([[1, 1]]);
  });

  test("corrupt storage reads as empty", () => {
    const storage = memory();
    storage.setItem(STORAGE_KEY, "{not json");
    expect(readStored(storage)).toEqual(empty());
  });
});

describe("checkouts", () => {
  test("newest first, capped, repeats collapse", () => {
    let s = empty();
    for (let i = 1; i <= MAX_CHECKOUTS + 2; i++) s = withCheckout(s, new Map([[i, 1]]));
    expect(s.checkouts).toHaveLength(MAX_CHECKOUTS);
    expect(s.checkouts[0].items).toEqual([[MAX_CHECKOUTS + 2, 1]]);

    const later = new Date(Date.now() + 60_000);
    const again = withCheckout(s, new Map([[MAX_CHECKOUTS + 2, 1]]), later);
    expect(again.checkouts).toHaveLength(MAX_CHECKOUTS);
    expect(again.checkouts[0].id).toBe(s.checkouts[0].id);
    expect(again.checkouts[0].date).toBe(later.toISOString());
  });

  test("empty cart is not recorded", () => {
    expect(withCheckout(empty(), new Map()).checkouts).toHaveLength(0);
  });
});
