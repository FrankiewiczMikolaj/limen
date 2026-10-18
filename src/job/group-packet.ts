import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { privatePlanningFile } from "../project/planning.ts";
import type { GroupMember, GroupRun, TeamRoute } from "./group-cabinet.ts";
import { teamRoute } from "./group-cabinet.ts";

const PACKAGE_ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");

/** `templates/group-member.md`: the contract every member reads, then one `## Round: NAME` section per round. */
async function memberTemplate(): Promise<{ contract: string; rounds: Map<string, string> }> {
	const [contract = "", ...sections] = (await readFile(`${PACKAGE_ROOT}/templates/group-member.md`, "utf8")).split(
		/^## Round: /m,
	);
	const rounds = new Map<string, string>();
	for (const section of sections) {
		const [name = "", ...body] = section.split("\n");
		rounds.set(name.trim(), body.join("\n").trim());
	}
	return { contract: contract.trim(), rounds };
}
export async function roundNames(): Promise<string[]> {
	return [...(await memberTemplate()).rounds.keys()];
}
/** What a team does in this round, headed by its place in the run. */
export async function roundInstruction(run: GroupRun, round: number): Promise<string> {
	const name = run.rounds[round] ?? "";
	const body = (await memberTemplate()).rounds.get(name) ?? "";
	return `Round ${round + 1} of ${run.rounds.length}: ${name}. ${body}`;
}
export const routeFlags = (route: TeamRoute): string =>
	`--engine ${route.engine} --provider ${route.provider} --model ${route.model} --thinking ${route.thinking}`;
export const routeName = (route: TeamRoute): string =>
	`${route.engine} ${route.provider}/${route.model} ${route.thinking}`;

/** The contract, the member's place in the group and the packet paths; a team's first job also gets its round. */
export async function memberPacket(run: GroupRun, team: string, member: GroupMember): Promise<string> {
	const { contract } = await memberTemplate();
	const route = teamRoute(run, team);
	const lines = [
		contract,
		"",
		`Canonical root: ${run.root}`,
		`Group: ${run.id} · ${team} · feature ${run.feature}`,
		`Limen command (use this path for every limen command): ${PACKAGE_ROOT}/bin/limen`,
	];
	if (member.role === "coordinator") {
		lines.push(
			run.workersPerTeam
				? `Worker allowance: ${run.workersPerTeam}. Launch each worker with limen spawn ${routeFlags(route)}.`
				: "Worker allowance: none. Do the work yourself.",
		);
		if (run.teamExtensions && run.workersPerTeam) {
			lines.push("Team extensions are inherited automatically. Omit --extension; keep the route flags explicit.");
		}
	}
	lines.push(...(await packetFiles(run, team)));
	if (member.role === "coordinator") {
		lines.push("", await roundInstruction(run, member.round ?? 0));
	}
	return lines.join("\n");
}
/** Ticket always; brief and approach note when the lead wrote them. Private planning names canonical paths only. */
async function packetFiles(run: GroupRun, team: string): Promise<string[]> {
	const lines: string[] = [];
	const files = [
		["Ticket", `${run.feature}/ticket.md`],
		["Brief", `${run.feature}/group/brief.md`],
		["Approach note", `${run.feature}/group/teams/${team}.md`],
	] as const;
	for (const [name, path] of files) {
		if (!existsSync(`${run.root}/${path}`)) {
			continue;
		}
		if (run.planningSource === "private") {
			lines.push(`${name}: ${await privatePlanningFile(run.root, path)}`);
		} else if (name === "Approach note") {
			lines.push(`Approach note:\n${(await readFile(`${run.root}/${path}`, "utf8")).trim()}`);
		} else {
			lines.push(`${name}: ${path}`);
		}
	}
	return lines;
}
