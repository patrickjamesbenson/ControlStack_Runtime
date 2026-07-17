# Lab/IES Lane State

## Evidence timestamp

Current baseline verified on 2026-07-17 through the connected `ControlStack Lab and IES Authority Lane` app.

Evidence labels:

- **VERIFIED** — directly observed through the current connected app execution.
- **REPORTED** — preserved from the recovered historical handoff but not freshly re-read from source files.
- **INFERRED** — conclusion drawn from verified or reported evidence.
- **UNKNOWN** — not established by available evidence.

## Repository identity

- **VERIFIED** — Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- **VERIFIED** — Branch: `lane/code-pilot-lab`
- **VERIFIED** — HEAD: `c4ab11e09e2469e43b84d507890fe802a9ebb85b`
- **VERIFIED** — HEAD subject: `lab: reorg into metadata(1-2) + mutations(3-8), power/thermal/other, LM-63-2019 file-gen-type, luminous-dim tooltip, drop UGR+download`
- **UNKNOWN** — Upstream tracking branch and numerical ahead/behind state were not exposed by the current status response.

## Connected capability state

- **VERIFIED** — Write enabled: yes
- **VERIFIED** — Git stage enabled: yes
- **VERIFIED** — Git commit enabled: yes
- **VERIFIED** — Git push enabled: yes
- **VERIFIED** — Commit/push gated: yes
- **VERIFIED** — Delete enabled: no
- **VERIFIED** — Arbitrary shell execution: no
- **VERIFIED** — Allowed gate: `lab-ies`

## Current gate baseline

- **VERIFIED** — Gate: `lab-ies`
- **VERIFIED** — Tests: 147
- **VERIFIED** — Passed: 147
- **VERIFIED** — Failed: 0
- **VERIFIED** — Cancelled: 0
- **VERIFIED** — Skipped: 0
- **VERIFIED** — Todo: 0
- **VERIFIED** — Exit code: 0

The historical HTTP 502 condition did not recur. The bounded lane gate is operational through the connected app.

## Accepted implementation state

- **VERIFIED by current gate** — canonical 16-keyword contract and internal-ambient semantics;
- **VERIFIED by current gate** — RFC 8785-style canonical JSON behaviour;
- **VERIFIED by current gate** — injected SHA-256 provider boundary and four fixed hash domains;
- **VERIFIED by current gate** — authority, approval and derivation projections;
- **VERIFIED by current gate** — complete canonical unresolved-field inventory and fail-closed classification;
- **VERIFIED by current gate** — GT, OPT and MERGED approval/sealing paths;
- **VERIFIED by current gate** — compatibility-only approvals remain non-sealable;
- **VERIFIED by current gate** — sealed DTO is deterministic and deeply immutable;
- **VERIFIED by current gate** — safe handoff strips rich authority, private, evidence-body and runtime-owned data;
- **VERIFIED by current gate** — project IES construction, transforms, flux, UGR and low-level merge primitives are test-green.

- **INFERRED** — Accepted authority foundation remains logically complete through Slice 4B.
- **REPORTED** — No Slice 5 implementation had begun at the recovered handoff boundary.
- **INFERRED** — Final governed sealed-reference photometric merge remains distinct from the tested MERGED authority envelope and low-level grid summation.

## Current pre-memory-write Git inventory

Baseline immediately before creation of the lane-memory documents:

- Staged: 0
- Modified: 10
- Untracked: 66
- Deleted: 0

The two historical Selector-owned modifications are absent from the current dirty inventory.

### Modified paths — 10

```text
packages/lab-kernel/ies-toolkit/iesApproval.js
packages/lab-kernel/ies-toolkit/iesHandoff.js
packages/lab-kernel/ies-toolkit/iesLabForm.js
packages/lab-kernel/ies-toolkit/iesMetrics.js
packages/lab-kernel/ies-toolkit/iesProvenance.js
packages/lab-kernel/ies-toolkit/iesWrite.js
packages/lab-kernel/ies-toolkit/summary.html
tests/lab-kernel/iesGovernance.test.js
tests/lab-kernel/iesHandoff.test.js
tests/lab-kernel/iesLabForm.test.js
```

### Untracked paths — 66

```text
README.zip
docs/_context/ControlStack_summary_normalise_harness_spec.md
packages/lab-kernel/ies-toolkit/bench.html
packages/lab-kernel/ies-toolkit/component_library.html
packages/lab-kernel/ies-toolkit/curator.html
packages/lab-kernel/ies-toolkit/docRegister.js
packages/lab-kernel/ies-toolkit/docs.html
packages/lab-kernel/ies-toolkit/emergency.html
packages/lab-kernel/ies-toolkit/equipment_register.html
packages/lab-kernel/ies-toolkit/extended_report.html
packages/lab-kernel/ies-toolkit/iesAuthorityFingerprint.js
packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js
packages/lab-kernel/ies-toolkit/iesCanonicalJson.js
packages/lab-kernel/ies-toolkit/iesFromReference.js
packages/lab-kernel/ies-toolkit/iesGuards.js
packages/lab-kernel/ies-toolkit/iesKeywordContract.js
packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js
packages/lab-kernel/ies-toolkit/iesMerge.js
packages/lab-kernel/ies-toolkit/iesNormaliseController.js
packages/lab-kernel/ies-toolkit/iesPolar.js
packages/lab-kernel/ies-toolkit/iesProjectIes.js
packages/lab-kernel/ies-toolkit/iesReferenceDto.js
packages/lab-kernel/ies-toolkit/iesSymmetrize.js
packages/lab-kernel/ies-toolkit/iesTransforms.js
packages/lab-kernel/ies-toolkit/iesUgr.js
packages/lab-kernel/ies-toolkit/iesUgrCie190.js
packages/lab-kernel/ies-toolkit/iesWorkingRecord.js
packages/lab-kernel/ies-toolkit/ies_builder.html
packages/lab-kernel/ies-toolkit/ies_merge.html
packages/lab-kernel/ies-toolkit/index.html
packages/lab-kernel/ies-toolkit/lab.css
packages/lab-kernel/ies-toolkit/lab.html
packages/lab-kernel/ies-toolkit/lab/
packages/lab-kernel/ies-toolkit/lab_request.html
packages/lab-kernel/ies-toolkit/labbench.html
packages/lab-kernel/ies-toolkit/luminaire_provenance.html
packages/lab-kernel/ies-toolkit/nvb/
packages/lab-kernel/ies-toolkit/nvbComponents.js
packages/lab-kernel/ies-toolkit/nvbLabAdapter.js
packages/lab-kernel/ies-toolkit/nvbReference.js
packages/lab-kernel/ies-toolkit/nvbResolve.js
packages/lab-kernel/ies-toolkit/onemm_contract.html
packages/lab-kernel/ies-toolkit/provenance.html
packages/lab-kernel/ies-toolkit/provenance_explorer.html
packages/lab-kernel/ies-toolkit/reference_builder.html
packages/lab-kernel/ies-toolkit/selector_stub.html
packages/lab-kernel/ies-toolkit/test_request.html
packages/lab-kernel/ies-toolkit/ugr.html
packages/lab-kernel/ies-toolkit/zencontrolEmergency.js
scripts/clear_chaff.ps1
serve.mjs
tests/lab-kernel/iesAuthorityFingerprint.test.js
tests/lab-kernel/iesAuthorityRecord.test.js
tests/lab-kernel/iesCanonicalJson.test.js
tests/lab-kernel/iesFromReference.test.js
tests/lab-kernel/iesGuards.test.js
tests/lab-kernel/iesKeywordContract.test.js
tests/lab-kernel/iesKeywordMigration.test.js
tests/lab-kernel/iesLabFormKeywords.test.js
tests/lab-kernel/iesNormaliseController.test.js
tests/lab-kernel/iesProjectIes.test.js
tests/lab-kernel/iesReferenceDto.test.js
tests/lab-kernel/iesTransforms.test.js
tests/lab-kernel/iesUgr.test.js
tests/lab-kernel/iesUgrCie190.test.js
tests/lab-kernel/iesWorkingRecord.test.js
```

## Parcel classification

### Accepted Slice 1–2 foundation

Implementation and tests associated with:

- `iesKeywordContract.js`
- `iesLabFormKeywords.js`
- `iesWorkingRecord.js`
- `iesNormaliseController.js`
- `iesLabForm.js`
- corresponding keyword, form, working-record, normalisation and migration tests.

State: logically accepted, test-green, mixed modified/untracked, uncommitted.

### Accepted Slice 3 authority lifecycle

Implementation and tests associated with:

- `iesAuthorityRecord.js`
- `iesApproval.js`
- `iesProvenance.js`
- `iesHandoff.js`
- authority, governance and handoff tests.

State: logically accepted, test-green, mixed modified/untracked, uncommitted.

### Accepted Slice 4A

- `iesCanonicalJson.js`
- `iesAuthorityFingerprint.js`
- corresponding tests.

State: logically accepted, test-green, untracked, uncommitted.

### Accepted Slice 4B

- `iesReferenceDto.js`
- related authority, approval, provenance and handoff changes;
- corresponding DTO and regression tests.

State: logically accepted, test-green, mixed modified/untracked, uncommitted.

### Mixed photometric, builder and export work

Includes `iesMetrics.js`, `iesWrite.js`, `iesFromReference.js`, `iesGuards.js`, `iesMerge.js`, `iesPolar.js`, `iesProjectIes.js`, `iesSymmetrize.js`, `iesTransforms.js`, `iesUgr.js`, `iesUgrCie190.js` and associated tests.

State: test coverage exists, but exact per-file maturity and checkpoint boundaries require a dedicated read-only diff audit.

### UI and harness prototypes

Includes the dirty HTML/CSS/harness material under `packages/lab-kernel/ies-toolkit/`, including the collapsed `lab/` directory.

State: experimental, prototype or unexplained relative to accepted slices; not checkpoint-ready as one parcel.

### Provenance and resolver prototypes

Includes `luminaire_provenance.html`, the collapsed `nvb/` directory, `nvb*.js`, provenance pages and `zencontrolEmergency.js`.

State: prototype/specification material; not an accepted rebuild slice.

### Documentation and local support

Includes `README.zip`, `docs/_context/ControlStack_summary_normalise_harness_spec.md`, `scripts/clear_chaff.ps1` and `serve.mjs`.

State: individually unaudited. `clear_chaff.ps1` must not be executed during lane-memory or checkpoint work.

## Immediate state rule

The ten modified and sixty-six untracked feature/support paths above are protected dirty state. Documentation-only work must leave them unstaged and unchanged.