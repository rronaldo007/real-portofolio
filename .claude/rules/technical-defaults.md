# Technical Defaults

> Conventions for the portfolio. Keep short — capture what isn't obvious from reading the code. See `CLAUDE.md` for the full project guide.

## Stack

- **Django 5.2 LTS** (Python 3.13) serves the pages as templates. Pages are static HTML/CSS/vanilla-JS — no frontend framework, no bundler.
- **django-unfold** themes the Django admin. `"unfold"` must stay **before** `django.contrib.admin` in `INSTALLED_APPS`; config in the `UNFOLD` settings dict.
- **Gunicorn** as the WSGI server; **WhiteNoise** serves hashed static files from the app.
- **SQLite** (in `data/`) — only for Django's built-in apps; no project models yet.
- **CSS:** plain CSS with custom-property design tokens in `static/css/shared.css`.
- **JS:** a single vanilla-JS IIFE in `static/js/shared.js`. No dependencies.
- **Fonts:** Instrument Serif, Geist, Geist Mono — from Google Fonts via `@import` in `shared.css`.
- **Lang:** copy is French (`<html lang="fr">`, `LANGUAGE_CODE = "fr"`, `TIME_ZONE = "Europe/Paris"`).
- **Run:** `docker compose up --build` (prod-like) or `manage.py runserver` (local). No tests/lint/CI yet.
- **Config via env:** `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`.

## Structure

- `config/` — Django project: `settings.py`, `urls.py`, `wsgi.py`, `asgi.py`.
- `pages/` — the single app. `urls.py` maps public URLs to templates via `TemplateView` (namespace `pages:`). `models.py` holds the content models (Project, Experience, Skill, Testimonial, SiteProfile singleton); `admin.py` registers themed Unfold ModelAdmins + a read-only LogEntry; `dashboard.py` has the Unfold sidebar badges + dashboard callback.
- `templates/pages/` — page templates (`home_atelier.html` = `/`, plus `home_etudes`, `project`, `admin`, `design_system`, `nav_options`).
- `static/css/shared.css` — the design system: tokens, theming, cursor, reveal animations.
- `static/js/shared.js` — shared interactions wired via `data-*` attributes; `static/js/image-slot.js` helper.
- `reference/` — `design-canvas.jsx` + `scraps/`: design sketches, not served, not part of the app.
- `data/` — SQLite DB (gitignored; Docker volume mount point).
- `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `requirements.txt` at root.
- `.claude/` — project docs/rules. `CLAUDE.md` at root is the entry point.

## Coding Standards

- **Never hardcode** colors, fonts, or easings — use the tokens in `shared.css :root` (`--bg`, `--ink`, `--accent`, `--font-display`, `--ease-out`, etc.).
- Every color must be defined for **both themes** (dark default + `html[data-theme="light"]`).
- Reusable styles go in `shared.css`; page-specific styles go in a `<style>` block inside that page's HTML.
- Reusable behavior goes in `shared.js`; avoid inline `<script>` blocks.
- Keep copy in **French** unless asked otherwise.

## Patterns to Follow

- **Behavior via data attributes** (wired in `shared.js`): `data-theme-toggle`, `data-split` (per-letter reveal), `.reveal` + `data-reveal-once` (+ `.reveal-delay-1/2/3`), `data-hover` / `data-cursor`, `data-preview`, `data-magnetic`, `data-transition` (page-transition curtain on internal links), `data-marquee`.
- **Theme** is dark by default, toggled to light, persisted in `localStorage` key `rr-theme`.
- **Editorial aesthetic:** large italic serif display type, mono uppercase labels with letter-spacing, generous whitespace, restrained purple accent.
- **Project status pills:** `status-live`, `status-beta`, `status-working`, `status-oss`, `status-archived`.

- **Templates** reference assets with `{% static %}` and link pages with `{% url 'pages:...' %}`; first line is `{% load static %}`. Add a new page = template in `templates/pages/` + a route in `pages/urls.py`.

## Patterns to Avoid

- No frontend framework / bundler / npm — the pages stay hand-written HTML/CSS/JS rendered by Django.
- No hardcoded asset paths or inter-page links in templates — always `{% static %}` / `{% url %}`.
- No per-page duplication of tokens or interactions — extend `shared.css` / `shared.js` instead.
- Don't disable the touch fallback: the custom cursor and hover effects must stay off under `@media (hover: none)`.
- Don't add motion without honoring `prefers-reduced-motion`.
- Don't commit secrets — `SECRET_KEY` and hosts come from env (`DJANGO_*`).
