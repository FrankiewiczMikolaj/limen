# Outcome

These changes landed on main:
- **Start queue (S1, merge 42f4c6f).** `limen spawn` queues a detached job until the Mac has at least 25% idle CPU and 20% free memory. One queue for the whole seat starts jobs in `--priority` order, and the coordinator gets one start notice.
- **Rule broadcast (S2, merge d53631c).** `limen rule` keeps one rule per name for the whole seat. It pings each live coordinator pane once when the rule is set, changed or ended, including at its end time.
- **Priority budget (S3, merge 2e0cba9).** A rule with `--start-priority N` holds less urgent jobs until it ends. The shop manual replaces a one-job rule with this budget.

S2 passed its re-review. S1 and S3 failed their second review and landed on the coordinator's judgment, because the loop ends after two FAILs. Each kept one narrow race; `s1-landing.md` and `s3-landing.md` name the race and the follow-up.

`npm run check` passes at 38db673 with 81 of 81 tests (`evidence/main-38db673-check.log`).

The gate is on by default for every plant. Running Pi coordinators must `/reload` to load the new wake hook. The Alice board line 9 still holds the old gate and job rules, and Tony owns that edit.
