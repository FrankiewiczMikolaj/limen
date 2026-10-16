// S7 · Webhooks. One plant: a job spawned before any config sends nothing; then two targets and an author map route
// each terminal ping, through the real sender helper, to the target of the ticket's author, with the secret only in the
// Authorization header; a slow, busy, refusing or crashed delivery still ends with every target answered for good; a
// coordinator's turn end pings once.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { coordinatorSignals, sweepCoordinators } from "../src/integrations/coordinator-signal.ts";
import { git, jobDir, jobFile, limen, plant, type Run, requests, respond, until } from "./plant.ts";

const p = await plant();
after(p.cleanup);
const SECRETS = ["Bearer s7-secret-one", "Bearer s7-secret-two"];
const URLS = ["https://hooks.s7.test/one", "https://hooks.s7.test/two"];
const runs: Run[] = [];
const run = (args: string[], cwd?: string) => {
	const result = limen(p, args, cwd ? { cwd } : {});
	runs.push(result);
	assert.equal(result.status, 0, result.stderr);
	return result.stdout.trim().split("\n").at(-1) ?? "";
};
const ids: string[] = [];
const spawn = (task: string, label: string) => {
	const id = run(["spawn", "--label", label, task]);
	ids.push(id);
	return id;
};
const wait = (id: string) => {
	const result = limen(p, ["wait", id]);
	runs.push(result);
	return result.stdout.split(" ")[0]?.toLowerCase();
};
const payloads = () => requests(p).map((request) => ({ url: request.url, body: JSON.parse(request.body) }));
// The finish path writes its final result line after the sender exits; every request it made is recorded by then.
const settled = (id: string) =>
	until(p.parent, () => /^(accepted|failed|skipped)/.test(jobFile(p, id, "finish-webhook")));

async function ticket(code: string, author: string, lane = "active"): Promise<string> {
	const path = `spec/features/${lane}/${code}-s7/ticket.md`;
	await mkdir(join(p.root, dirname(path)), { recursive: true });
	await writeFile(join(p.root, path), `---\ntouches:\n  - demo.place\nopened: 2026-10-06\n---\n\n# ${code} · S7\n`);
	git(p.root, "add", path);
	git(p.root, "commit", "-q", "--author", author, "-m", `ticket ${code}`);
	return path;
}

// Spawned before any config exists: the job records no config, so nothing can ever send for it.
const quiet = spawn("commit", "S7 quiet");
const BOB = "Bob <2+bob@users.noreply.github.com>";
const planned = await ticket("F002", "Alice <1+alice@users.noreply.github.com>", "planned");
const bob = await ticket("F003", BOB);
// Bob edits Alice's ticket and moves it to active: Alice still filed it, so her pings stay hers.
const alice = planned.replace("planned", "active");
git(p.root, "mv", dirname(planned), dirname(alice));
await appendFile(join(p.root, alice), "\nBob's edit.\n");
git(p.root, "commit", "-q", "-a", "--author", BOB, "-m", "Bob moves and edits F002");
await writeFile(
	join(p.root, ".limen/finish-webhook.env"),
	`LIMEN_FINISH_WEBHOOK_TARGETS='${JSON.stringify(URLS.map((url, index) => ({ url, auth: SECRETS[index] })))}'\nLIMEN_FINISH_WEBHOOK_AUTHOR_TARGETS='{"@alice":[1],"@bob":[2]}'\n`,
);

test("an unconfigured job records no config and sends nothing", () => {
	assert.equal(wait(quiet), "done");
	assert.equal(jobFile(p, quiet, "finish-webhook-env"), "");
	assert.equal(jobFile(p, quiet, "finish-webhook-attempt"), "");
	assert.deepEqual(requests(p), []);
});

test("a done job pings only the target its ticket author maps to", async () => {
	const id = spawn(`Ticket: ${alice}\ncommit`, "S7 alice");
	assert.equal(wait(id), "done");
	await settled(id);
	const [ping, ...rest] = payloads();
	assert.deepEqual(rest, []);
	assert.equal(ping?.url, URLS[0]);
	assert.equal(ping?.body.event, "job.done");
	assert.equal(ping?.body.jobId, id);
	assert.equal(requests(p)[0]?.headers.authorization, SECRETS[0]);
	assert.equal(jobFile(p, id, "finish-webhook-route"), "mapped @alice -> 1");
});

test("a continuation from a subdirectory keeps the parent's config and author route", async () => {
	const parent = ids[1] ?? "";
	const id = run(["continue", parent, "say continued"], join(p.root, "spec"));
	ids.push(id);
	assert.notEqual(id, parent);
	assert.equal(wait(id), "done");
	assert.equal(jobFile(p, id, "finish-webhook-env"), jobFile(p, parent, "finish-webhook-env"));
	assert.equal(jobFile(p, id, "finish-webhook-author"), jobFile(p, parent, "finish-webhook-author"));
	await settled(id);
	const sent = payloads().filter((ping) => ping.body.jobId === id);
	assert.deepEqual(
		sent.map((ping) => ping.url),
		[URLS[0]],
	);
	assert.equal(jobFile(p, id, "finish-webhook-route"), "mapped @alice -> 1");
});

test("a failed job's ping reaches each target until it answers for good, and never twice after it accepted", async () => {
	const urls = ["slow", "busy", "gone"].map((name) => `https://hooks.s7.test/${name}`);
	const targets = urls.map((url) => ({ url, auth: SECRETS[0] }));
	await writeFile(
		join(p.root, ".limen/finish-webhook.env"),
		`LIMEN_FINISH_WEBHOOK_TARGETS='${JSON.stringify(targets)}'\n`,
	);
	// Slower than the old 3 s budget; busy twice; a refusal that echoes the request, which no retry changes.
	await respond(p, [
		{ match: "/slow", delayMs: 5_000, body: {} },
		{ match: "/busy", status: 503, upTo: 2, body: { error: "busy" } },
		{ match: "/gone", status: 404, body: { error: `no automation for s7-secret-one at ${urls[2]}` } },
	]);
	const id = spawn(`Ticket: ${bob}\nsay\nfail 3`, "S7 bob");
	assert.equal(wait(id), "failed");
	assert.equal(jobFile(p, id, "result"), "");
	await settled(id);
	const ping = payloads().find((sent) => sent.body.jobId === id)?.body;
	assert.deepEqual([ping?.event, ping?.plant, Boolean(ping?.reason)], ["job.failed", "repo", true]);
	assert.match(jobFile(p, id, "finish-webhook"), /^failed: target 3 HTTP 404 .*; not retried/);
	const receipts = jobFile(p, id, "finish-webhook-targets")
		.split("\n")
		.map((line) => JSON.parse(line));
	const answers = (target: number) =>
		receipts.filter((r) => r.target === target && r.transport !== "pending").map((r) => `${r.http} ${r.body ?? ""}`);
	assert.deepEqual(
		[answers(1), answers(2), answers(3)],
		[
			["200 "],
			['503 {"error":"busy"}', '503 {"error":"busy"}', "200 "],
			['404 {"error":"no automation for [auth] at [url]"}'],
		],
	);
	// A resend of the settled ping is what the next limen command, sweep or wake hook would run; it sends nothing.
	run(["webhook", "deliver", jobDir(p, id)]);
	assert.deepEqual(
		urls.map((url) => requests(p).filter((request) => request.url === url).length),
		[1, 3, 1],
	);
});

test("a ping whose deliverer was killed mid-send goes out with the next limen command", async () => {
	const url = "https://hooks.s7.test/later";
	await writeFile(
		join(p.root, ".limen/finish-webhook.env"),
		`LIMEN_FINISH_WEBHOOK_TARGETS='[{"url":"${url}","auth":"${SECRETS[1]}"}]'\n`,
	);
	await respond(p, [{ match: "/later", delayMs: 5_000, upTo: 1, body: {} }]);
	const id = spawn("commit", "S7 crashed");
	assert.equal(wait(id), "done");
	await until(p.parent, () => requests(p).some((request) => request.url === url));
	process.kill(Number(jobFile(p, id, "finish-webhook-lease")), "SIGKILL");
	run(["jobs"]);
	await settled(id);
	assert.match(jobFile(p, id, "finish-webhook"), /^accepted: every target accepted after 1 try/);
	run(["webhook", "deliver", jobDir(p, id)]);
	assert.equal(requests(p).filter((request) => request.url === url).length, 2);
});

test("no secret or target URL leaves the request header, and nothing names the quiet job", () => {
	assert.equal(requests(p).length, 9);
	assert.ok(
		requests(p).every(
			(request) =>
				request.url.startsWith("https://hooks.s7.test/") && SECRETS.includes(request.headers.authorization ?? ""),
		),
	);
	assert.ok(payloads().every((ping) => ping.body.jobId !== quiet));
	const leaks = (text: string) =>
		[...SECRETS.map((secret) => secret.slice(7)), "hooks.s7.test"].filter((value) => text.includes(value));
	for (const request of requests(p)) {
		assert.deepEqual(
			leaks(JSON.stringify({ ...request, url: "", headers: { ...request.headers, authorization: "" } })),
			[],
		);
	}
	for (const result of runs) {
		assert.deepEqual(leaks(result.stdout + result.stderr), []);
	}
	for (const id of ids) {
		for (const entry of readdirSync(jobDir(p, id), { recursive: true, withFileTypes: true })) {
			if (entry.isFile()) {
				assert.deepEqual(
					leaks(readFileSync(join(entry.parentPath, entry.name), "utf8")),
					[],
					join(entry.parentPath, entry.name),
				);
			}
		}
	}
});

test("each coordinator turn end pings once with its last message and ticket, also after a normal exit", async () => {
	const url = "https://hooks.s7.test/coordinator";
	const config = join(p.parent, "coordinator.env");
	await writeFile(config, `LIMEN_FINISH_WEBHOOK_URL='${url}'\nLIMEN_FINISH_WEBHOOK_AUTH='${SECRETS[0]}'\n`);
	// The hook runs here as inside an engine; its deliverers inherit the plant's fetch sink.
	process.env = { ...p.env, LIMEN_COORDINATOR: "1", LIMEN_FINISH_WEBHOOK_ENV: config };
	const session = "s7-coordinator";
	const signals = coordinatorSignals();
	signals.start(p.root, { cwd: p.root, sessionManager: { getSessionId: () => session } });
	// Pi ends a turn with agent_end and agent_settled; each, or an idle without new work, is one more end.
	const turn = (text: string) => {
		signals.messageEnd("toolUse", "Reading the board.");
		signals.messageEnd("stop", text);
		signals.settled();
		signals.settled();
	};
	turn("## Report written; F003 waits on your decision.\nDetails below.");
	const job = join(p.root, ".limen/jobs/s7-owned");
	await mkdir(join(job, "notify/subscribers", session), { recursive: true });
	await writeFile(join(job, "state"), "running\n");
	turn("Waiting for the worker; its wake brings me back.");
	await writeFile(join(job, "state"), "done\n");
	turn("Landed; nothing left.");
	// A normal exit: the sweep removes the registration while the last ping may still wait in the queue.
	signals.shutdown();
	await writeFile(join(p.root, ".limen/coordinators", session, "pid"), `${spawnSync("true").pid}\n`);
	await sweepCoordinators(p.root);
	assert.equal(existsSync(join(p.root, ".limen/coordinators", session)), false);
	await until(p.parent, () => requests(p).filter((request) => request.url === url).length === 2);
	const sent = payloads().filter((ping) => ping.url === url);
	assert.deepEqual(sent.map((ping) => [ping.body.event, ping.body.title, ping.body.reason]).sort(), [
		["coordinator.idle", "coordinator s7-coordinator · F003", "turn ended; last message: Landed; nothing left."],
		[
			"coordinator.idle",
			"coordinator s7-coordinator · F003",
			"turn ended; last message: Report written; F003 waits on your decision.",
		],
	]);
	assert.equal(readdirSync(join(p.root, ".limen/coordinator-events", session)).length, 2);
});
