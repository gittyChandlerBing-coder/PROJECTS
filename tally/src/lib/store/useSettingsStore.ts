import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { detectTimezone } from "@/lib/utils/date";

interface SettingsState {
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM", 24h
  timezone: string; // IANA
  _hasHydrated: boolean;

  setReminderEnabled: (value: boolean) => void;
  setReminderTime: (value: string) => void;
  setTimezone: (value: string) => void;

  setHasHydrated: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reminderEnabled: false,
      reminderTime: "08:00",
      timezone: detectTimezone(),
      _hasHydrated: false,

      setReminderEnabled: (value) => set({ reminderEnabled: value }),
      setReminderTime: (value) => set({ reminderTime: value }),
      setTimezone: (value) => set({ timezone: value }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "tally:settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        reminderEnabled: state.reminderEnabled,
        reminderTime: state.reminderTime,
        timezone: state.timezone,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
