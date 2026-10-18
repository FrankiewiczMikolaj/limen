import { readdir, readFile, realpath, rm } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { retainedGroupJob } from "../job/group-cabinet.ts";
import { isTerminal } from "../job/job.ts";
import { appendLimenLog } from "../job/record.ts";
import {
	branchExists,
	deleteBranch,
	type GitWorktree,
	limenRoot,
	listWorktrees,
	pruneWorktrees,
	removeWorktree,
	unlandedBranches,
	workspaceRepository,
} from "../project/git.ts";
import { liveJob, STARTUP_GRACE_MS, startingJob } from "../runtime/reap.ts";

export async function pruneCommand(args: readonly string[], cwd: string): Promise<void> {
	const retire = args.includes("--retire"),
		dryRun = args.includes("--dry-run");
	if (args.some((value) => value !== "--retire" && value !== "--dry-run")) {
		throw new Error("prune accepts no arguments, --retire, or --retire --dry-run");
	}
	if (dryRun && !retire) {
		throw new Error("prune --dry-run requires --retire");
	}
	if (!retire) {
		const removals = await pruneFinishedWorktrees(limenRoot(cwd));
		for (const removal of removals) {
			console.log(pruneLine(removal));
		}
		console.log(
			removals.length === 0
				? "no finished worktrees"
				: `pruned ${removals.length} finished worktree${removals.length === 1 ? "" : "s"}`,
		);
		return;
	}
	const { ids, branches } = await retireFinishedJobs(limenRoot(cwd), dryRun);
	if (dryRun && ids.length) {
		console.log(ids.map((id) => `would retire ${id}`).join("\n"));
	} else {
		console.log(
			ids.length === 0 ? "no finished jobs to retire" : `retired ${ids.length} job${ids.length === 1 ? "" : "s"}`,
		);
	}
	if (branches) {
		console.log(`deleted ${branches} landed branch${branches === 1 ? "" : "es"}`);
	}
}

async function retireFinishedJobs(
	root: string,
	dryRun: boolean,
): Promise<{ readonly ids: readonly string[]; readonly branches: number }> {
	const jobsRoot = `${root}/.limen/jobs`,
		retired: { id: string; repository: string; branch: string }[] = [],
		finished: { id: string; repository: string; branch: string }[] = [],
		repositories = new Map<string, string>();
	for (const id of (await jobIds(jobsRoot)).sort()) {
		const jobDir = `${jobsRoot}/${id}`;
		if (await retainedGroupJob(jobDir)) {
			continue;
		}
		const [state, branch, repo] = await Promise.all([
			text(`${jobDir}/state`),
			text(`${jobDir}/branch`),
			text(`${jobDir}/repo`),
		]);
		if (!isTerminal(state)) {
			continue;
		}
		try {
			const repository = !branch ? root : (repositories.get(repo) ?? (repo ? workspaceRepository(root, repo) : root));
			if (branch) {
				repositories.set(repo, repository);
			}
			finished.push({ id, repository, branch });
		} catch {}
	}
	const unlanded = new Map<string, ReadonlySet<string> | undefined>();
	for (const repository of new Set(finished.map((job) => job.repository))) {
		try {
			unlanded.set(
				repository,
				unlandedBranches(
					repository,
					finished.filter((job) => job.repository === repository && job.branch).map((job) => job.branch),
				),
			);
		} catch {
			unlanded.set(repository, undefined);
		}
	}
	for (const job of finished) {
		const pending = unlanded.get(job.repository);
		if (pending && !pending.has(job.branch)) {
			retired.push(job);
		}
	}
	if (dryRun) {
		return { ids: retired.map((job) => job.id), branches: 0 };
	}
	// Branches go before records: a record names the finished worktree that may still hold its branch.
	const landed = new Map(retired.filter((job) => job.branch).map((job) => [`${job.repository}\0${job.branch}`, job]));
	const deleted = (await deleteLandedBranches(root, [...landed.values()])).filter((result) => !result.kept).length;
	for (const { id } of retired) {
		await rm(`${jobsRoot}/${id}`, { recursive: true, force: true });
	}
	return { ids: retired.map((job) => job.id), branches: deleted };
}

/** One path that prune removed: the job that recorded it, when one did, and why no live job kept it. */
export type PruneRemoval = { readonly path: string; readonly jobDir: string | undefined; readonly reason: string };
/** Why prune removes a worktree some job recorded; a job that kept it never gets here. */
type PruneOwners = Map<string, { readonly jobDir: string; readonly reason: string }>;
export function pruneLine(removal: PruneRemoval): string {
	return `pruned ${removal.path} (job ${removal.jobDir ? basename(removal.jobDir) : "none"}): ${removal.reason}`;
}
/** Prunes, writes each line to this job's log and to the log of the job whose worktree went; returns the count. */
export async function pruneForJob(jobDir: string, root: string, keep: readonly string[]): Promise<number> {
	const removals = await pruneFinishedWorktrees(root, keep);
	for (const removal of removals) {
		const line = pruneLine(removal);
		await appendLimenLog(jobDir, line);
		if (removal.jobDir && removal.jobDir !== jobDir) {
			await appendLimenLog(removal.jobDir, line).catch(() => {});
		}
	}
	return removals.length;
}
export async function pruneFinishedWorktrees(root: string, keep: readonly string[] = []): Promise<PruneRemoval[]> {
	const jobsRoot = `${root}/.limen/jobs`;
	const keepPaths = new Set<string>();
	for (const path of keep) {
		keepPaths.add(await resolved(path));
	}
	const owners: PruneOwners = new Map();
	const { repositories, removals } = await scanJobRecords(root, jobsRoot, keepPaths, owners);
	await keepLiveWorktrees(jobsRoot, keepPaths, owners);
	for (const repository of repositories) {
		removals.push(...(await pruneRepositoryWorktrees(repository, keepPaths, owners)));
	}
	return removals;
}
type LandedBranch = { readonly repository: string; readonly branch: string };
/**
 * Deletes each landed `limen/*` branch and the finished worktree that holds it, since Git keeps a checked-out branch.
 * The caller has proven every branch landed. A branch stays while a job record that names it is not finished or is
 * a retained group job, or while a checkout no job recorded holds it. Returns why each kept branch stays.
 */
export async function deleteLandedBranches(
	root: string,
	landed: readonly LandedBranch[],
): Promise<{ readonly branch: string; readonly kept?: string }[]> {
	const uses = await branchUses(`${root}/.limen/jobs`);
	const checkouts = new Map<string, readonly GitWorktree[]>();
	const results: { branch: string; kept?: string }[] = [];
	for (const { repository, branch } of landed) {
		const use = uses.get(branch);
		if (!branch.startsWith("limen/") || use?.busy || !branchExists(repository, branch)) {
			results.push({ branch, kept: use?.busy ? `job ${use.busy} still uses it` : "not a present limen/ branch" });
			continue;
		}
		if (!checkouts.has(repository)) {
			pruneWorktrees(repository);
			checkouts.set(repository, listWorktrees(repository));
		}
		const holder = checkouts.get(repository)?.find((worktree) => worktree.branch === branch);
		const path = holder ? await resolved(holder.path) : undefined;
		if (path && !use?.worktrees.has(path)) {
			results.push({ branch, kept: `it is checked out at ${path}` });
			continue;
		}
		try {
			if (path) {
				removeWorktree(repository, path);
			}
			deleteBranch(repository, branch);
			results.push({ branch });
		} catch (error) {
			// A locked checkout keeps its branch until the next land or retire.
			results.push({ branch, kept: error instanceof Error ? error.message.trim() : String(error) });
		}
	}
	return results;
}
/** For each recorded branch: a job that still uses it, and the worktrees its finished jobs left. */
async function branchUses(jobsRoot: string): Promise<Map<string, { busy?: string; worktrees: Set<string> }>> {
	const uses = new Map<string, { busy?: string; worktrees: Set<string> }>();
	for (const id of await jobIds(jobsRoot)) {
		const jobDir = `${jobsRoot}/${id}`;
		const [branch, state, worktree] = await Promise.all([
			text(`${jobDir}/branch`),
			text(`${jobDir}/state`),
			text(`${jobDir}/worktree`),
		]);
		if (!branch) {
			continue;
		}
		const use = uses.get(branch) ?? { worktrees: new Set<string>() };
		uses.set(branch, use);
		if (!isTerminal(state) || (await retainedGroupJob(jobDir))) {
			use.busy ??= id;
		} else if (worktree) {
			use.worktrees.add(await resolved(worktree));
		}
	}
	return uses;
}
/**
 * Keeps retained group worktrees, removes a record that never got a state once its startup grace is over, and names
 * the repositories whose worktrees the prune visits (the root when no job names one).
 */
async function scanJobRecords(
	root: string,
	jobsRoot: string,
	keepPaths: Set<string>,
	owners: PruneOwners,
): Promise<{ repositories: Set<string>; removals: PruneRemoval[] }> {
	const repositories = new Set<string>();
	const removals: PruneRemoval[] = [];
	for (const id of await jobIds(jobsRoot)) {
		const jobDir = `${jobsRoot}/${id}`;
		if (await retainedGroupJob(jobDir)) {
			const tree = await text(`${jobDir}/worktree`);
			if (tree) {
				keepPaths.add(await resolved(tree));
			}
			repositories.add(root);
			continue;
		}
		if (!(await text(`${jobDir}/state`))) {
			const startedAt = Date.parse(await text(`${jobDir}/started-at`));
			if ((Number.isFinite(startedAt) && Date.now() - startedAt < STARTUP_GRACE_MS) || (await startingJob(jobDir))) {
				continue;
			}
			const tree = await text(`${jobDir}/worktree`);
			if (tree) {
				owners.set(await resolved(tree), { jobDir, reason: "its record never got a state and was removed" });
			}
			await rm(jobDir, { recursive: true, force: true });
			removals.push({ path: jobDir, jobDir, reason: "record never got a state and its spawner is gone" });
			continue;
		}
		const repo = (await text(`${jobDir}/repo`)) || undefined;
		const repository = repo ? workspaceRepository(root, repo) : root;
		repositories.add(repository);
	}
	if (repositories.size === 0) {
		repositories.add(root);
	}
	return { repositories, removals };
}
/** Keeps the worktree of every live, starting or retained group job; the latest other record says why it goes. */
async function keepLiveWorktrees(jobsRoot: string, keepPaths: Set<string>, owners: PruneOwners): Promise<void> {
	for (const id of (await jobIds(jobsRoot)).sort()) {
		const jobDir = `${jobsRoot}/${id}`;
		const recorded = await text(`${jobDir}/worktree`);
		if (!recorded) {
			continue;
		}
		const state = await text(`${jobDir}/state`);
		const startedAt = Date.parse(await text(`${jobDir}/started-at`));
		const starting =
			(Number.isFinite(startedAt) && Date.now() - startedAt < STARTUP_GRACE_MS) || (await startingJob(jobDir));
		const path = await resolved(recorded);
		if ((await retainedGroupJob(jobDir)) || (state ? await liveJob(jobDir) : starting)) {
			keepPaths.add(path);
			continue;
		}
		const reason = state === "running" ? "job is running but its process is gone" : `job ${state || "has no state"}`;
		owners.set(path, { jobDir, reason });
	}
}
/** Removes Limen worktrees no kept job holds, then leftover directories; returns what it removed and why. */
async function pruneRepositoryWorktrees(
	repository: string,
	keepPaths: ReadonlySet<string>,
	owners: PruneOwners,
): Promise<PruneRemoval[]> {
	const removals: PruneRemoval[] = [];
	const worktreeRoot = await resolved(`${dirname(repository)}/.${basename(repository)}-limen-worktrees`);
	const primary = await resolved(repository);
	for (const worktree of listWorktrees(repository)) {
		const path = await resolved(worktree.path);
		if (path === primary || !path.startsWith(`${worktreeRoot}/`) || keepPaths.has(path)) {
			continue;
		}
		// Nested roots belong to another checkout, whose jobs this prune cannot see.
		if (/^\.[^/]*-limen-worktrees(?:\/|$)/.test(path.slice(worktreeRoot.length + 1))) {
			continue;
		}
		try {
			removeWorktree(repository, path);
			const owner = owners.get(path);
			removals.push({ path, jobDir: owner?.jobDir, reason: owner?.reason ?? "no job records this worktree" });
		} catch {
			// A locked checkout stays until the next prune.
		}
	}
	pruneWorktrees(repository);
	const registered = new Set(await Promise.all(listWorktrees(repository).map((worktree) => resolved(worktree.path))));
	const leftovers = await readdir(worktreeRoot, { withFileTypes: true }).catch(() => []);
	for (const leftover of leftovers) {
		if (/^\..*-limen-worktrees$/.test(leftover.name)) {
			continue;
		}
		const path = await resolved(resolve(worktreeRoot, leftover.name));
		if (keepPaths.has(path) || registered.has(path)) {
			continue;
		}
		await rm(path, { recursive: true, force: true });
		const owner = owners.get(path);
		removals.push({ path, jobDir: owner?.jobDir, reason: "directory is not a registered Git worktree" });
	}
	return removals;
}

async function jobIds(jobsRoot: string): Promise<string[]> {
	const entries = await readdir(jobsRoot, { withFileTypes: true }).catch((error: unknown) => {
		if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
			return [];
		}
		throw error;
	});
	return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}
function resolved(path: string): Promise<string> {
	return realpath(path).then(
		(value) => value,
		() => resolve(path),
	);
}
function text(path: string): Promise<string> {
	return readFile(path, "utf8").then(
		(value) => value.trim(),
		() => "",
	);
}
