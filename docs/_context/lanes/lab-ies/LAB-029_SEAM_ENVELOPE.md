# LAB-029 Provenance Publication Surfaces — Seam Envelope

## Status

- Queue item: `LAB-029-provenance-publication-surfaces`
- Seam version: `1`
- Status: approved unchanged by Program & Integrate on 2026-07-20
- Authorised implementation files:
  - `packages/lab-kernel/ies-toolkit/provenance.html`
  - `packages/lab-kernel/ies-toolkit/provenance_explorer.html`
  - `packages/lab-kernel/ies-toolkit/luminaire_provenance.html`
- Gate: `lab-ies`

This document is the complete approved seam envelope. Approval applies only to version 1 and the exact three-file implementation boundary. Any change to the input projection, ownership boundary, resolver semantics, publication state, file scope or acceptance rules requires a new Program & Integrate decision.

## 1. Purpose

LAB-029 replaces three legacy provenance pages that currently mix presentation with fabricated or unsafe authority behaviour. The approved replacement is a Lab-only, read-only publication preview over existing safe contracts.

The replacement surfaces may:

1. display a governed sealed-reference identity projection supplied by Program-owned integration;
2. display the committed offline fixture projections as explicitly unapproved demo content;
3. list canonical host-free resolver paths and their caller-supplied availability state;
4. display the committed evidence-capability summary without converting readiness into assembly verification; and
5. fail closed on malformed, unsupported, incomplete or conflicting input.

The replacement surfaces must not:

- create, approve, seal, mutate or allocate a reference;
- construct a public or internal resolver host;
- fetch or expose raw evidence bodies, origin IES text, working bytes or private authority state;
- display diagnostic fingerprints as authority verification;
- infer emergency or EWIS assembly verification;
- implement Program persistence, authentication, routing, deployment or storage lookup.

## 2. Ownership boundary

### Lab owns

- presentation in the exact three authorised HTML files;
- validation of the bounded publication projection before rendering;
- explicit fixture/demo labelling;
- fail-closed rendering of unresolved and unavailable data;
- local static use of the exact committed fixture projections described below.

### Program & Integrate retains

- production serial allocation;
- creation and cryptographic sealing of `controlstack.lab.reference.1mm.v1` DTOs;
- resolver origin, hosting, routes and route-to-storage mapping;
- production publication-bundle construction;
- evidence acceptance decisions;
- persistence, authentication, authorisation, deployment and availability;
- all public or internal endpoints.

LAB-029 adds no route, server, loader service or Program implementation.

## 3. Existing approved contracts reused unchanged

LAB-029 may consume only these committed contracts:

1. `projectReferenceIdentity(referenceDto)` output from `nvbReference.js`:
   - schema `controlstack.lab.reference-identity.v1`;
   - version `1`;
   - safe reference identity, exact UTC seal time, authority SHA, reference SHA, canonical host-free resolver path and `readOnly: true` only.
2. `buildResolverPath` / `parseResolverPath` route descriptors from `nvbReference.js`:
   - canonical host-free paths only;
   - no scheme, host, query, fragment, local path or storage path.
3. `summariseEvidenceCapabilities(input)` output from `nvbReference.js`:
   - schema `controlstack.lab.evidence-capability-summary.v1`;
   - version `1`;
   - evidence-readiness categories only;
   - `assemblyVerification.emergency === null`;
   - `assemblyVerification.ewisCartridge === null`.

LAB-029 must not extend, reinterpret or duplicate those contracts.

## 4. Exact publication view model

The three surfaces share one in-memory, read-only view model. It is a seam contract, not a persisted record and not a new authority artifact.

```js
{
  schemaId: "controlstack.lab.provenance-publication-view.v1",
  schemaVersion: 1,
  publicationMode: "governed" | "offline_fixture",
  referenceIdentity: ReferenceIdentityProjection | null,
  fixtureReference: FixtureReferenceProjection | null,
  resolverEntries: Array<ResolverPublicationEntry>,
  evidenceCapabilities: EvidenceCapabilitySummary | null,
  unresolvedFields: string[],
  assemblyVerification: {
    emergency: null,
    ewisCartridge: null
  },
  readOnly: true
}
```

Exactly one of `referenceIdentity` and `fixtureReference` is non-null.

### 4.1 Governed mode

For `publicationMode: "governed"`:

- `referenceIdentity` must be the exact deeply immutable output of `projectReferenceIdentity`;
- `fixtureReference` must be `null`;
- the surfaces must not accept a rich authority record, raw sealed DTO, candela, keywords, approval body, evidence body or working bytes as a substitute;
- resolver availability is caller-supplied presentation state and must not be inferred by probing an unapproved host;
- the UI may show the safe identity seal time and SHA values because they are already part of the approved safe identity projection;
- the UI must not describe a resolver path as live, public or reachable unless Program supplies `state: "available"` in the approved bundle.

### 4.2 Offline fixture mode

For `publicationMode: "offline_fixture"`:

- `referenceIdentity` must be `null`;
- `fixtureReference` must satisfy the exact fixture shape below;
- every resolver entry must have `state: "fixture_only"` or `state: "unavailable"`;
- the page must show a persistent, prominent label containing the exact meaning `OFFLINE DEMO — UNAPPROVED`;
- the page must not use the words `sealed`, `approved`, `verified`, `attested`, `pure reference`, `resolved` or equivalent positive authority wording for fixture data;
- null authority and reference SHA values remain visibly unresolved and must not be replaced by filename suffixes or diagnostic text;
- fixture evidence status `unresolved` must not unlock a capability or verification claim.

The exact accepted `FixtureReferenceProjection` is:

```js
{
  schemaId: "controlstack.lab.fixture.reference.v1",
  schemaVersion: 1,
  fixtureStatus: "offline_demo_unapproved",
  productionAuthority: false,
  referenceId: string,
  referenceKind: "GT" | "OPT" | "MERGED",
  resolverPath: string,
  provenancePath: string,
  originIesRef: string,
  evidenceIndexRef: string,
  reportRefs: string[],
  parentReferenceRefs: string[],
  componentRefs: string[],
  authorityRecordSha256: null,
  referenceSha256: null,
  approvalState: "fixture_only",
  photometryStatus: string,
  assemblyVerification: {
    emergency: null,
    ewisCartridge: null
  },
  unresolvedFields: string[],
  note: string
}
```

The fixture's reference and every referenced path must pass the committed `parseReferenceId` / `parseResolverPath` grammar. Unsupported fields, contradictory authority flags or non-null SHA values fail closed.

## 5. Resolver publication entries

Each `ResolverPublicationEntry` is exactly:

```js
{
  label: string,
  descriptor: ResolverRouteDescriptor,
  path: string,
  state: "available" | "unavailable" | "fixture_only"
}
```

Rules:

- `path` must equal `buildResolverPath(descriptor)` exactly;
- `parseResolverPath(path)` must round-trip to the same descriptor;
- entries are sorted deterministically by `path`, then `label`;
- duplicate paths with conflicting states fail closed;
- `available` is permitted only in governed mode and only when supplied by the approved Program publication bundle;
- fixture mode converts no path to `available`;
- no entry contains an origin, scheme, host, credential, port, query, fragment, absolute local path, UNC path, file URL or storage location;
- no entry carries raw content, a preview snippet or a diagnostic fingerprint.

## 6. Evidence-capability display

`evidenceCapabilities` is either:

- `null`, with `evidence_capabilities` included in `unresolvedFields`; or
- the exact `controlstack.lab.evidence-capability-summary.v1` output from the committed helper.

The surfaces may display `complete` or `incomplete` readiness only as evidence-category coverage. They must always display assembly verification separately as unresolved/null.

The following translations are prohibited:

- evidence readiness → `_EMERGENCY_VERIFIED`;
- evidence readiness → `_EWIS_CARTRIDGE_VERIFIED`;
- evidence readiness → procurement release;
- fixture presence → accepted evidence;
- filename or diagnostic suffix → cryptographic verification.

## 7. Exact surface responsibilities

### 7.1 `provenance.html`

- renders the bounded reference identity or fixture identity summary;
- renders resolver entries, unresolved fields and evidence capabilities;
- does not calculate photometry, UGR, emergency selection, adjudication or capability rules inline;
- contains no embedded replacement reference, component, evidence or mutation catalogue;
- contains no current-time generation or fabricated seal chain.

### 7.2 `provenance_explorer.html`

- lists canonical host-free resolver paths and their supplied state;
- does not open, fetch or preview raw origin IES, evidence, source or report bodies;
- does not expose local static paths or `_local` mappings;
- invalid or unavailable entries remain visibly unresolved and are not silently omitted.

### 7.3 `luminaire_provenance.html`

- renders a read-only relationship tree from the bounded resolver entries;
- does not perform transitive network or filesystem resolution;
- does not reconstruct rich authority or follow private component/evidence bodies;
- does not represent a diagnostic fingerprint, fixture record or unresolved keyword as verified identity.

## 8. Exact committed fixture sources

Offline fixture mode may read only these committed safe projection files through fixed, non-user-controlled relative paths:

```text
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/record.1mm.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/provenance.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000123/evidence/evidence.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-OPT-000124/record.1mm.json
packages/lab-kernel/ies-toolkit/lab/references/NVB-REF-GT-000045/record.1mm.json
```

The surfaces must not fetch or display:

- `origin.ies` bodies;
- evidence text bodies;
- source document bodies;
- absolute paths;
- arbitrary user-supplied URLs;
- any path outside the exact fixture allowlist.

Fixture loading is local Lab demo behaviour only. It does not define or implement the Program resolver.

## 9. Legacy behaviour explicitly retired

The three existing pages contain legacy behaviour outside the approved seam. The replacement must remove or confine all of it, including:

- hard-coded `https://prov.novon.systems` origins and URL claims;
- `devHref` / legacy resolver shims represented as production resolution;
- raw `fetch()` traversal into origin, evidence, source or report bodies;
- display of `_local` paths or local static mappings;
- pseudo references represented as sealed, pure, resolved, verified or attested;
- hard-coded reference IDs, seal dates, fingerprints, mutation chains, evidence claims, equipment details, capability outcomes and component stacks;
- inline duplicate polar, UGR, emergency-selection, adjudication or evidence-capability logic;
- `new Date()` or any clock-generated publication/seal metadata;
- diagnostic `fingerprint` fields represented as authority SHA values;
- direct rendering of `_EMERGENCY_VERIFIED` or `_EWIS_CARTRIDGE_VERIFIED` from unapproved input.

## 10. Failure behaviour

The surfaces fail closed when:

- the view schema or version is unsupported;
- governed and fixture identity modes are both populated or both absent;
- a safe identity projection is malformed;
- fixture flags conflict with unapproved status;
- a route fails canonical parsing or round-trip equality;
- duplicate route states conflict;
- evidence capability schema is malformed;
- assembly verification is non-null;
- unexpected fields attempt to carry private authority, raw bodies, local paths or diagnostic verification.

Fail-closed rendering must:

- show a bounded error or unresolved state;
- display no positive authority badge;
- render no partial private data;
- perform no fallback to embedded pseudo data.

## 11. Mutation, persistence and side effects

The three surfaces are read-only.

They must not:

- mutate caller input or fixture projections;
- write browser storage;
- create downloadable authority, provenance, evidence or reference records;
- upload files;
- POST data;
- allocate IDs;
- generate timestamps;
- call production APIs;
- create a resolver host or endpoint.

A page refresh may clear transient presentation state. No durable state is created.

## 12. Compatibility

The accepted compatibility break is limited to the three authorised legacy pages. They may stop accepting their previous pseudo-rich records, host URLs, fingerprints and raw-body resolver assumptions.

No committed non-Lab caller is authorised to depend on those legacy shapes. Program integration must use the exact approved version-1 publication view and retain all production ownership described above.

## 13. Tests and validation

Before feature checkpoint:

- source inspection must prove removal of legacy hard-coded authority, host, raw-body fetch, local-path and clock behaviour;
- source inspection must prove imports/delegation to the committed identity, resolver and evidence-capability helpers rather than duplicated contract logic;
- deterministic fixture and malformed-input behaviour must be provable from repository evidence;
- the full `lab-ies` gate must pass;
- exactly the three authorised HTML files may be staged;
- feature subject must be `lab: checkpoint provenance publication surfaces`;
- push only `lane/code-pilot-lab`.

No browser action or real-world correctness judgement is required for version-1 acceptance. The exact persistent fixture label, prohibited wording and fail-closed states are repository-verifiable text and source-contract requirements.

## 14. Rollback

Rollback requires no data migration because LAB-029 creates no durable state.

Safe order:

1. revert any dependent later Lab surfaces in reverse order;
2. revert the LAB-029 feature checkpoint;
3. run the full `lab-ies` gate;
4. restore LAB-029 to `blocked` in lane memory;
5. push only `lane/code-pilot-lab`.

Program resolver, storage and authority data remain untouched.

## 15. Approval record

Program & Integrate approved version 1 unchanged on 2026-07-20 for implementation of LAB-029 only.

Program reported:

- gate: 45 passed, 0 failed;
- approval checkpoint: the latest Program commit titled `docs(program): approve LAB-029 provenance seam`;
- Program state: clean and pushed;
- feature implementation, main promotion and downstream activation: not performed.

Approval confirms:

- the exact publication view model;
- reuse of the existing safe identity, resolver-path and evidence-capability contracts unchanged;
- fixture mode remains explicitly unapproved and visibly labelled `OFFLINE DEMO — UNAPPROVED`;
- governed availability is caller-supplied by Program rather than probed by Lab;
- emergency and EWIS assembly verification remain `null`;
- no host, endpoint, resolver, storage, persistence, deployment, raw-evidence publication, sealing or authority ownership moves into Lab;
- exactly the three authorised HTML files may be implemented;
- LAB-029 may move from `blocked` to the single top `ready` item;
- any later contract or ownership change requires a new seam decision.
