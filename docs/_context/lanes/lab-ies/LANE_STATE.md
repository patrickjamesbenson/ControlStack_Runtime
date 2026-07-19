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
- Starting HEAD for LAB-013: `f397cd5928f9a33288c5f465517d5e241124708e`
- Completed feature HEAD: `4339ecc9beb86fe5a1996b0715c809211cdcd920`
- Feature subject: `lab: checkpoint canonical polar renderer`
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

## Latest completed parcel — LAB-013

Queue item `LAB-013-polar-renderer` is complete.

Exactly one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/iesPolar.js
```

Verified outcome:

- `niceCeil` is deterministic and returns a bounded fallback for non-finite or non-positive input;
- `renderPolar` is a pure presentation renderer and does not mutate its input;
- missing, malformed, non-finite, negative or dimensionally inconsistent angle/candela grids return the deterministic empty-polar projection rather than throwing;
- single stored horizontal planes and supported quadrant, half-azimuth and full-azimuth grids remain supported;
- output is presentation-only SVG with no DOM lookup, browser storage, network, filesystem, authority, normalisation or photometric mutation seam;
- peak calculation no longer spreads the complete candela matrix;
- the canonical module is the sole committed polar renderer. Duplicate snippets remain only in protected untracked future-queue prototypes and were not absorbed or changed.

## Validation evidence

The connected app exposes the fixed `lab-ies` gate as the available changed-file and full validation path.

- Focused changed-file execution for `iesPolar.js`: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Full `lab-ies` gate: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Gated feature commit execution: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.

## Protected final Git state

The protected working-tree state after the feature push, and the state to remain after documentation closeout, is:

- staged: 0;
- modified: 1;
- untracked: 35;
- deleted: 0.

Protected modified path:

```text
packages/lab-kernel/ies-toolkit/summary.html
```

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
- Next item: `LAB-014-summary-normalise-surface`.
- Resulting status: `ready`, because both dependencies are done and no seam approval is required.

No subsequent queue item was executed.