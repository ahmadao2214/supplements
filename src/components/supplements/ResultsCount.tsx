import React from "react";
import { supplements } from "../../data/supplements";

interface ResultsCountProps {
  filteredCount: number;
}

export const ResultsCount = React.memo(function ResultsCount({ filteredCount }: ResultsCountProps) {
  return (
    <p className="min-w-0 whitespace-nowrap text-[0.8125rem] text-ink-muted font-tabular" aria-live="polite">
      {filteredCount === supplements.length ? (
        // Unfiltered total is only worth the space on wider screens
        <span className="max-sm:sr-only">{filteredCount} supplements</span>
      ) : (
        `${filteredCount} of ${supplements.length}`
      )}
    </p>
  );
});
