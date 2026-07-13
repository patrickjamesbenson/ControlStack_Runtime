import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_LIFECYCLE_LOCK_ID,
  RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js";
import {
  createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js";
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

function fixtureIdentity(label = "lifecycle") {
  fixtureSequence += 1;
  return {
    projectId: `${label}-project-${fixtureSequence}`,
    envelopeId: `env-${label}-project-${fixtureSequence}`,
    suffix: `${label}-${fixtureSequence}`,
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

function stage3Inputs(suffix, { runQuantity = 2, runLengthMm = 3500 } = {}) {
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
        runQuantity,
        runLengthMm,
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

function selectedEnvelope(identity, stage3Overrides = {}) {
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
          engineRunActionSource: stage3Inputs(identity.suffix, stage3Overrides),
        },
        downstreamContext: {
          selectedResultSummary,
          runTableFirstNarrowOutputSummary,
        },
      },
    },
  };
}

async function readyBoundary(identity, envelope = selectedEnvelope(identity)) {
  const readinessSummary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    envelope,
    identity.envelopeId,
  );
  const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectId: identity.envelopeId,
        selectedProjectEngineRunReadinessReadbackSummary: readinessSummary,
      },
    },
    services: {
      savedProjects: {
        getProjectEnvelope(selectedProjectId) {
          assert.equal(selectedProjectId, identity.envelopeId);
          return structuredClone(envelope);
        },
      },
    },
  });
  assert.equal(boundary.ready, true);
  return boundary;
}

function transportRequest(selectedProjectId) {
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

function assertCompleted(result) {
  assert.equal(
    result.outcomeDescriptor.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed,
  );
  assert.equal(result.outcomeDescriptor.ok, true);
  assert.equal(result.outcomeDescriptor.invocationConsumed, true);
  assert.equal(result.outcomeDescriptor.adapterInvoked, true);
  assert.equal(result.outcomeDescriptor.privateCandidateConsumed, true);
}

test("exports the fixed selected-project readonly invoke lifecycle lock identifier", () => {
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_LIFECYCLE_LOCK_ID,
    "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-READONLY-INVOKE-LIFECYCLE-LOCK-1",
  );
});

test("capability creation owns its injected adapter and caller option replacement cannot swap it", async () => {
  const identity = fixtureIdentity("adapter-owner");
  const boundary = await readyBoundary(identity);
  let firstAdapterCalls = 0;
  let replacementAdapterCalls = 0;
  const firstAdapter = realAdapter(async () => {
    firstAdapterCalls += 1;
    return safeSeamResult();
  });
  const options = {
    hostLocalReadonlySeamAdapter: firstAdapter,
  };
  const capability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability(options);
  options.hostLocalReadonlySeamAdapter = realAdapter(async () => {
    replacementAdapterCalls += 1;
    return safeSeamResult();
  });

  const result = await capability(boundary);

  assertCompleted(result);
  assert.equal(firstAdapterCalls, 1);
  assert.equal(replacementAdapterCalls, 0);
});

test("one-shot ownership blocks concurrent invocation and replay across rerendered or recreated capability services", async () => {
  const identity = fixtureIdentity("one-shot");
  const boundary = await readyBoundary(identity);
  let releaseFirst;
  let notifyStarted;
  let firstAdapterCalls = 0;
  let replacementAdapterCalls = 0;
  const started = new Promise((resolve) => {
    notifyStarted = resolve;
  });
  const held = new Promise((resolve) => {
    releaseFirst = resolve;
  });
  const firstCapability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      firstAdapterCalls += 1;
      notifyStarted();
      await held;
      return safeSeamResult();
    }),
  });
  const recreatedCapability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      replacementAdapterCalls += 1;
      return safeSeamResult();
    }),
  });

  const firstPromise = firstCapability(boundary);
  await started;
  const concurrent = await recreatedCapability(boundary);
  releaseFirst();
  const first = await firstPromise;
  const replay = await recreatedCapability(boundary);

  assertCompleted(first);
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
  assert.equal(firstAdapterCalls, 1);
  assert.equal(replacementAdapterCalls, 0);
});

test("project changes receive an independent boundary while a consumed stale boundary stays blocked after service recreation", async () => {
  const firstIdentity = fixtureIdentity("project-change-a");
  const secondIdentity = fixtureIdentity("project-change-b");
  const firstBoundary = await readyBoundary(firstIdentity);
  const secondBoundary = await readyBoundary(
    secondIdentity,
    selectedEnvelope(secondIdentity, { runQuantity: 3, runLengthMm: 2800 }),
  );
  let firstAdapterCalls = 0;
  let secondAdapterCalls = 0;
  const firstCapability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      firstAdapterCalls += 1;
      return safeSeamResult();
    }),
  });
  const firstResult = await firstCapability(firstBoundary);
  assertCompleted(firstResult);

  const recreatedCapability = createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      secondAdapterCalls += 1;
      return safeSeamResult();
    }),
  });
  const staleReplay = await recreatedCapability(firstBoundary);
  const changedProjectResult = await recreatedCapability(secondBoundary);

  assert.equal(
    staleReplay.outcomeDescriptor.blocker,
    "selected-project-readonly-invoke-replay-blocked",
  );
  assert.equal(staleReplay.outcomeDescriptor.adapterInvoked, false);
  assertCompleted(changedProjectResult);
  assert.equal(firstAdapterCalls, 1);
  assert.equal(secondAdapterCalls, 1);
});

test("transport reconstruction rejects a stale selected-project request after the server-side project changes and accepts only the current project", async () => {
  const firstIdentity = fixtureIdentity("stale-selection-a");
  const secondIdentity = fixtureIdentity("stale-selection-b");
  const firstEnvelope = selectedEnvelope(firstIdentity);
  const secondEnvelope = selectedEnvelope(secondIdentity);
  let activeEnvelope = firstEnvelope;
  let adapterCalls = 0;
  const transport = createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary({
    savedProjects: {
      getProjectEnvelope() {
        return structuredClone(activeEnvelope);
      },
    },
    hostLocalReadonlySeamAdapter: realAdapter(async () => {
      adapterCalls += 1;
      return safeSeamResult();
    }),
  });

  const first = await transport(transportRequest(firstIdentity.envelopeId));
  activeEnvelope = secondEnvelope;
  const stale = await transport(transportRequest(firstIdentity.envelopeId));
  const current = await transport(transportRequest(secondIdentity.envelopeId));

  assert.equal(
    first.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed,
  );
  assert.equal(first.ok, true);
  assert.equal(stale.ok, false);
  assert.equal(stale.failClosed, true);
  assert.equal(stale.selectedProjectId, firstIdentity.envelopeId);
  assert.equal(stale.sourceBoundaryReconstructedServerSide, true);
  assert.equal(stale.sourceBoundaryReady, false);
  assert.equal(stale.capabilityInvoked, false);
  assert.equal(JSON.stringify(stale).includes(secondIdentity.projectId), false);
  assert.equal(JSON.stringify(stale).includes(secondIdentity.envelopeId), false);
  assert.equal(
    current.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed,
  );
  assert.equal(current.ok, true);
  assert.equal(adapterCalls, 2);
});

test("lifecycle ownership remains module-private, server-owned, unmounted, memory-only, and free of persistence or transport widening", async () => {
  const [capabilitySource, transportSource, shellSource, servicesSource, serverSource] =
    await Promise.all([
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
      readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
      readFile(new URL("../packages/workspace-kernel/services.js", import.meta.url), "utf8"),
      readFile(new URL("../server.js", import.meta.url), "utf8"),
    ]);

  assert.equal(
    capabilitySource.match(/const IN_FLIGHT_BOUNDARIES = new WeakSet\(\)/g)?.length,
    1,
  );
  assert.equal(
    capabilitySource.match(/const CONSUMED_BOUNDARIES = new WeakSet\(\)/g)?.length,
    1,
  );
  assert.equal(
    transportSource.match(/createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability\(/g)
      ?.length,
    1,
  );
  assert.match(transportSource, /const invokeReadonlyCapability\s*=/);
  assert.doesNotMatch(
    `${shellSource}\n${servicesSource}`,
    /engineRunTableSelectedProjectShellInvokeTransportBoundary|RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-READONLY-INVOKE-LIFECYCLE-LOCK-1|engine_runtable_internal_readonly_invoke/,
  );
  assert.match(
    serverSource,
    /engineRunTableSelectedProjectShellInvokeHostTransportMount/,
  );
  assert.doesNotMatch(serverSource, /engine_runtable_internal_readonly_invoke_probe/);

  for (const source of [capabilitySource, transportSource]) {
    assert.doesNotMatch(
      source,
      /setTimeout|setInterval|Date\.now|localStorage|sessionStorage|indexedDB|node:fs|writeFile|appendFile|mkdir|createWriteStream|fetch\s*\(|XMLHttpRequest|WebSocket|\/api\/|\bPOST\b/,
    );
    assert.doesNotMatch(
      source,
      /saveCurrentProjectEnvelope|saveProjectEnvelope|restoreProjectEnvelope|runtimeData\s*[.\[]|RuntimeData\s*[.\[]/,
    );
  }
});
