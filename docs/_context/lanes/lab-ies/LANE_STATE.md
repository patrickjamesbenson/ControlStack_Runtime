# Lab/IES Lane State

## Evidence timestamp

Latest standing-worker parcel verified on 2026-07-19 through the connected `ControlStack Lab and IES Authority Lane` app.

Current repository evidence overrides stale historical statements.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Recorded branch HEAD: `a01f3f386ae7e7f1917efa82a896b5a6c235532c`
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`
- Starting HEAD for LAB-016: `1df62fccd91ac66509b02960ad988f6ef90c0b52`
- Completed feature HEAD: `ae14232b5a4fbff6fca15004a0583047fc5a319d`
- Feature subject: `lab: checkpoint offline NVB fixtures`
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

## Latest completed parcel — LAB-016

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

- Focused changed-file execution for the seven NVB fixture files: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Full `lab-ies` gate: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Gated feature commit execution: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.

## Protected final Git state

The protected working-tree state after documentation closeout is:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in this file;
- untracked: 33;
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
packages/lab-kernel/ies-toolkit/nvbReference.js
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
- Approved implementation scope is exactly:
  - `packages/lab-kernel/ies-toolkit/nvbReference.js`;
  - `tests/lab-kernel/nvbReference.test.js`.
- Approval covers the fixed API, identity and resolver-path shapes, evidence-readiness semantics, named compatibility break, rollback order and specified success/failure tests.
- Program retains production allocation, resolver hosting, routing, persistence, authentication, deployment and endpoint ownership.
- Any change to the approved envelope requires a new seam decision.
- LAB-017 may proceed as the single top ready queue item.

## Queue state

- `LAB-010-reference-driven-generation`: done.
- `LAB-011-project-ies-generation`: done.
- `LAB-012-lab-style-foundation`: done.
- `LAB-013-polar-renderer`: done.
- `LAB-014-summary-normalise-surface`: done.
- `LAB-015-ugr-surface`: done.
- `LAB-016-nvb-offline-fixtures`: done.
- Next ordered item: `LAB-017-reference-resolver-contract`.
- Resulting status: `ready`, because Program & Integrate approval of version 1 is recorded.
- Ready items: exactly LAB-017.

No LAB-017 implementation had started at the time of this approval checkpoint.
