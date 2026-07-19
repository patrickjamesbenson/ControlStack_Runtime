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
- Recorded branch HEAD: `f53ac346aa999e6a3f4fca45efd12c568d262a17`
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`
- Starting HEAD for LAB-025: `f53ac346aa999e6a3f4fca45efd12c568d262a17`
- Completed feature HEAD: `78fe3ab23e4fd50b8c79af8f429687a91401a068`
- Feature subject: `lab: checkpoint component library surface`
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

## Latest completed parcel — LAB-025

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

## Previous completed parcel — LAB-024

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

- Focused changed-file execution for the one LAB-025 surface file: 245 tests, 245 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Independent full `lab-ies` gate: 245 tests, 245 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Gated feature commit execution: 245 tests, 245 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.

## Protected final Git state

The protected working-tree state after documentation closeout is:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in this file;
- untracked: 24;
- deleted: 0.

Protected untracked paths:

```text
README.zip
docs/_context/ControlStack_summary_normalise_harness_spec.md
packages/lab-kernel/ies-toolkit/bench.html
packages/lab-kernel/ies-toolkit/curator.html
packages/lab-kernel/ies-toolkit/docs.html
packages/lab-kernel/ies-toolkit/emergency.html
packages/lab-kernel/ies-toolkit/equipment_register.html
packages/lab-kernel/ies-toolkit/extended_report.html
packages/lab-kernel/ies-toolkit/ies_builder.html
packages/lab-kernel/ies-toolkit/ies_merge.html
packages/lab-kernel/ies-toolkit/index.html
packages/lab-kernel/ies-toolkit/lab.html
packages/lab-kernel/ies-toolkit/lab_request.html
packages/lab-kernel/ies-toolkit/labbench.html
packages/lab-kernel/ies-toolkit/luminaire_provenance.html
packages/lab-kernel/ies-toolkit/onemm_contract.html
packages/lab-kernel/ies-toolkit/provenance.html
packages/lab-kernel/ies-toolkit/provenance_explorer.html
packages/lab-kernel/ies-toolkit/reference_builder.html
packages/lab-kernel/ies-toolkit/selector_stub.html
packages/lab-kernel/ies-toolkit/test_request.html
scripts/clear_chaff.ps1
serve.mjs
tests/lab-kernel/iesKeywordMigration.test.js
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
- LAB-027 remains approved but sequence-blocked until its dependencies are completed and it becomes the single top eligible parcel.
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
- Next ordered item: `LAB-026-document-equipment-surfaces`.
- Resulting status: `ready`; it is a non-seam parcel and all dependencies are done.
- Ready items: exactly one — LAB-026.
- Approved sequence-blocked item: LAB-027.

LAB-025 was implemented, validated, committed and pushed as the single active parcel.
