import React, { useState } from "react";
import { SearchInput } from "./SearchInput";

const selectCls = "px-3 py-2 bg-surface-700 border border-surface-border rounded-xl text-sage-200 text-sm cursor-pointer outline-none hover:border-sage-600/60 focus:border-cyan-400 transition-colors font-display";

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
}

export const FilterBar = React.memo(function FilterBar(props: FilterBarProps) {
  const hasSecondary = props.categoryFilter !== "All" || props.adderallFilter !== "All" ||
    props.timeFilter !== "All" || props.conditionFilter !== "All";
  const [showMore, setShowMore] = useState(hasSecondary);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap items-center">
        <SearchInput value={props.search} onChange={props.setSearch} />
        <select value={props.tierFilter} onChange={(e) => props.setTierFilter(e.target.value)} className={selectCls} aria-label="Filter by tier">
          <option value="All">All Tiers</option>
          <option value="1">Tier 1 — Core</option>
          <option value="2">Tier 2 — Add-On</option>
          <option value="3">Tier 3 — Optional</option>
        </select>
        <select value={props.scheduleFilter} onChange={(e) => props.setScheduleFilter(e.target.value)} className={selectCls} aria-label="Filter by schedule">
          <option value="All">All Schedules</option>
          {props.schedules.filter((s) => s !== "All").map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="px-3 py-2 text-sm text-sage-400/60 hover:text-sage-300 font-display transition-colors"
        >
          {showMore ? "Less filters" : "More filters"}
        </button>
      </div>
      {showMore && (
        <div className="flex gap-2 flex-wrap animate-fade-in">
          <select value={props.categoryFilter} onChange={(e) => props.setCategoryFilter(e.target.value)} className={selectCls} aria-label="Filter by category">
            {props.categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>
          <select value={props.adderallFilter} onChange={(e) => props.setAdderallFilter(e.target.value)} className={selectCls} aria-label="Filter by Adderall compatibility">
            <option value="All">Adderall: All</option>
            <option value="Safe">Safe</option>
            <option value="Caution">Caution</option>
            <option value="Avoid">Avoid / Separate</option>
          </select>
          <select value={props.timeFilter} onChange={(e) => props.setTimeFilter(e.target.value)} className={selectCls} aria-label="Filter by time of day">
            <option value="All">All Times</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Bed">Before Bed</option>
          </select>
          <select value={props.conditionFilter} onChange={(e) => props.setConditionFilter(e.target.value)} className={selectCls} aria-label="Filter by condition">
            <option value="All">All Conditions</option>
            {props.conditions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
});
