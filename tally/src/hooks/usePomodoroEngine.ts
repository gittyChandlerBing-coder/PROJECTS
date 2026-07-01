"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/lib/store/useTimerStore";
import { useTimerTick } from "./useTimerTick";

const PHASE_DURATIONS_KEY = {
  work: "workMinutes",
  shortBreak: "shortBreakMinutes",
  longBreak: "longBreakMinutes",
} as const;

interface PomodoroEngineResult {
  remainingMs: number;
  durationMs: number;
  progress: number; // 0..1, elapsed fraction
}

/** Wires the Pomodoro countdown: reads live elapsed time from the timer
 *  store, and advances to the next phase automatically the moment the
 *  countdown reaches zero — a guard ref stops the store update from firing
 *  more than once per phase even though this effect re-runs every tick. */
export function usePomodoroEngine(): PomodoroEngineResult {
  const phase = useTimerStore((s) => s.phase);
  const isRunning = useTimerStore((s) => s.isRunning);
  const settings = useTimerStore((s) => s.settings);
  const getElapsedMs = useTimerStore((s) => s.getElapsedMs);
  const completePhase = useTimerStore((s) => s.completePhase);

  useTimerTick(isRunning);

  const durationMs = settings[PHASE_DURATIONS_KEY[phase]] * 60 * 1000;
  const elapsedMs = getElapsedMs();
  const remainingMs = Math.max(0, durationMs - elapsedMs);

  const hasCompletedRef = useRef(false);

  useEffect(() => {
    // Reset the guard whenever we enter a fresh phase/run segment.
    hasCompletedRef.current = false;
  }, [phase]);

  useEffect(() => {
    if (isRunning && remainingMs <= 0 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      completePhase();
    }
  }, [isRunning, remainingMs, completePhase]);

  return {
    remainingMs,
    durationMs,
    progress: durationMs > 0 ? Math.min(1, elapsedMs / durationMs) : 0,
  };
}
