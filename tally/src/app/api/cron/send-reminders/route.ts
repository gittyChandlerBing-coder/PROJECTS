import { NextResponse, type NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { sendReminderEmail } from "@/lib/email/sendReminder";
import { getDateKeyInTimezone, getTimeInTimezone } from "@/lib/utils/date";
import type { UserDoc } from "@/lib/types";

// Never statically cache/optimize a cron endpoint — every invocation needs
// a fresh read of the current time and Firestore state.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Fail closed: an unset secret must never be treated as "no auth required."
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * The server-side half of the "hybrid data approach": Local Storage on each
 * user's device is the real source of truth for their habits/tasks, but
 * this route only has (and only needs) the lightweight snapshot mirrored to
 * Firestore by useCloudSync. It's designed to be safe to invoke far more
 * often than once a day — see .github/workflows/send-reminders.yml, which
 * polls this endpoint every 15 minutes since Vercel's Hobby plan cron can't
 * express "once, at each user's own local time."
 *
 * A user is emailed once their local time has reached their chosen
 * reminderTime AND they haven't already been sent one today (tracked via
 * lastReminderSentDate) — so however often this route is polled, each user
 * gets exactly one email per day, sent as close to on-time as the poll
 * interval allows, and a missed invocation just gets caught by the next one.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminFirestore();
  const dueQuery = await db.collection("users").where("reminderEnabled", "==", true).get();

  let sent = 0;
  let skipped = 0;
  const errors: Array<{ uid: string; message: string }> = [];

  await Promise.all(
    dueQuery.docs.map(async (doc) => {
      const data = doc.data() as UserDoc;
      try {
        const timezone = data.timezone || "UTC";
        const todayKey = getDateKeyInTimezone(timezone);
        const currentTime = getTimeInTimezone(timezone);
        const reminderTime = data.reminderTime || "08:00";

        const alreadySentToday = data.lastReminderSentDate === todayKey;
        const timeHasArrived = timeToMinutes(currentTime) >= timeToMinutes(reminderTime);

        if (!data.email || alreadySentToday || !timeHasArrived) {
          skipped++;
          return;
        }

        await sendReminderEmail({
          to: data.email,
          displayName: data.displayName,
          snapshot: data.snapshot ?? { habitsPendingToday: [], pendingTasks: [] },
        });

        await doc.ref.update({ lastReminderSentDate: todayKey });
        sent++;
      } catch (err) {
        errors.push({
          uid: doc.id,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    })
  );

  return NextResponse.json({ checked: dueQuery.size, sent, skipped, errors });
}
