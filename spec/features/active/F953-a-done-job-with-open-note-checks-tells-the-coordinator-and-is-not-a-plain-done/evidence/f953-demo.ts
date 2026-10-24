// F953 demo. Fake jobs finish through the real `finalizeJob`; the script prints the recorded state, `open-checks`
// and the coordinator wake as Limen builds it. Then it replays two observed final messages from read-only copies.
// Run from the repository root: node --no-warnings spec/features/<lane>/F953-*/evidence/f953-demo.ts

import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { finalizeJob } = await import(join(process.cwd(), "src/job/record.ts"));
const { completionWake } = await import(join(process.cwd(), "src/job/wake-text.ts"));
const { noteCheckOpen } = await import(join(process.cwd(), "src/job/task-note.ts"));

const plant = await mkdtemp(join(tmpdir(), "f953-demo-"));
const ran = (command: string) =>
	JSON.stringify({ message: { role: "assistant", content: [{ type: "toolCall", arguments: { command } }] } });

async function fakeJob(id: string, result: string): Promise<string> {
	const job = join(plant, ".limen", "jobs", id);
	await mkdir(join(job, "session"), { recursive: true });
	await writeFile(join(job, "task.md"), "Fix the retry copy in the resume reply.\n");
	await writeFile(join(job, "log"), "[limen 2026-10-24T12:00:00.000Z] note check sent\n");
	await writeFile(join(job, "session", "a.jsonl"), `${ran("npm run check 2>&1 | tail -5")}\n`);
	await writeFile(join(job, "result"), result);
	await finalizeJob(job, "done", "pi exited 0");
	return job;
}

async function show(title: string, job: string, id: string): Promise<void> {
	const open = existsSync(join(job, "open-checks")) ? await readFile(join(job, "open-checks"), "utf8") : "(no file)\n";
	console.log(`=== ${title}`);
	console.log(`state: ${(await readFile(join(job, "state"), "utf8")).trim()}`);
	console.log(`open-checks:\n${open}`);
	console.log(`wake:\n${completionWake(job, "retry copy", "done", id, `limen/${id}`, "")}\n`);
}

const open = await fakeJob(
	"open",
	[
		"Changed the resume reply and its spec.",
		"",
		"## Note check",
		"- Resume sentence: proven. `npm run check` passes.",
		"- Retry spec: proven. `npm test -- retry` passes.",
		"- Clarity doc: not proven. I did not read `docs/clarity.html`.",
		'- Rule "do not deploy": followed. No deploy command ran.',
	].join("\n"),
);
await show("A fake finish with open checks", open, "open");
const plain = await fakeJob(
	"plain",
	["Changed the resume reply.", "", "## Note check", "- Resume sentence: proven. `npm run check` passes."].join("\n"),
);
await show("A fake finish with no open item", plain, "plain");

// Observed final messages, copied with their transcripts and logs; the originals are only read.
const observed = [
	["MEGA retry-copy", "/Users/overment/mega/mega-challenge/.limen/jobs/2026-10-23-s01e02-retry-c4-50350856"],
	[
		"F951 S3 priority budget",
		"/Users/overment/.overment/limen/.limen/jobs/2026-10-23-f951-low-budget-runs-priority-1-fd3e2d2b",
	],
];
for (const [name, source] of observed) {
	if (!source || !existsSync(source)) {
		console.log(`=== ${name}: ${source} is not on this machine; skipped\n`);
		continue;
	}
	const copy = join(plant, ".limen", "jobs", `observed-${observed.findIndex(([each]) => each === name)}`);
	await mkdir(copy, { recursive: true });
	for (const file of ["result", "log", "worktree", "session"]) {
		if (existsSync(join(source, file))) {
			await cp(join(source, file), join(copy, file), { recursive: true });
		}
	}
	console.log(`=== ${name} (${source})\nopen items Limen now records:`);
	console.log(
		`${
			noteCheckOpen(copy)
				.map((line: string) => `- ${line}`)
				.join("\n") || "(none)"
		}\n`,
	);
}
await rm(plant, { recursive: true, force: true });
