"use client";

import { Header } from "./Header";
import { HabitGrid } from "@/components/habits/HabitGrid";
import { TaskList } from "@/components/tasks/TaskList";
import { TimerWidget } from "@/components/timers/TimerWidget";
import { FocusModeOverlay } from "@/components/timers/FocusModeOverlay";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCloudSync } from "@/lib/sync/useCloudSync";

export function DashboardShell() {
  // Mirrors reminder settings + a small derived snapshot up to Firestore,
  // debounced, whenever signed in — see useCloudSync for the "hybrid data
  // approach" this implements.
  useCloudSync();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
        {/* On mobile the timer sits near the top, reachable without
            scrolling past the habit grid, per the brief's own layout note.
            On desktop it becomes a sticky right-hand sidebar instead. */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Timer</CardTitle>
            </CardHeader>
            <div className="px-5 pb-6 pt-2">
              <TimerWidget />
            </div>
          </Card>
        </div>

        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <HabitGrid />
          <TaskList />
        </div>
      </main>

      <FocusModeOverlay />
    </div>
  );
}
