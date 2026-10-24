import { readdirSync } from "node:fs";
import { join } from "node:path";
import { readOptional } from "../project/inherit.ts";

// Which shell commands a job's session surely ran, so a "Note check" line marked proven can name one as its evidence.
// Limen reads the recorded tool calls and their results; it never runs or replays them.

// A heredoc body is data, not commands: `<<'EOF'` up to the line that ends it, or to the end of an unfinished one.
// The rest of the opening line stays.
const HEREDOC = /<<-?[ \t]*(['"]?)([A-Za-z_]\w*)\1([^\n]*)\n[\s\S]*?(?:\n[ \t]*\2[ \t]*(?=\n|$)|$)/g;
// Leading assignments, `!` and wrappers do not change which command runs: `CI=1 timeout 60 npm test` runs `npm test`.
const PREFIX = /^(?:[A-Za-z_]\w*=\S*\s+|!\s+|(?:time|nohup|env|command)\s+|timeout\s+\S+\s+)+/;
// A body of these may never run; the condition of `if` or `while` counts as inside too.
const OPENERS = new Set(["if", "while", "until", "for", "case", "select", "function", "{"]);
const CLOSERS = new Set(["fi", "done", "esac", "}"]);
// After one of these, later lists of the call may never start, even when the call exits 0.
const ENDERS = new Set(["exit", "return", "exec", "logout"]);

type Piece = { readonly words: string; readonly sep: string };
type Placed = {
	readonly words: string;
	readonly list: number;
	readonly gated: boolean;
	readonly nested: boolean;
	readonly or: boolean;
	readonly inside: boolean;
	readonly ends: boolean;
};

/** Every simple command that surely ran in the job's session transcripts (`surelyRan`). Pi and OMP write the same. */
export function sessionCommands(jobDir: string): string[] {
	const calls: { readonly id: unknown; readonly command: string }[] = [];
	const ok = new Set<string>();
	for (const line of transcriptLines(jobDir)) {
		let message: { role?: unknown; toolCallId?: unknown; isError?: unknown; content?: unknown } | undefined;
		try {
			message = JSON.parse(line)?.message;
		} catch {
			continue; // A torn last line is not a call.
		}
		if (message?.role === "toolResult" && message.isError === false && typeof message.toolCallId === "string") {
			ok.add(message.toolCallId);
		}
		for (const part of Array.isArray(message?.content) ? message.content : []) {
			if (part?.type === "toolCall" && typeof part.arguments?.command === "string") {
				calls.push({ id: part.id, command: part.arguments.command });
			}
		}
	}
	return calls.flatMap(({ id, command }) => surelyRan(command, typeof id === "string" && ok.has(id)));
}

/** True when each simple command of `named` starts one that surely ran: `npm test -- --grep x` runs `npm test`. */
export function ranAll(ran: readonly string[], named: string): boolean {
	const wanted = pieces(named)
		.map((piece) => piece.words.replace(PREFIX, ""))
		.filter(Boolean);
	return wanted.length > 0 && wanted.every((want) => ran.some((run) => run === want || run.startsWith(`${want} `)));
}

function transcriptLines(jobDir: string): string[] {
	const dir = join(jobDir, "session");
	let files: string[] = [];
	try {
		files = readdirSync(dir).filter((name) => name.endsWith(".jsonl"));
	} catch {
		// A job without a transcript ran no command Limen can see.
	}
	return files
		.flatMap((file) => (readOptional(join(dir, file)) ?? "").split("\n"))
		.filter((line) => line.includes('"toolCall"') || line.includes('"toolResult"'));
}

/**
 * The simple commands of one shell call that surely ran. Each top-level list (split at `;`, `&` and line ends outside
 * parentheses and backticks) starts when the call reaches it. A command after `&&` or `||`, or inside `if`, a loop,
 * `case`, braces or a function, may be skipped. A call that exited 0 (`ok`) also ran every top-level command of its
 * last list when that list has no `||`; inside parentheses or backticks an `&&` does not set the call's exit status.
 * A failed or unknown call proves only its first list before any `&&` or `||`, and so does a call with `exit`,
 * `return` or `exec` anywhere.
 */
function surelyRan(command: string, ok: boolean): string[] {
	const placed = place(pieces(command));
	const last = placed.at(-1)?.list ?? 0;
	const lastOr = placed.some((each) => each.list === last && each.or);
	const ended = placed.some((each) => each.ends);
	const started = (each: Placed) => each.list === 0 || (ok && !ended);
	const reached = (each: Placed) => !each.gated || (ok && !ended && !each.nested && each.list === last && !lastOr);
	return placed
		.filter((each) => each.words && !each.inside && started(each) && reached(each))
		.map((each) => each.words);
}

/** Each piece with its top-level list, whether an `&&` or `||` gates it, and its nesting. */
function place(parts: readonly Piece[]): Placed[] {
	let list = 0;
	let depth = 0;
	let nest = 0;
	let tick = false;
	let gated = false;
	return parts.map(({ words, sep }) => {
		nest = Math.max(0, nest + (sep === "(" ? 1 : 0) - (sep === ")" ? 1 : 0));
		tick = sep === "`" ? !tick : tick;
		const nested = nest > 0 || tick;
		if (!nested && (sep === ";" || sep === "\n" || sep === "&")) {
			list += 1;
			gated = false;
		}
		gated ||= sep === "&&" || sep === "||";
		const first = words.split(" ")[0] ?? "";
		const inside = depth > 0 || OPENERS.has(first);
		if (OPENERS.has(first)) {
			depth += 1;
		} else if (CLOSERS.has(first)) {
			depth = Math.max(0, depth - 1);
		}
		return { words: words.replace(PREFIX, ""), list, gated, nested, or: sep === "||", inside, ends: ENDERS.has(first) };
	});
}

/** Splits a shell call at its unquoted separators; each piece keeps the separator before it. Comments are dropped. */
function pieces(command: string): Piece[] {
	const text = command.replace(HEREDOC, "$3").replaceAll("\\\n", " ");
	const found: Piece[] = [];
	let current = "";
	let sep = "";
	let quote = "";
	let escaped = false;
	for (let index = 0; index < text.length; index += 1) {
		// An unquoted `#` that starts a word begins a comment, which runs to the line end.
		if (!(quote || escaped) && text.charAt(index) === "#" && /^$|[\s;&|()]/.test(text.charAt(index - 1))) {
			const end = text.indexOf("\n", index);
			index = (end === -1 ? text.length : end) - 1;
			continue;
		}
		const next = quote || escaped ? "" : separator(text, index);
		if (next) {
			found.push({ words: squash(current), sep });
			current = "";
			sep = next;
			index += next.length - 1;
			continue;
		}
		const char = text.charAt(index);
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
	found.push({ words: squash(current), sep });
	return found;
}

/** The separator at `index`: `&&`, `||`, `|&`, `;`, `&`, `|`, `(`, `)`, a backtick or a line end. `2>&1` redirects. */
function separator(text: string, index: number): string {
	const pair = text.slice(index, index + 2);
	if (pair === "&&" || pair === "||" || pair === "|&") {
		return pair;
	}
	const char = text.charAt(index);
	const redirect =
		/[<>]/.test(text.charAt(index - 1)) ||
		(char === "&" && text.charAt(index + 1) === ">") ||
		!";&|()`\n".includes(char);
	return redirect ? "" : char;
}

const squash = (text: string): string => text.replace(/\s+/g, " ").trim();
