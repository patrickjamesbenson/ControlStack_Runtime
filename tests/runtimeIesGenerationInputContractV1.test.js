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
  ENGINE_SELECTION_SET_SCHEMA_ID,
  ENGINE_SELECTION_SET_SCHEMA_VERSION,
  buildRuntimeEngineOutputContractV1,
  createEngineSelectionSetRequestV1,
} from "../packages/workspace-kernel/runtimeEngineOutputContractV1.js";
import {
  buildRuntimeIesArtifactRequestContractV1,
  createIesArtifactIntentV1,
} from "../packages/workspace-kernel/runtimeIesArtifactRequestContractV1.js";
import * as contract from "../packages/workspace-kernel/runtimeIesGenerationInputContractV1.js";

const moduleUrl = new URL(
  "../packages/workspace-kernel/runtimeIesGenerationInputContractV1.js",
  import.meta.url,
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

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
  evidenceRef = "NVB-HOT-TEST-80-INLAY",
  selectedRoomTaC = 25,
  referenceRoomTaC = 25,
  referenceInternalTaC = 35,
  opticThermalRiseTaC = 10,
  derivedInternalTaC = 35,
  curveLookupTaC = 35,
  effectiveCurveTaC = 35,
  temperatureMode = "interpolated",
  requestedCurrentMa = 150,
  currentMode = "interpolated",
  verifiedLmPerM = 1350,
} = {}) {
  const result = {
    schemaId: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
    schemaVersion: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
    selectedOpticKey: "Inlay",
    opticBomId: "OPTIC-BOM-80-INLAY",
    sourceRevision,
    evidenceRef,
    programValidationState: "accepted_for_engine_thermal_lookup",
    selectedRoomTaC,
    referenceRoomTaC,
    referenceInternalTaC,
    opticThermalRiseTaC,
    derivedInternalTaC,
    curveLookupTaC,
    effectiveCurveTaC,
    temperatureMode,
    requestedCurrentMa,
    currentMode,
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

function internalSelectedResult({ counts = {}, thermal = {} } = {}) {
  const source = buildSafeEngineRunTableSelectedResultSourceObject(safeSourceInput({ counts }));
  return buildRuntimeEngineSelectedResultContractV1({
    safeSelectedResultSourceObject: source,
    thermalExecution: thermalExecution(thermal),
  });
}

function selectionSet({
  system = "DNX 80",
  optic = "Inlay",
  targetLmPerM = 1200,
  roomAmbientTaC = 25,
  qty = 1,
  lengthMm = 5600,
  protocol = "DALI-2",
} = {}) {
  return {
    product: { system, optic },
    lighting: { targetLmPerM, roomAmbientTaC },
    runs: [{ qty, lengthMm }],
    control: { protocol },
  };
}

function selectionRequest(overrides = {}) {
  const created = createEngineSelectionSetRequestV1(selectionSet(overrides));
  assert.equal(created.ok, true, created.blocker);
  return created.request;
}

function engineOutput({ selection = {}, counts = {}, thermal = {}, policyFingerprint } = {}) {
  return buildRuntimeEngineOutputContractV1({
    selectionRequest: selectionRequest(selection),
    internalSelectedResult: internalSelectedResult({ counts, thermal }),
    policyFingerprint: policyFingerprint ?? "engine-policy-v1:0123456789abcdef",
  });
}

function artifactRequest(options = {}) {
  const output = engineOutput(options);
  return buildRuntimeIesArtifactRequestContractV1({
    engineOutput: output,
    artifactIntent: createIesArtifactIntentV1(),
  });
}

function build({ selection = {}, counts = {}, thermal = {}, policyFingerprint, envelope } = {}) {
  const request = selectionRequest(selection);
  const artifact = artifactRequest({ selection, counts, thermal, policyFingerprint });
  return contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: artifact,
    selectionRequest: request,
    ...(envelope ? { traceabilityEnvelope: envelope } : {}),
  });
}

function assertBlocked(output, blocker) {
  assert.equal(output.schemaId, contract.IES_GENERATION_INPUT_SCHEMA_ID);
  assert.equal(output.schemaVersion, contract.IES_GENERATION_INPUT_SCHEMA_VERSION);
  assert.equal(output.state, contract.IES_GENERATION_INPUT_STATES.blockedFailClosed);
  assert.equal(output.generationInputId, null);
  assert.equal(output.replayKey, null);
  assert.equal(output.sourceRequest, null);
  assert.equal(output.selection, null);
  assert.equal(output.run, null);
  assert.deepEqual(output.blockers, [blocker]);
  assert.equal(output.audit.accepted, false);
  assert.equal(output.audit.generatorInvoked, false);
  assert.equal(output.safetyFlags.iesGeneratorInvoked, false);
  assert.equal(output.safetyFlags.iesGenerated, false);
  assert.equal(output.safetyFlags.referenceBound, false);
}

test("exports only the approved version-1 generation input interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), [
    "IES_GENERATION_INPUT_AUDIT_SCHEMA_ID",
    "IES_GENERATION_INPUT_AUDIT_SCHEMA_VERSION",
    "IES_GENERATION_INPUT_SCHEMA_ID",
    "IES_GENERATION_INPUT_SCHEMA_VERSION",
    "IES_GENERATION_INPUT_STATES",
    "buildRuntimeIesGenerationInputContractV1",
  ].sort());
});

test("builds one exact immutable ready single-run generation input", () => {
  const output = build({
    envelope: {
      user: "user-a",
      project: "project-a",
      owner: "owner-a",
      timeline: "2026-Q3",
      registrationState: "registered",
    },
  });

  assert.equal(output.state, contract.IES_GENERATION_INPUT_STATES.readyReadOnly);
  assert.match(output.generationInputId, /^ies-generation-input-v1:[0-9a-f]{40}$/);
  assert.match(output.replayKey, /^ies-generation-input-replay-v1:[0-9a-f]{40}$/);
  assert.equal(output.sourceRequest.schemaId, "controlstack.downstream.ies-artifact-request.v1");
  assert.equal(output.artifactIntent.artifactKind, "ies_lm63_reference_build");
  assert.match(output.engineContract.requestFingerprint, /^engine-selection-set-v1:[0-9a-f]{40}$/);
  assert.deepEqual(output.selection, {
    system: "DNX 80",
    optic: "Inlay",
    targetLmPerM: 1200,
    roomAmbientTaC: 25,
    protocol: "DALI-2",
  });
  assert.deepEqual(output.run, { runIndex: 0, quantity: 1, lengthMm: 5600 });
  assert.equal(output.technicalProvenance.opticBomId, "OPTIC-BOM-80-INLAY");
  assert.equal(output.thermal.evidenceRef, "NVB-HOT-TEST-80-INLAY");
  assert.equal(output.audit.accepted, true);
  assert.equal(output.audit.referenceBound, false);
  assert.equal(output.safetyFlags.artifactRequestConsumed, true);
  assert.equal(output.safetyFlags.selectionRequestConsumed, true);
  assert.equal(output.safetyFlags.sealedReferenceLoaded, false);
  assert.equal(output.safetyFlags.iesGenerated, false);
  assert.doesNotMatch(JSON.stringify(output), /user-a|project-a|owner-a|2026-Q3|registered/);
  assertDeepFrozen(output);
});

test("preserves valid zero target and thermal values", () => {
  const output = build({
    selection: { targetLmPerM: 0, roomAmbientTaC: 0 },
    counts: {
      boardCount: 0,
      segmentCount: 0,
      zoneCount: 0,
      clipPointsCount: 0,
      suspensionPointsCount: 0,
      gearTrayPlanCount: 0,
      reservedRangesCount: 0,
    },
    thermal: {
      selectedRoomTaC: 0,
      referenceRoomTaC: 0,
      referenceInternalTaC: 0,
      opticThermalRiseTaC: 0,
      derivedInternalTaC: 0,
      curveLookupTaC: 0,
      effectiveCurveTaC: 25,
      temperatureMode: "clamped-low",
      requestedCurrentMa: 0,
      currentMode: "clamped-low",
      verifiedLmPerM: 0,
    },
  });

  assert.equal(output.state, contract.IES_GENERATION_INPUT_STATES.readyReadOnly);
  assert.equal(output.selection.targetLmPerM, 0);
  assert.equal(output.selection.roomAmbientTaC, 0);
  assert.equal(output.thermal.selectedRoomTaC, 0);
  assert.equal(output.thermal.verifiedLmPerM, 0);
});

test("is replay-identical and keeps outer traceability inert", () => {
  const first = build({ envelope: { user: "a", project: "a", owner: "a", timeline: "past" } });
  const second = build({
    envelope: {
      user: "b",
      project: "b",
      owner: "b",
      timeline: "future",
      registration: "changed",
      renamedEligibilityGate: "allowed",
    },
  });
  const third = build();

  assert.deepEqual(first, second);
  assert.deepEqual(second, third);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.equal(first.generationInputId, second.generationInputId);
  assert.equal(first.replayKey, second.replayKey);
  assert.doesNotMatch(JSON.stringify(first), /project|owner|timeline|registration|eligibility/i);
});

test("moves identity when matching technical inputs move", () => {
  const baseline = build();
  const longer = build({ selection: { lengthMm: 6000 } });
  const changedSystem = build({ selection: { system: "DNX 60" } });
  const changedEvidence = build({ thermal: { evidenceRef: "NVB-HOT-TEST-80-INLAY-B" } });
  const changedPolicy = build({ policyFingerprint: "engine-policy-v1:fedcba9876543210" });

  for (const candidate of [longer, changedSystem, changedEvidence, changedPolicy]) {
    assert.equal(candidate.state, contract.IES_GENERATION_INPUT_STATES.readyReadOnly);
    assert.notEqual(candidate.generationInputId, baseline.generationInputId);
    assert.notEqual(candidate.replayKey, baseline.replayKey);
  }
});

test("keeps blocked artifact requests blocked", () => {
  const selection = selectionRequest();
  const blockedEngine = buildRuntimeEngineOutputContractV1({
    selectionRequest: selection,
    internalSelectedResult: internalSelectedResult(),
    policyFingerprint: "x",
  });
  const blockedArtifact = buildRuntimeIesArtifactRequestContractV1({
    engineOutput: blockedEngine,
    artifactIntent: createIesArtifactIntentV1(),
  });
  const output = contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: blockedArtifact,
    selectionRequest: selection,
  });
  assertBlocked(output, "artifact-request-not-ready");
});

test("fails closed on unknown, extra, multi-run, mismatched and unsafe input", () => {
  const goodSelection = selectionRequest();
  const goodArtifact = artifactRequest();

  const unknownSelection = clone(goodSelection);
  unknownSelection.schemaVersion = 2;
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: goodArtifact,
    selectionRequest: unknownSelection,
  }), "selection-request-schema-unsupported");

  const extraSelection = clone(goodSelection);
  extraSelection.selectionSet.owner = "outside-governance";
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: goodArtifact,
    selectionRequest: extraSelection,
  }), "selection-set-invalid-shape");

  const multiRun = clone(goodSelection);
  multiRun.selectionSet.runs.push({ qty: 1, lengthMm: 1200 });
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: goodArtifact,
    selectionRequest: multiRun,
  }), "selection-single-run-required");

  const fingerprintTamper = clone(goodSelection);
  fingerprintTamper.selectionSet.runs[0].lengthMm = 6000;
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: goodArtifact,
    selectionRequest: fingerprintTamper,
  }), "selection-request-fingerprint-mismatch");

  const artifactMismatch = clone(goodArtifact);
  artifactMismatch.engineContract.requestFingerprint = "engine-selection-set-v1:0000000000000000000000000000000000000000";
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: artifactMismatch,
    selectionRequest: goodSelection,
  }), "artifact-selection-fingerprint-mismatch");

  const rowMismatch = clone(goodArtifact);
  rowMismatch.runTable.rows[0].requestFingerprint = "engine-selection-set-v1:0000000000000000000000000000000000000000";
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: rowMismatch,
    selectionRequest: goodSelection,
  }), "artifact-row-identity-mismatch");

  const opticMismatch = clone(goodArtifact);
  opticMismatch.selectedResult.technicalProvenance.selectedOpticKey = "Rope";
  opticMismatch.selectedResult.thermal.selectedOpticKey = "Rope";
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: opticMismatch,
    selectionRequest: goodSelection,
  }), "selection-optic-technical-provenance-mismatch");

  const ambientMismatch = clone(goodArtifact);
  ambientMismatch.selectedResult.thermal.selectedRoomTaC = 30;
  ambientMismatch.selectedResult.thermal.derivedInternalTaC = 40;
  ambientMismatch.selectedResult.thermal.curveLookupTaC = 40;
  ambientMismatch.selectedResult.thermal.effectiveCurveTaC = 40;
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: ambientMismatch,
    selectionRequest: goodSelection,
  }), "selection-room-ambient-thermal-mismatch");

  const unsafe = clone(goodArtifact);
  unsafe.safetyFlags.iesGenerated = true;
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: unsafe,
    selectionRequest: goodSelection,
  }), "artifact-request-safety-invalid");

  const privateValue = clone(goodSelection);
  privateValue.selectionSet.product.system = "C:\\private\\DNX80";
  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: goodArtifact,
    selectionRequest: privateValue,
  }), "selection-values-invalid");

  assertBlocked(contract.buildRuntimeIesGenerationInputContractV1({
    artifactRequest: goodArtifact,
    selectionRequest: goodSelection,
    traceabilityEnvelope: "project-a",
  }), "traceability-envelope-plain-object-required");
});

test("production module adds no Lab, reference, generator, route, persistence or write seam", async () => {
  const source = await readFile(moduleUrl, "utf8");

  assert.match(source, /from "\.\/runtimeEngineOutputContractV1\.js"/);
  assert.match(source, /from "\.\/runtimeIesArtifactRequestContractV1\.js"/);
  assert.match(source, /from "\.\/stableFingerprint\.js"/);
  assert.doesNotMatch(source, /from ["'][^"']*(?:lab-kernel|iesFromReference|iesProjectIes|nvbLabAdapter|nvbReference)/i);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\s*\(/);
  assert.doesNotMatch(source, /\b(?:writeFile|appendFile|mkdir|unlink|rename|createWriteStream)\s*\(/);
  assert.doesNotMatch(source, /\/api\/|app\.(?:get|post|put|patch|delete)\s*\(/i);
  assert.doesNotMatch(source, /buildIesFromReference|buildProjectIes|IESNA:LM-63|\bTILT=/);
  assert.doesNotMatch(source, /Date\.now|new Date|Math\.random|randomUUID/i);

  const output = build();
  assert.equal(output.safetyFlags.referenceBound, false);
  assert.equal(output.safetyFlags.sealedReferenceLoaded, false);
  assert.equal(output.safetyFlags.iesGeneratorInvoked, false);
  assert.equal(output.safetyFlags.iesGenerated, false);
  assert.equal(output.safetyFlags.fileWritten, false);
  assert.equal(output.safetyFlags.routeAdded, false);
});
