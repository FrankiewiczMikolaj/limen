# Learning-system design, revision 2

Superseded the same day by revision 3, written by another coordinator session: the page now has SHA-256 `c3de32ae041bd4fc69a42cfc1cd4020f1168f7789cb6942187879e3092c83814` and nine open choices, of which choices 1 to 4 must be answered before a pilot. This note keeps the revision 2 record; the page is the current design.

The page is `/Users/overment/Downloads/limen-learning-system.html` (SHA-256 `48ab34b0af21a3a5640590198f603b23b32818c28858db1b76a2e88e8a74070c`). It stays outside Git. Design only: no file, skill, hook change or timer is installed, and no pilot has run.

## Facts that shaped it

Checked at Limen `caac446` and Pi 1.4.0.

- Pi puts the name, description and path of every discovered skill into every session's system prompt, jobs included: 37 KB for 60 skills, measured in two job sessions. In a job here that is more than all Limen guidance. A skill with `disable-model-invocation: true` leaves that list (Pi `dist/core/skills.js`, lines 272–279).
- Always-on size per call, about: coordinator 111 KB in this plant and 174 KB in Alice; worker 65 KB and 98 KB.
- `hook/communication.ts` names unread guidance lines in the result of the edit that needs them, once per context, and resets on `session_compact`, so the reminders fire again after compaction.
- The vision reminder at `limen spawn` arrives after the job already has its task, so prose cannot attach context to a job at spawn.
- A root `AGENTS.md` turns off the inherited shop manual for the coordinator.

## Proposal

- Every call: the heading and Rule line of each owner principle (at most 1.5 KB) and an area list generated from each area file's first three lines. Growth is at most 3 KB per role.
- At the moment: spawn writes a "Read first" block into `task.md` with the area files and maps whose Scope matches the paths the ticket and the task name. The first edit inside a Scope names the unread lines of the area file and its maps, through the existing recall reminder.
- On demand: decision records, tickets, code and tests, through links.
- Six shape and refine skills ship hidden in the Limen package. A template line, a hook or a timer names each by path.
- The coordinator owns feature maps and decision records. Adam confirms principles and vision. This changes revision 1.
- Optional: on `session_before_compact`, a hook saves Adam's own messages to `.limen/learning/owner-words.md`, private, for 30 days.

## Open choices

1. Owner principles in every prompt: Rule lines only, the whole file, or a pointer only?
2. The owner file is `~/.overment/principles.md`, private and shared by all projects?
3. The coordinator owns feature maps and decision records without asking Adam?
4. Spawn attaches the matching area and maps (small code), or the coordinator names them (prose only)?
5. A hook saves Adam's own messages at compaction into a private 30-day inbox?
6. Cadence, route and budget for each refine timer?
7. Separately: jobs start with project and named skills only (`--no-skills` plus `--skill`), about 30 KB less per job?

Not verified: whether a timer-started job wakes any coordinator, OMP support for hidden skills, and how often matching by path finds the right map. Render evidence is in [checks.md](checks.md). The revision 1 page is kept only at `/tmp/f952-r2/rev1.html`.
