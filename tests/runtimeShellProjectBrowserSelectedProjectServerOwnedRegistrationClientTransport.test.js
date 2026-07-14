import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSavedProjectEnvelope } from "../packages/workspace-kernel/projectEnvelope.js";
import { createShellServices } from "../packages/workspace-kernel/services.js";
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
  PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES,
} from "../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js";
import {
  createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport,
  SHELL_PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_CLIENT_TRANSPORT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js";

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

function selectedResultSummary(sourceSuffix = "registration-client") {
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

function runTableFirstNarrowOutputSummary(selectedResult, sourceSuffix = "registration-client") {
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

function stage3Inputs() {
  return {
    factoryApprovedInputsSummary: {
      schemaId: "controlstack.selector.factory-approved-inputs-summary.v1",
      schemaVersion: 1,
      tier: "Business",
      runs: [{ qty: 2, runLengthMm: 3500 }],
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

function localSave(projectId = "registration-client-project", overrides = {}) {
  const selectedResult = selectedResultSummary(projectId);
  const envelope = createSavedProjectEnvelope({
    project: {
      metadata: {
        projectId,
        title: "Registration Client Project",
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
        title: "Registration Client Project",
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
        state: { engineRunActionSource: stage3Inputs() },
        downstreamContext: {
          selectedResultSummary: selectedResult,
          runTableFirstNarrowOutputSummary:
            runTableFirstNarrowOutputSummary(selectedResult, projectId),
        },
      },
    },
    source: "p2-shell-save-envelope",
  });
  return {
    accepted: true,
    envelope: {
      ...envelope,
      ...overrides,
    },
  };
}

function serverResponse(request, overrides = {}) {
  const fields = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
    schemaVersion:
      PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
    contractId:
      PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
    state: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered,
    readiness: "registered",
    ok: true,
    failClosed: false,
    blocker: null,
    requestAccepted: true,
    projectId: request.localProjectId,
    localEnvelopeId: request.localEnvelopeId,
    localSavedAt: request.localSavedAt,
    localRevisionId: request.localRevisionId,
    serverEnvelopeId: `env-server-${request.localProjectId}`,
    serverRevisionId: `server-revision-${request.localProjectId}-1`,
    supersededServerRevisionId: null,
    serverOwned: true,
    envelopeConstructedServerSide: true,
    envelopeValidated: true,
    retainedInProcessMemory: true,
    activeRevision: true,
    filesystemPersistenceEnabled: false,
    projectEnvelopeReturned: false,
    enginePayloadReturned: false,
    privateCandidateReturned: false,
    databasePathReturned: false,
    filePathReturned: false,
    sourcePathReturned: false,
    engineOptionsReturned: false,
    ...overrides,
  };
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function response(body, status = 200) {
  return {
    status,
    redirected: false,
    headers: {
      get(name) {
        return String(name).toLowerCase() === "content-type"
          ? "application/json; charset=utf-8"
          : null;
      },
    },
    async json() {
      return structuredClone(body);
    },
  };
}

function clientRequest(save = localSave(), overrides = {}) {
  return {
    localSave: save,
    registrationSessionId: "shell-registration-session-test-1",
    clientSaveOrdinal: 1,
    localRevisionId: "local-revision-shell-registration-session-test-1-1",
    ...overrides,
  };
}

test("client dispatches only the strictly ordered source projection over same-origin POST", async () => {
  let capturedPath = null;
  let capturedOptions = null;
  let capturedBody = null;
  const transport = createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
    async fetchImpl(path, options) {
      capturedPath = path;
      capturedOptions = options;
      capturedBody = JSON.parse(options.body);
      return response(serverResponse(capturedBody));
    },
  });

  const result = await transport(clientRequest());

  assert.equal(result.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES.registered);
  assert.equal(result.ok, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.serverOwned, true);
  assert.equal(result.activeRevision, true);
  assert.equal(result.sameOrigin, true);
  assert.equal(result.scalarAcknowledgementOnly, true);
  assert.deepEqual(
    Object.keys(result),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER,
  );
  assert.equal(
    result.contractId,
    SHELL_PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_CLIENT_TRANSPORT_ID,
  );

  assert.equal(capturedPath, "/api/workspace-shell/selected-project-runtime-save-registration");
  assert.equal(capturedOptions.method, "POST");
  assert.equal(capturedOptions.credentials, "same-origin");
  assert.equal(capturedOptions.cache, "no-store");
  assert.equal(capturedOptions.redirect, "error");
  assert.deepEqual(Object.keys(capturedBody), PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER);
  assert.deepEqual(Object.keys(capturedBody.sourceProjection), [
    "project",
    "savedBy",
    "contractVersion",
    "selectorModule",
  ]);
  assert.deepEqual(Object.keys(capturedBody.sourceProjection.selectorModule), [
    "status",
    "factoryApprovedInputsSummary",
    "committedSelectorConstraints",
    "lmTemperatureReadinessPreview",
    "selectedResultSummary",
    "runTableFirstNarrowOutputSummary",
  ]);
  assert.equal(capturedBody.localProjectId, "registration-client-project");
  assert.equal(capturedBody.sourceProjection.selectorModule.status, "ready");
  assert.deepEqual(
    capturedBody.sourceProjection.selectorModule.factoryApprovedInputsSummary,
    stage3Inputs().factoryApprovedInputsSummary,
  );

  const serialised = JSON.stringify(capturedBody);
  for (const forbidden of [
    '"projectEnvelope"',
    '"completedEnvelope"',
    '"enginePayload"',
    '"privateCandidate"',
    '"databasePath"',
    '"filePath"',
    '"sourcePath"',
    '"engineOptions"',
    '"modules":',
    '"shell":',
    '"lifecycle":',
    '"restore":',
  ]) {
    assert.equal(serialised.includes(forbidden), false, forbidden);
  }
  for (const key of [
    "projectEnvelopeSent",
    "projectEnvelopeReturned",
    "enginePayloadSent",
    "enginePayloadReturned",
    "privateCandidateSent",
    "privateCandidateReturned",
    "databasePathSent",
    "databasePathReturned",
    "filePathSent",
    "filePathReturned",
    "sourcePathSent",
    "sourcePathReturned",
    "engineOptionsSent",
    "engineOptionsReturned",
    "filesystemPersistenceEnabled",
  ]) {
    assert.equal(result[key], false, key);
  }
});

test("client fails closed before fetch for invalid local saves, missing Stage 3 inputs, and unsafe source material", async () => {
  let calls = 0;
  const transport = createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
    async fetchImpl() {
      calls += 1;
      throw new Error("must not dispatch");
    },
  });

  const invalidLocalSave = await transport(clientRequest({ accepted: false, envelope: null }));
  assert.equal(invalidLocalSave.ok, false);
  assert.equal(invalidLocalSave.requestDispatched, false);

  const missingInputsSave = localSave();
  missingInputsSave.envelope.modules.cs_selector.state = {};
  const missingInputs = await transport(clientRequest(missingInputsSave));
  assert.equal(missingInputs.ok, false);
  assert.equal(missingInputs.requestDispatched, false);
  assert.equal(missingInputs.blocker, "selected-project-registration-client-stage3-inputs-missing");

  const unsafeSave = localSave();
  unsafeSave.envelope.modules.cs_selector.state.engineRunActionSource
    .factoryApprovedInputsSummary.privateCandidate = { tier: "Business" };
  const unsafe = await transport(clientRequest(unsafeSave));
  assert.equal(unsafe.ok, false);
  assert.equal(unsafe.requestDispatched, false);
  assert.match(unsafe.blocker, /forbidden-key-privateCandidate/);

  const unsafePathSave = localSave();
  unsafePathSave.envelope.modules.cs_selector.state.engineRunActionSource
    .factoryApprovedInputsSummary.note = "C:\\ControlStack_RuntimeData\\private\\candidate.json";
  const unsafePath = await transport(clientRequest(unsafePathSave));
  assert.equal(unsafePath.ok, false);
  assert.equal(unsafePath.requestDispatched, false);
  assert.match(unsafePath.blocker, /private-or-output-value-refused/);

  assert.equal(calls, 0);
});

test("client rejects non-scalar, cross-revision, or unsafe server acknowledgements", async () => {
  const cases = [
    (body) => ({ ...body, projectEnvelopeReturned: { unsafe: true } }),
    (body) => ({ ...body, localRevisionId: "other-revision" }),
    (body) => ({ ...body, privateCandidateReturned: true }),
    (body) => ({ ...body, serverRevisionId: "C:\\private\\revision" }),
  ];

  for (const mutate of cases) {
    const transport = createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl(path, options) {
        const request = JSON.parse(options.body);
        return response(mutate(serverResponse(request)));
      },
    });
    const result = await transport(clientRequest());
    assert.equal(result.ok, false);
    assert.equal(result.responseValidated, false);
  }
});

test("shell services associate acknowledgement with the exact local save revision and ignore stale completion", async () => {
  const deferred = [];
  const services = createShellServices({
    registerSelectedProjectServerOwnership(request) {
      return new Promise((resolve) => deferred.push({ request, resolve }));
    },
  });
  const firstSave = localSave("services-registration-project");
  const secondSave = localSave("services-registration-project");
  secondSave.envelope.envelopeId = firstSave.envelope.envelopeId;
  secondSave.envelope.savedAt = new Date(Date.parse(firstSave.envelope.savedAt) + 1000).toISOString();

  const firstPromise = services.selectedProjectServerOwnedRegistration.registerLocalSave(firstSave);
  const secondPromise = services.selectedProjectServerOwnedRegistration.registerLocalSave(secondSave);
  assert.equal(deferred.length, 2);

  const secondRequest = deferred[1].request;
  deferred[1].resolve({
    ok: true,
    activeRevision: true,
    projectId: secondSave.envelope.projectId,
    localEnvelopeId: secondSave.envelope.envelopeId,
    localSavedAt: secondSave.envelope.savedAt,
    localRevisionId: secondRequest.localRevisionId,
    serverEnvelopeId: "server-env-2",
    serverRevisionId: "server-revision-2",
  });
  await secondPromise;
  assert.equal(
    services.selectedProjectServerOwnedRegistration.isAcknowledgedEnvelope(secondSave.envelope),
    true,
  );

  const firstRequest = deferred[0].request;
  deferred[0].resolve({
    ok: true,
    activeRevision: true,
    projectId: firstSave.envelope.projectId,
    localEnvelopeId: firstSave.envelope.envelopeId,
    localSavedAt: firstSave.envelope.savedAt,
    localRevisionId: firstRequest.localRevisionId,
    serverEnvelopeId: "server-env-1",
    serverRevisionId: "server-revision-1",
  });
  await firstPromise;

  assert.equal(
    services.selectedProjectServerOwnedRegistration.isAcknowledgedEnvelope(firstSave.envelope),
    false,
  );
  assert.equal(
    services.selectedProjectServerOwnedRegistration.getAcknowledgementForEnvelope(secondSave.envelope)
      .serverRevisionId,
    "server-revision-2",
  );
});

test("shell wiring blocks Engine readiness until exact server acknowledgement and keeps transport implementation separate", async () => {
  const [clientSource, shellSource, servicesSource, invokeBoundarySource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/services.js", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(clientSource, /credentials: "same-origin"/);
  assert.match(clientSource, /sourceProjection/);
  assert.doesNotMatch(clientSource, /node:fs|writeFile|appendFile|mkdir|createWriteStream/);
  assert.match(shellSource, /applySelectedProjectServerOwnershipGate/);
  assert.match(shellSource, /selected-project-server-owned-registration-not-acknowledged/);
  assert.match(shellSource, /registerLocalSave\(result\)/);
  assert.match(servicesSource, /localRevisionId/);
  assert.match(servicesSource, /latestPending\?\.localRevisionId !== localRevisionId/);
  assert.doesNotMatch(
    invokeBoundarySource,
    /selected-project-runtime-save-registration|sourceProjection|registerLocalSave/,
  );
});
