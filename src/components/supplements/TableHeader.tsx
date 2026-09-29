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

const thCls = "bg-surface-800 px-4 py-3 text-left border-b border-surface-border-strong whitespace-nowrap";

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
              <th key={col.key} scope="col" className={thCls}>
                <label className="inline-flex items-center gap-2 cursor-pointer eyebrow">
                  <input
                    type="checkbox"
                    checked={selectAllState === "all"}
                    ref={(el) => {
                      if (el) el.indeterminate = selectAllState === "some";
                    }}
                    onChange={onSelectAll}
                    className="check focus-ring"
                    aria-label="Select all purchasable supplements"
                  />
                  Cart
                </label>
              </th>
            ) : (
              <th
                key={col.key}
                scope="col"
                className={thCls}
                aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
              >
                <button
                  type="button"
                  onClick={() => onSort(col.key as SortKey)}
                  className={`eyebrow inline-flex items-center gap-1 hover:text-ink transition-colors focus-ring ${
                    sortKey === col.key ? "!text-sage-300" : ""
                  }`}
                >
                  {col.label}
                  <span className={`text-[0.6rem] ${sortKey === col.key ? "" : "opacity-0"}`} aria-hidden="true">
                    {sortDir === "asc" || sortKey !== col.key ? "▲" : "▼"}
                  </span>
                </button>
              </th>
            )
          )}
        <th scope="col" className={`${thCls} w-12`}>
          <span className="sr-only">Details</span>
        </th>
      </tr>
    </thead>
  );
});
