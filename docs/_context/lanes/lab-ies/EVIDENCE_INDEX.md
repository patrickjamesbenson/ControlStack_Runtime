# Lab/IES Evidence Index

## Evidence rules

- Current connected-app repository evidence overrides stale historical claims.
- Historical handoff content is retained as reported context unless freshly reverified.
- Test output proves only the behaviour exercised by the named tests; low-level merge tests do not by themselves prove completion of the final governed merge.

## Current baseline evidence — 2026-07-17

### Repository identity

Observed through `repo_info`, `repo_git_status` and `repo_git_recent`:

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- HEAD: `c4ab11e09e2469e43b84d507890fe802a9ebb85b`
- HEAD subject: `lab: reorg into metadata(1-2) + mutations(3-8), power/thermal/other, LM-63-2019 file-gen-type, luminous-dim tooltip, drop UGR+download`
- Upstream/ahead-behind: not exposed beyond the local branch label.

### Capability evidence

Observed through `repo_info`:

- write enabled;
- staging enabled;
- commit enabled;
- push enabled;
- commit/push gated;
- delete disabled;
- arbitrary shell disabled;
- allowed gate: `lab-ies`;
- allowed documentation scope includes `docs/_context/**`.

### Current gate evidence

Observed through `run_controlstack_gate(gate="lab-ies")`:

| Metric | Result |
|---|---:|
| Tests | 147 |
| Passed | 147 |
| Failed | 0 |
| Cancelled | 0 |
| Skipped | 0 |
| Todo | 0 |
| Exit code | 0 |

The gate directly exercised 24 Lab test files and completed successfully through the connected app.

### Pre-memory-write Git inventory

Observed immediately before the six memory documents were created:

- staged: 0;
- modified: 10;
- untracked: 66;
- deleted: 0.

The exact protected paths are recorded in `LANE_STATE.md`.

The historical Selector-owned dirty paths were absent from the current status:

- `packages/workspace-kernel/selectorReferenceOptionsService.js`
- `tests/selectorCascadeCorrectness.test.js`

No inference is made about how or when they ceased to be dirty.

## Accepted foundation evidence map

### Slice 1 — Working record, keywords and normalisation

Production evidence paths:

- `packages/lab-kernel/ies-toolkit/iesKeywordContract.js`
- `packages/lab-kernel/ies-toolkit/iesWorkingRecord.js`
- `packages/lab-kernel/ies-toolkit/iesNormaliseController.js`
- `packages/lab-kernel/ies-toolkit/iesLabForm.js`
- `packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js`

Test evidence paths:

- `tests/lab-kernel/iesKeywordContract.test.js`
- `tests/lab-kernel/iesWorkingRecord.test.js`
- `tests/lab-kernel/iesNormaliseController.test.js`
- `tests/lab-kernel/iesLabForm.test.js`
- `tests/lab-kernel/iesLabFormKeywords.test.js`
- `tests/lab-kernel/iesKeywordMigration.test.js`

Current gate evidence verifies:

- exact ordered 16-field contract;
- internal ambient semantics;
- canonical Lab form ownership;
- working-session isolation;
- normalisation controller order and skip policy;
- canonical keyword migration.

### Slice 3 — Rich authority lifecycle

Production evidence paths:

- `packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js`
- `packages/lab-kernel/ies-toolkit/iesApproval.js`
- `packages/lab-kernel/ies-toolkit/iesProvenance.js`
- `packages/lab-kernel/ies-toolkit/iesHandoff.js`

Test evidence paths:

- `tests/lab-kernel/iesAuthorityRecord.test.js`
- `tests/lab-kernel/iesGovernance.test.js`
- `tests/lab-kernel/iesHandoff.test.js`

Current gate evidence verifies:

- complete rich authority shape;
- source binding;
- unresolved-field inventory;
- compatibility-only lifecycle behaviour;
- mutation reopening rules;
- safe handoff leak protections.

### Slice 4A — Canonical JSON and authority fingerprints

Production evidence paths:

- `packages/lab-kernel/ies-toolkit/iesCanonicalJson.js`
- `packages/lab-kernel/ies-toolkit/iesAuthorityFingerprint.js`

Test evidence paths:

- `tests/lab-kernel/iesCanonicalJson.test.js`
- `tests/lab-kernel/iesAuthorityFingerprint.test.js`

Current gate evidence verifies:

- canonical JSON vectors and rejection rules;
- exact-byte origin SHA-256;
- four structured hash domains;
- deterministic authority, approval and derivation projections;
- diagnostic-hash exclusion;
- browser-safe provider boundary.

### Slice 4B — Sealed reference DTO

Production evidence paths:

- `packages/lab-kernel/ies-toolkit/iesReferenceDto.js`
- related authority, approval, provenance and handoff modules.

Test evidence paths:

- `tests/lab-kernel/iesReferenceDto.test.js`
- `tests/lab-kernel/iesAuthorityRecord.test.js`
- `tests/lab-kernel/iesGovernance.test.js`
- `tests/lab-kernel/iesHandoff.test.js`

Current gate evidence verifies:

- GT, OPT and MERGED sealing;
- compatibility-only non-sealability;
- non-gating Lab-form unresolved values;
- blocking unknown, malformed and cryptographic pointers;
- exact keyword owner/order projection;
- deterministic `referenceSha256`;
- deep immutability;
- no reverse-authority API;
- no production Node crypto imports.

## Photometric and export evidence map

Production paths presently participating in the green test suite include:

- `iesFromReference.js`
- `iesGuards.js`
- `iesMerge.js`
- `iesMetrics.js`
- `iesPolar.js`
- `iesProjectIes.js`
- `iesSymmetrize.js`
- `iesTransforms.js`
- `iesUgr.js`
- `iesUgrCie190.js`
- `iesWrite.js`

Current gate evidence verifies:

- project IES construction from a sealed reference;
- canonical keywords and provenance in generated project output;
- transform operations and standardisation;
- full- and half-azimuth constant-intensity flux cases;
- raw-grid mismatch rejection;
- low-level matching-grid summation;
- guarded optics merge recipe;
- UGR and CIE 190 reference behaviour.

Evidence limitation:

The above does not establish the final governed N-parent reference merge with identity allocation, cycle protection, parent reference pinning, fresh authority approval and sealing.

## Prototype and unaudited evidence locations

### UI and harness

Dirty HTML/CSS and collapsed `lab/` material under:

- `packages/lab-kernel/ies-toolkit/**`

These paths require individual classification before checkpointing.

### Provenance and resolver

- `packages/lab-kernel/ies-toolkit/nvb/`
- `packages/lab-kernel/ies-toolkit/nvbComponents.js`
- `packages/lab-kernel/ies-toolkit/nvbLabAdapter.js`
- `packages/lab-kernel/ies-toolkit/nvbReference.js`
- `packages/lab-kernel/ies-toolkit/nvbResolve.js`
- provenance HTML pages;
- `zencontrolEmergency.js`.

These are prototype/specification material, not accepted production slices.

### Local support

- `README.zip`
- `docs/_context/ControlStack_summary_normalise_harness_spec.md`
- `scripts/clear_chaff.ps1`
- `serve.mjs`

These remain individually unaudited. `clear_chaff.ps1` is potentially destructive and must not be executed during audits.

## Historical evidence

The recovered `FINAL-ORCHESTRATOR-HANDOFF-01 — ControlStack Lab/IES Lane` is the principal historical narrative source. It reported:

- logical acceptance through Slice 4B;
- historical local 147/147 test evidence;
- no Slice 5 implementation begun;
- a historical dirty snapshot of 0 staged, 12 modified, 66 untracked and 0 deleted;
- a historical app-gate HTTP 502;
- two historical Selector-owned modified paths;
- a recommended read-only replacement baseline before any writer.

Current verification superseded the stale parts of that snapshot:

- the correct current app name is `ControlStack Lab and IES Authority Lane`;
- the bounded gate now runs and passes 147/147;
- modified count is 10, not 12;
- the two Selector paths are not currently dirty;
- staged, untracked and deleted counts remained 0, 66 and 0 respectively.

## Evidence maintenance rule

After each authorised lane parcel:

1. update `LANE_STATE.md` with the new verified repository and gate state;
2. update `WORK_QUEUE.md` status and blockers;
3. append new owner decisions to `DECISION_LOG.md` without rewriting prior decisions;
4. add command/test/commit evidence here;
5. replace `SESSION_HANDOFF.md` with the exact next safe action and protected dirty inventory.