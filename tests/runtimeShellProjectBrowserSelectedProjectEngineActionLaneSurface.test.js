import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
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
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";
import {
  getShellProjectBrowserSelectedProjectExportAction,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const SOURCE_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-engine-run-readiness-readback-summary.v1";
const PROJECT_ID = "engine-action-lane-project";
const ENVELOPE_ID = "env-engine-action-lane-project";

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
    policyFingerprint: "safe-policy:engine-action-lane",
    sourceFingerprint: "safe-source:engine-action-lane",
    projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint:
      "safe-project-browser-selected-project-engine-run-readiness-readback-summary:engine-action-lane",
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

function assertScalarSafeActionLane(actionLane) {
  assert.equal(Object.isFrozen(actionLane), true);
  assert.deepEqual(Object.keys(actionLane), EXPECTED_ACTION_LANE_FIELD_ORDER);
  assert.equal(Object.isFrozen(actionLane.actions), true);
  assert.equal(actionLane.actions.length, 1);
  const actionItem = actionLane.actions[0];
  assert.equal(Object.isFrozen(actionItem), true);
  assert.deepEqual(Object.keys(actionItem), EXPECTED_ACTION_ITEM_FIELD_ORDER);
  for (const [key, value] of Object.entries(actionLane)) {
    if (key === "actions") continue;
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      key,
    );
  }
  for (const [key, value] of Object.entries(actionItem)) {
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      key,
    );
  }
  assert.equal(actionLane.selectedProjectOnly, true);
  assert.equal(actionLane.readOnly, true);
  assert.equal(actionLane.redacted, true);
  assert.equal(actionLane.machineValueSafe, true);
  assert.equal(actionLane.userGestureRequired, true);
  assert.equal(actionLane.nonExecuting, true);
  for (const key of REQUIRED_FALSE_ACTION_LANE_FLAGS) assert.equal(actionLane[key], false, key);
}

function assertNoSensitiveProjection(value) {
  const serialised = JSON.stringify(value);
  for (const token of [
    "engine-payload-secret",
    "selector-payload-secret",
    "run-row-secret",
    "electrical-secret",
    "board-secret",
    "driver-secret",
    "segment-secret",
    "zone-secret",
    "reservation-secret",
    "placement-secret",
    "selected-result-secret",
    "project-envelope-secret",
    "fingerprint-secret",
    "mutation-secret",
    "C:\\ControlStack_RuntimeData",
    "candidate-output.ies",
    "blob:engine-action-lane-secret",
    "data:application/octet-stream;base64",
  ]) {
    assert.equal(serialised.includes(token), false, token);
  }
}

test("action-lane and action-item contracts are exact frozen scalar-safe projections", () => {
  const actionLane = buildShellProjectBrowserSelectedProjectEngineActionLane(readyPreview());

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
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER,
    EXPECTED_ACTION_LANE_FIELD_ORDER,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER,
    EXPECTED_ACTION_ITEM_FIELD_ORDER,
  );
  assertScalarSafeActionLane(actionLane);
  assertNoSensitiveProjection(actionLane);
});

test("ready preview produces one visible but unavailable run-engine action", () => {
  const preview = readyPreview();
  const actionLane = buildShellProjectBrowserSelectedProjectEngineActionLane(preview);
  const [actionItem] = actionLane.actions;

  assert.equal(actionLane.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.blockedFailClosed);
  assert.equal(actionLane.readiness, "blocked_fail_closed");
  assert.equal(actionLane.ready, false);
  assert.equal(actionLane.failClosed, true);
  assert.equal(actionLane.blocker, "selected-project-engine-action-capability-not-mounted");
  assert.equal(actionLane.selectedProjectId, ENVELOPE_ID);
  assert.equal(actionLane.selectedProjectFound, true);
  assert.equal(actionLane.sourcePreviewPresent, true);
  assert.equal(actionLane.sourcePreviewState, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready);
  assert.equal(actionLane.sourcePreviewReadiness, "ready");
  assert.equal(actionLane.sourcePreviewReady, true);
  assert.equal(actionLane.engineRunReadinessBoundaryReady, true);
  assert.equal(actionLane.selectedResultAccepted, true);
  assert.equal(actionLane.engineVerified, true);
  assert.equal(actionLane.runCount, 4);
  assert.equal(actionLane.actionItemCount, 1);
  assert.equal(actionLane.enabledActionItemCount, 0);
  assert.deepEqual(actionItem, {
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
    schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION,
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
  });
  assertScalarSafeActionLane(actionLane);
});

test("missing cross-project malformed and blocked previews remain fail-closed without accepted or verified counts", () => {
  const missingPreview = buildShellProjectBrowserSelectedProjectEngineRunPreview(null, ENVELOPE_ID);
  const crossProjectPreview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary(),
    "env-other-engine-action-lane-project",
  );
  const blockedPreview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary({
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: "selected-project-readiness-blocked",
      engineRunReadinessReadbackReady: false,
    }),
    ENVELOPE_ID,
  );
  const malformedPreview = Object.freeze({ ...readyPreview(), schemaVersion: 2 });

  const missingLane = buildShellProjectBrowserSelectedProjectEngineActionLane(missingPreview);
  const noPreviewLane = buildShellProjectBrowserSelectedProjectEngineActionLane(null);
  const blockedLanes = [crossProjectPreview, blockedPreview, malformedPreview]
    .map((preview) => buildShellProjectBrowserSelectedProjectEngineActionLane(preview));

  for (const actionLane of [missingLane, noPreviewLane]) {
    assert.equal(actionLane.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.missing);
    assert.equal(actionLane.readiness, "missing");
    assert.equal(actionLane.ready, false);
    assert.equal(actionLane.failClosed, true);
    assert.equal(actionLane.blocker, "selected-project-engine-action-readiness-preview-missing");
    assert.equal(actionLane.sourcePreviewReady, false);
    assert.equal(actionLane.engineRunReadinessBoundaryReady, false);
    assert.equal(actionLane.selectedResultAccepted, false);
    assert.equal(actionLane.engineVerified, false);
    assert.equal(actionLane.runCount, 0);
    assertScalarSafeActionLane(actionLane);
  }

  for (const actionLane of blockedLanes) {
    assert.equal(
      actionLane.state,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.blockedFailClosed,
    );
    assert.equal(actionLane.readiness, "blocked_fail_closed");
    assert.equal(actionLane.ready, false);
    assert.equal(actionLane.failClosed, true);
    assert.equal(actionLane.blocker, "selected-project-engine-action-readiness-preview-blocked");
    assert.equal(actionLane.sourcePreviewReady, false);
    assert.equal(actionLane.engineRunReadinessBoundaryReady, false);
    assert.equal(actionLane.selectedResultAccepted, false);
    assert.equal(actionLane.engineVerified, false);
    assert.equal(actionLane.runCount, 0);
    assertScalarSafeActionLane(actionLane);
  }

  assert.equal(missingLane.sourcePreviewPresent, true);
  assert.equal(noPreviewLane.sourcePreviewPresent, false);
  assert.equal(blockedLanes[2].sourcePreviewPresent, true);
  assert.equal(blockedLanes[2].sourcePreviewState, null);
});

test("action lane consumes only the frozen shell preview descriptor", async () => {
  const actionLaneSource = await readFile(
    new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
      import.meta.url,
    ),
    "utf8",
  );
  const rawReadbackSummary = readySourceSummary();
  const rejectedRawSource = buildShellProjectBrowserSelectedProjectEngineActionLane(rawReadbackSummary);
  const acceptedPreview = buildShellProjectBrowserSelectedProjectEngineActionLane(readyPreview());

  assert.match(actionLaneSource, /from "\.\/projectBrowserSelectedProjectEngineRunPreview\.js"/);
  assert.equal(actionLaneSource.includes("packages/workspace-kernel"), false);
  assert.equal(actionLaneSource.includes("projectBrowserService"), false);
  assert.equal(actionLaneSource.includes("services.js"), false);
  assert.equal(actionLaneSource.includes("savedProject"), false);
  assert.equal(actionLaneSource.includes("RuntimeData"), false);
  assert.equal(actionLaneSource.includes("controlstack_mcp"), false);
  assert.equal(rejectedRawSource.sourcePreviewReady, false);
  assert.equal(rejectedRawSource.selectedResultAccepted, false);
  assert.equal(rejectedRawSource.engineVerified, false);
  assert.equal(rejectedRawSource.runCount, 0);
  assert.equal(acceptedPreview.sourcePreviewReady, true);
});

test("shell mounts a separate Engine actions section after the locked preview with one disabled button", async () => {
  const [shellSource, styleSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/styles.css", import.meta.url), "utf8"),
  ]);

  const previewSectionIndex = shellSource.indexOf(
    "const engineRunPreviewSection = document.createElement(\"section\")",
  );
  const actionSectionIndex = shellSource.indexOf(
    "const engineActionLaneSection = document.createElement(\"section\")",
  );
  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(actionLane)",
  );
  const rendererEnd = shellSource.indexOf(
    "function setProjectBrowserSelectedProjectExportsWorkflowDescriptor(workflowDescriptor)",
    rendererStart,
  );
  const rendererSource = shellSource.slice(rendererStart, rendererEnd);

  assert.ok(previewSectionIndex >= 0);
  assert.ok(actionSectionIndex > previewSectionIndex);
  assert.equal(shellSource.includes("projectBrowserSelectedProjectEngineActionLane"), true);
  assert.equal(shellSource.includes("Engine actions"), true);
  assert.equal((rendererSource.match(/createElement\("button"\)/g) || []).length, 1);
  assert.match(rendererSource, /button\.textContent = actionLane\?\.actions\?\.\[0\]\?\.label \|\| "Run Engine"/);
  assert.match(rendererSource, /button\.disabled = true/);
  assert.equal(
    rendererSource.includes(
      "Engine readiness is confirmed, but no selected-project Engine execution capability is mounted.",
    ),
    true,
  );
  assert.equal(
    rendererSource.includes("Select a project with an Engine-run readiness preview."),
    true,
  );
  assert.equal(
    rendererSource.includes(
      "Engine actions are blocked because the selected-project readiness preview failed closed.",
    ),
    true,
  );
  assert.equal(
    rendererSource.includes(
      "This lane does not execute Engine, generate RunTable output, or persist a selected result.",
    ),
    true,
  );
  assert.match(styleSource, /\.cs-shell__project-browser-engine-action-lane\s*\{/);
  assert.match(styleSource, /\.cs-shell__project-browser-engine-action-lane-button:disabled\s*\{/);
});

test("action-lane renderer has no listener callback getter execution network or service invocation", async () => {
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
  const rendererSource = shellSource.slice(rendererStart, rendererEnd);

  assert.ok(rendererStart >= 0);
  assert.ok(rendererEnd > rendererStart);
  assert.doesNotMatch(
    rendererSource,
    /addEventListener|onclick|preparedAction|\bget[A-Z]|\b(?:execute|invoke)\s*\(|callback/i,
  );
  assert.doesNotMatch(rendererSource, /\bfetch\s*\(|XMLHttpRequest|WebSocket|webhook|services?\.|mcp/i);
  assert.doesNotMatch(rendererSource, /engineExecution|runTableGenerated|selectedResultCreated|persist\s*\(/i);
});

test("existing preview renderer stays text-only and selected-project wiring builds the preview once", async () => {
  const shellSource = await readFile(
    new URL("../apps/workspace-shell/src/shell.js", import.meta.url),
    "utf8",
  );
  const previewRendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineRunPreview(preview)",
  );
  const previewRendererEnd = shellSource.indexOf(
    "function renderProjectBrowser({ context })",
    previewRendererStart,
  );
  const previewRendererSource = shellSource.slice(previewRendererStart, previewRendererEnd);
  const renderProjectBrowserStart = shellSource.indexOf("function renderProjectBrowser({ context })");
  const renderProjectBrowserEnd = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(actionLane)",
    renderProjectBrowserStart,
  );
  const renderProjectBrowserSource = shellSource.slice(renderProjectBrowserStart, renderProjectBrowserEnd);

  assert.doesNotMatch(previewRendererSource, /createElement\("button"\)|createElement\("a"\)/);
  assert.doesNotMatch(previewRendererSource, /addEventListener|onclick|preparedAction/);
  assert.equal(
    (renderProjectBrowserSource.match(/buildShellProjectBrowserSelectedProjectEngineRunPreview\(/g) || []).length,
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
});

test("selected-project export workflow remains limited to project-ies", async () => {
  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        projects: [{
          projectId: PROJECT_ID,
          envelopeId: ENVELOPE_ID,
          title: "Engine action lane project",
        }],
        selectedProjectEngineRunReadinessReadbackSummary: readySourceSummary(),
      },
    },
    services: {},
  });
  const workflowSource = await readFile(
    new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.equal(workflow.exportItemCount, 1);
  assert.deepEqual(workflow.outputs.map((output) => output.exportId), ["project-ies"]);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "engine-run"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "run-engine"), null);
  assert.equal(Object.hasOwn(workflow, "engineActionLane"), false);
  assert.equal(workflowSource.includes("projectBrowserSelectedProjectEngineActionLane"), false);
  assert.equal(workflowSource.includes("Run Engine"), false);
});

test("all execution generation persistence exposure route RuntimeData and filesystem flags remain false", () => {
  for (const preview of [
    readyPreview(),
    buildShellProjectBrowserSelectedProjectEngineRunPreview(null, ENVELOPE_ID),
  ]) {
    const actionLane = buildShellProjectBrowserSelectedProjectEngineActionLane(preview);
    for (const key of REQUIRED_FALSE_ACTION_LANE_FLAGS) assert.equal(actionLane[key], false, key);
    assert.equal(actionLane.actions[0].available, false);
    assert.equal(actionLane.actions[0].enabled, false);
    assert.equal(actionLane.actions[0].preparedActionRetainedPrivately, false);
  }
});

test("source inspection rejects payload rows electrical values envelopes private artifacts and network seams", async () => {
  const [actionLaneSource, shellSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(actionLaneSource, /\b(?:enginePayload|selectorPayload|candidateInput|runRows|sourceRows|boards|drivers|segments|zones|reservations|placements|electricalValues|selectedResultBody|projectEnvelope|downstreamContext|governanceLog|mutationLog)\s*:/);
  assert.doesNotMatch(actionLaneSource, /\b(?:preparedAction|getAction|executionCallback|clickHandler|actionGetter)\s*[:=(]/);
  assert.doesNotMatch(actionLaneSource, /\bfetch\s*\(|XMLHttpRequest|WebSocket|webhook|controlstack_mcp/);
  assert.doesNotMatch(actionLaneSource, /writeFile|appendFile|mkdir|unlink|createWriteStream/);
  assert.doesNotMatch(actionLaneSource, /IESNA:LM-63|TILT=NONE|candela\s*[:=]|photometry\s*[:=]/i);

  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(actionLane)",
  );
  const rendererEnd = shellSource.indexOf(
    "function setProjectBrowserSelectedProjectExportsWorkflowDescriptor(workflowDescriptor)",
    rendererStart,
  );
  const rendererSource = shellSource.slice(rendererStart, rendererEnd);
  assert.doesNotMatch(rendererSource, /path|filename|fileName|url|blob|base64|IES|candela|photometry/i);
  assertNoSensitiveProjection(buildShellProjectBrowserSelectedProjectEngineActionLane(readyPreview()));
});
