The note has one Miss line, two to four End lines, and one short Not proven yet line. A Seen line names where the evidence is, not what a run returned. An End line with evidence does not clear Miss. Effectiveness is unproven. No round result records a route failure.

Commit `2b05fa5de09cbbb9812433abcfab20c98ac22d4f` on `limen/2026-10-23-f950-team-1-grok-4-7-draft-2c6981c0`. Files: `group/final.md` and `group/final.json`. No code change. No HTML page. Old notes match `examples.json` byte for byte.

## Disagreements

1. Open state. Decision: a short Not proven yet line, not a full second copy and not a tick. Reason: full copies drift and double-count each 🔴 point. A tick reads as done. Deleting a line does not save it on a continuation. `limen continue` copies `note.first.md` only when that file is not empty, and `recordNote` does not replace an existing first file.

2. Example 3. Decision: the host-code sentence is the Miss line. The list of places is an End line. Reason: a list can exist and still include a place that is not host code. Reporting that place as a finding does not keep the rule.

3. Evidence in the note. Decision: `Shown by:` is the plan. `Seen:` is the place, and only after the agent has seen the evidence. Reason: the note file is what the next prompt reads. A result in the pointer is the log the supplied notes already are.

4. Missing note. Decision: keep `From memory, list the 🔴 points of this job.` Then name `{jobDir}/task.md`. Reason: `test/u14-task-note.test.ts` matches `From memory`. `publishJob` writes `task.md`.

5. Finish sentence. Decision: send it only when the check answers a `finish` call. Reason: `hook/finish.ts` registers `finish` for every job, then passes `finishTool` true only from that tool. The settle turn passes false.

6. Long lists. Decision: one End line points at the task's own list and gives its size. Do not copy it. Do not mark the other items dropped. Reason: a copy is a task copy. "Dropped" misreports a real check.

7. Markers. Decision: keep 🔴 on Miss, End, and Not proven yet. Keep ⚪ for an assumption that cannot change the end. Reason: the mark sentence names each 🔴 point. An assumption that can change a line is not ⚪.

8. Reminders. Decision: do not copy them into Miss or End. A changed reminder gets one changed line that names it. Reason: `noteCheck` already shows the reminders text.

9. Invented proof and the reading of "Just". Decision: quote the decision. `Shown by:` uses the excerpt's objects only.

10. Example 8 work-order line. Decision: the plan does not import it. The prompt keeps a carried restriction. Reason: the line is not in the task excerpt.

## Prompt

```text
FORMAT
Format: a nested list in plain technical English. Short, clear sentences. One fact on each line.
Put detail under its main point. Add a time only when it helps.
Write about six lines in three parts. A binding check is not dropped to save a line.
Each line starts with a marker: 🔴 must deliver or must keep, 🟡 a record under a point, ⚪ an assumption that cannot change the end.
Do not copy the task. Do not write what a run returned. Keep an exact command, limit, path, or count when it defines a check.
A forbidden check stays forbidden. If you cannot run it, add "(not run: <reason>)". This note is not permission to run it.
Shown by: is how a person can see the check. Use a command or file only when the task names it. Do not invent a run.
Seen: is where the evidence is, not what it showed. Do not put a count, a verdict, or command output there.
Miss: one 🔴 line. Quote the task rule a busy agent will most likely break while the End lines can still pass. An End line with evidence does not clear it.
End: two to four 🔴 lines. What a person can see at the end. If the task's acceptance list is longer than four, one End line points to that list and gives its size. Do not copy the list. Do not mark the other items dropped.
Not proven yet: one 🔴 line. Name each End line and the Miss line that has no Seen line. Use the same short name as that line. Do not write "both" or "everything". Write "none" only when every End line and the Miss line has a Seen line.
Those lines start not proven. Do not delete a line to mean proven. Unknown is not proven.
If an assumption can change a line, it is not ⚪. A ⚪ line is not evidence.
When a point changes, keep its line and add under it: "🟡 changed: ... Reason: ...". Do not edit the old line. Change its name in Not proven yet in the same edit. If the change makes a Seen line stale, remove that Seen line and put the name back. Example:
- 🔴 Miss: The limit counts per key, not per caller. Shown by: two callers on one key share one count.
- 🔴 End: A new key is refused at the stated limit. Shown by: the refusal for one new key, and the stated limit in src/cache.ts.
  - 🟡 changed 14:05: the stated limit is 60 requests per minute, not 100. Reason: the owner steered.
- 🔴 End: An old key keeps the limit it had before this change. Shown by: one old key past the new key's limit.
- 🔴 Not proven yet: limit counts per key; refusal at the stated limit; old key keeps its limit.
- ⚪ Assume the proof uses a test key, not a customer key.

noteStart
Sent once, on the first prompt of each job, a continued job too. The reminders block is sent only when that file exists and is not empty. The rest is always sent. This is not a new runtime test. noteStart branches only on reminders.

[limen] Before other work, read your note in {note path}, or write it if there is none.
{FORMAT}
If the note already exists, read it against this task before you act. Keep each 🔴 point that still binds. A line that says what a later check must do is a restriction. Keep it as Miss or End. A line that only says what already happened is a result. Do not copy its numbers or its verdict. If that line shows a limit that still binds, write the limit as Miss or End before you leave the result line. Do not treat an earlier Seen line as your evidence until you have seen the evidence yourself. Every line you have not seen evidence for stays in Not proven yet. Removing a line does not store it in {first path}. That file may already be an earlier job's first note, and only if that file was not empty. Add End lines for this task. Do not replace the note with results.

Sent only when the reminders file exists and is not empty. The reminder text stays on the next line:
Project reminders ({reminders path}). Keep each 🔴 one as you keep your 🔴 points:
{reminders text}
A 🟡 line in that file keeps that file's meaning. Do not treat it as a change line. Do not copy a reminder into Miss or End.

noteSteer
No reminders:
[limen] If this steer changes a Miss line, an End line, or its name in Not proven yet, add a line under that point in {note path}: "🟡 changed: ... Reason: ...".
Keep the old line. Do not edit it in place. Change the line and its name in Not proven yet in the same edit. If the steer makes a Seen line stale, remove that Seen line and put the name back in Not proven yet. If the steer changes no point, do not edit the note. A new restriction is a 🔴 point. Unknown stays not proven.

With reminders:
[limen] If this steer changes a Miss line, an End line, its name in Not proven yet, or a project reminder, add a line under that point in {note path}: "🟡 changed: ... Reason: ...".
Keep the old line. Do not edit it in place. Change the line and its name in Not proven yet in the same edit. If the steer makes a Seen line stale, remove that Seen line and put the name back in Not proven yet. If the steer changes no point, do not edit the note. A new restriction is a 🔴 point. Unknown stays not proven. Do not edit the reminders file. For a changed reminder, add one line whose text is: reminder, then its first words, then the reason. Do not copy the reminder into Miss or End.

noteCheck
Note present:
[limen] Your note now:
{now}
Note missing:
[limen] You wrote no note in {note path}. From memory, list the 🔴 points of this job.
Those points are the Miss line and the End lines. None of them is proven yet. The task file is {jobDir}/task.md if you need the words.
First file differs:
Your note at the start:
{first}
Reminders present:
Project reminders:
{reminders text}
No reminders:
In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
With reminders:
In your final message, under the heading "Note check", mark each 🔴 point and each 🔴 project reminder delivered, changed or dropped, and give the reason.
Then, in every check:
Also mark a point not proven when it is still named in Not proven yet, or when you cannot name evidence outside the note. Not proven is not changed, and it is not dropped. Unknown is not delivered. The Miss line is kept, broken, or not proven. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear the Miss line. A delivered mark needs a Seen place you can name. A 🔴 line that was in the note at the start and is gone now, with no changed line under it, is dropped. Name it. If one End line points to the task's acceptance list, give one line for each item on that list. Do not run a check to change a mark. A check the task forbids stays not proven.
This check answers a finish call:
Then call finish again. Its handoff is that whole final message, with the "Note check".
This check is the extra turn before a detached run settles:
End your final message there.
```

The FORMAT block is 497 words and 20 lines. The current FORMAT string is about 116 words. That cost was not measured.

## Examples

1. Plant limits. Miss: do not stop the clocks. End: raised prepare limit, raised tool stall limit, unchanged job time limit. The decision is quoted, not paraphrased.

3. Trusted rows. Miss: only host code can give Compose the resolver. End: every place that sets it is named, and the composer draws the trusted rows.

8. Continued mixing-trap design. Miss: the VIDEO receipt is issued first. The old 8/10 is not the new numbers. End: both files record the decisions, and the report says whether the 8/10 is confirmed or corrected.

All three new notes start with every line named in Not proven yet. They invent no probe and no result.

## Note check

- Propose the task-note prompt. Do not implement it: delivered. The commit adds only `group/final.md` and `group/final.json`.
- Round 1 is draft. Work alone. Do not read other teams: changed. Reason: round 4 is the group decision. Every round result was read.
- Save the proposal at group/proposals/team-1.md and commit only group-record files: changed. Reason: the brief names `group/final.md` and `group/final.json` for this round. Commit `2b05fa5de09cbbb9812433abcfab20c98ac22d4f`.
- The note states the end checks, how to prove them, and the one rule most likely to be missed: delivered, changed. Reason: the open state is a short Not proven yet line, not a second full copy. Miss still needs its own evidence.
- Rewrite examples 1, 3, and 8 as plans before new evidence. Keep old notes verbatim: delivered. A script matched all three old notes to `examples.json`.
- Do not claim the prompt improves delivery. Effectiveness is unproven: delivered. The record says both studies found no clear effect.
- Do not edit source, hooks, tests, ticket, board, or installed prompts: delivered.
- Do not create the HTML page. The coordinator owns it: delivered. No HTML file was written.
- Name each disagreement and the reason for the choice. Name any failed route: delivered. Ten disagreements are named above. No round result records a route failure.
