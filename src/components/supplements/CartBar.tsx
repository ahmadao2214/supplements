import React from "react";
import { formatPrice } from "../../lib/format-utils";

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
  const visible = itemCount > 0;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-200 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
      role="region"
      aria-label="Cart"
      aria-hidden={!visible}
    >
      <div className="bg-surface-800/95 backdrop-blur-md border-t border-surface-border-strong shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 sm:px-6 pt-3 pb-safe">
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="text-sm font-semibold text-ink">
              {cartTotal} {cartTotal === 1 ? "item" : "items"}
              {cartSubtotal.total > 0 && (
                <span className="font-mono font-tabular text-sage-300">
                  {" · "}{formatPrice(cartSubtotal.total)}{!cartSubtotal.allPriced && "+"}
                </span>
              )}
            </p>
            <p className="text-xs text-ink-muted truncate">{cartNames}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm shrink-0 focus-ring" onClick={onClear} tabIndex={visible ? 0 : -1}>
            Clear
          </button>
          <button type="button" className="btn btn-primary shrink-0 focus-ring" onClick={onOpenCart} tabIndex={visible ? 0 : -1}>
            <span className="sm:hidden">Checkout</span>
            <span className="hidden sm:inline">Open Swanson cart</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
});
