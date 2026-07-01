import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-ink text-surface hover:bg-ink/90 active:bg-ink/80 disabled:bg-ink/40",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink/40 active:bg-paper disabled:opacity-50",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-line/50 disabled:opacity-40",
  danger:
    "bg-transparent text-danger border border-danger/30 hover:bg-danger-soft active:bg-danger-soft disabled:opacity-40",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-control)] font-medium",
          "transition-[background-color,border-color,color,transform] duration-100",
          "active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
