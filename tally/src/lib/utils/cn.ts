import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combine conditional classnames and resolve conflicting Tailwind utility
 *  classes (e.g. a prop-supplied "p-2" correctly overriding a default
 *  "p-4") rather than leaving both in the string. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
