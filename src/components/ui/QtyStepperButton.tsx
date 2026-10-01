import React from "react";

interface QtyStepperButtonProps {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
  name: string;
  size?: "sm" | "md";
}

export const QtyStepperButton = React.memo(function QtyStepperButton({
  qty,
  onDecrease,
  onIncrease,
  name,
  size = "md",
}: QtyStepperButtonProps) {
  const dim = size === "sm" ? "w-8 h-8" : "w-11 h-11 md:w-10 md:h-10";
  const btn = `${dim} inline-flex items-center justify-center text-ink-muted text-base hover:bg-surface-600 hover:text-ink transition-colors focus-ring`;
  return (
    <div className="inline-flex items-center bg-surface-700 border border-surface-border-strong rounded-[var(--radius-md)] overflow-hidden">
      <button type="button" className={btn} onClick={onDecrease} aria-label={`Decrease ${name} quantity`}>
        −
      </button>
      <span className="min-w-6 text-center text-sm font-semibold text-ink font-mono font-tabular" aria-live="polite">
        {qty}
      </span>
      <button type="button" className={btn} onClick={onIncrease} aria-label={`Increase ${name} quantity`}>
        +
      </button>
    </div>
  );
});
