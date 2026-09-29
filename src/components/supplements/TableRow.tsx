import React from "react";
import type { Supplement } from "../../data/supplements";
import { allColumns } from "../../lib/constants";
import { CellRenderer } from "./CellRenderer";
import { CartCell } from "./CartCell";
import { DetailRow } from "./DetailRow";

interface TableRowProps {
  supplement: Supplement;
  visibleColumns: Set<string>;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  inCart: boolean;
  cartQty: number;
  price?: number;
  onCartToggle: (id: number) => void;
  onCartSetQty: (id: number, qty: number) => void;
}

export const TableRow = React.memo(
  function TableRow({
    supplement: s,
    visibleColumns,
    isExpanded,
    onToggleExpand,
    inCart,
    cartQty,
    price,
    onCartToggle,
    onCartSetQty,
  }: TableRowProps) {
    const visibleCols = allColumns.filter((col) => visibleColumns.has(col.key));
    const colSpan = visibleCols.length + 1;

    return (
      <>
        <tr
          className={`data-row${inCart ? " cart-selected" : ""} group/row`}
          onClick={() => onToggleExpand(s.id)}
        >
          {visibleCols.map((col) => (
            <td key={col.key} className={`py-3 border-b border-surface-border align-middle max-w-[300px] text-sm text-ink-soft ${col.key === "tier" ? "pl-5 pr-1 w-10" : "px-4"}`}>
              {col.key === "purchaseUrl" ? (
                <CartCell
                  suppId={s.id}
                  name={s.name}
                  purchaseUrl={s.purchaseUrl}
                  inCart={inCart}
                  qty={cartQty}
                  price={price}
                  onToggle={onCartToggle}
                  onSetQty={onCartSetQty}
                />
              ) : (
                <CellRenderer colKey={col.key} supplement={s} />
              )}
            </td>
          ))}
          <td className="px-2 py-3 border-b border-surface-border text-center w-12">
            <button
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-faint group-hover/row:text-ink-soft hover:bg-surface-600 transition-colors focus-ring"
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${s.name} details`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(s.id);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </td>
        </tr>
        {isExpanded && <DetailRow supplement={s} colSpan={colSpan} />}
      </>
    );
  },
  (prev, next) =>
    prev.supplement.id === next.supplement.id &&
    prev.isExpanded === next.isExpanded &&
    prev.inCart === next.inCart &&
    prev.cartQty === next.cartQty &&
    prev.visibleColumns === next.visibleColumns &&
    prev.price === next.price
);
