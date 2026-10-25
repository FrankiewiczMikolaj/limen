---
opened: 2026-10-25
---

# F957 · First-principles cut of Limen; mark weak parts on the core graph

## Outcome

A person who does not know Limen opens the core interactive graph and sees what Limen is made of. Each part shows a keep, cut, or shrink verdict with a one-line plain reason on the node. Cut and shrink parts look different from keep parts. The marks live on the original graph file, not on a second page.

## Scope

- Reason from first principles over the current core graph, the learning design (rev 3), and the live code: `hook/` (six modules), the spawn preamble and communication system-prompt path, job-folder wake and steer, templates, and `.limen/jobs/`.
- Write an explicit keep / cut / shrink list. Give each entry one short reason.
- Edit the original graph in place: `~/Downloads/limen-core-mechanics-graph.html`. Open it in Helium. Upload it with `upload --text`.
- Use plain technical English (short sentences, active voice, simple exact words) on the graph and in this ticket.

## Out of scope

- Product code changes. A tiny doc note is allowed only if it helps.
- A new graph file (for example `limen-core-mechanics-graph-v2-cuts.html`). Do not ship a second page as the deliverable.
- Essay pages. The graph is the only artifact for readers.

## Acceptance

- The keep / cut / shrink list exists. Each entry has a one-line reason.
- The original graph file is updated on disk, opens in Helium, and has a cloud URL.
- Unvaluable parts are visually distinct on that same graph (dashed, faded, struck, or a cut layer) and show their reason on the node.
- The graph is self-descriptive and monochrome or minimal.
- Node and layer text teach a newcomer. There is no long essay around the canvas.

## Notes

Brief: `brief.md` in this folder. Adam’s working essence is a filter, not dogma: two system-prompt appends (role preamble and communication), job-folder watch for wake and steer, and short cues that keep work on the board. The picture or map is outside that essence.

Adam correction (2026-10-25): modify the original graph. Do not build a new one. Improve clarity in plain technical English (~80% ASD-STE100).
