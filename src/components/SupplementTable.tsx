import { useState, useMemo } from "react";
import { supplements, conditions, type Supplement } from "../data/supplements";

type SortKey = keyof Supplement;
type SortDir = "asc" | "desc";

export default function SupplementTable() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [adderallFilter, setAdderallFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "name",
      "category",
      "treats",
      "dosage",
      "frequency",
      "timeOfDay",
      "withMeals",
      "withAdderall",
    ])
  );

  const allColumns: { key: string; label: string }[] = [
    { key: "name", label: "Supplement" },
    { key: "category", label: "Category" },
    { key: "treats", label: "Treats" },
    { key: "dosage", label: "Dosage" },
    { key: "frequency", label: "Frequency" },
    { key: "timeOfDay", label: "Time of Day" },
    { key: "withMeals", label: "With Meals?" },
    { key: "withAdderall", label: "With Adderall?" },
    { key: "benefits", label: "Benefits" },
    { key: "sideEffects", label: "Side Effects" },
    { key: "notes", label: "Notes" },
  ];

  const categories = useMemo(
    () => ["All", ...new Set(supplements.map((s) => s.category))],
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
          s.category.toLowerCase().includes(q);
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
        return (
          matchesSearch &&
          matchesCategory &&
          matchesCondition &&
          matchesAdderall &&
          matchesTime
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

  return (
    <div className="table-container">
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
                <tr key={s.id} onClick={() => setExpandedRow(expandedRow === s.id ? null : s.id)}>
                  {allColumns
                    .filter((col) => visibleColumns.has(col.key))
                    .map((col) => (
                      <td key={col.key}>
                        {col.key === "withAdderall"
                          ? getAdderallBadge(s[col.key as keyof Supplement] as string)
                          : (s[col.key as keyof Supplement] as string)}
                      </td>
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
                        <h3>{s.name}</h3>
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
