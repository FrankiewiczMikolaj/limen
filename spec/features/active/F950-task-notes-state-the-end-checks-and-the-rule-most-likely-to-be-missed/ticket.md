---
touches:
  - limen.sessions.guidance
opened: 2026-10-23
needs-adam: Approve or revise the task-note prompt before implementation.
needs-adam-on: 2026-10-23
---

# F950 · Task notes state the end checks and the rule most likely to be missed

## Outcome

Adam can review one proposed task-note prompt and three real examples before any runtime change. The note states what must be true at the end, how to prove it, and the task rule most likely to be missed. It is not a task copy or a result log.

## Scope

- Start from the prompt strings in `src/job/task-note.ts` and the eight supplied notes.
- Compare three independent proposals through draft, critique, revise, and final rounds.
- Propose the complete FORMAT, noteStart, noteSteer, and noteCheck text, including conditional text.
- Retain the final proposal, three before-and-after examples, disagreements, and route failures in the group record.
- Show the proposal and examples in a minimal local HTML page for Adam.

## Out of scope

- Changes to Limen code, hooks, tests, dependencies, or installed prompts.
- Claims of better delivery from the two inconclusive studies.
- New models, extra teams, or implementation before Adam decides.

## Acceptance

- One group records exactly the three requested routes and four requested rounds, or records the exact route failure.
- The final proposal states observable end checks, one easy-to-miss rule, and the checks with no evidence.
- Three rewrites use the supplied tasks without inventing evidence or results.
- `~/Downloads/limen-note-shape.html` shows only the final prompt text and each task in three lines, its old note, and its new note.
- A headless render confirms black text on white with no added introduction, labels, or color.
- Only this feature spec and group record land on main and are pushed; Limen code stays unchanged.

## Notes

The exact routes, source paths, and deliverable paths are in `group/brief.md`. Adam reviews the prompt before implementation.
