# Workflow Rules

## Feature Development

1. Create a feature branch: `git checkout -b feature/<name>` — don't commit large changes directly to `main`.
2. Implement the change end-to-end (code + tests + docs if user-facing behaviour changed).
3. Run the project's verification commands (tests, type check, lint) before committing.
4. Commit with an imperative-mood message that explains the **why**, not the **what** (the diff already shows the what).
5. Push and open a PR when ready for review.

## Agent Usage

- Use sub-agents (`.claude/agents/`) for parallelizable work — multiple independent features or large searches.
- One agent per task when tasks don't share files. Read shared files yourself first and pass exact context in the prompt.
- Always verify agent output before moving on. Agent summaries describe intent, not outcome.

## Testing

- Run the project's test suite before committing anything non-trivial.
- When adding behaviour, add a test that would fail without your change.
- When fixing a bug, add a regression test first (red → green → commit).

## Commit Hygiene

- Separate unrelated changes into separate commits — don't bundle refactors with feature work.
- Never `--no-verify` a commit unless the user explicitly asks.
- Doc relocation (see `documentation.md` branch-switch rule) goes in its own commit: `docs: relocate <area> under .claude/`.
