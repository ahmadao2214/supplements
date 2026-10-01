import { useState, useMemo } from "react";
import { supplements, conditions } from "../data/supplements";
import { readParam } from "./useUrlState";
import { filterSupplements, sortSupplements, type SortKey, type SortDir } from "../lib/supplement-query";

export function useSupplementFilters() {
  const [search, setSearch] = useState(() => readParam("q", ""));
  const [categoryFilter, setCategoryFilter] = useState(() => readParam("cat", "All"));
  const [conditionFilter, setConditionFilter] = useState(() => readParam("cond", "All"));
  const [adderallFilter, setAdderallFilter] = useState(() => readParam("add", "All"));
  const [timeFilter, setTimeFilter] = useState(() => readParam("time", "All"));
  const [tierFilter, setTierFilter] = useState(() => readParam("tier", "All"));
  const [scheduleFilter, setScheduleFilter] = useState(() => readParam("sched", "All"));
  const [sortKey, setSortKey] = useState<SortKey>(() => readParam("sort", "tier") as SortKey);
  const [sortDir, setSortDir] = useState<SortDir>(() => readParam("dir", "asc") as SortDir);

  const categories = useMemo(
    () => ["All", ...new Set(supplements.map((s) => s.category))],
    []
  );

  const schedules = useMemo(
    () => ["All", ...new Set(supplements.map((s) => s.schedule))],
    []
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const setSort = (key: SortKey) => {
    setSortKey(key);
    setSortDir("asc");
  };

  const activeFilterCount = [categoryFilter, conditionFilter, adderallFilter, timeFilter, scheduleFilter]
    .filter((v) => v !== "All").length;

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setConditionFilter("All");
    setAdderallFilter("All");
    setTimeFilter("All");
    setTierFilter("All");
    setScheduleFilter("All");
  };

  const filtered = useMemo(
    () => sortSupplements(
      filterSupplements({
        search,
        category: categoryFilter,
        condition: conditionFilter,
        adderall: adderallFilter,
        time: timeFilter,
        tier: tierFilter,
        schedule: scheduleFilter,
      }),
      sortKey,
      sortDir
    ),
    [search, categoryFilter, conditionFilter, adderallFilter, timeFilter, tierFilter, scheduleFilter, sortKey, sortDir]
  );

  return {
    search, setSearch,
    categoryFilter, setCategoryFilter,
    conditionFilter, setConditionFilter,
    adderallFilter, setAdderallFilter,
    timeFilter, setTimeFilter,
    tierFilter, setTierFilter,
    scheduleFilter, setScheduleFilter,
    sortKey, sortDir, handleSort, setSort,
    activeFilterCount, resetFilters,
    filtered,
    categories, schedules, conditions,
  };
}
