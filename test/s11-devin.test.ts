// S11 · Devin engine. A devin job pushes its branch, runs as one Devin session (the plant's fetch sink plays the API),
// logs Devin's messages and fast-forwards its worktree from the pushed branch. A session that sleeps or rewrites the
// branch fails the job, `limen stop` and the timeout end the session, and the API key reaches only the request header.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { after, test } from "node:test";
import * as plant from "./plant.ts";

const { git, jobFile, requests, waitJob } = plant;
const KEY = "cog_fake-key-never-logged";
const env = { DEVIN_API_KEY: KEY, DEVIN_ORG_ID: "org-test", LIMEN_DEVIN_POLL_MS: "20" };
const p = await plant.plant();
after(p.cleanup);
const origin = join(p.parent, "remote/acme/demo.git");
git(p.parent, "init", "-q", "--bare", "-b", "main", origin);
git(p.root, "remote", "add", "origin", origin);
git(p.root, "push", "-q", "origin", "main");

/** The fake API: the next session created is `id`; it reports `status` and Devin's messages `said`. */
async function session(id: string, status: string, detail: string, said: readonly string[] = []): Promise<void> {
	const items = ["the prompt", ...said].map((message, n) => ({
		event_id: `${n}`,
		source: n ? "devin" : "user",
		message,
	}));
	await plant.respond(p, [
		{ match: `/sessions/${id}/messages`, body: { items } },
		{ match: `/sessions/${id}`, body: { session_id: id, status, status_detail: detail } },
		{ match: "/sessions", body: { session_id: id, url: `https://app.devin.ai/sessions/${id}` } },
	]);
}
/** Spawns a devin job and returns its id once its session `id` exists. */
async function devinJob(id: string, flags: readonly string[] = []): Promise<string> {
	await session(id, "running", "working");
	const job = plant.spawnJob(p, `Task ${id}`, ["--engine", "devin", ...flags], { env });
	await plant.until(plant.jobDir(p, job), () => jobFile(p, job, "devin-session") === id);
	return job;
}
/** What the session does in the cloud: commit on the job branch and push it, or force-push a rewrite of it. */
function sessionPushes(branch: string, rewrite: boolean): string {
	const clone = join(p.parent, `clone-${branch.replaceAll("/", "-")}`);
	git(p.parent, "clone", "-q", origin, clone);
	git(clone, "checkout", "-q", "-B", branch, `origin/${branch}${rewrite ? "~1" : ""}`);
	git(clone, "-c", "user.name=D", "-c", "user.email=d@x.test", "commit", "-q", "--allow-empty", "-m", "x");
	git(clone, "push", "-q", "--force", "origin", branch);
	return git(clone, "rev-parse", "HEAD");
}

test("a devin job pushes its branch, follows its session and fast-forwards the worktree to the session's commit", async () => {
	const id = await devinJob("a", ["--provider", "linux", "--model", "lite"]);
	const branch = jobFile(p, id, "branch");
	assert.equal(git(origin, "rev-parse", branch), git(p.root, "rev-parse", "HEAD"));
	const pushed = sessionPushes(branch, false);
	await session("a", "running", "finished", ["Working on it.", "Done: one commit."]);
	assert.equal(waitJob(p, id), "done");
	assert.equal(git(jobFile(p, id, "worktree"), "rev-parse", "HEAD"), pushed);
	assert.equal(jobFile(p, id, "result"), "Done: one commit.");
	assert.match(jobFile(p, id, "log"), /devin session a https:\/\/app\.devin\.ai\/sessions\/a\n[\s\S]*Working on it\./);
	assert.doesNotMatch(jobFile(p, id, "log"), /the prompt/);
	const create = requests(p).find((request) => request.method === "POST");
	const { prompt, ...fields } = JSON.parse(create?.body ?? "{}");
	assert.deepEqual(fields, {
		repos: ["acme/demo"],
		title: "Task a",
		tags: ["limen", id],
		platform: "linux",
		devin_mode: "lite",
	});
	assert.match(prompt, new RegExp(`Task a[\\s\\S]*git push origin ${branch}\` only`));
	assert.equal(create?.headers.authorization, `Bearer ${KEY}`);
});

test("a rewritten branch or a sleeping session fails the job; stop and timeout end the session; no file holds the key", async () => {
	const rewritten = await devinJob("b");
	const worktree = jobFile(p, rewritten, "worktree");
	const head = git(worktree, "rev-parse", "HEAD");
	sessionPushes(jobFile(p, rewritten, "branch"), true);
	await session("b", "running", "waiting_for_user", ["Rewrote it."]);
	assert.deepEqual([waitJob(p, rewritten), git(worktree, "rev-parse", "HEAD")], ["failed", head]);
	assert.match(jobFile(p, rewritten, "log"), /failed: devin session b left .* does not fast-forward the worktree/);
	await session("c", "suspended", "inactivity");
	const slept = plant.spawnJob(p, "Task c", ["--engine", "devin"], { env });
	assert.equal(waitJob(p, slept), "failed");
	assert.match(jobFile(p, slept, "log"), /failed: devin session c suspended: inactivity/);
	const stopped = await devinJob("d");
	assert.equal(plant.limen(p, ["stop", stopped]).status, 0);
	const timedOut = await devinJob("e", ["--timeout", "2s"]);
	assert.equal(waitJob(p, timedOut), "failed");
	assert.deepEqual([jobFile(p, stopped, "state"), jobFile(p, timedOut, "state")], ["stopped", "failed"]);
	assert.equal(jobFile(p, stopped, "cleanup"), "", "a Devin wrapper has no engine child to search for escapes");
	const ended = requests(p).flatMap((request) => (request.method === "DELETE" ? [request.url.split("/").at(-1)] : []));
	assert.deepEqual(ended, ["d", "e"]);
	const jobs = join(p.root, ".limen/jobs");
	for (const path of readdirSync(jobs, { recursive: true, encoding: "utf8" }).map((name) => join(jobs, name))) {
		assert.ok(!statSync(path).isFile() || !readFileSync(path, "utf8").includes(KEY), path);
	}
	assert.ok(requests(p).every((request) => !request.body.includes(KEY)));
});
