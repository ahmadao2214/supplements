import React from "react";
import type { Supplement } from "../../data/supplements";
import { SupplementCard } from "./SupplementCard";

interface CardGridProps {
  filtered: Supplement[];
  cartItems: Map<number, number>;
  onCartToggle: (id: number) => void;
}

export const CardGrid = React.memo(function CardGrid({
  filtered,
  cartItems,
  onCartToggle,
}: CardGridProps) {
  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-sage-400/50 font-body">
        No supplements match your filters. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filtered.map((s) => (
        <SupplementCard
          key={s.id}
          supplement={s}
          inCart={cartItems.has(s.id)}
          onCartToggle={onCartToggle}
        />
      ))}
    </div>
  );
});
