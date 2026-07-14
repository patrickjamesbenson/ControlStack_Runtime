import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js";
import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";
import {
  createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_MOUNT_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js";
import {
  getProjectBrowserSelectedProjectEngineRunActionInternalCandidate,
} from "../packages/workspace-kernel/projectBrowserSelectedProjectEngineRunActionSourceBoundary.js";
import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES,
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

const CONTRACT_LOCK_ID =
  "SELECTED-PROJECT-ENGINE-RUN-FIRST-MOUNTED-CROSS-LAYER-CONTRACT-LOCK-1";
const PROJECT_ID = "first-mounted-cross-layer-project";
const ENVELOPE_ID = "env-first-mounted-cross-layer-project";
const FIXTURE_SUFFIX = "first-mounted-cross-layer";

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

function readySelectedResultSummary() {
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
    policyFingerprint: `safe-policy:${FIXTURE_SUFFIX}`,
    sourceFingerprint: `safe-source:${FIXTURE_SUFFIX}`,
    sourceInputFingerprint: `safe-source-input:${FIXTURE_SUFFIX}`,
    sourceVersionFingerprint: `safe-source-version:${FIXTURE_SUFFIX}`,
    acceptedSelectedResultAuthorityGateFingerprint:
      `safe-accepted-selected-result-authority-gate:${FIXTURE_SUFFIX}`,
    selectedResultPersistenceAuthorityPreflightFingerprint:
      `safe-selected-result-persistence-authority-preflight:${FIXTURE_SUFFIX}`,
    selectedResultPersistenceBoundaryContractFingerprint:
      `safe-selected-result-persistence-boundary-contract:${FIXTURE_SUFFIX}`,
    selectedResultOutputReadinessPreflightFingerprint:
      `safe-selected-result-output-readiness-preflight:${FIXTURE_SUFFIX}`,
    selectedResultAuthorityGuardFingerprint:
      `safe-selected-result-authority-guard:${FIXTURE_SUFFIX}`,
    selectedResultProjectionFingerprint:
      `safe-selected-result-projection:${FIXTURE_SUFFIX}`,
    safeSelectedResultSourceObjectFingerprint:
      `safe-selected-result-source-object:${FIXTURE_SUFFIX}`,
    selectedResultHandoffScaffoldFingerprint:
      `safe-selected-result-handoff-scaffold:${FIXTURE_SUFFIX}`,
    ...Object.fromEntries(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function readyRunTableFirstNarrowOutputSummary(selectedResultSummary) {
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
    policyFingerprint: `safe-policy:${FIXTURE_SUFFIX}`,
    sourceFingerprint: `safe-source:${FIXTURE_SUFFIX}`,
    sourceInputFingerprint: `safe-source-input:${FIXTURE_SUFFIX}`,
    sourceVersionFingerprint: `safe-source-version:${FIXTURE_SUFFIX}`,
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResultSummary,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      `safe-selected-result-persisted-summary-slot-contract:${FIXTURE_SUFFIX}`,
    runTableFirstNarrowOutputHandoffContractFingerprint:
      `safe-runtable-first-narrow-output-handoff-contract:${FIXTURE_SUFFIX}`,
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function stage3Inputs() {
  return {
    factoryApprovedInputsSummary: {
      readOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      factoryApprovedInputsReady: true,
      stage3Mode: "simple-run-stage3a-zero-accessory",
      blocker: null,
      committedRunIntakeSummary: {
        ready: true,
        committedRunIntakeReady: true,
        sourceAuthority: "committed selector state only",
        runQuantity: 2,
        runLengthMm: 3500,
        lengthMode: "cut_to_length",
      },
      engineExecuted: false,
      donorEngineInvoked: false,
      runTableGenerated: false,
      iesGenerated: false,
      selectedResultPersisted: false,
      runtimeDataMutated: false,
      rawRowsExposed: false,
      rawEnginePayloadExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    committedSelectorConstraints: [
      {
        fieldKey: "tier",
        value: "Business",
        valueLabel: "Business",
        committedSelectorState: true,
        authoritySource: "acceptedDefaults",
      },
      {
        fieldKey: "directOpticVar1",
        value: "80|Inlay",
        valueLabel: "Inlay",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "targetLmPerM",
        value: "1200",
        valueLabel: "1200",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "cctCri",
        value: "4000K / CRI90",
        valueLabel: "4000K / CRI90",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "controlType",
        value: "DALI-2",
        valueLabel: "DALI-2",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
    ],
    lmTemperatureReadinessPreview: {
      previewOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      targetIntent: {
        direct: { ready: true, valueLabel: "1200", intentOnly: true },
      },
      cctCriPairing: {
        direct: { ready: true, valueLabel: "4000K / CRI90", boardBacked: true },
      },
      controlIntent: {
        direct: { ready: true, valueLabel: "DALI-2", sourceBacked: true },
      },
      fingerprint: `safe-selector-lm-temp-readiness-preview:${FIXTURE_SUFFIX}`,
      donorEngineInvoked: false,
      rawRowsReturned: false,
      rawEnginePayloadReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
  };
}

function selectedEnvelope() {
  const selectedResultSummary = readySelectedResultSummary();
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
        owner: "cs_selector",
        moduleId: "cs_selector",
        state: { engineRunActionSource: stage3Inputs() },
        downstreamContext: {
          selectedResultSummary,
          runTableFirstNarrowOutputSummary:
            readyRunTableFirstNarrowOutputSummary(selectedResultSummary),
        },
      },
    },
  };
}

function assertNoPrivateInvokeProjection(value, label, { allowInternalFingerprints = false } = {}) {
  const serialised = JSON.stringify(value);
  for (const token of [
    "\"host_local_readonly_engine_candidate\":",
    "\"selector_stage3_supported_subset\":",
    "\"selectorPayload\":",
    "\"candidatePayload\":",
    "\"rawEnginePayload\":",
    "\"rawEngineResult\":",
    "\"projectEnvelope\":",
    "\"run_length_mm\":",
    "\"target_lm_per_m\":",
    "\"candidateFingerprint\":",
    "\"sourceBoundaryFingerprint\":",
    "C:\\ControlStack_RuntimeData",
    "IESNA:LM-63",
    "TILT=",
  ]) {
    if (allowInternalFingerprints
      && ["\"candidateFingerprint\":", "\"sourceBoundaryFingerprint\":"].includes(token)) {
      continue;
    }
    assert.equal(serialised.includes(token), false, `${label}:${token}`);
  }
}

function assertScalarMountStatus(status) {
  assert.equal(Object.isFrozen(status), true);
  assert.deepEqual(
    Object.keys(status),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_FIELD_ORDER,
  );
  for (const [key, value] of Object.entries(status)) {
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      key,
    );
  }
  assert.equal(status.mounted, true);
  assert.equal(status.readOnly, true);
  assert.equal(status.selectedProjectOnly, true);
  assert.equal(status.scalarSafe, true);
  assert.equal(status.redactedOutcomeOnly, true);
  assert.equal(status.engineActionAvailable, false);
  assert.equal(status.engineActionEnabled, false);
  assert.equal(status.userGestureListenerAdded, false);
  assert.equal(status.preparedActionRetained, false);
  assert.equal(status.candidatePayloadReturned, false);
  assert.equal(status.rawEnginePayloadReturned, false);
  assert.equal(status.rawEngineResultReturned, false);
  assert.equal(status.projectEnvelopeReturned, false);
  assert.equal(status.runRowsReturned, false);
  assert.equal(status.exactElectricalValuesReturned, false);
  assert.equal(status.fingerprintsReturned, false);
  assert.equal(status.runtimeDataMutated, false);
  assert.equal(status.fetchUsed, false);
  assert.equal(status.routesAdded, false);
  assert.equal(status.postEndpointsAdded, false);
  assertNoPrivateInvokeProjection(status, "mount-status");
}

test("first mounted cross-layer lock composes readiness, private source retention, readonly mount, and dormant host transport without a browser POST or second invocation path", async () => {
  assert.equal(
    CONTRACT_LOCK_ID,
    "SELECTED-PROJECT-ENGINE-RUN-FIRST-MOUNTED-CROSS-LAYER-CONTRACT-LOCK-1",
  );

  const envelope = selectedEnvelope();
  const readinessSummary =
    buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
      envelope,
      ENVELOPE_ID,
    );
  const preview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readinessSummary,
    ENVELOPE_ID,
  );
  const actionLane = buildShellProjectBrowserSelectedProjectEngineActionLane(preview);

  assert.equal(
    readinessSummary.state,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.ready,
  );
  assert.equal(readinessSummary.ready, true);
  assert.equal(readinessSummary.engineExecutionEnabled, false);
  assert.equal(readinessSummary.engineExecutionAttempted, false);
  assert.equal(readinessSummary.runTableGenerated, false);
  assert.equal(readinessSummary.outputGenerated, false);
  assert.equal(readinessSummary.runtimeDataMutated, false);
  assert.equal(preview.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready);
  assert.equal(preview.nonInteractive, true);
  assert.equal(preview.engineActionAvailable, false);
  assert.equal(preview.engineActionEnabled, false);
  assert.equal(preview.fingerprintsExposed, false);
  assert.equal(actionLane.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.blockedFailClosed);
  assert.equal(actionLane.ready, false);
  assert.equal(actionLane.engineCapabilityMounted, false);
  assert.equal(actionLane.preparedActionRetainedPrivately, false);
  assert.equal(actionLane.engineActionAvailable, false);
  assert.equal(actionLane.engineActionEnabled, false);
  assert.equal(actionLane.actions.length, 1);
  assert.equal(actionLane.actions[0].actionId, "run-engine");
  assert.equal(actionLane.actions[0].available, false);
  assert.equal(actionLane.actions[0].enabled, false);
  assert.equal(actionLane.actions[0].preparedActionRetainedPrivately, false);
  assertNoPrivateInvokeProjection(preview, "preview");
  assertNoPrivateInvokeProjection(actionLane, "action-lane");

  let hostEnvelopeReads = 0;
  let hostSeamCalls = 0;
  const hostTransport =
    createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount({
      savedProjects: {
        getProjectEnvelope() {
          hostEnvelopeReads += 1;
          return envelope;
        },
      },
      invokeHostLocalReadonlySeam() {
        hostSeamCalls += 1;
        return {};
      },
    });
  assert.equal(
    hostTransport.contractId,
    RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_MOUNT_ID,
  );
  assert.equal(hostTransport.path, RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH);
  assert.equal(hostTransport.method, RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD);
  assert.equal(hostTransport.serverSide, true);
  assert.equal(hostTransport.shellMounted, false);
  assert.equal(hostTransport.routesAdded, true);
  assert.equal(hostTransport.postEndpointsAdded, true);
  assert.equal(hostEnvelopeReads, 0);
  assert.equal(hostSeamCalls, 0);

  const controller = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount();
  let shellEnvelopeReads = 0;
  let shellInvokeCalls = 0;
  let receivedBoundary = null;
  const invokeReadonly = controller.invokeSelectedProjectReadonlyEngine;
  const services = {
    savedProjects: {
      getProjectEnvelope(selectedProjectId) {
        shellEnvelopeReads += 1;
        assert.equal(selectedProjectId, ENVELOPE_ID);
        return structuredClone(envelope);
      },
    },
    async invokeSelectedProjectReadonlyEngine(...args) {
      shellInvokeCalls += 1;
      assert.equal(args.length, 1);
      receivedBoundary = args[0];
      return invokeReadonly(args[0]);
    },
  };
  const context = {
    projectBrowser: {
      selectedProjectId: ENVELOPE_ID,
      selectedProjectEngineRunReadinessReadbackSummary: readinessSummary,
    },
  };

  const originalFetch = globalThis.fetch;
  let browserFetchCalls = 0;
  globalThis.fetch = async () => {
    browserFetchCalls += 1;
    throw new Error("browser POST must remain unreachable during mount or rerender");
  };

  let first;
  let second;
  try {
    first = await controller.mount({ context, services });
    for (let index = 0; index < 4; index += 1) {
      const rerenderPreview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
        readinessSummary,
        ENVELOPE_ID,
      );
      const rerenderLane = buildShellProjectBrowserSelectedProjectEngineActionLane(
        rerenderPreview,
      );
      assert.equal(rerenderLane.actions[0].enabled, false);
      assert.equal(rerenderLane.preparedActionRetainedPrivately, false);
    }
    second = await controller.mount({ context, services });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(first, second);
  assert.equal(controller.getSnapshot(), first);
  assertScalarMountStatus(first);
  assert.equal(
    first.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.unavailable,
  );
  assert.equal(first.readiness, "unavailable");
  assert.equal(first.serviceMounted, true);
  assert.equal(first.sourceBoundaryResolved, true);
  assert.equal(first.sourceBoundaryReady, true);
  assert.equal(first.runtimeResultReceived, true);
  assert.equal(first.adapterMounted, false);
  assert.equal(first.adapterInvoked, false);
  assert.equal(first.invocationConsumed, false);

  assert.equal(browserFetchCalls, 0);
  assert.equal(shellEnvelopeReads, 1);
  assert.equal(shellInvokeCalls, 1);
  assert.equal(hostEnvelopeReads, 0);
  assert.equal(hostSeamCalls, 0);
  assert.ok(receivedBoundary);
  assert.equal(receivedBoundary.ready, true);
  assert.equal(receivedBoundary.candidateRetainedInternally, true);
  assert.equal(receivedBoundary.candidatePayloadReturned, false);
  assert.equal(receivedBoundary.projectEnvelopeReturned, false);
  assertNoPrivateInvokeProjection(receivedBoundary, "source-boundary", {
    allowInternalFingerprints: true,
  });

  const retainedCandidate =
    getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(receivedBoundary);
  assert.ok(retainedCandidate);
  assert.equal(retainedCandidate.host_local_readonly_engine_candidate, true);
  assert.equal(retainedCandidate.selector_stage3_supported_subset, true);
  assert.equal(retainedCandidate.runs[0].run_length_mm, 3500);
  assert.equal(retainedCandidate.lighting.target_lm_per_m, "1200");
  assert.equal(
    getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(readinessSummary),
    null,
  );
  assert.equal(getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(preview), null);
  assert.equal(getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(actionLane), null);
  assert.equal(getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(first), null);
});

test("first mounted cross-layer lock keeps the fixed POST server-only and the Run Engine button disabled, listener-free, callback-free, and disconnected from every private runtime seam", async () => {
  const [
    shellSource,
    actionLaneSource,
    mountSource,
    servicesSource,
    sourceBoundarySource,
    capabilitySource,
    transportBoundarySource,
    hostTransportSource,
    serverSource,
  ] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../packages/workspace-kernel/services.js", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../packages/workspace-kernel/projectBrowserSelectedProjectEngineRunActionSourceBoundary.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js",
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
    readFile(
      new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../server.js", import.meta.url), "utf8"),
  ]);

  assert.match(sourceBoundarySource, /const INTERNAL_ENGINE_CANDIDATES = new WeakMap\(\)/);
  assert.match(
    sourceBoundarySource,
    /INTERNAL_ENGINE_CANDIDATES\.set\(boundary, mapperResult\.candidate\)/,
  );
  assert.equal(
    (capabilitySource.match(/getProjectBrowserSelectedProjectEngineRunActionInternalCandidate\(/g)
      || []).length,
    1,
  );
  assert.match(
    transportBoundarySource,
    /resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary\(\{/,
  );
  assert.match(
    transportBoundarySource,
    /createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability\(\{/,
  );
  assert.match(
    hostTransportSource,
    /createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary\(\{/,
  );
  assert.match(hostTransportSource, /shellMounted: false/);
  assert.match(serverSource, /isLoopbackRemoteAddress\(req\)/);
  assert.match(
    serverSource,
    /createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount\(\{/,
  );
  assert.match(
    serverSource,
    /requestJson\(req, \{ maxBytes: 8192 \}\)/,
  );

  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(",
  );
  const rendererEnd = shellSource.indexOf(
    "function setProjectBrowserSelectedProjectExportsWorkflowDescriptor(workflowDescriptor)",
    rendererStart,
  );
  const renderer = shellSource.slice(rendererStart, rendererEnd);
  assert.ok(rendererStart >= 0);
  assert.ok(rendererEnd > rendererStart);
  assert.equal((renderer.match(/createElement\("button"\)/g) || []).length, 1);
  assert.match(renderer, /button\.type = "button"/);
  assert.match(renderer, /button\.disabled = actionItem\?\.enabled !== true/);
  assert.doesNotMatch(
    renderer,
    /addEventListener|onclick|onClick|dispatchEvent|\.click\s*\(|href|callback|preparedAction|executionCallback|userGestureCallback|\bfetch\s*\(|XMLHttpRequest|WebSocket|services?\.|mcp/i,
  );

  const refreshStart = shellSource.indexOf("function refreshContext(reason = \"context-refresh\")");
  const refreshEnd = shellSource.indexOf("function refreshContextSafely", refreshStart);
  const refreshSource = shellSource.slice(refreshStart, refreshEnd);
  assert.ok(refreshStart >= 0);
  assert.ok(refreshEnd > refreshStart);
  assert.equal(
    (refreshSource.match(/selectedProjectReadonlyEngineInvokeMount\.mount\(\{/g) || []).length,
    0,
  );
  assert.doesNotMatch(
    refreshSource,
    /addEventListener|onclick|onClick|preparedAction|executionCallback|userGestureCallback|\bfetch\s*\(|XMLHttpRequest|WebSocket/,
  );

  assert.match(
    mountSource,
    /runtimeResult = await services\.invokeSelectedProjectReadonlyEngine\(sourceBoundary\)/,
  );
  assert.equal(
    (mountSource.match(/services\.invokeSelectedProjectReadonlyEngine\(sourceBoundary\)/g)
      || []).length,
    1,
  );
  assert.doesNotMatch(
    mountSource,
    /preparedAction\s*[:=(]|executionCallback|clickHandler|actionGetter|userGestureCallback|\bfetch\s*\(|XMLHttpRequest|WebSocket/,
  );
  assert.match(servicesSource, /^    invokeSelectedProjectReadonlyEngine,$/m);
  assert.equal(actionLaneSource.includes("packages/workspace-kernel"), false);
  assert.doesNotMatch(
    actionLaneSource,
    /selectorPayload\s*[:=(]|candidatePayload\s*[:=(]|projectEnvelope\s*[:=(]|preparedAction\s*[:=(]|executionCallback|clickHandler|actionGetter|userGestureCallback/i,
  );

  const browserOwnedSource = [
    shellSource,
    actionLaneSource,
    mountSource,
    servicesSource,
  ].join("\n");
  assert.doesNotMatch(
    browserOwnedSource,
    /engineRunTableSelectedProjectShellInvokeHostTransportMount|engine_runtable_selected_project_readonly_host_adapter|engine_runtable_internal_readonly_invoke_probe|\/api\/workspace-shell\/selected-project-engine-readonly-invoke|\bfetch\s*\(|XMLHttpRequest|WebSocket|webhook/,
  );
  assert.doesNotMatch(
    browserOwnedSource,
    /writeFile|appendFile|mkdir|createWriteStream|saveProjectEnvelope|runtimeData\s*[.\[]|RuntimeData\s*[.\[]/,
  );

  assert.match(
    hostTransportSource,
    /"\/api\/workspace-shell\/selected-project-engine-readonly-invoke"/,
  );
  assert.match(hostTransportSource, /"POST"/);
  assert.equal(
    browserOwnedSource.includes(
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
    ),
    false,
  );
  assert.equal(
    browserOwnedSource.includes(
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_MOUNT_ID,
    ),
    false,
  );
});
