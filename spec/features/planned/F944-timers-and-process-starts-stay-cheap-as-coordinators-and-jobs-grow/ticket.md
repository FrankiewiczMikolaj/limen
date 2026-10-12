---
touches:
  - limen.sessions.wake
  - limen.runtime.liveness
  - limen.runtime.hosted
  - limen.integrations.seat
  - limen.picture
opened: 2026-10-13
---

# F944 · Timers and process starts stay cheap as coordinators and jobs grow

## Outcome

An idle coordinator costs close to nothing, however many old job records the project holds and however many other coordinators run beside it. On 2026-10-13 seven idle coordinators on a project with 941 job records used about 1.6 cores between them, and every busy job made each of them sweep several times a second. Background loops must scale with live work, not with history or with the number of open panes. `audit.md` in this folder lists each loop with its measured or estimated cost.

## Scope

- The coordinator wake sweep: what it re-reads on each tick and on each watch event (`hook/wake.ts`).
- Per-coordinator loops that every pane repeats for the same project: wake status, Herdr metadata, group delivery.
- Process starts on a timer: Herdr calls in the hosted supervisor, the launchd sweep's coordinator check.
- The picture server's once-a-second read when no page is open.

## Out of scope

- The per-sweep Ruby owner check and the wrapper stall check: the fix that caches a job owner's start time (F943) covers them.
- Retiring or archiving old job records (`limen prune`) beyond what a slice needs to stay cheap.
- Linux-only paths, which read `/proc` and start no process.

## Acceptance

- With the 941-record copy from `audit.md` and one running job, the wake hook alone uses under 2% of a core (measured 21% before).
- Hook CPU does not grow with finished job records: 100 and 941 records measure within 1 percentage point.
- A busy detached job starts at most one sweep per second in each coordinator (measured 8 per second before).
- The launchd sweep starts no process for a coordinator record whose pid is gone.
- The wake still reaches the right coordinator once, and the fallback wake still reaches an idle owner, in the existing wake tests.

## Notes

- Repro harness: `audit.md` names the scratch scripts and the CPU measurement method. `ps` in the job shell is a shell builtin with wrong numbers; use `/bin/ps -o cputime=`.
- Decision for slice 1: a finished job that has nothing to deliver to this session can stay settled until a watch event touches it or the 30-second refresh runs. A fallback wake can then arrive up to 30 seconds later than today.
