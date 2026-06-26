# Portfolio Build Guide (React + Django)

A complete spec for building the "Mission Control" portfolio as a React frontend with a Django REST Framework backend, with everything (sections, projects, gallery, logo, copy) editable from the Django admin.

This matches stacks you already use: the Vite + React + TypeScript + TanStack Query frontend from Youcus, and Django + DRF from Diaspora Homes. The HTML files produced alongside this guide are working references for look and behavior; this guide tells you how to turn them into a real app.

> SEO note: a plain client-side React SPA ships an empty shell first, which is weak for a page recruiters may find via search. If that matters, use Next.js for the frontend instead of Vite (same components, same DRF backend). The deltas are in section 13.

---

## 1. Goal and principles

A dark, cinematic, single-page portfolio with a few deeper sub-pages, on a space and "mission control" theme: telemetry labels, a solar system in the hero, a planet motif, neon accents on near-black.

Three rules hold it together:

1. Three type voices. An italic serif for titles, a clean grotesque for body, a monospace for labels and data. Never mix these jobs.
2. One accent per section, used as glow, not flat fill.
3. Motion serves meaning, and degrades to static content when GSAP fails or the visitor prefers reduced motion.

Content is not hard-coded. Sections, projects, education, experience, gallery photos, the logo, and the copy all come from the Django models and the API, so you change them from the admin without touching React.

---

## 2. Architecture

Two parts:

```
backend/   Django 5 + DRF        -> JSON API + admin (your CMS)
frontend/  Vite + React + TS     -> the site, fetches the API
```

- Backend exposes read endpoints for the content models and (later) a write endpoint for the chat assistant.
- Frontend fetches with TanStack Query, routes with React Router, styles with Tailwind, animates with GSAP.
- In development the two run on different ports, so enable CORS. In production you either serve the built frontend from Django or host it separately and point it at the API base URL.

---

## 3. Design system (frontend)

### Colors

| Token | Hex | Use |
|---|---|---|
| bg | `#05060B` | page background |
| ink | `#EAF0FF` | primary text |
| dim | `#7E89A8` | secondary text, labels |
| violet | `#9B6BFF` | primary accent |
| cyan | `#2BF1FF` | secondary accent |
| lime | `#C6FF3A` | "next" / CV button |
| pink | `#FF7AD9` | extra accent |

```js
// frontend/tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { bg:"#05060B", ink:"#EAF0FF", dim:"#7E89A8",
              violet:"#9B6BFF", cyan:"#2BF1FF", lime:"#C6FF3A", pink:"#FF7AD9" },
    fontFamily: {
      serif:['"Instrument Serif"',"serif"],   // titles, italic only
      sans:['"Space Grotesk"',"sans-serif"],  // body
      mono:['"JetBrains Mono"',"monospace"],  // labels, data
    },
  }},
};
```

Drive the per-section/per-project accent with a CSS variable so a component can recolor itself:

```css
:root{ --accent:#9B6BFF; }
```

```tsx
<section style={{ ["--accent" as any]: project.accentHex }}>
```

### Typography

- Titles: Instrument Serif, italic, weight 400, large, tight line-height.
- Body: Space Grotesk.
- Labels and data: JetBrains Mono, uppercase, wide tracking.

Every section header: a mono eyebrow with a pulsing accent dot ("NN / SECTION"), then the big italic serif title.

### Fonts and logo

Self-host the three font families in `frontend/public/fonts/` with `@font-face`, so there is no external request or flash. The logo is the text mark "R" with a violet superscript "2"; keep it a `<Logo/>` component and feed the text from site settings, so you can swap to an SVG later in one place.

---

## 4. Backend: Django + DRF

### Models

Same models make everything editable. Trim fields you do not need.

```python
# api/models.py
from django.db import models

class SiteSettings(models.Model):
    logo_text = models.CharField(max_length=20, default="R")
    logo_super = models.CharField(max_length=4, default="2")
    full_name = models.CharField(max_length=80, default="Ronaldo Rukundo")
    location = models.CharField(max_length=80, default="Lyon, France")
    lat = models.CharField(max_length=16, default="45.7640")
    lon = models.CharField(max_length=16, default="4.8357")
    cv = models.FileField(upload_to="cv/", blank=True)
    github = models.URLField(default="https://github.com/rronaldo007")
    linkedin = models.URLField(default="https://linkedin.com/in/rukundo-ronaldo")

ACCENTS = [("violet","violet"),("cyan","cyan"),("lime","lime"),("pink","pink")]

class Section(models.Model):
    key = models.SlugField(unique=True)        # about, stack, work, log, edu, ai, gallery, contact
    nav_label = models.CharField(max_length=24)
    number = models.PositiveIntegerField()
    title = models.CharField(max_length=120)
    accent = models.CharField(max_length=8, choices=ACCENTS, default="violet")
    is_enabled = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    class Meta: ordering = ["order"]

class Project(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    category = models.CharField(max_length=60)
    year = models.CharField(max_length=20)
    accent = models.CharField(max_length=8, choices=ACCENTS, default="violet")
    summary = models.CharField(max_length=240)
    lead = models.CharField(max_length=240)
    overview = models.TextField()                  # paragraphs split on blank lines
    role = models.CharField(max_length=60)
    stack = models.JSONField(default=list)
    highlights = models.JSONField(default=list)
    cover = models.ImageField(upload_to="projects/", blank=True)
    live_url = models.URLField(blank=True)
    repo_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    class Meta: ordering = ["order"]

class ProjectShot(models.Model):
    project = models.ForeignKey(Project, related_name="shots", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="projects/shots/")
    caption = models.CharField(max_length=120, blank=True)

class Experience(models.Model):
    title = models.CharField(max_length=120)
    when = models.CharField(max_length=30)
    description = models.TextField()
    role_type = models.CharField(max_length=60)
    location = models.CharField(max_length=60)
    tags = models.JSONField(default=list)
    accent = models.CharField(max_length=8, choices=ACCENTS, default="violet")
    order = models.PositiveIntegerField(default=0)
    class Meta: ordering = ["order"]

class Education(models.Model):
    title = models.CharField(max_length=120)
    institution = models.CharField(max_length=120)
    rncp_level = models.CharField(max_length=12)
    status = models.CharField(max_length=40)
    focus = models.CharField(max_length=240)
    accent = models.CharField(max_length=8, choices=ACCENTS, default="cyan")
    is_target = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    class Meta: ordering = ["order"]

class Photo(models.Model):
    image = models.ImageField(upload_to="gallery/")
    caption = models.CharField(max_length=120, blank=True)
    taken = models.CharField(max_length=20, blank=True)
    span = models.CharField(max_length=8, blank=True)   # "", "cw", "rh", "cwrh" for the mosaic
    order = models.PositiveIntegerField(default=0)
    class Meta: ordering = ["order"]
```

Register all of these in `admin.py`, with `ProjectShot` as an inline under `Project`. The admin is your CMS.

### Serializers

```python
# api/serializers.py
from rest_framework import serializers
from .models import *

class ProjectShotSerializer(serializers.ModelSerializer):
    class Meta: model = ProjectShot; fields = ["image","caption"]

class ProjectSerializer(serializers.ModelSerializer):
    shots = ProjectShotSerializer(many=True, read_only=True)
    class Meta: model = Project; fields = "__all__"

class SectionSerializer(serializers.ModelSerializer):
    class Meta: model = Section; fields = "__all__"

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta: model = Experience; fields = "__all__"

class EducationSerializer(serializers.ModelSerializer):
    class Meta: model = Education; fields = "__all__"

class PhotoSerializer(serializers.ModelSerializer):
    class Meta: model = Photo; fields = "__all__"

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta: model = SiteSettings; fields = "__all__"
```

### Views and routes

```python
# api/views.py
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all(); serializer_class = ProjectSerializer
    lookup_field = "slug"

class PhotoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Photo.objects.all(); serializer_class = PhotoSerializer

class Bootstrap(APIView):
    # one call that returns everything the home page needs
    def get(self, request):
        return Response({
            "settings": SiteSettingsSerializer(SiteSettings.objects.first()).data,
            "sections": SectionSerializer(Section.objects.filter(is_enabled=True), many=True).data,
            "projects": ProjectSerializer(Project.objects.all(), many=True).data,
            "experiences": ExperienceSerializer(Experience.objects.all(), many=True).data,
            "education": EducationSerializer(Education.objects.all(), many=True).data,
            "photos": PhotoSerializer(Photo.objects.all(), many=True).data,
        })
```

```python
# api/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProjectViewSet, PhotoViewSet, Bootstrap

router = DefaultRouter()
router.register("projects", ProjectViewSet)
router.register("photos", PhotoViewSet)

urlpatterns = [
    path("bootstrap/", Bootstrap.as_view()),
    path("", include(router.urls)),
]
```

A single `bootstrap/` call keeps the home page to one request. Individual `projects/<slug>/` and `photos/` endpoints back the detail and gallery pages.

### Settings essentials

- `django-cors-headers`: allow your frontend origin in development.
- `Pillow` for `ImageField`.
- Serve `MEDIA_URL` / `MEDIA_ROOT` for uploaded images, or push them to object storage.
- Return absolute image URLs (DRF does this when the serializer has the request in context, which `ModelViewSet` provides).

---

## 5. Frontend: React structure

```
frontend/src/
  main.tsx
  App.tsx                 # routes + providers
  api/
    client.ts             # fetch wrapper, base URL from env
    types.ts              # Project, Section, Photo, ...
    queries.ts            # TanStack Query hooks
  hooks/
    useCanvasLoop.ts      # rAF loop helper for canvas pieces
    useGsapReveals.ts     # scroll reveals
    useScrollSpy.ts       # nav active section
    useCursor.ts          # custom cursor
  components/
    Logo.tsx  Nav.tsx  SectionHeader.tsx  Eyebrow.tsx
    ChatWidget.tsx  CustomCursor.tsx  PageTransition.tsx
    canvas/ SolarSystem.tsx  Planet.tsx
  sections/
    Hero.tsx  About.tsx  Stack.tsx  Projects.tsx  Experience.tsx
    Education.tsx  AiJourney.tsx  Gallery.tsx  Contact.tsx
  pages/
    Home.tsx  ProjectsList.tsx  ProjectDetail.tsx  GalleryPage.tsx
  styles/ index.css
```

### Types and data layer

```ts
// api/types.ts
export type Accent = "violet" | "cyan" | "lime" | "pink";
export interface Project {
  slug: string; name: string; category: string; year: string; accent: Accent;
  summary: string; lead: string; overview: string; role: string;
  stack: string[]; highlights: string[]; cover: string | null;
  live_url: string; repo_url: string; is_featured: boolean;
  shots: { image: string; caption: string }[];
}
// ... Section, Experience, Education, Photo, SiteSettings, Bootstrap
```

```ts
// api/client.ts
const BASE = import.meta.env.VITE_API_URL ?? "/api";
export const api = (path: string) =>
  fetch(`${BASE}${path}`).then(r => { if(!r.ok) throw new Error(r.statusText); return r.json(); });
```

```ts
// api/queries.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
export const useBootstrap   = () => useQuery({ queryKey:["bootstrap"], queryFn:()=>api("/bootstrap/") });
export const useProject = (slug:string) =>
  useQuery({ queryKey:["project",slug], queryFn:()=>api(`/projects/${slug}/`) });
export const usePhotos      = () => useQuery({ queryKey:["photos"], queryFn:()=>api("/photos/") });
```

### Routing

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient();
export default function App(){
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <CustomCursor/>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/projects" element={<ProjectsList/>}/>
            <Route path="/projects/:slug" element={<ProjectDetail/>}/>
            <Route path="/gallery" element={<GalleryPage/>}/>
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

Sections become components that receive their slice of the bootstrap data as props. The nav, section headers, project cards, photo tiles, credential cards, and log entries are all small reusable components driven by the typed data.

---

## 6. Canvas pieces in React

The solar system, the planet, and the black hole are plain canvas. In React they live in a component with a ref and an effect that runs the loop and cleans up on unmount.

```tsx
// components/canvas/SolarSystem.tsx
import { useRef, useEffect } from "react";

export default function SolarSystem(){
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    let raf = 0, t = reduce ? 2 : 0;
    const resize = () => { /* set cv.width/height with DPR, rebuild stars */ };
    const frame = () => {
      if(!reduce) t += 0.004;
      // clear, nebula, stars, orbits, sun, planets, ring, moon  (port from mission-control-hero.html)
      raf = requestAnimationFrame(frame);
    };
    resize(); addEventListener("resize", resize); raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 -z-10" />;
}
```

Port the drawing code from the reference files verbatim into `frame`. Same pattern for `Planet.tsx`.

---

## 7. GSAP in React

Use `gsap.context` (or the `useGSAP` hook from `@gsap/react`) so animations are scoped and cleaned up.

```tsx
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function useReveals(scope: React.RefObject<HTMLElement>){
  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(el =>
        gsap.from(el, { y: 28, opacity: 0, duration: .7, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" } }));
    }, scope);
    return () => ctx.revert();
  }, []);
}
```

Use `gsap.from` (not CSS-hidden states) so content is visible if the bundle fails. Per section: hero intro timeline, staggered reveals, the experience spine drawing on scroll, the education gauge filling.

---

## 8. Page transitions

A fixed overlay that wipes up on mount and down before navigating. In React, animate on route change and intercept link clicks with `useNavigate`, playing the cover animation then navigating in the `onComplete`.

```tsx
// simplified: cover, navigate, then the next route's mount wipes it away
const navigate = useNavigate();
const go = (to: string) =>
  gsap.fromTo(overlay.current, { yPercent: 100 }, { yPercent: 0, duration: .6,
    ease: "power4.inOut", onComplete: () => navigate(to) });
```

---

## 9. Sections

Each maps to a reference HTML file; port the markup to a React component and feed it data.

- Hero (`mission-control-hero.html`): telemetry row, italic name (solid first name, outlined surname), typewriter line, status chips, the `SolarSystem` canvas behind. Component `Hero.tsx`.
- About (`about-section.html`): two columns, lead statement, meta 2x2 grid, the "plan" stepper, an image (the portrait, served from the API), and the `Planet` canvas. Component `About.tsx`.
- Stack (`stack-readout.html`): the terminal readout, command groups and tags from data. `Stack.tsx`.
- Projects (`projects-horizontal.html`): horizontal scroll cards from featured projects, plus a "See all projects" button linking to `/projects`. `Projects.tsx`.
- Experience (`experience-section.html`): full-width log rows on a gradient spine, from the Experience data. `Experience.tsx`.
- Education (`education-section.html`): RNCP clearance cards and the clearance gauge. `Education.tsx`.
- AI journey: the climax, the boldest reveal. `AiJourney.tsx`.
- Gallery (`gallery-section.html`): the mosaic with a lightbox and a "See gallery" button to `/gallery`. `Gallery.tsx`.
- Contact and footer (`footer-cosmic.html`): two flexed blocks, the lone planet, links from settings, the footer meta strip. `Contact.tsx`.

---

## 10. Multi-page parts

- `/projects` (`projects.html`): the all-projects list, fetched from the projects endpoint, each row links to `/projects/:slug`.
- `/projects/:slug` (`project.html`): fetch one project with `useProject(slug)`, render name, lead, cover, overview, highlights, the meta card, the shots gallery, and prev/next. Recolor the page with the project accent. This replaces the static `?id=` array in the reference.
- `/gallery` (`gallery.html`): all photos from the photos endpoint, mosaic and lightbox.

---

## 11. Global components

- Nav (`nav.html`): a single-row pill of the enabled sections with a sliding violet indicator that follows hover and rests on the active section. Drive the active state with `useScrollSpy` (an IntersectionObserver over the section elements). Logo left, lime CV button right, a scroll-progress bar on top, condense-on-scroll background, and a hamburger to a full-screen overlay below about 1080px.
- Chat widget (`chat-widget.html`): the robot launcher and panel as `ChatWidget.tsx`, interface only for now. Later, POST the message to a Django endpoint that runs your assistant over your real content (pairs with the local RAG assistant in the AI section) and stream the reply.
- Custom cursor and page transitions as above.

---

## 12. Chat wiring (later)

When ready, add a write endpoint:

```python
# api/views.py
class Chat(APIView):
    def post(self, request):
        question = request.data.get("message","")
        # call your model / retrieval assistant over your real content
        return Response({"reply": "..."})
```

From React, post the message and append the reply to the panel. Stream with Server-Sent Events or chunked fetch if you want the typing effect to be real.

---

## 13. Next.js variant (for SEO)

If search visibility matters, swap the Vite frontend for Next.js and keep the same DRF backend. What changes:

- Fetch in server components or with `getStaticProps` / `generateStaticParams`, so pages are server-rendered or statically generated and indexable.
- File-based routing replaces React Router: `app/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/gallery/page.tsx`.
- GSAP and the canvas components must be client components ("use client"), since they touch the DOM and `window`.
- Everything else (design system, DRF backend, component markup) is identical.

This is the same pairing as your Diaspora Homes stack, so the patterns carry over.

---

## 14. Customization checklist

- Sections: the Section model controls number, nav label, title, accent, order, on/off. The nav and the section headers both read it.
- Projects: the Project model plus ProjectShot for the detail gallery. Featured projects show in the home carousel; all show on `/projects`.
- Logo: SiteSettings `logo_text` / `logo_super`, rendered by `<Logo/>`. Swap to an SVG by editing only that component.
- Copy, links, CV, coordinates: SiteSettings.
- Photos: the Photo model, with an optional `span` to art-direct the mosaic.
- Colors and fonts: the Tailwind config and the CSS variables.

---

## 15. Reference files

Working references for look and behavior; port markup, CSS, canvas, and animation code into the React components.

- `mission-control-hero.html` - hero with the solar system and italic name
- `about-section.html` - about, image slot, plan stepper, planet
- `stack-readout.html` - terminal stack readout
- `projects-horizontal.html` - home projects carousel with "See all projects"
- `experience-section.html` - mission-log timeline
- `education-section.html` - RNCP clearance cards and gauge
- `gallery-section.html` - home gallery mosaic with "See gallery"
- `gallery.html` - full gallery page
- `projects.html` - all-projects index (GSAP)
- `project.html` - single project detail (GSAP, prev/next)
- `footer-cosmic.html` - contact and footer, two blocks with a planet
- `chat-widget.html` - robot chat launcher and panel
- `nav.html` - navigation with sliding indicator and mobile overlay

---

## 16. Build order

1. Backend: Django + DRF, the models, admin, serializers, the bootstrap and detail endpoints, CORS, media. Seed your real content.
2. Frontend: Vite + React + TS + Tailwind + TanStack Query + React Router. Self-host the fonts, set the design tokens, build `Logo`, `Eyebrow`, `SectionHeader`.
3. Build the data layer (types, client, query hooks) and confirm the bootstrap call renders.
4. Build the nav and the one-page Home with all section components from the data.
5. Port the canvas components (solar system, about planet, footer planet) and the chat widget.
6. Build `/projects`, `/projects/:slug`, `/gallery`.
7. Add the GSAP layer and page transitions last, with the reduced-motion fallback.
8. Wire the chat widget to a backend when ready, ideally to your own retrieval assistant.
9. Deploy: build the frontend, serve it from Django or a separate host, and point `VITE_API_URL` at the API.
