# Final review proposal

The coordinator edited the group result for Adam to review. This is not an approved or installed prompt. Effectiveness is unproven.

The unedited group result is in `proposals/group-final.md` and `proposals/group-final.json`. The round results are in `findings/`.

## Substitution rules

- Bracketed conditions select text. They are not sent to the agent.
- `{notePath}` is the job folder's `note.md`; `{taskPath}` is its `task.md`.
- `{noteNow}` and `{firstNote}` are trimmed current and first-note contents. The first note can belong to an earlier continued job.
- `{remindersPath}` and `{remindersText}` are the path and trimmed content returned by `projectReminders`.
- `{FORMAT}` inserts the FORMAT string below.
- Text without a condition is always sent within that named string.
- The reminders condition requires a nonempty reminders file. The first-note condition also requires a nonempty current note.
- The final finish sentence is sent only when `finishTool` is true. A settle check omits it.

## Prompt

```text
FORMAT
Write a plan, not a task copy or a result log. Use plain technical English. Aim for six lines in three parts:
- Done means: two to four end checks. Each line states what must be true, then "Shown by:" and the command or observation that would prove it.
- Easy to miss: the one task rule that the quickest way to finish could skip or break. Quote it. Add "Shown by:" and how to check that it was followed.
- Not proven yet: short names of the end checks and the easy-to-miss rule that lack evidence. Name each one.
Keep exact commands, limits, paths, and counts when they define acceptance. Reference a longer acceptance list by its location and item count; do not copy it or omit its checks.
Each check starts unproven. Remove its name from Not proven yet only after you see evidence that it holds. Add "Seen: <evidence location>" to that check. Give a pointer, not results. A pointer alone is not proof. The easy-to-miss rule needs its own evidence.
Keep each check in the note after it is proven. Write "Not proven yet: none" only when every check and the rule have evidence. Unknown stays unproven. Do not add context, steps, assumptions, or test totals.

noteStart
[limen] Before other work, read {notePath}, or write it if there is none.
{FORMAT}
Read an existing note against this task. Keep restrictions that still apply. Replace past results with the end checks or limits they reveal. Reuse earlier evidence only after you inspect it and confirm that it still applies; do not rerun a check just because this is a continued job.
[Only when project reminders exist]
Project reminders ({remindersPath}):
{remindersText}
Follow each binding reminder. Do not copy them into the note.

noteSteer
[limen] If this steer changes an end check or the easy-to-miss rule, keep the old line and append "Changed: <new requirement>. Reason: <what changed it>" under it in {notePath}. The new requirement now applies. Put affected checks back in Not proven yet and remove stale Seen pointers. Add any new obligation as unproven. Leave an unrelated note unchanged.
[Only when project reminders exist]
If a reminder changes, record the changed requirement by reference in the note. Do not edit the reminders file.

noteCheck
[When the current note exists]
[limen] Your note now:
{noteNow}
[When the current note is missing or empty]
[limen] No note exists in {notePath}. Read {taskPath} and reconstruct the end checks and the easy-to-miss rule. Do not assume they are proven.
[When the current note exists and a nonempty first note differs]
Your note at the start:
{firstNote}
[Only when project reminders exist]
Project reminders:
{remindersText}
[Always]
Compare the note with the task and later instructions. Under "Note check" in your final message, give one line per end check. Mark it proven, not proven, changed, or dropped. Proven needs evidence and its location. Not proven needs what is missing. Changed or dropped needs the instruction that changed its scope. Give one line per item in a referenced acceptance list. Account for any obligation missing from the current note.
Give the easy-to-miss rule its own line: followed, broken, or not proven, with evidence or the gap. Passing the end checks does not prove that the rule was followed. Read Not proven yet; none of its entries can be marked proven without evidence.
[Only when project reminders exist]
Report each binding project reminder as followed, broken, or not proven, with evidence or the gap.
[Always]
Do not repeat a run-once check or run a forbidden check to clear the note. Report any remaining gap without claiming completion.
[Only when this check answers a finish call]
Then call finish again. Its handoff is that whole final message, with the "Note check".
```

## Examples

These are plans before new evidence exists. The source excerpts contain ellipses. The old notes are unchanged.

### Example 1

```text
Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants."
Do not stop the clocks while a build waits.
Do not change the job time limit.
```

Before:

```text
…
  - 🟡 Queued cargo call: 74 samples over 240 s, longest idle stretch 0 s. The wrapper forks a new `sleep 1` each second and its CPU rises.
  - 🟡 Control `sleep 300`: flagged stalled at 180.8 s.
  - 🟡 Cargo build-directory lock wait ("Blocking waiting for file lock on build directory"): idle stretch grew for the whole 38 s wait. One child, CPU constant.
  - 🟡 The guess is false for the queue; true for cargo's own lock wait.
…
```

After:

```text
- Done means: the cargo plant prepare limit is raised. Shown by: its value before and after the change.
- Done means: the cargo plant tool stall limit is raised. Shown by: its value before and after the change.
- Done means: the job time limit is unchanged. Shown by: its value before and after the change.
- Easy to miss: "Do not stop the clocks while a build waits." Shown by: the clocks advance through a build wait.
- Not proven yet: prepare limit; tool stall limit; job time limit; clocks during a wait.
```

### Example 3

```text
the composer draws trusted setting, App and conversation rows
Only host code can give Compose the `setting`, `app` and `thread` resolver.
Show every place that sets it.
```

Before:

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

After:

```text
- Done means: the review answers whether only host code can give Compose the setting, app, and thread resolver. Shown by: source evidence for that answer.
- Done means: the review covers the composer's trusted setting, App, and conversation rows. Shown by: evidence for each row type.
- Easy to miss: "Show every place that sets it." Shown by: the review lists every resolver setter and explains whether each is host code.
- Not proven yet: host-only resolver access; trusted row types; every setter shown.
```

### Example 8

```text
Record these as decided in the doc and the ADR draft.
(1) re-run the video-first chain cases offline with the VIDEO receipt issued first, so the 8/10 result is confirmed or corrected;
report the new numbers;
```

Before:

```text
…
  - 🟡 Chain: labelled 18/18 right; unlabelled 6/6 crossed (all Haiku). The old 8/10 holds; the receipt flaw did not cause it.
  - 🟡 Extra cell (list video first, work audio first): Sonnet, Haiku, GPT write audio first (12/12); Opus writes video first (4/4). 16/16 right.
  - 🟡 So video first catches an unlabelled hand-off only when the harness works in list order. Live QA must check the work order.
…
  - 🟡 No independent review of this round. Self-check only.
```

After:

```text
- Done means: the doc and ADR draft record the decisions. Shown by: each named decision in both files.
- Done means: the video-first chain cases are rerun offline. Shown by: the offline rerun record.
- Done means: the report gives new numbers and confirms or corrects 8/10. Shown by: the report matches the new rerun record.
- Easy to miss: "with the VIDEO receipt issued first". Shown by: the saved receipt order for each rerun case.
- Not proven yet: decisions in both files; offline rerun; new numbers; VIDEO receipt first.
```
