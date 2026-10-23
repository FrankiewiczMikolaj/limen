# F951 slices and decisions

Adam's decision 99 (2026-10-23) approved fixes 2, 3 and 4 of `~/playground/alice-app/alice/tmp/evidence/slow-moves-study/report.md`, section 3. Each slice: one Opus worker, an independent review, a land on `main`, and a push. S1 and S2 touch different seams and run in parallel. S3 starts after both land. To keep S3 small, S1 carries the priority flag and order, and S2 stores the rule's start priority; S3 joins them.

## S1 · start queue (fix 2)

- The gate: CPU at least 25% idle, sampled over about two seconds across all cores, and memory at least 20% free. On macOS the memory reading is the `memory_pressure` free percentage, the same reading as the Alice board rule; on Linux it is MemAvailable over MemTotal. 25 and 20 are Adam's decision 85 (a) from the Alice board (2026-10-22 22:06).
- The values live in one file under the Limen home (`LIMEN_HOME`), because the machine is shared by every plant. An env variable overrides the file and can turn the gate off. Tests set the reading; they never depend on the real load.
- One queue for the seat, under the Limen home. Order: priority, then queue time. Only the head samples the gate. After one start, the next start waits a settle interval of about a minute.
- `limen spawn --priority 1|2|3`, default 2, recorded in the job; `limen continue` inherits it unless it gets its own flag. 1 is the most urgent.
- The job's own detached wrapper waits, after its handshake and before prune, `--prepare` and the engine. No new daemon. A job that the gate admits at once and has nobody ahead starts as today.
- Spawn says `queued` with the reading and the count ahead, and still prints the ID last. `limen jobs` shows pulse `queued` with the wait and the reason. `limen queue` lists the order and the current reading.
- `limen stop` ends a queued job `stopped`. An entry whose wrapper is dead is removed and does not block the queue. The job timeout and a group deadline are computed when the engine starts; their values do not change.
- A job that waited tells its coordinator once when it starts, on the route its finish uses: the Pi wake hook for a subscribed session, `herdr agent prompt` to a recorded `origin-pane`. The text names the job, the wait, and the reading, and says no action is needed. Its receipt is a separate family: it never counts as the completion delivery. The Pi hook's "started" toast must not fire while the job only waits.
- A start notice is news only while the job runs. If the job ended before the Pi hook delivered the notice, no stale notice follows; the completion wake carries the notice's line instead, so the coordinator always learns the wait. The Herdr route sends the notice before the engine starts. (From S1 review 1.)
- `limen continue` of a detached job queues the same way.
- Templates and docs: spawn when work is ready; Limen queues and tells you when it starts; never check or poll the load before a spawn.

## S2 · rule broadcast (fix 4)

- `limen rule set <name> --until <time> "<text>"`, `limen rule end <name> [reason]`, and `limen rule` to list the active rules. `--until` takes a duration or a local or ISO date and time. Setting a name that exists is a change.
- One record per name, seat-wide under the Limen home. It keeps the text, the end time, who set it, and one receipt per pinged tab.
- `--start-priority N` is stored with the rule and shown in its ping and its listing; the queue reads it in S3. One small exported read of the active rules serves the queue, the board and the hook.
- A live coordinator tab: a registration under `<project>/.limen/coordinators/<session>` in a project listed in the seat registry, with a live `pid` whose birth matches `born` when `born` is recorded, and no `shutdown` mark. One ping per pane: the newest live registration on that pane. A registration without `born` counts as live, as in the coordinator sweep: the hook can miss that write on a loaded machine, and a missed live tab is the failure this slice removes. A reused pid on a pane that is gone gets `pane_not_found` from Herdr, so nothing is sent.
- Every live pane gets the ping, also the pane that ran the command.
- A ping is `herdr agent prompt <pane> <text>`, the route Tony uses today. The text names the rule, its end in local time, and says the rule is on the board and must not be copied into `spec/build.md`. A text that may have reached a pane is never resent; the same rule holds for completion wakes.
- At the end time the rule ends once (a claim), and each live tab gets one end ping that says what the rule held. `rule set` starts a detached timer for the end. At least one fallback ends a due rule when the timer died, for example `limen rule`, spawn, or a waiting queue wrapper.
- The board: active rules appear in each coordinator's per-turn context (the communication hook, coordinators only) and at the top of `limen board`. An ended rule disappears from both.
- Templates: a rule for all coordinators goes through `limen rule`; a rule ping is the rule; do not record it in `spec/build.md`.

## S3 · priority budget (fix 3)

- The queue reads the active rules: while a rule with `--start-priority N` holds, it starts only jobs at priority N or more urgent. Held jobs show which rule holds them. When the rule ends they start in order as the gate allows, and their coordinators get the S1 start notice.
- Shop manual: replace any one-job rule with the priority budget. When the Claude week budget is low, one person sets one rule until the week resets, for example `limen rule set claude-week --until <reset> --start-priority 1 "Claude week budget low: …"`. Every coordinator keeps running. Each spawn carries the board's priority. Reviews and planning run on the board's cheaper model. Nobody limits the Mac to one job, and nobody stops all coordinators.
- Docs: where the budget reading comes from today (`evidence.md`), and that Limen does not read it.
