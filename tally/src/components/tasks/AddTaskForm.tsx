"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";

export function AddTaskForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const addTask = useTaskStore((s) => s.addTask);
  const inputRef = useRef<HTMLInputElement>(null);

  function openAndFocus() {
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setIsOpen(false);
      return;
    }
    addTask(value);
    setValue("");
    inputRef.current?.focus();
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={openAndFocus}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-ink-muted transition-colors hover:text-ink sm:px-5"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add a task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 sm:px-5">
      <TextInput
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (!value.trim()) setIsOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setValue("");
            setIsOpen(false);
          }
        }}
        placeholder="e.g. Reply to client email"
        maxLength={140}
      />
      <Button type="submit" variant="primary" size="sm">
        Add
      </Button>
    </form>
  );
}
