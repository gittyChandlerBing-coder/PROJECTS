"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHabitStore } from "@/lib/store/useHabitStore";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { syncUserCloudState } from "@/lib/firebase/firestore";
import { getTodayKey } from "@/lib/utils/date";
import type { CloudSnapshot } from "@/lib/types";

const DEBOUNCE_MS = 2000;

/**
 * The "hybrid data approach" glue: Local Storage stays the instant,
 * offline-first source of truth for every tick and task edit (via the
 * Zustand `persist` middleware on each store). This hook separately mirrors
 * only what the server-side cron job needs — reminder settings and a small
 * derived snapshot of *currently pending* items — up to Firestore, debounced
 * so rapid local edits don't turn into a write per keystroke.
 *
 * Mount once, near the root, behind an auth check.
 */
export function useCloudSync() {
  const { user } = useAuth();

  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const tasks = useTaskStore((s) => s.tasks);
  const reminderEnabled = useSettingsStore((s) => s.reminderEnabled);
  const reminderTime = useSettingsStore((s) => s.reminderTime);
  const timezone = useSettingsStore((s) => s.timezone);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const today = getTodayKey();

      const habitsPendingToday: CloudSnapshot["habitsPendingToday"] = habits
        .filter((h) => !h.archivedAt && !completions[h.id]?.[today])
        .map((h) => ({
          id: h.id,
          name: h.name,
          streak: useHabitStore.getState().getStreak(h.id),
        }));

      const pendingTasks: CloudSnapshot["pendingTasks"] = tasks
        .filter((t) => !t.completed)
        .map((t) => ({ id: t.id, title: t.title }));

      syncUserCloudState(user.uid, {
        reminderEnabled,
        reminderTime,
        timezone,
        snapshot: { habitsPendingToday, pendingTasks },
      }).catch(() => {
        // Best-effort background sync. A failure here (offline, transient
        // network blip) shouldn't surface as user-facing UI error — Local
        // Storage already has the authoritative state, and the next edit
        // will retry the push automatically.
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, habits, completions, tasks, reminderEnabled, reminderTime, timezone]);
}
