# Lab lane — AGREED (CP blessed, 9 July 2026)

CP approved the lane and specified the contract. This is the binding spec the lab-ies-toolkit builds to. Core rule: **the lab lane owns the rich authority object; the runtime consumes only safe handoff summaries + opaque refs.**

## 1. Lane (agreed)
- Branch: `lab-ies-toolkit` · Package root: `packages/lab-kernel/ies-toolkit/`
- No imports into `shell.js`, `services.js`, or runtime kernel until explicitly approved.
- One tool per commit; donor golden-test parity is the acceptance bar per tool.
- **Hard boundary — do not touch:** selector/engine/runtime Stage 2/3/4 files, `server.js`, shell startup paths. No routes / POST / mutation. No file writes enabled by default.

## 2. Authority artifact — the 1mm JSON
- `schemaId: "controlstack.lab.one-mm-ies-record.v1"`, `schemaVersion: 1`.
- Top-level fields: `recordId`, `approvalState`, `revisionState`, `oneMmNormalised: true`, `baseLengthM: 0.001`, `photometryMode: "normalise_1mm_candidate"`, `labProofState`, `sourceFingerprint`, `recordFingerprint`, `origin`, `provenance`, `mutationLog`, `approval`, `safeRuntimeHandoff`.

### mutationLog entry shape
```
{
  "ordinal": 1,
  "toolId": "lab-ies-format-intake",
  "toolVersion": "1.0.0",
  "operation": "normalise_1mm_candidate",
  "paramsSummary": { "oneMmNormalised": true, "baseLengthM": 0.001 },
  "inputFingerprint": "safe-...",
  "outputFingerprint": "safe-...",
  "timestampUtc": "2026-07-09T00:00:00Z",
  "actorType": "human_approved_tool_run",
  "approvalReset": true
}
```
Rules: every tool appends a mutation entry; every mutation changes `recordFingerprint`; every mutation resets approval to pending until re-approved; the origin/as-received fingerprint is immutable; human approval is recorded **on the JSON**, not just UI state.

## 3. Runtime-facing safe handoff fields (the only bridge shape)
`sourcePhotometryRef`, `sourcePhotometryStatus`, `iesPhotometryReferenceToken`, `lumenCurveReferenceToken`, `driverUtilCurveReferenceToken`, `sourceInputFingerprint`, `boardDataSourceVersion`, `selectedFamilySubsetLock`, `oneMmPolicyLabel`, `photometryReferenceFingerprint`. (Aligns with the runtime's existing safe photometry/reference pattern.)

## 4. Gating
- **Intake / Format:** raw IES may be loaded into the lab tool; it stays lab-only; it cannot become runtime-visible authority until `oneMmNormalised === true`, `baseLengthM === 0.001`, provenance exists, mutation log exists, approval state explicit.
- **Approval:** any mutation after approval forces `approvalState: "pending_review"`, export disabled, downstream handoff disabled.
- **Export / Write:** disabled unless approved 1mm record, no pending review, source fingerprint present, record fingerprint present, materialisation/export policy satisfied.
- **Runtime boundary — runtime must NOT receive:** raw IES text, filenames, local paths, candela arrays, proprietary metadata, editable lab mutation history. Runtime receives only: safe summary, opaque refs, safe fingerprints, readiness states.

## 5. Setup (CP's answer to the ngrok problem)
- No second MCP tunnel. Keep one MCP; runtime lane untouched on `main`.
- Create a local **git worktree/branch** for lab: `lab-ies-toolkit`.
- The lab AI works under a strict **file allowlist**; Pat applies/commits only those files.
- **Allowlist:** `packages/lab-kernel/ies-toolkit/**`, `tests/lab-kernel/**` (or similar isolated test path). Optionally one dev-only lab host later, not now.
- **Forbid:** `packages/workspace-kernel/**`, `packages/modules/**`, `apps/**`, `server.js`, shell startup paths.

## 6. CP's recommended build order
1. parse + write round-trip
2. 1mm authority JSON schema
3. mutation / provenance log
4. approval gating
5. then the safe runtime handoff summary (first runtime-facing deliverable = a **safe photometry reference summary**, not raw lab JSON).

CP offered to draft the exact writer brief for tool #1 (parse + write round-trip).
