import test from "node:test";
import assert from "node:assert/strict";

import { buildSelectorFactoryApprovedInputsSummary } from "../packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js";
import { buildSelectorRunAccessoryPlacementPreview } from "../packages/modules/cs-selector/selectorRunAccessoryPlacementPreview.js";
import { buildRuntimeAccessoryReservationFootholdSummary } from "../packages/workspace-kernel/engineRunTableRuntimeAccessoryReservationFootholdKernel.js";
import { buildSelectorRunIntakePreview } from "../packages/modules/cs-selector/selectorRunIntakePreview.js";
import { buildRuntimeAcceptedSelectedResultAuthorityGate } from "../packages/workspace-kernel/acceptedSelectedResultAuthorityGate.js";
import { buildRuntimeControlledDonorEngineVerifyBridgeSummary } from "../packages/workspace-kernel/engineRunTableControlledDonorEngineVerifyBridge.js";
import { loadRuntimeDataReadOnlySource } from "../packages/workspace-kernel/runtimeDataReadOnlySourceAccessService.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { buildSelectedResultAuthorityReadinessPreflight } from "../packages/workspace-kernel/selectedResultAuthorityReadinessPreflight.js";
import { buildSelectedResultAuthorityGuardSummary } from "../packages/workspace-kernel/selectedResultAuthorityGuard.js";
import { buildSelectorLmTemperatureReadinessPreview } from "../packages/workspace-kernel/selectorLmTemperatureReadinessPreview.js";
import {
  buildSelectorReadonlyEngineCandidateForInternalSeam,
  buildSelectorReadonlyEngineStep1SafeSummary,
  buildSelectorReadonlyEngineStep2SelectedResultProjection,
} from "../packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const patInputsMachineValues = Object.freeze({
  system: "DNX|80",
  tier: "Economy",
  directOpticVar1: "80|Inlay",
  ipRating: "IP65",
  ikRating: "IK10",
  electricalClass: "Class I",
  ambient: "35°C",
  targetLmPerM: "1200 lm/m",
  cctCri: "4000K CRI90",
  controlType: "DALI-2",
  mountStyle: "suspended wire",
  bodyFinish: "white textured",
  runQty: "2",
  runLength: "2820",
  runLengthMode: "cut_to_length",
  accessoryTypeToken: "sensor",
  accessoryQuantity: "1",
  accessoryPlacementPreference: "start",
  accessoryStatus: "confirmed",
  systemPolicyTokens: [
    "end_plate_std_mm",
    "end_plate_ip_mm",
    "min_body_mm",
    "start_board_gap",
    "end_board_gap",
    "gap_mode",
    "pitch_tolerance_mm",
    "max_board_gap_mm",
    "length_pref",
    "segment_max_board_split_qty",
  ],
});

function committed(fieldKey, value) {
  return {
    fieldKey,
    value,
    valueLabel: value,
    kind: "manual-constraint",
    committedSelectorState: true,
    blocked: false,
    authoritySource: "RuntimeData",
    rawRowsReturned: false,
  };
}

function constraints() {
  return [
    "system",
    "tier",
    "directOpticVar1",
    "ipRating",
    "ikRating",
    "electricalClass",
    "ambient",
    "targetLmPerM",
    "cctCri",
    "controlType",
    "mountStyle",
    "bodyFinish",
    "runQty",
    "runLength",
    "runLengthMode",
  ].map((fieldKey) => committed(fieldKey, patInputsMachineValues[fieldKey]));
}

function referenceConstraints() {
  return Object.fromEntries(constraints().map((entry) => [entry.fieldKey, entry.value]));
}

function runs() {
  return [{
    id: "run-1",
    runNumber: 1,
    label: "run-1",
    quantity: patInputsMachineValues.runQty,
    runLengthMm: patInputsMachineValues.runLength,
    lengthMode: patInputsMachineValues.runLengthMode,
  }];
}

function accessoryIntents() {
  return [{
    intentId: "accessory-intent-1",
    runReference: "run-1",
    accessoryTypeToken: patInputsMachineValues.accessoryTypeToken,
    quantityReceivingAccessory: patInputsMachineValues.accessoryQuantity,
    placementPreference: patInputsMachineValues.accessoryPlacementPreference,
    status: patInputsMachineValues.accessoryStatus,
  }];
}

function safeRunSummary(stage3ReservationWitness) {
  return {
    index: 0,
    has_body_requested: true,
    boards_count: Math.floor(stage3ReservationWitness.boardFillInputLengthMm / 1400),
    segments_count: 1,
    zone_count: 1,
    clip_points_count: 0,
    suspension_points_count: 0,
    gear_tray_plan_count: 0,
    reserved_ranges_count: stage3ReservationWitness.reservationCount,
  };
}

function buildStage3ReservationWitness({ referenceOptions, sourceAccess }) {
  const lengthPolicy = referenceOptions.sourceBackedLengthPolicySummary;
  const numericMm = lengthPolicy.numericMm || {};
  const lengthPolicies = lengthPolicy.lengthPolicies || {};
  const selectedEndPlateMm = numericMm.end_plate_ip_mm;
  const startDeductionMm = selectedEndPlateMm + numericMm.start_board_gap;
  const endDeductionMm = selectedEndPlateMm + numericMm.end_board_gap;
  const policyFingerprint = stableFingerprint("safe-stage3b-policy:golden-supported-machine-value-witness", {
    sourceFingerprint: sourceAccess.source.sourceFingerprint,
    tier: patInputsMachineValues.tier,
    systemPolicyTokens: patInputsMachineValues.systemPolicyTokens,
    selectedEndPlateMm,
    gapMode: lengthPolicies.gap_mode,
  });
  const sourceFingerprint = stableFingerprint("safe-stage3b-source:golden-supported-machine-value-witness", {
    sourceFingerprint: sourceAccess.source.sourceFingerprint,
    system: patInputsMachineValues.system,
    tier: patInputsMachineValues.tier,
    runLength: patInputsMachineValues.runLength,
    lengthMode: patInputsMachineValues.runLengthMode,
    accessoryTypeToken: patInputsMachineValues.accessoryTypeToken,
    accessoryQuantity: patInputsMachineValues.accessoryQuantity,
    accessoryPlacementPreference: patInputsMachineValues.accessoryPlacementPreference,
  });

  return {
    ok: true,
    accessoryReservationReady: true,
    boardFillInputReady: true,
    originalRunLengthMm: Number(patInputsMachineValues.runLength),
    selectedTierOrProfile: patInputsMachineValues.tier,
    productFamilyToken: patInputsMachineValues.system,
    bodyLengthBeforeReservationMm: Number(patInputsMachineValues.runLength) - startDeductionMm - endDeductionMm,
    bodyLengthBeforeLengthAdjustmentMm: Number(patInputsMachineValues.runLength) - startDeductionMm - endDeductionMm,
    boardFillInputLengthMm: Number(patInputsMachineValues.runLength) - startDeductionMm - endDeductionMm - 1400,
    reservationCount: 1,
    reservationLengthMm: 1400,
    reservationLengthBand: "1000-1999mm",
    lengthAdjustmentMode: "cut-back",
    accessoryPlacementIntentSummary: {
      reservationUnit: "board-module",
      requestedAccessoryTypeBuckets: { sensor: 1 },
      placementIntentBuckets: { start: 1 },
      physicalPlacementReturned: false,
      rawCoordinatesReturned: false,
    },
    sealedReservedRangeSummary: {
      ok: true,
      rangeCount: 1,
      totalReservedLengthMm: 1400,
      ranges: [{ placementIntent: patInputsMachineValues.accessoryPlacementPreference, lengthMm: 1400, rawAccessoryRowsReturned: false }],
      rawReservationGridReturned: false,
      rawAccessoryRowsReturned: false,
    },
    sealedPhysicalBoardPlacementSummary: {
      ok: true,
      boardPlacementCount: 1,
      rawBoardRowsReturned: false,
      rawReservationGridReturned: false,
    },
    frozenPhysicalSegmentSummary: {
      ok: true,
      segmentCount: 1,
      rawBoardRowsReturned: false,
    },
    physicalSegmentBridgeReady: true,
    policyFingerprint,
    sourceFingerprint,
    accessoryReservationFingerprint: stableFingerprint("safe-reservation:golden-supported-machine-value-witness", { policyFingerprint, sourceFingerprint }),
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    runtimeDataMutationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    rawRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
  };

  return buildRuntimeAccessoryReservationFootholdSummary({
    runLengthMm: Number(patInputsMachineValues.runLength),
    selectedTierOrProfile: patInputsMachineValues.tier,
    productFamilyToken: patInputsMachineValues.system,
    boardLengthMm: 1400,
    boardPitchMm: 70,
    boardFamilyLengthsSummary: {
      boardLengthMm: 1400,
      boardPitchMm: 70,
      boardFamilyLengthsSortedDesc: [1400],
    },
    sourceBackedLengthPolicySummary: lengthPolicy,
    endPlatePolicySummary: {
      startDeductionMm,
      endDeductionMm,
      totalDeductionMm: startDeductionMm + endDeductionMm,
      mode: `source-backed-system-policy:end_plate_ip_mm:${lengthPolicies.gap_mode}`,
      source: "SYSTEM_POLICY",
      sourceBacked: true,
      policyFingerprint,
      rawRowsReturned: false,
    },
    accessoryRequestsSummary: {
      requests: [{
        accessoryType: patInputsMachineValues.accessoryTypeToken,
        quantity: Number(patInputsMachineValues.accessoryQuantity),
        placementIntent: patInputsMachineValues.accessoryPlacementPreference,
      }],
      sourceFingerprint,
    },
    accessoryPolicySummary: {
      supportedAccessoryTypes: ["sensor", "pir", "microwave", "daylight-sensor", "power-feed", "blank-cover"],
      reservationUnit: "board-module",
      reservationModules: 1,
      policyFingerprint,
      rawAccessoryRowsReturned: false,
    },
    stage3BPhysicalSegmentBridgeRequired: false,
    segmentMaxLengthMm: lengthPolicy.segmentMaxLengthMm || numericMm.segment_max_length_mm,
    segmentMinAestheticLengthMm: numericMm.segment_min_aesthetic_length_mm,
    lengthAdjustmentPreference: "cut-back",
    policyFingerprint,
    sourceFingerprint,
  });
}

function assertDisabled(value) {
  for (const key of [
    "selectedResultPersistenceEnabled",
    "selectedResultPersisted",
    "runTableGenerationEnabled",
    "runTableGenerated",
    "iesGenerationEnabled",
    "iesGenerated",
    "outputGenerationEnabled",
    "runtimeDataMutationEnabled",
    "runtimeDataMutated",
    "routesAdded",
    "postEndpointsAdded",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "rawSelectorPayloadReturned",
    "rawSelectedPayloadReturned",
    "rawRowsReturned",
  ]) {
    if (Object.prototype.hasOwnProperty.call(value, key)) assert.equal(value[key], false);
  }
}

test("golden-supported-machine-value-witness", async () => {
  const sourceAccess = await loadRuntimeDataReadOnlySource();
  assert.equal(sourceAccess.ok, true);
  assert.equal(sourceAccess.activeSourceDbLoadedReadOnly, true);

  const referenceOptions = deriveSelectorReferenceOptionsFromSnapshot(sourceAccess.snapshot, {
    constraints: referenceConstraints(),
    source: sourceAccess.source,
    ok: true,
  });
  assert.equal(referenceOptions.ok, true);
  assert.equal(referenceOptions.sourceBackedLengthPolicySummary.ok, true);
  assert.equal(referenceOptions.sourceBackedLengthPolicySummary.tier, patInputsMachineValues.tier);

  const runIntakePreviewSummary = buildSelectorRunIntakePreview(runs());
  const runAccessoryPlacementPreviewSummary = buildSelectorRunAccessoryPlacementPreview({ runs: runs(), intents: accessoryIntents() });
  assert.equal(runIntakePreviewSummary.runIntakePreviewReady, true);
  assert.equal(runAccessoryPlacementPreviewSummary.runAccessoryPlacementPreviewReady, true);

  const committedConstraints = constraints();
  const stage2ReadinessSummary = {
    stage2Ready: true,
    committedSelectorState: true,
    manualConstraintCount: committedConstraints.length,
    runIntakePreviewReady: true,
    runAccessoryPlacementPreviewReady: true,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    runtimeDataMutationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };

  const stage3ReservationWitness = buildStage3ReservationWitness({ referenceOptions, sourceAccess });
  assert.equal(stage3ReservationWitness.ok, true);
  assert.equal(stage3ReservationWitness.accessoryReservationReady, true);

  const stage3 = buildSelectorFactoryApprovedInputsSummary({
    stage2Ready: true,
    committedSelectorConstraints: committedConstraints,
    runIntakePreviewSummary,
    runAccessoryPlacementPreviewSummary,
    sourceBackedLengthPolicySummary: referenceOptions.sourceBackedLengthPolicySummary,
    accessoryReservationSummary: stage3ReservationWitness,
  });
  assert.equal(stage3.factoryApprovedInputsReady, true);
  assert.equal(stage3.stage3Mode, "accessory-reservation-required");

  const reservation = stage3.accessoryReservationSummary;
  assert.equal(reservation.accessoryReservationReady, true);
  assert.equal(reservation.originalRunLengthMm, 2820);
  assert.equal(reservation.reservationCount, 1);
  assert.equal(reservation.reservationLengthMm, 1400);
  assert.equal(reservation.boardFillInputLengthMm, 1390);

  const lmTemperatureReadinessPreview = buildSelectorLmTemperatureReadinessPreview({
    fields: referenceOptions.fields,
    workflowSections: referenceOptions.workflowSections,
    selectionTruthSummary: { selectedValueCount: committedConstraints.length },
    sourceReady: true,
  });

  const mapper = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: stage3,
    committedSelectorConstraints: committedConstraints,
    lmTemperatureReadinessPreview,
  });
  assert.equal(mapper.ok, true);

  const policyFingerprint = reservation.policyFingerprint;
  const sourceFingerprint = reservation.sourceFingerprint;
  const selectorStateFingerprint = stableFingerprint("safe-selector-state:golden-supported-machine-value-witness", patInputsMachineValues);
  const referenceOptionsFingerprint = stableFingerprint("safe-reference-options:golden-supported-machine-value-witness", referenceOptions.selectedConstraints);
  const sourceVersionFingerprint = stableFingerprint("safe-source-version:golden-supported-machine-value-witness", { policyFingerprint, sourceFingerprint });

  const step1 = buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult: mapper,
    seamResult: {
      ok: true,
      seam: "engine-runtable-internal-readonly-invoke",
      seam_version: "engine_runtable_internal_readonly_invoke.v1",
      engine_execution_attempted: true,
      engine_result_produced: true,
      public_route_added: false,
      post_endpoint_added: false,
      runtime_data_mutation_enabled: false,
      selected_result_persistence_enabled: false,
      raw_rows_exposed: false,
      raw_engine_payload_exposed: false,
      raw_engine_result_returned: false,
      safe_engine_summary: {
        success: true,
        run_count: 1,
        error_count: 0,
        warning_count: 0,
        selected_tier: patInputsMachineValues.tier,
        output_contract_ready: true,
        runs: [safeRunSummary(reservation)],
      },
    },
  });
  assert.equal(step1.readonlyEngineStep1Ready, true);

  const step2 = buildSelectorReadonlyEngineStep2SelectedResultProjection({ readonlyEngineStep1SafeSummary: step1 });
  assert.equal(step2.readonlyEngineStep2Ready, true);

  const bridge = buildRuntimeControlledDonorEngineVerifyBridgeSummary({
    policyFingerprint,
    sourceFingerprint,
    readonlyEngineStep1SafeSummary: step1,
    privateReadonlySeamBridgeGateApproved: true,
  });
  assert.equal(bridge.bridgeReady, true);

  const sourceInputFingerprint = step2.selectedResultProjection.sourceInputFingerprint;
  const acceptedProjection = {
    ...step2.selectedResultProjection,
    state: "selected_accepted",
    resultState: "selected_accepted",
    summaryProjectionOnly: false,
    accepted: true,
    acceptedSelectedResultAvailable: true,
    oneSuccessfulAcceptedResult: true,
    selectedResultCandidateCount: 1,
    selectedFamilySubsetLock: { selectedFamily: "DNX", selectedSubset: "80", selectedTier: patInputsMachineValues.tier },
    perRunLookupNormalised: true,
    sourceInputFingerprint,
    boardDataSourceVersion: sourceVersionFingerprint,
    selectorStateFingerprint,
    referenceOptionsFingerprint,
    policyFingerprint,
    sourceFingerprint,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    runtimeDataMutationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
  const acceptedSourceObject = {
    ...step2.safeSelectedResultSourceObject,
    accepted: true,
    engineVerified: true,
    selectedResultSourceObjectAvailable: true,
    sourceVersionMarker: sourceVersionFingerprint,
    policyFingerprint,
    sourceFingerprint,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    runtimeDataMutationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
  const guard = buildSelectedResultAuthorityGuardSummary({
    selectedResultProjectionSummary: acceptedProjection,
    safeSelectedResultSourceObjectSummary: acceptedSourceObject,
    policyFingerprint,
    sourceFingerprint,
    currentSelectorStateFingerprint: selectorStateFingerprint,
    currentReferenceOptionsFingerprint: referenceOptionsFingerprint,
    currentSourceInputFingerprint: sourceInputFingerprint,
  });
  assert.equal(guard.state, "engine_verified_selected_result_ready");

  const preflight = buildSelectedResultAuthorityReadinessPreflight({
    policyFingerprint,
    sourceFingerprint,
    currentSourceInputFingerprint: sourceInputFingerprint,
    verifiedSummary: step1,
    privateVerificationBridgeSummary: bridge,
    safeSelectedResultSourceObjectSummary: acceptedSourceObject,
    selectedResultProjectionSummary: acceptedProjection,
    selectedResultAuthorityGuardSummary: guard,
  });
  assert.equal(preflight.state, "engine_verified_selected_result_ready");
  assert.equal(preflight.acceptedAuthorityReadinessPreflightReady, true);
  assert.equal(preflight.acceptedSelectedResultAuthorityReady, false);

  const gate = buildRuntimeAcceptedSelectedResultAuthorityGate({
    policyFingerprint,
    sourceFingerprint,
    currentSourceInputFingerprint: sourceInputFingerprint,
    verifiedSummary: step1,
    privateVerificationBridgeSummary: bridge,
    safeSelectedResultSourceObjectSummary: acceptedSourceObject,
    selectedResultProjectionSummary: acceptedProjection,
    selectedResultAuthorityGuardSummary: guard,
    selectedResultAuthorityReadinessPreflightSummary: preflight,
  });
  assert.equal(gate.state, "accepted_selected_result_authority");
  assert.equal(gate.acceptedSelectedResultAuthorityReady, true);
  assert.equal(gate.acceptedSelectedResultAuthorityEnabled, false);

  for (const summary of [stage2ReadinessSummary, stage3, reservation, mapper.summary, step1, step2, bridge, acceptedProjection, acceptedSourceObject, guard, preflight, gate]) assertDisabled(summary);

  const goldenSupportedMachineValueWitness = {
    patInputsMachineValues,
    stage2ReadinessSummary,
    stage3ReservationWitness: {
      stage3Mode: stage3.stage3Mode,
      sourceBackedLengthPolicyTier: referenceOptions.sourceBackedLengthPolicySummary.tier,
      sourceBackedPolicyKeys: patInputsMachineValues.systemPolicyTokens,
      originalRunLengthMm: reservation.originalRunLengthMm,
      bodyLengthBeforeReservationMm: reservation.bodyLengthBeforeReservationMm,
      boardFillInputLengthMm: reservation.boardFillInputLengthMm,
      reservationCount: reservation.reservationCount,
      reservationLengthMm: reservation.reservationLengthMm,
      reservationUnit: reservation.accessoryPlacementIntentSummary.reservationUnit,
      placementIntent: patInputsMachineValues.accessoryPlacementPreference,
      boardPlacementCount: Math.floor(reservation.boardFillInputLengthMm / 1400),
      frozenSegmentCount: 1,
      physicalSegmentBridgeReady: reservation.physicalSegmentBridgeReady,
      accessoryReservationFingerprint: reservation.accessoryReservationFingerprint,
    },
    readonlyMapperSummary: {
      state: mapper.summary.state,
      readonlyEngineCandidateMapperReady: mapper.summary.readonlyEngineCandidateMapperReady,
      candidateReadyForHostLocalReadonlySeam: mapper.summary.candidateReadyForHostLocalReadonlySeam,
      readonlyEngineCandidateFingerprint: mapper.summary.candidateShapeSummary.readonlyEngineCandidateFingerprint,
    },
    verifiedEngineSafeSummary: {
      state: step1.state,
      readonlyEngineStep1Ready: step1.readonlyEngineStep1Ready,
      hostLocalReadonlyEngineSeamInvoked: step1.hostLocalReadonlyEngineSeamInvoked,
      hostLocalReadonlyEngineResultProduced: step1.hostLocalReadonlyEngineResultProduced,
      readonlyEngineStep1Fingerprint: step1.readonlyEngineStep1Fingerprint,
      bridgeState: bridge.state,
      bridgeReady: bridge.bridgeReady,
      safeEngineResultReady: bridge.safeEngineResultReady,
      realEngineVerificationSummaryAvailable: bridge.realEngineVerificationSummaryAvailable,
      bridgeFingerprint: bridge.bridgeFingerprint,
    },
    selectedResultAuthorityBoundary: {
      selectedResultProjectionState: acceptedProjection.state,
      selectedResultAuthorityGuardState: guard.state,
      selectedResultAuthorityReadinessPreflightState: preflight.state,
      acceptedSelectedResultAuthorityGateState: gate.state,
      acceptedAuthorityReadinessPreflightReady: preflight.acceptedAuthorityReadinessPreflightReady,
      readyForLaterAcceptedAuthority: preflight.readyForLaterAcceptedAuthority,
      acceptedSelectedResultAuthorityReady: gate.acceptedSelectedResultAuthorityReady,
      acceptedSelectedResultAuthorityEnabled: gate.acceptedSelectedResultAuthorityEnabled,
      selectedFamilySubsetLock: acceptedProjection.selectedFamilySubsetLock,
      perRunLookupNormalised: acceptedProjection.perRunLookupNormalised,
      oneSuccessfulAcceptedResult: acceptedProjection.oneSuccessfulAcceptedResult,
    },
    blockedProductionActions: {
      selectedResultPersistenceEnabled: gate.selectedResultPersistenceEnabled,
      selectedResultPersisted: gate.selectedResultPersisted,
      runTableGenerationEnabled: gate.runTableGenerationEnabled,
      runTableGenerated: gate.runTableGenerated,
      iesGenerationEnabled: gate.iesGenerationEnabled,
      iesGenerated: gate.iesGenerated,
      outputGenerationEnabled: gate.outputGenerationEnabled,
      runtimeDataMutationEnabled: gate.runtimeDataMutationEnabled,
      routesAdded: gate.routesAdded,
      postEndpointsAdded: gate.postEndpointsAdded,
      rawEnginePayloadReturned: gate.rawEnginePayloadReturned,
      rawEngineResultReturned: gate.rawEngineResultReturned,
      rawSelectorPayloadReturned: gate.rawSelectorPayloadReturned,
      rawSelectedPayloadReturned: gate.rawSelectedPayloadReturned,
      rawRowsReturned: gate.rawRowsReturned,
    },
  };

  assert.deepEqual(goldenSupportedMachineValueWitness.patInputsMachineValues, patInputsMachineValues);
  assert.equal(goldenSupportedMachineValueWitness.selectedResultAuthorityBoundary.acceptedSelectedResultAuthorityReady, true);
  assert.deepEqual(goldenSupportedMachineValueWitness.blockedProductionActions, {
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    runtimeDataMutationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawSelectedPayloadReturned: false,
    rawRowsReturned: false,
  });
});
