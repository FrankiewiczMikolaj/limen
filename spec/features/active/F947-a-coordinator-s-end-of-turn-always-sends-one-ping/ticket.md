---
touches:
  - limen.integrations.finish
  - limen.sessions.wake
  - limen.runtime.detached
opened: 2026-10-16
---

# F947 · A coordinator's end of turn always sends one ping

## Outcome

When a coordinator finishes its turn, the owner's phone gets one ping with what it said, the ticket it names, and
its state. Today an OMP coordinator never sends a turn-end ping, and a Pi coordinator sends one only when todos or a
goal stay open. Every job can also call `finish`, also a detached job resumed from a hosted session, and Limen keeps
its handoff.

## Scope

- One turn-end ping per coordinator turn on OMP and Pi, through the disk queue that landed earlier (F946).
- No ping while a job the coordinator owns still runs; a blocker still pings.
- A queued coordinator ping survives the coordinator's exit or resume.
- `finish` for every job, hosted or detached; its handoff is the job result.

## Out of scope

- Wake delivery confirmation, which also waits for an `agent_settled` event that OMP never sends.
- Changes on the receiver side.

## Acceptance

- An OMP coordinator that ends its turn queues one `coordinator.idle` ping whose reason holds its last message head.
- A second turn-end event without a new assistant message queues nothing.
- A queued coordinator ping is still delivered after the sweep removes the registration of a normal exit.
- A detached OMP job that calls `finish` ends `done`, and its result is the handoff.
- A live OMP and Pi coordinator and a detached OMP worker reach a local receiver.
- `npm run check` passes and `test/` stays at or under 3,500 lines.

## Notes

Root cause, from the alice plant on Adam's Mac, 16 Oct:

- The wake hook sent turn-end pings on `agent_settled`. OMP 18.4.4 never emits it: a live probe shows `agent_end`
  with a `willContinue` field and no `agent_settled`; Pi 1.2.0 emits `agent_end` without that field, then
  `agent_settled`. The coordinators in panes `w1A2:p7` and `w1A2:p6` ran OMP and started after the queue fix merged
  (21:40 and 21:02; merge 14:30), so old hooks are not the cause. Their registrations hold no ping, and the `title`
  file that every turn end rewrites still has its start time; all 83 OMP registrations on that Mac look the same.
- Pi dropped a plain turn end too: the turn rule sent nothing without an open todo, a blocker or a goal.
- Queued `coordinator.*` pings lived inside the registration, which a normal exit or a resume deletes.
- `finish` came only from the hosted reporter. Job `2026-10-16-f1043-screen-safety-cross-review-359d572d` was a
  detached continuation of a hosted session that had called `xd://finish`; OMP mounts hook tools as `xd://` devices,
  and no hook registered `finish`, so the call failed. Limen still recorded the job `done` when OMP exited 0; only the
  worker's result text says otherwise, so its state needs no repair.
