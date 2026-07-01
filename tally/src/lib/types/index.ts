/**
 * Shared domain types. Kept in one file deliberately — this is a small app
 * and a single source of truth for shapes is easier to navigate than typing
 * scattered across a dozen files.
 */

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export interface Habit {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
  /** Soft-delete: archived habits keep their history for streak math but
   *  drop out of the active grid. Never hard-delete, history is the point. */
  archivedAt: string | null;
}

/** habitId -> dateKey ("YYYY-MM-DD", local time) -> completed */
export type HabitCompletions = Record<string, Record<string, boolean>>;

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO timestamp
  completedAt: string | null;
}

// ---------------------------------------------------------------------------
// Timers
// ---------------------------------------------------------------------------

export type TimerMode = "pomodoro" | "stopwatch";
export type PomodoroPhase = "work" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Number of work sessions completed before a long break is offered. */
  cyclesBeforeLongBreak: number;
}

// ---------------------------------------------------------------------------
// Settings / reminders
// ---------------------------------------------------------------------------

export interface ReminderSettings {
  reminderEnabled: boolean;
  /** 24h "HH:MM", interpreted in `timezone` below. */
  reminderTime: string;
  /** IANA timezone, e.g. "Asia/Kolkata". */
  timezone: string;
}

// ---------------------------------------------------------------------------
// Cloud sync (the "lightweight backend" half of the hybrid data approach)
// ---------------------------------------------------------------------------

/** The minimal, derived slice that travels to Firestore. Never the full
 *  habit/task history — just enough for the server-side cron job to write
 *  a meaningful reminder email. Source of truth for everything else stays
 *  in Local Storage. */
export interface CloudSnapshot {
  habitsPendingToday: Array<{ id: string; name: string; streak: number }>;
  pendingTasks: Array<{ id: string; title: string }>;
}

export interface UserDoc extends ReminderSettings {
  email: string;
  displayName: string | null;
  photoURL: string | null;
  snapshot: CloudSnapshot;
  lastReminderSentDate: string | null; // dateKey in user's timezone
  createdAt: unknown; // Firestore server timestamp on write, Timestamp on read
  updatedAt: unknown;
}
