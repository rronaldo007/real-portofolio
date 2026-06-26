import { getBootstrap } from "@/lib/api";
import { accentClass } from "@/lib/accent";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ChatWidget } from "@/components/ChatWidget";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Stack } from "@/sections/Stack";
import { Work } from "@/sections/Work";
import { Timeline } from "@/sections/Timeline";
import { Education } from "@/sections/Education";
import { AiJourney } from "@/sections/AiJourney";
import { Gallery } from "@/sections/Gallery";
import { Contact } from "@/sections/Contact";
import type { Bootstrap, Section } from "@/lib/types";

// Render each enabled section in admin-defined order, keyed on Section.key.
function renderSection(s: Section, data: Bootstrap) {
  switch (s.key) {
    case "about":
      return <About section={s} settings={data.settings} portrait={data.settings.photo} />;
    case "stack":
      return <Stack section={s} skills={data.skills} />;
    case "work":
      return <Work section={s} projects={data.projects} />;
    case "timeline":
      return <Timeline section={s} experiences={data.experiences} />;
    case "education":
      return <Education section={s} education={data.education} />;
    case "ai":
      return <AiJourney section={s} />;
    case "gallery":
      return <Gallery section={s} photos={data.photos} />;
    case "contact":
      return <Contact section={s} settings={data.settings} />;
    default:
      return null;
  }
}

// Rendered at request time (fetches the backend) — keeps the prod build
// independent of a running backend; on-demand revalidation keeps it fresh.
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getBootstrap();
  const { sections, settings } = data;

  return (
    <>
      <ScrollProgress />

      {/* vignette atmosphere */}
      <div
        aria-hidden
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, background: "radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(0,0,0,.55) 100%)" }}
      />

      <Nav sections={sections} settings={settings} />

      <main>
        <Hero settings={settings} />
        {sections.map((s) => {
          const node = renderSection(s, data);
          return node ? (
            <div key={s.key} className={accentClass(s.accent)}>
              {node}
            </div>
          ) : null;
        })}
      </main>

      <ChatWidget />
    </>
  );
}
