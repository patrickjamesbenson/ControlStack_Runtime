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
  { fieldKey: "egressLight", label: "Egress light", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
  { fieldKey: "egressSound", label: "EWIS / sound", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
  { fieldKey: "sensor", label: "Sensor", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
  { fieldKey: "accessories", label: "Accessories", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
  { fieldKey: "specialParts", label: "Accessories / special parts", role: "auto-consequence", sourceTables: ["ACCESSORIES", "SYSTEM_COMPONENTS"] },
]);

const WORKFLOW_SECTION_DEFINITIONS = Object.freeze([
  {
    sectionKey: "system",
    title: "System",
    fields: [
      { fieldKey: "tier", label: "Tier", role: "manual-constraint", sourceTables: ["TIERS", "SYSTEM_POLICY"] },
      { fieldKey: "system", label: "System", role: "manual-constraint", sourceTables: ["SYSTEM"] },
      { fieldKey: "variantKey", label: "Variant", role: "auto-consequence", sourceTables: ["SYSTEM"] },
      { fieldKey: "emission", label: "Emission / direct-indirect mode", role: "manual-constraint", sourceTables: ["SYSTEM"] },
      { fieldKey: "directCapability", label: "Direct capability", role: "auto-consequence", sourceTables: ["SYSTEM", "OPTICS"] },
      { fieldKey: "indirectCapability", label: "Indirect capability", role: "auto-consequence", sourceTables: ["SYSTEM", "OPTICS"] },
    ],
  },
  {
    sectionKey: "optics",
    title: "Optics / Diffusers",
    fields: [
      { fieldKey: "diffuserVar1", label: "Diffuser / optic var 1", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "diffuserVar2", label: "Diffuser / optic var 2", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "diffuserMaterial", label: "Diffuser material", role: "metadata-only", sourceTables: ["OPTICS"] },
      { fieldKey: "diffuserSpecCodePreview", label: "Spec-code preview", role: "metadata-only", sourceTables: ["OPTICS", "SPEC_CODES"] },
      { fieldKey: "diffuserImageReadiness", label: "Image readiness", role: "metadata-only", sourceTables: ["OPTICS"] },
      { fieldKey: "directOpticVar1", label: "Direct diffuser / optic var 1", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "directOpticVar2", label: "Direct diffuser / optic var 2", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "indirectOpticVar1", label: "Indirect diffuser / optic var 1", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "indirectOpticVar2", label: "Indirect diffuser / optic var 2", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "optic", label: "Direct optic compatibility alias", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "opticSub", label: "Direct optic var 2 compatibility alias", role: "manual-constraint", sourceTables: ["OPTICS"] },
      { fieldKey: "opticIndirect", label: "Indirect optic compatibility alias", role: "manual-constraint", sourceTables: ["OPTICS"] },
    ],
  },
  {
    sectionKey: "environment",
    title: "Environment",
    fields: [
      { fieldKey: "ipRating", label: "IP rating", role: "manual-constraint", sourceTables: ["OPTICS", "SYSTEM_POLICY"] },
      { fieldKey: "ikRating", label: "IK rating", role: "manual-constraint", sourceTables: ["OPTICS", "SYSTEM_POLICY"] },
      { fieldKey: "electricalClass", label: "Electrical class", role: "manual-constraint", sourceTables: ["TIERS", "ACCESSORIES", "SYSTEM_POLICY"] },
      { fieldKey: "ambient", label: "Ambient temperature", role: "manual-constraint", sourceTables: ["SYSTEM_POLICY"] },
      { fieldKey: "application", label: "Application / environment", role: "manual-constraint", sourceTables: ["OPTICS", "SYSTEM_POLICY"] },
      { fieldKey: "interiorExterior", label: "Interior / exterior", role: "manual-constraint", sourceTables: ["OPTICS", "SYSTEM_POLICY"] },
    ],
  },
  {
    sectionKey: "lightControl",
    title: "Light & Control",
    fields: [
      { fieldKey: "targetLmPerM", label: "Direct lm/m", role: "manual-constraint", sourceTables: ["BOARDS"] },
      { fieldKey: "cctCri", label: "Direct paired CCT/CRI", role: "manual-constraint", sourceTables: ["BOARDS"] },
      { fieldKey: "controlType", label: "Direct control protocol", role: "manual-constraint", sourceTables: ["BOARDS", "DRIVERS", "SYSTEM_POLICY"] },
      { fieldKey: "indirectMatchDirect", label: "Indirect match-direct", role: "inherited-consequence", sourceTables: ["SYSTEM", "OPTICS"] },
      { fieldKey: "targetLmPerMIndirect", label: "Indirect lm/m", role: "manual-constraint", sourceTables: ["BOARDS"] },
      { fieldKey: "cctCriIndirect", label: "Indirect paired CCT/CRI", role: "manual-constraint", sourceTables: ["BOARDS"] },
      { fieldKey: "controlTypeIndirect", label: "Indirect control protocol", role: "manual-constraint", sourceTables: ["BOARDS", "DRIVERS"] },
      { fieldKey: "driver", label: "Driver consequence", role: "auto-consequence", sourceTables: ["DRIVERS"] },
      { fieldKey: "lexWeight", label: "Lex weight", role: "metadata-only", sourceTables: ["BOARDS"] },
    ],
  },
  {
    sectionKey: "mounting",
    title: "Mounting",
    fields: [
      { fieldKey: "mountStyle", label: "Mount style", role: "manual-constraint", sourceTables: ["SYSTEM", "ACCESSORIES", "SYSTEM_POLICY"] },
      { fieldKey: "mountSelection", label: "Mount selection", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "mountParticulars", label: "Mount particulars", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "mountNotes", label: "Mount notes", role: "future-mapped", sourceTables: [] },
    ],
  },
  {
    sectionKey: "penetrations",
    title: "Penetrations / Wiring",
    fields: [
      { fieldKey: "powerPenetration", label: "Power penetration", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "powerLocation", label: "Power location", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "flexLength", label: "Flex length", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "wiringType", label: "Wiring type", role: "manual-constraint", sourceTables: ["SYSTEM_POLICY", "DRIVERS"] },
      { fieldKey: "penetrationNotes", label: "Penetration notes", role: "future-mapped", sourceTables: [] },
    ],
  },
  {
    sectionKey: "finishes",
    title: "Finishes",
    fields: [
      { fieldKey: "bodyFinish", label: "Default / body finish", role: "manual-constraint", sourceTables: ["SYSTEM", "SYSTEM_POLICY"] },
      { fieldKey: "finishCover", label: "Cover finish", role: "inherited-consequence", sourceTables: ["SYSTEM", "SYSTEM_POLICY"] },
      { fieldKey: "finishEnd", label: "End finish", role: "inherited-consequence", sourceTables: ["SYSTEM", "SYSTEM_POLICY"] },
      { fieldKey: "finishFlex", label: "Flex finish", role: "inherited-consequence", sourceTables: ["SYSTEM", "SYSTEM_POLICY"] },
      { fieldKey: "inheritedFinishStatus", label: "Inherited finish status", role: "inherited-consequence", sourceTables: ["SYSTEM", "SYSTEM_POLICY"] },
    ],
  },
  {
    sectionKey: "egressAccessories",
    title: "Egress & Accessories",
    fields: [
      { fieldKey: "egressLight", label: "Egress light", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "egressSound", label: "EWIS / sound", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "sensor", label: "Sensor / PIR", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
      { fieldKey: "accessories", label: "Accessories", role: "manual-constraint", sourceTables: ["ACCESSORIES"] },
    ],
  },
  {
    sectionKey: "specialParts",
    title: "Special Parts",
    fields: [
      { fieldKey: "specialPartsEntitlement", label: "Special-parts entitlement preview", role: "entitlement-gated", sourceTables: ["USERS", "SYSTEM_COMPONENTS"] },
      { fieldKey: "specialPartsOptIn", label: "Special-parts opt-in/out preview", role: "disabled", sourceTables: ["USERS", "SYSTEM_COMPONENTS"] },
      { fieldKey: "userEntitlementStatus", label: "User-entitlement status", role: "entitlement-gated", sourceTables: ["USERS"] },
    ],
  },
  {
    sectionKey: "runsPreview",
    title: "Runs Preview",
    fields: [
      { fieldKey: "runCount", label: "Run count/list", role: "disabled", sourceTables: [] },
      { fieldKey: "runQty", label: "Qty", role: "disabled", sourceTables: [] },
      { fieldKey: "runLength", label: "Length", role: "disabled", sourceTables: [] },
      { fieldKey: "runLengthMode", label: "Length mode", role: "disabled", sourceTables: [] },
      { fieldKey: "runOverrideStatus", label: "Override status", role: "disabled", sourceTables: [] },
      { fieldKey: "runPlacementStatus", label: "Placement status", role: "disabled", sourceTables: [] },
    ],
  },
  {
    sectionKey: "disabledWorkflow",
    title: "Disabled Workflow",
    fields: [
      { fieldKey: "engineVerify", label: "Engine verify", role: "disabled", sourceTables: [] },
      { fieldKey: "outputNavigation", label: "Output navigation", role: "disabled", sourceTables: [] },
      { fieldKey: "saveHydrate", label: "Save / hydrate", role: "disabled", sourceTables: [] },
      { fieldKey: "hubSpotPush", label: "HubSpot push", role: "disabled", sourceTables: [] },
      { fieldKey: "specBuildAuthority", label: "Spec/build authority", role: "disabled", sourceTables: [] },
      { fieldKey: "slugSpecGeneration", label: "Slug/spec generation", role: "disabled", sourceTables: [] },
      { fieldKey: "iesGeneration", label: "IES generation", role: "disabled", sourceTables: [] },
      { fieldKey: "payloadRunTableGeneration", label: "Payload / RunTable generation", role: "disabled", sourceTables: [] },
    ],
  },
]);

const DONOR_FIELD_DEFINITIONS = Object.freeze(WORKFLOW_SECTION_DEFINITIONS.flatMap((section) => section.fields.map((field) => ({ ...field, sectionKey: section.sectionKey }))));
const ALL_FIELD_DEFINITIONS = Object.freeze([...TARGET_FIELDS, ...DONOR_FIELD_DEFINITIONS]);
const TARGET_FIELD_KEYS = new Set(ALL_FIELD_DEFINITIONS.map((field) => field.fieldKey));

const TABLE_ALIASES = Object.freeze({
  SYSTEM: ["SYSTEM", "SYSTEMS", "system", "systems"],
  TIERS: ["TIERS", "TIER", "tiers", "tier"],
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
  "TIERS",
  "OPTICS",
  "BOARDS",
  "DRIVERS",
  "ACCESSORIES",
  "SYSTEM_POLICY",
  "SYSTEM_COMPONENTS",
  "USERS",
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
  specCodeGenerationEnabled: false,
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

function createOption(label, {
  value = label,
  sourceTables = [],
  count = 1,
  diffuserLayer = "",
  parentFieldKey = "",
  parentValue = "",
  parentValues = [],
  specCodePreview = "",
  specCodeVar2Preview = "",
  diffuserMaterial = "",
  imageReadiness = "",
  imageKey = "",
  visualChoice = false,
  donorImageReferenceKnown = false,
  runtimeImageAvailable = false,
  metadataOnly = false,
  specCodeGenerationEnabled = false,
  systemReferenceKey = "",
  systemVariantKey = "",
  systemReferenceKeys = [],
  systemSupportsIndirect = false,
  compatibleControlTypes = [],
  finishInheritanceIndex = null,
} = {}) {
  const optionLabel = safeString(label || value);
  const referenceKeys = uniqueStrings([
    systemReferenceKey,
    ...(Array.isArray(systemReferenceKeys) ? systemReferenceKeys : []),
  ].map(safeString).filter(Boolean));
  const controlTypes = uniqueStrings((Array.isArray(compatibleControlTypes) ? compatibleControlTypes : [])
    .map(safeString)
    .filter(Boolean));
  const compatibleParentValues = uniqueStrings([
    parentValue,
    ...(Array.isArray(parentValues) ? parentValues : []),
  ].map(safeString).filter(Boolean));
  const safeFinishInheritanceIndex = Number.isInteger(finishInheritanceIndex) && finishInheritanceIndex >= 0 ? finishInheritanceIndex : null;
  return {
    value: optionValue(value || optionLabel),
    label: optionLabel,
    count,
    sourceStatus: "db-reference-backed",
    sourceTables: uniqueStrings(sourceTables),
    diffuserLayer,
    parentFieldKey,
    parentValue,
    parentValues: compatibleParentValues,
    specCodePreview,
    specCodeVar2Preview,
    diffuserMaterial,
    imageReadiness,
    imageKey,
    visualChoice: visualChoice === true,
    donorImageReferenceKnown: donorImageReferenceKnown === true,
    runtimeImageAvailable: runtimeImageAvailable === true,
    metadataOnly: metadataOnly === true,
    specCodeGenerationEnabled: specCodeGenerationEnabled === true ? false : false,
    writes: false,
    rawRowsExposed: false,
    systemReferenceKey: safeString(systemReferenceKey || referenceKeys[0] || ""),
    systemReferenceKeys: referenceKeys,
    systemVariantKey: safeString(systemVariantKey),
    systemSupportsIndirect: systemSupportsIndirect === true,
    compatibleControlTypes: controlTypes,
    finishInheritanceIndex: safeFinishInheritanceIndex,
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
    for (const key of ["diffuserLayer", "parentFieldKey", "parentValue", "specCodePreview", "specCodeVar2Preview", "diffuserMaterial", "imageReadiness", "imageKey", "systemReferenceKey", "systemVariantKey"]) {
      if (!existing[key] && meta[key]) existing[key] = meta[key];
    }
    existing.parentValues = uniqueStrings([
      ...(Array.isArray(existing.parentValues) ? existing.parentValues : []),
      meta.parentValue,
      ...(Array.isArray(meta.parentValues) ? meta.parentValues : []),
    ].map(safeString).filter(Boolean));
    existing.systemReferenceKeys = uniqueStrings([
      ...(Array.isArray(existing.systemReferenceKeys) ? existing.systemReferenceKeys : []),
      meta.systemReferenceKey,
      ...(Array.isArray(meta.systemReferenceKeys) ? meta.systemReferenceKeys : []),
    ].map(safeString).filter(Boolean));
    existing.compatibleControlTypes = uniqueStrings([
      ...(Array.isArray(existing.compatibleControlTypes) ? existing.compatibleControlTypes : []),
      ...(Array.isArray(meta.compatibleControlTypes) ? meta.compatibleControlTypes : []),
    ].map(safeString).filter(Boolean));
    existing.systemSupportsIndirect = existing.systemSupportsIndirect === true || meta.systemSupportsIndirect === true;
    if (existing.finishInheritanceIndex == null && Number.isInteger(meta.finishInheritanceIndex) && meta.finishInheritanceIndex >= 0) existing.finishInheritanceIndex = meta.finishInheritanceIndex;
    existing.visualChoice = existing.visualChoice === true || meta.visualChoice === true;
    existing.donorImageReferenceKnown = existing.donorImageReferenceKnown === true || meta.donorImageReferenceKnown === true;
    existing.runtimeImageAvailable = false;
    existing.metadataOnly = existing.metadataOnly === true || meta.metadataOnly === true;
    existing.specCodeGenerationEnabled = false;
    existing.writes = false;
    existing.rawRowsExposed = false;
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
  const rowSystem = rowText(opticRow, ["system", "series", "system_name", "system_key"]);
  if (!rowSystem) return null;
  return systemOptions.find((option) => valuesMatch(option.systemReferenceKey, rowSystem)) || null;
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

function cctCriValues(row) {
  const c1 = rowText(row, ["c1_cct", "cct", "cct_k"]);
  const c2 = rowText(row, ["c2_cct"]);
  const cct = c1 && c2 && /^\d+$/.test(c1) && /^\d+$/.test(c2) && c1 !== c2
    ? `TW_${Math.min(Number(c1), Number(c2))}_${Math.max(Number(c1), Number(c2))}`
    : c1;
  const cri = rowText(row, ["c2_cri_min", "c1_cri_min", "cri", "cri_min"]);
  if (!cct) return [];
  const cctLabel = /^\d{4}$/.test(cct) ? `${cct}K` : cct;
  return [`${cctLabel}${cri ? ` / CRI${cri}` : ""}`];
}

function numericOptionValues(row, keys) {
  return uniqueStrings(keys.map((key) => safeString(fieldValue(row, key)).replace(/[^0-9.]/g, "").trim()).filter(Boolean));
}

function accessoryTypeMatches(row, type) {
  return normaliseKey(rowText(row, ["accessory_type", "type", "category", "group"])) === normaliseKey(type);
}

function accessoryIdLabel(row) {
  return rowText(row, ["display_choice", "label", "accessory_name", "name", "accessory_id", "id", "accessory_type"]);
}

function accessorySourceId(row) {
  return rowText(row, ["accessory_id", "id"]) || accessoryIdLabel(row);
}

function egressLightAccessoryOption(row) {
  const id = accessorySourceId(row);
  if (!id) return null;
  let label = id;
  if (id === "Maintained") label = "EM — Maintained";
  else if (id === "Non Maintained") label = "EM — Non-Maintained";
  else if (id === "Sustained") label = "EM — Sustained";
  else if (id === "DC Mains") label = "EM — DC Mains";
  return { value: id, label };
}

function sensorAccessoryOption(row) {
  const id = accessorySourceId(row);
  if (!id) return null;
  const label = id.replace(" (Daylight Sensing)", "").replace("Blank Cover (res qty)", "Blank Cover");
  return { value: id, label };
}

function accessoryTypeKey(row) {
  return normaliseKey(rowText(row, ["accessory_type", "type", "category", "group"]));
}

function isSpecialPartsAccessoryType(row) {
  const type = accessoryTypeKey(row);
  return type === "special_parts" || type === "special_part" || type === "system_component" || type === "system_components" || (type.includes("special") && type.includes("part"));
}

function isExcludedFromGenericAccessoryPreview(row) {
  return accessoryTypeMatches(row, "egress_light")
    || accessoryTypeMatches(row, "egress_sound")
    || accessoryTypeMatches(row, "pir")
    || accessoryTypeMatches(row, "sensor")
    || accessoryTypeMatches(row, "emergency")
    || isSpecialPartsAccessoryType(row);
}

function isGenericAccessoryPreviewRow(row) {
  if (isExcludedFromGenericAccessoryPreview(row)) return false;
  const type = accessoryTypeKey(row);
  return type === "accessory" || type === "standard_accessory" || type === "generic_accessory" || type === "in_cover";
}

function canonicalMountStyle(label) {
  const raw = safeString(label);
  const text = raw.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (/trimless/.test(text)) return "trimless";
  if (/recess/.test(text) && /no flange/.test(text)) return "trimless";
  if (/recess/.test(text) || /with flange/.test(text)) return "recessed";
  if (/surface/.test(text)) return "surface mount";
  if (/suspend/.test(text)) return "suspended";
  return text;
}

function mountStyleLabel(row) {
  return rowText(row, ["display_choice", "mount_style", "name", "style", "label", "accessory_id", "id"]);
}

function mountStyleSystemReferenceKeys(snapshot, style) {
  const wanted = canonicalMountStyle(style);
  if (!wanted) return [];
  return uniqueStrings(liveTableRows(snapshot, "SYSTEM").filter((row) => rowOptionValues(row, ["mount_style", "mount_styles"]).some((mount) => canonicalMountStyle(mount) === wanted))
    .map((row) => systemTokens(row).system)
    .filter(Boolean));
}

function systemEmissionValues(row) {
  return rowOptionValues(row, ["emission", "system_emission", "light_direction", "direction", "emission_permission"]);
}

function normaliseEmissionMode(value) {
  const key = normaliseKey(value).replace(/[|+/,-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!key) return "direct";
  const tokens = key.split(" ").filter(Boolean);
  const tokenSet = new Set(tokens);
  const hasBoth = tokenSet.has("both") || key === "di" || key === "d i";
  const hasDirect = tokenSet.has("direct") || tokenSet.has("down");
  const hasIndirect = tokenSet.has("indirect") || tokenSet.has("up");
  if (hasBoth || (hasDirect && hasIndirect)) return "direct-indirect";
  if (hasIndirect) return "indirect";
  if (hasDirect) return "direct";
  return key;
}

function emissionSupportsIndirect(value) {
  const mode = normaliseEmissionMode(value);
  return mode === "direct-indirect" || mode === "indirect";
}

function emissionSupportsDirect(value) {
  const mode = normaliseEmissionMode(value);
  return !mode || mode === "direct" || mode === "direct-indirect";
}

function addRedactedEntitlementOptions(bucket, snapshot) {
  const userRows = liveTableRows(snapshot, "USERS");
  const componentRows = liveTableRows(snapshot, "SYSTEM_COMPONENTS");
  const entitlementRows = userRows.filter((row) => rowOptionValues(row, ["system_component_ids", "system_componrent_ids", "system_component_id"]).length > 0);
  if (entitlementRows.length || componentRows.length) {
    addOption(bucket, "specialPartsEntitlement", "Entitlement metadata present — redacted", {
      value: "entitlement-metadata-present",
      sourceTables: ["USERS", "SYSTEM_COMPONENTS"],
      count: entitlementRows.length || componentRows.length,
    });
    addOption(bucket, "userEntitlementStatus", `${entitlementRows.length} entitlement row(s) — personal identifiers redacted`, {
      value: "user-entitlement-redacted",
      sourceTables: ["USERS"],
      count: entitlementRows.length,
    });
  }
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

function ambientPolicyValues(snapshot) {
  const rows = policyRowsMatching(snapshot, ["ambient_temp", "ambient temp", "ambient", "temperature"]);
  const tierColumns = ["economy", "business", "first", "charter"];
  return uniqueStrings(rows.flatMap((row) => [
    rowText(row, ["display_choice", "label", "name"]),
    ...rowOptionValues(row, ["value", "values", "item", "options", "allowed_values", ...tierColumns]),
  ]).map((value) => {
    const text = safeString(value);
    if (!text) return "";
    if (["ambient", "ambient temp", "ambient_temp", "temperature"].map(normaliseKey).includes(normaliseKey(text))) return "";
    if (/^[0-9.]+$/.test(text)) return `${text}°C`;
    return text.replace(/^([0-9.]+)\s*(?:deg\s*)?c$/i, "$1°C");
  })).filter(Boolean);
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
    const emissions = systemEmissionValues(row);
    addOption(bucket, "system", tokens.label, { value: tokens.value, sourceTables: ["SYSTEM"], systemReferenceKey: tokens.system, systemVariantKey: tokens.variant, systemSupportsIndirect: emissions.some(emissionSupportsIndirect) });
    if (tokens.variant) addOption(bucket, "variantKey", tokens.variant, { sourceTables: ["SYSTEM"] });
    for (const emission of systemEmissionValues(row)) {
      addOption(bucket, "emission", emission, { sourceTables: ["SYSTEM"] });
      if (emissionSupportsDirect(emission)) addOption(bucket, "directCapability", "Direct supported", { value: "direct-supported", sourceTables: ["SYSTEM"] });
      if (emissionSupportsIndirect(emission)) addOption(bucket, "indirectCapability", "Indirect supported", { value: "indirect-supported", sourceTables: ["SYSTEM"] });
    }
    for (const mount of rowOptionValues(row, ["mount_style", "mount_styles"])) addOption(bucket, "mountStyle", mount, { sourceTables: ["SYSTEM"], systemReferenceKey: tokens.system, systemReferenceKeys: [tokens.system].filter(Boolean) });
    const finishValues = rowOptionValues(row, ["system_and_variant_finish", "finish", "finish_name", "colour", "color"]);
    finishValues.forEach((finish, finishInheritanceIndex) => {
      const finishMeta = { sourceTables: ["SYSTEM"], systemReferenceKey: tokens.system, systemReferenceKeys: [tokens.system].filter(Boolean), finishInheritanceIndex };
      addOption(bucket, "bodyFinish", finish, finishMeta);
      addOption(bucket, "finishCover", finish, finishMeta);
      addOption(bucket, "finishEnd", finish, finishMeta);
    });
    rowOptionValues(row, ["flex_map", "flex_colour", "flex_color", "flex"]).forEach((flex, finishInheritanceIndex) => addOption(bucket, "finishFlex", flex, { sourceTables: ["SYSTEM"], systemReferenceKey: tokens.system, systemReferenceKeys: [tokens.system].filter(Boolean), finishInheritanceIndex }));
  }

  const systemOptions = optionsFor(bucket, "system");

  const tiers = liveTableRows(snapshot, "TIERS");
  for (const row of tiers) {
    const tier = rowText(row, ["tier", "tier_key", "name", "label", "id"]);
    if (tier) addOption(bucket, "tier", tier, { sourceTables: ["TIERS"] });
    for (const electrical of rowOptionValues(row, ["electrical", "electrical_options", "elect_class"])) addOption(bucket, "electricalClass", electrical, { sourceTables: ["TIERS"] });
  }
  for (const value of policyValues(snapshot, ["tier"])) addOption(bucket, "tier", value, { sourceTables: ["SYSTEM_POLICY"] });

  const optics = liveTableRows(snapshot, "OPTICS");
  for (const row of optics) {
    const optic = diffuserVar1Name(row);
    const system = diffuserSystemToken(row);
    const opticLabel = [optic, system].filter(Boolean).join(" · ") || optic;
    const opticValue = diffuserVar1Value(row);
    const var1Meta = diffuserOptionMeta(row, { layer: "var1", visualChoice: true });
    const emissions = rowOptionValues(row, ["emission_permission", "direction", "emission", "optic_direction", "light_direction"]);
    const hasDirect = emissions.length ? emissions.some(emissionSupportsDirect) : true;
    const hasIndirect = emissions.some(emissionSupportsIndirect);
    addOption(bucket, "optic", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });
    addOption(bucket, "diffuserVar1", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });
    if (hasDirect) addOption(bucket, "directOpticVar1", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });
    if (hasIndirect) addOption(bucket, "indirectOpticVar1", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });

    for (const variant of diffuserVar2Values(row)) {
      const var2Meta = diffuserOptionMeta(row, {
        layer: "var2",
        parentFieldKey: "diffuserVar1",
        parentValue: opticValue,
        var2Label: variant.label,
        visualChoice: true,
      });
      const aliasValue = [optic, variant.label].filter(Boolean).join("|") || variant.label;
      addOption(bucket, "opticSub", variant.label, { value: aliasValue, sourceTables: ["OPTICS"], ...var2Meta });
      addOption(bucket, "diffuserVar2", variant.label, { value: variant.value, sourceTables: ["OPTICS"], ...var2Meta });
      if (hasDirect) addOption(bucket, "directOpticVar2", variant.label, { value: variant.value, sourceTables: ["OPTICS"], ...var2Meta });
      if (hasIndirect) addOption(bucket, "indirectOpticVar2", variant.label, { value: variant.value, sourceTables: ["OPTICS"], ...var2Meta });
    }

    const material = diffuserMaterialText(row);
    if (material) addOption(bucket, "diffuserMaterial", material, {
      value: [system, optic, material].filter(Boolean).join("|") || material,
      sourceTables: ["OPTICS"],
      ...diffuserOptionMeta(row, { layer: "material", parentFieldKey: "diffuserVar1", parentValue: opticValue, visualChoice: false, metadataOnly: true }),
      diffuserMaterial: material,
    });

    const baseSpec = specCodePreviewFor(row);
    if (baseSpec.combinedSpecCodePreview) addOption(bucket, "diffuserSpecCodePreview", `${optic || "Diffuser"}: ${baseSpec.combinedSpecCodePreview}`, {
      value: [system, optic, baseSpec.combinedSpecCodePreview].filter(Boolean).join("|") || baseSpec.combinedSpecCodePreview,
      sourceTables: ["OPTICS"],
      ...diffuserOptionMeta(row, { layer: "spec-code-preview", parentFieldKey: "diffuserVar1", parentValue: opticValue, visualChoice: false, metadataOnly: true }),
      specCodePreview: baseSpec.combinedSpecCodePreview,
      specCodeVar2Preview: baseSpec.specCodeVar2Preview,
    });
    for (const variant of diffuserVar2Values(row)) {
      const spec = specCodePreviewFor(row, variant.label);
      addOption(bucket, "diffuserSpecCodePreview", `${optic || "Diffuser"} / ${variant.label}: ${spec.combinedSpecCodePreview}`, {
        value: [system, optic, variant.label, spec.combinedSpecCodePreview].filter(Boolean).join("|") || spec.combinedSpecCodePreview,
        sourceTables: ["OPTICS"],
        ...diffuserOptionMeta(row, { layer: "spec-code-preview", parentFieldKey: "diffuserVar2", parentValue: variant.value, var2Label: variant.label, visualChoice: false, metadataOnly: true }),
        specCodePreview: spec.combinedSpecCodePreview,
        specCodeVar2Preview: spec.specCodeVar2Preview,
      });
    }

    addOption(bucket, "diffuserImageReadiness", `${optic || "Diffuser"}: runtime manifest missing`, {
      value: [system, optic, "runtime-manifest-missing"].filter(Boolean).join("|") || "runtime-manifest-missing",
      sourceTables: ["OPTICS"],
      ...diffuserOptionMeta(row, { layer: "image-readiness", parentFieldKey: "diffuserVar1", parentValue: opticValue, visualChoice: false, metadataOnly: true }),
      imageReadiness: "runtime-manifest-missing",
    });
    for (const variant of diffuserVar2Values(row)) {
      addOption(bucket, "diffuserImageReadiness", `${optic || "Diffuser"} / ${variant.label}: runtime manifest missing`, {
        value: [system, optic, variant.label, "runtime-manifest-missing"].filter(Boolean).join("|") || "runtime-manifest-missing",
        sourceTables: ["OPTICS"],
        ...diffuserOptionMeta(row, { layer: "image-readiness", parentFieldKey: "diffuserVar2", parentValue: variant.value, var2Label: variant.label, visualChoice: false, metadataOnly: true }),
        imageReadiness: "runtime-manifest-missing",
      });
    }

    for (const emission of emissions) {
      if (emissionSupportsDirect(emission)) addOption(bucket, "directCapability", "Direct supported", { value: "direct-supported", sourceTables: ["OPTICS"] });
      if (emissionSupportsIndirect(emission)) {
        addOption(bucket, "indirectCapability", "Indirect supported", { value: "indirect-supported", sourceTables: ["OPTICS"] });
        addOption(bucket, "opticIndirect", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });
      }
    }
    const opticSystemMeta = system ? { systemReferenceKey: system, systemReferenceKeys: [system] } : {};
    for (const ip of rowOptionValues(row, ["ip_option_1", "ip_options", "ip", "ip_rating"])) addOption(bucket, "ipRating", ip, { sourceTables: ["OPTICS"], ...opticSystemMeta });
    for (const ik of rowOptionValues(row, ["ik_option_2", "ik_options", "ik", "ik_rating"])) addOption(bucket, "ikRating", ik, { sourceTables: ["OPTICS"], ...opticSystemMeta });
    for (const cct of extractCctValues(row)) addOption(bucket, "cct", cct, { sourceTables: ["OPTICS"], ...opticSystemMeta });
    for (const env of rowOptionValues(row, ["environment", "application", "application_environment"])) addOption(bucket, "application", env, { sourceTables: ["OPTICS"], ...opticSystemMeta });
    for (const io of rowOptionValues(row, ["interior_exterior", "interiorExterior", "indoor_outdoor", "location_type"])) addOption(bucket, "interiorExterior", io, { sourceTables: ["OPTICS"], ...opticSystemMeta });
  }

  const boards = liveTableRows(snapshot, "BOARDS");
  for (const row of boards) {
    const systemValue = systemOptionValueForSource(systemOptions, row);
    const systemMeta = systemValue ? { systemReferenceKey: systemValue, systemReferenceKeys: [systemValue] } : {};
    for (const cct of extractCctValues(row)) addOption(bucket, "cct", cct, { sourceTables: ["BOARDS"], ...systemMeta });
    for (const cctCri of cctCriValues(row)) {
      addOption(bucket, "cctCri", cctCri, { sourceTables: ["BOARDS"], ...systemMeta });
      addOption(bucket, "cctCriIndirect", cctCri, { sourceTables: ["BOARDS"], ...systemMeta });
    }
    for (const lm of numericOptionValues(row, ["board_lm_per_m", "delivered_lm_per_m", "lm_per_m", "nominal_lm_per_m"])) {
      addOption(bucket, "targetLmPerM", `${lm} lm/m`, { value: lm, sourceTables: ["BOARDS"], ...systemMeta });
      addOption(bucket, "targetLmPerMIndirect", `${lm} lm/m`, { value: lm, sourceTables: ["BOARDS"], ...systemMeta });
    }
    for (const control of rowOptionValues(row, ["control_type_labels", "control_type_options", "native_control_type", "control_type"])) {
      addOption(bucket, "controlType", control, { sourceTables: ["BOARDS"], ...systemMeta });
      addOption(bucket, "controlTypeIndirect", control, { sourceTables: ["BOARDS"], ...systemMeta });
    }
    for (const lex of rowOptionValues(row, ["lexWeight", "lex_weight", "lex_weight_g", "lex_weight_kg", "lexDirect", "lex_direct", "lex"])) {
      addOption(bucket, "lexWeight", lex, { sourceTables: ["BOARDS"], metadataOnly: true, ...systemMeta });
    }
  }

  const drivers = liveTableRows(snapshot, "DRIVERS");
  for (const row of drivers) {
    const driver = rowText(row, ["driver_id", "driver", "driver_name", "name", "label", "sku", "part_number"]);
    const controls = rowOptionValues(row, ["control_type", "control", "protocol", "dimming", "dimming_type", "driver_control", "control_protocol", "native_control_type"]);
    if (driver) addOption(bucket, "driver", driver, { sourceTables: ["DRIVERS"], compatibleControlTypes: controls });
    for (const control of controls) {
      addOption(bucket, "controlType", control, { sourceTables: ["DRIVERS"] });
      addOption(bucket, "controlTypeIndirect", control, { sourceTables: ["DRIVERS"] });
    }
    for (const wiring of rowOptionValues(row, ["wiring_type", "wiring", "cable_type", "control_cores"])) addOption(bucket, "wiringType", wiring, { sourceTables: ["DRIVERS"] });
  }

  for (const value of policyValues(snapshot, ["application", "environment", "use case", "area type"])) addOption(bucket, "application", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["interior exterior", "indoor outdoor", "location type"])) addOption(bucket, "interiorExterior", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["cct", "colour temperature", "color temperature"])) addOption(bucket, "cct", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["control", "dimming", "protocol"])) addOption(bucket, "controlType", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["ip", "ingress protection"])) addOption(bucket, "ipRating", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["ik", "impact rating"])) addOption(bucket, "ikRating", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["mount", "mounting", "suspension", "recessed", "surface"])) addOption(bucket, "mountStyle", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["finish", "colour", "color", "paint"])) {
    addOption(bucket, "bodyFinish", value, { sourceTables: ["SYSTEM_POLICY"] });
    addOption(bucket, "finishCover", value, { sourceTables: ["SYSTEM_POLICY"] });
    addOption(bucket, "finishEnd", value, { sourceTables: ["SYSTEM_POLICY"] });
  }
  for (const value of policyValues(snapshot, ["flex", "finish", "colour", "color"])) addOption(bucket, "finishFlex", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["electrical", "electrical class", "class"] )) addOption(bucket, "electricalClass", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of ambientPolicyValues(snapshot)) addOption(bucket, "ambient", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["wiring", "cable", "control cores"] )) addOption(bucket, "wiringType", value, { sourceTables: ["SYSTEM_POLICY"] });
  addOption(bucket, "indirectMatchDirect", "Match direct CCT/CRI and control", { value: "match-direct", sourceTables: ["SYSTEM", "OPTICS"] });
  addOption(bucket, "inheritedFinishStatus", "Cover/end/flex inherit default until changed", { value: "inherits-default-finish", sourceTables: ["SYSTEM", "SYSTEM_POLICY"] });

  for (const value of accessoryLabels(snapshot, ["finish", "colour", "color", "paint"])) addOption(bucket, "bodyFinish", value, { sourceTables: ["ACCESSORIES"] });

  for (const row of liveTableRows(snapshot, "ACCESSORIES")) {
    const label = accessoryIdLabel(row);
    if (!label) continue;
    if (accessoryTypeMatches(row, "mount")) {
      const style = mountStyleLabel(row);
      const systemKeys = mountStyleSystemReferenceKeys(snapshot, style);
      const mountMeta = { sourceTables: ["ACCESSORIES"], parentFieldKey: "mountStyle", parentValue: style, systemReferenceKey: systemKeys[0] || "", systemReferenceKeys: systemKeys };
      addOption(bucket, "mountStyle", style, { sourceTables: ["ACCESSORIES"], systemReferenceKey: systemKeys[0] || "", systemReferenceKeys: systemKeys });
      for (const value of rowOptionValues(row, ["mount_selections", "mount_selection"])) addOption(bucket, "mountSelection", value, mountMeta);
      for (const value of rowOptionValues(row, ["mount_particulars", "particulars"])) addOption(bucket, "mountParticulars", value, mountMeta);
    }
    if (accessoryTypeMatches(row, "power_penetration")) addOption(bucket, "powerPenetration", label, { sourceTables: ["ACCESSORIES"] });
    if (accessoryTypeMatches(row, "power_location")) addOption(bucket, "powerLocation", label === "mm" ? "TBD" : label, { sourceTables: ["ACCESSORIES"] });
    if (accessoryTypeMatches(row, "flex_length")) addOption(bucket, "flexLength", label, { sourceTables: ["ACCESSORIES"] });
    if (accessoryTypeMatches(row, "elect_class")) addOption(bucket, "electricalClass", rowText(row, ["accessory_id", "id", "display_choice", "label"], label), { sourceTables: ["ACCESSORIES"] });
    if (accessoryTypeMatches(row, "egress_light")) {
      const option = egressLightAccessoryOption(row);
      if (option) addOption(bucket, "egressLight", option.label, { value: option.value, sourceTables: ["ACCESSORIES"] });
    }
    if (accessoryTypeMatches(row, "egress_sound")) {
      const id = accessorySourceId(row);
      if (id) addOption(bucket, "egressSound", id, { value: id, sourceTables: ["ACCESSORIES"] });
    }
    if (accessoryTypeMatches(row, "pir") || accessoryTypeMatches(row, "sensor")) {
      const option = sensorAccessoryOption(row);
      if (option) addOption(bucket, "sensor", option.label, { value: option.value, sourceTables: ["ACCESSORIES"] });
    }
    if (isGenericAccessoryPreviewRow(row)) {
      addOption(bucket, "accessories", label, { sourceTables: ["ACCESSORIES"] });
    }
  }

  addRedactedEntitlementOptions(bucket, snapshot);

  return bucket;
}

function pushRelationshipRecord(records, sourceTables, fields, reason = "safe source relationship") {
  const cleaned = Object.fromEntries(Object.entries(fields)
    .map(([fieldKey, values]) => [fieldKey, uniqueStrings(Array.isArray(values) ? values : [values])])
    .filter(([, values]) => values.length));
  if (Object.keys(cleaned).length > 1) {
    records.push({
      sourceTables: uniqueStrings(sourceTables),
      fields: cleaned,
      reason,
      rawRowsExposed: false,
    });
  }
}

function systemOptionForRow(systemOptions, row) {
  const tokens = systemTokens(row);
  if (!tokens.value && !tokens.label && !tokens.system) return null;
  return systemOptions.find((option) => [option.value, option.label].some((value) => valuesMatch(value, tokens.value) || valuesMatch(value, tokens.label)))
    || systemOptions.find((option) => normaliseKey(`${option.value} ${option.label}`).includes(normaliseKey(tokens.system)))
    || null;
}

function systemOptionValueForSource(systemOptions, row) {
  return systemOptionForRow(systemOptions, row)?.value || "";
}

function opticFieldValue(row) {
  const optic = rowText(row, ["optic_var_1", "baseline_slug", "pure_ref_id", "optic_bom_id", "spec_code", "name", "label"]);
  const system = rowText(row, ["system", "series", "system_name"]);
  return [system, optic].filter(Boolean).join("|") || optic;
}

function diffuserVar1Name(row) {
  return rowText(row, ["optic_var_1", "baseline_slug", "pure_ref_id", "optic_bom_id", "spec_code", "name", "label"]);
}

function diffuserSystemToken(row) {
  return rowText(row, ["system", "series", "system_name"]);
}

function diffuserVar1Value(row) {
  return [diffuserSystemToken(row), diffuserVar1Name(row)].filter(Boolean).join("|") || diffuserVar1Name(row);
}

function diffuserVar2Values(row) {
  const var1 = diffuserVar1Name(row);
  const system = diffuserSystemToken(row);
  return rowOptionValues(row, ["optic_var_2"]).map((variant) => ({
    label: variant,
    value: [system, var1, variant].filter(Boolean).join("|") || variant,
  }));
}

function slugifyMetadataKey(value) {
  return safeLower(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function diffuserImageKey(var1 = "", var2 = "") {
  const base = slugifyMetadataKey(var1);
  const child = slugifyMetadataKey(var2);
  return child ? `optic_${base}_${child}` : base ? `optic_${base}` : "";
}

function diffuserMaterialText(row) {
  return rowText(row, ["diffuser_material", "material", "diffuser", "description", "notes", "helper_text"]);
}

function specCodePreviewFor(row, var2Label = "") {
  const base = rowText(row, ["spec_code"]);
  const var2List = rowOptionValues(row, ["optic_var_2"]);
  const code2List = rowOptionValues(row, ["spec_code_var2"]);
  const index = var2List.findIndex((item) => valuesMatch(item, var2Label));
  const var2Code = index >= 0 ? safeString(code2List[index]) : "";
  return {
    specCodePreview: base || "metadata pending",
    specCodeVar2Preview: var2Code,
    combinedSpecCodePreview: [base, var2Code].filter(Boolean).join("") || base || var2Code || "metadata pending",
  };
}

function diffuserOptionMeta(row, { layer, parentFieldKey = "", parentValue = "", var2Label = "", visualChoice = true, metadataOnly = false } = {}) {
  const var1 = diffuserVar1Name(row);
  const spec = specCodePreviewFor(row, var2Label);
  const imageKey = diffuserImageKey(var1, var2Label);
  return {
    diffuserLayer: layer,
    parentFieldKey,
    parentValue,
    specCodePreview: spec.combinedSpecCodePreview,
    specCodeVar2Preview: spec.specCodeVar2Preview,
    diffuserMaterial: diffuserMaterialText(row),
    imageReadiness: imageKey ? "runtime-manifest-missing" : "unmapped",
    imageKey,
    visualChoice,
    donorImageReferenceKnown: Boolean(imageKey),
    runtimeImageAvailable: false,
    metadataOnly,
    specCodeGenerationEnabled: false,
    writes: false,
    rawRowsExposed: false,
    systemReferenceKey: diffuserSystemToken(row),
  };
}

function collectRecords(snapshot, bucket) {
  const records = [];
  const systemOptions = optionsFor(bucket, "system");

  for (const row of liveTableRows(snapshot, "TIERS")) {
    const tier = rowText(row, ["tier", "tier_key", "name", "label", "id"]);
    const electricalClass = rowOptionValues(row, ["electrical", "electrical_options", "elect_class"]);
    pushRelationshipRecord(records, ["TIERS"], {
      tier,
      electricalClass,
    }, "TIERS row maps selected tier to electrical class options");
  }

  for (const row of liveTableRows(snapshot, "SYSTEM")) {
    const tokens = systemTokens(row);
    const systemValue = tokens.system || systemOptionValueForSource(systemOptions, row) || tokens.value;
    const variant = rowText(row, ["system_variant_1", "variant", "family", "profile_family"]);
    const emissions = systemEmissionValues(row);
    const mountStyles = rowOptionValues(row, ["mount_style", "mount_styles"]);
    const finishes = rowOptionValues(row, ["system_and_variant_finish", "finish", "finish_name", "colour", "color"]);
    const flexes = rowOptionValues(row, ["flex_map", "flex_colour", "flex_color", "flex"]);
    pushRelationshipRecord(records, ["SYSTEM"], {
      system: systemValue,
      variantKey: variant,
      emission: emissions,
      directCapability: emissions.filter(emissionSupportsDirect).map(() => "direct-supported"),
      indirectCapability: emissions.filter(emissionSupportsIndirect).map(() => "indirect-supported"),
      mountStyle: mountStyles,
      bodyFinish: finishes,
      finishCover: finishes,
      finishEnd: finishes,
      finishFlex: flexes.length ? flexes : finishes,
      inheritedFinishStatus: finishes.length || flexes.length ? ["inherits-default-finish"] : [],
    }, "SYSTEM row maps system choices to variants, emission, mounting, and finishes");
  }

  for (const row of liveTableRows(snapshot, "OPTICS")) {
    const systemValue = diffuserSystemToken(row);
    const opticValue = opticFieldValue(row);
    const var1Value = diffuserVar1Value(row);
    const var2Values = diffuserVar2Values(row).map((item) => item.value);
    const legacySubs = diffuserVar2Values(row).map((item) => [diffuserVar1Name(row), item.label].filter(Boolean).join("|") || item.label);
    const material = diffuserMaterialText(row);
    const specPreviews = [
      specCodePreviewFor(row).combinedSpecCodePreview,
      ...diffuserVar2Values(row).map((item) => specCodePreviewFor(row, item.label).combinedSpecCodePreview),
    ].filter(Boolean);
    const imageReadinessValues = [
      [diffuserSystemToken(row), diffuserVar1Name(row), "runtime-manifest-missing"].filter(Boolean).join("|") || "runtime-manifest-missing",
      ...diffuserVar2Values(row).map((item) => [diffuserSystemToken(row), diffuserVar1Name(row), item.label, "runtime-manifest-missing"].filter(Boolean).join("|") || "runtime-manifest-missing"),
    ];
    const emissions = rowOptionValues(row, ["emission_permission", "direction", "emission", "optic_direction", "light_direction"]);
    const direct = emissions.length ? emissions.filter(emissionSupportsDirect).map(() => "direct-supported") : ["direct-supported"];
    const indirect = emissions.filter(emissionSupportsIndirect).map(() => "indirect-supported");
    const ips = rowOptionValues(row, ["ip_option_1", "ip_options", "ip", "ip_rating"]);
    const iks = rowOptionValues(row, ["ik_option_2", "ik_options", "ik", "ik_rating"]);
    const ccts = extractCctValues(row);
    const io = rowOptionValues(row, ["interior_exterior", "interiorExterior", "indoor_outdoor", "location_type"]);
    const app = rowOptionValues(row, ["environment", "application", "application_environment"]);
    pushRelationshipRecord(records, ["OPTICS"], {
      system: systemValue,
      optic: opticValue,
      opticSub: legacySubs,
      opticIndirect: indirect.length ? [opticValue] : [],
      diffuserVar1: var1Value,
      diffuserVar2: var2Values,
      diffuserMaterial: material ? [material] : [],
      diffuserSpecCodePreview: specPreviews,
      diffuserImageReadiness: imageReadinessValues,
      directOpticVar1: direct.length ? [var1Value] : [],
      directOpticVar2: direct.length ? var2Values : [],
      indirectOpticVar1: indirect.length ? [var1Value] : [],
      indirectOpticVar2: indirect.length ? var2Values : [],
      directCapability: direct,
      indirectCapability: indirect,
      ipRating: ips,
      ikRating: iks,
      cct: ccts,
      interiorExterior: io,
      application: app,
    }, "OPTICS row maps system to diffuser var 1, diffuser var 2, spec-code preview metadata, material, image readiness, IP/IK compatibility, and direct/indirect availability");
  }

  for (const row of liveTableRows(snapshot, "BOARDS")) {
    const systemValue = systemOptionValueForSource(systemOptions, row);
    const optic = opticFieldValue(row);
    const cctCri = cctCriValues(row);
    const ccts = extractCctValues(row);
    const lm = numericOptionValues(row, ["board_lm_per_m", "delivered_lm_per_m", "lm_per_m", "nominal_lm_per_m"]);
    const controls = rowOptionValues(row, ["control_type_labels", "control_type_options", "native_control_type", "control_type"]);
    const lex = rowOptionValues(row, ["lexWeight", "lex_weight", "lex_weight_g", "lex_weight_kg", "lexDirect", "lex_direct", "lex"]);
    pushRelationshipRecord(records, ["BOARDS"], {
      system: systemValue,
      optic,
      cct: ccts,
      cctCri,
      cctCriIndirect: cctCri,
      targetLmPerM: lm,
      targetLmPerMIndirect: lm,
      controlType: controls,
      controlTypeIndirect: controls,
      lexWeight: lex,
    }, "BOARDS row maps system/optic to paired CCT/CRI, lm/m, control options, and Lex metadata where present");
  }

  for (const row of liveTableRows(snapshot, "DRIVERS")) {
    const driver = rowText(row, ["driver_id", "driver", "driver_name", "name", "label", "sku", "part_number"]);
    const control = rowOptionValues(row, ["control_type", "control", "protocol", "dimming", "dimming_type", "driver_control", "control_protocol", "native_control_type"]);
    const wiring = rowOptionValues(row, ["wiring_type", "wiring", "cable_type", "control_cores"]);
    pushRelationshipRecord(records, ["DRIVERS"], {
      driver,
      controlType: control,
      controlTypeIndirect: control,
      wiringType: wiring,
    }, "DRIVERS row maps control protocol to driver and wiring consequences");
  }

  for (const row of liveTableRows(snapshot, "ACCESSORIES")) {
    const label = accessoryIdLabel(row);
    if (!label) continue;
    const egressLightOption = accessoryTypeMatches(row, "egress_light") ? egressLightAccessoryOption(row) : null;
    const egressSoundId = accessoryTypeMatches(row, "egress_sound") ? accessorySourceId(row) : "";
    const sensorOption = (accessoryTypeMatches(row, "pir") || accessoryTypeMatches(row, "sensor")) ? sensorAccessoryOption(row) : null;
    const genericAccessoryValue = isGenericAccessoryPreviewRow(row) ? [label] : [];
    const mountStyles = rowOptionValues(row, ["mount_style", "mount_styles", "display_choice"]).filter(Boolean);
    const mountSelections = rowOptionValues(row, ["mount_selections", "mount_selection"]);
    const mountParticulars = rowOptionValues(row, ["mount_particulars", "particulars"]);
    if (accessoryTypeMatches(row, "mount")) {
      pushRelationshipRecord(records, ["ACCESSORIES"], {
        mountStyle: mountStyles.length ? mountStyles : [label],
        mountSelection: mountSelections,
        mountParticulars,
      }, "ACCESSORIES mount row maps mount style to selection and particulars");
    }
    pushRelationshipRecord(records, ["ACCESSORIES"], {
      powerPenetration: accessoryTypeMatches(row, "power_penetration") ? [label] : [],
      powerLocation: accessoryTypeMatches(row, "power_location") ? [label] : [],
      flexLength: accessoryTypeMatches(row, "flex_length") ? [label] : [],
      egressLight: egressLightOption ? [egressLightOption.value] : [],
      egressSound: egressSoundId ? [egressSoundId] : [],
      sensor: sensorOption ? [sensorOption.value] : [],
      accessories: genericAccessoryValue,
    }, "ACCESSORIES row maps donor egress, EWIS/sound, sensor, and standard accessory preferences without exposing raw rows");
  }

  return records;
}

function stripDirectionSuffix(value) {
  return safeString(value).replace(/\|(direct|indirect)$/i, "");
}

function valuesMatch(left, right) {
  return normaliseKey(stripDirectionSuffix(left)) === normaliseKey(stripDirectionSuffix(right));
}

function constraintValueMatches(fieldKey, candidateValue, selectedValue) {
  return valuesMatch(candidateValue, selectedValue);
}

function normalisedTokenSet(value = "") {
  return new Set(normaliseKey(value).split(/[^a-z0-9]+/).filter(Boolean));
}

function systemSelectionMatchesOption(option = {}, selectedValue = "") {
  if (!safeString(selectedValue)) return false;
  if (valuesMatch(option.value, selectedValue) || valuesMatch(option.label, selectedValue) || valuesMatch(option.systemReferenceKey, selectedValue)) return true;

  const systemKey = safeString(option.systemReferenceKey || safeString(option.value).split("|")[0]);
  if (!systemKey) return false;
  const selectedTokens = normalisedTokenSet(selectedValue);
  if (!selectedTokens.has(normaliseKey(systemKey))) return false;

  const variant = safeString(option.systemVariantKey || safeString(option.value).split("|").slice(1).join("|"));
  if (!variant) return true;
  const variantKey = normaliseKey(variant);
  const selectedKey = normaliseKey(selectedValue).replace(/[^a-z0-9]+/g, " ").trim();
  if (selectedKey.includes(variantKey.replace(/[^a-z0-9]+/g, " ").trim())) return true;
  return Array.from(normalisedTokenSet(variant)).every((token) => selectedTokens.has(token));
}

function systemReferenceKeyFromSelection(systemOptions = [], selectedValue = "") {
  if (!safeString(selectedValue)) return "";
  const match = systemOptions.find((option) => systemSelectionMatchesOption(option, selectedValue));
  return match ? safeString(match.systemReferenceKey) || safeString(match.value).split("|")[0] || safeString(match.label) : "";
}

function cascadeConstraintsForOptions(bucket = {}, constraints = {}) {
  const selectedSystemKey = systemReferenceKeyFromSelection(optionsFor(bucket, "system"), constraints.system || "");
  if (!selectedSystemKey) return constraints;
  return { ...constraints, system: selectedSystemKey };
}

function recordConstraintBlockers(record, constraints, exceptFieldKey = "") {
  const blockers = [];
  for (const [fieldKey, selected] of Object.entries(constraints)) {
    if (fieldKey === exceptFieldKey || !safeString(selected)) continue;
    const values = Array.isArray(record.fields?.[fieldKey]) ? record.fields[fieldKey] : [];
    if (values.length && !values.some((value) => constraintValueMatches(fieldKey, value, selected))) {
      blockers.push({
        fieldKey,
        selectedValue: selected,
        compatibleValues: values,
      });
    }
  }
  return blockers;
}

function recordMatchesConstraints(record, constraints, exceptFieldKey = "") {
  return recordConstraintBlockers(record, constraints, exceptFieldKey).length === 0;
}

function optionCascadeResult(fieldKey, option, records, constraints) {
  const relatedRecords = records.filter((record) => Array.isArray(record.fields?.[fieldKey]) && record.fields[fieldKey].some((value) => valuesMatch(value, option.value)));
  if (!relatedRecords.length) {
    return {
      compatible: true,
      blockedBy: [],
      relationshipStatus: "unconstrained",
      relationshipMissingReason: "No safe source relationship record links this option to current upstream constraints.",
    };
  }
  const matchingRecord = relatedRecords.find((record) => recordMatchesConstraints(record, constraints, fieldKey));
  if (matchingRecord) {
    return {
      compatible: true,
      blockedBy: [],
      relationshipStatus: "matched",
      cascadeSource: matchingRecord.sourceTables || [],
      relationshipMissingReason: "",
    };
  }
  const blockedBy = relatedRecords.flatMap((record) => recordConstraintBlockers(record, constraints, fieldKey));
  return {
    compatible: false,
    blockedBy,
    relationshipStatus: "blocked-by-constraints",
    cascadeSource: uniqueStrings(relatedRecords.flatMap((record) => record.sourceTables || [])),
    relationshipMissingReason: "Safe source relationships exist, but none match the current upstream manual constraints.",
  };
}

function optionAllowedByRecords(fieldKey, option, records, constraints) {
  return optionCascadeResult(fieldKey, option, records, constraints).compatible;
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

function optionSelectedByValue(fieldKey, option, value) {
  if (!safeString(value)) return false;
  if (valuesMatch(option.value, value)) return true;
  if (fieldKey === "system") return systemSelectionMatchesOption(option, value);
  return false;
}

function labelForSelectedValue(options, value, fieldKey = "") {
  const option = options.find((item) => optionSelectedByValue(fieldKey, item, value));
  return option?.label || safeString(value);
}

function labelForValue(options, value) {
  return labelForSelectedValue(options, value);
}

function createFields({ bucket, records, constraints, cascadeConstraints = constraints, sourceReady }) {
  return TARGET_FIELDS.map((field) => {
    const baseOptions = optionsFor(bucket, field.fieldKey);
    const selectedValue = constraints[field.fieldKey] || "";
    if (!sourceReady) return createUnavailableField(field, "Selector Reference source is unavailable or not parseable.");
    if (!baseOptions.length) return createUnavailableField(field, `${field.label} is unavailable from current source and remains future mapped; no fake values emitted.`);

    const options = baseOptions.map((option) => {
      const cascade = optionCascadeResult(field.fieldKey, option, records, cascadeConstraints);
      const selected = optionSelectedByValue(field.fieldKey, option, selectedValue);
      return {
        ...option,
        selected: Boolean(selected),
        status: cascade.compatible ? "available" : "blocked",
        blocked: !cascade.compatible,
        blockedReason: cascade.compatible ? "" : "Blocked by current manual constraints; shown rather than silently hidden.",
        blockedBy: cascade.blockedBy,
        cascadeSource: cascade.cascadeSource || option.sourceTables || [],
        relationshipStatus: cascade.relationshipStatus,
        relationshipMissingReason: cascade.relationshipMissingReason,
        compatibleWithCurrentConstraints: cascade.compatible,
        preservesManualConstraint: Boolean(selected),
        writes: false,
        rawRowsExposed: false,
      };
    });

    if (selectedValue && !options.some((option) => optionSelectedByValue(field.fieldKey, option, selectedValue))) {
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
      selectedLabel: selectedValue ? labelForSelectedValue(options, selectedValue, field.fieldKey) : "",
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

function inheritedSourceForField(fieldKey, constraints = {}) {
  if (["finishCover", "finishEnd", "finishFlex", "inheritedFinishStatus"].includes(fieldKey)) return constraints.bodyFinish ? "bodyFinish manual constraint" : "default/body finish preview";
  if (["indirectMatchDirect", "cctCriIndirect", "controlTypeIndirect"].includes(fieldKey)) return "direct light/control preview";
  return "safe DB/reference cascade preview";
}

function indirectFieldRequiresSupport(fieldKey) {
  return ["opticIndirect", "indirectOpticVar1", "indirectOpticVar2", "indirectMatchDirect", "targetLmPerMIndirect", "cctCriIndirect", "controlTypeIndirect"].includes(fieldKey);
}

function upstreamIndirectSupportState(records = [], constraints = {}) {
  const upstreamSelected = Boolean(constraints.system || constraints.emission);
  if (!upstreamSelected) {
    return {
      supported: false,
      checked: false,
      blockedBy: [{ fieldKey: "system", selectedValue: "not selected", compatibleValues: ["system with indirect emission"] }],
    };
  }
  const selectedSystem = safeString(constraints.system || "");
  const systemRecords = selectedSystem
    ? records.filter((record) => (record.sourceTables || []).includes("SYSTEM") && Array.isArray(record.fields?.system) && record.fields.system.some((value) => valuesMatch(value, selectedSystem)))
    : [];
  const recordsToCheck = systemRecords.length
    ? systemRecords
    : records.filter((record) => Array.isArray(record.fields?.indirectCapability) && record.fields.indirectCapability.some((value) => valuesMatch(value, "indirect-supported")));
  const supported = recordsToCheck.some((record) => Array.isArray(record.fields?.indirectCapability) && record.fields.indirectCapability.some((value) => valuesMatch(value, "indirect-supported")) && recordMatchesConstraints(record, constraints, "indirectCapability"));
  return {
    supported,
    checked: true,
    blockedBy: supported ? [] : [{ fieldKey: "indirectCapability", selectedValue: "unsupported by current upstream selection", compatibleValues: ["indirect-supported"] }],
  };
}

function workflowOptionAllowed(fieldKey, option, records, constraints) {
  if (!option || option.status === "disabled") return false;
  return optionAllowedByRecords(fieldKey, option, records, constraints);
}

function createDisabledWorkflowField(field, reason) {
  return {
    fieldKey: field.fieldKey,
    label: field.label,
    role: field.role || "disabled",
    status: "disabled",
    sourceStatus: "disabled by runtime boundary",
    sourceTables: [...(field.sourceTables || [])],
    options: [],
    selectedValue: "",
    selectedLabel: "",
    unavailableReason: reason,
    futureMapped: false,
    disabled: true,
    rawRowsExposed: false,
  };
}

function opticVar2ParentFieldKey(fieldKey = "") {
  if (fieldKey === "directOpticVar2") return "directOpticVar1";
  if (fieldKey === "indirectOpticVar2") return "indirectOpticVar1";
  if (fieldKey === "diffuserVar2") return "diffuserVar1";
  if (fieldKey === "opticSub") return "optic";
  return "";
}

function workflowParentRuleForField(fieldKey = "", constraints = {}) {
  const opticParent = opticVar2ParentFieldKey(fieldKey);
  if (opticParent) return {
    parentFieldKey: opticParent,
    filterValue: safeString(constraints[opticParent] || ""),
    requiredFieldKeys: [opticParent],
    preserveBlockedOptions: false,
    missingReason: `Select ${opticParent} before optic var-2 sub-variants are derived.`,
    emptyReason: `Selected ${opticParent} has no optic var-2 sub-variants in optic_var_2.`,
  };
  if (fieldKey === "mountSelection") return {
    parentFieldKey: "mountStyle",
    filterValue: safeString(constraints.mountStyle || ""),
    requiredFieldKeys: ["mountStyle"],
    preserveBlockedOptions: true,
    missingReason: "Select mount style before mount selections are derived from ACCESSORIES.mount_selections.",
    emptyReason: "Selected mount style has no mount selections in ACCESSORIES.mount_selections.",
  };
  if (fieldKey === "mountParticulars") return {
    parentFieldKey: "mountStyle",
    filterValue: safeString(constraints.mountStyle || ""),
    requiredFieldKeys: ["mountStyle", "mountSelection"],
    preserveBlockedOptions: true,
    missingReason: "Select mount style and mount selection before mount particulars are derived from ACCESSORIES.mount_particulars.",
    emptyReason: "Selected mount style has no mount particulars in ACCESSORIES.mount_particulars.",
  };
  return null;
}

function safeDeferredChildOptions(baseOptions = []) {
  return baseOptions.map((option) => ({
    ...option,
    selected: false,
    status: "deferred-parent-required",
    blocked: false,
    deferredUntilParentSelected: true,
    writes: false,
    rawRowsExposed: false,
  }));
}

function optionsForSelectedWorkflowParent(fieldKey = "", baseOptions = [], constraints = {}) {
  const rule = workflowParentRuleForField(fieldKey, constraints);
  if (!rule) return { options: baseOptions, parentFieldKey: "", parentValue: "", childFiltered: false, deferredOptions: [], unavailableReason: "" };
  const missingRequired = rule.requiredFieldKeys.find((requiredFieldKey) => !safeString(constraints[requiredFieldKey] || ""));
  if (missingRequired || !rule.filterValue) {
    return {
      options: rule.preserveBlockedOptions ? baseOptions : [],
      parentFieldKey: rule.parentFieldKey,
      parentValue: "",
      childFiltered: true,
      deferredOptions: safeDeferredChildOptions(baseOptions),
      unavailableReason: rule.missingReason,
    };
  }
  const matchingOptions = baseOptions.filter((option) => {
    const parentValues = uniqueStrings([
      option.parentValue,
      ...(Array.isArray(option.parentValues) ? option.parentValues : []),
    ].map(safeString).filter(Boolean));
    return parentValues.some((parentValue) => valuesMatch(parentValue, rule.filterValue));
  });
  return {
    options: rule.preserveBlockedOptions ? baseOptions : matchingOptions,
    parentFieldKey: rule.parentFieldKey,
    parentValue: rule.filterValue,
    childFiltered: true,
    deferredOptions: safeDeferredChildOptions(baseOptions),
    unavailableReason: rule.emptyReason,
  };
}

function createEmptyChildWorkflowField(field, parentFieldKey = "", parentValue = "", deferredOptions = [], unavailableReason = "") {
  return {
    fieldKey: field.fieldKey,
    label: field.label,
    role: field.role,
    status: "blocked",
    sourceStatus: "db-reference-backed child-of-optic-var-1",
    sourceTables: [...(field.sourceTables || [])],
    options: [],
    selectedValue: "",
    selectedLabel: "",
    unavailableReason: unavailableReason || (parentValue
      ? `Selected ${parentFieldKey} has no compatible child options in current source.`
      : `Select ${parentFieldKey} before child options are derived.`),
    deferredOptions: safeDeferredChildOptions(deferredOptions),
    deferredOptionCount: Array.isArray(deferredOptions) ? deferredOptions.length : 0,
    futureMapped: false,
    disabled: false,
    rawRowsExposed: false,
  };
}

function createMetadataWorkflowField(field, baseOptions = [], records = [], constraints = {}, cascadeConstraints = constraints) {
  const selectedValue = constraints[field.fieldKey] || "";
  const options = baseOptions.map((option) => {
    const cascade = optionCascadeResult(field.fieldKey, option, records, cascadeConstraints);
    const selected = optionSelectedByValue(field.fieldKey, option, selectedValue);
    return {
      ...option,
      selected: Boolean(selected),
      status: cascade.compatible ? "metadata-only" : "blocked",
      blocked: !cascade.compatible,
      blockedReason: cascade.compatible ? "" : "Metadata preview is blocked by current upstream constraints; shown rather than silently hidden.",
      blockedBy: cascade.blockedBy,
      cascadeSource: cascade.cascadeSource || option.sourceTables || [],
      relationshipStatus: cascade.relationshipStatus,
      relationshipMissingReason: cascade.relationshipMissingReason,
      compatibleWithCurrentConstraints: cascade.compatible,
      preservesManualConstraint: Boolean(selected),
      metadataOnly: true,
      visualChoice: option.visualChoice === true,
      specCodeGenerationEnabled: false,
      writes: false,
      rawRowsExposed: false,
    };
  });
  const previewOption = options.find((option) => option.blocked !== true) || options[0] || null;
  return {
    fieldKey: field.fieldKey,
    label: field.label,
    role: field.role,
    status: previewOption ? "metadata-only" : "future-mapped",
    sourceStatus: previewOption ? "db-reference-backed metadata-only" : "unavailable from current source",
    sourceTables: [...(field.sourceTables || [])],
    options,
    selectedValue: selectedValue || previewOption?.value || "",
    selectedLabel: selectedValue ? labelForSelectedValue(options, selectedValue, field.fieldKey) : previewOption?.label || "",
    unavailableReason: previewOption ? "Metadata preview only. No spec code, slug, image, artefact, proof, or write is generated." : `${field.label} metadata is unavailable from the current source; no fake values emitted.`,
    futureMapped: !previewOption,
    disabled: true,
    metadataOnly: true,
    specCodeGenerationEnabled: false,
    writes: false,
    rawRowsExposed: false,
  };
}

function createWorkflowField(field, { bucket, records, constraints, cascadeConstraints = constraints, sourceReady }) {
  const selectedValue = constraints[field.fieldKey] || "";
  if (!sourceReady) return createUnavailableField(field, "Selector Reference source is unavailable or not parseable.");
  if (field.role === "disabled") return createDisabledWorkflowField(field, "Disabled read-only preview. No workflow action, generation, write, proof, payload, RunTable, HubSpot push, save, or hidden write-back is available in this slice.");
  if (field.role === "future-mapped") return createUnavailableField(field, `${field.label} is a donor workflow field but is not source-backed in this runtime slice.`);

  const rawBaseOptions = optionsFor(bucket, field.fieldKey);
  const childOptions = optionsForSelectedWorkflowParent(field.fieldKey, rawBaseOptions, constraints);
  const baseOptions = childOptions.options;
  if (childOptions.childFiltered && !baseOptions.length) {
    const emptyField = createEmptyChildWorkflowField(field, childOptions.parentFieldKey, childOptions.parentValue, childOptions.deferredOptions, childOptions.unavailableReason);
    if (!selectedValue) return emptyField;
    return {
      ...emptyField,
      selectedValue,
      selectedLabel: selectedValue,
      options: [{
        value: selectedValue,
        label: selectedValue,
        count: 0,
        sourceStatus: "selected constraint not available from current filtered source",
        sourceTables: [...(field.sourceTables || [])],
        selected: true,
        status: "blocked",
        blocked: true,
        blockedReason: "Manual constraint is preserved but unavailable/incompatible in the current filtered source.",
        writes: false,
        rawRowsExposed: false,
      }],
      status: "blocked",
    };
  }
  if (field.role === "metadata-only") return createMetadataWorkflowField(field, baseOptions, records, constraints, cascadeConstraints);
  if (!baseOptions.length) {
    if (field.role === "entitlement-gated") {
      return createUnavailableField(field, `${field.label} is entitlement-gated. No raw USERS data is exposed, and no entitlement option is faked.`);
    }
    return createUnavailableField(field, `${field.label} is represented for donor parity but unavailable from the current source; no fake values emitted.`);
  }

  const indirectSupport = indirectFieldRequiresSupport(field.fieldKey)
    ? upstreamIndirectSupportState(records, cascadeConstraints)
    : { supported: true, checked: false, blockedBy: [] };
  const options = baseOptions.map((option) => {
    const cascade = optionCascadeResult(field.fieldKey, option, records, cascadeConstraints);
    const compatible = cascade.compatible && indirectSupport.supported;
    const selected = optionSelectedByValue(field.fieldKey, option, selectedValue);
    const inherited = field.role === "inherited-consequence" && compatible;
    const consequence = field.role === "auto-consequence" && compatible;
    const blockedBy = compatible ? [] : [...(cascade.blockedBy || []), ...(indirectSupport.supported ? [] : indirectSupport.blockedBy)];
    return {
      ...option,
      selected: Boolean(selected),
      status: inherited ? "inherited" : consequence ? "auto-consequence" : compatible ? "available" : "blocked",
      blocked: !compatible,
      blockedReason: compatible ? "" : indirectSupport.supported ? "Blocked by current manual constraints; shown rather than silently hidden." : "Indirect fields are blocked because the current system/optic path does not support indirect.",
      blockedBy,
      cascadeSource: cascade.cascadeSource || option.sourceTables || [],
      inheritedFrom: inherited ? inheritedSourceForField(field.fieldKey, constraints) : "",
      relationshipStatus: compatible ? cascade.relationshipStatus : indirectSupport.supported ? cascade.relationshipStatus : "blocked-by-indirect-capability",
      relationshipMissingReason: compatible ? cascade.relationshipMissingReason : indirectSupport.supported ? cascade.relationshipMissingReason : "Current upstream selection does not expose indirect capability in safe relationship metadata.",
      compatibleWithCurrentConstraints: compatible,
      preservesManualConstraint: Boolean(selected),
      writes: false,
      rawRowsExposed: false,
    };
  });

  if (selectedValue && !options.some((option) => optionSelectedByValue(field.fieldKey, option, selectedValue))) {
    options.push({
      value: selectedValue,
      label: selectedValue,
      count: 0,
      sourceStatus: "selected constraint not available from current filtered source",
      sourceTables: [...(field.sourceTables || [])],
      selected: true,
      status: "blocked",
      blocked: true,
      blockedReason: "Manual constraint is preserved but unavailable/incompatible in the current filtered source.",
      rawRowsExposed: false,
    });
  }

  const availableCount = options.filter((option) => option.blocked !== true).length;
  return {
    fieldKey: field.fieldKey,
    label: field.label,
    role: field.role,
    status: availableCount ? (field.role === "inherited-consequence" ? "inherited-consequence" : field.role === "auto-consequence" ? "auto-consequence" : "available") : "blocked",
    sourceStatus: field.role === "entitlement-gated" ? "entitlement-gated-redacted" : "db-reference-backed",
    sourceTables: [...(field.sourceTables || [])],
    options,
    selectedValue,
    selectedLabel: selectedValue ? labelForSelectedValue(options, selectedValue, field.fieldKey) : "",
    unavailableReason: availableCount ? "" : "No compatible options remain under the current manual constraints; values are shown as blocked rather than removed.",
    futureMapped: false,
    disabled: false,
    rawRowsExposed: false,
  };
}

function createWorkflowSections({ bucket, records, constraints, cascadeConstraints = constraints, sourceReady }) {
  return WORKFLOW_SECTION_DEFINITIONS.map((section) => {
    const fields = section.fields.map((field) => createWorkflowField(field, { bucket, records, constraints, cascadeConstraints, sourceReady }));
    const mappedCount = fields.filter((field) => String(field.sourceStatus || "").startsWith("db-reference-backed") || field.sourceStatus === "entitlement-gated-redacted").length;
    const futureMappedCount = fields.filter((field) => field.futureMapped === true).length;
    const disabledCount = fields.filter((field) => field.disabled === true && field.metadataOnly !== true).length;
    return {
      sectionKey: section.sectionKey,
      title: section.title,
      status: disabledCount === fields.length ? "disabled" : futureMappedCount ? "preview-with-gaps" : "preview-ready",
      mappedCount,
      futureMappedCount,
      disabledCount,
      fields,
      rawRowsExposed: false,
    };
  });
}

function donorFieldParity(workflowSections = []) {
  const fields = workflowSections.flatMap((section) => (section.fields || []).map((field) => ({ ...field, sectionKey: section.sectionKey })));
  const items = fields.map((field) => ({
    fieldKey: field.fieldKey,
    label: field.label,
    sectionKey: field.sectionKey,
    status: field.metadataOnly ? "mapped" : field.disabled ? "disabled" : field.futureMapped ? "future-mapped" : "mapped",
    sourceStatus: field.sourceStatus,
    reason: field.unavailableReason || (field.disabled ? "Disabled workflow item." : "Represented in donor workflow preview."),
    rawRowsExposed: false,
  }));
  const counts = items.reduce((acc, item) => {
    acc.total += 1;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { total: 0, mapped: 0, "future-mapped": 0, disabled: 0 });
  return {
    counts,
    items,
    allDonorFieldsRepresented: fields.length === DONOR_FIELD_DEFINITIONS.length,
    rawRowsExposed: false,
    rawUsersExposed: false,
  };
}

function safeEntitlementSummary(snapshot) {
  const users = liveTableRows(snapshot, "USERS");
  const components = liveTableRows(snapshot, "SYSTEM_COMPONENTS");
  const entitlementRows = users.filter((row) => rowOptionValues(row, ["system_component_ids", "system_componrent_ids", "system_component_id"]).length > 0);
  return {
    usersPresent: tableValueCandidates(snapshot, "USERS").length > 0,
    userCount: users.length,
    entitlementRowCount: entitlementRows.length,
    systemComponentCount: components.length,
    personalIdentifiersExposed: false,
    rawUsersExposed: false,
    rawRowsExposed: false,
  };
}

function workflowFields(workflowSections = []) {
  return workflowSections.flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
}

function deriveWorkflowConsequences(workflowSections = [], constraints = {}) {
  const consequences = [];
  for (const field of workflowFields(workflowSections)) {
    if (!["auto-consequence", "inherited-consequence"].includes(field.role) || constraints[field.fieldKey]) continue;
    const option = (Array.isArray(field.options) ? field.options : []).find((item) => item.blocked !== true);
    if (!option) continue;
    consequences.push({
      fieldKey: field.fieldKey,
      label: field.label || field.fieldKey,
      value: option.value,
      valueLabel: option.label,
      kind: field.role,
      source: "safe Selector Reference cascade metadata",
      reason: field.role === "inherited-consequence"
        ? `${field.label || field.fieldKey} is inherited from upstream preview constraints until manually overridden.`
        : `${field.label || field.fieldKey} is an auto consequence of current upstream constraints where mapped.`,
      inheritedFrom: option.inheritedFrom || inheritedSourceForField(field.fieldKey, constraints),
      mutable: true,
      writes: false,
      rawRowsExposed: false,
    });
  }
  return consequences;
}

function workflowBlockedItems(workflowSections = []) {
  const blocked = [];
  for (const field of workflowFields(workflowSections)) {
    if (field.disabled && field.metadataOnly !== true) continue;
    if (field.futureMapped) {
      blocked.push({ fieldKey: field.fieldKey, label: field.label, status: "future-mapped", reason: field.unavailableReason });
      continue;
    }
    for (const option of field.options || []) {
      if (option.selected && option.blocked) {
        blocked.push({
          fieldKey: field.fieldKey,
          label: field.label,
          value: option.value,
          valueLabel: option.label,
          status: "blocked",
          reason: option.blockedReason,
          blockedBy: option.blockedBy || [],
        });
      }
    }
  }
  return blocked;
}

function createDiffuserModelSummary(workflowSections = []) {
  const fields = workflowFields(workflowSections);
  const field = (fieldKey) => fields.find((item) => item.fieldKey === fieldKey) || { options: [] };
  return {
    firstClass: true,
    var1FieldKey: "diffuserVar1",
    var2FieldKey: "diffuserVar2",
    materialFieldKey: "diffuserMaterial",
    specCodePreviewFieldKey: "diffuserSpecCodePreview",
    imageReadinessFieldKey: "diffuserImageReadiness",
    directFields: ["directOpticVar1", "directOpticVar2"],
    indirectFields: ["indirectOpticVar1", "indirectOpticVar2"],
    var1OptionCount: field("diffuserVar1").options.length,
    var2OptionCount: field("diffuserVar2").options.length,
    materialOptionCount: field("diffuserMaterial").options.length,
    specCodePreviewOptionCount: field("diffuserSpecCodePreview").options.length,
    imageReadinessOptionCount: field("diffuserImageReadiness").options.length,
    imageReadinessMetadataOnly: true,
    runtimeImageAvailable: false,
    productImagesRendered: false,
    specCodeGenerationEnabled: false,
    slugGenerationEnabled: false,
    rawRowsExposed: false,
    privatePathsExposed: false,
    writes: false,
  };
}

function tableSummary(snapshot) {
  return ALL_FIELD_DEFINITIONS.flatMap((field) => field.sourceTables || []).filter((value, index, values) => values.indexOf(value) === index).map((table) => {
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
  const workflowSections = WORKFLOW_SECTION_DEFINITIONS.map((section) => ({
    sectionKey: section.sectionKey,
    title: section.title,
    status: section.sectionKey === "disabledWorkflow" || section.sectionKey === "runsPreview" ? "disabled" : "source-unavailable",
    mappedCount: 0,
    futureMappedCount: section.sectionKey === "disabledWorkflow" || section.sectionKey === "runsPreview" ? 0 : section.fields.length,
    disabledCount: section.sectionKey === "disabledWorkflow" || section.sectionKey === "runsPreview" ? section.fields.length : 0,
    fields: section.fields.map((field) => (
      section.sectionKey === "disabledWorkflow" || section.sectionKey === "runsPreview"
        ? createDisabledWorkflowField(field, "Disabled read-only preview. No workflow action is available in this slice.")
        : createUnavailableField(field, reason)
    )),
    rawRowsExposed: false,
  }));
  const parity = donorFieldParity(workflowSections);
  return {
    ok: false,
    endpoint: SELECTOR_REFERENCE_OPTIONS_PATH,
    owner: "runtime-server",
    status: "source-unavailable",
    source,
    sourceReady: false,
    selectedConstraints: safeConstraints,
    fields,
    workflowSections,
    donorFieldParity: parity,
    diffuserModelSummary: createDiffuserModelSummary(workflowSections),
    specialPartsEntitlementSummary: {
      usersPresent: false,
      userCount: 0,
      entitlementRowCount: 0,
      systemComponentCount: 0,
      personalIdentifiersExposed: false,
      rawUsersExposed: false,
      rawRowsExposed: false,
    },
    manualConstraints: [],
    autoConsequences: [],
    blockedItems: blockedItems(fields),
    candidateSummary: {
      state: "source unavailable",
      optionFieldCount: 0,
      availableFieldCount: 0,
      workflowSectionCount: workflowSections.length,
      workflowMappedFieldCount: 0,
      donorFieldParityCounts: parity.counts,
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
  const cascadeConstraints = cascadeConstraintsForOptions(bucket, safeConstraints);
  const fields = createFields({ bucket, records, constraints: safeConstraints, cascadeConstraints, sourceReady });
  const workflowSections = createWorkflowSections({ bucket, records, constraints: safeConstraints, cascadeConstraints, sourceReady });
  const manualConstraints = createManualConstraintList(fields, safeConstraints);
  const autoConsequences = [
    ...deriveAutoConsequences(fields, safeConstraints),
    ...deriveWorkflowConsequences(workflowSections, safeConstraints),
  ];
  const blocked = [...blockedItems(fields), ...workflowBlockedItems(workflowSections)];
  const parity = donorFieldParity(workflowSections);
  const entitlementSummary = safeEntitlementSummary(safeSnapshot);
  const availableFieldCount = fields.filter((field) => field.status === "available").length;
  const optionFieldCount = fields.filter((field) => field.options.length).length;
  const workflowMappedFieldCount = parity.counts.mapped || 0;
  const hasMissing = fields.some((field) => field.futureMapped) || (parity.counts["future-mapped"] || 0) > 0;
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
    workflowSections,
    donorFieldParity: parity,
    specialPartsEntitlementSummary: entitlementSummary,
    diffuserModelSummary: createDiffuserModelSummary(workflowSections),
    manualConstraints,
    autoConsequences,
    blockedItems: blocked,
    candidateSummary: {
      state: manualConstraints.length ? (hasBlocked ? "manual constraints with blockers" : "manual constraints preview") : "default preview",
      optionFieldCount,
      availableFieldCount,
      workflowSectionCount: workflowSections.length,
      workflowMappedFieldCount,
      donorFieldParityCounts: parity.counts,
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
