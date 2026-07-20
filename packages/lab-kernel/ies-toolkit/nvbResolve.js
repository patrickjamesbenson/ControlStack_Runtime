// ControlStack Lab — pure NVB resolution over caller-supplied source rows.
// This module owns no source loading, persistence, UI, or assembly verification.

export class NvbResolutionContractError extends Error {
  constructor(message, code = "invalid_nvb_resolution_contract", details = null) {
    super(message);
    this.name = "NvbResolutionContractError";
    this.code = code;
    if (details !== null) this.details = deepFreeze(details);
  }
}

export const NVB_RESOLUTION_SCHEMA_ID = "controlstack.lab.nvb-resolution.v2";
export const NVB_RESOLUTION_SCHEMA_VERSION = 2;
export const NVB_TEST_PATHS = Object.freeze(["gear_tray", "optic", "no_base"]);

const TEST_TYPE_TO_PATH = Object.freeze({
  "Base Engine": "gear_tray",
  "Base Engine & Optic": "optic",
  "No Base Luminiare": "no_base",
});

function fail(message, code, details = null) {
  throw new NvbResolutionContractError(message, code, details);
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

function requireExactKeys(value, requiredKeys, optionalKeys, name) {
  const required = new Set(requiredKeys);
  const allowed = new Set([...requiredKeys, ...optionalKeys]);
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      fail(`${name} is missing required fields.`, "invalid_object_shape", { name, requiredKeys: [...required] });
    }
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(`${name} has unsupported fields.`, "invalid_object_shape", { name, allowedKeys: [...allowed].sort() });
    }
  }
}

function requireRows(value, name) {
  if (!Array.isArray(value)) fail(`${name} must be an array.`, "rows_required", { name });
  for (const [index, row] of value.entries()) {
    if (!isPlainObject(row)) fail(`${name}[${index}] must be a plain object.`, "invalid_source_row", { name, index });
  }
  return value;
}

function clonePlainData(value, name = "value", seen = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(`${name} contains a non-finite number.`, "non_finite_source_value", { name });
    return value;
  }
  if (!value || typeof value !== "object") {
    fail(`${name} contains unsupported data.`, "unsupported_source_value", { name });
  }
  if (seen.has(value)) fail(`${name} must not contain cycles.`, "cyclic_source_value", { name });
  seen.add(value);
  let output;
  if (Array.isArray(value)) {
    output = value.map((child, index) => clonePlainData(child, `${name}[${index}]`, seen));
  } else {
    if (!isPlainObject(value)) fail(`${name} must contain plain data only.`, "unsupported_source_value", { name });
    output = {};
    for (const [key, child] of Object.entries(value)) {
      output[key] = clonePlainData(child, `${name}.${key}`, seen);
    }
  }
  seen.delete(value);
  return output;
}

function optionalText(value, name) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") fail(`${name} must be a string or null.`, "invalid_text_value", { name });
  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    fail(`${name} must be a non-empty safe string or null.`, "invalid_text_value", { name });
  }
  return trimmed;
}

function requiredText(value, name) {
  const text = optionalText(value, name);
  if (text === null) fail(`${name} is required.`, "missing_text_value", { name });
  return text;
}

function optionalFiniteNumber(value, name) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${name} must be a finite number or null.`, "non_finite_source_value", { name });
  }
  return value;
}

function requiredThermalNumber(value, name) {
  if (value === undefined || value === null || value === "") {
    fail(`${name} is required for a resolved optic thermal triplet.`, "thermal_triplet_missing", { name });
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${name} must be a finite number.`, "thermal_triplet_invalid", { name });
  }
  return Object.is(value, -0) ? 0 : value;
}

function decimalInteger(value, name) {
  const text = String(requiredThermalNumber(value, name));
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

function thermalTripletMatches(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC) {
  const room = decimalInteger(referenceRoomTaC, "optic reference room Ta");
  const internal = decimalInteger(referenceInternalTaC, "optic reference internal Ta");
  const rise = decimalInteger(opticThermalRiseTaC, "optic thermal rise Ta");
  const scale = Math.max(room.scale, internal.scale, rise.scale);
  const align = ({ integer, scale: valueScale }) => integer * (10n ** BigInt(scale - valueScale));
  return align(room) + align(rise) === align(internal);
}

function sourceFamily(row, name) {
  const fromFamily = Object.prototype.hasOwnProperty.call(row, "family")
    ? normaliseNvbFamily(row.family)
    : null;
  const fromSystem = Object.prototype.hasOwnProperty.call(row, "system")
    ? normaliseNvbFamily(row.system)
    : null;
  if (fromFamily === null && fromSystem === null) {
    fail(`${name} has no valid family.`, "invalid_source_family", { name });
  }
  if (fromFamily !== null && fromSystem !== null && fromFamily !== fromSystem) {
    fail(`${name} has conflicting family values.`, "conflicting_source_family", { name });
  }
  return fromFamily ?? fromSystem;
}

function addBlocker(blockers, code) {
  if (!blockers.includes(code)) blockers.push(code);
}

function projectGoverningThermals(row) {
  return {
    systemLabel: requiredText(row.label, "governing system label"),
    systemVariant: optionalText(row.system_variant_1, "governing system variant"),
    metalAreaMm2: optionalFiniteNumber(row.Thermal_metal_volume_mm2, "governing metal area"),
    airAreaMm2: optionalFiniteNumber(row.thermal_air_volume_mm2, "governing air area"),
  };
}

function projectOptic(row) {
  const hotTestValue = row.hot_test_battery_applies;
  let hotTestEvidenceRef = null;
  if (hotTestValue !== false && hotTestValue !== null && hotTestValue !== undefined && hotTestValue !== "") {
    hotTestEvidenceRef = requiredText(hotTestValue, "optic hot-test evidence reference");
  }
  const referenceRoomTaC = requiredThermalNumber(row.room_ta_c, "optic reference room Ta");
  const referenceInternalTaC = requiredThermalNumber(
    row.optic_internal_delta_ta_c,
    "optic reference internal Ta",
  );
  const opticThermalRiseTaC = requiredThermalNumber(row.optic_uplift_ta_c, "optic thermal rise Ta");
  if (!thermalTripletMatches(referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC)) {
    fail(
      "Optic thermal evidence must satisfy reference room plus rise equals absolute reference internal temperature.",
      "thermal_triplet_mismatch",
      { referenceRoomTaC, referenceInternalTaC, opticThermalRiseTaC },
    );
  }
  return {
    opticBomId: requiredText(row.optic_bom_id, "optic BOM ID"),
    opticVariant: requiredText(row.optic_var_1, "optic variant"),
    specCode: optionalText(row.spec_code, "optic spec code"),
    emissionPermission: optionalText(row.emission_permission, "optic emission permission"),
    hotTestEvidenceRef,
    opticalEfficiency: optionalFiniteNumber(row.eff_optical, "optic optical efficiency"),
    referenceRoomTaC,
    referenceInternalTaC,
    opticThermalRiseTaC,
  };
}

function splitLabFormForResolution(rows, blockers) {
  const iesFields = [];
  const checkFields = [];
  for (const [index, row] of rows.entries()) {
    try {
      const cloned = clonePlainData(row, `labForm[${index}]`);
      if (row.kind === "ies") iesFields.push(cloned);
      else if (row.kind === "check") checkFields.push(cloned);
      else addBlocker(blockers, "unknown_lab_form_kind");
    } catch (error) {
      if (!(error instanceof NvbResolutionContractError)) throw error;
      addBlocker(blockers, error.code);
    }
  }
  return { iesFields, checkFields };
}

function directEmissionAllowed(value) {
  if (typeof value !== "string") return false;
  return value.split(",").some((token) => token.trim().toLowerCase() === "direct");
}

export function normaliseNvbFamily(value) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  const match = /^(?:DNX[ _-]*)?([0-9]+)(?:\.0+)?$/i.exec(text);
  if (!match) return null;
  const family = Number(match[1]);
  return Number.isSafeInteger(family) && family > 0 ? family : null;
}

export function classifyNvbTestPath(testType) {
  return typeof testType === "string" && Object.prototype.hasOwnProperty.call(TEST_TYPE_TO_PATH, testType)
    ? TEST_TYPE_TO_PATH[testType]
    : null;
}

export function splitNvbLabForm(rows) {
  requireRows(rows, "rows");
  const blockers = [];
  const profile = splitLabFormForResolution(rows, blockers);
  if (blockers.length > 0) {
    fail("Lab-form rows contain unsupported kinds or values.", blockers[0], { blockers });
  }
  return deepFreeze(profile);
}

export function listNvbOpticsForFamily(optics, family, options = {}) {
  requireRows(optics, "optics");
  const selectedFamily = normaliseNvbFamily(family);
  if (selectedFamily === null) fail("family is invalid.", "invalid_family");
  const settings = requirePlainObject(options, "options");
  requireExactKeys(settings, [], ["directOnly"], "options");
  if (settings.directOnly !== undefined && typeof settings.directOnly !== "boolean") {
    fail("options.directOnly must be boolean.", "invalid_direct_only_option");
  }

  const matches = [];
  const seenIds = new Set();
  for (const [index, row] of optics.entries()) {
    const rowFamily = sourceFamily(row, `optics[${index}]`);
    const opticBomId = requiredText(row.optic_bom_id, `optics[${index}].optic_bom_id`);
    if (seenIds.has(opticBomId)) fail("Optic BOM IDs must be unique.", "duplicate_optic_bom_id", { opticBomId });
    seenIds.add(opticBomId);
    if (rowFamily !== selectedFamily) continue;
    if (settings.directOnly === true && !directEmissionAllowed(row.emission_permission)) continue;
    matches.push({
      opticBomId,
      opticVariant: requiredText(row.optic_var_1, `optics[${index}].optic_var_1`),
      row: clonePlainData(row, `optics[${index}]`),
    });
  }
  matches.sort((left, right) => left.opticBomId.localeCompare(right.opticBomId)
    || left.opticVariant.localeCompare(right.opticVariant));
  return deepFreeze(matches.map(({ row }) => row));
}

export function resolveNvbSelection(input) {
  const value = requirePlainObject(input, "input");
  requireExactKeys(value, ["testType", "selection", "systems", "optics", "labForm"], [], "input");
  const selection = requirePlainObject(value.selection, "input.selection");
  requireExactKeys(selection, ["family"], ["opticBomId", "opticVariant"], "input.selection");
  requireRows(value.systems, "input.systems");
  requireRows(value.optics, "input.optics");
  requireRows(value.labForm, "input.labForm");

  const blockers = [];
  const path = classifyNvbTestPath(value.testType);
  if (path === null) addBlocker(blockers, "unsupported_test_type");

  const family = normaliseNvbFamily(selection.family);
  if (family === null) addBlocker(blockers, "invalid_family");

  const labForm = splitLabFormForResolution(value.labForm, blockers);

  let governingThermals = null;
  if (family !== null) {
    const governingRows = [];
    for (const [index, row] of value.systems.entries()) {
      try {
        const rowFamily = sourceFamily(row, `systems[${index}]`);
        if (row.thermal_family_nominated_worst_case !== true
          && row.thermal_family_nominated_worst_case !== false) {
          addBlocker(blockers, "invalid_system_row");
          continue;
        }
        if (rowFamily === family && row.thermal_family_nominated_worst_case === true) governingRows.push(row);
      } catch (error) {
        if (!(error instanceof NvbResolutionContractError)) throw error;
        addBlocker(blockers, "invalid_system_row");
      }
    }
    if (governingRows.length === 0) addBlocker(blockers, "governing_thermal_row_missing");
    else if (governingRows.length > 1) addBlocker(blockers, "governing_thermal_row_duplicate");
    else {
      try {
        governingThermals = projectGoverningThermals(governingRows[0]);
      } catch (error) {
        if (!(error instanceof NvbResolutionContractError)) throw error;
        addBlocker(blockers, "invalid_governing_thermal_row");
      }
    }
  }

  let optic = null;
  if (path === "optic" && family !== null) {
    const requestedId = optionalText(selection.opticBomId, "input.selection.opticBomId");
    const requestedVariant = optionalText(selection.opticVariant, "input.selection.opticVariant");
    const candidates = [];
    for (const [index, row] of value.optics.entries()) {
      try {
        const rowFamily = sourceFamily(row, `optics[${index}]`);
        const opticBomId = requiredText(row.optic_bom_id, `optics[${index}].optic_bom_id`);
        const opticVariant = requiredText(row.optic_var_1, `optics[${index}].optic_var_1`);
        if (requestedId !== null) {
          if (opticBomId === requestedId) candidates.push({ row, rowFamily });
        } else if (requestedVariant !== null && rowFamily === family && opticVariant === requestedVariant) {
          candidates.push({ row, rowFamily });
        }
      } catch (error) {
        if (!(error instanceof NvbResolutionContractError)) throw error;
        addBlocker(blockers, "invalid_optic_row");
      }
    }
    if (requestedId === null && requestedVariant === null) addBlocker(blockers, "optic_selection_missing");
    else if (candidates.length === 0) addBlocker(blockers, "optic_match_missing");
    else if (candidates.length > 1) addBlocker(blockers, "optic_match_duplicate");
    else if (candidates[0].rowFamily !== family) addBlocker(blockers, "optic_family_mismatch");
    else {
      try {
        optic = projectOptic(candidates[0].row);
      } catch (error) {
        if (!(error instanceof NvbResolutionContractError)) throw error;
        if (error.code.startsWith("thermal_triplet_")) addBlocker(blockers, error.code);
        else addBlocker(blockers, "invalid_optic_row");
      }
    }
  }

  const status = path !== null && family !== null && blockers.length === 0 ? "resolved" : "unresolved";
  return deepFreeze({
    schemaId: NVB_RESOLUTION_SCHEMA_ID,
    schemaVersion: NVB_RESOLUTION_SCHEMA_VERSION,
    path,
    family,
    status,
    optic,
    governingThermals,
    labForm,
    blockers,
    readOnly: true,
  });
}
