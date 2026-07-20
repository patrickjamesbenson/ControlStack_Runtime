# ControlStack Engine Output Contract Candidate — Version 1

**Candidate contract ID:** `controlstack.engine.output-contract-candidate.v1`  
**Candidate state:** `candidate_not_stable`  
**Owner:** Selector & Engine lane  
**Review owner:** Program & Integrate  
**Date:** 2026-07-21  

## 1. Purpose

This document defines the first bounded candidate for the interface between the inside technical system and any outside consumer.

The Engine's caller-required and execution-eligibility input is the engineering selection set only. Human identity, customer, company, project, quote, owner, timeline, handoff, entitlement, registration, active revision and persistence state are outside-governance traceability. They may wrap or store a request and result, but they must not be read, required, scored, warned upon or returned by the computational kernel.

This candidate does not declare the Engine output contract stable and does not activate downstream consumers.

## 2. Current producer inventory

### 2.1 Accepted bounded computational result

The accepted thermal slice is:

- schema: `controlstack.runtime.thermal-lumen-execution.v1`;
- version: `1`;
- complete state: `runtime_thermal_lumen_execution_complete`;
- blocked state: `runtime_thermal_lumen_execution_blocked`.

It consumes the accepted Program thermal-evidence bundle, applies the measured optic rise exactly once and delegates to the existing curve parser. Its envelope-independence regression proves that changing outside traceability does not change eligibility or deterministic output.

This is accepted evidence for one bounded result component. It is not by itself the complete Engine output contract.

### 2.2 Diagnostic RunTable domain scaffold

The current RunTable domain scaffold is:

- schema: `controlstack.runtime.engine-runtable.runtable-domain-output-scaffold-summary`;
- version: `1`;
- state: `runtime_runtable_domain_output_scaffold_diagnostic_only`.

It explicitly keeps production RunTable generation, selected-result persistence, donor Engine invocation, routes, endpoints and exact electrical output disabled. It is diagnostic-only producer evidence and is not a production RunTable result.

### 2.3 Persistence-coupled first-narrow row path

The current first-narrow rows path is not accepted as the computational output boundary because it requires a persisted selected-result summary before rows can be emitted. Persistence is an outside consumer and cannot make the Engine eligible.

The path also has a schema collision: `controlstack.runtime.runtable-first-narrow-row.v1` is associated with two incompatible field sets:

1. a fingerprint/token row-shape contract; and
2. a count-based safe first-run summary row.

A stable contract cannot assign two incompatible shapes to the same schema ID and version.

## 3. Candidate boundary

### 3.1 Optional outside wrapper

An outside system may carry:

```json
{
  "traceabilityEnvelope": {
    "user": "outside-only",
    "project": "outside-only",
    "owner": "outside-only",
    "timeline": "outside-only",
    "registrationState": "outside-only"
  },
  "engineRequest": {}
}
```

The wrapper is not part of Engine eligibility. Omitting it or changing every value must leave the Engine response identical for an identical engineering request, except for explicitly external transport identifiers that are never copied into the Engine result.

### 3.2 Candidate Engine request

Proposed request schema:

- schema: `controlstack.engine.selection-set.v1`;
- version: `1`.

Required top-level fields:

```json
{
  "schemaId": "controlstack.engine.selection-set.v1",
  "schemaVersion": 1,
  "selectionSet": {},
  "requestFingerprint": "safe deterministic fingerprint"
}
```

`selectionSet` contains selected or requested engineering values only, including product/system/optic choices, lighting targets, room/environment choices, control/compliance choices, runs, quantities, accessories and build preferences.

A product, component, optic or source key is technical selection identity. It is not human or project identity.

The request must not contain caller-supplied candidates, scores, Tier authority, derived temperature, lookup temperature, board temperature, verified output, raw source rows or governance approval flags.

### 3.3 Candidate Engine response

Proposed response schema:

- schema: `controlstack.engine.output.v1`;
- version: `1`.

Required top-level fields:

```json
{
  "schemaId": "controlstack.engine.output.v1",
  "schemaVersion": 1,
  "state": "complete | blocked_fail_closed",
  "resultId": "deterministic technical identity",
  "requestFingerprint": "same accepted request fingerprint",
  "sourceVersionFingerprint": "technical source version",
  "policyFingerprint": "technical policy version",
  "evidenceFingerprints": [],
  "selectedResult": null,
  "runTable": null,
  "blockers": [],
  "warnings": [],
  "replay": {},
  "safetyFlags": {}
}
```

No user, customer, company, project, quote, owner, timeline, registration, active revision or persistence acknowledgement may appear in the response or influence any field.

## 4. Status and error semantics

### 4.1 Complete

`state: complete` requires:

- one accepted, versioned selection set;
- authoritative technical source and policy versions;
- all required evidence bound to technical selection identity;
- deterministic selected-result output;
- deterministic non-persistent RunTable rows or an explicitly versioned empty row set where no rows are applicable;
- no blockers;
- every no-write and no-raw-output safety flag false.

### 4.2 Blocked fail closed

`state: blocked_fail_closed` requires:

- `selectedResult: null`;
- `runTable: null` or an explicitly versioned empty blocked shape;
- one or more stable machine-readable blocker codes;
- no silent default, partial success or governance-derived warning;
- no raw source, raw Engine, exact private electrical, path, credential or generated artifact output.

Changing only outside traceability must not change complete versus blocked state, blocker codes, warnings or any deterministic output.

## 5. Result identity and technical provenance

`resultId` must be derived only from the accepted engineering request and technical versions. The minimum replay identity is:

- request fingerprint;
- source-version fingerprint;
- policy fingerprint;
- ordered evidence fingerprint set;
- Engine output schema ID and version.

Technical provenance may identify selected source-backed product, component and optic records and accepted evidence references. It must not include private paths, raw rows, credentials, personal identity or project ownership.

A derived Budget, Balanced, Long-life or equivalent result profile may appear only as Engine-produced result metadata. It is never caller authority or a registration prerequisite.

## 6. Candidate RunTable contract

Proposed row schema:

- schema: `controlstack.engine.runtable-row.v1`;
- version: `1`.

Every row must have one exact field set. At minimum it must carry:

- deterministic row and run keys;
- row ordinal and kind;
- accepted and Engine-verified state;
- safe machine values required by downstream artifacts;
- technical source/policy/result fingerprints;
- explicit redaction and no-raw-output flags.

The row schema must be non-persistent. Persistence may store a valid row set after calculation, but no persisted summary, saved project, registration state or active revision may be required to create or read the Engine result.

The existing `controlstack.runtime.runtable-first-narrow-row.v1` ID is not eligible for stability until its incompatible field-set collision is resolved by a new schema/version or one shape is retired.

## 7. Replay and readback

Replay accepts the same `controlstack.engine.selection-set.v1` request plus the same technical version set. It must produce an identical deterministic `controlstack.engine.output.v1` result.

Readback is by `resultId` or the complete replay identity. Persistence and project association are optional outside services. Their absence may make stored readback unavailable, but cannot invalidate a fresh Engine calculation.

A readback consumer must reject unsupported schema versions and must distinguish:

- result not stored;
- stored result unavailable;
- Engine calculation blocked;
- valid complete result;
- valid zero-valued engineering result.

## 8. Compatibility and rollback

Within version 1:

- optional additive fields may be introduced only when old consumers can ignore them safely;
- required-field, meaning, ownership, unit, state or blocker changes require a new major schema version;
- a field may not change from technical evidence to governance authority without a new Program decision;
- unknown schema versions fail closed;
- producers must retain a bounded reader for the immediately previous accepted version during migration;
- rollback restores the previous producer version without rewriting stored results or changing their recorded schema IDs.

## 9. Stability gate

Program & Integrate must not declare this contract stable until all of the following exist:

1. an implemented `controlstack.engine.selection-set.v1` request validator;
2. an implemented non-persistent `controlstack.engine.output.v1` envelope;
3. one unambiguous `controlstack.engine.runtable-row.v1` field set and producer;
4. producer tests for complete, blocked, zero-valued and replay-identical outcomes;
5. the different-envelope / identical-output boundary regression at the complete output level;
6. consumer compatibility evidence from Lab/IES without Selector UI scraping or private implementation imports;
7. a sealed-fixture or bounded live receipt for the complete output, not only the thermal component;
8. explicit rollback and previous-version readback evidence;
9. Program acceptance of schema IDs, ownership, compatibility and failure semantics.

## 10. Current ruling

The candidate is ready for Program review, but the Engine output contract is not stable.

SEL-008, Lab consumer adaptation and downstream artifacts remain blocked. The next implementation parcel, if approved by Program, must create the non-persistent selection-set/output/row contracts without modifying or depending on project registration, active revision, persistence or main runtime-port work.
