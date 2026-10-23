FAIL 4c81ca3bb2a69dd82157582168b2696f427ccbac

The blocking finding remains **proven**: a queued job that finishes between Pi-hook sweeps loses its start notice (`hook/wake.ts:600,632–634`). No checks were rerun.

## Note check

Evidence directory: `/tmp/limen-s1-review.2odVTJ/`.

**End checks**
- **Proven — Candidate identity:** HEAD matches the recorded candidate; tracked tree is clean. Evidence: `metadata.log`, the job’s `candidate` file, and the final Git command output.
- **Not proven — S1 acceptance and S2 boundary:** S2 boundary tests passed, but S1 has the missing-start-notice failure and the coverage gaps below.
- **Not proven — Exactly-once start and wake:** the reproduction delivered one completion wake but zero start notices. Evidence: `pi-start-report.json`; `node /tmp/limen-s1-review.2odVTJ/pi-start-repro.mjs` exited 1.
- **Proven — Required checks, version and cap:** `npm run check` passed all 81 tests; focused hosted/rule, wake/queue and continuation suites passed all 15 tests. Biome is 2.5.8; `test/` has 3,500 lines. Evidence: `check.log`, `focused.log`, `metadata.log`.

**S1’s 10 bullets** — `spec/features/active/F951-limen-starts-queued-jobs-by-priority-and-tells-every-coordinator-each-rule/slices.md`, section “S1 · start queue”:
1. **Not proven — Gate sampling:** controlled CPU and memory readings passed; actual two-second sampling and platform memory-reading paths were not executed.
2. **Not proven — Configuration:** environment overrides were exercised; file precedence, gate-off behavior and live file changes lack execution evidence.
3. **Not proven — Seat queue:** priority/time ordering passed; cross-project sharing, head-only sampling and the default settle interval lack direct execution evidence.
4. **Proven — Priority:** ordering, recorded priority, continuation inheritance and override passed. Evidence: `focused.log`, queue and continuation scenarios.
5. **Proven — Wrapper placement:** inspected queue wait after handshake and before setup/engine; return-before-prepare checks passed. Evidence: `src/runtime/wrapper.ts:95–129`, `check.log`.
6. **Not proven — Queue visibility:** spawn output and `jobs` passed; `limen queue` was not executed.
7. **Proven — Stop, dead wrapper and timeout:** focused queue scenario passed queued stop, dead-entry removal and timeout exclusion. Deadline calculation remains at engine start. Evidence: `focused.log`, `src/runtime/wrapper.ts:124–129`.
8. **Not proven — Start notice:** Herdr submission and receipt separation passed, but Pi delivery fails after fast completion. Evidence: `focused.log`, `pi-start-report.json`.
9. **Not proven — Detached continuation queue:** inheritance passed; a continuation held behind a closed gate was not exercised.
10. **Proven — Guidance:** spawn-ready, queue-notice and never-poll wording is present. Evidence: `templates/agents.md:86`, `docs/jobs.md`, `docs/commands.md`.

**Ticket acceptance**
1. **Not proven:** reproduced missing Pi start notice.
2. **Proven:** queued stop, dead-wrapper removal and engine-time timeout checks passed in `focused.log`.
3. **Proven, S2 boundary only:** pane deduplication, shutdown exclusion, expiry and dead-timer fallback passed in `focused.log`.
4. **Changed:** priority ordering was checked; rule-based holding belongs to S3 under “Judge only this slice.”
5. **Changed:** S1’s spawn/no-load guidance was checked; priority-budget guidance belongs to S3 under the same scope constraint.
6. **Proven:** native check passed and the 3,500-line cap holds; see `check.log` and `metadata.log`.

**Other obligations**
- **Proven — Lockfile installation:** `npm ci --ignore-scripts --no-audit --no-fund` passed in the recorded tool output; no checkout was symlinked.
- **Proven — Scope:** reviewed the four S1 commits above base `68bb6db`; S2’s shared notification behavior passed its native scenarios.
- **Proven — Restrictions:** no candidate edits, GUI or GitHub Actions were used; command history and clean Git status show this.
- **Followed — Easy-to-miss isolation rule:** manual reproduction used temporary `LIMEN_HOME`, temporary `HOME` and fake Herdr. Evidence: `pi-start-repro.mjs` and its logged environment in `pi-start-repro.log`.

The remaining coverage gaps are non-blocking. The reproduced missing start notice is the reason for FAIL.
