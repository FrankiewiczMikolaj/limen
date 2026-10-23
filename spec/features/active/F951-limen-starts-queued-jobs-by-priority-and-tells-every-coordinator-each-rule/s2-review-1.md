FAIL 6166f4fe5bc12eee37cee00fc7b4b540aa487c9f

S2 remains blocked by the issuing-pane exclusion. No checks were rerun for this note check.

Evidence directory (`E`): `/Users/overment/.overment/limen/.limen/jobs/2026-10-23-f951-rule-changes-reach-every-co-857741f6/evidence/`.

## Note check

- **HEAD and unchanged files — proven:** Reviewed HEAD matches the verdict; tracked status was clean. Evidence: `E/provenance.txt`.
- **S2 contract — not proven:** Issuing panes receive no set/change/manual-end ping; registrations without `born` receive pings. These require implementation changes. Evidence: `E/reproduction.log`.
- **Install, version and checks — proven:** `npm ci` succeeded; Biome was 2.5.8; `npm run check` passed all 81 tests; the eight changed focused test files passed all 32 tests. Evidence: `E/diff-and-install.log`, `E/provenance.txt`, `E/f951-s2-check-6166f4f.log`, `E/f951-s2-focused-6166f4f.log`.
- **Test cap — proven:** `test/` contained 3,499 lines; the structure test passed. Evidence: `E/provenance.txt` and the full-check log.

### S2’s eight contract bullets

1. **Commands and time formats — not proven:** Set, change, manual end and duration expiry ran; local and ISO time parsing lack execution evidence. Evidence for exercised commands: `E/reproduction.log` and focused-test log.
2. **Seat-wide record and receipts — proven:** Source inspection confirms the named record, setter fields and per-pane receipts; isolated commands exercised replacement and receipt creation. Evidence: `src/project/seat-rules.ts`, `src/commands/rule.ts`, `E/reproduction.log`.
3. **Start priority and shared read — proven:** Priority storage and rendering passed; `activeRules` supplies the shared read. Evidence: focused-test log and `src/project/seat-rules.ts`.
4. **Live-pane selection — not proven:** Newest-session selection, shutdown exclusion and birth-mismatch exclusion worked, but missing `born` was accepted. Evidence: `E/reproduction.log`.
5. **Prompt route, text and no uncertain resend — proven:** Fake-Herdr calls confirmed the route and required text; stalled delivery was not resent. Evidence: focused-test log and `E/reproduction.log`.
6. **Automatic end and fallback — proven:** Timer expiry and competing fallback commands produced one end ping per live pane. Evidence: focused-test log.
7. **Board and coordinator context — proven:** Active rules appeared in board/context, workers excluded them, and ended rules left the board; both readers use `activeRules`. Evidence: focused-test log, `hook/communication.ts`, `src/project/seat-rules.ts`.
8. **Template guidance — proven:** The template directs seat-wide rules through `limen rule` and forbids copying them into the board. Evidence: `templates/agents.md:65`.

### Ticket’s six acceptance bullets

1. **Queue/start notice — dropped from review:** The task says “Judge only this slice”; this belongs to S1.
2. **Queued stop, dead wrapper and timeout — dropped from review:** Same scope instruction; S1.
3. **One ping per live pane — not proven:** The issuing live pane receives zero set pings. Evidence: `E/reproduction.log`.
4. **Priority admission — dropped from review:** Same scope instruction; S1/S3.
5. **Spawn/load and budget guidance — dropped from review:** Same scope instruction; S1/S3.
6. **Check and line cap — proven:** Full check passed; 3,499 ≤ 3,500 lines. Evidence: full-check log and `E/provenance.txt`.

### Other obligations

- **Easy-to-miss isolation rule — followed:** Manual checks used a temporary `LIMEN_HOME` and fake Herdr; cleanup removed fixtures and timers. Evidence: `E/reproduce.mjs` and `E/reproduction.log`.
- **Dependency-link procedure — changed:** Higher-priority instructions require lockfile installation and prohibit linking another checkout. Lockfiles matched, installation succeeded, and no link needed removal. Evidence: install log and `E/provenance.txt`.
- **No candidate rewrite, GitHub Actions or GUI — followed:** Candidate files remained unchanged; the recorded review commands used local checks and fake integrations. Evidence: `E/provenance.txt`, test logs, reproduction script and review tool-call history.
- **Remaining uncertainty — not proven:** `Not proven yet: S2 contract` remains correct. Passing native checks does not resolve the reproduced contract failures.
