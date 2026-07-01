import { cn } from "@/lib/utils/cn";

export function StreakBadge({ streak }: { streak: number }) {
  return (
    <span
      className={cn(
        "tabular-nums inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium",
        streak > 0 ? "text-ink" : "text-ink-faint"
      )}
      title={streak > 0 ? `${streak}-day streak` : "No streak yet"}
    >
      <span aria-hidden="true">{streak > 0 ? "🔥" : "·"}</span>
      {streak > 0 ? streak : ""}
    </span>
  );
}
