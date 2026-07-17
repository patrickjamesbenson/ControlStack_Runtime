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
- Current single-slice closeout — BLOCKED at first reproducible Engine run-length feasibility boundary.
- Live internal seam evidence: active RuntimeData loaded read-only; donor `run_engine` attempted; filesystem/audit writes false; RuntimeData mutation false; safe summary `success: false`, `run_count: 0`, first error `length_pref="nearest" but no feasible run length found within ±28000mm`.
- Next worker: `CS-SELECTOR-E2E-LENGTH-FEASIBILITY-BOUNDARY-01`.

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
