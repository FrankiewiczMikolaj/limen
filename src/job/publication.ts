import { execFileSync } from "node:child_process";
import { copyFile, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { basename, dirname } from "node:path";
import type { EngineId } from "../runtime/engine.ts";
import { groupLock } from "./group-cabinet.ts";
import { SESSION_ID } from "./job.ts";

/**
 * Prune and land remove a worktree only while they hold this lock, deciding from job records they read inside it.
 * Publication holds it too, so no job claims a worktree between that read and the removal.
 */
export function worktreeLock<T>(jobsRoot: string, operation: () => Promise<T>): Promise<T> {
	return groupLock(`${dirname(jobsRoot)}/prune`, operation, "wait");
}

/**
 * One line naming who ran this spawn or continue, from what the environment shows: a Limen job, else a Pi session or
 * Herdr pane (`coordinator` when LIMEN_COORDINATOR=1), then the user and the parent process. Unknown parts are left out.
 */
function spawnerLine(): string {
	const job = process.env.LIMEN_JOB_ID?.trim();
	if (job && SESSION_ID.test(job)) {
		return `job ${job}`;
	}
	const parts: string[] = process.env.LIMEN_COORDINATOR === "1" ? ["coordinator"] : [];
	const session = process.env.PI_SESSION_ID?.trim();
	if (session && SESSION_ID.test(session)) {
		parts.push(`pi session ${session}`);
	}
	const pane = process.env.HERDR_PANE_ID?.trim();
	if (process.env.HERDR_ENV === "1" && pane && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(pane)) {
		parts.push(`herdr pane ${pane}`);
	}
	const user = process.env.USER?.trim() || userInfo().username;
	if (user) {
		parts.push(`user ${user}`);
	}
	const command = parentCommand();
	if (command) {
		parts.push(`parent ${command} (pid ${process.ppid})`);
	}
	return parts.join(", ");
}

/** The parent's executable as `ps` shows it; empty when `ps` cannot say. */
function parentCommand(): string {
	try {
		const shown = execFileSync("ps", ["-o", "comm=", "-p", String(process.ppid)], { encoding: "utf8", timeout: 2000 });
		return shown.trim().split("\n", 1)[0]?.trim() ?? "";
	} catch {
		return "";
	}
}

function hostedNote(deadline: number | undefined): string {
	const limits = deadline
		? `Group deadline ${new Date(deadline).toISOString()}, no tool-call cap`
		: "No 90-minute timeout, no tool-call cap";
	return `Hosted job: weaker guarantees. ${limits}, no process-group containment (stop cannot kill child processes the agent started). Herdr owns the process tree. Closing the tab ends the worker.\n`;
}

type NewJob = {
	readonly task: string | Uint8Array;
	readonly label: string;
	readonly branch: string;
	readonly worktree: string;
	readonly base: string;
	readonly role: string;
	readonly engine: EngineId;
	/** The model the spawner asked for, compared with the served model in `limen jobs <id>`. */
	readonly model?: string;
	readonly extensions?: readonly string[];
	readonly planningSource: string;
	readonly repo?: string;
	readonly agentName?: string;
	readonly notificationSession?: string;
	readonly originTab?: string;
	readonly originPane?: string;
	readonly group?: { readonly id: string; readonly team: string; readonly deadline: number };
	/** The continued job: `limen continue` records it as `parent`. */
	readonly parent?: string;
	readonly continueTask?: string;
	readonly candidate?: string;
	readonly finishAuthor?: string;
	readonly finishConfig?: string;
	readonly session?: { readonly source: string; readonly name: string };
	/** Files a continuation carries from its parent's job folder, such as the task note. */
	readonly carried?: Readonly<Record<string, string>>;
};

/** Publish a complete starting record before creating or restoring its protected worktree. */
export async function publishJob(jobDir: string, job: NewJob): Promise<void> {
	const jobsRoot = dirname(jobDir);
	const publishing = `${dirname(jobsRoot)}/.publishing-${basename(jobDir)}`;
	await mkdir(jobsRoot, { recursive: true });
	await mkdir(publishing);
	try {
		const startedAt = `${new Date().toISOString()}\n`;
		const files: Record<string, string | Uint8Array> = {
			"started-at": startedAt,
			"task.md": job.task,
			label: `${job.label}\n`,
			branch: `${job.branch}\n`,
			worktree: `${job.worktree}\n`,
			base: `${job.base}\n`,
			role: `${job.role}\n`,
			engine: `${job.engine}\n`,
			"extensions.json": `${JSON.stringify(job.extensions ?? [])}\n`,
			"planning-source": `${job.planningSource}\n`,
			"tool-calls": "0\n",
			"last-tool": "",
			activity: "think\n",
			log: "",
			// The spawning process. Until spawn writes `state`, a live spawner means the job is starting, not orphaned.
			starting: `${process.pid}\n`,
			...job.carried,
		};
		if (job.model) {
			files.model = `${job.model}\n`;
		}
		if (job.repo) {
			files.repo = `${job.repo}\n`;
		}
		if (job.agentName) {
			files.hosted = hostedNote(job.group?.deadline);
			files["agent-name"] = `${job.agentName}\n`;
		}
		if (job.notificationSession) {
			files["origin-session"] = `${job.notificationSession}\n`;
			files[`notify/subscribers/${job.notificationSession}`] = startedAt;
		}
		if (job.originTab) {
			files["origin-tab"] = `${job.originTab}\n`;
		}
		if (job.originPane) {
			files["origin-pane"] = `${job.originPane}\n`;
		}
		if (job.group) {
			files.group = `${job.group.id}\n`;
			files.team = `${job.group.team}\n`;
			files.deadline = `${job.group.deadline}\n`;
		}
		if (job.parent) {
			files.parent = `${job.parent}\n`;
		}
		// Hosted and detached jobs export their id to the agent, so a spawn or continue run by a job's agent names it.
		// The picture nests a coordinator's workers under it by this link.
		const spawner = process.env.LIMEN_JOB_ID?.trim();
		if (spawner && SESSION_ID.test(spawner)) {
			files["spawned-by"] = `${spawner}\n`;
		}
		const spawnedBy = spawnerLine();
		if (spawnedBy) {
			files.spawner = `${spawnedBy}\n`;
		}
		if (job.continueTask) {
			files.continue = `${job.continueTask}\n`;
		}
		if (job.candidate) {
			files.candidate = `${job.candidate}\n`;
		}
		if (job.finishAuthor) {
			files["finish-webhook-author"] = `${job.finishAuthor}\n`;
		}
		await mkdir(`${publishing}/notify/subscribers`, { recursive: true });
		// Sequential writes settle before cleanup on failure; no write can outlive the hidden directory.
		for (const [name, body] of Object.entries(files)) {
			await writeFile(`${publishing}/${name}`, body, { flag: "wx", flush: true });
		}
		if (job.finishConfig) {
			await writeFile(`${publishing}/finish-webhook-env`, `${job.finishConfig}\n`, {
				flag: "wx",
				mode: 0o600,
				flush: true,
			});
		}
		if (job.session) {
			await mkdir(`${publishing}/session`);
			await copyFile(job.session.source, `${publishing}/session/${job.session.name}`);
		}
		await writeFile(`${publishing}/notify/ready`, "1\n", { flag: "wx", flush: true });
		await worktreeLock(jobsRoot, () => rename(publishing, jobDir));
	} catch (error) {
		await rm(publishing, { recursive: true, force: true });
		throw error;
	}
}
