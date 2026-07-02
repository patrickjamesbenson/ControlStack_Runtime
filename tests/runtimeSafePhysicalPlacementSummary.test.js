import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSafePhysicalPlacementSummary,
  buildSafePhysicalPlacementSummary,
  buildEngineRunTableSafePhysicalPlacementSummary,
} from "../packages/workspace-kernel/runtimeSafePhysicalPlacementSummary.js";

const FINGERPRINTS = Object.freeze({
  policyFingerprint: "safe-policy:physical-placement-summary-test",
  sourceFingerprint: "safe-source:physical-placement-summary-test",
  accessoryReservationFingerprint: "safe-reservation:physical-placement-summary-test",
  boardFillInputFingerprint: "safe-board-fill-input:physical-placement-summary-test",
  boardFillFingerprint: "safe-board-fill:physical-placement-summary-test",
  boardElectricalSummaryFingerprint: "safe-board-electrical:physical-placement-summary-test",
  driverSizerFingerprint: "safe-driver-sizer:physical-placement-summary-test",
});

const FORBIDDEN_OUTPUT_KEYS = new Set([
  "placements",
  "placement",
  "boardPlacements",
  "physicalBoardPlacements",
  "physicalPlacements",
  "reservedRanges",
  "reserved_ranges",
  "ranges",
  "segmentBoundariesMm",
  "boundaryCoordinates",
  "joinPositionsMm",
  "clipPointsMm",
  "suspensionPointsMm",
  "startMm",
  "endMm",
  "start_mm",
  "end_mm",
  "x",
  "y",
  "z",
  "xMm",
  "yMm",
  "zMm",
  "centerlineMm",
  "centrelineMm",
  "positionMm",
  "approxMm",
  "zoneStartMm",
  "zoneEndMm",
  "segmentStartMm",
  "segmentEndMm",
  "boundaryMm",
  "boundariesMm",
  "selectedCurrentMa",
  "currentMa",
  "vfAtCurrentV",
  "boardVoltageV",
  "wattAtCurrentW",
  "boardPowerW",
  "enginePayload",
  "rawEnginePayload",
  "engineResult",
  "rawEngineResult",
  "rawReservationGrid",
  "reservationGrid",
  "PRODUCTS",
  "BOARDS",
  "DRIVERS",
  "ACCESSORIES",
  "USERS",
  "CRM",
  "CONTACTS",
  "iesText",
  "candelaGrid",
  "base64",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "rawProductRowsReturned",
  "rawBoardRowsReturned",
  "rawDriverRowsReturned",
  "rawAccessoryRowsReturned",
  "rawReservationGridReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "rawUsersReturned",
  "rawCrmReturned",
  "rawContactsReturned",
  "privatePathsReturned",
  "exactCoordinatesReturned",
  "exactBoundaryCoordinatesReturned",
  "exactElectricalValuesReturned",
  "donorEngineInvoked",
  "mechanicalDetailerInvoked",
  "donorMechanicalDetailerInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "runTableGenerated",
  "iesGenerated",
  "routesAdded",
  "postEndpointsAdded",
]);

function safeProof(overrides = {}) {
  return {
    safePlacementProofMarker: "sealed-safe-physical-placement-proof",
    sourceBacked: true,
    chainBacked: true,
    placeholderOnly: false,
    syntheticFixtureOnly: false,
    boardPlacementBandSummary: {
      boardPlacementCountBand: "2-5",
      boardPlacementLengthBands: ["1000-1999mm"],
      boardPlacementSpanBand: "4000-7999mm",
      placementCategoryTokens: ["source-backed-board-run"],
      boardRefs: ["safe-board-ref-001", "safe-board-ref-002", "safe-board-ref-003"],
    },
    segmentBoundaryBandSummary: {
      segmentBoundaryCountBand: "1-2",
      segmentSpanBands: ["1000-1999mm", "2000-3999mm"],
      segmentRefs: ["safe-segment-ref-001", "safe-segment-ref-002"],
      boundarySource: "safe-board-end-band-proof",
    },
    reservedRangeBandSummary: {
      reservedRangeCountBand: "0",
      reservedRangeLengthBands: [],
      reservedRangeSpanBand: "0mm",
      reservedRangeRefs: [],
      reservationPolicyToken: "accessory-reservation-linked",
    },
    accessoryReservationLinkSummary: {
      accessoryReservationLinked: true,
      reservationIntentRef: "safe-accessory-reservation-intent-001",
      accessoryReservationFingerprint: FINGERPRINTS.accessoryReservationFingerprint,
    },
    emergencyMarkerPlacementSummary: {
      emergencyMarkerCountBand: "1",
      emergencyPlacementCategoryTokens: ["marker-only"],
      emergencyZoneRefs: ["safe-zone-ref-001"],
    },
    noCrossContainmentSummary: {
      noCrossContainmentProven: true,
      zonesCrossSegmentJoin: false,
      zoneCountBand: "2-5",
      zoneRefs: ["safe-zone-ref-001", "safe-zone-ref-002"],
    },
    ...overrides,
  };
}

function safeInput(overrides = {}) {
  return {
    ...FINGERPRINTS,
    sourceBacked: true,
    chainBacked: true,
    safePlacementProofSummary: safeProof(),
    ...overrides,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function walk(value, visit, path = []) {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visit, [...path, String(index)]));
    return;
  }
  if (typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    visit(key, nested, path);
    walk(nested, visit, [...path, key]);
  }
}

function assertNoUnsafeOutput(summary) {
  walk(summary, (key, value, path) => {
    assert.equal(FORBIDDEN_OUTPUT_KEYS.has(key), false, `forbidden output key ${[...path, key].join(".")}`);
    if (typeof value === "string") {
      assert.equal(/C:\\|\\Users\\|IESNA:|candelaGrid|base64,/i.test(value), false, `unsafe string at ${[...path, key].join(".")}`);
    }
  });
  for (const flag of REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[flag], false, flag);
  }
}

test("accepts sealed safe summaries only and emits a safe ready summary", () => {
  const result = buildRuntimeSafePhysicalPlacementSummary(safeInput());

  assert.equal(result.ok, true);
  assert.equal(result.physicalPlacementSummaryReady, true);
  assert.equal(result.readOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.sourceBacked, true);
  assert.equal(result.chainBacked, true);
  assert.match(result.placementSummaryFingerprint, /^safe-physical-placement:/);
  assert.equal(result.boardPlacementBandSummary.boardPlacementCountBand, "2-5");
  assert.equal(result.reservedRangeBandSummary.reservedRangeCountBand, "0");
  assert.equal(result.accessoryReservationLinkSummary.accessoryReservationLinked, true);
  assert.equal(result.noCrossContainmentSummary.noCrossContainmentProven, true);
  assertNoUnsafeOutput(result);
});

test("aliases resolve to the same safe physical placement helper", () => {
  assert.equal(buildSafePhysicalPlacementSummary, buildRuntimeSafePhysicalPlacementSummary);
  assert.equal(buildEngineRunTableSafePhysicalPlacementSummary, buildRuntimeSafePhysicalPlacementSummary);
});

test("deterministic placementSummaryFingerprint changes only when safe bands change", () => {
  const first = buildRuntimeSafePhysicalPlacementSummary(safeInput());
  const second = buildRuntimeSafePhysicalPlacementSummary(safeInput());
  const changed = buildRuntimeSafePhysicalPlacementSummary(safeInput({
    safePlacementProofSummary: safeProof({
      boardPlacementBandSummary: {
        ...safeProof().boardPlacementBandSummary,
        boardPlacementSpanBand: "8000mm-plus",
      },
    }),
  }));

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.placementSummaryFingerprint, second.placementSummaryFingerprint);
  assert.notEqual(first.placementSummaryFingerprint, changed.placementSummaryFingerprint);
});

test("fails closed when only placeholder or synthetic fixture placement is available", () => {
  const result = buildRuntimeSafePhysicalPlacementSummary(safeInput({
    sourceBacked: false,
    chainBacked: false,
    safePlacementProofSummary: safeProof({
      sourceBacked: false,
      chainBacked: false,
      placeholderOnly: true,
      syntheticFixtureOnly: true,
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.physicalPlacementSummaryReady, false);
  assert.equal(result.blocker, "placeholder-only-placement-not-approved");
  assertNoUnsafeOutput(result);
});

test("fails closed on missing fingerprints, accessory link, chain fingerprints, or proof marker", () => {
  const cases = [
    ["missing-policy-fingerprint", { policyFingerprint: null }],
    ["missing-source-fingerprint", { sourceFingerprint: null }],
    ["missing-accessory-reservation-link", { accessoryReservationFingerprint: null, safePlacementProofSummary: safeProof({ accessoryReservationLinkSummary: { accessoryReservationLinked: true } }) }],
    ["missing-board-fill-input-fingerprint", { boardFillInputFingerprint: null }],
    ["missing-board-fill-fingerprint", { boardFillFingerprint: null }],
    ["missing-board-electrical-fingerprint", { boardElectricalSummaryFingerprint: null }],
    ["missing-driver-sizer-fingerprint", { driverSizerFingerprint: null }],
    ["missing-safe-placement-proof-marker", { safePlacementProofSummary: { ...safeProof(), safePlacementProofMarker: "" } }],
    ["missing-accessory-reservation-link", { safePlacementProofSummary: safeProof({ accessoryReservationLinkSummary: { accessoryReservationLinked: false, accessoryReservationFingerprint: FINGERPRINTS.accessoryReservationFingerprint } }) }],
    ["missing-no-cross-containment-proof", { safePlacementProofSummary: safeProof({ noCrossContainmentSummary: { noCrossContainmentProven: false, zonesCrossSegmentJoin: false } }) }],
  ];

  for (const [expectedBlocker, patch] of cases) {
    const result = buildRuntimeSafePhysicalPlacementSummary(safeInput(patch));
    assert.equal(result.ok, false, expectedBlocker);
    assert.equal(result.physicalPlacementSummaryReady, false, expectedBlocker);
    assert.equal(result.blocker, expectedBlocker);
    assertNoUnsafeOutput(result);
  }
});

test("fails closed for raw rows, payloads, private paths, exact coordinates, exact electrical values, and IES data", () => {
  const unsafeCases = [
    ["raw-product-row-input-not-approved", { rawProductRows: [{ raw: "PRODUCT" }] }],
    ["raw-board-row-input-not-approved", { rawBoardRows: [{ raw: "BOARD" }] }],
    ["raw-driver-row-input-not-approved", { rawDriverRows: [{ raw: "DRIVER" }] }],
    ["raw-accessory-row-input-not-approved", { rawAccessoryRows: [{ raw: "ACCESSORY" }] }],
    ["raw-reservation-grid-input-not-approved", { rawReservationGrid: [{ cell: "RAW-GRID-CELL" }] }],
    ["raw-engine-payload-input-not-approved", { enginePayload: { runs: [] } }],
    ["raw-engine-result-input-not-approved", { engineResult: { success: true } }],
    ["private-data-input-not-approved", { sourcePath: "C:\\Users\\Patrick\\private\\novondb.json" }],
    ["exact-coordinate-input-not-approved", { safePlacementProofSummary: safeProof({ boardPlacementBandSummary: { ...safeProof().boardPlacementBandSummary, startMm: 0 } }) }],
    ["exact-electrical-value-input-not-approved", { selectedCurrentMa: 350 }],
    ["raw-ies-photometry-input-not-approved", { iesText: "IESNA:LM-63-2019" }],
    ["raw-ies-photometry-input-not-approved", { photometry: { sample: true } }],
    ["raw-ies-photometry-input-not-approved", { candelaGrid: [[1, 2, 3]] }],
    ["raw-ies-photometry-input-not-approved", { base64: "abc123" }],
  ];

  for (const [expectedBlocker, patch] of unsafeCases) {
    const result = buildRuntimeSafePhysicalPlacementSummary(safeInput(patch));
    assert.equal(result.ok, false, expectedBlocker);
    assert.equal(result.blocker, expectedBlocker);
    assertNoUnsafeOutput(result);
  }
});

test("fails closed on donor Engine or mechanical detailer invocation attempts", () => {
  for (const patch of [{ donorEngineInvoked: true }, { mechanicalDetailerInvoked: true }, { donorMechanicalDetailerInvoked: true }]) {
    const result = buildRuntimeSafePhysicalPlacementSummary(safeInput(patch));
    assert.equal(result.ok, false);
    assert.match(result.blocker, /(?:donor-engine|mechanical-detailer)-invocation-not-approved/);
    assert.equal(result.donorEngineInvoked, false);
    assert.equal(result.mechanicalDetailerInvoked, false);
    assertNoUnsafeOutput(result);
  }
});

test("fails closed on RuntimeData mutation, RunTable or IES generation, routes, and POST endpoints", () => {
  const unsafeCases = [
    ["runtime-data-mutation-not-approved", { runtimeDataMutated: true }],
    ["runtable-generation-not-approved", { runTableGenerated: true }],
    ["ies-generation-not-approved", { iesGenerated: true }],
    ["routes-added-not-approved", { routesAdded: true }],
    ["post-endpoints-added-not-approved", { postEndpointsAdded: true }],
  ];

  for (const [expectedBlocker, patch] of unsafeCases) {
    const result = buildRuntimeSafePhysicalPlacementSummary(safeInput(patch));
    assert.equal(result.ok, false, expectedBlocker);
    assert.equal(result.blocker, expectedBlocker);
    assertNoUnsafeOutput(result);
  }
});

test("successful summary never generates RunTable, IES, routes, POST endpoints, or persistence", () => {
  const result = buildRuntimeSafePhysicalPlacementSummary(clone(safeInput()));

  assert.equal(result.ok, true);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.unsafeOutputsBlocked.generationBlocked, true);
  assert.equal(result.unsafeOutputsBlocked.routesBlocked, true);
  assertNoUnsafeOutput(result);
});
