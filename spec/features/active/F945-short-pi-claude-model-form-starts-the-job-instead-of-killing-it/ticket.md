---
touches: limen.runtime.engine, limen.commands
opened: 2026-10-13
---

# F945 · Short pi-claude model form starts the job instead of killing it

## Outcome

An OMP job started with `--provider pi-claude --model claude-opus-5-5` runs on the local Claude bridge, the same as
`--model pi-claude/claude-opus-5-5`. Today it dies within seconds on OMP's `Unknown provider "pi-claude"`: the bridge
loads only for a `pi-claude/` model id, and `--provider pi-claude` reaches OMP. A pair that OMP still cannot resolve is
refused at the command with the correct form, before any job exists. Instructions and docs show one form.

## Scope

- One launch rule for every OMP job: spawn, group members, workers, coordinators and continuations. The seam is the
  argv builder in the engine runtime.
- One refusal before launch for a `pi-claude` provider with a model it cannot serve, or a missing bridge.
- Docs, board and active group instructions name Opus as `pi-claude/claude-opus-5-5`, never `anthropic/…`.

## Out of scope

- Pi jobs: Pi loads a Claude bridge only through an explicit `--extension`.
- Checking a model against the bridge catalog; the Haiku helper study (F936) owns silent model substitution.
- Other providers paired with a `pi-claude/` model.
- Historical records of what a past job ran.

## Acceptance

- `--provider pi-claude --model claude-opus-5-5` on OMP gives the same engine argv as `--model pi-claude/claude-opus-5-5`.
- `limen spawn --engine omp --provider pi-claude --model anthropic/claude-opus-5-5 work` exits 1 with a one-line error
  that shows `--model pi-claude/claude-opus-5-5`, and leaves no job, worktree or branch.
- A live OMP job on the short form and one on the long form both get past start-up.
- No doc, template or active instruction shows `anthropic/claude-opus-5-5` or the bare `claude-opus-5-5` model.
