import type { SiteSettings } from "@/lib/types";
import { SolarSystem } from "@/components/SolarSystem";
import { Typewriter } from "@/components/Typewriter";

function Telemetry({ k, v, color }: { k: string; v: string; color: string }) {
  return (
    <span>
      {k}&nbsp;<b style={{ color, fontWeight: 500 }}>{v}</b>
    </span>
  );
}

export function Hero({ settings }: { settings: SiteSettings }) {
  // Solid line = given name (last token), outlined line = the rest — matches the
  // reference's "RONALDO" (solid) over "RUKUNDO" (violet outline).
  const parts = settings.full_name.trim().split(/\s+/);
  const solid = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const outlined = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];

  // Typewriter loop — current, CV-accurate.
  const phrases = [
    "full_stack_developer",
    "python / django / drf",
    "status: learning_AI",
    "mastère_IA · epitech_2026",
  ];

  const chips = [
    { label: "SHIPPING — VIDEO PLANNER", hex: "#C6FF3A", glow: "rgba(198,255,58," },
    { label: "LEARNING — MASTÈRE IA · EPITECH 2026", hex: "#9B6BFF", glow: "rgba(155,107,255," },
    { label: "BACKEND PYTHON · DJANGO / DRF", hex: "#2BF1FF", glow: "rgba(43,241,255," },
  ];

  return (
    <section
      id="top"
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: "100vh", padding: "120px clamp(20px,5vw,64px) 90px" }}
    >
      <SolarSystem />

      <div className="relative w-full" style={{ zIndex: 3, maxWidth: 920 }}>
        {/* telemetry */}
        <div
          className="flex flex-wrap font-mono"
          style={{ gap: "18px 30px", fontSize: 13, letterSpacing: "0.08em", color: "#6f768f", marginBottom: "clamp(24px,4vw,44px)" }}
        >
          <Telemetry k="LAT" v={settings.lat || "—"} color="#9B6BFF" />
          <Telemetry k="LON" v={settings.lon || "—"} color="#9B6BFF" />
          <Telemetry k="STATUS" v="ONLINE" color="#C6FF3A" />
          <Telemetry k="STACK" v="FULL" color="#2BF1FF" />
        </div>

        {/* name */}
        <h1
          className="m-0 font-serif italic uppercase"
          style={{ fontWeight: 400, lineHeight: 0.84, fontSize: "clamp(66px,13.5vw,212px)" }}
        >
          <span className="block" style={{ color: "#F4F1FF", textShadow: "0 0 42px rgba(155,107,255,.55), 0 0 95px rgba(155,107,255,.25)" }}>
            {solid}
          </span>
          <span className="block" style={{ color: "transparent", WebkitTextStroke: "1.5px #9B6BFF", filter: "drop-shadow(0 0 24px rgba(155,107,255,.4))" }}>
            {outlined}
          </span>
        </h1>

        {/* typewriter */}
        <div style={{ marginTop: "clamp(22px,4vw,40px)" }}>
          <Typewriter phrases={phrases} />
        </div>

        {/* status chips */}
        <div className="flex flex-wrap font-mono" style={{ gap: 12, marginTop: "clamp(28px,4vw,46px)", fontSize: 12, letterSpacing: "0.1em" }}>
          {chips.map((c, n) => (
            <span
              key={c.label}
              className="inline-flex items-center"
              style={{ gap: 9, padding: "9px 15px", borderRadius: 999, border: `1px solid ${c.glow}.22)`, background: `${c.glow}.04)`, color: "#cdd3e6" }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.hex, animation: `pulseDot 1.8s infinite ${n * 0.4}s` }} />
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* scroll cue */}
      <a
        href="#about"
        className="absolute flex flex-col items-center font-mono uppercase"
        style={{ bottom: 30, left: "50%", transform: "translateX(-50%)", gap: 10, fontSize: 11, letterSpacing: "0.22em", color: "#5b6178", zIndex: 3 }}
      >
        scroll to explore
        <span style={{ position: "relative", width: 20, height: 30, border: "1px solid rgba(255,255,255,.18)", borderRadius: 12, overflow: "hidden" }}>
          <span style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: 3, height: 6, borderRadius: 2, background: "#9B6BFF", animation: "scrollcue 1.7s ease-in-out infinite" }} />
        </span>
      </a>
    </section>
  );
}
