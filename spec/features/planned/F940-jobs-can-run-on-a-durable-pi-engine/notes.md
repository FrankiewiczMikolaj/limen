# F940 notes

Map for the worker. Limen at `b1c34b7`; pi-durable at `~/tmp/pi` `8a9c051f8` (`@earendil-works/pi-durable` 1.1.0). The spike's notes (F939) override anything here.

## Seams in Limen

- Engine table: `src/runtime/engine.ts:7` (`EngineId`), `:32` (`ENGINES`), `:62-67` (`resolveSpawnEngine`, error text names only pi/omp), `:72` (`jobProfile`, missing `engine` file = pi), `:79` (`preflightEngine` checks `binaryDefault` on PATH), `:200` (`argvFor`). Profile flags `projectTrust`/`toolYolo`/`sessionName`/`noTitle` pick `--approve`, `--auto-approve`, `--name`, `--no-title`; the adapter must accept or ignore whichever row it gets.
- Wrapper: `src/runtime/wrapper.ts:117` passes `hook/steering.ts` and `hook/communication.ts` as `--extension`; `:125` continuation passes `--continue` followed by the task file's trimmed text (`src/runtime/engine.ts:248-249`), not a file path; `:170` spawns the engine in the wrapper's process group; `:297` logs `<engine> exited 0`.
- Parser contract (Adam 2026-09-22, "one unchanged parser"): `src/runtime/stream.ts:42` reads `tool_execution_start` `toolName` + `args`; `:49` reads `message_end` `message.role/content/stopReason/errorMessage`; `:59` treats `agent_start/turn_start/message_start/message_update` as think.
- Transcript readers that glob `session/*.jsonl` and expect Pi entries (`type: "message"`, `message.role`, `usage`, `timestamp`): `src/job/usage.ts:20`, `src/commands/continue.ts:314-318` (newest by name), `src/commands/keeper.ts:201-212`, `src/runtime/supervisor.ts:515` (hosted only).
- Continuation copies one file: `src/job/publication.ts:121-123`. Engine lock: `src/commands/continue.ts:319-323`. Hosted refusal text: `src/commands/continue.ts:175`, spawn `src/commands/spawn.ts:239`.
- `--extension` is already refused for non-Pi engines: `src/runtime/worker-extensions.ts:12`.
- `versions` file: `src/commands/spawn.ts:801` probes `<binary> --version` and writes `<engine id> <version>`.
- `limen jobs` prints the engine line only when it is not `pi`: `src/commands/jobs.ts:446`; usage from `:365`.
- Stop and limits: `src/commands/stop.ts:56-66` TERMs the process group, then KILL after 5 s; wrapper `STOP_GRACE_MS` 5 s at `src/runtime/wrapper.ts:18`.
- Steering inbox and claims: `hook/steering.ts:106-139`; delivery is `pi.sendUserMessage(text, { deliverAs: "steer" })` at `:129`. Inbox names are integers.
- Project guidance: `hook/communication.ts:43` (`before_agent_start`: system prompt plus a per-turn cue), `:64` (`message_end`), `:74` (`tool_result` reminders).

## pi-durable facts that shape the adapter

- `message_end` carries `entry: EntryRecord`, not `message` (`docs/spec.md:4474`). The adapter has to reshape events for the unchanged parser.
- JSONL storage writes `main.jsonl`, `doc-<id>.jsonl`, `task-<id>.jsonl` into one directory (`docs/spec.md:4985`). Put it in a subdirectory of `session/`, or the readers above pick up store files as transcripts.
- One process owns a storage, with no cross-process lock (`README.md:641`). JSONL keeps the whole history in memory, and the README says to use SQLite for long-running agents (`README.md:638`).
- Same `requestId` returns the existing submission (`README.md:116`); `whenBusy: "steer"` places a steer after the current tool round.
- `root.abort(context)` withdraws queued inputs and aborts current work (`README.md:512`).
- Dependencies: `@earendil-works/pi-ai`, `@earendil-works/chord`, `typebox`, `@silvia-odwyer/photon`, `diff` (`package.json:132-138`).
- `capturedVersions` keeps only the first line of `--version` (`src/commands/spawn.ts:795-798`), so the adapter prints both versions on one line. The package is marked experimental and its API can change without notice (`README.md:3`).
- Built-in coding tools declare no `replay`, so every tool defaults to `unsafe` (`src/harness/tool.ts:163`).
- pi-durable's `CodingTools` bash does not export `PI_SESSION_ID`, but coding-agent's bash does (`coding-agent/src/core/tools/bash.ts:201`). Limen code that reads it: `currentNotificationSession` (`src/commands/spawn.ts:830`, the wake subscription of a nested spawn), `markCallerDelivered` (`src/commands/stop.ts:83`), `leadSession` (`src/job/group-cabinet.ts:186`), and the wake-route check in `src/commands/watch.ts:51`. A durable worker's commands therefore act like an OMP worker's: no session route. The wrapper also strips `HERDR_*` (`src/runtime/wrapper.ts:140-145`), so a nested spawn has no wake route either. That is acceptable for detached workers with groups out of scope. Matters again for the durable coordinator (F942).
- Open: should the adapter export the conversation ID as `PI_SESSION_ID` to bash? It must match `SESSION_ID` (`src/job/job.ts:28`), and that turns on wake subscriptions to a session that has no wake hook. Leaving it unset is the safer default here.

## Open questions

- Will the adapter load Limen's `hook/*.ts` through a small shim of Pi's `pi.on` / `sendUserMessage`, or reimplement steering and guidance? A shim keeps one copy, but `sendUserMessage` has no request ID.
- Should the per-turn cue and the `tool_result` reminders from `hook/communication.ts` carry over, or only the system-prompt guidance?
- Auth and model registry: does the adapter reuse Pi's auth store (as `coding-agent/src/experimental/durable/harness-setup.ts` does) or need its own?
