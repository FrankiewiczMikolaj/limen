// U3: what one ended coordinator turn tells the shepherd. A blocker always counts; any other end waits for the
// coordinator's own running jobs; an aborted turn means the owner is at the pane and never counts.
import assert from "node:assert/strict";
import test from "node:test";
import { type CoordinatorTurn, turnSignal } from "../src/integrations/coordinator-signal.ts";

const todo = (content: string, status: string, blocker?: string) => ({
	content,
	status,
	...(blocker ? { blocker } : {}),
});
const goal = (status: string) => ({ id: "g", objective: "Ship F781", status });
const base: CoordinatorTurn = { todos: [], todosClosed: false, stop: "stop", ownedRunning: 0, said: "Report sent" };
const open = [todo("Review", "pending"), todo("Land F781", "in_progress")];
const closed = [todo("Spawn", "completed"), todo("Report", "abandoned"), todo("Land F781", "completed")];
const blocked = [todo("Review", "pending"), todo("Land F781", "blocked", "needs owner")];

const rows: ReadonlyArray<readonly [string, Partial<CoordinatorTurn>, string | undefined]> = [
	["nothing open", {}, "coordinator.idle"],
	["open todos", { todos: open }, "coordinator.idle"],
	["open todos while an owned job runs", { todos: open, ownedRunning: 1 }, undefined],
	["a blocked todo while owned jobs run", { todos: blocked, ownedRunning: 2 }, "coordinator.blocked"],
	[
		"a goal out of token budget while an owned job runs",
		{ goal: goal("budget-limited"), ownedRunning: 1 },
		"coordinator.blocked",
	],
	["a paused goal", { goal: goal("paused") }, "coordinator.idle"],
	["every todo closed this turn", { todos: closed, todosClosed: true }, "coordinator.goal-done"],
	["every todo closed while an owned job runs", { todos: closed, todosClosed: true, ownedRunning: 1 }, undefined],
	[
		"every todo closed while the goal stays active",
		{ todos: closed, todosClosed: true, goal: goal("active") },
		"coordinator.idle",
	],
	["todos closed in an earlier turn", { todos: closed }, "coordinator.idle"],
	["a failed turn with nothing open", { stop: "error" }, "coordinator.idle"],
	["an aborted turn with a blocked todo", { stop: "aborted", todos: blocked }, undefined],
];

test("an ended coordinator turn gives the signal its todos, goal, stop reason and owned jobs call for", () => {
	for (const [name, turn, kind] of rows) {
		assert.equal(turnSignal({ ...base, ...turn })?.kind, kind, name);
	}
});

test("a signal names the blocker or the next open todo, then the last message", () => {
	assert.match(
		turnSignal({ ...base, todos: blocked })?.reason ?? "",
		/Land F781 \(needs owner\); last message: Report sent$/,
	);
	assert.match(turnSignal({ ...base, todos: open })?.reason ?? "", /next: Land F781; last message: Report sent$/);
});
