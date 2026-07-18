# Selector & Engine Decision Log

This log is append-oriented. Do not silently rewrite historical decisions.

## 2026-07-18 — Repository memory replaces chat memory

**Decision:** `docs/selector/_context/` is the canonical lane-memory location because it is inside the enforced Selector documentation scope.

**Rationale:** The earlier proposed `docs/_context/lanes/selector-engine/` path was rejected by the lane guard. Using an already-authorised documentation namespace preserves isolation without broadening feature write access.

**Consequence:** Fresh orchestrators read these six files first. Chat history is supporting context only.

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
