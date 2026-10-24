# Exact-tip proof failures

The Sol-passed candidate `3afe4c8535bdad71ab4879ac5e40841f2b75cbe3` remains unlanded. Its exact-tip proof job (`2026-10-24-f955-full-final-messages-exact-t-181c0394`) proved live Herdr transport and the wait/wake/webhook routes, but its full native runs ended 74/81, 79/81 and 80/81. These are failures, not a green lane. The owner authorized continued repair or acceptance with an explicit reason after inspecting these results.

## Report fidelity

The proof's provider-error and reviewer cases each sent a 193,895-character report through engine stdout and stored 12 replacement characters. `src/runtime/wrapper.ts` decodes each stdout Buffer separately before passing it to the stream parser. A multibyte UTF-8 character split across Buffers is therefore damaged before the report reaches any delivery route. Reports written by the finish tool were unaffected. Evidence: the proof job's `artifacts/routes/utf8-split/analysis.txt`, expected reports and stored-result files.

The correction belongs to this feature's complete-report guarantee. Use stateful UTF-8 decoding at the engine stdout boundary. The regression must compare the engine's original text with the stored result and delivered text, not merely compare routes with an already-damaged result. Preserve split two-, three- and four-byte characters.

## Native rule fixture

The remaining full-suite failure also reproduced on clean main `2dbfcda`, installed from its own lockfile: the rule test expected `## RULES` but the board had no active rule. The rule test changes its deadline to three seconds before invoking the board and checking that it is still active. That couples an active-display assertion to command latency. The failed-run timing cause is plausible, not independently established by the missing-header assertion alone.

Separate the fixture's active-display phase from its real timer-expiry phase. Preserve exact coordinator-ping assertions and real timer coverage; do not skip the test, suppress a failure, or change production rule behavior. The main comparison and scoped diagnostics are in the proof job's `artifacts/diagnostic/`.

## Boundary and proof

Keep the accepted 1 MiB Herdr request limit, unchanged F953 proof semantics, no runtime dependencies and the 3,500-line test cap. Retain failed and baseline evidence. A new landing candidate needs Sol review and all three proof lanes at the same exact commit: the full native check, isolated live Herdr delivery, and wait plus every job-end long-report route. Do not retry full lanes blindly or do assessment work.
