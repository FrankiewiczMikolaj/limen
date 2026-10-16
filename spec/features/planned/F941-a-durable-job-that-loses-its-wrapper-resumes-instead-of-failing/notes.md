# F941 notes

Map for the worker. Limen at `b1c34b7`; pi-durable at `~/tmp/pi` `8a9c051f8`.

## Seams in Limen

- Who confirms a dead job today: `confirmDeadJobs` from `src/commands/status.ts:72`, `src/commands/jobs.ts:35`, and `src/commands/sweep.ts:47`; `reapDeadJobs` from the coordinator's poller at `hook/wake.ts:681`. Nothing else runs after a seat reboot until one of these runs. The front-matter ask is about this.
- Confirm, then claim, then finalize: `src/runtime/reap.ts:83` (`ownerAlive`, wrapper PID plus `born`), `:92` (10 s confirm, `LIMEN_REAP_CONFIRM_MS`), `:108` (`claimRecovery`), `:123` (`failed: process group gone`). The claim is an atomic rename: `src/runtime/recovery.ts:16-57`.
- Today only hosted jobs relaunch an owner, through `recoverHostedOwner` (`src/runtime/recovery.ts:87`) and `prepareRecoveredOwner` (`:114`). There is no detached relaunch path yet.
- `ownerAlive` checks only the wrapper PID. `liveJob` (`src/runtime/reap.ts:9-27`) checks the process group. The engine runs in the wrapper's group (`src/runtime/wrapper.ts:170`), so after `kill -9` of the wrapper the engine can outlive it. The old group must be gone before the store is reopened. Use KILL here: TERM would record a stop as an abort.
- The wrapper writes `state` = `running` unconditionally (`src/runtime/wrapper.ts:189`). On a relaunch, that write would bring back a job that `limen stop` finalized in the gap. Check `state` under the claim and do not overwrite a terminal state.
- Limits reset per launch: the tool counter starts at 0 (`src/runtime/wrapper.ts:74`) and the timeout starts at launch (`:21`). The ticket says the limits count the whole job: seed the counter from the job's `tool-calls` file and compute the deadline from `started-at`.
- A stopped job is finalized as `stopped` (`src/runtime/wrapper.ts:289`; detached `src/commands/stop.ts:56-80`). For the abort to land in the store, the adapter needs to handle TERM within the 5 s grace before KILL.
- A failed stop reason is detected by `isFailedStopReason` in `src/job/record.ts:30`. A job that ends `failed` with its wrapper alive (provider error, quota) is out of scope: it is finalized by the normal path and never reaches the lost-owner path. Rate-limit detection for display already exists at `src/commands/jobs.ts:523-533`.
- Stop marker: `limen stop` writes `stop-requested` only for hosted jobs today (`src/commands/stop.ts:27-28`). The wrapper treats any SIGTERM as a stop and finalizes `stopped: process group interrupted` (`src/runtime/wrapper.ts:76-81`, `:288-289`). With the marker written for detached jobs too, a TERM without it (system shutdown) should close the store and exit without finalizing, leaving `state` = `running` for the next sweep. A shutdown TERMs the engine too, and `limen stop` TERMs the whole group (`src/commands/stop.ts:56-66`), so the adapter reads the same marker in the job directory before it decides between an abort (stop) and a plain close (shutdown).
- A relaunch must clear `finished-at` if one was written (`src/job/record.ts:45`) and must not overwrite a terminal `state`.
- An out-of-memory kill usually takes the engine while the wrapper lives; the wrapper sees SIGKILL and finalizes `stopped` (`src/runtime/wrapper.ts:288`). That path is out of scope here; a later ticket could let the wrapper itself relaunch a durable engine.

## pi-durable facts

- On open, tasks left `running` go back to `pending`; `harness.resume()` or any submit/wait continues them (`README.md:102-114`).
- An interrupted unsafe tool settles with "Tool <name> was interrupted and may have partially run" (`src/harness/tool.ts:182`). An abort settles with "Tool <name> was aborted" (`:193`).
- A storage error closes the Harness. Reopening it recovers, and the same `requestId` finds an admitted submission (`README.md:674`).

## Open questions

- Where does the attempt count live? One plain file in the job record (for example `resumes`) fits "files are the truth". Should `limen jobs <id>` show it?
- Should a resumed job's finish wake mention the resume, or is the log line enough?
