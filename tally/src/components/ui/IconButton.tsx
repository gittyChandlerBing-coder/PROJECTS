import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)]",
          "text-ink-muted transition-[background-color,color,transform] duration-100",
          "hover:bg-line/50 hover:text-ink active:scale-90",
          active && "bg-accent-soft text-accent",
          className
        )}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";
