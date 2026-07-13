import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
  createProjectBrowserService,
  findUnsafeSelectedProjectEngineRunReadinessReadbackField,
  orderedSelectedProjectEngineRunReadinessReadbackSummary,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION,
  validateSelectedProjectEngineRunReadinessReadbackSources,
} from "../packages/workspace-kernel/projectBrowserService.js";
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

const PROJECT_ID = "engine-run-readiness-project";
const ENVELOPE_ID = "env-engine-run-readiness-project";
const SELECTED_RESULT_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";
const RUNTABLE_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary";

const POLICY_FINGERPRINT = "safe-policy:engine-run-readiness-readback";
const SOURCE_FINGERPRINT = "safe-source:engine-run-readiness-readback";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:engine-run-readiness-readback";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:engine-run-readiness-readback";

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

const REQUIRED_FALSE_PROJECTION_FLAGS = Object.freeze([
  "runTableRowsIncluded",
  "engineExecutionEnabled",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "outputGenerated",
  "outputGenerationEnabled",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawSelectedPayloadReturned",
  "runTableRowsReturned",
  "rawRunTableRowsReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "privatePathsReturned",
]);

function readySelectedResultSummary(overrides = {}) {
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
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    acceptedSelectedResultAuthorityGateFingerprint:
      "safe-accepted-selected-result-authority-gate:engine-run-readiness-readback",
    selectedResultPersistenceAuthorityPreflightFingerprint:
      "safe-selected-result-persistence-authority-preflight:engine-run-readiness-readback",
    selectedResultPersistenceBoundaryContractFingerprint:
      "safe-selected-result-persistence-boundary-contract:engine-run-readiness-readback",
    selectedResultOutputReadinessPreflightFingerprint:
      "safe-selected-result-output-readiness-preflight:engine-run-readiness-readback",
    selectedResultAuthorityGuardFingerprint:
      "safe-selected-result-authority-guard:engine-run-readiness-readback",
    selectedResultProjectionFingerprint:
      "safe-selected-result-projection:engine-run-readiness-readback",
    safeSelectedResultSourceObjectFingerprint:
      "safe-selected-result-source-object:engine-run-readiness-readback",
    selectedResultHandoffScaffoldFingerprint:
      "safe-selected-result-handoff-scaffold:engine-run-readiness-readback",
    ...Object.fromEntries(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
    ...overrides,
  };
}

function readyRunTableFirstNarrowOutputSummary(selectedResultSummary, overrides = {}) {
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
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResultSummary,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      "safe-selected-result-persisted-summary-slot-contract:engine-run-readiness-readback",
    runTableFirstNarrowOutputHandoffContractFingerprint:
      "safe-runtable-first-narrow-output-handoff-contract:engine-run-readiness-readback",
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
    ...overrides,
  };
}

function envelope({
  selectedResultSummary = readySelectedResultSummary(),
  runTableFirstNarrowOutputSummary = null,
  overrides = {},
} = {}) {
  const runTableSummary = runTableFirstNarrowOutputSummary === null && selectedResultSummary
    ? readyRunTableFirstNarrowOutputSummary(selectedResultSummary)
    : runTableFirstNarrowOutputSummary;
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    modules: {
      cs_selector: {
        downstreamContext: {
          ...(selectedResultSummary ? { selectedResultSummary } : {}),
          ...(runTableSummary ? { runTableFirstNarrowOutputSummary: runTableSummary } : {}),
        },
      },
    },
    ...overrides,
  };
}

function projectSummary() {
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    restoreEligible: true,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    title: "Engine run readiness project",
  };
}

function assertProjectionShape(summary) {
  assert.deepEqual(
    Object.keys(summary),
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER,
  );
  assert.equal(
    summary.schemaId,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID,
  );
  assert.equal(
    summary.schemaVersion,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION,
  );
  assert.equal(summary.owner, "shell");
  assert.equal(summary.source, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE);
  assert.equal(summary.selectedResultTargetLocation, SELECTED_RESULT_TARGET);
  assert.equal(summary.runTableFirstNarrowOutputTargetLocation, RUNTABLE_TARGET);
  assert.equal(summary.selectedProjectOnly, true);
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.runTableRowCount, 0);
  for (const flag of REQUIRED_FALSE_PROJECTION_FLAGS) assert.equal(summary[flag], false, flag);
  for (const key of ["engineReady", "engineRunReady", "runReady", "canRun", "executable", "outputAvailable"]) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, key), false, key);
  }
  assert.ok(
    summary.projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint.startsWith(
      "safe-project-browser-selected-project-engine-run-readiness-readback-summary:",
    ),
  );
}

function assertNoUnsafeSurface(summary) {
  const text = JSON.stringify(summary);
  for (const token of [
    "IESNA:LM-63",
    "TILT=NONE",
    "engine-payload-secret",
    "candidate-output-secret",
    "governance-secret",
    "candidate-output.ies",
    "base64-secret",
    "blob:secret",
    "https://example.invalid/output",
    "C:\\ControlStack_RuntimeData",
  ]) {
    assert.equal(text.includes(token), false, token);
  }
  for (const key of [
    "body",
    "enginePayload",
    "rawEnginePayload",
    "engineResult",
    "rawEngineResult",
    "selectedResultBody",
    "selectedResultPayload",
    "runTableRows",
    "rawRunTableRows",
    "rows",
    "candidateOutput",
    "candidateOutputs",
    "candidateOutputBody",
    "candidateOutputPayload",
    "manifest",
    "detail",
    "artifactList",
    "outputFiles",
    "filename",
    "fileName",
    "filePath",
    "privatePath",
    "iesText",
    "photometry",
    "candela",
    "governancePayload",
    "base64",
    "blob",
    "url",
    "projectEnvelope",
    "envelopeBody",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, key), false, key);
  }
}

test("selected-project engine-run readiness readback aligns only persisted redacted summaries", () => {
  const selectedResultSummary = readySelectedResultSummary();
  const runTableSummary = readyRunTableFirstNarrowOutputSummary(selectedResultSummary);
  const sourceEnvelope = envelope({ selectedResultSummary, runTableFirstNarrowOutputSummary: runTableSummary });
  const summary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );

  assert.equal(
    validateSelectedProjectEngineRunReadinessReadbackSources(selectedResultSummary, runTableSummary),
    null,
  );
  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.ready);
  assert.equal(summary.readiness, "ready");
  assert.equal(summary.ready, true);
  assert.equal(summary.failClosed, false);
  assert.equal(summary.blocker, null);
  assert.equal(summary.selectedProjectId, ENVELOPE_ID);
  assert.equal(summary.selectedProjectFound, true);
  assert.equal(summary.projectId, PROJECT_ID);
  assert.equal(summary.envelopeId, ENVELOPE_ID);
  assert.equal(summary.selectedResultSummaryPresent, true);
  assert.equal(summary.runTableFirstNarrowOutputSummaryPresent, true);
  assert.equal(summary.selectedResultReadbackReadiness, "ready");
  assert.equal(summary.selectedResultReadbackReady, true);
  assert.equal(summary.selectedResultReadbackFailClosed, false);
  assert.equal(summary.selectedResultReadbackBlocker, null);
  assert.equal(summary.selectedResultSummarySchemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(
    summary.runTableFirstNarrowOutputSummarySchemaId,
    RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  );
  assert.equal(summary.authorityStatesAligned, true);
  assert.equal(summary.fingerprintsAligned, true);
  assert.equal(summary.engineRunReadinessReadbackReady, true);
  assert.equal(summary.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(summary.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(summary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(summary.sourceVersionFingerprint, SOURCE_VERSION_FINGERPRINT);
  assert.equal(
    summary.persistedSelectedResultSummaryFingerprint,
    stableFingerprint("safe-persisted-selected-result-summary", selectedResultSummary),
  );
  assertNoUnsafeSurface(summary);
});

test("selected-project engine-run readiness readback distinguishes missing selection, invalid identity, missing project, and missing summaries", () => {
  const notSelected = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary();
  const invalid = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope(),
    "C:\\private\\project",
  );
  const notFound = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    null,
    ENVELOPE_ID,
  );
  const missingSelectedResult = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope({ selectedResultSummary: null, runTableFirstNarrowOutputSummary: null }),
    ENVELOPE_ID,
  );
  const selectedResultSummary = readySelectedResultSummary();
  const missingRunTable = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope({ selectedResultSummary, runTableFirstNarrowOutputSummary: false }),
    ENVELOPE_ID,
  );

  assertProjectionShape(notSelected);
  assert.equal(notSelected.state, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.missing);
  assert.equal(notSelected.blocker, "project-browser-selected-project-not-selected");
  assert.equal(notSelected.engineRunReadinessReadbackReady, false);

  assertProjectionShape(invalid);
  assert.equal(invalid.state, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.blockedFailClosed);
  assert.equal(invalid.readiness, "blocked_fail_closed");
  assert.equal(invalid.blocker, "project-browser-selected-project-id-invalid");

  assertProjectionShape(notFound);
  assert.equal(notFound.state, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.missing);
  assert.equal(notFound.blocker, "project-browser-selected-project-not-found");
  assert.equal(notFound.selectedProjectFound, false);

  assertProjectionShape(missingSelectedResult);
  assert.equal(
    missingSelectedResult.blocker,
    "project-browser-selected-project-selected-result-summary-missing",
  );
  assert.equal(missingSelectedResult.selectedResultSummaryPresent, false);

  assertProjectionShape(missingRunTable);
  assert.equal(
    missingRunTable.blocker,
    "project-browser-selected-project-runtable-first-narrow-output-summary-missing",
  );
  assert.equal(missingRunTable.runTableFirstNarrowOutputSummaryPresent, false);

  for (const summary of [notSelected, invalid, notFound, missingSelectedResult, missingRunTable]) {
    assert.equal(summary.ready, false);
    assert.equal(summary.failClosed, true);
    assert.equal(summary.authorityStatesAligned, false);
    assert.equal(summary.fingerprintsAligned, false);
    assertNoUnsafeSurface(summary);
  }
});

test("selected-project engine-run readiness readback blocks authority and fingerprint misalignment", () => {
  const selectedResultSummary = readySelectedResultSummary();
  const authorityMismatch = readyRunTableFirstNarrowOutputSummary(selectedResultSummary, {
    acceptedSelectedResultAuthorityState: "different_authority_state",
  });
  const fingerprintMismatch = readyRunTableFirstNarrowOutputSummary(selectedResultSummary, {
    sourceInputFingerprint: "safe-source-input:different",
  });
  const persistedFingerprintMismatch = readyRunTableFirstNarrowOutputSummary(selectedResultSummary, {
    persistedSelectedResultSummaryFingerprint: "safe-persisted-selected-result-summary:different",
  });

  assert.equal(
    validateSelectedProjectEngineRunReadinessReadbackSources(selectedResultSummary, authorityMismatch),
    "engine-run-readiness-authority-state-mismatch-acceptedSelectedResultAuthorityState",
  );
  assert.equal(
    validateSelectedProjectEngineRunReadinessReadbackSources(selectedResultSummary, fingerprintMismatch),
    "engine-run-readiness-fingerprint-mismatch-sourceInputFingerprint",
  );
  assert.equal(
    validateSelectedProjectEngineRunReadinessReadbackSources(selectedResultSummary, persistedFingerprintMismatch),
    "engine-run-readiness-persisted-selected-result-summary-fingerprint-mismatch",
  );

  const summary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope({
      selectedResultSummary,
      runTableFirstNarrowOutputSummary: authorityMismatch,
    }),
    ENVELOPE_ID,
  );
  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.blockedFailClosed);
  assert.equal(summary.readiness, "blocked_fail_closed");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(
    summary.blocker,
    "engine-run-readiness-authority-state-mismatch-acceptedSelectedResultAuthorityState",
  );
  assert.equal(summary.authorityStatesAligned, false);
  assert.equal(summary.fingerprintsAligned, false);
  assert.equal(summary.policyFingerprint, null);
  assertNoUnsafeSurface(summary);
});

test("selected-project engine-run readiness readback rejects raw bodies, rows, files, private paths, and execution claims", () => {
  const selectedResultSummary = readySelectedResultSummary();
  const runTableSummary = readyRunTableFirstNarrowOutputSummary(selectedResultSummary);
  const unsafeExecutionClaim = {
    ...runTableSummary,
    engineExecutionAttempted: true,
  };
  const unsafeRows = {
    ...runTableSummary,
    rows: [{ rowKey: "secret-row" }],
  };
  const unsafeSelectedResult = {
    ...selectedResultSummary,
    enginePayload: { body: "engine-payload-secret" },
    iesText: "IESNA:LM-63 TILT=NONE",
    privatePath: "C:\\ControlStack_RuntimeData\\candidate-output.ies",
  };

  assert.equal(
    findUnsafeSelectedProjectEngineRunReadinessReadbackField(unsafeExecutionClaim),
    "blocked-unsafe-true-flag-engineExecutionAttempted",
  );
  assert.equal(
    findUnsafeSelectedProjectEngineRunReadinessReadbackField(unsafeRows),
    "blocked-raw-field-rows",
  );
  assert.equal(
    findUnsafeSelectedProjectEngineRunReadinessReadbackField(unsafeSelectedResult),
    "blocked-raw-field-enginePayload",
  );
  assert.equal(
    validateSelectedProjectEngineRunReadinessReadbackSources(selectedResultSummary, unsafeExecutionClaim),
    "blocked-unsafe-true-flag-engineExecutionAttempted",
  );

  const summary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope({ selectedResultSummary, runTableFirstNarrowOutputSummary: unsafeExecutionClaim }),
    ENVELOPE_ID,
  );
  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.blockedFailClosed);
  assert.equal(summary.blocker, "blocked-unsafe-true-flag-engineExecutionAttempted");
  assert.equal(summary.engineExecutionAttempted, false);
  assert.equal(summary.runTableRowCount, 0);
  assertNoUnsafeSurface(summary);
});

test("project-browser snapshot exposes selected-project engine-run readiness without invoking Engine or output generation", () => {
  const selectedEnvelope = envelope();
  const calls = [];
  const store = {
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "engine-run-readiness-readback-test-store",
        projects: [projectSummary()],
        count: 1,
        savedCount: 1,
        fixtureCount: 0,
        safeEmpty: false,
        save: {},
        restore: {},
        hydrate: {},
        handoffShare: {},
      };
    },
    getProjectEnvelope(projectIdOrEnvelopeId) {
      calls.push(projectIdOrEnvelopeId);
      return projectIdOrEnvelopeId === PROJECT_ID || projectIdOrEnvelopeId === ENVELOPE_ID
        ? structuredClone(selectedEnvelope)
        : null;
    },
    saveCurrentProjectEnvelope() {
      throw new Error("readback must not save project state");
    },
    restoreProjectEnvelope() {
      throw new Error("readback must not restore project state");
    },
    prepareHandoffSharePackage() {
      throw new Error("readback must not prepare output packages");
    },
  };
  const service = createProjectBrowserService({ savedProjectStore: store });

  const inspected = service.inspectProject(ENVELOPE_ID, {
    enginePayload: "engine-payload-secret",
    candidateOutput: "candidate-output-secret",
    privatePath: "C:\\ControlStack_RuntimeData\\candidate-output.ies",
  });
  const summary = inspected.browser.selectedProjectEngineRunReadinessReadbackSummary;

  assert.equal(inspected.accepted, true);
  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.ready);
  assert.equal(summary.selectedProjectId, ENVELOPE_ID);
  assert.equal(summary.engineRunReadinessReadbackReady, true);
  assert.equal(summary.engineExecutionEnabled, false);
  assert.equal(summary.engineExecutionAttempted, false);
  assert.equal(summary.selectedResultCreated, false);
  assert.equal(summary.runTableGenerationEnabled, false);
  assert.equal(summary.outputGenerationEnabled, false);
  assert.deepEqual(calls, [ENVELOPE_ID, ENVELOPE_ID]);
  assertNoUnsafeSurface(summary);
});

test("selected-project engine-run readiness readback is ordered, deterministic, and does not mutate its source", () => {
  const sourceEnvelope = envelope();
  const selectedResultSummary = sourceEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary;
  const runTableSummary = sourceEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary;
  const before = JSON.stringify(sourceEnvelope);

  const first = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );
  const second = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );
  const reordered = orderedSelectedProjectEngineRunReadinessReadbackSummary({ ...first });

  assertProjectionShape(first);
  assert.deepEqual(first, second);
  assert.deepEqual(reordered, first);
  assert.equal(
    validateSelectedProjectEngineRunReadinessReadbackSources(selectedResultSummary, runTableSummary),
    null,
  );
  assert.equal(JSON.stringify(sourceEnvelope), before);
  assertNoUnsafeSurface(first);
});
