// ControlStack Lab — immutable advisory emergency-selection contract.
// Pure, deterministic, browser-safe, and intentionally non-procuring.

export class EmergencySelectionContractError extends Error {
  constructor(message, code = "invalid_emergency_selection_contract", details = null) {
    super(message);
    this.name = "EmergencySelectionContractError";
    this.code = code;
    if (details !== null) this.details = deepFreeze(details);
  }
}

export const EMERGENCY_SELECTION_SCHEMA_ID = "controlstack.lab.emergency-selection.v1";
export const EMERGENCY_SELECTION_SCHEMA_VERSION = 1;

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const EMERGENCY_MODELS = deepFreeze({
  "zc-em-smart-50": {
    modelId: "zc-em-smart-50",
    isolation: "SELV",
    outputVoltageRangeV: [10, 50],
    publishedPowerW: [1.5, 2.5, 3.5],
    evidenceStatus: "published",
  },
  "zc-em-smart-250": {
    modelId: "zc-em-smart-250",
    isolation: "non-SELV",
    outputVoltageRangeV: [50, 250],
    publishedPowerW: [2.5, 3.5, 4.5],
    evidenceStatus: "published",
  },
});

function battery(packCode, evidenceStatus = "published") {
  return { packCode, evidenceStatus };
}

export const EMERGENCY_BATTERY_MATRIX = deepFreeze({
  "zc-em-smart-50": {
    1.5: {
      1: { 5: battery("zc-batt-1A1-ADA"), 10: battery("zc-batt-1C2-ADA") },
      2: { 5: battery("zc-batt-1C2-ADA"), 10: battery("zc-batt-1B2-ADA") },
      3: { 5: battery("zc-batt-1A2-ADA"), 10: battery("zc-batt-1B2-ADA") },
    },
    2.5: {
      1: { 5: battery("zc-batt-1C2-ADA"), 10: battery("zc-batt-1A2-ADA") },
      2: { 5: battery("zc-batt-1A2-ADA"), 10: battery("zc-batt-1B2-ADA") },
      3: { 5: battery("zc-batt-1B2-ADA"), 10: battery("zc-batt-1B3-ADA") },
    },
    3.5: {
      1: { 5: battery("zc-batt-1C2-ADA"), 10: battery("zc-batt-1B2-ADA") },
      2: { 5: battery("zc-batt-1B2-ADA"), 10: battery("zc-batt-1B3-ADA") },
      3: { 5: battery("zc-batt-1B2-ADA"), 10: battery("zc-batt-1B4-ADA") },
    },
  },
  "zc-em-smart-250": {
    2.5: {
      1: { 5: battery("zc-batt-1C2-BDA"), 10: battery("zc-batt-1A2-BDA") },
      2: { 5: battery("zc-batt-1A2-BDA"), 10: battery("zc-batt-1B2-BDA") },
      3: { 5: battery("zc-batt-1B2-BDA"), 10: battery("zc-batt-1B3-BDA") },
    },
    3.5: {
      1: { 5: battery("zc-batt-1C2-BDA"), 10: battery("zc-batt-1B2-BDA") },
      2: { 5: battery("zc-batt-1B2-BDA"), 10: battery("zc-batt-1B3-BDA") },
      3: { 5: battery("zc-batt-1B2-BDA"), 10: battery("zc-batt-1B4-BDA") },
    },
    4.5: {
      1: { 5: battery("zc-batt-1A2-BDA"), 10: battery("zc-batt-1B2-BDA") },
      2: { 5: battery("zc-batt-1B2-BDA"), 10: battery("zc-batt-1B4-BDA") },
      3: { 5: battery("zc-batt-1B3-BDA"), 10: battery("zc-batt-1B5-BDA", "conflicting_publication") },
    },
  },
});

const INPUT_KEYS = Object.freeze(["stringVoltageV", "powerW", "durationHours", "designLifeYears"]);
const SUPPORTED_DURATIONS = Object.freeze([1, 2, 3]);
const SUPPORTED_DESIGN_LIVES = Object.freeze([5, 10]);
const PROCUREMENT_BLOCKERS = Object.freeze([
  "battery_capacity_unconfirmed",
  "battery_energy_unconfirmed",
  "battery_cell_arrangement_unconfirmed",
  "battery_connector_unconfirmed",
  "battery_lead_unconfirmed",
  "battery_pack_temperature_unconfirmed",
  "output_current_tolerance_unconfirmed",
  "converter_efficiency_unconfirmed",
  "temperature_derating_unconfirmed",
]);
const NOMINAL_CURRENT_WARNING = "nominal_current_is_arithmetic_only";

function fail(message, code, details = null) {
  throw new EmergencySelectionContractError(message, code, details);
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requireInput(value) {
  if (!isPlainObject(value)) fail("input must be a plain object.", "plain_object_required");
  const actual = Object.keys(value).sort();
  const expected = [...INPUT_KEYS].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail("input has unsupported or missing fields.", "invalid_input_shape", { expectedKeys: expected });
  }
  for (const key of INPUT_KEYS) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key])) {
      fail(`${key} must be a finite number.`, "finite_number_required", { field: key });
    }
  }
  if (!(value.stringVoltageV > 0)) fail("stringVoltageV must be greater than zero.", "positive_voltage_required");
  if (!(value.powerW > 0)) fail("powerW must be greater than zero.", "positive_power_required");
  return value;
}

function modelForVoltage(stringVoltageV) {
  if (stringVoltageV < 10) return { model: null, blocker: "voltage_below_published_range" };
  if (stringVoltageV > 250) return { model: null, blocker: "voltage_above_published_range" };
  if (stringVoltageV === 50) return { model: null, blocker: "voltage_boundary_requires_engineering_review" };
  return {
    model: stringVoltageV < 50 ? EMERGENCY_MODELS["zc-em-smart-50"] : EMERGENCY_MODELS["zc-em-smart-250"],
    blocker: null,
  };
}

function buildOutput({
  state,
  model = null,
  selectedPowerW = null,
  nominalDriveCurrentmA = null,
  durationHours = null,
  designLifeYears = null,
  batteryPackCode = null,
  procurementBlockers = [],
  engineeringWarnings = [],
}) {
  return deepFreeze({
    schemaId: EMERGENCY_SELECTION_SCHEMA_ID,
    schemaVersion: EMERGENCY_SELECTION_SCHEMA_VERSION,
    state,
    modelId: model?.modelId ?? null,
    isolation: model?.isolation ?? null,
    outputVoltageRangeV: model ? [...model.outputVoltageRangeV] : null,
    selectedPowerW,
    nominalDriveCurrentmA,
    nominalCurrentStatus: nominalDriveCurrentmA === null ? null : "derived_exact",
    durationHours,
    designLifeYears,
    batteryPackCode,
    procurementRelease: false,
    procurementBlockers: [...procurementBlockers],
    engineeringWarnings: [...engineeringWarnings],
    assemblyVerification: {
      emergency: null,
      ewisCartridge: null,
    },
    readOnly: true,
  });
}

export function selectEmergencyCandidate(inputValue) {
  const input = requireInput(inputValue);
  const { model, blocker: voltageBlocker } = modelForVoltage(input.stringVoltageV);
  if (!model) {
    return buildOutput({
      state: "blocked",
      procurementBlockers: [voltageBlocker],
    });
  }

  const procurementBlockers = [];
  const engineeringWarnings = [NOMINAL_CURRENT_WARNING];
  const powerSupported = model.publishedPowerW.includes(input.powerW);
  const durationSupported = SUPPORTED_DURATIONS.includes(input.durationHours);
  const designLifeSupported = SUPPORTED_DESIGN_LIVES.includes(input.designLifeYears);

  if (!powerSupported) procurementBlockers.push("unsupported_published_power");
  if (!durationSupported) procurementBlockers.push("unsupported_published_duration");
  if (!designLifeSupported) procurementBlockers.push("unsupported_published_design_life");

  const selectedPowerW = powerSupported ? input.powerW : null;
  const durationHours = durationSupported ? input.durationHours : null;
  const designLifeYears = designLifeSupported ? input.designLifeYears : null;
  const nominalDriveCurrentmA = powerSupported
    ? (1000 * input.powerW) / input.stringVoltageV
    : null;

  if (!powerSupported || !durationSupported || !designLifeSupported) {
    return buildOutput({
      state: "blocked",
      model,
      selectedPowerW,
      nominalDriveCurrentmA,
      durationHours,
      designLifeYears,
      procurementBlockers,
      engineeringWarnings,
    });
  }

  const matrixEntry = EMERGENCY_BATTERY_MATRIX[model.modelId]?.[input.powerW]?.[input.durationHours]?.[input.designLifeYears] ?? null;
  if (!matrixEntry) {
    return buildOutput({
      state: "blocked",
      model,
      selectedPowerW,
      nominalDriveCurrentmA,
      durationHours,
      designLifeYears,
      procurementBlockers: ["published_battery_matrix_entry_missing"],
      engineeringWarnings,
    });
  }
  if (matrixEntry.evidenceStatus === "conflicting_publication") {
    return buildOutput({
      state: "blocked",
      model,
      selectedPowerW,
      nominalDriveCurrentmA,
      durationHours,
      designLifeYears,
      procurementBlockers: ["battery_pack_code_conflict", ...PROCUREMENT_BLOCKERS],
      engineeringWarnings,
    });
  }

  return buildOutput({
    state: "candidate",
    model,
    selectedPowerW,
    nominalDriveCurrentmA,
    durationHours,
    designLifeYears,
    batteryPackCode: matrixEntry.packCode,
    procurementBlockers: PROCUREMENT_BLOCKERS,
    engineeringWarnings,
  });
}
