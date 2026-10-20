import { execFile, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";
import { appendLimenLog, atomicWrite, finalizeJob, textFile, writeHandshake } from "../job/record.ts";
import { ENGINES, engineBinary } from "./engine.ts";

// A Devin job's agent is a Devin cloud session. The job branch goes up to origin, the session commits and pushes there,
// and its commits come back into the worktree as a fast-forward. The API key rides only in the Authorization header.
const POLL_MS = 30_000;
const REQUEST_MS = 20_000;
// `limen stop` sends KILL five seconds after TERM; the session must be ended before then.
const TERMINATE_MS = 4_000;
const PLATFORMS = ["macos", "linux"];

export type DevinJob = {
	readonly jobDir: string;
	readonly worktree: string;
	readonly taskFile: string;
	readonly preamble: string;
	readonly jobId: string;
	readonly label: string;
	/** `--provider`, the Devin platform; "" leaves it to the organization. */
	readonly platform: string;
	/** `--model`, the Devin mode; "" leaves it to the organization. */
	readonly mode: string;
	readonly timeoutMs: number;
	/** Aborted by TERM: `limen stop`, or a reaper. */
	readonly stop: AbortSignal;
};
type DevinAccess = { readonly key: string; readonly org: string; readonly api: string };
/** Status 0 means no HTTP reply: the network failed or the request was aborted. */
type DevinReply = { readonly status: number; readonly body: unknown };

/** Spawn's check for `--engine devin` before any job record: detached, outside a group, a known platform, a login. */
export function preflightDevin(
	options: { readonly tab: boolean; readonly thinking?: string; readonly provider?: string },
	grouped: boolean,
): void {
	if (options.tab) {
		throw new Error("--engine devin runs detached only; omit --tab");
	}
	if (grouped) {
		throw new Error("--engine devin cannot join a group; spawn it outside the group");
	}
	if (options.thinking) {
		throw new Error("--engine devin has no thinking level; omit --thinking (--model names the Devin mode)");
	}
	if (options.provider && !PLATFORMS.includes(options.provider)) {
		throw new Error(`--provider for --engine devin names the platform: ${PLATFORMS.join(" or ")}`);
	}
	const limit = process.env.LIMEN_DEVIN_ACU_LIMIT?.trim();
	if (limit && !/^[1-9]\d*$/.test(limit)) {
		throw new Error("LIMEN_DEVIN_ACU_LIMIT must be a whole number of ACUs");
	}
	devinAccess();
}

/** `DEVIN_API_KEY` and `DEVIN_ORG_ID` when set, else the Devin CLI login; `DEVIN_API_URL` overrides the host. */
function devinAccess(): DevinAccess {
	const credentials = `${homedir()}/.local/share/devin/credentials.toml`;
	const key =
		process.env.DEVIN_API_KEY?.trim() ||
		(existsSync(credentials) ? /^windsurf_api_key\s*=\s*"([^"]+)"/m.exec(readFileSync(credentials, "utf8"))?.[1] : "");
	if (!key) {
		throw new Error("no Devin API key: set DEVIN_API_KEY, or sign in with `devin auth login`");
	}
	let org = process.env.DEVIN_ORG_ID?.trim();
	if (!org) {
		const whoami = spawnSync(engineBinary(ENGINES.devin), ["cloud", "drs", "whoami"], {
			encoding: "utf8",
			timeout: 10_000,
		});
		org = /"org_id"\s*:\s*"([^"]+)"/.exec(whoami.stdout ?? "")?.[1];
	}
	if (!org) {
		throw new Error("no Devin org id: set DEVIN_ORG_ID, or sign in with `devin auth login`");
	}
	return { key, org, api: (process.env.DEVIN_API_URL?.trim() || "https://api.devin.ai").replace(/\/+$/, "") };
}

/** Runs the job as one Devin session. A failure throws; the wrapper records its message as the job's failure. */
export async function runDevinJob(job: DevinJob): Promise<void> {
	const { jobDir, worktree } = job;
	await writeHandshake(jobDir);
	await appendLimenLog(jobDir, "worker started");
	const ended = AbortSignal.any([job.stop, AbortSignal.timeout(job.timeoutMs)]);
	const access = devinAccess();
	const branch = await textFile(`${jobDir}/branch`);
	await git(worktree, ["push", "origin", branch]);
	const repo = originRepository(await git(worktree, ["remote", "get-url", "origin"]));
	const session = await startSession(job, access, branch, repo);
	const last = await followSession(jobDir, access, session, ended);
	if (last === undefined) {
		await endSession(jobDir, access, session);
		await (job.stop.aborted
			? finalizeJob(jobDir, "stopped", `stop ended devin session ${session}`)
			: finalizeJob(jobDir, "failed", `timeout after ${job.timeoutMs}ms ended devin session ${session}`));
		return;
	}
	if (last) {
		await atomicWrite(`${jobDir}/result`, `${last}\n`);
	}
	await git(worktree, ["fetch", "origin", branch]);
	await git(
		worktree,
		["merge", "--ff-only", "FETCH_HEAD"],
		`devin session ${session} left ${branch} where it does not fast-forward the worktree, which stays unchanged`,
	);
	await finalizeJob(jobDir, "done", `devin session ${session} finished`);
}

async function startSession(job: DevinJob, access: DevinAccess, branch: string, repo: string): Promise<string> {
	const task = await readFile(job.taskFile, "utf8");
	const limit = Number(process.env.LIMEN_DEVIN_ACU_LIMIT?.trim());
	const reply = await devinRequest(access, "POST", "/sessions", AbortSignal.timeout(REQUEST_MS), {
		prompt: `${job.preamble.trim()}\n\n${task.trim()}\n\n${contract(branch)}\n`,
		repos: [repo],
		title: job.label,
		tags: ["limen", job.jobId],
		...(job.platform ? { platform: job.platform } : {}),
		...(job.mode ? { devin_mode: job.mode } : {}),
		...(limit > 0 ? { max_acu_limit: limit } : {}),
	});
	const session = field(reply.body, "session_id");
	if (!ok(reply) || !session) {
		throw new Error(`devin session not created: ${problem(reply)}`);
	}
	const url = field(reply.body, "url");
	await atomicWrite(`${job.jobDir}/devin-session`, `${session}\n`);
	await atomicWrite(`${job.jobDir}/devin-url`, `${url}\n`);
	await appendLimenLog(job.jobDir, `devin session ${session} ${url}`);
	return session;
}

/** The fixed end of every prompt: where the session starts, where it commits and pushes, and how its turn ends. */
function contract(branch: string): string {
	return `## Limen job contract

You run as a Limen job. Its branch \`${branch}\` is pushed to origin; the job takes your commits from there.

1. Start from that branch: \`git fetch origin ${branch} && git checkout ${branch}\`.
2. Commit your work on that branch.
3. Push with \`git push origin ${branch}\` only. Never force-push, never push another branch, never open a pull request.
4. Then reply with your handoff (what changed, the checks you ran with their real output, what is left) and stop.

Limen commands, \`finish\` and steering are not available here: your last reply is the handoff.`;
}

/** Polls until the session's turn ends and returns Devin's last message; undefined when stop or timeout ends the wait. */
async function followSession(
	jobDir: string,
	access: DevinAccess,
	session: string,
	ended: AbortSignal,
): Promise<string | undefined> {
	const seen = new Set<string>();
	const pollMs = Number(process.env.LIMEN_DEVIN_POLL_MS) || POLL_MS;
	let last = "";
	let noted = "";
	while (!ended.aborted) {
		const signal = AbortSignal.any([ended, AbortSignal.timeout(REQUEST_MS)]);
		const reply = await devinRequest(access, "GET", `/sessions/${session}`, signal);
		const said = await newMessages(access, session, seen, signal);
		for (const text of said) {
			await appendFile(`${jobDir}/log`, `${text}\n`);
		}
		last = said.at(-1) ?? last;
		const status = field(reply.body, "status");
		const detail = field(reply.body, "status_detail");
		const state = ok(reply) ? `devin ${status}${detail ? ` (${detail})` : ""}` : `devin poll failed: ${problem(reply)}`;
		if (state !== noted && !ended.aborted) {
			noted = state;
			await appendLimenLog(jobDir, state);
		}
		// No reply, a rate limit or a server error may pass; any other refusal will not.
		if (!(ok(reply) || ended.aborted || reply.status === 0 || reply.status === 429 || reply.status >= 500)) {
			throw new Error(`devin session ${session} poll refused: ${problem(reply)}`);
		}
		const verdict = ok(reply) ? turnEnd(status, detail) : "";
		if (verdict === "finished") {
			return last;
		}
		if (verdict) {
			throw new Error(`devin session ${session} ${verdict}`);
		}
		await sleep(pollMs, undefined, { signal: ended }).catch(() => {});
	}
	return undefined;
}

/** "finished" when the session's turn ended, "" while it works, otherwise why the job fails. */
function turnEnd(status: string, detail: string): string {
	if (status === "running" && (detail === "finished" || detail === "waiting_for_user")) {
		return "finished";
	}
	if (status === "suspended" || status === "error") {
		return `${status}: ${detail || "no detail"}`;
	}
	if (status === "exit") {
		return `exited before it finished${detail ? `: ${detail}` : ""}`;
	}
	return "";
}

/** Devin's messages not seen before, oldest first. User messages, the prompt among them, stay out of the log. */
async function newMessages(
	access: DevinAccess,
	session: string,
	seen: Set<string>,
	signal: AbortSignal,
): Promise<string[]> {
	const fresh: string[] = [];
	let after = "";
	do {
		const cursor = after ? `&after=${encodeURIComponent(after)}` : "";
		const reply = await devinRequest(access, "GET", `/sessions/${session}/messages?first=200${cursor}`, signal);
		if (!ok(reply) || typeof reply.body !== "object" || reply.body === null) {
			return fresh;
		}
		const items: unknown = Reflect.get(reply.body, "items");
		for (const item of Array.isArray(items) ? items : []) {
			const id = field(item, "event_id");
			if (id && !seen.has(id)) {
				seen.add(id);
				if (field(item, "source") === "devin") {
					fresh.push(field(item, "message"));
				}
			}
		}
		after = Reflect.get(reply.body, "has_next_page") === true ? field(reply.body, "end_cursor") : "";
	} while (after);
	return fresh;
}

async function endSession(jobDir: string, access: DevinAccess, session: string): Promise<void> {
	const reply = await devinRequest(access, "DELETE", `/sessions/${session}`, AbortSignal.timeout(TERMINATE_MS));
	await appendLimenLog(
		jobDir,
		ok(reply) ? `devin session ${session} terminated` : `devin session ${session} not terminated: ${problem(reply)}`,
	);
}

/** One API call; it never throws. */
async function devinRequest(
	access: DevinAccess,
	method: string,
	path: string,
	signal: AbortSignal,
	body?: unknown,
): Promise<DevinReply> {
	try {
		const response = await fetch(`${access.api}/v3/organizations/${access.org}${path}`, {
			method,
			headers: { authorization: `Bearer ${access.key}`, "content-type": "application/json" },
			...(body === undefined ? {} : { body: JSON.stringify(body) }),
			signal,
		});
		return { status: response.status, body: await response.json().catch(() => ({})) };
	} catch (error) {
		return { status: 0, body: { detail: error instanceof Error ? error.message : String(error) } };
	}
}

const ok = (reply: DevinReply): boolean => reply.status >= 200 && reply.status < 300;

/** A failed reply for the log: its HTTP status and the API's own detail. */
function problem(reply: DevinReply): string {
	const detail = field(reply.body, "detail") || field(reply.body, "title");
	return `${reply.status ? `HTTP ${reply.status}` : "no reply"}${detail ? `: ${detail}` : ""}`;
}

/** A string member of a JSON reply; "" when it is absent or not a string. */
function field(value: unknown, name: string): string {
	const member: unknown = typeof value === "object" && value !== null ? Reflect.get(value, name) : undefined;
	return typeof member === "string" ? member : "";
}

/** `owner/repo` from the origin URL: `git@host:owner/repo.git`, `https://host/owner/repo`, or a local path. */
function originRepository(url: string): string {
	const parts = url
		.replace(/\.git\/?$/, "")
		.split(/[/:]+/)
		.filter(Boolean);
	if (parts.length < 2) {
		throw new Error("the origin remote names no owner/repo for Devin");
	}
	return parts.slice(-2).join("/");
}

/** Git's trimmed stdout. A failure throws `what` with git's own reason. */
function git(cwd: string, args: readonly string[], what = `git ${args.join(" ")} failed`): Promise<string> {
	const { promise, resolve, reject } = Promise.withResolvers<string>();
	execFile("git", args, { cwd, encoding: "utf8" }, (error, stdout, stderr) => {
		if (error) {
			reject(new Error(`${what}: ${(stderr || error.message).trim()}`));
			return;
		}
		resolve(stdout.trim());
	});
	return promise;
}
