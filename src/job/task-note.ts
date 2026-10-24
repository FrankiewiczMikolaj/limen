import { appendFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { readOptional } from "../project/inherit.ts";

// The agent writes the note in its job folder; the project may keep reminders beside its other Limen guidance.
// Limen copies, logs and shows both, and never parses them. Adam approved the wording below as written (F950).
// Limen reads only the "Note check" of the final message, and records its open items in `open-checks`.
const NOTE = "note.md";
const FIRST = "note.first.md";
const TASK = "task.md";
const OPEN = "open-checks";
const REMINDERS = ".agents/limen/reminders.md";
// One "Note check" line: `<check>: <mark>`, then the evidence or the gap. Proven and followed close an item.
const MARKED = /^(.+?):\s*(not proven|proven|changed|dropped|followed|broken)\b[\s.,;:]*(.*)$/i;
// A heredoc body is data, not commands: `<<'EOF'` up to the line that ends it. The rest of the opening line stays.
const HEREDOC = /<<-?[ \t]*(['"]?)([A-Za-z_]\w*)\1([^\n]*)\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g;
// Leading variable assignments and wrappers do not change which command runs: `CI=1 timeout 60 npm test` runs `npm test`.
const PREFIX = /^(?:[A-Za-z_]\w*=\S*\s+|(?:time|nohup|env|command|exec)\s+|timeout\s+\S+\s+)+/;
const SHOWN = 10;
const FORMAT = [
	"Write a plan, not a task copy or a result log. Use plain technical English. Aim for six lines in three parts:",
	'- Done means: two to four end checks. Each line states what must be true, then "Shown by:" and the command or ' +
		"observation that would prove it.",
	"- Easy to miss: the one task rule that the quickest way to finish could skip or break. Quote it. " +
		'Add "Shown by:" and how to check that it was followed.',
	"- Not proven yet: short names of the end checks and the easy-to-miss rule that lack evidence. Name each one.",
	"Keep exact commands, limits, paths, and counts when they define acceptance. " +
		"Reference a longer acceptance list by its location and item count; do not copy it or omit its checks.",
	"Each check starts unproven. Remove its name from Not proven yet only after you see evidence that it holds. " +
		'Add "Seen: <evidence location>" to that check. Give a pointer, not results. A pointer alone is not proof. ' +
		"The easy-to-miss rule needs its own evidence.",
	'Keep each check in the note after it is proven. Write "Not proven yet: none" only when every check and the rule ' +
		"have evidence. Unknown stays unproven. Do not add context, steps, assumptions, or test totals.",
].join("\n");

/** Added once, to the first prompt of each job, a continued one too. */
export function noteStart(jobDir: string): string {
	const reminders = projectReminders(jobDir);
	return [
		`[limen] Before other work, read ${join(jobDir, NOTE)}, or write it if there is none.`,
		FORMAT,
		"Read an existing note against this task. Keep restrictions that still apply. " +
			"Replace past results with the end checks or limits they reveal. " +
			"Reuse earlier evidence only after you inspect it and confirm that it still applies; " +
			"do not rerun a check just because this is a continued job.",
		...(reminders
			? [
					`Project reminders (${reminders.path}):`,
					reminders.text,
					"Follow each binding reminder. Do not copy them into the note.",
				]
			: []),
	].join("\n");
}

/** Added to each steer message. */
export function noteSteer(jobDir: string): string {
	return [
		"[limen] If this steer changes an end check or the easy-to-miss rule, keep the old line and append " +
			`"Changed: <new requirement>. Reason: <what changed it>" under it in ${join(jobDir, NOTE)}. ` +
			"The new requirement now applies. Put affected checks back in Not proven yet and remove stale Seen pointers. " +
			"Add any new obligation as unproven. Leave an unrelated note unchanged.",
		...(projectReminders(jobDir)
			? [
					"If a reminder changes, record the changed requirement by reference in the note. Do not edit the reminders file.",
				]
			: []),
	].join("\n");
}

/** Sent once, before the finish: the note now, the note at the start, and the project reminders. */
export function noteCheck(jobDir: string, finishTool: boolean): string {
	const now = readOptional(join(jobDir, NOTE))?.trim();
	const first = readOptional(join(jobDir, FIRST))?.trim();
	const reminders = projectReminders(jobDir);
	return [
		...(now
			? ["[limen] Your note now:", now]
			: [
					`[limen] No note exists in ${join(jobDir, NOTE)}. Read ${join(jobDir, TASK)} and reconstruct the end checks ` +
						"and the easy-to-miss rule. Do not assume they are proven.",
				]),
		...(now && first && first !== now ? ["Your note at the start:", first] : []),
		...(reminders ? ["Project reminders:", reminders.text] : []),
		"Compare the note with the task and later instructions. " +
			'Under the heading "Note check" in your final message, give one line per end check: ' +
			'"- <check>: <mark>. <evidence or gap>". The mark is proven, not proven, changed, or dropped. ' +
			"Proven names its evidence in backticks: a command that ran in this session, or a file. " +
			"Not proven needs what is missing. Changed or dropped needs the instruction that changed its scope. " +
			"Give one line per item in a referenced acceptance list. " +
			"Account for any obligation missing from the current note. " +
			"Limen sends each line marked not proven, changed, dropped, or broken to the coordinator, " +
			"and the job ends as done with open checks. " +
			"A proven line whose command did not run and whose file does not exist counts as not proven.",
		"Give the easy-to-miss rule its own line: followed, broken, or not proven, with evidence or the gap. " +
			"Passing the end checks does not prove that the rule was followed. " +
			"Read Not proven yet; none of its entries can be marked proven without evidence.",
		...(reminders
			? ["Report each binding project reminder as followed, broken, or not proven, with evidence or the gap."]
			: []),
		"Do not repeat a run-once check or run a forbidden check to clear the note. " +
			"Report any remaining gap without claiming completion.",
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

/**
 * The open items of the final "Note check", for `open-checks`: each line marked not proven, changed, dropped, or
 * broken, and each proven line whose evidence Limen cannot find. The note and the reminders share these lines.
 * A check that was sent and not answered is one item.
 */
export function noteCheckOpen(jobDir: string): string[] {
	const lines = noteCheckSection(readOptional(join(jobDir, "result")) ?? "");
	if (!lines) {
		const sent = (readOptional(join(jobDir, "log")) ?? "").includes("] note check sent\n");
		return sent ? ["Note check: missing from the final message"] : [];
	}
	const items = markedItems(lines);
	if (!items.length) {
		return ['Note check: no line reads "<check>: <mark>"'];
	}
	// The transcripts are read once, and only when a proven line needs them.
	let ran: string[] | undefined;
	const worktree = readOptional(join(jobDir, "worktree"))?.trim();
	const seen: Seen = {
		ran: (name) => {
			ran ??= sessionCommands(jobDir);
			const done = ran;
			const wanted = invocations(name);
			return wanted.length > 0 && wanted.every((want) => done.some((run) => sameCommand(run, want)));
		},
		roots: [...(worktree ? [worktree] : []), jobDir, resolve(jobDir, "..", "..", "..")],
	};
	return items.flatMap((item) => openItem(item, seen)).map((line) => clip(line, 160));
}

/** The open items a done job recorded, as wake lines: at most ten, then a count of the rest. */
export function openChecks(jobDir: string): string[] {
	const open = (readOptional(join(jobDir, OPEN)) ?? "").split("\n").filter(Boolean);
	const more = open.length > SHOWN ? [`… ${open.length - SHOWN} more in ${join(jobDir, OPEN)}`] : [];
	return [...open.slice(0, SHOWN).map((line) => `- ${line}`), ...more];
}

type Marked = { readonly name: string; readonly mark: string; readonly said: string; evidence: string };
type Seen = { readonly ran: (name: string) => boolean; readonly roots: readonly string[] };

/** The lines under the first "Note check" heading, up to the next Markdown heading; undefined without one. */
function noteCheckSection(result: string): string[] | undefined {
	const lines = result.split("\n");
	const start = lines.findIndex((line) => /^\s*(?:#{1,6}\s+)?[*_]*note check\b.{0,40}$/i.test(line));
	if (start === -1) {
		return;
	}
	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => /^#{1,6}\s/.test(line));
	return end === -1 ? rest : rest.slice(0, end);
}

/** Each `<check>: <mark>` line, with the indented lines right under it as more evidence. */
function markedItems(lines: readonly string[]): Marked[] {
	const items: Marked[] = [];
	let current: Marked | undefined;
	for (const line of lines) {
		const bare = line
			.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")
			.replace(/\*\*|__/g, "")
			.trim();
		const match = MARKED.exec(bare);
		if (match) {
			const said = (match[3] ?? "").trim();
			current = { name: (match[1] ?? "").trim(), mark: (match[2] ?? "").toLowerCase(), said, evidence: said };
			items.push(current);
		} else if (current && /^\s+\S/.test(line)) {
			current.evidence += `\n${line}`;
		} else {
			current = undefined;
		}
	}
	return items;
}

function openItem(item: Marked, seen: Seen): string[] {
	if (item.mark === "followed") {
		return [];
	}
	if (item.mark !== "proven") {
		return [`${item.name}: ${item.mark}${item.said ? `. ${item.said}` : ""}`];
	}
	const why = missingEvidence(item.evidence, seen);
	return why ? [`${item.name}: not proven. Limen: ${why}`] : [];
}

/** Empty when one backticked name is a command the session ran or a file that exists; otherwise why not. */
function missingEvidence(evidence: string, seen: Seen): string {
	const named = [...evidence.matchAll(/`([^`\n]+)`/g)]
		.map((match) => (match[1] ?? "").trim())
		.filter((name) => /[a-z0-9]/i.test(name));
	if (!named.length) {
		return "it names no command or file in backticks";
	}
	const found = (name: string) => seen.ran(name) || fileExists(name, seen.roots);
	return named.some(found) ? "" : `\`${clip(named[0] ?? "", 60)}\` did not run in this session and is not a file`;
}

/** A path as written, or relative to one of `roots`; a `:line` or `#anchor` suffix is ignored. */
function fileExists(name: string, roots: readonly string[]): boolean {
	const path = name.replace(/^~(?=\/)/, homedir()).replace(/(?::\d+)+(?:-\d+)?$|#.*$/, "");
	return (isAbsolute(path) ? [path] : roots.map((root) => resolve(root, path))).some((each) => existsSync(each));
}

/** Every simple command the job's session transcripts ran, as `invocations` gives them. Pi and OMP write the same. */
function sessionCommands(jobDir: string): string[] {
	const dir = join(jobDir, "session");
	let files: string[] = [];
	try {
		files = readdirSync(dir).filter((name) => name.endsWith(".jsonl"));
	} catch {
		// A job without a transcript ran no command Limen can see.
	}
	const commands: string[] = [];
	for (const line of files.flatMap((file) => (readOptional(join(dir, file)) ?? "").split("\n"))) {
		if (!line.includes('"toolCall"')) {
			continue;
		}
		try {
			const content: unknown = JSON.parse(line)?.message?.content;
			for (const part of Array.isArray(content) ? content : []) {
				if (part?.type === "toolCall" && typeof part.arguments?.command === "string") {
					commands.push(...invocations(part.arguments.command));
				}
			}
		} catch {
			// A torn last line is not a command.
		}
	}
	return commands;
}

/**
 * The simple commands of a shell line, each from its first word: split at an unquoted `;`, `&`, `|`, `(`, `)`, a
 * backtick or a line end, without heredoc bodies and leading assignments or wrappers. Quoted text never starts one,
 * so `echo 'npm test'` does not run `npm test`.
 */
function invocations(line: string): string[] {
	const found: string[] = [];
	let current = "";
	let quote = "";
	let escaped = false;
	for (const char of line.replace(HEREDOC, "$3").replaceAll("\\\n", " ")) {
		if (!(escaped || quote) && ";&|()`\n".includes(char)) {
			found.push(current);
			current = "";
			continue;
		}
		current += char;
		if (escaped) {
			escaped = false;
		} else if (char === "\\" && quote !== "'") {
			escaped = true;
		} else if (char === quote) {
			quote = "";
		} else if (!quote && (char === "'" || char === '"')) {
			quote = char;
		}
	}
	return [...found, current].map((each) => squash(each).replace(PREFIX, "")).filter(Boolean);
}

/** `npm test -- --watch=false` runs `npm test`; `npm testing` does not. */
const sameCommand = (run: string, want: string): boolean => run === want || run.startsWith(`${want} `);
const squash = (text: string): string => text.replace(/\s+/g, " ").trim();
const clip = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** A job folder is `<root>/.limen/jobs/<id>`; the reminders belong to that root. Absent or empty means none. */
function projectReminders(jobDir: string): { readonly path: string; readonly text: string } | undefined {
	const path = join(resolve(jobDir, "..", "..", ".."), REMINDERS);
	const text = readOptional(path)?.trim();
	return text ? { path, text } : undefined;
}
