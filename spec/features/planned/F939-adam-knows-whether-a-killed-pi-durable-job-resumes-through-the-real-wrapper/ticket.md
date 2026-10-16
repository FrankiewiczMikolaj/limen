---
touches:
  - limen.runtime.detached
  - limen.runtime.engine
opened: 2026-10-11
---

# F939 · Adam knows whether a killed pi-durable job resumes through the real wrapper

## Outcome

Adam gets a yes or no, with evidence: does a job built on pi-durable survive `kill -9` of its engine, and of its detached wrapper, in the middle of a `bash` call? Reopened, it must settle with the interrupted tool result, a final answer, and a correct job state. The verdict also says what an adapter costs to build and keep, and decides whether the opt-in durable engine (F940) is worth building.

## Scope

- A throwaway adapter that accepts what Limen already gives an engine: JSON events on stdout, a session directory, an appended system prompt, a task file, model flags, and continue.
- Built on pi-durable at a pinned Pi revision, reusing the model, auth, settings and prompt setup of Pi's experimental durable runtime.
- The coordinator installs pi-durable at that revision into a named directory before the spawn; the worker does not reach the network.
- Driven by the real detached wrapper; any engine profile or binary override lives only on a throwaway branch.
- The kill experiment, reopened by hand on the same storage: a scripted model makes the kill point repeatable, and one run on a real board route proves the provider path.

## Out of scope

- Landing anything, or changing `src/` on the plant branch.
- Automatic relaunch of a durable job that lost its owner (F941), and coordinator changes.
- Hosted and Herdr jobs, and OMP.

## Acceptance

- `notes.md` names the pinned Pi commit and the pi-durable and Node versions.
- `notes.md` gives the yes/no verdict, where the adapter should live, and JSONL or SQLite, each with its reason.
- After a reopen that follows a killed engine, the store's transcript holds the `bash` result "Tool bash was interrupted and may have partially run", followed by an assistant entry.
- The same holds after a reopen that follows a killed wrapper, and the notes say what happened to the orphaned engine.
- For both runs, the notes quote the job's `state`, `stop-reason` and `result` files after the reopen, or say why one is empty.
- The notes give the adapter's startup time and peak memory beside a plain Pi job on the same task.

## Notes

- The deliverable answers the questions listed in `notes.md`. The throwaway branch is never merged.
