// ControlStack Lab — rich one-millimetre authority-record contract.
// Browser-safe. Slice 4B extends the rich record with cryptographic lifecycle bindings; storage remains out of scope.
import { buildSafeHandoff } from "./iesHandoff.js";
import { validateSha256Hex } from "./iesAuthorityFingerprint.js";

export const AUTHORITY_SCHEMA_ID = "controlstack.lab.one-mm-ies-record.v1";
export const AUTHORITY_SCHEMA_VERSION = 1;
export const AUTHORITY_RECORD_KINDS = Object.freeze(["GT", "OPT", "MERGED"]);
export const AUTHORITY_APPROVAL_STATES = Object.freeze(["draft", "reference", "pending_review"]);
export const AUTHORITY_REVISION_STATES = Object.freeze(["draft", "current", "revised"]);
export const AUTHORITY_LAB_PROOF_STATES = Object.freeze(["pending", "complete", "pending_review"]);

export const AUTHORITY_TOP_LEVEL_FIELDS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "recordId",
  "recordKind",
  "approvalState",
  "revisionState",
  "oneMmNormalised",
  "baseLengthM",
  "photometryMode",
  "labProofState",
  "originSha256",
  "authorityRecordSha256",
  "derivationSha256",
  "sourceFingerprint",
  "recordFingerprint",
  "origin",
  "labForm",
  "photometry",
  "recipe",
  "provenance",
  "mutationLog",
  "approval",
  "safeRuntimeHandoff",
  "unresolvedFields",
]);

const RECORD_KIND_SET = new Set(AUTHORITY_RECORD_KINDS);
const APPROVAL_STATE_SET = new Set(AUTHORITY_APPROVAL_STATES);
const REVISION_STATE_SET = new Set(AUTHORITY_REVISION_STATES);
const LAB_PROOF_STATE_SET = new Set(AUTHORITY_LAB_PROOF_STATES);
const EXACT_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
export const DERIVATION_BINDING_RELATION = "cryptographic_derivation_scope";
const FORBIDDEN_ORIGIN_KEYS = new Set([
  "exactBytes",
  "bytes",
  "rawBytes",
  "rawText",
  "iesText",
  "content",
  "localPath",
  "path",
]);

export class AuthorityRecordError extends Error {
  constructor(message, code = "invalid_authority_record", errors = []) {
    super(message);
    this.name = "AuthorityRecordError";
    this.code = code;
    this.errors = errors.slice();
  }
}

function clonePlain(value) {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(clonePlain);
  const output = {};
  for (const [key, child] of Object.entries(value)) output[key] = clonePlain(child);
  return output;
}

function cleanNullableString(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function isRawBinary(value) {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}

export function isLocalFilesystemPath(value) {
  const text = String(value ?? "").trim();
  return /^[A-Za-z]:[\\/]/.test(text)
    || /^\\\\/.test(text)
    || /^file:/i.test(text)
    || /^\//.test(text);
}

export function deriveRecordKind(value) {
  const direct = String(value ?? "").trim().toUpperCase();
  if (RECORD_KIND_SET.has(direct)) return direct;
  const text = String(value ?? "").trim().toLowerCase();
  if (!text || text.includes("no base")) return null;
  if (text.includes("optic")) return "OPT";
  if (text.includes("base engine")) return "GT";
  if (text === "merged") return "MERGED";
  return null;
}

function isExactUtc(value) {
  if (typeof value !== "string" || !EXACT_UTC.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function validateOptionalSha(value, field, errors) {
  if (value != null && !validateSha256Hex(value)) {
    errors.push(`${field} must be null or a lowercase raw 64-character SHA-256 hexadecimal value.`);
  }
}

export function collectAuthorityFingerprintErrors(record) {
  const errors = [];
  const kind = record?.recordKind;
  const originFingerprint = record?.origin?.fingerprint ?? null;

  for (const [field, value] of [
    ["originSha256", record?.originSha256],
    ["authorityRecordSha256", record?.authorityRecordSha256],
    ["derivationSha256", record?.derivationSha256],
    ["sourceFingerprint", record?.sourceFingerprint],
    ["recordFingerprint", record?.recordFingerprint],
    ["origin.fingerprint", originFingerprint],
    ["approval.approvalFingerprint", record?.approval?.approvalFingerprint],
    ["approval.authorityRecordSha256", record?.approval?.authorityRecordSha256],
  ]) validateOptionalSha(value, field, errors);

  if (kind === "GT" || kind === "OPT") {
    if (record?.derivationSha256 != null) errors.push(`${kind} authority records must keep derivationSha256 null.`);
    if (Array.isArray(record?.provenance?.derivationReferences)
      && record.provenance.derivationReferences.some((entry) => entry?.relation === DERIVATION_BINDING_RELATION)) {
      errors.push(`${kind} authority records must not retain a MERGED cryptographic derivation binding reference.`);
    }
    const values = [record?.originSha256, record?.sourceFingerprint, originFingerprint];
    if (values.some((value) => value != null)) {
      if (!values.every(validateSha256Hex)) errors.push(`${kind} source binding requires originSha256 and both compatibility aliases.`);
      else if (!values.every((value) => value === values[0])) errors.push(`${kind} sourceFingerprint and origin.fingerprint must exactly equal originSha256.`);
    }
  } else if (kind === "MERGED") {
    if (record?.originSha256 != null || originFingerprint != null) {
      errors.push("MERGED authority records must keep originSha256 and origin.fingerprint null.");
    }
    const values = [record?.derivationSha256, record?.sourceFingerprint];
    if (values.some((value) => value != null)) {
      if (!values.every(validateSha256Hex)) errors.push("MERGED source binding requires derivationSha256 and sourceFingerprint.");
      else if (values[0] !== values[1]) errors.push("MERGED sourceFingerprint must exactly equal derivationSha256.");
    }
    const derivationBindings = Array.isArray(record?.provenance?.derivationReferences)
      ? record.provenance.derivationReferences.filter((entry) => entry?.relation === DERIVATION_BINDING_RELATION)
      : [];
    if (record?.derivationSha256 == null) {
      if (derivationBindings.length) errors.push("Unprepared MERGED records must not retain a cryptographic derivation binding reference.");
    } else if (
      derivationBindings.length !== 1
      || derivationBindings[0]?.artifactSha256 !== record.derivationSha256
    ) {
      errors.push("MERGED derivationSha256 must have exactly one matching cryptographic derivation binding reference.");
    }
  }

  const authorityValues = [record?.authorityRecordSha256, record?.recordFingerprint];
  if (authorityValues.some((value) => value != null)) {
    if (!authorityValues.every(validateSha256Hex)) errors.push("Authority binding requires authorityRecordSha256 and recordFingerprint.");
    else if (authorityValues[0] !== authorityValues[1]) errors.push("recordFingerprint must exactly equal authorityRecordSha256.");
  }

  const approvedAuthority = record?.approval?.authorityRecordSha256;
  if (approvedAuthority != null && record?.authorityRecordSha256 != null && approvedAuthority !== record.authorityRecordSha256) {
    errors.push("approval.authorityRecordSha256 is stale for the current authorityRecordSha256.");
  }
  return errors;
}

export function normaliseOriginMetadata(input = {}) {
  if (input == null) input = {};
  if (!input || typeof input !== "object" || Array.isArray(input) || isRawBinary(input)) {
    throw new AuthorityRecordError("origin metadata must be a plain object.", "invalid_origin_metadata");
  }
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_ORIGIN_KEYS.has(key) || isRawBinary(value)) {
      throw new AuthorityRecordError(
        `origin metadata must not contain raw origin data (${key}).`,
        "raw_origin_data_forbidden",
      );
    }
  }

  const artifactRef = cleanNullableString(input.artifactRef);
  if (artifactRef && isLocalFilesystemPath(artifactRef)) {
    throw new AuthorityRecordError(
      "origin.artifactRef must be an opaque artifact reference, not a local filesystem path.",
      "local_origin_path_forbidden",
    );
  }

  let byteLength = input.byteLength ?? null;
  if (byteLength !== null) {
    byteLength = Number(byteLength);
    if (!Number.isInteger(byteLength) || byteLength < 0) {
      throw new AuthorityRecordError("origin.byteLength must be a non-negative integer or null.", "invalid_origin_length");
    }
  }

  const mediaType = cleanNullableString(input.mediaType);
  const fingerprint = cleanNullableString(input.fingerprint);
  if (fingerprint != null && !validateSha256Hex(fingerprint)) {
    throw new AuthorityRecordError(
      "origin.fingerprint must be null or a lowercase raw 64-character SHA-256 hexadecimal value.",
      "invalid_origin_fingerprint",
    );
  }

  return { artifactRef, byteLength, mediaType, fingerprint };
}

function pointerEscape(value) {
  return String(value).replace(/~/g, "~0").replace(/\//g, "~1");
}

function isMissing(value) {
  return value == null || (typeof value === "string" && !value.trim());
}

export function collectUnresolvedFields(record) {
  const fields = [];
  const add = (path) => fields.push(path);

  if (isMissing(record?.recordId)) add("/recordId");
  if (isMissing(record?.recordKind)) add("/recordKind");
  if (record?.authorityRecordSha256 == null) add("/authorityRecordSha256");
  if (record?.recordFingerprint == null) add("/recordFingerprint");

  const origin = record?.origin || {};
  if (record?.recordKind === "GT" || record?.recordKind === "OPT") {
    if (record?.originSha256 == null) add("/originSha256");
    if (record?.sourceFingerprint == null) add("/sourceFingerprint");
    if (isMissing(origin.artifactRef)) add("/origin/artifactRef");
    if (origin.byteLength == null) add("/origin/byteLength");
    if (isMissing(origin.mediaType)) add("/origin/mediaType");
    if (origin.fingerprint == null) add("/origin/fingerprint");
  } else if (record?.recordKind === "MERGED") {
    if (record?.derivationSha256 == null) add("/derivationSha256");
    if (record?.sourceFingerprint == null) add("/sourceFingerprint");
  } else if (record?.sourceFingerprint == null) {
    add("/sourceFingerprint");
  }

  if (record?.approvalState === "reference") {
    if (record?.approval?.authorityRecordSha256 == null) add("/approval/authorityRecordSha256");
    if (record?.approval?.approvalFingerprint == null) add("/approval/approvalFingerprint");
    if (isMissing(record?.approval?.approverId)) add("/approval/approverId");
  }

  for (const [index, row] of (record?.labForm || []).entries()) {
    const bare = String(row?.bareField || row?.field || index).replace(/^\[|\]$/g, "").toUpperCase();
    const pendingCheck = row?.kind === "check"
      && String(row?.value ?? "").trim().toLowerCase() === "pending";
    const needsValue = row?.source === "needs-lab-input" || isMissing(row?.value);
    if (pendingCheck || needsValue) add(`/labForm/${pointerEscape(bare)}`);
  }

  if (record?.recordKind === "MERGED" && (!Array.isArray(record?.provenance?.parentLineage) || record.provenance.parentLineage.length < 2)) {
    add("/provenance/parentLineage");
  }

  return [...new Set(fields)].sort();
}

export function refreshUnresolvedFields(record) {
  record.unresolvedFields = collectUnresolvedFields(record);
  return record;
}

function normaliseReferenceList(value, fieldName) {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new AuthorityRecordError(`${fieldName} must be an array.`, "invalid_provenance_references");
  }
  return value.map((entry) => clonePlain(entry));
}

export function createAuthorityRecord(input = {}) {
  const record = {
    schemaId: AUTHORITY_SCHEMA_ID,
    schemaVersion: AUTHORITY_SCHEMA_VERSION,
    recordId: cleanNullableString(input.recordId),
    recordKind: deriveRecordKind(input.recordKind),
    approvalState: "draft",
    revisionState: "draft",
    oneMmNormalised: true,
    baseLengthM: 0.001,
    photometryMode: "normalise_1mm_candidate",
    labProofState: "pending",
    originSha256: null,
    authorityRecordSha256: null,
    derivationSha256: null,
    sourceFingerprint: null,
    recordFingerprint: null,
    origin: normaliseOriginMetadata(input.origin),
    labForm: clonePlain(input.labForm || []),
    photometry: clonePlain(input.photometry || {}),
    recipe: clonePlain(input.recipe || {
      operation: "normalise_1mm_candidate",
      paramsSummary: { oneMmNormalised: true, baseLengthM: 0.001 },
    }),
    provenance: {
      sealing: {
        state: "unsealed",
        sealedAtUtc: null,
        diagnosticAlgorithm: "cyrb53-sorted-json-v0",
        diagnosticBaselineFingerprint: null,
        diagnosticRecordFingerprint: null,
      },
      originReferences: normaliseReferenceList(input.originReferences, "originReferences"),
      evidenceReferences: normaliseReferenceList(input.evidenceReferences, "evidenceReferences"),
      derivationReferences: normaliseReferenceList(input.derivationReferences, "derivationReferences"),
      parentLineage: normaliseReferenceList(input.parentLineage, "parentLineage"),
    },
    mutationLog: [],
    approval: {
      approvedAtUtc: null,
      approvedByActorType: null,
      approverId: null,
      ratifiedChecks: [],
      authorityRecordSha256: null,
      approvalFingerprint: null,
      reopenedAtUtc: null,
      reopenedByMutationOrdinal: null,
    },
    safeRuntimeHandoff: {},
    unresolvedFields: [],
  };

  if (record.origin.artifactRef && !record.provenance.originReferences.some((entry) => entry?.artifactRef === record.origin.artifactRef)) {
    record.provenance.originReferences.push({
      artifactRef: record.origin.artifactRef,
      byteLength: record.origin.byteLength,
      mediaType: record.origin.mediaType,
      fingerprint: null,
    });
  }

  refreshUnresolvedFields(record);
  record.safeRuntimeHandoff = buildSafeHandoff(record);
  return record;
}

export function validateAuthorityRecord(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { ok: false, errors: ["Authority record must be an object."] };
  }

  for (const field of AUTHORITY_TOP_LEVEL_FIELDS) {
    if (!(field in record)) errors.push(`Missing required top-level field ${field}.`);
  }
  for (const legacy of ["recordType", "referenceEngineId", "approvedAtUtc"]) {
    if (legacy in record) errors.push(`Legacy top-level field ${legacy} is not permitted on the rich authority record.`);
  }

  if (record.schemaId !== AUTHORITY_SCHEMA_ID || record.schemaVersion !== AUTHORITY_SCHEMA_VERSION) {
    errors.push(`Authority record must use ${AUTHORITY_SCHEMA_ID} schema version ${AUTHORITY_SCHEMA_VERSION}.`);
  }
  if (record.recordKind != null && !RECORD_KIND_SET.has(record.recordKind)) errors.push("recordKind must be GT, OPT, MERGED, or null while unresolved.");
  if (!APPROVAL_STATE_SET.has(record.approvalState)) errors.push("approvalState is invalid.");
  if (!REVISION_STATE_SET.has(record.revisionState)) errors.push("revisionState is invalid.");
  if (!LAB_PROOF_STATE_SET.has(record.labProofState)) errors.push("labProofState is invalid.");
  if (record.oneMmNormalised !== true) errors.push("oneMmNormalised must be true.");
  if (record.baseLengthM !== 0.001) errors.push("baseLengthM must equal 0.001.");
  if (record.photometryMode !== "normalise_1mm_candidate") errors.push("photometryMode must be normalise_1mm_candidate.");
  if (Number(record.photometry?.geometry?.G8) !== 0.001) errors.push("photometry.geometry.G8 must equal 0.001.");

  errors.push(...collectAuthorityFingerprintErrors(record));

  try {
    const origin = normaliseOriginMetadata(record.origin);
    if (JSON.stringify(origin) !== JSON.stringify(record.origin)) errors.push("origin metadata is not canonical.");
  } catch (error) {
    errors.push(error.message);
  }

  if (!Array.isArray(record.labForm)) errors.push("labForm must be an array.");
  if (!record.photometry || typeof record.photometry !== "object" || Array.isArray(record.photometry)) errors.push("photometry must be an object.");
  if (!record.recipe || typeof record.recipe !== "object" || Array.isArray(record.recipe)) errors.push("recipe must be an object.");
  if (!record.provenance || typeof record.provenance !== "object" || Array.isArray(record.provenance)) {
    errors.push("provenance must be an object.");
  } else {
    if ("mutationLog" in record.provenance || "mutations" in record.provenance) errors.push("provenance must not contain a second mutation log.");
    for (const field of ["originReferences", "evidenceReferences", "derivationReferences", "parentLineage"]) {
      if (!Array.isArray(record.provenance[field])) errors.push(`provenance.${field} must be an array.`);
    }
    if (!record.provenance.sealing || typeof record.provenance.sealing !== "object") {
      errors.push("provenance.sealing must be an object.");
    } else {
      const sealing = record.provenance.sealing;
      if (!["unsealed", "diagnostic_sealed"].includes(sealing.state)) errors.push("provenance.sealing.state is invalid.");
      if (sealing.diagnosticAlgorithm !== "cyrb53-sorted-json-v0") errors.push("provenance diagnostic algorithm must remain explicitly non-authoritative.");
      if (sealing.state === "diagnostic_sealed") {
        if (!isExactUtc(sealing.sealedAtUtc)) errors.push("diagnostic sealing requires an exact UTC millisecond sealedAtUtc.");
        for (const field of ["diagnosticBaselineFingerprint", "diagnosticRecordFingerprint"]) {
          if (!/^safe-[0-9a-f]+$/i.test(String(sealing[field] || ""))) errors.push(`provenance.sealing.${field} must be a safe-* diagnostic fingerprint.`);
        }
      }
    }
  }
  if (!Array.isArray(record.mutationLog)) {
    errors.push("mutationLog must be a top-level array.");
  } else {
    record.mutationLog.forEach((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        errors.push(`mutationLog entry ${index + 1} must be an object.`);
        return;
      }
      if (entry.ordinal !== index + 1) errors.push(`mutationLog entry ${index + 1} has a non-sequential ordinal.`);
      for (const field of ["toolId", "toolVersion", "operation", "paramsSummary", "inputFingerprint", "outputFingerprint", "timestampUtc", "actorType", "approvalReset"]) {
        if (!(field in entry)) errors.push(`mutationLog entry ${index + 1} is missing ${field}.`);
      }
      for (const field of ["inputFingerprint", "outputFingerprint"]) {
        if (entry[field] != null && !String(entry[field]).startsWith("safe-")) errors.push(`mutationLog entry ${index + 1} ${field} must be a diagnostic safe-* value or null.`);
      }
      if (!isExactUtc(entry.timestampUtc)) errors.push(`mutationLog entry ${index + 1} timestampUtc must use exact UTC millisecond RFC 3339 format.`);
    });
  }
  if (!record.approval || typeof record.approval !== "object" || Array.isArray(record.approval)) {
    errors.push("approval must be an object.");
  } else if ("state" in record.approval || "approvalState" in record.approval) {
    errors.push("approval metadata must not duplicate approvalState ownership.");
  } else {
    if (!Array.isArray(record.approval.ratifiedChecks)) errors.push("approval.ratifiedChecks must be an array.");
    for (const field of ["approvedAtUtc", "reopenedAtUtc"]) {
      if (record.approval[field] != null && !isExactUtc(record.approval[field])) {
        errors.push(`approval.${field} must use exact UTC millisecond RFC 3339 format.`);
      }
    }
  }
  if (!record.safeRuntimeHandoff || typeof record.safeRuntimeHandoff !== "object" || Array.isArray(record.safeRuntimeHandoff)) {
    errors.push("safeRuntimeHandoff must be an object.");
  } else if (JSON.stringify(record.safeRuntimeHandoff) !== JSON.stringify(buildSafeHandoff(record))) {
    errors.push("safeRuntimeHandoff must equal the deterministic Lab-owned projection.");
  }

  const expectedUnresolved = collectUnresolvedFields(record);
  if (!Array.isArray(record.unresolvedFields)) {
    errors.push("unresolvedFields must be an array.");
  } else if (JSON.stringify(record.unresolvedFields) !== JSON.stringify(expectedUnresolved)) {
    errors.push("unresolvedFields must be the sorted, unique canonical unresolved-field projection.");
  }

  if (record.recordKind === "MERGED" && record.provenance?.parentLineage?.length < 2) {
    errors.push("MERGED authority records require at least two parent-lineage entries.");
  }
  if (record.approvalState === "reference" && !record.approval?.approvedAtUtc) errors.push("Reference approval requires approval.approvedAtUtc.");
  if (record.approvalState === "pending_review" && !record.approval?.reopenedAtUtc) errors.push("pending_review requires approval reopening metadata.");

  return { ok: errors.length === 0, errors };
}

export function assertAuthorityRecord(record) {
  const result = validateAuthorityRecord(record);
  if (!result.ok) {
    throw new AuthorityRecordError(result.errors.join(" "), "invalid_authority_record", result.errors);
  }
  return true;
}
