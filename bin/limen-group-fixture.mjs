#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initCommand } from "../src/commands/init.ts";

const root = process.argv[2] && resolve(process.argv[2]);
if (!root || process.argv.length !== 3) {
	throw new Error("usage: node bin/limen-group-fixture.mjs /absolute/new/disposable/repository");
}
const candidate = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
if (root === candidate || root.startsWith(`${candidate}/`)) {
	throw new Error("fixture must be outside the Limen checkout");
}
await mkdir(root);
function git(...args) {
	const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
	if (result.status !== 0) {
		throw new Error(result.stderr || result.error?.message || "git failed");
	}
	return result.stdout.trim();
}
git("init", "-b", "main");
git("config", "user.name", "Limen Group Proof");
git("config", "user.email", "group-proof@example.test");
// Keep this disposable fixture's seat registration local; never alter the owner's registry.
process.env.LIMEN_HOME = root;
await initCommand([], root);
const feature = "spec/features/active/F001-clamp";
const files = {
	"package.json": JSON.stringify(
		{
			name: "limen-group-proof",
			private: true,
			type: "module",
			scripts: { test: "node --test test/*.test.ts" },
			engines: { node: ">=24" },
		},
		null,
		2,
	),
	".gitignore": "/.limen/\n",
	"README.md":
		"# Disposable group proof\n\nNo remote, finish webhook, or autonomous landing. The teams implement the committed ticket; src/clamp.ts intentionally does not exist yet.\n",
	[`${feature}/ticket.md`]:
		"# F001 · clamp keeps a number inside a range\n\nWrite `clamp(value, min, max)` in `src/clamp.ts`, with no dependencies. It returns `value` when `min <= value <= max`, else the nearer bound. It throws a `RangeError` when any argument is not a finite number or when `min > max`. Run `npm test` and commit `src/clamp.ts` with a passing test run. Keep it short.\n",
	"test/clamp.test.ts": `import assert from "node:assert/strict";
import test from "node:test";
import { clamp } from "../src/clamp.ts";

test("inside, below and above the range", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
  assert.equal(clamp(3, 3, 3), 3);
});
test("bad ranges and non-finite numbers are refused", () => {
  for (const args of [[1, 2, 1], [Number.NaN, 0, 1], [0, Number.NEGATIVE_INFINITY, 1], [0, 0, Number.POSITIVE_INFINITY]]) {
    assert.throws(() => clamp(...args), RangeError);
  }
});
`,
};
for (const [name, content] of Object.entries(files)) {
	const path = `${root}/${name}`;
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, `${content.trimEnd()}\n`, { flag: name === ".gitignore" ? "w" : "wx" });
}
git("add", ".");
git("commit", "-m", "Prepare the group proof ticket");
console.log(
	`Fixture: ${root}\nPacket commit: ${git("rev-parse", "HEAD")}\nNo agents launched. No remote configured.\n\nOpen an INTERACTIVE lead (Herdr coordinator pane, LIMEN_COORDINATOR=1 — not a limen spawn job) in this fixture with:\n  export LIMEN_COORDINATOR=1\n  export LIMEN_PACKAGE=${JSON.stringify(candidate)}\n  export PATH=${JSON.stringify(`${candidate}/bin`)}:$PATH\n  export LIMEN_HOME=${JSON.stringify(root)}\n  cd ${JSON.stringify(root)}\n  pi --no-extensions --extension ${JSON.stringify(`${candidate}/templates/limen-extension.ts`)} --provider openai-codex --model gpt-6.1-sol --thinking xhigh\n\nIn that lead's bash tool (not a separate shell):\n  limen group start ${feature} --detached --timeout 30m \\\n    --team pi:openai-codex/gpt-6.1-sol:high \\\n    --team pi:pi-claude/claude-opus-5-5:high \\\n    --team pi:pi-claude/claude-opus-5-5:high \\\n    --rounds draft,critique,final\n\nRetain the group ID. Then wait: the lead hears the result once, after the final round. Check the round folders, the final branch with npm test, and limen group status ID; then limen group close ID. File evidence against docs/groups.md; transport acceptance is not proof.`,
);
