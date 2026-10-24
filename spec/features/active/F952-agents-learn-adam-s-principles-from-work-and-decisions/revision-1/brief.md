# F952 revision 1: Adam's feedback (2026-10-24 15:19 Warsaw)

Revise the design page ~/Downloads/limen-learning-system.html (same style: monochrome, minimal, no kicker texts, no redundant labels). Do not build or pilot yet. Use the same model group as before if needed (Sol coordinates; Opus on pi-claude/claude-opus-5-5 xhigh; Grok; GLM). Headless check only. Commit the design notes to main with [skip ci] and push.

Adam's words:
- "principles needs to have global file and links to the principles specialized to particular part of a system"
- "decisions are great but we need to settle their format and ensure the file is not bloated"
- "i'd like to have feature maps, those are small notes telling agent about the features and how to navigate them in order to understand them and drive during tests etc - things that are not obvious to read from the code alone."
- "the system has to learn about my principles, way of thinking and understand the project through things more than code alone but navigation through system also needs to be easier for agent because of that"
- "we need to suggest skills that will be used to shape principles and second for refine them. such pair has to be also for the vision and for the feature maps. some of those skills especially refining will need to work on scheduled jobs i will set for myself."

What the revised page must show:
1. Principles: one global file plus linked specialized principle files per system area. Show the link structure and when an agent loads which file.
2. Decisions: a settled entry format (show one real example), size limits, and how the file stays small (e.g. archive, merge into principles, prune superseded). Propose concrete rules.
3. Feature maps: a new note type. Small notes per feature: what it is, entry points, how to navigate it, how to drive it in tests, non-obvious facts not readable from code. Show the format with one real example from limen or alice-app api, and where maps live.
4. Navigation: how an agent goes from task -> global principles -> area principles -> feature map -> decisions -> code. Draw it as a graph.
5. Skill pairs: shape + refine for each of principles, vision, feature maps (six skills). For each: trigger, input, output, who confirms. Mark which refine skills run on a schedule Adam sets himself, and what a scheduled run may do (propose only, Adam confirms).
6. Keep: agents propose, Adam confirms a new principle. No automatic rule promotion.
7. End with the few open choices Adam must make, numbered, one line each.

Report back: page ready, plus the open choices in plain words.
