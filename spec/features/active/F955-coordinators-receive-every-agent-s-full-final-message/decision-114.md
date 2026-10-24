# Coordinator gets the agent's full final message (Adam decision 114, 2026-10-24 16:21 Warsaw)

Adam's words: "the coordinator MUST receive the message of its agent. it MUST be informed. not 15 lines, not 1200 chars. but message."

Today `handoffExcerpt()` in src/job/wake-text.ts cuts the final message to 15 lines / 1,200 chars and says "full text in the job record". The Note check sits at the end of the message, so the cut usually hides it.

Make it true: every finish wake (done, failed/stopped, scout, group results, every route: Herdr pane wake, toast-free paths, finish webhook handoff to the coordinator) carries the agent's full final message verbatim. No truncation, no "see job record" pointer in place of the text. Keep commit list bounded as today if needed. Check every other place the coordinator is told about a job end (limen wait output, group lead result) and apply the same rule.

Open a new ticket for this. Implement with a worker on pi, --provider pi-claude --model claude-opus-5-5, thinking xhigh. Retire the test that asserts the cut; stay inside the test/ 3,500-line cap. Full local check, then one Sol review (openai-codex/gpt-6.1-sol xhigh). Land on main and push with a [skip ci] tip when it passes.

This is separate from F953 (open note checks). Do not merge them. F953 stays held; Adam has not decided on it yet.

## Addition (Adam, 16:23): the agent must know it reports to the coordinator
Today templates/worker.md treats the final message as a record ("End with: changes, checks..."). The agent is not told that its coordinator reads the whole message and decides the next step, and the Note check usually comes last.
Change the worker prompt (and the equivalent lines in other job role templates: review, scout, group team) so the agent knows:
- Its last message goes in full to its coordinator, who reads it and decides the next step (continue, review, land, ask Adam).
- Write it as a report to that coordinator: first what is not done, not proven, or blocked, with evidence; then what was done, checks run, commits, what the next worker must know.
Keep it short; replace the old "End with" line rather than adding a second list. Same ticket, same worker, same review.
