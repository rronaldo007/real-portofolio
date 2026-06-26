"use client";

import { useEffect, useState } from "react";
import type { Section, SiteSettings } from "@/lib/types";
import { ACCENT_HEX } from "@/lib/types";
import { Logo } from "./Logo";

/** Nav = R² mark + line-hamburger at every width. The hamburger opens a
 *  full-screen overlay of large italic-serif section names (the inline pill
 *  and CV button are intentionally gone). Reduced-motion respected. */
export function Nav({ sections, settings }: { sections: Section[]; settings: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + allow Escape-to-close *only* while the overlay is open.
  // (Don't touch body.overflow when closed — the Preloader owns it at load.)
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 inset-x-0" style={{ zIndex: 55 }}>
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(7,9,15,.72)",
            backdropFilter: "blur(13px)",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            opacity: scrolled ? 1 : 0,
            transition: "opacity .45s ease",
            pointerEvents: "none",
          }}
        />
        <nav
          aria-label="Primary"
          className="relative flex items-center justify-between"
          style={{ padding: "18px clamp(20px,5vw,64px)" }}
        >
          <a href="#top" aria-label="Retour en haut">
            <Logo text={settings.logo_text} sup={settings.logo_super} />
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="inline-flex items-center justify-center"
            style={{
              width: 46,
              height: 46,
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.16)",
              borderRadius: 11,
              color: "#eaecf5",
              transition: "background .2s ease, border-color .2s ease",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </nav>
      </header>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 flex flex-col overflow-y-auto"
          style={{ zIndex: 90, background: "rgba(5,6,11,.97)", backdropFilter: "blur(10px)", padding: "clamp(20px,6vw,40px)" }}
        >
          <div className="flex items-center justify-between">
            <Logo text={settings.logo_text} sup={settings.logo_super} />
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="inline-flex items-center font-mono"
              style={{ gap: 9, border: "1px solid rgba(255,255,255,.16)", borderRadius: 999, padding: "12px 18px", minHeight: 48, color: "#eaecf5", fontSize: 12, letterSpacing: "0.2em" }}
            >
              CLOSE&nbsp;×
            </button>
          </div>

          <nav aria-label="Sections" className="flex flex-col" style={{ gap: 4, margin: "auto 0" }}>
            {sections.map((s, i) => (
              <a
                key={s.key}
                href={`#${s.key}`}
                onClick={() => setOpen(false)}
                className="group flex items-baseline"
                style={{
                  gap: 16,
                  padding: "10px 0",
                  minHeight: 56,
                  opacity: 0,
                  animation: `menuIn .55s cubic-bezier(.2,.7,.2,1) ${0.05 + i * 0.05}s both`,
                }}
              >
                <span className="font-mono" style={{ fontSize: 13, color: ACCENT_HEX[s.accent] }}>
                  {String(s.number).padStart(2, "0")}
                </span>
                <span
                  className="font-serif italic"
                  style={{ fontSize: "clamp(38px,11vw,68px)", lineHeight: 1, color: "#eaecf5", transition: "color .25s ease" }}
                >
                  {s.nav_label}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex font-mono" style={{ gap: 22, fontSize: 12, letterSpacing: "0.1em", color: "#5b6178" }}>
            {settings.github && <a href={settings.github} target="_blank" rel="noopener">GITHUB</a>}
            {settings.linkedin && <a href={settings.linkedin} target="_blank" rel="noopener">LINKEDIN</a>}
            {settings.cv && <a href={settings.cv} download>CV</a>}
          </div>
        </div>
      )}
    </>
  );
}
