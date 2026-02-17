import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { supplements } from "../../data/supplements";
import { DEFAULT_COLS } from "../../lib/constants";
import { useSupplementFilters } from "../../hooks/useSupplementFilters";
import { useCart } from "../../hooks/useCart";
import { useColumns } from "../../hooks/useColumns";
import { syncToUrl, readParam } from "../../hooks/useUrlState";
import { TierLegend } from "./TierLegend";
import { FilterBar } from "./FilterBar";
import { ColumnToggles } from "./ColumnToggles";
import { ResultsCount } from "./ResultsCount";
import { DataTable } from "./DataTable";
import { CartBar } from "./CartBar";
import { ViewToggle } from "./ViewToggle";

const CardGrid = lazy(() => import("./CardGrid").then((m) => ({ default: m.CardGrid })));

type ViewMode = "table" | "grid";

interface Props {
  prices?: Record<number, number>;
}

export default function SupplementDatabase({ prices = {} }: Props) {
  const [view, setView] = useState<ViewMode>(() => readParam("view", "table") as ViewMode);
  const filters = useSupplementFilters();
  const { visibleColumns, toggleColumn } = useColumns();
  const cart = useCart(filters.filtered, prices);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const onToggleExpand = useCallback((id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  // Sync all state to URL
  useEffect(() => {
    const colStr = [...visibleColumns].sort().join(",");
    const defaultStr = [...DEFAULT_COLS].sort().join(",");

    syncToUrl({
      q: filters.search || undefined,
      cat: filters.categoryFilter !== "All" ? filters.categoryFilter : undefined,
      cond: filters.conditionFilter !== "All" ? filters.conditionFilter : undefined,
      add: filters.adderallFilter !== "All" ? filters.adderallFilter : undefined,
      time: filters.timeFilter !== "All" ? filters.timeFilter : undefined,
      tier: filters.tierFilter !== "All" ? filters.tierFilter : undefined,
      sched: filters.scheduleFilter !== "All" ? filters.scheduleFilter : undefined,
      sort: filters.sortKey !== "tier" ? filters.sortKey : undefined,
      dir: filters.sortDir !== "asc" ? filters.sortDir : undefined,
      cols: colStr !== defaultStr ? colStr : undefined,
      view: view !== "table" ? view : undefined,
      cart: cart.cartItems.size > 0
        ? [...cart.cartItems].map(([id, qty]) => `${id}:${qty}`).join(",")
        : undefined,
    });
  }, [
    filters.search, filters.categoryFilter, filters.conditionFilter,
    filters.adderallFilter, filters.timeFilter, filters.tierFilter,
    filters.scheduleFilter, filters.sortKey, filters.sortDir,
    visibleColumns, cart.cartItems, view,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-8">
      <TierLegend />

      <div className="mb-4">
        <FilterBar
          search={filters.search}
          setSearch={filters.setSearch}
          tierFilter={filters.tierFilter}
          setTierFilter={filters.setTierFilter}
          scheduleFilter={filters.scheduleFilter}
          setScheduleFilter={filters.setScheduleFilter}
          conditionFilter={filters.conditionFilter}
          setConditionFilter={filters.setConditionFilter}
          categoryFilter={filters.categoryFilter}
          setCategoryFilter={filters.setCategoryFilter}
          adderallFilter={filters.adderallFilter}
          setAdderallFilter={filters.setAdderallFilter}
          timeFilter={filters.timeFilter}
          setTimeFilter={filters.setTimeFilter}
          categories={filters.categories}
          schedules={filters.schedules}
          conditions={filters.conditions}
        />
        <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
          {view === "table" && (
            <ColumnToggles visibleColumns={visibleColumns} toggleColumn={toggleColumn} />
          )}
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      <ResultsCount filteredCount={filters.filtered.length} tierFilter={filters.tierFilter} />

      {view === "table" ? (
        <>
          <DataTable
            filtered={filters.filtered}
            visibleColumns={visibleColumns}
            sortKey={filters.sortKey}
            sortDir={filters.sortDir}
            onSort={filters.handleSort}
            expandedRow={expandedRow}
            onToggleExpand={onToggleExpand}
            cartItems={cart.cartItems}
            prices={prices}
            onCartToggle={cart.toggleCartItem}
            onCartSetQty={cart.setCartQty}
            selectAllState={cart.selectAllState}
            onSelectAll={cart.handleSelectAll}
          />
          {filters.filtered.length === 0 && (
            <div className="text-center py-8 text-sage-400/50 font-body">
              No supplements match your filters. Try adjusting your search criteria.
            </div>
          )}
        </>
      ) : (
        <Suspense fallback={<div className="text-center py-8 text-sage-400/50 font-display">Loading grid...</div>}>
          <CardGrid
            filtered={filters.filtered}
            cartItems={cart.cartItems}
            onCartToggle={cart.toggleCartItem}
          />
        </Suspense>
      )}

      <CartBar
        itemCount={cart.cartItems.size}
        cartTotal={cart.cartTotal}
        cartSubtotal={cart.cartSubtotal}
        cartNames={cart.cartNames}
        onClear={cart.clearCart}
        onOpenCart={cart.openSwansonCart}
      />
    </div>
  );
}
