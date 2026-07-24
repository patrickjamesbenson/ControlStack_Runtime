import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";
import {
  createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID,
  RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js";
import {
  getProjectBrowserSelectedProjectEngineRunActionInternalCandidate,
  PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES,
  resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary,
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
  "SELECTED-PROJECT-ENGINE-RUN-PREMOUNT-CROSS-LAYER-CONTRACT-LOCK-1";
const PROJECT_ID = "premount-cross-layer-project";
const ENVELOPE_ID = "env-premount-cross-layer-project";
const FIXTURE_SUFFIX = "premount-cross-layer";

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
    readonlyEngineCandidateInputsReady: true,
    readonlyEngineCandidateInputsBlocker: null,
    stage2Ready: true,
    readonlyEngineCandidateApplicability: {
      directSupported: true,
      indirectRequired: false,
      directOnly: true,
      supportedSlice: "first-readonly-engine-direct-only",
    },
      stage3Mode: "simple-run-stage3a-zero-accessory",
      blocker: null,
      committedRunIntakeSummary: {
        ready: true,
        committedRunIntakeReady: true,
        sourceAuthority: "committed selector state only",
        runQuantity: 2,
        runLengthMm: 3500,
        
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
        fieldKey: "ambient",
        value: "25C",
        valueLabel: "25°C",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
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
      ambientIntent: {
        ready: true,
        valueLabel: "25°C",
        sourceBacked: true,
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
        state: {
          engineRunActionSource: stage3Inputs(),
        },
        downstreamContext: {
          selectedResultSummary,
          runTableFirstNarrowOutputSummary:
            readyRunTableFirstNarrowOutputSummary(selectedResultSummary),
        },
      },
    },
  };
}

function safeSeamResult() {
  return {
    ok: true,
    seam: "engine-runtable-internal-readonly-invoke",
    seam_version: "engine_runtable_internal_readonly_invoke.v1",
    internal_mcp_diagnostic_only: true,
    server_side_only: true,
    public_route_added: false,
    post_endpoint_added: false,
    caller_supplied_file_path_allowed: false,
    caller_supplied_db_allowed: false,
    active_source_db_loaded_read_only: true,
    active_source_db_passed_in_memory_only: true,
    donor_bridge_used: false,
    donor_bridge_audit_jsonl_write_enabled: false,
    audit_jsonl_write_attempted: false,
    write_attempted: false,
    runtime_data_mutation_enabled: false,
    donor_data_mutation_enabled: false,
    selected_result_persistence_enabled: false,
    engine_execution_attempted: true,
    engine_result_produced: true,
    selected_result_created: false,
    synthetic_success_fixture_created: false,
    product_data_invented: false,
    raw_rows_exposed: false,
    raw_headers_exposed: false,
    raw_users_exposed: false,
    raw_snapshot_returned: false,
    raw_snapshot_serialized: false,
    raw_engine_payload_exposed: false,
    raw_engine_debug_payload_exposed: false,
    raw_rough_electrical_payload_exposed: false,
    raw_ies_exposed: false,
    raw_candela_exposed: false,
    raw_lab_evidence_exposed: false,
    raw_pdfs_exposed: false,
    base64_artifacts_exposed: false,
    credentials_exposed: false,
    provider_ids_exposed: false,
    private_paths_exposed: false,
    source_path_returned: false,
    safe_engine_summary: {
      success: true,
      run_count: 1,
      error_count: 0,
      warning_count: 0,
      selected_tier: "Business",
      output_contract_ready: false,
      runs: [{
        index: 0,
        has_body_requested: true,
        boards_count: 3,
        segments_count: 1,
        zone_count: 2,
        clip_points_count: 4,
        suspension_points_count: 2,
        gear_tray_plan_count: 1,
        reserved_ranges_count: 0,
        raw_run_returned: false,
      }],
      raw_result_returned: false,
      raw_debug_returned: false,
      raw_rough_electrical_payload_returned: false,
    },
    blockers: [],
    warnings: [],
  };
}

function realAdapter(invoke) {
  return {
    contractId: RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
    seam: "engine-runtable-internal-readonly-invoke",
    seamVersion: "engine_runtable_internal_readonly_invoke.v1",
    hostLocal: true,
    readOnly: true,
    realHostLocalSeam: true,
    fixtureAdapter: false,
    invoke,
  };
}

function assertNoPrivateCandidateProjection(value, label) {
  const serialised = JSON.stringify(value);
  for (const token of [
    "\"host_local_readonly_engine_candidate\":",
    "\"selector_stage3_supported_subset\":",
    "\"run_length_mm\":",
    "\"target_lm_per_m\":",
    "\"factoryApprovedInputsSummary\":",
    "\"committedSelectorConstraints\":",
    "\"lmTemperatureReadinessPreview\":",
    "\"selectorPayload\":",
    "\"candidatePayload\":",
    "\"projectEnvelope\":",
    "C:\\ControlStack_RuntimeData",
    "IESNA:LM-63",
    "TILT=",
  ]) {
    assert.equal(serialised.includes(token), false, `${label}:${token}`);
  }
}

async function buildCrossLayerChain() {
  const envelope = selectedEnvelope();
  const readinessSummary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope,
    ENVELOPE_ID,
  );
  const preview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readinessSummary,
    ENVELOPE_ID,
  );
  const actionLane = buildShellProjectBrowserSelectedProjectEngineActionLane(preview);
  let envelopeReads = 0;
  const sourceBoundary =
    await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
      context: {
        projectBrowser: {
          selectedProjectId: ENVELOPE_ID,
          selectedProjectEngineRunReadinessReadbackSummary: readinessSummary,
        },
      },
      services: {
        savedProjects: {
          getProjectEnvelope(selectedProjectId) {
            envelopeReads += 1;
            assert.equal(selectedProjectId, ENVELOPE_ID);
            return structuredClone(envelope);
          },
        },
      },
    });
  return {
    envelope,
    readinessSummary,
    preview,
    actionLane,
    sourceBoundary,
    envelopeReads,
  };
}

test("premount contract lock composes readiness, source reconstruction, private retention, and readonly outcome without shell consumption", async () => {
  assert.equal(
    CONTRACT_LOCK_ID,
    "SELECTED-PROJECT-ENGINE-RUN-PREMOUNT-CROSS-LAYER-CONTRACT-LOCK-1",
  );

  const chain = await buildCrossLayerChain();
  const {
    readinessSummary,
    preview,
    actionLane,
    sourceBoundary,
  } = chain;

  assert.equal(chain.envelopeReads, 1);
  assert.equal(Object.isFrozen(readinessSummary), true);
  assert.equal(
    readinessSummary.state,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.ready,
  );
  assert.equal(readinessSummary.ready, true);
  assert.equal(readinessSummary.engineRunReadinessReadbackReady, true);
  assert.equal(readinessSummary.engineExecutionEnabled, false);
  assert.equal(readinessSummary.engineExecutionAttempted, false);
  assert.equal(readinessSummary.runTableGenerated, false);
  assert.equal(readinessSummary.outputGenerated, false);
  assert.equal(readinessSummary.runtimeDataMutated, false);

  assert.equal(preview.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready);
  assert.equal(preview.ready, true);
  assert.equal(preview.nonInteractive, true);
  assert.equal(preview.engineActionAvailable, false);
  assert.equal(preview.engineActionEnabled, false);
  assert.equal(preview.engineExecutionRequested, false);
  assert.equal(preview.engineExecutionAttempted, false);

  assert.equal(
    actionLane.contractId,
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
  );
  assert.equal(
    actionLane.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.blockedFailClosed,
  );
  assert.equal(actionLane.blocker, "selected-project-engine-action-capability-not-mounted");
  assert.equal(actionLane.ready, false);
  assert.equal(actionLane.failClosed, true);
  assert.equal(actionLane.engineCapabilityMounted, false);
  assert.equal(actionLane.preparedActionRetainedPrivately, false);
  assert.equal(actionLane.engineActionAvailable, false);
  assert.equal(actionLane.engineActionEnabled, false);
  assert.equal(actionLane.engineExecutionRequested, false);
  assert.equal(actionLane.engineExecutionAttempted, false);
  assert.equal(actionLane.actions.length, 1);
  assert.equal(actionLane.actions[0].actionId, "run-engine");
  assert.equal(actionLane.actions[0].enabled, false);
  assert.equal(actionLane.actions[0].available, false);
  assert.equal(actionLane.actions[0].preparedActionRetainedPrivately, false);

  assert.equal(
    sourceBoundary.contractId,
    PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
  );
  assert.equal(
    sourceBoundary.state,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready,
  );
  assert.equal(sourceBoundary.ready, true);
  assert.equal(sourceBoundary.selectedEnvelopeReadCount, 1);
  assert.equal(sourceBoundary.candidateRetainedInternally, true);
  assert.equal(sourceBoundary.candidatePayloadReturned, false);
  assert.equal(sourceBoundary.projectEnvelopeReturned, false);
  assert.equal(sourceBoundary.engineInvocationEnabled, false);
  assert.equal(sourceBoundary.engineExecutionAttempted, false);

  const retainedCandidate =
    getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(sourceBoundary);
  assert.ok(retainedCandidate);
  assert.equal(retainedCandidate.host_local_readonly_engine_candidate, true);
  assert.equal(retainedCandidate.selector_stage3_supported_subset, true);
  assert.equal(retainedCandidate.tier, "Business");
  assert.equal(retainedCandidate.runs[0].qty, 2);
  assert.equal(retainedCandidate.runs[0].run_length_mm, 3500);
  assert.equal(retainedCandidate.lighting.target_lm_per_m, "1200");
  assert.equal(
    getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(readinessSummary),
    null,
  );
  assert.equal(getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(preview), null);
  assert.equal(getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(actionLane), null);

  for (const [label, surface] of [
    ["readiness", readinessSummary],
    ["preview", preview],
    ["action-lane", actionLane],
    ["source-boundary", sourceBoundary],
  ]) {
    assertNoPrivateCandidateProjection(surface, label);
  }

  let adapterCalls = 0;
  let receivedRequest = null;
  const capability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async (request) => {
      adapterCalls += 1;
      receivedRequest = request;
      return safeSeamResult();
    }),
  });

  for (const shellSurface of [readinessSummary, preview, actionLane]) {
    const blocked = await capability(shellSurface);
    assert.equal(
      blocked.outcomeDescriptor.blocker,
      "selected-project-readonly-invoke-source-boundary-invalid",
    );
    assert.equal(blocked.outcomeDescriptor.adapterInvoked, false);
    assert.equal(blocked.outcomeDescriptor.invocationConsumed, false);
    assert.equal(blocked.outcomeDescriptor.privateCandidateConsumed, false);
  }
  assert.equal(adapterCalls, 0);

  const result = await capability(sourceBoundary);

  assert.equal(adapterCalls, 1);
  assert.ok(receivedRequest);
  assert.equal(Object.isFrozen(receivedRequest), true);
  assert.equal(Object.isFrozen(receivedRequest.selectorPayload), true);
  assert.notEqual(receivedRequest.selectorPayload, retainedCandidate);
  assert.deepEqual(receivedRequest.selectorPayload, retainedCandidate);
  assert.equal(receivedRequest.execute, true);
  assert.equal(receivedRequest.candidatePayloadReturned, false);
  assert.equal(receivedRequest.callerSuppliedDbAllowed, false);

  assert.equal(Object.isFrozen(result), true);
  assert.deepEqual(
    Object.keys(result),
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER,
  );
  assert.equal(
    result.outcomeDescriptor.contractId,
    RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID,
  );
  assert.equal(
    result.outcomeDescriptor.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed,
  );
  assert.equal(result.outcomeDescriptor.ok, true);
  assert.equal(result.outcomeDescriptor.failClosed, false);
  assert.equal(result.outcomeDescriptor.adapterMounted, true);
  assert.equal(result.outcomeDescriptor.adapterInvoked, true);
  assert.equal(result.outcomeDescriptor.invocationConsumed, true);
  assert.equal(result.outcomeDescriptor.privateCandidateConsumed, true);
  assert.equal(result.outcomeDescriptor.candidatePayloadReturned, false);
  assert.equal(result.outcomeDescriptor.rawEnginePayloadReturned, false);
  assert.equal(result.outcomeDescriptor.rawEngineResultReturned, false);
  assert.equal(result.outcomeDescriptor.selectedResultPersisted, false);
  assert.equal(result.outcomeDescriptor.runTableWritten, false);
  assert.equal(result.outcomeDescriptor.runTableGenerated, false);
  assert.equal(result.outcomeDescriptor.outputGenerated, false);
  assert.equal(result.outcomeDescriptor.iesGenerated, false);
  assert.equal(result.outcomeDescriptor.runtimeDataMutated, false);
  assert.equal(result.outcomeDescriptor.filesystemWriteAttempted, false);
  assert.equal(result.outcomeDescriptor.routesAdded, false);
  assert.equal(result.outcomeDescriptor.postEndpointsAdded, false);
  assert.equal(
    getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(result),
    null,
  );
  assert.equal(
    getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(sourceBoundary),
    retainedCandidate,
  );
  assertNoPrivateCandidateProjection(result, "readonly-outcome");

  assert.equal(actionLane.engineCapabilityMounted, false);
  assert.equal(actionLane.actions[0].enabled, false);
  assert.equal(actionLane.engineExecutionAttempted, false);
});

test("premount contract lock keeps all runtime invoke ownership out of shell wiring and leaves one permanently disabled button with no listener", async () => {
  const [
    shellSource,
    actionLaneSource,
    workflowSource,
    servicesSource,
    serverSource,
    sourceBoundarySource,
    capabilitySource,
    transportSource,
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
        "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../packages/workspace-kernel/services.js", import.meta.url), "utf8"),
    readFile(new URL("../server.js", import.meta.url), "utf8"),
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
  ]);

  assert.match(sourceBoundarySource, /const INTERNAL_ENGINE_CANDIDATES = new WeakMap\(\)/);
  assert.match(
    sourceBoundarySource,
    /INTERNAL_ENGINE_CANDIDATES\.set\(boundary, mapperResult\.candidate\)/,
  );
  assert.match(
    capabilitySource,
    /getProjectBrowserSelectedProjectEngineRunActionInternalCandidate\(sourceBoundary\)/,
  );
  assert.equal(
    (capabilitySource.match(/getProjectBrowserSelectedProjectEngineRunActionInternalCandidate\(/g)
      || []).length,
    1,
  );
  assert.match(
    transportSource,
    /createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability\(/,
  );
  assert.match(
    transportSource,
    /resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary\(/,
  );

  const shellOwnedSources = [
    shellSource,
    actionLaneSource,
    workflowSource,
    servicesSource,
  ].join("\n");
  assert.doesNotMatch(
    shellOwnedSources,
    /engineRunTableSelectedProjectReadonlyInvokeCapability|engineRunTableSelectedProjectShellInvokeTransportBoundary|getProjectBrowserSelectedProjectEngineRunActionInternalCandidate|resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary|engine-runtable-internal-readonly-invoke/,
  );
  assert.match(
    serverSource,
    /engineRunTableSelectedProjectShellInvokeHostTransportMount/,
  );
  assert.doesNotMatch(serverSource, /engine_runtable_internal_readonly_invoke_probe/);
  assert.equal(actionLaneSource.includes("packages/workspace-kernel"), false);
  assert.doesNotMatch(
    actionLaneSource,
    /candidate|selectorPayload|preparedAction\s*[:=(]|executionCallback|clickHandler|actionGetter/i,
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
  assert.match(renderer, /button\.type = "button"/);
  assert.match(renderer, /button\.disabled = true/);
  assert.doesNotMatch(renderer, /addEventListener|onclick|onClick|dispatchEvent|\.click\s*\(/);
  assert.doesNotMatch(
    renderer,
    /\b(?:execute|invoke|runEngine|materiali[sz]e|persist)\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket|webhook|services?\.|mcp/i,
  );

  for (const source of [sourceBoundarySource, capabilitySource, transportSource]) {
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|indexedDB|writeFile|appendFile|mkdir|createWriteStream|unlink|\bfetch\s*\(|XMLHttpRequest|WebSocket/,
    );
    assert.doesNotMatch(
      source,
      /saveCurrentProjectEnvelope|saveProjectEnvelope|restoreProjectEnvelope|runtimeData\s*[.\[]|RuntimeData\s*[.\[]/,
    );
  }
});