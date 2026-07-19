# Lab/IES Evidence Index

## Evidence rules

- Current connected-app repository evidence overrides stale historical claims.
- Historical handoff content is retained as reported context unless freshly reverified.
- Test output proves only the behaviour exercised by the named tests; low-level merge tests do not by themselves prove completion of the final governed merge.

## LAB-018 NVB resolution contract — 2026-07-20

### Identity and scope

- starting HEAD: `7e7e2cfc6bf92794843cd39932551d88851aebc0`;
- queue item: `LAB-018-nvb-resolution-contract`;
- approved consolidated seam envelope: version 1, unchanged;
- authorised implementation paths only:
  - `packages/lab-kernel/ies-toolkit/nvbResolve.js`;
  - `tests/lab-kernel/nvbResolve.test.js`.

### Behaviour evidence

The completed contract:

- exports only the approved version-1 API, schema constants and frozen test-path list;
- normalises bounded NVB families and classifies the three approved test paths deterministically;
- resolves governing thermals only from exactly one selected-family row nominated as worst case;
- matches optics by exact BOM ID first, otherwise exact family plus variant, and fails closed on missing, duplicate or cross-family results;
- projects hot-test provenance only as an opaque evidence reference and never parses it for thermal facts or emergency verification;
- splits Lab-form rows only by exact `ies` and `check` kinds while preserving source order;
- returns deeply immutable plain-data output without mutating source rows;
- contains no live source loader, direct RuntimeData/database access, copied Program reader, filesystem, network, DOM, browser storage, clock, random or Selector option seam.

The committed offline `lab_form.json` fixture has no approved `kind` discriminator. Equivalent fixture and injected rows therefore produce the same deterministic unresolved result with `unknown_lab_form_kind`; no fixture was changed or silently reinterpreted.

### Test and gate evidence

- focused changed-file `lab-ies` execution: 181/181 passed;
- independent full `lab-ies` gate: 181/181 passed;
- gated feature commit execution: 181/181 passed;
- failed, cancelled, skipped and todo counts were zero in every execution.

### Commit and push evidence

- feature commit: `952b2ba40c5a5ea1c7e217c9c1dcd9a19170e648`;
- subject: `lab: checkpoint NVB resolution contract`;
- files: exactly the two authorised implementation paths;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- no fixture, HTML, adapter, Program, Runtime, Engine or Selector path changed;
- protected dirty paths and the unstaged branch-HEAD marker were preserved.

### Resulting queue boundary

- LAB-018 is `done`.
- LAB-019 is approved and becomes the single next `ready` item.
- LAB-020, LAB-021, LAB-022, LAB-023 and LAB-027 remain approved but sequence-blocked.

## Branch-HEAD lane-memory guard — 2026-07-19

### Trigger and reconciliation

- Actual branch HEAD was `f927ced1ca77c8b11ef8b13b9d6bb3833618844c`.
- `LANE_STATE.md` still recorded `4eba5af77963aa7395748a83118abef54c58a715` as its latest live branch checkpoint.
- The mismatch was reported before any queue item was selected.
- Repository history showed the unmatched commit was the completed, green and pushed LAB-017 seam-envelope documentation checkpoint, not unexplained implementation.
- Lane memory was reconciled to that reality before any other work.

### Permanent guard

The reusable standing-worker prompt, lane state, queue operating model and decision log now require:

- exact comparison of `Recorded branch HEAD` to actual branch HEAD before queue selection;
- the exact stale-state `STOPPED` reply on mismatch;
- memory-only reconciliation and a full `lab-ies` gate before further work;
- no queue execution in the same worker run that discovers a mismatch;
- one deliberate unstaged post-push `Recorded branch HEAD` marker because a commit cannot contain its own final hash.

The marker is excluded from feature staging and exists to detect a worker ending after a feature push but before documentation closeout.

### Commit and gate evidence

- guard commit: `6d34e500d407d5335e5eebb317636a67a5e98618`;
- subject: `docs(lab): add branch HEAD guard`;
- files: exactly `DECISION_LOG.md`, `EVIDENCE_INDEX.md`, `LANE_STATE.md`, `SESSION_HANDOFF.md` and `WORK_QUEUE.md` under the Lab lane-memory directory;
- full `lab-ies` gate: 159/159 passed, with zero failed, cancelled, skipped or todo;
- push: origin `lane/code-pilot-lab`, confirmed up to date;
- no implementation file or queue item was executed.

## LAB-017 seam envelope — 2026-07-19

### Review outcome

- Program & Integrate reviewed the proposed reference/resolver parcel and did not approve implementation.
- The stated prerequisite was a precise committed seam envelope covering contract, scope, compatibility, rollback and tests.
- Implementation remains blocked.

### Repository evidence used

The envelope was derived from:

- the live legacy `nvbReference.js` helper;
- the committed sealed DTO implementation and schema constants;
- the committed safe-runtime handoff boundary;
- all repository imports of `nvbReference.js`;
- current queue dependencies and prohibitions;
- the protected dirty inventory.

Repository search found no committed Program, Runtime, Engine, Selector or test import of `nvbReference.js`. Direct imports are confined to five protected untracked Lab prototypes: the main bench, curator, luminaire provenance view, provenance explorer and reference builder.

### Documented seam

`LAB-017_SEAM_ENVELOPE.md`, version 1, now fixes:

- the exact public exports and constant values;
- GT, OPT and MERGED identity grammar;
- the exact safe identity projection shape;
- seven canonical resolver route descriptors and path grammars;
- fail-closed path and identity rejection rules;
- evidence-readiness input and output shapes;
- explicit non-ownership of emergency/EWIS assembly verification;
- Program ownership of allocation, host, storage, persistence, authentication, deployment and endpoints;
- exact implementation scope of one source file plus one dedicated focused test file;
- compatibility impact on the five untracked legacy Lab prototypes;
- reverse-order rollback with no database or route recovery;
- focused success, failure, immutability, leak and static-boundary tests.

### Program approval and queue evidence

- Program & Integrate approved LAB-017 version 1 unchanged on 2026-07-19.
- Approval covers only the fixed public interface and data shapes, exact two-file scope, named compatibility break, recorded rollback and specified success/failure tests.
- Program retains production allocation, resolver hosting, routing, persistence, authentication, deployment and endpoint ownership.
- Any envelope change requires a new seam decision.
- Approval checkpoint: `09ac99cb35b6af45696b4c83e0051a1651bb2f14`, subject `docs(lab): record LAB-017 seam approval`, confirmed on origin.

## LAB-017 reference and resolver contract — 2026-07-19

### Identity and scope

- starting HEAD: `09ac99cb35b6af45696b4c83e0051a1651bb2f14`;
- queue item: `LAB-017-reference-resolver-contract`;
- approved envelope: version 1, unchanged;
- authorised implementation paths only:
  - `packages/lab-kernel/ies-toolkit/nvbReference.js`;
  - `tests/lab-kernel/nvbReference.test.js`.

### Behaviour evidence

The completed contract:

- exports only the approved versioned public interface and frozen constants;
- validates and formats exact six-digit GT, OPT and MERGED reference identities;
- projects only the minimum safe immutable identity from `controlstack.lab.reference.1mm.v1`;
- emits and parses seven canonical host-free resolver path forms without implementing hosting, routing or storage;
- rejects schemes, hosts, local paths, traversal, encoded separators, malformed IDs, unsafe segments and unsupported component kinds;
- summarises evidence readiness deterministically while leaving emergency and EWIS assembly verification exactly `null`;
- exposes no filesystem, network, browser storage, DOM, clock, random, environment, reverse-authority or legacy-schema seam;
- leaves the five named protected legacy Lab prototypes untouched and accepts their temporary incompatibility.

### Test and gate evidence

- focused changed-file `lab-ies` execution: 169/169 passed;
- independent full `lab-ies` gate: 169/169 passed;
- gated feature commit execution: 169/169 passed;
- failed, cancelled, skipped and todo counts were zero in every execution.

### Commit and push evidence

- feature commit: `2333c1197abf898e7a680455f99918823cb76e30`;
- subject: `lab: checkpoint reference resolver contract`;
- files: exactly the two approved implementation paths;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- no Program, Runtime, Engine, Selector, HTML, fixture, server or persistence file changed;
- post-feature state preserved the single unstaged HEAD marker and all unrelated protected paths.

### Resulting queue boundary

- LAB-017 is `done`.
- LAB-018 is next but remains `blocked` pending its separate Program & Integrate seam approval.
- Ready items: none.

### Final Program acceptance — 2026-07-20

Program & Integrate reported final acceptance of the exact immutable LAB-017 completion receipt recorded in `SESSION_HANDOFF.md`.

- Program gate: 45/45 passed;
- Program acceptance checkpoint: committed and pushed;
- Program tree: clean;
- receipt amendments: none;
- promotion to main: separate and not performed by the Lab lane;
- LAB-018: remains blocked pending its own seam envelope and approval.

This acceptance closes LAB-017 without changing its approved interface, two-file implementation boundary, ownership split, compatibility break, rollback sequence or Lab validation evidence.

## Consolidated seam envelope — 2026-07-20

### Covered items and repository evidence

A single proposed version-1 envelope now covers LAB-018, LAB-019, LAB-020, LAB-021, LAB-022, LAB-023 and LAB-027.

The envelope was derived from:

- the current queue objectives, dependencies, prohibitions and acceptance text;
- direct inspection of all seven legacy implementation areas;
- repository import/consumer searches;
- the committed LAB-017 identity/resolver contract;
- the locked sealed-reference, MERGED, keyword, emergency/EWIS and cross-lane decisions.

Known legacy consumers were recorded item by item. Repository search found no committed Program, Runtime, Engine or Selector import of the provisional contracts. The affected consumers are protected Lab prototypes or later Lab queue parcels.

### Exact scope and proof model

The envelope fixes exact implementation and focused-test files for each item. Six JavaScript contracts receive one dedicated test file each; LAB-027 receives one dedicated workflow test across its four HTML surfaces. All seven remain separate implementation commits and separate gate checkpoints.

Program retains live data reading, durable IDs, persistence, uploads, routes, authentication, CRM integration, deployment and promotion. Approval cannot create multiple ready items; dependencies and the single-top-ready rule remain mandatory.

### Individual-treatment finding

LAB-022 is the only item needing an explicit owner sub-decision inside the batch. Version 1 proposes exactly two direct non-MERGED unique parents, provenance-significant order, exact coincident grids without interpolation, and downstream allocation/authority/approval/sealing. Program may approve the other six and hold LAB-022 if it does not ratify those policies.

### Approval record and queue effect

Program & Integrate approved all seven seams against `LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, on 2026-07-20.

- Program gate: 45/45 passed;
- Program decision: committed and pushed;
- Program tree: clean;
- six ordinary seams: approved unchanged;
- LAB-022: approved with the exact ratified two-parent, order-significant, exact-grid, external-governance policy and fail-closed boundary cases;
- active parcel: LAB-018 only;
- sequence-blocked approved parcels: LAB-019, LAB-020, LAB-021, LAB-022, LAB-023 and LAB-027;
- parallel or combined implementation: not authorised;
- earlier LAB-018 approval hold: superseded;
- ready items: exactly one, LAB-018.

## Reusable standing-worker prompt — 2026-07-19

- `SESSION_HANDOFF.md` now contains exactly one generic `STANDING WORKER — Lab & IES` prompt.
- The prompt requires live repository HEAD discovery, top-ready queue selection, exact authorised-file staging, gated feature and documentation pushes, preservation of dirty work, and retention of the same prompt verbatim in future handoffs.
- It explicitly limits `NEEDS YOU` to actions Patrick must physically perform and requires ordinary progress notes to use plain text without that label.
- commit: `1df62fccd91ac66509b02960ad988f6ef90c0b52`;
- subject: `docs(lab): record reusable standing worker prompt`;
- gate: 159/159 passed;
- push: origin `lane/code-pilot-lab`, confirmed successful.

## LAB-016 offline NVB fixtures — 2026-07-19

### Identity and scope

Observed through `repo_info`, `repo_git_status`, `repo_git_recent`, `repo_scope_guard`, source inspection, repository grep and the connected gate:

- app: `ControlStack Lab and IES Authority Lane`;
- lane: `lab-ies`;
- root: `C:\ControlStack_Worktrees\code-pilot-lab`;
- branch: `lane/code-pilot-lab`;
- starting HEAD: `1df62fccd91ac66509b02960ad988f6ef90c0b52`;
- queue item: `LAB-016-nvb-offline-fixtures`;
- authorised paths: exactly the seven JSON files under `packages/lab-kernel/ies-toolkit/nvb/` listed in `WORK_QUEUE.md`;
- seam change: no.

### Behaviour evidence

The completed snapshot:

- is recorded as bounded offline/development fixture data, not the live RuntimeData authority source;
- preserves the exact locked 16-field Lab form and introduces no schema replacement;
- replaces all literal `today` status values with the fixed snapshot timestamp `2026-07-19T00:00:00`;
- reconciles the 60 mm opal direct baseline slug with its own family and emission record;
- reconciles two duplicated height descriptions with the corresponding structured `height_mm_d` fields;
- retains observed board, driver, system, optic, spec-code and derived-resolution content without adding a production data-source contract;
- contains no local path, file URL, UNC path, credential, secret, token or API key;
- changes no JavaScript, HTML, resolver, database or cross-lane path.

### Test and gate evidence

- Focused changed-file `lab-ies` execution: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated feature commit execution: 159/159 passed.
- Failed, cancelled, skipped and todo counts were all zero in each execution.

### Commit and push evidence

- commit: `ae14232b5a4fbff6fca15004a0583047fc5a319d`;
- subject: `lab: checkpoint offline NVB fixtures`;
- files: exactly the seven authorised JSON fixture paths;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- post-feature state: staged 0, modified 0, untracked 33, deleted 0;
- all unrelated dirty paths were preserved.

## LAB-015 UGR surface — 2026-07-19

### Identity and scope

Observed through `repo_info`, `repo_git_status`, `repo_git_recent`, `repo_scope_guard`, source inspection, repository grep and the connected gate:

- app: `ControlStack Lab and IES Authority Lane`;
- lane: `lab-ies`;
- root: `C:\ControlStack_Worktrees\code-pilot-lab`;
- branch: `lane/code-pilot-lab`;
- starting HEAD: `8c4f7f94ce6eb642ee4a079247e737e914e82194`;
- queue item: `LAB-015-ugr-surface`;
- authorised path only: `packages/lab-kernel/ies-toolkit/ugr.html`;
- seam change: no.

### Behaviour evidence

The completed standalone Lab surface:

- imports the committed shared Lab stylesheet;
- delegates IES parsing to `parseIes`;
- delegates all CIE 190 calculation to `computeUgr190Table`;
- delegates result rendering to `renderUgrTableHTML` and `UGR_CSS`;
- contains no UGR formula or calculation implementation;
- uses deterministic static local imports rather than time-varying cache-busting URLs;
- reads uploaded IES content in memory only and surfaces parse/calculation errors without partial output;
- accurately limits verification claims to the committed worked-example test at 2H × 4H and 70/50/20: crosswise 11.0, endwise 13.1 and background luminance approximately 8.71 cd/m²;
- explicitly labels the output presentation-only and non-authoritative;
- contains no approval, sealing, project generation, persistence, network, filesystem or cross-lane seam.

### Test and gate evidence

- Focused changed-file `lab-ies` execution: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated feature commit execution: 159/159 passed.
- Failed, cancelled, skipped and todo counts were all zero in each execution.

### Commit and push evidence

- commit: `56c8921d92d324701605d03aa7368646e4d4e063`;
- subject: `lab: checkpoint UGR surface`;
- files: exactly `packages/lab-kernel/ies-toolkit/ugr.html`;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- post-feature state: staged 0, modified 0, untracked 34, deleted 0;
- all unrelated dirty paths were preserved.

## LAB-014 summary normalise surface — 2026-07-19

### Identity and scope

Observed through `repo_info`, `repo_git_status`, `repo_git_recent`, `repo_scope_guard`, source inspection, repository grep and the connected gate:

- app: `ControlStack Lab and IES Authority Lane`;
- lane: `lab-ies`;
- root: `C:\ControlStack_Worktrees\code-pilot-lab`;
- branch: `lane/code-pilot-lab`;
- starting HEAD: `4132fe346739f9d367a9cdd32146789d6da0292d`;
- queue item: `LAB-014-summary-normalise-surface`;
- authorised path only: `packages/lab-kernel/ies-toolkit/summary.html`;
- seam change: no.

### Behaviour evidence

The completed Lab-only surface:

- imports the committed `renderPolar` implementation and removes its inline duplicate polar kernel;
- imports `CANONICAL_KEYWORDS`, filters non-empty rows and emits them in exact canonical order;
- uses `_INTERNAL_AMBIENT_TA_C` and contains no stale `_AMBIENT_TA_C` emission;
- confines mains voltage, watts annotation, board/driver temperatures, Lab ambient and intended use to Lab-only provenance instead of supplementary outgoing keywords;
- previews the exact LM-63 header form, canonical keyword rows, `TILT=NONE`, G-values and angle blocks while explicitly omitting candela values for readability;
- preserves the existing dimensions → metadata → level → symmetrise → interpolate → pad → one-millimetre → orientation sequence;
- contains no authority approval/sealing, merge, project generation, persistence, resolver publication, network, browser-storage or filesystem seam.

### Test and gate evidence

- Focused changed-file `lab-ies` execution: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated feature commit execution: 159/159 passed.
- Failed, cancelled, skipped and todo counts were all zero in each execution.

### Commit and push evidence

- commit: `ba724e8130858c2ad5b298b3444a18eb90e5dd35`;
- subject: `lab: checkpoint summary normalise surface`;
- files: exactly `packages/lab-kernel/ies-toolkit/summary.html`;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- post-feature state: staged 0, modified 0, untracked 35, deleted 0;
- all unrelated dirty paths were preserved.

## LAB-013 canonical polar renderer — 2026-07-19

### Identity and scope

Observed through `repo_info`, `repo_git_status`, `repo_git_recent`, `repo_scope_guard`, source inspection, repository grep and the connected gate:

- app: `ControlStack Lab and IES Authority Lane`;
- lane: `lab-ies`;
- root: `C:\ControlStack_Worktrees\code-pilot-lab`;
- branch: `lane/code-pilot-lab`;
- starting HEAD: `f397cd5928f9a33288c5f465517d5e241124708e`;
- queue item: `LAB-013-polar-renderer`;
- authorised path only: `packages/lab-kernel/ies-toolkit/iesPolar.js`;
- seam change: no.

### Behaviour evidence

The completed canonical renderer:

- keeps `niceCeil` deterministic and bounded for invalid numeric input;
- treats missing, malformed, non-finite, negative or dimensionally inconsistent photometry as empty presentation data rather than throwing;
- clones numeric angle and candela rows before rendering and does not mutate caller input;
- supports a single stored horizontal plane plus standard quadrant, half-azimuth and full-azimuth symmetry coverage;
- emits deterministic presentation-only SVG;
- contains no DOM lookup, import, browser-storage, network, filesystem, authority, normalisation or photometric-mutation seam;
- avoids spreading the complete candela matrix when determining peak intensity.

Repository search found inline polar snippets in protected untracked `labbench.html` and `provenance.html`. Those files are separate future queue items and were not changed or absorbed. `iesPolar.js` is the sole committed polar renderer and the canonical import target already used by the protected `summary.html` and `bench.html` surfaces.

### Test and gate evidence

- Focused changed-file `lab-ies` execution: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated feature commit execution: 159/159 passed.
- Failed, cancelled, skipped and todo counts were all zero in each execution.

### Commit and push evidence

- commit: `4339ecc9beb86fe5a1996b0715c809211cdcd920`;
- subject: `lab: checkpoint canonical polar renderer`;
- files: exactly `packages/lab-kernel/ies-toolkit/iesPolar.js`;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- post-feature state: staged 0, modified 1, untracked 35, deleted 0;
- protected modified path: `packages/lab-kernel/ies-toolkit/summary.html`;
- all unrelated dirty paths were preserved.

## LAB-012 shared Lab style foundation — 2026-07-19

### Identity and scope

Observed through `repo_info`, `repo_git_status`, `repo_git_recent`, `repo_scope_guard`, source inspection and repository grep:

- app: `ControlStack Lab and IES Authority Lane`;
- lane: `lab-ies`;
- root: `C:\ControlStack_Worktrees\code-pilot-lab`;
- branch: `lane/code-pilot-lab`;
- starting HEAD: `d0577a9d0157c53c56206ded32418a6746e0bdd8`;
- queue item: `LAB-012-lab-style-foundation`;
- authorised path only: `packages/lab-kernel/ies-toolkit/lab.css`;
- seam change: no.

### Behaviour evidence

The original untracked stylesheet was presentation-only but contained a prohibited Google Fonts `@import`. The completed parcel removed that external dependency while preserving the existing local/system font fallbacks, Lab surface classes and legacy CSS-variable aliases.

Repository grep confirmed no remaining `@import`, URL, HTTP, network, browser-storage or filesystem hook in the stylesheet. No HTML, JavaScript, authority vocabulary, business rule or cross-lane styling path was changed.

### Test and gate evidence

- Focused changed-file `lab-ies` execution: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated commit execution: 159/159 passed.
- Failed, cancelled, skipped and todo counts were all zero in each execution.

### Commit and push evidence

- commit: `e7a869e99c8b504e842d861bb5b6cbf9708e4d8c`;
- subject: `lab: checkpoint shared Lab style foundation`;
- files: exactly `packages/lab-kernel/ies-toolkit/lab.css`;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- post-feature state: staged 0, modified 1, untracked 36, deleted 0;
- protected modified path: `packages/lab-kernel/ies-toolkit/summary.html`;
- all unrelated dirty paths were preserved.

## LAB-011 project IES generation — 2026-07-19

### Identity and scope

Observed through `repo_info`, `repo_git_status`, `repo_git_recent`, `repo_scope_guard` and source reads:

- app: `ControlStack Lab and IES Authority Lane`;
- lane: `lab-ies`;
- root: `C:\ControlStack_Worktrees\code-pilot-lab`;
- branch: `lane/code-pilot-lab`;
- starting HEAD: `4a5b10171ba19b1262d416f58d67caf11e2c9b45`;
- queue item: `LAB-011-project-ies-generation`;
- authorised implementation/test paths only:
  - `packages/lab-kernel/ies-toolkit/iesProjectIes.js`;
  - `tests/lab-kernel/iesProjectIes.test.js`;
- no committed non-Lab caller was affected; the only additional caller found was the protected untracked `labbench.html` prototype.

### Behaviour evidence

The completed adapter:

- consumes the committed sealed reference DTO through `buildIesFromReference`;
- preserves the existing `buildProjectIes(reference, runLengthMm, project)` entry point;
- validates a bounded plain project envelope and rejects unsupported fields;
- requires a project identity and maps only supported selector values into the committed generator job;
- preserves the exact canonical keyword order;
- preserves generator text, filename, length, output multiplier, lumen and owned-watt results;
- replaces only generator provenance with deterministic project provenance bound to project identity, reference identity, reference kind and `referenceSha256`;
- does not mutate reference or project input;
- exposes no filesystem, network, browser-storage, private rich-authority, merge or direct low-level generation seam.

### Test and gate evidence

- Initial changed-file execution: 159 tests, 158 passed, 1 failed. The failure was the existing canonical migration guard requiring the active project generator source to name `CANONICAL_KEYWORDS`.
- Authorised correction: imported and fail-closed validated `CANONICAL_KEYWORDS` inside `iesProjectIes.js`; the prohibited migration test was not changed.
- Focused project test file: 5 tests passed as part of the changed-file gate execution.
- Changed-file execution after correction: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated commit execution: 159/159 passed.

### Commit and push evidence

- commit: `a21429528fd6bf50ef4b7b8fcbf0abe54d682b46`;
- subject: `lab: checkpoint project IES generation`;
- files: exactly the two authorised paths;
- push: origin `lane/code-pilot-lab`, confirmed successful;
- feature-checkpoint post-push state: staged 0, modified 2, untracked 37, deleted 0.

## Historical baseline evidence — 2026-07-17

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