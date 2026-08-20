"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Project, Section } from "@/lib/types";
import { ACCENT_HEX } from "@/lib/types";
import { Eyebrow } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { rgba } from "@/lib/accent";

function Card({ project, index }: { project: Project; index: number }) {
  const hex = ACCENT_HEX[project.accent];
  const nn = String(index + 1).padStart(2, "0");
  return (
    <article
      className="relative flex flex-col"
      style={{
        flex: "0 0 auto",
        width: "min(440px,80vw)",
        height: "clamp(470px,76vh,720px)",
        padding: 14,
        borderRadius: 22,
        border: `1px solid ${rgba(hex, 0.22)}`,
        background: `linear-gradient(165deg, ${rgba(hex, 0.12)}, rgba(10,12,20,.55) 55%)`,
        overflow: "hidden",
        scrollSnapAlign: "start",
        boxShadow: "0 20px 50px rgba(0,0,0,.4)",
        cursor: "pointer",
      }}
    >
      {/* image panel */}
      <div className="relative" style={{ height: "46%", flex: "0 0 auto", borderRadius: 15, overflow: "hidden", border: `1px solid ${rgba(hex, 0.28)}` }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${rgba(hex, 0.32)}, rgba(10,12,20,.7) 72%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)", backgroundSize: "26px 26px", WebkitMaskImage: "radial-gradient(circle at 50% 42%, #000 26%, transparent 72%)", maskImage: "radial-gradient(circle at 50% 42%, #000 26%, transparent 72%)" }} />
        <div className="grid place-items-center font-mono uppercase" style={{ position: "absolute", inset: 0, fontSize: 12, letterSpacing: "0.24em", color: "rgba(255,255,255,.4)" }}>
          image / {nn}
        </div>
        {project.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 2 }} />
        )}
        {project.category && (
          <span className="font-mono uppercase" style={{ position: "absolute", zIndex: 3, top: 13, left: 13, fontSize: 10, letterSpacing: "0.14em", color: hex, background: "rgba(8,9,14,.55)", backdropFilter: "blur(7px)", border: `1px solid ${rgba(hex, 0.35)}`, padding: "6px 11px", borderRadius: 999 }}>
            {project.category}
          </span>
        )}
        {/* decorative: the whole card is the link (see the overlay below) */}
        <span aria-hidden className="grid place-items-center" style={{ position: "absolute", zIndex: 3, top: 11, right: 11, width: 38, height: 38, borderRadius: "50%", border: `1px solid ${rgba(hex, 0.5)}`, background: "rgba(8,9,14,.5)", backdropFilter: "blur(7px)", color: hex, pointerEvents: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </span>
        <div className="font-mono" style={{ position: "absolute", zIndex: 3, bottom: 4, right: 14, fontWeight: 700, fontSize: "clamp(38px,5.5vw,60px)", lineHeight: 1, color: "transparent", WebkitTextStroke: `1.5px ${rgba(hex, 0.5)}`, pointerEvents: "none" }}>
          {nn}
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col" style={{ flex: 1, padding: "20px 16px 8px" }}>
        <h3 className="font-serif italic" style={{ margin: "0 0 12px", fontWeight: 400, fontSize: "clamp(32px,4.2vw,46px)", lineHeight: 0.95, color: "#eaecf5" }}>
          {project.name}
        </h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#9aa1b8" }}>{project.lead || project.summary}</p>
        <div className="flex flex-wrap items-center" style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.09)", gap: 8 }}>
          {project.stack.map((t, i) => (
            <span key={t} className="inline-flex items-center" style={{ gap: 8 }}>
              {i > 0 && <span style={{ color: "#3a4055" }}>·</span>}
              <span className="font-mono" style={{ fontSize: 12, color: "#8a91a6" }}>{t}</span>
            </span>
          ))}
        </div>
      </div>

      {/* the whole card is clickable */}
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Ouvrir ${project.name}`}
        style={{ position: "absolute", inset: 0, zIndex: 4, borderRadius: 22 }}
      />
    </article>
  );
}

export function Work({ section, projects }: { section: Section; projects: Project[] }) {
  const featured = projects.filter((p) => p.is_featured);
  const list = featured.length ? featured : projects;
  const scroller = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(8);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? Math.max(8, (el.scrollLeft / max) * 100) : 8);
  };

  return (
    <section id={section.key} className="relative" style={{ padding: "clamp(56px,9vh,104px) 0" }}>
      <Reveal className="flex items-end justify-between flex-wrap" style={{ gap: 16, maxWidth: 1200, margin: "0 auto clamp(26px,3.5vw,42px)", padding: "0 clamp(20px,5vw,64px)" }}>
        <div>
          <Eyebrow number={section.number} label={section.nav_label} accent={section.accent} />
          <h2 className="m-0 font-serif italic" style={{ fontWeight: 400, fontSize: "clamp(40px,6.5vw,86px)", lineHeight: 0.9, letterSpacing: "-0.01em", color: "#eaecf5" }}>
            {section.title}
          </h2>
        </div>
        <Link href="/projects" className="inline-flex items-center font-mono uppercase" style={{ gap: 9, padding: "12px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,.22)", color: "#eaecf5", fontSize: 12, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
          See all projects →
        </Link>
      </Reveal>

      <div
        ref={scroller}
        onScroll={onScroll}
        data-work-scroller
        style={{ overflowX: "auto", overflowY: "hidden", scrollSnapType: "x proximity", scrollPaddingLeft: "clamp(20px,5vw,64px)", scrollbarWidth: "none" }}
      >
        <div className="flex" style={{ gap: 24, padding: "12px clamp(20px,5vw,64px)", width: "max-content" }}>
          {list.map((p, i) => (
            <Card key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>

      <div className="flex items-center" style={{ maxWidth: 1200, margin: "clamp(22px,3vw,34px) auto 0", padding: "0 clamp(20px,5vw,64px)", gap: 20 }}>
        <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#9B6BFF,#2BF1FF)", boxShadow: "0 0 10px rgba(155,107,255,.6)", transition: "width .12s linear" }} />
        </div>
        <div className="flex items-center font-mono uppercase" style={{ gap: 9, fontSize: 11, letterSpacing: "0.2em", color: "#5b6178", whiteSpace: "nowrap" }}>
          drag / scroll <span style={{ display: "inline-block", animation: "nudge 1.6s ease-in-out infinite" }}>→</span>
        </div>
      </div>
    </section>
  );
}
