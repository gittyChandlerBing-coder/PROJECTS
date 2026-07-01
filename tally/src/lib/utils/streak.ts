import { getTodayKey, parseDateKey, toDateKey } from "./date";

/**
 * Counts consecutive completed days ending at "today". A streak survives
 * until the day is actually over: if today isn't ticked yet, we count
 * backward from yesterday instead of zeroing out the moment someone opens
 * the app before their morning routine. It only truly breaks once a day
 * passes with no completion at all.
 */
export function calculateStreak(
  completionsForHabit: Record<string, boolean> | undefined,
  todayKey: string = getTodayKey()
): number {
  if (!completionsForHabit) return 0;

  let streak = 0;
  let cursor = parseDateKey(todayKey);

  if (!completionsForHabit[todayKey]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  // Safety cap: a few years of consecutive days is more than enough headroom
  // and guarantees this loop can never run away.
  for (let i = 0; i < 3650; i++) {
    const key = toDateKey(cursor);
    if (completionsForHabit[key]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
