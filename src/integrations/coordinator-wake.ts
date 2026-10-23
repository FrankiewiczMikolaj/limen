import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { jobMembership } from "../job/group-cabinet.ts";
import { appendLimenLog, atomicWrite, textFile } from "../job/record.ts";
import { completionWake, keeperHint } from "../job/wake-text.ts";
import { herdrBinary } from "./herdr.ts";

const PROMPT_MS = 15_000;
const ATTEMPTS = 2;
// Herdr refuses these before it sends any input; every other failure may follow a submission.
const UNSENT = /\b(agent_blocked|agent_not_found|target_not_found|pane_not_found)\b/;

/**
 * Start a turn on the Herdr pane that spawned this job. Only jobs whose coordinator had no Pi session record
 * `origin-pane`; Pi coordinators keep their in-process wake. A group member never wakes anyone: the group tells its
 * lead once, after its last round (`limen group advance`).
 * Claimed once per job by `notify/herdr-prompt`, which keeps one line per attempt (see `promptPane`), so a coordinator
 * hears its wake once. `notify/delivered/_herdr` is written only when Herdr observed the pane working after submission.
 */
export async function promptCoordinator(jobDir: string, shutdownDeadline = Number.POSITIVE_INFINITY): Promise<void> {
	const pane = await textFile(`${jobDir}/origin-pane`);
	const message = await wakeMessage(jobDir);
	const herdr = herdrBinary();
	if (!message || !pane || !herdr || shutdownDeadline - Date.now() < 1_000) {
		return;
	}
	await mkdir(`${jobDir}/notify`, { recursive: true });
	try {
		await writeFile(`${jobDir}/notify/herdr-prompt`, `attempting ${pane} ${new Date().toISOString()}\n`, {
			flag: "wx",
			flush: true,
		});
	} catch {
		return; // Another finalizer already owns this wake.
	}
	const ok = await promptPane(herdr, pane, message, shutdownDeadline, `${jobDir}/notify/herdr-prompt`, (line) =>
		appendLimenLog(jobDir, `coordinator wake via Herdr: ${line}`),
	);
	if (ok) {
		await mkdir(`${jobDir}/notify/delivered`, { recursive: true });
		await writeFile(`${jobDir}/notify/delivered/_herdr`, `${new Date().toISOString()}\n`, {
			flag: "wx",
			flush: true,
		}).catch(() => {});
	}
}

/**
 * Prompt one Herdr pane after the caller claimed `receipt`, and keep one receipt line per attempt; `note` hears each
 * attempt as it ends. Only an attempt Herdr refused before it sent any input is tried again, at most twice; text that
 * may have reached the pane is never sent again. True when Herdr observed the pane working after submission.
 */
export async function promptPane(
	herdr: string,
	pane: string,
	message: string,
	deadline: number,
	receipt: string,
	note: (line: string) => Promise<void> = async () => {},
): Promise<boolean> {
	const lines: string[] = [];
	let ok = false;
	for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
		const budget = Math.min(PROMPT_MS, deadline - Date.now());
		if (budget < 1_000) {
			lines.push("no time left for another attempt; deliver this text to the pane deliberately");
			break;
		}
		const wait = String(Math.max(budget - 2_000, 1_000));
		const outcome = await run(
			herdr,
			["agent", "prompt", pane, message, "--wait", "--until", "working", "--until", "blocked", "--timeout", wait],
			budget,
		);
		const result = outcome.ok
			? `turn observed on ${pane}`
			: /agent_prompt_stalled/.test(outcome.detail)
				? `delivered to ${pane}, turn not seen`
				: UNSENT.test(outcome.detail)
					? `not sent to ${pane}: ${outcome.detail}`
					: `may have reached ${pane}, turn not seen (${outcome.detail}); not resent`;
		lines.push(`attempt ${attempt}: ${result} ${new Date().toISOString()}`);
		await note(`attempt ${attempt}: ${result}`);
		if (outcome.ok) {
			ok = true;
			break;
		}
		if (!UNSENT.test(outcome.detail)) {
			break;
		}
		if (attempt < ATTEMPTS) {
			await atomicWrite(receipt, `attempting ${pane}\n${lines.join("\n")}\n`);
		} else {
			lines.push(
				`automatic delivery stopped after ${ATTEMPTS} attempts Herdr did not send; deliver this text to the pane deliberately`,
			);
		}
	}
	await atomicWrite(receipt, `${lines.join("\n")}\n`);
	return ok;
}

async function wakeMessage(jobDir: string): Promise<string | undefined> {
	const [label = "", state = "", branch = "", repo = ""] = await Promise.all(
		["label", "state", "branch", "repo"].map((name) => textFile(`${jobDir}/${name}`)),
	);
	const id = jobDir.split("/").at(-1) ?? "";
	const membership = await jobMembership(jobDir);
	if (!membership) {
		const keeper = state === "done" ? ` ${keeperHint(jobDir, id)}` : "";
		const instruction = `Start with \`limen jobs ${id}\`. Inspect its diff, commits, final message, and checks before landing. If a check blocks landing, name that check and resume a focused fix.${keeper} Keep the user informed; ask only when a genuine product decision needs them.`;
		return completionWake(jobDir, label || id, state, id, branch, repo, false, instruction);
	}
	await appendLimenLog(
		jobDir,
		`coordinator wake via Herdr: not sent; group ${membership.run.id} tells its lead once, after its last round`,
	);
	return;
}

function run(
	binary: string,
	args: readonly string[],
	timeout: number,
): Promise<{ readonly ok: boolean; readonly detail: string }> {
	const { promise, resolve } = Promise.withResolvers<{ readonly ok: boolean; readonly detail: string }>();
	execFile(binary, args, { encoding: "utf8", timeout }, (error, stdout, stderr) => {
		// error.message repeats the full argv, wake text included; the receipt keeps Herdr's own first line instead.
		const said = `${stderr || ""}${stdout || ""}`.trim().split("\n")[0] ?? "";
		const detail = error?.killed
			? `herdr exceeded ${timeout}ms`
			: said || (error ? `herdr exited ${error.code ?? "abnormally"}` : "");
		resolve({ ok: !error, detail });
	});
	return promise;
}
