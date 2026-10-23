# Team-2 draft proposal: task notes state the end checks and the rule most likely to be missed

This is a proposal only. It changes no Limen code, hook, test, or installed prompt.
Effectiveness is unproven. Two studies of the current note hook found no clear effect on delivery, with low confidence. This text must not be described as an improvement until a later study shows one.

## The one thing the agent must write

For each end check, the agent must write the observable proof that would show it, and must keep every check that has no such proof in a named `Not proven yet` list. A check without a named proof is a task copy. A result without a check it proves is a log. The single line that prevents the most important miss is separate: the one task rule a busy agent is most likely to break while every end check still passes.

In short: **name the proof before the work, name the one rule that can still be broken, and do not clear a check without evidence you can point to.**

## Design choices and tensions

- **Short against complete.** The cap is about six lines and three parts. The note therefore holds end checks, not steps, files read, or context. If a task has more than four true end checks, the agent groups checks that share one proof. It does not drop a binding restriction: a restriction that can fail the work belongs either in a check or in `Easy to miss`.
- **Evidence against a result log.** Evidence enters the note only as a one-line pointer under the check it proves, for example the command and where its output is. The note does not retell numbers, times, or steps. Full results stay in the final message, the job log, or the files the task names. This keeps crossing-off honest without turning the note into a second report.
- **Crossing off against forbidden proof.** A note is not permission to run a forbidden check. If the task bars the only proof, the check stays in `Not proven yet` and the boundary is the `Easy to miss` line. Unknown is not passed.
- **Plan against steering.** A steer that changes scope does not rewrite history. The old line stays, a `changed` line gives the reason, and every affected check returns to `Not proven yet` until new evidence exists.
- **Continued work against inherited proof.** A copied note is a claim by an earlier agent. The continuing agent re-reads it against the current task, keeps what still binds, and moves any check it cannot point to evidence for into `Not proven yet`. It does not inherit a pass.

## Placeholders

These names appear in the proposed strings. They are display placeholders for this proposal, not new runtime code.

- `{JOB_DIR}`: the job folder for this job.
- `{NOTE_PATH}`: `{JOB_DIR}/note.md`.
- `{FIRST_NOTE_PATH}`: `{JOB_DIR}/note.first.md`, the first version of the note.
- `{REMINDERS_PATH}`: the project reminders file, `.agents/limen/reminders.md` beside the project's other Limen guidance.
- `{REMINDERS_TEXT}`: the text of that file, when it exists and is not empty.
- `{NOTE_NOW}`: the current text of `{NOTE_PATH}`.
- `{NOTE_FIRST}`: the text of `{FIRST_NOTE_PATH}`.
- `{CHANGED_LINE}`: the literal line shape `"🟡 changed: ... Reason: ..."`.

## Proposed FORMAT

This replaces the current `FORMAT` string in `src/job/task-note.ts` (the prompt that tells the agent how to write `note.md`).

```text
Format: a nested list in plain technical English. Short, clear sentences. One fact on each line.
Write the note as a plan for the end. It is not a copy of the task and not a log of work done.
Use three parts, in this order, in at most about six lines:
- 🔴 Done means:
  - 🔴 One check a person can run or see, with its proof named after "Proof:". Write two to four checks. Group checks that share one proof.
- 🔴 Easy to miss: the one task rule a busy agent is most likely to break while the Done checks still pass.
- 🔴 Not proven yet: each Done check that has no evidence yet. Name the check, not "everything".
Each Done check states an end state and the exact command, look, file, or output that shows it. Keep an exact command, limit, or restriction only when it defines a check or the Easy-to-miss rule. Do not copy other task sentences. Do not write steps, files you will read, or work already done.
When evidence for a check exists, remove that check from "Not proven yet" and add one short line under its Done check: "  - 🟡 Proof: <where the evidence is>". Give a pointer, not a result summary. Cross off no check without a pointer. Unknown is not passed.
If the task forbids the only proof for a check, keep the check in "Not proven yet" and put the forbidden boundary in "Easy to miss". The note never gives permission to run a forbidden check.
When a point changes, keep its line and add a line under it: "🟡 changed: ... Reason: ...". If a change alters a Done check, put that check back in "Not proven yet" until new evidence exists.
Write "none" after "Not proven yet:" only when every Done check has a Proof pointer.
Example:
- 🔴 Done means:
  - 🔴 A caller who sends a 101st request in one minute for one key gets a refusal. Proof: send 101 requests for one key and see the refusal.
  - 🔴 A caller who sends 100 requests in one minute for one key still succeeds. Proof: send 100 requests for one key and see success.
- 🔴 Easy to miss: the limit counts per key, not per caller.
- 🔴 Not proven yet: both Done checks.
```

What changed from the current FORMAT, and why:

- The current FORMAT sorts lines by weight (🔴, 🟡, ⚪) but does not say what the note must answer. The proposal keeps a nested list and short lines, and replaces the open topic list with the three named parts. The ⚪ marker is dropped from the starting note: an assumption that can change the end belongs in `Easy to miss` or as a check; a minor assumption that cannot change the end does not earn a line in a six-line note. This is a deliberate loss, named here so it is not silent. If Adam wants assumptions kept, the place for one is a single 🟡 line under `Easy to miss`.
- The current rate-limit example shows facts about a feature. The proposed example shows checks and their proofs, so the example itself teaches the shape.
- The current `changed` example is kept in substance: keep the old line, add the dated reason under it. No date or time is required unless it helps, as now.

## Proposed noteStart

This replaces `noteStart` in `src/job/task-note.ts` (sent once, in the first prompt of each job, a continued one too). Text in `[IF ...]` blocks is included only when the condition holds. Limen already tests these conditions; the proposal changes wording, not conditions.

```text
[limen] Before other work, read your note in {NOTE_PATH}, or write it if there is none.
{FORMAT}
[IF the note already exists and describes earlier work, for example work by a predecessor job]
Read it against this task before you act. Keep each line that still binds. Keep the old line and add a "🟡 changed: ... Reason: ..." line under any point this task changes. Move every Done check you cannot point to evidence for into "Not proven yet". Do not treat an earlier agent's Proof pointer as your evidence until you have seen the evidence yourself.
[IF project reminders exist at {REMINDERS_PATH}]
Project reminders ({REMINDERS_PATH}). Keep each 🔴 one as you keep your 🔴 points. A 🔴 reminder that states an end state also belongs in Done means or in Easy to miss; do not leave it only in this list:
{REMINDERS_TEXT}
```

Notes on conditions:

- Missing note: the first line already covers it ("or write it if there is none"). No separate variant is needed, and no separate variant existed.
- Continued job: the current text says only "a continued one too" in a code comment. The proposal makes the continued case explicit in the prompt, because a copied note is the case where inherited results most easily enter as fact. The condition is stated for the agent ("if the note already exists and describes earlier work") rather than as a new runtime test.
- Reminders: the current code includes the reminders path and text only when the file exists and is not empty. That condition and the 🔴 obligation are kept. The proposal adds one sentence: a reminder that defines acceptance must also appear as a check or as the easy-to-miss rule, so the finish check can test it.

## Proposed noteSteer

This replaces `noteSteer` in `src/job/task-note.ts` (added to each steer message). It has two conditional wordings, as the current code does, plus a scope sentence that applies in both.

```text
[IF project reminders exist]
[limen] If this steer changes a Done check, the Easy-to-miss rule, a Not-proven-yet item, or a project reminder, add a line under that point in {NOTE_PATH}: "🟡 changed: ... Reason: ...". Keep the old line. If the steer changes scope, put every affected Done check back in "Not proven yet" until new evidence exists. If the steer changes no point in the note, do not edit the note.
[IF no project reminders exist]
[limen] If this steer changes a Done check, the Easy-to-miss rule, or a Not-proven-yet item, add a line under that point in {NOTE_PATH}: "🟡 changed: ... Reason: ...". Keep the old line. If the steer changes scope, put every affected Done check back in "Not proven yet" until new evidence exists. If the steer changes no point in the note, do not edit the note.
```

What changed: the current text names "a point in your note". The proposal names the three parts, so a steer that changes only the easy-to-miss rule is not missed. "Do not edit the note" for an unrelated steer is new and explicit; it stops steers from growing the note into a log.

## Proposed noteCheck

This replaces `noteCheck` in `src/job/task-note.ts` (sent once, before the finish; it carries the note now, the note at the start when it differs, and the project reminders). Blocks are included only when their condition holds, as the current code does. The final-message instruction differs when the job has the finish tool.

```text
[IF the note exists]
[limen] Your note now:
{NOTE_NOW}
[IF no note exists]
[limen] You wrote no note in {NOTE_PATH}. From memory, list the Done checks, the Easy-to-miss rule, and the checks with no proof, for this job.
[IF the note exists, a first version exists, and the two differ]
Your note at the start:
{NOTE_FIRST}
[IF project reminders exist]
Project reminders:
{REMINDERS_TEXT}
In your final message, under the heading "Note check", give one line for each item below. State only what you can point to evidence for.
- Each Done check: delivered, changed, or dropped, with the reason. Name the Proof pointer for each delivered check. A check still in "Not proven yet" is not delivered; say it is not proven and name what is missing.
- The Easy-to-miss rule: kept or broken, with the evidence you can point to. If you cannot tell, say so; unknown is not kept.
- [IF project reminders exist] Each 🔴 project reminder: delivered, changed, or dropped, with the reason.
- [IF the note at the start is shown above] Each Done check or Easy-to-miss rule that was in the note at the start and is gone now, with no "changed" line under it: name it as dropped and give the reason.
[IF this job has the finish tool]
Then call finish again. Its handoff is that whole final message, with the "Note check".
[IF this job has no finish tool]
End your final message there.
```

What changed and what is kept:

- Kept: the missing-note fallback, the start-note comparison only when it differs, the reminders block only when reminders exist, the `delivered, changed or dropped` verdict with a reason, and the finish-tool sentence only when the job has that tool. No original obligation is dropped.
- The current text asks about each 🔴 point. The proposal asks about each Done check, the one easy-to-miss rule, and each 🔴 reminder, because those are the lines the new FORMAT creates. The start-note comparison gains a purpose: a check that vanished without a `changed` line must be named as dropped, which is the silent-drop case the current text cannot catch.
- "Not proven" is a required answer, not a failure of the format. This answers the ticket requirement that the final proposal states the checks with no evidence.

## The three rewrites

Rules used for all three rewrites, from the brief:

- Each task is shown in exactly three short lines drawn only from its supplied task excerpt in `/Users/overment/Downloads/limen-note-examples-data/examples.json`. The excerpts contain ellipses. No missing text was invented.
- Each old note is the supplied note excerpt from the same source, verbatim, ellipses included.
- Each new note is a plan written before new evidence exists. It claims no result. Every check starts in `Not proven yet`.
- Exact limits and restrictions are kept only where the excerpt states them.

### Example 1: plant limits (a hard boundary)

Task, in three lines:

1. Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants."
2. Do not stop the clocks while a build waits.
3. Do not change the job time limit. …

Old note, verbatim:

```text
…
  - 🟡 Queued cargo call: 74 samples over 240 s, longest idle stretch 0 s. The wrapper forks a new `sleep 1` each second and its CPU rises.
  - 🟡 Control `sleep 300`: flagged stalled at 180.8 s.
  - 🟡 Cargo build-directory lock wait ("Blocking waiting for file lock on build directory"): idle stretch grew for the whole 38 s wait. One child, CPU constant.
  - 🟡 The guess is false for the queue; true for cargo's own lock wait.
…
```

Why this old note fails the proposed shape: it is all evidence with no end state. A reader cannot tell what must be true at the end, which rule could still be broken, or what remains unproven. The measurements belong in the handoff or the evidence file, with a one-line pointer from the check they prove.

New note, as a plan before evidence:

```text
- 🔴 Done means:
  - 🔴 A cargo plant can raise its prepare limit and its tool stall limit, and Limen uses the raised values. Proof: set raised values for a cargo plant and show Limen reading them.
  - 🔴 A waiting build does not stop either clock, and the job time limit is unchanged. Proof: show both clocks still running during a wait, and show the job limit value before and after.
- 🔴 Easy to miss: raising the limits by stopping the clocks while a build waits, or by changing the job time limit. Both are forbidden.
- 🔴 Not proven yet: both Done checks.
```

Note on this rewrite: the excerpt does not state where the plant setting lives or what values to choose. The new note does not invent them. In a real job the agent would read the full task in its job folder and replace "a cargo plant can raise" with the exact setting the full task names, before other work.

### Example 3: trusted rows (a reviewer trust rule)

Task, in three lines:

1. … the composer draws trusted setting, App and conversation rows …
2. Only host code can give Compose the `setting`, `app` and `thread` resolver.
3. Show every place that sets it. …

Old note, verbatim:

```text
…
- 🔴 Verdict: PASS. No blocking finding.
…
  - 🟡 Both gates refuse setting, app, thread, approval at root and nested. Scratch probe proved it, then was deleted.
  - 🟡 No permanent test sends a forged approval through either gate. Reported as a note.
  - 🟡 Thread rows inside a message now resolve. No producer emits them there today. Reported as a note.
  - 🟡 Focused vitest: 9 files, 347 tests passed. Scratch probe: 5 passed.
…
```

Why this old note fails the proposed shape: the verdict and the test counts are results. They answer "what happened", not "what must be true and how would a person see it". The two gaps it found (no permanent forged-approval test; thread rows resolving inside a message) are the valuable lines, and in the old note they sit as asides under a verdict.

New note, as a plan before evidence:

```text
- 🔴 Done means:
  - 🔴 Every place that sets the `setting`, `app`, or `thread` resolver is host code, and the list is complete. Proof: show the search that finds every setter and name each place.
  - 🔴 No non-host source (a generated tree, an App tree, a message body, Markdown) can set, inherit, or reach that resolver. Proof: show a forged attempt from each such source failing to reach it.
- 🔴 Easy to miss: reporting PASS from the places that set the resolver, without showing that no other place can reach it. The task asks for every place, not the expected places.
- 🔴 Not proven yet: both Done checks.
```

Note on this rewrite: the excerpt names only the resolver-origin check. A real reviewer note would add one Done check per further check in the full task, grouped by shared proof, and would keep the review boundaries (for example read-only limits) in `Easy to miss` if that is the rule most likely to be broken. This rewrite does not invent those checks from the cut-off text.

### Example 8: continued mixing-trap design (a continued task)

Task, in three lines:

1. … Record these as decided in the doc and the ADR draft.
2. … (1) re-run the video-first chain cases offline with the VIDEO receipt issued first, so the 8/10 result is confirmed or corrected;
3. report the new numbers; …

Old note, verbatim:

```text
…
  - 🟡 Chain: labelled 18/18 right; unlabelled 6/6 crossed (all Haiku). The old 8/10 holds; the receipt flaw did not cause it.
  - 🟡 Extra cell (list video first, work audio first): Sonnet, Haiku, GPT write audio first (12/12); Opus writes video first (4/4). 16/16 right.
  - 🟡 So video first catches an unlabelled hand-off only when the harness works in list order. Live QA must check the work order.
…
  - 🟡 No independent review of this round. Self-check only.
```

Why this old note fails the proposed shape: it is a results ledger for a continued job. The numbers may be true, but they are the predecessor's claims carried forward, and no line says what this round must prove again or what limit survives (video first helps only when the harness works in list order; live QA must check the work order). Under the proposed noteStart, a continuing agent must move inherited numbers out of the note and into a pointer, and must re-prove or mark unproven.

New note, as a plan before evidence (written at the start of the continued round):

```text
- 🔴 Done means:
  - 🔴 The doc and the ADR draft record the decisions named in this task as decided. Proof: show the decided wording in both files.
  - 🔴 The video-first chain cases are re-run offline with the VIDEO receipt issued first, and the new numbers confirm or correct the old 8/10. Proof: show the re-run output with the VIDEO receipt first and state the new numbers beside the old 8/10.
- 🔴 Easy to miss: treating the earlier 8/10, or the earlier chain numbers in the copied note, as this round's result. This round's re-run must issue the VIDEO receipt first; a re-run in the old order proves nothing about the flaw.
- 🔴 Not proven yet: both Done checks.
```

Note on this rewrite: the old note's limit (video first catches an unlabelled hand-off only when the harness works in list order) is a candidate `Easy to miss` line for a later implementation round. It is not used here because, for this round, the easier miss is re-running in the wrong receipt order and reporting the old number as confirmed. Only one rule earns the line; the other belongs in the work's own documents, not the note.

## What this proposal preserves from the current prompt

- Project reminders ride in `noteStart` and again in `noteCheck`, only when the file exists and is not empty, and each 🔴 reminder must be answered at the finish.
- A steering message can change the note only through a kept old line plus a `changed` line with a reason.
- A continued job gets the note instruction in its first prompt, and now also gets told how to treat a predecessor's note.
- A missing note is named as missing; the agent must reconstruct the checks from memory at the finish, and reconstruction is not evidence.
- When the start note differs, both versions reach the finish check, and a silently dropped check must be named.
- The finish-tool sentence appears only when the job has the finish tool.
- Unknown is never passed: not for a check, not for the easy-to-miss rule, not for a reminder.

## What this proposal does not do

- It does not change any code, condition, file name, or timing in `src/job/task-note.ts`. Only the four strings change, if Adam approves.
- It proposes no runtime parsing of the note, no gate, and no new state. Limen still copies, logs, and shows the note without parsing it.
- It claims no delivery benefit. The two studies behind this ticket found no clear effect of the current hook, with low confidence, and parts of their data cannot be compared (cost counters changed meaning between the sets). The honest claim is narrower: the current notes demonstrably contain task copies and result logs (examples 2 and 4 in the supplied set are final notes that still list commands to run), and this shape names the line those notes lack.
- It does not resolve the ⚪ question. Dropping the minor/assumption marker from the starting shape is the proposal's clearest loss. The critique round should attack it.

## Open questions for critique

- Does grouping checks that share one proof hide a check that needs its own proof?
- Does the one-line Proof pointer give a reviewer enough to trust a crossed-off check, or does it push all trust into the final message?
- Is one `Easy to miss` line enough when a task has two independent hard boundaries, as example 1 does (no stopped clocks; no changed job limit)? This draft folds both into one line; that may be the first thing to revise.
- Should `Not proven yet` name checks by copying their first words, which risks task-copy drift, or by short labels the agent invents, which risks vagueness?
