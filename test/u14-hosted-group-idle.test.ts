// U14: an idle hosted session after its turn. A group member's round ends with that turn even when its worktree is
// no clean Git checkout, so a round never waits for the group deadline; a lone job's unclean session stays open.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { noteHostedIdle } from "../src/runtime/supervisor.ts";

test("an idle group member closes after its turn whatever its worktree holds; a lone job stays open", async () => {
	const root = await realpath(await mkdtemp(join(tmpdir(), "limen-u14-")));
	// The worktree a racing prune left: only the target/ a background build was still writing.
	const tree = join(root, "tree");
	await mkdir(join(tree, "target"), { recursive: true });
	await mkdir(join(root, ".limen/groups/g1"), { recursive: true });
	const members = ["done", "error"].map((id) => ({ id, team: id, role: "coordinator", deadline: 0 }));
	await writeFile(join(root, ".limen/groups/g1/run.json"), JSON.stringify({ id: "g1", root, members }));
	const idle = async (id: string, group: string, stopReason: string) => {
		const dir = join(root, ".limen/jobs", id);
		await mkdir(join(dir, "session"), { recursive: true });
		const message = { role: "assistant", content: [{ type: "text", text: "Draft result" }], stopReason };
		await writeFile(join(dir, "session/1.jsonl"), `${JSON.stringify({ type: "message", message })}\n`);
		for (const [name, value] of Object.entries({ activity: "wait", worktree: tree, "tool-calls": "3", group })) {
			await writeFile(join(dir, name), `${value}\n`);
		}
		return noteHostedIdle(dir, "idle", { leftWorkingAt: undefined, armed: true }, Date.now(), 0);
	};
	try {
		assert.equal(await idle("done", "g1", "stop"), "closed an idle group session that is not clean");
		assert.equal(await idle("error", "g1", "error"), "closed a group session whose last turn failed");
		assert.equal(await idle("lone", "", "stop"), undefined);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});
