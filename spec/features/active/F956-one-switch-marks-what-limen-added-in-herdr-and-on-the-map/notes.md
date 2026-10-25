# F956 notes: what Limen paints today

Coordinator survey, 2026-10-25, at `c0669d4`, Herdr 0.9.5. The worker confirms each line by editing and adds what is missing.

## Herdr window: Limen-added

| Item | Example | Written by |
|---|---|---|
| Coordinator display agent (sidebar agent name) | `Limen coordinator`, `Limen · 1 job` | `hook/wake.ts` `herdrReport`, `herdrDisplayAgent` |
| Coordinator pane title (pane border) | `Limen · review · F1164` | `hook/wake.ts` `--title` |
| Coordinator `idle` and `done` state labels | `2 RUNNING · 1 watched · 1 unwatched · …` | `hook/wake.ts` `--state-label` |
| `limen` pane token (shown only if a sidebar row uses `$limen`) | same text as the state label | `hook/wake.ts`, `hook/hosted.ts` |
| Coordinator tab tail | `origin highlight · 2 running · 1 finished` | `hook/wake.ts` `updateTabTail`, parsed by `TAB_TAIL` |
| Limen line in the coordinator's Pi footer | job line | `hook/wake.ts` `session.ui.setStatus("limen", …)` |
| Hosted job display agent | `limen worker`, `limen reviewer` | `hook/hosted.ts` `report` |
| Hosted job `idle` and `done` state labels | `job RUNNING · pane ready` | `hook/hosted.ts` |
| Stall overlay on a hosted pane | `⚠ stalled 5m` | `src/integrations/herdr.ts` `reportHostedStall`, `restoreHostedPane` |
| Job tab labels | `<label> · running`, `<label> · done` after a refused close | `src/integrations/herdr.ts` (`createTab` callers, `closeJobTab`) |
| Herdr notifications | `limen: <label> stalled`, seat notices | `src/integrations/herdr.ts`, `src/project/seat.ts` |
| Role spaces (not marked: Limen finds them by label) | `limen workers · /path` | `src/integrations/herdr.ts` workspace create |
| Agent names (not marked: Herdr allows `[a-z0-9_-]` only) | `limen-f956-…`, `limen-origin-highlight` | spawn, coordinator manual |

## Herdr window: native

State icon and state word (`working`, `blocked`, `unknown`, and `idle`/`done` where Limen reports no label), detected agent kind (`pi`, `omp`), terminal title (`π - limen`, set by Pi), tab numbers Herdr gives an unnamed tab, workspace names the human typed, and Pi's own footer.

## Herdr limits

- `pane report-metadata` text is plain: Herdr removes control characters and caps each value at 80 characters. The mark goes at the front because Herdr cuts the end.
- Color exists only through `[ui.sidebar.agents] rows` style rules in the user's `~/.config/herdr/config.toml` (`starts_with = "◆"`). Those rules reach sidebar tokens only. Tab strip and pane-border text cannot be colored by a reporter or a rule. A colored or outlined highlight there needs a Herdr change, such as styling metadata by `--source`. Limen does not write the user's Herdr config.
- Herdr plugins have no native UI in plugin v1, so a clickable toggle inside Herdr's chrome is not possible. The switch is a command, also inside the coordinator's Pi session.

## Picture page

Classification rule: an element is Limen when its data comes from Limen work state (`.limen/jobs/`, `spec/features/` tickets, `spec/build.md`) or it exists only to show or filter that state. It is native map when it comes from the dataset (`nodes/`, `edges/`, `features/`, `journeys/`).

| Item | Class |
|---|---|
| Mast pins: Changed, Wrong, Needs Adam | Limen |
| Work count on a place (`k-n`) | Limen |
| Live strip and its states (`live.js`, served page only) | Limen |
| Live job mark on a place ("a job works here now") | Limen |
| Reading column Work tab, Needs Adam group and badges, board state lines | Limen |
| Days tab (dated ticket decisions) | Limen |
| Modules, places, connections, count badges between modules, journeys, partly described dots | native map |
| Places tab, Journeys tab, layers, trail, selection and lit states | native map |
| "Show all module connections" button | native map |
