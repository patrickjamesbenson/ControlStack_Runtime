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

function readyProjection({
  missingField = null,
  outerBlocker = null,
  accessoryIntentCount = 0,
  indirectReady = false,
} = {}) {
  const cctCriValue = missingField === "cct"
    ? "CRI90"
    : missingField === "cri"
      ? "4000K"
      : "4000K / CRI90";
  const committedSelectorConstraints = [
    { fieldKey: "system", value: "DNX 60", valueLabel: "DNX 60", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    missingField === "optic" ? null : { fieldKey: "directOpticVar1", value: "80|Inlay", valueLabel: "Inlay", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    missingField === "target_lm_per_m" ? null : { fieldKey: "targetLmPerM", value: "1200", valueLabel: "1200", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "cctCri", value: cctCriValue, valueLabel: cctCriValue, committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    missingField === "control_type" ? null : { fieldKey: "controlType", value: "DALI-2", valueLabel: "DALI-2", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
  ].filter(Boolean);
  const candidateInputBlocker = missingField
    ? `missing-readonly-engine-candidate-input-${missingField}`
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
      ready: missingField !== "runs",
      committedRunIntakeReady: missingField !== "runs",
      sourceAuthority: "committed-selector-state",
      runQuantity: missingField === "runs" ? 0 : 1,
      runLengthMm: missingField === "runs" ? 0 : 3500,
      
    },
    runIntakePreviewSummary: {
      runIntakePreviewReady: missingField !== "runs",
      runCount: missingField === "runs" ? 0 : 1,
      totalQuantity: missingField === "runs" ? 0 : 1,
    },
    accessoryPlacementIntentSummary: { accessoryIntentCount },
    accessoryReservationRequired: accessoryIntentCount > 0,
    engineExecuted: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
  };
  const lmTemperatureReadinessPreview = {
    targetIntent: {
      direct: {
        ready: missingField !== "target_lm_per_m",
        valueLabel: missingField === "target_lm_per_m" ? "" : "1200",
      },
      indirect: { ready: indirectReady, valueLabel: indirectReady ? "600" : "" },
    },
    cctCriPairing: {
      direct: {
        ready: !["cct", "cri"].includes(missingField),
        valueLabel: cctCriValue,
      },
      indirect: {
        ready: indirectReady,
        valueLabel: indirectReady ? "4000K / CRI90" : "",
      },
    },
    controlIntent: {
      direct: {
        ready: missingField !== "control_type",
        valueLabel: missingField === "control_type" ? "" : "DALI-2",
        sourceBacked: true,
      },
      indirect: { ready: indirectReady, valueLabel: indirectReady ? "DALI-2" : "" },
    },
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
  assert.equal(mapper.ok, missingField === null);
  const projectedFactory = outerBlocker === null
    ? factoryApprovedInputsSummary
    : {
      ...factoryApprovedInputsSummary,
      factoryApprovedInputsReady: false,
      ready: false,
      readonlyEngineCandidateInputsReady: false,
      readonlyEngineCandidateInputsBlocker: outerBlocker,
      blocker: outerBlocker,
      stage2Ready: false,
    };
  const projectedMapperSummary = outerBlocker === null
    ? mapper.summary
    : { ...mapper.summary, blocker: outerBlocker };
  return buildSelectorPreEngineReadonlyActionEligibilityProjection({
    specBuildReadinessPreview: {
      factoryApprovedInputsReady: outerBlocker === null && candidateInputsReady,
      factoryApprovedInputsSummary: projectedFactory,
      readonlyEngineCandidateReady: mapper.ok === true,
      readonlyEngineCandidateMapperSummary: projectedMapperSummary,
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
    5,
  );
  assert.equal(Object.prototype.hasOwnProperty.call(sentBody, "projectEnvelope"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(sentBody, "enginePayload"), false);
});

test("client accepts a Tier-free ready projection without creating browser Tier authority", async () => {
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  let sentBody = null;
  const transport =
    createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl(_path, options) {
        sentBody = JSON.parse(options.body);
        return responseFor(await registry.register(sentBody));
      },
    });

  const projection = readyProjection();
  assert.equal(projection.ready, true);
  assert.equal(projection.blocker, null);

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

  const cases = [
    ["runs", "missing-candidate-field-runs"],
    ["optic", "missing-candidate-field-optic"],
    ["target_lm_per_m", "missing-candidate-field-target_lm_per_m"],
    ["cct", "missing-candidate-field-cct"],
    ["cri", "missing-candidate-field-cri"],
    ["control_type", "missing-candidate-field-control_type"],
  ];
  for (const [missingField, expectedBlocker] of cases) {
    const projection = readyProjection({ missingField });
    assert.equal(projection.ready, false, missingField);
    const result = await transport(clientRequest(localSave(projection)));
    assert.equal(result.ok, false, missingField);
    assert.equal(result.requestDispatched, false, missingField);
    assert.equal(result.blocker, expectedBlocker, missingField);
  }
  assert.equal(fetchCalls, 0);
});

test("client rebuilds the dedicated direct candidate when broader readiness is blocked", async () => {
  const outerBlockers = [
    "Stage 2 is not ready",
    "ambient-unavailable-from-current-source",
    "mounting-and-finishes-incomplete",
    "legacy-tiers-source-warning",
  ];
  for (const outerBlocker of outerBlockers) {
    const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
    let sentBody = null;
    const transport =
      createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
        async fetchImpl(_path, options) {
          sentBody = JSON.parse(options.body);
          return responseFor(await registry.register(sentBody));
        },
      });
    const projection = readyProjection({ outerBlocker });
    assert.equal(projection.ready, false, outerBlocker);
    assert.equal(projection.blocker, outerBlocker, outerBlocker);
    const result = await transport(clientRequest(localSave(projection)));
    assert.equal(result.ok, true, outerBlocker);
    assert.equal(result.requestDispatched, true, outerBlocker);
    assert.equal(
      sentBody.sourceProjection.selectorModule.preEngineActionEligibilityProjection.ready,
      true,
      outerBlocker,
    );
    assert.equal(
      sentBody.sourceProjection.selectorModule.preEngineActionEligibilityProjection
        .committedSelectorConstraints.some((row) => row.fieldKey === "tier"),
      false,
      outerBlocker,
    );
  }
});

test("client refuses accessories and indirect intent before registration dispatch", async () => {
  let fetchCalls = 0;
  const transport =
    createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
      async fetchImpl() {
        fetchCalls += 1;
        throw new Error("unsupported first-slice intent must not dispatch");
      },
    });

  const accessoryResult = await transport(clientRequest(localSave(readyProjection({
    accessoryIntentCount: 1,
  }))));
  assert.equal(accessoryResult.ok, false);
  assert.equal(accessoryResult.requestDispatched, false);
  assert.equal(
    accessoryResult.blocker,
    "selected-project-registration-client-accessory-intent-outside-first-slice",
  );

  const indirectResult = await transport(clientRequest(localSave(readyProjection({
    indirectReady: true,
  }))));
  assert.equal(indirectResult.ok, false);
  assert.equal(indirectResult.requestDispatched, false);
  assert.equal(
    indirectResult.blocker,
    "selected-project-registration-client-indirect-emission-outside-first-slice",
  );
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

  const blockedConstraint = localSave();
  blockedConstraint.envelope.modules.cs_selector.downstreamContext
    .preEngineActionEligibilityProjection.committedSelectorConstraints[0].blocked = true;
  const blockedConstraintResult = await transport(clientRequest(blockedConstraint));
  assert.equal(blockedConstraintResult.ok, false);
  assert.equal(blockedConstraintResult.requestDispatched, false);

  const unsafe = localSave();
  unsafe.envelope.modules.cs_selector.downstreamContext
    .preEngineActionEligibilityProjection.factoryApprovedInputsSummary.engineExecuted = true;
  const unsafeResult = await transport(clientRequest(unsafe));
  assert.equal(unsafeResult.ok, false);
  assert.equal(unsafeResult.requestDispatched, false);
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