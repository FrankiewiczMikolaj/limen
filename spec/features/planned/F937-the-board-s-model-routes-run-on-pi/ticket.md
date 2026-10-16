---
touches:
  - limen.runtime.engine
opened: 2026-10-11
---

# F937 · The board's model routes run on Pi

## Outcome

Each model route the board names for a role runs a real Pi worker job end to end on the model it asked for: Sol for ordinary work, Opus for simple and UI work, and the Haiku scout. The scout reaches Claude through the same Claude Code bridge that OMP jobs use. A Pi job that cannot reach its bridge refuses to start instead of running on another model. The board needs this evidence before new jobs can move to Pi without a silent model substitution.

## Scope

- Pi jobs with a `pi-claude/<model>` model load the bridge by path; other extensions stay off. Start where launch argv adds the bridge for OMP only.
- A refusal before any job exists when a Pi job names a `pi-claude/…` model and the bridge is missing.
- One live detached Pi job per board route, at the board's provider, model and reasoning, with the evidence in `checks.md` in this folder.

## Out of scope

- OMP launches: argv, bridge path and behaviour stay as they are.
- The default engine and its wording, which belong to the change that makes new jobs run on Pi (F938).
- Packages, settings or credentials in `~/.pi` or `~/.omp`.
- The scout role's rules, which belong to the Haiku helper pilot (F936).

## Acceptance

- A Pi job with a `pi-claude/…` model has `--extension <bridge path>` in its argv and keeps `--no-extensions`.
- A Pi job with any other model has no bridge extension in its argv.
- With the bridge absent, `limen spawn --engine pi --model pi-claude/<model> …` exits non-zero, names the missing path, and leaves no job directory.
- An OMP job with `--model pi-claude/<model>` still names the OMP bridge with `--extension` and passes no `--provider`.
- For each board route, `checks.md` names a finished detached Pi job by ID whose `engine` file reads `pi`.
- For each of those jobs, `limen jobs <id>` shows a `model` line naming the requested route with no `requested` part.

## Notes

- Decision: Pi loads the existing bridge checkout through the Pi entry it already declares. If that entry does not run on Pi, the job records why and stops; it does not install a second copy.
- Decision: a route that parks on quota is recorded in `checks.md` with its stop reason, and Adam decides whether it counts.
