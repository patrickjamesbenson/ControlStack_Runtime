import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";
import { loadRuntimeDataReadOnlySource } from "./runtimeDataReadOnlySourceAccessService.js";
import { buildRuntimeSafeBoardFamilyProjectionSummary } from "./runtimeSafeBoardFamilyProjection.js";
import { buildRuntimeSafeDriverCandidateProjectionSummary } from "./runtimeSafeDriverCandidateProjection.js";
import { buildRuntimeSafePhysicalPlacementSummary } from "./runtimeSafePhysicalPlacementSummary.js";

import { buildSelectorRunIntakePreview } from "../modules/cs-selector/selectorRunIntakePreview.js";
import { buildSelectorRunAccessoryPlacementPreview } from "../modules/cs-selector/selectorRunAccessoryPlacementPreview.js";
import { buildSelectorSpecialPartsEntitlementPreview } from "../modules/cs-selector/selectorSpecialPartsEntitlementPreview.js";
import { buildSelectorSafeDraftProjectEnvelopePreview } from "../modules/cs-selector/selectorSafeDraftProjectEnvelopePreview.js";
import { buildSelectorSafeHydrateValidationPreview } from "../modules/cs-selector/selectorSafeHydrateValidationPreview.js";

import { buildRuntimeAccessoryReservationFootholdSummary } from "./engineRunTableRuntimeAccessoryReservationFootholdKernel.js";
import { buildRuntimeBoardFillInputSummary } from "./engineRunTableRuntimeBoardFillInputAdapter.js";
import { buildRuntimeBoardFillKernelSummary } from "./engineRunTableRuntimeBoardFillKernel.js";
import { buildRuntimeBoardElectricalSummary } from "./engineRunTableRuntimeBoardElectricalSummary.js";
import { buildRuntimeDriverSizerKernelSummary } from "./engineRunTableRuntimeDriverSizerKernel.js";
import { buildRuntimeSealedSegmentZoneBridgeSummary } from "./engineRunTableRuntimeSealedSegmentZoneBridge.js";
import { buildRuntimeZoneValidationFootholdSummary } from "./engineRunTableRuntimeZoneValidationFootholdKernel.js";
import { buildRuntimeEmergencyZonePickerFootholdSummary } from "./engineRunTableRuntimeEmergencyZonePickerFoothold.js";
import { buildRuntimeGateDValidationScaffoldSummary } from "./engineRunTableRuntimeGateDValidationScaffold.js";
import { buildRuntimeSealedCandidateAssemblyPreviewSummary } from "./engineRunTableSealedCandidateAssemblyPreview.js";
import { buildRuntimeRunTableDomainOutputScaffoldSummary } from "./engineRunTableRuntimeRunTableDomainOutputScaffold.js";
import { buildRuntimeSelectedResultHandoffScaffoldSummary } from "./engineRunTableSelectedResultHandoffScaffold.js";
import { buildRuntimeIesHandoffReadinessScaffoldSummary } from "./engineRunTableIesHandoffReadinessScaffold.js";

export const CONTROLLED_REAL_SOURCE_SEALED_EVIDENCE_PROBE_SCHEMA_ID =
  "controlstack.engine-runtable.controlled-real-source-sealed-evidence-probe";
export const CONTROLLED_REAL_SOURCE_SEALED_EVIDENCE_PROBE_SCHEMA_VERSION = 1;
export const CONTROLLED_REAL_SOURCE_SEALED_EVIDENCE_PROBE_STATE =
  "controlled_real_source_sealed_evidence_probe_diagnostic_only";

const CURRENT_REFERENCE_OPTIONS_FINGERPRINT = "safe-reference-options:controlled-real-source-sealed-evidence";
const CURRENT_SELECTOR_STATE_FINGERPRINT = "safe-selector-state:controlled-real-source-sealed-evidence";

const CRITICAL_REAL_SOURCE_TABLES = Object.freeze([
  "SYSTEM",
  "OPTICS",
  "ACCESSORIES",
  "BOARDS",
  "DRIVERS",
  "SYSTEM_POLICY",
]);

const FALSE_SAFETY_FLAGS = Object.freeze([
  "rawProductRowsReturned",
  "rawBoardRowsReturned",
  "rawDriverRowsReturned",
  "rawAccessoryRowsReturned",
  "rawRuntimeDataRowsReturned",
  "rawSelectorPayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "rawUsersReturned",
  "rawCrmReturned",
  "rawContactsReturned",
  "privatePathsReturned",
  "credentialsReturned",
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

const UNSAFE_KEY_PATTERN = /^(?:snapshot|db|rows|rawRows|raw_rows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|USERS|CRM|CONTACTS|selectorPayload|rawSelectorPayload|enginePayload|rawEnginePayload|engineResult|rawEngineResult|iesText|rawIesText|candela|candelaGrid|base64|privatePath|localPath|sourcePath|credentials)$/i;

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rowsFor(snapshot, tableName) {
  const rows = snapshot?.[tableName];
  return Array.isArray(rows) ? rows : [];
}

function tableRowCountFromAccess(sourceAccessSummary, tableName) {
  const tableSummary = Array.isArray(sourceAccessSummary?.tableSummary) ? sourceAccessSummary.tableSummary : [];
  const match = tableSummary.find((entry) => entry?.table === tableName);
  if (Number.isFinite(Number(match?.rowCount))) return Number(match.rowCount);
  return rowsFor(sourceAccessSummary?.snapshot, tableName).length;
}

function tablePresentFromAccess(sourceAccessSummary, tableName) {
  const tableSummary = Array.isArray(sourceAccessSummary?.tableSummary) ? sourceAccessSummary.tableSummary : [];
  const match = tableSummary.find((entry) => entry?.table === tableName);
  if (match) return match.present === true;
  return Array.isArray(sourceAccessSummary?.snapshot?.[tableName]);
}

function safeCountBand(count) {
  const value = Number(count);
  if (!Number.isFinite(value) || value < 0) return "unknown";
  if (value === 0) return "0";
  if (value === 1) return "1";
  if (value <= 5) return "2-5";
  if (value <= 25) return "6-25";
  if (value <= 100) return "26-100";
  return "100-plus";
}

function safeSourceFingerprintFrom(sourceAccessSummary) {
  const raw = String(sourceAccessSummary?.source?.sourceFingerprint || "").trim();
  if (!/^[0-9a-f]{16,128}$/i.test(raw)) return "";
  return `safe-source:runtime-active-${raw.slice(0, 32)}`;
}

function safePolicyFingerprintFrom(sourceFingerprint, sourceAccessSummary) {
  const tableCounts = CRITICAL_REAL_SOURCE_TABLES.map((table) => [
    table,
    tablePresentFromAccess(sourceAccessSummary, table),
    tableRowCountFromAccess(sourceAccessSummary, table),
  ]);
  return `safe-policy:${stableSha1({ sourceFingerprint, tableCounts, probe: CONTROLLED_REAL_SOURCE_SEALED_EVIDENCE_PROBE_SCHEMA_ID })}`;
}

function falseSafetyFlags() {
  return Object.fromEntries(FALSE_SAFETY_FLAGS.map((key) => [key, false]));
}

function blocker(code, reason, severity = "blocking") {
  return { code, severity, reason };
}

function hasUnsafeRawKey(value, depth = 0) {
  if (depth > 12 || value === null || value === undefined) return false;
  if (typeof value === "string") {
    return value.includes("IESNA:")
      || value.includes("candelaGrid")
      || /[A-Za-z]:\\/.test(value)
      || /password|credential|secret/i.test(value);
  }
  if (Array.isArray(value)) return value.some((entry) => hasUnsafeRawKey(entry, depth + 1));
  if (typeof value !== "object") return false;
  return Object.entries(value).some(([key, nested]) => UNSAFE_KEY_PATTERN.test(key) || hasUnsafeRawKey(nested, depth + 1));
}

function baseProbe(extra = {}) {
  const ok = extra.ok === true;
  return {
    schemaId: CONTROLLED_REAL_SOURCE_SEALED_EVIDENCE_PROBE_SCHEMA_ID,
    schemaVersion: CONTROLLED_REAL_SOURCE_SEALED_EVIDENCE_PROBE_SCHEMA_VERSION,
    state: CONTROLLED_REAL_SOURCE_SEALED_EVIDENCE_PROBE_STATE,
    readOnly: true,
    diagnosticOnly: true,
    controlledEvidenceOnly: true,
    ok,
    blocker: extra.blocker || null,
    realSourceSealedEvidenceReady: extra.realSourceSealedEvidenceReady === true,
    safeCandidateSourceSummary: extra.safeCandidateSourceSummary || null,
    safeSelectorTokenSummary: extra.safeSelectorTokenSummary || null,
    safeRunIntentSummary: extra.safeRunIntentSummary || null,
    safeBoardFamilySummary: extra.safeBoardFamilySummary || null,
    boardFamilyProjectionSummary: extra.boardFamilyProjectionSummary || null,
    driverCandidateProjectionSummary: extra.driverCandidateProjectionSummary || null,
    safeAccessoryPolicySummary: extra.safeAccessoryPolicySummary || null,
    safeDriverCandidateProjectionSummary: extra.safeDriverCandidateProjectionSummary || null,
    safePhysicalPlacementRequirementSummary: extra.safePhysicalPlacementRequirementSummary || null,
    safePhysicalPlacementSummary: extra.safePhysicalPlacementSummary || null,
    physicalPlacementSummaryReady: extra.physicalPlacementSummaryReady === true,
    safeCurveReferenceSummary: extra.safeCurveReferenceSummary || null,
    sealedChainReadinessSummary: extra.sealedChainReadinessSummary || null,
    stageReadinessSummary: Array.isArray(extra.stageReadinessSummary) ? extra.stageReadinessSummary : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    evidenceFingerprint: extra.evidenceFingerprint || null,
    warnings: Array.isArray(extra.warnings) ? extra.warnings : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [],
    ...falseSafetyFlags(),
    safetyFlags: {
      readOnly: true,
      diagnosticOnly: true,
      controlledEvidenceOnly: true,
      runtimeDataReadOnly: true,
      donorEngineInvocationEnabled: false,
      runtimeDataMutationEnabled: false,
      selectedResultPersistenceEnabled: false,
      productionRunTableGenerationEnabled: false,
      iesGenerationEnabled: false,
      routeCreationEnabled: false,
      postEndpointCreationEnabled: false,
      rawRowsExposed: false,
      rawPayloadsExposed: false,
      usersCrmPrivateDataExposed: false,
    },
  };
}

function failClosed(code, reason, extra = {}) {
  const failClosedDiagnostics = [
    code,
    reason,
    ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : []),
  ];
  return baseProbe({
    ...extra,
    ok: false,
    realSourceSealedEvidenceReady: false,
    blocker: code,
    failClosedDiagnostics,
    warnings: Array.isArray(extra.warnings) ? extra.warnings : [],
  });
}

function redactedTableSummaries(sourceAccessSummary) {
  return CRITICAL_REAL_SOURCE_TABLES.map((table) => ({
    table,
    present: tablePresentFromAccess(sourceAccessSummary, table),
    rowCountBand: safeCountBand(tableRowCountFromAccess(sourceAccessSummary, table)),
    rawRowsReturned: false,
    rawHeadersReturned: false,
  }));
}

function buildSafeRealSourceProjection(sourceAccessSummary = {}) {
  if (!isRecord(sourceAccessSummary) || sourceAccessSummary.ok !== true || sourceAccessSummary.activeSourceDbLoadedReadOnly !== true) {
    return {
      ok: false,
      blocker: "missing-real-source-candidate-normalizer",
      reason: "RuntimeData active source summary is not available through the approved read-only boundary.",
    };
  }

  const sourceFingerprint = safeSourceFingerprintFrom(sourceAccessSummary);
  if (!sourceFingerprint) {
    return {
      ok: false,
      blocker: "missing-safe-source-fingerprint",
      reason: "RuntimeData active source fingerprint was unavailable or unsafe to project.",
    };
  }

  const missingTables = CRITICAL_REAL_SOURCE_TABLES.filter((table) => !tablePresentFromAccess(sourceAccessSummary, table));
  if (missingTables.includes("BOARDS")) {
    return {
      ok: false,
      blocker: "missing-safe-board-family-projection",
      reason: "The active source did not expose a safe BOARDS table presence/count summary.",
      sourceFingerprint,
    };
  }

  const boardFamilyProjectionSummary = buildRuntimeSafeBoardFamilyProjectionSummary({ sourceAccessSummary });
  if (boardFamilyProjectionSummary.ok !== true || boardFamilyProjectionSummary.boardFamilyProjectionReady !== true) {
    return {
      ok: false,
      blocker: boardFamilyProjectionSummary.blocker === "missing-board-family-source-marker"
        ? "missing-safe-board-family-projection"
        : boardFamilyProjectionSummary.blocker || "missing-safe-board-family-projection",
      reason: "The active source did not expose a ready safe BOARDS-derived board-family projection.",
      sourceFingerprint,
      boardFamilyProjectionSummary,
    };
  }

  if (missingTables.includes("DRIVERS")) {
    return {
      ok: false,
      blocker: "missing-safe-driver-candidate-projection",
      reason: "The active source did not expose a safe DRIVERS table presence/count summary.",
      sourceFingerprint,
    };
  }

  const driverCandidateProjectionSummary = buildRuntimeSafeDriverCandidateProjectionSummary({ sourceAccessSummary });
  if (driverCandidateProjectionSummary.ok !== true || driverCandidateProjectionSummary.driverCandidateProjectionReady !== true) {
    return {
      ok: false,
      blocker: "missing-safe-driver-candidate-projection",
      reason: "The active source did not expose a ready safe DRIVERS-derived driver-candidate projection.",
      sourceFingerprint,
      boardFamilyProjectionSummary,
      driverCandidateProjectionSummary,
    };
  }

  if (missingTables.includes("ACCESSORIES")) {
    return {
      ok: false,
      blocker: "missing-safe-accessory-policy-projection",
      reason: "The active source did not expose a safe ACCESSORIES table presence/count summary.",
      sourceFingerprint,
    };
  }
  if (missingTables.includes("SYSTEM_POLICY")) {
    return {
      ok: false,
      blocker: "missing-safe-selected-result-source",
      reason: "The active source did not expose a safe SYSTEM_POLICY table presence/count summary.",
      sourceFingerprint,
    };
  }

  const policyFingerprint = safePolicyFingerprintFrom(sourceFingerprint, sourceAccessSummary);
  const tableSummaries = redactedTableSummaries(sourceAccessSummary);
  const boardCount = tableRowCountFromAccess(sourceAccessSummary, "BOARDS");
  const driverCount = tableRowCountFromAccess(sourceAccessSummary, "DRIVERS");
  const accessoryCount = tableRowCountFromAccess(sourceAccessSummary, "ACCESSORIES");
  const opticCount = tableRowCountFromAccess(sourceAccessSummary, "OPTICS");
  const policyCount = tableRowCountFromAccess(sourceAccessSummary, "SYSTEM_POLICY");

  return {
    ok: true,
    sourceFingerprint,
    policyFingerprint,
    safeCandidateSourceSummary: {
      readOnly: true,
      diagnosticOnly: true,
      activeSourceDbLoadedReadOnly: true,
      sourceFingerprintAvailable: true,
      sourceFingerprint,
      tableCountBand: safeCountBand(sourceAccessSummary.topLevelArrayTableCount),
      criticalTableSummaries: tableSummaries,
      usersRedacted: true,
      rawRowsReturned: false,
      rawHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      credentialsReturned: false,
    },
    safeSelectorTokenSummary: {
      readOnly: true,
      diagnosticOnly: true,
      selectedSystemToken: "source-backed-system-token",
      selectedVariantToken: "source-backed-variant-token",
      selectedTierToken: "business",
      selectedProfileToken: "source-backed-profile-token",
      selectedOpticToken: "source-backed-optic-token",
      selectedControlTypeToken: "dali-2",
      sourceBackedTokenCountBand: safeCountBand(boardCount + opticCount),
      rawSelectorPayloadReturned: false,
      rawProductRowsReturned: false,
    },
    safeRunIntentSummary: {
      readOnly: true,
      diagnosticOnly: true,
      controlledIntentOnly: true,
      runCount: 1,
      runLengthBand: "4000-7999mm",
      lengthMode: "overall",
      lumenBasis: "active-illuminated-length",
      rawSelectorPayloadReturned: false,
      rawEnginePayloadReturned: false,
    },
    safeBoardFamilySummary: boardFamilyProjectionSummary.boardFamilySummary,
    boardFamilyProjectionSummary,
    driverCandidateProjectionSummary,
    safeAccessoryPolicySummary: {
      readOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      accessoryPolicySourceBacked: true,
      accessoryCandidateCountBand: safeCountBand(accessoryCount),
      requestedAccessoryIntent: "controlled-sensor-intent",
      reservationBand: "1000-1999mm",
      rawAccessoryRowsReturned: false,
    },
    safeDriverCandidateProjectionSummary: driverCandidateProjectionSummary.driverCandidateSummary,
    safePhysicalPlacementRequirementSummary: {
      readOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      physicalPlacementSummaryAvailable: true,
      reservedRangeSummaryAvailable: true,
      boardPlacementCountBand: "2-5",
      reservedRangeCountBand: "0",
      rawCoordinatesReturned: false,
      rawReservationGridReturned: false,
    },
    safeCurveReferenceSummary: {
      readOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      curveReferenceAvailable: opticCount > 0 || boardCount > 0,
      curveReferenceCountBand: safeCountBand(opticCount + boardCount),
      policyReferenceCountBand: safeCountBand(policyCount),
      rawIesContentReturned: false,
      rawPhotometryReturned: false,
      candelaArraysReturned: false,
      base64ArtifactsReturned: false,
    },
  };
}

function safePolicySnapshot(policyFingerprint) {
  return {
    _snapshot_id: policyFingerprint,
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

function sourceBackedBoardFamilySummary(sourceFingerprint) {
  return {
    boardFamily: "Controlled Real Source Board Family",
    boardLengthMm: 1400,
    pitchMm: 70,
    boardQuantumMm: 70,
    boardFamilyLengthsSortedDesc: [1400],
    sourceFingerprint,
    rawRowsReturned: false,
  };
}

function selectorRuns() {
  return [
    {
      id: "run-1",
      runNumber: 1,
      label: "Controlled source-backed run",
      quantity: 1,
      runLengthMm: "5600",
      lengthMode: "overall",
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
      notes: "safe controlled real-source evidence intent",
    },
  ];
}

function selectedValuesSummary() {
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    status: "complete-safe-selected-values-summary",
    selectedValues: {
      system: "source-backed-system-token",
      variant: "source-backed-variant-token",
      tier: "business",
      profile: "source-backed-profile-token",
      optic: "source-backed-optic-token",
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

function selectorReferenceOptionsSummary(projection) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    referenceOptionsReady: true,
    optionGroupCount: 4,
    redactedOptionCountBand: projection.safeCandidateSourceSummary.tableCountBand,
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
      system: "source-backed-system-token",
      variant: "source-backed-variant-token",
      tier: "business",
      profile: "source-backed-profile-token",
      optic: "source-backed-optic-token",
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

function buildSpecialPartsPreview() {
  return buildSelectorSpecialPartsEntitlementPreview({
    safeRoleContext: {
      displayRole: "internal_user",
      actualRole: "internal_user",
      roleAuthority: "safe-redacted-real-source-probe",
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
          redactedRef: "redacted:controlled-real-source-special-part-review",
          redacted: true,
          status: "review-required",
          system: "source-backed-system-token",
          variants_all: "source-backed-variant-token",
          ip_class: "redacted",
          effective_to: "2099-12-31",
          safelyEntitled: true,
        },
      ],
    },
    selectorSelectionContext: {
      selectedSystem: { system: "source-backed-system-token", variantKey: "source-backed-variant-token" },
      selectedVariant: { key: "source-backed-variant-token" },
      environment: { ipClass: "redacted" },
      timeline: { today: "2026-07-02" },
    },
    specialPartsOptInPreview: { status: "not-live-placeholder", writeEnabled: false },
  });
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

function accessoryReservationInput({ policyFingerprint, sourceFingerprint }) {
  return {
    runLengthMm: 5600,
    selectedTierOrProfile: "Business",
    productFamilyToken: "source-backed-system-token",
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
      filename: "controlled_real_source_driver_util_summary_token",
      size_bytes: 128,
      sha256: "b".repeat(64),
      source_classification: "controlled-real-source-driver-util-summary",
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
    safeModelToken: "source-backed-driver-token",
    safeModelLabel: "Source Backed Driver Token",
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

function safePhysicalPlacementProofSummary({ accessoryReservationSummary }) {
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
      boardRefs: ["safe-board-ref-controlled-001", "safe-board-ref-controlled-002", "safe-board-ref-controlled-003"],
    },
    segmentBoundaryBandSummary: {
      segmentBoundaryCountBand: "1-2",
      segmentSpanBands: ["1000-1999mm", "2000-3999mm"],
      segmentRefs: ["safe-segment-ref-controlled-001", "safe-segment-ref-controlled-002"],
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
      reservationIntentRef: "safe-accessory-reservation-intent-controlled-source",
      accessoryReservationFingerprint: accessoryReservationSummary.accessoryReservationFingerprint,
    },
    emergencyMarkerPlacementSummary: {
      emergencyMarkerCountBand: "1",
      emergencyPlacementCategoryTokens: ["marker-only"],
      emergencyZoneRefs: ["safe-zone-ref-controlled-001"],
    },
    noCrossContainmentSummary: {
      noCrossContainmentProven: true,
      zonesCrossSegmentJoin: false,
      zoneCountBand: "2-5",
      zoneRefs: ["safe-zone-ref-controlled-001", "safe-zone-ref-controlled-002"],
    },
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

function safeSelectedResultProjectionSummary({ policyFingerprint, sourceFingerprint }) {
  return {
    ok: true,
    readOnly: true,
    displayOnly: true,
    contractOnly: true,
    failClosed: true,
    sourceAvailable: true,
    selectedResultAvailable: false,
    state: "no_selected_result",
    resultState: "no_selected_result",
    resultStateLabel: "No selected result persisted",
    selectedTierOrProfile: "business",
    sourceInputFingerprint: sourceFingerprint,
    selectedResultProjectionFingerprint: `safe-selected-result-projection:${stableSha1({ policyFingerprint, sourceFingerprint, state: "no_selected_result" })}`,
    policyFingerprint,
    sourceFingerprint,
    perRunLookupNormalised: false,
    perRunLookupSummary: {
      available: false,
      rawLookupExposed: false,
    },
    safetyFlags: {
      readOnly: true,
      displayOnly: true,
      sourceAvailable: true,
      selectedResultAvailable: false,
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
    ok: false,
    schemaId: "controlstack.engine_runtable.safe_selected_result_source_object.v1",
    schemaVersion: 1,
    sourceKind: "controlled_real_source_marker_only",
    readOnly: true,
    nonPersistent: true,
    diagnosticOnly: true,
    accepted: false,
    engineVerified: false,
    selectedTierOrProfile: "business",
    resultStateLabel: "No donor Engine invocation in controlled evidence probe",
    policyFingerprint,
    sourceFingerprint,
    safeSelectedResultSourceObjectFingerprint: `safe-selected-result-source-object:${stableSha1({ policyFingerprint, sourceFingerprint, marker: "controlled-real-source-marker-only" })}`,
    sourceInputFingerprint: sourceFingerprint,
    sourceVersionMarker: `runtime-active-source-${sourceFingerprint.slice(-12)}`,
    runCount: 1,
    runs: [
      {
        runKey: "safe-engine-run-1",
        runIndex: 0,
        accepted: false,
        engineVerified: false,
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
      selectedResultSourceObjectAvailable: false,
      selectedResultProjectionReady: false,
      iesHandoffReady: false,
      iesHandoffBlocked: true,
      candidateOutputReady: false,
      labProofReady: false,
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
      credentialsExposed: false,
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
    blockers: [
      blocker("donor-engine-invocation-not-approved", "Controlled real-source sealed evidence probe does not invoke donor Engine or create a selected result body."),
    ],
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
    curveLookupFingerprint: `safe-curve-lookup:${stableSha1({ policyFingerprint, sourceFingerprint, kind: "lookup" })}`,
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
    curveParseInterpolationFingerprint: `safe-curve-parse-interpolation:${stableSha1({ policyFingerprint, sourceFingerprint, kind: "parse-interpolation" })}`,
    policyFingerprint,
    sourceFingerprint,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
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

function buildCurrentEnvelopeForHydrate(envelope) {
  return {
    ...clonePlain(envelope),
    staleState: "safe_comparison_not_required",
    failClosedDiagnostics: [],
  };
}

function summariseStage(label, summary, readyKey, extra = {}) {
  return {
    stage: label,
    reached: isRecord(summary),
    ok: summary?.ok === true || extra.ok === true,
    ready: summary?.[readyKey] === true || extra.ready === true,
    blocker: summary?.blocker || null,
    fingerprint: extra.fingerprint || null,
    rawRowsReturned: false,
    rawPayloadReturned: false,
    generated: false,
  };
}

function composeSealedChain(projection) {
  const seedBoardFillSummary = buildRuntimeBoardFillKernelSummary({
    selectedTierOrProfile: "Business",
    runLengthMm: 4200,
    supportedDiagnosticRunLengthsMm: [4200],
    sourceSnapshot: safePolicySnapshot(projection.policyFingerprint),
    sourceBackedBoardFamilySummary: sourceBackedBoardFamilySummary(projection.sourceFingerprint),
  });
  if (seedBoardFillSummary.ok !== true) return { ok: false, blocker: seedBoardFillSummary.blocker || "missing-safe-board-family-projection", seedBoardFillSummary };

  const fingerprints = {
    policyFingerprint: seedBoardFillSummary.policyFingerprint,
    sourceFingerprint: seedBoardFillSummary.sourceFingerprint,
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
    boardFamilyToken: "source-backed-system-token",
  });

  const boardFillSummary = seedBoardFillSummary;

  const boardElectricalSummary = buildRuntimeBoardElectricalSummary({
    boardFillSummary,
    sourceBackedBoardElectricalSummary: {
      selectedBoardFamily: "Controlled Real Source Board Family",
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

  const safePhysicalPlacementSummary = buildRuntimeSafePhysicalPlacementSummary({
    ...fingerprints,
    sourceBacked: true,
    chainBacked: true,
    accessoryReservationFingerprint: accessoryReservationSummary.accessoryReservationFingerprint,
    boardFillInputFingerprint: boardFillInputSummary.boardFillInputFingerprint,
    boardFillFingerprint: boardFillSummary.sourceFingerprint,
    boardElectricalSummaryFingerprint: boardElectricalSummary.summaryFingerprint,
    driverSizerFingerprint: driverSizerSummary.driverSizerFingerprint,
    safePlacementProofSummary: safePhysicalPlacementProofSummary({ accessoryReservationSummary }),
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

  const gateDValidationScaffoldSummary = buildRuntimeGateDValidationScaffoldSummary({
    ...fingerprints,
    accessoryReservationSummary,
    boardFillInputSummary,
    boardFillSummary,
    boardElectricalSummary,
    driverSizerSummary,
    segmentZoneBridgeSummary,
    zoneValidationFootholdSummary,
    emergencyZonePickerFootholdSummary,
  });

  const sealedCandidateAssemblyPreviewSummary = buildRuntimeSealedCandidateAssemblyPreviewSummary({
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
  });

  const runTableDomainOutputScaffoldSummary = buildRuntimeRunTableDomainOutputScaffoldSummary({
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
  });

  const blockedDownstreamStage = (stage) => ({
    stage,
    reached: false,
    ok: false,
    ready: false,
    blocker: "donor-engine-invocation-not-approved",
    fingerprint: null,
    rawRowsReturned: false,
    rawPayloadReturned: false,
    generated: false,
  });
  const safeStageReadinessSummary = [
    summariseStage("selector-run-intake-preview", runIntakePreviewSummary, "runIntakePreviewReady", {
      ok: runIntakePreviewSummary.runIntakePreviewReady === true,
    }),
    summariseStage("selector-accessory-placement-intent-preview", runAccessoryPlacementIntentPreviewSummary, "runAccessoryPlacementPreviewReady", {
      ok: runAccessoryPlacementIntentPreviewSummary.runAccessoryPlacementPreviewReady === true,
    }),
    summariseStage("selector-special-parts-entitlement-preview", specialPartsEntitlementPreviewSummary, "specialPartsEntitlementPreviewReady", {
      ok: specialPartsEntitlementPreviewSummary.specialPartsEntitlementPreviewReady === true,
    }),
    summariseStage("runtime-accessory-reservation", accessoryReservationSummary, "accessoryReservationReady", {
      fingerprint: accessoryReservationSummary.accessoryReservationFingerprint,
    }),
    summariseStage("runtime-board-fill-input", boardFillInputSummary, "ok", {
      fingerprint: boardFillInputSummary.boardFillInputFingerprint,
    }),
    summariseStage("runtime-board-fill", boardFillSummary, "ok", {
      fingerprint: boardFillSummary.sourceFingerprint,
    }),
    summariseStage("runtime-board-electrical", boardElectricalSummary, "electricalSummaryReady", {
      fingerprint: boardElectricalSummary.summaryFingerprint,
    }),
    summariseStage("runtime-driver-sizer", driverSizerSummary, "driverSizerReady", {
      fingerprint: driverSizerSummary.driverSizerFingerprint,
    }),
    summariseStage("runtime-safe-physical-placement-summary", safePhysicalPlacementSummary, "physicalPlacementSummaryReady", {
      fingerprint: safePhysicalPlacementSummary.placementSummaryFingerprint,
    }),
    summariseStage("runtime-sealed-segment-zone-bridge", segmentZoneBridgeSummary, "segmentZoneBridgeReady", {
      fingerprint: segmentZoneBridgeSummary.segmentZoneBridgeFingerprint,
    }),
    summariseStage("runtime-zone-validation-foothold", zoneValidationFootholdSummary, "zoneValidationFootholdReady", {
      fingerprint: zoneValidationFootholdSummary.zoneValidationFootholdFingerprint,
    }),
    summariseStage("runtime-emergency-zone-picker-marker-only", emergencyZonePickerFootholdSummary, "emergencyZonePickerReady", {
      fingerprint: emergencyZonePickerFootholdSummary.emergencyZonePickerFingerprint,
    }),
    summariseStage("runtime-gate-d-validation-scaffold", gateDValidationScaffoldSummary, "gateDScaffoldReady", {
      fingerprint: gateDValidationScaffoldSummary.gateDValidationScaffoldFingerprint,
    }),
    summariseStage("runtime-sealed-candidate-assembly-preview", sealedCandidateAssemblyPreviewSummary, "sealedCandidateAssemblyPreviewReady", {
      fingerprint: sealedCandidateAssemblyPreviewSummary.sealedCandidateAssemblyPreviewFingerprint,
    }),
    summariseStage("runtime-runtable-domain-output-scaffold", runTableDomainOutputScaffoldSummary, "runTableDomainOutputScaffoldReady", {
      fingerprint: runTableDomainOutputScaffoldSummary.runTableDomainOutputScaffoldFingerprint,
    }),
    blockedDownstreamStage("runtime-selected-result-handoff-scaffold"),
    blockedDownstreamStage("selector-safe-draft-project-envelope-preview"),
    blockedDownstreamStage("selector-safe-hydrate-validation-preview"),
    blockedDownstreamStage("runtime-ies-handoff-readiness-scaffold"),
  ];
  return {
    ok: false,
    blocker: "donor-engine-invocation-not-approved",
    ...fingerprints,
    safePhysicalPlacementSummary,
    physicalPlacementSummaryReady: safePhysicalPlacementSummary.physicalPlacementSummaryReady === true,
    sealedChainReadinessSummary: {
      readOnly: true,
      diagnosticOnly: true,
      chainComposed: false,
      stageCount: safeStageReadinessSummary.length,
      readyStageCount: safeStageReadinessSummary.filter((stage) => stage.ready === true).length,
      selectedResultSourceBodyAvailable: false,
      selectedResultSourceBodyBlocker: "donor-engine-invocation-not-approved",
      productionRunTableReady: false,
      iesGenerationReady: false,
      donorEngineReady: false,
      rawOutputReady: false,
    },
    stageReadinessSummary: safeStageReadinessSummary,
    warnings: [
      "Controlled real-source evidence reached sealed runtime summaries through the RunTable domain output scaffold.",
      "Selected-result handoff, draft/hydrate restore, and IES handoff remain blocked because donor Engine invocation and selected-result source creation are not approved.",
    ],
  };

  const selectedResultProjectionSummary = safeSelectedResultProjectionSummary(fingerprints);
  const safeSelectedResultSourceObjectSummary = safeSelectedResultSourceObjectSummary(fingerprints);
  const selectedResultHandoffScaffoldSummary = buildRuntimeSelectedResultHandoffScaffoldSummary({
    ...fingerprints,
    sealedCandidateAssemblyPreviewSummary,
    runTableDomainOutputScaffoldSummary,
    gateDValidationScaffoldSummary,
    selectedResultProjectionSummary,
    safeSelectedResultSourceObjectSummary,
  });

  const safeDraftProjectEnvelopePreviewSummary = buildSelectorSafeDraftProjectEnvelopePreview({
    ...fingerprints,
    safeSelectedValuesSummary: selectedValuesSummary(),
    selectorReferenceOptionsSummary: selectorReferenceOptionsSummary(projection),
    finishCascadeSummary: finishCascadeSummary(),
    timelineStatusSummary: timelineGateSummary(),
    runIntakePreviewSummary,
    runAccessoryPlacementIntentPreviewSummary,
    specialPartsEntitlementPreviewSummary,
    sealedCandidateAssemblyPreviewSummary: safeSealedCandidateAssemblyEnvelopeSummary(sealedCandidateAssemblyPreviewSummary),
    selectedResultProjectionSummary,
    projectIntentContext: {
      projectIntentRef: "safe-controlled-real-source-project-intent",
      projectLabel: "Controlled source-backed evidence package",
      clientLabel: "Redacted client",
      siteLabel: "Redacted site",
      status: "draft-intent",
    },
    safeWorkspaceContext: {
      displayRole: "internal_user",
      identityState: "matched_redacted",
      safeProjectRef: "safe-controlled-real-source-project-intent",
    },
  });

  const currentSafeDraftProjectEnvelopePreviewSummary = buildCurrentEnvelopeForHydrate(safeDraftProjectEnvelopePreviewSummary);
  const hydrateValidationSummary = buildSelectorSafeHydrateValidationPreview({
    safeDraftProjectEnvelopePreviewSummary: currentSafeDraftProjectEnvelopePreviewSummary,
    expectedPolicyFingerprint: fingerprints.policyFingerprint,
    expectedSourceFingerprint: fingerprints.sourceFingerprint,
    currentReferenceOptionsFingerprint: CURRENT_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: CURRENT_SELECTOR_STATE_FINGERPRINT,
  });

  const iesHandoffReadinessScaffoldSummary = buildRuntimeIesHandoffReadinessScaffoldSummary({
    ...fingerprints,
    selectedResultHandoffScaffoldSummary,
    runTableDomainOutputScaffoldSummary,
    sealedCandidateAssemblyPreviewSummary,
    gateDValidationScaffoldSummary,
    selectedResultProjectionSummary,
    safeDraftProjectEnvelopePreviewSummary: currentSafeDraftProjectEnvelopePreviewSummary,
    curveLookupSummary: curveLookupSummary(fingerprints),
    curveParseInterpolationSummary: curveParseInterpolationSummary(fingerprints),
  });

  const stageReadinessSummary = [
    summariseStage("selector-run-intake-preview", runIntakePreviewSummary, "runIntakePreviewReady", {
      ok: runIntakePreviewSummary.runIntakePreviewReady === true,
    }),
    summariseStage("selector-accessory-placement-intent-preview", runAccessoryPlacementIntentPreviewSummary, "runAccessoryPlacementPreviewReady", {
      ok: runAccessoryPlacementIntentPreviewSummary.runAccessoryPlacementPreviewReady === true,
    }),
    summariseStage("selector-special-parts-entitlement-preview", specialPartsEntitlementPreviewSummary, "specialPartsEntitlementPreviewReady", {
      ok: specialPartsEntitlementPreviewSummary.specialPartsEntitlementPreviewReady === true,
    }),
    summariseStage("runtime-accessory-reservation", accessoryReservationSummary, "accessoryReservationReady", {
      fingerprint: accessoryReservationSummary.accessoryReservationFingerprint,
    }),
    summariseStage("runtime-board-fill-input", boardFillInputSummary, "ok", {
      fingerprint: boardFillInputSummary.boardFillInputFingerprint,
    }),
    summariseStage("runtime-board-fill", boardFillSummary, "ok", {
      fingerprint: boardFillSummary.sourceFingerprint,
    }),
    summariseStage("runtime-board-electrical", boardElectricalSummary, "electricalSummaryReady", {
      fingerprint: boardElectricalSummary.summaryFingerprint,
    }),
    summariseStage("runtime-driver-sizer", driverSizerSummary, "driverSizerReady", {
      fingerprint: driverSizerSummary.driverSizerFingerprint,
    }),
    summariseStage("runtime-safe-physical-placement-summary", safePhysicalPlacementSummary, "physicalPlacementSummaryReady", {
      fingerprint: safePhysicalPlacementSummary.placementSummaryFingerprint,
    }),
    summariseStage("runtime-sealed-segment-zone-bridge", segmentZoneBridgeSummary, "segmentZoneBridgeReady", {
      fingerprint: segmentZoneBridgeSummary.segmentZoneBridgeFingerprint,
    }),
    summariseStage("runtime-zone-validation-foothold", zoneValidationFootholdSummary, "zoneValidationFootholdReady", {
      fingerprint: zoneValidationFootholdSummary.zoneValidationFootholdFingerprint,
    }),
    summariseStage("runtime-emergency-zone-picker-marker-only", emergencyZonePickerFootholdSummary, "emergencyZonePickerReady", {
      fingerprint: emergencyZonePickerFootholdSummary.emergencyZonePickerFingerprint,
    }),
    summariseStage("runtime-gate-d-validation-scaffold", gateDValidationScaffoldSummary, "gateDScaffoldReady", {
      fingerprint: gateDValidationScaffoldSummary.gateDValidationScaffoldFingerprint,
    }),
    summariseStage("runtime-sealed-candidate-assembly-preview", sealedCandidateAssemblyPreviewSummary, "sealedCandidateAssemblyPreviewReady", {
      fingerprint: sealedCandidateAssemblyPreviewSummary.sealedCandidateAssemblyPreviewFingerprint,
    }),
    summariseStage("runtime-runtable-domain-output-scaffold", runTableDomainOutputScaffoldSummary, "runTableDomainOutputScaffoldReady", {
      fingerprint: runTableDomainOutputScaffoldSummary.runTableDomainOutputScaffoldFingerprint,
    }),
    summariseStage("runtime-selected-result-handoff-scaffold", selectedResultHandoffScaffoldSummary, "selectedResultHandoffScaffoldReady", {
      fingerprint: selectedResultHandoffScaffoldSummary.selectedResultHandoffScaffoldFingerprint,
    }),
    summariseStage("selector-safe-draft-project-envelope-preview", safeDraftProjectEnvelopePreviewSummary, "safeDraftProjectEnvelopePreviewReady", {
      ok: safeDraftProjectEnvelopePreviewSummary.ok === true,
      fingerprint: safeDraftProjectEnvelopePreviewSummary.envelopeFingerprint,
    }),
    summariseStage("selector-safe-hydrate-validation-preview", hydrateValidationSummary, "hydrateValidationPreviewReady", {
      fingerprint: hydrateValidationSummary.hydrateValidationPreviewFingerprint,
    }),
    summariseStage("runtime-ies-handoff-readiness-scaffold", iesHandoffReadinessScaffoldSummary, "iesHandoffReadinessScaffoldReady", {
      fingerprint: iesHandoffReadinessScaffoldSummary.iesHandoffReadinessScaffoldFingerprint,
    }),
  ];

  const firstFailed = stageReadinessSummary.find((stage) => stage.ready !== true);
  return {
    ok: !firstFailed,
    blocker: firstFailed?.blocker || (firstFailed ? `${firstFailed.stage}-not-ready` : null),
    ...fingerprints,
    safePhysicalPlacementSummary,
    physicalPlacementSummaryReady: safePhysicalPlacementSummary.physicalPlacementSummaryReady === true,
    sealedChainReadinessSummary: {
      readOnly: true,
      diagnosticOnly: true,
      chainComposed: !firstFailed,
      stageCount: stageReadinessSummary.length,
      readyStageCount: stageReadinessSummary.filter((stage) => stage.ready === true).length,
      selectedResultSourceBodyAvailable: false,
      selectedResultSourceBodyBlocker: "donor-engine-invocation-not-approved",
      productionRunTableReady: false,
      iesGenerationReady: false,
      donorEngineReady: false,
      rawOutputReady: false,
    },
    stageReadinessSummary,
    warnings: [
      "Selected-result source object is marker-only because donor Engine invocation is not approved for this controlled evidence probe.",
      "Safe hydrate comparison is represented as current for evidence proof only; stale comparison remains fail-closed elsewhere.",
    ],
  };
}

function finaliseEvidenceFingerprint(summary) {
  const fingerprintInput = {
    schemaId: summary.schemaId,
    schemaVersion: summary.schemaVersion,
    state: summary.state,
    sourceFingerprint: summary.sourceFingerprint,
    policyFingerprint: summary.policyFingerprint,
    stageReadinessSummary: summary.stageReadinessSummary,
    safeCandidateSourceSummary: summary.safeCandidateSourceSummary,
    safeSelectorTokenSummary: summary.safeSelectorTokenSummary,
    safeRunIntentSummary: summary.safeRunIntentSummary,
    safeBoardFamilySummary: summary.safeBoardFamilySummary,
    boardFamilyProjectionSummary: summary.boardFamilyProjectionSummary,
    driverCandidateProjectionSummary: summary.driverCandidateProjectionSummary,
    safeAccessoryPolicySummary: summary.safeAccessoryPolicySummary,
    safeDriverCandidateProjectionSummary: summary.safeDriverCandidateProjectionSummary,
    safePhysicalPlacementRequirementSummary: summary.safePhysicalPlacementRequirementSummary,
    safePhysicalPlacementSummary: summary.safePhysicalPlacementSummary,
    physicalPlacementSummaryReady: summary.physicalPlacementSummaryReady === true,
    safeCurveReferenceSummary: summary.safeCurveReferenceSummary,
    blocker: summary.blocker,
  };
  return `safe-evidence:${stableSha1(fingerprintInput)}`;
}

export function buildControlledRealSourceSealedEvidenceProbeSummary(input = {}) {
  const sourceAccessSummary = isRecord(input.sourceAccessSummary) ? input.sourceAccessSummary : input;
  const projection = buildSafeRealSourceProjection(sourceAccessSummary);
  if (!projection.ok) {
    const failed = failClosed(projection.blocker, projection.reason, {
      sourceFingerprint: projection.sourceFingerprint || null,
      safeCandidateSourceSummary: isRecord(sourceAccessSummary) ? {
        readOnly: true,
        diagnosticOnly: true,
        activeSourceDbLoadedReadOnly: sourceAccessSummary.activeSourceDbLoadedReadOnly === true,
        sourceFingerprintAvailable: Boolean(projection.sourceFingerprint),
        criticalTableSummaries: redactedTableSummaries(sourceAccessSummary),
        rawRowsReturned: false,
        rawHeadersReturned: false,
        rawUsersReturned: false,
        privatePathsReturned: false,
        credentialsReturned: false,
      } : null,
      boardFamilyProjectionSummary: projection.boardFamilyProjectionSummary || null,
      driverCandidateProjectionSummary: projection.driverCandidateProjectionSummary || null,
    });
    return {
      ...failed,
      evidenceFingerprint: finaliseEvidenceFingerprint(failed),
    };
  }

  const chain = composeSealedChain(projection);
  if (!chain.ok) {
    const failed = failClosed(chain.blocker || "sealed-chain-composition-not-ready", "Controlled real-source safe projection could not compose through the sealed runtime chain.", {
      policyFingerprint: chain.policyFingerprint || projection.policyFingerprint,
      sourceFingerprint: chain.sourceFingerprint || projection.sourceFingerprint,
      safeCandidateSourceSummary: projection.safeCandidateSourceSummary,
      safeSelectorTokenSummary: projection.safeSelectorTokenSummary,
      safeRunIntentSummary: projection.safeRunIntentSummary,
      safeBoardFamilySummary: projection.safeBoardFamilySummary,
      boardFamilyProjectionSummary: projection.boardFamilyProjectionSummary,
      driverCandidateProjectionSummary: projection.driverCandidateProjectionSummary,
      safeAccessoryPolicySummary: projection.safeAccessoryPolicySummary,
      safeDriverCandidateProjectionSummary: projection.safeDriverCandidateProjectionSummary,
      safePhysicalPlacementRequirementSummary: projection.safePhysicalPlacementRequirementSummary,
      safePhysicalPlacementSummary: chain.safePhysicalPlacementSummary || null,
      physicalPlacementSummaryReady: chain.physicalPlacementSummaryReady === true,
      safeCurveReferenceSummary: projection.safeCurveReferenceSummary,
      sealedChainReadinessSummary: chain.sealedChainReadinessSummary,
      stageReadinessSummary: chain.stageReadinessSummary,
      warnings: chain.warnings,
      failClosedDiagnostics: [chain.blocker || "sealed-chain-composition-not-ready"],
    });
    return {
      ...failed,
      evidenceFingerprint: finaliseEvidenceFingerprint(failed),
    };
  }

  const summary = baseProbe({
    ok: true,
    realSourceSealedEvidenceReady: true,
    policyFingerprint: chain.policyFingerprint,
    sourceFingerprint: chain.sourceFingerprint,
    safeCandidateSourceSummary: projection.safeCandidateSourceSummary,
    safeSelectorTokenSummary: projection.safeSelectorTokenSummary,
    safeRunIntentSummary: projection.safeRunIntentSummary,
    safeBoardFamilySummary: projection.safeBoardFamilySummary,
    boardFamilyProjectionSummary: projection.boardFamilyProjectionSummary,
    driverCandidateProjectionSummary: projection.driverCandidateProjectionSummary,
    safeAccessoryPolicySummary: projection.safeAccessoryPolicySummary,
    safeDriverCandidateProjectionSummary: projection.safeDriverCandidateProjectionSummary,
    safePhysicalPlacementRequirementSummary: projection.safePhysicalPlacementRequirementSummary,
    safePhysicalPlacementSummary: chain.safePhysicalPlacementSummary || null,
    physicalPlacementSummaryReady: chain.physicalPlacementSummaryReady === true,
    safeCurveReferenceSummary: projection.safeCurveReferenceSummary,
    sealedChainReadinessSummary: chain.sealedChainReadinessSummary,
    stageReadinessSummary: chain.stageReadinessSummary,
    warnings: chain.warnings,
    failClosedDiagnostics: ["selected-result-source-body-blocked:donor-engine-invocation-not-approved"],
  });

  const withFingerprint = {
    ...summary,
    evidenceFingerprint: finaliseEvidenceFingerprint(summary),
  };

  if (hasUnsafeRawKey(withFingerprint)) {
    const failed = failClosed("raw-row-projection-not-approved", "Unsafe raw rows, payloads, private paths, credentials, IES, candela, or raw table keys were detected in the evidence summary.", {
      policyFingerprint: withFingerprint.policyFingerprint,
      sourceFingerprint: withFingerprint.sourceFingerprint,
    });
    return {
      ...failed,
      evidenceFingerprint: finaliseEvidenceFingerprint(failed),
    };
  }

  return withFingerprint;
}

export async function runControlledRealSourceSealedEvidenceProbe(input = {}) {
  const sourceAccessSummary = isRecord(input.sourceAccessSummary)
    ? input.sourceAccessSummary
    : await loadRuntimeDataReadOnlySource({
      sourcePath: input.sourcePath,
      fsApi: input.fsApi,
    });
  return buildControlledRealSourceSealedEvidenceProbeSummary({ sourceAccessSummary });
}

export const buildEngineRunTableControlledRealSourceSealedEvidenceProbeSummary = buildControlledRealSourceSealedEvidenceProbeSummary;
export const runEngineRunTableControlledRealSourceSealedEvidenceProbe = runControlledRealSourceSealedEvidenceProbe;
