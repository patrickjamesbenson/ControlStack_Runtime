import test from "node:test";
import assert from "node:assert/strict";

import {
  SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID,
  buildSafeEngineRunTableSelectedResultSourceObject,
} from "../packages/workspace-kernel/engineRunTableSafeSelectedResultSourceObject.js";
import {
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runtimeThermalLumenExecution.js";
import {
  ENGINE_SELECTED_RESULT_RUN_SCHEMA_ID,
  ENGINE_SELECTED_RESULT_RUN_SCHEMA_VERSION,
  ENGINE_SELECTED_RESULT_SCHEMA_ID,
  ENGINE_SELECTED_RESULT_SCHEMA_VERSION,
  ENGINE_SELECTED_RESULT_STATES,
  buildRuntimeEngineSelectedResultContractV1,
} from "../packages/workspace-kernel/runtimeEngineSelectedResultContractV1.js";

function safeSourceInput(overrides = {}) {
  const base = {
    ok: true,
    engine_result_produced: true,
    safe_engine_summary: {
      success: true,
      selected_tier: "balanced",
      run_count: 1,
      runs: [
        {
          index: 0,
          has_body_requested: true,
          boards_count: 4,
          segments_count: 1,
          zone_count: 2,
          clip_points_count: 5,
          suspension_points_count: 3,
          gear_tray_plan_count: 1,
          reserved_ranges_count: 0,
          raw_run_returned: false,
        },
      ],
      raw_result_returned: false,
      raw_debug_returned: false,
      raw_rough_electrical_payload_returned: false,
    },
    source_summary: {
      ok: true,
      active_source_db_loaded_read_only: true,
      source_fingerprint_available: true,
      present_tables: ["BOARDS", "OPTICS", "DRIVERS", "SYSTEM_POLICY"],
      missing_tables: [],
      source: {
        label: "runtime-authority-reference-active-snapshot",
        source_fingerprint: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        path_returned: false,
        local_path_exposure_enabled: false,
      },
      raw_rows_exposed: false,
      raw_headers_exposed: false,
      raw_users_exposed: false,
      raw_snapshot_returned: false,
    },
    redacted_metadata: {
      controlled_geometry: {
        classification: "controlled-test-geometry",
        length_class: "safe-length-band",
        length_mm: 5600,
        qty: 1,
        requested_length_basis: "cut_to_length",
        length_policy_source: "system_policy",
        accessory_length_policy_source: "system_policy",
        not_product_data: true,
        not_source_backed_board_data: true,
        raw_payload_returned: false,
      },
      tier_strategy: {
        classification: "engine-derived-profile",
        tier_strategy_mode: "derived",
        top_level_tier_passed: false,
        tier_strategy_selected_tier_passed: false,
        tier_strategy_candidate_tiers_passed: false,
        raw_payload_returned: false,
      },
      field_source_map: [
        {
          field: "target_lm_per_m",
          present: true,
          classification: "controlled-selector-intent",
          raw_row_returned: false,
          raw_value_returned: false,
        },
        {
          field: "optic",
          present: true,
          classification: "source-backed-required",
          raw_row_returned: false,
          raw_value_returned: false,
        },
      ],
    },
    sourceVersionMarker: "runtime-active-source-safe-v1",
  };
  return {
    ...base,
    ...overrides,
    safe_engine_summary: overrides.safe_engine_summary ?? base.safe_engine_summary,
    source_summary: overrides.source_summary ?? base.source_summary,
    redacted_metadata: overrides.redacted_metadata ?? base.redacted_metadata,
  };
}

function acceptedSource() {
  return buildSafeEngineRunTableSelectedResultSourceObject(safeSourceInput());
}

function thermalResultSafetyFlags() {
  return {
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerated: false,
    rawCurveRowsReturned: false,
    rawCurvePayloadReturned: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
  };
}

function acceptedThermal(overrides = {}) {
  const result = {
    schemaId: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
    schemaVersion: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
    selectedOpticKey: "Inlay",
    opticBomId: "OPTIC-BOM-80-INLAY",
    sourceRevision: "runtime-active-source-safe-v1",
    evidenceRef: "NVB-HOT-TEST-80-INLAY",
    programValidationState: "accepted_for_engine_thermal_lookup",
    selectedRoomTaC: 25,
    referenceRoomTaC: 25,
    referenceInternalTaC: 35,
    opticThermalRiseTaC: 10,
    derivedInternalTaC: 35,
    curveLookupTaC: 35,
    effectiveCurveTaC: 35,
    temperatureMode: "interpolated",
    requestedCurrentMa: 150,
    currentMode: "interpolated",
    verifiedLmPerM: 1350,
    curveFilename: "safe-thermal-curve.csv",
    curveChecksumVerified: true,
    opticRiseAppliedCount: 1,
    readOnly: true,
    safetyFlags: thermalResultSafetyFlags(),
    ...overrides,
  };
  const summary = {
    schemaId: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
    schemaVersion: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
    state: "runtime_thermal_lumen_execution_complete",
    blocker: null,
    selectedOpticKey: result.selectedOpticKey,
    opticBomId: result.opticBomId,
    curveLookupTaC: result.curveLookupTaC,
    effectiveCurveTaC: result.effectiveCurveTaC,
    temperatureMode: result.temperatureMode,
    currentMode: result.currentMode,
    verifiedLmPerM: result.verifiedLmPerM,
    opticRiseAppliedCount: 1,
    curveParserInvoked: true,
    readOnly: true,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerated: false,
    rawCurveRowsReturned: false,
    rawCurvePayloadReturned: false,
  };
  return { ok: true, result, summary };
}

function build(overrides = {}) {
  return buildRuntimeEngineSelectedResultContractV1({
    safeSelectedResultSourceObject:
      overrides.safeSelectedResultSourceObject ?? acceptedSource(),
    thermalExecution: overrides.thermalExecution ?? acceptedThermal(),
    ...(Object.prototype.hasOwnProperty.call(overrides, "traceabilityEnvelope")
      ? { traceabilityEnvelope: overrides.traceabilityEnvelope }
      : {}),
  });
}

function assertBlocked(result, blocker) {
  assert.equal(result.schemaId, ENGINE_SELECTED_RESULT_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_SELECTED_RESULT_SCHEMA_VERSION);
  assert.equal(result.state, ENGINE_SELECTED_RESULT_STATES.blockedFailClosed);
  assert.equal(result.accepted, false);
  assert.equal(result.failClosed, true);
  assert.equal(result.resultId, null);
  assert.equal(result.selectedResult, null);
  assert.deepEqual(result.runs, []);
  assert.equal(result.runCount, 0);
  assert.deepEqual(result.blockers, [blocker]);
  assert.equal(result.readOnly, true);
  assert.equal(result.nonPersistent, true);
  assert.equal(result.safetyFlags.selectedResultPersisted, false);
  assert.equal(result.safetyFlags.runtimeDataMutated, false);
  assert.equal(result.safetyFlags.outputArtifactGenerated, false);
}

test("seals one exact immutable selected-result envelope without recalculation", () => {
  const source = acceptedSource();
  const thermal = acceptedThermal();
  const output = build({
    safeSelectedResultSourceObject: source,
    thermalExecution: thermal,
  });

  assert.equal(source.schemaId, SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID);
  assert.equal(output.schemaId, ENGINE_SELECTED_RESULT_SCHEMA_ID);
  assert.equal(output.schemaVersion, ENGINE_SELECTED_RESULT_SCHEMA_VERSION);
  assert.equal(output.state, ENGINE_SELECTED_RESULT_STATES.accepted);
  assert.equal(output.accepted, true);
  assert.equal(output.failClosed, false);
  assert.match(output.resultId, /^engine-selected-result-v1:[0-9a-f]{40}$/);
  assert.deepEqual(Object.keys(output).sort(), [
    "schemaId",
    "schemaVersion",
    "state",
    "accepted",
    "failClosed",
    "resultId",
    "sourceIdentity",
    "technicalProvenance",
    "selectedResult",
    "runs",
    "runCount",
    "blockers",
    "warnings",
    "readOnly",
    "nonPersistent",
    "stabilityState",
    "safetyFlags",
  ].sort());
  assert.deepEqual(output.selectedResult, thermal.result);
  assert.equal(output.selectedResult.selectedRoomTaC, 25);
  assert.equal(output.selectedResult.opticThermalRiseTaC, 10);
  assert.equal(output.selectedResult.derivedInternalTaC, 35);
  assert.equal(output.selectedResult.curveLookupTaC, 35);
  assert.equal(output.selectedResult.verifiedLmPerM, 1350);
  assert.equal(output.safetyFlags.thermalRecalculated, false);
  assert.equal(output.stabilityState, "producer_contract_only_not_stable");
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.selectedResult), true);
  assert.equal(Object.isFrozen(output.runs), true);
  assert.throws(() => {
    output.selectedResult.verifiedLmPerM = 1;
  }, TypeError);
});

test("emits deterministic non-persistent safe per-run rows", () => {
  const output = build();

  assert.equal(output.runCount, 1);
  assert.equal(output.runs.length, 1);
  const row = output.runs[0];
  assert.equal(row.schemaId, ENGINE_SELECTED_RESULT_RUN_SCHEMA_ID);
  assert.equal(row.schemaVersion, ENGINE_SELECTED_RESULT_RUN_SCHEMA_VERSION);
  assert.match(row.rowKey, /^engine-selected-result-run:[0-9a-f]{40}$/);
  assert.equal(row.runKey, "safe-engine-run-1");
  assert.equal(row.runIndex, 0);
  assert.equal(row.rowOrdinal, 1);
  assert.equal(row.accepted, true);
  assert.equal(row.engineVerified, true);
  assert.equal(row.safeSummaryOnly, true);
  assert.equal(row.boardCount, 4);
  assert.equal(row.segmentCount, 1);
  assert.equal(row.zoneCount, 2);
  assert.equal(row.clipPointsCount, 5);
  assert.equal(row.suspensionPointsCount, 3);
  assert.equal(row.gearTrayPlanCount, 1);
  assert.equal(row.reservedRangesCount, 0);
  assert.equal(row.rawRunReturned, false);
  assert.equal(output.nonPersistent, true);
  assert.equal(output.safetyFlags.runTablePersisted, false);
});

test("requires exact source identity and revision agreement", () => {
  const mismatch = build({
    thermalExecution: acceptedThermal({ sourceRevision: "other-source-v1" }),
  });
  assertBlocked(mismatch, "source-revision-mismatch");

  const overRichSource = { ...acceptedSource(), extra: true };
  assertBlocked(
    build({ safeSelectedResultSourceObject: overRichSource }),
    "safe-source-invalid-shape",
  );
});

test("different governance envelopes produce identical complete output", () => {
  const left = build({
    traceabilityEnvelope: {
      user: "user-a",
      project: "project-a",
      owner: "owner-a",
      timeline: "2026",
      registrationState: "registered",
    },
  });
  const right = build({
    traceabilityEnvelope: {
      user: "user-b",
      project: "project-z",
      owner: "owner-z",
      timeline: "2032",
      registrationState: "blocked",
      activeRevision: null,
      renamedEligibilityGate: false,
      verifiedLmPerM: 999999,
    },
  });

  assert.equal(left.accepted, true);
  assert.deepEqual(left, right);
  const text = JSON.stringify(left);
  for (const marker of ["user-a", "project-a", "owner-a", "registered"]) {
    assert.equal(text.includes(marker), false, marker);
  }
});

test("fails closed for malformed, unaccepted and unsafe source input", () => {
  assertBlocked(
    buildRuntimeEngineSelectedResultContractV1({}),
    "invalid-input-shape",
  );

  const unaccepted = { ...acceptedSource(), accepted: false };
  assertBlocked(
    build({ safeSelectedResultSourceObject: unaccepted }),
    "safe-source-not-accepted",
  );

  const unsafe = acceptedSource();
  unsafe.safetyFlags = { ...unsafe.safetyFlags, runtimeDataMutated: true };
  assertBlocked(
    build({ safeSelectedResultSourceObject: unsafe }),
    "unsafe-true-flag-runtimeDataMutated",
  );
});

test("fails closed for malformed, contradictory and over-rich thermal input", () => {
  const contradictory = acceptedThermal({ derivedInternalTaC: 36 });
  contradictory.summary.curveLookupTaC = 36;
  assertBlocked(
    build({ thermalExecution: contradictory }),
    "thermal-result-contradictory",
  );

  const unaccepted = acceptedThermal();
  unaccepted.summary.state = "runtime_thermal_lumen_execution_blocked";
  assertBlocked(
    build({ thermalExecution: unaccepted }),
    "thermal-result-not-accepted",
  );

  const overRich = acceptedThermal();
  overRich.result.extra = true;
  assertBlocked(
    build({ thermalExecution: overRich }),
    "thermal-result-invalid-shape",
  );
});

test("accepted and blocked outputs remain deterministic and expose no raw content", () => {
  const first = build();
  const second = build();
  assert.deepEqual(first, second);

  const blockedFirst = build({
    thermalExecution: acceptedThermal({ sourceRevision: "mismatch" }),
  });
  const blockedSecond = build({
    thermalExecution: acceptedThermal({ sourceRevision: "mismatch" }),
  });
  assert.deepEqual(blockedFirst, blockedSecond);

  const text = JSON.stringify(first);
  for (const forbidden of [
    "selector_payload",
    "rawEnginePayload",
    "rawRunTableRows",
    "TILT=NONE",
    "data:application",
    "C:\\\\Users\\\\",
    "file:",
  ]) {
    assert.equal(text.includes(forbidden), false, forbidden);
  }
  for (const value of [
    first.safetyFlags.donorEngineInvoked,
    first.safetyFlags.curveParserInvoked,
    first.safetyFlags.thermalRecalculated,
    first.safetyFlags.selectedResultPersisted,
    first.safetyFlags.runtimeDataMutated,
    first.safetyFlags.runTablePersisted,
    first.safetyFlags.iesGenerated,
    first.safetyFlags.outputArtifactGenerated,
    first.safetyFlags.publicRouteAdded,
    first.safetyFlags.postEndpointAdded,
    first.safetyFlags.rawPayloadReturned,
    first.safetyFlags.rawSourceRowsReturned,
    first.safetyFlags.privatePathsReturned,
  ]) assert.equal(value, false);
});
