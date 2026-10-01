// Pure query helpers shared by the table UI and agent tools — no React, no DOM

import { supplements, type Supplement } from "../data/supplements";
import { tierLabels } from "./constants";
import { classifyAdderall, getDoseTimes, getAdderallLabel, type DoseTime } from "./format-utils";

/** Filter values as the UI stores them; "All" (or omitted) means no filter. */
export interface FilterCriteria {
  search?: string;
  category?: string;
  condition?: string;
  /** "Safe" | "Caution" | "Avoid" */
  adderall?: string;
  /** "Morning" | "Evening" | "Flexible", or free text matched against time of day */
  time?: string;
  /** "1" | "2" | "3" */
  tier?: string;
  schedule?: string;
}

export type SortKey = keyof Supplement;
export type SortDir = "asc" | "desc";

const timeFilterMap: Record<string, DoseTime> = { Morning: "day", Evening: "night", Flexible: "flex" };
const adderallFilterMap = { Safe: "safe", Caution: "caution", Avoid: "avoid" } as const;

const isSet = (v: string | undefined): v is string => !!v && v !== "All";

export function matchesCriteria(s: Supplement, c: FilterCriteria): boolean {
  const q = c.search?.trim().toLowerCase();
  if (q) {
    const haystack = [s.name, s.form, s.treats, s.benefits, s.category, s.tierReason];
    if (!haystack.some((field) => field.toLowerCase().includes(q))) return false;
  }
  if (isSet(c.category) && s.category !== c.category) return false;
  if (isSet(c.condition) && !s.treats.toLowerCase().includes(c.condition.toLowerCase())) return false;
  if (isSet(c.adderall)) {
    const wanted = adderallFilterMap[c.adderall as keyof typeof adderallFilterMap];
    if (wanted && classifyAdderall(s.withAdderall) !== wanted) return false;
  }
  if (isSet(c.time)) {
    const doseTime = timeFilterMap[c.time];
    const ok = doseTime
      ? getDoseTimes(s).includes(doseTime)
      : s.timeOfDay.toLowerCase().includes(c.time.toLowerCase());
    if (!ok) return false;
  }
  if (isSet(c.tier) && s.tier !== Number(c.tier)) return false;
  if (isSet(c.schedule) && s.schedule !== c.schedule) return false;
  return true;
}

export function filterSupplements(criteria: FilterCriteria, list: Supplement[] = supplements): Supplement[] {
  return list.filter((s) => matchesCriteria(s, criteria));
}

export function sortSupplements(list: Supplement[], key: SortKey, dir: SortDir): Supplement[] {
  return [...list].sort((a, b) => {
    const cmp = String(a[key]).toLowerCase().localeCompare(String(b[key]).toLowerCase());
    return dir === "asc" ? cmp : -cmp;
  });
}

// --- Lookup by loose name -----------------------------------------------------

const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

export type ResolveResult =
  | { ok: true; supplement: Supplement }
  | { ok: false; error: string; candidates: string[] };

/**
 * Find one supplement from an id, slug or human-typed name ("lions mane",
 * "Magnesium L-Threonate"). Ambiguous or unknown input returns candidates so
 * the caller can ask again with something more specific.
 */
export function resolveSupplement(input: string | number, list: Supplement[] = supplements): ResolveResult {
  const raw = String(input).trim();
  const byId = /^\d+$/.test(raw) ? list.find((s) => s.id === Number(raw)) : undefined;
  if (byId) return { ok: true, supplement: byId };

  const key = normalize(raw);
  if (!key) return { ok: false, error: "Empty supplement name.", candidates: [] };

  const exact = list.filter(
    (s) => s.slug === raw.toLowerCase() || normalize(s.name) === key || normalize(`${s.name} ${s.form}`) === key
  );
  if (exact.length === 1) return { ok: true, supplement: exact[0] };

  const partial = list.filter(
    (s) => normalize(`${s.name} ${s.form}`).includes(key) || normalize(s.slug).includes(key)
  );
  if (partial.length === 1) return { ok: true, supplement: partial[0] };

  const candidates = (exact.length ? exact : partial).map((s) => s.name);
  return candidates.length
    ? { ok: false, error: `"${raw}" matches more than one supplement.`, candidates }
    : { ok: false, error: `No supplement matches "${raw}".`, candidates: [] };
}

// --- Agent-facing shapes ------------------------------------------------------

export function toSummary(s: Supplement, price?: number) {
  return {
    slug: s.slug,
    name: s.name,
    form: s.form || undefined,
    tier: tierLabels[s.tier],
    category: s.category,
    treats: s.treats,
    dosage: s.dosage,
    frequency: s.frequency,
    timeOfDay: s.timeOfDay,
    withAdderall: { status: getAdderallLabel(classifyAdderall(s.withAdderall)), note: s.withAdderall },
    schedule: s.schedule,
    price,
    page: `/supplement/${s.slug}`,
  };
}

export function toDetails(s: Supplement, price?: number) {
  return {
    ...toSummary(s, price),
    dosageNote: s.dosageNote || undefined,
    withMeals: s.withMeals,
    benefits: s.benefits,
    sideEffects: s.sideEffects,
    notes: s.notes,
    tierReason: s.tierReason,
    purchasable: !!s.purchaseUrl,
  };
}
