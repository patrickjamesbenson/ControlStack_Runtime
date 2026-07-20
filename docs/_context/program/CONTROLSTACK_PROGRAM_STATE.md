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
