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
    <details className="bg-surface-800 border border-surface-border rounded-xl">
      <summary className="px-3 py-2 cursor-pointer text-sm text-sage-400/60 select-none hover:text-sage-300 font-display">
        Configure Columns ({visibleColumns.size} visible)
      </summary>
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-3 pb-3">
        {allColumns.map((col) => (
          <label
            key={col.key}
            className="flex items-center gap-1.5 text-xs text-sage-400/60 cursor-pointer hover:text-sage-300 font-display"
          >
            <input
              type="checkbox"
              checked={visibleColumns.has(col.key)}
              onChange={() => toggleColumn(col.key)}
              className="accent-sage-500"
            />
            {col.label}
          </label>
        ))}
      </div>
    </details>
  );
});
