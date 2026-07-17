# Lab/IES Work Queue

## Queue rules

- Current repository evidence overrides historical claims.
- No implementation task may begin until its exact path boundary and dirty-file collision risk are known.
- Accepted, prototype, support and other-lane work must not be combined in one checkpoint.
- The `lab-ies` gate must pass before gated commit/push.
- Selector-owned paths are out of scope.
- Donor and staging roots are read-only evidence sources.

## P0 — Establish durable lane memory

Status: authorised and in progress on 2026-07-17.

Scope is exactly:

- `docs/_context/lanes/lab-ies/LANE_CHARTER.md`
- `docs/_context/lanes/lab-ies/LANE_STATE.md`
- `docs/_context/lanes/lab-ies/WORK_QUEUE.md`
- `docs/_context/lanes/lab-ies/DECISION_LOG.md`
- `docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md`
- `docs/_context/lanes/lab-ies/SESSION_HANDOFF.md`

Acceptance:

- only these six files are staged;
- `lab-ies` gate passes;
- commit message is `docs(lab): establish durable lane memory`;
- only `lane/code-pilot-lab` is pushed;
- original 10 modified and 66 untracked paths remain unchanged and unstaged.

## P1 — Read-only checkpoint-boundary audit

Goal: produce a path-confined commit plan for accepted Slices 1–4B without altering feature files.

Required work:

1. inspect exact diffs for accepted foundation files;
2. separate Slice 1–2, Slice 3, Slice 4A and Slice 4B dependencies;
3. identify any dirty-file collisions with mixed photometric/export work;
4. verify no accepted file is partially edited;
5. keep UI, provenance, resolver and support prototypes excluded;
6. keep Selector-owned paths excluded;
7. rerun the full `lab-ies` gate after each proposed checkpoint boundary is identified.

Expected dependency order:

1. canonical keyword contract;
2. Lab form and working record;
3. normalisation and keyword migration;
4. canonical JSON;
5. authority fingerprints;
6. rich authority record;
7. provenance and approval;
8. sealed reference DTO;
9. safe handoff.

No staging or commit is implied by this audit.

## P2 — Accepted-slice checkpoint execution

Blocked by P1 and explicit orchestrator authorisation.

Goal: checkpoint accepted Slices 1–4B in path-confined dependency order.

Constraints:

- no blanket staging;
- no prototypes;
- no unexplained support files;
- no Selector paths;
- full `lab-ies` gate after each accepted checkpoint;
- preserve all unrelated dirty work.

## P3 — Builder ownership audit

Goal: determine the canonical sealed-reference project IES builder boundary.

Files requiring read-only comparison include:

- `packages/lab-kernel/ies-toolkit/iesFromReference.js`
- `packages/lab-kernel/ies-toolkit/iesProjectIes.js`
- `packages/lab-kernel/ies-toolkit/iesWrite.js`
- `packages/lab-kernel/ies-toolkit/iesKeywordContract.js`
- associated tests.

Questions to resolve:

- which module owns `buildProjectIes`;
- whether the builder consumes only the sealed DTO;
- canonical filename format;
- CRI and CCT formatting;
- owned watt source;
- numerical rounding;
- decimal length policy;
- unsafe filename characters;
- provenance emitted with the project IES.

Must not reopen:

- sealed DTO schema;
- canonical keyword order;
- internal ambient semantics.

## P4 — Metrics verification

Goal: audit the exact current `iesMetrics.js` diff and isolate the intended flux correction.

Current evidence:

- the full gate verifies full-azimuth and half-azimuth constant-intensity cases;
- the historical behavioural correction says single-plane rotational flux uses `2π`.

Acceptance:

- exact implementation matches the intended geometry;
- no unrelated metric changes are hidden in the same modified file;
- focused metric tests and full lane gate pass.

## P5 — Governed reference merge

### P5A — Pure photometric kernel

Goal: deterministic N-parent grid registration/interpolation, candela summation and owned-power summation.

Required decisions:

- G8 compatibility;
- geometry policy;
- channel state;
- duplicate parent instances;
- quantity semantics;
- interpolation and registration ownership.

### P5B — Governance adapter

Goal: bind ordered parents by ID, kind and `referenceSha256`, bind recipe/kernel identity, allocate a new assembly authority, require approval and seal a new immutable reference.

Required controls:

- DAG and cycle protection;
- newly allocated identity;
- no raw parent bytes;
- assembly-minted emergency and EWIS outcomes;
- explicit nested-MERGED policy;
- explicit parent-order policy;
- explicit duplicate-parent policy.

### P5C — Harness/UI migration

Goal: port only reviewed behaviour from the `:8899` behavioural demo after kernel and governance tests exist.

Prohibition: do not copy demo files wholesale.

## P6 — Provenance and resolver publication

Goal: resolve sealed reference IDs through component and LED-chip evidence to immutable LM-80, TM-21 and datasheet artifacts.

Open decisions:

- governed artifact-reference format;
- immutable manifest boundary;
- resolver URL scheme;
- publication ownership;
- navigation URL versus authority identity.

## P7 — Downstream integration

Goal: integrate only approved safe contracts with Engine and other lanes.

Allowed downstream inputs:

- sealed reference DTO;
- safe handoff projection;
- generated project IES artifact.

Prohibited downstream inputs:

- rich private authority objects;
- raw working bytes;
- diagnostic hashes;
- donor/staging implementation bodies.

## Held and closed items

- Historical app-name discrepancy: closed. `ControlStack Lab and IES Authority Lane` is the correct current app.
- Historical HTTP 502 gate failure: currently closed by successful bounded `lab-ies` execution; reopen only if it recurs.
- Historical Selector dirty paths: absent from the current status; do not infer how they were resolved.