/**
 * All date-key math here is deliberately based on local `Date` getters
 * (getFullYear/getMonth/getDate), never `toISOString()`. `toISOString`
 * normalizes to UTC, which silently shifts "today" near midnight for any
 * user not at UTC+0 — exactly the bug the brief's "reset at 12:00 AM local
 * time" requirement is about avoiding.
 */

export type DateKey = string; // "YYYY-MM-DD"

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayKey(): DateKey {
  return toDateKey(new Date());
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function isFutureDateKey(key: DateKey): boolean {
  return key > getTodayKey();
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Monday-start week containing `reference`, as 7 local-midnight Dates. */
export function getWeekDates(reference: Date = new Date()): Date[] {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffFromMonday = (day + 6) % 7; // 0 if Monday, 6 if Sunday
  d.setDate(d.getDate() - diffFromMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    return nd;
  });
}

export function getWeekDayLabel(date: Date): string {
  const day = date.getDay();
  return WEEKDAY_LABELS[(day + 6) % 7] ?? "";
}

/** Milliseconds from now until the next local midnight, plus a small buffer
 *  so the rollover timer fires just after, not just before. */
export function msUntilNextLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime() + 1000;
}

export function formatTime(secondsTotal: number): string {
  const clamped = Math.max(0, Math.round(secondsTotal));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatStopwatch(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Best-effort IANA timezone of the current browser/runtime. */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** "HH:MM" for `date` (defaults to now) as it reads in IANA `timezone`. */
export function getTimeInTimezone(timezone: string, date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    // Unknown/invalid timezone string — fall back to UTC rather than throw,
    // since this runs unattended inside the cron route.
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }
}

/** dateKey ("YYYY-MM-DD") as it reads in IANA `timezone`, for `date` (defaults to now). */
export function getDateKeyInTimezone(timezone: string, date: Date = new Date()): DateKey {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value ?? "1970";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const d = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${y}-${m}-${d}`;
  } catch {
    return toDateKey(date);
  }
}

/** Absolute difference in minutes between two "HH:MM" strings, treating the
 *  day as a 24h ring (so 23:55 vs 00:05 are 10 minutes apart, not 1430). */
export function minutesDifference(timeA: string, timeB: string): number {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const a = toMinutes(timeA);
  const b = toMinutes(timeB);
  const diff = Math.abs(a - b);
  return Math.min(diff, 1440 - diff);
}
