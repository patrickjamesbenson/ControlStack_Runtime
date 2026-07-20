# Lab/IES Lane State

## Evidence timestamp

Latest standing-worker parcel verified on 2026-07-20 through the connected `ControlStack Lab and IES Authority Lane` app.

Current repository evidence overrides stale historical statements.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Recorded branch HEAD: `8dcbeb089bd87351716300d093acb70c72476cb7`
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`
- Starting HEAD for LAB-035: `285f14df8c1fc135b59c3ca87b467276866de3a4`
- Completed feature HEAD: `8dcbeb089bd87351716300d093acb70c72476cb7`
- Feature subject: `lab: checkpoint Selector contract stub`
- Feature push: confirmed on origin `lane/code-pilot-lab`

## Branch-HEAD synchronisation invariant

Before any queue item is selected, a worker must compare `Recorded branch HEAD` above with the actual current HEAD of `lane/code-pilot-lab`.

- Exact match: queue selection may continue.
- Mismatch: no implementation may start; reply `STOPPED - lane state is stale. Recorded HEAD <x>, actual HEAD <y>.` and reconcile lane memory first.
- Reconciliation must classify the unmatched commit, restore queue/evidence truth, run the full `lab-ies` gate, and commit/push only lane-memory changes.
- The worker that discovers a mismatch must not execute a queue item in that same run.
- Because a commit cannot contain its own final hash, this field is maintained as a deliberate post-push working-tree marker: after every documentation push, update only `Recorded branch HEAD` to the new actual HEAD and leave that single edit unstaged.
- The one unstaged marker is expected. It must never be staged with a feature parcel or treated as unrelated implementation drift.

## Connected capability state

- Write enabled: yes
- Git stage enabled: yes
- Git commit enabled: yes
- Git push enabled: yes
- Commit/push gated: yes
- Delete enabled: no
- Arbitrary shell execution: no
- Allowed gate: `lab-ies`

## Standing-role prompt authority

- `LANE_CHARTER.md` is the sole authoritative repository home for both standing prompts.
- Exactly one `STANDING WORKER — Lab & IES` prompt and one `STANDING ORCHESTRATOR — Lab & IES` prompt must exist there.
- `SESSION_HANDOFF.md` contains only current session evidence and exact one-line launch pointers to the charter.
- A fresh worker or orchestrator must read the charter and act from the recorded role prompt; neither role may invent a replacement from chat history.

## Standing-worker batch operating model

- One worker run may complete up to five consecutive parcels.
- Parcels remain strictly sequential, with one `ready` item at a time and separate feature/documentation checkpoints.
- The worker rechecks the live branch HEAD against the working-tree marker before every parcel, including later parcels in the same batch.
- After each successful documentation closeout, the worker refreshes the marker and immediately takes the next eligible item without waiting for Patrick.
- The batch ends immediately on seam approval required, stale lane state, any gate failure, out-of-scope behaviour, queue empty or acceptance requiring live application/browser/real-world observation.
- Human-observation acceptance cannot be closed from repository evidence. The item remains incomplete and the worker supplies exact `NEEDS YOU` steps.
- Orchestrator review occurs at seam, human-observation and five-parcel/stop boundaries rather than after each routine parcel.

## Latest completed parcel — LAB-035

Queue item `LAB-035-selector-contract-stub` is complete under the unchanged Program & Integrate approval of `LAB-035_SEAM_ENVELOPE.md`, version 1.

Exactly this one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/selector_stub.html
```

Verified outcome:

- the legacy upload, run-length, orientation, scaling, power, efficacy and delivery behaviours were removed;
- the page is now a read-only contract viewer over the exact approved safe identity, safe runtime handoff and Selector readiness presentation shapes;
- governed mode consumes only a caller-supplied bounded view, while offline mode uses visibly synthetic committed ready and blocked examples labelled `OFFLINE CONTRACT DEMO — NOT SELECTOR ACCEPTANCE`;
- exact-key validation rejects unsupported or over-rich fields, malformed schema/version values, invalid identity and resolver bindings, malformed fingerprints, contradictory readiness/blocker states, non-false safety flags and stale binding conflicts;
- the page does not import or execute Selector source, derive Selector values, invoke Engine, generate IES, add routes, persist state or create authority;
- the exact one-file gated checkpoint passed 255/255 and is confirmed on origin;
- LAB-036 is now the sole top `ready` item.

## Previous completed parcel — LAB-034

Queue item `LAB-034-legacy-labbench-classification` is complete.

Exactly this one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/labbench.html
```

Verified outcome:

- the legacy page is explicitly labelled compatibility/demo only and directs governed work to the committed Main Lab Bench;
- its only active workflow is read-only uploaded IES inspection through committed `parseIes`, `computeMetrics`, `describeIes` and `renderPolar` modules;
- duplicate inline polar, approval, provenance, reference-building, symmetrisation and project-generation implementations were removed;
- no reference promotion, serial, seal, resolver, download, persistence, browser storage, clock/random identity or cross-lane implementation remains;
- malformed IES input fails closed with no authority or project artefact created;
- the exact one-file gated checkpoint passed 255/255 and is confirmed on origin.

## Previous completed parcel — LAB-033

Queue item `LAB-033-main-lab-bench-surface` is complete.

Exactly this one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/bench.html
```

Verified outcome:

- the primary bench is an explicit non-authoritative browser-memory working surface;
- uploaded IES input is parsed through `parseIes`, summarised through committed metrics/inspection helpers and rendered with the canonical `renderPolar` module;
- working state is created through `createWorkingSession` and the fixed recipe delegates dimensions, metadata, Level, Symmetrise, Interpolate, Pad and one-millimetre reduction to committed controller and transform modules;
- the standard-grid adapter updates G3/G4 to the exact returned angle counts before the committed writer previews the result;
- the exact ordered 16-field profile is consumed from the committed keyword contract, stale and supplementary keywords are not emitted, and internal ambient remains sealed-reference-owned and non-editable;
- working preview/download is visibly separate from authority allocation, approval and sealing;
- project materialisation accepts only a separately supplied sealed reference DTO, validates its safe identity through the committed reference contract and delegates exclusively to `buildProjectIes`;
- no inline fingerprint, reference record, serial, seal, resolver, persistence, browser storage, clock/random identity or cross-lane implementation remains;
- independent and gated executions passed 255/255 and the exact one-file checkpoint is confirmed on origin.

## Previous completed corrective parcel — LAB-032A

Queue item `LAB-032A-canonical-keyword-migration-guard-correction` is complete.

Exactly this one authorised file was changed and committed:

```text
tests/lab-kernel/iesKeywordMigration.test.js
```

Verified outcome:

- the stale Main Bench requirement for an editable `sysTa` ambient write was removed;
- literal dependence on the retired `canonicalKeywordRows(...)` helper call shape was removed;
- the exact ordered 16-keyword profile remains enforced;
- stale `_AMBIENT_TA_C`, `_EMERGENCY_CAPABLE` alias and supplementary keyword rejection remain explicit;
- the Main Bench must consume the committed canonical keyword contract;
- `_INTERNAL_AMBIENT_TA_C` remains sealed-reference-owned and no editable Main Bench ambient input or project field is accepted;
- generator, merge, summary, project-adapter and project-builder canonical-vocabulary guards remain active;
- no production module, bench implementation, authority contract, sealed-reference schema, Selector, Runtime, Engine or Program implementation changed;
- full and gated executions passed 255/255 and the exact one-file checkpoint is confirmed on origin.

## Previous completed parcel — LAB-032

Queue item `LAB-032-merge-composition-surface` is complete.

Exactly this one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/ies_merge.html
```

Verified outcome:

- the page accepts two ordered browser-loaded sealed GT/OPT DTOs and delegates composition exclusively to `composeReferencePair`;
- geometry registration and operating state are fixed to the approved version-1 policy;
- the immutable candidate preserves parent ordinal, reference identity, kind, role and owned power order;
- the candidate is prominently labelled non-authoritative and retains assembly identity, ambient, emergency, EWIS and shared overhead as unresolved;
- no allocation, authority construction, approval, sealing, inherited assembly verification, persistence or resolver publication exists;
- project materialisation cannot consume the candidate and instead requires a separately supplied freshly approved and sealed MERGED DTO;
- sealed project materialisation delegates exclusively to `buildProjectIes` and browser-downloads only returned text;
- the offline unapproved fixture corpus is not misrepresented as sealed parent authority;
- focused and independent full executions passed 255/255 before the exact feature checkpoint was confirmed on origin.

## Previous completed parcel — LAB-031

Queue item `LAB-031-project-builder-surface` is complete.

Exactly this one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/ies_builder.html
```

Verified outcome:

- the page accepts one browser-loaded JSON object and delegates sealed-reference validation and project materialisation exclusively to `buildProjectIes`;
- project inputs are confined to project ID, integer run length, output multiplier and the adapter's seven canonical project-selection fields;
- internal ambient remains sealed-reference-owned and has no editable input;
- legacy rich-authority fields, fixture auto-load, resolver/store access and selector integration are absent;
- no inline parse, metrics, scaling, LM-63 writer or round-trip implementation remains;
- contract failures display exact fail-closed code/reason output without partial LM-63 text;
- downloads are created only in browser memory from the exact returned `iesText` and filename;
- no persistence, network, clock-generated import or background state exists;
- focused, independent and gated feature executions all passed 255/255.

## Previous completed parcel — LAB-030

Queue item `LAB-030-emergency-surface` is complete.

Exactly this one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/emergency.html
```

Verified outcome:

- the page imports and delegates all selection decisions to `selectEmergencyCandidate` from the committed emergency-selection contract;
- model, isolation, published voltage window, selected power, duration, design life and battery pack are rendered only from the returned contract projection;
- nominal current is displayed only with the returned `derived_exact` status and is explicitly not represented as tolerance, efficiency or derating evidence;
- unsupported voltage, power, duration, design-life and conflicting battery combinations remain blocked with the contract's exact blocker codes;
- procurement release remains false/not released;
- emergency and EWIS assembly verification remain unresolved/null and are displayed separately from evidence readiness;
- no duplicated model or battery matrix, inline electrical formula, order/procurement action, external datasheet route, browser storage, network, clock or persistence seam exists;
- focused, independent and gated feature executions all passed 255/255.

## Previous completed parcel — LAB-029

Queue item `LAB-029-provenance-publication-surfaces` is complete.

Exactly these three authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/provenance.html
packages/lab-kernel/ies-toolkit/provenance_explorer.html
packages/lab-kernel/ies-toolkit/luminaire_provenance.html
```

Verified outcome:

- all three pages implement the approved `controlstack.lab.provenance-publication-view.v1` presentation boundary;
- governed mode accepts only the approved safe identity projection and caller-supplied resolver availability state;
- offline mode reads only fixed committed safe fixture projections and remains prominently labelled `OFFLINE DEMO — UNAPPROVED`;
- resolver entries are canonical host-free paths, round-trip through the committed resolver helpers and never expose a host, storage location or raw body;
- evidence capability display delegates to the committed summary helper and remains category coverage only;
- emergency and EWIS assembly verification remain exactly null/unresolved;
- the deliberately incomplete fixture fails closed rather than being normalised into a stronger projection;
- no upload, download, browser storage, current-time generation, ID allocation, diagnostic authority value, public resolver, Program persistence or cross-lane implementation exists;
- focused, independent and gated feature executions all passed 255/255.

## Previous completed parcel — LAB-028

Queue item `LAB-028-reference-curation-surfaces` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/reference_builder.html
packages/lab-kernel/ies-toolkit/curator.html
```

Verified outcome:

- Patrick's browser evidence showed the legacy Reference Builder requested missing `nvb/boards.json` and `nvb/drivers.json` resources and returned 404s;
- the legacy builder nevertheless fabricated `NVB-REF-GT-000001` and `NVB-REF-OPT-000002`, serials and `sealedAt` timestamps from incomplete browser state;
- refresh correctly cleared that state, proving it was non-persistent, but the identity and sealing language remained a false authority claim;
- both replacement surfaces now create only explicit non-authoritative in-memory working drafts/plans;
- component selections consume the committed immutable component projection and use the correct committed fixture endpoints;
- document associations use the committed immutable document-register contract and only committed demo-source artefacts are clickable;
- an optional entered reference ID is syntax-checked only and never treated as an authority projection;
- no upload input, localStorage, clock/random ID generation, serial allocation, timestamp, resolver creation, evidence result, approval, download or cross-lane implementation exists;
- focused, independent and gated commit executions all passed 255/255.

## Previous completed parcel — LAB-027

Queue item `LAB-027-request-report-workflow` is complete.

Exactly these five authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/test_request.html
packages/lab-kernel/ies-toolkit/lab_request.html
packages/lab-kernel/ies-toolkit/extended_report.html
packages/lab-kernel/ies-toolkit/onemm_contract.html
tests/lab-kernel/labRequestReportWorkflow.test.js
```

Verified outcome:

- the four approved version-1 schema IDs are implemented exactly;
- request → order → extended report → reference intake remains additive with no customer, project, item, condition or requested-test rekeying;
- prior unresolved pointers survive every stage and new unresolved result/intake fields append explicitly;
- only canonical LAB-017 artefact references cross stages;
- outputs are deterministic, deeply immutable and preserve caller input;
- reference intake contains no serial, authority hash, approval, seal or sealed-reference schema;
- no Program database, CRM route, upload, localStorage, wildcard postMessage, raw file body, clock/random durable ID or cross-lane implementation exists;
- focused and full gates passed 255/255.

## Previous completed parcel — LAB-026

Queue item `LAB-026-document-equipment-surfaces` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/docs.html
packages/lab-kernel/ies-toolkit/equipment_register.html
```

Verified outcome:

- both surfaces are Lab-internal, offline, unapproved and browser-memory-only;
- the document surface uses only the committed immutable document-register contract for registration, many-to-many association and unlinking;
- only the eight committed `lab/sources/` fixtures receive clickable artefact links;
- unresolved documents and equipment evidence display explicit non-clickable text rather than implying a file exists;
- Patrick reported all prescribed browser behaviour passed except one legacy 404 artefact link, which was classified as a real acceptance defect and removed by this parcel;
- calibration dates, NATA notes, capabilities and events are labelled entered/demo and not verified unless evidence exists;
- no upload control, storage API, database, Program route, ledger append, equipment booking, authority record, approval, seal, outgoing IES or cross-lane artifact exists;
- refresh clears all entered records, associations, capability changes and draft events.

## Previous completed parcel — LAB-025

Queue item `LAB-025-component-library-surface` is complete.

Exactly this one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/component_library.html
```

Verified outcome:

- the surface consumes only the committed immutable component-catalogue and document-register contracts;
- board, driver and optic rows are projected from the committed offline fixture snapshot and labelled read-only, offline and unapproved;
- missing values remain visibly unresolved rather than being inferred, and hot-test evidence is explicitly not emergency verification;
- document records use caller-supplied safe IDs and canonical host-free source/evidence resolver paths;
- association and unlink operations replace immutable in-memory state only and clear on page refresh;
- no upload control, storage API, direct RuntimeData/database access, Program route, Selector contract, authority record, approval, seal or procurement decision exists;
- Patrick reported a 100% PASS against the prescribed Component Library browser checklist at the canonical local URL on 2026-07-20;
- the page fails closed with a visible error if fixture loading or projection validation fails.

## Earlier completed parcel — LAB-024

Queue item `LAB-024-resolver-fixture-corpus` is complete.

Exactly these 20 authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/lab/components/board/BRD-DNX80.json
packages/lab-kernel/ies-toolkit/lab/components/chip/CHIP-LM301H.json
packages/lab-kernel/ies-toolkit/lab/components/converter/ZC-EM-SMART-50.json
packages/lab-kernel/ies-toolkit/lab/components/driver/DRV-TRIDONIC-825.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-GT-000045/record.1mm.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/evidence/LM-79__safe-9f2a11.txt
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/evidence/evidence.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/origin.ies
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/provenance.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/record.1mm.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000124/record.1mm.json
packages/lab-kernel/ies-toolkit/lab/reports/LAB-20260715-142-EXT.json
packages/lab-kernel/ies-toolkit/lab/sources/DNX-80_board_datasheet.txt
packages/lab-kernel/ies-toolkit/lab/sources/Emergency_test_report.txt
packages/lab-kernel/ies-toolkit/lab/sources/EWIS_cartridge_report.txt
packages/lab-kernel/ies-toolkit/lab/sources/Samsung_LM301H_datasheet.txt
packages/lab-kernel/ies-toolkit/lab/sources/Samsung_LM301H_LM-80.txt
packages/lab-kernel/ies-toolkit/lab/sources/Samsung_LM301H_TM-21.txt
packages/lab-kernel/ies-toolkit/lab/sources/Tridonic_LC55_datasheet.txt
packages/lab-kernel/ies-toolkit/lab/sources/zc-em-smart-50_datasheet.txt
```

Verified outcome:

- every artifact is explicitly marked offline, demo and unapproved and cannot be mistaken for production authority or live RuntimeData;
- all component, reference, provenance, report, evidence and source links use canonical host-free LAB-017 resolver paths only;
- the corpus contains no URL host, local path, file URL, UNC path, traversal, credential, secret, token or diagnostic fingerprint field;
- authority and reference SHA values remain null rather than fabricated, and no fixture uses the production sealed-reference schema;
- emergency and EWIS assembly verification remain null, while procurement, certification, lifetime and test-result claims remain unresolved;
- the OPT-000123 set is internally coherent for offline resolver presentation, while OPT-000124 is deliberately incomplete to exercise fail-closed behaviour;
- the synthetic IES fixture uses the canonical 16-keyword vocabulary and remains explicitly unapproved;
- no JavaScript, HTML, database, route, Program, Runtime, Engine or Selector implementation was changed.

## Previous completed parcel — LAB-023

Queue item `LAB-023-nvb-lab-adapter` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/nvbLabAdapter.js
tests/lab-kernel/nvbLabAdapter.test.js
```

Verified outcome:

- the module exposes only the approved version-1 immutable NVB Lab projection API and schema constants;
- only exact LAB-018 resolution shapes and exact LAB-017 safe identity projections are accepted;
- gear-tray and optic references must remain GT and OPT respectively, while either optional slot may remain null;
- resolution path, family, selection, governing thermals and blocker order are preserved without mutation or rekeying;
- unresolved values remain explicit, while no reference ID, timestamp, authority state or diagnostic identity is generated;
- emergency and EWIS assembly verification remain exactly null;
- outputs are deeply immutable, inputs remain unchanged, and no loader, persistence, clock, browser storage, route, Program, Runtime, Engine or Selector implementation seam exists.

## Previous completed parcel — LAB-022

Queue item `LAB-022-reference-composition-kernel` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/iesMerge.js
tests/lab-kernel/iesReferenceComposition.test.js
```

Verified outcome:

- the module exposes only the approved version-1 reference-composition candidate API and schema constants;
- exactly two direct unique GT/OPT parents are required and their order remains provenance-significant;
- both sealed DTO identities, approvals, hashes, one-millimetre basis, geometry, angle grids, candela dimensions and parent-owned G12 values fail closed on mismatch;
- candela is summed cell-by-cell only on exactly coincident grids, with no interpolation, resampling, translation, rotation or N-parent behaviour;
- each parent-owned wall-power value is counted once, while shared overhead remains explicit and unresolved;
- the output is a deeply immutable `MERGED_CANDIDATE` with no allocated identity, serial, seal, approval, authority hash, inherited assembly identity, internal ambient, emergency verification or EWIS verification;
- inputs remain unchanged, and no UI, persistence, route, Program, Runtime, Engine or Selector implementation seam exists.

## Previous completed parcel — LAB-021

Queue item `LAB-021-emergency-selection-contract` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/zencontrolEmergency.js
tests/lab-kernel/zencontrolEmergency.test.js
```

Verified outcome:

- the module exposes only the approved version-1 emergency-selection interface and frozen evidence constants;
- candidate selection uses only published voltage windows and blocks the shared 50 V boundary for engineering review;
- published, derived and unconfirmed values remain distinct;
- nominal drive current is exact advisory arithmetic and is not represented as tolerance, efficiency or derating evidence;
- only published power, duration and design-life combinations can produce a candidate;
- unsupported combinations and the known conflicting battery publication fail closed;
- every candidate keeps procurement release false, preserves procurement blockers and leaves emergency/EWIS assembly verification null;
- outputs are deterministic and deeply immutable, inputs and exported evidence remain unchanged, and no ordering, source URL, persistence, route, network, filesystem or browser-storage seam exists.

The feature checkpoint appeared while the standing-prompt documentation edit was in progress. The branch-HEAD guard therefore forced memory-only reconciliation; the independent full gate passed 215/215 and no later queue item was executed in this reconciliation run.

## Previous completed parcel — LAB-020

Queue item `LAB-020-document-register-contract` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/docRegister.js
tests/lab-kernel/docRegister.test.js
```

Verified outcome:

- the module exposes only the approved version-1 immutable document-register API and schema constants;
- callers supply document and entity IDs; the Lab contract allocates no durable identity or counter;
- registration reuses only identical non-null canonical source references or lower-case raw SHA-256 values;
- duplicate IDs, ambiguous dedupe keys and conflicting metadata fail closed;
- many-to-many linking is deterministic and idempotent, while unlinking removes only one association and never deletes source evidence;
- list, entity and document queries return stable sorted deeply immutable projections;
- state and source inputs remain unchanged, and no upload, file read, hashing, persistence, network, database, browser storage, clock or diagnostic-fingerprint seam exists.

## Previous completed parcel — LAB-019

Queue item `LAB-019-component-projection-contract` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/nvbComponents.js
tests/lab-kernel/nvbComponents.test.js
```

Verified outcome:

- the module exposes only the approved version-1 component-catalogue projection API and schema constants;
- board rows group only by the exact family, LED-chip and vendor tuple;
- CCT values come only from first- and second-channel source fields, are canonicalised, deduplicated and sorted numeric-first;
- tunable state is true only when a second CCT exists or channel count is at least two;
- conflicting platform scalar values fail closed instead of using first-row wins;
- drivers deduplicate only by exact non-empty model and conflicting duplicates fail closed;
- optics require unique exact BOM IDs and are emitted in stable ascending order;
- outputs are deeply immutable, inputs remain unchanged, and no loader, embedded catalogue, persistence, clock, Program reader or Selector option seam exists.

## Previous completed parcel — LAB-018

Queue item `LAB-018-nvb-resolution-contract` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/nvbResolve.js
tests/lab-kernel/nvbResolve.test.js
```

Verified outcome:

- the module exposes only the approved version-1 NVB resolution API and frozen constants;
- family and test-path classification are deterministic and fail closed;
- governing thermals resolve only from one nominated worst-case row in the selected family;
- optic matching uses exact BOM ID first, otherwise exact family plus variant, and duplicate or missing matches block resolution;
- hot-test provenance remains an opaque evidence reference and never becomes emergency verification or a thermal source;
- Lab-form rows split only by exact `ies` and `check` kinds, with unknown kinds remaining blockers;
- outputs are deeply immutable, source inputs remain unchanged, and no live loader, database, filesystem, network, DOM, clock, random, storage or Selector seam exists;
- the committed offline Lab form currently lacks the approved `kind` discriminator, so those fixture rows correctly remain fail-closed until a separately authorised fixture parcel addresses them.

## Previous completed parcel — LAB-017

Queue item `LAB-017-reference-resolver-contract` is complete.

Exactly these two authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/nvbReference.js
tests/lab-kernel/nvbReference.test.js
```

Verified outcome:

- the module exports only the approved version-1 public interface and frozen constants;
- GT, OPT and MERGED identities use exact six-digit canonical IDs and fail closed on unsupported values;
- sealed DTO identity projection is exact, deeply immutable and excludes private authority, photometry, keywords, evidence bodies, diagnostics and assembly verification;
- seven resolver path kinds build and parse canonical host-free paths only;
- unsafe URLs, hosts, local paths, traversal, encoded separators, malformed IDs and unsupported component kinds fail closed;
- evidence summaries are deterministic and deeply immutable, while emergency and EWIS assembly verification remain `null`;
- production allocation, hosting, routing, persistence, authentication, deployment and endpoints remain Program-owned;
- the five named protected legacy Lab prototypes were not changed and may remain incompatible until their later queue parcels.

## Previous completed parcel — LAB-016

Queue item `LAB-016-nvb-offline-fixtures` is complete.

Exactly these seven authorised files were changed and committed:

```text
packages/lab-kernel/ies-toolkit/nvb/board_platforms.json
packages/lab-kernel/ies-toolkit/nvb/derived_resolution.json
packages/lab-kernel/ies-toolkit/nvb/drivers_unique.json
packages/lab-kernel/ies-toolkit/nvb/lab_form.json
packages/lab-kernel/ies-toolkit/nvb/optics.json
packages/lab-kernel/ies-toolkit/nvb/spec_codes.json
packages/lab-kernel/ies-toolkit/nvb/systems.json
```

Verified outcome:

- the seven files are committed as a bounded offline development fixture snapshot and are not represented as the live RuntimeData authority source;
- the locked 16-field Lab form remains exact and unchanged;
- no schema was added or replaced;
- literal `today` status values were replaced with the fixed snapshot timestamp `2026-07-19T00:00:00`;
- the 60 mm opal direct baseline and two duplicated system-height descriptions were reconciled with their own structured records;
- derived optic rows align with the observed system families, worst-case labels and optic/spec-code records;
- repository search found no local path, file URL, UNC path, credential, secret, token or API key;
- no JavaScript, HTML, resolver, production database or cross-lane path was changed.

## Validation evidence

The connected app exposes the fixed `lab-ies` gate as the available changed-file and full validation path.

- Gated LAB-035 feature checkpoint execution: 255 tests, 255 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.

## Protected final Git state

The protected working-tree state after documentation closeout is:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in this file;
- untracked: 6;
- deleted: 0.

Protected untracked paths:

```text
README.zip
docs/_context/ControlStack_summary_normalise_harness_spec.md
packages/lab-kernel/ies-toolkit/index.html
packages/lab-kernel/ies-toolkit/lab.html
scripts/clear_chaff.ps1
serve.mjs
```

The explicitly non-queued paths remain untouched. The Selector-owned leak paths remain absent from the dirty inventory and were not touched:

```text
packages/workspace-kernel/selectorReferenceOptionsService.js
tests/selectorCascadeCorrectness.test.js
```

## LAB-017 approved seam state

- Program & Integrate approved LAB-017 version 1 unchanged on 2026-07-19.
- Approved seam envelope: `docs/_context/lanes/lab-ies/LAB-017_SEAM_ENVELOPE.md`.
- Implemented scope was exactly:
  - `packages/lab-kernel/ies-toolkit/nvbReference.js`;
  - `tests/lab-kernel/nvbReference.test.js`.
- The implementation stayed within the fixed API, identity and resolver-path shapes, evidence-readiness semantics, named compatibility break, rollback order and specified tests.
- Program retains production allocation, resolver hosting, routing, persistence, authentication, deployment and endpoint ownership.
- Any change to the approved envelope requires a new seam decision.
- LAB-017 is complete and confirmed on origin.
- Program & Integrate accepted the exact immutable completion receipt on 2026-07-20 without amendment.
- Program reported its final acceptance gate passed 45/45, the acceptance checkpoint was committed and pushed, and the Program tree was clean.
- Promotion to main remains separate from this acceptance closeout.

## Consolidated seam envelope state

- Approved envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`.
- Envelope version: `1`.
- Program & Integrate approved all seven covered seams on 2026-07-20.
- Program reported gate 45/45 passed, the decision committed and pushed, and its tree clean.
- The six ordinary seams are approved unchanged.
- LAB-022 is approved with exactly two unique non-MERGED parents, immutable order-significant provenance, exactly matching grids without interpolation/resampling, and allocation/authority/approval/sealing outside the kernel; violations fail closed.
- LAB-018, LAB-019, LAB-020, LAB-021, LAB-022 and LAB-023 are complete and confirmed in current branch history.
- LAB-024 is complete and confirmed on origin as a bounded offline resolver fixture corpus.
- LAB-025 is complete and confirmed on origin as the Lab-only component library surface.
- LAB-026 is complete and confirmed on origin as the Lab-only document and equipment support surfaces.
- LAB-027 is complete and confirmed on origin as the approved additive request/report/reference-intake workflow.
- LAB-028 is complete and confirmed on origin as the bounded non-authoritative reference-draft and evidence-curation surfaces.
- LAB-029 seam envelope version 1 is approved unchanged by Program & Integrate; it reuses the approved safe identity, host-free resolver and evidence-capability contracts without moving Program ownership.
- Program reported gate 45/45 passed, the approval decision committed and pushed, and its tree clean.
- LAB-029 is complete and confirmed on origin as the exact approved three-file provenance publication parcel.
- LAB-030 is complete and confirmed on origin as the Lab-only emergency selection surface.
- LAB-031 is complete and confirmed on origin as the Lab-only project IES builder surface.
- LAB-032 is complete and confirmed on origin as the Lab-only ordered merge-composition surface.
- LAB-032A is complete and confirmed on origin as the approved one-file canonical-keyword migration guard correction.
- LAB-033 is complete and confirmed on origin as the bounded non-authoritative Main Lab Bench surface.
- LAB-034 is complete and confirmed on origin as the read-only legacy compatibility classification.
- LAB-035 is complete and confirmed on origin as the approved read-only Selector contract viewer.
- Gated LAB-035 execution passed 255/255.
- LAB-036 is the sole top `ready` item.
- No parallel or combined implementation is authorised.
- The earlier LAB-018 approval hold remains superseded.

## Queue state

- `LAB-010-reference-driven-generation`: done.
- `LAB-011-project-ies-generation`: done.
- `LAB-012-lab-style-foundation`: done.
- `LAB-013-polar-renderer`: done.
- `LAB-014-summary-normalise-surface`: done.
- `LAB-015-ugr-surface`: done.
- `LAB-016-nvb-offline-fixtures`: done.
- `LAB-017-reference-resolver-contract`: done.
- `LAB-018-nvb-resolution-contract`: done.
- `LAB-019-component-projection-contract`: done.
- `LAB-020-document-register-contract`: done.
- `LAB-021-emergency-selection-contract`: done.
- `LAB-022-reference-composition-kernel`: done.
- `LAB-023-nvb-lab-adapter`: done.
- `LAB-024-resolver-fixture-corpus`: done.
- `LAB-025-component-library-surface`: done.
- `LAB-026-document-equipment-surfaces`: done.
- `LAB-027-request-report-workflow`: done.
- `LAB-028-reference-curation-surfaces`: done.
- `LAB-029-provenance-publication-surfaces`: done.
- `LAB-030-emergency-surface`: done.
- `LAB-031-project-builder-surface`: done.
- `LAB-032-merge-composition-surface`: done.
- `LAB-032A-canonical-keyword-migration-guard-correction`: done.
- `LAB-033-main-lab-bench-surface`: done.
- `LAB-034-legacy-labbench-classification`: done.
- `LAB-035-selector-contract-stub`: done.
- Next ordered item: `LAB-036-lab-shell-server`.
- Resulting status: `ready`.
- Ready items: exactly one — LAB-036.
- Seam approval required: no.
- Human observation required before implementation: no.

LAB-035 is complete. LAB-036 is the sole top ready parcel for the next standing-worker continuation.
