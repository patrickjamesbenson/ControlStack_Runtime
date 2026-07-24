# ControlStack Program State

**Authority:** Program-level repository memory for orchestration and integration.  
**Location:** `docs/_context/program/CONTROLSTACK_PROGRAM_STATE.md`  
**State date:** 2026-07-17, Australia/Sydney.  
**Evidence rule:** Repository and connected-app evidence overrides chat history. Every material claim is labelled `VERIFIED`, `REPORTED`, `INFERRED`, or `UNKNOWN`.

## Evidence classifications

- **VERIFIED** — directly observed in the current repository or returned by the connected CS Integrate app during this bootstrap.
- **REPORTED** — supplied as accepted coordination input but not independently inspected from the relevant lane in this session.
- **INFERRED** — a reasoned program conclusion derived from verified or reported evidence.
- **UNKNOWN** — not established by current evidence and must not be silently assumed.

## Current program identity

| Item | State | Evidence |
|---|---|---|
| Lane | `program-integrate` | VERIFIED by `repo_info` |
| Worktree root | `C:\ControlStack_Worktrees\program-integrate` | VERIFIED by `repo_info` and `repo_git_status` |
| Required/current branch | `lane/program-integrate` | VERIFIED by `repo_info` and `repo_git_status` |
| HEAD at bootstrap start | `08df070890300058353cc621c1383f16492063f1` | VERIFIED by `repo_git_recent` |
| MCP endpoint | `127.0.0.1:8022/mcp` | VERIFIED by `repo_info` |
| Connected secure app | `CS Integrate` | REPORTED by accepted environment; connected server identifies itself as `ControlStack Program and Integrate Lane` |
| Allowed gate | `program-integrate` | VERIFIED by `repo_info` |
| Working tree at bootstrap start | clean; no staged, modified, untracked, or deleted paths | VERIFIED by `repo_git_status` |
| Latest accepted Program gate before bootstrap | 18 passed, 0 failed | REPORTED |

## Connected-app capability boundary

| Capability | State | Evidence |
|---|---|---|
| Write inside this worktree | enabled | VERIFIED by `repo_info`; write root is the configured runtime root |
| Stage explicit paths inside this worktree | enabled | VERIFIED by `repo_info` |
| Commit | enabled and gate-controlled | VERIFIED by `repo_info` |
| Push | enabled and gate-controlled | VERIFIED by `repo_info` |
| Arbitrary shell execution | disabled | VERIFIED by `repo_info` |
| File deletion | disabled | VERIFIED by `repo_info` |
| File/directory movement | disabled | VERIFIED by `repo_info` |
| Cross-root copy | disabled | VERIFIED by `repo_info` |
| Writable main or another worktree | unavailable through this app | VERIFIED operationally from configured runtime confinement and disabled cross-root mutation; exact filesystem ACLs outside the app are UNKNOWN |
| Donor/reference root | configured disabled placeholder under this worktree; does not exist | VERIFIED by `repo_info` |

## Current program milestone

**Milestone: Durable orchestration memory bootstrap.**

- Establish repository-owned program state, lane registry, seam contracts, integration queue, decision log, orchestration contract, and fresh-orchestrator handoff. **VERIFIED as the authorised task.**
- Do not begin or continue feature implementation in this parcel. **VERIFIED as the authorised task boundary.**
- Replace reliance on chat-only coordination with versioned repository context. **REPORTED as a global program rule and accepted here as the governing objective.**

## Accepted lane environment

### Selector & Engine

- Root `C:\ControlStack_Worktrees\selector-engine`. **REPORTED**
- Branch `lane/selector-engine`. **REPORTED**
- MCP port `8000`. **REPORTED**
- Runtime port `8788`. **REPORTED**
- Secure app `CS Selector & Engine Secure`. **REPORTED**
- Gate `selector-engine`. **REPORTED**
- Latest accepted gate `100 passed, 0 failed`. **REPORTED**
- Accepted base `08df070890300058353cc621c1383f16492063f1`. **REPORTED**
- The accepted base equals this Program lane's bootstrap-start HEAD. **VERIFIED comparison of the reported hash with current Program HEAD; current Selector HEAD remains UNKNOWN.**

### Lab & IES

- Root `C:\ControlStack_Worktrees\code-pilot-lab`. **REPORTED**
- Branch `lane/code-pilot-lab`. **REPORTED**
- MCP port `8021`. **REPORTED**
- Specification/demo port `8899`. **REPORTED**
- Secure app `CS Lab & IES Secure v2`. **REPORTED**
- Gate `lab-ies`. **REPORTED**
- Donor `C:\ControlStack_Lab` is read-only. **REPORTED**
- Selector leaks were removed. **REPORTED**
- Existing modified and untracked IES work is deliberately preserved. **REPORTED**
- Latest bounded gate was accepted green. **REPORTED; exact pass count and commit are UNKNOWN.**

### Program & Integrate

- Root `C:\ControlStack_Worktrees\program-integrate`. **VERIFIED**
- Branch `lane/program-integrate`. **VERIFIED**
- MCP port `8022`. **VERIFIED**
- Secure app `CS Integrate`. **REPORTED**
- Gate `program-integrate`. **VERIFIED**
- Latest accepted gate before this bootstrap `18 passed, 0 failed`. **REPORTED**

## Repository baseline observed in this lane

- The repository package is named `controlstack-runtime`, version `0.1.0`, private, ESM, with `npm test` mapped to `node --test tests/*.test.js`. **VERIFIED from `package.json`.**
- The repository contains runtime feature code, a workspace shell, packages, scripts, tools, and a large Node test suite. **VERIFIED from repository inspection.**
- Before this bootstrap, `docs/` contained only `ies-report-card-generator.md` and `docs/donor-reference/selector/DONOR_TRACE_RULES.md`; no equivalent program-state or program-handoff documents existed. **VERIFIED from repository file search.**
- The Program worktree currently shares a feature-rich runtime history whose latest commits concern Selector option authority and runtime behaviour. **VERIFIED from recent commit subjects.**
- Whether those feature commits were integrated through the formal Program acceptance process is **UNKNOWN** because durable acceptance records did not yet exist.

## Program-wide operating rules

The following rules are accepted program policy. Their origin is coordination input; enforcement support is partly verified through the connected app.

1. One writer per worktree. **REPORTED policy; INFERRED necessary control.**
2. Feature lanes cannot write `main` or another worktree. **REPORTED policy; current app confinement is VERIFIED.**
3. Program & Integrate is the sole gated integration path. **REPORTED policy.**
4. Arbitrary shell, deletion, movement, and cross-root copy are disabled. **VERIFIED for this app.**
5. Commits and pushes are gated. **VERIFIED for this app.**
6. Chat context is not authoritative project memory. **REPORTED policy, adopted by these documents.**
7. Repository context documents are authoritative. **REPORTED policy, adopted by these documents.**
8. The `downstream-artifacts` tunnel remains reserved and inactive until the Engine output contract is stable. **REPORTED.**
9. Secure tunnel restart automation is operational hardening, not feature work. **REPORTED.**

## Current work inventory

At bootstrap start the Git inventory was empty. **VERIFIED.**

This documentation parcel is intentionally limited to:

- `docs/_context/program/CONTROLSTACK_PROGRAM_STATE.md`
- `docs/_context/program/CONTROLSTACK_LANE_REGISTRY.md`
- `docs/_context/program/CONTROLSTACK_SEAM_CONTRACTS.md`
- `docs/_context/program/CONTROLSTACK_INTEGRATION_QUEUE.md`
- `docs/_context/program/CONTROLSTACK_DECISION_LOG.md`
- `docs/_context/program/CONTROLSTACK_ORCHESTRATION_CONTRACT.md`
- `docs/_context/program/CONTROLSTACK_PROGRAM_HANDOFF.md`

No feature file is authorised for modification in this parcel. **VERIFIED task boundary.**

## Known blockers and risks

- Lane evidence from Selector and Lab is reported, not directly verified by this app. Their current branch, HEAD, dirty state, and live services may have changed. **UNKNOWN current state / VERIFIED evidence limitation.**
- Program acceptance history predating these documents is not durable or fully reconstructable from repository evidence alone. **UNKNOWN.**
- Program branch divergence from `origin/lane/program-integrate` is not quantified by the status response beyond the branch display. **UNKNOWN.**
- Main-branch state and promotion mechanism are outside the connected root and were not inspected. **UNKNOWN.**
- The Engine output contract is not yet declared stable; therefore downstream-artifact activation must remain held. **REPORTED.**
- Deployment v2 is implemented in the Program lane from the accepted 2026-07-17 host inventory. Source validation is green; Windows installation and post-reboot acceptance remain pending. **VERIFIED repository state / PENDING host activation.**

## Acceptance status

- Identity and capability checks: **VERIFIED PASS.**
- Existing-document duplication check: **VERIFIED PASS; no equivalent program files found.**
- Documentation creation: **VERIFIED PASS; exactly seven canonical Program files were created and inspected.**
- Scoped staging: **VERIFIED PASS; exactly the seven named documentation paths were staged and no feature paths were present.**
- `program-integrate` gate: **VERIFIED PASS on 2026-07-17; 18 passed, 0 failed.**
- Gated commit and push: **TO BE IDENTIFIED by the commit containing this document and the connected-app execution receipt.**

The commit containing this document, the gate result above, the push receipt, and final `repo_git_status` are the authoritative execution evidence for this bootstrap parcel.

## 2026-07-18 environment and lane-memory closeout

- **VERIFIED:** Service Manager v2 reports all eight Selector, Lab, Program, runtime/specification, and OpenAI tunnel services READY / MANAGED.
- **VERIFIED:** Selector lane memory is committed and pushed at `678cf83c9f97bfcdc397b574c4eab08b306656ee`; `selector-engine` passed 100/100 and the lane ended clean.
- **VERIFIED:** Lab lane memory is committed and pushed at `1b154c482978a9c77a9ea5325cd103bfe40b14ed`; `lab-ies` passed 147/147.
- **VERIFIED:** The Lab feature parcel remains preserved after the memory checkpoint: 10 modified, 66 untracked, zero staged, zero deleted.
- **VERIFIED:** Program checkpoint tooling repair is committed and pushed at `2e72aa80d39507ff7aa530d3fa8f8ed0e5b9cb0a`; `program-integrate` passed 26/26 and Program ended clean.
- **VERIFIED:** No feature lane was merged to `main`; downstream artifacts remain held.
- **Current milestone:** lane orchestrators may resume independently from their committed `SESSION_HANDOFF.md` files. Program next reconciles the two lane-memory heads and maintains seam governance.

## 2026-07-18 accepted-head reconciliation and integration order

### Reconciled evidence

- **VERIFIED:** Program began this reconciliation clean at `eaa6d93f73163150028b361c16a2f194b687b68a` on `lane/program-integrate`.
- **VERIFIED:** Program history contains the shared accepted feature base `08df070890300058353cc621c1383f16492063f1`, the Program tooling checkpoint `2e72aa80d39507ff7aa530d3fa8f8ed0e5b9cb0a`, and the three-lane memory acceptance commit `eaa6d93f73163150028b361c16a2f194b687b68a`.
- **VERIFIED:** Selector memory head `678cf83c9f97bfcdc397b574c4eab08b306656ee` is pushed, passed `selector-engine` 100/100, and ended clean.
- **VERIFIED:** Lab memory head `1b154c482978a9c77a9ea5325cd103bfe40b14ed` is pushed and passed `lab-ies` 147/147; the 10 modified and 66 untracked IES paths remain deliberate working-tree content with zero staged or deleted paths.
- **UNKNOWN:** Exact commit ancestry from either lane-memory head to the current Program head is not exposed by the connected Program app. No merge-base, cherry-pick range, or absence/presence claim is inferred from commit subjects alone.

### Head classification

| Head | Program classification | Integration consequence |
|---|---|---|
| Program `eaa6d93f73163150028b361c16a2f194b687b68a` | accepted current Program history | documentation and orchestration authority for this reconciliation |
| Selector `678cf83c9f97bfcdc397b574c4eab08b306656ee` | accepted lane-memory evidence anchor | not itself a feature integration parcel; future Selector parcels must declare an exact base/head range from this accepted lane state or a verified descendant |
| Lab `1b154c482978a9c77a9ea5325cd103bfe40b14ed` | accepted lane-memory evidence anchor | not itself a feature integration parcel; preserved dirty IES work remains outside the accepted commit and must be checkpointed only in bounded Lab parcels |

### Seam dependencies

The cross-lane dependency chain is:

1. Seam A — source-backed Selector intent and authority.
2. Seam B — accepted selected-result persistence and versioned Engine run-table output.
3. Seam C — Lab consumes only that accepted output through the safe handoff boundary.
4. Seam D — Lab supplies consumer compatibility and preserved-dirt evidence.
5. Seam E — Program accepts immutable producer and consumer parcels serially.

Current repository tests show that the selected-result, run-table-first, and IES handoff surfaces are still intentionally diagnostic/read-only/fail-closed, with production RunTable and IES generation disabled. **VERIFIED from current Program-history test fixtures.** Therefore a memory checkpoint cannot be treated as proof that the Engine output contract is stable.

### Safe integration order

1. Complete this Program documentation reconciliation only.
2. In the Selector lane, complete and checkpoint the bounded single-slice E2E producer closeout and the exact Engine output contract evidence.
3. Program accepts that Selector producer parcel first, reviews Seams A/B, and runs `program-integrate` on a bounded integration parcel.
4. Lab may continue independent lane-local IES checkpoints, but no Lab change that consumes a new Engine shape enters Program before step 3.
5. After an exact Program-accepted producer schema exists, Lab validates or adapts Seam C in a bounded parcel while preserving unrelated IES dirt.
6. Program accepts the Lab consumer parcel second, using Seam D evidence and another bounded `program-integrate` gate.
7. Only after producer and consumer evidence is green may Program consider a decision declaring Seam B stable. `main` promotion and `downstream-artifacts` activation remain unauthorised and held.

**Current milestone:** accepted-head reconciliation and safe cross-lane ordering are complete. The next integration dependency is Selector-owned producer evidence, not Program feature implementation.

## 2026-07-18 Lab P2 Checkpoint 1 tooling blocker

### Verified Lab receipt

- **VERIFIED FROM LANE RECEIPT:** P2 Checkpoint 1 is confined to exactly four files:
  - `packages/lab-kernel/ies-toolkit/iesKeywordContract.js`
  - `packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js`
  - `tests/lab-kernel/iesKeywordContract.test.js`
  - `tests/lab-kernel/iesLabFormKeywords.test.js`
- **VERIFIED FROM LANE RECEIPT:** focused keyword coverage passed 5/5 and `lab-ies` passed 147/147.
- **VERIFIED FROM LANE RECEIPT:** the four-file parcel remains staged; 11 unrelated protected modified paths and 62 remaining untracked paths remain unstaged; zero deleted paths; HEAD remains `1b154c482978a9c77a9ea5325cd103bfe40b14ed`.
- **VERIFIED FROM LANE RECEIPT:** no commit or push occurred because the live shared MCP returned `worktree_guard / unstaged_or_untracked_files_present` after confirming the exact staged parcel.

### Program diagnosis

- **VERIFIED:** Deployment v2 runs all three MCP services from `C:\ControlStack_Worktrees\controlstack-tooling-v2`, not from the Program, Selector, or Lab worktrees.
- **VERIFIED:** The MCP source copy currently visible in `lane/program-integrate` is not the deployed tooling authority: its `repo_info` implementation lacks lane-aware fields that the live service returns.
- **CONSEQUENCE:** Program must not patch the stale worktree copy and claim the Lab connector is repaired. The correction must be implemented, tested, committed, pushed, and activated in the dedicated `controlstack-tooling-v2` worktree, then the Lab MCP service must be restarted and reverified.

### Current Lab status

P2 Checkpoint 1 is **IMPLEMENTATION COMPLETE / GATE GREEN / COMMIT BLOCKED BY SHARED TOOLING**. The next two-file `iesWorkingRecord` checkpoint remains unauthorised until the staged four-file checkpoint is committed and pushed. The Lab lane must remain paused with its current classified state intact.

## 2026-07-19 current integration state

- **VERIFIED:** Program is connected to `C:\ControlStack_Worktrees\program-integrate`, branch `lane/program-integrate`, through the `program-integrate` gate; the starting tree for this session was clean at `7cff9e8428e98c611a9d97d242502bebc9e157a3`.
- **REPORTED CURRENT UPDATE:** shared-tooling repair `2e4d880` is committed and pushed, and Lab subsequently pushed `bda7d61`, `a2142952`, `8749bbe1`, and `d0577a9d`.
- **VERIFIED CAPABILITY LIMIT:** this Program connection cannot resolve the Lab branch, inspect target `main`, create or merge a pull request, operate a dedicated integration worktree, or push `main`.
- **CONSEQUENCE:** the first Lab promotion is blocked by Program connection capability, not by the reported Lab gate or parcel state. The promotion path defined in `CONTROLSTACK_MAIN_PROMOTION_PATH.md` is not executable from the present app.
- **VERIFIED LOCAL RESOLUTION:** the stale executable-looking Program MCP copy has been separated into `controlstack_mcp_program_contract_snapshot.py`; the old `controlstack_mcp.py` path is now a fail-closed tombstone and the snapshot refuses direct server startup.
- **CURRENT MILESTONE:** checkpoint and push this bounded Program-local stale-copy resolution, then await a promotion-capable Program surface before assessing or merging the reported Lab commits.

## 2026-07-19 LAB-017 approval state

- **REPORTED:** LAB-016 offline fixture snapshot is complete and pushed; all reported checks passed 159/159; final Lab state is zero staged, zero modified, 33 protected untracked, and zero deleted paths.
- **REPORTED:** the reusable Lab worker prompt is committed in lane memory, no queue item is ready, and LAB-017 implementation has not started.
- **VERIFIED PROGRAM FINDING:** LAB-017 is absent from Program memory and its exact seam contract, files, producer/consumer impact, compatibility, rollback, and acceptance envelope are unknown here.
- **DECISION:** LAB-017 remains held and is not authorised for implementation.
- **OWNER:** the Lab orchestrator records the exact seam envelope; Program & Integrate then decides approval. Patrick has no action.

## 2026-07-19 Selector Tier authority approval state

- **REPORTED DIAGNOSIS:** Selector registration and candidate mapping require manually committed Tier before Engine execution, while Tier is derived only by Engine/Lex after execution; the current contract is therefore unsatisfiable and blocks Engine work.
- **PROGRAM DECISION:** approved with conditions to remove Tier from Selector eligibility/candidate authority and derive it exclusively at the server-owned Engine/Lex boundary.
- **PRESERVED:** all other required inputs, source authority, read-only/no-write operation, explicit Control selection, and no fabricated project truth.
- **FAIL-CLOSED RULE:** no default or client-supplied Tier authority; ambiguous or unavailable derivation must produce a specific blocker.
- **DOWNSTREAM:** no Tier output-shape change is approved. Lab & IES is a potential compatibility consumer only; no Lab implementation is authorised unless a separate incompatibility parcel is evidenced.
- **NEXT:** Selector may commission the bounded implementation and cite the Program decision and seam-contract amendment recorded in this commit. Patrick has no action.

## 2026-07-19 LAB-017 version-1 approval state

- **REPORTED:** Lab committed the complete version-1 seam envelope; no implementation has started; no other seam is included; full `lab-ies` passes 159/159.
- **PROGRAM DECISION:** approve the envelope unchanged and authorise LAB-017 to move from `blocked` to `ready`.
- **APPROVED BOUNDARY:** the exact public interface and data shapes, exact two-file implementation scope, named current-consumer break, rollback sequence, and success/rejection/immutability/leak-prevention/boundary tests recorded in version 1.
- **PROGRAM OWNERSHIP PRESERVED:** production serial allocation, resolver hosting, route-to-storage mapping, persistence, authentication, deployment, and endpoint ownership.
- **INVALIDATION RULE:** any drift in interface, shape, consumers, ownership, rollback, tests, file scope, or seam count requires a new Program decision.
- **NEXT:** Lab may record this approval, change LAB-017 to `ready`, and commission one bounded worker. Patrick has no action.

## 2026-07-19 LAB-017 completion and LAB-018 state

- **REPORTED COMPLETE:** LAB-017 was implemented under version 1 with only the reference/resolver helper and its dedicated test committed.
- **REPORTED VALIDATION:** focused, full, feature-commit, and documentation-closeout checks passed 169/169; pushes were confined to the Lab lane.
- **REPORTED FINAL STATE:** zero staged, one expected HEAD-marker edit, 32 protected untracked, and zero deleted paths.
- **PROGRAM ACCEPTANCE:** closed on the complete immutable receipt now recorded in the Lab handoff.
- **PROMOTION:** not performed; main promotion remains a separate Program action requiring the recorded promotion capability.
- **LAB-018 HISTORICAL HOLD:** superseded by the consolidated seven-seam approval below; current readiness is governed by one-parcel-at-a-time sequencing.
- **OWNER:** no separate LAB-018 request remains outstanding. Patrick has no action.

## 2026-07-20 consolidated seven-seam approval state

- **REPORTED:** Lab has committed one immutable envelope covering seven blocked seams and reports `lab-ies` 169/169.
- **PROGRAM DECISION:** approve the six non-kernel seams unchanged and approve the governed reference-composition kernel with explicit constraints.
- **KERNEL CONTRACT:** exactly two unique non-merged parents; parent order preserved as significant provenance; exact matching photometric grids with no interpolation or resampling; allocation, authority, approval, and sealing remain external.
- **FAIL-CLOSED:** duplicate or pre-composed parents, provenance loss/reordering, grid mismatch, or governance expansion must be rejected specifically.
- **SEQUENCING:** only the next eligible parcel may become `ready`; all later approved parcels remain sequence-blocked. No parallel implementation is authorised.
- **NEXT:** Lab records this approval, advances one parcel at a time, and returns a separate immutable receipt for each. Patrick has no action.

## 2026-07-20 LAB-029 provenance publication approval state

- **REPORTED ENVELOPE:** checkpoint `7b74ca49665007311f6dbb8cfdccc47be5472353`, queue item `LAB-029-provenance-publication-surfaces`.
- **REPORTED VALIDATION:** documentation-only checkpoint; no implementation started; `lab-ies` 255/255 with no failed, cancelled, skipped, or todo tests.
- **PROGRAM DECISION:** approve `LAB-029_SEAM_ENVELOPE` version 1 unchanged.
- **AUTHORISED FILES:** only `provenance.html`, `provenance_explorer.html`, and `luminaire_provenance.html` under `packages/lab-kernel/ies-toolkit/`.
- **SAFE INPUTS:** existing sealed-reference identity, canonical host-free resolver availability, and evidence-capability projections only.
- **PUBLICATION STATES:** governed mode uses Program-supplied safe projections; fixture mode remains visibly labelled `OFFLINE DEMO — UNAPPROVED`.
- **NULL RULE:** emergency and EWIS assembly verification remain `null`.
- **OWNERSHIP PRESERVED:** no allocation, sealing, resolver hosting/origin/endpoints, route-to-storage, persistence, authentication, deployment, evidence acceptance, raw/source publication, or private authority reconstruction moves to Lab.
- **SEQUENCING:** LAB-029 may become `ready` only when next eligible under the existing one-parcel-at-a-time rule.
- **NEXT:** Lab may implement the exact three-file parcel when sequentially eligible and must return an immutable receipt. Patrick has no action.

## 2026-07-20 Lab keyword-migration corrective approval state

- **REPORTED FAILURE:** full `lab-ies` is 253/255; two failures are stale migration-guard expectations for editable `sysTa` ambient and literal `canonicalKeywordRows(...)` helper text.
- **PROGRAM DECISION:** approve one test-only corrective parcel before LAB-033 resumes.
- **SOLE AUTHORISED FILE:** `tests/lab-kernel/iesKeywordMigration.test.js`.
- **PRESERVED CONTRACT:** exact ordered 16 keywords; rejection of `_AMBIENT_TA_C`, supplementary keywords and aliases; Main Bench consumption of the committed contract; sealed/non-editable `_INTERNAL_AMBIENT_TA_C`; generator, merge, summary, and project-builder checks.
- **NO PRODUCTION CHANGE:** no bench, module, authority, sealed-reference, Selector, Runtime, Engine, or Program implementation file is authorised.
- **SEQUENCE:** corrective test commit, corrective documentation closeout, LAB-033 restored as sole ready item and full gate rerun, final keyword guard retained for after LAB-033.
- **LAB-033 STATE:** incomplete, unstaged, unpushed, and paused until the corrective parcel closes.
- **NEXT:** Lab may execute the one-file correction and return its immutable receipt. Patrick has no repository action.

## 2026-07-20 LAB-033/LAB-034 acceptance and LAB-035 approval state

- **VERIFIED COMPLETE:** the keyword correction, LAB-033 Main Lab Bench and LAB-034 legacy compatibility classification are pushed and full `lab-ies` is 255/255.
- **PROTECTED STATE:** zero staged, one expected HEAD-marker edit, seven protected untracked items, zero deleted.
- **LAB-033 ACCEPTED:** non-authoritative, module-driven Main Lab Bench.
- **LAB-034 ACCEPTED:** read-only compatibility inspector with duplicate authority and generation paths removed.
- **LAB-035 ENVELOPE:** immutable version 1 at `1c422dec0cb4efb0777d61bebcf6cf4ee9a33a5f`.
- **PROGRAM DECISION:** approve unchanged.
- **SOLE AUTHORISED FILE:** `packages/lab-kernel/ies-toolkit/selector_stub.html`.
- **BOUNDARY:** contract viewer only; no selection, defaults, scaling, rotation, generation, Engine invocation, persistence, route or acceptance proof.
- **SAFE INPUTS:** approved reference identity, safe runtime handoff and bounded Selector readiness display projection only.
- **QUEUE:** LAB-035 becomes the sole ready item; LAB-036 and later remain blocked by sequence.
- **NEXT:** Lab records approval, implements the exact one-file parcel and returns separate feature and documentation receipts. Patrick has no action.

## 2026-07-20 binding thermal-chain state

- **SELECTOR:** owns user room ambient only and passes it unchanged.
- **LAB:** owns the optic-bound measured triplet with evidence provenance: `referenceRoomTaC` from legacy `room_ta_c`, absolute `referenceInternalTaC` from misleading legacy `optic_internal_delta_ta_c`, and actual `opticThermalRiseTaC` from legacy `optic_uplift_ta_c`.
- **ENGINE:** owns the single addition `selectedRoomTaC + opticThermalRiseTaC`, uses the result as curve lookup temperature, applies curve clamping/interpolation and returns verified lm/m.
- **PROGRAM:** owns the adapter, provenance checks and acceptance gate.
- **VERSION-1 LOOKUP RULE:** `curveLookupTaC === derivedInternalTaC`; a later board-temperature transform requires a new decision.
- **SEALED KEYWORD:** `_INTERNAL_AMBIENT_TA_C` remains the Lab authority-test internal measurement, not the runtime-derived operating temperature.
- **SEL-018:** blocked as worded; it must be amended before implementation because room ambient may not be used directly as lookup temperature.
- **TEST:** mandatory varied-optic `optic_uplift_ta_c` fixture, exact 25+10=35 and 35+10=45 cases, explicit proof that legacy `optic_internal_delta_ta_c = 35` is absolute internal temperature rather than rise, no hardcoded 35 or 10, no double count, identity-bound evidence and fail-closed contradictions.
- **NAMING:** new contracts prohibit `opticInternalDeltaTaC`; adapters expose `referenceInternalTaC` and `opticThermalRiseTaC`, with a later source-model rename recommended.
- **AUDIT:** Runtime is checked against the approved data model, not donor-code parity.
- **NEXT:** affected lane parcels must cite this ruling; no thermal-chain implementation is authorised by the ruling alone. Patrick has no action.

## 2026-07-21 SEL-018 corrected admission state

- **REPOSITORY FINDING:** the Selector preview captures Ambient intent, while the read-only Engine candidate mapper omits it and current coverage permits mapping without Ambient.
- **PROGRAM DECISION:** amend SEL-018 to transmit the user room value only.
- **SOLE READY SELECTOR PARCEL:** `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js` plus `tests/selectorReadonlyEngineCandidateMapper.test.js`.
- **OUTPUT:** exactly `selectedRoomTaC`, parsed from one committed, source-backed Celsius Ambient selection.
- **NO THERMAL MATH:** no rise, reference-internal value, derived internal value, lookup temperature, board temperature, clamp, interpolation or verified lm/m.
- **FAIL CLOSED:** missing, malformed, duplicate, uncommitted or non-source-backed Ambient blocks the amended handoff.
- **PRESERVED:** existing tier, run, target lm/m, CCT/CRI, optic and control mapping.
- **LANE ISOLATION:** no broad Selector module change; no Engine, Lab, route, persistence, generation or RuntimeData change.
- **QUEUE:** SEL-018 is ready in Selector; LAB-035 remains ready in Lab; Engine thermal work remains blocked pending accepted Selector and Lab receipts.
- **NEXT:** Selector may implement the exact two-file parcel and return the full `selector-engine` gate receipt. Patrick has no action.

## 2026-07-21 corrected Lab thermal semantics approval state

- **LAB PROPOSAL:** version-1 five-parcel envelope reviewed after a 255/255 Lab gate.
- **PROGRAM DECISION:** approve unchanged.
- **SOLE READY LAB PARCEL:** LAB-038 resolution thermal semantics version 2.
- **SEQUENCE-BLOCKED:** LAB-039 component projection v2, LAB-040 Lab projection v2, LAB-041 corrected labels and LAB-042 final guard.
- **MAPPING:** `room_ta_c` -> `referenceRoomTaC`; misleading `optic_internal_delta_ta_c` -> absolute `referenceInternalTaC`; `optic_uplift_ta_c` -> `opticThermalRiseTaC`.
- **VALIDATION:** exact canonical-decimal measured triplet; varied-optic proof changes legacy uplift; contradictory triplets fail closed.
- **NO LAB ENGINE WORK:** no selected-room combination, derived internal, lookup, clamp, board temperature or verified lm/m.
- **AUTHORITY:** LAB-040 keeps evidence authority null/unresolved; a sealed optic identity does not prove accepted thermal evidence.
- **OUT OF SCOPE:** source fixture/model rename, Program adapter, Selector, Engine, routes, persistence and compatibility aliases.
- **ENGINE HOLD:** Engine thermal derivation remains blocked pending accepted Selector and later accepted Program-bound thermal evidence receipts.
- **NEXT:** Lab records the approval and may run the five parcels sequentially under its standing worker. Patrick has no action.

## 2026-07-21 LAB-038 atomic transition amendment state

- **GATE FINDING:** resolver version 2 causes eight mandatory adapter-test failures because the adapter imports the resolver schema constants.
- **INFEASIBLE SCOPE:** a resolver-only two-file LAB-038 cannot produce the required full green checkpoint.
- **AMENDED SCOPE:** resolver module/test plus Lab adapter module/test, exactly four files.
- **TRANSITION ONLY:** adapter continues to publish projection version 1 and its existing non-thermal shape.
- **INPUT MIGRATION:** adapter accepts only corrected resolution version 2 and corrected optic input names.
- **NO EARLY LAB-040:** no thermalEvidence output, evidence authority, adapter schema version 2 or Engine value is authorised in LAB-038.
- **QUEUE:** LAB-038 remains sole ready; LAB-039 through LAB-042 remain sequence-blocked.
- **NEXT:** Lab completes the atomic four-file checkpoint, then closes documentation and advances LAB-039. Patrick has no action.

## 2026-07-21 LAB-042 gate-included guard amendment state

- **COMPLETED:** LAB-038 through LAB-041 are green and pushed.
- **GATE COVERAGE FINDING:** the approved new LAB-042 test file is absent from the fixed `lab-ies` command and would not execute.
- **AMENDED EXACT FILE:** `tests/lab-kernel/iesKeywordMigration.test.js` only.
- **SUPERSEDED FILE:** the new thermal test file must not be created.
- **ACCEPTANCE:** unchanged corrected mappings, exact triplet, varied uplift, contradiction rejection, three version-2 schemas, legacy-name bounds and sealed-keyword meaning.
- **NO PRODUCTION CHANGE:** no source, fixture, gate configuration, route, persistence or Engine behaviour.
- **QUEUE:** LAB-042 is the sole ready Lab item.
- **NEXT:** Lab implements the final guard in the existing gate-included test, runs the full gate and closes the batch. Patrick has no action.

## 2026-07-21 thermal completion state after Lab closeout

- **LAB RECEIPT:** accepted. LAB-038 through LAB-042 are pushed, the corrected producer contracts are version 2 and the final `lab-ies` gate passed 262/262.
- **LAB AUTHORITY:** thermal evidence remains measured and unresolved at Lab with `authorityState: null`; Program acceptance does not rewrite that field.
- **SEL-018 AUDIT:** the current readable Runtime mapper contains no `selectedRoomTaC`; no accepted SEL-018 implementation receipt exists.
- **SELECTOR TOOLING:** the restarted app resolves to the isolated Selector worktree on `lane/selector-engine`, commit/push are enabled, and the tree is clean. The exact SEL-018 feature/test paths are writable. The live allowlist still omits the lane-document scope already present in the current Program manifest, so queue reconciliation and feature start remain held until the installed service configuration is refreshed. The unfinished runtime-port state in main is excluded and untouched.
- **SOLE READY SELECTOR ITEM:** SEL-018, exactly the mapper and focused test already approved.
- **ADMITTED NEXT PARCEL:** THERM-P1 Program thermal-evidence validation adapter, exactly one new module and one focused test; blocked until SEL-018 acceptance.
- **ADMITTED ENGINE PARCEL:** THERM-E1 thermal lumen execution, exactly one new module and one focused test; blocked until THERM-P1 acceptance.
- **ENGINE RULE:** derive `selectedRoomTaC + opticThermalRiseTaC` once, use the result as lookup temperature and delegate unchanged to the existing curve interpolation contract.
- **REJECTION RULE:** direct Lab projection input and caller-supplied derived, lookup, board-temperature or verified-output values fail closed.
- **MANDATORY DIFFERENTIATOR:** a second optic-bound bundle must change the measured rise and thereby change both lookup temperature and verified lm/m against the same room, current and curve.
- **HELD:** final cross-lane acceptance, Engine-contract stability declaration, downstream artifacts and main promotion remain held until SEL-018, THERM-P1 and THERM-E1 are accepted in order.
- **NEXT:** restore the Selector connector to the isolated worktree or use a correctly bound Selector worker; do not write main.

## 2026-07-21 selections-only Engine boundary state

- **BINDING SENTENCE:** Engine caller requirements and execution eligibility are the engineering selection set only.
- **OUTSIDE OWNER:** Workspace/governance owns human identity, project/deal/quote, owner, timeline, entitlement, handoff, save and result association.
- **OUTER ENVELOPE:** traceability metadata may wrap or store selections/results but is optional for calculation and cannot affect Engine eligibility or output.
- **INSIDE OWNER:** Engine resolves authoritative product/policy/Lab/curve data, creates candidates, derives/scales/scores and returns verified output.
- **TIER:** no client/manual Tier input or Tier registration gate; internal result profiles and policy consequences are derived.
- **VALID BLOCKERS:** required engineering selection, source/evidence integrity and physical/electrical/thermal/compliance constraints only.
- **INVALID BLOCKERS:** user, company, owner, project, deal, quote, timeline, handoff, save, registration, active revision or persistence acknowledgement.
- **SEL-018:** ready as selected-room transport only; no registration or Engine proof requirement.
- **SEL-019:** superseded as an Engine prerequisite; persistence testing moves outside the kitchen sequence.
- **THERM-P1:** internal technical evidence binding only, keyed by selected optic and free of human/project/registration authority.
- **THERM-E1:** unchanged one-time rise application and varied-optic output proof.
- **DELETION POLICY:** existing governance gates at the Engine boundary are deleted/bypassed, not repaired or replaced.
- **BRIEF RECONCILIATION:** original outer payload metadata is retained only as traceability; the briefs state it makes no engineering decisions and the donor kernel does not read it.
- **MAIN:** unfinished runtime-port work remains outside this sequence.
- **NEXT:** reconcile the Selector lane queue and execute SEL-018 without any project-registration dependency. Patrick has no action.

## 2026-07-21 selections-only thermal chain accepted state

- **QUEUE RECONCILIATION:** complete and pushed in the isolated Selector lane.
- **SEL-018:** complete; selected source-backed room value only, no registration/project/Tier/thermal calculation.
- **THERM-P1:** complete; internal optic/evidence validation only, no thermal arithmetic.
- **THERM-E1:** complete; measured rise applied exactly once and existing curve parser used unchanged.
- **CHANGED-OPTIC TEST:** passed; changed rise changed both lookup temperature and verified lm/m.
- **BOUNDARY REGRESSION:** passed; different user, company, project, quote, owner, timeline, registration, active revision and renamed eligibility envelope values produced an identical complete Engine response.
- **ENVELOPE QUARANTINE:** traceability values are neither interpreted nor returned; a derived-looking envelope value cannot affect computation.
- **GATE RECEIPT:** project registration, active revision and selected-project eligibility are bypassed from the computational path, not renamed.
- **DEPENDENCIES:** THERM-E1 reaches only the accepted Program evidence adapter and existing lumen-curve parser.
- **SELECTOR EVIDENCE:** focused 120/120; normal closeout 107/107; final Selector tree clean.
- **NO-WRITE BOUNDARY:** no route, persistence, RuntimeData mutation, donor invocation, IES generation, output generation, curve-parser change or main/runtime-port change.
- **CROSS-LANE STATUS:** accepted complete.
- **HELD SEPARATELY:** optional outside-governance persistence, downstream artifacts and main promotion.
- **NEXT:** preserve this seam and consider only separately approved work. Patrick has no action.

## 2026-07-21 Engine selected-result stability review state

- **STABILITY DECISION:** not declared.
- **SCHEMA EVIDENCE:** a versioned safe source object exists, but it remains diagnostic-only, non-persistent and summary-only.
- **PROJECTION EVIDENCE:** detailed selected-result acceptance and normalised per-run lookup remain disabled.
- **CONSUMER EVIDENCE:** selected-result projection and IES handoff readiness remain false; no accepted consumer receipt exists.
- **FIXTURE EVIDENCE:** no Program-accepted complete accepted/blocked fixture pair exists for the intended producer envelope.
- **ROLLBACK EVIDENCE:** no downstream compatibility/rollback rule was previously accepted.
- **DOWNSTREAM:** Seam G remains reserved and inactive.
- **MAIN:** promotion remains separately held and cannot be executed by the current lane-confined Program connection.
- **SUPERSEDED SNAPSHOT:** ENG-STAB-P1 was provisionally ready before the newer SEL-007 receipt was reviewed.
- **SUPERSEDED NEXT:** do not commission ENG-STAB-P1; the later SEL-007 acceptance state controls.

## 2026-07-21 SEL-007 candidate acceptance state

- **CANDIDATE RECEIPT:** accepted from the clean, pushed Selector lane with 114/114 focused coverage.
- **ACTIVE SCHEMAS:** `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`.
- **CURRENT LIMITS:** thermal output is one bounded component; RunTable output remains diagnostic-only; persistence-coupled legacy rows are outside Engine eligibility; the legacy row schema collision remains unresolved.
- **INTERNAL COMPONENT:** the concurrently completed `controlstack.engine.selected-result.v1` parcel passed 114/114 and is accepted as non-persistent internal producer evidence, not as the public output contract or stability receipt.
- **SOLE READY ITEM:** ENG-OUT-P1, exactly one new runtime contract module and one focused runtime test; it may import the internal selected-result component while exposing only the accepted three-schema boundary.
- **HELD:** consumer compatibility, stability declaration, Seam G, persistence and main promotion.
- **NEXT:** commission ENG-OUT-P1 in the isolated Selector lane. Patrick has no action.

## 2026-07-21 ENG-OUT-P1 accepted / consumer compatibility admitted state

- **PRODUCER:** complete and Program-accepted in the isolated Selector lane.
- **PUBLIC SCHEMAS:** `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1`, `controlstack.engine.runtable-row.v1`.
- **FINAL PRODUCER EVIDENCE:** focused 116/116; normal closeout 107/107; ending Selector tree clean.
- **REQUEST:** exact versioned selections-only draft; governance fields, caller Tier, candidates, scores and caller-derived/verified output rejected.
- **EVIDENCE OWNERSHIP:** evidence fingerprints are derived server-side from accepted technical provenance; callers cannot supply evidence authority.
- **OUTPUT:** deterministic complete or fail-closed blocked; valid zero values preserved; traceability envelopes inert and absent from output.
- **ROWS:** one exact non-persistent field set; colliding legacy row schema not reused.
- **STABILITY:** still not declared.
- **NEXT PARCEL:** ENG-STAB-C1, Lab-owned read-only compatibility adapter and focused test only.
- **LAB START STATE:** protected unrelated dirty inventory exists and no ready item is recorded; Program has not changed Lab files or started implementation.
- **LAB RECONCILIATION RULE:** preserve all current Lab modified/untracked paths; record ENG-STAB-C1 as sole ready before creating the two new files.
- **HELD:** IES generation, authority decisions, downstream writes/readiness, routes, persistence, Seam G and main promotion.
- **PATRICK:** no action required.

## 2026-07-21 Seam B Engine output version-1 stable state

- **STABILITY:** declared for the public Engine output contract and read-only compatibility boundary only.
- **PUBLIC SCHEMAS:** exact version 1 selection set, output and RunTable-row contracts.
- **PRODUCER EVIDENCE:** focused 116/116; normal Selector closeout 107/107; clean ending Selector tree.
- **CONSUMER EVIDENCE:** import-free Lab adapter; initial and thermal-tightening checkpoints each 269/269; Lab queue empty.
- **SEALED FIXTURES:** complete, blocked, valid-zero, replay/governance-independent, exact-row, thermal-equation, clamp/mode, unsafe/private, contradictory, extra-evidence and legacy-row cases accepted.
- **ROLLBACK:** exact-version fail-closed compatibility; removal or non-use only; no data migration, record repair, route reversal or authority rollback.
- **LEGACY:** the diagnostic RunTable scaffold remains diagnostic-only; persistence-coupled first-narrow rows and the colliding legacy schema remain ineligible.
- **SEAM G:** reserved and inactive.
- **HELD:** IES generation, downstream artifacts, writes/readiness, routes, persistence and main promotion.
- **QUEUE:** empty; no implementation parcel admitted by the stability decision.
- **NEXT:** Program must create a separate exact parcel before any downstream work. Patrick has no action.

## 2026-07-21 Seam G producer commission state

- **SEAM B:** version 1 remains stable and unchanged.
- **SEAM G:** candidate sequence opened but tunnel remains inactive.
- **SOLE READY ITEM:** SEAM-G-P1 in the isolated Selector lane.
- **PRODUCER SCHEMA:** `controlstack.downstream.ies-artifact-request.v1`.
- **INTENT:** exact IES LM-63 reference-build request only; no generic artifact family and no Selector output button.
- **INPUT:** stable public Engine output JSON, exact artifact intent and optional quarantined traceability envelope.
- **OUTPUT:** deterministic complete-or-blocked read-only request with replay/audit identity and safe public technical content only.
- **IDEMPOTENCY:** identical technical inputs produce identical output; traceability changes are inert; technical identity changes move request identity.
- **FAILURE ISOLATION:** malformed/unsafe/contradictory/legacy input fails closed with no partial artifact-ready request.
- **WRITES:** none; no route, persistence, file, download, email, generator, authority, reference mutation or downstream activation.
- **SEQUENCE BLOCKS:** SEAM-G-C1 waits for Program producer acceptance; SEAM-G-A1 waits for producer and consumer acceptance.
- **MAIN:** held; unfinished runtime-port work excluded.
- **NEXT:** reconcile Selector queue and implement SEAM-G-P1 in exactly two new files. Patrick has no action.

## 2026-07-21 Seam G consumer commission state

- **SEAM-G-P1:** complete and Program-accepted; focused 115/115, normal closeout 107/107, clean Selector tree.
- **PRODUCER RESULT:** deterministic ready-or-blocked IES request JSON; replay/idempotency, valid zeros, governance quarantine, technical identity movement and failure isolation accepted.
- **SOLE READY ITEM:** SEAM-G-C1 in Lab & IES.
- **LAB FILES:** one new import-free request compatibility adapter and one focused test.
- **CONSUMER INPUT:** plain public `controlstack.downstream.ies-artifact-request.v1` JSON only.
- **CONSUMER OUTPUT:** immutable ready-or-blocked compatibility projection with public identities, safe technical values/rows and no-write safety state only.
- **PROTECTED LAB STATE:** expected branch marker and three protected untracked items remain outside the parcel.
- **BLOCKED:** SEAM-G-A1, actual IES generation, authority, evidence acceptance, reference mutation, routes, persistence, network/file/email output, downstream readiness, main and runtime-port work.
- **NEXT:** reconcile the Lab queue and implement SEAM-G-C1 in exactly two new files. Patrick has no action.

## 2026-07-21 Seam G read-only tunnel active state

- **SEAM-G-P1:** accepted; producer 115/115 focused and 107/107 normal closeout.
- **SEAM-G-C1:** accepted; import-free Lab consumer 276/276 and queue closeout complete.
- **SEAM-G-A1:** complete; version-1 read-only request tunnel active as a contract/validation boundary only.
- **ACTIVE PATH:** stable Engine output -> deterministic IES artifact request -> import-free Lab compatibility projection.
- **REPLAY:** identical technical input produces identical request/replay/audit and compatibility output; governance context is inert and absent.
- **FAILURE ISOLATION:** blocked or invalid inputs fail closed with no ready request, partial consumer body or side effect.
- **SECURITY:** no raw IES/photometry/candela/private path, caller authority or governance data crosses the seam.
- **ROLLBACK:** removal or non-use only; no migration, record repair, artifact deletion, route reversal or authority repair.
- **NOT ACTIVE:** live route, generator invocation, LM-63 body, authority allocation/approval/sealing, evidence acceptance, reference mutation, storage, file/download/email output, persistence or downstream readiness.
- **QUEUE:** empty; a new exact Program parcel is required for generation or delivery.
- **MAIN:** held; unfinished runtime-port work excluded.
- **NEXT:** no authorised implementation item. Patrick has no action.

## 2026-07-21 Seam G generation-input commission state

- **READ-ONLY REQUEST TUNNEL:** active and unchanged.
- **SOLE READY ITEM:** SEAM-G-P2 in Selector & Engine.
- **PRODUCER INPUT:** exact ready artifact request v1 plus exact matching Engine selection-set request v1.
- **FIRST SLICE:** one run only; exact system, optic, target lm/m, room ambient, protocol, quantity and length.
- **IDENTITY:** selection fingerprint is recomputed and matched; generation-input identity is deterministic and traceability-inert.
- **OUTPUT:** read-only `controlstack.downstream.ies-generation-input.v1`; no reference authority or generated body.
- **SEQUENCE BLOCKS:** Lab reference binding waits for Program producer acceptance; binding activation waits for producer and consumer acceptance.
- **BLOCKED:** sealed DTO load, LM-63 generation, authority, evidence acceptance, reference mutation, storage, routes, persistence, file/network/email delivery, main and runtime-port work.
- **NEXT:** reconcile Selector queue and implement SEAM-G-P2 in exactly two new files. Patrick has no action.

## 2026-07-21 Seam G reference-binding commission state

- **SEAM-G-P2:** complete and Program-accepted; focused 115/115 and normal closeout 107/107, clean Selector tree.
- **SOLE READY ITEM:** SEAM-G-C2 in Lab & IES.
- **CONSUMER INPUT:** public generation-input v1 plus public NVB Lab projection v2 only.
- **READY BINDING:** optic path, no unresolved blockers, exact optic key/variant, optic BOM, evidence ref, measured thermal triplet and read-only OPT reference identity agreement.
- **OUTPUT:** immutable ready-or-blocked generation-reference binding projection; no sealed DTO body.
- **PROTECTED LAB STATE:** expected marker and three protected untracked items remain outside the parcel.
- **BLOCKED:** storage resolution, sealed DTO load, authority/evidence mutation, generator invocation, LM-63 text, routes, persistence, files/delivery, readiness, main and runtime-port work.
- **NEXT:** reconcile Lab queue and implement SEAM-G-C2 in exactly two new files. Patrick has no action.

## 2026-07-21 Seam G generation-binding tunnel active state

- **SEAM-G-P2:** accepted; focused 115/115 and normal Selector closeout 107/107.
- **SEAM-G-C2:** accepted; import-free Lab binder and identity tightening, final gate 285/285.
- **SEAM-G-A2:** complete; read-only generation-binding tunnel active.
- **ACTIVE PATH:** ready artifact request plus matching selection request -> deterministic single-run generation input -> independently validated OPT reference identity binding.
- **IDENTITY:** selection fingerprint, artifact request, generation input/audit and binding/reference identities are reconstructed and matched; optic key/variant, BOM, evidence and measured thermal triplet agree exactly.
- **REPLAY:** identical technical inputs replay identically; changed generation or reference identity moves the binding; outer traceability is inert and absent.
- **FAILURE ISOLATION:** unknown, extra, unresolved, private/raw, unsafe or contradictory input fails closed with no partial ready binding or side effect.
- **ROLLBACK:** removal or non-use only; no data migration, record repair, route reversal, authority repair or reference rollback.
- **NOT ACTIVE:** storage resolution, sealed reference DTO loading, authority/evidence mutation, IES generator invocation, LM-63 text, files/download/email, routes, persistence or delivery readiness.
- **QUEUE:** empty; no implementation item is authorised.
- **MAIN:** held; unfinished runtime-port work excluded.
- **NEXT:** a new exact Program parcel is required before any generator invocation. Patrick has no action.

## 2026-07-21 sealed-reference inspection commission state

- **SOLE READY ITEM:** SEAM-G-C3 in Lab & IES.
- **INPUT:** one exact sealed one-millimetre reference DTO supplied in memory; no storage resolution.
- **VALIDATOR:** the existing private generator `validateReference` path; no duplicated or weakened validator.
- **OUTPUT:** redacted ready-or-blocked generation inspection with public identity, safe baseline values, baseline lm/m and watts/m, missing keyword override names and no-generation safety state.
- **PRIVATE:** metadata, angles, candela, keyword values, provenance paths and sealed body never cross the inspection output.
- **NOT AUTHORISED:** multiplier, generation job, project/customer metadata, generator/materialise call, LM-63 text, route, storage, persistence, files/delivery, main or runtime-port work.
- **NEXT:** reconcile Lab queue and implement SEAM-G-C3 in the exact two-file scope. Patrick has no action.

## 2026-07-21 materialisation job-plan commission state

- **SEAM-G-C3:** complete and Program-accepted; exact inspection passed 295/295.
- **SOLE READY ITEM:** SEAM-G-C4 in Lab & IES.
- **INPUTS:** public generation-input, generation-reference-binding and reference-inspection version-1 JSON only.
- **MULTIPLIER:** Engine verified lm/m divided by sealed baseline lm/m; target lm/m is intent only.
- **READY JOB:** exact run length, finite positive derived multiplier and empty selections object; inspection must have no missing overrides.
- **FAIL CLOSED:** identity mismatch, missing overrides, zero/non-positive verified or baseline output, non-finite ratio, private/raw/unsafe or contradictory state.
- **NOT AUTHORISED:** caller keyword override, sealed DTO, resolver/storage, generator/materialise call, LM-63 text, project/customer metadata, route, persistence, files/delivery, main or runtime-port work.
- **NEXT:** reconcile Lab queue and implement SEAM-G-C4 in exactly two new files. Patrick has no action.

## 2026-07-21 Program work-shape ruling state

- **LANE RULING:** Governance & Shell approved as a separate lane from Selector & Engine.
- **CRM RULING:** no separate CRM lane now; item 7 remains a blocked Governance substream until the portal-scope pre-check and exact connector writer exist.
- **PROVISIONING OWNER:** Program & Integrate; dedicated worktree, branch, MCP identity, write globs and gate required before governance feature work.
- **SELECTOR READY:** PWS-001 only — retire named CRM gates and emit deterministic state-entry intent.
- **SELECTOR ADMITTED:** PWS-002 Factory Ready after PWS-001; PWS-005 lifecycle-copy correction after PWS-002.
- **SIDE-EFFECT OWNER:** Selector emits readiness facts/intents; Governance performs project/identity/CRM policy and best-effort push.
- **GATEWAY:** all module retrieval/download/export/delivery paths must use one Governance gateway; readiness and identity remain separate.
- **SEAM G:** C4 remains ready in Lab in parallel; no direct Lab/Selector delivery path is permitted.
- **STANDING TESTS:** envelope variation plus no-envelope execution, changed-optic movement, varied placeholder row, and ownership-wide assertions are binding.
- **SOURCE RECORD:** `PROGRAM_WORK_SHAPE.md` retained unchanged with the Program ruling recorded separately.
- **NEXT:** Selector PWS-001 remains ready; Governance host activation uses the fixed provisioner; Lab may continue C4.

## 2026-07-21 Governance infrastructure implementation state

- **REPOSITORY:** Deployment v2 now defines five worktrees and nine managed services.
- **MCP:** Governance & Shell has a dedicated local MCP identity, branch guard, gate and conservative write globs.
- **GATE:** fixed reviewed governance/shell test discovery; exact worktree and branch required; no arbitrary command.
- **PROVISIONER:** fixed and idempotent; copies exactly six canonical founding records, refuses divergent overwrite, gates, commits, pushes, installs and verifies service health.
- **TESTS:** Program infrastructure gate passed 48/48.
- **LAB:** the staged C4 feature and protected local items remain untouched; fixture reconciliation is paused, not discarded.
- **ACTIVATION:** one local execution is required because the connected lane cannot create a sibling Git worktree or reload Windows services.
- **NEXT:** Governance lane activation is complete. GOV-001 is the sole ready Governance feature parcel.

## 2026-07-21 Governance first-parcel state

- **LANE:** active, isolated and ready for feature work.
- **READY:** GOV-001 — inert single data-retrieval gateway contract and shell view-state.
- **SEPARATION:** readiness and identity are distinct named checks; neither enters Engine eligibility or output.
- **ALLOWED:** safe scalar module/output descriptors, readiness labels, project-context presence, identity-capture presence and static discovery descriptions.
- **BLOCKED:** download, delivery, route, file/URL/blob, persistence, email, CRM, hard identity verification, Engine invocation, traceability-envelope inspection and readiness mutation.
- **FOLLOW-ON:** project persistence, then user identity/permissions; deferred-decisions panel may be interleaved as a non-overlapping small parcel.
- **CRM:** remains blocked.
- **NEXT:** commission GOV-001 in the Governance & Shell lane and return its gated receipt to Program.

## 2026-07-21 Lab C4 receipt state

- **SEAM-G-C4:** complete and Program-accepted after 305/305.
- **PARCEL:** exact two-file materialisation job-plan feature; fixture corrections changed tests only.
- **AUTHORITY:** multiplier remains Engine verified lm/m divided by sealed baseline lm/m; Selector target is intent only.
- **OUTPUT:** deterministic immutable ready-or-blocked plan with exact run length, finite positive multiplier and empty selections object.
- **LAB:** queue empty; expected branch marker and three protected local items remain.
- **BLOCKED:** sealed DTO loading, generator/materialise invocation, LM-63 output, route, persistence and delivery.
- **NEXT:** no Lab parcel is authorised until Program makes a new generator-invocation seam decision.

## 2026-07-21 Governance connector exposure state

- **LOCAL LANE:** Governance worktree, branch, founding records, gate and MCP service are healthy.
- **TUNNEL:** dedicated Governance secure tunnel profile is validated, activated, healthy and managed.
- **RECOVERY:** tunnel recovery passed after narrowing activation to managed tunnel services only.
- **PROFILE:** fixed Governance-only profile and local MCP target; no shared lane tunnel.
- **SECRETS:** existing encrypted runtime key reused in memory; no key, tunnel reference or remote endpoint stored in Git.
- **EXTERNAL STEP:** create/enable the Governance custom app in ChatGPT using the running secure tunnel.
- **GOV-001:** remains the sole ready feature parcel and starts immediately after app registration.
- **NEXT:** finish PWS-L1 with ChatGPT app registration; do not redirect GOV-001 through Program, Selector or Lab tools.

## 2026-07-21 Governance retrieval acceptance and persistence admission

- **CONNECTOR:** Governance custom app is active and the secure tool executed successfully.
- **GOV-001:** complete and Program-accepted after 152/152.
- **GATEWAY:** immutable, versioned, Governance-owned; readiness, project context and identity are separate; four deterministic states; no delivery permission.
- **DIRECT PATH:** the former shell-owned IES browser action is inactive; previews remain read-only.
- **PWS-L1:** complete.
- **GOV-003:** sole ready Governance parcel.
- **SCHEMA:** persisted/cache `workspace_saved_project.v2`; runtime-only shape through explicit adapters.
- **AUTHORITY:** server JSON first; browser storage mirrors successful server state only.
- **PROJECT KEY:** stable safe `projectId`; request, filename and record must agree; fixtures excluded.
- **STORAGE:** one atomic JSON file per project under the confined session-project directory.
- **ROUTES:** bounded POST save/read only; no list endpoint beyond read-all mode and no share/email/CRM/delivery route.
- **CRM LINKS:** nullable `hubspotDealId`, `hubspotContactId`, `hubspotCompanyId`; passive only.
- **MIGRATION:** explicit, idempotent, non-destructive; legacy backups retained.
- **ROLLBACK:** existing `projectPersistenceLive` selects memory or server authority without deleting files.
- **FAILURE ISOLATION:** malformed or failed persistence cannot block shell boot or alter Engine output.
- **LOCAL NOTE:** Governance has one protected untracked persistence-seam report; Program reviewed it but did not modify or stage it.
- **NEXT:** Governance implements GOV-003 exactly to the approved seam and returns a gated receipt.

## 2026-07-21 Selector PWS closeout reconciliation

- **PWS-001:** complete; deterministic readiness state-entry intent, provider-inert, normal/guarded gates 107/107.
- **PWS-002:** complete; Factory Ready derived fail-closed from existing evidence, normal/guarded gates 107/107.
- **PWS-005:** complete; lifecycle copy corrected only, normal/guarded gates 107/107.
- **FOCUSED COVERAGE:** 114/114, 128/128 and 112/112 respectively.
- **BOUNDARY:** no provider mutation, persistence, retrieval helper, Engine change or project-store implementation added.
- **LANE:** queue empty and worktree clean.
- **GUARD:** temporary module write permissions used for the three completed parcels are retracted; exact Selector guard restored.
- **NEXT:** no Selector parcel is authorised.

## 2026-07-22 Three-update reconciliation

- **DEPLOYMENT:** all ten managed services are healthy, including the Program secure tunnel.
- **LAB RECEIPT:** SEAM-G-C4 remains accepted after 305/305.
- **GOVERNANCE REALITY:** the report that Governance is only proceeding GOV-001 to GOV-002 is stale. The canonical Governance queue records GOV-001 through GOV-005 complete; the final fixed gate passed 181/181.
- **GOVERNANCE ORDER:** no expedited GOV-004 reorder is issued. GOV-004 is already complete under the earlier explicit Program reorder, project persistence and identity/permissions also closed, and CRM remains held.

## 2026-07-22 generation-chain admission state

- **SELECTOR:** PWS-001, PWS-002 and PWS-005 were already admitted, executed in strict order, gated, pushed and closed. That earlier batch is closed; the separate WALK-001V walkthrough parcel remains active under the later Selector state below. No recommission or second writer.
- **C5 ACCEPTED:** sealed-reference load-preflight implementation and lane-memory closeout are pushed; the fixed Lab gate is verified at 314/314.
- **LAB:** C5 and the SEED-LIB-001 lane-memory formatting correction are accepted complete at 314/314. The tracked tree is clean; the three protected local items remain unchanged and unstaged. No Lab parcel is ready; C6 remains blocked and is not released.
- **C5 INPUT:** exact ready job plan, reference binding and generation inspection plus one injected Lab-owned read-only resolver.
- **C5 ACTION:** derive identity only from matched contracts, call the resolver at most once, validate the loaded DTO through the existing generation-inspection path, then discard the DTO.
- **C5 OUTPUT:** immutable redacted ready-or-blocked load receipt only.
- **C5 BLOCKED:** generator/materialise invocation, LM-63 text, routes, persistence, files, delivery and readiness activation.
- **CHAIN AFTER C5:** C6 in-memory generation; C7 validated opaque Seam G artifact handoff; Governance retrieval activation. Each requires its own accepted predecessor and Program admission.
- **SEED LIBRARY:** SEED-LIB-001 is ruled and queued as two Patrick-nominated Selector-saved cases. Canonical acceptance must use the real approval/sealer, real inspection, C5, C6 and C7 chain; hand-made artifacts and evidence substitution are prohibited.
- **SEED SEQUENCE:** saved-case execution waits for WALK-007; Lab seed execution waits for separate C6/C7 admissions; Governance waits for C7.
- **CRM:** Patrick's HubSpot portal-scope prerequisite and business scope/lifecycle ruling are complete. No Patrick-held CRM prerequisite remains. Exact writer-scope definition is the sole substantive CRM precondition; separate Program admission remains the normal release control before live provider writes.
- **NEXT:** WALK-003 is accepted complete. WALK-004 legacy `TIERS` option/readiness deletion is the sole ready Selector parcel; no Lab or Governance action is ready and no seed artifact is generated.

## 2026-07-22 consolidated Selector walkthrough state

- **COMPLETED:** PWS-001, PWS-002 and PWS-005 remain closed; no duplicate commission.
- **WALK-001 ACCEPTED:** the corrected source passed every guard; materialisation succeeded; the previous active authority was archived before promotion; the promoted and materialised authorities align; the final Selector gate passed 108/108 and the lane is clean.
- **ACTIVE AUTHORITY VERIFIED:** Program's read-only probe confirms the promoted snapshot is present, readable, parseable, complete across all 15 required tables, newly fingerprinted, redacted, mutation-disabled and blocker-free.
- **WALK-002 SCOPE STOP ACCEPTED:** the lane is clean and green at 108/108; no production changed. Registration, saved-project validation, candidate defaults/fingerprints, accessory interpretation and downstream preview owners were outside the first boundary.
- **WALK-002R SECOND SCOPE STOP ACCEPTED:** the lane is clean and green at 108/108; no production or test implementation changed. The safe selected-result source projection is the exact twelfth owner because it still allowlists and emits `requested_length_basis`.
- **WALK-002R WRITE-GUARD STOP ACCEPTED:** no implementation remains changed; the lane is clean and green at 108/108. Baseline is 71 encoded assumptions across 32 test files; deleted 0, rewritten 0, residual 71. The live guard omits exactly the run-intake preview and accessory-placement preview owners.
- **WALK-002RG ACCEPTED:** the corrected activation is live. All nine exact module permissions are present once each, both broad module wildcards are absent, both WALK-002R additions pass live scope checks, Selector MCP is READY / MANAGED and the Selector lane is clean.
- **WALK-002R GOLDEN-WITNESS GUARD STOP ACCEPTED:** the lane is clean and green at 108/108; all partial edits were removed. The stop was correct when taken because the golden supported-machine witness was then outside every permitted test pattern.
- **WALK-002RGT ACCEPTED:** the exact golden witness permission is now live and its scope check passes. All nine exact module permissions and bounded test patterns remain present; broad module and broad test wildcards remain absent.
- **WALK-002R ACCEPTED:** corrected receipt baseline 75, deleted 71, rewritten 4, affected test files 34, residual 0. Production and tests are zero for `runLengthMode`, `lengthMode`, `requested_length_basis`, `requestedLengthBasis`, `missing-length-mode` and `length_mode`; focused coverage passes 115/115, the fixed gate passes 108/108, and the lane is pushed and clean.
- **WALK-003 ACCEPTED:** exact three-owner production boundary; baseline 37, deleted 0, rewritten 37, affected test files 8, residual 0. The mounted duplicate scaffold and fabricated fresh-load selections are gone, the source-backed current-selection rail remains, focused coverage passes 166/166, the fixed gate passes 108/108, and the lane is pushed and clean.
- **WALK-004 SCOPE STOP ACCEPTED:** all partial edits were restored; the fixed gate passes 108/108; the stop is pushed and the lane is clean. Fourteen focused readiness tests exposed `missing-readonly-engine-candidate-input-tier` from the Factory Approved Inputs summary.
- **SELECTOR READY:** WALK-004 remains the sole ready parcel under the existing worker. Exact production boundary is now `selectorReferenceOptionsService.js` plus `selectorFactoryApprovedInputsSummary.js`; remove manual Tier/`TIERS` option authority and committed Tier readiness/Stage 3B authority while preserving server-derived `SYSTEM_POLICY` Tier/profile meaning.
- **SELECTOR ORDER:** Length Mode deletion → duplicate scaffold unmount → legacy TIERS readiness deletion → internal timeline/principal test-mode deletion → donor auto-fill defaults → truthful readiness counters → selections-only action-lane and thermal acceptance.
- **AUTO-FILL:** each dropdown selects the first real NVB option in exact source order; `No manual constraint…` presentation rows are skipped. Auto-filled values are visibly LOOKED UP and distinct from manual constraints.
- **ACKNOWLEDGEMENT:** one `Accept all defaults` action creates the GIVEN acknowledgement for every flagged default, including inherited finishes. Unacknowledged defaults do not satisfy readiness; per-field acknowledgement is prohibited.
- **OWNERSHIP:** Governance owns identity, principal/role, timeline policy and visibility. Selector consumes bounded shell outcomes and deletes parallel test authority.
- **ENGINE BOUNDARY:** technical source-backed selections are authority; server revision acknowledgement and governance/project envelopes are not Engine prerequisites. No run is authorised until cleanup closes.
- **THERMAL ACCEPTANCE:** one bounded run must prove selected room plus one measured optic rise exactly once and varied-rise movement of lookup and verified lm/m.
- **FINISHES:** Patrick's ruling is closed and recorded in Governance. Inheritance or auto-fill alone does not satisfy Build Ready; WALK-005A restores the one-action donor acknowledgement.
- **DELETION-TEST RULE:** every WALK deletion parcel deletes or rewrites the tests encoding its removed assumption in the same parcel and reports baseline, deleted, rewritten, affected-file and residual counts. Residual is zero unless Program explicitly approves a historical non-runtime fixture.
- **TEST-AUDIT-001:** blocked behind WALK-007. One future read-only audit counts tests asserting deleted inputs, governance Engine preconditions, future/diagnostic prerequisites and identical-row fixture placeholder traps. Output is a kill-list only; no automatic deletion is authorised.
- **POLICY-MAP-001:** blocked behind WALK-007, TEST-AUDIT-001 and an accepted Selector reader contract that fixes the exact consumer-group header. Read-only mapping of all current SYSTEM_POLICY rows to `CONSUMED-VERIFIED`, `CONSUMED-STALE` or `NO CONSUMER YET`, with exact file/function evidence where applicable. No policy value consumption or implementation is authorised before the reader contract.
- **MGR-RESTART-001:** blocked future infrastructure repair. Reproduce the stale resident configuration layer, identify the exact manager/host/handshake fault, and make one selected-service restart reload the latest validated manifest and recycle the complete host without touching unrelated services.
- **PARALLELISM:** one Selector writer executes WALK-004 while one Governance writer may execute SS-1. The parcels are isolated; no Lab action is ready. MGR-RESTART-001 and both post-WALK audits remain blocked.
- **NEXT:** resume WALK-004 within the exact two-owner production boundary. Remove legacy manual Tier/`TIERS` options plus committed Tier candidate and Stage 3B authority; consume only the valid source-backed policy-summary tier, preserve the 15-table bridge and server/Engine result contract, recalculate coupled tests to residual zero, run the fixed gate, push and stop for Program review. WALK-005 through WALK-007 remain sequence-blocked, with WALK-005A inserted before WALK-006. WALK-008 is ruled and closed.

## 2026-07-24 Sales Signals state

- **REGISTERED:** SALES SIGNALS (MODULE 06) is registered in Governance from brief SALES_SIGNALS r0.4 plus the accepted owner response.
- **PORTAL PREREQUISITE:** satisfied by the live read-only private app; separate CRM lane remains deferred until load evidence exists.
- **SS-1G ACCEPTED:** the three exact Governance guard additions are live once each; existing permissions remain; broad module/test wildcards are absent; all three no-change scope probes pass; the complete Governance MCP host was recycled through the manager and the lane is clean.
- **SS-1 READY:** sole Governance parcel under one writer. Schema document plus deterministic keyword classification harness/correction corpus only, using manually supplied redacted alert text.
- **PROHIBITED:** mailbox automation, EstimateOne API, live HubSpot writes, Selector surface, shell registration, persistence, retrieval and delivery.
- **INFRASTRUCTURE HELD:** mailbox read-only extraction, Lusha/credit secrets, and HubSpot Research pipeline/Leads checks require separate explicit rulings.
- **SEAM:** Module 06 shell registration waits for Selector seam work; Selector boundary is schema-document only; single-write-path rules unchanged.

## 2026-07-22 HubSpot and CRM ruling state

- **PRIVATE APP EXECUTED:** Patrick created `ControlsStack (Read Only)` with exactly `crm.objects.contacts.read`, `crm.objects.companies.read` and `crm.objects.deals.read`.
- **SECRET SAFETY:** Patrick stored the token in the local secrets store; no token value belongs in repository memory, chat, logs, tests or receipts.
- **WRITE HOLD:** `writePolicy` remains disabled. No writer credential, provider mutation or live deal sync is authorised.
- **LEGACY AUTH:** the existing OAuth public app remains untouched and in service until a separately admitted cutover parcel retires it.
- **OWNERSHIP:** HubSpot owns contacts, companies, deals and price. ControlStack owns engineering state and build detail and must not compute or display price.
- **DEAL IDENTITY:** one HubSpot deal per ControlStack envelope, identified by `controlstack_project_key` plus `controlstack_job_ref`.
- **TRIGGER:** provider intent occurs on genuine readiness-state entry; it is not a module-open, render/hydrate or Engine-run side effect.
- **LEADS:** leads are deals in a separate leads pipeline.
- **STORAGE:** ControlStack remains local-first for engineering state; CRM reads are cached and writes are best-effort, idempotent and replayable.
- **REMAINING CRM PRECONDITION:** exact writer-scope definition only. A separate Program admission remains the normal release control before implementation.
- **DEFERRED — REPORTED REGISTRY STATE:** migrate from the private app to HubSpot Service Keys at cutover as an expected token swap with no ControlStack code change. Patrick reports this PARKED decision and the RULED CRM boundary are already recorded in the project-shell decision registry.

## Standing Program response rule

Any Program response that changes a ruling, authorisation or queue state must end with `ROUTING`, list every affected lane, and either provide the full paste-ready message, state `<lane>: no action`, assign one plain-English Patrick action, or assign one Advisor infrastructure action. Unrouted authorisations remain stalled. When nothing moves, state `ROUTING: nothing moves`.
