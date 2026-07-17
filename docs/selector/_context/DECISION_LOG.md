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
