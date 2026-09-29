import { useState, useCallback } from "react";
import type { Supplement } from "../../data/supplements";
import { supplements } from "../../data/supplements";
import { buildCartUrl, initSupplementMap } from "../../lib/cart-utils";
import { formatPrice } from "../../lib/format-utils";
import { QtyStepperButton } from "../ui/QtyStepperButton";

interface Props {
  supplement: Supplement;
  price?: number;
}

export default function SupplementDetail({ supplement: s, price }: Props) {
  initSupplementMap(supplements);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = useCallback(() => {
    const cart = new Map<number, number>();
    cart.set(s.id, qty);
    const url = buildCartUrl(cart);
    window.open(url, "_blank", "noopener,noreferrer");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [s.id, qty]);

  if (!s.purchaseUrl) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3 mr-auto">
        <QtyStepperButton
          qty={qty}
          onDecrease={() => setQty(Math.max(1, qty - 1))}
          onIncrease={() => setQty(qty + 1)}
          name={s.name}
        />
        {price ? (
          <span className="text-base font-semibold text-ink font-mono font-tabular">{formatPrice(price * qty)}</span>
        ) : null}
      </div>
      <button
        type="button"
        className={`btn w-full sm:w-auto focus-ring ${added ? "btn-selected" : "btn-primary"}`}
        onClick={handleAddToCart}
      >
        {added ? "✓ Opening Swanson…" : "Buy on Swanson ↗"}
      </button>
    </div>
  );
}
