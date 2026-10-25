# Outcome

`limen highlight on|off` (also `/limen highlight on|off` in a coordinator) is one seat-wide switch, off by default. While it is on, every string Limen writes into Herdr starts with `◆`, and the picture page has its own **◆ Limen marks** button that outlines what comes from tickets, the board and jobs. Landed in `7a8a095` (Herdr) and `063afd4` (map), closed in `6678248`; `npm run check` passed at `063afd4` with `test/` at 3,500 lines.

Live proof on Herdr 0.9.5 on 2026-10-25: the switch renamed an open job tab to `◆ …` and back byte for byte, Herdr kept `◆` in a display agent and a pane title while agent kind and terminal title did not change, and the served page on port 4747 showed the button and kept it after a reload. A coordinator or hosted job pane shows the marks only after its Pi session loads the new hooks (`/reload`, or a new job).

Herdr strips control characters from reported text and colors only sidebar tokens through the user's own config, so Limen marks with a character, not a color. A colored highlight on the tab strip and pane borders needs a Herdr change, such as styling metadata by its `--source`. `docs/herdr-status.md` carries an optional sidebar rule, checked with `herdr config check`. Screenshots and live logs are in `~/Downloads/limen-marks/`, and can be deleted once Adam has seen them.
