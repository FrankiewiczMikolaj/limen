# Review decision

The review proposal is `prompt.txt`, with three examples in `final.md` and `final.json`. The page is `/Users/overment/Downloads/limen-note-shape.html`. No prompt is installed. Adam must approve or revise the text before implementation. Effectiveness is unproven.

## Group record

Group `92c4ecad-6a31-4272-a732-69e2420b9396` completed draft, critique, revise, and final. All ten member jobs recorded done. No route failed or changed. `run.json` records the closed group and each terminal state.

- team-1: `pi:xai/grok-4.7:high`.
- team-2: `pi:openrouter/meta/muse-wonder:high`.
- team-3: `pi:pi-claude/claude-opus-5-5:xhigh`.

The rounds are in `findings/`. Each team's revised text is in `proposals/`. The unedited group final is `proposals/group-final.md` and `proposals/group-final.json`.

## Decisions

- **One missed rule.** Keep the task rule that a quick finish could skip, with its own proof. Passing other checks does not prove it was followed.
- **Open checks.** Muse favored a named Not proven yet line; Opus favored unticked boxes. Keep the short named line. Do not copy the full checks twice.
- **Proof and results.** Keep `Shown by:` for the plan and `Seen:` for the evidence location. A location alone does not prove the check passed. Results stay outside the note.
- **Long lists.** Muse favored every binding check in the note. Grok and Opus favored a pointer. Keep the task list's location and size, then audit every item at finish.
- **Reviewer work.** The teams disagreed on the trusted-resolver example. The coordinator chose Opus's review-shaped outcome. A reviewer can finish with a supported FAIL; it need not make the code satisfy the invariant. The list of every setter remains explicit.

The coordinator edited the group's final text. The proposal drops colored markers, assumption lines, and wording kept only to satisfy current string-matching tests. A missing note is rebuilt from the task, not from memory. The offline rerun remains an explicit end check. The note does not restrict proof to commands already named by the task. It still forbids repeating a run-once check or running a forbidden check. These edits are not a claim of three-team agreement.

## Checks

- Headless Chromium rendered at widths 1280 and 390. Both pages had no horizontal overflow. DOM text matched the proposal and examples exactly. Both screenshots contained only grayscale pixels. Screenshots were read for the visual check.
- All three old notes matched `examples.json` exactly. All task excerpts had three source-derived lines. New notes had five, four, and five lines.
- `npm run check`: TypeScript and Biome passed; 78 of 80 tests passed. The wake test saw one extra wake. The structure test found 131 unique TypeScript names among 228 files.
- The focused repeat passed the wake test and failed the structure test again. The structure scan includes older `.limen/jobs/` evidence with duplicate `probe.ts` and `project.ts` files. No retained evidence was removed. The initial wake failure's cause was not established.
- The runtime, hooks, templates, tests, package files, and Biome config matched published main. No code repair belongs to this proposal.
- `limen picture build --strict` passed with two existing warnings: a missing overlay-test source and the duplicate F778 ticket. Neither warning concerns this feature.

`evidence/` retains the check logs, render metrics, and page checksum. The headless browser exited. The scratch render directory `/tmp/limen-tasks/note-shape-f950-render/` is disposable and is removed after filing. The Downloads page stays for Adam. The feature stays active only for his text decision; the group is closed.
