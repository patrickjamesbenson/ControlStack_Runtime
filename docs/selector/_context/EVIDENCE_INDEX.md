# Selector & Engine Evidence Index

**State date:** 2026-07-18, Australia/Sydney.

## Identity and isolation

| Evidence | Result | Status |
|---|---|---|
| Connected app | `CS Selector & Engine v2` / ControlStack Selector and Engine Lane | VERIFIED |
| Root | `C:\ControlStack_Worktrees\selector-engine` | VERIFIED |
| Branch | `lane/selector-engine` | VERIFIED |
| MCP/runtime | 8000 / 8788 | VERIFIED configuration |
| Gate | `selector-engine` | VERIFIED |
| Write/stage | enabled only within allowed lane globs | VERIFIED |
| Commit/push | enabled and gated | VERIFIED |
| Arbitrary shell/delete/movement/cross-root copy | disabled | VERIFIED |
| Main and other worktrees writable | no exposed writable root | VERIFIED app boundary |

## Git baseline

| Evidence | Value | Status |
|---|---|---|
| Pre-memory HEAD | `08df070890300058353cc621c1383f16492063f1` | VERIFIED |
| Subject | `Fix wildcard selector system applicability` | VERIFIED |
| Pre-memory status | 0 staged, 0 modified, 0 untracked, 0 deleted | VERIFIED |
| Ahead/behind numeric value | not exposed | UNKNOWN |

## Relevant commits

- `6e5e6cee398e1dd1e82d331c81a719625e0d076b` — selected-project source-backed optic-efficiency Engine boundary.
- `08df070890300058353cc621c1383f16492063f1` — wildcard system applicability.
- `3d1d9f8e1902a47f4c2f86bb8312f61194981e30` — reference snapshot/index cache.
- `17ff4521ec137a09d198c7f1a74b1e689db5d7b4` — live direct Control/Protocol authority intersection.
- `d54881102d0840d5f779bba36a4ad7f1b34787c2` — direct-only Control/Protocol applicability.
- `40d8254849e923cb9f8471c2f26ae47b8eede979` — cold-boot source arbitration.
- `9645f6cfa254ee11b8c5af143b5cc37eff53e384` — first read-only selected-project Engine run.
- `acb06570b7084d92404f14b774337336c1c770ee` — read-only lifecycle/no-write boundary.
- `4ec5953636a7d43222d583aa1f7c1b7a246f7456` — server-owned registration boundary.
- `0e5ef76e585f875ba72c8cb9e59ce084160bd08b` — Engine client transport baseline.

Commit hashes and subjects are VERIFIED. Behaviour beyond the subject requires tests or live evidence.

## Gate and live receipts

- Pre-memory `selector-engine`: 100 passed, 0 failed — REPORTED accepted receipt.
- Post-documentation gate, commit, and push — recorded by the commit containing this index and its execution receipt.
- Length-feasibility boundary commit: `6e5e6cee398e1dd1e82d331c81a719625e0d076b` — VERIFIED committed and pushed to `lane/selector-engine`.
- Named gate on the committed parcel: `selector-engine`, 102 passed, 0 failed, exit code 0 — VERIFIED.
- Root cause: the nearest-length error masked zero board W/mm because the selected-project candidate omitted both usable current and selected-optic source-backed efficiency — VERIFIED by diagnostic exact-mode execution.
- Live internal seam after source-backed efficiency binding: active RuntimeData loaded read-only; donor `run_engine` attempted; `success: true`; `run_count: 1`; one segment, three boards, one zone; filesystem/audit writes false; RuntimeData mutation false; persistence/generation flags false — VERIFIED.
- Runtime 8788 root status: reachable at `http://127.0.0.1:8788` — VERIFIED. Final selected-and-saved project registration/invocation receipt remains UNKNOWN.
- Next worker: `CS-SELECTOR-E2E-RUNTIME-8788-ACCEPTANCE-01`.

## Historical reports

Reports targeting `C:\ControlStack_Runtime`, branch `main`, or runtime 8787 are historical coordination evidence. They do not override the current verified lane identity.

## Evidence retention rule

Every completed worker updates this index with:

- exact commit;
- named gate counts and exit code;
- live receipt when applicable;
- starting and ending Git state;
- paths changed;
- status classification and timestamp.

## 2026-07-18 — Runtime 8788 saved-project acceptance attempt

- Worker: `CS-SELECTOR-E2E-RUNTIME-8788-ACCEPTANCE-01`.
- Starting HEAD: `ca973ce76ca8183b3255adc182da04cfba19cc89`; starting Git inventory: 0 staged, 0 modified, 0 untracked, 0 deleted — VERIFIED.
- Feature commit in starting history: `6e5e6cee398e1dd1e82d331c81a719625e0d076b` — VERIFIED.
- Runtime root receipt: 8788 reachable; current host-transport route mounted — VERIFIED.
- Safe selected-project lookup probes: `project-alpha`, `project-bravo`, and `project-charlie` each returned HTTP 422, `requestAccepted: true`, `serverOwnedRevisionChecked: true`, and blocker `selected-project-shell-invoke-transport-active-server-revision-invalid` — VERIFIED.
- Registration receipt: NOT DISPATCHED. The exact accepted local save envelope and source projection required by the registration contract were absent; creating them from fixtures was prohibited — VERIFIED boundary.
- Selected-project/revision attribution: no active server revision exists for any supported current project identity — VERIFIED.
- Useful safe run row: unavailable because execution stopped before source reconstruction and capability invocation — BLOCKED by precondition.
- No-write receipt on every live probe: `filesystemWriteAttempted`, `auditJsonlWriteAttempted`, `runtimeDataMutated`, `selectedResultPersisted`, `runTableGenerated`, `iesGenerated`, and `outputGenerated` were all false — VERIFIED.
- Active RuntimeData probe fingerprint: `266de269e3e8f8b7191e4653d45580c251eb46025411574e0d1f2a27daca209d`; loaded read-only, write disabled, write not attempted, path and raw rows not returned — VERIFIED.
- Changed paths: `LANE_STATE.md`, `WORK_QUEUE.md`, `EVIDENCE_INDEX.md`, and `SESSION_HANDOFF.md` only. No feature code changed.
- Gate: `selector-engine`, 102 passed, 0 failed, exit code 0 — VERIFIED.
- Documentation evidence commit: `0ad8bee0995c29bb15c227e6f885038ecd105001`; push `ca973ce..0ad8bee` to `origin/lane/selector-engine` succeeded — VERIFIED.
- Post-gate live repeat: all three supported current project identities reproduced HTTP 422 and `selected-project-shell-invoke-transport-active-server-revision-invalid`; no capability or write/mutation/generation flag became true — VERIFIED.
- Post-gate RuntimeData fingerprint remained `266de269e3e8f8b7191e4653d45580c251eb46025411574e0d1f2a27daca209d` — VERIFIED.
