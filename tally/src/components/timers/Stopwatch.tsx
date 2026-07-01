"use client";

import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimerStore } from "@/lib/store/useTimerStore";
import { useTimerTick } from "@/hooks/useTimerTick";
import { formatStopwatch } from "@/lib/utils/date";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

interface StopwatchProps {
  size?: number;
}

export function Stopwatch({ size = 200 }: StopwatchProps) {
  const isRunning = useTimerStore((s) => s.isRunning);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);
  const getElapsedMs = useTimerStore((s) => s.getElapsedMs);

  useTimerTick(isRunning);
  const elapsedMs = getElapsedMs();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Static ring (progress kept at 0) purely for visual framing
          consistency with the Pomodoro view — a stopwatch has no fixed
          duration to show progress against. */}
      <ProgressRing progress={0} size={size}>
        <div className="flex flex-col items-center">
          <span className="tabular-nums text-4xl font-semibold text-ink">
            {formatStopwatch(elapsedMs)}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
            {isRunning ? "Running" : elapsedMs > 0 ? "Paused" : "Stopwatch"}
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
        <IconButton aria-label="Reset stopwatch" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
