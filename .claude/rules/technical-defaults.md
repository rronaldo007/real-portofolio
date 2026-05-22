# Technical Defaults

> Conventions for the portfolio. Keep short — capture what isn't obvious from reading the code. See `CLAUDE.md` for the full project guide.

## Stack

- **Static site** — hand-written HTML, CSS, vanilla JS. No framework, no build step, no package manager.
- **CSS:** plain CSS with custom properties (design tokens) in `design-system/shared.css`.
- **JS:** a single vanilla-JS IIFE in `design-system/shared.js`. No bundler, no dependencies.
- **Fonts:** Instrument Serif, Geist, Geist Mono — loaded from Google Fonts via `@import` in `shared.css`.
- **Lang:** copy is French (`<html lang="fr">`).
- **Serve:** `cd design-system && python3 -m http.server 8000`. No tests/lint/CI.

## Structure

- `design-system/` — all site files (every page is a standalone `.html`).
  - `shared.css` — the design system: tokens, theming, cursor, reveal animations. Imported by every page.
  - `shared.js` — shared interactions wired via `data-*` attributes. Imported by every page.
  - `home-atelier.html` (primary) / `home-etudes.html` (alt) — home page variants.
  - `project.html`, `admin.html`, `design-system.html` (style guide), `nav-options.html`.
  - `image-slot.js`, `design-canvas (1).jsx` (React reference sketch, not used by the site).
  - `scraps/` — throwaway experiments, not part of the site.
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

## Patterns to Avoid

- No build tooling / npm dependencies — adding a bundler breaks the "open the file and it works" model.
- No per-page duplication of tokens or interactions — extend the shared files instead.
- Don't disable the touch fallback: the custom cursor and hover effects must stay off under `@media (hover: none)`.
- Don't add motion without honoring `prefers-reduced-motion`.
