// U13: after an edit, a spawn or a merge, the tool result asks for the guidance lines that apply and are still unread:
// path and language sections of the styleguide only for matching files, once per area until compaction, never after a
// failed edit, and not again once the agent read those lines with OMP selectors or Pi offsets.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import limenCommunication from "../hook/communication.ts";

const STYLE =
	"# Styleguide\n\nKeep it small.\n\n## `crates/core`\n\nOne owner.\n\n## `web/`\n\nRunes.\n\n## Rust\n\nTyped errors.\n\n## Frontend\n\nNo fetch.\n";

async function project(t: test.TestContext) {
	const cwd = await mkdtemp(join(tmpdir(), "u13-"));
	t.after(() => rm(cwd, { recursive: true, force: true }));
	await mkdir(join(cwd, ".agents/limen"), { recursive: true });
	await mkdir(join(cwd, "spec"));
	await writeFile(join(cwd, ".agents/limen/styleguide.md"), STYLE);
	await writeFile(join(cwd, "spec/vision.md"), "# Vision\n\n## Principles\n\nOne owner.\n");
	process.env.LIMEN_JOB = "1";
	delete process.env.LIMEN_CONTEXT_ROOT;
	const handlers = new Map<string, unknown>();
	limenCommunication({ on: (name: string, handler: unknown) => handlers.set(name, handler) });
	const call = (name: string, ...args: unknown[]) => {
		const handler = handlers.get(name);
		return typeof handler === "function" ? handler(...args) : undefined;
	};
	const tool = (toolName: string, input: Record<string, unknown>, isError = false): string => {
		const patch = call("tool_result", { toolName, input, isError, content: [{ type: "text", text: "ok" }] }, { cwd });
		return patch?.content.at(-1)?.text?.split("\n\n").at(-1) ?? "";
	};
	return { tool, compact: () => call("session_compact") };
}

test("a code edit asks for the unread styleguide lines that apply, once per area", async (t) => {
	const { tool, compact } = await project(t);
	const rust = tool("edit", { path: "crates/core/src/a.rs" });
	assert.match(rust, /read \.agents\/limen\/styleguide\.md lines 1-8, 13-16 now, before your next edit/);
	assert.match(rust, /crates\/core\/src\/a\.rs, including the sections `crates\/core`, Rust\./);
	assert.equal(tool("edit", { path: "crates/core/src/b.rs" }), "", "same area, already asked");
	assert.match(tool("write", { path: "web/app.ts" }), /lines 1-4, 9-12, 17-19 now.*`web\/`, Frontend\./);
	tool("read", { path: ".agents/limen/styleguide.md:1-12" });
	tool("read", { path: ".agents/limen/styleguide.md", offset: 13, limit: 7 });
	assert.equal(tool("edit", { path: "crates/io/c.rs" }), "", "every line that applies was read");
	compact();
	assert.equal(tool("edit", { path: "web/x.ts" }, true), "", "a failed edit asks nothing");
	assert.match(tool("edit", { path: "web/x.ts" }), /lines 1-4, 9-12, 17-19 now/);
});

test("a spec edit asks once for the Specs section; a worker's merge of main asks nothing", async (t) => {
	const { tool } = await project(t);
	assert.match(tool("write", { path: "spec/features/planned/F1-x/ticket.md" }), /Specs: read \S+ lines \d+-\d+ now/);
	assert.equal(tool("edit", { path: "spec/build.md" }), "");
	assert.equal(tool("bash", { command: "git merge main" }), "");
	assert.match(tool("bash", { command: "limen spawn --engine omp x" }), /Vision: read spec\/vision\.md lines 1-5 now/);
});
