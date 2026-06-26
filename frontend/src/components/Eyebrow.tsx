import type { Accent } from "@/lib/types";
import { ACCENT_HEX } from "@/lib/types";

/** Mono section eyebrow: a pulsing accent dot, then "NN /  label". */
export function Eyebrow({
  number,
  label,
  accent = "violet",
}: {
  number?: number;
  label: string;
  accent?: Accent;
}) {
  const hex = ACCENT_HEX[accent];
  return (
    <div
      className="flex items-center gap-2.5 font-mono uppercase"
      style={{ fontSize: 12, letterSpacing: "0.22em", color: "#5b6178" }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: hex,
          boxShadow: `0 0 8px ${hex}`,
          animation: "pulseDot 1.8s infinite",
        }}
      />
      {number != null && <span>{String(number).padStart(2, "0")} /</span>}
      <span style={{ color: hex }}>{label}</span>
    </div>
  );
}
