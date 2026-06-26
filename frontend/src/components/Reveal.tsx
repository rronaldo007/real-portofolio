"use client";

import { useEffect, useRef, useState } from "react";

/** Fades + slides content in once on scroll (IntersectionObserver).
 *  Mirrors the reference's `data-reveal`; respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  className = "",
  as: Tag = "div",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity .8s cubic-bezier(.2,.7,.2,1) ${delay}s, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
