My draft task-note prompt has two headings, "Done when" and "Easy to miss". Every line stays unticked until the agent sees its evidence. It is committed as e0ae51d in the team-3 worktree, and the only file in that commit is `spec/features/active/F950-task-notes-state-the-end-checks-and-the-rule-most-likely-to-be-missed/group/proposals/team-3.md`. I did not read other teams' work. No Limen code, hook, test, ticket, board, or HTML page changed. Nothing is pushed. It is unproven that this prompt improves delivery: both studies found no clear effect, and no job has run with this text.

## Answer to the central question

The one thing the agent must write is the task rule that the quickest way to finish would skip or break. The agent quotes the task's words, says how it will see that the rule held, and leaves the line unticked until it sees that evidence.

Reason: the misses in the studies are narrow. One job left a required native lane unrun. Another job named five required checks that did not run. Agents seldom miss the main outcome. They miss a restriction, an exact count, a second place to write, or a required order. A plain list of checks does not single that out. One named line does.

## How the note is built

- The note is a plan, written before evidence exists. Results go in the final message.
- An unticked line is not proven yet. That is the "not proven yet" list, so there is no separate copy of it.
- A tick keeps only a pointer to its evidence, `(seen: <command or file>)`, never output.
- The runtime conditions and inputs stay the same as today. An implementation replaces strings only. It adds no parsing, gate, or state.

## Placeholders and conditions

Limen fills in each `{…}` placeholder:
- `{note path}` is `join(jobDir, "note.md")`.
- `{task path}` is `join(jobDir, "task.md")`. Every job folder has this file.
- `{reminders path}` is the path that `projectReminders` returns, and `{reminders text}` is that file's text, trimmed.
- `{note now}` is `note.md`, trimmed.
- `{first note}` is `note.first.md`, trimmed. `limen continue` copies both note files, so in a continued job this is the earlier job's first note.

Text in `<…>` and `...` is sent as written. The agent fills it in.

Each condition is the test the code uses today:
- `[R]`: the reminders file exists and is not empty. `[no R]`: it does not.
- `[N]`: the note now is not empty. `[no N]`: it is empty or missing.
- `[F]`: `[N]` holds, and the first note is not empty and differs from the note now.
- `[T]`: the check answers a call to the finish tool.

A line without a tag is always sent. The tags themselves are not sent.

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
Added to each steer message. Limen sends one of the two lines.
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

## Every current obligation is kept
- **Read or write the note first:** unchanged.
- **Must-deliver points:** the old 🔴 points become the "Done when" checks and the "Easy to miss" rule.
- **Changed points:** a change still keeps the old line and adds a changed line under it, without the 🟡 marker.
- **Continued job:** noteStart says to rewrite an earlier task's note, and noteCheck labels the first note as possibly from the earlier job.
- **Project reminders:** they appear at the start, in the steer, and at the finish. Reminder files keep their 🔴 format and do not change.
- **Steer that adds scope:** it adds a new unticked check, and a stale proof is unticked.
- **No note:** the agent takes the checks from the task file, not from memory.
- **First note that differs:** it is still shown, and each line that is gone since then must be accounted for.
- **"Delivered, changed or dropped" under "Note check":** kept. "Not proven" is added, and "proven" needs named evidence.
- **Finish tool:** the instruction is unchanged.

## What I rejected from the starting shape, and why
1. **A separate "Not proven yet" list.** At the start it would copy "Done when" line by line. Two copies drift apart. An unticked line states the same fact without a copy.
2. **Evidence in the note.** Results turn the note into a log, and the old notes for examples 1, 3 and 8 are runs of 🟡 result lines. The tick keeps only `(seen: …)`. That is enough to audit a tick and to survive compaction (when older context is summarized away), but too short to hold output.
3. **The 🟡 and ⚪ markers.** 🟡 is the line type that filled the old notes with results and context. An assumption that changes acceptance is just a check that is not proven yet.
4. **"From memory" when there is no note.** `{task path}` is on disk, and rereading it is more reliable after compaction.
5. **A hard six-line limit.** A long acceptance list does not fit. One check can point to the task's own list, and the finish check then gives one line for each item.

The tension between short, complete and evidence-backed resolves this way:
- Coverage lives in the task and in the final message, not in the note.
- A check the job cannot or may not run stays unticked as "(not run: <reason>)", so unknown never becomes passed.
- The note keeps only where the evidence is. The final message holds the evidence itself.
- FORMAT and noteCheck both say that a check in the note never permits a forbidden run.

## Examples

Each new note is the note at the start of the job, written only from the excerpt. The cut text (`…`) may hold more checks. A script compared each old note with `examples.json`: all three match byte for byte. Each old note appears verbatim in the proposal file.

### 1 · Limen worker, plant limits (a hard boundary)

Task:
1. Adam decision (2026-10-23): "Just raise the prepare and tool stall limits for cargo plants."
2. Do not stop the clocks while a build waits.
3. Do not change the job time limit.

Old note: the verbatim excerpt of 🟡 probe-result lines, cut with `…` (queued cargo call 74 samples, control `sleep 300` at 180.8 s, cargo lock wait, "The guess is false for the queue…").

New note:
```text
Done when:
- [ ] A test shows that a cargo plant gets a raised prepare limit and a raised tool stall limit.
- [ ] The diff does not change the job time limit.
Easy to miss:
- [ ] "Do not stop the clocks while a build waits." Proof: the diff adds no pause or stop of either clock during a build wait.
```

Why this rule: the obvious fix for a build that waits is to pause the clocks, and the task forbids exactly that.

### 3 · Alice reviewer, trusted rows (a reviewer trust rule)

Task:
1. The composer draws trusted setting, App and conversation rows.
2. Only host code can give Compose the `setting`, `app` and `thread` resolver.
3. Show every place that sets it.

Old note: verbatim, starting at "🔴 Verdict: PASS. No blocking finding." and followed by four 🟡 result lines (the gates refuse, no permanent forged-approval test, thread rows resolve, 347 + 5 tests passed).

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

### 8 · MEGA worker, continued mixing-trap design (a continued task)

Task:
1. Record these as decided in the doc and the ADR draft.
2. Re-run the video-first chain cases offline with the VIDEO receipt issued first.
3. So the 8/10 result is confirmed or corrected; report the new numbers.

Old note: verbatim. It has the 🟡 chain result lines ("The old 8/10 holds"), the extra cell, the work-order limit, and "No independent review of this round. Self-check only."

New note: this is the earlier job's note rewritten for this task. No line stays ticked, because the rerun is the proof.
```text
Done when:
- [ ] The doc and the ADR draft both record the points that the task names as decided.
- [ ] The video-first chain cases ran again offline.
- [ ] The final message gives the new numbers and says whether 8/10 is confirmed or corrected.
Easy to miss:
- [ ] "with the VIDEO receipt issued first" Proof: the run record shows the VIDEO receipt first in each case. The earlier 8/10 is not proof.
```

Why this rule: the continued job starts with the earlier job's 8/10. A rerun in the old order gives a result that looks the same and proves nothing.

## Still uncertain
- Nothing shows that this prompt improves delivery.
- The rewrites use only the excerpts. The cut text may hold missing checks, or a rule that is easier to miss.
- It is untested whether agents keep the note near six lines, tick only with evidence, and keep `(seen: …)` short.
- A tick can read as "done" instead of "proven". The only guard is the word "proven" in noteCheck. It is prose, not a gate.
- Example 8 has three candidate rules: record in both documents, keep the receipt order, and report the new numbers. I chose the one whose miss gives no visible sign.
- FORMAT grows from 9 to 14 lines. noteCheck grows by three lines, or four when the first note differs. The context cost was not measured.
- The strings are not yet split for the 120-column limit in the code style.

## Note check
- 🔴 The proposal file exists and is committed. **Delivered.** It is commit e0ae51d, and `git show --stat` lists only `group/proposals/team-3.md`.
- 🔴 The file holds the complete four strings, with every conditional variant and the placeholders defined. **Delivered.** They are the `[R]`, `[N]`, `[F]` and `[T]` variants above, matched against the conditions in `src/job/task-note.ts`.
- 🔴 It holds examples 1, 3 and 8, each with three task lines from the excerpt, the old note verbatim, and a new note written as a plan. **Delivered.** The script check returned True for all three old notes. The task lines come only from the excerpts.
- 🔴 The final message is the complete proposal, not a file pointer. **Delivered,** with one change: here the old notes are summarized, not quoted. Reason: they are long, and they are verbatim in the committed file.
- 🔴 Round 1 work alone. **Delivered.** I did not open other teams' proposals.
- 🔴 Commit only group-record files, and do not push, merge, or land. **Delivered.** I made one commit, it has one file, and I pushed nothing.
- 🔴 Do not invent text behind the ellipses, and do not claim an improvement. **Delivered.** The new notes say only what the excerpts say, and the message says effectiveness is unproven.
- 🔴 Keep every current obligation. **Delivered.** The list "Every current obligation is kept" above, and the table in the file, account for each one.
