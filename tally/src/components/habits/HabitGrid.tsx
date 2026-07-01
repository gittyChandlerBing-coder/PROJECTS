"use client";

import { useMemo } from "react";
import { useHabitStore } from "@/lib/store/useHabitStore";
import { useTodayKey } from "@/hooks/useTodayKey";
import { getWeekDates, getWeekDayLabel, toDateKey, parseDateKey } from "@/lib/utils/date";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { HabitRow } from "./HabitRow";
import { AddHabitForm } from "./AddHabitForm";

export function HabitGrid() {
  const habits = useHabitStore((s) => s.habits);
  const hasHydrated = useHabitStore((s) => s._hasHydrated);
  const todayKey = useTodayKey();

  const weekDates = useMemo(() => getWeekDates(parseDateKey(todayKey)), [todayKey]);
  const activeHabits = habits.filter((h) => !h.archivedAt);

  return (
    <Card>
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        <CardTitle>Habits</CardTitle>
      </div>

      {/* Desktop day-label header, aligned to HabitRow's grid template via
          matching grid-cols + padding — deliberately not using CardHeader's
          flex layout here, since flex can't guarantee column alignment with
          the rows below the way a matching grid template can. */}
      <div className="hidden gap-3 border-t border-line px-5 py-2 sm:grid sm:grid-cols-[minmax(0,1fr)_repeat(7,2rem)_3.25rem_4rem]">
        <span />
        {weekDates.map((date) => {
          const dateKey = toDateKey(date);
          return (
            <span
              key={dateKey}
              className={
                "text-center text-[0.65rem] font-medium uppercase tracking-wide " +
                (dateKey === todayKey ? "text-accent" : "text-ink-faint")
              }
            >
              {getWeekDayLabel(date)}
            </span>
          );
        })}
        <span />
        <span />
      </div>

      {!hasHydrated ? (
        <EmptyState>Loading…</EmptyState>
      ) : activeHabits.length === 0 ? (
        <EmptyState>No habits yet. Add one to start your first streak.</EmptyState>
      ) : (
        <div>
          {activeHabits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} weekDates={weekDates} todayKey={todayKey} />
          ))}
        </div>
      )}

      <div className="border-t border-line">
        <AddHabitForm />
      </div>
    </Card>
  );
}
