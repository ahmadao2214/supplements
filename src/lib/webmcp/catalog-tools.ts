// Read-only tools over the supplement catalog. Available on every page;
// they never change what the user is looking at.

import { supplements, conditions } from "../../data/supplements";
import { filterSupplements, resolveSupplement, toDetails, toSummary, type FilterCriteria } from "../supplement-query";
import { getRelatedSupplements } from "../supplement-utils";
import { tierLabels } from "../constants";
import { fail, ok, type ModelContextTool } from "./model-context";

const unique = (values: string[]) => [...new Set(values)];
const categories = unique(supplements.map((s) => s.category)).sort();
const schedules = unique(supplements.map((s) => s.schedule));
const tiers = Object.values(tierLabels);

const adderallValues: Record<string, string> = { safe: "Safe", caution: "Caution", avoid: "Avoid" };
const timeValues: Record<string, string> = { morning: "Morning", evening: "Evening", flexible: "Flexible" };

/** Case-insensitive match against allowed values; undefined input means "any". */
function pick(value: unknown, allowed: string[]): { value?: string; error?: string } {
  if (value === undefined || value === null || value === "") return {};
  const match = allowed.find((a) => a.toLowerCase() === String(value).trim().toLowerCase());
  return match ? { value: match } : { error: `"${value}" is not one of: ${allowed.join(", ")}` };
}

export const searchSupplements: ModelContextTool = {
  name: "search_supplements",
  title: "Search supplements",
  description:
    "Searches the site's 40 ADHD supplements and returns the matches with dosage, timing, tier and Adderall compatibility. " +
    "All filters are optional and combine with AND. This only reads data; it does not change the table the user sees.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Free text matched against name, form, conditions treated, benefits and category" },
      condition: { type: "string", enum: conditions, description: "Condition the supplement helps with" },
      tier: { type: "string", enum: tiers, description: "Core = start here, Add-On = strong additions, Optional = situational" },
      adderall: { type: "string", enum: Object.keys(adderallValues), description: "Compatibility with Adderall: safe to combine, use with caution, or avoid / separate doses" },
      timeOfDay: { type: "string", enum: Object.keys(timeValues), description: "When a dose is taken" },
      schedule: { type: "string", enum: schedules },
      category: { type: "string", enum: categories },
      limit: { type: "integer", minimum: 1, maximum: 40, description: "Maximum results (default 40)" },
    },
  },
  annotations: { readOnlyHint: true },
  execute(input: Record<string, unknown> = {}) {
    const checks = {
      condition: pick(input.condition, conditions),
      tier: pick(input.tier, tiers),
      adderall: pick(input.adderall, Object.keys(adderallValues)),
      timeOfDay: pick(input.timeOfDay, Object.keys(timeValues)),
      schedule: pick(input.schedule, schedules),
      category: pick(input.category, categories),
    };
    const errors = Object.entries(checks).flatMap(([k, c]) => (c.error ? [`${k}: ${c.error}`] : []));
    if (errors.length) return fail(errors.join("; "));

    const tierNumber = checks.tier.value && Object.entries(tierLabels).find(([, l]) => l === checks.tier.value)?.[0];
    const criteria: FilterCriteria = {
      search: typeof input.query === "string" ? input.query : undefined,
      condition: checks.condition.value,
      tier: tierNumber,
      adderall: checks.adderall.value && adderallValues[checks.adderall.value],
      time: checks.timeOfDay.value && timeValues[checks.timeOfDay.value],
      schedule: checks.schedule.value,
      category: checks.category.value,
    };
    const limit = Math.min(40, Math.max(1, Number(input.limit) || 40));
    const matches = filterSupplements(criteria).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
    return ok({ count: matches.length, results: matches.slice(0, limit).map((s) => toSummary(s)) });
  },
};

export const getSupplementDetails: ModelContextTool = {
  name: "get_supplement_details",
  title: "Get supplement details",
  description:
    "Returns everything the site knows about one supplement: dosage, timing, meals, Adderall notes, benefits, side effects, " +
    "why it is in its tier, and related supplements. Accepts a name as typed (\"lions mane\") or a slug.",
  inputSchema: {
    type: "object",
    properties: {
      supplement: { type: "string", description: "Supplement name or slug" },
    },
    required: ["supplement"],
  },
  annotations: { readOnlyHint: true },
  execute(input: { supplement?: string } = {}) {
    if (!input.supplement) return fail("Provide a supplement name or slug.");
    const r = resolveSupplement(input.supplement);
    if (!r.ok) return fail(r.error, { candidates: r.candidates });
    const related = getRelatedSupplements(r.supplement, 4).map((s) => ({ name: s.name, slug: s.slug }));
    return ok({ ...toDetails(r.supplement), related });
  },
};

export const catalogTools = [searchSupplements, getSupplementDetails];
