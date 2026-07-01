import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3",
          "text-sm text-ink placeholder:text-ink-faint",
          "transition-colors duration-100 focus-visible:outline-none focus-visible:border-accent",
          "focus-visible:ring-2 focus-visible:ring-accent/30",
          className
        )}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";
