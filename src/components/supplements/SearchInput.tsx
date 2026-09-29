import React, { useState, useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = React.memo(function SearchInput({ value, onChange }: SearchInputProps) {
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
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Search name, condition, benefit…"
        value={local}
        onChange={(e) => update(e.target.value)}
        className="field !pl-10 !pr-10 [&::-webkit-search-cancel-button]:hidden"
        aria-label="Search supplements"
      />
      {local && (
        <button
          type="button"
          onClick={() => update("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-faint hover:text-ink focus-ring"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
});
