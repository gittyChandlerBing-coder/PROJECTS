"use client";

import { Maximize2 } from "lucide-react";
import { useTimerStore } from "@/lib/store/useTimerStore";
import { PomodoroTimer } from "./PomodoroTimer";
import { Stopwatch } from "./Stopwatch";
import { cn } from "@/lib/utils/cn";

interface TimerWidgetProps {
  size?: number;
  showFocusToggle?: boolean;
}

export function TimerWidget({ size, showFocusToggle = true }: TimerWidgetProps) {
  const mode = useTimerStore((s) => s.mode);
  const setMode = useTimerStore((s) => s.setMode);
  const toggleFocusMode = useTimerStore((s) => s.toggleFocusMode);

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        role="tablist"
        aria-label="Timer mode"
        className="inline-flex items-center gap-0.5 rounded-[var(--radius-control)] border border-line-strong bg-paper p-0.5"
      >
        {(["pomodoro", "stopwatch"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "rounded-[calc(var(--radius-control)-2px)] px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-100",
              mode === m ? "bg-surface text-ink shadow-[var(--shadow-card)]" : "text-ink-muted hover:text-ink"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "pomodoro" ? <PomodoroTimer size={size} /> : <Stopwatch size={size} />}

      {showFocusToggle && (
        <button
          type="button"
          onClick={toggleFocusMode}
          className="flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Focus mode
        </button>
      )}
    </div>
  );
}
