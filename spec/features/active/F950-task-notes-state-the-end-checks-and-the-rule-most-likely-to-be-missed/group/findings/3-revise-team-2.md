The team-2 revised proposal (round 3 of 4) is committed as `99fb52b` (`F950 team-2 revise: one label per thing, excerpt-only examples, finish path not tool`), one file changed: `spec/features/active/F950-task-notes-state-the-end-checks-and-the-rule-most-likely-to-be-missed/group/proposals/team-2.md`. It replaces the round-1 draft (`29c92a3`). The critique file (`group/findings/team-2-critique.md`, `8174253`) is untouched. No code, hook, test, ticket, or board changed. Effectiveness is unproven: both studies found no clear effect, at low confidence, and this proposal claims no delivery benefit. A script re-checked the three old notes against `examples.json`: verbatim, all three.

## What I accepted and fixed

- One word, one thing: the plan now says `Shown by:` and the evidence record says `Seen:` (team-3, point 1, the `Proof:` collision).
- `Not proven yet` names each check on one line; "both Done checks" is banned (team-3, point 2).
- No invented runtime condition: `noteStart` reads only reminders (`src/job/task-note.ts` lines 24-32), so the continued-job text is always-sent prose (team-1; team-3, point 3).
- The finish sentence follows the sending path — a `finish` call (`hook/finish.ts` line 65, `check(true)`) versus the settle turn (lines 86, 94, `check(false)`) — not tool ownership, which every job has (line 55) (team-3, point 4).
- Examples use only the excerpt; the words from behind the ellipses are gone (team-1; team-3, point 5). Example 1 splits the clock rule from the job-limit rule (team-1; team-3, point 6). No check groups two rules anywhere, and the Easy-to-miss rule needs its own evidence (team-1's rule). "Put detail under its main point" and "Add a time only when it helps" are restored word for word (team-1). Carried result lines are classified, not deleted (team-1, kept by team-3). Reminders are not copied into the note (team-3, point 7). The FORMAT example shows a `changed` line whose values change (team-3, point 8). An assumption that could change a check's result becomes a check.

## What I rejected, and why

- Team-3's tick as the sole not-proven state: it reads as "done" (its own named risk) and audits badly after context is summarized; the brief asks for three visible parts and the finish check reads the list. Drift is met by short names edited with their check.
- Team-3's pointer check for long lists: a miss surfaces only at the finish. Line count gives way instead; no binding check is dropped, merged, or hidden.
- Team-3's task-file reconstruction for a missing note: the code claim is right (`src/job/publication.ts` writes `task.md`), but "From memory" is current and test-matched, and the finish check reports work rather than assigning a fresh read.
- Team-1's full duplicate Open lines and blanket deletion of result lines. Any invitation to prove a check at the finish.

## The complete revised proposal

Central answer: for each end check the agent writes how a person could repeat it, and keeps every check with no evidence in a named `Not proven yet` line. A check without a named way to show it is a task copy; a result without a check is a log. The one rule a busy agent is most likely to break while checks pass is a separate line, and it stays unproven until it has evidence of its own.

Placeholders: `{NOTE_PATH}` is the job folder's `note.md`; `{FIRST_NOTE_PATH}` its `note.first.md`; `{REMINDERS_PATH}` the path `projectReminders` returns; `{REMINDERS_TEXT}` that file's trimmed text when it exists and is not empty; `{NOTE_NOW}` and `{NOTE_FIRST}` the trimmed note texts. Display placeholders only, no new runtime code.

### FORMAT

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

### noteStart (first prompt of each job, a continued one too; reminders block only when the file exists and is not empty; all else always sent)

```text
[limen] Before other work, read your note in {NOTE_PATH}, or write it if there is none.
{FORMAT}
If a note already exists, read it against this task before you act. Keep each line that still binds. A line that says what a later check must do is a restriction: keep it as a Done check or as Easy to miss. A line that only says what already happened is a result: do not carry its numbers or its verdict into this note, but if it reveals a gap or a limit that still binds, write that gap or limit as a Done check or as Easy to miss. Keep the old line and add a "🟡 changed: ... Reason: ..." line under any point this task changes. Do not treat an earlier agent's Seen line as your evidence until you have seen the evidence yourself. Every check you have not seen evidence for stays in Not proven yet.
[reminders exist] Project reminders ({REMINDERS_PATH}). Keep each 🔴 one as you keep your 🔴 points:
[reminders exist] {REMINDERS_TEXT}
```

With no reminders, the string ends after the continued-job paragraph and does not contain the word "reminders".

### noteSteer (each steer message; subject differs with reminders, as in the current code)

```text
[with reminders] [limen] If this steer changes a Done check, the Easy-to-miss rule, its name in Not proven yet, or a project reminder, add a line under that point in {NOTE_PATH}: "🟡 changed: ... Reason: ...".
[no reminders] [limen] If this steer changes a Done check, the Easy-to-miss rule, or its name in Not proven yet, add a line under that point in {NOTE_PATH}: "🟡 changed: ... Reason: ...".
[both] Keep the old line. Change the check and its name in Not proven yet in the same edit. If the steer changes scope, remove the Seen line of each check it makes stale and put that check's name back in Not proven yet. If the steer changes no point in the note, do not edit the note.
```

### noteCheck (once, before the finish; conditions match the tests the current code already makes)

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

Kept current strings deliberately: "From memory", "Your note at the start:", the reminders-only mark wording, and the finish sentence only on a `finish` call; changing them costs a test change in `test/u14-task-note.test.ts` at implementation.

## The three examples (task lines from the excerpt only; old notes verbatim; new notes are plans, all checks unproven and named)

### Example 1: plant limits

Task: 1. Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants." 2. Do not stop the clocks while a build waits. 3. Do not change the job time limit. …

Old note, verbatim:

```text
…
  - 🟡 Queued cargo call: 74 samples over 240 s, longest idle stretch 0 s. The wrapper forks a new `sleep 1` each second and its CPU rises.
  - 🟡 Control `sleep 300`: flagged stalled at 180.8 s.
  - 🟡 Cargo build-directory lock wait ("Blocking waiting for file lock on build directory"): idle stretch grew for the whole 38 s wait. One child, CPU constant.
  - 🟡 The guess is false for the queue; true for cargo's own lock wait.
…
```

New note:

```text
- 🔴 Done means: the prepare limit for cargo plants is raised. Shown by: the raised prepare value Limen uses for a cargo plant.
- 🔴 The tool stall limit for cargo plants is raised. Shown by: the raised tool stall value Limen uses for a cargo plant.
- 🔴 The job time limit is unchanged. Shown by: the job time limit value, before and after this work.
- 🔴 Easy to miss: do not stop the clocks while a build waits.
- 🔴 Not proven yet: raised prepare limit; raised tool stall limit; unchanged job time limit; clocks not stopped.
```

### Example 3: trusted rows

Task: 1. … the composer draws trusted setting, App and conversation rows … 2. Only host code can give Compose the `setting`, `app` and `thread` resolver. 3. Show every place that sets it. …

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

New note:

```text
- 🔴 Done means: every place that sets the `setting`, `app`, or `thread` resolver is shown. Shown by: the list of places that set it.
- 🔴 The composer draws trusted setting, App and conversation rows. Shown by: the composer drawing those rows.
- 🔴 Easy to miss: only host code can give Compose the `setting`, `app` and `thread` resolver.
- 🔴 Not proven yet: every setter shown; trusted rows drawn; only host code gives the resolver.
```

### Example 8: continued mixing-trap design

Task: 1. … Record these as decided in the doc and the ADR draft. 2. … (1) re-run the video-first chain cases offline with the VIDEO receipt issued first, so the 8/10 result is confirmed or corrected; 3. report the new numbers; …

Old note, verbatim:

```text
…
  - 🟡 Chain: labelled 18/18 right; unlabelled 6/6 crossed (all Haiku). The old 8/10 holds; the receipt flaw did not cause it.
  - 🟡 Extra cell (list video first, work audio first): Sonnet, Haiku, GPT write audio first (12/12); Opus writes video first (4/4). 16/16 right.
  - 🟡 So video first catches an unlabelled hand-off only when the harness works in list order. Live QA must check the work order.
…
  - 🟡 No independent review of this round. Self-check only.
```

New note:

```text
- 🔴 Done means: the doc and the ADR draft record these decisions as decided. Shown by: the decided wording in both files.
- 🔴 The video-first chain cases are re-run offline. Shown by: the re-run record.
- 🔴 The new numbers are reported, and they confirm or correct the 8/10 result. Shown by: the report of the new numbers from that re-run.
- 🔴 Easy to miss: the VIDEO receipt is issued first.
- 🔴 Not proven yet: decisions recorded in both files; chain cases re-run offline; new numbers reported; VIDEO receipt first.
```

Still uncertain: whether agents keep the note near six lines on tasks with more binding checks, name each unproven check, or keep `Seen:` to a pointer; whether an ellipsis hides a sharper rule in any example; one Easy-to-miss line on a task with two uncheckable hard rules; and the unmeasured first-prompt cost of a longer FORMAT.

## Note check

- 🔴 Propose the complete task-note prompt text; do not implement it: delivered. The revised proposal is the text above and in commit `99fb52b`; no code, hook, test, or installed prompt changed.
- 🔴 Cover FORMAT, noteStart, noteSteer, and noteCheck, including conditional text: delivered. All four strings are complete above, with their conditions labelled and matched to the current code's tests.
- 🔴 Save the draft under `group/proposals/team-2.md` and commit only group-record files: delivered, changed. The round-3 revision overwrites that same file; commit `99fb52b` contains only it. Reason: the revise round replaces the draft at the same path.
- 🔴 Rewrite source examples 1, 3, and 8 as plans before new evidence exists; do not invent evidence or results: delivered. All three new notes start with every check named in Not proven yet, use only excerpt words, and claim no result; the invented example-3 sources from round 1 are removed.
- 🔴 Retain each old note verbatim; show each task in three short lines from its source excerpt: delivered. Script check against `examples.json` passed for all three, and the task lines are unchanged from round 1.
- 🔴 State that effectiveness is unproven; the studies found no clear effect: delivered. Stated at the top of the proposal and of this message; no delivery benefit is claimed.
- 🟡 The note states what must be true at the end, how to prove it, and the one most-missed rule: delivered. Done checks with `Shown by:`, one Easy-to-miss rule with its own unproven life, and the named Not-proven-yet line.
- 🟡 About six lines in three parts: delivered as an aim with a stated exception. Two to four Done lines, one rule line, one Not-proven-yet line; the count gives way when a task binds more checks, and that trade is stated rather than hidden.
- 🟡 Preserve reminders, steering, continued jobs, missing notes, changed scope, and the conditional finish-tool instruction: delivered. Reminders ride both prompts uncopied; steering edits check and name together and unticks stale proof; continued jobs classify carried lines and inherit no evidence; a missing note is reconstructed from memory; scope changes return checks to Not proven yet; the finish sentence follows the `finish`-call path.
- 🟡 Do not silently drop an original obligation; do not treat unknown as passed: delivered. The two restored FORMAT sentences are named; the one deliberate loss (the ⚪ marker, with its assumption rule) is named; unknown is not passed for checks, the rule, or reminders.
- ⚪ Placeholders acceptable if defined: kept as an assumption. All placeholders are defined; whether Adam accepts display placeholders in the proposal remains his call at review.
