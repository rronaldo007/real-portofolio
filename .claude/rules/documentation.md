# Documentation Rules

## Location

- All project documentation lives under `.claude/` — never at the repo root or inside source directories.
- Reference material, architecture notes, deployment guides: `.claude/docs/`
- Rules (auto-loaded by Claude Code): `.claude/rules/`
- Agent definitions: `.claude/agents/`
- Skills: `.claude/skills/`
- Top-level working files (`STATUS.md`, `DECISIONS.md`): directly in `.claude/`
- Raw ideas log: `.claude/ideas/` — one file per idea (`YYYY-MM-DD-slug.md`), indexed in `.claude/ideas/README.md`
- `CLAUDE.md` at the repo root is the only exception — it is the entry point Claude Code auto-loads.
- `README.md` at the repo root is allowed only as a public-facing project readme (short, points into `.claude/docs/`).

## Authoring

- Prefer editing an existing doc over creating a new one. Fragmentation makes docs rot faster.
- New doc files must be linked from `CLAUDE.md` or from an index doc in `.claude/docs/`.
- Keep docs under 300 lines. If a doc grows past that, split by topic and link.
- Do not create docs as side-effects of feature work unless the user asks — prefer inline comments or commit messages for short-lived context.

## What NOT to create

- Planning/decision/analysis documents unless the user explicitly asks for them.
- Per-feature README files inside source subdirectories.
- Duplicate copies of content already in `CLAUDE.md` or existing `.claude/docs/` files.

## Branch-switch adaptation

When checking out a branch and discovering documentation outside `.claude/` (e.g., a `docs/` folder at repo root, or README files inside modules):

1. Move it into `.claude/docs/<subfolder>/` — preserve the subfolder structure.
2. Before moving a file, check whether `.claude/docs/` already contains the same content (same title, overlapping body). If so, merge into the existing file instead of creating a duplicate.
3. If two files cover the same topic with different content, keep the richer one and fold the other's unique pieces in as a section — never leave two files side-by-side covering the same thing.
4. Update any internal links (`docs/...` → `.claude/docs/...`) and add a pointer in `CLAUDE.md` if the content is top-level.
5. Do this as a dedicated commit (`docs: relocate <area> under .claude/`) — don't bundle it with feature work.
