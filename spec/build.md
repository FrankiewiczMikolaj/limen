# Build

## TRACK

- **Pi/OMP engines (Adam 2026-09-22):** one flag, one profile table, one wrapper, one unchanged parser; separate auth stores and same-engine continuation. This VPS plant coordinator owns the board and authorized main landings/pushes; Adam retains review ownership, with no independent reviewer. Live hosted OMP proof, doorbell, unusable-route, and restoring Claude were outside the engine slice.
- **Standing engine (Adam 2026-09-23):** new jobs default to OMP at runtime; `--engine` overrides `LIMEN_ENGINE`. Use `--engine pi` or `LIMEN_ENGINE=pi` only when Pi is required; continuation keeps the recorded engine, and old records without one remain Pi.
- **Standing models (Adam):** ordinary work, coordination, research, and quality use `openai-codex/gpt-6.1-sol` on OMP; simple / cheap tasks and UI-related work use `pi-claude/claude-opus-5-5` on OMP (`--provider pi-claude --model pi-claude/claude-opus-5-5`; never `anthropic/`). Pass engine/provider/model/reasoning explicitly; this supersedes the earlier GPT-6-Sol and Grok model choices.
- **Scout model (Adam 2026-10-10):** `pi-claude/claude-haiku-5-5` on OMP at `medium` (`--role scout --detached`) runs the read-only scout before a spawn, kept on trial by the Haiku helper pilot (F936). Never for edits, landing, review of record, group hypotheses, synthesis, or owner-facing text.
- **Ops remediation lock 2026-09-10 (Adam):** two unsuccessful automatic wake attempts then deliberate recovery; park-and-preserve on quota — no silent model substitution. Named-job `limen watch <id>` for takeovers — not `watch --running`.
- **Finish proof (Adam):** HTTP ≠ bot turn. VPS-first, Johnny-only automatic finish proof is sufficient; an export hold is unobserved evidence, never absence of an actual turn; no Tony coordination.
- **Review and reasoning (Adam):** Adam reviews; no independent reviewer unless asked. Retain `xhigh` for coordination/research/quality and `high` for ordinary jobs. Research uses the research model above for both independent opinions; judge and picture use the ordinary model.
- **Collaborative groups (Adam 2026-09-29):** spec review by OMP `pi-claude/claude-opus-5-5` at `xhigh` before implementation; ordinary model for implementation and one two-team live proof; commit and push only after native checks and observed collaboration pass, preserving work on quota failure.
- **Group boundary:** opt-in per feature, one owner-facing lead and landing owner, fixed team/total-worker allowances, separate candidate branches and informational peer messages; no recursive coordinators, cross-seat routing, automatic merge, or unrelated plant changes.
- **Group recovery:** bounded event waits and deadlines, no coordinator continuation or automatic roster repair, and stop preserves recovery work until explicit close.
- Reliable in-flight control on one seat; a laptop is a window; the GitHub App rings Alice's registered coordinator, and one repository on one seat is enough (Adam 2026-10-03).
- Settled Herdr panes keep RUNNING jobs and stall warnings visible; external finish delivery remains per-project opt-in.
- Coordinator CPU is repaired without deleting history; job-history retention remains a separate operator decision.
- **Ops wave (Adam 2026-09-27, Johnny coordinating), in this order:** plate as inbox (F738) and doorbell dedupe on job + final state (F739) in parallel; then owner + land policy on the job with a non-blocking end-of-job spec nudge; then OMP finish wakes with `limen wait` refused under `LIMEN_COORDINATOR=1`; then quiet liveness. OMP only, never pi-claude; land each slice onto `main` when done, no extra review; never edit Alice `alice/` or `api/`.
- **Ergonomics wave (Adam 2026-10-02):** implement policy-accurate setup examples and naming, unique feature identities, root-aware Herdr role spaces, and subject-first status; finish existing reliability slices without rebuilding landed wakes or touching group branches.
- **Ergonomics boundary:** preserve the vision and owner review policy; no global Pi/OMP/Herdr configuration changes, external-service operations, or unrelated plant edits; context deduplication is explanation only.
- **Feature identity:** the parked application field-guide proposal is F743 (formerly misfiled as F050; see its former-address.md); F050 is the landed diff viewer.
- **Scope lock (Adam 2026-10-03), in this order; land each slice on `main` when green:** status names (F746); setup text (F747); map wording (F748); finish guide (F749); OMP wake proof (F741) and a reproduction of the hosted OMP fallback gap before any recovery change (F728); Limen and Alice map touch lines (F750). Then release collaborative groups (F740) without shrinking the trial.
- **Finish wording (Adam 2026-10-03):** a done job says it is done and names the next step; never "merge not ready" when landing is the only step left. Landed before groups.
- **First map (Adam 2026-10-03):** start the first picture job interactive (`--tab`); `--detached` only when the interactive start fails.
- **Scope lock boundary:** no second-seat GitHub proof, no new Sol model policy, no Changes-list highlight on the map.

## NOW

<!-- Generated from spec/features/active/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

- `F948-every-agent-knows-it-works-inside-a-highly-capable-agent-system` (🟠 ACTIVE): Every agent knows it works inside a highly capable agent system
- `F947-a-coordinator-s-end-of-turn-always-sends-one-ping` (🟠 ACTIVE): A coordinator's end of turn always sends one ping
- `F946-a-finish-stall-or-ask-ping-is-never-lost-under-load` (🟠 ACTIVE): A finish, stall or Ask ping is never lost under load
- `F936-haiku-helpers-do-the-narrow-chores-for-coordinators-workers-and-groups` (🟠 ACTIVE): Haiku helpers do the narrow chores for coordinators, workers and groups
- `F778-coordinator-and-lead-finish-signal` (🟠 ACTIVE): The shepherd learns when coordinators and group leads finish, block or stall
- `F777-hosted-pane-shows-true-agent-state` (🟠 ACTIVE): A hosted job's Herdr tab shows the agent's true state; wrong since 2026-10-05: Hosted panes show green while the agent is visibly working.
- `F774-picture-endgoal-layout` (🟠 ACTIVE): Adam can click the target picture dashboard as one polished end-goal HTML
- `F766-remote-agent-setup-guide` (🟠 ACTIVE): An agent can set up a Limen seat, GitHub App, and integrations from one short document
- `F765-picture-ui-style` (🟠 ACTIVE): The picture has one visual language that is minimal and appealing
- `F764-picture-log-methods` (🟠 ACTIVE): Proven methods make picture logs clearer and stay simple
- `F763-picture-log-clarity` (🟠 ACTIVE): Picture logs that a person can skim and an agent can read cheaply
- `F759-graph-shows-what-to-decide` (🟠 ACTIVE): The graph shows only what the owner must decide, under high change volume; needs Adam since 2026-10-04: Count each place's code changes when the map refreshes, or read them from Git at every build?
- `F729-continuation-publication` (🟠 ACTIVE): Continuation survives concurrent pruning

## NEXT


## PARKED

- `F081-spawn-refuses-an-unusable-route` (🔴 PLANNED): still waiting for a Pi-supported non-generating route probe. Rechecked installed Pi 0.84.2 on 2026-09-19: `auth check` still proves credentials only; model runtime has stream/complete, no exact-route validation. Failing candidate `b14b5fe` stays locked; no auth/catalog substitution. Hosted continuation file transport already landed.

## DROPPED

- `F724-handoff-policy-has-one-home` (⚪ DROPPED): speech register already has no second handoff length or constraint rule; shop manual owns the full handoff. No code change.
- `F046-optional-speech-command` (⚪ DROPPED): optional `/speak` shipped, then removed at owner request. Removal `d45fed2`.

## PROVEN

<!-- Generated from spec/features/done/ by limen land, limen ticket done and limen board --write. Edit the tickets, not these lines. -->

- `F945-short-pi-claude-model-form-starts-the-job-instead-of-killing-it` (🟢 PROVEN): Short pi-claude model form starts the job instead of killing it; landed 2026-10-13
- `F943-the-coordinator-sweep-does-not-start-a-process-for-each-running-job-every-half-second` (🟢 PROVEN): The coordinator sweep does not start a process for each running job every half second; landed 2026-10-13
- `F935-a-real-group-shows-as-one-tree-on-the-live-picture` (🟢 PROVEN): A real group shows as one tree on the live picture; landed 2026-10-09
- `F934-live-records-panel` (🟢 PROVEN): A live job on the picture opens in the side panel and shows its workers and its group; landed 2026-10-09
- `F933-quiet-mark-waits-longer-during-tests` (🟢 PROVEN): The quiet mark waits longer while a job runs a long test; landed 2026-10-08
- `F932-live-picture-activity` (🟢 PROVEN): The picture shows what each running job is doing now; landed 2026-10-08
- `F931-optchat-prompt-cache-compare` (🟢 PROVEN): The OptChat explainer shows what the prompt cache reads and what is paid in full, for a typical thread and for OptChat; landed 2026-10-07
- `F930-optchat-vs-typical-context` (🟢 PROVEN): The OptChat explainer shows plainly how OptChat differs from typical context management; landed 2026-10-07
- `F929-biome-enforces-readable-code-and-the-styleguide-says-the-same` (🟢 PROVEN): Biome enforces readable code and the styleguide says the same; landed 2026-10-06
- `F927-test-reset-build` (🟢 PROVEN): Limen's tests are rebuilt from scratch and held under a 3,500-line cap; landed 2026-10-06
- 2026-10: 49 landed. spec/features/done/2026-10/
- 2026-09: 70 landed. spec/features/done/2026-09/
- 2026-08: 43 landed. spec/features/done/2026-08/
