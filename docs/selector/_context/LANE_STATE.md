# Selector & Engine Lane State

**Snapshot:** 2026-07-18, Australia/Sydney.

## Current identity

| Item | Current value | Status |
|---|---|---|
| Root | `C:\ControlStack_Worktrees\selector-engine` | VERIFIED |
| Branch | `lane/selector-engine` | VERIFIED |
| HEAD before this documentation parcel | `08df070890300058353cc621c1383f16492063f1` | VERIFIED |
| HEAD subject | `Fix wildcard selector system applicability` | VERIFIED |
| Working tree before this parcel | clean | VERIFIED |
| Runtime | `127.0.0.1:8788` | VERIFIED configuration |
| MCP | `127.0.0.1:8000/mcp` | VERIFIED |
| Gate | `selector-engine` | VERIFIED |

## Current milestone

Close and evidence the first real single-slice Selector-to-Engine run, then widen through contract-preserving passes. The existing implementation history shows that the selected-project shell, invocation transport, registration, lifecycle, read-only run, intent capture, action visibility, source arbitration, reference snapshot caching, and direct Control/Protocol corrections have been built. **VERIFIED from commit subjects.**

Whether the complete current live slice satisfies its final user-level acceptance from selection through useful Engine output is **UNKNOWN** until the lane runs its bounded closeout against the current runtime. This is the next feature milestone; it is not permission to reopen already-closed Control/Protocol or cold-boot repairs without new evidence.

## Completed parcels evidenced by current history

- Selected-project shell invoke host and visible mount.
- Read-only Engine invoke transport, registration, lifecycle, and no-write boundary.
- First read-only selected-project Engine run.
- Project save/open truth and session restoration.
- Single-run intent capture and live runs preview.
- Restored Engine action-lane visibility and pre-Engine eligibility.
- Ambient eligibility decoupling.
- Selector cold-boot source arbitration.
- Direct-only Control/Protocol applicability.
- Live direct Control/Protocol authority intersection.
- Selector reference snapshot and index caching.
- Wildcard Selector system applicability.

These are **VERIFIED commit subjects**, not a claim that every live user journey was re-executed during documentation setup.

## Git inventory at bootstrap start

- staged: 0;
- modified: 0;
- untracked: 0;
- deleted: 0.

**VERIFIED.** The only authorised changes in this parcel are the six files under `docs/selector/_context/`.

## Recent evidence anchors

| Commit | Subject | Status |
|---|---|---|
| `08df070890300058353cc621c1383f16492063f1` | Fix wildcard selector system applicability | VERIFIED |
| `3d1d9f8e1902a47f4c2f86bb8312f61194981e30` | Cache selector reference snapshot and index | VERIFIED |
| `17ff4521ec137a09d198c7f1a74b1e689db5d7b4` | Fix live direct control protocol authority intersection | VERIFIED |
| `d54881102d0840d5f779bba36a4ad7f1b34787c2` | Unblock direct-only control protocol applicability | VERIFIED |
| `40d8254849e923cb9f8471c2f26ae47b8eede979` | Fix selector cold-boot source arbitration | VERIFIED |
| `9645f6cfa254ee11b8c5af143b5cc37eff53e384` | Enable first readonly selected-project engine run | VERIFIED |

## Last accepted gate evidence

A pre-memory acceptance reported `selector-engine` as 100 passed and 0 failed. **REPORTED.** The documentation parcel must rerun the named gate; its commit receipt supersedes this statement.

## Known risks and unknowns

- Current browser-level completion of the full single slice is UNKNOWN.
- The exact stable Engine output schema/version is UNKNOWN and remains a Program queue dependency.
- Widening cost cannot be judged until the closeout proves that new options reuse the existing authority and execution contracts.
- Program-to-main promotion is outside this lane.
- Downstream-artifacts remains HELD until Program declares the Engine output contract stable.
- No current evidence justifies reopening UI rendering, cold boot, or direct Control/Protocol authority as active defects.

## Acceptance state

- Lane identity and isolation: VERIFIED PASS.
- Clean accepted base: VERIFIED PASS.
- Control/Protocol correction durability: VERIFIED in history.
- Durable lane memory: IN PROGRESS in this documentation parcel.
- Single-slice user-level E2E closeout: NEXT MILESTONE.
- Widening: HELD until closeout evidence and Program seam approval.

## 2026-07-18 bounded closeout evidence

Worker `CS-SELECTOR-E2E-SINGLE-SLICE-CLOSEOUT-01` reached the committed internal read-only Engine seam with a complete candidate and active RuntimeData loaded internally. Donor `run_engine` was attempted under the filesystem-write guard; no filesystem write, audit JSONL write, RuntimeData mutation, selected-result persistence, IES generation, or other output side effect occurred.

The first reproducible failing boundary is Engine run-length feasibility: the live safe summary returns `success: false`, `run_count: 0`, and `length_pref="nearest" but no feasible run length found within ±28000mm`. The failure occurs after server-owned invocation and before a useful run-table row exists. Control/Protocol, rendering, cold boot, and reference caching were not reopened.

Priority 1 remains IN PROGRESS. The next bounded worker is `CS-SELECTOR-E2E-LENGTH-FEASIBILITY-BOUNDARY-01`, restricted to proving why the selected source-backed candidate cannot produce one feasible run length and correcting only the exact Selector-to-Engine candidate/length-policy boundary if current evidence requires code.
