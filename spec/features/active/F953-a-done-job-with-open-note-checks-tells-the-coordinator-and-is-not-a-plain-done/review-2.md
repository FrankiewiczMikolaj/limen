FAIL 3dc40e97eb2460b262203b80a8f0830e8fadd467

**Blocking — PROVEN: acceptance 2 remains broken.** The quoted-command case is fixed, but `src/job/task-note.ts:264` counts skipped conditional branches as executed. After `false && npm test`, the real shell never invoked `npm`. The finalizer nevertheless accepted a proven claim citing `npm test`, wrote no `open-checks`, and built a plain `done` wake.

Do not count skipped branches as executed without execution evidence. Add this regression.

**Falsifying check:** `node --no-warnings /tmp/f953-rereview-3dc40e9-skipped-command.mjs` exited 1. Evidence: `/tmp/f953-rereview-3dc40e9-skipped-command.txt`.

Checks run:
- HEAD matched the candidate; working and staged diffs were empty.
- `npm ci`: passed before JavaScript checks; zero vulnerabilities.
- Prior quoted-command reproduction and display probe: passed.
- Native `s3-finish-wake`, `s7-webhooks`, `u14-task-note`, `u3-turn-signal`, and `structure` suites: 17 passed, zero failed.
- `npm run typecheck` and Biome on six changed TypeScript files: passed.
- Source discovery timed out after 240 seconds; direct reads supplied context.

No full `npm run check` was run. No candidate files changed. No checks were repeated after the note-check reminder.

## Note check

- Candidate identity: proven. `/tmp/f953-rereview-3dc40e9-identity.txt` records the matching HEAD and clean tree.
- Prior blocking findings resolved: not proven. The exact quoted-command case passes, but skipped-command evidence still breaks acceptance 2.
- Verdict covers all five acceptance bullets: proven. `/tmp/f953-rereview-3dc40e9-assessment.md` maps each bullet to evidence or its remaining gap.
- Candidate delta meets the ticket: not proven. Acceptance 2 still needs a fix.
- Acceptance 1, one-line open item reaches the wake: proven. The fake-finish scenario passed in `/tmp/f953-rereview-3dc40e9-tests.txt`.
- Acceptance 2, an unexecuted command remains not proven: not proven. `/tmp/f953-rereview-3dc40e9-skipped-command.txt` demonstrates the violation.
- Acceptance 3, unchanged plain-done wake: proven. The no-open path in `src/job/wake-text.ts` is unchanged; native wake and turn checks passed in `/tmp/f953-rereview-3dc40e9-tests.txt`.
- Acceptance 4, 3,500-line test cap: proven. The structure assertion passed in `/tmp/f953-rereview-3dc40e9-tests.txt`.
- Acceptance 5, passing independent review before landing: not proven. This review rejects the candidate; no landing occurred.
- Bounded re-review rule: followed. `/tmp/f953-rereview-3dc40e9-assessment.md` ties the blocker to the prior command-never-ran finding and the replacement parser. Settled display and board findings remain notes.
