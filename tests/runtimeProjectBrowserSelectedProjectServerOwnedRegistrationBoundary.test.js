import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSavedProjectEnvelope } from "../packages/workspace-kernel/projectEnvelope.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runTableFirstNarrowOutputHandoffContract.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";
import {
  createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry,
  PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_ENGINE_READINESS_SUMMARY_REGISTRATION_ID,
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

function ordered(order, fields) {
  return Object.fromEntries(order.map((key) => [key, fields[key]]));
}

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

function selectedResultSummary(sourceSuffix = "registration") {
  return {
    schemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    slotSchemaId: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
    slotSchemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_selected_result_summary_persisted",
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    ...AUTHORITY_STATES,
    selectedResultAuthorityGuardState: "engine_verified_selected_result_ready",
    selectedResultProjectionState: "selected_accepted",
    safeSelectedResultSourceState: "safe_selected_result_source_ready",
    selectedResultHandoffScaffoldState: "runtime_selected_result_handoff_scaffold_ready",
    policyFingerprint: `safe-policy:${sourceSuffix}`,
    sourceFingerprint: `safe-source:${sourceSuffix}`,
    sourceInputFingerprint: `safe-source-input:${sourceSuffix}`,
    sourceVersionFingerprint: `safe-source-version:${sourceSuffix}`,
    acceptedSelectedResultAuthorityGateFingerprint: `safe-authority-gate:${sourceSuffix}`,
    selectedResultPersistenceAuthorityPreflightFingerprint:
      `safe-persistence-preflight:${sourceSuffix}`,
    selectedResultPersistenceBoundaryContractFingerprint:
      `safe-persistence-boundary:${sourceSuffix}`,
    selectedResultOutputReadinessPreflightFingerprint:
      `safe-output-preflight:${sourceSuffix}`,
    selectedResultAuthorityGuardFingerprint: `safe-authority-guard:${sourceSuffix}`,
    selectedResultProjectionFingerprint: `safe-projection:${sourceSuffix}`,
    safeSelectedResultSourceObjectFingerprint: `safe-source-object:${sourceSuffix}`,
    selectedResultHandoffScaffoldFingerprint: `safe-handoff:${sourceSuffix}`,
    ...Object.fromEntries(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function runTableFirstNarrowOutputSummary(selectedResult, sourceSuffix = "registration") {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_runtable_first_narrow_output_summary_persisted",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceKind: "persisted-selected-result-summary",
    futureOutputKind: "runtable-first-narrow-output",
    rowsIncluded: false,
    rowCount: 0,
    generated: false,
    generationEnabled: false,
    persisted: false,
    routeAdded: false,
    postEndpointAdded: false,
    runTableFirstNarrowOutputHandoffContractState:
      "runtable_first_narrow_output_handoff_contract_ready",
    runTableFirstNarrowOutputHandoffContractReady: true,
    ...AUTHORITY_STATES,
    policyFingerprint: selectedResult.policyFingerprint,
    sourceFingerprint: selectedResult.sourceFingerprint,
    sourceInputFingerprint: selectedResult.sourceInputFingerprint,
    sourceVersionFingerprint: selectedResult.sourceVersionFingerprint,
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResult,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      `safe-selected-result-slot:${sourceSuffix}`,
    runTableFirstNarrowOutputHandoffContractFingerprint:
      `safe-runtable-handoff:${sourceSuffix}`,
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function stage3Inputs(runLength = 3500) {
  return {
    factoryApprovedInputsSummary: {
      schemaId: "controlstack.selector.factory-approved-inputs-summary.v1",
      schemaVersion: 1,
      tier: "Business",
      runs: [{ qty: 2, runLengthMm: runLength }],
      lighting: { targetLmPerM: 1200 },
    },
    committedSelectorConstraints: [
      { constraintId: "max-segment-length", value: 3500, unit: "mm" },
    ],
    lmTemperatureReadinessPreview: {
      schemaId: "controlstack.selector.lm-temperature-readiness-preview.v1",
      schemaVersion: 1,
      ready: true,
    },
  };
}

function localEnvelope(projectId = "registration-project", runLength = 3500) {
  const inputs = stage3Inputs(runLength);
  const selectedResult = selectedResultSummary(`${projectId}-${runLength}`);
  return createSavedProjectEnvelope({
    project: {
      metadata: {
        projectId,
        title: "Registration Project",
        readiness: "ready",
        source: "runtime-test",
        browserReady: true,
        browserStatus: "ready",
        restoredFromEnvelope: false,
        restoredAt: null,
        restoredEnvelopeId: null,
      },
      currentProject: {
        projectId,
        title: "Registration Project",
        client: "Client",
        site: "Sydney",
        readiness: "ready",
        source: "runtime-test",
      },
      selection: {
        owner: "shell",
        selectedProjectId: projectId,
        selectedAt: "2026-07-14T00:00:00.000Z",
        source: "runtime-test",
        restoredEnvelopeId: null,
      },
    },
    identity: {
      identityState: "internal_authenticated",
      classification: "internal",
      actualRole: "developer",
      derivedActualRole: "developer",
      actualRoleSource: "test",
      displayRole: "developer",
      displayRoleClamped: false,
      currentUser: { name: "Runtime Test", email: "runtime@example.com" },
    },
    contractVersion: "workspace-contract-test",
    moduleContributions: {
      cs_selector: {
        status: "ready",
        state: { engineRunActionSource: inputs },
        downstreamContext: {
          selectedResultSummary: selectedResult,
          runTableFirstNarrowOutputSummary:
            runTableFirstNarrowOutputSummary(selectedResult, `${projectId}-${runLength}`),
        },
      },
    },
    source: "p2-shell-save-envelope",
  });
}

function sourceProjection(envelope, runLength = 3500) {
  const inputs = stage3Inputs(runLength);
  return ordered(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
    {
      project: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
        {
          metadata: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
            envelope.project.metadata,
          ),
          currentProject: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
            envelope.project.currentProject,
          ),
          selection: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
            envelope.project.selection,
          ),
        },
      ),
      savedBy: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
        envelope.savedBy,
      ),
      contractVersion: envelope.shell.contractVersion,
      selectorModule: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
        {
          status: "ready",
          ...inputs,
          selectedResultSummary:
            envelope.modules.cs_selector.downstreamContext.selectedResultSummary,
          runTableFirstNarrowOutputSummary:
            envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary,
        },
      ),
    },
  );
}

function registrationRequest({
  envelope = localEnvelope(),
  sessionId = "registration-session-1",
  ordinal = 1,
  localRevisionId = `local-revision-${ordinal}`,
  runLength = 3500,
  overrides = {},
} = {}) {
  const fields = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
    schemaVersion:
      PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
    contractId:
      PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
    requestKind: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
    registrationSessionId: sessionId,
    clientSaveOrdinal: ordinal,
    localRevisionId,
    localProjectId: envelope.projectId,
    localEnvelopeId: envelope.envelopeId,
    localSavedAt: envelope.savedAt,
    sourceProjection: sourceProjection(envelope, runLength),
    ...overrides,
  };
  return ordered(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
    fields,
  );
}

function assertScalarAcknowledgement(result) {
  assert.deepEqual(
    Object.keys(result),
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  );
  for (const [key, value] of Object.entries(result)) {
    assert.equal(
      value === null
        || typeof value === "string"
        || typeof value === "boolean"
        || Number.isSafeInteger(value),
      true,
      key,
    );
  }
  for (const key of [
    "projectEnvelopeReturned",
    "enginePayloadReturned",
    "privateCandidateReturned",
    "databasePathReturned",
    "filePathReturned",
    "sourcePathReturned",
    "engineOptionsReturned",
    "filesystemPersistenceEnabled",
  ]) {
    assert.equal(result[key], false, key);
  }
}

test("exports one fixed same-origin registration route distinct from Engine invocation", () => {
  assert.equal(
    PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
    "PROJECT-BROWSER-FIRST-SERVER-OWNED-RUNTIME-SAVED-SELECTED-PROJECT-REGISTRATION-1",
  );
  assert.equal(
    PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_ENGINE_READINESS_SUMMARY_REGISTRATION_ID,
    "PROJECT-BROWSER-FIRST-SERVER-OWNED-RUNTIME-SAVED-SELECTED-PROJECT-ENGINE-READINESS-SUMMARY-REGISTRATION-1",
  );
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
    "/api/workspace-shell/selected-project-runtime-save-registration",
  );
  assert.equal(PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD, "POST");
  assert.notEqual(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
    "/api/workspace-shell/selected-project-engine-readonly-invoke",
  );
});

test("server reconstructs and validates the runtime envelope while returning scalar acknowledgement only", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const envelope = localEnvelope();
  const result = await registry.register(registrationRequest({ envelope }));

  assert.equal(result.state, PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered);
  assert.equal(result.ok, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.requestAccepted, true);
  assert.equal(result.projectId, envelope.projectId);
  assert.equal(result.localEnvelopeId, envelope.envelopeId);
  assert.equal(result.localSavedAt, envelope.savedAt);
  assert.equal(result.localRevisionId, "local-revision-1");
  assert.match(result.serverRevisionId, /^server-revision-registration-project-1$/);
  assert.equal(result.serverOwned, true);
  assert.equal(result.envelopeConstructedServerSide, true);
  assert.equal(result.envelopeValidated, true);
  assert.equal(result.retainedInProcessMemory, true);
  assert.equal(result.activeRevision, true);
  assertScalarAcknowledgement(result);

  const registeredEnvelope = registry.getProjectEnvelope(envelope.envelopeId);
  assert.ok(registeredEnvelope);
  assert.equal(registeredEnvelope.projectId, envelope.projectId);
  assert.equal(registeredEnvelope.envelopeId, envelope.envelopeId);
  assert.equal(registeredEnvelope.source, "p2-shell-save-envelope");
  assert.equal(registeredEnvelope.readOnly, false);
  assert.equal(registeredEnvelope.browserOnly, false);
  assert.deepEqual(
    registeredEnvelope.modules.cs_selector.state.engineRunActionSource,
    stage3Inputs(),
  );
  assert.deepEqual(
    registeredEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary,
    envelope.modules.cs_selector.downstreamContext.selectedResultSummary,
  );
  assert.deepEqual(
    registeredEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary,
    envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary,
  );
  const activeRevision = registry.getActiveRevision(envelope.projectId);
  assert.equal(Object.hasOwn(activeRevision, "selectedResultSummary"), false);
  assert.equal(Object.hasOwn(activeRevision, "runTableFirstNarrowOutputSummary"), false);
  assert.notDeepEqual(registeredEnvelope, envelope);
});

test("a later save supersedes the active revision and stale same-session registrations fail closed", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const envelope = localEnvelope("registration-project", 3500);
  const first = await registry.register(registrationRequest({ envelope, ordinal: 1 }));
  const second = await registry.register(registrationRequest({
    envelope,
    ordinal: 2,
    localRevisionId: "local-revision-2",
    runLength: 2800,
  }));

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.notEqual(second.serverRevisionId, first.serverRevisionId);
  assert.equal(second.supersededServerRevisionId, first.serverRevisionId);
  assert.equal(registry.getActiveRevision(envelope.projectId).serverRevisionId, second.serverRevisionId);
  assert.equal(
    registry.getProjectEnvelope(envelope.envelopeId)
      .modules.cs_selector.state.engineRunActionSource.factoryApprovedInputsSummary
      .runs[0].runLengthMm,
    2800,
  );

  const stale = await registry.register(registrationRequest({
    envelope,
    ordinal: 1,
    localRevisionId: "local-revision-stale",
  }));
  assert.equal(stale.ok, false);
  assert.equal(stale.failClosed, true);
  assert.equal(stale.requestAccepted, true);
  assert.equal(stale.activeRevision, false);
  assert.equal(stale.blocker, "selected-project-registration-stale-client-save-refused");
  assert.equal(registry.getActiveRevision(envelope.projectId).serverRevisionId, second.serverRevisionId);
});

test("idempotent retry retains the immutable server revision identity", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const request = registrationRequest();
  const first = await registry.register(request);
  const retry = await registry.register(structuredClone(request));

  assert.equal(first.ok, true);
  assert.equal(retry.ok, true);
  assert.equal(retry.serverRevisionId, first.serverRevisionId);
  assert.equal(retry.supersededServerRevisionId, null);
});

test("request shape refuses completed envelopes, Engine material, private candidates, paths, and options", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const envelope = localEnvelope();

  const completedEnvelopeRequest = registrationRequest({ envelope });
  completedEnvelopeRequest.projectEnvelope = envelope;
  const completedEnvelopeResult = await registry.register(completedEnvelopeRequest);
  assert.equal(completedEnvelopeResult.requestAccepted, false);
  assert.equal(completedEnvelopeResult.ok, false);

  for (const unsafeSelectorValue of [
    { privateCandidate: { tier: "Business" } },
    { enginePayload: { execute: true } },
    { databasePath: "private-db" },
    { filePath: "private-file" },
    { sourcePath: "private-source" },
    { engineOptions: { debug: true } },
    { harmless: "C:\\ControlStack_RuntimeData\\private\\candidate.json" },
  ]) {
    const request = registrationRequest({ envelope });
    request.sourceProjection.selectorModule.factoryApprovedInputsSummary = {
      ...request.sourceProjection.selectorModule.factoryApprovedInputsSummary,
      ...unsafeSelectorValue,
    };
    const result = await registry.register(request);
    assert.equal(result.requestAccepted, false, JSON.stringify(unsafeSelectorValue));
    assert.equal(result.ok, false, JSON.stringify(unsafeSelectorValue));
  }
});

test("registration boundary remains process-local and contains no filesystem persistence or invoke implementation", async () => {
  const [boundarySource, invokeSource, serverSource] = await Promise.all([
    readFile(
      new URL(
        "../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../server.js", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(
    boundarySource,
    /node:fs|writeFile|appendFile|mkdir|createWriteStream|localStorage|sessionStorage|indexedDB/,
  );
  assert.doesNotMatch(
    boundarySource,
    /invokeHostLocalReadonlySeam|engine_runtable_internal_readonly_invoke_probe|spawn\s*\(/,
  );
  assert.doesNotMatch(
    invokeSource,
    /selected-project-runtime-save-registration|createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry/,
  );
  assert.match(serverSource, /createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry/);
  assert.match(serverSource, /selectedProjectServerOwnedRuntimeSavedRegistry\.register/);
  assert.match(serverSource, /savedProjects: selectedProjectServerOwnedRuntimeSavedRegistry/);
  assert.match(serverSource, /isSameOriginRequest/);
  assert.match(serverSource, /requestJson\(req, \{ maxBytes: 262144 \}\)/);
});
