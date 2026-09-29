import type { Supplement } from "../../data/supplements";
import { tierLabels, tierDescriptions } from "../../lib/constants";
import {
  classifyAdderall,
  classifySchedule,
  classifyTimeOfDay,
  classifyMeals,
  getAdderallLabel,
  getTimeLabel,
  getMealLabel,
} from "../../lib/format-utils";

type S = { supplement: Supplement };

export function TierBadge({ supplement: s, short = false }: S & { short?: boolean }) {
  return (
    <span className={`badge badge-tier${s.tier}`} title={tierDescriptions[s.tier]}>
      {short ? `T${s.tier}` : tierLabels[s.tier]}
    </span>
  );
}

export function AdderallBadge({ supplement: s }: S) {
  const type = classifyAdderall(s.withAdderall);
  return (
    <span className={`badge badge-dot badge-${type}`} title={s.withAdderall}>
      {getAdderallLabel(type)}
    </span>
  );
}

export function ScheduleBadge({ supplement: s, short = false }: S & { short?: boolean }) {
  return (
    <span className={`badge badge-dot badge-${classifySchedule(s.schedule)}`} title={s.schedule}>
      {short ? s.schedule.replace("Daily — ", "") : s.schedule}
    </span>
  );
}

export function TimeBadge({ supplement: s }: S) {
  const type = classifyTimeOfDay(s.timeOfDay);
  if (!type) return <span>{s.timeOfDay}</span>;
  return (
    <span className={`badge badge-dot badge-time-${type}`} title={s.timeOfDay}>
      {getTimeLabel(type)}
    </span>
  );
}

export function MealBadge({ supplement: s }: S) {
  const type = classifyMeals(s.withMeals);
  if (!type) return <span>{s.withMeals}</span>;
  return (
    <span className={`badge badge-dot badge-meal-${type}`} title={s.withMeals}>
      {getMealLabel(type)}
    </span>
  );
}
