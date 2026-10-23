Team-2 and team-3 both keep the old notes verbatim and claim no delivery gain. Team-2 invents proof sources the excerpt does not contain. Team-3's "every obligation is kept" is false, and its trusted-rows plan allows a non-host setter.

Saved at `spec/features/active/F950-task-notes-state-the-end-checks-and-the-rule-most-likely-to-be-missed/group/findings/team-1-critique.md`. Commit `0635777af2c446d5efe02d0b1049ccc9a4f843b1` on `limen/2026-10-23-f950-team-1-grok-4-7-draft-2c6981c0`. One file. The proposal file was not rewritten. No code change. No route failure.

Checked: both other old-note fences match `examples.json` byte for byte. Team-2 commit `29c92a3a56d1281016b6acf8776d83cfd186bb37` and team-3 commit `e0ae51d39ee81c6f08350a0be748950bcb0e45db` each add only that team's proposal. `noteStart` branches only on reminders (`src/job/task-note.ts`). `limen continue` copies `note.md` and `note.first.md` only when each body is non-empty (`src/commands/continue.ts`). `publishJob` writes `task.md`. `test/u14-task-note.test.ts` matches `From memory`.

## Team-2

Right: a Done check without a proof is a task copy; a result without a check is a log; the miss rule is what can still break while Done checks pass. Missing note, first-note diff, reminders, and the finish-tool sentence match the current branches. From-memory stays. Unknown is not passed. Do not treat an earlier agent's Proof pointer as your evidence. The ⚪ drop is named. No delivery claim.

Wrong: example 3 adds "generated tree, App tree, message body, Markdown" and a forged attempt from each. Those words are not in the task spans. "Forged" is only in the old result note. Example 1 groups clocks and the job time limit under one proof, then repeats both in Easy to miss, so the miss rule no longer survives the Done checks. "Show Limen reading them" is not in the excerpt. Example 8 says "state the new numbers", which is a result summary, against its own pointer rule. "Limen already tests" the continued-job condition is false. The proposed FORMAT omits "Put detail under its main point" and "Add a time only when it helps", while the round result says every obligation is preserved. "Not proven yet: none" can be true while Easy to miss has no evidence.

Keep: the Not-proven-yet list, from-memory, silent-drop, and no inherited proof. Do not keep the invented sources or the grouped proof.

## Team-3

Right: the miss rule in the task's words, left unticked until the agent sees the evidence. A claim in the task is not evidence. An unticked line avoids a second drifting list. "(not run: <reason>)" does not permit a forbidden check. Example 1 splits the clock rule from the job time limit. Example 8's miss is the receipt order. The `[R] [N] [F] [T]` tags match the code. Old notes are verbatim. The named 🟡 drop is honest. No delivery claim. The native-lane miss and the five unrun checks are on the hook study page.

Wrong: "every current obligation is kept" contradicts its own table. It drops the time sentence and replaces "From memory" with a `{task path}` read. `{task path}` is not inserted by `noteCheck` today. Continue does not always copy both note files, and a copied `note.first.md` is the parent's first save, not the note this round started from. noteStart says do not copy reminders into the note; noteSteer says copy the reminder line in first. "Rewrite the note for this task" drops example 8's work-order limit, and the prompt does not say to keep a binding restriction that is not a tick. Example 3 allows a non-host setter "if the review names it", and it invents a probe and a render. "You may still prove an open check now" invites a last-minute probe. "`npm test` passes" in the FORMAT example fights the forbidden-check rule. "Agents seldom miss the main outcome" is not in the study pages.

Keep: the quoted miss rule, the unticked state, the not-run reason, the example 1 split, and the condition tags. Do not keep the weakened host-code line or the obligation claim.

## Own draft, not rewritten

This claim is wrong: "The first version of the note is kept. Delete result lines." On a continuation, an existing copied `note.first.md` is not replaced by `recordNote`. Deleting result lines does not store them there.

## Note check

- Propose the task-note prompt. Do not implement it: delivered. This round wrote a critique only. No source file changed.
- Round 1 is draft. Work alone. Do not read other teams: changed. Reason: the group moved to critique. This round read team-2 and team-3.
- Save the proposal at group/proposals/team-1.md and commit only group-record files: changed. Reason: the brief forbids a rewrite in critique. This round saved `group/findings/team-1-critique.md` only. Commit `0635777af2c446d5efe02d0b1049ccc9a4f843b1`.
- The note states the end checks, how to prove them, and the one rule most likely to be missed: delivered. The critique keeps that as the test for both drafts.
- Rewrite examples 1, 3, and 8 as plans before new evidence. Keep old notes verbatim: delivered. Both other drafts' old notes match `examples.json`. This round did not rewrite the examples.
- Do not claim the prompt improves delivery. Effectiveness is unproven: delivered. The critique says both studies found no clear effect.
- Do not edit source, hooks, tests, ticket, board, or installed prompts: delivered. The commit is one markdown file.
- Do not create the HTML page. The coordinator owns it: delivered. No HTML file was written.
- Name what each other proposal can still miss, what invites task copy or a result log, and any source constraint it loses: delivered. The file names the invented proofs, the grouped check, the dropped from-memory sentence, and the reminder-copy conflict.
