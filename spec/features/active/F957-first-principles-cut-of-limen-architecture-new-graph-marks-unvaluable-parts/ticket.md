---
opened: 2026-10-25
---

# F957 · First-principles cut of Limen architecture; new graph marks unvaluable parts

## Outcome

A person who does not know Limen opens one interactive graph and sees what Limen is made of and which parts a three-team review judged unvaluable. Each part carries a keep, cut or shrink verdict with a one-line plain reason on the node. The cut and shrink parts are marked visually, not only in prose.

## Scope

- First-principles reasoning over the current core graph, learning design rev 3, and the live code: `hook/` (six modules), the spawn preamble and communication system-prompt path, job-folder wake and steer, templates, `.limen/jobs/`.
- An explicit keep / cut / shrink list with one-line reasons.
- One new graph file: `~/Downloads/limen-core-mechanics-graph-v2-cuts.html`, opened in Helium and uploaded with `upload --text`.

## Out of scope

- Product code changes. A tiny doc note is allowed only if it helps.
- Essay pages. The graph is the only artifact for readers.

## Acceptance

- The keep / cut / shrink list exists, each entry with a one-line reason.
- The graph file exists on disk, opens in Helium, and has a cloud URL.
- Unvaluable parts are visually distinct on the graph (dashed, faded, struck, or a cut layer) and show their reason on the node.
- The graph is self-descriptive and monochrome or minimal.

## Notes

Brief: `brief.md` in this folder. Adam's working essence is a filter, not dogma: two system-prompt appends (role preamble and communication), job-folder watch for wake and steer, and short cues that keep work on the board. The picture or map is outside that essence.
