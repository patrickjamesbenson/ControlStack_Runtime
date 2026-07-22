import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation,
  SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeActivation.js";
import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary.js";
import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js";
import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";
import {
  createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js";
import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
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
  "SELECTED-PROJECT-ENGINE-RUN-FIRST-ENABLED-CROSS-LAYER-CONTRACT-LOCK-1";
const PROJECT_ID = "first-enabled-cross-layer-project";
const ENVELOPE_ID = "env-first-enabled-cross-layer-project";
const REVISION = Object.freeze({
  active: true,
  projectId: PROJECT_ID,
  localEnvelopeId: ENVELOPE_ID,
  localRevisionId: "local-revision-first-enabled-1",
  serverEnvelopeId: "server-envelope-first-enabled-1",
  serverRevisionId: "server-revision-first-enabled-1",
});

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
    policyFingerprint: "safe-policy:first-enabled",
    sourceFingerprint: "safe-source:first-enabled",
    sourceInputFingerprint: "safe-source-input:first-enabled",
    sourceVersionFingerprint: "safe-source-version:first-enabled",
    acceptedSelectedResultAuthorityGateFingerprint: "safe-authority-gate:first-enabled",
    selectedResultPersistenceAuthorityPreflightFingerprint:
      "safe-persistence-preflight:first-enabled",
    selectedResultPersistenceBoundaryContractFingerprint:
      "safe-persistence-boundary:first-enabled",
    selectedResultOutputReadinessPreflightFingerprint:
      "safe-output-preflight:first-enabled",
    selectedResultAuthorityGuardFingerprint: "safe-authority-guard:first-enabled",
    selectedResultProjectionFingerprint: "safe-projection:first-enabled",
    safeSelectedResultSourceObjectFingerprint: "safe-source-object:first-enabled",
    selectedResultHandoffScaffoldFingerprint: "safe-handoff:first-enabled",
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
    policyFingerprint: "safe-policy:first-enabled",
    sourceFingerprint: "safe-source:first-enabled",
    sourceInputFingerprint: "safe-source-input:first-enabled",
    sourceVersionFingerprint: "safe-source-version:first-enabled",
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResultSummary,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      "safe-selected-result-slot:first-enabled",
    runTableFirstNarrowOutputHandoffContractFingerprint:
      "safe-runtable-handoff:first-enabled",
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
        runQuantity: 1,
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
      targetIntent: { direct: { ready: true, valueLabel: "1200", intentOnly: true } },
      cctCriPairing: {
        direct: { ready: true, valueLabel: "4000K / CRI90", boardBacked: true },
      },
      controlIntent: {
        direct: { ready: true, valueLabel: "DALI-2", sourceBacked: true },
      },
      fingerprint: "safe-lm-temperature:first-enabled",
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

function safeHostSeamResult() {
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
    donor_run_engine_attempted: true,
    donor_bridge_used: false,
    donor_bridge_audit_jsonl_write_enabled: false,
    filesystem_write_guard_active: true,
    bytecode_writing_disabled: true,
    filesystem_write_attempted: false,
    audit_jsonl_write_attempted: false,
    write_attempted: false,
    runtime_data_mutation_enabled: false,
    donor_data_mutation_enabled: false,
    selected_result_persistence_enabled: false,
    runtime_data_mutated: false,
    selected_result_persisted: false,
    run_table_generated: false,
    ies_generated: false,
    output_generated: false,
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

function responseFor(body) {
  return {
    status: body.ok === true ? 200 : body.requestAccepted === true ? 422 : 400,
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

function assertNoPrivateProjection(value, label) {
  const serialised = JSON.stringify(value);
  for (const token of [
    "host_local_readonly_engine_candidate",
    "selector_stage3_supported_subset",
    "selectorPayload",
    "candidatePayload\":{",
    "projectEnvelope\":{",
    "run_length_mm",
    "target_lm_per_m",
    "candidateFingerprint",
    "sourceBoundaryFingerprint",
    "RuntimeData",
    "IESNA:LM-63",
    "TILT=",
  ]) assert.equal(serialised.includes(token), false, `${label}:${token}`);
}

test("first enabled cross-layer lock composes preview, acknowledgement, client mount, browser activation, one POST, and live server lifecycle", async () => {
  assert.equal(CONTRACT_LOCK_ID,
    "SELECTED-PROJECT-ENGINE-RUN-FIRST-ENABLED-CROSS-LAYER-CONTRACT-LOCK-1");
  assert.equal(SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID,
    "SHELL-PROJECT-BROWSER-FIRST-ENABLED-SELECTED-PROJECT-READONLY-ENGINE-RUN-1");

  const envelope = selectedEnvelope();
  const readinessSummary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope,
    ENVELOPE_ID,
  );
  const engineRunPreview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readinessSummary,
    ENVELOPE_ID,
  );
  let fetchCalls = 0;
  let hostCalls = 0;
  let activeRevisionReads = 0;
  let envelopeReads = 0;
  const hostTransport = createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount({
    savedProjects: {
      getActiveRevision(selectedProjectId) {
        activeRevisionReads += 1;
        assert.equal(selectedProjectId, ENVELOPE_ID);
        return structuredClone(REVISION);
      },
      getProjectEnvelope(selectedProjectId) {
        envelopeReads += 1;
        assert.equal(selectedProjectId, ENVELOPE_ID);
        return structuredClone(envelope);
      },
    },
    invokeHostLocalReadonlySeam(request) {
      hostCalls += 1;
      assert.equal(request.execute, true);
      assert.equal(request.filesystemWriteGuardRequired, true);
      assert.equal(request.bytecodeWritingDisabled, true);
      return safeHostSeamResult();
    },
  });
  const clientTransport =
    createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
      async fetchImpl(path, options) {
        fetchCalls += 1;
        assert.equal(path,
          RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH);
        assert.equal(options.method, "POST");
        assert.equal(options.credentials, "same-origin");
        assert.deepEqual(JSON.parse(options.body), {
          schemaId: "controlstack.runtime.engine-runtable.selected-project-shell-invoke-transport-boundary.v1",
          schemaVersion: 1,
          contractId:
            "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-SHELL-INVOKE-TRANSPORT-BOUNDARY-1",
          requestKind: "selected-project-readonly-engine-invoke",
          selectedProjectId: ENVELOPE_ID,
          readOnly: true,
          selectedProjectOnly: true,
        });
        return responseFor(await hostTransport.invoke(JSON.parse(options.body)));
      },
    });
  const clientMount = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount({
    invokeSelectedProjectReadonlyEngineClientTransport: clientTransport,
  });
  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport:
      clientMount.invokeSelectedProjectReadonlyEngine,
  });
  const context = {
    projectBrowser: {
      selectedProjectId: ENVELOPE_ID,
      selectedProjectServerOwnedRegistration: Object.freeze({
        ok: true,
        activeRevision: true,
        projectId: PROJECT_ID,
        localEnvelopeId: ENVELOPE_ID,
        localSavedAt: "2026-07-14T03:30:00.000Z",
        localRevisionId: REVISION.localRevisionId,
        serverEnvelopeId: REVISION.serverEnvelopeId,
        serverRevisionId: REVISION.serverRevisionId,
        serverOwned: true,
        retainedInProcessMemory: true,
        filesystemPersistenceEnabled: false,
      }),
    },
  };

  controller.setDelegatedListenerMounted(true);
  for (let index = 0; index < 4; index += 1) {
    const activation = controller.refresh({ context, engineRunPreview });
    const lane = buildShellProjectBrowserSelectedProjectEngineActionLane(
      engineRunPreview,
      activation,
    );
    assert.equal(lane.state,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.ready);
    assert.equal(lane.actions[0].enabled, true);
  }
  assert.equal(fetchCalls, 0);
  assert.equal(hostCalls, 0);
  assert.equal(activeRevisionReads, 0);
  assert.equal(envelopeReads, 0);

  const activationPromise = controller.activate();
  const invokingLane = buildShellProjectBrowserSelectedProjectEngineActionLane(
    engineRunPreview,
    controller.getSnapshot(),
  );
  assert.equal(invokingLane.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.invoking);
  assert.equal(invokingLane.actions[0].enabled, false);
  assert.equal(invokingLane.engineExecutionRequested, true);

  const completed = await activationPromise;
  const completedLane = buildShellProjectBrowserSelectedProjectEngineActionLane(
    engineRunPreview,
    completed,
  );
  assert.equal(
    completed.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.completed,
    JSON.stringify(completed),
  );
  assert.equal(completed.outcomeReadiness, "completed");
  assert.equal(completed.responseAccepted, true);
  assert.equal(completedLane.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.completed);
  assert.equal(completedLane.actions[0].enabled, false);
  assert.equal(fetchCalls, 1);
  assert.equal(hostCalls, 1);
  assert.equal(activeRevisionReads, 2);
  assert.equal(envelopeReads, 2);

  await controller.activate();
  assert.equal(fetchCalls, 1);
  assert.equal(hostCalls, 1);
  assertNoPrivateProjection(completed, "activation");
  assertNoPrivateProjection(completedLane, "lane");
});

test("shell source locks one delegated stable-host listener and excludes invocation from refresh and renderer paths", async () => {
  const [shellSource, activationSource, clientSource, mountSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeActivation.js",
      import.meta.url,
    ), "utf8"),
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary.js",
      import.meta.url,
    ), "utf8"),
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js",
      import.meta.url,
    ), "utf8"),
  ]);

  const refreshStart = shellSource.indexOf("function refreshContext(reason = \"context-refresh\")");
  const refreshEnd = shellSource.indexOf("function refreshContextSafely", refreshStart);
  const refreshSource = shellSource.slice(refreshStart, refreshEnd);
  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(",
  );
  const rendererEnd = shellSource.indexOf(
    "function setProjectBrowserSelectedProjectExportsWorkflowDescriptor",
    rendererStart,
  );
  const rendererSource = shellSource.slice(rendererStart, rendererEnd);

  assert.equal(
    (shellSource.match(/projectBrowserSelectedProjectEngineActionLane\?\.addEventListener\(/g)
      || []).length,
    1,
  );
  assert.match(shellSource, /handleProjectBrowserSelectedProjectEngineAction/);
  assert.match(shellSource, /button\[data-shell-project-engine-action-id\]/);
  assert.doesNotMatch(refreshSource,
    /\.activate\s*\(|\.mount\s*\(|\bfetch\s*\(|invokeSelectedProjectReadonlyEngine/);
  assert.doesNotMatch(rendererSource,
    /addEventListener|onclick|\.activate\s*\(|\bfetch\s*\(|services?\./);
  assert.match(rendererSource, /button\.disabled = actionItem\?\.enabled !== true/);
  assert.match(activationSource, /consumedRevisionKeys\.add\(capturedRevisionKey\)/);
  assert.match(activationSource, /responseIsStale/);
  assert.match(activationSource, /browserConcurrentActivationBlocked/);
  assert.match(activationSource, /browserReplayBlocked/);
  assert.equal((clientSource.match(/browserFetch\(/g) || []).length, 1);
  assert.match(clientSource, /credentials: "same-origin"/);
  assert.match(mountSource,
    /createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount/);

  const browserOwnedSource = [shellSource, activationSource, clientSource, mountSource].join("\n");
  assert.doesNotMatch(browserOwnedSource,
    /writeFile|appendFile|createWriteStream|persistSelectedResult|generateRunTable|generateIes/);
  assert.doesNotMatch(browserOwnedSource,
    /candidatePayload\s*:\s*[^f]|selectorPayload\s*:|projectEnvelope\s*:|databasePath\s*:|filePath\s*:/);
});