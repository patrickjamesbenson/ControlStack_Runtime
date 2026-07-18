// ControlStack Lab — canonical SHA-256 foundations for authority content.
// Browser-safe. Hashing is provided through an injected asynchronous digest provider.
import { canonicalizeJsonBytes } from "./iesCanonicalJson.js";

export const AUTHORITY_CONTENT_HASH_DOMAIN = "controlstack.lab.authority-content.v1";
export const APPROVAL_BINDING_HASH_DOMAIN = "controlstack.lab.approval-binding.v1";
export const REFERENCE_DTO_HASH_DOMAIN = "controlstack.lab.reference-dto.v1";
export const DERIVATION_HASH_DOMAIN = "controlstack.lab.derivation.v1";

export const AUTHORITY_HASH_DOMAINS = Object.freeze({
  authorityContent: AUTHORITY_CONTENT_HASH_DOMAIN,
  approvalBinding: APPROVAL_BINDING_HASH_DOMAIN,
  referenceDto: REFERENCE_DTO_HASH_DOMAIN,
  derivation: DERIVATION_HASH_DOMAIN,
});

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const compareUtf16 = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const SHA256_HEX = /^[0-9a-f]{64}$/;
const EXACT_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const GEOMETRY_FIELDS = Object.freeze(Array.from({ length: 13 }, (_, index) => `G${index}`));
const DIAGNOSTIC_KEYS = new Set([
  "sourcefingerprint",
  "recordfingerprint",
  "fingerprint",
  "authorityrecordsha256",
  "referencesha256",
  "originsha256",
  "artifactsha256",
  "approvalfingerprint",
  "inputfingerprint",
  "outputfingerprint",
  "approvalstate",
  "revisionstate",
  "labproofstate",
  "approval",
  "saferuntimehandoff",
  "unresolvedfields",
  "sealedatutc",
  "timestamputc",
  "diagnosticalgorithm",
  "algorithmlabel",
]);
const DIAGNOSTIC_VALUE = /^(?:safe-|rec-|prov-|cd-|fnv(?:1a|32|64)?(?:[-_:]|$)|cyrb(?:53)?(?:[-_:]|$))/i;
const FORBIDDEN_GOVERNED_KEYS = new Set([
  "exactbytes",
  "rawbytes",
  "bytes",
  "rawtext",
  "iestext",
  "localpath",
  "filesystempath",
]);

export class AuthorityFingerprintError extends Error {
  constructor(message, code = "invalid_authority_fingerprint_input") {
    super(message);
    this.name = "AuthorityFingerprintError";
    this.code = code;
  }
}

function fail(message, code) {
  throw new AuthorityFingerprintError(message, code);
}

function assertPlainObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${name} must be a plain object.`, "plain_object_required");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(`${name} must be a plain object.`, "plain_object_required");
  }
  return value;
}

function requireString(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${name} must be a non-empty string.`, "non_empty_string_required");
  }
  return value;
}

function optionalString(value, name) {
  if (value == null) return null;
  return requireString(value, name);
}

function optionalNonNegativeInteger(value, name) {
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 0) {
    fail(`${name} must be a non-negative integer or null.`, "invalid_non_negative_integer");
  }
  return value;
}

export function validateSha256Hex(value) {
  return typeof value === "string" && SHA256_HEX.test(value);
}

function requireSha256Hex(value, name) {
  if (!validateSha256Hex(value)) {
    fail(`${name} must be a lowercase raw 64-character SHA-256 hexadecimal value.`, "invalid_sha256_hex");
  }
  return value;
}

export function isOpaqueArtifactReference(value) {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  const text = value.trim();
  if (text !== value || /[\u0000-\u001f\u007f]/.test(text)) return false;
  if (/^[A-Za-z]:/.test(text)) return false;
  if (/^file:/i.test(text)) return false;
  if (/^(?:\\\\|\/\/)/.test(text)) return false;
  if (/^[\\/]/.test(text)) return false;
  if (/(?:^|[\\/])\.\.(?:[\\/]|$)/.test(text)) return false;
  return true;
}

function requireArtifactReference(value, name) {
  if (!isOpaqueArtifactReference(value)) {
    fail(`${name} must be an opaque repository or store reference, not a local or traversing path.`, "invalid_artifact_reference");
  }
  return value;
}

function isDiagnosticKey(key) {
  const lower = String(key).toLowerCase();
  return DIAGNOSTIC_KEYS.has(lower)
    || lower.startsWith("diagnostic")
    || lower.endsWith("fingerprint")
    || lower === "algorithm"
    || lower === "algorithmid";
}

function cloneGovernedValue(value, path = "$governed", rejectDiagnosticStrings = false) {
  if (value === null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (rejectDiagnosticStrings && DIAGNOSTIC_VALUE.test(value)) {
      fail(`${path} contains a diagnostic fingerprint or algorithm value.`, "diagnostic_value_forbidden");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) => cloneGovernedValue(entry, `${path}[${index}]`, rejectDiagnosticStrings));
  }
  assertPlainObject(value, path);
  const output = {};
  for (const key of Object.keys(value)) {
    const lower = key.toLowerCase();
    if (isDiagnosticKey(key) || FORBIDDEN_GOVERNED_KEYS.has(lower)) {
      fail(`${path}.${key} is diagnostic or raw working data and cannot enter an authority SHA projection.`, "diagnostic_field_forbidden");
    }
    if (lower === "artifactref") {
      output[key] = requireArtifactReference(value[key], `${path}.${key}`);
    } else {
      output[key] = cloneGovernedValue(value[key], `${path}.${key}`, rejectDiagnosticStrings);
    }
  }
  return output;
}

function copyIfPresent(output, source, key, projector = (value) => value) {
  if (hasOwn(source, key) && source[key] !== undefined) output[key] = projector(source[key]);
}

function projectArtifactReference(input, name) {
  const source = assertPlainObject(input, name);
  const output = {};
  copyIfPresent(output, source, "artifactRef", (value) => requireArtifactReference(value, `${name}.artifactRef`));
  for (const key of [
    "relation",
    "referenceId",
    "recordId",
    "recordKind",
    "parentId",
    "parentKind",
    "role",
    "mediaType",
    "evidenceId",
    "derivationId",
    "checkId",
    "decision",
  ]) {
    copyIfPresent(output, source, key, (value) => cloneGovernedValue(value, `${name}.${key}`));
  }
  for (const key of ["byteLength", "quantity", "ordinal"]) {
    copyIfPresent(output, source, key, (value) => cloneGovernedValue(value, `${name}.${key}`));
  }
  for (const key of ["originSha256", "authorityRecordSha256", "referenceSha256", "artifactSha256"]) {
    copyIfPresent(output, source, key, (value) => requireSha256Hex(value, `${name}.${key}`));
  }
  return output;
}

function projectReferenceList(value, name) {
  if (value == null) return [];
  if (!Array.isArray(value)) fail(`${name} must be an array.`, "array_required");
  return value.map((entry, index) => projectArtifactReference(entry, `${name}[${index}]`));
}

function selectOriginSha256(record, origin) {
  const candidates = [];
  if (record.originSha256 != null) candidates.push(record.originSha256);
  if (origin.originSha256 != null) candidates.push(origin.originSha256);
  if (candidates.length > 1 && candidates.some((value) => value !== candidates[0])) {
    fail("originSha256 is ambiguous between authority record locations.", "ambiguous_origin_sha256");
  }
  return candidates.length ? requireSha256Hex(candidates[0], "originSha256") : null;
}

function projectSourceBinding(record) {
  const origin = record.origin == null ? {} : assertPlainObject(record.origin, "authorityRecord.origin");
  const artifactRef = origin.artifactRef == null
    ? null
    : requireArtifactReference(origin.artifactRef, "authorityRecord.origin.artifactRef");
  return {
    artifactRef,
    byteLength: optionalNonNegativeInteger(origin.byteLength ?? null, "authorityRecord.origin.byteLength"),
    mediaType: optionalString(origin.mediaType ?? null, "authorityRecord.origin.mediaType"),
    originSha256: selectOriginSha256(record, origin),
  };
}

function canonicalLabField(row, index) {
  const raw = row.bareField ?? row.field ?? `ROW_${index + 1}`;
  const field = requireString(String(raw), `authorityRecord.labForm[${index}].field`)
    .replace(/^\[|\]$/g, "")
    .toUpperCase();
  return field;
}

function projectLabAuthorityValues(value) {
  if (value == null) return [];
  if (!Array.isArray(value)) fail("authorityRecord.labForm must be an array.", "array_required");
  return value.map((entry, index) => {
    const row = assertPlainObject(entry, `authorityRecord.labForm[${index}]`);
    const output = { field: canonicalLabField(row, index) };
    for (const key of ["order", "value", "source", "kind", "gatesReference", "options"]) {
      copyIfPresent(output, row, key, (child) => cloneGovernedValue(child, `authorityRecord.labForm[${index}].${key}`));
    }
    return output;
  }).sort((left, right) => {
    const leftOrder = Number.isFinite(Number(left.order)) ? Number(left.order) : Number.MAX_SAFE_INTEGER;
    const rightOrder = Number.isFinite(Number(right.order)) ? Number(right.order) : Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || compareUtf16(left.field, right.field);
  });
}

function projectPhotometry(value) {
  const source = assertPlainObject(value, "authorityRecord.photometry");
  const geometrySource = source.geometry == null ? {} : assertPlainObject(source.geometry, "authorityRecord.photometry.geometry");
  const geometry = {};
  for (const field of GEOMETRY_FIELDS) {
    copyIfPresent(geometry, geometrySource, field, (child) => cloneGovernedValue(child, `authorityRecord.photometry.geometry.${field}`));
  }

  const output = { geometry };
  const verticalAngles = source.v_angles ?? source.verticalAngles ?? source.vertical_angles ?? [];
  const horizontalAngles = source.h_angles ?? source.horizontalAngles ?? source.horizontal_angles ?? [];
  output.verticalAngles = cloneGovernedValue(verticalAngles, "authorityRecord.photometry.verticalAngles");
  output.horizontalAngles = cloneGovernedValue(horizontalAngles, "authorityRecord.photometry.horizontalAngles");
  output.candela = cloneGovernedValue(source.candela ?? [], "authorityRecord.photometry.candela");

  for (const key of [
    "lampCount",
    "lumensPerLamp",
    "candelaMultiplier",
    "verticalAngleCount",
    "horizontalAngleCount",
    "photometricType",
    "unitsType",
    "ballastFactor",
    "futureUse",
    "inputWatts",
    "tilt",
  ]) {
    copyIfPresent(output, source, key, (child) => cloneGovernedValue(child, `authorityRecord.photometry.${key}`));
  }
  return output;
}

function projectRecipe(value, name = "authorityRecord.recipe") {
  const source = assertPlainObject(value, name);
  const output = {};
  for (const key of ["operation", "mode", "toolId", "toolVersion"]) {
    copyIfPresent(output, source, key, (child) => cloneGovernedValue(child, `${name}.${key}`));
  }
  for (const key of ["paramsSummary", "decisions", "geometryRegistration"]) {
    copyIfPresent(output, source, key, (child) => cloneGovernedValue(child, `${name}.${key}`, true));
  }
  if (hasOwn(source, "artifactReferences")) {
    output.artifactReferences = projectReferenceList(source.artifactReferences, `${name}.artifactReferences`);
  }
  return output;
}

function projectMutationLog(value) {
  if (value == null) return [];
  if (!Array.isArray(value)) fail("authorityRecord.mutationLog must be an array.", "array_required");
  const projected = value.map((entry, index) => {
    const source = assertPlainObject(entry, `authorityRecord.mutationLog[${index}]`);
    if (!Number.isInteger(source.ordinal) || source.ordinal < 1) {
      fail(`authorityRecord.mutationLog[${index}].ordinal must be a positive integer.`, "invalid_mutation_ordinal");
    }
    const output = { ordinal: source.ordinal };
    for (const key of ["toolId", "toolVersion", "operation", "actorType"]) {
      copyIfPresent(output, source, key, (child) => cloneGovernedValue(child, `authorityRecord.mutationLog[${index}].${key}`));
    }
    for (const key of ["paramsSummary", "authorityChanges", "decision"]) {
      copyIfPresent(output, source, key, (child) => cloneGovernedValue(child, `authorityRecord.mutationLog[${index}].${key}`, true));
    }
    return output;
  });
  projected.sort((left, right) => left.ordinal - right.ordinal);
  for (let index = 0; index < projected.length; index += 1) {
    if (projected[index].ordinal !== index + 1) {
      fail("authorityRecord.mutationLog ordinals must be unique and contiguous from 1.", "invalid_mutation_ordinal_sequence");
    }
  }
  return projected;
}

export function buildAuthorityHashProjection(authorityRecord) {
  const record = assertPlainObject(authorityRecord, "authorityRecord");
  const provenance = record.provenance == null ? {} : assertPlainObject(record.provenance, "authorityRecord.provenance");
  return {
    hashDomain: AUTHORITY_CONTENT_HASH_DOMAIN,
    schemaId: record.schemaId,
    schemaVersion: record.schemaVersion,
    recordId: record.recordId,
    recordKind: record.recordKind,
    oneMmNormalised: record.oneMmNormalised,
    baseLengthM: record.baseLengthM,
    photometryMode: record.photometryMode,
    sourceBinding: projectSourceBinding(record),
    labAuthorityValues: projectLabAuthorityValues(record.labForm),
    photometry: projectPhotometry(record.photometry),
    recipe: projectRecipe(record.recipe),
    provenance: {
      originReferences: projectReferenceList(provenance.originReferences, "authorityRecord.provenance.originReferences"),
      evidenceReferences: projectReferenceList(provenance.evidenceReferences, "authorityRecord.provenance.evidenceReferences"),
      derivationReferences: projectReferenceList(provenance.derivationReferences, "authorityRecord.provenance.derivationReferences"),
      parentLineage: projectReferenceList(provenance.parentLineage, "authorityRecord.provenance.parentLineage"),
    },
    mutationLog: projectMutationLog(record.mutationLog),
  };
}

function normaliseRatifiedChecks(value) {
  let entries;
  if (value == null) entries = [];
  else if (Array.isArray(value)) entries = value;
  else {
    assertPlainObject(value, "approvalInput.ratifiedChecks");
    entries = Object.entries(value).map(([checkId, decision]) => ({ checkId, decision }));
  }

  const projected = entries.map((entry, index) => {
    const source = assertPlainObject(entry, `approvalInput.ratifiedChecks[${index}]`);
    const rawCheckId = source.checkId ?? source.field ?? source.id;
    const checkId = requireString(String(rawCheckId ?? ""), `approvalInput.ratifiedChecks[${index}].checkId`)
      .replace(/^\[|\]$/g, "")
      .toUpperCase();
    if (!hasOwn(source, "decision")) {
      fail(`approvalInput.ratifiedChecks[${index}].decision is required.`, "ratified_decision_required");
    }
    return {
      checkId,
      decision: cloneGovernedValue(source.decision, `approvalInput.ratifiedChecks[${index}].decision`),
    };
  });
  projected.sort((left, right) => compareUtf16(left.checkId, right.checkId));
  for (let index = 1; index < projected.length; index += 1) {
    if (projected[index - 1].checkId === projected[index].checkId) {
      fail(`Duplicate ratified check ${projected[index].checkId}.`, "duplicate_ratified_check");
    }
  }
  return projected;
}

function requireExactUtc(value) {
  if (typeof value !== "string" || !EXACT_UTC.test(value)) {
    fail("approvedAtUtc must use exactly YYYY-MM-DDTHH:mm:ss.sssZ.", "invalid_approval_time");
  }
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    fail("approvedAtUtc must be a real UTC timestamp using exactly YYYY-MM-DDTHH:mm:ss.sssZ.", "invalid_approval_time");
  }
  return value;
}

export function buildApprovalBindingProjection(approvalInput) {
  const input = assertPlainObject(approvalInput, "approvalInput");
  if (input.state !== "reference") {
    fail('approvalInput.state must be exactly "reference".', "invalid_approval_state");
  }
  return {
    hashDomain: APPROVAL_BINDING_HASH_DOMAIN,
    authorityRecordSha256: requireSha256Hex(input.authorityRecordSha256, "approvalInput.authorityRecordSha256"),
    state: "reference",
    approvedAtUtc: requireExactUtc(input.approvedAtUtc),
    approverId: requireString(input.approverId, "approvalInput.approverId"),
    ratifiedChecks: normaliseRatifiedChecks(input.ratifiedChecks ?? input.ratifiedCheckDecisions),
  };
}

function projectParentInstance(entry, index) {
  const source = assertPlainObject(entry, `derivationInput.parentInstances[${index}]`);
  const parentId = source.parentId ?? source.recordId ?? source.id;
  const parentKind = source.parentKind ?? source.recordKind ?? source.kind;
  const output = {
    parentId: requireString(parentId, `derivationInput.parentInstances[${index}].parentId`),
    parentKind: requireString(parentKind, `derivationInput.parentInstances[${index}].parentKind`),
    role: requireString(source.role, `derivationInput.parentInstances[${index}].role`),
    referenceSha256: requireSha256Hex(source.referenceSha256, `derivationInput.parentInstances[${index}].referenceSha256`),
  };
  if (hasOwn(source, "quantity")) output.quantity = cloneGovernedValue(source.quantity, `derivationInput.parentInstances[${index}].quantity`);
  if (hasOwn(source, "ordinal")) output.ordinal = cloneGovernedValue(source.ordinal, `derivationInput.parentInstances[${index}].ordinal`);
  if (hasOwn(source, "artifactRef")) {
    output.artifactRef = requireArtifactReference(source.artifactRef, `derivationInput.parentInstances[${index}].artifactRef`);
  }
  return output;
}

export function buildDerivationProjection(derivationInput) {
  const input = assertPlainObject(derivationInput, "derivationInput");
  const parents = input.parentInstances ?? input.parents;
  if (!Array.isArray(parents) || parents.length === 0) {
    fail("derivationInput.parentInstances must be a non-empty ordered array.", "parent_instances_required");
  }
  const projection = {
    hashDomain: DERIVATION_HASH_DOMAIN,
    operation: requireString(input.operation, "derivationInput.operation"),
    mode: requireString(input.mode, "derivationInput.mode"),
    geometryRegistration: cloneGovernedValue(input.geometryRegistration ?? {}, "derivationInput.geometryRegistration", true),
    parentInstances: parents.map(projectParentInstance),
    artifactReferences: projectReferenceList(input.artifactReferences, "derivationInput.artifactReferences"),
    recipe: cloneGovernedValue(input.recipe ?? {}, "derivationInput.recipe", true),
  };
  for (const key of ["algorithm", "algorithmId", "kernelId", "kernelIdentifier", "kernelVersion"]) {
    copyIfPresent(projection, input, key, (value) => cloneGovernedValue(value, `derivationInput.${key}`));
  }
  return projection;
}

function toExactBytes(input) {
  if (input instanceof Uint8Array) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength).slice();
  if (input instanceof ArrayBuffer) return new Uint8Array(input.slice(0));
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength).slice();
  }
  fail("Exact bytes must be a Uint8Array, ArrayBuffer, or ArrayBuffer view.", "invalid_exact_bytes");
}

function digestToHex(digest) {
  if (!(digest instanceof Uint8Array)) {
    fail("hashProvider.digest must resolve to a Uint8Array.", "invalid_digest_type");
  }
  if (digest.byteLength !== 32) {
    fail("hashProvider.digest must return exactly 32 bytes for SHA-256.", "invalid_digest_length");
  }
  let output = "";
  for (const byte of digest) output += byte.toString(16).padStart(2, "0");
  return output;
}

async function digestBytes(bytes, hashProvider) {
  if (!hashProvider || typeof hashProvider.digest !== "function") {
    fail("A hashProvider with async digest(bytes) is required.", "hash_provider_required");
  }
  const digest = await hashProvider.digest(bytes.slice());
  return digestToHex(digest);
}

async function hashProjection(projection, hashProvider) {
  return digestBytes(canonicalizeJsonBytes(projection), hashProvider);
}

export async function hashOriginBytes(exactBytes, expectedByteLength, hashProvider) {
  const bytes = toExactBytes(exactBytes);
  if (!Number.isInteger(expectedByteLength) || expectedByteLength < 0) {
    fail("expectedByteLength must be a non-negative integer.", "invalid_expected_byte_length");
  }
  if (bytes.byteLength !== expectedByteLength) {
    fail(`Exact byte length mismatch: expected ${expectedByteLength}, received ${bytes.byteLength}.`, "origin_byte_length_mismatch");
  }
  return digestBytes(bytes, hashProvider);
}

export async function hashAuthorityRecord(authorityRecord, hashProvider) {
  return hashProjection(buildAuthorityHashProjection(authorityRecord), hashProvider);
}

export async function hashApprovalBinding(approvalInput, hashProvider) {
  return hashProjection(buildApprovalBindingProjection(approvalInput), hashProvider);
}

export async function hashDerivationScope(derivationInput, hashProvider) {
  return hashProjection(buildDerivationProjection(derivationInput), hashProvider);
}

export function createWebCryptoSha256Provider(cryptoObject = globalThis.crypto) {
  if (!cryptoObject || !cryptoObject.subtle || typeof cryptoObject.subtle.digest !== "function") {
    fail("Web Crypto SHA-256 is unavailable; inject a compatible hashProvider.", "web_crypto_unavailable");
  }
  return Object.freeze({
    async digest(bytes) {
      if (!(bytes instanceof Uint8Array)) {
        fail("Web Crypto hash provider requires Uint8Array input.", "invalid_digest_input");
      }
      const result = await cryptoObject.subtle.digest("SHA-256", bytes);
      return new Uint8Array(result);
    },
  });
}
