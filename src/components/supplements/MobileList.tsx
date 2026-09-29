import React from "react";
import type { Supplement } from "../../data/supplements";
import { TierBadge, AdderallBadge, TimeBadge } from "../ui/SupplementBadges";
import { QtyStepperButton } from "../ui/QtyStepperButton";
import { SupplementFacts } from "./SupplementFacts";
import { formatPrice } from "../../lib/format-utils";

type SortKey = keyof Supplement;

interface MobileListProps {
  filtered: Supplement[];
  expandedRow: number | null;
  onToggleExpand: (id: number) => void;
  cartItems: Map<number, number>;
  prices: Record<number, number>;
  onCartToggle: (id: number) => void;
  onCartSetQty: (id: number, qty: number) => void;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "tier", label: "Priority" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "timeOfDay", label: "Time" },
];

interface ItemProps {
  supplement: Supplement;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  inCart: boolean;
  qty: number;
  price?: number;
  onCartToggle: (id: number) => void;
  onCartSetQty: (id: number, qty: number) => void;
}

const MobileItem = React.memo(function MobileItem({
  supplement: s,
  isExpanded,
  onToggleExpand,
  inCart,
  qty,
  price,
  onCartToggle,
  onCartSetQty,
}: ItemProps) {
  return (
    <li className={`relative panel overflow-hidden ${inCart ? "border-sage-500/50" : ""}`}>
      <span className={`absolute inset-y-0 left-0 w-[3px] tier-bar-${s.tier}`} aria-hidden="true" />
      <div className="flex items-stretch">
        <button
          type="button"
          className="flex-1 min-w-0 text-left pl-4 pr-2 py-3.5 focus-ring"
          aria-expanded={isExpanded}
          onClick={() => onToggleExpand(s.id)}
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-semibold text-[0.9375rem] leading-snug text-ink">{s.name}</span>
            <TierBadge supplement={s} />
          </span>
          <span className="block mt-1 font-mono text-xs text-ink-muted truncate">{s.dosage}</span>
          <span className="flex flex-wrap gap-1.5 mt-2.5">
            <TimeBadge supplement={s} />
            <AdderallBadge supplement={s} />
          </span>
        </button>
        {s.purchaseUrl ? (
          <button
            type="button"
            onClick={() => onCartToggle(s.id)}
            className={`shrink-0 w-14 flex flex-col items-center justify-center gap-0.5 border-l border-surface-border transition-colors focus-ring ${
              inCart ? "bg-sage-500/15 text-sage-300" : "text-ink-muted active:bg-surface-700"
            }`}
            aria-pressed={inCart}
            aria-label={inCart ? `Remove ${s.name} from cart` : `Add ${s.name} to cart`}
          >
            <span className="text-lg leading-none" aria-hidden="true">{inCart ? "✓" : "+"}</span>
            <span className="text-[0.6875rem] font-medium">{inCart ? "Added" : "Cart"}</span>
          </button>
        ) : null}
      </div>

      {inCart && (
        <div className="flex items-center justify-between gap-3 pl-4 pr-3 py-2 border-t border-surface-border bg-surface-700/40">
          <span className="text-xs text-ink-muted">
            Quantity{price ? <span className="font-mono ml-2 text-ink-soft">{formatPrice(price * qty)}</span> : null}
          </span>
          <QtyStepperButton
            size="sm"
            qty={qty}
            name={s.name}
            onDecrease={() => onCartSetQty(s.id, qty - 1)}
            onIncrease={() => onCartSetQty(s.id, qty + 1)}
          />
        </div>
      )}

      {isExpanded && (
        <div className="pl-4 pr-4 pt-4 pb-4 border-t border-surface-border bg-surface-900/40">
          <SupplementFacts supplement={s} />
        </div>
      )}
    </li>
  );
});

export function MobileList({
  filtered,
  expandedRow,
  onToggleExpand,
  cartItems,
  prices,
  onCartToggle,
  onCartSetQty,
}: MobileListProps) {
  return (
    <ul className="space-y-2.5">
        {filtered.map((s) => (
          <MobileItem
            key={s.id}
            supplement={s}
            isExpanded={expandedRow === s.id}
            onToggleExpand={onToggleExpand}
            inCart={cartItems.has(s.id)}
            qty={cartItems.get(s.id) ?? 1}
            price={prices[s.id]}
            onCartToggle={onCartToggle}
            onCartSetQty={onCartSetQty}
          />
        ))}
    </ul>
  );
}

/** Compact sort control for the list view, where there are no column headers to click. */
export function MobileSortSelect({ sortKey, onSortKey }: { sortKey: SortKey; onSortKey: (key: SortKey) => void }) {
  return (
    <select
      value={sortOptions.some((o) => o.key === sortKey) ? sortKey : "tier"}
      onChange={(e) => onSortKey(e.target.value as SortKey)}
      className="field !h-9 !w-auto !pl-3 !pr-8 !bg-[position:right_0.625rem_center]"
      aria-label="Sort by"
    >
      {sortOptions.map((o) => (
        <option key={o.key} value={o.key}>{o.label}</option>
      ))}
    </select>
  );
}
