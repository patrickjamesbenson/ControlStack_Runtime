// ControlStack Lab — import-free binding of a public IES generation input to one public OPT reference identity.
// This module validates plain JSON only. It does not resolve, load, generate, persist, route, or write.

export const IES_GENERATION_REFERENCE_BINDING_SCHEMA_ID =
  "controlstack.lab.ies-generation-reference-binding.v1";
export const IES_GENERATION_REFERENCE_BINDING_SCHEMA_VERSION = 1;
export const IES_GENERATION_REFERENCE_BINDING_AUDIT_SCHEMA_ID =
  "controlstack.lab.ies-generation-reference-binding-audit.v1";
export const IES_GENERATION_REFERENCE_BINDING_AUDIT_SCHEMA_VERSION = 1;

export const IES_GENERATION_REFERENCE_BINDING_STATES = Object.freeze({
  readyReadOnly: "ready_read_only",
  blockedFailClosed: "blocked_fail_closed",
});

const GENERATION_INPUT_SCHEMA_ID = "controlstack.downstream.ies-generation-input.v1";
const GENERATION_INPUT_SCHEMA_VERSION = 1;
const GENERATION_INPUT_AUDIT_SCHEMA_ID =
  "controlstack.downstream.ies-generation-input-audit.v1";
const GENERATION_INPUT_AUDIT_SCHEMA_VERSION = 1;
const ARTIFACT_REQUEST_SCHEMA_ID = "controlstack.downstream.ies-artifact-request.v1";
const ARTIFACT_REQUEST_SCHEMA_VERSION = 1;
const ARTIFACT_INTENT_SCHEMA_ID = "controlstack.downstream.ies-artifact-intent.v1";
const ARTIFACT_INTENT_SCHEMA_VERSION = 1;
const ARTIFACT_KIND = "ies_lm63_reference_build";
const ENGINE_OUTPUT_SCHEMA_ID = "controlstack.engine.output.v1";
const ENGINE_OUTPUT_SCHEMA_VERSION = 1;
const NVB_LAB_PROJECTION_SCHEMA_ID = "controlstack.lab.nvb-lab-projection.v2";
const NVB_LAB_PROJECTION_SCHEMA_VERSION = 2;
const REFERENCE_IDENTITY_SCHEMA_ID = "controlstack.lab.reference-identity.v1";
const REFERENCE_IDENTITY_SCHEMA_VERSION = 1;

const GENERATION_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "generationInputId",
  "replayKey",
  "sourceRequest",
  "artifactIntent",
  "engineContract",
  "selection",
  "run",
  "technicalProvenance",
  "thermal",
  "blockers",
  "warnings",
  "audit",
  "safetyFlags",
]);
const SOURCE_REQUEST_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "requestId",
  "replayKey",
]);
const INTENT_KEYS = Object.freeze(["schemaId", "schemaVersion", "artifactKind"]);
const ENGINE_KEYS = Object.freeze([
  "outputSchemaId",
  "outputSchemaVersion",
  "outputState",
  "resultId",
  "requestFingerprint",
  "sourceVersionFingerprint",
  "policyFingerprint",
  "evidenceFingerprints",
]);
const SELECTION_KEYS = Object.freeze([
  "system",
  "optic",
  "targetLmPerM",
  "roomAmbientTaC",
  "protocol",
]);
const RUN_KEYS = Object.freeze(["runIndex", "quantity", "lengthMm"]);
const PROVENANCE_KEYS = Object.freeze([
  "selectedOpticKey",
  "opticBomId",
  "evidenceRef",
  "programValidationState",
  "selectedTierOrProfile",
]);
const THERMAL_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "selectedOpticKey",
  "opticBomId",
  "sourceRevision",
  "evidenceRef",
  "programValidationState",
  "selectedRoomTaC",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
  "derivedInternalTaC",
  "curveLookupTaC",
  "effectiveCurveTaC",
  "temperatureMode",
  "requestedCurrentMa",
  "currentMode",
  "verifiedLmPerM",
  "curveFilename",
  "curveChecksumVerified",
  "opticRiseAppliedCount",
  "readOnly",
  "safetyFlags",
]);
const THERMAL_SAFETY_KEYS = Object.freeze([
  "donorEngineInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "runTableGenerated",
  "iesGenerated",
  "outputGenerated",
  "rawCurveRowsReturned",
  "rawCurvePayloadReturned",
  "publicRouteAdded",
  "postEndpointAdded",
]);
const GENERATION_AUDIT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "attemptFingerprint",
  "state",
  "accepted",
  "generationInputId",
  "replayKey",
  "deterministic",
  "traceabilityInspected",
  "artifactRequestValidated",
  "selectionRequestValidated",
  "referenceBound",
  "sealedReferenceLoaded",
  "generatorInvoked",
  "routeInvoked",
  "persistenceAttempted",
  "artifactWriteAttempted",
  "emailAttempted",
]);
const GENERATION_SAFETY_KEYS = Object.freeze([
  "readOnly",
  "nonPersistent",
  "traceabilityEnvelopeIgnored",
  "artifactRequestConsumed",
  "selectionRequestConsumed",
  "referenceBound",
  "sealedReferenceLoaded",
  "authorityInspected",
  "authorityMutated",
  "referenceMutated",
  "engineInvoked",
  "donorEngineInvoked",
  "labConsumerInvoked",
  "iesGeneratorInvoked",
  "iesGenerated",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaReturned",
  "artifactWritten",
  "fileWritten",
  "networkWritten",
  "emailSent",
  "downloadCreated",
  "routeAdded",
  "postEndpointAdded",
  "persistenceAttempted",
  "runtimeDataMutated",
  "downstreamActivated",
]);

const LAB_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "path",
  "family",
  "selection",
  "governingThermals",
  "references",
  "thermalEvidence",
  "unresolved",
  "assemblyVerification",
  "readOnly",
]);
const LAB_SELECTION_KEYS = Object.freeze([
  "opticBomId",
  "opticVariant",
  "specCode",
  "emissionPermission",
]);
const GOVERNING_THERMAL_KEYS = Object.freeze([
  "systemLabel",
  "systemVariant",
  "metalAreaMm2",
  "airAreaMm2",
]);
const REFERENCES_KEYS = Object.freeze(["gearTray", "optic"]);
const THERMAL_EVIDENCE_KEYS = Object.freeze([
  "opticBomId",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
  "evidenceRef",
  "authorityState",
]);
const ASSEMBLY_KEYS = Object.freeze(["emergency", "ewisCartridge"]);
const REFERENCE_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "referenceId",
  "kind",
  "serial",
  "sealedAtUtc",
  "authorityRecordSha256",
  "referenceSha256",
  "resolverPath",
  "readOnly",
]);

const SOURCE_GENERATION_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "generationInputId",
  "replayKey",
]);
const TECHNICAL_BINDING_KEYS = Object.freeze([
  "selectedOpticKey",
  "opticBomId",
  "evidenceRef",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
]);
const BINDING_AUDIT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "attemptFingerprint",
  "state",
  "accepted",
  "bindingId",
  "replayKey",
  "deterministic",
  "traceabilityInspected",
  "generationInputValidated",
  "labProjectionValidated",
  "referenceIdentityBound",
  "resolverInvoked",
  "sealedReferenceLoaded",
  "authorityInspected",
  "generatorInvoked",
  "routeInvoked",
  "persistenceAttempted",
  "artifactWriteAttempted",
  "emailAttempted",
]);
const BINDING_SAFETY_KEYS = Object.freeze([
  "readOnly",
  "nonPersistent",
  "traceabilityEnvelopeIgnored",
  "generationInputConsumed",
  "labProjectionConsumed",
  "referenceIdentityBound",
  "resolverInvoked",
  "storageAccessed",
  "sealedReferenceLoaded",
  "authorityInspected",
  "authorityMutated",
  "evidenceAccepted",
  "referenceMutated",
  "generatorInvoked",
  "iesGenerated",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaReturned",
  "artifactWritten",
  "fileWritten",
  "networkWritten",
  "emailSent",
  "downloadCreated",
  "routeAdded",
  "persistenceAttempted",
  "readinessActivated",
]);

const GENERATION_ID_PATTERN = /^ies-generation-input-v1:[0-9a-f]{40}$/;
const GENERATION_REPLAY_PATTERN = /^ies-generation-input-replay-v1:[0-9a-f]{40}$/;
const ARTIFACT_REQUEST_ID_PATTERN = /^ies-artifact-request-v1:[0-9a-f]{40}$/;
const ARTIFACT_REPLAY_PATTERN = /^ies-artifact-replay-v1:[0-9a-f]{40}$/;
const BINDING_ID_PATTERN = /^ies-generation-reference-binding-v1:[0-9a-f]{40}$/;
const BINDING_REPLAY_PATTERN = /^ies-generation-reference-binding-replay-v1:[0-9a-f]{40}$/;
const FINGERPRINT_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{7,255}$/;
const BLOCKER_PATTERN = /^[a-z][a-z0-9_-]{0,127}$/;
const REFERENCE_ID_PATTERN = /^NVB-REF-(GT|OPT|MRG)-([0-9]{6})$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const EXACT_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/])/i;
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
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function boundedText(value, maximum = 256, nullable = false) {
  if (nullable && value === null) return null;
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > maximum
    || /[\u0000-\u001f\u007f]/.test(value)
    || PRIVATE_PATH_PATTERN.test(value)
    || RAW_CONTENT_PATTERN.test(value)
  ) return undefined;
  return value;
}

function finiteNumber(value, nullable = false) {
  if (nullable && value === null) return null;
  return typeof value === "number" && Number.isFinite(value)
    ? (Object.is(value, -0) ? 0 : value)
    : undefined;
}

function fingerprint(value) {
  return typeof value === "string"
    && FINGERPRINT_PATTERN.test(value)
    && !PRIVATE_PATH_PATTERN.test(value)
    && !RAW_CONTENT_PATTERN.test(value)
    ? value
    : null;
}

function canonicalStrings(value, { minimum = 0, maximum = 64, blockers = false } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
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

function fingerprintArray(value) {
  if (!Array.isArray(value) || value.length !== 1) return null;
  const token = fingerprint(value[0]);
  return token ? [token] : null;
}

function validateThermalSafety(value) {
  return exactKeys(value, THERMAL_SAFETY_KEYS)
    && THERMAL_SAFETY_KEYS.every((key) => value[key] === false);
}

function validateThermal(value, provenance, selection) {
  if (!exactKeys(value, THERMAL_KEYS)) return { ok: false, blocker: "generation_thermal_invalid_shape" };
  const textKeys = [
    "schemaId",
    "selectedOpticKey",
    "opticBomId",
    "sourceRevision",
    "evidenceRef",
    "programValidationState",
    "temperatureMode",
    "currentMode",
    "curveFilename",
  ];
  const output = { schemaVersion: value.schemaVersion };
  for (const key of textKeys) {
    output[key] = boundedText(value[key]);
    if (!output[key]) return { ok: false, blocker: "generation_thermal_text_invalid" };
  }
  for (const key of [
    "selectedRoomTaC",
    "referenceRoomTaC",
    "referenceInternalTaC",
    "opticThermalRiseTaC",
    "derivedInternalTaC",
    "curveLookupTaC",
    "effectiveCurveTaC",
    "requestedCurrentMa",
    "verifiedLmPerM",
  ]) {
    output[key] = finiteNumber(value[key]);
    if (output[key] === undefined) return { ok: false, blocker: "generation_thermal_number_invalid" };
  }
  if (!TEMPERATURE_MODES.has(output.temperatureMode) || !CURRENT_MODES.has(output.currentMode)) {
    return { ok: false, blocker: "generation_thermal_mode_invalid" };
  }
  if (
    value.curveChecksumVerified !== true
    || value.opticRiseAppliedCount !== 1
    || value.readOnly !== true
    || !validateThermalSafety(value.safetyFlags)
  ) return { ok: false, blocker: "generation_thermal_safety_invalid" };
  if (
    output.selectedOpticKey !== provenance.selectedOpticKey
    || output.opticBomId !== provenance.opticBomId
    || output.evidenceRef !== provenance.evidenceRef
    || output.programValidationState !== provenance.programValidationState
    || output.selectedOpticKey !== selection.optic
    || output.selectedRoomTaC !== selection.roomAmbientTaC
  ) return { ok: false, blocker: "generation_thermal_identity_mismatch" };
  if (
    output.referenceRoomTaC + output.opticThermalRiseTaC !== output.referenceInternalTaC
    || output.selectedRoomTaC + output.opticThermalRiseTaC !== output.derivedInternalTaC
    || output.curveLookupTaC !== output.derivedInternalTaC
  ) return { ok: false, blocker: "generation_thermal_equation_mismatch" };
  if (output.opticThermalRiseTaC < 0 || output.requestedCurrentMa < 0 || output.verifiedLmPerM < 0) {
    return { ok: false, blocker: "generation_thermal_non_negative_required" };
  }
  if (/[/\\]/.test(output.curveFilename)) {
    return { ok: false, blocker: "generation_thermal_private_path_rejected" };
  }
  if (
    (output.temperatureMode === "clamped-low" && output.effectiveCurveTaC !== 25)
    || (output.temperatureMode === "clamped-high" && output.effectiveCurveTaC !== 65)
    || (output.temperatureMode === "interpolated" && output.effectiveCurveTaC !== output.curveLookupTaC)
  ) return { ok: false, blocker: "generation_thermal_effective_temperature_mismatch" };
  return {
    ok: true,
    value: {
      ...output,
      curveChecksumVerified: true,
      opticRiseAppliedCount: 1,
      readOnly: true,
      safetyFlags: clonePlain(value.safetyFlags),
    },
  };
}

function validateGenerationSafety(value) {
  if (!exactKeys(value, GENERATION_SAFETY_KEYS)) return false;
  const requiredTrue = new Set([
    "readOnly",
    "nonPersistent",
    "traceabilityEnvelopeIgnored",
    "artifactRequestConsumed",
    "selectionRequestConsumed",
  ]);
  return GENERATION_SAFETY_KEYS.every((key) => value[key] === requiredTrue.has(key));
}

function expectedGenerationIdentity(value) {
  const payload = {
    schemaId: GENERATION_INPUT_SCHEMA_ID,
    schemaVersion: GENERATION_INPUT_SCHEMA_VERSION,
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
    value.schemaId !== GENERATION_INPUT_SCHEMA_ID
    || value.schemaVersion !== GENERATION_INPUT_SCHEMA_VERSION
    || value.state !== "ready_read_only"
    || !GENERATION_ID_PATTERN.test(value.generationInputId)
    || !GENERATION_REPLAY_PATTERN.test(value.replayKey)
  ) return { ok: false, blocker: "generation_input_schema_or_identity_invalid" };

  if (!exactKeys(value.sourceRequest, SOURCE_REQUEST_KEYS)) {
    return { ok: false, blocker: "generation_source_request_invalid_shape" };
  }
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
  const evidenceFingerprints = fingerprintArray(value.engineContract.evidenceFingerprints);
  if (
    value.engineContract.outputSchemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.engineContract.outputSchemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
    || value.engineContract.outputState !== "complete"
    || !fingerprint(value.engineContract.resultId)
    || !fingerprint(value.engineContract.requestFingerprint)
    || !fingerprint(value.engineContract.sourceVersionFingerprint)
    || !fingerprint(value.engineContract.policyFingerprint)
    || !evidenceFingerprints
  ) return { ok: false, blocker: "generation_engine_identity_invalid" };

  if (!exactKeys(value.selection, SELECTION_KEYS)) return { ok: false, blocker: "generation_selection_invalid_shape" };
  const selection = {};
  for (const key of ["system", "optic", "protocol"]) {
    selection[key] = boundedText(value.selection[key]);
    if (!selection[key]) return { ok: false, blocker: "generation_selection_text_invalid" };
  }
  selection.targetLmPerM = finiteNumber(value.selection.targetLmPerM);
  selection.roomAmbientTaC = finiteNumber(value.selection.roomAmbientTaC);
  if (selection.targetLmPerM === undefined || selection.targetLmPerM < 0 || selection.roomAmbientTaC === undefined) {
    return { ok: false, blocker: "generation_selection_number_invalid" };
  }

  if (!exactKeys(value.run, RUN_KEYS)) return { ok: false, blocker: "generation_run_invalid_shape" };
  if (
    value.run.runIndex !== 0
    || !Number.isSafeInteger(value.run.quantity)
    || value.run.quantity < 1
    || !Number.isSafeInteger(value.run.lengthMm)
    || value.run.lengthMm < 1
  ) return { ok: false, blocker: "generation_run_invalid" };
  const run = clonePlain(value.run);

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
    value.generationInputId !== expected.generationInputId
    || value.replayKey !== expected.replayKey
    || value.audit.schemaId !== GENERATION_INPUT_AUDIT_SCHEMA_ID
    || value.audit.schemaVersion !== GENERATION_INPUT_AUDIT_SCHEMA_VERSION
    || value.audit.attemptFingerprint !== expected.attemptFingerprint
    || value.audit.state !== "accepted_read_only"
    || value.audit.accepted !== true
    || value.audit.generationInputId !== value.generationInputId
    || value.audit.replayKey !== value.replayKey
    || value.audit.deterministic !== true
    || value.audit.traceabilityInspected !== false
    || value.audit.artifactRequestValidated !== true
    || value.audit.selectionRequestValidated !== true
    || value.audit.referenceBound !== false
    || value.audit.sealedReferenceLoaded !== false
    || value.audit.generatorInvoked !== false
    || value.audit.routeInvoked !== false
    || value.audit.persistenceAttempted !== false
    || value.audit.artifactWriteAttempted !== false
    || value.audit.emailAttempted !== false
  ) return { ok: false, blocker: "generation_deterministic_identity_or_audit_mismatch" };

  return {
    ok: true,
    value: {
      schemaId: value.schemaId,
      schemaVersion: value.schemaVersion,
      generationInputId: value.generationInputId,
      replayKey: value.replayKey,
      sourceRequest: clonePlain(value.sourceRequest),
      artifactIntent: clonePlain(value.artifactIntent),
      engineContract: {
        ...clonePlain(value.engineContract),
        evidenceFingerprints,
      },
      selection,
      run,
      technicalProvenance: provenance,
      thermal: thermal.value,
      warnings,
    },
  };
}

function validateReferenceIdentity(value, expectedKind, nullable = false) {
  if (nullable && value === null) return { ok: true, value: null };
  if (!exactKeys(value, REFERENCE_KEYS)) return { ok: false, blocker: "reference_identity_invalid_shape" };
  const match = typeof value.referenceId === "string" ? REFERENCE_ID_PATTERN.exec(value.referenceId) : null;
  const parsedKind = match?.[1] === "MRG" ? "MERGED" : match?.[1];
  const parsedSerial = match ? Number(match[2]) : null;
  if (
    value.schemaId !== REFERENCE_IDENTITY_SCHEMA_ID
    || value.schemaVersion !== REFERENCE_IDENTITY_SCHEMA_VERSION
    || !match
    || parsedKind !== value.kind
    || parsedSerial !== value.serial
    || value.kind !== expectedKind
    || !Number.isSafeInteger(value.serial)
    || value.serial < 1
    || !EXACT_UTC_PATTERN.test(value.sealedAtUtc)
    || !Number.isFinite(Date.parse(value.sealedAtUtc))
    || !SHA256_PATTERN.test(value.authorityRecordSha256)
    || !SHA256_PATTERN.test(value.referenceSha256)
    || value.resolverPath !== `/r/${value.referenceId}`
    || value.readOnly !== true
  ) return { ok: false, blocker: "reference_identity_invalid" };
  return { ok: true, value: clonePlain(value) };
}

function validateLabProjection(value) {
  if (!exactKeys(value, LAB_KEYS)) return { ok: false, blocker: "lab_projection_invalid_shape" };
  if (
    value.schemaId !== NVB_LAB_PROJECTION_SCHEMA_ID
    || value.schemaVersion !== NVB_LAB_PROJECTION_SCHEMA_VERSION
  ) return { ok: false, blocker: "lab_projection_schema_unsupported" };
  if (value.path !== "optic") return { ok: false, blocker: "lab_projection_optic_path_required" };
  if (!(typeof value.family === "string" || Number.isFinite(value.family))) {
    return { ok: false, blocker: "lab_projection_family_invalid" };
  }
  if (!exactKeys(value.selection, LAB_SELECTION_KEYS)) return { ok: false, blocker: "lab_selection_invalid_shape" };
  const selection = {};
  for (const key of LAB_SELECTION_KEYS) {
    selection[key] = boundedText(value.selection[key], 256, true);
    if (selection[key] === undefined) return { ok: false, blocker: "lab_selection_invalid" };
  }
  if (!selection.opticBomId || !selection.opticVariant) {
    return { ok: false, blocker: "lab_optic_selection_required" };
  }

  if (!exactKeys(value.governingThermals, GOVERNING_THERMAL_KEYS)) {
    return { ok: false, blocker: "lab_governing_thermals_invalid_shape" };
  }
  const governingThermals = {};
  for (const key of ["systemLabel", "systemVariant"]) {
    governingThermals[key] = boundedText(value.governingThermals[key], 256, true);
    if (governingThermals[key] === undefined) return { ok: false, blocker: "lab_governing_thermals_invalid" };
  }
  for (const key of ["metalAreaMm2", "airAreaMm2"]) {
    governingThermals[key] = finiteNumber(value.governingThermals[key], true);
    if (governingThermals[key] === undefined) return { ok: false, blocker: "lab_governing_thermals_invalid" };
  }

  if (!exactKeys(value.references, REFERENCES_KEYS)) return { ok: false, blocker: "lab_references_invalid_shape" };
  const gearTray = validateReferenceIdentity(value.references.gearTray, "GT", true);
  if (!gearTray.ok) return { ok: false, blocker: "lab_gear_tray_reference_invalid" };
  const opticReference = validateReferenceIdentity(value.references.optic, "OPT", false);
  if (!opticReference.ok) return { ok: false, blocker: "lab_optic_reference_invalid" };

  if (!exactKeys(value.thermalEvidence, THERMAL_EVIDENCE_KEYS)) {
    return { ok: false, blocker: "lab_thermal_evidence_invalid_shape" };
  }
  const thermalEvidence = {
    opticBomId: boundedText(value.thermalEvidence.opticBomId),
    referenceRoomTaC: finiteNumber(value.thermalEvidence.referenceRoomTaC),
    referenceInternalTaC: finiteNumber(value.thermalEvidence.referenceInternalTaC),
    opticThermalRiseTaC: finiteNumber(value.thermalEvidence.opticThermalRiseTaC),
    evidenceRef: boundedText(value.thermalEvidence.evidenceRef),
    authorityState: value.thermalEvidence.authorityState,
  };
  if (
    !thermalEvidence.opticBomId
    || thermalEvidence.referenceRoomTaC === undefined
    || thermalEvidence.referenceInternalTaC === undefined
    || thermalEvidence.opticThermalRiseTaC === undefined
    || !thermalEvidence.evidenceRef
    || thermalEvidence.authorityState !== null
    || thermalEvidence.referenceRoomTaC + thermalEvidence.opticThermalRiseTaC
      !== thermalEvidence.referenceInternalTaC
  ) return { ok: false, blocker: "lab_thermal_evidence_invalid" };

  const unresolved = canonicalStrings(value.unresolved, { maximum: 0, blockers: true });
  if (!unresolved) return { ok: false, blocker: "lab_projection_unresolved" };
  if (
    !exactKeys(value.assemblyVerification, ASSEMBLY_KEYS)
    || value.assemblyVerification.emergency !== null
    || value.assemblyVerification.ewisCartridge !== null
    || value.readOnly !== true
  ) return { ok: false, blocker: "lab_projection_safety_invalid" };

  return {
    ok: true,
    value: {
      schemaId: value.schemaId,
      schemaVersion: value.schemaVersion,
      path: value.path,
      family: value.family,
      selection,
      governingThermals,
      opticReference: opticReference.value,
      thermalEvidence,
      unresolved,
    },
  };
}

function bindingSafety(ready = false) {
  const output = {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    generationInputConsumed: ready,
    labProjectionConsumed: ready,
    referenceIdentityBound: ready,
    resolverInvoked: false,
    storageAccessed: false,
    sealedReferenceLoaded: false,
    authorityInspected: false,
    authorityMutated: false,
    evidenceAccepted: false,
    referenceMutated: false,
    generatorInvoked: false,
    iesGenerated: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaReturned: false,
    artifactWritten: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    downloadCreated: false,
    routeAdded: false,
    persistenceAttempted: false,
    readinessActivated: false,
  };
  if (!exactKeys(output, BINDING_SAFETY_KEYS)) throw new Error("internal binding safety shape mismatch");
  return output;
}

function bindingIdentity(generation, lab, blocker = null) {
  const technicalBinding = generation && lab ? {
    selectedOpticKey: generation.technicalProvenance.selectedOpticKey,
    opticBomId: generation.technicalProvenance.opticBomId,
    evidenceRef: generation.technicalProvenance.evidenceRef,
    referenceRoomTaC: generation.thermal.referenceRoomTaC,
    referenceInternalTaC: generation.thermal.referenceInternalTaC,
    opticThermalRiseTaC: generation.thermal.opticThermalRiseTaC,
  } : null;
  const payload = {
    schemaId: IES_GENERATION_REFERENCE_BINDING_SCHEMA_ID,
    schemaVersion: IES_GENERATION_REFERENCE_BINDING_SCHEMA_VERSION,
    generationInputId: generation?.generationInputId ?? null,
    generationReplayKey: generation?.replayKey ?? null,
    selection: generation?.selection ?? null,
    run: generation?.run ?? null,
    technicalBinding,
    referenceIdentity: lab?.opticReference ?? null,
    blocker,
  };
  const attemptFingerprint = stableFingerprint("ies-generation-reference-binding-attempt-v1", payload);
  if (!generation || !lab || blocker) {
    return { attemptFingerprint, bindingId: null, replayKey: null, technicalBinding };
  }
  const bindingId = stableFingerprint("ies-generation-reference-binding-v1", payload);
  const replayKey = stableFingerprint("ies-generation-reference-binding-replay-v1", {
    bindingId,
    generationReplayKey: generation.replayKey,
    referenceSha256: lab.opticReference.referenceSha256,
  });
  return { attemptFingerprint, bindingId, replayKey, technicalBinding };
}

function bindingAudit(identity, accepted) {
  const output = {
    schemaId: IES_GENERATION_REFERENCE_BINDING_AUDIT_SCHEMA_ID,
    schemaVersion: IES_GENERATION_REFERENCE_BINDING_AUDIT_SCHEMA_VERSION,
    attemptFingerprint: identity.attemptFingerprint,
    state: accepted ? "accepted_read_only" : "blocked_fail_closed",
    accepted,
    bindingId: identity.bindingId,
    replayKey: identity.replayKey,
    deterministic: true,
    traceabilityInspected: false,
    generationInputValidated: accepted,
    labProjectionValidated: accepted,
    referenceIdentityBound: accepted,
    resolverInvoked: false,
    sealedReferenceLoaded: false,
    authorityInspected: false,
    generatorInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
  if (!exactKeys(output, BINDING_AUDIT_KEYS)) throw new Error("internal binding audit shape mismatch");
  return output;
}

function blockedBinding(blocker) {
  const safeBlocker = typeof blocker === "string" && BLOCKER_PATTERN.test(blocker)
    ? blocker
    : "ies_generation_reference_binding_blocked";
  const identity = bindingIdentity(null, null, safeBlocker);
  return deepFreeze({
    schemaId: IES_GENERATION_REFERENCE_BINDING_SCHEMA_ID,
    schemaVersion: IES_GENERATION_REFERENCE_BINDING_SCHEMA_VERSION,
    state: IES_GENERATION_REFERENCE_BINDING_STATES.blockedFailClosed,
    bindingId: null,
    replayKey: null,
    sourceGeneration: null,
    selection: null,
    run: null,
    technicalBinding: null,
    referenceIdentity: null,
    blockers: [safeBlocker],
    warnings: [],
    audit: bindingAudit(identity, false),
    safetyFlags: bindingSafety(false),
  });
}

export function adaptIesGenerationInputV1ReferenceBinding(
  generationInput,
  labProjection,
  ignoredOuterTraceability = null,
) {
  void ignoredOuterTraceability;
  const generation = validateGenerationInput(generationInput);
  if (!generation.ok) return blockedBinding(generation.blocker);
  const lab = validateLabProjection(labProjection);
  if (!lab.ok) return blockedBinding(lab.blocker);

  if (generation.value.selection.optic !== lab.value.selection.opticVariant) {
    return blockedBinding("optic_key_variant_mismatch");
  }
  if (
    generation.value.technicalProvenance.opticBomId !== lab.value.selection.opticBomId
    || generation.value.technicalProvenance.opticBomId !== lab.value.thermalEvidence.opticBomId
  ) return blockedBinding("optic_bom_binding_mismatch");
  if (generation.value.technicalProvenance.evidenceRef !== lab.value.thermalEvidence.evidenceRef) {
    return blockedBinding("evidence_reference_binding_mismatch");
  }
  if (
    generation.value.thermal.referenceRoomTaC !== lab.value.thermalEvidence.referenceRoomTaC
    || generation.value.thermal.referenceInternalTaC !== lab.value.thermalEvidence.referenceInternalTaC
    || generation.value.thermal.opticThermalRiseTaC !== lab.value.thermalEvidence.opticThermalRiseTaC
  ) return blockedBinding("measured_thermal_binding_mismatch");

  const identity = bindingIdentity(generation.value, lab.value);
  if (!BINDING_ID_PATTERN.test(identity.bindingId) || !BINDING_REPLAY_PATTERN.test(identity.replayKey)) {
    return blockedBinding("binding_identity_invalid");
  }
  const sourceGeneration = {
    schemaId: generation.value.schemaId,
    schemaVersion: generation.value.schemaVersion,
    generationInputId: generation.value.generationInputId,
    replayKey: generation.value.replayKey,
  };
  if (!exactKeys(sourceGeneration, SOURCE_GENERATION_KEYS)) {
    return blockedBinding("source_generation_shape_internal");
  }
  if (!exactKeys(identity.technicalBinding, TECHNICAL_BINDING_KEYS)) {
    return blockedBinding("technical_binding_shape_internal");
  }

  return deepFreeze({
    schemaId: IES_GENERATION_REFERENCE_BINDING_SCHEMA_ID,
    schemaVersion: IES_GENERATION_REFERENCE_BINDING_SCHEMA_VERSION,
    state: IES_GENERATION_REFERENCE_BINDING_STATES.readyReadOnly,
    bindingId: identity.bindingId,
    replayKey: identity.replayKey,
    sourceGeneration,
    selection: clonePlain(generation.value.selection),
    run: clonePlain(generation.value.run),
    technicalBinding: identity.technicalBinding,
    referenceIdentity: clonePlain(lab.value.opticReference),
    blockers: [],
    warnings: [...generation.value.warnings],
    audit: bindingAudit(identity, true),
    safetyFlags: bindingSafety(true),
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
        (padded[offset] << 24)
        | (padded[offset + 1] << 16)
        | (padded[offset + 2] << 8)
        | padded[offset + 3]
      ) >>> 0;
    }
    for (let index = 16; index < 80; index += 1) {
      words[index] = rotateLeft(
        words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16],
        1,
      );
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    for (let index = 0; index < 80; index += 1) {
      let f;
      let k;
      if (index < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (index < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (index < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
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
