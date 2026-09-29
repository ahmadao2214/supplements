import React from "react";
import { supplements } from "../../data/supplements";
import { tierLabels, tierDescriptions } from "../../lib/constants";

interface ResultsCountProps {
  filteredCount: number;
  tierFilter: string;
}

export const ResultsCount = React.memo(function ResultsCount({
  filteredCount,
  tierFilter,
}: ResultsCountProps) {
  const tier = Number(tierFilter);
  return (
    <p className="min-w-0 whitespace-nowrap text-[0.8125rem] text-ink-muted" aria-live="polite">
      <span className="text-ink-soft font-medium font-tabular">{filteredCount}</span>
      {filteredCount !== supplements.length && <span className="font-tabular"> of {supplements.length}</span>}
      <span className="sm:hidden"> results</span>
      <span className="max-sm:hidden"> supplements</span>
      {tier ? (
        <span className="hidden md:inline text-ink-faint"> · {tierLabels[tier]}: {tierDescriptions[tier].toLowerCase()}</span>
      ) : null}
    </p>
  );
});
