# Three days of OMP sessions: tweak, build, remove (2026-10-18)

Research only; no Limen code changed. Full report: [omp-3day-review-2026-10-18.html](omp-3day-review-2026-10-18.html).

Scope: 429 OMP session files from 2026-10-15 19:30 to 2026-10-18 19:30 UTC (504 MB): 273 jobs, 26 coordinator sessions, 6 plants; Alice is most of it.

The core loop works: jobs, worktrees, steers, finish and review carried 273 jobs. The losses come from the harness under load and from one assumption that no longer holds: one coordinator per plant. Alice ran up to 19 coordinators at once, started and shepherded by Tony. The models held rules for 30 h at 600k+ tokens and negotiated ownership well; Limen's records, timeouts and landing did not keep up.

## Tweak

1. **Wake records tell the truth and do not resend** (1 slice, 1–2 h; confidence high). 49 of 240 job wakes reached the coordinator twice, 0–3 min apart.
2. **Spawn returns the job ID in seconds** (1 slice, 2–3 h; confidence medium-high). Timed spawn calls in coordinators: median 58 s, p75 5 min, p90 10 min, max 19 min.
3. **A detached job hears its deadline before the timeout** (small slice, about 1 h; confidence high). 3 detached reviews ran the full 90 min with no verdict: 270 reviewer-minutes, 70–77 min of each spent in waits on builds and the GUI lease.
4. **Detached is the default when nobody types in the tab** (small slice + board line; confidence medium (changes an owner default)). 141 hosted jobs; 0 messages typed by a person into a worker tab (all in-tab text came from coordinators, steers or bots).
5. **Fix the CLI papercuts agents route around** (under 1 h; confidence high). Node prints `ExperimentalWarning: Type Stripping` on every limen call: 90 of 481 limen calls add a grep filter, 68 tool results carry it.
- Stall observer logs changes only (under 1 h; high).
- A landed job branch goes away (1 h; medium-high).
- Prune explains each worktree it removes (1 h; medium).
- Hook updates announce themselves (1 h; medium).
- Handoffs carry symptoms, not guessed causes (minutes; medium).
- Every job records who spawned it (under 1 h; medium).

## Build

1. **Seat admission: a cap on running jobs, with a queue** (2 slices, 4–6 h; confidence medium-high). Load averages 80–320 on a 16-core Mac with 15 jobs running; `git status` took 18 s; 8 detached starts failed ("detached wrapper did not become ready"); one review spent 28 min on a prebuild; a lab check failed at 5.2 s against a 5 s window "under load".
2. **One landing path that records proof** (2 slices, 4–6 h; confidence high (need), medium (shape)). Coordinators ran `git merge` 143 times and `limen land` 29 times; land hit 6 conflicts in the shared checkout, worked around with `git update-ref` 3 times.
3. **Starting a coordinator is one Limen command** (2 slices, 4–6 h; confidence medium-high). Tony started 26 Alice coordinator sessions in 3 days by hand (open a tab, type "Read /tmp/tony-briefs/X.md and follow it fully").
4. **One list of open owner decisions** (1 slice, 2–3 h; confidence medium). Tony asked coordinators to write their open questions into /tmp/tony-briefs/*-decisions.md, relayed answers by hand ("Adam's answers on F1074 (verbatim intent): Q1 YES…"), and once relayed a wrong one: "Adam confirms…", then "Adam has NOT confirmed" 35 s later.
5. **Durable notes and claims between coordinators** (2 slices, 4–6 h; confidence medium). On 10-18, 8 coordinators exchanged about 41 messages with raw `herdr pane send-text`, `pane run` and `agent prompt`: 0 lost, but delays up to 4 min, one stuck in an input box, 11 commands backgrounded and 4 waits skipped by incoming text.
- A plant digest for the outside assistant (1 slice; low-medium).

## Remove

1. **Remove the group runtime; keep teams as prose** (1 slice + review, 2–3 h; confidence medium (Adam asked for groups by name)). 0 `limen group start` in 3 days.
2. **Drop the per-edit styleguide reminder** (under 1 h; confidence medium (no behavior A/B)). Appended 3,662 times to code-edit results, failed edits included; a styleguide read followed within 5 calls 17 times (0.5%).
3. **Move rare recipes out of the always-on shop manual** (1 slice, 1–2 h; confidence medium-high). templates/agents.md is 7,260 words and rides every coordinator call.
4. **Stop hand-keeping NOW and PROVEN on the board** (1–2 slices, 3–4 h; confidence medium (the vision names the board coordinator-kept)). F946, F947 and F948 landed on main, but the board has 0 lines for them and their folders are still in active/.
5. **Drop count rules that models ignore** (minutes; confidence medium). worker.md: "Ten reads without a changed file means make the probe edit." 82% of 148 Alice workers made more than 10 reads before their first edit (median 25; 39% over 30).
- Use engine subagents, not jobs, for read-only fan-out (minutes (manual line); low-medium).

## Not Limen

- pi-claude bridge: first turn "No conversation found with session ID" in 26 of 26 Alice coordinators and 3 of 4 probes.
- Codex lane: 24 "native turn lane cannot accept stateful WebSocket messages" errors (recovered).
- OMP hashline edits: 237 edits anchored on lines never shown, 58 stale hashes; loops of 10–14 in one session.
- Secrets: a coordinator's sed mask covered only TAURI_* lines and printed three values (APPLE_PASSWORD, APPLE_CERTIFICATE_PASSWORD, ELEVEN_LABS_API_KEY, 10-16 14:49 UTC); `ps aux` printed a Cursor key. No Limen surface carried them. Output redaction belongs in the engine.

## Method

- Source: every OMP session file modified 2026-10-15 19:30 to 2026-10-18 19:30 UTC: 385 job sessions under <plant>/.limen/jobs/*/session, 33 coordinator and probe sessions and 11 subagent sessions under ~/.omp/agent/sessions. The 1.1 GB figure in the ask is the whole sessions folder; the 3-day slice is 504 MB.
- Index: one Python pass for plant, role, model, duration, tools, errors, wakes, steers and inputs; job logs and notify records for wake and start outcomes. Seven read-only scouts traced chosen sessions; I checked their key claims in the files.
- Durations exclude parent history copied into continue jobs. Active time caps gaps at 5 min.
- Not read: Pi sessions (78 files, not OMP), Tony's and Johnny's own transcripts, Claude Code mirrors except to remove leaked values.
- Adam's words reach OMP only through Tony and Johnny; every quote attributed to Adam is a relay.
- One scout copied the three leaked values into this review's own transcripts; I replaced them with <redacted> in both files (24 places) and found no other copy.
- Size is agent time for one worker plus review. Confidence is mine.
