import { join } from "node:path";
import { parseDuration } from "../job/job.ts";
import { readOptional } from "./inherit.ts";

// A plant whose tools wait on shared work, such as a cargo plant behind a Mac-wide build queue, raises these limits
// in its tracked file. Limen reads the file in the project root at each use, so an edit applies to running jobs too.
export const PLANT_LIMITS = ".agents/limen/limits.json";
const VARIABLES = { prepare: "LIMEN_PREPARE_MS", toolStall: "LIMEN_TOOL_STALL_MS" } as const;
type Limit = keyof typeof VARIABLES;
const LIMITS: readonly Limit[] = ["prepare", "toolStall"];

/** Milliseconds for one limit: a positive env var wins, then the plant's file, then `fallback`. */
export function limitMs(limit: Limit, fallback: number, root = process.env.LIMEN_CONTEXT_ROOT): number {
	const configured = Number(process.env[VARIABLES[limit]]);
	if (Number.isFinite(configured) && configured > 0) {
		return configured;
	}
	return (root ? plantLimits(root).limits[limit] : undefined) ?? fallback;
}

/** The limits the plant's file sets, and one reason for each entry Limen ignores. No file sets nothing. */
export function plantLimits(root: string): { limits: Partial<Record<Limit, number>>; ignored: string[] } {
	const text = readOptional(join(root, PLANT_LIMITS));
	if (text === undefined) {
		return { limits: {}, ignored: [] };
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		return { limits: {}, ignored: ["the file is not JSON"] };
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		return { limits: {}, ignored: ["the file is not a JSON object"] };
	}
	const limits: Partial<Record<Limit, number>> = {};
	const ignored: string[] = [];
	for (const [key, value] of Object.entries(parsed)) {
		const limit = LIMITS.find((name) => name === key);
		if (!limit) {
			ignored.push(`${key} is not a limit; use prepare or toolStall`);
			continue;
		}
		try {
			limits[limit] = parseDuration(String(value));
		} catch {
			ignored.push(`${key} ${JSON.stringify(value)} is not a duration such as 90s, 20m or 2h`);
		}
	}
	return { limits, ignored };
}
