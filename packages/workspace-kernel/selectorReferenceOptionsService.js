import { readFile, stat } from "node:fs/promises";

export const SELECTOR_REFERENCE_OPTIONS_PATH = "/api/selector-reference/options";

const DEFAULT_FS_API = Object.freeze({ readFile, stat });

const TARGET_FIELDS = Object.freeze([
  { fieldKey: "system", label: "System", role: "manual-constraint", sourceTables: ["SYSTEM"] },
  { fieldKey: "application", label: "Application / environment", role: "manual-constraint", sourceTables: ["SYSTEM_POLICY"] },
  { fieldKey: "interiorExterior", label: "Interior / exterior", role: "manual-constraint", sourceTables: ["SYSTEM_POLICY", "OPTICS"] },
  { fieldKey: "cct", label: "CCT", role: "manual-constraint", sourceTables: ["BOARDS", "OPTICS", "SYSTEM_POLICY"] },
  { fieldKey: "optic", label: "Optic", role: "manual-constraint", sourceTables: ["OPTICS"] },
  { fieldKey: "controlType", label: "Control type", role: "manual-constraint", sourceTables: ["DRIVERS", "SYSTEM_POLICY"] },
  { fieldKey: "driver", label: "Driver / control consequence", role: "auto-consequence", sourceTables: ["DRIVERS"] },
  { fieldKey: "ipRating", label: "IP", role: "manual-constraint", sourceTables: ["OPTICS", "SYSTEM_POLICY"] },
  { fieldKey: "ikRating", label: "IK", role: "manual-constraint", sourceTables: ["OPTICS", "SYSTEM_POLICY"] },
  { fieldKey: "mountStyle", label: "Mounting", role: "manual-constraint", sourceTables: ["ACCESSORIES", "SYSTEM_POLICY"] },
  { fieldKey: "bodyFinish", label: "Finish", role: "manual-constraint", sourceTables: ["ACCESSORIES", "SYSTEM_POLICY"] },
  { fieldKey: "emergency", label: "Emergency", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
  { fieldKey: "sensor", label: "Sensor", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
  { fieldKey: "specialParts", label: "Accessories / special parts", role: "auto-consequence", sourceTables: ["ACCESSORIES", "SYSTEM_COMPONENTS"] },
]);

const TARGET_FIELD_KEYS = new Set(TARGET_FIELDS.map((field) => field.fieldKey));

const TABLE_ALIASES = Object.freeze({
  SYSTEM: ["SYSTEM", "SYSTEMS", "system", "systems"],
  OPTICS: ["OPTICS", "OPTIC", "optics", "optic"],
  ACCESSORIES: ["ACCESSORIES", "ACCESSORY", "accessories", "accessory"],
  SPEC_CODES: ["SPEC_CODES", "spec_codes", "specCodes"],
  BOARDS: ["BOARDS", "BOARD", "boards", "board"],
  DRIVERS: ["DRIVERS", "DRIVER", "drivers", "driver"],
  PURE_REF_STATE: ["PURE_REF_STATE", "pure_ref_state", "pureRefState"],
  SYSTEM_COMPONENTS: ["SYSTEM_COMPONENTS", "system_components", "systemComponents"],
  SYSTEM_BOM_DEFAULTS: ["SYSTEM_BOM_DEFAULTS", "system_bom_defaults", "systemBomDefaults"],
  SYSTEM_POLICY: ["SYSTEM_POLICY", "system_policy", "systemPolicy"],
  FIELD_EDITABILITY: ["FIELD_EDITABILITY", "field_editability", "fieldEditability"],
  ROLES_AND_LANES: ["ROLES_AND_LANES", "roles_and_lanes", "rolesAndLanes"],
  CODE_POLICY: ["CODE_POLICY", "code_policy", "codePolicy"],
  MESSAGES: ["MESSAGES", "messages"],
  USERS: ["USERS", "users"],
});

const SNAPSHOT_CONTAINER_KEYS = Object.freeze([
  "data",
  "novondb",
  "novonDb",
  "novon_db",
  "tables",
  "sheets",
  "snapshot",
  "activeSnapshot",
  "authorityReference",
]);

const ROW_CONTAINER_KEYS = Object.freeze([
  "rows",
  "data",
  "values",
  "records",
  "items",
  "tableRows",
]);

const HEADER_CONTAINER_KEYS = Object.freeze([
  "headers",
  "header",
  "columns",
  "fields",
]);

const SAFE_DEBUG_TABLES = Object.freeze([
  "SYSTEM",
  "OPTICS",
  "BOARDS",
  "DRIVERS",
  "ACCESSORIES",
  "SYSTEM_POLICY",
  "SYSTEM_COMPONENTS",
]);

const SAFE_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  optionFilteringReadOnly: true,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  rawLabEvidenceExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  activeResolverEnabled: false,
  selectorResolvingEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  iesGenerationEnabled: false,
  payloadGenerationEnabled: false,
  runTableGenerationEnabled: false,
  drawingGenerationEnabled: false,
  labProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  rregApprovalEnabled: false,
  rregCustodyTransferEnabled: false,
  runtimeDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
});

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function safeString(value) {
  return String(value ?? "").trim();
}

function safeLower(value) {
  return safeString(value).toLowerCase();
}

function normaliseKey(value) {
  return safeLower(value)
    .replace(/[\s_./-]+/g, " ")
    .replace(/[^a-z0-9|+ ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fieldValue(row, key) {
  if (!isPlainObject(row)) return "";
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  const wanted = normaliseKey(key);
  const actualKey = Object.keys(row).find((candidate) => normaliseKey(candidate) === wanted);
  return actualKey ? row[actualKey] : "";
}

function rowText(row, keys, fallback = "") {
  for (const key of keys) {
    const value = safeString(fieldValue(row, key));
    if (value) return value;
  }
  return fallback;
}

function splitOptions(value) {
  return safeString(value)
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const label = safeString(value);
    const key = normaliseKey(label);
    if (!label || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

function headerName(header, index) {
  if (typeof header === "string") return safeString(header) || `column_${index + 1}`;
  if (isPlainObject(header)) return rowText(header, ["name", "key", "field", "id", "label"], `column_${index + 1}`);
  return `column_${index + 1}`;
}

function safeHeaders(headers = []) {
  if (!Array.isArray(headers)) return [];
  return headers.map(headerName).filter(Boolean);
}

function looksLikeHeaderRow(row = []) {
  if (!Array.isArray(row) || !row.length) return false;
  const textCells = row.filter((cell) => typeof cell === "string" && safeString(cell));
  return textCells.length >= Math.max(1, Math.floor(row.length * 0.6));
}

function objectFromArrayRow(row = [], headers = []) {
  const safe = safeHeaders(headers);
  const activeHeaders = safe.length ? safe : row.map((_, index) => `column_${index + 1}`);
  return Object.fromEntries(activeHeaders.map((header, index) => [header, row[index] ?? ""]));
}

function normaliseRowsFromArray(value = [], explicitHeaders = []) {
  if (!Array.isArray(value)) return [];
  if (!value.length) return [];
  if (value.every(isPlainObject)) return value;
  if (!value.every(Array.isArray)) return [];

  const headers = safeHeaders(explicitHeaders);
  const firstRowHeaders = headers.length ? headers : looksLikeHeaderRow(value[0]) ? safeHeaders(value[0]) : [];
  const dataRows = firstRowHeaders.length && !headers.length ? value.slice(1) : value;
  return dataRows.map((row) => objectFromArrayRow(row, firstRowHeaders)).filter(isPlainObject);
}

function nestedValue(value, keys = []) {
  if (!isPlainObject(value)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) return value[key];
  }
  const wanted = keys.map(normaliseKey);
  const actualKey = Object.keys(value).find((candidate) => wanted.includes(normaliseKey(candidate)));
  return actualKey ? value[actualKey] : undefined;
}

function normaliseTableRows(value) {
  if (Array.isArray(value)) return normaliseRowsFromArray(value);
  if (!isPlainObject(value)) return [];

  const headers = safeHeaders(nestedValue(value, HEADER_CONTAINER_KEYS));
  const rowValue = nestedValue(value, ROW_CONTAINER_KEYS);
  if (Array.isArray(rowValue)) return normaliseRowsFromArray(rowValue, headers);

  if (Array.isArray(value.values)) return normaliseRowsFromArray(value.values, headers);
  return [];
}

function collectSnapshotContainers(value, depth = 0, seen = new Set()) {
  if (!isPlainObject(value) && !Array.isArray(value)) return [];
  if (seen.has(value) || depth > 3) return [];
  seen.add(value);

  const containers = [value];
  if (isPlainObject(value)) {
    for (const key of SNAPSHOT_CONTAINER_KEYS) {
      const child = nestedValue(value, [key]);
      if (isPlainObject(child) || Array.isArray(child)) {
        containers.push(...collectSnapshotContainers(child, depth + 1, seen));
      }
    }
  }
  return containers;
}

function tableNameMatches(candidate, tableName) {
  const aliases = TABLE_ALIASES[tableName] || [tableName];
  const wanted = aliases.map(normaliseKey);
  return wanted.includes(normaliseKey(candidate));
}

function tableValueCandidates(snapshot, tableName) {
  const candidates = [];
  for (const container of collectSnapshotContainers(snapshot)) {
    if (isPlainObject(container)) {
      for (const [key, value] of Object.entries(container)) {
        if (tableNameMatches(key, tableName)) candidates.push(value);
      }
      for (const key of ["tables", "sheets"]) {
        const tableList = nestedValue(container, [key]);
        if (!Array.isArray(tableList)) continue;
        for (const item of tableList) {
          if (!isPlainObject(item)) continue;
          const name = rowText(item, ["name", "table", "tableName", "sheet", "sheetName", "id", "key"]);
          if (tableNameMatches(name, tableName)) candidates.push(item);
        }
      }
    }
    if (Array.isArray(container)) {
      for (const item of container) {
        if (!isPlainObject(item)) continue;
        const name = rowText(item, ["name", "table", "tableName", "sheet", "sheetName", "id", "key"]);
        if (tableNameMatches(name, tableName)) candidates.push(item);
      }
    }
  }
  return candidates;
}

function tableRows(snapshot, tableName) {
  const rows = [];
  for (const candidate of tableValueCandidates(snapshot, tableName)) {
    rows.push(...normaliseTableRows(candidate));
  }
  return rows;
}

function sourceRowIsLive(row) {
  const approved = safeLower(rowText(row, ["approved"], "yes"));
  const status = safeLower(rowText(row, ["status", "lifecycle_status", "product_status"], "available"));
  return !["false", "no", "0"].includes(approved) && !["retired", "obsolete", "deleted", "inactive"].includes(status);
}

function liveTableRows(snapshot, tableName) {
  return tableRows(snapshot, tableName).filter(sourceRowIsLive);
}

function optionValue(label, fallback = "") {
  const cleaned = safeString(label || fallback);
  return cleaned || safeString(fallback);
}

function createOption(label, { value = label, sourceTables = [], count = 1 } = {}) {
  const optionLabel = safeString(label || value);
  return {
    value: optionValue(value || optionLabel),
    label: optionLabel,
    count,
    sourceStatus: "db-reference-backed",
    sourceTables: uniqueStrings(sourceTables),
    rawRowsExposed: false,
  };
}

function addOption(bucket, fieldKey, label, meta = {}) {
  if (!label) return;
  if (!bucket[fieldKey]) bucket[fieldKey] = new Map();
  const value = optionValue(meta.value || label);
  const key = normaliseKey(value);
  if (!key) return;
  const existing = bucket[fieldKey].get(key);
  if (existing) {
    existing.count += meta.count || 1;
    existing.sourceTables = uniqueStrings([...(existing.sourceTables || []), ...(meta.sourceTables || [])]);
    return;
  }
  bucket[fieldKey].set(key, createOption(label, { ...meta, value }));
}

function optionsFor(bucket, fieldKey) {
  return Array.from(bucket[fieldKey]?.values?.() || []).sort((left, right) => left.label.localeCompare(right.label));
}

function systemTokens(row) {
  const system = rowText(row, ["system", "series", "system_name", "prepend_d"]);
  const variant = rowText(row, ["system_variant_1", "variant", "family", "profile_family"]);
  const label = rowText(row, ["label", "name", "display_name"], [system, variant].filter(Boolean).join(" "));
  const value = rowText(row, ["system_id", "system_key", "key", "id"], [system, variant].filter(Boolean).join("|") || label);
  return { system, variant, label: label || value, value: value || label };
}

function systemOptionFromOpticRow(systemOptions, opticRow) {
  const rowSystem = normaliseKey(rowText(opticRow, ["system", "series", "system_name", "system_key"]));
  if (!rowSystem) return null;
  return systemOptions.find((option) => {
    const haystack = [option.value, option.label].map(normaliseKey);
    return haystack.some((value) => value === rowSystem || value.includes(rowSystem) || rowSystem.includes(value));
  }) || null;
}

function extractCctValues(row) {
  const explicit = [
    "cct",
    "cct_options",
    "cct_option",
    "colour_temperature",
    "color_temperature",
    "led_cct",
    "cct_k",
    "kelvin",
    "cct_cri",
  ].flatMap((key) => splitOptions(fieldValue(row, key)));
  const fromText = explicit.flatMap((value) => {
    const matches = safeString(value).match(/\b(?:22|27|30|35|40|50|57|60|65)00\s*K?\b/gi) || [];
    if (matches.length) return matches.map((match) => match.replace(/\s+/g, "").replace(/K?$/i, "K"));
    return value ? [value] : [];
  });
  return uniqueStrings(fromText.map((value) => {
    const compact = safeString(value).replace(/\s+/g, "");
    return /^\d{4}$/i.test(compact) ? `${compact}K` : compact;
  }));
}

function rowOptionValues(row, keys) {
  return uniqueStrings(keys.flatMap((key) => splitOptions(fieldValue(row, key))));
}

function policyRowsMatching(snapshot, needles) {
  const wanted = needles.map(normaliseKey).filter(Boolean);
  return liveTableRows(snapshot, "SYSTEM_POLICY").filter((row) => {
    const haystack = [
      rowText(row, ["category", "item", "eng_lever_fields", "field", "field_key", "name", "label"]),
      rowText(row, ["description", "notes", "helper_text"]),
    ].join(" ");
    const normalised = normaliseKey(haystack);
    return wanted.some((needle) => normalised.includes(needle));
  });
}

function policyValues(snapshot, needles) {
  const rows = policyRowsMatching(snapshot, needles);
  return uniqueStrings(rows.flatMap((row) => [
    rowText(row, ["display_choice", "label", "name"]),
    ...rowOptionValues(row, ["value", "values", "item", "economy", "business", "first", "charter", "options", "allowed_values"]),
  ])).filter((value) => !needles.map(normaliseKey).includes(normaliseKey(value)));
}

function accessoryRowsMatching(snapshot, needles) {
  const wanted = needles.map(normaliseKey).filter(Boolean);
  return liveTableRows(snapshot, "ACCESSORIES").filter((row) => {
    const haystack = [
      rowText(row, ["accessory_type", "type", "category", "group", "item", "name", "label", "display_choice"]),
      rowText(row, ["accessory_id", "part_number", "sku", "description", "notes"]),
    ].join(" ");
    const normalised = normaliseKey(haystack);
    return wanted.some((needle) => normalised.includes(needle));
  });
}

function accessoryLabels(snapshot, needles) {
  return uniqueStrings(accessoryRowsMatching(snapshot, needles).map((row) => rowText(row, [
    "display_choice",
    "label",
    "name",
    "accessory_id",
    "part_number",
    "sku",
    "description",
  ])));
}

function collectOptions(snapshot) {
  const bucket = {};
  const systems = liveTableRows(snapshot, "SYSTEM");
  for (const row of systems) {
    const tokens = systemTokens(row);
    addOption(bucket, "system", tokens.label, { value: tokens.value, sourceTables: ["SYSTEM"] });
  }

  const optics = liveTableRows(snapshot, "OPTICS");
  for (const row of optics) {
    const optic = rowText(row, ["optic_var_1", "baseline_slug", "pure_ref_id", "optic_bom_id", "spec_code", "name", "label"]);
    const system = rowText(row, ["system", "series", "system_name"]);
    const opticLabel = [optic, system].filter(Boolean).join(" · ") || optic;
    addOption(bucket, "optic", opticLabel, { value: [system, optic].filter(Boolean).join("|") || opticLabel, sourceTables: ["OPTICS"] });
    for (const ip of rowOptionValues(row, ["ip_option_1", "ip_options", "ip", "ip_rating"])) addOption(bucket, "ipRating", ip, { sourceTables: ["OPTICS"] });
    for (const ik of rowOptionValues(row, ["ik_option_2", "ik_options", "ik", "ik_rating"])) addOption(bucket, "ikRating", ik, { sourceTables: ["OPTICS"] });
    for (const cct of extractCctValues(row)) addOption(bucket, "cct", cct, { sourceTables: ["OPTICS"] });
    for (const env of rowOptionValues(row, ["environment", "application", "application_environment"])) addOption(bucket, "application", env, { sourceTables: ["OPTICS"] });
    for (const io of rowOptionValues(row, ["interior_exterior", "interiorExterior", "indoor_outdoor", "location_type"])) addOption(bucket, "interiorExterior", io, { sourceTables: ["OPTICS"] });
  }

  const boards = liveTableRows(snapshot, "BOARDS");
  for (const row of boards) {
    for (const cct of extractCctValues(row)) addOption(bucket, "cct", cct, { sourceTables: ["BOARDS"] });
  }

  const drivers = liveTableRows(snapshot, "DRIVERS");
  for (const row of drivers) {
    const driver = rowText(row, ["driver_id", "driver", "driver_name", "name", "label", "sku", "part_number"]);
    if (driver) addOption(bucket, "driver", driver, { sourceTables: ["DRIVERS"] });
    for (const control of rowOptionValues(row, ["control_type", "control", "protocol", "dimming", "dimming_type", "driver_control", "control_protocol"])) {
      addOption(bucket, "controlType", control, { sourceTables: ["DRIVERS"] });
    }
  }

  for (const value of policyValues(snapshot, ["application", "environment", "use case", "area type"])) addOption(bucket, "application", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["interior exterior", "indoor outdoor", "location type"])) addOption(bucket, "interiorExterior", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["cct", "colour temperature", "color temperature"])) addOption(bucket, "cct", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["control", "dimming", "protocol"])) addOption(bucket, "controlType", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["ip", "ingress protection"])) addOption(bucket, "ipRating", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["ik", "impact rating"])) addOption(bucket, "ikRating", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["mount", "mounting", "suspension", "recessed", "surface"])) addOption(bucket, "mountStyle", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["finish", "colour", "color", "paint"])) addOption(bucket, "bodyFinish", value, { sourceTables: ["SYSTEM_POLICY"] });

  for (const value of accessoryLabels(snapshot, ["mount", "mounting", "suspension", "recessed", "surface"])) addOption(bucket, "mountStyle", value, { sourceTables: ["ACCESSORIES"] });
  for (const value of accessoryLabels(snapshot, ["finish", "colour", "color", "paint"])) addOption(bucket, "bodyFinish", value, { sourceTables: ["ACCESSORIES"] });
  for (const value of accessoryLabels(snapshot, ["emergency", "egress"] )) addOption(bucket, "emergency", value, { sourceTables: ["ACCESSORIES"] });
  for (const value of accessoryLabels(snapshot, ["sensor", "pir", "microwave", "occupancy"] )) addOption(bucket, "sensor", value, { sourceTables: ["ACCESSORIES"] });
  for (const value of accessoryLabels(snapshot, ["accessory", "special", "kit", "end kit", "suspension", "emergency", "sensor"] )) addOption(bucket, "specialParts", value, { sourceTables: ["ACCESSORIES"] });

  return bucket;
}

function collectRecords(snapshot, bucket) {
  const records = [];
  const systemOptions = optionsFor(bucket, "system");

  for (const row of liveTableRows(snapshot, "OPTICS")) {
    const systemOption = systemOptionFromOpticRow(systemOptions, row);
    const optic = rowText(row, ["optic_var_1", "baseline_slug", "pure_ref_id", "optic_bom_id", "spec_code", "name", "label"]);
    const system = rowText(row, ["system", "series", "system_name"]);
    const opticValue = [system, optic].filter(Boolean).join("|") || optic;
    const fields = {};
    if (systemOption) fields.system = [systemOption.value];
    if (opticValue) fields.optic = [opticValue];
    const ips = rowOptionValues(row, ["ip_option_1", "ip_options", "ip", "ip_rating"]);
    const iks = rowOptionValues(row, ["ik_option_2", "ik_options", "ik", "ik_rating"]);
    const ccts = extractCctValues(row);
    if (ips.length) fields.ipRating = ips;
    if (iks.length) fields.ikRating = iks;
    if (ccts.length) fields.cct = ccts;
    const io = rowOptionValues(row, ["interior_exterior", "interiorExterior", "indoor_outdoor", "location_type"]);
    if (io.length) fields.interiorExterior = io;
    const app = rowOptionValues(row, ["environment", "application", "application_environment"]);
    if (app.length) fields.application = app;
    if (Object.keys(fields).length > 1) records.push({ sourceTables: ["OPTICS"], fields });
  }

  for (const row of liveTableRows(snapshot, "DRIVERS")) {
    const fields = {};
    const driver = rowText(row, ["driver_id", "driver", "driver_name", "name", "label", "sku", "part_number"]);
    const control = rowOptionValues(row, ["control_type", "control", "protocol", "dimming", "dimming_type", "driver_control", "control_protocol"]);
    if (driver) fields.driver = [driver];
    if (control.length) fields.controlType = control;
    if (Object.keys(fields).length > 1) records.push({ sourceTables: ["DRIVERS"], fields });
  }

  return records;
}

function valuesMatch(left, right) {
  return normaliseKey(left) === normaliseKey(right);
}

function recordMatchesConstraints(record, constraints, exceptFieldKey = "") {
  for (const [fieldKey, selected] of Object.entries(constraints)) {
    if (fieldKey === exceptFieldKey || !safeString(selected)) continue;
    const values = Array.isArray(record.fields?.[fieldKey]) ? record.fields[fieldKey] : [];
    if (values.length && !values.some((value) => valuesMatch(value, selected))) return false;
  }
  return true;
}

function optionAllowedByRecords(fieldKey, option, records, constraints) {
  const relatedRecords = records.filter((record) => Array.isArray(record.fields?.[fieldKey]) && record.fields[fieldKey].some((value) => valuesMatch(value, option.value)));
  if (!relatedRecords.length) return true;
  return relatedRecords.some((record) => recordMatchesConstraints(record, constraints, fieldKey));
}

function sanitiseConstraints(constraints = {}) {
  if (!isPlainObject(constraints)) return {};
  return Object.fromEntries(Object.entries(constraints)
    .map(([fieldKey, value]) => [fieldKey, safeString(value)])
    .filter(([fieldKey, value]) => TARGET_FIELD_KEYS.has(fieldKey) && value));
}

function createUnavailableField(field, reason) {
  return {
    fieldKey: field.fieldKey,
    label: field.label,
    role: field.role,
    status: "future-mapped",
    sourceStatus: "unavailable from current source",
    sourceTables: [...field.sourceTables],
    options: [],
    selectedValue: "",
    selectedLabel: "",
    unavailableReason: reason,
    futureMapped: true,
    rawRowsExposed: false,
  };
}

function labelForValue(options, value) {
  const option = options.find((item) => valuesMatch(item.value, value));
  return option?.label || safeString(value);
}

function createFields({ bucket, records, constraints, sourceReady }) {
  return TARGET_FIELDS.map((field) => {
    const baseOptions = optionsFor(bucket, field.fieldKey);
    const selectedValue = constraints[field.fieldKey] || "";
    if (!sourceReady) return createUnavailableField(field, "Selector Reference source is unavailable or not parseable.");
    if (!baseOptions.length) return createUnavailableField(field, `${field.label} is unavailable from current source and remains future mapped; no fake values emitted.`);

    const options = baseOptions.map((option) => {
      const compatible = optionAllowedByRecords(field.fieldKey, option, records, constraints);
      const selected = selectedValue && valuesMatch(option.value, selectedValue);
      return {
        ...option,
        selected: Boolean(selected),
        status: compatible ? "available" : "blocked",
        blocked: !compatible,
        blockedReason: compatible ? "" : "Blocked by current manual constraints; shown rather than silently hidden.",
      };
    });

    if (selectedValue && !options.some((option) => valuesMatch(option.value, selectedValue))) {
      options.push({
        value: selectedValue,
        label: selectedValue,
        count: 0,
        sourceStatus: "selected constraint not available from current filtered source",
        sourceTables: [...field.sourceTables],
        selected: true,
        status: "blocked",
        blocked: true,
        blockedReason: "Manual constraint is preserved but unavailable/incompatible in the current filtered source.",
        rawRowsExposed: false,
      });
    }

    const availableCount = options.filter((option) => option.status === "available").length;
    return {
      fieldKey: field.fieldKey,
      label: field.label,
      role: field.role,
      status: availableCount ? "available" : "blocked",
      sourceStatus: "db-reference-backed",
      sourceTables: [...field.sourceTables],
      options,
      selectedValue,
      selectedLabel: selectedValue ? labelForValue(options, selectedValue) : "",
      unavailableReason: availableCount ? "" : "No compatible options remain under the current manual constraints; values are shown as blocked rather than removed.",
      futureMapped: false,
      rawRowsExposed: false,
    };
  });
}

function firstAvailable(fields, fieldKey, predicate = () => true) {
  const field = fields.find((item) => item.fieldKey === fieldKey);
  return field?.options?.find((option) => option.status === "available" && predicate(option)) || null;
}

function deriveAutoConsequences(fields, constraints) {
  const consequences = [];
  if (!constraints.driver) {
    const controlNeedle = normaliseKey(constraints.controlType || "");
    const driver = firstAvailable(fields, "driver", (option) => {
      const key = normaliseKey(`${option.label} ${option.value}`);
      if (controlNeedle.includes("dali")) return key.includes("dali") || key.includes("dt8");
      if (controlNeedle.includes("non") || controlNeedle.includes("switch")) return key.includes("switch") || key.includes("non") || key.includes("standard");
      return true;
    });
    if (driver) {
      consequences.push({
        fieldKey: "driver",
        label: "Driver / control consequence",
        value: driver.value,
        valueLabel: driver.label,
        kind: "auto-consequence",
        source: "safe Selector Reference option adapter",
        reason: constraints.controlType ? "consequence of current control type manual constraint" : "first available DB/reference-backed driver consequence preview",
        mutable: true,
        writes: false,
      });
    }
  }

  if (!constraints.specialParts) {
    const special = firstAvailable(fields, "specialParts", (option) => {
      const key = normaliseKey(`${option.label} ${option.value}`);
      if (constraints.emergency) return key.includes("emergency") || key.includes("egress");
      if (constraints.sensor) return key.includes("sensor") || key.includes("pir") || key.includes("occupancy");
      if (normaliseKey(constraints.ipRating).includes("ip65")) return key.includes("ip65") || key.includes("end") || key.includes("kit");
      if (normaliseKey(constraints.mountStyle).includes("suspend")) return key.includes("suspend") || key.includes("wire") || key.includes("kit");
      return true;
    });
    if (special) {
      consequences.push({
        fieldKey: "specialParts",
        label: "Accessories / special parts",
        value: special.value,
        valueLabel: special.label,
        kind: "auto-consequence",
        source: "safe Selector Reference option adapter",
        reason: "consequence of current IP, mounting, emergency, and sensor constraints where mapped",
        mutable: true,
        writes: false,
      });
    }
  }

  return consequences;
}

function createManualConstraintList(fields, constraints) {
  return Object.entries(constraints).map(([fieldKey, value]) => {
    const field = fields.find((item) => item.fieldKey === fieldKey);
    const option = field?.options?.find((item) => valuesMatch(item.value, value));
    return {
      fieldKey,
      label: field?.label || fieldKey,
      value,
      valueLabel: option?.label || value,
      kind: "manual-constraint",
      source: "module-local UI constraint over safe Selector Reference options",
      status: option?.status || "selected",
      blocked: option?.blocked === true,
      reason: option?.blockedReason || "manual selection is treated as a durable constraint",
      mutable: true,
      writes: false,
    };
  });
}

function blockedItems(fields) {
  const blocked = [];
  for (const field of fields) {
    if (field.futureMapped) {
      blocked.push({ fieldKey: field.fieldKey, label: field.label, status: "future-mapped", reason: field.unavailableReason });
      continue;
    }
    for (const option of field.options || []) {
      if (option.selected && option.blocked) {
        blocked.push({ fieldKey: field.fieldKey, label: field.label, value: option.value, valueLabel: option.label, status: "blocked", reason: option.blockedReason });
      }
    }
    if (field.status === "blocked" && !(field.options || []).some((option) => option.selected)) {
      blocked.push({ fieldKey: field.fieldKey, label: field.label, status: "blocked", reason: field.unavailableReason });
    }
  }
  return blocked;
}

function tableSummary(snapshot) {
  return TARGET_FIELDS.flatMap((field) => field.sourceTables).filter((value, index, values) => values.indexOf(value) === index).map((table) => {
    const rows = tableRows(snapshot, table);
    return {
      table,
      present: tableValueCandidates(snapshot, table).length > 0,
      rowCount: rows.length,
      rawRowsExposed: false,
      rawHeadersExposed: false,
      headersReturned: false,
    };
  });
}

function sourceShapeSummary(snapshot) {
  return SAFE_DEBUG_TABLES.map((table) => ({
    table,
    candidateContainers: tableValueCandidates(snapshot, table).length,
    normalisedRowCount: tableRows(snapshot, table).length,
  }));
}

function sourceMetadata({ sourceStat = null, present = Boolean(sourceStat), readable = false, parseable = false } = {}) {
  const isFile = Boolean(sourceStat?.isFile?.());
  return {
    label: "runtime-authority-reference-active-snapshot",
    present: Boolean(present && isFile),
    readable: Boolean(readable && isFile),
    parseable: Boolean(parseable),
    modifiedTime: sourceStat?.mtime?.toISOString?.() || null,
    fileSize: sourceStat?.size ?? null,
  };
}

function failurePayload({ source = {}, reason = "selector_reference_options_unavailable", constraints = {} } = {}) {
  const safeConstraints = sanitiseConstraints(constraints);
  const fields = TARGET_FIELDS.map((field) => createUnavailableField(field, reason));
  return {
    ok: false,
    endpoint: SELECTOR_REFERENCE_OPTIONS_PATH,
    owner: "runtime-server",
    status: "source-unavailable",
    source,
    sourceReady: false,
    selectedConstraints: safeConstraints,
    fields,
    manualConstraints: [],
    autoConsequences: [],
    blockedItems: blockedItems(fields),
    candidateSummary: {
      state: "source unavailable",
      optionFieldCount: 0,
      availableFieldCount: 0,
      manualConstraintCount: Object.keys(safeConstraints).length,
      autoConsequenceCount: 0,
      blockedCount: fields.length,
      specGateComplete: false,
      labProof: false,
      writesEnabled: false,
    },
    pathToSpecReady: [
      "Connect a readable active authority-reference snapshot.",
      "Map missing fields before they can participate in spec-ready later.",
      "Lab Proof remains required later.",
    ],
    tableSummary: [],
    sourceShapeSummary: [],
    warnings: [reason],
    ...SAFE_FLAGS,
  };
}

export function deriveSelectorReferenceOptionsFromSnapshot(snapshot = {}, { constraints = {}, source = {}, ok = true } = {}) {
  const safeSnapshot = isPlainObject(snapshot) ? snapshot : {};
  const safeConstraints = sanitiseConstraints(constraints);
  const sourceReady = ok !== false && (source.readable !== false) && (source.parseable !== false);
  if (!sourceReady) return failurePayload({ source, reason: "Selector Reference source is unavailable or not parseable.", constraints: safeConstraints });

  const bucket = collectOptions(safeSnapshot);
  const records = collectRecords(safeSnapshot, bucket);
  const fields = createFields({ bucket, records, constraints: safeConstraints, sourceReady });
  const manualConstraints = createManualConstraintList(fields, safeConstraints);
  const autoConsequences = deriveAutoConsequences(fields, safeConstraints);
  const blocked = blockedItems(fields);
  const availableFieldCount = fields.filter((field) => field.status === "available").length;
  const optionFieldCount = fields.filter((field) => field.options.length).length;
  const hasMissing = fields.some((field) => field.futureMapped);
  const hasBlocked = blocked.length > 0;

  return {
    ok: true,
    endpoint: SELECTOR_REFERENCE_OPTIONS_PATH,
    owner: "runtime-server",
    status: hasBlocked || hasMissing ? "preview-with-blockers" : "preview-ready",
    source,
    sourceReady: true,
    selectedConstraints: safeConstraints,
    fields,
    manualConstraints,
    autoConsequences,
    blockedItems: blocked,
    candidateSummary: {
      state: manualConstraints.length ? (hasBlocked ? "manual constraints with blockers" : "manual constraints preview") : "default preview",
      optionFieldCount,
      availableFieldCount,
      manualConstraintCount: manualConstraints.length,
      autoConsequenceCount: autoConsequences.length,
      blockedCount: blocked.length,
      specGateComplete: false,
      labProof: false,
      writesEnabled: false,
    },
    pathToSpecReady: [
      "Complete DB/reference field mapping for all required Selector fields.",
      "Keep manual selections as constraints and auto selections as consequences.",
      "Future spec gate must complete before slug/spec generation can exist.",
      "Lab Proof proves later; this preview does not prove.",
    ],
    tableSummary: tableSummary(safeSnapshot),
    sourceShapeSummary: sourceShapeSummary(safeSnapshot),
    warnings: [
      ...(hasMissing ? ["Some fields are unavailable from the current source and are future-mapped, not faked."] : []),
      ...(hasBlocked ? ["Some options are blocked/missing under current constraints and are shown rather than silently hidden."] : []),
      "Selector previews selection readiness. Lab Proof proves later.",
    ],
    ...SAFE_FLAGS,
  };
}

export async function buildSelectorReferenceOptions({ sourcePath, fsApi = DEFAULT_FS_API, constraints = {} } = {}) {
  if (!sourcePath) {
    return failurePayload({ reason: "Selector Reference options source path is not configured.", constraints });
  }

  let sourceStat = null;
  try {
    sourceStat = await fsApi.stat(sourcePath);
    const text = await fsApi.readFile(sourcePath, "utf-8");
    const snapshot = JSON.parse(text);
    const parseable = isPlainObject(snapshot);
    const source = sourceMetadata({ sourceStat, present: true, readable: true, parseable });
    if (!parseable) return failurePayload({ source, reason: "Selector Reference options source parsed but did not contain a table object.", constraints });
    return deriveSelectorReferenceOptionsFromSnapshot(snapshot, { constraints, source, ok: true });
  } catch (error) {
    const source = sourceMetadata({ sourceStat, present: Boolean(sourceStat), readable: error?.name === "SyntaxError", parseable: false });
    return failurePayload({ source, reason: error?.code || error?.message || "Selector Reference options source could not be read.", constraints });
  }
}
