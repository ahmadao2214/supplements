import { SunIcon, MoonIcon, ClockIcon, AlertIcon, BanIcon } from "./Icons";

const item = "inline-flex items-center gap-1.5 whitespace-nowrap";

/** Key for the icon-only columns in the list, grid and table. */
export function IconLegend({ className = "" }: { className?: string }) {
  return (
    <p className={`flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted ${className}`}>
      <span className={item}><SunIcon /> Morning</span>
      <span className={item}><MoonIcon /> Evening</span>
      <span className={item}><ClockIcon /> Flexible</span>
      <span className={item}><AlertIcon className="text-caution" /> Caution with Adderall</span>
      <span className={item}><BanIcon className="text-avoid" /> Separate from Adderall</span>
    </p>
  );
}
