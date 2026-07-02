import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeGateDValidationScaffoldSummary,
  buildRuntimeNativeGateDValidationScaffoldSummary,
  buildEngineRunTableRuntimeGateDValidationScaffoldStatus,
  ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeGateDValidationScaffold.js";

const POLICY_FINGERPRINT = "safe-policy:gate-d-validation-scaffold-fixture";
const SOURCE_FINGERPRINT = "safe-source:gate-d-validation-scaffold-fixture";

function safeSummary(overrides = {}) {
  return {
    ok: true,
    diagnosticOnly: true,
    nativeRuntimeKernel: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawReservationGridReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    complianceApproved: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function accessoryReservationSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.accessory-reservation-foothold-summary",
    accessoryReservationReady: true,
    boardFillInputReady: true,
    reservationStatus: "none",
    reservationCount: 0,
    reservationLengthBand: "0mm",
    boardFillInputLengthMm: 5600,
    accessoryReservationFingerprint: "safe-reservation:gate-d-validation-scaffold-fixture",
    accessoryPlacementIntentSummary: {
      requestCount: 0,
      requestedAccessoryTypeBuckets: {},
      placementIntentBuckets: {},
      rawCoordinatesReturned: false,
      physicalPlacementReturned: false,
      rawAccessoryRowsReturned: false,
    },
    ...overrides,
  });
}

function boardFillInputSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-fill-input-summary",
    effectiveBoardFillLengthMm: 5600,
    reservationStatus: "none",
    boardFillInputFingerprint: "safe-board-fill-input:gate-d-validation-scaffold-fixture",
    ...overrides,
  });
}

function boardFillSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-fill-summary",
    runLengthMm: 5600,
    bodyLengthMm: 5600,
    selectedTierOrProfile: "Business",
    selectedBoardFamily: "sealed-board-family",
    boardCount: 4,
    boardLengthMm: 1400,
    boardUsedLengthMm: 5600,
    ...overrides,
  });
}

function boardElectricalSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-electrical-summary",
    electricalSummaryReady: true,
    selectedCurrentMa: 350,
    boardVoltageClass: "safe-band:board-vf-24-48v",
    boardPowerClass: "safe-band:board-power-5-20w",
    summaryFingerprint: "safe-board-electrical:gate-d-validation-scaffold-fixture",
    exactElectricalValuesExposed: false,
    ...overrides,
  });
}

function driverSizerSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.driver-sizer-summary",
    driverSizerReady: true,
    driverCandidateCount: 2,
    compatibleDriverCandidateCount: 1,
    currentRangeStatus: "selected-current-within-safe-driver-range",
    utilisationBand: "target-band",
    capacityBand: "moderate-headroom-band",
    zoneCountCandidate: 2,
    limitingFactorCategory: "power-band-limited",
    driverSizerFingerprint: "safe-driver-sizer:gate-d-validation-scaffold-fixture",
    selectedDriverSummary: {
      safeModelToken: "driver-a",
      safeModelLabel: "Driver A",
      zoneCountCandidate: 2,
      limitingFactorCategory: "power-band-limited",
      rawDriverRowsReturned: false,
      rawDriverUtilPayloadReturned: false,
      rawCurvePointsReturned: false,
    },
    ...overrides,
  });
}

function segmentZoneBridgeSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.sealed-segment-zone-bridge-summary",
    segmentZoneBridgeReady: true,
    segmentZoneBridgeFingerprint: "safe-segment-zone-bridge:gate-d-validation-scaffold-fixture",
    frozenSegmentSummary: {
      summaryType: "sealed-frozen-physical-segment-summary",
      segmentCount: 2,
      boardPlacementCount: 4,
      rawBoardRowsReturned: false,
    },
    joinModeSummary: {
      secondaryAcrossSegment: "forbid",
      allowCrossSegmentJoins: false,
      compareModeRequested: false,
      crossJoinComparisonScoringEnabled: false,
      crossNoCrossComparisonDeferred: false,
    },
    noCrossZoneContainmentSummary: {
      diagnosticOnly: true,
      zoneCount: 2,
      containedZoneCount: 2,
      crossJoinZoneCount: 0,
      zonesCrossSegmentJoin: false,
      fullZoneSolverInvoked: false,
      crossJoinComparisonScoringEnabled: false,
      rawEnginePayloadReturned: false,
    },
    validationReadiness: {
      segmentZoneBridgeReady: true,
      noCrossZoneContainmentDiagnosticsReady: true,
      crossNoCrossComparisonReady: false,
      gateDValidationReady: false,
    },
    ...overrides,
  });
}

function zoneValidationFootholdSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.zone-validation-foothold-summary",
    zoneValidationFootholdReady: true,
    zoneValidationFootholdFingerprint: "safe-zone-validation-foothold:gate-d-validation-scaffold-fixture",
    noCrossValidationSummary: {
      validationMode: "sealed-no-cross-zone-containment",
      noCrossValidationReady: true,
      zonesCrossSegmentJoin: false,
      crossJoinComparisonScoringEnabled: false,
      rawEnginePayloadReturned: false,
    },
    joinModeSummary: {
      secondaryAcrossSegment: "forbid",
      crossJoinComparisonScoringEnabled: false,
      compareModeRequested: false,
    },
    validationReadiness: {
      zoneValidationFootholdReady: true,
      noCrossValidationReady: true,
      crossJoinValidationReady: false,
      compareJoinModeValidationReady: false,
      gateDValidationReady: false,
    },
    ...overrides,
  });
}

function emergencyZonePickerFootholdSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.emergency-zone-picker-foothold-summary",
    emergencyZonePickerReady: true,
    emergencyZonePickerFingerprint: "safe-emergency-zone-picker:gate-d-validation-scaffold-fixture",
    selectedZoneIntentSummary: {
      emergencyType: "marker-only",
      selectedZoneIndexes: [0],
      physicalHardwareRequired: false,
      complianceProofRequired: false,
      rawEmergencyPayloadReturned: false,
    },
    complianceBoundary: {
      complianceProofRequired: false,
      complianceProofReady: false,
      complianceApproved: false,
    },
    physicalHardwareBoundary: {
      physicalHardwareRequired: false,
      upstreamReservationProven: false,
      physicalHardwareReservedHere: false,
    },
    validationReadiness: {
      emergencyZonePickerReady: true,
      complianceProofReady: false,
      gateDValidationReady: false,
    },
    ...overrides,
  });
}

function scaffoldInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    accessoryReservationSummary: accessoryReservationSummary(),
    boardFillInputSummary: boardFillInputSummary(),
    boardFillSummary: boardFillSummary(),
    boardElectricalSummary: boardElectricalSummary(),
    driverSizerSummary: driverSizerSummary(),
    segmentZoneBridgeSummary: segmentZoneBridgeSummary(),
    zoneValidationFootholdSummary: zoneValidationFootholdSummary(),
    emergencyZonePickerFootholdSummary: emergencyZonePickerFootholdSummary(),
    ...overrides,
  };
}

const REQUIRED_SUMMARY_BLOCKERS = [
  ["accessoryReservationSummary", "missing-accessory-reservation-summary"],
  ["boardFillInputSummary", "missing-board-fill-input-summary"],
  ["boardFillSummary", "missing-board-fill-summary"],
  ["boardElectricalSummary", "missing-board-electrical-summary"],
  ["driverSizerSummary", "missing-driver-sizer-summary"],
  ["segmentZoneBridgeSummary", "missing-segment-zone-bridge-summary"],
  ["zoneValidationFootholdSummary", "missing-zone-validation-foothold-summary"],
  ["emergencyZonePickerFootholdSummary", "missing-emergency-zone-picker-foothold-summary"],
];

test("accepts complete sealed upstream chain", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.gateDScaffoldReady, true);
  assert.equal(result.sealedReadinessSummary.candidateAssemblyReadiness, "ready-for-sealed-candidate-assembly");
  assert.equal(result.validationReadiness.sealedCandidateAssemblyReady, true);
  assert.equal(result.validationReadiness.donorGateDExactValidationReady, false);
});

test("aliases call the same Gate D validation scaffold helper", () => {
  const input = scaffoldInput();
  assert.deepEqual(buildRuntimeNativeGateDValidationScaffoldSummary(input), buildRuntimeGateDValidationScaffoldSummary(input));
  assert.deepEqual(buildEngineRunTableRuntimeGateDValidationScaffoldStatus(input), buildRuntimeGateDValidationScaffoldSummary(input));
});

test("emits ready-for-sealed-candidate-assembly category", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput());

  assert.equal(result.ok, true);
  assert.equal(result.sealedReadinessSummary.candidateAssemblyReadiness, "ready-for-sealed-candidate-assembly");
  assert.equal(result.validationReadiness.reason, "sealed-readiness-scaffold-ready-before-future-candidate-assembly");
});

test("rejects missing each required upstream summary", () => {
  for (const [key, blocker] of REQUIRED_SUMMARY_BLOCKERS) {
    const input = scaffoldInput();
    delete input[key];

    const result = buildRuntimeGateDValidationScaffoldSummary(input);

    assert.equal(result.ok, false, key);
    assert.equal(result.blocker, blocker, key);
    assert.equal(result.limitingFactorCategory, "blocked-by-upstream-summary", key);
    assert.equal(result.gateDScaffoldReady, false, key);
  }
});

test("rejects unsafe upstream summary", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput({
    boardFillSummary: boardFillSummary({ diagnosticOnly: false }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unsafe-board-fill-summary");
  assert.equal(result.limitingFactorCategory, "blocked-by-upstream-summary");
});

test("rejects upstream not ready", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput({
    driverSizerSummary: driverSizerSummary({ driverSizerReady: false }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "upstream-not-ready");
  assert.equal(result.limitingFactorCategory, "blocked-by-upstream-summary");
});

test("rejects fingerprint mismatch", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput({
    driverSizerSummary: driverSizerSummary({ sourceFingerprint: "safe-source:other-gate-d-validation-scaffold-fixture" }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "fingerprint-mismatch");
  assert.equal(result.limitingFactorCategory, "blocked-by-fingerprint-mismatch");
});

test("rejects cross/compare dependency", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput({
    segmentZoneBridgeSummary: segmentZoneBridgeSummary({
      joinModeSummary: {
        secondaryAcrossSegment: "compare",
        allowCrossSegmentJoins: false,
        compareModeRequested: true,
        crossJoinComparisonScoringEnabled: false,
        crossNoCrossComparisonDeferred: true,
      },
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "cross-compare-not-approved");
  assert.equal(result.limitingFactorCategory, "blocked-by-unapproved-cross-compare");
});

test("rejects unresolved accessory dependency", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput({
    accessoryReservationSummary: accessoryReservationSummary({ boardFillInputReady: false }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unresolved-accessory-reservation");
  assert.equal(result.limitingFactorCategory, "blocked-by-unresolved-accessory");
});

test("rejects emergency compliance proof required", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput({
    emergencyZonePickerFootholdSummary: emergencyZonePickerFootholdSummary({
      selectedZoneIntentSummary: {
        emergencyType: "egress-light",
        selectedZoneIndexes: [0],
        physicalHardwareRequired: false,
        complianceProofRequired: true,
        rawEmergencyPayloadReturned: false,
      },
      complianceBoundary: {
        complianceProofRequired: true,
        complianceProofReady: false,
        complianceApproved: false,
      },
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "emergency-compliance-proof-required");
  assert.equal(result.limitingFactorCategory, "blocked-by-emergency-compliance");
  assert.equal(result.complianceApproved, false);
});

test("rejects raw payload flags", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput({ rawEnginePayloadReturned: true }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "raw-payload-flag-detected");
  assert.equal(result.limitingFactorCategory, "blocked-by-unsafe-payload-flag");
  assert.equal(result.rawEnginePayloadReturned, false);
});

test("produces deterministic gateDValidationScaffoldFingerprint", () => {
  const first = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput());
  const second = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput());

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.gateDValidationScaffoldFingerprint, second.gateDValidationScaffoldFingerprint);
  assert.match(first.gateDValidationScaffoldFingerprint, /^safe-gate-d-validation-scaffold:[0-9a-f]{40}$/);
});

test("does not expose raw rows, payloads, or reservation grids", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput());

  assert.equal(result.ok, true);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawReservationGridReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.sealedReadinessSummary.rawEnginePayloadReturned, false);
  assert.equal(result.safetyFlags.rawProductRowsReturned, false);
  assert.equal(result.safetyFlags.rawReservationGridReturned, false);
  assert.equal(result.safetyFlags.rawEnginePayloadReturned, false);
});

test("does not invoke donor Engine, mutate RuntimeData, persist selected result, generate outputs, claim compliance, or add endpoints", () => {
  const result = buildRuntimeGateDValidationScaffoldSummary(scaffoldInput());

  assert.equal(result.ok, true);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.complianceApproved, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.safetyFlags.donorEngineInvoked, false);
  assert.equal(result.safetyFlags.runtimeDataMutationEnabled, false);
  assert.equal(result.safetyFlags.selectedResultPersistenceEnabled, false);
  assert.equal(result.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(result.safetyFlags.iesGenerationEnabled, false);
  assert.equal(result.safetyFlags.complianceApprovalEnabled, false);
  assert.equal(result.safetyFlags.publicRoutesAdded, false);
  assert.equal(result.safetyFlags.postEndpointsAdded, false);
});
