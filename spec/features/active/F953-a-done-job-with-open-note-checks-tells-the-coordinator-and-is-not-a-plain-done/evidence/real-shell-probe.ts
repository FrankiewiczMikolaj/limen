// F953 repair 4 probe. Each case runs its commands in a real /bin/bash, with a `npm` stub on PATH that writes a marker
// when it runs. It records them as a Pi transcript (an OMP case runs its calls in one shell, as OMP's persistent shell
// does), writes a final message that marks the command proven, and finishes the job through the real `finalizeJob`.
// The wake is the real `completionWake`. A case passes when the wake is "done with open checks" exactly when expected.
// Run from the repository root: node --no-warnings <this file> [source root, default: the current directory]

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const source = resolve(process.argv[2] ?? process.cwd());
const { finalizeJob } = await import(pathToFileURL(join(source, "src/job/record.ts")).href);
const { completionWake } = await import(pathToFileURL(join(source, "src/job/wake-text.ts")).href);

type Case = {
	readonly id: string;
	readonly calls: readonly string[];
	readonly named: string;
	readonly open: boolean;
	/** `eval`: a tool that is not a shell records the call; `unanswered`: the bash call has no result. */
	readonly tool?: "eval" | "unanswered";
	readonly engine?: "omp";
	readonly noStub?: boolean;
	readonly file?: string;
};
const cases: Case[] = [
	{ id: "review 1: quoted", calls: ["printf '%s\\n' 'npm test'"], named: "npm test", open: true },
	{ id: "review 2: skipped", calls: ["false && npm test"], named: "npm test", open: true },
	{ id: "review 3: early exit", calls: ["if true; then exit 0; fi; npm test"], named: "npm test", open: true },
	{
		id: "pipe hides a missing command",
		calls: ["npm test 2>&1 | tail -1"],
		named: "npm test",
		open: true,
		noStub: true,
	},
	{
		id: "pipe masks a failed && prefix",
		calls: ["cd missing 2>&1 | tail -1 && npm test"],
		named: "cd missing && npm test",
		open: true,
	},
	{ id: "! hides a missing command", calls: ["! npm test"], named: "npm test", open: true, noStub: true },
	{ id: "quoted exit", calls: ["true && 'exit' 0 && npm test"], named: "npm test", open: true },
	{ id: "escaped exit", calls: ["true && \\exit 0 && npm test"], named: "npm test", open: true },
	{ id: "hash -p stands in", calls: ["hash -p /usr/bin/true npm && npm test"], named: "npm test", open: true },
	{ id: "command -p runs a builtin", calls: ["true && command -p exit 0 && npm test"], named: "npm test", open: true },
	{ id: "command -v declines", calls: ["command -v npm test"], named: "npm test", open: true },
	{ id: "xargs declines", calls: ["xargs npm test < /dev/null"], named: "npm test", open: true },
	{ id: "not a shell tool", calls: ["npm test"], named: "npm test", open: true, tool: "eval" },
	{ id: "no shell result", calls: ["npm test"], named: "npm test", open: true, tool: "unanswered" },
	{ id: "OMP keeps a function", calls: ["npm() { :; }", "npm test"], named: "npm test", open: true, engine: "omp" },
	{ id: "control: ran", calls: ["npm test"], named: "npm test", open: false },
	{ id: "control: chain", calls: ["cd sub && CI=1 npm test -- --grep x"], named: "npm test", open: false },
	{ id: "control: last in pipe", calls: ["printf x | npm test"], named: "npm test", open: false },
	{ id: "control: Pi shell per call", calls: ["npm() { :; }", "npm test"], named: "npm test", open: false },
	{ id: "control: saved file", calls: [], named: "check.log", open: false, file: "check.log" },
];

const plant = await mkdtemp(join(tmpdir(), "f953-probe-"));
let bad = 0;
const wakes: string[] = [];
for (const [index, each] of cases.entries()) {
	const root = join(plant, String(index));
	const bin = join(root, "bin");
	const marker = join(root, "npm-ran");
	const job = join(root, ".limen/jobs", `case-${index}`);
	await Promise.all([bin, join(root, "sub"), join(job, "session")].map((dir) => mkdir(dir, { recursive: true })));
	if (!each.noStub) {
		await writeFile(join(bin, "npm"), '#!/bin/sh\necho "npm $*" >> "$F953_MARKER"\n', { mode: 0o755 });
	}
	const statuses = run(each, root, bin, marker);
	await writeFile(join(job, "session/a.jsonl"), transcript(each, statuses));
	await writeFile(join(job, "worktree"), `${root}\n`);
	await writeFile(join(job, "task.md"), "Show which proven lines Limen accepts.\n");
	await writeFile(join(job, "log"), "[limen 2026-10-24T12:00:00.000Z] note check sent\n");
	await writeFile(join(job, "result"), `Done.\n\n## Note check\n- Suite: proven. \`${each.named}\`\n`);
	if (each.engine) {
		await writeFile(join(job, "engine"), `${each.engine}\n`);
	}
	if (each.file) {
		await writeFile(join(root, each.file), "saved output\n");
	}
	await finalizeJob(job, "done", "pi exited 0");
	const wake: string = completionWake(job, "probe", "done", `case-${index}`, `limen/case-${index}`, "");
	const open = /^is done with open checks /m.test(wake);
	const lines = existsSync(join(job, "open-checks")) ? (await readFile(join(job, "open-checks"), "utf8")).trim() : "";
	bad += open === each.open ? 0 : 1;
	const ran = existsSync(marker) ? "yes" : "no";
	console.log(
		`${open === each.open ? "ok " : "BAD"} ${each.id}: ${JSON.stringify(each.calls)} names \`${each.named}\``,
	);
	console.log(
		`    exit ${statuses.join(",") || "-"} · npm ran: ${ran} · wake: ${open ? "done with open checks" : "done"}`,
	);
	console.log(`    open-checks: ${lines || "(no file)"}`);
	if (each.id === "review 3: early exit" || each.id === "control: ran") {
		wakes.push(`=== Wake for "${each.id}"\n${wake}`);
	}
}
await rm(plant, { recursive: true, force: true });
console.log(`${cases.length - bad} of ${cases.length} as expected (source ${source})\n`);
console.log(wakes.join("\n\n"));
process.exitCode = bad ? 1 : 0;

/** Runs the calls in a real shell: one shell per call as Pi does, or one shell for all as OMP does. */
function run(each: Case, root: string, bin: string, marker: string): number[] {
	if (each.tool) {
		return [];
	}
	const env = { PATH: `${bin}:/usr/bin:/bin`, HOME: root, F953_MARKER: marker, F953_STATUS: join(root, "status") };
	const shell = (script: string) => spawnSync("/bin/bash", ["-c", script], { cwd: root, env, encoding: "utf8" });
	if (each.engine !== "omp") {
		return each.calls.map((command) => shell(command).status ?? -1);
	}
	shell(each.calls.map((command) => `${command}\necho $? >> "$F953_STATUS"`).join("\n"));
	return spawnSync("cat", [env.F953_STATUS], { encoding: "utf8" }).stdout.trim().split("\n").map(Number);
}

/** The calls and their results as Pi and OMP record them. A failed bash result is `isError: true`. */
function transcript(each: Case, statuses: readonly number[]): string {
	const name = each.tool === "eval" ? "eval" : "bash";
	return each.calls
		.flatMap((command, index) => {
			const id = `call-${index}`;
			const call = { role: "assistant", content: [{ type: "toolCall", id, name, arguments: { command } }] };
			const failed = each.tool ? false : statuses[index] !== 0;
			const result = { role: "toolResult", toolCallId: id, toolName: name, content: [], isError: failed };
			return each.tool === "unanswered" ? [call] : [call, result];
		})
		.map((message) => `${JSON.stringify({ type: "message", message })}\n`)
		.join("");
}
