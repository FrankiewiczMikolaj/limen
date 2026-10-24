The group recommends two source-linked knowledge files, three skills and coordinator-led capture, with an opt-in audit timer. Existing guidance keeps its authority. The new layer makes reasons and relationships discoverable; it does not turn observations into rules.

This is the group’s final design handoff, not an implementation. The coordinator builds `/Users/overment/Downloads/limen-learning-system.html`.

## Five strongest ideas

1. Keep confirmed principles separate from decision evidence, with scope, source and an explicit limit on what each choice settles.
2. Capture a ruling in the coordinator turn that acts on it; use existing steer, review and outcome records to catch omissions.
3. Use three small skills to find context, trace relationships and propose learning—never inject the whole history.
4. A timer checks missed capture and changed guidance; it writes proposals, not policy, and never gates work.
5. Prove learning with fresh questions and counterexamples, not counts of notes, links or successful jobs.

## 1. Files and their jobs

All paths and new behavior in this design are proposed unless marked existing.

| Home | Shape and responsibility |
|---|---|
| `spec/principles.md` | Confirmed decision principles. One heading per principle: governing source, when it applies, what it does not settle, and a sourced reason or “reason not recorded.” Existing operative rules are linked, not recopied. |
| `spec/decisions.md` | One compact log of cases. Each entry records the choice, actor/source/version, scope, current homes and typed links. Proposed interpretations are clearly separate from confirmed rulings. |
| Existing project navigation guide | Routes a question to the operating skill, governing source and proof path. If no usable guide exists, add a small `spec/context.md` containing links only. This is conditional, not a mandatory third catalogue. |
| Existing vision, styleguide, delivery rules, skills and reminders | Continue to own product intent, coding practice, delivery policy, operating procedures and selected obligations. Do not migrate or rewrite them merely to introduce learning. |
| `spec/learning/YYYY-MM-DD.md` | Optional audit output: inspected source boundary, checked claims, proposals, unresolved evidence and overflow. It is not another rule store. |

Use plain Markdown headings and links first. No new ticket fields, frontmatter parser or identifier allocator is needed. Stable descriptive anchors are enough initially.

The principle register answers “how should this choice be weighed?” The ledger answers “what was chosen in this case, and what proves it?” This separates reusable judgment from historical evidence.

A compact ledger entry can look like this:

```text
## The server names Alice’s start model
Choice: the server names it; Alice code has no backup model.
Source: Adam, 2026-10-17; verified source locator and repository revision.
Scope: Alice’s Included AI delivery, not every project’s fallback policy.
Homes: vision for intent; styleguide for the code constraint.
Links: illustrates “one authority”; identify this as analysis unless the source states the reason.
```

Add a rejected alternative when it is recorded. Do not manufacture one. An audit date must point to an actual check and source version; a date alone is not proof.

The example is grounded in the Notes of Alice’s closed-beta delivery ticket (`spec/features/active/F1039-closed-beta-share-steps/ticket.md`), which records Adam’s server-only instruction and rejection of an Opus backup in Alice code.

A rule may deliberately appear in both vision and styleguide. List each home and its role. Different wording is a review signal, not proof of contradiction. The new register does not overrule those homes.

**Durability follows project policy.** Default planning is committed to Git. Private planning remains in the canonical planning root, reached through absolute pointers. Do not copy or commit it. A transient `.limen` inbox is acceptable, but lasting knowledge must have an authorized durable home. This respects the existing distinction in `src/project/planning.ts`.

## 2. Sources, authority and relationships

Every entry separates three things:

- **Owner ruling:** a verified instruction, with actor, source locator and source version.
- **Observation:** what a test, file, log or review establishes.
- **Interpretation:** an agent’s proposed explanation or generalization.

A metadata label such as `By: adam` is not evidence of authorship. A steer can contain coordinator text or an automatic timeout nudge. Quote Adam only when the source establishes that attribution. Otherwise retain the uncertainty.

A coordinator can index an existing confirmed rule without asking Adam to repeat it. A new inferred principle needs Adam’s explicit confirmation. A choice built under delegated-default policy is recorded as a coordinator default, not as words Adam spoke. Alice’s two-hour policy is not a global Limen rule.

The register creates no new precedence category. Follow existing owner-instruction and project-policy precedence. Resolve a material conflict instead of choosing by timestamp or assuming a successful read grants authority. A missed source is a retrieval defect; it is not permission to ignore a binding instruction.

Use a few typed relationships:

| Link | Meaning |
|---|---|
| **Illustrates** | A decision provides a case of a principle. |
| **Constrains** | A confirmed choice bounds a feature. |
| **Shares a rule** | Two features apply the same governing rule. |
| **Depends on** | One feature requires another; cite the requirement. |
| **Replaces** | A later applicable decision supersedes an earlier choice. |

The ledger owns these assertions. Reverse links come from search or a derived view, not a second manual list.

A verified example: Alice’s connection-state feature (F1037) and engine-owned Settings feature (F1084) both exclude general error, warning or info blocks. This supports **shares a rule**. It does not prove dependency. A link to a broader “less surface” principle remains an interpretation unless its source establishes the reason.

Picture `touches` identifies shared places only. Existing `needs-adam` and `wrong` pins are open asks and defects, not decision rationale. Keep a later relationship viewer derived from the files; do not use the gitignored picture as the durable store.

## 3. Three generalized skills

Place project-discoverable skills under `.agents/skills/<name>/SKILL.md`. Shared procedures stay generic; project facts stay in the named project sources.

| Skill | Trigger and output | Limit |
|---|---|---|
| `discover-context` | At task start or an unfamiliar boundary, find the governing source, operating skill, proof path and permission boundary. Use the current project guide; a short context map is a fallback. | Stop when those paths are known. Do not mine history before each task. If a source is absent, say so. |
| `trace-decisions` | When choosing a design or crossing features, follow the relevant principle and case links. Return scope, reason, rejected alternative, affected features and conflicts. | Follow links only when they can change the choice. Do not infer dependency from co-location. |
| `learn-from-work` | After a useful correction, discovery, reviewed failure or scheduled audit, propose a sourced update and its proper home. | Workers propose; the coordinator files and checks; Adam confirms new principles. Do not force a lesson from every event. |

The learning skill first distinguishes four failure types:

- The rule is absent: propose a sourced addition or ask about intent.
- The rule exists but was not found: fix the route.
- The rule was found but applied too broadly: improve scope or a counterexample.
- The correct procedure was blocked by the environment: file the defect instead of another reminder.

That last distinction comes from the navigation report: an agent can find the correct doctor and still be blocked by the shared screen. More prose does not repair the screen.

Do not install a new root `AGENTS.md` merely to add a pointer. In Limen it suppresses the inherited shop manual for coordinators. Reuse the current door.

Initial retrieval uses skills and existing guidance. A later one-line start cue can point to the discovery route if the pilot finds missed loads. That is an explicit proposed hook change, not a parser that selects principle bodies. Existing styleguide recall continues to carry current code rules. No whole-library injection is proposed.

## 4. Capture and publication

Use existing records before adding events or a queue.

| Input | Proposed action |
|---|---|
| **Adam corrects, rejects or decides** | In the coordinator turn that acts on the instruction, retain the scoped ruling and source. A proposed reason stays labeled as interpretation. |
| **Start** | Discover relevant context. Record a reusable missing route only if one is found. |
| **Steer** | Preserve the current obligation update. Read full delivered text, not the log preview. Record a reusable candidate separately from the task note. |
| **Finish** | Offer a useful discovery in the ordinary handoff. Do not depend on this turn as the sole archive or add a mandatory lesson field. |
| **Review FAIL** | When filing the unchanged verdict, check whether the proven finding exposes absent guidance, failed retrieval, misapplication or an ordinary defect. Propose learning only for a reusable gap. |
| **Landing** | When filing the outcome, verify the chosen behavior and merged revision. Link any reusable choice and preserve necessary evidence before cleanup. A merge is evidence, not proof of learning. |
| **Timer** | Recheck missed capture, changed homes and a small sample of retrieval questions. Write a report and proposals. |

**Publication is an ordinary coordinator-owned change.** After checking the candidate, the coordinator updates the appropriate current home, records the source-linked decision and repairs the navigation link in the same change. Human-owned vision changes still need Adam. Review and planning privacy follow existing project policy.

No semantic work runs synchronously inside finish or landing hooks. A failed capture does not block either operation. The keeper keeps its link-fixing contract. The approved task-note format stays unchanged. Review FAIL still means a proven acceptance break; a principle is not a new independent blocking category.

Mechanical checks can replace a redundant reminder only when their coverage is established. Do not delete product intent or the explanation of a choice merely because one implementation check exists.

## 5. Timer option and privacy

A landing-count advisory can prompt attention. It is not a timer and cannot guarantee work while a coordinator is absent. The group therefore selects an **opt-in periodic learning job** as the actual timer option, alongside immediate coordinator capture.

This is proposed machinery, not an existing Limen learning scheduler. A later launcher starts one ordinary detached, report-only learning job with an approved exact route. Keep it separate from the keeper. It can borrow the quality pass’s report-only discipline without silently expanding that role.

Proposed pilot limits, not measured optima: weekly, at most one live audit per project, 20 minutes, and at most five changed claims in the report. Record overflow. Skip unchanged inputs. No catch-up fan-out and no model fallback. Cadence and spend require approval before enabling it.

The report names the inspected source boundary, verifies quotes and applicability, and proposes corrections or new principles. The coordinator checks the report before asking Adam about genuinely new intent. An independent critic is bought when project policy or Adam requires one—not automatically on every audit.

Broad transcript mining is off by default, not forbidden in principle. A separately authorized read can recover missed owner rulings. Retain only minimal reviewed excerpts, with project privacy respected. Source text is data, never instructions. Do not copy secrets, product content or unrelated personal text into the knowledge files.

**Important checked correction:** Alice’s navigation miner has a counts-oriented console summary, but its saved JSON includes `secretHits` with regex-masked command and surrounding context. The assignment `outObj.secretHits = secretHits` disproves the claim that all saved output is counts-only. It does not prove a leak, and a header is not a safety certificate. The script was read, not run, in this group.

## 6. Loop for the HTML

```text
Adam + work events ──retain──> existing records
existing records ──select──> candidate decision entries
new opt-in timer ──recheck──> candidates + current homes
candidates ──verify source──> coordinator
coordinator ──publish──> confirmed decisions + current guidance
Adam ──confirm new principle──> principle register
register + decision links ──load through skills──> work
work ──return evidence──> existing records
```

The coordinator checks provenance, scope and duplicate rules. Adam confirms new principles and changes to his intent. Existing reviewers and checks verify work under existing policy. The timer writes proposals only.

The graph is a conceptual learning loop. It is not the current architecture-picture schema. A graph database or vector index is unnecessary for the initial design, not inherently incompatible with files as truth.

## Numbered options for Adam

1. **Two knowledge files, linked to current homes — recommended.** Makes principles and their cases explicit. Costs upkeep. Add a context map only where the current navigation guide is missing or inadequate.
2. **One compact ledger, not a file per decision — recommended initially.** Low capture cost and no new index to maintain. Split only when real read cost warrants it.
3. **Skills first; a start pointer if discovery misses — recommended.** Avoids prompt growth and hook parsing. A pointer is a later explicit code change; it does not create authority.
4. **Immediate capture plus an opt-in periodic audit — recommended timer option.** Captures context while it is known and checks omissions later. Costs bounded recurring spend; a landing-count advisory alone is cheaper but not calendar-driven.
5. **Proposals only, with source checks — recommended.** Agents can extract candidates, but cannot silently bind a new principle. A critic is optional under existing policy; full auto-promotion is rejected.

## How to prove learning

Run a small approved pilot before claiming benefit. Compare current guidance with the proposed route and files using fresh sessions, the same questions and no file hints.

The question set must test:

1. Finding the current start-model authority and rejecting an unsupported code backup.
2. Explaining the shared no-general-block rule across features without inventing dependency or owner rationale.
3. Applying a rule to a new case while rejecting an overbroad transfer to another project.
4. Rejecting an automated steer or proposed interpretation as proof of an owner ruling.
5. Distinguishing a missing-context failure from a correctly diagnosed environment block.

Record correct sources, scope mistakes, unresolved conflicts and unnecessary reads. Over time, track repeated corrections and repeated classes of review failure. Counts of stored notes are not the result.

The group checked source examples only. No fresh-agent learning trial ran, and no improvement is proven.

## Open questions

- May a learning pass read coordinator conversations beyond the current task? Recommend named sources with explicit permission, not broad access by default.
- Approve the proposed weekly 20-minute audit after the manual pilot, or keep manual capture only? Recommend the pilot, then opt-in automation with an exact route and budget.
- Which principles may be shared across projects? Recommend project-local scope and existing planning privacy until Adam explicitly authorizes sharing.

## Disagreements resolved

These are decisions with reasons, not a claim of unanimous agreement.

| Disagreement | Group decision and reason |
|---|---|
| **Principle home:** existing homes only (team 4) versus an explicit file (teams 2 and 3) | Use a small confirmed-principle register. It makes judgment discoverable without moving operative rules out of their current homes. |
| **Decision shape:** per-case files (early team 1) versus one ledger | Start with one ledger and short entries. The extra field and index cost has no demonstrated benefit yet. The code styleguide’s “one file, one job” is not a ban on Markdown files. |
| **Routing:** mandatory context map (team 1) versus skills and existing guides | Reuse a usable guide; add a thin context map only for an actual gap. The navigation report supports skills, but not a universal need for another catalogue. |
| **Several rule homes versus one authority field** | Keep a list of current homes and their roles. Alice deliberately has intent and code-constraint expressions. Compare meaning and scope, not literal text. |
| **Capture at finish or through the keeper (early team 4)** | Capture at coordinator action, review filing and outcome filing. The note format is approved, the final assistant text can be replaced, and the keeper may fix links—not product meaning. |
| **Advisory (teams 2–4) versus periodic timer (team 1)** | Keep advisories optional, but name a real opt-in timer for the requested schedule. Quality’s ten-landing rule is a coordinator instruction, not an installed learning timer. |
| **Path-scoped principle recall versus skills-only retrieval** | Skills first, optional one-line route pointer later. `GUIDANCE` currently knows only style, vision and Specs; reusing a matcher does not load a new file. Source location and applicability remain separate. |
| **Transcript ban versus “counts-only is proven safe”** | Neither extreme holds. Authorize narrow reads, review retained excerpts, and do not infer safety from the miner’s header; its saved output contains masked context. |
| **Mandatory critic versus existing review ownership** | Coordinator source verification is required. A separate critic follows project policy or explicit approval. This respects the board’s review ownership and avoids automatic extra spend. |
| **Binding labels, silence or FAIL as authority** | None creates an owner ruling. Use verified source authority and existing precedence. New inferred principles need explicit confirmation; no new FAIL category is added. |
| **Picture nodes, private memory or `.limen` as the durable store** | Use authorized project knowledge files. The picture stays derived; transient intake stays transient; private memories are not injected wholesale. Respect private planning rather than insisting every file enters Git. |
| **Retire prose when a check exists** | Retire only proven redundant reminders. A check does not replace intent, scope or rationale. |
| **Automatic extraction versus automatic promotion** | Sourced candidate extraction is allowed within permission. Silent promotion is not. Semantic reading is not itself a forbidden parser for human-owned Markdown. |
| **Quality-file dates prove that passes stopped** | Rejected. They establish an absence of later committed findings on that path, not whether jobs ran or why. |

## Grounding and checked limits

The controlling Limen source revision is `29801de46008b3492c539315397d970acf9787c2`. Alice was rechecked at `9c52137554095e01c561091c4132f11b9373ae05`. The group inspected the later guidance diff from `b1d8e8bc3`; it does not restore the old no-legacy or start-model contradictions.

- `hook/communication.ts`: coordinator/job role split, current recall kinds, and project-AGENTS suppression of the inherited manual.
- `src/job/task-note.ts`, `hook/finish.ts`, `src/runtime/wrapper.ts`: approved note shape, once-only finish check and last-assistant-text fallback. No runtime repair is proposed here.
- `hook/steering.ts`, `src/job/steer-inbox.ts`: full delivered text, preview logs and absent message-author field.
- `templates/keeper.md`, `src/commands/land.ts`: link-fixing scope and landing behavior, not an automatic distillation step.
- `templates/agents.md`, `src/project/seat.ts`, `docs/commands.md`: prose quality trigger and existing timer patterns.
- `templates/reviewer.md`, `spec/build.md`: acceptance-based blocking and project review ownership.
- `src/project/planning.ts`: committed default versus canonical private planning.
- `templates/picture/CONTRACT.md`: gitignored dataset, explicit schemas, shared places, opt-in watch and spec-only refresh exclusions.
- Alice’s two reports: navigation and document-drift evidence, not fresh reproductions. The docs report describes `b92a6b852`; fixes were already present at `b1d8e8bc3`. Do not display its historical findings as current defects.
- Alice’s `tmp/evidence/agent-navigation/tools/mine2.mjs`: saved masked command/context output, checked without executing the miner.

All 12 named result files were inspected and catalogued. Missing substantive text was recovered: team 1’s first draft at message `2a21fed9` (line 70); team 4’s draft, critique and revision at messages `48f52121` (line 51), `66870787` (line 106) and `9ffd00f0` (line 125) in their respective job transcripts. Note-only saved results were not treated as evidence that the design was complete or correct.

Best parts used: team 1’s provenance split, typed relations and cold-start proof; team 2’s explicit principles, decision-to-home mapping and source inventory; team 3’s bounded retrieval, scope exclusions and candidate boundary; team 4’s compact ledger and visible audit target. Rejected claims and alternatives are named above.

## Coordinator handoff and checks

Build one monochrome, minimal HTML discussion document at `/Users/overment/Downloads/limen-learning-system.html`. Put the recommendation, loop, file shapes, skills and numbered options in the main view. Keep detailed evidence and disagreement decisions available without making them the opening wall of text. Use short verb-phrase graph labels. No kicker or duplicate labels.

The coordinator owns HTML generation and a headless-Chrome check under `/tmp/limen-learning-system-check/`. No browser window may open, including on the virtual display. This team did not write or render the HTML.

The final-round Git snapshot is clean at the unchanged Limen revision. The session write-target audit lists only this job’s required note. Earlier applicable `git diff --check` evidence was retained rather than rerun. No product suites, browser checks or learning trials ran. No product, Alice, board or shared-output file was edited. No commits, pushes or merges were made; the design brief expressly forbids team commits even in the final round.

Still unproven: learning effectiveness, the best cadence and budget, completeness of owner attribution, and private-memory statistics not independently re-counted by the final seat. None is concealed as consensus.

## Note check

- Structures: proven. The handoff gives two core files, conditional routing, optional audit output and existing-home boundaries.
- Generalized skills: proven. The handoff supplies discovery, relationship and learning procedures, outputs and stop rules.
- Loop graph: proven. It supplies sources, storage, retrieval and checking roles.
- Numbered choices and open questions: proven. It gives five options with trade-offs and three remaining questions.
- Grounding: proven for the design’s source claims. Current code facts, historical report evidence, engineering choices and unproven outcomes are separated. The five deliverable checks were inspected in the complete first finish handoff at transcript line 230, assistant message `918d108d`.
- All 12 results and disagreement decisions: proven by the 12-file catalogue, recovered substantive text, source reads and the disagreement table. Evidence is retained in this final job’s session from line 192 onward.
- Read-only boundary: followed. The final-round Git snapshot and write-target audit show only the required job note was edited, with no commit.
- Easy-to-miss rule, “Return each round’s work in the final message”: followed. This finish call carries the entire group synthesis. The complete-handoff inspection is at transcript line 230, message `918d108d`; it is not just a note check or pointer.
- Changed from the inherited note: round 4 requires one synthesis across all rounds, not an independent draft or another critique. The initial no-peer-read restriction applied to round 1 only.
- Dropped from the inherited note: the candidate-commit and implementation-suite assumptions. The specific group brief forbids team commits and product changes, including in the final round. The coordinator alone owns the HTML and any authorized ticket-folder commit.
- Not proven: learning effectiveness, HTML rendering and the proposed audit limits. HTML checking belongs to the coordinator after this handoff.

The evidence transcript is `/Users/overment/.overment/limen/.limen/jobs/2026-10-24-f952-team-1-gpt-6-1-sol-final-86a2f432/session/2026-10-24T11-14-30-633Z_01a16d9e-9068-75b5-8aff-f3302c45acfc.jsonl`.
