import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID,
  buildSafeEngineRunTableSelectedResultSourceObject,
} from "../packages/workspace-kernel/engineRunTableSafeSelectedResultSourceObject.js";

const serverSourceUrl = new URL("../server.js", import.meta.url);
const builderSourceUrl = new URL("../packages/workspace-kernel/engineRunTableSafeSelectedResultSourceObject.js", import.meta.url);

function successfulSafeInput(overrides = {}) {
  const input = {
    ok: true,
    engine_result_produced: true,
    safe_engine_summary: {
      success: true,
      selected_tier: "business",
      run_count: 1,
      duration_ms: 123,
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
        length_class: "donor-selector-seed-5600mm",
        length_mm: 5600,
        qty: 1,
        
        length_policy_source: "tier_policy",
        accessory_length_policy_source: "tier_policy",
        not_product_data: true,
        not_source_backed_board_data: true,
        raw_payload_returned: false,
      },
      tier_strategy: {
        classification: "source-backed-tier-resolution-shape",
        tier_strategy_mode: "manual",
        top_level_tier_passed: true,
        tier_strategy_selected_tier_passed: true,
        tier_strategy_candidate_tiers_passed: true,
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
          field: "cct",
          present: true,
          classification: "source-backed-required",
          raw_row_returned: false,
          raw_value_returned: false,
        },
        {
          field: "cri",
          present: true,
          classification: "source-backed-required",
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
    ...input,
    ...overrides,
    safe_engine_summary: overrides.safe_engine_summary === undefined
      ? input.safe_engine_summary
      : overrides.safe_engine_summary,
    source_summary: overrides.source_summary === undefined
      ? input.source_summary
      : overrides.source_summary,
    redacted_metadata: overrides.redacted_metadata === undefined
      ? input.redacted_metadata
      : overrides.redacted_metadata,
  };
}

function assertNoUnsafeMarkers(value) {
  const text = JSON.stringify(value);
  for (const marker of [
    "raw-engine-payload-do-not-emit",
    "rough-electrical-payload-do-not-emit",
    "raw-engine-result-do-not-emit",
    "raw-run-table-row-do-not-emit",
    "raw-selected-payload-do-not-emit",
    "raw-db-row-do-not-emit",
    "users-row-do-not-emit",
    "candela-grid-do-not-emit",
    "TILT=NONE",
    "private-proof-do-not-emit.pdf",
    "polar-do-not-emit",
    "private-path-do-not-emit",
  ]) {
    assert.equal(text.includes(marker), false, `${marker} should not be emitted`);
  }
}

function assertSafetyLocked(sourceObject) {
  assert.equal(sourceObject.readOnly, true);
  assert.equal(sourceObject.nonPersistent, true);
  assert.equal(sourceObject.diagnosticOnly, true);
  assert.equal(sourceObject.persistenceStatus.selectedResultPersisted, false);
  assert.equal(sourceObject.persistenceStatus.selectedResultPersistenceEnabled, false);
  assert.equal(sourceObject.persistenceStatus.selectedResultPersistenceAttempted, false);
  assert.equal(sourceObject.safetyFlags.selectedResultPersistenceEnabled, false);
  assert.equal(sourceObject.safetyFlags.selectedResultPersistenceAttempted, false);
  assert.equal(sourceObject.safetyFlags.iesGenerationEnabled, false);
  assert.equal(sourceObject.safetyFlags.iesHandoffEnabled, false);
  assert.equal(sourceObject.safetyFlags.routesAdded, false);
  assert.equal(sourceObject.safetyFlags.postEndpointsAdded, false);
  assert.equal(sourceObject.downstreamReadinessFlags.iesHandoffReady, false);
  assert.equal(sourceObject.downstreamReadinessFlags.iesHandoffBlocked, true);
  assert.equal(sourceObject.downstreamReadinessFlags.selectedResultProjectionReady, false);
  assert.equal(sourceObject.downstreamReadinessFlags.candidateOutputReady, false);
  assert.equal(sourceObject.redactionFlags.rawEnginePayloadExposed, false);
  assert.equal(sourceObject.redactionFlags.rawRoughElectricalPayloadExposed, false);
  assert.equal(sourceObject.redactionFlags.rawEngineDebugExposed, false);
  assert.equal(sourceObject.redactionFlags.rawEngineResultExposed, false);
  assert.equal(sourceObject.redactionFlags.rawRunTableRowsExposed, false);
  assert.equal(sourceObject.redactionFlags.rawSelectedPayloadExposed, false);
  assert.equal(sourceObject.redactionFlags.rawSourceDbRowsExposed, false);
  assert.equal(sourceObject.redactionFlags.rawUsersExposed, false);
  assert.equal(sourceObject.redactionFlags.rawCandelaExposed, false);
  assert.equal(sourceObject.redactionFlags.rawIesExposed, false);
  assert.equal(sourceObject.redactionFlags.rawPdfsExposed, false);
  assert.equal(sourceObject.redactionFlags.base64ArtefactsExposed, false);
  assert.equal(sourceObject.redactionFlags.privatePathsExposed, false);
}

test("safe source object maps successful Engine summary counts without persistence", () => {
  const sourceObject = buildSafeEngineRunTableSelectedResultSourceObject(successfulSafeInput());

  assert.equal(sourceObject.ok, true);
  assert.equal(sourceObject.schemaId, SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID);
  assert.equal(sourceObject.schemaVersion, 1);
  assert.equal(sourceObject.sourceKind, "host_local_real_engine_safe_summary");
  assert.equal(sourceObject.accepted, true);
  assert.equal(sourceObject.engineVerified, true);
  assert.equal(sourceObject.selectedTierOrProfile, "business");
  assert.equal(sourceObject.runCount, 1);
  assert.equal(sourceObject.boardCount, 4);
  assert.equal(sourceObject.segmentCount, 1);
  assert.equal(sourceObject.zoneCount, 2);
  assert.equal(sourceObject.clipPointsCount, 5);
  assert.equal(sourceObject.suspensionPointsCount, 3);
  assert.equal(sourceObject.gearTrayPlanCount, 1);
  assert.equal(sourceObject.runs.length, 1);
  assert.equal(sourceObject.runs[0].runKey, "safe-engine-run-1");
  assert.equal(sourceObject.runs[0].boardCount, 4);
  assert.equal(sourceObject.runs[0].segmentCount, 1);
  assert.equal(sourceObject.runs[0].zoneCount, 2);
  assert.equal(sourceObject.runs[0].clipPointsCount, 5);
  assert.equal(sourceObject.runs[0].suspensionPointsCount, 3);
  assert.equal(sourceObject.runs[0].gearTrayPlanCount, 1);
  assert.equal(sourceObject.sourceInputFingerprint, "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
  assert.equal(sourceObject.sourceVersionMarker, "runtime-active-source-safe-v1");
  assertSafetyLocked(sourceObject);
  assertNoUnsafeMarkers(sourceObject);
});

test("controlled intent and source-backed markers are retained safely", () => {
  const sourceObject = buildSafeEngineRunTableSelectedResultSourceObject(successfulSafeInput());

  assert.ok(sourceObject.controlledIntentMarkers.some((marker) => marker.kind === "controlled_geometry" && marker.classification === "controlled-test-geometry"));
  assert.ok(sourceObject.controlledIntentMarkers.some((marker) => marker.kind === "controlled_field_source_marker" && marker.field === "target_lm_per_m"));
  assert.ok(sourceObject.sourceBackedDataMarkers.some((marker) => marker.kind === "runtime_active_source_summary" && marker.activeSourceDbLoadedReadOnly === true));
  assert.ok(sourceObject.sourceBackedDataMarkers.some((marker) => marker.kind === "source_backed_field_marker" && marker.field === "cct"));
  assert.ok(sourceObject.sourceBackedDataMarkers.some((marker) => marker.kind === "source_backed_field_marker" && marker.field === "cri"));
  assert.ok(sourceObject.sourceBackedDataMarkers.some((marker) => marker.kind === "source_backed_field_marker" && marker.field === "optic"));
  assert.equal(sourceObject.sourceBackedDataMarkers[0].rawRowsExposed, false);
  assert.equal(sourceObject.sourceBackedDataMarkers[0].rawUsersExposed, false);
  assertNoUnsafeMarkers(sourceObject);
});

test("unsafe raw payload fields are rejected and never emitted", () => {
  const unsafe = successfulSafeInput({
    rawEnginePayload: { marker: "raw-engine-payload-do-not-emit" },
    rough_electrical_payload: { marker: "rough-electrical-payload-do-not-emit" },
    rawEngineResult: { marker: "raw-engine-result-do-not-emit" },
    rawRunTableRows: [{ marker: "raw-run-table-row-do-not-emit" }],
    rawSelectedPayload: { marker: "raw-selected-payload-do-not-emit" },
    rawDbRows: [{ marker: "raw-db-row-do-not-emit" }],
    usersRows: [{ marker: "users-row-do-not-emit" }],
    rawCandelaGrid: [["candela-grid-do-not-emit"]],
    rawIesText: "TILT=NONE raw-ies-do-not-emit",
    pdfRef: "private-proof-do-not-emit.pdf",
    base64PolarPlot: "data:image/png;base64,polar-do-not-emit",
    privatePath: "private-path-do-not-emit",
  });

  const sourceObject = buildSafeEngineRunTableSelectedResultSourceObject(unsafe);

  assert.equal(sourceObject.ok, false);
  assert.equal(sourceObject.accepted, false);
  assert.equal(sourceObject.engineVerified, false);
  assert.equal(sourceObject.unsafeInputRejected, true);
  assert.ok(sourceObject.blockers.some((blocker) => blocker.code === "unsafe-raw-input-key-rejected"));
  assertSafetyLocked(sourceObject);
  assertNoUnsafeMarkers(sourceObject);
});

test("IES handoff and selected-result persistence remain blocked", () => {
  const sourceObject = buildSafeEngineRunTableSelectedResultSourceObject(successfulSafeInput());

  assert.equal(sourceObject.ok, true);
  assert.equal(sourceObject.persistenceStatus.selectedResultPersisted, false);
  assert.equal(sourceObject.persistenceStatus.selectedResultPersistenceEnabled, false);
  assert.equal(sourceObject.safetyFlags.selectedResultIngestionEnabled, false);
  assert.equal(sourceObject.safetyFlags.selectedResultPersistenceEnabled, false);
  assert.equal(sourceObject.downstreamReadinessFlags.selectedResultProjectionReady, false);
  assert.equal(sourceObject.downstreamReadinessFlags.iesHandoffReady, false);
  assert.equal(sourceObject.downstreamReadinessFlags.iesHandoffBlocked, true);
  assert.equal(sourceObject.safetyFlags.iesGenerationEnabled, false);
  assert.equal(sourceObject.safetyFlags.iesHandoffEnabled, false);
});

test("builder fails closed when required safe fields are missing", () => {
  const missingCounts = buildSafeEngineRunTableSelectedResultSourceObject(successfulSafeInput({
    safe_engine_summary: {
      success: true,
      selected_tier: "business",
      run_count: 1,
      runs: [{ index: 0, boards_count: 4 }],
    },
  }));
  const missingFingerprint = buildSafeEngineRunTableSelectedResultSourceObject(successfulSafeInput({
    source_summary: {
      ok: true,
      active_source_db_loaded_read_only: true,
      source_fingerprint_available: false,
      present_tables: ["BOARDS"],
    },
    sourceInputFingerprint: undefined,
  }));

  assert.equal(missingCounts.ok, false);
  assert.equal(missingCounts.accepted, false);
  assert.match(missingCounts.blockers[0].reason, /counts|required/i);
  assert.equal(missingFingerprint.ok, false);
  assert.equal(missingFingerprint.accepted, false);
  assert.match(missingFingerprint.blockers[0].reason, /fingerprint/i);
  assertSafetyLocked(missingCounts);
  assertSafetyLocked(missingFingerprint);
});

test("builder source is pure and does not add routes, POST endpoints, writes, or generation", async () => {
  const builderText = await readFile(builderSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");

  assert.equal(builderText.includes("writeFile"), false);
  assert.equal(builderText.includes("write_text"), false);
  assert.equal(builderText.includes("fetch("), false);
  assert.equal(builderText.includes("router.post"), false);
  assert.equal(builderText.includes("app.post"), false);
  assert.equal(builderText.includes("/api/engine/run"), false);
  assert.equal(builderText.includes("/api/selector/run"), false);
  assert.equal(builderText.includes("iesGenerationEnabled: true"), false);
  assert.equal(builderText.includes("selectedResultPersistenceEnabled: true"), false);
  assert.equal(serverText.includes("engineRunTableSafeSelectedResultSourceObject"), false);
  assert.equal(serverText.includes("SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID"), false);
  assert.equal(/POST[\s\S]{0,180}safe-selected-result/i.test(serverText), false);
  assert.equal(/safe-selected-result[\s\S]{0,180}POST/i.test(serverText), false);
});