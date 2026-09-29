import React from "react";
import type { Supplement } from "../../data/supplements";
import { TierBadge, AdderallBadge, TimeBadge } from "../ui/SupplementBadges";

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
    <article className={`relative flex flex-col panel overflow-hidden transition-colors hover:border-surface-500 ${inCart ? "!border-sage-500/50" : ""}`}>
      <span className={`absolute inset-x-0 top-0 h-[3px] tier-bar-${s.tier}`} aria-hidden="true" />

      <div className="flex flex-col flex-1 p-4 pt-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="font-serif text-lg font-semibold leading-snug">
            <a href={`/supplement/${s.slug}`} className="hover:text-sage-300 transition-colors focus-ring after:absolute after:inset-0">
              {s.name}
            </a>
          </h2>
          <TierBadge supplement={s} />
        </div>

        <p className="text-xs text-ink-faint mb-3">{s.category}</p>
        <p className="text-sm text-ink-soft mb-3 line-clamp-2">{s.treats}</p>
        <p className="font-mono text-xs text-ink-muted mb-4">{s.dosage}</p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          <TimeBadge supplement={s} />
          <AdderallBadge supplement={s} />
        </div>
      </div>

      {s.purchaseUrl && (
        <div className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 border-t border-surface-border">
          <span className="text-xs text-ink-faint">Swanson</span>
          <button
            type="button"
            className={`btn btn-sm focus-ring ${inCart ? "btn-selected" : "btn-secondary"}`}
            aria-pressed={inCart}
            onClick={() => onCartToggle(s.id)}
          >
            {inCart ? "✓ In cart" : "+ Add to cart"}
          </button>
        </div>
      )}
    </article>
  );
});
