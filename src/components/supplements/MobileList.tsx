import React from "react";
import type { Supplement } from "../../data/supplements";
import { PlusIcon, CheckIcon } from "../ui/Icons";
import { AdderallFlag, TimeIcon, SupplementName } from "../ui/SupplementBadges";
import { QtyStepperButton } from "../ui/QtyStepperButton";
import { SupplementFacts } from "./SupplementFacts";
import { formatPrice } from "../../lib/format-utils";

interface MobileListProps {
  filtered: Supplement[];
  expandedRow: number | null;
  onToggleExpand: (id: number) => void;
  cartItems: Map<number, number>;
  prices: Record<number, number>;
  onCartToggle: (id: number) => void;
  onCartSetQty: (id: number, qty: number) => void;
}

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
    <li className={inCart ? "bg-sage-500/[0.06]" : ""}>
      <div className="flex items-stretch">
        <button
          type="button"
          className="flex-1 min-w-0 text-left pl-4 pr-1 py-3.5 focus-ring"
          aria-expanded={isExpanded}
          onClick={() => onToggleExpand(s.id)}
        >
          <span className="flex items-start justify-between gap-3">
            <SupplementName supplement={s} className="text-[0.9375rem]" />
            <span className="flex items-center gap-2.5 pt-0.5 shrink-0">
              <AdderallFlag supplement={s} />
              <TimeIcon supplement={s} />
            </span>
          </span>
          <span className="block mt-1 text-[0.8125rem] text-ink-muted truncate">
            <span className="font-tabular">{s.dosage}</span>
            <span className="text-ink-faint"> · </span>
            {s.frequency}
          </span>
        </button>
        {s.purchaseUrl ? (
          <button
            type="button"
            onClick={() => onCartToggle(s.id)}
            className="shrink-0 w-14 flex items-start justify-center pt-3 focus-ring"
            aria-pressed={inCart}
            aria-label={inCart ? `Remove ${s.name} from cart` : `Add ${s.name} to cart`}
          >
            <span
              className={`w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors ${
                inCart ? "bg-sage-500 text-white" : "border border-surface-border-strong text-ink-muted"
              }`}
            >
              {inCart ? <CheckIcon /> : <PlusIcon />}
            </span>
          </button>
        ) : null}
      </div>

      {inCart && (
        <div className="flex items-center justify-between gap-3 pl-4 pr-3 pb-3 -mt-1">
          <span className="text-xs text-ink-muted font-mono font-tabular">
            {price ? formatPrice(price * qty) : null}
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
        <div className="px-4 pb-5 pt-1">
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
    <ul className="panel divide-y divide-surface-border overflow-hidden">
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
