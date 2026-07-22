import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount,
  mountShellProjectBrowserSelectedProjectReadonlyEngineInvoke,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js";
import { createShellServices } from "../packages/workspace-kernel/services.js";
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

const PROJECT_ID = "readonly-engine-mount-project";
const ENVELOPE_ID = "env-readonly-engine-mount-project";
const FIXTURE_SUFFIX = "readonly-engine-mount";

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

function readyContext(envelope = selectedEnvelope()) {
  return {
    envelope,
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        selectedProjectEngineRunReadinessReadbackSummary:
          buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
            envelope,
            ENVELOPE_ID,
          ),
      },
    },
  };
}

function realAdapter(invoke) {
  return Object.freeze({
    contractId: "controlstack.runtime.engine-runtable.host-local-readonly-seam-adapter.v1",
    seam: "engine-runtable-internal-readonly-invoke",
    seamVersion: "engine_runtable_internal_readonly_invoke.v1",
    hostLocal: true,
    readOnly: true,
    realHostLocalSeam: true,
    fixtureAdapter: false,
    invoke,
  });
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
  const serialised = JSON.stringify(status);
  for (const forbidden of [
    "factoryApprovedInputsSummary",
    "committedSelectorConstraints",
    "lmTemperatureReadinessPreview",
    "selectorPayload",
    "modules.cs_selector",
    "candidateFingerprint",
    "sourceBoundaryFingerprint",
    "C:\\",
  ]) {
    assert.equal(serialised.includes(forbidden), false, forbidden);
  }
}

function serviceHarness(controller, envelope) {
  let envelopeReads = 0;
  let serviceCalls = 0;
  let receivedBoundary = null;
  const invoke = controller.invokeSelectedProjectReadonlyEngine;
  const services = {
    savedProjects: {
      getProjectEnvelope(selectedProjectId) {
        envelopeReads += 1;
        assert.equal(selectedProjectId, ENVELOPE_ID);
        return envelope;
      },
    },
    async invokeSelectedProjectReadonlyEngine(...args) {
      serviceCalls += 1;
      assert.equal(args.length, 1);
      receivedBoundary = args[0];
      return invoke(args[0]);
    },
  };
  return {
    services,
    get envelopeReads() {
      return envelopeReads;
    },
    get serviceCalls() {
      return serviceCalls;
    },
    get receivedBoundary() {
      return receivedBoundary;
    },
  };
}

test("exports the fixed shell mount contract and injects one service function without widening shell services", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-READONLY-ENGINE-INVOKE-MOUNT-1",
  );
  const injected = async () => null;
  const services = createShellServices({
    invokeSelectedProjectReadonlyEngine: injected,
  });
  assert.equal(services.invokeSelectedProjectReadonlyEngine, injected);
  assert.equal(typeof createShellServices().invokeSelectedProjectReadonlyEngine, "function");
});

test("production mount resolves the selected-project boundary, passes only that boundary, and reports mounted but unavailable without a real adapter", async () => {
  const { envelope, context } = readyContext();
  const controller = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount();
  const harness = serviceHarness(controller, envelope);

  const status = await controller.mount({ context, services: harness.services });

  assertScalarMountStatus(status);
  assert.equal(
    status.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.unavailable,
  );
  assert.equal(status.readiness, "unavailable");
  assert.equal(status.mounted, true);
  assert.equal(status.serviceMounted, true);
  assert.equal(status.sourceBoundaryResolved, true);
  assert.equal(status.sourceBoundaryReady, true);
  assert.equal(status.runtimeResultReceived, true);
  assert.equal(status.adapterMounted, false);
  assert.equal(status.adapterInvoked, false);
  assert.equal(status.engineActionAvailable, false);
  assert.equal(status.engineActionEnabled, false);
  assert.equal(harness.envelopeReads, 1);
  assert.equal(harness.serviceCalls, 1);
  assert.equal(harness.receivedBoundary.ready, true);
  assert.equal(harness.receivedBoundary.candidatePayloadReturned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(harness.receivedBoundary, "candidate"), false);

  const rerender = await controller.mount({ context, services: harness.services });
  assert.equal(rerender, status);
  assert.equal(harness.envelopeReads, 1);
  assert.equal(harness.serviceCalls, 1);
});

test("a real host-local readonly adapter upgrades only the scalar mount outcome to completed", async () => {
  const { envelope, context } = readyContext();
  let adapterCalls = 0;
  const controller = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      adapterCalls += 1;
      return safeSeamResult();
    }),
  });
  const harness = serviceHarness(controller, envelope);

  const status = await controller.mount({ context, services: harness.services });

  assertScalarMountStatus(status);
  assert.equal(
    status.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.completed,
  );
  assert.equal(status.ok, true);
  assert.equal(status.failClosed, false);
  assert.equal(status.blocker, null);
  assert.equal(status.adapterMounted, true);
  assert.equal(status.adapterInvoked, true);
  assert.equal(status.invocationConsumed, true);
  assert.equal(status.step1Ready, true);
  assert.equal(status.step2ProjectionReady, true);
  assert.equal(adapterCalls, 1);
  assert.equal(harness.serviceCalls, 1);
});

test("missing selection and invalid service outcomes fail closed without invoking or projecting nested runtime material", async () => {
  let calls = 0;
  const missing = await mountShellProjectBrowserSelectedProjectReadonlyEngineInvoke({
    context: { projectBrowser: {} },
    services: {
      invokeSelectedProjectReadonlyEngine() {
        calls += 1;
        return null;
      },
    },
  });
  assertScalarMountStatus(missing);
  assert.equal(
    missing.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.missing,
  );
  assert.equal(calls, 0);

  const { envelope, context } = readyContext();
  const invalid = await mountShellProjectBrowserSelectedProjectReadonlyEngineInvoke({
    context,
    services: {
      savedProjects: {
        getProjectEnvelope() {
          return envelope;
        },
      },
      invokeSelectedProjectReadonlyEngine() {
        calls += 1;
        return Object.freeze({ unsafe: { selectorPayload: {} } });
      },
    },
  });
  assertScalarMountStatus(invalid);
  assert.equal(
    invalid.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
      .blockedFailClosed,
  );
  assert.equal(invalid.runtimeResultReceived, false);
  assert.equal(calls, 1);
});

test("shell wiring replaces refresh-time mount invocation with the inert client mount and delegated activation", async () => {
  const [mountSource, servicesSource, shellSource, actionLaneSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../packages/workspace-kernel/services.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(
    mountSource,
    /resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary\(\{/,
  );
  assert.match(
    mountSource,
    /services\.invokeSelectedProjectReadonlyEngine\(sourceBoundary\)/,
  );
  assert.doesNotMatch(
    mountSource,
    /services\.invokeSelectedProjectReadonlyEngine\(sourceBoundary\s*,/,
  );
  assert.match(servicesSource, /^    invokeSelectedProjectReadonlyEngine,$/m);
  assert.match(
    shellSource,
    /createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount\(\{/,
  );
  assert.doesNotMatch(
    shellSource,
    /selectedProjectReadonlyEngineInvokeMount\.mount\(\{/,
  );
  assert.match(shellSource, /button\.disabled = actionItem\?\.enabled !== true/);
  assert.equal(actionLaneSource.includes("packages/workspace-kernel"), false);

  const combined = `${mountSource}\n${servicesSource}\n${shellSource}`;
  assert.doesNotMatch(
    mountSource,
    /preparedAction\s*[:=(]|executionCallback/,
  );
  assert.doesNotMatch(
    combined,
    /addEventListener[^\n]*Run Engine|onclick|onClick|\bfetch\s*\(|XMLHttpRequest|WebSocket|webhook|localStorage|sessionStorage|indexedDB|writeFile|appendFile|createWriteStream/,
  );
  assert.doesNotMatch(
    combined,
    /\/api\/workspace-shell\/selected-project-engine-readonly-invoke|engine_runtable_internal_readonly_invoke_probe|controlstack_mcp|saveProjectEnvelope|runtimeData\s*[.\[]|RunTable generation enabled/,
  );
});