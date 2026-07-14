import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSavedProjectEnvelope } from "../packages/workspace-kernel/projectEnvelope.js";
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

function ordered(order, fields) {
  return Object.fromEntries(order.map((key) => [key, fields[key]]));
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
