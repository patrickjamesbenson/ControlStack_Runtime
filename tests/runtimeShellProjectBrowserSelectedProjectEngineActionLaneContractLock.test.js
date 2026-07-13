import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_CONTRACT_LOCK_ID,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";
import {
  getShellProjectBrowserSelectedProjectExportAction,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const SOURCE_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-engine-run-readiness-readback-summary.v1";
const PROJECT_ID = "engine-action-lane-contract-project";
const ENVELOPE_ID = "env-engine-action-lane-contract-project";

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

const EXPECTED_ACTION_LANE_FIELD_ORDER = Object.freeze([
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
  "sourcePreviewPresent",
  "sourcePreviewState",
  "sourcePreviewReadiness",
  "sourcePreviewReady",
  "engineRunReadinessBoundaryReady",
  "selectedResultAccepted",
  "engineVerified",
  "runCount",
  "actionItemCount",
  "enabledActionItemCount",
  "actions",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "userGestureRequired",
  "nonExecuting",
  "engineCapabilityMounted",
  "preparedActionRetainedPrivately",
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "selectedResultPersistenceEnabled",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "outputGenerated",
  "outputGenerationEnabled",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

const EXPECTED_ACTION_ITEM_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "actionId",
  "label",
  "state",
  "readiness",
  "available",
  "enabled",
  "failClosed",
  "blocker",
  "userGestureRequired",
  "selectedProjectOnly",
  "preparedActionRetainedPrivately",
]);

const EXPECTED_ACTION_LANE_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_engine_action_lane_ready",
  missing: "shell_project_browser_selected_project_engine_action_lane_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_engine_action_lane_blocked_fail_closed",
});

const REQUIRED_FALSE_SOURCE_FLAGS = Object.freeze([
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

const REQUIRED_FALSE_PREVIEW_FLAGS = Object.freeze([
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

const REQUIRED_FALSE_ACTION_LANE_FLAGS = Object.freeze([
  "engineCapabilityMounted",
  "preparedActionRetainedPrivately",
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "selectedResultPersistenceEnabled",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "outputGenerated",
  "outputGenerationEnabled",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

function readySourceSummary(overrides = {}) {
  return Object.freeze({
    schemaId: SOURCE_SCHEMA_ID,
    schemaVersion: 1,
    owner: "shell",
    source: "project-browser-selected-project-engine-run-readiness-readback",
    state: "project_browser_selected_project_engine_run_readiness_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedProjectId: ENVELOPE_ID,
    selectedProjectFound: true,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    selectedResultSummaryPresent: true,
    runTableFirstNarrowOutputSummaryPresent: true,
    selectedResultReadbackState: "selected_result_persisted_summary_readback_ready",
    selectedResultReadbackReadiness: "ready",
    selectedResultReadbackReady: true,
    selectedResultReadbackFailClosed: false,
    selectedResultReadbackBlocker: null,
    runTableFirstNarrowOutputHandoffContractReady: true,
    acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
    authorityStatesAligned: true,
    fingerprintsAligned: true,
    engineRunReadinessReadbackReady: true,
    runTableRowCount: 4,
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    policyFingerprint: "safe-policy:engine-action-lane-contract",
    sourceFingerprint: "safe-source:engine-action-lane-contract",
    projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint:
      "safe-project-browser-selected-project-engine-run-readiness-readback-summary:engine-action-lane-contract",
    ...Object.fromEntries(REQUIRED_FALSE_SOURCE_FLAGS.map((key) => [key, false])),
    ...overrides,
  });
}

function readyPreview() {
  return buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary(),
    ENVELOPE_ID,
  );
}

function assertSafePreview(preview) {
  assert.equal(Object.isFrozen(preview), true);
  assert.deepEqual(Object.keys(preview), EXPECTED_PREVIEW_FIELD_ORDER);
  assert.equal(preview.schemaId, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID);
  assert.equal(preview.schemaVersion, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION);
  assert.equal(
    preview.contractId,
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
  );
  assert.equal(preview.owner, "shell");
  assert.equal(preview.surfaceId, "selected-project-engine-run-readiness");
  assert.equal(preview.selectedProjectOnly, true);
  assert.equal(preview.previewOnly, true);
  assert.equal(preview.diagnosticOnly, true);
  assert.equal(preview.readOnly, true);
  assert.equal(preview.redacted, true);
  assert.equal(preview.machineValueSafe, true);
  assert.equal(preview.nonInteractive, true);
  for (const key of REQUIRED_FALSE_PREVIEW_FLAGS) assert.equal(preview[key], false, key);
}

function assertSafeActionLane(actionLane) {
  assert.equal(Object.isFrozen(actionLane), true);
  assert.deepEqual(Object.keys(actionLane), EXPECTED_ACTION_LANE_FIELD_ORDER);
  assert.equal(Object.isFrozen(actionLane.actions), true);
  assert.equal(actionLane.actions.length, 1);
  assert.equal(Object.isFrozen(actionLane.actions[0]), true);
  assert.deepEqual(Object.keys(actionLane.actions[0]), EXPECTED_ACTION_ITEM_FIELD_ORDER);
  assert.equal(actionLane.selectedProjectOnly, true);
  assert.equal(actionLane.readOnly, true);
  assert.equal(actionLane.redacted, true);
  assert.equal(actionLane.machineValueSafe, true);
  assert.equal(actionLane.userGestureRequired, true);
  assert.equal(actionLane.nonExecuting, true);
  assert.equal(actionLane.actionItemCount, 1);
  assert.equal(actionLane.enabledActionItemCount, 0);
  for (const key of REQUIRED_FALSE_ACTION_LANE_FLAGS) assert.equal(actionLane[key], false, key);
  assert.equal(actionLane.actions[0].available, false);
  assert.equal(actionLane.actions[0].enabled, false);
  assert.equal(actionLane.actions[0].failClosed, true);
  assert.equal(actionLane.actions[0].userGestureRequired, true);
  assert.equal(actionLane.actions[0].selectedProjectOnly, true);
  assert.equal(actionLane.actions[0].preparedActionRetainedPrivately, false);
}

function assertNoSensitiveProjection(value) {
  const serialised = JSON.stringify(value);
  for (const token of [
    "engine-payload-secret",
    "selector-payload-secret",
    "run-row-secret",
    "electrical-secret",
    "placement-secret",
    "selected-result-secret",
    "project-envelope-secret",
    "fingerprint-secret",
    "mutation-secret",
    "C:\\ControlStack_RuntimeData",
    "candidate-output.ies",
    "blob:engine-action-lane-contract-secret",
    "data:application/octet-stream;base64",
  ]) {
    assert.equal(serialised.includes(token), false, token);
  }
}

test("action-lane contract lock fixes the preview, lane, and action-item schema boundaries", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_CONTRACT_LOCK_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-CONTRACT-LOCK-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-SURFACE-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-engine-action-lane.v1",
  );
  assert.equal(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_VERSION, 1);
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-engine-action-item.v1",
  );
  assert.equal(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION, 1);
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
    EXPECTED_ACTION_LANE_STATES,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER,
    EXPECTED_ACTION_LANE_FIELD_ORDER,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER,
    EXPECTED_ACTION_ITEM_FIELD_ORDER,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
    EXPECTED_PREVIEW_FIELD_ORDER,
  );
});

test("contract lock preserves the exact frozen ready-preview to disabled action-lane projection", () => {
  const preview = readyPreview();
  assertSafePreview(preview);
  assert.equal(preview.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready);
  assert.equal(preview.readiness, "ready");
  assert.equal(preview.ready, true);
  assert.equal(preview.failClosed, false);
  assert.equal(preview.blocker, null);
  assert.equal(preview.selectedProjectId, ENVELOPE_ID);
  assert.equal(preview.selectedProjectFound, true);
  assert.equal(preview.engineRunReadinessBoundaryReady, true);
  assert.equal(preview.selectedResultAccepted, true);
  assert.equal(preview.engineVerified, true);
  assert.equal(preview.runCount, 4);

  const actionLane = buildShellProjectBrowserSelectedProjectEngineActionLane(preview);
  assertSafeActionLane(actionLane);
  assert.deepEqual(actionLane, {
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID,
    schemaVersion: 1,
    contractId: SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
    owner: "shell",
    surfaceId: "selected-project-engine-action-lane",
    label: "Engine actions",
    state: EXPECTED_ACTION_LANE_STATES.blockedFailClosed,
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "selected-project-engine-action-capability-not-mounted",
    selectedProjectId: ENVELOPE_ID,
    selectedProjectFound: true,
    selectedProjectOnly: true,
    sourcePreviewPresent: true,
    sourcePreviewState: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready,
    sourcePreviewReadiness: "ready",
    sourcePreviewReady: true,
    engineRunReadinessBoundaryReady: true,
    selectedResultAccepted: true,
    engineVerified: true,
    runCount: 4,
    actionItemCount: 1,
    enabledActionItemCount: 0,
    actions: [{
      schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
      schemaVersion: 1,
      actionId: "run-engine",
      label: "Run Engine",
      state: "blocked",
      readiness: "blocked_fail_closed",
      available: false,
      enabled: false,
      failClosed: true,
      blocker: "selected-project-engine-action-capability-not-mounted",
      userGestureRequired: true,
      selectedProjectOnly: true,
      preparedActionRetainedPrivately: false,
    }],
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    userGestureRequired: true,
    nonExecuting: true,
    engineCapabilityMounted: false,
    preparedActionRetainedPrivately: false,
    engineActionAvailable: false,
    engineActionEnabled: false,
    engineExecutionRequested: false,
    engineExecutionAttempted: false,
    selectedResultCreated: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    outputGenerated: false,
    outputGenerationEnabled: false,
    rawEnginePayloadExposed: false,
    runRowsExposed: false,
    exactElectricalValuesExposed: false,
    privateDataExposed: false,
    projectEnvelopeExposed: false,
    fingerprintsExposed: false,
    routesAdded: false,
    postEndpointsAdded: false,
    persistenceMutated: false,
    runtimeDataMutated: false,
    filesystemWriteAttempted: false,
  });
  assertNoSensitiveProjection(actionLane);
});

test("contract lock accepts only the exact frozen preview descriptor and fails closed otherwise", () => {
  const preview = readyPreview();
  const unfrozenPreview = { ...preview };
  const extraFieldPreview = Object.freeze({ ...preview, enginePayload: "engine-payload-secret" });
  const unsafeFlagPreview = Object.freeze({ ...preview, engineExecutionAttempted: true });
  const reorderedPreview = Object.freeze(Object.fromEntries(Object.entries(preview).reverse()));
  const wrongSchemaPreview = Object.freeze({ ...preview, schemaVersion: 2 });
  const rawReadbackSummary = readySourceSummary();
  const crossProjectPreview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary(),
    "env-other-engine-action-lane-contract-project",
  );

  const blocked = [
    unfrozenPreview,
    extraFieldPreview,
    unsafeFlagPreview,
    reorderedPreview,
    wrongSchemaPreview,
    rawReadbackSummary,
    crossProjectPreview,
  ].map((candidate) => buildShellProjectBrowserSelectedProjectEngineActionLane(candidate));

  for (const actionLane of blocked) {
    assertSafeActionLane(actionLane);
    assert.equal(actionLane.state, EXPECTED_ACTION_LANE_STATES.blockedFailClosed);
    assert.equal(actionLane.readiness, "blocked_fail_closed");
    assert.equal(actionLane.ready, false);
    assert.equal(actionLane.failClosed, true);
    assert.equal(actionLane.blocker, "selected-project-engine-action-readiness-preview-blocked");
    assert.equal(actionLane.selectedProjectFound, false);
    assert.equal(actionLane.sourcePreviewReady, false);
    assert.equal(actionLane.engineRunReadinessBoundaryReady, false);
    assert.equal(actionLane.selectedResultAccepted, false);
    assert.equal(actionLane.engineVerified, false);
    assert.equal(actionLane.runCount, 0);
    assertNoSensitiveProjection(actionLane);
  }

  const missingPreview = buildShellProjectBrowserSelectedProjectEngineRunPreview(null, ENVELOPE_ID);
  for (const actionLane of [
    buildShellProjectBrowserSelectedProjectEngineActionLane(null),
    buildShellProjectBrowserSelectedProjectEngineActionLane(missingPreview),
  ]) {
    assertSafeActionLane(actionLane);
    assert.equal(actionLane.state, EXPECTED_ACTION_LANE_STATES.missing);
    assert.equal(actionLane.readiness, "missing");
    assert.equal(actionLane.ready, false);
    assert.equal(actionLane.failClosed, true);
    assert.equal(actionLane.blocker, "selected-project-engine-action-readiness-preview-missing");
    assert.equal(actionLane.sourcePreviewReady, false);
    assert.equal(actionLane.engineRunReadinessBoundaryReady, false);
    assert.equal(actionLane.selectedResultAccepted, false);
    assert.equal(actionLane.engineVerified, false);
    assert.equal(actionLane.runCount, 0);
  }
});

test("contract lock fixes the direct preview-to-action-lane wiring and separate shell mount", async () => {
  const shellSource = await readFile(
    new URL("../apps/workspace-shell/src/shell.js", import.meta.url),
    "utf8",
  );
  const renderProjectBrowserStart = shellSource.indexOf("function renderProjectBrowser({ context })");
  const renderProjectBrowserEnd = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(actionLane)",
    renderProjectBrowserStart,
  );
  const renderProjectBrowserSource = shellSource.slice(
    renderProjectBrowserStart,
    renderProjectBrowserEnd,
  );
  const previewSectionIndex = shellSource.indexOf(
    "const engineRunPreviewSection = document.createElement(\"section\")",
  );
  const actionLaneSectionIndex = shellSource.indexOf(
    "const engineActionLaneSection = document.createElement(\"section\")",
  );

  assert.ok(renderProjectBrowserStart >= 0);
  assert.ok(renderProjectBrowserEnd > renderProjectBrowserStart);
  assert.ok(previewSectionIndex >= 0);
  assert.ok(actionLaneSectionIndex > previewSectionIndex);
  assert.equal(
    (renderProjectBrowserSource.match(/buildShellProjectBrowserSelectedProjectEngineRunPreview\(/g) || []).length,
    1,
  );
  assert.equal(
    (renderProjectBrowserSource.match(/buildShellProjectBrowserSelectedProjectEngineActionLane\(/g) || []).length,
    1,
  );
  assert.match(
    renderProjectBrowserSource,
    /const engineRunPreview =\s*buildShellProjectBrowserSelectedProjectEngineRunPreview\(\s*browser\.selectedProjectEngineRunReadinessReadbackSummary,\s*browser\.selectedProjectId,\s*\);/,
  );
  assert.match(
    renderProjectBrowserSource,
    /renderProjectBrowserSelectedProjectEngineRunPreview\(engineRunPreview\);\s*renderProjectBrowserSelectedProjectEngineActionLane\(\s*buildShellProjectBrowserSelectedProjectEngineActionLane\(engineRunPreview\),\s*\);/,
  );
  assert.match(
    shellSource,
    /engineActionLaneSection\.className = "cs-shell__project-browser-engine-action-lane"/,
  );
  assert.match(
    shellSource,
    /engineActionLaneSection\.setAttribute\("aria-label", "Engine actions"\)/,
  );
  assert.match(
    shellSource,
    /engineActionLaneHeading\.textContent = "Engine actions"/,
  );
  assert.match(
    shellSource,
    /projectBrowserPanel\.append\([^;]*engineRunPreviewSection, engineActionLaneSection, projectBrowserList\);/s,
  );
});

test("contract lock fixes one text-only disabled Run Engine button with no listener or invocation seam", async () => {
  const shellSource = await readFile(
    new URL("../apps/workspace-shell/src/shell.js", import.meta.url),
    "utf8",
  );
  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(actionLane)",
  );
  const rendererEnd = shellSource.indexOf(
    "function setProjectBrowserSelectedProjectExportsWorkflowDescriptor(workflowDescriptor)",
    rendererStart,
  );
  const renderer = shellSource.slice(rendererStart, rendererEnd);

  assert.ok(rendererStart >= 0);
  assert.ok(rendererEnd > rendererStart);
  assert.equal((renderer.match(/createElement\("button"\)/g) || []).length, 1);
  assert.equal((renderer.match(/createElement\("p"\)/g) || []).length, 2);
  assert.doesNotMatch(
    renderer,
    /createElement\("(?:a|input|form|select|textarea)"\)/,
  );
  assert.match(renderer, /button\.type = "button"/);
  assert.match(
    renderer,
    /button\.className = "cs-shell__project-browser-engine-action-lane-button"/,
  );
  assert.match(
    renderer,
    /button\.textContent = actionLane\?\.actions\?\.\[0\]\?\.label \|\| "Run Engine"/,
  );
  assert.match(renderer, /button\.disabled = true/);
  assert.equal(
    renderer.includes(
      "Engine readiness is confirmed, but no selected-project Engine execution capability is mounted.",
    ),
    true,
  );
  assert.equal(
    renderer.includes("Select a project with an Engine-run readiness preview."),
    true,
  );
  assert.equal(
    renderer.includes(
      "Engine actions are blocked because the selected-project readiness preview failed closed.",
    ),
    true,
  );
  assert.equal(
    renderer.includes(
      "This lane does not execute Engine, generate RunTable output, or persist a selected result.",
    ),
    true,
  );
  assert.match(
    renderer,
    /projectBrowserSelectedProjectEngineActionLane\.append\(status, button, note\)/,
  );
  assert.doesNotMatch(
    renderer,
    /addEventListener|onclick|onClick|href|preparedAction|actionGetter|callback|\bget[A-Z]/,
  );
  assert.doesNotMatch(
    renderer,
    /\b(?:execute|invoke|runEngine|materiali[sz]e|persist)\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket|webhook|services?\.|mcp/i,
  );
  assert.doesNotMatch(
    renderer,
    /enginePayload|selectorPayload|runRows|sourceRows|electricalValues|placementCoordinates|projectEnvelope|fingerprint|filename|base64|blob|url/i,
  );
});

test("contract lock adds no capability, export workflow, route, persistence, RuntimeData, or filesystem widening", async () => {
  const [actionLaneSource, workflowSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
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

  assert.match(actionLaneSource, /from "\.\/projectBrowserSelectedProjectEngineRunPreview\.js"/);
  assert.equal((actionLaneSource.match(/^import\s/gm) || []).length, 1);
  assert.equal(actionLaneSource.includes("packages/workspace-kernel"), false);
  assert.equal(actionLaneSource.includes("engineRunTableSelectedProjectReadonlyInvokeCapability"), false);
  assert.equal(actionLaneSource.includes("projectBrowserService"), false);
  assert.equal(actionLaneSource.includes("services.js"), false);
  assert.equal(actionLaneSource.includes("RuntimeData"), false);
  assert.doesNotMatch(
    actionLaneSource,
    /\b(?:preparedAction|getAction|executionCallback|clickHandler|actionGetter)\s*[:=(]/,
  );
  assert.doesNotMatch(
    actionLaneSource,
    /\bfetch\s*\(|XMLHttpRequest|WebSocket|webhook|controlstack_mcp|writeFile|appendFile|mkdir|unlink|createWriteStream/,
  );
  assert.doesNotMatch(
    actionLaneSource,
    /\b(?:enginePayload|selectorPayload|candidateInput|runRows|sourceRows|boards|drivers|segments|zones|reservations|placements|electricalValues|selectedResultBody|projectEnvelope|downstreamContext|governanceLog|mutationLog)\s*:/,
  );

  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        projects: [{
          projectId: PROJECT_ID,
          envelopeId: ENVELOPE_ID,
          title: "Engine action lane contract project",
        }],
        selectedProjectEngineRunReadinessReadbackSummary: readySourceSummary(),
      },
    },
    services: {},
  });

  assert.equal(workflow.exportItemCount, 1);
  assert.deepEqual(workflow.outputs.map((output) => output.exportId), ["project-ies"]);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "engine-run"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "run-engine"), null);
  assert.equal(Object.hasOwn(workflow, "engineActionLane"), false);
  assert.equal(workflowSource.includes("projectBrowserSelectedProjectEngineActionLane"), false);
  assert.equal(workflowSource.includes("Run Engine"), false);
});
