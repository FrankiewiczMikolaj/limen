The one thing the agent must write is the Miss line: the task rule a busy agent will most likely break, stated as a keep, and left on Open until that rule has its own evidence. End checks say what a person can run or see. Open lists checks with no evidence. The note does not store the evidence. Effectiveness is unproven. Both supplied studies found no clear effect. This draft does not claim better delivery.

Saved at `spec/features/active/F950-task-notes-state-the-end-checks-and-the-rule-most-likely-to-be-missed/group/proposals/team-1.md`. Commit `e605d59048a53656fec83009004c6c81d5c4dc68` on `limen/2026-10-23-f950-team-1-grok-4-7-draft-2c6981c0`. One file, 303 lines. Worktree clean after the commit. No push, no code edit, no HTML page. Route `pi:xai/grok-4.7:high` did not fail.

Checked: the three old notes in that file match the `note` fields in `/Users/overment/Downloads/limen-note-examples-data/examples.json` byte for byte. The no-reminders `noteStart` and `noteSteer` strings do not contain "reminder". Sources read: `src/job/task-note.ts`, `hook/finish.ts`, `hook/steering.ts`, `test/u14-task-note.test.ts`, and the four Downloads files named in the brief.

## FORMAT

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

## noteStart

No reminders:

```
[limen] Before other work, read your note in {jobDir}/note.md, or write it if there is none.
{FORMAT}
If the note already exists, keep every 🔴 point that still binds. A 🟡 line that states a restriction, or a check that is not yet done, also still binds. Move it under Miss or End. A line that says what a later check must do is a restriction. A line that says what already happened is a result. Delete result lines. The first version of the note is kept. Add End checks for this task. Do not replace the note with results.
```

With reminders, the same text, then:

```
Project reminders ({reminders.path}). Keep each 🔴 one as you keep your 🔴 points:
{reminders.text}
```

## noteSteer

No reminders:

```
[limen] If this steer changes a point in your note, add a line under that point in {jobDir}/note.md: "🟡 changed: ... Reason: ...".
Keep the old line. Do not delete it. If the steer changes what done means, change the End line and the matching Open line. If it changes the rule most likely to be missed, change the Miss line and keep it on Open until the new rule has evidence. A new restriction is a 🔴 point. Unknown stays open.
```

With reminders, the subject is `a point in your note or a project reminder`, and the text adds: keep each 🔴 project reminder unless the steer changes that reminder, then add the changed line under it.

## noteCheck

Clauses stay in the current order. A point is delivered only with evidence outside the note. A point still on Open is not delivered. Unknown is not delivered. Deleting Miss or End without evidence is dropped, not delivered. No Open part does not mean the checks passed.

Missing note keeps: `You wrote no note in {jobDir}/note.md. From memory, list the 🔴 points of this job.` Then: those points are the End checks and the Miss rule.

The mark sentence stays `In your final message, under the heading "Note check", mark each 🔴 point delivered, changed or dropped, and give the reason.` With reminders it is `each 🔴 point and each 🔴 project reminder`. The finish-tool sentence is unchanged and only present when `finishTool` is true: `Then call finish again. Its handoff is that whole final message, with the "Note check".`

Placeholders: `{jobDir}` job folder; `{reminders.path}` and `{reminders.text}` only when `.agents/limen/reminders.md` exists and is not empty; `{now}` and `{first}` are the trimmed note and first copy.

## Examples

Plans before new evidence. Old notes are verbatim from `examples.json`.

1. Plant limits. Task lines: Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants." / Do not stop the clocks while a build waits. / Do not change the job time limit. Miss: do not stop the clocks. `Just` is read as no other limit moved. New values are not invented.

3. Trusted rows. Task lines: the composer draws trusted setting, App and conversation rows / Only host code can give Compose the `setting`, `app` and `thread` resolver. / Show every place that sets it. Miss: only host code can give that resolver. The PASS verdict, 347 tests, scratch probe, and permanent-test gap are results and are not in the plan.

8. Continued mixing-trap design. Task lines: Record these as decided in the doc and the ADR draft. / (1) re-run the video-first chain cases offline with the VIDEO receipt issued first, so the 8/10 result is confirmed or corrected; / report the new numbers; Miss: issue the VIDEO receipt first. The old 8/10 is not the new numbers. The work-order limit stays out of this plan because it is a result-note line. The prompt would keep it on a real continuation because it says what a later check must do.

## Rejected

One Open list with no Miss line. Evidence clauses inside the note. A parser or a gate. A delivery claim. 🟡 as free context. The marker remains for the changed line only.

## Uncertain

The ellipses may hide a sharper miss than the clock rule or the host-code rule. A continued agent may still drop a 🟡 restriction. Six lines may be too few when many out-of-scope rules bind. Neither study names a prompt shape that improves delivery.

## Note check

- Propose the task-note prompt and do not implement it: delivered. The commit adds only the group proposal file.
- Round 1 is draft, alone, and no other team files were read: delivered. This round read the ticket, the brief, the current prompt, and the named Downloads sources.
- Save `group/proposals/team-1.md` and commit only that group-record file: delivered. Commit `e605d59048a53656fec83009004c6c81d5c4dc68`. `git status` was clean after the commit.
- State the end checks, the proof, and the rule most likely to be missed: delivered, changed. The required line is the Miss rule, kept open until it has its own evidence. Reason: the supplied notes logged findings and lost the hard boundary.
- Rewrite examples 1, 3, and 8 as plans and keep the old notes verbatim: delivered. A Python compare against `examples.json` matched all three old notes byte for byte.
- Do not claim better delivery: delivered. The proposal says both studies found no clear effect.
- Do not edit source, hooks, tests, the ticket, the board, or installed prompts: delivered. `git show --stat` for that commit is one markdown file.
- Do not create the HTML page: delivered. No HTML file was written. The coordinator owns that page.
