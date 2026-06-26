"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's solar system, drawn on canvas: a small layered sun, six neon
 * planets on tilted elliptical orbits (perspective squash ~0.34) with faint
 * orbit lines, per-planet light-direction shading, a soft glow and a short
 * fading motion trail; one ringed planet with an orbiting moon; a violet→cyan
 * nebula haze and a twinkling starfield. Weighted to the right, drifting behind
 * the name. Respects prefers-reduced-motion (freezes to a posed frame).
 */

type Planet = {
  color: string;
  shade: string;
  r: number; // body radius (px, before DPR)
  orbit: number; // orbit radius factor (0..1 of maxR)
  speed: number; // angular speed
  phase: number; // start angle
  ringed?: boolean;
  moon?: boolean;
};

const PLANETS: Planet[] = [
  { color: "#c9b6ff", shade: "#4d2aa8", r: 13, orbit: 1.0, speed: 0.05, phase: 0.4, ringed: true, moon: true },
  { color: "#2BF1FF", shade: "#0c5f6b", r: 8.5, orbit: 0.84, speed: -0.07, phase: 1.9 },
  { color: "#C6FF3A", shade: "#5d7016", r: 7.5, orbit: 0.69, speed: 0.094, phase: 3.3 },
  { color: "#FF7AD9", shade: "#7a1e57", r: 6.5, orbit: 0.55, speed: -0.13, phase: 5.1 },
  { color: "#FFB35C", shade: "#8a4f15", r: 8, orbit: 0.42, speed: 0.06, phase: 2.2 },
  { color: "#8ecbff", shade: "#2a4a6b", r: 5.5, orbit: 0.3, speed: -0.2, phase: 0.8 },
];

const SQUASH = 0.34; // cos(70°) — the tilted orbital plane

export function SolarSystem() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = reduce ? 8 : 0; // posed frame when reduced-motion
    let stars: { x: number; y: number; r: number; ph: number }[] = [];
    let dpr = 1;
    let W = 0;
    let H = 0;

    // Deterministic pseudo-random in [0, 1) — never negative (so radii are safe).
    const frac = (n: number) => {
      const v = Math.sin(n) * 43758.5453;
      return v - Math.floor(v);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // regenerate starfield across the whole hero
      const count = Math.max(40, Math.round((W * H) / 9000));
      stars = Array.from({ length: count }, (_, i) => ({
        x: frac(i * 12.9898 + 1),
        y: frac(i * 78.233 + 1),
        r: 0.4 + frac(i * 3.17 + 1) * 1.2,
        ph: (i % 10) * 0.7,
      }));
    };

    const planetBody = (x: number, y: number, r: number, color: string, shade: string) => {
      // soft glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4);
      halo.addColorStop(0, color + "88");
      halo.addColorStop(0.4, color + "33");
      halo.addColorStop(1, "transparent");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // shaded body — light from upper-left
      const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.42, r * 0.1, x, y, r);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, color);
      g.addColorStop(1, shade);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = () => {
      try {
        draw();
      } catch {
        /* never let one bad frame kill the loop */
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const draw = () => {
      if (!reduce) t += 0.0045;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.72;
      const cy = H * 0.52;
      const maxR = Math.min(W * 0.46, H * 0.62, 520);

      // nebula haze (violet -> cyan)
      const neb = ctx.createRadialGradient(cx - maxR * 0.1, cy - maxR * 0.1, 0, cx, cy, maxR * 1.25);
      neb.addColorStop(0, "rgba(155,107,255,0.30)");
      neb.addColorStop(0.45, "rgba(43,241,255,0.10)");
      neb.addColorStop(0.8, "transparent");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, W, H);

      // starfield
      for (const s of stars) {
        const a = 0.35 + 0.6 * Math.abs(Math.sin(t * 6 + s.ph));
        ctx.fillStyle = `rgba(220,225,255,${a})`;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // orbit lines
      for (const p of PLANETS) {
        const rx = maxR * p.orbit;
        const ry = rx * SQUASH;
        ctx.strokeStyle = p.color + "26";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // sun — layered white-violet core + glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const sunR = maxR * 0.085;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 6);
      sg.addColorStop(0, "rgba(255,255,255,0.9)");
      sg.addColorStop(0.18, "rgba(196,171,255,0.7)");
      sg.addColorStop(0.5, "rgba(155,107,255,0.28)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      const core = ctx.createRadialGradient(cx - sunR * 0.3, cy - sunR * 0.3, 0, cx, cy, sunR);
      core.addColorStop(0, "#ffffff");
      core.addColorStop(0.5, "#efe6ff");
      core.addColorStop(1, "#9b6bff");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fill();

      // planets (far orbits first so nearer ones overlap)
      for (const p of PLANETS) {
        const rx = maxR * p.orbit;
        const ry = rx * SQUASH;
        const ang = p.phase + t * p.speed * 12;
        const px = cx + rx * Math.cos(ang);
        const py = cy + ry * Math.sin(ang);

        // fading motion trail
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (let k = 1; k <= 6; k++) {
          const a2 = ang - k * 0.05 * Math.sign(p.speed || 1);
          const tx = cx + rx * Math.cos(a2);
          const ty = cy + ry * Math.sin(a2);
          ctx.fillStyle = p.color + Math.round(60 - k * 9).toString(16).padStart(2, "0");
          ctx.beginPath();
          ctx.arc(tx, ty, p.r * (1 - k * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // ring (behind body)
        if (p.ringed) {
          ctx.save();
          ctx.strokeStyle = "rgba(201,182,255,0.55)";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.ellipse(px, py, p.r * 2.1, p.r * 0.8, -0.32, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        planetBody(px, py, p.r, p.color, p.shade);

        // orbiting moon
        if (p.moon) {
          const mAng = t * 0.9 + 1;
          const mx = px + Math.cos(mAng) * p.r * 2.3;
          const my = py + Math.sin(mAng) * p.r * 2.3 * 0.7;
          planetBody(mx, my, 2.4, "#e6ecff", "#6b76a8");
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ width: "100%", height: "100%", zIndex: 1 }}
    />
  );
}
