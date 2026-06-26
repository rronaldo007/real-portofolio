"use client";

import { useEffect, useState } from "react";

/** Thin gradient scroll-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 2,
        width: `${pct}%`,
        zIndex: 9997,
        background: "linear-gradient(90deg,#9B6BFF,#2BF1FF,#C6FF3A)",
        boxShadow: "0 0 8px rgba(155,107,255,.6)",
        pointerEvents: "none",
        transition: "width .1s linear",
      }}
    />
  );
}
