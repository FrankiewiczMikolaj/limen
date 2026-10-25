---
opened: 2026-10-24
needs-adam: Answer choices 1 to 4 at the end of ~/Downloads/limen-learning-system.html (revision 3) before a pilot; no implementation or pilot is authorized.
needs-adam-on: 2026-10-25
---

# F952 · Agents learn Adam’s principles from work and decisions

## Task

The owner's source brief follows verbatim. This is a design task, not an implementation ticket.

# Group brief: how agents learn Adam's principles and the system around the code

Adam (2026-10-24), in his words, condensed:
- This is how he uses Limen in the Alice project. Read these first:
  - /Users/overment/playground/alice-app/alice/tmp/evidence/agent-navigation/report.html
  - /Users/overment/playground/alice-app/alice/tmp/evidence/docs-review/report.html
- After a couple thousand commits, the vision is in place and reflects the code. That part works.
- The problem: the system does not learn well enough.
- He needs systems thinking. Agents must learn his principles: how he makes decisions, what is important to him, and how to move around the system beyond what the code says.
- Agents need a way (for example skills) to discover context AND understand the relationships between features and the principles behind decisions.
- Learning sources: Adam's own interactions (corrections, decisions, rejections), schedules that run on a timer, and events hooked into agent work (start, steer, finish, review FAIL, landing).

Deliverable: one document Adam can discuss and iterate on.
- A simple set of structures (files, their shape, where they live) that any project can use.
- Generalized skills that agents load to (a) discover context, (b) see feature-to-feature and decision-to-principle relationships, (c) learn from Adam's interactions and from events and schedules.
- A graph that shows the loop: where knowledge comes from, where it is stored, when it is injected, and who checks it.
- The ideas as numbered options with trade-offs, so Adam can pick and steer. Mark open questions.
- Ground every claim in what exists now: Limen task notes and project reminders (.agents/limen/reminders.md), vision.md files, styleguides, spec/features, the finish/steer hooks, and the two Alice reports. Label guesses as guesses.

Output: ~/Downloads/limen-learning-system.html. Monochrome and minimal. No kicker texts, no redundant labels, no description walls. Graphs carry short verb-phrase labels. Plain technical English (about 80% ASD-STE100).
Read only. Change no code in any plant. Never edit alice/. Commit nothing.
Report back: the 3 to 5 strongest ideas in one line each, the open questions, and the file path.
