import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 py-6 text-center text-sm text-ink-faint sm:px-5">{children}</p>
  );
}
