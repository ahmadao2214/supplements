import React from "react";
import type { Supplement } from "../../data/supplements";
import { allColumns } from "../../lib/constants";

type SortKey = keyof Supplement;
type SortDir = "asc" | "desc";

interface TableHeaderProps {
  visibleColumns: Set<string>;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

const thCls = "bg-surface-800 py-3 text-left border-b border-surface-border-strong whitespace-nowrap";

export const TableHeader = React.memo(function TableHeader({
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
}: TableHeaderProps) {
  return (
    <thead>
      <tr>
        {allColumns
          .filter((col) => visibleColumns.has(col.key))
          .map((col) =>
            col.key === "purchaseUrl" ? (
              <th key={col.key} scope="col" className={`${thCls} px-4`}>
                <span className="eyebrow">Cart</span>
              </th>
            ) : (
              <th
                key={col.key}
                scope="col"
                className={`${thCls} ${["timeOfDay", "withAdderall"].includes(col.key) ? "px-4 w-20" : "px-4"}`}
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
        <th scope="col" className={`${thCls} px-2 w-12`}>
          <span className="sr-only">Details</span>
        </th>
      </tr>
    </thead>
  );
});
