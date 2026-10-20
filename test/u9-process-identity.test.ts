// U9: a recorded process is the same process only while its pid and its birth both match. A recycled pid with another
// birth is a stranger: containment never signals it and names it in the cleanup note; the recorded birth is signaled.
// The reaper treats a stranger at a job's pid as a dead owner; on macOS a sweep reuses a matched birth for 30 s.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { containEscapedDescendants, processInfo } from "../src/runtime/contain.ts";
import { ownerAlive, reapDeadJobs } from "../src/runtime/reap.ts";

// The real identity query, with a deadline that load cannot miss (the product's one-second default can, and then
// counts the process as unknown).
const query = (pid: number) => processInfo(pid, Date.now() + 60_000);

test("a recycled pid with another birth is never signaled and is named for cleanup; the recorded birth is signaled", async (t) => {
	const job = await mkdtemp(join(tmpdir(), "u9-"));
	const child = spawn(process.execPath, ["-e", "Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0)"], {
		detached: true,
		stdio: "ignore",
	});
	t.after(() => rm(job, { recursive: true, force: true }));
	t.after(() => child.kill("SIGKILL"));
	const exited = once(child, "exit");
	const info = await query(child.pid ?? 0);
	assert.equal(info.kind, "present");
	if (info.kind !== "present") {
		return;
	}
	await containEscapedDescendants(job, [{ ...info.process, born: "0.000000" }], "u9", { query });
	assert.deepEqual([child.exitCode, child.signalCode], [null, null], "the stranger is still running");
	assert.match(await readFile(join(job, "cleanup"), "utf8"), new RegExp(`^${info.process.pid} 0\\.000000 `, "m"));
	await containEscapedDescendants(job, [info.process], "u9", { query });
	assert.deepEqual(await exited, [null, "SIGTERM"]);
});

test("a sweep reuses a matched birth for 30 s on macOS; the reaper still finalizes a dead owner and a stranger at its pid", async (t) => {
	const jobs = await mkdtemp(join(tmpdir(), "u9-jobs-"));
	t.after(() => rm(jobs, { recursive: true, force: true }));
	const child = spawn(process.execPath, ["-e", "Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0)"], {
		stdio: "ignore",
	});
	t.after(() => child.kill("SIGKILL"));
	const exited = once(child, "exit");
	const info = await query(child.pid ?? 0);
	assert.equal(info.kind, "present");
	if (info.kind !== "present") {
		return;
	}
	const record = async (id: string, pid: number, born: string) => {
		await mkdir(join(jobs, id));
		await writeFile(join(jobs, id, "state"), "running\n");
		await writeFile(join(jobs, id, "pid"), `${pid}\n`);
		await writeFile(join(jobs, id, "born"), `${born}\n`);
		return join(jobs, id);
	};
	const owner = await record("owner", info.process.pid, info.process.born);
	const stranger = await record("stranger", process.pid, "1.000000"); // this live process is not that birth
	let queries = 0;
	const counted = (pid: number) => {
		queries += 1;
		return query(pid);
	};
	const t0 = Date.now();
	for (let now = t0; now < t0 + 30_000; now += 500) {
		assert.equal(await ownerAlive(owner, now, counted), true);
	}
	assert.equal(queries, process.platform === "linux" ? 60 : 1, "birth queries in 60 sweeps over 30 s");
	assert.equal(await ownerAlive(owner, t0 + 30_000, counted), true);
	assert.equal(queries, process.platform === "linux" ? 61 : 2, "the birth is checked again after 30 s");
	assert.equal(await ownerAlive(stranger, t0, query), false, "a live pid with another birth is not the owner");
	child.kill("SIGKILL");
	await exited;
	assert.equal((await processInfo(info.process.pid, 0)).kind, "absent", "a gone pid needs no helper and no time");
	const seen = new Map<string, number>();
	await reapDeadJobs(jobs, seen, t0 + 31_000);
	assert.deepEqual([...seen.keys()].sort(), ["owner", "stranger"]);
	await reapDeadJobs(jobs, seen, t0 + 91_000);
	assert.equal(await readFile(join(owner, "state"), "utf8"), "failed\n");
	assert.equal(await readFile(join(stranger, "state"), "utf8"), "failed\n");
});
