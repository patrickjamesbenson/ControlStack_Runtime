# REPORT — HubSpot Connectivity Reconnaissance

Status: READ-ONLY RECONNAISSANCE COMPLETE  
Lane: Program & Integrate  
Root: `C:\ControlStack_Worktrees\program-integrate`  
Branch: `lane/program-integrate`  
Gate: `program-integrate`  
Prepared for: cross-lane HubSpot connectivity advisor  
Mutation performed: this report file only; no feature code modified, staged, or committed

## Evidence rules used

- **VERIFIED** means the claim is supported by current repository code or current connected-app configuration.
- **DENIED** means current repository code contradicts the claim.
- **UNVERIFIED** means no readable repository evidence confirms the claim.
- **SCOPE-BLOCKED** means the named source is outside the lane's effective readable evidence because the configured root is unavailable; no workaround or inference was used.

---

## 1. HubSpot surface today

### 1.1 Verdicts on the requested claims

| Claim | Verdict | Repository truth |
|---|---|---|
| Read-only contact lookup exists | **VERIFIED** | `server.js` implements exact-email contact search against HubSpot CRM v3 and returns a read-only result. |
| Read-only company lookup exists | **VERIFIED** | `server.js` implements exact-domain, then exact-name, company search against HubSpot CRM v3 and returns a read-only result. |
| Read-only deal lookup exists | **DENIED** | No deal search implementation exists. No `lookupHubspotDeal` symbol and no HubSpot search with `objectType: "deals"` exists. `crmService.js` returns a deferred, null deal snapshot. |
| Deal writeback is hard-blocked | **VERIFIED** | The only deal-writeback endpoint is preflight-only, always adds `write-policy-disabled`, sets `dryRun: true`, `providerMutationAttempted: false`, `providerCallAttempted: false`, and `liveWriteAllowed: false`. |
| `writePolicy.enabled` is false | **VERIFIED** | It is false in the runtime auth status, read endpoint, deal preflight, shell adapter, CRM service, project association, handoff/share, saved-project capabilities, and diagnostics. |

### 1.2 Runtime endpoints

`server.js` defines exactly three HubSpot routes:

```js
const HUBSPOT_READ_PATH = "/api/hubspot/read";
const HUBSPOT_AUTH_STATUS_PATH = "/api/hubspot/auth-status";
const HUBSPOT_DEAL_PREFLIGHT_PATH = "/api/hubspot/deal-writeback/preflight";
```

#### `GET /api/hubspot/auth-status`

Implemented in `server.js` by `hubspotAuthStatus()` and exposed through `publicHubspotAuthStatus()` so the token itself is removed before response.

Important returned fields include:

```js
{
  owner: "runtime-server",
  provider: "hubspot",
  status,
  configured,
  available: configured,
  primaryAuthMode: "oauth-server-bearer",
  activeAuthMode: mode,
  requestedAuthMode: requestedMode || "oauth",
  tokenSource: selected.tokenSource,
  tokenPresent: Boolean(selected.token),
  readOnly: true,
  nonBootCritical: true,
  browserSecretsExposed: false,
  repoLocalSecrets: false,
  writePolicy: {
    enabled: false,
    reason: "HubSpot writes and deal sync are disabled."
  }
}
```

#### `GET /api/hubspot/read`

Query inputs read by `sendHubspotRead()`:

- `email`
- `domain`
- `companyName`

It performs two possible CRM reads:

```js
async function lookupHubspotContact(token, email) {
  const page = await hubspotSearch({
    objectType: "contacts",
    token,
    filters: [{ propertyName: "email", operator: "EQ", value: email }],
    properties: [
      "email",
      "firstname",
      "lastname",
      "company",
      "lifecyclestage",
      "hs_lead_status",
      "hubspot_owner_id"
    ],
  });
  ...
}
```

```js
async function lookupHubspotCompany(token, { domain, companyName }) {
  // First search: domain EQ explicit domain.
  // Second search: name EQ companyName.
  properties: [
    "name",
    "domain",
    "website",
    "lifecyclestage",
    "hubspot_owner_id",
    "city",
    "state",
    "country"
  ]
}
```

The outbound provider call is:

```js
fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  ...
});
```

The runtime applies two trust checks before accepting results:

- contact email must exactly match the queried email;
- company must exactly match an explicitly supplied non-public domain or exact company name.

The response is always marked read-only and carries:

```js
writePolicy: {
  enabled: false,
  reason: "HubSpot writes are disabled."
}
```

A derived email domain is shown in the response query, but company lookup deliberately receives `explicitDomain`, not the automatically derived public email domain.

#### `GET /api/hubspot/deal-writeback/preflight`

This is not a write endpoint. It accepts these query fields:

```js
{
  action,
  projectId,
  projectName,
  projectStatus,
  clientName,
  siteName,
  contactId,
  companyId,
  dealId,
  associationSource
}
```

Allowed actions are:

```js
new Set([
  "create-deal",
  "link-existing-deal",
  "update-linked-deal",
  "no-op"
]);
```

The preflight always appends this blocker:

```js
{
  code: "write-policy-disabled",
  severity: "intentional-block",
  reason: "HubSpot deal writeback is preflight-only. No provider mutation is enabled in this foundation."
}
```

The returned execution controls are explicit:

```js
{
  source: "server-hubspot-deal-writeback-preflight-only",
  preflightOnly: true,
  dryRun: true,
  providerMutationAttempted: false,
  providerCallAttempted: false,
  writePolicy: {
    enabled: false,
    liveProviderWritesEnabled: false,
    reason: "HubSpot deal writeback is disabled. This endpoint only reports safe preflight readiness and intended action."
  },
  readiness: {
    ...,
    liveWriteAllowed: false
  }
}
```

No HubSpot deal provider call is present behind this route.

### 1.3 Credential source and auth modes

The code expects HubSpot credentials only from the runtime process environment. It does not read a repository secret file and does not expose a token to the browser.

Default/primary mode:

```js
CONTROLSTACK_HUBSPOT_AUTH_MODE = "oauth" // default when unset
```

OAuth-derived server bearer token candidates, in precedence order:

1. `HUBSPOT_OAUTH_ACCESS_TOKEN`
2. `HUBSPOT_ACCESS_TOKEN`

Optional static/private-token mode is disabled by default. It requires both:

```js
CONTROLSTACK_HUBSPOT_AUTH_MODE = static | static-token | private | private-app | private-app-token
CONTROLSTACK_HUBSPOT_STATIC_TOKEN_ENABLED = true
```

Static/private token candidates, in precedence order:

1. `HUBSPOT_STATIC_TOKEN`
2. `HUBSPOT_PRIVATE_APP_TOKEN`
3. `HUBSPOT_TOKEN`

The runtime reports:

```js
browserSecretsExposed: false
repoLocalSecrets: false
nonBootCritical: true
```

**Deployment truth:** `scripts/deployment-v2/controlstack-services.v2.json` currently defines no HubSpot environment variables and no HubSpot protected-secret entry. Therefore the application code supports external environment injection, but Deployment v2 does not currently provision those credentials.

### 1.4 Deal-writeback mapping configuration expected by code

`server.js` checks these non-secret environment values for future preflight readiness:

- `CONTROLSTACK_TENANT_ID`
  - alias: `CONTROLSTACK_OCCURRENCE_TENANT_ID`
- `CONTROLSTACK_OCCURRENCE_ID`
- `CONTROLSTACK_HUBSPOT_PROVIDER_PROFILE_ID`
- `CONTROLSTACK_HUBSPOT_DEAL_MAPPING_PROFILE_ID`
- `CONTROLSTACK_HUBSPOT_CONTACT_MAPPING_PROFILE_ID`
- `CONTROLSTACK_HUBSPOT_COMPANY_MAPPING_PROFILE_ID`
- `CONTROLSTACK_HUBSPOT_DEAL_PIPELINE_ID`
- `CONTROLSTACK_HUBSPOT_DEAL_STAGE_ID`

Only `CONTROLSTACK_HUBSPOT_DEAL_MAPPING_PROFILE_ID` currently controls `mappingReadyForPreflight`. None of these values enables writes.

### 1.5 Shell/runtime modules and configuration surfaces

#### Active connectivity and context code

- `server.js`
  - owns all three routes, environment auth selection, HubSpot CRM v3 contact/company reads, response trust checks, and deal-writeback preflight.
- `packages/workspace-kernel/hubspotContextAdapter.js`
  - shell placeholder with `available: false` and `writePolicy.enabled: false`.
- `packages/workspace-kernel/crmService.js`
  - calls `/api/hubspot/read`, resolves read-only contact/company context, builds the project CRM association, and returns a deferred deal context.
- `packages/workspace-kernel/services.js`
  - instantiates `createCrmService()` and exposes it as shell service `crm`.
- `packages/workspace-kernel/adminToolRegistry.js`
  - declares protected admin entries for auth status, read status, deal-writeback preflight, and a deferred repair/relink tool.

Exact admin-tool definitions:

| Tool ID | Mode | Source |
|---|---|---|
| `hubspot.auth-status` | `read-only` | `/api/hubspot/auth-status` |
| `hubspot.read-status` | `read-only` | `/api/hubspot/read` |
| `hubspot.deal-writeback-preflight` | `preflight-only` | `/api/hubspot/deal-writeback/preflight` |
| `hubspot.repair-relink` | `repair-write` declaration only | `statusSource: "deferred"`, `healthSource: "deferred"` |

The repair/relink registry entry is not backed by an implemented HubSpot endpoint. Treat it as declared future admin shape, not live capability.

#### Shell ownership and policy code

- `packages/workspace-kernel/contracts.js`
  - assigns `companyContext`, `crmContext`, `hubspotContext`, and `hubspotWritePolicy` to `shell`.
  - still declares `hubspotWrites`, `hubspotAuth`, and `hubspotSync` as `deferred-real-implementation`; this is partly stale because server-side auth/read status now exists.
- `packages/workspace-kernel/authService.js`
  - reports HubSpot writes as deferred.
- `packages/workspace-kernel/authorityService.js`
  - states HubSpot/company context is CRM enrichment only, not visibility authority.
- `packages/workspace-kernel/projectService.js`
- `packages/workspace-kernel/projectBrowserService.js`
- `packages/workspace-kernel/savedProjectStore.js`
- `packages/workspace-kernel/handoffSharePackage.js`
  - all keep HubSpot delivery/write capability false.

#### Shell UI surfaces

- `apps/workspace-shell/index.html`
  - says HubSpot writes are not live;
  - says HubSpot/company context is CRM enrichment, not authority;
  - includes a direct external HubSpot portal link;
  - uses `apps/workspace-shell/assets/hubspot-rail-icon.svg`.
- `apps/workspace-shell/src/moduleStatusRegistry.js`
  - declares:

```js
{
  id: "hubspot_project_context",
  label: "HubSpot / Project Context",
  badge: "context",
  contract: "partial shell/project context integration",
  runtime: "visible/linkage exists where already implemented",
  authority: "project/customer context only; not product/proof/selector authority",
  uiEvidence: "shell/project/admin surfaces",
  nextStep: "keep separate from module status unless formalised as a module"
}
```

- `apps/workspace-shell/src/shell.js`
  - consumes read-only CRM context for company-name assistance and diagnostics;
  - reports CRM read status and write disabled state;
  - does not perform a provider write.

#### Fail-closed workflow/safety carriers

The following runtime modules are not additional HubSpot integrations. They carry false flags, deny raw CRM/contact payloads, or reject HubSpot write attempts:

- `packages/workspace-kernel/engineRunTableControlledDonorEngineVerifyBridge.js`
- `packages/workspace-kernel/engineRunTableControlledRealSourceSealedEvidenceProbe.js`
- `packages/workspace-kernel/engineRunTableDomain.js`
- `packages/workspace-kernel/engineRunTableSafeSelectedResultSourceObject.js`
- `packages/workspace-kernel/engineRunTableSealedCandidateAssemblyPreview.js`
- `packages/workspace-kernel/engineRunTableSelectedResultAdapter.js`
- `packages/workspace-kernel/engineRunTableSelectedResultHandoffScaffold.js`
- `packages/workspace-kernel/runTableSelectedResultSourceContract.js`
- `packages/workspace-kernel/selectedResultProjectionService.js`
- `packages/workspace-kernel/selectorReferenceOptionsService.js`

Representative enforced fields are:

```js
hubSpotCrmWriteBackEnabled: false
hubSpotWriteEnabled: false
hubSpotPush: disabled
hubSpotCrmWriteBack: disabled
```

The corresponding tests repeatedly assert that a true HubSpot-write flag is rejected as `hubspot-write-not-approved`.

### 1.6 Exact deal truth in shell context

`packages/workspace-kernel/crmService.js` contains no deal lookup. Its deal context is:

```js
function dealSnapshot() {
  return {
    owner: "shell",
    status: "deferred",
    dealId: null,
    dealName: null,
    source: "deferred",
    reason: "Deal context and HubSpot mutations are deferred."
  };
}
```

The project association can carry a deal only if another future source supplies a non-null `deal.dealId`; the current service never does.

---

## 2. Donor HubSpot shape

### 2.1 Donor source availability

Configured donor-reference root:

`C:\ControlStack_Worktrees\program-integrate\.disabled-donor-reference`

Current connected-app truth:

```text
donor_reference_exists: false
```

Therefore the reported donor project type and its exact structure are **SCOPE-BLOCKED**. The following reported field names cannot be confirmed from this lane:

- `hubspotDealId` — **UNVERIFIED / SCOPE-BLOCKED**
- `hubspotContactId` — **UNVERIFIED / SCOPE-BLOCKED**
- `hubspotCompanyId` — **UNVERIFIED / SCOPE-BLOCKED**

No workaround was used. The current repository contains no readable donor type definition carrying all three fields.

`docs/donor-reference` contains only:

- `docs/donor-reference/selector/DONOR_TRACE_RULES.md`

That document is not a donor project data model.

### 2.2 Current runtime project fixture shape

`packages/workspace-kernel/projectService.js` defines each current-project fixture with exactly these fields:

```js
{
  projectId,
  title,
  client,
  site,
  readiness,
  source
}
```

The concrete fixtures are:

```js
{
  projectId: "project-alpha",
  title: "Alpha Linear Workspace",
  client: "Alpha Client",
  site: "Sydney",
  readiness: "fixture-current-project",
  source: "phase-7-shell-project-selection-fixture"
}
```

```js
{
  projectId: "project-bravo",
  title: "Bravo Emergency Review",
  client: "Bravo Client",
  site: "Parramatta",
  readiness: "fixture-current-project",
  source: "phase-7-shell-project-selection-fixture"
}
```

```js
{
  projectId: "project-charlie",
  title: "Charlie Scene Planning",
  client: "Charlie Client",
  site: "Newcastle",
  readiness: "fixture-current-project",
  source: "phase-7-shell-project-selection-fixture"
}
```

`fixtureToCurrentProject()` copies only those same six fields.

### 2.3 What the runtime fixture dropped

Relative to the reported donor field names, the current runtime fixture omits all three:

```text
hubspotDealId    absent
hubspotContactId absent
hubspotCompanyId absent
```

This omission is **VERIFIED** for the runtime fixture. Whether those fields were actually present in the donor project type is **UNVERIFIED / SCOPE-BLOCKED**.

A repository-wide exact-field search found no active runtime data structure carrying the three reported names. The only `hubspotContactId` occurrences are deny-list/safety-pattern test material; they are not project identity fields.

---

## 3. Project persistence

### 3.1 `savedProjectStore` is real

**VERIFIED.** `packages/workspace-kernel/savedProjectStore.js` implements active save, list, inspect, restore, hydrate, and handoff/share package preparation.

`packages/workspace-kernel/services.js` instantiates it directly:

```js
const savedProjectStore = createSavedProjectStore({ eventBus });
```

The service reports these capabilities as live:

```js
{
  save: true,
  restore: true,
  hydrate: true,
  handoff: true,
  share: true,
  externalDelivery: false,
  emailSend: false,
  hubspotWrite: false
}
```

### 3.2 It is memory-only / volatile

**VERIFIED for the current implementation.** State is held inside the `createSavedProjectStore()` closure:

```js
const state = {
  ...,
  fixtureEnvelopes: FIXTURE_ENVELOPES.map(clone),
  savedEnvelopes: [],
  ...
};
```

Its combined inventory is:

```js
function allEnvelopes() {
  return [...state.savedEnvelopes, ...state.fixtureEnvelopes];
}
```

No storage dependency is injected. Searches in `savedProjectStore.js` found no use of:

- `localStorage`
- `sessionStorage`
- `indexedDB`
- `fetch(`
- `readFile`
- `writeFile`

The shell service creates a fresh store instance in memory. `server.js` also creates a separate in-process store instance for selected-project server-owned registration:

```js
const selectedProjectEngineRunHostSavedProjects = createSavedProjectStore();
```

Consequences:

- saved envelopes survive only for the lifetime of that JavaScript service instance;
- a runtime restart recreates an empty `savedEnvelopes` array;
- shell and server instances are not a durable shared database;
- the two built-in fixture envelopes are reconstructed from code on startup.

The two saved-project fixture envelope identities are `saved-alpha` and `saved-bravo`; they are read-only fixture envelopes and are deliberately not restore-eligible as runtime-saved records.

### 3.3 Project identity is a hardcoded alpha/bravo/charlie fixture

**VERIFIED.** Current-project selection defaults to:

```js
selectedProjectId: PROJECT_FIXTURES[0].projectId
```

That is `project-alpha`. Available current-project identities are hardcoded `project-alpha`, `project-bravo`, and `project-charlie` as quoted in section 2.2.

A restored runtime envelope can temporarily replace the current fixture in memory, but there is no durable project identity store.

### 3.4 UI/service status mismatch

**VERIFIED.** The shell service reports save/restore/hydrate live, while several module-facing copies still say deferred.

Stale copy in `packages/modules/cs-selector/selectorViewModel.js`:

```js
"Save is shell-owned and deferred",
"Restore is shell-owned and deferred",
"Handoff is shell-owned and deferred",
"CRM writes are shell-owned and deferred"
```

The same save/restore deferred wording also appears in:

- `packages/modules/emergence/emergenceViewModel.js`
- `packages/modules/scene-builder/sceneBuilderViewModel.js`

`packages/workspace-kernel/contracts.js` also still declares:

```js
saveRestore: "deferred-real-implementation"
handoff: "deferred-real-implementation"
```

Current service truth in `projectService.js`, `savedProjectStore.js`, `projectBrowserService.js`, and `services.js` says save/restore/hydrate and package preparation are live.

Important distinction:

- **live now:** in-memory save, runtime-envelope restore, hydration preparation/callback tracking, handoff/share package preparation;
- **not live:** durable storage, external delivery, email sending, HubSpot writeback;
- **fixture-only deferred text:** fixture envelopes still contain old P2/P3 wording and remain intentionally non-restorable.

---

## 4. Deployment v2 service manifest

### 4.1 Current service definition shape

The manifest is:

`scripts/deployment-v2/controlstack-services.v2.json`

A managed service definition currently carries:

```json
{
  "id": "unique-lowercase-hyphen-id",
  "name": "Human-readable name",
  "port": 0000,
  "executable": "C:\\absolute\\path\\to\\program.exe",
  "args": ["argument", "argument"],
  "cwd": "C:\\absolute\\working\\directory",
  "credential": "none",
  "protectedSecretIds": [],
  "health": {},
  "env": {}
}
```

There is no field named `folder`. The working folder is `cwd`.

There is no single `startCommand` string. The start command is represented by:

- `executable`
- `args[]`
- `cwd`
- `env{}`

The service host executes:

```js
spawn(service.executable, service.args, {
  cwd: service.cwd,
  env: childEnv,
  windowsHide: true,
  stdio: ["ignore", logHandle, logHandle]
});
```

### 4.2 Required fields and validation

The service-host validator requires:

- `id`
  - lowercase letters, digits, hyphens only;
  - unique.
- `name`
  - consumed by manager/UI and startability errors; every current entry supplies it.
- `port`
  - integer;
  - unique across services and control UI;
  - not `8787`.
- `executable`
  - absolute Windows path;
  - must exist before start/install verification.
- `args`
  - array.
- `cwd`
  - absolute Windows path;
  - must exist.
- `credential`
  - current installer accepts only `none` or `control-plane-api-key`.
- `protectedSecretIds`
  - array;
  - each ID must exist in top-level `protectedEnvironment` and authorise that service.
- `health`
  - current manager supports:
    - TCP: `{ "type": "tcp", "host": "127.0.0.1", "port": n }`
    - HTTP: `{ "type": "http", "url": "...", "acceptedStatus": [200] }`
    - HTTP body: `{ "type": "http-body", "url": "...", "acceptedStatus": [200], "body": "ready" }`
- `env`
  - object of child-process environment entries.

Protected secret restriction today:

- the only defined protected environment item is `logodev-publishable-key`;
- it may be injected only into `selector-runtime`;
- every other service must currently have `protectedSecretIds: []`.

A HubSpot sandbox service needing a protected token therefore cannot use the existing protected-secret array without first extending the protected-environment model and its validators. Plaintext HubSpot secrets should not be placed in `env`.

### 4.3 Adding a new sandbox service is not a manifest-only change

**VERIFIED.** Deployment v2 is hard-locked to exactly eight services.

`scripts/CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs` states:

```js
if (!Array.isArray(manifest.services) || manifest.services.length !== 8) {
  throw new Error("Exactly eight services are required.");
}
```

Other fixed-topology assumptions include:

- installer self-test requires exactly three `control-plane-api-key` tunnel services;
- topology validation requires exactly eight returned services;
- manager self-test expects eight services;
- install/readiness checks repeatedly require all eight ports;
- `tests/controlstackDeploymentV2.test.js` asserts:
  - `manifest.services.length === 8`;
  - exact current sorted port set `[8000, 8021, 8022, 8080, 8081, 8082, 8788, 8899]`;
  - exact eight-service readiness/topology behavior.

Therefore registering a ninth HubSpot sandbox service would require, at minimum:

1. a new manifest service object with the fields above;
2. a unique loopback port and health contract;
3. a real executable and absolute `cwd`;
4. environment and credential/protected-secret design;
5. changes to installer fixed-count validation;
6. changes to lane manager/service-host fixed-topology validation where applicable;
7. updates to exact topology and port-set tests;
8. updates to deployment decision/runbook documents that define the accepted eight-service topology.

No new service should be treated as registered until the manager, installer, health checks, tests, and protected-secret boundary all accept the expanded topology.

---

## 5. Existing contracts and program constraints

No program-context document currently names HubSpot or CRM directly. The repository nevertheless has existing generic contracts that govern a HubSpot connectivity change.

### `packages/workspace-kernel/contracts.js`

Constrains ownership now:

- shell owns company context, CRM context, HubSpot context, and HubSpot write policy;
- module code does not independently own provider writes;
- HubSpot write/sync remains declared deferred.

### `apps/workspace-shell/src/moduleStatusRegistry.js`

Constrains authority:

- HubSpot is project/customer context only;
- it is not product, proof, Selector, or visibility authority;
- it should remain separate from formal module status until explicitly formalised.

### `packages/workspace-kernel/authorityService.js`

Constrains role/visibility decisions:

- HubSpot/company context is enrichment only and cannot determine authority.

### `docs/_context/program/CONTROLSTACK_ORCHESTRATION_CONTRACT.md`

Requires Program approval before a change that:

- changes a payload or artifact schema;
- changes authority/source precedence;
- changes blocked/error semantics;
- introduces a new producer or consumer;
- activates a reserved transport;
- changes persistence/readback identity;
- needs coordinated cross-lane changes.

A HubSpot provider service, CRM association schema, durable project IDs, or writeback/readback path would trigger this rule. The proposing lane must supply old/new contract, migration, compatibility, rollback, tests, and affected consumers.

### `docs/_context/program/CONTROLSTACK_SEAM_CONTRACTS.md`

Constrains stable output/persistence seams:

- stable outputs need explicit schema/version, producer gate, consumer compatibility, sealed/live receipt, and rollback/compatibility treatment;
- persisted/readback data must have sufficient identifiers for audit and must not depend on mutable in-memory UI state;
- consumer widening must not precede producer acceptance.

This directly conflicts with treating the current volatile `savedProjectStore` as durable CRM association persistence.

### `docs/_context/program/CONTROLSTACK_DECISION_LOG.md`

Repeatedly reserves to Program:

- persistence;
- authentication;
- deployment;
- endpoint ownership;
- route-to-storage mapping.

A new HubSpot credential mechanism, service, route, durable association store, or write endpoint is Program-owned integration work, not an unreviewed lane-local extension.

### `docs/_context/program/CONTROLSTACK_DEPLOYMENT_V2_DECISION.md`

Constrains deployment topology and credentials:

- exactly eight managed services are accepted today;
- one protected runtime API key is shared only by the three tunnels;
- unknown/external services remain outside the manager;
- each managed entry must be independently observable and identity-checked.

### `docs/_context/program/CONTROLSTACK_DEPLOYMENT_V2_RUNBOOK.md`

Constrains secret handling:

- the existing tunnel API key is DPAPI-protected under the Windows current user;
- plaintext is absent from repository files, startup arguments, receipts, and logs;
- verification requires every managed service to be healthy and Deployment-v2-owned.

A HubSpot secret should follow an explicitly approved protected-environment boundary rather than repository plaintext or browser delivery.

### `docs/_context/program/CONTROLSTACK_MAIN_PROMOTION_PATH.md`

Constrains promotion:

- feature lanes push bounded parcels to their `lane/*` branch;
- Program verifies exact file set, gates, tests, handoff, contracts, and diff;
- unstable seam changes require explicit acceptance;
- no direct feature-lane write to `main` and no force push;
- this connected Program app can assess current-root evidence but cannot create/merge a pull request or write `main`.

### `docs/_context/program/CONTROLSTACK_LANE_REGISTRY.md`

Constrains lane operations:

- one writer per worktree;
- Program writes only its configured worktree;
- donor/reference surfaces are read-only;
- arbitrary shell, deletion, movement, and cross-root copy are disabled.

### `docs/_context/program/CONTROLSTACK_PROGRAM_STATE.md` and `CONTROLSTACK_INTEGRATION_QUEUE.md`

Constrain sequencing:

- producer authority and accepted persistence precede consumer widening;
- current cross-lane contracts are diagnostic/read-only/fail-closed until accepted;
- persistence/readback work is not to be inferred from UI placeholders or unaccepted consumer shapes.

---

## 6. Connected-app capabilities for this lane

### 6.1 Identity and roots

Current connected-app configuration:

```text
runtime root: C:\ControlStack_Worktrees\program-integrate
required branch: lane/program-integrate
lane: program-integrate
allowed gate: program-integrate
```

Named roots exposed by the app:

- `runtime`
- `repo`
- `donor-readonly`

Effective availability:

- runtime/repo root exists and is readable;
- configured donor-readonly root is `C:\ControlStack_Worktrees\program-integrate\.disabled-donor-reference` and does not exist;
- RuntimeData active-source probe is available but returns only redacted metadata/counts and no source path;
- internal donor-engine/RuntimeData probe is available only as an evidence-only, read-only seam.

### 6.2 Read capability

The app can:

- list directories;
- read UTF-8 repository files;
- find files;
- grep text;
- search JavaScript/TypeScript/Python symbols;
- inspect dependency relationships;
- compare configured-root files where permitted;
- inspect Git status, diffs, and recent commits;
- run the whitelisted `program-integrate` gate;
- inspect path scope and affected-gate plans;
- perform redacted RuntimeData evidence probes.

It cannot use arbitrary shell commands.

### 6.3 Write capability

Current configuration reports:

```text
write enabled: true
allowed write globs: **
delete enabled: false
movement enabled: false
cross-root copy enabled: false
```

The app can write or safely patch files only inside the Program runtime root. It cannot mutate the unavailable donor root or another lane root.

The current report write is within that allowed Program root.

### 6.4 Git capability

Available on the current Program worktree:

- status;
- diff, including staged diff;
- recent commits;
- explicit-path stage, with dry-run support;
- explicit-path unstage;
- commit already-staged files;
- push the current branch without force;
- combined green-gate/commit/push with exact expected staged paths.

Controls:

- stage/commit/push are enabled;
- commit/push is gated;
- required branch is `lane/program-integrate`;
- no force push;
- no direct `main` merge/PR operation is exposed;
- no cross-lane or donor mutation is exposed.

This report was not staged or committed.

### 6.5 HTTP capability

The connected app exposes only local webhook GET/POST calls to its configured base:

```text
http://127.0.0.1:9
```

This is not general internet HTTP access and is not the active Selector runtime at port 8788. The Program app therefore cannot be asked to call HubSpot directly through an arbitrary URL.

Separate distinction:

- repository runtime code in `server.js` can call `https://api.hubapi.com/...` when its process environment has a valid HubSpot token;
- this connected Program app does not expose a general external HTTP client for those provider calls.

### 6.6 What this lane can safely be asked to do later

Within the current app boundary, this lane can later be asked to:

- prepare and review Program-owned seam contracts and decision records;
- edit Program-root implementation/configuration files;
- add or revise server endpoints in this worktree after explicit Program approval;
- revise Deployment-v2 manifest/manager/installer/tests as one bounded Program parcel;
- add protected-environment support without exposing plaintext, subject to an approved credential design;
- run the `program-integrate` gate;
- stage an exact file set, commit it after green evidence, and push `lane/program-integrate`;
- verify that no unrelated paths were absorbed.

It cannot be asked to:

- read the absent donor project type through this connection;
- modify another lane or donor root;
- execute arbitrary shell commands;
- delete or move repository content;
- perform unrestricted cross-root copies;
- call arbitrary external HTTP endpoints;
- create/merge a pull request or write directly to `main` with the currently exposed operations.

---

## Final verified briefing

1. Contact and company lookup are real, read-only HubSpot CRM v3 searches.
2. Deal lookup is not implemented.
3. Deal writeback is a dry-run preflight with an unconditional write-policy block.
4. Every live HubSpot/CRM write policy inspected is disabled.
5. Credentials are expected from server process environment; Deployment v2 does not currently provision HubSpot credentials.
6. The reported donor HubSpot ID fields cannot be verified because this lane's donor root is absent.
7. Current project fixtures contain only `projectId`, `title`, `client`, `site`, `readiness`, and `source`; all three reported HubSpot IDs are absent.
8. Project save/restore is real but volatile and memory-only; several module copies still incorrectly describe it as deferred.
9. Deployment v2 service entries require id, name, unique port, absolute executable and cwd, args, credential mode, protected-secret IDs, health definition, and env object.
10. The topology is hard-locked to eight services, so a new HubSpot sandbox service requires coordinated manifest, manager/installer, secret-boundary, test, and program-document changes.
11. Program contracts already reserve persistence, authentication, deployment, endpoint ownership, schema changes, new producers/consumers, and persistence/readback identity changes for explicit Program governance.

---

## 2026-07-22 post-recon authority update

This update supersedes only the prerequisite and business-decision status above; it does not convert reported credential handling into a repository-verifiable secret inspection.

- Patrick reports `ControlsStack (Read Only)` created with exactly contacts-read, companies-read and deals-read scopes.
- Patrick reports the token stored in the local secrets store. No token value or secret location is recorded here.
- `writePolicy` remains disabled and the legacy OAuth public app remains in service.
- HubSpot owns contacts, companies, deals and price; ControlStack owns engineering state and build detail.
- One deal maps to one envelope using `controlstack_project_key` plus `controlstack_job_ref`.
- CRM push intent occurs on genuine readiness-state entry, not module open or Engine run.
- Leads use a separate deals pipeline; ControlStack is local-first and CRM reads are cached.
- Exact writer-scope definition and separate Program admission remain required before live writes.
- HubSpot Service Keys migration is deferred to cutover as an expected token swap with no ControlStack code change.
