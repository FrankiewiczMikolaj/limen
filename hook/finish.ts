import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type PiApi = {
	registerTool?(tool: {
		readonly name: string;
		readonly label: string;
		readonly description: string;
		readonly parameters: object;
		execute(
			toolCallId: string,
			params: { readonly handoff?: string },
			signal: unknown,
			onUpdate: unknown,
			ctx: { shutdown?(): void },
		): Promise<{ content: Array<{ type: "text"; text: string }>; details: object }>;
	}): void;
};

/**
 * `finish` for every Limen job, hosted or detached. A detached job resumed from a hosted session keeps the hosted
 * transcript, and the model calls `finish` again; omp mounts it as `xd://finish`. The handoff becomes the job result,
 * and the session ends after this turn.
 */
export default function limenFinish(pi: PiApi): void {
	const root = process.env.LIMEN_CONTEXT_ROOT;
	const id = process.env.LIMEN_JOB_ID;
	if (process.env.LIMEN_JOB !== "1" || !root || !id) {
		return;
	}
	const jobDir = join(root, ".limen", "jobs", id);
	if (!existsSync(jobDir)) {
		return;
	}
	pi.registerTool?.({
		name: "finish",
		label: "Finish",
		description: "End this job. Pass the handoff text; the job is recorded done and the session exits.",
		parameters: {
			type: "object",
			properties: { handoff: { type: "string", description: "Handoff for the coordinator" } },
			required: ["handoff"],
		},
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const handoff = typeof params?.handoff === "string" ? params.handoff.trim() : "";
			try {
				if (handoff) {
					writeFileSync(join(jobDir, "result"), `${handoff}\n`);
				}
				writeFileSync(join(jobDir, "session-ended"), `${new Date().toISOString()}\n`);
			} catch {
				// The engine's exit still ends the job; only the handoff text is lost.
			}
			ctx.shutdown?.();
			return { content: [{ type: "text", text: "done" }], details: {} };
		},
	});
}
