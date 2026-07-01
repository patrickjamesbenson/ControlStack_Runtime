import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSealedSegmentZoneBridgeSummary,
  buildRuntimeNativeSealedSegmentZoneBridgeSummary,
  buildEngineRunTableRuntimeSealedSegmentZoneBridgeStatus,
  ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeSealedSegmentZoneBridge.js";

const POLICY_FINGERPRINT = "safe-policy:sealed-segment-zone-bridge-fixture";
const SOURCE_FINGERPRINT = "safe-source:sealed-segment-zone-bridge-fixture";

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
    boardFillInputSummary: safeSummary({ boardFillInputFingerprint: "safe-board-fill-input:fixture" }),
    accessoryReservationSummary: safeSummary({ accessoryReservationFingerprint: "safe-reservation:fixture" }),
    boardFillSummary: safeSummary({ boardCount: 4, boardUsedLengthMm: 5600 }),
    boardElectricalSummary: safeSummary({ electricalSummaryReady: true, summaryFingerprint: "safe-board-electrical:fixture" }),
    driverSizerSummary: safeSummary({ driverSizerReady: true, driverSizerFingerprint: "safe-driver-sizer:fixture" }),
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

test("accepts sealed monotonic board placements", () => {
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.segmentZoneBridgeReady, true);
  assert.equal(result.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(result.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.match(result.segmentZoneBridgeFingerprint, /^safe-segment-zone-bridge:[0-9a-f]{40}$/);
});

test("aliases call the same sealed segment-zone bridge helper", () => {
  const input = bridgeInput();
  assert.deepEqual(buildRuntimeNativeSealedSegmentZoneBridgeSummary(input), buildRuntimeSealedSegmentZoneBridgeSummary(input));
  assert.deepEqual(buildEngineRunTableRuntimeSealedSegmentZoneBridgeStatus(input), buildRuntimeSealedSegmentZoneBridgeSummary(input));
});

test("freezes deterministic physical segment summary", () => {
  const first = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput());
  const second = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput());

  assert.equal(first.ok, true);
  assert.deepEqual(first.frozenSegmentSummary, second.frozenSegmentSummary);
  assert.equal(first.segmentZoneBridgeFingerprint, second.segmentZoneBridgeFingerprint);
  assert.deepEqual(first.frozenSegmentSummary.segments.map((segment) => segment.boardIndices), [[0, 1], [2, 3]]);
  assert.equal(first.frozenSegmentSummary.segmentBoundarySource, "derived-from-max-segment-length");
});

test("counts joins between frozen physical segments", () => {
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput());

  assert.equal(result.ok, true);
  assert.equal(result.frozenSegmentSummary.segmentCount, 2);
  assert.equal(result.joinCount, 1);
  assert.equal(result.joinModeSummary.joinCount, 1);
  assert.deepEqual(result.frozenSegmentSummary.segmentBoundariesMm, [2800]);
});

test("rejects board and reserved range overlap", () => {
  const input = bridgeInput({
    sealedReservedRangeSummary: safeSummary({
      safeSummaryOnly: true,
      ranges: [{ startMm: 1300, endMm: 1500, reason: "sensor" }],
    }),
  });
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "board-placement-overlaps-reserved-range");
  assert.equal(result.rawReservationGridReturned, false);
});

test("rejects non-monotonic physical board placements", () => {
  const input = bridgeInput();
  input.sealedPhysicalBoardPlacementSummary.placements = [
    { boardIndex: 0, startMm: 0, endMm: 1400, lengthMm: 1400 },
    { boardIndex: 1, startMm: 2800, endMm: 4200, lengthMm: 1400 },
    { boardIndex: 2, startMm: 1400, endMm: 2800, lengthMm: 1400 },
  ];

  const result = buildRuntimeSealedSegmentZoneBridgeSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unsafe-physical-board-placement-summary");
  assert.match(result.failClosedDiagnostics.join(" "), /monotonic/i);
});

test("rejects missing max segment policy", () => {
  const input = bridgeInput();
  delete input.sealedSegmentPolicySummary.segmentMaxLengthMm;

  const result = buildRuntimeSealedSegmentZoneBridgeSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-max-segment-length");
});

test("rejects segment boundary not at board end", () => {
  const input = bridgeInput();
  input.sealedSegmentPolicySummary.segmentBoundariesMm = [2100];

  const result = buildRuntimeSealedSegmentZoneBridgeSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "impossible-segment-pattern");
  assert.match(result.failClosedDiagnostics.join(" "), /board ends/i);
});

test("emits no-cross zone containment diagnostics", () => {
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput());

  assert.equal(result.ok, true);
  assert.equal(result.noCrossZoneContainmentSummary.diagnosticOnly, true);
  assert.equal(result.noCrossZoneContainmentSummary.containmentMode, "one-zone-per-frozen-physical-segment");
  assert.equal(result.noCrossZoneContainmentSummary.zoneCount, 2);
  assert.equal(result.noCrossZoneContainmentSummary.containedZoneCount, 2);
  assert.equal(result.noCrossZoneContainmentSummary.crossJoinZoneCount, 0);
  assert.equal(result.noCrossZoneContainmentSummary.zonesCrossSegmentJoin, false);
  assert.equal(result.noCrossZoneContainmentSummary.fullZoneSolverInvoked, false);
});

test("cross and compare modes remain placeholders only", () => {
  const allow = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput({
    sealedSegmentPolicySummary: {
      ...bridgeInput().sealedSegmentPolicySummary,
      secondary_across_segment: "allow",
    },
  }));
  const compare = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput({
    sealedSegmentPolicySummary: {
      ...bridgeInput().sealedSegmentPolicySummary,
      secondary_across_segment: "compare",
    },
  }));

  assert.equal(allow.ok, true);
  assert.equal(allow.joinModeSummary.secondaryAcrossSegment, "allow");
  assert.equal(allow.joinModeSummary.placeholderOnly, true);
  assert.equal(allow.joinModeSummary.crossJoinComparisonScoringEnabled, false);
  assert.equal(compare.ok, true);
  assert.equal(compare.joinModeSummary.secondaryAcrossSegment, "compare");
  assert.equal(compare.joinModeSummary.placeholderOnly, true);
  assert.equal(compare.joinModeSummary.crossJoinComparisonScoringEnabled, false);
  assert.equal(compare.validationReadiness.crossNoCrossComparisonReady, false);
});

test("reserved ranges are clipped and merged but do not force segment splits", () => {
  const input = bridgeInput({
    sealedPhysicalBoardPlacementSummary: safeSummary({
      safeSummaryOnly: true,
      placements: [
        { boardIndex: 0, startMm: 0, endMm: 1400, lengthMm: 1400 },
        { boardIndex: 1, startMm: 1800, endMm: 3200, lengthMm: 1400 },
        { boardIndex: 2, startMm: 3200, endMm: 4600, lengthMm: 1400 },
      ],
    }),
    sealedReservedRangeSummary: safeSummary({
      safeSummaryOnly: true,
      ranges: [
        { startMm: 1400, endMm: 1700, reason: "sensor" },
        { startMm: 1650, endMm: 1800, reason: "sensor-cover" },
      ],
    }),
    sealedSegmentPolicySummary: {
      ...bridgeInput().sealedSegmentPolicySummary,
      segmentMaxLengthMm: 5000,
    },
  });
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(input);

  assert.equal(result.ok, true);
  assert.equal(result.frozenSegmentSummary.segmentCount, 1);
  assert.equal(result.frozenSegmentSummary.reservedRangeSummary.rangeCount, 1);
  assert.equal(result.frozenSegmentSummary.reservedRangeSummary.totalReservedLengthMm, 400);
  assert.equal(result.frozenSegmentSummary.reservedRangeSummary.reservedRangesForceSegmentSplits, false);
});

test("fails closed when physical layout is unavailable", () => {
  const input = bridgeInput();
  delete input.sealedPhysicalBoardPlacementSummary;

  const result = buildRuntimeSealedSegmentZoneBridgeSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-physical-board-placement-summary");
});

test("fingerprint mismatch fails closed", () => {
  const input = bridgeInput();
  input.driverSizerSummary.sourceFingerprint = "safe-source:other-fixture";

  const result = buildRuntimeSealedSegmentZoneBridgeSummary(input);

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "fingerprint-mismatch");
});

test("no raw rows or payloads are exposed and no forbidden side effects occur", () => {
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput());

  assert.equal(result.ok, true);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawReservationGridReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
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

test("raw payload input fails closed without invoking donor or generation", () => {
  const result = buildRuntimeSealedSegmentZoneBridgeSummary(bridgeInput({
    rawEnginePayload: { unsafe: true },
  }));

  assert.equal(result.ok, false);
  assert.notEqual(result.blocker, null);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});
