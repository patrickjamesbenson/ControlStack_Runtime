import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION,
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
import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_CONTRACT_LOCK_ID,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";

const PROJECT_ID = "engine-run-preview-contract-project";
const ENVELOPE_ID = "env-engine-run-preview-contract-project";
const POLICY_FINGERPRINT = "safe-policy:engine-run-preview-contract";
const SOURCE_FINGERPRINT = "safe-source:engine-run-preview-contract";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:engine-run-preview-contract";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:engine-run-preview-contract";

const EXPECTED_SOURCE_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "selectedResultSummaryPresent",
  "runTableFirstNarrowOutputSummaryPresent",
  "selectedResultReadbackState",
  "selectedResultReadbackReadiness",
  "selectedResultReadbackReady",
  "selectedResultReadbackFailClosed",
  "selectedResultReadbackBlocker",
  "selectedResultSummarySchemaId",
  "selectedResultSummarySchemaVersion",
  "selectedResultSummaryState",
  "runTableFirstNarrowOutputSummarySchemaId",
  "runTableFirstNarrowOutputSummarySchemaVersion",
  "runTableFirstNarrowOutputSummaryState",
  "runTableFirstNarrowOutputHandoffContractState",
  "runTableFirstNarrowOutputHandoffContractReady",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "authorityStatesAligned",
  "fingerprintsAligned",
  "engineRunReadinessReadbackReady",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "selectedResultPersistedSummarySlotContractFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
  "selectedResultPersistedSummaryReadbackFingerprint",
  "selectedResultTargetLocation",
  "runTableFirstNarrowOutputTargetLocation",
  "selectedProjectOnly",
  "summaryOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "runTableRowsIncluded",
  "runTableRowCount",
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
  "projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint",
]);

const EXPECTED_PREVIEW_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "label",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "selectedProjectOnly",
  "sourceSummaryPresent",
  "engineRunReadinessSummaryPresent",
  "engineRunReadinessBoundaryReady",
  "selectedResultAvailable",
  "selectedResultAccepted",
  "engineVerified",
  "runCount",
  "acceptedRunCount",
  "engineVerifiedRunCount",
  "previewOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "nonInteractive",
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "placementCoordinatesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

const EXPECTED_SOURCE_STATES = Object.freeze({
  ready: "project_browser_selected_project_engine_run_readiness_readback_ready",
  missing: "project_browser_selected_project_engine_run_readiness_readback_missing",
  blockedFailClosed:
    "project_browser_selected_project_engine_run_readiness_readback_blocked_fail_closed",
});

const EXPECTED_PREVIEW_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_engine_run_preview_ready",
  missing: "shell_project_browser_selected_project_engine_run_preview_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_engine_run_preview_blocked_fail_closed",
});

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

const SOURCE_REQUIRED_FALSE_FLAGS = Object.freeze([
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

const PREVIEW_REQUIRED_FALSE_FLAGS = Object.freeze([
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "placementCoordinatesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
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
      "safe-accepted-selected-result-authority-gate:engine-run-preview-contract",
    selectedResultPersistenceAuthorityPreflightFingerprint:
      "safe-selected-result-persistence-authority-preflight:engine-run-preview-contract",
    selectedResultPersistenceBoundaryContractFingerprint:
      "safe-selected-result-persistence-boundary-contract:engine-run-preview-contract",
    selectedResultOutputReadinessPreflightFingerprint:
      "safe-selected-result-output-readiness-preflight:engine-run-preview-contract",
    selectedResultAuthorityGuardFingerprint:
      "safe-selected-result-authority-guard:engine-run-preview-contract",
    selectedResultProjectionFingerprint:
      "safe-selected-result-projection:engine-run-preview-contract",
    safeSelectedResultSourceObjectFingerprint:
      "safe-selected-result-source-object:engine-run-preview-contract",
    selectedResultHandoffScaffoldFingerprint:
      "safe-selected-result-handoff-scaffold:engine-run-preview-contract",
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
      "safe-selected-result-persisted-summary-slot-contract:engine-run-preview-contract",
    runTableFirstNarrowOutputHandoffContractFingerprint:
      "safe-runtable-first-narrow-output-handoff-contract:engine-run-preview-contract",
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
    ...overrides,
  };
}

function selectedEnvelope() {
  const selectedResultSummary = readySelectedResultSummary();
  const runTableFirstNarrowOutputSummary = readyRunTableFirstNarrowOutputSummary(
    selectedResultSummary,
  );
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    modules: {
      cs_selector: {
        downstreamContext: {
          selectedResultSummary,
          runTableFirstNarrowOutputSummary,
        },
      },
    },
  };
}

function readyReadbackSummary() {
  return buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    selectedEnvelope(),
    ENVELOPE_ID,
  );
}

function assertNoPrivateOrActionData(value) {
  const serialised = JSON.stringify(value);
  for (const token of [
    "IESNA:LM-63",
    "TILT=NONE",
    "engine-payload-secret",
    "run-row-secret",
    "electrical-secret",
    "placement-secret",
    "governance-secret",
    "mutation-secret",
    "candidate-output.ies",
    "C:\\ControlStack_RuntimeData",
    "blob:engine-run-preview-secret",
    "data:application/octet-stream;base64",
  ]) {
    assert.equal(serialised.includes(token), false, token);
  }
  for (const key of [
    "enginePayload",
    "selectorPayload",
    "runs",
    "runRows",
    "sourceRows",
    "rowKey",
    "runKey",
    "boards",
    "segments",
    "zones",
    "electricalValues",
    "placementCoordinates",
    "engineVerificationEvidence",
    "projectEnvelope",
    "governance",
    "mutationLog",
    "privatePath",
    "filename",
    "url",
    "blob",
    "base64",
    "preparedAction",
    "actionId",
  ]) {
    assert.equal(Object.hasOwn(value, key), false, key);
  }
}

function assertSafePreview(preview) {
  assert.equal(Object.isFrozen(preview), true);
  assert.deepEqual(Object.keys(preview), EXPECTED_PREVIEW_FIELD_ORDER);
  assert.equal(preview.selectedProjectOnly, true);
  assert.equal(preview.previewOnly, true);
  assert.equal(preview.diagnosticOnly, true);
  assert.equal(preview.readOnly, true);
  assert.equal(preview.redacted, true);
  assert.equal(preview.machineValueSafe, true);
  assert.equal(preview.nonInteractive, true);
  for (const key of PREVIEW_REQUIRED_FALSE_FLAGS) assert.equal(preview[key], false, key);
  assertNoPrivateOrActionData(preview);
}

test("engine-run preview contract lock fixes the source and shell schema boundaries", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_CONTRACT_LOCK_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-RUN-PREVIEW-CONTRACT-LOCK-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-RUN-PREVIEW-SURFACE-1",
  );

  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID,
    "controlstack.runtime.project-browser.selected-project-engine-run-readiness-readback-summary.v1",
  );
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION,
    1,
  );
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE,
    "project-browser-selected-project-engine-run-readiness-readback-summary-consumer",
  );
  assert.deepEqual(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES,
    EXPECTED_SOURCE_STATES,
  );
  assert.deepEqual(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER,
    EXPECTED_SOURCE_FIELD_ORDER,
  );

  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-engine-run-preview.v1",
  );
  assert.equal(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION, 1);
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
    EXPECTED_PREVIEW_STATES,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
    EXPECTED_PREVIEW_FIELD_ORDER,
  );
});

test("contract lock preserves the exact selected-project readback-to-preview projection", () => {
  const source = readyReadbackSummary();

  assert.equal(Object.isFrozen(source), true);
  assert.deepEqual(Object.keys(source), EXPECTED_SOURCE_FIELD_ORDER);
  assert.equal(source.state, EXPECTED_SOURCE_STATES.ready);
  assert.equal(source.readiness, "ready");
  assert.equal(source.ready, true);
  assert.equal(source.failClosed, false);
  assert.equal(source.blocker, null);
  assert.equal(source.selectedProjectId, ENVELOPE_ID);
  assert.equal(source.selectedProjectFound, true);
  assert.equal(source.projectId, PROJECT_ID);
  assert.equal(source.envelopeId, ENVELOPE_ID);
  assert.equal(source.selectedResultSummaryPresent, true);
  assert.equal(source.runTableFirstNarrowOutputSummaryPresent, true);
  assert.equal(source.engineRunReadinessReadbackReady, true);
  assert.equal(source.runTableRowCount, 0);
  for (const key of SOURCE_REQUIRED_FALSE_FLAGS) assert.equal(source[key], false, key);
  assertNoPrivateOrActionData(source);

  const preview = buildShellProjectBrowserSelectedProjectEngineRunPreview(source, ENVELOPE_ID);
  assertSafePreview(preview);
  assert.deepEqual(preview, {
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
    schemaVersion: 1,
    contractId: SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
    owner: "shell",
    surfaceId: "selected-project-engine-run-readiness",
    label: "Engine run readiness",
    state: EXPECTED_PREVIEW_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedProjectId: ENVELOPE_ID,
    selectedProjectFound: true,
    selectedProjectOnly: true,
    sourceSummaryPresent: true,
    engineRunReadinessSummaryPresent: true,
    engineRunReadinessBoundaryReady: true,
    selectedResultAvailable: true,
    selectedResultAccepted: true,
    engineVerified: true,
    runCount: 0,
    acceptedRunCount: 0,
    engineVerifiedRunCount: 0,
    previewOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    nonInteractive: true,
    engineActionAvailable: false,
    engineActionEnabled: false,
    engineExecutionRequested: false,
    engineExecutionAttempted: false,
    rawEnginePayloadExposed: false,
    runRowsExposed: false,
    exactElectricalValuesExposed: false,
    placementCoordinatesExposed: false,
    privateDataExposed: false,
    projectEnvelopeExposed: false,
    fingerprintsExposed: false,
    routesAdded: false,
    postEndpointsAdded: false,
    persistenceMutated: false,
    runtimeDataMutated: false,
    filesystemWriteAttempted: false,
  });
});

test("contract lock keeps missing, cross-project, and unsafe sources fail-closed", () => {
  const source = readyReadbackSummary();
  const missing = buildShellProjectBrowserSelectedProjectEngineRunPreview(null, ENVELOPE_ID);
  const mismatch = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    source,
    "env-other-engine-run-preview-contract-project",
  );
  const unsafe = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    {
      ...source,
      engineExecutionAttempted: true,
      enginePayload: "engine-payload-secret",
      runRows: [{ rowKey: "run-row-secret" }],
      privatePath: "C:\\ControlStack_RuntimeData\\candidate-output.ies",
    },
    ENVELOPE_ID,
  );

  for (const preview of [missing, mismatch, unsafe]) {
    assertSafePreview(preview);
    assert.equal(preview.ready, false);
    assert.equal(preview.failClosed, true);
    assert.equal(preview.selectedProjectFound, false);
    assert.equal(preview.engineRunReadinessBoundaryReady, false);
    assert.equal(preview.selectedResultAvailable, false);
    assert.equal(preview.selectedResultAccepted, false);
    assert.equal(preview.engineVerified, false);
    assert.equal(preview.runCount, 0);
    assert.equal(preview.acceptedRunCount, 0);
    assert.equal(preview.engineVerifiedRunCount, 0);
  }

  assert.equal(missing.state, EXPECTED_PREVIEW_STATES.missing);
  assert.equal(missing.readiness, "missing");
  assert.equal(missing.blocker, "selected-project-engine-run-preview-source-missing");
  assert.equal(mismatch.state, EXPECTED_PREVIEW_STATES.blockedFailClosed);
  assert.equal(mismatch.readiness, "blocked_fail_closed");
  assert.equal(mismatch.blocker, "selected-project-engine-run-preview-project-mismatch");
  assert.equal(unsafe.state, EXPECTED_PREVIEW_STATES.blockedFailClosed);
  assert.equal(unsafe.readiness, "blocked_fail_closed");
  assert.equal(unsafe.blocker, "selected-project-engine-run-preview-source-blocked");
});

test("contract lock fixes the existing text-only renderer and direct selected-project wiring", async () => {
  const shellSource = await readFile(
    new URL("../apps/workspace-shell/src/shell.js", import.meta.url),
    "utf8",
  );

  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineRunPreview(preview)",
  );
  const rendererEnd = shellSource.indexOf("function renderProjectBrowser({ context })", rendererStart);
  assert.ok(rendererStart >= 0);
  assert.ok(rendererEnd > rendererStart);
  const renderer = shellSource.slice(rendererStart, rendererEnd);

  assert.match(
    shellSource,
    /renderProjectBrowserSelectedProjectEngineRunPreview\(\s*buildShellProjectBrowserSelectedProjectEngineRunPreview\(\s*browser\.selectedProjectEngineRunReadinessReadbackSummary,\s*browser\.selectedProjectId,\s*\),\s*\);/s,
  );
  assert.doesNotMatch(
    shellSource,
    /buildShellProjectBrowserSelectedProjectEngineRunPreview\([^)]*(?:services|engine|runTable|RuntimeData|preparedAction)/,
  );

  for (const text of [
    "Redacted selected-project engine-run readiness summary.",
    "No selected-project engine-run readiness preview is available.",
    "Engine-run readiness preview is blocked fail-closed.",
    "Selected result available",
    "Selected result accepted",
    "Engine verified",
    "Runs",
    "Accepted runs",
    "Engine-verified runs",
    "Preview only, redacted, selected-project-only, diagnostic, and non-interactive. No Engine action is available from this surface.",
  ]) {
    assert.equal(renderer.includes(text), true, text);
  }

  const orderedLabels = [
    "Selected result available",
    "Selected result accepted",
    "Engine verified",
    "Runs",
    "Accepted runs",
    "Engine-verified runs",
  ];
  let previousIndex = -1;
  for (const label of orderedLabels) {
    const index = renderer.indexOf(`"${label}"`);
    assert.ok(index > previousIndex, label);
    previousIndex = index;
  }

  assert.doesNotMatch(
    renderer,
    /createElement\("(?:button|a|input|form|select|textarea)"\)/,
  );
  assert.doesNotMatch(
    renderer,
    /addEventListener|onclick|onClick|href|actionId|preparedAction|engineActionAvailable|engineActionEnabled/,
  );
  assert.doesNotMatch(
    renderer,
    /enginePayload|selectorPayload|runRows|sourceRows|electricalValues|placementCoordinates|projectEnvelope|fingerprint/i,
  );
});

test("contract lock adds no execution, workflow, route, persistence, RuntimeData, or filesystem seam", async () => {
  const [previewSource, workflowSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.doesNotMatch(previewSource, /^import\s/m);
  assert.doesNotMatch(previewSource, /createElement|addEventListener|onclick|onClick/);
  assert.doesNotMatch(
    previewSource,
    /\bfetch\s*\(|XMLHttpRequest|WebSocket|writeFile|appendFile|mkdir|unlink|rmSync|createWriteStream/,
  );
  assert.doesNotMatch(
    previewSource,
    /prepareShellProjectBrowserSelectedProjectExportsWorkflow|getShellProjectBrowserSelectedProjectExportAction|materiali[sz]e|invokeEngine|runEngine|executeEngine/,
  );
  assert.equal(previewSource.includes("packages/workspace-kernel"), false);
  assert.equal(previewSource.includes("RuntimeData"), false);

  assert.equal(workflowSource.includes("selectedProjectEngineRunReadinessReadbackSummary"), false);
  assert.equal(workflowSource.includes("projectBrowserSelectedProjectEngineRunPreview"), false);
  assert.equal(workflowSource.includes("Engine run readiness"), false);
  assert.equal(workflowSource.includes("engine-run-preview"), false);
});
