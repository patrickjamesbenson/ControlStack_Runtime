import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSealedSegmentZoneBridgeSummary,
} from "../packages/workspace-kernel/engineRunTableRuntimeSealedSegmentZoneBridge.js";

import {
  buildRuntimeZoneValidationFootholdSummary,
} from "../packages/workspace-kernel/engineRunTableRuntimeZoneValidationFootholdKernel.js";

import {
  buildRuntimeEmergencyZonePickerFootholdSummary,
  buildRuntimeNativeEmergencyZonePickerFootholdSummary,
  buildEngineRunTableRuntimeEmergencyZonePickerFootholdStatus,
  ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeEmergencyZonePickerFoothold.js";

const POLICY_FINGERPRINT = "safe-policy:emergency-zone-picker-fixture";
const SOURCE_FINGERPRINT = "safe-source:emergency-zone-picker-fixture";

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
    rawEmergencyPayloadReturned: false,
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

function bridgeInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    boardFillInputSummary: safeSummary({ boardFillInputFingerprint: "safe-board-fill-input:emergency-zone-picker-fixture" }),
    accessoryReservationSummary: safeSummary({ accessoryReservationReady: true, accessoryReservationFingerprint: "safe-reservation:emergency-zone-picker-fixture" }),
    boardFillSummary: safeSummary({ boardCount: 4, boardUsedLengthMm: 5600 }),
    boardElectricalSummary: safeSummary({ electricalSummaryReady: true, summaryFingerprint: "safe-board-electrical:emergency-zone-picker-fixture" }),
    driverSizerSummary: safeSummary({ driverSizerReady: true, driverSizerFingerprint: "safe-driver-sizer:emergency-zone-picker-fixture" }),
    sealedPhysicalBoardPlacementSummary: safeSummary({
      safeSummaryOnly: true,
      placements: [
        { boardIndex: 0, startMm: 0, endMm: 1400, lengthMm: 1400 },
        { boardIndex: 1, startMm: 1400, endMm: 2800, lengthMm: 1400 },
        { boardIndex: 2, startMm: 2800, endMm: 4200, lengthMm: 1400 },
        { boardIndex: 3, startMm: 4200, endMm: 5600, lengthMm: 1400 },
      ],
    }),
    sealedReservedRangeSummary: safeSummary({
      safeSummaryOnly: true,
      ranges: [],
    }),
    sealedSegmentPolicySummary: {
      ok: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      segmentMaxLengthMm: 2800,
      secondary_across_segment: "forbid",
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
      rawEnginePayloadReturned: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      complianceApproved: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    ...overrides,
  };
}

function bridgeSummary(overrides = {}) {
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput(overrides));
  assert.equal(result.ok, true);
  return result;
}

function unequalBridgeSummary() {
  return bridgeSummary({
    boardFillSummary: safeSummary({ boardCount: 3, boardUsedLengthMm: 4200 }),
    sealedPhysicalBoardPlacementSummary: safeSummary({
      safeSummaryOnly: true,
      placements: [
        { boardIndex: 0, startMm: 0, endMm: 1400, lengthMm: 1400 },
        { boardIndex: 1, startMm: 1400, endMm: 2800, lengthMm: 1400 },
        { boardIndex: 2, startMm: 2800, endMm: 4200, lengthMm: 1400 },
      ],
    }),
  });
}

function driverSizerSummary(overrides = {}) {
  return safeSummary({
    driverSizerReady: true,
    driverSizerFingerprint: "safe-driver-sizer:emergency-zone-picker-fixture",
    selectedDriverSummary: {
      safeModelToken: "driver-a",
      safeModelLabel: "Driver A",
      zoneCountCandidate: 2,
      limitingFactorCategory: "power-band-limited",
      rawDriverRowsReturned: false,
      rawDriverUtilPayloadReturned: false,
      rawCurvePointsReturned: false,
    },
    zoneCountCandidate: 2,
    limitingFactorCategory: "power-band-limited",
    ...overrides,
  });
}

function accessoryReservationSummary(overrides = {}) {
  return safeSummary({
    accessoryReservationReady: true,
    accessoryReservationFingerprint: "safe-reservation:emergency-zone-picker-fixture",
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

function emergencyIntentSummary(overrides = {}) {
  return {
    requiredEmergencyZoneCount: 1,
    preferredEmergencyZoneStrategy: "first",
    emergencyType: "marker-only",
    physicalHardwareRequired: false,
    complianceProofRequired: false,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    rawEmergencyPayloadReturned: false,
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

function zoneValidationSummary({ bridge = bridgeSummary(), driver = driverSizerSummary() } = {}) {
  const result = buildRuntimeZoneValidationFootholdSummary({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    segmentZoneBridgeSummary: bridge,
    driverSizerSummary: driver,
    boardElectricalSummary: safeSummary({ electricalSummaryReady: true, summaryFingerprint: "safe-board-electrical:emergency-zone-picker-fixture" }),
    boardFillSummary: safeSummary({ boardCount: bridge.frozenSegmentSummary?.boardPlacementCount ?? 4, boardUsedLengthMm: bridge.frozenSegmentSummary?.runLengthMm ?? 5600 }),
    boardFillInputSummary: safeSummary({ boardFillInputFingerprint: "safe-board-fill-input:emergency-zone-picker-fixture" }),
    accessoryReservationSummary: accessoryReservationSummary(),
  });
  assert.equal(result.ok, true);
  return result;
}

function pickerInput(overrides = {}) {
  const bridge = overrides.segmentZoneBridgeSummary || bridgeSummary();
  const driver = overrides.driverSizerSummary || driverSizerSummary();
  const zoneValidation = overrides.zoneValidationFootholdSummary || zoneValidationSummary({ bridge, driver });
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    zoneValidationFootholdSummary: zoneValidation,
    segmentZoneBridgeSummary: bridge,
    driverSizerSummary: driver,
    accessoryReservationSummary: accessoryReservationSummary(),
    emergencyIntentSummary: emergencyIntentSummary(),
    ...overrides,
  };
}

test("accepts sealed zone validation foothold and safe marker-only emergency intent", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.emergencyZonePickerReady, true);
  assert.equal(result.selectedZoneIntentSummary.emergencyType, "marker-only");
  assert.equal(result.zoneValidationFootholdFingerprint, pickerInput().zoneValidationFootholdSummary.zoneValidationFootholdFingerprint);
});

test("aliases call the same emergency zone picker foothold helper", () => {
  const input = pickerInput();
  assert.deepEqual(buildRuntimeNativeEmergencyZonePickerFootholdSummary(input), buildRuntimeEmergencyZonePickerFootholdSummary(input));
  assert.deepEqual(buildEngineRunTableRuntimeEmergencyZonePickerFootholdStatus(input), buildRuntimeEmergencyZonePickerFootholdSummary(input));
});

test("selects first zone strategy safely", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ preferredEmergencyZoneStrategy: "first", requiredEmergencyZoneCount: 1 }),
  }));

  assert.equal(result.ok, true);
  assert.deepEqual(result.selectedZoneIntentSummary.selectedZoneIndexes, [0]);
  assert.equal(result.emergencyZoneCandidateSummary.candidateZoneCount, 1);
});

test("selects last zone strategy safely", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ preferredEmergencyZoneStrategy: "last", requiredEmergencyZoneCount: 1 }),
  }));

  assert.equal(result.ok, true);
  assert.deepEqual(result.selectedZoneIntentSummary.selectedZoneIndexes, [1]);
});

test("selects every-zone strategy safely", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ preferredEmergencyZoneStrategy: "every-zone", requiredEmergencyZoneCount: 2 }),
  }));

  assert.equal(result.ok, true);
  assert.deepEqual(result.selectedZoneIntentSummary.selectedZoneIndexes, [0, 1]);
  assert.equal(result.emergencyZoneCandidateSummary.availableZoneCount, 2);
});

test("selects longest-zone strategy safely", () => {
  const bridge = unequalBridgeSummary();
  const driver = driverSizerSummary();
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    segmentZoneBridgeSummary: bridge,
    driverSizerSummary: driver,
    zoneValidationFootholdSummary: zoneValidationSummary({ bridge, driver }),
    emergencyIntentSummary: emergencyIntentSummary({ preferredEmergencyZoneStrategy: "longest-zone", requiredEmergencyZoneCount: 1 }),
  }));

  assert.equal(result.ok, true);
  assert.deepEqual(result.selectedZoneIntentSummary.selectedZoneIndexes, [0]);
});

test("rejects emergency count exceeding available sealed zones", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ preferredEmergencyZoneStrategy: "first", requiredEmergencyZoneCount: 3 }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "required-emergency-zone-count-exceeds-available-zones");
});

test("rejects unsupported emergency type", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ emergencyType: "exit-sign" }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unsupported-emergency-type");
});

test("rejects EWIS speaker proof as not approved", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ emergencyType: "ewis-speaker" }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "ewis-speaker-zone-proof-not-approved");
  assert.equal(result.complianceApproved, false);
});

test("rejects emergency-driver intent when upstream policy proof is missing", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ emergencyType: "emergency-driver" }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "emergency-driver-policy-not-proven");
});

test("rejects physical hardware required unless already proven upstream", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ emergencyType: "egress-light", physicalHardwareRequired: true }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "physical-hardware-reservation-required");
  assert.equal(result.physicalHardwareBoundary.upstreamReservationProven, false);
});

test("accepts physical hardware required when upstream reservation proof is present", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    accessoryReservationSummary: accessoryReservationSummary({ physicalHardwareReservationProven: true }),
    emergencyIntentSummary: emergencyIntentSummary({ emergencyType: "egress-light", physicalHardwareRequired: true, complianceProofRequired: false }),
  }));

  assert.equal(result.ok, true);
  assert.equal(result.physicalHardwareBoundary.upstreamReservationProven, true);
  assert.equal(result.physicalHardwareBoundary.physicalHardwareReservedHere, false);
});

test("rejects compliance proof required", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ emergencyType: "egress-light", complianceProofRequired: true }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "compliance-proof-required");
  assert.equal(result.complianceBoundary.complianceApproved, false);
});

test("rejects fingerprint mismatch", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({
    emergencyIntentSummary: emergencyIntentSummary({ sourceFingerprint: "safe-source:other-emergency-zone-picker-fixture" }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "fingerprint-mismatch");
});

test("rejects missing zone validation foothold summary", () => {
  const input = pickerInput();
  delete input.zoneValidationFootholdSummary;

  const result = buildRuntimeEmergencyZonePickerFootholdSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-zone-validation-foothold-summary");
});

test("rejects zone validation foothold that is not ready", () => {
  const notReady = zoneValidationSummary();
  notReady.zoneValidationFootholdReady = false;

  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({ zoneValidationFootholdSummary: notReady }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "zone-validation-foothold-not-ready");
});

test("does not expose raw rows or payloads", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput());

  assert.equal(result.ok, true);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawEmergencyPayloadReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.emergencyZoneCandidateSummary.rawEmergencyPayloadReturned, false);
  assert.equal(result.selectedZoneIntentSummary.rawEmergencyPayloadReturned, false);
});

test("does not invoke donor Engine or mutate side effects", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput());

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
  assert.equal(result.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(result.safetyFlags.iesGenerationEnabled, false);
  assert.equal(result.safetyFlags.complianceApprovalEnabled, false);
});

test("fails closed when donor Engine invocation is requested", () => {
  const result = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput({ donorEngineInvoked: true }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "donor-engine-invocation-not-approved");
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});

test("produces deterministic emergencyZonePickerFingerprint", () => {
  const first = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput());
  const second = buildRuntimeEmergencyZonePickerFootholdSummary(pickerInput());

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.emergencyZonePickerFingerprint, second.emergencyZonePickerFingerprint);
  assert.match(first.emergencyZonePickerFingerprint, /^safe-emergency-zone-picker:[0-9a-f]{40}$/);
});
