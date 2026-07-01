import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task } from "@/lib/types";
import { generateId } from "@/lib/utils/id";

interface TaskState {
  tasks: Task[];
  _hasHydrated: boolean;

  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, title: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;

  setHasHydrated: (value: boolean) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      _hasHydrated: false,

      addTask: (title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const task: Task = {
          id: generateId(),
          title: trimmed,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        set((state) => ({ tasks: [task, ...state.tasks] }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : null,
                }
              : t
          ),
        }));
      },

      updateTask: (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
        }));
      },

      removeTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      clearCompleted: () => {
        set((state) => ({ tasks: state.tasks.filter((t) => !t.completed) }));
      },

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "tally:tasks",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tasks: state.tasks }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
