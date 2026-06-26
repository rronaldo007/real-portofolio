import Link from "next/link";
import type { Photo, Section } from "@/lib/types";
import { Eyebrow } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";

// The reference's six gradient placeholder frames (used when no photos are set).
const PLACEHOLDERS = [
  { h: 222, bg: "radial-gradient(130% 100% at 50% 120%, #ffc06b, #e0633a 22%, #8a2f5e 52%, #1a1430 82%)" },
  { h: 300, bg: "radial-gradient(circle at 62% 40%, #c08bff, #6a3bb0 38%, #2a1850 72%, #0a0814)" },
  { h: 190, bg: "linear-gradient(180deg, #08101f 35%, #1f8a7a 72%, #7ef2c8 98%)" },
  { h: 262, bg: "radial-gradient(circle at 72% 30%, rgba(255,255,255,.95), rgba(170,190,255,.4) 5%, transparent 13%), linear-gradient(160deg,#0b1024,#05060b)" },
  { h: 180, bg: "radial-gradient(70% 60% at 50% 80%, rgba(190,150,255,.45), transparent 60%), linear-gradient(180deg, #241d40, #0e0a1e)" },
  { h: 320, bg: "radial-gradient(circle at 42% 58%, #ff7ccd, #7a1e57 42%, #1a0a20 82%)" },
];

function Frame({ children, height, background, delay }: { children?: React.ReactNode; height: number; background?: string; delay: number }) {
  return (
    <Reveal delay={delay} style={{ breakInside: "avoid", margin: "0 0 16px" }}>
      <div className="relative overflow-hidden" style={{ height, borderRadius: 14, border: "1px solid rgba(255,255,255,.09)", background }}>
        {children}
      </div>
    </Reveal>
  );
}

export function Gallery({ section, photos }: { section: Section; photos: Photo[] }) {
  const hasPhotos = photos.some((p) => p.src);
  return (
    <section id={section.key} className="relative mx-auto" style={{ maxWidth: 1200, padding: "clamp(70px,11vh,130px) clamp(20px,5vw,64px)" }}>
      <Reveal className="flex items-end justify-between flex-wrap" style={{ gap: 14, marginBottom: "clamp(28px,5vw,48px)" }}>
        <div>
          <Eyebrow number={section.number} label={section.nav_label} accent={section.accent} />
          <h2 className="m-0 font-serif italic" style={{ fontWeight: 400, fontSize: "clamp(40px,6.5vw,86px)", lineHeight: 0.9, letterSpacing: "-0.01em", color: "#eaecf5" }}>
            {section.title}
          </h2>
        </div>
        <div className="flex flex-col items-end" style={{ gap: 14, paddingBottom: 6 }}>
          <div className="text-right font-mono uppercase" style={{ fontSize: 11.5, letterSpacing: "0.14em", color: "#5b6178", lineHeight: 1.7 }}>
            a second lens on the world.<br />click any frame to enlarge.
          </div>
          <Link href="/gallery" className="inline-flex items-center font-mono uppercase" style={{ gap: 9, padding: "12px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,.22)", color: "#eaecf5", fontSize: 12, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
            See gallery →
          </Link>
        </div>
      </Reveal>

      <div style={{ columnWidth: 270, columnGap: 16 }}>
        {hasPhotos
          ? photos.filter((p) => p.src).map((p, i) => (
              <Frame key={p.src ?? i} height={[222, 300, 190, 262, 180, 320][i % 6]} delay={(i % 6) * 0.05}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src!} alt={p.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {(p.caption || p.taken) && (
                  <div className="font-mono" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "10px 12px", fontSize: 11, color: "#cdd3e6", background: "linear-gradient(0deg, rgba(5,6,11,.82), transparent)" }}>
                    {p.caption} {p.taken && <span style={{ color: "#7e89a8" }}>· {p.taken}</span>}
                  </div>
                )}
              </Frame>
            ))
          : PLACEHOLDERS.map((p, i) => <Frame key={i} height={p.h} background={p.bg} delay={i * 0.05} />)}
      </div>
    </section>
  );
}
