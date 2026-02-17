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
  striped?: boolean;
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
    striped,
  }: TableRowProps) {
    const visibleCols = allColumns.filter((col) => visibleColumns.has(col.key));
    const colSpan = visibleCols.length + 1;

    return (
      <>
        <tr
          className={`tier-row tier-row-${s.tier}${inCart ? " cart-selected" : ""}${striped ? " tier-row-stripe" : ""} group/row`}
          onClick={() => onToggleExpand(s.id)}
          aria-expanded={isExpanded}
        >
          {visibleCols.map((col) => (
            <td key={col.key} className="px-3 py-2 border-b border-surface-border align-top max-w-[280px] font-display text-sage-200/90">
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
            <span
              className={`inline-flex items-center justify-center w-5 h-5 text-sage-400/40 group-hover/row:text-sage-300 transition-all text-xs ${isExpanded ? "rotate-90" : ""}`}
              aria-hidden="true"
            >
              ›
            </span>
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
    prev.price === next.price &&
    prev.striped === next.striped
);
