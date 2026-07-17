# ControlStack Orchestration Contract

**Authority:** Mandatory operating contract for ControlStack orchestrators and workers.  
**State date:** 2026-07-17, Australia/Sydney.  
**Scope:** Program & Integrate, Selector & Engine, Lab & IES, and any future registered lane.

## 1. Governing principles

1. Repository context is authoritative; chat is coordination input.
2. Current connected-app evidence determines the active lane, root, branch, gate, and available capabilities.
3. One writer operates in one worktree at a time.
4. Each worker receives one bounded task with explicit acceptance criteria.
5. Feature lanes do not write main, Program, donors, or other worktrees.
6. Program & Integrate is the sole gated lane-parcel acceptance path.
7. Existing dirty work is preserved, classified, and excluded unless explicitly part of the commissioned parcel.
8. Staging is exact-path only. Commit and push use gated controls.
9. Seam changes require Program approval before implementation when they are breaking or cross-lane.
10. A task is not complete until its repository handoff, evidence, gate, commit, push, and final Git state are recorded.

## 2. Evidence language

Every state or handoff document uses:

- **VERIFIED** — directly observed from repository or connected-app evidence.
- **REPORTED** — supplied by coordination input or another lane but not reverified here.
- **INFERRED** — reasoned conclusion derived from evidence.
- **UNKNOWN** — unresolved; cannot be silently treated as fact.

Repository evidence outranks historical chat claims. A newer lane handoff outranks older program records only after Program verifies the handoff's branch, commit, and gate evidence.

## 3. Orchestrator responsibilities

The orchestrator owns coordination, not feature implementation by default.

Before commissioning work, the orchestrator must:

1. Read the program state, lane registry, seam contracts, integration queue, decision log, and latest relevant lane handoff.
2. Verify that the requested lane exists in the registry.
3. Identify the exact producer/consumer seam affected.
4. Determine whether the task is feature work, documentation, diagnosis, integration, or operational hardening.
5. Confirm dependencies, held items, and dirty-worktree constraints.
6. Commission exactly one bounded task with exact paths, tests, gate, commit message, and prohibitions.
7. Avoid repeating questions already resolved by repository memory or verified evidence.

During execution, the orchestrator must:

- keep task scope stable;
- prevent another writer from entering the same worktree;
- separate new evidence from inherited claims;
- stop cross-lane writes or wrong-app execution;
- record seam decisions before authorising breaking changes;
- prefer partial evidence-preserving completion over destructive cleanup or vague handoff.

After execution, the orchestrator must:

- verify the worker's exact changed and staged paths;
- verify named gate results and counts;
- verify commit and push receipts;
- update program queue/state/decision/handoff records as required;
- commission a separate Program acceptance parcel for cross-lane work.

## 4. Worker responsibilities

A worker implements or diagnoses one bounded task in one verified lane.

Before modifying files, the worker must:

1. Run `repo_info`, `repo_git_status`, and `repo_git_recent` using the connected lane app.
2. Confirm lane, root, branch, HEAD, ports, permitted gate, and capability flags.
3. Stop if identity does not match the commission.
4. Inspect relevant repository files and existing context documents.
5. Produce an implementation plan that names intended files, tests, and acceptance boundaries.
6. Inventory existing staged, modified, deleted, and untracked paths.

While working, the worker must:

- modify only in-scope paths;
- not stage, reset, clean, move, delete, or overwrite unrelated work;
- not access or mutate main, another lane, or a donor beyond configured read-only access;
- not use arbitrary shell workarounds;
- add maintainable, complete code or documentation rather than temporary hidden fallbacks;
- expose blockers truthfully;
- keep seam contracts explicit.

At completion, the worker must:

1. Run relevant focused tests.
2. Run `repo_git_status`.
3. Stage exactly the commissioned paths.
4. Run the named lane gate against the actual staged set.
5. Commit only through the gated path with the commissioned message.
6. Push only the verified lane branch through the gated path.
7. Run final `repo_git_status`.
8. Return a self-contained receipt and update the lane handoff.

## 5. Worker commissioning contract

Every worker prompt must contain:

- verified expected lane identity;
- root, branch, relevant ports, secure app, and gate;
- business objective;
- one bounded technical task;
- authoritative context documents to inspect;
- exact files or path boundaries in scope;
- explicit exclusions;
- seam producer and consumer;
- acceptance criteria;
- focused tests and named gate;
- exact commit message;
- push branch;
- required completion receipt;
- dirty-worktree protections;
- stop conditions.

A commission must not bundle unrelated defects, optional polish, operational work, and documentation into one worker parcel.

## 6. One bounded task per worker

A bounded task has:

- one primary outcome;
- one ownership boundary;
- a reviewable changed-path set;
- deterministic acceptance criteria;
- a named test/gate path;
- no hidden follow-on implementation.

When diagnosis reveals a separate defect, the worker records it in the lane queue or handoff. It is not silently fixed unless it is necessary, within scope, and explicitly compatible with the original acceptance criteria.

## 7. Git staging rules

1. Run status before writing and before staging.
2. Stage explicit relative paths only.
3. Never use blanket staging for a dirty worktree.
4. Verify the staged set exactly matches the commission.
5. Unrelated modified and untracked files remain untouched and unstaged.
6. Documentation-only parcels must contain no feature files.
7. Generated files, logs, caches, secrets, and junk require explicit authorisation and noise review.
8. If the staging tool cannot express the exact set, stop with a blocked handoff; do not improvise.

## 8. Gated commit and push rules

A commit is permitted only when:

- the connected app reports commit capability enabled;
- the branch equals the lane's required branch;
- the staged set exactly matches expected paths;
- the lane's named bounded gate is green;
- no branch guard blocks the operation;
- the commit message is the commissioned message.

A push is permitted only when:

- the commit succeeded;
- the current branch remains the required lane branch;
- the connected app reports push capability enabled;
- push is non-force and gated;
- no unrelated local commits are knowingly included without Program approval.

A failed gate or guard means no commit and no push. Report the failure and final Git state.

## 9. Gate requirements

Each lane runs only its registered gate:

- Selector & Engine: `selector-engine` — REPORTED registry value.
- Lab & IES: `lab-ies` — REPORTED registry value.
- Program & Integrate: `program-integrate` — VERIFIED for this app.

Focused tests supplement but do not replace the named gate. Gate evidence must include pass/fail counts where provided, command or gate name, branch, and staged-path verification.

A gate result from a different commit, branch, worktree, or unstaged file set is not acceptance evidence.

## 10. Handoff requirements

Every lane handoff must be self-contained enough for a new orchestrator with no chat history. It must include:

1. identity: lane, app, root, branch, HEAD, ports, gate;
2. objective and acceptance definition;
3. architecture and owned modules;
4. seams and authority boundaries;
5. completed parcels with commits and evidence;
6. current work and complete Git inventory;
7. decisions and rejected alternatives;
8. tests, gate, live validation, and evidence timestamps;
9. defects, blockers, risks, and unknowns;
10. exact next action and exact first worker prompt;
11. in-scope and prohibited paths;
12. final Git state and push status.

Claims must remain classified. Historical claims that current evidence resolves may be marked superseded, but the record must explain why.

## 11. Chat archival rules

- Do not rely on a chat remaining accessible.
- Preserve durable conclusions in repository context documents.
- Do not copy private reasoning or raw conversation transcripts into the repository.
- Record decisions, evidence, prompts, and outcomes, not conversational noise.
- A legacy handoff may be summarised and classified; it is never automatically current truth.
- When a chat is retired, its final actionable state must already exist in the repository handoff and queue.

## 12. Seam-change approval

A seam change requires Program review when it:

- changes a payload or artifact schema;
- changes authority/source precedence;
- changes blocked/error semantics;
- introduces a new consumer or producer;
- activates a reserved transport;
- changes persistence/readback identity;
- requires coordinated changes across lanes.

The proposing lane supplies old/new contract, migration, compatibility, rollback, tests, and affected consumers. Program records an approval decision before commissioning breaking implementation.

Backwards-compatible additions still require documentation and consumer-impact confirmation, but may use a lighter approval where no consumer breaks.

## 13. Handling dirty worktrees

Dirty state is evidence, not clutter.

The worker must group all paths as:

- completed parcel;
- current in-progress parcel;
- intentional preserved work;
- experimental work;
- generated/junk candidate;
- unexplained change.

Rules:

- Do not clean, reset, delete, move, or stash through an unauthorised workaround.
- Do not include unrelated dirty paths in the staged set.
- If an in-scope file already contains unrelated work, stop or define a reviewed combined parcel; do not overwrite it.
- Lab-specific intentional IES modifications and untracked work must remain preserved during documentation or unrelated work.
- An unexplained staged path blocks commit.

## 14. How Program & Integrate accepts a lane parcel

Program acceptance is a separate bounded task.

### Intake evidence

The producing lane provides:

- verified lane identity;
- exact base and head commit(s);
- exact changed paths;
- task objective and acceptance criteria;
- focused test results;
- named lane gate result;
- final Git state;
- push receipt;
- seam-impact statement;
- updated lane state and session handoff.

### Program verification

Program must:

1. Confirm the parcel is present and immutable by commit identity.
2. Reconcile it against Program HEAD and other queued parcels.
3. Verify no unrelated changes or dirty-worktree material are included.
4. Review seam and dependency order.
5. Run available Program-focused checks.
6. Stage only the accepted integration paths.
7. Run `program-integrate`.
8. Commit and push through the Program gated path.
9. Update program state, queue, decisions, evidence, and handoff.

### Rejection conditions

Program rejects or blocks a parcel when:

- branch/root identity is wrong;
- gate evidence is missing or stale;
- commit cannot be tied to the reviewed changes;
- scope contains unrelated files;
- dirty state is unexplained;
- a breaking seam lacks approval;
- required consumer evidence is missing;
- held work, such as the downstream-artifacts tunnel, is included;
- the parcel depends on chat-only assumptions.

## 15. Capability failure protocol

When lane-scoped write, stage, gated commit, or gated push capability is unavailable:

- stop without cross-root or shell workaround;
- report the exact missing tool or disabled flag;
- return a complete relay pack with target paths and unified diffs when safe and requested;
- do not ask Patrick to manually compose or edit repository files;
- preserve the current Git state.

## 16. Wrong-app protocol

If `repo_info` contradicts the requested lane:

1. Do not write the requested lane's files.
2. Do not access retired roots or branches to approximate the task.
3. Report the verified app identity and the mismatch.
4. Preserve the requested instruction as coordination input for the correct app.
5. Continue only work already authorised for the verified lane when doing so remains safe and unambiguous.

This protocol prevents documentation or feature changes from landing in the wrong worktree.