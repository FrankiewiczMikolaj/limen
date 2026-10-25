---
opened: 2026-10-25
---

# F957 · First-principles cut of Limen architecture; the original graph marks unvaluable parts

## Outcome

A person who does not know Limen opens the original core graph. The graph shows what Limen is made of. The graph also shows which parts a three-team review judged unvaluable. Each part has a verdict: keep, cut, or shrink. Each verdict has a one-line plain reason on the node. Cut and shrink parts have a visual mark, not only a text mark.

## Scope

- Reason from first principles. Use these sources: the current core graph, learning design rev 3, and the live code. The live code is `hook/` (six modules), the spawn preamble, the communication system-prompt path, job-folder wake and steer, templates, and `.limen/jobs/`.
- Write a keep / cut / shrink list. Give each entry a one-line reason.
- Edit the original graph file: `~/Downloads/limen-core-mechanics-graph.html`. Add the verdicts and reasons to the existing nodes. Do not make a new graph file.
- Open the edited file in Helium. Upload it with `upload --text`.

## Out of scope

- Changes to product code. A small doc note is permitted only if it helps.
- A new graph file, for example `limen-core-mechanics-graph-v2-cuts.html`.
- Essay pages. The graph is the only artifact for readers.

## Acceptance

- The keep / cut / shrink list exists. Each entry has a one-line reason.
- The original graph file on disk has the edits.
- The file opens in Helium and has a cloud URL from `upload --text`.
- Unvaluable parts have a visual mark on the same file: dashed, faded, struck, or a cut layer. Each of these nodes shows its reason.
- The graph explains itself to a newcomer. The design is monochrome or minimal.

## Notes

The brief is `brief.md` in this folder.

Adam's working essence is a filter, not a rule. The essence has three parts:

- Two system-prompt appends: the role preamble and the communication prompt.
- A watch on the job folder. The watch wakes and steers the agent.
- Short cues. The cues keep work on the board.

The picture (the map) is not part of this essence.
