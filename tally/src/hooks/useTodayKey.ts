"use client";

import { useEffect, useState } from "react";
import { getTodayKey, msUntilNextLocalMidnight } from "@/lib/utils/date";

/**
 * Habit completions are stored per dateKey, so there's no data to "clear" at
 * midnight — a new day simply has no entries yet. What *does* need to update
 * is any UI reading "today" (today's column highlight, streak counters, the
 * task list's implicit day boundary) if the tab is left open overnight.
 * This hook schedules a single timeout to the next local midnight, bumps
 * `todayKey`, then reschedules — so the tick boxes refresh live instead of
 * requiring a manual reload.
 */
export function useTodayKey(): string {
  const [todayKey, setTodayKey] = useState(getTodayKey());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNextRollover() {
      timeoutId = setTimeout(() => {
        setTodayKey(getTodayKey());
        scheduleNextRollover();
      }, msUntilNextLocalMidnight());
    }

    scheduleNextRollover();

    // Also catch the case where the device was asleep/the tab was
    // backgrounded right through the scheduled timeout (many browsers throttle
    // or drop timers for hidden tabs) — re-check whenever the tab regains focus.
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        setTodayKey(getTodayKey());
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return todayKey;
}
