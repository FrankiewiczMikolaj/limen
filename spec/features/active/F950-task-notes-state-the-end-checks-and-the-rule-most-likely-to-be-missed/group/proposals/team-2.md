# Team-2 revised proposal: task notes state the end checks and the rule most likely to be missed

This revision replaces the team-2 draft. It is a proposal only. It changes no Limen code, hook, test, or installed prompt.
Effectiveness is unproven. Two studies of the current note hook found no clear effect on delivery, with low confidence. This text must not be described as an improvement until a later study shows one.

## The one thing the agent must write

For each end check, the agent must write how a person could repeat it, and must keep every check that has no evidence in a named `Not proven yet` line. A check without a named way to show it is a task copy. A result without a check it proves is a log. The single line that prevents the most important miss is separate: the one task rule a busy agent is most likely to break while every end check still passes, and it stays in `Not proven yet` until it has evidence of its own.

In short: **name how each check is shown before the work, name the one rule that can still be broken, and clear neither without evidence you can point to.**

## What this revision changed, and why

Accepted from the critiques. Each item names who proved it.

- **One word, one thing.** The draft used `Proof:` for the planned way to show a check and for the evidence pointer after the work. Team-3 proved the collision. The plan now says `Shown by:` and the evidence record says `Seen:`. (Team-3, point 1.)
- **`Not proven yet` now names each check.** The draft's examples wrote "both Done checks", which its own FORMAT forbade. The list is now one line that names each unproven check and the rule, by short name. (Team-3, point 2.)
- **No invented runtime condition.** The draft presented the continued-job block as a condition Limen tests. It does not: `noteStart` reads only the reminders (`src/job/task-note.ts` lines 24-32). That text is now a plain paragraph sent on every first prompt, written so the agent applies it only when a note already exists. No code condition is proposed. (Team-1; team-3, point 3.)
- **The finish sentence is tied to the call path, not to having the tool.** The draft conditioned it on "this job has the finish tool". Every job with the finish hook registers that tool (`hook/finish.ts` line 55); the check answers `check(true)` from a `finish` call (line 65) and `check(false)` from a settle turn (lines 86, 94). The variant is now labelled by which path sent the check. (Team-3, point 4.)
- **The examples use only the excerpt on Adam's page.** The draft's example 3 named sources and actions from the full record behind the ellipses, and example 1 used the full record's plant setting. Both are rewritten from the three task lines shown. No word in a new note now needs the record behind the cut. (Team-1; team-3, point 5.)
- **Example 1 splits its two rules.** The clock rule and the job-time-limit rule are now separate Done checks, and only the clock rule is `Easy to miss`, because pausing a waiting build's clocks is the quick fix the task forbids. The job limit is a check, not half of the rule line. (Team-1; team-3, point 6.)
- **No check groups two rules.** The draft allowed grouping checks that share one proof, and its example 8 grouped the rerun, the receipt order, and the numbers. Grouping is now banned for distinct rules. Each rule gets its own check and its own name in `Not proven yet`. (Team-2's own critique of team-1's merged lines, applied at home; team-3 on example 8.)
- **`Easy to miss` needs its own evidence.** The draft let a writer claim "Not proven yet: none" while the rule had no evidence. The rule now sits in `Not proven yet` until it has a `Seen:` line, and the finish check marks it kept, broken, or not proven. This takes team-1's rule, which both other critiques kept. (Team-1.)
- **Two original FORMAT sentences are back.** The draft dropped "Put detail under its main point" and "Add a time only when it helps" while claiming that no obligation was dropped. Both sentences are restored word for word. (Team-1.)
- **A carried result line is sorted, not deleted.** The draft told a continued agent to move inherited numbers out. This revision takes team-1's classification, which team-3 also kept: a line that says what a later check must do is a restriction and stays as a check or as the rule; a line that only says what happened does not carry its numbers into this note, but if it reveals a gap or a limit that still binds, that gap or limit is written as a check or as the rule. Blanket deletion could remove a finding that still binds. (Team-1; team-3, kept item 7.)
- **Reminders are not copied into the note.** The draft made a 🔴 reminder that states an end state also appear in the note. The finish check already shows the reminders and asks about each one; a copied reminder would be counted twice and could take the task rule's one slot. (Team-3, point 7.)
- **The FORMAT example now shows a `changed` line**, with values that change (a refusal at the 101st request, changed to the 61st). The draft claimed the changed example was kept in substance and showed none. (Team-3, point 8.)
- **An assumption that can change a result is a check.** The draft dropped the ⚪ marker and left that risk open, as its own critique of team-1 showed. Now any assumption that could change whether a check passes becomes a Done check or the rule line, and stays in `Not proven yet`. A minor assumption that cannot change a check earns no line. The ⚪ loss is still deliberate and still named.

## What this revision rejected, and why

- **Team-3's tick as the only not-proven state.** One list does avoid drift. But a tick reads as "done", as team-3 itself names, and after context is summarized a tick with a short pointer is hard to tell from a pass someone asserted. The brief also asks for three visible parts, and the finish check reads the `Not proven yet` list. The drift cost is met instead by one `Not proven yet` line with short names, and by a steer rule that edits the check and its name in the same edit. One state per fact is kept where it matters: the name is a label, not a second statement of the check.
- **Team-3's pointer check for a long acceptance list.** One line that points at the task's list keeps the note short by keeping the checks out of it, and its finish check expands the list only at the end. A missed item would surface after the work. This revision gives way on line count instead: a binding check is never dropped and never hidden behind a pointer.
- **Team-3's task-file reconstruction when no note exists.** The task file is on disk, and team-3's code claim is correct (`src/job/publication.ts` writes `task.md` for each published job). But the current finish text says "From memory", the current test matches that text (`test/u14-task-note.test.ts`), and the finish check is a report on the work, not a fresh reading assignment. Keeping the current sentence also keeps this proposal to wording inside the four strings, with no new placeholder. The cost is named in team-3's critique and accepted.
- **Team-1's Open lines as full duplicate checks.** This revision keeps team-1's idea that the rule has its own unproven life, but not its second full copy of every check, for the drift and double-counting reasons in team-2's critique.
- **Team-1's instruction to delete predecessor result lines.** See the classification rule above.
- **Any sentence inviting proof runs at the finish.** Team-3's "you may still prove an open check now" is not taken, and nothing like it is added. A run-once task can be breached by a finish-time run that the task otherwise allows.
- **A stock command in the FORMAT example.** Team-3's example carries "`npm test` passes". The example here names a repeatable act for its own two checks and nothing else, so no agent copies a command the task did not name.

## Tensions, restated

- **Short against complete.** The starting aim is about six lines: two to four Done lines, one rule line, one `Not proven yet` line, plus a `Seen:` or `changed:` subline when one exists. If a task binds more than four end checks, the count gives way. A binding check is never dropped, merged into another rule, or left behind a pointer to fit the aim.
- **Evidence against a result log.** Evidence enters the note only as `Seen: <where the evidence is>`, one line under the check it clears. No numbers, counts, verdicts, or steps. Those belong in the final message, the job log, or the files the task names.
- **Crossing off against forbidden proof.** A check stays in `Not proven yet` if the task forbids the only way to show it. The note is never permission to run a forbidden check.
- **Markers.** 🔴 marks each point that must be delivered or kept, which is every point line in the three parts; the parts differ by their labels, not by marker. Under a point, 🟡 marks a record line only, and the record says which kind it is: `Seen:` or `changed:`. These meanings govern `note.md`; the reminders file keeps its own markers and is never rewritten by this format. The ⚪ marker is gone from the note, under the assumption rule above.

## Placeholders

These names appear in the proposed strings. They are display placeholders for this proposal, not new runtime code.

- `{NOTE_PATH}`: the job folder's `note.md` (`join(jobDir, "note.md")` in the current code).
- `{FIRST_NOTE_PATH}`: the job folder's `note.first.md`.
- `{REMINDERS_PATH}`: the path `projectReminders` returns for `.agents/limen/reminders.md`.
- `{REMINDERS_TEXT}`: that file's trimmed text, when the file exists and is not empty.
- `{NOTE_NOW}`: the current note text, trimmed.
- `{NOTE_FIRST}`: the first note text, trimmed.

## Proposed FORMAT

This replaces the current `FORMAT` string in `src/job/task-note.ts`.

```text
Format: a nested list in plain technical English. Short, clear sentences. One fact on each line.
Put detail under its main point. Add a time only when it helps.
Write the note as a plan for the end. It is not a copy of the task and not a log of work done.
Use three parts, in this order:
- 🔴 Done means: <one end state a person can run or see>. Shown by: <the exact command, look, file, or output that shows it>.
- 🔴 <one end state>. Shown by: <how it is shown>.
Write two to four Done checks, one rule in each. If the task binds more than four end checks, write them all: the line count gives way, a binding check does not.
- 🔴 Easy to miss: <the one task rule a busy agent is most likely to break while the Done checks still pass>.
- 🔴 Not proven yet: <the short name of each Done check with no evidence>; <the short name of the Easy-to-miss rule>. Name each one. Do not write "both" or "everything".
Keep an exact command, limit, or restriction only when it defines a check or the Easy-to-miss rule. Do not copy other task sentences. Do not write steps or work already done.
🔴 marks a point that must be delivered or kept. Under a point, 🟡 marks a record line only: "Seen:" for evidence, "changed:" for a change. An assumption that could change whether a check passes is a Done check or the Easy-to-miss rule. There is no other assumption line.
When you can point to evidence for a check, remove its name from "Not proven yet" and add under its Done line: "  - 🟡 Seen: <where the evidence is>". Give a pointer, not a result. Do the same under Easy to miss when you can point to evidence that the rule held. Clear nothing without a Seen line. Unknown is not passed.
Write "Not proven yet: none" only when every Done check and Easy to miss has a Seen line.
If the task forbids the only way to show a check, keep its name in "Not proven yet". This note never gives permission to run a forbidden check.
When a point changes, keep its line and add under it: "  - 🟡 changed: ... Reason: ...". Change its name in "Not proven yet" in the same edit. If the change makes an old Seen line stale, remove that Seen line and put the name back in "Not proven yet".
Example:
- 🔴 Done means: a caller who sends a 101st request in one minute for one key gets a refusal. Shown by: send 101 requests for one key and see the refusal.
  - 🟡 changed: the 61st request gets a refusal. Reason: the owner steered.
- 🔴 A caller who sends 100 requests in one minute for one key still succeeds. Shown by: send 100 requests for one key and see success.
- 🔴 Easy to miss: the limit counts per key, not per caller.
- 🔴 Not proven yet: refusal at the limit; success under the limit; the limit counts per key.
```

## Proposed noteStart

This replaces `noteStart` in `src/job/task-note.ts` (added once, to the first prompt of each job, a continued one too). The reminders block is included only when the reminders file exists and is not empty, as the current code does. Every other line is always sent. No new runtime condition is proposed; the continued-job paragraph is prose that the agent applies when it finds an existing note.

```text
[limen] Before other work, read your note in {NOTE_PATH}, or write it if there is none.
{FORMAT}
If a note already exists, read it against this task before you act. Keep each line that still binds. A line that says what a later check must do is a restriction: keep it as a Done check or as Easy to miss. A line that only says what already happened is a result: do not carry its numbers or its verdict into this note, but if it reveals a gap or a limit that still binds, write that gap or limit as a Done check or as Easy to miss. Keep the old line and add a "🟡 changed: ... Reason: ..." line under any point this task changes. Do not treat an earlier agent's Seen line as your evidence until you have seen the evidence yourself. Every check you have not seen evidence for stays in Not proven yet.
[reminders exist] Project reminders ({REMINDERS_PATH}). Keep each 🔴 one as you keep your 🔴 points:
[reminders exist] {REMINDERS_TEXT}
```

The last two lines above are the reminders variant. With no reminders file, the string ends after the continued-job paragraph, and the word "reminders" does not appear in it.

## Proposed noteSteer

This replaces `noteSteer` in `src/job/task-note.ts` (added to each steer message). The subject differs when project reminders exist, as in the current code.

```text
[with reminders] [limen] If this steer changes a Done check, the Easy-to-miss rule, its name in Not proven yet, or a project reminder, add a line under that point in {NOTE_PATH}: "🟡 changed: ... Reason: ...".
[no reminders] [limen] If this steer changes a Done check, the Easy-to-miss rule, or its name in Not proven yet, add a line under that point in {NOTE_PATH}: "🟡 changed: ... Reason: ...".
[both] Keep the old line. Change the check and its name in Not proven yet in the same edit. If the steer changes scope, remove the Seen line of each check it makes stale and put that check's name back in Not proven yet. If the steer changes no point in the note, do not edit the note.
```

## Proposed noteCheck

This replaces `noteCheck` in `src/job/task-note.ts` (sent once, before the finish). Blocks are included only when their stated condition holds, matching the tests the current code already makes: the note text is not empty; a first note exists and differs; reminders exist and are not empty. The last block depends on which path sent the check: a `finish` call, or the extra turn before a detached run settles.

```text
[note exists] [limen] Your note now:
[note exists] {NOTE_NOW}
[no note] [limen] You wrote no note in {NOTE_PATH}. From memory, list the 🔴 points of this job.
[first exists and differs] Your note at the start:
[first exists and differs] {NOTE_FIRST}
[reminders exist] Project reminders:
[reminders exist] {REMINDERS_TEXT}
[no reminders] In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
[reminders exist] In your final message, under the heading "Note check", mark each 🔴 point and each 🔴 project reminder delivered, changed or dropped, and give the reason.
Then add these marks, one line each:
- Each check still named in Not proven yet: mark it not proven, and name what is missing. Not proven is not delivered. Unknown is not passed.
- Each delivered Done check: name its Seen pointer. A delivered mark with no pointer you can name is not proven.
- The Easy-to-miss rule: mark it kept, broken, or not proven. Name the evidence you can point to. If you cannot tell, mark it not proven.
- [first note shown] Each point in the note at the start that is gone now and has no "changed" line under it: mark it dropped, and give the reason.
Do not run a check now to change a mark. Report the state the work reached. A check the task forbids stays not proven.
[this check answers a finish call] Then call finish again. Its handoff is that whole final message, with the "Note check".
[this check is the extra turn before a run settles] End your final message there.
```

Kept from the current text, deliberately: "From memory" for a missing note; "Your note at the start:" only when a first note differs; the reminders block only when reminders exist; the first mark sentence, including its reminders wording; and the finish sentence only when the check answers a `finish` call. Changing any of these strings later costs a test change in `test/u14-task-note.test.ts`, which matches several of them. That cost belongs to the implementation decision, not to this proposal, and it is why the kept strings stay kept.

## The three rewrites

Rules for all three, restated after the critiques:

- Each task is shown in exactly three short lines drawn only from its supplied task excerpt in `/Users/overment/Downloads/limen-note-examples-data/examples.json`. The excerpts contain ellipses. No missing text was invented, and no word from the full record behind an ellipsis appears in a new note.
- Each old note is that source's `note` excerpt, verbatim, ellipses included.
- Each new note is a plan written before new evidence exists. It claims no result. Every check and the rule start in `Not proven yet`, named one by one.

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
- 🔴 Done means: the prepare limit for cargo plants is raised. Shown by: the raised prepare value Limen uses for a cargo plant.
- 🔴 The tool stall limit for cargo plants is raised. Shown by: the raised tool stall value Limen uses for a cargo plant.
- 🔴 The job time limit is unchanged. Shown by: the job time limit value, before and after this work.
- 🔴 Easy to miss: do not stop the clocks while a build waits.
- 🔴 Not proven yet: raised prepare limit; raised tool stall limit; unchanged job time limit; clocks not stopped.
```

Why this rule: the fast way to make a waiting build safe is to pause its clocks, and the task forbids exactly that. The job time limit is a separate check with its own proof, not part of this line.

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

Why this old note fails the proposed shape: the verdict and the test counts are results. They answer "what happened", not "what must be true and how would a person see it". The gaps it found are its valuable lines, and they sit as asides under a verdict.

New note, as a plan before evidence:

```text
- 🔴 Done means: every place that sets the `setting`, `app`, or `thread` resolver is shown. Shown by: the list of places that set it.
- 🔴 The composer draws trusted setting, App and conversation rows. Shown by: the composer drawing those rows.
- 🔴 Easy to miss: only host code can give Compose the `setting`, `app` and `thread` resolver.
- 🔴 Not proven yet: every setter shown; trusted rows drawn; only host code gives the resolver.
```

Why this rule: three teams picked three different lines for this example. Team-1 picked this host-code line; team-3 picked "show every place"; the team-2 draft picked completeness. This revision picks the host-code line as the rule, because it is the boundary the task states, and puts completeness where it can be checked: the first Done check fails if the list is short, whatever the list contains. The rule keeps its own place in `Not proven yet`, so a complete list of setters does not clear it until the agent can point to evidence that each one is host code. The draft's second check, which named sources that appear only behind the excerpt's ellipses, is gone.

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

Why this old note fails the proposed shape: it is a results ledger carried into a continued job. No line says what this round must show again, and its one forward-looking line (live QA must check the work order) is buried among numbers. Under the proposed `noteStart`, a continuing agent keeps that line as a restriction if it still binds, carries no numbers forward, and puts every check it has not seen evidence for in `Not proven yet`. That classification is stated here, outside the new note, because the work-order line comes from the old note and not from this round's task lines; the new note below uses only the task lines.

New note, as a plan before evidence (written at the start of the continued round):

```text
- 🔴 Done means: the doc and the ADR draft record these decisions as decided. Shown by: the decided wording in both files.
- 🔴 The video-first chain cases are re-run offline. Shown by: the re-run record.
- 🔴 The new numbers are reported, and they confirm or correct the 8/10 result. Shown by: the report of the new numbers from that re-run.
- 🔴 Easy to miss: the VIDEO receipt is issued first.
- 🔴 Not proven yet: decisions recorded in both files; chain cases re-run offline; new numbers reported; VIDEO receipt first.
```

Why this rule: a re-run in the old receipt order produces numbers that look like a confirmation and prove nothing about the flaw the task names. The receipt order is the one miss that leaves no visible sign, so it is the rule, and the rerun and the report are separate checks with separate names.

## What this proposal preserves from the current prompt

- Project reminders ride in `noteStart` and again in `noteCheck`, only when the file exists and is not empty, and each 🔴 reminder must be answered at the finish. They are not copied into the note.
- A steering message changes the note only through a kept old line plus a `🟡 changed:` line with a reason, and a check and its `Not proven yet` name change in the same edit. A steer that changes no point does not edit the note.
- A continued job gets the note instruction in its first prompt, gets told how to sort a predecessor's lines, and never inherits a `Seen:` line as its own evidence.
- A missing note is named as missing; the agent lists the 🔴 points from memory at the finish, and reconstruction is not evidence.
- When the start note differs, both versions reach the finish check, and a point that vanished without a `changed` line must be named as dropped.
- The finish sentence appears only when the check answers a `finish` call.
- Unknown is never passed: not for a check, not for the rule, not for a reminder.
- The original sentences "Put detail under its main point" and "Add a time only when it helps" are in the FORMAT again.

## What this proposal does not do

- It does not change any code, condition, file name, timing, or test in `src/job/task-note.ts`, `hook/finish.ts`, or `test/u14-task-note.test.ts`. Only the four strings would change, if Adam approves, and the strings this revision deliberately keeps are named above.
- It proposes no runtime parsing of the note, no gate, and no new state. Limen still copies, logs, and shows the note without parsing it.
- It claims no delivery benefit. The narrower claim stands: the current notes demonstrably contain task copies and result logs (examples 2 and 4 in the supplied set are final notes that still list commands to run), and this shape names the lines those notes lack.

## Still uncertain

- Nothing shows that agents will keep the note near six lines when a task binds more checks, name each unproven check instead of writing "both", or keep `Seen:` to a pointer.
- The excerpts' ellipses may hide a sharper rule in any of the three examples. The rewrites now use only what Adam's page shows, so a hidden rule is a limit of the examples, stated rather than filled.
- One `Easy to miss` line is a bet. Example 1 has two hard boundaries; this revision makes one of them a check and the other the rule, but a task could have two rules that are each easy to miss and neither checkable as an end state.
- The FORMAT text is longer than the current one. The cost on a first prompt was not measured by any team.
