import type { Supplement } from "../../data/supplements";
import { tierLabels } from "../../lib/constants";
import {
  classifyAdderall,
  classifyMeals,
  getDoseTimes,
  getTimeLabel,
  getMealLabel,
  type DoseTime,
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

const timeIcons: Record<DoseTime, typeof SunIcon> = { day: SunIcon, night: MoonIcon, flex: ClockIcon };
const timeTone: Record<DoseTime, string> = { day: "text-sun", night: "text-moon", flex: "text-ink-muted" };

/** Sun and/or moon for when doses are taken — icons only; the legend and details carry the words. */
export function DoseIcons({ supplement: s, size = 16 }: S & { size?: number }) {
  const times = getDoseTimes(s);
  if (times.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1" title={s.timeOfDay}>
      {times.map((t) => {
        const Icon = timeIcons[t];
        return <Icon key={t} size={size} className={timeTone[t]} />;
      })}
      <span className="sr-only">{times.map(getTimeLabel).join(" and ")}</span>
    </span>
  );
}

/** Right-aligned dose timing block used in list rows and cards. */
export function DoseSchedule({ supplement: s }: S) {
  return (
    <span className="flex flex-col items-end gap-1 shrink-0">
      <span className="flex items-center gap-2">
        <AdderallFlag supplement={s} />
        <DoseIcons supplement={s} />
      </span>
      <span className="text-xs text-ink-muted whitespace-nowrap">{s.frequency}</span>
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
  return (
    <span className="inline-flex items-center gap-2">
      <DoseIcons supplement={s} size={14} />
      <span>{s.timeOfDay}</span>
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
