// ControlStack Lab — import-free deterministic materialisation job planning.
// Validates public JSON only. It does not load references, resolve storage, materialise, generate, persist, route, or write.

export const IES_MATERIALISATION_JOB_PLAN_SCHEMA_ID =
  "controlstack.lab.ies-materialisation-job-plan.v1";
export const IES_MATERIALISATION_JOB_PLAN_SCHEMA_VERSION = 1;
export const IES_MATERIALISATION_JOB_PLAN_AUDIT_SCHEMA_ID =
  "controlstack.lab.ies-materialisation-job-plan-audit.v1";
export const IES_MATERIALISATION_JOB_PLAN_AUDIT_SCHEMA_VERSION = 1;
export const IES_MATERIALISATION_JOB_PLAN_STATES = Object.freeze({
  readyReadOnly: "ready_read_only",
  blockedFailClosed: "blocked_fail_closed",
});

const GENERATION_SCHEMA_ID = "controlstack.downstream.ies-generation-input.v1";
const GENERATION_SCHEMA_VERSION = 1;
const GENERATION_AUDIT_SCHEMA_ID = "controlstack.downstream.ies-generation-input-audit.v1";
const GENERATION_AUDIT_SCHEMA_VERSION = 1;
const ARTIFACT_REQUEST_SCHEMA_ID = "controlstack.downstream.ies-artifact-request.v1";
const ARTIFACT_REQUEST_SCHEMA_VERSION = 1;
const ARTIFACT_INTENT_SCHEMA_ID = "controlstack.downstream.ies-artifact-intent.v1";
const ARTIFACT_INTENT_SCHEMA_VERSION = 1;
const ARTIFACT_KIND = "ies_lm63_reference_build";
const ENGINE_OUTPUT_SCHEMA_ID = "controlstack.engine.output.v1";
const ENGINE_OUTPUT_SCHEMA_VERSION = 1;
const BINDING_SCHEMA_ID = "controlstack.lab.ies-generation-reference-binding.v1";
const BINDING_SCHEMA_VERSION = 1;
const BINDING_AUDIT_SCHEMA_ID = "controlstack.lab.ies-generation-reference-binding-audit.v1";
const BINDING_AUDIT_SCHEMA_VERSION = 1;
const INSPECTION_SCHEMA_ID = "controlstack.lab.ies-reference-generation-inspection.v1";
const INSPECTION_SCHEMA_VERSION = 1;
const INSPECTION_AUDIT_SCHEMA_ID = "controlstack.lab.ies-reference-generation-inspection-audit.v1";
const INSPECTION_AUDIT_SCHEMA_VERSION = 1;
const REFERENCE_IDENTITY_SCHEMA_ID = "controlstack.lab.reference-identity.v1";
const REFERENCE_IDENTITY_SCHEMA_VERSION = 1;
const KEYWORD_PROFILE_ID = "controlstack.lab.ies-keywords.v1";

const GENERATION_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "state", "generationInputId", "replayKey",
  "sourceRequest", "artifactIntent", "engineContract", "selection", "run",
  "technicalProvenance", "thermal", "blockers", "warnings", "audit", "safetyFlags",
]);
const SOURCE_REQUEST_KEYS = Object.freeze(["schemaId", "schemaVersion", "requestId", "replayKey"]);
const INTENT_KEYS = Object.freeze(["schemaId", "schemaVersion", "artifactKind"]);
const ENGINE_KEYS = Object.freeze([
  "outputSchemaId", "outputSchemaVersion", "outputState", "resultId",
  "requestFingerprint", "sourceVersionFingerprint", "policyFingerprint", "evidenceFingerprints",
]);
const SELECTION_KEYS = Object.freeze(["system", "optic", "targetLmPerM", "roomAmbientTaC", "protocol"]);
const RUN_KEYS = Object.freeze(["runIndex", "quantity", "lengthMm"]);
const PROVENANCE_KEYS = Object.freeze([
  "selectedOpticKey", "opticBomId", "evidenceRef", "programValidationState", "selectedTierOrProfile",
]);
const THERMAL_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "selectedOpticKey", "opticBomId", "sourceRevision",
  "evidenceRef", "programValidationState", "selectedRoomTaC", "referenceRoomTaC",
  "referenceInternalTaC", "opticThermalRiseTaC", "derivedInternalTaC", "curveLookupTaC",
  "effectiveCurveTaC", "temperatureMode", "requestedCurrentMa", "currentMode",
  "verifiedLmPerM", "curveFilename", "curveChecksumVerified", "opticRiseAppliedCount",
  "readOnly", "safetyFlags",
]);
const THERMAL_SAFETY_KEYS = Object.freeze([
  "donorEngineInvoked", "runtimeDataMutated", "selectedResultPersisted", "runTableGenerated",
  "iesGenerated", "outputGenerated", "rawCurveRowsReturned", "rawCurvePayloadReturned",
  "publicRouteAdded", "postEndpointAdded",
]);
const GENERATION_AUDIT_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "attemptFingerprint", "state", "accepted", "generationInputId",
  "replayKey", "deterministic", "traceabilityInspected", "artifactRequestValidated",
  "selectionRequestValidated", "referenceBound", "sealedReferenceLoaded", "generatorInvoked",
  "routeInvoked", "persistenceAttempted", "artifactWriteAttempted", "emailAttempted",
]);
const GENERATION_SAFETY_KEYS = Object.freeze([
  "readOnly", "nonPersistent", "traceabilityEnvelopeIgnored", "artifactRequestConsumed",
  "selectionRequestConsumed", "referenceBound", "sealedReferenceLoaded", "authorityInspected",
  "authorityMutated", "referenceMutated", "engineInvoked", "donorEngineInvoked",
  "labConsumerInvoked", "iesGeneratorInvoked", "iesGenerated", "rawIesReturned",
  "rawPhotometryReturned", "candelaReturned", "artifactWritten", "fileWritten", "networkWritten",
  "emailSent", "downloadCreated", "routeAdded", "postEndpointAdded", "persistenceAttempted",
  "runtimeDataMutated", "downstreamActivated",
]);

const BINDING_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "state", "bindingId", "replayKey", "sourceGeneration",
  "selection", "run", "technicalBinding", "referenceIdentity", "blockers", "warnings",
  "audit", "safetyFlags",
]);
const SOURCE_GENERATION_KEYS = Object.freeze(["schemaId", "schemaVersion", "generationInputId", "replayKey"]);
const TECHNICAL_BINDING_KEYS = Object.freeze([
  "selectedOpticKey", "opticBomId", "evidenceRef", "referenceRoomTaC",
  "referenceInternalTaC", "opticThermalRiseTaC",
]);
const BINDING_AUDIT_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "attemptFingerprint", "state", "accepted", "bindingId",
  "replayKey", "deterministic", "traceabilityInspected", "generationInputValidated",
  "labProjectionValidated", "referenceIdentityBound", "resolverInvoked", "sealedReferenceLoaded",
  "authorityInspected", "generatorInvoked", "routeInvoked", "persistenceAttempted",
  "artifactWriteAttempted", "emailAttempted",
]);
const BINDING_SAFETY_KEYS = Object.freeze([
  "readOnly", "nonPersistent", "traceabilityEnvelopeIgnored", "generationInputConsumed",
  "labProjectionConsumed", "referenceIdentityBound", "resolverInvoked", "storageAccessed",
  "sealedReferenceLoaded", "authorityInspected", "authorityMutated", "evidenceAccepted",
  "referenceMutated", "generatorInvoked", "iesGenerated", "rawIesReturned",
  "rawPhotometryReturned", "candelaReturned", "artifactWritten", "fileWritten", "networkWritten",
  "emailSent", "downloadCreated", "routeAdded", "persistenceAttempted", "readinessActivated",
]);

const INSPECTION_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "state", "inspectionId", "referenceIdentity", "keywordProfileId",
  "baseline", "missingKeywordOverrides", "materialisationWithoutOverrides", "blockers", "warnings",
  "audit", "safetyFlags",
]);
const BASELINE_KEYS = Object.freeze([
  "cct", "cri", "internalAmbientTaC", "fluxPerMm", "wallWattsPerMm", "circuitWattsPerMm",
  "baselineLmPerM", "baselineWallWattsPerM", "baselineCircuitWattsPerM",
]);
const INSPECTION_AUDIT_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "attemptId", "state", "accepted", "inspectionId", "referenceId",
  "deterministic", "referenceValidated", "jobValidated", "materialiseInvoked", "generatorInvoked",
  "routeInvoked", "persistenceAttempted", "artifactWriteAttempted", "emailAttempted",
]);
const INSPECTION_SAFETY_KEYS = Object.freeze([
  "readOnly", "nonPersistent", "referenceValidated", "jobValidated", "materialiseInvoked",
  "generatorInvoked", "iesGenerated", "rawIesReturned", "metadataReturned", "anglesReturned",
  "candelaReturned", "keywordValuesReturned", "provenancePathsReturned", "sealedReferenceReturned",
  "multiplierDerived", "projectMetadataAccepted", "resolverInvoked", "storageAccessed", "routeAdded",
  "persistenceAttempted", "fileWritten", "networkWritten", "emailSent", "readinessActivated",
]);
const REFERENCE_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "referenceId", "kind", "serial", "sealedAtUtc",
  "authorityRecordSha256", "referenceSha256", "resolverPath", "readOnly",
]);

const SOURCE_BINDING_KEYS = Object.freeze(["schemaId", "schemaVersion", "bindingId", "replayKey"]);
const SOURCE_INSPECTION_KEYS = Object.freeze(["schemaId", "schemaVersion", "inspectionId"]);
const MULTIPLIER_BASIS_KEYS = Object.freeze([
  "verifiedLmPerM", "baselineLmPerM", "targetLmPerM", "targetLmPerMIsIntentOnly",
  "formula", "outputMultiplier",
]);
const JOB_KEYS = Object.freeze(["runLengthMm", "outputMultiplier", "selections"]);
const PLAN_AUDIT_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "attemptFingerprint", "state", "accepted", "planId", "replayKey",
  "deterministic", "traceabilityInspected", "generationInputValidated", "bindingValidated",
  "inspectionValidated", "multiplierDerived", "jobPlanned", "sealedReferenceLoaded",
  "materialiseInvoked", "generatorInvoked", "routeInvoked", "persistenceAttempted",
  "artifactWriteAttempted", "emailAttempted",
]);
const PLAN_SAFETY_KEYS = Object.freeze([
  "readOnly", "nonPersistent", "traceabilityEnvelopeIgnored", "generationInputConsumed",
  "bindingConsumed", "inspectionConsumed", "multiplierDerived", "jobPlanned",
  "callerSelectionsAccepted", "projectMetadataAccepted", "sealedReferenceLoaded", "resolverInvoked",
  "storageAccessed", "materialiseInvoked", "generatorInvoked", "iesGenerated", "rawIesReturned",
  "metadataReturned", "anglesReturned", "candelaReturned", "keywordValuesReturned",
  "sealedReferenceReturned", "artifactWritten", "fileWritten", "networkWritten", "emailSent",
  "downloadCreated", "routeAdded", "persistenceAttempted", "readinessActivated",
]);

const GENERATION_ID_PATTERN = /^ies-generation-input-v1:[0-9a-f]{40}$/;
const GENERATION_REPLAY_PATTERN = /^ies-generation-input-replay-v1:[0-9a-f]{40}$/;
const ARTIFACT_REQUEST_ID_PATTERN = /^ies-artifact-request-v1:[0-9a-f]{40}$/;
const ARTIFACT_REPLAY_PATTERN = /^ies-artifact-replay-v1:[0-9a-f]{40}$/;
const BINDING_ID_PATTERN = /^ies-generation-reference-binding-v1:[0-9a-f]{40}$/;
const BINDING_REPLAY_PATTERN = /^ies-generation-reference-binding-replay-v1:[0-9a-f]{40}$/;
const INSPECTION_ID_PATTERN = /^ies-reference-generation-inspection-v1:[0-9a-f]{64}$/;
const PLAN_ID_PATTERN = /^ies-materialisation-job-plan-v1:[0-9a-f]{40}$/;
const PLAN_REPLAY_PATTERN = /^ies-materialisation-job-plan-replay-v1:[0-9a-f]{40}$/;
const FINGERPRINT_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{7,255}$/;
const BLOCKER_PATTERN = /^[a-z][a-z0-9_]{0,127}$/;
const REFERENCE_ID_PATTERN = /^NVB-REF-(GT|OPT|MRG)-([0-9]{6})$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const EXACT_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|(?:^|[\\/])\.\.(?:[\\/]|$))/i;
const RAW_CONTENT_PATTERN = /(?:^\s*IESNA:|\bTILT=|data:[^\s]+;base64|\bbase64\b)/i;
const TEMPERATURE_MODES = Object.freeze(new Set(["clamped-low", "clamped-high", "interpolated"]));
const CURRENT_MODES = Object.freeze(new Set(["clamped-low", "clamped-high", "exact", "interpolated"]));

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function boundedText(value, maximum = 256) {
  if (
    typeof value !== "string" || value !== value.trim() || value.length === 0
    || value.length > maximum || /[\u0000-\u001f\u007f]/.test(value)
    || PRIVATE_PATH_PATTERN.test(value) || RAW_CONTENT_PATTERN.test(value)
  ) return null;
  return value;
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? (Object.is(value, -0) ? 0 : value)
    : null;
}

function fingerprint(value) {
  return typeof value === "string" && FINGERPRINT_PATTERN.test(value)
    && !PRIVATE_PATH_PATTERN.test(value) && !RAW_CONTENT_PATTERN.test(value)
    ? value
    : null;
}

function canonicalStrings(value, { maximum = 64, blockers = false } = {}) {
  if (!Array.isArray(value) || value.length > maximum) return null;
  const output = [];
  const seen = new Set();
  for (const entry of value) {
    const text = blockers
      ? (typeof entry === "string" && BLOCKER_PATTERN.test(entry) ? entry : null)
      : boundedText(entry);
    if (!text || seen.has(text)) return null;
    seen.add(text);
    output.push(text);
  }
  return output;
}

function exactValue(left, right) {
  return stableFingerprint("exact-value", left) === stableFingerprint("exact-value", right);
}

function decimalInteger(value) {
  const numeric = finiteNumber(value);
  if (numeric === null) return null;
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(String(numeric));
  if (!match) return null;
  const sign = match[1] === "-" ? -1n : 1n;
  const fraction = match[3] || "";
  const exponent = Number(match[4] || 0);
  const digits = `${match[2]}${fraction}`.replace(/^0+(?=\d)/, "");
  const shift = exponent - fraction.length;
  if (!Number.isSafeInteger(shift) || Math.abs(shift) > 1000) return null;
  const magnitude = BigInt(digits || "0");
  return shift >= 0
    ? { integer: sign * magnitude * (10n ** BigInt(shift)), scale: 0 }
    : { integer: sign * magnitude, scale: -shift };
}

function exactDecimalSum(leftValue, rightValue, expectedValue) {
  const left = decimalInteger(leftValue);
  const right = decimalInteger(rightValue);
  const expected = decimalInteger(expectedValue);
  if (!left || !right || !expected) return false;
  const scale = Math.max(left.scale, right.scale, expected.scale);
  const align = ({ integer, scale: valueScale }) => integer * (10n ** BigInt(scale - valueScale));
  return align(left) + align(right) === align(expected);
}

function exactTimesThousand(perMmValue, perMValue) {
  const perMm = decimalInteger(perMmValue);
  const perM = decimalInteger(perMValue);
  if (!perMm || !perM) return false;
  const scale = Math.max(perMm.scale, perM.scale);
  const align = ({ integer, scale: valueScale }) => integer * (10n ** BigInt(scale - valueScale));
  return align(perMm) * 1000n === align(perM);
}

function validateReferenceIdentity(value) {
  if (!exactKeys(value, REFERENCE_KEYS)) return { ok: false, blocker: "reference_identity_invalid_shape" };
  const match = typeof value.referenceId === "string" ? REFERENCE_ID_PATTERN.exec(value.referenceId) : null;
  const parsedKind = match?.[1] === "MRG" ? "MERGED" : match?.[1];
  const parsedSerial = match ? Number(match[2]) : null;
  if (
    value.schemaId !== REFERENCE_IDENTITY_SCHEMA_ID || value.schemaVersion !== REFERENCE_IDENTITY_SCHEMA_VERSION
    || !match || parsedKind !== value.kind || parsedSerial !== value.serial
    || !Number.isSafeInteger(value.serial) || value.serial < 1 || value.serial > 999999
    || !EXACT_UTC_PATTERN.test(value.sealedAtUtc) || !Number.isFinite(Date.parse(value.sealedAtUtc))
    || new Date(value.sealedAtUtc).toISOString() !== value.sealedAtUtc
    || !SHA256_PATTERN.test(value.authorityRecordSha256) || !SHA256_PATTERN.test(value.referenceSha256)
    || value.resolverPath !== `/r/${value.referenceId}` || value.readOnly !== true
  ) return { ok: false, blocker: "reference_identity_invalid" };
  return { ok: true, value: clonePlain(value) };
}

function validateThermalSafety(value) {
  return exactKeys(value, THERMAL_SAFETY_KEYS) && THERMAL_SAFETY_KEYS.every((key) => value[key] === false);
}

function validateThermal(value, provenance, selection) {
  if (!exactKeys(value, THERMAL_KEYS)) return { ok: false, blocker: "generation_thermal_invalid_shape" };
  const textKeys = [
    "schemaId", "selectedOpticKey", "opticBomId", "sourceRevision", "evidenceRef",
    "programValidationState", "temperatureMode", "currentMode", "curveFilename",
  ];
  const output = { schemaVersion: value.schemaVersion };
  for (const key of textKeys) {
    output[key] = boundedText(value[key]);
    if (!output[key]) return { ok: false, blocker: "generation_thermal_text_invalid" };
  }
  for (const key of [
    "selectedRoomTaC", "referenceRoomTaC", "referenceInternalTaC", "opticThermalRiseTaC",
    "derivedInternalTaC", "curveLookupTaC", "effectiveCurveTaC", "requestedCurrentMa", "verifiedLmPerM",
  ]) {
    output[key] = finiteNumber(value[key]);
    if (output[key] === null) return { ok: false, blocker: "generation_thermal_number_invalid" };
  }
  if (!TEMPERATURE_MODES.has(output.temperatureMode) || !CURRENT_MODES.has(output.currentMode)) {
    return { ok: false, blocker: "generation_thermal_mode_invalid" };
  }
  if (
    value.curveChecksumVerified !== true || value.opticRiseAppliedCount !== 1
    || value.readOnly !== true || !validateThermalSafety(value.safetyFlags)
  ) return { ok: false, blocker: "generation_thermal_safety_invalid" };
  if (
    output.selectedOpticKey !== provenance.selectedOpticKey || output.opticBomId !== provenance.opticBomId
    || output.evidenceRef !== provenance.evidenceRef
    || output.programValidationState !== provenance.programValidationState
    || output.selectedOpticKey !== selection.optic || output.selectedRoomTaC !== selection.roomAmbientTaC
  ) return { ok: false, blocker: "generation_thermal_identity_mismatch" };
  if (
    !exactDecimalSum(output.referenceRoomTaC, output.opticThermalRiseTaC, output.referenceInternalTaC)
    || !exactDecimalSum(output.selectedRoomTaC, output.opticThermalRiseTaC, output.derivedInternalTaC)
    || output.curveLookupTaC !== output.derivedInternalTaC
  ) return { ok: false, blocker: "generation_thermal_equation_mismatch" };
  if (output.opticThermalRiseTaC < 0 || output.requestedCurrentMa < 0 || output.verifiedLmPerM < 0) {
    return { ok: false, blocker: "generation_thermal_non_negative_required" };
  }
  if (/[/\\]/.test(output.curveFilename)) return { ok: false, blocker: "generation_thermal_private_path_rejected" };
  if (
    (output.temperatureMode === "clamped-low" && output.effectiveCurveTaC !== 25)
    || (output.temperatureMode === "clamped-high" && output.effectiveCurveTaC !== 65)
    || (output.temperatureMode === "interpolated" && output.effectiveCurveTaC !== output.curveLookupTaC)
  ) return { ok: false, blocker: "generation_thermal_effective_temperature_mismatch" };
  return { ok: true, value: { ...output, curveChecksumVerified: true, opticRiseAppliedCount: 1, readOnly: true } };
}

function validateGenerationSafety(value) {
  if (!exactKeys(value, GENERATION_SAFETY_KEYS)) return false;
  const requiredTrue = new Set([
    "readOnly", "nonPersistent", "traceabilityEnvelopeIgnored", "artifactRequestConsumed", "selectionRequestConsumed",
  ]);
  return GENERATION_SAFETY_KEYS.every((key) => value[key] === requiredTrue.has(key));
}

function expectedSelectionFingerprint(selection, run) {
  return stableFingerprint("engine-selection-set-v1", {
    product: { system: selection.system, optic: selection.optic },
    lighting: { targetLmPerM: selection.targetLmPerM, roomAmbientTaC: selection.roomAmbientTaC },
    runs: [{ qty: run.quantity, lengthMm: run.lengthMm }],
    control: { protocol: selection.protocol },
  });
}

function expectedArtifactRequestIdentity(intent, engine) {
  const payload = {
    schemaId: ARTIFACT_REQUEST_SCHEMA_ID,
    schemaVersion: ARTIFACT_REQUEST_SCHEMA_VERSION,
    artifactIntent: intent,
    engineContract: engine,
    blocker: null,
  };
  const requestId = stableFingerprint("ies-artifact-request-v1", payload);
  const replayKey = stableFingerprint("ies-artifact-replay-v1", {
    requestId,
    engineReplay: {
      requestFingerprint: engine.requestFingerprint,
      sourceVersionFingerprint: engine.sourceVersionFingerprint,
      policyFingerprint: engine.policyFingerprint,
      evidenceFingerprints: [...engine.evidenceFingerprints],
      outputSchemaId: ENGINE_OUTPUT_SCHEMA_ID,
      outputSchemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    },
  });
  return { requestId, replayKey };
}

function expectedGenerationIdentity(value) {
  const payload = {
    schemaId: GENERATION_SCHEMA_ID,
    schemaVersion: GENERATION_SCHEMA_VERSION,
    sourceRequest: value.sourceRequest,
    artifactIntent: value.artifactIntent,
    engineContract: value.engineContract,
    selectionRequestFingerprint: value.engineContract.requestFingerprint,
    selection: value.selection,
    run: value.run,
    technicalProvenance: value.technicalProvenance,
    thermal: value.thermal,
    blocker: null,
  };
  const attemptFingerprint = stableFingerprint("ies-generation-input-attempt-v1", payload);
  const generationInputId = stableFingerprint("ies-generation-input-v1", payload);
  const replayKey = stableFingerprint("ies-generation-input-replay-v1", {
    generationInputId,
    artifactReplayKey: value.sourceRequest.replayKey,
    selectionRequestFingerprint: value.engineContract.requestFingerprint,
  });
  return { attemptFingerprint, generationInputId, replayKey };
}

function validateGenerationInput(value) {
  if (!exactKeys(value, GENERATION_KEYS)) return { ok: false, blocker: "generation_input_invalid_shape" };
  if (
    value.schemaId !== GENERATION_SCHEMA_ID || value.schemaVersion !== GENERATION_SCHEMA_VERSION
    || value.state !== "ready_read_only" || !GENERATION_ID_PATTERN.test(value.generationInputId)
    || !GENERATION_REPLAY_PATTERN.test(value.replayKey)
  ) return { ok: false, blocker: "generation_input_schema_or_identity_invalid" };

  if (!exactKeys(value.sourceRequest, SOURCE_REQUEST_KEYS)) return { ok: false, blocker: "generation_source_request_invalid_shape" };
  if (
    value.sourceRequest.schemaId !== ARTIFACT_REQUEST_SCHEMA_ID
    || value.sourceRequest.schemaVersion !== ARTIFACT_REQUEST_SCHEMA_VERSION
    || !ARTIFACT_REQUEST_ID_PATTERN.test(value.sourceRequest.requestId)
    || !ARTIFACT_REPLAY_PATTERN.test(value.sourceRequest.replayKey)
  ) return { ok: false, blocker: "generation_source_request_invalid" };

  if (!exactKeys(value.artifactIntent, INTENT_KEYS)) return { ok: false, blocker: "generation_intent_invalid_shape" };
  if (
    value.artifactIntent.schemaId !== ARTIFACT_INTENT_SCHEMA_ID
    || value.artifactIntent.schemaVersion !== ARTIFACT_INTENT_SCHEMA_VERSION
    || value.artifactIntent.artifactKind !== ARTIFACT_KIND
  ) return { ok: false, blocker: "generation_intent_invalid" };

  if (!exactKeys(value.engineContract, ENGINE_KEYS)) return { ok: false, blocker: "generation_engine_invalid_shape" };
  const evidenceFingerprints = Array.isArray(value.engineContract.evidenceFingerprints)
    && value.engineContract.evidenceFingerprints.length === 1
    && fingerprint(value.engineContract.evidenceFingerprints[0])
    ? [value.engineContract.evidenceFingerprints[0]]
    : null;
  if (
    value.engineContract.outputSchemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.engineContract.outputSchemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
    || value.engineContract.outputState !== "complete" || !fingerprint(value.engineContract.resultId)
    || !fingerprint(value.engineContract.requestFingerprint)
    || !fingerprint(value.engineContract.sourceVersionFingerprint)
    || !fingerprint(value.engineContract.policyFingerprint) || !evidenceFingerprints
  ) return { ok: false, blocker: "generation_engine_identity_invalid" };

  if (!exactKeys(value.selection, SELECTION_KEYS)) return { ok: false, blocker: "generation_selection_invalid_shape" };
  const selection = {};
  for (const key of ["system", "optic", "protocol"]) {
    selection[key] = boundedText(value.selection[key]);
    if (!selection[key]) return { ok: false, blocker: "generation_selection_text_invalid" };
  }
  selection.targetLmPerM = finiteNumber(value.selection.targetLmPerM);
  selection.roomAmbientTaC = finiteNumber(value.selection.roomAmbientTaC);
  if (selection.targetLmPerM === null || selection.targetLmPerM < 0 || selection.roomAmbientTaC === null) {
    return { ok: false, blocker: "generation_selection_number_invalid" };
  }

  if (!exactKeys(value.run, RUN_KEYS)) return { ok: false, blocker: "generation_run_invalid_shape" };
  if (
    value.run.runIndex !== 0 || !Number.isSafeInteger(value.run.quantity) || value.run.quantity < 1
    || !Number.isSafeInteger(value.run.lengthMm) || value.run.lengthMm < 1
  ) return { ok: false, blocker: "generation_run_invalid" };
  const run = clonePlain(value.run);

  if (value.engineContract.requestFingerprint !== expectedSelectionFingerprint(selection, run)) {
    return { ok: false, blocker: "generation_selection_fingerprint_mismatch" };
  }
  const artifactIdentity = expectedArtifactRequestIdentity(value.artifactIntent, value.engineContract);
  if (
    value.sourceRequest.requestId !== artifactIdentity.requestId
    || value.sourceRequest.replayKey !== artifactIdentity.replayKey
  ) return { ok: false, blocker: "generation_source_request_identity_mismatch" };

  if (!exactKeys(value.technicalProvenance, PROVENANCE_KEYS)) {
    return { ok: false, blocker: "generation_provenance_invalid_shape" };
  }
  const provenance = {};
  for (const key of PROVENANCE_KEYS) {
    provenance[key] = boundedText(value.technicalProvenance[key]);
    if (!provenance[key]) return { ok: false, blocker: "generation_provenance_invalid" };
  }
  if (provenance.selectedOpticKey !== selection.optic) {
    return { ok: false, blocker: "generation_provenance_selection_mismatch" };
  }

  const thermal = validateThermal(value.thermal, provenance, selection);
  if (!thermal.ok) return thermal;
  const blockers = canonicalStrings(value.blockers, { maximum: 0, blockers: true });
  const warnings = canonicalStrings(value.warnings);
  if (!blockers || !warnings) return { ok: false, blocker: "generation_diagnostics_invalid" };
  if (!exactKeys(value.audit, GENERATION_AUDIT_KEYS)) return { ok: false, blocker: "generation_audit_invalid_shape" };
  if (!validateGenerationSafety(value.safetyFlags)) return { ok: false, blocker: "generation_safety_invalid" };

  const expected = expectedGenerationIdentity(value);
  if (
    value.generationInputId !== expected.generationInputId || value.replayKey !== expected.replayKey
    || value.audit.schemaId !== GENERATION_AUDIT_SCHEMA_ID
    || value.audit.schemaVersion !== GENERATION_AUDIT_SCHEMA_VERSION
    || value.audit.attemptFingerprint !== expected.attemptFingerprint
    || value.audit.state !== "accepted_read_only" || value.audit.accepted !== true
    || value.audit.generationInputId !== value.generationInputId || value.audit.replayKey !== value.replayKey
    || value.audit.deterministic !== true || value.audit.traceabilityInspected !== false
    || value.audit.artifactRequestValidated !== true || value.audit.selectionRequestValidated !== true
    || value.audit.referenceBound !== false || value.audit.sealedReferenceLoaded !== false
    || value.audit.generatorInvoked !== false || value.audit.routeInvoked !== false
    || value.audit.persistenceAttempted !== false || value.audit.artifactWriteAttempted !== false
    || value.audit.emailAttempted !== false
  ) return { ok: false, blocker: "generation_deterministic_identity_or_audit_mismatch" };

  return {
    ok: true,
    value: {
      schemaId: value.schemaId, schemaVersion: value.schemaVersion,
      generationInputId: value.generationInputId, replayKey: value.replayKey,
      selection, run, technicalProvenance: provenance, thermal: thermal.value, warnings,
    },
  };
}

function validateBindingSafety(value) {
  if (!exactKeys(value, BINDING_SAFETY_KEYS)) return false;
  const requiredTrue = new Set([
    "readOnly", "nonPersistent", "traceabilityEnvelopeIgnored", "generationInputConsumed",
    "labProjectionConsumed", "referenceIdentityBound",
  ]);
  return BINDING_SAFETY_KEYS.every((key) => value[key] === requiredTrue.has(key));
}

function expectedBindingIdentity(generation, binding) {
  const payload = {
    schemaId: BINDING_SCHEMA_ID,
    schemaVersion: BINDING_SCHEMA_VERSION,
    generationInputId: generation.generationInputId,
    generationReplayKey: generation.replayKey,
    selection: generation.selection,
    run: generation.run,
    technicalBinding: binding.technicalBinding,
    referenceIdentity: binding.referenceIdentity,
    blocker: null,
  };
  const attemptFingerprint = stableFingerprint("ies-generation-reference-binding-attempt-v1", payload);
  const bindingId = stableFingerprint("ies-generation-reference-binding-v1", payload);
  const replayKey = stableFingerprint("ies-generation-reference-binding-replay-v1", {
    bindingId,
    generationReplayKey: generation.replayKey,
    referenceSha256: binding.referenceIdentity.referenceSha256,
  });
  return { attemptFingerprint, bindingId, replayKey };
}

function validateBinding(value, generation) {
  if (!exactKeys(value, BINDING_KEYS)) return { ok: false, blocker: "binding_invalid_shape" };
  if (
    value.schemaId !== BINDING_SCHEMA_ID || value.schemaVersion !== BINDING_SCHEMA_VERSION
    || value.state !== "ready_read_only" || !BINDING_ID_PATTERN.test(value.bindingId)
    || !BINDING_REPLAY_PATTERN.test(value.replayKey)
  ) return { ok: false, blocker: "binding_schema_or_identity_invalid" };
  if (!exactKeys(value.sourceGeneration, SOURCE_GENERATION_KEYS)) {
    return { ok: false, blocker: "binding_source_generation_invalid_shape" };
  }
  if (
    value.sourceGeneration.schemaId !== generation.schemaId
    || value.sourceGeneration.schemaVersion !== generation.schemaVersion
    || value.sourceGeneration.generationInputId !== generation.generationInputId
    || value.sourceGeneration.replayKey !== generation.replayKey
  ) return { ok: false, blocker: "binding_generation_identity_mismatch" };
  if (!exactKeys(value.selection, SELECTION_KEYS) || !exactValue(value.selection, generation.selection)) {
    return { ok: false, blocker: "binding_selection_mismatch" };
  }
  if (!exactKeys(value.run, RUN_KEYS) || !exactValue(value.run, generation.run)) {
    return { ok: false, blocker: "binding_run_mismatch" };
  }
  if (!exactKeys(value.technicalBinding, TECHNICAL_BINDING_KEYS)) {
    return { ok: false, blocker: "binding_technical_invalid_shape" };
  }
  const expectedTechnical = {
    selectedOpticKey: generation.technicalProvenance.selectedOpticKey,
    opticBomId: generation.technicalProvenance.opticBomId,
    evidenceRef: generation.technicalProvenance.evidenceRef,
    referenceRoomTaC: generation.thermal.referenceRoomTaC,
    referenceInternalTaC: generation.thermal.referenceInternalTaC,
    opticThermalRiseTaC: generation.thermal.opticThermalRiseTaC,
  };
  if (!exactValue(value.technicalBinding, expectedTechnical)) {
    return { ok: false, blocker: "binding_technical_mismatch" };
  }
  const reference = validateReferenceIdentity(value.referenceIdentity);
  if (!reference.ok) return reference;
  const blockers = canonicalStrings(value.blockers, { maximum: 0, blockers: true });
  const warnings = canonicalStrings(value.warnings);
  if (!blockers || !warnings) return { ok: false, blocker: "binding_diagnostics_invalid" };
  if (!exactKeys(value.audit, BINDING_AUDIT_KEYS)) return { ok: false, blocker: "binding_audit_invalid_shape" };
  if (!validateBindingSafety(value.safetyFlags)) return { ok: false, blocker: "binding_safety_invalid" };
  const expected = expectedBindingIdentity(generation, value);
  if (
    value.bindingId !== expected.bindingId || value.replayKey !== expected.replayKey
    || value.audit.schemaId !== BINDING_AUDIT_SCHEMA_ID
    || value.audit.schemaVersion !== BINDING_AUDIT_SCHEMA_VERSION
    || value.audit.attemptFingerprint !== expected.attemptFingerprint
    || value.audit.state !== "accepted_read_only" || value.audit.accepted !== true
    || value.audit.bindingId !== value.bindingId || value.audit.replayKey !== value.replayKey
    || value.audit.deterministic !== true || value.audit.traceabilityInspected !== false
    || value.audit.generationInputValidated !== true || value.audit.labProjectionValidated !== true
    || value.audit.referenceIdentityBound !== true || value.audit.resolverInvoked !== false
    || value.audit.sealedReferenceLoaded !== false || value.audit.authorityInspected !== false
    || value.audit.generatorInvoked !== false || value.audit.routeInvoked !== false
    || value.audit.persistenceAttempted !== false || value.audit.artifactWriteAttempted !== false
    || value.audit.emailAttempted !== false
  ) return { ok: false, blocker: "binding_deterministic_identity_or_audit_mismatch" };
  return {
    ok: true,
    value: {
      schemaId: value.schemaId, schemaVersion: value.schemaVersion,
      bindingId: value.bindingId, replayKey: value.replayKey,
      selection: clonePlain(value.selection), run: clonePlain(value.run),
      technicalBinding: clonePlain(value.technicalBinding),
      referenceIdentity: reference.value, warnings,
    },
  };
}

function validateInspectionSafety(value) {
  if (!exactKeys(value, INSPECTION_SAFETY_KEYS)) return false;
  const requiredTrue = new Set(["readOnly", "nonPersistent", "referenceValidated"]);
  return INSPECTION_SAFETY_KEYS.every((key) => value[key] === requiredTrue.has(key));
}

function validateInspection(value, binding) {
  if (!exactKeys(value, INSPECTION_KEYS)) return { ok: false, blocker: "inspection_invalid_shape" };
  if (
    value.schemaId !== INSPECTION_SCHEMA_ID || value.schemaVersion !== INSPECTION_SCHEMA_VERSION
    || value.state !== "ready_read_only" || !INSPECTION_ID_PATTERN.test(value.inspectionId)
  ) return { ok: false, blocker: "inspection_schema_or_identity_invalid" };
  const reference = validateReferenceIdentity(value.referenceIdentity);
  if (!reference.ok) return { ok: false, blocker: "inspection_reference_identity_invalid" };
  if (!exactValue(reference.value, binding.referenceIdentity)) {
    return { ok: false, blocker: "inspection_binding_reference_mismatch" };
  }
  if (value.inspectionId !== `ies-reference-generation-inspection-v1:${reference.value.referenceSha256}`) {
    return { ok: false, blocker: "inspection_deterministic_identity_mismatch" };
  }
  if (value.keywordProfileId !== KEYWORD_PROFILE_ID) return { ok: false, blocker: "inspection_keyword_profile_invalid" };
  if (!exactKeys(value.baseline, BASELINE_KEYS)) return { ok: false, blocker: "inspection_baseline_invalid_shape" };
  const baseline = {};
  for (const key of BASELINE_KEYS) {
    baseline[key] = finiteNumber(value.baseline[key]);
    if (baseline[key] === null) return { ok: false, blocker: "inspection_baseline_invalid" };
  }
  if (
    !exactTimesThousand(baseline.fluxPerMm, baseline.baselineLmPerM)
    || !exactTimesThousand(baseline.wallWattsPerMm, baseline.baselineWallWattsPerM)
    || !exactTimesThousand(baseline.circuitWattsPerMm, baseline.baselineCircuitWattsPerM)
  ) return { ok: false, blocker: "inspection_baseline_projection_mismatch" };
  if (!Array.isArray(value.missingKeywordOverrides) || value.missingKeywordOverrides.length !== 0) {
    return { ok: false, blocker: "inspection_missing_keyword_overrides" };
  }
  if (value.materialisationWithoutOverrides !== true) {
    return { ok: false, blocker: "inspection_materialisation_without_overrides_required" };
  }
  const blockers = canonicalStrings(value.blockers, { maximum: 0, blockers: true });
  const warnings = canonicalStrings(value.warnings);
  if (!blockers || !warnings) return { ok: false, blocker: "inspection_diagnostics_invalid" };
  if (!exactKeys(value.audit, INSPECTION_AUDIT_KEYS)) return { ok: false, blocker: "inspection_audit_invalid_shape" };
  if (!validateInspectionSafety(value.safetyFlags)) return { ok: false, blocker: "inspection_safety_invalid" };
  if (
    value.audit.schemaId !== INSPECTION_AUDIT_SCHEMA_ID
    || value.audit.schemaVersion !== INSPECTION_AUDIT_SCHEMA_VERSION
    || value.audit.attemptId !== value.inspectionId || value.audit.state !== "accepted_read_only"
    || value.audit.accepted !== true || value.audit.inspectionId !== value.inspectionId
    || value.audit.referenceId !== reference.value.referenceId || value.audit.deterministic !== true
    || value.audit.referenceValidated !== true || value.audit.jobValidated !== false
    || value.audit.materialiseInvoked !== false || value.audit.generatorInvoked !== false
    || value.audit.routeInvoked !== false || value.audit.persistenceAttempted !== false
    || value.audit.artifactWriteAttempted !== false || value.audit.emailAttempted !== false
  ) return { ok: false, blocker: "inspection_audit_invalid" };
  return {
    ok: true,
    value: {
      schemaId: value.schemaId, schemaVersion: value.schemaVersion,
      inspectionId: value.inspectionId, referenceIdentity: reference.value,
      keywordProfileId: value.keywordProfileId, baseline, warnings,
    },
  };
}

function mergeWarnings(...collections) {
  const output = [];
  const seen = new Set();
  for (const collection of collections) {
    for (const entry of collection) {
      if (!seen.has(entry)) {
        seen.add(entry);
        output.push(entry);
      }
    }
  }
  return output;
}

function planSafety(ready = false) {
  const output = {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    generationInputConsumed: ready,
    bindingConsumed: ready,
    inspectionConsumed: ready,
    multiplierDerived: ready,
    jobPlanned: ready,
    callerSelectionsAccepted: false,
    projectMetadataAccepted: false,
    sealedReferenceLoaded: false,
    resolverInvoked: false,
    storageAccessed: false,
    materialiseInvoked: false,
    generatorInvoked: false,
    iesGenerated: false,
    rawIesReturned: false,
    metadataReturned: false,
    anglesReturned: false,
    candelaReturned: false,
    keywordValuesReturned: false,
    sealedReferenceReturned: false,
    artifactWritten: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    downloadCreated: false,
    routeAdded: false,
    persistenceAttempted: false,
    readinessActivated: false,
  };
  if (!exactKeys(output, PLAN_SAFETY_KEYS)) throw new Error("internal plan safety shape mismatch");
  return output;
}

function planIdentity(generation, binding, inspection, multiplierBasis, job, blocker = null) {
  const payload = {
    schemaId: IES_MATERIALISATION_JOB_PLAN_SCHEMA_ID,
    schemaVersion: IES_MATERIALISATION_JOB_PLAN_SCHEMA_VERSION,
    sourceGeneration: generation ? {
      schemaId: generation.schemaId,
      schemaVersion: generation.schemaVersion,
      generationInputId: generation.generationInputId,
      replayKey: generation.replayKey,
    } : null,
    sourceBinding: binding ? {
      schemaId: binding.schemaId,
      schemaVersion: binding.schemaVersion,
      bindingId: binding.bindingId,
      replayKey: binding.replayKey,
    } : null,
    sourceInspection: inspection ? {
      schemaId: inspection.schemaId,
      schemaVersion: inspection.schemaVersion,
      inspectionId: inspection.inspectionId,
    } : null,
    selection: generation?.selection ?? null,
    run: generation?.run ?? null,
    referenceIdentity: binding?.referenceIdentity ?? null,
    multiplierBasis,
    job,
    blocker,
  };
  const attemptFingerprint = stableFingerprint("ies-materialisation-job-plan-attempt-v1", payload);
  if (!generation || !binding || !inspection || !multiplierBasis || !job || blocker) {
    return { attemptFingerprint, planId: null, replayKey: null };
  }
  const planId = stableFingerprint("ies-materialisation-job-plan-v1", payload);
  const replayKey = stableFingerprint("ies-materialisation-job-plan-replay-v1", {
    planId,
    generationReplayKey: generation.replayKey,
    bindingReplayKey: binding.replayKey,
    inspectionId: inspection.inspectionId,
  });
  return { attemptFingerprint, planId, replayKey };
}

function planAudit(identity, accepted) {
  const output = {
    schemaId: IES_MATERIALISATION_JOB_PLAN_AUDIT_SCHEMA_ID,
    schemaVersion: IES_MATERIALISATION_JOB_PLAN_AUDIT_SCHEMA_VERSION,
    attemptFingerprint: identity.attemptFingerprint,
    state: accepted ? "accepted_read_only" : "blocked_fail_closed",
    accepted,
    planId: identity.planId,
    replayKey: identity.replayKey,
    deterministic: true,
    traceabilityInspected: false,
    generationInputValidated: accepted,
    bindingValidated: accepted,
    inspectionValidated: accepted,
    multiplierDerived: accepted,
    jobPlanned: accepted,
    sealedReferenceLoaded: false,
    materialiseInvoked: false,
    generatorInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
  if (!exactKeys(output, PLAN_AUDIT_KEYS)) throw new Error("internal plan audit shape mismatch");
  return output;
}

function blockedPlan(blocker) {
  const safeBlocker = typeof blocker === "string" && BLOCKER_PATTERN.test(blocker)
    ? blocker
    : "ies_materialisation_job_plan_blocked";
  const identity = planIdentity(null, null, null, null, null, safeBlocker);
  return deepFreeze({
    schemaId: IES_MATERIALISATION_JOB_PLAN_SCHEMA_ID,
    schemaVersion: IES_MATERIALISATION_JOB_PLAN_SCHEMA_VERSION,
    state: IES_MATERIALISATION_JOB_PLAN_STATES.blockedFailClosed,
    planId: null,
    replayKey: null,
    sourceGeneration: null,
    sourceBinding: null,
    sourceInspection: null,
    selection: null,
    run: null,
    referenceIdentity: null,
    multiplierBasis: null,
    job: null,
    blockers: [safeBlocker],
    warnings: [],
    audit: planAudit(identity, false),
    safetyFlags: planSafety(false),
  });
}

export function buildIesMaterialisationJobPlanV1(generationInput, referenceBinding, referenceInspection) {
  if (arguments.length !== 3) return blockedPlan("materialisation_job_plan_input_arity_invalid");
  const generation = validateGenerationInput(generationInput);
  if (!generation.ok) return blockedPlan(generation.blocker);
  const binding = validateBinding(referenceBinding, generation.value);
  if (!binding.ok) return blockedPlan(binding.blocker);
  const inspection = validateInspection(referenceInspection, binding.value);
  if (!inspection.ok) return blockedPlan(inspection.blocker);

  const verifiedLmPerM = generation.value.thermal.verifiedLmPerM;
  const baselineLmPerM = inspection.value.baseline.baselineLmPerM;
  if (!(verifiedLmPerM > 0)) return blockedPlan("verified_lm_per_m_positive_required");
  if (!(baselineLmPerM > 0)) return blockedPlan("baseline_lm_per_m_positive_required");
  const outputMultiplier = verifiedLmPerM / baselineLmPerM;
  if (!Number.isFinite(outputMultiplier) || !(outputMultiplier > 0)) {
    return blockedPlan("output_multiplier_positive_finite_required");
  }

  const multiplierBasis = {
    verifiedLmPerM,
    baselineLmPerM,
    targetLmPerM: generation.value.selection.targetLmPerM,
    targetLmPerMIsIntentOnly: true,
    formula: "verifiedLmPerM / baselineLmPerM",
    outputMultiplier,
  };
  const job = {
    runLengthMm: generation.value.run.lengthMm,
    outputMultiplier,
    selections: {},
  };
  if (!exactKeys(multiplierBasis, MULTIPLIER_BASIS_KEYS) || !exactKeys(job, JOB_KEYS)) {
    return blockedPlan("materialisation_job_plan_internal_shape_invalid");
  }
  if (!isPlainObject(job.selections) || Object.keys(job.selections).length !== 0) {
    return blockedPlan("materialisation_job_plan_selections_not_empty");
  }

  const identity = planIdentity(generation.value, binding.value, inspection.value, multiplierBasis, job);
  if (!PLAN_ID_PATTERN.test(identity.planId) || !PLAN_REPLAY_PATTERN.test(identity.replayKey)) {
    return blockedPlan("materialisation_job_plan_identity_invalid");
  }
  const sourceGeneration = {
    schemaId: generation.value.schemaId,
    schemaVersion: generation.value.schemaVersion,
    generationInputId: generation.value.generationInputId,
    replayKey: generation.value.replayKey,
  };
  const sourceBinding = {
    schemaId: binding.value.schemaId,
    schemaVersion: binding.value.schemaVersion,
    bindingId: binding.value.bindingId,
    replayKey: binding.value.replayKey,
  };
  const sourceInspection = {
    schemaId: inspection.value.schemaId,
    schemaVersion: inspection.value.schemaVersion,
    inspectionId: inspection.value.inspectionId,
  };
  if (
    !exactKeys(sourceGeneration, SOURCE_GENERATION_KEYS)
    || !exactKeys(sourceBinding, SOURCE_BINDING_KEYS)
    || !exactKeys(sourceInspection, SOURCE_INSPECTION_KEYS)
  ) return blockedPlan("materialisation_job_plan_source_shape_invalid");

  return deepFreeze({
    schemaId: IES_MATERIALISATION_JOB_PLAN_SCHEMA_ID,
    schemaVersion: IES_MATERIALISATION_JOB_PLAN_SCHEMA_VERSION,
    state: IES_MATERIALISATION_JOB_PLAN_STATES.readyReadOnly,
    planId: identity.planId,
    replayKey: identity.replayKey,
    sourceGeneration,
    sourceBinding,
    sourceInspection,
    selection: clonePlain(generation.value.selection),
    run: clonePlain(generation.value.run),
    referenceIdentity: clonePlain(binding.value.referenceIdentity),
    multiplierBasis,
    job,
    blockers: [],
    warnings: mergeWarnings(generation.value.warnings, binding.value.warnings, inspection.value.warnings),
    audit: planAudit(identity, true),
    safetyFlags: planSafety(true),
  });
}

function freezeForHash(value) {
  if (value === null || value === undefined) return value;
  if (["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((entry) => freezeForHash(entry));
  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, freezeForHash(value[key])]);
  }
  return String(value);
}

function stableFingerprint(prefix, value) {
  return `${prefix}:${sha1Hex(JSON.stringify(freezeForHash(value)))}`;
}

function utf8Bytes(text) {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(String(text));
  const encoded = unescape(encodeURIComponent(String(text)));
  const bytes = new Uint8Array(encoded.length);
  for (let index = 0; index < encoded.length; index += 1) bytes[index] = encoded.charCodeAt(index);
  return bytes;
}

function rotateLeft(value, bits) {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function sha1Hex(text) {
  const bytes = utf8Bytes(text);
  const bitLength = BigInt(bytes.length) * 8n;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  for (let index = 0; index < 8; index += 1) {
    padded[paddedLength - 1 - index] = Number((bitLength >> BigInt(index * 8)) & 0xffn);
  }
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  const words = new Uint32Array(80);
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    for (let index = 0; index < 16; index += 1) {
      const offset = chunk + index * 4;
      words[index] = (
        (padded[offset] << 24) | (padded[offset + 1] << 16)
        | (padded[offset + 2] << 8) | padded[offset + 3]
      ) >>> 0;
    }
    for (let index = 16; index < 80; index += 1) {
      words[index] = rotateLeft(words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16], 1);
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    for (let index = 0; index < 80; index += 1) {
      let f;
      let k;
      if (index < 20) { f = (b & c) | ((~b) & d); k = 0x5a827999; }
      else if (index < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (index < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const temp = (rotateLeft(a, 5) + f + e + k + words[index]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4]
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}
