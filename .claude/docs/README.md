# Docs

Reference material, architecture notes, deployment guides, and long-form context for Rukundo Ronaldo — Portfolio.

## What lives here

- Architecture diagrams and overviews
- Deployment and infrastructure docs
- Schema / data model references
- Testing strategy notes
- Third-party integration guides

## What does NOT live here

- Planning/decision docs — use `.claude/DECISIONS.md`
- Rules auto-loaded by Claude — use `.claude/rules/`
- Raw ideas — use `.claude/ideas/`

## Index

<!-- Add one line per doc: `- [TITLE.md](TITLE.md) — short description` -->

- [custom-domain-ovh-sevalla.md](custom-domain-ovh-sevalla.md) — how `rukundo-ronaldo.fr` was attached to the Sevalla app via OVH DNS (records, the OVH text-mode gotcha, SSL, primary domain, env vars, stale-cache pitfall)
- [seo.md](seo.md) — search visibility: the `_seo.html` head partial (OG/Twitter/JSON-LD), sitemap & robots, editing SEO via the admin, Google Search Console state, and the backlink lever
