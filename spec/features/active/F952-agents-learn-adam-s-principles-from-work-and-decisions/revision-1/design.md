# Learning-system design after Adam's first review

The revised page is `/Users/overment/Downloads/limen-learning-system.html`. It replaces the first page's project-local principle register and three-skill proposal with a global-to-area structure, bounded decisions, feature maps and six shape/refine skills. This is design only: no principle file, map, skill, schedule, implementation or pilot was installed.

## Proposed structure

- One private owner-wide `~/.overment/principles.md` holds general judgment and links to project areas. Its proposed location and cross-project scope remain an explicit owner choice.
- `<project>/spec/principles/<area>.md` links to the applicable global heading, gives local scope and confirmed exceptions, and links to relevant feature maps. Global and area principle text each stay under 500 words; the global area directory is separate from its principle text.
- `spec/decisions.md` uses one fixed eight-line entry: dated heading and stable anchor; state/actor/scope; choice; recorded reason; versioned source; current homes; typed links; replacement. Each entry is at most 100 words. The live file is at most 20 entries or 200 nonblank lines, whichever comes first.
- Before the live log would exceed its limit, move the oldest entries into `spec/decisions/archive/YYYY-MM.md`. Preserve identity, source, state and replacement, and repair incoming links in the same change. Archive does not mean rejected. Duplicate cases may share one scoped ruling; promotion into a principle still needs Adam. No owner evidence is deleted.
- `spec/feature-maps/<feature-name>.md` describes one capability, not one ticket. It has purpose, entry points, navigation, focused test driving and expected evidence, non-obvious operating facts, limits, related maps/decisions and a checked source revision. Limit: 350 words and 60 nonblank lines.

The page shows a source-checked Limen task-note decision and feature-map example at main `4101fe5b952b40a904e53c92550e7376ccbac6ae`. The map names the focused U14 fixture command, but no product test was run. Owner-approved wording, canonical-root reminders, the two finish calls and fixture proof limits are the non-obvious facts. The separate open-note evidence repair (F953) remains unlanded and outside this example.

## Retrieval and skills

The graph routes task → global principles → relevant area principles → feature map → linked decisions → code and focused tests. Existing guidance, permission and precedence still apply. A global source is loaded once; unrelated areas and the full decision history stay unloaded.

Six proposed skills: `shape-principles`, `refine-principles`, `shape-vision`, `refine-vision`, `shape-feature-maps`, `refine-feature-maps`. Each page row names its trigger, input, proposed output and confirmation owner. Adam confirms every new principle, vision change and scheduled refinement proposal. The coordinator checks sources and applies approved changes; observations do not become intent automatically.

Adam may schedule all three refine skills himself. Each schedule must name its project, sources, exact route, budget and output. A run reads named sources and writes at most five sourced proposals plus overflow to `spec/learning/YYYY-MM-DD-<skill>.md`. It cannot mutate canonical guidance, self-approve, commit, push, start apps, run tests without authority or substitute a model after a limit. None is enabled now.

## Open choices

1. Use the proposed private owner-wide global file, with area files in each project?
2. Permit named coordinator-conversation reads per refine job, rather than broad transcript access?
3. Which cadence, exact route and budget will Adam set for each refine skill?

The source feedback is retained verbatim in [brief.md](brief.md). Rendering evidence is in [checks.md](checks.md). Coordinator scratch: `/tmp/limen-learning-system-revise-1-check/`, removed after filing. The HTML stays outside Git.
