// ControlStack Lab — read-only sealed-reference load preflight.
// Loads one sealed DTO through an injected capability, validates through the existing
// generation inspection boundary, returns a redacted receipt, and retains no loaded body.
import { inspectIesReferenceForGeneration } from "./iesFromReference.js";

export const IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_ID =
  "controlstack.lab.ies-sealed-reference-load-receipt.v1";
export const IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_VERSION = 1;
export const IES_SEALED_REFERENCE_LOAD_RECEIPT_AUDIT_SCHEMA_ID =
  "controlstack.lab.ies-sealed-reference-load-receipt-audit.v1";
export const IES_SEALED_REFERENCE_LOAD_RECEIPT_AUDIT_SCHEMA_VERSION = 1;
export const IES_SEALED_REFERENCE_LOAD_RECEIPT_STATES = Object.freeze({
  readyReadOnly: "ready_read_only",
  blockedFailClosed: "blocked_fail_closed",
});

const PLAN_SCHEMA_ID = "controlstack.lab.ies-materialisation-job-plan.v1";
const GENERATION_SCHEMA_ID = "controlstack.downstream.ies-generation-input.v1";
const PLAN_AUDIT_SCHEMA_ID = "controlstack.lab.ies-materialisation-job-plan-audit.v1";
const BINDING_SCHEMA_ID = "controlstack.lab.ies-generation-reference-binding.v1";
const BINDING_AUDIT_SCHEMA_ID = "controlstack.lab.ies-generation-reference-binding-audit.v1";
const INSPECTION_SCHEMA_ID = "controlstack.lab.ies-reference-generation-inspection.v1";
const INSPECTION_AUDIT_SCHEMA_ID = "controlstack.lab.ies-reference-generation-inspection-audit.v1";
const REFERENCE_SCHEMA_ID = "controlstack.lab.reference-identity.v1";
const KEYWORD_PROFILE_ID = "controlstack.lab.ies-keywords.v1";
const LOAD_REQUEST_SCHEMA_ID = "controlstack.lab.sealed-reference-load-request.v1";

const PLAN_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "state", "planId", "replayKey", "sourceGeneration",
  "sourceBinding", "sourceInspection", "selection", "run", "referenceIdentity",
  "multiplierBasis", "job", "blockers", "warnings", "audit", "safetyFlags",
]);
const SOURCE_GENERATION_KEYS = Object.freeze(["schemaId", "schemaVersion", "generationInputId", "replayKey"]);
const SOURCE_BINDING_KEYS = Object.freeze(["schemaId", "schemaVersion", "bindingId", "replayKey"]);
const SOURCE_INSPECTION_KEYS = Object.freeze(["schemaId", "schemaVersion", "inspectionId"]);
const SELECTION_KEYS = Object.freeze(["system", "optic", "targetLmPerM", "roomAmbientTaC", "protocol"]);
const RUN_KEYS = Object.freeze(["runIndex", "quantity", "lengthMm"]);
const MULTIPLIER_KEYS = Object.freeze([
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

const BINDING_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "state", "bindingId", "replayKey", "sourceGeneration",
  "selection", "run", "technicalBinding", "referenceIdentity", "blockers", "warnings",
  "audit", "safetyFlags",
]);
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
const LOAD_REQUEST_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "referenceId", "kind", "serial",
  "authorityRecordSha256", "referenceSha256", "readOnly",
]);
const RECEIPT_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "state", "receiptId", "replayKey", "planId", "bindingId",
  "inspectionId", "referenceId", "referenceSha256", "resolverCallCount", "loaded",
  "referenceValidated", "loadedBodyDiscarded", "blockers", "warnings", "audit", "safetyFlags",
]);
const AUDIT_KEYS = Object.freeze([
  "schemaId", "schemaVersion", "attemptFingerprint", "state", "accepted", "receiptId",
  "replayKey", "planId", "bindingId", "inspectionId", "referenceId", "deterministic",
  "contractsValidated", "resolverInvoked", "resolverCallCount", "sealedReferenceLoaded",
  "referenceValidated", "loadedBodyDiscarded", "generatorInvoked", "materialiseInvoked",
  "routeInvoked", "persistenceAttempted", "artifactWriteAttempted", "emailAttempted",
]);
const SAFETY_KEYS = Object.freeze([
  "readOnly", "nonPersistent", "callerLocationAccepted", "providerInputAccepted",
  "resolverInvoked", "resolverCallCount", "sealedReferenceLoaded", "referenceValidated",
  "loadedBodyDiscarded", "sealedReferenceReturned", "metadataReturned", "keywordValuesReturned",
  "anglesReturned", "candelaReturned", "provenancePathsReturned", "lm63Returned",
  "generatorInvoked", "materialiseInvoked", "routeAdded", "persistenceAttempted",
  "artifactWritten", "fileWritten", "networkWritten", "emailSent", "deliveryActivated",
  "readinessActivated",
]);

const PLAN_ID = /^ies-materialisation-job-plan-v1:[0-9a-f]{40}$/;
const PLAN_REPLAY = /^ies-materialisation-job-plan-replay-v1:[0-9a-f]{40}$/;
const BINDING_ID = /^ies-generation-reference-binding-v1:[0-9a-f]{40}$/;
const BINDING_REPLAY = /^ies-generation-reference-binding-replay-v1:[0-9a-f]{40}$/;
const INSPECTION_ID = /^ies-reference-generation-inspection-v1:[0-9a-f]{64}$/;
const GENERATION_ID = /^ies-generation-input-v1:[0-9a-f]{40}$/;
const GENERATION_REPLAY = /^ies-generation-input-replay-v1:[0-9a-f]{40}$/;
const REFERENCE_ID = /^NVB-REF-(GT|OPT|MRG)-([0-9]{6})$/;
const SHA256 = /^[0-9a-f]{64}$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const BLOCKER = /^[a-z][a-z0-9_]{0,127}$/;
const PRIVATE_OR_LOCATION = /(?:[A-Za-z]:[\\/]|\\\\|file:|https?:|s3:|gs:|azure:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|(?:^|[\\/])\.\.(?:[\\/]|$))/i;
const RAW = /(?:^\s*IESNA:|\bTILT=|data:[^\s]+;base64|\bbase64\b)/i;

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, keys) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonical(value) {
  if (value === null || value === undefined) return value;
  if (["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map(canonical);
  if (isPlainObject(value)) {
    return Object.keys(value).sort().map((key) => [key, canonical(value[key])]);
  }
  return String(value);
}

function equal(left, right) {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

function safeTree(value) {
  if (typeof value === "string") return !PRIVATE_OR_LOCATION.test(value) && !RAW.test(value);
  if (Array.isArray(value)) return value.every(safeTree);
  if (isPlainObject(value)) return Object.values(value).every(safeTree);
  return value === null || ["number", "boolean"].includes(typeof value);
}

function finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? (Object.is(value, -0) ? 0 : value) : null;
}

function exactFalseFlags(value, keys, trueKeys = []) {
  if (!exactKeys(value, keys)) return false;
  const expectedTrue = new Set(trueKeys);
  return keys.every((key) => value[key] === expectedTrue.has(key));
}

function validReference(value) {
  if (!exactKeys(value, REFERENCE_KEYS)) return false;
  const match = REFERENCE_ID.exec(value.referenceId);
  if (!match || value.schemaId !== REFERENCE_SCHEMA_ID || value.schemaVersion !== 1) return false;
  if (value.kind !== ({ GT: "GT", OPT: "OPT", MRG: "MERGED" })[match[1]]) return false;
  if (!Number.isInteger(value.serial) || value.serial < 1 || value.serial > 999999) return false;
  if (Number(match[2]) !== value.serial) return false;
  if (!UTC.test(value.sealedAtUtc) || new Date(value.sealedAtUtc).toISOString() !== value.sealedAtUtc) return false;
  if (!SHA256.test(value.authorityRecordSha256) || !SHA256.test(value.referenceSha256)) return false;
  if (value.resolverPath !== `/r/${value.referenceId}` || value.readOnly !== true) return false;
  return true;
}

function expectedBindingIdentity(value) {
  const payload = {
    schemaId: BINDING_SCHEMA_ID,
    schemaVersion: 1,
    generationInputId: value.sourceGeneration.generationInputId,
    generationReplayKey: value.sourceGeneration.replayKey,
    selection: value.selection,
    run: value.run,
    technicalBinding: value.technicalBinding,
    referenceIdentity: value.referenceIdentity,
    blocker: null,
  };
  const attemptFingerprint = stableFingerprint("ies-generation-reference-binding-attempt-v1", payload);
  const bindingId = stableFingerprint("ies-generation-reference-binding-v1", payload);
  const replayKey = stableFingerprint("ies-generation-reference-binding-replay-v1", {
    bindingId,
    generationReplayKey: value.sourceGeneration.replayKey,
    referenceSha256: value.referenceIdentity.referenceSha256,
  });
  return { attemptFingerprint, bindingId, replayKey };
}

function expectedPlanIdentity(value) {
  const payload = {
    schemaId: PLAN_SCHEMA_ID,
    schemaVersion: 1,
    sourceGeneration: value.sourceGeneration,
    sourceBinding: value.sourceBinding,
    sourceInspection: value.sourceInspection,
    selection: value.selection,
    run: value.run,
    referenceIdentity: value.referenceIdentity,
    multiplierBasis: value.multiplierBasis,
    job: value.job,
    blocker: null,
  };
  const attemptFingerprint = stableFingerprint("ies-materialisation-job-plan-attempt-v1", payload);
  const planId = stableFingerprint("ies-materialisation-job-plan-v1", payload);
  const replayKey = stableFingerprint("ies-materialisation-job-plan-replay-v1", {
    planId,
    generationReplayKey: value.sourceGeneration.replayKey,
    bindingReplayKey: value.sourceBinding.replayKey,
    inspectionId: value.sourceInspection.inspectionId,
  });
  return { attemptFingerprint, planId, replayKey };
}

function validReadyPlan(value) {
  if (!exactKeys(value, PLAN_KEYS) || !safeTree(value)) return false;
  if (value.schemaId !== PLAN_SCHEMA_ID || value.schemaVersion !== 1 || value.state !== "ready_read_only") return false;
  if (!PLAN_ID.test(value.planId) || !PLAN_REPLAY.test(value.replayKey)) return false;
  if (!exactKeys(value.sourceGeneration, SOURCE_GENERATION_KEYS)
      || value.sourceGeneration.schemaId !== GENERATION_SCHEMA_ID
      || value.sourceGeneration.schemaVersion !== 1
      || !GENERATION_ID.test(value.sourceGeneration.generationInputId)
      || !GENERATION_REPLAY.test(value.sourceGeneration.replayKey)) return false;
  if (!exactKeys(value.sourceBinding, SOURCE_BINDING_KEYS)
      || value.sourceBinding.schemaId !== BINDING_SCHEMA_ID || value.sourceBinding.schemaVersion !== 1
      || !BINDING_ID.test(value.sourceBinding.bindingId) || !BINDING_REPLAY.test(value.sourceBinding.replayKey)) return false;
  if (!exactKeys(value.sourceInspection, SOURCE_INSPECTION_KEYS)
      || value.sourceInspection.schemaId !== INSPECTION_SCHEMA_ID || value.sourceInspection.schemaVersion !== 1
      || !INSPECTION_ID.test(value.sourceInspection.inspectionId)) return false;
  if (!exactKeys(value.selection, SELECTION_KEYS) || !exactKeys(value.run, RUN_KEYS)
      || !exactKeys(value.multiplierBasis, MULTIPLIER_KEYS) || !exactKeys(value.job, JOB_KEYS)) return false;
  if (!isPlainObject(value.job.selections) || Object.keys(value.job.selections).length !== 0) return false;
  if (!validReference(value.referenceIdentity)) return false;
  if (value.run.runIndex !== 0 || !Number.isSafeInteger(value.run.quantity) || value.run.quantity < 1
      || !Number.isSafeInteger(value.run.lengthMm) || value.run.lengthMm < 1
      || value.job.runLengthMm !== value.run.lengthMm) return false;
  const multiplier = finite(value.job.outputMultiplier);
  const verifiedLmPerM = finite(value.multiplierBasis.verifiedLmPerM);
  const baselineLmPerM = finite(value.multiplierBasis.baselineLmPerM);
  const targetLmPerM = finite(value.multiplierBasis.targetLmPerM);
  const expectedMultiplier = verifiedLmPerM !== null && baselineLmPerM !== null
    ? verifiedLmPerM / baselineLmPerM : null;
  if (!(multiplier > 0) || !(verifiedLmPerM > 0) || !(baselineLmPerM > 0)
      || targetLmPerM === null || targetLmPerM < 0 || !Number.isFinite(expectedMultiplier)
      || expectedMultiplier !== multiplier || value.multiplierBasis.outputMultiplier !== multiplier
      || value.multiplierBasis.targetLmPerM !== value.selection.targetLmPerM
      || value.multiplierBasis.targetLmPerMIsIntentOnly !== true
      || value.multiplierBasis.formula !== "verifiedLmPerM / baselineLmPerM") return false;
  if (!Array.isArray(value.blockers) || value.blockers.length !== 0 || !Array.isArray(value.warnings)) return false;
  const expectedIdentity = expectedPlanIdentity(value);
  if (value.planId !== expectedIdentity.planId || value.replayKey !== expectedIdentity.replayKey) return false;
  if (!exactKeys(value.audit, PLAN_AUDIT_KEYS) || value.audit.schemaId !== PLAN_AUDIT_SCHEMA_ID
      || value.audit.schemaVersion !== 1 || value.audit.accepted !== true || value.audit.state !== "accepted_read_only"
      || value.audit.planId !== value.planId || value.audit.replayKey !== value.replayKey
      || value.audit.attemptFingerprint !== expectedIdentity.attemptFingerprint
      || value.audit.sealedReferenceLoaded !== false || value.audit.materialiseInvoked !== false
      || value.audit.generatorInvoked !== false || value.audit.routeInvoked !== false
      || value.audit.persistenceAttempted !== false || value.audit.artifactWriteAttempted !== false
      || value.audit.emailAttempted !== false) return false;
  if (!exactFalseFlags(value.safetyFlags, PLAN_SAFETY_KEYS, [
    "readOnly", "nonPersistent", "traceabilityEnvelopeIgnored", "generationInputConsumed",
    "bindingConsumed", "inspectionConsumed", "multiplierDerived", "jobPlanned",
  ])) return false;
  return true;
}

function validReadyBinding(value) {
  if (!exactKeys(value, BINDING_KEYS) || !safeTree(value)) return false;
  if (value.schemaId !== BINDING_SCHEMA_ID || value.schemaVersion !== 1 || value.state !== "ready_read_only") return false;
  if (!BINDING_ID.test(value.bindingId) || !BINDING_REPLAY.test(value.replayKey)) return false;
  if (!exactKeys(value.sourceGeneration, SOURCE_GENERATION_KEYS)
      || value.sourceGeneration.schemaId !== GENERATION_SCHEMA_ID
      || value.sourceGeneration.schemaVersion !== 1
      || !GENERATION_ID.test(value.sourceGeneration.generationInputId)
      || !GENERATION_REPLAY.test(value.sourceGeneration.replayKey)) return false;
  if (!exactKeys(value.selection, SELECTION_KEYS) || !exactKeys(value.run, RUN_KEYS)
      || !exactKeys(value.technicalBinding, TECHNICAL_BINDING_KEYS) || !validReference(value.referenceIdentity)) return false;
  if (!Array.isArray(value.blockers) || value.blockers.length !== 0 || !Array.isArray(value.warnings)) return false;
  const expectedIdentity = expectedBindingIdentity(value);
  if (value.bindingId !== expectedIdentity.bindingId || value.replayKey !== expectedIdentity.replayKey) return false;
  if (!exactKeys(value.audit, BINDING_AUDIT_KEYS) || value.audit.schemaId !== BINDING_AUDIT_SCHEMA_ID
      || value.audit.schemaVersion !== 1 || value.audit.accepted !== true || value.audit.state !== "accepted_read_only"
      || value.audit.bindingId !== value.bindingId || value.audit.replayKey !== value.replayKey
      || value.audit.attemptFingerprint !== expectedIdentity.attemptFingerprint
      || value.audit.resolverInvoked !== false || value.audit.sealedReferenceLoaded !== false
      || value.audit.generatorInvoked !== false || value.audit.routeInvoked !== false
      || value.audit.persistenceAttempted !== false || value.audit.artifactWriteAttempted !== false
      || value.audit.emailAttempted !== false) return false;
  if (!exactFalseFlags(value.safetyFlags, BINDING_SAFETY_KEYS, [
    "readOnly", "nonPersistent", "traceabilityEnvelopeIgnored", "generationInputConsumed",
    "labProjectionConsumed", "referenceIdentityBound",
  ])) return false;
  return true;
}

function validReadyInspection(value) {
  if (!exactKeys(value, INSPECTION_KEYS) || !safeTree(value)) return false;
  if (value.schemaId !== INSPECTION_SCHEMA_ID || value.schemaVersion !== 1 || value.state !== "ready_read_only") return false;
  if (!INSPECTION_ID.test(value.inspectionId) || !validReference(value.referenceIdentity)
      || value.inspectionId !== `ies-reference-generation-inspection-v1:${value.referenceIdentity.referenceSha256}`) return false;
  if (value.keywordProfileId !== KEYWORD_PROFILE_ID || !exactKeys(value.baseline, BASELINE_KEYS)) return false;
  for (const key of BASELINE_KEYS) if (finite(value.baseline[key]) === null) return false;
  if (!Array.isArray(value.missingKeywordOverrides) || value.missingKeywordOverrides.length !== 0
      || value.materialisationWithoutOverrides !== true || !Array.isArray(value.blockers)
      || value.blockers.length !== 0 || !Array.isArray(value.warnings)) return false;
  if (!exactKeys(value.audit, INSPECTION_AUDIT_KEYS) || value.audit.schemaId !== INSPECTION_AUDIT_SCHEMA_ID
      || value.audit.schemaVersion !== 1 || value.audit.accepted !== true || value.audit.state !== "accepted_read_only"
      || value.audit.inspectionId !== value.inspectionId || value.audit.referenceId !== value.referenceIdentity.referenceId
      || value.audit.attemptId !== value.inspectionId
      || value.audit.referenceValidated !== true || value.audit.jobValidated !== false
      || value.audit.materialiseInvoked !== false || value.audit.generatorInvoked !== false
      || value.audit.routeInvoked !== false || value.audit.persistenceAttempted !== false
      || value.audit.artifactWriteAttempted !== false || value.audit.emailAttempted !== false) return false;
  if (!exactFalseFlags(value.safetyFlags, INSPECTION_SAFETY_KEYS, [
    "readOnly", "nonPersistent", "referenceValidated",
  ])) return false;
  return true;
}

function crossContracts(plan, binding, inspection) {
  if (!equal(plan.sourceGeneration, binding.sourceGeneration)) return "load_preflight_generation_mismatch";
  if (plan.sourceBinding.bindingId !== binding.bindingId || plan.sourceBinding.replayKey !== binding.replayKey) {
    return "load_preflight_binding_identity_mismatch";
  }
  if (plan.sourceInspection.inspectionId !== inspection.inspectionId) return "load_preflight_inspection_identity_mismatch";
  if (!equal(plan.selection, binding.selection) || !equal(plan.run, binding.run)) return "load_preflight_selection_run_mismatch";
  if (!equal(plan.referenceIdentity, binding.referenceIdentity)
      || !equal(plan.referenceIdentity, inspection.referenceIdentity)) return "load_preflight_reference_identity_mismatch";
  if (plan.multiplierBasis.baselineLmPerM !== inspection.baseline.baselineLmPerM) {
    return "load_preflight_baseline_plan_mismatch";
  }
  return null;
}

function loadRequest(reference) {
  const request = {
    schemaId: LOAD_REQUEST_SCHEMA_ID,
    schemaVersion: 1,
    referenceId: reference.referenceId,
    kind: reference.kind,
    serial: reference.serial,
    authorityRecordSha256: reference.authorityRecordSha256,
    referenceSha256: reference.referenceSha256,
    readOnly: true,
  };
  if (!exactKeys(request, LOAD_REQUEST_KEYS)) throw new Error("internal load request shape mismatch");
  return deepFreeze(request);
}

function safety({ invoked = false, loaded = false, validated = false, discarded = false } = {}) {
  const value = {
    readOnly: true,
    nonPersistent: true,
    callerLocationAccepted: false,
    providerInputAccepted: false,
    resolverInvoked: invoked,
    resolverCallCount: invoked ? 1 : 0,
    sealedReferenceLoaded: loaded,
    referenceValidated: validated,
    loadedBodyDiscarded: discarded,
    sealedReferenceReturned: false,
    metadataReturned: false,
    keywordValuesReturned: false,
    anglesReturned: false,
    candelaReturned: false,
    provenancePathsReturned: false,
    lm63Returned: false,
    generatorInvoked: false,
    materialiseInvoked: false,
    routeAdded: false,
    persistenceAttempted: false,
    artifactWritten: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    deliveryActivated: false,
    readinessActivated: false,
  };
  if (!exactKeys(value, SAFETY_KEYS)) throw new Error("internal load safety shape mismatch");
  return value;
}

function identityPayload(plan, binding, inspection, blocker = null) {
  return {
    schemaId: IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_ID,
    schemaVersion: IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_VERSION,
    planId: plan?.planId ?? null,
    planReplayKey: plan?.replayKey ?? null,
    bindingId: binding?.bindingId ?? null,
    bindingReplayKey: binding?.replayKey ?? null,
    inspectionId: inspection?.inspectionId ?? null,
    referenceId: inspection?.referenceIdentity?.referenceId ?? null,
    referenceSha256: inspection?.referenceIdentity?.referenceSha256 ?? null,
    blocker,
  };
}

function audit(identity, accepted, state) {
  const value = {
    schemaId: IES_SEALED_REFERENCE_LOAD_RECEIPT_AUDIT_SCHEMA_ID,
    schemaVersion: IES_SEALED_REFERENCE_LOAD_RECEIPT_AUDIT_SCHEMA_VERSION,
    attemptFingerprint: identity.attemptFingerprint,
    state: accepted ? "accepted_read_only" : "blocked_fail_closed",
    accepted,
    receiptId: identity.receiptId,
    replayKey: identity.replayKey,
    planId: state.plan?.planId ?? null,
    bindingId: state.binding?.bindingId ?? null,
    inspectionId: state.inspection?.inspectionId ?? null,
    referenceId: state.inspection?.referenceIdentity?.referenceId ?? null,
    deterministic: true,
    contractsValidated: state.contractsValidated,
    resolverInvoked: state.invoked,
    resolverCallCount: state.invoked ? 1 : 0,
    sealedReferenceLoaded: state.loaded,
    referenceValidated: state.validated,
    loadedBodyDiscarded: state.discarded,
    generatorInvoked: false,
    materialiseInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
  if (!exactKeys(value, AUDIT_KEYS)) throw new Error("internal load audit shape mismatch");
  return value;
}

function makeIdentity(plan, binding, inspection, blocker = null) {
  const payload = identityPayload(plan, binding, inspection, blocker);
  const attemptFingerprint = stableFingerprint("ies-sealed-reference-load-attempt-v1", payload);
  if (blocker) return { attemptFingerprint, receiptId: null, replayKey: null };
  const receiptId = stableFingerprint("ies-sealed-reference-load-receipt-v1", payload);
  const replayKey = stableFingerprint("ies-sealed-reference-load-replay-v1", {
    receiptId,
    planReplayKey: plan.replayKey,
    bindingReplayKey: binding.replayKey,
    referenceSha256: inspection.referenceIdentity.referenceSha256,
  });
  return { attemptFingerprint, receiptId, replayKey };
}

function blocked(blocker, state = {}) {
  const code = typeof blocker === "string" && BLOCKER.test(blocker)
    ? blocker : "sealed_reference_load_preflight_blocked";
  const normalized = {
    plan: state.plan ?? null,
    binding: state.binding ?? null,
    inspection: state.inspection ?? null,
    contractsValidated: state.contractsValidated === true,
    invoked: state.invoked === true,
    loaded: state.loaded === true,
    validated: false,
    discarded: state.discarded === true,
  };
  const identity = makeIdentity(normalized.plan, normalized.binding, normalized.inspection, code);
  const value = {
    schemaId: IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_ID,
    schemaVersion: IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_VERSION,
    state: IES_SEALED_REFERENCE_LOAD_RECEIPT_STATES.blockedFailClosed,
    receiptId: null,
    replayKey: null,
    planId: normalized.plan?.planId ?? null,
    bindingId: normalized.binding?.bindingId ?? null,
    inspectionId: normalized.inspection?.inspectionId ?? null,
    referenceId: normalized.inspection?.referenceIdentity?.referenceId ?? null,
    referenceSha256: normalized.inspection?.referenceIdentity?.referenceSha256 ?? null,
    resolverCallCount: normalized.invoked ? 1 : 0,
    loaded: normalized.loaded,
    referenceValidated: false,
    loadedBodyDiscarded: normalized.discarded,
    blockers: [code],
    warnings: [],
    audit: audit(identity, false, normalized),
    safetyFlags: safety(normalized),
  };
  if (!exactKeys(value, RECEIPT_KEYS)) throw new Error("internal blocked receipt shape mismatch");
  return deepFreeze(value);
}

export async function preflightSealedReferenceLoadV1(planInput, bindingInput, inspectionInput, resolver) {
  if (arguments.length !== 4) return blocked("sealed_reference_load_input_arity_invalid");
  if (!validReadyPlan(planInput)) return blocked("sealed_reference_load_plan_invalid");
  if (!validReadyBinding(bindingInput)) return blocked("sealed_reference_load_binding_invalid", { plan: planInput });
  if (!validReadyInspection(inspectionInput)) {
    return blocked("sealed_reference_load_inspection_invalid", { plan: planInput, binding: bindingInput });
  }
  const mismatch = crossContracts(planInput, bindingInput, inspectionInput);
  if (mismatch) return blocked(mismatch, { plan: planInput, binding: bindingInput, inspection: inspectionInput });
  if (typeof resolver !== "function") {
    return blocked("sealed_reference_load_resolver_invalid", {
      plan: planInput, binding: bindingInput, inspection: inspectionInput, contractsValidated: true,
    });
  }

  const state = {
    plan: planInput,
    binding: bindingInput,
    inspection: inspectionInput,
    contractsValidated: true,
    invoked: true,
    loaded: false,
    validated: false,
    discarded: false,
  };
  let loadedReference;
  try {
    loadedReference = await resolver(loadRequest(inspectionInput.referenceIdentity));
    state.loaded = isPlainObject(loadedReference);
  } catch {
    return blocked("sealed_reference_load_resolver_failed", state);
  }
  if (!isPlainObject(loadedReference)) return blocked("sealed_reference_load_resolver_result_invalid", state);

  const loadedInspection = inspectIesReferenceForGeneration(loadedReference);
  state.discarded = true;
  loadedReference = null;
  if (!loadedInspection || loadedInspection.state !== "ready_read_only") {
    return blocked("sealed_reference_load_dto_validation_failed", state);
  }
  if (!equal(loadedInspection.referenceIdentity, inspectionInput.referenceIdentity)) {
    return blocked("sealed_reference_load_identity_mismatch", state);
  }
  if (loadedInspection.keywordProfileId !== inspectionInput.keywordProfileId) {
    return blocked("sealed_reference_load_keyword_profile_mismatch", state);
  }
  if (!equal(loadedInspection.baseline, inspectionInput.baseline)) {
    return blocked("sealed_reference_load_baseline_mismatch", state);
  }
  if (!equal(loadedInspection.missingKeywordOverrides, inspectionInput.missingKeywordOverrides)) {
    return blocked("sealed_reference_load_missing_overrides_mismatch", state);
  }
  if (loadedInspection.materialisationWithoutOverrides !== inspectionInput.materialisationWithoutOverrides) {
    return blocked("sealed_reference_load_readiness_mismatch", state);
  }
  state.validated = true;

  const identity = makeIdentity(planInput, bindingInput, inspectionInput);
  const value = {
    schemaId: IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_ID,
    schemaVersion: IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_VERSION,
    state: IES_SEALED_REFERENCE_LOAD_RECEIPT_STATES.readyReadOnly,
    receiptId: identity.receiptId,
    replayKey: identity.replayKey,
    planId: planInput.planId,
    bindingId: bindingInput.bindingId,
    inspectionId: inspectionInput.inspectionId,
    referenceId: inspectionInput.referenceIdentity.referenceId,
    referenceSha256: inspectionInput.referenceIdentity.referenceSha256,
    resolverCallCount: 1,
    loaded: true,
    referenceValidated: true,
    loadedBodyDiscarded: true,
    blockers: [],
    warnings: [...new Set([
      ...planInput.warnings,
      ...bindingInput.warnings,
      ...inspectionInput.warnings,
      ...loadedInspection.warnings,
    ])],
    audit: audit(identity, true, state),
    safetyFlags: safety(state),
  };
  if (!exactKeys(value, RECEIPT_KEYS)) throw new Error("internal ready receipt shape mismatch");
  return deepFreeze(value);
}

function stableFingerprint(prefix, value) {
  return `${prefix}:${sha1Hex(JSON.stringify(canonical(value)))}`;
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
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 9 + 63) >> 6) << 6);
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  view.setUint32(paddedLength - 8, high, false);
  view.setUint32(paddedLength - 4, low, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  const words = new Uint32Array(80);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + (index * 4), false);
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
  return [h0, h1, h2, h3, h4].map((part) => part.toString(16).padStart(8, "0")).join("");
}
