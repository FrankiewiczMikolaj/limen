import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readOptional } from "../project/inherit.ts";

// The agent writes the note in its job folder; the project may keep reminders beside its other Limen guidance.
// Limen copies, logs and shows both, and never parses them.
const NOTE = "note.md";
const FIRST = "note.first.md";
const REMINDERS = ".agents/limen/reminders.md";
const CHANGED = '"🟡 changed: ... Reason: ..."';
const FORMAT = [
	"Format: a nested list in plain technical English. Short, clear sentences. One fact on each line.",
	"Each line starts with a marker: 🔴 must deliver or must keep, 🟡 useful context, ⚪ minor or assumption.",
	"Put detail under its main point. Add a time only when it helps.",
	`When a point changes, keep its line and add a line under it: ${CHANGED}. Example:`,
	"- 🔴 Add a rate limit to the public API. Due 2026-10-24.",
	"  - 🔴 The limit is 100 requests per minute for each key.",
	"    - 🟡 changed 14:05: the limit is 60 requests per minute. Reason: the owner steered.",
	"  - 🟡 The API uses the Redis client in src/cache.ts.",
	"  - ⚪ Assume that old keys keep the old limit.",
].join("\n");

/** Added once, to the first prompt of each job, a continued one too. */
export function noteStart(jobDir: string): string {
	const reminders = projectReminders(jobDir);
	return [
		`[limen] Before other work, read your note in ${join(jobDir, NOTE)}, or write it if there is none.`,
		FORMAT,
		...(reminders ? [`Project reminders (${reminders.path}). Keep each 🔴 one as you keep your 🔴 points:`] : []),
		...(reminders ? [reminders.text] : []),
	].join("\n");
}

/** Added to each steer message. */
export function noteSteer(jobDir: string): string {
	const subject = projectReminders(jobDir) ? "a point in your note or a project reminder" : "a point in your note";
	return `[limen] If this steer changes ${subject}, add a line under that point in ${join(jobDir, NOTE)}: ${CHANGED}.`;
}

/** Sent once, before the finish: the note now, the note at the start, and the project reminders. */
export function noteCheck(jobDir: string, finishTool: boolean): string {
	const now = readOptional(join(jobDir, NOTE))?.trim();
	const first = readOptional(join(jobDir, FIRST))?.trim();
	const reminders = projectReminders(jobDir);
	const points = reminders ? "🔴 point and each 🔴 project reminder" : "🔴 point";
	return [
		...(now
			? ["[limen] Your note now:", now]
			: [`[limen] You wrote no note in ${join(jobDir, NOTE)}. From memory, list the 🔴 points of this job.`]),
		...(now && first && first !== now ? ["Your note at the start:", first] : []),
		...(reminders ? ["Project reminders:", reminders.text] : []),
		`In your final message, under the heading "Note check", mark each ${points} delivered, changed or dropped, ` +
			"and give the reason.",
		...(finishTool ? ['Then call finish again. Its handoff is that whole final message, with the "Note check".'] : []),
	].join("\n");
}

/** Keeps the first version of the note as `note.first.md` and logs each change. Returns the text it saw last. */
export function recordNote(jobDir: string, seen: string | undefined): string | undefined {
	const now = readOptional(join(jobDir, NOTE));
	if (now === undefined || now === seen) {
		return seen;
	}
	if (!existsSync(join(jobDir, FIRST))) {
		writeFileSync(join(jobDir, FIRST), now);
	}
	appendFileSync(join(jobDir, "log"), `[limen ${new Date().toISOString()}] note changed\n`);
	return now;
}

/** A job folder is `<root>/.limen/jobs/<id>`; the reminders belong to that root. Absent or empty means none. */
function projectReminders(jobDir: string): { readonly path: string; readonly text: string } | undefined {
	const path = join(resolve(jobDir, "..", "..", ".."), REMINDERS);
	const text = readOptional(path)?.trim();
	return text ? { path, text } : undefined;
}
