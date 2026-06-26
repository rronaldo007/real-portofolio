import type { Section } from "@/lib/types";
import { Eyebrow } from "@/components/SectionHeader";
import { Reveal } from "@/components/Reveal";

const CARDS = [
  { n: "01", color: "#9B6BFF", title: "Local LLMs", body: "Running open models locally with Ollama, testing what they can and cannot do.", border: "rgba(255,255,255,.1)", bg: "rgba(10,12,20,.5)" },
  { n: "02", color: "#2BF1FF", title: "Image generation", body: "Hands-on with image-generation models, learning the pipeline end to end.", border: "rgba(255,255,255,.1)", bg: "rgba(10,12,20,.5)" },
  { n: "03", color: "#C6FF3A", title: "Local RAG assistant", body: "Building a retrieval-augmented assistant that runs locally. The chat on this page is the front for it.", border: "rgba(198,255,58,.3)", bg: "linear-gradient(160deg, rgba(198,255,58,.07), rgba(10,12,20,.5))" },
];

/** Ambient 2-orbit planet for the trajectory backdrop. */
function MiniSystem() {
  return (
    <div aria-hidden style={{ position: "absolute", top: "50%", right: "-12%", transform: "translateY(-50%)", width: "min(50vw,620px)", height: "min(50vw,620px)", pointerEvents: "none", perspective: 1000, opacity: 0.7 }}>
      <div style={{ position: "absolute", inset: 0, transform: "rotateX(70deg)" }}>
        <div style={{ position: "absolute", inset: "8%", borderRadius: "50%", border: "1px solid rgba(155,107,255,.18)", animation: "spin 50s linear infinite" }}>
          <span style={{ position: "absolute", top: -6, left: "50%", width: 12, height: 12, borderRadius: "50%", background: "#9B6BFF", boxShadow: "0 0 16px #9B6BFF", transform: "translateX(-50%) rotateX(-70deg)" }} />
        </div>
        <div style={{ position: "absolute", inset: "30%", borderRadius: "50%", border: "1px solid rgba(43,241,255,.15)", animation: "spinR 28s linear infinite" }}>
          <span style={{ position: "absolute", top: -5, left: "50%", width: 9, height: 9, borderRadius: "50%", background: "#2BF1FF", boxShadow: "0 0 12px #2BF1FF", transform: "translateX(-50%) rotateX(-70deg)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: "50%", left: "50%", width: "14%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle at 38% 34%, #fff, #9B6BFF 60%, #5b34c9)", boxShadow: "0 0 60px 14px rgba(155,107,255,.4)", transform: "translate(-50%,-50%)", animation: "corona 6s ease-in-out infinite" }} />
    </div>
  );
}

export function AiJourney({ section }: { section: Section }) {
  return (
    <section
      id={section.key}
      className="relative overflow-hidden"
      style={{ padding: "clamp(90px,15vh,180px) clamp(20px,5vw,64px)", background: "radial-gradient(110% 80% at 80% 50%, rgba(155,107,255,.1), transparent 60%)" }}
    >
      <MiniSystem />
      <div className="relative" style={{ zIndex: 2, maxWidth: 1200, margin: "0 auto" }}>
        <Reveal style={{ marginBottom: 18 }}>
          <Eyebrow number={section.number} label={section.nav_label} accent={section.accent} />
        </Reveal>
        <Reveal delay={0.05} as="h2" className="font-serif italic" style={{ margin: "0 0 24px", fontWeight: 400, fontSize: "clamp(40px,6.8vw,86px)", letterSpacing: "-0.01em", lineHeight: 0.92, maxWidth: "15ch", color: "#eaecf5" }}>
          From full-stack to <span style={{ color: "#9B6BFF" }}>AI engineer</span>
        </Reveal>
        <Reveal delay={0.1} as="p" style={{ margin: "0 0 clamp(36px,5vw,56px)", maxWidth: "60ch", fontSize: "clamp(16px,1.9vw,21px)", lineHeight: 1.7, color: "#9aa1b8" }}>
          The Mastère in AI at Epitech is the next deliberate step, but the work has already started — I run models locally and build toward AI engineering, not just read about it.
        </Reveal>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {CARDS.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.07} style={{ border: `1px solid ${c.border}`, borderRadius: 16, padding: 26, background: c.bg }}>
              <div className="font-mono" style={{ fontSize: 12, color: c.color, marginBottom: 14 }}>{c.n}</div>
              <h4 className="font-serif italic" style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 400, color: "#eaecf5" }}>{c.title}</h4>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#9aa1b8" }}>{c.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
