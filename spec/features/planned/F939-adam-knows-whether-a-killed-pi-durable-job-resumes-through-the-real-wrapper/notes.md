# F939 notes: starting map

This is the starting map, written from a code read before the spike. It is not the deliverable. The spike worker replaces it with the answers and evidence the ticket asks for. Line numbers are at Limen `b1c34b7` and Pi `8a9c051f8`.

## Questions the deliverable answers

- How each argument Limen passes maps to the adapter, and which have no equivalent.
- Does Limen's event parser read the adapter's output unchanged? pi-durable emits `run_start`, not `agent_start`, and its `message_end` carries a transcript entry, not a message (see Limen seams).
- Which exit codes and stop reasons leave job finalization unchanged, including an aborted partial written by recovery.
- How steering and the appended preamble work without Pi's extension API.
- JSONL or SQLite, judged by inspectability, continuation and keeper transcripts.
- Where the adapter lives: a separate package beside the engines, or a headless durable mode upstream in Pi, and the tradeoff.
- Experimental-API risks, and keeping one writer when a dead wrapper leaves its engine running.
- The wrapper's `log` never records tool results (`tool_execution_end` maps to `wait`), so evidence of the interrupted result comes from the store's transcript, not the log.

## Inputs

- Pi clone `~/tmp/pi` at `8a9c051f80090895abbc64262bc90d95b42103c4`. It has no `node_modules`, so install it, or pin a separate checkout, before running anything.
- `@earendil-works/pi-durable` 1.1.0 is in the clone and on npm. Node `>=22.19.0`.
- Installed `pi` 1.1.0 ships neither pi-durable nor the experimental durable runtime: its package `files` excludes `dist/experimental`. The published coding-agent package exports `ModelRuntime`, `SettingsManager`, `resolveCliModel`, `loadSkills` and `loadProjectContextFiles`. It does not export `buildSystemPromptSections` or the HTTP dispatcher setup.

## Limen seams

- `src/runtime/engine.ts:200` `argvFor`. A detached Pi job gets `--mode json --approve --no-extensions --session-dir <job>/session --name "limen: <label>" --append-system-prompt <preamble text>`. Then come `--extension` for `hook/steering.ts`, `hook/communication.ts`, the group peer and worker extensions, then `--provider/--model/--thinking`, and last `@<task file>` or `--continue <follow-up text>`.
- `--continue` is a boolean in Pi (`coding-agent/src/cli/args.ts:111`). The text after it is a plain positional message (`args.ts:266`), not a file. The wrapper reads it from the task file (`wrapper.ts:126`).
- `src/runtime/engine.ts:69` `engineBinary` honours `LIMEN_PI`. Pointing it at the adapter drives the real wrapper with Pi's exact arguments and no `src/` edit, but the record's `engine` then says `pi`.
- `src/runtime/stream.ts:37` `interpret`. `tool_execution_start` reads `toolName` and `args`, which pi-durable also sends. `message_end` reads `event.message`. pi-durable sends `event.entry`, whose `model[0]` is the message, so unchanged parsing records no assistant text and no `result`. `run_start` is ignored, which is harmless.
- `src/runtime/wrapper.ts:288-299`. An engine ending by SIGKILL or SIGTERM gives `stopped: process group interrupted`. Exit 0 gives `done` with the last assistant text as `result`, unless the last stop reason is `error` or `aborted` (`src/job/record.ts:30`). Any other exit gives `failed`.
- `src/runtime/wrapper.ts:189` writes `state` = `running` on every start. `finalizeJob` (`record.ts:35`) returns early only once the state is terminal. Relaunching the wrapper with the same environment therefore reopens the same record.
- `finalizeJob` wakes the coordinator and the finish webhook. Check where the experiment's wakes route before killing anything.
- `src/runtime/reap.ts:123`. After a wrapper dies, the reaper finalizes `failed: process group gone` after its confirm window. It never stops the orphaned engine.
- `src/commands/continue.ts:314` and `src/job/publication.ts:123`. Continuation copies only the newest `*.jsonl` in `<job>/session`. A pi-durable JSONL store is a directory: `main.jsonl` plus `doc-N.jsonl` and `task-N.jsonl` sidecars (`durable/src/storage/jsonl/storage.ts:30,101`). A SQLite store has no `.jsonl`, so continue refuses it. Keeper packets also pick the newest `.jsonl`.
- `hook/steering.ts:107-132`. Steers use a file inbox (`steer/inbox`, `claims`, `delivered`) and then `sendUserMessage(text, { deliverAs: "steer" })`. A candidate equivalent is `submit({ whenBusy: "steer", requestId: <file name> })`.
- `hook/communication.ts:43`. It adds context on `before_agent_start`. It also observes `message_end` and `tool_result`. List what an adapter would lose.

## pi-durable seams

- `src/harness/tool.ts:163` commits intent before `execute()`. In `tool.ts:169-185`, recovery reruns a call only when both the stored and the current `replay` are `safe`. Otherwise the result is `Tool <name> was interrupted and may have partially run`. The built-in tools declare no `replay`, so `bash` is unsafe.
- `docs/spec.md:632` and `:1898`. Open turns `running` tasks back to `pending`. `resume()`, or any submit or wait, starts the scheduler.
- `docs/spec.md:3837`. A partial left by a killed model stream becomes an aborted assistant entry before the retry. Its `message_end` has stop reason `aborted`, which the wrapper treats as a failure if it is the last one seen.
- `src/harness/events.ts:166` `watchEvents`. The first event is a `snapshot`, and nothing earlier is replayed. A reopened stream therefore shows the interrupted call's end but not its start.
- README "Storage" says one process owns a storage at a time, with no lock. Pi's runtime adds its own lock (`coding-agent/src/experimental/durable/sessions.ts:48`).
- `test/examples/19-json.ts` is a JSON-mode skeleton with a faux model and a choice of storage. `17-coding-tools.ts` is a tool turn on JSONL. `13-recovery.ts` shows close and reopen.

## Pi's durable runtime to reuse

- `harness-setup.ts` has `configureHarnessHttp`, `createHarnessSettings`, `createCodingRegistry` and `ExecutionEnvs`. `findInitialAgentModel` takes an optional `{ provider, model }`, which `main.ts` never passes.
- `runtime.ts:147` passes `ModelRuntime.create()` straight in as the Harness `models`. `SettingsManager.create(cwd)` supplies the settings.
- `prompt.ts` is Pi's system prompt as a pi-durable extension. The Limen preamble could be one more section or the conversation's `instructions`.

## Experiment leads

1. Run `19-json.ts --storage jsonl` with the faux model and read the raw stream.
2. In the adapter, parse Pi's arguments and open storage under the session directory. Configure the root agent from the flags. Submit the task with a `requestId` derived from the job, then map events and exit by how the submission settles.
3. To kill the engine, have the faux model call `bash` with `sleep 30; echo done`. Send `kill -9` to the adapter while `activity` reads `tool`, then relaunch.
4. To kill the wrapper, send `kill -9` to the wrapper. Watch the orphan's stdout (EPIPE?), its process group and the reaper. Reopen only once one writer remains.
5. Repeat step 3 on one real board route.

## Open questions

- What does a reopen mean in practice? Relaunching the wrapper on the same job is what automatic recovery (F941) would do. `limen continue` creates a new linked job instead.
- Should a stop (TERM) close the Harness, so the work can resume, or abort the conversation, which ends it?
