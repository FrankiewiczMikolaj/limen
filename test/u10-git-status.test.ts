// U10 · The hosted idle check on a worker's tree. Its status read must not refresh that tree's index: on stale stat
// data plain `git status` takes index.lock and races the worker's own commit (43c01cf).
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { worktreeState } from "../src/project/git.ts";
import { noteHostedIdle } from "../src/runtime/supervisor.ts";
import { repository } from "./plant.ts";

test("worktreeState reads a tree with stale stat data without rewriting its index", async (context) => {
	const root = await mkdtemp(join(tmpdir(), "limen-u10-"));
	context.after(() => rm(root, { recursive: true, force: true }));
	await repository(root);
	const index = join(root, ".git/index");
	const before = await readFile(index);
	await utimes(join(root, "README.md"), new Date(0), new Date(0));
	assert.equal(worktreeState(root), "clean");
	assert.deepEqual(await readFile(index), before);
	await writeFile(join(root, "README.md"), "changed\n");
	assert.equal(worktreeState(root), "dirty");
	assert.deepEqual(await readFile(index), before);
});

test("an idle group member closes after its turn in a tree that is no checkout (F1083); a lone job stays open", async (t) => {
	const root = await mkdtemp(join(tmpdir(), "limen-u10-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	const members = ["done", "error"].map((id) => ({ id, team: id, role: "coordinator" }));
	await mkdir(join(root, ".limen/groups/g"), { recursive: true });
	await writeFile(join(root, ".limen/groups/g/run.json"), JSON.stringify({ id: "g", root, members }));
	const idle = async (id: string, group: string, stopReason: string) => {
		const dir = join(root, ".limen/jobs", id);
		await mkdir(join(dir, "session"), { recursive: true });
		const message = { role: "assistant", content: [{ type: "text", text: "Draft" }], stopReason };
		await writeFile(join(dir, "session/1.jsonl"), JSON.stringify({ type: "message", message }));
		for (const [name, value] of Object.entries({ activity: "wait", worktree: root, group })) {
			await writeFile(join(dir, name), value);
		}
		return noteHostedIdle(dir, "idle", { leftWorkingAt: undefined, armed: true }, Date.now(), 0);
	};
	assert.ok(await idle("done", "g", "stop"));
	assert.ok(await idle("error", "g", "error"));
	assert.equal(await idle("lone", "", "stop"), undefined);
});
