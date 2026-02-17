import React from "react";
import type { Supplement } from "../../data/supplements";
import { allColumns } from "../../lib/constants";

type SortKey = keyof Supplement;
type SortDir = "asc" | "desc";
type SelectAllState = "none" | "some" | "all";

interface TableHeaderProps {
  visibleColumns: Set<string>;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  selectAllState: SelectAllState;
  onSelectAll: () => void;
}

export const TableHeader = React.memo(function TableHeader({
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  selectAllState,
  onSelectAll,
}: TableHeaderProps) {
  return (
    <thead>
      <tr>
        {allColumns
          .filter((col) => visibleColumns.has(col.key))
          .map((col) =>
            col.key === "purchaseUrl" ? (
              <th
                key={col.key}
                className="bg-surface-800 px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wider text-sage-400/50 border-b-2 border-surface-border cursor-default font-display"
              >
                <div className="flex items-center gap-1.5">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAllState === "all"}
                      ref={(el) => {
                        if (el) el.indeterminate = selectAllState === "some";
                      }}
                      onChange={onSelectAll}
                      className="w-4 h-4 accent-sage-500 cursor-pointer focus-ring"
                      aria-label="Select all purchasable supplements"
                    />
                  </label>
                  <span>Cart</span>
                </div>
              </th>
            ) : (
              <th
                key={col.key}
                onClick={() => onSort(col.key as SortKey)}
                className={`bg-surface-800 px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wider border-b-2 border-surface-border cursor-pointer select-none whitespace-nowrap hover:text-cyan-400 transition-colors font-display ${
                  sortKey === col.key ? "text-cyan-400" : "text-sage-400/50"
                }`}
                aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="text-[0.65rem] ml-1">
                    {sortDir === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            )
          )}
        <th className="bg-surface-800 px-3 py-2.5 text-center text-sage-400/30 border-b-2 border-surface-border w-[40px] font-display">
        </th>
      </tr>
    </thead>
  );
});
