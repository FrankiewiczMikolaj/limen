---
touches:
  - limen.runtime.liveness
  - limen.sessions.wake
  - limen.runtime.detached
opened: 2026-10-13
---

# F943 · The coordinator sweep does not start a process for each running job every half second

## Outcome

On macOS, idle coordinators and running jobs no longer keep the machine busy. Today every coordinator starts a Ruby helper for each running job on every wake sweep, so seven coordinators and five jobs keep about three cores busy. After this change a coordinator checks a job's process start time about once per 30 seconds. A dead job is still finalized, and a reused process id is still detected before the reaper finalizes.

## Scope

- The owner check that the reaper and the job status line share (`ownerAlive` in the liveness code).
- The stall check that a detached wrapper runs every 3 seconds while a tool runs.
- macOS only. Linux reads `/proc` and keeps its behavior.

## Out of scope

- Sweeps that the file watcher starts for temporary activity files. A parallel audit job owns that fix.
- One reaper per project with a lease file.
- A long-lived process-info helper.

## Acceptance

- With one running job, the report's sampling command shows almost no `proc-pidinfo.rb` helpers from a coordinator that loaded the new hook.
- A job whose wrapper process is gone is still finalized as failed after the confirm delay.
- A job whose recorded pid now belongs to another process (same pid, other start time) is finalized, not kept alive.
- One wrapper stall check starts two Ruby helpers and one `ps`, not four and one.
- `npm run check` passes on macOS.

## Notes

Report from Adam, 2026-10-13, limen `b1c34b7`, M4 Max:

> On macOS each coordinator (omp/pi with limen extension) runs a sweep every 500 ms. Each sweep checks every running job's owner; each check spawns `/usr/bin/ruby proc-pidinfo.rb <pid>`. Rate ≈ 2 × coordinators × running jobs per second. Linux reads /proc, not affected.
> Measured: 7 coordinators + 1 job = 393 Ruby processes in 30 s (13.1/s); each coordinator 1.6–2.5/s, all on the same wrapper pid; one call ≈0.05 s wall, 0.04 s CPU; total ≈ half a core constantly. Calculated: 7 coordinators × 5 jobs ≈ 70/s ≈ 2.8 cores.
> Call path: hook/wake.ts:805 setInterval(sweep, 500) → hook/wake.ts:681 reapDeadJobs(...) → src/runtime/reap.ts:83 ownerAlive(jobDir) per running job → src/runtime/reap.ts:36 kill(pid,0) then, when a `born` file exists, processInfo(pid) → src/runtime/contain.ts:219 spawns ruby proc-pidinfo.rb as a detached process.
> Second source: src/runtime/wrapper.ts:272 stall check every 3 s while a tool runs; each check starts 4 Ruby + 1 ps.
> Suggested fixes: (1) cache start-time check: kill(pid,0) every sweep, re-check `born` only every 30 s and always before the reaper finalizes (pid-reuse protection kept; cost: a reused pid can keep a dead job alive ≤30 s more). (2) reaper interval 5–10 s, separate from the 500 ms wake sweep (file watcher already triggers sweeps; reapConfirmMs already delays). (3) one reaper per project via a lease file like .limen/last-sweep. (4) batch pids into one helper call per sweep, or one long-lived helper reading pids on stdin and writing JSON lines.
> Reproduce: `for i in $(seq 600); do ps -Ao pid=,ppid=,args= | grep '[p]roc-pidinfo.rb'; sleep 0.05; done | awk '{print $1, $2}' | sort -u | awk '{n[$2]++} END {for (p in n) print n[p], "from parent", p}'`

Verified on `b1c34b7`:

- The call path is correct. One correction: each sweep checks a job's owner twice. The reaper calls `ownerAlive`, and the job status line calls it again (`hook/wake.ts:1048`, `pulseOf`). So the limit is 4 helpers per second per coordinator per job, not 2. The sampler misses short helpers, so it shows less.
- Watcher-driven sweeps add more sweeps than the 500 ms timer (found by the parallel audit job).
- The wrapper stall check is correct: one tick queries the engine three times back to back, runs `ps`, then queries the engine once more.
- Before, 2026-10-13: 7 coordinators (5 omp, 2 pi) in one project with 1 running job. The report's sampler found 360 helpers in 30 s, 22–68 per coordinator. A tighter sampler found 268 in 20 s. One helper call measured 0.05 s wall time and 0.04 s CPU.
- After, same machine: two print-mode omp coordinators in a throwaway project watched one fake running job. The one that loaded the old hook from `b1c34b7` started 242 helpers in 90 s (2.7/s, about 0.11 core). The one that loaded the new hook started 2 in 90 s, which is one recheck per 30 s. With only the new hook alive, a killed job became `failed: process group gone` 10.9 s after the kill.
- After, wrapper stall tick: 4 Ruby helpers per tick before, 2 after, with the same observed tool children.

Decisions:

- A cached start-time match is trusted for 30 s while `kill(pid, 0)` still succeeds. A mismatch or an absent process is remembered permanently, because a pid and start-time pair never comes back. So a cached answer can only say "alive". A reused pid can keep a dead job alive for at most 30 s more. Every "dead" answer that lets the reaper finalize comes from a failed `kill(pid, 0)` or a real start-time mismatch.
- No separate reaper interval and no project lease. With the cache, a sweep only reads files and calls `kill`, so neither change would remove more helper starts.
- The stall sampler trusts the caller's identity check that came just before it. The check after `ps` still proves that every row belongs to the engine. The 3 s stall tick is unchanged.
