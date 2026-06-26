"use client";

import { useEffect, useState } from "react";

/** Cycles through phrases with a type/erase effect and a blinking lime caret.
 *  Respects prefers-reduced-motion (shows the first phrase, static). */
export function Typewriter({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // reduced-motion: show the first phrase static (one-time sync).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(phrases[0] ?? "");
      return;
    }
    const current = phrases[i % phrases.length] ?? "";
    const done = !deleting && text === current;
    const cleared = deleting && text === "";

    const delay = done ? 1600 : cleared ? 220 : deleting ? 34 : 62;
    const t = setTimeout(() => {
      if (done) return setDeleting(true);
      if (cleared) {
        setDeleting(false);
        setI((n) => n + 1);
        return;
      }
      const next = deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1);
      setText(next);
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, phrases]);

  return (
    <div
      className="font-mono"
      style={{ fontSize: "clamp(16px,2.4vw,30px)", color: "#aeb4cb", minHeight: "1.4em" }}
    >
      <span style={{ color: "#5b6178" }}>&gt;&nbsp;</span>
      {text}
      <span
        style={{
          display: "inline-block",
          width: ".6ch",
          height: "1.05em",
          verticalAlign: "-.16em",
          marginLeft: 2,
          background: "#C6FF3A",
          animation: "blink 1.05s step-end infinite",
        }}
      />
    </div>
  );
}
