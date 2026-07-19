// ControlStack Lab — bounded sealed-reference identity and resolver-path contract.
// Pure, deterministic, browser-safe, and intentionally independent of storage or hosting.

export class ReferenceContractError extends Error {
  constructor(message, code = "invalid_reference_contract", details = null) {
    super(message);
    this.name = "ReferenceContractError";
    this.code = code;
    if (details !== null) this.details = deepFreeze(details);
  }
}

export const REFERENCE_IDENTITY_SCHEMA_ID = "controlstack.lab.reference-identity.v1";
export const REFERENCE_IDENTITY_SCHEMA_VERSION = 1;
export const EVIDENCE_CAPABILITY_SCHEMA_ID = "controlstack.lab.evidence-capability-summary.v1";
export const EVIDENCE_CAPABILITY_SCHEMA_VERSION = 1;
export const REFERENCE_KINDS = Object.freeze(["GT", "OPT", "MERGED"]);
export const RESOLVER_COMPONENT_KINDS = Object.freeze(["chip", "board", "driver", "converter"]);

const REFERENCE_DTO_SCHEMA_ID = "controlstack.lab.reference.1mm.v1";
const REFERENCE_DTO_SCHEMA_VERSION = 1;
const REFERENCE_ID_PATTERN = /^NVB-REF-(GT|OPT|MRG)-([0-9]{6})$/;
const SAFE_SEGMENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const EVIDENCE_TYPE_PATTERN = /^[A-Z0-9][A-Z0-9-]{0,63}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const EXACT_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const KIND_TO_PREFIX = Object.freeze({ GT: "GT", OPT: "OPT", MERGED: "MRG" });
const EVIDENCE_STATUSES = Object.freeze(["accepted", "rejected", "unresolved"]);
const CAPABILITY_REQUIREMENTS = Object.freeze([
  Object.freeze({ capabilityId: "general_optical_use_and_ies_scaling", requiredEvidenceTypes: Object.freeze(["LM-79"]) }),
  Object.freeze({ capabilityId: "rated_life_l70_b10", requiredEvidenceTypes: Object.freeze(["LM-80", "TM-21"]) }),
  Object.freeze({ capabilityId: "reference_optic_efficiency", requiredEvidenceTypes: Object.freeze(["LM-79"]) }),
  Object.freeze({
    capabilityId: "emergency_evidence_readiness",
    requiredEvidenceTypes: Object.freeze([
      "THERMAL",
      "POWER",
      "LM-80",
      "BATTERY-COLD",
      "BATTERY-HOT",
      "EMERGENCY-CONVERTER",
    ]),
  }),
]);

function fail(message, code, details = null) {
  throw new ReferenceContractError(message, code, details);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requirePlainObject(value, name) {
  if (!isPlainObject(value)) fail(`${name} must be a plain object.`, "plain_object_required");
  return value;
}

function requireExactKeys(value, allowedKeys, name) {
  const keys = Object.keys(value).sort();
  const expected = [...allowedKeys].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    fail(`${name} has unsupported or missing fields.`, "invalid_object_shape", { name, allowedKeys: expected });
  }
}

function requireSafeSegment(value, name) {
  if (typeof value !== "string" || value !== value.trim() || !SAFE_SEGMENT_PATTERN.test(value) || value === "." || value === "..") {
    fail(`${name} must be one safe opaque path segment.`, "invalid_resolver_segment", { name });
  }
  return value;
}

function requireExactUtc(value) {
  if (typeof value !== "string" || !EXACT_UTC_PATTERN.test(value)) {
    fail("sealedAtUtc must use exactly YYYY-MM-DDTHH:mm:ss.sssZ.", "invalid_sealed_at_utc");
  }
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    fail("sealedAtUtc must be a real UTC millisecond timestamp.", "invalid_sealed_at_utc");
  }
  return value;
}

function requireSha256(value, name) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${name} must be a lowercase raw 64-character SHA-256 value.`, "invalid_sha256", { name });
  }
  return value;
}

function identityFromParts(kind, serial) {
  if (!REFERENCE_KINDS.includes(kind)) {
    fail("Reference kind must be GT, OPT, or MERGED.", "invalid_reference_kind");
  }
  if (!Number.isInteger(serial) || serial < 1 || serial > 999999) {
    fail("Reference serial must be an integer from 1 to 999999.", "invalid_reference_serial");
  }
  const referenceId = `NVB-REF-${KIND_TO_PREFIX[kind]}-${String(serial).padStart(6, "0")}`;
  return { referenceId, kind, serial };
}

export function formatReferenceId(kind, serial) {
  return identityFromParts(kind, serial).referenceId;
}

export function parseReferenceId(value) {
  if (typeof value !== "string") return null;
  const match = REFERENCE_ID_PATTERN.exec(value);
  if (!match) return null;
  const serial = Number(match[2]);
  if (!Number.isInteger(serial) || serial < 1 || serial > 999999) return null;
  const kind = match[1] === "MRG" ? "MERGED" : match[1];
  return deepFreeze({ referenceId: value, kind, serial });
}

export function projectReferenceIdentity(referenceDto) {
  const dto = requirePlainObject(referenceDto, "referenceDto");
  if (dto.schemaId !== REFERENCE_DTO_SCHEMA_ID || dto.schemaVersion !== REFERENCE_DTO_SCHEMA_VERSION) {
    fail("referenceDto must use the supported sealed-reference schema and version.", "unsupported_reference_schema");
  }
  const parsed = parseReferenceId(dto.id);
  if (!parsed || parsed.kind !== dto.kind || parsed.serial !== dto.serial) {
    fail("referenceDto id, kind, and serial must agree exactly.", "reference_identity_mismatch");
  }
  const approval = requirePlainObject(dto.approval, "referenceDto.approval");
  if (approval.state !== "reference") {
    fail("referenceDto approval state must be reference.", "reference_not_approved");
  }
  const sealedAtUtc = requireExactUtc(dto.sealedAtUtc);
  const authorityRecordSha256 = requireSha256(dto.authorityRecordSha256, "authorityRecordSha256");
  const referenceSha256 = requireSha256(dto.referenceSha256, "referenceSha256");
  return deepFreeze({
    schemaId: REFERENCE_IDENTITY_SCHEMA_ID,
    schemaVersion: REFERENCE_IDENTITY_SCHEMA_VERSION,
    referenceId: parsed.referenceId,
    kind: parsed.kind,
    serial: parsed.serial,
    sealedAtUtc,
    authorityRecordSha256,
    referenceSha256,
    resolverPath: buildResolverPath({ kind: "reference", referenceId: parsed.referenceId }),
    readOnly: true,
  });
}

function descriptorForBuild(value) {
  const descriptor = requirePlainObject(value, "routeDescriptor");
  switch (descriptor.kind) {
    case "reference":
    case "provenance":
    case "originIes": {
      requireExactKeys(descriptor, ["kind", "referenceId"], "routeDescriptor");
      if (!parseReferenceId(descriptor.referenceId)) fail("routeDescriptor.referenceId is invalid.", "invalid_reference_id");
      return descriptor;
    }
    case "evidence": {
      requireExactKeys(descriptor, ["kind", "referenceId", "artifactName"], "routeDescriptor");
      if (!parseReferenceId(descriptor.referenceId)) fail("routeDescriptor.referenceId is invalid.", "invalid_reference_id");
      requireSafeSegment(descriptor.artifactName, "routeDescriptor.artifactName");
      return descriptor;
    }
    case "report": {
      requireExactKeys(descriptor, ["kind", "reportId"], "routeDescriptor");
      requireSafeSegment(descriptor.reportId, "routeDescriptor.reportId");
      return descriptor;
    }
    case "component": {
      requireExactKeys(descriptor, ["kind", "componentKind", "componentId"], "routeDescriptor");
      if (!RESOLVER_COMPONENT_KINDS.includes(descriptor.componentKind)) {
        fail("routeDescriptor.componentKind is unsupported.", "unsupported_component_kind");
      }
      requireSafeSegment(descriptor.componentId, "routeDescriptor.componentId");
      return descriptor;
    }
    case "source": {
      requireExactKeys(descriptor, ["kind", "sourceId"], "routeDescriptor");
      requireSafeSegment(descriptor.sourceId, "routeDescriptor.sourceId");
      return descriptor;
    }
    default:
      fail("routeDescriptor.kind is unsupported.", "unsupported_resolver_kind");
  }
}

export function buildResolverPath(routeDescriptor) {
  const descriptor = descriptorForBuild(routeDescriptor);
  switch (descriptor.kind) {
    case "reference": return `/r/${descriptor.referenceId}`;
    case "provenance": return `/p/${descriptor.referenceId}`;
    case "originIes": return `/r/${descriptor.referenceId}/origin.ies`;
    case "evidence": return `/r/${descriptor.referenceId}/evidence/${descriptor.artifactName}`;
    case "report": return `/reports/${descriptor.reportId}`;
    case "component": return `/c/${descriptor.componentKind}/${descriptor.componentId}`;
    case "source": return `/s/${descriptor.sourceId}`;
    default: fail("routeDescriptor.kind is unsupported.", "unsupported_resolver_kind");
  }
}

function isCanonicalPathInput(path) {
  return typeof path === "string"
    && path === path.trim()
    && path.startsWith("/")
    && !path.startsWith("//")
    && !/[\\?#\u0000-\u001f\u007f]/.test(path)
    && !/%(?:2f|5c|2e)/i.test(path)
    && !path.includes("%")
    && !path.includes("//");
}

export function parseResolverPath(path) {
  if (!isCanonicalPathInput(path)) return null;
  let match;
  let descriptor = null;
  if ((match = /^\/r\/(NVB-REF-(?:GT|OPT|MRG)-[0-9]{6})\/origin\.ies$/.exec(path))) {
    descriptor = { kind: "originIes", referenceId: match[1] };
  } else if ((match = /^\/r\/(NVB-REF-(?:GT|OPT|MRG)-[0-9]{6})\/evidence\/([^/]+)$/.exec(path))) {
    descriptor = { kind: "evidence", referenceId: match[1], artifactName: match[2] };
  } else if ((match = /^\/r\/(NVB-REF-(?:GT|OPT|MRG)-[0-9]{6})$/.exec(path))) {
    descriptor = { kind: "reference", referenceId: match[1] };
  } else if ((match = /^\/p\/(NVB-REF-(?:GT|OPT|MRG)-[0-9]{6})$/.exec(path))) {
    descriptor = { kind: "provenance", referenceId: match[1] };
  } else if ((match = /^\/reports\/([^/]+)$/.exec(path))) {
    descriptor = { kind: "report", reportId: match[1] };
  } else if ((match = /^\/c\/([^/]+)\/([^/]+)$/.exec(path))) {
    descriptor = { kind: "component", componentKind: match[1], componentId: match[2] };
  } else if ((match = /^\/s\/([^/]+)$/.exec(path))) {
    descriptor = { kind: "source", sourceId: match[1] };
  }
  if (!descriptor) return null;
  try {
    buildResolverPath(descriptor);
    return deepFreeze(descriptor);
  } catch (error) {
    if (error instanceof ReferenceContractError) return null;
    throw error;
  }
}

export function summariseEvidenceCapabilities(input) {
  const value = requirePlainObject(input, "input");
  requireExactKeys(value, ["referenceId", "entries"], "input");
  if (!parseReferenceId(value.referenceId)) fail("input.referenceId is invalid.", "invalid_reference_id");
  if (!Array.isArray(value.entries)) fail("input.entries must be an array.", "evidence_entries_required");

  const statusByType = new Map();
  for (const [index, entryValue] of value.entries.entries()) {
    const entry = requirePlainObject(entryValue, `input.entries[${index}]`);
    requireExactKeys(entry, ["evidenceType", "status"], `input.entries[${index}]`);
    if (typeof entry.evidenceType !== "string" || !EVIDENCE_TYPE_PATTERN.test(entry.evidenceType)) {
      fail(`input.entries[${index}].evidenceType is invalid.`, "invalid_evidence_type", { index });
    }
    if (!EVIDENCE_STATUSES.includes(entry.status)) {
      fail(`input.entries[${index}].status is invalid.`, "invalid_evidence_status", { index });
    }
    const prior = statusByType.get(entry.evidenceType);
    if (prior !== undefined && prior !== entry.status) {
      fail("Conflicting evidence statuses are not permitted.", "conflicting_evidence_status", { evidenceType: entry.evidenceType });
    }
    statusByType.set(entry.evidenceType, entry.status);
  }

  const accepted = new Set(
    [...statusByType.entries()]
      .filter(([, status]) => status === "accepted")
      .map(([evidenceType]) => evidenceType),
  );
  const capabilities = CAPABILITY_REQUIREMENTS.map(({ capabilityId, requiredEvidenceTypes }) => {
    const required = [...requiredEvidenceTypes];
    const missing = required.filter((evidenceType) => !accepted.has(evidenceType));
    return {
      capabilityId,
      state: missing.length === 0 ? "complete" : "incomplete",
      requiredEvidenceTypes: required,
      missingEvidenceTypes: missing,
    };
  });

  return deepFreeze({
    schemaId: EVIDENCE_CAPABILITY_SCHEMA_ID,
    schemaVersion: EVIDENCE_CAPABILITY_SCHEMA_VERSION,
    referenceId: value.referenceId,
    capabilities,
    assemblyVerification: { emergency: null, ewisCartridge: null },
    readOnly: true,
  });
}
