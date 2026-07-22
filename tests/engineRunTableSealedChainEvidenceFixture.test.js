import test from "node:test";
import assert from "node:assert/strict";

import { buildSelectorRunIntakePreview } from "../packages/modules/cs-selector/selectorRunIntakePreview.js";
import { buildSelectorRunAccessoryPlacementPreview } from "../packages/modules/cs-selector/selectorRunAccessoryPlacementPreview.js";
import { buildSelectorSpecialPartsEntitlementPreview } from "../packages/modules/cs-selector/selectorSpecialPartsEntitlementPreview.js";
import { buildSelectorSafeDraftProjectEnvelopePreview } from "../packages/modules/cs-selector/selectorSafeDraftProjectEnvelopePreview.js";
import { buildSelectorSafeHydrateValidationPreview } from "../packages/modules/cs-selector/selectorSafeHydrateValidationPreview.js";

import { buildRuntimeAccessoryReservationFootholdSummary } from "../packages/workspace-kernel/engineRunTableRuntimeAccessoryReservationFootholdKernel.js";
import { buildRuntimeBoardFillInputSummary } from "../packages/workspace-kernel/engineRunTableRuntimeBoardFillInputAdapter.js";
import { buildRuntimeBoardFillKernelSummary } from "../packages/workspace-kernel/engineRunTableRuntimeBoardFillKernel.js";
import { buildRuntimeBoardElectricalSummary } from "../packages/workspace-kernel/engineRunTableRuntimeBoardElectricalSummary.js";
import { buildRuntimeDriverSizerKernelSummary } from "../packages/workspace-kernel/engineRunTableRuntimeDriverSizerKernel.js";
import { buildRuntimeSealedSegmentZoneBridgeSummary } from "../packages/workspace-kernel/engineRunTableRuntimeSealedSegmentZoneBridge.js";
import { buildRuntimeZoneValidationFootholdSummary } from "../packages/workspace-kernel/engineRunTableRuntimeZoneValidationFootholdKernel.js";
import { buildRuntimeEmergencyZonePickerFootholdSummary } from "../packages/workspace-kernel/engineRunTableRuntimeEmergencyZonePickerFoothold.js";
import { buildRuntimeGateDValidationScaffoldSummary } from "../packages/workspace-kernel/engineRunTableRuntimeGateDValidationScaffold.js";
import { buildRuntimeSealedCandidateAssemblyPreviewSummary } from "../packages/workspace-kernel/engineRunTableSealedCandidateAssemblyPreview.js";
import { buildRuntimeRunTableDomainOutputScaffoldSummary } from "../packages/workspace-kernel/engineRunTableRuntimeRunTableDomainOutputScaffold.js";
import { buildRuntimeControlledDonorEngineVerifyBridgeSummary } from "../packages/workspace-kernel/engineRunTableControlledDonorEngineVerifyBridge.js";
import { buildRuntimeSelectedResultHandoffScaffoldSummary } from "../packages/workspace-kernel/engineRunTableSelectedResultHandoffScaffold.js";
import { buildRuntimeIesHandoffReadinessScaffoldSummary } from "../packages/workspace-kernel/engineRunTableIesHandoffReadinessScaffold.js";

const SEED_SOURCE_FINGERPRINT = "safe-source:sealed-chain-evidence-fixture-seed";
const BOARD_FAMILY_FINGERPRINT = "safe-board-family:sealed-chain-evidence-fixture";
const CURRENT_REFERENCE_OPTIONS_FINGERPRINT = "safe-reference-options:sealed-chain-evidence-fixture";
const CURRENT_SELECTOR_STATE_FINGERPRINT = "safe-selector-state:sealed-chain-evidence-fixture";

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "rawProductRowsReturned",
  "rawBoardRowsReturned",
  "rawDriverRowsReturned",
  "rawAccessoryRowsReturned",
  "rawSelectorPayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "exactPlacementCoordinatesReturned",
  "realDonorPayloadAssembled",
  "donorEngineInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "productionRunTableGenerated",
  "runTableGenerated",
  "iesGenerated",
  "hubSpotWriteEnabled",
  "projectWriteEnabled",
  "routesAdded",
  "postEndpointsAdded",
]);

const EXTRA_FALSE_FLAGS = Object.freeze([
  "exactElectricalValuesExposed",
  "rawReservationGridReturned",
  "rawEmergencyPayloadReturned",
  "rawUsersReturned",
  "rawCrmReturned",
  "rawContactsReturned",
  "privatePathsReturned",
  "credentialsReturned",
  "contactCreationEnabled",
  "complianceApproved",
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safePolicySnapshot() {
  return {
    _snapshot_id: "safe-sealed-chain-evidence-4200",
    SYSTEM_POLICY: [
      { item: "segment_max_length_mm", Business: "2800" },
      { item: "segment_min_aesthetic_length_mm", Business: "900" },
      { item: "segment_max_board_split_qty", Business: "0" },
      { item: "start_board_gap", Business: "0" },
      { item: "end_board_gap", Business: "0" },
      { item: "pitch_tolerance_mm", Business: "0" },
      { item: "max_board_gap_mm", Business: "0" },
      { item: "length_pref", Business: "nearest" },
      { item: "gap_mode", Business: "N-1" },
      { item: "electrical_zone_mode", Business: "start_run_as_one_zone" },
    ],
  };
}

function boardFamilySummary() {
  return {
    boardFamily: "Runtime Safe Linear Board Family",
    boardLengthMm: 1400,
    pitchMm: 70,
    boardQuantumMm: 70,
    boardFamilyLengthsSortedDesc: [1400],
    sourceFingerprint: BOARD_FAMILY_FINGERPRINT,
    rawRowsReturned: false,
  };
}

function buildCanonicalBoardFillSummary() {
  return buildRuntimeBoardFillKernelSummary({
    selectedTierOrProfile: "Business",
    runLengthMm: 4200,
    supportedDiagnosticRunLengthsMm: [4200],
    sourceSnapshot: safePolicySnapshot(),
    sourceBackedBoardFamilySummary: boardFamilySummary(),
  });
}

function selectorRuns() {
  return [
    {
      id: "run-1",
      runNumber: 1,
      label: "Boardroom run",
      quantity: 1,
      runLengthMm: "5600",
      
    },
  ];
}

function selectorAccessoryIntents() {
  return [
    {
      intentId: "accessory-intent-001",
      runReference: "run-1",
      accessoryTypeToken: "sensor",
      quantityReceivingAccessory: 1,
      placementPreference: "mid",
      status: "confirmed",
      notes: "safe fixture intent",
    },
  ];
}

function buildSpecialPartsPreview() {
  return buildSelectorSpecialPartsEntitlementPreview({
    safeRoleContext: {
      displayRole: "internal_user",
      actualRole: "internal_user",
      roleAuthority: "safe-redacted-fixture",
    },
    safeIdentityContext: {
      status: "matched-redacted",
      identityAuthority: "matched-redacted",
      matchedRedacted: true,
    },
    redactedEntitlementProjection: {
      redacted: true,
      identityAuthority: "matched-redacted",
      matchedRedacted: true,
      redactedEntitlementCount: 1,
      redactedCandidates: [
        {
          redactedRef: "redacted:special-chain-fixture",
          redacted: true,
          status: "available",
          system: "linear-60",
          variants_all: "core",
          ip_class: "IP44",
          effective_to: "2099-12-31",
          safelyEntitled: true,
        },
      ],
    },
    selectorSelectionContext: {
      selectedSystem: { system: "linear-60", variantKey: "core" },
      selectedVariant: { key: "core" },
      environment: { ipClass: "IP44" },
      timeline: { today: "2026-07-02" },
    },
    specialPartsOptInPreview: { status: "not-live-placeholder", writeEnabled: false },
  });
}

function selectedValuesSummary() {
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    status: "complete-safe-selected-values-summary",
    selectedValues: {
      system: "linear-60",
      variant: "linear-60-core",
      tier: "business",
      profile: "surface-profile",
      optic: "opal",
      mountStyle: "surface",
      bodyFinish: "white",
      controlType: "dali-2",
    },
    provenanceSummary: {
      selectedValueCount: 8,
      safeProvenanceOnly: true,
    },
    rawSelectorPayloadReturned: false,
    rawProductRowsReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
  };
}

function selectorReferenceOptionsSummary() {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    referenceOptionsReady: true,
    optionGroupCount: 4,
    redactedOptionCount: 18,
    rawProductRowsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
  };
}

function selectorSelectionSummary() {
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
    rawSelectorPayloadReturned: false,
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
  };
}

function timelineGateSummary() {
  return {
    readOnly: true,
    diagnosticOnly: true,
    timelineStatusReady: true,
    timelineGateReady: true,
    status: "available",
    gate: "allowed",
    blocked: false,
    keptCount: 1,
    hiddenCount: 0,
    rawProductRowsReturned: false,
    rawRowsExposed: false,
  };
}

function finishCascadeSummary() {
  return {
    readOnly: true,
    diagnosticOnly: true,
    finishCascadeReady: true,
    bodyValue: "white",
    bodyLabel: "White",
    fields: {
      finishCover: { mode: "inherited", value: "white", label: "White", missing: false },
      finishEnd: { mode: "inherited", value: "white", label: "White", missing: false },
      finishFlex: { mode: "inherited", value: "white", label: "White", missing: false },
    },
    rawProductRowsReturned: false,
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
  };
}

function mountCompatibilitySummary() {
  return {
    readOnly: true,
    diagnosticOnly: true,
    mountCompatibilityReady: true,
    compatible: true,
    mountStatus: "compatible",
    opticCompatibilityStatus: "compatible",
    uplightCompatibilityStatus: "not-required",
    rawRowsExposed: false,
  };
}

function safeEngineBase({ policyFingerprint, sourceFingerprint }, overrides = {}) {
  return {
    ok: true,
    diagnosticOnly: true,
    nativeRuntimeKernel: true,
    policyFingerprint,
    sourceFingerprint,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    exactElectricalValuesExposed: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function safeSealedCandidateAssemblyEnvelopeSummary(summary) {
  return safeEngineBase({
    policyFingerprint: summary.policyFingerprint,
    sourceFingerprint: summary.sourceFingerprint,
  }, {
    schemaId: summary.schemaId,
    schemaVersion: summary.schemaVersion,
    state: summary.state,
    sealedCandidateAssemblyPreviewReady: summary.sealedCandidateAssemblyPreviewReady,
    sealedCandidateAssemblyPreviewFingerprint: summary.sealedCandidateAssemblyPreviewFingerprint,
    candidateReadinessSummary: {
      diagnosticOnly: true,
      readyForFutureCandidateHandoff: summary.candidateReadinessSummary?.readyForFutureCandidateHandoff === true,
      donorEnginePayloadReady: false,
      runTableReady: false,
      iesReady: false,
      selectedResultPersistenceReady: false,
    },
  });
}

function accessoryReservationInput({ policyFingerprint, sourceFingerprint }) {
  return {
    runLengthMm: 5600,
    selectedTierOrProfile: "Business",
    productFamilyToken: "safe-linear-family",
    boardLengthMm: 1400,
    boardPitchMm: 70,
    boardFamilyLengthsSummary: {
      boardLengthMm: 1400,
      boardPitchMm: 70,
      boardFamilyLengthsSortedDesc: [1400],
    },
    endPlatePolicySummary: {
      startDeductionMm: 0,
      endDeductionMm: 0,
      mode: "sealed-end-plate-gap-summary",
    },
    accessoryRequestsSummary: {
      requests: [
        { accessoryType: "sensor", quantity: 1, placementIntent: "middle" },
      ],
      sourceFingerprint,
    },
    accessoryPolicySummary: {
      supportedAccessoryTypes: ["sensor", "pir", "power-entry"],
      reservationUnit: "board-module",
      reservationModules: 1,
      policyFingerprint,
      rawAccessoryRowsReturned: false,
    },
    lengthAdjustmentPreference: "cut-back",
    policyFingerprint,
    sourceFingerprint,
  };
}

function driverUtilLookupMetadata() {
  return {
    ok: true,
    contract_id: "controlstack.runtime.driver-util-curve.lookup-contract",
    contract_version: 1,
    lookup_method: "safe-driver-model-token",
    match_count: 1,
    curve: {
      filename: "driver_util_safe_sealed_chain_fixture.json",
      size_bytes: 128,
      sha256: "a".repeat(64),
      source_classification: "synthetic-safe-driver-util-summary",
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
  };
}

function safeDriverCandidate() {
  return {
    safeModelToken: "safe-driver-chain-a",
    safeModelLabel: "Safe Driver Chain A",
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
  };
}

function sealedPhysicalBoardPlacementSummary(fingerprints) {
  return safeEngineBase(fingerprints, {
    safeSummaryOnly: true,
    placements: [
      { boardIndex: 0, startMm: 0, endMm: 1400, lengthMm: 1400 },
      { boardIndex: 1, startMm: 1400, endMm: 2800, lengthMm: 1400 },
      { boardIndex: 2, startMm: 2800, endMm: 4200, lengthMm: 1400 },
    ],
  });
}

function sealedReservedRangeSummary(fingerprints) {
  return safeEngineBase(fingerprints, {
    safeSummaryOnly: true,
    ranges: [],
  });
}

function sealedSegmentPolicySummary({ policyFingerprint, sourceFingerprint }) {
  return {
    ok: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    segmentMaxLengthMm: 2800,
    secondary_across_segment: "forbid",
    policyFingerprint,
    sourceFingerprint,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    complianceApproved: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}

function emergencyIntentSummary({ policyFingerprint, sourceFingerprint }) {
  return {
    requiredEmergencyZoneCount: 1,
    preferredEmergencyZoneStrategy: "first",
    emergencyType: "marker-only",
    physicalHardwareRequired: false,
    complianceProofRequired: false,
    policyFingerprint,
    sourceFingerprint,
    rawEmergencyPayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    complianceApproved: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}

function selectedResultProjectionSummary({ policyFingerprint, sourceFingerprint }) {
  return {
    ok: true,
    readOnly: true,
    displayOnly: true,
    contractOnly: true,
    failClosed: true,
    sourceAvailable: true,
    selectedResultAvailable: true,
    state: "selected_accepted",
    resultState: "selected_accepted",
    resultStateLabel: "Engine verified",
    selectedTierOrProfile: "business",
    sourceInputFingerprint: "safe-selected-result-projection-input:sealed-chain-evidence-fixture",
    selectedResultProjectionFingerprint: "safe-selected-result-projection:sealed-chain-evidence-fixture",
    policyFingerprint,
    sourceFingerprint,
    perRunLookupNormalised: true,
    perRunLookupSummary: {
      available: true,
      rawLookupExposed: false,
    },
    safetyFlags: {
      readOnly: true,
      displayOnly: true,
      sourceAvailable: true,
      selectedResultAvailable: true,
      engineExecutionEnabled: false,
      engineVerificationEnabled: false,
      selectedResultIngestionEnabled: false,
      selectedResultPersistenceEnabled: false,
      staleResultComparisonEnabled: false,
      runTableGenerationEnabled: false,
      payloadGenerationEnabled: false,
      iesGenerationEnabled: false,
      drawingGenerationEnabled: false,
      hubSpotCrmWriteBackEnabled: false,
      boardDataMutationEnabled: false,
      rawSelectedPayloadExposed: false,
      rawEngineDebugPayloadExposed: false,
      rawBoardDataRowsExposed: false,
      rawUsersExposed: false,
      credentialsExposed: false,
      privatePathsExposed: false,
      rawLabEvidenceExposed: false,
      rawIesExposed: false,
      rawArtefactsExposed: false,
      rawPdfsExposed: false,
    },
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
    engineExecutionAttempted: false,
    runTableGenerationAttempted: false,
    selectedResultPersistenceAttempted: false,
    staleResultComparisonAttempted: false,
  };
}

function safeSelectedResultSourceObjectSummary({ policyFingerprint, sourceFingerprint }) {
  return {
    ok: true,
    schemaId: "controlstack.engine_runtable.safe_selected_result_source_object.v1",
    schemaVersion: 1,
    sourceKind: "synthetic_sealed_chain_safe_summary",
    readOnly: true,
    nonPersistent: true,
    diagnosticOnly: true,
    accepted: true,
    engineVerified: true,
    policyFingerprint,
    sourceFingerprint,
    safeSelectedResultSourceObjectFingerprint: "safe-selected-result-source-object:sealed-chain-evidence-fixture",
    sourceInputFingerprint: "safe-selected-result-source-input:sealed-chain-evidence-fixture",
    resultStateLabel: "Engine verified",
    runCount: 1,
    runs: [
      {
        runKey: "safe-engine-run-1",
        runIndex: 0,
        accepted: true,
        engineVerified: true,
        safeSummaryOnly: true,
        hasBodyRequested: false,
        boardCount: 3,
        segmentCount: 2,
        zoneCount: 2,
        clipPointsCount: 0,
        suspensionPointsCount: 0,
        gearTrayPlanCount: 0,
        reservedRangesCount: 0,
        rawRunReturned: false,
      },
    ],
    persistenceStatus: {
      selectedResultPersisted: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersistenceAttempted: false,
      nonPersistent: true,
    },
    downstreamReadinessFlags: {
      selectedResultSourceObjectAvailable: true,
      selectedResultProjectionReady: false,
      iesHandoffReady: false,
      iesHandoffBlocked: true,
    },
    redactionFlags: {
      rawEnginePayloadExposed: false,
      rawRoughElectricalPayloadExposed: false,
      rawEngineDebugExposed: false,
      rawEngineResultExposed: false,
      rawRunTableRowsExposed: false,
      rawSelectedPayloadExposed: false,
      rawSourceDbRowsExposed: false,
      rawBoardDataRowsExposed: false,
      rawUsersExposed: false,
      rawCandelaExposed: false,
      rawIesExposed: false,
      rawPdfsExposed: false,
      base64ArtefactsExposed: false,
      privatePathsExposed: false,
    },
    safetyFlags: {
      readOnly: true,
      nonPersistent: true,
      diagnosticOnly: true,
      sourceObjectOnly: true,
      failClosed: true,
      engineExecutionEnabled: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersistenceAttempted: false,
      runTableGenerationEnabled: false,
      payloadGenerationEnabled: false,
      iesGenerationEnabled: false,
      iesHandoffEnabled: false,
      hubSpotCrmWriteBackEnabled: false,
      boardDataMutationEnabled: false,
      runtimeDataMutationEnabled: false,
      donorMutationEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    blockers: [],
  };
}

function curveLookupSummary({ policyFingerprint, sourceFingerprint }) {
  return {
    ok: true,
    diagnosticOnly: true,
    readOnly: true,
    summaryOnly: true,
    safeSummaryOnly: true,
    curveLookupReady: true,
    curveLookupFingerprint: "safe-curve-lookup:sealed-chain-evidence-fixture",
    policyFingerprint,
    sourceFingerprint,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
  };
}

function curveParseInterpolationSummary({ policyFingerprint, sourceFingerprint }) {
  return {
    ok: true,
    diagnosticOnly: true,
    readOnly: true,
    summaryOnly: true,
    safeSummaryOnly: true,
    curveParseInterpolationReady: true,
    curveParseInterpolationFingerprint: "safe-curve-parse-interpolation:sealed-chain-evidence-fixture",
    policyFingerprint,
    sourceFingerprint,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
  };
}

function assertReady(summary, readyKey, label) {
  assert.equal(summary.ok, true, `${label} ok`);
  assert.equal(summary[readyKey], true, `${label} ready`);
}

function assertNoUnsafeFlags(summary, label) {
  for (const key of [...REQUIRED_FALSE_FLAGS, ...EXTRA_FALSE_FLAGS]) {
    if (Object.hasOwn(summary, key)) assert.equal(summary[key], false, `${label}.${key}`);
    if (summary.safetyFlags && Object.hasOwn(summary.safetyFlags, key)) {
      assert.equal(summary.safetyFlags[key], false, `${label}.safetyFlags.${key}`);
    }
  }
}

function collectSafetyFlags(stages) {
  const flags = Object.fromEntries(REQUIRED_FALSE_FLAGS.map((key) => [key, false]));
  for (const [label, summary] of Object.entries(stages)) {
    assertNoUnsafeFlags(summary, label);
    for (const key of REQUIRED_FALSE_FLAGS) {
      if (summary?.[key] === true || summary?.safetyFlags?.[key] === true) flags[key] = true;
    }
  }
  return flags;
}

function hasUnsafeRawKey(value, unsafeKeys, depth = 0) {
  if (depth > 12 || value === null || value === undefined) return false;
  if (typeof value === "string") return value.includes("IESNA:") || value.includes("candelaGrid");
  if (Array.isArray(value)) return value.some((entry) => hasUnsafeRawKey(entry, unsafeKeys, depth + 1));
  if (typeof value !== "object") return false;
  return Object.entries(value).some(([key, nested]) => unsafeKeys.has(key) || hasUnsafeRawKey(nested, unsafeKeys, depth + 1));
}

function buildCurrentEnvelopeForHydrate(envelope) {
  return {
    ...clone(envelope),
    staleState: "safe_comparison_not_required",
    failClosedDiagnostics: [],
  };
}

function composeSealedChainEvidenceFixture() {
  const boardFillSummary = buildCanonicalBoardFillSummary();
  assert.equal(boardFillSummary.ok, true);
  const fingerprints = {
    policyFingerprint: boardFillSummary.policyFingerprint,
    sourceFingerprint: boardFillSummary.sourceFingerprint,
  };

  const runIntakePreviewSummary = buildSelectorRunIntakePreview(selectorRuns());
  const runAccessoryPlacementIntentPreviewSummary = buildSelectorRunAccessoryPlacementPreview({
    runs: selectorRuns(),
    intents: selectorAccessoryIntents(),
  });
  const specialPartsEntitlementPreviewSummary = buildSpecialPartsPreview();

  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(accessoryReservationInput(fingerprints));
  const boardFillInputSummary = buildRuntimeBoardFillInputSummary({
    accessoryReservationSummary,
    policyFingerprint: fingerprints.policyFingerprint,
    sourceFingerprint: fingerprints.sourceFingerprint,
    selectedTierOrProfile: "Business",
    boardFamilyToken: "safe-linear-family",
  });

  const boardElectricalSummary = buildRuntimeBoardElectricalSummary({
    boardFillSummary,
    sourceBackedBoardElectricalSummary: {
      selectedBoardFamily: "Runtime Safe Linear Board Family",
      selectedCurrentMa: 350,
      vfAtCurrentV: 22.4,
      wattAtCurrentW: 11.2,
      rawRowsReturned: false,
      rawBoardRowsReturned: false,
      rawDriverRowsReturned: false,
      rawCurveRowsReturned: false,
    },
    selectedCurrentMa: 350,
  });

  const driverSizerSummary = buildRuntimeDriverSizerKernelSummary({
    boardFillSummary,
    boardElectricalSummary,
    selectedCurrentMa: 350,
    safeDriverCandidateSummaries: [safeDriverCandidate()],
    driverUtilLookupMetadata: {
      ...driverUtilLookupMetadata(),
      manifest: {
        valid: true,
        fileCount: 1,
        rawDriverUtilPayloadsIncluded: false,
        raw_payload_returned: false,
        raw_curve_points_returned: false,
      },
    },
    policySummary: {
      summaryType: "runtime-policy-safe-driver-utilisation-summary",
      driverUtilTargetBand: "near-target",
      rawRowsReturned: false,
    },
    policyFingerprint: fingerprints.policyFingerprint,
    sourceFingerprint: fingerprints.sourceFingerprint,
    requireDali: true,
  });

  const segmentZoneBridgeSummary = buildRuntimeSealedSegmentZoneBridgeSummary({
    ...fingerprints,
    boardFillInputSummary,
    accessoryReservationSummary,
    boardFillSummary,
    boardElectricalSummary,
    driverSizerSummary,
    sealedPhysicalBoardPlacementSummary: sealedPhysicalBoardPlacementSummary(fingerprints),
    sealedReservedRangeSummary: sealedReservedRangeSummary(fingerprints),
    sealedSegmentPolicySummary: sealedSegmentPolicySummary(fingerprints),
  });

  const zoneValidationFootholdSummary = buildRuntimeZoneValidationFootholdSummary({
    ...fingerprints,
    segmentZoneBridgeSummary,
    driverSizerSummary,
    boardElectricalSummary,
    boardFillSummary,
    boardFillInputSummary,
    accessoryReservationSummary,
  });

  const emergencyZonePickerFootholdSummary = buildRuntimeEmergencyZonePickerFootholdSummary({
    ...fingerprints,
    zoneValidationFootholdSummary,
    segmentZoneBridgeSummary,
    driverSizerSummary,
    accessoryReservationSummary,
    emergencyIntentSummary: emergencyIntentSummary(fingerprints),
  });

  const gateDInput = {
    ...fingerprints,
    accessoryReservationSummary,
    boardFillInputSummary,
    boardFillSummary,
    boardElectricalSummary,
    driverSizerSummary,
    segmentZoneBridgeSummary,
    zoneValidationFootholdSummary,
    emergencyZonePickerFootholdSummary,
  };
  const gateDValidationScaffoldSummary = buildRuntimeGateDValidationScaffoldSummary(gateDInput);

  const sealedCandidateAssemblyInput = {
    ...fingerprints,
    selectorSelectionSummary: selectorSelectionSummary(),
    selectorRunIntakePreviewSummary: runIntakePreviewSummary,
    selectorRunAccessoryPlacementPreviewSummary: runAccessoryPlacementIntentPreviewSummary,
    selectorSpecialPartsEntitlementPreviewSummary: specialPartsEntitlementPreviewSummary,
    timelineGateSummary: timelineGateSummary(),
    finishCascadeSummary: finishCascadeSummary(),
    mountCompatibilitySummary: mountCompatibilitySummary(),
    accessoryReservationSummary,
    boardFillInputSummary,
    boardFillSummary,
    boardElectricalSummary,
    driverSizerSummary,
    segmentZoneBridgeSummary,
    zoneValidationFootholdSummary,
    emergencyZonePickerFootholdSummary,
    gateDValidationScaffoldSummary,
  };
  const sealedCandidateAssemblyPreviewSummary = buildRuntimeSealedCandidateAssemblyPreviewSummary(sealedCandidateAssemblyInput);

  const runTableDomainInput = {
    ...fingerprints,
    sealedCandidateAssemblyPreviewSummary,
    gateDValidationScaffoldSummary,
    emergencyZonePickerFootholdSummary,
    zoneValidationFootholdSummary,
    segmentZoneBridgeSummary,
    driverSizerSummary,
    boardElectricalSummary,
    boardFillSummary,
    accessoryReservationSummary,
  };
  const runTableDomainOutputScaffoldSummary = buildRuntimeRunTableDomainOutputScaffoldSummary(runTableDomainInput);

  const controlledDonorEngineVerifyBridgeSummary = buildRuntimeControlledDonorEngineVerifyBridgeSummary({
    ...fingerprints,
    sealedCandidateAssemblyPreviewSummary,
    runTableDomainOutputScaffoldSummary,
  });

  const selectedResultProjection = selectedResultProjectionSummary(fingerprints);
  const safeSelectedResultSourceObject = safeSelectedResultSourceObjectSummary(fingerprints);
  const selectedResultHandoffInput = {
    ...fingerprints,
    sealedCandidateAssemblyPreviewSummary,
    runTableDomainOutputScaffoldSummary,
    gateDValidationScaffoldSummary,
    selectedResultProjectionSummary: selectedResultProjection,
    safeSelectedResultSourceObjectSummary: safeSelectedResultSourceObject,
  };
  const selectedResultHandoffScaffoldSummary = buildRuntimeSelectedResultHandoffScaffoldSummary(selectedResultHandoffInput);

  const draftEnvelopeInput = {
    ...fingerprints,
    safeSelectedValuesSummary: selectedValuesSummary(),
    selectorReferenceOptionsSummary: selectorReferenceOptionsSummary(),
    finishCascadeSummary: finishCascadeSummary(),
    timelineStatusSummary: timelineGateSummary(),
    runIntakePreviewSummary,
    runAccessoryPlacementIntentPreviewSummary,
    specialPartsEntitlementPreviewSummary,
    sealedCandidateAssemblyPreviewSummary: safeSealedCandidateAssemblyEnvelopeSummary(sealedCandidateAssemblyPreviewSummary),
    selectedResultProjectionSummary: selectedResultProjection,
    projectIntentContext: {
      projectIntentRef: "safe-project-intent-001",
      projectLabel: "Boardroom linear package",
      clientLabel: "Redacted client",
      siteLabel: "Redacted site",
      status: "draft-intent",
    },
    safeWorkspaceContext: {
      displayRole: "internal_user",
      identityState: "matched_redacted",
      safeProjectRef: "safe-project-intent-001",
    },
  };
  const safeDraftProjectEnvelopePreviewSummary = buildSelectorSafeDraftProjectEnvelopePreview(draftEnvelopeInput);

  const staleHydrateValidationSummary = buildSelectorSafeHydrateValidationPreview({
    safeDraftProjectEnvelopePreviewSummary,
    expectedPolicyFingerprint: fingerprints.policyFingerprint,
    expectedSourceFingerprint: fingerprints.sourceFingerprint,
    currentReferenceOptionsFingerprint: CURRENT_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: CURRENT_SELECTOR_STATE_FINGERPRINT,
  });
  const currentSafeDraftProjectEnvelopePreviewSummary = buildCurrentEnvelopeForHydrate(safeDraftProjectEnvelopePreviewSummary);
  const hydrateValidationSummary = buildSelectorSafeHydrateValidationPreview({
    safeDraftProjectEnvelopePreviewSummary: currentSafeDraftProjectEnvelopePreviewSummary,
    expectedPolicyFingerprint: fingerprints.policyFingerprint,
    expectedSourceFingerprint: fingerprints.sourceFingerprint,
    currentReferenceOptionsFingerprint: CURRENT_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: CURRENT_SELECTOR_STATE_FINGERPRINT,
  });

  const iesInput = {
    ...fingerprints,
    selectedResultHandoffScaffoldSummary,
    runTableDomainOutputScaffoldSummary,
    sealedCandidateAssemblyPreviewSummary,
    gateDValidationScaffoldSummary,
    selectedResultProjectionSummary: selectedResultProjection,
    safeDraftProjectEnvelopePreviewSummary: currentSafeDraftProjectEnvelopePreviewSummary,
    curveLookupSummary: curveLookupSummary(fingerprints),
    curveParseInterpolationSummary: curveParseInterpolationSummary(fingerprints),
  };
  const iesHandoffReadinessScaffoldSummary = buildRuntimeIesHandoffReadinessScaffoldSummary(iesInput);

  const stages = {
    runIntakePreviewSummary,
    runAccessoryPlacementIntentPreviewSummary,
    specialPartsEntitlementPreviewSummary,
    accessoryReservationSummary,
    boardFillInputSummary,
    boardFillSummary,
    boardElectricalSummary,
    driverSizerSummary,
    segmentZoneBridgeSummary,
    zoneValidationFootholdSummary,
    emergencyZonePickerFootholdSummary,
    gateDValidationScaffoldSummary,
    sealedCandidateAssemblyPreviewSummary,
    runTableDomainOutputScaffoldSummary,
    controlledDonorEngineVerifyBridgeSummary,
    selectedResultHandoffScaffoldSummary,
    safeDraftProjectEnvelopePreviewSummary,
    staleHydrateValidationSummary,
    hydrateValidationSummary,
    iesHandoffReadinessScaffoldSummary,
  };

  return {
    ...fingerprints,
    stages,
    inputs: {
      gateDInput,
      sealedCandidateAssemblyInput,
      runTableDomainInput,
      selectedResultHandoffInput,
      draftEnvelopeInput,
      iesInput,
    },
    stageFingerprints: {
      accessoryReservation: accessoryReservationSummary.accessoryReservationFingerprint,
      boardFillInput: boardFillInputSummary.boardFillInputFingerprint,
      boardFill: boardFillSummary.sourceFingerprint,
      boardElectrical: boardElectricalSummary.summaryFingerprint,
      driverSizer: driverSizerSummary.driverSizerFingerprint,
      segmentZoneBridge: segmentZoneBridgeSummary.segmentZoneBridgeFingerprint,
      zoneValidation: zoneValidationFootholdSummary.zoneValidationFootholdFingerprint,
      emergencyZonePicker: emergencyZonePickerFootholdSummary.emergencyZonePickerFingerprint,
      gateD: gateDValidationScaffoldSummary.gateDValidationScaffoldFingerprint,
      sealedCandidateAssembly: sealedCandidateAssemblyPreviewSummary.sealedCandidateAssemblyPreviewFingerprint,
      runTableDomain: runTableDomainOutputScaffoldSummary.runTableDomainOutputScaffoldFingerprint,
      controlledDonorEngineVerifyBridge: controlledDonorEngineVerifyBridgeSummary.bridgeFingerprint,
      selectedResultHandoff: selectedResultHandoffScaffoldSummary.selectedResultHandoffScaffoldFingerprint,
      draftProjectEnvelope: safeDraftProjectEnvelopePreviewSummary.envelopeFingerprint,
      hydrateValidation: hydrateValidationSummary.hydrateValidationPreviewFingerprint,
      iesHandoffReadiness: iesHandoffReadinessScaffoldSummary.iesHandoffReadinessScaffoldFingerprint,
    },
    safetyFlags: collectSafetyFlags(stages),
  };
}

test("synthetic sealed-chain evidence fixture composes actual helper outputs end-to-end", () => {
  const evidence = composeSealedChainEvidenceFixture();
  const { stages } = evidence;

  assert.match(evidence.policyFingerprint, /^safe-policy:/);
  assert.match(evidence.sourceFingerprint, /^safe-board-fill:/);
  assert.notEqual(evidence.sourceFingerprint, SEED_SOURCE_FINGERPRINT);

  assert.equal(stages.runIntakePreviewSummary.runIntakePreviewReady, true);
  assert.equal(stages.runAccessoryPlacementIntentPreviewSummary.runAccessoryPlacementPreviewReady, true);
  assert.equal(stages.specialPartsEntitlementPreviewSummary.specialPartsEntitlementPreviewReady, true);
  assertReady(stages.accessoryReservationSummary, "accessoryReservationReady", "accessory reservation");
  assertReady(stages.boardFillInputSummary, "ok", "board-fill input");
  assert.equal(stages.boardFillInputSummary.effectiveBoardFillLengthMm, 4200);
  assert.equal(stages.boardFillSummary.ok, true);
  assert.equal(stages.boardFillSummary.runLengthMm, 4200);
  assertReady(stages.boardElectricalSummary, "electricalSummaryReady", "board electrical");
  assertReady(stages.driverSizerSummary, "driverSizerReady", "driver sizer");
  assertReady(stages.segmentZoneBridgeSummary, "segmentZoneBridgeReady", "sealed segment-zone bridge");
  assertReady(stages.zoneValidationFootholdSummary, "zoneValidationFootholdReady", "zone validation foothold");
  assertReady(stages.emergencyZonePickerFootholdSummary, "emergencyZonePickerReady", "emergency zone picker foothold");
  assertReady(stages.gateDValidationScaffoldSummary, "gateDScaffoldReady", "Gate D scaffold");
  assertReady(stages.sealedCandidateAssemblyPreviewSummary, "sealedCandidateAssemblyPreviewReady", "sealed candidate assembly");
  assertReady(stages.runTableDomainOutputScaffoldSummary, "runTableDomainOutputScaffoldReady", "RunTable domain output");
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.ok, false);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.bridgeReady, false);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.blocker, "donor-engine-invocation-not-approved");
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.privateBridgeOnly, true);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.diagnosticOnly, true);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.safeSummaryOnly, true);
  assert.match(stages.controlledDonorEngineVerifyBridgeSummary.bridgeFingerprint, /^safe-controlled-donor-engine-verify-bridge:/);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.safetyFlags.donorEngineInvoked, false);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.safetyFlags.realDonorPayloadAssembled, false);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.safetyFlags.selectedResultPersisted, false);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.safetyFlags.runTableGenerated, false);
  assert.equal(stages.controlledDonorEngineVerifyBridgeSummary.safetyFlags.iesGenerated, false);
  assertReady(stages.selectedResultHandoffScaffoldSummary, "selectedResultHandoffScaffoldReady", "selected-result handoff");
  assertReady(stages.safeDraftProjectEnvelopePreviewSummary, "safeDraftProjectEnvelopePreviewReady", "safe draft project envelope");
  assert.equal(stages.staleHydrateValidationSummary.ok, false);
  assert.equal(stages.staleHydrateValidationSummary.hydrateValidationPreviewReady, false);
  assert.equal(stages.staleHydrateValidationSummary.staleState.failClosed, true);
  assertReady(stages.hydrateValidationSummary, "hydrateValidationPreviewReady", "safe hydrate validation");
  assertReady(stages.iesHandoffReadinessScaffoldSummary, "iesHandoffReadinessScaffoldReady", "IES handoff readiness");
  assert.equal(stages.iesHandoffReadinessScaffoldSummary.iesReadinessSummary.readyForFutureIesHandoff, true);
  assert.equal(stages.iesHandoffReadinessScaffoldSummary.iesReadinessSummary.iesGenerationReady, false);
  assert.equal(stages.iesHandoffReadinessScaffoldSummary.blockedGenerationSummary.iesGenerationBlocked, true);

  for (const [key, value] of Object.entries(evidence.safetyFlags)) {
    assert.equal(value, false, key);
  }
});

test("sealed-chain evidence fixture fingerprints are deterministic and flow through downstream summaries", () => {
  const first = composeSealedChainEvidenceFixture();
  const second = composeSealedChainEvidenceFixture();

  assert.equal(first.policyFingerprint, second.policyFingerprint);
  assert.equal(first.sourceFingerprint, second.sourceFingerprint);
  assert.deepEqual(first.stageFingerprints, second.stageFingerprints);
  assert.equal(
    first.stageFingerprints.iesHandoffReadiness,
    first.stages.iesHandoffReadinessScaffoldSummary.iesHandoffReadinessScaffoldFingerprint,
  );

  for (const [label, fingerprint] of Object.entries(first.stageFingerprints)) {
    assert.match(fingerprint, /^safe[-:]/, label);
  }

  assert.equal(first.stages.gateDValidationScaffoldSummary.policyFingerprint, first.policyFingerprint);
  assert.equal(first.stages.gateDValidationScaffoldSummary.sourceFingerprint, first.sourceFingerprint);
  assert.equal(first.stages.runTableDomainOutputScaffoldSummary.policyFingerprint, first.policyFingerprint);
  assert.equal(first.stages.selectedResultHandoffScaffoldSummary.sourceFingerprint, first.sourceFingerprint);
  assert.equal(first.stages.iesHandoffReadinessScaffoldSummary.policyFingerprint, first.policyFingerprint);
});

test("sealed-chain evidence fixture does not expose raw payloads or real source rows", () => {
  const evidence = composeSealedChainEvidenceFixture();
  const unsafeKeys = new Set([
    "PRODUCTS",
    "BOARDS",
    "DRIVERS",
    "ACCESSORIES",
    "USERS",
    "enginePayload",
    "selectorPayload",
    "rawEnginePayload",
    "rawSelectorPayload",
    "rawProductRows",
    "rawBoardRows",
    "rawDriverRows",
    "rawAccessoryRows",
    "generatedIes",
    "iesText",
    "candelaGrid",
  ]);

  assert.equal(hasUnsafeRawKey(evidence.stages, unsafeKeys), false);
  for (const [key, value] of Object.entries(evidence.safetyFlags)) {
    assert.equal(value, false, key);
  }
});

test("sealed-chain evidence fixture fails closed on fingerprint mismatch", () => {
  const evidence = composeSealedChainEvidenceFixture();
  const result = buildRuntimeGateDValidationScaffoldSummary({
    ...evidence.inputs.gateDInput,
    driverSizerSummary: {
      ...evidence.stages.driverSizerSummary,
      sourceFingerprint: "safe-source:sealed-chain-mismatch",
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "fingerprint-mismatch");
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});

test("sealed-chain evidence fixture fails closed on unsafe mid-chain raw payload flag", () => {
  const evidence = composeSealedChainEvidenceFixture();
  const result = buildRuntimeGateDValidationScaffoldSummary({
    ...evidence.inputs.gateDInput,
    boardElectricalSummary: {
      ...evidence.stages.boardElectricalSummary,
      rawEnginePayloadReturned: true,
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "raw-payload-flag-detected");
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.donorEngineInvoked, false);
});

test("sealed-chain evidence fixture fails closed on selected-result persistence before handoff", () => {
  const evidence = composeSealedChainEvidenceFixture();
  const result = buildRuntimeSelectedResultHandoffScaffoldSummary({
    ...evidence.inputs.selectedResultHandoffInput,
    selectedResultPersisted: true,
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "selected-result-persistence-not-approved");
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.iesGenerated, false);
});

test("sealed-chain evidence fixture fails closed on IES generation before IES handoff", () => {
  const evidence = composeSealedChainEvidenceFixture();
  const result = buildRuntimeIesHandoffReadinessScaffoldSummary({
    ...evidence.inputs.iesInput,
    iesGenerated: true,
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "ies-generation-not-approved");
  assert.equal(result.iesGenerated, false);
  assert.equal(result.rawIesContentReturned, false);
});

test("safe hydrate validation remains fail-closed for stale comparison unless explicitly represented as current", () => {
  const evidence = composeSealedChainEvidenceFixture();
  const stale = buildSelectorSafeHydrateValidationPreview({
    safeDraftProjectEnvelopePreviewSummary: evidence.stages.safeDraftProjectEnvelopePreviewSummary,
    expectedPolicyFingerprint: evidence.policyFingerprint,
    expectedSourceFingerprint: evidence.sourceFingerprint,
    currentReferenceOptionsFingerprint: CURRENT_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: CURRENT_SELECTOR_STATE_FINGERPRINT,
  });
  const current = buildSelectorSafeHydrateValidationPreview({
    safeDraftProjectEnvelopePreviewSummary: buildCurrentEnvelopeForHydrate(evidence.stages.safeDraftProjectEnvelopePreviewSummary),
    expectedPolicyFingerprint: evidence.policyFingerprint,
    expectedSourceFingerprint: evidence.sourceFingerprint,
    currentReferenceOptionsFingerprint: CURRENT_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: CURRENT_SELECTOR_STATE_FINGERPRINT,
  });

  assert.equal(stale.ok, false);
  assert.equal(stale.hydrateValidationPreviewReady, false);
  assert.equal(stale.staleState.failClosed, true);
  assert.equal(current.ok, true);
  assert.equal(current.hydrateValidationPreviewReady, true);
  assert.equal(current.staleState.failClosed, false);
});