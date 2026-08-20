import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/api";
import { rgba } from "@/lib/accent";
import { ACCENT_HEX } from "@/lib/types";
import type { Project } from "@/lib/types";
import { SubNav } from "@/components/SubNav";
import { Markdown } from "@/components/Markdown";
import { TechChips } from "@/components/TechIcon";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<Project | null> {
  try {
    return await getProject(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: "Projet introuvable" };
  return {
    title: `${p.name} — Rukundo Ronaldo`,
    description: p.lead || p.summary,
  };
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([load(slug), getProjects()]);
  if (!project) notFound();

  const hex = ACCENT_HEX[project.accent];
  const i = all.findIndex((p) => p.slug === slug);
  const idx = i >= 0 ? i : 0;
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  const overview = (project.overview || project.summary || "").trim();
  const badgeLabel = BADGE_LABELS[project.badge] ?? "";

  return (
    <div className="relative" style={{ minHeight: "100vh", background: "#05060B", overflow: "hidden" }}>
      {/* accent glow */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(80% 60% at 78% 12%, ${rgba(hex, 0.14)}, transparent 70%)` }} />

      <SubNav backHref="/projects" backLabel="all projects" />

      <section className="relative mx-auto" style={{ zIndex: 1, maxWidth: 1080, padding: "clamp(40px,7vh,80px) clamp(20px,5vw,64px) clamp(60px,9vh,110px)" }}>
        <div className="flex items-center font-mono uppercase" style={{ gap: 10, fontSize: 12, letterSpacing: "0.22em", color: "#5b6178", marginBottom: 16 }}>
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: hex, boxShadow: `0 0 8px ${hex}` }} />
          <span>project /</span> <span style={{ color: hex }}>{String(idx + 1).padStart(2, "0")}</span>
          {badgeLabel && (
            <span style={{ marginLeft: 6, padding: "4px 10px", borderRadius: 999, border: `1px solid ${rgba(hex, 0.4)}`, background: rgba(hex, 0.08), color: hex, fontSize: 10.5, letterSpacing: "0.16em" }}>
              {badgeLabel}
            </span>
          )}
        </div>
        <h1 className="font-serif italic" style={{ margin: "0 0 22px", fontWeight: 400, fontSize: "clamp(54px,10vw,128px)", lineHeight: 0.88, letterSpacing: "-0.01em", color: "#eaecf5" }}>
          {project.name}
        </h1>
        <p style={{ margin: "0 0 clamp(34px,5vw,52px)", borderLeft: `4px solid ${hex}`, paddingLeft: 18, maxWidth: "52ch", fontSize: "clamp(18px,2.2vw,24px)", lineHeight: 1.4, color: "#cdd3e6" }}>
          {project.lead || project.summary}
        </p>

        {/* metrics */}
        {project.metrics.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: "clamp(28px,4vw,64px)", marginBottom: "clamp(34px,5vw,52px)" }}>
            {project.metrics.map((m, n) => (
              <div key={n}>
                <div className="font-serif" style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1, color: "#eaecf5" }}>
                  {m.value}
                  {m.unit && <span className="font-mono" style={{ fontSize: "0.42em", marginLeft: 5, color: hex }}>{m.unit}</span>}
                </div>
                <div className="font-mono uppercase" style={{ marginTop: 8, fontSize: 11, letterSpacing: "0.18em", color: "#5b6178" }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* cover */}
        <div className="relative" style={{ height: "clamp(240px,40vh,440px)", borderRadius: 16, overflow: "hidden", border: `1px solid ${rgba(hex, 0.25)}`, background: `linear-gradient(150deg, ${rgba(hex, 0.3)}, rgba(10,12,20,.6) 72%)`, marginBottom: "clamp(40px,6vw,64px)" }}>
          {project.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.cover} alt={project.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          <span className="font-mono" style={{ position: "absolute", bottom: 14, left: 16, fontSize: 11, letterSpacing: "0.14em", color: "#aab0c6" }}>
            cover / {project.slug}
          </span>
        </div>

        <div className="flex flex-wrap items-start" style={{ gap: "clamp(28px,4vw,56px)" }}>
          {/* main */}
          <div style={{ flex: "1.7 1 360px", minWidth: 0 }}>
            <h2 className="font-serif italic" style={{ margin: "0 0 18px", fontWeight: 400, fontSize: "clamp(26px,3vw,36px)", color: "#eaecf5" }}>Overview</h2>
            {overview && <Markdown text={overview} hex={hex} />}

            {project.highlights.length > 0 && (
              <>
                <h2 className="font-serif italic" style={{ margin: "clamp(30px,4vw,44px) 0 18px", fontWeight: 400, fontSize: "clamp(26px,3vw,36px)", color: "#eaecf5" }}>What I built</h2>
                <div className="flex flex-col" style={{ gap: 14 }}>
                  {project.highlights.map((b, n) => (
                    <div key={n} className="flex items-start" style={{ gap: 14 }}>
                      <span style={{ flex: "0 0 auto", width: 8, height: 8, marginTop: 7, borderRadius: "50%", background: hex, boxShadow: `0 0 8px ${rgba(hex, 0.8)}` }} />
                      <span style={{ fontSize: 15.5, lineHeight: 1.6, color: "#cdd3e6" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* sticky meta card */}
          <aside className="font-mono" style={{ flex: "1 1 260px", minWidth: 240, position: "sticky", top: 96, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "clamp(24px,2.6vw,32px)", background: "rgba(10,12,20,.5)" }}>
            {project.role && <MetaRow label="ROLE" value={project.role} />}
            <MetaRow label="YEAR" value={project.year} />
            {project.category && <MetaRow label="TYPE" value={project.category} color={hex} />}
            {project.stack.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "#5b6178", marginBottom: 12 }}>STACK</div>
                <TechChips stack={project.stack} />
              </div>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener" className="inline-flex items-center justify-center" style={{ gap: 8, width: "100%", boxSizing: "border-box", padding: "14px 18px", borderRadius: 10, background: hex, color: "#08110a", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
                Voir le projet →
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener" className="inline-flex items-center justify-center" style={{ gap: 8, width: "100%", boxSizing: "border-box", marginTop: project.live_url ? 10 : 0, padding: "14px 18px", borderRadius: 10, border: `1px solid ${rgba(hex, 0.45)}`, color: hex, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
                Code source ↗
              </a>
            )}
          </aside>
        </div>

        {/* documented sections */}
        {project.sections.length > 0 && (
          <div style={{ marginTop: "clamp(56px,9vh,100px)" }}>
            {project.sections.map((sec, n) => {
              const images = sec.media.filter((m) => m.kind === "image" && m.src);
              const docs = sec.media.filter((m) => m.kind === "document" && m.src);
              return (
                <section key={n} style={{ marginBottom: "clamp(48px,7vh,88px)" }}>
                  <div
                    className="flex flex-wrap"
                    style={{ gap: "clamp(26px,3.5vw,52px)", alignItems: "flex-start", flexDirection: n % 2 ? "row-reverse" : "row" }}
                  >
                    <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                      <div className="flex items-center font-mono uppercase" style={{ gap: 10, fontSize: 11, letterSpacing: "0.2em", color: "#5b6178", marginBottom: 12 }}>
                        <span style={{ color: hex }}>{String(n + 1).padStart(2, "0")}</span>
                        <span style={{ flex: "0 0 26px", height: 1, background: rgba(hex, 0.5) }} />
                      </div>
                      <h2 className="font-serif italic" style={{ margin: "0 0 16px", fontWeight: 400, fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.1, color: "#eaecf5" }}>
                        {sec.title}
                      </h2>
                      {sec.body && <Markdown text={sec.body} hex={hex} />}
                    </div>

                    {sec.src && (
                      <figure style={{ flex: "1.1 1 340px", minWidth: 0, margin: 0 }}>
                        <div className="relative" style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${rgba(hex, 0.22)}`, background: `linear-gradient(150deg, ${rgba(hex, 0.22)}, rgba(10,12,20,.6) 72%)` }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {/* tall diagrams would otherwise run for thousands of pixels */}
                        <img src={sec.src} alt={sec.caption || sec.title} style={{ display: "block", width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain" }} />
                        </div>
                        {sec.caption && (
                          <figcaption className="font-mono" style={{ marginTop: 10, fontSize: 11.5, letterSpacing: "0.08em", color: "#5b6178" }}>
                            {sec.caption}
                          </figcaption>
                        )}
                      </figure>
                    )}
                  </div>

                  {/* extra images: full-width grid under the section */}
                  {images.length > 0 && (
                    <div
                      className="grid"
                      // a lone extra image must not span the whole section
                      style={{ marginTop: "clamp(24px,3vw,36px)", gridTemplateColumns: images.length === 1 ? "repeat(auto-fit,minmax(0,min(100%,340px)))" : "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 }}
                    >
                      {images.map((m, k) => (
                        <figure key={k} style={{ margin: 0 }}>
                          {/* diagrams come in wildly different ratios: a fixed box
                              with contain keeps the grid even and stays legible */}
                          <a href={m.src as string} target="_blank" rel="noopener" title={m.caption || "Ouvrir en grand"} style={{ display: "block", aspectRatio: "4 / 3", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)", background: "#f4f5fa", padding: 10 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.src as string} alt={m.caption || sec.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          </a>
                          {m.caption && (
                            <figcaption className="font-mono" style={{ marginTop: 8, fontSize: 11, letterSpacing: "0.06em", color: "#5b6178" }}>
                              {m.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}

                  {/* downloadable documents */}
                  {docs.length > 0 && (
                    <div className="flex flex-col" style={{ marginTop: "clamp(20px,2.5vw,30px)", gap: 10 }}>
                      {docs.map((m, k) => (
                        <a
                          key={k}
                          href={m.src as string}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center font-mono"
                          style={{ gap: 12, padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)", color: "#cdd3e6", fontSize: 13 }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={hex} strokeWidth="1.8" style={{ flex: "0 0 auto" }}>
                            <path d="M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                            <path d="M12 12v5m0 0-2-2m2 2 2-2" />
                          </svg>
                          <span style={{ flex: 1, minWidth: 0 }}>{m.caption || m.name}</span>
                          {m.size && <span style={{ color: "#5b6178", fontSize: 11.5 }}>{m.size}</span>}
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* gallery */}
        {project.shots.length > 0 && (
          <div style={{ marginTop: "clamp(50px,8vh,90px)" }}>
            <div className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: "0.22em", color: "#5b6178", marginBottom: 18 }}>{"// gallery"}</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              {project.shots.map((s, n) => (
                <div key={n} className="relative" style={{ aspectRatio: "4 / 3", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.09)", background: `linear-gradient(150deg, ${rgba(hex, 0.3)}, rgba(10,12,20,.6) 72%)` }}>
                  {s.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.src} alt={s.caption} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <span className="font-mono" style={{ position: "absolute", bottom: 12, left: 14, fontSize: 11, letterSpacing: "0.14em", color: "#8a90a6" }}>
                    {s.caption || `shot / ${String(n + 1).padStart(2, "0")}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* prev / next */}
        {i >= 0 && all.length > 1 && (
          <div className="flex justify-between font-mono" style={{ marginTop: "clamp(50px,8vh,90px)", paddingTop: 26, borderTop: "1px solid rgba(255,255,255,.09)", gap: 16 }}>
            <Link href={`/projects/${prev.slug}`} className="flex flex-col" style={{ gap: 6, color: "#9aa1b8" }}>
              <span style={{ fontSize: 11, letterSpacing: "0.16em", color: "#5b6178" }}>← PREV</span>
              <span className="font-serif italic" style={{ fontSize: "clamp(18px,2.4vw,26px)", color: "#eaecf5" }}>{prev.name}</span>
            </Link>
            <Link href={`/projects/${next.slug}`} className="flex flex-col items-end text-right" style={{ gap: 6, color: "#9aa1b8" }}>
              <span style={{ fontSize: 11, letterSpacing: "0.16em", color: "#5b6178" }}>NEXT →</span>
              <span className="font-serif italic" style={{ fontSize: "clamp(18px,2.4vw,26px)", color: "#eaecf5" }}>{next.name}</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

const BADGE_LABELS: Record<string, string> = {
  live: "EN PRODUCTION",
  beta: "EN BÊTA",
  working: "EN COURS",
  oss: "OPEN SOURCE",
  archived: "ARCHIVÉ",
};

function MetaRow({ label, value, color = "#cdd3e6" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "#5b6178", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 14, color }}>{value}</div>
    </div>
  );
}
