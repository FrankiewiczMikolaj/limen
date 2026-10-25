# Group: first-principles cut of Limen architecture on the original graph

## Goal

Reason from first principles about the Limen architecture and the current plan and graph. Propose simplifications or changes. Mark the parts that the group thinks are unvaluable (cut, shrink, or demote). Put these marks on the **original graph**. Do not make a new graph.

## Deliverable

Edit `~/Downloads/limen-core-mechanics-graph.html` in place.

- Add a verdict to each existing node: keep, cut, or shrink.
- Add a one-line plain reason to each verdict.
- Keep the node ids, edges, layers, layout, and interaction.
- Do not make a sibling file, for example `limen-core-mechanics-graph-v2-cuts.html`.

## Audience of the graph

The readers do not know Limen.

- The graph explains itself. Each term has a definition where a reader first sees it.
- The graph is the only artifact. Do not write essay pages.
- The design is monochrome or minimal.
- Unvaluable parts have a visual mark, for example dashed, faded, a cut layer, or struck text. Each of these nodes shows a short plain reason.

## Sources (read them; do not copy them)

- Core graph: `~/Downloads/limen-core-mechanics-graph.html`
  Cloud: https://cloud.overment.com/2026-10-25/limen-core-mechanics-graph-cfee50eb-c.html
  Also: https://cloud.overment.com/limen-core-mechanics-graph-1792896349.html
- Learning design rev 3: `~/Downloads/limen-learning-system.html`
  Cloud: https://cloud.overment.com/2026-10-25/limen-learning-system-e05e735c-6.html
- Related pages:
  https://cloud.overment.com/2026-10-25/limen-f944-hook-lag-findings-2be62d29-7.html
  https://cloud.overment.com/2026-10-25/limen-dynamic-hooks-70ba4033-6.html
- Live code: `hook/` (six modules), the spawn preamble, the communication system-prompt path, job-folder wake and steer, templates, and `.limen/jobs/`.

## Adam's working essence (a filter, not a rule)

- The core is two system-prompt appends: the role preamble and the communication prompt.
- A watch on the job folder wakes and steers the agent.
- Short cues keep work on the board.
- The picture (the map) is not part of the core.
- The coordinator loads four hooks. The package has six: `wake`, `communication`, `steering`, `group-peer`, `finish`, `hosted`.

## Rounds

1. **Draft.** Each team names the parts that carry load and the parts that are unvaluable. Each team proposes cuts and merges.
2. **Critique.** Each team attacks the cuts of the other teams. Protect a part only if the work fails without it.
3. **Revise.** The teams agree on one cut list and one graph model.
4. **Final.** One team (or all teams) edits `~/Downloads/limen-core-mechanics-graph.html` in place. Make a backup first. Open the file in Helium. Upload it with `upload --text`. Put the URL in the final message.

## Success

- A keep / cut / shrink list exists. Each entry has a one-line reason.
- The original graph file has the edits on disk. It opens in Helium and has a cloud URL.
- Unvaluable parts have a mark on the graph, not only in text.
- The first line of the lead's finish message states what is not proven.

A product land is not necessary. A small doc note is permitted only if it helps. This work is design reasoning plus edits to the original graph.
