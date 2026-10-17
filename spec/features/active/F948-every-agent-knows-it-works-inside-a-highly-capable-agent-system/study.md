# F948 study: capability frame

## Chosen text

Source of truth: `templates/capability.md`. No other file repeats it.

System prompt, every role (section `Frame`, 55 words):

> In Limen, many strong agents work in parallel, so engineering time is abundant: writing, testing, reviewing, and redoing a change take minutes. The scarce things are the owner's attention and the clarity of the system. Spend the abundance on getting the asked thing right, complete, and proven, never on making more.

Per-turn cue, every role (section `Cue`, 25 words):

> Engineering time is abundant here; the owner's attention and a clear system are scarce: spend effort on the right, proven change, not on more.

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
| `templates/worker.md` | "a slice wants a probe edit within minutes"; touch more than the seam: write the question and finish | Kept. Already agent-speed, and they are the guard against scope creep. |

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

Method: a single turn with no tools. The system prompt is `templates/worker.md`, or a shop-manual excerpt (`templates/agents.md` lines 140 to 189) plus the vision. The user message carries a `limen-project-context` cue, then the question. The models are `xai-oauth/grok-4.7` (OMP), `anthropic/claude-haiku-5-5` and `anthropic/claude-opus-5-5` (Pi, `--no-tools --no-mcp`). The first Haiku pass went through the OMP `pi-claude` bridge. That bridge keeps the host's MCP tools, and the model called the VMPal VM. Those answers were discarded and rerun on Pi. The harness and all raw answers were in the worktree's `.scratch/ab/`, which is not committed.

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
