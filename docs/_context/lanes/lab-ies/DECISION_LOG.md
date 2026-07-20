# Lab/IES Decision Log

This log records durable owner decisions. Current repository evidence may update state and evidence, but these decisions must not be silently reopened or weakened.

## DL-001 — Current lane identity

**Status:** Accepted on 2026-07-17.

The connected app identity `ControlStack Lab and IES Authority Lane` is the correct current app for the Lab/IES lane.

- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`

The historical app-name difference is closed and is not a blocker.

## DL-002 — Exact canonical keyword contract

**Status:** Locked.

The outgoing keyword profile contains exactly 16 fields in the accepted order:

`TEST`, `TESTLAB`, `ISSUEDATE`, `MANUFAC`, `LUMCAT`, `LUMINAIRE`, `LAMP`, `_CRI`, `_COLORTEMP`, `_INTERNAL_AMBIENT_TA_C`, `_DRIVER`, `_DRIVER_SETTING`, `_GEAR_TRAY_REF_ID`, `_OPTIC_REF_ID`, `_EMERGENCY_VERIFIED`, `_EWIS_CARTRIDGE_VERIFIED`.

The supplementary profile is empty.

Aliases, extras, missing fields and reordering fail validation.

## DL-003 — Internal ambient meaning

**Status:** Locked.

`_INTERNAL_AMBIENT_TA_C` means measured internal assembly ambient during the authority test.

Rejected alternative: historical `_AMBIENT_TA_C`, because it is ambiguous with room ambient or rated ambient.

## DL-004 — Emergency and EWIS ownership

**Status:** Locked.

Emergency and EWIS values are independent assembly verification outcomes.

Rejected alternative: inheriting capability flags from parent GT or OPT references.

## DL-005 — Canonical authority format

**Status:** Locked.

Authority content uses the accepted RFC 8785-style canonical JSON profile:

- deterministic UTF-8;
- no Unicode normalisation;
- negative zero canonicalised to zero;
- lexical G11 strings preserved;
- insertion-order-independent object encoding;
- array order preserved;
- ambiguous, unsupported or cyclic values rejected.

## DL-006 — Cryptographic provider boundary

**Status:** Locked.

Authority hashing uses an injected asynchronous SHA-256 provider returning exactly 32 bytes.

Browser-reachable authority modules do not import Node cryptography.

Digests are raw lower-case 64-character hexadecimal strings.

Rejected alternative: direct `node:crypto` dependency in browser-reachable production code.

## DL-007 — Structured hash domains

**Status:** Locked.

The authority boundary has four fixed structured hash domains:

1. authority content;
2. approval binding;
3. reference DTO;
4. derivation.

Diagnostic hashes such as FNV, cyrb, `safe-*`, `rec-*` and `prov-*` are excluded from authority SHA fields.

## DL-008 — Approval binding

**Status:** Locked.

Approval binds:

- exact authority hash;
- approver identity;
- exact UTC-millisecond approval time;
- canonical ratified-check decisions.

Compatibility-only approval remains a valid lifecycle state but is non-sealable.

## DL-009 — Unresolved-field classification

**Status:** Locked.

The rich authority record retains the complete canonical unresolved-field inventory.

A `/labForm/<field>` pointer is non-blocking only when the corresponding Lab form row exists and every matching row explicitly sets `gatesReference === false`.

Unknown, malformed, missing-row, ambiguous, cryptographic and source-binding pointers block sealing.

Rejected alternative: special-case allowlists for individual keywords.

## DL-010 — Sealed DTO contract

**Status:** Locked.

The sealed reference DTO:

- has fixed fields, including explicit `null` and `[]` values;
- is deterministic;
- is deeply immutable;
- strips diagnostic, private, raw-evidence and runtime-owned data;
- has no reverse-authority reconstruction API.

Seal context cannot override authority content.

## DL-011 — MERGED authority envelope

**Status:** Locked for derivation version 1.

MERGED records:

- have `null` origin fields;
- require derivation binding;
- bind ordered parents;
- treat parent order as provenance-significant;
- require fresh approval and sealing.

Current accepted MERGED coverage is the authority/approval/derivation/sealing/handoff envelope.

This does not prove completion of the final governed candela-and-power merge.

Any future change to nested MERGED support, parent ordering, duplicate parents, cycle identity, allocation timing or N-parent semantics requires an explicit new decision.

## DL-012 — Builder ownership direction

**Status:** Accepted direction; implementation ownership still requires audit.

The canonical project builder name is `buildProjectIes`.

Future project IES construction should consume the sealed DTO rather than reconstructing or accepting private rich authority by default.

The coexistence of `iesFromReference.js` and `iesProjectIes.js` requires a read-only ownership audit before further builder work.

## DL-013 — Donor and staging use

**Status:** Locked.

- `C:\ControlStack_Lab` is behavioural specification only.
- `C:\ControlStack_Runtime\_staging` is an older migration mirror.
- Neither is a production source to copy wholesale.
- Demo diagnostic fingerprints must not be promoted into authority code.
- Superseded Lab forms must not replace the accepted 16-field contract.

## DL-014 — Lane seam

**Status:** Locked.

Engine may consume:

- sealed reference DTOs;
- safe handoff projections;
- generated project IES artifacts.

Engine must not consume:

- private rich-authority state;
- raw working bytes;
- diagnostic hash fields.

## DL-015 — Selector exclusion

**Status:** Locked.

These paths are Selector-owned and out of Lab scope:

- `packages/workspace-kernel/selectorReferenceOptionsService.js`
- `tests/selectorCascadeCorrectness.test.js`

They must not be modified, restored, discarded or included in a Lab checkpoint.

## DL-016 — Checkpoint discipline

**Status:** Locked.

- Use path-confined staging.
- Keep accepted slices separate from prototypes and unexplained support files.
- Preserve unrelated dirty work.
- Run the bounded `lab-ies` gate before gated commit/push.
- Do not reset, restore or clean to simplify a mixed worktree.

## DL-017 — Current gate evidence

**Status:** Current evidence as of 2026-07-17.

The connected bounded gate passed:

- tests: 147;
- passed: 147;
- failed: 0;
- cancelled: 0;
- skipped: 0;
- todo: 0;
- exit code: 0.

The earlier reported HTTP 502 is not the current state. Reopen the infrastructure defect only if it recurs.

## DL-018 — Historical evidence precedence

**Status:** Locked.

Recovered handoffs remain valuable context, but current repository commands and current test execution override stale historical counts, app names, service failures and worktree claims.

## DL-019 — LAB-017 seam envelope required before approval

**Status:** Program & Integrate review outcome recorded on 2026-07-19; implementation remains blocked.

Program & Integrate has not approved `LAB-017-reference-resolver-contract` for implementation. Approval requires a committed seam envelope that defines the exact contract, scope, compatibility impact, rollback and success/failure tests.

The proposed envelope is:

- `docs/_context/lanes/lab-ies/LAB-017_SEAM_ENVELOPE.md`;
- seam version: `1`;
- implementation scope after approval: exactly `packages/lab-kernel/ies-toolkit/nvbReference.js` and `tests/lab-kernel/nvbReference.test.js`;
- Program retains serial allocation, resolver host, route-to-storage mapping, persistence, authentication, deployment and endpoint ownership;
- LAB-017 remains `blocked` until Program & Integrate records approval of the committed envelope checkpoint.

No LAB-017 implementation may start merely because the envelope exists. The queue may change to `ready` only after the approval record identifies the committed envelope and exact implementation scope.

## DL-020 — Branch-HEAD lane-memory synchronisation

**Status:** Locked on 2026-07-19.

Before any queue item is selected, the worker must compare the `Recorded branch HEAD` in `LANE_STATE.md` with the actual HEAD of `lane/code-pilot-lab`.

- If they match, normal queue selection may continue.
- If they differ, no implementation may start. The worker replies exactly `STOPPED - lane state is stale. Recorded HEAD <x>, actual HEAD <y>.` and reconciles lane memory before anything else.
- The worker that discovers the mismatch must not execute a queue item in the same run.
- Reconciliation must classify the unmatched commit, restore queue and evidence truth, run the full `lab-ies` gate, and commit/push only lane-memory changes.

A Git commit cannot contain its own final hash. Therefore `Recorded branch HEAD` is maintained as one deliberate post-push working-tree marker: after every successful documentation commit and push, the worker updates only that field to the new actual HEAD and leaves the single edit unstaged. This marker is expected, must not enter feature staging, and exists solely to detect a worker ending between feature and documentation closeout or any other unrecorded branch advance.

## DL-021 — LAB-017 version-1 seam approval

**Status:** Approved unchanged by Program & Integrate on 2026-07-19.

Program & Integrate approves `LAB-017-reference-resolver-contract` under the committed version-1 envelope without amendment.

Approval covers only:

- the defined public interface and exact data shapes;
- exactly `packages/lab-kernel/ies-toolkit/nvbReference.js` and `tests/lab-kernel/nvbReference.test.js`;
- the named protected legacy Lab consumers and accepted compatibility break;
- the recorded reverse-order rollback sequence;
- the specified success, rejection, immutability, leak-prevention and static-boundary tests.

Program retains production allocation, resolver hosting, routing, persistence, authentication, deployment and endpoint ownership. Any change to the approved envelope requires a new seam decision.

LAB-017 is authorised to move from `blocked` to `ready`, and one bounded Lab worker may proceed.

## DL-022 — LAB-017 final Program acceptance

**Status:** Accepted and closed by Program & Integrate on 2026-07-20.

Program & Integrate accepted the exact immutable LAB-017 completion receipt recorded in `SESSION_HANDOFF.md` without amendment.

Program reported:

- final acceptance closed;
- Program gate passed 45/45;
- the Program acceptance checkpoint was committed and pushed;
- the Program tree was clean.

This closes LAB-017 acceptance only. Promotion to main remains a separate Program & Integrate action. LAB-018 remains blocked pending its own seam envelope and approval. No LAB-017 interface, implementation, ownership, compatibility, rollback or validation field is reopened by this acceptance record.

## DL-023 — Consolidated batch seam envelope for LAB-018 to LAB-023 and LAB-027

**Status:** Proposed on 2026-07-20; awaiting Program & Integrate batch decision.

One consolidated version-1 seam envelope now covers:

- LAB-018 NVB resolution;
- LAB-019 component projection;
- LAB-020 document register;
- LAB-021 emergency selection;
- LAB-022 governed reference composition;
- LAB-023 NVB Lab adapter;
- LAB-027 request/report workflow.

The envelope fixes each item's exact public contract, implementation and focused-test files, ownership boundary, known compatibility break, rollback sequence, success tests and failure tests. All seven remain blocked until approval is recorded. A batch approval may authorise multiple items, but queue dependency order and the single-top-ready rule remain mandatory.

LAB-022 requires individual policy treatment inside the same batch decision. Program & Integrate must expressly ratify version-1 binary composition: exactly two direct non-MERGED unique parents, order-significant provenance, exact coincident grids without interpolation, and allocation/authority/approval/sealing outside the kernel. If that sub-decision is not ratified, the other six may be approved while LAB-022 remains blocked.

## DL-024 — Seven-item batch seam approval and single-active sequence

**Status:** Approved and recorded on 2026-07-20.

Program & Integrate approved all seven seams in consolidated envelope version 1. Program reported its gate passed 45/45, the decision was committed and pushed, and the Program tree was clean.

The six ordinary seams—LAB-018, LAB-019, LAB-020, LAB-021, LAB-023 and LAB-027—are approved unchanged.

For LAB-022, Program expressly ratified:

- exactly two unique, non-MERGED parents;
- immutable order-significant provenance;
- exactly matching photometric grids with no interpolation or resampling;
- allocation, authority construction, approval and sealing outside the kernel;
- fail-closed rejection of duplicate or pre-composed parents, reordered or missing provenance, grid mismatch and any attempted governance-boundary crossing.

Only LAB-018 may move to `ready`. LAB-019, LAB-020, LAB-021, LAB-022, LAB-023 and LAB-027 remain approved but sequence-blocked until the active parcel is completed and closed out. No parallel or combined implementation is authorised. The earlier LAB-018 approval hold is superseded.

## DL-025 — Five-parcel standing-worker batches and human-observation boundary

**Status:** Locked on 2026-07-20.

A standing Lab worker no longer stops after every successful parcel. After each feature checkpoint and documentation closeout, it immediately takes the next single eligible `ready` item and repeats, up to a maximum of five consecutive parcels in one run.

This changes review cadence, not parcel discipline:

- every parcel remains separate and sequential;
- every parcel retains its own authorised files, focused validation, full `lab-ies` gate, exact staged-file equality, feature commit, documentation closeout and lane-only pushes;
- the branch-HEAD marker is refreshed after every documentation push and rechecked before the next parcel;
- seam approval remains item-specific and mandatory;
- the orchestrator reviews at seams, human-observation boundaries and worker-batch boundaries rather than after each routine parcel.

The batch stops immediately at the first of these successful boundaries:

- seam approval required;
- lane state stale;
- any focused, full or gated commit gate failure;
- an authorised file contains behaviour outside the item's stated scope;
- queue empty;
- acceptance requires observation of the running application, a browser action or real-world judgement that repository evidence alone cannot prove.

For the final boundary, repository evidence must never be treated as a substitute for human observation. The worker must not guess, must not mark the item `done`, and must reply `NEEDS YOU` with exact click-by-click steps before ending the batch.

## DL-026 — Stable charter authority for standing role prompts

**Status:** Locked on 2026-07-20.

`LANE_CHARTER.md` is the sole authoritative repository home for both the standing worker prompt and the standing orchestrator prompt.

This closes the prior durability defect where `SESSION_HANDOFF.md` was the only prompt home and could lose the worker prompt during routine parcel closeout. `SESSION_HANDOFF.md` may retain the current session state and exact one-line launch instructions, but it must not contain the only copy of either role prompt.

The standing worker prompt retains the five-parcel model, all existing guards and the human-observation boundary. The standing orchestrator prompt is now durably defined for the first time and requires the orchestrator to:

- use only the connected Lab app;
- verify lane identity and branch-HEAD synchronisation;
- read all lane context;
- review at batch, seam and human-observation boundaries;
- own queue ordering and lane-memory truth without executing feature parcels;
- preserve seam approval, exact scope, full-gate, staged-file and dirty-worktree protections;
- treat human observation as a hard incomplete boundary;
- checkpoint only bounded documentation changes through the gated lane path.

A fresh role may now start from either exact one-line instruction recorded in the charter:

```text
Read docs/_context/lanes/lab-ies/LANE_CHARTER.md and act as the standing worker per the prompt recorded there.
```

```text
Read docs/_context/lanes/lab-ies/LANE_CHARTER.md and act as the standing orchestrator per the prompt recorded there.
```

Neither role may invent or reconstruct a replacement prompt from chat history when the charter is available.

## DL-027 — LAB-029 provenance publication seam

**Status:** Approved unchanged by Program & Integrate on 2026-07-20.

The Lab orchestrator bounded LAB-029 as a presentation-only seam over the already approved safe reference identity, host-free resolver-path and evidence-capability contracts.

The proposed version-1 envelope is `LAB-029_SEAM_ENVELOPE.md` and permits implementation only in:

- `packages/lab-kernel/ies-toolkit/provenance.html`;
- `packages/lab-kernel/ies-toolkit/provenance_explorer.html`;
- `packages/lab-kernel/ies-toolkit/luminaire_provenance.html`.

The proposal fixes one read-only publication view with two explicit modes:

- governed mode consumes only Program-supplied safe identity and availability projections;
- offline fixture mode consumes only committed safe fixture projections and must remain visibly `OFFLINE DEMO — UNAPPROVED`.

The proposal does not move resolver hosting, route-to-storage mapping, persistence, evidence acceptance, sealing, allocation, authentication, deployment or endpoint ownership into Lab. It prohibits hard-coded hosts, raw-body traversal, local-path publication, diagnostic authority claims, fabricated seals, current-time generation and inferred emergency/EWIS verification.

Program & Integrate approved version 1 unchanged after a 45/45 Program gate. The approval is recorded in the latest Program commit titled `docs(program): approve LAB-029 provenance seam`; Program reported a clean pushed state and no feature implementation, main promotion or downstream activation.

LAB-029 is authorised to move from `blocked` to the single top `ready` item. The exact three-file presentation-only scope and every recorded ownership boundary remain unchanged. Any amendment requires a new seam decision.

## DL-028 — Canonical-keyword migration guard correction before LAB-033

**Status:** Approved and completed on 2026-07-20.

Program & Integrate approved one bounded test-only correction under the committed and pushed decision `docs(program): approve Lab keyword migration correction`; Program reported gate 45/45 passed.

The sole authorised implementation file was:

```text
tests/lab-kernel/iesKeywordMigration.test.js
```

The correction removed only the stale Main Bench requirement for the retired editable `sysTa` ambient write and literal dependence on the retired `canonicalKeywordRows(...)` helper shape. It retained the exact ordered 16-keyword profile, rejection of `_AMBIENT_TA_C`, aliases and supplementary keywords, Main Bench consumption of the committed canonical keyword contract, sealed-reference ownership and non-editability of `_INTERNAL_AMBIENT_TA_C`, and all generator, merge, summary, project-adapter and project-builder vocabulary guards.

No production module, bench implementation, authority contract, sealed-reference schema, Selector, Runtime, Engine or Program implementation was authorised or changed. The corrective checkpoint is confirmed on origin after a 255/255 gate. LAB-033 is restored as the sole ready item; the final cross-cutting keyword-guard parcel remains queued until after LAB-033 is committed.

## DL-029 — LAB-035 Selector contract seam approval

**Status:** Approved unchanged by Program & Integrate on 2026-07-20.

Program & Integrate approved `LAB-035_SEAM_ENVELOPE.md`, version 1, and the exact one-file implementation boundary. Program reported gate 46/46 passed and the approval decision was committed and pushed.

The approved parcel is confined to one Lab-only read-only presentation file and reuses only the approved safe reference identity, safe runtime handoff and Selector factory-approved-input readiness projections. It does not import or execute Selector source, derive readiness, compute options, invoke Engine, generate IES, create authority, add routes or persist state.

LAB-035 may move to the sole top `ready` item. LAB-036 and later parcels remain sequence-blocked. Any contract, ownership, field-shape or scope amendment requires a new Program & Integrate decision.

## DL-030 — Corrected thermal source semantics and affected-parcel hold

**Status:** Corrected five-parcel Lab envelope approved unchanged by Program & Integrate on 2026-07-21.

Program & Integrate corrected and superseded the thermal ruling under the pushed decision `docs(program): correct thermal source field semantics` after a 46/46 Program gate.

The sole active meaning is:

- legacy `room_ta_c` is the measured reference-room condition and maps to `referenceRoomTaC`;
- legacy `optic_internal_delta_ta_c` is the measured absolute internal condition and maps to `referenceInternalTaC`;
- legacy `optic_uplift_ta_c` is the measured rise and maps to `opticThermalRiseTaC`;
- the measured triplet must satisfy `referenceRoomTaC + opticThermalRiseTaC === referenceInternalTaC` exactly after canonical decimal normalisation;
- Engine alone applies the rise once to the Selector-owned user room ambient;
- Lab does not derive or publish user-specific internal temperature, curve lookup temperature, clamping, board temperature or verified lm/m;
- the semantic name `opticInternalDeltaTaC` is prohibited in new Lab output contracts;
- the sealed `_INTERNAL_AMBIENT_TA_C` keyword remains the authority-test internal measurement.

Program explicitly recorded that the ruling alone authorised no feature implementation. The Lab orchestrator created `LAB-038_042_THERMAL_SEMANTICS_SEAM_ENVELOPE.md`, version 1, with five separate sequential parcels covering resolution, component projection, Lab working projection, display labels and a final regression guard. Program & Integrate approved that envelope, then narrowly amended LAB-038 after the full Lab gate proved the resolver-only schema bump could not be checkpointed because the adapter imports the resolver schema constants. Envelope version 2 therefore authorises the exact four-file atomic transition while keeping LAB-040 separate. LAB-038 through LAB-041 are complete. Program approved the narrow LAB-042 gate-included test-file amendment under `docs(program): amend LAB-042 gate-included test scope` after a 46/46 gate. The final guard must use only `tests/lab-kernel/iesKeywordMigration.test.js`; the superseded new thermal test file must not be created. LAB-042 is the sole ready item.