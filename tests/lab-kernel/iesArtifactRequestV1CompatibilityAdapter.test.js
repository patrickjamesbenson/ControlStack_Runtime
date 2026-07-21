import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/iesArtifactRequestV1CompatibilityAdapter.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function fp(prefix, character = "a") {
  return `${prefix}:${character.repeat(40)}`;
}

function intent(overrides = {}) {
  return {
    schemaId: "controlstack.downstream.ies-artifact-intent.v1",
    schemaVersion: 1,
    artifactKind: "ies_lm63_reference_build",
    ...overrides,
  };
}

function engineIdentity(overrides = {}) {
  return {
    outputSchemaId: "controlstack.engine.output.v1",
    outputSchemaVersion: 1,
    outputState: "complete",
    resultId: fp("engine-output-v1", "a"),
    requestFingerprint: fp("engine-selection-set-v1", "b"),
    sourceVersionFingerprint: fp("engine-source-version-v1", "c"),
    policyFingerprint: "engine-policy-v1:0123456789abcdef",
    evidenceFingerprints: [fp("engine-evidence-v1", "d")],
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

function selectedResult(identity = engineIdentity(), overrides = {}) {
  return {
    resultId: identity.resultId,
    accepted: true,
    engineVerified: true,
    selectedProfile: "balanced",
    sourceKind: "runtime-active-source-safe-summary",
    sourceInputFingerprint: fp("engine-safe-source-input-v1", "e"),
    sourceVersionMarker: "runtime-active-source-safe-v1",
    internalComponentResultId: fp("engine-selected-result-v1", "f"),
    technicalProvenance: provenance(),
    thermal: thermal(),
    runCount: 1,
    readOnly: true,
    ...overrides,
  };
}

function row(identity = engineIdentity(), overrides = {}) {
  return {
    schemaId: "controlstack.engine.runtable-row.v1",
    schemaVersion: 1,
    rowKey: fp("engine-runtable-row-v1", "1"),
    runKey: "run-1",
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

function runTable(identity = engineIdentity(), overrides = {}) {
  return {
    rowSchemaId: "controlstack.engine.runtable-row.v1",
    rowSchemaVersion: 1,
    rowCount: 1,
    rows: [row(identity)],
    nonPersistent: true,
    readOnly: true,
    ...overrides,
  };
}

function audit({ ready = true, requestId = fp("ies-artifact-request-v1", "7"), replayKey = fp("ies-artifact-replay-v1", "8") } = {}) {
  return {
    schemaId: "controlstack.downstream.ies-artifact-request-audit.v1",
    schemaVersion: 1,
    attemptFingerprint: fp("ies-artifact-request-attempt-v1", "9"),
    state: ready ? "accepted_read_only" : "blocked_fail_closed",
    accepted: ready,
    requestId: ready ? requestId : null,
    replayKey: ready ? replayKey : null,
    deterministic: true,
    traceabilityInspected: false,
    engineInvoked: false,
    labConsumerInvoked: false,
    generatorInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
}

function sourceSafety(overrides = {}) {
  return {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    engineInvoked: false,
    donorEngineInvoked: false,
    labConsumerInvoked: false,
    iesGeneratorInvoked: false,
    iesGenerated: false,
    photometryGenerated: false,
    artifactWritten: false,
    fileWritten: false,
    emailSent: false,
    downloadCreated: false,
    routeAdded: false,
    postEndpointAdded: false,
    runtimeDataMutated: false,
    authorityMutated: false,
    referenceMutated: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaReturned: false,
    privatePathsReturned: false,
    downstreamActivated: false,
    ...overrides,
  };
}

function readyRequest(overrides = {}) {
  const identity = engineIdentity();
  const requestId = fp("ies-artifact-request-v1", "7");
  const replayKey = fp("ies-artifact-replay-v1", "8");
  return {
    schemaId: "controlstack.downstream.ies-artifact-request.v1",
    schemaVersion: 1,
    state: "ready_read_only",
    requestId,
    replayKey,
    artifactIntent: intent(),
    engineContract: identity,
    selectedResult: selectedResult(identity),
    runTable: runTable(identity),
    blockers: [],
    warnings: [],
    audit: audit({ ready: true, requestId, replayKey }),
    safetyFlags: sourceSafety(),
    ...overrides,
  };
}

function blockedRequest(overrides = {}) {
  const identity = engineIdentity({
    outputState: "blocked_fail_closed",
    resultId: null,
    sourceVersionFingerprint: null,
    evidenceFingerprints: [],
  });
  return {
    schemaId: "controlstack.downstream.ies-artifact-request.v1",
    schemaVersion: 1,
    state: "blocked_fail_closed",
    requestId: null,
    replayKey: null,
    artifactIntent: intent(),
    engineContract: identity,
    selectedResult: null,
    runTable: null,
    blockers: ["policy-fingerprint-invalid"],
    warnings: [],
    audit: audit({ ready: false }),
    safetyFlags: sourceSafety(),
    ...overrides,
  };
}

function assertCompatibilityBlocked(value, blocker) {
  assert.equal(value.schemaId, contract.IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_ID);
  assert.equal(value.schemaVersion, contract.IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_VERSION);
  assert.equal(value.state, contract.IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES.blockedFailClosed);
  assert.equal(value.sourceRequest, null);
  assert.equal(value.selectedResult, null);
  assert.equal(value.runTable, null);
  assert.deepEqual(value.blockers, [blocker]);
  assert.equal(value.safetyFlags.readOnly, true);
  assert.equal(value.safetyFlags.compatibilityOnly, true);
  assert.equal(value.safetyFlags.iesGenerated, false);
  assert.equal(value.safetyFlags.authorityCreated, false);
  assert.equal(value.safetyFlags.fileWritten, false);
  assert.equal(value.safetyFlags.readinessActivated, false);
  assertDeepFrozen(value);
}

test("exports only the approved import-free request compatibility interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), [
    "ENGINE_OUTPUT_SCHEMA_ID",
    "ENGINE_OUTPUT_SCHEMA_VERSION",
    "ENGINE_RUNTABLE_ROW_SCHEMA_ID",
    "ENGINE_RUNTABLE_ROW_SCHEMA_VERSION",
    "IES_ARTIFACT_INTENT_SCHEMA_ID",
    "IES_ARTIFACT_INTENT_SCHEMA_VERSION",
    "IES_ARTIFACT_KIND",
    "IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID",
    "IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION",
    "IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_ID",
    "IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_VERSION",
    "IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES",
    "IES_ARTIFACT_REQUEST_SCHEMA_ID",
    "IES_ARTIFACT_REQUEST_SCHEMA_VERSION",
    "adaptIesArtifactRequestV1Compatibility",
  ].sort());
  assert.equal(Object.isFrozen(contract.IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES), true);
});

test("projects one exact immutable ready request compatibility summary", () => {
  const source = readyRequest();
  const projected = contract.adaptIesArtifactRequestV1Compatibility(source, {
    user: "user-a",
    project: "project-a",
    owner: "owner-a",
    timeline: "2026-Q3",
    registrationState: "registered",
  });

  assert.equal(projected.state, contract.IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES.compatibleReady);
  assert.equal(projected.sourceRequest.schemaId, contract.IES_ARTIFACT_REQUEST_SCHEMA_ID);
  assert.equal(projected.sourceRequest.requestId, source.requestId);
  assert.equal(projected.sourceRequest.replayKey, source.replayKey);
  assert.deepEqual(projected.artifactIntent, source.artifactIntent);
  assert.deepEqual(projected.engineContract, source.engineContract);
  assert.deepEqual(projected.selectedResult, source.selectedResult);
  assert.deepEqual(projected.runTable, source.runTable);
  assert.deepEqual(projected.blockers, []);
  assert.deepEqual(projected.warnings, []);
  assert.deepEqual(projected.audit, source.audit);
  assert.equal(projected.safetyFlags.outerTraceabilityIgnored, true);
  assert.equal(projected.safetyFlags.producerImplementationImported, false);
  assert.equal(projected.safetyFlags.iesGeneratorInvoked, false);
  assert.equal(projected.safetyFlags.evidenceAccepted, false);
  assert.equal(projected.safetyFlags.referenceMutated, false);
  assert.equal(projected.safetyFlags.networkWritten, false);
  assert.doesNotMatch(JSON.stringify(projected), /user-a|project-a|owner-a|2026-Q3|registered/);
  assertDeepFrozen(projected);
});

test("projects one exact immutable blocked request compatibility summary", () => {
  const source = blockedRequest();
  const projected = contract.adaptIesArtifactRequestV1Compatibility(source);

  assert.equal(projected.state, contract.IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES.compatibleBlocked);
  assert.equal(projected.sourceRequest.state, "blocked_fail_closed");
  assert.equal(projected.sourceRequest.requestId, null);
  assert.equal(projected.sourceRequest.replayKey, null);
  assert.equal(projected.engineContract.outputState, "blocked_fail_closed");
  assert.equal(projected.engineContract.resultId, null);
  assert.equal(projected.selectedResult, null);
  assert.equal(projected.runTable, null);
  assert.deepEqual(projected.blockers, ["policy-fingerprint-invalid"]);
  assert.equal(projected.audit.accepted, false);
  assertDeepFrozen(projected);
});

test("preserves valid zero technical values", () => {
  const source = readyRequest();
  source.selectedResult.thermal = thermal({
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
  });
  source.runTable.rows[0] = row(source.engineContract, {
    boardCount: 0,
    segmentCount: 0,
    zoneCount: 0,
    clipPointsCount: 0,
    suspensionPointsCount: 0,
    gearTrayPlanCount: 0,
    reservedRangesCount: 0,
  });

  const projected = contract.adaptIesArtifactRequestV1Compatibility(source);
  assert.equal(projected.state, contract.IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES.compatibleReady);
  assert.equal(projected.selectedResult.thermal.selectedRoomTaC, 0);
  assert.equal(projected.selectedResult.thermal.opticThermalRiseTaC, 0);
  assert.equal(projected.selectedResult.thermal.derivedInternalTaC, 0);
  assert.equal(projected.selectedResult.thermal.effectiveCurveTaC, 25);
  assert.equal(projected.selectedResult.thermal.requestedCurrentMa, 0);
  assert.equal(projected.selectedResult.thermal.verifiedLmPerM, 0);
  assert.equal(projected.runTable.rows[0].boardCount, 0);
  assert.equal(projected.runTable.rows[0].reservedRangesCount, 0);
});

test("is replay-identical and keeps outer governance absent", () => {
  const source = readyRequest();
  const first = contract.adaptIesArtifactRequestV1Compatibility(source, {
    user: "user-a",
    project: "project-a",
    owner: "owner-a",
    timeline: "last-year",
    registrationState: "registered",
  });
  const second = contract.adaptIesArtifactRequestV1Compatibility(source, {
    user: "user-b",
    project: "project-b",
    owner: "owner-b",
    timeline: "next-year",
    registrationState: "unregistered",
    renamedEligibilityGate: "allowed",
  });
  const third = contract.adaptIesArtifactRequestV1Compatibility(source);

  assert.deepEqual(first, second);
  assert.deepEqual(second, third);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.equal(first.sourceRequest.requestId, second.sourceRequest.requestId);
  assert.equal(first.sourceRequest.replayKey, second.sourceRequest.replayKey);
  assert.equal(first.audit.attemptFingerprint, second.audit.attemptFingerprint);
  assert.doesNotMatch(JSON.stringify(first), /user-|project-|owner-|last-year|next-year|registered|eligibility/i);
});

test("fails closed on unknown, extra, private, raw, contradictory, unsafe and legacy input", () => {
  const unknown = clone(readyRequest());
  unknown.schemaVersion = 2;
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(unknown),
    "request_schema_unsupported",
  );

  const extra = clone(readyRequest());
  extra.owner = "outside-governance";
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(extra),
    "request_invalid_shape",
  );

  const extraIntent = clone(readyRequest());
  extraIntent.artifactIntent.filename = "output.ies";
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(extraIntent),
    "artifact_intent_invalid_shape",
  );

  const privatePath = clone(readyRequest());
  privatePath.selectedResult.thermal.curveFilename = "C:\\private\\curve.csv";
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(privatePath),
    "private_path_not_approved",
  );

  const rawContent = clone(readyRequest());
  rawContent.selectedResult.thermal.curveFilename = "IESNA:LM-63-2002";
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(rawContent),
    "raw_artifact_content_not_approved",
  );

  const auditMismatch = clone(readyRequest());
  auditMismatch.audit.requestId = fp("ies-artifact-request-v1", "0");
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(auditMismatch),
    "audit_identity_mismatch",
  );

  const engineMismatch = clone(readyRequest());
  engineMismatch.selectedResult.resultId = fp("engine-output-v1", "0");
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(engineMismatch),
    "selected_result_not_accepted",
  );

  const rowMismatch = clone(readyRequest());
  rowMismatch.runTable.rows[0].resultId = fp("engine-output-v1", "0");
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(rowMismatch),
    "row_identity_mismatch",
  );

  const thermalMismatch = clone(readyRequest());
  thermalMismatch.selectedResult.thermal.referenceInternalTaC = 36;
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(thermalMismatch),
    "thermal_identity_mismatch",
  );

  const extraEvidence = clone(readyRequest());
  extraEvidence.engineContract.evidenceFingerprints.push(fp("engine-evidence-v1", "0"));
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(extraEvidence),
    "engine_contract_evidence_invalid",
  );

  const unsafe = clone(readyRequest());
  unsafe.safetyFlags.iesGenerated = true;
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(unsafe),
    "request_safety_not_accepted",
  );

  const legacy = clone(readyRequest());
  legacy.runTable.rowSchemaId = "controlstack.runtime.runtable-first-narrow-row.v1";
  legacy.runTable.rows[0].schemaId = "controlstack.runtime.runtable-first-narrow-row.v1";
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(legacy),
    "runtable_schema_unsupported",
  );

  const blockedPromotion = clone(blockedRequest());
  blockedPromotion.state = "ready_read_only";
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(blockedPromotion),
    "request_identity_invalid",
  );

  const blockedBody = clone(blockedRequest());
  blockedBody.selectedResult = selectedResult(engineIdentity());
  assertCompatibilityBlocked(
    contract.adaptIesArtifactRequestV1Compatibility(blockedBody),
    "blocked_request_body_present",
  );
});

test("production adapter has no implementation import, authority, generation, route or write seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesArtifactRequestV1CompatibilityAdapter.js", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /^\s*import\s/m);
  assert.doesNotMatch(source, /from\s+["'][^"']*(?:workspace-kernel|selector|runtimeEngine|runtimeIesArtifact)/i);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\s*\(/);
  assert.doesNotMatch(source, /\b(?:writeFile|appendFile|mkdir|unlink|rename|createWriteStream)\s*\(/);
  assert.doesNotMatch(source, /\/api\/|app\.(?:get|post|put|patch|delete)\s*\(/i);
  assert.doesNotMatch(source, /Date\.now|new Date|Math\.random|randomUUID/i);
  assert.doesNotMatch(source, /generateIES|createAuthority|approveReference|sealReference|acceptEvidence/);
  assert.doesNotMatch(source, /controlstack\.runtime\.runtable-first-narrow-row\.v1/);

  const projected = contract.adaptIesArtifactRequestV1Compatibility(readyRequest());
  assert.equal(projected.safetyFlags.iesGeneratorInvoked, false);
  assert.equal(projected.safetyFlags.authorityCreated, false);
  assert.equal(projected.safetyFlags.evidenceAccepted, false);
  assert.equal(projected.safetyFlags.referenceMutated, false);
  assert.equal(projected.safetyFlags.routeAdded, false);
  assert.equal(projected.safetyFlags.persistenceAttempted, false);
  assert.equal(projected.safetyFlags.networkWritten, false);
  assert.equal(projected.safetyFlags.fileWritten, false);
  assert.equal(projected.safetyFlags.emailSent, false);
  assert.equal(projected.safetyFlags.readinessActivated, false);
});
