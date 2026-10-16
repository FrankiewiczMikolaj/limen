import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { open, readdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { SESSION_ID } from "../job/job.ts";
import { textFile } from "../job/record.ts";
import { processInfo } from "../runtime/contain.ts";
import { deliverEventWebhook, finishWebhookEnv, type PlantEvent, plantBranch } from "./finish-webhook.ts";

type Todo = { readonly content: string; readonly status: string; readonly blocker?: string };
type Goal = { readonly id: string; readonly objective: string; readonly status: string };
type Kind = "coordinator.idle" | "coordinator.blocked" | "coordinator.goal-done" | "coordinator.exited";
export type CoordinatorSignal = { readonly kind: Exclude<Kind, "coordinator.exited">; readonly reason: string };
export type CoordinatorSession = {
	readonly cwd: string;
	readonly agent?: { readonly kind: string };
	readonly sessionManager: {
		getSessionId(): string;
		getSessionFile?(): string | undefined;
		getSessionName?(): string | undefined;
	};
};

const HANDOFF: Record<Kind, string> = {
	"coordinator.idle": "Coordinator turn ended. Next step: read its last message, then answer, steer or decide.",
	"coordinator.blocked": "Coordinator is blocked. Next step: answer it or remove the blocker.",
	"coordinator.goal-done": "Coordinator goal done. Next step: review the result, then land or close it.",
	"coordinator.exited":
		"Coordinator process exited. Next step: restart it in its pane, then check unfinished work such as a land in progress.",
};
const OPEN: Record<string, true> = { pending: true, in_progress: true };
const FEATURE = /\bF\d{3,5}\b/;
/**
 * One ended turn: the latest todo list, whether it closed this turn, the goal, the last stop reason, owned running
 * jobs, and the first line of the turn's last assistant message.
 */
export type CoordinatorTurn = {
	readonly todos: readonly Todo[];
	readonly todosClosed: boolean;
	readonly goal?: Goal;
	readonly stop: string;
	readonly ownedRunning: number;
	readonly said: string;
};

/**
 * What an ended coordinator turn means for the shepherd. A blocker always counts. Any other turn end counts only when
 * no running job owned by this coordinator will wake it again; an aborted turn means the owner is at the pane.
 */
export function turnSignal(turn: CoordinatorTurn): CoordinatorSignal | undefined {
	if (turn.stop === "aborted") {
		return;
	}
	const said = turn.said ? `; last message: ${turn.said}` : "";
	const blocked = turn.todos.find((todo) => todo.status === "blocked");
	if (blocked) {
		return {
			kind: "coordinator.blocked",
			reason: `todo blocked: ${blocked.content}${blocked.blocker ? ` (${blocked.blocker})` : ""}${said}`,
		};
	}
	if (turn.goal?.status === "budget-limited") {
		return { kind: "coordinator.blocked", reason: `goal token budget reached: ${turn.goal.objective}${said}` };
	}
	if (turn.ownedRunning > 0) {
		return;
	}
	const open = turn.todos.filter((todo) => OPEN[todo.status]);
	const goalOpen = turn.goal?.status === "active" || turn.goal?.status === "paused";
	if (turn.todosClosed && !open.length && !goalOpen) {
		const done = turn.todos.filter((todo) => todo.status === "completed");
		return {
			kind: "coordinator.goal-done",
			reason: `all ${turn.todos.length} todos closed; last done: ${done.at(-1)?.content ?? "none"}${said}`,
		};
	}
	const next = open.find((todo) => todo.status === "in_progress") ?? open[0];
	const work = next
		? ` with ${open.length} open todo${open.length === 1 ? "" : "s"}; next: ${next.content}`
		: goalOpen
			? ` with goal ${turn.goal?.status}: ${turn.goal?.objective}`
			: "";
	return {
		kind: "coordinator.idle",
		reason: `${turn.stop === "error" ? "last turn failed" : "turn ended"}${work}${said}`,
	};
}

/**
 * Coordinator milestones from the wake hook. The coordinator registers under `.limen/coordinators/<session>` so the
 * sweep can find its process exit later, when no code runs in the dead process. Its pings queue under
 * `.limen/coordinator-events/<session>`, which outlives the registration. `askMs` is how long an `ask` waits before
 * it counts as blocked.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: split pending: factory, handlers share its state
export function coordinatorSignals(askMs = 60_000) {
	let dir: string | undefined;
	let root = "";
	let session: CoordinatorSession | undefined;
	let pane = "";
	let todos: readonly Todo[] = [];
	let todosOpen = false;
	let todosClosed = false;
	let goal: Goal | undefined;
	let goalDone = false;
	let stop = "";
	// An assistant message opens a turn; the first turn end closes it, so a repeated end event sends nothing.
	let turnOpen = false;
	let said = "";
	let ticket = "";
	let ask: NodeJS.Timeout | undefined;
	const tools = new Map<string, string>();
	const write = (name: string, value: string) => {
		if (!dir) {
			return;
		}
		try {
			writeFileSync(join(dir, name), `${value}\n`);
		} catch {
			// The registration is advisory; a missing file only weakens a later exit reason.
		}
	};
	const title = () => {
		const name =
			session?.sessionManager.getSessionName?.()?.trim() ||
			`coordinator ${pane || session?.sessionManager.getSessionId()}`;
		return ticket && !name.includes(ticket) ? `${name} · ${ticket}` : name;
	};
	// The start time tells the sweep a reused pid from this process. A loaded machine can miss the 1s query; a later turn end retries.
	const recordBorn = () => {
		if (!dir || existsSync(join(dir, "born"))) {
			return;
		}
		void processInfo(process.pid)
			.then((outcome) => {
				if (outcome.kind === "present") {
					write("born", outcome.process.born);
				}
			})
			.catch(() => {});
	};
	const signal = (kind: Exclude<Kind, "coordinator.exited">, reason: string, claim = String(Date.now())) => {
		if (!dir || !session) {
			return;
		}
		// Pings live outside the registration, which a normal exit or a resumed session removes.
		const events = join(root, ".limen", "coordinator-events", session.sessionManager.getSessionId());
		try {
			const config = finishWebhookEnv(root, root);
			if (!config) {
				return;
			}
			const event: PlantEvent = {
				kind,
				status: kind.slice("coordinator.".length),
				title: title(),
				id: session.sessionManager.getSessionId(),
				reason,
				branch: plantBranch(root),
				plant: basename(root),
				handoff: HANDOFF[kind],
			};
			void deliverEventWebhook(join(events, `${kind}.${claim}`), config, event, join(root, ".limen")).catch(() => {});
		} catch {
			// A webhook is a side channel; it never disturbs the coordinator's turn.
		}
	};
	return {
		start(plant: string, context: CoordinatorSession): void {
			if (process.env.LIMEN_JOB === "1" || context.agent?.kind === "sub") {
				return;
			}
			pane = process.env.HERDR_ENV === "1" ? (process.env.HERDR_PANE_ID?.trim() ?? "") : "";
			if (process.env.LIMEN_COORDINATOR !== "1" && !pane) {
				return;
			}
			const id = context.sessionManager.getSessionId();
			if (!SESSION_ID.test(id)) {
				return;
			}
			const base = join(plant, ".limen", "coordinators");
			try {
				// A resumed session in a new process starts a fresh registration: the old pid, start time, and exit claim describe another process.
				const previous = readOptional(join(base, id, "pid"));
				if (previous && previous !== String(process.pid)) {
					rmSync(join(base, id), { recursive: true, force: true });
				}
				mkdirSync(join(base, id), { recursive: true });
				// One process holds one registration: a switched session ends the old one cleanly.
				for (const name of readdirSync(base)) {
					if (name !== id && readOptional(join(base, name, "pid")) === String(process.pid)) {
						rmSync(join(base, name), { recursive: true, force: true });
					}
				}
				rmSync(join(base, id, "shutdown"), { force: true });
			} catch {
				return;
			}
			root = plant;
			session = context;
			dir = join(base, id);
			write("pid", String(process.pid));
			write("pane", pane);
			write("session-file", context.sessionManager.getSessionFile?.() ?? "");
			write("started-at", new Date().toISOString());
			write("title", title());
			recordBorn();
		},
		toolStart(event: unknown): void {
			if (!dir) {
				return;
			}
			const value = fields(event);
			const name = typeof value.toolName === "string" && value.toolName.trim() ? value.toolName.trim() : "tool";
			const args = fields(value.args ?? value.input);
			const detail = typeof args.command === "string" ? args.command : typeof args.path === "string" ? args.path : "";
			tools.set(
				typeof value.toolCallId === "string" ? value.toolCallId : name,
				`${name}${detail ? `: ${detail.replace(/\s+/g, " ").trim().slice(0, 160)}` : ""}`,
			);
			write("tool", [...tools.values()].at(-1) ?? name);
			if (name !== "ask") {
				return;
			}
			const first = fields(Array.isArray(args.questions) ? args.questions[0] : undefined);
			const question = typeof first.question === "string" ? first.question : "a question";
			clearTimeout(ask);
			ask = setTimeout(() => signal("coordinator.blocked", `waiting for an answer: ${question}`), askMs);
			ask.unref();
		},
		toolEnd(event: unknown): void {
			if (!dir) {
				return;
			}
			const value = fields(event);
			const name = typeof value.toolName === "string" && value.toolName.trim() ? value.toolName.trim() : "tool";
			tools.delete(typeof value.toolCallId === "string" ? value.toolCallId : name);
			if (name === "ask") {
				clearTimeout(ask);
			}
			const current = [...tools.values()].at(-1);
			if (current) {
				write("tool", current);
			} else {
				rmSync(join(dir, "tool"), { force: true });
			}
		},
		toolResult(event: unknown): void {
			const value = fields(event);
			if (!dir || value.toolName !== "todo" || value.isError === true) {
				return;
			}
			const phases = fields(value.details).phases;
			if (!Array.isArray(phases)) {
				return;
			}
			todos = phases.flatMap((phase: unknown) => {
				const tasks = fields(phase).tasks;
				return Array.isArray(tasks)
					? tasks.filter(
							(task): task is Todo =>
								typeof fields(task).content === "string" && typeof fields(task).status === "string",
						)
					: [];
			});
			const open = todos.some((todo) => OPEN[todo.status] || todo.status === "blocked");
			if (open) {
				todosOpen = true;
			} else if (todosOpen && todos.some((todo) => todo.status === "completed")) {
				todosOpen = false;
				todosClosed = true;
			}
		},
		goalUpdated(event: unknown): void {
			if (!dir) {
				return;
			}
			const value = fields(fields(event).goal);
			if (typeof value.id !== "string" || typeof value.objective !== "string" || typeof value.status !== "string") {
				goal = undefined;
				return;
			}
			goal = { id: value.id, objective: value.objective, status: value.status };
			if (goal.status !== "complete") {
				return;
			}
			// The goal id names the claim, so a repeated complete update rings once.
			goalDone = true;
			signal("coordinator.goal-done", `goal complete: ${goal.objective}`, goal.id.replace(/[^A-Za-z0-9._-]/g, "_"));
		},
		messageEnd(stopReason: string | undefined, text = ""): void {
			turnOpen = true;
			if (!stopReason || stopReason === "toolUse") {
				return;
			}
			stop = stopReason;
			// The first text line, without Markdown markers, is the answer a coordinator leads with.
			const head = text
				.split("\n")
				.map((line) => line.replace(/^[\s#>*-]+/, "").trim())
				.find(Boolean);
			if (head) {
				said = head.slice(0, 200);
				ticket = FEATURE.exec(text)?.[0] ?? ticket;
			}
		},
		settled(): void {
			if (!dir || !session || !turnOpen) {
				return;
			}
			turnOpen = false;
			write("title", title());
			recordBorn();
			const turn = {
				todos,
				todosClosed,
				...(goal ? { goal } : {}),
				stop,
				ownedRunning: ownedRunning(root, session.sessionManager.getSessionId(), pane),
				said,
			};
			todosClosed = false;
			stop = "";
			said = "";
			if (goalDone) {
				goalDone = false;
				return;
			}
			const next = turnSignal(turn);
			if (next) {
				signal(next.kind, next.reason);
			}
		},
		shutdown(): void {
			clearTimeout(ask);
			write("shutdown", new Date().toISOString());
			dir = undefined;
			session = undefined;
		},
	};
}

/**
 * The sweep finds a coordinator process that died and removes its registration. A death without a normal exit first
 * queues one `coordinator.exited`. Its registration and session file are the only evidence.
 */
export async function sweepCoordinators(root: string): Promise<void> {
	const base = join(root, ".limen", "coordinators");
	for (const name of await readdir(base).catch(() => [] as string[])) {
		const dir = join(base, name);
		const pid = Number(await textFile(join(dir, "pid")));
		if (!Number.isSafeInteger(pid) || pid <= 0) {
			continue;
		}
		const outcome = await processInfo(pid);
		if (outcome.kind === "unavailable") {
			continue;
		}
		const born = await textFile(join(dir, "born"));
		if (outcome.kind === "present" && (!born || outcome.process.born === born)) {
			continue;
		}
		const exit = await sessionExit(
			await textFile(join(dir, "session-file")),
			Date.parse(await textFile(join(dir, "started-at"))),
		);
		// omp records how it exited; Pi and a history-free session leave only the hook's shutdown mark.
		if (exit?.kind === "normal" || (!exit && existsSync(join(dir, "shutdown")))) {
			await rm(dir, { recursive: true, force: true });
			continue;
		}
		const tool = await textFile(join(dir, "tool"));
		const event: PlantEvent = {
			kind: "coordinator.exited",
			status: "exited",
			title: (await textFile(join(dir, "title"))) || `coordinator ${name}`,
			id: name,
			reason: `pid ${pid} exited ${exit ? `(${exit.kind}: ${exit.reason})` : "without a session shutdown (killed or crashed)"}${tool ? ` while running ${tool}` : ""}`,
			branch: plantBranch(root),
			plant: basename(root),
			handoff: HANDOFF["coordinator.exited"],
		};
		// The claim names the pid: a resumed session in a new process can exit again.
		await deliverEventWebhook(
			join(root, ".limen", "coordinator-events", name, `coordinator.exited.${pid}`),
			finishWebhookEnv(root, root),
			event,
			join(root, ".limen"),
		);
		await rm(dir, { recursive: true, force: true });
	}
}

/** The newest omp `session_exit` record written after this registration started. Only the file's tail is read. */
async function sessionExit(
	file: string,
	since: number,
): Promise<{ readonly kind: string; readonly reason: string } | undefined> {
	if (!file) {
		return;
	}
	const handle = await open(file, "r").catch(() => undefined);
	if (!handle) {
		return;
	}
	try {
		const { size } = await handle.stat();
		const length = Math.min(size, 262_144);
		const buffer = Buffer.alloc(length);
		await handle.read(buffer, 0, length, size - length);
		let found: { readonly kind: string; readonly reason: string } | undefined;
		for (const line of buffer.toString("utf8").split("\n")) {
			if (!line.includes('"session_exit"')) {
				continue;
			}
			try {
				const entry = JSON.parse(line) as {
					customType?: unknown;
					data?: { kind?: unknown; reason?: unknown; recordedAt?: unknown };
				};
				const data = entry.data;
				if (
					entry.customType !== "session_exit" ||
					typeof data?.kind !== "string" ||
					typeof data.recordedAt !== "string"
				) {
					continue;
				}
				if (Number.isFinite(since) && Date.parse(data.recordedAt) < since) {
					continue;
				}
				found = { kind: data.kind, reason: typeof data.reason === "string" ? data.reason : "unknown" };
			} catch {
				// The first line of a tail window is usually cut; skip it.
			}
		}
		return found;
	} finally {
		await handle.close();
	}
}

function ownedRunning(root: string, session: string, pane: string): number {
	const jobs = join(root, ".limen", "jobs");
	let count = 0;
	for (const id of existsSync(jobs) ? readdirSync(jobs) : []) {
		if (readOptional(join(jobs, id, "state")) !== "running") {
			continue;
		}
		if (
			(pane && readOptional(join(jobs, id, "origin-pane")) === pane) ||
			existsSync(join(jobs, id, "notify", "subscribers", session))
		) {
			count += 1;
		}
	}
	return count;
}

function readOptional(path: string): string {
	try {
		return readFileSync(path, "utf8").trim();
	} catch {
		return "";
	}
}

/** Hook events arrive as engine-owned objects; a missing or foreign shape reads as empty. */
function fields(value: unknown): Record<string, unknown> {
	return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
