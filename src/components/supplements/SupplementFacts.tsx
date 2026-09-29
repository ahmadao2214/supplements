import React from "react";
import type { Supplement } from "../../data/supplements";
import { tierLabels } from "../../lib/constants";
import { AdderallBadge, ScheduleBadge, TimeBadge, MealBadge } from "../ui/SupplementBadges";

interface SupplementFactsProps {
  supplement: Supplement;
}

function Fact({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 ${wide ? "col-span-full" : ""}`}>
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-sm text-ink-soft">{children}</dd>
    </div>
  );
}

/** Expanded summary shown inline in the table (desktop) and list (mobile). */
export const SupplementFacts = React.memo(function SupplementFacts({ supplement: s }: SupplementFactsProps) {
  return (
    <div className="animate-fade-in space-y-4">
      <p className="text-sm text-ink-soft font-body leading-relaxed border-l-2 border-sage-400/60 pl-3">
        <span className="font-display font-semibold text-sage-300">Why {tierLabels[s.tier]}: </span>
        {s.tierReason}
      </p>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <Fact label="Dosage"><span className="font-mono text-[0.8125rem]">{s.dosage}</span></Fact>
        <Fact label="Frequency">{s.frequency}</Fact>
        <Fact label="Time of day"><TimeBadge supplement={s} /></Fact>
        <Fact label="With meals"><MealBadge supplement={s} /></Fact>
        <Fact label="With Adderall">
          <AdderallBadge supplement={s} />
          <span className="block mt-1 text-xs text-ink-muted">{s.withAdderall}</span>
        </Fact>
        <Fact label="Schedule"><ScheduleBadge supplement={s} short /></Fact>
        <Fact label="Category">{s.category}</Fact>
        <Fact label="Treats">{s.treats}</Fact>
      </dl>

      <dl className="grid md:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t border-surface-border">
        <Fact label="Benefits"><span className="font-body leading-relaxed">{s.benefits}</span></Fact>
        <Fact label="Side effects"><span className="font-body leading-relaxed">{s.sideEffects}</span></Fact>
        <Fact label="Notes"><span className="font-body leading-relaxed">{s.notes}</span></Fact>
      </dl>

      <div className="flex flex-wrap gap-2 pt-1">
        <a href={`/supplement/${s.slug}`} className="btn btn-secondary btn-sm focus-ring" onClick={(e) => e.stopPropagation()}>
          Full details →
        </a>
        {s.purchaseUrl && (
          <a
            href={s.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm focus-ring"
            onClick={(e) => e.stopPropagation()}
          >
            View on Swanson ↗
          </a>
        )}
      </div>
    </div>
  );
});
