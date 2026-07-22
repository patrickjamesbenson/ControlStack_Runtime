import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildSelectorPreEngineReadonlyActionEligibilityProjection,
} from "../packages/modules/cs-selector/selectorViewModel.js";
import {
  buildSelectorReadonlyEngineCandidateForInternalSeam,
} from "../packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js";
import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry,
  PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES,
} from "../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js";

const PROJECT_ID = "pre-engine-registration-project";
const LOCAL_ENVELOPE_ID = "local-envelope-pre-engine-registration";
const SAVED_AT = "2026-07-15T01:00:00.000Z";

function ordered(order, fields) {
  return Object.fromEntries(order.map((key) => [key, fields[key]]));
}

function readyProjection({ quantity = 2, runLengthMm = 3500 } = {}) {
  const committedSelectorConstraints = [
    { fieldKey: "tier", value: "Business", valueLabel: "Business", committedSelectorState: true, blocked: false, authoritySource: "acceptedDefaults" },
    { fieldKey: "directOpticVar1", value: "80|Inlay", valueLabel: "Inlay", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "targetLmPerM", value: "1200", valueLabel: "1200", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "cctCri", value: "4000K / CRI90", valueLabel: "4000K / CRI90", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "controlType", value: "DALI-2", valueLabel: "DALI-2", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
  ];
  const factoryApprovedInputsSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    factoryApprovedInputsReady: true,
    ready: true,
    stage3Mode: "simple-run-stage3a-zero-accessory",
    blocker: null,
    stage2Ready: true,
    committedSelectorConstraintCount: committedSelectorConstraints.length,
    committedRunIntakeSummary: {
      ready: true,
      committedRunIntakeReady: true,
      sourceAuthority: "committed-selector-state",
      runQuantity: quantity,
      runLengthMm,
      
    },
    runIntakePreviewSummary: {
      runIntakePreviewReady: true,
      runCount: 1,
      totalQuantity: quantity,
    },
    accessoryPlacementIntentSummary: { accessoryIntentCount: 0 },
    accessoryReservationRequired: false,
    engineExecuted: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
  };
  const lmTemperatureReadinessPreview = {
    targetIntent: { direct: { ready: true, valueLabel: "1200" } },
    cctCriPairing: { direct: { ready: true, valueLabel: "4000K / CRI90" } },
    controlIntent: { direct: { ready: true, valueLabel: "DALI-2" } },
    fingerprint: "safe-selector-lm-temperature:registration",
    rawRowsReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
  };
  const mapper = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary,
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
  });
  assert.equal(mapper.ok, true);
  return buildSelectorPreEngineReadonlyActionEligibilityProjection({
    specBuildReadinessPreview: {
      factoryApprovedInputsReady: true,
      factoryApprovedInputsSummary,
      readonlyEngineCandidateReady: true,
      readonlyEngineCandidateMapperSummary: mapper.summary,
    },
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
    sourceInputFingerprint: "safe-source-input:registration",
    boardDataSourceVersion: "safe-board-version:registration",
  });
}

function sourceProjection(projection = readyProjection()) {
  return ordered(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
    {
      project: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
        {
          metadata: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
            {
              projectId: PROJECT_ID,
              title: "Pre-Engine Registration Project",
              readiness: "ready",
              source: "runtime-test",
              browserReady: true,
              browserStatus: "ready",
              restoredFromEnvelope: false,
              restoredAt: null,
              restoredEnvelopeId: null,
            },
          ),
          currentProject: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
            {
              projectId: PROJECT_ID,
              title: "Pre-Engine Registration Project",
              client: "Client",
              site: "Sydney",
              readiness: "ready",
              source: "runtime-test",
            },
          ),
          selection: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
            {
              owner: "shell",
              selectedProjectId: PROJECT_ID,
              selectedAt: SAVED_AT,
              source: "runtime-test",
              restoredEnvelopeId: null,
            },
          ),
        },
      ),
      savedBy: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
        {
          identityState: "internal_authenticated",
          classification: "internal",
          actualRole: "developer",
          derivedActualRole: "developer",
          actualRoleSource: "test",
          displayRole: "developer",
          displayRoleClamped: false,
          name: "Runtime Test",
          email: "runtime@example.test",
        },
      ),
      contractVersion: "workspace-contract-test",
      selectorModule: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
        {
          status: "saved-ui-state",
          preEngineActionEligibilityProjection: projection,
          selectedResultSummary: null,
          runTableFirstNarrowOutputSummary: null,
        },
      ),
    },
  );
}

function registrationRequest({
  projection = readyProjection(),
  ordinal = 1,
  revision = `local-revision-${ordinal}`,
  session = "registration-session-1",
} = {}) {
  return ordered(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
    {
      schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
      schemaVersion:
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
      contractId:
        PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
      requestKind: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
      registrationSessionId: session,
      clientSaveOrdinal: ordinal,
      localRevisionId: revision,
      localProjectId: PROJECT_ID,
      localEnvelopeId: LOCAL_ENVELOPE_ID,
      localSavedAt: SAVED_AT,
      sourceProjection: sourceProjection(projection),
    },
  );
}

function assertScalarAcknowledgement(result) {
  assert.deepEqual(
    Object.keys(result),
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  );
  assert.equal(Object.values(result).every((value) => (
    value === null
      || typeof value === "string"
      || typeof value === "boolean"
      || Number.isSafeInteger(value)
  )), true);
  const serialised = JSON.stringify(result);
  for (const forbidden of [
    '"factoryApprovedInputsSummary":',
    '"committedSelectorConstraints":',
    '"lmTemperatureReadinessPreview":',
    '"privateCandidate":',
    '"candidatePayload":',
    '"projectEnvelope":',
    '"databasePath":',
    '"filePath":',
    '"sourcePath":',
    '"engineOptions":',
  ]) assert.equal(serialised.includes(forbidden), false, forbidden);
}

test("registration contract keeps the existing route and adds scalar pre-Engine acknowledgement fields", () => {
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
    "/api/workspace-shell/selected-project-runtime-save-registration",
  );
  assert.equal(PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD, "POST");
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
    "selected-project-runtime-save-registration",
  );
  assert.deepEqual(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
    [
      "status",
      "preEngineActionEligibilityProjection",
      "selectedResultSummary",
      "runTableFirstNarrowOutputSummary",
    ],
  );
  for (const field of [
    "preEngineActionSourceReady",
    "candidateReconstructionPreflightEligible",
    "preEngineEligibilityProjectionFingerprint",
  ]) assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER.includes(field),
    true,
    field,
  );
});

test("registry registers a first-run pre-Engine revision without selected-result or RunTable summaries", async () => {
  const projection = readyProjection();
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const result = await registry.register(registrationRequest({ projection }));

  assertScalarAcknowledgement(result);
  assert.equal(
    result.state,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered,
  );
  assert.equal(result.readiness, "registered");
  assert.equal(result.ok, true, result.blocker);
  assert.equal(result.failClosed, false);
  assert.equal(result.blocker, null);
  assert.equal(result.requestAccepted, true);
  assert.equal(result.projectId, PROJECT_ID);
  assert.equal(result.localEnvelopeId, LOCAL_ENVELOPE_ID);
  assert.equal(result.preEngineActionSourceReady, true);
  assert.equal(result.candidateReconstructionPreflightEligible, true);
  assert.equal(
    result.preEngineEligibilityProjectionFingerprint,
    projection.projectionFingerprint,
  );
  assert.equal(result.serverOwned, true);
  assert.equal(result.envelopeConstructedServerSide, true);
  assert.equal(result.envelopeValidated, true);
  assert.equal(result.retainedInProcessMemory, true);
  assert.equal(result.activeRevision, true);
  assert.equal(result.filesystemPersistenceEnabled, false);

  const envelope = registry.getProjectEnvelope(LOCAL_ENVELOPE_ID);
  assert.equal(envelope.projectId, PROJECT_ID);
  assert.equal(envelope.envelopeId, LOCAL_ENVELOPE_ID);
  assert.deepEqual(
    envelope.modules.cs_selector.downstreamContext.preEngineActionEligibilityProjection,
    projection,
  );
  assert.deepEqual(
    envelope.modules.cs_selector.downstreamContext.selectedResultSummary,
    {},
  );
  assert.deepEqual(
    envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary,
    {},
  );
  const postEngineReadback =
    buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
      envelope,
      LOCAL_ENVELOPE_ID,
    );
  assert.equal(postEngineReadback.ready, false);
  assert.notEqual(postEngineReadback.blocker, null);
});

test("registry validates full Stage-3 authority and candidate reconstruction rather than run completion alone", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const ready = readyProjection();
  const forged = structuredClone(ready);
  forged.candidateMapperReady = false;
  const rejected = await registry.register(registrationRequest({ projection: forged }));
  assertScalarAcknowledgement(rejected);
  assert.equal(rejected.ok, false);
  assert.equal(rejected.failClosed, true);
  assert.equal(rejected.activeRevision, false);
  assert.equal(rejected.preEngineActionSourceReady, false);
  assert.equal(rejected.candidateReconstructionPreflightEligible, false);
  assert.equal(
    rejected.blocker,
    "selected-project-registration-pre-engine-eligibility-invalid",
  );

  const fingerprintMismatch = structuredClone(ready);
  fingerprintMismatch.candidateFingerprint =
    "safe-selector-readonly-engine-candidate:0000000000000000000000000000000000000000";
  const mismatch = await registry.register(
    registrationRequest({ projection: fingerprintMismatch }),
  );
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.activeRevision, false);
});

test("registry keeps idempotency, stale-save rejection, and active revision replacement", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const firstRequest = registrationRequest();
  const first = await registry.register(firstRequest);
  const replay = await registry.register(firstRequest);
  assert.equal(first.ok, true, first.blocker);
  assert.deepEqual(replay, first);

  const second = await registry.register(registrationRequest({
    ordinal: 2,
    revision: "local-revision-2",
    projection: readyProjection({ runLengthMm: 2800 }),
  }));
  assert.equal(second.ok, true);
  assert.equal(second.supersededServerRevisionId, first.serverRevisionId);
  assert.notEqual(second.serverRevisionId, first.serverRevisionId);
  assert.equal(
    registry.getActiveRevision(PROJECT_ID).serverRevisionId,
    second.serverRevisionId,
  );

  const stale = await registry.register(firstRequest);
  assert.equal(stale.ok, false);
  assert.equal(stale.failClosed, true);
  assert.equal(stale.blocker, "selected-project-registration-stale-client-save-refused");
});

test("registration boundary retains no filesystem, caller payload, output generation, or persistence widening", async () => {
  const source = await readFile(
    new URL(
      "../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /preEngineActionEligibilityProjection/);
  assert.match(source, /buildSelectorReadonlyEngineCandidateForInternalSeam/);
  assert.doesNotMatch(
    source,
    /writeFile|appendFile|mkdir|createWriteStream|RuntimeData\s*[.\[]|generateRunTable|generateIes|persistSelectedResult/,
  );
  assert.doesNotMatch(source, /callerSuppliedEnginePayload|callerSuppliedFilePath/);
});