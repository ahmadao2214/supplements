import React from "react";
import { tierLabels, tierDescriptions } from "../../lib/constants";

export const TierLegend = React.memo(function TierLegend() {
  return (
    <div className="flex gap-4 flex-wrap mb-3 text-xs">
      {([1, 2, 3] as const).map((tier) => (
        <div key={tier} className="flex items-center gap-1.5">
          <span className={`badge badge-tier${tier}`}>
            T{tier} {tierLabels[tier]}
          </span>
          <span className="text-sage-400/50 font-display">
            {tierDescriptions[tier]}
          </span>
        </div>
      ))}
    </div>
  );
});
