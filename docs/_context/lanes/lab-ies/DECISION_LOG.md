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