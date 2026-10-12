import { readdir } from "node:fs/promises";
import { hostedAgentAlive } from "../integrations/herdr.ts";
import { finalizeJob, textFile } from "../job/record.ts";
import { type ProcessQueryOutcome, processAlive, processGroupAlive, processInfo } from "./contain.ts";
import { claimRecovery, recoverHostedOwner, recoveryTarget } from "./recovery.ts";
import { writeHostedResult } from "./supervisor.ts";

export const STARTUP_GRACE_MS = 10 * 60_000;
export async function liveJob(jobDir: string, now = Date.now()): Promise<boolean> {
	if ((await textFile(`${jobDir}/state`)) !== "running") {
		return false;
	}
	const pid = Number(await textFile(`${jobDir}/pid`));
	const recorded = Number.isSafeInteger(pid) && pid > 0 ? pid : undefined;
	if (
		recorded !== undefined &&
		processGroupAlive(recorded) &&
		(await sameBirth(recorded, await textFile(`${jobDir}/born`), now))
	) {
		return true;
	}
	const agent = await textFile(`${jobDir}/herdr/agent`);
	if ((await textFile(`${jobDir}/hosted`)) && agent && hostedAgentAlive(agent)) {
		return true;
	}
	if (recorded !== undefined) {
		return false;
	}
	const startedAt = Date.parse(await textFile(`${jobDir}/started-at`));
	return Number.isFinite(startedAt) && now - startedAt < STARTUP_GRACE_MS;
}
/** A job its spawner is still setting up: no state yet, and the spawning process recorded in `starting` is alive. */
export async function startingJob(jobDir: string): Promise<boolean> {
	if (await textFile(`${jobDir}/state`)) {
		return false;
	}
	const pid = Number(await textFile(`${jobDir}/starting`));
	return Number.isSafeInteger(pid) && pid > 0 && processAlive(pid);
}
export async function ownerAlive(jobDir: string, now = Date.now(), query = processInfo): Promise<boolean> {
	const pid = Number(await textFile(`${jobDir}/pid`));
	if (!Number.isSafeInteger(pid) || pid <= 0 || !processAlive(pid)) {
		return false;
	}
	return sameBirth(pid, await textFile(`${jobDir}/born`), now, query);
}
// On macOS a start-time check starts a Ruby helper, and every coordinator sweep asks about every running job.
// Linux reads /proc and checks every time.
const BIRTH_RECHECK_MS = process.platform === "linux" ? 0 : 30_000;
const DEAD = -1;
/** `pid born` → when a check last matched, or DEAD: that process is gone for good, since a pid and start time never return. */
const births = new Map<string, number>();
/** The live pid is still the recorded process. A match is trusted for a while; it can only delay a reap, never cause one. */
async function sameBirth(
	pid: number,
	born: string,
	now: number,
	query: (pid: number) => Promise<ProcessQueryOutcome> = processInfo,
): Promise<boolean> {
	if (!born) {
		return true;
	}
	const key = `${pid} ${born}`;
	const matched = births.get(key);
	if (matched === DEAD) {
		return false;
	}
	if (matched !== undefined && now - matched < BIRTH_RECHECK_MS) {
		return true;
	}
	const outcome = await query(pid);
	if (outcome.kind === "unavailable") {
		return true;
	}
	const alive = outcome.kind === "present" && outcome.process.born === born;
	births.set(key, alive ? now : DEAD);
	return alive;
}
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: split pending: dead job reaping
export async function reapDeadJobs(
	jobsRoot: string,
	seen: Map<string, number>,
	now = Date.now(),
	ids?: readonly string[],
): Promise<void> {
	const candidates = ids ?? (await readdir(jobsRoot).catch(() => [] as string[]));
	if (ids) {
		const live = new Set(ids);
		for (const id of seen.keys()) {
			if (!live.has(id)) {
				seen.delete(id);
			}
		}
	}
	for (const id of candidates) {
		const jobDir = `${jobsRoot}/${id}`;
		if ((await textFile(`${jobDir}/state`)) !== "running") {
			seen.delete(id);
			continue;
		}
		const startedAt = Date.parse(await textFile(`${jobDir}/started-at`));
		const pid = Number(await textFile(`${jobDir}/pid`));
		const validPid = Number.isSafeInteger(pid) && pid > 0;
		if (
			(await ownerAlive(jobDir, now)) ||
			(!validPid && Number.isFinite(startedAt) && now - startedAt < STARTUP_GRACE_MS)
		) {
			seen.delete(id);
			continue;
		}
		const first = seen.get(id);
		if (first === undefined) {
			seen.set(id, now);
			continue;
		}
		if (now - first < reapConfirmMs()) {
			continue;
		}
		if (await textFile(`${jobDir}/hosted`)) {
			const target = await recoveryTarget(jobDir);
			if (target === "unknown") {
				continue;
			}
			if (target !== "missing") {
				await recoverHostedOwner(jobDir);
				if (await ownerAlive(jobDir, now)) {
					seen.delete(id);
				}
				continue;
			}
		}
		const release = await claimRecovery(jobDir);
		if (!release) {
			continue;
		}
		try {
			if ((await textFile(`${jobDir}/state`)) !== "running" || (await ownerAlive(jobDir, now))) {
				continue;
			}
			const hosted = await textFile(`${jobDir}/hosted`);
			if (hosted && (await recoveryTarget(jobDir)) !== "missing") {
				continue;
			}
			if (hosted) {
				await writeHostedResult(jobDir);
			}
			await finalizeJob(jobDir, "failed", hosted ? "hosted supervisor lost" : "process group gone");
			seen.delete(id);
		} finally {
			await release();
		}
	}
}
export async function confirmDeadJobs(jobsRoot: string): Promise<void> {
	const seen = new Map<string, number>();
	await reapDeadJobs(jobsRoot, seen);
	if (seen.size === 0) {
		return;
	}
	await delay(reapConfirmMs());
	await reapDeadJobs(jobsRoot, seen);
}
function reapConfirmMs(): number {
	const raw = Number(process.env.LIMEN_REAP_CONFIRM_MS);
	return Number.isFinite(raw) && raw > 0 ? raw : 10_000;
}
const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
