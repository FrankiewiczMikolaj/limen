---
touches:
  - limen.sessions.wake
opened: 2026-10-24
---

# F955 · Coordinators receive every agent’s full final message

## Outcome

A coordinator receives the agent's complete final report, including trailing Note checks and unresolved work, instead of a shortened excerpt. Agents know who receives that report and put unproven, blocked or unfinished work first, so the coordinator can choose the next step. Adam's decision 114, including its prompt addition, is retained in `decision-114.md`.

## Scope

- Start in `src/job/wake-text.ts`, where `handoffExcerpt()` currently cuts the final message; preserve the message rather than replacing it with a job-record pointer.
- Follow all completion routes: subscribed or fallback coordinator, Herdr pane, toast-free paths, finish-webhook handoff, wait output and group-lead result; include done, failed/stopped and scout endings.
- Replace obsolete ending instructions in worker, reviewer, scout and group-team role prompts with a concise report-to-coordinator contract: gaps and evidence first, then work, checks, commits and continuation context.
- Keep commit-list bounds and existing delivery ownership, receipts, state semantics and missing-message behavior.

## Out of scope

- The separately accepted open-note evidence implementation (F953), its parser, proof classification or acceptance. Integrate current main as needed, but do not change those semantics in this slice.
- New dependencies, workflow gates, provider changes, unrelated runtime repairs or live external webhook sends.
- A larger prompt checklist beside the existing one, or replacing role-specific review/scout evidence formats.

## Acceptance

- Completion messages preserve a final report beyond both old cut limits, including a trailing Note check, for done, failed/stopped and scout results.
- Each coordinator delivery route and finish-webhook handoff carries that full report, not a substitute pointer or another excerpt.
- Wait output and group-lead completion carry their complete final message; commit lists may remain bounded.
- Worker, reviewer, scout and group-team prompts state that the full last message reaches the coordinator, who decides the next step; gaps come before completed work, without duplicate ending lists or obsolete cut-based limits.
- Existing routing, delivery receipts, state meaning and absent-result cases remain intact; no F953 implementation or proof-rule change enters this slice's diff.
- Replace the truncation regression, keep `test/` within the 3,500-line cap, retain a full local-check result at the candidate code commit, and obtain the requested independent Sol review before landing.
