# Where the one-job rule, the load gate and the budget reading live (2026-10-23)

Observed facts, with their source. Guesses are labeled.

## The one-job rule

- It was prose, not a Limen setting. Tony sent it to 7 Alice coordinator tabs on 2026-10-22 between 08:25:39 and 08:25:42 UTC: "to protect the Claude seven-day limit (about 78% used), run at most ONE worker or review job at a time until the week resets … Record this in build.md once." Source: user messages in `~/.omp/agent/sessions/-playground-alice-app-alice/*.jsonl`.
- Its end ("Adam says Claude works again (2026-10-22 16:08). The one-job rule from build.md line 9 ends now.") reached 4 of the 7 tabs at 14:09 UTC. The 18:12 UTC message "do not worry about Claude limits … run your jobs in parallel" reached 5. Two tabs (sessions `2026-10-19T20-46-45-072Z_01a155ea…` and `2026-10-21T15-00-45-375Z_01a15efa…`) got neither message.
- The Alice board, `~/playground/alice-app/alice/spec/build.md` line 9 (working tree, uncommitted on 2026-10-23), now says: "Job rule (Adam, 2026-10-22 20:12, decision 84 (c)): no limit on parallel jobs and no Claude-limit pause".

## The load gate

- The same Alice board line 9 holds the start gate: "start a job only when the CPU is at least 25% idle (`/usr/bin/top -l 2 -n 0 -s 2 …`) and at least 20% of memory is free (`memory_pressure | tail -1`)" (decision 85 (a), 2026-10-22 22:06). The F1085 board line names 35% CPU idle, 20% memory free and fewer than 8 jobs.
- Coordinators enforce it by hand. Tony's 18:12 UTC message: "Check the load with uptime every few minutes, and start the moment it drops."

## Limen today

- At `e4c2637`, `grep -rniE "load (under|gate|average)|loadavg|idle cpu|free memory|memory_pressure|one[- ]job (rule|at a time)|week (budget|limit)|seven.day" src hook templates` prints nothing: no gate, no one-job rule and no budget rule. The only quota text is `templates/agents.md` Policy precedence: the board owns "what to do on quota exhaustion".

## The budget reading

- Both Claude bridges receive the SDK's `rate_limit_event` with `utilization` and `rateLimitType` (`five_hour`, `seven_day`).
  - OMP bridge, `~/.omp/local/pi-claude-bridge/bundle/index.js` near line 51086: on `allowed_warning` it shows the pane toast "Claude rate limit warning: N% used (seven_day)" for each new 5% step.
  - Pi bridge, `~/.pi/agent/npm/node_modules/@vanillagreen/pi-claude-bridge/src/rate-limit.ts` lines 93–97: at 80% or more it shows "nearing seven_day limit; check Claude Code /usage for exact utilization", without a number.
  - Neither bridge writes the reading to a file. A rejection reaches the job log as "Claude rate limit (seven_day) — resets …".
- Coordinators saw the toast in captured pane text, for example "Claude rate limit warning: 89% used (seven_day)" in `~/.omp/agent/sessions/-playground-alice-app-alice/*.jsonl`.
- Not observed: where Tony read "about 78% used". Tony's sessions are not on this Mac. Guess: a bridge toast or Claude's usage page.
