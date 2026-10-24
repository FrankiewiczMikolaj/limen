# Open note checks: stop after the final review failure

Adam authorized one final Opus repair and one fresh Sol xhigh review on 2026-10-24 at 15:15 Warsaw. That round is spent. Do not repair, start another review, land or push without a new owner decision.

The repair code is `d1db363`; evidence is `19017aa`. Sol reviewed candidate `5d566980afb903afe1054be31ccdfd8c5545cbde` and returned FAIL (`review-4.md`). The full local check passed 81 tests at the code commit; the review passed 17 focused tests and confirmed the original three reproductions are fixed, the exact display wording works, the plain wake is unchanged, and test/ has 3,499 lines.

The remaining blocker is false proof across calls in OMP's persistent shell. `'.' setup.sh` loads `halt() { exit 0; }`, then `halt && npm test` exits before invoking npm. Both calls exit 0. Limen rejects the first call but fails to track its lasting shell change. It accepts the second call's skipped npm command, writes no open-checks and sends plain done. The unquoted `. setup.sh` control is correctly downgraded. This is a recorded-session mutation, not an unobserved startup setting.

Reproduction and retained transcripts: `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-open-note-checks-reach-the-coord-8aa6898b/artifacts/review-4/quoted-source-exit.mjs` and `quoted-source-exit.txt`. The script exited 1 with one acceptance violation and one passing control.

Adam's next decision is park or land despite the known blocker. No landing or push occurred in this round. Board reconciliation remains deferred; spec/build.md is read-only for this job.
