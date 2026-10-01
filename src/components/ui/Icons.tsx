type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none",
  "aria-hidden": true as const,
});

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

function CartBase() {
  return (
    <>
      <path d="M1.5 2h1.6l1.5 7.6a1 1 0 0 0 1 .8h6.2a1 1 0 0 0 1-.8l.9-4.6H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.25" cy="13.25" r="1" fill="currentColor" />
      <circle cx="11.25" cy="13.25" r="1" fill="currentColor" />
    </>
  );
}

export function CartPlusIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <CartBase />
      <path d="M8.75 5.5v3M7.25 7h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CartCheckIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <CartBase />
      <path d="m7 7 1.25 1.25L10.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SlidersIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2 4.5h7M12.5 4.5H14M2 11.5h2M7.5 11.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10.75" cy="4.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.75" cy="11.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function SearchIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="m13.5 13.5-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
