import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { supplements } from "../../data/supplements";
import { DEFAULT_COLS } from "../../lib/constants";
import { useSupplementFilters } from "../../hooks/useSupplementFilters";
import { useCart } from "../../hooks/useCart";
import { useColumns } from "../../hooks/useColumns";
import { syncToUrl, readParam, currentParams, useHydrated } from "../../hooks/useUrlState";
import { buildCartUrl, serializeCart } from "../../lib/cart-utils";
import { useWebMcpTools } from "../../hooks/useWebMcpTools";
import { FilterBar } from "./FilterBar";
import { ColumnToggles } from "./ColumnToggles";
import { ResultsCount } from "./ResultsCount";
import { DataTable } from "./DataTable";
import { CartBar } from "./CartBar";
import { ViewToggle } from "./ViewToggle";
import { MobileList } from "./MobileList";
import { CartPlusIcon, CartCheckIcon, StackIcon } from "../ui/Icons";
import { TemplatesDialog } from "./TemplatesDialog";
import { useChoiceDialog } from "../ui/ChoiceDialog";
import { useTemplates } from "../../hooks/useTemplates";
import { useNotice } from "../../hooks/useNotice";
import { applyTemplate, templateLabel, type ApplyMode, type Template } from "../../lib/templates";
import { IconLegend } from "../ui/IconLegend";

const CardGrid = lazy(() => import("./CardGrid").then((m) => ({ default: m.CardGrid })));

type ViewMode = "table" | "grid";

interface Props {
  prices?: Record<number, number>;
}

const noParams = new URLSearchParams();

/**
 * The page is built without a query string, so the island first renders with
 * defaults to match that HTML exactly, then remounts with state from the URL.
 */
export default function SupplementDatabase({ prices = {} }: Props) {
  const hydrated = useHydrated();
  return hydrated
    ? <Database key="url" prices={prices} params={currentParams()} live />
    : <Database key="static" prices={prices} params={noParams} live={false} />;
}

interface DatabaseProps {
  prices: Record<number, number>;
  params: URLSearchParams;
  /** False for the hydration pass: don't write the URL or register agent tools yet */
  live: boolean;
}

function Database({ prices, params, live }: DatabaseProps) {
  const [view, setView] = useState<ViewMode>(() => readParam(params, "view", "table") as ViewMode);
  const filters = useSupplementFilters(params);
  const { visibleColumns, toggleColumn } = useColumns(params);
  const cart = useCart(filters.filtered, prices, params);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const { templates, getTemplates, saveTemplate, deleteTemplate, recordCheckout } = useTemplates();
  const { ask, dialog } = useChoiceDialog();
  const { notice, notify } = useNotice();
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const cartSize = cart.cartItems.size;
  const { updateCart } = cart;

  const loadTemplate = useCallback(async (t: Template) => {
    setTemplatesOpen(false);
    let mode: ApplyMode = "replace";
    // Only an empty cart loads straight away; otherwise the user picks replace or add
    if (cartSize > 0) {
      const choice = await ask({
        title: `Load ${templateLabel(t)}?`,
        body: (
          <p>
            Your cart already has {cartSize} {cartSize === 1 ? "supplement" : "supplements"}.
            Replace it, or add what's missing? Adding keeps the larger quantity, so nothing doubles up.
          </p>
        ),
        choices: [
          { value: "cancel", label: "Cancel", variant: "ghost" },
          { value: "add", label: "Add to cart" },
          { value: "replace", label: "Replace cart", variant: "primary" },
        ],
      });
      if (choice !== "add" && choice !== "replace") return;
      mode = choice;
    }
    updateCart((prev) => applyTemplate(prev, t.items, mode));
    notify(`${mode === "add" ? "Added" : "Loaded"} ${templateLabel(t)}`);
  }, [ask, cartSize, updateCart, notify]);

  const confirmDelete = useCallback(async (t: Template) => {
    setTemplatesOpen(false);
    const choice = await ask({
      title: `Delete ${templateLabel(t)}?`,
      choices: [
        { value: "cancel", label: "Cancel", variant: "ghost" },
        { value: "delete", label: "Delete", variant: "primary" },
      ],
    });
    if (choice === "delete") {
      deleteTemplate(t.id);
      notify(`Deleted ${templateLabel(t)}`);
    }
    setTemplatesOpen(true);
  }, [ask, deleteTemplate, notify]);

  // Latest cart for agent tools, which can run between renders
  const cartRef = useRef(cart.cartItems);
  cartRef.current = cart.cartItems;

  const handleCheckout = useCallback(() => {
    const items = cartRef.current;
    if (items.size === 0) return;
    window.open(buildCartUrl(items), "_blank", "noopener,noreferrer");
    recordCheckout(items);
  }, [recordCheckout]);

  useWebMcpTools({
    getCart: () => cartRef.current,
    setCart: (next) => {
      cartRef.current = next;
      updateCart(() => next);
    },
    getPrices: () => prices,
    getTemplates,
    saveTemplate,
    deleteTemplate,
    checkout: handleCheckout,
    notify,
    ask,
  }, live);

  const onToggleExpand = useCallback((id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  // Sync all state to URL (not during hydration, when state is still the defaults)
  useEffect(() => {
    if (!live) return;
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
      cart: cart.cartItems.size > 0 ? serializeCart(cart.cartItems) : undefined,
    });
  }, [
    filters.search, filters.categoryFilter, filters.conditionFilter,
    filters.adderallFilter, filters.timeFilter, filters.tierFilter,
    filters.scheduleFilter, filters.sortKey, filters.sortDir,
    visibleColumns, cart.cartItems, view, live,
  ]);

  const empty = filters.filtered.length === 0;
  const allInCart = cart.selectAllState === "all";
  const canAddAll = filters.filtered.some((x) => x.purchaseUrl);

  const actions = (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        className="h-9 inline-flex items-center gap-1.5 px-2.5 rounded-[var(--radius-md)] border bg-surface-800 border-surface-border-strong text-sm font-medium text-ink-soft hover:text-ink hover:border-surface-500 transition-colors focus-ring"
        onClick={() => setTemplatesOpen(true)}
        aria-haspopup="dialog"
        aria-label="Templates"
        title="Templates"
      >
        <StackIcon size={18} />
        <span className="hidden sm:inline">Templates</span>
      </button>
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
        onOpenCart={handleCheckout}
      />

      <TemplatesDialog
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={templates}
        cartCount={cartSize}
        prices={prices}
        onLoad={loadTemplate}
        onSave={(name) => {
          saveTemplate(name, cart.cartItems);
          notify(`Saved "${name.trim()}"`);
        }}
        onDelete={confirmDelete}
      />
      {dialog}

      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-[bottom] ${cartSize > 0 ? "bottom-24" : "bottom-6"}`}
      >
        {notice && (
          <p className="panel px-4 py-2 text-sm text-ink shadow-elevated animate-slide-up whitespace-nowrap">{notice}</p>
        )}
      </div>
    </div>
  );
}
