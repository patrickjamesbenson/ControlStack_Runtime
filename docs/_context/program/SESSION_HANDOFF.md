# Program & Integrate Session Handoff

Status: LAB-042 GATE-INCLUDED TEST SCOPE APPROVED  
Lane: `program-integrate`  
Branch: `lane/program-integrate`

## Decision

LAB-038 through LAB-041 are complete and green. The originally approved new LAB-042 test file is not executed by the fixed Lab gate, so it cannot prove its own assertions.

LAB-042 is amended to exactly the existing gate-included keyword migration regression test. The new thermal test file must not be created.

All final-guard acceptance remains unchanged: corrected source mappings, exact measured triplet, varied uplift proof, contradiction rejection, three version-2 schemas, absence of deprecated output names and Lab-owned Engine calculations, bounded legacy source names, and unchanged sealed internal-ambient meaning.

No production source, fixture or gate configuration change is authorised.

## Exact next action

Lab implements the one-file final guard, runs the full Lab gate, pushes it, and closes the corrected thermal batch.