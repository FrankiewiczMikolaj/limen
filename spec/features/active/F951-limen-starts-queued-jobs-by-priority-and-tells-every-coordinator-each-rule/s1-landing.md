# S1 landing note

S1 landed at 3d1946a after review 1 (FAIL at 4c81ca3), repair 1, and re-review 2 (FAIL at 3d1946a). The shop manual ends the loop after a second FAIL on one slice, so there was no third round. The coordinator judged the one remaining finding not blocking.

- The finding, proven by the reviewer: a start-notice claim that went stale before it was accepted makes `missedStartNotice` count the notice as delivered (`src/job/wake-text.ts:104–109`). The completion wake then omits the start line (`hook/wake.ts:413–436`). Reproduction: `evidence/s1-start-recovery-repro.mjs`.
- Why it does not block: it needs a Pi start injection that hung for more than 30 s without an answer, then a job that ended before recovery. The coordinator still gets the completion wake. Only the line about the queue wait is lost.
- Follow-up: recover stale `_start` claims before `missedStartNotice` decides.
