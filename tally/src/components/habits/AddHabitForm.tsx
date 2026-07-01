"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useHabitStore } from "@/lib/store/useHabitStore";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";

export function AddHabitForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const addHabit = useHabitStore((s) => s.addHabit);
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
    addHabit(value);
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
        Add a habit
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
        placeholder="e.g. Read for 20 minutes"
        maxLength={80}
      />
      <Button type="submit" variant="primary" size="sm">
        Add
      </Button>
    </form>
  );
}
