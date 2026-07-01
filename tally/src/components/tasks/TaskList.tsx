"use client";

import { useMemo } from "react";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const hasHydrated = useTaskStore((s) => s._hasHydrated);
  const clearCompleted = useTaskStore((s) => s.clearCompleted);

  const { pending, completed } = useMemo(() => {
    return {
      pending: tasks.filter((t) => !t.completed),
      completed: tasks.filter((t) => t.completed),
    };
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        {completed.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompleted}>
            Clear completed
          </Button>
        )}
      </CardHeader>

      {!hasHydrated ? (
        <EmptyState>Loading…</EmptyState>
      ) : tasks.length === 0 ? (
        <EmptyState>No tasks yet. Add one to get started.</EmptyState>
      ) : (
        <div>
          {pending.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {completed.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}

      <div className="border-t border-line">
        <AddTaskForm />
      </div>
    </Card>
  );
}
