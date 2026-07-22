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
  ENGINE_RUNTABLE_ROW_SCHEMA_ID,
  buildRuntimeEngineOutputContractV1,
  createEngineSelectionSetRequestV1,
} from "../packages/workspace-kernel/runtimeEngineOutputContractV1.js";
import * as contract from "../packages/workspace-kernel/runtimeIesArtifactRequestContractV1.js";

const moduleUrl = new URL(
  "../packages/workspace-kernel/runtimeIesArtifactRequestContractV1.js",
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
  const source = buildSafeEngineRunTableSelectedResultSourceObject(
    safeSourceInput({ counts }),
  );
  return buildRuntimeEngineSelectedResultContractV1({
    safeSelectedResultSourceObject: source,
    thermalExecution: thermalExecution(thermal),
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

function engineOutput({
  counts = {},
  thermal = {},
  policyFingerprint = "engine-policy-v1:0123456789abcdef",
  traceabilityEnvelope,
} = {}) {
  return buildRuntimeEngineOutputContractV1({
    selectionRequest: acceptedRequest(),
    internalSelectedResult: internalSelectedResult({ counts, thermal }),
    policyFingerprint,
    ...(traceabilityEnvelope ? { traceabilityEnvelope } : {}),
  });
}

function blockedEngineOutput() {
  return buildRuntimeEngineOutputContractV1({
    selectionRequest: acceptedRequest(),
    internalSelectedResult: internalSelectedResult(),
    policyFingerprint: "x",
  });
}

function build({ output = engineOutput(), intent = contract.createIesArtifactIntentV1(), envelope } = {}) {
  return contract.buildRuntimeIesArtifactRequestContractV1({
    engineOutput: output,
    artifactIntent: intent,
    ...(envelope ? { traceabilityEnvelope: envelope } : {}),
  });
}

function assertBlocked(value, blocker) {
  assert.equal(value.schemaId, contract.IES_ARTIFACT_REQUEST_SCHEMA_ID);
  assert.equal(value.schemaVersion, contract.IES_ARTIFACT_REQUEST_SCHEMA_VERSION);
  assert.equal(value.state, contract.IES_ARTIFACT_REQUEST_STATES.blockedFailClosed);
  assert.equal(value.requestId, null);
  assert.equal(value.replayKey, null);
  assert.equal(value.selectedResult, null);
  assert.equal(value.runTable, null);
  assert.deepEqual(value.blockers, [blocker]);
  assert.equal(value.audit.accepted, false);
  assert.equal(value.audit.generatorInvoked, false);
  assert.equal(value.audit.artifactWriteAttempted, false);
  assert.equal(value.safetyFlags.iesGenerated, false);
  assert.equal(value.safetyFlags.downstreamActivated, false);
}

test("exports only the approved version-1 IES request contract interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), [
    "IES_ARTIFACT_INTENT_SCHEMA_ID",
    "IES_ARTIFACT_INTENT_SCHEMA_VERSION",
    "IES_ARTIFACT_KIND",
    "IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID",
    "IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION",
    "IES_ARTIFACT_REQUEST_SCHEMA_ID",
    "IES_ARTIFACT_REQUEST_SCHEMA_VERSION",
    "IES_ARTIFACT_REQUEST_STATES",
    "buildRuntimeIesArtifactRequestContractV1",
    "createIesArtifactIntentV1",
    "validateIesArtifactIntentV1",
  ].sort());

  const intent = contract.createIesArtifactIntentV1();
  assert.deepEqual(intent, {
    schemaId: contract.IES_ARTIFACT_INTENT_SCHEMA_ID,
    schemaVersion: contract.IES_ARTIFACT_INTENT_SCHEMA_VERSION,
    artifactKind: contract.IES_ARTIFACT_KIND,
  });
  assertDeepFrozen(intent);
  assert.equal(contract.validateIesArtifactIntentV1(intent).ok, true);

  assert.equal(contract.validateIesArtifactIntentV1({ ...intent, filename: "x.ies" }).ok, false);
  assert.equal(contract.validateIesArtifactIntentV1({ ...intent, schemaVersion: 2 }).ok, false);
  assert.equal(contract.validateIesArtifactIntentV1({ ...intent, artifactKind: "dxf" }).ok, false);
});

test("builds one exact immutable ready read-only IES request", () => {
  const output = engineOutput();
  const request = build({
    output,
    envelope: {
      user: "user-a",
      project: "project-a",
      owner: "owner-a",
      timeline: "2026-Q3",
      registrationState: "registered",
    },
  });

  assert.equal(request.schemaId, contract.IES_ARTIFACT_REQUEST_SCHEMA_ID);
  assert.equal(request.schemaVersion, contract.IES_ARTIFACT_REQUEST_SCHEMA_VERSION);
  assert.equal(request.state, contract.IES_ARTIFACT_REQUEST_STATES.readyReadOnly);
  assert.match(request.requestId, /^ies-artifact-request-v1:[0-9a-f]{40}$/);
  assert.match(request.replayKey, /^ies-artifact-replay-v1:[0-9a-f]{40}$/);
  assert.equal(request.engineContract.outputSchemaId, ENGINE_OUTPUT_SCHEMA_ID);
  assert.equal(request.engineContract.outputSchemaVersion, ENGINE_OUTPUT_SCHEMA_VERSION);
  assert.equal(request.engineContract.resultId, output.resultId);
  assert.equal(request.selectedResult.resultId, output.selectedResult.resultId);
  assert.deepEqual(request.runTable.rows, output.runTable.rows);
  assert.deepEqual(request.blockers, []);
  assert.equal(request.audit.accepted, true);
  assert.equal(request.audit.requestId, request.requestId);
  assert.equal(request.audit.replayKey, request.replayKey);
  assert.equal(request.audit.traceabilityInspected, false);
  assert.equal(request.safetyFlags.readOnly, true);
  assert.equal(request.safetyFlags.nonPersistent, true);
  assert.equal(request.safetyFlags.traceabilityEnvelopeIgnored, true);
  assert.equal(request.safetyFlags.iesGeneratorInvoked, false);
  assert.equal(request.safetyFlags.iesGenerated, false);
  assert.equal(request.safetyFlags.artifactWritten, false);
  assert.equal(request.safetyFlags.routeAdded, false);
  assert.equal(request.safetyFlags.downstreamActivated, false);
  assert.doesNotMatch(JSON.stringify(request), /user-a|project-a|owner-a|2026-Q3|registered/);
  assertDeepFrozen(request);
});

test("keeps blocked Engine output blocked with no artifact-ready body", () => {
  const output = blockedEngineOutput();
  assert.equal(output.state, "blocked_fail_closed");
  const first = build({ output });
  const second = build({ output });

  assertBlocked(first, output.blockers[0]);
  assert.deepEqual(first, second);
  assert.match(first.audit.attemptFingerprint, /^ies-artifact-request-attempt-v1:[0-9a-f]{40}$/);
  assert.equal(first.engineContract.outputState, "blocked_fail_closed");
  assert.equal(first.engineContract.resultId, null);
});

test("preserves valid zero technical values", () => {
  const output = engineOutput({
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
  const request = build({ output });

  assert.equal(request.state, contract.IES_ARTIFACT_REQUEST_STATES.readyReadOnly);
  assert.equal(request.selectedResult.thermal.selectedRoomTaC, 0);
  assert.equal(request.selectedResult.thermal.opticThermalRiseTaC, 0);
  assert.equal(request.selectedResult.thermal.derivedInternalTaC, 0);
  assert.equal(request.selectedResult.thermal.effectiveCurveTaC, 25);
  assert.equal(request.selectedResult.thermal.requestedCurrentMa, 0);
  assert.equal(request.selectedResult.thermal.verifiedLmPerM, 0);
  assert.equal(request.runTable.rows[0].boardCount, 0);
  assert.equal(request.runTable.rows[0].reservedRangesCount, 0);
});

test("is replay-identical and makes traceability output-inert", () => {
  const output = engineOutput();
  const first = build({
    output,
    envelope: {
      user: "user-a",
      project: "project-a",
      owner: "owner-a",
      timeline: "last-year",
      registrationState: "registered",
    },
  });
  const second = build({
    output,
    envelope: {
      user: "user-b",
      project: "project-b",
      owner: "owner-b",
      timeline: "next-year",
      registrationState: "unregistered",
      renamedEligibilityGate: "allowed",
    },
  });
  const third = build({ output });

  assert.deepEqual(first, second);
  assert.deepEqual(second, third);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.equal(first.requestId, second.requestId);
  assert.equal(first.replayKey, second.replayKey);
  assert.equal(first.audit.attemptFingerprint, second.audit.attemptFingerprint);
  assert.doesNotMatch(JSON.stringify(first), /user-|project-|owner-|last-year|next-year|registered|eligibility/i);
});

test("moves request identity only when stable technical identity moves", () => {
  const baseline = build({ output: engineOutput() });
  const changedPolicy = build({
    output: engineOutput({ policyFingerprint: "engine-policy-v1:fedcba9876543210" }),
  });
  const changedEvidence = build({
    output: engineOutput({ thermal: { evidenceRef: "NVB-HOT-TEST-80-INLAY-B" } }),
  });

  assert.notEqual(changedPolicy.engineContract.policyFingerprint, baseline.engineContract.policyFingerprint);
  assert.notEqual(changedPolicy.requestId, baseline.requestId);
  assert.notEqual(changedPolicy.replayKey, baseline.replayKey);
  assert.notEqual(changedEvidence.engineContract.evidenceFingerprints[0], baseline.engineContract.evidenceFingerprints[0]);
  assert.notEqual(changedEvidence.requestId, baseline.requestId);
});

test("fails closed on unknown, over-rich, unsafe, contradictory and legacy input", () => {
  const unknownVersion = clone(engineOutput());
  unknownVersion.schemaVersion = 2;
  assertBlocked(build({ output: unknownVersion }), "engine-output-schema-unsupported");

  const overRich = clone(engineOutput());
  overRich.owner = "outside-governance";
  assertBlocked(build({ output: overRich }), "engine-output-invalid-shape");

  const nestedGovernance = clone(engineOutput());
  nestedGovernance.selectedResult.owner = "outside-governance";
  assertBlocked(build({ output: nestedGovernance }), "engine-output-selected-result-invalid-shape");

  const privatePath = clone(engineOutput());
  privatePath.selectedResult.thermal.curveFilename = "C:\\private\\curve.csv";
  assertBlocked(build({ output: privatePath }), "private-path-not-approved");

  const rawContent = clone(engineOutput());
  rawContent.selectedResult.thermal.curveFilename = "IESNA:LM-63-2002";
  assertBlocked(build({ output: rawContent }), "raw-artifact-content-not-approved");

  const legacyRow = clone(engineOutput());
  legacyRow.runTable.rowSchemaId = "controlstack.runtime.runtable-first-narrow-row.v1";
  legacyRow.runTable.rows[0].schemaId = "controlstack.runtime.runtable-first-narrow-row.v1";
  assertBlocked(build({ output: legacyRow }), "engine-output-runtable-schema-unsupported");

  const rowIdentity = clone(engineOutput());
  rowIdentity.runTable.rows[0].resultId = "engine-output-v1:0000000000000000000000000000000000000000";
  assertBlocked(build({ output: rowIdentity }), "engine-output-row-identity-mismatch");

  const extraEvidence = clone(engineOutput());
  extraEvidence.evidenceFingerprints.push("engine-evidence-v1:1111111111111111111111111111111111111111");
  extraEvidence.replay.evidenceFingerprints.push("engine-evidence-v1:1111111111111111111111111111111111111111");
  assertBlocked(build({ output: extraEvidence }), "engine-output-evidence-invalid");

  const thermalMismatch = clone(engineOutput());
  thermalMismatch.selectedResult.thermal.referenceInternalTaC = 36;
  assertBlocked(build({ output: thermalMismatch }), "engine-output-thermal-identity-mismatch");

  const unsafeSafety = clone(engineOutput());
  unsafeSafety.safetyFlags.iesGenerated = true;
  assertBlocked(build({ output: unsafeSafety }), "engine-output-safety-not-accepted");

  const blockedPromotion = clone(blockedEngineOutput());
  blockedPromotion.state = "complete";
  assertBlocked(build({ output: blockedPromotion }), "engine-output-identity-invalid");

  const invalidIntent = {
    ...contract.createIesArtifactIntentV1(),
    filename: "output.ies",
  };
  assertBlocked(build({ intent: invalidIntent }), "ies-artifact-intent-invalid-shape");

  assertBlocked(
    contract.buildRuntimeIesArtifactRequestContractV1({
      engineOutput: engineOutput(),
      artifactIntent: contract.createIesArtifactIntentV1(),
      traceabilityEnvelope: "project-a",
    }),
    "traceability-envelope-plain-object-required",
  );
});

test("production module adds no generator, route, persistence, file or cross-lane seam", async () => {
  const source = await readFile(moduleUrl, "utf8");

  assert.match(source, /from "\.\/runtimeEngineOutputContractV1\.js"/);
  assert.match(source, /from "\.\/stableFingerprint\.js"/);
  assert.doesNotMatch(source, /from ["'][^"']*(?:lab-kernel|iesFromReference|iesProjectIes|engineRunTableIesHandoffReadinessScaffold)/i);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\s*\(/);
  assert.doesNotMatch(source, /\b(?:writeFile|appendFile|mkdir|unlink|rename|createWriteStream)\s*\(/);
  assert.doesNotMatch(source, /\/api\/|app\.(?:get|post|put|patch|delete)\s*\(/i);
  assert.doesNotMatch(source, /Date\.now|new Date|Math\.random|randomUUID/i);
  assert.doesNotMatch(source, /generateIES|sendToLDA|generateMfg/);
  assert.doesNotMatch(source, /controlstack\.runtime\.runtable-first-narrow-row\.v1/);

  const request = build();
  assert.equal(request.safetyFlags.iesGeneratorInvoked, false);
  assert.equal(request.safetyFlags.fileWritten, false);
  assert.equal(request.safetyFlags.emailSent, false);
  assert.equal(request.safetyFlags.routeAdded, false);
  assert.equal(request.safetyFlags.persistenceAttempted, undefined);
  assert.equal(request.runTable.rowSchemaId, ENGINE_RUNTABLE_ROW_SCHEMA_ID);
});