# F938 notes · seams and open questions

## Seams

- `src/runtime/engine.ts` `resolveSpawnEngine`: `|| "omp"` is the fallback. `jobProfile` (records without an `engine` file are Pi) and `src/commands/continue.ts` `readParentJob` (parent engine, refuses a different `--engine`) already do what the ticket asks. Keep them as they are.
- `src/runtime/engine.ts` `preflightEngine` names the other engine when a binary is missing. Recheck that hint once Pi is the default.
- Prose the acceptance grep catches today (six lines): `templates/agents.md` lines 7, 17, 89 and 91; `docs/setup.md` line 107 (the priority list at 103–112); `docs/seat/README.md` line 23. `README.md` ("Pi or OMP") and the CLI help in `src/main.ts` (`--engine <engine>`) do not name a fallback today. They need no change unless the worker adds one.
- `docs/setup.md` lines 27–30 install the Herdr integration only for OMP, and line 58 says only an OMP coordinator needs a hook stub. Make the guide cover Pi coordinators equally.
- A change to `templates/agents.md` needs its shipped history: `test/structure.test.ts` checks that `templates/.history/agents.md` starts with the hash of the current template.
- Tests that spawn without `--engine` run as OMP today without saying so, for example the detached job test in `test/s1-spawn.test.ts`. `test/plant.ts` links one fake engine as both `pi` and `omp`, so most of these tests keep passing. Any assertion on argv flags (`--approve`, `--name`, `--auto-approve`, `--no-title`) will move. `test/` holds 3,277 lines against a 3,500 cap.
- The local map (`.limen/picture/nodes/limen.runtime.engine.md`, gitignored) says "New jobs default to OMP". After landing, the keeper or the picture tick updates it. Do not commit it.

## Behaviour that moves with the default

- Hosted ownership binding runs only for hosted Pi on Linux (`src/runtime/hosted-binding.ts` `hostedBindingSupported`). On a Linux seat, default hosted jobs move onto that path, so the seat's live jobs are the place to watch.
- Pi finds `.agents/skills` and `.pi/skills` itself once the project is trusted (`--approve`, which Pi jobs already get). Skills kept only in `.omp/skills` do not reach Pi jobs. The OMP-only skill view (`prepareSkillConfig`) stays as it is.
- Wake routing: a Pi coordinator exports `PI_SESSION_ID`, so wakes go through the session subscription, not `origin-pane` (`src/commands/spawn.ts` `herdrWakePane`).

## Open for Adam

- The repository records the 2026-09-23 OMP decision but not its reason. Commit `99fea35` ("fix: default new worker and reviewer jobs to OMP") and its board and shop-manual edits state the choice without a why. A possible lead, not a finding: that morning `1a3e1e7` routed UI work through `pi-claude/claude-opus-5-5`, which loaded only on OMP; 25 minutes later `506ccc2` moved Opus to `anthropic/claude-opus-5-5` "on OMP". Today only the Haiku scout still needs the bridge, which the routes ticket (F937) brings to Pi. Both halves (reason, and whether the board's "on OMP" route lines move) are the ticket's `needs-adam` ask.
