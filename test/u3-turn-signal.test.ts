// U3: what a coordinator is told. One ended turn tells the shepherd: a blocker always counts; any other end waits for
// the coordinator's own running jobs; an aborted turn means the owner is at the pane and never counts. A completion
// wake sends only a done job that is not a scout to landing; a done scout has nothing to land (F936).
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { type CoordinatorTurn, turnSignal } from "../src/integrations/coordinator-signal.ts";
import { completionWake } from "../src/job/wake-text.ts";

const todo = (content: string, status: string) => ({ content, status });
const goal = (status: string) => ({ id: "g", objective: "Ship F781", status });
const base: CoordinatorTurn = { todos: [], todosClosed: false, stop: "stop", ownedRunning: 0, said: "Report sent" };
const open = [todo("Review", "pending"), todo("Land F781", "in_progress")];
const closed = [todo("Spawn", "completed"), todo("Report", "abandoned"), todo("Land F781", "completed")];
const blocked = [todo("Review", "pending"), { content: "Land F781", status: "blocked", blocker: "needs owner" }];

const rows: ReadonlyArray<readonly [string, Partial<CoordinatorTurn>, string | undefined]> = [
	["open todos while an owned job runs", { todos: open, ownedRunning: 1 }, undefined],
	["a blocked todo while owned jobs run", { todos: blocked, ownedRunning: 2 }, "coordinator.blocked"],
	["a goal out of budget while a job runs", { goal: goal("budget-limited"), ownedRunning: 1 }, "coordinator.blocked"],
	["every todo closed this turn", { todos: closed, todosClosed: true }, "coordinator.goal-done"],
	["closed todos, an active goal", { todos: closed, todosClosed: true, goal: goal("active") }, "coordinator.idle"],
	["todos closed in an earlier turn", { todos: closed }, "coordinator.idle"],
	["an aborted turn with a blocked todo", { stop: "aborted", todos: blocked }, undefined],
];

test("an ended turn signals what its todos, goal, stop and owned jobs call for, naming the blocker or next todo", () => {
	for (const [name, turn, kind] of rows) {
		assert.equal(turnSignal({ ...base, ...turn })?.kind, kind, name);
	}
	assert.match(turnSignal({ ...base, todos: blocked })?.reason ?? "", /\(needs owner\); last message: Report sent$/);
	assert.match(turnSignal({ ...base, todos: open })?.reason ?? "", /next: Land F781; last message: Report sent$/);
});

test("only a done job that is not a scout is sent to landing", async (t) => {
	const dir = await mkdtemp(join(tmpdir(), "u12-"));
	t.after(() => rm(dir, { recursive: true, force: true }));
	await writeFile(join(dir, "task.md"), "Scout F001.\n");
	await writeFile(join(dir, "tool-calls"), "4\n");
	const wake = (state: string) =>
		completionWake(dir, "F001", state, "id", "limen/id", "", { instruction: "Inspect it before landing." });
	assert.doesNotMatch(wake("failed"), /landing/);
	assert.match(wake("done"), /is done \(id\).*before landing/s);
	await writeFile(join(dir, "role"), "scout\n");
	assert.match(wake("done"), /Nothing to land/);
	assert.doesNotMatch(wake("done"), /before landing|land it/);
});
