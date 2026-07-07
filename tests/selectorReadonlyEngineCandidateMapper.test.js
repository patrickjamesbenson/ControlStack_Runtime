import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSelectorReadonlyEngineCandidateForInternalSeam,
  buildSelectorReadonlyEngineStep1SafeSummary,
  buildSelectorReadonlyEngineStep2SelectedResultProjection,
  invokeSelectorReadonlyEngineStep1WithHostLocalReadonlySeam,
} from "../packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js";

function stage3Summary(overrides = {}) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    factoryApprovedInputsReady: true,
    stage3Mode: "simple-run-stage3a-zero-accessory",
    blocker: null,
    committedRunIntakeSummary: {
      ready: true,
      committedRunIntakeReady: true,
      sourceAuthority: "committed selector state only: manualConstraints or acceptedDefaults",
      runQuantity: 2,
      runLengthMm: 3500,
      lengthMode: "cut_to_length",
    },
    safetyFlags: {
      engineExecution: false,
      donorEngineInvoked: false,
      runTableGeneration: false,
      iesGeneration: false,
      selectedResultPersistence: false,
      runtimeDataMutation: false,
      rawRowsExposed: false,
      rawEnginePayloadExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
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
    ...overrides,
  };
}

function constraints({ includeTier = true } = {}) {
  return [
    includeTier ? { fieldKey: "tier", value: "Business", valueLabel: "Business", committedSelectorState: true, authoritySource: "acceptedDefaults" } : null,
    { fieldKey: "directOpticVar1", value: "80|Inlay", valueLabel: "Inlay", committedSelectorState: true, authoritySource: "manualConstraints" },
    { fieldKey: "targetLmPerM", value: "1200", valueLabel: "1200", committedSelectorState: true, authoritySource: "manualConstraints" },
    { fieldKey: "cctCri", value: "4000K / CRI90", valueLabel: "4000K / CRI90", committedSelectorState: true, authoritySource: "manualConstraints" },
    { fieldKey: "controlType", value: "DALI-2", valueLabel: "DALI-2", committedSelectorState: true, authoritySource: "manualConstraints" },
  ].filter(Boolean);
}

function lmTemperaturePreview(overrides = {}) {
  return {
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
    fingerprint: "safe-selector-lm-temp-readiness-preview:fixture",
    safetyFlags: {
      donorEngineInvoked: false,
      rawRowsReturned: false,
      rawEnginePayloadReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    ...overrides,
  };
}

function goodMapperResult() {
  return buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary(),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
  });
}

test("maps Stage 3 supported selector state into the host-local readonly seam candidate shape", () => {
  const result = goodMapperResult();

  assert.equal(result.ok, true);
  assert.equal(result.candidate.tier, "Business");
  assert.equal(result.candidate.tier_strategy.mode, "manual");
  assert.equal(result.candidate.runs[0].run_length_mm, 3500);
  assert.equal(result.candidate.runs[0].qty, 2);
  assert.equal(result.candidate.lighting.target_lm_per_m, "1200");
  assert.equal(result.candidate.lighting.lm_per_m, "1200");
  assert.equal(result.candidate.lighting.cct, "4000");
  assert.equal(result.candidate.lighting.cri, "90");
  assert.equal(result.candidate.lighting.optic_key, "Inlay");
  assert.equal(result.candidate.optic.key, "Inlay");
  assert.equal(result.candidate.control_type, "DALI-2");
  assert.equal(result.summary.readonlyEngineCandidateMapperReady, true);
  assert.equal(result.summary.candidateReadyForHostLocalReadonlySeam, true);
  assert.equal(result.summary.candidatePayloadReturned, false);
  assert.equal(result.summary.rawSelectorPayloadReturned, false);
  assert.equal(result.summary.rawEnginePayloadReturned, false);
  assert.equal(result.summary.runTableGenerationEnabled, false);
  assert.equal(result.summary.iesGenerationEnabled, false);
  assert.equal(result.summary.selectedResultPersistenceEnabled, false);
  assert.equal(result.summary.routesAdded, false);
  assert.equal(result.summary.postEndpointsAdded, false);
});

test("fails closed when Stage 3 factory-approved inputs are not ready", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary({ factoryApprovedInputsReady: false, blocker: "stage3-blocked" }),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
  });

  assert.equal(result.ok, false);
  assert.equal(result.candidate, null);
  assert.equal(result.summary.readonlyEngineCandidateMapperReady, false);
  assert.equal(result.summary.blocker, "stage3-blocked");
  assert.equal(result.summary.candidatePayloadReturned, false);
});

test("fails closed for missing required seam candidate fields", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary(),
    committedSelectorConstraints: constraints({ includeTier: false }),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
  });

  assert.equal(result.ok, false);
  assert.equal(result.candidate, null);
  assert.equal(result.summary.blocker, "missing-candidate-field-tier");
  assert.ok(result.summary.fieldStatus.some((row) => row.field === "tier" && row.present === false));
  assert.equal(result.summary.rawEnginePayloadReturned, false);
});

test("returns mapper-ready fail-closed summary until the host-local seam is invoked", () => {
  const mapperResult = goodMapperResult();
  const summary = buildSelectorReadonlyEngineStep1SafeSummary({ mapperResult, seamResult: null });

  assert.equal(summary.ok, false);
  assert.equal(summary.readonlyEngineStep1Ready, false);
  assert.equal(summary.mapperReady, true);
  assert.equal(summary.hostLocalReadonlyEngineSeamInvoked, false);
  assert.equal(summary.blocker, "host-local-readonly-engine-seam-not-invoked");
  assert.equal(summary.safeEngineSummary, null);
  assert.equal(summary.candidatePayloadReturned, false);
  assert.equal(summary.runTableGenerated, false);
  assert.equal(summary.iesGenerated, false);
  assert.equal(summary.selectedResultPersisted, false);
});

test("invokes supplied host-local readonly seam adapter and returns summary only", async () => {
  let received = null;
  const result = await invokeSelectorReadonlyEngineStep1WithHostLocalReadonlySeam({
    factoryApprovedInputsSummary: stage3Summary(),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
    invokeReadonlyEngineSeam: async (request) => {
      received = request;
      return {
        ok: true,
        seam: "engine-runtable-internal-readonly-invoke",
        seam_version: "engine_runtable_internal_readonly_invoke.v1",
        engine_execution_attempted: true,
        engine_result_produced: true,
        public_route_added: false,
        post_endpoint_added: false,
        runtime_data_mutation_enabled: false,
        selected_result_persistence_enabled: false,
        raw_rows_exposed: false,
        raw_engine_payload_exposed: false,
        raw_engine_result_returned: false,
        private_paths_exposed: false,
        credentials_exposed: false,
        safe_engine_summary: {
          success: true,
          run_count: 1,
          error_count: 0,
          warning_count: 0,
          selected_tier: "Business",
          runs: [{ index: 0, raw_run_returned: false }],
        },
      };
    },
  });

  assert.equal(received.seam, "engine-runtable-internal-readonly-invoke");
  assert.equal(received.execute, true);
  assert.equal(received.selectorPayload.tier, "Business");
  assert.equal(received.candidatePayloadReturned, false);
  assert.equal(result.ok, true);
  assert.equal(result.readonlyEngineStep1Ready, true);
  assert.equal(result.candidatePayloadReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.rawEngineResultReturned, false);
  assert.equal(result.readonlyEngineStep1SafeSummary.safeEngineSummary.runCount, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "candidate"), false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});

test("sanitizes successful host-local seam output into summary-only Stage 4 Step 1 proof", () => {
  const mapperResult = goodMapperResult();
  const summary = buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult,
    seamResult: {
      ok: true,
      seam: "engine-runtable-internal-readonly-invoke",
      seam_version: "engine_runtable_internal_readonly_invoke.v1",
      engine_execution_attempted: true,
      engine_result_produced: true,
      public_route_added: false,
      post_endpoint_added: false,
      runtime_data_mutation_enabled: false,
      selected_result_persistence_enabled: false,
      raw_rows_exposed: false,
      raw_engine_payload_exposed: false,
      raw_engine_result_returned: false,
      private_paths_exposed: false,
      credentials_exposed: false,
      safe_engine_summary: {
        success: true,
        run_count: 1,
        error_count: 0,
        warning_count: 0,
        selected_tier: "Business",
        output_contract_ready: false,
        runs: [{ index: 0, boards_count: 3, raw_run_returned: false }],
        raw_result_returned: false,
        raw_debug_returned: false,
        raw_rough_electrical_payload_returned: false,
      },
    },
  });

  assert.equal(summary.ok, true);
  assert.equal(summary.readonlyEngineStep1Ready, true);
  assert.equal(summary.hostLocalReadonlyEngineSeamInvoked, true);
  assert.equal(summary.hostLocalReadonlyEngineResultProduced, true);
  assert.equal(summary.safeEngineSummary.success, true);
  assert.equal(summary.safeEngineSummary.runCount, 1);
  assert.equal(summary.safeEngineSummary.safeRunSummaryCount, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(summary.safeEngineSummary, "runs"), false);
  assert.equal(summary.candidatePayloadReturned, false);
  assert.equal(summary.rawEnginePayloadReturned, false);
  assert.equal(summary.rawEngineResultReturned, false);
  assert.equal(summary.runTableGenerated, false);
  assert.equal(summary.iesGenerated, false);
  assert.equal(summary.selectedResultPersisted, false);
  assert.equal(summary.routesAdded, false);
  assert.equal(summary.postEndpointsAdded, false);
});

test("Stage 4 Step 2 builds safe selected-result source and summary projection from readonly seam summary", () => {
  const mapperResult = goodMapperResult();
  const step1 = buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult,
    seamResult: {
      ok: true,
      seam: "engine-runtable-internal-readonly-invoke",
      seam_version: "engine_runtable_internal_readonly_invoke.v1",
      engine_execution_attempted: true,
      engine_result_produced: true,
      public_route_added: false,
      post_endpoint_added: false,
      runtime_data_mutation_enabled: false,
      selected_result_persistence_enabled: false,
      raw_rows_exposed: false,
      raw_engine_payload_exposed: false,
      raw_engine_result_returned: false,
      private_paths_exposed: false,
      credentials_exposed: false,
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
    },
  });
  const step2 = buildSelectorReadonlyEngineStep2SelectedResultProjection({
    readonlyEngineStep1SafeSummary: step1,
  });

  assert.equal(step2.ok, true);
  assert.equal(step2.readonlyEngineStep2Ready, true);
  assert.equal(step2.selectedResultSourceObjectReady, true);
  assert.equal(step2.selectedResultProjectionReady, true);
  assert.equal(step2.safeSelectedResultSourceObject.ok, true);
  assert.equal(step2.safeSelectedResultSourceObject.boardCount, 3);
  assert.equal(step2.selectedResultProjection.selectedResultAvailable, true);
  assert.equal(step2.selectedResultProjection.state, "engine_verified");
  assert.equal(step2.selectedResultProjection.summaryProjectionOnly, true);
  assert.equal(step2.selectedResultProjection.accepted, false);
  assert.equal(step2.selectedResultProjection.engineVerified, true);
  assert.equal(step2.selectedResultProjection.safetyFlags.selectedResultPersistenceEnabled, false);
  assert.equal(step2.selectedResultProjection.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(step2.selectedResultProjection.safetyFlags.iesGenerationEnabled, false);
  assert.equal(step2.selectedResultProjection.routesAdded, false);
  assert.equal(step2.selectedResultProjection.postEndpointsAdded, false);
  assert.equal(step2.rawEnginePayloadReturned, false);
  assert.equal(step2.rawEngineResultReturned, false);
  assert.equal(step2.rawRunTableRowsReturned, false);
  assert.equal(step2.rawSelectedPayloadReturned, false);
  assert.equal(step2.selectedResultPersisted, false);
  assert.equal(step2.runTableGenerated, false);
  assert.equal(step2.iesGenerated, false);
});

test("Stage 4 Step 2 fails closed until readonly seam summary has required safe counts", () => {
  const mapperResult = goodMapperResult();
  const step1 = buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult,
    seamResult: {
      ok: true,
      seam: "engine-runtable-internal-readonly-invoke",
      seam_version: "engine_runtable_internal_readonly_invoke.v1",
      engine_execution_attempted: true,
      engine_result_produced: true,
      public_route_added: false,
      post_endpoint_added: false,
      runtime_data_mutation_enabled: false,
      selected_result_persistence_enabled: false,
      raw_rows_exposed: false,
      raw_engine_payload_exposed: false,
      raw_engine_result_returned: false,
      private_paths_exposed: false,
      credentials_exposed: false,
      safe_engine_summary: {
        success: true,
        run_count: 1,
        selected_tier: "Business",
        runs: [{ index: 0, boards_count: 3, raw_run_returned: false }],
      },
    },
  });
  const step2 = buildSelectorReadonlyEngineStep2SelectedResultProjection({
    readonlyEngineStep1SafeSummary: step1,
  });

  assert.equal(step2.ok, false);
  assert.equal(step2.readonlyEngineStep2Ready, false);
  assert.equal(step2.selectedResultSourceObjectReady, false);
  assert.equal(step2.selectedResultProjectionReady, false);
  assert.equal(step2.selectedResultProjection.selectedResultAvailable, false);
  assert.equal(step2.selectedResultPersisted, false);
  assert.equal(step2.runTableGenerated, false);
  assert.equal(step2.iesGenerated, false);
});
