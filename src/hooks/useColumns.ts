import { useState } from "react";
import { DEFAULT_COLS } from "../lib/constants";
import { readSetParam } from "./useUrlState";

export function useColumns() {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() =>
    readSetParam("cols", DEFAULT_COLS)
  );

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return { visibleColumns, toggleColumn };
}
