import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.safe-curve-reference-summary";
export const RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_STATE =
  "runtime_safe_curve_reference_summary_diagnostic_only";

export const RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  bridgeFacingReferenceOnly: true,
  sourceBackedProjectionOnly: true,
  runtimeDataReadOnly: true,
  rawCurveRowsReturned: false,
  rawCurvePayloadsExposed: false,
  rawDriverUtilPayloadsExposed: false,
  rawDriverUtilCurvePointsReturned: false,
  rawIesContentReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  filenamesReturned: false,
  localPathsReturned: false,
  exactElectricalValuesReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  rawSelectedResultBodyReturned: false,
  rawProductRowsReturned: false,
  privateDataReturned: false,
  donorEngineInvoked: false,
  donorPhotometryGenerationInvoked: false,
  donorPhotometryInvoked: false,
  runtimeDataMutated: false,
  selectedResultPersisted: false,
  productionRunTableGenerated: false,
  runTableGenerated: false,
  iesGenerated: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,640}$/;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|\bControlStack(?:_Runtime|_RuntimeData)?[\\/])/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT\s*=|\bLM-63\b|\[[A-Z0-9_ -]{2,}\]\s+[^\n]+\n\s*TILT\s*=)/i;
const DATA_BASE64_PATTERN = /data:[^\s]+;base64/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\\/\s])[^\\/\s]+\.(?:csv|ies|json)\b/i;
const SAFE_TOKEN_PATTERN = /^safe-[0-9a-z][0-9a-z_.:-]{3,220}$/;

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:rawCurveRowsReturned|raw_curve_rows_returned|rawCurveRowsIncluded|raw_curve_rows_included|rawCurvePayloadsExposed|raw_payload_returned|rawPayloadReturned)$/i, "raw-curve-rows-not-approved"],
  [/^(?:rawDriverUtilPayloadsExposed|raw_driver_util_payloads_included|rawCurvePointsReturned|raw_curve_points_returned|rawDriverUtilCurvePointsReturned)$/i, "raw-driver-util-curve-points-not-approved"],
  [/^(?:rawIesContentReturned|rawIESContentReturned|rawIesReturned|rawIESReturned|rawIesExposed|rawIESExposed|iesContentReturned|iesTextReturned|iesFileReturned)$/i, "raw-ies-content-not-approved"],
  [/^(?:rawPhotometryReturned|rawPhotometryExposed|photometryReturned|photometryExposed|photometryFileReturned|photometryGridReturned|rawPhotometricGridReturned)$/i, "raw-photometry-not-approved"],
  [/^(?:candelaArraysReturned|candelaArrayReturned|candelaArraysExposed|candelaReturned|candelaGridReturned|rawCandelaGridReturned|rawCandelaReturned)$/i, "candela-array-return-not-approved"],
  [/^(?:base64ArtifactsReturned|base64ArtefactsReturned|base64ArtifactReturned|base64ArtefactReturned|base64Returned|fileArtifactsReturned|fileArtefactsReturned|artifactReturned|artefactReturned|pdfReturned|polarPlotReturned)$/i, "base64-artifact-not-approved"],
  [/^(?:filenamesReturned|filenameReturned|fileNamesReturned|fileNameReturned|localPathsReturned|localPathReturned|privatePathsReturned|privatePathReturned|pathReturned)$/i, "filename-or-local-path-not-approved"],
  [/^(?:exactElectricalValuesReturned|exactElectricalValuesExposed|exactVoltageReturned|exactPowerReturned|exactCurrentReturned|exactVfReturned|exactWattsReturned|electricalValuesReturned)$/i, "exact-electrical-values-not-approved"],
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|enginePayloadReturned|enginePayloadExposed|rawEngineResultReturned|rawEngineResultExposed|engineResultReturned|engineResultExposed)$/i, "raw-engine-payload-or-result-not-approved"],
  [/^(?:rawSelectedResultBodyReturned|selectedResultBodyReturned|selectedResultPersisted|selectedResultPersistenceEnabled|selectedResultPersistenceAttempted)$/i, "selected-result-body-or-persistence-not-approved"],
  [/^(?:rawProductRowsReturned|rawProductRowsExposed|rawRowsReturned|rawRowsExposed|rawSourceDbRowsExposed|rawBoardDataRowsExposed)$/i, "raw-product-rows-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineExecutionAttempted)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:donorPhotometryGenerationInvoked|donorPhotometryInvoked|photometryGenerationInvoked|photometryGenerationEnabled|iesGenerationEnabled|iesGenerated)$/i, "ies-generation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAttempted|authorityWritesActive)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:productionRunTableGenerated|productionRunTableGenerationEnabled|runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableGenerationAttempted)$/i, "runtable-generation-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "route-or-post-endpoint-not-approved"],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:curveRows|curve_rows|rawCurveRows|raw_curve_rows|csvRows|rawCsvRows|rows)$/i, "raw-curve-rows-not-approved"],
  [/^(?:curvePoints|rawCurvePoints|points|rawPoints|utilisationPoints|utilizationPoints)$/i, "raw-driver-util-curve-points-not-approved"],
  [/^(?:ies|iesText|rawIesText|rawIESText|iesContent|rawIesContent|generatedIes|generatedIES|iesFile|lm63|lm63Text)$/i, "raw-ies-content-not-approved"],
  [/^(?:photometry|rawPhotometry|photometryGrid|photometricGrid|rawPhotometricGrid|photometryFile|polarDistribution)$/i, "raw-photometry-not-approved"],
  [/^(?:candela|candelaGrid|candelaArray|candelaArrays|rawCandela|rawCandelaGrid|candelaMatrix)$/i, "candela-array-return-not-approved"],
  [/^(?:base64|base64Artifact|base64Artefact|base64Artifacts|base64Artefacts|fileArtifact|fileArtefact|fileArtifacts|fileArtefacts|pdf|pdfRef|polarPlot)$/i, "base64-artifact-not-approved"],
  [/^(?:filename|fileName|filenames|fileNames|relative_path|relativePath|absolutePath|localPath|filePath|filepath|sourcePath|donorPath|runtimeDataPath|privatePath|path)$/i, "filename-or-local-path-not-approved"],
  [/^(?:enginePayload|rawEnginePayload|engineResult|rawEngineResult|selectedResultBody|selected_result_body|selectedResultPayload|rawSelectedPayload)$/i, "raw-engine-payload-or-result-not-approved"],
  [/^(?:PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|SYSTEM_POLICY|SYSTEM_COMPONENTS|rawRows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|rawComponentRows|productRows|boardRows|driverRows|accessoryRows|sourceRows|rawSourceRows|rawSourceDbRows)$/i, "raw-product-rows-not-approved"],
  [/^(?:electricalValues|exactElectricalValues|voltage|voltage_v|vf|vf_v|current|current_ma|currentMa|power|power_w|watts|watts_w|wattAtCurrentW|vfAtCurrentV|selectedCurrentMa|targetCurrentMa)$/i, "exact-electrical-values-not-approved"],
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
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 180) : fallback;
}

function safeToken(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw)) return fallback;
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
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 680);
  if (SAFE_FINGERPRINT_PATTERN.test(cleaned)) return cleaned;
  if (/^[0-9a-f]{16,128}$/i.test(cleaned)) return `safe-source:runtime-active-${cleaned.slice(0, 32).toLowerCase()}`;
  return "";
}

function sourceFingerprintFrom(source) {
  return safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])
    ?? firstPresent(source.source || {}, ["sourceFingerprint", "safeSourceFingerprint"])
    ?? firstPresent(source.sourceAccessSummary?.source || {}, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function providedPolicyFingerprintFrom(source) {
  return safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]));
}

function countBand(count) {
  const value = Number(count);
  if (!Number.isFinite(value) || value < 0) return "unknown";
  if (value === 0) return "0";
  if (value === 1) return "1";
  if (value <= 5) return "2-5";
  if (value <= 25) return "6-25";
  if (value <= 100) return "26-100";
  return "100-plus";
}

function trueCountBand(...values) {
  const count = values.filter((value) => value === true).length;
  return countBand(count);
}

function numericField(source, keys) {
  const value = firstPresent(source, keys);
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 10 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "filename-or-local-path-not-approved";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "raw-ies-content-not-approved";
    if (DATA_BASE64_PATTERN.test(value)) return "base64-artifact-not-approved";
    if (FILE_EXTENSION_VALUE_PATTERN.test(value)) return "filename-or-local-path-not-approved";
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

function sourceStatus(source, keys) {
  for (const key of keys) {
    if (isPlainObject(source[key])) return source[key];
  }
  return {};
}

function manifestSummary(status) {
  return isPlainObject(status?.manifest) ? status.manifest : {};
}

function homeSummary(status, keys) {
  for (const key of keys) {
    if (isPlainObject(status?.[key])) return status[key];
  }
  return {};
}

function buildSourceMarker(kind, status, sourceFingerprint) {
  const manifest = manifestSummary(status);
  return `safe-${kind}-source:${stableSha1({
    kind,
    sourceFingerprint,
    contractId: safeToken(status.contract_id || status.status_id || status.source_kind, "contract"),
    sourceKind: safeToken(status.source_kind, "source-kind"),
    manifestValid: manifest.valid === true,
    manifestExists: manifest.exists === true,
    manifestReadable: manifest.readable === true,
    fileCountBand: countBand(numericField(manifest, ["fileCount", "file_count", "declaredFileCount"])),
    checksumCoverageBand: countBand(numericField(manifest, ["checksumCoverageCount", "checksum_coverage_count"])),
  })}`;
}

function validateLumenStatus(status) {
  if (!isPlainObject(status)) {
    return { ok: false, blocker: "missing-lumen-curve-status-marker", diagnostic: "A safe lumen curve lookup/status summary is required." };
  }
  const manifest = manifestSummary(status);
  const home = homeSummary(status, ["runtime_curve_home", "runtimeCurveHome", "sourceHome"]);
  const contractMarker = status.contract_id === "controlstack.runtime.lumen-curve.lookup-contract"
    || status.status_id === "runtime-lumen-curve-data-home-status"
    || safeToken(status.source_kind, "") === "lumen-curve-csv-static-mirror";
  if (!contractMarker) {
    return { ok: false, blocker: "missing-lumen-curve-status-marker", diagnostic: "Lumen curve status must carry a safe lookup/status marker." };
  }
  if (status.ok === false) {
    return { ok: false, blocker: status.blocker || "lumen-curve-reference-not-ready", diagnostic: "Lumen curve status is not ok." };
  }
  if (manifest.exists !== true || manifest.readable !== true || manifest.valid !== true) {
    return { ok: false, blocker: "missing-lumen-curve-manifest-status", diagnostic: "Lumen curve manifest must be present, readable, and valid." };
  }
  if (manifest.rawCurveRowsIncluded === true || manifest.raw_curve_rows_returned === true || manifest.raw_payload_returned === true) {
    return { ok: false, blocker: "raw-curve-rows-not-approved", diagnostic: "Lumen curve manifest/status indicated raw curve rows or payloads." };
  }
  if (Number(manifest.fileCount) <= 0 || Number(manifest.checksumCoverageCount) <= 0) {
    return { ok: false, blocker: "missing-lumen-curve-manifest-status", diagnostic: "Lumen curve manifest must include safe file and checksum coverage counts." };
  }
  return { ok: true, manifest, home };
}

function validateDriverUtilStatus(status) {
  if (!isPlainObject(status)) {
    return { ok: false, blocker: "missing-driver-util-curve-status-marker", diagnostic: "A safe driver-util curve lookup/status summary is required." };
  }
  const manifest = manifestSummary(status);
  const home = homeSummary(status, ["runtime_driver_util_curve_home", "runtimeDriverUtilCurveHome", "sourceHome"]);
  const contractMarker = status.contract_id === "controlstack.runtime.driver-util-curve.lookup-contract"
    || safeToken(status.source_kind, "") === "driver-util-curve-json-static-mirror";
  if (!contractMarker) {
    return { ok: false, blocker: "missing-driver-util-curve-status-marker", diagnostic: "Driver-util curve status must carry a safe lookup/status marker." };
  }
  if (status.ok === false) {
    return { ok: false, blocker: status.blocker || "driver-util-curve-reference-not-ready", diagnostic: "Driver-util curve status is not ok." };
  }
  if (manifest.exists !== true || manifest.readable !== true || manifest.valid !== true) {
    return { ok: false, blocker: "missing-driver-util-curve-manifest-status", diagnostic: "Driver-util curve manifest must be present, readable, and valid." };
  }
  if (manifest.rawDriverUtilPayloadsIncluded === true || manifest.raw_curve_points_returned === true || manifest.raw_payload_returned === true) {
    return { ok: false, blocker: "raw-driver-util-curve-points-not-approved", diagnostic: "Driver-util curve manifest/status indicated raw payloads or curve points." };
  }
  if (Number(manifest.fileCount) <= 0 || Number(manifest.checksumCoverageCount) <= 0) {
    return { ok: false, blocker: "missing-driver-util-curve-manifest-status", diagnostic: "Driver-util curve manifest must include safe file and checksum coverage counts." };
  }
  return { ok: true, manifest, home };
}

function buildLumenReferenceSummary(status, validation, sourceFingerprint) {
  const marker = buildSourceMarker("lumen-curve", status, sourceFingerprint);
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceBacked: true,
    referenceKind: "lumen-curve-csv-static-mirror",
    manifestPresent: true,
    manifestReadable: true,
    manifestValid: true,
    curveFileCountBand: countBand(validation.manifest.fileCount),
    checksumCoverageCountBand: countBand(validation.manifest.checksumCoverageCount),
    sourceHomeReadable: validation.home.readable === true,
    sourceHomeMarker: marker,
    curveReferenceToken: `safe-lumen-curve-reference:${stableSha1({ marker, sourceFingerprint })}`,
    rawCurveRowsReturned: false,
    rawCurvePayloadsExposed: false,
    filenamesReturned: false,
    localPathsReturned: false,
  };
}

function buildDriverUtilReferenceSummary(status, validation, sourceFingerprint) {
  const marker = buildSourceMarker("driver-util-curve", status, sourceFingerprint);
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceBacked: true,
    referenceKind: "driver-util-curve-json-static-mirror",
    manifestPresent: true,
    manifestReadable: true,
    manifestValid: true,
    curveFileCountBand: countBand(validation.manifest.fileCount),
    checksumCoverageCountBand: countBand(validation.manifest.checksumCoverageCount),
    sourceHomeReadable: validation.home.readable === true,
    sourceHomeMarker: marker,
    curveReferenceToken: `safe-driver-util-curve-reference:${stableSha1({ marker, sourceFingerprint })}`,
    rawDriverUtilPayloadsExposed: false,
    rawDriverUtilCurvePointsReturned: false,
    filenamesReturned: false,
    localPathsReturned: false,
  };
}

function buildIesPhotometryReferenceSummary(lumenSummary, driverSummary, sourceFingerprint) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    photometryReferenceReady: true,
    referenceKind: "ies-photometry-reference-summary-only",
    oneMmPolicyLabel: "one-mm-length-policy-summary-only",
    lumenCurveReferenceReady: lumenSummary.manifestValid === true,
    driverUtilCurveReferenceReady: driverSummary.manifestValid === true,
    sourceBackedReferenceCountBand: trueCountBand(lumenSummary.manifestValid, driverSummary.manifestValid),
    iesPhotometryReferenceToken: `safe-ies-photometry-reference:${stableSha1({
      sourceFingerprint,
      lumenToken: lumenSummary.curveReferenceToken,
      driverToken: driverSummary.curveReferenceToken,
      oneMmPolicyLabel: "one-mm-length-policy-summary-only",
    })}`,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    filenamesReturned: false,
    localPathsReturned: false,
    iesGenerated: false,
    photometryGenerationInvoked: false,
  };
}

function buildSourceHomeStatusSummary(lumenSummary, driverSummary) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceHomeStatusReady: lumenSummary.sourceHomeReadable === true && driverSummary.sourceHomeReadable === true,
    lumenCurveHomeReadable: lumenSummary.sourceHomeReadable === true,
    driverUtilCurveHomeReadable: driverSummary.sourceHomeReadable === true,
    referenceHomeCountBand: trueCountBand(lumenSummary.sourceHomeReadable, driverSummary.sourceHomeReadable),
    localPathsReturned: false,
    filenamesReturned: false,
  };
}

function unsafeOutputsBlocked() {
  return {
    rawCurveRowsBlocked: true,
    rawDriverUtilPayloadsBlocked: true,
    rawDriverUtilCurvePointsBlocked: true,
    rawIesContentBlocked: true,
    rawPhotometryBlocked: true,
    candelaArraysBlocked: true,
    base64ArtifactsBlocked: true,
    filenamesBlocked: true,
    localPathsBlocked: true,
    exactElectricalValuesBlocked: true,
    rawEnginePayloadBlocked: true,
    rawEngineResultBlocked: true,
    rawSelectedResultBodyBlocked: true,
    rawProductRowsBlocked: true,
    privateDataBlocked: true,
    donorEngineInvocationBlocked: true,
    donorPhotometryGenerationBlocked: true,
    runtimeDataMutationBlocked: true,
    selectedResultPersistenceBlocked: true,
    productionRunTableGenerationBlocked: true,
    iesGenerationBlocked: true,
    routesBlocked: true,
    postEndpointsBlocked: true,
  };
}

function baseSummary(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return {
    schemaId: RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_VERSION,
    state: RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_STATE,
    ok,
    blocker,
    curveReferenceSummaryReady: ok,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceBacked: extra.sourceBacked === true,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    curveReferenceFingerprint: extra.curveReferenceFingerprint || null,
    lumenCurveReferenceSummary: extra.lumenCurveReferenceSummary || null,
    driverUtilCurveReferenceSummary: extra.driverUtilCurveReferenceSummary || null,
    iesPhotometryReferenceSummary: extra.iesPhotometryReferenceSummary || null,
    sourceHomeStatusSummary: extra.sourceHomeStatusSummary || null,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    unsafeOutputsBlocked: unsafeOutputsBlocked(),
    rawCurveRowsReturned: false,
    rawCurvePayloadsExposed: false,
    rawDriverUtilPayloadsExposed: false,
    rawDriverUtilCurvePointsReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    filenamesReturned: false,
    localPathsReturned: false,
    exactElectricalValuesReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectedResultBodyReturned: false,
    rawProductRowsReturned: false,
    privateDataReturned: false,
    donorEngineInvoked: false,
    donorPhotometryGenerationInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return finalizeSummary(baseSummary({
    ...extra,
    ok: false,
    blocker,
    sourceBacked: false,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  }));
}

function finalizeSummary(summary) {
  const serialized = JSON.stringify(summary);
  if (PRIVATE_PATH_PATTERN.test(serialized)
    || RAW_IES_TEXT_PATTERN.test(serialized)
    || DATA_BASE64_PATTERN.test(serialized)
    || /\.(?:csv|ies|json)\b/i.test(serialized)) {
    if (summary.blocker === "unsafe-curve-reference-output") return Object.freeze(summary);
    return Object.freeze(baseSummary({
      ok: false,
      blocker: "unsafe-curve-reference-output",
      sourceFingerprint: summary.sourceFingerprint,
      policyFingerprint: summary.policyFingerprint,
      failClosedDiagnostics: [
        "unsafe-curve-reference-output",
        "Safe curve reference output contained a private path, filename, raw IES, base64 data URI, or file extension marker.",
      ],
    }));
  }
  return Object.freeze(summary);
}

export function buildRuntimeSafeCurveReferenceSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const inputBlocker = unsafeBlocker(source);
  if (inputBlocker) {
    return failClosed(inputBlocker, "Unsafe raw curve rows, raw IES, candela, base64, filename/path, exact electrical values, donor invocation, generation, mutation, route, POST, private data, or raw payload signals were supplied.");
  }

  const sourceFingerprint = sourceFingerprintFrom(source);
  if (!sourceFingerprint) {
    return failClosed("missing-source-fingerprint", "A safe source fingerprint is required before building a curve reference summary.");
  }

  const lumenStatus = sourceStatus(source, [
    "lumenCurveLookupStatus",
    "lumenCurveLookupSummary",
    "lumenCurveStatus",
    "lumenCurveDataHomeStatus",
    "lumenCurveReferenceStatus",
  ]);
  const driverStatus = sourceStatus(source, [
    "driverUtilCurveLookupStatus",
    "driverUtilCurveLookupSummary",
    "driverUtilCurveStatus",
    "driverUtilCurveReferenceStatus",
  ]);

  const lumenValidation = validateLumenStatus(lumenStatus);
  if (!lumenValidation.ok) {
    return failClosed(lumenValidation.blocker, lumenValidation.diagnostic, { sourceFingerprint });
  }
  const driverValidation = validateDriverUtilStatus(driverStatus);
  if (!driverValidation.ok) {
    return failClosed(driverValidation.blocker, driverValidation.diagnostic, { sourceFingerprint });
  }

  const lumenCurveReferenceSummary = buildLumenReferenceSummary(lumenStatus, lumenValidation, sourceFingerprint);
  const driverUtilCurveReferenceSummary = buildDriverUtilReferenceSummary(driverStatus, driverValidation, sourceFingerprint);
  const iesPhotometryReferenceSummary = buildIesPhotometryReferenceSummary(
    lumenCurveReferenceSummary,
    driverUtilCurveReferenceSummary,
    sourceFingerprint,
  );
  const sourceHomeStatusSummary = buildSourceHomeStatusSummary(
    lumenCurveReferenceSummary,
    driverUtilCurveReferenceSummary,
  );

  if (sourceHomeStatusSummary.sourceHomeStatusReady !== true) {
    return failClosed("missing-source-home-status-marker", "Readable source-home markers are required for both lumen and driver-util curve references.", {
      sourceFingerprint,
      lumenCurveReferenceSummary,
      driverUtilCurveReferenceSummary,
      iesPhotometryReferenceSummary,
      sourceHomeStatusSummary,
    });
  }

  const policyFingerprint = providedPolicyFingerprintFrom(source) || `safe-policy:${stableSha1({
    schemaId: RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_ID,
    sourceFingerprint,
    lumenCurveReferenceSummary,
    driverUtilCurveReferenceSummary,
    sourceHomeStatusSummary,
  })}`;

  const fingerprintPayload = {
    schemaId: RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_VERSION,
    state: RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_STATE,
    sourceFingerprint,
    policyFingerprint,
    lumenCurveReferenceSummary,
    driverUtilCurveReferenceSummary,
    iesPhotometryReferenceSummary,
    sourceHomeStatusSummary,
  };
  const curveReferenceFingerprint = `safe-curve-reference:${stableSha1(fingerprintPayload)}`;

  return finalizeSummary(baseSummary({
    ok: true,
    sourceBacked: true,
    sourceFingerprint,
    policyFingerprint,
    curveReferenceFingerprint,
    lumenCurveReferenceSummary,
    driverUtilCurveReferenceSummary,
    iesPhotometryReferenceSummary,
    sourceHomeStatusSummary,
    warnings: [
      "Safe curve reference summary only: raw curves, raw IES text, candela arrays, encoded/file artefacts, filenames, local paths, exact electrical values, and generation remain blocked.",
    ],
    failClosedDiagnostics: [],
  }));
}

export const buildSafeCurveReferenceSummary = buildRuntimeSafeCurveReferenceSummary;
export const buildEngineRunTableSafeCurveReferenceSummary = buildRuntimeSafeCurveReferenceSummary;

export const RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_CONTRACT_ID =
  "RUNTIME-SAFE-PHOTOMETRY-REFERENCE-SUMMARY-1";
export const RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.safe-photometry-reference-summary";
export const RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_STATE =
  "runtime_safe_photometry_reference_summary_diagnostic_only";

export const RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  opaqueReferenceOnly: true,
  sourceAnchorOnly: true,
  slugGenerationEnabled: false,
  iesGenerationEnabled: false,
  iesGenerated: false,
  outputGenerationEnabled: false,
  rawIesContentReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  filenamesReturned: false,
  localPathsReturned: false,
  selectedResultPersisted: false,
  runtimeDataMutationEnabled: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

const REQUIRED_PHOTOMETRY_LOCK_FIELDS = Object.freeze([
  "boardFamily",
  "pitchFamily",
  "opticCurrentAssumptions",
  "zoneSplitStrategy",
  "driverFamily",
]);

function safeReferenceToken(value) {
  const token = safeToken(value, "");
  return SAFE_TOKEN_PATTERN.test(token) ? token : "";
}

function photometryCurveSummaryFrom(source) {
  return firstPresent(source, [
    "safeCurveReferenceSummary",
    "curveReferenceSummary",
    "runtimeSafeCurveReferenceSummary",
  ]);
}

function photometryUnsafeTopLevelBlocker(source) {
  if (!isPlainObject(source)) return null;
  if (source.slugGenerationEnabled === true || source.slugGenerated === true || source.productionSlugGenerated === true) {
    return "slug-generation-not-approved";
  }
  if (source.outputGenerationEnabled === true || source.outputGenerated === true || source.artifactGenerationEnabled === true || source.artefactGenerationEnabled === true) {
    return "output-generation-not-approved";
  }
  if (source.rawIesContentReturned === true) return "raw-ies-content-not-approved";
  if (source.rawPhotometryReturned === true) return "raw-photometry-not-approved";
  if (source.candelaArraysReturned === true) return "candela-array-return-not-approved";
  if (source.base64ArtifactsReturned === true) return "base64-artifact-not-approved";
  if (source.filenamesReturned === true || source.localPathsReturned === true) return "filename-or-local-path-not-approved";
  if (source.runtimeDataMutationEnabled === true) return "runtime-data-mutation-not-approved";
  if (source.routesAdded === true || source.postEndpointsAdded === true) return "route-or-post-endpoint-not-approved";
  return null;
}

function sourceInputFingerprintFrom(source) {
  return safeFingerprint(firstPresent(source, ["sourceInputFingerprint", "source_input_fingerprint", "selectorPayloadFingerprint"])
    ?? firstPresent(source.sourceInputFingerprintMetadata, ["value", "fingerprint"]));
}

function boardDataSourceVersionFrom(source) {
  const value = firstPresent(source, ["boardDataSourceVersion", "board_data_source_version"])
    ?? firstPresent(source.boardDataSourceVersionMetadata, ["value", "version", "token"])
    ?? firstPresent(source.selectedResultProjectionSummary, ["boardDataSourceVersion"]);
  const token = safeReferenceToken(value);
  if (token) return token;
  const label = safeToken(value, "");
  return label ? `safe-board-data-source-version:${stableSha1({ label })}` : "";
}

function selectedFamilySubsetLockFrom(source) {
  const lock = firstPresent(source, ["selectedFamilySubsetLock", "selected_family_subset_lock"])
    ?? firstPresent(source.selectedResultProjectionSummary, ["selectedFamilySubsetLock"])
    ?? firstPresent(source.safeSelectedResultSourceObjectSummary, ["selectedFamilySubsetLock"]);
  if (!isPlainObject(lock)) return null;
  const result = {};
  for (const field of REQUIRED_PHOTOMETRY_LOCK_FIELDS) {
    const value = safeLabel(lock[field], "");
    if (!value) return null;
    result[field] = value;
  }
  return result;
}

function validateSafeCurveForPhotometryAnchor(summary) {
  if (!isPlainObject(summary)) return { ok: false, blocker: "missing-safe-curve-reference-summary" };
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe };
  if (summary.ok !== true
    || summary.curveReferenceSummaryReady !== true
    || summary.readOnly !== true
    || summary.diagnosticOnly !== true
    || summary.safeSummaryOnly !== true) {
    return { ok: false, blocker: "safe-curve-reference-summary-not-ready" };
  }
  const iesSummary = isPlainObject(summary.iesPhotometryReferenceSummary) ? summary.iesPhotometryReferenceSummary : {};
  const lumenSummary = isPlainObject(summary.lumenCurveReferenceSummary) ? summary.lumenCurveReferenceSummary : {};
  const driverSummary = isPlainObject(summary.driverUtilCurveReferenceSummary) ? summary.driverUtilCurveReferenceSummary : {};
  const iesPhotometryReferenceToken = safeReferenceToken(iesSummary.iesPhotometryReferenceToken);
  const lumenCurveReferenceToken = safeReferenceToken(lumenSummary.curveReferenceToken);
  const driverUtilCurveReferenceToken = safeReferenceToken(driverSummary.curveReferenceToken);
  if (!iesPhotometryReferenceToken || !lumenCurveReferenceToken || !driverUtilCurveReferenceToken) {
    return { ok: false, blocker: "missing-opaque-photometry-reference-token" };
  }
  if (iesSummary.rawIesContentReturned === true
    || iesSummary.rawPhotometryReturned === true
    || iesSummary.candelaArraysReturned === true
    || iesSummary.base64ArtifactsReturned === true
    || iesSummary.filenamesReturned === true
    || iesSummary.localPathsReturned === true
    || iesSummary.iesGenerated === true) {
    return { ok: false, blocker: "unsafe-photometry-reference-token-summary" };
  }
  return {
    ok: true,
    iesSummary,
    lumenSummary,
    driverSummary,
    iesPhotometryReferenceToken,
    lumenCurveReferenceToken,
    driverUtilCurveReferenceToken,
    oneMmPolicyLabel: safeToken(iesSummary.oneMmPolicyLabel, "one-mm-length-policy-summary-only"),
  };
}

function photometryUnsafeOutputsBlocked() {
  return {
    slugGenerationBlocked: true,
    iesGenerationBlocked: true,
    outputGenerationBlocked: true,
    rawIesContentBlocked: true,
    rawPhotometryBlocked: true,
    candelaArraysBlocked: true,
    base64ArtifactsBlocked: true,
    filenamesBlocked: true,
    localPathsBlocked: true,
    selectedResultPersistenceBlocked: true,
    runtimeDataMutationBlocked: true,
    routesBlocked: true,
    postEndpointsBlocked: true,
  };
}

function photometryBaseSummary(extra = {}) {
  const ok = extra.ok === true;
  return {
    contractId: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_CONTRACT_ID,
    schemaId: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_VERSION,
    state: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_STATE,
    ok,
    blocker: extra.blocker || null,
    photometryReferenceSummaryReady: ok,
    sourcePhotometryStatus: extra.sourcePhotometryStatus || (ok ? "opaque_reference_summary_ready" : "opaque_reference_summary_blocked"),
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    opaqueReferenceOnly: true,
    sourceAnchorOnly: true,
    sourceBacked: extra.sourceBacked === true,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    sourceInputFingerprint: extra.sourceInputFingerprint || null,
    boardDataSourceVersion: extra.boardDataSourceVersion || null,
    selectedFamilySubsetLock: extra.selectedFamilySubsetLock || null,
    oneMmPolicyLabel: extra.oneMmPolicyLabel || null,
    sourcePhotometryRef: extra.sourcePhotometryRef || null,
    iesPhotometryReferenceToken: extra.iesPhotometryReferenceToken || null,
    lumenCurveReferenceSummary: extra.lumenCurveReferenceSummary || null,
    driverUtilCurveReferenceSummary: extra.driverUtilCurveReferenceSummary || null,
    photometryReferenceFingerprint: extra.photometryReferenceFingerprint || null,
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeToken(diagnostic, "diagnostic"))
      : [],
    unsafeOutputsBlocked: photometryUnsafeOutputsBlocked(),
    slugGenerationEnabled: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    filenamesReturned: false,
    localPathsReturned: false,
    selectedResultPersisted: false,
    runtimeDataMutationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SAFETY_FLAGS),
  };
}

function photometryFailClosed(blocker, extra = {}) {
  return finalizePhotometrySummary(photometryBaseSummary({
    ...extra,
    ok: false,
    blocker,
    sourceBacked: false,
    failClosedDiagnostics: [blocker, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  }));
}

function finalizePhotometrySummary(summary) {
  const serialized = JSON.stringify(summary);
  if (PRIVATE_PATH_PATTERN.test(serialized)
    || RAW_IES_TEXT_PATTERN.test(serialized)
    || DATA_BASE64_PATTERN.test(serialized)
    || FILE_EXTENSION_VALUE_PATTERN.test(serialized)) {
    if (summary.blocker === "unsafe-photometry-reference-summary-output") return Object.freeze(summary);
    return Object.freeze(photometryBaseSummary({
      ok: false,
      blocker: "unsafe-photometry-reference-summary-output",
      sourceFingerprint: summary.sourceFingerprint,
      policyFingerprint: summary.policyFingerprint,
      failClosedDiagnostics: ["unsafe-photometry-reference-summary-output"],
    }));
  }
  return Object.freeze(summary);
}

export function buildRuntimeSafePhotometryReferenceSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const photometryTopLevelBlocker = photometryUnsafeTopLevelBlocker(source);
  if (photometryTopLevelBlocker) return photometryFailClosed(photometryTopLevelBlocker);
  const inputBlocker = unsafeBlocker(source);
  if (inputBlocker) return photometryFailClosed(inputBlocker);

  const safeCurveReferenceSummary = photometryCurveSummaryFrom(source);
  const curveValidation = validateSafeCurveForPhotometryAnchor(safeCurveReferenceSummary);
  if (!curveValidation.ok) return photometryFailClosed(curveValidation.blocker);

  const sourceFingerprint = sourceFingerprintFrom(source) || sourceFingerprintFrom(safeCurveReferenceSummary);
  if (!sourceFingerprint) return photometryFailClosed("missing-source-fingerprint");

  const sourceInputFingerprint = sourceInputFingerprintFrom(source);
  if (!sourceInputFingerprint) return photometryFailClosed("missing-source-input-fingerprint", { sourceFingerprint });

  const boardDataSourceVersion = boardDataSourceVersionFrom(source);
  if (!boardDataSourceVersion) return photometryFailClosed("missing-board-data-source-version", {
    sourceFingerprint,
    sourceInputFingerprint,
  });

  const selectedFamilySubsetLock = selectedFamilySubsetLockFrom(source);
  if (!selectedFamilySubsetLock) return photometryFailClosed("missing-selected-family-subset-lock", {
    sourceFingerprint,
    sourceInputFingerprint,
    boardDataSourceVersion,
  });

  const policyFingerprint = providedPolicyFingerprintFrom(source)
    || providedPolicyFingerprintFrom(safeCurveReferenceSummary)
    || `safe-policy:${stableSha1({
      contractId: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_CONTRACT_ID,
      sourceFingerprint,
      sourceInputFingerprint,
      boardDataSourceVersion,
      selectedFamilySubsetLock,
    })}`;
  const oneMmPolicyLabel = safeToken(firstPresent(source, ["oneMmPolicyLabel", "one_mm_policy_label"]), "")
    || curveValidation.oneMmPolicyLabel;
  const sourcePhotometryRef = `safe-source-photometry-ref:${stableSha1({
    contractId: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_CONTRACT_ID,
    sourceFingerprint,
    sourceInputFingerprint,
    boardDataSourceVersion,
    selectedFamilySubsetLock,
    oneMmPolicyLabel,
    iesPhotometryReferenceToken: curveValidation.iesPhotometryReferenceToken,
    lumenCurveReferenceToken: curveValidation.lumenCurveReferenceToken,
    driverUtilCurveReferenceToken: curveValidation.driverUtilCurveReferenceToken,
  })}`;
  const lumenCurveReferenceSummary = Object.freeze({
    curveReferenceToken: curveValidation.lumenCurveReferenceToken,
    referenceKind: safeToken(curveValidation.lumenSummary.referenceKind, "lumen-curve-reference"),
    sourceBacked: curveValidation.lumenSummary.sourceBacked === true,
    manifestValid: curveValidation.lumenSummary.manifestValid === true,
    rawCurveRowsReturned: false,
    rawCurvePayloadsExposed: false,
    filenamesReturned: false,
    localPathsReturned: false,
  });
  const driverUtilCurveReferenceSummary = Object.freeze({
    curveReferenceToken: curveValidation.driverUtilCurveReferenceToken,
    referenceKind: safeToken(curveValidation.driverSummary.referenceKind, "driver-util-curve-reference"),
    sourceBacked: curveValidation.driverSummary.sourceBacked === true,
    manifestValid: curveValidation.driverSummary.manifestValid === true,
    rawDriverUtilPayloadsExposed: false,
    rawDriverUtilCurvePointsReturned: false,
    filenamesReturned: false,
    localPathsReturned: false,
  });
  const photometryReferenceFingerprint = `safe-photometry-reference:${stableSha1({
    contractId: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_CONTRACT_ID,
    schemaId: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_VERSION,
    sourceFingerprint,
    policyFingerprint,
    sourceInputFingerprint,
    boardDataSourceVersion,
    selectedFamilySubsetLock,
    oneMmPolicyLabel,
    sourcePhotometryRef,
    iesPhotometryReferenceToken: curveValidation.iesPhotometryReferenceToken,
    lumenCurveReferenceSummary,
    driverUtilCurveReferenceSummary,
  })}`;

  return finalizePhotometrySummary(photometryBaseSummary({
    ok: true,
    sourceBacked: true,
    policyFingerprint,
    sourceFingerprint,
    sourceInputFingerprint,
    boardDataSourceVersion,
    selectedFamilySubsetLock,
    oneMmPolicyLabel,
    sourcePhotometryRef,
    iesPhotometryReferenceToken: curveValidation.iesPhotometryReferenceToken,
    lumenCurveReferenceSummary,
    driverUtilCurveReferenceSummary,
    photometryReferenceFingerprint,
    failClosedDiagnostics: [],
  }));
}

export const buildRuntimeSafePhotometrySourceAnchorSummary = buildRuntimeSafePhotometryReferenceSummary;
export const buildSafePhotometryReferenceSummary = buildRuntimeSafePhotometryReferenceSummary;
