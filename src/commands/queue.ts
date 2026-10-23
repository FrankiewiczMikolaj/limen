import { queueReport } from "../runtime/start-queue.ts";

/** `limen queue`: the seat's start queue in start order, and the current reading against the gate. */
export async function queueCommand(args: readonly string[]): Promise<void> {
	if (args.length > 0) {
		throw new Error("queue takes no arguments");
	}
	console.log(await queueReport());
}
