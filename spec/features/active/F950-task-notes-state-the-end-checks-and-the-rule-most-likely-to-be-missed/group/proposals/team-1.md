# Team-1 revised proposal · task-note prompt

Round 3 revise. Route `pi:xai/grok-4.7:high`. No route failure. This file replaces the round 1 draft. It does not change Limen code, hooks, tests, or installed prompts.

Effectiveness is unproven. Both studies found no clear effect. This text claims no delivery benefit.

## Answer

The agent must write one Miss line. Quote the task rule a busy agent will most likely break. That line stays not proven until it has its own evidence. An End line with evidence does not clear it.

End lines say what a person can see. They start not proven. The note does not store the evidence, and it does not keep a second copy of the lines. The Note check marks each line delivered, changed, dropped, or not proven.

## Placeholders

- `{jobDir}` is the job folder. The note is `{jobDir}/note.md`. The first copy is `{jobDir}/note.first.md`.
- `{reminders.path}` is the path of `.agents/limen/reminders.md` when that file exists and its trimmed text is not empty.
- `{reminders.text}` is that trimmed text.
- `{now}` is the trimmed text of `{jobDir}/note.md` when the file exists and is not empty.
- `{first}` is the trimmed text of `{jobDir}/note.first.md` when that file exists and is not empty. On a continuation it may be the earlier job's first note, not the note this job started from. `limen continue` copies each file only when its body is not empty.
- `{CHANGED}` is the literal `"🟡 changed: ... Reason: ..."`.

The clauses below compose. Each clause appears in a full string. A no-reminders string must not contain the word "reminder".

## FORMAT

This replaces the current `FORMAT` string. It is included in every `noteStart`.

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

The example is a shape sample. It is not this job. The old End line still says "the stated limit". The changed line says what that limit became. It does not overwrite the old line. The current FORMAT string is about 116 words. This one is 316 words and 15 lines. The extra words are the rules the critiques proved were missing from the draft. The cost on a live prompt was not measured.

## noteStart

Sent once, on the first prompt of the job. A continued job gets it too. This text is always sent. It is not a new runtime test. `noteStart` branches only on reminders.

No project reminders:

```
[limen] Before other work, read your note in {jobDir}/note.md, or write it if there is none.
{FORMAT}
If the note already exists, keep every 🔴 point that still binds. A line that says what a later check must do is a restriction. Move it under Miss or End. A line that only says what already happened is a result. Do not copy it into the plan. Do not treat an earlier claim as your evidence until you have seen the evidence yourself. Removing a line does not store it in note.first.md. That file may already be an earlier job's first note. Add End lines for this task. Do not replace the note with results.
```

With project reminders, the same text, then this block. The reminder text stays on the next line.

```
[limen] Before other work, read your note in {jobDir}/note.md, or write it if there is none.
{FORMAT}
If the note already exists, keep every 🔴 point that still binds. A line that says what a later check must do is a restriction. Move it under Miss or End. A line that only says what already happened is a result. Do not copy it into the plan. Do not treat an earlier claim as your evidence until you have seen the evidence yourself. Removing a line does not store it in note.first.md. That file may already be an earlier job's first note. Add End lines for this task. Do not replace the note with results.
Project reminders ({reminders.path}). Keep each 🔴 one as you keep your 🔴 points:
{reminders.text}
A 🟡 line in that file keeps that file's meaning. Do not treat it as a change line. Do not copy a reminder into Miss or End.
```

## noteSteer

Added after each steer message.

No project reminders:

```
[limen] If this steer changes a point in your note, add a line under that point in {jobDir}/note.md: "🟡 changed: ... Reason: ...".
Keep the old line. Do not edit it in place. If the steer changes no point, do not edit the note. A new restriction is a 🔴 point. If the steer makes the evidence for a line stale, that line stays not proven. Unknown stays not proven.
```

With project reminders:

```
[limen] If this steer changes a point in your note or a project reminder, add a line under that point in {jobDir}/note.md: "🟡 changed: ... Reason: ...".
Keep the old line. Do not edit it in place. If the steer changes no point, do not edit the note. A new restriction is a 🔴 point. If the steer makes the evidence for a line stale, that line stays not proven. Unknown stays not proven. Do not edit the reminders file. If the steer changes a reminder, quote that reminder in the note and add the changed line under the quote.
```

## noteCheck

Sent once, before the finish. Clause order stays: note now, note at the start, reminders, the mark sentence, then the finish-tool sentence. The finish sentence is sent only when the check answers a `finish` call. A detached job has the tool and can still get that sentence omitted.

Shared mark sentence, no reminders:

```
In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
Also mark a point not proven when you cannot name evidence outside the note. Not proven is not changed, and it is not dropped. Unknown is not delivered. The Miss line is kept or broken. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear the Miss line.
If the note at the start is shown above, a 🔴 line that was there and is gone now, with no changed line under it, is dropped. Name it.
If one End line points to the task's acceptance list, give one line for each item on that list.
Do not run a check the task forbids.
```

Shared mark sentence, with reminders. Only the first sentence changes:

```
In your final message, under the heading "Note check", mark each 🔴 point and each 🔴 project reminder delivered, changed or dropped, and give the reason.
Also mark a point not proven when you cannot name evidence outside the note. Not proven is not changed, and it is not dropped. Unknown is not delivered. The Miss line is kept or broken. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear the Miss line.
If the note at the start is shown above, a 🔴 line that was there and is gone now, with no changed line under it, is dropped. Name it.
If one End line points to the task's acceptance list, give one line for each item on that list.
Do not run a check the task forbids.
```

Finish-tool sentence, only when the check answers a `finish` call:

```
Then call finish again. Its handoff is that whole final message, with the "Note check".
```

Variant A. Note present. First copy missing or identical. No reminders. Not a finish-tool answer.

```
[limen] Your note now:
{now}
In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
Also mark a point not proven when you cannot name evidence outside the note. Not proven is not changed, and it is not dropped. Unknown is not delivered. The Miss line is kept or broken. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear the Miss line.
If the note at the start is shown above, a 🔴 line that was there and is gone now, with no changed line under it, is dropped. Name it.
If one End line points to the task's acceptance list, give one line for each item on that list.
Do not run a check the task forbids.
```

Variant B. Note present. First copy differs. Reminders present. Not a finish-tool answer.

```
[limen] Your note now:
{now}
Your note at the start:
{first}
Project reminders:
{reminders.text}
In your final message, under the heading "Note check", mark each 🔴 point and each 🔴 project reminder delivered, changed or dropped, and give the reason.
Also mark a point not proven when you cannot name evidence outside the note. Not proven is not changed, and it is not dropped. Unknown is not delivered. The Miss line is kept or broken. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear the Miss line.
If the note at the start is shown above, a 🔴 line that was there and is gone now, with no changed line under it, is dropped. Name it.
If one End line points to the task's acceptance list, give one line for each item on that list.
Do not run a check the task forbids.
```

Variant C. Note missing. No reminders. Finish-tool answer.

```
[limen] You wrote no note in {jobDir}/note.md. From memory, list the 🔴 points of this job.
Those points are the Miss line and the End lines. Unknown is not delivered. The task file is {jobDir}/task.md if you need the words.
In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
Also mark a point not proven when you cannot name evidence outside the note. Not proven is not changed, and it is not dropped. Unknown is not delivered. The Miss line is kept or broken. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear the Miss line.
If the note at the start is shown above, a 🔴 line that was there and is gone now, with no changed line under it, is dropped. Name it.
If one End line points to the task's acceptance list, give one line for each item on that list.
Do not run a check the task forbids.
Then call finish again. Its handoff is that whole final message, with the "Note check".
```

Variant D. Note missing. Reminders present. Not a finish-tool answer.

```
[limen] You wrote no note in {jobDir}/note.md. From memory, list the 🔴 points of this job.
Those points are the Miss line and the End lines. Unknown is not delivered. The task file is {jobDir}/task.md if you need the words.
Project reminders:
{reminders.text}
In your final message, under the heading "Note check", mark each 🔴 point and each 🔴 project reminder delivered, changed or dropped, and give the reason.
Also mark a point not proven when you cannot name evidence outside the note. Not proven is not changed, and it is not dropped. Unknown is not delivered. The Miss line is kept or broken. If you cannot tell, mark it not proven. Unknown is not kept. An End line with evidence does not clear the Miss line.
If the note at the start is shown above, a 🔴 line that was there and is gone now, with no changed line under it, is dropped. Name it.
If one End line points to the task's acceptance list, give one line for each item on that list.
Do not run a check the task forbids.
```

Other mixes use these same clauses. Do not add a parser, a gate, or a new file.

## What changed, and why

The second Open list is gone. Team-2 proved it doubles every check, so the finish mark of each 🔴 point counts a line twice, and the two copies drift. Team-3 proved a deleted Open line cannot show, after the next compaction of the conversation, whether the line was proven or dropped. On a continuation, `recordNote` does not replace an existing `note.first.md`, so deletion does not save the line there either. The open state is now the Miss line and the End lines themselves. The Note check marks one of them not proven. That is the mark team-3 proved was missing.

The FORMAT example no longer says both "101st request" and "60 per minute". The changed line no longer repeats a number the old line already states. Team-3 proved that example broke its own rule.

"Do not write a count" is now "do not write a result". A limit or a count that defines the check stays. Team-3 proved the old ban conflicted with "keep an exact limit", and with widths such as 1280, 1024, and 390.

noteSteer no longer says both "do not delete the old line" and "change the End line". The old line stays. The changed line goes under it. If the steer changes no point, the note stays as it is. That last sentence is team-2's, and it holds.

A long acceptance list is one End line that points at the task's own list. The extra items are not marked dropped. Team-3 proved "mark them dropped" misreports a real check. The Note check still names each item.

"(not run: <reason>)" is kept from team-3. It leaves a forbidden check visible. It does not permit the run.

The continued-job paragraph is always sent. It does not claim a runtime test. `noteStart` still reads only the reminders file.

## What I rejected, and why

I rejected a tick or a `🟡 Proof` line in the note. Team-2 and team-3 use one to survive compaction. The note file is not the conversation. The next prompt reads the file. A pointer in the file is how the supplied notes became result logs. Evidence stays in the Note check.

I rejected replacing "From memory" with a read of `task.md` as the only fallback. `test/u14-task-note.test.ts` matches `From memory`. The task path is named after that sentence, so the file is available. The memory sentence stays.

I rejected dropping the 🟡 marker. The changed-line literal is part of the current string. Reminder files still use 🟡 for their own context. The reminders block says that meaning stays in that file. The note's 🟡 line is only a change line.

I rejected grouping two checks under one proof. Team-2's plant-limits example hid the clock check inside the job-limit check. Each forbid stays its own line.

I rejected "you may still prove an open check now". That invites a run at the finish. The current check does not say it.

I rejected "rewrite the earlier note for this task" without a keep rule. That drops a restriction the earlier job learned. The keep rule stays. The false sentence "delete result lines; the first version is kept" is gone.

I rejected copying a project reminder into Miss or End. The finish check already names each 🔴 reminder. A copy takes the miss slot and counts the reminder twice.

I rejected team-2's example 3 sources and team-3's "or the review names each place that is not". Those words are not a keep of the host-code rule.

## Examples

The new notes are plans before new evidence. They use only the source excerpt. The old notes are the `note` fields in `/Users/overment/Downloads/limen-note-examples-data/examples.json`, copied verbatim.

### 1 · plant limits

The miss is the clock rule. All three drafts picked it. The job time limit is its own End line, not folded into the miss. The task says "prepare and tool stall limits". This plan does not say "prepare stall limit". `src/project/limits.ts` names `prepare` and `toolStall`. The excerpt does not give the new values. This plan does not invent them. "Just raise..." is quoted, not paraphrased as "no other limit moved".

Task lines:

1. Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants."
2. Do not stop the clocks while a build waits.
3. Do not change the job time limit.

Old note:

```
…
  - 🟡 Queued cargo call: 74 samples over 240 s, longest idle stretch 0 s. The wrapper forks a new `sleep 1` each second and its CPU rises.
  - 🟡 Control `sleep 300`: flagged stalled at 180.8 s.
  - 🟡 Cargo build-directory lock wait ("Blocking waiting for file lock on build directory"): idle stretch grew for the whole 38 s wait. One child, CPU constant.
  - 🟡 The guess is false for the queue; true for cargo's own lock wait.
…
```

New note:

```
- 🔴 Miss: Do not stop the clocks while a build waits.
- 🔴 End: Cargo plants have a raised prepare limit and a raised tool stall limit. See: those two values. The decision says "Just raise the prepare and tool stall limits for cargo plants."
- 🔴 End: The job time limit is unchanged. See: the job time limit value.
```

### 3 · trusted rows

The miss is the host-code sentence, quoted once. Team-2's "every place, not the expected places" and team-3's "Show every place that sets it" are the proof of that rule, not a second rule. A list that includes a non-host setter fails the rule. This plan does not say a named non-host setter is enough. It does not invent a probe, a render, or a forged attempt.

Task lines:

1. the composer draws trusted setting, App and conversation rows
2. Only host code can give Compose the `setting`, `app` and `thread` resolver.
3. Show every place that sets it.

Old note:

```
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

```
- 🔴 Miss: Only host code can give Compose the `setting`, `app` and `thread` resolver.
- 🔴 End: Every place that sets that resolver is named, and each named place is host code. See: the list of places.
```

The row sentence is the subject of the review. It is not a third copy of the miss rule.

### 8 · continued mixing-trap design

The miss quotes the receipt-order words. The old 8/10 is not the new numbers. The report must say whether the 8/10 is confirmed or corrected. That check was missing in the draft. This plan does not copy 18/18, the extra cell, or the self-check line. The work-order line is not in the task excerpt, so this plan does not import it. On a real continuation, noteStart keeps it: "Live QA must check the work order" says what a later check must do.

Task lines:

1. Record these as decided in the doc and the ADR draft.
2. (1) re-run the video-first chain cases offline with the VIDEO receipt issued first, so the 8/10 result is confirmed or corrected;
3. report the new numbers;

Old note:

```
…
  - 🟡 Chain: labelled 18/18 right; unlabelled 6/6 crossed (all Haiku). The old 8/10 holds; the receipt flaw did not cause it.
  - 🟡 Extra cell (list video first, work audio first): Sonnet, Haiku, GPT write audio first (12/12); Opus writes video first (4/4). 16/16 right.
  - 🟡 So video first catches an unlabelled hand-off only when the harness works in list order. Live QA must check the work order.
…
  - 🟡 No independent review of this round. Self-check only.
```

New note:

```
- 🔴 Miss: "with the VIDEO receipt issued first". The old 8/10 is not the new numbers.
- 🔴 End: The doc and the ADR draft both record these decisions. See: both files.
- 🔴 End: The report gives the new numbers and says whether the 8/10 is confirmed or corrected. See: that report.
```

`these decisions` is the task's wording. The excerpt does not say what was decided. This plan does not invent it.

## Uncertain

- The ellipses may hide a sharper miss than the clock rule, the host-code sentence, or the receipt order.
- A continued agent may still class a restriction as a result and drop it. The prompt says how to class it. That is not proof of compliance.
- One End line that points at a long acceptance list can still hide an item until the Note check. That is the remaining coverage risk. Marking those items dropped was worse.
- `See:` names the look, not a command the task did not give. A task with no named command still has a vague proof. Inventing a command was the defect in the other drafts.
- Neither study names a prompt shape that improves delivery.
