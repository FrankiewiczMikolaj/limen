# F953 repair 4

Code candidate: `d1db363`. The evidence commit after it changes no code.

The rule now: a backticked command counts as run only when one recorded bash call ended with exit 0, the call is one chain joined by `&&` (or a pipe), no pipe follows the command, and no word in the call can skip a command or hide a failure. Each open line names the reason. The evidence probe runs every case in a real `/bin/bash` with an `npm` stub that writes a marker, and goes through the real `finalizeJob` and `completionWake`.

## Review findings

- **Review 1, quoted command** (`printf '%s\n' 'npm test'`): still fixed. A quoted word starts no command. The open line says "(no shell call names it as a command)". Shown by: probe case "review 1", u14 `C1`.
- **Review 2, skipped command** (`false && npm test`): still fixed. The call ends with exit 1: "(its shell call did not end with exit 0)". The masked form `false && npm test; true` says "(its shell call holds `;`)". Shown by: probe "review 2", u14 `C2` and `C3`.
- **Review 3, early exit** (`if true; then exit 0; fi; npm test`): still fixed: "(its shell call holds `if`)". Shown by: probe "review 3", u14 `C4`.
- **Reviews 1 and 3, display wording**: fixed. The `limen jobs` row said `done with 1 open check`; it now says `done with open checks`. The detail header says the same and no longer repeats it as a reason. The done mark is yellow. The compact view keeps `DONE WITH OPEN CHECKS`, in the upper case of its other phase labels. Shown by: `evidence/demo-output.txt`, "limen jobs rows".
- **Reviews 1 and 3, board drift**: not edited. The coordinator's landing operation owns `spec/build.md`.

## Gaps in the unreviewed chain rule (2063244), each reproduced at 331ed84 first

- **A pipe hides a failure.** `npm test 2>&1 | tail -1` exits 0 when `npm` is missing, and `cd missing 2>&1 | tail -1 && npm test` runs npm after a failed `cd`. Both counted. Now a command with a pipe after it does not count: "(a `|` follows it and hides its exit status)". u14 `C7`.
- **Words that run something else.** `! npm test` turns exit 127 into 0. `'exit'`, `\exit` and `${E:-exit}` still run the `exit` builtin. `command -p exit 0` and `time -p exit 0` do too. `hash -p /usr/bin/true npm` replaces npm. All counted. Now `!`, a command name with quotes, `\`, `$`, a glob or a brace, a command name that starts with `-`, and `hash`, `enable`, `alias`, `shopt`, `mapfile`, `readarray` and `coproc` make the call prove nothing. `command -v npm test` and `xargs npm test` already did not count, because `npm` does not start their command. u14 `C5`, `C6`.
- **A result that is not the call's own.** Any tool call with a `command` argument counted, so a tool that is not a shell gave proof. Now the call must be a `bash` tool call, answered in the same transcript by a `bash` result with the same `toolCallId` and `isError: false`. u14 `C8` (an `eval` tool) and `C9` (the only result answers another call).
- **OMP keeps one shell.** OMP runs one persistent brush shell for each session (in the OMP binary: a session-keyed shell cache and `isPersistentShellCdCommand`). Calls `npm() { :; }`, then `npm test`, both exit 0, and npm never runs. Now, in an `omp` job, each call after one that defines a function or runs `eval`, `source`, `.`, `trap`, `set`, `shopt`, `hash`, `enable` or `alias` proves nothing. Pi starts a new `/bin/bash` for each call; the probe's Pi control still counts there.

## Remaining limits

- Limen does not see what the shell loads at its start: exported functions, `BASH_ENV`, Pi's shell command prefix, or OMP's snapshot of the user's aliases and functions.
- Arguments are not judged: `npm test --help` counts as `npm test` (the ticket leaves judging the evidence out of scope).
- The common `npm run check 2>&1 | tail` no longer counts, and neither does `set -o pipefail && …`. The before-finish check tells the worker to name a saved log file. The sweep's `rejected-ran` rows list these costs.
- The list of stopper words is finite. The sweep found no false proof in 94 shell forms; an unlisted builtin could still pass.

## Test cap and checks

- `test/` holds 3,499 lines at `d1db363`. In u14, 13 lines that recorded `isError: false` for any command became a table of 10 commands run in a real shell. To fit, two statements of `test/fake-engine.mjs` and one fixture object of `test/s10-doorbell.test.ts` were compacted. Their behavior did not change.
- Full check: `evidence/npm-run-check.txt`, `npm run check` once at `d1db363`: exit 0, 81 of 81 tests.
- Probe: `evidence/real-shell-probe.txt`, 20 of 20 at `d1db363`. The code of each reviewed commit fails its own review case.
- Sweep: `evidence/false-positive-sweep.txt`, no false proof in 94 forms. Mutations: `evidence/mutations.txt`, each of 12 fails its check. Demo: `evidence/demo-output.txt`.
