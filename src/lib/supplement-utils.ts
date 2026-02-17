import { supplements, type Supplement } from "../data/supplements";

// Pre-computed Map for O(1) lookups
export const supplementMap = new Map<number, Supplement>(
  supplements.map(s => [s.id, s])
);

export const supplementBySlug = new Map<string, Supplement>(
  supplements.map(s => [s.slug, s])
);

export function getSupplementBySlug(slug: string): Supplement | undefined {
  return supplementBySlug.get(slug);
}

export function getRelatedSupplements(supp: Supplement, limit = 4): Supplement[] {
  const related: Supplement[] = [];
  const treatsSet = new Set(supp.treats.split(",").map(t => t.trim().toLowerCase()));

  for (const s of supplements) {
    if (s.id === supp.id) continue;
    const sTreats = s.treats.split(",").map(t => t.trim().toLowerCase());
    const shared = sTreats.filter(t => treatsSet.has(t)).length;
    if (shared > 0 || s.category === supp.category) {
      related.push(s);
    }
    if (related.length >= limit) break;
  }
  return related;
}
