import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeDriverSizerKernelSummary,
  ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeDriverSizerKernel.js";

const POLICY_FINGERPRINT = "safe-policy:driver-sizer-fixture";
const SOURCE_FINGERPRINT = "safe-source:driver-sizer-fixture";

function safeBoardFillSummary(overrides = {}) {
  return {
    schemaId: "controlstack.runtime.engine-runtable.board-fill-summary",
    schemaVersion: 1,
    state: "runtime_board_fill_diagnostic_only",
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: true,
    selectedBoardFamily: "Runtime Safe Linear Board Family",
    boardCount: 4,
    boardLengthMm: 1400,
    boardUsedLengthMm: 5600,
    slackMm: 0,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    rawRowsReturned: false,
    rawCurveRowsReturned: false,
    rawUsersReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    iesGenerated: false,
    runTableGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function safeBoardElectricalSummary(overrides = {}) {
  return {
    schemaId: "controlstack.runtime.engine-runtable.board-electrical-summary",
    schemaVersion: 1,
    state: "runtime_board_electrical_summary_diagnostic_only",
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: true,
    selectedBoardFamily: "Runtime Safe Linear Board Family",
    boardCount: 4,
    boardLengthMm: 1400,
    boardUsedLengthMm: 5600,
    selectedCurrentMa: 350,
    boardVoltageClass: "safe-band:board-vf-0-24v",
    boardVoltageStatus: "banded-only-exact-values-suppressed",
    boardPowerClass: "safe-band:board-power-5-20w",
    boardPowerStatus: "banded-only-exact-values-suppressed",
    electricalSummaryReady: true,
    exactElectricalValuesExposed: false,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    summaryFingerprint: "safe-board-electrical:driver-sizer-fixture",
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawCurveRowsReturned: false,
    rawUsersReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    iesGenerated: false,
    runTableGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function driverUtilLookupMetadata(overrides = {}) {
  return {
    ok: true,
    contract_id: "controlstack.runtime.driver-util-curve.lookup-contract",
    contract_version: 1,
    lookup_method: "safe-driver-model-token",
    match_count: 1,
    curve: {
      filename: "driver_util_safe_fixture.json",
      size_bytes: 128,
      sha256: "a".repeat(64),
      source_classification: "donor-static-driver-util-mirror",
      raw_payload_returned: false,
      raw_curve_points_returned: false,
    },
    raw_payload_returned: false,
    raw_curve_points_returned: false,
    safetyFlags: {
      raw_payload_returned: false,
      raw_curve_points_returned: false,
      rawDriverUtilPayloadsExposed: false,
      rawCurvePointsReturned: false,
      activeSnapshotMutated: false,
      runtimeDataMutated: false,
      donorFilesMutated: false,
      boardDataMakerImported: false,
      donorEngineInvoked: false,
      driverSizingImplemented: false,
      driverSelectionPerformed: false,
      iesGenerated: false,
      selectedResultPersisted: false,
      publicRouteAdded: false,
      postEndpointAdded: false,
    },
    ...overrides,
  };
}

function safeDriverCandidate(overrides = {}) {
  return {
    safeModelToken: "safe-driver-a",
    safeModelLabel: "Safe Driver A",
    approved: true,
    supplyType: "constant-current",
    currentMinMa: 250,
    currentMaxMa: 700,
    nativeControlType: "DALI-2",
    utilisationBand: "near-target",
    utilisationDistanceBand: "near-target",
    capacityBand: "high-headroom",
    headroomBand: "high",
    safeCostBand: "mid",
    zoneCountCandidate: 2,
    limitingFactorCategory: "power-band",
    driverUtilLookupMetadata: driverUtilLookupMetadata(),
    rawDriverRowsReturned: false,
    rawDriverUtilPayloadReturned: false,
    rawCurvePointsReturned: false,
    ...overrides,
  };
}

function validInput(overrides = {}) {
  return {
    boardFillSummary: safeBoardFillSummary(),
    boardElectricalSummary: safeBoardElectricalSummary(),
    selectedCurrentMa: 350,
    safeDriverCandidateSummaries: [safeDriverCandidate()],
    driverUtilLookupMetadata: driverUtilLookupMetadata({
      manifest: {
        valid: true,
        fileCount: 19,
        rawDriverUtilPayloadsIncluded: false,
        raw_payload_returned: false,
        raw_curve_points_returned: false,
      },
    }),
    policySummary: {
      summaryType: "runtime-policy-safe-driver-utilisation-summary",
      driverUtilTargetBand: "near-target",
      rawRowsReturned: false,
    },
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    requireDali: true,
    ...overrides,
  };
}

function assertSafeNegativeSideEffects(result) {
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverUtilPayloadReturned, false);
  assert.equal(result.rawCurvePointsReturned, false);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
}

test("runtime driver sizer kernel produces a safe diagnostic summary", () => {
  const result = buildRuntimeDriverSizerKernelSummary(validInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.driverSizerReady, true);
  assert.equal(result.driverCandidateCount, 1);
  assert.equal(result.compatibleDriverCandidateCount, 1);
  assert.equal(result.selectedDriverSummary.safeModelToken, "safe-driver-a");
  assert.equal(result.selectedDriverSummary.daliCapable, true);
  assert.equal(result.currentRangeStatus, "selected-current-within-safe-driver-range");
  assert.equal(result.utilisationSource, "runtime-driver-util-safe-driver-model-token");
  assert.equal(result.utilisationBand, "near-target");
  assert.equal(result.capacityBand, "high-headroom");
  assert.equal(result.zoneCountCandidate, 2);
  assert.equal(result.limitingFactorCategory, "power-band-limited");
  assert.match(result.driverSizerFingerprint, /^safe-driver-sizer:[0-9a-f]{40}$/);
  assert.deepEqual(result.failClosedDiagnostics, []);
  assertSafeNegativeSideEffects(result);
});

test("current-range filtering accepts compatible drivers and rejects incompatible drivers", () => {
  const result = buildRuntimeDriverSizerKernelSummary(validInput({
    safeDriverCandidateSummaries: [
      safeDriverCandidate({ safeModelToken: "too-low", safeModelLabel: "Too Low", currentMaxMa: 300 }),
      safeDriverCandidate({ safeModelToken: "accepted", safeModelLabel: "Accepted", currentMinMa: 300, currentMaxMa: 500 }),
    ],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.driverCandidateCount, 2);
  assert.equal(result.compatibleDriverCandidateCount, 1);
  assert.equal(result.selectedDriverSummary.safeModelToken, "accepted");
  assert.equal(result.rejectedReasonBuckets["current-range-mismatch"], 1);
  assertSafeNegativeSideEffects(result);
});

test("DALI required filters non-DALI drivers and DALI not required allows them", () => {
  const daliRequired = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: true,
    safeDriverCandidateSummaries: [
      safeDriverCandidate({ safeModelToken: "non-dali", safeModelLabel: "Non DALI", nativeControlType: "Non-Dim" }),
      safeDriverCandidate({ safeModelToken: "dali", safeModelLabel: "DALI", nativeControlType: "DALI" }),
    ],
  }));

  assert.equal(daliRequired.ok, true);
  assert.equal(daliRequired.selectedDriverSummary.safeModelToken, "dali");
  assert.equal(daliRequired.rejectedReasonBuckets["dali-required-incompatible"], 1);

  const daliNotRequired = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: false,
    safeDriverCandidateSummaries: [
      safeDriverCandidate({ safeModelToken: "non-dali", safeModelLabel: "A Non DALI", nativeControlType: "Non-Dim" }),
    ],
  }));

  assert.equal(daliNotRequired.ok, true);
  assert.equal(daliNotRequired.selectedDriverSummary.safeModelToken, "non-dali");
  assert.equal(daliNotRequired.selectedDriverSummary.daliCapable, false);
  assertSafeNegativeSideEffects(daliNotRequired);
});

test("unapproved candidates are rejected by default", () => {
  const result = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: false,
    safeDriverCandidateSummaries: [
      safeDriverCandidate({ safeModelToken: "unapproved", safeModelLabel: "Unapproved", approved: false }),
      safeDriverCandidate({ safeModelToken: "approved", safeModelLabel: "Approved", approved: true }),
    ],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.selectedDriverSummary.safeModelToken, "approved");
  assert.equal(result.rejectedReasonBuckets["unapproved-candidate"], 1);
});

test("constant-current supply filtering rejects constant-voltage candidates", () => {
  const result = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: false,
    safeDriverCandidateSummaries: [
      safeDriverCandidate({ safeModelToken: "constant-voltage", safeModelLabel: "Constant Voltage", supplyType: "constant-voltage" }),
      safeDriverCandidate({ safeModelToken: "constant-current", safeModelLabel: "Constant Current", supplyType: "cc" }),
    ],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.selectedDriverSummary.safeModelToken, "constant-current");
  assert.equal(result.rejectedReasonBuckets["non-constant-current-supply"], 1);
});

test("driver-util metadata source is accepted without returning raw payloads or curve points", () => {
  const result = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: false,
    safeDriverCandidateSummaries: [
      safeDriverCandidate({ driverUtilLookupMetadata: undefined }),
    ],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.utilisationSource, "runtime-driver-util-manifest-metadata");
  assert.equal(result.rawDriverUtilPayloadReturned, false);
  assert.equal(result.rawCurvePointsReturned, false);
  assert.equal(JSON.stringify(result).includes("raw payload"), false);
});

test("deterministic ranking follows zone count, utilisation band, headroom, preferred token, cost band, then label", () => {
  const result = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: true,
    preferredSafeModelToken: "preferred-driver",
    safeDriverCandidateSummaries: [
      safeDriverCandidate({
        safeModelToken: "alpha-driver",
        safeModelLabel: "Alpha Driver",
        zoneCountCandidate: 3,
        utilisationBand: "near-target",
        headroomBand: "high",
        safeCostBand: "low",
      }),
      safeDriverCandidate({
        safeModelToken: "preferred-driver",
        safeModelLabel: "Preferred Driver",
        zoneCountCandidate: 2,
        utilisationBand: "near-target",
        headroomBand: "moderate",
        safeCostBand: "mid",
      }),
      safeDriverCandidate({
        safeModelToken: "headroom-driver",
        safeModelLabel: "Headroom Driver",
        zoneCountCandidate: 2,
        utilisationBand: "near-target",
        headroomBand: "high",
        safeCostBand: "high",
      }),
      safeDriverCandidate({
        safeModelToken: "cost-driver",
        safeModelLabel: "Cost Driver",
        zoneCountCandidate: 2,
        utilisationBand: "near-target",
        headroomBand: "high",
        safeCostBand: "low",
      }),
    ],
  }));

  assert.equal(result.ok, true);
  assert.equal(result.selectedDriverSummary.safeModelToken, "cost-driver");
  assert.deepEqual(result.selectedDriverSummary.rankingBasis, [
    "lowest-zone-count-candidate",
    "closest-utilisation-target-band",
    "greater-headroom-band",
    "dali-required-compatible",
    "preferred-safe-model-token-applied",
    "safe-cost-band-only-when-supplied",
    "alphabetical-safe-model-label-token",
  ]);
});

test("missing board-fill and board electrical summaries fail closed", () => {
  const missingFill = buildRuntimeDriverSizerKernelSummary({
    boardElectricalSummary: safeBoardElectricalSummary(),
    selectedCurrentMa: 350,
    safeDriverCandidateSummaries: [safeDriverCandidate()],
    driverUtilLookupMetadata: driverUtilLookupMetadata(),
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
  });
  assert.equal(missingFill.ok, false);
  assert.equal(missingFill.blocker, "missing-board-fill-summary");
  assertSafeNegativeSideEffects(missingFill);

  const missingElectrical = buildRuntimeDriverSizerKernelSummary({
    boardFillSummary: safeBoardFillSummary(),
    selectedCurrentMa: 350,
    safeDriverCandidateSummaries: [safeDriverCandidate()],
    driverUtilLookupMetadata: driverUtilLookupMetadata(),
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
  });
  assert.equal(missingElectrical.ok, false);
  assert.equal(missingElectrical.blocker, "missing-board-electrical-summary");
  assertSafeNegativeSideEffects(missingElectrical);
});

test("unsafe raw row-like input fails closed", () => {
  const rawDriver = buildRuntimeDriverSizerKernelSummary(validInput({
    safeDriverCandidateSummaries: [
      safeDriverCandidate({
        DRIVERS: [{ model: "RAW-DRIVER", vout_max_v: 54, pout_max_w: 75 }],
      }),
    ],
  }));
  assert.equal(rawDriver.ok, false);
  assert.equal(rawDriver.blocker, "no-compatible-drivers");
  assert.equal(rawDriver.rejectedReasonBuckets["unsafe-raw-driver-row-input"], 1);
  assertSafeNegativeSideEffects(rawDriver);

  const rawBoard = buildRuntimeDriverSizerKernelSummary({
    ...validInput(),
    BOARDS: [{ part_number: "RAW-BOARD", c1_vmax_v: 22.4 }],
  });
  assert.equal(rawBoard.ok, false);
  assert.equal(rawBoard.blocker, "unsafe-raw-board-row-input");
  assertSafeNegativeSideEffects(rawBoard);
});

test("raw driver-util payload and curve point inputs fail closed", () => {
  const rawPayload = buildRuntimeDriverSizerKernelSummary(validInput({
    driverUtilLookupMetadata: {
      ok: true,
      rawDriverUtilPayloadsExposed: true,
      driverUtilPayload: { curves: [] },
    },
    safeDriverCandidateSummaries: [safeDriverCandidate({ driverUtilLookupMetadata: undefined })],
  }));
  assert.equal(rawPayload.ok, false);
  assert.equal(rawPayload.blocker, "invalid-driver-util-lookup");
  assertSafeNegativeSideEffects(rawPayload);

  const rawCurvePoints = buildRuntimeDriverSizerKernelSummary(validInput({
    curvePoints: [{ current_ma: 350, utilisation_factor: 0.88 }],
  }));
  assert.equal(rawCurvePoints.ok, false);
  assert.equal(rawCurvePoints.blocker, "unsafe-curve-point-input");
  assertSafeNegativeSideEffects(rawCurvePoints);
});

test("selected-current mismatch, missing fingerprints, fingerprint mismatch, and exact exposure requests fail closed", () => {
  const currentMismatch = buildRuntimeDriverSizerKernelSummary(validInput({ selectedCurrentMa: 500 }));
  assert.equal(currentMismatch.ok, false);
  assert.equal(currentMismatch.blocker, "selected-current-mismatch");

  const missingPolicy = buildRuntimeDriverSizerKernelSummary(validInput({ policyFingerprint: "" }));
  assert.equal(missingPolicy.ok, false);
  assert.equal(missingPolicy.blocker, "missing-policy-fingerprint");

  const missingSource = buildRuntimeDriverSizerKernelSummary(validInput({ sourceFingerprint: "" }));
  assert.equal(missingSource.ok, false);
  assert.equal(missingSource.blocker, "missing-source-fingerprint");

  const mismatch = buildRuntimeDriverSizerKernelSummary(validInput({
    boardElectricalSummary: safeBoardElectricalSummary({ policyFingerprint: "safe-policy:other-fixture" }),
  }));
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.blocker, "fingerprint-mismatch");

  const exact = buildRuntimeDriverSizerKernelSummary(validInput({ requestExactElectricalValues: true }));
  assert.equal(exact.ok, false);
  assert.equal(exact.blocker, "exact-value-exposure-not-approved");
  assertSafeNegativeSideEffects(exact);
});

test("unsupported control type and no compatible drivers fail closed", () => {
  const unsupported = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: false,
    safeDriverCandidateSummaries: [safeDriverCandidate({ nativeControlType: "DMX" })],
  }));
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.blocker, "unsupported-control-type");
  assert.equal(unsupported.rejectedReasonBuckets["unsupported-control-type"], 1);

  const none = buildRuntimeDriverSizerKernelSummary(validInput({
    requireDali: false,
    safeDriverCandidateSummaries: [safeDriverCandidate({ currentMinMa: 500, currentMaxMa: 700 })],
  }));
  assert.equal(none.ok, false);
  assert.equal(none.blocker, "no-compatible-drivers");
  assert.equal(none.rejectedReasonBuckets["current-range-mismatch"], 1);
  assertSafeNegativeSideEffects(none);
});

test("raw driver and board rows, raw util payloads, and curve points are not returned", () => {
  const result = buildRuntimeDriverSizerKernelSummary(validInput());
  const serialised = JSON.stringify(result);

  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverUtilPayloadReturned, false);
  assert.equal(result.rawCurvePointsReturned, false);
  assert.equal(result.safetyFlags.rawDriverRowsReturned, false);
  assert.equal(result.safetyFlags.rawBoardRowsReturned, false);
  assert.equal(result.safetyFlags.rawDriverUtilPayloadReturned, false);
  assert.equal(result.safetyFlags.rawCurvePointsReturned, false);
  assert.equal(serialised.includes("RAW-DRIVER"), false);
  assert.equal(serialised.includes("RAW-BOARD"), false);
  assert.equal(serialised.includes("DRIVERS"), false);
  assert.equal(serialised.includes("BOARDS"), false);
  assert.equal(serialised.includes("currentMinMa"), false);
  assert.equal(serialised.includes("currentMaxMa"), false);
  assert.equal(serialised.includes("vout_max_v"), false);
  assert.equal(serialised.includes("pout_max_w"), false);
  assert.equal(serialised.includes("curvePoints"), false);
  assert.equal(serialised.includes("C:\\"), false);
});

test("driver sizer kernel does not invoke donor Engine, mutate RuntimeData, persist selected result, generate IES/RunTable, or add routes/POST endpoints", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/engineRunTableRuntimeDriverSizerKernel.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(/from\s+["'][^"']*run_engine/.test(sourceText), false);
  assert.equal(/run_engine\s*\(/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*electrical_sizer/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*driver_selector/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*BoardDataMaker/.test(sourceText), false);
  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serverText.includes("engineRunTableRuntimeDriverSizerKernel"), false);
  assert.equal(serverText.includes("runtime-driver-sizer"), false);
  assert.equal(serverText.includes("app.post"), false);

  const result = buildRuntimeDriverSizerKernelSummary(validInput());
  assertSafeNegativeSideEffects(result);
});
