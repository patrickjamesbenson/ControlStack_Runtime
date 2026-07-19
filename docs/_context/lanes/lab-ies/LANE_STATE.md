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
- Recorded branch HEAD: `9c2c32c2f6ce81d987c5017877ae9b32e1246a13`
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`
- Starting HEAD for LAB-017: `09ac99cb35b6af45696b4c83e0051a1651bb2f14`
- Completed feature HEAD: `2333c1197abf898e7a680455f99918823cb76e30`
- Feature subject: `lab: checkpoint reference resolver contract`
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

## Latest completed parcel — LAB-017

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

- Focused changed-file execution for the two LAB-017 files: 169 tests, 169 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Full `lab-ies` gate: 169 tests, 169 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Gated feature commit execution: 169 tests, 169 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.

## Protected final Git state

The protected working-tree state after documentation closeout is:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in this file;
- untracked: 32;
- deleted: 0.

Protected untracked paths:

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
packages/lab-kernel/ies-toolkit/iesMerge.js
packages/lab-kernel/ies-toolkit/ies_builder.html
packages/lab-kernel/ies-toolkit/ies_merge.html
packages/lab-kernel/ies-toolkit/index.html
packages/lab-kernel/ies-toolkit/lab.html
packages/lab-kernel/ies-toolkit/lab/
packages/lab-kernel/ies-toolkit/lab_request.html
packages/lab-kernel/ies-toolkit/labbench.html
packages/lab-kernel/ies-toolkit/luminaire_provenance.html
packages/lab-kernel/ies-toolkit/nvbComponents.js
packages/lab-kernel/ies-toolkit/nvbLabAdapter.js
packages/lab-kernel/ies-toolkit/nvbResolve.js
packages/lab-kernel/ies-toolkit/onemm_contract.html
packages/lab-kernel/ies-toolkit/provenance.html
packages/lab-kernel/ies-toolkit/provenance_explorer.html
packages/lab-kernel/ies-toolkit/reference_builder.html
packages/lab-kernel/ies-toolkit/selector_stub.html
packages/lab-kernel/ies-toolkit/test_request.html
packages/lab-kernel/ies-toolkit/zencontrolEmergency.js
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

- Proposed envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`.
- Envelope version: `1`.
- Covered blocked items: LAB-018, LAB-019, LAB-020, LAB-021, LAB-022, LAB-023 and LAB-027.
- Each item now has an exact implementation file set plus dedicated focused-test scope.
- Program & Integrate may make one batch decision, but approved items still enter execution one at a time under dependency order and the single-top-ready rule.
- LAB-022 requires express owner ratification of its binary merge policy inside the batch decision; if not ratified, the other six may be approved while LAB-022 remains blocked.
- No covered item is approved or ready yet.

## Queue state

- `LAB-010-reference-driven-generation`: done.
- `LAB-011-project-ies-generation`: done.
- `LAB-012-lab-style-foundation`: done.
- `LAB-013-polar-renderer`: done.
- `LAB-014-summary-normalise-surface`: done.
- `LAB-015-ugr-surface`: done.
- `LAB-016-nvb-offline-fixtures`: done.
- `LAB-017-reference-resolver-contract`: done.
- Next ordered item: `LAB-018-nvb-resolution-contract`.
- Resulting status: `blocked`, because its separate Program & Integrate seam approval is not recorded.
- Ready items: none.

No subsequent queue item was executed.
