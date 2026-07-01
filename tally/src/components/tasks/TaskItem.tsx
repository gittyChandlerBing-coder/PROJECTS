"use client";

import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "@/components/ui/IconButton";

export function TaskItem({ task }: { task: Task }) {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const removeTask = useTaskStore((s) => s.removeTask);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    if (task.completed) return;
    setDraft(task.title);
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function commit() {
    if (draft.trim()) updateTask(task.id, draft);
    setIsEditing(false);
  }

  return (
    <div className="group flex items-center gap-3 border-t border-line px-4 py-2.5 first:border-t-0 sm:px-5">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        onClick={() => toggleTask(task.id)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-cell)] border transition-colors duration-100",
          task.completed
            ? "border-accent bg-accent-soft"
            : "border-line-strong hover:border-ink/40"
        )}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent" fill="none">
            <path
              d="M4 12.5L9.5 18L20 6"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {isEditing ? (
        <form
          className="min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
            maxLength={140}
            className="h-7 w-full rounded-[var(--radius-control)] border border-accent bg-surface px-2 text-sm text-ink focus-visible:outline-none"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className={cn(
            "min-w-0 flex-1 truncate text-left text-sm",
            task.completed ? "text-ink-faint line-through" : "text-ink"
          )}
        >
          {task.title}
        </button>
      )}

      <IconButton
        aria-label={`Delete "${task.title}"`}
        onClick={() => removeTask(task.id)}
        className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  );
}
