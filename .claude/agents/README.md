# Agents

Project-specific sub-agent definitions. Each agent is a `.md` file with YAML frontmatter describing when and how Claude should spawn it via the `Agent` tool.

## File convention

```yaml
---
name: <agent-name>
description: <one-line trigger description — used by Claude to decide when to spawn>
tools: [Read, Write, Edit, Bash, Grep, Glob]   # or * for all
---

# Body — instructions for the agent itself.
```

## When to add an agent

- A repeatable task shows up often enough that spawning a focused sub-agent would be cheaper than doing it in-context.
- Parallelisable work — e.g., scaffolding two independent features at once.
- A task that benefits from a narrow tool set or a specialised prompt.

## When NOT to add an agent

- One-off tasks. Just do them inline.
- Anything that needs to stay in the main conversation context (design decisions, ambiguous requirements).
