// ControlStack Lab — one-way sealed reference DTO adapter.
// Browser-safe. The rich authority remains authoritative and cannot be reconstructed from this projection.
import { canonicalizeJsonBytes } from "./iesCanonicalJson.js";
import {
  REFERENCE_DTO_HASH_DOMAIN,
  hashApprovalBinding,
  hashAuthorityRecord,
  isOpaqueArtifactReference,
  validateSha256Hex,
} from "./iesAuthorityFingerprint.js";
import {
  CANONICAL_KEYWORD_DEFINITIONS,
  KEYWORD_PROFILE_ID,
  normalizeKeywordName,
} from "./iesKeywordContract.js";
import { validateAuthorityRecord } from "./iesAuthorityRecord.js";

export const REFERENCE_DTO_SCHEMA_ID = "controlstack.lab.reference.1mm.v1";
export const REFERENCE_DTO_SCHEMA_VERSION = 1;

const EXACT_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const GEOMETRY_FIELDS = Object.freeze(Array.from({ length: 13 }, (_, index) => `G${index}`));
const G11_LEXICAL = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?$/;
const ID_PREFIX = Object.freeze({ GT: "GT", OPT: "OPT", MERGED: "MRG" });
const CANONICAL_BY_KEY = new Map(CANONICAL_KEYWORD_DEFINITIONS.map((entry) => [entry.key, entry]));

export class ReferenceDtoError extends Error {
  constructor(message, code = "invalid_reference_dto_input", details = null) {
    super(message);
    this.name = "ReferenceDtoError";
    this.code = code;
    if (details != null) this.details = details;
  }
}

function fail(message, code, details = null) {
  throw new ReferenceDtoError(message, code, details);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function requirePlainObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${name} must be a plain object.`, "plain_object_required");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(`${name} must be a plain object.`, "plain_object_required");
  }
  return value;
}

function requireNonEmptyString(value, name) {
  if (typeof value !== "string" || value.trim().length === 0 || value !== value.trim()) {
    fail(`${name} must be a non-empty trimmed string.`, "non_empty_string_required");
  }
  return value;
}

function optionalTrimmedString(value, name) {
  if (value == null) return null;
  if (typeof value !== "string") value = String(value);
  const text = value.trim();
  if (!text) return null;
  if (text !== value) fail(`${name} must not contain surrounding whitespace.`, "invalid_trimmed_string");
  return text;
}

function requireExactUtc(value, name) {
  if (typeof value !== "string" || !EXACT_UTC.test(value)) {
    fail(`${name} must use exactly YYYY-MM-DDTHH:mm:ss.sssZ.`, "invalid_exact_utc");
  }
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    fail(`${name} must be a real exact UTC millisecond timestamp.`, "invalid_exact_utc");
  }
  return value;
}

function requireSha(value, name) {
  if (!validateSha256Hex(value)) {
    fail(`${name} must be a lowercase raw 64-character SHA-256 hexadecimal value.`, "invalid_sha256_hex");
  }
  return value;
}

function requireArtifactRef(value, name) {
  if (!isOpaqueArtifactReference(value)) {
    fail(`${name} must be an opaque non-local artifact reference.`, "invalid_artifact_reference");
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function pointerEscape(value) {
  return String(value).replace(/~/g, "~0").replace(/\//g, "~1");
}

function isValidJsonPointer(value) {
  return typeof value === "string"
    && value.startsWith("/")
    && !/~(?:[^01]|$)/.test(value);
}

function labFormPointer(row, index) {
  const bare = String(row?.bareField || row?.field || index).replace(/^\[|\]$/g, "").toUpperCase();
  return `/labForm/${pointerEscape(bare)}`;
}

function collectBlockingUnresolvedPointers(record) {
  const labRowsByPointer = new Map();
  for (const [index, row] of (record.labForm || []).entries()) {
    const pointer = labFormPointer(row, index);
    const rows = labRowsByPointer.get(pointer) || [];
    rows.push(row);
    labRowsByPointer.set(pointer, rows);
  }

  const blocking = [];
  for (const pointer of record.unresolvedFields || []) {
    if (isValidJsonPointer(pointer) && pointer.startsWith("/labForm/")) {
      const rows = labRowsByPointer.get(pointer);
      if (rows?.length && rows.every((row) => row?.gatesReference === false)) continue;
    }
    blocking.push(pointer);
  }
  return [...new Set(blocking)].sort();
}

function digestToHex(digest) {
  if (!(digest instanceof Uint8Array) || digest.byteLength !== 32) {
    fail("hashProvider.digest must resolve to exactly 32 Uint8Array bytes.", "invalid_digest");
  }
  let output = "";
  for (const byte of digest) output += byte.toString(16).padStart(2, "0");
  return output;
}

async function hashReferenceCandidate(candidate, hashProvider) {
  if (!hashProvider || typeof hashProvider.digest !== "function") {
    fail("A hashProvider with async digest(bytes) is required.", "hash_provider_required");
  }
  const bytes = canonicalizeJsonBytes({
    hashDomain: REFERENCE_DTO_HASH_DOMAIN,
    ...candidate,
  });
  return digestToHex(await hashProvider.digest(bytes.slice()));
}

function validateIdentity(record, sealContext) {
  const identity = requirePlainObject(sealContext.identity, "sealContext.identity");
  const kind = requireNonEmptyString(identity.kind, "sealContext.identity.kind");
  if (!(kind in ID_PREFIX) || kind !== record.recordKind) {
    fail("sealContext.identity.kind must exactly match the authority record kind.", "identity_kind_mismatch");
  }
  if (!Number.isInteger(identity.serial) || identity.serial < 1) {
    fail("sealContext.identity.serial must be a positive integer.", "invalid_reference_serial");
  }
  const referenceId = requireNonEmptyString(identity.referenceId, "sealContext.identity.referenceId");
  const expected = `NVB-REF-${ID_PREFIX[kind]}-${String(identity.serial).padStart(6, "0")}`;
  if (referenceId !== expected || identity.serial > 999999) {
    fail(`Reference identity must exactly equal ${expected}.`, "reference_identity_mismatch");
  }
  requireArtifactRef(identity.allocationRef, "sealContext.identity.allocationRef");
  return { referenceId, kind, serial: identity.serial };
}

function normalizeArtifactEntry(value, name, shaRequired) {
  if (value == null) return null;
  const entry = requirePlainObject(value, name);
  const output = { artifactRef: requireArtifactRef(entry.artifactRef, `${name}.artifactRef`) };
  if (shaRequired) output.sha256 = requireSha(entry.sha256, `${name}.sha256`);
  return output;
}

function validateArtifacts(record, sealContext) {
  const artifacts = requirePlainObject(sealContext.artifacts, "sealContext.artifacts");
  const authorityRecord = normalizeArtifactEntry(artifacts.authorityRecord, "sealContext.artifacts.authorityRecord", false);
  if (!authorityRecord) fail("sealContext.artifacts.authorityRecord is required.", "authority_artifact_required");
  const originIes = normalizeArtifactEntry(artifacts.originIes, "sealContext.artifacts.originIes", false);
  const evidenceIndex = normalizeArtifactEntry(artifacts.evidenceIndex, "sealContext.artifacts.evidenceIndex", true);
  const mutationLog = normalizeArtifactEntry(artifacts.mutationLog, "sealContext.artifacts.mutationLog", true);

  if (record.recordKind === "GT" || record.recordKind === "OPT") {
    if (!originIes) fail(`${record.recordKind} sealing requires an originIes artifact reference.`, "origin_artifact_required");
  } else if (originIes !== null) {
    fail("MERGED sealing requires originIes to be null.", "merged_origin_artifact_forbidden");
  }
  return { authorityRecord, originIes, evidenceIndex, mutationLog };
}

function buildKeywordProfile(record) {
  if (!Array.isArray(record.labForm)) fail("authorityRecord.labForm must be an array.", "invalid_keyword_profile");
  const selected = new Map();
  for (const [index, rowValue] of record.labForm.entries()) {
    const row = requirePlainObject(rowValue, `authorityRecord.labForm[${index}]`);
    const key = normalizeKeywordName(row.bareField ?? row.field ?? row.key);
    if (!key) continue;
    const definition = CANONICAL_BY_KEY.get(key);
    if (!definition) {
      if (key === "_AMBIENT_TA_C" || key === "_EMERGENCY_CAPABLE") {
        fail(`Stale keyword alias ${key} cannot enter a sealed reference.`, "stale_keyword_alias");
      }
      if (row.kind === "ies" || String(row.source || "").startsWith("from-file") || row.source === "file-extra") {
        fail(`Supplementary keyword ${key} is not permitted in the sealed profile.`, "supplementary_keyword_forbidden");
      }
      continue;
    }
    if (selected.has(key)) fail(`Duplicate canonical keyword ${key}.`, "duplicate_keyword");
    if (row.owner != null && row.owner !== definition.owner) {
      fail(`Keyword ${key} owner must be ${definition.owner}.`, "keyword_owner_mismatch");
    }
    const value = row.value == null || String(row.value).trim() === "" ? null : String(row.value).trim();
    selected.set(key, value);
  }

  const values = CANONICAL_KEYWORD_DEFINITIONS.map((definition) => {
    if (!selected.has(definition.key)) {
      fail(`Canonical keyword ${definition.key} is missing.`, "canonical_keyword_missing");
    }
    return { key: definition.key, value: selected.get(definition.key), owner: definition.owner };
  });
  return { profileId: KEYWORD_PROFILE_ID, values };
}

function buildMetadata(record) {
  const photometry = requirePlainObject(record.photometry, "authorityRecord.photometry");
  const geometry = requirePlainObject(photometry.geometry, "authorityRecord.photometry.geometry");
  const metadata = {};
  for (const field of GEOMETRY_FIELDS) {
    if (!hasOwn(geometry, field)) fail(`authorityRecord.photometry.geometry.${field} is required.`, "metadata_field_missing");
    const value = geometry[field];
    if (field === "G11") {
      if (typeof value !== "string" || value !== value.trim() || !G11_LEXICAL.test(value) || !Number.isFinite(Number(value))) {
        fail("G11 must be a validated lexical finite number string.", "invalid_g11_lexical");
      }
      metadata[field] = value;
    } else {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        fail(`${field} must be a finite number.`, "invalid_metadata_number");
      }
      metadata[field] = value;
    }
  }
  if (!Number.isInteger(metadata.G3) || metadata.G3 < 1 || !Number.isInteger(metadata.G4) || metadata.G4 < 1) {
    fail("G3 and G4 must be positive integers.", "invalid_angle_counts");
  }
  if (metadata.G8 !== 0.001) fail("G8 must equal 0.001.", "invalid_one_mm_geometry");
  return metadata;
}

function requireIncreasingAngles(value, name, maximum) {
  if (!Array.isArray(value) || value.length === 0) fail(`${name} must be a non-empty array.`, "invalid_angles");
  const output = value.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isFinite(entry) || entry < 0 || entry > maximum) {
      fail(`${name}[${index}] is outside the supported LM-63 range.`, "invalid_angle_value");
    }
    return entry;
  });
  for (let index = 1; index < output.length; index += 1) {
    if (!(output[index] > output[index - 1])) fail(`${name} must be strictly increasing.`, "angles_not_increasing");
  }
  return output;
}

function buildPhotometry(record, metadata) {
  const photometry = record.photometry;
  const vAngles = requireIncreasingAngles(
    photometry.v_angles ?? photometry.verticalAngles ?? photometry.vertical_angles,
    "authorityRecord.photometry.v_angles",
    180,
  );
  const hAngles = requireIncreasingAngles(
    photometry.h_angles ?? photometry.horizontalAngles ?? photometry.horizontal_angles,
    "authorityRecord.photometry.h_angles",
    360,
  );
  if (metadata.G3 !== vAngles.length || metadata.G4 !== hAngles.length) {
    fail("G3/G4 must equal the vertical/horizontal angle counts.", "angle_count_mismatch");
  }
  if (!Array.isArray(photometry.candela) || photometry.candela.length !== metadata.G4) {
    fail("Candela row count must equal G4.", "candela_row_count_mismatch");
  }
  const candela = photometry.candela.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== metadata.G3) {
      fail(`Candela row ${rowIndex} length must equal G3.`, "candela_column_count_mismatch");
    }
    return row.map((value, columnIndex) => {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        fail(`Candela value [${rowIndex}][${columnIndex}] must be finite and non-negative.`, "invalid_candela_value");
      }
      return value;
    });
  });
  return { angles: { v_angles: vAngles, h_angles: hAngles }, candela };
}

function keywordValue(record, key) {
  const normalized = normalizeKeywordName(key);
  const row = (record.labForm || []).find((entry) => normalizeKeywordName(entry?.bareField ?? entry?.field ?? entry?.key) === normalized);
  return row?.value ?? null;
}

function optionalFiniteNumber(value, name) {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(`${name} must be finite when non-null.`, "invalid_baseline_number");
    return value;
  }
  const text = String(value).trim();
  const match = text.match(/^([+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?)(?:\s*(?:K|C|°C|RA))?$/i);
  if (!match || !Number.isFinite(Number(match[1]))) return null;
  return Number(match[1]);
}

function buildBaseline(record, metadata) {
  const baseline = {
    cct: optionalFiniteNumber(keywordValue(record, "_COLORTEMP"), "baseline.cct"),
    cri: optionalFiniteNumber(keywordValue(record, "_CRI"), "baseline.cri"),
    internalAmbientTaC: optionalFiniteNumber(
      keywordValue(record, "_INTERNAL_AMBIENT_TA_C"),
      "baseline.internalAmbientTaC",
    ),
    fluxPerMm: optionalFiniteNumber(metadata.G11, "baseline.fluxPerMm"),
    wallWattsPerMm: optionalFiniteNumber(metadata.G12, "baseline.wallWattsPerMm"),
    circuitWattsPerMm: optionalFiniteNumber(metadata.G10, "baseline.circuitWattsPerMm"),
  };
  if (baseline.wallWattsPerMm !== metadata.G12) {
    fail("baseline.wallWattsPerMm must exactly agree with G12.", "baseline_g12_mismatch");
  }

  if (record.baseline != null) {
    const declared = requirePlainObject(record.baseline, "authorityRecord.baseline");
    const allowed = Object.keys(baseline);
    for (const key of Object.keys(declared)) {
      if (!allowed.includes(key)) fail(`authorityRecord.baseline.${key} is not permitted.`, "baseline_extension_forbidden");
    }
    for (const key of allowed) {
      if (!hasOwn(declared, key)) fail(`authorityRecord.baseline.${key} is required.`, "baseline_field_missing");
      const value = optionalFiniteNumber(declared[key], `authorityRecord.baseline.${key}`);
      if (!Object.is(value, baseline[key])) {
        const suffix = key === "wallWattsPerMm" ? " and must exactly agree with G12" : "";
        fail(`authorityRecord.baseline.${key} must equal the cryptographically bound baseline${suffix}.`, "baseline_binding_mismatch");
      }
    }
  }
  return baseline;
}

function normalizeParentReference(entryValue, index) {
  const entry = requirePlainObject(entryValue, `parentReferences[${index}]`);
  const referenceId = requireNonEmptyString(
    entry.referenceId ?? entry.recordId ?? entry.parentId ?? entry.id,
    `parentReferences[${index}].referenceId`,
  );
  const identityMatch = referenceId.match(/^NVB-REF-(GT|OPT|MRG)-(\d{6})$/);
  if (!identityMatch || Number(identityMatch[2]) < 1) {
    fail(`parentReferences[${index}].referenceId is not a trusted reference identity.`, "invalid_parent_reference_id");
  }
  const relation = optionalTrimmedString(entry.relation ?? entry.role, `parentReferences[${index}].relation`);
  const kind = optionalTrimmedString(entry.kind ?? entry.recordKind ?? entry.parentKind, `parentReferences[${index}].kind`);
  const identityKind = identityMatch[1] === "MRG" ? "MERGED" : identityMatch[1];
  if (kind != null && kind !== identityKind) {
    fail(`parentReferences[${index}].kind must match its referenceId prefix.`, "parent_kind_mismatch");
  }
  const referenceSha256 = entry.referenceSha256 == null ? null : requireSha(entry.referenceSha256, `parentReferences[${index}].referenceSha256`);
  const artifactRef = entry.artifactRef == null ? null : requireArtifactRef(entry.artifactRef, `parentReferences[${index}].artifactRef`);
  const ordinal = entry.ordinal == null ? null : entry.ordinal;
  if (ordinal != null && (!Number.isInteger(ordinal) || ordinal < 1)) {
    fail(`parentReferences[${index}].ordinal must be a positive integer or null.`, "invalid_parent_ordinal");
  }
  return { relation, referenceId, kind, referenceSha256, artifactRef, ordinal };
}

function buildParentReferences(record) {
  const lineage = Array.isArray(record.provenance?.parentLineage) ? record.provenance.parentLineage : [];
  const derivations = Array.isArray(record.provenance?.derivationReferences) ? record.provenance.derivationReferences : [];
  const source = lineage.length ? lineage : derivations.filter((entry) => (
    entry?.relation === "reference_engine" || entry?.relation === "parent" || entry?.parentId || entry?.referenceId
  ));
  const parents = source.map(normalizeParentReference);
  if (record.recordKind === "MERGED" && parents.length < 2) {
    fail("MERGED references require at least two ordered parent references.", "merged_parent_lineage_required");
  }
  if (record.recordKind === "OPT" && parents.length < 1) {
    fail("OPT references require at least one gear-tray/reference-engine parent reference.", "optic_parent_lineage_required");
  }
  return parents;
}

async function validateCryptographicAuthority(record, hashProvider) {
  const validation = validateAuthorityRecord(record);
  if (!validation.ok) fail(`Invalid rich authority schema: ${validation.errors.join(" ")}`, "invalid_authority_schema");
  if (record.oneMmNormalised !== true || record.baseLengthM !== 0.001) {
    fail("Authority must be a validated one-millimetre record.", "authority_not_one_mm");
  }
  if (record.approvalState !== "reference" || record.revisionState !== "current" || record.labProofState !== "complete") {
    fail("Authority must be a current cryptographic reference with no pending review.", "authority_not_reference");
  }
  const blockingUnresolvedFields = collectBlockingUnresolvedPointers(record);
  if (blockingUnresolvedFields.length !== 0) {
    fail(
      "Authority contains blocking unresolved fields.",
      "blocking_unresolved_fields",
      { blockingUnresolvedFields },
    );
  }
  requireSha(record.authorityRecordSha256, "authorityRecord.authorityRecordSha256");
  const expectedAuthorityRecordSha256 = await hashAuthorityRecord(record, hashProvider);
  if (expectedAuthorityRecordSha256 !== record.authorityRecordSha256) {
    fail("authorityRecordSha256 is stale for the current rich authority content.", "stale_authority_record_sha");
  }
  if (record.recordFingerprint !== record.authorityRecordSha256) {
    fail("recordFingerprint must exactly equal authorityRecordSha256.", "record_fingerprint_mismatch");
  }

  if (record.recordKind === "GT" || record.recordKind === "OPT") {
    requireSha(record.originSha256, "authorityRecord.originSha256");
    if (record.sourceFingerprint !== record.originSha256 || record.origin?.fingerprint !== record.originSha256) {
      fail("GT/OPT source aliases must exactly equal originSha256.", "source_fingerprint_mismatch");
    }
    if (record.derivationSha256 !== null) fail("GT/OPT derivationSha256 must be null.", "unexpected_derivation_sha");
  } else if (record.recordKind === "MERGED") {
    if (record.originSha256 !== null || record.origin?.fingerprint !== null) {
      fail("MERGED origin SHA fields must remain null.", "unexpected_origin_sha");
    }
    requireSha(record.derivationSha256, "authorityRecord.derivationSha256");
    if (record.sourceFingerprint !== record.derivationSha256) {
      fail("MERGED sourceFingerprint must exactly equal derivationSha256.", "source_fingerprint_mismatch");
    }
  } else {
    fail("Authority record kind must be GT, OPT, or MERGED.", "invalid_record_kind");
  }

  const approval = requirePlainObject(record.approval, "authorityRecord.approval");
  requireExactUtc(approval.approvedAtUtc, "authorityRecord.approval.approvedAtUtc");
  requireNonEmptyString(approval.approverId, "authorityRecord.approval.approverId");
  if (!Array.isArray(approval.ratifiedChecks)) fail("authorityRecord.approval.ratifiedChecks must be an array.", "invalid_ratified_checks");
  requireSha(approval.approvalFingerprint, "authorityRecord.approval.approvalFingerprint");
  if (approval.authorityRecordSha256 !== record.authorityRecordSha256) {
    fail("Approval is stale for the current authority record.", "stale_approval");
  }
  if (approval.reopenedAtUtc != null || approval.reopenedByMutationOrdinal != null) {
    fail("Pending-review approval metadata cannot be sealed.", "pending_review_approval");
  }
  const expectedApprovalFingerprint = await hashApprovalBinding({
    authorityRecordSha256: record.authorityRecordSha256,
    state: "reference",
    approvedAtUtc: approval.approvedAtUtc,
    approverId: approval.approverId,
    ratifiedChecks: approval.ratifiedChecks,
  }, hashProvider);
  if (expectedApprovalFingerprint !== approval.approvalFingerprint) {
    fail("Approval fingerprint is stale or malformed.", "stale_approval_fingerprint");
  }
}

export async function sealAuthorityToReferenceDto(authorityRecord, sealContext, hashProvider) {
  const record = requirePlainObject(authorityRecord, "authorityRecord");
  const context = requirePlainObject(sealContext, "sealContext");
  for (const forbidden of ["metadata", "photometry", "keywordProfile", "approval", "candela", "baseline", "authorityRecord"]) {
    if (hasOwn(context, forbidden)) fail(`sealContext.${forbidden} cannot override authority content.`, "seal_context_override_forbidden");
  }

  await validateCryptographicAuthority(record, hashProvider);
  const identity = validateIdentity(record, context);
  const sealedAtUtc = requireExactUtc(context.sealedAtUtc, "sealContext.sealedAtUtc");
  const artifacts = validateArtifacts(record, context);
  const keywordProfile = buildKeywordProfile(record);
  const metadata = buildMetadata(record);
  const photometry = buildPhotometry(record, metadata);
  const baseline = buildBaseline(record, metadata);
  const parentReferences = buildParentReferences(record);

  const candidate = {
    schemaId: REFERENCE_DTO_SCHEMA_ID,
    schemaVersion: REFERENCE_DTO_SCHEMA_VERSION,
    kind: identity.kind,
    id: identity.referenceId,
    serial: identity.serial,
    sealedAtUtc,
    authorityRecordSha256: record.authorityRecordSha256,
    originSha256: record.originSha256,
    derivationSha256: record.derivationSha256,
    approval: {
      state: "reference",
      approvedAtUtc: record.approval.approvedAtUtc,
      approvalFingerprint: record.approval.approvalFingerprint,
    },
    keywordProfile,
    metadata,
    angles: photometry.angles,
    candela: photometry.candela,
    baseline,
    provenanceRefs: {
      authorityRecord: artifacts.authorityRecord,
      originIes: artifacts.originIes,
      evidenceIndex: artifacts.evidenceIndex,
      mutationLog: artifacts.mutationLog,
      parentReferences,
    },
  };
  const referenceSha256 = await hashReferenceCandidate(candidate, hashProvider);
  return deepFreeze({ ...candidate, referenceSha256 });
}
