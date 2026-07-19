# Selector & Engine Decision Log

This log is append-oriented. Do not silently rewrite historical decisions.

## 2026-07-18 — Repository memory replaces chat memory

**Decision:** Repository lane memory is authoritative; chat history is supporting context only.

**Rationale:** The initial implementation used a Selector-local documentation directory because the canonical lane path was not yet available through the lane guard.

**Consequence:** Fresh orchestrators read the six durable context files first. The original location decision is superseded by the canonical-path decision recorded on 2026-07-19.

## 2026-07-18 — Accepted base is 08df070

**Decision:** Use `08df070890300058353cc621c1383f16492063f1` as the lane's verified pre-memory base.

**Rationale:** Current root, branch, HEAD, recent history, and clean Git state were observed through the correct v2 lane app.

**Consequence:** Historical instructions targeting `C:\ControlStack_Runtime`, `main`, or runtime port 8787 are superseded for Selector feature work.

## 2026-07-18 — Closed repairs stay closed

**Decision:** Direct Control/Protocol applicability, live authority intersection, cold-boot arbitration, and snapshot caching are treated as completed parcels in the current history.

**Rationale:** Specific commits are present in the verified base. Reopening them from stale reports would duplicate work.

**Consequence:** A worker may reopen one only with a current reproducible failure and an exact boundary.

## 2026-07-18 — Prove one slice before widening

**Decision:** The next milestone is a bounded closeout of one real Selector-to-Engine slice.

**Rationale:** It provides evidence about architecture reuse and widening cost. Broad parallel feature changes before this proof would obscure the first failing seam.

**Consequence:** Widening and downstream consumers remain held until the closeout and Engine contract candidate.

## 2026-07-18 — One writer and gated Git

**Decision:** One writer operates in this worktree; staging is explicit; commit and push use gated lane tools.

**Rationale:** Human line-by-line code approval is not a reliable safety control for this project. Machine-enforced scope, tests, branch guards, and durable receipts are the control layer.

**Consequence:** Patrick approves objectives and outcomes, not individual code lines. Feature lanes never write `main`.

## 2026-07-18 — Seam changes require Program acceptance

**Decision:** Any change to the Selector-to-Engine or Engine-output contract is proposed to Program & Integrate with producer and consumer evidence.

**Consequence:** This lane cannot activate Lab or downstream-artifact work unilaterally.

## 2026-07-18 — Tier is derived after run

**Decision:** Tier is not a user-selectable Selector prerequisite. It is a consequence computed by the Engine/Lex path after run intent and source-backed candidate inputs are available.

**Rationale:** The user confirmed the product rule, and the current live Selector correctly does not expose a Tier choice.

**Consequence:** Workers must not add, fake, or require a Tier dropdown merely to satisfy Engine payload shape. Any bridge needing Tier must derive or bind it at the correct post-run boundary.

## 2026-07-18 — Browser save and server registration are separate evidence

**Decision:** A saved browser-session envelope proves local shell save state only. Server-owned registration requires its own acknowledgement or active-revision receipt.

**Rationale:** The current user dump shows a real `project-alpha` runtime-session envelope but does not show server-registration acknowledgement.

**Consequence:** Runtime acceptance must report browser save and active server revision separately and must not infer one from the other.

## 2026-07-18 — Reopen only the live Control options boundary

**Decision:** Direct Control/Protocol options are reopened for read-only diagnosis because new current live evidence shows Control blocked while nearby source-backed fields remain available.

**Rationale:** This satisfies the earlier closed-repair rule: there is now a current reproducible live failure. Historical repair commits do not override current payload truth.

**Consequence:** The next worker diagnoses the exact options-derivation boundary without patching. Rendering, cold boot, caching, optic-efficiency enrichment, and length feasibility remain closed unless the diagnosis directly implicates them.

## 2026-07-18 — Control repair requires proven genuine authority

**Decision:** The accepted diagnosis locates live Control loss at the BOARDS × DRIVERS protocol-authority intersection. A repair may map only a proven genuine active-source authority column or canonical value form.

**Rationale:** Descriptive aliases are intentionally non-authoritative. Broadening them, unioning BOARDS and DRIVERS labels, or defaulting DALI-2 would create unsupported product authority.

**Consequence:** `CS-SELECTOR-LIVE-CONTROL-AUTHORITY-INTERSECTION-REPAIR-01` must first distinguish mapping/canonicalisation mismatch from missing upstream DRIVERS authority. It patches only the former; for the latter it stops without code changes and identifies the upstream data owner.

## 2026-07-18 — Duplicate-normalised DRIVERS protocol field is authoritative when populated

**Decision:** In the current active-source shape, populated `native_control_type__2` is treated as the genuine DRIVERS protocol authority ahead of the boolean marker in `native_control_type`; existing native and legacy fallbacks remain unchanged when the duplicate-normalised field is absent.

**Rationale:** Approved read-only active-source comparison proved that duplicate header normalisation preserved the genuine protocol values in `native_control_type__2`, while `native_control_type` now contains boolean markers. Treating the marker as protocol authority creates non-matching `true`/`false` descriptors and empties the truthful BOARDS × DRIVERS Control intersection.

**Consequence:** The Selector may map only this proven duplicate-normalised authority boundary. Descriptive aliases remain non-authoritative; no source union, fallback Control, DALI default, automatic selection, RuntimeData mutation, or broader schema reinterpretation is authorised. Runtime activation remains a separate operational acceptance step.

## 2026-07-19 — Canonical context path adopted

**Decision:** `docs/_context/lanes/selector-engine/` is the canonical Selector & Engine lane-memory path.

**Rationale:** One standing worker model must serve all lanes through a consistent context shape. The six-file migration was already staged as renames and required content correction only; movement was not reattempted.

**Consequence:** All workers read the six canonical files first, all durable updates remain within that directory, and no tracked reference to the former path may remain.

## 2026-07-19 — Four-status operating model adopted

**Decision:** Worker responses use exactly one leading status: `AUTO`, `SEND TO INTEGRATE`, `NEEDS YOU`, or `STOPPED`.

**Rationale:** The status line makes lane autonomy, integration readiness, human action, and genuine boundaries explicit.

**Consequence:** `AUTO` is lane-branch work only and never means main; `SEND TO INTEGRATE` identifies a parcel ready for Program & Integrate; `NEEDS YOU` names one concrete Patrick action; `STOPPED` records a genuine boundary and is a successful outcome.

## 2026-07-19 — Orchestrator owns queue order; workers execute only the top qualifying item

**Decision:** The orchestrator writes and orders SEL queue items. A worker executes only the first item marked `ready` whose dependencies are satisfied.

**Rationale:** Queue ownership and execution authority must remain separate to prevent workers widening scope or selecting convenient work.

**Consequence:** No qualifying item means `STOPPED - queue empty`; a seam item without recorded Integrate approval means `STOPPED - seam approval required`.

## 2026-07-19 — Server registration is the next Engine gate

**Decision:** SEL-002 is the only next ready item after SEL-001. It must use the genuine existing `project-alpha` browser-session envelope to establish an active server-owned revision.

**Rationale:** `project-alpha` has a browser-session envelope but no active server-owned revision; selected-project Engine invocation currently returns HTTP 422 `active-server-revision-invalid`.

**Consequence:** Server-side registration is the gate on running the Engine. SEL-002 must not invoke Engine or fabricate, reconstruct, or substitute project truth. SEL-003 and later work remain unexecuted.

## 2026-07-19 — Diagnose pre-Engine eligibility before retrying registration

**Decision:** `SEL-011` is the new top ready read-only item. `SEL-002` is blocked until the two genuine `project-alpha` refusals at `selected-project-registration-client-pre-engine-eligibility-invalid` are diagnosed condition by condition.

**Rationale:** Both browser-session saves succeeded, but the client transport rejected the declared pre-Engine eligibility projection before producing a dispatchable source projection. The generic blocker does not reveal which internal readiness condition failed and does not by itself prove server-route unavailability.

**Consequence:** The diagnosis must distinguish a UI-suppliable missing input from an incomplete or unavailable served registration path, and must classify durable-persistence unavailability separately. It may recommend but not implement a repair or UI action. No Engine invocation or registration POST is authorised in SEL-011.

## 2026-07-19 — Tier authority moves to the server-owned Engine/Lex boundary

**Decision:** Program & Integrate approval is reported as recorded and pushed. `SEL-012` may remove Tier from Selector registration eligibility and candidate authority, reject client Tier, and derive/bind Tier only at the existing server-owned Engine/Lex execution boundary.

**Rationale:** SEL-011 proved the current registration and candidate contracts require a manually committed Tier that the Selector must never own. This makes successful registration impossible through truthful UI input. The donor Engine contract already treats Tier as an execution strategy/result concern, while the downstream selected Tier result field is established and must remain stable.

**Consequence:** Tier is not a Selector control, committed constraint, default, cache, or client authority. The repair must preserve all other inputs, explicit Control selection, read-only/no-write behaviour, and the existing Tier result field meaning and shape. Unique source-backed derivation may bind Tier at the server execution boundary; zero or multiple valid derivations must stop with specific blockers. Any Lab/IES incompatibility or Tier output-contract change requires separate Program approval.

## 2026-07-19 — Source-backed Tier binding is implemented only at host execution

**Decision:** SEL-012 implements the approved ownership by removing Tier from Selector registration and candidate authority, stripping all browser Tier forms, and resolving exactly one valid Tier from `SYSTEM_POLICY` immediately before the existing protected host execution seam.

**Rationale:** The active execution contract requires a single Tier-shaped input, but truthful Selector state cannot provide Tier. The smallest contract-preserving repair is to derive the Tier from approved Engine policy authority at the server boundary and then present the donor-compatible single-Tier shape internally.

**Consequence:** One valid source Tier is bound only for host execution. Zero valid Tiers fail as unavailable; multiple valid Tiers fail as ambiguous. No default, guess, cache, union, browser authority, automatic Control selection, project fabrication, or downstream Tier-result schema change is permitted. Registration repairs only the Tier-only readiness defect and continues to expose the actual safe blocker for every other failed input.
