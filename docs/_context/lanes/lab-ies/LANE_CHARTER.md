# Lab/IES Lane Charter

## Status

This document is the durable charter for the ControlStack Lab and IES Authority Lane.

Current repository evidence always overrides historical handoff statements. Historical material remains useful as reported context, but it must not be represented as a current observation until rechecked through the connected lane app.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Repository root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Required branch: `lane/code-pilot-lab`
- Primary bounded gate: `lab-ies`
- Primary owned implementation paths:
  - `packages/lab-kernel/**`
  - `tests/lab-kernel/**`
- Lane-memory path:
  - `docs/_context/lanes/lab-ies/**`

## Mission

The lane owns the governed lifecycle for trusted one-millimetre IES references and the Lab processes that produce them. Its purpose is to convert source photometry and controlled Lab evidence into deterministic, traceable and downstream-safe reference artifacts.

The lane must:

1. preserve source and derivation traceability;
2. keep non-authoritative working state separate from authority records;
3. canonicalise and cryptographically bind authority content;
4. approve and seal only records that satisfy fail-closed governance rules;
5. expose bounded downstream contracts rather than private Lab state;
6. keep prototype, donor and staging material separate from accepted production work;
7. remain isolated from Selector, Runtime and Engine implementation ownership except through explicit contracts.

## Principal contracts

- Working-session schema: `controlstack.lab.ies-working-session.v1`
- Rich authority schema: `controlstack.lab.one-mm-ies-record.v1`
- Sealed reference DTO schema: `controlstack.lab.reference.1mm.v1`
- Working slots: `A`, `B`, `MERGED`
- Working sessions are non-authoritative.
- Approved sealed DTOs are deterministic, deeply immutable and one-way.

## Canonical outgoing keyword profile

The outgoing profile contains exactly these 16 fields in this order:

1. `TEST`
2. `TESTLAB`
3. `ISSUEDATE`
4. `MANUFAC`
5. `LUMCAT`
6. `LUMINAIRE`
7. `LAMP`
8. `_CRI`
9. `_COLORTEMP`
10. `_INTERNAL_AMBIENT_TA_C`
11. `_DRIVER`
12. `_DRIVER_SETTING`
13. `_GEAR_TRAY_REF_ID`
14. `_OPTIC_REF_ID`
15. `_EMERGENCY_VERIFIED`
16. `_EWIS_CARTRIDGE_VERIFIED`

The supplementary outgoing keyword profile is empty.

`_INTERNAL_AMBIENT_TA_C` means the measured internal assembly ambient during the authority test. It is not the test-room ambient and not a rated ambient value.

Emergency and EWIS values are independent assembly verification outcomes. They are not inherited capability flags from GT or OPT parents.

## Authority and cryptographic boundary

- Canonical JSON follows the accepted RFC 8785-style profile.
- Authority hashing uses domain-separated SHA-256 projections.
- SHA-256 is supplied through an injected asynchronous digest provider returning exactly 32 bytes.
- Browser-reachable production authority modules must not import Node cryptography.
- Authority digests are raw lower-case 64-character hexadecimal strings.
- Diagnostic hashes and fingerprints, including FNV, cyrb, `safe-*`, `rec-*` and `prov-*`, are excluded from authority SHA fields.
- Raw evidence bodies, raw working bytes and local filesystem paths are excluded from downstream governed artifacts.
- Raw local paths, file URLs, UNC paths, absolute paths and traversal paths are rejected where governed artifact references are required.

## Approval, unresolved fields and sealing

- Approval binds the authority hash, approver, exact UTC-millisecond time and canonical ratified-check decisions.
- Compatibility-only approvals are valid lifecycle states but are not sealable.
- The complete canonical unresolved-field inventory remains in the rich authority record.
- `/labForm/<field>` may be non-blocking only when the corresponding row exists and every matching row explicitly has `gatesReference === false`.
- Unknown, malformed, missing-row, ambiguous, cryptographic and source-binding unresolved pointers fail closed.
- Sealed DTO fields are fixed, including explicit `null` and `[]` values.
- The sealed DTO is deeply immutable.
- No reverse-authority reconstruction API is permitted.

## MERGED boundary

Accepted MERGED coverage currently includes the authority, approval, derivation, sealing and handoff envelope.

MERGED records:

- use `null` origin fields;
- require derivation binding;
- treat parent order as provenance-significant in derivation version 1;
- do not by themselves prove that the final governed candela-and-power merge has been completed.

Any change to nested MERGED policy, parent-order significance, duplicate-parent handling, cycle identity, allocation timing or N-parent semantics requires a new owner decision.

## Donor and staging boundaries

- `C:\ControlStack_Lab` is behavioural-specification evidence only.
- `C:\ControlStack_Runtime\_staging` is an older migration mirror.
- Neither source may be copied or promoted wholesale.
- Diagnostic fingerprint implementations from donor material must not become authority code.
- Superseded Lab forms must not replace the accepted 16-field contract.

## Cross-lane boundary

The following paths are Selector-owned and must not be modified, restored, discarded or included in a Lab checkpoint:

- `packages/workspace-kernel/selectorReferenceOptionsService.js`
- `tests/selectorCascadeCorrectness.test.js`

Engine should consume sealed DTOs, safe handoff projections or generated project IES artifacts. Engine must not consume private rich-authority state, raw working bytes or diagnostic hash fields.

## Change discipline

- Every implementation parcel must be path-confined and independently classified before staging.
- Accepted work must not be committed together with prototypes, unexplained support files or other-lane changes.
- The `lab-ies` gate must pass after each accepted parcel and before gated commit/push.
- Existing dirty feature files must not be reset, restored, cleaned or silently absorbed into documentation commits.
- Potentially destructive support scripts, including `scripts/clear_chaff.ps1`, must not be executed during audit or checkpoint work.

## Current accepted foundation

The authority rebuild is accepted through Slice 4B:

- Slice 1: working record, canonical keywords and normalisation foundation;
- Slice 2: canonical keyword migration;
- Slice 3: rich authority lifecycle;
- Slice 4A: canonical JSON and authority fingerprints;
- Slice 4B: sealed reference DTO and cryptographic sealing.

Whole-program acceptance is not yet complete. The sealed-reference builder audit, final governed reference merge, complete provenance/resolver publication and downstream integration remain future work.