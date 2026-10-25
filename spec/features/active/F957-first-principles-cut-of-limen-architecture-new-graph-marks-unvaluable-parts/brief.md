# Group: first-principles cut of Limen; mark weak parts on the core graph

## Goal

Reason from first principles about Limen’s architecture and the existing core graph. Propose simplifications. Edit the **original** interactive graph so it highlights parts the group judges unvaluable (cut, shrink, or demote).

## Audience of the graph

People who do not know Limen. Self-descriptive. Graph only (no essay pages). Monochrome or minimal. Mark unvaluable parts visually (dashed, faded, cut layer, or strike) with a short plain reason on the node. Use short sentences and simple exact words.

## Sources (read; do not dump)

- Core graph (edit this file): `~/Downloads/limen-core-mechanics-graph.html`
  Cloud: https://cloud.overment.com/2026-10-25/limen-core-mechanics-graph-cfee50eb-c.html
  Also: https://cloud.overment.com/limen-core-mechanics-graph-1792896349.html
- Learning design rev 3: `~/Downloads/limen-learning-system.html`
  Cloud: https://cloud.overment.com/2026-10-25/limen-learning-system-e05e735c-6.html
- Related: https://cloud.overment.com/2026-10-25/limen-f944-hook-lag-findings-2be62d29-7.html
  https://cloud.overment.com/2026-10-25/limen-dynamic-hooks-70ba4033-6.html
- Live code: `hook/` (6 modules), spawn preamble + communication system-prompt path, job folder wake/steer, templates, `.limen/jobs/`

## Adam’s working essence (filter, not dogma)

Core ≈ two system-prompt appends (role preamble + communication), job-folder watch for wake and steer, and short cues so work stays on the board. The picture or map is outside the core. The coordinator loads 4 hooks; the package has 6 (`wake`, `communication`, `steering`, `group-peer`, `finish`, `hosted`).

## Rounds

1. **draft** — each team: what is load-bearing vs unvaluable; propose cuts and merges.
2. **critique** — attack each other’s cuts; protect only what fails without Limen.
3. **revise** — converge on one cut list and how to mark it on the original graph.
4. **final** — one team edits `~/Downloads/limen-core-mechanics-graph.html` in place, opens it in Helium, uploads with `upload --text`, and puts the URL in the final message. Do not create a separate v2-cuts file as the product.

## Success

- Explicit list: keep / cut / shrink, each with a one-line reason.
- Original graph file updated on disk + Helium + cloud URL.
- Unvaluable parts highlighted on that graph, not only in prose.
- Lead finish message starts with what is not proven.

No product land required unless a tiny doc note helps. This is design reasoning plus the graph artifact.

## Adam correction (2026-10-25)

Modify the original graph. Do not build a new one. Improve clarity in plain technical English (~80% ASD-STE100).
