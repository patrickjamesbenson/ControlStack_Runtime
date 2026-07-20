# Program & Integrate Session Handoff

Status: CORRECTED LAB THERMAL SEMANTICS ENVELOPE APPROVED  
Lane: `program-integrate`  
Branch: `lane/program-integrate`

## Decision

Program approved the pushed Lab version-1 corrected thermal semantics envelope unchanged after verifying the binding 25°C reference room, 35°C absolute internal and 10°C rise interpretation.

The five Lab parcels remain separate and sequential. LAB-038 is the sole ready Lab parcel. LAB-039 through LAB-042 are approved but dependency-blocked.

Lab must use the measured triplet fields `referenceRoomTaC`, `referenceInternalTaC` and `opticThermalRiseTaC`, validate them exactly, vary legacy `optic_uplift_ta_c` for the per-optic proof, and emit no Lab-owned derived/lookup temperature or verified lm/m.

The Lab working projection keeps thermal authority unresolved. Engine work remains blocked pending accepted Selector and later Program-bound thermal evidence receipts.

## Exact next action

Lab records this approval and runs LAB-038 through LAB-042 sequentially under the standing worker, with separate feature and documentation checkpoints and the full Lab gate after every parcel.