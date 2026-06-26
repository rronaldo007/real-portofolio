import type { Accent, Section } from "@/lib/types";
import { ACCENT_HEX } from "@/lib/types";
import { Reveal } from "./Reveal";

/** The mono "● NN / label" eyebrow with a pulsing accent dot. */
export function Eyebrow({ number, label, accent }: { number: number; label: string; accent: Accent }) {
  const hex = ACCENT_HEX[accent];
  return (
    <div
      className="flex items-center font-mono uppercase"
      style={{ gap: 10, fontSize: 12, letterSpacing: "0.22em", color: "#5b6178", marginBottom: 14 }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: hex, boxShadow: `0 0 8px ${hex}`, animation: "pulseDot 1.8s infinite" }} />
      <span>{String(number).padStart(2, "0")} /</span>
      <span style={{ color: hex }}>{label}</span>
    </div>
  );
}

/** Section header row: eyebrow + big italic-serif title on the left, optional
 *  mono caption (e.g. "system readout") aligned to the bottom-right. */
export function SectionHeader({
  section,
  title,
  caption,
  titleAccent,
}: {
  section: Section;
  title?: string;
  caption?: string;
  /** Optional inline accent applied to the trailing word of the title. */
  titleAccent?: { word: string; accent: Accent };
}) {
  const heading = title ?? section.title;
  return (
    <Reveal
      className="flex items-end justify-between flex-wrap"
      style={{ gap: 14, marginBottom: "clamp(28px,5vw,48px)" }}
    >
      <div>
        <Eyebrow number={section.number} label={section.nav_label} accent={section.accent} />
        <h2
          className="m-0 font-serif italic"
          style={{ fontWeight: 400, fontSize: "clamp(40px,6.5vw,86px)", lineHeight: 0.9, letterSpacing: "-0.01em", color: "#eaecf5" }}
        >
          {titleAccent ? (
            <>
              {heading.replace(titleAccent.word, "").trimEnd()}{" "}
              <span style={{ color: ACCENT_HEX[titleAccent.accent] }}>{titleAccent.word}</span>
            </>
          ) : (
            heading
          )}
        </h2>
      </div>
      {caption && (
        <div className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: "0.16em", color: "#5b6178", paddingBottom: 10 }}>
          {caption}
        </div>
      )}
    </Reveal>
  );
}

/** Common <section> wrapper: anchors the scroll id and constrains width. */
export function SectionShell({
  id,
  children,
  maxWidth = 1200,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto ${className}`}
      style={{ maxWidth, padding: "clamp(70px,11vh,130px) clamp(20px,5vw,64px)" }}
    >
      {children}
    </section>
  );
}
