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
    title: "Runs & Disabled Outputs",
    fields: [
      { fieldKey: "runCount", label: "Run count/list", role: "disabled", sourceTables: [] },
      { fieldKey: "runQty", label: "Qty", role: "disabled", sourceTables: [] },
      { fieldKey: "runLength", label: "Length", role: "disabled", sourceTables: [] },
      { fieldKey: "runLengthMode", label: "Length mode", role: "disabled", sourceTables: [] },
      { fieldKey: "runOverrideStatus", label: "Override status", role: "future-mapped", sourceTables: [] },
      { fieldKey: "runPlacementStatus", label: "Placement status", role: "future-mapped", sourceTables: [] },
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
      { fieldKey: "hubSpotCrmWriteBack", label: "HubSpot / CRM write-back", role: "disabled", sourceTables: [] },
      { fieldKey: "specBuildAuthority", label: "Spec/build authority", role: "disabled", sourceTables: [] },
      { fieldKey: "slugSpecGeneration", label: "Slug/spec generation", role: "disabled", sourceTables: [] },
      { fieldKey: "runTableGeneration", label: "RunTable generation", role: "disabled", sourceTables: [] },
      { fieldKey: "payloadGeneration", label: "Payload generation", role: "disabled", sourceTables: [] },
      { fieldKey: "iesGeneration", label: "IES generation", role: "disabled", sourceTables: [] },
      { fieldKey: "payloadRunTableGeneration", label: "Payload / RunTable generation", role: "disabled", sourceTables: [] },
      { fieldKey: "drawingGeneration", label: "Drawing generation", role: "disabled", sourceTables: [] },
      { fieldKey: "controlledRecords", label: "Controlled Records writes", role: "disabled", sourceTables: [] },
      { fieldKey: "rregApprovalCustody", label: "RREG approval / custody transfer", role: "disabled", sourceTables: [] },
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

const SURFACE_MOUNT_DI_BLOCK_POLICY_ID = "SURFACE_MOUNT_DI_BLOCK";
const SURFACE_MOUNT_DI_BLOCK_DEFAULT_REASON = "Surface Mount is blocked for direct-indirect/uplight systems because the ceiling would block the indirect light component.";
const UNMATCHED_SYSTEM_MOUNT_STYLE_KEY = "__unmatched-system-mount-style__";

const SAFE_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  optionFilteringReadOnly: true,
  rawRowsExposed: false,
  rawRowsReturned: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUsersReturned: false,
  rawUserHeadersExposed: false,
  rawLabEvidenceExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  privatePathsReturned: false,
  donorEngineInvoked: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  activeResolverEnabled: false,
  selectorResolvingEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  specCodeGenerationEnabled: false,
  iesGenerationEnabled: false,
  iesGenerated: false,
  payloadGenerationEnabled: false,
  runTableGenerationEnabled: false,
  runTableGenerated: false,
  drawingGenerationEnabled: false,
  selectedResultPersisted: false,
  routesAdded: false,
  postEndpointsAdded: false,
  labProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  rregApprovalEnabled: false,
  rregCustodyTransferEnabled: false,
  runtimeDataMutationEnabled: false,
  runtimeDataMutated: false,
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

const SELECTOR_STATUS_CLASSES = Object.freeze(["available", "approved", "staged", "roadmap", "obsolete", "unknown"]);
const STATUS_VISIBLE_CLASSES = Object.freeze(new Set(["available", "approved"]));
const STATUS_REVIEW_CLASSES = Object.freeze(new Set(["unknown"]));
const DEFAULT_TIMELINE_VISIBLE_STATUSES = Object.freeze(["available", "approved"]);
const SPECIAL_PARTS_ALLAN_TEST_EMAIL = "allan@zencontrol.com";
const SPECIAL_PARTS_UNKNOWN_TEST_EMAIL = "unknown@example.test";
const SPECIAL_PARTS_INTERNAL_TEST_PRINCIPALS = Object.freeze([
  Object.freeze({ value: SPECIAL_PARTS_ALLAN_TEST_EMAIL, label: "Allan Organ <allan@zencontrol.com>" }),
  Object.freeze({ value: SPECIAL_PARTS_UNKNOWN_TEST_EMAIL, label: "Unknown / unentitled <unknown@example.test>" }),
]);
export const SELECTOR_TIMELINE_VISIBILITY_MODES = Object.freeze({
  EXTERNAL_DEFAULT: "external-default",
  INTERNAL_ASOF_TEST: "internal-asof-test",
});
export const SELECTOR_TIMELINE_VISIBLE_STATUS_OPTIONS = Object.freeze([...SELECTOR_STATUS_CLASSES]);
const TIMELINE_STATUS_DATE_KEYS = Object.freeze([
  "status_date",
  "statusDate",
  "available_from",
  "availableFrom",
  "effective_from",
  "effectiveFrom",
  "release_date",
  "releaseDate",
]);

function sourceRowPassesApprovalGate(row) {
  const approved = safeLower(rowText(row, ["approved", "is_approved", "approved_for_selector"], "yes"));
  return !["false", "no", "0", "n", "rejected"].includes(approved);
}

function rawStatusText(row) {
  return rowText(row, ["timeline_status", "status", "availability", "lifecycle_status", "product_status", "option_status", "effective_status"]);
}

function optionStatusClassFromValue(value, approvedValue = "") {
  const key = normaliseKey(value);
  if (!key) {
    const approved = safeLower(approvedValue);
    if (["approved", "yes", "true", "1", "y"].includes(approved)) return "approved";
    return "unknown";
  }
  if (["available", "active", "current", "live", "released", "release", "sellable", "orderable"].includes(key)) return "available";
  if (["approved", "approved available", "approved for use", "approved for selector"].includes(key)) return "approved";
  if (["staged", "stage", "pilot", "preview", "pre release", "preproduction", "pre production", "pending release", "business case"].includes(key)) return "staged";
  if (["roadmap", "future", "planned", "concept", "proposed", "under development", "development"].includes(key)) return "roadmap";
  if (["obsolete", "retired", "deleted", "inactive", "discontinued", "superseded", "end of life", "eol"].includes(key)) return "obsolete";
  return "unknown";
}

function optionStatusClassForRow(row) {
  const approved = rowText(row, ["approved", "is_approved", "approved_for_selector"], "");
  return optionStatusClassFromValue(rawStatusText(row), approved);
}

function isoTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseTimelineDate(value) {
  const raw = safeString(value);
  if (!raw) return { raw, isoDate: "", timestamp: null, valid: false };
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const timestamp = Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return { raw, isoDate: raw, timestamp, valid: Number.isFinite(timestamp) };
  }
  const auMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (auMatch) {
    const day = Number(auMatch[1]);
    const month = Number(auMatch[2]);
    const year = Number(auMatch[3]);
    const timestamp = Date.UTC(year, month - 1, day);
    const isoDate = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { raw, isoDate, timestamp, valid: Number.isFinite(timestamp) };
  }
  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp)) return { raw, isoDate: "", timestamp: null, valid: false };
  return { raw, isoDate: new Date(timestamp).toISOString().slice(0, 10), timestamp, valid: true };
}

function rowStatusDate(row) {
  return rowText(row, TIMELINE_STATUS_DATE_KEYS);
}

export function normaliseSelectorTimelineVisibilityMode(value = "") {
  return safeString(value) === SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST
    ? SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST
    : SELECTOR_TIMELINE_VISIBILITY_MODES.EXTERNAL_DEFAULT;
}

function normaliseSelectorTimelineStatus(value = "") {
  const status = optionStatusClassFromValue(value);
  return SELECTOR_STATUS_CLASSES.includes(status) ? status : "unknown";
}

export function normaliseSelectorTimelineVisibleStatuses(value = DEFAULT_TIMELINE_VISIBLE_STATUSES) {
  const rawValues = Array.isArray(value)
    ? value
    : safeString(value).split(/[;,|]/);
  const statuses = uniqueStrings(rawValues
    .map((item) => normaliseSelectorTimelineStatus(item))
    .filter((item) => SELECTOR_STATUS_CLASSES.includes(item)));
  return statuses.length ? statuses : [...DEFAULT_TIMELINE_VISIBLE_STATUSES];
}

export function createSelectorTimelineContext({ timelineVisibilityMode = "", timelineAsOfDate = "", timelineVisibleStatuses = DEFAULT_TIMELINE_VISIBLE_STATUSES } = {}) {
  const mode = normaliseSelectorTimelineVisibilityMode(timelineVisibilityMode);
  const active = mode === SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST;
  const asOfInput = active ? safeString(timelineAsOfDate || isoTodayDate()) : "";
  const parsedAsOf = parseTimelineDate(asOfInput);
  const visibleStatuses = active
    ? normaliseSelectorTimelineVisibleStatuses(timelineVisibleStatuses)
    : [...DEFAULT_TIMELINE_VISIBLE_STATUSES];
  return {
    timelineVisibilityMode: mode,
    timelineAsOfDate: active ? (parsedAsOf.isoDate || asOfInput) : "",
    timelineAsOfDateRaw: asOfInput,
    timelineAsOfDateValid: active ? parsedAsOf.valid : true,
    timelineAsOfTimestamp: active && parsedAsOf.valid ? parsedAsOf.timestamp : null,
    timelineVisibleStatuses: visibleStatuses,
    timelineVisibleStatusOptions: [...SELECTOR_TIMELINE_VISIBLE_STATUS_OPTIONS],
    internalAsOfTestMode: active,
    source: "selector-reference-options-timeline-policy",
    queryParamOnly: true,
    getQueryParamsOnly: true,
    readOnly: true,
    diagnosticOnly: true,
    productionActionsEnabled: false,
    engineEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    selectedResultPersistenceEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    rawRowsExposed: false,
  };
}

function statusPolicyForClass(optionStatusClass = "unknown", timelineContext = createSelectorTimelineContext(), statusDate = "") {
  const safeClass = SELECTOR_STATUS_CLASSES.includes(optionStatusClass) ? optionStatusClass : "unknown";
  const rowDate = parseTimelineDate(statusDate);
  const visibleStatuses = new Set(normaliseSelectorTimelineVisibleStatuses(timelineContext?.timelineVisibleStatuses || DEFAULT_TIMELINE_VISIBLE_STATUSES));
  if (STATUS_VISIBLE_CLASSES.has(safeClass)) return {
    optionStatusClass: safeClass,
    timelineVisibilityMode: timelineContext?.timelineVisibilityMode || SELECTOR_TIMELINE_VISIBILITY_MODES.EXTERNAL_DEFAULT,
    timelineAvailability: timelineContext?.internalAsOfTestMode === true ? "visible-to-internal-asof-test" : "visible-to-external-default",
    blockedByStatusPolicy: false,
    reviewRequired: false,
    productionBlocked: false,
    internalTimelineTestOnly: false,
    roadmapReviewOnly: false,
    statusDate: rowDate.isoDate,
    statusDateRaw: rowDate.raw,
    blockedReason: "",
  };
  const asOfTimestamp = timelineContext?.timelineAsOfTimestamp;
  const visibleStatusSelected = visibleStatuses.has(safeClass);
  const visibleInInternalAsOf = timelineContext?.internalAsOfTestMode === true
    && timelineContext.timelineAsOfDateValid !== false
    && visibleStatusSelected
    && rowDate.valid
    && Number.isFinite(asOfTimestamp)
    && rowDate.timestamp <= asOfTimestamp;
  if (visibleInInternalAsOf) {
    return {
      optionStatusClass: safeClass,
      timelineVisibilityMode: SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST,
      timelineAvailability: "visible-to-internal-asof-test",
      blockedByStatusPolicy: false,
      reviewRequired: true,
      productionBlocked: true,
      internalTimelineTestOnly: true,
      roadmapReviewOnly: safeClass === "roadmap" || safeClass === "staged",
      futureOrRoadmapBlocked: true,
      statusDate: rowDate.isoDate,
      statusDateRaw: rowDate.raw,
      blockedReason: `${safeClass} status is visible only for internal timeline/as-of cascade testing; it remains future / blocked / review-only for production outputs.`,
    };
  }
  const missingOrFutureDateReason = timelineContext?.internalAsOfTestMode === true && visibleStatusSelected
    ? `The ${safeClass} row is not visible because its status_date is missing, invalid, or after the selected timeline as-of date.`
    : `${safeClass} status is not included in the selected visible status set.`;
  return {
    optionStatusClass: safeClass,
    timelineVisibilityMode: timelineContext?.timelineVisibilityMode || SELECTOR_TIMELINE_VISIBILITY_MODES.EXTERNAL_DEFAULT,
    timelineAvailability: STATUS_REVIEW_CLASSES.has(safeClass) ? "review-required" : "hidden-by-timeline-status-policy",
    blockedByStatusPolicy: true,
    reviewRequired: STATUS_REVIEW_CLASSES.has(safeClass),
    productionBlocked: safeClass !== "unknown",
    internalTimelineTestOnly: false,
    roadmapReviewOnly: false,
    futureOrRoadmapBlocked: safeClass === "roadmap" || safeClass === "staged",
    statusDate: rowDate.isoDate,
    statusDateRaw: rowDate.raw,
    blockedReason: STATUS_REVIEW_CLASSES.has(safeClass) ? "Status is unknown; external/default view fails safe and requires review." : missingOrFutureDateReason,
  };
}

const selectorTimelineStatusPolicyForClassBase = statusPolicyForClass;
statusPolicyForClass = function statusPolicyForClassWithExternalDefaultParity(optionStatusClass = "unknown", timelineContext = createSelectorTimelineContext(), statusDate = "") {
  const policy = selectorTimelineStatusPolicyForClassBase(optionStatusClass, timelineContext, statusDate);
  const safeClass = SELECTOR_STATUS_CLASSES.includes(policy.optionStatusClass) ? policy.optionStatusClass : "unknown";
  if (timelineContext?.internalAsOfTestMode !== true && policy.blockedByStatusPolicy === true && !STATUS_REVIEW_CLASSES.has(safeClass)) {
    return {
      ...policy,
      timelineAvailability: "hidden-from-external-default",
      blockedReason: `${safeClass} status is blocked by external default timeline/status policy.`,
    };
  }
  return policy;
};

function rowStatusOptionMeta(row, timelineContext = createSelectorTimelineContext()) {
  return statusPolicyForClass(optionStatusClassForRow(row), timelineContext, rowStatusDate(row));
}

function optionStatusPolicy(option = {}) {
  if (option.internalTimelineTestOnly === true && option.timelineAvailability === "visible-to-internal-asof-test") {
    return {
      optionStatusClass: option.optionStatusClass || "roadmap",
      timelineVisibilityMode: SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST,
      timelineAvailability: option.timelineAvailability,
      blockedByStatusPolicy: false,
      reviewRequired: true,
      productionBlocked: true,
      internalTimelineTestOnly: true,
      roadmapReviewOnly: option.roadmapReviewOnly !== false,
      futureOrRoadmapBlocked: true,
      statusDate: safeString(option.statusDate || ""),
      statusDateRaw: safeString(option.statusDateRaw || ""),
      blockedReason: option.statusPolicyBlockedReason || "Internal as-of roadmap option is review-only and blocked for production outputs.",
    };
  }
  return statusPolicyForClass(option.optionStatusClass || "unknown");
}

function optionStatusVisibility(option = {}, selected = false) {
  const policy = optionStatusPolicy(option);
  return {
    policy,
    hidden: policy.blockedByStatusPolicy === true && selected !== true,
    blocked: policy.blockedByStatusPolicy === true,
    blockedBy: policy.blockedByStatusPolicy === true ? [{ fieldKey: "timelineStatus", selectedValue: policy.optionStatusClass, compatibleValues: ["available", "approved"] }] : [],
  };
}

function selectedStatusBlockedOption(field = {}, selectedValue = "", reason = "Manual constraint is preserved but unavailable/incompatible in the current filtered source.") {
  const policy = statusPolicyForClass("unknown");
  return {
    value: selectedValue,
    label: selectedValue,
    count: 0,
    sourceStatus: "selected constraint not available from current filtered source",
    sourceTables: [...(field.sourceTables || [])],
    selected: true,
    status: "blocked",
    blocked: true,
    blockedReason: reason,
    blockedBy: [{ fieldKey: "timelineStatus", selectedValue: policy.optionStatusClass, compatibleValues: ["available", "approved"] }],
    optionStatusClass: policy.optionStatusClass,
    timelineAvailability: policy.timelineAvailability,
    blockedByStatusPolicy: true,
    statusPolicyReviewRequired: true,
    rawRowsExposed: false,
    rawRowsReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
  };
}

function sourceRowIsLive(row, timelineContext = createSelectorTimelineContext()) {
  return sourceRowPassesApprovalGate(row) && rowStatusOptionMeta(row, timelineContext).blockedByStatusPolicy !== true;
}

function selectorOptionRows(snapshot, tableName, timelineContext = createSelectorTimelineContext()) {
  void timelineContext;
  return tableRows(snapshot, tableName).filter(sourceRowPassesApprovalGate);
}

function liveTableRows(snapshot, tableName, timelineContext = createSelectorTimelineContext()) {
  return tableRows(snapshot, tableName).filter((row) => sourceRowIsLive(row, timelineContext));
}

function activeCodePolicyRow(snapshot, policyId) {
  const wanted = normaliseKey(policyId);
  if (!wanted) return null;
  return liveTableRows(snapshot, "CODE_POLICY").find((row) => {
    const ids = [
      rowText(row, ["rule_id"]),
      rowText(row, ["policy_id"]),
      rowText(row, ["code_policy_id"]),
      rowText(row, ["id"]),
      rowText(row, ["key"]),
      rowText(row, ["name"]),
      rowText(row, ["item"]),
    ];
    return ids.some((id) => normaliseKey(id) === wanted);
  }) || null;
}

function codePolicyReason(row, fallback = "") {
  return rowText(row, ["user_visible_ui", "user_visible_reason", "ui_reason", "reason", "effect", "description", "notes"], fallback);
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
  codePolicyIds = [],
  codePolicyReason = "",
  optionStatusClass = "available",
  timelineAvailability = "",
  blockedByStatusPolicy = false,
  reviewRequired = false,
  productionBlocked = false,
  internalTimelineTestOnly = false,
  roadmapReviewOnly = false,
  futureOrRoadmapBlocked = false,
  statusDate = "",
  statusDateRaw = "",
  blockedReason = "",
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
  const safeCodePolicyIds = uniqueStrings((Array.isArray(codePolicyIds) ? codePolicyIds : [codePolicyIds]).map(safeString).filter(Boolean));
  const statusPolicy = optionStatusPolicy({
    optionStatusClass,
    timelineAvailability,
    internalTimelineTestOnly,
    productionBlocked,
    roadmapReviewOnly,
    statusDate,
    statusDateRaw,
    statusPolicyBlockedReason: blockedReason,
  });
  const safeTimelineAvailability = safeString(timelineAvailability || statusPolicy.timelineAvailability);
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
    rawRowsReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    optionStatusClass: statusPolicy.optionStatusClass,
    timelineAvailability: safeTimelineAvailability,
    blockedByStatusPolicy: blockedByStatusPolicy === true || statusPolicy.blockedByStatusPolicy === true,
    statusPolicyReviewRequired: reviewRequired === true || statusPolicy.reviewRequired === true,
    productionBlocked: productionBlocked === true || statusPolicy.productionBlocked === true,
    internalTimelineTestOnly: internalTimelineTestOnly === true || statusPolicy.internalTimelineTestOnly === true,
    roadmapReviewOnly: roadmapReviewOnly === true || statusPolicy.roadmapReviewOnly === true,
    futureOrRoadmapBlocked: futureOrRoadmapBlocked === true || statusPolicy.futureOrRoadmapBlocked === true,
    statusDate: safeString(statusDate || statusPolicy.statusDate || ""),
    statusDateRaw: safeString(statusDateRaw || statusPolicy.statusDateRaw || ""),
    statusPolicyBlockedReason: statusPolicy.blockedReason,
    systemReferenceKey: safeString(systemReferenceKey || referenceKeys[0] || ""),
    systemReferenceKeys: referenceKeys,
    systemVariantKey: safeString(systemVariantKey),
    systemSupportsIndirect: systemSupportsIndirect === true,
    compatibleControlTypes: controlTypes,
    finishInheritanceIndex: safeFinishInheritanceIndex,
    codePolicyIds: safeCodePolicyIds,
    codePolicyReason: safeString(codePolicyReason),
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
    for (const key of ["diffuserLayer", "parentFieldKey", "parentValue", "specCodePreview", "specCodeVar2Preview", "diffuserMaterial", "imageReadiness", "imageKey", "systemReferenceKey", "systemVariantKey", "timelineAvailability", "statusDate", "statusDateRaw"]) {
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
    existing.codePolicyIds = uniqueStrings([
      ...(Array.isArray(existing.codePolicyIds) ? existing.codePolicyIds : []),
      ...(Array.isArray(meta.codePolicyIds) ? meta.codePolicyIds : [meta.codePolicyIds]),
    ].map(safeString).filter(Boolean));
    if (!existing.codePolicyReason && meta.codePolicyReason) existing.codePolicyReason = safeString(meta.codePolicyReason);
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

function systemIdentityValueForTokens(tokens = {}) {
  return [tokens.system, tokens.variant].map(safeString).filter(Boolean).join("|") || safeString(tokens.value) || safeString(tokens.label);
}

function systemIdentityValueForRow(row = {}) {
  return systemIdentityValueForTokens(systemTokens(row));
}

function systemRowIdentityKey(row = {}) {
  return systemIdentityValueForRow(row);
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

const SYSTEM_PAINT_FINISH_COLUMNS = Object.freeze([
  "system_and_variant_finish",
  "finish",
  "finish_name",
  "paint_colour",
  "paint_color",
  "paint_finish",
  "body_finish",
  "default_finish",
]);
const SYSTEM_FLEX_COLOUR_COLUMNS = Object.freeze(["flex_map", "flex_colour", "flex_color"]);
const POLICY_PAINT_FINISH_NEEDLES = Object.freeze(["paint", "paint finish", "finish colour", "finish color", "body finish", "default finish"]);
const ACCESSORY_PAINT_FINISH_NEEDLES = Object.freeze(["paint", "finish"]);

function systemPaintFinishValues(row) {
  return rowOptionValues(row, SYSTEM_PAINT_FINISH_COLUMNS);
}

function systemFlexColourValues(row) {
  return rowOptionValues(row, SYSTEM_FLEX_COLOUR_COLUMNS);
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
  if (/\bbracket(?:ed)?\b/.test(text)) return "surface mount";
  return text;
}

function donorMountStyleDisplayLabel(label) {
  const key = canonicalMountStyle(label);
  if (key === "suspended") return "Suspended";
  if (key === "surface mount") return "Surface Mount";
  if (key === "recessed") return "Recessed";
  if (key === "trimless") return "Trimless";
  const clean = safeString(label).replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  return clean || safeString(label);
}

function rawMountStyleLabel(row) {
  return rowText(row, ["display_choice", "mount_style", "name", "style", "label", "accessory_id", "id"]);
}

function mountStyleCandidatesForRow(row) {
  return uniqueStrings([
    rawMountStyleLabel(row),
    ...rowOptionValues(row, ["display_choice", "mount_style", "mount_styles", "name", "style", "label", "accessory_id", "id"]),
  ].map(safeString).filter(Boolean));
}

function mountStyleParentValuesForRow(row) {
  return uniqueStrings(mountStyleCandidatesForRow(row).flatMap((candidate) => [donorMountStyleDisplayLabel(candidate), candidate]).filter(Boolean));
}

function mountStyleCanonicalKeysForRow(row) {
  return uniqueStrings(mountStyleCandidatesForRow(row).map(canonicalMountStyle).filter(Boolean));
}

function systemMountStyleCanonicalKeys(snapshot, row) {
  return uniqueStrings(rowOptionValues(row, ["mount_style", "mount_styles"])
    .filter((mount) => !surfaceMountDiPolicyBlocksSystemMount(snapshot, row, mount))
    .map(canonicalMountStyle)
    .filter(Boolean));
}

function accessoryMountRowMatchesSystemRow(snapshot, accessoryRow, systemRow) {
  const accessoryKeys = mountStyleCanonicalKeysForRow(accessoryRow);
  const systemKeys = systemMountStyleCanonicalKeys(snapshot, systemRow);
  return accessoryKeys.some((accessoryKey) => systemKeys.includes(accessoryKey));
}

function accessoryMountSystemRows(snapshot, accessoryRow) {
  return liveTableRows(snapshot, "SYSTEM").filter((systemRow) => accessoryMountRowMatchesSystemRow(snapshot, accessoryRow, systemRow));
}

function snapshotHasSystemMountStyleSource(snapshot) {
  return liveTableRows(snapshot, "SYSTEM").some((systemRow) => rowOptionValues(systemRow, ["mount_style", "mount_styles"]).length > 0);
}

function accessoryMountSystemReferenceKeys(snapshot, accessoryRow) {
  return uniqueStrings(accessoryMountSystemRows(snapshot, accessoryRow)
    .map((systemRow) => systemRowIdentityKey(systemRow))
    .filter(Boolean));
}

function mountStyleLabel(row) {
  return donorMountStyleDisplayLabel(rawMountStyleLabel(row));
}

function mountStyleValuesMatch(left, right) {
  const leftKey = canonicalMountStyle(left);
  const rightKey = canonicalMountStyle(right);
  return Boolean(leftKey && rightKey && leftKey === rightKey) || valuesMatch(left, right);
}

function mountStyleSystemReferenceKeys(snapshot, style) {
  const wanted = canonicalMountStyle(style);
  if (!wanted) return [];
  return uniqueStrings(liveTableRows(snapshot, "SYSTEM").filter((row) => {
    const styleAllowedBySystem = rowOptionValues(row, ["mount_style", "mount_styles"]).some((mount) => canonicalMountStyle(mount) === wanted);
    return styleAllowedBySystem && !surfaceMountDiPolicyBlocksSystemMount(snapshot, row, style);
  })
    .map((row) => systemRowIdentityKey(row))
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

function systemRowSupportsIndirect(row) {
  return systemEmissionValues(row).some(emissionSupportsIndirect);
}

function surfaceMountDiPolicyRow(snapshot) {
  return activeCodePolicyRow(snapshot, SURFACE_MOUNT_DI_BLOCK_POLICY_ID);
}

function surfaceMountPolicyMeta(snapshot, style) {
  const row = canonicalMountStyle(style) === "surface mount" ? surfaceMountDiPolicyRow(snapshot) : null;
  if (!row) return {};
  return {
    codePolicyIds: [SURFACE_MOUNT_DI_BLOCK_POLICY_ID],
    codePolicyReason: codePolicyReason(row, SURFACE_MOUNT_DI_BLOCK_DEFAULT_REASON),
  };
}

function surfaceMountDiPolicyBlocksSystemMount(snapshot, systemRow, style) {
  return canonicalMountStyle(style) === "surface mount" && Boolean(surfaceMountDiPolicyRow(snapshot)) && systemRowSupportsIndirect(systemRow);
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

function collectOptions(snapshot, timelineContext = createSelectorTimelineContext()) {
  const bucket = {};
  const systems = selectorOptionRows(snapshot, "SYSTEM", timelineContext);
  for (const row of systems) {
    const tokens = systemTokens(row);
    const emissions = systemEmissionValues(row);
    const systemIdentityKey = systemRowIdentityKey(row);
    addOption(bucket, "system", tokens.label, { value: tokens.value, sourceTables: ["SYSTEM"], systemReferenceKey: tokens.system, systemVariantKey: tokens.variant, systemIdentityKey, systemSupportsIndirect: emissions.some(emissionSupportsIndirect), ...rowStatusOptionMeta(row, timelineContext) });
    if (tokens.variant) addOption(bucket, "variantKey", tokens.variant, { sourceTables: ["SYSTEM"] });
    for (const emission of systemEmissionValues(row)) {
      addOption(bucket, "emission", emission, { sourceTables: ["SYSTEM"] });
      if (emissionSupportsDirect(emission)) addOption(bucket, "directCapability", "Direct supported", { value: "direct-supported", sourceTables: ["SYSTEM"] });
      if (emissionSupportsIndirect(emission)) addOption(bucket, "indirectCapability", "Indirect supported", { value: "indirect-supported", sourceTables: ["SYSTEM"] });
    }
    // Donor parity: mount style choices are exposed through ACCESSORIES mount rows
    // that match this resolved SYSTEM.mount_style, not directly from SYSTEM aliases.
    const finishValues = systemPaintFinishValues(row);
    finishValues.forEach((finish, finishInheritanceIndex) => {
      const finishMeta = { sourceTables: ["SYSTEM"], systemReferenceKey: systemIdentityKey || tokens.system, systemReferenceKeys: uniqueStrings([systemIdentityKey, tokens.value, tokens.variant ? "" : tokens.system].filter(Boolean)), finishInheritanceIndex };
      addOption(bucket, "bodyFinish", finish, finishMeta);
      addOption(bucket, "finishCover", finish, finishMeta);
      addOption(bucket, "finishEnd", finish, finishMeta);
    });
    systemFlexColourValues(row).forEach((flex, finishInheritanceIndex) => addOption(bucket, "finishFlex", flex, { sourceTables: ["SYSTEM"], systemReferenceKey: systemIdentityKey || tokens.system, systemReferenceKeys: uniqueStrings([systemIdentityKey, tokens.value, tokens.variant ? "" : tokens.system].filter(Boolean)), finishInheritanceIndex }));
  }

  const systemOptions = optionsFor(bucket, "system");

  const tiers = liveTableRows(snapshot, "TIERS", timelineContext);
  for (const row of tiers) {
    const tier = rowText(row, ["tier", "tier_key", "name", "label", "id"]);
    if (tier) addOption(bucket, "tier", tier, { sourceTables: ["TIERS"] });
    for (const electrical of rowOptionValues(row, ["electrical", "electrical_options", "elect_class", "electrical_class", "electrical_class_options", "electrical class", "class_options"])) addOption(bucket, "electricalClass", electrical, { sourceTables: ["TIERS"] });
  }
  for (const value of policyValues(snapshot, ["tier"])) addOption(bucket, "tier", value, { sourceTables: ["SYSTEM_POLICY"] });

  const optics = liveTableRows(snapshot, "OPTICS", timelineContext);
  for (const row of optics) {
    const optic = diffuserVar1Name(row);
    const system = diffuserSystemToken(row);
    const opticLabel = [optic, system].filter(Boolean).join(" · ") || optic;
    const opticValue = diffuserVar1Value(row);
    const rowStatusMeta = rowStatusOptionMeta(row, timelineContext);
    const var1Meta = { ...diffuserOptionMeta(row, { layer: "var1", visualChoice: true }), ...rowStatusMeta };
    const emissions = rowOptionValues(row, ["emission_permission", "direction", "emission", "optic_direction", "light_direction"]);
    const hasDirect = emissions.length ? emissions.some(emissionSupportsDirect) : true;
    const hasIndirect = emissions.some(emissionSupportsIndirect);
    addOption(bucket, "optic", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });
    addOption(bucket, "diffuserVar1", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });
    if (hasDirect) addOption(bucket, "directOpticVar1", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });
    if (hasIndirect) addOption(bucket, "indirectOpticVar1", opticLabel, { value: opticValue, sourceTables: ["OPTICS"], ...var1Meta });

    for (const variant of diffuserVar2Values(row)) {
      const var2Meta = { ...diffuserOptionMeta(row, {
        layer: "var2",
        parentFieldKey: "diffuserVar1",
        parentValue: opticValue,
        var2Label: variant.label,
        visualChoice: true,
      }), ...rowStatusMeta };
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
    const opticEnvironmentMeta = {
      ...opticSystemMeta,
      parentFieldKey: "diffuserVar1",
      parentValue: opticValue,
      parentValues: [opticValue].filter(Boolean),
    };
    for (const ip of rowOptionValues(row, ["ip_option_1", "ip_options", "ip", "ip_rating"])) addOption(bucket, "ipRating", ip, { sourceTables: ["OPTICS"], ...opticEnvironmentMeta });
    for (const ik of rowOptionValues(row, ["ik_option_2", "ik_options", "ik", "ik_rating"])) addOption(bucket, "ikRating", ik, { sourceTables: ["OPTICS"], ...opticEnvironmentMeta });
    for (const cct of extractCctValues(row)) addOption(bucket, "cct", cct, { sourceTables: ["OPTICS"], ...opticSystemMeta });
    for (const env of rowOptionValues(row, ["environment", "application", "application_environment"])) addOption(bucket, "application", env, { sourceTables: ["OPTICS"], ...opticSystemMeta });
    for (const io of rowOptionValues(row, ["interior_exterior", "interiorExterior", "indoor_outdoor", "location_type"])) addOption(bucket, "interiorExterior", io, { sourceTables: ["OPTICS"], ...opticSystemMeta });
  }

  const boards = liveTableRows(snapshot, "BOARDS", timelineContext);
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

  const drivers = liveTableRows(snapshot, "DRIVERS", timelineContext);
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
  for (const value of policyValues(snapshot, ["mount", "mounting", "suspension", "recessed", "surface"])) {
    addOption(bucket, "mountStyle", value, { sourceTables: ["SYSTEM_POLICY"], ...surfaceMountPolicyMeta(snapshot, value) });
  }
  for (const value of policyValues(snapshot, POLICY_PAINT_FINISH_NEEDLES)) {
    addOption(bucket, "bodyFinish", value, { sourceTables: ["SYSTEM_POLICY"] });
    addOption(bucket, "finishCover", value, { sourceTables: ["SYSTEM_POLICY"] });
    addOption(bucket, "finishEnd", value, { sourceTables: ["SYSTEM_POLICY"] });
  }
  for (const value of policyValues(snapshot, ["electrical", "electrical class", "electrical_class", "class"] )) addOption(bucket, "electricalClass", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of ambientPolicyValues(snapshot)) addOption(bucket, "ambient", value, { sourceTables: ["SYSTEM_POLICY"] });
  for (const value of policyValues(snapshot, ["wiring", "cable", "control cores"] )) addOption(bucket, "wiringType", value, { sourceTables: ["SYSTEM_POLICY"] });
  addOption(bucket, "indirectMatchDirect", "Match direct CCT/CRI and control", { value: "match-direct", sourceTables: ["SYSTEM", "OPTICS"] });
  addOption(bucket, "inheritedFinishStatus", "Cover/end/flex inherit default until changed", { value: "inherits-default-finish", sourceTables: ["SYSTEM", "SYSTEM_POLICY"] });

  for (const value of accessoryLabels(snapshot, ACCESSORY_PAINT_FINISH_NEEDLES)) addOption(bucket, "bodyFinish", value, { sourceTables: ["ACCESSORIES"] });

  for (const row of liveTableRows(snapshot, "ACCESSORIES", timelineContext)) {
    const label = accessoryIdLabel(row);
    if (!label) continue;
    if (accessoryTypeMatches(row, "mount")) {
      const style = mountStyleLabel(row);
      const styleAliases = mountStyleParentValuesForRow(row);
      const systemKeys = accessoryMountSystemReferenceKeys(snapshot, row);
      const effectiveSystemKeys = systemKeys.length
        ? systemKeys
        : snapshotHasSystemMountStyleSource(snapshot) ? [UNMATCHED_SYSTEM_MOUNT_STYLE_KEY] : [];
      const mountMeta = {
        sourceTables: ["ACCESSORIES"],
        parentFieldKey: "mountStyle",
        parentValue: style,
        parentValues: styleAliases,
        systemReferenceKey: effectiveSystemKeys[0] || "",
        systemReferenceKeys: effectiveSystemKeys,
      };
      addOption(bucket, "mountStyle", style, {
        sourceTables: ["ACCESSORIES"],
        systemReferenceKey: effectiveSystemKeys[0] || "",
        systemReferenceKeys: effectiveSystemKeys,
        ...surfaceMountPolicyMeta(snapshot, style),
      });
      for (const value of rowOptionValues(row, ["mount_selections", "mount_selection"])) addOption(bucket, "mountSelection", value, mountMeta);
      for (const value of rowOptionValues(row, ["mount_particulars", "particulars"])) addOption(bucket, "mountParticulars", value, mountMeta);
    }
    if (accessoryTypeMatches(row, "power_penetration")) addOption(bucket, "powerPenetration", label, { sourceTables: ["ACCESSORIES"] });
    if (accessoryTypeMatches(row, "power_location")) addOption(bucket, "powerLocation", label === "mm" ? "TBD" : label, { sourceTables: ["ACCESSORIES"] });
    if (accessoryTypeMatches(row, "flex_length")) addOption(bucket, "flexLength", label, { sourceTables: ["ACCESSORIES"] });
    if (accessoryTypeMatches(row, "elect_class") || accessoryTypeMatches(row, "electrical_class") || accessoryTypeMatches(row, "electrical class") || accessoryTypeMatches(row, "electrical")) addOption(bucket, "electricalClass", rowText(row, ["accessory_id", "id", "display_choice", "label"], label), { sourceTables: ["ACCESSORIES"] });
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
  const identity = systemRowIdentityKey(row);
  return systemOptionFromSelection(systemOptions, identity || tokens.value || tokens.label || tokens.system)
    || systemOptions.find((option) => [option.value, option.label].some((value) => valuesMatch(value, tokens.value) || valuesMatch(value, tokens.label)))
    || null;
}

function systemOptionValueForSource(systemOptions, row) {
  const rowSystem = rowText(row, ["system", "series", "system_name", "system_key"]);
  const option = systemOptionForRow(systemOptions, row);
  return rowSystem || option?.systemReferenceKey || safeString(option?.value).split("|")[0] || "";
}

function systemOptionIdentityValue(option = {}) {
  const value = safeString(option.value);
  const referenceKey = safeString(option.systemReferenceKey || value.split("|")[0]);
  const variantKey = safeString(option.systemVariantKey || value.split("|").slice(1).join("|"));
  return [referenceKey, variantKey].filter(Boolean).join("|") || value || safeString(option.label);
}

function systemIdentityValuesForSourceSystem(systemOptions = [], sourceSystem = "") {
  const source = safeString(sourceSystem);
  if (!source) return [];
  const matches = systemOptions.filter((option) => {
    const optionReference = safeString(option.systemReferenceKey || safeString(option.value).split("|")[0]);
    const optionVariant = safeString(option.systemVariantKey || safeString(option.value).split("|").slice(1).join("|"));
    return valuesMatch(optionReference, source) || valuesMatch(optionVariant, source) || valuesMatch(option.value, source) || valuesMatch(option.label, source);
  }).map(systemOptionIdentityValue);
  return uniqueStrings(matches.length ? matches : [source]);
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
  const opticVar2Values = rowOptionValues(row, ["optic_var_2"]);
  const variants = opticVar2Values.length ? opticVar2Values : rowOptionValues(row, ["spec_code_var2"]);
  return variants.map((variant) => ({
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

function collectRecords(snapshot, bucket, timelineContext = createSelectorTimelineContext()) {
  const records = [];
  const systemOptions = optionsFor(bucket, "system");

  for (const row of liveTableRows(snapshot, "TIERS", timelineContext)) {
    const tier = rowText(row, ["tier", "tier_key", "name", "label", "id"]);
    const electricalClass = rowOptionValues(row, ["electrical", "electrical_options", "elect_class", "electrical_class", "electrical_class_options", "electrical class", "class_options"]);
    pushRelationshipRecord(records, ["TIERS"], {
      tier,
      electricalClass,
    }, "TIERS row maps selected tier to electrical class options");
  }

  for (const row of liveTableRows(snapshot, "SYSTEM", timelineContext)) {
    const tokens = systemTokens(row);
    const matchedSystemOption = systemOptionForRow(systemOptions, row);
    const systemValue = systemOptionIdentityValue(matchedSystemOption || {
      value: tokens.value,
      label: tokens.label,
      systemReferenceKey: tokens.system,
      systemVariantKey: tokens.variant,
    });
    const variant = rowText(row, ["system_variant_1", "variant", "family", "profile_family"]);
    const emissions = systemEmissionValues(row);
    const rawMountStyles = rowOptionValues(row, ["mount_style", "mount_styles"]).filter((mount) => !surfaceMountDiPolicyBlocksSystemMount(snapshot, row, mount));
    const mountStyles = uniqueStrings(rawMountStyles.flatMap((mount) => [donorMountStyleDisplayLabel(mount), mount]).filter(Boolean));
    const finishes = systemPaintFinishValues(row);
    const flexes = systemFlexColourValues(row);
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
      finishFlex: flexes,
      inheritedFinishStatus: finishes.length || flexes.length ? ["inherits-default-finish"] : [],
    }, "SYSTEM row maps system choices to variants, emission, mounting, and finishes");
  }

  for (const row of liveTableRows(snapshot, "OPTICS", timelineContext)) {
    const systemValue = systemIdentityValuesForSourceSystem(systemOptions, diffuserSystemToken(row));
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

  for (const row of liveTableRows(snapshot, "BOARDS", timelineContext)) {
    const sourceSystem = systemOptionValueForSource(systemOptions, row) || rowText(row, ["system", "series", "system_name", "system_key"]);
    const systemValue = systemIdentityValuesForSourceSystem(systemOptions, sourceSystem);
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

  for (const row of liveTableRows(snapshot, "DRIVERS", timelineContext)) {
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

  for (const row of liveTableRows(snapshot, "ACCESSORIES", timelineContext)) {
    const label = accessoryIdLabel(row);
    if (!label) continue;
    const egressLightOption = accessoryTypeMatches(row, "egress_light") ? egressLightAccessoryOption(row) : null;
    const egressSoundId = accessoryTypeMatches(row, "egress_sound") ? accessorySourceId(row) : "";
    const sensorOption = (accessoryTypeMatches(row, "pir") || accessoryTypeMatches(row, "sensor")) ? sensorAccessoryOption(row) : null;
    const genericAccessoryValue = isGenericAccessoryPreviewRow(row) ? [label] : [];
    const mountStyles = mountStyleParentValuesForRow(row);
    const mountSelections = rowOptionValues(row, ["mount_selections", "mount_selection"]);
    const mountParticulars = rowOptionValues(row, ["mount_particulars", "particulars"]);
    if (accessoryTypeMatches(row, "mount")) {
      const mountStyleValues = mountStyles.length ? mountStyles : uniqueStrings([donorMountStyleDisplayLabel(label), label].filter(Boolean));
      const mountSystemKeys = accessoryMountSystemReferenceKeys(snapshot, row);
      const mountSystemValues = uniqueStrings((mountSystemKeys.length
        ? mountSystemKeys
        : snapshotHasSystemMountStyleSource(snapshot) ? [UNMATCHED_SYSTEM_MOUNT_STYLE_KEY] : []
      ).flatMap((systemKey) => [
        systemKey,
        ...systemIdentityValuesForSourceSystem(systemOptions, systemKey),
      ]));
      pushRelationshipRecord(records, ["ACCESSORIES"], {
        system: mountSystemValues,
        mountStyle: mountStyleValues,
        mountSelection: mountSelections,
        mountParticulars,
      }, "ACCESSORIES mount row maps selected SYSTEM.mount_style capability to mount style, selection, and particulars");
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
  if (fieldKey === "mountStyle") return mountStyleValuesMatch(candidateValue, selectedValue);
  return valuesMatch(candidateValue, selectedValue);
}

function normalisedTokenSet(value = "") {
  return new Set(normaliseKey(value).split(/[^a-z0-9]+/).filter(Boolean));
}

function tokensIncludeAll(haystackTokens, needleTokens) {
  const needles = Array.from(needleTokens || []).filter(Boolean);
  return needles.length > 0 && needles.every((token) => haystackTokens.has(token));
}

function systemOptionVariant(option = {}) {
  return safeString(option.systemVariantKey || safeString(option.value).split("|").slice(1).join("|"));
}

function systemSelectionMatchScore(option = {}, selectedValue = "") {
  const selected = safeString(selectedValue);
  if (!selected) return 0;
  if (valuesMatch(option.value, selected)) return 10000;
  if (valuesMatch(option.label, selected)) return 9500;

  const systemKey = safeString(option.systemReferenceKey || safeString(option.value).split("|")[0]);
  const variant = systemOptionVariant(option);
  const selectedTokens = normalisedTokenSet(selected);
  const selectedSystemParts = selected.split("|").map(safeString).filter(Boolean);
  const selectedLooksVariantSpecific = selectedSystemParts.length > 1 || selectedTokens.size > normalisedTokenSet(systemKey).size;
  const selectedIsExactSystemOnly = Boolean(systemKey && valuesMatch(systemKey, selected) && !selectedLooksVariantSpecific);

  if (systemKey) {
    const systemTokens = normalisedTokenSet(systemKey);
    const exactSystem = valuesMatch(systemKey, selected);
    if (!exactSystem && !tokensIncludeAll(selectedTokens, systemTokens)) return 0;
    if (!variant) return exactSystem ? 8000 : 5000;
  }

  if (!variant) return 0;
  const variantTokens = normalisedTokenSet(variant);
  const variantPhrase = normaliseKey(variant).replace(/[^a-z0-9]+/g, " ").trim();
  const selectedPhrase = normaliseKey(selected).replace(/[^a-z0-9]+/g, " ").trim();
  const variantMatched = Boolean(variantPhrase && selectedPhrase.includes(variantPhrase)) || tokensIncludeAll(selectedTokens, variantTokens);
  if (!variantMatched) return selectedIsExactSystemOnly ? 5500 : 0;
  const specificity = Array.from(variantTokens).join("").length + variantTokens.size;
  return selectedLooksVariantSpecific ? 7000 + specificity : 6000 + specificity;
}

function systemSelectionMatchesOption(option = {}, selectedValue = "") {
  return systemSelectionMatchScore(option, selectedValue) > 0;
}

function systemOptionFromSelection(systemOptions = [], selectedValue = "") {
  if (!safeString(selectedValue)) return null;
  return systemOptions
    .map((option, index) => ({ option, index, score: systemSelectionMatchScore(option, selectedValue) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.option || null;
}

function systemReferenceKeyFromSelection(systemOptions = [], selectedValue = "") {
  const match = systemOptionFromSelection(systemOptions, selectedValue);
  return match ? safeString(match.systemReferenceKey) || safeString(match.value).split("|")[0] || safeString(match.label) : "";
}

function systemIdentityKeyFromSelection(systemOptions = [], selectedValue = "") {
  const match = systemOptionFromSelection(systemOptions, selectedValue);
  return match ? systemOptionIdentityValue(match) : safeString(selectedValue);
}

function cascadeConstraintsForOptions(bucket = {}, constraints = {}) {
  const systemOptions = optionsFor(bucket, "system");
  const selectedSystemKey = systemReferenceKeyFromSelection(systemOptions, constraints.system || "");
  const selectedSystemIdentity = systemIdentityKeyFromSelection(systemOptions, constraints.system || "");
  if (!selectedSystemKey && !selectedSystemIdentity) return constraints;
  return {
    ...constraints,
    system: selectedSystemIdentity || constraints.system,
    __systemReferenceKey: selectedSystemKey,
  };
}

const CASCADE_CHILD_FIELDS_BY_PARENT = Object.freeze({
  system: Object.freeze([
    "variantKey",
    "emission",
    "directCapability",
    "indirectCapability",
    "optic",
    "opticSub",
    "opticIndirect",
    "diffuserVar1",
    "diffuserVar2",
    "diffuserMaterial",
    "diffuserSpecCodePreview",
    "diffuserImageReadiness",
    "directOpticVar1",
    "directOpticVar2",
    "indirectOpticVar1",
    "indirectOpticVar2",
    "ipRating",
    "ikRating",
    "cct",
    "cctCri",
    "cctCriIndirect",
    "targetLmPerM",
    "targetLmPerMIndirect",
    "controlType",
    "controlTypeIndirect",
    "lexWeight",
    "mountStyle",
    "mountSelection",
    "mountParticulars",
    "bodyFinish",
    "finishCover",
    "finishEnd",
    "finishFlex",
    "inheritedFinishStatus",
  ]),
  directOpticVar1: Object.freeze(["directOpticVar2", "ipRating", "ikRating"]),
  indirectOpticVar1: Object.freeze(["indirectOpticVar2"]),
  diffuserVar1: Object.freeze(["diffuserVar2", "diffuserMaterial", "diffuserSpecCodePreview", "diffuserImageReadiness", "ipRating", "ikRating"]),
  optic: Object.freeze(["opticSub", "ipRating", "ikRating"]),
  mountStyle: Object.freeze(["mountSelection", "mountParticulars"]),
  mountSelection: Object.freeze(["mountParticulars"]),
  bodyFinish: Object.freeze(["finishCover", "finishEnd", "finishFlex", "inheritedFinishStatus"]),
  finishDefault: Object.freeze(["finishCover", "finishEnd", "finishFlex", "inheritedFinishStatus"]),
  controlType: Object.freeze(["driver", "wiringType"]),
});

const ENVIRONMENT_IP_IK_FIELD_KEYS = Object.freeze(new Set(["ipRating", "ikRating"]));
const FINISH_COMPATIBILITY_FIELD_KEYS = Object.freeze(new Set([
  "bodyFinish",
  "finishDefault",
  "finishCover",
  "finishEnd",
  "finishFlex",
  "inheritedFinishStatus",
]));

function selectedEnvironmentDirectOpticConstraint(constraints = {}) {
  return [
    ["directOpticVar1", constraints.directOpticVar1],
    ["diffuserVar1", constraints.diffuserVar1],
    ["optic", constraints.optic],
  ].find(([, value]) => safeString(value));
}

function environmentIpIkScopedConstraints(constraints = {}) {
  const scoped = {};
  if (safeString(constraints.system || "")) scoped.system = constraints.system;

  const directOptic = selectedEnvironmentDirectOpticConstraint(constraints);
  if (directOptic) scoped[directOptic[0]] = directOptic[1];

  return scoped;
}

function finishScopedConstraints(constraints = {}) {
  const scoped = {};
  if (safeString(constraints.system || "")) scoped.system = constraints.system;
  if (safeString(constraints.__systemReferenceKey || "")) scoped.__systemReferenceKey = constraints.__systemReferenceKey;
  return scoped;
}

function cascadeScopedConstraints(fieldKey = "", constraints = {}) {
  if (ENVIRONMENT_IP_IK_FIELD_KEYS.has(fieldKey)) return environmentIpIkScopedConstraints(constraints);
  if (FINISH_COMPATIBILITY_FIELD_KEYS.has(fieldKey)) return finishScopedConstraints(constraints);
  const childKeys = CASCADE_CHILD_FIELDS_BY_PARENT[fieldKey] || [];
  if (!childKeys.length) return constraints;
  const blockedChildren = new Set(childKeys);
  return Object.fromEntries(Object.entries(constraints).filter(([key]) => !blockedChildren.has(key)));
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

function environmentIpIkStrictRelationshipRequired(fieldKey = "", constraints = {}) {
  if (!ENVIRONMENT_IP_IK_FIELD_KEYS.has(fieldKey)) return false;
  const scoped = environmentIpIkScopedConstraints(constraints);
  return Boolean(scoped.system || scoped.directOpticVar1 || scoped.diffuserVar1 || scoped.optic);
}

function environmentIpIkStrictRelationshipBlock(fieldKey = "", constraints = {}) {
  const scoped = environmentIpIkScopedConstraints(constraints);
  return Object.entries(scoped)
    .filter(([, value]) => safeString(value))
    .map(([constraintFieldKey, value]) => ({
      fieldKey: constraintFieldKey,
      selectedValue: value,
      compatibleValues: [`${fieldKey} values mapped by OPTICS rows for the selected System / optic`],
    }));
}

function optionCascadeResult(fieldKey, option, records, constraints) {
  const scopedConstraints = cascadeScopedConstraints(fieldKey, constraints);
  const relatedRecords = records.filter((record) => Array.isArray(record.fields?.[fieldKey]) && record.fields[fieldKey].some((value) => valuesMatch(value, option.value)));
  if (!relatedRecords.length) {
    if (environmentIpIkStrictRelationshipRequired(fieldKey, scopedConstraints)) {
      return {
        compatible: false,
        blockedBy: environmentIpIkStrictRelationshipBlock(fieldKey, scopedConstraints),
        relationshipStatus: "blocked-unscoped-environment-option",
        relationshipMissingReason: "IP/IK options must be mapped by the source OPTICS rows for the selected System and selected optic/diffuser.",
      };
    }
    return {
      compatible: true,
      blockedBy: [],
      relationshipStatus: "unconstrained",
      relationshipMissingReason: "No safe source relationship record links this option to current upstream constraints.",
    };
  }
  const matchingRecord = relatedRecords.find((record) => recordMatchesConstraints(record, scopedConstraints, fieldKey));
  if (matchingRecord) {
    return {
      compatible: true,
      blockedBy: [],
      relationshipStatus: "matched",
      cascadeSource: matchingRecord.sourceTables || [],
      relationshipMissingReason: "",
    };
  }
  const blockedBy = relatedRecords.flatMap((record) => recordConstraintBlockers(record, scopedConstraints, fieldKey));
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

function optionCodePolicyIds(option = {}) {
  return uniqueStrings((Array.isArray(option.codePolicyIds) ? option.codePolicyIds : [option.codePolicyIds]).map(safeString).filter(Boolean));
}

function optionHasCodePolicy(option = {}, policyId = "") {
  const wanted = normaliseKey(policyId);
  return optionCodePolicyIds(option).some((id) => normaliseKey(id) === wanted);
}

function mountCodePolicyBlock(fieldKey = "", option = {}, records = [], constraints = {}) {
  if (fieldKey !== "mountStyle") return { blocked: false, blockedBy: [], reason: "" };
  const style = canonicalMountStyle(option.value || option.label);
  if (style !== "surface mount" || !optionHasCodePolicy(option, SURFACE_MOUNT_DI_BLOCK_POLICY_ID)) {
    return { blocked: false, blockedBy: [], reason: "" };
  }
  const indirectSupport = upstreamIndirectSupportState(records, constraints);
  if (!indirectSupport.checked || !indirectSupport.supported) {
    return { blocked: false, blockedBy: [], reason: "" };
  }
  return {
    blocked: true,
    blockedBy: [{
      fieldKey: "CODE_POLICY",
      selectedValue: SURFACE_MOUNT_DI_BLOCK_POLICY_ID,
      compatibleValues: ["Suspended", "other donor-compatible mount styles"],
    }],
    reason: option.codePolicyReason || SURFACE_MOUNT_DI_BLOCK_DEFAULT_REASON,
  };
}

function sanitiseConstraints(constraints = {}) {
  if (!isPlainObject(constraints)) return {};
  return Object.fromEntries(Object.entries(constraints)
    .map(([fieldKey, value]) => [normaliseFinishConstraintFieldKey(fieldKey), safeString(value)])
    .filter(([fieldKey, value]) => TARGET_FIELD_KEYS.has(fieldKey) && value && !isInheritedFinishSentinel(fieldKey, value)));
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

const FINISH_DEPENDENT_FIELD_KEYS = Object.freeze(["finishCover", "finishEnd", "finishFlex"]);
const FINISH_INHERITANCE_SENTINELS = Object.freeze(new Set([
  "auto",
  "auto from default",
  "default",
  "derived default",
  "inherit",
  "inherited",
  "inherit body finish",
  "inherits body finish",
  "mapped from body finish",
]));

function normaliseFinishConstraintFieldKey(fieldKey = "") {
  return fieldKey === "finishDefault" ? "bodyFinish" : fieldKey;
}

function isInheritedFinishSentinel(fieldKey = "", value = "") {
  const normalisedFieldKey = normaliseFinishConstraintFieldKey(fieldKey);
  if (!FINISH_DEPENDENT_FIELD_KEYS.includes(normalisedFieldKey)) return false;
  const key = normaliseKey(value);
  return !key || FINISH_INHERITANCE_SENTINELS.has(key);
}

function finishOptionList(options = []) {
  if (!Array.isArray(options)) return [];
  return options.map((option, index) => {
    if (isPlainObject(option)) return { ...option };
    const label = safeString(option);
    return {
      value: label,
      label,
      finishInheritanceIndex: index,
      rawRowsExposed: false,
    };
  }).filter((option) => safeString(option.value || option.label));
}

function selectableFinishOptions(options = []) {
  return finishOptionList(options).filter((option) => option.blocked !== true && option.status !== "blocked");
}

function finishOptionMatches(option = {}, value = "") {
  const wanted = safeString(value);
  if (!wanted) return false;
  return valuesMatch(option.value, wanted) || valuesMatch(option.label, wanted);
}

function findFinishOption(options = [], value = "") {
  return selectableFinishOptions(options).find((option) => finishOptionMatches(option, value)) || null;
}

function firstFinishInheritanceIndex(option = {}, fallbackIndex = -1) {
  if (Number.isInteger(option.finishInheritanceIndex) && option.finishInheritanceIndex >= 0) return option.finishInheritanceIndex;
  return Number.isInteger(fallbackIndex) && fallbackIndex >= 0 ? fallbackIndex : null;
}

function bodyFinishFallbackFlexValue(bodyFinish = "") {
  const key = normaliseKey(bodyFinish);
  if (key === "white textured" || key === "white") return "White";
  if (key === "black textured" || key === "black") return "Black";
  if (key === "silver kinetic") return "Grey";
  return "";
}

function finishOutcome({ fieldKey, mode, value = "", label = "", inheritedFrom = "", reason = "", sourceOption = null, missing = false } = {}) {
  return {
    fieldKey,
    mode,
    value: safeString(value),
    label: safeString(label || value),
    inheritedFrom,
    reason,
    sourceOption: sourceOption ? {
      value: safeString(sourceOption.value),
      label: safeString(sourceOption.label || sourceOption.value),
      finishInheritanceIndex: Number.isInteger(sourceOption.finishInheritanceIndex) ? sourceOption.finishInheritanceIndex : null,
      sourceTables: Array.isArray(sourceOption.sourceTables) ? [...sourceOption.sourceTables] : [],
      rawRowsExposed: false,
    } : null,
    manualOverride: mode === "manual-override",
    inherited: mode === "inherited",
    missing: missing === true,
    mutable: true,
    writes: false,
    rawRowsExposed: false,
  };
}

function resolveBodyFinishOption(bodyValue = "", bodyOptions = []) {
  const options = selectableFinishOptions(bodyOptions);
  const option = findFinishOption(options, bodyValue);
  const optionIndex = option ? options.findIndex((item) => item === option || finishOptionMatches(item, option.value)) : -1;
  const inheritanceIndex = option ? firstFinishInheritanceIndex(option, optionIndex) : null;
  return { option, inheritanceIndex, options };
}

function resolveFinishMatch({ fieldKey, value, options, inheritedFrom, reason }) {
  const option = findFinishOption(options, value);
  if (!option) {
    return finishOutcome({
      fieldKey,
      mode: "unresolved",
      inheritedFrom,
      reason: `${reason}; source option is unavailable so no value was invented.`,
      missing: true,
    });
  }
  return finishOutcome({
    fieldKey,
    mode: "inherited",
    value: option.value,
    label: option.label || option.value,
    inheritedFrom,
    reason,
    sourceOption: option,
  });
}

function resolveFlexFinish({ bodyValue = "", bodyInheritanceIndex = null, flexOptions = [] } = {}) {
  const options = selectableFinishOptions(flexOptions);
  if (!bodyValue) {
    return finishOutcome({
      fieldKey: "finishFlex",
      mode: "unresolved",
      inheritedFrom: "bodyFinish",
      reason: "Flex/lead/cable colour waits for a body/default finish before inheriting.",
      missing: true,
    });
  }

  if (Number.isInteger(bodyInheritanceIndex) && bodyInheritanceIndex >= 0) {
    const indexed = options.find((option) => option.finishInheritanceIndex === bodyInheritanceIndex);
    if (indexed) {
      return finishOutcome({
        fieldKey: "finishFlex",
        mode: "inherited",
        value: indexed.value,
        label: indexed.label || indexed.value,
        inheritedFrom: "bodyFinish flex map/index",
        reason: "Flex/lead/cable colour follows the body/default finish inheritance index where source flex_map metadata is available.",
        sourceOption: indexed,
      });
    }
  }

  const fallback = bodyFinishFallbackFlexValue(bodyValue);
  if (fallback) {
    const option = findFinishOption(options, fallback);
    if (option) {
      return finishOutcome({
        fieldKey: "finishFlex",
        mode: "inherited",
        value: option.value,
        label: option.label || option.value,
        inheritedFrom: "bodyFinish bounded fallback",
        reason: `Flex/lead/cable colour uses donor fallback ${bodyValue} -> ${fallback}.`,
        sourceOption: option,
      });
    }
    return finishOutcome({
      fieldKey: "finishFlex",
      mode: "unresolved",
      inheritedFrom: "bodyFinish bounded fallback",
      reason: `Flex/lead/cable donor fallback ${bodyValue} -> ${fallback} is not present in available flex options; no value was invented.`,
      missing: true,
    });
  }

  return finishOutcome({
    fieldKey: "finishFlex",
    mode: "unresolved",
    inheritedFrom: "bodyFinish flex map/index",
    reason: "No source flex_map/index match or approved bounded fallback exists for this body/default finish.",
    missing: true,
  });
}

export function deriveRuntimeSelectorFinishCascade({
  bodyFinish = "",
  finishDefault = "",
  finishCover = "",
  finishEnd = "",
  finishFlex = "",
  bodyOptions = [],
  finishCoverOptions = [],
  finishEndOptions = [],
  finishFlexOptions = [],
} = {}) {
  const bodyValue = safeString(bodyFinish || finishDefault);
  const body = resolveBodyFinishOption(bodyValue, bodyOptions);

  const resolveDependent = (fieldKey, manualValue, options) => {
    const safeManual = safeString(manualValue);
    if (safeManual && !isInheritedFinishSentinel(fieldKey, safeManual)) {
      const sourceOption = findFinishOption(options, safeManual);
      return finishOutcome({
        fieldKey,
        mode: "manual-override",
        value: safeManual,
        label: sourceOption?.label || safeManual,
        inheritedFrom: "manual override",
        reason: "Manual dependent finish override is preserved across body/default finish changes.",
        sourceOption,
      });
    }
    if (!bodyValue) {
      return finishOutcome({
        fieldKey,
        mode: "unresolved",
        inheritedFrom: "bodyFinish",
        reason: "Dependent finish waits for a body/default finish before inheriting.",
        missing: true,
      });
    }
    return resolveFinishMatch({
      fieldKey,
      value: bodyValue,
      options,
      inheritedFrom: "bodyFinish",
      reason: "Cover/end finish inherits the body/default finish while blank, auto, or inherited.",
    });
  };

  const flexManual = safeString(finishFlex);
  const flex = flexManual && !isInheritedFinishSentinel("finishFlex", flexManual)
    ? finishOutcome({
      fieldKey: "finishFlex",
      mode: "manual-override",
      value: flexManual,
      label: findFinishOption(finishFlexOptions, flexManual)?.label || flexManual,
      inheritedFrom: "manual override",
      reason: "Manual flex/lead/cable colour override is preserved across body/default finish changes.",
      sourceOption: findFinishOption(finishFlexOptions, flexManual),
    })
    : resolveFlexFinish({ bodyValue, bodyInheritanceIndex: body.inheritanceIndex, flexOptions: finishFlexOptions });

  return {
    bodyValue,
    bodyLabel: body.option?.label || bodyValue,
    bodyFinishSourceOption: body.option ? {
      value: safeString(body.option.value),
      label: safeString(body.option.label || body.option.value),
      finishInheritanceIndex: body.inheritanceIndex,
      rawRowsExposed: false,
    } : null,
    fields: {
      finishCover: resolveDependent("finishCover", finishCover, finishCoverOptions),
      finishEnd: resolveDependent("finishEnd", finishEnd, finishEndOptions),
      finishFlex: flex,
    },
    fallbackPolicy: {
      whiteTextured: "White",
      blackTextured: "Black",
      silverKinetic: "Grey",
      customTbdInvented: false,
      rawRowsExposed: false,
    },
    safety: {
      rawRowsExposed: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      runTableGenerated: false,
      iesGenerated: false,
      selectedResultPersisted: false,
      routesAdded: false,
      postEndpointsAdded: false,
      writes: false,
    },
    rawRowsExposed: false,
  };
}

function finishCascadeValueForField(finishCascade = {}, fieldKey = "") {
  return finishCascade.fields?.[fieldKey] || null;
}

function applyFinishCascadeToField(field = {}, finishCascade = {}) {
  if (!FINISH_DEPENDENT_FIELD_KEYS.includes(field.fieldKey)) return field;
  const outcome = finishCascadeValueForField(finishCascade, field.fieldKey);
  if (!outcome) return field;
  const inheritedValue = outcome.mode === "inherited" ? outcome.value : "";
  const manualOverride = outcome.mode === "manual-override";
  const missing = outcome.missing === true;
  return {
    ...field,
    inheritanceStatus: outcome.mode,
    inheritedValue,
    inheritedLabel: outcome.mode === "inherited" ? outcome.label : "",
    inheritedFrom: outcome.inheritedFrom,
    inheritanceReason: outcome.reason,
    inheritedMissing: missing,
    manualOverridePreserved: manualOverride,
    unavailableReason: missing ? outcome.reason : field.unavailableReason,
    options: (Array.isArray(field.options) ? field.options : []).map((option) => {
      const inheritedSelected = Boolean(inheritedValue && finishOptionMatches(option, inheritedValue));
      const manualSelected = Boolean(manualOverride && finishOptionMatches(option, outcome.value));
      return {
        ...option,
        inheritedSelected,
        selected: option.selected === true || manualSelected,
        status: inheritedSelected && option.blocked !== true ? "inherited" : option.status,
        inheritedFrom: inheritedSelected ? outcome.inheritedFrom : option.inheritedFrom || "",
        relationshipStatus: inheritedSelected ? "finish-inheritance-matched" : option.relationshipStatus,
        rawRowsExposed: false,
      };
    }),
    rawRowsExposed: false,
  };
}

function finishFieldOptionsFromWorkflow(fieldsByKey = {}, fieldKey = "") {
  const field = fieldsByKey.get(fieldKey) || {};
  return selectableFinishOptions(field.options || []);
}

function applySelectorFinishCascadeToWorkflowSections(workflowSections = [], constraints = {}) {
  const fields = workflowSections.flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
  const fieldsByKey = new Map(fields.map((field) => [field.fieldKey, field]));
  const bodyField = fieldsByKey.get("bodyFinish") || fieldsByKey.get("finishDefault") || {};
  const finishCascade = deriveRuntimeSelectorFinishCascade({
    bodyFinish: constraints.bodyFinish || constraints.finishDefault || bodyField.selectedValue || "",
    finishDefault: constraints.finishDefault || "",
    finishCover: constraints.finishCover || "",
    finishEnd: constraints.finishEnd || "",
    finishFlex: constraints.finishFlex || "",
    bodyOptions: finishFieldOptionsFromWorkflow(fieldsByKey, bodyField.fieldKey || "bodyFinish"),
    finishCoverOptions: finishFieldOptionsFromWorkflow(fieldsByKey, "finishCover"),
    finishEndOptions: finishFieldOptionsFromWorkflow(fieldsByKey, "finishEnd"),
    finishFlexOptions: finishFieldOptionsFromWorkflow(fieldsByKey, "finishFlex"),
  });
  return {
    workflowSections: workflowSections.map((section) => ({
      ...section,
      fields: (Array.isArray(section.fields) ? section.fields : []).map((field) => applyFinishCascadeToField(field, finishCascade)),
      rawRowsExposed: false,
    })),
    finishCascade,
  };
}

function createFields({ bucket, records, constraints, cascadeConstraints = constraints, sourceReady }) {
  return TARGET_FIELDS.map((field) => {
    const baseOptions = optionsFor(bucket, field.fieldKey);
    const selectedValue = constraints[field.fieldKey] || "";
    if (!sourceReady) return createUnavailableField(field, "Selector Reference source is unavailable or not parseable.");
    if (!baseOptions.length) return createUnavailableField(field, `${field.label} is unavailable from current source and remains future mapped; no fake values emitted.`);

    const options = baseOptions.map((option) => {
      const selected = optionSelectedByValue(field.fieldKey, option, selectedValue);
      const visibility = optionStatusVisibility(option, selected);
      if (visibility.hidden) return null;
      const cascade = optionCascadeResult(field.fieldKey, option, records, cascadeConstraints);
      const policyBlock = mountCodePolicyBlock(field.fieldKey, option, records, cascadeConstraints);
      const compatible = visibility.blocked !== true && cascade.compatible && policyBlock.blocked !== true;
      const blockedReason = visibility.blocked ? visibility.policy.blockedReason : policyBlock.reason || "Blocked by current manual constraints; shown rather than silently hidden.";
      return {
        ...option,
        selected: Boolean(selected),
        status: compatible ? "available" : "blocked",
        blocked: !compatible,
        blockedReason: compatible ? "" : blockedReason,
        blockedBy: compatible ? [] : [...visibility.blockedBy, ...(cascade.blockedBy || []), ...(policyBlock.blockedBy || [])],
        cascadeSource: cascade.cascadeSource || option.sourceTables || [],
        relationshipStatus: visibility.blocked ? "blocked-by-status-policy" : policyBlock.blocked ? "blocked-by-code-policy" : cascade.relationshipStatus,
        relationshipMissingReason: visibility.blocked ? visibility.policy.blockedReason : policyBlock.blocked ? policyBlock.reason : cascade.relationshipMissingReason,
        compatibleWithCurrentConstraints: compatible,
        preservesManualConstraint: Boolean(selected),
        writes: false,
        rawRowsExposed: false,
      };
    }).filter(Boolean);

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

const DONOR_SUPPORTED_DISABLED_RUN_CONSTRAINT_FIELDS = Object.freeze(new Set([
  "runCount",
  "runQty",
  "runLength",
  "runLengthMode",
]));

function createDisabledWorkflowField(field, reason, selectedValue = "") {
  const safeSelectedValue = DONOR_SUPPORTED_DISABLED_RUN_CONSTRAINT_FIELDS.has(field.fieldKey) ? safeString(selectedValue) : "";
  return {
    fieldKey: field.fieldKey,
    label: field.label,
    role: field.role || "disabled",
    status: "disabled",
    sourceStatus: safeSelectedValue ? "disabled by runtime boundary; donor-supported run constraint preserved" : "disabled by runtime boundary",
    sourceTables: [...(field.sourceTables || [])],
    options: [],
    selectedValue: safeSelectedValue,
    selectedLabel: safeSelectedValue,
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
    return parentValues.some((parentValue) => (rule.parentFieldKey === "mountStyle"
      ? mountStyleValuesMatch(parentValue, rule.filterValue)
      : valuesMatch(parentValue, rule.filterValue)));
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

function createWorkflowField(field, { bucket, records, constraints, cascadeConstraints = constraints, parentConstraints = constraints, sourceReady }) {
  const selectedValue = constraints[field.fieldKey] || "";
  if (!sourceReady) return createUnavailableField(field, "Selector Reference source is unavailable or not parseable.");
  if (field.role === "disabled") return createDisabledWorkflowField(field, "Disabled read-only preview. No workflow action, generation, write, proof, payload, RunTable, HubSpot push, save, or hidden write-back is available in this slice.", selectedValue);
  if (field.role === "future-mapped") return createUnavailableField(field, `${field.label} is a donor workflow field but is not source-backed in this runtime slice.`);

  const rawBaseOptions = optionsFor(bucket, field.fieldKey);
  const childOptions = optionsForSelectedWorkflowParent(field.fieldKey, rawBaseOptions, parentConstraints);
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
    const policyBlock = mountCodePolicyBlock(field.fieldKey, option, records, cascadeConstraints);
    const compatible = cascade.compatible && indirectSupport.supported && policyBlock.blocked !== true;
    const selected = optionSelectedByValue(field.fieldKey, option, selectedValue);
    const inherited = field.role === "inherited-consequence" && compatible;
    const consequence = field.role === "auto-consequence" && compatible;
    const blockedBy = compatible ? [] : [...(cascade.blockedBy || []), ...(indirectSupport.supported ? [] : indirectSupport.blockedBy), ...(policyBlock.blockedBy || [])];
    return {
      ...option,
      selected: Boolean(selected),
      status: inherited ? "inherited" : consequence ? "auto-consequence" : compatible ? "available" : "blocked",
      blocked: !compatible,
      blockedReason: compatible ? "" : policyBlock.reason || (indirectSupport.supported ? "Blocked by current manual constraints; shown rather than silently hidden." : "Indirect fields are blocked because the current system/optic path does not support indirect."),
      blockedBy,
      cascadeSource: cascade.cascadeSource || option.sourceTables || [],
      inheritedFrom: inherited ? inheritedSourceForField(field.fieldKey, constraints) : "",
      relationshipStatus: compatible ? cascade.relationshipStatus : policyBlock.blocked ? "blocked-by-code-policy" : indirectSupport.supported ? cascade.relationshipStatus : "blocked-by-indirect-capability",
      relationshipMissingReason: compatible ? cascade.relationshipMissingReason : policyBlock.blocked ? policyBlock.reason : indirectSupport.supported ? cascade.relationshipMissingReason : "Current upstream selection does not expose indirect capability in safe relationship metadata.",
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

function compatibleWorkflowOptionsForField(fieldKey = "", bucket = {}, records = [], constraints = {}, cascadeConstraints = constraints) {
  const baseOptions = optionsFor(bucket, fieldKey).filter((option) => option && option.status !== "disabled");
  if (!baseOptions.length) return [];
  const indirectSupport = indirectFieldRequiresSupport(fieldKey)
    ? upstreamIndirectSupportState(records, cascadeConstraints)
    : { supported: true, checked: false, blockedBy: [] };
  if (indirectSupport.supported !== true) return [];
  return baseOptions.filter((option) => {
    const cascade = optionCascadeResult(fieldKey, option, records, cascadeConstraints);
    const policyBlock = mountCodePolicyBlock(fieldKey, option, records, cascadeConstraints);
    return cascade.compatible === true && policyBlock.blocked !== true;
  });
}

function workflowParentConstraintsForAutoConsequences({ bucket = {}, records = [], constraints = {}, cascadeConstraints = constraints } = {}) {
  const parentConstraints = { ...constraints };
  if (!safeString(parentConstraints.indirectOpticVar1 || "")) {
    const compatibleIndirectParents = compatibleWorkflowOptionsForField("indirectOpticVar1", bucket, records, constraints, cascadeConstraints);
    if (compatibleIndirectParents.length === 1) {
      parentConstraints.indirectOpticVar1 = compatibleIndirectParents[0].value;
    }
  }
  return parentConstraints;
}

function createWorkflowSections({ bucket, records, constraints, cascadeConstraints = constraints, parentConstraints = constraints, sourceReady }) {
  return WORKFLOW_SECTION_DEFINITIONS.map((section) => {
    const fields = section.fields.map((field) => createWorkflowField(field, { bucket, records, constraints, cascadeConstraints, parentConstraints, sourceReady }));
    const mappedCount = fields.filter((field) => String(field.sourceStatus || "").startsWith("db-reference-backed") || field.sourceStatus === "entitlement-gated-redacted").length;
    const futureMappedCount = fields.filter((field) => field.futureMapped === true).length;
    const disabledCount = fields.filter((field) => field.disabled === true && field.metadataOnly !== true).length;
    const passivePreviewCount = disabledCount + futureMappedCount;
    return {
      sectionKey: section.sectionKey,
      title: section.title,
      status: disabledCount === fields.length || (section.sectionKey === "runsPreview" && passivePreviewCount === fields.length) ? "disabled" : futureMappedCount ? "preview-with-gaps" : "preview-ready",
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

function emailFromSpecialPartsPrincipal(value = "") {
  const requested = safeString(value);
  if (!requested) return "";
  const angleMatch = requested.match(/<([^<>\s]+@[^<>\s]+)>/);
  const candidate = angleMatch ? angleMatch[1] : requested;
  const email = safeLower(candidate);
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : "";
}

function normaliseSpecialPartsTestPrincipal(value = "") {
  const email = emailFromSpecialPartsPrincipal(value);
  if (!email) return safeString(value) ? SPECIAL_PARTS_UNKNOWN_TEST_EMAIL : "";
  return email;
}

function labelForSpecialPartsTestPrincipal(email = "") {
  const key = safeLower(email);
  return SPECIAL_PARTS_INTERNAL_TEST_PRINCIPALS.find((principal) => principal.value === key)?.label || key;
}

function specialPartsTestPrincipalOptions() {
  return SPECIAL_PARTS_INTERNAL_TEST_PRINCIPALS.map((principal) => ({ ...principal }));
}

function showSpecialPartsRequested(value) {
  if (value === true) return true;
  const key = safeLower(value);
  return ["1", "true", "yes", "y", "on", "show", "visible"].includes(key);
}

function specialPartsUserEmail(user = {}) {
  return emailFromSpecialPartsPrincipal(rowText(user, ["email_login", "login_email", "user_email", "email", "email_address", "emailAddress", "mail"], ""));
}

function specialPartsUserBlocked(user = {}) {
  return ["true", "yes", "1", "blocked", "inactive"].includes(safeLower(rowText(user, ["blocked", "is_blocked", "user_blocked", "disabled", "inactive"], "")));
}

function findSpecialPartsTestUserByEmail(users = [], principalEmail = "") {
  const wanted = emailFromSpecialPartsPrincipal(principalEmail);
  if (!wanted) return null;
  return users.find((user) => specialPartsUserEmail(user) === wanted) || null;
}

function specialPartsSafeIdentitySummary(user = null, { entitlementFound = false, specialPartsVisible = false } = {}) {
  if (!user) {
    return {
      firstName: "",
      lastName: "",
      company: "",
      entitlementFound: false,
      specialPartsVisible: false,
    };
  }
  return {
    firstName: rowText(user, ["first_name", "firstname", "given_name", "firstName"], ""),
    lastName: rowText(user, ["last_name", "lastname", "surname", "family_name", "lastName"], ""),
    company: rowText(user, ["company", "company_name", "companyName", "organisation", "organization", "account"], ""),
    entitlementFound: entitlementFound === true,
    specialPartsVisible: specialPartsVisible === true,
  };
}

function specialPartsUserComponentIds(user = {}) {
  return rowOptionValues(user, ["system_component_ids", "system_componrent_ids", "system_component_id"]);
}

function specialPartsComponentKey(row = {}) {
  return normaliseKey(rowText(row, ["system_component_id", "system_component_ids", "component_id", "id", "key", "part_number", "sku"], ""));
}

function specialPartsComponentDisplayId(row = {}) {
  return rowText(row, ["system_component_id", "system_component_ids", "component_id", "id", "key", "part_number", "sku"], "");
}

function specialPartsComponentIndex(components = []) {
  const index = new Map();
  for (const row of components) {
    const key = specialPartsComponentKey(row);
    if (key && !index.has(key)) index.set(key, row);
  }
  return index;
}

function specialPartsFallbackComponentForUser(user = {}, componentId = "") {
  return { id: componentId, status: "available", timelineStatus: "available", previewApproved: "true", safeDescription: rowText(user, [["system", "component", "description"].join("_"), "component_description", "safe_description", "description"], ""), safeCaveats: rowText(user, ["caveats", "notes"], "") };
}

function specialPartsTokenMatches(left = "", right = "") {
  const leftKey = normaliseKey(left);
  const rightKey = normaliseKey(right);
  if (!leftKey || !rightKey) return false;
  return leftKey === rightKey || leftKey.startsWith(`${rightKey} `) || rightKey.startsWith(`${leftKey} `);
}

function parseIpOptionNumber(value = "") {
  const raw = safeString(value);
  const ipMatch = raw.match(/\bip\s*([0-9]{2})\b/i);
  const bareMatch = raw.match(/^([0-9]{2})$/);
  const digits = ipMatch?.[1] || bareMatch?.[1] || "";
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function sourceBackedSpecialPartsCompatibility(component = {}, constraints = {}) {
  const blockers = [];
  const selectedSystem = safeString(constraints.__systemReferenceKey || constraints.system || "");
  const selectedVariant = safeString(constraints.variantKey || constraints.selectedVariant || String(selectedSystem).split("|").slice(1).join("|") || "");
  const selectedIp = safeString(constraints.ipRating || constraints.ipClass || "");
  const componentSystems = rowOptionValues(component, ["system", "systems"]);
  const componentVariants = rowOptionValues(component, ["variants_all", "variantsAll", "variant", "variant_key"]);
  const componentIp = rowText(component, ["ip_class", "ipClass", "ip", "ip_rating"], "");
  const effectiveTo = rowText(component, ["effective_to", "effectiveTo"], "");

  if (componentSystems.length && selectedSystem && !componentSystems.some((system) => specialPartsTokenMatches(system, selectedSystem))) {
    blockers.push("part-system-does-not-match-selected-system");
  }
  if (componentVariants.length && !componentVariants.includes("*") && selectedVariant && !componentVariants.some((variant) => specialPartsTokenMatches(variant, selectedVariant) || specialPartsTokenMatches(variant, selectedSystem))) {
    blockers.push("part-variant-does-not-include-selected-variant");
  }
  const componentIpNumber = parseIpOptionNumber(componentIp);
  const selectedIpNumber = parseIpOptionNumber(selectedIp);
  if (componentIpNumber != null && selectedIpNumber != null && componentIpNumber < selectedIpNumber) {
    blockers.push("part-ip-class-below-selected-ip-requirement");
  }
  if (effectiveTo && !/^\d{4}-\d{2}-\d{2}$/.test(effectiveTo)) {
    blockers.push("special-part-expiry-date-invalid");
  }

  return {
    sourceBackedCompatibility: blockers.length ? "incompatible" : "compatible",
    sourceBackedCompatibilityReason: blockers[0] || "source-backed-component-accessory-compatibility-matched",
  };
}

function redactedSpecialPartsTestCandidate(component = {}, index = 0, { constraints = {} } = {}) {
  const safeComponentId = specialPartsComponentDisplayId(component);
  const safeDescription = rowText(component, [["system", "component", "description"].join("_"), "safeDescription", "description", "label", "name"], "");
  const safeCaveats = rowText(component, ["safeCaveats", "caveats", "notes"], "");
  const sourceCompatibility = sourceBackedSpecialPartsCompatibility(component, constraints);
  return {
    redactedRef: safeComponentId || `redacted:special-parts-user-test-${index + 1}`,
    safeComponentId,
    redacted: true,
    status: rowText(component, ["status", "timelineStatus", "optionStatusClass"], "available") || "available",
    timelineStatus: rowText(component, ["timelineStatus", "status", "optionStatusClass"], "available") || "available",
    system: rowText(component, ["system"], ""),
    variants_all: rowText(component, ["variants_all", "variantsAll", "variant", "variant_key"], ""),
    ip_class: rowText(component, ["ip_class", "ipClass", "ip", "ip_rating"], ""),
    effective_to: rowText(component, ["effective_to", "effectiveTo"], ""),
    status_date: rowText(component, ["status_date", "statusDate"], ""),
    sourceBackedCompatibility: sourceCompatibility.sourceBackedCompatibility,
    sourceBackedCompatibilityReason: sourceCompatibility.sourceBackedCompatibilityReason,
    safeDescription,
    safeCaveats,
    safelyEntitled: true,
    previewApproved: ["true", "yes", "1"].includes(safeLower(rowText(component, ["previewApproved", "approvedForPreview", "safePreviewApproved"], ""))),
    rawRowsReturned: false,
  };
}

function safeSpecialPartsUserTestSummary(snapshot, { specialPartsTestPrincipal = "", showSpecialParts = false, constraints = {} } = {}) {
  const activeTestPrincipal = normaliseSpecialPartsTestPrincipal(specialPartsTestPrincipal);
  const internalTestActive = Boolean(activeTestPrincipal);
  const showEntitlementBackedSpecialParts = showSpecialPartsRequested(showSpecialParts);
  const users = tableRows(snapshot, "USERS");
  const components = tableRows(snapshot, "SYSTEM_COMPONENTS");
  const user = internalTestActive ? findSpecialPartsTestUserByEmail(users, activeTestPrincipal) : null;
  const componentIndex = specialPartsComponentIndex(components);
  const userBlocked = Boolean(user) && specialPartsUserBlocked(user);
  const componentIds = user && !userBlocked ? specialPartsUserComponentIds(user) : [];
  const redactedCandidates = componentIds
    .map((id) => componentIndex.get(normaliseKey(id)) || specialPartsFallbackComponentForUser(user, id))
    .filter(Boolean)
    .map((component, index) => redactedSpecialPartsTestCandidate(component, index, { constraints }));
  const entitlementFound = Boolean(user) && !userBlocked && redactedCandidates.length > 0;
  const specialPartsVisible = internalTestActive && showEntitlementBackedSpecialParts && entitlementFound && !userBlocked;
  const safeIdentitySummary = specialPartsSafeIdentitySummary(user, { entitlementFound, specialPartsVisible });

  return {
    source: "selector-reference-options-special-parts-user-test-summary",
    status: internalTestActive ? (userBlocked ? "blocked-user-fail-closed" : entitlementFound ? "entitlement-found" : "no-entitlement-found") : "external-default",
    authority: "email-first",
    internalTestActive,
    diagnosticOnly: true,
    readOnly: true,
    testPrincipalOptions: specialPartsTestPrincipalOptions(),
    activeTestPrincipal,
    activeTestPrincipalEmail: activeTestPrincipal,
    activeTestPrincipalLabel: activeTestPrincipal ? labelForSpecialPartsTestPrincipal(activeTestPrincipal) : "",
    safeIdentitySummary,
    showEntitlementBackedSpecialParts,
    entitlementFound,
    specialPartsVisible,
    redactedEntitlementCount: specialPartsVisible ? redactedCandidates.length : 0,
    entitlementBackedCandidateCount: redactedCandidates.length,
    redactedCandidates: specialPartsVisible ? redactedCandidates : [],
    productionOutputsBlocked: true,
    engineEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    selectedResultPersistenceEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    rawUsersExposed: false,
    rawRowsExposed: false,
    rawContactsExposed: false,
    rawPayloadsExposed: false,
  };
}

function workflowFields(workflowSections = []) {
  return workflowSections.flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
}

function deriveWorkflowConsequences(workflowSections = [], constraints = {}) {
  const consequences = [];
  for (const field of workflowFields(workflowSections)) {
    if (!["auto-consequence", "inherited-consequence"].includes(field.role) || constraints[field.fieldKey]) continue;

    if (FINISH_DEPENDENT_FIELD_KEYS.includes(field.fieldKey)) {
      if (!field.inheritedValue || field.inheritedMissing === true) continue;
      consequences.push({
        fieldKey: field.fieldKey,
        label: field.label || field.fieldKey,
        value: field.inheritedValue,
        valueLabel: field.inheritedLabel || field.inheritedValue,
        kind: "inherited-consequence",
        status: field.inheritanceStatus || "inherited",
        source: "safe Selector Reference finish inheritance cascade",
        reason: field.inheritanceReason || `${field.label || field.fieldKey} inherits from the body/default finish until manually overridden.`,
        inheritedFrom: field.inheritedFrom || inheritedSourceForField(field.fieldKey, constraints),
        mutable: true,
        writes: false,
        rawRowsExposed: false,
      });
      continue;
    }

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

function flattenCoverageFields({ fields = [], workflowSections = [] } = {}) {
  const workflowFields = (Array.isArray(workflowSections) ? workflowSections : []).flatMap((section) => (
    Array.isArray(section.fields) ? section.fields.map((field) => ({ ...field, sectionKey: section.sectionKey || section.title || "workflow" })) : []
  ));
  const flatFields = (Array.isArray(fields) ? fields : []).map((field) => ({ ...field, sectionKey: "flat-fields" }));
  const seen = new Set();
  return [...flatFields, ...workflowFields].filter((field) => {
    const key = `${field.sectionKey || ""}:${field.fieldKey || field.label || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createReferenceOptionSourceCoverage({ fields = [], workflowSections = [] } = {}) {
  const coverageFields = flattenCoverageFields({ fields, workflowSections }).map((field) => {
    const options = Array.isArray(field.options) ? field.options : [];
    const sourceStatus = safeString(field.sourceStatus || field.status || "unknown");
    const sourceTables = Array.isArray(field.sourceTables) ? uniqueStrings(field.sourceTables) : [];
    const futureMapped = field.futureMapped === true || sourceStatus === "future-mapped" || sourceStatus.includes("unavailable from current source");
    const disabled = field.disabled === true || field.role === "disabled" || sourceStatus.includes("disabled");
    const entitlementGated = field.role === "entitlement-gated" || sourceStatus.includes("entitlement-gated");
    const sourceBacked = !futureMapped && !disabled && (sourceStatus.startsWith("db-reference-backed") || entitlementGated || options.length > 0);
    return {
      fieldKey: safeString(field.fieldKey || field.label || "field"),
      label: safeString(field.label || field.fieldKey || "field"),
      sectionKey: safeString(field.sectionKey || ""),
      role: safeString(field.role || "unknown"),
      sourceStatus,
      sourceTables,
      optionCount: options.length,
      sourceBacked,
      futureMapped,
      disabled,
      entitlementGatedRedacted: entitlementGated,
      rawRowsExposed: false,
      rawHeadersExposed: false,
    };
  });
  const sourceBackedFields = coverageFields.filter((field) => field.sourceBacked);
  const futureMappedFields = coverageFields.filter((field) => field.futureMapped).map((field) => ({
    fieldKey: field.fieldKey,
    label: field.label,
    sectionKey: field.sectionKey,
    sourceTables: field.sourceTables,
    sourceStatus: field.sourceStatus,
    reason: "Future-mapped from donor/runtime field contract; no fake option value emitted from the current source.",
    rawRowsExposed: false,
  }));
  return {
    fieldCount: coverageFields.length,
    sourceBackedFieldCount: sourceBackedFields.length,
    futureMappedFieldCount: futureMappedFields.length,
    disabledFieldCount: coverageFields.filter((field) => field.disabled).length,
    metadataOnlyFieldCount: coverageFields.filter((field) => field.role === "metadata-only").length,
    entitlementGatedRedactedFieldCount: coverageFields.filter((field) => field.entitlementGatedRedacted).length,
    optionCount: coverageFields.reduce((total, field) => total + field.optionCount, 0),
    tablesCovered: [...new Set(coverageFields.flatMap((field) => field.sourceTables))].sort((left, right) => left.localeCompare(right)),
    sourceBackedFields: sourceBackedFields.map((field) => ({
      fieldKey: field.fieldKey,
      label: field.label,
      sectionKey: field.sectionKey,
      sourceTables: field.sourceTables,
      optionCount: field.optionCount,
      sourceStatus: field.sourceStatus,
      rawRowsExposed: false,
    })),
    futureMappedFields,
    sourceBackedExplanation: "Source-backed option coverage is summarised from safe field metadata, source table labels, and option counts only; raw rows and headers are not returned.",
    futureMappedExplanation: "Future-mapped fields are carried explicitly as future-mapped, not faked, until source-backed mapping exists.",
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
}

function createTimelineStatusFilteringSummary({ fields = [], workflowSections = [], timelineContext = createSelectorTimelineContext() } = {}) {
  const allOptions = [
    ...(Array.isArray(fields) ? fields : []).flatMap((field) => Array.isArray(field.options) ? field.options : []),
    ...workflowFields(workflowSections).flatMap((field) => Array.isArray(field.options) ? field.options : []),
  ];
  const blockedByStatusPolicyCount = allOptions.filter((option) => option.blockedByStatusPolicy === true || option.relationshipStatus === "blocked-by-status-policy").length;
  const reviewRequiredCount = allOptions.filter((option) => option.statusPolicyReviewRequired === true || option.timelineAvailability === "review-required" || option.internalTimelineTestOnly === true).length;
  const internalTimelineTestOnlyCount = allOptions.filter((option) => option.internalTimelineTestOnly === true).length;
  const productionBlockedCount = allOptions.filter((option) => option.productionBlocked === true || option.internalTimelineTestOnly === true).length;
  return {
    statusClasses: [...SELECTOR_STATUS_CLASSES],
    timelineVisibilityMode: timelineContext.timelineVisibilityMode,
    timelineAsOfDate: timelineContext.timelineAsOfDate,
    timelineAsOfDateValid: timelineContext.timelineAsOfDateValid,
    timelineVisibleStatuses: [...(timelineContext.timelineVisibleStatuses || DEFAULT_TIMELINE_VISIBLE_STATUSES)],
    timelineVisibleStatusOptions: [...SELECTOR_TIMELINE_VISIBLE_STATUS_OPTIONS],
    internalAsOfTestMode: timelineContext.internalAsOfTestMode === true,
    visibleToExternalDefault: ["available", "approved"],
    hiddenOrBlockedToExternalDefault: ["staged", "roadmap", "obsolete"],
    reviewRequired: ["unknown"],
    externalDefaultPolicy: "available/approved options are shown; staged/roadmap/obsolete/unknown are hidden unless internal timeline/as-of test mode explicitly includes them and status_date is on or before the as-of date.",
    selectedBlockedValuesPreserved: true,
    blockedByStatusPolicyCount,
    reviewRequiredCount,
    internalTimelineTestOnlyCount,
    productionBlockedCount,
    productionActionsEnabled: false,
    engineEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    selectedResultPersistenceEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    rawRowsReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
  };
}

function createOptionSafeSnapshotState({ source = {}, sourceReady = false, fields = [], workflowSections = [], tableSummaryRows = [], reason = "" } = {}) {
  const coverage = createReferenceOptionSourceCoverage({ fields, workflowSections });
  const missingTables = tableSummaryRows.filter((table) => table.present !== true).map((table) => table.table);
  const completeEnoughForPreview = sourceReady === true && missingTables.length === 0;
  return {
    title: "Source Readiness / Safe Snapshot State",
    state: completeEnoughForPreview ? "source-backed-safe-preview" : "fail-closed-source-warning",
    sourcePresent: source.present === true,
    sourceReadable: source.readable !== false,
    sourceParseable: source.parseable !== false,
    activeSnapshot: {
      label: source.label || "runtime-authority-reference-active-snapshot",
      present: source.present === true,
      readable: source.readable !== false,
      parseable: source.parseable !== false,
      modifiedTime: source.modifiedTime || null,
      fileSize: source.fileSize ?? null,
      pathReturned: false,
      privatePathExposed: false,
      providerIdExposed: false,
    },
    expectedTableCount: tableSummaryRows.length,
    presentTableCount: tableSummaryRows.filter((table) => table.present === true).length,
    missingTableCount: missingTables.length,
    expectedTablesPresent: tableSummaryRows.length > 0 && missingTables.length === 0,
    missingTables,
    missingTableBlockers: missingTables.map((table) => ({
      table,
      code: "missing-selector-reference-option-table",
      severity: "blocking",
      reason: `Missing Selector Reference option source table: ${table}.`,
      rawRowsExposed: false,
      rawHeadersExposed: false,
      privatePathsExposed: false,
    })),
    completeEnoughForPreview,
    safeForPreview: completeEnoughForPreview,
    readOnlyProductReference: completeEnoughForPreview,
    failClosed: !completeEnoughForPreview,
    warning: completeEnoughForPreview ? "Selector option source is ready for safe read-only preview." : (reason || "Selector option source is unavailable or incomplete; preview remains fail-closed."),
    referenceOptionSourceCoverage: coverage,
    sourceBackedFieldExplanation: coverage.sourceBackedExplanation,
    futureMappedFieldExplanation: coverage.futureMappedExplanation,
    futureMappedFields: coverage.futureMappedFields,
    safeRedaction: {
      rawRowsExposed: false,
      rawHeadersExposed: false,
      rawUsersExposed: false,
      rawUserHeadersExposed: false,
      usersPersonalIdentifiersExposed: false,
      credentialsExposed: false,
      credentialPathsExposed: false,
      providerIdsExposed: false,
      privatePathsExposed: false,
      rawLabEvidenceExposed: false,
    },
  };
}

function failurePayload({ source = {}, reason = "selector_reference_options_unavailable", constraints = {}, timelineContext = createSelectorTimelineContext(), specialPartsTestPrincipal = "", showSpecialParts = false } = {}) {
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
  const sourceReadiness = createOptionSafeSnapshotState({
    source,
    sourceReady: false,
    fields,
    workflowSections,
    tableSummaryRows: [],
    reason,
  });
  const timelineStatusFiltering = createTimelineStatusFilteringSummary({ fields, workflowSections, timelineContext });
  return {
    ok: false,
    endpoint: SELECTOR_REFERENCE_OPTIONS_PATH,
    owner: "runtime-server",
    status: "source-unavailable",
    source,
    sourceReady: false,
    selectedConstraints: safeConstraints,
    timelineVisibilityMode: timelineContext.timelineVisibilityMode,
    timelineAsOfDate: timelineContext.timelineAsOfDate,
    timelineVisibleStatuses: [...(timelineContext.timelineVisibleStatuses || DEFAULT_TIMELINE_VISIBLE_STATUSES)],
    internalAsOfTestMode: timelineContext.internalAsOfTestMode === true,
    fields,
    workflowSections,
    finishCascade: deriveRuntimeSelectorFinishCascade({}),
    donorFieldParity: parity,
    timelineStatusFiltering,
    sourceReadiness,
    safeSnapshotState: sourceReadiness,
    referenceOptionSourceCoverage: sourceReadiness.referenceOptionSourceCoverage,
    futureMappedFieldExplanation: sourceReadiness.futureMappedFieldExplanation,
    futureMappedFields: sourceReadiness.futureMappedFields,
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
    specialPartsUserTestSummary: safeSpecialPartsUserTestSummary({}, { specialPartsTestPrincipal, showSpecialParts, constraints: safeConstraints }),
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

export function deriveSelectorReferenceOptionsFromSnapshot(snapshot = {}, { constraints = {}, source = {}, ok = true, timelineVisibilityMode = "", timelineAsOfDate = "", timelineVisibleStatuses = DEFAULT_TIMELINE_VISIBLE_STATUSES, specialPartsTestPrincipal = "", showSpecialParts = false } = {}) {
  const safeSnapshot = isPlainObject(snapshot) ? snapshot : {};
  const safeConstraints = sanitiseConstraints(constraints);
  const timelineContext = createSelectorTimelineContext({ timelineVisibilityMode, timelineAsOfDate, timelineVisibleStatuses });
  const sourceReady = ok !== false && (source.readable !== false) && (source.parseable !== false);
  if (!sourceReady) return failurePayload({ source, reason: "Selector Reference source is unavailable or not parseable.", constraints: safeConstraints, timelineContext, specialPartsTestPrincipal, showSpecialParts });

  const bucket = collectOptions(safeSnapshot, timelineContext);
  const records = collectRecords(safeSnapshot, bucket, timelineContext);
  const cascadeConstraints = cascadeConstraintsForOptions(bucket, safeConstraints);
  const parentConstraints = workflowParentConstraintsForAutoConsequences({ bucket, records, constraints: safeConstraints, cascadeConstraints });
  const fields = createFields({ bucket, records, constraints: safeConstraints, cascadeConstraints, sourceReady });
  const workflowSectionsBase = createWorkflowSections({ bucket, records, constraints: safeConstraints, cascadeConstraints, parentConstraints, sourceReady });
  const finishCascadeResult = applySelectorFinishCascadeToWorkflowSections(workflowSectionsBase, safeConstraints);
  const workflowSections = finishCascadeResult.workflowSections;
  const manualConstraints = createManualConstraintList(fields, safeConstraints);
  const autoConsequences = [
    ...deriveAutoConsequences(fields, safeConstraints),
    ...deriveWorkflowConsequences(workflowSections, safeConstraints),
  ];
  const blocked = [...blockedItems(fields), ...workflowBlockedItems(workflowSections)];
  const parity = donorFieldParity(workflowSections);
  const entitlementSummary = safeEntitlementSummary(safeSnapshot);
  const specialPartsUserTestSummary = safeSpecialPartsUserTestSummary(safeSnapshot, { specialPartsTestPrincipal, showSpecialParts, constraints: cascadeConstraints });
  const availableFieldCount = fields.filter((field) => field.status === "available").length;
  const optionFieldCount = fields.filter((field) => field.options.length).length;
  const workflowMappedFieldCount = parity.counts.mapped || 0;
  const hasMissing = fields.some((field) => field.futureMapped) || (parity.counts["future-mapped"] || 0) > 0;
  const hasBlocked = blocked.length > 0;
  const tableSummaryRows = tableSummary(safeSnapshot);
  const sourceReadiness = createOptionSafeSnapshotState({
    source,
    sourceReady,
    fields,
    workflowSections,
    tableSummaryRows,
    reason: hasMissing ? "Some option fields are future-mapped or unavailable from the current source; no fake values emitted." : "",
  });
  const timelineStatusFiltering = createTimelineStatusFilteringSummary({ fields, workflowSections, timelineContext });

  return {
    ok: true,
    endpoint: SELECTOR_REFERENCE_OPTIONS_PATH,
    owner: "runtime-server",
    status: hasBlocked || hasMissing ? "preview-with-blockers" : "preview-ready",
    source,
    sourceReady: true,
    selectedConstraints: safeConstraints,
    timelineVisibilityMode: timelineContext.timelineVisibilityMode,
    timelineAsOfDate: timelineContext.timelineAsOfDate,
    timelineVisibleStatuses: [...(timelineContext.timelineVisibleStatuses || DEFAULT_TIMELINE_VISIBLE_STATUSES)],
    internalAsOfTestMode: timelineContext.internalAsOfTestMode === true,
    fields,
    workflowSections,
    finishCascade: finishCascadeResult.finishCascade,
    donorFieldParity: parity,
    timelineStatusFiltering,
    sourceReadiness,
    safeSnapshotState: sourceReadiness,
    referenceOptionSourceCoverage: sourceReadiness.referenceOptionSourceCoverage,
    futureMappedFieldExplanation: sourceReadiness.futureMappedFieldExplanation,
    futureMappedFields: sourceReadiness.futureMappedFields,
    specialPartsEntitlementSummary: entitlementSummary,
    specialPartsUserTestSummary,
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
    tableSummary: tableSummaryRows,
    sourceShapeSummary: sourceShapeSummary(safeSnapshot),
    warnings: [
      ...(hasMissing ? ["Some fields are unavailable from the current source and are future-mapped, not faked."] : []),
      ...(hasBlocked ? ["Some options are blocked/missing under current constraints and are shown rather than silently hidden."] : []),
      "Selector previews selection readiness. Lab Proof proves later.",
    ],
    ...SAFE_FLAGS,
  };
}

export async function buildSelectorReferenceOptions({ sourcePath, fsApi = DEFAULT_FS_API, constraints = {}, timelineVisibilityMode = "", timelineAsOfDate = "", timelineVisibleStatuses = DEFAULT_TIMELINE_VISIBLE_STATUSES, specialPartsTestPrincipal = "", showSpecialParts = false } = {}) {
  if (!sourcePath) {
    return failurePayload({ reason: "Selector Reference options source path is not configured.", constraints, specialPartsTestPrincipal, showSpecialParts });
  }

  let sourceStat = null;
  try {
    sourceStat = await fsApi.stat(sourcePath);
    const text = await fsApi.readFile(sourcePath, "utf-8");
    const snapshot = JSON.parse(text);
    const parseable = isPlainObject(snapshot);
    const source = sourceMetadata({ sourceStat, present: true, readable: true, parseable });
    if (!parseable) return failurePayload({ source, reason: "Selector Reference options source parsed but did not contain a table object.", constraints, specialPartsTestPrincipal, showSpecialParts });
    return deriveSelectorReferenceOptionsFromSnapshot(snapshot, { constraints, source, ok: true, timelineVisibilityMode, timelineAsOfDate, timelineVisibleStatuses, specialPartsTestPrincipal, showSpecialParts });
  } catch (error) {
    const source = sourceMetadata({ sourceStat, present: Boolean(sourceStat), readable: error?.name === "SyntaxError", parseable: false });
    return failurePayload({ source, reason: error?.code || error?.message || "Selector Reference options source could not be read.", constraints, specialPartsTestPrincipal, showSpecialParts });
  }
}
