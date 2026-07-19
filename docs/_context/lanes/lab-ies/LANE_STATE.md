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
- Starting HEAD for LAB-015: `8c4f7f94ce6eb642ee4a079247e737e914e82194`
- Completed feature HEAD: `56c8921d92d324701605d03aa7368646e4d4e063`
- Feature subject: `lab: checkpoint UGR surface`
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

## Latest completed parcel — LAB-015

Queue item `LAB-015-ugr-surface` is complete.

Exactly one authorised file was changed and committed:

```text
packages/lab-kernel/ies-toolkit/ugr.html
```

Verified outcome:

- the surface is a standalone Lab-only presentation over the committed UGR modules;
- parsing delegates to `parseIes`, CIE 190 calculation delegates to `computeUgr190Table`, and markup delegates to `renderUgrTableHTML` with `UGR_CSS`;
- the page contains no UGR formula or calculation implementation;
- static local imports replace the prior time-varying cache-busting imports;
- uploaded IES content is read in memory only and the source model is not mutated by the surface;
- malformed input fails visibly without creating a partial result;
- verification wording is confined to the committed worked-example evidence: 2H × 4H at 70/50/20, crosswise 11.0, endwise 13.1 and background luminance approximately 8.71 cd/m²;
- the result is explicitly labelled presentation-only and non-authoritative;
- no approval, sealing, project generation, persistence, network route, cross-lane contract or production-kernel change was introduced.

## Validation evidence

The connected app exposes the fixed `lab-ies` gate as the available changed-file and full validation path.

- Focused changed-file execution for `ugr.html`: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Full `lab-ies` gate: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.
- Gated feature commit execution: 159 tests, 159 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit code 0.

## Protected final Git state

The protected working-tree state after the feature push, and the state to remain after documentation closeout, is:

- staged: 0;
- modified: 0;
- untracked: 34;
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
- `LAB-015-ugr-surface`: done.
- Next item: `LAB-016-nvb-offline-fixtures`.
- Resulting status: `ready`, because it has no dependencies and requires no seam approval.

No subsequent queue item was executed.
