import React from "react";
import type { Supplement } from "../../data/supplements";
import { PlusIcon, CheckIcon } from "../ui/Icons";
import { DoseSchedule } from "../ui/SupplementBadges";

interface SupplementCardProps {
  supplement: Supplement;
  inCart: boolean;
  onCartToggle: (id: number) => void;
}

export const SupplementCard = React.memo(function SupplementCard({
  supplement: s,
  inCart,
  onCartToggle,
}: SupplementCardProps) {
  return (
    <article className={`relative flex flex-col panel p-4 transition-colors hover:border-surface-500 ${inCart ? "!border-sage-500/50" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold leading-snug">
            <a href={`/supplement/${s.slug}`} className="hover:text-sage-300 transition-colors focus-ring after:absolute after:inset-0">
              {s.name}
            </a>
          </h2>
          {s.form && <p className="text-[0.8125rem] text-ink-muted">{s.form}</p>}
        </div>
        {s.purchaseUrl && (
          <button
            type="button"
            className={`relative z-10 -mr-1 -mt-1 w-9 h-9 shrink-0 rounded-full inline-flex items-center justify-center transition-colors focus-ring ${
              inCart ? "bg-sage-500 text-white" : "border border-surface-border-strong text-ink-muted hover:text-ink hover:border-surface-500"
            }`}
            aria-pressed={inCart}
            aria-label={inCart ? `Remove ${s.name} from cart` : `Add ${s.name} to cart`}
            onClick={() => onCartToggle(s.id)}
          >
            {inCart ? <CheckIcon /> : <PlusIcon />}
          </button>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 mt-auto pt-4">
        <span className="text-[0.8125rem] text-ink-muted font-tabular truncate">{s.dosage}</span>
        <DoseSchedule supplement={s} />
      </div>
    </article>
  );
});
