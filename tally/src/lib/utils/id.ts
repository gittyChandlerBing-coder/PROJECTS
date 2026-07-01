/** Wraps the Web Crypto UUID so call sites don't import a browser API
 *  directly, and so a polyfill could be swapped in centrally if a target
 *  environment ever lacked it. */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Extremely unlikely fallback (very old browsers / odd SSR edge cases).
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
