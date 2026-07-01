import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSealedSegmentZoneBridgeSummary,
} from "../packages/workspace-kernel/engineRunTableRuntimeSealedSegmentZoneBridge.js";

import {
  buildRuntimeZoneValidationFootholdSummary,
  buildRuntimeNativeZoneValidationFootholdSummary,
  buildEngineRunTableRuntimeZoneValidationFootholdKernelStatus,
  ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeZoneValidationFootholdKernel.js";

const POLICY_FINGERPRINT = "safe-policy:zone-validation-foothold-fixture";
const SOURCE_FINGERPRINT = "safe-source:zone-validation-foothold-fixture";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function bridgeInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    boardFillInputSummary: safeSummary({ boardFillInputFingerprint: "safe-board-fill-input:zone-validation-fixture" }),
    accessoryReservationSummary: safeSummary({ accessoryReservationFingerprint: "safe-reservation:zone-validation-fixture" }),
    boardFillSummary: safeSummary({ boardCount: 4, boardUsedLengthMm: 5600 }),
    boardElectricalSummary: safeSummary({ electricalSummaryReady: true, summaryFingerprint: "safe-board-electrical:zone-validation-fixture" }),
    driverSizerSummary: safeSummary({ driverSizerReady: true, driverSizerFingerprint: "safe-driver-sizer:zone-validation-fixture" }),
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
      runTableGenerated: false,
      iesGenerated: false,
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

function driverSizerSummary(overrides = {}) {
  return safeSummary({
    driverSizerReady: true,
    driverSizerFingerprint: "safe-driver-sizer:zone-validation-fixture",
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

function footholdInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    segmentZoneBridgeSummary: bridgeSummary(),
    driverSizerSummary: driverSizerSummary(),
    boardElectricalSummary: safeSummary({ electricalSummaryReady: true, summaryFingerprint: "safe-board-electrical:zone-validation-fixture" }),
    boardFillSummary: safeSummary({ boardCount: 4, boardUsedLengthMm: 5600 }),
    boardFillInputSummary: safeSummary({ boardFillInputFingerprint: "safe-board-fill-input:zone-validation-fixture" }),
    accessoryReservationSummary: safeSummary({ accessoryReservationFingerprint: "safe-reservation:zone-validation-fixture" }),
    ...overrides,
  };
}

test("accepts sealed segment-zone bridge summary", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.zoneValidationFootholdReady, true);
  assert.equal(result.segmentZoneBridgeFingerprint, footholdInput().segmentZoneBridgeSummary.segmentZoneBridgeFingerprint);
});

test("aliases call the same runtime zone validation foothold helper", () => {
  const input = footholdInput();
  assert.deepEqual(buildRuntimeNativeZoneValidationFootholdSummary(input), buildRuntimeZoneValidationFootholdSummary(input));
  assert.deepEqual(buildEngineRunTableRuntimeZoneValidationFootholdKernelStatus(input), buildRuntimeZoneValidationFootholdSummary(input));
});

test("accepts supported no-cross zone count candidate", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput());

  assert.equal(result.ok, true);
  assert.equal(result.zoneCountCandidate, 2);
  assert.equal(result.noCrossValidationSummary.supported, true);
  assert.equal(result.noCrossValidationSummary.validationMode, "sealed-no-cross-containment-only");
  assert.equal(result.noCrossValidationSummary.frozenSegmentCount, 2);
  assert.equal(result.noCrossValidationSummary.containedZoneCount, 2);
  assert.equal(result.noCrossValidationSummary.zonesCrossSegmentJoin, false);
  assert.equal(result.segmentContainmentSummary.candidateMatchesFrozenSegmentCount, true);
  assert.equal(result.segmentContainmentSummary.candidateFitsNoCrossContainment, true);
  assert.equal(result.validationReadiness.noCrossValidationReady, true);
  assert.equal(result.validationReadiness.gateDValidationReady, false);
});

test("rejects missing segment-zone bridge summary", () => {
  const input = footholdInput();
  delete input.segmentZoneBridgeSummary;

  const result = buildRuntimeZoneValidationFootholdSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-segment-zone-bridge-summary");
});

test("rejects unsafe segment-zone bridge summary", () => {
  const unsafeBridge = bridgeSummary();
  unsafeBridge.rawBoardRowsReturned = true;

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ segmentZoneBridgeSummary: unsafeBridge }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unsafe-segment-zone-bridge-summary");
  assert.equal(result.rawBoardRowsReturned, false);
});

test("rejects bridge not ready", () => {
  const notReady = bridgeSummary();
  notReady.segmentZoneBridgeReady = false;

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ segmentZoneBridgeSummary: notReady }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "segment-zone-bridge-not-ready");
});

test("rejects missing no-cross containment summary", () => {
  const missingContainment = bridgeSummary();
  delete missingContainment.noCrossZoneContainmentSummary;

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ segmentZoneBridgeSummary: missingContainment }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-no-cross-containment-summary");
});

test("rejects unsupported zone count", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({
    driverSizerSummary: driverSizerSummary({ zoneCountCandidate: 1, selectedDriverSummary: { zoneCountCandidate: 1 } }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unsupported-zone-count");
});

test("rejects zone count exceeding no-cross containment", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({
    driverSizerSummary: driverSizerSummary({ zoneCountCandidate: 3, selectedDriverSummary: { zoneCountCandidate: 3 } }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "zone-count-exceeds-no-cross-containment");
});

test("rejects cross mode as not approved", () => {
  const crossBridge = bridgeSummary({
    sealedSegmentPolicySummary: {
      ...bridgeInput().sealedSegmentPolicySummary,
      secondary_across_segment: "allow",
    },
  });

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ segmentZoneBridgeSummary: crossBridge }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "cross-join-zone-validation-not-approved");
});

test("rejects compare mode as not approved", () => {
  const compareBridge = bridgeSummary({
    sealedSegmentPolicySummary: {
      ...bridgeInput().sealedSegmentPolicySummary,
      secondary_across_segment: "compare",
    },
  });

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ segmentZoneBridgeSummary: compareBridge }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "compare-join-mode-validation-not-approved");
});

test("rejects fingerprint mismatch", () => {
  const mismatchedDriver = driverSizerSummary({ sourceFingerprint: "safe-source:other-zone-validation-fixture" });

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ driverSizerSummary: mismatchedDriver }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "fingerprint-mismatch");
});

test("produces deterministic zoneValidationFootholdFingerprint", () => {
  const first = buildRuntimeZoneValidationFootholdSummary(footholdInput());
  const second = buildRuntimeZoneValidationFootholdSummary(footholdInput());

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.zoneValidationFootholdFingerprint, second.zoneValidationFootholdFingerprint);
  assert.match(first.zoneValidationFootholdFingerprint, /^safe-zone-validation-foothold:[0-9a-f]{40}$/);
});

test("does not expose raw rows, payloads, or reservation grids", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput());

  assert.equal(result.ok, true);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawReservationGridReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
});

test("does not invoke donor Engine or mutate runtime side effects", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput());

  assert.equal(result.ok, true);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.safetyFlags.donorEngineInvoked, false);
  assert.equal(result.safetyFlags.runtimeDataMutationEnabled, false);
  assert.equal(result.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(result.safetyFlags.iesGenerationEnabled, false);
});

test("fails closed when donor Engine invocation is requested", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ donorEngineInvoked: true }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "donor-engine-invocation-not-approved");
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});

test("fails closed when physical layout is unavailable", () => {
  const bridge = bridgeSummary();
  bridge.frozenSegmentSummary = { summaryType: "sealed-frozen-physical-segment-summary" };

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ segmentZoneBridgeSummary: bridge }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "zone-calculation-depends-on-unavailable-physical-layout");
});

test("rejects missing zone count candidate", () => {
  const summary = driverSizerSummary();
  delete summary.zoneCountCandidate;
  delete summary.selectedDriverSummary.zoneCountCandidate;

  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({ driverSizerSummary: summary }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-zone-count-candidate");
});

test("rejects invalid zone count candidate", () => {
  const result = buildRuntimeZoneValidationFootholdSummary(footholdInput({
    driverSizerSummary: driverSizerSummary({ zoneCountCandidate: 0, selectedDriverSummary: { zoneCountCandidate: 0 } }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "invalid-zone-count-candidate");
});
