import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import type { CloudSnapshot, ReminderSettings } from "@/lib/types";

function userRef(uid: string) {
  return doc(db, "users", uid);
}

interface BasicProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  timezone: string;
}

/** Creates the user's Firestore doc with sane defaults on first sign-in.
 *  On subsequent sign-ins it just refreshes profile fields (merge), leaving
 *  anything the user has since configured (reminderTime, etc.) untouched. */
export async function ensureUserDocument(profile: BasicProfile): Promise<void> {
  const ref = userRef(profile.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: profile.email ?? "",
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      timezone: profile.timezone,
      reminderEnabled: false,
      reminderTime: "08:00",
      snapshot: { habitsPendingToday: [], pendingTasks: [] } satisfies CloudSnapshot,
      lastReminderSentDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(
    ref,
    {
      email: profile.email ?? "",
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** The debounced push from useCloudSync — settings + the derived snapshot,
 *  written together so the cron job always sees a consistent pair. */
export async function syncUserCloudState(
  uid: string,
  data: ReminderSettings & { snapshot: CloudSnapshot }
): Promise<void> {
  await setDoc(
    userRef(uid),
    {
      reminderEnabled: data.reminderEnabled,
      reminderTime: data.reminderTime,
      timezone: data.timezone,
      snapshot: data.snapshot,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
