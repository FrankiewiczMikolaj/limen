# F937 notes · seams and open questions

## Seams

- `src/runtime/engine.ts` `argvFor`: `bridged` is `profile.id === "omp" && model starts with "pi-claude/"`. It adds `bridgeExtensions()` and drops `--provider`. `bridgeExtensions()` returns `~/.omp/local/pi-claude-bridge` (realpath), or `[]` when the path is missing. Today a missing bridge is silent on OMP too. This ticket adds a refusal for Pi only.
- `--provider` is dropped because OMP rejects `--provider pi-claude`. Pi may accept a provider that an extension registers; check before you copy the omission to Pi.
- Why the refusal (inform, do not gate): with `--provider pi-claude` kept, Pi already fails with "Unknown provider" when the bridge is missing (`coding-agent/src/core/model-resolver.ts:437-440`). If `--provider` is dropped as on OMP, Pi's full-catalog fallback (`:544-560`) could resolve the bare model id to another provider: that is the silent substitution the refusal prevents.
- `src/runtime/engine.ts` `preflightEngine`: runs before the job record exists, so a refusal placed here leaves no job directory. With `LIMEN_PREFLIGHT=auth`, `pi auth check --provider pi-claude` loads no extensions and can reject the bridged route (`docs/setup.md`, extensions paragraph). Decide whether a bridged route skips that check or names it.
- Both launch paths reach `argvFor`: detached in `src/runtime/wrapper.ts` and hosted in `src/runtime/supervisor.ts` `hostedEngineLaunch`.
- `bridgeExtensions()` reads `homedir()`, so a test can point `HOME` at a temp directory. No current test pins the bridge argv. `test/engine.test.ts`, which F771 cites, no longer exists. `test/plant.ts` links the fake engine as both `pi` and `omp` and records `fake-argv.json`.
- `docs/setup.md` says pi-claude is OMP-only ("`pi-claude` on OMP"). Update that paragraph when Pi loads the bridge.

## Facts checked on 2026-10-11 (Pi 1.1.0, OMP 18.4.4)

- Pi `--extension <dir>` loads the entries listed under `pi.extensions` in the directory's `package.json` (Pi clone `packages/coding-agent/src/core/extensions/loader.ts`, `resolveExtensionEntries`). `--no-extensions` keeps explicit `-e` paths.
- `~/.omp/local/pi-claude-bridge/package.json` declares `pi.extensions: ["./src/index.ts"]` and `omp.extensions: ["./bundle/index.js"]`. `src/convert.ts` sets `PROVIDER_ID = "pi-claude"`. Its OMP commits since `v0.9.1` include host checks for both OMP and Pi (`hasProvider` / `getProvider`), but no one has run it on Pi.
- Global Pi has a different bridge, `npm:@vanillagreen/pi-claude-bridge` 4.1.0 (the Kendex fork), which also registers `pi-claude`. Limen's `--no-extensions` hides it, and this ticket does not change that.
- Pi's bundled catalog lists `openai-codex/gpt-6.1-sol`, `anthropic/claude-opus-5-5` and `anthropic/claude-haiku-5-5`. The local Haiku 5.5 catalog entry that OMP needed (bridge commit `6f4c48e`; OMP had silently served Haiku 4.5) should not be needed on Pi. The served-model check still decides.
- `~/.pi/agent/auth.json` has entries for `anthropic` and `openai-codex`. The bridge uses the Claude Code login, not Pi auth.

## Evidence

- `limen jobs <id>` prints `served … · requested …` only when the served model differs from the requested one (`src/job/usage.ts:50-58`); a matching route shows a plain `model` line. `versions` comes from `capturedVersions` in `src/commands/spawn.ts`.
- For the bridged route, the served model is what the bridge reports back, so the check proves the bridge's answer, not Claude Code's internals.
- Two board lines (F774, F775) say Opus is rate-limited. Expect the Opus route to park on quota; record it rather than substituting.
- Board routes (`spec/build.md` TRACK): Sol for ordinary work, coordination, research and quality; Opus for simple, cheap and UI work; the Haiku scout at `medium` with `--role scout --detached`. Use the reasoning level the board names.
