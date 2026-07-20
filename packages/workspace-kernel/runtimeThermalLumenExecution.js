import {
  PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID,
  PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION,
  PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE,
} from "./labThermalEvidenceProgramAdapter.js";
import { buildRuntimeLumenCurveParseInterpolationContract } from "./runtimeLumenCurveParseInterpolationContract.js";

export const RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID =
  "controlstack.runtime.thermal-lumen-execution.v1";
export const RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION = 1;

const REQUIRED_INPUT_KEYS = Object.freeze([
  "thermalEvidenceBundle",
  "curve",
  "requestedCurrentMa",
]);
const OPTIONAL_INPUT_KEYS = Object.freeze([
  "curveHome",
  "fsApi",
  "traceabilityEnvelope",
]);
const BUNDLE_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "selectedRoomTaC",
  "selectedOpticKey",
  "opticBomId",
  "sourceRevision",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
  "evidenceRef",
  "labAuthorityState",
  "programValidationState",
  "readOnly",
]);
const FORBIDDEN_NORMALIZED_KEYS = Object.freeze(new Set([
  "derivedinternalta",
  "derivedinternaltac",
  "derivedinternaltemperature",
  "curvelookupta",
  "curvelookuptac",
  "curvelookuptemperature",
  "effectivecurveta",
  "effectivecurvetac",
  "boardta",
  "boardtac",
  "boardtemperature",
  "boardtemperatureta",
  "boardtemperaturetac",
  "verifiedlmperm",
  "verifiedlumensperm",
  "deliveredlmperm",
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

function validInputKeys(value) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  if (!REQUIRED_INPUT_KEYS.every((key) => keys.includes(key))) return false;
  const allowed = new Set([...REQUIRED_INPUT_KEYS, ...OPTIONAL_INPUT_KEYS]);
  return keys.every((key) => allowed.has(key));
}

function scanForbidden(value, seen = new Set()) {
  if (!value || typeof value !== "object") return null;
  if (seen.has(value)) return "cyclic-input";
  seen.add(value);
  const entries = Array.isArray(value)
    ? value.map((entry, index) => [String(index), entry])
    : Object.entries(value);
  for (const [key, child] of entries) {
    if (FORBIDDEN_NORMALIZED_KEYS.has(normalizedKey(key))) {
      return `caller-supplied-field-rejected-${normalizedKey(key)}`;
    }
    const nested = scanForbidden(child, seen);
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

function decimalPair(leftValue, rightValue) {
  const left = decimalInteger(leftValue);
  const right = decimalInteger(rightValue);
  if (!left || !right) return null;
  const scale = Math.max(left.scale, right.scale);
  const align = ({ integer, scale: valueScale }) => integer * (10n ** BigInt(scale - valueScale));
  return { left: align(left), right: align(right), scale };
}

function exactAdd(leftValue, rightValue) {
  const pair = decimalPair(leftValue, rightValue);
  if (!pair) return null;
  const total = pair.left + pair.right;
  const divisor = 10 ** pair.scale;
  const numeric = Number(total) / divisor;
  return Number.isFinite(numeric) ? (Object.is(numeric, -0) ? 0 : numeric) : null;
}

function measuredTripletMatches(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC) {
  const sum = exactAdd(referenceRoomTaC, opticThermalRiseTaC);
  const expected = finiteNumber(referenceInternalTaC);
  return sum !== null && expected !== null && sum === expected;
}

function fail(blocker, extra = {}) {
  return deepFreeze({
    ok: false,
    result: null,
    summary: {
      schemaId: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
      schemaVersion: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
      state: "runtime_thermal_lumen_execution_blocked",
      blocker,
      readOnly: true,
      opticRiseAppliedCount: 0,
      curveParserInvoked: extra.curveParserInvoked === true,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      outputGenerated: false,
      rawCurveRowsReturned: false,
      rawCurvePayloadReturned: false,
    },
  });
}

function validateBundle(bundle) {
  if (!exactKeys(bundle, BUNDLE_KEYS)) return { ok: false, blocker: "program-thermal-bundle-invalid-shape" };
  if (
    bundle.schemaId !== PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID
    || bundle.schemaVersion !== PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION
  ) return { ok: false, blocker: "program-thermal-bundle-schema-unsupported" };
  if (
    bundle.programValidationState !== PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE
    || bundle.readOnly !== true
    || bundle.labAuthorityState !== null
  ) return { ok: false, blocker: "program-thermal-bundle-not-accepted" };

  const selectedRoomTaC = finiteNumber(bundle.selectedRoomTaC);
  const referenceRoomTaC = finiteNumber(bundle.referenceRoomTaC);
  const referenceInternalTaC = finiteNumber(bundle.referenceInternalTaC);
  const opticThermalRiseTaC = finiteNumber(bundle.opticThermalRiseTaC);
  const selectedOpticKey = boundedText(bundle.selectedOpticKey, 180);
  const opticBomId = boundedText(bundle.opticBomId, 256);
  const sourceRevision = boundedText(bundle.sourceRevision, 256);
  const evidenceRef = boundedText(bundle.evidenceRef, 256);
  if (
    selectedRoomTaC === null
    || referenceRoomTaC === null
    || referenceInternalTaC === null
    || opticThermalRiseTaC === null
    || !selectedOpticKey
    || !opticBomId
    || !sourceRevision
    || !evidenceRef
  ) return { ok: false, blocker: "program-thermal-bundle-invalid-values" };
  if (!measuredTripletMatches(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC)) {
    return { ok: false, blocker: "program-thermal-bundle-contradictory" };
  }

  return {
    ok: true,
    selectedRoomTaC,
    selectedOpticKey,
    opticBomId,
    sourceRevision,
    referenceRoomTaC,
    referenceInternalTaC,
    opticThermalRiseTaC,
    evidenceRef,
  };
}

function effectiveCurveTemperature(requestedTemperature, temperatureMode) {
  if (temperatureMode === "clamped-low") return 25;
  if (temperatureMode === "clamped-high") return 65;
  return requestedTemperature;
}

export async function executeRuntimeThermalLumenLookup(input = {}) {
  if (!isPlainObject(input)) return fail("runtime-thermal-input-invalid-shape");

  const computationalInput = Object.fromEntries(
    Object.entries(input).filter(([key]) => key !== "traceabilityEnvelope"),
  );
  const forbidden = scanForbidden(computationalInput);
  if (forbidden) return fail(forbidden);
  if (!validInputKeys(input)) return fail("runtime-thermal-input-invalid-shape");

  const bundle = computationalInput.thermalEvidenceBundle;
  if (bundle?.schemaId === "controlstack.lab.nvb-lab-projection.v2") {
    return fail("direct-lab-projection-rejected");
  }
  const validated = validateBundle(bundle);
  if (!validated.ok) return fail(validated.blocker);

  const requestedCurrentMa = finiteNumber(computationalInput.requestedCurrentMa);
  if (requestedCurrentMa === null || requestedCurrentMa < 0) {
    return fail("requested-current-invalid");
  }

  const derivedInternalTaC = exactAdd(
    validated.selectedRoomTaC,
    validated.opticThermalRiseTaC,
  );
  if (derivedInternalTaC === null) return fail("derived-internal-temperature-invalid");
  const curveLookupTaC = derivedInternalTaC;

  const parserInput = {
    curve: computationalInput.curve,
    interpolationRequest: {
      current_ma: requestedCurrentMa,
      temp_c: curveLookupTaC,
    },
  };
  if (Object.prototype.hasOwnProperty.call(computationalInput, "curveHome")) {
    parserInput.curveHome = computationalInput.curveHome;
  }
  if (Object.prototype.hasOwnProperty.call(computationalInput, "fsApi")) {
    parserInput.fsApi = computationalInput.fsApi;
  }

  const curveResult = await buildRuntimeLumenCurveParseInterpolationContract(parserInput);
  if (!curveResult?.ok || !isPlainObject(curveResult.interpolation)) {
    return fail(`curve-parser-${boundedText(curveResult?.blocker, 128) || "blocked"}`, {
      curveParserInvoked: true,
    });
  }
  if (
    curveResult.raw_payload_returned !== false
    || curveResult.raw_curve_rows_returned !== false
    || curveResult.full_curve_returned !== false
    || curveResult.checksum_verified !== true
    || curveResult.safetyFlags?.donorEngineInvoked !== false
    || curveResult.safetyFlags?.runtimeDataMutated !== false
  ) return fail("curve-parser-unsafe-result", { curveParserInvoked: true });

  const interpolation = curveResult.interpolation;
  const verifiedLmPerM = finiteNumber(interpolation.lm_per_m);
  const parserTemp = finiteNumber(interpolation.temp_c);
  const parserCurrent = finiteNumber(interpolation.current_ma);
  if (
    verifiedLmPerM === null
    || parserTemp !== curveLookupTaC
    || parserCurrent !== requestedCurrentMa
    || !boundedText(interpolation.temperature_mode, 64)
    || !boundedText(interpolation.current_mode, 64)
  ) return fail("curve-parser-result-invalid", { curveParserInvoked: true });

  const result = deepFreeze({
    schemaId: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
    schemaVersion: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
    selectedOpticKey: validated.selectedOpticKey,
    opticBomId: validated.opticBomId,
    sourceRevision: validated.sourceRevision,
    evidenceRef: validated.evidenceRef,
    programValidationState: PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE,
    selectedRoomTaC: validated.selectedRoomTaC,
    referenceRoomTaC: validated.referenceRoomTaC,
    referenceInternalTaC: validated.referenceInternalTaC,
    opticThermalRiseTaC: validated.opticThermalRiseTaC,
    derivedInternalTaC,
    curveLookupTaC,
    effectiveCurveTaC: effectiveCurveTemperature(curveLookupTaC, interpolation.temperature_mode),
    temperatureMode: interpolation.temperature_mode,
    requestedCurrentMa,
    currentMode: interpolation.current_mode,
    verifiedLmPerM,
    curveFilename: curveResult.filename,
    curveChecksumVerified: true,
    opticRiseAppliedCount: 1,
    readOnly: true,
    safetyFlags: {
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      outputGenerated: false,
      rawCurveRowsReturned: false,
      rawCurvePayloadReturned: false,
      publicRouteAdded: false,
      postEndpointAdded: false,
    },
  });

  return deepFreeze({
    ok: true,
    result,
    summary: {
      schemaId: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
      schemaVersion: RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
      state: "runtime_thermal_lumen_execution_complete",
      blocker: null,
      selectedOpticKey: result.selectedOpticKey,
      opticBomId: result.opticBomId,
      curveLookupTaC: result.curveLookupTaC,
      effectiveCurveTaC: result.effectiveCurveTaC,
      temperatureMode: result.temperatureMode,
      currentMode: result.currentMode,
      verifiedLmPerM: result.verifiedLmPerM,
      opticRiseAppliedCount: 1,
      curveParserInvoked: true,
      readOnly: true,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      outputGenerated: false,
      rawCurveRowsReturned: false,
      rawCurvePayloadReturned: false,
    },
  });
}
