# F946 notes

## Seams

- `src/integrations/webhook-queue.ts` owns delivery: `queuePing` (disk entry `finish-webhook-queue`, index
  `.limen/outbox/<event-id>`, detached `limen webhook deliver`), `deliverQueued` (lease `finish-webhook-lease`, tries,
  backoff), `resendQueuedPings` (due entries with a dead lease holder), and the sender spawn.
- `src/integrations/finish-webhook.ts` only builds events and claims them: job finish (`finish-webhook-attempt`),
  stall and coordinator events (`mkdir` of the event folder), lead steps (`finish-webhook-attempt` in the step folder).
- Resend callers: `src/main.ts` (every command except `webhook deliver`), `src/commands/sweep.ts`, and
  `hook/wake.ts` `stampSweep` (every 30 s while a coordinator listens).
- `bin/tony-finish-ping.sh` stays one-shot. New: `LIMEN_FINISH_WEBHOOK_SKIP`, exact status code, redacted `body` on
  fd 3 only, `Idempotency-Key` header.
- Tests: `test/s7-webhooks.test.ts` (slow, busy, refused, killed deliverer); `test/plant.ts` sink rows take `delayMs`
  and `upTo`; `LIMEN_WEBHOOK_RETRY_MS=100` in the plant env.

## Open questions

- A coordinator registration is deleted on a normal exit or a resumed session (`coordinator-signal.ts`). A queued
  `coordinator.*` ping inside it is then dropped. Move coordinator event folders out of the registration if this
  matters.
- The finish ping of the alice release-process review (F1040), reported lost at about 13:27 on 16 Oct, has no job
  record on this Mac. The 08:10 stall ping and the 08:46 finish ping of the runtime-tests worker
  (`2026-10-16-f1039-runtime-tests-pass-on-ci-r-ff7a6b2f`) are the matching lost receipts.
- The seat sweep plist (`~/Library/LaunchAgents/limen-sweep.plist`) exists but was not loaded on Adam's Mac on 16 Oct.
  Without it, resends depend on the next `limen` command or a listening coordinator.
