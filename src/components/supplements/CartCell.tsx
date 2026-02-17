import React from "react";
import { QtyStepperButton } from "../ui/QtyStepperButton";

interface CartCellProps {
  suppId: number;
  name: string;
  purchaseUrl: string;
  inCart: boolean;
  qty: number;
  price?: number;
  onToggle: (id: number) => void;
  onSetQty: (id: number, qty: number) => void;
}

export const CartCell = React.memo(function CartCell({
  suppId,
  name,
  purchaseUrl,
  inCart,
  qty,
  price,
  onToggle,
  onSetQty,
}: CartCellProps) {
  if (!purchaseUrl) {
    return <span className="text-surface-500 text-sm">--</span>;
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={inCart}
          onChange={() => onToggle(suppId)}
          className="w-4 h-4 accent-sage-500 cursor-pointer focus-ring"
          aria-label={`Add ${name} to cart`}
        />
      </label>
      {inCart && price && (
        <span className="text-xs text-sage-400/70 font-tabular font-mono">${price.toFixed(2)}</span>
      )}
      {inCart && (
        <QtyStepperButton
          qty={qty}
          onDecrease={() => onSetQty(suppId, qty - 1)}
          onIncrease={() => onSetQty(suppId, qty + 1)}
          name={name}
        />
      )}
      {inCart && price && qty > 1 && (
        <span className="text-[0.7rem] text-cyan-400 font-tabular font-mono w-full pl-5">
          ${(price * qty).toFixed(2)}
        </span>
      )}
    </div>
  );
});
