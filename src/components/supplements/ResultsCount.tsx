import React from "react";
import { supplements } from "../../data/supplements";

interface ResultsCountProps {
  filteredCount: number;
  onReset: () => void;
}

/** Shown only while filtering, so the unfiltered list starts right under the controls. */
export const ResultsCount = React.memo(function ResultsCount({ filteredCount, onReset }: ResultsCountProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-2 text-[0.8125rem] text-ink-muted" aria-live="polite">
      <span className="font-tabular">
        {filteredCount} of {supplements.length}
      </span>
      <button type="button" onClick={onReset} className="min-h-9 px-2 -mr-2 rounded-md hover:text-ink focus-ring">
        Clear
      </button>
    </div>
  );
});
