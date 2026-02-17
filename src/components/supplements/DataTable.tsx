import React from "react";
import type { Supplement } from "../../data/supplements";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";

type SortKey = keyof Supplement;
type SortDir = "asc" | "desc";

interface DataTableProps {
  filtered: Supplement[];
  visibleColumns: Set<string>;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  expandedRow: number | null;
  onToggleExpand: (id: number) => void;
  cartItems: Map<number, number>;
  prices: Record<number, number>;
  onCartToggle: (id: number) => void;
  onCartSetQty: (id: number, qty: number) => void;
  selectAllState: "none" | "some" | "all";
  onSelectAll: () => void;
}

export function DataTable({
  filtered,
  visibleColumns,
  sortKey,
  sortDir,
  onSort,
  expandedRow,
  onToggleExpand,
  cartItems,
  prices,
  onCartToggle,
  onCartSetQty,
  selectAllState,
  onSelectAll,
}: DataTableProps) {
  return (
    <div className="overflow-auto max-h-[calc(100vh-220px)] border border-surface-border rounded-xl shadow-card">
      <table className="w-full border-collapse text-sm">
        <TableHeader
          visibleColumns={visibleColumns}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
          selectAllState={selectAllState}
          onSelectAll={onSelectAll}
        />
        <tbody>
          {filtered.map((s, i) => (
            <TableRow
              key={s.id}
              supplement={s}
              visibleColumns={visibleColumns}
              isExpanded={expandedRow === s.id}
              onToggleExpand={onToggleExpand}
              inCart={cartItems.has(s.id)}
              cartQty={cartItems.get(s.id) ?? 1}
              price={prices[s.id]}
              onCartToggle={onCartToggle}
              onCartSetQty={onCartSetQty}
              striped={i % 2 === 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
