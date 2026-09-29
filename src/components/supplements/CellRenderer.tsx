import React from "react";
import type { Supplement } from "../../data/supplements";
import { tierLabels } from "../../lib/constants";
import { AdderallFlag, ScheduleLabel, TimeIcon, MealLabel, SupplementName } from "../ui/SupplementBadges";

interface CellRendererProps {
  colKey: string;
  supplement: Supplement;
}

export const CellRenderer = React.memo(function CellRenderer({ colKey, supplement: s }: CellRendererProps) {
  switch (colKey) {
    case "tier":
      return <>{tierLabels[s.tier]}</>;
    case "withAdderall":
      return <AdderallFlag supplement={s} />;
    case "schedule":
      return <ScheduleLabel supplement={s} />;
    case "timeOfDay":
      return <TimeIcon supplement={s} />;
    case "withMeals":
      return <MealLabel supplement={s} />;
    case "dosage":
      return <span className="font-tabular">{s.dosage}</span>;
    case "name":
      return (
        <a
          href={`/supplement/${s.slug}`}
          className="group/name block focus-ring"
          onClick={(e) => e.stopPropagation()}
        >
          <SupplementName supplement={s} className="[&>span:first-child]:group-hover/name:text-sage-300 [&>span:first-child]:transition-colors" />
        </a>
      );
    default:
      return <>{s[colKey as keyof Supplement] as string}</>;
  }
});
