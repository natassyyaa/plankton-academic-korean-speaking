import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-8", className)}>
      <defs>
        <linearGradient id="plankton-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--teal)" />
          <stop offset="100%" stopColor="var(--sky)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="var(--navy)" />
      <path
        d="M20 9c5.8 0 10 4.2 10 9.6 0 4.6-3 8.1-7.2 9.2l.9 3.9c.2.8-.7 1.3-1.3.8l-4.4-4.2C12.9 27.7 10 23.8 10 18.6 10 13.2 14.2 9 20 9Z"
        fill="url(#plankton-g)"
      />
      <circle cx="16.5" cy="18.5" r="1.7" fill="var(--navy)" />
      <circle cx="23.5" cy="18.5" r="1.7" fill="var(--navy)" />
      <circle cx="29.5" cy="9.5" r="2" fill="var(--teal)" opacity="0.8" />
      <circle cx="33" cy="14" r="1.2" fill="var(--sky)" opacity="0.8" />
    </svg>
  );
}

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-lg font-bold tracking-[0.18em]",
          inverted ? "text-navy-foreground" : "text-foreground",
        )}
      >
        PLANKTON
      </span>
    </span>
  );
}
