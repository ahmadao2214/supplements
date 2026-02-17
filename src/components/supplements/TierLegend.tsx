import React from "react";
import { tierLabels, tierDescriptions } from "../../lib/constants";

export const TierLegend = React.memo(function TierLegend() {
  return (
    <div className="flex gap-5 flex-wrap mb-4 px-4 py-3 bg-surface-800 border border-surface-border rounded-xl">
      {([1, 2, 3] as const).map((tier) => (
        <div key={tier} className="flex items-center gap-2">
          <span className={`badge badge-tier${tier}`}>
            T{tier} {tierLabels[tier]}
          </span>
          <span className="text-xs text-sage-400/60 font-body">
            {tierDescriptions[tier]}
          </span>
        </div>
      ))}
    </div>
  );
});
