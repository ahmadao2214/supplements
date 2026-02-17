import React from "react";
import type { Supplement } from "../../data/supplements";
import { tierLabels, tierDescriptions } from "../../lib/constants";
import {
  classifyAdderall,
  classifySchedule,
  getAdderallEmoji,
  getAdderallLabel,
  getScheduleEmoji,
} from "../../lib/format-utils";

interface SupplementCardProps {
  supplement: Supplement;
  inCart: boolean;
  onCartToggle: (id: number) => void;
}

export const SupplementCard = React.memo(function SupplementCard({
  supplement: s,
  inCart,
  onCartToggle,
}: SupplementCardProps) {
  const adderallType = classifyAdderall(s.withAdderall);
  const schedCls = classifySchedule(s.schedule);

  return (
    <div className={`relative flex flex-col bg-surface-800 border border-surface-border rounded-xl overflow-hidden transition-all hover:shadow-elevated hover:border-sage-600/50 group ${inCart ? "ring-1 ring-cyan-400/20" : ""}`}>
      {/* Tier indicator bar */}
      <div className={`h-1 ${s.tier === 1 ? "bg-tier1" : s.tier === 2 ? "bg-tier2" : "bg-tier3"}`} />

      <div className="flex flex-col flex-1 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <a
            href={`/supplement/${s.slug}`}
            className="font-display font-bold text-sage-200 text-sm hover:text-cyan-400 transition-colors leading-tight"
          >
            {s.name}
          </a>
          <span className={`badge badge-tier${s.tier} shrink-0`} title={tierDescriptions[s.tier]}>
            T{s.tier}
          </span>
        </div>

        {/* Category */}
        <span className="text-xs text-sage-400/50 font-display mb-2">{s.category}</span>

        {/* Treats */}
        <p className="text-xs text-sage-400/70 font-display mb-3 line-clamp-2">{s.treats}</p>

        {/* Dosage */}
        <div className="text-xs text-sage-200/70 font-mono mb-3">
          {s.dosage}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1 mt-auto mb-3">
          <span className={`badge badge-${adderallType}`} style={{ fontSize: "0.65rem" }}>
            {getAdderallEmoji(adderallType)} {getAdderallLabel(adderallType)}
          </span>
          <span className={`badge badge-${schedCls}`} style={{ fontSize: "0.65rem" }}>
            {getScheduleEmoji(s.schedule)} {s.schedule.replace("Daily — ", "")}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-border">
          <a
            href={`/supplement/${s.slug}`}
            className="text-xs text-sage-400/60 hover:text-cyan-400 transition-colors font-display focus-ring"
          >
            View details →
          </a>
          {s.purchaseUrl && (
            <button
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold font-display transition-colors focus-ring ${
                inCart
                  ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                  : "bg-sage-600 text-white hover:bg-sage-500"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onCartToggle(s.id);
              }}
            >
              {inCart ? "✓ In Cart" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
