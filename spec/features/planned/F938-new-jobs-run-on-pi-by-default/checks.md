# F938 checks · Pi is the default engine (2026-10-23)

Live proof on macOS with pi 1.2.0, Herdr 0.9.5 and the Claude Code bridge package `@vanillagreen/pi-claude-bridge` 4.1.0. The proof plant was a disposable copy made by `bin/limen-group-fixture.mjs` in `/private/tmp/limen-pi-proof-nRbe/plant`, with no finish webhook. Every command ran this branch's `bin/limen`, without `LIMEN_ENGINE` and outside any job environment.

## Jobs

| Route | Command flags | Job | State | `engine` | `limen jobs` model line |
|---|---|---|---|---|---|
| Plain spawn | none | `2026-10-23-plain-spawn-609a6aaa` | done, result `OK` | `pi` | `served openai-codex/gpt-6-astra · requested openai-codex/gpt-6-astra:high` |
| Daily | `--engine pi --provider openai-codex --model gpt-6.1-sol --thinking high` | `2026-10-23-daily-route-89bb43b1` | done, result `OK` | `pi` | `openai-codex/gpt-6.1-sol` |
| Simple and UI | `--engine pi --provider pi-claude --model claude-opus-5-5 --thinking high` | `2026-10-23-opus-route-27d9d3c5` | done, result `OK.` | `pi` | `pi-claude/claude-opus-5-5` |
| Group team | `--team pi:pi-claude/claude-opus-5-5:high --rounds draft --detached` | `2026-10-23-f001-team-1-claude-opus-5-5-draf-572c8c81` | done, committed `src/clamp.ts` | `pi` | `pi-claude/claude-opus-5-5` |

- The plain spawn's mismatch line is display only: the package default model text carries the `:high` suffix, and the session records `modelId gpt-6-astra` with `thinkingLevel high`.
- A real Pi lead (`pi --no-extensions --extension templates/limen-extension.ts`, `LIMEN_COORDINATOR=1`) ran `limen group start`. The group (`84741ff0-7c5f-4e27-a37c-9cc64f9a2415`) recorded route `pi pi-claude/claude-opus-5-5 high` and finished round 1. Result delivery recorded "not delivered" because the print-mode lead had exited.

## Argv

A recording `LIMEN_PI` shim captured what a plain `limen spawn "…"` runs (`2026-10-23-plain-spawn-argv-bb6874c2`, done):

```text
pi --mode json --approve --no-extensions --session-dir <job>/session --name "limen: <label>"
  --append-system-prompt <worker preamble>
  --extension <package>/hook/finish.ts --extension <package>/hook/steering.ts --extension <package>/hook/communication.ts
  --model openai-codex/gpt-6-astra:high @<job>/task.md
```

The Opus route (`2026-10-23-opus-route-argv-adafc197`, done) ends with:

```text
--extension ~/.pi/agent/npm/node_modules/@vanillagreen/pi-claude-bridge --provider pi-claude --model claude-opus-5-5 --thinking high @<job>/task.md
```

## Facts behind the bridge change

- `pi --no-extensions --provider pi-claude --model claude-opus-5-5 -p …` fails with `Unknown provider "pi-claude"`; with `-e <bridge>` it answers `OK`.
- `pi --no-extensions --model pi-claude/claude-opus-5-5 -p …` without a bridge fails with `Model … not found`, so a missing bridge does not substitute another model.
- `pi auth check --provider pi-claude --model claude-opus-5-5` prints `invalid` and exits 2, so a bridged route skips that preflight.
- Pi's bridge catalog has no `claude-haiku-5-5`; Pi warns "Using custom model id". The scout route therefore stays on OMP.

## Native checks

- `npm run check`: type check, Biome and 80 of 80 tests pass; `test/` holds 3,500 of 3,500 lines.
- With `src/runtime/engine.ts` from the base commit `f272b77`, the spawn refusal test fails (its `pi install` row: the old default ran OMP) and the Pi bridge argv test fails; with this branch both pass.
