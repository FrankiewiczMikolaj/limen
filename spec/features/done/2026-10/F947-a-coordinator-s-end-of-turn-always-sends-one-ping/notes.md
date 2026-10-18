# F947 notes

## Seams

- Turn end: `hook/wake.ts` calls `coordinator.settled()` on Pi's `agent_settled` and on OMP's `agent_end` when the
  event has a `willContinue` key whose value is not `true`. Pi's `agent_end` has no such key, so Pi counts only once.
- Debounce: `src/integrations/coordinator-signal.ts` `coordinatorSignals`: an assistant `message_end` opens the turn
  (`turnOpen`), the first `settled()` closes it. The old `last-signal` file is gone; leftover copies are ignored.
- Ping text: `turnSignal` adds `; last message: <first line>` (Markdown markers stripped, 200 characters). The title
  gets ` · F123` from the first feature id in a final assistant message; it sticks until another id appears.
- Ping folders: `.limen/coordinator-events/<session>/<kind>.<claim>/`. The exit claim is `coordinator.exited.<pid>`.
  The sweep now removes every dead registration, after it queues the exit ping when the exit was not normal.
- Finish: `hook/finish.ts`, loaded by `src/runtime/wrapper.ts` (detached) and `src/runtime/supervisor.ts` (hosted).
  It writes `result` and `session-ended`, then `ctx.shutdown()`. In print mode both engines finish the turn, then
  exit 0. The wrapper writes the last assistant text to `result` only when `result` is still empty.
- Key refusal: `src/integrations/webhook-queue.ts` `noteKeyRefusal` runs when a queued ping settles. A 401 or 403
  receipt writes `.limen/webhook-rejected` (target, event, time, receipt folder); a ping that every target accepts
  removes it. `src/commands/status.ts` prints it after the plant line; `limen webhook test` removes it on exit 0.
  The test ping does not write it: the operator reads that refusal on the terminal.

## Checks

- `test/s7-webhooks.test.ts` last test: two turns, a repeated end, a normal exit and the sweep give exactly two
  pings; it fails on the old code (no ping for a turn with nothing open).
- `test/s3-finish-wake.test.ts` first test: a detached job's result is its `finish` handoff; it fails without the
  hook (`fake engine done`).
- Live proof: `.limen/jobs/2026-10-16-coordinator-end-of-turn-ping-1acbb879/evidence/proof.md` in the limen checkout.
- `test/s7-webhooks.test.ts`: the refusing target now answers 401; `limen status` names it, and the next test's
  accepted ping clears it. Each half fails when its line in `noteKeyRefusal` is removed.
- 17 Oct regression probe (OMP fresh and `--resume`, Pi, Herdr pane, local receiver):
  `.limen/jobs/2026-10-17-coordinator-turn-end-ping-regres-094d39c1/evidence/` in the limen checkout.

## Open questions

- Wake delivery confirmation in `hook/wake.ts` (`pending.settled`, `confirmDeliveries`) and the hosted pane label in
  `hook/hosted.ts` still listen only to `agent_settled`, which OMP never emits. OMP coordinators in Herdr get wakes
  through the Herdr route, so this was left alone.
- Coordinator ping folders are never pruned. They are small, like job receipts.
- A registration from before this change with `events/coordinator.exited` is swept again and sends one more
  `coordinator.exited`. None existed on Adam's Mac on 16 Oct.
- [INFERENCE] OMP runs each subagent in its own session, so a subagent's `agent_end` does not reach the
  coordinator's hook instance and cannot end its turn early. Not proven live; the live proof used no subagent.
