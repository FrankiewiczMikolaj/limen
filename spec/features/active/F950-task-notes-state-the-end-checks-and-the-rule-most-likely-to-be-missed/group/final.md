# Final task-note prompt

Effectiveness is unproven. Both studies found no clear effect. This text claims no delivery benefit. Each round result is present. None records a route failure.

This is a proposal. It does not change Limen code, hooks, tests, or installed prompts.

## Disagreements and decisions

1. Open state. Team-1 dropped the second list. Team-2 kept one short `Not proven yet` line. Team-3 used an unticked box. Decision: one short `Not proven yet` line, plus a `Seen:` place under the line that has evidence. Reason: a full second copy drifts and the finish check then counts each 🔴 point twice. A tick reads as done. Deleting a line does not save it on a continuation: `limen continue` copies `note.first.md` only when that file is not empty (`src/commands/continue.ts`), and `recordNote` does not replace an existing first file. `Seen:` names where the evidence is, not what a run returned. A count, a verdict, or command output does not belong there.

2. Example 3 miss rule. Team-1 and the revised team-2 text use the host-code sentence. Team-3 uses "Show every place that sets it." Decision: the host-code sentence is the Miss line. The list of places is an End line. Reason: the miss is the rule that can still fail after the End lines pass. A list can exist and still include a place that is not host code. Team-3's "report a non-host setter as a finding" allows that failure if it is named.

3. Evidence in the note. Team-1 kept evidence out of the note. Team-2 and team-3 store a place pointer. Decision: `Shown by:` is the plan. `Seen:` is the place, written only after the agent has seen the evidence. Reason: the note file is what the next prompt reads. A deleted line is not a record. A result in the pointer is the log the supplied notes already are.

4. Missing note. Team-3 first replaced "From memory" with a task-file read. All three revised texts keep "From memory". Decision: keep that sentence, then name `{jobDir}/task.md`. Reason: `test/u14-task-note.test.ts` matches `From memory`. `publishJob` writes `task.md` for every job it publishes, so the path is real. The path is not a new function argument.

5. Finish sentence. Team-2's first draft tied it to owning the finish tool. Team-1 and team-3 tied it to the call. Decision: send it only when the check answers a `finish` call. Reason: `hook/finish.ts` registers `finish` for every job, then passes `finishTool` true only from that tool. The settle turn passes false. A detached job has the tool and can still omit the sentence.

6. Long acceptance lists. Team-2 writes every binding check. Team-1 and team-3 point at the task's own list. Decision: one End line points at the list and gives its size. Do not copy it. Do not mark the other items dropped. The Note check gives one line for each item. Reason: a copy is a task copy. "Dropped" misreports a real check. The size makes a missing item visible before the finish.

7. Markers. Team-3 drops 🔴 on note lines because every line would be 🔴. Decision: keep 🔴 on Miss, End, and Not proven yet. Reason: the current mark sentence, which the test matches, names each 🔴 point. The part name carries the distinction. 🟡 in this note is only a `changed` line or a `Seen` line. ⚪ stays for an assumption that cannot change the end. An assumption that can change a line is not ⚪.

8. Reminders. Team-2 first copied a reminder that states an end into the note. Team-3's first steer copied a changed reminder into the note while noteStart forbade the copy. Decision: do not copy reminders into Miss or End. A steer that changes a reminder adds one changed line that names it. Do not edit the reminders file. Reason: `noteCheck` already shows the reminders text. A copy takes the Miss slot and counts the reminder twice.

9. Invented proof. Team-2's first example 3 named sources that are not in the excerpt. Team-3's first example 3 required a probe and a render. Team-2's revised example 1 says "the value Limen uses". Decision: `Shown by:` uses the excerpt's objects only. Do not invent a run, a file, or a mechanism.

10. "Just raise". Team-1 first read it as "no other limit moved". Decision: quote the decision. Do not add a separate constraint the excerpt does not state.

11. Example 8 work-order line. It is in the saved note, not in the task excerpt. Decision: the example plan does not import it. The prompt keeps a carried restriction that says what a later check must do. Reason: the rewrite is a plan from the excerpt, written before new evidence.

## Placeholders

- `{jobDir}` is the job folder.
- `{note path}` is `{jobDir}/note.md`.
- `{first path}` is `{jobDir}/note.first.md`. On a continuation it may be an earlier job's first note, and only if that file was not empty.
- `{reminders path}` is the path `projectReminders` returns when `.agents/limen/reminders.md` exists and is not empty.
- `{reminders text}` is that trimmed text.
- `{now}` is the trimmed note when it exists and is not empty.
- `{first}` is the trimmed first file when it exists and is not empty.
- `{FORMAT}` is the FORMAT string below.

A no-reminders string does not contain the word "reminder".

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
Added after each steer message. One subject is sent.

No reminders:
[limen] If this steer changes a Miss line, an End line, or its name in Not proven yet, add a line under that point in {note path}: "🟡 changed: ... Reason: ...".
Keep the old line. Do not edit it in place. Change the line and its name in Not proven yet in the same edit. If the steer makes a Seen line stale, remove that Seen line and put the name back in Not proven yet. If the steer changes no point, do not edit the note. A new restriction is a 🔴 point. Unknown stays not proven.

With reminders:
[limen] If this steer changes a Miss line, an End line, its name in Not proven yet, or a project reminder, add a line under that point in {note path}: "🟡 changed: ... Reason: ...".
Keep the old line. Do not edit it in place. Change the line and its name in Not proven yet in the same edit. If the steer makes a Seen line stale, remove that Seen line and put the name back in Not proven yet. If the steer changes no point, do not edit the note. A new restriction is a 🔴 point. Unknown stays not proven. Do not edit the reminders file. For a changed reminder, add one line whose text is: reminder, then its first words, then the reason. Do not copy the reminder into Miss or End.

noteCheck
Sent once, before the finish. Order: note now, note at the start, reminders, the mark sentence, then one closing sentence. The finish sentence is sent only when this check answers a finish call. The settle sentence is sent only when the check is the extra turn before a detached run settles. A hosted job does not get that turn.

Note present:
[limen] Your note now:
{now}

Note missing:
[limen] You wrote no note in {note path}. From memory, list the 🔴 points of this job.
Those points are the Miss line and the End lines. None of them is proven yet. The task file is {jobDir}/task.md if you need the words.

First file present, not empty, and different from the note now:
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

The FORMAT block is 497 words and 20 lines. The current FORMAT string is about 116 words. The cost on a live prompt was not measured.

## Examples

The new notes are plans before new evidence. The old notes are the `note` fields in `/Users/overment/Downloads/limen-note-examples-data/examples.json`.

### 1

Task lines:

1. Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants."
2. Do not stop the clocks while a build waits.
3. Do not change the job time limit.

Old note:

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
- 🔴 Miss: Do not stop the clocks while a build waits. Shown by: the clocks still run while a build waits.
- 🔴 End: The cargo plant prepare limit is raised. Shown by: the prepare limit value. The decision says "Just raise the prepare and tool stall limits for cargo plants."
- 🔴 End: The cargo plant tool stall limit is raised. Shown by: the tool stall limit value.
- 🔴 End: The job time limit is unchanged. Shown by: the job time limit value.
- 🔴 Not proven yet: clocks still run; raised prepare limit; raised tool stall limit; unchanged job time limit.
```

### 3

Task lines:

1. the composer draws trusted setting, App and conversation rows
2. Only host code can give Compose the `setting`, `app` and `thread` resolver.
3. Show every place that sets it.

Old note:

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
- 🔴 Miss: Only host code can give Compose the `setting`, `app` and `thread` resolver. Shown by: why each named place is host code.
- 🔴 End: Every place that sets that resolver is named. Shown by: the list of places.
- 🔴 End: The composer draws trusted setting, App and conversation rows. Shown by: those rows.
- 🔴 Not proven yet: only host code gives the resolver; every setter is named; trusted rows are drawn.
```

### 8

Task lines:

1. Record these as decided in the doc and the ADR draft.
2. (1) re-run the video-first chain cases offline with the VIDEO receipt issued first, so the 8/10 result is confirmed or corrected;
3. report the new numbers;

Old note:

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
- 🔴 Miss: "with the VIDEO receipt issued first". The old 8/10 is not the new numbers. Shown by: the re-run record shows the VIDEO receipt first.
- 🔴 End: The doc and the ADR draft both record these decisions. Shown by: both files.
- 🔴 End: The report gives the new numbers and says whether the 8/10 is confirmed or corrected. Shown by: that report.
- 🔴 Not proven yet: VIDEO receipt first; decisions in both files; new numbers confirm or correct the 8/10.
```
