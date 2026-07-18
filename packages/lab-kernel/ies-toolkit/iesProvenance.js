// Lab IES toolkit — browser-safe diagnostic provenance and canonical mutation log.
// The safe-* values below remain non-authoritative diagnostics and are never promoted into Slice 4B SHA-256 authority fields.
import { DERIVATION_BINDING_RELATION, refreshUnresolvedFields } from "./iesAuthorityRecord.js";
import { refreshSafeRuntimeHandoff } from "./iesHandoff.js";

function cyrb53(str, seed = 0){
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++){ const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}
function canon(o){
  if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
  if (o && typeof o === "object") return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
  return JSON.stringify(o);
}
export function fingerprint(obj){ return "safe-" + cyrb53(canon(obj)); }

function contentOf(record){
  return {
    schemaId: record.schemaId,
    schemaVersion: record.schemaVersion,
    recordId: record.recordId,
    recordKind: record.recordKind,
    oneMmNormalised: record.oneMmNormalised,
    baseLengthM: record.baseLengthM,
    photometryMode: record.photometryMode,
    origin: record.origin,
    labForm: (record.labForm || []).map((row) => ({
      field: row.bareField,
      value: row.value,
      source: row.source,
      kind: row.kind,
      gatesReference: row.gatesReference,
    })),
    photometry: record.photometry,
    recipe: record.recipe,
    derivationReferences: record.provenance?.derivationReferences || [],
    parentLineage: record.provenance?.parentLineage || [],
  };
}
export function contentFingerprint(record){ return fingerprint(contentOf(record)); }

function ensureProvenance(record) {
  if (!record.provenance || typeof record.provenance !== "object") record.provenance = {};
  if (!record.provenance.sealing || typeof record.provenance.sealing !== "object") {
    record.provenance.sealing = {
      state: "unsealed",
      sealedAtUtc: null,
      diagnosticAlgorithm: "cyrb53-sorted-json-v0",
      diagnosticBaselineFingerprint: null,
      diagnosticRecordFingerprint: null,
    };
  }
  for (const field of ["originReferences", "evidenceReferences", "derivationReferences", "parentLineage"]) {
    if (!Array.isArray(record.provenance[field])) record.provenance[field] = [];
  }
  if (!Array.isArray(record.mutationLog)) record.mutationLog = [];
  if (!record.approval || typeof record.approval !== "object") {
    record.approval = {
      approvedAtUtc: null,
      approvedByActorType: null,
      approverId: null,
      ratifiedChecks: [],
      authorityRecordSha256: null,
      approvalFingerprint: null,
      reopenedAtUtc: null,
      reopenedByMutationOrdinal: null,
    };
  }
  return record.provenance.sealing;
}

// Establishes a browser-safe diagnostic baseline only. It does not seal exact origin bytes or create authority hashes.
export function sealOrigin(record, nowUtc = new Date().toISOString()){
  const sealing = ensureProvenance(record);
  const diagnostic = contentFingerprint(record);
  sealing.state = "diagnostic_sealed";
  sealing.sealedAtUtc = nowUtc;
  sealing.diagnosticAlgorithm = "cyrb53-sorted-json-v0";
  sealing.diagnosticBaselineFingerprint = sealing.diagnosticBaselineFingerprint || diagnostic;
  sealing.diagnosticRecordFingerprint = diagnostic;

  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  return record;
}

// Call after a governed tool changes authority content. Mutation history is canonical at the top level.
export function appendMutation(record, { toolId, toolVersion = "1.0.0", operation, paramsSummary = {}, actorType = "human_approved_tool_run" }, nowUtc = new Date().toISOString()){
  const sealing = ensureProvenance(record);
  const before = sealing.diagnosticRecordFingerprint;
  if (record.recordKind === "MERGED" && Array.isArray(record.provenance?.derivationReferences)) {
    record.provenance.derivationReferences = record.provenance.derivationReferences
      .filter((entry) => entry?.relation !== DERIVATION_BINDING_RELATION);
  }
  const after = contentFingerprint(record);
  sealing.diagnosticRecordFingerprint = after;

  const wasFinal = record.approvalState === "reference" || record.approvalState === "approved";
  const ordinal = record.mutationLog.length + 1;
  record.mutationLog.push({
    ordinal,
    toolId,
    toolVersion,
    operation,
    paramsSummary,
    inputFingerprint: before,
    outputFingerprint: after,
    timestampUtc: nowUtc,
    actorType,
    approvalReset: wasFinal,
  });

  if (wasFinal) {
    record.approvalState = "pending_review";
    record.revisionState = "revised";
    record.labProofState = "pending_review";
    record.approval.reopenedAtUtc = nowUtc;
    record.approval.reopenedByMutationOrdinal = ordinal;
  }

  if (record.recordKind === "GT" || record.recordKind === "OPT") {
    record.derivationSha256 = null;
    if (record.originSha256) {
      record.sourceFingerprint = record.originSha256;
      if (record.origin) record.origin.fingerprint = record.originSha256;
    } else {
      record.sourceFingerprint = null;
      if (record.origin) record.origin.fingerprint = null;
    }
  } else if (record.recordKind === "MERGED") {
    record.originSha256 = null;
    if (record.origin) record.origin.fingerprint = null;
    record.derivationSha256 = null;
    record.sourceFingerprint = null;
  } else {
    record.sourceFingerprint = null;
  }
  record.authorityRecordSha256 = null;
  record.recordFingerprint = null;
  record.approval.authorityRecordSha256 = null;
  record.approval.approvalFingerprint = null;
  record.safeRuntimeHandoff = {};
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  return record;
}
