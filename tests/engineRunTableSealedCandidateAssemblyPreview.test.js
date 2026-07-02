import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSealedCandidateAssemblyPreviewSummary,
  buildRuntimeNativeSealedCandidateAssemblyPreviewSummary,
  buildEngineRunTableSealedCandidateAssemblyPreviewStatus,
  ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_ID,
  ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableSealedCandidateAssemblyPreview.js";

const POLICY_FINGERPRINT = "safe-policy:sealed-candidate-assembly-preview-fixture";
const SOURCE_FINGERPRINT = "safe-source:sealed-candidate-assembly-preview-fixture";

function safeEngineSummary(overrides = {}) {
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
    rawUsersReturned: false,
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

function selectorSelectionSummary(overrides = {}) {
  return {
    readOnly: true,
    status: "complete-safe-selector-preview",
    selectedValues: {
      system: "linear-60",
      variant: "linear-60-core",
      tier: "business",
      profile: "surface-profile",
      optic: "opal",
      uplight: "direct-only",
    },
    rawRowsExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
    payloadGenerationEnabled: false,
    specGenerationEnabled: false,
    slugGenerationEnabled: false,
    iesGenerationEnabled: false,
    runTableGenerationEnabled: false,
    hiddenWriteBackEnabled: false,
    blockers: [],
    missing: [],
    ...overrides,
  };
}

function timelineGateSummary(overrides = {}) {
  return {
    readOnly: true,
    timelineGateReady: true,
    status: "live",
    gate: "allowed",
    blocked: false,
    rawRowsExposed: false,
    ...overrides,
  };
}

function finishCascadeSummary(overrides = {}) {
  return {
    readOnly: true,
    finishCascadeReady: true,
    bodyValue: "white",
    bodyLabel: "White",
    fields: {
      finishCover: { mode: "inherited", value: "white", label: "White", missing: false },
      finishEnd: { mode: "inherited", value: "white", label: "White", missing: false },
      finishFlex: { mode: "manual-override", value: "black", label: "Black", missing: false },
    },
    rawRowsExposed: false,
    safety: {
      rawRowsExposed: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      runTableGenerated: false,
      iesGenerated: false,
      selectedResultPersisted: false,
      routesAdded: false,
      postEndpointsAdded: false,
      writes: false,
    },
    ...overrides,
  };
}

function mountCompatibilitySummary(overrides = {}) {
  return {
    readOnly: true,
    mountCompatibilityReady: true,
    compatible: true,
    mountStatus: "compatible",
    opticCompatibilityStatus: "compatible",
    uplightCompatibilityStatus: "not-required",
    rawRowsExposed: false,
    ...overrides,
  };
}

function runIntakePreviewSummary(overrides = {}) {
  return {
    readOnly: true,
    previewOnly: true,
    localStateOnly: true,
    runIntakePreviewReady: true,
    runCount: 1,
    totalQuantity: 2,
    completedRunCount: 1,
    incompleteRunCount: 0,
    safeRunIntentSummaries: [{
      id: "run-1",
      runNumber: 1,
      label: "Boardroom run",
      quantity: 2,
      runLengthMm: 5600,
      lengthMode: "same_length",
      status: "complete-safe-preview-intent",
      safePreviewOnly: true,
      enginePayloadIncluded: false,
      runTableIncluded: false,
      iesIncluded: false,
      writes: false,
      diagnostics: [],
    }],
    rawEnginePayloadExposed: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    ...overrides,
  };
}

function accessoryPlacementPreviewSummary(overrides = {}) {
  return {
    readOnly: true,
    previewOnly: true,
    localStateOnly: true,
    runAccessoryPlacementPreviewReady: true,
    accessoryIntentCount: 1,
    runsWithAccessoryIntentCount: 1,
    unresolvedAccessoryIntentCount: 0,
    safeAccessoryIntentRows: [{
      intentId: "accessory-intent-001",
      runReference: "Boardroom run",
      runId: "run-1",
      runNumber: 1,
      runLabel: "Boardroom run",
      runQuantity: 2,
      accessoryTypeToken: "sensor",
      quantityReceivingAccessory: 1,
      placementPreference: "mid",
      reservationIntentBand: "small",
      status: "confirmed",
      safePreviewOnly: true,
      accessoryReservationExecuted: false,
      accessoryReservationPayloadExposed: false,
      enginePayloadIncluded: false,
      rawEnginePayloadExposed: false,
      runTableIncluded: false,
      iesIncluded: false,
      writes: false,
      complete: true,
      diagnostics: [],
    }],
    rawAccessoryRowsExposed: false,
    rawEnginePayloadExposed: false,
    accessoryReservationExecuted: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    ...overrides,
  };
}

function specialPartsEntitlementPreviewSummary(overrides = {}) {
  return {
    source: "selector-special-parts-entitlement-preview",
    status: "none",
    specialPartsEntitlementPreviewReady: true,
    entitlementStatus: "none",
    displayRole: "internal_user",
    redactedEntitlementCount: 0,
    compatibleRedactedCandidateCount: 0,
    blockedRedactedCandidateCount: 0,
    reviewRequiredCount: 0,
    specialPartsOptInPreviewEnabled: false,
    specialPartsOptInPreviewOnly: true,
    specialPartsOptInActiveEnabled: false,
    candidateRows: [],
    safeCompatibilityResults: [],
    diagnostics: {
      failClosed: false,
      failClosedReasons: [],
      rawUsersReturned: false,
      rawContactsReturned: false,
      rawCrmReturned: false,
      rawProductRowsReturned: false,
      rawComponentRowsReturned: false,
      privatePathsReturned: false,
      credentialsReturned: false,
    },
    activeBuildMutationEnabled: false,
    hubSpotWriteEnabled: false,
    contactCreationEnabled: false,
    rawUsersReturned: false,
    rawContactsReturned: false,
    rawCrmReturned: false,
    rawProductRowsReturned: false,
    rawComponentRowsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function accessoryReservationSummary(overrides = {}) {
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.accessory-reservation-foothold-summary",
    accessoryReservationReady: true,
    boardFillInputReady: true,
    accessoryReservationFingerprint: "safe-reservation:sealed-candidate-assembly-preview-fixture",
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

function boardFillInputSummary(overrides = {}) {
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-fill-input-summary",
    effectiveBoardFillLengthMm: 5480,
    reservationStatus: "reserved-safe-band",
    boardFillInputFingerprint: "safe-board-fill-input:sealed-candidate-assembly-preview-fixture",
    ...overrides,
  });
}

function boardFillSummary(overrides = {}) {
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-fill-summary",
    runLengthMm: 5600,
    bodyLengthMm: 5480,
    selectedTierOrProfile: "Business",
    selectedBoardFamily: "sealed-board-family",
    boardCount: 4,
    boardLengthMm: 1400,
    boardUsedLengthMm: 5600,
    boardFillFingerprint: "safe-board-fill:sealed-candidate-assembly-preview-fixture",
    ...overrides,
  });
}

function boardElectricalSummary(overrides = {}) {
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.board-electrical-summary",
    electricalSummaryReady: true,
    boardVoltageClass: "safe-band:board-vf-24-48v",
    boardPowerClass: "safe-band:board-power-5-20w",
    summaryFingerprint: "safe-board-electrical:sealed-candidate-assembly-preview-fixture",
    exactElectricalValuesExposed: false,
    ...overrides,
  });
}

function driverSizerSummary(overrides = {}) {
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.driver-sizer-summary",
    driverSizerReady: true,
    driverCandidateCount: 2,
    compatibleDriverCandidateCount: 1,
    currentRangeStatus: "selected-current-within-safe-driver-range",
    utilisationBand: "target-band",
    capacityBand: "moderate-headroom-band",
    zoneCountCandidate: 2,
    limitingFactorCategory: "power-band-limited",
    driverSizerFingerprint: "safe-driver-sizer:sealed-candidate-assembly-preview-fixture",
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
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.sealed-segment-zone-bridge-summary",
    segmentZoneBridgeReady: true,
    segmentZoneBridgeFingerprint: "safe-segment-zone-bridge:sealed-candidate-assembly-preview-fixture",
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
    },
    ...overrides,
  });
}

function zoneValidationFootholdSummary(overrides = {}) {
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.zone-validation-foothold-summary",
    zoneValidationFootholdReady: true,
    zoneValidationFootholdFingerprint: "safe-zone-validation-foothold:sealed-candidate-assembly-preview-fixture",
    noCrossValidationSummary: {
      validationMode: "sealed-no-cross-zone-containment",
      noCrossValidationReady: true,
      zonesCrossSegmentJoin: false,
      crossJoinComparisonScoringEnabled: false,
      rawEnginePayloadReturned: false,
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
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.emergency-zone-picker-foothold-summary",
    emergencyZonePickerReady: true,
    emergencyZonePickerFingerprint: "safe-emergency-zone-picker:sealed-candidate-assembly-preview-fixture",
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

function gateDValidationScaffoldSummary(overrides = {}) {
  return safeEngineSummary({
    schemaId: "controlstack.runtime.engine-runtable.gate-d-validation-scaffold-summary",
    gateDScaffoldReady: true,
    gateDValidationScaffoldFingerprint: "safe-gate-d-validation-scaffold:sealed-candidate-assembly-preview-fixture",
    sealedReadinessSummary: {
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

function previewInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    selectorSelectionSummary: selectorSelectionSummary(),
    selectorRunIntakePreviewSummary: runIntakePreviewSummary(),
    selectorRunAccessoryPlacementPreviewSummary: accessoryPlacementPreviewSummary(),
    selectorSpecialPartsEntitlementPreviewSummary: specialPartsEntitlementPreviewSummary(),
    timelineGateSummary: timelineGateSummary(),
    finishCascadeSummary: finishCascadeSummary(),
    mountCompatibilitySummary: mountCompatibilitySummary(),
    accessoryReservationSummary: accessoryReservationSummary(),
    boardFillInputSummary: boardFillInputSummary(),
    boardFillSummary: boardFillSummary(),
    boardElectricalSummary: boardElectricalSummary(),
    driverSizerSummary: driverSizerSummary(),
    segmentZoneBridgeSummary: segmentZoneBridgeSummary(),
    zoneValidationFootholdSummary: zoneValidationFootholdSummary(),
    emergencyZonePickerFootholdSummary: emergencyZonePickerFootholdSummary(),
    gateDValidationScaffoldSummary: gateDValidationScaffoldSummary(),
    ...overrides,
  };
}

function blockerFor(overrides = {}) {
  return buildRuntimeSealedCandidateAssemblyPreviewSummary(previewInput(overrides)).blocker;
}

test("accepts complete safe Selector + Engine sealed summary set", () => {
  const result = buildRuntimeSealedCandidateAssemblyPreviewSummary(previewInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.sealedCandidateAssemblyPreviewReady, true);
  assert.equal(result.selectorSafeInputSummary.selectorSelection.selectedSystemToken, "linear-60");
  assert.equal(result.selectorSafeInputSummary.runIntake.runs[0].runLengthMm, 5600);
  assert.equal(result.selectorSafeInputSummary.accessoryPlacementIntent.intents[0].intentOnly, true);
  assert.equal(result.engineSafeInputSummary.gateDScaffoldReady, true);
  assert.equal(result.candidateReadinessSummary.readyForFutureCandidateHandoff, true);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawSelectorPayloadReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.rawUsersReturned, false);
  assert.equal(result.rawCrmReturned, false);
  assert.equal(result.rawContactsReturned, false);
  assert.equal(result.privatePathsReturned, false);
  assert.equal(result.credentialsReturned, false);
});

test("aliases point at the same sealed candidate assembly helper", () => {
  assert.equal(buildRuntimeNativeSealedCandidateAssemblyPreviewSummary, buildRuntimeSealedCandidateAssemblyPreviewSummary);
  assert.equal(buildEngineRunTableSealedCandidateAssemblyPreviewStatus, buildRuntimeSealedCandidateAssemblyPreviewSummary);
});

test("rejects missing Selector selection summary", () => {
  assert.equal(blockerFor({ selectorSelectionSummary: null }), "missing-selector-selection-summary");
});

test("rejects run intake not ready", () => {
  assert.equal(blockerFor({ selectorRunIntakePreviewSummary: runIntakePreviewSummary({ runIntakePreviewReady: false }) }), "run-intake-not-ready");
});

test("rejects accessory placement intent not ready", () => {
  assert.equal(blockerFor({ selectorRunAccessoryPlacementPreviewSummary: accessoryPlacementPreviewSummary({ runAccessoryPlacementPreviewReady: false }) }), "accessory-placement-intent-not-ready");
});

test("rejects special-parts entitlement not ready", () => {
  assert.equal(blockerFor({ selectorSpecialPartsEntitlementPreviewSummary: specialPartsEntitlementPreviewSummary({ specialPartsEntitlementPreviewReady: false }) }), "special-parts-entitlement-not-ready");
});

test("rejects timeline gate blocked", () => {
  assert.equal(blockerFor({ timelineGateSummary: timelineGateSummary({ timelineGateReady: false, blocked: true }) }), "timeline-gate-blocked");
});

test("rejects mount compatibility blocked", () => {
  assert.equal(blockerFor({ mountCompatibilitySummary: mountCompatibilitySummary({ compatible: false, status: "blocked" }) }), "mount-compatibility-blocked");
});

test("rejects finish cascade unresolved", () => {
  assert.equal(blockerFor({ finishCascadeSummary: finishCascadeSummary({ fields: { finishCover: { mode: "unresolved", missing: true } } }) }), "finish-cascade-unresolved");
});

test("rejects Gate D not ready", () => {
  assert.equal(blockerFor({ gateDValidationScaffoldSummary: gateDValidationScaffoldSummary({ gateDScaffoldReady: false }) }), "gate-d-validation-scaffold-not-ready");
});

test("rejects fingerprint mismatch", () => {
  assert.equal(blockerFor({ driverSizerSummary: driverSizerSummary({ policyFingerprint: "safe-policy:mismatch" }) }), "fingerprint-mismatch");
});

test("rejects missing engine sealed summaries", () => {
  assert.equal(blockerFor({ accessoryReservationSummary: null }), "missing-accessory-reservation-summary");
  assert.equal(blockerFor({ boardFillInputSummary: null }), "missing-board-fill-input-summary");
  assert.equal(blockerFor({ boardFillSummary: null }), "missing-board-fill-summary");
  assert.equal(blockerFor({ boardElectricalSummary: null }), "missing-board-electrical-summary");
  assert.equal(blockerFor({ driverSizerSummary: null }), "missing-driver-sizer-summary");
  assert.equal(blockerFor({ segmentZoneBridgeSummary: null }), "missing-segment-zone-bridge-summary");
  assert.equal(blockerFor({ zoneValidationFootholdSummary: null }), "missing-zone-validation-foothold-summary");
  assert.equal(blockerFor({ emergencyZonePickerFootholdSummary: null }), "missing-emergency-zone-picker-foothold-summary");
  assert.equal(blockerFor({ gateDValidationScaffoldSummary: null }), "missing-gate-d-validation-scaffold-summary");
});

test("rejects raw Selector payload flag", () => {
  assert.equal(blockerFor({ rawSelectorPayloadReturned: true }), "raw-selector-payload-not-approved");
  assert.equal(blockerFor({ selectorSelectionSummary: selectorSelectionSummary({ rawSelectorPayloadReturned: true }) }), "raw-selector-payload-not-approved");
});

test("rejects raw Engine payload flag", () => {
  assert.equal(blockerFor({ rawEnginePayloadReturned: true }), "raw-engine-payload-not-approved");
  assert.equal(blockerFor({ gateDValidationScaffoldSummary: gateDValidationScaffoldSummary({ rawEnginePayloadReturned: true }) }), "raw-engine-payload-not-approved");
});

test("rejects raw product rows, USERS, CRM, contacts, private paths, and credentials", () => {
  const cases = [
    [{ rawProductRowsReturned: true }, "raw-product-rows-not-approved"],
    [{ rawUsersReturned: true }, "raw-users-not-approved"],
    [{ rawCrmReturned: true }, "raw-crm-not-approved"],
    [{ rawContactsReturned: true }, "raw-contacts-not-approved"],
    [{ privatePathsReturned: true }, "private-path-return-not-approved"],
    [{ credentialsReturned: true }, "credential-return-not-approved"],
  ];
  for (const [override, blocker] of cases) {
    assert.equal(blockerFor(override), blocker);
  }
});

test("rejects selected-result persistence flag", () => {
  assert.equal(blockerFor({ selectedResultPersisted: true }), "selected-result-persistence-not-approved");
});

test("rejects RunTable/IES flags", () => {
  assert.equal(blockerFor({ runTableGenerated: true }), "runtable-generation-not-approved");
  assert.equal(blockerFor({ iesGenerated: true }), "ies-generation-not-approved");
});

test("rejects HubSpot/project write flags", () => {
  assert.equal(blockerFor({ hubSpotWriteEnabled: true }), "hubspot-write-not-approved");
  assert.equal(blockerFor({ projectWriteEnabled: true }), "project-write-not-approved");
});

test("rejects route or POST endpoint flags", () => {
  assert.equal(blockerFor({ routesAdded: true }), "route-or-post-endpoint-not-approved");
  assert.equal(blockerFor({ postEndpointsAdded: true }), "route-or-post-endpoint-not-approved");
});

test("produces deterministic sealedCandidateAssemblyPreviewFingerprint", () => {
  const first = buildRuntimeSealedCandidateAssemblyPreviewSummary(previewInput());
  const second = buildRuntimeSealedCandidateAssemblyPreviewSummary(previewInput());

  assert.equal(first.sealedCandidateAssemblyPreviewFingerprint, second.sealedCandidateAssemblyPreviewFingerprint);
  assert.match(first.sealedCandidateAssemblyPreviewFingerprint, /^safe-sealed-candidate-assembly-preview:/);
});

test("does not invoke donor Engine, mutate RuntimeData, generate RunTable, or generate IES", () => {
  const result = buildRuntimeSealedCandidateAssemblyPreviewSummary(previewInput());

  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.hubSpotWriteEnabled, false);
  assert.equal(result.projectWriteEnabled, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.blockedDependencySummary.donorEngineInvocationBlocked, true);
});
