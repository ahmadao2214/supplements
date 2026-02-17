import { useState, useCallback } from "react";
import type { Supplement } from "../../data/supplements";
import { supplements } from "../../data/supplements";
import { buildCartUrl, initSupplementMap, extractVariantId } from "../../lib/cart-utils";
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
    <div className="flex items-center gap-3 flex-wrap">
      <QtyStepperButton
        qty={qty}
        onDecrease={() => setQty(Math.max(1, qty - 1))}
        onIncrease={() => setQty(qty + 1)}
        name={s.name}
      />
      {price && (
        <span className="text-sm text-sage-400/70 font-mono font-tabular">
          ${(price * qty).toFixed(2)}
        </span>
      )}
      <button
        className={`px-5 py-2 rounded-xl text-sm font-semibold font-display transition-all focus-ring ${
          added
            ? "bg-safe/20 text-safe border border-safe/30"
            : "bg-sage-600 text-white hover:bg-sage-500 hover:shadow-glow-sage"
        }`}
        onClick={handleAddToCart}
      >
        {added ? "✓ Opening Swanson..." : "Buy on Swanson"}
      </button>
    </div>
  );
}
