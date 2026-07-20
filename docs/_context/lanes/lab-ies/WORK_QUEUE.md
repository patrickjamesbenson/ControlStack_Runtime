# Lab/IES Work Queue

## Operating model

- This file controls worker parcel selection. Bespoke parcel prompts are retired.
- `LANE_CHARTER.md` is the sole authoritative repository home for the standing worker and standing orchestrator prompts. `SESSION_HANDOFF.md` may point to them but must not be their only home.
- The orchestrator writes and orders items, obtains Integrate approval for seam changes, and reviews at seam, human-observation and worker-batch boundaries rather than after every routine parcel.
- One worker run may complete up to five consecutive parcels. Parcels remain strictly sequential and retain separate feature gates, exact staged-file checks, feature commits, documentation closeouts and pushes.
- Before the first parcel and before every later parcel in the same run, the worker must compare `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops parcel execution, requires lane-memory reconciliation only, and ends the batch; no queue item may run after that mismatch in the same worker run.
- A worker takes only the top `ready` item whose dependencies are `done` after the HEAD comparison passes.
- Before editing an item, the worker must determine whether its acceptance genuinely requires observation of the running application, a browser action or real-world judgement that repository evidence cannot prove. If so, it must make no completion claim, must not mark the item `done`, and must stop with `NEEDS YOU` plus exact click-by-click verification steps.
- After every successful documentation push, the worker updates only the working-tree `Recorded branch HEAD` marker to the new actual HEAD and leaves that single marker edit unstaged.
- After a successful closeout, the worker immediately selects the next eligible item and repeats until five parcels have completed or a stop boundary is reached. It does not wait for Patrick between successful parcels.
- Seam approval required, lane state stale, any gate failure, out-of-scope behaviour in an authorised file, queue empty and human-observation acceptance are successful stop boundaries. They end the batch immediately.
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- The worktree is intentionally dirty. Preserve all unrelated modified and untracked paths.
- Use `repo_green_commit_push` only after proving the staged set exactly equals the item's authorised files. Shared-tooling repair: `2e4d880`. Direct `repo_git_commit` remains guarded.
- Push only `lane/code-pilot-lab`; never write to main, another lane, or the read-only donor `C:\ControlStack_Lab`.
- A `seam change: yes` item must not be changed to `ready` until the queue records the relevant Program & Integrate approval.
- One Program & Integrate batch approval may cover multiple seam items when it identifies the committed consolidated envelope and each approved item. Batch approval never creates multiple ready items: dependency order and the single-top-ready rule remain mandatory.
- The Selector leak paths must remain absent:
  - `packages/workspace-kernel/selectorReferenceOptionsService.js`
  - `tests/selectorCascadeCorrectness.test.js`

## Reply status

Every reply begins with one of the role-appropriate status lines:

- worker `AUTO - five-parcel batch completed on lane/code-pilot-lab. No action from Patrick.`
- orchestrator `AUTO - lane ordered for the standing worker. No action from Patrick.`
- `SEND TO INTEGRATE - <role-appropriate seam or promotion handoff>. Patrick pastes this to Program & Integrate.`
- `NEEDS YOU` followed by the exact `What / Do / Why / Recommend` action block
- `STOPPED - <boundary>. Orchestrator decision needed.`

`AUTO` is lane-only, never main. A genuine `STOPPED` is a successful boundary result. Workers do not issue a final reply after each successful parcel inside a batch; they report once at the five-parcel limit or the first stop boundary.

## Queue status

- `done` — committed and confirmed on origin.
- `ready` — exactly one top parcel authorised for the next standing worker.
- `queued` — bounded and ordered, but not yet the top runnable parcel.
- `blocked` — requires a recorded owner/Integrate decision, or is approved but held by the single-active-parcel sequence rule.

## Queue

### Q-0 Reference-driven IES generation
- id: LAB-010-reference-driven-generation
- objective: Materialise deterministic LM-63 output from the committed sealed one-millimetre reference DTO.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/iesFromReference.js`
  - `tests/lab-kernel/iesFromReference.test.js`
- prohibitions:
  - no project workflow;
  - no `iesMerge.js`;
  - no UI/HTML/CSS;
  - no keyword migration test;
  - no persistence seam.
- acceptance: Fixed sealed-reference validation, fail-closed deterministic generation, immutable inputs, canonical keywords and full gate are proven; exact files are committed and pushed.
- gate: lab-ies
- depends on: none
- on success next: LAB-011-project-ies-generation
- seam change: no
- status: done

Evidence: `bda7d61aaa037ea6a828f40d94ead77949ae7439`, confirmed on origin.

### Q-1 Project IES generation
- id: LAB-011-project-ies-generation
- objective: Replace the legacy rich-authority project builder with a deterministic project adapter over the committed sealed-reference generator.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/iesProjectIes.js`
  - `tests/lab-kernel/iesProjectIes.test.js`
- prohibitions:
  - no changes to `iesFromReference.js` or any completed dependency;
  - no `iesMerge.js`;
  - no UI/HTML/CSS;
  - no `tests/lab-kernel/iesKeywordMigration.test.js`;
  - no rich private authority input, raw working bytes or diagnostic fingerprints;
  - no filesystem, network or browser-storage persistence;
  - no new or changed cross-lane API, runtime route or Selector integration;
  - no unrelated export, merge, normalisation, provenance-publication or generator work.
- acceptance: The module consumes the committed sealed reference DTO, delegates core materialisation to the committed reference-driven generator, does not mutate inputs, fails closed on malformed or unsupported project input, emits deterministic project provenance bound to reference identity and `referenceSha256`, preserves canonical keywords, scales length/candela/owned watts consistently, has focused success/rejection/determinism/no-persistence coverage, and has no committed non-Lab caller affected. Full `lab-ies` passes and exactly the two authorised files are committed as `lab: checkpoint project IES generation` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-010-reference-driven-generation
- on success next: LAB-012-lab-style-foundation
- seam change: no
- status: done

Evidence: `a21429528fd6bf50ef4b7b8fcbf0abe54d682b46`, confirmed on origin.

### Q-2 Shared Lab style foundation
- id: LAB-012-lab-style-foundation
- objective: Checkpoint the shared Lab visual foundation as a presentation-only dependency for the remaining HTML tool surfaces.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/lab.css`
- prohibitions:
  - no HTML or JavaScript changes;
  - no embedded data, business rules or authority vocabulary;
  - no external font, analytics, network or persistence dependency;
  - no Selector, Runtime or Program styling ownership.
- acceptance: The stylesheet is self-contained, deterministic, browser-safe, contains presentation only, supports the existing Lab surface classes without hidden behavioural coupling, and introduces no cross-lane contract. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint shared Lab style foundation` and pushed only to the lane branch.
- gate: lab-ies
- depends on: none
- on success next: LAB-013-polar-renderer
- seam change: no
- status: done

Evidence: `e7a869e99c8b504e842d861bb5b6cbf9708e4d8c`, confirmed on origin.

### Q-3 Canonical polar renderer
- id: LAB-013-polar-renderer
- objective: Checkpoint the single-source deterministic polar renderer used by Lab visual surfaces.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/iesPolar.js`
- prohibitions:
  - no HTML/CSS changes;
  - no photometric mutation, normalisation or authority behaviour;
  - no DOM lookup, browser storage, network or filesystem access;
  - no duplicated polar implementation in another file.
- acceptance: `niceCeil` and `renderPolar` are pure and deterministic, handle empty and supported symmetry grids fail-safely, do not mutate input, emit presentation-only SVG, and remain the only queued polar implementation. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint canonical polar renderer` and pushed only to the lane branch.
- gate: lab-ies
- depends on: none
- on success next: LAB-014-summary-normalise-surface
- seam change: no
- status: done

Evidence: `4339ecc9beb86fe5a1996b0715c809211cdcd920`, confirmed on origin.

### Q-4 Summary normalise surface
- id: LAB-014-summary-normalise-surface
- objective: Checkpoint the protected summary/normalise harness as a Lab-only consumer of committed normalisation, polar and canonical-keyword foundations.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/summary.html`
- prohibitions:
  - no production authority approval or sealing;
  - no merge, project generation, persistence or resolver publication;
  - no inline duplicate polar kernel;
  - no non-canonical outgoing keyword emission;
  - no changes to imported production modules.
- acceptance: The surface imports the committed polar renderer and canonical keyword contract, previews LM-63 header/keywords/G-values without replacing the committed writer, uses `_INTERNAL_AMBIENT_TA_C`, emits no stale or supplementary outgoing keywords, preserves existing normalisation order, and remains Lab-only. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint summary normalise surface` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-012-lab-style-foundation, LAB-013-polar-renderer
- on success next: LAB-015-ugr-surface
- seam change: no
- status: done

Evidence: `ba724e8130858c2ad5b298b3444a18eb90e5dd35`, confirmed on origin.

### Q-5 UGR surface
- id: LAB-015-ugr-surface
- objective: Checkpoint the standalone Lab UGR presentation over the committed UGR and CIE 190 kernels.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/ugr.html`
- prohibitions:
  - no UGR formula or kernel duplication;
  - no changes to `iesUgr.js` or `iesUgrCie190.js`;
  - no authority, project-generation or cross-lane behaviour;
  - no persistence or network route.
- acceptance: The surface delegates all calculations to committed modules, remains deterministic and read-only over uploaded IES input, clearly distinguishes presentation from governed reference authority, and introduces no new output contract. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint UGR surface` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-012-lab-style-foundation
- on success next: LAB-016-nvb-offline-fixtures
- seam change: no
- status: done

Evidence: `56c8921d92d324701605d03aa7368646e4d4e063`, confirmed on origin.

### Q-6 NVB offline fixture snapshot
- id: LAB-016-nvb-offline-fixtures
- objective: Checkpoint the bounded offline NVB fixture snapshot used only by Lab development surfaces and tests.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/nvb/board_platforms.json`
  - `packages/lab-kernel/ies-toolkit/nvb/derived_resolution.json`
  - `packages/lab-kernel/ies-toolkit/nvb/drivers_unique.json`
  - `packages/lab-kernel/ies-toolkit/nvb/lab_form.json`
  - `packages/lab-kernel/ies-toolkit/nvb/optics.json`
  - `packages/lab-kernel/ies-toolkit/nvb/spec_codes.json`
  - `packages/lab-kernel/ies-toolkit/nvb/systems.json`
- prohibitions:
  - no claim that these files are the live RuntimeData authority source;
  - no production database path or credential;
  - no schema invention outside the observed fixture content;
  - no JavaScript, HTML or resolver changes;
  - no replacement of the locked 16-field Lab form.
- acceptance: The snapshot is valid JSON, internally referentially coherent, explicitly offline/dev-only, preserves the exact canonical 16-field Lab form and contains no local authority path or secret. Full `lab-ies` passes and exactly the authorised files are committed as `lab: checkpoint offline NVB fixtures` and pushed only to the lane branch.
- gate: lab-ies
- depends on: none
- on success next: LAB-017-reference-resolver-contract after recorded Integrate approval
- seam change: no
- status: done

Evidence: `ae14232b5a4fbff6fca15004a0583047fc5a319d`, confirmed on origin.

### Q-7 Reference and resolver contract
- id: LAB-017-reference-resolver-contract
- objective: Reconcile the legacy NVB reference/resolver helper with the committed sealed-reference DTO, immutable authority boundary and safe downstream reference identity.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/nvbReference.js`
  - `tests/lab-kernel/nvbReference.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-017_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-19.
- prohibitions:
  - no reverse-authority reconstruction;
  - no legacy alternative reference schema promoted beside `controlstack.lab.reference.1mm.v1`;
  - no diagnostic fingerprint in an authority or downstream identity field;
  - no raw local path, file URL or UNC path in governed references;
  - no public resolver route, server implementation, HTML or fixture changes;
  - no change to Selector or Program code.
- acceptance: The module exposes only bounded reference identity, safe resolver-path parsing/projection and evidence capability helpers compatible with the committed sealed DTO; it fails closed on unsupported kinds and unsafe paths; emergency/EWIS verification remains assembly-owned; no private rich-authority state leaks. Program & Integrate approval of seam-envelope version 1 is recorded. Focused tests and the full `lab-ies` gate must pass, and exactly the two approved implementation files are committed as `lab: checkpoint reference resolver contract` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-010-reference-driven-generation, LAB-011-project-ies-generation
- on success next: LAB-018-nvb-resolution-contract after recorded Integrate approval
- seam change: yes
- status: done

Evidence: `2333c1197abf898e7a680455f99918823cb76e30`, confirmed on origin.

### Q-8 NVB resolution contract
- id: LAB-018-nvb-resolution-contract
- objective: Checkpoint deterministic, read-only NVB family/optic/Lab-form resolution against the approved data-source contract.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/nvbResolve.js`
  - `tests/lab-kernel/nvbResolve.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-20.
- batch sequence: completed parcel; the earlier approval hold remains superseded.
- prohibitions:
  - no direct RuntimeData filesystem or database access;
  - no copied Runtime or Program reader implementation;
  - no mutation of authority or sealed reference DTOs;
  - no parsing of opaque provenance slugs for thermal facts;
  - no HTML, fixture or adapter changes;
  - no new Selector option semantics.
- acceptance: The exact version-1 resolver API and output shape in the consolidated envelope are implemented without a loader; governing thermals, test path, optic matching and Lab-form splitting fail closed and do not invent emergency verification. Recorded Program & Integrate approval of envelope version 1 is required before `ready`. Focused contract tests and the full `lab-ies` gate pass, and exactly the two authorised files are committed as `lab: checkpoint NVB resolution contract` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-016-nvb-offline-fixtures
- on success next: LAB-019-component-projection-contract after recorded Integrate approval
- seam change: yes
- status: done

Evidence: `952b2ba40c5a5ea1c7e217c9c1dcd9a19170e648`, confirmed on origin.

### Q-9 Component projection contract
- id: LAB-019-component-projection-contract
- objective: Checkpoint the deterministic projection of NVB boards, drivers and optics into Lab component-library views.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/nvbComponents.js`
  - `tests/lab-kernel/nvbComponents.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-20.
- batch sequence: completed parcel; LAB-018 and LAB-019 are completed and closed out.
- prohibitions:
  - no embedded duplicate source catalogue;
  - no direct RuntimeData database access or Program reader copy;
  - no mutation of source rows;
  - no Selector option generation;
  - no HTML, document-register or fixture changes;
  - no browser persistence.
- acceptance: The exact version-1 component-catalogue API and projection shapes in the consolidated envelope are implemented without a loader or embedded catalogue; grouping, ordering, tunable/CCT rules and conflict handling are deterministic and fail closed. Recorded Program & Integrate approval of envelope version 1 is required before `ready`. Focused contract tests and the full `lab-ies` gate pass, and exactly the two authorised files are committed as `lab: checkpoint component projection contract` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-016-nvb-offline-fixtures
- on success next: LAB-020-document-register-contract after recorded Integrate approval
- seam change: yes
- status: done

Evidence: `6c835a01811d6cb5ddf6558ed7cd65782403687b`, confirmed on origin.

### Q-10 Document register contract
- id: LAB-020-document-register-contract
- objective: Checkpoint the bounded many-to-many document-register model that Lab surfaces use before Program-owned persistence exists.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/docRegister.js`
  - `tests/lab-kernel/docRegister.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-20.
- batch sequence: completed parcel; LAB-018, LAB-019 and LAB-020 are completed and closed out.
- prohibitions:
  - no filesystem, browser-storage, network or database persistence;
  - no upload route or Program implementation;
  - no authority SHA substitution with diagnostic fingerprints;
  - no deletion of source evidence;
  - no HTML or fixture changes.
- acceptance: The exact version-1 immutable document-register API and state shape in the consolidated envelope are implemented; caller-supplied IDs, safe SHA/source dedupe, many-to-many links and no-delete semantics fail closed while durable storage remains Program-owned. Recorded Program & Integrate approval of envelope version 1 is required before `ready`. Focused contract tests and the full `lab-ies` gate pass, and exactly the two authorised files are committed as `lab: checkpoint document register contract` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-017-reference-resolver-contract
- on success next: LAB-021-emergency-selection-contract after recorded Integrate approval
- seam change: yes
- status: done

Evidence: `636d3d7c2023bf16e49def1d75f9d46d66b26482`, confirmed on origin.

### Q-11 Emergency selection contract
- id: LAB-021-emergency-selection-contract
- objective: Checkpoint the fail-closed Zencontrol emergency converter and battery-selection contract for Lab evidence workflows.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/zencontrolEmergency.js`
  - `tests/lab-kernel/zencontrolEmergency.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-20.
- batch sequence: completed parcel; LAB-018 through LAB-021 are completed and closed out.
- prohibitions:
  - no unsupported electrical, battery or thermal value hardened as confirmed;
  - no inherited `_EMERGENCY_VERIFIED` authority outcome;
  - no product ordering, procurement or Runtime route;
  - no network, browser storage or filesystem access;
  - no HTML, provenance publication or source-fixture changes.
- acceptance: The exact version-1 emergency candidate API and output shape in the consolidated envelope are implemented; published, derived and unconfirmed values remain distinct, conflicts and procurement blockers fail closed, procurement release remains false and assembly verification remains null. Recorded Program & Integrate approval of envelope version 1 is required before `ready`. Focused contract tests and the full `lab-ies` gate pass, and exactly the two authorised files are committed as `lab: checkpoint emergency selection contract` and pushed only to the lane branch.
- gate: lab-ies
- depends on: none
- on success next: LAB-022-reference-composition-kernel after recorded owner and Integrate approval
- seam change: yes
- status: done

Evidence: `066fcc658491a65b85108b83e64f31341ba5e1bb`, confirmed by current repository history and independent 215/215 gate.

### Q-12 Governed reference composition kernel
- id: LAB-022-reference-composition-kernel
- objective: Replace the legacy merge prototype with a deterministic one-millimetre photometric-and-owned-power composition candidate over committed sealed reference DTOs.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/iesMerge.js`
  - `tests/lab-kernel/iesReferenceComposition.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1; approved by Program & Integrate on 2026-07-20 with the exact ratified binary-composition policy.
- batch sequence: completed parcel; LAB-018 through LAB-022 are completed and closed out.
- ratified policy: exactly two unique non-MERGED parents; immutable order-significant provenance; exactly matching grids with no interpolation/resampling; allocation, authority, approval and sealing remain outside the kernel; all violations fail closed.
- prohibitions:
  - no UI/HTML/CSS;
  - no approval, allocation or sealing inside the composition kernel;
  - no nested MERGED support, parent reordering, duplicate-parent policy change, cycle identity or N-parent semantics without a new recorded owner decision;
  - no diagnostic fingerprints or legacy `fingerprint` identity;
  - no inherited emergency/EWIS verification, LUMCAT or assembly identity;
  - no Selector or Program code changes.
- acceptance: The exact version-1 binary composition API and candidate shape in the consolidated envelope are implemented; exactly two non-MERGED unique ordered parents, exact coincident grids, parent-owned wall power and fresh downstream authority/approval/sealing are enforced. Explicit owner ratification of the LAB-022 sub-decision and Program & Integrate approval of envelope version 1 are required before `ready`. Focused contract tests and the full `lab-ies` gate pass, and exactly the two authorised files are committed as `lab: checkpoint governed reference composition kernel` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-017-reference-resolver-contract
- on success next: LAB-023-nvb-lab-adapter after recorded Integrate approval
- seam change: yes
- status: done

Evidence: `7fcb296c73ba52c7e70090b0b42323fcbe7a3feb`, confirmed on origin.

### Q-13 NVB Lab adapter
- id: LAB-023-nvb-lab-adapter
- objective: Replace the legacy mutable rich-record adapter with an immutable, bounded NVB resolution projection for Lab working state.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/nvbLabAdapter.js`
  - `tests/lab-kernel/nvbLabAdapter.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-20.
- batch sequence: completed parcel; LAB-018 through LAB-023 are completed and closed out.
- prohibitions:
  - no mutation of sealed DTOs or approved authority records;
  - no diagnostic `fingerprint()` identity generation;
  - no direct source loading, persistence or resolver route;
  - no new outgoing keyword owner;
  - no HTML, fixture, resolver or Program code changes.
- acceptance: The exact version-1 Lab projection API and shape in the consolidated envelope are implemented; only approved LAB-018 resolution and LAB-017 safe identity projections are consumed, unresolved values remain explicit, no ID/timestamp is generated and assembly verification remains null. Recorded Program & Integrate approval of envelope version 1 is required before `ready`. Focused contract tests and the full `lab-ies` gate pass, and exactly the two authorised files are committed as `lab: checkpoint NVB Lab adapter` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-017-reference-resolver-contract, LAB-018-nvb-resolution-contract
- on success next: LAB-024-resolver-fixture-corpus
- seam change: yes
- status: done

Evidence: `ca1c690da9c6d87e610129242146714555e19ec6`, confirmed on origin.

### Q-14 Offline resolver fixture corpus
- id: LAB-024-resolver-fixture-corpus
- objective: Checkpoint the bounded static Lab component, source, report and reference fixture corpus used to exercise resolver and provenance surfaces offline.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/lab/components/board/BRD-DNX80.json`
  - `packages/lab-kernel/ies-toolkit/lab/components/chip/CHIP-LM301H.json`
  - `packages/lab-kernel/ies-toolkit/lab/components/converter/ZC-EM-SMART-50.json`
  - `packages/lab-kernel/ies-toolkit/lab/components/driver/DRV-TRIDONIC-825.json`
  - `packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-GT-000045/record.1mm.json`
  - `packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/evidence/evidence.json`
  - `packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/evidence/LM-79__safe-9f2a11.txt`
  - `packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/origin.ies`
  - `packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/provenance.json`
  - `packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/record.1mm.json`
  - `packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000124/record.1mm.json`
  - `packages/lab-kernel/ies-toolkit/lab/reports/LAB-20260715-142-EXT.json`
  - `packages/lab-kernel/ies-toolkit/lab/sources/DNX-80_board_datasheet.txt`
  - `packages/lab-kernel/ies-toolkit/lab/sources/Emergency_test_report.txt`
  - `packages/lab-kernel/ies-toolkit/lab/sources/EWIS_cartridge_report.txt`
  - `packages/lab-kernel/ies-toolkit/lab/sources/Samsung_LM301H_datasheet.txt`
  - `packages/lab-kernel/ies-toolkit/lab/sources/Samsung_LM301H_LM-80.txt`
  - `packages/lab-kernel/ies-toolkit/lab/sources/Samsung_LM301H_TM-21.txt`
  - `packages/lab-kernel/ies-toolkit/lab/sources/Tridonic_LC55_datasheet.txt`
  - `packages/lab-kernel/ies-toolkit/lab/sources/zc-em-smart-50_datasheet.txt`
- prohibitions:
  - no claim that fixtures are production authority records or live evidence;
  - no secret, personal data, absolute path, file URL or UNC path;
  - no invented cryptographic digest represented as verified authority;
  - no code, HTML or resolver contract changes;
  - no donor copy or bulk promotion.
- acceptance: Every fixture is explicitly safe offline/demo evidence, internally resolves under the committed dev projection, uses no unsafe local governed reference, and cannot be mistaken for an approved production record. Full `lab-ies` passes and exactly the authorised files are committed as `lab: checkpoint offline resolver fixture corpus` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-017-reference-resolver-contract, LAB-021-emergency-selection-contract
- on success next: LAB-025-component-library-surface
- seam change: no
- status: done

Evidence: `deb74baac423f879d409c2b7fc98d6ca9a459787`, confirmed on origin.

### Q-15 Component library surface
- id: LAB-025-component-library-surface
- objective: Checkpoint the Lab-only component library surface over committed component and document-register contracts.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/component_library.html`
- prohibitions:
  - no embedded replacement catalogue;
  - no direct RuntimeData/database access;
  - no persistent upload or Program route;
  - no authority record creation;
  - no changes to imported modules or shared CSS.
- acceptance: The surface consumes only committed projections, displays source status and unresolved values explicitly, keeps document association in-memory, and does not emit a Selector or authority contract. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint component library surface` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-012-lab-style-foundation, LAB-019-component-projection-contract, LAB-020-document-register-contract, LAB-024-resolver-fixture-corpus
- on success next: LAB-026-document-equipment-surfaces
- seam change: no
- status: done

Evidence: `78fe3ab23e4fd50b8c79af8f429687a91401a068`, confirmed on origin. Patrick reported a 100% PASS against the prescribed Component Library browser checklist on 2026-07-20.

### Q-16 Document and equipment surfaces
- id: LAB-026-document-equipment-surfaces
- objective: Checkpoint the bounded Lab document and equipment administration surfaces as one internal support workflow.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/docs.html`
  - `packages/lab-kernel/ies-toolkit/equipment_register.html`
- prohibitions:
  - no Program persistence, database or upload route;
  - no equipment calibration authority claim without evidence;
  - no reference sealing or outgoing IES generation;
  - no changes to request/report contracts;
  - no changes to imported modules or shared CSS.
- acceptance: Both surfaces remain Lab-internal, clearly distinguish entered/demo state from verified evidence, use the committed document-register model where applicable, and emit no cross-lane artifact. Full `lab-ies` passes and exactly the authorised files are committed as `lab: checkpoint document and equipment surfaces` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-012-lab-style-foundation, LAB-020-document-register-contract
- on success next: LAB-027-request-report-workflow after recorded Integrate approval
- seam change: no
- status: done

Evidence: `0f54173fb17bdf2b31d7f6f45625ffaa66066e89`, confirmed on origin. Patrick reported all prescribed browser behaviour passed except one legacy 404 artefact link; the parcel removed that false availability signal and now renders unresolved evidence as non-clickable.

### Q-17 Lab request and report workflow
- id: LAB-027-request-report-workflow
- objective: Reconcile the Lab test-request, Lab-request, extended-report and one-millimetre contract surfaces into one additive handoff workflow for Program ownership.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/test_request.html`
  - `packages/lab-kernel/ies-toolkit/lab_request.html`
  - `packages/lab-kernel/ies-toolkit/extended_report.html`
  - `packages/lab-kernel/ies-toolkit/onemm_contract.html`
  - `tests/lab-kernel/labRequestReportWorkflow.test.js`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-20.
- batch sequence: approved and now active after LAB-026 completion and closeout.
- prohibitions:
  - no Program database, CRM, file upload or workflow implementation;
  - no duplicate authority schema or reverse reconstruction;
  - no rekeying of already supplied information between surfaces;
  - no approval/sealing claim from browser form state;
  - no changes to production kernels, fixtures or shared CSS;
  - no Selector code or route.
- acceptance: The four surfaces implement the exact version-1 additive handoff schema family in the consolidated envelope; earlier fields are preserved without rekeying, unresolved fields remain explicit, only canonical artifact references cross stages, and no browser state persists or seals a reference. Recorded Program & Integrate approval of envelope version 1 is required before `ready`. Focused workflow tests and the full `lab-ies` gate pass, and exactly the five authorised files are committed as `lab: checkpoint Lab request report workflow` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-019-component-projection-contract, LAB-020-document-register-contract, LAB-024-resolver-fixture-corpus
- on success next: LAB-028-reference-curation-surfaces
- seam change: yes
- status: done

Evidence: `c7537a1f98d04044672b9adccfb321a48f3dea68`, confirmed on origin. The approved version-1 request → order → extended-report → reference-intake schema family is implemented additively with canonical artefact references only and no browser persistence or authority claim.

### Q-18 Reference curation surfaces
- id: LAB-028-reference-curation-surfaces
- objective: Checkpoint the Lab-only reference-builder and file-curator surfaces as consumers of committed resolver, component and document contracts.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/reference_builder.html`
  - `packages/lab-kernel/ies-toolkit/curator.html`
- prohibitions:
  - no alternative sealed-reference schema;
  - no approval or sealing without committed authority modules;
  - no production upload, database or resolver route;
  - no diagnostic fingerprint represented as authority SHA;
  - no changes to imported modules, fixtures or shared CSS.
- acceptance: The surfaces remain explicit Lab working tools, delegate identity and evidence association to committed contracts, keep drafts non-authoritative, and stop rather than fabricate a seal, serial, resolver URL or evidence result. Full `lab-ies` passes and exactly the authorised files are committed as `lab: checkpoint reference curation surfaces` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-017-reference-resolver-contract, LAB-019-component-projection-contract, LAB-020-document-register-contract, LAB-024-resolver-fixture-corpus
- on success next: LAB-029-provenance-publication-surfaces after recorded Integrate approval
- seam change: no
- status: done

Evidence: `569c53f5a6b89850abb80a753f4296535e3b5db8`, confirmed on origin. Patrick's browser evidence captured the legacy 404 catalogue loads and browser-fabricated GT/OPT identities and timestamps; the completed surfaces now remain non-authoritative working drafts/plans with no upload, ID allocation, resolver creation, evidence result, approval or download.

### Q-19 Provenance publication surfaces
- id: LAB-029-provenance-publication-surfaces
- objective: Reconcile the provenance record, explorer and luminaire view into read-only publication surfaces over the approved resolver contract.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/provenance.html`
  - `packages/lab-kernel/ies-toolkit/provenance_explorer.html`
  - `packages/lab-kernel/ies-toolkit/luminaire_provenance.html`
- seam envelope: `docs/_context/lanes/lab-ies/LAB-029_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate on 2026-07-20 after a 45/45 Program gate.
- prohibitions:
  - no public resolver server or route implementation;
  - no reverse-authority reconstruction or private rich-authority display;
  - no raw evidence body, working bytes or local filesystem path in downstream output;
  - no diagnostic hash represented as authority verification;
  - no mutation, approval, sealing or Program persistence;
  - no changes to imported modules, fixtures or shared CSS.
- acceptance: Surfaces are read-only, resolve only approved safe reference/evidence projections, clearly distinguish fixture/demo content, verify identity fields fail-closed, and publish no contract beyond the recorded Program/Integrate seam. Recorded Program & Integrate approval is required before `ready`. Full `lab-ies` passes and exactly the authorised files are committed as `lab: checkpoint provenance publication surfaces` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-017-reference-resolver-contract, LAB-021-emergency-selection-contract, LAB-024-resolver-fixture-corpus
- on success next: LAB-030-emergency-surface
- seam change: yes
- status: done

Evidence: `f41c22ca69ce24b5d2bc8bed20c334396d070a29`, confirmed on origin. The three read-only publication pages implement the approved version-1 view over safe identity, canonical host-free resolver paths and evidence-category coverage; fixture mode is visibly `OFFLINE DEMO — UNAPPROVED`, raw bodies and host probing are absent, and emergency/EWIS assembly verification remains null.

### Q-20 Emergency selection surface
- id: LAB-030-emergency-surface
- objective: Checkpoint the Lab-only emergency selector UI over the approved emergency selection contract.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/emergency.html`
- prohibitions:
  - no duplicated model/battery matrix or electrical formula;
  - no final assembly verification claim;
  - no ordering, procurement, persistence or network route;
  - no changes to the emergency module, fixtures or shared CSS.
- acceptance: The surface delegates all decisions to the committed module, displays confirmed/derived/unconfirmed status and conflicts, blocks unsupported combinations, and remains advisory Lab evidence tooling only. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint emergency selection surface` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-012-lab-style-foundation, LAB-021-emergency-selection-contract
- on success next: LAB-031-project-builder-surface
- seam change: no
- status: done

Evidence: `7c5bf3a9c9e343c94c95ceddae1e57686cb65ea5`, confirmed on origin. The surface delegates every decision to `selectEmergencyCandidate`, displays published, derived and unconfirmed states separately, blocks unsupported or conflicting combinations, keeps procurement release false, and leaves emergency/EWIS assembly verification unresolved.

### Q-21 Project IES builder surface
- id: LAB-031-project-builder-surface
- objective: Checkpoint the Lab project-IES builder UI as a thin consumer of the committed project generator.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/ies_builder.html`
- prohibitions:
  - no inline generation, scaling, metrics or writer implementation;
  - no legacy rich-authority input;
  - no non-canonical keyword or ambient input;
  - no persistence, runtime route or Selector integration;
  - no changes to committed generators or shared CSS.
- acceptance: The surface accepts only a sealed reference DTO and bounded project inputs, delegates to `buildIesFromReference` or `buildProjectIes` without altering their contracts, displays fail-closed errors, and materialises downloads only in-browser from returned text. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint project IES builder surface` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-011-project-ies-generation, LAB-012-lab-style-foundation
- on success next: LAB-032-merge-composition-surface
- seam change: no
- status: done

Evidence: `8ece3f36622fe1e0817aff9ecef42f0755218d3c`, confirmed on origin. The surface accepts one uploaded sealed reference DTO plus bounded project inputs, delegates exclusively to `buildProjectIes`, displays fail-closed contract errors, preserves sealed-reference ambient ownership, and downloads only the exact returned LM-63 text in browser memory.

### Q-22 Merge composition surface
- id: LAB-032-merge-composition-surface
- objective: Checkpoint the Lab-only merge surface as a thin consumer of the approved composition candidate and committed project generator.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/ies_merge.html`
- prohibitions:
  - no inline merge, approval, sealing or allocation logic;
  - no legacy reference shape or diagnostic fingerprint identity;
  - no inherited emergency/EWIS verification or assembly identity;
  - no persistence, public route or Selector integration;
  - no changes to production modules, fixtures or shared CSS.
- acceptance: The surface loads supported sealed DTO fixtures, delegates composition and project materialisation, clearly labels the result non-authoritative until freshly approved/sealed, preserves ordered parent display, and fails closed on unsupported merge policy. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint merge composition surface` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-012-lab-style-foundation, LAB-022-reference-composition-kernel, LAB-024-resolver-fixture-corpus
- on success next: LAB-033-main-lab-bench-surface
- seam change: no
- status: done

Evidence: `dec45ac63c12cfcf6f9aec256323ed02eee25b62`, confirmed on origin. The surface delegates ordered two-parent composition to `composeReferencePair`, keeps the result explicitly non-authoritative with assembly values unresolved, and requires a separately supplied freshly sealed MERGED DTO before delegating project materialisation to `buildProjectIes`.

### Q-22A Canonical keyword migration guard correction
- id: LAB-032A-canonical-keyword-migration-guard-correction
- objective: Correct the stale test-only Main Bench keyword assertions before LAB-033 without changing production behaviour.
- authorised files:
  - `tests/lab-kernel/iesKeywordMigration.test.js`
- approval: Program & Integrate approved the bounded correction under `docs(program): approve Lab keyword migration correction`; Program gate passed 45/45 and the decision was committed and pushed.
- prohibitions:
  - no production module, bench, authority, sealed-reference, Selector, Runtime, Engine or Program implementation changes;
  - no weakening of the exact ordered 16-keyword contract;
  - no acceptance of `_AMBIENT_TA_C`, aliases or supplementary keywords;
  - no removal of generator, merge, summary, project-adapter or project-builder vocabulary guards.
- acceptance: The test removes only the retired editable Main Bench ambient and helper-shape assumptions, requires the Main Bench to consume the committed canonical keyword contract, keeps `_INTERNAL_AMBIENT_TA_C` sealed-reference-owned and non-editable, and preserves every other canonical-vocabulary boundary. Full `lab-ies` passes and exactly the one authorised test file is committed and pushed separately.
- gate: lab-ies
- depends on: LAB-032-merge-composition-surface
- on success next: LAB-033-main-lab-bench-surface
- seam change: approved bounded test correction
- status: done

Evidence: `9633f1cd6634844f55f13a8d2d46908182187447`, confirmed on origin. The one-file correction removed only the retired editable Main Bench ambient and helper-shape assertions while retaining the exact ordered 16-keyword contract, stale/alias/supplementary rejection, sealed-reference ambient ownership and all generator, merge, summary, project-adapter and builder guards. Full and gated executions passed 255/255.

### Q-23 Main Lab bench surface
- id: LAB-033-main-lab-bench-surface
- objective: Checkpoint the primary Lab bench as a non-authoritative workflow surface over committed parse, normalise, polar, reference and generation modules.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/bench.html`
- prohibitions:
  - no inline replacement of committed kernels;
  - no private authority sealing, serial allocation or production resolver route;
  - no legacy reference schema or diagnostic authority identity;
  - no stale/supplementary outgoing keywords;
  - no persistence or cross-lane implementation;
  - no changes to imported modules, fixtures or shared CSS.
- acceptance: The surface delegates each operation to committed modules, keeps working state non-authoritative, uses the canonical polar and 16-keyword profile, separates preview/download from authority sealing, and stops on any behaviour that cannot be reconciled within this single surface. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint main Lab bench surface` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-013-polar-renderer, LAB-017-reference-resolver-contract, LAB-024-resolver-fixture-corpus, LAB-032A-canonical-keyword-migration-guard-correction
- on success next: LAB-034-legacy-labbench-classification
- seam change: no
- status: done

Evidence: `d22cff4ee631cd2bdf2412f5d934cab106f051a2`, confirmed on origin. The one-file Main Bench is explicitly non-authoritative, delegates parsing, metrics, inspection, polar rendering, the guarded normalise recipe, canonical keyword projection, sealed-reference identity validation and project generation to committed modules, keeps internal ambient sealed-reference-owned, separates preview/download from sealing, and contains no persistence, fabricated authority or cross-lane implementation. Independent and gated executions passed 255/255.

### Q-24 Legacy labbench classification
- id: LAB-034-legacy-labbench-classification
- objective: Classify and confine the legacy `labbench.html` surface so it cannot become a second authority or project-generation implementation.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/labbench.html`
- prohibitions:
  - no duplicate approval, provenance, reference or project generator logic;
  - no changes to committed modules or the primary bench;
  - no persistence, resolver route or cross-lane integration;
  - no absorption of unrelated UI work.
- acceptance: The file is reduced to an explicit compatibility/demo harness that delegates committed modules and is clearly non-authoritative, or the worker stops and reports if it contains distinct unexplained behaviour that cannot be safely confined. If checkpointable, full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint legacy labbench classification` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-011-project-ies-generation, LAB-033-main-lab-bench-surface
- on success next: LAB-035-selector-contract-stub after recorded Integrate approval
- seam change: no
- status: done

Evidence: `15c0f130650146374932c280c054f6293f3f03f9`, confirmed on origin. The legacy page is confined to a visibly compatibility/demo-only read-only IES inspector over committed parse, metrics, inspection and polar modules; all duplicate approval, provenance, reference-building, symmetrisation and project-generation behaviour was removed, with no persistence, resolver, authority or cross-lane implementation. The gated execution passed 255/255.

### Q-25 Selector contract stub
- id: LAB-035-selector-contract-stub
- objective: Confine the Lab Selector stub to a read-only contract fixture that demonstrates approved downstream inputs without implementing Selector behaviour.
- seam envelope: `docs/_context/lanes/lab-ies/LAB-035_SEAM_ENVELOPE.md`, version 1; approved unchanged by Program & Integrate under the pushed decision `docs(program): approve LAB-035 Selector contract seam` after a 46/46 Program gate.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/selector_stub.html`
- prohibitions:
  - no Selector source, state, option-generation or runtime implementation;
  - no copied Selector vocabulary or defaulting algorithm;
  - no private authority, raw candela or diagnostic hash consumption beyond approved sealed DTO/project artifacts;
  - no persistence, network route or merge policy invention;
  - no changes to production modules, fixtures or shared CSS.
- acceptance: The stub is explicitly non-production, consumes only the recorded safe seam contract, fails closed on stale or malformed reference identity, and cannot be mistaken for Selector acceptance evidence. Recorded Program & Integrate approval is required before `ready`. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint Selector contract stub` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-017-reference-resolver-contract, LAB-022-reference-composition-kernel, LAB-031-project-builder-surface
- on success next: LAB-036-lab-shell-server
- seam change: yes
- status: done

Approval and completion evidence: Program & Integrate approved version 1 unchanged in the pushed decision titled `docs(program): approve LAB-035 Selector contract seam`; Program gate 46/46 passed. The exact authorised read-only contract viewer was committed as `lab: checkpoint Selector contract stub`, pushed to the lane branch, and passed the full 255/255 `lab-ies` gate. It renders only safe identity, safe runtime handoff, supplied Selector readiness, safety flags and binding state; malformed, over-rich, contradictory or stale input fails closed. LAB-036 is now the sole ready item.

### Q-26 Final Lab shell and local server
- id: LAB-036-lab-shell-server
- objective: Checkpoint the final Lab navigation shell and bounded local static server after all linked tool surfaces are classified.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/index.html`
  - `packages/lab-kernel/ies-toolkit/lab.html`
  - `serve.mjs`
- prohibitions:
  - no API, webhook, upload or persistence route;
  - no donor path as the default writable/served authority root;
  - no path traversal or arbitrary filesystem serving;
  - no embedded business logic or cross-lane implementation;
  - no changes to linked surfaces or shared CSS.
- acceptance: Navigation links only to committed/classified Lab surfaces, the shell remains presentation-only, and the server defaults to the current Lab worktree/toolkit root with strict root containment, correct MIME handling and no write capability. Full `lab-ies` passes and exactly the authorised files are committed as `lab: checkpoint Lab shell and local server` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-025-component-library-surface, LAB-026-document-equipment-surfaces, LAB-027-request-report-workflow, LAB-028-reference-curation-surfaces, LAB-029-provenance-publication-surfaces, LAB-030-emergency-surface, LAB-031-project-builder-surface, LAB-032-merge-composition-surface, LAB-033-main-lab-bench-surface, LAB-034-legacy-labbench-classification, LAB-035-selector-contract-stub
- on success next: LAB-037-keyword-migration-guard
- seam change: no
- status: ready

### Q-27 Cross-cutting canonical keyword migration guard
- id: LAB-037-keyword-migration-guard
- objective: Checkpoint the final cross-cutting regression guard after every active generator, merge and Lab preview path it inspects is committed.
- authorised files:
  - `tests/lab-kernel/iesKeywordMigration.test.js`
- prohibitions:
  - no production source or fixture changes;
  - no broad snapshot assertions unrelated to the locked keyword contract;
  - no acceptance of aliases, supplementary fields or stale `_AMBIENT_TA_C`;
  - no UI behaviour tests beyond canonical emission and vocabulary guards.
- acceptance: The test enforces the exact ordered 16-field profile, sealed-reference ownership of `_INTERNAL_AMBIENT_TA_C`, canonical generator/merge/preview vocabulary, and absence of stale ambient aliases without coupling to unrelated presentation text. Full `lab-ies` passes and exactly the authorised file is committed as `lab: checkpoint canonical keyword migration guard` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-014-summary-normalise-surface, LAB-016-nvb-offline-fixtures, LAB-022-reference-composition-kernel, LAB-031-project-builder-surface, LAB-033-main-lab-bench-surface
- on success next: none
- seam change: no
- status: queued

## Explicitly not queued

These protected paths remain outside implementation parcels unless the orchestrator makes a separate decision:

- `README.zip` — noise/archive output; never stage.
- `docs/_context/ControlStack_summary_normalise_harness_spec.md` — historical out-of-lane context; do not absorb into a worker parcel.
- `scripts/clear_chaff.ps1` — potentially destructive support script; never execute and do not checkpoint with feature work.
