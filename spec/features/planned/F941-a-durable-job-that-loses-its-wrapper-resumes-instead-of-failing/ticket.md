---
touches:
  - limen.runtime.liveness
  - limen.runtime.detached
opened: 2026-10-11
needs-adam: May limen status and limen jobs start a resume of a lost durable job, which spends model tokens from a read command, or only limen sweep and the coordinator's wake poller?
needs-adam-on: 2026-10-11
---

# F941 · A durable job that loses its wrapper resumes instead of failing

## Outcome

A running pi-durable job whose wrapper is lost, to a stray `kill -9` or to the seat shutting down, resumes from its stored conversation instead of ending `failed` or `stopped`. The model learns which tool call was interrupted, and the job record says what was resumed. After two automatic resumes the job ends `failed` with its store and worktree kept for deliberate recovery. A stop, the timeout and the tool-call cap still end the job.

## Scope

- Only detached jobs on the opt-in durable engine (F940); Pi and OMP jobs keep today's lost-owner handling.
- Start where a dead job is confirmed and recovery is claimed: for a durable job the claiming owner relaunches it instead of finalizing it.
- `limen stop` leaves a stop marker for detached jobs too, so a TERM without one (a shutdown) leaves the job resumable.
- A relaunch waits until the old process group is gone, so the store keeps one writer.
- At most two automatic resumes, mirroring the ops lock's two-attempt rule, counted in a plain file in the job record.
- New tests replace old ones; `test/` stays at or under its 3,500-line cap.

## Out of scope

- Hosted jobs and how their supervisor recovers.
- An engine that dies while its wrapper lives, and a job that ended `failed` with a live wrapper (a provider error or quota); both still end the job.
- Rerunning tools as replay-safe: an interrupted tool reports that it was interrupted.

## Acceptance

- After `kill -9` of the wrapper during `bash`, one `limen sweep` after the confirm window relaunches the job, and the same job ID ends `done` with a `resumed` line in its log.
- That job's transcript holds "Tool bash was interrupted and may have partially run".
- After TERM to the wrapper with no stop marker, `state` still reads `running`, and the next `limen sweep` resumes the job.
- After the wrapper is killed a third time, the job ends `failed` with a reason naming two resumes, and no third engine starts.
- `limen stop <id>` during a run ends the job `stopped`, and no later sweep resumes it.
- Two recovery passes started together on one lost job start exactly one engine process.

## Notes

- Decision: stop, the timeout and the tool-call cap record an abort in the store; the limits count the whole job across resumes (tool calls continue from the recorded count, the deadline runs from the first start).
