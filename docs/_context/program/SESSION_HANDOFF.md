# Program & Integrate Session Handoff

Status: LAB THERMAL RECEIPT ACCEPTED; SEL-018 READY; THERM-P1 AND THERM-E1 ADMITTED  
Lane: `program-integrate`  
Branch: `lane/program-integrate`

## Current truth

LAB-038 through LAB-042 are complete and pushed. The final Lab gate passed 262/262. Program accepts the corrected version-2 Lab producer shape while preserving `authorityState: null`.

The current readable Runtime mapper has no `selectedRoomTaC`, so SEL-018 is not yet accepted as implemented.

The restarted Selector app now resolves to the isolated Selector worktree on `lane/selector-engine`, with commit/push enabled and a clean tree. Its feature paths are available, but the live allowlist still omits the lane-document scope already present in the current Program manifest. Refresh the installed service configuration and reconcile the Selector queue before implementation. Do not edit main or mix the unfinished runtime-port work into this sequence.

## Exact order

1. Complete SEL-018 in the isolated Selector worktree using only the approved mapper and focused test. Selector passes the source-backed selected room temperature only and performs no thermal calculation.
2. Complete THERM-P1 using only the new Program thermal-evidence adapter module and focused test. It validates optic/evidence binding and emits the accepted Program bundle without thermal arithmetic.
3. Complete THERM-E1 using only the new Engine thermal execution module and focused test. Engine applies the rise exactly once and delegates to the existing curve interpolation contract.
4. Run final Program cross-lane acceptance before any stability, downstream-artifact or main-promotion decision.

## Mandatory proof

Use two optic-bound accepted bundles with different measured rises but the same selected room, current and curve. Both lookup temperature and verified lm/m must change. Reject caller-supplied derived or lookup temperatures, missing or unbound evidence and contradictory measured triplets.

## Parcel files

SEL-018:

- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `tests/selectorReadonlyEngineCandidateMapper.test.js`

THERM-P1:

- `packages/workspace-kernel/labThermalEvidenceProgramAdapter.js`
- `tests/labThermalEvidenceProgramAdapter.test.js`

THERM-E1:

- `packages/workspace-kernel/runtimeThermalLumenExecution.js`
- `tests/runtimeThermalLumenExecution.test.js`
