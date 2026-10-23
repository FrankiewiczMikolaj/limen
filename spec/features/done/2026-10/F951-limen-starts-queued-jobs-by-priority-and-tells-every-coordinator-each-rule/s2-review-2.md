PASS b86afcc8070f50405854ede21e41e11eca4282ab

The issuing-pane omission is fixed. No blocking findings remain. No checks were rerun for this note audit.

Evidence directory (`E`): `/Users/overment/.overment/limen/.limen/jobs/2026-10-23-f951-rule-changes-reach-every-co-f0a42c92/evidence/`.

## Note check

- **Candidate and scope — proven:** HEAD matches the recorded candidate; tracked files stayed clean. Reviewed the prior findings and the S2 decision at `b2f89e7`. Evidence: `E/provenance.txt` and this session’s findings-file and `git show` output.
- **Exactly-once broadcast — proven:** Fake Herdr recorded one set, change and manual-end prompt for each of three live panes, including the issuer and a registration without `born`. The native rule test also passed expiry and competing-fallback cases. Evidence: `E/reproduction.log`, `E/rule-test.log`.
- **Required checks and cap — proven:** `npm ci` succeeded; Biome reported **2.5.8**; `npm run check` passed TypeScript, Biome and all **81 tests**; the focused rule test passed. `test/` contains **3,500 lines**. Evidence: `E/install.log`, `E/provenance.txt`, `E/check.log`, `E/rule-test.log`.
- **Easy-to-miss isolation rule — followed:** Manual commands used temporary `LIMEN_HOME` and fake Herdr, then removed the fixture and timers. Evidence: `E/reproduce.mjs`, `E/reproduction.log`.

## S2 contract bullets at `b2f89e7`

1. **Commands and time formats — not proven completely:** Set, change, manual end and duration expiry ran. Local and ISO time parsing were inspected but not executed.
2. **Seat-wide record and receipts — proven:** The named record stores text, end time, setter and receipts. Evidence: `src/project/seat-rules.ts`, `src/commands/rule.ts`, `E/reproduction.log`.
3. **Start priority and shared read — proven:** Priority appears in prompts and board output; `activeRules` is the shared exported read. Evidence: `E/rule-test.log`, `E/reproduction.log`, `src/project/seat-rules.ts`.
4. **Live-pane selection — proven:** Duplicate registrations produced no extra prompt; shutdown and birth-mismatch registrations received none. Missing `born` counted as live, as explicitly accepted. Evidence: `E/reproduction.log`, `src/commands/rule.ts`, `src/integrations/coordinator-signal.ts`.
5. **Issuing pane included — proven:** It received exactly one set, change and manual-end prompt. Evidence: `E/reproduction.log`.
6. **Prompt route, text and no uncertain resend — proven:** Recorded argv uses `herdr agent prompt`, includes the required text, and stalled prompts were not resent. Evidence: `E/reproduction.log`.
7. **Automatic end and fallback — proven:** Timer expiry and competing fallback commands each produced one end prompt per live pane. Evidence: `E/rule-test.log`.
8. **Board and coordinator context — proven:** Native tests cover rule display, worker exclusion and board removal; both readers use `activeRules`. Evidence: `E/check.log`, `test/s4-steering.test.ts`, `hook/communication.ts`, `src/commands/board-view.ts`.
9. **Template guidance — proven:** Seat-wide rules use `limen rule`; copying them into the board is forbidden. Evidence: `templates/agents.md:65`.

## Ticket acceptance bullets

1. **Queue/start notice — dropped from review:** Outside the requested S2 slice.
2. **Queued stop, dead wrapper and timeout — dropped from review:** Outside S2.
3. **One prompt per live pane and timed end — proven:** `E/rule-test.log`, `E/reproduction.log`.
4. **Priority admission — dropped from review:** S1/S3 behavior, outside S2.
5. **Shop manual — changed scope:** S2’s `limen rule` guidance is proven at `templates/agents.md:65`; queue/load and priority-budget guidance belongs to S1/S3.
6. **Full check and test cap — proven:** `E/check.log`, `E/provenance.txt`.

## Other obligations and remaining gap

- **Bounded re-review — followed:** Inspected the three-file repair delta from the previously reviewed candidate. Missing `born` was judged against the accepted main decision.
- **Installation and safety restrictions — followed:** Installed from the lockfile without linking another checkout. No candidate rewrite, real-seat rule command, GUI or GitHub Actions ran.
- **Remaining uncertainty — not proven:** Local/ISO parsing execution and real Herdr delivery lack runtime evidence. These are non-blocking gaps. The note’s “Not proven yet: none” covers its three listed end checks, not complete execution coverage of every S2 contract bullet.
