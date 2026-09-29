import React, { useState } from "react";
import { SearchInput } from "./SearchInput";
import { tierLabels } from "../../lib/constants";
import { SlidersIcon } from "../ui/Icons";
import type { Supplement } from "../../data/supplements";

type SortKey = keyof Supplement;

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "tier", label: "Tier" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "timeOfDay", label: "Time" },
];

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  tierFilter: string;
  setTierFilter: (v: string) => void;
  scheduleFilter: string;
  setScheduleFilter: (v: string) => void;
  conditionFilter: string;
  setConditionFilter: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  adderallFilter: string;
  setAdderallFilter: (v: string) => void;
  timeFilter: string;
  setTimeFilter: (v: string) => void;
  categories: string[];
  schedules: string[];
  conditions: string[];
  activeFilterCount: number;
  onReset: () => void;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  /** Controls shown at the end of the tier chip row (add all, view options). */
  actions?: React.ReactNode;
}

function FilterSelect({ id, label, value, onChange, children }: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="eyebrow block mb-1.5">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {children}
      </select>
    </div>
  );
}

export const FilterBar = React.memo(function FilterBar(props: FilterBarProps) {
  const [showMore, setShowMore] = useState(props.activeFilterCount > 0);

  const filtersToggle = (
    <button
      type="button"
      onClick={() => setShowMore(!showMore)}
      className={`relative h-9 inline-flex items-center gap-1.5 px-2.5 rounded-md text-sm font-medium transition-colors focus-ring ${
        showMore || props.activeFilterCount > 0 ? "text-sage-300 bg-sage-500/15" : "text-ink-muted hover:text-ink hover:bg-surface-700"
      }`}
      aria-expanded={showMore}
      aria-controls="filter-panel"
      aria-label={props.activeFilterCount > 0 ? `Filters, ${props.activeFilterCount} active` : "Filters"}
    >
      <SlidersIcon />
      <span className="hidden sm:inline">Filters</span>
      {props.activeFilterCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-sage-500 text-white text-[0.625rem] font-tabular">
          {props.activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-3">
      <SearchInput value={props.search} onChange={props.setSearch} trailing={filtersToggle} />

      <div className="flex items-center gap-2">
        <div className="flex flex-1 min-w-0 gap-1.5 overflow-x-auto no-scrollbar" role="group" aria-label="Filter by tier">
          {([1, 2, 3] as const).map((t) => (
            <button
              key={t}
              type="button"
              className="chip focus-ring"
              aria-pressed={props.tierFilter === String(t)}
              onClick={() => props.setTierFilter(props.tierFilter === String(t) ? "All" : String(t))}
            >
              {tierLabels[t]}
            </button>
          ))}
        </div>
        {props.actions}
      </div>

      {showMore && (
        <div id="filter-panel" className="panel p-4 animate-slide-up">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <FilterSelect id="f-sort" label="Sort by" value={sortOptions.some((o) => o.key === props.sortKey) ? props.sortKey : "tier"} onChange={(v) => props.onSort(v as SortKey)}>
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </FilterSelect>
            <FilterSelect id="f-schedule" label="Schedule" value={props.scheduleFilter} onChange={props.setScheduleFilter}>
              <option value="All">Any</option>
              {props.schedules.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </FilterSelect>
            <FilterSelect id="f-adderall" label="With Adderall" value={props.adderallFilter} onChange={props.setAdderallFilter}>
              <option value="All">Any</option>
              <option value="Safe">Safe</option>
              <option value="Caution">Caution</option>
              <option value="Avoid">Avoid / separate</option>
            </FilterSelect>
            <FilterSelect id="f-time" label="Time of day" value={props.timeFilter} onChange={props.setTimeFilter}>
              <option value="All">Any</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Flexible">Flexible</option>
            </FilterSelect>
            <FilterSelect id="f-condition" label="Condition" value={props.conditionFilter} onChange={props.setConditionFilter}>
              <option value="All">Any</option>
              {props.conditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FilterSelect>
            <FilterSelect id="f-category" label="Category" value={props.categoryFilter} onChange={props.setCategoryFilter}>
              {props.categories.map((c) => (
                <option key={c} value={c}>{c === "All" ? "Any" : c}</option>
              ))}
            </FilterSelect>
          </div>
          {props.activeFilterCount > 0 && (
            <button type="button" onClick={props.onReset} className="btn btn-ghost btn-sm mt-3 -ml-2 focus-ring">
              Clear all filters
            </button>
          )}
        </div>
      )}

    </div>
  );
});
