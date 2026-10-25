import { followHighlight, HIGHLIGHT_LEGEND, herdrBinary, highlightOn, saveHighlight } from "../integrations/herdr.ts";
import { registeredProjects } from "../project/seat.ts";

/** `limen highlight [on|off]`: the seat-wide switch that marks Limen's text in Herdr. Live panes follow it by themselves. */
export async function highlightCommand(args: readonly string[]): Promise<void> {
	const [request, ...rest] = args;
	if (rest.length > 0 || (request !== undefined && request !== "on" && request !== "off")) {
		throw new Error("usage: limen highlight [on|off]");
	}
	if (request) {
		saveHighlight(request === "on");
	}
	console.log(`${highlightOn() ? "on" : "off"}\n${HIGHLIGHT_LEGEND}`);
	if (!request) {
		return;
	}
	if (!herdrBinary()) {
		console.log("no open job tab renamed: Herdr is not available");
		return;
	}
	try {
		const renamed = await followHighlight(registeredProjects());
		console.log(`${renamed} open job tab${renamed === 1 ? "" : "s"} renamed`);
	} catch (error) {
		console.log(`open job tabs keep their names: ${error instanceof Error ? error.message : String(error)}`);
	}
}
