FAIL edfe87344594dc08945e3e02a89b1fc91d7f8ade

**PROVEN blocker:** A priority 2 job started while a newly set `--start-priority 1` rule held. `src/runtime/start-queue.ts:237–273` checks rules before the asynchronous load read, but not again before admission. Recheck rules at final admission and add a regression for changes during sampling.

Reproduction: `node /tmp/f951-s3-review.ajcAsa/priority-repro.mjs --race-only`. Exit 0 confirmed the violation. The rule was set at `19:37:13.445Z`; the worker started at `.541Z`.

Keeping priority holds with `LIMEN_START_GATE=off` is sound: that setting disables the load gate, not the budget.

## Note check

Evidence directory below: `/tmp/f951-s3-review.ajcAsa/`.

- **Proven — candidate identity and scope:** HEAD matched the named commit; the tree stayed clean. Evidence: `candidate-sha.txt`, `s3-commits.txt`, `checks.txt`.
- **Not proven — priority hold and release:** ordinary release passed, but the sampling reproduction disproved the hold invariant. Evidence: `sampling-race-confirmed.log`. A candidate fix is required.
- **Proven — installation and checks:** `npm ci` passed; Biome was 2.5.8; `npm run check` passed all 81 tests; the five changed suites passed all 24 focused tests; `test/` contained 3,499 lines. Evidence: `checks.txt`, `biome-version.txt`, `npm-check.log`, `focused-tests.log`, `test-lines.txt`.

Referenced ticket acceptance items:

- **Dropped from judgment — item 1, queue/start notices:** the instruction “Judge only this slice” excludes re-reviewing landed S1.
- **Dropped from judgment — item 2, stop/dead-wrapper/timeout:** the same instruction excludes landed S1.
- **Dropped from judgment — item 3, coordinator rule broadcasts:** the same instruction excludes landed S2.
- **Not proven — item 4, priority ordering and hold:** the ordinary focused scenario passed, but the sampling reproduction exposed a priority hold violation.
- **Proven — item 5, shop manual:** `templates/agents.md` names the priority budget and directs coordinators to spawn ready work without polling load.
- **Proven — item 6, native check and cap:** `npm-check.log` and `test-lines.txt`.

Referenced S3 bullets:

- **Not proven — bullet 1, rule-controlled starts:** the sampling violation remains; release and start-notice evidence is in `gate-off-expiry.log`.
- **Proven — bullet 2, priority-budget guidance:** `templates/agents.md:64–66` covers the rule, priorities, cheaper-model work, and continued coordination.
- **Proven — bullet 3, budget-reading documentation:** `docs/jobs.md`, “Budget reading,” names the bridges and states that Limen does not read the budget.

- **Followed — easy-to-miss isolation rule:** manual scripts used temporary `LIMEN_HOME` and fake Herdr. Evidence: `priority-repro.mjs`, `gate-off-expiry.mjs`, and their logs.
- **Proven — obligations omitted from the note:** no candidate rewrite, GUI, GitHub Actions, or real-seat mutation occurred. Evidence: `checks.txt` and the manual scripts.
- **Recorded check limits:** two initial manual attempts exited 1 from harness errors—missing `HERDR_ENV` and FIFO copying. They are not candidate failures. No native check was rerun to clear the note.
