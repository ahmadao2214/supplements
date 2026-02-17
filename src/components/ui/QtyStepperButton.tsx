import React from "react";

interface QtyStepperButtonProps {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
  name: string;
}

export const QtyStepperButton = React.memo(function QtyStepperButton({
  qty,
  onDecrease,
  onIncrease,
  name,
}: QtyStepperButtonProps) {
  return (
    <div className="inline-flex items-center border border-surface-border rounded-lg overflow-hidden">
      <button
        className="w-6 h-6 inline-flex items-center justify-center bg-surface-700 text-sage-400/60 text-sm hover:bg-surface-600 hover:text-sage-300 transition-colors focus-ring"
        onClick={onDecrease}
        aria-label={`Decrease ${name} quantity`}
      >
        −
      </button>
      <span className="w-6 text-center text-xs font-bold text-cyan-400 bg-surface-900 leading-6 font-mono font-tabular">
        {qty}
      </span>
      <button
        className="w-6 h-6 inline-flex items-center justify-center bg-surface-700 text-sage-400/60 text-sm hover:bg-surface-600 hover:text-sage-300 transition-colors focus-ring"
        onClick={onIncrease}
        aria-label={`Increase ${name} quantity`}
      >
        +
      </button>
    </div>
  );
});
