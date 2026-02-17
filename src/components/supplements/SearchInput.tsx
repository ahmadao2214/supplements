import React, { useState, useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = React.memo(function SearchInput({ value, onChange }: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 150);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="flex-1 min-w-[240px]">
      <input
        type="text"
        placeholder="Search supplements, conditions, benefits..."
        value={local}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-surface-700 border border-surface-border rounded-xl text-sage-200 text-sm outline-none placeholder:text-sage-400/40 hover:border-sage-600 focus:border-cyan-400 transition-colors font-body focus-ring"
        aria-label="Search supplements"
      />
    </div>
  );
});
