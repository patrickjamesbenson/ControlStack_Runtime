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
