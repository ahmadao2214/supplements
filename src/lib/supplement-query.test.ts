import { describe, expect, test } from "bun:test";
import { supplements } from "../data/supplements";
import { filterSupplements, resolveSupplement, sortSupplements } from "./supplement-query";

const names = (list: { name: string }[]) => list.map((s) => s.name);

describe("filterSupplements", () => {
  test("no criteria returns everything", () => {
    expect(filterSupplements({})).toHaveLength(supplements.length);
  });

  test("'All' is treated as no filter", () => {
    expect(filterSupplements({ tier: "All", adderall: "All", time: "All" })).toHaveLength(supplements.length);
  });

  test("tier filter", () => {
    const core = filterSupplements({ tier: "1" });
    expect(core.length).toBeGreaterThan(0);
    expect(core.every((s) => s.tier === 1)).toBe(true);
  });

  test("SAM-e is Caution, not Avoid ('monoamine' contains 'no')", () => {
    expect(names(filterSupplements({ adderall: "Caution" }))).toContain("SAM-e");
    expect(names(filterSupplements({ adderall: "Avoid" }))).not.toContain("SAM-e");
  });

  test("Adderall buckets cover every supplement exactly once", () => {
    const counts = ["Safe", "Caution", "Avoid"].map((a) => filterSupplements({ adderall: a }).length);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(supplements.length);
  });

  test("search matches across text fields, case-insensitively", () => {
    expect(names(filterSupplements({ search: "MAGNESIUM" }))).toContain("Magnesium");
  });

  test("criteria combine with AND", () => {
    const result = filterSupplements({ tier: "1", condition: "Sleep" });
    expect(result.every((s) => s.tier === 1 && s.treats.includes("Sleep"))).toBe(true);
  });
});

describe("sortSupplements", () => {
  test("sorts without mutating input", () => {
    const input = supplements.slice(0, 5);
    const before = names(input);
    const sorted = sortSupplements(input, "name", "desc");
    expect(names(input)).toEqual(before);
    expect(names(sorted)).toEqual([...before].sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase())));
  });
});

describe("resolveSupplement", () => {
  const resolvedName = (input: string | number) => {
    const r = resolveSupplement(input);
    return r.ok ? r.supplement.name : null;
  };

  test("by id, slug and exact name", () => {
    expect(resolvedName(1)).toBe("Omega-3");
    expect(resolvedName("magnesium-l-threonate")).toBe("Magnesium");
    expect(resolvedName("Zinc")).toBe("Zinc");
  });

  test("ignores punctuation and spacing", () => {
    expect(resolvedName("lions mane")).toBe("Lion's Mane");
    expect(resolvedName("vitamin k2")).toBe("Vitamin K2");
  });

  test("unknown names return a helpful error", () => {
    const r = resolveSupplement("unobtainium");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("No supplement");
  });

  test("ambiguous names return candidates", () => {
    const r = resolveSupplement("vitamin");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.candidates.length).toBeGreaterThan(1);
  });
});
