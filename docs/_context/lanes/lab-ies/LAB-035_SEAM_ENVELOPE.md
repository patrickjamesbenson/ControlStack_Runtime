# LAB-035 Selector Contract Stub — Seam Envelope

## Status

- Queue item: `LAB-035-selector-contract-stub`
- Seam version: `1`
- Status: proposed; blocked pending Program & Integrate approval
- Authorised implementation file:
  - `packages/lab-kernel/ies-toolkit/selector_stub.html`
- Gate: `lab-ies`

This document is the complete proposed seam envelope. Approval applies only to version 1 and the exact one-file implementation boundary. Any change to the input projection, ownership boundary, validation rules, publication state, file scope or acceptance rules requires a new Program & Integrate decision.

## 1. Purpose

LAB-035 replaces the legacy Selector demo with a Lab-only, read-only contract viewer. It demonstrates the shape and readiness of already-approved downstream inputs without implementing Selector, Runtime or Engine behaviour.

The replacement may:

1. validate and display a bounded safe contract view supplied by an approved host or the committed offline fixture;
2. display sealed-reference identity and safe-runtime-handoff fields already approved for downstream use;
3. display a bounded presentation projection of Selector factory-approved-input readiness;
4. show unresolved or blocked states exactly as supplied; and
5. fail closed on malformed, stale, conflicting, unsupported or over-rich input.

The replacement must not:

- select a product, family, tier, option, driver, current, length, accessory or orientation;
- implement Selector defaults, vocabulary, source rules, state transitions or option generation;
- scale lumens or watts, rotate photometry, build a recipe, generate IES, create a RunTable or invoke Engine;
- create, edit, approve, seal, allocate, resolve or persist a reference;
- accept raw authority records, raw candela, raw IES, RuntimeData rows, board rows or private diagnostics;
- claim that a fixture or displayed readiness is Selector acceptance, Engine proof or production approval.

## 2. Ownership boundary

### Lab owns

- presentation in the exact authorised HTML file;
- validation of the bounded contract view before rendering;
- explicit governed/offline-fixture labelling;
- fail-closed display of blocked and unresolved states;
- the committed non-production fixture used to demonstrate the seam.

### Selector & Engine retains

- all Selector source, state, vocabulary, defaults, option generation and committed-selection authority;
- factory-approved-input computation and accessory reservation policy;
- read-only Engine candidate applicability and all Engine execution;
- RunTable generation, selected-result proof and production outcome decisions.

### Program & Integrate retains

- construction and delivery of any governed contract bundle;
- cross-lane adapter ownership;
- persistence, authentication, routing, deployment and endpoint ownership;
- acceptance of the seam for future integration.

### Lab authority retains

- reference creation, approval, sealing and safe-runtime-handoff construction;
- authority records, evidence bodies, raw photometry and private provenance.

LAB-035 adds no route, server, endpoint, persistence, cross-lane adapter or production implementation.

## 3. Existing contracts reused unchanged

LAB-035 may consume only safe projections derived from these existing contracts:

1. `controlstack.lab.reference-identity.v1`, version `1`, read-only identity projection.
2. `controlstack.lab.safe-runtime-handoff.v1`, version `1`, safe summary only.
3. The read-only safe fields already returned by `buildSelectorFactoryApprovedInputsSummary(...)` in the Selector lane.

LAB-035 does not import, copy or execute Selector source. The Selector fields are represented only through the bounded presentation projection below.

## 4. Exact contract view

The page consumes one in-memory view model:

```js
{
  schemaId: "controlstack.lab.selector-contract-view.v1",
  schemaVersion: 1,
  publicationMode: "governed" | "offline_fixture",
  referenceIdentity: ReferenceIdentityProjection,
  safeRuntimeHandoff: SafeRuntimeHandoffProjection,
  selectorReadiness: SelectorReadinessProjection,
  binding: {
    referenceId: string,
    authorityRecordSha256: string
  },
  unresolvedFields: string[],
  readOnly: true
}
```

Unsupported top-level fields fail closed.

### 4.1 Reference identity projection

`referenceIdentity` must be the exact safe `controlstack.lab.reference-identity.v1` projection with:

- `schemaVersion: 1`;
- a valid canonical reference id and kind;
- canonical host-free resolver path;
- exact UTC seal time;
- valid authority-record and reference SHA-256 values;
- `readOnly: true`.

No raw sealed DTO, authority record, evidence body, candela matrix, origin IES or local path is accepted.

### 4.2 Safe runtime handoff projection

`safeRuntimeHandoff` must use schema `controlstack.lab.safe-runtime-handoff.v1`, version `1`, and must satisfy:

- `handoffState: "ready"`;
- `approvalState: "reference"`;
- `sourcePhotometryStatus: "available"`;
- `oneMmNormalised: true`;
- `baseLengthM: 0.001`;
- `unresolvedCount: 0`;
- `safeSummaryOnly: true`;
- `readOnly: true`;
- runtime-owned slots remain `null` unless a future separately approved seam changes them.

The page may display opaque references and hashes but must not dereference, reconstruct or reinterpret them.

### 4.3 Selector readiness projection

`selectorReadiness` is exactly:

```js
{
  schemaId: "controlstack.runtime.selector.factory-approved-inputs.presentation.v1",
  schemaVersion: 1,
  stage: 3,
  key: "factoryApprovedInputs",
  readOnly: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  factoryApprovedInputsReady: boolean,
  readonlyEngineCandidateInputsReady: boolean,
  readonlyEngineCandidateInputsBlocker: string | null,
  stage3Mode: "simple-run-stage3a-zero-accessory" | "accessory-reservation-required",
  blocker: string | null,
  committedSelectorConstraintCount: integer,
  accessoryIntentCount: integer,
  safety: {
    engineOutcomeProven: false,
    engineExecuted: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    rawRowsExposed: false,
    rawAccessoryRowsExposed: false,
    rawEnginePayloadExposed: false,
    rawSelectedResultPayloadExposed: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    generation: false,
    proof: false
  }
}
```

Rules:

- the projection is display-only and does not become a new Selector source of truth;
- Lab does not derive readiness, blockers, counts or `stage3Mode`;
- every safety field must be exactly `false`;
- unsupported fields, missing fields, negative counts or contradictory readiness/blocker combinations fail closed;
- a ready projection may be labelled `reported ready`, never `accepted`, `proved`, `selected`, `generated` or `production ready`;
- blocked input remains visibly blocked and is not defaulted or repaired by the page.

## 5. Binding and stale-input rules

The view fails closed unless:

- `binding.referenceId` exactly equals `referenceIdentity.referenceId`;
- `binding.authorityRecordSha256` exactly equals both the identity authority SHA and the safe-runtime-handoff authority token/fingerprint used by the approved handoff;
- the reference kind/type values agree;
- the identity and handoff are both read-only and internally consistent;
- governed mode contains no fixture authority flags;
- offline fixture mode contains only the committed fixture and the required unapproved label.

A mismatch is displayed as `CONTRACT BLOCKED — STALE OR CONFLICTING INPUT`. The page must not choose one conflicting value as authoritative.

## 6. Publication modes

### Governed mode

- consumes only a caller-supplied `controlstack.lab.selector-contract-view.v1` object;
- performs no network, filesystem or storage lookup;
- does not construct the view from raw lane data;
- labels readiness as supplied contract state, not Lab evidence.

### Offline fixture mode

- uses only the exact committed fixture embedded in the authorised HTML file;
- must display the persistent label `OFFLINE CONTRACT DEMO — NOT SELECTOR ACCEPTANCE`;
- fixture values must be visibly synthetic/unapproved;
- fixture mode may demonstrate ready and blocked examples but cannot represent production state.

## 7. Legacy behaviour explicitly retired

The current page must remove or confine all legacy behaviour, including:

- arbitrary file upload or drag-and-drop of reference JSON;
- embedded pseudo sealed references represented as real authority;
- run-length editing;
- orientation selection or 180-degree recipe logic;
- lumen, wall-power, circuit-power or efficacy calculation;
- multiplication by length;
- photometry scaling, rotation or delivery claims;
- capability or evidence badges interpreted as approval;
- statements that the page resolves a real luminaire or shows what Engine consumes;
- diagnostic fingerprints represented as sealed authority;
- positive production wording over fixture content.

## 8. Presentation responsibilities

The page must render only:

- contract mode and persistent authority disclaimer;
- safe reference identity summary;
- safe runtime-handoff readiness and unresolved state;
- Selector factory-approved-input readiness and blockers as supplied;
- safety flags showing that no execution, generation, persistence, proof or write occurred;
- binding validation result.

The page contains no business-rule computation other than strict shape, type, equality and allowlist validation required to fail closed.

## 9. Validation and acceptance

Implementation acceptance requires:

1. exactly `packages/lab-kernel/ies-toolkit/selector_stub.html` changed for the feature parcel;
2. no Selector, Runtime, Engine, Program, authority module, fixture file or shared CSS change;
3. no upload, network, persistence, scaling, selection, defaulting, generation or execution behaviour;
4. valid governed and offline-fixture views render read-only summaries;
5. malformed schema/version, unsupported fields, stale identity binding, contradictory readiness, non-false safety flags and over-rich inputs fail closed;
6. the exact offline label is always visible in fixture mode;
7. no state can be presented as Selector acceptance or Engine proof;
8. full `lab-ies` passes;
9. exactly the authorised feature file is committed as `lab: checkpoint Selector contract stub` and pushed only to `lane/code-pilot-lab`;
10. lane documentation closeout is committed separately;
11. final Git inventory preserves the existing protected untracked set and expected HEAD-marker change.

## 10. Rollback

Rollback is deletion of the LAB-035 feature commit from a future integration candidate or restoration of the prior `selector_stub.html`. No data migration, authority rollback, Selector rollback, endpoint removal or persistence cleanup is required because this parcel creates none.

## 11. Invalidation rule

Any request to add Selector logic, change Selector vocabulary, compute outputs, accept raw records, read RuntimeData, invoke Engine, generate IES, add routes, persist data, alter another file or claim acceptance invalidates version 1 and requires a new Program & Integrate decision.
