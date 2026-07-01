"use client";

import { Mail, LogOut } from "lucide-react";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useAuth } from "@/context/AuthContext";
import { detectTimezone } from "@/lib/utils/date";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";

export function SettingsPanel() {
  const { user, signOut } = useAuth();
  const reminderEnabled = useSettingsStore((s) => s.reminderEnabled);
  const reminderTime = useSettingsStore((s) => s.reminderTime);
  const timezone = useSettingsStore((s) => s.timezone);
  const setReminderEnabled = useSettingsStore((s) => s.setReminderEnabled);
  const setReminderTime = useSettingsStore((s) => s.setReminderTime);
  const setTimezone = useSettingsStore((s) => s.setTimezone);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Daily email reminder</p>
            <p className="text-xs text-ink-muted">
              A summary of pending habits and tasks, sent once a day.
            </p>
          </div>
          <Switch
            checked={reminderEnabled}
            onChange={setReminderEnabled}
            label="Toggle daily email reminder"
          />
        </div>

        {reminderEnabled && (
          <div className="flex items-center justify-between rounded-[var(--radius-control)] border border-line bg-paper px-3 py-2.5">
            <label htmlFor="reminder-time" className="text-sm text-ink">
              Send at
            </label>
            <input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="tabular-nums rounded-[var(--radius-control)] border border-line-strong bg-surface px-2 py-1 text-sm text-ink focus-visible:outline-none focus-visible:border-accent"
            />
          </div>
        )}

        {reminderEnabled && (
          <div className="flex items-center justify-between text-xs text-ink-faint">
            <span>Timezone: {timezone}</span>
            <button
              type="button"
              onClick={() => setTimezone(detectTimezone())}
              className="text-accent hover:underline"
            >
              Use this device
            </button>
          </div>
        )}
      </section>

      <section className="flex items-center justify-between border-t border-line pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{user?.displayName ?? "Signed in"}</p>
            <p className="truncate text-xs text-ink-faint">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </section>
    </div>
  );
}
