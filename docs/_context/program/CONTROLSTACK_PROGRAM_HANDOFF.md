# ControlStack Program Handoff

**Purpose:** Self-contained replacement-orchestrator briefing for Program & Integrate.  
**State date:** 2026-07-17, Australia/Sydney.  
**Read first:** `CONTROLSTACK_PROGRAM_STATE.md`, `CONTROLSTACK_LANE_REGISTRY.md`, `CONTROLSTACK_SEAM_CONTRACTS.md`, `CONTROLSTACK_INTEGRATION_QUEUE.md`, `CONTROLSTACK_DECISION_LOG.md`, and `CONTROLSTACK_ORCHESTRATION_CONTRACT.md` in this directory.

## 1. Evidence language

- **VERIFIED** — directly observed in this Program worktree or connected CS Integrate app.
- **REPORTED** — supplied as accepted coordination input but not independently inspected from the relevant lane.
- **INFERRED** — reasoned conclusion based on evidence.
- **UNKNOWN** — unresolved; must not be presented as current fact.

Repository evidence overrides historical chat claims. A lane's fresh repository handoff may supersede older reported information after Program verifies branch, commit, and gate evidence.

## 2. Program identity

| Item | Current value | Evidence |
|---|---|---|
| App/server | `ControlStack Program and Integrate Lane` | VERIFIED by `repo_info` |
| User-facing secure app | `CS Integrate` | REPORTED accepted environment |
| Lane | `program-integrate` | VERIFIED |
| Root | `C:\ControlStack_Worktrees\program-integrate` | VERIFIED |
| Branch | `lane/program-integrate` | VERIFIED |
| HEAD at bootstrap start | `08df070890300058353cc621c1383f16492063f1` | VERIFIED |
| MCP | `127.0.0.1:8022/mcp` | VERIFIED |
| Gate | `program-integrate` | VERIFIED |
| Starting Git state | clean; no staged, modified, untracked, or deleted paths | VERIFIED |
| Pre-bootstrap accepted gate | 18 passed, 0 failed | REPORTED |

## 3. Verified capability and safety boundary

The connected app reports:

- writes enabled within `C:\ControlStack_Worktrees\program-integrate`;
- explicit Git staging enabled within that worktree;
- commit enabled through a gated path;
- push enabled through a gated path;
- allowed gate limited to `program-integrate`;
- arbitrary shell execution disabled;
- deletion disabled;
- movement disabled;
- cross-root copy disabled;
- no active donor/reference root.

These controls are **VERIFIED**. Exact external filesystem ACLs are **UNKNOWN**, but the app does not expose mutation of main, another lane, or a donor.

## 4. Original objective

### Business objective

Replace fragile chat-only orchestration memory with durable, version-controlled Program documentation so a fresh orchestrator can continue safely without reconstructing the project from prior conversations. **VERIFIED authorised task.**

### Technical objective

Establish seven canonical Program documents under `docs/_context/program/`, while changing no feature code, then stage exactly those files, run the `program-integrate` gate, commit with `docs(program): establish durable orchestration memory`, and push only `lane/program-integrate` through the gated path. **VERIFIED authorised task.**

### Acceptance definition

The parcel is accepted only when:

1. Program identity/capabilities are verified.
2. Existing docs are inspected and no competing canonical files are created.
3. The seven named files exist.
4. No feature file changes occur.
5. Only those seven files are staged.
6. The `program-integrate` gate is green.
7. Gated commit and push succeed on `lane/program-integrate`.
8. Final Git state is reported exactly.

## 5. Repository inspection findings

- Before this parcel, `docs/` contained `docs/ies-report-card-generator.md` and `docs/donor-reference/selector/DONOR_TRACE_RULES.md`; no equivalent Program context or handoff files existed. **VERIFIED.**
- The repository package is `controlstack-runtime` `0.1.0`, private ESM, with `npm test` invoking `node --test tests/*.test.js`. **VERIFIED from `package.json`.**
- The repository includes a workspace shell, runtime server, packages, tools, scripts, and a large Node test suite. **VERIFIED.**
- Recent shared history through HEAD `08df070…` includes Selector and runtime fixes, notably wildcard Selector system applicability, reference snapshot caching, direct Control/Protocol authority intersection, and cold-boot source arbitration. **VERIFIED commit subjects only.**
- The detailed behaviour and current live runtime state were not revalidated in this documentation parcel. **UNKNOWN.**

## 6. Program architecture and authority boundaries

### Program-owned documents

- `CONTROLSTACK_PROGRAM_STATE.md` — current program identity, accepted environment, milestone, risks, and acceptance state.
- `CONTROLSTACK_LANE_REGISTRY.md` — canonical lane identity tuples and restrictions.
- `CONTROLSTACK_SEAM_CONTRACTS.md` — producer/consumer contracts and held seams.
- `CONTROLSTACK_INTEGRATION_QUEUE.md` — ordered cross-lane and Program acceptance work.
- `CONTROLSTACK_DECISION_LOG.md` — append-oriented program decisions.
- `CONTROLSTACK_ORCHESTRATION_CONTRACT.md` — mandatory orchestrator/worker operating rules.
- `CONTROLSTACK_PROGRAM_HANDOFF.md` — this replacement-orchestrator briefing.

### Lane authority

- Selector & Engine owns its lane-local implementation and lane memory in `C:\ControlStack_Worktrees\selector-engine`. **REPORTED.**
- Lab & IES owns its lane-local implementation and lane memory in `C:\ControlStack_Worktrees\code-pilot-lab`; `C:\ControlStack_Lab` is donor-readonly. **REPORTED.**
- Program & Integrate owns Program memory and gated integration acceptance in the verified Program worktree. **VERIFIED current worktree / REPORTED sole-path policy.**
- Main/release promotion is outside the current app's evidenced capability. The procedure is **UNKNOWN** and remains queued.

### Key seams

1. Selector intent to Engine input.
2. Engine selected-result/run-table output.
3. Engine output to Lab & IES.
4. Lab evidence to Program acceptance.
5. Lane parcel to Program integration.
6. Program integration to main/promotion.
7. Reserved downstream-artifacts tunnel.
8. Secure tunnel/service restart operational seam.

See `CONTROLSTACK_SEAM_CONTRACTS.md` for requirements and activation conditions.

## 7. Accepted lane environment

### Selector & Engine — REPORTED unless stated otherwise

- root `C:\ControlStack_Worktrees\selector-engine`;
- branch `lane/selector-engine`;
- MCP `8000`;
- runtime `8788`;
- secure app `CS Selector & Engine Secure`;
- gate `selector-engine`;
- latest accepted gate `100 passed, 0 failed`;
- accepted base `08df070890300058353cc621c1383f16492063f1`.

The accepted base matches Program's bootstrap-start HEAD by hash comparison. **VERIFIED comparison.** Current Selector HEAD, dirty state, and live runtime are **UNKNOWN** to CS Integrate.

### Lab & IES — REPORTED unless stated otherwise

- root `C:\ControlStack_Worktrees\code-pilot-lab`;
- branch `lane/code-pilot-lab`;
- MCP `8021`;
- specification/demo `8899`;
- secure app `CS Lab & IES Secure v2`;
- gate `lab-ies`;
- donor `C:\ControlStack_Lab` read-only;
- Selector leaks removed;
- existing modified and untracked IES work deliberately preserved;
- bounded gate accepted green.

Exact Lab HEAD, pass count, dirty paths, and removed leak paths are **UNKNOWN** to this app.

### Program & Integrate

- root, branch, MCP, gate, starting HEAD, and starting clean state are **VERIFIED** as listed above.

## 8. Completed work in this parcel

At handoff authoring time, the following documentation files have been created in the Program worktree:

- `docs/_context/program/CONTROLSTACK_PROGRAM_STATE.md`
- `docs/_context/program/CONTROLSTACK_LANE_REGISTRY.md`
- `docs/_context/program/CONTROLSTACK_SEAM_CONTRACTS.md`
- `docs/_context/program/CONTROLSTACK_INTEGRATION_QUEUE.md`
- `docs/_context/program/CONTROLSTACK_DECISION_LOG.md`
- `docs/_context/program/CONTROLSTACK_ORCHESTRATION_CONTRACT.md`
- `docs/_context/program/CONTROLSTACK_PROGRAM_HANDOFF.md`

Their creation and exact scoped staging are **VERIFIED** after repository listing and Git status. The `program-integrate` gate is **VERIFIED GREEN: 18 passed, 0 failed**. Commit, push, and final Git status must be taken from the connected-app completion receipt and the commit containing this file.

No feature file was authorised or intentionally modified. **VERIFIED task boundary; final status must confirm.**

## 9. Current work and Git inventory

### Starting inventory

- staged: none;
- modified: none;
- untracked: none;
- deleted: none.

**VERIFIED at bootstrap start.**

### Documentation parcel inventory

All current intended changes are the seven new Program documents listed above. Before staging, Git may summarise them as the untracked parent directory `docs/_context/`; the exact file list must be verified by directory listing and explicit staging.

### Feature inventory

No feature path belongs to this parcel. Any feature change appearing in status or staged diff blocks commit until explained and removed from the staged set without discarding the working-tree content.

## 10. Decisions now in force

The decision log records:

- repository context is authoritative;
- one writer per worktree;
- Program is the sole gated integration path;
- explicit staging and gated commit/push;
- no arbitrary shell, deletion, movement, or cross-root copy;
- dirty worktrees are preserved and classified;
- downstream-artifacts remains held;
- secure tunnel restart automation is operational hardening;
- the seven-file Program memory structure is canonical;
- connected-app evidence controls lane identity.

## 11. Mid-task Selector instruction and wrong-app handling

During this Program bootstrap, a new instruction asserted that the connected app was the Selector app and authorised creation of six Selector lane-memory files in `C:\ControlStack_Worktrees\selector-engine`.

Current `repo_info` had already **VERIFIED** that the actual connected app is Program & Integrate at `C:\ControlStack_Worktrees\program-integrate`, branch `lane/program-integrate`, MCP `8022`. Therefore:

- no Selector worktree was accessed;
- no Selector lane file was written;
- no retired `C:\ControlStack_Runtime` or `main` access occurred;
- the instruction is retained as coordination input for a future worker using the correct Selector app.

This is the required wrong-app outcome under the orchestration contract.

## 12. Integration queue and exact next actions

### Historical next action after the original documentation parcel — SUPERSEDED 2026-07-17

Use the correct connected Selector app to execute a fresh Selector lane-memory bootstrap. Do not execute it through CS Integrate.

### Exact first worker commission

> Use only the connected ControlStack Selector and Engine Lane app. Verify with `repo_info`, `repo_git_status`, and `repo_git_recent` that the lane is `selector-engine`, root is `C:\ControlStack_Worktrees\selector-engine`, branch is `lane/selector-engine`, MCP is `8000`, runtime is `8788`, gate is `selector-engine`, and accepted base is `08df070890300058353cc621c1383f16492063f1`. Do not access or modify `C:\ControlStack_Runtime`, `main`, Program, Lab, or another worktree. Reconcile recovered handoff claims against current repository evidence. Inspect existing canonical context documents and create or update exactly: `docs/_context/lanes/selector-engine/LANE_CHARTER.md`, `LANE_STATE.md`, `WORK_QUEUE.md`, `DECISION_LOG.md`, `EVIDENCE_INDEX.md`, and `SESSION_HANDOFF.md`. Record historical Control Protocol work as completed and durable at commit `08df070890300058353cc621c1383f16492063f1` only where current repository evidence supports that conclusion; mark stale historical unknowns superseded only when current evidence resolves them. Do not modify feature code. Stage exactly those six documentation files, run the `selector-engine` gate, commit through the gated path with `docs(selector): establish durable lane memory`, push only `lane/selector-engine`, and return starting/final Git state, exact files, gate counts, commit, push result, and confirmation no feature files changed. Stop if `repo_info` does not match.

### Following action

Commission the equivalent Lab lane-memory bootstrap using only the correct Lab app, with strict preservation of intentional modified/untracked IES work and exact proof that removed Selector leak paths remain absent.

### Then

Program reconciles fresh lane heads against Program HEAD and establishes an evidence-backed integration order. Do not activate downstream artifacts and do not begin secure tunnel restart feature work.

## 12A. Current operational handoff — Deployment v2

This section supersedes the historical lane-memory sequence above as the immediate operational action.

Deployment v2 is derived from the 2026-07-17 host inventory and manages exactly eight logon tasks: Selector MCP/runtime/tunnel, Lab MCP/specification/tunnel, and Program MCP/tunnel. The old ngrok/router manager is backed up and left untouched; unknown/logo services and downstream artifacts are outside the parcel.

Repository implementation:

- `scripts/CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs`
- `scripts/deployment-v2/controlstack-services.v2.json`
- `scripts/deployment-v2/controlstack_service_host.mjs`
- `scripts/deployment-v2/controlstack_lane_manager.mjs`
- `scripts/deployment-v2/CONTROLSTACK MANAGER.bat`
- `tests/controlstackDeploymentV2.test.js`
- `docs/_context/program/CONTROLSTACK_DEPLOYMENT_V2_RUNBOOK.md`

Immediate next action: copy one fresh OpenAI runtime API key with Tunnels Read + Use, run the bounded installer, restart Windows once, and use Service Manager option 5 to verify all eight services. No legacy cleanup is authorised before that green receipt.

## 13. Known defects, blockers, and risks

- Current Selector live payload state is UNKNOWN to Program. Historical Control/Protocol defects and recent fixes require fresh Selector evidence.
- Current Lab dirty inventory and exact accepted commit are UNKNOWN.
- The Engine output contract has not been declared stable in Program memory.
- Main promotion procedure is UNKNOWN and not authorised by this app.
- Deployment v2 source is implemented and self-tested; Windows task installation and post-reboot eight-service verification remain pending.
- Program branch ahead/behind counts were not numerically returned by the status tool. UNKNOWN.
- A worker following pasted identity instead of `repo_info` could write documentation into the wrong lane; the wrong-app protocol now explicitly blocks this.

## 14. Prohibitions for the replacement orchestrator

- Do not use chat as current truth without repository verification.
- Do not write feature code while completing memory or integration documentation.
- Do not access or modify retired `C:\ControlStack_Runtime` or `main` based on historical instructions.
- Do not write Selector or Lab files from CS Integrate.
- Do not clean, reset, delete, move, or stage unrelated dirty work.
- Do not activate `downstream-artifacts` before Engine output stability approval.
- Do not combine secure tunnel restart hardening with feature work.
- Do not accept a lane parcel without exact commit and named gate evidence.

## 15. Completion receipt fields

The final response for this bootstrap must state:

- capability verification;
- starting Git state;
- exact seven documents created;
- exact staged set;
- `program-integrate` gate result and counts;
- commit hash and message;
- push result and branch;
- final Git state;
- confirmation that no feature files were changed;
- confirmation that the Selector interruption was not executed through the wrong app.

The commit containing this handoff is the durable repository receipt. Tool-returned gate, commit, push, and final status details are the execution receipt.

## 2026-07-18 replacement-orchestrator start point

This section supersedes earlier pending deployment and lane-memory instructions.

### Accepted current evidence

- All eight Deployment v2 services are READY / MANAGED.
- Selector memory: `678cf83c9f97bfcdc397b574c4eab08b306656ee`, pushed, gate 100/100, clean.
- Lab memory: `1b154c482978a9c77a9ea5325cd103bfe40b14ed`, pushed, gate 147/147; 10 modified and 66 untracked IES paths intentionally preserved with zero staged/deleted.
- Program pre-update head: `2e72aa80d39507ff7aa530d3fa8f8ed0e5b9cb0a`, pushed, gate 26/26, clean.

### Exact first Program action

Read the current lane handoffs at:

- Selector: `docs/selector/_context/SESSION_HANDOFF.md` on `lane/selector-engine`.
- Lab: `docs/_context/lanes/lab-ies/SESSION_HANDOFF.md` on `lane/code-pilot-lab`.

Reconcile their accepted heads against Program history, record seam dependencies and the safe integration order, and update Program state/queue. Do not begin feature work, write another worktree, merge to `main`, or activate downstream artifacts.

### Orchestrator rule

Patrick supplies objectives and accepts outcomes. He is not required to reconstruct state, paste old handoffs, select files, or approve code line by line. The repository handoffs, lane scopes, named gates, and gated Git paths are the control system.

## 2026-07-18 first Program action completion

### Completed action

Program reconciled the accepted lane-memory heads against the history visible in `lane/program-integrate`, recorded the seam dependency chain, and established the safe integration order. This was a documentation and integration-planning parcel only.

### Evidence and limitation

- Program reconciliation start: `eaa6d93f73163150028b361c16a2f194b687b68a`, clean.
- Selector accepted memory head: `678cf83c9f97bfcdc397b574c4eab08b306656ee`, gate 100/100, clean.
- Lab accepted memory head: `1b154c482978a9c77a9ea5325cd103bfe40b14ed`, gate 147/147, with 10 modified and 66 untracked IES paths preserved outside the accepted commit.
- The Program app cannot inspect another worktree's current `SESSION_HANDOFF.md` or calculate cross-branch ancestry. Those details remain **UNKNOWN** here; no merge or cherry-pick range was invented.
- The accepted Program receipts are sufficient to classify both lane heads as durable evidence anchors, not feature integration parcels.

### Safe order now in force

1. Selector owns the next bounded producer parcel: single-slice E2E closeout and exact Seam A/B Engine output evidence.
2. Program accepts that producer parcel first and records the accepted schema/version.
3. Independent Lab IES checkpoints may continue lane-locally, but any Seam C consumer adaptation waits for the accepted producer contract.
4. Lab then supplies a bounded consumer compatibility parcel and preserved-dirt evidence.
5. Program accepts the Lab parcel second.
6. Downstream artifacts remain held; no main promotion is authorised.

### Exact next Program action

Commission the Selector producer closeout through the correct Selector app using its committed handoff. Program must not implement the feature, write the Selector worktree, merge to `main`, or activate downstream artifacts. When the immutable Selector parcel returns, perform a separate Program producer-acceptance task.

## 2026-07-18 Lab P2 Checkpoint 1 stop receipt

### Accepted result

Lab correctly stopped with the valid four-file keyword-foundation parcel still staged. Focused tests passed 5/5 and `lab-ies` passed 147/147. No protected file was absorbed, reset, cleaned, restored, copied, moved, deleted, or staged. No commit or push occurred.

Current Lab classification:

- HEAD `1b154c482978a9c77a9ea5325cd103bfe40b14ed`;
- staged: exactly the four P2 Checkpoint 1 files;
- modified: 11 protected paths including `SESSION_HANDOFF.md`;
- untracked: 62 remaining paths;
- deleted: zero.

### Exact failing boundary

The deployed shared MCP `repo_green_commit_push` accepts the exact staged-path set and green gate, then rejects because unrelated modified or untracked paths exist. This contradicts the Program rule that protected dirty work remains unstaged while bounded parcels commit by exact index content.

Deployment v2 proves the live MCP executable is sourced from `C:\ControlStack_Worktrees\controlstack-tooling-v2`. The former executable-looking Program copy has now been resolved: `tools/controlstack-mcp/controlstack_mcp.py` is a fail-closed tombstone, while Program-only contract tests and evidence use `tools/controlstack-mcp/controlstack_mcp_program_contract_snapshot.py`, which also refuses direct server startup. Shared MCP changes remain owned exclusively by `lane/controlstack-tooling-v2`.

### Immediate next action

Use a correctly connected shared-tooling app for `C:\ControlStack_Worktrees\controlstack-tooling-v2`, branch `lane/controlstack-tooling-v2`. Implement and test the path-confined commit repair there, commit and push the tooling lane, restart the Lab MCP service, and verify the connector. Until that is complete, do not send Lab another feature commission and do not disturb its current staged parcel.

### Lab resume action after tooling activation

The Lab worker resumes the existing staged four-file parcel, verifies the cached diff, reruns `lab-ies`, commits with `lab: checkpoint canonical keyword foundation`, pushes `lane/code-pilot-lab`, and updates its durable handoff. Only then may the two-file `iesWorkingRecord` checkpoint be commissioned.

## 2026-07-19 promotion attempt and stale-copy closeout

This section supersedes the immediate tooling-repair action above.

### Current identity

- Program starting HEAD: `7cff9e8428e98c611a9d97d242502bebc9e157a3`.
- Root: `C:\ControlStack_Worktrees\program-integrate`.
- Branch: `lane/program-integrate`.
- Gate: `program-integrate`.
- Starting Git state: clean.

### Promotion intake

Current coordination evidence reports Lab commits `bda7d61`, `a2142952`, `8749bbe1`, and `d0577a9d` as gated, pushed, and awaiting promotion. The current Program app cannot resolve those commits from `lane/code-pilot-lab`, inspect `main`, create/update/merge a pull request, operate a dedicated integration worktree, or push `main`. The first promotion therefore stopped at the authorised capability boundary. The blocker owner is Program & Integrate tooling/connection authority, and the promotion path is not executable from this connection.

### Required promotion capability

Provide source-lane and `main` read access, exact candidate diff/ancestry, pull-request create/update/merge or dedicated integration-worktree operations, integrated-state gate execution, and guarded push-to-`main`. Do not substitute file copying, a feature commit on `lane/program-integrate`, force-push, or weakened branch/root guards.

### Program-local MCP resolution

The Program-only MCP seam implementation now lives at `tools/controlstack-mcp/controlstack_mcp_program_contract_snapshot.py`. It remains importable for contract tests but refuses direct server startup. The old `tools/controlstack-mcp/controlstack_mcp.py` path is a fail-closed tombstone naming the canonical shared-tooling authority. Dependent Program tests, the host adapter, and evidence runner use only the explicit snapshot path.

## 2026-07-19 LAB-017 seam decision

Lab reports LAB-016 complete and pushed with all checks green at 159/159 and a final protected state of zero staged, zero modified, 33 untracked, and zero deleted paths. The reusable worker prompt is also reported committed in Lab lane memory. Program accepts those as current coordination evidence but cannot inspect the Lab lane through this connection.

LAB-017 remains **HELD / NOT APPROVED** because Program memory contains no definition of the proposed seam change. Approval requires a Lab-generated immutable envelope naming the objective, producer and consumer, old/new contract, exact files in and out of scope, LAB-016 dependency, compatibility and rollback, focused tests, `lab-ies` gate, dirty-tree protections, and expected commit/handoff evidence.

No LAB-017 implementation is authorised. The Lab orchestrator supplies the missing envelope; Program then records the approve/decline decision. Patrick has no manual action.

## 2026-07-19 Selector Tier seam approval

Program has approved, with conditions, the Selector proposal to remove manually committed Tier from pre-Engine registration eligibility and candidate construction. Tier is now approved as a server-owned Engine/Lex consequence derived from source-backed inputs at execution, not as Selector input or manually committed project truth.

The Selector parcel must preserve every other required field, read-only/no-write behaviour, explicit Control selection, and current downstream Tier result semantics. It must reject Tier as client authority, avoid defaults and fabrication, produce a specific blocker when derivation is unavailable or ambiguous, update the contract fixtures and tests, pass `selector-engine`, and supply live or sealed registration/invocation evidence plus the immutable commit receipt.

No Lab code change is authorised. Lab & IES is treated as a potential compatibility consumer only if it reads the derived Tier result; any incompatibility or output-shape change requires a separate bounded decision and parcel. Selector may now proceed under the recorded Program decision. Patrick has no action.

## 2026-07-19 LAB-017 version-1 seam approval

Program has approved the committed LAB-017 version-1 envelope unchanged and authorised the Lab orchestrator to move the item from `blocked` to `ready`.

The approval is confined to the exact public interface and data shapes, exact two implementation files, named current consumers and accepted compatibility break, safe rollback sequence, and success/rejection/immutability/leak-prevention/boundary tests recorded in that immutable envelope. No other seam is admitted.

Program retains production serial allocation, resolver hosting, route-to-storage mapping, persistence, authentication, deployment, and endpoint ownership. The implementation must not cross those boundaries. Any change to the approved interface, data shape, consumers, ownership split, rollback, tests, file list, or seam count requires a new Program decision.

Lab must cite its exact envelope commit and this approval before commissioning one bounded worker, then return the implementation commit, focused and full gate evidence, exact staged-set proof, final Git inventory, push receipt, and updated handoff. Patrick has no action.

## 2026-07-19 LAB-017 completion intake

Lab reports LAB-017 complete under the approved version-1 envelope. Only the reference/resolver helper and dedicated test were committed; all focused, full, feature-commit, and documentation-closeout checks passed 169/169; both checkpoints were pushed only to the Lab lane; and final state is zero staged, one expected HEAD-marker edit, 32 protected untracked, and zero deleted paths.

Program records final LAB-017 acceptance as closed because the Lab handoff now contains the exact immutable envelope, feature and documentation closeout receipts, exact two implementation paths, exact staged-set proof, final classified Git state, push evidence, and green 169/169 gate. The receipt remains reported evidence because this Program app cannot independently resolve the Lab branch, but no acceptance item remains outstanding and no rework is commissioned.

This is lane-parcel acceptance, not promotion to `main`. Promotion remains subject to the separate Program promotion path and required integration capability.

The earlier LAB-018 hold is superseded by the consolidated seven-seam decision below. LAB-018 is seam-approved but remains subject to the same one-parcel-at-a-time sequencing as the other approved seams. Patrick has no action.

## 2026-07-20 consolidated seven-seam decision

Program has approved the immutable consolidated Lab envelope covering seven blocked seams. The six ordinary seams are approved unchanged. The governed reference-composition kernel is approved only with exactly two unique non-merged parents, order-significant provenance, exact matching photometric grids with no interpolation or resampling, and all allocation, authority, approval, and sealing outside the kernel.

The kernel must fail closed on duplicate or pre-composed parents, provenance loss or reordering, grid mismatch, or any attempt to cross the external governance boundary. It may validate and compose only; it does not gain production identity, authority, persistence, approval, sealing, resolver, route, endpoint, authentication, or deployment ownership.

This approval is consolidated only at the seam-decision level. Lab implementation remains one parcel at a time: only the next eligible parcel may move to `ready`, and every subsequent parcel remains sequence-blocked until the current parcel is committed, pushed, closed out, and safe. Each parcel returns its own immutable acceptance receipt. Patrick has no action.

## 2026-07-20 LAB-029 provenance publication seam approval

Program approves the committed `LAB-029_SEAM_ENVELOPE` version 1 unchanged.

Approval anchor:

- Lab checkpoint: `7b74ca49665007311f6dbb8cfdccc47be5472353`;
- queue item: `LAB-029-provenance-publication-surfaces`;
- reported `lab-ies`: 255/255;
- implementation state at approval: not started.

The exact authorised implementation files are:

- `packages/lab-kernel/ies-toolkit/provenance.html`;
- `packages/lab-kernel/ies-toolkit/provenance_explorer.html`;
- `packages/lab-kernel/ies-toolkit/luminaire_provenance.html`.

The view remains presentation-only. Governed mode consumes Program-supplied safe sealed-reference identity and host-free resolver-availability projections. Offline mode consumes committed safe fixture projections and must remain visibly labelled `OFFLINE DEMO — UNAPPROVED`. Emergency and EWIS assembly verification remain `null`.

Lab does not gain allocation, sealing, resolver origin/hosting/endpoints, route-to-storage, persistence, authentication, deployment, evidence acceptance, raw evidence/origin IES/source-body publication, private authority reconstruction, or emergency/EWIS verification ownership. Hard-coded hosts, raw-body traversal, local paths, fingerprint authority claims, fabricated seal chains, generated dates, and positive authority wording over fixtures remain prohibited.

LAB-029 may move from `blocked` to `ready` when it is next eligible under the existing sequential queue rule. Any change to the view model, ownership boundary, resolver semantics, publication states, null treatment, or three-file scope requires a new Program decision. The Lab completion return must include focused evidence, `lab-ies` green, exact staged-set proof, immutable feature and documentation receipts, final Git inventory, push evidence, and updated handoff.

## 2026-07-20 Lab canonical-keyword migration guard correction

Program approves one bounded test-only corrective parcel before LAB-033 resumes.

Exact authorised path:

- `tests/lab-kernel/iesKeywordMigration.test.js`

The correction may remove stale requirements for the retired editable `sysTa` ambient workflow and literal `canonicalKeywordRows(...)` helper shape. It must retain the exact ordered 16-keyword profile, rejection of `_AMBIENT_TA_C`, supplementary keywords and aliases, Main Bench consumption of the committed canonical contract, sealed-reference ownership and non-editability of `_INTERNAL_AMBIENT_TA_C`, and all generator, merge, summary, and project-builder vocabulary checks.

No production module, bench implementation, authority contract, sealed-reference schema, Selector, Runtime, Engine, or Program implementation change is authorised. The safe non-authoritative LAB-033 bench must not be weakened.

Exact next Lab action:

1. Make the one-file correction the sole ready item.
2. Run the full `lab-ies` gate and commit the test correction separately.
3. Commit the lane-documentation closeout separately.
4. Restore LAB-033 as the sole ready item and rerun its full gate.
5. Leave the final cross-cutting keyword guard until after LAB-033 is committed.

LAB-033 remains incomplete, unstaged, unpushed, and paused during this corrective parcel. Return the exact test commit, documentation commit, gate receipt, final Git inventory, and confirmation that LAB-033 was restored as the sole ready item without production changes.

## 2026-07-20 LAB-033/LAB-034 acceptance and LAB-035 Selector-contract approval

Program accepts LAB-033 and LAB-034 complete on verified Lab evidence: both feature and documentation closeouts are pushed, full `lab-ies` passes 255/255, and the protected inventory remains zero staged, one expected HEAD-marker edit, seven protected untracked items and zero deleted.

LAB-033 is the accepted non-authoritative, module-driven Main Lab Bench. LAB-034 is the accepted read-only compatibility inspector with duplicate approval, sealing, reference-building, symmetrisation and project-generation behaviour removed.

Program approves the immutable LAB-035 version-1 envelope at `1c422dec0cb4efb0777d61bebcf6cf4ee9a33a5f` unchanged.

Exact feature scope:

- `packages/lab-kernel/ies-toolkit/selector_stub.html`

The page is a contract viewer, not a Selector. It may validate and display only the approved reference identity projection, safe runtime handoff, bounded Selector factory-approved-input readiness projection, exact identity/hash binding, unresolved fields and false safety flags.

Governed mode consumes a supplied safe bundle and performs no lookup. Offline mode uses the committed embedded fixture and must display `OFFLINE CONTRACT DEMO — NOT SELECTOR ACCEPTANCE` persistently.

The page must remove file upload, arbitrary JSON intake, run-length and orientation controls, lumen/power scaling, recipe construction, option/default logic, generation, Engine invocation, persistence, routes and claims that readiness is acceptance or proof.

LAB-035 is now the sole ready Lab item. LAB-036 and later work remain sequence-blocked. Completion must return the exact one-file feature commit, a separate documentation closeout, full `lab-ies` green, final protected inventory and confirmation that no cross-lane authority moved.

## 2026-07-20 cross-lane thermal-chain handoff

The thermal chain has one owner per step:

1. Selector captures and passes `selectedRoomTaC` only.
2. Lab publishes the selected optic's evidence-bound `referenceRoomTaC`, absolute `referenceInternalTaC` and actual `opticThermalRiseTaC`. Legacy `optic_internal_delta_ta_c` maps to absolute internal temperature; legacy `optic_uplift_ta_c` maps to rise.
3. Engine alone derives `derivedInternalTaC = selectedRoomTaC + opticThermalRiseTaC`.
4. Under version 1, Engine uses that same value as `curveLookupTaC`, then performs the 25–65°C curve clamp/interpolation and returns verified lm/m.
5. Program validates identity, evidence binding and shape at the cross-lane adapter.

Binding examples are 25°C room + 10°C rise = 35°C lookup, and 35°C room + 10°C rise = 45°C lookup. The legacy value `optic_internal_delta_ta_c = 35` is the absolute internal temperature at the 25°C reference condition, not a rise. The actual rise is legacy `optic_uplift_ta_c = 10`.

Because current thermal values are identical across optic rows, acceptance must vary one fixture row's `optic_uplift_ta_c` and prove that both lookup temperature and lm/m move. Varying only the misleading absolute-internal field does not prove correct rise selection.

Lab's `_INTERNAL_AMBIENT_TA_C` remains the measured internal temperature during the authority test. It is not a user-specific operating value and is never overwritten by Runtime.

SEL-018 must be amended before implementation. It may not carry room ambient as lookup temperature and may not supply rise, derived internal, board temperature, curve lookup temperature or verified lm/m.

Acceptance also requires the legacy-name guard: `room_ta_c = 25`, `optic_internal_delta_ta_c = 35`, and `optic_uplift_ta_c = 10` must produce a 10°C rise and a 35°C lookup, never a 35°C rise and a 60°C lookup. Tests must prove no double count, reject contradictory/unbound evidence and compare Runtime with the approved data model rather than the donor implementation.

New cross-lane contracts must not expose `opticInternalDeltaTaC`. Program adapters use `referenceInternalTaC` and `opticThermalRiseTaC`. A separate data-model migration should rename the legacy source fields to `optic_reference_internal_ta_c` and `optic_thermal_rise_ta_c`.

## 2026-07-21 SEL-018 corrected implementation handoff

SEL-018 is now amended and ready for the Selector & Engine lane as a Selector-only parcel.

Authorised files:

- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `tests/selectorReadonlyEngineCandidateMapper.test.js`

Required behaviour:

- read the single committed, source-backed Ambient selection;
- parse its Celsius numeric value without clamping or combining it;
- emit `selectedRoomTaC` only;
- preserve all existing tier, run, target lm/m, CCT/CRI, optic and control mappings;
- fail closed when Ambient is missing, malformed, duplicated, uncommitted or not source-backed;
- keep Engine execution, Lab evidence lookup, persistence, generation, routes and writes absent.

Forbidden outputs include `referenceRoomTaC`, `referenceInternalTaC`, `opticThermalRiseTaC`, `opticInternalDeltaTaC`, `derivedInternalTaC`, `curveLookupTaC`, board temperature and verified lm/m.

Focused tests must cover 25°C and 35°C selections, missing and malformed Ambient, forbidden-field absence and preservation of the existing candidate shape. The old regression asserting that direct-only mapping does not require Ambient is superseded and must be rewritten, not retained.

The returned feature receipt must include the exact two-file diff, full `selector-engine` gate result, final clean status and confirmation that no broad Selector module file changed. A separate lane-context closeout may follow under the approved Selector lane context path.

## 2026-07-21 corrected Lab thermal semantics implementation handoff

Program approves the pushed Lab envelope `LAB-038_042_THERMAL_SEMANTICS_SEAM_ENVELOPE.md`, version 1, unchanged.

Lab may now execute five separate parcels in order. Only LAB-038 is initially ready; each later parcel becomes eligible only after its dependency and documentation closeout are pushed.

Required semantic result:

- reference room comes from legacy `room_ta_c`;
- absolute reference internal comes from misleading legacy `optic_internal_delta_ta_c`;
- optic thermal rise comes from legacy `optic_uplift_ta_c`;
- the measured triplet is exact after canonical decimal normalisation;
- varied-optic coverage changes the legacy uplift field and keeps the absolute internal value consistent;
- changing only the rise into a contradictory triplet fails closed;
- no output contract retains `opticInternalDeltaTaC`, `roomTaC` or `opticUpliftTaC`;
- Lab emits no derived internal temperature, lookup temperature, clamp, board temperature or verified lm/m.

LAB-040 must preserve the raw measured triplet and opaque evidence reference with `authorityState: null`; missing identity/evidence binding remains explicit. It must not treat a sealed optic identity as accepted thermal evidence.

Each parcel returns the exact approved files, its exact feature subject, a separate Lab documentation closeout, full `lab-ies` green and preserved protected inventory. The five-parcel Lab batch may run automatically under the standing worker. Final Engine admission remains a separate Program decision after accepted Selector and Program-bound evidence receipts.

### LAB-038 atomic transition amendment

The first resolver-only attempt demonstrated that the adapter imports the resolver schema constants and therefore rejects its own version-1 test fixtures as soon as the resolver advances. The full gate failed eight adapter tests at that boundary.

LAB-038 is amended to exactly four files: the resolver module/test and adapter module/test. The adapter must accept only corrected resolution version 2 and corrected optic keys while retaining its public projection version 1 and existing non-thermal output. It must not add thermal evidence, authority state, derived temperature, lookup temperature or Engine output. LAB-040 remains the later adapter-output upgrade.

Lab may apply this amendment immediately, rerun the full gate and checkpoint the four files under the unchanged LAB-038 feature subject.

### LAB-042 gate-included final guard amendment

LAB-038 through LAB-041 are complete. The originally approved new LAB-042 test path is not executed by the fixed Lab gate, so it cannot provide valid self-testing evidence.

LAB-042 is amended to exactly the existing gate-included keyword migration test file. The new thermal test file must not be created. All existing LAB-042 semantic and schema assertions remain required, the feature remains test-only, and no production, fixture or gate configuration change is authorised.

Lab may implement this final one-file guard immediately, run the full Lab gate, push the feature and close the corrected thermal batch separately.

## 2026-07-21 thermal completion handoff

The corrected Lab producer receipt is now accepted. LAB-038 through LAB-042 are complete, pushed and green at 262/262. The active Lab working projection is version 2 and exposes only the selected optic identity, measured reference room, absolute reference internal, measured rise, opaque evidence reference and `authorityState: null`.

### Immediate Selector action — SEL-018

SEL-018 remains the sole ready Selector parcel because the readable Runtime mapper still contains no `selectedRoomTaC`.

Use exactly:

- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `tests/selectorReadonlyEngineCandidateMapper.test.js`

Selector passes the single committed source-backed room temperature only and calculates nothing. It must reject missing, malformed, duplicate, uncommitted or non-source-backed Ambient and must not emit rise, derived temperature, lookup temperature, board temperature or verified lm/m.

The restarted Selector app is now bound to the isolated Selector worktree and branch, with a clean tree and the exact feature/test paths available. The live service still lacks the lane-document permission already present in the current Program manifest, so refresh the installed configuration and reconcile the queue before any SEL-018 feature edit. Main and its unfinished runtime-port work remain excluded.

### Next action after accepted SEL-018 — THERM-P1

Implement the separately approved Program thermal-evidence adapter in exactly:

- `packages/workspace-kernel/labThermalEvidenceProgramAdapter.js`
- `tests/labThermalEvidenceProgramAdapter.test.js`

The adapter binds the accepted Selector room/optic intent and Program source-backed optic identity to the exact Lab v2 measured evidence. It preserves `labAuthorityState: null`, emits `programValidationState: "accepted_for_engine_thermal_lookup"`, performs no thermal arithmetic and rejects all caller-supplied derived/output values.

### Next action after accepted THERM-P1 — THERM-E1

Implement Engine execution in exactly:

- `packages/workspace-kernel/runtimeThermalLumenExecution.js`
- `tests/runtimeThermalLumenExecution.test.js`

Engine applies the accepted optic rise exactly once, sets lookup temperature to the derived internal temperature and delegates to the existing runtime lumen-curve parse/interpolation contract. It rejects direct Lab input and caller-supplied derived or lookup temperatures.

The mandatory final test uses two optic-bound bundles with different rises but the same selected room, current and curve. Both lookup temperature and verified lm/m must move. This test must fail for any hardcoded 35°C or 10°C behaviour.

The unfinished runtime-port work in main, source-model renames, routes, persistence, donor changes, existing curve-parser changes, downstream artifacts and main promotion remain outside these parcels.

## 2026-07-21 outside-governance / inside-Engine boundary handoff

### Binding sentence

The Engine's caller-required and eligibility contract is the engineering selection set only. Human identity, customer/company, project/deal/quote, ownership, timeline, entitlement, handoff, save, registration, active revision, persistence and client-supplied Tier remain outside and may not block calculation.

### Original-brief reconciliation

The original canonical flow did place `customer`, `job`, `project` and `metadata` in the broad Run Payload, so the literal statement that no transport wrapper may contain anything else is too strong. The same brief says those fields exist for traceability and make no engineering decisions. The Platform Spine keeps live identity/project context in Workspace, the candidate API uses engineering choices, and donor `run_engine` reads no customer, project, owner or registration field.

Treat the outer envelope as optional traceability. Strip or quarantine it before the computational kernel. An identical selection set must have identical Engine eligibility and result regardless of whether governance metadata is absent or changed.

### Selection set

The caller may provide selected/requested product/system/optic, lighting, room/environment, control/compliance, Runs/lengths/quantities, accessories and build preferences. The kitchen resolves authoritative product rows, policy, Lab evidence, curves, candidates, scoring and verified output internally.

A selected optic/component key is an engineering selection, not human/project identity.

### Superseded gates

Delete or bypass from Engine eligibility any requirement for:

- signed-in user or customer/company identity;
- selected project/deal/quote or owner;
- timeline, handoff or entitlement state;
- saved envelope, registration eligibility or active revision;
- client/manual Tier.

Do not repair these gates. Optional persistence and result association remain outside-system functions.

### Active sequence

1. Reconcile the Selector lane to this boundary.
2. Implement SEL-018 as selected room temperature only; no registration or Engine proof is part of the parcel.
3. Implement THERM-P1 as internal technical optic/evidence binding, with no human/project/registration input.
4. Implement THERM-E1 with one-time rise application and the mandatory varied-optic change in lookup temperature and verified lm/m.
5. Audit that governance metadata is neither required nor scored by the computational kernel.

SEL-019's former project-save/register/active-revision prerequisite is superseded. SEL-002 and SEL-003 cannot block Engine computation. Main and its unfinished runtime-port work remain untouched.

## 2026-07-21 selections-only thermal chain completion handoff

The Selector lane has completed and pushed queue reconciliation, SEL-018, THERM-P1 and THERM-E1 in the required order. The lane ended clean.

### Accepted results

- Selector emits `selectedRoomTaC` only.
- Program binds selected optic identity to exact Lab version-2 evidence without thermal arithmetic.
- Engine applies the measured optic rise once and uses the result as curve lookup temperature.
- The existing lumen-curve parser remains unchanged.
- Different optic rises change both lookup temperature and verified lm/m.
- Different traceability envelopes over identical engineering selections produce an identical complete Engine response.

### Governance receipt

Project registration, active revision and selected-project eligibility are outside-governance facilities. THERM-E1 does not import or call them. The module imports only the Program thermal-evidence adapter and the curve parser, and negative checks found no renamed equivalent gate.

This is a computational bypass, not deletion of optional persistence capability and not a relabelled block. Governance may associate or store results after calculation but cannot influence warnings, defaults, candidates, scores, validation or output.

### Evidence

Focused Engine coverage passed 120/120. The normal Selector closeout passed 107/107. Program final acceptance is recorded separately. No route, persistence, RuntimeData, donor, IES, output-generation, curve-parser or main change occurred.

The thermal chain now requires no further Selector implementation or live registration proof. Optional persistence, downstream artifacts and main promotion remain separate future decisions.

## 2026-07-21 selected-result stability handoff

Program has accepted the newer SEL-007 contract candidate and has **not** declared Engine output stable. The active candidate separates the selections-only request, complete-or-blocked response and RunTable row into `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`.

The candidate records the current truth: thermal execution is one bounded component, RunTable output remains diagnostic-only, persistence-coupled legacy rows are outside Engine eligibility, and the legacy row identifiers collide across incompatible field sets.

The concurrently completed selected-result producer is accepted as an internal non-stable component. It may be imported by ENG-OUT-P1 but is not the public contract and activates no consumer.

ENG-OUT-P1 remains the sole ready parcel. Commission the isolated Selector & Engine lane to create only:

- `packages/workspace-kernel/runtimeEngineOutputContractV1.js`
- `tests/runtimeEngineOutputContractV1.test.js`

Implement the three exact non-persistent contracts with deterministic complete, fail-closed blocked, zero-valued and replay-identical fixtures. Do not invoke Engine, reuse the colliding legacy row schema, modify existing scaffolds, persist, add routes, activate IES/downstream readiness, mutate RuntimeData, use donor code or touch main.

Run focused coverage plus `selector-engine`, commit as `feat(runtime): implement Engine output contract v1`, push only the Selector lane and return a complete receipt. Consumer compatibility and final stability declaration remain separate Program parcels. Seam G and main promotion stay held.

## 2026-07-21 producer accepted — Lab compatibility commission

Program accepts ENG-OUT-P1. Final focused coverage passed 116/116, the normal closeout passed 107/107 and the Selector tree is clean.

The public contract now validates the exact selections-only request draft, rejects governance fields and caller Tier/derived output, derives evidence fingerprints internally, emits deterministic complete or fail-closed blocked output, preserves zero values and produces one exact non-persistent row shape. Different traceability envelopes do not change or appear in output.

ENG-STAB-C1 is admitted for Lab & IES with exactly two new files:

- `packages/lab-kernel/ies-toolkit/engineOutputV1CompatibilityAdapter.js`
- `tests/lab-kernel/engineOutputV1CompatibilityAdapter.test.js`

The adapter must consume plain public JSON fixtures only. It must not import Selector or Workspace implementation modules. It may emit only an immutable read-only complete-or-blocked compatibility projection containing public schema/version, technical fingerprints, safe selected-result thermal/provenance values, public RunTable rows, blockers/warnings and no-write safety state.

Complete, blocked, valid-zero, unknown-version, unsafe/over-rich, contradictory and governance-inert fixtures are required. No IES generation, approval/authority state, reference mutation, persistence, route, downstream write/readiness, raw payload or private path is permitted.

The Lab lane currently has protected unrelated modified and untracked work and no ready item. Do not clean, stage or absorb it. The Lab orchestrator must first reconcile ENG-STAB-C1 as the sole ready parcel in a separate documentation checkpoint. Program has not started Lab implementation. Stability, Seam G and main remain held.

## 2026-07-21 Seam B stable handoff

Program accepts the completed Lab consumer receipt and declares the public Engine output contract version 1 stable.

All five mandatory conditions are satisfied: exact versioned schemas; green producer evidence; import-free green consumer compatibility evidence; deterministic sealed complete, blocked, valid-zero, replay/governance and thermal-identity fixtures; and an exact-version fail-closed rollback rule requiring no data migration or stored-record repair.

The stable boundary is limited to the selections-only request, complete-or-blocked output, exact non-persistent RunTable row and read-only Lab compatibility projection. The old diagnostic RunTable scaffold remains diagnostic-only. Persistence-coupled legacy rows and the colliding legacy row schema remain excluded.

No route, persistence, IES generation, authority change, downstream write/readiness or main promotion is authorised. Seam G remains reserved and inactive. The Program queue is empty; any downstream implementation requires a new exact parcel and approval.

## 2026-07-21 Seam G producer commission handoff

Program has opened one narrow read-only Seam G candidate without activating the tunnel.

Commission the isolated Selector & Engine lane for SEAM-G-P1 with exactly two new files:

- `packages/workspace-kernel/runtimeIesArtifactRequestContractV1.js`
- `tests/runtimeIesArtifactRequestContractV1.test.js`

The module consumes exact stable public Engine output JSON plus an exact `ies_lm63_reference_build` intent. It may accept an optional traceability envelope only to prove that user/project/owner/timeline/registration differences are quarantined and output-inert.

It emits one deeply immutable complete-or-blocked `controlstack.downstream.ies-artifact-request.v1` envelope with deterministic request, replay and audit identities; stable technical fingerprints; safe selected-result provenance/thermal values; exact public rows; canonical blockers/warnings; and explicit no-write/no-generation safety flags.

Prove complete, blocked, valid-zero, replay-identical, governance-independent and technical-identity-moving fixtures. Unknown versions, extra authority, raw/private/unsafe content, contradictory identities and legacy rows fail closed. Blocked Engine output cannot become artifact-ready.

Do not add a button, route, POST endpoint, file/export/email/download path, persistence, IES generation, authority state, reference mutation, Engine invocation, donor use, Lab import, main or runtime-port change.

After a green Selector receipt, return to Program. SEAM-G-C1 and SEAM-G-A1 remain blocked.

## 2026-07-21 SEAM-G-P1 accepted — Lab compatibility commission

Program accepts the Selector producer receipt. The exact two-file request contract passed 115/115, normal closeout passed 107/107 and the Selector tree is clean.

Commission Lab & IES for SEAM-G-C1 with exactly two new files:

- `packages/lab-kernel/ies-toolkit/iesArtifactRequestV1CompatibilityAdapter.js`
- `tests/lab-kernel/iesArtifactRequestV1CompatibilityAdapter.test.js`

The adapter must be import-free and consume plain public request JSON only. It emits one deeply immutable ready-or-blocked compatibility projection containing only public schema/version/state, artifact intent, request/replay/audit identity, stable Engine identities, safe selected-result provenance/thermal values, exact public rows, blockers/warnings and explicit no-write/no-generation flags.

Prove ready, blocked, valid-zero, replay-identical and governance-absent cases. Reject unknown versions, extra/nested authority, private/raw content, contradictory request/audit/Engine/row/thermal identity, unsafe flags, blocked-to-ready promotion and legacy rows.

Preserve the Lab lane's expected branch marker and three protected untracked local items. Do not import Selector/Workspace/Runtime implementation, generate IES, allocate/approve/seal authority, accept evidence, mutate references, add routes, persist, write files/network/email or activate readiness.

Return the consumer receipt to Program. SEAM-G-A1 and actual generation remain blocked.

## 2026-07-21 Seam G read-only tunnel active handoff

Program accepts the completed Lab consumer receipt at 276/276 and activates Seam G version 1 as a read-only contract/validation tunnel only.

The active path is stable Engine output to deterministic IES artifact request to import-free Lab compatibility projection. Producer and consumer are exact-version, replay-identical, governance-inert, fail-closed, read-only and non-persistent.

This activation adds no live route and invokes no generator. It carries no raw IES, photometry, candela, private path, caller authority or governance metadata. Invalid or blocked input cannot produce a ready request or partial compatible body.

Actual LM-63 generation, Lab authority allocation/approval/sealing, evidence acceptance, reference mutation, storage, persistence, file/download/email delivery, routes, downstream readiness and main promotion remain blocked.

The Program queue is empty. Any generation or delivery capability requires a new exact Program parcel. Patrick has no action.

## 2026-07-21 generation-input producer commission

Commission Selector & Engine for SEAM-G-P2 with exactly two new files: one generation-input contract and one focused test.

The producer consumes exact ready artifact-request version 1 JSON plus the exact matching Engine selection-set request. It recomputes the selection fingerprint and emits one immutable single-run generation-input envelope containing only system, optic, target lm/m, room ambient, protocol, quantity, length, safe technical provenance/thermal values and deterministic request/replay/audit identities.

Different outer traceability values must produce identical output and remain absent. Changed selection, request or technical identity must move output identity. Unknown, blocked, over-rich, multi-run, governance-bearing, private/raw, unsafe, fingerprint-mismatched or contradictory input fails closed.

Do not change the stable artifact-request contract, import Lab, bind a reference, load a sealed DTO, invoke Engine or generator, produce LM-63 text, add routes, persist or write.

Return the producer receipt to Program. SEAM-G-C2, binding activation and actual generation remain blocked.

## 2026-07-21 SEAM-G-P2 accepted — Lab reference binding commission

Program accepts the generation-input producer after focused 115/115 and normal 107/107 Selector closeout.

Commission Lab & IES for SEAM-G-C2 with exactly one new import-free reference-binding adapter and one focused test.

Consume only plain public generation-input version 1 JSON and exact public NVB Lab projection version 2 JSON. Ready binding requires optic path, no unresolved blockers, selected optic key equal to Lab optic variant, exact optic BOM and evidence-ref agreement, exact measured reference-room/reference-internal/rise triplet agreement and one exact read-only OPT reference identity with canonical resolver path.

Emit one immutable ready-or-blocked binding projection containing only source generation identity, bounded selection/run, safe technical/thermal binding and public reference identity. Do not resolve the path, load the sealed DTO, inspect/mutate authority, accept evidence, invoke the generator, emit LM-63 text, add routes, persist or write.

Preserve the Lab expected marker and three protected untracked items. Return the consumer receipt to Program; SEAM-G-A2 and actual generation remain blocked.

## 2026-07-21 Seam G generation-binding tunnel active handoff

Program accepts the completed Lab binding receipt at 285/285 and activates SEAM-G-A2 as a read-only contract/validation tunnel only.

The active path binds an exact ready artifact request and matching selection request into one deterministic single-run generation input, then independently validates that input against one exact public OPT reference identity through the NVB Lab projection.

The consumer reconstructs the real selection fingerprint, artifact request identity, generation identity/audit and binding identity. Ready binding additionally proves optic key/variant, BOM, evidence, exact-decimal measured thermal triplet and canonical OPT timestamp/identity agreement.

This activation does not execute the resolver, access storage, load the sealed reference DTO, inspect or mutate authority, accept evidence, invoke the generator, emit LM-63 text, write or deliver a file, add routes or persist state.

The Program queue is empty. Sealed-reference loading and actual generation require a new exact Program parcel. Patrick has no action.

## 2026-07-21 sealed-reference generation inspection commission

Commission Lab & IES for SEAM-G-C3 in exactly two files: a narrow inspection export in the existing sealed-reference generator module and one focused test.

The inspector must call the exact existing private reference validator and stop before job validation or materialisation. It emits only public reference identity, keyword profile ID, safe baseline values, derived baseline lm/m and watts/m, exact missing generator override names and explicit no-generation/no-raw/no-write flags.

It must not expose metadata, angles, candela, keyword values, provenance paths or the sealed DTO body. It must not derive a multiplier, accept project/customer data, resolve storage, invoke the generator, emit LM-63 text, add routes, persist or write.

Return the inspection receipt to Program. Multiplier policy, generation job construction and actual generation remain blocked.

## 2026-07-21 SEAM-G-C3 accepted — materialisation job-plan commission

Program accepts the redacted sealed-reference inspection after 295/295. It reuses the generator's exact validator, exposes no sealed body and leaves materialisation untouched.

Commission Lab & IES for SEAM-G-C4 with one new import-free job-plan module and one focused test.

Consume only public generation-input, generation-reference-binding and reference-inspection version-1 JSON. Require exact generation/binding identity and selection/run agreement, exact binding/inspection reference identity, a ready reference-validated inspection, no missing keyword overrides and positive verified and baseline lm/m.

Derive `outputMultiplier` only as Engine verified lm/m divided by sealed baseline lm/m. Selector target lm/m remains intent. Emit exactly `{ runLengthMm, outputMultiplier, selections: {} }` inside a deterministic no-generation plan.

Do not accept caller keyword overrides, load a sealed DTO, resolve storage, invoke materialisation or generator code, emit LM-63 text, accept project/customer metadata, add routes, persist or write.

Return the plan receipt to Program. Actual generator invocation remains blocked.

## 2026-07-21 Program work-shape handoff

Program approves a separate Governance & Shell lane. It owns project, identity, permissions, timeline, ownership, handoff, persistence, data retrieval and external CRM orchestration. Selector & Engine remains the technical kitchen. A separate CRM lane is deferred; item 7 stays blocked inside Governance until its portal-scope prerequisite and writer scope are known.

Program must provision the new lane with its own worktree, `lane/governance-shell`, MCP service identity, exact write globs, required branch and gate before items 3, 4, 6 or 9 begin.

Selector completed all three admitted parcels in strict order:

1. PWS-001 retired named CRM/business gate semantics and added deterministic provider-inert false-to-true readiness intent;
2. PWS-002 added fail-closed Factory Ready from existing source-backed evidence only;
3. PWS-005 corrected stale save/restore/hydrate copy without behavior change.

The normal and guarded Selector gates passed 107/107 for each parcel; focused coverage passed 114/114, 128/128 and 112/112 respectively. The Selector queue is empty, its worktree is clean and temporary module write permissions are retracted. Selector must not call HubSpot. Governance owns identity/project association, persistence, idempotency, retry and any later best-effort provider action.

Item 10 is binding immediately: no module-owned download/export/artifact-delivery path. Every retrieval passes through one Governance gateway, with readiness and identity implemented as separate checks. Seam G may continue internal contracts but cannot expose a direct download or delivery seam.

Keep all standing tests: changed/absent traceability envelope independence; changed-optic thermal movement; varied-row movement wherever placeholder lookup values are identical; and ownership-wide tests instead of named-instance assertions.

Lab C4 and Selector PWS-001 may run in parallel because they use separate worktrees. No second Selector writer is authorised.

### Governance lane activation handoff

The repository-side infrastructure is implemented and green. Deployment v2 now knows the Governance worktree and scoped MCP service; the lane has a fixed gate and an idempotent provisioner.

Run the provisioner once on Patrick's Windows host. It verifies the clean Program branch, creates or validates the Governance worktree and branch, copies exactly the six bootstrap records into the canonical context, refuses differing existing files, gates the lane, commits and pushes the founding checkpoint, reloads Deployment v2 and verifies the Governance MCP as healthy and managed.

Do not manually copy individual files, create an alternate branch name, widen write globs, add an ad hoc tunnel, or touch Lab protected files during activation. Governance connector exposure must use only the later fixed dedicated tunnel profile and provisioner recorded by Program.

### Governance first feature handoff — GOV-001

The Governance & Shell lane is active. Implement one inert, versioned single data-retrieval gateway contract and shell view-state.

Accept only safe scalar module/output descriptors, one readiness label, project-context presence, identity-capture presence and static discovery descriptors. Keep readiness and identity as separate fields and separate blockers. Recognise useful-output states at Spec Ready, Build Ready and Factory Ready without reading or changing Engine state.

Return deterministic fail-closed states for: no useful output, project required, identity required and ready for future retrieval. The ready state is not a download permission and must not contain a path, URL, blob, raw artifact, file body or provider object.

Reject unknown, extra, private, raw, nested authority, path-bearing, URL, blob, traceability-envelope and provider-shaped inputs. Freeze or otherwise make the public result immutable.

Do not add a route, download, email, filesystem write, persistence, localStorage, CRM call, hard email verification, Engine invocation, readiness mutation or live cross-module read. Do not modify Selector, Engine, Lab authority, main or runtime-port work.

Add ownership tests proving exactly one Governance gateway owner and no module-owned retrieval helper or action. Retain the standing cross-lane regressions. Run the fixed Governance gate, commit only the approved feature/test/lane-memory files and return the gated receipt to Program.

### Lab C4 receipt accepted

Program accepts the deterministic no-generation materialisation job plan after 305/305. The exact two-file feature validates public generation, binding and inspection identities; derives the multiplier only from Engine verified lm/m divided by sealed baseline lm/m; preserves target lm/m as intent; and emits the exact empty-selection generator job only in the ready state.

The two corrected fixture issues did not change production behaviour. Lab is now idle with an empty queue, one expected branch marker and three protected local items. Do not commission sealed DTO loading, generator/materialise invocation, LM-63 output, route, persistence or delivery without a new Program seam decision.

### Governance connector exposure handoff — PWS-L1

The dedicated Governance secure tunnel is now validated, healthy and managed alongside the local Governance MCP. Tunnel recovery passed using only the managed tunnel services; no other lane profile was reused and no secret was displayed.

Create or enable the Governance & Shell custom app in ChatGPT while the managed tunnel is running. Do not reuse Selector, Lab or Program tunnel profiles; do not expose Governance through ngrok; do not widen the Governance MCP or implement GOV-001 through another lane.

Once the Governance app appears as a secure tool, run the existing GOV-001 commission unchanged.

### Governance persistence restoration handoff — GOV-003

GOV-001 is complete and accepted after 152/152. Implement project persistence as restoration only.

Use canonical persisted schema `workspace_saved_project.v2`. Treat `workspace_saved_project.v2-runtime` only through explicit read/write adapters. Server JSON is authoritative; localStorage is a cache/recovery mirror written only after a successful server save/read.

Persist one UTF-8 JSON file per stable safe `projectId` under `data/session_projects` or `CS_SESSION_PROJECT_DIR`. Write a sibling temporary file and atomically replace the target. Request identity, filename identity and record identity must agree. Do not invent a fallback project id. `envelopeId` remains revision metadata and cannot create a second project file. Exclude Alpha/Bravo/Charlie fixtures.

Restore only nullable passive fields `hubspotDealId`, `hubspotContactId` and `hubspotCompanyId`. Add no CRM lookup, provider call, writeback, price or readiness effect.

Add only bounded `POST /api/session/save` and `POST /api/session/read`. Read supports one exact project or validated all-project boot/list mode. Do not add share, handoff, email, token, cleanup, CRM, retrieval or delivery routes.

Migration may read canonical server v2, explicit browser v2, donor v1 through a versioned normaliser and one explicit live-memory flush. It must be idempotent and non-destructive; retain original browser keys/backups and legacy files; never migrate fixtures.

Use existing `projectPersistenceLive` as the sole rollback flag. False retains the memory adapter; true selects server JSON. Persisted files remain untouched on rollback.

Acceptance: restart restore in a temporary directory; atomic failure preserves last good file; unsafe ids/path traversal rejected; malformed records skipped without blocking boot; fixtures absent; passive CRM ids round-trip with zero provider calls; migration idempotent with backups retained; server success precedes cache update; one Governance storage owner; Engine runs with no project and identical selections produce identical output regardless of project/traceability/persistence failure.

Touch only Governance-owned project store/service, bounded server route, shell cache adapter if required, focused tests and lane memory. Do not add identity lookup, retrieval activation, delivery, CRM activity, handoff, email or unrelated schema changes. Run the fixed Governance gate, commit/push the exact approved set and return the gated receipt to Program.

### Lab sealed-reference load preflight handoff — SEAM-G-C5

Selector work-shape items PWS-001, PWS-002 and PWS-005 are already complete; do not queue or rerun them.

Implement one Lab-only read-only sealed-reference load preflight. Consume exact ready materialisation-job-plan version 1, exact matching generation-reference-binding version 1 and exact matching reference-generation-inspection version 1 values. Accept the resolver only as an injected Lab-owned capability, never as public path, URL, storage or provider input.

Derive the reference identity only from the matched contracts and call the resolver at most once. Validate the returned sealed DTO through the existing generation-inspection path. Require exact equality for reference identity, keyword profile, baseline, missing overrides and materialisation-without-overrides state. Discard the loaded body after validation.

Return one deterministic immutable redacted ready-or-blocked load receipt. Do not return the sealed DTO, metadata, keyword values, angles, candela, provenance paths, LM-63 text or local location. Do not invoke the generator or materialiser, add routes, persist, write, deliver or activate readiness.

Use exactly one loader feature and one focused test. Preserve the expected branch marker and three protected local items. Run the fixed Lab gate, commit and push only the feature, test and lane-memory closeout, then return the gated receipt to Program.

After C5 acceptance, C6 in-memory generation, C7 opaque Seam G artifact handoff and Governance retrieval activation remain separately blocked. Patrick has no action for C5.

### Selector consolidated walkthrough handoff

PWS-001, PWS-002 and PWS-005 are complete. Do not queue or rerun them.

Execute the walkthrough batch with one Selector writer and one ready parcel at a time. WALK-001 is ready now: run the repaired guarded materialiser dry-run, require all current source-shape validations plus a finite tier-gated `SYSTEM_POLICY.ambient_temp` row, then use the existing live materialise/archive/promote workflow. Any validation, Ambient, identity, disclosure, archive or promotion failure stops before write. Do not modify Selector features, save/register a project or invoke Engine in WALK-001.

After WALK-001 closes, execute in strict order:
1. Read-only diagnose and delete Length Mode as Selector authority. Keep positive quantity and length; expose no hidden/default mode; downstream NVB candidates remain available to Lex.
2. Unmount the old fabricated Selector scaffold so the source-backed live surface is the only current-selection owner.
3. Delete the legacy `TIERS`-expecting payload/readiness owner. The live status bridge owns source readiness; Tier remains server/Engine-derived from `SYSTEM_POLICY`.
4. Delete Selector's internal timeline and special-parts principal test modes. Governance owns identity, principal/role, timeline policy and visibility; preserve equivalent bounded shell-consumer diagnostics without raw authority.
5. Restore donor auto-fill defaults. For every dropdown, preserve exact NVB comma-separated option order and auto-fill the first real option. Skip presentation-only `No manual constraint…` rows. Mark auto-filled values visibly as LOOKED UP choices made on the user's behalf, distinct from manual constraints. Add one `Accept all defaults` action that creates the GIVEN acknowledgement for every flagged default, including inherited cover/end/flex finishes. Unacknowledged defaults do not satisfy readiness. Do not add per-field acknowledgement or code-owned default ranking; future default changes are source-data reorder only.
6. Correct missing/blocked counters to count visible actionable prerequisites only, including genuine pending default acknowledgements but excluding diagnostic, future, consequence and disabled rows.

Only after those close may WALK-007 reconcile Run Engine to the selections-only boundary and perform one bounded thermal acceptance. Server revision acknowledgement and governance/project envelopes are not Engine authority. Preserve exact source-backed selections and no-write transport safeguards. Prove selected room plus one measured optic rise exactly once, attributable lookup and verified lm/m, and varied-rise movement with room/current/curve fixed.

Patrick's finishes default-acceptance ruling is closed in Governance: inheritance or auto-fill alone does not satisfy Build Ready; one `Accept all defaults` action acknowledges all flagged defaults. Per-field acknowledgement is not required.

Lab C5 may proceed independently in its isolated worktree. Do not add a second Selector writer, CRM/provider mutation, persistence, IES generation, delivery, module-owned retrieval, main or unrelated runtime work.

### HubSpot and CRM changeover handoff

Patrick completed the read-only HubSpot portal prerequisite on 2026-07-22. The private app is `ControlsStack (Read Only)` with exactly contacts-read, companies-read and deals-read scopes. Its token is held only in the local secrets store and must never be copied into repository files, prompts, logs, tests or receipts. `writePolicy` remains disabled.

The legacy OAuth public app remains untouched and operational. Do not retire or replace it without a separate cutover parcel.

The binding business scope is closed: HubSpot owns contacts, companies, deals and price; ControlStack owns engineering state and build detail. One ControlStack envelope maps to one HubSpot deal using `controlstack_project_key` plus `controlstack_job_ref`. Provider intent occurs on genuine readiness-state entry only. Leads are deals in a separate leads pipeline. ControlStack remains local-first, CRM reads are cached and later pushes must be best-effort, idempotent and replayable.

GOV-006 / CRM remains held on the sole substantive CRM precondition: exact writer-scope definition. A separate Program admission remains the normal release control before implementation. No live provider mutation is authorised. HubSpot Service Keys migration is PARKED until auth cutover as an expected token swap with no ControlStack code change. Patrick reports that the RULED business scope and PARKED Service Keys decision are already recorded in the project-shell registry; Program records that as REPORTED and does not cross-write Governance.

### Selector WALK-001 reader-recovery handoff

Selector reports a clean, reconciled lane and a correct fail-closed WALK-001 stop before all writes. The running service could not load the existing server-side Google Sheets reader. WALK-001 is therefore open, not complete: no current-source or Ambient proof, materialisation, archive or promotion has been accepted.

Commission the standing Selector worker for WALK-001R only. Reproduce the redacted reader-load failure and inspect the existing Selector runtime dependency/module-resolution/working-directory/configuration boundary. Apply only the minimum repair available within Selector-owned paths or existing managed-service controls. Do not expose, copy, move or newly bind Google credentials; do not use arbitrary shell workarounds or broad environment repair.

If repair requires a Program-owned deployment or service-host change, a protected-secret change, cross-lane writing or another root, stop with a redacted diagnosis. Otherwise restart only `selector-runtime` through the existing manager, rerun the complete original guarded dry-run, and continue to materialise/archive/promote only after every validation and the finite tier-gated `SYSTEM_POLICY.ambient_temp` proof pass. Stop again for Program review after WALK-001; do not start WALK-002.

### Selector WALK-001I operational install handoff

Selector has now returned the required redacted diagnosis. It reports that the serving worktree declares and lock-pins `googleapis`, but the live installation lacks the locked dependency set. Credentials were untouched, no tracked file changed and the Selector lane is clean. Program classifies this as service-host installation drift and approves WALK-001I with no Selector write scope and no code change.

Patrick executes `npm ci` in the exact Selector worktree that serves port 8788. Use the lockfile exactly; do not use `npm install`, update packages, edit package files, change credentials or modify deployment configuration. If the command fails or creates a tracked change, stop.

After success, open the existing ControlStack Manager panel, choose `CS Selector Runtime / Workspace Shell (8788)`, click `Restart`, and require that service alone to return Healthy and Managed. Then return to the Selector orchestrator. It must verify clean Git state, resume WALK-001R, and rerun the complete guarded WALK-001 dry-run before any materialise/archive/promote write. WALK-002 remains blocked.

### Selector WALK-001V Ambient-visibility handoff

Program accepts the latest clean fail-closed receipt. WALK-001I and reader transport recovery are complete: the current Google source is reachable and all 15 required tables are present. WALK-001 remains open because source acceptance failed before every write.

The verified Driver boundary is source data, not Selector option behaviour. Canonical `DRIVERS.native_control_type` is populated on all 48 rows but contains only Boolean-like markers and supplies no protocol authority. Duplicate-normalised `native_control_type__2` is also populated on all 48 rows and carries 51 protocol values. BOARDS authority is populated but has no intersection with the required canonical Driver field. The existing Selector duplicate-field fallback must not be used to promote contradictory source identity.

SYSTEM_POLICY is present with 133 rows, but Ambient is unproven rather than absent because the current redacted source-shape response does not summarize `ambient_temp`.

Commission the standing Selector worker for **WALK-001V only**. Exact feature paths are `packages/workspace-kernel/authorityReferenceMaterialiserService.js` and `tests/selectorReferenceOptionsService.test.js`. Extend only `currentSourceShape` after a successful Google read and before any write. Add a value-free SYSTEM_POLICY/Ambient summary with table count, exact and approved `ambient_temp` row counts, and allowlisted `economy`, `business`, `first` and `charter` column presence/population plus finite and non-finite numeric-token counts. Include safe counts for rows with any finite tier value, finite values across multiple tier columns and generic-only rows. Return no values, rows, unrestricted headers, users, credentials, Sheet identity, provider body, full source JSON or paths.

The gate-included test must prove tier-specific finite evidence, generic-only and non-numeric non-proof, duplicate exact-row counts, redaction and dry-run no-write behaviour. Do not change Driver rules, validation outcomes, Google reading, source data, materialisation, archive, promotion, Selector options, Engine or deployment. Gate and push the exact two-file feature parcel, update lane memory, and stop. Program will separately activate the runtime and decide the exact Google-source correction; WALK-002 remains blocked.

### Standing Program response-routing rule

Every future Program session must end any response that changes a ruling, authorisation or queue state with a section titled `ROUTING`.

List every affected lane using exactly one of these forms:

- `<lane>: no action`
- `<lane>: PASTE THE FOLLOWING —` followed by the complete ready-to-send message for that lane's chat
- `PATRICK: <one plain-English action>`
- `ADVISOR: <infrastructure action>`

Patrick is the courier between chats. Unrouted authorisations do not move and remain stalled in Program context. Never route with a summary such as “tell it to proceed”; include the finished message in full. If no lane or person moves, state `ROUTING: nothing moves`.

### Canonical production-chain seed library handoff — SEED-LIB-001

Program records two Patrick-nominated, Selector-saved test cases as the initial canonical library for C5, C6, C7 and downstream acceptance. The library may grow later by adding cases without any contract, ownership or schema-version change.

**Build 1 — direct, loaded**

- DNX 60 Square
- Opal 60
- 3000K/CRI80 board
- DALI-2 DT6 class
- target 1000 lm/m
- run 9560 mm × 1
- Spitfire D25 emergency
- PIR 5 m sensor
- Suspended
- Top Side
- White (Textured)

**Build 2 — direct/indirect, loaded**

- DNX 80 DI (`Square_DI`)
- direct Inlay 80 plus Microprism
- indirect Rope 80
- direct target 1500 lm/m
- indirect target 500 lm/m
- 5000K/CRI90 board
- Fixed (On/Off) on both lanes
- Surface Mount
- Back Wall side
- Black (Textured)
- EM DC Mains emergency
- Microwave sensor
- run quantity and length from the saved Selector test case

Saved Selector selections are the only run-intake authority. Do not retype, infer, normalise or replace the saved quantity or length. Build 1's saved intake is explicitly 9560 mm × 1; Build 2's saved intake remains whatever the saved case contains.

Canonical acceptance must traverse the real production chain: exact saved Selector selections and run intake; accepted Engine/public contracts after the Selector action lane is released; genuine Lab measured evidence; the existing real approval and sealer; the existing real `inspectIesReferenceForGeneration` inspection; C5 resolver/load preflight; C6 in-memory generation; C7 validated opaque artifact handoff; then separately admitted Governance retrieval.

Hand-made sealed DTOs, hand-made inspection results, synthetic production artifacts, substitute optics, substitute boards, nearest matches, inherited measurements, placeholder evidence and manually reconstructed run intake cannot satisfy this library. If Lab lacks measured evidence, a sealable authority record or exact identity agreement for any selected element, fail closed and report the exact missing element without substitution.

The pair is deliberately different in profile, emission mode, optics, board family, CRI class, control class and thermal characteristics. Both cases are mandatory for changed-optic movement and varied-row proof where placeholder source values are identical.

Current sequencing remains binding:

- Selector WALK-001V and WALK-001VA are accepted complete. WALK-001S guarded completion against the corrected source is the sole ready Selector action.
- Lab C5 and its corrected seed-memory closeout are accepted complete at 314/314; no Lab action is ready and C6 is not released.
- SEED-LIB-001 is recorded as blocked in both affected lane queues. No real sealing, generation, C7 handoff or Governance retrieval is authorised by this handoff alone.

### WALK-001V/C5 acceptance and activation handoff

Program has now directly reviewed both returned lane states.

WALK-001V is accepted complete. The Selector feature and lane closeout are pushed, the lane is clean and the fixed gate passes 108/108. The new current-source summary is count-only, allowlisted, value-free and positioned before every possible write. It proves duplicate visibility, approved finite tier-specific classification, generic/non-numeric/unapproved non-proof, disclosure redaction and dry-run no-write behaviour without changing Driver rules, validation outcomes or any write path.

C5 is accepted complete. The Lab feature and closeout are pushed and the fixed gate passes 314/314. The preflight remains one contract-derived read-only resolver call, validation through the real inspection path, one immutable redacted receipt and immediate loaded-body discard. C6 remains blocked by the canonical seed sequence and separate Program admission.

WALK-001VA is accepted complete at 108/108. The managed activation succeeded, the count-only Ambient summary is live, the read-only receipt is pushed and clean, and every write remained blocked by the then-current source defects. WALK-001S later completed the corrected-source refresh and is superseded by the WALK-002 handoff below.

Selector has durably recorded SEED-LIB-001 as blocked. The earlier missing-record note is superseded; no duplicate seed-memory action is required.

The Lab correction is accepted complete. Its blocked SEED-LIB-001 entry now uses normal Markdown list markers, both canonical builds and all real-chain/fail-closed rules are unchanged, the fixed Lab gate passes 314/314, tracked files are clean and the three protected local items remain untouched and unstaged. No C6, C7, sealing, inspection, resolver execution, LM-63 generation, persistence, retrieval or delivery occurred. No Lab action is ready.

### WALK-001S exact source correction and guarded completion handoff

WALK-001VA is accepted complete at 108/108. The managed service is healthy and the activated count-only summary is live. The guarded run remained read-only and the Selector lane is clean.

Live evidence: SYSTEM_POLICY has 133 rows, one exact `ambient_temp` row, zero approved exact rows and no Economy, Business, First or Charter columns or tier values. DRIVERS has 48 Boolean-like canonical rows with zero protocol authority; the duplicate-normalised column has protocol authority on all 48 rows with 51 values. BOARDS has 265 rows and zero canonical Driver agreement.

Patrick reports the source correction is complete. The misnamed Driver approval/Boolean column now has its proper non-authority header, leaving exactly one `native_control_type` header and that column is protocol-bearing. No Driver row value was intentionally changed.

The existing exact `ambient_temp` row is approved and has finite values in the Economy, Business, First and Charter tier columns. `ENG` was removed and remains deferred pending a separate ruling; it must not appear as a non-finite token in this acceptance run.

The next guarded dry-run must show one approved exact Ambient row; all four tier columns present and populated; finite counts consistent with the corrected source and zero non-finite tier tokens; one approved finite multi-tier row; canonical Driver protocol authority on all 48 rows with 51 values; no duplicate-normalised Driver authority; and non-zero canonical Driver-to-Board agreement.

Every original source-shape, validation, identity and disclosure guard must pass. Only after the complete dry-run passes may the existing guarded materialise/archive/promote sequence continue, with archive succeeding before promotion. Stop after WALK-001 for Program review.

### WALK-001 accepted; WALK-002 sole worker commission

Program accepts WALK-001 complete. The corrected dry-run passed, materialisation succeeded, the previous active authority was archived before promotion, promotion completed without blockers, the active and materialised authorities align, the Selector gate passes 108/108, and the lane is clean. Program's independent read-only probe confirms all 15 required tables, a new active fingerprint, safe redaction, no mutation and no blockers.

Commission the standing Selector worker for WALK-002 only. First perform a read-only trace of every current `runLengthMode` owner and consumer. Then delete Length Mode as Selector authority from:

- run-intake state and validation;
- committed or persisted Selector constraints;
- Build Ready and run-readiness requirements or diagnostics;
- factory-approved summaries;
- spine and payload previews;
- Selector reference-option metadata;
- rendered controls, labels and next-action copy.

Preserve `runQty` and `runLength` as the only run-intake decisions. A run with a positive quantity and positive physical length must no longer be incomplete because no mode exists. Do not create or infer a replacement mode, default, fallback, sentinel, derived value or hidden constraint. Old stored `runLengthMode` values must not become active truth or appear in new payloads, summaries or UI.

Preserve all otherwise eligible source-backed NVB Board candidates for downstream Lex scoring. Removing Length Mode must broaden or preserve candidate availability; it must never narrow candidates or preselect a manufacturing interpretation. Keep the existing safe-local-intent, no Engine invocation, no RunTable/IES generation, no persistence, no route and no RuntimeData mutation boundaries.

Authorised production paths are limited to:

- `packages/modules/cs-selector/selectorRunIntakePreview.js`
- `packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js`
- `packages/modules/cs-selector/selectorView.js`
- `packages/modules/cs-selector/selectorViewModel.js`
- `packages/workspace-kernel/selectorReferenceOptionsService.js`

Focused test scope may include only:

- `tests/selectorRunIntakePreview.test.js`
- `tests/selectorRunIntentCaptureSurface.test.js`
- `tests/selectorSpecBuildReadinessPreview.test.js`
- `tests/selectorSpinePayloadSkeleton.test.js`
- `tests/selectorSafeWorkflowSurfaceIntegration.test.js`
- `tests/goldenSupportedMachineValueWitness.test.js`

If the read-only trace finds a required production owner outside the authorised list, stop with the exact diagnosis rather than broadening scope. Run all affected focused tests plus the fixed Selector gate. Commit and push the exact WALK-002 parcel, reconcile lane memory and stop for Program review. Do not begin WALK-003, invoke Engine, touch saved seed cases, release C6/C7, mutate CRM/provider state, persist, generate IES, retrieve or deliver artifacts.

### WALK-002 protected stop accepted; WALK-002R complete owner commission

Program accepts the WALK-002 protected stop. The trace found required production owners outside the first boundary, no production or test implementation changed, the fixed Selector gate passes 108/108, only the stop reconciliation was pushed, and the lane is clean.

Commission the standing worker for WALK-002R only. The complete authorised production scope is exactly:

- `packages/modules/cs-selector/selectorRunIntakePreview.js`
- `packages/modules/cs-selector/selectorRunAccessoryPlacementPreview.js`
- `packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js`
- `packages/modules/cs-selector/selectorView.js`
- `packages/modules/cs-selector/selectorViewModel.js`
- `packages/workspace-kernel/selectorReferenceOptionsService.js`
- `packages/workspace-kernel/projectEnvelope.js`
- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `packages/workspace-kernel/engineRunTableSealedCandidateAssemblyPreview.js`
- `packages/workspace-kernel/engineRunTableRuntimeRunTableDomainOutputScaffold.js`
- `packages/workspace-kernel/engineRunTableControlledRealSourceSealedEvidenceProbe.js`

Delete every current production occurrence and contract effect of `runLengthMode` and `lengthMode`. This includes supported-mode values and labels, missing/unsupported-mode diagnostics, committed-run readiness requirements, summary and UI rows, option metadata, candidate fingerprints and the `cut_to_length` fallback, emitted mode fields, `requested_length_basis`, same-length accessory interpretation, mode buckets, `unresolved` mode sentinels and controlled-probe sample mode values.

Do not create a replacement field, constant, fallback, default, sentinel, proxy or inferred manufacturing interpretation. Quantity and positive physical length are the complete run-intake authority. Legacy stored mode data is discarded at the bounded projection or hydration boundary and is neither active truth nor newly persisted. Current registration and exact project-envelope validation use the mode-free shape.

The readonly candidate mapper must preserve all otherwise eligible source-backed NVB Board candidates for downstream Lex scoring. Candidate identity may include quantity and physical length only. Accessory intent may remain bounded by run quantity but may not infer same-length semantics. Sealed-candidate and downstream RunTable previews may expose safe quantity and length bands only, with no mode field, bucket, sentinel or proxy.

Test edits are authorised only for tests that currently contain `runLengthMode` or `lengthMode`, plus tests that directly import one of the eleven production files and require fixture or exact-shape updates. Add focused proof that legacy mode input is ignored and omitted, registration and saved-project validation accept the mode-free current shape, candidate fingerprints and payloads contain no mode or requested-length basis, accessory and downstream previews contain no hidden interpretation, and eligible Board candidate breadth remains equal or broader.

Before completion, repository-wide production search under `packages` must return zero `runLengthMode` and zero `lengthMode` occurrences. User-visible copy and rendered-control proof must contain no Length Mode requirement. Positive quantity plus positive physical length must satisfy run intake. All no-Engine, no-RunTable/IES-generation, no-persistence, no-route, no-POST and no-RuntimeData-mutation boundaries remain unchanged.

If any additional production occurrence or required owner appears outside these eleven files, stop again with the exact trace. Otherwise run all affected focused tests and the complete fixed Selector gate, commit and push the exact WALK-002R parcel, reconcile lane memory and stop for Program review. Do not begin WALK-003 or any later walkthrough work; do not invoke Engine, execute seed cases, release C6/C7, mutate CRM/provider state, persist, generate IES, retrieve or deliver artifacts.

### Mandatory deletion-test coupling and TEST-AUDIT-001

Effective immediately, every WALK parcel that deletes an input, authority, prerequisite, field, control, fallback, sentinel, proxy or interpretation must remove its encoded test assumption in the same parcel. Rewrite tests that still have value to prove the new absence or changed authority; delete tests whose only purpose was the removed assumption. Do not leave an obsolete contract lock or fixture expectation merely because the suite remains green.

Each deletion-parcel receipt reports five mechanical counts: baseline encoded-assumption assertions, assertions deleted, assertions rewritten, affected test files and residual encoded-assumption assertions. Residual must be zero unless Program has explicitly approved a historical non-runtime fixture. This requirement is part of WALK-002R now and every later WALK deletion parcel; it does not authorise unrelated test refactoring.

TEST-AUDIT-001 is recorded as a blocked future read-only parcel after WALK-007. It audits the runtime test suite only for: deleted-input assertions including user-entered Tier and Length Mode; governance/project/revision/identity preconditions on Engine execution; future/diagnostic/consequence/disabled fields treated as prerequisites; and supposedly varied fixture rows carrying identical values. Its only output is a counted kill-list for separate Program deletion approval. It changes no test or production file and releases no seed, Engine, Lab, CRM, persistence, IES, retrieval or delivery work.

### WALK-002R second protected stop and twelve-owner amendment

Program accepts the second WALK-002R protected stop. The worker found one additional production owner before edits, stopped without broadening scope, pushed only lane-memory reconciliation, retained a clean lane and passed the fixed 108/108 gate.

The exact missing owner is the safe selected-result source projection. It still allowlists and can emit `requested_length_basis` from controlled geometry. Add this owner to the previous eleven-owner boundary; WALK-002R remains the same sole parcel and now has twelve authorised production owners.

Delete the `requested_length_basis` allowlist/emission from that projection and remove the field from its coupled fixtures, exact-shape assertions and downstream contract tests. Current repository evidence contains six test occurrences of the field. The worker must mechanically calculate the complete baseline encoded-assumption assertion count before editing and report the required deleted, rewritten, affected-file and zero-residual counts after editing.

Do not delete `length_policy_source` or `accessory_length_policy_source` by name alone. They remain valid policy provenance unless the worker proves a specific occurrence directly encodes the deleted Length Mode assumption; such proof must remain within the twelve-owner boundary or trigger another stop.

Completion searches under production `packages` must return zero occurrences of `runLengthMode`, `lengthMode`, `requested_length_basis` and `requestedLengthBasis`. All prior mode-free authority, candidate-breadth and no-execution/no-write rules remain binding. If no further owner appears, run affected tests and the fixed gate, push the coupled WALK-002R implementation and lane-memory closeout, and stop before WALK-003.

### WALK-002R permission stop and WALK-002RG managed activation

Program accepts the clean permission stop. The current pre-edit baseline is 71 encoded assumptions across 32 test files; deleted 0, rewritten 0 and residual 71. No production or test implementation remains changed, the Selector gate passes 108/108 and the lane is clean.

The live Selector MCP write guard omits exactly two already-authorised owners: the run-intake preview and accessory-placement preview. All test patterns and the remaining ten production owners are already permitted.

Program has updated the managed deployment manifest and its contract test to add only those two exact paths. Broad `packages/modules/**` and `packages/modules/cs-selector/**` permissions remain prohibited.

WALK-002RG is the sole ready infrastructure prerequisite. Advisor applies the published deployment configuration and restarts only Selector MCP through the existing manager. Do not restart Selector Runtime. Verification must show each added exact file once, the existing approved exact module files retained and both broad module wildcards absent.

After activation, the existing Selector worker resumes the same WALK-002R parcel without a new commission. The twelve-owner production boundary, four banned-name searches, 71-assumption baseline, zero-residual test rule, no-execution/no-write boundaries and stop before WALK-003 remain unchanged.

### Blocked post-WALK audits

TEST-AUDIT-001 remains the first blocked read-only parcel after WALK-007. It mechanically audits runtime tests for deleted-input assertions, governance/project/revision/identity preconditions on Engine execution, future/diagnostic/consequence/disabled fields treated as prerequisites and identical-row fixture placeholder traps. It returns only a counted kill-list for separate Program approval. The immediate deletion-test coupling rule remains binding throughout the WALK batch.

POLICY-MAP-001 is the second blocked read-only parcel after TEST-AUDIT-001. Patrick reports SYSTEM_POLICY currently has 133 rows and a newly added consumer-group column. The exact header is pending from the Selector reader contract and must be fixed and accepted before any code consumes that column or before this audit runs.

POLICY-MAP-001 uses the consumer-group column as its spine and returns one table with exactly one row per current SYSTEM_POLICY item. Each row is classified only as `CONSUMED-VERIFIED`, `CONSUMED-STALE` or `NO CONSUMER YET`. Verified and stale classifications name the exact consuming file and function and state concise shape/name evidence. The audit exposes item identities and consumer mapping, not policy values. A code read that maps to no current policy item is a blocking orphan-consumer exception in the receipt, not a fabricated extra table row.

The audit exists to identify policy groups awaiting implementation, feed later widening briefs, expose stale reads and catch consumers of removed policy identities. It changes no source, code or test and releases no implementation, Engine, seed, Lab, CRM, persistence, IES, retrieval or delivery work. Program separately admits any repair or widening parcel.

### WALK-002RG activation discrepancy and corrected reactivation

The Advisor's first activation receipt is not accepted as completion. It correctly identified that Program's deployment manifest was stale and omitted six previously approved exact Selector permissions. Program has reconciled the manifest and contract test to the full nine-file exact module permission set: seven retained approvals and the two WALK-002R additions. Broad module wildcards remain absent.

Direct live verification still shows the two WALK-002R files missing from the active guard. No-change guarded dry-run write probes reject both files as outside Selector lane scope. The service may be healthy, but the required permission activation is not effective through the live MCP boundary.

Advisor must reapply the reconciled manifest and restart only Selector MCP. The corrected receipt must prove all nine exact module permissions occur once each, broad `packages/modules/**` and `packages/modules/cs-selector/**` permissions remain absent, and no-change dry-run write probes for the run-intake and accessory-placement previews pass scope validation. Do not restart Selector Runtime.

WALK-002R remains blocked until Program verifies that corrected activation. The existing worker and parcel resume afterward without a new commission; every prior production boundary, test-count and safety condition remains unchanged.

### WALK-002RG accepted; standing WALK-002R worker resumed

Program accepts the corrected activation. Direct live verification shows all nine exact module permissions once each, both broad module wildcards absent, and scope acceptance for the run-intake and accessory-placement previews. Selector MCP is READY / MANAGED and the Selector lane is clean. Selector Runtime, every other service, repository source, runtime source and credentials remained untouched.

The existing Selector worker resumes WALK-002R without a new commission. Preserve the twelve-owner production boundary, zero searches for `runLengthMode`, `lengthMode`, `requested_length_basis` and `requestedLengthBasis`, the 71 encoded-assumption baseline across 32 test files, final zero residual, equal-or-broader eligible Board candidates and every no-execution/no-write prohibition. Gate, push the exact coupled parcel and stop before WALK-003.

MGR-RESTART-001 is recorded as a blocked future infrastructure repair. The observed failure involved stale resident configuration despite selected-service restart. Because current code intends to terminate the service host tree while both manager and host load configuration at process startup, the future parcel must reproduce and identify the exact stale layer before changing behaviour. Its acceptance target is one selected-service restart that reloads the latest validated manifest, recycles the complete host, proves the new environment live and leaves every unrelated service unchanged.

### WALK-002R golden-witness permission stop and WALK-002RGT

Program accepts the clean stop. The Selector worker removed every partial edit, the fixed gate passes 108/108 and the lane is clean. The sole blocker is the authorised golden supported-machine witness test, which contains four current Length Mode assumption occurrences but matches none of the live permitted test patterns.

Program has added exactly that test file to the managed deployment manifest and contract test. The nine exact module permissions and all existing test patterns remain unchanged; broad module and broad test wildcards remain prohibited.

WALK-002RGT is the sole ready infrastructure prerequisite. Reload the resident manager from the latest validated manifest, recycle the complete Selector MCP service host rather than only its child, and start it fresh through the manager. Verify the live guard retains all nine exact module permissions once each, contains the golden witness test once, preserves existing test patterns, has no broad module or test wildcard, and accepts a no-change scope probe for the golden witness test.

After Program verifies activation, the existing worker resumes the same WALK-002R parcel. Preserve the twelve-owner production boundary, four banned-name zero searches, 71 encoded-assumption baseline across 32 test files, final zero residual, candidate breadth and every safety prohibition; stop before WALK-003.

### WALK-002RGT accepted; standing worker resumed

Program's direct live verification now shows the exact golden supported-machine witness test permission present and its guarded scope check passing. All nine exact module permissions and existing bounded test patterns remain present, while broad module and broad test wildcards remain absent. The Selector lane is clean.

The most recent protected stop remains accepted as correct when taken: all partial edits were removed and the fixed gate passed 108/108. The permission blocker is now cleared by the live activation.

Resume the existing WALK-002R worker and parcel without a new commission. Preserve the twelve-owner production boundary, zero searches for `runLengthMode`, `lengthMode`, `requested_length_basis` and `requestedLengthBasis`, the 71 encoded-assumption baseline across 32 test files, final zero residual, equal-or-broader eligible Board candidates and every no-execution/no-write prohibition. Gate, push the exact coupled parcel and stop before WALK-003.
