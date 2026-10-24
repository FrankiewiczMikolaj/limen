---
touches:
  - limen.sessions.guidance
  - limen.sessions.wake
  - limen.cabinet.records
opened: 2026-10-24
---

# F953 · A done job with open note checks tells the coordinator and is not a plain done

## Outcome

Adam (2026-10-24): "even if the note says something is wrong, it still continues, and the coordinator is not aware of this." When a worker's final "Note check" leaves an item open, the coordinator's finish wake names each item in one line, and the job reads "done with open checks", not plain "done". The coordinator then decides: continue the job, start a review, or accept each item with a reason. A check marked proven must name a command that ran in the session or a file that exists, or Limen counts it as not proven and says why.

## Scope

- Limen reads the final message's "Note check" once, when the job is recorded done; the note and the project reminders share that one path. Start at the before-finish note check in `src/job/task-note.ts`.
- Open items: a line marked not proven, changed, dropped or broken; a proven line with no proof that its command ran and no such file; a sent check with no answer.
- The recorded state stays done, so land, continue and the keeper work unchanged. The wake, the toasts, the finish webhook's handoff, `limen jobs` and `limen status` say "done with open checks".

## Out of scope

- A second send-back to the worker. The before-finish note check is already the one turn back.
- A new terminal state or a land gate. Limen informs; the coordinator decides.
- Judging whether the named evidence proves the claim.

## Acceptance

- A fake finish with one not-proven check gives the coordinator a wake that says "done with open checks" and lists that item in one line.
- A proven line whose command never ran, or was only quoted or skipped, is listed as not proven, with the reason.
- A done job with no open item gets the wake it got before: no extra line.
- `test/` stays within its 3,500-line cap.
- An independent review (Pi `openai-codex/gpt-6.1-sol` at `xhigh`) passes before the work lands on main.

## Notes

Evidence on the observed cases: `evidence/` in this folder.

Adam decision 115 (2026-10-24, 16:50 Warsaw) accepts repair 4 as it is: code `d1db363`, evidence `19017aa`, and review 4 at `5d56698`. Land despite the recorded FAIL. For this candidate, the owner accepts the known exception to acceptance 2 and waives acceptance 5's PASS prerequisite. Do not claim that strict command-execution proof or a review PASS was achieved. No further strict-proof review round or follow-up ticket is authorized.

Known limit from `review-4.md`: in OMP's persistent shell, `'.' setup.sh` can load `halt() { exit 0; }`. A later `halt && npm test` exits 0 before npm runs, yet the command can retain proven status and the wake can say plain done. The equivalent unquoted `. setup.sh` control is correctly downgraded. The real finalizer/wake reproduction failed with this false proof; it remains an accepted limit, not a fixed case.
