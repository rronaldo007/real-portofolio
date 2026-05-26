# CLAUDE.md

Personal portfolio for **Rukundo Ronaldo** — a fullstack developer (Django-focused). An editorial, magazine-style portfolio. The pages are **HTML/CSS/vanilla-JS** served by **Django 5.2 LTS** as templates; copy is in French (`lang="fr"`). Static assets are served by WhiteNoise; the app runs under Gunicorn in Docker. The Django admin uses the **Unfold** theme (`django-unfold`).

## How to run

**Docker (recommended — mirrors production):**

```bash
docker compose up --build
# → http://localhost:8000   (DEBUG=False, Gunicorn, WhiteNoise static)
```

**Local (Django dev server):**

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
# → http://127.0.0.1:8000
```

No automated test/lint pipeline yet. `manage.py check` validates config.

## Layout

```
config/             Django project (settings, urls, wsgi/asgi)
pages/              The one app
  models.py         Project (+ProjectMetric), Experience, Skill, Testimonial, ContactMessage, SiteProfile (singleton)
  views.py          DB-driven views (home, project_detail, contact, …) feeding templates/pages/*
  urls.py           Public routes (namespace pages:) → views.py
  admin.py          Unfold ModelAdmins (themed) + read-only LogEntry (Activity Log)
  dashboard.py      Unfold sidebar badge callbacks + DASHBOARD_CALLBACK
  backends.py       UsernameOrEmailBackend — admin login by username or email
  sitemaps.py       sitemap.xml entries (static pages + projects)
  context_processors.py  injects shared context (e.g. SiteProfile) into all templates
  migrations/       0001 schema, 0002/0004/0006 seed content, 0003/0005 schema changes
templates/pages/    Public page templates (the design system, see below)
templates/admin/    index.html — custom Unfold dashboard
static/css|js/      shared.css, shared.js, image-slot.js, admin.css (Unfold theme)
reference/          admin.html (admin design spec) + design-canvas.jsx + scraps/ — NOT served
data/               SQLite DB (gitignored; Docker volume mount point)
Dockerfile, docker-compose.yml, .dockerignore, requirements.txt
```

### Admin (Unfold)

The Django admin at `/admin/` realizes `reference/admin.html` as a full content system:
- **Sidebar** nav groups (Content / Site / System) with live count badges, incl. Messages.
- **Dashboard** (`templates/admin/index.html` + `DASHBOARD_CALLBACK`): greeting, stat cards,
  a real "projets par année" chart, quick actions, recent activity, and a Theme & site panel.
- **Editors**: Project (tabbed fieldsets, status pills, `ProjectMetric` inline, flags
  featured/show_in_index/open_source), Experience, Skill, Testimonial, SiteProfile (singleton:
  profile/hero/contact/theme/resume), a ContactMessage inbox (read/unread), read-only Activity Log.

Config lives in `UNFOLD` (`config/settings.py`) + `pages/dashboard.py`.

### Routes (`pages/urls.py`, namespace `pages:`)

| URL | Template | name |
|-----|----------|------|
| `/` | `home_atelier.html`* | `home` — DB-driven; `*`served template depends on `SiteProfile.home_variant` |
| `/etudes/` | `home_etudes.html` | `home_etudes` — alternate home layout (partly static) |
| `/work/<slug>/` | `project.html` | `project_detail` — DB-driven case study (+metrics) |
| `/project/` | → redirect | `project` — redirects to the first project |
| `/contact/` | (POST) | `contact` — saves a ContactMessage to the admin inbox |
| `/dashboard/` | `admin.html` | `admin_demo` — dashboard mockup (this is a static front-end page, NOT the Django admin) |
| `/design-system/` | `design_system.html` | `design_system` — living style guide |
| `/nav-options/` | `nav_options.html` | `nav_options` — nav pattern explorations |
| `/cartes/` | `cartes_de_visite.html` | `cartes` — business-card **designer** (see below). Linked from a hidden purple-period easter egg in the home footer |
| `/cartes/atelier/` | `cartes_atelier.html` | `cartes_atelier` — **freeform playground** to build designs from scratch (reached via the "Créer un design" CTA on `/cartes/`) |

### Cartes de visite designer (`/cartes/`) + playground (`/cartes/atelier/`)

A self-contained business-card design tool. **Hybrid model:** the editable main card is authored as **print-ready SVG**; the flashy HTML cards lower on the page (holo, particules, foil…) stay **screen-only showcases**.

JS layers (all page-specific modules, not `shared.js`):
- **`static/js/cartes-core.js`** → `window.CartesCore`: the shared engine — SVG primitives (`T`/`rect`/`line`/`qrGroup`/`photoNode`), `FORMATS`, `renderElements()` (freeform), font embedding, and the export pipeline (`exportSheet` → SVG/PNG/JPG/PDF). **Used by both pages.**
- **`static/js/cartes.js`** (`/cartes/`): preset `DESIGNS` registry (`editoriale`/`mono`/`photo`), live preview, Réglages panel, params, `localStorage` persistence, clone-create.
- **`static/js/cartes-atelier.js`** (`/cartes/atelier/`): the **freeform editor** — blank SVG canvas, add text/shape/line/photo/QR, drag-to-move + resize handles, per-element inspector, front/back, save to the shared library. Plus a left aside with **Modèles** (`STARTERS` — editable starter designs with live thumbnails) and **Combinaisons** (`PALETTES` — click to re-skin via colour *roles*). Entry from `/cartes/`: the "CRÉER UN DESIGN" topbar button + the hero CTA.

**Colour roles:** element colours (and face `bg`) may be a palette token (`bg`/`ink`/`sub`/`accent`) or a hex literal — `CartesCore.resolveColor()` maps tokens against the active palette. Starters use roles so a palette swap recolours everything at once; the inspector/bg colour controls are palette swatches + a custom picker. Freeform designs persist their `palette` so `/cartes/` renders them correctly.
- The `/cartes/` inline `<script>` only keeps the showcase tilt/flip/particles + panel open-close.

**Shared design library** (`localStorage` key `rr-cartes-v1`): `custom[id]` holds either clone designs (`{type:"clone",base,pal}`) or **freeform** designs (`{type:"freeform",format,front:{bg,els},back:{bg,els}}`) authored in the playground. Freeform designs appear in the `/cartes/` selector and export there too. The playground also autosaves a working draft (`atelierDraft`) and sets the saved design active (`design`).

- **Designs:** SVG registry (`editoriale`, `mono`, `photo`) + user-created customs. Add a design = add an entry to `DESIGNS` in `cartes.js`.
- **Params** (Réglages panel): design, format (85×55 / 90×90 / 55×85 / 70×44 mm), finish (preview-only flair), accent, identity fields, **photo** (file → dataURL, downscaled), **website**, **QR target** (any URL/social → scannable QR via vendored `static/js/qrcode.min.js`).
- **Create design:** clones current as a named custom design saved to the library.
- **Persistence:** browser `localStorage` key `rr-cartes-v1` (not the DB — publishing a chosen card to the public site would be a separate feature).
- **Export:** recto+verso at 300 dpi — **SVG** (vector, fonts embedded as base64 from `static/fonts/*.woff2`), **PDF** (vector page w/ embedded JPEG), **PNG**, **JPG**. Font URLs + defaults are injected via `{% static %}` into `window.CARTES_FONT_URLS` / `window.CARTES_DEFAULTS` (needed because WhiteNoise hashes filenames).

Templates reference assets with `{% static %}` and link between pages with `{% url 'pages:...' %}`. Page-specific CSS lives in a `<style>` block inside each template; anything reusable belongs in `static/css/shared.css`. New templates need `{% load static %}` on the first line.

## Design system (the important part)

All visual decisions flow from tokens defined in `shared.css` `:root`. **Use the tokens — never hardcode colors, fonts, or easings.**

- **Theme:** dark by default, light via `html[data-theme="light"]`. Toggle is persisted to `localStorage` key `rr-theme`. Set tokens for both themes when adding colors.
- **Color tokens:** `--bg`, `--bg-2`, `--ink`, `--ink-2`, `--muted`, `--line`, `--line-strong`, `--accent` (purple `#c084fc` dark / `#7c3aed` light), `--accent-soft`.
- **Fonts:** `--font-display` (Instrument Serif, italic — used for big editorial headings), `--font-body` (Geist), `--font-mono` (Geist Mono — used for eyebrows, labels, tags, ALL-CAPS metadata). Loaded from Google Fonts.
- **Easings:** `--ease-out` (cubic-bezier 0.16,1,0.3,1) for entrances, `--ease` for state changes.
- **Helpers:** `.mono`, `.serif`, `.muted`, `.rule` / `.rule-strong`, `.link-u` (reverse-wipe underline).

## JS interaction hooks (data attributes)

`shared.js` is a single IIFE that wires behavior to data attributes — add the attribute, get the behavior for free:

- `data-theme-toggle` — element toggles light/dark.
- `data-split` — splits text into per-letter spans for staggered reveal.
- `.reveal` + `data-reveal-once` — fades/slides in on scroll via IntersectionObserver (`.reveal-delay-1/2/3` for stagger).
- `data-hover` / `data-cursor="text|default"` — drives the custom cursor state.
- `data-preview="<gradient-or-url>"` — floating image preview that follows the cursor on hover.
- `data-magnetic` — element drifts toward the cursor.
- `data-transition` on `<a>` — plays the page-transition curtain before navigating (internal links only; skips `#` and `http`).
- `data-marquee` — duplicates inner HTML for a seamless scrolling loop.

The custom cursor and hover effects are disabled on touch devices (`@media (hover: none)`).

## Conventions

- French copy throughout; keep new content in French unless asked otherwise.
- Editorial aesthetic: large italic serif display type, generous whitespace, mono labels in uppercase with letter-spacing, restrained purple accent. Match the existing tone — calm, crafted, "software with material."
- Project cards carry a status pill: `status-live`, `status-beta`, `status-working`, `status-oss`, `status-archived`.
- Prefer extending tokens/utilities in `shared.css` over per-page one-offs; add new shared behavior to `shared.js` rather than inline scripts.
- Respect `prefers-reduced-motion` when adding new animation.

## Notes

- `.claude/STATUS.md` is auto-generated — don't hand-edit it.
- Content is fully customisable end-to-end: edit in the Unfold admin → it shows on the public site. `pages/views.py` passes `profile`, `projects`, `experiences`, `skill_groups`, etc. into `home_atelier.html`; `/work/<slug>/` renders a project (incl. metrics) via `project_detail`. The public contact form POSTs to `pages:contact` → creates a `ContactMessage` (admin inbox). `home_etudes.html` (alternate variant, served when `SiteProfile.home_variant=etudes`) is still partly static.
- Static is collected at image build (`collectstatic`) and served by WhiteNoise with hashed filenames; `migrate` runs on container start.
- Config is environment-driven: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS` (see `config/settings.py` and `docker-compose.yml`). Set a real secret key in production.
- The portfolio content (projects, experience, testimonials) is currently hardcoded placeholder data in the templates. **Direction:** everything will become customisable — model the content and edit it via the Unfold admin, then drive the templates from the DB.
- Admin theme: Unfold is brand-matched to `reference/admin.html` — purple accent + warm-dark palette via `UNFOLD["COLORS"]` in `config/settings.py`, editorial fonts via `static/css/admin.css`. `reference/admin.html` is the design spec (not served).
