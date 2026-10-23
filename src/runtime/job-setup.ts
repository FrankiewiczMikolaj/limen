import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { pruneForJob } from "../commands/prune.ts";
import { appendLimenLog } from "../job/record.ts";
import { limitMs, PLANT_LIMITS, plantLimits } from "../project/limits.ts";

const DEFAULT_PREPARE_MS = 5 * 60_000;

/** Why the engine cannot start in the job's worktree: it is gone or is no Git checkout. Undefined when it can. */
export function worktreeMissing(worktree: string): string | undefined {
	return existsSync(`${worktree}/.git`)
		? undefined
		: `worktree ${worktree} is missing or is not a Git checkout, so the engine did not start`;
}

/**
 * The setup spawn hands to the job's owner after publication, so spawn returns before it: prune finished worktrees,
 * then run `--prepare` in the worktree. `LIMEN_SETUP_KEEP` names the spawner's checkout and marks a start that owes
 * setup; a continue or a recovery does not set it. Each step logs its result and time; neither failure ends the job.
 * The log also names each entry of the plant's limits file that Limen ignores.
 */
export async function setUpJob(jobDir: string, worktree: string): Promise<void> {
	const keep = process.env.LIMEN_SETUP_KEEP;
	const root = process.env.LIMEN_CONTEXT_ROOT;
	if (!(keep && root)) {
		return;
	}
	const pruneStart = Date.now();
	await pruneForJob(jobDir, root, [worktree, keep]).then(
		(removed) => appendLimenLog(jobDir, `prune: removed ${removed} in ${seconds(pruneStart)}`),
		(error: unknown) => appendLimenLog(jobDir, `prune failed after ${seconds(pruneStart)}: ${String(error)}`),
	);
	const { ignored } = plantLimits(root);
	if (ignored.length > 0) {
		await appendLimenLog(jobDir, `limits: ignored in ${PLANT_LIMITS}: ${ignored.join("; ")}`);
	}
	const command = process.env.LIMEN_SETUP_PREPARE?.trim();
	if (command) {
		await runPrepare(jobDir, worktree, command, limitMs("prepare", DEFAULT_PREPARE_MS, root));
	}
}
async function runPrepare(jobDir: string, worktree: string, command: string, timeoutMs: number): Promise<void> {
	const start = Date.now();
	let output = "";
	const failure = await new Promise<string | undefined>((resolve) => {
		const child = spawn(command, { cwd: worktree, shell: true, stdio: ["ignore", "pipe", "pipe"], timeout: timeoutMs });
		child.stdout.on("data", (chunk: Buffer) => {
			output += chunk.toString();
		});
		child.stderr.on("data", (chunk: Buffer) => {
			output += chunk.toString();
		});
		child.once("error", (error) => resolve(error.message));
		// `exit`, not `close`: a process the command left behind may hold its pipes open.
		child.once("exit", (code, signal) => {
			if (code === 0) {
				resolve(undefined);
			} else if (signal && Date.now() - start >= timeoutMs) {
				resolve(`timed out after ${timeoutMs / 1000} s`);
			} else {
				resolve(signal ? `killed by ${signal}` : `exit ${code}`);
			}
		});
	});
	const trimmed = output.trimEnd();
	await appendLimenLog(jobDir, `prepare: ${command} (${seconds(start)})${trimmed ? `\n${trimmed}` : ""}`);
	if (failure) {
		await appendLimenLog(jobDir, `prepare failed: ${failure}`);
	}
}
const seconds = (start: number): string => `${((Date.now() - start) / 1000).toFixed(1)} s`;
