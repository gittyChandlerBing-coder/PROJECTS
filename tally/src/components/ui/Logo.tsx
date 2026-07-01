import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  strokeWidth?: number;
}

/**
 * The wordmark's glyph: four verticals + one diagonal strike, the way a
 * count of five is kept by hand. It's the most literal possible expression
 * of "Tally" and doubles as the app icon — see scripts/generate-icons and
 * public/icons for the rasterized PWA versions of this exact path set.
 */
export function Logo({ className, strokeWidth = 7 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="80" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="36" y1="20" x2="36" y2="80" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="54" y1="20" x2="54" y2="80" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="72" y1="20" x2="72" y2="80" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="10" y1="76" x2="82" y2="16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
