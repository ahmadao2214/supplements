import React from "react";
import type { Supplement } from "../../data/supplements";
import { SupplementFacts } from "./SupplementFacts";

interface DetailRowProps {
  supplement: Supplement;
  colSpan: number;
}

export const DetailRow = React.memo(function DetailRow({ supplement: s, colSpan }: DetailRowProps) {
  return (
    <tr className="bg-surface-800">
      <td colSpan={colSpan} className="border-b border-surface-border px-5 py-5">
        <SupplementFacts supplement={s} />
      </td>
    </tr>
  );
});
