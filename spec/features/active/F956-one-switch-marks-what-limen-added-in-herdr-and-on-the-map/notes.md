# F956 notes: what Limen paints today

Coordinator survey, 2026-10-25, at `c0669d4`, Herdr 0.9.5. The worker confirms each line by editing and adds what is missing.

## Herdr window: Limen-added

Checked against the code at `873d11d` by the F956 job; each item names the code that writes it. Marked means the item starts with `◆ ` while `limen highlight` is on.

| Item | Example | Written by | Marked |
|---|---|---|---|
| Coordinator display agent (sidebar agent name) | `Limen coordinator`, `Limen · waiting on 2 jobs`, `⚠ Limen · 1 of 2 needs attention` | `hook/wake.ts` `herdrReport`, `herdrDisplayAgent` | yes |
| Coordinator pane title (pane border) | `Limen · review · F1164`, `Limen · 1 finished` | `hook/wake.ts` `herdrReport` `--title` | yes |
| Coordinator `idle` and `done` state labels | `2 RUNNING · 1 watched · 1 unwatched · …` | `hook/wake.ts` `herdrReport` `--state-label` | yes, native word in front: `idle ◆ 2 RUNNING · …` |
| Coordinator `limen` pane token (shown only if a sidebar row uses `$limen`) | same text as its state label | `hook/wake.ts` `herdrReport` `--token` | yes |
| Coordinator tab tail | `origin highlight · 2 running · 1 finished` | `hook/wake.ts` `updateTabTail`, parsed by `TAB_TAIL` | yes, after the stem: `origin highlight · ◆ 2 running · 1 finished` |
| Limen line in the coordinator's Pi footer | `limen 2 · fix login · F012 tool:bash …` | `hook/wake.ts` `setStatus("limen", …)` | yes |
| Hosted job display agent | `limen worker`, `limen reviewer` | `hook/hosted.ts` `report`; `restoreHostedPane` after a stall | yes |
| Hosted job `limen` pane token | `job RUNNING` (the state label without `· pane ready`) | `hook/hosted.ts` `report` | yes |
| Hosted job `idle` and `done` state labels | `job RUNNING · pane ready` | `hook/hosted.ts` `report` | yes, native word in front |
| Stall overlay on a hosted pane | `⚠ stalled 5m` as display agent and `idle`, `done`, `blocked` labels | `src/integrations/herdr.ts` `reportHostedStall` | yes |
| Job tab labels | `<label> · running` (watch and hosted), `<label> · diff`, `<label> · <state>` (`limen open`, and a refused close) | `src/integrations/herdr.ts` `createTab`, `closeJobTab` | yes |
| Herdr notifications (title) | `limen: <label> stalled`, `limen: <label> done; next step: land it`, seat notices `limen: <label> · blocked` | `herdr.ts` `reportHostedStall`, `showSeatNotification` (moved here from `seat.ts`), `hook/wake.ts` `notifyHerdr` | title only; the body stays plain |
| Role spaces | `limen workers · /path` | `src/integrations/herdr.ts` `ensureWorkspace` | no: Limen finds them by label |
| Agent names | `limen-f956-…`, `limen-origin-highlight` | spawn (`hostedAgentName`), coordinator manual | no: Herdr allows `[a-z0-9_-]` only |
| Text typed into a pane | wakes (`Limen job …`), rule pings (`Limen rule …`), the doorbell prompt | `coordinator-wake.ts` `promptPane`, `rule.ts`, `github.ts` | no: wake delivery matches these texts, and they are prompts, not labels |
| Pi toasts in the coordinator | `limen: <label> started (<id>)` | `hook/wake.ts` `ui.notify` | no: Pi's own UI; they already start with `limen:` |
| Pi session name of a hosted job | `--name "limen: <label>"` in `agent start` | `src/commands/spawn.ts` | no: a Pi argument, not a Herdr string |

A live pane follows the switch: the coordinator's sweep runs every 0.5 s and its report signature holds the marked text; the hosted reporter runs every 1 s and its signature holds the switch. Open job tabs follow through `followHighlight`, which `limen highlight on|off` and `/limen highlight on|off` run: it renames each open tab that a job record names, only while its label still starts with that job's `<label> · `.

## Herdr window: native

State icon and state word (`working`, `blocked`, `unknown`, and `idle`/`done` where Limen reports no label), detected agent kind (`pi`, `omp`), terminal title (`π - limen`, set by Pi), tab numbers Herdr gives an unnamed tab, workspace names the human typed, and Pi's own footer.

## Herdr limits

Confirmed in the Herdr 0.9.5 docs (`cli-reference.mdx`, `configuration.mdx`, `plugins.mdx` at tag v0.9.5).

- `pane report-metadata` text is plain: Herdr trims it, removes control characters and caps `--title`, `--display-agent`, each `--state-label` and each token value at 80 characters. The mark goes at the front because Herdr cuts the end.
- Color exists only through style rules in the user's `~/.config/herdr/config.toml`: `[ui.sidebar.agents] rows` (and `rows_by_agent`, and Space rows) take `{ token, fg, rules }` tables with `starts_with` or `contains` conditions. Those rules reach expanded sidebar tokens only (`agent`, `state_text`, `$limen`). Tab strip and pane-border text cannot be colored by a reporter or a rule. A colored or outlined highlight there needs a Herdr change, such as styling metadata by `--source`. Limen does not write the user's Herdr config.
- Plugin v1 has no native non-terminal UI, so a clickable toggle inside Herdr's chrome is not possible. The switch is a command, also inside the coordinator's Pi session. A plugin action with a keybinding could run `limen highlight on|off`; installing a plugin is out of scope.

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
