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
- Starting HEAD for LAB-014: `4132fe346739f9d367a9cdd32146789d6da0292d`
- Completed feature HEAD: `ba724e8130858c2ad5b298b3444a18eb90e5dd35`
- Feature subject: `lab: checkpoint summary normalise surface`
- Feature push: confirmed on origin `lane/code-pilot-lab`

## Connected capability state

- Write enabled: yes
- Git stage enabled: yes
- Git commit enabled: yes
- Git push enabled: yes
- Commit/push gated: yes
- Delete enabled: no
- Arbitrary shell execution: no
- Allowed gate: `lab-ies`

## Latest completed parcel — LAB-014

Queue item `LAB-014-summary-normalise-surface` is complete.

Exactly one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/summary.html
```

Verified outcome:

- the surface remains a Lab-only, non-authoritative summary and normalisation harness;
- the inline polar implementation was removed and replaced by the committed `renderPolar` import;
- the exact committed `CANONICAL_KEYWORDS` contract is imported and used to filter and order outgoing preview rows;
- the preview shows the LM-63 header, canonical keywords, TILT line, G-values and angle blocks without replacing the committed writer;
- `_INTERNAL_AMBIENT_TA_C` replaces the stale ambient keyword;
- supplementary power, thermal and intended-use values remain in Lab-only provenance rather than outgoing IES keywords;
- the existing order remains dimensions, metadata, level, symmetrise, interpolate, pad, one-millimetre reduction and orientation;
- no authority approval/sealing, merge, project generation, persistence, resolver publication or imported production-module change was introduced.

## Validation evidence

The connected app exposes the fixed `lab-ies` gate as the available changed-file and full validation path.

- Focused changed-file execution for `summary.html`: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Full `lab-ies` gate: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Gated feature commit execution: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.

## Protected final Git state

The protected working-tree state after the feature push, and the state to remain after documentation closeout, is:

- staged: 0;
- modified: 0;
- untracked: 35;
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
tests/lab-kernel/iesKeywordMigration.test.js
```

The explicitly non-queued paths remain untouched. The Selector-owned leak paths remain absent from the dirty inventory and were not touched:

```text
packages/workspace-kernel/selectorReferenceOptionsService.js
tests/selectorCascadeCorrectness.test.js
```

## Queue state

- `LAB-010-reference-driven-generation`: done.
- `LAB-011-project-ies-generation`: done.
- `LAB-012-lab-style-foundation`: done.
- `LAB-013-polar-renderer`: done.
- `LAB-014-summary-normalise-surface`: done.
- Next item: `LAB-015-ugr-surface`.
- Resulting status: `ready`, because its style dependency is done and no seam approval is required.

No subsequent queue item was executed.
