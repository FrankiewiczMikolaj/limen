FAIL 0a51476fcd20dfd4522d75896d7964b3a7ceb9b2

**PROVEN blocker:** `src/runtime/start-queue.ts:275–284` checks rules before two asynchronous admission reads. A rule set during those reads is missed. The reproduction delays only the final queue-entry read: the priority 1 rule command returned at `20:04:15.400Z`; the priority 2 worker started at `.471Z`.

```sh
node /tmp/f951-s3-rereview.R4inAg/admission-race.mjs
```

Exit **0** confirms the violation. Synchronize rule changes with final admission and add this interleaving to the regression test.

## Note check

Evidence paths below are relative to `/tmp/f951-s3-rereview.R4inAg/`.

- **Proven — identity and bounded review:** HEAD remained the named commit; the tree stayed clean. Prior findings and the repair delta were inspected. Evidence: `candidate-sha.txt`, `candidate-sha-after.txt`, `status-before.txt`, `status-after.txt`, `s3-commits.txt`, `repair.diff`, `checks.txt`.
- **Not proven — priority hold and release:** explicit release passed, but final admission still violates the hold. A candidate fix is missing. Evidence: `queue-test.log`, `admission-race-confirmed.log`, `admission-confirmed-rule/rule.json`.
- **Proven — installation and required checks:** `npm ci` passed; Biome was **2.5.8**; `npm run check` passed all **81 tests**; the separately run queue test passed. Evidence: `npm-ci.log`, `biome-version.txt`, `npm-check.log`, `queue-test.log`; exact commands appear in `checks.txt`.
- **Proven — test cap:** `test/` contains **3,499 lines**; the native structure check also passed. Evidence: `test-lines.txt`, `npm-check.log`.

Ticket acceptance, all six items:

- **Dropped from judgment — 1, queue/start notices:** the instruction to judge S3 excludes landed S1.
- **Dropped from judgment — 2, stop/dead-wrapper/timeout:** the same S3-only instruction excludes landed S1.
- **Dropped from judgment — 3, coordinator broadcasts:** the same S3-only instruction excludes landed S2.
- **Not proven — 4, priority order and hold:** ordering passed, but the admission reproduction disproves the hold. Evidence: `queue-test.log`, `admission-race-confirmed.log`.
- **Proven — 5, shop manual:** current `templates/agents.md`, “Priority budget” and “Spawn when the work is ready,” contains the required guidance.
- **Proven — 6, native check and cap:** `npm-check.log`, `test-lines.txt`.

S3 acceptance, all three bullets:

- **Not proven — 1, rule-controlled starts:** the remaining admission race needs repair. Explicit-end release, order and notices passed in `queue-test.log`.
- **Proven — 2, priority-budget guidance:** current `templates/agents.md`, “Priority budget,” covers priorities, cheaper-model work and continued coordination.
- **Proven — 3, budget-reading documentation:** current `docs/jobs.md`, “Budget reading,” names the bridges and states that Limen does not read the budget.

- **Followed — easy-to-miss isolation rule:** both manual reproductions used temporary `LIMEN_HOME` and fake Herdr. Evidence: `priority-repro.mjs`, `prior-race.log`, `admission-race.mjs`, `admission-race-confirmed.log`.
- **Proven — obligations omitted from the note:** no candidate rewrite, real-seat mutation, GUI or GitHub Actions occurred; only one full native check ran. Evidence: command record in `checks.txt` and clean-tree snapshots.

The original sampling detector exited **1** because the job stayed held (`prior-race.log`). The first admission attempt hit a FIFO-copy harness error after observing the violation; the corrected snapshot run exited **0**. `jg` discovery timed out. No check was rerun to clear this note audit.
