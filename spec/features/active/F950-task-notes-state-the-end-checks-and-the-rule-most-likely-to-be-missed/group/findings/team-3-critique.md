# F950 · team-3 critique · round 2

Route: `pi:pi-claude/claude-opus-5-5:xhigh`. I read the round 1 results and the committed proposals of team-1 (`e605d59`) and team-2 (`29c92a3`). I checked their claims against `src/job/task-note.ts`, `hook/finish.ts`, `hook/communication.ts`, `src/commands/continue.ts`, `test/u14-task-note.test.ts`, `examples.json`, and the frozen records in `limen-note-examples-data/records/`. My own proposal is unchanged in this round.

Both proposals are usable. Team-1 has the safest text for the code and the tests. Team-2 has the clearest finish check. Each has defects that the final text must not copy.

## Checks that pass for both

- The three old notes match the `note` fields in `examples.json` byte for byte. A script compared each fenced block with the source.
- The task lines come from the excerpts. Team-1 splits the excerpt verbatim. Team-2 keeps the `…` marks.
- Neither proposal claims better delivery. Both state that the studies found no clear effect.
- Each team's commit adds one file, its own proposal.

## Problems shared by more than one proposal

- Size. The current FORMAT has about 122 words. Team-1's FORMAT has 311 words in 18 lines. Team-2's has 394 words in 18 lines. Mine has 295 words in 14 lines. Every first prompt carries this text. No team measured that cost.
- Marker noise. In team-1 and team-2, every line of the note is 🔴, so the marker carries no information. A marker is useful only when lines differ in weight.
- 🟡 gets a new meaning. Team-1 makes 🟡 "a change to a point". Team-2 makes it the change line and the proof line. Project reminder files still use 🟡 for context; the README example is `- 🟡 The staging database resets each night.` (README.md, "Project reminders"). noteStart inserts that file under the new FORMAT, so the same marker has two meanings in one prompt.
- The three teams agree on the rule for example 1 (the clock rule) and for example 8 (the receipt order). For example 3 they differ: team-1 picks "Only host code can give Compose the … resolver", team-2 picks "every place, not the expected places", and I pick "Show every place that sets it". The final round must choose one rule for example 3.

## team-1 (`pi:xai/grok-4.7:high`)

### Right

- The no-reminders strings do not contain "reminder". `test/u14-task-note.test.ts:32` requires this for the first prompt. Team-1's claim is true.
- The missing-note sentence ("From memory"), the label "Your note at the start:", the mark sentence "each 🔴 point and each 🔴 project reminder", and the finish sentence stay verbatim. `test/u14-task-note.test.ts:49`, `:52` and `:61` match these strings. Team-1's text needs the fewest test edits.
- The finish-tool condition is correct: "only when the check is the answer to a `finish` call". This matches `hook/finish.ts:65` (`check(true)`) and the settle paths at `:86` and `:94` (`check(false)`).
- The continued-job rule separates a restriction from a result: "A line that says what a later check must do is a restriction. A line that says what already happened is a result." This keeps a restriction that an earlier job learned, such as example 8's "Live QA must check the work order". Neither team-2 nor I cover this case.
- "An End check with evidence does not clear Miss." "`See:` is not an order to run a command." Both are short and exact.
- The note keeps no evidence. Evidence goes once in the Note check.

### Wrong, with evidence

1. The FORMAT example breaks its own rules.
   - The End line already says "60 requests per minute", and the changed line under it says the same. The old line was overwritten, against "keep its line".
   - "A new key is rejected on the 101st request" contradicts a limit of 60 per minute, where the 61st request is the first rejection.
   - There is no Open line for the second End check, against "one for each End check".
   - The Miss line ("Do not apply the new limit to old keys") and its Open line ("old keys keep the old limit") use different words. The example itself shows the drift between two copies.
2. The mark sentence has no state for "not proven". It keeps "delivered, changed or dropped" and adds "A point still on Open is not delivered". An open point must then be marked changed or dropped, which misreports it. The acceptance asks the final proposal to state the checks with no evidence. A named mark does that; an absence does not.
3. The FORMAT bans what it then requires. "Do not write a result, a count, a verdict, a measurement" conflicts with "Keep an exact command, limit, or restriction" and with the example's "101st request" and "60 requests per minute". Example 7's acceptance is a set of widths (1280, 1024, 390). The ban needs the word "result": a result count, a result measurement.
4. noteSteer says "Keep the old line. Do not delete it." and then "change the End line and the matching Open line". The agent cannot tell whether to edit in place or to add a changed line. It also has to change two lines for one change, which is the cost of the Open copy.
5. Coverage is lost on long tasks. The Tension section says: "A further bullet goes under Miss, or the Note check marks it dropped." A valid acceptance bullet is then reported as dropped because the note has no room, or it overloads the one Miss line.
6. Example 1 names a limit that does not exist: "the cargo plant prepare stall limit". The task says "prepare and tool stall limits". The code names them `prepare` and `toolStall` (`src/project/limits.ts:8`). The End line also reads "Just" as "no other limit moved". That is an added constraint, which the team itself labels as an inference.
7. Example 3 states one rule three times in six lines: the Miss line ("Only host code can give…"), End 2 ("Each place on that list is host code"), and Open 2 ("only host code can give Compose the resolver").
8. Example 8 has no check for "so the 8/10 result is confirmed or corrected". "Report the new numbers" does not require the agent to say which.

### What could still be missed, and what invites task copies or logs

- An Open line is deleted when its check gets evidence. After a compaction (when earlier context is summarized), the note no longer shows whether a deleted line was proven or dropped. `note.first.md` keeps the start, but the prompt does not tell the agent to read it.
- End lines like "Show every place that sets that resolver" restate the task sentence. They are actions, not states that a person can see.

### Keep

- The restriction-versus-result rule for an inherited note.
- The test-compatible strings, where the new shape allows them.
- "An End check with evidence does not clear Miss" and "`See:` is not an order to run a command".

## team-2 (`pi:openrouter/meta/muse-wonder:high`)

### Right

- The noteCheck gives the rule its own mark, "kept or broken", and says "If you cannot tell, say so; unknown is not kept."
- A check still on the not-proven list must be reported as not proven, with what is missing.
- With the start note shown, "Each Done check or Easy-to-miss rule that was in the note at the start and is gone now, with no "changed" line under it: name it as dropped". This catches a silent drop.
- noteSteer: "If the steer changes no point in the note, do not edit the note." This stops a steer from growing the note into a log.
- Continued job: "Do not treat an earlier agent's Proof pointer as your evidence until you have seen the evidence yourself."
- "Write "none" after "Not proven yet:" only when every Done check has a Proof pointer." This makes an empty list mean "all proven", not "forgotten".

### Wrong, with evidence

1. One label means two things. A Done check line contains "Proof: send 101 requests … and see the refusal", which is the plan. The evidence pointer is also "🟡 Proof: <where the evidence is>". A check line that says "Proof:" looks proven before any evidence exists. The only difference is the 🟡 and the nesting. This is the unknown-as-passed risk that the brief names.
2. The examples break the naming rule. FORMAT says "Name the check, not "everything"." All three new notes say "Not proven yet: both Done checks.", which is "everything" in other words. When one check gets evidence, the agent must rewrite "both" into a name.
3. noteStart claims a runtime test that does not exist. The block "[IF the note already exists and describes earlier work…]" comes with "Limen already tests these conditions; the proposal changes wording, not conditions." `noteStart(jobDir)` (`src/job/task-note.ts:24`) reads only the reminders. It never reads the note. The same section then says the condition is "stated for the agent … rather than as a new runtime test". An implementer must either add a code condition, which is out of scope, or send the block always. The text must say which.
4. The finish-tool condition is wrong. noteCheck has "[IF this job has the finish tool]" and "[IF this job has no finish tool] End your final message there." `hook/finish.ts:55` registers `finish` for every job with this hook, before the hosted return at `:82`. The real condition is which path sent the check: the `finish` call (`check(true)`, `hook/finish.ts:65`) or the settle turn (`check(false)`, `:86` and `:94`). A detached job has the tool and still gets `finishTool` false.
5. The rewrites use words from outside the excerpt.
   - Example 3, Done check 2, names "a generated tree, an App tree, a message body, Markdown" and the verbs "inherit" and "reach". None of these is in the excerpt. All are in `records/03/task.txt`: "generated tree" twice, "App tree", "message body", "Markdown", "inherit" and "reach" three times. "forged" is in the task and also in the old note, which is a result.
   - Example 1, Done check 1, says "A cargo plant can raise its prepare limit". That matches item 2 of `records/01/task.txt` ("Let a plant raise both limits in a plant-level setting"), not the excerpt.
   - The note under example 3 says "This rewrite does not invent those checks from the cut-off text", but the check uses that text. Adam's page shows only the three task lines, so he cannot check these words. The words are real, not invented, but they break the rule that the page shows the source of each line.
6. Example 1 puts two rules in the one Easy-to-miss line ("stopping the clocks … or … changing the job time limit") and repeats both in Done check 2. The team names this as an open question. It breaks "the one task rule".
7. Reminders are copied into the note. "A 🔴 reminder that states an end state also belongs in Done means or in Easy to miss." noteCheck already shows the reminders (`src/job/task-note.ts:51`) and asks about each. The copy grows the note past six lines, and a project-wide rule can take the Easy-to-miss slot from the task rule.
8. The FORMAT example has no changed line, but the text says the changed example "is kept in substance". The agent never sees a changed line in place.

### What could still be missed, and what invites task copies or logs

- "Group checks that share one proof" can hide a check. The team asks this itself. Example 8's Done check 2 joins the rerun, the receipt order and the new numbers. The receipt order then also sits in Easy to miss.
- Each Done line carries a long "Proof:" clause. The new notes have 107, 112 and 123 words, against 88/89/81 for team-1 and 65/88/79 for mine. Done check 2 of example 3 is close to a copy of the full task sentence.

### Keep

- The "kept or broken" mark for the rule, and "not proven" with what is missing.
- The silent-drop line: a start-note line that is gone with no changed line is reported as dropped.
- "If the steer changes no point in the note, do not edit the note."
- "Do not treat an earlier agent's … pointer as your evidence until you have seen the evidence yourself."
- An explicit "none" when nothing remains unproven.

## Decisions the final round should make

1. A named "not proven" mark in the Note check. Team-2 and team-3 have one; team-1 lacks it.
2. The finish sentence depends on whether the check answers a `finish` call, not on whether the job has the tool. Team-1 and team-3 have this right.
3. The continued-job text is prose that is always sent. No proposal may claim a runtime test of the note's origin.
4. One label for one thing. The planned proof and the evidence pointer need different words, or the plan carries no label.
5. The new notes use only the excerpt shown on the page. Any word from the full record must also appear in the task lines.
6. A long acceptance list is covered by one check that points to the task's list (team-3). It is not reported as dropped (team-1) and not hidden in a merged check (team-2).
7. Keep a restriction that an earlier job learned (team-1's rule) when the note is rewritten for a continued task.
8. Strings that `test/u14-task-note.test.ts` matches: "From memory", "Your note at the start:", "each 🔴 point and each 🔴 project reminder", "Then call finish again". A change to any of them needs a test change when the prompt is implemented. That is allowed later, but it is a cost.

## What I take into my revise

- From team-1: the restriction-versus-result rule. My noteStart line "rewrite it for this one" can drop a restriction that the earlier job learned.
- From team-1: "An End check with evidence does not clear Miss". My ticks treat the rule line like any other check.
- From team-2: "If the steer changes no point in the note, do not edit the note."
- From team-2: the silent-drop wording ("with no changed line under it").
- From team-2: "kept or broken" for the rule. My single word "proven" fits a restriction poorly.
- My own exposure: I changed three test-matched strings ("From memory", "Your note at the start:", the mark sentence). I will keep the original wording where the meaning allows.
