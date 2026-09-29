import React from "react";
import { QtyStepperButton } from "../ui/QtyStepperButton";
import { formatPrice } from "../../lib/format-utils";

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
    return <span className="text-ink-faint text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={inCart}
        onChange={() => onToggle(suppId)}
        className="check focus-ring"
        aria-label={`Add ${name} to cart`}
      />
      {inCart && (
        <QtyStepperButton
          size="sm"
          qty={qty}
          onDecrease={() => onSetQty(suppId, qty - 1)}
          onIncrease={() => onSetQty(suppId, qty + 1)}
          name={name}
        />
      )}
      {inCart && price ? (
        <span className="text-xs text-ink-muted font-tabular font-mono">{formatPrice(price * qty)}</span>
      ) : null}
    </div>
  );
});
