import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.ies-handoff-readiness-scaffold-summary";
export const ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_STATE =
  "runtime_ies_handoff_readiness_scaffold_diagnostic_only";

export const ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  selectedResultHandoffScaffoldRequired: true,
  runTableDomainOutputScaffoldRequired: true,
  sealedCandidateAssemblyPreviewRequired: true,
  gateDValidationScaffoldRequired: true,
  safeDraftProjectEnvelopePreviewOptional: true,
  curveReferencesOptional: true,
  curveReferencesSummaryOnly: true,
  rawIesContentReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  rawProductRowsReturned: false,
  rawSelectorPayloadReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  exactElectricalValuesReturned: false,
  donorEngineInvoked: false,
  donorEngineInvocationEnabled: false,
  runtimeDataMutationEnabled: false,
  selectedResultPersistenceEnabled: false,
  selectedResultPersistenceAttempted: false,
  productionRunTableGenerationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  photometryGenerationEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  staleResultComparisonEnabled: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|\bControlStack(?:_Runtime|_RuntimeData)?[\\/])/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT=|\[[A-Z0-9_ -]{2,}\]\s+|\.ies\b)/i;
const BASE64_TEXT_PATTERN = /(?:data:[^\s]+;base64|\bbase64\b)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,560}$/;

const REQUIRED_SUMMARIES = Object.freeze([
  {
    key: "selectedResultHandoffScaffoldSummary",
    label: "selected-result handoff scaffold summary",
    missing: "missing-selected-result-handoff-scaffold-summary",
    notReady: "selected-result-handoff-scaffold-not-ready",
    readyKey: "selectedResultHandoffScaffoldReady",
    fingerprintKeys: ["selectedResultHandoffScaffoldFingerprint"],
  },
  {
    key: "runTableDomainOutputScaffoldSummary",
    label: "RunTable domain output scaffold summary",
    missing: "missing-runtable-domain-output-scaffold-summary",
    notReady: "runtable-domain-output-scaffold-not-ready",
    readyKey: "runTableDomainOutputScaffoldReady",
    fingerprintKeys: ["runTableDomainOutputScaffoldFingerprint"],
  },
  {
    key: "sealedCandidateAssemblyPreviewSummary",
    label: "sealed candidate assembly preview summary",
    missing: "missing-sealed-candidate-assembly-preview-summary",
    notReady: "sealed-candidate-assembly-preview-not-ready",
    readyKey: "sealedCandidateAssemblyPreviewReady",
    fingerprintKeys: ["sealedCandidateAssemblyPreviewFingerprint"],
  },
  {
    key: "gateDValidationScaffoldSummary",
    label: "Gate D validation scaffold summary",
    missing: "missing-gate-d-validation-scaffold-summary",
    notReady: "gate-d-validation-scaffold-not-ready",
    readyKey: "gateDScaffoldReady",
    fingerprintKeys: ["gateDValidationScaffoldFingerprint"],
  },
]);

const OPTIONAL_REFERENCE_SUMMARIES = Object.freeze([
  {
    key: "selectedResultProjectionSummary",
    label: "selected-result projection summary",
    unsafe: "unsafe-selected-result-projection-summary",
    fingerprintKeys: ["selectedResultProjectionFingerprint", "projectionFingerprint", "sourceInputFingerprint"],
  },
  {
    key: "safeDraftProjectEnvelopePreviewSummary",
    label: "safe draft/project envelope preview summary",
    unsafe: "unsafe-safe-draft-project-envelope-summary",
    readyKey: "safeDraftProjectEnvelopePreviewReady",
    fingerprintKeys: ["envelopeFingerprint", "safeDraftProjectEnvelopePreviewFingerprint"],
  },
  {
    key: "curveLookupSummary",
    label: "curve lookup summary",
    unsafe: "curve-reference-not-safe",
    fingerprintKeys: ["curveLookupFingerprint", "curveReferenceFingerprint", "summaryFingerprint", "fingerprint"],
  },
  {
    key: "curveParseInterpolationSummary",
    label: "curve parse/interpolation summary",
    unsafe: "curve-reference-not-safe",
    fingerprintKeys: ["curveParseInterpolationFingerprint", "curveInterpolationFingerprint", "summaryFingerprint", "fingerprint"],
  },
  {
    key: "safeCurveReferenceSummary",
    label: "safe curve reference summary",
    unsafe: "curve-reference-not-safe",
    readyKey: "curveReferenceSummaryReady",
    fingerprintKeys: ["curveReferenceFingerprint", "summaryFingerprint", "fingerprint"],
  },
]);

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:rawIesContentReturned|rawIESContentReturned|rawIesReturned|rawIESReturned|rawIesExposed|rawIESExposed|iesContentReturned|iesTextReturned|iesFileReturned)$/i, "raw-ies-content-not-approved"],
  [/^(?:rawPhotometryReturned|rawPhotometryExposed|photometryReturned|photometryExposed|photometryFileReturned|photometryGridReturned|rawPhotometricGridReturned)$/i, "raw-photometry-not-approved"],
  [/^(?:candelaArraysReturned|candelaArrayReturned|candelaArraysExposed|candelaReturned|candelaGridReturned|rawCandelaGridReturned|rawCandelaReturned)$/i, "candela-array-return-not-approved"],
  [/^(?:base64ArtifactsReturned|base64ArtefactsReturned|base64ArtifactReturned|base64ArtefactReturned|base64Returned|fileArtifactsReturned|fileArtefactsReturned|artifactReturned|artefactReturned|pdfReturned|polarPlotReturned)$/i, "base64-artifact-not-approved"],
  [/^(?:rawEngineResultReturned|rawEngineResultExposed|engineResultReturned|engineResultExposed|rawResultReturned|raw_result_returned)$/i, "raw-engine-result-not-approved"],
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|enginePayloadReturned|enginePayloadExposed|enginePayloadIncluded|rawRoughElectricalPayloadReturned|rawRoughElectricalPayloadExposed|roughElectricalPayloadReturned|roughElectricalPayloadAssemblyEnabled|donorEnginePayloadAssemblyEnabled)$/i, "raw-engine-payload-not-approved"],
  [/^(?:rawSelectorPayloadReturned|rawSelectorPayloadExposed|selectorPayloadReturned|selectorPayloadExposed|payloadGenerationEnabled|downstreamPayloadActive)$/i, "raw-selector-payload-not-approved"],
  [/^(?:rawProductRowsReturned|rawProductRowsExposed|rawProductDataRowsExposed|rawRowsReturned|rawRowsExposed|rawBoardRowsReturned|rawDriverRowsReturned|rawAccessoryRowsReturned|rawComponentRowsReturned|rawSourceDbRowsExposed|rawBoardDataRowsExposed)$/i, "raw-product-rows-not-approved"],
  [/^(?:exactElectricalValuesReturned|exactElectricalValuesExposed|exactVoltageReturned|exactPowerReturned|exactCurrentReturned|exactVfReturned|exactWattsReturned)$/i, "exact-electrical-values-not-approved"],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled|selectedResultPersistenceAttempted|selectedResultStorageEnabled|saveLoadActive|hiddenWriteBackEnabled)$/i, "selected-result-persistence-not-approved"],
  [/^(?:productionRunTableGenerated|productionRunTableGenerationEnabled|runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableGenerationAttempted|runTableMutationEnabled)$/i, "production-runtable-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled|photometryGenerationAllowed|photometryGenerationEnabled|iesCallsActive)$/i, "ies-generation-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineExecutionAttempted|engineCallsActive)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAuthority|boardDataMutationEnabled|authorityWritesActive|activeBuildMutationEnabled|buildMutationEnabled)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "route-or-post-endpoint-not-approved"],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:ies|iesText|rawIesText|rawIESText|iesContent|rawIesContent|generatedIes|generatedIES|iesFile|lm63|lm63Text)$/i, "raw-ies-content-not-approved"],
  [/^(?:photometry|rawPhotometry|photometryGrid|photometricGrid|rawPhotometricGrid|photometryFile|polarDistribution)$/i, "raw-photometry-not-approved"],
  [/^(?:candela|candelaGrid|candelaArray|candelaArrays|rawCandela|rawCandelaGrid|candelaMatrix)$/i, "candela-array-return-not-approved"],
  [/^(?:base64|base64Artifact|base64Artefact|base64Artifacts|base64Artefacts|fileArtifact|fileArtefact|fileArtifacts|fileArtefacts|pdf|pdfRef|polarPlot)$/i, "base64-artifact-not-approved"],
  [/^(?:engineResult|engine_result|rawEngineResult|raw_engine_result|rawResult|raw_result|resultBody)$/i, "raw-engine-result-not-approved"],
  [/^(?:enginePayload|rawEnginePayload|runEnginePayload|roughElectricalPayload|rawRoughElectricalPayload|donorPayload|rawDonorPayload)$/i, "raw-engine-payload-not-approved"],
  [/^(?:selectorPayload|rawSelectorPayload|selectorEnginePayload|payloadDraft|fullSelectorState)$/i, "raw-selector-payload-not-approved"],
  [/^(?:PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|SYSTEM_POLICY|SYSTEM_COMPONENTS|rawRows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|rawComponentRows|productRows|boardRows|driverRows|accessoryRows|sourceRows|rawSourceRows|rawSourceDbRows)$/i, "raw-product-rows-not-approved"],
  [/^(?:electricalValues|exactElectricalValues|exactVoltage|exactPower|exactCurrent|exactVf|exactWatts)$/i, "exact-electrical-values-not-approved"],
]);

const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|filepath|sourcePath|donorPath|runtimeDataPath|privatePath|path|filename|fileName)$/i;

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
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || BASE64_TEXT_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 180) : fallback;
}

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || BASE64_TEXT_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return token || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || BASE64_TEXT_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 580);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function policyFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
}

function sourceFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function summaryFingerprint(summary, spec = {}) {
  if (!isPlainObject(summary)) return null;
  const fingerprint = safeFingerprint(firstPresent(summary, [
    ...(Array.isArray(spec.fingerprintKeys) ? spec.fingerprintKeys : []),
    "iesHandoffReadinessScaffoldFingerprint",
    "selectedResultHandoffScaffoldFingerprint",
    "runTableDomainOutputScaffoldFingerprint",
    "sealedCandidateAssemblyPreviewFingerprint",
    "gateDValidationScaffoldFingerprint",
    "selectedResultProjectionFingerprint",
    "envelopeFingerprint",
    "curveLookupFingerprint",
    "curveParseInterpolationFingerprint",
    "sourceInputFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]));
  return fingerprint || null;
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "base64-artifact-not-approved";
    if (BASE64_TEXT_PATTERN.test(value)) return "base64-artifact-not-approved";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "raw-ies-content-not-approved";
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
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "base64-artifact-not-approved";
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function buildUpstreamFingerprints(source) {
  const pairs = [...REQUIRED_SUMMARIES, ...OPTIONAL_REFERENCE_SUMMARIES].map((spec) => [
    spec.key,
    summaryFingerprint(source[spec.key], spec),
  ]);
  return Object.fromEntries(pairs);
}

function resolveFingerprints(source) {
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || REQUIRED_SUMMARIES.map((spec) => policyFingerprintFrom(source[spec.key])).find(Boolean)
    || OPTIONAL_REFERENCE_SUMMARIES.map((spec) => policyFingerprintFrom(source[spec.key])).find(Boolean)
    || null;
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || REQUIRED_SUMMARIES.map((spec) => sourceFingerprintFrom(source[spec.key])).find(Boolean)
    || OPTIONAL_REFERENCE_SUMMARIES.map((spec) => sourceFingerprintFrom(source[spec.key])).find(Boolean)
    || null;
  if (!policyFingerprint || !sourceFingerprint) {
    return {
      ok: false,
      blocker: "fingerprint-mismatch",
      diagnostic: "Safe policy and source fingerprints are required before IES handoff readiness diagnostics.",
      policyFingerprint,
      sourceFingerprint,
    };
  }
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function validateFingerprintMatch(summary, policyFingerprint, sourceFingerprint, label) {
  const ownPolicy = policyFingerprintFrom(summary);
  const ownSource = sourceFingerprintFrom(summary);
  if ((ownPolicy && ownPolicy !== policyFingerprint) || (ownSource && ownSource !== sourceFingerprint)) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${label} fingerprint does not match the IES handoff readiness scaffold fingerprints.` };
  }
  if (ownPolicy && !ownSource) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${label} has a policy fingerprint without a matching source fingerprint.` };
  }
  if (ownSource && !ownPolicy) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${label} has a source fingerprint without a matching policy fingerprint.` };
  }
  return { ok: true };
}

function validateRequiredSummary(spec, summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} is required.` };
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: `${spec.label} contains an unsafe raw IES, photometry, candela, base64/file artefact, raw payload, exact electrical, persistence, generation, route, endpoint, donor Engine, or RuntimeData mutation marker.` };
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: spec.notReady, diagnostic: `${spec.label} must be an ok runtime-native diagnostic-only safe summary.` };
  }
  const fingerprintCheck = validateFingerprintMatch(summary, policyFingerprint, sourceFingerprint, spec.label);
  if (!fingerprintCheck.ok) return fingerprintCheck;
  if (summary[spec.readyKey] !== true) {
    return { ok: false, blocker: spec.notReady, diagnostic: `${spec.label} is not ready: ${spec.readyKey} is not true.` };
  }
  return { ok: true };
}

function validateOptionalReferenceSummary(spec, summary, policyFingerprint, sourceFingerprint) {
  if (summary === undefined || summary === null) return { ok: true, supplied: false };
  if (!isPlainObject(summary)) return { ok: false, blocker: spec.unsafe, diagnostic: `${spec.label} must be a safe summary object when supplied.` };
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: `${spec.label} contains unsafe IES, photometry, candela, base64/file artefact, raw payload, exact electrical, persistence, generation, route, endpoint, donor Engine, or mutation markers.` };
  if (summary.ok === false || summary.safe === false || summary.summaryOnly === false || summary.safeSummaryOnly === false) {
    return { ok: false, blocker: spec.unsafe, diagnostic: `${spec.label} is not marked as a safe summary-only reference.` };
  }
  if (spec.readyKey && summary[spec.readyKey] !== true) {
    return { ok: false, blocker: spec.unsafe, diagnostic: `${spec.label}.${spec.readyKey} must be true when supplied.` };
  }
  if (spec.key === "selectedResultProjectionSummary") {
    const flags = isPlainObject(summary.safetyFlags) ? summary.safetyFlags : {};
    if (summary.readOnly === false || summary.displayOnly === false || flags.readOnly === false || flags.displayOnly === false) {
      return { ok: false, blocker: spec.unsafe, diagnostic: "Selected-result projection summary must remain read-only and display-only." };
    }
  }
  const fingerprintCheck = validateFingerprintMatch(summary, policyFingerprint, sourceFingerprint, spec.label);
  if (!fingerprintCheck.ok) return fingerprintCheck;
  return { ok: true, supplied: true };
}

function validateBlockedGeneration(source) {
  const unsafe = unsafeBlocker({
    ...source,
    selectedResultHandoffScaffoldSummary: undefined,
    runTableDomainOutputScaffoldSummary: undefined,
    sealedCandidateAssemblyPreviewSummary: undefined,
    gateDValidationScaffoldSummary: undefined,
    selectedResultProjectionSummary: undefined,
    safeDraftProjectEnvelopePreviewSummary: undefined,
    curveLookupSummary: undefined,
    curveParseInterpolationSummary: undefined,
  });
  if (unsafe) {
    return { ok: false, blocker: unsafe, diagnostic: "IES handoff readiness input contains unsafe top-level raw IES, photometry, candela, base64/file artefact, raw payload, exact electrical, persistence, generation, route, endpoint, donor Engine, or RuntimeData mutation markers." };
  }
  return { ok: true };
}

function selectedProjectionState(summary) {
  return safeToken(firstPresent(summary, ["state", "resultState", "sourceState"]), "unknown").replace(/-/g, "_");
}

function buildIesReadinessSummary(extra = {}) {
  return {
    diagnosticOnly: true,
    iesHandoffReadinessScaffoldReady: extra.ready === true,
    selectedResultHandoffReady: extra.selectedResultHandoffReady === true,
    runTableDomainOutputReady: extra.runTableDomainOutputReady === true,
    sealedCandidateAssemblyReady: extra.sealedCandidateAssemblyReady === true,
    gateDScaffoldReady: extra.gateDScaffoldReady === true,
    safeDraftProjectEnvelopeReady: extra.safeDraftProjectEnvelopeReady === true,
    curveLookupReferenceReady: extra.curveLookupReferenceReady === true,
    curveParseInterpolationReferenceReady: extra.curveParseInterpolationReferenceReady === true,
    safeCurveReferenceSummaryReady: extra.safeCurveReferenceSummaryReady === true,
    curveReferenceSummaryReady: extra.safeCurveReferenceSummaryReady === true,
    readyForFutureIesHandoff: extra.ready === true,
    iesGenerationReady: false,
    iesGenerated: false,
    rawIesContentReady: false,
    lm63OutputReady: false,
    donorEngineReady: false,
    routeReady: false,
    postEndpointReady: false,
    reason: extra.reason || (extra.ready === true
      ? "safe-ies-handoff-readiness-only-generation-blocked"
      : "ies-handoff-readiness-scaffold-not-ready"),
  };
}

function buildPhotometryReadinessSummary(extra = {}) {
  return {
    diagnosticOnly: true,
    summaryOnlyReferences: true,
    curveLookupReferenceSupplied: extra.curveLookupReferenceSupplied === true,
    curveParseInterpolationReferenceSupplied: extra.curveParseInterpolationReferenceSupplied === true,
    safeCurveReferenceSummarySupplied: extra.safeCurveReferenceSummarySupplied === true,
    curveLookupReferenceReady: extra.curveLookupReferenceReady === true,
    curveParseInterpolationReferenceReady: extra.curveParseInterpolationReferenceReady === true,
    safeCurveReferenceSummaryReady: extra.safeCurveReferenceSummaryReady === true,
    curveReferenceSummaryReady: extra.safeCurveReferenceSummaryReady === true,
    photometryReferenceReady: extra.ready === true,
    rawPhotometryReady: false,
    candelaArraysReady: false,
    photometryFileReady: false,
    base64ArtifactReady: false,
    photometryGenerationReady: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    rawIesContentReturned: false,
    reason: extra.reason || "photometry-and-candela-content-blocked-summary-references-only",
  };
}

function buildSelectedResultReadinessSummary(source, extra = {}) {
  const handoff = source.selectedResultHandoffScaffoldSummary || {};
  const projection = source.selectedResultProjectionSummary || {};
  const handoffSummary = handoff.handoffReadinessSummary || {};
  return {
    diagnosticOnly: true,
    selectedResultHandoffScaffoldReady: handoff.selectedResultHandoffScaffoldReady === true,
    selectedResultProjectionSupplied: isPlainObject(projection),
    selectedResultProjectionState: selectedProjectionState(projection),
    selectedResultAvailable: projection.selectedResultAvailable === true || handoffSummary.selectedResultProjectionReady === true,
    selectedResultPersistenceReady: false,
    selectedResultPersisted: false,
    selectedResultBodyReturned: false,
    rawSelectedPayloadReturned: false,
    staleComparisonReady: false,
    staleComparisonBlocker: "stale-comparison-not-implemented",
    reason: extra.reason || "selected-result-safe-handoff-ready-persistence-blocked",
  };
}

function buildRunTableDomainReadinessSummary(source, extra = {}) {
  const runTable = source.runTableDomainOutputScaffoldSummary || {};
  const domain = runTable.runTableDomainReadinessSummary || {};
  return {
    diagnosticOnly: true,
    runTableDomainOutputScaffoldReady: runTable.runTableDomainOutputScaffoldReady === true,
    domainOutputReady: domain.domainOutputReady === true || domain.runTableDomainOutputScaffoldReady === true,
    productionRunTableReady: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    donorEnginePayloadReady: false,
    donorEngineReady: false,
    rawEnginePayloadReturned: false,
    exactElectricalValuesReturned: false,
    reason: extra.reason || "runtable-domain-summary-ready-production-runtable-blocked",
  };
}

function buildBlockedGenerationSummary(blocker = null) {
  return {
    diagnosticOnly: true,
    blocked: true,
    blocker,
    rawIesContentBlocked: true,
    rawPhotometryBlocked: true,
    candelaArraysBlocked: true,
    base64ArtifactsBlocked: true,
    selectedResultPersistenceBlocked: true,
    productionRunTableGenerationBlocked: true,
    runTableGenerationBlocked: true,
    iesGenerationBlocked: true,
    donorEngineInvocationBlocked: true,
    runtimeDataMutationBlocked: true,
    exactElectricalValuesBlocked: true,
    rawEnginePayloadBlocked: true,
    rawEngineResultBlocked: true,
    rawSelectorPayloadBlocked: true,
    rawProductRowsBlocked: true,
    routesBlocked: true,
    postEndpointsBlocked: true,
    reason: blocker || "readiness-only-generation-and-raw-outputs-blocked",
  };
}

function baseSummary(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return {
    schemaId: ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok,
    blocker,
    iesHandoffReadinessScaffoldReady: ok,
    iesReadinessSummary: extra.iesReadinessSummary || buildIesReadinessSummary({ reason: blocker || null }),
    photometryReadinessSummary: extra.photometryReadinessSummary || buildPhotometryReadinessSummary({ reason: blocker || null }),
    selectedResultReadinessSummary: extra.selectedResultReadinessSummary || {
      diagnosticOnly: true,
      selectedResultHandoffScaffoldReady: false,
      selectedResultPersistenceReady: false,
      reason: blocker || "selected-result-readiness-not-ready",
    },
    runTableDomainReadinessSummary: extra.runTableDomainReadinessSummary || {
      diagnosticOnly: true,
      runTableDomainOutputScaffoldReady: false,
      productionRunTableReady: false,
      reason: blocker || "runtable-domain-readiness-not-ready",
    },
    blockedGenerationSummary: extra.blockedGenerationSummary || buildBlockedGenerationSummary(blocker),
    staleState: extra.staleState || "not_compared_fail_closed",
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    upstreamFingerprints: isPlainObject(extra.upstreamFingerprints) ? extra.upstreamFingerprints : {},
    iesHandoffReadinessScaffoldFingerprint: extra.iesHandoffReadinessScaffoldFingerprint || null,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseSummary({
    ...extra,
    ok: false,
    blocker,
    blockedGenerationSummary: buildBlockedGenerationSummary(blocker),
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

export function buildRuntimeIesHandoffReadinessScaffoldSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const fingerprintValidation = resolveFingerprints(source);
  const policyFingerprint = fingerprintValidation.policyFingerprint
    || safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || null;
  const sourceFingerprint = fingerprintValidation.sourceFingerprint
    || safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || null;
  const upstreamFingerprints = buildUpstreamFingerprints(source);

  const topLevelValidation = validateBlockedGeneration(source);
  if (!topLevelValidation.ok) {
    return failClosed(topLevelValidation.blocker, topLevelValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  if (!fingerprintValidation.ok) {
    return failClosed(fingerprintValidation.blocker, fingerprintValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  for (const spec of REQUIRED_SUMMARIES) {
    const validation = validateRequiredSummary(spec, source[spec.key], policyFingerprint, sourceFingerprint);
    if (!validation.ok) {
      return failClosed(validation.blocker, validation.diagnostic, {
        policyFingerprint,
        sourceFingerprint,
        upstreamFingerprints,
        iesReadinessSummary: buildIesReadinessSummary({ reason: validation.blocker }),
      });
    }
  }

  const optionalStates = {};
  for (const spec of OPTIONAL_REFERENCE_SUMMARIES) {
    const validation = validateOptionalReferenceSummary(spec, source[spec.key], policyFingerprint, sourceFingerprint);
    optionalStates[spec.key] = validation;
    if (!validation.ok) {
      return failClosed(validation.blocker, validation.diagnostic, {
        policyFingerprint,
        sourceFingerprint,
        upstreamFingerprints,
        iesReadinessSummary: buildIesReadinessSummary({ reason: validation.blocker }),
        photometryReadinessSummary: buildPhotometryReadinessSummary({ reason: validation.blocker }),
      });
    }
  }

  const safeDraftSupplied = optionalStates.safeDraftProjectEnvelopePreviewSummary?.supplied === true;
  const curveLookupSupplied = optionalStates.curveLookupSummary?.supplied === true;
  const curveParseSupplied = optionalStates.curveParseInterpolationSummary?.supplied === true;
  const safeCurveReferenceSupplied = optionalStates.safeCurveReferenceSummary?.supplied === true;

  const iesReadinessSummary = buildIesReadinessSummary({
    ready: true,
    selectedResultHandoffReady: true,
    runTableDomainOutputReady: true,
    sealedCandidateAssemblyReady: true,
    gateDScaffoldReady: true,
    safeDraftProjectEnvelopeReady: safeDraftSupplied,
    curveLookupReferenceReady: curveLookupSupplied,
    curveParseInterpolationReferenceReady: curveParseSupplied,
    safeCurveReferenceSummaryReady: safeCurveReferenceSupplied,
  });
  const photometryReadinessSummary = buildPhotometryReadinessSummary({
    ready: true,
    curveLookupReferenceSupplied: curveLookupSupplied,
    curveParseInterpolationReferenceSupplied: curveParseSupplied,
    safeCurveReferenceSummarySupplied: safeCurveReferenceSupplied,
    curveLookupReferenceReady: curveLookupSupplied,
    curveParseInterpolationReferenceReady: curveParseSupplied,
    safeCurveReferenceSummaryReady: safeCurveReferenceSupplied,
  });
  const selectedResultReadinessSummary = buildSelectedResultReadinessSummary(source);
  const runTableDomainReadinessSummary = buildRunTableDomainReadinessSummary(source);
  const blockedGenerationSummary = buildBlockedGenerationSummary(null);
  const staleState = "not_compared_fail_closed";

  const fingerprintPayload = {
    schemaId: ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_VERSION,
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    iesReadinessSummary,
    photometryReadinessSummary,
    selectedResultReadinessSummary,
    runTableDomainReadinessSummary,
    staleState,
  };
  const iesHandoffReadinessScaffoldFingerprint = `safe-ies-handoff-readiness-scaffold:${stableSha1(fingerprintPayload)}`;

  return baseSummary({
    ok: true,
    iesReadinessSummary,
    photometryReadinessSummary,
    selectedResultReadinessSummary,
    runTableDomainReadinessSummary,
    blockedGenerationSummary,
    staleState,
    warnings: [
      "Diagnostic-only IES handoff readiness scaffold: safe upstream summaries indicate readiness for a future IES handoff, but IES generation remains blocked.",
      "Photometry, candela arrays, raw IES content, base64/file artefacts, exact electrical values, raw Engine payloads/results, and raw Selector payloads are not returned.",
      "Selected-result persistence, production RunTable generation, donor Engine invocation, RuntimeData mutation, routes, and POST endpoints remain disabled.",
      "Stale comparison is not implemented; staleState is not_compared_fail_closed until a future safe comparison exists.",
    ],
    failClosedDiagnostics: ["stale-comparison-not-implemented"],
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    iesHandoffReadinessScaffoldFingerprint,
  });
}

export const buildRuntimeNativeIesHandoffReadinessScaffoldSummary = buildRuntimeIesHandoffReadinessScaffoldSummary;
export const buildEngineRunTableIesHandoffReadinessScaffoldStatus = buildRuntimeIesHandoffReadinessScaffoldSummary;
