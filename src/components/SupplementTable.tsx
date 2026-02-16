import { useState, useMemo, useEffect, useCallback } from "react";
import { supplements, conditions, type Supplement } from "../data/supplements";

type SortKey = keyof Supplement;
type SortDir = "asc" | "desc";

// --- Shopify cart utilities ---
function extractVariantId(purchaseUrl: string): string | null {
  const match = purchaseUrl.match(/variant=(\d+)/);
  return match ? match[1] : null;
}

function buildCartUrl(
  cartItems: Map<number, number>,
  allSupplements: Supplement[]
): string {
  const parts: string[] = [];
  for (const [suppId, qty] of cartItems) {
    const supp = allSupplements.find((s) => s.id === suppId);
    if (!supp?.purchaseUrl) continue;
    const variantId = extractVariantId(supp.purchaseUrl);
    if (variantId) parts.push(`${variantId}:${qty}`);
  }
  return `https://www.swansonvitamins.com/cart/${parts.join(",")}`;
}

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

function readCart(): Map<number, number> {
  const raw = getParams().get("cart");
  if (!raw) return new Map();
  const map = new Map<number, number>();
  for (const pair of raw.split(",")) {
    const [idStr, qtyStr] = pair.split(":");
    const id = Number(idStr);
    const qty = Number(qtyStr) || 1;
    if (id) map.set(id, qty);
  }
  return map;
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
  const [cartItems, setCartItems] = useState<Map<number, number>>(readCart);

  // Cart helpers
  const toggleCartItem = useCallback((id: number) => {
    setCartItems((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return next;
    });
  }, []);

  const setCartQty = useCallback((id: number, qty: number) => {
    setCartItems((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(id);
      } else {
        next.set(id, qty);
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCartItems(new Map()), []);

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
    if (cartItems.size > 0) {
      const cartStr = [...cartItems]
        .map(([id, qty]) => `${id}:${qty}`)
        .join(",");
      p.set("cart", cartStr);
    }
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
    cartItems,
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

  // Cart derived state
  const filteredPurchasable = useMemo(
    () => filtered.filter((s) => s.purchaseUrl),
    [filtered]
  );

  const selectAllState = useMemo(() => {
    if (filteredPurchasable.length === 0) return "none" as const;
    const selectedCount = filteredPurchasable.filter((s) =>
      cartItems.has(s.id)
    ).length;
    if (selectedCount === 0) return "none" as const;
    if (selectedCount === filteredPurchasable.length) return "all" as const;
    return "some" as const;
  }, [filteredPurchasable, cartItems]);

  const handleSelectAll = useCallback(() => {
    if (selectAllState === "all") {
      // Deselect all filtered purchasable
      setCartItems((prev) => {
        const next = new Map(prev);
        for (const s of filteredPurchasable) next.delete(s.id);
        return next;
      });
    } else {
      // Select all filtered purchasable (qty 1 if not already in cart)
      setCartItems((prev) => {
        const next = new Map(prev);
        for (const s of filteredPurchasable) {
          if (!next.has(s.id)) next.set(s.id, 1);
        }
        return next;
      });
    }
  }, [selectAllState, filteredPurchasable]);

  const cartTotal = useMemo(() => {
    let count = 0;
    for (const qty of cartItems.values()) count += qty;
    return count;
  }, [cartItems]);

  const openSwansonCart = useCallback(() => {
    if (cartItems.size === 0) return;
    const url = buildCartUrl(cartItems, supplements);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [cartItems]);

  const getAdderallBadge = (val: string) => {
    const lower = val.toLowerCase();
    if (lower.includes("yes"))
      return <span className="badge badge-safe">✅ Safe</span>;
    if (lower.includes("cautious") || lower.includes("caution"))
      return <span className="badge badge-caution">⚠️ Caution</span>;
    return <span className="badge badge-avoid">🚫 Avoid/Separate</span>;
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
      return <span className="badge badge-schedule-off">🔄 {schedule}</span>;
    if (schedule.includes("Adderall Days Only"))
      return <span className="badge badge-schedule-adderall">💊 {schedule}</span>;
    if (schedule.includes("Evening on Adderall"))
      return <span className="badge badge-schedule-evening">🌙 {schedule}</span>;
    return <span className="badge badge-schedule-daily">📅 {schedule}</span>;
  };

  const formatTimeOfDay = (val: string) => {
    const lower = val.toLowerCase();
    if (lower.includes("morning") || lower.startsWith("afternoon"))
      return <span className="badge badge-time-day">☀️ {val}</span>;
    if (lower.includes("evening") || lower.includes("bed"))
      return <span className="badge badge-time-night">🌙 {val}</span>;
    return <>{val}</>;
  };

  const formatWithMeals = (val: string) => {
    const lower = val.toLowerCase();
    if (lower.includes("fat"))
      return <span className="badge badge-meal-fat">🥑 {val}</span>;
    if (lower.startsWith("yes") || lower.includes("with breakfast"))
      return <span className="badge badge-meal-yes">🍽️ {val}</span>;
    if (lower.includes("without") || lower.includes("empty stomach") || lower.includes("before food"))
      return <span className="badge badge-meal-no">🚫🍽️ {val}</span>;
    if (lower === "optional" || lower === "no preference")
      return <span className="badge badge-meal-optional">➖ {val}</span>;
    return <>{val}</>;
  };

  const formatFrequency = (val: string) => {
    if (val.startsWith("1–3")) return <>①②③ {val}</>;
    if (val.startsWith("1–2")) return <>①② {val}</>;
    if (val.startsWith("1x")) return <>① {val}</>;
    return <>{val}</>;
  };

  const renderCell = (col: { key: string }, s: Supplement) => {
    if (col.key === "withAdderall") return getAdderallBadge(s.withAdderall);
    if (col.key === "tier") return getTierBadge(s.tier);
    if (col.key === "schedule") return getScheduleBadge(s.schedule);
    if (col.key === "timeOfDay") return formatTimeOfDay(s.timeOfDay);
    if (col.key === "withMeals") return formatWithMeals(s.withMeals);
    if (col.key === "frequency") return formatFrequency(s.frequency);
    if (col.key === "purchaseUrl") {
      if (!s.purchaseUrl) {
        return <span className="buy-pending">--</span>;
      }
      const inCart = cartItems.has(s.id);
      const qty = cartItems.get(s.id) ?? 1;
      return (
        <div className="cart-cell" onClick={(e) => e.stopPropagation()}>
          <label className="cart-checkbox-label">
            <input
              type="checkbox"
              checked={inCart}
              onChange={() => toggleCartItem(s.id)}
              className="cart-checkbox"
              aria-label={`Add ${s.name} to cart`}
            />
          </label>
          {inCart && (
            <div className="qty-stepper">
              <button
                className="qty-btn"
                onClick={() => setCartQty(s.id, qty - 1)}
                aria-label={`Decrease ${s.name} quantity`}
              >
                −
              </button>
              <span className="qty-value">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => setCartQty(s.id, qty + 1)}
                aria-label={`Increase ${s.name} quantity`}
              >
                +
              </button>
            </div>
          )}
        </div>
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
                .map((col) =>
                  col.key === "purchaseUrl" ? (
                    <th key={col.key} className="cart-header">
                      <label className="cart-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectAllState === "all"}
                          ref={(el) => {
                            if (el) el.indeterminate = selectAllState === "some";
                          }}
                          onChange={handleSelectAll}
                          className="cart-checkbox"
                          aria-label="Select all purchasable supplements"
                        />
                      </label>
                      <span>Cart</span>
                    </th>
                  ) : (
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
                  )
                )}
              <th className="expand-col">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <>
                <tr
                  key={s.id}
                  className={`tier-row tier-row-${s.tier}${cartItems.has(s.id) ? " cart-selected" : ""}`}
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
                      aria-label={expandedRow === s.id ? `Collapse ${s.name} details` : `Expand ${s.name} details`}
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
                            <strong>Frequency:</strong> {formatFrequency(s.frequency)}
                          </div>
                          <div>
                            <strong>Time of Day:</strong> {formatTimeOfDay(s.timeOfDay)}
                          </div>
                          <div>
                            <strong>With Meals:</strong> {formatWithMeals(s.withMeals)}
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

      {/* Cart Summary Bar */}
      <div
        className={`cart-bar${cartItems.size > 0 ? " cart-bar-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="cart-bar-inner">
          <div className="cart-bar-info">
            <span className="cart-bar-count">
              {cartItems.size} {cartItems.size === 1 ? "item" : "items"}
              {cartTotal !== cartItems.size && ` (${cartTotal} total)`}
            </span>
            <span className="cart-bar-names">
              {[...cartItems]
                .map(([id, qty]) => {
                  const s = supplements.find((s) => s.id === id);
                  if (!s) return null;
                  const shortName = s.name.replace(/\s*\(.*\)/, "");
                  return qty > 1 ? `${shortName} x${qty}` : shortName;
                })
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
          <div className="cart-bar-actions">
            <button className="cart-bar-clear" onClick={clearCart}>
              Clear
            </button>
            <button className="cart-bar-open" onClick={openSwansonCart}>
              Open Swanson Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
