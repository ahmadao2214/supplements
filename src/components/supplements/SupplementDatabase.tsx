import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { supplements } from "../../data/supplements";
import { DEFAULT_COLS } from "../../lib/constants";
import { useSupplementFilters } from "../../hooks/useSupplementFilters";
import { useCart } from "../../hooks/useCart";
import { useColumns } from "../../hooks/useColumns";
import { syncToUrl, readParam } from "../../hooks/useUrlState";
import { FilterBar } from "./FilterBar";
import { ColumnToggles } from "./ColumnToggles";
import { ResultsCount } from "./ResultsCount";
import { DataTable } from "./DataTable";
import { CartBar } from "./CartBar";
import { ViewToggle } from "./ViewToggle";
import { MobileList } from "./MobileList";
import { CartPlusIcon, CartCheckIcon } from "../ui/Icons";
import { IconLegend } from "../ui/IconLegend";

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

  const empty = filters.filtered.length === 0;
  const allInCart = cart.selectAllState === "all";
  const canAddAll = filters.filtered.some((x) => x.purchaseUrl);

  const actions = (
    <div className="flex items-center gap-2 shrink-0">
      {canAddAll && (
        <button
          type="button"
          className={`w-11 h-9 inline-flex items-center justify-center rounded-[var(--radius-md)] border transition-colors focus-ring ${
            allInCart
              ? "bg-sage-500/15 border-sage-400/45 text-sage-300"
              : "bg-surface-800 border-surface-border-strong text-ink-soft hover:text-ink hover:border-surface-500"
          }`}
          onClick={cart.handleSelectAll}
          aria-pressed={allInCart}
          aria-label={allInCart ? "Remove all shown supplements from cart" : "Add all shown supplements to cart"}
          title={allInCart ? "Remove all from cart" : "Add all to cart"}
        >
          {allInCart ? <CartCheckIcon size={20} /> : <CartPlusIcon size={20} />}
        </button>
      )}
      <div className="hidden md:flex items-center gap-2">
        {view === "table" && <ColumnToggles visibleColumns={visibleColumns} toggleColumn={toggleColumn} />}
        <ViewToggle view={view} onChange={setView} />
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${cart.cartItems.size > 0 ? "pb-32" : "pb-12"}`}>
      {/* Controls stay pinned on phones so search and tiers are always a thumb away */}
      <div className="max-md:sticky max-md:top-0 z-30 -mx-4 px-4 py-3 bg-surface-900/90 backdrop-blur-md md:mx-0 md:px-0 md:pt-0 md:pb-5 md:bg-transparent md:backdrop-blur-none">
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
          activeFilterCount={filters.activeFilterCount}
          onReset={filters.resetFilters}
          sortKey={filters.sortKey}
          onSort={filters.setSort}
          actions={actions}
        />
      </div>

      {!empty && filters.filtered.length !== supplements.length && (
        <ResultsCount filteredCount={filters.filtered.length} onReset={filters.resetFilters} />
      )}

      {empty ? (
        <div className="panel px-6 py-12 text-center">
          <p className="font-serif text-lg text-ink mb-1">No matches</p>
          <p className="text-sm text-ink-muted mb-4">Try a different search or loosen your filters.</p>
          <button type="button" className="btn btn-secondary btn-sm focus-ring" onClick={filters.resetFilters}>
            Reset search &amp; filters
          </button>
        </div>
      ) : (
        <>
          {/* Phones always get the list; grid is a single column there, so it adds nothing */}
          <div className="md:hidden">
            <MobileList
              filtered={filters.filtered}
              expandedRow={expandedRow}
              onToggleExpand={onToggleExpand}
              cartItems={cart.cartItems}
              prices={prices}
              onCartToggle={cart.toggleCartItem}
              onCartSetQty={cart.setCartQty}
            />
          </div>
          <div className="hidden md:block">
            {view === "table" ? (
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
              />
            ) : (
              <Suspense fallback={<div className="text-center py-8 text-ink-muted">Loading…</div>}>
                <CardGrid
                  filtered={filters.filtered}
                  cartItems={cart.cartItems}
                  onCartToggle={cart.toggleCartItem}
                />
              </Suspense>
            )}
          </div>
          <IconLegend className="mt-4 px-1" />
        </>
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
