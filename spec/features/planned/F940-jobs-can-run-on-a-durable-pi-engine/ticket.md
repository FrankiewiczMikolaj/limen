---
touches:
  - limen.runtime.engine
  - limen.runtime.detached
  - limen.cabinet.records
  - limen.sessions.worker
opened: 2026-10-11
---

# F940 · Jobs can run on a durable Pi engine

## Outcome

An operator can start a detached job with `--engine pi-durable`, and its conversation, including each tool call's intent and partial output, is committed to a durable store inside the job's record. Everything else matches a Pi job: the record, log, limits, stop, result, continuation, steering, keeper packet, and usage line. It is the base that lets a later change resume a job that lost its wrapper.

## Scope

- Follows the verdict of the spike on whether a killed pi-durable job resumes through the real wrapper (F939); its notes decide where the adapter lives, the pinned revision and the store format.
- A third engine beside Pi and OMP takes the same argv and exit codes and writes the same stdout stream, so the wrapper and parser stay unchanged. Start at the engine table.
- The store lives under the job's session directory, beside a transcript in Pi's shape that usage and the keeper already read.
- The preamble, the worker's project guidance, and steers reach the model without Pi's extension API.
- Continuation copies the parent's store into the new job and keeps the engine.
- Help, errors, the shop manual and the setup guide name the third engine and how to install it.

## Out of scope

- Hosted (Herdr pane) jobs and group jobs on this engine.
- Resuming a job that lost its wrapper, and recording stop or a limit as an abort in the store; the lost-wrapper resume (F941) owns both.
- Coordinators, wakes, the default engine, OMP, and the board's standing models.

## Acceptance

- `limen spawn --engine pi-durable --detached …` writes `pi-durable` to the job's `engine` file.
- That job's `versions` file names the adapter and pi-durable versions on one line.
- `limen spawn --engine pi-durable --tab …` exits non-zero and names `--detached`.
- For a finished pi-durable job, `limen jobs <id>` shows the same fields as for a Pi job, including the served model and tokens.
- When the engine is killed after taking a steer and before it is recorded delivered, the transcript holds that steer once after the relaunch.
- `limen continue <id>` on a pi-durable job starts a child whose `engine` file reads `pi-durable` and whose transcript holds the parent's turns.

## Notes

- Decision: a steer's request ID is the job ID plus its inbox name, so a continuation's steers never match its parent's.
- Decision: continuation starts from the follow-up; the parent's unfinished run is aborted in the copy, not resumed.
- Limen's `package.json` keeps no dependencies; the adapter's live outside it.
