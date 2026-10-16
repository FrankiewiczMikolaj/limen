---
touches:
  - limen.integrations.finish
  - limen.sessions.wake
opened: 2026-10-16
---

# F947 · A coordinator's end of turn always sends one ping

## Outcome

When a coordinator finishes its turn, the owner's phone gets one ping that says what it said, which ticket it
names, and its state: done, waiting on the owner, or asking. Today an OMP coordinator never sends a turn-end ping, and
a Pi coordinator sends one only when todos or a goal stay open, so a coordinator that writes its report and waits on
the owner is silent.

## Scope

- One turn-end ping per coordinator turn on OMP and on Pi, through the disk queue that landed earlier (F946).
- The ping carries the head of the last assistant message, the ticket it names, and the turn state.
- No ping while a job the coordinator owns still runs; a blocker still pings.
- A queued coordinator ping survives the coordinator's exit or resume.

## Out of scope

- Wake delivery confirmation, which also waits for an `agent_settled` event that OMP never sends.
- Changes on the receiver side.

## Acceptance

- An OMP coordinator that ends its turn queues one `coordinator.idle` ping whose reason holds its last message head.
- A second turn-end event without a new assistant message queues nothing.
- A turn that ends while an owned job runs queues nothing.
- A queued coordinator ping is still in the outbox after the sweep removes the registration of a normal exit.
- A hosted OMP coordinator that ends its turn delivers the ping to a local receiver.
- `npm run check` passes and `test/` stays at or under 3,500 lines.

## Notes

Root cause, from the alice plant on Adam's Mac (coordinators in panes `w1A2:p7` and `w1A2:p6`, 16 Oct):

- The wake hook sends turn-end pings on `agent_settled`. OMP 18.4.4 never emits it. A live probe shows OMP emits
  `agent_end` with a `willContinue` field and no `agent_settled`; Pi 1.2.0 emits `agent_end` without that field,
  then `agent_settled`.
- Both coordinators ran OMP and started after the queue fix merged (21:02 and 21:40; merge 14:30), through the
  plant loader that imports the shared hook. Old hooks are not the cause. Their registrations have no `events/` and
  no `last-signal`, and the `title` file, which every turn end rewrites, still has its start time.
- All 83 OMP coordinator registrations on that Mac show the same. The 20 coordinator pings ever sent there are 18
  `ask` timeouts (a timer, not a turn end) and 2 idle pings from one coordinator on 8 Oct.
- Pi also drops a plain turn end: the turn rule sends nothing without an open todo, a blocker or a goal, and drops a
  repeat of the last state.
- Queued `coordinator.*` pings live inside the registration, which a normal exit or a resumed session deletes.
