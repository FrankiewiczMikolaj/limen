# F942 notes

Pinned Pi revision read: `8a9c051f8` (`~/tmp/pi`).

## Seams in Limen

- Wake injection: `hook/wake.ts:343` `injectWake`. The first idle inject in a sweep is a turn; later injects, and any inject while busy, are `followUp`. The confirmation flags (`accepted`, `entered`, `answered`, `errored`, `settled`) come from `message_start` content matching (`hook/wake.ts:809`), `message_end`, and `agent_settled` (`hook/wake.ts:846`). On a durable conversation, `submission.wait()` → `done` / `unanswered` replaces all of them.
- Receipts: `src/job/wake-delivery.ts:42` `claimDelivery`, `:199` `confirmClaim` (claim dir is renamed to `notify/delivered/<slot>`), `:18` `WAKE_ATTEMPTS = 2`, `:17` `CLAIM_STALE_MS`. The `requestId` is job id + slot (`<session>`, `_fallback`, `_advisory.*`, `_uncertainty.*`) + attempt number. A crash retry reuses it; a counted attempt gets a new one, because a same-key retry returns the already-settled submission and could never count as a second attempt. Keep this as the only receipt store.
- Steering: `hook/steering.ts:66` runs only under `LIMEN_JOB=1`. `src/commands/steer.ts:42-45` requires a live job pid and `steer/ready`. The shop manual says the coordinator "is not a limen job" (`templates/agents.md:7`). No coordinator steer route exists today.
- Wake routing at spawn: `src/commands/spawn.ts:830` `currentNotificationSession` reads `PI_SESSION_ID`. `:841` `herdrWakePane` falls back to the Herdr pane when that is missing. Pi's coding-agent bash exports it (`packages/coding-agent/src/core/tools/bash.ts:201`); pi-durable's `CodingTools` bash does not. Without an exported session, a durable coordinator in Herdr gets the screen-observed Herdr route (`src/integrations/coordinator-wake.ts:46`, `--until working`). Outside Herdr it gets no wake. The ticket closes this: either the durable session exports `PI_SESSION_ID` to its bash (upstream), or the Limen facet provides it.
- Footer, Herdr metadata and tab tail, and `coordinatorSignals` (`src/integrations/coordinator-signal.ts`) depend on Pi hook events and `ui.setStatus`. Under a durable session they go dark unless the extension point carries them. Out of scope here, but the gap will be visible.

## Upstream gate (what exists at 8a9c051f8)

- Durable TUI: `coding-agent/src/experimental/durable/main.ts` accepts only `--continue`. Its registry is `CodingTools` + prompt + `Subagent` (`runtime.ts:139-141`). Its submit passes no `requestId` (`runtime.ts:257-258`). The README says it loads no extensions. The session lock is held by one process (`sessions.ts`), so Limen cannot submit while the TUI is down.
- `pi experimental server`: per-session worker owns the Harness (`session-worker.ts:784`). Plugin packages contribute a `session` facet (`services/README.md:32`) that can consume `AgentController`. `AgentController.steer/followUp/prompt` submit **without** `requestId` (`services/agent-controller-provider.ts:25,35`), and Harness/Conversation are not exposed to facets. Smallest upstream ask: `requestId` on `AgentController` and access to the submission's settlement (`waitForPrompt` exists only for `prompt`). With that, the coordinator conversation can live on the seat and Herdr/laptop act as presentations ("a tab is not the job").
- pi-durable: `requestId` dedupes per conversation before any write (`packages/durable/docs/spec.md` §6). Target the root conversation, never a subagent the TUI is showing. Idle input with `whenBusy: "followUp"` starts a run, so the first-idle-is-a-turn rule falls out of the engine.

## Open questions

- Coordinator steering is out of scope. If it is ever wanted it is its own ticket: `limen steer` reaches only jobs (`src/commands/steer.ts:42-45`), and the server already accepts owner input typed from another presentation.
- Under the server, does a submission to a session with no attached client and no live task start the worker on demand, or does Limen have to wait for a client?
- Does an `unanswered: aborted` (Adam pressed Esc) count toward the two-attempt ops lock, as an aborted stop does today?
- Where does the Limen-side facet live? It pulls in Chord/TypeBox, so it cannot be in `src/`. It should share the location decided for the durable engine adapter.
