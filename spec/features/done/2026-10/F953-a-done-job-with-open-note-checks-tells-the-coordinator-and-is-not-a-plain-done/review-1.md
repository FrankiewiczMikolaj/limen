FAIL c975f2e5fa1a03e8e19a2916fc6884d4d4291e13

**Blocking — PROVEN:** `src/job/task-note.ts` treats a substring of any recorded shell command as proof that the cited command ran. With only `printf '%s\n' 'npm test'` executed, a final line marking `npm test` proven produces no `open-checks` file. The wake says plain `done` and tells the coordinator to land. This breaks acceptance bullet 2. Match executed invocations, not quoted command mentions, and add this regression case.

**The falsifying check:** `node --no-warnings /tmp/f953-review-c975f2e-repro.mjs`. It runs the harmless print command, records its transcript, and calls the real finalizer and wake builder. It exited 1 because the expected `done with open checks` was absent. Output: `/tmp/f953-review-c975f2e-repro.txt`.

Non-blocking findings:
- **PROVEN — display wording:** `src/commands/jobs.ts` and `src/job/view.ts` retain `DONE`/`done` headers; human rows report the open-check count separately. Use the requested `done with open checks` display label. Reproduction output: `/tmp/f953-review-c975f2e-jobs.txt`.
- **PROVEN — board drift:** `spec/build.md` omits the active F953 ticket. The coordinator should reconcile it; this review did not edit it.

Checks run:
- `git rev-parse HEAD`: matched the supplied candidate. Initial/final `git status --short` were empty; working and staged diffs were empty.
- `npm ci`: passed, zero vulnerabilities, before JavaScript checks.
- `node --test --test-concurrency=4 --test-timeout=180000 --test-force-exit test/s3-finish-wake.test.ts test/s7-webhooks.test.ts test/u14-task-note.test.ts test/u3-turn-signal.test.ts test/structure.test.ts`: 17 passed, zero failed. Includes the 3,500-line cap check.
- Quoted-command regression: failed as described above. Jobs-display probe: exited 0 and exposed the wording difference.

No full `npm run check` at this HEAD. The retained 81-pass log names `affc693`, so it is unverified for this candidate. The source-search tool timed out after 200 seconds; direct file reads supplied the review context. No candidate files changed.

## Note check
- Pinned HEAD: proven. `git rev-parse HEAD` matched; `/tmp/f953-review-c975f2e-checks.txt` records the checks.
- Acceptance assessment: proven. All five bullets are accounted for in `/tmp/f953-review-c975f2e-checks.txt`.
- Complete verdict: proven. `/tmp/f953-review-c975f2e.md` names the commit, findings, falsifying check and real results.
- Acceptance 1, not-proven item reaches wake: proven. The native `test/s3-finish-wake.test.ts` scenario passed.
- Acceptance 2, command never ran: broken. `/tmp/f953-review-c975f2e-repro.txt` shows the false acceptance.
- Acceptance 3, plain done wake: proven. Inspected the no-open branch; native `test/u3-turn-signal.test.ts` and `test/u14-task-note.test.ts` passed.
- Acceptance 4, test line cap: proven. Native `test/structure.test.ts` passed its 3,500-line cap assertion.
- Acceptance 5, passing independent review before landing: not proven. This review rejects the candidate; no landing occurred.
- No candidate rewrite: followed. Initial/final status and working/staged diffs were empty; `/tmp/f953-review-c975f2e-checks.txt` records them.
