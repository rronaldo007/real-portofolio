# SEO

How search visibility is implemented for **Rukundo Ronaldo — Portfolio**, and how to
maintain/improve it. The goal that drove this work: when someone searches
**"rukundo ronaldo"** (or "ronaldo rukundo"), the site at `rukundo-ronaldo.fr` should
come up. Names are low-competition, so on-page SEO + a verified Search Console
property + a few profile backlinks are enough.

Added on `feature/seo` (merged). Live on https://rukundo-ronaldo.fr.

## TL;DR — what's in place

- A reusable `<head>` SEO partial on the public pages: title, meta description,
  canonical, Open Graph, Twitter/X cards, and JSON-LD structured data.
- `/sitemap.xml` (home + published projects) and `/robots.txt`.
- Everything is **data-driven from the `SiteProfile` singleton + `Project` rows** —
  edit content in the Unfold admin and the tags update; no template edits needed.
- Google Search Console: domain property `rukundo-ronaldo.fr` **verified** (DNS TXT),
  sitemap **submitted**, homepage indexing **requested**.

## The moving parts

| Piece | File | Notes |
|-------|------|-------|
| SEO head partial | `templates/pages/_seo.html` | Included inside each page's `<head>`. |
| Per-request context | `pages/context_processors.py` (`site`) | Injects `profile` + `social_links` into **every** template. |
| Sitemap | `pages/sitemaps.py` → `/sitemap.xml` | `django.contrib.sitemaps`; uses request host (no sites framework). |
| robots.txt | `pages/views.py::robots_txt` → `/robots.txt` | Allows all, disallows `/admin/`, points to the sitemap. |
| Routes | `config/urls.py` | `path("sitemap.xml", …)`, `path("robots.txt", …)`. |
| Canonical / absolute URLs | `request.build_absolute_uri` + `SECURE_PROXY_SSL_HEADER` | URLs come out `https://` behind the Sevalla/Cloudflare proxy. |

### The `_seo.html` partial

Include it once inside a page's `<head>`. It reads `profile` (the `SiteProfile`
singleton) and `social_links` from the `site` context processor, and accepts these
optional params via `{% include "pages/_seo.html" with … %}`:

| Param | Default | Purpose |
|-------|---------|---------|
| `page_title` | `profile.name` | `<title>` + `og:title` |
| `page_description` | `profile.tagline` → `profile.bio` | meta description (striptags, truncated to 200) |
| `og_image` | `profile.photo_url` | Open Graph / Twitter image (absolute URL) |
| `og_type` | `"website"` | use `"article"` for project pages |
| `structured` | *(none)* | `"person"` or `"project"` → emits JSON-LD |
| `project` | — | the `Project` instance when `structured="project"` |

It emits: `<title>`, `meta description`, `link canonical`, `robots: index,follow`,
`author`, the full **Open Graph** set (`og:type/site_name/title/description/url/locale=fr_FR/image`),
**Twitter** cards (`summary_large_image` when an image exists, else `summary`), and
**JSON-LD**:

- `structured="person"` → `schema.org/Person` (name, url, jobTitle from tagline,
  image, address, email, and `sameAs` = the non-empty social links). This is the tag
  that helps Google connect the site to the **name** "Rukundo Ronaldo."
- `structured="project"` → `schema.org/CreativeWork` (title, description, url,
  dateCreated=year, image, author=Person).

### Where it's wired in

| Template | Include |
|----------|---------|
| `home_atelier.html` (`/`) | `… with structured="person"` |
| `home_etudes.html` (alt home) | `… with structured="person"` |
| `project.html` (`/work/<slug>/`) | `… with page_title=… og_image=project.cover_image_url og_type="article" structured="project"` |

> The internal/dev pages (`design_system`, `nav_options`, the `/cartes/*` tools, the
> `/dashboard/` mockup) intentionally do **not** include the SEO partial — they aren't
> meant to rank.

### Sitemap & robots

- `StaticViewSitemap` → just `pages:home` (priority 0.9).
- `ProjectSitemap` → `Project.objects.filter(status=PUBLISHED, show_in_index=True)`
  (priority 0.7, `lastmod = updated_at`). **Draft/archived projects are excluded** —
  same published-only set as the public work index.
- Both force `protocol = "https"`.
- `robots.txt` allows everything except `/admin/` and advertises the sitemap.

## Editing SEO content (no code)

It's all in the **Unfold admin** (`/admin/`):

- **`SiteProfile`** (singleton) — `name`, `tagline` (→ default description + JSON-LD
  jobTitle), `bio` (description fallback), `photo_url` (→ og:image), `location`,
  `email`, and the social URLs (`github_url`, `linkedin_url`, `twitter_url`,
  `dribbble_url`) which feed JSON-LD `sameAs`.
- **`Project`** — per-project `meta_title` and `meta_description` override the
  defaults on `/work/<slug>/`; `cover_image_url` becomes the share image. A project
  only appears in the sitemap/index when `status=PUBLISHED` **and** `show_in_index`.

## Google Search Console

- **Property:** Domain property `rukundo-ronaldo.fr` (covers http/https + all
  subdomains), **verified via a DNS TXT** record added at OVH (see
  [custom-domain-ovh-sevalla.md](custom-domain-ovh-sevalla.md) for the OVH text-mode
  procedure).
- **Sitemap:** submit the **full URL** `https://rukundo-ronaldo.fr/sitemap.xml`
  (domain properties reject a bare `sitemap.xml`).
- **Indexing:** homepage submitted via URL Inspection → "Request indexing."
- A brand-new site shows "Discovered – not indexed yet" for a while; indexing the
  name takes days, not minutes.

## Biggest remaining lever: backlinks

At setup, Search Console reported **"Referring page: None detected"** — nothing links
to the site yet. The single highest-impact action (and one only the owner can do):

> Add **https://rukundo-ronaldo.fr** to the **LinkedIn**, **GitHub**, and **X/Twitter**
> profiles. Those already rank for the name and will pass authority + speed up
> discovery. This is what tips the site onto page 1 for "Rukundo Ronaldo."

## Verifying after a deploy

```bash
curl -s https://rukundo-ronaldo.fr/sitemap.xml      # lists / + /work/<slug>/
curl -s https://rukundo-ronaldo.fr/robots.txt       # Sitemap: line present
curl -s https://rukundo-ronaldo.fr/ | grep -o '<title>[^<]*'        # title renders
curl -s https://rukundo-ronaldo.fr/ | grep -c 'application/ld+json' # JSON-LD present
```

Then validate the markup with Google's **Rich Results Test** / the **Schema markup
validator**, and preview share cards with the LinkedIn Post Inspector / X Card
Validator.

## Gotchas

- **Canonical/JSON-LD URLs depend on the proxy header.** `SECURE_PROXY_SSL_HEADER`
  must stay set or `request.scheme` can render `http://` behind Cloudflare.
- **Deploys are manual on Sevalla** — auto-deploy doesn't fire on push, so an SEO
  change isn't live (and Search Console can't fetch the new sitemap) until a manual
  deploy runs. See [custom-domain-ovh-sevalla.md](custom-domain-ovh-sevalla.md).
- **Description length:** the partial truncates to 200 chars; keep `tagline`/
  `meta_description` tight so they aren't cut mid-word in the SERP.
