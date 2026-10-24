// F953 repair 4 sweep for false proof. Each command runs in a real /bin/bash with an `npm` stub that writes a marker when
// it runs. The call and its result go into a Pi transcript, and the real `noteCheckOpen` reads a final message that marks
// `npm test` proven. FALSE-POSITIVE: npm never ran, yet the line stays proven. rejected-ran: npm ran in a call that
// exited 0, yet Limen cannot prove it from the call (the cost of the conservative rule).
// Run from the repository root: node --no-warnings <this file> [source root, default: the current directory]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(process.argv[2] ?? process.cwd());
const { noteCheckOpen } = await import(pathToFileURL(join(root, "src/job/task-note.ts")).href);
const cases: string[] = [
	"npm test & wait",
	"npm test |& cat",
	"true && npm test > /dev/null",
	"exec 3>&1 && npm test",
	"[ -f nope ] && npm test",
	'cd "$(mktemp -d)" && npm test',
	"npm test # && exit",
	"true && trap '' EXIT && npm test",
	"true && kill $$ && npm test",
	"true && (exit 0) && npm test",
	"true && { exit 0; } && npm test",
	"true && ex\\it 0 && npm test",
	"true && $'exit' 0 && npm test",
	'true && "ex"it 0 && npm test',
	"true && ${E:-exit} 0 && npm test",
	"true && exit$IFS0 && npm test",
	"true && e''xit 0 && npm test",
	"true && {exit,0} && npm test",
	"PATH=/none npm test | cat",
	"! PATH=/none npm test",
	"time ! PATH=/none npm test",
	"true && command exit 0 && npm test",
	"true && builtin exit 0 && npm test",
	"true && . /dev/stdin <<< 'exit 0' && npm test",
	"true && source /dev/null && exit 0 && npm test",
	"cat <<<EOF && npm test\nexit 0",
	"cat <<EOF && npm test\nEOF",
	"cat <<EOF\nnpm test\nEOF",
	"echo $'\\'' ; exit 0 ; echo \"'\" && npm test",
	"printf 'x' | xargs npm test",
	"env -i npm test",
	"true && set -n && npm test",
	"true && shopt -s extdebug && trap false DEBUG && npm test",
	"true && hash -p /usr/bin/true npm && npm test",
	"true && enable -n test && npm test",
	"true && alias npm=true && npm test",
	"true && break && npm test",
	"true && return 0 && npm test",
	"true && logout && npm test",
	"true && exec true && npm test",
	"true && eval exit && npm test",
	"true && fc -s && npm test",
	"true && wait && npm test",
	"true && %1 && npm test",
	"npm test --help",
	"true && :; npm test",
	"true && >log exit 0 && npm test",
	"true && 2>/dev/null exit 0 && npm test",
	"true && X=1 exit 0 && npm test",
	"true && [[ 1 ]] && npm test",
	"true && \\\nexit 0 && npm test",
	"true &&\n exit 0 &&\n npm test",
	"true && exit\\\n 0 && npm test",
	"true && npm test 2>&1 >/dev/null",
	"npm  test",
	"npm\ttest",
	"true && ' exit' 0 && npm test",
	"true && /usr/bin/true && npm test",
	"unset PATH && npm test",
	"true && local x && npm test",
	"true && function && npm test",
	"true && select && npm test",
	"npm test && false",
	"npm test 1>&2 | cat",
	"true && exit 0 | cat && npm test",
	"true && (true) | npm test",
	"true | npm test",
	"false | npm test",
	"npm test | true",
	"! true && npm test",
	"true && ! true || npm test",
	"true && npm test || true",
	"npm test\n",
	"  npm test  ",
	"true && caller && npm test",
	"true && times && npm test",
	"true && ulimit -t 0 && npm test",
	"true && umask 777 && npm test",
	"true && exit 0 2>&1 && npm test",
	"true && suspend && npm test",
	"true && disown && npm test",
	"true && declare -f && npm test",
	"true && readonly PATH && npm test",
	"true && export -n PATH && npm test",
	"true && unset -v PATH && npm test",
	"true && let x=0 && npm test",
	"true && shift 9 && npm test",
	"true && command -p exit 0 && npm test",
	"true && time -p exit 0 && npm test",
	"true && command -- exit 0 && npm test",
	"command -v npm && npm test",
	"true && env -- npm test",
	"true && nohup npm test",
	"true && command npm test",
];
const plant = mkdtempSync(join(tmpdir(), "f953-sweep-"));
let flagged = 0;
for (const command of cases) {
	rmSync(plant, { recursive: true, force: true });
	const job = join(plant, ".limen/jobs/j");
	mkdirSync(join(job, "session"), { recursive: true });
	mkdirSync(join(plant, "bin"));
	writeFileSync(join(plant, "bin/npm"), '#!/bin/sh\necho "npm $*" >> "$F953_MARKER"\n', { mode: 0o755 });
	const marker = join(plant, "ran");
	const run = spawnSync("/bin/bash", ["-c", command], {
		cwd: plant,
		encoding: "utf8",
		timeout: 5000,
		input: "",
		env: { PATH: `${join(plant, "bin")}:/usr/bin:/bin`, HOME: plant, F953_MARKER: marker },
	});
	const ok = run.status === 0;
	const call = { role: "assistant", content: [{ type: "toolCall", id: "c", name: "bash", arguments: { command } }] };
	const result = { role: "toolResult", toolCallId: "c", toolName: "bash", isError: !ok };
	writeFileSync(join(job, "session/a.jsonl"), [call, result].map((message) => JSON.stringify({ message })).join("\n"));
	writeFileSync(join(job, "result"), "## Note check\n- X: proven. `npm test`\n");
	const open = noteCheckOpen(job);
	const proven = open.length === 0;
	const ran = existsSync(marker);
	const tag = proven && !ran ? "FALSE-POSITIVE" : !proven && ran && ok ? "rejected-ran" : proven ? "proven" : "open";
	flagged += tag === "FALSE-POSITIVE" ? 1 : 0;
	console.log(
		`${tag.padEnd(14)} exit=${run.status} ran=${ran ? "y" : "n"} ${JSON.stringify(command)}${proven ? "" : ` :: ${open[0]?.replace(/^X: not proven\. Limen: /, "")}`}`,
	);
}
rmSync(plant, { recursive: true, force: true });
console.log(`${flagged} false positives of ${cases.length}`);
