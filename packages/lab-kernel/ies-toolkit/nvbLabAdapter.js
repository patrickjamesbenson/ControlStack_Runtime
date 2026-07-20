// ControlStack Lab — immutable NVB resolution projection for Lab working state.
// Pure, deterministic, browser-safe, and intentionally independent of source loading or persistence.

import {
  NVB_RESOLUTION_SCHEMA_ID,
  NVB_RESOLUTION_SCHEMA_VERSION,
  NVB_TEST_PATHS,
} from "./nvbResolve.js";
import {
  REFERENCE_IDENTITY_SCHEMA_ID,
  REFERENCE_IDENTITY_SCHEMA_VERSION,
  parseReferenceId,
} from "./nvbReference.js";

export class NvbLabAdapterContractError extends Error {
  constructor(message, code = "invalid_nvb_lab_adapter_contract", details = null) {
    super(message);
    this.name = "NvbLabAdapterContractError";
    this.code = code;
    if (details !== null) this.details = deepFreeze(details);
  }
}

export const NVB_LAB_ADAPTER_SCHEMA_ID = "controlstack.lab.nvb-lab-projection.v2";
export const NVB_LAB_ADAPTER_SCHEMA_VERSION = 2;

const INPUT_KEYS = Object.freeze(["resolution", "references"]);
const REFERENCES_KEYS = Object.freeze(["gearTray", "optic"]);
const RESOLUTION_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "path",
  "family",
  "status",
  "optic",
  "governingThermals",
  "labForm",
  "blockers",
  "readOnly",
]);
const OPTIC_KEYS = Object.freeze([
  "opticBomId",
  "opticVariant",
  "specCode",
  "emissionPermission",
  "hotTestEvidenceRef",
  "opticalEfficiency",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
]);
const THERMAL_KEYS = Object.freeze([
  "systemLabel",
  "systemVariant",
  "metalAreaMm2",
  "airAreaMm2",
]);
const LAB_FORM_KEYS = Object.freeze(["iesFields", "checkFields"]);
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
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const EXACT_UTC_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
const BLOCKER_PATTERN = /^[a-z][a-z0-9_]{0,127}$/;

function fail(message, code, details = null) {
  throw new NvbLabAdapterContractError(message, code, details);
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
  if (!isPlainObject(value)) fail(`${name} must be a plain object.`, "plain_object_required", { name });
  return value;
}

function requireExactKeys(value, expectedKeys, name) {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(`${name} has unsupported or missing fields.`, "invalid_object_shape", { name, expectedKeys: expected });
  }
}

function requireNullableText(value, name) {
  if (value === null) return null;
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > 256
    || /[\u0000-\u001f\u007f]/.test(value)
  ) {
    fail(`${name} must be null or bounded non-empty text.`, "invalid_text_value", { name });
  }
  return value;
}

function requireNullableFiniteNumber(value, name) {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${name} must be null or a finite number.`, "invalid_numeric_value", { name });
  }
  return Object.is(value, -0) ? 0 : value;
}

function requireThermalNumber(value, name) {
  const numeric = requireNullableFiniteNumber(value, name);
  if (numeric === null) fail(`${name} is required.`, "thermal_triplet_missing", { name });
  return numeric;
}

function decimalInteger(value, name) {
  const text = String(requireThermalNumber(value, name));
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(text);
  if (!match) fail(`${name} has unsupported decimal form.`, "thermal_triplet_invalid", { name });
  const sign = match[1] === "-" ? -1n : 1n;
  const fraction = match[3] || "";
  const exponent = Number(match[4] || 0);
  const digits = `${match[2]}${fraction}`.replace(/^0+(?=\d)/, "");
  const shift = exponent - fraction.length;
  if (!Number.isSafeInteger(shift) || Math.abs(shift) > 1000) {
    fail(`${name} exceeds the supported decimal scale.`, "thermal_triplet_invalid", { name });
  }
  const magnitude = BigInt(digits || "0");
  return shift >= 0
    ? { integer: sign * magnitude * (10n ** BigInt(shift)), scale: 0 }
    : { integer: sign * magnitude, scale: -shift };
}

function requireThermalTriplet(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC, name) {
  const room = decimalInteger(referenceRoomTaC, `${name}.referenceRoomTaC`);
  const internal = decimalInteger(referenceInternalTaC, `${name}.referenceInternalTaC`);
  const rise = decimalInteger(opticThermalRiseTaC, `${name}.opticThermalRiseTaC`);
  const scale = Math.max(room.scale, internal.scale, rise.scale);
  const align = ({ integer, scale: valueScale }) => integer * (10n ** BigInt(scale - valueScale));
  if (align(room) + align(rise) !== align(internal)) {
    fail(
      `${name} must satisfy reference room plus rise equals absolute reference internal temperature.`,
      "thermal_triplet_mismatch",
      { referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC },
    );
  }
}

function clonePlainData(value, name = "value", seen = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(`${name} contains a non-finite number.`, "invalid_plain_data", { name });
    return value;
  }
  if (!value || typeof value !== "object") {
    fail(`${name} contains unsupported data.`, "invalid_plain_data", { name });
  }
  if (seen.has(value)) fail(`${name} must not contain cycles.`, "cyclic_plain_data", { name });
  seen.add(value);
  let output;
  if (Array.isArray(value)) {
    output = value.map((entry, index) => clonePlainData(entry, `${name}[${index}]`, seen));
  } else {
    if (!isPlainObject(value)) fail(`${name} must contain plain data only.`, "invalid_plain_data", { name });
    output = {};
    for (const [key, entry] of Object.entries(value)) {
      output[key] = clonePlainData(entry, `${name}.${key}`, seen);
    }
  }
  seen.delete(value);
  return output;
}

function requireExactUtc(value, name) {
  const match = typeof value === "string" ? EXACT_UTC_PATTERN.exec(value) : null;
  if (!match) {
    fail(`${name} must use exactly YYYY-MM-DDTHH:mm:ss.sssZ.`, "invalid_exact_utc", { name });
  }
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    year < 1
    || month < 1
    || month > 12
    || day < 1
    || day > daysInMonth[month - 1]
    || hour > 23
    || minute > 59
    || second > 59
  ) {
    fail(`${name} must be a real UTC millisecond timestamp.`, "invalid_exact_utc", { name });
  }
  return value;
}

function requireSha256(value, name) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${name} must be a lowercase raw 64-character SHA-256 value.`, "invalid_sha256", { name });
  }
  return value;
}

function projectOptic(value, name) {
  if (value === null) return null;
  const optic = requirePlainObject(value, name);
  requireExactKeys(optic, OPTIC_KEYS, name);
  const opticBomId = requireNullableText(optic.opticBomId, `${name}.opticBomId`);
  if (opticBomId === null) fail(`${name}.opticBomId is required.`, "missing_optic_bom_id");
  const referenceRoomTaC = requireThermalNumber(optic.referenceRoomTaC, `${name}.referenceRoomTaC`);
  const referenceInternalTaC = requireThermalNumber(optic.referenceInternalTaC, `${name}.referenceInternalTaC`);
  const opticThermalRiseTaC = requireThermalNumber(optic.opticThermalRiseTaC, `${name}.opticThermalRiseTaC`);
  requireThermalTriplet(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC, name);
  return {
    opticBomId,
    opticVariant: requireNullableText(optic.opticVariant, `${name}.opticVariant`),
    specCode: requireNullableText(optic.specCode, `${name}.specCode`),
    emissionPermission: requireNullableText(optic.emissionPermission, `${name}.emissionPermission`),
    hotTestEvidenceRef: requireNullableText(optic.hotTestEvidenceRef, `${name}.hotTestEvidenceRef`),
    opticalEfficiency: requireNullableFiniteNumber(optic.opticalEfficiency, `${name}.opticalEfficiency`),
    referenceRoomTaC,
    referenceInternalTaC,
    opticThermalRiseTaC,
  };
}

function projectGoverningThermals(value, name) {
  if (value === null) return null;
  const thermals = requirePlainObject(value, name);
  requireExactKeys(thermals, THERMAL_KEYS, name);
  const systemLabel = requireNullableText(thermals.systemLabel, `${name}.systemLabel`);
  if (systemLabel === null) fail(`${name}.systemLabel is required.`, "missing_thermal_label");
  return {
    systemLabel,
    systemVariant: requireNullableText(thermals.systemVariant, `${name}.systemVariant`),
    metalAreaMm2: requireNullableFiniteNumber(thermals.metalAreaMm2, `${name}.metalAreaMm2`),
    airAreaMm2: requireNullableFiniteNumber(thermals.airAreaMm2, `${name}.airAreaMm2`),
  };
}

function validateLabForm(value, name) {
  const labForm = requirePlainObject(value, name);
  requireExactKeys(labForm, LAB_FORM_KEYS, name);
  if (!Array.isArray(labForm.iesFields) || !Array.isArray(labForm.checkFields)) {
    fail(`${name} fields must be arrays.`, "invalid_lab_form_profile");
  }
  clonePlainData(labForm.iesFields, `${name}.iesFields`);
  clonePlainData(labForm.checkFields, `${name}.checkFields`);
}

function projectBlockers(value, name) {
  if (!Array.isArray(value)) fail(`${name} must be an array.`, "invalid_blockers");
  const seen = new Set();
  return value.map((entry, index) => {
    if (typeof entry !== "string" || !BLOCKER_PATTERN.test(entry)) {
      fail(`${name}[${index}] must be a canonical blocker code.`, "invalid_blocker_code", { index });
    }
    if (seen.has(entry)) fail(`${name} must not contain duplicate blocker codes.`, "duplicate_blocker_code", { entry });
    seen.add(entry);
    return entry;
  });
}

function projectResolution(value) {
  const resolution = requirePlainObject(value, "input.resolution");
  requireExactKeys(resolution, RESOLUTION_KEYS, "input.resolution");
  if (resolution.schemaId !== NVB_RESOLUTION_SCHEMA_ID || resolution.schemaVersion !== NVB_RESOLUTION_SCHEMA_VERSION) {
    fail("input.resolution must use the supported LAB-018 schema and version.", "unsupported_resolution_schema");
  }
  if (resolution.path !== null && !NVB_TEST_PATHS.includes(resolution.path)) {
    fail("input.resolution.path is unsupported.", "invalid_resolution_path");
  }
  if (resolution.family !== null && (!Number.isSafeInteger(resolution.family) || resolution.family < 1)) {
    fail("input.resolution.family must be null or a positive safe integer.", "invalid_resolution_family");
  }
  if (resolution.status !== "resolved" && resolution.status !== "unresolved") {
    fail("input.resolution.status is unsupported.", "invalid_resolution_status");
  }
  if (resolution.readOnly !== true) fail("input.resolution.readOnly must be true.", "invalid_read_only_marker");

  const optic = projectOptic(resolution.optic, "input.resolution.optic");
  const governingThermals = projectGoverningThermals(
    resolution.governingThermals,
    "input.resolution.governingThermals",
  );
  validateLabForm(resolution.labForm, "input.resolution.labForm");
  const blockers = projectBlockers(resolution.blockers, "input.resolution.blockers");

  if (resolution.status === "resolved" && (resolution.path === null || resolution.family === null || blockers.length !== 0)) {
    fail("A resolved LAB-018 result requires path, family, and no blockers.", "inconsistent_resolution_status");
  }
  if (resolution.status === "unresolved" && blockers.length === 0) {
    fail("An unresolved LAB-018 result must preserve at least one blocker.", "inconsistent_resolution_status");
  }
  if (resolution.path === "optic" && resolution.status === "resolved" && optic === null) {
    fail("A resolved optic path requires an optic projection.", "missing_resolved_optic");
  }
  if (resolution.path !== "optic" && optic !== null) {
    fail("Only the optic path may contain an optic projection.", "unexpected_optic_projection");
  }

  return {
    path: resolution.path,
    family: resolution.family,
    optic,
    governingThermals,
    blockers,
  };
}

function projectReference(value, expectedKind, name) {
  if (value === null) return null;
  const reference = requirePlainObject(value, name);
  requireExactKeys(reference, REFERENCE_KEYS, name);
  if (
    reference.schemaId !== REFERENCE_IDENTITY_SCHEMA_ID
    || reference.schemaVersion !== REFERENCE_IDENTITY_SCHEMA_VERSION
  ) {
    fail(`${name} must use the supported LAB-017 identity schema and version.`, "unsupported_reference_projection");
  }
  const parsed = parseReferenceId(reference.referenceId);
  if (!parsed || parsed.kind !== reference.kind || parsed.serial !== reference.serial) {
    fail(`${name} identity fields must agree exactly.`, "reference_identity_mismatch", { name });
  }
  if (reference.kind !== expectedKind) {
    fail(`${name} must contain a ${expectedKind} reference projection.`, "reference_kind_mismatch", { name });
  }
  requireExactUtc(reference.sealedAtUtc, `${name}.sealedAtUtc`);
  requireSha256(reference.authorityRecordSha256, `${name}.authorityRecordSha256`);
  requireSha256(reference.referenceSha256, `${name}.referenceSha256`);
  if (reference.resolverPath !== `/r/${reference.referenceId}`) {
    fail(`${name}.resolverPath must match its canonical reference identity.`, "reference_resolver_path_mismatch", { name });
  }
  if (reference.readOnly !== true) fail(`${name}.readOnly must be true.`, "invalid_read_only_marker", { name });
  return {
    schemaId: reference.schemaId,
    schemaVersion: reference.schemaVersion,
    referenceId: reference.referenceId,
    kind: reference.kind,
    serial: reference.serial,
    sealedAtUtc: reference.sealedAtUtc,
    authorityRecordSha256: reference.authorityRecordSha256,
    referenceSha256: reference.referenceSha256,
    resolverPath: reference.resolverPath,
    readOnly: true,
  };
}

function appendUnresolved(unresolved, code) {
  if (!unresolved.includes(code)) unresolved.push(code);
}

function projectThermalEvidence(resolution, opticReference, unresolved) {
  if (resolution.path !== "optic" || resolution.optic === null) return null;
  const optic = resolution.optic;
  if (opticReference === null) appendUnresolved(unresolved, "thermal_evidence_reference_unbound");
  if (optic.hotTestEvidenceRef === null) appendUnresolved(unresolved, "thermal_evidence_source_unresolved");
  return {
    opticBomId: optic.opticBomId,
    referenceRoomTaC: optic.referenceRoomTaC,
    referenceInternalTaC: optic.referenceInternalTaC,
    opticThermalRiseTaC: optic.opticThermalRiseTaC,
    evidenceRef: optic.hotTestEvidenceRef,
    authorityState: null,
  };
}

export function adaptNvbResolution(inputValue) {
  const input = requirePlainObject(inputValue, "input");
  requireExactKeys(input, INPUT_KEYS, "input");
  const resolution = projectResolution(input.resolution);
  const references = requirePlainObject(input.references, "input.references");
  requireExactKeys(references, REFERENCES_KEYS, "input.references");
  const gearTray = projectReference(references.gearTray, "GT", "input.references.gearTray");
  const optic = projectReference(references.optic, "OPT", "input.references.optic");
  const unresolved = [...resolution.blockers];
  const thermalEvidence = projectThermalEvidence(resolution, optic, unresolved);

  return deepFreeze({
    schemaId: NVB_LAB_ADAPTER_SCHEMA_ID,
    schemaVersion: NVB_LAB_ADAPTER_SCHEMA_VERSION,
    path: resolution.path,
    family: resolution.family,
    selection: {
      opticBomId: resolution.optic?.opticBomId ?? null,
      opticVariant: resolution.optic?.opticVariant ?? null,
      specCode: resolution.optic?.specCode ?? null,
      emissionPermission: resolution.optic?.emissionPermission ?? null,
    },
    governingThermals: resolution.governingThermals,
    references: { gearTray, optic },
    thermalEvidence,
    unresolved,
    assemblyVerification: {
      emergency: null,
      ewisCartridge: null,
    },
    readOnly: true,
  });
}
