// iesFromReference.js — deterministic LM-63 materialisation from a sealed 1 mm reference DTO.
// Pure and browser-safe: validates the fixed sealed-reference boundary, clones all working data,
// delegates scaling/metrics/writing to committed Lab foundations, and returns text without persistence.
import { scaleToLengthM } from "./iesOneMm.js";
import { computeMetrics } from "./iesMetrics.js";
import { writeIes } from "./iesWrite.js";
import {
  CANONICAL_KEYWORD_DEFINITIONS,
  CANONICAL_KEYWORDS,
  KEYWORD_PROFILE_ID,
  normalizeKeywordName,
} from "./iesKeywordContract.js";
import {
  REFERENCE_DTO_SCHEMA_ID,
  REFERENCE_DTO_SCHEMA_VERSION,
} from "./iesReferenceDto.js";
import { isOpaqueArtifactReference } from "./iesAuthorityFingerprint.js";

export const IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_ID =
  "controlstack.lab.ies-reference-generation-inspection.v1";
export const IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_VERSION = 1;
export const IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_ID =
  "controlstack.lab.ies-reference-generation-inspection-audit.v1";
export const IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_VERSION = 1;
export const IES_REFERENCE_GENERATION_INSPECTION_STATES = Object.freeze({
  readyReadOnly: "ready_read_only",
  blockedFailClosed: "blocked_fail_closed",
});

const EXACT_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const G_FIELDS = Object.freeze(Array.from({ length: 13 }, (_, index) => `G${index}`));
const REFERENCE_FIELDS = Object.freeze([
  "schemaId", "schemaVersion", "kind", "id", "serial", "sealedAtUtc",
  "authorityRecordSha256", "originSha256", "derivationSha256", "approval",
  "keywordProfile", "metadata", "angles", "candela", "baseline", "provenanceRefs",
  "referenceSha256",
]);
const JOB_FIELDS = Object.freeze(["runLengthMm", "outputMultiplier", "selections"]);
const SELECTION_FIELDS = Object.freeze([
  "lumcat", "luminaire", "lamp", "cri", "cct", "driver", "driverSetting",
]);
const KEYWORD_OVERRIDE_RULES = Object.freeze([
  Object.freeze({ field: "lumcat", keyword: "LUMCAT", baseline: null }),
  Object.freeze({ field: "luminaire", keyword: "LUMINAIRE", baseline: null }),
  Object.freeze({ field: "lamp", keyword: "LAMP", baseline: null }),
  Object.freeze({ field: "cri", keyword: "_CRI", baseline: "cri" }),
  Object.freeze({ field: "cct", keyword: "_COLORTEMP", baseline: "cct" }),
  Object.freeze({ field: "driver", keyword: "_DRIVER", baseline: null }),
  Object.freeze({ field: "driverSetting", keyword: "_DRIVER_SETTING", baseline: null }),
]);
const PRIVATE_PATH = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|(?:^|[\\/])\.\.(?:[\\/]|$))/i;

class IesFromReferenceError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "IesFromReferenceError";
    this.code = code;
  }
}

function fail(message, code) {
  throw new IesFromReferenceError(message, code);
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

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function validatePrivateProvenance(value, path = "reference.provenanceRefs") {
  if (value == null) return;
  if (typeof value === "string") {
    if (PRIVATE_PATH.test(value)) {
      fail(`${path} contains a private or local path.`, "private_provenance_path_rejected");
    }
    if (path.endsWith("artifactRef") && !isOpaqueArtifactReference(value)) {
      fail(`${path} must be an opaque artifact reference.`, "invalid_provenance_artifact_reference");
    }
    return;
  }
  if (typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validatePrivateProvenance(entry, `${path}[${index}]`));
    return;
  }
  requirePlainObject(value, path);
  for (const [key, child] of Object.entries(value)) {
    validatePrivateProvenance(child, `${path}.${key}`);
  }
}

function requireExactFields(value, expected, name) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((entry, index) => entry !== wanted[index])) {
    fail(`${name} does not match its fixed field contract.`, "invalid_fixed_shape");
  }
}

function requireSha(value, name) {
  if (typeof value !== "string" || !SHA256_HEX.test(value)) {
    fail(`${name} must be a lower-case 64-character SHA-256 value.`, "invalid_sha256");
  }
  return value;
}

function requireExactUtc(value, name) {
  if (typeof value !== "string" || !EXACT_UTC.test(value)) {
    fail(`${name} must use exactly YYYY-MM-DDTHH:mm:ss.sssZ.`, "invalid_utc");
  }
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    fail(`${name} must be a real UTC millisecond timestamp.`, "invalid_utc");
  }
  return value;
}

function finiteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${name} must be a finite number.`, "invalid_number");
  }
  return value;
}

function optionalFiniteNumber(value, name) {
  if (value == null) return null;
  return finiteNumber(value, name);
}

function positiveNumberFromInput(value, name, { integer = false } = {}) {
  if (typeof value === "boolean" || value == null || (typeof value === "string" && value.trim() === "")) {
    fail(`${name} must be supplied as a positive${integer ? " integer" : ""} number.`, "invalid_positive_number");
  }
  const number = Number(value);
  if (!Number.isFinite(number) || !(number > 0) || (integer && !Number.isInteger(number))) {
    fail(`${name} must be a positive${integer ? " integer" : ""} number.`, "invalid_positive_number");
  }
  return number;
}

function keywordText(value, name, { nullable = false } = {}) {
  if (value == null) {
    if (nullable) return null;
    fail(`${name} must be present.`, "missing_keyword_value");
  }
  if (typeof value === "boolean" || typeof value === "object" || typeof value === "function") {
    fail(`${name} must be a scalar keyword value.`, "invalid_keyword_value");
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    fail(`${name} must be finite.`, "invalid_keyword_value");
  }
  const text = String(value).trim();
  if (!text) {
    if (nullable) return null;
    fail(`${name} must not be empty.`, "missing_keyword_value");
  }
  if (/\r|\n/.test(text)) {
    fail(`${name} must be a single-line value.`, "invalid_keyword_value");
  }
  return text;
}

function requireIncreasingAngles(value, name, maximum) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${name} must be a non-empty array.`, "invalid_angles");
  }
  const result = value.map((entry, index) => {
    const number = finiteNumber(entry, `${name}[${index}]`);
    if (number < 0 || number > maximum) {
      fail(`${name}[${index}] is outside the supported LM-63 range.`, "invalid_angles");
    }
    return number;
  });
  for (let index = 1; index < result.length; index += 1) {
    if (!(result[index] > result[index - 1])) {
      fail(`${name} must be strictly increasing.`, "invalid_angles");
    }
  }
  return result;
}

function validateReference(reference) {
  const rec = requirePlainObject(reference, "reference");
  requireExactFields(rec, REFERENCE_FIELDS, "reference");

  if (rec.schemaId !== REFERENCE_DTO_SCHEMA_ID || rec.schemaVersion !== REFERENCE_DTO_SCHEMA_VERSION) {
    fail(`reference must use ${REFERENCE_DTO_SCHEMA_ID} schema version ${REFERENCE_DTO_SCHEMA_VERSION}.`, "invalid_reference_schema");
  }
  if (!Number.isInteger(rec.serial) || rec.serial < 1 || rec.serial > 999999) {
    fail("reference.serial must be a positive six-digit allocation integer.", "invalid_reference_identity");
  }
  if (!["GT", "OPT", "MERGED"].includes(rec.kind)) {
    fail("reference.kind must be GT, OPT, or MERGED.", "invalid_reference_identity");
  }
  const identityPrefix = rec.kind === "MERGED" ? "MRG" : rec.kind;
  const expectedId = `NVB-REF-${identityPrefix}-${String(rec.serial).padStart(6, "0")}`;
  if (rec.id !== expectedId) {
    fail(`reference.id must exactly equal ${expectedId}.`, "invalid_reference_identity");
  }
  requireExactUtc(rec.sealedAtUtc, "reference.sealedAtUtc");
  requireSha(rec.authorityRecordSha256, "reference.authorityRecordSha256");
  requireSha(rec.referenceSha256, "reference.referenceSha256");
  if (rec.kind === "MERGED") {
    if (rec.originSha256 !== null) fail("MERGED reference.originSha256 must be null.", "invalid_reference_hash_state");
    requireSha(rec.derivationSha256, "reference.derivationSha256");
  } else {
    requireSha(rec.originSha256, "reference.originSha256");
    if (rec.derivationSha256 !== null) fail("GT/OPT reference.derivationSha256 must be null.", "invalid_reference_hash_state");
  }

  const approval = requirePlainObject(rec.approval, "reference.approval");
  requireExactFields(approval, ["state", "approvedAtUtc", "approvalFingerprint"], "reference.approval");
  if (approval.state !== "reference") {
    fail("reference.approval.state must be reference.", "reference_not_approved");
  }
  requireExactUtc(approval.approvedAtUtc, "reference.approval.approvedAtUtc");
  requireSha(approval.approvalFingerprint, "reference.approval.approvalFingerprint");

  const profile = requirePlainObject(rec.keywordProfile, "reference.keywordProfile");
  requireExactFields(profile, ["profileId", "values"], "reference.keywordProfile");
  if (profile.profileId !== KEYWORD_PROFILE_ID || !Array.isArray(profile.values)) {
    fail(`reference.keywordProfile must use ${KEYWORD_PROFILE_ID}.`, "invalid_keyword_profile");
  }
  if (profile.values.length !== CANONICAL_KEYWORD_DEFINITIONS.length) {
    fail("reference.keywordProfile must contain the complete canonical keyword profile.", "invalid_keyword_profile");
  }
  const keywordValues = new Map();
  for (let index = 0; index < CANONICAL_KEYWORD_DEFINITIONS.length; index += 1) {
    const definition = CANONICAL_KEYWORD_DEFINITIONS[index];
    const row = requirePlainObject(profile.values[index], `reference.keywordProfile.values[${index}]`);
    requireExactFields(row, ["key", "value", "owner"], `reference.keywordProfile.values[${index}]`);
    if (normalizeKeywordName(row.key) !== definition.key || row.owner !== definition.owner) {
      fail(`reference keyword position ${index + 1} must be ${definition.key} owned by ${definition.owner}.`, "invalid_keyword_profile");
    }
    keywordValues.set(definition.key, keywordText(row.value, `reference keyword ${definition.key}`, { nullable: true }));
  }

  const metadata = requirePlainObject(rec.metadata, "reference.metadata");
  requireExactFields(metadata, G_FIELDS, "reference.metadata");
  const geometry = {};
  for (const field of G_FIELDS) {
    if (field === "G11") {
      if (typeof metadata.G11 !== "string" || metadata.G11 !== metadata.G11.trim() || !Number.isFinite(Number(metadata.G11))) {
        fail("reference.metadata.G11 must be a finite lexical number string.", "invalid_geometry");
      }
      geometry.G11 = metadata.G11;
    } else {
      geometry[field] = finiteNumber(metadata[field], `reference.metadata.${field}`);
    }
  }
  if (!Number.isInteger(geometry.G3) || geometry.G3 < 1 || !Number.isInteger(geometry.G4) || geometry.G4 < 1) {
    fail("reference metadata G3 and G4 must be positive integers.", "invalid_geometry");
  }
  if (geometry.G8 !== 0.001) {
    fail("reference metadata G8 must equal 0.001 metres.", "reference_not_one_mm");
  }
  if (geometry.G12 < 0) {
    fail("reference metadata G12 must be non-negative.", "invalid_geometry");
  }

  const angles = requirePlainObject(rec.angles, "reference.angles");
  requireExactFields(angles, ["v_angles", "h_angles"], "reference.angles");
  const vAngles = requireIncreasingAngles(angles.v_angles, "reference.angles.v_angles", 180);
  const hAngles = requireIncreasingAngles(angles.h_angles, "reference.angles.h_angles", 360);
  if (vAngles.length !== geometry.G3 || hAngles.length !== geometry.G4) {
    fail("reference angle arrays must match metadata G3/G4.", "angle_count_mismatch");
  }
  if (!Array.isArray(rec.candela) || rec.candela.length !== geometry.G4) {
    fail("reference candela row count must match G4.", "candela_shape_mismatch");
  }
  const candela = rec.candela.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== geometry.G3) {
      fail(`reference candela row ${rowIndex} must match G3.`, "candela_shape_mismatch");
    }
    return row.map((entry, columnIndex) => {
      const number = finiteNumber(entry, `reference.candela[${rowIndex}][${columnIndex}]`);
      if (number < 0) fail("reference candela values must be non-negative.", "invalid_candela");
      return number;
    });
  });

  const baseline = requirePlainObject(rec.baseline, "reference.baseline");
  requireExactFields(
    baseline,
    ["cct", "cri", "internalAmbientTaC", "fluxPerMm", "wallWattsPerMm", "circuitWattsPerMm"],
    "reference.baseline",
  );
  const normalizedBaseline = {
    cct: optionalFiniteNumber(baseline.cct, "reference.baseline.cct"),
    cri: optionalFiniteNumber(baseline.cri, "reference.baseline.cri"),
    internalAmbientTaC: optionalFiniteNumber(baseline.internalAmbientTaC, "reference.baseline.internalAmbientTaC"),
    fluxPerMm: finiteNumber(baseline.fluxPerMm, "reference.baseline.fluxPerMm"),
    wallWattsPerMm: finiteNumber(baseline.wallWattsPerMm, "reference.baseline.wallWattsPerMm"),
    circuitWattsPerMm: finiteNumber(baseline.circuitWattsPerMm, "reference.baseline.circuitWattsPerMm"),
  };
  if (!Object.is(normalizedBaseline.wallWattsPerMm, geometry.G12)
      || !Object.is(normalizedBaseline.circuitWattsPerMm, geometry.G10)
      || !Object.is(normalizedBaseline.fluxPerMm, Number(geometry.G11))) {
    fail("reference baseline must remain exactly bound to G10/G11/G12.", "baseline_binding_mismatch");
  }

  requirePlainObject(rec.provenanceRefs, "reference.provenanceRefs");
  validatePrivateProvenance(rec.provenanceRefs);
  return { rec, geometry, vAngles, hAngles, candela, keywordValues, baseline: normalizedBaseline };
}

function validateJob(jobValue) {
  const job = requirePlainObject(jobValue, "job");
  for (const key of Object.keys(job)) {
    if (!JOB_FIELDS.includes(key)) fail(`job.${key} is not supported.`, "unsupported_job_field");
  }
  if (!hasOwn(job, "runLengthMm")) {
    fail("job.runLengthMm is required.", "run_length_required");
  }
  const runLengthMm = positiveNumberFromInput(job.runLengthMm, "job.runLengthMm", { integer: true });
  const outputMultiplier = hasOwn(job, "outputMultiplier")
    ? positiveNumberFromInput(job.outputMultiplier, "job.outputMultiplier")
    : 1;
  const selections = job.selections == null ? {} : requirePlainObject(job.selections, "job.selections");
  for (const key of Object.keys(selections)) {
    if (!SELECTION_FIELDS.includes(key)) fail(`job.selections.${key} is not supported.`, "unsupported_selection_field");
  }
  const normalizedSelections = {};
  for (const key of SELECTION_FIELDS) {
    if (hasOwn(selections, key)) normalizedSelections[key] = keywordText(selections[key], `job.selections.${key}`);
  }
  return { runLengthMm, outputMultiplier, selections: normalizedSelections };
}

function firstPresent(...values) {
  return values.find((value) => value != null && String(value).trim() !== "") ?? null;
}

function buildKeywords(referenceState, jobState) {
  const { keywordValues, baseline } = referenceState;
  const { selections } = jobState;
  const resolved = new Map(keywordValues);
  resolved.set("LUMCAT", firstPresent(selections.lumcat, keywordValues.get("LUMCAT")));
  resolved.set("LUMINAIRE", firstPresent(selections.luminaire, keywordValues.get("LUMINAIRE")));
  resolved.set("LAMP", firstPresent(selections.lamp, keywordValues.get("LAMP")));
  resolved.set("_CRI", firstPresent(selections.cri, keywordValues.get("_CRI"), baseline.cri));
  resolved.set("_COLORTEMP", firstPresent(selections.cct, keywordValues.get("_COLORTEMP"), baseline.cct));
  resolved.set(
    "_INTERNAL_AMBIENT_TA_C",
    firstPresent(keywordValues.get("_INTERNAL_AMBIENT_TA_C"), baseline.internalAmbientTaC),
  );
  resolved.set("_DRIVER", firstPresent(selections.driver, keywordValues.get("_DRIVER")));
  resolved.set("_DRIVER_SETTING", firstPresent(selections.driverSetting, keywordValues.get("_DRIVER_SETTING")));

  return CANONICAL_KEYWORDS.map((key) => ({
    key: `[${key}]`,
    value: keywordText(resolved.get(key), `resolved keyword ${key}`),
  }));
}

function safeFilenamePart(value) {
  const text = String(value).trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[. -]+$/g, "");
  return text || "reference";
}

function colourCodeFromKeywords(keywords) {
  const values = new Map(keywords.map((row) => [normalizeKeywordName(row.key), row.value]));
  const criDigits = String(values.get("_CRI") || "").replace(/[^0-9]/g, "");
  const criCode = criDigits.endsWith("0") ? criDigits.slice(0, -1) : criDigits;
  const cctValue = Number.parseInt(String(values.get("_COLORTEMP") || "").replace(/[^0-9]/g, ""), 10);
  const cctCode = Number.isFinite(cctValue) ? String(Math.round(cctValue / 100)) : "";
  return `${criCode}${cctCode}`;
}

function materialise(referenceState, jobState) {
  const { rec, geometry, vAngles, hAngles, candela } = referenceState;
  const { runLengthMm, outputMultiplier } = jobState;
  const keywords = buildKeywords(referenceState, jobState);
  const model = {
    photometry: {
      geometry: { ...geometry },
      v_angles: vAngles.slice(),
      h_angles: hAngles.slice(),
      candela: candela.map((row) => row.slice()),
    },
  };
  const scaled = scaleToLengthM(model, runLengthMm / 1000).photometry;
  if (outputMultiplier !== 1) {
    for (const row of scaled.candela) {
      for (let index = 0; index < row.length; index += 1) row[index] *= outputMultiplier;
    }
    scaled.geometry.G12 *= outputMultiplier;
  }
  scaled.geometry.G3 = scaled.v_angles.length;
  scaled.geometry.G4 = scaled.h_angles.length;

  const metrics = computeMetrics({ photometry: scaled });
  const ies2002 = writeIes({ meta: { keywords_order: keywords }, photometry: scaled });
  const iesText = ies2002.replace(/^IESNA:LM-63-2002\n/, "IESNA:LM-63-2019\n");
  const lumcat = keywords.find((row) => normalizeKeywordName(row.key) === "LUMCAT")?.value || rec.id;
  const watts = Number(scaled.geometry.G12);
  const wattsPart = Number.isFinite(watts) ? watts.toFixed(1).replace(/\.0$/, "") : "0";
  const filename = [
    safeFilenamePart(lumcat),
    colourCodeFromKeywords(keywords),
    `${runLengthMm}mm`,
    `${wattsPart}W`,
  ].filter(Boolean).join("_") + ".ies";

  return {
    ok: true,
    iesText,
    filename,
    runLengthMm,
    outputMultiplier,
    exitLumens: metrics.lumens == null ? null : Math.round(metrics.lumens),
    inputWatts: Number(watts.toFixed(1)),
    keywords,
    provenance: {
      schema: "controlstack.lab.ies-from-reference.v1",
      referenceId: rec.id,
      referenceKind: rec.kind,
      referenceSha256: rec.referenceSha256,
      operation: "materialise-reference-length",
      runLengthMm,
      outputMultiplier,
    },
  };
}

function inspectionKeywordValue(referenceState, key) {
  const direct = referenceState.keywordValues.get(key);
  if (direct != null && String(direct).trim() !== "") return direct;
  if (key === "_CRI") return referenceState.baseline.cri;
  if (key === "_COLORTEMP") return referenceState.baseline.cct;
  if (key === "_INTERNAL_AMBIENT_TA_C") return referenceState.baseline.internalAmbientTaC;
  return null;
}

function inspectKeywordReadiness(referenceState) {
  const overrideByKeyword = new Map(
    KEYWORD_OVERRIDE_RULES.map((rule) => [rule.keyword, rule.field]),
  );
  const missingKeywordOverrides = [];
  for (const key of CANONICAL_KEYWORDS) {
    if (inspectionKeywordValue(referenceState, key) != null) continue;
    const overrideField = overrideByKeyword.get(key);
    if (overrideField) {
      missingKeywordOverrides.push(overrideField);
      continue;
    }
    fail(`Resolved keyword ${key} is unavailable and has no approved job override.`, "required_generator_keyword_missing");
  }
  return missingKeywordOverrides;
}

function perMetre(value) {
  const result = Number(value) * 1000;
  if (!Number.isFinite(result)) fail("Reference baseline cannot be projected per metre.", "invalid_baseline_number");
  return Object.is(result, -0) ? 0 : result;
}

function inspectionSafety(referenceValidated) {
  return {
    readOnly: true,
    nonPersistent: true,
    referenceValidated,
    jobValidated: false,
    materialiseInvoked: false,
    generatorInvoked: false,
    iesGenerated: false,
    rawIesReturned: false,
    metadataReturned: false,
    anglesReturned: false,
    candelaReturned: false,
    keywordValuesReturned: false,
    provenancePathsReturned: false,
    sealedReferenceReturned: false,
    multiplierDerived: false,
    projectMetadataAccepted: false,
    resolverInvoked: false,
    storageAccessed: false,
    routeAdded: false,
    persistenceAttempted: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    readinessActivated: false,
  };
}

function inspectionAudit({ accepted, inspectionId = null, referenceId = null, blocker = null }) {
  return {
    schemaId: IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_ID,
    schemaVersion: IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_VERSION,
    attemptId: inspectionId || `ies-reference-generation-inspection-attempt-v1:${blocker || "blocked"}`,
    state: accepted ? "accepted_read_only" : "blocked_fail_closed",
    accepted,
    inspectionId,
    referenceId,
    deterministic: true,
    referenceValidated: accepted,
    jobValidated: false,
    materialiseInvoked: false,
    generatorInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
}

function blockedInspection(blocker) {
  const code = typeof blocker === "string" && blocker ? blocker : "reference_inspection_blocked";
  return deepFreeze({
    schemaId: IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_ID,
    schemaVersion: IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_VERSION,
    state: IES_REFERENCE_GENERATION_INSPECTION_STATES.blockedFailClosed,
    inspectionId: null,
    referenceIdentity: null,
    keywordProfileId: null,
    baseline: null,
    missingKeywordOverrides: [],
    materialisationWithoutOverrides: false,
    blockers: [code],
    warnings: [],
    audit: inspectionAudit({ accepted: false, blocker: code }),
    safetyFlags: inspectionSafety(false),
  });
}

export function inspectIesReferenceForGeneration(reference) {
  try {
    const referenceState = validateReference(reference);
    const { rec, baseline } = referenceState;
    const missingKeywordOverrides = inspectKeywordReadiness(referenceState);
    const inspectionId = `ies-reference-generation-inspection-v1:${rec.referenceSha256}`;
    const referenceIdentity = {
      schemaId: "controlstack.lab.reference-identity.v1",
      schemaVersion: 1,
      referenceId: rec.id,
      kind: rec.kind,
      serial: rec.serial,
      sealedAtUtc: rec.sealedAtUtc,
      authorityRecordSha256: rec.authorityRecordSha256,
      referenceSha256: rec.referenceSha256,
      resolverPath: `/r/${rec.id}`,
      readOnly: true,
    };
    const safeBaseline = {
      cct: baseline.cct,
      cri: baseline.cri,
      internalAmbientTaC: baseline.internalAmbientTaC,
      fluxPerMm: baseline.fluxPerMm,
      wallWattsPerMm: baseline.wallWattsPerMm,
      circuitWattsPerMm: baseline.circuitWattsPerMm,
      baselineLmPerM: perMetre(baseline.fluxPerMm),
      baselineWallWattsPerM: perMetre(baseline.wallWattsPerMm),
      baselineCircuitWattsPerM: perMetre(baseline.circuitWattsPerMm),
    };
    return deepFreeze({
      schemaId: IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_ID,
      schemaVersion: IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_VERSION,
      state: IES_REFERENCE_GENERATION_INSPECTION_STATES.readyReadOnly,
      inspectionId,
      referenceIdentity,
      keywordProfileId: KEYWORD_PROFILE_ID,
      baseline: safeBaseline,
      missingKeywordOverrides,
      materialisationWithoutOverrides: missingKeywordOverrides.length === 0,
      blockers: [],
      warnings: [],
      audit: inspectionAudit({
        accepted: true,
        inspectionId,
        referenceId: rec.id,
      }),
      safetyFlags: inspectionSafety(true),
    });
  } catch (error) {
    if (error instanceof IesFromReferenceError) return blockedInspection(error.code);
    return blockedInspection("reference_inspection_failed");
  }
}

export function buildIesFromReference(reference, job = {}) {
  try {
    const referenceState = validateReference(reference);
    const jobState = validateJob(job);
    return materialise(referenceState, jobState);
  } catch (error) {
    if (error instanceof IesFromReferenceError) {
      return { ok: false, code: error.code, reason: error.message };
    }
    return { ok: false, code: "generation_failed", reason: "IES generation failed closed." };
  }
}
