# Task-note prompt proposal

## Deliverable

Propose the task-note prompt. Do not implement it. Adam called the current notes low-signal and wants to review the text first. Write plain technical English. Short sentences.

Answer the central question: what one thing must the agent write so it does not miss the most important point?

## Sources

Read all of these yourself:

- `src/job/task-note.ts`: current FORMAT, noteStart, noteSteer, and noteCheck strings and their conditions.
- `/Users/overment/Downloads/limen-note-examples.html`.
- `/Users/overment/Downloads/limen-note-examples-data/examples.json`: eight real tasks and note excerpts.
- `/Users/overment/Downloads/limen-note-hook-compare.html`.
- `/Users/overment/Downloads/limen-note-continue-compare.html`.

The studies found no clear effect. Do not claim the proposed prompt improves delivery. The source tasks and old notes contain ellipses; do not invent the missing text or evidence.

## Starting shape to challenge and improve

The note answers: what must be true at the end, and how will I prove it?

Aim for at most about six lines in three parts:

1. Done means: two to four checks a person can run or see.
2. Easy to miss: the one task rule a busy agent will most likely break.
3. Not proven yet: checks with no evidence. Cross off only with evidence. The finish check reads this list.

No results, task copy, context lines, or activity log. Keep exact commands, limits, and restrictions when they define acceptance. Discuss the tension between a short note, complete coverage, and evidence-backed crossing off. Evidence must not turn the note into a test-result log. A note is not permission to run a forbidden check.

Preserve project reminders, steering, continued jobs, missing notes, changed scope, and the conditional finish-tool instruction in the proposed text. Do not silently drop an original obligation or treat unknown as passed. Do not propose runtime parsing, gates, or code changes.

## Teams and rounds

Exactly these routes, in this order:

- team-1: `pi:xai/grok-4.7:high`.
- team-2: `pi:openrouter/meta/muse-wonder:high`.
- team-3: `pi:pi-claude/claude-opus-5-5:xhigh`.

Rounds: `draft,critique,revise,final`. No workers or helper agents. No route substitution. If a route fails, retain the exact error.

Each team proposes the complete FORMAT, noteStart, noteSteer, and noteCheck strings. Include conditional variants rather than only a slogan. Use readable placeholders for paths and inserted content; define them.

Each team rewrites the same three source examples: 1 (plant limits), 3 (trusted rows), and 8 (continued mixing-trap design). They test a hard boundary, a reviewer trust rule, and a continued task. Write the new notes as plans before new evidence exists, not as claims that checks passed. Retain the old note verbatim and show each task in three short lines drawn only from its source excerpt.

In draft, work alone. Save your proposal under this feature's `group/proposals/team-N.md` and commit only group-record files.

In critique, attack each other proposal. Name what could still be missed, what invites task copying or result logs, and any source constraint lost. Save your critique under `group/findings/team-N-critique.md`. Do not rewrite your own proposal in this round.

In revise, fix your proposal and say what you rejected and why. Commit your updated team proposal. Your final message is the complete revised proposal and examples, not just a file pointer.

In final, team-1 reads every round and decides. Write `group/final.md` with the complete final prompt text, three before-and-after examples, and the disagreements and decisions. Also write `group/final.json` with a `prompt` string containing the complete displayed prompt text, and an `examples` array of exactly three objects: `number`, `taskLines` (exactly three strings), `oldNote` (verbatim source), and `newNote`. This is a display source, not executable code. Keep the prompt complete, including the four named strings and conditional text. Commit only group-record files. Your final message gives the final prompt, disagreements, and any failed route.

Do not edit source, hooks, tests, dependencies, ticket, board, installed prompts, or other repositories. Do not create the HTML page: the coordinator owns it. Do not push, merge, or land.

## Coordinator-owned paths

- Review page: `/Users/overment/Downloads/limen-note-shape.html` (retained for Adam).
- Headless-render evidence: `/tmp/limen-tasks/note-shape-f950-render/` (delete after the check).

The coordinator files the round results, checks the final text and examples, creates and renders the page headless only, and pushes only the feature spec and group record on main. No runtime implementation is authorized. The group record must state that effectiveness is unproven.
