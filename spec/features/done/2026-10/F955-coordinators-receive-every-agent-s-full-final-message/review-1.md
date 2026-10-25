FAIL 7b2b4e2cbaf53910c405fb7923013f1029e62a56

HEAD still matches the candidate. The worktree is clean. This completes the interrupted review. No tests were repeated in the continuation.

## Blocking findings

1. **PROVEN — Herdr cannot deliver oversized reports.** `src/integrations/coordinator-wake.ts:135` and `src/commands/group-rounds.ts:246` pass the report as one command argument. On the clean candidate, a 1,100 KiB wake produced two unsent `E2BIG` attempts. A group result of 1,215,032 characters likewise failed both delivery attempts, although its saved result was complete. This breaks acceptance 2 and the Herdr group delivery requirement in acceptance 3. A failure receipt is not full-message delivery. Use a size-safe transport or obtain an explicit acceptance change. Evidence: `argv-boundaries.txt` in the evidence folder below.

2. **PROVEN — The instructed manual webhook retry omits the report.** The sender reads the report only from the queue or `LIMEN_FINISH_MESSAGE_FILE` (`bin/tony-finish-ping.sh:141–155`). Recovery instructions in `src/integrations/webhook-queue.ts:27` and `templates/worker.md:38` omit that file setting. Following those instructions sent only the generic handoff. Adding the file setting preserved the complete report. This breaks acceptance 2. Update the emitted recovery instructions and cover that call. Evidence: `manual-retry.txt`; the real sender used a local fetch replacement, not a live webhook.

## Unverified checks and notes

- **UNVERIFIED, non-blocking — No passing full local check at this candidate.** The retained attempts show 73 pass / 6 fail / 2 cancelled and 67 pass / 12 fail / 2 cancelled. The third attempt was stopped. The earlier 81-test green result belongs to `a6908cf`, not this candidate.
- **PLAUSIBLE — Host load contributed to those failures.** High load, timeouts and stalled fake-Herdr starts are recorded. They do not prove that load caused every failure.
- **PROVEN, process note — Implementation route drift.** The transcript contains 100 Astra assistant records instead of the prescribed Opus implementation route.
- **PROVEN — Accepted F953 semantics remain unchanged.** Its proof-code and hook boundary diff is empty. Existing open-check assertions remain and passed. Its review was not reopened.

## Actual checks

The original review ran `npm ci` successfully, then `npm run typecheck` and Biome successfully. The scoped native run passed 12 tests with no failures or cancellations. It covered completion, Herdr, webhook/wait, groups, claims, template history and the test cap. The real-hook route probe passed all eight subscribed/fallback done, failed, stopped and scout cases, plus absent-result, bounded-commit and throwing-toast checks. The two argument-limit probes and manual retry probe exited 0 and reproduced the delivery failures above. `git diff --check` and the F953 boundary check exited 0. `test/` contains 3,500 lines.

No new full `npm run check`, live webhook, implementation edit, landing, push or additional reviewer was performed. This continuation only read retained evidence, rechecked identity and status, and wrote job notes.

Evidence folder: `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-final-messages-review-828d1b32/artifacts/`. Its `review-evidence.md` contains the exact commands and acceptance mapping.

## Note check

- Pinned clean HEAD: proven. `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-message-review-handoff-68fda64e/artifacts/handoff-identity.txt` records the exact candidate and empty status.
- Evidence-based verdict: proven. `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-final-messages-review-828d1b32/artifacts/review-evidence.md` maps all six acceptance items and separates failures from missing proof.
- Finalization handoff assessment: proven. `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-final-messages-review-828d1b32/artifacts/review-evidence.md` records the supplied handoff, failed/stopped lanes, evidence limits and independent reproductions.
- Complete review handoff: proven. `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-final-messages-review-828d1b32/artifacts/review-evidence.md` supports the candidate, findings, actual checks and missing full-check proof stated above.
- Acceptance 1, reports beyond both old cut limits: proven. `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-final-messages-review-828d1b32/artifacts/wake-route-proof.txt` confirms complete reports and trailing Note checks for all eight route/state/role cases.
- Acceptance 2, every delivery route carries the report: not proven. The argument-limit and manual-retry reproductions prove delivery gaps; both blocking findings above must be resolved or explicitly accepted.
- Acceptance 3, whole wait and group completion messages: not proven. Wait and live-hook group delivery passed, but the oversized Herdr group fallback did not deliver its report.
- Acceptance 4, report-first role prompts: proven. `templates/worker.md`, `templates/reviewer.md`, `templates/scout.md` and `templates/group-member.md` contain the replacement contracts; the retained review records their inspection.
- Acceptance 5, existing semantics and F953 boundary: proven. `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-final-messages-review-828d1b32/artifacts/review-evidence.md` records the empty proof-code/hook diff, retained assertions, routing and receipt checks.
- Acceptance 6, regression, cap, local check and independent review: not proven. The regression, 3,500-line cap and requested independent review are complete. A passing full local check at this exact candidate is still missing.
- Easy-to-miss rule: followed. `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-final-messages-review-828d1b32/artifacts/review-evidence.md` records the preserved F953 boundary. The continuation tool history and `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f955-full-message-review-handoff-68fda64e/artifacts/handoff-identity.txt` show retained-evidence reads and identity checks, with no repeated investigation, test lane, candidate edit, landing, push or new reviewer.
