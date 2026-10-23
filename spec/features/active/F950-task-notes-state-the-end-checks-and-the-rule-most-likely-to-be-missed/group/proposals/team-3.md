# F950 · team-3 proposal · round 3 (revise)

Route: `pi:pi-claude/claude-opus-5-5:xhigh`. Sources: `src/job/task-note.ts`, its callers (`hook/communication.ts`, `hook/steering.ts`, `hook/finish.ts`), the note copy in `src/commands/continue.ts`, `test/u14-task-note.test.ts`, the eight examples in `limen-note-examples-data/examples.json` and its page, the two study pages, and the round 2 critiques of team-1 and team-2.

Effectiveness is unproven. Both studies found no clear effect, at low confidence. No job ran with this text.

## Answer

The one thing the agent must write is the task rule that the quickest way to finish would skip or break. The agent quotes the task's words, adds how a person will see that the rule held, and leaves the line unticked until it sees that evidence. Ticking every other check does not tick this line.

This is a design reason, not evidence of an effect. The misses that the hook study names are narrow: one job left a required native lane unrun, and one job named five required checks that did not run. A list of checks alone does not single out the one that the quick path skips. One named line does.

## Shape

```text
Done when:
- [ ] <two to four checks: what a person runs or sees, and what it must show>
Easy to miss:
- [ ] "<the task's words>" Proof: <how a person will see that it held>
```

- The note is a plan, written before evidence exists. Results go in the final message.
- An unticked line is not proven yet. That is the "not proven yet" list. There is no second copy of it.
- A tick needs evidence that the agent saw. The tick carries only where the agent saw it, `(seen: <command or file>)`, never what it showed.
- The changed line keeps its current literal, `🟡 changed: ... Reason: ...`.
- The runtime conditions do not change. Each string takes the same arguments as today. The only new inserted value is `{task path}`, which is joined from `jobDir` like `{note path}`; no new file is read. An implementation adds no parsing, gate or state.

## Placeholders and conditions

Limen inserts each `{…}` placeholder:

- `{note path}`: `join(jobDir, "note.md")`.
- `{task path}`: `join(jobDir, "task.md")`. `publishJob` writes this file for every job (`src/job/publication.ts:102`). This value is new in noteCheck.
- `{reminders path}`: `<root>/.agents/limen/reminders.md`, the path that `projectReminders` returns.
- `{reminders text}`: that file, trimmed.
- `{note now}`: `note.md`, trimmed.
- `{first note}`: `note.first.md`, trimmed. `recordNote` writes it once and never replaces it. `limen continue` copies it from the parent only when the parent's copy is not empty (`src/commands/continue.ts:435-440`). In a chain of continued jobs it is therefore the first note of the earliest job that had one. This job proves it: its `note.first.md` is the round 1 note, two jobs back.
- `{FORMAT}`: the FORMAT block below.

Text in `<…>` and `...` is literal. The agent reads it as "fill this in".

Each condition is the test that the code uses today:

- `[R]`: the reminders file exists and is not empty. `[no R]`: otherwise.
- `[N]`: `{note now}` is not empty. `[no N]`: otherwise.
- `[F]`: `[N]`, and `{first note}` is not empty and differs from `{note now}`.
- `[T]`: the check answers a `finish` tool call (`check(true)`, `hook/finish.ts:65`). The settle turn sends it with `finishTool` false (`hook/finish.ts:86` and `:94`).

A line without a condition is always sent. The condition tags are not part of the sent text.

## FORMAT

```text
Format: plain technical English. Short sentences. Two headings, and at most about six lines under them.
"Done when:" two to four checks for the end. Write each one as what a person runs or sees, and what it must show. Keep the task's exact commands, limits, paths and counts where they define acceptance.
If the task has its own acceptance list, write one check that points to it and gives its size, such as "All 5 Acceptance bullets in <file> hold." Do not copy the list.
"Easy to miss:" the one task rule that the quickest way to finish would skip or break. Quote its words, then write "Proof:" and how a person will see that it held. Except for that quote, do not copy the task.
Write each line as "- [ ] ...". An unticked line is not proven yet. Tick it ("- [x]") only after you see its evidence yourself, and add where you saw it: "(seen: <command or file>)". Write where, not what it showed. A claim in the task or in a message is not evidence. Ticking every check does not tick the easy-to-miss line; it needs its own evidence.
Put results and numbers in your final message, not in the note. Do not add context, steps or a log.
If you cannot or may not run a check, leave it unticked and add "(not run: <reason>)". The note never permits what the task forbids.
When a check or the rule changes, keep its line and add a line under it: "🟡 changed: ... Reason: ...". A new check starts unticked. Add a time only when it helps. Example:
Done when:
- [ ] A test shows that the 101st request in one minute from one key gets 429.
  - 🟡 changed 14:05: the 61st request gets 429. Reason: the owner steered.
- [ ] A test shows that a key made before this change keeps its old limit.
Easy to miss:
- [ ] "Use the Redis client in src/cache.ts." Proof: the diff adds no other store.
```

## noteStart

Added once, to the first prompt of each job, a continued one too.

```text
[limen] Before other work, read your note in {note path}, or write it if there is none.
The note says what must be true at the end and how you will prove it. It is a plan, not a copy of the task and not a log.
{FORMAT}
If the note already exists, check it against this task before you act. It can come from an earlier job.
Keep each line that still limits this task. Remove a line that only says what happened; if it shows a limit for this task, first write that limit as a check.
Keep an earlier tick only if its proof still holds; else untick it. Add the checks that this task needs.
[R] Project reminders ({reminders path}). Keep each 🔴 one. Do not copy them into the note; the finish check shows them. Only a steer that changes one adds a line:
[R] {reminders text}
```

## noteSteer

Added to each steer message. One variant is sent.

```text
[no R] [limen] If this steer changes what done means or the easy-to-miss rule, update {note path}: keep the old line and add under it "🟡 changed: ... Reason: ...". A new check starts unticked. Untick a check whose proof the steer made stale. If the steer changes no point in the note, do not edit the note.
[R]    [limen] If this steer changes what done means, the easy-to-miss rule or a project reminder, update {note path}: keep the old line and add under it "🟡 changed: ... Reason: ...". For a changed reminder, add one line: "🟡 changed: reminder "<its first words>" ... Reason: ...". A new check starts unticked. Untick a check whose proof the steer made stale. If the steer changes no point in the note and no reminder, do not edit the note.
```

## noteCheck

Sent once, before the finish.

```text
[N]    [limen] Your note now:
[N]    {note now}
[no N] [limen] You wrote no note in {note path}. From memory, and from the task in {task path}, list the end checks and the easy-to-miss rule of this job. None of them is proven yet.
[F]    Your note at the start:
[F]    {first note}
[F]    In a continued job, that note can come from an earlier job. If it was for an earlier task, one line covers all of it. Otherwise each of its lines that is gone now, with no changed line under it, gets a line: changed or dropped, and why.
[R]    Project reminders:
[R]    {reminders text}
[no R] In your final message, under the heading "Note check", give one line for each check and for the easy-to-miss rule.
[R]    In your final message, under the heading "Note check", give one line for each check, for the easy-to-miss rule, and for each 🔴 project reminder.
[no R] Mark a check proven, not proven, changed or dropped. Mark the easy-to-miss rule kept, broken, not proven or changed.
[R]    Mark a check proven, not proven, changed or dropped. Mark the easy-to-miss rule and each reminder kept, broken, not proven or changed.
Proven and kept need the evidence: where you saw it, and whether it is from an earlier job. Changed and dropped need the reason. Not proven needs what is missing.
Unknown is not proven. A tick without evidence that you can name is not proven. A check that points to a list gets one line for each item on it.
Report the state as it is. Do not run a check that the task forbids or limits.
[T]    Then call finish again. Its handoff is that whole final message, with the "Note check".
```

## Current obligations: kept, changed or dropped

| Current text | Proposed text | Status |
| --- | --- | --- |
| Before other work, read the note, or write it if there is none. | noteStart line 1, verbatim. | Kept |
| Plain technical English. Short, clear sentences. One fact on each line. | FORMAT line 1, and one check on each `- [ ]` line. | Kept |
| 🔴 must deliver or must keep. | The "Done when" checks and the "Easy to miss" rule. | Changed |
| 🟡 useful context, ⚪ minor or assumption. | No free context or assumption lines. An assumption that changes acceptance is an unticked check. 🟡 stays on the changed line only. | Dropped |
| Put detail under its main point. | The changed line sits under its check. | Kept |
| Add a time only when it helps. | FORMAT, verbatim, with a time in the example. | Kept |
| When a point changes, keep its line and add "🟡 changed: ... Reason: ...". | The same literal. A new check starts unticked. | Kept |
| A continued job gets the note text in its first prompt. | noteStart: check an existing note against this task, keep each line that still limits it, keep a tick only if its proof holds. noteCheck `[F]` names the earlier job. | Kept and extended |
| Project reminders: path at the start, keep each 🔴 one, named in the steer, checked at the finish. | noteStart `[R]`, noteSteer `[R]`, noteCheck `[R]`. Reminder files keep their own format. | Kept |
| A steer that changes a point adds a changed line. | noteSteer. A steer that adds scope adds an unticked check; a stale proof is unticked; an unrelated steer leaves the note alone. | Kept and extended |
| No note: list the 🔴 points from memory. | "From memory, and from the task in {task path}". | Kept and extended |
| Show the note at the start when it differs. | noteCheck `[F]`, with the label verbatim. Each line that is gone, with no changed line, is accounted for. | Kept and extended |
| Mark each 🔴 point delivered, changed or dropped, with the reason, under "Note check". | A check is proven, not proven, changed or dropped. The rule and each reminder are kept, broken, not proven or changed. The heading "Note check" is verbatim. | Changed |
| With the finish tool: call finish again; the handoff is the whole final message with the "Note check". | noteCheck `[T]`, verbatim. | Kept |

Two obligations change meaning, and one class of lines is dropped. Nothing else is lost.

### Strings that `test/u14-task-note.test.ts` matches

- `:32`, no "reminder" in the first prompt without a reminders file: kept. No `[no R]` string and no untagged line contains the word, which also keeps the README rule "When the file is absent, no injection mentions reminders."
- `:44`, the reminders header, then the reminders text at the end of the first prompt: kept.
- `:49`, "now:", the note, "Your note at the start:", the first note: kept.
- `:52`, "reminders:", the text, then "In your final … each 🔴 point and each 🔴 project reminder": changed. The new note has no 🔴 points, so the sentence names checks, the rule and reminders. The test needs an edit when the prompt is implemented.
- `:61`, "You wrote no note in … From memory … Then call finish again": kept.

## Changes in this round, from the critiques

1. The reminder conflict is fixed. noteStart said "do not copy them into the note", and noteSteer said "copy its line into the note first" (team-1, team-2). Now noteStart says that only a steer that changes a reminder adds a line, and noteSteer adds one changed line, which is not a copy.
2. The continued-job text no longer drops a learned limit. "If the note was written for an earlier task, rewrite it" fired only for a different task and kept no restriction (team-1, team-2). Now an existing note is checked against this task, each line that still limits the task stays, and a result line that shows a limit becomes a check before it goes. The rule comes from team-1, with team-2's guard for a warning phrased as a finding.
3. "If the task allows it, you may still prove an open check now" is removed. It invited a late run that breaks a run-once task such as examples 2 and 4 (team-1, team-2). noteCheck now says "Report the state as it is. Do not run a check that the task forbids or limits."
4. The FORMAT example no longer has "`npm test` passes". A stock command teaches a check that the task may not name or may forbid (team-1, team-2).
5. Example 3 is fixed. "Is host code, or the review names each place that is not" read as if a non-host setter were acceptable (team-1, team-2). The probe and the render came from outside the excerpt, and the probe is the old note's method (team-1). See the example.
6. "Add a time only when it helps" is back. A time can be content, such as a due time, and the job log holds only the time of each note change (team-2).
7. "From memory" is back, now with the task file (team-1). The test at `:61` matches it again.
8. The changed line keeps the 🟡 literal. Dropping the marker broke the convention that coordinators read, with no gain (team-2).
9. "Quote the task's words" and "Do not copy the task" now agree: "Except for that quote, do not copy the task" (team-2).
10. A Done-when check now states its proof at plan time: "what a person runs or sees, and what it must show" (team-2).
11. A pointer check gives the list's size, so a missed item is visible as a count during the work (team-2).
12. The pointer rule says "Write where, not what it showed", so `(seen: …)` cannot hold a count (team-1).
13. "Ticking every check does not tick the easy-to-miss line; it needs its own evidence" (team-1).
14. The rule and the reminders get their own marks: kept, broken, not proven or changed (team-2).
15. "Agents seldom miss the main outcome" is removed. The study pages do not say it (team-1).
16. "Every current obligation is kept" is replaced by the status table. The old claim contradicted its own table (team-1).
17. "The inputs do not change" now names the one new inserted value, `{task path}` (team-1).
18. `{first note}` is defined correctly. It is copied only when not empty, and in a chain it is the earliest first note (team-1). This job's `note.first.md` is the round 1 note, two jobs back.

## Critique points I reject

1. Team-1 says the example 8 rewrite "drops example 8's work-order limit". The line "Live QA must check the work order" is in `records/08/note.txt` and not in `records/08/first_note.txt`. Example 8 learned it during its own rerun. A plan at the start of that job cannot hold it. The general point stands, and change 2 covers it for the next continuation.
2. Team-2 says the pointer check "defers the whole acceptance list to the finish". The agent works from the task, and the list is in the task. Copying eight bullets into the note is the task copy that the brief forbids. I keep the pointer and add the list's size (change 11).
3. Team-2 says "The final message gives the new numbers" cannot be ticked before that message exists. The task says "report the new numbers", so the report is the deliverable. The Note check sits in that same message and names it as the evidence. The check stays.
4. Team-2 asks for a "Proof:" clause on every Done-when line. A check written as "what a person runs or sees, and what it must show" already states its proof. A second label on each line costs words, and team-2's own draft shows the risk: "Proof:" for both the plan and the evidence. Only the rule line has "Proof:", because a quoted rule is not itself a check.
5. Team-1 and team-2 keep 🔴 on every line. When every line is 🔴, the marker carries no information. The headings and the tick carry the weight.

## Short, complete and evidence-backed

- Short against complete: two to four checks cannot hold a long acceptance list. A pointer check with the list's size holds it, and the finish check gives one line for each item.
- Complete against evidence: a check that the job cannot or may not run is not dropped and not passed. It stays unticked with "(not run: <reason>)" and reaches the finish as not proven. Unknown never becomes passed.
- Evidence against a log: a tick needs evidence that the agent saw, but the note keeps only where the agent saw it. The final message gives the evidence, one line for each check.
- Evidence against permission: a check in the note never permits a forbidden run, and the finish check never asks for a new run. A rule such as example 4's "run no other check" stays binding.
- Size: FORMAT has 14 lines, against 9 now. noteStart adds four lines outside FORMAT. noteCheck adds four lines, or five when the first note differs. The context cost was not measured.

## Examples

Each new note is the note at the start of the job, before evidence exists. It uses only the words of the excerpt and plan words for how to see a result. The cut text (`…`) can hold more checks or a rule that is easier to miss; a real note would include them. Each old note is the saved final note, verbatim, with its cuts.

### 1 · Limen worker — plant limits (hard boundary)

Task:

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
Done when:
- [ ] A test shows that a cargo plant gets a raised prepare limit and a raised tool stall limit.
- [ ] The diff does not change the job time limit.
Easy to miss:
- [ ] "Do not stop the clocks while a build waits." Proof: the diff adds no code that pauses or stops the clocks while a build waits.
```

Why this rule: the plain fix for a build that waits is to pause the clocks. The task forbids exactly that. The job time limit is easier to see, so it is a Done-when check.

### 3 · Alice reviewer — trusted rows (reviewer trust rule)

Task:

1. The composer draws trusted setting, App and conversation rows.
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
Done when:
- [ ] The review answers whether only host code gives Compose the `setting`, `app` and `thread` resolver.
- [ ] The review reports any setter that is not host code as a blocking finding.
Easy to miss:
- [ ] "Show every place that sets it." Proof: the review lists each place with its path, not only a verdict.
```

Why this rule: passing tests make a verdict feel complete. The list of places is what proves the trust rule, and it is the part that takes the most work. A reviewer does not make the rule true. The end state is a review that answers it, and a setter that breaks it is a blocking finding.

### 8 · MEGA worker — continued mixing-trap design (continued task)

Task:

1. Record these as decided in the doc and the ADR draft.
2. Re-run the video-first chain cases offline with the VIDEO receipt issued first.
3. So the 8/10 result is confirmed or corrected; report the new numbers.

Old note:

```text
…
  - 🟡 Chain: labelled 18/18 right; unlabelled 6/6 crossed (all Haiku). The old 8/10 holds; the receipt flaw did not cause it.
  - 🟡 Extra cell (list video first, work audio first): Sonnet, Haiku, GPT write audio first (12/12); Opus writes video first (4/4). 16/16 right.
  - 🟡 So video first catches an unlabelled hand-off only when the harness works in list order. Live QA must check the work order.
…
  - 🟡 No independent review of this round. Self-check only.
```

New note (the earlier job's note, checked against this task; no line stays ticked, because the rerun is the proof):

```text
Done when:
- [ ] The doc and the ADR draft both record the points that the task names as decided.
- [ ] The video-first chain cases ran again offline.
- [ ] The final message gives the new numbers and says whether 8/10 is confirmed or corrected.
Easy to miss:
- [ ] "with the VIDEO receipt issued first" Proof: the rerun's saved output shows the VIDEO receipt first in each case. The earlier 8/10 is not proof.
```

Why this rule: the continued job starts with the earlier job's 8/10. A rerun in the old order gives a result that looks the same and proves nothing.

## Not proven and uncertain

- No evidence shows that this prompt improves delivery.
- The rewrites use only the excerpts. The cut text can hold checks that the new notes lack, or a rule that is easier to miss.
- It is untested whether agents keep the note near six lines, tick only with evidence, and keep `(seen: …)` to a place.
- A tick can read as "done" instead of "proven". The words "proven" and "kept" in noteCheck are the only guard. They are prose, not a gate.
- The three teams chose three different rules for example 3. I keep "Show every place that sets it", because it is the deliverable that the quick path skips. Team-1's host-code rule is the subject of the review, and here it is a Done-when check.
- One test assertion (`test/u14-task-note.test.ts:52`) needs an edit when the prompt is implemented.
- The strings are not split for the 120-column code style. An implementation would split them.
