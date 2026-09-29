import React from "react";
import type { Supplement } from "../../data/supplements";
import { TierBadge, AdderallBadge, ScheduleBadge, TimeBadge, MealBadge } from "../ui/SupplementBadges";

interface CellRendererProps {
  colKey: string;
  supplement: Supplement;
}

export const CellRenderer = React.memo(function CellRenderer({ colKey, supplement: s }: CellRendererProps) {
  switch (colKey) {
    case "tier":
      return <TierBadge supplement={s} />;
    case "withAdderall":
      return <AdderallBadge supplement={s} />;
    case "schedule":
      return <ScheduleBadge supplement={s} />;
    case "timeOfDay":
      return <TimeBadge supplement={s} />;
    case "withMeals":
      return <MealBadge supplement={s} />;
    case "dosage":
      return <span className="font-mono text-[0.8125rem] text-ink-soft">{s.dosage}</span>;
    case "name":
      return (
        <a
          href={`/supplement/${s.slug}`}
          className="font-semibold text-ink hover:text-sage-300 hover:underline underline-offset-4 decoration-sage-400/50 transition-colors focus-ring"
          onClick={(e) => e.stopPropagation()}
        >
          {s.name}
        </a>
      );
    default:
      return <>{s[colKey as keyof Supplement] as string}</>;
  }
});
