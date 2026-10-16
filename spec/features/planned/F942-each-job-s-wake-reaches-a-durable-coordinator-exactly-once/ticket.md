---
touches:
  - limen.sessions.wake
  - limen.sessions
  - limen.commands
opened: 2026-10-11
needs-adam: Pursue an upstream extension point with idempotent submit for Pi's durable session (durable TUI or experimental server), or keep this ticket parked?
needs-adam-on: 2026-10-11
---

# F942 · Each job's wake reaches a durable coordinator exactly once

## Outcome

A coordinator whose conversation runs on pi-durable receives each job's completion wake exactly once, across its own crashes and concurrent sweeps. After a coordinator crash Adam no longer finds a wake missing, and no wake appears twice. A delivery counts when the coordinator's conversation has settled it, not when a screen looked busy.

## Scope

- Only wakes into a coordinator whose session is durable; Pi and OMP coordinators keep their hook and Herdr routes.
- Bounded by an interactive durable Pi session that loads coordinator hooks, which upstream Pi lacks, and by the opt-in durable engine (F940).
- A spawn from a durable coordinator records its session as the wake subscriber.
- Each wake is one idempotent submission keyed by job, delivery slot and attempt number: a crash retry reuses the key, a counted attempt does not. Start at the wake delivery claim and confirm.
- The job's existing receipt is written from the settled submission, and two unsettled attempts end automatic delivery, as the ops lock says.
- New tests replace old ones; `test/` stays at or under its 3,500-line cap.

## Out of scope

- Steering a coordinator, which is a new route nobody has asked for.
- Jobs on the durable engine, and the lost-wrapper resume.
- GitHub doorbell prompts, group-lead wakes, finish webhooks and shepherd signals.

## Acceptance

- When two sweeps deliver the same wake together, the coordinator transcript holds one wake entry.
- After those sweeps the job holds exactly one receipt, `notify/delivered/<session>`.
- If the coordinator is killed after a wake is submitted and before its receipt is written, the reopened transcript holds that wake once.
- A job that finishes while the coordinator is down wakes it once after reopen.
- After a wake settles unanswered twice, automatic delivery stops and the claim stays for deliberate recovery.
- A Pi coordinator still receives a finished job's wake once through its hook route.

## Notes

- Proof of a turn is the settled submission, not a Herdr screen observation, following the board's line that an HTTP accept is not a bot turn.
