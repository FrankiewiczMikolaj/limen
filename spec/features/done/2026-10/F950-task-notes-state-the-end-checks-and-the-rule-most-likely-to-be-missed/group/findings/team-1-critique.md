# Team-1 critique of the draft proposals

Round 2. No rewrite of `group/proposals/team-1.md`. No code change. Effectiveness stays unproven. Both studies found no clear effect.

Checked against `src/job/task-note.ts`, `src/commands/continue.ts`, `src/job/publication.ts`, `hook/finish.ts`, `test/u14-task-note.test.ts`, and the three source excerpts in `examples.json`. Old-note fences in both other proposal files match those `note` fields byte for byte. Commits match the round results: team-2 `29c92a3a56d1281016b6acf8776d83cfd186bb37` and team-3 `e0ae51d39ee81c6f08350a0be748950bcb0e45db`. Each commit adds only that team's proposal file.

## Team-2

### Right

The central split is right. A Done check without a named proof is a task copy. A result without a check is a log. The easy-to-miss line is the rule that can still be broken while the Done checks pass.

The finish text keeps the current obligations that the code actually branches on. Missing note, differing first note, reminders, and the finish-tool sentence match `noteCheck` in `src/job/task-note.ts`. "From memory" stays. Unknown is not passed. A check that vanished without a changed line must be named. That uses the first-note compare the code already shows.

The continued-job sentence is the best one in the drafts: do not treat an earlier agent's Proof pointer as your evidence until you have seen it. `limen continue` copies a parent note into the new job (`src/commands/continue.ts`). A copied pass is the failure mode.

The ⚪ drop is named, not silent. The old notes are verbatim. The draft claims no delivery benefit. Examples 2 and 4 are command lists left as final notes. That claim matches `sources.md`.

### Wrong

The example 3 plan invents text the excerpt does not contain. The task spans are only: the composer draws trusted setting, App and conversation rows; only host code can give Compose the `setting`, `app` and `thread` resolver; show every place that sets it. The new note adds "a generated tree, an App tree, a message body, Markdown" and "a forged attempt from each such source". "App" in the excerpt is a row name, not an App tree. "Forged" is only in the old note's result line. That imports a result and invents proof steps. It also invites the probe log the old note already is.

Example 1 groups two independent boundaries under one proof: clocks still running, and the job time limit unchanged. Those are not one proof. A person can show the limit value and never show the clocks. Their own open question names this. The Easy-to-miss line then repeats both forbids, so it is no longer a rule that survives while the Done checks pass. "Just raise" those two limits, and no others, is still absent.

Example 1's proof, "set raised values for a cargo plant and show Limen reading them", is not in the excerpt. The same draft says the excerpt does not state where the setting lives. The proof invents a runtime read.

Example 8's Proof line says "state the new numbers beside the old 8/10". The FORMAT says a pointer, not a result summary. The example teaches the summary. Two uses of "Proof:" (the method on the Done line, and the later 🟡 pointer) will put results on the Done line.

"Limen already tests these conditions" is false for the continued-job block. `noteStart` branches only on a non-empty reminders file. There is no test for "the note describes earlier work". The `[IF]` block is either always sent, or it needs new code. The draft says both.

Two current FORMAT sentences are not in the proposed FORMAT string: "Put detail under its main point." and "Add a time only when it helps." The commentary says the time rule is kept. The agent never sees it. The round result says every original obligation is preserved. That overclaims.

"Not proven yet: none" can be written while Easy to miss has no evidence. The finish text asks about that rule, but the list the finish check is told to read can already say none.

### Keep

Keep the separate Not-proven-yet list, the from-memory fallback, the silent-drop line, and "do not inherit another agent's Proof pointer". Keep unknown-is-not-passed in the string the agent sees. Do not keep the invented example 3 sources, the grouped example 1 proof, or the claim that the continued-job condition already exists in code.

## Team-3

### Right

The one line is right: the rule the quickest finish would skip, in the task's words, with how a person will see that it held, left unticked until the agent sees that evidence. "A claim in the task or in a message is not evidence" matches the weak notes, which stayed as command lists after the work was done.

An unticked line avoids a second list that can drift. "(not run: <reason>)" keeps a forbidden check visible and does not permit it. Example 1 puts the clock rule on Easy to miss and the job time limit on its own Done line. That split is better than team-2's fold. Example 8's miss is the receipt order, and the earlier 8/10 is not proof.

The condition tags match the code. `[R]` is a non-empty reminders file. `[N]` is a non-empty trimmed note. `[F]` is `[N]` plus a non-empty first note that differs. `[T]` is `finishTool`. `publishJob` writes `task.md` for every job it publishes (`src/job/publication.ts`). A missing `task.md` is an invalid job record (`src/commands/jobs.ts`), not a normal job.

The old notes are verbatim. The 🟡 drop is named. The draft claims no delivery benefit. The native-lane miss and the five unrun checks are in the hook study page. FORMAT is 14 lines, as claimed.

### Wrong

"Every current obligation is kept" is false. The table drops "Add a time only when it helps." It replaces "From memory, list the 🔴 points" with a read of `{task path}`. `test/u14-task-note.test.ts` matches `From memory`. The round result still marks that obligation delivered.

"The runtime conditions and inputs stay the same" is only half true. `{task path}` is not a value `noteCheck` inserts today. `jobDir` is enough to join `task.md`, so no new argument is required. Saying the inputs are unchanged hides a new read and the dropped memory sentence.

"limen continue copies both files" is too strong. `continue.ts` copies `note.md` and `note.first.md` only when `text()` returns a non-empty body. A missing file returns `""` and is not copied. "In a continued job `{first note}` is the earlier job's first note" is false when the parent had no `note.first.md`. It is also incomplete when both files are copied: the copied first file is the parent's first save, not the note this continuation started from. The continuation starts from the parent's later `note.md`. `recordNote` does not replace an existing `note.first.md`. A line-gone compare against that first file is not a compare against the note at the start of this round.

noteStart says do not copy reminders into the note. noteSteer says, for a reminder, copy its line into the note first. Those two strings conflict.

"If the note was written for an earlier task, rewrite it for this one" can erase a restriction that is not in the new excerpt. Example 8's old note says live QA must check the work order. The new note drops that line. noteStart does not say to keep a still-binding restriction that is not a tick. The continue study does not prove a cause, but unfinished points were higher after the hook, including in the copied-note pairs. A rewrite that drops carried limits fits that miss.

Example 3 breaks the trust rule it is testing. "Each place that sets the resolver is host code, or the review names each place that is not" allows a non-host setter if it is named. The excerpt says only host code can give Compose that resolver. "A probe shows..." and "a test or a render shows..." are not in the excerpt. "Probe" is the old note's method. That invites the scratch-probe log.

"You may still prove an open check now" is new. The current check does not say it. It invites a last-minute probe. The FORMAT example's "`npm test` passes" teaches a generic test as a Done check. Example 4's task forbids other checks. The forbidden-check sentence and the example fight.

"Agents seldom miss the main outcome" is not in either study page. The pages say unmet points remain and the samples cannot separate benefit from harm.

A tick plus `(seen: ...)` can still become a short log if the agent writes a count in the pointer. They name the "tick means done" risk. The only guard is prose in noteCheck.

### Keep

Keep the quoted miss rule, the unticked open state, "(not run: <reason>)", and "a claim is not evidence". Keep the example 1 split and the example 8 receipt-order rule. Keep the condition tags, because they match the code. Do not keep the weakened host-code line, the invented probe, the reminder-copy conflict, or the claim that every current obligation survived.

## Own draft, claim check only

This is not a rewrite.

The old-note match and the no-reminders wording check from round 1 still hold. `noteStart` does not detect a continuation. That part of the draft does not claim a runtime test.

This claim is wrong: "The first version of the note is kept. Delete result lines." On a fresh job, `recordNote` writes `note.first.md` once, if that file is absent. On a continuation, `continue.ts` may already have copied the parent's `note.first.md`. `recordNote` does not replace it. Deleting result lines from the copied `note.md` does not store those lines in this job's first file. The kept file can be the parent's older first note, not the text about to be deleted.

The example 1 Open list does not match the draft's own rule of one Open line per End check plus Miss. One Open line restates "only those two", which is a reading of "Just", not a third quoted sentence.

## What I would keep for the revise round

From team-2: the Not-proven-yet list, from-memory, silent-drop, and no inherited proof.

From team-3: the miss rule in the task's words, one unticked state, a not-run reason, and the split of example 1's two forbids.

From neither: invented setters, grouped proofs, a continued-job rewrite that drops a binding limit, or a claim that the current code already tests a new condition.
