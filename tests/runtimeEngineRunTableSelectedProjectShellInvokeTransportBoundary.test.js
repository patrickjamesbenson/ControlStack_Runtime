import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js";
import {
  RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js";
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

let fixtureSequence = 0;

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

function fixtureIdentity() {
  fixtureSequence += 1;
  return {
    projectId: `transport-project-${fixtureSequence}`,
    envelopeId: `env-transport-project-${fixtureSequence}`,
    suffix: `transport-${fixtureSequence}`,
  };
}

function readySelectedResultSummary(suffix) {
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
    policyFingerprint: `safe-policy:${suffix}`,
    sourceFingerprint: `safe-source:${suffix}`,
    sourceInputFingerprint: `safe-source-input:${suffix}`,
    sourceVersionFingerprint: `safe-source-version:${suffix}`,
    acceptedSelectedResultAuthorityGateFingerprint:
      `safe-accepted-selected-result-authority-gate:${suffix}`,
    selectedResultPersistenceAuthorityPreflightFingerprint:
      `safe-selected-result-persistence-authority-preflight:${suffix}`,
    selectedResultPersistenceBoundaryContractFingerprint:
      `safe-selected-result-persistence-boundary-contract:${suffix}`,
    selectedResultOutputReadinessPreflightFingerprint:
      `safe-selected-result-output-readiness-preflight:${suffix}`,
    selectedResultAuthorityGuardFingerprint:
      `safe-selected-result-authority-guard:${suffix}`,
    selectedResultProjectionFingerprint:
      `safe-selected-result-projection:${suffix}`,
    safeSelectedResultSourceObjectFingerprint:
      `safe-selected-result-source-object:${suffix}`,
    selectedResultHandoffScaffoldFingerprint:
      `safe-selected-result-handoff-scaffold:${suffix}`,
    ...Object.fromEntries(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function readyRunTableFirstNarrowOutputSummary(selectedResultSummary, suffix) {
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
    policyFingerprint: `safe-policy:${suffix}`,
    sourceFingerprint: `safe-source:${suffix}`,
    sourceInputFingerprint: `safe-source-input:${suffix}`,
    sourceVersionFingerprint: `safe-source-version:${suffix}`,
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResultSummary,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      `safe-selected-result-persisted-summary-slot-contract:${suffix}`,
    runTableFirstNarrowOutputHandoffContractFingerprint:
      `safe-runtable-first-narrow-output-handoff-contract:${suffix}`,
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function stage3Inputs(suffix) {
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
      fingerprint: `safe-selector-lm-temp-readiness-preview:${suffix}`,
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

function selectedEnvelope(identity = fixtureIdentity()) {
  const selectedResultSummary = readySelectedResultSummary(identity.suffix);
  const runTableFirstNarrowOutputSummary = readyRunTableFirstNarrowOutputSummary(
    selectedResultSummary,
    identity.suffix,
  );
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    projectId: identity.projectId,
    envelopeId: identity.envelopeId,
    modules: {
      cs_selector: {
        owner: "cs_selector",
        moduleId: "cs_selector",
        state: {
          engineRunActionSource: stage3Inputs(identity.suffix),
        },
        downstreamContext: {
          selectedResultSummary,
          runTableFirstNarrowOutputSummary,
        },
      },
    },
  };
}

function transportRequest(selectedProjectId, overrides = {}) {
  return {
    schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
    contractId:
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
    requestKind: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
    selectedProjectId,
    readOnly: true,
    selectedProjectOnly: true,
    ...overrides,
  };
}

function safeSeamResult(overrides = {}) {
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
    ...overrides,
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

function assertRedactedTransportResponse(response) {
  assert.equal(Object.isFrozen(response), true);
  assert.deepEqual(
    Object.keys(response),
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER,
  );
  assert.equal(
    Object.values(response).every((value) => (
      value === null || ["string", "number", "boolean"].includes(typeof value)
    )),
    true,
  );
  for (const key of [
    "projectId",
    "envelopeId",
    "candidateFingerprint",
    "sourceBoundaryFingerprint",
    "outcomeFingerprint",
    "candidate",
    "selectorPayload",
    "projectEnvelope",
    "runtimeData",
    "runRows",
    "readonlyEngineStep1SafeSummary",
    "readonlyEngineStep2SelectedResultProjection",
    "readonlyEngineStep3AuthorityResult",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(response, key), false, key);
  }
  for (const key of [
    "candidatePayloadReturned",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "runRowsReturned",
    "exactElectricalValuesReturned",
    "fingerprintsReturned",
    "projectEnvelopeReturned",
    "runtimeDataDetailsReturned",
    "internalSeamExposed",
    "mcpExposed",
    "shellDirectInternalCallAllowed",
    "shellMounted",
    "routesAdded",
    "postEndpointsAdded",
  ]) {
    assert.equal(response[key], false, key);
  }
  const serialized = JSON.stringify(response);
  for (const forbidden of [
    "Business",
    "3500",
    "1200",
    "4000K",
    "CRI90",
    "DALI-2",
    "safe-selector-readonly-engine-candidate:",
    "safe-project-browser-selected-project-engine-run-action-source-boundary:",
    "safe-runtime-engine-runtable-selected-project-readonly-invoke-outcome:",
    "TILT=",
    "IESNA:LM-63",
    "RuntimeData",
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
}

test("exports the fixed server-owned request and redacted response contracts", () => {
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
    "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-SHELL-INVOKE-TRANSPORT-BOUNDARY-1",
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
    "controlstack.runtime.engine-runtable.selected-project-shell-invoke-transport-boundary.v1",
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
    1,
  );
  assert.deepEqual(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER,
    [
      "schemaId",
      "schemaVersion",
      "contractId",
      "requestKind",
      "selectedProjectId",
      "readOnly",
      "selectedProjectOnly",
    ],
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER
      .includes("fingerprintsReturned"),
    true,
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER
      .includes("candidateFingerprint"),
    false,
  );
});

test("accepts only the shell-selected project identity, reconstructs the source boundary server-side, invokes readonly capability, and returns redacted outcome only", async () => {
  const identity = fixtureIdentity();
  const envelope = selectedEnvelope(identity);
  const reads = [];
  let adapterCalls = 0;
  let privateRequest = null;
  const transport = createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary({
    savedProjects: {
      getProjectEnvelope(selectedProjectId) {
        reads.push(selectedProjectId);
        return structuredClone(envelope);
      },
    },
    hostLocalReadonlySeamAdapter: realAdapter(async (request) => {
      adapterCalls += 1;
      privateRequest = request;
      return safeSeamResult();
    }),
  });

  const response = await transport(
    JSON.parse(JSON.stringify(transportRequest(identity.envelopeId))),
  );

  assertRedactedTransportResponse(response);
  assert.deepEqual(reads, [identity.envelopeId]);
  assert.equal(adapterCalls, 1);
  assert.ok(privateRequest);
  assert.equal(privateRequest.selectorPayload.tier, "Business");
  assert.equal(privateRequest.selectorPayload.runs[0].run_length_mm, 3500);
  assert.equal(response.selectedProjectId, identity.envelopeId);
  assert.equal(
    response.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed,
  );
  assert.equal(response.ok, true);
  assert.equal(response.failClosed, false);
  assert.equal(response.blocker, null);
  assert.equal(response.requestAccepted, true);
  assert.equal(response.serverOwned, true);
  assert.equal(response.sourceBoundaryReconstructedServerSide, true);
  assert.equal(response.sourceBoundaryReady, true);
  assert.equal(response.capabilityInvoked, true);
  assert.equal(response.capabilityCompleted, true);
  assert.equal(response.redactedOutcomeOnly, true);
});

test("rejects shell-supplied source boundaries, candidates, payloads, and other extra fields before any server read or invocation", async () => {
  const identity = fixtureIdentity();
  let reads = 0;
  let adapterCalls = 0;
  const transport = createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary({
    savedProjects: {
      getProjectEnvelope() {
        reads += 1;
        return selectedEnvelope(identity);
      },
    },
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      adapterCalls += 1;
      return safeSeamResult();
    }),
  });

  for (const extra of [
    { sourceBoundary: { ready: true } },
    { candidate: { tier: "Business" } },
    { selectorPayload: { runs: [] } },
    { rawEnginePayload: { execute: true } },
    { projectEnvelope: selectedEnvelope(identity) },
    { fingerprint: "safe-forged:fingerprint" },
  ]) {
    const response = await transport(transportRequest(identity.envelopeId, extra));
    assertRedactedTransportResponse(response);
    assert.equal(response.ok, false);
    assert.equal(response.requestAccepted, false);
    assert.equal(response.sourceBoundaryReconstructedServerSide, false);
    assert.equal(
      response.blocker,
      "selected-project-shell-invoke-transport-request-shape-invalid",
    );
  }
  assert.equal(reads, 0);
  assert.equal(adapterCalls, 0);
});

test("fails closed when the server-loaded envelope does not match the shell-selected project and does not reveal the server-side identity", async () => {
  const shellIdentity = fixtureIdentity();
  const otherIdentity = fixtureIdentity();
  const otherEnvelope = selectedEnvelope(otherIdentity);
  let adapterCalls = 0;
  const transport = createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary({
    savedProjects: {
      getProjectEnvelope(selectedProjectId) {
        assert.equal(selectedProjectId, shellIdentity.envelopeId);
        return structuredClone(otherEnvelope);
      },
    },
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      adapterCalls += 1;
      return safeSeamResult();
    }),
  });

  const response = await transport(transportRequest(shellIdentity.envelopeId));

  assertRedactedTransportResponse(response);
  assert.equal(response.selectedProjectId, shellIdentity.envelopeId);
  assert.equal(response.ok, false);
  assert.equal(response.failClosed, true);
  assert.equal(response.requestAccepted, true);
  assert.equal(response.sourceBoundaryReconstructedServerSide, true);
  assert.equal(response.sourceBoundaryReady, false);
  assert.equal(response.capabilityInvoked, false);
  assert.equal(adapterCalls, 0);
  assert.equal(JSON.stringify(response).includes(otherIdentity.projectId), false);
  assert.equal(JSON.stringify(response).includes(otherIdentity.envelopeId), false);
});

test("keeps the transport unavailable without a real host-local adapter after successful private reconstruction", async () => {
  const identity = fixtureIdentity();
  const envelope = selectedEnvelope(identity);
  const transport = createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary({
    savedProjects: {
      getProjectEnvelope() {
        return structuredClone(envelope);
      },
    },
  });

  const response = await transport(transportRequest(identity.envelopeId));

  assertRedactedTransportResponse(response);
  assert.equal(
    response.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable,
  );
  assert.equal(response.readiness, "unavailable");
  assert.equal(response.ok, false);
  assert.equal(response.requestAccepted, true);
  assert.equal(response.sourceBoundaryReconstructedServerSide, true);
  assert.equal(response.sourceBoundaryReady, true);
  assert.equal(response.capabilityInvoked, false);
  assert.equal(response.capabilityCompleted, false);
  assert.equal(
    response.blocker,
    "selected-project-readonly-invoke-host-local-adapter-unavailable",
  );
});

test("transport source stays server-owned and unmounted while shell and server routes cannot call internal or MCP seams directly", async () => {
  const [transportSource, shellSource, serverSource] = await Promise.all([
    readFile(
      new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../server.js", import.meta.url), "utf8"),
  ]);

  assert.match(
    transportSource,
    /buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary/,
  );
  assert.match(
    transportSource,
    /resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary/,
  );
  assert.match(
    transportSource,
    /createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability/,
  );
  assert.doesNotMatch(
    transportSource,
    /getProjectBrowserSelectedProjectEngineRunActionInternalCandidate/,
  );
  assert.doesNotMatch(
    transportSource,
    /engine_runtable_internal_readonly_invoke_probe|webhook|MCP|fetch\s*\(|XMLHttpRequest|WebSocket|\/api\/|\bPOST\b|node:fs|writeFile|appendFile|RuntimeData/,
  );
  assert.doesNotMatch(
    shellSource,
    /engineRunTableSelectedProjectShellInvokeTransportBoundary|engineRunTableSelectedProjectReadonlyInvokeCapability|projectBrowserSelectedProjectEngineRunActionSourceBoundary|engine_runtable_internal_readonly_invoke|engine_runtable_internal_readonly_invoke_probe/,
  );
  assert.doesNotMatch(
    serverSource,
    /engineRunTableSelectedProjectShellInvokeTransportBoundary|RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-SHELL-INVOKE-TRANSPORT-BOUNDARY-1/,
  );
});
