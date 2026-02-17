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

interface DetailRowProps {
  supplement: Supplement;
  colSpan: number;
}

export const DetailRow = React.memo(function DetailRow({ supplement: s, colSpan }: DetailRowProps) {
  const adderallType = classifyAdderall(s.withAdderall);
  const schedCls = classifySchedule(s.schedule);
  const timeType = classifyTimeOfDay(s.timeOfDay);
  const mealType = classifyMeals(s.withMeals);

  return (
    <tr className="bg-surface-800">
      <td colSpan={colSpan} className="border-b border-surface-border">
        <div className="p-4 animate-fade-in">
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <h3 className="text-lg font-display font-bold text-cyan-400">{s.name}</h3>
            <span className={`badge badge-tier${s.tier}`} title={tierDescriptions[s.tier]}>
              T{s.tier} {tierLabels[s.tier]}
            </span>
            <span className={`badge badge-${schedCls}`}>
              {getScheduleEmoji(s.schedule)} {s.schedule}
            </span>
            {s.purchaseUrl && (
              <a
                href={s.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 bg-sage-600 text-white rounded-xl text-xs font-semibold hover:bg-sage-500 transition-colors font-display focus-ring"
              >
                Buy on Swanson
              </a>
            )}
          </div>
          <div className="text-sm text-sage-400/70 mb-3 px-2.5 py-1.5 bg-cyan-400/5 border-l-3 border-cyan-400 rounded-r-lg font-body">
            <strong className="text-cyan-400">Why this tier:</strong> {s.tierReason}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-6 gap-y-2 text-sm font-body text-sage-200/80">
            <div><strong className="text-sage-400/50">Category:</strong> {s.category}</div>
            <div><strong className="text-sage-400/50">Treats:</strong> {s.treats}</div>
            <div><strong className="text-sage-400/50">Dosage:</strong> {s.dosage}</div>
            <div>
              <strong className="text-sage-400/50">Frequency:</strong>{" "}
              {s.frequency.startsWith("1–3") ? <>&#x2460;&#x2461;&#x2462; {s.frequency}</> :
               s.frequency.startsWith("1–2") ? <>&#x2460;&#x2461; {s.frequency}</> :
               s.frequency.startsWith("1x") ? <>&#x2460; {s.frequency}</> : s.frequency}
            </div>
            <div>
              <strong className="text-sage-400/50">Time of Day:</strong>{" "}
              {timeType === "day" ? <span className="badge badge-time-day">&#x2600;&#xFE0F; {s.timeOfDay}</span> :
               timeType === "night" ? <span className="badge badge-time-night">&#x1F319; {s.timeOfDay}</span> :
               s.timeOfDay}
            </div>
            <div>
              <strong className="text-sage-400/50">With Meals:</strong>{" "}
              {mealType === "fat" ? <span className="badge badge-meal-fat">&#x1F951; {s.withMeals}</span> :
               mealType === "yes" ? <span className="badge badge-meal-yes">&#x1F37D;&#xFE0F; {s.withMeals}</span> :
               mealType === "no" ? <span className="badge badge-meal-no">&#x1F6AB;&#x1F37D;&#xFE0F; {s.withMeals}</span> :
               mealType === "optional" ? <span className="badge badge-meal-optional">&#x2796; {s.withMeals}</span> :
               s.withMeals}
            </div>
            <div>
              <strong className="text-sage-400/50">With Adderall:</strong>{" "}
              <span className={`badge badge-${adderallType}`}>
                {getAdderallEmoji(adderallType)} {getAdderallLabel(adderallType)}
              </span>{" "}
              {s.withAdderall}
            </div>
            <div>
              <strong className="text-sage-400/50">Schedule:</strong>{" "}
              <span className={`badge badge-${schedCls}`}>
                {getScheduleEmoji(s.schedule)} {s.schedule}
              </span>
            </div>
            <div className="col-span-full"><strong className="text-sage-400/50">Benefits:</strong> {s.benefits}</div>
            <div className="col-span-full"><strong className="text-sage-400/50">Side Effects:</strong> {s.sideEffects}</div>
            <div className="col-span-full"><strong className="text-sage-400/50">Notes:</strong> {s.notes}</div>
          </div>
        </div>
      </td>
    </tr>
  );
});
