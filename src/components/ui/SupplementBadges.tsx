import type { Supplement } from "../../data/supplements";
import { tierLabels } from "../../lib/constants";
import {
  classifyAdderall,
  classifyTimeOfDay,
  classifyMeals,
  getTimeLabel,
  getMealLabel,
} from "../../lib/format-utils";
import { SunIcon, MoonIcon, ClockIcon, CheckIcon, AlertIcon, BanIcon } from "./Icons";

type S = { supplement: Supplement };

const meta = "inline-flex items-center gap-1.5 whitespace-nowrap";

/** Tier name — for places that explain a single supplement. */
export function TierLabel({ supplement: s }: S) {
  return <span className="font-semibold text-ink">{tierLabels[s.tier]}</span>;
}

const adderallText = {
  safe: { short: "Safe", long: "Adderall-safe" },
  caution: { short: "Caution", long: "Caution with Adderall" },
  avoid: { short: "Separate", long: "Separate from Adderall" },
};

const timeIcons = { day: SunIcon, night: MoonIcon, flex: ClockIcon };

/** Icon only, for list rows; the words live in the legend and details. */
export function TimeIcon({ supplement: s }: S) {
  const type = classifyTimeOfDay(s.timeOfDay);
  if (!type) return null;
  const Icon = timeIcons[type];
  return (
    <span className="inline-flex text-ink-muted" title={s.timeOfDay}>
      <Icon size={16} />
      <span className="sr-only">{getTimeLabel(type)}</span>
    </span>
  );
}

/** Nothing when safe; a warning icon only when Adderall needs attention. */
export function AdderallFlag({ supplement: s }: S) {
  const type = classifyAdderall(s.withAdderall);
  if (type === "safe") return null;
  const Icon = type === "caution" ? AlertIcon : BanIcon;
  return (
    <span className={`inline-flex ${type === "caution" ? "text-caution" : "text-avoid"}`} title={s.withAdderall}>
      <Icon size={16} />
      <span className="sr-only">{adderallText[type].long}</span>
    </span>
  );
}

export function TimeLabel({ supplement: s }: S) {
  const type = classifyTimeOfDay(s.timeOfDay);
  if (!type) return <span>{s.timeOfDay}</span>;
  const Icon = timeIcons[type];
  return (
    <span className={`${meta} text-ink-soft`} title={s.timeOfDay}>
      <Icon className="text-ink-muted" />
      {getTimeLabel(type)}
    </span>
  );
}


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
