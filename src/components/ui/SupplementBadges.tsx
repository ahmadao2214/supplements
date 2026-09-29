import type { Supplement } from "../../data/supplements";
import { tierLabels } from "../../lib/constants";
import {
  classifyAdderall,
  classifyTimeOfDay,
  classifyMeals,
  getTimeLabel,
  getMealLabel,
} from "../../lib/format-utils";
import { TierIcon, SunIcon, MoonIcon, ClockIcon, CheckIcon, AlertIcon, BanIcon } from "./Icons";

type S = { supplement: Supplement };

const meta = "inline-flex items-center gap-1.5 whitespace-nowrap";

/** Tier icon with its name — for places that explain a single supplement. */
export function TierLabel({ supplement: s }: S) {
  return (
    <span className={`${meta} text-sm text-ink-soft`}>
      <TierIcon tier={s.tier} decorative />
      {tierLabels[s.tier]}
    </span>
  );
}

export function TimeLabel({ supplement: s }: S) {
  const type = classifyTimeOfDay(s.timeOfDay);
  if (!type) return <span>{s.timeOfDay}</span>;
  const Icon = type === "day" ? SunIcon : type === "night" ? MoonIcon : ClockIcon;
  return (
    <span className={`${meta} text-ink-soft`} title={s.timeOfDay}>
      <Icon className="text-ink-muted" />
      {getTimeLabel(type)}
    </span>
  );
}

const adderallText = {
  safe: { short: "Safe", long: "Adderall-safe" },
  caution: { short: "Caution", long: "Caution with Adderall" },
  avoid: { short: "Separate", long: "Separate from Adderall" },
};

/** Neutral when safe; color is reserved for the cases that need attention. */
export function AdderallLabel({ supplement: s, long = false }: S & { long?: boolean }) {
  const type = classifyAdderall(s.withAdderall);
  const Icon = type === "safe" ? CheckIcon : type === "caution" ? AlertIcon : BanIcon;
  const tone = type === "safe" ? "text-ink-muted" : type === "caution" ? "text-caution" : "text-avoid";
  return (
    <span className={`${meta} ${tone}`} title={s.withAdderall}>
      <Icon />
      {adderallText[type][long ? "long" : "short"]}
    </span>
  );
}

export function MealLabel({ supplement: s }: S) {
  const type = classifyMeals(s.withMeals);
  return <span>{type ? getMealLabel(type) : s.withMeals}</span>;
}

export function ScheduleLabel({ supplement: s }: S) {
  return <span>{s.schedule.replace("Daily — ", "Daily; ")}</span>;
}

/** Name with the specific form underneath, so names scan at a glance. */
export function SupplementName({ supplement: s, className = "" }: S & { className?: string }) {
  return (
    <span className={`block min-w-0 ${className}`}>
      <span className="block font-semibold text-ink leading-snug">{s.name}</span>
      {s.form && <span className="block text-[0.8125rem] text-ink-muted leading-snug">{s.form}</span>}
    </span>
  );
}
