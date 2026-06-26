"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen intro loader. Rendered into the initial HTML (so it covers the
 * page with no flash of content), counts up to 100%, then wipes up to reveal
 * the hero. Locks scroll while visible; reduced-motion skips the animation.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Always start at the hero on (re)load: stop the browser restoring the old
    // scroll position and drop any leftover "#section" hash that would jump.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);

    document.body.style.overflow = "hidden";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setProgress(100);
      const t = setTimeout(() => {
        setGone(true);
        document.body.style.overflow = "";
      }, 150);
      return () => clearTimeout(t);
    }

    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 13 + 5);
      setProgress(Math.floor(p));
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => setExiting(true), 280);
      }
    }, 95);
    return () => clearInterval(tick);
  }, []);

  // After the wipe-up animation finishes, unmount and restore scroll.
  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => {
      window.scrollTo(0, 0);
      setGone(true);
      document.body.style.overflow = "";
    }, 880);
    return () => clearTimeout(t);
  }, [exiting]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#05060B",
        display: "grid",
        placeItems: "center",
        transform: exiting ? "translateY(-100%)" : "translateY(0)",
        transition: "transform .85s cubic-bezier(.76,0,.24,1)",
      }}
    >
      {/* faint nebula */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(60% 50% at 50% 45%, rgba(155,107,255,.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="relative flex flex-col items-center"
        style={{ gap: 30, width: "min(420px,78vw)" }}
      >
        {/* R² mark */}
        <span
          className="font-mono font-bold"
          style={{ fontSize: 64, letterSpacing: "-0.04em", color: "#eaf0ff", textShadow: "0 0 40px rgba(155,107,255,.5)" }}
        >
          R<span style={{ color: "#9B6BFF", fontSize: 34, verticalAlign: "super" }}>2</span>
        </span>

        {/* progress bar */}
        <div style={{ width: "100%" }}>
          <div className="flex items-center justify-between font-mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "#5b6178", marginBottom: 12 }}>
            <span>INITIALIZING</span>
            <span style={{ color: "#C6FF3A" }}>{String(progress).padStart(3, "0")}%</span>
          </div>
          <div style={{ height: 2, width: "100%", background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg,#9B6BFF,#2BF1FF,#C6FF3A)",
                boxShadow: "0 0 10px rgba(155,107,255,.6)",
                transition: "width .12s linear",
              }}
            />
          </div>
          <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: "0.22em", color: "#3a4055", marginTop: 12, textTransform: "uppercase" }}>
            Mission Control · Rukundo Ronaldo
          </div>
        </div>
      </div>
    </div>
  );
}
