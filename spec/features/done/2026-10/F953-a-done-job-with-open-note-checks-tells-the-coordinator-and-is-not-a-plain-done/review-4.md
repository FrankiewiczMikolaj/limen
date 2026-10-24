FAIL 5d566980afb903afe1054be31ccdfd8c5545cbde

**Blocking — PROVEN: acceptance bullet 2 remains broken.** A command skipped after quoted sourcing can retain proven status. The actual finalizer writes no `open-checks`; the actual wake says plain `done` and instructs landing.

## Reproduction

`setup.sh` contains:

```sh
halt() { exit 0; }
```

Two recorded calls share one real Bash shell, using repair 4’s OMP persistent-shell model:

```sh
'.' setup.sh
halt && npm test
```

Both calls exit 0. The marker-writing `npm` stub is never invoked. The final message contains:

```md
## Note check
- Suite: proven. `npm test`
```

In `src/job/session-commands.ts`, `keptWord()` misses the quoted `'.'` mutation. The first call is rejected, but later calls remain trusted. `sessionRuns()` accepts the skipped `npm test`. Through the real `finalizeJob()` and `completionWake()`, this produces plain `done`.

The unquoted `. setup.sh` control correctly produces `done with open checks`. This is skipped execution, not test failure or evidence-quality judgment. The proven line cites no existing file. The shell mutation occurs during the recorded session, not at startup.

Artifacts:

```text
/Users/overment/.overment/limen/.limen/jobs/2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/
```

`quoted-source-exit.mjs` exited **1**: one acceptance violation and one passing control. Facts, transcripts, and wakes are retained in `quoted-source-exit.txt` and `quoted-source-exit/`.

Fresh reproduction:

```sh
W=/Users/overment/.overment/.limen-limen-worktrees/2026-10-24-f953-final-sol-review-03051398
A=/Users/overment/.overment/limen/.limen/jobs/2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4
R=$(mktemp -d "$A/repro-XXXXXX")
cp "$A/quoted-source-exit.mjs" "$R/"
node --no-warnings "$R/quoted-source-exit.mjs" "$W"
```

## Checks run

- **Identity:** HEAD matched the supplied SHA. Scoped diff against repair `d1db363` was empty across source, hooks, templates, tests, docs, bin, and configuration.
- **Install:** `npm ci` exited 0; zero vulnerabilities. It ran before JavaScript checks. Local `node_modules` is not a symlink.
- **Native suites:** the command below exited 0; **17 passed, zero failed**. Output: `focused-native.txt`.

```sh
env -i HOME="$HOME" PATH="$PATH" TMPDIR="${TMPDIR:-/tmp}" \
  node --test --test-concurrency=4 --test-timeout=180000 --test-force-exit \
  test/s3-finish-wake.test.ts test/s7-webhooks.test.ts \
  test/u14-task-note.test.ts test/u3-turn-signal.test.ts test/structure.test.ts
```

Additional artifact scripts ran with `node --no-warnings`:

- `real-shell-review.mjs`: exit 0; **10 expected classifications**. All three original failures now produce open checks. A failing executed stub wrote its marker despite exit 7; it was not described as unexecuted.
- `execution-boundary.mjs`: exit 1; **one false proof in four cases**, through quoted sourcing that replaces `npm` with a no-op function.
- `quoted-source-exit.mjs`: exit 1; the stronger skipped-command reproduction above.
- `contract-checks.mjs`: exit 0. No-open wakes matched base `398153f3563af189b0137444d231e21746f1fe11` byte-for-byte across four routes. `test/` contained **3,499 lines**. Jobs rows/detail said `done with open checks`; compact output said `DONE WITH OPEN CHECKS`.

The retained full-check log matches evidence commit `19017aa`. It records one clean-tree `npm run check` at `d1db363`: exit 0, 81 passed. That full-lane run remains **unverified at this exact HEAD** and was not repeated.

All three prior reviews, the ticket, `repair-4.md`, vision, and board were read. The inherited board drift remains the coordinator’s responsibility. Candidate source and `spec/build.md` were unchanged. No further reviewers, landing, or push occurred. Stop and report this failure to Adam.

## Note check

Evidence paths below are relative to the review job directory.

- Candidate and repair identity: proven. `../2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/identity.txt`.
- Five-bullet and prior-findings assessment: proven. The standalone assessment is recorded in `../2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/review.md`.
- Execution/finalization/wake invariant: not proven. The quoted-source reproduction demonstrates a skipped command retaining proven status.
- Acceptance 1, one open item reaches the wake: proven. `../2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/real-shell-review.txt`.
- Acceptance 2, unexecuted commands become not proven: not proven. The original cases pass, but quoted sourcing still breaks this bullet.
- Acceptance 3, unchanged no-open wake: proven. `../2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/contract-checks.txt`.
- Acceptance 4, 3,500-line cap: proven. `../2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/contract-checks.txt`.
- Acceptance 5, passing independent review before landing: not proven. This review rejects the candidate; no landing occurred.
- No implementation changes, further reviewers, or landing/push: followed. Initial/final diffs were empty; artifacts stayed outside candidate source. Evidence: `../2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/final-state.txt` and this session’s tool history.
