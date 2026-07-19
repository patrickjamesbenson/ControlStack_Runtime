# LAB-017 Reference and Resolver Contract — Seam Envelope

## Status

- Queue item: `LAB-017-reference-resolver-contract`
- Seam version: `1`
- Status: approved unchanged by Program & Integrate on 2026-07-19
- Approved envelope checkpoint: `f927ced1ca77c8b11ef8b13b9d6bb3833618844c`
- Approval scope: version 1 and the exact two-file implementation boundary only
- Implementation may proceed only under this envelope.

This document is the complete approved seam envelope. Approval applies only to this version and exact scope. Any interface, data-shape, ownership or file-scope change requires a new Program & Integrate seam decision.

## 1. Contract

### 1.1 Purpose and consumers

LAB-017 replaces the legacy mixed-purpose `nvbReference.js` API with a pure, browser-safe contract for:

1. validating and formatting sealed-reference identities;
2. projecting the minimum safe downstream identity from the committed sealed DTO `controlstack.lab.reference.1mm.v1`;
3. building and parsing canonical resolver paths without implementing a resolver host, storage lookup or network route; and
4. summarising evidence readiness without asserting assembly verification.

Intended consumers:

- later Lab curation, provenance and bench parcels, after their own queue approval;
- Program-owned resolver/storage implementation, which may consume the documented route descriptor and identity projection;
- Engine or Selector only through the sealed DTO, generated project IES or the safe identity projection. They must not consume private authority state or the Lab helper's internal evidence inputs.

Program & Integrate retains ownership of:

- production serial allocation;
- resolver host and base URL;
- route-to-storage mapping;
- database/file-store access;
- persistence, authentication and authorisation;
- public or internal HTTP endpoints;
- deployment and operational availability.

LAB-017 does not create any of those behaviours.

### 1.2 Exported interface

The approved implementation may export only this exact public API:

```js
ReferenceContractError
REFERENCE_IDENTITY_SCHEMA_ID
REFERENCE_IDENTITY_SCHEMA_VERSION
EVIDENCE_CAPABILITY_SCHEMA_ID
EVIDENCE_CAPABILITY_SCHEMA_VERSION
REFERENCE_KINDS
RESOLVER_COMPONENT_KINDS
formatReferenceId(kind, serial) -> string
parseReferenceId(value) -> Readonly<ReferenceIdentityParts> | null
projectReferenceIdentity(referenceDto) -> Readonly<ReferenceIdentityProjection>
buildResolverPath(routeDescriptor) -> string
parseResolverPath(path) -> Readonly<ResolverRouteDescriptor> | null
summariseEvidenceCapabilities(input) -> Readonly<EvidenceCapabilitySummary>
```

Constant values are fixed:

```js
REFERENCE_IDENTITY_SCHEMA_ID = "controlstack.lab.reference-identity.v1"
REFERENCE_IDENTITY_SCHEMA_VERSION = 1
EVIDENCE_CAPABILITY_SCHEMA_ID = "controlstack.lab.evidence-capability-summary.v1"
EVIDENCE_CAPABILITY_SCHEMA_VERSION = 1
REFERENCE_KINDS = ["GT", "OPT", "MERGED"]
RESOLVER_COMPONENT_KINDS = ["chip", "board", "driver", "converter"]
```

All exported arrays are frozen. `ReferenceContractError` contains `name`, `message`, `code` and optional safe `details` only; it contains no raw input body, local path or stack-derived data field.

The module must be pure and deterministic. It must not access the DOM, filesystem, network, browser storage, environment variables, clocks or random values.

### 1.3 Reference identity grammar

Accepted reference kinds and exact prefixes:

| DTO kind | Reference prefix |
|---|---|
| `GT` | `NVB-REF-GT-` |
| `OPT` | `NVB-REF-OPT-` |
| `MERGED` | `NVB-REF-MRG-` |

Accepted reference ID grammar:

```text
^NVB-REF-(GT|OPT|MRG)-([0-9]{6})$
```

Rules:

- serial is an integer from `1` to `999999`;
- `000000`, shortened serials, signs, decimals, whitespace and non-canonical case are rejected;
- `formatReferenceId` throws a bounded contract error for invalid kind or serial;
- `parseReferenceId` returns `null` for invalid input and never coerces an unsupported kind;
- parsed `MRG` maps to DTO kind `MERGED`.

`ReferenceIdentityParts` is exactly:

```js
{
  referenceId: string,
  kind: "GT" | "OPT" | "MERGED",
  serial: number
}
```

### 1.4 Safe sealed-reference identity projection

`projectReferenceIdentity(referenceDto)` accepts only the committed sealed DTO contract:

- `schemaId === "controlstack.lab.reference.1mm.v1"`;
- `schemaVersion === 1`;
- `kind` is `GT`, `OPT` or `MERGED`;
- `id`, `kind` and `serial` agree with the identity grammar;
- `sealedAtUtc` is an exact real UTC millisecond timestamp in `YYYY-MM-DDTHH:mm:ss.sssZ` form;
- `approval.state === "reference"`;
- `authorityRecordSha256` and `referenceSha256` are lower-case raw 64-character SHA-256 hexadecimal strings.

The returned projection is deeply immutable and contains exactly:

```js
{
  schemaId: "controlstack.lab.reference-identity.v1",
  schemaVersion: 1,
  referenceId: string,
  kind: "GT" | "OPT" | "MERGED",
  serial: number,
  sealedAtUtc: string,
  authorityRecordSha256: string,
  referenceSha256: string,
  resolverPath: string,
  readOnly: true
}
```

`resolverPath` is exactly `/r/<referenceId>`.

The projection must not contain or reconstruct:

- candela, angles, G-values, baseline or keyword values;
- approval identity or ratified-check bodies;
- raw evidence, evidence documents or working bytes;
- private rich-authority state;
- local paths or storage locations;
- diagnostic fingerprints;
- emergency or EWIS verification outcomes.

The helper validates only the bounded projection requirements above. It does not replace cryptographic sealing or the complete DTO validator.

### 1.5 Resolver path descriptor

`buildResolverPath` and `parseResolverPath` operate on canonical pathnames only. They do not accept or emit a host name, origin, protocol, query string or fragment.

The exact route union is:

```js
{ kind: "reference", referenceId }
{ kind: "provenance", referenceId }
{ kind: "originIes", referenceId }
{ kind: "evidence", referenceId, artifactName }
{ kind: "report", reportId }
{ kind: "component", componentKind, componentId }
{ kind: "source", sourceId }
```

Canonical paths are exactly:

```text
/r/<referenceId>
/p/<referenceId>
/r/<referenceId>/origin.ies
/r/<referenceId>/evidence/<artifactName>
/reports/<reportId>
/c/<componentKind>/<componentId>
/s/<sourceId>
```

Rules:

- `referenceId` must pass the exact identity grammar;
- `componentKind` is one of `chip`, `board`, `driver`, `converter`;
- `artifactName`, `reportId`, `componentId` and `sourceId` are single safe opaque segments matching `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`;
- `.` and `..` are rejected;
- empty segments, repeated separators, backslashes, percent-encoded separators, encoded traversal, control characters and surrounding whitespace are rejected;
- schemes, hosts, credentials, ports, query strings and fragments are rejected;
- `file:` URLs, drive paths, UNC paths, absolute local paths and traversal paths are rejected;
- unsupported paths return `null` from `parseResolverPath`;
- `buildResolverPath` throws a bounded contract error for invalid descriptors;
- returned descriptors are deeply immutable.

Program may prepend its approved resolver origin to a canonical path. The Lab module does not own or hard-code that origin.

### 1.6 Evidence capability summary

The sealed DTO contains an opaque `provenanceRefs.evidenceIndex` reference, not raw evidence entries. LAB-017 therefore does not read evidence from the DTO and does not resolve evidence storage.

`summariseEvidenceCapabilities` accepts exactly:

```js
{
  referenceId: string,
  entries: Array<{
    evidenceType: string,
    status: "accepted" | "rejected" | "unresolved"
  }>
}
```

Rules:

- `referenceId` must pass the exact identity grammar;
- `evidenceType` must match `^[A-Z0-9][A-Z0-9-]{0,63}$`;
- duplicate entries with the same status collapse deterministically;
- conflicting statuses for the same evidence type fail closed;
- only `accepted` entries satisfy a requirement;
- unknown evidence types are retained as non-satisfying observations and cannot unlock a capability;
- inputs are not mutated.

The fixed evidence-readiness requirements are:

| capabilityId | Required accepted evidence types |
|---|---|
| `general_optical_use_and_ies_scaling` | `LM-79` |
| `rated_life_l70_b10` | `LM-80`, `TM-21` |
| `reference_optic_efficiency` | `LM-79` |
| `emergency_evidence_readiness` | `THERMAL`, `POWER`, `LM-80`, `BATTERY-COLD`, `BATTERY-HOT`, `EMERGENCY-CONVERTER` |

The return value is deeply immutable and exactly:

```js
{
  schemaId: "controlstack.lab.evidence-capability-summary.v1",
  schemaVersion: 1,
  referenceId: string,
  capabilities: Array<{
    capabilityId: string,
    state: "complete" | "incomplete",
    requiredEvidenceTypes: string[],
    missingEvidenceTypes: string[]
  }>,
  assemblyVerification: {
    emergency: null,
    ewisCartridge: null
  },
  readOnly: true
}
```

Capability rows use the fixed order shown above. `missingEvidenceTypes` follows requirement order.

`emergency_evidence_readiness === "complete"` means only that the fixed evidence categories are present and accepted. It must never be translated into `_EMERGENCY_VERIFIED`, an emergency-capable product claim or an approved assembly outcome.

No EWIS readiness matrix is approved in this parcel. `_EMERGENCY_VERIFIED` and `_EWIS_CARTRIDGE_VERIFIED` remain independent assembly-owned Lab provenance outcomes.

### 1.7 Legacy API removed from the seam

The current untracked helper mixes safe parsing with resolver deployment assumptions, dev-file paths, provisional allocation, alternate record schemas and derived verification claims. The approved implementation must not export or preserve these legacy behaviours:

```text
PROV_HOST
refUrl
LAB_STORE
devHref
urlFor
newGearTrayRecord
newOpticRecord
provenanceContext
emergencyCapable
capabilities
```

`makeRefId`, `parseRefId` and `resolveKind` are also retired names. Later Lab surface parcels must adopt the approved names and shapes explicitly rather than relying on compatibility aliases.

The module must not create blank GT/OPT record templates, assign serials, stamp records, create resolver URLs, map to static dev files or derive assembly verification.

## 2. Scope

### 2.1 Approved implementation files

Exactly these files:

```text
packages/lab-kernel/ies-toolkit/nvbReference.js
tests/lab-kernel/nvbReference.test.js
```

The focused test file is part of the proposed seam scope because the current gate has no dedicated coverage for this module.

### 2.2 Documentation files for this pre-approval envelope

Exactly these lane-memory paths may change before implementation approval:

```text
docs/_context/lanes/lab-ies/LAB-017_SEAM_ENVELOPE.md
docs/_context/lanes/lab-ies/WORK_QUEUE.md
docs/_context/lanes/lab-ies/LANE_STATE.md
docs/_context/lanes/lab-ies/DECISION_LOG.md
docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md
docs/_context/lanes/lab-ies/SESSION_HANDOFF.md
```

### 2.3 Explicit boundaries

LAB-017 must not change:

- `iesReferenceDto.js`, its schema or sealing behaviour;
- rich authority, approval, provenance, handoff or cryptographic modules;
- any HTML/CSS surface;
- NVB fixtures or resolver fixture corpus;
- `nvbResolve.js`, `nvbComponents.js` or `nvbLabAdapter.js`;
- Program, Runtime, Engine or Selector source;
- server, webhook, API, database or persistence code;
- resolver host configuration or storage mapping;
- serial allocation or identity persistence;
- outgoing keyword ownership or values;
- emergency or EWIS assembly verification.

No donor file is copied. No public route is introduced.

## 3. Compatibility

### 3.1 Current direct consumers

Repository search found no committed Program, Runtime, Engine, Selector or test consumer importing `nvbReference.js`.

The current direct imports are protected untracked Lab prototypes:

```text
packages/lab-kernel/ies-toolkit/bench.html
packages/lab-kernel/ies-toolkit/curator.html
packages/lab-kernel/ies-toolkit/luminaire_provenance.html
packages/lab-kernel/ies-toolkit/provenance_explorer.html
packages/lab-kernel/ies-toolkit/reference_builder.html
```

They currently depend on retired legacy exports. LAB-017 will not modify or stage those files. They may stop working against the new module until their own later queue parcels migrate them to the approved contract.

### 3.2 Stable upstream dependency

LAB-017 consumes the committed sealed DTO identity fields only. It does not change `controlstack.lab.reference.1mm.v1`.

A future sealed DTO schema/version change requires a separate owner decision and Program & Integrate review. LAB-017 must fail closed on any unsupported schema ID or version.

### 3.3 Downstream compatibility rule

The following shapes are versioned seams:

- `controlstack.lab.reference-identity.v1`;
- `controlstack.lab.evidence-capability-summary.v1`;
- the resolver route descriptor union in this document.

After approval and implementation, fields may not be removed, renamed, retyped or given new meanings without a new schema version and renewed Program & Integrate approval. New resolver route kinds or component kinds also require renewed approval.

Program may implement an adapter from these shapes into Program-owned storage or HTTP behaviour. The Lab lane must not assume that implementation exists.

### 3.4 Breakage if changed without coordination

Uncoordinated changes can cause:

- Program resolving the wrong artifact or rejecting a valid reference path;
- downstream identity pinning to the wrong kind, serial or hash;
- stale or malformed references being treated as trusted;
- local paths or arbitrary hosts escaping into governed records;
- evidence presence being misrepresented as emergency/EWIS assembly verification;
- later Lab surfaces silently depending on an unversioned shape.

The fail-closed and versioning rules are therefore part of the seam, not implementation detail.

## 4. Rollback

LAB-017 has no data migration, persisted state, database write, route deployment or external side effect.

Safe rollback procedure:

1. stop any not-yet-merged consumer parcel that depends on the LAB-017 feature checkpoint;
2. revert the single LAB-017 feature commit containing only `nvbReference.js` and `nvbReference.test.js`;
3. run the full `lab-ies` gate and push the revert only to `lane/code-pilot-lab`;
4. mark LAB-017 blocked again in lane memory and retain this envelope as historical evidence.

If a later Lab consumer has already been committed, revert dependent consumers in reverse dependency order before reverting LAB-017.

Rollback does not require restoring a database, changing a resolver host, deleting artifacts or touching Program/Selector/Engine code because LAB-017 owns none of those resources.

The protected untracked legacy surfaces remain untouched throughout implementation and rollback.

## 5. Tests and acceptance proof

### 5.1 Focused test file

`tests/lab-kernel/nvbReference.test.js` must prove the following.

#### Valid identity cases

- format and parse GT, OPT and MERGED identities;
- exact six-digit serial formatting;
- MRG prefix maps to `MERGED`;
- parse/format round trip is deterministic.

#### Invalid identity cases

- unsupported kind;
- serial `0`, negative, decimal or greater than `999999`;
- `000000`;
- fewer or more than six digits;
- whitespace, lower-case, signs and malformed prefixes;
- mismatched DTO `id`, `kind` and `serial`.

#### Identity projection cases

- exact accepted DTO schema/version and approval state;
- exact returned field set and values;
- deeply immutable output;
- input remains unmodified;
- rejection of unsupported schema/version, non-reference approval state, invalid UTC, missing/invalid hashes and identity mismatch;
- proof that candela, keywords, baseline, evidence bodies, private authority fields and diagnostic fingerprints do not appear in the projection.

#### Resolver success cases

- build/parse round trip for all seven route kinds;
- exact canonical path strings;
- immutable parsed descriptors;
- component-kind allowlist.

#### Resolver failure cases

- HTTP/HTTPS URLs and arbitrary hosts;
- `file:` URLs, drive paths and UNC paths;
- query strings, fragments and credentials;
- backslashes, repeated separators and empty segments;
- `.` or `..` traversal;
- percent-encoded slash, backslash or traversal;
- unsafe or overlength opaque segments;
- unsupported route or component kind;
- malformed reference IDs.

#### Evidence summary success cases

- fixed capability ordering and requirement ordering;
- accepted evidence completes only the relevant rows;
- rejected and unresolved evidence do not satisfy requirements;
- unknown evidence types do not unlock capabilities;
- same-status duplicates collapse deterministically;
- output is deeply immutable and input is unmodified;
- emergency/EWIS assembly verification remains exactly `null`.

#### Evidence summary failure cases

- invalid reference ID;
- malformed entry, type or status;
- conflicting statuses for the same evidence type;
- unsupported input fields where strict shape validation is applied.

#### Static boundary cases

- no filesystem, network, browser-storage, DOM, clock, random or environment access;
- no Node-only import;
- no legacy alternate schema IDs;
- no retired legacy export;
- no reverse-authority reconstruction API.

### 5.2 Gate proof

Before the feature commit:

- focused changed-file validation must pass;
- the dedicated test file must pass;
- the full `lab-ies` gate must pass;
- staged files must equal the two approved implementation paths exactly.

The gated feature commit subject remains:

```text
lab: checkpoint reference resolver contract
```

After implementation, the four standard lane-memory files must be updated, the full gate rerun, and the documentation closeout committed through the gated path.

### 5.3 Program approval record

Program & Integrate approved `LAB-017-reference-resolver-contract` version `1` unchanged on 2026-07-19. The approval identifies the committed envelope checkpoint, covers exactly the two implementation files, accepts the named legacy-prototype compatibility break, and retains Program ownership of production allocation, resolver hosting, routing, storage, persistence, authentication, deployment and endpoints.

LAB-017 may move from `blocked` to `ready`. Any change to this approved envelope requires a new seam decision.
