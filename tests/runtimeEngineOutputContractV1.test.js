import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildSafeEngineRunTableSelectedResultSourceObject,
} from "../packages/workspace-kernel/engineRunTableSafeSelectedResultSourceObject.js";
import {
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runtimeThermalLumenExecution.js";
import {
  buildRuntimeEngineSelectedResultContractV1,
} from "../packages/workspace-kernel/runtimeEngineSelectedResultContractV1.js";
import {
  ENGINE_OUTPUT_SCHEMA_ID,
  ENGINE_OUTPUT_SCHEMA_VERSION,
  ENGINE_OUTPUT_STATES,
  ENGINE_RUNTABLE_ROW_FIELD_SET,
  ENGINE_RUNTABLE_ROW_SCHEMA_ID,
  ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
  ENGINE_SELECTION_SET_SCHEMA_ID,
  ENGINE_SELECTION_SET_SCHEMA_VERSION,
  buildRuntimeEngineOutputContractV1,
  createEngineSelectionSetRequestV1,
  validateEngineSelectionSetV1,
} from "../packages/workspace-kernel/runtimeEngineOutputContractV1.js";

const moduleUrl = new URL(
  "../packages/workspace-kernel/runtimeEngineOutputContractV1.js",
  import.meta.url,
);

function safeSourceInput({ counts = {}, sourceVersionMarker = "runtime-active-source-safe-v1" } = {}) {
  return {
    ok: true,
    engine_result_produced: true,
    safe_engine_summary: {
      success: true,
      selected_tier: "balanced",
      run_count: 1,
      runs: [{
        index: 0,
        has_body_requested: true,
        boards_count: counts.boardCount ?? 4,
        segments_count: counts.segmentCount ?? 1,
        zone_count: counts.zoneCount ?? 2,
        clip_points_count: counts.clipPointsCount ?? 5,
        suspension_points_count: counts.suspensionPointsCount ?? 3,
        gear_tray_plan_count: counts.gearTrayPlanCount ?? 1,
        reserved_ranges_count: counts.reservedRangesCount ?? 0,
        raw_run_returned: false,
      }],
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
      field_source_map: [{
        field: "optic",
        present: true,
        classification: "source-backed-required",
        raw_row_returned: false,
        raw_value_returned: false,
      }],
    },
    sourceVersionMarker,
  };
}

function thermalExecution({
  sourceRevision = "runtime-active-source-safe-v1",
  verifiedLmPerM = 1350,
  evidenceRef = "NVB-HOT-TEST-80-INLAY",
} = {}) {
  const result = {
    schemaId: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
    schemaVersion: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
    selectedOpticKey: "Inlay",
    opticBomId: "OPTIC-BOM-80-INLAY",
    sourceRevision,
    evidenceRef,
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
    verifiedLmPerM,
    curveFilename: "safe-thermal-curve.csv",
    curveChecksumVerified: true,
    opticRiseAppliedCount: 1,
    readOnly: true,
    safetyFlags: {
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
    },
  };
  return {
    ok: true,
    result,
    summary: {
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
    },
  };
}

function internalSelectedResult({
  counts = {},
  verifiedLmPerM = 1350,
  evidenceRef = "NVB-HOT-TEST-80-INLAY",
} = {}) {
  const source = buildSafeEngineRunTableSelectedResultSourceObject(
    safeSourceInput({ counts }),
  );
  return buildRuntimeEngineSelectedResultContractV1({
    safeSelectedResultSourceObject: source,
    thermalExecution: thermalExecution({ verifiedLmPerM, evidenceRef }),
  });
}

function engineeringSelections(overrides = {}) {
  return {
    product: { system: "DNX 80", optic: "Inlay" },
    lighting: { targetLmPerM: 1200, roomAmbientTaC: 25 },
    runs: [{ qty: 1, lengthMm: 5600 }],
    control: { protocol: "DALI-2" },
    ...overrides,
  };
}

function acceptedRequest(overrides = {}) {
  const created = createEngineSelectionSetRequestV1(engineeringSelections(overrides));
  assert.equal(created.ok, true, created.blocker);
  return created.request;
}

function build(overrides = {}) {
  const internal = overrides.internalSelectedResult ?? internalSelectedResult();
  return buildRuntimeEngineOutputContractV1({
    selectionRequest: overrides.selectionRequest ?? acceptedRequest(),
    internalSelectedResult: internal,
    policyFingerprint: overrides.policyFingerprint ?? "engine-policy-v1:0123456789abcdef",
    ...(Object.prototype.hasOwnProperty.call(overrides, "evidenceFingerprints")
      ? { evidenceFingerprints: overrides.evidenceFingerprints }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(overrides, "traceabilityEnvelope")
      ? { traceabilityEnvelope: overrides.traceabilityEnvelope }
      : {}),
  });
}

function assertBlocked(output, blocker) {
  assert.equal(output.schemaId, ENGINE_OUTPUT_SCHEMA_ID);
  assert.equal(output.schemaVersion, ENGINE_OUTPUT_SCHEMA_VERSION);
  assert.equal(output.state, ENGINE_OUTPUT_STATES.blockedFailClosed);
  assert.equal(output.resultId, null);
  assert.equal(output.selectedResult, null);
  assert.equal(output.runTable, null);
  assert.deepEqual(output.blockers, [blocker]);
  assert.equal(output.safetyFlags.selectedResultPersisted, false);
  assert.equal(output.safetyFlags.productionRunTableGenerated, false);
  assert.equal(output.safetyFlags.downstreamActivated, false);
}

test("creates one exact deterministic selections-only request", () => {
  const created = createEngineSelectionSetRequestV1(engineeringSelections());
  assert.equal(created.ok, true);
  assert.equal(created.request.schemaId, ENGINE_SELECTION_SET_SCHEMA_ID);
  assert.equal(created.request.schemaVersion, ENGINE_SELECTION_SET_SCHEMA_VERSION);
  assert.match(created.request.requestFingerprint, /^engine-selection-set-v1:[0-9a-f]{40}$/);
  assert.deepEqual(Object.keys(created.request).sort(), [
    "schemaId",
    "schemaVersion",
    "selectionSet",
    "requestFingerprint",
  ].sort());
  assert.equal(Object.isFrozen(created), true);
  assert.equal(Object.isFrozen(created.request), true);
  assert.equal(Object.isFrozen(created.request.selectionSet), true);
});

test("validates the exact versioned selection-set draft shape", () => {
  const validated = validateEngineSelectionSetV1({
    schemaId: ENGINE_SELECTION_SET_SCHEMA_ID,
    schemaVersion: ENGINE_SELECTION_SET_SCHEMA_VERSION,
    selectionSet: engineeringSelections(),
  });
  assert.equal(validated.ok, true);
  assert.equal(validated.request.schemaId, ENGINE_SELECTION_SET_SCHEMA_ID);
  assert.match(validated.request.requestFingerprint, /^engine-selection-set-v1:[0-9a-f]{40}$/);

  const unsupported = validateEngineSelectionSetV1({
    schemaId: ENGINE_SELECTION_SET_SCHEMA_ID,
    schemaVersion: 2,
    selectionSet: engineeringSelections(),
  });
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.blocker, "selection-request-schema-unsupported");
});

test("selection creation rejects governance, caller-derived, unsafe and invalid values", () => {
  const cases = [
    [engineeringSelections({ project: "project-alpha" }), "governance-field-rejected-project"],
    [engineeringSelections({ tier: "business" }), "caller-derived-field-rejected-tier"],
    [engineeringSelections({ derivedInternalTaC: 35 }), "caller-derived-field-rejected-derivedinternaltac"],
    [engineeringSelections({ selectedResult: {} }), "caller-derived-field-rejected-selectedresult"],
    [engineeringSelections({ note: "C:\\Users\\private" }), "selection-text-invalid"],
    [engineeringSelections({ lighting: { targetLmPerM: Infinity } }), "selection-number-invalid"],
  ];
  for (const [selectionSet, blocker] of cases) {
    const created = createEngineSelectionSetRequestV1(selectionSet);
    assert.equal(created.ok, false, blocker);
    assert.equal(created.request, null);
    assert.equal(created.blocker, blocker);
  }
});

test("builds exact complete output and one unambiguous public row shape", () => {
  const output = build();
  assert.equal(output.state, ENGINE_OUTPUT_STATES.complete);
  assert.match(output.resultId, /^engine-output-v1:[0-9a-f]{40}$/);
  assert.match(output.sourceVersionFingerprint, /^engine-source-version-v1:[0-9a-f]{40}$/);
  assert.equal(output.policyFingerprint, "engine-policy-v1:0123456789abcdef");
  assert.equal(output.evidenceFingerprints.length, 1);
  assert.equal(output.selectedResult.accepted, true);
  assert.equal(output.selectedResult.engineVerified, true);
  assert.equal(output.selectedResult.thermal.verifiedLmPerM, 1350);
  assert.equal(output.runTable.rowSchemaId, ENGINE_RUNTABLE_ROW_SCHEMA_ID);
  assert.equal(output.runTable.rowSchemaVersion, ENGINE_RUNTABLE_ROW_SCHEMA_VERSION);
  assert.equal(output.runTable.rowCount, 1);
  assert.equal(output.runTable.rows.length, 1);
  const row = output.runTable.rows[0];
  assert.deepEqual(Object.keys(row), [...ENGINE_RUNTABLE_ROW_FIELD_SET]);
  assert.equal(row.schemaId, ENGINE_RUNTABLE_ROW_SCHEMA_ID);
  assert.notEqual(row.schemaId, "controlstack.runtime.runtable-first-narrow-row.v1");
  assert.equal(row.resultId, output.resultId);
  assert.equal(row.rawPayloadReturned, false);
  assert.equal(output.replay.outputSchemaId, ENGINE_OUTPUT_SCHEMA_ID);
  assert.equal(output.replay.outputSchemaVersion, ENGINE_OUTPUT_SCHEMA_VERSION);
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.runTable), true);
  assert.equal(Object.isFrozen(row), true);
});

test("valid zero-valued engineering output remains complete", () => {
  const internal = internalSelectedResult({
    counts: {
      boardCount: 0,
      segmentCount: 0,
      zoneCount: 0,
      clipPointsCount: 0,
      suspensionPointsCount: 0,
      gearTrayPlanCount: 0,
      reservedRangesCount: 0,
    },
    verifiedLmPerM: 0,
  });
  const output = build({
    selectionRequest: acceptedRequest({
      lighting: { targetLmPerM: 0, roomAmbientTaC: 0 },
      runs: [{ qty: 0, lengthMm: 0 }],
    }),
    internalSelectedResult: internal,
  });
  assert.equal(output.state, ENGINE_OUTPUT_STATES.complete);
  assert.equal(output.selectedResult.thermal.verifiedLmPerM, 0);
  assert.equal(output.runTable.rows[0].boardCount, 0);
  assert.equal(output.runTable.rows[0].segmentCount, 0);
  assert.equal(output.runTable.rows[0].zoneCount, 0);
});

test("replay is identical across key order and different governance envelopes", () => {
  const leftRequest = acceptedRequest({ environment: { ip: "IP40", ik: "IK08" } });
  const rightCreated = createEngineSelectionSetRequestV1({
    control: { protocol: "DALI-2" },
    runs: [{ lengthMm: 5600, qty: 1 }],
    lighting: { roomAmbientTaC: 25, targetLmPerM: 1200 },
    environment: { ik: "IK08", ip: "IP40" },
    product: { optic: "Inlay", system: "DNX 80" },
  });
  assert.equal(rightCreated.ok, true);
  assert.equal(leftRequest.requestFingerprint, rightCreated.request.requestFingerprint);

  const left = build({
    selectionRequest: leftRequest,
    traceabilityEnvelope: {
      user: "a",
      project: "alpha",
      owner: "one",
      registrationState: "registered",
    },
  });
  const right = build({
    selectionRequest: rightCreated.request,
    traceabilityEnvelope: {
      user: "b",
      project: "omega",
      owner: "two",
      timeline: "2035",
      registrationState: "blocked",
      verifiedLmPerM: 99999,
    },
  });
  assert.deepEqual(left, right);
  const text = JSON.stringify(left);
  for (const marker of ["alpha", "omega", "registered", "blocked"]) {
    assert.equal(text.includes(marker), false, marker);
  }
});

test("unknown, contradictory, mismatched and unsafe inputs fail closed", () => {
  assertBlocked(
    build({ selectionRequest: { ...acceptedRequest(), schemaVersion: 2 } }),
    "selection-request-schema-unsupported",
  );
  assertBlocked(
    build({
      selectionRequest: {
        ...acceptedRequest(),
        requestFingerprint: "engine-selection-set-v1:0000000000000000000000000000000000000000",
      },
    }),
    "selection-request-fingerprint-mismatch",
  );
  assertBlocked(
    build({ internalSelectedResult: { ...internalSelectedResult(), extra: true } }),
    "internal-selected-result-invalid-shape",
  );

  const unsafe = JSON.parse(JSON.stringify(internalSelectedResult()));
  unsafe.safetyFlags.selectedResultPersisted = true;
  assertBlocked(build({ internalSelectedResult: unsafe }), "internal-safety-not-accepted");

  assertBlocked(
    build({ policyFingerprint: "C:\\Users\\private" }),
    "policy-fingerprint-invalid",
  );
  assertBlocked(
    build({ evidenceFingerprints: ["engine-evidence-v1:caller-supplied"] }),
    "engine-output-input-invalid-shape",
  );

  const contradicted = JSON.parse(JSON.stringify(internalSelectedResult()));
  contradicted.technicalProvenance.evidenceRef = "changed-without-new-component-id";
  assertBlocked(
    build({ internalSelectedResult: contradicted }),
    "internal-thermal-provenance-mismatch",
  );

  const fingerprintTampered = JSON.parse(JSON.stringify(internalSelectedResult()));
  fingerprintTampered.resultId = "engine-selected-result-v1:0000000000000000000000000000000000000000";
  assertBlocked(
    build({ internalSelectedResult: fingerprintTampered }),
    "internal-selected-result-fingerprint-mismatch",
  );
});

test("result identity changes only with technical request, source, policy or evidence", () => {
  const baseline = build();
  const requestChanged = build({
    selectionRequest: acceptedRequest({
      lighting: { targetLmPerM: 1300, roomAmbientTaC: 25 },
    }),
  });
  const policyChanged = build({
    policyFingerprint: "engine-policy-v2:fedcba9876543210",
  });
  const evidenceInternal = internalSelectedResult({
    evidenceRef: "NVB-HOT-TEST-80-INLAY-REV2",
  });
  const evidenceChanged = build({
    internalSelectedResult: evidenceInternal,
  });
  assert.notEqual(baseline.resultId, requestChanged.resultId);
  assert.notEqual(baseline.resultId, policyChanged.resultId);
  assert.notEqual(baseline.resultId, evidenceChanged.resultId);
});

test("module remains contract-only with no legacy row dependency", async () => {
  const source = await readFile(moduleUrl, "utf-8");
  assert.equal(source.includes("controlstack.runtime.runtable-first-narrow-row.v1"), false);
  const imports = [...source.matchAll(/^import[\s\S]*?from\s+"([^"]+)";/gm)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(imports, [
    "./runtimeEngineSelectedResultContractV1.js",
    "./stableFingerprint.js",
  ].sort());

  const output = build();
  for (const [key, value] of Object.entries(output.safetyFlags)) {
    if ([
      "readOnly",
      "nonPersistent",
      "governanceEnvelopeIgnored",
      "contractRowsBuilt",
    ].includes(key)) assert.equal(value, true, key);
    else assert.equal(value, false, key);
  }
});