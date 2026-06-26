import type { Experience, Section } from "@/lib/types";
import { ACCENT_HEX } from "@/lib/types";
import { SectionHeader, SectionShell } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { rgba } from "@/lib/accent";

function Row({ x, last, delay }: { x: Experience; last: boolean; delay: number }) {
  const hex = ACCENT_HEX[x.accent];
  return (
    <Reveal delay={delay} className="relative" style={{ marginBottom: last ? 0 : "clamp(42px,5vw,60px)" }}>
      <span style={{ position: "absolute", left: -34, top: 5, width: 13, height: 13, borderRadius: "50%", background: "#05060B", border: `2px solid ${hex}`, boxShadow: `0 0 12px ${rgba(hex, 0.6)}` }} />
      <div className="flex flex-wrap" style={{ gap: "18px 44px" }}>
        <div className="font-mono" style={{ flex: "0 0 auto", width: 108, fontSize: 12, letterSpacing: "0.1em", color: hex, paddingTop: 5 }}>
          {x.when}
        </div>
        <div style={{ flex: "1 1 360px", minWidth: 240 }}>
          <h3 className="font-serif italic" style={{ margin: "0 0 12px", fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 400, color: "#eaecf5" }}>
            {x.title}, {x.company}
          </h3>
          {x.description && (
            <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.7, color: "#9aa1b8" }}>{x.description}</p>
          )}
          {x.highlights.length > 0 && (
            <ul className="flex flex-col" style={{ margin: 0, padding: 0, listStyle: "none", gap: 10 }}>
              {x.highlights.map((h, j) => (
                <li key={j} className="flex items-start" style={{ gap: 11, fontSize: 14.5, lineHeight: 1.55, color: "#cdd3e6" }}>
                  <span style={{ flex: "0 0 auto", width: 6, height: 6, marginTop: 7, borderRadius: 2, background: hex, boxShadow: `0 0 8px ${rgba(hex, 0.7)}` }} />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="font-mono" style={{ flex: "0 1 220px", minWidth: 190, fontSize: 12 }}>
          <div style={{ marginBottom: 7 }}>
            <span style={{ color: "#5b6178" }}>TYPE</span> <span style={{ color: "#cdd3e6" }}>Alternance · Full-stack</span>
          </div>
          {x.location && (
            <div style={{ marginBottom: 18 }}>
              <span style={{ color: "#5b6178" }}>LOC</span> <span style={{ color: "#cdd3e6" }}>{x.location}</span>
            </div>
          )}
          <div className="flex flex-wrap" style={{ gap: 7 }}>
            {x.tags.map((t) => (
              <span key={t} style={{ fontSize: 11.5, color: x.accent === "cyan" ? "#8eeeff" : "#c4a9ff", border: `1px solid ${rgba(hex, 0.35)}`, background: rgba(hex, 0.08), borderRadius: 5, padding: "5px 10px" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Timeline({ section, experiences }: { section: Section; experiences: Experience[] }) {
  if (!experiences.length) return null;
  return (
    <SectionShell id={section.key} maxWidth={1120}>
      <SectionHeader section={section} caption="experience" />
      <div className="relative" style={{ paddingLeft: 34 }}>
        <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 1, background: "linear-gradient(180deg, #9B6BFF, rgba(155,107,255,.05))" }} />
        {experiences.map((x, i) => (
          <Row key={`${x.company}-${x.when}`} x={x} last={i === experiences.length - 1} delay={i * 0.08} />
        ))}
      </div>
    </SectionShell>
  );
}
