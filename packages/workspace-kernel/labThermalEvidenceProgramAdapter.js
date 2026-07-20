export const PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID =
  "controlstack.program.thermal-evidence-bundle.v1";
export const PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION = 1;
export const PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE =
  "accepted_for_engine_thermal_lookup";

const LAB_PROJECTION_SCHEMA_ID = "controlstack.lab.nvb-lab-projection.v2";
const LAB_PROJECTION_SCHEMA_VERSION = 2;

const INPUT_KEYS = Object.freeze([
  "selectorCandidate",
  "validatedOpticBinding",
  "labProjection",
]);
const BINDING_KEYS = Object.freeze([
  "selectedOpticKey",
  "opticBomId",
  "sourceRevision",
  "sourceBacked",
]);
const LAB_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "path",
  "family",
  "selection",
  "governingThermals",
  "references",
  "thermalEvidence",
  "unresolved",
  "assemblyVerification",
  "readOnly",
]);
const LAB_SELECTION_KEYS = Object.freeze([
  "opticBomId",
  "opticVariant",
  "specCode",
  "emissionPermission",
]);
const LAB_THERMAL_EVIDENCE_KEYS = Object.freeze([
  "opticBomId",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
  "evidenceRef",
  "authorityState",
]);
const FORBIDDEN_NORMALIZED_KEYS = Object.freeze(new Set([
  "derivedinternalta",
  "derivedinternaltac",
  "derivedinternaltemperature",
  "curvelookupta",
  "curvelookuptac",
  "curvelookuptemperature",
  "boardta",
  "boardtac",
  "boardtemperature",
  "boardtemperatureta",
  "boardtemperaturetac",
  "verifiedlmperm",
  "verifiedlumensperm",
  "deliveredlmperm",
]));
const UNSAFE_TRUE_FIELDS = Object.freeze(new Set([
  "publicRouteAdded",
  "postEndpointAdded",
  "routesAdded",
  "postEndpointsAdded",
  "filesystemWriteAttempted",
  "auditJsonlWriteAttempted",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "selectedResultPersistenceEnabled",
  "selectedResultPersisted",
  "runTableGenerationEnabled",
  "runTableGenerated",
  "iesGenerationEnabled",
  "iesGenerated",
  "outputGenerationEnabled",
  "outputGenerated",
  "donorEngineInvoked",
  "donorRawPayloadReturned",
  "rawRowsReturned",
  "rawRowsExposed",
  "privatePathsReturned",
  "credentialsReturned",
]));

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizedKey(value) {
  return String(value ?? "").replace(/[^0-9a-z]/gi, "").toLowerCase();
}

function boundedText(value, maximum = 256) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > maximum
    || /[\u0000-\u001f\u007f]/.test(value)
  ) return null;
  return value;
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? (Object.is(value, -0) ? 0 : value)
    : null;
}

function exactKeys(value, keys) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function scanInput(value, seen = new Set()) {
  if (!value || typeof value !== "object") return null;
  if (seen.has(value)) return "cyclic-input";
  seen.add(value);
  const entries = Array.isArray(value)
    ? value.map((entry, index) => [String(index), entry])
    : Object.entries(value);
  for (const [key, child] of entries) {
    if (FORBIDDEN_NORMALIZED_KEYS.has(normalizedKey(key))) return `forbidden-input-field-${normalizedKey(key)}`;
    if (UNSAFE_TRUE_FIELDS.has(key) && child === true) return `unsafe-input-flag-${key}`;
    const nested = scanInput(child, seen);
    if (nested) return nested;
  }
  seen.delete(value);
  return null;
}

function decimalInteger(value) {
  const numeric = finiteNumber(value);
  if (numeric === null) return null;
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(String(numeric));
  if (!match) return null;
  const sign = match[1] === "-" ? -1n : 1n;
  const fraction = match[3] || "";
  const exponent = Number(match[4] || 0);
  const shift = exponent - fraction.length;
  if (!Number.isSafeInteger(shift) || Math.abs(shift) > 1000) return null;
  const digits = `${match[2]}${fraction}`.replace(/^0+(?=\d)/, "");
  const magnitude = BigInt(digits || "0");
  return shift >= 0
    ? { integer: sign * magnitude * (10n ** BigInt(shift)), scale: 0 }
    : { integer: sign * magnitude, scale: -shift };
}

function thermalTripletMatches(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC) {
  const room = decimalInteger(referenceRoomTaC);
  const internal = decimalInteger(referenceInternalTaC);
  const rise = decimalInteger(opticThermalRiseTaC);
  if (!room || !internal || !rise) return false;
  const scale = Math.max(room.scale, internal.scale, rise.scale);
  const align = ({ integer, scale: valueScale }) => integer * (10n ** BigInt(scale - valueScale));
  return align(room) + align(rise) === align(internal);
}

function selectorOpticKey(candidate) {
  if (!isPlainObject(candidate)) return { value: null, blocker: "selector-candidate-invalid" };
  const lighting = isPlainObject(candidate.lighting) ? candidate.lighting : {};
  const values = [
    candidate.optic?.key,
    lighting.selected_optic_key,
    lighting.optic_key,
  ].map((value) => boundedText(value, 180)).filter(Boolean);
  if (values.length === 0) return { value: null, blocker: "selector-optic-key-missing" };
  if (new Set(values).size !== 1) return { value: null, blocker: "selector-optic-key-conflict" };
  return { value: values[0], blocker: null };
}

function fail(blocker) {
  return deepFreeze({
    ok: false,
    bundle: null,
    summary: {
      schemaId: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID,
      schemaVersion: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION,
      state: "program_thermal_evidence_validation_blocked",
      blocker,
      readOnly: true,
      thermalArithmeticPerformed: false,
      curveLookupPerformed: false,
      verifiedOutputProduced: false,
    },
  });
}

export function buildLabThermalEvidenceProgramBundle(input = {}) {
  if (!exactKeys(input, INPUT_KEYS)) return fail("invalid-program-adapter-input-shape");
  const scanned = scanInput(input);
  if (scanned) return fail(scanned);

  const { selectorCandidate, validatedOpticBinding, labProjection } = input;
  if (!isPlainObject(selectorCandidate)) return fail("selector-candidate-invalid");
  const selectedRoomTaC = finiteNumber(selectorCandidate.selectedRoomTaC);
  if (selectedRoomTaC === null) return fail("selector-room-temperature-invalid");
  const selectorOptic = selectorOpticKey(selectorCandidate);
  if (selectorOptic.blocker) return fail(selectorOptic.blocker);

  if (!exactKeys(validatedOpticBinding, BINDING_KEYS)) return fail("validated-optic-binding-invalid");
  const bindingOpticKey = boundedText(validatedOpticBinding.selectedOpticKey, 180);
  const bindingOpticBomId = boundedText(validatedOpticBinding.opticBomId, 256);
  const sourceRevision = boundedText(validatedOpticBinding.sourceRevision, 256);
  if (!bindingOpticKey || !bindingOpticBomId || !sourceRevision || validatedOpticBinding.sourceBacked !== true) {
    return fail("validated-optic-binding-invalid");
  }
  if (selectorOptic.value !== bindingOpticKey) return fail("selector-optic-binding-mismatch");

  if (!exactKeys(labProjection, LAB_KEYS)) return fail("lab-projection-invalid-shape");
  if (
    labProjection.schemaId !== LAB_PROJECTION_SCHEMA_ID
    || labProjection.schemaVersion !== LAB_PROJECTION_SCHEMA_VERSION
  ) return fail("lab-projection-schema-unsupported");
  if (labProjection.path !== "optic") return fail("lab-projection-path-invalid");
  if (labProjection.readOnly !== true) return fail("lab-projection-not-read-only");
  if (!Array.isArray(labProjection.unresolved) || labProjection.unresolved.length !== 0) {
    return fail("lab-projection-unresolved");
  }
  if (!isPlainObject(labProjection.references) || !isPlainObject(labProjection.assemblyVerification)) {
    return fail("lab-projection-invalid-shape");
  }

  const selection = labProjection.selection;
  if (!exactKeys(selection, LAB_SELECTION_KEYS)) return fail("lab-selection-invalid-shape");
  const selectedOpticBomId = boundedText(selection.opticBomId, 256);
  if (!selectedOpticBomId) return fail("lab-selection-optic-bom-invalid");

  const evidence = labProjection.thermalEvidence;
  if (!exactKeys(evidence, LAB_THERMAL_EVIDENCE_KEYS)) return fail("lab-thermal-evidence-invalid-shape");
  const evidenceOpticBomId = boundedText(evidence.opticBomId, 256);
  const evidenceRef = boundedText(evidence.evidenceRef, 256);
  const referenceRoomTaC = finiteNumber(evidence.referenceRoomTaC);
  const referenceInternalTaC = finiteNumber(evidence.referenceInternalTaC);
  const opticThermalRiseTaC = finiteNumber(evidence.opticThermalRiseTaC);
  if (!evidenceOpticBomId || !evidenceRef) return fail("lab-thermal-evidence-identity-invalid");
  if (evidence.authorityState !== null) return fail("lab-thermal-authority-state-invalid");
  if (
    referenceRoomTaC === null
    || referenceInternalTaC === null
    || opticThermalRiseTaC === null
  ) return fail("lab-thermal-triplet-invalid");
  if (!thermalTripletMatches(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC)) {
    return fail("lab-thermal-triplet-contradictory");
  }
  if (
    bindingOpticBomId !== selectedOpticBomId
    || bindingOpticBomId !== evidenceOpticBomId
  ) return fail("optic-bom-binding-mismatch");

  const bundle = deepFreeze({
    schemaId: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID,
    schemaVersion: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION,
    selectedRoomTaC,
    selectedOpticKey: bindingOpticKey,
    opticBomId: bindingOpticBomId,
    sourceRevision,
    referenceRoomTaC,
    referenceInternalTaC,
    opticThermalRiseTaC,
    evidenceRef,
    labAuthorityState: null,
    programValidationState: PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE,
    readOnly: true,
  });

  return deepFreeze({
    ok: true,
    bundle,
    summary: {
      schemaId: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID,
      schemaVersion: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION,
      state: "program_thermal_evidence_validated",
      blocker: null,
      selectedOpticKey: bundle.selectedOpticKey,
      opticBomId: bundle.opticBomId,
      sourceRevision: bundle.sourceRevision,
      labAuthorityState: null,
      programValidationState: PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE,
      readOnly: true,
      thermalArithmeticPerformed: false,
      curveLookupPerformed: false,
      verifiedOutputProduced: false,
    },
  });
}
