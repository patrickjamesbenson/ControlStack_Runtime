# Program & Integrate Session Handoff

Status: SELECTIONS-ONLY ENGINE BOUNDARY BINDING; SEL-018 READY; THERM-P1 AND THERM-E1 ADMITTED  
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

## Binding boundary supersession

Engine caller requirements and execution eligibility are the selection set only. Human/customer/company identity, project/deal/quote, ownership, timeline, handoff, save, registration, active revision, persistence and client Tier are outside governance and cannot block computation.

The original flow's customer/job/project/metadata fields remain optional outer traceability only. They are stripped or quarantined before the computational kernel and must not affect eligibility or output.

SEL-019's registration-before-Engine sequence is superseded. SEL-002 and SEL-003 do not block Engine calculation. SEL-018 remains room-selection transport only. THERM-P1 remains internal technical evidence binding, and THERM-E1 retains the one-time thermal rise and varied-optic output proof.

Existing governance gates at the Engine boundary are deleted or bypassed when commissioned; they are not repaired. Main runtime-port work remains excluded.
