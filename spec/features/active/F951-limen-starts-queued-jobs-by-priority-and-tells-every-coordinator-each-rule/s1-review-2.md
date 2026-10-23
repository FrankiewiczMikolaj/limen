FAIL 3d1946a9149cc276c10bc8a05f7d9ec798dfa967

**PROVEN blocking — Recovery still loses start information.** `missedStartNotice` suppresses the start line when it sees a stale, unaccepted claim (`src/job/wake-text.ts:104–109`). Completion delivery then recovers that claim, but sends the already-built text without the line (`hook/wake.ts:413–436`).

Reproduction:
```sh
node /tmp/limen-s1-rereview-deb31959/start-recovery.mjs
```
Exit 1. The recovery fixture uses real `claimDelivery` and the native suite’s stale-unaccepted claim state. Observed: one completion wake, no start receipt, recovered claim absent, **zero start lines**. Recover stale claims before deciding whether to include the line.

The previous fast-completion case now passes: its completion wake contains the start line exactly once.

## Note check

Evidence directory: `/tmp/limen-s1-rereview-deb31959/`. Evidence filenames below resolve there.

**End checks**
- **Proven — Candidate and scope:** HEAD matches the supplied candidate; tracked tree is clean. Reviewed the five S1 commits in `main..HEAD`, using S1 at `c2e04a6`. Evidence: `identity.log`, `final-metadata.log`, and the supplied job’s `candidate` file.
- **Not proven — Exactly-once start learning:** the recovery reproduction records zero start lines. Evidence: `stale-unaccepted-claim-report.json` and `start-recovery.log`. The repair is incomplete.
- **Proven — Native checks, version and cap:** lockfile installation passed; Biome is 2.5.8; `npm run check` passed 81/81 tests; both focused queue scenarios passed; `test/` has 3,499 lines. Evidence: `install.log`, `check.log`, `queue-tests.log`, `final-metadata.log`.

**Ticket acceptance — six bullets**
1. **Not proven — Queued start and wake:** ordinary Pi and Herdr scenarios pass, but recovery loses the start line. Evidence: `queue-tests.log`, `stale-unaccepted-claim-report.json`.
2. **Proven — Stop, dead entry and timeout:** the native queue scenario exercised all three successfully. Evidence: `check.log`, `test/s3-finish-wake.test.ts:172–202`.
3. **Proven, S2 boundary only — Rule broadcasts:** the full suite’s live-pane, shutdown, deduplication, expiry and dead-timer scenario passed. Evidence: `check.log`, `test/s2-hosted.test.ts:209–245`.
4. **Changed — Priority budget:** priority ordering passed; rule-based holding belongs to S3 under the supplied slice boundary.
5. **Changed — Guidance:** S1’s spawn-ready and no-load-polling guidance is present. Priority-budget guidance belongs to S3 under the supplied slice boundary.
6. **Proven — Check and cap:** `npm run check` passed; 3,499 ≤ 3,500 lines. Evidence: `check.log`, `final-metadata.log`.

**S1 at `c2e04a6` — eleven bullets**
1. **Not proven — Gate sampling:** controlled threshold readings passed. Actual two-second CPU sampling and platform memory readers were not executed.
2. **Not proven — Configuration:** environment settings were exercised. File precedence, gate-off behavior and live file edits lack execution evidence.
3. **Not proven — Seat queue:** priority/time order passed. Cross-project sharing, head-only sampling and the default settle interval lack direct execution evidence.
4. **Proven — Priority:** ordering, recording, continuation inheritance and override passed. Evidence: `check.log`, `test/s4-steering.test.ts:133–157`.
5. **Proven — Wrapper placement:** the handshake precedes queue waiting; waiting precedes setup and engine launch. Evidence: inspected `src/runtime/wrapper.ts:95–129`; return-before-prepare scenario in `check.log`.
6. **Not proven — Visibility:** queued spawn output and `jobs` passed; `limen queue` was not executed.
7. **Proven — Stop, dead wrapper and limits:** queue tests passed; timeout calculation remains after queue waiting. Evidence: `queue-tests.log`, `src/runtime/wrapper.ts:124–129`.
8. **Not proven — Start notices:** ordinary Pi/Herdr delivery and separate receipts pass, but recovery loses start information.
9. **Not proven — Completion fallback:** the no-claim fast-completion case passes; stale-unaccepted recovery fails. Evidence: `no-claim-report.json`, `stale-unaccepted-claim-report.json`.
10. **Not proven — Detached continuation queue:** inheritance passed; a continuation held behind a closed gate was not exercised.
11. **Proven — Guidance:** spawn-ready, queue notification and never-poll wording is present. Evidence: `templates/agents.md:86`, `docs/commands.md`, `docs/jobs.md`.

**Other obligations**
- **Proven — Lockfile installation:** `npm ci --ignore-scripts --no-audit --no-fund` exited 0; no checkout dependency directory was linked. Evidence: `install.log` and its recorded command.
- **Reported — Filtered-check failure:** focused `node --test` selected two queue scenarios and one continuation scenario. The queue scenarios passed; continuation failed because filtering skipped its parent-job setup. It passed in the full suite. Evidence: `queue-tests.log`, `check.log`. The failed lane was not retried.
- **Followed — Review restrictions:** no candidate edits, GUI or GitHub Actions. Evidence: session tool-call record and clean tracked-tree checks in `final-metadata.log`.
- **Followed — Easy-to-miss isolation rule:** manual checks used temporary `LIMEN_HOME`, temporary `HOME` and fake Herdr. No real-seat spawn or rule mutation occurred. Evidence: `start-recovery.mjs` and the isolation paths in `start-recovery.log`.

`Not proven yet: exactly-once start learning` remains unresolved. The other coverage gaps are non-blocking.
