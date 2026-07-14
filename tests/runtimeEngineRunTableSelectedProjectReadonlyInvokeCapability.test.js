import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID,
  RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js";
import {
  resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary,
} from "../packages/workspace-kernel/projectBrowserSelectedProjectEngineRunActionSourceBoundary.js";
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
    projectId: `readonly-invoke-project-${fixtureSequence}`,
    envelopeId: `env-readonly-invoke-project-${fixtureSequence}`,
    suffix: `readonly-invoke-${fixtureSequence}`,
  };
}

function readySelectedResultSummary(suffix, overrides = {}) {
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
    ...overrides,
  };
}

function readyRunTableFirstNarrowOutputSummary(selectedResultSummary, suffix, overrides = {}) {
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
    ...overrides,
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

function selectedEnvelope() {
  const identity = fixtureIdentity();
  const selectedResultSummary = readySelectedResultSummary(identity.suffix);
  const runTableFirstNarrowOutputSummary = readyRunTableFirstNarrowOutputSummary(
    selectedResultSummary,
    identity.suffix,
  );
  const envelope = {
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
  return { envelope, identity, selectedResultSummary };
}

async function readyBoundary() {
  const fixture = selectedEnvelope();
  const summary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    fixture.envelope,
    fixture.identity.envelopeId,
  );
  const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectId: fixture.identity.envelopeId,
        selectedProjectEngineRunReadinessReadbackSummary: summary,
      },
    },
    services: {
      savedProjects: {
        getProjectEnvelope(value) {
          assert.equal(value, fixture.identity.envelopeId);
          return structuredClone(fixture.envelope);
        },
      },
    },
  });
  assert.equal(boundary.ready, true);
  return { ...fixture, boundary, readinessSummary: summary };
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
    donor_run_engine_attempted: true,
    donor_bridge_used: false,
    donor_bridge_audit_jsonl_write_enabled: false,
    filesystem_write_guard_active: true,
    bytecode_writing_disabled: true,
    audit_jsonl_write_attempted: false,
    write_attempted: false,
    filesystem_write_attempted: false,
    runtime_data_mutation_enabled: false,
    runtime_data_mutated: false,
    donor_data_mutation_enabled: false,
    selected_result_persistence_enabled: false,
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
    filesystemWriteGuardRequired: true,
    bytecodeWritingDisabled: true,
    invoke,
  };
}

function assertOnlySafeCapabilityOutput(result) {
  assert.equal(Object.isFrozen(result), true);
  assert.deepEqual(
    Object.keys(result),
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER,
  );
  assert.equal(Object.isFrozen(result.outcomeDescriptor), true);
  assert.deepEqual(
    Object.keys(result.outcomeDescriptor),
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER,
  );
  const forbiddenKeys = new Set([
    "candidate",
    "selectorPayload",
    "candidatePayload",
    "projectEnvelope",
    "factoryApprovedInputsSummary",
    "committedSelectorConstraints",
    "lmTemperatureReadinessPreview",
    "rawEnginePayload",
    "rawEngineResult",
  ]);
  const visit = (value) => {
    if (value === null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    for (const [key, nested] of Object.entries(value)) {
      assert.equal(forbiddenKeys.has(key), false, key);
      visit(nested);
    }
  };
  visit(result);

  const serialized = JSON.stringify(result);
  for (const forbiddenValue of [
    "selector-readonly-engine-run-1",
    "TILT=",
    "IESNA:LM-63",
  ]) {
    assert.equal(serialized.includes(forbiddenValue), false, forbiddenValue);
  }
}

test("exports the fixed runtime-owned capability, adapter contract, and four-output envelope", () => {
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID,
    "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-READONLY-INVOKE-CAPABILITY-1",
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_ID,
    "controlstack.runtime.engine-runtable.selected-project-readonly-invoke-capability.v1",
  );
  assert.equal(RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_VERSION, 1);
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
    "controlstack.runtime.engine-runtable.host-local-readonly-seam-adapter.v1",
  );
  assert.deepEqual(RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER, [
    "readonlyEngineStep1SafeSummary",
    "readonlyEngineStep2SelectedResultProjection",
    "readonlyEngineStep3AuthorityResult",
    "outcomeDescriptor",
  ]);
});

test("remains unavailable without an explicitly mounted real host-local adapter and does not consume the boundary", async () => {
  const { boundary } = await readyBoundary();
  const unavailableCapability =
    createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability();
  const unavailable = await unavailableCapability(boundary);

  assertOnlySafeCapabilityOutput(unavailable);
  assert.equal(
    unavailable.outcomeDescriptor.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.unavailable,
  );
  assert.equal(unavailable.outcomeDescriptor.readiness, "unavailable");
  assert.equal(unavailable.outcomeDescriptor.ok, false);
  assert.equal(unavailable.outcomeDescriptor.failClosed, true);
  assert.equal(
    unavailable.outcomeDescriptor.blocker,
    "selected-project-readonly-invoke-host-local-adapter-unavailable",
  );
  assert.equal(unavailable.outcomeDescriptor.adapterMounted, false);
  assert.equal(unavailable.outcomeDescriptor.adapterInvoked, false);
  assert.equal(unavailable.outcomeDescriptor.invocationConsumed, false);
  assert.equal(unavailable.outcomeDescriptor.privateCandidateConsumed, false);
  assert.equal(
    unavailable.readonlyEngineStep1SafeSummary.blocker,
    "host-local-readonly-engine-seam-not-invoked",
  );

  let calls = 0;
  const mounted = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      calls += 1;
      return safeSeamResult();
    }),
  });
  const completed = await mounted(boundary);
  assert.equal(completed.outcomeDescriptor.ok, true);
  assert.equal(calls, 1);
});

test("rejects fixture or weakly marked adapters without consuming the private candidate", async () => {
  const { boundary } = await readyBoundary();
  let fixtureCalls = 0;
  const fixtureAdapter = {
    ...realAdapter(async () => {
      fixtureCalls += 1;
      return safeSeamResult();
    }),
    fixtureAdapter: true,
  };
  const invalidCapability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: fixtureAdapter,
  });
  const invalid = await invalidCapability(boundary);

  assertOnlySafeCapabilityOutput(invalid);
  assert.equal(
    invalid.outcomeDescriptor.blocker,
    "selected-project-readonly-invoke-host-local-adapter-invalid",
  );
  assert.equal(invalid.outcomeDescriptor.adapterMounted, false);
  assert.equal(invalid.outcomeDescriptor.invocationConsumed, false);
  assert.equal(fixtureCalls, 0);

  let realCalls = 0;
  const realCapability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      realCalls += 1;
      return safeSeamResult();
    }),
  });
  const completed = await realCapability(boundary);
  assert.equal(completed.outcomeDescriptor.ok, true);
  assert.equal(realCalls, 1);
});

test("consumes only the private source-boundary candidate and returns Step-1, Step-2, Step-3, and redacted outcome only", async () => {
  const { boundary } = await readyBoundary();
  let received = null;
  const capability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async (request) => {
      received = request;
      return safeSeamResult();
    }),
  });

  const result = await capability(boundary);

  assertOnlySafeCapabilityOutput(result);
  assert.ok(received);
  assert.equal(Object.isFrozen(received), true);
  assert.equal(Object.isFrozen(received.selectorPayload), true);
  assert.equal(received.seam, "engine-runtable-internal-readonly-invoke");
  assert.equal(received.execute, true);
  assert.equal(received.callerSuppliedDbAllowed, false);
  assert.equal(received.candidatePayloadReturned, false);
  assert.equal(received.filesystemWriteGuardRequired, true);
  assert.equal(received.bytecodeWritingDisabled, true);
  assert.equal(received.selectorPayload.tier, "Business");
  assert.equal(received.selectorPayload.runs[0].qty, 2);
  assert.equal(received.selectorPayload.runs[0].run_length_mm, 3500);
  assert.equal(received.selectorPayload.lighting.target_lm_per_m, "1200");
  assert.equal(received.selectorPayload.lighting.cct, "4000");
  assert.equal(received.selectorPayload.lighting.cri, "90");
  assert.equal(Object.prototype.hasOwnProperty.call(received.selectorPayload, "db"), false);

  assert.equal(result.readonlyEngineStep1SafeSummary.readonlyEngineStep1Ready, true);
  assert.equal(result.readonlyEngineStep1SafeSummary.safeEngineSummary.success, true);
  assert.equal(result.readonlyEngineStep1SafeSummary.safeEngineSummary.runCount, 1);
  assert.equal(result.readonlyEngineStep2SelectedResultProjection.selectedResultAvailable, true);
  assert.equal(result.readonlyEngineStep2SelectedResultProjection.state, "engine_verified");
  assert.equal(result.readonlyEngineStep2SelectedResultProjection.summaryProjectionOnly, true);
  assert.equal(result.readonlyEngineStep2SelectedResultProjection.accepted, false);
  assert.equal(result.readonlyEngineStep3AuthorityResult.state, "readonly_engine_summary_only");
  assert.equal(result.readonlyEngineStep3AuthorityResult.failClosed, true);

  const outcome = result.outcomeDescriptor;
  assert.equal(
    outcome.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed,
  );
  assert.equal(outcome.ok, true);
  assert.equal(outcome.failClosed, false);
  assert.equal(outcome.blocker, null);
  assert.equal(outcome.adapterMounted, true);
  assert.equal(outcome.adapterInvoked, true);
  assert.equal(outcome.invocationConsumed, true);
  assert.equal(outcome.privateCandidateConsumed, true);
  assert.equal(outcome.activeRuntimeDataLoadedReadOnly, true);
  assert.equal(outcome.activeRuntimeDataPassedInMemoryOnly, true);
  assert.equal(outcome.donorRunEngineAttempted, true);
  assert.equal(outcome.donorBridgeUsed, false);
  assert.equal(outcome.filesystemWriteGuardActive, true);
  assert.equal(outcome.filesystemWriteAttempted, false);
  assert.equal(outcome.auditJsonlWriteAttempted, false);
  assert.equal(outcome.runtimeDataMutated, false);
  assert.equal(outcome.selectedResultPersisted, false);
  assert.equal(outcome.runTableGenerated, false);
  assert.equal(outcome.iesGenerated, false);
  assert.equal(outcome.outputGenerated, false);
  assert.equal(outcome.step1Ready, true);
  assert.equal(outcome.step2ProjectionReady, true);
  assert.equal(outcome.step3AuthorityResultAvailable, true);
  assert.equal(outcome.step3AuthorityReady, false);
  for (const key of [
    "candidatePayloadReturned",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "selectedResultPersisted",
    "runTableWritten",
    "runTableGenerated",
    "outputGenerated",
    "iesGenerated",
    "runtimeDataMutated",
    "filesystemWriteAttempted",
    "routesAdded",
    "postEndpointsAdded",
    "fixtureFallbackUsed",
  ]) {
    assert.equal(outcome[key], false, key);
  }
  assert.match(
    outcome.outcomeFingerprint,
    /^safe-runtime-engine-runtable-selected-project-readonly-invoke-outcome:[0-9a-f]{40}$/,
  );
});

test("rejects readiness and selected-result summaries as executable inputs before adapter invocation", async () => {
  const { readinessSummary, selectedResultSummary } = await readyBoundary();
  let calls = 0;
  const capability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      calls += 1;
      return safeSeamResult();
    }),
  });

  const readinessAttempt = await capability(readinessSummary);
  const selectedResultAttempt = await capability(selectedResultSummary);

  for (const result of [readinessAttempt, selectedResultAttempt]) {
    assertOnlySafeCapabilityOutput(result);
    assert.equal(
      result.outcomeDescriptor.blocker,
      "selected-project-readonly-invoke-source-boundary-invalid",
    );
    assert.equal(result.outcomeDescriptor.adapterInvoked, false);
    assert.equal(result.outcomeDescriptor.invocationConsumed, false);
  }
  assert.equal(calls, 0);
});

test("blocks concurrent and replayed invocation globally while invoking the adapter once", async () => {
  const { boundary } = await readyBoundary();
  let releaseAdapter;
  let notifyStarted;
  let calls = 0;
  const started = new Promise((resolve) => {
    notifyStarted = resolve;
  });
  const held = new Promise((resolve) => {
    releaseAdapter = resolve;
  });
  const capability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      calls += 1;
      notifyStarted();
      await held;
      return safeSeamResult();
    }),
  });

  const firstPromise = capability(boundary);
  await started;
  const concurrent = await capability(boundary);
  releaseAdapter();
  const first = await firstPromise;

  const secondCapability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      calls += 1;
      return safeSeamResult();
    }),
  });
  const replay = await secondCapability(boundary);

  assert.equal(first.outcomeDescriptor.ok, true);
  assert.equal(
    concurrent.outcomeDescriptor.blocker,
    "selected-project-readonly-invoke-concurrent-invocation-blocked",
  );
  assert.equal(concurrent.outcomeDescriptor.concurrentInvocationBlocked, true);
  assert.equal(concurrent.outcomeDescriptor.adapterInvoked, false);
  assert.equal(
    replay.outcomeDescriptor.blocker,
    "selected-project-readonly-invoke-replay-blocked",
  );
  assert.equal(replay.outcomeDescriptor.replayBlocked, true);
  assert.equal(replay.outcomeDescriptor.adapterInvoked, false);
  assert.equal(calls, 1);
});

test("fails closed on mutation, persistence, RunTable/output generation, raw payload, or filesystem-write seam markers", async () => {
  const unsafeCases = [
    ["runtime_data_mutation_enabled", true],
    ["selected_result_persistence_enabled", true],
    ["run_table_generated", true],
    ["output_generated", true],
    ["raw_engine_payload_exposed", true],
    ["write_attempted", true],
  ];

  for (const [key, value] of unsafeCases) {
    const { boundary } = await readyBoundary();
    let calls = 0;
    const capability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
      hostLocalReadonlySeamAdapter: realAdapter(async () => {
        calls += 1;
        return safeSeamResult({ [key]: value });
      }),
    });
    const result = await capability(boundary);

    assertOnlySafeCapabilityOutput(result);
    assert.equal(result.outcomeDescriptor.ok, false, key);
    assert.equal(result.outcomeDescriptor.failClosed, true, key);
    assert.equal(result.outcomeDescriptor.adapterInvoked, true, key);
    assert.equal(result.outcomeDescriptor.invocationConsumed, true, key);
    assert.equal(result.outcomeDescriptor.privateCandidateConsumed, true, key);
    assert.equal(result.outcomeDescriptor.candidatePayloadReturned, false, key);
    assert.equal(result.outcomeDescriptor.selectedResultPersisted, false, key);
    assert.equal(result.outcomeDescriptor.runTableWritten, false, key);
    assert.equal(result.outcomeDescriptor.runTableGenerated, key === "run_table_generated", key);
    assert.equal(result.outcomeDescriptor.outputGenerated, key === "output_generated", key);
    assert.equal(result.outcomeDescriptor.runtimeDataMutated, false, key);
    assert.equal(result.outcomeDescriptor.filesystemWriteAttempted, key === "write_attempted", key);
    assert.equal(calls, 1, key);
  }
});

test("adapter exceptions are redacted, consume the one-shot invocation, and cannot be replayed", async () => {
  const { boundary } = await readyBoundary();
  let calls = 0;
  const capability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      calls += 1;
      throw new Error("C:\\private\\RuntimeData\\secret.json");
    }),
  });

  const failed = await capability(boundary);
  const replay = await capability(boundary);

  assertOnlySafeCapabilityOutput(failed);
  assert.equal(
    failed.outcomeDescriptor.blocker,
    "selected-project-readonly-invoke-host-local-adapter-threw",
  );
  assert.equal(failed.outcomeDescriptor.adapterInvoked, true);
  assert.equal(failed.outcomeDescriptor.invocationConsumed, true);
  assert.equal(JSON.stringify(failed).includes("secret.json"), false);
  assert.equal(
    replay.outcomeDescriptor.blocker,
    "selected-project-readonly-invoke-replay-blocked",
  );
  assert.equal(calls, 1);
});

test("capability source adds no shell, persistence, RuntimeData mutation, route, server, filesystem, fixture, or direct MCP diagnostic call", async () => {
  const source = await readFile(
    new URL(
      "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /getProjectBrowserSelectedProjectEngineRunActionInternalCandidate/);
  assert.match(source, /hostLocalReadonlySeamAdapter\.invoke/);
  assert.match(source, /const IN_FLIGHT_BOUNDARIES = new WeakSet\(\)/);
  assert.match(source, /const CONSUMED_BOUNDARIES = new WeakSet\(\)/);
  assert.doesNotMatch(source, /engine_runtable_internal_readonly_invoke_probe/);
  assert.doesNotMatch(source, /saveCurrentProjectEnvelope|saveProjectEnvelope|restoreProjectEnvelope/);
  assert.doesNotMatch(source, /RuntimeData\s*[.\[]|runtimeData\s*[.\[]/);
  assert.doesNotMatch(
    source,
    /fetch\s*\(|XMLHttpRequest|WebSocket|\/api\/|\bPOST\b|server\.js|node:fs|writeFile|appendFile|mkdir|createWriteStream/,
  );
  assert.doesNotMatch(
    source,
    /fixturePayload\s*=|fixtureEnvelope\s*=|syntheticSuccessFixture\s*:/,
  );
});
