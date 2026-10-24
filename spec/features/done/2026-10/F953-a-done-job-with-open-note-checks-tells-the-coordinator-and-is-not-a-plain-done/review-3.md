FAIL 9609f61e408b9ccf244ea787a866b355801d2ed9

**Blocking — PROVEN: acceptance 2 remains broken.** `src/job/session-commands.ts` counts commands skipped after an early shell exit. For `if true; then exit 0; fi; npm test`, Bash exits 0 without invoking `npm`. Limen nevertheless classifies `npm test` as executed, writes no `open-checks`, and sends a plain `done` wake.

`place()` sees `then`, not `exit`, so `surelyRan()` incorrectly assumes later lists started. Do not count those lists without execution evidence. Add this real-shell regression.

**The falsifying check:** `node --no-warnings /tmp/f953-review-9609f61-falsify.mjs` exited 1. It uses a marker-writing `npm` stub, the recorded transcript, and the real finalizer and wake builder. Evidence: `/tmp/f953-review-9609f61-falsify.txt`.

Checks run:
- HEAD matched the candidate; initial and final working/staged diffs were empty.
- `npm ci`: passed before JavaScript checks; zero vulnerabilities.
- Prior quoted-command and `false && npm test` reproductions: both passed.
- Native `s3-finish-wake`, `s7-webhooks`, `u14-task-note`, `u3-turn-signal`, and `structure` suites: 17 passed, zero failed.
- `npm run typecheck` and Biome on the four changed TypeScript files: passed.
- Prior jobs-display probe: exited 0.

**Non-blocking notes — PROVEN:** Human rows retain `done with 1 open check` rather than the requested phrase. `spec/build.md` still omits the active ticket. These inherited notes were not repaired.

No full `npm run check` was run. Retained logs from other commits are unverified at this HEAD. No candidate files changed. No checks were repeated after the note reminder.

## Note check
- Candidate identity: proven. `/tmp/f953-review-9609f61-identity.txt`.
- Prior findings resolved and all five acceptance bullets hold: not proven. The exact prior cases pass, but the early-exit case still violates acceptance 2.
- Acceptance 1, open item reaches wake: proven. `/tmp/f953-review-9609f61-tests.txt`.
- Acceptance 2, skipped command remains not proven: not proven. `/tmp/f953-review-9609f61-falsify.txt` demonstrates the missing behavior.
- Acceptance 3, unchanged no-open wake: proven. Unchanged path in `src/job/wake-text.ts`; native wake tests passed.
- Acceptance 4, 3,500-line cap: proven. `/tmp/f953-review-9609f61-tests.txt`.
- Acceptance 5, passing independent review before landing: not proven. This review rejects the candidate.
- Bounded re-review: followed. `/tmp/f953-review-9609f61-assessment.md` ties the blocker to the prior execution-evidence finding; settled concerns remain notes.
