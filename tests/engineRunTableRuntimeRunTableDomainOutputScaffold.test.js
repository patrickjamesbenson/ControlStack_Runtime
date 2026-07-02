import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeRunTableDomainOutputScaffoldSummary,
  buildRuntimeNativeRunTableDomainOutputScaffoldSummary,
  buildEngineRunTableRuntimeRunTableDomainOutputScaffoldStatus,
  ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeRunTableDomainOutputScaffold.js";

const POLICY_FINGERPRINT = "safe-policy:runtable-domain-output-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtable-domain-output-fixture";

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
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    exactElectricalValuesReturned: false,
    exactElectricalValuesExposed: false,
    donorEngineInvoked: false,
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

function sealedCandidateAssemblyPreviewSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.sealed-candidate-assembly-preview-summary",
    sealedCandidateAssemblyPreviewReady: true,
    sealedCandidateAssemblyPreviewFingerprint: "safe-sealed-candidate-assembly-preview:runtable-domain-fixture",
    selectorSafeInputSummary: {
      diagnosticOnly: true,
      runIntake: {
        diagnosticOnly: true,
        runIntakePreviewReady: true,
        runCount: 1,
        totalQuantity: 2,
        runs: [{
          id: "run-1",
          runNumber: 1,
          label: "Boardroom run",
          quantity: 2,
          runLengthMm: 5600,
          lengthMode: "same-length",
          safePreviewOnly: true,
          enginePayloadIncluded: false,
          runTableIncluded: false,
          iesIncluded: false,
        }],
        rawSelectorPayloadReturned: false,
        rawEnginePayloadReturned: false,
      },
      accessoryPlacementIntent: {
        diagnosticOnly: true,
        runAccessoryPlacementPreviewReady: true,
        accessoryIntentCount: 1,
        runsWithAccessoryIntentCount: 1,
        unresolvedAccessoryIntentCount: 0,
        rawAccessoryRowsReturned: false,
        rawEnginePayloadReturned: false,
      },
      rawSelectorPayloadReturned: false,
      rawProductRowsReturned: false,
    },
    engineSafeInputSummary: {
      diagnosticOnly: true,
      sealedSummariesOnly: true,
      allEngineSummariesReady: true,
      gateDScaffoldReady: true,
      rawEnginePayloadReturned: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
    },
    candidateReadinessSummary: {
      diagnosticOnly: true,
      readyForFutureCandidateHandoff: true,
      productionEngineExecutionReady: false,
      donorEnginePayloadReady: false,
      runTableReady: false,
      iesReady: false,
      selectedResultPersistenceReady: false,
    },
    ...overrides,
  });
}

function gateDValidationScaffoldSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.gate-d-validation-scaffold-summary",
    gateDScaffoldReady: true,
    gateDValidationScaffoldFingerprint: "safe-gate-d-validation-scaffold:runtable-domain-fixture",
    sealedReadinessSummary: {
      diagnosticOnly: true,
      candidateAssemblyReadiness: "ready-for-sealed-candidate-assembly",
      upstreamReady: true,
      fingerprintsMatched: true,
      rawPayloadFlagsDetected: false,
      rawEnginePayloadReturned: false,
    },
    validationReadiness: {
      gateDScaffoldReady: true,
      sealedCandidateAssemblyReady: true,
      donorGateDExactValidationReady: false,
      donorEngineReady: false,
      runTableReady: false,
      iesReady: false,
    },
    ...overrides,
  });
}

function emergencyZonePickerFootholdSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.emergency-zone-picker-foothold-summary",
    emergencyZonePickerReady: true,
    emergencyZonePickerFingerprint: "safe-emergency-zone-picker:runtable-domain-fixture",
    selectedZoneIntentSummary: {
      diagnosticOnly: true,
      zoneAssociationMode: "diagnostic-intent-associated-to-sealed-no-cross-zones",
      emergencyType: "marker-only",
      selectedZoneCount: 1,
      selectedZoneIndexes: [0],
      physicalHardwareRequired: false,
      complianceProofRequired: false,
      markerOnly: true,
      rawEmergencyPayloadReturned: false,
    },
    complianceBoundary: {
      diagnosticOnly: true,
      complianceProofRequired: false,
      complianceProofReady: false,
      complianceApproved: false,
    },
    physicalHardwareBoundary: {
      diagnosticOnly: true,
      physicalHardwareRequired: false,
      upstreamReservationProven: false,
      physicalHardwareReservedHere: false,
      physicalPlacementReturned: false,
    },
    validationReadiness: {
      emergencyZonePickerReady: true,
      complianceProofReady: false,
      gateDValidationReady: false,
    },
    ...overrides,
  });
}

function zoneValidationFootholdSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.zone-validation-foothold-summary",
    zoneValidationFootholdReady: true,
    zoneValidationFootholdFingerprint: "safe-zone-validation-foothold:runtable-domain-fixture",
    zoneCountCandidate: 2,
    noCrossValidationSummary: {
      diagnosticOnly: true,
      validationMode: "sealed-no-cross-containment-only",
      supported: true,
      zoneCountCandidate: 2,
      zonesCrossSegmentJoin: false,
      crossJoinZoneCount: 0,
      fullZoneSolverInvoked: false,
      gateDValidationInvoked: false,
      donorEngineInvoked: false,
      rawEnginePayloadReturned: false,
    },
    validationReadiness: {
      zoneValidationFootholdReady: true,
      noCrossValidationReady: true,
      crossJoinValidationReady: false,
      compareJoinModeValidationReady: false,
      gateDValidationReady: false,
      fullDonorZoneSolverReady: false,
    },
    ...overrides,
  });
}

function segmentZoneBridgeSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.sealed-segment-zone-bridge-summary",
    segmentZoneBridgeReady: true,
    segmentZoneBridgeFingerprint: "safe-segment-zone-bridge:runtable-domain-fixture",
    frozenSegmentSummary: {
      summaryType: "sealed-frozen-physical-segment-summary",
      segmentCount: 2,
      runLengthBand: "4000-7999mm",
      boardPlacementCount: 4,
      segmentBoundariesAtBoardEndsOnly: true,
      noBoardCrossesFrozenSegmentBoundary: true,
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
      containmentMode: "one-zone-per-frozen-physical-segment",
      zoneCount: 2,
      containedZoneCount: 2,
      crossJoinZoneCount: 0,
      zonesCrossSegmentJoin: false,
      zoneSummaries: [
        { zoneIndex: 0, segmentIndex: 0, zoneLengthBand: "2000-3999mm", boardCount: 2, containedWithinFrozenSegment: true, crossesSegmentJoin: false, rawBoardRowsReturned: false },
        { zoneIndex: 1, segmentIndex: 1, zoneLengthBand: "2000-3999mm", boardCount: 2, containedWithinFrozenSegment: true, crossesSegmentJoin: false, rawBoardRowsReturned: false },
      ],
      fullZoneSolverInvoked: false,
      crossJoinComparisonScoringEnabled: false,
      rawEnginePayloadReturned: false,
    },
    validationReadiness: {
      segmentZoneBridgeReady: true,
      noCrossZoneContainmentDiagnosticsReady: true,
      crossNoCrossComparisonReady: false,
      gateDValidationReady: false,
      fullZoneValidationReady: false,
    },
    ...overrides,
  });
}

function driverSizerSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.driver-sizer-summary",
    driverSizerReady: true,
    driverSizerFingerprint: "safe-driver-sizer:runtable-domain-fixture",
    driverCandidateCount: 2,
    compatibleDriverCandidateCount: 1,
    currentRangeStatus: "selected-current-within-safe-driver-range",
    utilisationBand: "target-band",
    capacityBand: "moderate-headroom-band",
    zoneCountCandidate: 2,
    limitingFactorCategory: "power-band-limited",
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

function boardElectricalSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-electrical-summary",
    electricalSummaryReady: true,
    boardVoltageClass: "safe-band:board-vf-24-48v",
    boardPowerClass: "safe-band:board-power-5-20w",
    summaryFingerprint: "safe-board-electrical:runtable-domain-fixture",
    ...overrides,
  });
}

function boardFillSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-fill-summary",
    selectedBoardFamily: "sealed-board-family",
    boardCount: 4,
    boardFillFingerprint: "safe-board-fill:runtable-domain-fixture",
    ...overrides,
  });
}

function accessoryReservationSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.accessory-reservation-foothold-summary",
    accessoryReservationReady: true,
    boardFillInputReady: true,
    accessoryReservationFingerprint: "safe-reservation:runtable-domain-fixture",
    accessoryPlacementIntentSummary: {
      requestCount: 1,
      requestedAccessoryTypeBuckets: { sensor: 1 },
      placementIntentBuckets: { mid: 1 },
      rawCoordinatesReturned: false,
      physicalPlacementReturned: false,
      rawAccessoryRowsReturned: false,
    },
    ...overrides,
  });
}

function scaffoldInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary(),
    gateDValidationScaffoldSummary: gateDValidationScaffoldSummary(),
    emergencyZonePickerFootholdSummary: emergencyZonePickerFootholdSummary(),
    zoneValidationFootholdSummary: zoneValidationFootholdSummary(),
    segmentZoneBridgeSummary: segmentZoneBridgeSummary(),
    driverSizerSummary: driverSizerSummary(),
    boardElectricalSummary: boardElectricalSummary(),
    boardFillSummary: boardFillSummary(),
    accessoryReservationSummary: accessoryReservationSummary(),
    ...overrides,
  };
}

function blockerFor(overrides = {}) {
  return buildRuntimeRunTableDomainOutputScaffoldSummary(scaffoldInput(overrides)).blocker;
}

test("accepts complete sealed candidate assembly preview and upstream summaries", () => {
  const result = buildRuntimeRunTableDomainOutputScaffoldSummary(scaffoldInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.runTableDomainOutputScaffoldReady, true);
  assert.equal(result.runTableDomainReadinessSummary.domainOutputReady, true);
  assert.equal(result.runTableDomainReadinessSummary.productionRunTableReady, false);
  assert.equal(result.safeRunDomainSummary.runCount, 1);
  assert.equal(result.safeBoardDomainSummary.boardCount, 4);
  assert.equal(result.safeDriverDomainSummary.zoneCountCandidate, 2);
  assert.equal(result.safeZoneDomainSummary.zoneCount, 2);
  assert.equal(result.safeAccessoryDomainSummary.accessoryReservationReady, true);
});

test("aliases point at the same RunTable domain output scaffold helper", () => {
  assert.equal(buildRuntimeNativeRunTableDomainOutputScaffoldSummary, buildRuntimeRunTableDomainOutputScaffoldSummary);
  assert.equal(buildEngineRunTableRuntimeRunTableDomainOutputScaffoldStatus, buildRuntimeRunTableDomainOutputScaffoldSummary);
});

test("rejects missing candidate assembly preview", () => {
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: null }), "missing-sealed-candidate-assembly-preview-summary");
});

test("rejects candidate assembly preview not ready", () => {
  assert.equal(
    blockerFor({ sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ sealedCandidateAssemblyPreviewReady: false }) }),
    "sealed-candidate-assembly-preview-not-ready",
  );
});

test("rejects Gate D not ready", () => {
  assert.equal(
    blockerFor({ gateDValidationScaffoldSummary: gateDValidationScaffoldSummary({ gateDScaffoldReady: false }) }),
    "gate-d-validation-scaffold-not-ready",
  );
});

test("rejects unsafe upstream summary", () => {
  assert.equal(
    blockerFor({ zoneValidationFootholdSummary: zoneValidationFootholdSummary({ diagnosticOnly: false }) }),
    "unsafe-upstream-summary",
  );
});

test("rejects fingerprint mismatch", () => {
  assert.equal(
    blockerFor({ driverSizerSummary: driverSizerSummary({ sourceFingerprint: "safe-source:mismatch" }) }),
    "fingerprint-mismatch",
  );
});

test("rejects raw row and payload flags", () => {
  assert.equal(blockerFor({ rawProductRowsReturned: true }), "raw-product-rows-not-approved");
  assert.equal(
    blockerFor({ boardFillSummary: boardFillSummary({ rawBoardRowsReturned: true }) }),
    "raw-board-rows-not-approved",
  );
  assert.equal(
    blockerFor({ driverSizerSummary: driverSizerSummary({ rawDriverRowsReturned: true }) }),
    "raw-driver-rows-not-approved",
  );
  assert.equal(
    blockerFor({ accessoryReservationSummary: accessoryReservationSummary({ rawAccessoryRowsReturned: true }) }),
    "raw-accessory-rows-not-approved",
  );
  assert.equal(
    blockerFor({ sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ rawSelectorPayloadReturned: true }) }),
    "raw-selector-payload-not-approved",
  );
  assert.equal(
    blockerFor({ gateDValidationScaffoldSummary: gateDValidationScaffoldSummary({ rawEnginePayloadReturned: true }) }),
    "raw-engine-payload-not-approved",
  );
});

test("rejects exact electrical value exposure flag", () => {
  assert.equal(
    blockerFor({ boardElectricalSummary: boardElectricalSummary({ exactElectricalValuesReturned: true }) }),
    "exact-electrical-values-not-approved",
  );
});

test("rejects donor Engine invocation flag", () => {
  assert.equal(blockerFor({ donorEngineInvoked: true }), "donor-engine-invocation-not-approved");
});

test("rejects selected-result persistence flag", () => {
  assert.equal(blockerFor({ selectedResultPersisted: true }), "selected-result-persistence-not-approved");
});

test("rejects production RunTable generation flag", () => {
  assert.equal(blockerFor({ productionRunTableGenerated: true }), "production-runtable-generation-not-approved");
  assert.equal(blockerFor({ runTableGenerated: true }), "production-runtable-generation-not-approved");
});

test("rejects IES generation flag", () => {
  assert.equal(blockerFor({ iesGenerated: true }), "ies-generation-not-approved");
});

test("rejects route and POST endpoint flags", () => {
  assert.equal(blockerFor({ routesAdded: true }), "route-or-post-endpoint-not-approved");
  assert.equal(blockerFor({ postEndpointsAdded: true }), "route-or-post-endpoint-not-approved");
});

test("produces deterministic runTableDomainOutputScaffoldFingerprint", () => {
  const first = buildRuntimeRunTableDomainOutputScaffoldSummary(scaffoldInput());
  const second = buildRuntimeRunTableDomainOutputScaffoldSummary(scaffoldInput());

  assert.equal(first.runTableDomainOutputScaffoldFingerprint, second.runTableDomainOutputScaffoldFingerprint);
  assert.match(first.runTableDomainOutputScaffoldFingerprint, /^safe-runtable-domain-output-scaffold:/);
});

test("does not expose raw rows, payloads, or exact electrical values", () => {
  const result = buildRuntimeRunTableDomainOutputScaffoldSummary(scaffoldInput());

  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawSelectorPayloadReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.exactElectricalValuesReturned, false);
  assert.equal(result.safeBoardDomainSummary.exactElectricalValuesReturned, false);
  assert.equal(result.safeDriverDomainSummary.exactElectricalValuesReturned, false);
});

test("does not invoke donor Engine, mutate RuntimeData, persist selected result, generate RunTable, or generate IES", () => {
  const result = buildRuntimeRunTableDomainOutputScaffoldSummary(scaffoldInput());

  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.productionRunTableGenerated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.blockedProductionOutputSummary.productionRunTableGenerated, false);
  assert.equal(result.blockedProductionOutputSummary.donorEngineInvocationBlocked, true);
  assert.equal(result.blockedProductionOutputSummary.selectedResultPersistenceBlocked, true);
});

test("adds no routes or POST endpoints", () => {
  const result = buildRuntimeRunTableDomainOutputScaffoldSummary(scaffoldInput());

  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.safetyFlags.publicRoutesAdded, false);
  assert.equal(result.safetyFlags.postEndpointsAdded, false);
});
