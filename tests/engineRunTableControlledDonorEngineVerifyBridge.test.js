import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildControlledDonorEngineVerifyBridgeSummary,
  buildRuntimeControlledDonorEngineVerifyBridgeSummary,
  buildEngineRunTableControlledDonorEngineVerifyBridgeStatus,
  CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_ID,
  CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_VERSION,
  CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_ALLOWED_OUTPUT_KEYS,
} from "../packages/workspace-kernel/engineRunTableControlledDonorEngineVerifyBridge.js";

const POLICY_FINGERPRINT = "safe-policy:controlled-donor-bridge-fixture";
const SOURCE_FINGERPRINT = "safe-source:controlled-donor-bridge-fixture";
const bridgeSourceUrl = new URL("../packages/workspace-kernel/engineRunTableControlledDonorEngineVerifyBridge.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function safeBase(overrides = {}) {
  return {
    ok: true,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawRuntimeDataRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    exactPlacementCoordinatesReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    donorEngineInvoked: false,
    donorEngineInvocationAttempted: false,
    donorEnginePayloadAssemblyEnabled: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

const boardFamilyProjectionSummary = (overrides = {}) => safeBase({
  schemaId: "controlstack.runtime.safe-board-family-projection",
  boardFamilyProjectionReady: true,
  boardFamilyProjectionFingerprint: "safe-board-family-projection:controlled-donor-bridge-fixture",
  boardOptionSummary: { safeSummaryOnly: true, boardOptionCountBand: "2-5", rawBoardRowsReturned: false },
  ...overrides,
});
const driverCandidateProjectionSummary = (overrides = {}) => safeBase({
  schemaId: "controlstack.runtime.safe-driver-candidate-projection",
  driverCandidateProjectionReady: true,
  driverCandidateProjectionFingerprint: "safe-driver-candidate-projection:controlled-donor-bridge-fixture",
  driverOptionSummary: { safeSummaryOnly: true, driverCandidateCountBand: "2-5", rawDriverRowsReturned: false, exactElectricalValuesReturned: false },
  ...overrides,
});
const curveReferenceSummary = (overrides = {}) => safeBase({
  schemaId: "controlstack.runtime.safe-curve-reference-summary",
  curveReferenceSummaryReady: true,
  curveReferenceFingerprint: "safe-curve-reference:controlled-donor-bridge-fixture",
  iesPhotometryReferenceSummary: { safeSummaryOnly: true, photometryReferenceReady: true, rawIesContentReturned: false, rawPhotometryReturned: false, candelaArraysReturned: false, base64ArtifactsReturned: false },
  ...overrides,
});
const physicalPlacementSummary = (overrides = {}) => safeBase({
  schemaId: "controlstack.runtime.safe-physical-placement-summary",
  physicalPlacementSummaryReady: true,
  placementSummaryFingerprint: "safe-physical-placement-summary:controlled-donor-bridge-fixture",
  placementBandSummary: { safeSummaryOnly: true, boardPlacementCountBand: "2-5", reservedRangeCountBand: "0", rawCoordinatesReturned: false, exactPlacementCoordinatesReturned: false },
  ...overrides,
});
const gateDValidationScaffoldSummary = (overrides = {}) => safeBase({
  schemaId: "controlstack.runtime.engine-runtable.gate-d-validation-scaffold-summary",
  nativeRuntimeKernel: true,
  gateDScaffoldReady: true,
  gateDValidationScaffoldFingerprint: "safe-gate-d-validation-scaffold:controlled-donor-bridge-fixture",
  validationReadiness: { gateDScaffoldReady: true, sealedCandidateAssemblyReady: true, donorGateDExactValidationReady: false, donorEngineReady: false, runTableReady: false, iesReady: false },
  ...overrides,
});
const sealedCandidateAssemblyPreviewSummary = (overrides = {}) => safeBase({
  schemaId: "controlstack.runtime.engine-runtable.sealed-candidate-assembly-preview-summary",
  nativeRuntimeKernel: true,
  sealedCandidateAssemblyPreviewReady: true,
  sealedCandidateAssemblyPreviewFingerprint: "safe-sealed-candidate-assembly-preview:controlled-donor-bridge-fixture",
  candidateReadinessSummary: { diagnosticOnly: true, readyForFutureCandidateHandoff: true, productionEngineExecutionReady: false, donorEnginePayloadReady: false, runTableReady: false, iesReady: false, selectedResultPersistenceReady: false },
  ...overrides,
});
const runTableDomainOutputScaffoldSummary = (overrides = {}) => safeBase({
  schemaId: "controlstack.runtime.engine-runtable.runtable-domain-output-scaffold-summary",
  nativeRuntimeKernel: true,
  runTableDomainOutputScaffoldReady: true,
  runTableDomainOutputScaffoldFingerprint: "safe-runtable-domain-output-scaffold:controlled-donor-bridge-fixture",
  runTableDomainReadinessSummary: { diagnosticOnly: true, runTableDomainOutputScaffoldReady: true, domainOutputReady: true, productionRunTableReady: false, donorEngineReady: false, donorEnginePayloadReady: false, selectedResultPersistenceReady: false, iesReady: false, routesReady: false, postEndpointsReady: false },
  ...overrides,
});
const safeSyntheticRawResultFixture = (overrides = {}) => ({
  accepted: true,
  status: "accepted",
  safeFixtureMarker: "synthetic-donor-engine-result-fixture",
  run_count: 2,
  candidate_count: 3,
  warningCategories: ["none"],
  ...overrides,
});
const readonlyEngineStep1SafeSummary = (overrides = {}) => ({
  schemaId: "controlstack.runtime.selector-readonly-engine-step1-safe-summary.v1",
  schemaVersion: 1,
  state: "selector_readonly_engine_step1_safe_summary_ready",
  ok: true,
  readonlyEngineStep1Ready: true,
  blocker: null,
  mapperReady: true,
  hostLocalReadonlyEngineSeamInvoked: true,
  hostLocalReadonlyEngineResultProduced: true,
  seam: "engine-runtable-internal-readonly-invoke",
  seamVersion: "engine_runtable_internal_readonly_invoke.v1",
  safeEngineSummary: {
    success: true,
    runCount: 2,
    errorCount: 0,
    warningCount: 1,
    firstError: "",
    firstWarning: "safe warning category only",
    selectedTier: "business",
    outputContractReady: true,
    safeRunSummaryCount: 2,
    safeRunSummaries: [
      { runIndex: 0, boardCount: 2, segmentCount: 1, zoneCount: 1, rawRunReturned: false },
      { runIndex: 1, boardCount: 3, segmentCount: 1, zoneCount: 1, rawRunReturned: false },
    ],
    rawResultReturned: false,
    rawDebugReturned: false,
    rawRoughElectricalPayloadReturned: false,
  },
  safeCandidateDerivation: {
    candidateFingerprint: "safe-selector-readonly-engine-candidate:controlled-donor-bridge-fixture",
    rawCandidateReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
  },
  readonlyEngineStep1Fingerprint: "safe-selector-readonly-engine-step1:controlled-donor-bridge-fixture",
  candidatePayloadReturned: false,
  rawSelectorPayloadReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  rawRowsReturned: false,
  rawUsersReturned: false,
  rawCrmReturned: false,
  rawContactsReturned: false,
  privatePathsReturned: false,
  credentialsReturned: false,
  runtimeDataMutationEnabled: false,
  selectedResultPersistenceEnabled: false,
  selectedResultPersisted: false,
  runTableGenerationEnabled: false,
  runTableGenerated: false,
  iesGenerationEnabled: false,
  iesGenerated: false,
  routesAdded: false,
  postEndpointsAdded: false,
  ...overrides,
});

function bridgeInput(overrides = {}) {
  return {
    privateBridgeGateApproved: true,
    syntheticFixtureOnly: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    boardFamilyProjectionSummary: boardFamilyProjectionSummary(),
    driverCandidateProjectionSummary: driverCandidateProjectionSummary(),
    curveReferenceSummary: curveReferenceSummary(),
    physicalPlacementSummary: physicalPlacementSummary(),
    gateDValidationScaffoldSummary: gateDValidationScaffoldSummary(),
    sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary(),
    runTableDomainOutputScaffoldSummary: runTableDomainOutputScaffoldSummary(),
    rawDonorResultFixture: safeSyntheticRawResultFixture(),
    ...overrides,
  };
}
const blockerFor = (overrides = {}) => buildControlledDonorEngineVerifyBridgeSummary(bridgeInput(overrides)).blocker;

test("fails closed by default with donor-engine-invocation-not-approved", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary();
  assert.equal(result.ok, false);
  assert.equal(result.blocker, "donor-engine-invocation-not-approved");
  assert.equal(result.schemaId, CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_ID);
  assert.equal(result.schemaVersion, CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_VERSION);
  assert.equal(result.privateBridgeOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.readOnly, true);
  assert.equal(result.safetyFlags.donorEngineInvoked, false);
});

test("aliases point at the same controlled donor Engine bridge helper", () => {
  assert.equal(buildRuntimeControlledDonorEngineVerifyBridgeSummary, buildControlledDonorEngineVerifyBridgeSummary);
  assert.equal(buildEngineRunTableControlledDonorEngineVerifyBridgeStatus, buildControlledDonorEngineVerifyBridgeSummary);
});

test("accepts safe upstream projections and still blocks without private gate", () => {
  const { privateBridgeGateApproved, ...withoutGate } = bridgeInput();
  const result = buildControlledDonorEngineVerifyBridgeSummary(withoutGate);
  assert.equal(privateBridgeGateApproved, true);
  assert.equal(result.ok, false);
  assert.equal(result.blocker, "donor-engine-invocation-not-approved");
  assert.equal(result.projectionFingerprints.boardFamilyProjectionSummary, "safe-board-family-projection:controlled-donor-bridge-fixture");
  assert.equal(result.scaffoldFingerprints.runTableDomainOutputScaffoldSummary, "safe-runtable-domain-output-scaffold:controlled-donor-bridge-fixture");
});

test("accepts only a synthetic-fixture private gate", () => {
  assert.equal(blockerFor({ syntheticFixtureOnly: false }), "synthetic-fixture-only-required");
});

test("accepts complete safe summaries and a synthetic donor-shaped raw result fixture", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary(bridgeInput());
  assert.equal(result.ok, true);
  assert.equal(result.bridgeReady, true);
  assert.equal(result.safeEngineResultReady, true);
  assert.equal(result.selectedResultSourceObjectReady, false);
  assert.equal(result.runTableDomainReadinessReady, true);
  assert.equal(result.iesHandoffReadinessReady, false);
  assert.equal(result.syntheticFixtureOnly, true);
  assert.equal(result.verificationMode, "synthetic-fixture-contract");
  assert.equal(result.broadCountBands.runCountBand, "2-5");
  assert.match(result.opaqueResultToken, /^safe-donor-engine-result-token:/);
  assert.equal(result.redactionFlags.rawDonorResultScanned, true);
  assert.equal(result.redactionFlags.rawDonorResultReturned, false);
});

test("accepts private readonly seam Step 1 safe summary as real verification summary", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary({
    privateReadonlySeamBridgeGateApproved: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    readonlyEngineStep1SafeSummary: readonlyEngineStep1SafeSummary(),
  });

  assert.equal(result.ok, true);
  assert.equal(result.bridgeReady, true);
  assert.equal(result.state, "controlled_donor_engine_verify_bridge_real_readonly_seam_summary");
  assert.equal(result.syntheticFixtureOnly, false);
  assert.equal(result.verificationMode, "real-readonly-seam-summary");
  assert.equal(result.readonlySeamSummaryOnly, true);
  assert.equal(result.realEngineVerificationSummaryAvailable, true);
  assert.equal(result.selectedResultSourceObjectReady, false);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.equal(result.outputsReady, false);
  assert.match(result.opaqueResultToken, /^safe-real-engine-verification-token:/);
  assert.equal(result.safetyFlags.hostLocalReadonlyEngineSeamSummaryConsumed, true);
  assert.equal(result.safetyFlags.runTableGenerated, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
});

test("rejects readonly seam summary without the private bridge gate", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    readonlyEngineStep1SafeSummary: readonlyEngineStep1SafeSummary(),
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "private-readonly-engine-verification-bridge-gate-required");
  assert.equal(result.verificationMode, "readonly-seam-summary-only");
  assert.equal(result.readonlySeamSummaryOnly, true);
  assert.equal(result.realEngineVerificationSummaryAvailable, false);
  assert.equal(result.outputsReady, false);
});

test("rejects required missing or unready upstream summaries", () => {
  assert.equal(blockerFor({ boardFamilyProjectionSummary: null }), "missing-board-family-projection");
  assert.equal(blockerFor({ driverCandidateProjectionSummary: null }), "missing-driver-candidate-projection");
  assert.equal(blockerFor({ curveReferenceSummary: null }), "missing-curve-reference-summary");
  assert.equal(blockerFor({ physicalPlacementSummary: null }), "missing-physical-placement-summary");
  assert.equal(blockerFor({ gateDValidationScaffoldSummary: null }), "missing-gate-d-readiness");
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: null }), "missing-sealed-candidate-assembly-readiness");
  assert.equal(blockerFor({ runTableDomainOutputScaffoldSummary: null }), "missing-runtable-domain-scaffold-readiness");
});

test("rejects fingerprint mismatch", () => {
  assert.equal(blockerFor({ boardFamilyProjectionSummary: boardFamilyProjectionSummary({ sourceFingerprint: "safe-source:mismatch" }) }), "fingerprint-mismatch");
});

test("rejects any deny-listed raw result key", () => {
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ verified_runs: [{ id: "raw" }] }) }), "deny-listed-raw-result-key");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ selectedResultBody: { body: "raw" } }) }), "deny-listed-raw-result-key");
});

test("rejects raw Engine payload/result flags", () => {
  assert.equal(blockerFor({ rawEnginePayloadReturned: true }), "raw-engine-payload-or-result-not-approved");
  assert.equal(blockerFor({ rawEngineResultReturned: true }), "raw-engine-payload-or-result-not-approved");
});

test("rejects exact electrical values and exact placement coordinates", () => {
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ voltage_v: 24 }) }), "exact-electrical-values-not-approved");
  assert.equal(blockerFor({ exactElectricalValuesReturned: true }), "exact-electrical-values-not-approved");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ exactPlacementCoordinates: [0, 1200] }) }), "exact-placement-coordinates-not-approved");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ placements: [{ start_mm: 0, end_mm: 1200 }] }) }), "deny-listed-raw-result-key");
});

test("rejects raw IES, photometry, candela, base64, source rows, private data, and private paths", () => {
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ iesText: "IESNA:LM-63-2019" }) }), "deny-listed-raw-result-key");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ safeFixtureMarker: "data:application/pdf;base64,AAAA" }) }), "raw-photometry-or-artifact-not-approved");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ boards: [{ row: "raw" }] }) }), "deny-listed-raw-result-key");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ USERS: [{ ref: "redacted" }] }) }), "deny-listed-raw-result-key");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ safeFixtureMarker: ["C:", "ControlStack", "private"].join("\\") }) }), "private-paths-not-approved");
  assert.equal(blockerFor({ rawDonorResultFixture: safeSyntheticRawResultFixture({ credentials: { redacted: true } }) }), "deny-listed-raw-result-key");
});

test("emits only sanitizer allow-listed top-level keys", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary(bridgeInput());
  const allowed = new Set(CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_ALLOWED_OUTPUT_KEYS);
  for (const key of Object.keys(result)) assert.equal(allowed.has(key), true, `unexpected key ${key}`);
  assert.equal(Object.hasOwn(result, "rawDonorResultFixture"), false);
  assert.equal(Object.hasOwn(result, "rawEngineResult"), false);
  assert.equal(Object.hasOwn(result, "enginePayload"), false);
});

test("produces deterministic safe bridge fingerprint", () => {
  const first = buildControlledDonorEngineVerifyBridgeSummary(bridgeInput());
  const second = buildControlledDonorEngineVerifyBridgeSummary(bridgeInput());
  assert.equal(first.bridgeFingerprint, second.bridgeFingerprint);
  assert.match(first.bridgeFingerprint, /^safe-controlled-donor-engine-verify-bridge:/);
});

test("does not expose raw payloads, rows, exact values, private data, or credentials", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary(bridgeInput());
  assert.equal(result.safetyFlags.rawDonorResultReturned, false);
  assert.equal(result.safetyFlags.rawEnginePayloadReturned, false);
  assert.equal(result.safetyFlags.rawEngineResultReturned, false);
  assert.equal(result.safetyFlags.rawSelectorPayloadReturned, false);
  assert.equal(result.safetyFlags.rawProductRowsReturned, false);
  assert.equal(result.safetyFlags.rawBoardRowsReturned, false);
  assert.equal(result.safetyFlags.rawDriverRowsReturned, false);
  assert.equal(result.safetyFlags.rawAccessoryRowsReturned, false);
  assert.equal(result.safetyFlags.exactElectricalValuesReturned, false);
  assert.equal(result.safetyFlags.exactPlacementCoordinatesReturned, false);
  assert.equal(result.safetyFlags.privatePathsReturned, false);
  assert.equal(result.safetyFlags.credentialsReturned, false);
});

test("does not invoke donor Engine, assemble real donor payloads, mutate RuntimeData, persist selected result, generate RunTable, or generate IES", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary(bridgeInput());
  assert.equal(result.safetyFlags.donorEngineInvoked, false);
  assert.equal(result.safetyFlags.donorEngineInvocationAttempted, false);
  assert.equal(result.safetyFlags.realDonorPayloadAssembled, false);
  assert.equal(result.safetyFlags.donorEnginePayloadAssemblyEnabled, false);
  assert.equal(result.safetyFlags.runtimeDataMutated, false);
  assert.equal(result.safetyFlags.selectedResultPersisted, false);
  assert.equal(result.safetyFlags.productionRunTableGenerated, false);
  assert.equal(result.safetyFlags.runTableGenerated, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
});

test("does not add routes or POST endpoints", () => {
  const result = buildControlledDonorEngineVerifyBridgeSummary(bridgeInput());
  assert.equal(result.safetyFlags.routesAdded, false);
  assert.equal(result.safetyFlags.publicRoutesAdded, false);
  assert.equal(result.safetyFlags.postEndpointsAdded, false);
});

test("helper source stays pure, private, and unmounted from server routes", async () => {
  const bridgeText = await readFile(bridgeSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");
  assert.equal(bridgeText.includes("run_engine.py"), false);
  assert.equal(bridgeText.includes("import(\""), false);
  assert.equal(bridgeText.includes("node:"), false);
  assert.equal(bridgeText.includes("crypto"), false);
  assert.equal(bridgeText.includes("node:fs"), false);
  assert.equal(bridgeText.includes("node:path"), false);
  assert.equal(bridgeText.includes("fetch("), false);
  assert.equal(bridgeText.includes("router.post"), false);
  assert.equal(bridgeText.includes("app.post"), false);
  assert.equal(bridgeText.includes("selectedResultPersistenceEnabled: true"), false);
  assert.equal(bridgeText.includes("iesGenerationEnabled: true"), false);
  assert.equal(bridgeText.includes("productionRunTableGenerationEnabled: true"), false);
  assert.equal(serverText.includes("engineRunTableControlledDonorEngineVerifyBridge"), false);
  assert.equal(/POST[\s\S]{0,220}controlled-donor-engine-verify-bridge/i.test(serverText), false);
  assert.equal(/controlled-donor-engine-verify-bridge[\s\S]{0,220}POST/i.test(serverText), false);
});
