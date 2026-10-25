---
touches:
  - limen.integrations.herdr
  - limen.sessions.wake
  - limen.runtime.hosted
  - limen.picture.viewer
opened: 2026-10-25
landed: 2026-10-25
---

# F956 · One switch marks what Limen added in Herdr and on the map

## Outcome

Adam can turn on one switch and see at a glance which text in the Herdr window, and which parts of the picture page, Limen added. Everything else is native Herdr or Pi (in Herdr) or the map itself (on the page). Both surfaces use the same mark `◆`, the same accent color and the same words: "Limen" and "native". The switch is a reading aid, not a status model.

## Scope

- Seat-wide switch: `limen highlight [on|off]`, saved in the seat folder (`seatDir()` in `src/project/seat.ts`). Off by default. With no argument it prints the state and a one-line legend. The coordinator's Pi command `/limen` takes `highlight on|off` too.
- Herdr: while on, every string Limen writes into Herdr starts with `◆ `. That covers display agent, pane title, state labels, job tab labels, the coordinator tab tail, stall overlays, notifications and Limen's Pi footer line. Where a Limen label covers a native Herdr word (the `idle` or `done` state label), the native word stays in front: `idle ◆ 2 RUNNING · …`. Live panes follow a change within about 2 s. Already open job tabs follow too.
- Map page: a visible switch on the page, remembered in `localStorage`, works in the built file and in `limen picture serve`. While on, each element that comes from Limen work state (`.limen/jobs/`, tickets, `spec/build.md`) gets the accent outline and `◆`. Map dataset elements (`nodes/`, `edges/`, `features/`, `journeys/`) stay unmarked. A legend line names both.
- `docs/herdr-status.md` and `docs/picture.md` describe the switch. The Herdr doc carries an optional sidebar style rule that Adam may paste to color `◆` text.

## Out of scope

- Writing Adam's Herdr config, installing a Herdr plugin, or any Herdr or Alice change.
- Marking workspace labels or agent names. Limen finds role spaces by their label, and agent names have a fixed character set.
- Any change to job state, wake delivery, tab identity or label parsing.

## Acceptance

- `limen highlight` prints `off` on a fresh seat, and the last choice survives a new shell and a coordinator restart.
- Switch on: within about 2 s, every Limen display agent and pane title in `herdr agent list` starts with `◆`; Herdr's agent kind and terminal title do not change.
- Switch on: a running job's tab and the coordinator tab tail show `◆` without a new spawn.
- Switch off: a test proves every Herdr string Limen writes is byte for byte what it is today.
- Map: on the served page and the built file, the switch marks Limen items with the outline and `◆`, leaves the base map unmarked, and keeps the choice after a reload.
- `test/` stays at or below 3,500 lines.

## Notes

- Text marks, not color, in Herdr: Herdr strips control characters from reported text, and only Adam's own Herdr config can color it. The overlay inventory and this limit are in `notes.md`.
