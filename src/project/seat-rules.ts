import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * One rule for every coordinator on the seat, kept under the Limen home in `.limen/rules/<name>/rule.json`. Each set
 * or change writes a new `version`; `ended.<version>` claims that version's end once; `pings/<version>.<kind>/<pane>`
 * keeps one receipt per coordinator tab that Limen pinged.
 */
export type SeatRule = {
	readonly name: string;
	readonly text: string;
	/** ISO end time. */
	readonly until: string;
	readonly setBy: string;
	readonly setAt: string;
	readonly startPriority?: number;
	readonly version: string;
};

export const RULE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const rulesRoot = () => join(process.env.LIMEN_HOME || homedir(), ".limen", "rules");
export const ruleFolder = (name: string) => join(rulesRoot(), name);

/** The rule a folder holds, ended or not; undefined when it holds none. */
export function readRule(folder: string): SeatRule | undefined {
	try {
		const rule = JSON.parse(readFileSync(join(folder, "rule.json"), "utf8")) as Partial<SeatRule>;
		const strings = [rule.name, rule.text, rule.until, rule.setBy, rule.setAt, rule.version];
		return strings.every((value) => typeof value === "string") ? (rule as SeatRule) : undefined;
	} catch {
		return;
	}
}

export function writeRule(rule: SeatRule): void {
	mkdirSync(ruleFolder(rule.name), { recursive: true });
	const path = join(ruleFolder(rule.name), "rule.json");
	const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
	writeFileSync(temporary, `${JSON.stringify(rule, null, "\t")}\n`, { flag: "wx" });
	try {
		renameSync(temporary, path);
	} finally {
		rmSync(temporary, { force: true });
	}
}

export const ruleEnded = (rule: SeatRule) => existsSync(join(ruleFolder(rule.name), `ended.${rule.version}`));

/** Claims the end of this version of the rule. False when another process ended it first. */
export function claimRuleEnd(rule: SeatRule, why: string): boolean {
	try {
		writeFileSync(join(ruleFolder(rule.name), `ended.${rule.version}`), `${new Date().toISOString()} ${why}\n`, {
			flag: "wx",
		});
		return true;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") {
			return false;
		}
		throw error;
	}
}

/** Every rule that has not ended, soonest end first; one whose end time passed is `due`. */
export function openRules(now = Date.now()): readonly (SeatRule & { readonly due: boolean })[] {
	const names = existsSync(rulesRoot()) ? readdirSync(rulesRoot()) : [];
	return names
		.flatMap((name) => {
			const rule = RULE_NAME.test(name) ? readRule(ruleFolder(name)) : undefined;
			return rule && !ruleEnded(rule) ? [{ ...rule, due: Date.parse(rule.until) <= now }] : [];
		})
		.sort((left, right) => Date.parse(left.until) - Date.parse(right.until));
}

/** The rules that hold now. The start queue, `limen board` and the communication hook read this. */
export const activeRules = (now = Date.now()): readonly SeatRule[] => openRules(now).filter((rule) => !rule.due);

/** One line per rule; `max` cuts a long text for the per-turn context. */
export function ruleLine(rule: SeatRule, max = Number.POSITIVE_INFINITY): string {
	const priority = rule.startPriority ? `, start priority ${rule.startPriority}` : "";
	const text = rule.text.length > max ? `${rule.text.slice(0, max)}… (limen rule shows the rest)` : rule.text;
	return `- ${rule.name} until ${localTime(rule.until)}${priority}: ${text}`;
}

export function localTime(iso: string): string {
	return new Date(iso).toLocaleString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
	});
}
