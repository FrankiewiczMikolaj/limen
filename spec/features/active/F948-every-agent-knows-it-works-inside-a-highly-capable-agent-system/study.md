# F948 study: capability frame

## Goal, corrected

The owner corrected the goal after the first A/B. The frame exists to make agents decide with courage: pick the proper design, do the real fix, and make the engineering call, in place of a patch with a follow-up, "map the seams first", or a question to the owner. It must still not widen scope past the asked outcome. The first A/B scored estimates in agent time, and it read "no model said let us do it now" as a win. Against the corrected goal, that result is partly a miss. The section "Decisiveness A/B" below scores the corrected goal.

## Chosen text

Source of truth: `templates/capability.md`. No other file repeats it.

System prompt, every role (section `Frame`, 59 words, candidate D5):

> In Limen, many strong agents work in parallel, so engineering time is abundant: writing, testing, reviewing, and redoing a change take minutes. The owner's attention and the clarity of the system are scarce. Spend the time, not the attention: make the engineering decision yourself, choose the proper design over the patch, and prove it. Keep to the asked outcome.

Per-turn cue, every role (section `Cue`, 27 words):

> Engineering time is abundant and the owner's attention is scarce: decide yourself, choose the proper design over the patch, prove it, and keep to the asked outcome.

The first shipped text (C5) is in the table "Candidates" below.

## Placement

The decision is (c): the frame goes once in the system prompt, and the one-sentence recall goes in the per-turn cue. Both come from one package file, and `hook/communication.ts` injects them.

- **One seam for both engines and all roles.** Coordinators load `hook/communication.ts` through `templates/limen-extension.ts`. Jobs load it through `src/runtime/wrapper.ts` (detached) and `src/runtime/supervisor.ts` (hosted). The same file runs on Pi and on OMP.
- **Not in the register.** The register (`templates/communication.md`) also rides every role. But a project file `.agents/limen/communication.md` replaces it, and eight of the owner's projects have one (`mega-dev` and its worktrees, `mega-experience`, `playground/easy`). The frame describes Limen, not project speech. So it is package-only and has no project override.
- **Not in each role preamble.** Ten copies, each one replaceable by a project file.
- **System prompt.** The frame is the first part of the Limen block, before the shop manual. It is stable text, so the cached prefix stays the same from one call to the next. The board digest is still last, so a change to NOW or NEXT still breaks only the end of the block. Cost: about 70 tokens, cached after the first call.
- **Per-turn cue.** The `before_agent_start` hook already returns a hidden `limen-project-context` message on each prompt, and the language reminder rides that message. The message is added after the history, so it does not change any cached prefix. Cost: about 32 tokens for each user prompt or wake. A job gets it once with its task. A coordinator gets it on each human turn, and that is where attention decays in long sessions.
- **Rejected: an injection into every tool result.** A job makes hundreds of tool calls, so the cost is about 32 tokens for each call. The text would sit inside data that the model parses, and identical repeats turn into noise. The A/B also shows that the short recall alone does almost nothing (see below), so more repeats of it buy little.

## Human-timescale lines found

| Where | Line | Action |
|---|---|---|
| `templates/agents.md` handoff paragraph | "effort calibration when it matters" | Rewritten: "the expected size of the change". Size is a fact; effort in human hours is the wrong unit. |
| `templates/agents.md` own hands or a worker | "A dig past about five minutes becomes a survey job." | Kept, with the reason added: "inline time is the owner's wait, and a job runs in parallel". Without the reason, the frame ("time is abundant") could push long digs inline. |
| `templates/agents.md` same paragraph | "Spawn when the work outlives one sitting" | Kept. "Should run while the conversation continues" already carries the parallel reason. |
| `templates/reviewer.md` | "One full proof at most." | Kept. It limits review spend on slow native lanes; it does not assume human time. |
| `templates/agents.md` step 5, research | "Review is a cost paid for expensive mistakes"; "A fan-out is spend the human authorizes" | Kept. They agree with the frame: capacity does not authorize more output. |
| `templates/worker.md` | "a slice wants a probe edit within minutes" | Kept. Already agent-speed. |
| `templates/worker.md` | "If the slice would touch more than the seam the handoff names, commit what is useful, write the question to a plain file, and finish." | Rewritten in the follow-up: "The named seam is where you start, not a fence. Change any file the proper fix for the asked outcome needs. If the fix would change behavior the ticket does not ask for, commit what is useful, write the question to a plain file, and finish." Opus and Haiku quoted the old line as the reason to patch and file a follow-up. The scope fence is now behavior, not files. |

## Candidates

| | Text (system; cue) | Targets |
|---|---|---|
| C1 | "You are one of many strong agents that Limen runs in parallel; together they write, test, review, and fix in minutes what takes a human team days. Judge cost on that scale: the correct fix, the clean design, and real proof are cheap here, so do them fully rather than patch around them. Code is cheap and the owner's attention is not: more code is not more value, so build only what the outcome needs." ; "Many strong agents work here in parallel: the correct, complete, proven change is cheap; extra scope and the owner's attention are not." | Identity, minutes against days, cost recalibration, anti-patch, anti-bloat. |
| C2 | "Calibrate every judgment to this system, not to a human team: many capable agents work in parallel, and a rewrite, a test, or a review takes minutes. What a human team would call too big, too slow, or not worth it is often cheap here, so prefer the proper design and real evidence over the shortcut. That capacity buys quality, not size: the best change is often smaller, and the owner's attention is the resource to spend with care." ; "Calibrate to this system, not a human team: proper fixes and proof are cheap here; size and the owner's attention are not." | Explicit unlearning of human heuristics ("too big", "not worth it"). |
| C3 | One sentence for both: "You work among many fast, capable agents in parallel, where code, tests, and reviews are cheap and the owner's attention is not: do the right thing completely and cleanly, prove it, and build nothing the outcome does not need." | Tests if one sentence does it all. |
| C4 | "This is a high-capacity agent system: parallel agents write, test, review, and repair in minutes. Hold the bar of a team with unlimited senior engineering time and one busy owner: choose the correct fix over the convenient one, prove it, and delete what does not earn its place. Capacity is never a reason to widen scope." ; "Unlimited senior time, one busy owner: the correct fix, proven, and nothing beyond the ask." | Quality bar through a persona, subtraction, explicit scope fence. |
| C5 (chosen) | See "Chosen text". | Scarcity economics: what is abundant and what is scarce. Anchors effort to "the asked thing". "Never on making more". |
| C6 | "You are one of many strong agents that Limen runs in parallel. Writing, testing, reviewing and redoing a change takes minutes, so engineering time is abundant; the owner's attention and the clarity of the system are scarce. Spend that time on the correct, complete, proven change, not on a bigger one." ; "Engineering time is abundant here and the owner's attention is scarce: make the correct, complete, proven change, not a bigger one." | C5 with an identity opening, "correct" in place of "asked". |

## A/B

Method: a single turn with no tools. The system prompt is `templates/worker.md`, or a shop-manual excerpt (`templates/agents.md` lines 140 to 189) plus the vision. The user message carries a `limen-project-context` cue, then the question. The models are `xai-oauth/grok-4.7` (OMP), `anthropic/claude-haiku-5-5` and `anthropic/claude-opus-5-5` (Pi, `--no-tools --no-mcp`). The first Haiku pass went through the OMP `pi-claude` bridge. That bridge keeps the host's MCP tools, and the model called the VMPal VM. Those answers were discarded and rerun on Pi. The harness (`harness.py`) and every raw answer (`<model>-<prompt>-<variant>[-sN].txt`) are outside Git, in `.limen/jobs/2026-10-17-capability-awareness-framing-5fb4772d/ab/` under the plant root.

Prompts:

- P1, coordinator: "Labels are cut mid-word". Three files truncate with different widths. Write the handoff.
- P2, worker: the seam is `wrapper.ts`. A is a 4-line fix there. B is one shared `finalState()` for both runtimes.
- P3, coordinator: "How long to split the 1,171-line `hook/wake.ts`, and is it worth it now?"
- P4, worker: 14 tests pin the wake wording, and the test cap has 174 lines of headroom. What happens to the tests?

Results:

- **P3 estimates.** Each cell gives the samples that put the split at two hours or less, out of five (one for Opus).

  | Variant | grok | Haiku | Opus |
  |---|---|---|---|
  | No frame | 0/5 (half a day ×3, half a day to a day, a day) | 0/5 (3 decline to size, a day, half a day to a day) | half a day |
  | C5, system and cue | 4/5 (about 1 h, under 1 h, under 2 h, "minutes") | 2/5 (30 to 60 min, "worker minutes") | about 1 h ("the split itself takes minutes; most of the hour is the review") |
  | C5, system only | 2/5, plus 2 "one sitting" | 2/5 (about 1 h ×2) | — |
  | C5, cue only | 0/5 (half a day ×3, a few hours to a day) | 0/5 (half a day to a day ×2) | — |
  | C6, system and cue | 0/5, plus 3 "a few hours" or "one sitting" (a day ×2) | 3/5 (1 h, 1–2 h, 2 h) | about 1 h ("30 min + 20 min review") |

  Every sample said "not now" or "map the seams first", except the one Haiku C2 sample. No other frame turned the estimate into "so let us do it". Opus with C5 did not say "not now". It said that the split is worth it only if the file holds separate responsibilities, and it proposed a survey first.
- **Scope creep.** C2 caused it on Haiku. In P1 it merged the three label widths into one (a product change nobody asked for) and said "under an hour". In P3 it said "Yes, it's worth doing now". C2 was dropped for this reason. C5 and C6 kept the widths in P1, except one Haiku C6 sample that dropped the second 60-character wake cut as a duplicate. In P3, no C5 or C6 sample proposed to start the split now.
- **P2 patch or design.** grok picked A in all 19 samples (5 each for no frame, C5 and C6, 1 each for C1 to C4): the seam rule wins. Haiku without a frame picked A and noted the duplication in 5 of 5. With C5 it picked B in 1 of 5, and with C6 in 2 of 5. C1, C2 and C4 each picked B in their one sample. C4's B was conditional ("only if `touches` covers it; else write the question"). Opus without the frame picked A and filed the duplication as a follow-up, and it described B as risk: "widens the diff and adds regression risk". With C5, Opus picked A and called the duplication "real debt" for a notes file. With C6, it picked A and named B as the better design: "two writers of final state caused this bug". The frame raises awareness of the better design. It does not override the seam rule.
- **P4 tests.** All variants retired the 14 wording tests and kept the delivered-once checks. With the frame, Opus added "Remove at least as many lines as I add. That headroom isn't an allowance", and C5 on Haiku aimed for no net growth. The frame does not add test bloat, and it pushes slightly toward subtraction.
- **P1 handoffs.** Every variant except Haiku C2 reached the same decision: one word-boundary helper, three sites, widths kept. With the frame, the answers more often named the subtraction (C1: "if the 80 cut never reaches the owner, delete that pass") and the duplicate authority (Opus C6: "three files would keep claiming authority over the same decision"). Opus with C5 sized the job in agent time ("about an hour of agent time"). Without the frame, Opus wrote "about an hour".

Why C5 won over C6: grok recalibrated in 4 of 5 samples with C5 against 0 of 5 with C6, and Haiku was close (2 against 3). "The asked thing" is a fence against scope creep. "Never on making more" names bloat directly.

Limits: the answers are single-turn, the samples are small, and the reading is by eye. Attention decay over a long coordinator session was not measured. The per-turn recall is there for that case, and a live coordinator session is the check.

Live check of the shipped hook: `pi` (Haiku) and `omp` (grok) each loaded `hook/communication.ts` with `LIMEN_PACKAGE` set to this branch. Each quoted the first frame sentence from its system prompt and the cue as the first line of its `limen-project-context` note.

## Decisiveness A/B

Method: the same harness as above (single turn, no tools, the same system prompts and cue placement, grok on OMP, Haiku and Opus on Pi with `--no-tools --no-mcp`). Samples per cell: grok 4, Haiku 4, Opus 2 on P2, P3, P5 and P6; half that on P1 and P4. The harness (`harness.py`) and every raw answer (`raw/<model>-<prompt>-<variant>[-sN].txt`) are outside Git, in `.limen/jobs/2026-10-17-f948-follow-up-decisive-courageo-90dc641a/ab/` under the plant root. Scores come from a regex pass, and the P1, P5 and P6 labels were then read by eye.

Two new prompts test decisiveness:

- P5, worker: the ticket asks that `limen jobs` show each running job's age. Two designs work (compute from `started-at`, or a pulse writes an `elapsed` file). The ticket does not choose. The Herdr footer also lists jobs, but the ticket names only `limen jobs`.
- P6, coordinator: the owner wants a failed job's wake to say why. Two designs work (quote the last log error line, or the worker writes a `reason` file). "Reply to the owner: what happens now."

New candidates (system; cue):

| | Text |
|---|---|
| D1 | C5's first two sentences, then "So make the engineering call yourself: choose the proper design, do the real fix, and prove it. Do not spend the owner's attention on a question, a deferral, or anything beyond the asked outcome." ; "Engineering time is abundant and the owner's attention is scarce: make the call, do the proper fix, prove it, and add nothing beyond the ask." |
| D2 | "…a wrong engineering call is cheap to fix, and a deferred one costs the owner's attention… Ask only for a product decision, and build nothing beyond the asked outcome." ; "A wrong call costs minutes; a deferred one costs the owner. Decide, do the proper fix, prove it, and stay inside the ask." |
| D3 | "Habits that save a human team's time cost more than they save here: the patch with a follow-up, the survey before the fix, the question about an engineering choice… Scope is the asked outcome, not the named files: add no behavior the owner did not ask for." ; "The proper fix takes minutes here: decide, do it, prove it. Scope is the asked outcome, not the named files." |
| D4 | "In Limen, many strong agents work in parallel, so engineering time is abundant and the owner's attention is scarce. Spend the time, not the attention: make the engineering decision yourself, choose the proper design over the patch, and prove it. Keep to the asked outcome." ; "Spend engineering time, not the owner's attention: decide, do the proper fix, prove it, keep to the asked outcome." |
| D5 (chosen) | D4 with C5's time-scale sentence restored. See "Chosen text". |
| D6 | D1 with "choose the proper design over the patch". |

A variant with `M` also has the rewritten `worker.md` seam line. It applies only to the worker prompts (P2, P4, P5).

Results:

| Variant | P2: shared `finalState()`, of 10 | P3: defers or asks, of 10 | P6: decides / asks / status only | P1: width changed, of 5 |
|---|---|---|---|---|
| No frame | 0 | 5 | 5 / 2 / 3 | 0 |
| No frame, M | 5 (Haiku 3, Opus 2) | — | — | — |
| C5 | 0 | 2 | 3 / 4 / 3 | 0 |
| C5, M | 6 (Haiku 4, Opus 2) | — | — | — |
| D1 | 6 (grok 0) | 0 | 9 / 0 / 0 (one timeout) | 1 |
| D2 | 6 (grok 0) | 0 | 9 / 0 / 0 (one timeout) | 2 |
| D3 | 6 (grok 0) | 2 | 10 / 0 / 0 | 0 |
| D4 | 10 | 3 | 10 / 0 / 0 | 1 |
| D5 | 10 | 0 | 10 / 0 / 0 | 1 |
| D6 | 10 | 1 | 10 / 0 / 0 | 1 |
| D1, D4, D5, D6 with M | 10 each | — | — | — |

- **P2, proper design.** Without a frame or with C5, every model patched `wrapper.ts` and filed the duplicate final-state writer as a follow-up. Opus and Haiku cited the seam rule ("my rules say a change beyond the named seam becomes a written question"). Only the frames that name "the proper design over the patch" (D4, D5, D6) moved grok. The seam line alone moved Haiku and Opus, not grok.
- **P3, split `hook/wake.ts`.** No frame: 5 of 10 answers deferred to a survey or asked "want me to?". D5: 0 of 10. Grok said a clear "not now" in every D variant. Haiku and Opus said "yes, now, in parallel" in 5 of 6 D5 answers, with a fresh review for the notification path. That is a decision on the asked question, not new scope.
- **P5, decide between two designs.** Every variant, the baseline too, chose the computed age and left the Herdr footer alone. The prompt does not separate the variants.
- **P6, reply to the owner.** No frame: Haiku asked the owner to pick in 2 of 4, and grok gave status only in 3 of 4. C5 was worse: Haiku asked in 4 of 4. With D3 to D6, all answers decided and said what happens next. Some D5 and D6 answers chose a third design (the supervisor records the stop reason). That stays inside the asked outcome.
- **P4, tests.** Every variant retired the wording tests and kept the delivered-once checks. No test growth.
- **Scope creep, P1.** One answer in five changed a display width for every decisive frame except D3: grok D5 sample 2 proposed one 80-character budget for all three surfaces. No frame and C5 had none. D3 had none, but it also narrowed the fix to the wake path in 4 of 5 answers and left grok patching in P2. No worker answer under `M` touched the footer or other unasked behavior.

Why D5: it is the most decisive candidate (10 of 10 on P2 and P6, no deferral on P3), and its P1 creep rate is the same as every other decisive frame. It keeps C5's time-scale sentence, which moved grok's estimates in the first A/B. D4 is shorter, but it deferred P3 in 3 of 10.

Not shipped: a triage line in `worker.md` ("a choice between designs with the same outcome is yours") and a coordinator line ("a dig past five minutes goes to a slice, not a survey"). The first run scored them together with the seam line and showed no gain over the seam line alone, so they were reverted.

Limits: single turns, small samples, a regex scorer read by eye. The P1 width-change risk is one sample per frame. A live coordinator session is the check. Watch handoffs for changed display budgets.
