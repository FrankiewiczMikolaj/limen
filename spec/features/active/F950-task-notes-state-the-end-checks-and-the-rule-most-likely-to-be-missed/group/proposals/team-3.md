# F950 · team-3 proposal · round 1 (draft)

Route: `pi:pi-claude/claude-opus-5-5:xhigh`. I worked alone. Sources: `src/job/task-note.ts`, its callers (`hook/communication.ts`, `hook/steering.ts`, `hook/finish.ts`), the note copy in `src/commands/continue.ts`, the eight examples in `limen-note-examples-data/examples.json` and its page, and the two study pages.

Effectiveness is unproven. Both studies found no clear effect, at low confidence. No job ran with this text.

## Answer

The one thing the agent must write is the task rule that the quickest way to finish would skip or break. The agent writes it in the task's own words, adds how it will see that the rule held, and leaves it unticked until it sees that evidence.

Reason: the misses in the studies are narrow. One job left a required native lane unrun. One job named five required checks that did not run. Agents seldom miss the main outcome. They miss a restriction, an exact count, a second place to write, or a required order. A plain list of checks does not single that out. One named line does.

## Shape

```text
Done when:
- [ ] <two to four checks that a person can run or see at the end>
Easy to miss:
- [ ] "<the task's words>" Proof: <how the agent will see that it held>
```

- The note is a plan, written before evidence exists. Results go in the final message.
- An unticked line is not proven yet. That is the "not proven yet" list. There is no second copy of it.
- A tick needs evidence that the agent saw. The tick carries only a pointer, `(seen: <command or file>)`, never output.
- The runtime conditions and inputs do not change: reminders present, note present, first note differs, finish tool. An implementation replaces strings only. It adds no parsing, gate or state.

## Placeholders and conditions

Limen inserts each `{…}` placeholder:

- `{note path}`: `join(jobDir, "note.md")`.
- `{task path}`: `join(jobDir, "task.md")`. Every job folder has this file (`src/job/publication.ts`).
- `{reminders path}`: `<root>/.agents/limen/reminders.md`, the path that `projectReminders` returns.
- `{reminders text}`: that file, trimmed.
- `{note now}`: `note.md`, trimmed.
- `{first note}`: `note.first.md`, trimmed. In a continued job it is the earlier job's first note, because `limen continue` copies both files.
- `{FORMAT}`: the FORMAT block below.

Text in `<…>` and `...` is literal. The agent reads it as "fill this in".

Each condition is the test that the code uses today:

- `[R]`: the reminders file exists and is not empty. `[no R]`: otherwise.
- `[N]`: `{note now}` is not empty. `[no N]`: otherwise.
- `[F]`: `[N]`, and `{first note}` is not empty and differs from `{note now}`.
- `[T]`: the check answers a `finish` tool call (`finishTool` is true).

A line without a condition is always sent. The condition tags are not part of the sent text.

## FORMAT

```text
Format: plain technical English. Short sentences. Two headings, and at most about six lines under them.
"Done when:" two to four checks that a person can run or see at the end. Keep the task's exact commands, limits, paths and counts where they define acceptance. If the task lists its own acceptance, write one check that points to that list; do not copy it.
"Easy to miss:" the one task rule that the quickest way to finish would skip or break. Quote the task's words, then write "Proof:" and how you will see that it held.
Write each line as "- [ ] ...", one check on each line. An unticked line is not proven yet. Tick it ("- [x]") only after you see its evidence yourself, and add where: "(seen: <command or file>)". A claim in the task or in a message is not evidence.
Put results and numbers in your final message, not in the note. Do not copy the task. Do not add context, steps or a log.
If you cannot or may not run a check, leave it unticked and add "(not run: <reason>)". The note never permits what the task forbids.
When a check or the rule changes, keep its line and add a line under it: "changed: ... Reason: ...". A new check starts unticked. Example:
Done when:
- [ ] A test shows that the 101st request in one minute from one key gets 429.
  - changed: the 61st request gets 429. Reason: the owner steered.
- [ ] A test shows that a key made before this change keeps its old limit.
- [ ] `npm test` passes.
Easy to miss:
- [ ] "Use the Redis client in src/cache.ts." Proof: the diff adds no other store.
```

## noteStart

Added once, to the first prompt of each job, a continued one too.

```text
[limen] Before other work, read your note in {note path}, or write it if there is none.
The note says what must be true at the end and how you will prove it. It is a plan, not a copy of the task and not a log.
If the note was written for an earlier task, rewrite it for this one. Keep an earlier tick only if its proof still holds; else untick it.
{FORMAT}
[R] Project reminders ({reminders path}). Keep each 🔴 one. The finish check asks about each, so do not copy them into the note:
[R] {reminders text}
```

## noteSteer

Added to each steer message. One variant is sent.

```text
[no R] [limen] If this steer changes what done means or the easy-to-miss rule, update {note path}: keep the old line and add under it "changed: ... Reason: ...". A new check starts unticked. Untick a check whose proof the steer made stale.
[R]    [limen] If this steer changes what done means, the easy-to-miss rule or a project reminder, update {note path}: keep the old line and add under it "changed: ... Reason: ...". For a reminder, copy its line into the note first. A new check starts unticked. Untick a check whose proof the steer made stale.
```

## noteCheck

Sent once, before the finish.

```text
[N]    [limen] Your note now:
[N]    {note now}
[no N] [limen] You wrote no note in {note path}. Read the task again in {task path}, and take its end checks and its easy-to-miss rule from there.
[F]    Your note as first saved (from the earlier job, if this job continues one):
[F]    {first note}
[R]    Project reminders:
[R]    {reminders text}
[no R] In your final message, under the heading "Note check", give one line for each check and for the easy-to-miss rule.
[R]    In your final message, under the heading "Note check", give one line for each check, for the easy-to-miss rule, and for each 🔴 project reminder.
[F]    A line of your first note that is gone now also gets a line: changed or dropped, and why.
Mark each line proven, changed, dropped or not proven. Proven: name the evidence, and say so if it is from an earlier job. Changed or dropped: give the reason. Not proven: say what is missing.
Unknown is not proven. A tick without evidence that you can name is not proven. A check that points to a list gets one line for each item on it.
If the task allows it, you may still prove an open check now. Never run a check that the task forbids.
[T]    Then call finish again. Its handoff is that whole final message, with the "Note check".
```

## Each current obligation and where it stays

| Current text | Proposed text |
| --- | --- |
| Before other work, read the note, or write it if there is none. | noteStart line 1, unchanged. |
| Plain technical English. Short, clear sentences. One fact on each line. | FORMAT lines 1 and 4: one check on each line. |
| 🔴 must deliver or must keep. | The "Done when" checks and the "Easy to miss" rule. |
| 🟡 useful context, ⚪ minor or assumption. | Dropped on purpose. See "Rejected", item 3. |
| Put detail under its main point. | The changed line sits under its check. |
| Add a time only when it helps. | Dropped. The job log already records each note change with a time (`recordNote`). |
| When a point changes, keep its line and add "🟡 changed: ... Reason: ...". | Kept as "changed: ... Reason: ...", without the marker. A new check starts unticked. |
| The first prompt of a continued job gets the note text too. | noteStart line 3. noteCheck `[F]` names the earlier job. "Proven" says when evidence is from an earlier job. |
| Project reminders: path at the start, keep each 🔴 one, named in the steer, checked at the finish. | noteStart `[R]`, noteSteer `[R]`, noteCheck `[R]`. Reminder files keep their own 🔴 format. No reminder file changes. |
| A steer that changes a point adds a changed line. | noteSteer. "What done means" also covers a steer that adds scope. A stale proof is unticked. |
| No note: list the 🔴 points from memory. | noteCheck `[no N]`: take them from `{task path}` instead of memory. |
| Show the note at the start when it differs. | noteCheck `[F]`. Each line that is gone since then gets its own line. |
| Mark each 🔴 point delivered, changed or dropped, with the reason, under "Note check". | Kept. "Not proven" is added. "Delivered" becomes "proven", which needs named evidence. |
| With the finish tool: call finish again; the handoff is the whole final message with the "Note check". | noteCheck `[T]`, unchanged. |

## Rejected from the starting shape

1. A separate "Not proven yet" list. At the start no check has evidence, so that list copies "Done when" line by line. Two copies drift: one gets ticked and the other does not. An unticked line states the same fact without a copy. The finish check still names each line that is not proven.
2. Evidence in the note. Results turn the note into a log. Each source note excerpt (1, 3 and 8) is a run of 🟡 result lines. The tick keeps only `(seen: <command or file>)`. That is enough to audit a tick and to keep it after a compaction, and too short to hold output. Numbers go in the final message.
3. The 🟡 and ⚪ markers. 🟡 "useful context" is the line type that filled the old notes with results and context. An assumption that changes acceptance is a check that is not proven yet, so it needs no own marker. Project reminders keep 🔴 because the files already use it, and this ticket does not change them.
4. "From memory" when there is no note. The task is on disk at `{task path}`. Reading it again is more reliable than memory after a compaction.
5. A hard six-line limit. A ticket with eight acceptance bullets does not fit. One check may point to the task's own list, and the finish check then covers each item. The note stays short, and no bullet is dropped.

Kept from the starting shape: the question that the note answers, two to four checks that a person can run or see, one easy-to-miss rule, crossing off only with evidence (as a tick), and a finish check that reads the open lines.

## Short, complete and evidence-backed

- Short against complete: two to four checks cannot hold a long acceptance list. A pointer check holds it, and the finish check expands it. Coverage lives in the task and in the final message, not in the note.
- Complete against evidence: a check that the job cannot or may not run is not dropped and not passed. It stays unticked with "(not run: <reason>)" and reaches the finish as not proven. Unknown never becomes passed.
- Evidence against a log: a tick needs evidence that the agent saw, but the note keeps only where the agent saw it. The final message gives the evidence, one line for each check.
- Evidence against permission: a check in the note never permits a forbidden run. FORMAT and noteCheck both say so. A rule such as example 4's "run no other check" stays binding, also when the note names a check that the agent cannot run.
- Size: FORMAT grows from 9 to 14 lines. noteCheck grows by three lines, or four when the first note differs. The context cost was not measured.

## Examples

Each new note is the note at the start of the job, before evidence exists. It uses only the source excerpt. The cut text (`…`) can hold more checks or a rule that is easier to miss; a real note would include them. Each old note is the saved final note, verbatim, with its cuts.

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
- [ ] "Do not stop the clocks while a build waits." Proof: the diff adds no pause or stop of either clock during a build wait.
```

Why this rule: the plain fix for a build that waits is to pause the clocks. The task forbids exactly that.

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
- [ ] Each place that sets the resolver is host code, or the review names each place that is not.
- [ ] A probe shows that code other than host code cannot give Compose the `setting`, `app` or `thread` resolver.
- [ ] A test or a render shows that the composer draws trusted setting, App and conversation rows.
Easy to miss:
- [ ] "Show every place that sets it." Proof: the review lists each place with its path, not only a verdict.
```

Why this rule: passing tests make a verdict feel complete. The list of places is the proof of the trust rule, and it is the part that takes the most work.

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

New note (the earlier job's note, rewritten for this task; no line stays ticked, because the rerun is the proof):

```text
Done when:
- [ ] The doc and the ADR draft both record the points that the task names as decided.
- [ ] The video-first chain cases ran again offline.
- [ ] The final message gives the new numbers and says whether 8/10 is confirmed or corrected.
Easy to miss:
- [ ] "with the VIDEO receipt issued first" Proof: the run record shows the VIDEO receipt first in each case. The earlier 8/10 is not proof.
```

Why this rule: the continued job starts with the earlier job's note and its 8/10. A rerun in the old order gives a result that looks the same and proves nothing.

## Not proven and uncertain

- No evidence shows that this prompt improves delivery.
- The rewrites use only the excerpts. The cut text can hold checks that the new notes lack, or a rule that is easier to miss.
- It is untested whether agents keep the note near six lines, tick only with evidence, and keep `(seen: …)` short.
- A tick can read as "done" instead of "proven". The word "proven" in noteCheck is the only guard. It is prose, not a gate.
- Agents may pick the wrong easy-to-miss rule. Example 8 has three candidates: both documents, the receipt order, and the new numbers. I chose the one whose miss gives no visible sign.
- The strings are not split for the 120-column code style. An implementation would split them.
