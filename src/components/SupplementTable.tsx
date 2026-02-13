import { useState, useMemo, useEffect, useCallback } from "react";
import { supplements, conditions, type Supplement } from "../data/supplements";

type SortKey = keyof Supplement;
type SortDir = "asc" | "desc";

const tierLabels: Record<number, string> = {
  1: "Core",
  2: "Add-On",
  3: "Optional",
};

const tierDescriptions: Record<number, string> = {
  1: "Start here — highest impact for ADHD + Adderall",
  2: "Strong additions once core stack is stable",
  3: "Situational — add based on individual needs",
};

// --- URL query param helpers ---
const isBrowser = typeof window !== "undefined";

function getParams(): URLSearchParams {
  if (!isBrowser) return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function readParam(key: string, fallback: string): string {
  return getParams().get(key) ?? fallback;
}

function readColumns(fallback: string[]): Set<string> {
  const raw = getParams().get("cols");
  if (raw) return new Set(raw.split(",").filter(Boolean));
  return new Set(fallback);
}

const DEFAULT_COLS = [
  "tier",
  "name",
  "treats",
  "dosage",
  "timeOfDay",
  "withMeals",
  "withAdderall",
  "schedule",
];

export default function SupplementTable() {
  const [search, setSearch] = useState(() => readParam("q", ""));
  const [categoryFilter, setCategoryFilter] = useState(() =>
    readParam("cat", "All")
  );
  const [conditionFilter, setConditionFilter] = useState(() =>
    readParam("cond", "All")
  );
  const [adderallFilter, setAdderallFilter] = useState(() =>
    readParam("add", "All")
  );
  const [timeFilter, setTimeFilter] = useState(() =>
    readParam("time", "All")
  );
  const [tierFilter, setTierFilter] = useState(() =>
    readParam("tier", "All")
  );
  const [scheduleFilter, setScheduleFilter] = useState(() =>
    readParam("sched", "All")
  );
  const [sortKey, setSortKey] = useState<SortKey>(
    () => readParam("sort", "tier") as SortKey
  );
  const [sortDir, setSortDir] = useState<SortDir>(
    () => readParam("dir", "asc") as SortDir
  );
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() =>
    readColumns(DEFAULT_COLS)
  );

  // Sync state -> URL
  const syncUrl = useCallback(() => {
    if (!isBrowser) return;
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (categoryFilter !== "All") p.set("cat", categoryFilter);
    if (conditionFilter !== "All") p.set("cond", conditionFilter);
    if (adderallFilter !== "All") p.set("add", adderallFilter);
    if (timeFilter !== "All") p.set("time", timeFilter);
    if (tierFilter !== "All") p.set("tier", tierFilter);
    if (scheduleFilter !== "All") p.set("sched", scheduleFilter);
    if (sortKey !== "tier") p.set("sort", sortKey);
    if (sortDir !== "asc") p.set("dir", sortDir);
    const colStr = [...visibleColumns].sort().join(",");
    const defaultStr = [...DEFAULT_COLS].sort().join(",");
    if (colStr !== defaultStr) p.set("cols", colStr);
    const qs = p.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [
    search,
    categoryFilter,
    conditionFilter,
    adderallFilter,
    timeFilter,
    tierFilter,
    scheduleFilter,
    sortKey,
    sortDir,
    visibleColumns,
  ]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  const allColumns: { key: string; label: string }[] = [
    { key: "tier", label: "Priority" },
    { key: "name", label: "Supplement" },
    { key: "category", label: "Category" },
    { key: "treats", label: "Treats" },
    { key: "dosage", label: "Dosage" },
    { key: "frequency", label: "Frequency" },
    { key: "timeOfDay", label: "Time of Day" },
    { key: "withMeals", label: "With Meals?" },
    { key: "withAdderall", label: "With Adderall?" },
    { key: "schedule", label: "Schedule" },
    { key: "benefits", label: "Benefits" },
    { key: "sideEffects", label: "Side Effects" },
    { key: "notes", label: "Notes" },
    { key: "purchaseUrl", label: "Buy" },
  ];

  const categories = useMemo(
    () => ["All", ...new Set(supplements.map((s) => s.category))],
    []
  );

  const schedules = useMemo(
    () => ["All", ...new Set(supplements.map((s) => s.schedule))],
    []
  );

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

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
        const matchesCategory =
          categoryFilter === "All" || s.category === categoryFilter;
        const matchesCondition =
          conditionFilter === "All" ||
          s.treats.toLowerCase().includes(conditionFilter.toLowerCase());
        const matchesAdderall =
          adderallFilter === "All" ||
          (adderallFilter === "Safe" &&
            s.withAdderall.toLowerCase().includes("yes")) ||
          (adderallFilter === "Caution" &&
            s.withAdderall.toLowerCase().includes("cautious")) ||
          (adderallFilter === "Avoid" &&
            (s.withAdderall.toLowerCase().includes("no") ||
              s.withAdderall.toLowerCase().includes("separate")));
        const matchesTime =
          timeFilter === "All" ||
          s.timeOfDay.toLowerCase().includes(timeFilter.toLowerCase());
        const matchesTier =
          tierFilter === "All" || s.tier === Number(tierFilter);
        const matchesSchedule =
          scheduleFilter === "All" || s.schedule === scheduleFilter;
        return (
          matchesSearch &&
          matchesCategory &&
          matchesCondition &&
          matchesAdderall &&
          matchesTime &&
          matchesTier &&
          matchesSchedule
        );
      })
      .sort((a, b) => {
        const aVal = String(a[sortKey]).toLowerCase();
        const bVal = String(b[sortKey]).toLowerCase();
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [
    search,
    categoryFilter,
    conditionFilter,
    adderallFilter,
    timeFilter,
    tierFilter,
    scheduleFilter,
    sortKey,
    sortDir,
  ]);

  const getAdderallBadge = (val: string) => {
    const lower = val.toLowerCase();
    if (lower.includes("yes"))
      return <span className="badge badge-safe">Safe</span>;
    if (lower.includes("cautious") || lower.includes("caution"))
      return <span className="badge badge-caution">Caution</span>;
    return <span className="badge badge-avoid">Avoid/Separate</span>;
  };

  const getTierBadge = (tier: number) => {
    const cls =
      tier === 1
        ? "badge-tier1"
        : tier === 2
          ? "badge-tier2"
          : "badge-tier3";
    return (
      <span className={`badge ${cls}`} title={tierDescriptions[tier]}>
        T{tier} {tierLabels[tier]}
      </span>
    );
  };

  const getScheduleBadge = (schedule: string) => {
    if (schedule.includes("Off Days"))
      return <span className="badge badge-schedule-off">{schedule}</span>;
    if (schedule.includes("Adderall Days Only"))
      return <span className="badge badge-schedule-adderall">{schedule}</span>;
    if (schedule.includes("Evening on Adderall"))
      return <span className="badge badge-schedule-evening">{schedule}</span>;
    return <span className="badge badge-schedule-daily">{schedule}</span>;
  };

  const renderCell = (col: { key: string }, s: Supplement) => {
    if (col.key === "withAdderall") return getAdderallBadge(s.withAdderall);
    if (col.key === "tier") return getTierBadge(s.tier);
    if (col.key === "schedule") return getScheduleBadge(s.schedule);
    if (col.key === "purchaseUrl") {
      return s.purchaseUrl ? (
        <a
          href={s.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="buy-link"
          onClick={(e) => e.stopPropagation()}
        >
          Buy
        </a>
      ) : (
        <span className="buy-pending">--</span>
      );
    }
    return s[col.key as keyof Supplement] as string;
  };

  return (
    <div className="table-container">
      {/* Tier Legend */}
      <div className="tier-legend">
        <div className="tier-legend-item">
          <span className="badge badge-tier1">T1 Core</span>
          <span className="tier-legend-desc">{tierDescriptions[1]}</span>
        </div>
        <div className="tier-legend-item">
          <span className="badge badge-tier2">T2 Add-On</span>
          <span className="tier-legend-desc">{tierDescriptions[2]}</span>
        </div>
        <div className="tier-legend-item">
          <span className="badge badge-tier3">T3 Optional</span>
          <span className="tier-legend-desc">{tierDescriptions[3]}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search supplements, conditions, benefits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="All">All Tiers</option>
            <option value="1">Tier 1 — Core Stack</option>
            <option value="2">Tier 2 — Add-Ons</option>
            <option value="3">Tier 3 — Optional</option>
          </select>
          <select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
          >
            <option value="All">All Schedules</option>
            {schedules
              .filter((s) => s !== "All")
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="All">All Conditions</option>
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
          <select
            value={adderallFilter}
            onChange={(e) => setAdderallFilter(e.target.value)}
          >
            <option value="All">Adderall Compat: All</option>
            <option value="Safe">Safe with Adderall</option>
            <option value="Caution">Use with Caution</option>
            <option value="Avoid">Avoid / Separate</option>
          </select>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="All">All Times</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Bed">Before Bed</option>
          </select>
        </div>

        {/* Column Toggles */}
        <details className="column-toggles">
          <summary>Configure Columns ({visibleColumns.size} visible)</summary>
          <div className="toggle-grid">
            {allColumns.map((col) => (
              <label key={col.key}>
                <input
                  type="checkbox"
                  checked={visibleColumns.has(col.key)}
                  onChange={() => toggleColumn(col.key)}
                />
                {col.label}
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* Results count */}
      <div className="results-count">
        Showing {filtered.length} of {supplements.length} supplements
        {tierFilter !== "All" && (
          <span>
            {" "}
            — Tier {tierFilter}: {tierDescriptions[Number(tierFilter)]}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {allColumns
                .filter((col) => visibleColumns.has(col.key))
                .map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as SortKey)}
                    className={sortKey === col.key ? `sorted-${sortDir}` : ""}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="sort-arrow">
                        {sortDir === "asc" ? " ▲" : " ▼"}
                      </span>
                    )}
                  </th>
                ))}
              <th className="expand-col">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <>
                <tr
                  key={s.id}
                  className={`tier-row tier-row-${s.tier}`}
                  onClick={() =>
                    setExpandedRow(expandedRow === s.id ? null : s.id)
                  }
                >
                  {allColumns
                    .filter((col) => visibleColumns.has(col.key))
                    .map((col) => (
                      <td key={col.key}>{renderCell(col, s)}</td>
                    ))}
                  <td className="expand-col">
                    <button
                      className="expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRow(expandedRow === s.id ? null : s.id);
                      }}
                    >
                      {expandedRow === s.id ? "−" : "+"}
                    </button>
                  </td>
                </tr>
                {expandedRow === s.id && (
                  <tr key={`${s.id}-detail`} className="detail-row">
                    <td
                      colSpan={
                        allColumns.filter((col) => visibleColumns.has(col.key))
                          .length + 1
                      }
                    >
                      <div className="detail-card">
                        <div className="detail-header">
                          <h3>{s.name}</h3>
                          {getTierBadge(s.tier)}
                          {getScheduleBadge(s.schedule)}
                          {s.purchaseUrl && (
                            <a
                              href={s.purchaseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="buy-link"
                            >
                              Buy on Swanson
                            </a>
                          )}
                        </div>
                        <div className="tier-reason">
                          <strong>Why this tier:</strong> {s.tierReason}
                        </div>
                        <div className="detail-grid">
                          <div>
                            <strong>Category:</strong> {s.category}
                          </div>
                          <div>
                            <strong>Treats:</strong> {s.treats}
                          </div>
                          <div>
                            <strong>Dosage:</strong> {s.dosage}
                          </div>
                          <div>
                            <strong>Frequency:</strong> {s.frequency}
                          </div>
                          <div>
                            <strong>Time of Day:</strong> {s.timeOfDay}
                          </div>
                          <div>
                            <strong>With Meals:</strong> {s.withMeals}
                          </div>
                          <div>
                            <strong>With Adderall:</strong>{" "}
                            {getAdderallBadge(s.withAdderall)} {s.withAdderall}
                          </div>
                          <div>
                            <strong>Schedule:</strong>{" "}
                            {getScheduleBadge(s.schedule)}
                          </div>
                          <div className="full-width">
                            <strong>Benefits:</strong> {s.benefits}
                          </div>
                          <div className="full-width">
                            <strong>Side Effects:</strong> {s.sideEffects}
                          </div>
                          <div className="full-width">
                            <strong>Notes:</strong> {s.notes}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          No supplements match your filters. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
}
