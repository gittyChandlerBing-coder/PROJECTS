"use client";

import { useEffect } from "react";
import { Minimize2 } from "lucide-react";
import { useTimerStore } from "@/lib/store/useTimerStore";
import { TimerWidget } from "./TimerWidget";
import { Logo } from "@/components/ui/Logo";

/**
 * Hides every other piece of UI (habit grid, task list, header nav) so the
 * timer is the only thing on screen — the brief's "Focus Mode" requirement.
 * Rendered conditionally at the page root rather than as a modal, so
 * there's no lingering DOM/CSS from the rest of the dashboard competing for
 * attention or a11y focus underneath it.
 */
export function FocusModeOverlay() {
  const focusMode = useTimerStore((s) => s.focusMode);
  const setFocusMode = useTimerStore((s) => s.setFocusMode);

  useEffect(() => {
    if (!focusMode) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setFocusMode(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusMode, setFocusMode]);

  if (!focusMode) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-paper px-4">
      <button
        type="button"
        onClick={() => setFocusMode(false)}
        aria-label="Exit focus mode"
        className="absolute right-5 top-5 flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-line/50 hover:text-ink"
      >
        <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
        Exit
      </button>

      <Logo className="h-6 w-6 text-ink-faint" />

      <TimerWidget size={280} showFocusToggle={false} />

      <p className="text-xs text-ink-faint">Press Esc to exit</p>
    </div>
  );
}
