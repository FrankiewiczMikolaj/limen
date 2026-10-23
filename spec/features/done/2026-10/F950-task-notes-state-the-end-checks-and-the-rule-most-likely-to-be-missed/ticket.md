---
touches:
  - limen.sessions.guidance
opened: 2026-10-23
landed: 2026-10-23
---

# F950 · Task notes state the end checks and the rule most likely to be missed

## Outcome

Each job receives the approved task-note prompt. Its note states observable end checks, the one rule a quick finish could miss, and what remains unproven. It is not a task copy or a result log, and it has no colored markers.

## Scope

- Implement the approved FORMAT, noteStart, noteSteer, and noteCheck text from `group/prompt.txt`, starting in `src/job/task-note.ts`.
- Substitute job paths and note contents, and apply the approved conditions without sending their bracketed labels.
- Keep existing note storage and recording behavior; this is prompt text, not a note parser or workflow gate.
- Replace tests and documentation that quote the old note format.
- Retain local check evidence and send the implementation through an independent review before landing.

## Out of scope

- Changes to the approved wording or the historical group record.
- Repairs to the old wake-test failure or the structure scan of retained evidence.
- New dependencies, runtime state, model routes, or GitHub Actions.
- Claims that the new prompt improves delivery.

## Acceptance

- First and continued prompts use the approved wording, with reminders included only when their file is nonempty.
- Steers preserve the old requirement, append the changed requirement, and invalidate stale proof as the approved text states.
- The finish check covers present and missing notes, differing first notes, conditional reminders, and both finish-tool paths.
- Existing note persistence still records the first version and logs changes without parsing the note.
- Focused regressions, TypeScript, and Biome pass; tests stay within the existing line cap.
- Full local-check output is retained, with any wake or structure-scan failure reported rather than masked.

## Notes

Adam approved `group/prompt.txt` as written. That file, not the unedited group final under `group/proposals/`, owns the wording. Implementation and review routes, landing, and push authority are recorded on the board.
