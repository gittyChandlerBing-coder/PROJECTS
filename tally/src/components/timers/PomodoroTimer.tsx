"use client";

import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimerStore } from "@/lib/store/useTimerStore";
import { usePomodoroEngine } from "@/hooks/usePomodoroEngine";
import { formatTime } from "@/lib/utils/date";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

const PHASE_LABEL: Record<string, string> = {
  work: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

interface PomodoroTimerProps {
  size?: number;
}

export function PomodoroTimer({ size = 200 }: PomodoroTimerProps) {
  const phase = useTimerStore((s) => s.phase);
  const isRunning = useTimerStore((s) => s.isRunning);
  const completedPomodorosToday = useTimerStore((s) => s.completedPomodorosToday);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);

  const { remainingMs, progress } = usePomodoroEngine();

  return (
    <div className="flex flex-col items-center gap-4">
      <ProgressRing progress={progress} size={size}>
        <div className="flex flex-col items-center">
          <span className="tabular-nums text-4xl font-semibold text-ink">
            {formatTime(remainingMs / 1000)}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
            {PHASE_LABEL[phase]}
          </span>
        </div>
      </ProgressRing>

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={isRunning ? pause : start}
          className="w-28"
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start
            </>
          )}
        </Button>
        <IconButton aria-label="Reset timer" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </div>

      <p className="tabular-nums text-xs text-ink-faint">
        {completedPomodorosToday} focus session{completedPomodorosToday === 1 ? "" : "s"} today
      </p>
    </div>
  );
}
