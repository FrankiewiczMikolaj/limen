The revised note has one Miss line and two to four End lines. They start not proven. There is no second list. An End line with evidence does not clear Miss. The note does not store evidence. Effectiveness is unproven.

Commit `a1d78e3b8bded6b14f954d46fbc61f7dda267d86` on `limen/2026-10-23-f950-team-1-grok-4-7-draft-2c6981c0`. File: `spec/features/active/F950-task-notes-state-the-end-checks-and-the-rule-most-likely-to-be-missed/group/proposals/team-1.md`. No code change. No route failure. Old notes still match `examples.json` byte for byte. No-reminders strings do not contain "reminder".

## Rejected

- A second Open list. Team-2 proved it double-counts each 🔴 point and the copies drift. Team-3 proved a deleted line cannot show whether it was proven or dropped. On a continuation, `recordNote` does not replace an existing `note.first.md`.
- A tick or a `🟡 Proof` line in the note. The note file survives compaction. A pointer in it is how the supplied notes became result logs.
- Replacing "From memory" with a task-file read as the only fallback. `test/u14-task-note.test.ts` matches `From memory`. The path is named after that sentence.
- Dropping the 🟡 marker. Reminder files still use 🟡 for their own context. The note's 🟡 line is only a change line.
- Grouping two checks under one proof. That hid the clock check.
- "You may still prove an open check now." That invites a finish-time run.
- "Rewrite the earlier note" without a keep rule. That drops a learned restriction.
- Copying a project reminder into Miss or End. The finish check already names each 🔴 reminder.
- Team-2's invented example 3 sources, and team-3's "or the review names each place that is not".
- "prepare stall limit". The task says prepare and tool stall limits. `src/project/limits.ts` names `prepare` and `toolStall`.
- Paraphrasing "Just" as "no other limit moved". The decision is quoted instead.
- Marking extra acceptance bullets dropped. One End line points at the task's own list. The Note check names each item.

## FORMAT

316 words, 15 lines. The current string is about 116 words. The cost on a live prompt was not measured.

```
Format: a nested list in plain technical English. Short, clear sentences. One fact on each line.
Put detail under its main point. Add a time only when it helps.
About six lines. 🔴 must deliver or must keep. 🟡 a change in this note. ⚪ an assumption that cannot change the end.
Do not copy the task. Do not write what a run returned. Keep an exact command, limit, path, or count when it defines a check.
A forbidden check stays forbidden. If you cannot run it, add "(not run: <reason>)". See: is what a person looks at. Do not invent a run.
Miss: one 🔴 line. Quote the rule a busy agent will most likely break. An End line with evidence does not clear it.
End: two to four 🔴 lines a person can see. A longer acceptance list is one End line that points to it. Do not copy it. Do not mark the other items dropped.
Those lines start not proven. No second list. Do not delete a line to mean proven. Do not write the evidence here. Unknown stays not proven.
If an assumption can change a line, it is not ⚪. A ⚪ line is not evidence.
When a point changes, keep its line and add under it: "🟡 changed: ... Reason: ...". Do not edit the old line. Example:
- 🔴 Miss: Do not apply the new limit to old keys.
- 🔴 End: A new key is refused at the stated limit. See: the refusal for one new key, and the stated limit in src/cache.ts.
  - 🟡 changed 14:05: the stated limit is 60 requests per minute, not 100. Reason: the owner steered.
- 🔴 End: An old key keeps the limit it had before this change. See: one old key past the new key's limit.
- ⚪ Assume the proof uses a test key, not a customer key.
```

## noteStart

Always sent. Not a new runtime test. `noteStart` still branches only on reminders.

No reminders:

```
[limen] Before other work, read your note in {jobDir}/note.md, or write it if there is none.
{FORMAT}
If the note already exists, keep every 🔴 point that still binds. A line that says what a later check must do is a restriction. Move it under Miss or End. A line that only says what already happened is a result. Do not copy it into the plan. Do not treat an earlier claim as your evidence until you have seen the evidence yourself. Removing a line does not store it in note.first.md. That file may already be an earlier job's first note. Add End lines for this task. Do not replace the note with results.
```

With reminders, the same text, then:

```
Project reminders ({reminders.path}). Keep each 🔴 one as you keep your 🔴 points:
{reminders.text}
A 🟡 line in that file keeps that file's meaning. Do not treat it as a change line. Do not copy a reminder into Miss or End.
```

## noteSteer

No reminders:

```
[limen] If this steer changes a point in your note, add a line under that point in {jobDir}/note.md: "🟡 changed: ... Reason: ...".
Keep the old line. Do not edit it in place. If the steer changes no point, do not edit the note. A new restriction is a 🔴 point. If the steer makes the evidence for a line stale, that line stays not proven. Unknown stays not proven.
```

With reminders, the subject is `a point in your note or a project reminder`. Do not edit the reminders file. Quote a changed reminder in the note and add the changed line under the quote.

## noteCheck

Order unchanged. The finish sentence is sent only when the check answers a `finish` call, not because the job has the tool.

Missing note keeps: `You wrote no note in {jobDir}/note.md. From memory, list the 🔴 points of this job.` Then: those points are the Miss line and the End lines. The task file is `{jobDir}/task.md` if you need the words.

First copy, when it differs: `Your note at the start:`

Mark sentence, no reminders: `In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.`

With reminders: `each 🔴 point and each 🔴 project reminder`.

Added: mark a point not proven when you cannot name evidence outside the note. Not proven is not changed and not dropped. The Miss line is kept or broken. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear Miss. A 🔴 line gone from the first note, with no changed line, is dropped. A pointer to the task's acceptance list gets one Note-check line per item. Do not run a forbidden check.

Finish sentence, only on a finish-tool answer: `Then call finish again. Its handoff is that whole final message, with the "Note check".`

## Examples

Plans before evidence. Old notes are verbatim in the file.

1. Plant limits. Task lines: Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants." / Do not stop the clocks while a build waits. / Do not change the job time limit.

```
- 🔴 Miss: Do not stop the clocks while a build waits.
- 🔴 End: Cargo plants have a raised prepare limit and a raised tool stall limit. See: those two values. The decision says "Just raise the prepare and tool stall limits for cargo plants."
- 🔴 End: The job time limit is unchanged. See: the job time limit value.
```

3. Trusted rows. Task lines: the composer draws trusted setting, App and conversation rows / Only host code can give Compose the `setting`, `app` and `thread` resolver. / Show every place that sets it.

```
- 🔴 Miss: Only host code can give Compose the `setting`, `app` and `thread` resolver.
- 🔴 End: Every place that sets that resolver is named, and each named place is host code. See: the list of places.
```

8. Continued mixing-trap design. Task lines: Record these as decided in the doc and the ADR draft. / (1) re-run the video-first chain cases offline with the VIDEO receipt issued first, so the 8/10 result is confirmed or corrected; / report the new numbers;

```
- 🔴 Miss: "with the VIDEO receipt issued first". The old 8/10 is not the new numbers.
- 🔴 End: The doc and the ADR draft both record these decisions. See: both files.
- 🔴 End: The report gives the new numbers and says whether the 8/10 is confirmed or corrected. See: that report.
```

The work-order limit is not in the excerpt, so the example does not import it. noteStart keeps it on a real continuation because it says what a later check must do.

## Uncertain

The ellipses may hide a sharper miss. A continued agent may still drop a restriction. A pointer to a long acceptance list can hide an item until the Note check. `See:` is still vague when the task names no command. Neither study shows that this text improves delivery.

## Note check

- Propose the task-note prompt. Do not implement it: delivered. The commit changes only the proposal file.
- Round 1 is draft. Work alone. Do not read other teams: changed. Reason: round 3 is revise. The three critique results were read.
- Save the proposal at group/proposals/team-1.md and commit only group-record files: delivered, changed. Reason: the revise round replaces the draft. Commit `a1d78e3b8bded6b14f954d46fbc61f7dda267d86`.
- The note states the end checks, how to prove them, and the one rule most likely to be missed: delivered, changed. Reason: the second Open list drifted and double-counted. The open state is now the Miss and End lines. Miss still needs its own evidence.
- Rewrite examples 1, 3, and 8 as plans before new evidence. Keep old notes verbatim: delivered. The three old notes still match `examples.json`. The new notes invent no probe and no new limit name.
- Do not claim the prompt improves delivery. Effectiveness is unproven: delivered. The proposal says both studies found no clear effect.
- Do not edit source, hooks, tests, ticket, board, or installed prompts: delivered. `git show --stat` is one markdown file.
- Do not create the HTML page. The coordinator owns it: delivered. No HTML file was written.
