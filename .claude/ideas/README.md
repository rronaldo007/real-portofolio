# Ideas

Product and engineering ideas for Rukundo Ronaldo — Portfolio. Capture raw ideas here before they graduate into planning docs, issues, or feature branches.

## File convention

One file per idea: `YYYY-MM-DD-short-slug.md`. Files sort chronologically by default.

Each file starts with YAML frontmatter:

```yaml
---
title: Short title
date: YYYY-MM-DD
area: <domain> | tooling | backend | frontend | ...
status: raw | exploring | planned | shipped | dropped
---
```

Body: 1–3 short sections. Keep it tight — this is capture, not a plan.
- **What:** one or two sentences describing the idea.
- **Why:** why it matters (problem, leverage, or tradeoff).
- **Unlocks:** what it enables downstream (optional).

## Lifecycle

- `raw` — captured, not yet evaluated.
- `exploring` — being prototyped, read, or discussed.
- `planned` — has a plan doc or feature branch.
- `shipped` — merged. Keep the file as historical record.
- `dropped` — decided against. Note the reason at the bottom.

When an idea ships or is dropped, update `status` in the frontmatter — don't delete the file.

## Index

<!-- Add one line per idea: `- [Title](filename.md) — area · status — one-line summary` -->
