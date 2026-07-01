"use client";

import { cn } from "@/lib/utils/cn";

interface HabitCellProps {
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
  dayLabel: string;
  habitName: string;
  dateLabel: string;
  onToggle: () => void;
}

/** One ledger cell: a squared-off box (deliberately sharper-cornered than
 *  the app's cards — see globals.css --radius-cell — so the grid itself
 *  reads as data, not chrome) that fills with a hand-drawn-style stroke
 *  checkmark on completion. */
export function HabitCell({
  completed,
  isToday,
  isFuture,
  dayLabel,
  habitName,
  dateLabel,
  onToggle,
}: HabitCellProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isFuture}
      aria-pressed={completed}
      aria-label={`${habitName}, ${dayLabel} ${dateLabel}${completed ? ", completed" : ", not completed"}`}
      className={cn(
        "group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-cell)] border transition-colors duration-100",
        isFuture
          ? "cursor-not-allowed border-line/60 bg-transparent"
          : "border-line-strong bg-surface hover:border-ink/30 active:scale-90",
        completed && "border-accent bg-accent-soft",
        isToday && !completed && "ring-1 ring-inset ring-accent/40"
      )}
    >
      {completed && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none">
          <path
            d="M4 12.5L9.5 18L20 6"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={20}
            className="animate-tick-draw"
          />
        </svg>
      )}
    </button>
  );
}
