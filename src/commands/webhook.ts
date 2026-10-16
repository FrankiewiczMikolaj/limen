import { isAbsolute } from "node:path";
import { finishWebhookEnv, sendTestPing } from "../integrations/finish-webhook.ts";
import { deliverQueued } from "../integrations/webhook-queue.ts";
import { limenRoot } from "../project/git.ts";

/** `limen webhook test` sends one `webhook.test` event to the plant's finish webhook targets through the real sender. */
export async function webhookCommand(args: readonly string[], cwd: string): Promise<void> {
	const [action, dir] = args;
	if (action === "deliver" && args.length === 2 && dir && isAbsolute(dir)) {
		return deliverQueued(dir);
	}
	if (args.length !== 1 || action !== "test") {
		throw new Error("webhook accepts only: test, or deliver <absolute receipt folder>");
	}
	const root = limenRoot(cwd);
	const config = finishWebhookEnv(root, cwd);
	if (!config) {
		throw new Error(
			`no finish webhook config for ${root}: create .limen/finish-webhook.env or set LIMEN_FINISH_WEBHOOK_ENV`,
		);
	}
	const status = sendTestPing(root, config);
	if (status !== 0) {
		process.exitCode = status;
	}
}
