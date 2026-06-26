import type { Education as Edu, Section } from "@/lib/types";
import { ACCENT_HEX } from "@/lib/types";
import { SectionHeader, SectionShell } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { rgba } from "@/lib/accent";

// Derive the big ghost watermark ("N6"/"N7") from the RNCP level text.
function levelMark(rncp: string) {
  const m = rncp.match(/(\d+)/);
  return m ? `N${m[1]}` : "";
}

function Card({ edu, delay }: { edu: Edu; delay: number }) {
  const hex = ACCENT_HEX[edu.accent];
  const light = edu.accent === "lime" ? "#d6f58a" : "#8eeeff";
  return (
    <Reveal
      delay={delay}
      as="article"
      className="relative overflow-hidden"
      style={{
        flex: "1 1 340px",
        minWidth: 0,
        border: `1px solid ${rgba(hex, edu.is_target ? 0.32 : 0.25)}`,
        borderRadius: 18,
        padding: "clamp(26px,2.6vw,34px)",
        background: `linear-gradient(165deg, ${rgba(hex, edu.is_target ? 0.08 : 0.07)}, rgba(10,12,20,.55) 62%)`,
        transform: edu.is_target ? "translateY(-10px)" : undefined,
        boxShadow: edu.is_target ? "0 18px 44px rgba(0,0,0,.35)" : undefined,
      }}
    >
      <div className="font-mono" style={{ position: "absolute", bottom: -26, right: 8, fontWeight: 700, fontSize: "clamp(110px,15vw,168px)", lineHeight: 1, color: "transparent", WebkitTextStroke: `1.5px ${rgba(hex, 0.13)}`, pointerEvents: "none" }}>
        {levelMark(edu.rncp_level)}
      </div>
      <div className="relative flex flex-wrap items-center justify-between" style={{ gap: 10, marginBottom: 22 }}>
        <span className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: "0.14em", color: light, border: `1px solid ${rgba(hex, 0.4)}`, padding: "6px 12px", borderRadius: 6 }}>
          {edu.rncp_level || "FORMATION"}
        </span>
        {edu.status && (
          <span className="inline-flex items-center font-mono uppercase" style={{ gap: 8, fontSize: 11, letterSpacing: "0.12em", color: hex }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: hex, boxShadow: `0 0 8px ${hex}`, animation: "pulseDot 1.8s infinite" }} />
            {edu.status}
          </span>
        )}
      </div>
      <h3 className="relative font-serif italic" style={{ margin: "0 0 12px", fontWeight: 400, fontSize: "clamp(26px,3vw,38px)", lineHeight: 1, color: "#eaecf5" }}>
        {edu.title}
      </h3>
      <div className="relative font-mono" style={{ fontSize: 13, color: light, marginBottom: 18 }}>
        {edu.institution}
        {edu.when && <span style={{ color: "#5b6178" }}> · {edu.when}</span>}
      </div>
      {(edu.focus || edu.description) && (
        <p className="relative" style={{ margin: 0, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.09)", fontSize: 14.5, lineHeight: 1.65, color: "#9aa1b8" }}>
          {edu.focus || edu.description}
        </p>
      )}
    </Reveal>
  );
}

export function Education({ section, education }: { section: Section; education: Edu[] }) {
  if (!education.length) return null;
  return (
    <SectionShell id={section.key}>
      <SectionHeader section={section} caption="credentials" />
      <div className="flex flex-col" style={{ gap: 18 }}>
        <div className="flex flex-wrap items-stretch" style={{ gap: 18 }}>
          {education.map((e, i) => (
            <Card key={`${e.title}-${e.institution}`} edu={e} delay={i * 0.08} />
          ))}
        </div>
        {/* coursework + clearance gauge */}
        <div className="flex flex-wrap items-stretch" style={{ gap: 18 }}>
          <Reveal delay={0.12} style={{ flex: "1 1 300px", minWidth: 0, border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "clamp(22px,2.4vw,30px)" }}>
            <div className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: "0.18em", color: "#5b6178", marginBottom: 18 }}>{"// also · coursework"}</div>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {["VISIPLUS Academy", "Commercial English", "Cybersecurity"].map((c) => (
                <span key={c} className="font-mono" style={{ fontSize: 12.5, color: "#aab0c6", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", borderRadius: 5, padding: "7px 12px" }}>
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.18} className="flex flex-col justify-center" style={{ flex: "1 1 300px", minWidth: 0, border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "clamp(22px,2.4vw,30px)" }}>
            <div className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: "0.18em", color: "#5b6178", marginBottom: 26 }}>academic clearance</div>
            <div className="relative">
              <div style={{ height: 3, borderRadius: 3, background: "linear-gradient(90deg,#2BF1FF,#C6FF3A)" }} />
              <span style={{ position: "absolute", top: 1.5, left: 0, transform: "translate(-3px,-50%)", width: 13, height: 13, borderRadius: "50%", background: "#0a0c14", border: "2px solid #2BF1FF", boxShadow: "0 0 10px rgba(43,241,255,.6)" }} />
              <span style={{ position: "absolute", top: 1.5, right: 0, transform: "translate(3px,-50%)", width: 13, height: 13, borderRadius: "50%", background: "#0a0c14", border: "2px solid #C6FF3A", boxShadow: "0 0 10px rgba(198,255,58,.6)" }} />
            </div>
            <div className="flex justify-between font-mono" style={{ marginTop: 16, fontSize: 11, letterSpacing: "0.14em" }}>
              <span style={{ color: "#2BF1FF" }}>NIV. 6</span>
              <span style={{ color: "#C6FF3A" }}>NIV. 7</span>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
