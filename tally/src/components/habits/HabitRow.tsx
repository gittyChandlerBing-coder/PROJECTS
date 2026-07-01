"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Habit } from "@/lib/types";
import { useHabitStore } from "@/lib/store/useHabitStore";
import { toDateKey, getWeekDayLabel, isFutureDateKey } from "@/lib/utils/date";
import { HabitCell } from "./HabitCell";
import { StreakBadge } from "./StreakBadge";
import { IconButton } from "@/components/ui/IconButton";

interface HabitRowProps {
  habit: Habit;
  weekDates: Date[];
  todayKey: string;
}

export function HabitRow({ habit, weekDates, todayKey }: HabitRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(habit.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCompletedOn = useHabitStore((s) => s.isCompletedOn);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const renameHabit = useHabitStore((s) => s.renameHabit);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const streak = useHabitStore((s) => s.getStreak(habit.id));

  function startEditing() {
    setDraftName(habit.name);
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function commitRename() {
    if (draftName.trim() && draftName.trim() !== habit.name) {
      renameHabit(habit.id, draftName);
    }
    setIsEditing(false);
  }

  const cells = weekDates.map((date) => {
    const dateKey = toDateKey(date);
    return (
      <HabitCell
        key={dateKey}
        completed={isCompletedOn(habit.id, dateKey)}
        isToday={dateKey === todayKey}
        isFuture={isFutureDateKey(dateKey)}
        dayLabel={getWeekDayLabel(date)}
        dateLabel={String(date.getDate())}
        habitName={habit.name}
        onToggle={() => toggleCompletion(habit.id, dateKey)}
      />
    );
  });

  const nameBlock = isEditing ? (
    <form
      className="flex min-w-0 flex-1 items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        commitRename();
      }}
    >
      <input
        ref={inputRef}
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
        maxLength={80}
        className="h-8 min-w-0 flex-1 rounded-[var(--radius-control)] border border-accent bg-surface px-2 text-sm text-ink focus-visible:outline-none"
      />
      <IconButton type="submit" aria-label="Save name">
        <Check className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton type="button" aria-label="Cancel" onClick={() => setIsEditing(false)}>
        <X className="h-3.5 w-3.5" />
      </IconButton>
    </form>
  ) : (
    <button
      type="button"
      onClick={startEditing}
      className="min-w-0 flex-1 truncate text-left text-sm text-ink hover:text-accent"
      title="Click to rename"
    >
      {habit.name}
    </button>
  );

  return (
    <div className="border-t border-line first:border-t-0">
      {/* Desktop / tablet: single aligned grid row */}
      <div className="hidden items-center gap-3 px-5 py-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_repeat(7,2rem)_3.25rem_4rem]">
        {nameBlock}
        {cells}
        <div className="flex justify-center">
          <StreakBadge streak={streak} />
        </div>
        <div className="flex items-center justify-end gap-0.5">
          {!isEditing && (
            <>
              <IconButton aria-label={`Rename ${habit.name}`} onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                aria-label={`Remove ${habit.name}`}
                onClick={() => archiveHabit(habit.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {/* Mobile: stacked card — name/streak/actions on one line, day cells
          on the next, matching the brief's "collapse into a vertical list" note. */}
      <div className="flex flex-col gap-2 px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2">
          {nameBlock}
          <StreakBadge streak={streak} />
          {!isEditing && (
            <>
              <IconButton aria-label={`Rename ${habit.name}`} onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                aria-label={`Remove ${habit.name}`}
                onClick={() => archiveHabit(habit.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </>
          )}
        </div>
        <div className="flex justify-between gap-1">{cells}</div>
      </div>
    </div>
  );
}
