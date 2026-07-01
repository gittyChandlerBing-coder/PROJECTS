import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PomodoroPhase, PomodoroSettings, TimerMode } from "@/lib/types";
import { getTodayKey } from "@/lib/utils/date";

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

interface TimerState {
  mode: TimerMode;
  phase: PomodoroPhase;
  isRunning: boolean;
  /** epoch ms when the current run segment began; null while paused. */
  startedAt: number | null;
  /** elapsed ms banked from prior run segments (before the current one). */
  accumulatedMs: number;
  cycleCount: number;
  completedPomodorosToday: number;
  lastCompletedDateKey: string;
  focusMode: boolean;
  settings: PomodoroSettings;
  _hasHydrated: boolean;

  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skipPhase: () => void;
  /** Called by the pomodoro engine hook when the countdown hits zero. */
  completePhase: () => void;
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
  updateSettings: (partial: Partial<PomodoroSettings>) => void;
  /** Pure read helper: current elapsed ms, accounting for an in-progress run segment. */
  getElapsedMs: () => number;

  setHasHydrated: (value: boolean) => void;
}

function nextPhaseAfterWork(cycleCount: number, settings: PomodoroSettings): PomodoroPhase {
  return cycleCount % settings.cyclesBeforeLongBreak === 0 ? "longBreak" : "shortBreak";
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "pomodoro",
      phase: "work",
      isRunning: false,
      startedAt: null,
      accumulatedMs: 0,
      cycleCount: 0,
      completedPomodorosToday: 0,
      lastCompletedDateKey: getTodayKey(),
      focusMode: false,
      settings: DEFAULT_SETTINGS,
      _hasHydrated: false,

      setMode: (mode) => {
        set({
          mode,
          isRunning: false,
          startedAt: null,
          accumulatedMs: 0,
          phase: "work",
        });
      },

      start: () => {
        if (get().isRunning) return;
        set({ isRunning: true, startedAt: Date.now() });
      },

      pause: () => {
        const { isRunning, startedAt, accumulatedMs } = get();
        if (!isRunning || startedAt === null) return;
        set({
          isRunning: false,
          startedAt: null,
          accumulatedMs: accumulatedMs + (Date.now() - startedAt),
        });
      },

      reset: () => {
        set({ isRunning: false, startedAt: null, accumulatedMs: 0 });
      },

      skipPhase: () => {
        const { mode, phase, cycleCount } = get();
        if (mode === "stopwatch") {
          set({ isRunning: false, startedAt: null, accumulatedMs: 0 });
          return;
        }
        const nextCycleCount = phase === "work" ? cycleCount + 1 : cycleCount;
        const nextPhase: PomodoroPhase =
          phase === "work" ? nextPhaseAfterWork(nextCycleCount, get().settings) : "work";
        set({
          phase: nextPhase,
          cycleCount: nextCycleCount,
          isRunning: false,
          startedAt: null,
          accumulatedMs: 0,
        });
      },

      completePhase: () => {
        const state = get();
        const today = getTodayKey();
        const baseDailyCount =
          state.lastCompletedDateKey === today ? state.completedPomodorosToday : 0;

        if (state.phase === "work") {
          const nextCycleCount = state.cycleCount + 1;
          set({
            phase: nextPhaseAfterWork(nextCycleCount, state.settings),
            cycleCount: nextCycleCount,
            completedPomodorosToday: baseDailyCount + 1,
            lastCompletedDateKey: today,
            // Auto-continue into the break, running, so focus flows without
            // a manual restart click.
            isRunning: true,
            startedAt: Date.now(),
            accumulatedMs: 0,
          });
        } else {
          set({
            phase: "work",
            lastCompletedDateKey: today,
            completedPomodorosToday: baseDailyCount,
            isRunning: true,
            startedAt: Date.now(),
            accumulatedMs: 0,
          });
        }
      },

      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
      setFocusMode: (value) => set({ focusMode: value }),

      updateSettings: (partial) => {
        set((state) => ({ settings: { ...state.settings, ...partial } }));
      },

      getElapsedMs: () => {
        const { isRunning, startedAt, accumulatedMs } = get();
        if (isRunning && startedAt !== null) {
          return accumulatedMs + (Date.now() - startedAt);
        }
        return accumulatedMs;
      },

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "tally:timer",
      storage: createJSONStorage(() => localStorage),
      // Deliberately not persisting isRunning/startedAt/accumulatedMs — a
      // mid-session reload honestly restarting the current phase is less
      // surprising than resurrecting a stale countdown from page-close time.
      partialize: (state) => ({
        settings: state.settings,
        completedPomodorosToday: state.completedPomodorosToday,
        lastCompletedDateKey: state.lastCompletedDateKey,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
