import { useState, useMemo } from "react";
import { supplements, conditions, type Supplement } from "../data/supplements";
import { readParam } from "./useUrlState";

type SortKey = keyof Supplement;
type SortDir = "asc" | "desc";

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

  const filtered = useMemo(() => {
    return supplements
      .filter((s) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.treats.toLowerCase().includes(q) ||
          s.benefits.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tierReason.toLowerCase().includes(q);
        const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
        const matchesCondition =
          conditionFilter === "All" || s.treats.toLowerCase().includes(conditionFilter.toLowerCase());
        const matchesAdderall =
          adderallFilter === "All" ||
          (adderallFilter === "Safe" && s.withAdderall.toLowerCase().includes("yes")) ||
          (adderallFilter === "Caution" && s.withAdderall.toLowerCase().includes("cautious")) ||
          (adderallFilter === "Avoid" &&
            (s.withAdderall.toLowerCase().includes("no") || s.withAdderall.toLowerCase().includes("separate")));
        const matchesTime = timeFilter === "All" || s.timeOfDay.toLowerCase().includes(timeFilter.toLowerCase());
        const matchesTier = tierFilter === "All" || s.tier === Number(tierFilter);
        const matchesSchedule = scheduleFilter === "All" || s.schedule === scheduleFilter;
        return matchesSearch && matchesCategory && matchesCondition && matchesAdderall && matchesTime && matchesTier && matchesSchedule;
      })
      .sort((a, b) => {
        const aVal = String(a[sortKey]).toLowerCase();
        const bVal = String(b[sortKey]).toLowerCase();
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [search, categoryFilter, conditionFilter, adderallFilter, timeFilter, tierFilter, scheduleFilter, sortKey, sortDir]);

  return {
    search, setSearch,
    categoryFilter, setCategoryFilter,
    conditionFilter, setConditionFilter,
    adderallFilter, setAdderallFilter,
    timeFilter, setTimeFilter,
    tierFilter, setTierFilter,
    scheduleFilter, setScheduleFilter,
    sortKey, sortDir, handleSort,
    filtered,
    categories, schedules, conditions,
  };
}
