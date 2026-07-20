# Program & Integrate Session Handoff

Status: LAB-038 ATOMIC TRANSITION AMENDMENT APPROVED  
Lane: `program-integrate`  
Branch: `lane/program-integrate`

## Decision

The mandatory Lab gate proved that a resolver-only version-2 checkpoint is impossible because the Lab adapter imports the resolver schema constants directly.

LAB-038 is amended to exactly four files: the resolver module and test plus the Lab adapter module and test.

The adapter change is transition-only. It accepts corrected resolution version 2 and corrected optic input names, keeps its own public projection at version 1, preserves its existing non-thermal output, and publishes no thermal evidence or authority.

LAB-040 remains separately responsible for adapter projection version 2 and the explicit unresolved thermal-evidence object. LAB-038 remains the sole ready Lab item; later parcels remain sequence-blocked.

## Exact next action

Lab completes the four-file LAB-038 checkpoint, runs the full Lab gate, closes its documentation separately, then advances LAB-039.