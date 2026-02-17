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
          className={`tier-row tier-row-${s.tier}${inCart ? " cart-selected" : ""}`}
          onClick={() => onToggleExpand(s.id)}
          aria-expanded={isExpanded}
        >
          {visibleCols.map((col) => (
            <td key={col.key} className="px-3 py-2 border-b border-surface-border align-top max-w-[280px] font-body text-sage-200/90">
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
          <td className="px-3 py-2 border-b border-surface-border text-center w-[50px]">
            <button
              className="w-7 h-7 inline-flex items-center justify-center bg-surface-700 border border-surface-border text-sage-300 rounded-lg text-base leading-none hover:bg-sage-700 hover:border-sage-500 transition-colors focus-ring"
              aria-label={isExpanded ? `Collapse ${s.name} details` : `Expand ${s.name} details`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(s.id);
              }}
            >
              {isExpanded ? "−" : "+"}
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
