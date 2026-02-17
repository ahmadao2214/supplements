import React from "react";

interface CartBarProps {
  itemCount: number;
  cartTotal: number;
  cartSubtotal: { total: number; allPriced: boolean };
  cartNames: string;
  onClear: () => void;
  onOpenCart: () => void;
}

export const CartBar = React.memo(function CartBar({
  itemCount,
  cartTotal,
  cartSubtotal,
  cartNames,
  onClear,
  onOpenCart,
}: CartBarProps) {
  return (
    <div
      className={`sticky bottom-0 z-20 transition-all duration-250 ease-out ${
        itemCount > 0
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-800 border-t border-surface-border shadow-elevated rounded-t-xl">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-sm font-semibold text-cyan-400 font-display">
            {itemCount} {itemCount === 1 ? "item" : "items"}
            {cartTotal !== itemCount && ` (${cartTotal} total)`}
            {cartSubtotal.total > 0 && (
              <span className="font-tabular font-mono">
                {" — "}${cartSubtotal.total.toFixed(2)}
                {!cartSubtotal.allPriced && "+"}
              </span>
            )}
          </span>
          <span className="text-xs text-sage-400/50 truncate font-body">
            {cartNames}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 bg-transparent border border-surface-border rounded-xl text-sage-400/60 text-sm cursor-pointer hover:border-avoid hover:text-avoid transition-colors font-display focus-ring"
            onClick={onClear}
          >
            Clear
          </button>
          <button
            className="px-4 py-1.5 bg-sage-600 border-none rounded-xl text-white text-sm font-semibold cursor-pointer hover:bg-sage-500 transition-colors whitespace-nowrap font-display focus-ring"
            onClick={onOpenCart}
          >
            Open Swanson Cart
          </button>
        </div>
      </div>
    </div>
  );
});
