import type { Tier } from "../../data/supplements";
import { tierLabels, tierDescriptions } from "../../lib/constants";

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none",
  "aria-hidden": true as const,
});

/**
 * Tier marks — shape carries the meaning so no text or color is required:
 * Core = solid dot (foundation), Add-On = plus (build on core), Optional = dashed ring (situational).
 * Pass `decorative` when the tier name is already shown as text next to the icon.
 */
export function TierIcon({ tier, size = 16, className = "", decorative = false }: IconProps & { tier: Tier; decorative?: boolean }) {
  const tone = tier === 1 ? "text-sage-300" : tier === 2 ? "text-ink-soft" : "text-ink-muted";
  return (
    <span
      className={`inline-flex shrink-0 ${tone} ${className}`}
      title={decorative ? undefined : `${tierLabels[tier]} — ${tierDescriptions[tier]}`}
    >
      <svg {...base(size)}>
        {tier === 1 && <circle cx="8" cy="8" r="5.5" fill="currentColor" />}
        {tier === 2 && (
          <>
            <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5.25v5.5M5.25 8h5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {tier === 3 && (
          <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.3 2.2" />
        )}
      </svg>
      {!decorative && <span className="sr-only">{tierLabels[tier]}</span>}
    </span>
  );
}

export function SunIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.5v1.25M8 13.25v1.25M1.5 8h1.25M13.25 8h1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M13 9.6A5.5 5.5 0 1 1 6.4 3a4.3 4.3 0 0 0 6.6 6.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.75V8l2.25 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 2.25 14.25 13H1.75L8 2.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6.5v2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.1" r=".85" fill="currentColor" />
    </svg>
  );
}

export function BanIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="m3.9 12.1 8.2-8.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PlusIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
