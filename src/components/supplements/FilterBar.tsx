import React, { useState } from "react";
import { SearchInput } from "./SearchInput";
import { tierLabels } from "../../lib/constants";

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

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <SearchInput value={props.search} onChange={props.setSearch} />
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={`btn shrink-0 focus-ring ${showMore || props.activeFilterCount > 0 ? "btn-selected" : "btn-secondary"}`}
          aria-expanded={showMore}
          aria-controls="filter-panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          <span>Filters</span>
          {props.activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-sage-500 text-white text-[0.6875rem] font-tabular">
              {props.activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showMore && (
        <div id="filter-panel" className="panel p-4 animate-slide-up">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Bed">Before bed</option>
            </FilterSelect>
            <FilterSelect id="f-condition" label="Condition" value={props.conditionFilter} onChange={props.setConditionFilter}>
              <option value="All">Any</option>
              {props.conditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FilterSelect>
            <div className="col-span-2 lg:col-span-1">
              <FilterSelect id="f-category" label="Category" value={props.categoryFilter} onChange={props.setCategoryFilter}>
                {props.categories.map((c) => (
                  <option key={c} value={c}>{c === "All" ? "Any" : c}</option>
                ))}
              </FilterSelect>
            </div>
          </div>
          {props.activeFilterCount > 0 && (
            <button type="button" onClick={props.onReset} className="btn btn-ghost btn-sm mt-3 -ml-2 focus-ring">
              Clear all filters
            </button>
          )}
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by priority tier">
          <button type="button" className="chip focus-ring" aria-pressed={props.tierFilter === "All"} onClick={() => props.setTierFilter("All")}>
            All
          </button>
          {([1, 2, 3] as const).map((t) => (
            <button
              key={t}
              type="button"
              className="chip focus-ring"
              aria-pressed={props.tierFilter === String(t)}
              onClick={() => props.setTierFilter(props.tierFilter === String(t) ? "All" : String(t))}
            >
              <span className={`w-2 h-2 rounded-full tier-bar-${t}`} aria-hidden="true" />
              {tierLabels[t]}
            </button>
          ))}
      </div>
    </div>
  );
});
