# Implementation checks

The implementation is commit `7925d96eb03df248786f3f8c2f402cec6b260b21`. It installs `../group/prompt.txt` without changing that approved text. The independent verdict is filed verbatim in `../review-1.md`.

## Pinned-candidate proof

- The independent Pi Sol reviewer installed the locked dependencies with `npm ci`, without a dependency symlink.
- `npm run check` passed TypeScript, Biome, and all 80 tests on the committed candidate.
- All 72 output combinations matched the approved text after the specified substitutions and conditions.
- `test/` held 3,500 lines, exactly the existing cap.
- The candidate diff passed the whitespace check. The review checkout stayed clean.

`evidence/review-install.log`, `evidence/review-check.log`, and `evidence/review-prompt-match.log` retain those results. Only trailing whitespace was removed when filing them. Full reviewer evidence remains under `/Users/overment/.overment/limen/.limen/jobs/2026-10-23-f950-approved-task-note-review-1-5f27d985/evidence/`.

## Earlier failures are not repairs

The earlier full check recorded 78 of 80 tests passing: one wake test saw an extra wake, and the structure scan found duplicate TypeScript basenames in retained `.limen/jobs/` evidence. The wake test passed alone. The structure failure repeated. Those logs remain in `../group/evidence/check.log` and `../group/evidence/repeat.log`.

Neither `test/s3-finish-wake.test.ts` nor `test/structure.test.ts` changed in this candidate. The reviewer ran the whole suite, including both files; neither failed in its clean worktree. That worktree lacks the main checkout's retained `.limen/` evidence, so its structure pass does not establish that the main checkout's scan is repaired. The wake failure's cause remains unproved.

## Main checkout after landing

- `npm run typecheck` and pinned Biome passed.
- `node --test --test-concurrency=2 --test-timeout=120000 --test-force-exit test/u14-task-note.test.ts test/s4-steering.test.ts` passed all five focused tests.
- `node --test --test-name-pattern='runtime remains dependency-free' test/structure.test.ts` failed: 132 unique TypeScript basenames among 229 files. The retained-evidence scan is still not repaired. Its output is filed in `evidence/main-structure.log`; no assertion or evidence file was removed to make it pass.
- The full suite and the wake test were not rerun on main after landing. The pinned independent review ran the full suite and passed all 80 tests. The earlier wake failure remains reported, not repaired.

The main static and focused outputs are retained in `evidence/main-static.log` and `evidence/main-focused.log`.

## Boundary

The change updates prompt strings, their focused regressions, and the README. Note persistence is unchanged. No parser, workflow gate, dependency, or GitHub Actions check was added. No delivery benefit is claimed. The final push uses a `[skip ci]` tip commit to suppress the repository's push workflow, as Adam requested.
