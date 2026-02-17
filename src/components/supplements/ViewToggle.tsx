import React from "react";

type ViewMode = "table" | "grid";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export const ViewToggle = React.memo(function ViewToggle({ view, onChange }: ViewToggleProps) {
  const btnBase = "px-3 py-1.5 text-sm font-display font-semibold rounded-xl transition-colors focus-ring";
  const active = "bg-sage-600 text-white";
  const inactive = "bg-surface-700 text-sage-400/60 hover:text-sage-300 hover:bg-surface-600";

  return (
    <div className="inline-flex gap-1 p-1 bg-surface-800 border border-surface-border rounded-xl" role="radiogroup" aria-label="View mode">
      <button
        className={`${btnBase} ${view === "table" ? active : inactive}`}
        onClick={() => onChange("table")}
        role="radio"
        aria-checked={view === "table"}
      >
        <span className="mr-1">☰</span> Table
      </button>
      <button
        className={`${btnBase} ${view === "grid" ? active : inactive}`}
        onClick={() => onChange("grid")}
        role="radio"
        aria-checked={view === "grid"}
      >
        <span className="mr-1">▦</span> Grid
      </button>
    </div>
  );
});
