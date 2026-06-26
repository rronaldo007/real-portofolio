import type { Section, SiteSettings } from "@/lib/types";
import { SectionHeader, SectionShell } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";

function Meta({ label, value, color = "#cdd3e6" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#0a0c14", padding: "20px 22px" }}>
      <div className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "#5b6178", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 15, color }}>{value}</div>
    </div>
  );
}

function Step({ when, label, color, dot, ring, pulse }: { when: string; label: string; color: string; dot: string; ring?: boolean; pulse?: boolean }) {
  return (
    <div className="relative" style={{ flex: 1, minWidth: 0 }}>
      <span
        style={{
          display: "block",
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: ring ? "#0a0c14" : dot,
          border: ring ? "2px solid rgba(255,255,255,.25)" : undefined,
          boxShadow: ring ? undefined : `0 0 12px ${dot}`,
          marginBottom: 16,
          animation: pulse ? "pulseDot 1.8s infinite" : undefined,
        }}
      />
      <div className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color, marginBottom: 6 }}>{when}</div>
      <div className="font-mono" style={{ fontSize: 12, lineHeight: 1.5, color: "#cdd3e6" }}>{label}</div>
    </div>
  );
}

/** The little ringed planet + "based in lyon" coordinates card. */
function PlanetCard({ settings }: { settings: SiteSettings }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ border: "1px solid rgba(155,107,255,.2)", borderRadius: 18, background: "linear-gradient(165deg, rgba(155,107,255,.08), rgba(10,12,20,.6) 60%)", gap: 26, padding: "clamp(34px,4vw,48px) 20px" }}
    >
      <div className="relative" style={{ width: 150, height: 150, animation: "floaty 7s ease-in-out infinite" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 212, height: 212, transform: "translate(-50%,-50%) rotateX(74deg)", borderRadius: "50%", border: "1px solid rgba(43,241,255,.35)", boxShadow: "0 0 14px rgba(43,241,255,.2)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 212, height: 212, transform: "translate(-50%,-50%) rotateX(74deg)", borderRadius: "50%", borderTop: "2px solid #2BF1FF", borderLeft: "2px solid rgba(43,241,255,.5)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: "radial-gradient(circle at 36% 30%, #d6c7ff, #9B6BFF 45%, #5b34c9 78%, #371d82)", boxShadow: "0 0 50px rgba(155,107,255,.5), inset -12px -10px 32px rgba(0,0,0,.45)" }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(96deg, transparent 0 13px, rgba(255,255,255,.06) 13px 15px)" }} />
        </div>
      </div>
      <div className="text-center font-mono" style={{ fontSize: 13, lineHeight: 1.7, color: "#8a90a6" }}>
        based in <span style={{ color: "#cdd3e6" }}>{(settings.location || "lyon").split(",")[0].toLowerCase()}</span>
        <br />
        <span style={{ color: "#9B6BFF" }}>{settings.lat}°N · {settings.lon}°E</span>
      </div>
    </div>
  );
}

export function About({ section, settings, portrait }: { section: Section; settings: SiteSettings; portrait: string | null }) {
  const bio = (settings.bio || "").split("\n").map((p) => p.trim()).filter(Boolean);
  const lead = bio[0] ?? settings.tagline;
  const body = bio.slice(1);

  return (
    <SectionShell id={section.key}>
      <SectionHeader section={section} />
      <div className="flex flex-wrap items-start" style={{ gap: "clamp(26px,3vw,48px)" }}>
        {/* LEFT */}
        <div className="flex flex-col" style={{ flex: "2.4 1 440px", minWidth: 0, gap: "clamp(28px,4vw,42px)" }}>
          <Reveal delay={0.05}>
            {lead && (
              <p style={{ margin: "0 0 24px", fontSize: "clamp(22px,3.2vw,38px)", lineHeight: 1.28, letterSpacing: "-0.01em", fontWeight: 500, color: "#eaecf5" }}>
                {lead}
              </p>
            )}
            {body.map((p, i) => (
              <p key={i} style={{ margin: "0 0 14px", fontSize: "clamp(15px,1.7vw,18px)", lineHeight: 1.7, color: "#9aa1b8", maxWidth: "62ch" }}>
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.12} className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
            <Meta label="LOCATION" value={settings.location || "Lyon, Ecully"} />
            <Meta label="ROLE" value={settings.tagline || "Full-stack developer"} />
            <Meta label="CURRENT" value={settings.availability || "Recherche alternance"} color="#9B6BFF" />
            <Meta label="NEXT" value="Mastère IA · Epitech" color="#C6FF3A" />
          </Reveal>

          <Reveal delay={0.18}>
            <div className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: "0.22em", color: "#5b6178", marginBottom: 22 }}>{"// the plan"}</div>
            <div className="relative flex justify-between" style={{ gap: 14 }}>
              <div style={{ position: "absolute", top: 6, left: 6, right: 6, height: 1, background: "linear-gradient(90deg, #9B6BFF, rgba(155,107,255,.15))" }} />
              <Step when="NOW" label="Projets full-stack · Video Planner" color="#8a90a6" dot="#9B6BFF" />
              <Step when="2025" label="Bachelor Dev Web · ISCOD" color="#8a90a6" dot="#9B6BFF" ring />
              <Step when="2026" label="Mastère IA · Epitech" color="#C6FF3A" dot="#C6FF3A" pulse />
              <Step when="GOAL" label="Ingénieur IA / Data" color="#8a90a6" dot="#9B6BFF" ring />
            </div>
          </Reveal>
        </div>

        {/* RIGHT */}
        <Reveal delay={0.1} className="flex flex-col" style={{ flex: "1 1 320px", minWidth: 280, gap: 22 }}>
          <div
            className="relative"
            style={{ height: "clamp(300px,40vh,380px)", border: "1px solid rgba(155,107,255,.2)", borderRadius: 18, overflow: "hidden", background: "linear-gradient(165deg, rgba(155,107,255,.08), rgba(10,12,20,.6) 60%)" }}
          >
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portrait} alt={settings.full_name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div className="absolute inset-0 grid place-items-center font-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "#5b6178" }}>
                portrait
              </div>
            )}
            <span className="font-mono uppercase" style={{ position: "absolute", top: 14, left: 14, fontSize: 10, letterSpacing: "0.16em", color: "#cdb6ff", background: "rgba(8,9,14,.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(155,107,255,.3)", padding: "6px 11px", borderRadius: 999 }}>
              portrait
            </span>
          </div>
          <PlanetCard settings={settings} />
        </Reveal>
      </div>
    </SectionShell>
  );
}
