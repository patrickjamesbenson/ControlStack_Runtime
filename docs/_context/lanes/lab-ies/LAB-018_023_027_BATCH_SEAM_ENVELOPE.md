# LAB-018 to LAB-023 and LAB-027 — Consolidated Seam Envelope

## Status and decision model

- Envelope version: `1`
- Covered queue items:
  - `LAB-018-nvb-resolution-contract`
  - `LAB-019-component-projection-contract`
  - `LAB-020-document-register-contract`
  - `LAB-021-emergency-selection-contract`
  - `LAB-022-reference-composition-kernel`
  - `LAB-023-nvb-lab-adapter`
  - `LAB-027-request-report-workflow`
- Status: proposed for one Program & Integrate batch decision.
- Implementation status: all seven remain `blocked` until Program & Integrate records its decision against this committed envelope version.
- Approval does not make seven items runnable at once. An approved item may move to `ready` only when it is the single top eligible queue item and every dependency is `done`.
- An amendment to one item reopens only that item. Approved unchanged sections for the other items remain valid.

This document consolidates the seven seam decisions without combining their implementation parcels. Each item retains its own exact files, gate, commit, dependency order and rollback boundary.

## Batch-wide ownership and safety boundary

Program & Integrate retains ownership of:

- live RuntimeData reading and source-revision selection;
- durable identifiers and serial allocation;
- database, object-store and file-store persistence;
- uploads and evidence-body storage;
- public or internal HTTP routes;
- host names, base URLs and route-to-storage mapping;
- authentication, authorisation and tenancy;
- CRM/project integration;
- deployment, monitoring and operational availability;
- promotion to main.

The Lab lane may implement only deterministic, browser-safe contract logic and Lab-only presentation within the exact item scopes below. It must not read the live database directly, invent durable IDs, persist state, implement routes, copy Program readers, mutate sealed DTOs, reconstruct private authority, or claim emergency/EWIS assembly verification.

All new contract outputs are plain-data, deeply immutable and versioned. Unsupported schemas, unknown fields where strict shape applies, malformed identifiers, conflicting duplicate data, unsafe paths, non-finite numbers and ambiguous source facts fail closed.

---

# LAB-018 — NVB resolution contract

## Contract

LAB-018 replaces the current mixed loader/resolver helper with pure resolution over caller-supplied source rows. It serves LAB-023 and later Lab surfaces. Program may supply live rows through a Program-owned adapter; offline Lab fixtures may supply the same input shape for development.

Approved exports:

```js
NvbResolutionContractError
NVB_RESOLUTION_SCHEMA_ID
NVB_RESOLUTION_SCHEMA_VERSION
NVB_TEST_PATHS
normaliseNvbFamily(value) -> number | null
classifyNvbTestPath(testType) -> "gear_tray" | "optic" | "no_base" | null
resolveNvbSelection(input) -> Readonly<NvbResolution>
splitNvbLabForm(rows) -> Readonly<NvbLabFormProfile>
listNvbOpticsForFamily(optics, family, options) -> readonly object[]
```

Fixed constants:

```js
NVB_RESOLUTION_SCHEMA_ID = "controlstack.lab.nvb-resolution.v1"
NVB_RESOLUTION_SCHEMA_VERSION = 1
NVB_TEST_PATHS = ["gear_tray", "optic", "no_base"]
```

`resolveNvbSelection` accepts exactly:

```js
{
  testType: string,
  selection: {
    family: string | number,
    opticBomId?: string | null,
    opticVariant?: string | null
  },
  systems: object[],
  optics: object[],
  labForm: object[]
}
```

It returns exactly:

```js
{
  schemaId: "controlstack.lab.nvb-resolution.v1",
  schemaVersion: 1,
  path: "gear_tray" | "optic" | "no_base" | null,
  family: number | null,
  status: "resolved" | "unresolved",
  optic: null | {
    opticBomId: string,
    opticVariant: string,
    specCode: string | null,
    emissionPermission: string | null,
    hotTestEvidenceRef: string | null,
    opticalEfficiency: number | null,
    opticInternalDeltaTaC: number | null,
    roomTaC: number | null,
    opticUpliftTaC: number | null
  },
  governingThermals: null | {
    systemLabel: string,
    systemVariant: string | null,
    metalAreaMm2: number | null,
    airAreaMm2: number | null
  },
  labForm: {
    iesFields: readonly object[],
    checkFields: readonly object[]
  },
  blockers: readonly string[],
  readOnly: true
}
```

Rules:

- governing thermals come only from the one row in the selected family with `thermal_family_nominated_worst_case === true`;
- zero governing rows or more than one governing row for the family is unresolved and fails closed;
- optic matching uses exact `optic_bom_id` first, otherwise exact family plus exact `optic_var_1`;
- multiple matches fail closed;
- `hot_test_battery_applies` is retained only as opaque `hotTestEvidenceRef`; it is never parsed for thermal values and never becomes an emergency-capable or verified claim;
- Lab-form rows are split only by exact `kind === "ies"` or `kind === "check"`; unknown kinds are blockers;
- no fetch, file, database, clock, random, cache-busting, DOM, storage or environment access is permitted.

## Scope

Exact implementation files after approval:

```text
packages/lab-kernel/ies-toolkit/nvbResolve.js
tests/lab-kernel/nvbResolve.test.js
```

Boundaries:

- no live RuntimeData reader;
- no fixture loading;
- no HTML or adapter changes;
- no emergency verification derivation;
- no mutation of source rows, authority records or sealed DTOs;
- no Selector option semantics;
- no Program, Runtime, Engine or Selector file changes.

## Compatibility

Known current consumer:

```text
packages/lab-kernel/ies-toolkit/nvbLabAdapter.js
```

That legacy adapter imports retired names and expects mutable behaviour. It may be temporarily incompatible until LAB-023 migrates it.

Retired behaviours and names:

```text
loadNvb
toFamily
familyWorstCase
testTypeToPath
resolveOptic
labFormSplit
opticsForFamily
emergency_capable
slug_family_mismatch
```

No committed Program, Runtime, Engine or Selector consumer was found. Program integration consumes the documented input/output shapes through its own reader adapter.

## Rollback

1. revert the LAB-018 feature commit containing only the two scoped files;
2. run the full `lab-ies` gate;
3. push the revert only to `lane/code-pilot-lab`;
4. restore LAB-018 to `blocked` and keep LAB-023 and later dependants blocked.

No database, source fixture or route rollback is required.

## Tests

Success proof:

- all three test paths classify exactly;
- family normalisation is deterministic;
- one governing thermal row resolves exactly;
- exact optic ID and family/variant fallback resolve deterministically;
- Lab form splits in source order;
- outputs are deeply immutable and inputs unchanged;
- offline fixture rows and equivalent injected rows produce identical output.

Failure proof:

- invalid family, test type or source shape;
- missing or duplicate governing row;
- missing or duplicate optic match;
- unknown Lab-form kind;
- non-finite numeric source values;
- proof that provenance slugs do not produce thermal facts or emergency verification;
- static proof of no fetch, filesystem, database, clock, random, storage or DOM access.

---

# LAB-019 — Component projection contract

## Contract

LAB-019 projects caller-supplied NVB board, driver and optic rows into deterministic Lab component-library views. It does not load a catalogue. Program owns the live source adapter; Lab fixtures may supply rows offline.

Approved exports:

```js
ComponentProjectionContractError
COMPONENT_CATALOGUE_SCHEMA_ID
COMPONENT_CATALOGUE_SCHEMA_VERSION
projectBoardPlatforms(boards) -> readonly BoardPlatformProjection[]
projectDrivers(drivers) -> readonly DriverProjection[]
projectOptics(optics) -> readonly OpticProjection[]
projectComponentCatalogue(input) -> Readonly<ComponentCatalogueProjection>
```

Fixed constants:

```js
COMPONENT_CATALOGUE_SCHEMA_ID = "controlstack.lab.component-catalogue.v1"
COMPONENT_CATALOGUE_SCHEMA_VERSION = 1
```

`projectComponentCatalogue` accepts exactly:

```js
{
  sourceRevision: string,
  boards: object[],
  drivers: object[],
  optics: object[]
}
```

It returns exactly:

```js
{
  schemaId: "controlstack.lab.component-catalogue.v1",
  schemaVersion: 1,
  sourceRevision: string,
  platforms: readonly BoardPlatformProjection[],
  drivers: readonly DriverProjection[],
  optics: readonly OpticProjection[],
  readOnly: true
}
```

Board grouping key is the exact tuple `novonFamily + ledChip + vendor`. CCT values come only from `c1_cct` and `c2_cct`, are normalised as strings, deduplicated and sorted numeric-first then lexical. `tunable` is true only when a second CCT is present or `channels >= 2`.

Scalar conflicts within one board platform do not use first-row wins. A conflict in CRI, thermal, life, ambient, warranty or datasheet reference is reported as a blocker and the catalogue projection fails closed.

Drivers deduplicate only by exact non-empty `model`. Conflicting duplicate rows fail closed. Optics require a unique exact `optic_bom_id`; missing or duplicate IDs fail closed. Output arrays use stable ascending IDs and never source insertion order as authority.

## Scope

Exact implementation files after approval:

```text
packages/lab-kernel/ies-toolkit/nvbComponents.js
tests/lab-kernel/nvbComponents.test.js
```

Boundaries:

- no `fetch`, filesystem, database, cache-busting or source loader;
- no embedded catalogue or fallback dataset;
- no HTML, fixture or document-register changes;
- no Selector option generation;
- no browser persistence;
- no Program reader copy.

## Compatibility

Known legacy consumers:

```text
packages/lab-kernel/ies-toolkit/component_library.html
packages/lab-kernel/ies-toolkit/lab_request.html
packages/lab-kernel/ies-toolkit/reference_builder.html
```

They currently import `loadComponents`, which is retired. They may remain temporarily incompatible until their own approved parcels migrate to `projectComponentCatalogue` with caller-supplied data.

No committed Program, Runtime, Engine or Selector consumer was found.

## Rollback

Revert the single LAB-019 feature commit, run the full gate, push only to the Lab lane, restore LAB-019 to blocked and keep dependent UI/workflow parcels blocked. No catalogue or database restoration is required.

## Tests

Success proof:

- deterministic platform grouping regardless of source order;
- exact CCT ordering and tunable rules;
- exact stable driver and optic ordering;
- immutable outputs and unchanged inputs;
- equivalent fixture/live-adapter rows project identically.

Failure proof:

- missing source revision;
- malformed board, driver or optic rows;
- conflicting platform scalars;
- duplicate driver model with conflicting data;
- missing or duplicate optic ID;
- unsafe/non-plain values;
- static proof of no loader, fetch, persistence, clock or embedded catalogue.

---

# LAB-020 — Document register contract

## Contract

LAB-020 defines an immutable in-memory many-to-many document association model. It is a Lab workflow contract only. Program owns upload, durable storage, content hashing, IDs and persistence.

Approved exports:

```js
DocumentRegisterContractError
DOCUMENT_REGISTER_SCHEMA_ID
DOCUMENT_REGISTER_SCHEMA_VERSION
createDocumentRegisterState() -> Readonly<DocumentRegisterState>
registerDocument(state, document) -> Readonly<{ state, document, reused }>
linkDocument(state, link) -> Readonly<DocumentRegisterState>
unlinkDocument(state, link) -> Readonly<DocumentRegisterState>
listDocuments(state, filter?) -> readonly DocumentProjection[]
documentsForEntity(state, entityId) -> readonly DocumentProjection[]
entitiesForDocument(state, documentId) -> readonly string[]
```

Fixed constants:

```js
DOCUMENT_REGISTER_SCHEMA_ID = "controlstack.lab.document-register.v1"
DOCUMENT_REGISTER_SCHEMA_VERSION = 1
```

State is exactly:

```js
{
  schemaId: "controlstack.lab.document-register.v1",
  schemaVersion: 1,
  documents: readonly {
    documentId: string,
    documentType: string,
    title: string,
    sourceRef: string | null,
    contentSha256: string | null,
    sourceStatus: "accepted" | "unresolved",
    readOnly: true
  }[],
  links: readonly {
    documentId: string,
    entityId: string
  }[],
  readOnly: true
}
```

Rules:

- `documentId` and `entityId` are caller-supplied safe opaque IDs; Lab does not allocate them;
- `sourceRef`, when present, is a canonical host-free LAB-017 source, report or evidence resolver path;
- `contentSha256`, when present, is a lower-case raw 64-character SHA-256 value supplied by the owner of the stored bytes;
- deduplication occurs only on identical non-null `contentSha256` or identical non-null `sourceRef`;
- conflicting metadata on a dedupe key fails closed;
- filename, title and diagnostic fingerprints are not dedupe authority;
- linking and unlinking return new state and never mutate prior state;
- source evidence is never deleted; unlink removes only an association.

## Scope

Exact implementation files after approval:

```text
packages/lab-kernel/ies-toolkit/docRegister.js
tests/lab-kernel/docRegister.test.js
```

Boundaries:

- no global singleton state or counter;
- no upload, file read, hashing, URL fetch, network, database or browser storage;
- no source-evidence deletion;
- no HTML or fixture changes;
- no diagnostic fingerprint represented as authority SHA.

## Compatibility

Known legacy consumers:

```text
packages/lab-kernel/ies-toolkit/component_library.html
packages/lab-kernel/ies-toolkit/reference_builder.html
```

They currently call mutable singleton functions and expect generated IDs. These calls break until later parcels migrate them to explicit immutable state and Program-supplied IDs.

Retired names:

```text
addDoc
associate
unassociate
docsFor
findDocs
entitiesFor
allDocs
```

## Rollback

Revert the LAB-020 feature commit, run the full gate, push only to the Lab lane, restore LAB-020 to blocked and keep dependent surfaces blocked. There is no persisted register to restore.

## Tests

Success proof:

- empty state shape;
- registration with caller ID;
- safe SHA/source dedupe reuse;
- many-to-many linking and idempotent duplicate links;
- unlink removes only one association;
- deterministic sorted queries;
- deep immutability and prior-state preservation.

Failure proof:

- invalid document/entity IDs;
- unsafe resolver source path;
- invalid SHA;
- duplicate ID with different content;
- conflicting metadata on a dedupe key;
- unknown fields under strict validation;
- static proof of no global counter, clock, persistence, upload or deletion seam.

---

# LAB-021 — Emergency selection contract

## Contract

LAB-021 provides an advisory, fail-closed emergency converter and battery candidate from the recorded Zencontrol evidence matrix. It supports Lab evidence planning only. It does not release procurement and never asserts final assembly verification.

Approved exports:

```js
EmergencySelectionContractError
EMERGENCY_SELECTION_SCHEMA_ID
EMERGENCY_SELECTION_SCHEMA_VERSION
EMERGENCY_MODELS
EMERGENCY_BATTERY_MATRIX
selectEmergencyCandidate(input) -> Readonly<EmergencySelectionCandidate>
```

Fixed constants:

```js
EMERGENCY_SELECTION_SCHEMA_ID = "controlstack.lab.emergency-selection.v1"
EMERGENCY_SELECTION_SCHEMA_VERSION = 1
```

Input is exactly:

```js
{
  stringVoltageV: number,
  powerW: number,
  durationHours: 1 | 2 | 3,
  designLifeYears: 5 | 10
}
```

Output is exactly:

```js
{
  schemaId: "controlstack.lab.emergency-selection.v1",
  schemaVersion: 1,
  state: "candidate" | "blocked",
  modelId: string | null,
  isolation: "SELV" | "non-SELV" | null,
  outputVoltageRangeV: readonly [number, number] | null,
  selectedPowerW: number | null,
  nominalDriveCurrentmA: number | null,
  nominalCurrentStatus: "derived_exact" | null,
  durationHours: number | null,
  designLifeYears: number | null,
  batteryPackCode: string | null,
  procurementRelease: false,
  procurementBlockers: readonly string[],
  engineeringWarnings: readonly string[],
  assemblyVerification: {
    emergency: null,
    ewisCartridge: null
  },
  readOnly: true
}
```

Rules:

- model selection uses published voltage windows only;
- exactly 50 V is blocked for engineering review because both ranges meet there;
- current is nominal arithmetic `1000 × powerW / stringVoltageV` and is never represented as a tolerance-guaranteed output;
- only published power/duration/design-life combinations are candidates;
- known matrix conflicts remain blockers;
- unpublished capacity, Wh, cell arrangement, connector, lead, pack temperature, current tolerance, efficiency and derating remain procurement blockers;
- every successful candidate still has `procurementRelease: false` until Program-owned evidence/procurement gates are satisfied;
- emergency and EWIS assembly verification remain exactly `null`.

## Scope

Exact implementation files after approval:

```text
packages/lab-kernel/ies-toolkit/zencontrolEmergency.js
tests/lab-kernel/zencontrolEmergency.test.js
```

Boundaries:

- no product ordering or procurement release;
- no network, URL loading, browser storage, filesystem or runtime route;
- no inherited `_EMERGENCY_VERIFIED` or `_EWIS_CARTRIDGE_VERIFIED`;
- no HTML, provenance publication or fixture changes;
- no unsupported value hardened as confirmed.

## Compatibility

Known legacy consumers:

```text
packages/lab-kernel/ies-toolkit/emergency.html
packages/lab-kernel/ies-toolkit/provenance.html
```

They import the old data tables and `selectEmergency` result shape. They may remain temporarily incompatible until LAB-030 and LAB-029 migrate them.

Retired public exports include legacy source URLs, unbounded source text, `pickModel`, `emergencyCurrentmA`, `currentEnvelope` and `selectEmergency`.

## Rollback

Revert the LAB-021 feature commit, run the full gate, push only to the Lab lane, restore LAB-021 to blocked and keep LAB-024/LAB-029/LAB-030 blocked. No order, battery allocation or persisted state exists to restore.

## Tests

Success proof:

- every published model/power/duration/design-life matrix row;
- exact nominal current arithmetic;
- exact isolation and voltage-window projection;
- deterministic immutable output;
- candidate always retains procurement blockers and null assembly verification.

Failure proof:

- voltage below, above and exactly at boundary;
- unsupported power, duration and design life;
- non-finite values;
- known conflicting pack code;
- proof that unconfirmed values never appear as confirmed numbers;
- proof that no candidate becomes procurement-released or assembly-verified;
- static proof of no network, persistence or route seam.

---

# LAB-022 — Governed reference composition kernel

## Individual-treatment requirement inside the batch

LAB-022 is the only item that requires an explicit owner policy decision in addition to ordinary Program seam approval. It can still be decided in this same batch review, but Program & Integrate must expressly ratify the version-1 merge policy below. If it does not, Program may approve the other six items while LAB-022 remains blocked.

Required owner sub-decision for version 1:

1. exactly two direct parents, never N-parent input;
2. GT and OPT parents are allowed, but MERGED parents are not;
3. duplicate `referenceId` parents are rejected;
4. parent order remains provenance-significant under DL-011;
5. photometric grids must match exactly; no interpolation, resampling, translation or rotation occurs in version 1;
6. identity allocation, authority construction, approval and sealing happen after composition and outside this kernel.

## Contract

LAB-022 replaces the legacy helper that emits a fake partially sealed reference with a pure non-authoritative composition candidate over two validated sealed DTOs.

Approved exports:

```js
ReferenceCompositionContractError
REFERENCE_COMPOSITION_SCHEMA_ID
REFERENCE_COMPOSITION_SCHEMA_VERSION
composeReferencePair(input) -> Readonly<ReferenceCompositionCandidate>
```

Fixed constants:

```js
REFERENCE_COMPOSITION_SCHEMA_ID = "controlstack.lab.reference-composition-candidate.v1"
REFERENCE_COMPOSITION_SCHEMA_VERSION = 1
```

Input is exactly:

```js
{
  parents: [
    {
      reference: SealedReferenceDto,
      role: string,
      ownedWallPowerW: number
    },
    {
      reference: SealedReferenceDto,
      role: string,
      ownedWallPowerW: number
    }
  ],
  geometryRegistration: "coincident-aligned",
  operatingState: "all-contributing-channels-on"
}
```

Output is exactly:

```js
{
  schemaId: "controlstack.lab.reference-composition-candidate.v1",
  schemaVersion: 1,
  kind: "MERGED_CANDIDATE",
  parents: readonly {
    ordinal: 1 | 2,
    referenceId: string,
    referenceSha256: string,
    kind: "GT" | "OPT",
    role: string,
    ownedWallPowerW: number
  }[],
  geometryRegistration: "coincident-aligned",
  operatingState: "all-contributing-channels-on",
  photometry: {
    vAngles: readonly number[],
    hAngles: readonly number[],
    candela: readonly (readonly number[])[]
  },
  ownedPower: {
    parentWallPowerW: readonly [number, number],
    totalWallPowerW: number,
    sharedOverheadW: null
  },
  unresolvedAssemblyFields: readonly string[],
  authorityState: "candidate",
  readOnly: true
}
```

Rules:

- both inputs must be valid `controlstack.lab.reference.1mm.v1` sealed DTOs with `approval.state === "reference"` and valid `referenceSha256`;
- `ownedWallPowerW` must equal the corresponding sealed DTO owned `G12` value exactly;
- angle arrays and candela dimensions must match exactly;
- finite non-negative candela is summed cell-by-cell without interpolation;
- parent power is summed once; shared driver, standby or control overhead remains unresolved and is not counted;
- output contains no `id`, `serial`, `sealedAtUtc`, approval, authority hash, reference hash or sealed-reference schema ID;
- output does not inherit LUMCAT, LUMINAIRE, assembly identity, internal ambient, emergency verification or EWIS verification;
- inputs are not mutated.

## Scope

Exact implementation files after approval:

```text
packages/lab-kernel/ies-toolkit/iesMerge.js
tests/lab-kernel/iesReferenceComposition.test.js
```

Boundaries:

- no UI, HTML or CSS;
- no allocation, authority construction, approval or sealing;
- no nested MERGED, duplicate parent, N-parent, cycle or parent-reordering policy;
- no interpolation/resampling/rotation/translation;
- no diagnostic fingerprint, URL or local path identity;
- no inherited assembly fields;
- no Selector or Program code changes.

## Compatibility

Known legacy consumer:

```text
packages/lab-kernel/ies-toolkit/ies_merge.html
```

The canonical keyword migration guard also inspects this source file.

The legacy `mergePhotometry` and `mergeReferences` exports are retired. The current UI may remain incompatible until LAB-032 migrates to `composeReferencePair`. No committed Program, Runtime, Engine or Selector consumer was found.

## Rollback

1. revert dependent LAB-032 or later consumers in reverse order if committed;
2. revert the LAB-022 feature commit;
3. run the full gate and push only to the Lab lane;
4. restore LAB-022 to blocked while preserving DL-011 and this envelope as historical evidence.

No sealed reference, serial, database row or route is created by the kernel, so no data rollback is required.

## Tests

Success proof:

- exact two-parent GT/OPT combinations;
- exact grid cellwise candela sum;
- exact owned power sum;
- ordered parent projection using `referenceId` and `referenceSha256`;
- changing parent order changes the ordered provenance projection;
- deep immutability and unchanged parents;
- no sealed or assembly-owned field in output.

Failure proof:

- fewer or more than two parents;
- MERGED parent;
- duplicate reference ID;
- malformed/unapproved/unsealed DTO;
- invalid hash or identity mismatch;
- grid, photometric type, units, dimensions or 1 mm basis mismatch;
- non-finite/negative candela;
- owned power mismatch;
- unsupported geometry/operating state;
- static proof of no interpolation, allocation, approval, sealing, diagnostic identity or inherited emergency/EWIS claim.

---

# LAB-023 — NVB Lab adapter

## Contract

LAB-023 adapts one approved LAB-018 resolution plus optional LAB-017 safe reference identity projections into immutable Lab working state. It never mutates a working record or generates an identity.

Approved exports:

```js
NvbLabAdapterContractError
NVB_LAB_ADAPTER_SCHEMA_ID
NVB_LAB_ADAPTER_SCHEMA_VERSION
adaptNvbResolution(input) -> Readonly<NvbLabProjection>
```

Fixed constants:

```js
NVB_LAB_ADAPTER_SCHEMA_ID = "controlstack.lab.nvb-lab-projection.v1"
NVB_LAB_ADAPTER_SCHEMA_VERSION = 1
```

Input is exactly:

```js
{
  resolution: NvbResolution,
  references: {
    gearTray: ReferenceIdentityProjection | null,
    optic: ReferenceIdentityProjection | null
  }
}
```

Output is exactly:

```js
{
  schemaId: "controlstack.lab.nvb-lab-projection.v1",
  schemaVersion: 1,
  path: "gear_tray" | "optic" | "no_base" | null,
  family: number | null,
  selection: {
    opticBomId: string | null,
    opticVariant: string | null,
    specCode: string | null,
    emissionPermission: string | null
  },
  governingThermals: object | null,
  references: {
    gearTray: ReferenceIdentityProjection | null,
    optic: ReferenceIdentityProjection | null
  },
  unresolved: readonly string[],
  assemblyVerification: {
    emergency: null,
    ewisCartridge: null
  },
  readOnly: true
}
```

Rules:

- only exact LAB-018 schema/version is accepted;
- reference projections must be exact LAB-017 identity projections and match the intended GT/OPT kind;
- no reference ID is generated from Lab-form values, slugs or fingerprints;
- no clock or `resolvedAtUtc` is added;
- unresolved resolver blockers are preserved, not silently filled;
- the projection never changes the resolver input, reference projection or caller record;
- emergency/EWIS verification remains null.

## Scope

Exact implementation files after approval:

```text
packages/lab-kernel/ies-toolkit/nvbLabAdapter.js
tests/lab-kernel/nvbLabAdapter.test.js
```

Boundaries:

- no direct source loading;
- no rich authority or sealed DTO mutation;
- no diagnostic fingerprint import;
- no reference ID generation;
- no persistence, route, clock, random or browser storage;
- no HTML, fixture, resolver or Program file changes.

## Compatibility

Repository search found no current import of `nvbLabAdapter.js`. The current public names `gearTrayRefId`, `opticRefId` and `resolveRecordNvb` are retired. Future Lab surfaces consume the documented immutable projection only.

## Rollback

Revert the LAB-023 feature commit, run the full gate, push only to the Lab lane and restore LAB-023 to blocked. No source, record or persisted state requires restoration.

## Tests

Success proof:

- gear-tray, optic and no-base projections;
- correct acceptance of LAB-017 identity projections;
- exact unresolved preservation;
- deep immutability and unchanged inputs;
- deterministic output with no timestamp.

Failure proof:

- wrong resolver schema/version;
- malformed reference projection;
- GT/OPT kind mismatch;
- unexpected private authority or diagnostic fields;
- attempted mutation;
- proof that no ID, timestamp or assembly verification is invented;
- static proof of no loader, persistence, clock or fingerprint dependency.

---

# LAB-027 — Lab request and report workflow

## Contract

LAB-027 reconciles four Lab surfaces into one additive, non-persistent handoff family for future Program integration. Information stays at the same canonical paths as it moves from request to order to results to reference intake. Later stages add fields; they do not rekey earlier data.

Approved schema family:

```text
controlstack.lab.test-request-handoff.v1
controlstack.lab.order-handoff.v1
controlstack.lab.extended-report-handoff.v1
controlstack.lab.reference-intake-handoff.v1
```

Every payload has these common exact fields:

```js
{
  schemaId: string,
  schemaVersion: 1,
  stage: "test_request" | "order" | "extended_report" | "reference_intake",
  workflowKey: string,
  priorStageRefs: readonly {
    schemaId: string,
    artifactRef: string,
    sha256: string | null
  }[],
  customer: {
    customerId: string | null,
    company: string | null,
    contact: string | null,
    internal: boolean | null
  },
  project: {
    projectId: string | null,
    name: string | null,
    pipeline: string | null,
    ownerId: string | null,
    priority: "standard" | "high" | "urgent" | null,
    dueDate: string | null,
    customerReference: string | null
  },
  item: {
    type: "component" | "luminaire" | "external" | null,
    description: string | null,
    componentRefs: readonly string[]
  },
  conditions: {
    ambientC: number | null,
    mainsV: number | null,
    driveLevels: readonly string[]
  },
  requestedTests: readonly {
    testId: string,
    points: readonly string[],
    driveLevels: readonly string[],
    source: "lab" | "ies" | "external"
  }[],
  unresolvedFields: readonly string[],
  readOnly: true
}
```

Stage additions:

- `test_request` adds `requestReason`, `pureReferenceGearTray` as a LAB-017 identity projection or null, and `customerAcknowledgement` as entered evidence only; it does not release work or allocate a work-order number.
- `order` preserves all request fields and adds `orderStatus: "draft" | "confirmed"`, `instructions`, and Program-owned IDs when supplied. A browser confirmation is not Program persistence.
- `extended_report` preserves request/order fields and adds result rows with exact state `measured | not_applicable | unresolved`, value, unit and equipment reference. It never emits a diagnostic fingerprint as authority and never converts an EWIS checkbox into verification.
- `reference_intake` preserves prior fields and adds only safe artifact references for normalised photometry and reports, plus unresolved-field pointers. It is not a sealed reference, does not use `controlstack.lab.reference.1mm.v1`, and does not allocate a serial, authority hash, approval or seal.

Surface responsibility:

```text
test_request.html      -> test-request handoff
lab_request.html       -> consumes/adds order handoff and may render extended-report entry
extended_report.html   -> consumes order handoff and emits extended-report handoff
onemm_contract.html    -> consumes safe prior-stage artifact refs and emits reference-intake handoff
```

Rules:

- `workflowKey` is an entered or Program-supplied safe correlation key; no clock/random sequence becomes a durable ID;
- payloads contain no raw image/base64, uploaded file bytes, local path, file URL or wildcard-postMessage authority transfer;
- attachments are referenced only through canonical LAB-017 artifact paths;
- no localStorage or browser persistence is used as an integration seam;
- demo customers, systems, assemblies and reports must not be emitted as live payload defaults;
- incomplete fields remain explicit in `unresolvedFields`;
- all payload generation is deterministic for the same entered state.

## Scope

Exact implementation files after approval:

```text
packages/lab-kernel/ies-toolkit/test_request.html
packages/lab-kernel/ies-toolkit/lab_request.html
packages/lab-kernel/ies-toolkit/extended_report.html
packages/lab-kernel/ies-toolkit/onemm_contract.html
tests/lab-kernel/labRequestReportWorkflow.test.js
```

Boundaries:

- no Program database, CRM, upload, workflow, route or persistence implementation;
- no new shared production kernel;
- no duplicate authority schema or reverse reconstruction;
- no browser-state approval/sealing claim;
- no raw photo/file body in payload;
- no localStorage integration or wildcard postMessage handoff;
- no changes to shared CSS, fixtures, production kernels, Selector or Program code.

## Compatibility

Current untracked surfaces emit incompatible provisional schemas and behaviours:

```text
controlstack.lab.test-request.v2
controlstack.lab.order.v1
controlstack.lab.extended-report.v1
controlstack.lab.reference.optic.v1
```

They also contain provisional date/sequence IDs, diagnostic fingerprints, demo catalogue/customer data, localStorage, wildcard postMessage, raw data-URL photos and a false implication that the browser can seal a reference. Those behaviours are retired.

The current offline extended-report fixture and later resolver fixture corpus may require migration in LAB-024. No committed Program, Runtime, Engine or Selector consumer of the provisional payloads was found.

## Rollback

Revert the single LAB-027 feature commit containing exactly the five scoped files, run the full gate, push only to the Lab lane and restore LAB-027 to blocked. Because no Program persistence or route is introduced, rollback does not delete records or migrate stored data.

## Tests

Success proof:

- exact four schema IDs and common field paths;
- request → order → report → intake remains additive with no rekeying;
- unresolved fields survive every stage;
- exact requested-test ordering and deterministic payloads;
- only canonical artifact references cross stages;
- intake is explicitly non-authoritative and non-sealed;
- all four surfaces preserve entered values without mutation.

Failure proof:

- malformed workflow key, dates, IDs or artifact refs;
- unsupported test/result state;
- raw file path, file URL, data URL/base64 or uploaded bytes;
- localStorage and wildcard postMessage integration;
- clock/random durable ID allocation;
- diagnostic fingerprint represented as SHA or authority;
- browser approval/sealing claim;
- duplicate/rekeyed customer, project, item or test information;
- static proof of no Program persistence, CRM, upload or route implementation.

---

# Batch approval record required

A Program & Integrate approval must identify:

- this committed envelope version and checkpoint;
- which of the seven items are approved unchanged;
- whether the LAB-022 owner sub-decision is expressly ratified;
- acceptance of each exact implementation/test file set;
- acceptance of the named temporary compatibility breaks;
- retention of Program ownership listed in the batch-wide boundary;
- confirmation that implementation remains one queue parcel at a time.

Recommended single decision forms:

1. **Approve all seven unchanged**, including the six explicit LAB-022 version-1 owner policies.
2. **Approve six unchanged and hold LAB-022**, if Program does not ratify the merge policy yet.
3. **Reject or amend named item sections**, leaving all other sections eligible for approval unchanged.

No covered item may move from `blocked` to `ready` until the corresponding approval is recorded in Lab lane memory. Any implementation that changes an approved API, schema, file set, ownership boundary, compatibility break, rollback or required tests needs a new decision for that item.