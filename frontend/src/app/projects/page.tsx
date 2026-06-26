import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { rgba } from "@/lib/accent";
import { ACCENT_HEX } from "@/lib/types";
import { SubNav } from "@/components/SubNav";

export const metadata: Metadata = {
  title: "Projets — Rukundo Ronaldo",
  description: "Sélection de projets — applications fullstack, SaaS et side-projects.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="relative" style={{ minHeight: "100vh", background: "#05060B" }}>
      <SubNav backHref="/" backLabel="back to home" />

      <section className="mx-auto" style={{ maxWidth: 1200, padding: "clamp(50px,8vh,90px) clamp(20px,5vw,64px) clamp(70px,11vh,130px)" }}>
        <div className="flex items-center font-mono uppercase" style={{ gap: 10, fontSize: 12, letterSpacing: "0.22em", color: "#5b6178", marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#9B6BFF", boxShadow: "0 0 8px #9B6BFF" }} />
          <span>03 /</span> <span style={{ color: "#9B6BFF" }}>work</span>
        </div>
        <h1 className="font-serif italic" style={{ margin: "0 0 clamp(40px,6vw,68px)", fontWeight: 400, fontSize: "clamp(48px,9vw,124px)", lineHeight: 0.9, letterSpacing: "-0.01em", color: "#eaecf5" }}>
          All projects
        </h1>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.09)" }}>
          {projects.map((p, i) => {
            const hex = ACCENT_HEX[p.accent];
            return (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="prow flex items-center"
                style={
                  {
                    gap: "clamp(16px,3vw,40px)",
                    padding: "clamp(24px,3.4vw,38px) 0",
                    borderBottom: "1px solid rgba(255,255,255,.09)",
                    "--ra-bg": rgba(hex, 0.06),
                    "--ra-bd": rgba(hex, 0.3),
                  } as React.CSSProperties
                }
              >
                <span className="font-mono" style={{ flex: "0 0 auto", fontSize: 13, color: hex }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pmeta font-mono" style={{ flex: "0 0 110px", fontSize: 13, color: "#6f768f" }}>
                  {p.year}
                </span>
                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <span className="font-serif italic" style={{ display: "block", fontSize: "clamp(24px,3.4vw,40px)", lineHeight: 1, color: "#eaecf5", marginBottom: 8 }}>
                    {p.name}
                  </span>
                  <span style={{ display: "block", fontSize: 14.5, lineHeight: 1.5, color: "#9aa1b8", maxWidth: "60ch" }}>
                    {p.lead || p.summary}
                  </span>
                </span>
                {p.category && (
                  <span className="pmeta font-mono uppercase" style={{ flex: "0 0 auto", fontSize: 11, letterSpacing: "0.12em", color: hex, border: `1px solid ${rgba(hex, 0.4)}`, padding: "6px 12px", borderRadius: 6 }}>
                    {p.category}
                  </span>
                )}
                <span className="parr" style={{ flex: "0 0 auto", color: hex, fontSize: 22, lineHeight: 1 }}>
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
