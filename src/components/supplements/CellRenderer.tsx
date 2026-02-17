import React from "react";
import type { Supplement } from "../../data/supplements";
import { tierLabels, tierDescriptions } from "../../lib/constants";
import {
  classifyAdderall,
  classifySchedule,
  classifyTimeOfDay,
  classifyMeals,
  getAdderallEmoji,
  getAdderallLabel,
  getScheduleEmoji,
} from "../../lib/format-utils";

interface CellRendererProps {
  colKey: string;
  supplement: Supplement;
}

export const CellRenderer = React.memo(function CellRenderer({ colKey, supplement: s }: CellRendererProps) {
  switch (colKey) {
    case "tier": {
      const cls = `badge-tier${s.tier}`;
      return (
        <span className={`badge ${cls}`} title={tierDescriptions[s.tier]}>
          T{s.tier} {tierLabels[s.tier]}
        </span>
      );
    }
    case "withAdderall": {
      const type = classifyAdderall(s.withAdderall);
      return (
        <span className={`badge badge-${type}`}>
          {getAdderallEmoji(type)} {getAdderallLabel(type)}
        </span>
      );
    }
    case "schedule": {
      const cls = classifySchedule(s.schedule);
      return (
        <span className={`badge badge-${cls}`}>
          {getScheduleEmoji(s.schedule)} {s.schedule}
        </span>
      );
    }
    case "timeOfDay": {
      const type = classifyTimeOfDay(s.timeOfDay);
      if (type === "day") return <span className="badge badge-time-day">&#x2600;&#xFE0F; {s.timeOfDay}</span>;
      if (type === "night") return <span className="badge badge-time-night">&#x1F319; {s.timeOfDay}</span>;
      return <>{s.timeOfDay}</>;
    }
    case "withMeals": {
      const type = classifyMeals(s.withMeals);
      if (type === "fat") return <span className="badge badge-meal-fat">&#x1F951; {s.withMeals}</span>;
      if (type === "yes") return <span className="badge badge-meal-yes">&#x1F37D;&#xFE0F; {s.withMeals}</span>;
      if (type === "no") return <span className="badge badge-meal-no">&#x1F6AB;&#x1F37D;&#xFE0F; {s.withMeals}</span>;
      if (type === "optional") return <span className="badge badge-meal-optional">&#x2796; {s.withMeals}</span>;
      return <>{s.withMeals}</>;
    }
    case "frequency": {
      const val = s.frequency;
      if (val.startsWith("1–3")) return <>&#x2460;&#x2461;&#x2462; {val}</>;
      if (val.startsWith("1–2")) return <>&#x2460;&#x2461; {val}</>;
      if (val.startsWith("1x")) return <>&#x2460; {val}</>;
      return <>{val}</>;
    }
    case "name": {
      return (
        <a
          href={`/supplement/${s.slug}`}
          className="font-display font-semibold text-sage-200 hover:text-cyan-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {s.name}
        </a>
      );
    }
    default:
      return <>{s[colKey as keyof Supplement] as string}</>;
  }
});
