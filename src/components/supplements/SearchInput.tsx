import React, { useState, useEffect, useRef } from "react";
import { SearchIcon } from "../ui/Icons";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Control rendered inside the right edge of the field (e.g. the filters toggle). */
  trailing?: React.ReactNode;
}

export const SearchInput = React.memo(function SearchInput({ value, onChange, trailing }: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const update = (val: string) => {
    setLocal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 150);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="relative flex-1 min-w-0">
      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Search supplements"
        value={local}
        onChange={(e) => update(e.target.value)}
        className={`field !pl-10 [&::-webkit-search-cancel-button]:hidden ${trailing ? "!pr-28" : "!pr-10"}`}
        aria-label="Search supplements"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
        {local && (
          <button
            type="button"
            onClick={() => update("")}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-faint hover:text-ink focus-ring"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {trailing && (
          <>
            <span className="w-px h-5 bg-surface-border-strong mx-1" aria-hidden="true" />
            {trailing}
          </>
        )}
      </div>
    </div>
  );
});
