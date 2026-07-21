import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/engineOutputV1CompatibilityAdapter.js";

const moduleUrl = new URL(
  "../../packages/lab-kernel/ies-toolkit/engineOutputV1CompatibilityAdapter.js",
  import.meta.url,
);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function fp(prefix, character) {
  return `${prefix}:${character.repeat(40)}`;
}

function thermalSafety(overrides = {}) {
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
    ...overrides,
  };
}

function engineSafety(contractRowsBuilt, overrides = {}) {
  return {
    readOnly: true,
    nonPersistent: true,
    governanceEnvelopeIgnored: true,
    contractRowsBuilt,
    engineInvoked: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    iesGenerated: false,
    downstreamActivated: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
    rawEnginePayloadReturned: false,
    rawSourceRowsReturned: false,
    privatePathsReturned: false,
    exactPrivateElectricalValuesReturned: false,
    ...overrides,
  };
}

function identities() {
  return {
    resultId: fp("engine-output-v1", "a"),
    requestFingerprint: fp("engine-selection-set-v1", "b"),
    sourceVersionFingerprint: fp("engine-source-version-v1", "c"),
    policyFingerprint: "engine-policy-v1:0123456789abcdef",
    evidenceFingerprint: fp("engine-evidence-v1", "d"),
    internalComponentResultId: fp("engine-selected-result-v1", "e"),
    sourceInputFingerprint: fp("engine-safe-source-input-v1", "f"),
  };
}

function thermal(overrides = {}) {
  return {
    schemaId: "controlstack.runtime.thermal-lumen-execution.v1",
    schemaVersion: 1,
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
    safetyFlags: thermalSafety(),
    ...overrides,
  };
}

function provenance(overrides = {}) {
  return {
    selectedOpticKey: "Inlay",
    opticBomId: "OPTIC-BOM-80-INLAY",
    evidenceRef: "NVB-HOT-TEST-80-INLAY",
    programValidationState: "accepted_for_engine_thermal_lookup",
    selectedTierOrProfile: "balanced",
    ...overrides,
  };
}

function row(identity, overrides = {}) {
  return {
    schemaId: contract.PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID,
    schemaVersion: contract.PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
    rowKey: fp("engine-runtable-row-v1", "1"),
    runKey: "safe-engine-run-1",
    runIndex: 0,
    rowOrdinal: 1,
    rowKind: "run_summary",
    state: "complete",
    accepted: true,
    engineVerified: true,
    hasBodyRequested: true,
    boardCount: 4,
    segmentCount: 1,
    zoneCount: 2,
    clipPointsCount: 5,
    suspensionPointsCount: 3,
    gearTrayPlanCount: 1,
    reservedRangesCount: 0,
    requestFingerprint: identity.requestFingerprint,
    sourceVersionFingerprint: identity.sourceVersionFingerprint,
    policyFingerprint: identity.policyFingerprint,
    resultId: identity.resultId,
    readOnly: true,
    rawPayloadReturned: false,
    ...overrides,
  };
}

function completeOutput(overrides = {}) {
  const identity = identities();
  const evidenceFingerprints = [identity.evidenceFingerprint];
  const selectedResult = {
    resultId: identity.resultId,
    accepted: true,
    engineVerified: true,
    selectedProfile: "balanced",
    sourceKind: "safe_engine_run_table_selected_result_source",
    sourceInputFingerprint: identity.sourceInputFingerprint,
    sourceVersionMarker: "runtime-active-source-safe-v1",
    internalComponentResultId: identity.internalComponentResultId,
    technicalProvenance: provenance(),
    thermal: thermal(),
    runCount: 1,
    readOnly: true,
  };
  const runTable = {
    rowSchemaId: contract.PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID,
    rowSchemaVersion: contract.PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
    rowCount: 1,
    rows: [row(identity)],
    nonPersistent: true,
    readOnly: true,
  };
  return {
    schemaId: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_ID,
    schemaVersion: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION,
    state: "complete",
    resultId: identity.resultId,
    requestFingerprint: identity.requestFingerprint,
    sourceVersionFingerprint: identity.sourceVersionFingerprint,
    policyFingerprint: identity.policyFingerprint,
    evidenceFingerprints,
    selectedResult,
    runTable,
    blockers: [],
    warnings: [],
    replay: {
      requestFingerprint: identity.requestFingerprint,
      sourceVersionFingerprint: identity.sourceVersionFingerprint,
      policyFingerprint: identity.policyFingerprint,
      evidenceFingerprints,
      outputSchemaId: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_ID,
      outputSchemaVersion: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION,
    },
    safetyFlags: engineSafety(true),
    ...overrides,
  };
}

function blockedOutput(overrides = {}) {
  const identity = identities();
  return {
    schemaId: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_ID,
    schemaVersion: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION,
    state: "blocked_fail_closed",
    resultId: null,
    requestFingerprint: identity.requestFingerprint,
    sourceVersionFingerprint: null,
    policyFingerprint: identity.policyFingerprint,
    evidenceFingerprints: [],
    selectedResult: null,
    runTable: null,
    blockers: ["engine-output-contract-blocked"],
    warnings: [],
    replay: {
      requestFingerprint: identity.requestFingerprint,
      sourceVersionFingerprint: null,
      policyFingerprint: identity.policyFingerprint,
      evidenceFingerprints: [],
      outputSchemaId: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_ID,
      outputSchemaVersion: contract.PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION,
    },
    safetyFlags: engineSafety(false),
    ...overrides,
  };
}

function assertCompatibilityBlocked(output, blocker) {
  assert.equal(output.schemaId, contract.ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_ID);
  assert.equal(output.schemaVersion, contract.ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_VERSION);
  assert.equal(output.state, contract.ENGINE_OUTPUT_V1_COMPATIBILITY_STATES.blockedFailClosed);
  assert.equal(output.engineState, null);
  assert.equal(output.resultId, null);
  assert.equal(output.selectedResult, null);
  assert.equal(output.runTable, null);
  assert.deepEqual(output.blockers, [blocker]);
  assert.equal(output.safetyFlags.projectionBuilt, false);
  assert.equal(output.safetyFlags.iesGenerated, false);
  assert.equal(output.safetyFlags.authorityApproved, false);
  assert.equal(output.safetyFlags.downstreamActivated, false);
  assertDeepFrozen(output);
}

test("exports only the approved import-free version-1 compatibility interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), [
    "ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_ID",
    "ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_VERSION",
    "ENGINE_OUTPUT_V1_COMPATIBILITY_STATES",
    "PUBLIC_ENGINE_OUTPUT_SCHEMA_ID",
    "PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION",
    "PUBLIC_ENGINE_RUNTABLE_ROW_FIELD_SET",
    "PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID",
    "PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_VERSION",
    "adaptEngineOutputV1Compatibility",
    "engineOutputV1CompatibilityFieldSet",
  ].sort());
  assert.equal(Object.isFrozen(contract.ENGINE_OUTPUT_V1_COMPATIBILITY_STATES), true);
  assert.equal(Object.isFrozen(contract.PUBLIC_ENGINE_RUNTABLE_ROW_FIELD_SET), true);
  assert.deepEqual(contract.engineOutputV1CompatibilityFieldSet(), [
    "schemaId",
    "schemaVersion",
    "state",
    "engineOutputSchemaId",
    "engineOutputSchemaVersion",
    "engineState",
    "resultId",
    "requestFingerprint",
    "sourceVersionFingerprint",
    "policyFingerprint",
    "evidenceFingerprints",
    "selectedResult",
    "runTable",
    "blockers",
    "warnings",
    "safetyFlags",
  ]);
});

test("projects one exact immutable complete public Engine output", () => {
  const input = completeOutput();
  const before = deepClone(input);
  const output = contract.adaptEngineOutputV1Compatibility(input);

  assert.equal(output.state, contract.ENGINE_OUTPUT_V1_COMPATIBILITY_STATES.compatibleComplete);
  assert.equal(output.engineState, "complete");
  assert.equal(output.resultId, input.resultId);
  assert.equal(output.requestFingerprint, input.requestFingerprint);
  assert.equal(output.sourceVersionFingerprint, input.sourceVersionFingerprint);
  assert.equal(output.policyFingerprint, input.policyFingerprint);
  assert.deepEqual(output.evidenceFingerprints, input.evidenceFingerprints);
  assert.equal(output.selectedResult.thermal.verifiedLmPerM, 1350);
  assert.equal(output.selectedResult.technicalProvenance.evidenceRef, "NVB-HOT-TEST-80-INLAY");
  assert.equal(output.runTable.rowSchemaId, contract.PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID);
  assert.deepEqual(
    Object.keys(output.runTable.rows[0]),
    [...contract.PUBLIC_ENGINE_RUNTABLE_ROW_FIELD_SET],
  );
  assert.equal(output.runTable.rows[0].resultId, output.resultId);
  assert.equal(output.safetyFlags.projectionBuilt, true);
  assert.equal(output.safetyFlags.compatibilityOnly, true);
  assert.equal(output.safetyFlags.authorityApproved, false);
  assert.equal(output.safetyFlags.iesGenerated, false);
  assert.equal(output.safetyFlags.downstreamActivated, false);
  assert.deepEqual(input, before);
  assertDeepFrozen(output);
});

test("preserves valid zero technical values rather than treating them as missing", () => {
  const input = completeOutput();
  input.selectedResult.thermal = thermal({
    selectedRoomTaC: 0,
    referenceRoomTaC: 0,
    referenceInternalTaC: 0,
    opticThermalRiseTaC: 0,
    derivedInternalTaC: 0,
    curveLookupTaC: 0,
    effectiveCurveTaC: 0,
    requestedCurrentMa: 0,
    verifiedLmPerM: 0,
  });
  input.runTable.rows[0] = row(identities(), {
    boardCount: 0,
    segmentCount: 0,
    zoneCount: 0,
    clipPointsCount: 0,
    suspensionPointsCount: 0,
    gearTrayPlanCount: 0,
    reservedRangesCount: 0,
  });

  const output = contract.adaptEngineOutputV1Compatibility(input);
  assert.equal(output.state, contract.ENGINE_OUTPUT_V1_COMPATIBILITY_STATES.compatibleComplete);
  assert.equal(output.selectedResult.thermal.verifiedLmPerM, 0);
  assert.equal(output.selectedResult.thermal.curveLookupTaC, 0);
  assert.equal(output.runTable.rows[0].boardCount, 0);
  assert.equal(output.runTable.rows[0].zoneCount, 0);
});

test("projects one exact immutable blocked public Engine output", () => {
  const input = blockedOutput();
  const output = contract.adaptEngineOutputV1Compatibility(input);

  assert.equal(output.state, contract.ENGINE_OUTPUT_V1_COMPATIBILITY_STATES.compatibleBlocked);
  assert.equal(output.engineState, "blocked_fail_closed");
  assert.equal(output.resultId, null);
  assert.equal(output.selectedResult, null);
  assert.equal(output.runTable, null);
  assert.deepEqual(output.blockers, ["engine-output-contract-blocked"]);
  assert.equal(output.safetyFlags.projectionBuilt, true);
  assert.equal(output.safetyFlags.iesGenerated, false);
  assert.equal(output.safetyFlags.authorityAllocated, false);
  assertDeepFrozen(output);
});

test("fails closed on unknown, over-rich, unsafe, contradictory and legacy input", () => {
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(completeOutput({ schemaVersion: 2 })),
    "engine_output_schema_unsupported",
  );

  const overRich = completeOutput();
  overRich.project = "project-alpha";
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(overRich),
    "engine_output_invalid_shape",
  );

  const governanceNested = completeOutput();
  governanceNested.selectedResult.technicalProvenance.project = "project-alpha";
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(governanceNested),
    "selected_result_provenance_invalid",
  );

  const privatePath = completeOutput();
  privatePath.selectedResult.thermal.curveFilename = "C:\\Users\\private\\curve.csv";
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(privatePath),
    "private_text_rejected",
  );

  const legacy = completeOutput();
  legacy.runTable.rows[0].schemaId = "controlstack.runtime.runtable-first-narrow-row.v1";
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(legacy),
    "legacy_runtable_row_schema_rejected",
  );

  const contradicted = completeOutput();
  contradicted.runTable.rows[0].resultId = fp("engine-output-v1", "9");
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(contradicted),
    "runtable_row_identity_mismatch",
  );

  const thermalMismatch = completeOutput();
  thermalMismatch.selectedResult.thermal.evidenceRef = "OTHER-EVIDENCE";
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(thermalMismatch),
    "thermal_provenance_mismatch",
  );

  const unsafeSafety = completeOutput();
  unsafeSafety.safetyFlags.iesGenerated = true;
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(unsafeSafety),
    "engine_output_safety_invalid",
  );

  const callerEvidence = completeOutput();
  callerEvidence.evidenceFingerprints.push(fp("engine-evidence-v1", "7"));
  callerEvidence.replay.evidenceFingerprints.push(fp("engine-evidence-v1", "7"));
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(callerEvidence),
    "engine_output_evidence_invalid",
  );

  const blockedCarriesResult = blockedOutput({ selectedResult: completeOutput().selectedResult });
  assertCompatibilityBlocked(
    contract.adaptEngineOutputV1Compatibility(blockedCarriesResult),
    "blocked_output_contains_result",
  );
});

test("outside governance envelopes neither influence nor appear in output", () => {
  const input = completeOutput();
  const left = contract.adaptEngineOutputV1Compatibility(input, {
    user: "alpha-user",
    project: "alpha-project",
    owner: "alpha-owner",
    timeline: "alpha-timeline",
    registrationState: "registered",
  });
  const right = contract.adaptEngineOutputV1Compatibility(input, {
    user: "omega-user",
    project: "omega-project",
    owner: "omega-owner",
    timeline: "omega-timeline",
    registrationState: "blocked",
  });
  assert.deepEqual(left, right);
  const text = JSON.stringify(left);
  for (const marker of [
    "alpha-user",
    "alpha-project",
    "alpha-owner",
    "omega-user",
    "omega-project",
    "omega-owner",
    "registered",
  ]) {
    assert.equal(text.includes(marker), false, marker);
  }
});

test("production adapter has no implementation import, authority, generation, route or write seam", () => {
  const source = readFileSync(moduleUrl, "utf8");
  assert.equal(/^\s*import\s/m.test(source), false);
  assert.equal(source.includes("controlstack.runtime.runtable-first-narrow-row.v1"), true);
  assert.equal(source.includes("fetch("), false);
  assert.equal(source.includes("localStorage"), false);
  assert.equal(source.includes("sessionStorage"), false);
  assert.equal(source.includes("node:fs"), false);
  assert.equal(source.includes("writeFile"), false);
  assert.equal(source.includes("createServer"), false);
  assert.equal(source.includes("generateIes"), false);
  assert.equal(source.includes("approveReference"), false);
  assert.equal(source.includes("sealReference"), false);
  assert.equal(source.includes("Date.now"), false);
  assert.equal(source.includes("Math.random"), false);
});
