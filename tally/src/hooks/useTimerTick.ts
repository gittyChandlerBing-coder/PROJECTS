"use client";

import { useEffect, useState } from "react";

/**
 * useTimerStore keeps elapsed time as a derived calculation from
 * startedAt/accumulatedMs (see getElapsedMs) rather than a ticking counter
 * in state — writing to Local Storage every second would be wasteful and
 * noisy in devtools. This hook just forces a re-render once a second so
 * components reading getElapsedMs() stay visually live while `isRunning`.
 */
export function useTimerTick(isRunning: boolean) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);
}
