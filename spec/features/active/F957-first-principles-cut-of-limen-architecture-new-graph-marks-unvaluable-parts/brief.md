# Group: first-principles cut of Limen architecture + new graph

## Goal
Reason from first principles about Limen’s architecture and the existing plan/graph. Propose simplifications or modifications. Deliver a **new interactive graph** that highlights parts the group considers **unvaluable** (cut, shrink, or demote).

## Audience of the graph
People who do not know Limen. Self-descriptive. Graph-only (no essay pages). Monochrome/minimal. Unvaluable parts must be visually marked (e.g. dashed, faded, “cut” layer, strike style) with a short plain reason on the node.

## Sources (read; do not dump)
- Core graph: `~/Downloads/limen-core-mechanics-graph.html`
  Cloud: https://cloud.overment.com/2026-10-25/limen-core-mechanics-graph-cfee50eb-c.html
  Also: https://cloud.overment.com/limen-core-mechanics-graph-1792896349.html
- Learning design rev 3: `~/Downloads/limen-learning-system.html`
  Cloud: https://cloud.overment.com/2026-10-25/limen-learning-system-e05e735c-6.html
- Related: https://cloud.overment.com/2026-10-25/limen-f944-hook-lag-findings-2be62d29-7.html
  https://cloud.overment.com/2026-10-25/limen-dynamic-hooks-70ba4033-6.html
- Live code: `hook/` (6 modules), spawn preamble + communication system-prompt path, job folder wake/steer, templates, `.limen/jobs/`

## Adam’s working essence (use as a filter, not dogma)
Core ≈ two system-prompt appends (role preamble + communication), job-folder watch for wake and steer, and short cues so work stays on the board. Picture/map is out of the core essence. Coordinator loads 4 hooks; package has 6 (`wake`, `communication`, `steering`, `group-peer`, `finish`, `hosted`).

## Rounds
1. **draft** — each team: what is load-bearing vs unvaluable; propose cuts/merges.
2. **critique** — attack each other’s cuts; protect only what fails without Limen.
3. **revise** — converge on a cut list and a graph model.
4. **final** — one team (or shared) writes `~/Downloads/limen-core-mechanics-graph-v2-cuts.html` and opens it in Helium. Upload with `upload --text` and put the URL in the final message.

## Success
- Explicit list: keep / cut / shrink, with one-line reasons.
- New graph file on disk + Helium + cloud URL.
- Unvaluable parts highlighted on the graph, not only in prose.
- Lead finish message starts with what is not proven.

No product land required unless a tiny doc note helps; this is design reasoning + the graph artifact.
