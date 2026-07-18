// Lab IES toolkit — approval and promotion gate for the rich authority record.
// Existing Lab-form readiness behaviour is preserved; unresolved future authority values keep runtime handoff blocked.
import { appendMutation } from "./iesProvenance.js";
import {
  AUTHORITY_SCHEMA_ID,
  AUTHORITY_SCHEMA_VERSION,
  DERIVATION_BINDING_RELATION,
  assertAuthorityRecord,
  collectAuthorityFingerprintErrors,
  refreshUnresolvedFields,
} from "./iesAuthorityRecord.js";
import {
  buildApprovalBindingProjection,
  hashApprovalBinding,
  hashAuthorityRecord,
  hashDerivationScope,
  hashOriginBytes,
} from "./iesAuthorityFingerprint.js";
import { canonicalizeJson } from "./iesCanonicalJson.js";
import { refreshSafeRuntimeHandoff } from "./iesHandoff.js";

function clonePlain(value) {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(clonePlain);
  const output = {};
  for (const [key, child] of Object.entries(value)) output[key] = clonePlain(child);
  return output;
}

function requirePlainObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be a plain object.`);
  }
  return value;
}

function canonicalRecordChecks(record) {
  const checks = [];
  for (const row of (record.labForm || [])) {
    if (row?.kind !== "check" || row?.gatesReference !== true) continue;
    const checkId = String(row.bareField ?? row.field ?? "").replace(/^\[|\]$/g, "").trim().toUpperCase();
    if (!checkId || row.source !== "check-ratified" || row.value == null || String(row.value).trim().toLowerCase() === "pending") {
      throw new Error(`Reference check ${checkId || "<unknown>"} is not canonically ratified.`);
    }
    checks.push({ checkId, decision: clonePlain(row.value) });
  }
  checks.sort((left, right) => (left.checkId < right.checkId ? -1 : left.checkId > right.checkId ? 1 : 0));
  return checks;
}

function assertExistingFingerprintsCompatible(original, prepared) {
  const pairs = [
    ["originSha256", original.originSha256, prepared.originSha256],
    ["derivationSha256", original.derivationSha256, prepared.derivationSha256],
    ["sourceFingerprint", original.sourceFingerprint, prepared.sourceFingerprint],
    ["origin.fingerprint", original.origin?.fingerprint, prepared.origin?.fingerprint],
    ["authorityRecordSha256", original.authorityRecordSha256, prepared.authorityRecordSha256],
    ["recordFingerprint", original.recordFingerprint, prepared.recordFingerprint],
  ];
  for (const [field, existing, computed] of pairs) {
    if (existing != null && existing !== computed) {
      throw new Error(`${field} does not match the cryptographically prepared authority value.`);
    }
  }
}

export async function prepareAuthorityFingerprints(authorityRecord, sourceContext, hashProvider) {
  const record = clonePlain(authorityRecord);
  assertAuthorityRecord(record);
  const context = requirePlainObject(sourceContext, "sourceContext");

  record.approval = record.approval || {};
  record.approval.approvalFingerprint = null;
  record.approval.authorityRecordSha256 = null;
  record.authorityRecordSha256 = null;
  record.recordFingerprint = null;

  if (record.recordKind === "GT" || record.recordKind === "OPT") {
    if (!record.origin || context.expectedByteLength !== record.origin.byteLength) {
      throw new Error("sourceContext.expectedByteLength must exactly match authorityRecord.origin.byteLength.");
    }
    const originSha256 = await hashOriginBytes(context.originBytes, context.expectedByteLength, hashProvider);
    record.originSha256 = originSha256;
    record.derivationSha256 = null;
    record.sourceFingerprint = originSha256;
    record.origin.fingerprint = originSha256;
    if (Array.isArray(record.provenance?.derivationReferences)) {
      record.provenance.derivationReferences = record.provenance.derivationReferences
        .filter((entry) => entry?.relation !== DERIVATION_BINDING_RELATION);
    }
  } else if (record.recordKind === "MERGED") {
    if (!("derivationInput" in context)) throw new Error("MERGED sourceContext.derivationInput is required.");
    const derivationSha256 = await hashDerivationScope(context.derivationInput, hashProvider);
    record.originSha256 = null;
    record.origin = record.origin || { artifactRef: null, byteLength: null, mediaType: null, fingerprint: null };
    record.origin.fingerprint = null;
    record.derivationSha256 = derivationSha256;
    record.sourceFingerprint = derivationSha256;
    record.provenance = record.provenance || {};
    const derivationReferences = Array.isArray(record.provenance.derivationReferences)
      ? record.provenance.derivationReferences
      : [];
    record.provenance.derivationReferences = [
      ...derivationReferences.filter((entry) => entry?.relation !== DERIVATION_BINDING_RELATION),
      { relation: DERIVATION_BINDING_RELATION, artifactSha256: derivationSha256 },
    ];
  } else {
    throw new Error("Authority fingerprints require recordKind GT, OPT, or MERGED.");
  }

  record.authorityRecordSha256 = await hashAuthorityRecord(record, hashProvider);
  record.recordFingerprint = record.authorityRecordSha256;
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  const fingerprintErrors = collectAuthorityFingerprintErrors(record);
  if (fingerprintErrors.length) throw new Error(fingerprintErrors.join(" "));
  assertAuthorityRecord(record);
  return record;
}

export function ratifyCheck(record, field, decision, actorType = "human_approved_tool_run"){
  const bare = String(field).replace(/^\[|\]$/g, "").toUpperCase();
  const row = (record.labForm || []).find((entry) => entry.bareField === bare && entry.kind === "check");
  if (!row) throw new Error("no check row for " + field);
  if (row.options.length && !row.options.map((option) => option.toLowerCase()).includes(String(decision).toLowerCase())) {
    throw new Error("decision must be one of: " + row.options.join(", "));
  }
  row.value = decision;
  row.source = "check-ratified";
  appendMutation(record, {
    toolId: "lab-ratify",
    operation: "ratify-check",
    paramsSummary: { field: bare, decision },
    actorType,
  });
  return record;
}

export function referenceReadiness(record){
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  const blockers = [];

  if (record.schemaId !== AUTHORITY_SCHEMA_ID || record.schemaVersion !== AUTHORITY_SCHEMA_VERSION) {
    blockers.push({ field: "schema", reason: "wrong authority-record schema" });
  }
  if (record.oneMmNormalised !== true || record.baseLengthM !== 0.001 || Number(record.photometry?.geometry?.G8) !== 0.001) {
    blockers.push({ field: "oneMmNormalised", reason: "record is not a validated one-millimetre model" });
  }

  for (const row of (record.labForm || [])){
    if (!row.gatesReference) continue;
    if (row.kind === "check") {
      if (!row.value || String(row.value).toLowerCase() === "pending") {
        blockers.push({ field: row.bareField, reason: "check not ratified (pending)" });
      }
    } else if (!String(row.value || "").trim()) {
      blockers.push({ field: row.bareField, reason: "required value missing" });
    }
  }

  if (record.provenance?.sealing?.state !== "diagnostic_sealed") {
    blockers.push({ field: "origin", reason: "diagnostic origin baseline not sealed" });
  }
  if (!Array.isArray(record.mutationLog)) {
    blockers.push({ field: "mutationLog", reason: "canonical mutation log missing" });
  }
  if (record.approvalState === "pending_review") {
    blockers.push({ field: "approval", reason: "pending review after an edit" });
  }
  return { ready: blockers.length === 0, blockers };
}

export function promoteToReference(
  record,
  nowUtc = new Date().toISOString(),
  actorType = "human_approved_tool_run",
){
  const readiness = referenceReadiness(record);
  if (!readiness.ready) return { ok: false, blockers: readiness.blockers };

  record.approvalState = "reference";
  record.revisionState = "current";
  record.labProofState = "complete";
  record.approval = record.approval || {};
  record.approval.approvedAtUtc = nowUtc;
  record.approval.approvedByActorType = actorType;
  record.approval.approverId = null;
  record.approval.ratifiedChecks = [];
  record.approval.authorityRecordSha256 = null;
  record.approval.approvalFingerprint = null;
  record.approval.reopenedAtUtc = null;
  record.approval.reopenedByMutationOrdinal = null;
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  return { ok: true };
}

export async function promoteToCryptographicReference(
  authorityRecord,
  sourceContext,
  approvalContext,
  hashProvider,
) {
  const readinessRecord = clonePlain(authorityRecord);
  const readiness = referenceReadiness(readinessRecord);
  if (!readiness.ready) return { ok: false, blockers: readiness.blockers };

  const prepared = await prepareAuthorityFingerprints(authorityRecord, sourceContext, hashProvider);
  assertExistingFingerprintsCompatible(authorityRecord, prepared);

  const context = requirePlainObject(approvalContext, "approvalContext");
  const binding = buildApprovalBindingProjection({
    authorityRecordSha256: prepared.authorityRecordSha256,
    state: "reference",
    approvedAtUtc: context.approvedAtUtc,
    approverId: context.approverId,
    ratifiedChecks: context.ratifiedChecks,
  });
  const recordChecks = canonicalRecordChecks(prepared);
  if (canonicalizeJson(binding.ratifiedChecks) !== canonicalizeJson(recordChecks)) {
    throw new Error("approvalContext.ratifiedChecks must exactly match the authority record's canonical ratified checks.");
  }

  const approvalFingerprint = await hashApprovalBinding(binding, hashProvider);
  prepared.approvalState = "reference";
  prepared.revisionState = "current";
  prepared.labProofState = "complete";
  prepared.approval = {
    ...prepared.approval,
    approvedAtUtc: binding.approvedAtUtc,
    approverId: binding.approverId,
    ratifiedChecks: clonePlain(binding.ratifiedChecks),
    authorityRecordSha256: prepared.authorityRecordSha256,
    approvalFingerprint,
    reopenedAtUtc: null,
    reopenedByMutationOrdinal: null,
  };
  refreshUnresolvedFields(prepared);
  refreshSafeRuntimeHandoff(prepared);
  assertAuthorityRecord(prepared);
  return { ok: true, authorityRecord: prepared, record: prepared };
}
