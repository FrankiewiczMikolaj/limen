---
opened: 2026-10-20
landed: 2026-10-20
---

# F949 · A limen job can run as a Devin cloud session and return its commits

## Outcome

A coordinator can start a job whose agent runs in a Devin cloud session on its own virtual machine, macOS or Linux, instead of a Pi or OMP process on the seat. The job keeps its folder, branch and worktree on the seat; the session works on the same branch and its commits come back into the worktree when it finishes. Heavy builds and native checks then leave the seat, which is the reason: Alice development was eating Adam's Mac (Adam's decision 52, 2026-10-20, in the Alice plant's F1120).

## Scope

- A third engine, `devin`, beside `pi` and `omp`: `limen spawn --engine devin` with the Devin platform and mode chosen by the existing flags, detached only.
- The job's run starts at the detached runner (`src/runtime/wrapper.ts`): push the job branch, create the session through Devin's v3 API, follow its status and messages into the job log, then fast-forward the worktree from the pushed branch.
- `limen stop` and the job timeout end the Devin session; `jobs`, `wait`, `diff` and `land` need no Devin-specific path.
- Credentials come from the Devin CLI's own login or from `DEVIN_API_KEY` and `DEVIN_ORG_ID`; the key never reaches a log, a job file or a prompt.

## Out of scope

- Devin Outposts or running limen itself on a cloud machine.
- Hosted (`--tab`) Devin jobs, continuation of a finished Devin session, and group membership.
- Picking a model: Devin's API selects a mode, not a model.

## Acceptance

- `limen spawn --engine devin` on a small task in a repository Devin can reach ends `done`, with a commit made in the cloud on the job's branch in the worktree and the session's last reply as the job's result.
- A session that suspends for inactivity, quota or an error ends the job `failed`, naming the reason.
- `limen stop` on a running Devin job terminates its session; the session reads `exit` or `suspended: user_request` afterwards.
- A branch the session did not fast-forward (rewritten history) fails the job and leaves the worktree unchanged.
- No log, job file or prompt contains the API key (a test with a fake key proves it).
- `npm test` and `npm run check` pass, and `test/` stays within its line cap.

## Notes

- Devin v3 API: `POST /v3/organizations/{org}/sessions` takes `prompt`, `repos`, `platform` (`macos`, `linux`), `devin_mode`, `title`, `tags`, `max_acu_limit`; `GET …/sessions/{devin_id}` gives `status` and `status_detail`; `GET …/messages` lists messages; `DELETE` terminates. The CLI login lives in `~/.local/share/devin/credentials.toml`, and `devin cloud drs whoami` prints the org id.
- A session sleeps after 30 minutes without agent activity, and sleep ends its running processes.
