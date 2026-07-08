import { createHash } from "node:crypto";

export const RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_CONTRACT_ID = "RUNTIME-IES-SOURCE-PHOTOMETRY-REF-HANDOFF-1";
export const RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_ID = "controlstack.runtime.ies-source-photometry-ref-handoff-summary";
export const RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_VERSION = 1;
export const RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_STATE = "runtime_ies_source_photometry_ref_handoff_diagnostic_only";

const SAFE_SOURCE_PHOTOMETRY_REF_PATTERN = /^safe-source-photometry-ref:[0-9a-f]{40}$/;
const PRIVATE_PATH_PATTERN = /[A-Za-z]:\\|\\ControlStack\\|\/ControlStack\b|ControlStack_RuntimeData/i;
const RAW_IES_TEXT_PATTERN = /IESNA:|TILT=/i;
const DATA_BASE64_PATTERN = /data:[^\s"']*base64|base64,/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json)(?:$|[\s?#])/i;

const REQUIRED_FALSE_FLAG_NAMES = Object.freeze([
  "slugGenerationEnabled",
  "slugGenerated",
  "productionSlugGenerated",
  "iesGenerationEnabled",
  "iesGenerated",
  "photometryGenerationEnabled",
  "outputGenerationEnabled",
  "outputGenerated",
  "artifactGenerationEnabled",
  "artefactGenerationEnabled",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "localPathsReturned",
  "rawPhotometryRefExposed",
  "rawPhotometryPayloadExposed",
  "rawCandelaGridExposed",
  "rawIesContentExposed",
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "productionRunTableGenerated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawSelectedResultBodyReturned",
  "rawProductRowsReturned",
  "routesAdded",
  "publicRoutesAdded",
  "postEndpointsAdded",
  "postEndpointsEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
]);

const CANDIDATE_ARTEFACT_REF_FIELDS = Object.freeze({
  opaqueRefsOnly: true,
  iesCandidateRef: null,
  photometryMetadataRef: null,
  candidateManifestRef: null,
  polarPreviewRef: null,
  pdfRef: null,
  rawIesTextExposed: false,
  rawArtefactPayloadExposed: false,
  base64PolarPlotsExposed: false,
});

function falseFlags() {
  return Object.fromEntries(REQUIRED_FALSE_FLAG_NAMES.map((name) => [name, false]));
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(source, key) {
  return isRecord(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function firstPresent(source, keys) {
  if (!isRecord(source)) return undefined;
  for (const key of keys) {
    if (hasOwn(source, key) && source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }
  return undefined;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function stableSha1(value) {
  return createHash("sha1").update(JSON.stringify(stableValue(value))).digest("hex");
}

function tokenFrom(value) {
  if (typeof value !== "string") return null;
  const token = value.trim();
  return token ? token : null;
}

function sourcePhotometryRefFrom(summary) {
  return tokenFrom(firstPresent(summary, ["sourcePhotometryRef", "source_photometry_ref"]));
}

function lumenCurveReferenceTokenFrom(summary) {
  return tokenFrom(firstPresent(summary, ["lumenCurveReferenceToken", "lumen_curve_reference_token"]))
    || tokenFrom(firstPresent(summary?.lumenCurveReferenceSummary, ["curveReferenceToken", "curve_reference_token"]));
}

function driverUtilCurveReferenceTokenFrom(summary) {
  return tokenFrom(firstPresent(summary, ["driverUtilCurveReferenceToken", "driver_util_curve_reference_token"]))
    || tokenFrom(firstPresent(summary?.driverUtilCurveReferenceSummary, ["curveReferenceToken", "curve_reference_token"]));
}

function hasUnsafeString(value) {
  if (typeof value === "string") {
    return PRIVATE_PATH_PATTERN.test(value)
      || RAW_IES_TEXT_PATTERN.test(value)
      || DATA_BASE64_PATTERN.test(value)
      || FILE_EXTENSION_VALUE_PATTERN.test(value);
  }
  if (Array.isArray(value)) return value.some(hasUnsafeString);
  if (!isRecord(value)) return false;
  return Object.values(value).some(hasUnsafeString);
}

function hasUnsafeObjectKey(value, unsafeKeys) {
  if (Array.isArray(value)) return value.some((entry) => hasUnsafeObjectKey(entry, unsafeKeys));
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, nested]) => (
    unsafeKeys.has(key) && nested !== false && nested !== null && nested !== undefined && nested !== ""
  ) || hasUnsafeObjectKey(nested, unsafeKeys));
}

function hasAnyTruthyFlag(source, keys) {
  if (!isRecord(source)) return false;
  return keys.some((key) => source[key] === true);
}

function requestedUnsafeBlocker(source) {
  if (!isRecord(source)) return null;

  if (hasAnyTruthyFlag(source, ["slugGenerationEnabled", "slugGenerated", "productionSlugGenerated"])) {
    return "slug-generation-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["iesGenerationEnabled", "iesGenerated", "photometryGenerationEnabled", "donorPhotometryGenerationInvoked"])) {
    return "ies-generation-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["outputGenerationEnabled", "outputGenerated", "artifactGenerationEnabled", "artefactGenerationEnabled"])) {
    return "output-generation-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["rawIesContentReturned", "rawIesContentExposed"]) || RAW_IES_TEXT_PATTERN.test(JSON.stringify(source))) {
    return "raw-ies-content-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["rawPhotometryReturned", "rawPhotometryPayloadExposed", "rawPhotometryRefExposed"]) || hasUnsafeObjectKey(source, new Set(["rawPhotometry", "rawPhotometryPayload", "rawPhotometryRef"]))) {
    return "raw-photometry-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["candelaArraysReturned", "rawCandelaGridExposed"]) || hasUnsafeObjectKey(source, new Set(["candelaArray", "candelaArrays", "rawCandelaGrid", "candelaGrid"]))) {
    return "candela-array-return-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["base64ArtifactsReturned"]) || DATA_BASE64_PATTERN.test(JSON.stringify(source))) {
    return "base64-artifact-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["filenamesReturned", "localPathsReturned"]) || PRIVATE_PATH_PATTERN.test(JSON.stringify(source)) || hasUnsafeObjectKey(source, new Set(["filename", "fileName", "localPath", "privateFilePath"]))) {
    return "filename-or-local-path-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["routesAdded", "publicRoutesAdded", "postEndpointsAdded", "postEndpointsEnabled"])) {
    return "route-or-post-endpoint-not-approved";
  }
  if (hasAnyTruthyFlag(source, ["runtimeDataMutationEnabled", "runtimeDataMutated", "boardDataMutationEnabled"])) {
    return "runtime-data-mutation-not-approved";
  }
  if (hasAnyTruthyFlag(source, [
    "selectedResultPersisted",
    "selectedResultPersistenceEnabled",
    "selectedResultPersistenceAttempted",
    "productionRunTableGenerated",
    "runTableGenerated",
    "runTableGenerationEnabled",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "rawSelectedResultBodyReturned",
    "rawProductRowsReturned",
  ])) {
    return "source-photometry-ref-handoff-unsafe-output";
  }
  return null;
}

function selectedResultHandoffReady(contract) {
  return isRecord(contract)
    && contract.ready === true
    && contract.handoffState === "metadata_ready_for_future_candidate_output"
    && contract.productionProof === false
    && contract.labProofAuthority === false;
}

function safePhotometrySummaryReadinessBlocker(summary) {
  if (!isRecord(summary)) return "missing-safe-photometry-reference-summary";
  if (summary.ok !== true
    || summary.photometryReferenceSummaryReady !== true
    || summary.sourcePhotometryStatus !== "opaque_reference_summary_ready"
    || summary.sourceBacked !== true
    || summary.sourceAnchorOnly !== true
    || summary.opaqueReferenceOnly !== true
    || summary.safeSummaryOnly !== true) {
    return "safe-photometry-reference-summary-not-ready";
  }
  const sourcePhotometryRef = sourcePhotometryRefFrom(summary);
  if (!sourcePhotometryRef) return "missing-safe-source-photometry-ref";
  if (!SAFE_SOURCE_PHOTOMETRY_REF_PATTERN.test(sourcePhotometryRef)) return "unsafe-source-photometry-ref";
  return null;
}

function baseSummary({ ok, blocker, sourcePhotometryRef = null, safePhotometryReferenceSummary = {}, selectedResultHandoffContract = {} }) {
  const source = isRecord(safePhotometryReferenceSummary) ? safePhotometryReferenceSummary : {};
  const ready = ok === true;
  const candidateRefs = clonePlain(CANDIDATE_ARTEFACT_REF_FIELDS);
  return {
    contractId: RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_CONTRACT_ID,
    schemaId: RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_VERSION,
    state: RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_STATE,
    ok: ready,
    blocker: blocker || null,
    handoffReady: ready,
    sourcePhotometryStatus: ready ? "real_source_ref_ready" : "real_source_ref_blocked",
    sourcePhotometryRef: ready ? sourcePhotometryRef : null,
    readOnly: true,
    deterministicOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    opaqueReferenceOnly: true,
    sourceAnchorOnly: true,
    sourceBacked: ready,
    sourceFingerprint: tokenFrom(source.sourceFingerprint),
    policyFingerprint: tokenFrom(source.policyFingerprint),
    sourceInputFingerprint: tokenFrom(source.sourceInputFingerprint),
    boardDataSourceVersion: tokenFrom(source.boardDataSourceVersion),
    photometryReferenceFingerprint: tokenFrom(source.photometryReferenceFingerprint),
    oneMmPolicyLabel: tokenFrom(source.oneMmPolicyLabel),
    iesPhotometryReferenceToken: tokenFrom(source.iesPhotometryReferenceToken),
    lumenCurveReferenceToken: lumenCurveReferenceTokenFrom(source),
    driverUtilCurveReferenceToken: driverUtilCurveReferenceTokenFrom(source),
    selectedResultHandoffState: ready ? "metadata_ready_for_future_candidate_output" : tokenFrom(selectedResultHandoffContract?.handoffState),
    selectedResultHandoffReady: ready,
    readyForFutureCandidateOutput: ready,
    ...falseFlags(),
    ...candidateRefs,
    candidateArtefactRefs: candidateRefs,
    safetyFlags: {
      readOnly: true,
      deterministicOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      opaqueReferenceOnly: true,
      sourceAnchorOnly: true,
      sourceBacked: ready,
      ...falseFlags(),
      ...candidateRefs,
    },
  };
}

function finalizeSummary(summary) {
  const serialized = JSON.stringify(summary);
  if (hasUnsafeString(summary)) {
    if (summary.blocker === "source-photometry-ref-handoff-unsafe-output") return Object.freeze(summary);
    return Object.freeze(baseSummary({
      ok: false,
      blocker: "source-photometry-ref-handoff-unsafe-output",
      safePhotometryReferenceSummary: {
        sourceFingerprint: summary.sourceFingerprint,
        policyFingerprint: summary.policyFingerprint,
        sourceInputFingerprint: summary.sourceInputFingerprint,
        boardDataSourceVersion: summary.boardDataSourceVersion,
      },
    }));
  }
  if (/safe-source-photometry-ref:[0-9a-f]{40}/.test(serialized) && summary.sourcePhotometryRef === null) {
    return Object.freeze(baseSummary({ ok: false, blocker: "source-photometry-ref-handoff-unsafe-output" }));
  }
  return Object.freeze(summary);
}

export function buildRuntimeIesSourcePhotometryRefHandoffSummary(input = {}) {
  const source = isRecord(input) ? input : {};
  const unsafeBlocker = requestedUnsafeBlocker(source);
  if (unsafeBlocker) return finalizeSummary(baseSummary({ ok: false, blocker: unsafeBlocker }));

  const safePhotometryReferenceSummary = source.safePhotometryReferenceSummary
    || source.safePhotometrySourceAnchorSummary
    || source.photometryReferenceSummary;
  const selectedResultHandoffContract = source.selectedResultHandoffContract
    || source.handoffContract
    || source.iesBuilderSelectedResultHandoffContract;

  const photometryBlocker = safePhotometrySummaryReadinessBlocker(safePhotometryReferenceSummary);
  if (photometryBlocker) {
    return finalizeSummary(baseSummary({
      ok: false,
      blocker: photometryBlocker,
      safePhotometryReferenceSummary,
      selectedResultHandoffContract,
    }));
  }

  const sourcePhotometryRef = sourcePhotometryRefFrom(safePhotometryReferenceSummary);
  if (!sourcePhotometryRef) {
    return finalizeSummary(baseSummary({
      ok: false,
      blocker: "missing-safe-source-photometry-ref",
      safePhotometryReferenceSummary,
      selectedResultHandoffContract,
    }));
  }
  if (!SAFE_SOURCE_PHOTOMETRY_REF_PATTERN.test(sourcePhotometryRef)) {
    return finalizeSummary(baseSummary({
      ok: false,
      blocker: "unsafe-source-photometry-ref",
      safePhotometryReferenceSummary,
      selectedResultHandoffContract,
    }));
  }

  if (!selectedResultHandoffReady(selectedResultHandoffContract)) {
    return finalizeSummary(baseSummary({
      ok: false,
      blocker: "selected-result-handoff-not-ready",
      safePhotometryReferenceSummary,
      selectedResultHandoffContract,
    }));
  }

  const expectedRef = `safe-source-photometry-ref:${stableSha1({
    contractId: RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_CONTRACT_ID,
    sourcePhotometryRef,
    sourceFingerprint: safePhotometryReferenceSummary.sourceFingerprint,
    policyFingerprint: safePhotometryReferenceSummary.policyFingerprint,
    sourceInputFingerprint: safePhotometryReferenceSummary.sourceInputFingerprint,
    boardDataSourceVersion: safePhotometryReferenceSummary.boardDataSourceVersion,
    photometryReferenceFingerprint: safePhotometryReferenceSummary.photometryReferenceFingerprint,
    selectedResultHandoffState: selectedResultHandoffContract.handoffState,
  })}`;

  return finalizeSummary(baseSummary({
    ok: true,
    sourcePhotometryRef: expectedRef,
    safePhotometryReferenceSummary,
    selectedResultHandoffContract,
  }));
}

export const buildIesSourcePhotometryRefHandoffSummary = buildRuntimeIesSourcePhotometryRefHandoffSummary;
