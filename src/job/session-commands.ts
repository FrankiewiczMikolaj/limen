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
// A chain that holds one of these may skip a later command and still exit 0: `if`, a loop or a function body may not
// run; `exit`, `exec`, or text run by `eval`, `source` or `.` can end the shell; `trap` and `set -n` change what runs.
const STOPPERS = new Set([
	...["if", "then", "else", "elif", "fi", "while", "until", "for", "do", "done", "case", "esac", "select"],
	...["function", "{", "}", "exit", "return", "exec", "logout", "eval", "source", ".", "builtin", "trap", "set"],
]);
// One chain: simple commands joined by `&&` or a pipe. Any other separator starts a list, a subshell or a substitution.
const CHAINED = new Set(["", "&&", "|", "|&"]);

type Piece = { readonly words: string; readonly sep: string };

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
 * The simple commands of one shell call that surely ran: all of them, when the call exited 0 (`ok`) and is one chain
 * of simple commands joined by `&&` or a pipe. Exit 0 of such a chain means each command in it ran. Any other call
 * proves nothing: a `;`, a line end, `||`, `&`, parentheses or backticks may skip a command, and so may a stopper.
 */
function surelyRan(command: string, ok: boolean): string[] {
	const parts = ok ? pieces(command) : [];
	const chain = parts.every(({ words, sep }) => CHAINED.has(sep) && !STOPPERS.has(firstWord(words)));
	return chain ? parts.map(({ words }) => words.replace(PREFIX, "")).filter(Boolean) : [];
}

const firstWord = (words: string): string => words.replace(PREFIX, "").split(" ")[0] ?? "";

/** Splits a shell call at its unquoted separators; each piece keeps the separator before it. Comments are dropped. */
function pieces(command: string): Piece[] {
	// A line end right after `&&` or a pipe continues the chain.
	const text = command
		.replace(HEREDOC, "$3")
		.replaceAll("\\\n", " ")
		.replace(/(&&|\|)[ \t]*\n/g, "$1 ")
		.trim();
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
	const redirect = /[<>]/.test(text.charAt(index - 1)) || (char === "&" && text.charAt(index + 1) === ">");
	return !redirect && ";&|()`\n".includes(char) ? char : "";
}

const squash = (text: string): string => text.replace(/\s+/g, " ").trim();
