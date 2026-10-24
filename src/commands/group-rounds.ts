import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { herdrBinary } from "../integrations/herdr.ts";
import {
	type GroupMember,
	type GroupRun,
	groupLock,
	groupPath,
	leadHookLive,
	readRun,
	roundJobs,
	saveJson,
	teamRoute,
} from "../job/group-cabinet.ts";
import { publishResult } from "../job/group-events.ts";
import { roundInstruction, routeFlags, routeName } from "../job/group-packet.ts";
import { isTerminal } from "../job/job.ts";
import { textFile } from "../job/record.ts";
import { processInfo } from "../runtime/contain.ts";
import { continueCommand } from "./continue.ts";

const PROMPT_MS = 15_000;

/** `F1048 team-1 gpt-6.1-sol · draft`: the feature, the team, its model and the round. */
export function teamJobLabel(run: GroupRun, team: string, round: number): string {
	const featureName = run.feature.split("/").at(-1) ?? run.feature;
	const feature = /^F\d+/i.exec(featureName)?.[0]?.toUpperCase() ?? featureName;
	return `${feature} ${team} ${teamRoute(run, team).model} · ${run.rounds[round]}`;
}
const roundFolder = (run: GroupRun, round: number): string =>
	`${groupPath(run)}/rounds/${round + 1}-${run.rounds[round]}`;
const jobText = (run: GroupRun, member: GroupMember, file: string): Promise<string> =>
	textFile(`${run.root}/.limen/jobs/${member.id}/${file}`);
const lastJob = (run: GroupRun, round: number, team: string): GroupMember | undefined =>
	roundJobs(run, round).findLast((member) => member.team === team);

/** Who works a round: every team first, then each team whose last round ended done; the final round only the first. */
async function roundTeams(run: GroupRun, round: number): Promise<string[]> {
	if (round === 0) {
		return run.teams;
	}
	const done: string[] = [];
	for (const team of run.teams) {
		const job = lastJob(run, round - 1, team);
		if (job && (await jobText(run, job, "state")) === "done") {
			done.push(team);
		}
	}
	return run.rounds[round] === "final" ? done.slice(0, 1) : done;
}

/**
 * Starts the next round once every team of the current round has ended, and tells the lead the result once after the
 * last. Any process may call it: each finished team job starts one, and the launch lock makes the steps happen once.
 */
export async function advanceGroup(root: string, id: string): Promise<void> {
	await ownersExited(await readRun(root, id));
	await groupLock(
		`${root}/.limen/groups/${id}/launch`,
		async () => {
			while (await advanceOnce(root, id)) {
				// A round whose every launch failed has already ended; the next pass moves past it.
			}
		},
		"wait",
	);
}
const OWNER_EXIT_MS = 30_000;
/** A job's finish runs in the process that ran it; give each ended job of the round half a minute to exit, unlocked. */
async function ownersExited(run: GroupRun): Promise<void> {
	const until = Date.now() + OWNER_EXIT_MS;
	for (const member of roundJobs(run, run.round)) {
		if (!isTerminal(await jobText(run, member, "state"))) {
			continue;
		}
		const owner = `${run.root}/.limen/jobs/${member.id}/group-owner.json`;
		for (; Date.now() < until; await delay(200)) {
			const recorded = JSON.parse(await readFile(owner, "utf8").catch(() => "null")) as {
				pid: number;
				born: string;
			} | null;
			const info = recorded ? await processInfo(recorded.pid) : undefined;
			if (!recorded || info?.kind === "absent" || (info?.kind === "present" && info.process.born !== recorded.born)) {
				break;
			}
		}
	}
}
async function advanceOnce(root: string, id: string): Promise<boolean> {
	const run = await readRun(root, id);
	if (!run.routes || run.stopped || run.closed || run.finishedAt) {
		return false;
	}
	const teams = await roundTeams(run, run.round);
	for (const team of teams) {
		const job = lastJob(run, run.round, team);
		// No job and no recorded launch failure: the launch has not happened yet.
		if (
			job ? !isTerminal(await jobText(run, job, "state")) : !existsSync(`${roundFolder(run, run.round)}/${team}.md`)
		) {
			return false;
		}
	}
	await saveRoundResults(run, teams);
	const next = run.round + 1;
	const nextTeams =
		next < run.rounds.length && Date.now() < run.deadline - run.reserveMs ? await roundTeams(run, next) : [];
	if (!nextTeams.length) {
		await finishGroup(run);
		return false;
	}
	await mkdir(roundFolder(run, next), { recursive: true });
	for (const team of nextTeams) {
		await startRound(run, team, next);
	}
	await groupLock(groupPath(run), async () => {
		const current = await readRun(root, id);
		current.round = next;
		await saveJson(`${groupPath(run)}/run.json`, current);
	});
	return true;
}
/** Each team's final message for the round, in one folder the next round reads. */
async function saveRoundResults(run: GroupRun, teams: readonly string[]): Promise<void> {
	await mkdir(roundFolder(run, run.round), { recursive: true });
	for (const team of teams) {
		const job = lastJob(run, run.round, team);
		if (!job) {
			continue;
		}
		const result = await jobText(run, job, "result");
		const state = await jobText(run, job, "state");
		const reason = state === "done" ? "" : await endReason(run, job);
		await writeFile(
			`${roundFolder(run, run.round)}/${team}.md`,
			`${result || `(no final message; the job ended ${state || "without a state"}${reason ? `: ${reason}` : ""})`}\n`,
		);
	}
}
/** What ended a job that did not end done: its last failed or stopped log line, else its engine's stop reason. */
async function endReason(run: GroupRun, member: GroupMember): Promise<string> {
	const terminal = /^\[limen [^\]]*\] (failed|stopped): /;
	const ended = (await jobText(run, member, "log")).split("\n").findLast((line) => terminal.test(line));
	return ended?.replace(terminal, "") || jobText(run, member, "stop-reason");
}
/** Continues the team's last job in its own session and worktree, or records why it could not. */
async function startRound(run: GroupRun, team: string, round: number): Promise<void> {
	const parent = lastJob(run, round - 1, team);
	if (!parent || lastJob(run, round, team)) {
		return;
	}
	const hosted = existsSync(`${run.root}/.limen/jobs/${parent.id}/hosted`);
	try {
		await continueCommand(
			[
				parent.id,
				await roundPrompt(run, team, round),
				"--label",
				teamJobLabel(run, team, round),
				...routeFlags(teamRoute(run, team)).split(" "),
				hosted ? "--tab" : "--detached",
			],
			run.root,
			round,
		);
	} catch (error) {
		await writeFile(
			`${roundFolder(run, round)}/${team}.md`,
			`(round not started: ${error instanceof Error ? error.message : String(error)})\n`,
		);
	}
}
/** The round's instruction and where every team's results are; the final round reads every round. */
async function roundPrompt(run: GroupRun, team: string, round: number): Promise<string> {
	const lines = [await roundInstruction(run, round), "", "Team results (read them; check claims against the code):"];
	for (let earlier = run.rounds[round] === "final" ? 0 : round - 1; earlier < round; earlier += 1) {
		lines.push(`Round ${earlier + 1} (${run.rounds[earlier]}):`);
		for (const peer of run.teams) {
			const path = `${roundFolder(run, earlier)}/${peer}.md`;
			const job = lastJob(run, earlier, peer);
			if (!existsSync(path) || !job) {
				continue;
			}
			const owner = peer === team ? "yours" : routeName(teamRoute(run, peer));
			const branch = await jobText(run, job, "branch");
			const worktree = await jobText(run, job, "worktree");
			lines.push(`- ${peer} (${owner}): ${path}; branch ${branch}; worktree ${worktree}`);
		}
	}
	lines.push("", `Your final message is your round ${round + 1} result; Limen saves it for the next round.`);
	return lines.join("\n");
}

/** Marks the run finished, writes `result.md`, and tells the lead once: a group event, or Herdr when its hook is not running. */
async function finishGroup(run: GroupRun): Promise<void> {
	const text = await groupResult(run);
	await groupLock(groupPath(run), async () => {
		const current = await readRun(run.root, run.id);
		current.finishedAt = Date.now();
		await saveJson(`${groupPath(run)}/run.json`, current);
	});
	await writeFile(`${groupPath(run)}/result.md`, `${text}\n`);
	if (await leadHookLive(run.root, run.lead)) {
		await publishResult(run, text);
		await writeFile(`${groupPath(run)}/result-delivery`, `group event for lead session ${run.lead}\n`);
		return;
	}
	await promptLeadPane(run, text);
}
async function groupResult(run: GroupRun): Promise<string> {
	const last = run.round;
	const lines = [
		`Group ${run.feature} (${run.id}) finished round ${last + 1} of ${run.rounds.length} (${run.rounds.join(" → ")}).`,
	];
	// The lead decides from the teams' own words: each final message of the last round goes whole, never cut.
	const finalJob = run.rounds[last] === "final" ? roundJobs(run, last)[0] : undefined;
	if (!finalJob) {
		lines.push(`Results of round ${last + 1} (${run.rounds[last]}), one file per team: ${roundFolder(run, last)}/`);
	}
	const ended = finalJob ? [finalJob] : run.teams.flatMap((team) => lastJob(run, last, team) ?? []);
	for (const job of ended) {
		const path = `${roundFolder(run, last)}/${job.team}.md`;
		const result = await jobText(run, job, "result");
		const route = routeName(teamRoute(run, job.team));
		lines.push(`${finalJob ? "Final result" : "Result"} (${job.team}, ${route}): ${path}`, ...(result ? [result] : []));
	}
	lines.push("Teams:");
	for (const team of run.teams) {
		const job = run.members.findLast((member) => member.team === team && member.role === "coordinator");
		const state = job ? await jobText(run, job, "state") : "not started";
		const branch = job ? await jobText(run, job, "branch") : "";
		// A team that did not finish reaches the lead once, here, with its reason.
		const reason = job && state !== "done" ? (await endReason(run, job)).split("\n")[0] : "";
		const ended = `${state} after round ${(job?.round ?? 0) + 1}${reason ? ` (${reason.slice(0, 240)})` : ""}`;
		lines.push(`- ${team} · ${routeName(teamRoute(run, team))} · ${ended}${branch ? ` · ${branch}` : ""}`);
	}
	lines.push(
		`All round results: ${groupPath(run)}/rounds/`,
		`Next: read the result, keep what you choose on one branch and land it, then run limen group close ${run.id}.`,
	);
	return lines.join("\n");
}
/** The lead hook is not running: start a turn on the pane the lead started the group from, two attempts at most. */
async function promptLeadPane(run: GroupRun, text: string): Promise<void> {
	const herdr = herdrBinary();
	const receipt = `${groupPath(run)}/result-delivery`;
	if (!herdr || !run.leadPane) {
		await writeFile(receipt, "not delivered: the lead hook is not running and no lead pane is recorded\n");
		return;
	}
	const lines: string[] = [];
	for (let attempt = 1; attempt <= 2; attempt += 1) {
		const args = ["agent", "prompt", run.leadPane, text, "--wait", "--until", "working", "--until", "blocked"];
		const error = await new Promise<Error | null>((resolve) => {
			execFile(herdr, [...args, "--timeout", String(PROMPT_MS - 2_000)], { timeout: PROMPT_MS }, resolve);
		});
		lines.push(`attempt ${attempt}: ${error ? `failed on ${run.leadPane}` : `turn observed on ${run.leadPane}`}`);
		if (!error) {
			break;
		}
	}
	await writeFile(receipt, `${lines.join("\n")}\n`);
}
