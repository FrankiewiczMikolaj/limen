---
touches:
  - limen.runtime.engine
  - limen.commands
  - limen.sessions.guidance
opened: 2026-10-11
needs-adam: Does the reason OMP became the default on 2026-09-23 still hold, and should the board's route lines move to Pi with the default?
needs-adam-on: 2026-10-11
---

# F938 · New jobs run on Pi by default

## Outcome

A job started with no engine named runs on Pi. The shop manual and setup guides say so, instead of "new jobs use OMP … Pi … only when required". An explicit `--engine` or `LIMEN_ENGINE` still wins, a continuation keeps its parent's engine, and an old record with no engine still reads as Pi, so no running or recorded job changes engine. The advice for starting a Herdr coordinator follows the board's engine choice instead of preferring OMP.

## Scope

- The engine a new job gets when neither `--engine` nor `LIMEN_ENGINE` is set. Start where spawn resolves the engine.
- Shipped prose that names the fallback or ranks the engines: shop manual, setup guide, seat guide, and the hint when an engine is not on PATH.
- The shop manual's coordinator advice names the board's engine, not OMP.
- Tests that rely on the OMP fallback by leaving out `--engine` either name their engine or expect Pi; they are rewritten, not added to.

## Out of scope

- OMP itself: its flags, its view of old Pi skills, and its Claude bridge.
- Editing the board. On landing the coordinator rewrites the standing-engine line; the route lines follow Adam's answer.
- Removing OMP, installing Herdr integrations, or touching either engine's auth.

## Acceptance

- With no `--engine` and no `LIMEN_ENGINE`, a new job's `engine` file reads `pi`.
- `--engine omp` gives a job whose `engine` file reads `omp`.
- `LIMEN_ENGINE=omp` with no `--engine` gives a job whose `engine` file reads `omp`.
- `limen continue` on an OMP parent without `--engine` starts a child whose `engine` file reads `omp`.
- A job record with no `engine` file still shows and continues as Pi.
- `grep -rniE "new jobs (use|run) OMP|preferably OMP|only when (required|the task needs)|Pi when required|OMP, for new jobs" templates docs README.md src` prints nothing.

## Notes

- This waits until each of the board's model routes has run a recorded Pi job (F937); moving the default first could swap a model without anyone seeing it.
