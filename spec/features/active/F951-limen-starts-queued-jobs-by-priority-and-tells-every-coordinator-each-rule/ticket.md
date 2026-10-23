---
touches:
  - limen.runtime.detached
  - limen.sessions.wake
  - limen.sessions.guidance
  - limen.integrations.herdr
  - limen.integrations.seat
  - limen.commands
opened: 2026-10-23
---

# F951 · Limen starts queued jobs by priority and tells every coordinator each rule

## Outcome

A coordinator spawns work when it is ready. When the Mac is busy, Limen holds the job in one queue for the whole machine, starts it when the CPU and memory gate passes, and tells the coordinator, so nobody polls the load or announces that it is low. When the Claude week budget is low, priority 1 work starts first and every coordinator keeps working. A rule change reaches every live coordinator tab once with its end time, and its end reaches them too.

## Scope

- Start gate and queue for detached jobs, in the job's own wrapper before setup and engine start (fix 2).
- A start notice to the spawning coordinator on the route its finish wake uses (fix 2).
- `limen rule`: one seat-wide record per rule, one ping per live coordinator tab when it is set, changed or ended, and an automatic end at its end time (fix 4).
- `--priority` on spawn, queue order by priority, and a rule that holds lower priorities while the budget is low; shop-manual prose that replaces the one-job rule (fix 3).
- Decisions and slice order: `slices.md`. Where the old rules and the budget reading live: `evidence.md`.

## Out of scope

- Job time limits and the prepare and tool-stall limits. Queue time does not count against the job timeout.
- Hosted (`--tab`) jobs, group launches and Devin jobs: they start at once, as today.
- Reading the Claude budget automatically, model substitution by Limen, and edits to other plants (`alice/`, `api/`).

## Acceptance

- With the gate held closed, spawn prints `queued` and returns; when the gate opens the job starts and its coordinator gets one start notice on each route; the finish still wakes it later.
- A stopped queued job ends `stopped`, a dead wrapper's entry does not block the queue, and the job timeout starts at engine start.
- With two live coordinator panes, one shut-down registration and one pane with two sessions, a rule set sends one ping per live pane, and its end time sends one end ping per live pane.
- A priority 1 job starts before an earlier priority 2 job, and a `--start-priority 1` rule keeps priority 2 queued until the rule ends.
- The shop manual tells a coordinator to spawn when work is ready and never to check or poll the load, and it names `limen rule` and the priority budget where a one-job rule would go.
- `npm run check` passes in the worktree, and `test/` stays within its 3,500-line cap.
