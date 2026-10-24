# Where the before-finish note report went (2026-10-24, base 398153f)

Observed facts, with their source. Guesses are labeled.

## Before this change

- The worker gets the note check once before the finish: the first `finish` call answers with it, a detached run gets it through `agent_before_settle` (Pi) or `session_stop` (OMP), and the log records `note check sent`. Source: `hook/finish.ts` at 398153f.
- The worker's answer becomes the job result: the `finish` handoff is written to `result` (`hook/finish.ts`), or the wrapper writes the last assistant text there (`src/runtime/wrapper.ts`, the `result.code === 0` branch).
- Nothing read the "Note check". `finalizeJob` (`src/job/record.ts`) recorded `done`, and `completionWake` (`src/job/wake-text.ts`) said "Job done. Next step: land it" with the first 15 lines or 1,200 characters of `result` as "Final message". The toasts in `hook/wake.ts` said "done; next step: land it", and the opt-in finish webhook sent the same default handoff (`bin/tony-finish-ping.sh`).
- F951 S3 (`2026-10-23-f951-low-budget-runs-priority-1-fd3e2d2b`): its "Note check" starts at result line 42 of 61 (character 4,307). The repair `…-15542c9f`: line 32 of 59 (character 3,401). Neither reached the wake excerpt.
- MEGA retry-copy (`~/mega/mega-challenge/.limen/jobs/2026-10-23-s01e02-retry-c4-50350856`): the unread-file disclosure is in result line 1, inside the excerpt. The wake still told the coordinator to land. The worker had already merged its PR before the finish (`examples.json` in `~/Downloads/limen-note-effect-update-data/`), so no wake could have stopped that landing.

## The design, and why it is the smaller one

- The state stays `done`. `limen land`, `continue`, the keeper, group rounds and the picture all key on `done`; a new terminal state would touch each of them, and a land gate would break "inform, do not gate" (`spec/vision.md`). `open-checks` in the job record marks the difference, and every reader that shows a done job to the coordinator says "done with open checks".
- No extra send-back. The existing before-finish note check already sends the worker back once; its answer is what Limen reads. A second round asks the same question of the same worker, and the F951 workers answered it with "Not proven yet: none" twice.
- The evidence check is mechanical: a backticked name counts when the session ran it or it is an existing path. "Ran" means the name starts a simple command of a recorded shell call: Limen splits each call at unquoted `;`, `&`, `|`, parentheses, backticks and line ends, drops heredoc bodies, and skips leading assignments and `time`, `timeout`, `nohup`, `env`, `command`, `exec`. Quoted text never counts, so `echo 'npm test'` does not prove `npm test` (review 1). `bash -c '…'` does not count either; the worker can name that whole call. Cases: `evidence/invocations-probe.txt`.
- It does not judge whether the evidence proves the claim. The F951 S3 hold was marked proven with real files; at its finish only acceptance item 4, which cited a code expression, would have been flagged. The race itself was found by review, and stays a review's job.
- Old final messages cite commits and code names; those lines now read as not proven. New jobs get the line form in the before-finish check. The demo's replays of the two observed jobs run after their worktrees were pruned, so files named relative to a worktree also read as missing there; the demo says so.

## Checks

- Demo: `node --no-warnings spec/features/active/F953-*/evidence/f953-demo.ts` from the repository root; output in `evidence/demo-output.txt`.
- Mutations, each run once and reverted: no `open-checks` write in `finalizeJob` fails s3 "a job that ends done…"; every backticked proven line accepted fails the same s3 test; a transcript reader that sees no command fails u14; no open-checks handoff in the finish webhook fails s7 "a done job pings only…"; substring matching instead of invocations fails u14 on `echo 'npm test'`. Output: `evidence/mutations.txt`.
- Full check: `evidence/npm-run-check.txt`, `npm run check` at a0843a7 (the review 1 repair), exit 0, 81 of 81. An earlier run at affc693 cancelled the s3 start-queue test at its 180 s limit while the Mac load average was 149 to 290 (an F952 group ran beside it). That test then passed three times alone and in each later full run. Observed, not explained.
