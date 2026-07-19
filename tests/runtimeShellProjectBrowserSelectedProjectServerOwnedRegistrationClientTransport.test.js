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
  createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
} from "../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js";
import {
  createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_REQUEST_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js";

const PROJECT_ID = "registration-client-project";
const ENVELOPE_ID = "local-envelope-registration-client";
const SAVED_AT = "2026-07-15T01:30:00.000Z";

function readyProjection({ includeTier = true, tierBlocked = false, missingControl = false } = {}) {
  const committedSelectorConstraints = [
    includeTier ? { fieldKey: "tier", value: "Stale Browser Tier", valueLabel: "Stale Browser Tier", committedSelectorState: true, blocked: false, authoritySource: "acceptedDefaults" } : null,
    { fieldKey: "directOpticVar1", value: "80|Inlay", valueLabel: "Inlay", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "targetLmPerM", value: "1200", valueLabel: "1200", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "cctCri", value: "4000K / CRI90", valueLabel: "4000K / CRI90", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    missingControl ? null : { fieldKey: "controlType", value: "DALI-2", valueLabel: "DALI-2", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
  ].filter(Boolean);
  const candidateInputBlocker = tierBlocked
    ? "missing-readonly-engine-candidate-input-tier"
    : missingControl
      ? "missing-readonly-engine-candidate-input-controlType"
      : null;
  const candidateInputsReady = candidateInputBlocker === null;
  const factoryApprovedInputsSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    factoryApprovedInputsReady: candidateInputsReady,
    ready: candidateInputsReady,
    readonlyEngineCandidateInputsReady: candidateInputsReady,
    readonlyEngineCandidateInputsBlocker: candidateInputBlocker,
    stage3Mode: "simple-run-stage3a-zero-accessory",
    blocker: candidateInputBlocker,
    stage2Ready: candidateInputsReady,
    committedSelectorConstraintCount: committedSelectorConstraints.length,
    committedRunIntakeSummary: {
      ready: true,
      committedRunIntakeReady: true,
      sourceAuthority: "committed-selector-state",
      runQuantity: 1,
      runLengthMm: 3500,
      lengthMode: "cut_to_length",
    },
    runIntakePreviewSummary: {
      runIntakePreviewReady: true,
      runCount: 1,
      totalQuantity: 1,
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
    controlIntent: { direct: { ready: true, valueLabel: "DALI-2", sourceBacked: true } },
    fingerprint: "safe-selector-lm-temperature:client-registration",
    rawRowsReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
  };
  const mapper = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary,
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
  });
  assert.equal(mapper.ok, !missingControl);
  return buildSelectorPreEngineReadonlyActionEligibilityProjection({
    specBuildReadinessPreview: {
      factoryApprovedInputsReady: candidateInputsReady,
      factoryApprovedInputsSummary,
      readonlyEngineCandidateReady: mapper.ok === true,
      readonlyEngineCandidateMapperSummary: mapper.summary,
    },
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
    sourceInputFingerprint: "safe-source-input:client-registration",
    boardDataSourceVersion: "safe-board-version:client-registration",
  });
}

function localSave(projection = readyProjection()) {
  return {
    accepted: true,
    envelope: {
      schema: "workspace_saved_project.v2-runtime",
      owner: "shell",
      source: "p2-shell-save-envelope",
      readOnly: false,
      browserOnly: false,
      projectId: PROJECT_ID,
      envelopeId: ENVELOPE_ID,
      savedAt: SAVED_AT,
      title: "Registration Client Project",
      client: "Client",
      site: "Sydney",
      shell: { contractVersion: "workspace-contract-test" },
      savedBy: {
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
      project: {
        metadata: {
          projectId: PROJECT_ID,
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
          projectId: PROJECT_ID,
          title: "Registration Client Project",
          client: "Client",
          site: "Sydney",
          readiness: "ready",
          source: "runtime-test",
        },
        selection: {
          owner: "shell",
          selectedProjectId: PROJECT_ID,
          selectedAt: SAVED_AT,
          source: "runtime-test",
          restoredEnvelopeId: null,
        },
      },
      modules: {
        cs_selector: {
          status: "saved-ui-state",
          state: {},
          downstreamContext: {
            preEngineActionEligibilityProjection: structuredClone(projection),
          },
        },
      },
    },
  };
}

function clientRequest(save = localSave()) {
  return Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_REQUEST_FIELD_ORDER
      .map((key) => [key, {
        localSave: save,
        registrationSessionId: "client-registration-session",
        clientSaveOrdinal: 1,
        localRevisionId: "local-revision-client-1",
      }[key]]),
  );
}

function responseFor(body, status = body.ok === true ? 200 : 422) {
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
      return body;
    },
  };
}

function assertScalarClientResult(result) {
  assert.deepEqual(
    Object.keys(result),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER,
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

test("client sends only the allowlisted pre-Engine projection and accepts the scalar server acknowledgement", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  let fetchCalls = 0;
  let sentBody = null;
  const transport =
    createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl(path, options) {
        fetchCalls += 1;
        assert.equal(path, PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH);
        assert.equal(options.method, "POST");
        assert.equal(options.credentials, "same-origin");
        sentBody = JSON.parse(options.body);
        return responseFor(await registry.register(sentBody));
      },
    });

  const result = await transport(clientRequest());
  assertScalarClientResult(result);
  assert.equal(fetchCalls, 1);
  assert.equal(
    result.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES.registered,
  );
  assert.equal(result.ok, true);
  assert.equal(result.preEngineActionSourceReady, true);
  assert.equal(result.candidateReconstructionPreflightEligible, true);
  assert.match(
    result.preEngineEligibilityProjectionFingerprint,
    /^safe-selector-pre-engine-readonly-action-eligibility:[0-9a-f]{40}$/,
  );
  assert.equal(result.serverOwned, true);
  assert.equal(result.activeRevision, true);
  assert.equal(sentBody.sourceProjection.selectorModule.selectedResultSummary, null);
  assert.equal(sentBody.sourceProjection.selectorModule.runTableFirstNarrowOutputSummary, null);
  assert.equal(
    sentBody.sourceProjection.selectorModule.preEngineActionEligibilityProjection.ready,
    true,
  );
  assert.equal(
    sentBody.sourceProjection.selectorModule.preEngineActionEligibilityProjection
      .committedSelectorConstraints.some((row) => row.fieldKey === "tier"),
    false,
  );
  assert.equal(
    sentBody.sourceProjection.selectorModule.preEngineActionEligibilityProjection
      .factoryApprovedInputsSummary.committedSelectorConstraintCount,
    4,
  );
  assert.equal(Object.prototype.hasOwnProperty.call(sentBody, "projectEnvelope"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(sentBody, "enginePayload"), false);
});

test("client repairs a Tier-only blocked projection without accepting browser Tier authority", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  let sentBody = null;
  const transport =
    createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl(_path, options) {
        sentBody = JSON.parse(options.body);
        return responseFor(await registry.register(sentBody));
      },
    });

  const projection = readyProjection({ includeTier: false, tierBlocked: true });
  assert.equal(projection.ready, false);
  assert.equal(projection.blocker, "missing-readonly-engine-candidate-input-tier");

  const result = await transport(clientRequest(localSave(projection)));
  assert.equal(result.ok, true);
  assert.equal(result.activeRevision, true);
  assert.equal(
    sentBody.sourceProjection.selectorModule.preEngineActionEligibilityProjection
      .committedSelectorConstraints.some((row) => row.fieldKey === "tier"),
    false,
  );
  assert.equal(
    sentBody.sourceProjection.selectorModule.preEngineActionEligibilityProjection.ready,
    true,
  );
});

test("client returns the actual safe blocker when a remaining candidate input is missing", async () => {
  let fetchCalls = 0;
  const transport =
    createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl() {
        fetchCalls += 1;
        throw new Error("blocked candidate must not dispatch");
      },
    });

  const projection = readyProjection({ includeTier: false, missingControl: true });
  assert.equal(projection.ready, false);
  assert.equal(projection.blocker, "missing-readonly-engine-candidate-input-controlType");

  const result = await transport(clientRequest(localSave(projection)));
  assert.equal(result.ok, false);
  assert.equal(result.requestDispatched, false);
  assert.equal(result.blocker, "missing-readonly-engine-candidate-input-controlType");
  assert.equal(fetchCalls, 0);
});

test("client fails closed before fetch when the projection is absent, blocked, tampered, or path-bearing", async () => {
  let fetchCalls = 0;
  const transport =
    createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl() {
        fetchCalls += 1;
        throw new Error("invalid projection must not dispatch");
      },
    });

  const absent = localSave();
  delete absent.envelope.modules.cs_selector.downstreamContext
    .preEngineActionEligibilityProjection;
  const absentResult = await transport(clientRequest(absent));
  assert.equal(absentResult.ok, false);
  assert.equal(absentResult.requestDispatched, false);

  const tampered = localSave();
  tampered.envelope.modules.cs_selector.downstreamContext
    .preEngineActionEligibilityProjection.runIntakePreviewReady = false;
  const tamperedResult = await transport(clientRequest(tampered));
  assert.equal(tamperedResult.ok, false);
  assert.equal(tamperedResult.requestDispatched, false);

  const pathBearing = localSave();
  pathBearing.envelope.modules.cs_selector.downstreamContext
    .preEngineActionEligibilityProjection.factoryApprovedInputsSummary
    .committedRunIntakeSummary.sourceAuthority =
      "C:\\ControlStack_RuntimeData\\private\\candidate.json";
  const pathResult = await transport(clientRequest(pathBearing));
  assert.equal(pathResult.ok, false);
  assert.equal(pathResult.requestDispatched, false);
  assert.equal(fetchCalls, 0);
});

test("client rejects a registered response that omits either server preflight acknowledgement", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const transport =
    createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl(_path, options) {
        const body = await registry.register(JSON.parse(options.body));
        return responseFor({
          ...body,
          candidateReconstructionPreflightEligible: false,
        });
      },
    });
  const result = await transport(clientRequest());
  assertScalarClientResult(result);
  assert.equal(result.ok, false);
  assert.equal(result.responseReceived, true);
  assert.equal(result.responseValidated, false);
  assert.equal(
    result.blocker,
    "selected-project-registration-client-response-required-flag-not-true-candidateReconstructionPreflightEligible",
  );
});

test("registration client protocol remains same-origin, one-request, scalar-only, and no-write", async () => {
  const source = await readFile(
    new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js",
      import.meta.url,
    ),
    "utf8",
  );
  assert.equal((source.match(/browserFetch\(/g) || []).length, 1);
  assert.match(source, /credentials: "same-origin"/);
  assert.match(source, /cache: "no-store"/);
  assert.match(source, /preEngineActionEligibilityProjection/);
  assert.doesNotMatch(
    source,
    /writeFile|appendFile|mkdir|createWriteStream|RuntimeData\s*[.\[]|generateRunTable|generateIes|persistSelectedResult/,
  );
});
