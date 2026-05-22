# Skills

Project-local invokable workflows. Each skill is a folder with a `SKILL.md` describing the workflow.

## File convention

```
.claude/skills/<skill-name>/
└── SKILL.md
```

`SKILL.md` frontmatter:

```yaml
---
name: <skill-name>
description: <one-line trigger description — used by Claude to decide when to invoke>
argument-hint: [optional-arg]
---

# Body — step-by-step instructions for Claude.
```

Invoke with `/<skill-name>` in the chat.

## When to add a skill

- A workflow is executed more than twice and the steps matter (scaffolding, deploys, code-quality runs).
- You want the workflow to be callable explicitly by name, without re-explaining.

## When NOT to add a skill

- A one-shot script — put it in the repo under `scripts/` instead.
- A pure knowledge document — put it under `.claude/docs/`.
