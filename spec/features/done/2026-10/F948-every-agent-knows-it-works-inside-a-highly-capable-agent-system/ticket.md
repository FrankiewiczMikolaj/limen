---
opened: 2026-10-17
touches:
  - limen.sessions.guidance
landed: 2026-10-17
---

# F948 · Every agent knows it works inside a highly capable agent system

## Outcome

Every Limen agent (coordinator, worker, reviewer, scout, keeper, researcher, judge, quality, picture, group member) judges scope, design, estimates and proof as a member of many strong agents that work in parallel, not as a human team. Engineering time is abundant and the owner's attention is scarce. So the right, complete, proven change is affordable, and a bigger change is not. The frame also reaches projects that replace the speech register with their own.

## Scope

- One short package-owned frame text, plus a one-sentence recall of it, in one file.
- The communication hook is the seam. It is the path that both Pi and OMP load for every role. The frame goes once into the system prompt. The recall goes into the per-turn cue.
- Minimal rewrites of injected prompt lines that assume human-team time or cost.
- A study of the wordings, the placement and a small A/B, beside this ticket.

## Out of scope

- An injection into every tool result.
- Changes to review economics, the test cap, job timeouts or role boundaries.
- Rewrites of role preambles past the lines that conflict with the frame.

## Acceptance

- The system prompt of a coordinator has the frame exactly once.
- The system prompt of a worker has the frame exactly once.
- The per-turn cue of each of those prompts has the one-sentence recall exactly once, also in a project with its own `.agents/limen/communication.md`.
- No other template or source file repeats the frame text.
- `npm run check` passes, and `test/` stays at or under 3,500 lines.
- `study.md` lists the candidates, the placement decision with its reasons, and the A/B results.

## Notes

- The frame is not in the register: eight of the owner's projects replace the register, and they would lose the frame.
- Running coordinators get the frame only after a restart or `/reload`.
