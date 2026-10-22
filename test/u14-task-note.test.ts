// U14: the task note shows at a job's first prompt, keeps its first version, logs each change, and is checked once.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import limenCommunication from "../hook/communication.ts";
import limenFinish from "../hook/finish.ts";

type Result = { message?: { content: string }; entries?: { content: string }[]; content: { text: string }[] };
type Hook = (...args: unknown[]) => Result | undefined;
function load(hook: (pi: never) => void) {
	const handlers = new Map<string, Hook>();
	hook({
		on: handlers.set.bind(handlers),
		registerTool: (tool: { execute: Hook }) => handlers.set("finish", tool.execute),
	} as never);
	const end = async (handoff: string) => (await handlers.get("finish")?.("t", { handoff }, 0, 0, {}))?.content[0]?.text;
	return { call: (name: string, ...args: unknown[]) => handlers.get(name)?.(...args), end, handlers };
}

test("a job's note shows once, keeps its first version, logs changes, and is checked once before the finish", async (t) => {
	const root = await mkdtemp(join(tmpdir(), "u14-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	const job = join(root, ".limen/jobs/j1");
	await mkdir(job, { recursive: true });
	await writeFile(join(job, "log"), "");
	Object.assign(process.env, { LIMEN_JOB: "1", LIMEN_CONTEXT_ROOT: root, LIMEN_JOB_ID: "j1", LIMEN_HOSTED: "0" });
	const hook = load(limenCommunication);
	const prompt = (pi = hook) => pi.call("before_agent_start", {}, { cwd: root })?.message?.content ?? "";
	const first = prompt();
	assert.ok(first.includes(`${job}/note.md, or write it`) && !/reminder/i.test(first), "no reminders file, no mention");
	assert.ok(!prompt().includes(`${job}/note.md`), "the second prompt");
	for (const text of ["- 🔴 a", "- 🔴 a", "- 🔴 a\n  - 🟡 changed: b. Reason: steer."]) {
		await writeFile(join(job, "note.md"), text);
		hook.call("tool_result", { toolName: "bash", content: [] }, { cwd: root });
	}
	assert.equal(await readFile(join(job, "note.first.md"), "utf8"), "- 🔴 a");
	assert.equal((await readFile(join(job, "log"), "utf8")).split("] note changed\n").length, 3);
	await mkdir(join(root, ".agents/limen"), { recursive: true });
	await writeFile(join(root, ".agents/limen/reminders.md"), "- 🔴 Never push to main.\n");
	assert.match(
		prompt(load(limenCommunication)),
		/Project reminders \(\S+\/reminders\.md\)\..*\n- 🔴 Never push to main\.$/,
	);
	// Detached: a run that ends without finish gets the check as one more turn, once; finish then ends the job.
	const detached = load(limenFinish);
	const ask = detached.call("agent_before_settle", { outcome: "completed", entries: [] })?.entries?.[0]?.content;
	assert.match(ask ?? "", /now:\n- 🔴 a\n {2}- 🟡 changed: b\. Reason: steer\.\nYour note at the start:\n- 🔴 a\n/);
	assert.match(
		ask ?? "",
		/reminders:\n- 🔴 Never push to main\.\nIn your final .* each 🔴 point and each 🔴 project reminder/,
	);
	assert.equal(detached.call("agent_before_settle", { outcome: "completed", entries: [] }), undefined);
	assert.equal(await detached.end("handoff"), "done");
	// Hosted: the first finish answers with the check and ends nothing; a missing note asks from memory.
	process.env.LIMEN_HOSTED = "1";
	await rm(join(job, "note.md"));
	const hosted = load(limenFinish);
	assert.equal(hosted.handlers.has("agent_before_settle") || hosted.handlers.has("session_stop"), false);
	assert.match((await hosted.end("early")) ?? "", /You wrote no note in .*From memory.*Then call finish again/s);
	assert.equal(await readFile(join(job, "result"), "utf8"), "handoff\n");
	assert.equal(await hosted.end("final"), "done");
	assert.equal((await readFile(join(job, "log"), "utf8")).split("] note check sent\n").length, 3);
});
