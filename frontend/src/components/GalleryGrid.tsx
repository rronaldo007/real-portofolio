"use client";

import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/types";

// Reference gradient frames + dense-mosaic spans (used when no real photos set).
const GRADS = [
  "radial-gradient(130% 100% at 50% 120%, #ffc06b, #e0633a 22%, #8a2f5e 52%, #1a1430 82%)",
  "radial-gradient(70% 60% at 50% 80%, rgba(190,150,255,.45), transparent 60%), linear-gradient(180deg,#241d40,#0e0a1e)",
  "radial-gradient(circle at 70% 35%, rgba(255,255,255,.95), rgba(170,190,255,.4) 5%, transparent 13%), linear-gradient(160deg,#0b1024,#05060b)",
  "radial-gradient(circle at 62% 40%, #c08bff, #6a3bb0 38%, #2a1850 72%, #0a0814)",
  "radial-gradient(circle at 30% 60%, rgba(120,220,255,.5), transparent 18%), radial-gradient(circle at 65% 35%, rgba(200,140,255,.45), transparent 20%), linear-gradient(160deg,#0a1226,#070a16)",
  "linear-gradient(180deg,#08101f 30%, #1f8a7a 72%, #7ef2c8 98%)",
  "radial-gradient(120% 90% at 50% 115%, #ffd08a, #e8743a 28%, #5e2b50 60%, #120e22 88%)",
  "radial-gradient(circle at 50% 40%, rgba(180,200,230,.5), transparent 55%), linear-gradient(180deg,#3a4458,#10131c)",
  "radial-gradient(circle at 50% 55%, rgba(150,210,255,.85), rgba(80,130,200,.3) 14%, transparent 36%), linear-gradient(160deg,#0a1020,#05070e)",
  "linear-gradient(180deg,#0a1810,#16361f 68%, #2a5a36)",
  "radial-gradient(circle at 42% 58%, #ff7ccd, #7a1e57 42%, #1a0a20 82%)",
  "radial-gradient(circle at 60% 30%, #4a6bd6, #25306b 40%, #0a0e1f 80%)",
];
const SPANS: [number, number][] = [[2, 3], [1, 2], [1, 2], [2, 2], [1, 3], [1, 2], [2, 2], [1, 2], [1, 3], [2, 2], [1, 2], [1, 2]];

type Tile = { src: string | null; bg: string; label: string; caption: string };

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const real = photos.filter((p) => p.src);
  const tiles: Tile[] = (real.length ? real : GRADS).map((item, i) => {
    const isPhoto = real.length > 0;
    return {
      src: isPhoto ? (item as Photo).src : null,
      bg: isPhoto ? "#0a0c14" : (item as string),
      label: String(i + 1).padStart(2, "0"),
      caption: isPhoto ? (item as Photo).caption : "",
    };
  });

  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((o) => (o == null ? o : (o + d + tiles.length) % tiles.length)),
    [tiles.length],
  );

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const active = open != null ? tiles[open] : null;

  return (
    <>
      <div className="gmosaic" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridAutoRows: 120, gridAutoFlow: "dense", gap: 14 }}>
        {tiles.map((t, i) => {
          const [cs, rs] = SPANS[i % SPANS.length];
          return (
            <button
              key={i}
              data-gtile
              className="gtile"
              onClick={() => setOpen(i)}
              aria-label={`Frame ${t.label}`}
              style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}`, position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.09)", cursor: "pointer", padding: 0 }}
            >
              {t.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="gzoom" src={t.src} alt={t.caption} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="gzoom" style={{ position: "absolute", inset: 0, background: t.bg }} />
              )}
              <span className="gidx font-mono" style={{ position: "absolute", top: 12, left: 14, fontSize: 11, letterSpacing: "0.14em", color: "rgba(255,255,255,.85)", textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9000, padding: "clamp(20px,5vw,70px)", background: "rgba(4,5,9,.86)", backdropFilter: "blur(8px)" }}
        >
          <LbButton aria-label="Fermer" onClick={close} style={{ top: 22, right: 24, width: 46, height: 46, fontSize: 20 }}>×</LbButton>
          <LbButton aria-label="Précédent" onClick={(e) => { e.stopPropagation(); step(-1); }} style={{ left: "clamp(14px,3vw,40px)", top: "50%", transform: "translateY(-50%)", width: 50, height: 50, fontSize: 22 }}>←</LbButton>
          <LbButton aria-label="Suivant" onClick={(e) => { e.stopPropagation(); step(1); }} style={{ right: "clamp(14px,3vw,40px)", top: "50%", transform: "translateY(-50%)", width: 50, height: 50, fontSize: 22 }}>→</LbButton>

          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(1000px,92vw)", maxHeight: "84vh", aspectRatio: "16 / 10", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)", background: active.bg, boxShadow: "0 40px 100px rgba(0,0,0,.6)", animation: "lbin .35s cubic-bezier(.2,.7,.2,1)" }}>
            {active.src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.src} alt={active.caption} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#05060B" }} />
            )}
          </div>
          <div className="font-mono" style={{ position: "absolute", bottom: 26, left: 0, right: 0, textAlign: "center", fontSize: 12, letterSpacing: "0.16em", color: "#9aa1b8" }}>
            {active.caption ? `${active.caption} · ` : ""}frame {active.label} / {String(tiles.length).padStart(2, "0")}
          </div>
        </div>
      )}
    </>
  );
}

function LbButton({ children, style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      style={{ position: "absolute", borderRadius: "50%", border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.04)", color: "#eaecf5", cursor: "pointer", ...style }}
    >
      {children}
    </button>
  );
}
