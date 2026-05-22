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
pages/              The one app — URL routes only; pages are rendered via TemplateView
templates/pages/    The page templates (the design system, see below)
static/css|js/      shared.css, shared.js, image-slot.js
reference/          design-canvas.jsx + scraps/ — design sketches, NOT served
data/               SQLite DB (gitignored; Docker volume mount point)
Dockerfile, docker-compose.yml, .dockerignore, requirements.txt
```

### Routes (`pages/urls.py`, namespace `pages:`)

| URL | Template | name |
|-----|----------|------|
| `/` | `home_atelier.html` | `home` — primary home: hero, about, projects, experience, skills, contact + floating dock |
| `/etudes/` | `home_etudes.html` | `home_etudes` — alternate home layout |
| `/project/` | `project.html` | `project` — case-study detail page |
| `/dashboard/` | `admin.html` | `admin_demo` — dashboard mockup (this is a static front-end page, NOT the Django admin) |
| `/design-system/` | `design_system.html` | `design_system` — living style guide |
| `/nav-options/` | `nav_options.html` | `nav_options` — nav pattern explorations |

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
- The app has no models yet — `pages` only maps URLs to templates. The DB exists for Django's built-in apps (admin/sessions). Add models when content becomes dynamic.
- Static is collected at image build (`collectstatic`) and served by WhiteNoise with hashed filenames; `migrate` runs on container start.
- Config is environment-driven: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS` (see `config/settings.py` and `docker-compose.yml`). Set a real secret key in production.
- The portfolio content (projects, experience, testimonials) is currently hardcoded placeholder data in the templates. **Direction:** everything will become customisable — model the content and edit it via the Unfold admin, then drive the templates from the DB.
- Admin theme: Unfold is brand-matched to `reference/admin.html` — purple accent + warm-dark palette via `UNFOLD["COLORS"]` in `config/settings.py`, editorial fonts via `static/css/admin.css`. `reference/admin.html` is the design spec (not served).
