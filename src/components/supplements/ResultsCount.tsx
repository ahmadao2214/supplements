import React from "react";
import { supplements } from "../../data/supplements";
import { tierDescriptions } from "../../lib/constants";

interface ResultsCountProps {
  filteredCount: number;
  tierFilter: string;
}

export const ResultsCount = React.memo(function ResultsCount({
  filteredCount,
  tierFilter,
}: ResultsCountProps) {
  return (
    <div className="text-xs text-sage-400/50 mb-2 font-display">
      Showing {filteredCount} of {supplements.length} supplements
      {tierFilter !== "All" && (
        <span> — Tier {tierFilter}: {tierDescriptions[Number(tierFilter)]}</span>
      )}
    </div>
  );
});
