import type { Accent } from "./types";

/** Maps an accent token to the CSS class that sets `--accent` on a subtree. */
export const accentClass = (a: Accent) => `accent-${a}`;

/** rgba() string from a #rrggbb hex and an alpha. */
export function rgba(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
