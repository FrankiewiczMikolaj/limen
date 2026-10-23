# S3 landing note

S3 landed at 0a51476 after review 1 (FAIL at edfe873), repair 1, and re-review 2 (FAIL at 0a51476). The shop manual ends the loop after a second FAIL on one slice, so there was no third round. The coordinator judged the one remaining finding not blocking.

- The finding, proven by the reviewer: under the queue lock, `decide` checks the holding rules before its last reads (`src/runtime/start-queue.ts:275–284`). `limen rule set` does not take that lock. A rule written in the milliseconds between the check and the start lets one job start. The reviewer widened the window by delaying a read. Reproduction: `evidence/s3-admission-race-repro.mjs.txt`, run as `.mjs`.
- Why it does not block: without a shared lock, a job admitted at the same instant as the rule cannot be ordered after it. A rule does not stop jobs that already started, and this job counts as one of them. Repair 1 closed the real gap, which was the two-second load read on every poll.
- Follow-up: let `limen rule set` and `limen rule end` write under the start-queue lock, so a rule and an admission cannot overlap.
