import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Habit, HabitCompletions } from "@/lib/types";
import { generateId } from "@/lib/utils/id";
import { calculateStreak } from "@/lib/utils/streak";
import { getTodayKey, isFutureDateKey } from "@/lib/utils/date";

interface HabitState {
  habits: Habit[];
  completions: HabitCompletions;
  _hasHydrated: boolean;

  addHabit: (name: string) => void;
  renameHabit: (id: string, name: string) => void;
  archiveHabit: (id: string) => void;

  /** No-ops silently on future dates — you can't pre-complete tomorrow. */
  toggleCompletion: (habitId: string, dateKey: string) => void;
  isCompletedOn: (habitId: string, dateKey: string) => boolean;
  getStreak: (habitId: string) => number;

  setHasHydrated: (value: boolean) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      _hasHydrated: false,

      addHabit: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const habit: Habit = {
          id: generateId(),
          name: trimmed,
          createdAt: new Date().toISOString(),
          archivedAt: null,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
      },

      renameHabit: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, name: trimmed } : h)),
        }));
      },

      archiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, archivedAt: new Date().toISOString() } : h
          ),
        }));
      },

      toggleCompletion: (habitId, dateKey) => {
        if (isFutureDateKey(dateKey)) return;
        set((state) => {
          const forHabit = state.completions[habitId] ?? {};
          const next = { ...forHabit, [dateKey]: !forHabit[dateKey] };
          return { completions: { ...state.completions, [habitId]: next } };
        });
      },

      isCompletedOn: (habitId, dateKey) => {
        return Boolean(get().completions[habitId]?.[dateKey]);
      },

      getStreak: (habitId) => {
        return calculateStreak(get().completions[habitId], getTodayKey());
      },

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "tally:habits",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ habits: state.habits, completions: state.completions }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
