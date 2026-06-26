import type { Section, SiteSettings } from "@/lib/types";
import { Eyebrow } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";

import { rgba } from "@/lib/accent";

const GH = "M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z";
const LI = "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z";

// Pretty handle: drop the protocol and any trailing slash.
const strip = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** One social link: accent icon chip, network name + handle, nudging arrow. */
function SocialLink({ href, icon, name, handle, hex, mail, phone }: { href: string; icon?: string; name: string; handle: string; hex: string; mail?: boolean; phone?: boolean }) {
  const outline = mail || phone;
  return (
    <a
      href={href}
      target={mail ? undefined : "_blank"}
      rel="noopener"
      className="slink flex items-center"
      style={
        {
          gap: 14,
          width: "100%",
          maxWidth: 440,
          boxSizing: "border-box",
          padding: "12px 16px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(255,255,255,.02)",
          "--sl": hex,
          "--sl-soft": rgba(hex, 0.08),
          "--sl-glow": rgba(hex, 0.18),
        } as React.CSSProperties
      }
    >
      <span className="slchip grid place-items-center" style={{ flex: "0 0 auto", width: 42, height: 42, borderRadius: 11, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)", color: hex }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill={outline ? "none" : "currentColor"} stroke={outline ? "currentColor" : undefined} strokeWidth={outline ? 1.8 : undefined} strokeLinecap="round" strokeLinejoin="round">
          {mail ? (
            <>
              <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
              <path d="M3 6l9 6 9-6" />
            </>
          ) : phone ? (
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          ) : (
            <path d={icon} />
          )}
        </svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="font-mono uppercase" style={{ display: "block", fontSize: 10.5, letterSpacing: "0.16em", color: "#7e89a8", marginBottom: 2 }}>{name}</span>
        <span style={{ display: "block", fontSize: 14, color: "#eaecf5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{handle}</span>
      </span>
      <span className="slarr" style={{ flex: "0 0 auto", color: hex, fontSize: 16, lineHeight: 1 }}>↗</span>
    </a>
  );
}

/** The Saturn-like ringed planet in the contact card. */
function RingedPlanet() {
  return (
    <div className="relative" style={{ width: "min(60%,210px)", aspectRatio: "1", perspective: 780 }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: "rotateX(6deg)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "150%", aspectRatio: "1", transform: "translate(-50%,-50%) rotateX(76deg)", borderRadius: "50%", border: "3px solid rgba(43,241,255,.3)", clipPath: "inset(0 0 50% 0)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "152%", aspectRatio: "1", transform: "translate(-50%,-50%) rotateX(76deg)", transformStyle: "preserve-3d", animation: "spin 11s linear infinite" }}>
          <div style={{ position: "absolute", top: -6, left: "50%", width: 12, height: 12, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff, #cdd6ff 60%, #6b76a8)", boxShadow: "0 0 8px #aab8ff", transform: "translateX(-50%) rotateX(-76deg)" }} />
        </div>
        <div style={{ position: "absolute", inset: "15%", borderRadius: "50%", overflow: "hidden", background: "radial-gradient(circle at 36% 30%, #d6c7ff, #9B6BFF 46%, #5b34c9 80%, #371d82)", boxShadow: "0 0 50px rgba(155,107,255,.5), inset -12px -10px 30px rgba(0,0,0,.45)" }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(94deg, transparent 0 11px, rgba(255,255,255,.06) 11px 13px)" }} />
        </div>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "150%", aspectRatio: "1", transform: "translate(-50%,-50%) rotateX(76deg)", borderRadius: "50%", border: "3px solid #2BF1FF", clipPath: "inset(50% 0 0 0)", boxShadow: "0 0 12px rgba(43,241,255,.5)" }} />
      </div>
    </div>
  );
}

export function Contact({ section, settings }: { section: Section; settings: SiteSettings }) {
  return (
    <section id={section.key} className="relative mx-auto" style={{ maxWidth: 1200, padding: "clamp(80px,12vh,150px) clamp(20px,5vw,64px) clamp(50px,7vh,90px)" }}>
      <div className="flex flex-wrap items-stretch" style={{ gap: "clamp(20px,2.4vw,30px)" }}>
        {/* left */}
        <Reveal className="flex flex-col" style={{ flex: "1.1 1 360px", minWidth: 280 }}>
          <Eyebrow number={section.number} label={section.nav_label} accent={section.accent} />
          <h2 className="m-0 font-serif italic" style={{ fontWeight: 400, fontSize: "clamp(44px,6.5vw,86px)", letterSpacing: "-0.01em", lineHeight: 0.9, color: "#eaecf5" }}>
            Let us build<br />something.
          </h2>
          <div className="flex flex-col items-start" style={{ marginTop: "auto", paddingTop: "clamp(34px,6vh,64px)", gap: 10 }}>
            {settings.github && <SocialLink href={settings.github} icon={GH} name="GitHub" handle={strip(settings.github)} hex="#9B6BFF" />}
            {settings.linkedin && <SocialLink href={settings.linkedin} icon={LI} name="LinkedIn" handle={strip(settings.linkedin)} hex="#2BF1FF" />}
            {settings.phone && <SocialLink href={`tel:${settings.phone.replace(/\D/g, "").replace(/^0/, "+33")}`} name="Téléphone" handle={settings.phone} hex="#C6FF3A" phone />}
            {settings.email && <SocialLink href={`mailto:${settings.email}`} name="Email" handle={settings.email} hex="#FF7AD9" mail />}
            {settings.cv && (
              <a
                href={settings.cv}
                download
                className="slink-cta inline-flex items-center justify-center font-mono uppercase"
                style={{ gap: 10, width: "100%", maxWidth: 440, boxSizing: "border-box", marginTop: 6, padding: "15px 18px", borderRadius: 14, background: "#C6FF3A", color: "#0b1004", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CV
              </a>
            )}
          </div>
        </Reveal>

        {/* right — planet card */}
        <Reveal delay={0.1} className="relative grid place-items-center" style={{ flex: "1 1 360px", minWidth: 280, border: "1px solid rgba(155,107,255,.18)", borderRadius: 18, overflow: "hidden", background: "linear-gradient(165deg, rgba(155,107,255,.06), rgba(8,9,14,.6) 60%)", minHeight: "clamp(340px,46vh,440px)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 55% 50%, rgba(155,107,255,.24), rgba(43,241,255,.1) 45%, transparent 72%)", filter: "blur(34px)" }} />
          <RingedPlanet />
          <span className="font-mono uppercase" style={{ position: "absolute", top: 16, left: 16, fontSize: 10.5, letterSpacing: "0.14em", color: "#8eeeff", background: "rgba(8,9,14,.5)", backdropFilter: "blur(6px)", border: "1px solid rgba(43,241,255,.3)", padding: "6px 12px", borderRadius: 999 }}>
            · orbit
          </span>
          <div className="font-mono text-right" style={{ position: "absolute", bottom: 14, right: 16, fontSize: 12, lineHeight: 1.6, color: "#8a90a6" }}>
            based in <span style={{ color: "#cdd3e6" }}>{(settings.location || "lyon").split(",")[0].toLowerCase()}</span>
            <br />
            <span style={{ color: "#9B6BFF" }}>{settings.lat}°N · {settings.lon}°E</span>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="flex flex-wrap justify-between font-mono" style={{ marginTop: "clamp(40px,6vh,72px)", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.07)", gap: 12, fontSize: 12, letterSpacing: "0.08em", color: "#5b6178" }}>
        <span>{settings.full_name.toUpperCase()} / {(settings.location || "LYON").split(",")[0].toUpperCase()}</span>
        <span>STATUS <b style={{ color: "#C6FF3A", fontWeight: 500 }}>ONLINE</b></span>
        <span>BUILT WITH INTENT, 2026</span>
      </Reveal>
    </section>
  );
}
