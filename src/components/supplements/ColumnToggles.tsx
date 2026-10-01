import React from "react";
import { allColumns } from "../../lib/constants";

interface ColumnTogglesProps {
  visibleColumns: Set<string>;
  toggleColumn: (key: string) => void;
}

export const ColumnToggles = React.memo(function ColumnToggles({
  visibleColumns,
  toggleColumn,
}: ColumnTogglesProps) {
  return (
    <details className="relative group">
      <summary className="list-none [&::-webkit-details-marker]:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] border border-surface-border bg-surface-800 text-[0.8125rem] font-medium text-ink-muted hover:text-ink cursor-pointer select-none focus-ring">
        Columns
        <span className="text-ink-faint font-tabular">{visibleColumns.size}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="group-open:rotate-180 transition-transform" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <div className="absolute right-0 top-full mt-2 z-30 w-64 panel p-2 shadow-elevated animate-fade-in">
        {allColumns.map((col) => (
          <label
            key={col.key}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-ink-soft cursor-pointer hover:bg-surface-700"
          >
            <input
              type="checkbox"
              checked={visibleColumns.has(col.key)}
              onChange={() => toggleColumn(col.key)}
              className="check focus-ring"
            />
            {col.label}
          </label>
        ))}
      </div>
    </details>
  );
});
