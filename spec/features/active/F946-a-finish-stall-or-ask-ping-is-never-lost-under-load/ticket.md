---
touches:
  - limen.integrations.finish
  - limen.integrations.seat
  - limen.commands
opened: 2026-10-16
---

# F946 · A finish, stall or Ask ping is never lost under load

## Outcome

The owner's phone gets every finish, stall and Ask ping, also when the Mac is slow or the receiver refuses for a
while. Today about one ping in three is lost and nothing sends it again, so a worker can wait 35 minutes for an
answer nobody was told about.

## Scope

- Every plant ping (job finish, job stall, coordinator Ask and idle, coordinator exit, lead step) goes to a disk
  queue before the first send. A detached sender retries it with backoff.
- Retry a timeout, a network error, 408, 429 and 5xx. Do not retry another 4xx. Record the exact status code and a
  short redacted response body.
- The next `limen` command, `limen sweep` and the coordinator's wake hook resend a queued ping after a crash.
- A target that accepted the ping never gets it again. The payload keeps its stable `finishEvent` key.

## Out of scope

- Changes on the receiver side (the Cursor automation).
- Proof that the owner woke up; acceptance stays the end of Limen's part.

## Acceptance

- A receiver that answers after 5 s still gets the ping, and the job records `accepted`.
- A receiver that answers 503 and then 200 gets the ping again later, and the record shows `503` and its body.
- A ping that a receiver accepted is not sent again by a later `limen` command or sweep.
- A 404 is sent once and recorded with its code and body.
- After the sender process is killed, the next `limen` command sends the queued ping.
- `npm run check` passes and `test/` stays at or under 3,500 lines.

## Notes

Root cause, from the receipts of 1,675 job records (20 Sep – 16 Oct) on 27 plants on Adam's Mac:

- Of 1,397 configured terminal pings, 949 were accepted and 448 were lost: 364 sender timeouts, 45 HTTP 4xx, 14
  interrupted mid-send, 25 with no record. Stall pings: 15 accepted, 8 timed out. Coordinator pings: 18 accepted,
  2 timed out. Losses peak on 8–10 Oct (315) but occur on every busy day.
- Timeouts: the ping is sent once, inside the process that is ending, with 3 s per try (finish: two tries in 4 s;
  stall and Ask: one try). The 3 s include starting a new Node process. In accepted pings, start takes 0.15 s
  (median) and HTTP 0.71 s (median), 2.34 s (p99), so the budget equals the healthy p99. In the 339 timeouts with a
  receipt, start alone took 1.54 s (median), 2.45 s (p90), and no target answered before the kill. Six timeouts had
  already been accepted and were still recorded as failed.
- No resend: `finish-webhook-attempt` is claimed once and never reclaimed; stall and Ask have no second try;
  no sweep reads a failed ping again.
- 4xx: the sender keeps only the class `4xx`, drops the body, and treats every non-2xx as final, so the real codes
  are not on disk. The 45 rejections come in windows (30 Sep 05:08 – 1 Oct 13:23: 15 of 15; 13 Oct 18:08–19:56:
  13 in a row), on two receiver URLs at the same time, with a median gap of 27 min to the ping before (minimum
  36 s; accepted pings had gaps down to 0.1 s). Pings close together do not cause them. [INFERENCE] The receiver
  refused all calls for a period, for example a usage or run limit.
