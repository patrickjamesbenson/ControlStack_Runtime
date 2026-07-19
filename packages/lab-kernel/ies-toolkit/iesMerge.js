// ControlStack Lab — governed two-parent reference composition candidate.
// Pure, deterministic, browser-safe, and intentionally outside allocation, approval, and sealing.

import { projectReferenceIdentity } from "./nvbReference.js";

export class ReferenceCompositionContractError extends Error {
  constructor(message, code = "invalid_reference_composition_contract", details = null) {
    super(message);
    this.name = "ReferenceCompositionContractError";
    this.code = code;
    if (details !== null) this.details = deepFreeze(details);
  }
}

export const REFERENCE_COMPOSITION_SCHEMA_ID = "controlstack.lab.reference-composition-candidate.v1";
export const REFERENCE_COMPOSITION_SCHEMA_VERSION = 1;

const INPUT_KEYS = Object.freeze(["parents", "geometryRegistration", "operatingState"]);
const PARENT_KEYS = Object.freeze(["reference", "role", "ownedWallPowerW"]);
const REFERENCE_DTO_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "kind",
  "id",
  "serial",
  "sealedAtUtc",
  "authorityRecordSha256",
  "originSha256",
  "derivationSha256",
  "approval",
  "keywordProfile",
  "metadata",
  "angles",
  "candela",
  "baseline",
  "provenanceRefs",
  "referenceSha256",
]);
const APPROVAL_KEYS = Object.freeze(["state", "approvedAtUtc", "approvalFingerprint"]);
const ANGLE_KEYS = Object.freeze(["v_angles", "h_angles"]);
const BASELINE_KEYS = Object.freeze([
  "cct",
  "cri",
  "internalAmbientTaC",
  "fluxPerMm",
  "wallWattsPerMm",
  "circuitWattsPerMm",
]);
const METADATA_KEYS = Object.freeze(Array.from({ length: 13 }, (_, index) => `G${index}`));
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const EXACT_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const G11_LEXICAL_PATTERN = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?$/;
const ROLE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._:/-]{0,127}$/;
const SUPPORTED_PARENT_KINDS = Object.freeze(["GT", "OPT"]);

// These assembly-owned keyword values are deliberately not inherited by the candidate.
// The canonical ambient spelling remains explicit for the cross-cutting migration guard.
const ASSEMBLY_KEYWORD_RESETS = Object.freeze({
  LUMCAT: null,
  LUMINAIRE: null,
  _INTERNAL_AMBIENT_TA_C: null,
  _EMERGENCY_VERIFIED: null,
  _EWIS_CARTRIDGE_VERIFIED: null,
});

const UNRESOLVED_ASSEMBLY_FIELDS = Object.freeze([
  "assembly_identity",
  "lumcat",
  "luminaire",
  "internal_ambient_ta_c",
  "emergency_verification",
  "ewis_cartridge_verification",
  "shared_overhead_w",
]);

function fail(message, code, details = null) {
  throw new ReferenceCompositionContractError(message, code, details);
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

function requireFiniteNumber(value, name, { nonNegative = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value) || (nonNegative && value < 0)) {
    fail(`${name} must be ${nonNegative ? "a finite non-negative" : "a finite"} number.`, "invalid_numeric_value", { name });
  }
  return value;
}

function requireNullableFiniteNumber(value, name) {
  if (value === null) return null;
  return requireFiniteNumber(value, name);
}

function requireSha256(value, name) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${name} must be a lowercase raw 64-character SHA-256 value.`, "invalid_sha256", { name });
  }
  return value;
}

function requireExactUtc(value, name) {
  if (typeof value !== "string" || !EXACT_UTC_PATTERN.test(value)) {
    fail(`${name} must use exactly YYYY-MM-DDTHH:mm:ss.sssZ.`, "invalid_exact_utc", { name });
  }
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    fail(`${name} must be a real UTC millisecond timestamp.`, "invalid_exact_utc", { name });
  }
  return value;
}

function requireRole(value, name) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || !ROLE_PATTERN.test(value)
    || /[\u0000-\u001f\u007f]/.test(value)
  ) {
    fail(`${name} must be bounded non-empty role text.`, "invalid_parent_role", { name });
  }
  return value;
}

function requireIncreasingAngles(value, name, maximum) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${name} must be a non-empty array.`, "invalid_angle_grid", { name });
  }
  const output = value.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isFinite(entry) || entry < 0 || entry > maximum) {
      fail(`${name}[${index}] is outside the supported range.`, "invalid_angle_value", { name, index });
    }
    return entry;
  });
  for (let index = 1; index < output.length; index += 1) {
    if (!(output[index] > output[index - 1])) {
      fail(`${name} must be strictly increasing.`, "angles_not_increasing", { name });
    }
  }
  return output;
}

function requireMetadata(value, name) {
  const metadata = requirePlainObject(value, name);
  requireExactKeys(metadata, METADATA_KEYS, name);
  const output = {};
  for (const key of METADATA_KEYS) {
    if (key === "G11") {
      const lexical = metadata.G11;
      if (
        typeof lexical !== "string"
        || lexical !== lexical.trim()
        || !G11_LEXICAL_PATTERN.test(lexical)
        || !Number.isFinite(Number(lexical))
      ) {
        fail(`${name}.G11 must be a validated lexical finite number string.`, "invalid_g11_lexical");
      }
      output.G11 = lexical;
    } else {
      output[key] = requireFiniteNumber(metadata[key], `${name}.${key}`, { nonNegative: true });
    }
  }
  if (!Number.isInteger(output.G3) || output.G3 < 1 || !Number.isInteger(output.G4) || output.G4 < 1) {
    fail(`${name}.G3 and G4 must be positive integers.`, "invalid_angle_counts");
  }
  if (output.G8 !== 0.001) {
    fail(`${name}.G8 must equal the one-millimetre basis 0.001.`, "invalid_one_mm_basis");
  }
  return output;
}

function requireBaseline(value, metadata, name) {
  const baseline = requirePlainObject(value, name);
  requireExactKeys(baseline, BASELINE_KEYS, name);
  const output = {
    cct: requireNullableFiniteNumber(baseline.cct, `${name}.cct`),
    cri: requireNullableFiniteNumber(baseline.cri, `${name}.cri`),
    internalAmbientTaC: requireNullableFiniteNumber(baseline.internalAmbientTaC, `${name}.internalAmbientTaC`),
    fluxPerMm: requireNullableFiniteNumber(baseline.fluxPerMm, `${name}.fluxPerMm`),
    wallWattsPerMm: requireNullableFiniteNumber(baseline.wallWattsPerMm, `${name}.wallWattsPerMm`),
    circuitWattsPerMm: requireNullableFiniteNumber(baseline.circuitWattsPerMm, `${name}.circuitWattsPerMm`),
  };
  if (!Object.is(output.wallWattsPerMm, metadata.G12)) {
    fail(`${name}.wallWattsPerMm must exactly equal metadata.G12.`, "baseline_power_mismatch");
  }
  return output;
}

function requirePhotometry(reference, metadata, name) {
  const angles = requirePlainObject(reference.angles, `${name}.angles`);
  requireExactKeys(angles, ANGLE_KEYS, `${name}.angles`);
  const vAngles = requireIncreasingAngles(angles.v_angles, `${name}.angles.v_angles`, 180);
  const hAngles = requireIncreasingAngles(angles.h_angles, `${name}.angles.h_angles`, 360);
  if (metadata.G3 !== vAngles.length || metadata.G4 !== hAngles.length) {
    fail(`${name} metadata angle counts must match its angle arrays.`, "angle_count_mismatch");
  }
  if (!Array.isArray(reference.candela) || reference.candela.length !== hAngles.length) {
    fail(`${name}.candela row count must equal the horizontal angle count.`, "candela_row_count_mismatch");
  }
  const candela = reference.candela.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== vAngles.length) {
      fail(`${name}.candela[${rowIndex}] length must equal the vertical angle count.`, "candela_column_count_mismatch");
    }
    return row.map((entry, columnIndex) => requireFiniteNumber(
      entry,
      `${name}.candela[${rowIndex}][${columnIndex}]`,
      { nonNegative: true },
    ));
  });
  return { vAngles, hAngles, candela };
}

function requireSealedReference(value, name) {
  const reference = requirePlainObject(value, name);
  requireExactKeys(reference, REFERENCE_DTO_KEYS, name);
  const approval = requirePlainObject(reference.approval, `${name}.approval`);
  requireExactKeys(approval, APPROVAL_KEYS, `${name}.approval`);
  if (approval.state !== "reference") {
    fail(`${name}.approval.state must be reference.`, "reference_not_approved");
  }
  requireExactUtc(approval.approvedAtUtc, `${name}.approval.approvedAtUtc`);
  requireSha256(approval.approvalFingerprint, `${name}.approval.approvalFingerprint`);
  requirePlainObject(reference.keywordProfile, `${name}.keywordProfile`);
  requirePlainObject(reference.provenanceRefs, `${name}.provenanceRefs`);

  let identity;
  try {
    identity = projectReferenceIdentity(reference);
  } catch (error) {
    fail(`${name} is not a valid sealed reference identity.`, "invalid_parent_reference", { name });
  }
  if (!SUPPORTED_PARENT_KINDS.includes(identity.kind)) {
    fail(`${name} must be a direct GT or OPT reference; MERGED parents are not supported.`, "unsupported_parent_kind", { kind: identity.kind });
  }
  requireSha256(reference.originSha256, `${name}.originSha256`);
  if (reference.derivationSha256 !== null) {
    fail(`${name}.derivationSha256 must be null for a direct GT or OPT parent.`, "unexpected_parent_derivation");
  }

  const metadata = requireMetadata(reference.metadata, `${name}.metadata`);
  const photometry = requirePhotometry(reference, metadata, name);
  requireBaseline(reference.baseline, metadata, `${name}.baseline`);
  return { identity, metadata, photometry };
}

function sameArray(left, right) {
  return left.length === right.length && left.every((entry, index) => Object.is(entry, right[index]));
}

function requireCoincidentCompatibility(left, right) {
  if (left.metadata.G5 !== right.metadata.G5) {
    fail("Parent photometric types (G5) must match exactly.", "photometric_type_mismatch");
  }
  if (left.metadata.G6 !== right.metadata.G6) {
    fail("Parent units (G6) must match exactly.", "units_mismatch");
  }
  for (const key of ["G7", "G8", "G9"]) {
    if (!Object.is(left.metadata[key], right.metadata[key])) {
      fail(`Parent dimensions (${key}) must match exactly.`, "dimension_mismatch", { key });
    }
  }
  if (!sameArray(left.photometry.vAngles, right.photometry.vAngles)
    || !sameArray(left.photometry.hAngles, right.photometry.hAngles)) {
    fail("Parent photometric angle grids must match exactly; interpolation and resampling are not permitted.", "photometric_grid_mismatch");
  }
}

function addExactFinite(left, right, name) {
  const total = left + right;
  if (!Number.isFinite(total) || total < 0) {
    fail(`${name} sum must remain finite and non-negative.`, "numeric_sum_out_of_range", { name });
  }
  return total;
}

export function composeReferencePair(inputValue) {
  const input = requirePlainObject(inputValue, "input");
  requireExactKeys(input, INPUT_KEYS, "input");
  if (input.geometryRegistration !== "coincident-aligned") {
    fail("geometryRegistration must be coincident-aligned.", "unsupported_geometry_registration");
  }
  if (input.operatingState !== "all-contributing-channels-on") {
    fail("operatingState must be all-contributing-channels-on.", "unsupported_operating_state");
  }
  if (!Array.isArray(input.parents) || input.parents.length !== 2) {
    fail("Exactly two direct parents are required.", "exactly_two_parents_required");
  }

  const parents = input.parents.map((parentValue, index) => {
    const parent = requirePlainObject(parentValue, `input.parents[${index}]`);
    requireExactKeys(parent, PARENT_KEYS, `input.parents[${index}]`);
    const role = requireRole(parent.role, `input.parents[${index}].role`);
    const ownedWallPowerW = requireFiniteNumber(
      parent.ownedWallPowerW,
      `input.parents[${index}].ownedWallPowerW`,
      { nonNegative: true },
    );
    const sealed = requireSealedReference(parent.reference, `input.parents[${index}].reference`);
    if (!Object.is(ownedWallPowerW, sealed.metadata.G12)) {
      fail(
        `input.parents[${index}].ownedWallPowerW must exactly equal the sealed reference G12 value.`,
        "owned_power_mismatch",
        { index },
      );
    }
    return { role, ownedWallPowerW, ...sealed };
  });

  if (parents[0].identity.referenceId === parents[1].identity.referenceId) {
    fail("Duplicate parent reference IDs are not permitted.", "duplicate_parent_reference");
  }
  requireCoincidentCompatibility(parents[0], parents[1]);

  const candela = parents[0].photometry.candela.map((row, rowIndex) => row.map((entry, columnIndex) => (
    addExactFinite(entry, parents[1].photometry.candela[rowIndex][columnIndex], `candela[${rowIndex}][${columnIndex}]`)
  )));
  const parentWallPowerW = [parents[0].ownedWallPowerW, parents[1].ownedWallPowerW];
  const totalWallPowerW = addExactFinite(parentWallPowerW[0], parentWallPowerW[1], "totalWallPowerW");

  // Touch the reset inventory so it remains a checked production boundary rather than dead documentation.
  if (Object.values(ASSEMBLY_KEYWORD_RESETS).some((value) => value !== null)) {
    fail("Assembly keyword resets must remain unresolved.", "assembly_keyword_reset_drift");
  }

  return deepFreeze({
    schemaId: REFERENCE_COMPOSITION_SCHEMA_ID,
    schemaVersion: REFERENCE_COMPOSITION_SCHEMA_VERSION,
    kind: "MERGED_CANDIDATE",
    parents: parents.map((parent, index) => ({
      ordinal: index + 1,
      referenceId: parent.identity.referenceId,
      referenceSha256: parent.identity.referenceSha256,
      kind: parent.identity.kind,
      role: parent.role,
      ownedWallPowerW: parent.ownedWallPowerW,
    })),
    geometryRegistration: "coincident-aligned",
    operatingState: "all-contributing-channels-on",
    photometry: {
      vAngles: [...parents[0].photometry.vAngles],
      hAngles: [...parents[0].photometry.hAngles],
      candela,
    },
    ownedPower: {
      parentWallPowerW,
      totalWallPowerW,
      sharedOverheadW: null,
    },
    unresolvedAssemblyFields: [...UNRESOLVED_ASSEMBLY_FIELDS],
    authorityState: "candidate",
    readOnly: true,
  });
}
