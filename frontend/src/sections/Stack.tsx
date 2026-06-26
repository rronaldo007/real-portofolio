import type { Section, Skill } from "@/lib/types";
import { SectionHeader, SectionShell } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";

type Group = {
  cmd: string;
  arg: string;
  comment?: string;
  border: string;
  bg: string;
  color: string;
  items: string[];
};

function Tag({ g, label }: { g: Group; label: string }) {
  return (
    <span
      className="inline-flex font-mono"
      style={{ padding: "7px 12px", borderRadius: 5, fontSize: 12.5, border: `1px solid ${g.border}`, background: g.bg, color: g.color }}
    >
      {label}
    </span>
  );
}

function Line({ n, g, delay }: { n: string; g: Group; delay: number }) {
  return (
    <Reveal delay={delay} className="flex" style={{ gap: 16, marginBottom: 26 }}>
      <span className="font-mono" style={{ color: "#3a4055", fontSize: 13, minWidth: 22, textAlign: "right", userSelect: "none", paddingTop: 1 }}>
        {n}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-mono" style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 13 }}>
          <span style={{ color: "#9B6BFF" }}>$</span> <span style={{ color: "#EAECF5" }}>{g.cmd}</span>{" "}
          <span style={{ color: "#2BF1FF" }}>{g.arg}</span>
          {g.comment && <span style={{ color: "#5e8a4a" }}> {g.comment}</span>}
        </div>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {g.items.map((it) => (
            <Tag key={it} g={g} label={it} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export function Stack({ section, skills }: { section: Section; skills: Skill[] }) {
  const names = (cat: Skill["category"]) => skills.filter((s) => s.category === cat).map((s) => s.name);

  const groups: Group[] = [
    { cmd: "ls", arg: "backend/", border: "rgba(155,107,255,.28)", bg: "rgba(155,107,255,.08)", color: "#c4a9ff", items: names("backend") },
    { cmd: "ls", arg: "frontend/", border: "rgba(43,241,255,.28)", bg: "rgba(43,241,255,.07)", color: "#8eeeff", items: names("frontend") },
    { cmd: "ls", arg: "tooling/", border: "rgba(255,255,255,.12)", bg: "rgba(255,255,255,.04)", color: "#aab0c6", items: names("tooling") },
    { cmd: "cat", arg: "currently_learning.md", comment: "# 2026", border: "rgba(198,255,58,.3)", bg: "rgba(198,255,58,.08)", color: "#d6f58a", items: ["AI / ML", "local LLMs", "RAG"] },
  ].filter((g) => g.items.length);

  return (
    <SectionShell id={section.key}>
      <SectionHeader section={section} caption="system readout" />
      <Reveal
        style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, overflow: "hidden", background: "linear-gradient(180deg, rgba(13,15,24,.94), rgba(8,9,14,.94))", boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}
      >
        {/* terminal chrome */}
        <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.02)" }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            <div className="flex" style={{ gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#9B6BFF" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#2BF1FF" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#C6FF3A" }} />
            </div>
            <span className="font-mono" style={{ fontSize: 13, color: "#8a90a6" }}>ronaldo@lyon : ~/stack</span>
          </div>
          <div className="flex items-center font-mono" style={{ gap: 8, fontSize: 11, letterSpacing: "0.16em", color: "#C6FF3A" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C6FF3A", boxShadow: "0 0 8px #C6FF3A", animation: "pulseDot 1.8s infinite" }} />
            ONLINE
          </div>
        </div>

        <div style={{ padding: "clamp(22px,3vw,32px) clamp(16px,3vw,30px)" }}>
          {groups.map((g, i) => (
            <Line key={g.arg} n={String(i + 1).padStart(2, "0")} g={g} delay={0.06 + i * 0.06} />
          ))}
          {/* blinking prompt */}
          <div className="flex" style={{ gap: 16 }}>
            <span className="font-mono" style={{ color: "#3a4055", fontSize: 13, minWidth: 22, textAlign: "right" }}>
              {String(groups.length + 1).padStart(2, "0")}
            </span>
            <div className="font-mono" style={{ fontSize: 14, lineHeight: 1.4 }}>
              <span style={{ color: "#9B6BFF" }}>$</span>
              <span style={{ display: "inline-block", width: 9, height: 16, background: "#C6FF3A", verticalAlign: -3, marginLeft: 7, boxShadow: "0 0 8px rgba(198,255,58,.6)", animation: "blink 1.05s step-end infinite" }} />
            </div>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
