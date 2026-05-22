# CLAUDE.md

Personal portfolio for **Rukundo Ronaldo** — a fullstack developer (Django-focused). The site is an editorial, magazine-style portfolio built as **static HTML + CSS + vanilla JS**. No build step, no framework, no package manager. Copy in French (`lang="fr"`).

## How to run

Open any HTML file directly, or serve the folder for correct relative paths:

```bash
cd design-system && python3 -m http.server 8000
# then visit http://localhost:8000/home-atelier.html
```

There is no build, lint, or test pipeline. Edit a file, refresh the browser.

## Layout

Everything lives in `design-system/`:

| File | Purpose |
|------|---------|
| `home-atelier.html` | Primary home page variant — hero, about, projects, experience, skills, testimonials, contact. Floating dock nav. |
| `home-etudes.html` | Alternate home page layout (variant under exploration). |
| `project.html` | Project / case-study detail page. |
| `admin.html` | Admin / dashboard mockup screen. |
| `design-system.html` | Living style guide — tokens, type scale, components. |
| `nav-options.html` | Navigation pattern explorations. |
| `shared.css` | **The design system.** CSS custom-property tokens, theming, cursor, reveal animations. Imported by every page. |
| `shared.js` | **Shared interactions.** Theme toggle, custom cursor, split-text, scroll reveals, hover preview, magnetic hover, page-transition curtain, marquee. Imported by every page. |
| `image-slot.js` | Image placeholder / slot helper. |
| `design-canvas (1).jsx` | A React design sketch (reference only — the site itself is not React). |
| `scraps/` | Throwaway sketches and experiments. Not part of the site. |

Page-specific CSS lives in a `<style>` block inside each HTML file; anything reusable belongs in `shared.css`.

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
- Not a git repository yet.
- The portfolio content (projects, experience, testimonials) is currently placeholder/sample data to be replaced with real entries.
