import { stableSha1 } from "./stableFingerprint.js";

export const RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID =
  "controlstack.lab.approved-photometry-reference-summary.v1";
export const RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE =
  "runtime_approved_lab_photometry_reference_summary_diagnostic_only";

export const RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_ALLOWED_OUTPUT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "readOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "labOwned",
  "approvedReferenceOnly",
  "ok",
  "approvedLabReferenceSummaryReady",
  "projectIesExportEligible",
  "datasheetReportRenderApproved",
  "blocker",
  "blockers",
  "approvalStateSummary",
  "oneMmLabRecordSummary",
  "referenceIesSummary",
  "provenanceSummary",
  "emergencyEvidenceSummary",
  "projectIesExportSummary",
  "downstreamBoundarySummary",
  "staleState",
  "policyFingerprint",
  "sourceFingerprint",
  "labReferenceFingerprint",
  "oneMmLabRecordFingerprint",
  "referenceIesFingerprint",
  "provenanceFingerprint",
  "emergencyEvidenceFingerprint",
  "approvedLabReferenceFingerprint",
  "warnings",
  "failClosedDiagnostics",
  "unsafeOutputsBlocked",
  "safetyFlags",
]);

export const RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  labOwned: true,
  approvedReferenceOnly: true,
  referenceIesIntakeOwnedByLab: true,
  oneMmLabRecordOwnedByLab: true,
  provenanceOwnedByLab: true,
  emergencyEvidenceOwnedByLab: true,
  projectIesExportBoundaryOwnedByLab: true,
  datasheetReportOutputOwnedByLab: true,
  rawReferenceIesReturned: false,
  rawOneMmJsonReturned: false,
  rawOneMmJsonBodyReturned: false,
  rawProvenanceReturned: false,
  rawEmergencyEvidenceReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  exactElectricalValuesReturned: false,
  exactPlacementCoordinatesReturned: false,
  selectedResultBodyReturned: false,
  selectedResultPersisted: false,
  selectedResultHandoffScaffoldReady: false,
  projectIesExportGenerated: false,
  datasheetReportRendered: false,
  donorEngineInvoked: false,
  donorPhotometryInvoked: false,
  runtimeDataMutated: false,
  donorMutated: false,
  productionRunTableGenerated: false,
  runTableGenerated: false,
  iesGenerated: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,760}$/;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|\bControlStack(?:_Runtime|_RuntimeData)?[\\/])/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT\s*=|\bLM-63\b|\[[A-Z0-9_ -]{2,}\]\s+[^\n]+\n\s*TILT\s*=)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s]+;base64|\bbase64\s*[,=:]/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\\/\s])[^\\/\s]+\.(?:ies|json|csv|pdf|png|jpg|jpeg|webp)\b/i;

const APPROVED_TOKENS = new Set([
  "approved",
  "lab-approved",
  "approved-lab-reference",
  "approved-reference",
  "export-approved",
  "safe-approved",
]);

const CURRENT_STALE_TOKENS = new Set([
  "current",
  "not-stale",
  "fresh",
  "safe-comparison-current",
  "safe-comparison-approved-current",
  "comparison-approved-current",
]);

const STALE_TOKENS = new Set([
  "stale",
  "outdated",
  "expired",
  "superseded",
  "not-current",
]);

const NOT_COMPARED_TOKENS = new Set([
  "not-compared",
  "not-compared-fail-closed",
  "not-compared-failclosed",
  "comparison-not-implemented",
  "unknown",
]);

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:rawReferenceIesReturned|rawReferenceIESReturned|rawReferenceIesExposed|rawIESReturned|rawIesReturned|rawIesContentReturned|iesContentReturned|iesTextReturned|referenceIesReturned|referenceIesExposed)$/i, "raw-reference-ies-not-approved"],
  [/^(?:rawOneMmJsonReturned|rawOneMMJsonReturned|rawOneMmJsonBodyReturned|rawOneMMJsonBodyReturned|oneMmJsonBodyReturned|oneMMJsonBodyReturned|rawLabRecordReturned|rawLabRecordBodyReturned)$/i, "raw-one-mm-json-not-approved"],
  [/^(?:rawProvenanceReturned|rawProvenanceExposed|provenanceBodyReturned|provenancePayloadReturned|rawProvenancePayloadReturned)$/i, "raw-provenance-not-approved"],
  [/^(?:rawPhotometryReturned|rawPhotometryExposed|photometryReturned|photometryExposed|photometryGridReturned|rawPhotometricGridReturned)$/i, "raw-photometry-not-approved"],
  [/^(?:candelaArraysReturned|candelaArrayReturned|candelaArraysExposed|candelaReturned|candelaGridReturned|rawCandelaGridReturned|rawCandelaReturned)$/i, "candela-array-return-not-approved"],
  [/^(?:base64ArtifactsReturned|base64ArtefactsReturned|base64ArtifactReturned|base64ArtefactReturned|base64Returned|fileArtifactsReturned|fileArtefactsReturned|artifactReturned|artefactReturned|pdfReturned|polarPlotReturned|imageReturned)$/i, "raw-photometry-not-approved"],
  [/^(?:exactElectricalValuesReturned|exactElectricalValuesExposed|exactVoltageReturned|exactPowerReturned|exactCurrentReturned|exactVfReturned|exactWattsReturned|electricalValuesReturned)$/i, "exact-electrical-values-not-approved"],
  [/^(?:exactPlacementCoordinatesReturned|exactPlacementCoordinatesExposed|rawCoordinatesReturned|placementCoordinatesReturned|placementCoordinatesExposed|xMmReturned|yMmReturned|zMmReturned)$/i, "exact-placement-coordinates-not-approved"],
  [/^(?:selectedResultBodyReturned|selectedResultPayloadReturned|rawSelectedPayloadReturned|selectedResultPersisted|selectedResultPersistenceEnabled|selectedResultPersistenceAttempted)$/i, "selected-result-body-not-approved"],
  [/^(?:selectedResultHandoffScaffoldReady|selectedResultHandoffReady)$/i, "selected-result-handoff-scaffold-not-ready"],
  [/^(?:projectIesGenerated|projectIESGenerated|projectIesExportGenerated|projectIESExportGenerated|projectIesBodyReturned|projectIESBodyReturned)$/i, "ies-generation-not-approved"],
  [/^(?:datasheetReportRendered|datasheetRenderGenerated|reportCardRendered|reportCardGenerated|datasheetReportBodyReturned)$/i, "datasheet-report-render-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|donorEngineInvocationAttempted|productionEngineExecutionEnabled|engineExecutionAttempted)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:donorPhotometryInvoked|donorPhotometryGenerationInvoked|photometryGenerationInvoked|photometryGenerationEnabled)$/i, "ies-generation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAttempted|authorityWritesActive)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:productionRunTableGenerated|productionRunTableGenerationEnabled|runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableGenerationAttempted)$/i, "ies-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled|iesGenerationAttempted|lm63Generated)$/i, "ies-generation-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "route-or-post-endpoint-not-approved"],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:referenceIes|referenceIES|rawReferenceIes|rawReferenceIES|ies|iesText|rawIesText|rawIESText|iesContent|rawIesContent|lm63|lm63Text)$/i, "raw-reference-ies-not-approved"],
  [/^(?:oneMmJson|oneMMJson|rawOneMmJson|rawOneMMJson|oneMmJsonBody|oneMMJsonBody|rawOneMmJsonBody|rawOneMMJsonBody|labRecordBody|rawLabRecordBody|labRecordJson)$/i, "raw-one-mm-json-not-approved"],
  [/^(?:provenance|rawProvenance|provenanceBody|provenancePayload|rawProvenancePayload|mutationHistory|transformHistory|rawTransformHistory)$/i, "raw-provenance-not-approved"],
  [/^(?:photometry|rawPhotometry|photometryGrid|photometricGrid|rawPhotometricGrid|photometryFile|polarDistribution)$/i, "raw-photometry-not-approved"],
  [/^(?:candela|candelaGrid|candelaArray|candelaArrays|rawCandela|rawCandelaGrid|candelaMatrix)$/i, "candela-array-return-not-approved"],
  [/^(?:base64|base64Artifact|base64Artefact|base64Artifacts|base64Artefacts|fileArtifact|fileArtefact|fileArtifacts|fileArtefacts|pdf|pdfRef|polarPlot|imageData)$/i, "raw-photometry-not-approved"],
  [/^(?:electricalValues|exactElectricalValues|voltage|voltage_v|vf|vf_v|current_ma|currentMa|power|power_w|watts|watts_w|wattAtCurrentW|vfAtCurrentV|selectedCurrentMa|targetCurrentMa)$/i, "exact-electrical-values-not-approved"],
  [/^(?:exactPlacementCoordinates|placementCoordinates|placementCoordinatesMm|coordinates|coordinateList|x_mm|y_mm|z_mm|start_mm|end_mm|startCoordinateMm|endCoordinateMm)$/i, "exact-placement-coordinates-not-approved"],
  [/^(?:selectedResultBody|selected_result_body|selectedResultPayload|rawSelectedPayload|selectedResult|rawSelectedResult)$/i, "selected-result-body-not-approved"],
  [/^(?:projectIes|projectIES|projectIesBody|projectIESBody|projectIesText|projectIESText|generatedIes|generatedIES|iesFile)$/i, "ies-generation-not-approved"],
  [/^(?:datasheetReport|datasheetReportBody|reportCard|reportCardBody|renderedDatasheet|renderedReportCard)$/i, "datasheet-report-render-not-approved"],
  [/^(?:enginePayload|rawEnginePayload|engineResult|rawEngineResult|rawDonorPayload|donorPayload)$/i, "donor-engine-invocation-not-approved"],
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null
    || value === undefined
    || (typeof value === "number" && Number.isNaN(value))
    || (typeof value === "string" && value.trim() === "");
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function safeLabel(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw) || FILE_EXTENSION_VALUE_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 180) : fallback;
}

function safeToken(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw) || FILE_EXTENSION_VALUE_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
  return token || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw) || FILE_EXTENSION_VALUE_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 780);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function sourceFingerprintFrom(source) {
  return safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function policyFingerprintFrom(source) {
  return safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]));
}

function fingerprintFrom(source, keys) {
  return safeFingerprint(firstPresent(source, keys));
}

function approvalTokenFrom(source) {
  return safeToken(firstPresent(source, [
    "approvalState",
    "approvedState",
    "labReferenceState",
    "state",
    "status",
  ]), "");
}

function hasApproval(source) {
  if (!isPlainObject(source)) return false;
  if (source.approved === true || source.labApproved === true || source.referenceApproved === true || source.exportSafeApproved === true) return true;
  return APPROVED_TOKENS.has(approvalTokenFrom(source));
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 12 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "raw-photometry-not-approved";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "raw-reference-ies-not-approved";
    if (DATA_BASE64_PATTERN.test(value)) return "raw-photometry-not-approved";
    if (FILE_EXTENSION_VALUE_PATTERN.test(value)) return "raw-photometry-not-approved";
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeBlocker(entry, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    for (const [pattern, blocker] of RAW_KEY_BLOCKERS) {
      if (pattern.test(key) && nested !== false && nested !== null && nested !== undefined) return blocker;
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function summaryFrom(source, keys) {
  for (const key of keys) {
    if (isPlainObject(source[key])) return source[key];
  }
  return null;
}

function approvedLabReferenceFrom(source) {
  if (isPlainObject(source.approvedLabReferenceSummary)) return source.approvedLabReferenceSummary;
  if (isPlainObject(source.labReferenceSummary)) return source.labReferenceSummary;
  if (source.approved === true || source.labApproved === true || APPROVED_TOKENS.has(approvalTokenFrom(source))) return source;
  return null;
}

function validateApprovedChildSummary(summary, spec) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} is required for an approved Lab photometry reference summary.` };
  }
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: `${spec.label} contains raw Lab data, raw photometry, exact values, generation, mutation, route, POST, donor, or selected-result markers.` };
  if (!hasApproval(summary)) {
    return { ok: false, blocker: spec.notApproved, diagnostic: `${spec.label} must be explicitly approved by Lab.` };
  }
  const fingerprint = fingerprintFrom(summary, spec.fingerprintKeys);
  if (!fingerprint) {
    return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} must expose a safe fingerprint.` };
  }
  return { ok: true, fingerprint };
}

function validateFingerprintMatch(label, expected, actual) {
  if (expected && actual && expected !== actual) {
    return {
      ok: false,
      blocker: "approved-lab-reference-fingerprint-mismatch",
      diagnostic: `${label} fingerprint does not match the approved Lab reference summary fingerprint set.`,
    };
  }
  return { ok: true };
}

function resolveStaleState(source, labReference) {
  const comparison = summaryFrom(source, ["staleComparisonSummary", "safeStaleComparisonSummary"])
    || summaryFrom(labReference, ["staleComparisonSummary", "safeStaleComparisonSummary"])
    || {};
  const explicitState = safeToken(firstPresent(source, ["staleState", "comparisonState", "freshnessState"])
    ?? firstPresent(labReference, ["staleState", "comparisonState", "freshnessState"])
    ?? firstPresent(comparison, ["staleState", "comparisonState", "freshnessState"]), "unknown");

  if (source.stale === true || labReference.stale === true || comparison.stale === true || STALE_TOKENS.has(explicitState)) {
    if (comparison.safeComparisonApproved === true && comparison.stale === false && CURRENT_STALE_TOKENS.has(safeToken(firstPresent(comparison, ["staleState", "comparisonState", "freshnessState"]), "current"))) {
      return { ok: true, staleState: "safe_comparison_approved_current" };
    }
    return { ok: false, blocker: "approved-lab-reference-stale", diagnostic: "Approved Lab reference is stale and no safe approved current comparison was supplied.", staleState: "stale_fail_closed" };
  }

  if (CURRENT_STALE_TOKENS.has(explicitState) || comparison.current === true || comparison.safeComparisonApproved === true) {
    return { ok: true, staleState: safeLabel(explicitState === "unknown" ? "safe_comparison_current" : explicitState, "safe_comparison_current") };
  }

  if (source.staleComparisonRequired === true || labReference.staleComparisonRequired === true || NOT_COMPARED_TOKENS.has(explicitState)) {
    return { ok: false, blocker: "stale-comparison-not-implemented", diagnostic: "Stale comparison is required but was not supplied as a safe approved comparison.", staleState: "not_compared_fail_closed" };
  }

  return { ok: true, staleState: "current" };
}

function validateProjectIesExport(source, labReference) {
  const exportSummary = summaryFrom(source, ["projectIesExportApprovalSummary", "projectIesExportSummary", "projectIESExportApprovalSummary"])
    || summaryFrom(labReference, ["projectIesExportApprovalSummary", "projectIesExportSummary", "projectIESExportApprovalSummary"])
    || {};
  const approved = exportSummary.projectIesExportApproved === true
    || exportSummary.projectIESExportApproved === true
    || exportSummary.exportApproved === true
    || source.projectIesExportApproved === true
    || labReference.projectIesExportApproved === true;
  if (!approved) {
    return { ok: false, blocker: "project-ies-export-not-approved", diagnostic: "Project IES export eligibility must be explicitly approved through a safe Lab input." };
  }
  const unsafe = unsafeBlocker(exportSummary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: "Project IES export summary contains unsafe raw or generation markers." };
  return { ok: true };
}

function validateDatasheetReportBoundary(source, labReference) {
  const reportSummary = summaryFrom(source, ["datasheetReportSummary", "reportCardSummary", "datasheetReportRenderSummary"])
    || summaryFrom(labReference, ["datasheetReportSummary", "reportCardSummary", "datasheetReportRenderSummary"])
    || {};
  const unsafe = unsafeBlocker(reportSummary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: "Datasheet/report-card summary contains unsafe raw render markers." };
  if (reportSummary.datasheetReportRenderApproved === true || reportSummary.renderApproved === true || source.datasheetReportRenderApproved === true) {
    return { ok: false, blocker: "datasheet-report-render-not-approved", diagnostic: "Datasheet/report rendering is downstream and must remain blocked for this summary contract." };
  }
  return { ok: true };
}

function buildUnsafeOutputsBlocked() {
  return {
    rawReferenceIesBlocked: true,
    rawOneMmJsonBlocked: true,
    rawProvenanceBlocked: true,
    rawEmergencyEvidenceBlocked: true,
    rawPhotometryBlocked: true,
    candelaArraysBlocked: true,
    base64ArtifactsBlocked: true,
    exactElectricalValuesBlocked: true,
    exactPlacementCoordinatesBlocked: true,
    selectedResultBodyBlocked: true,
    selectedResultPersistenceBlocked: true,
    donorEngineInvocationBlocked: true,
    donorPhotometryInvocationBlocked: true,
    runtimeDataMutationBlocked: true,
    donorMutationBlocked: true,
    runTableGenerationBlocked: true,
    iesGenerationBlocked: true,
    datasheetReportRenderBlocked: true,
    routesBlocked: true,
    postEndpointsBlocked: true,
  };
}

function buildApprovalStateSummary(extra = {}) {
  return {
    diagnosticOnly: true,
    labAuthority: "lab-owned-approved-photometry-reference",
    labReferenceApproved: extra.labReferenceApproved === true,
    approvalState: extra.approvalState || "not-approved-fail-closed",
    referenceIesIntakeAuthority: "lab-source-test-intake",
    oneMmLabRecordAuthority: "internal-lab-authority-record",
    projectIesBoundary: "controlled-outward-export-artifact",
    reportCardDatasheetBoundary: "downstream-display-export-asset-blocked",
  };
}

function baseSummary(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return Object.freeze({
    schemaId: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
    state: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    labOwned: true,
    approvedReferenceOnly: true,
    ok,
    approvedLabReferenceSummaryReady: ok,
    projectIesExportEligible: ok && extra.projectIesExportEligible === true,
    datasheetReportRenderApproved: false,
    blocker,
    blockers: blocker ? [blocker] : [],
    approvalStateSummary: extra.approvalStateSummary || buildApprovalStateSummary({ labReferenceApproved: false }),
    oneMmLabRecordSummary: extra.oneMmLabRecordSummary || null,
    referenceIesSummary: extra.referenceIesSummary || null,
    provenanceSummary: extra.provenanceSummary || null,
    emergencyEvidenceSummary: extra.emergencyEvidenceSummary || null,
    projectIesExportSummary: extra.projectIesExportSummary || {
      diagnosticOnly: true,
      projectIesExportEligible: false,
      projectIesExportGenerated: false,
      blocker: blocker || "project-ies-export-not-approved",
    },
    downstreamBoundarySummary: extra.downstreamBoundarySummary || {
      diagnosticOnly: true,
      projectIesIsExportBoundary: true,
      reportCardDatasheetDownstreamOnly: true,
      datasheetReportRenderApproved: false,
      datasheetReportRendered: false,
      selectedResultBodyReturned: false,
      productionRunTableGenerated: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    staleState: extra.staleState || "not_compared_fail_closed",
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    labReferenceFingerprint: extra.labReferenceFingerprint || null,
    oneMmLabRecordFingerprint: extra.oneMmLabRecordFingerprint || null,
    referenceIesFingerprint: extra.referenceIesFingerprint || null,
    provenanceFingerprint: extra.provenanceFingerprint || null,
    emergencyEvidenceFingerprint: extra.emergencyEvidenceFingerprint || null,
    approvedLabReferenceFingerprint: extra.approvedLabReferenceFingerprint || null,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    unsafeOutputsBlocked: buildUnsafeOutputsBlocked(),
    safetyFlags: clonePlain(RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SAFETY_FLAGS),
  });
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseSummary({
    ...extra,
    ok: false,
    blocker,
    projectIesExportEligible: false,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function safeChildSummary(kind, fingerprint, extra = {}) {
  return {
    diagnosticOnly: true,
    safeSummaryOnly: true,
    approved: true,
    kind,
    status: "approved",
    fingerprint,
    rawBodyReturned: false,
    rawPayloadReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    exactPlacementCoordinatesReturned: false,
    ...extra,
  };
}

export function buildRuntimeApprovedLabReferenceSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const labReference = approvedLabReferenceFrom(source);
  const sourceFingerprint = sourceFingerprintFrom(source) || (labReference ? sourceFingerprintFrom(labReference) : null) || null;
  const policyFingerprint = policyFingerprintFrom(source) || (labReference ? policyFingerprintFrom(labReference) : null) || null;

  const unsafe = unsafeBlocker(source);
  if (unsafe) {
    return failClosed(unsafe, "Approved Lab reference summary input contained raw Lab data, raw photometry, exact values, selected-result, generation, mutation, route, POST, donor Engine, or artifact markers.", {
      sourceFingerprint,
      policyFingerprint,
    });
  }

  if (!isPlainObject(labReference)) {
    return failClosed("missing-approved-lab-reference-summary", "An approved Lab reference summary is required before Runtime can consume photometry reference status.", {
      sourceFingerprint,
      policyFingerprint,
    });
  }

  if (!hasApproval(labReference)) {
    return failClosed("approved-lab-reference-not-approved", "Lab reference state must be explicitly approved before Runtime can consume it.", {
      sourceFingerprint,
      policyFingerprint,
    });
  }

  const oneMmSummary = summaryFrom(source, ["oneMmLabRecordSummary", "oneMM LabRecordSummary", "oneMmJsonLabRecordSummary", "labRecordSummary"])
    || summaryFrom(labReference, ["oneMmLabRecordSummary", "oneMmJsonLabRecordSummary", "labRecordSummary"]);
  const referenceIesSummary = summaryFrom(source, ["referenceIesSummary", "referenceIESSummary", "rawReferenceIesSummary"])
    || summaryFrom(labReference, ["referenceIesSummary", "referenceIESSummary"]);
  const provenanceSummary = summaryFrom(source, ["provenanceSummary", "labProvenanceSummary", "custodyProvenanceSummary"])
    || summaryFrom(labReference, ["provenanceSummary", "labProvenanceSummary", "custodyProvenanceSummary"]);
  const emergencySummary = summaryFrom(source, ["emergencyEvidenceSummary", "labEmergencyEvidenceSummary"])
    || summaryFrom(labReference, ["emergencyEvidenceSummary", "labEmergencyEvidenceSummary"]);

  const childSpecs = [
    {
      key: "oneMmLabRecordSummary",
      label: "1mm JSON Lab Record summary",
      summary: oneMmSummary,
      missing: "missing-one-mm-lab-record-summary",
      notApproved: "raw-one-mm-json-not-approved",
      fingerprintKeys: ["oneMmLabRecordFingerprint", "oneMmJsonFingerprint", "labRecordFingerprint", "fingerprint", "summaryFingerprint"],
    },
    {
      key: "referenceIesSummary",
      label: "Reference IES summary",
      summary: referenceIesSummary,
      missing: "missing-reference-ies-summary",
      notApproved: "raw-reference-ies-not-approved",
      fingerprintKeys: ["referenceIesFingerprint", "referenceIESFingerprint", "iesFingerprint", "fingerprint", "summaryFingerprint"],
    },
    {
      key: "provenanceSummary",
      label: "provenance custody summary",
      summary: provenanceSummary,
      missing: "missing-provenance-summary",
      notApproved: "raw-provenance-not-approved",
      fingerprintKeys: ["provenanceFingerprint", "custodyFingerprint", "fingerprint", "summaryFingerprint"],
    },
    {
      key: "emergencyEvidenceSummary",
      label: "emergency evidence summary",
      summary: emergencySummary,
      missing: "missing-emergency-evidence-summary",
      notApproved: "missing-emergency-evidence-summary",
      fingerprintKeys: ["emergencyEvidenceFingerprint", "emergencyFingerprint", "fingerprint", "summaryFingerprint"],
    },
  ];

  const validated = {};
  for (const spec of childSpecs) {
    const validation = validateApprovedChildSummary(spec.summary, spec);
    if (!validation.ok) {
      return failClosed(validation.blocker, validation.diagnostic, {
        sourceFingerprint,
        policyFingerprint,
      });
    }
    validated[spec.key] = validation.fingerprint;
  }

  const labReferenceFingerprint = fingerprintFrom(labReference, ["labReferenceFingerprint", "approvedLabReferenceFingerprint", "referenceFingerprint", "fingerprint", "summaryFingerprint"])
    || fingerprintFrom(source, ["labReferenceFingerprint", "approvedLabReferenceFingerprint", "referenceFingerprint"]);
  if (!labReferenceFingerprint) {
    return failClosed("approved-lab-reference-fingerprint-mismatch", "Approved Lab reference summary must expose a safe Lab reference fingerprint.", {
      sourceFingerprint,
      policyFingerprint,
    });
  }

  const declaredOneMm = fingerprintFrom(labReference, ["oneMmLabRecordFingerprint", "oneMmJsonFingerprint", "labRecordFingerprint"]);
  const declaredReferenceIes = fingerprintFrom(labReference, ["referenceIesFingerprint", "referenceIESFingerprint", "iesFingerprint"]);
  const declaredProvenance = fingerprintFrom(labReference, ["provenanceFingerprint", "custodyFingerprint"]);
  const declaredEmergency = fingerprintFrom(labReference, ["emergencyEvidenceFingerprint", "emergencyFingerprint"]);
  const fingerprintChecks = [
    validateFingerprintMatch("1mm Lab Record", declaredOneMm, validated.oneMmLabRecordSummary),
    validateFingerprintMatch("Reference IES", declaredReferenceIes, validated.referenceIesSummary),
    validateFingerprintMatch("provenance", declaredProvenance, validated.provenanceSummary),
    validateFingerprintMatch("emergency evidence", declaredEmergency, validated.emergencyEvidenceSummary),
  ];
  for (const check of fingerprintChecks) {
    if (!check.ok) {
      return failClosed(check.blocker, check.diagnostic, {
        sourceFingerprint,
        policyFingerprint,
        labReferenceFingerprint,
      });
    }
  }

  const stale = resolveStaleState(source, labReference);
  if (!stale.ok) {
    return failClosed(stale.blocker, stale.diagnostic, {
      sourceFingerprint,
      policyFingerprint,
      labReferenceFingerprint,
      staleState: stale.staleState,
    });
  }

  const exportValidation = validateProjectIesExport(source, labReference);
  if (!exportValidation.ok) {
    return failClosed(exportValidation.blocker, exportValidation.diagnostic, {
      sourceFingerprint,
      policyFingerprint,
      labReferenceFingerprint,
      staleState: stale.staleState,
    });
  }

  const reportBoundary = validateDatasheetReportBoundary(source, labReference);
  if (!reportBoundary.ok) {
    return failClosed(reportBoundary.blocker, reportBoundary.diagnostic, {
      sourceFingerprint,
      policyFingerprint,
      labReferenceFingerprint,
      staleState: stale.staleState,
    });
  }

  const approvalState = safeToken(approvalTokenFrom(labReference) || "approved", "approved");
  const fingerprintPayload = {
    schemaId: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
    state: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
    sourceFingerprint,
    policyFingerprint,
    labReferenceFingerprint,
    oneMmLabRecordFingerprint: validated.oneMmLabRecordSummary,
    referenceIesFingerprint: validated.referenceIesSummary,
    provenanceFingerprint: validated.provenanceSummary,
    emergencyEvidenceFingerprint: validated.emergencyEvidenceSummary,
    staleState: stale.staleState,
    approvalState,
    projectIesExportEligible: true,
    datasheetReportRenderApproved: false,
  };
  const approvedLabReferenceFingerprint = `safe-approved-lab-reference-summary:${stableSha1(fingerprintPayload)}`;

  return baseSummary({
    ok: true,
    projectIesExportEligible: true,
    approvalStateSummary: buildApprovalStateSummary({
      labReferenceApproved: true,
      approvalState,
    }),
    oneMmLabRecordSummary: safeChildSummary("one-mm-json-lab-record-summary", validated.oneMmLabRecordSummary, {
      rawOneMmJsonReturned: false,
      rawOneMmJsonBodyReturned: false,
    }),
    referenceIesSummary: safeChildSummary("reference-ies-intake-summary", validated.referenceIesSummary, {
      rawReferenceIesReturned: false,
      rawIesContentReturned: false,
    }),
    provenanceSummary: safeChildSummary("lab-provenance-custody-summary", validated.provenanceSummary, {
      rawProvenanceReturned: false,
    }),
    emergencyEvidenceSummary: safeChildSummary("emergency-evidence-summary", validated.emergencyEvidenceSummary, {
      rawEmergencyEvidenceReturned: false,
    }),
    projectIesExportSummary: {
      diagnosticOnly: true,
      safeSummaryOnly: true,
      projectIesExportEligible: true,
      projectIesExportApproved: true,
      projectIesExportGenerated: false,
      rawProjectIesReturned: false,
      outwardFacingControlledExportArtifact: true,
    },
    downstreamBoundarySummary: {
      diagnosticOnly: true,
      projectIesIsExportBoundary: true,
      reportCardDatasheetDownstreamOnly: true,
      datasheetReportRenderApproved: false,
      datasheetReportRendered: false,
      selectedResultBodyReturned: false,
      selectedResultHandoffScaffoldReady: false,
      productionRunTableGenerated: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    staleState: stale.staleState,
    policyFingerprint,
    sourceFingerprint,
    labReferenceFingerprint,
    oneMmLabRecordFingerprint: validated.oneMmLabRecordSummary,
    referenceIesFingerprint: validated.referenceIesSummary,
    provenanceFingerprint: validated.provenanceSummary,
    emergencyEvidenceFingerprint: validated.emergencyEvidenceSummary,
    approvedLabReferenceFingerprint,
    warnings: [
      "Approved Lab reference summary only: raw Reference IES, raw 1mm Lab Record JSON, provenance bodies, emergency evidence, photometry, candela arrays, exact values, selected-result bodies, generation, routes, and POST endpoints remain blocked.",
      "Project IES export eligibility is a safe boundary marker only; this helper does not generate Project IES or render report-card/datasheet outputs.",
    ],
    failClosedDiagnostics: [],
  });
}

export const buildApprovedLabReferenceSummary = buildRuntimeApprovedLabReferenceSummary;
export const buildRuntimeNativeApprovedLabReferenceSummary = buildRuntimeApprovedLabReferenceSummary;
export const buildEngineRunTableApprovedLabReferenceSummary = buildRuntimeApprovedLabReferenceSummary;
