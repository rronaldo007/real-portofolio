"use client";

import { useState } from "react";

/** The assistant launcher + panel. Interface-only for now (no model wired);
 *  later it POSTs to a Django endpoint backed by the local RAG assistant. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([
    { role: "assistant", text: "I haven't finished my configuration yet — see you soon! 👋" },
  ]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: q },
      { role: "assistant", text: "Still finishing my configuration — see you soon! 👋" },
    ]);
    setInput("");
  };

  return (
    <div style={{ position: "fixed", right: "clamp(16px,3vw,32px)", bottom: "clamp(16px,3vw,32px)", zIndex: 80, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
      {open && (
        <div style={{ width: "min(360px,86vw)", height: 460, display: "flex", flexDirection: "column", background: "rgba(11,13,22,.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(155,107,255,.22)", borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.6), 0 0 50px rgba(155,107,255,.12)" }}>
          <div className="flex items-center justify-between" style={{ padding: "15px 17px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C6FF3A", boxShadow: "0 0 10px #C6FF3A", animation: "pulseDot 1.8s infinite" }} />
              <span className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: "0.16em", color: "#cdd3e6" }}>assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer" style={{ background: "none", border: "none", color: "#8A90A6", fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
          </div>
          <div className="flex flex-col" style={{ flex: 1, overflowY: "auto", padding: "18px 16px", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div className="font-mono" style={{ fontSize: 13, lineHeight: 1.55, padding: "10px 13px", borderRadius: 12, background: m.role === "user" ? "rgba(155,107,255,.18)" : "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: m.role === "user" ? "#eaf0ff" : "#aeb4cb" }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex" style={{ gap: 8, padding: 12, borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about Ronaldo"
              className="font-mono"
              style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 13px", color: "#eaecf5", fontSize: 13, outline: "none" }}
            />
            <button onClick={send} aria-label="Envoyer" className="grid place-items-center" style={{ width: 42, border: "none", borderRadius: 10, background: "#9B6BFF", color: "#0b0716" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Assistant"
        className="relative grid place-items-center"
        style={{ width: 58, height: 58, borderRadius: "50%", border: "1px solid rgba(155,107,255,.35)", background: "radial-gradient(circle at 35% 30%, #1b1430, #0b0d16)", color: "#e3d4ff", boxShadow: "0 12px 40px rgba(0,0,0,.5), 0 0 28px rgba(155,107,255,.25)", animation: "floaty 4s ease-in-out infinite" }}
      >
        <span style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1px solid rgba(155,107,255,.25)", borderTopColor: "#9B6BFF", animation: "spin 5s linear infinite" }} />
        <span style={{ position: "absolute", top: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#C6FF3A", boxShadow: "0 0 8px #C6FF3A", animation: "pulseDot 1.8s infinite", zIndex: 3 }} />
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="3" x2="12" y2="5.4" />
            <circle cx="12" cy="2.2" r="1" fill="currentColor" stroke="none" />
            <rect x="4.5" y="5.4" width="15" height="13.2" rx="3.6" />
            <line x1="2.5" y1="9.6" x2="2.5" y2="13" />
            <line x1="21.5" y1="9.6" x2="21.5" y2="13" />
            <circle cx="9.2" cy="11" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="14.8" cy="11" r="1.15" fill="currentColor" stroke="none" />
            <line x1="9.4" y1="15.1" x2="14.6" y2="15.1" />
          </svg>
        )}
      </button>
    </div>
  );
}
