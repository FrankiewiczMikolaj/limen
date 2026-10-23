import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { cpus } from "node:os";
import { basename, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { groupLock } from "../job/group-cabinet.ts";
import { formatDuration, parseDuration } from "../job/job.ts";
import { appendLimenLog, atomicWrite, textFile } from "../job/record.ts";
import { readOptional } from "../project/inherit.ts";
import { seatDir } from "../project/seat.ts";
import { activeRules, localTime, type SeatRule } from "../project/seat-rules.ts";
import { processAlive } from "./contain.ts";

// The machine is shared by every plant, so one queue and one gate serve the whole seat. A detached job's own wrapper
// waits in it after its handshake and before setup; no daemon runs it. Adam's decision 85 (a) set 25% and 20%.
// A seat rule with a start priority (the priority budget, Adam's decision 99) holds every less urgent job, gate or not.
export type StartGate = { readonly cpuIdle: number; readonly memoryFree: number; readonly settleMs: number };
/** Percentages; a value the machine could not report is undefined and does not hold a job back. */
export type Reading = { readonly cpuIdle: number | undefined; readonly memoryFree: number | undefined };
type Entry = {
	readonly id: string;
	readonly jobDir: string;
	readonly label: string;
	readonly priority: number;
	readonly queuedAt: number;
	readonly pid: number;
};
/** The job's `queued` file: present from the wrapper's first moment until the job leaves the queue. */
type Queued = { readonly since: string; readonly detail?: string; readonly ahead?: number };
type Decision =
	| { readonly start: true; readonly detail: string }
	| { readonly start: false; readonly kind: string; readonly detail: string; readonly ahead: number };

export const GATE_FILE = "start-gate.json";
export const PRIORITIES = [1, 2, 3] as const;
export const DEFAULT_PRIORITY = 2;
const DEFAULT_GATE: StartGate = { cpuIdle: 25, memoryFree: 20, settleMs: 60_000 };
const SAMPLE_MS = 2_000;
const DETAIL_REFRESH_MS = 60_000;
const queueDir = () => join(seatDir(), "start-queue");
const entryPath = (id: string) => join(queueDir(), "entries", `${id}.json`);
const pollMs = (): number =>
	Number(process.env.LIMEN_START_POLL_MS) > 0 ? Number(process.env.LIMEN_START_POLL_MS) : 5_000;

/**
 * The gate: `LIMEN_START_GATE` (`off`, or JSON shaped like the file) wins over `<seat>/start-gate.json`, which wins
 * over the defaults. Undefined when the gate is off. `ignored` names each value Limen did not use.
 */
export function startGate(): { readonly gate: StartGate | undefined; readonly ignored: readonly string[] } {
	const override = process.env.LIMEN_START_GATE?.trim();
	if (override === "off") {
		return { gate: undefined, ignored: [] };
	}
	const source = override || readOptional(join(seatDir(), GATE_FILE));
	if (!source) {
		return { gate: DEFAULT_GATE, ignored: [] };
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(source);
	} catch {
		return { gate: DEFAULT_GATE, ignored: ["the gate is not JSON"] };
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		return { gate: DEFAULT_GATE, ignored: ["the gate is not a JSON object"] };
	}
	const gate = { ...DEFAULT_GATE };
	const ignored: string[] = [];
	for (const [key, value] of Object.entries(parsed)) {
		const settle = key === "settle" ? settleMs(value) : undefined;
		if ((key === "cpuIdle" || key === "memoryFree") && typeof value === "number" && value >= 0 && value <= 100) {
			gate[key] = value;
		} else if (settle !== undefined) {
			gate.settleMs = settle;
		} else {
			ignored.push(`${key} ${JSON.stringify(value)}`);
		}
	}
	if (ignored.length > 0) {
		ignored.push("use cpuIdle and memoryFree from 0 to 100, and settle such as 60s");
	}
	return { gate, ignored };
}
function settleMs(value: unknown): number | undefined {
	try {
		return parseDuration(String(value));
	} catch {
		return undefined;
	}
}

/** CPU idle across all cores over about two seconds, and free memory. `LIMEN_START_READING` names a file that holds
 * both instead; tests and manual checks set the reading there, so the machine's load never decides them. */
export async function readLoad(signal?: AbortSignal): Promise<Reading> {
	const fixed = process.env.LIMEN_START_READING?.trim();
	if (fixed) {
		const recorded: Partial<Record<keyof Reading, unknown>> = await readFile(fixed, "utf8").then(
			(body) => JSON.parse(body),
			() => ({}),
		);
		return { cpuIdle: percent(recorded.cpuIdle), memoryFree: percent(recorded.memoryFree) };
	}
	const before = cpus();
	await delay(SAMPLE_MS, undefined, signal ? { signal } : {});
	const after = cpus();
	let idle = 0;
	let total = 0;
	after.forEach((core, index) => {
		const earlier = before[index]?.times;
		if (!earlier) {
			return;
		}
		idle += core.times.idle - earlier.idle;
		total += Object.values(core.times).reduce((sum, value) => sum + value, 0);
		total -= Object.values(earlier).reduce((sum, value) => sum + value, 0);
	});
	return { cpuIdle: total > 0 ? (100 * idle) / total : undefined, memoryFree: await memoryFree() };
}
/** macOS: the `memory_pressure` free percentage, as the Alice board rule read it. Linux: MemAvailable over MemTotal. */
async function memoryFree(): Promise<number | undefined> {
	if (process.platform === "linux") {
		const info = readOptional("/proc/meminfo") ?? "";
		const kib = (name: string) => Number(new RegExp(`^${name}:\\s+(\\d+)`, "m").exec(info)?.[1]);
		return percent((100 * kib("MemAvailable")) / kib("MemTotal"));
	}
	const said = await new Promise<string>((resolve) =>
		execFile("/usr/bin/memory_pressure", { encoding: "utf8", timeout: 5_000 }, (_error, stdout) => resolve(stdout)),
	);
	return percent(Number(/memory free percentage:\s*(\d+)%/i.exec(said)?.[1]));
}
function percent(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : undefined;
}
export function readingText(reading: Reading | undefined, gate: StartGate): string {
	if (!reading) {
		return "no reading yet";
	}
	const shown = (value: number | undefined) => (value === undefined ? "unknown" : `${Math.round(value)}%`);
	const cpu = `CPU ${shown(reading.cpuIdle)} idle (gate ${gate.cpuIdle}%)`;
	return `${cpu}, memory ${shown(reading.memoryFree)} free (gate ${gate.memoryFree}%)`;
}
function gateOpen(reading: Reading, gate: StartGate): boolean {
	return (reading.cpuIdle ?? 100) >= gate.cpuIdle && (reading.memoryFree ?? 100) >= gate.memoryFree;
}

/** The active rules that hold a job of this priority: each one whose start priority is more urgent. */
function holdingRules(priority: number): readonly SeatRule[] {
	return activeRules().filter((rule) => rule.startPriority !== undefined && priority > rule.startPriority);
}
const heldText = (rules: readonly SeatRule[]): string =>
	rules
		.map((rule) => `held by rule ${rule.name} until ${localTime(rule.until)} (start priority ${rule.startPriority})`)
		.join("; ");

/**
 * Marks a job queued before its handshake, so no reader sees it running as started; logs gate values it ignored. A job
 * queues while the gate is on or a rule holds its priority.
 */
export async function enterStartQueue(jobDir: string): Promise<boolean> {
	const { gate, ignored } = startGate();
	if (ignored.length > 0) {
		await appendLimenLog(jobDir, `start gate: ignored ${ignored.join("; ")}`);
	}
	const queued = gate !== undefined || holdingRules(await jobPriority(jobDir)).length > 0;
	if (queued) {
		await atomicWrite(`${jobDir}/queued`, `${JSON.stringify({ since: new Date().toISOString() })}\n`);
	}
	return queued;
}

/**
 * Holds the job in the seat queue until no rule holds its priority, it is first in priority, then queue-time order, the
 * settle interval since the last start has passed, and its reading passes the gate. Only the first job samples the
 * load. The gate and the rules are read again on each poll, so an edit or a rule's end reaches waiting jobs. Returns
 * false when the job was stopped while it waited. A job that waited leaves `start-notice` for its coordinator.
 */
export async function waitForStart(jobDir: string, stop: AbortSignal): Promise<boolean> {
	const id = basename(jobDir);
	const since = readQueued(jobDir)?.since ?? new Date().toISOString();
	const entry: Entry = {
		id,
		jobDir,
		label: (await textFile(`${jobDir}/label`)) || id,
		priority: await jobPriority(jobDir),
		queuedAt: Date.parse(since) || Date.now(),
		pid: process.pid,
	};
	let shown: { kind: string; ahead: number; at: number } | undefined;
	try {
		while (!stop.aborted) {
			await enqueue(entry);
			const decision = await decide(entry, startGate().gate, stop).catch((error: unknown) => {
				if (stop.aborted) {
					return undefined;
				}
				throw error;
			});
			if (!decision) {
				return false;
			}
			if (decision.start) {
				await started(jobDir, entry, decision.detail, shown !== undefined);
				return true;
			}
			if (
				!shown ||
				shown.kind !== decision.kind ||
				shown.ahead !== decision.ahead ||
				Date.now() - shown.at >= DETAIL_REFRESH_MS
			) {
				const queued: Queued = { since, detail: decision.detail, ahead: decision.ahead };
				await atomicWrite(`${jobDir}/queued`, `${JSON.stringify(queued)}\n`);
				if (!shown || (decision.kind !== shown.kind && decision.kind.startsWith("rules"))) {
					await appendLimenLog(jobDir, `queued: ${decision.detail}, ${decision.ahead} ahead`);
				}
				shown = { kind: decision.kind, ahead: decision.ahead, at: Date.now() };
			}
			await delay(pollMs(), undefined, { signal: stop }).catch(() => {});
		}
		return false;
	} finally {
		await rm(entryPath(id), { force: true });
		await rm(`${jobDir}/queued`, { force: true });
	}
}
/** Writes the job's entry, and writes it again if a reader removed it, so a live wrapper always holds its place. */
async function enqueue(entry: Entry): Promise<void> {
	if (!existsSync(entryPath(entry.id))) {
		await mkdir(join(queueDir(), "entries"), { recursive: true });
		await atomicWrite(entryPath(entry.id), `${JSON.stringify(entry)}\n`);
	}
}
async function decide(entry: Entry, gate: StartGate | undefined, stop: AbortSignal): Promise<Decision> {
	const ahead = (await liveEntries()).filter((other) => other.id !== entry.id && order(other, entry) < 0).length;
	// A held job sorts after every job it could start, so it never blocks the head. A rule change is a new hold.
	const holding = holdingRules(entry.priority);
	if (holding.length > 0) {
		const kind = `rules ${holding.map((rule) => rule.version).join(" ")}`;
		return { start: false, kind, detail: heldText(holding), ahead };
	}
	if (!gate) {
		return { start: true, detail: "the gate is off" };
	}
	if (ahead > 0) {
		return { start: false, kind: "ahead", detail: readingText(lastReading(), gate), ahead };
	}
	const reading = await readLoad(stop);
	await mkdir(queueDir(), { recursive: true });
	await atomicWrite(join(queueDir(), "reading"), `${JSON.stringify(reading)}\n`);
	const detail = readingText(reading, gate);
	if (!gateOpen(reading, gate)) {
		return { start: false, kind: "gate", detail, ahead: 0 };
	}
	const settling = await settleLeft(gate);
	if (settling > 0) {
		return {
			start: false,
			kind: "settle",
			detail: `${detail}; settling ${formatDuration(settling)} after the last start`,
			ahead: 0,
		};
	}
	// Under the lock the head is checked again, so two jobs that sampled at once never both start inside one settle.
	const claimed = await groupLock(
		queueDir(),
		async () => {
			if ((await liveEntries())[0]?.id !== entry.id || (await settleLeft(gate)) > 0) {
				return false;
			}
			await atomicWrite(join(queueDir(), "last-start"), `${new Date().toISOString()}\n`);
			await rm(entryPath(entry.id), { force: true });
			return true;
		},
		"wait",
	);
	return claimed ? { start: true, detail } : { start: false, kind: "raced", detail, ahead: 0 };
}
async function started(jobDir: string, entry: Entry, detail: string, waited: boolean): Promise<void> {
	if (!waited) {
		await appendLimenLog(jobDir, `start gate: open; ${detail}`);
		return;
	}
	const wait = formatDuration(Date.now() - entry.queuedAt);
	const job = `Limen job ${JSON.stringify(entry.label)} (${entry.id})`;
	await atomicWrite(
		`${jobDir}/start-notice`,
		`${job} started after ${wait} in the start queue: ${detail}.\nNo action is needed; its finish wakes you as usual.\n`,
	);
	await appendLimenLog(jobDir, `start queue: started after ${wait}; ${detail}`);
}
async function settleLeft(gate: StartGate): Promise<number> {
	const last = Date.parse(await textFile(join(queueDir(), "last-start")));
	return Number.isFinite(last) ? Math.max(0, last + gate.settleMs - Date.now()) : 0;
}
function lastReading(): Reading | undefined {
	try {
		const recorded = JSON.parse(readFileSync(join(queueDir(), "reading"), "utf8")) as Record<string, unknown>;
		return { cpuIdle: percent(recorded.cpuIdle), memoryFree: percent(recorded.memoryFree) };
	} catch {
		return undefined;
	}
}
const order = (a: Entry, b: Entry): number =>
	a.priority - b.priority || a.queuedAt - b.queuedAt || a.id.localeCompare(b.id);

/** The queue in start order. An entry whose job ended or whose wrapper is gone is removed, so it never blocks. */
async function liveEntries(): Promise<Entry[]> {
	const folder = join(queueDir(), "entries");
	const entries: Entry[] = [];
	for (const name of await readdir(folder).catch(() => [] as string[])) {
		if (!name.endsWith(".json")) {
			continue;
		}
		const body = await readFile(join(folder, name), "utf8").catch(() => undefined);
		if (body === undefined) {
			continue;
		}
		const entry = parseEntry(body);
		// A recycled pid can keep a dead entry until the reaper ends its job; the state check then removes it.
		if (entry && processAlive(entry.pid) && (await textFile(`${entry.jobDir}/state`)) === "running") {
			entries.push(entry);
		} else {
			await rm(join(folder, name), { force: true });
		}
	}
	return entries.sort(order);
}
function parseEntry(body: string): Entry | undefined {
	try {
		const value = JSON.parse(body) as Partial<Entry>;
		const { id, jobDir, label, priority, queuedAt, pid } = value;
		if (
			typeof id === "string" &&
			typeof jobDir === "string" &&
			typeof label === "string" &&
			typeof priority === "number" &&
			typeof queuedAt === "number" &&
			typeof pid === "number" &&
			pid > 0
		) {
			return { id, jobDir, label, priority, queuedAt, pid };
		}
	} catch {
		// A malformed entry is removed like a dead one.
	}
	return undefined;
}

export async function jobPriority(jobDir: string): Promise<number> {
	const value = Number(await textFile(`${jobDir}/priority`));
	return PRIORITIES.find((priority) => priority === value) ?? DEFAULT_PRIORITY;
}
export function parsePriority(value: string | undefined): number | undefined {
	if (value === undefined) {
		return undefined;
	}
	const priority = PRIORITIES.find((candidate) => String(candidate) === value.trim());
	if (!priority) {
		throw new Error("--priority must be 1, 2 or 3; 1 is the most urgent");
	}
	return priority;
}

/** What the job's `queued` file says, or undefined when the job is not in the start queue. */
export function readQueued(jobDir: string): Queued | undefined {
	const body = readOptional(`${jobDir}/queued`);
	if (body === undefined) {
		return undefined;
	}
	try {
		const value = JSON.parse(body) as Partial<Queued>;
		return typeof value.since === "string" ? (value as Queued) : { since: "" };
	} catch {
		return { since: "" };
	}
}
/** The wait and the reason a queued job shows in `limen jobs`. */
export function queuedText(queued: Queued): string {
	const since = Date.parse(queued.since);
	const wait = Number.isFinite(since) ? ` ${formatDuration(Date.now() - since)}` : "";
	return queued.detail ? `waiting${wait}: ${queued.detail}, ${queued.ahead ?? 0} ahead` : `waiting${wait}: deciding`;
}

/**
 * Spawn and continue call this after the handshake. It waits, at most a few seconds, for the wrapper's first decision.
 * The result is the `queued` line to print, or undefined once the job left the queue.
 */
export async function queuedLine(jobDir: string, label: string): Promise<string | undefined> {
	const deadline = Date.now() + 10_000;
	for (;;) {
		const queued = readQueued(jobDir);
		if (!queued) {
			return undefined;
		}
		if (queued.detail) {
			return `queued ${label}: ${queued.detail}, ${queued.ahead ?? 0} ahead`;
		}
		if (Date.now() >= deadline || (await textFile(`${jobDir}/state`)) !== "running") {
			return `queued ${label}`;
		}
		await delay(20);
	}
}

/** `limen queue`: the gate, the current reading, and every waiting job in start order with the rules that hold it. */
export async function queueReport(): Promise<string> {
	const { gate, ignored } = startGate();
	const lines: string[] = [];
	if (ignored.length > 0) {
		lines.push(`start gate: ignored ${ignored.join("; ")}`);
	}
	if (gate) {
		const reading = await readLoad();
		const settling = await settleLeft(gate);
		const state = !gateOpen(reading, gate) ? "closed" : settling > 0 ? `settling ${formatDuration(settling)}` : "open";
		lines.push(`start gate ${state}: ${readingText(reading, gate)}; settle ${formatDuration(gate.settleMs)}`);
	} else {
		lines.push("start gate off (LIMEN_START_GATE=off): detached jobs start at once unless a rule holds them");
	}
	const entries = await liveEntries();
	if (entries.length === 0) {
		lines.push("queue empty");
	}
	entries.forEach((entry, index) => {
		const wait = formatDuration(Date.now() - entry.queuedAt);
		const holding = holdingRules(entry.priority);
		lines.push(`${index + 1}. ${entry.id} · priority ${entry.priority} · waiting ${wait} · ${entry.label}`);
		lines.push(...(holding.length > 0 ? [`   ${heldText(holding)}`] : []), `   ${entry.jobDir}`);
	});
	return lines.join("\n");
}
