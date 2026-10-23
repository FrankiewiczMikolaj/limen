# Team-1 draft · task-note prompt

Round 1 draft. Route `pi:xai/grok-4.7:high`. No route failure. This file is a proposal. It does not change Limen code, hooks, tests, or installed prompts.

## Answer

The agent must write one Miss line. That line names the task rule a busy agent will most likely break. It states the rule as a keep, not as a finding. The line stays on Open until that rule has its own evidence. A finished End check does not clear it. A result log does not replace it.

End checks say what a person can run or see. Open lists the checks that still have no evidence. The note does not store the evidence.

Effectiveness is unproven. The hook study and the continued-job study found no clear effect. This draft does not claim better delivery.

## Placeholders

- `{jobDir}` is the job folder. The note is `{jobDir}/note.md`. The kept first copy is `{jobDir}/note.first.md`.
- `{reminders.path}` is the path of `.agents/limen/reminders.md` when that file exists and its trimmed text is not empty.
- `{reminders.text}` is that trimmed text.
- `{now}` is the trimmed text of `{jobDir}/note.md` when the file exists.
- `{first}` is the trimmed text of `{jobDir}/note.first.md` when the file exists.
- `{CHANGED}` is the literal `"🟡 changed: ... Reason: ..."`.

The clauses below compose. Each clause appears in a full string. A no-reminders string must not contain the word "reminder".

## FORMAT

This replaces the current `FORMAT` string. It is included in every `noteStart`.

```
Format: a nested list in plain technical English. Short, clear sentences. One fact on each line.
Write about six lines in three parts. Put detail under its main point. Add a time only when it helps.
Each line starts with a marker: 🔴 must deliver or must keep, 🟡 a change to a point, ⚪ an assumption.
Do not copy the task. Do not write a result, a count, a verdict, a measurement, or an activity line.
Keep an exact command, limit, or restriction when it defines a check. A forbidden check stays forbidden. This note is not permission to run it.

Miss: one 🔴 line. The task rule a busy agent will most likely break. State it as a keep.
End: two to four 🔴 lines. What a person can run or see at the end. Do not say that you ran it.
Open: one short 🔴 line for the Miss rule, and one for each End check, while that line has no evidence outside this note. Start with all of them. Remove an Open line only when that evidence exists. Do not write the evidence here. Unknown stays on Open. An End check with evidence does not clear Miss.

When a point changes, keep its line and add a line under it: "🟡 changed: ... Reason: ...". Example:
- 🔴 Miss: Do not apply the new limit to old keys.
- 🔴 End: A new key is rejected on the 101st request in one minute. See: the rejection.
- 🔴 End: The stated limit is 60 requests per minute. See: the value in src/cache.ts.
  - 🟡 changed 14:05: the limit is 60 requests per minute. Reason: the owner steered.
- 🔴 Open: old keys keep the old limit.
- 🔴 Open: the 101st request is rejected.
- ⚪ Assume the proof uses a test key, not a customer key.
```

The example is a shape sample. It is not this job. A change line and a ⚪ assumption sit under a point. They do not replace Miss, End, or Open. The six-line aim is those three parts.

## noteStart

Sent once, on the first prompt of the job. A continued job gets it too.

No project reminders:

```
[limen] Before other work, read your note in {jobDir}/note.md, or write it if there is none.
{FORMAT}
If the note already exists, keep every 🔴 point that still binds. A 🟡 line that states a restriction, or a check that is not yet done, also still binds. Move it under Miss or End. A line that says what a later check must do is a restriction. A line that says what already happened is a result. Delete result lines. The first version of the note is kept. Add End checks for this task. Do not replace the note with results.
```

With project reminders, the same text, then this block. The reminder text stays on the next line. Do not insert a paragraph between the header and `{reminders.text}`.

```
[limen] Before other work, read your note in {jobDir}/note.md, or write it if there is none.
{FORMAT}
If the note already exists, keep every 🔴 point that still binds. A 🟡 line that states a restriction, or a check that is not yet done, also still binds. Move it under Miss or End. A line that says what a later check must do is a restriction. A line that says what already happened is a result. Delete result lines. The first version of the note is kept. Add End checks for this task. Do not replace the note with results.
Project reminders ({reminders.path}). Keep each 🔴 one as you keep your 🔴 points:
{reminders.text}
```

## noteSteer

Added after each steer message.

No project reminders:

```
[limen] If this steer changes a point in your note, add a line under that point in {jobDir}/note.md: "🟡 changed: ... Reason: ...".
Keep the old line. Do not delete it. If the steer changes what done means, change the End line and the matching Open line. If it changes the rule most likely to be missed, change the Miss line and keep it on Open until the new rule has evidence. A new restriction is a 🔴 point. Unknown stays open.
```

With project reminders:

```
[limen] If this steer changes a point in your note or a project reminder, add a line under that point in {jobDir}/note.md: "🟡 changed: ... Reason: ...".
Keep the old line. Do not delete it. If the steer changes what done means, change the End line and the matching Open line. If it changes the rule most likely to be missed, change the Miss line and keep it on Open until the new rule has evidence. A new restriction is a 🔴 point. Unknown stays open. Keep each 🔴 project reminder unless the steer changes that reminder. Then add the changed line under it.
```

## noteCheck

Sent once, before the finish. Clauses use the current order: note now, note at the start, reminders, the mark sentence, then the finish-tool sentence.

Shared mark sentence, no reminders:

```
In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
A point is delivered only when you can name evidence outside the note. A point still on Open is not delivered. Unknown is not delivered. Deleting the Miss line, or an End line, without that evidence is dropped, not delivered. If the note has no Open part, do not treat the End checks or the Miss rule as delivered unless you name evidence outside the note for each one.
```

Shared mark sentence, with reminders. Only the first sentence changes:

```
In your final message, under the heading "Note check", mark each 🔴 point and each 🔴 project reminder delivered, changed or dropped, and give the reason.
A point is delivered only when you can name evidence outside the note. A point still on Open is not delivered. Unknown is not delivered. Deleting the Miss line, or an End line, without that evidence is dropped, not delivered. If the note has no Open part, do not treat the End checks or the Miss rule as delivered unless you name evidence outside the note for each one.
```

Finish-tool sentence, only when the check is the answer to a `finish` call:

```
Then call finish again. Its handoff is that whole final message, with the "Note check".
```

Variant A. Note present. First copy missing or identical. No reminders. Not a finish-tool answer.

```
[limen] Your note now:
{now}
In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
A point is delivered only when you can name evidence outside the note. A point still on Open is not delivered. Unknown is not delivered. Deleting the Miss line, or an End line, without that evidence is dropped, not delivered. If the note has no Open part, do not treat the End checks or the Miss rule as delivered unless you name evidence outside the note for each one.
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
A point is delivered only when you can name evidence outside the note. A point still on Open is not delivered. Unknown is not delivered. Deleting the Miss line, or an End line, without that evidence is dropped, not delivered. If the note has no Open part, do not treat the End checks or the Miss rule as delivered unless you name evidence outside the note for each one.
```

Variant C. Note missing. No reminders. Finish-tool answer.

```
[limen] You wrote no note in {jobDir}/note.md. From memory, list the 🔴 points of this job.
Those points are the End checks and the Miss rule. Unknown is not delivered.
In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.
A point is delivered only when you can name evidence outside the note. A point still on Open is not delivered. Unknown is not delivered. Deleting the Miss line, or an End line, without that evidence is dropped, not delivered. If the note has no Open part, do not treat the End checks or the Miss rule as delivered unless you name evidence outside the note for each one.
Then call finish again. Its handoff is that whole final message, with the "Note check".
```

Variant D. Note missing. Reminders present. Not a finish-tool answer.

```
[limen] You wrote no note in {jobDir}/note.md. From memory, list the 🔴 points of this job.
Those points are the End checks and the Miss rule. Unknown is not delivered.
Project reminders:
{reminders.text}
In your final message, under the heading "Note check", mark each 🔴 point and each 🔴 project reminder delivered, changed or dropped, and give the reason.
A point is delivered only when you can name evidence outside the note. A point still on Open is not delivered. Unknown is not delivered. Deleting the Miss line, or an End line, without that evidence is dropped, not delivered. If the note has no Open part, do not treat the End checks or the Miss rule as delivered unless you name evidence outside the note for each one.
```

Other mixes use these same clauses. Do not add a runtime parser, a gate, or a new file.

## Tension

A short note cannot hold every task bullet. The Miss line is the compression. End holds two to four checks a person can see. A further bullet goes under Miss, or the Note check marks it dropped. This draft does not add a fourth part for dropped bullets. That part would become a task copy.

Evidence must not become a log. Crossing off means deleting an Open line. The reason, and the evidence, go once in the Note check of the final message. The note does not store counts or command output. Cost: the note alone does not show why a line left Open. `{jobDir}/note.first.md` plus the Note check do. Writing the reason into the note recreates the result logs in the supplied examples.

The three parts repeat each other at the start. Open lines are short names, not a second full copy. After evidence, Open shrinks. The plan remains in End and Miss. This costs lines at the start. It keeps the miss visible after Open shrinks.

`See:` is not an order to run a command. If the task forbids a check, that forbid is a Miss or End line. Do not add a different proof step. Leave the check on Open. The note is not permission to run the forbidden check.

🟡 no longer means free context. The supplied notes used 🟡 for probe logs, test counts, and verdicts. That is the low-signal shape. 🟡 remains only the change line. ⚪ remains an assumption. An assumption is not evidence.

## Obligations kept

- Read the note before other work, or write it. A continued job gets the same first-prompt text.
- Nested list. Plain technical English. One fact on each line. Detail under the point. A time only when it helps.
- Markers 🔴, 🟡, and ⚪ remain. Their use is narrower.
- A changed point keeps its old line. The changed line goes under it.
- Project reminders appear only when the file exists and is not empty. The header stays `Project reminders ({reminders.path}). Keep each 🔴 one as you keep your 🔴 points:`.
- The steer subject is `a point in your note` or `a point in your note or a project reminder`.
- A missing note still says to list the 🔴 points from memory.
- The first copy appears only when it differs from the note now.
- The final message still uses the heading `Note check` and marks each 🔴 point delivered, changed, or dropped, with a reason. Reminders join that sentence only when present.
- The finish-tool sentence stays conditional and unchanged.
- Unknown is not delivered. This draft does not treat unknown as passed.

## What this draft rejects

- One Open list and no Miss line. The finish check would then read a task copy or an empty list.
- One evidence clause in the note for each closed check. That is a result log with a cleaner label.
- A code parser or a gate. Judgment stays in the prompt. The vision says judgment travels as prose.
- A claim that this prompt improves delivery.

## Examples

The new notes are plans written before new evidence. They do not use the old notes' counts, verdicts, or measurements. The old notes are the `note` fields in `/Users/overment/Downloads/limen-note-examples-data/examples.json`, copied verbatim. The task lines are split only from the source spans named in that file. The ellipsis in the page excerpt is not a fourth fact.

### 1 · plant limits

Hard boundary. The miss is the clock rule. The old note investigates idle time. An agent doing that work will stop a clock so a wait does not look stalled. The job time limit is easier to see, so it stays an End check. `Just` is read as "no other limit moves". That reading is not a separate quoted sentence. The excerpt does not give the new limit values. This plan does not invent them.

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
- 🔴 End: Raise only the cargo plant prepare stall limit and the cargo plant tool stall limit. See: those two values are higher, and no other limit moved.
- 🔴 End: The job time limit is unchanged. See: the job time limit value is the same.
- 🔴 Open: clocks still run during a build wait.
- 🔴 Open: only those two cargo limits are raised.
- 🔴 Open: the job time limit is unchanged.
```

### 3 · trusted rows

Reviewer trust rule. The miss is the host-code rule. Naming the composer call is not enough. The row sentence is the scope of that rule, not a second miss. This plan does not copy the old note's PASS verdict, the 347 tests, the scratch probe, or the permanent-test gap. Those are results. The permanent-test gap is the best line in the old note. It is absent here because it is not in the task excerpt. Inventing it would use hindsight.

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
  - 🔴 The trusted rows are setting, App and conversation rows. A review that skips one misses this rule.
- 🔴 End: Show every place that sets that resolver. See: a list of each setter.
- 🔴 End: Each place on that list is host code. See: the review says why each place is host code.
- 🔴 Open: every setter is shown.
- 🔴 Open: only host code can give Compose the resolver.
```

### 8 · continued mixing-trap design

Continued task. The miss is the receipt order. A re-run that keeps the old order does not confirm or correct the 8/10. The old 8/10 is not the new numbers. This plan does not copy 18/18, the extra cell, or the self-check line. Those are results. The work-order limit is only in the old note, as 🟡. This plan does not import it, because the rewrite is a plan before new evidence. On a real continuation, the noteStart rule would keep it: "Live QA must check the work order" says what a later check must do, so it is a restriction, not a result.

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
- 🔴 Miss: Issue the VIDEO receipt first. The old 8/10 is not the new numbers.
- 🔴 End: The doc and the ADR draft both record these decisions. See: both files.
- 🔴 End: Report the new numbers from the offline re-run that issued the VIDEO receipt first. See: the report states those numbers.
- 🔴 Open: VIDEO receipt is issued first.
- 🔴 Open: doc and ADR draft both record the decisions.
- 🔴 Open: new numbers are reported.
```

`these decisions` is the task's wording. The excerpt does not say what was decided. This plan does not invent it.

## Uncertain

- The plant-limits excerpt may hide a sharper miss than the clock rule. This draft did not fill the ellipsis.
- The trusted-rows excerpt may hide a sharper miss than the host-code sentence. The permanent-test gap is hindsight, not a planned check.
- A continued agent may still drop a 🟡 restriction if it reads the line as a finding. The prompt says how to classify it. That is not a proof that the agent will comply.
- About six lines may be too few when many out-of-scope rules bind. Example 5 is that case. This draft does not rewrite it. The Miss line is meant to carry that boundary.
- Neither study identifies a prompt shape that improves delivery. Adam still has to decide whether this text is worth a runtime change.
