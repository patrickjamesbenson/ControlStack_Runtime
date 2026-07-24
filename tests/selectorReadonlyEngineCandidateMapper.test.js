import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSelectorReadonlyEngineCandidateForInternalSeam,
  buildSelectorReadonlyEngineStep1SafeSummary,
  buildSelectorReadonlyEngineStep2SelectedResultProjection,
  buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard,
  invokeSelectorReadonlyEngineStep1WithHostLocalReadonlySeam,
} from "../packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js";

function stage3Summary(overrides = {}) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    factoryApprovedInputsReady: true,
    stage2Ready: true,
    readonlyEngineCandidateInputsReady: true,
    readonlyEngineCandidateInputsBlocker: null,
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
      sourceAuthority: "committed selector state only: manualConstraints or acceptedDefaults",
      runQuantity: 2,
      runLengthMm: 3500,
      
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

function constraints({
  includeTier = false,
  includeAmbient = true,
  ambientValue = "25C",
  ambientLabel = "25°C",
  ambientCommitted = true,
  ambientBlocked = false,
  duplicateAmbient = false,
} = {}) {
  const ambientRows = includeAmbient ? [
    {
      fieldKey: "ambient",
      value: ambientValue,
      valueLabel: ambientLabel,
      committedSelectorState: ambientCommitted,
      blocked: ambientBlocked,
      authoritySource: "manualConstraints",
    },
    duplicateAmbient ? {
      fieldKey: "ambient",
      value: ambientValue,
      valueLabel: ambientLabel,
      committedSelectorState: true,
      blocked: false,
      authoritySource: "manualConstraints",
    } : null,
  ].filter(Boolean) : [];
  return [
    includeTier ? { fieldKey: "tier", value: "Stale Browser Tier", valueLabel: "Stale Browser Tier", committedSelectorState: true, authoritySource: "acceptedDefaults" } : null,
    ...ambientRows,
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
    ambientIntent: {
      ready: true,
      valueLabel: "25°C",
      sourceBacked: true,
      optionCount: 3,
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

test("maps Stage 3 supported selector state without carrying client Tier authority", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary(),
    committedSelectorConstraints: constraints({ includeTier: true }),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
  });

  assert.equal(result.ok, true);
  assert.equal(Object.prototype.hasOwnProperty.call(result.candidate, "tier"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.candidate, "tier_strategy"), false);
  assert.equal(result.summary.candidateShapeSummary.clientTierPresent, false);
  assert.equal(result.summary.candidateShapeSummary.tierBindingOwner, "server-owned-engine-lex-boundary");
  assert.equal(result.summary.requiredFields.includes("tier"), false);
  assert.equal(result.candidate.runs[0].run_length_mm, 3500);
  assert.equal(result.candidate.runs[0].qty, 2);
  assert.equal(result.candidate.lighting.target_lm_per_m, "1200");
  assert.equal(result.candidate.lighting.lm_per_m, "1200");
  assert.equal(result.candidate.lighting.cct, "4000");
  assert.equal(result.candidate.lighting.cri, "90");
  assert.equal(result.candidate.lighting.optic_key, "Inlay");
  assert.equal(result.candidate.optic.key, "Inlay");
  assert.equal(result.candidate.control_type, "DALI-2");
  assert.equal(result.candidate.selectedRoomTaC, 25);
  assert.equal(result.summary.requiredFields.includes("selectedRoomTaC"), true);
  assert.equal(result.summary.candidateShapeSummary.selectedRoomTaCPresent, true);
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

test("maps 35°C as selected room temperature without deriving thermal output", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary(),
    committedSelectorConstraints: constraints({ ambientValue: "35C", ambientLabel: "35°C" }),
    lmTemperatureReadinessPreview: lmTemperaturePreview({
      ambientIntent: { ready: true, valueLabel: "35°C", sourceBacked: true, optionCount: 3 },
    }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.candidate.selectedRoomTaC, 35);
  for (const forbidden of [
    "referenceRoomTaC",
    "referenceInternalTaC",
    "opticThermalRiseTaC",
    "opticInternalDeltaTaC",
    "derivedInternalTaC",
    "curveLookupTaC",
    "boardTemperatureTaC",
    "verifiedLmPerM",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(result.candidate, forbidden), false, forbidden);
    assert.equal(Object.prototype.hasOwnProperty.call(result.candidate.lighting, forbidden), false, forbidden);
  }
});

test("maps the direct-only readonly candidate when full Stage 2 and factory readiness remain blocked", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary({
      factoryApprovedInputsReady: false,
      stage2Ready: false,
      blocker: "Mounting and finishes missing from full spec gate",
      readonlyEngineCandidateInputsReady: true,
      readonlyEngineCandidateInputsBlocker: null,
    }),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
  });

  assert.equal(result.ok, true);
  assert.equal(result.candidate.control_type, "DALI-2");
  assert.equal(result.candidate.lighting.control_type, "DALI-2");
  assert.equal(result.summary.readonlyEngineCandidateMapperReady, true);
});

test("fails closed when dedicated readonly candidate inputs are not ready", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary({
      readonlyEngineCandidateInputsReady: false,
      readonlyEngineCandidateInputsBlocker: "missing-readonly-engine-candidate-input-controlType",
    }),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
  });

  assert.equal(result.ok, false);
  assert.equal(result.candidate, null);
  assert.equal(result.summary.readonlyEngineCandidateMapperReady, false);
  assert.equal(result.summary.blocker, "missing-readonly-engine-candidate-input-controlType");
  assert.equal(result.summary.candidatePayloadReturned, false);
});

test("fails closed when committed Control is not backed by the source-valid control preview", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary(),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview({
      controlIntent: {
        direct: { ready: true, valueLabel: "DALI-2", sourceBacked: false },
      },
    }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.candidate, null);
  assert.equal(result.summary.blocker, "missing-candidate-field-control_type");
  assert.ok(result.summary.fieldStatus.some((row) => row.field === "control_type" && row.present === false));
});

test("direct-only readonly mapping requires room Ambient but no indirect light/control inputs", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary({
      stage2Ready: false,
      factoryApprovedInputsReady: false,
      blocker: "Mounting and finishes missing from full spec gate",
      readonlyEngineCandidateInputsReady: true,
    }),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview({
      targetIntent: { direct: { ready: true, valueLabel: "1200", intentOnly: true } },
      cctCriPairing: { direct: { ready: true, valueLabel: "4000K / CRI90", boardBacked: true } },
      controlIntent: { direct: { ready: true, valueLabel: "DALI-2", sourceBacked: true } },
    }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.candidate.control_type, "DALI-2");
  assert.equal(result.candidate.selectedRoomTaC, 25);
  assert.equal(Object.prototype.hasOwnProperty.call(result.candidate.lighting, "target_lm_per_m_indirect"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.candidate.lighting, "control_type_indirect"), false);
});

test("fails closed for missing, malformed, duplicate, uncommitted, blocked, non-source-backed, or conflicting Ambient", () => {
  const cases = [
    {
      reason: "ambient-selection-missing",
      constraints: constraints({ includeAmbient: false }),
      preview: lmTemperaturePreview(),
    },
    {
      reason: "ambient-selection-malformed",
      constraints: constraints({ ambientValue: "warm", ambientLabel: "warm" }),
      preview: lmTemperaturePreview({
        ambientIntent: { ready: true, valueLabel: "warm", sourceBacked: true, optionCount: 3 },
      }),
    },
    {
      reason: "ambient-selection-duplicate",
      constraints: constraints({ duplicateAmbient: true }),
      preview: lmTemperaturePreview(),
    },
    {
      reason: "ambient-selection-not-committed",
      constraints: constraints({ ambientCommitted: false }),
      preview: lmTemperaturePreview(),
    },
    {
      reason: "ambient-selection-blocked",
      constraints: constraints({ ambientBlocked: true }),
      preview: lmTemperaturePreview(),
    },
    {
      reason: "ambient-selection-not-source-backed",
      constraints: constraints(),
      preview: lmTemperaturePreview({
        ambientIntent: { ready: true, valueLabel: "25°C", sourceBacked: false, optionCount: 3 },
      }),
    },
    {
      reason: "ambient-selection-conflict",
      constraints: constraints(),
      preview: lmTemperaturePreview({
        ambientIntent: { ready: true, valueLabel: "35°C", sourceBacked: true, optionCount: 3 },
      }),
    },
  ];

  for (const item of cases) {
    const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
      factoryApprovedInputsSummary: stage3Summary(),
      committedSelectorConstraints: item.constraints,
      lmTemperatureReadinessPreview: item.preview,
    });
    assert.equal(result.ok, false, item.reason);
    assert.equal(result.candidate, null, item.reason);
    assert.equal(result.summary.blocker, "missing-candidate-field-selectedRoomTaC", item.reason);
    assert.ok(
      result.summary.fieldStatus.some((row) => row.field === "selectedRoomTaC" && row.reason === item.reason),
      item.reason,
    );
  }
});

test("accepts the readonly candidate when Tier is absent from committed Selector state", () => {
  const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3Summary({
      readonlyEngineCandidateInputsReady: true,
      readonlyEngineCandidateInputsBlocker: null,
    }),
    committedSelectorConstraints: constraints(),
    lmTemperatureReadinessPreview: lmTemperaturePreview(),
  });

  assert.equal(result.ok, true);
  assert.equal(Object.prototype.hasOwnProperty.call(result.candidate, "tier"), false);
  assert.equal(result.summary.requiredFields.includes("tier"), false);
  assert.equal(result.summary.rawEnginePayloadReturned, false);
});

test("fails closed for every remaining required readonly candidate input", () => {
  const cases = [
    {
      blocker: "missing-candidate-field-runs",
      factory: stage3Summary({
        committedRunIntakeSummary: {
          ready: false,
          committedRunIntakeReady: false,
          sourceAuthority: "committed selector state only",
          runQuantity: 0,
          runLengthMm: 0,
          
        },
      }),
      constraints: constraints(),
      preview: lmTemperaturePreview(),
    },
    {
      blocker: "missing-candidate-field-lighting",
      factory: stage3Summary(),
      constraints: [],
      preview: lmTemperaturePreview({
        targetIntent: { direct: { ready: false, valueLabel: "" } },
        cctCriPairing: { direct: { ready: false, valueLabel: "" } },
        controlIntent: { direct: { ready: false, valueLabel: "", sourceBacked: false } },
      }),
    },
    {
      blocker: "missing-candidate-field-target_lm_per_m",
      factory: stage3Summary(),
      constraints: constraints().filter((row) => row.fieldKey !== "targetLmPerM"),
      preview: lmTemperaturePreview({ targetIntent: { direct: { ready: false, valueLabel: "" } } }),
    },
    {
      blocker: "missing-candidate-field-cct",
      factory: stage3Summary(),
      constraints: constraints().filter((row) => row.fieldKey !== "cctCri"),
      preview: lmTemperaturePreview({ cctCriPairing: { direct: { ready: false, valueLabel: "CRI90" } } }),
    },
    {
      blocker: "missing-candidate-field-cri",
      factory: stage3Summary(),
      constraints: constraints().filter((row) => row.fieldKey !== "cctCri"),
      preview: lmTemperaturePreview({ cctCriPairing: { direct: { ready: false, valueLabel: "4000K" } } }),
    },
    {
      blocker: "missing-candidate-field-optic",
      factory: stage3Summary(),
      constraints: constraints().filter((row) => row.fieldKey !== "directOpticVar1"),
      preview: lmTemperaturePreview(),
    },
    {
      blocker: "missing-candidate-field-control_type",
      factory: stage3Summary(),
      constraints: constraints().filter((row) => row.fieldKey !== "controlType"),
      preview: lmTemperaturePreview({
        controlIntent: { direct: { ready: false, valueLabel: "", sourceBacked: false } },
      }),
    },
  ];

  for (const item of cases) {
    const result = buildSelectorReadonlyEngineCandidateForInternalSeam({
      factoryApprovedInputsSummary: item.factory,
      committedSelectorConstraints: item.constraints,
      lmTemperatureReadinessPreview: item.preview,
    });
    assert.equal(result.ok, false, item.blocker);
    assert.equal(result.candidate, null, item.blocker);
    assert.equal(result.summary.blocker, item.blocker);
  }
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
  assert.equal(Object.prototype.hasOwnProperty.call(received.selectorPayload, "tier"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(received.selectorPayload, "tier_strategy"), false);
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

test("projects an allowlisted seam failure code without exposing blocker detail", () => {
  const mapperResult = goodMapperResult();
  const summary = buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult,
    seamResult: {
      ok: false,
      seam: "engine-runtable-internal-readonly-invoke",
      seam_version: "engine_runtable_internal_readonly_invoke.v1",
      engine_execution_attempted: true,
      engine_result_produced: false,
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
        success: false,
        run_count: 0,
        error_count: 1,
        warning_count: 0,
      },
      blockers: [{
        code: "direct-run-engine-no-success",
        detail: "C:\\private\\RuntimeData\\donor-error.txt",
      }],
    },
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.readonlyEngineStep1Ready, false);
  assert.equal(summary.blocker, "direct-run-engine-no-success");
  assert.equal(JSON.stringify(summary).includes("donor-error.txt"), false);
});

test("projects source-backed Tier derivation blockers without exposing source detail", () => {
  const mapperResult = goodMapperResult();
  for (const code of [
    "selected-project-source-backed-tier-derivation-unavailable",
    "selected-project-source-backed-tier-derivation-ambiguous",
  ]) {
    const summary = buildSelectorReadonlyEngineStep1SafeSummary({
      mapperResult,
      seamResult: {
        ok: false,
        seam: "engine-runtable-internal-readonly-invoke",
        seam_version: "engine_runtable_internal_readonly_invoke.v1",
        engine_execution_attempted: false,
        engine_result_produced: false,
        public_route_added: false,
        post_endpoint_added: false,
        runtime_data_mutation_enabled: false,
        selected_result_persistence_enabled: false,
        raw_rows_exposed: false,
        raw_engine_payload_exposed: false,
        raw_engine_result_returned: false,
        private_paths_exposed: false,
        credentials_exposed: false,
        safe_engine_summary: null,
        blockers: [{ code, detail: "C:\\private\\source-tier.json" }],
      },
    });
    assert.equal(summary.blocker, code);
    assert.equal(summary.hostLocalReadonlyEngineSeamInvoked, false);
    assert.equal(JSON.stringify(summary).includes("source-tier.json"), false);
  }
});

test("retains the generic seam failure blocker when no safe recognized cause exists", () => {
  const mapperResult = goodMapperResult();
  const summary = buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult,
    seamResult: {
      ok: false,
      seam: "engine-runtable-internal-readonly-invoke",
      seam_version: "engine_runtable_internal_readonly_invoke.v1",
      engine_execution_attempted: true,
      engine_result_produced: false,
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
        success: false,
        run_count: 0,
        error_count: 1,
        warning_count: 0,
      },
      blockers: [{ code: "unrecognized-private-donor-failure" }],
    },
  });

  assert.equal(summary.blocker, "readonly-engine-seam-did-not-produce-success");
  assert.equal(JSON.stringify(summary).includes("unrecognized-private-donor-failure"), false);
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

test("Stage 4 Step 3 distinguishes readonly summary-only authority without enabling outputs", () => {
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
      },
    },
  });
  const step2 = buildSelectorReadonlyEngineStep2SelectedResultProjection({
    readonlyEngineStep1SafeSummary: step1,
  });
  const step3 = buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard({
    readonlyEngineStep2SelectedResultSummary: step2,
  });

  assert.equal(step3.ok, true);
  assert.equal(step3.readonlyEngineStep3Ready, false);
  assert.equal(step3.selectedResultAuthorityGuardReady, true);
  assert.equal(step3.selectedResultAuthorityState, "readonly_engine_summary_only");
  assert.equal(step3.stale, false);
  assert.equal(step3.failClosed, true);
  assert.equal(step3.authorityGuardSummary.state, "readonly_engine_summary_only");
  assert.equal(step3.authorityGuardSummary.selectedResultPersistenceEnabled, false);
  assert.equal(step3.authorityGuardSummary.runTableGenerationEnabled, false);
  assert.equal(step3.authorityGuardSummary.iesGenerationEnabled, false);
  assert.equal(step3.authorityGuardSummary.outputGenerationEnabled, false);
  assert.equal(step3.selectedResultPersisted, false);
  assert.equal(step3.runTableGenerated, false);
  assert.equal(step3.iesGenerated, false);
  assert.equal(step3.routesAdded, false);
  assert.equal(step3.postEndpointsAdded, false);
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