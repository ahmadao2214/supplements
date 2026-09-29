import React from "react";

type ViewMode = "table" | "grid";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const btnBase = "inline-flex items-center gap-1.5 h-8 px-3 text-[0.8125rem] font-medium rounded-md transition-colors focus-ring";
const active = "bg-surface-600 text-ink shadow-card";
const inactive = "text-ink-muted hover:text-ink";

export const ViewToggle = React.memo(function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex shrink-0 gap-0.5 p-0.5 bg-surface-800 border border-surface-border rounded-[var(--radius-md)]" role="radiogroup" aria-label="View mode">
      <button
        type="button"
        className={`${btnBase} ${view === "table" ? active : inactive}`}
        onClick={() => onChange("table")}
        role="radio"
        aria-checked={view === "table"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        <span className="md:hidden max-[374px]:sr-only">List</span>
        <span className="hidden md:inline">Table</span>
      </button>
      <button
        type="button"
        className={`${btnBase} ${view === "grid" ? active : inactive}`}
        onClick={() => onChange("grid")}
        role="radio"
        aria-checked={view === "grid"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
        <span className="max-[374px]:sr-only">Grid</span>
      </button>
    </div>
  );
});
