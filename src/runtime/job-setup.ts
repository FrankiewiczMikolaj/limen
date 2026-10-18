import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { pruneForJob } from "../commands/prune.ts";
import { appendLimenLog } from "../job/record.ts";

/**
 * The setup spawn hands to the job's owner after publication, so spawn returns before it: start a prune of finished
 * worktrees, then run `--prepare` in the worktree. `LIMEN_SETUP_KEEP` names the spawner's checkout and marks a start
 * that owes setup; a continue or a recovery does not set it. Each step logs its result and time; neither failure ends
 * the job.
 */
export async function setUpJob(jobDir: string, worktree: string): Promise<void> {
	const keep = process.env.LIMEN_SETUP_KEEP;
	if (!keep) {
		return;
	}
	// Prune is housekeeping in its own process group: it does not hold the engine start, and a stop does not cut it.
	const prune = spawn(process.execPath, [fileURLToPath(new URL("../../bin/limen", import.meta.url))], {
		detached: true,
		stdio: "ignore",
		env: {
			...process.env,
			LIMEN_INTERNAL_RUN: "",
			LIMEN_INTERNAL_HOSTED: "",
			LIMEN_INTERNAL_PRUNE: "1",
			LIMEN_JOB_DIR: jobDir,
			LIMEN_PRUNE_KEEP: `${worktree}\n${keep}`,
		},
	});
	prune.once(
		"error",
		(error) => void appendLimenLog(jobDir, `prune failed to start: ${error.message}`).catch(() => {}),
	);
	prune.unref();
	const command = process.env.LIMEN_SETUP_PREPARE?.trim();
	if (command) {
		await runPrepare(jobDir, worktree, command);
	}
}
/** The detached prune a new job starts: it logs each removal and then one summary line with its time. */
export async function runJobPrune(): Promise<void> {
	const jobDir = process.env.LIMEN_JOB_DIR ?? "";
	const root = process.env.LIMEN_CONTEXT_ROOT ?? "";
	const start = Date.now();
	await pruneForJob(jobDir, root, (process.env.LIMEN_PRUNE_KEEP ?? "").split("\n")).then(
		(removed) => appendLimenLog(jobDir, `prune: removed ${removed} in ${seconds(start)}`),
		(error: unknown) => appendLimenLog(jobDir, `prune failed after ${seconds(start)}: ${String(error)}`),
	);
}
async function runPrepare(jobDir: string, worktree: string, command: string): Promise<void> {
	const timeoutMs = Number(process.env.LIMEN_PREPARE_MS) || 300_000;
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
