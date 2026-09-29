import React from "react";
import type { Supplement } from "../../data/supplements";
import { AdderallLabel, TimeLabel, MealLabel, ScheduleLabel, TierLabel } from "../ui/SupplementBadges";

interface SupplementFactsProps {
  supplement: Supplement;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-sm text-ink-soft">{children}</dd>
    </div>
  );
}

/** Expanded summary shown inline in the table (desktop) and list (mobile). */
export const SupplementFacts = React.memo(function SupplementFacts({ supplement: s }: SupplementFactsProps) {
  return (
    <div className="animate-fade-in space-y-4">
      <p className="text-sm text-ink-soft leading-relaxed">
        <span className="inline-flex align-middle mr-1.5"><TierLabel supplement={s} /></span>
        <span className="font-body">{s.tierReason}</span>
      </p>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <Fact label="Dosage"><span className="font-mono text-[0.8125rem]">{s.dosage}</span></Fact>
        <Fact label="Frequency">{s.frequency}</Fact>
        <Fact label="Time"><TimeLabel supplement={s} /></Fact>
        <Fact label="Meals"><MealLabel supplement={s} /></Fact>
        <Fact label="Adderall">
          <AdderallLabel supplement={s} long />
          <span className="block mt-1 text-xs text-ink-muted">{s.withAdderall}</span>
        </Fact>
        <Fact label="Schedule"><ScheduleLabel supplement={s} /></Fact>
        <div className="col-span-2">
          <Fact label="Helps with">{s.treats}</Fact>
        </div>
      </dl>

      <dl className="grid md:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t border-surface-border">
        <Fact label="Benefits"><span className="font-body leading-relaxed">{s.benefits}</span></Fact>
        <Fact label="Side effects"><span className="font-body leading-relaxed">{s.sideEffects}</span></Fact>
        <Fact label="Notes"><span className="font-body leading-relaxed">{s.notes}</span></Fact>
      </dl>

      <a href={`/supplement/${s.slug}`} className="btn btn-secondary btn-sm focus-ring" onClick={(e) => e.stopPropagation()}>
        Full page →
      </a>
    </div>
  );
});
