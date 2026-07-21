import { cloneSelectorRunAccessoryPlacementState, createInitialSelectorRunAccessoryPlacementState } from "./selectorRunAccessoryPlacementPreview.js";
import { cloneSelectorRunIntakeState, createInitialSelectorRunIntakeState } from "./selectorRunIntakePreview.js";

const DEFAULT_EXPANDER_SECTIONS = Object.freeze({
  projectMetadata: true,
  system: true,
  environment: true,
  lightControl: true,
  mounting: true,
  penetrationsWiring: true,
  finishes: true,
  egressAccessories: true,
  runs: true,
  timelineDiagnostics: true,
  pureReferenceDiagnosticLater: true,
});

const DEFAULT_PREVIEW_BUCKET_TEMPLATE = Object.freeze({
  source: "module-local default preview",
  manualConstraintCount: 0,
  autoConsequenceCount: 0,
  effectiveFieldCount: 0,
  committed: false,
  mutable: true,
  writes: false,
});

const DEFAULT_PREVIEW_BUCKET_STATUSES = Object.freeze({
  projectMetadata: "preview only",
  system: "preview only",
  environment: "not started",
  lightControl: "not started",
  mounting: "not started",
  penetrationsWiring: "not started",
  finishes: "not started",
  egressAccessories: "diagnostic only",
  runs: "later",
  timelineDiagnostics: "diagnostic only",
  pureReferenceDiagnosticLater: "later",
});

const SELECTOR_TIMELINE_VISIBILITY_MODES = Object.freeze({
  EXTERNAL_DEFAULT: "external-default",
  INTERNAL_ASOF_TEST: "internal-asof-test",
});

const SELECTOR_TIMELINE_STATUS_OPTIONS = Object.freeze(["available", "approved", "staged", "roadmap", "obsolete", "unknown"]);
const DEFAULT_SELECTOR_TIMELINE_VISIBLE_STATUSES = Object.freeze(["available", "approved"]);
const SPECIAL_PARTS_ALLAN_TEST_EMAIL = "allan@zencontrol.com";
const SPECIAL_PARTS_UNKNOWN_TEST_EMAIL = "unknown@example.test";
const SPECIAL_PARTS_TEST_PRINCIPAL_OPTIONS = Object.freeze([
  Object.freeze({ value: SPECIAL_PARTS_ALLAN_TEST_EMAIL, label: "Allan Organ <allan@zencontrol.com>" }),
  Object.freeze({ value: SPECIAL_PARTS_UNKNOWN_TEST_EMAIL, label: "Unknown / unentitled <unknown@example.test>" }),
]);

export const SELECTOR_TEST_CASE_STORAGE_KEY = "controlstack.cs-selector.local-test-case.v2";
const SELECTOR_TEST_CASE_VERSION = 1;
const SELECTOR_TEST_CASE_KIND = "selector-local-test-case";

export const SELECTOR_PROJECT_ENVELOPE_STATE_KIND = "cs-selector-project-envelope-ui-state";
export const SELECTOR_PROJECT_ENVELOPE_STATE_VERSION = 1;
export const SELECTOR_PROJECT_ENVELOPE_CONTRIBUTION_STATUS = "saved-ui-state";

const SELECTOR_PROJECT_ENVELOPE_STATE_KEYS = Object.freeze([
  "kind",
  "version",
  "selectedCategory",
  "expanderSections",
  "manualConstraints",
  "timelineStatusTest",
  "specialPartsUserTest",
  "safety",
]);

const SELECTOR_PROJECT_ENVELOPE_SAFETY = Object.freeze({
  serialisableUiStateOnly: true,
  rawOptionRowsIncluded: false,
  sourceRowsIncluded: false,
  engineCandidatesIncluded: false,
  resultsIncluded: false,
  generatedOutputsIncluded: false,
  runtimeDataMutationEnabled: false,
  serverPersistenceEnabled: false,
  writes: false,
});

const SAFE_SELECTOR_TEST_CASE_MANUAL_CONSTRAINT_KEYS = Object.freeze(new Set([
  "system",
  "application",
  "interiorExterior",
  "optic",
  "controlType",
  "driver",
  "ipRating",
  "ikRating",
  "mountStyle",
  "bodyFinish",
  "emergency",
  "sensor",
  "specialParts",
  "tier",
  "variantKey",
  "emission",
  "directCapability",
  "indirectCapability",
  "opticSub",
  "opticIndirect",
  "diffuserVar1",
  "diffuserVar2",
  "directOpticVar1",
  "directOpticVar2",
  "indirectOpticVar1",
  "indirectOpticVar2",
  "electricalClass",
  "ambient",
  "targetLmPerM",
  "cctCri",
  "indirectMatchDirect",
  "targetLmPerMIndirect",
  "cctCriIndirect",
  "controlTypeIndirect",
  "mountSelection",
  "mountParticulars",
  "powerPenetration",
  "powerLocation",
  "flexLength",
  "wiringType",
  "finishDefault",
  "finishCover",
  "finishEnd",
  "finishFlex",
  "egressLight",
  "egressSound",
  "accessories",
  "specialPartsEntitlement",
  "specialPartsOptIn",
  "userEntitlementStatus",
]));

const SELECTOR_TEST_CASE_FORBIDDEN_FIELD_KEY_PATTERN = /(?:raw|payload|engine|selectedresult|ies|runtable|runtimetable|runtable|runtimeData|credential|secret|token|privatepath|exact|currentma|currentamp|voltage|watt|wattage|powerfactor|circuitwatt|electricalvalue)/i;
const SELECTOR_TEST_CASE_FORBIDDEN_VALUE_PATTERN = /(?:C:\\|\\ControlStack|\/mnt\/|novondb|raw_rows|rawRows|rawPayload|selectedResult|engineResult|credential|secret|token|apiKey)/i;

function isoTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function normaliseTimelineStatus(value = "") {
  const key = String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (["available", "active", "current", "live", "released", "sellable", "orderable"].includes(key)) return "available";
  if (["approved", "approved available", "approved for use", "approved for selector"].includes(key)) return "approved";
  if (["staged", "stage", "pilot", "preview", "pre release", "preproduction", "pre production", "pending release", "business case"].includes(key)) return "staged";
  if (["roadmap", "future", "planned", "concept", "proposed", "under development", "development"].includes(key)) return "roadmap";
  if (["obsolete", "retired", "deleted", "inactive", "discontinued", "superseded", "end of life", "eol"].includes(key)) return "obsolete";
  return "unknown";
}

function normaliseTimelineStatuses(value = DEFAULT_SELECTOR_TIMELINE_VISIBLE_STATUSES) {
  const raw = Array.isArray(value) ? value : String(value || "").split(/[;,|]/);
  const statuses = [...new Set(raw.map(normaliseTimelineStatus).filter((status) => SELECTOR_TIMELINE_STATUS_OPTIONS.includes(status)))];
  return statuses.length ? statuses : [...DEFAULT_SELECTOR_TIMELINE_VISIBLE_STATUSES];
}

function createInitialTimelineStatusTestState() {
  return {
    timelineVisibilityMode: SELECTOR_TIMELINE_VISIBILITY_MODES.EXTERNAL_DEFAULT,
    timelineAsOfDate: isoTodayDate(),
    timelineVisibleStatuses: [...DEFAULT_SELECTOR_TIMELINE_VISIBLE_STATUSES],
    timelineVisibleStatusOptions: [...SELECTOR_TIMELINE_STATUS_OPTIONS],
    readOnly: true,
    diagnosticOnly: true,
    queryParamsOnly: true,
    productionActionsEnabled: false,
    rawRowsExposed: false,
  };
}

function cloneTimelineStatusTestState(value = {}) {
  const base = createInitialTimelineStatusTestState();
  const mode = value.timelineVisibilityMode === SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST
    ? SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST
    : SELECTOR_TIMELINE_VISIBILITY_MODES.EXTERNAL_DEFAULT;
  return {
    ...base,
    ...value,
    timelineVisibilityMode: mode,
    timelineAsOfDate: String(value.timelineAsOfDate || base.timelineAsOfDate).trim() || base.timelineAsOfDate,
    timelineVisibleStatuses: mode === SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST
      ? normaliseTimelineStatuses(value.timelineVisibleStatuses || base.timelineVisibleStatuses)
      : [...DEFAULT_SELECTOR_TIMELINE_VISIBLE_STATUSES],
    timelineVisibleStatusOptions: [...SELECTOR_TIMELINE_STATUS_OPTIONS],
    readOnly: true,
    diagnosticOnly: true,
    queryParamsOnly: true,
    productionActionsEnabled: false,
    rawRowsExposed: false,
  };
}

function emailFromSpecialPartsPrincipal(value = "") {
  const requested = String(value || "").trim();
  if (!requested) return "";
  const angleMatch = requested.match(/<([^<>\s]+@[^<>\s]+)>/);
  const candidate = angleMatch ? angleMatch[1] : requested;
  const email = candidate.trim().toLowerCase();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : "";
}

function normaliseSpecialPartsTestPrincipal(value = "") {
  const email = emailFromSpecialPartsPrincipal(value);
  if (!email) return String(value || "").trim() ? SPECIAL_PARTS_UNKNOWN_TEST_EMAIL : "";
  return email;
}

function specialPartsTestPrincipalOptions() {
  return SPECIAL_PARTS_TEST_PRINCIPAL_OPTIONS.map((principal) => ({ ...principal }));
}

function createInitialSpecialPartsUserTestState() {
  return {
    testPrincipal: "",
    showEntitlementBackedSpecialParts: false,
    testPrincipalOptions: specialPartsTestPrincipalOptions(),
    readOnly: true,
    diagnosticOnly: true,
    queryParamsOnly: true,
    productionActionsEnabled: false,
    rawRowsExposed: false,
  };
}

function cloneSpecialPartsUserTestState(value = {}) {
  const base = createInitialSpecialPartsUserTestState();
  return {
    ...base,
    ...value,
    testPrincipal: normaliseSpecialPartsTestPrincipal(value.testPrincipal || value.activeTestPrincipal || base.testPrincipal),
    showEntitlementBackedSpecialParts: value.showEntitlementBackedSpecialParts === true,
    testPrincipalOptions: specialPartsTestPrincipalOptions(),
    readOnly: true,
    diagnosticOnly: true,
    queryParamsOnly: true,
    productionActionsEnabled: false,
    rawRowsExposed: false,
  };
}

function safeSelectorTestCaseString(value, { allowDate = false } = {}) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text.length > 240) return "";
  if (SELECTOR_TEST_CASE_FORBIDDEN_VALUE_PATTERN.test(text)) return "";
  if (allowDate && /^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return text.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

function selectorTestCaseFieldIsSafe(fieldKey = "") {
  const key = String(fieldKey || "").trim();
  return Boolean(
    key
    && SAFE_SELECTOR_TEST_CASE_MANUAL_CONSTRAINT_KEYS.has(key)
    && !SELECTOR_TEST_CASE_FORBIDDEN_FIELD_KEY_PATTERN.test(key)
  );
}

function cloneSafeSelectorTestCaseConstraint(fieldKey = "", constraint = {}) {
  if (!selectorTestCaseFieldIsSafe(fieldKey)) return null;
  const value = safeSelectorTestCaseString(constraint?.value ?? constraint);
  if (!value) return null;
  const valueLabel = safeSelectorTestCaseString(constraint?.valueLabel || constraint?.label || value) || value;
  return {
    fieldKey,
    value,
    valueLabel,
    kind: "manual-constraint",
    source: "browser-local Selector test-case recall",
    mutable: true,
    writes: false,
  };
}

function cloneSafeSelectorTestCaseManualConstraints(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([fieldKey, constraint]) => {
    const safe = cloneSafeSelectorTestCaseConstraint(fieldKey, constraint);
    return safe ? [fieldKey, safe] : null;
  }).filter(Boolean));
}

function cloneSafeTimelineStatusTestCaseState(value = {}) {
  const safe = cloneTimelineStatusTestState(value);
  return {
    timelineVisibilityMode: safe.timelineVisibilityMode,
    timelineAsOfDate: safeSelectorTestCaseString(safe.timelineAsOfDate, { allowDate: true }) || isoTodayDate(),
    timelineVisibleStatuses: normaliseTimelineStatuses(safe.timelineVisibleStatuses),
    readOnly: true,
    diagnosticOnly: true,
    queryParamsOnly: true,
    productionActionsEnabled: false,
  };
}

function cloneSafeSpecialPartsUserTestCaseState(value = {}) {
  const safe = cloneSpecialPartsUserTestState(value);
  return {
    testPrincipal: safe.testPrincipal,
    showEntitlementBackedSpecialParts: safe.showEntitlementBackedSpecialParts === true,
    readOnly: true,
    diagnosticOnly: true,
    queryParamsOnly: true,
    productionActionsEnabled: false,
  };
}

function selectorTestCaseSummaryFromPayload(payload = {}) {
  const manualConstraints = cloneSafeSelectorTestCaseManualConstraints(payload.manualConstraints || payload.dbBackedManualConstraints || payload.dbBackedSelector?.manualConstraints || {});
  const timelineStatusTest = cloneSafeTimelineStatusTestCaseState(payload.timelineStatusTest || {});
  const specialPartsUserTest = cloneSafeSpecialPartsUserTestCaseState(payload.specialPartsUserTest || {});
  const manualKeys = Object.keys(manualConstraints).sort();
  return {
    manualConstraintCount: manualKeys.length,
    manualConstraintKeys: manualKeys,
    timelineMode: timelineStatusTest.timelineVisibilityMode,
    timelineAsOfDate: timelineStatusTest.timelineAsOfDate,
    timelineVisibleStatuses: [...timelineStatusTest.timelineVisibleStatuses],
    specialPartsTestPrincipal: specialPartsUserTest.testPrincipal || "none",
    showEntitlementBackedSpecialParts: specialPartsUserTest.showEntitlementBackedSpecialParts === true,
  };
}

function createSelectorTestCaseSummaryRows(payload = null) {
  if (!payload) {
    return [
      ["saved test case", "none"],
      ["scope", "browser-local Selector test state only"],
      ["production Project save", "false"],
      ["storage", "localStorage only when available"],
    ];
  }
  const summary = selectorTestCaseSummaryFromPayload(payload);
  return [
    ["saved test case", "present"],
    ["manual constraints", String(summary.manualConstraintCount)],
    ["constraint fields", summary.manualConstraintKeys.join(", ") || "none"],
    ["timeline mode", summary.timelineMode],
    ["timeline as-of date", summary.timelineAsOfDate],
    ["timeline visible statuses", summary.timelineVisibleStatuses.join(", ") || "available, approved"],
    ["special-parts test principal", summary.specialPartsTestPrincipal],
    ["show entitlement-backed special parts", summary.showEntitlementBackedSpecialParts ? "true" : "false"],
    ["production Project save", "false"],
    ["RuntimeData mutation", "false"],
    ["server persistence", "false"],
    ["POST endpoints", "false"],
  ];
}

function createSelectorTestCaseState(value = {}) {
  const savedTestCase = value.savedTestCase ? sanitiseSelectorTestCase(value.savedTestCase) : null;
  return {
    title: "Selector test-case save / recall",
    storageKey: SELECTOR_TEST_CASE_STORAGE_KEY,
    storageKind: "browser-local-storage",
    status: value.status || (savedTestCase ? "saved-test-case-available" : "no-saved-test-case"),
    savedTestCasePresent: Boolean(savedTestCase),
    savedAt: savedTestCase?.savedAt || "",
    summary: savedTestCase ? selectorTestCaseSummaryFromPayload(savedTestCase) : null,
    summaryRows: createSelectorTestCaseSummaryRows(savedTestCase),
    boundaryCopy: [
      "Local Selector test case only — not a production Project save.",
      "Browser-local storage only; no RuntimeData mutation, no server persistence, and no POST endpoint.",
      "Recall rehydrates safe local constraints and reloads source-backed options; compatibility checks still apply.",
      "Blocked or stale recalled values are preserved for review rather than faked as valid.",
    ],
    localStorageOnly: true,
    productionProjectSave: false,
    runtimeDataMutationEnabled: false,
    serverPersistenceEnabled: false,
    postEndpointsEnabled: false,
    selectedResultPersistenceEnabled: false,
    engineReadinessEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    writes: false,
    generation: false,
    proof: false,
  };
}

function cloneSelectorTestCaseState(value = {}) {
  const fallback = createSelectorTestCaseState();
  const summary = value.summary && typeof value.summary === "object" && !Array.isArray(value.summary)
    ? {
      ...value.summary,
      manualConstraintKeys: Array.isArray(value.summary.manualConstraintKeys) ? [...value.summary.manualConstraintKeys] : [],
      timelineVisibleStatuses: Array.isArray(value.summary.timelineVisibleStatuses) ? [...value.summary.timelineVisibleStatuses] : [],
    }
    : null;
  return {
    ...fallback,
    ...value,
    savedTestCasePresent: value.savedTestCasePresent === true,
    summary,
    summaryRows: Array.isArray(value.summaryRows) ? value.summaryRows.map((row) => [...row]) : [...fallback.summaryRows],
    boundaryCopy: Array.isArray(value.boundaryCopy) ? [...value.boundaryCopy] : [...fallback.boundaryCopy],
    localStorageOnly: true,
    productionProjectSave: false,
    runtimeDataMutationEnabled: false,
    serverPersistenceEnabled: false,
    postEndpointsEnabled: false,
    selectedResultPersistenceEnabled: false,
    engineReadinessEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    writes: false,
    generation: false,
    proof: false,
  };
}

export function sanitiseSelectorTestCase(value = {}) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const manualConstraints = cloneSafeSelectorTestCaseManualConstraints(source.manualConstraints || source.dbBackedManualConstraints || source.dbBackedSelector?.manualConstraints || {});
  const timelineStatusTest = cloneSafeTimelineStatusTestCaseState(source.timelineStatusTest || {});
  const specialPartsUserTest = cloneSafeSpecialPartsUserTestCaseState(source.specialPartsUserTest || {});
  const savedAt = safeSelectorTestCaseString(source.savedAt) || new Date().toISOString();
  const summary = selectorTestCaseSummaryFromPayload({ manualConstraints, timelineStatusTest, specialPartsUserTest });
  return {
    kind: SELECTOR_TEST_CASE_KIND,
    version: SELECTOR_TEST_CASE_VERSION,
    source: "browser-local Selector test-case state",
    storageKind: "browser-local-storage",
    savedAt,
    manualConstraints,
    timelineStatusTest,
    specialPartsUserTest,
    summary,
    safety: {
      localStorageOnly: true,
      productionProjectSave: false,
      runtimeDataMutationEnabled: false,
      serverPersistenceEnabled: false,
      postEndpointsEnabled: false,
      selectedResultPersistenceEnabled: false,
      engineReadinessEnabled: false,
      runTableGenerationEnabled: false,
      iesGenerationEnabled: false,
      projectExportEnabled: false,
      hubSpotWriteEnabled: false,
      writes: false,
      generation: false,
      proof: false,
    },
  };
}

export function buildSelectorTestCaseFromSnapshot(snapshot = {}) {
  return sanitiseSelectorTestCase({
    savedAt: new Date().toISOString(),
    manualConstraints: snapshot.dbBackedSelector?.manualConstraints || snapshot.selectorStateContract?.manualConstraints || {},
    timelineStatusTest: snapshot.timelineStatusTest || {},
    specialPartsUserTest: snapshot.specialPartsUserTest || {},
  });
}

function selectorProjectEnvelopePlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cloneSelectorProjectEnvelopeManualConstraints(value = {}) {
  const safe = cloneSafeSelectorTestCaseManualConstraints(value);
  return Object.fromEntries(Object.entries(safe).map(([fieldKey, constraint]) => [fieldKey, {
    fieldKey,
    value: constraint.value,
    valueLabel: constraint.valueLabel,
    kind: "manual-constraint",
    source: "Selector Project-envelope restored UI constraint",
    mutable: true,
    writes: false,
  }]));
}

function cloneSelectorProjectEnvelopeExpanders(value = {}) {
  return Object.fromEntries(Object.keys(DEFAULT_EXPANDER_SECTIONS).map((sectionId) => [
    sectionId,
    value?.[sectionId] !== false,
  ]));
}

function safeSelectorProjectEnvelopeCategory(value = "overview") {
  const category = String(value || "overview").trim().toLowerCase();
  return /^[a-z0-9_-]{1,64}$/.test(category) ? category : "overview";
}

export function sanitiseSelectorProjectEnvelopeState(value = {}) {
  const source = selectorProjectEnvelopePlainObject(value) ? value : {};
  return {
    kind: SELECTOR_PROJECT_ENVELOPE_STATE_KIND,
    version: SELECTOR_PROJECT_ENVELOPE_STATE_VERSION,
    selectedCategory: safeSelectorProjectEnvelopeCategory(source.selectedCategory),
    expanderSections: cloneSelectorProjectEnvelopeExpanders(source.expanderSections),
    manualConstraints: cloneSelectorProjectEnvelopeManualConstraints(
      source.manualConstraints || source.dbBackedSelector?.manualConstraints || {},
    ),
    timelineStatusTest: cloneSafeTimelineStatusTestCaseState(source.timelineStatusTest || {}),
    specialPartsUserTest: cloneSafeSpecialPartsUserTestCaseState(source.specialPartsUserTest || {}),
    safety: { ...SELECTOR_PROJECT_ENVELOPE_SAFETY },
  };
}

function exactObjectKeys(value, expectedKeys) {
  if (!selectorProjectEnvelopePlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function selectorProjectEnvelopeConstraintIsApproved(fieldKey, value) {
  if (!selectorTestCaseFieldIsSafe(fieldKey) || !exactObjectKeys(value, [
    "fieldKey",
    "value",
    "valueLabel",
    "kind",
    "source",
    "mutable",
    "writes",
  ])) return false;
  return value.fieldKey === fieldKey
    && value.kind === "manual-constraint"
    && value.source === "Selector Project-envelope restored UI constraint"
    && value.mutable === true
    && value.writes === false
    && safeSelectorTestCaseString(value.value) === value.value
    && safeSelectorTestCaseString(value.valueLabel) === value.valueLabel;
}

export function validateSelectorProjectEnvelopeState(value) {
  if (!selectorProjectEnvelopePlainObject(value) || Object.keys(value).length === 0) {
    return { valid: false, reason: "Selector Project-envelope state is missing or empty." };
  }
  if (!exactObjectKeys(value, SELECTOR_PROJECT_ENVELOPE_STATE_KEYS)) {
    return { valid: false, reason: "Selector Project-envelope state contains unapproved fields." };
  }
  if (value.kind !== SELECTOR_PROJECT_ENVELOPE_STATE_KIND || value.version !== SELECTOR_PROJECT_ENVELOPE_STATE_VERSION) {
    return { valid: false, reason: "Selector Project-envelope state kind or version is unsupported." };
  }
  if (safeSelectorProjectEnvelopeCategory(value.selectedCategory) !== value.selectedCategory) {
    return { valid: false, reason: "Selector Project-envelope selected category is invalid." };
  }
  if (!exactObjectKeys(value.expanderSections, Object.keys(DEFAULT_EXPANDER_SECTIONS))
    || Object.values(value.expanderSections).some((open) => typeof open !== "boolean")) {
    return { valid: false, reason: "Selector Project-envelope expander state is invalid." };
  }
  if (!selectorProjectEnvelopePlainObject(value.manualConstraints)
    || Object.entries(value.manualConstraints).some(([fieldKey, constraint]) => !selectorProjectEnvelopeConstraintIsApproved(fieldKey, constraint))) {
    return { valid: false, reason: "Selector Project-envelope manual constraints are invalid." };
  }
  const safeTimeline = cloneSafeTimelineStatusTestCaseState(value.timelineStatusTest || {});
  const safeSpecialParts = cloneSafeSpecialPartsUserTestCaseState(value.specialPartsUserTest || {});
  if (JSON.stringify(safeTimeline) !== JSON.stringify(value.timelineStatusTest)
    || JSON.stringify(safeSpecialParts) !== JSON.stringify(value.specialPartsUserTest)) {
    return { valid: false, reason: "Selector Project-envelope diagnostic UI state is invalid." };
  }
  if (JSON.stringify(value.safety) !== JSON.stringify(SELECTOR_PROJECT_ENVELOPE_SAFETY)) {
    return { valid: false, reason: "Selector Project-envelope safety declaration is invalid." };
  }
  return {
    valid: true,
    reason: "Selector Project-envelope state is approved.",
    state: sanitiseSelectorProjectEnvelopeState(value),
  };
}

export function createSelectorProjectEnvelopeContribution(snapshot = {}) {
  return {
    moduleId: "cs_selector",
    status: SELECTOR_PROJECT_ENVELOPE_CONTRIBUTION_STATUS,
    state: sanitiseSelectorProjectEnvelopeState(snapshot),
    reason: null,
  };
}

const DEFAULT_PREVIEW_DEFAULTS = Object.freeze(Object.fromEntries(
  Object.keys(DEFAULT_EXPANDER_SECTIONS).map((sectionId) => [
    sectionId,
    Object.freeze({
      status: DEFAULT_PREVIEW_BUCKET_STATUSES[sectionId] || "not started",
      ...DEFAULT_PREVIEW_BUCKET_TEMPLATE,
    }),
  ])
));

const SELECTOR_FIELD_OPTIONS = Object.freeze({
  system: Object.freeze([
    Object.freeze({ value: "linear-60", label: "Linear 60 — default-preview" }),
    Object.freeze({ value: "linear-80", label: "Linear 80" }),
  ]),
  variant: Object.freeze([
    Object.freeze({ value: "linear-60-core", label: "Linear 60 core consequence" }),
    Object.freeze({ value: "linear-80-core", label: "Linear 80 core consequence" }),
    Object.freeze({ value: "manual-variant-review", label: "Manual variant review" }),
  ]),
  emission: Object.freeze([
    Object.freeze({ value: "direct", label: "Direct" }),
    Object.freeze({ value: "direct-indirect", label: "Direct / indirect" }),
  ]),
  application: Object.freeze([
    Object.freeze({ value: "office", label: "Office — default-preview" }),
    Object.freeze({ value: "school", label: "School / education" }),
    Object.freeze({ value: "hospital", label: "Hospital / health" }),
    Object.freeze({ value: "exterior-amenity", label: "Exterior amenity" }),
  ]),
  interiorExterior: Object.freeze([
    Object.freeze({ value: "interior", label: "Interior — default-preview" }),
    Object.freeze({ value: "exterior", label: "Exterior" }),
  ]),
  ipRating: Object.freeze([
    Object.freeze({ value: "IP20", label: "IP20 — default-preview" }),
    Object.freeze({ value: "IP44", label: "IP44" }),
    Object.freeze({ value: "IP65", label: "IP65" }),
  ]),
  ikRating: Object.freeze([
    Object.freeze({ value: "IK07", label: "IK07 — default-preview" }),
    Object.freeze({ value: "IK08", label: "IK08" }),
    Object.freeze({ value: "IK10", label: "IK10" }),
  ]),
  targetLumensPerMetre: Object.freeze([
    Object.freeze({ value: "800", label: "800 lm/m" }),
    Object.freeze({ value: "1200", label: "1200 lm/m — default-preview" }),
    Object.freeze({ value: "1800", label: "1800 lm/m" }),
  ]),
  cctCri: Object.freeze([
    Object.freeze({ value: "cct_cri:3000K|CRI80", label: "3000K / CRI80" }),
    Object.freeze({ value: "cct_cri:4000K|CRI80", label: "4000K / CRI80 — default-preview" }),
    Object.freeze({ value: "cct_cri:TW_2700K_6500K|CRI90", label: "TW 2700K–6500K / CRI90" }),
  ]),
  optic: Object.freeze([
    Object.freeze({ value: "opal", label: "Opal — default-preview" }),
    Object.freeze({ value: "microprism", label: "Microprism" }),
    Object.freeze({ value: "linear-lens", label: "Linear lens" }),
  ]),
  controlType: Object.freeze([
    Object.freeze({ value: "dali-2", label: "DALI-2 — default-preview" }),
    Object.freeze({ value: "non-dim", label: "Non-dim" }),
    Object.freeze({ value: "phase-dim", label: "Phase dim" }),
  ]),
  driver: Object.freeze([
    Object.freeze({ value: "dali-driver", label: "DALI-2 driver consequence" }),
    Object.freeze({ value: "standard-driver", label: "Standard driver consequence" }),
    Object.freeze({ value: "high-output-driver", label: "High-output driver consequence" }),
    Object.freeze({ value: "manual-driver-review", label: "Manual driver review" }),
  ]),
  mountStyle: Object.freeze([
    Object.freeze({ value: "surface", label: "Surface — default-preview" }),
    Object.freeze({ value: "suspended", label: "Suspended" }),
    Object.freeze({ value: "recessed", label: "Recessed" }),
  ]),
  suspension: Object.freeze([
    Object.freeze({ value: "none", label: "None — default-preview" }),
    Object.freeze({ value: "wire", label: "Wire suspension" }),
    Object.freeze({ value: "rod", label: "Rod suspension" }),
  ]),
  ceilingType: Object.freeze([
    Object.freeze({ value: "plasterboard", label: "Plasterboard — default-preview" }),
    Object.freeze({ value: "exposed", label: "Exposed services" }),
    Object.freeze({ value: "grid", label: "Grid ceiling" }),
  ]),
  powerEntryFace: Object.freeze([
    Object.freeze({ value: "top", label: "Top — default-preview" }),
    Object.freeze({ value: "back", label: "Back" }),
    Object.freeze({ value: "end", label: "End" }),
  ]),
  powerEntryPosition: Object.freeze([
    Object.freeze({ value: "start", label: "Start — default-preview" }),
    Object.freeze({ value: "centre", label: "Centre" }),
    Object.freeze({ value: "end", label: "End" }),
  ]),
  wiringType: Object.freeze([
    Object.freeze({ value: "5-core-dali", label: "5-core DALI — default-preview" }),
    Object.freeze({ value: "3-core-switched", label: "3-core switched" }),
  ]),
  bodyFinish: Object.freeze([
    Object.freeze({ value: "white", label: "White — default-preview" }),
    Object.freeze({ value: "black", label: "Black" }),
    Object.freeze({ value: "custom", label: "Custom / review" }),
  ]),
  diffuserFinish: Object.freeze([
    Object.freeze({ value: "opal", label: "Opal — default-preview" }),
    Object.freeze({ value: "clear", label: "Clear" }),
  ]),
  trimFinish: Object.freeze([
    Object.freeze({ value: "match-body", label: "Match body — default-preview" }),
    Object.freeze({ value: "contrast", label: "Contrast" }),
  ]),
  emergency: Object.freeze([
    Object.freeze({ value: "no", label: "No emergency — default-preview" }),
    Object.freeze({ value: "yes", label: "Emergency required" }),
  ]),
  sensor: Object.freeze([
    Object.freeze({ value: "no", label: "No sensor — default-preview" }),
    Object.freeze({ value: "yes", label: "Sensor required" }),
  ]),
  specialParts: Object.freeze([
    Object.freeze({ value: "none", label: "No special parts consequence" }),
    Object.freeze({ value: "ip65-end-kit", label: "IP65 end kit consequence" }),
    Object.freeze({ value: "suspension-kit", label: "Suspension kit consequence" }),
    Object.freeze({ value: "emergency-sensor-review", label: "Emergency / sensor review consequence" }),
    Object.freeze({ value: "manual-special-parts-review", label: "Manual special parts review" }),
  ]),
  runCount: Object.freeze([
    Object.freeze({ value: "1", label: "1 run — default-preview" }),
    Object.freeze({ value: "2", label: "2 runs" }),
    Object.freeze({ value: "multiple", label: "Multiple runs" }),
  ]),
  totalLength: Object.freeze([
    Object.freeze({ value: "preview-only", label: "Preview length only — default-preview" }),
    Object.freeze({ value: "short", label: "Short run" }),
    Object.freeze({ value: "long", label: "Long run" }),
  ]),
  segmentStrategy: Object.freeze([
    Object.freeze({ value: "single-preview", label: "Single preview consequence" }),
    Object.freeze({ value: "multi-run-review", label: "Multi-run review consequence" }),
    Object.freeze({ value: "long-run-segment-review", label: "Long-run segment review consequence" }),
  ]),
});

const DEFAULT_PREVIEW_SELECTION_VALUES = Object.freeze({
  system: "linear-60",
  emission: "direct",
  application: "office",
  interiorExterior: "interior",
  ipRating: "IP20",
  ikRating: "IK07",
  targetLumensPerMetre: "1200",
  cctCri: "cct_cri:4000K|CRI80",
  optic: "opal",
  controlType: "dali-2",
  mountStyle: "surface",
  suspension: "none",
  ceilingType: "plasterboard",
  powerEntryFace: "top",
  powerEntryPosition: "start",
  wiringType: "5-core-dali",
  bodyFinish: "white",
  diffuserFinish: "opal",
  trimFinish: "match-body",
  emergency: "no",
  sensor: "no",
  runCount: "1",
  totalLength: "preview-only",
});

const DEFAULT_SECTION_FIELD_DEFINITIONS = Object.freeze({
  projectMetadata: Object.freeze([
    { fieldKey: "projectTitle", label: "Project title", status: "preview only" },
    { fieldKey: "client", label: "Client", status: "preview only" },
    { fieldKey: "site", label: "Site", status: "preview only" },
    { fieldKey: "requirementDate", label: "Requirement date", status: "preview only" },
  ]),
  system: Object.freeze([
    { fieldKey: "system", label: "System", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "variant", label: "Variant", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
    { fieldKey: "emission", label: "Emission", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
  ]),
  environment: Object.freeze([
    { fieldKey: "application", label: "Application", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "interiorExterior", label: "Interior / exterior", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "ipRating", label: "IP rating", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
    { fieldKey: "ikRating", label: "IK rating", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
  ]),
  lightControl: Object.freeze([
    { fieldKey: "targetLumensPerMetre", label: "Target lumens per metre", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "cctCri", label: "CCT/CRI", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "optic", label: "Optic", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "controlType", label: "Control type", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "driver", label: "Driver", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  mounting: Object.freeze([
    { fieldKey: "mountStyle", label: "Mount style", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "suspension", label: "Suspension", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "ceilingType", label: "Ceiling type", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  penetrationsWiring: Object.freeze([
    { fieldKey: "powerEntryFace", label: "Power entry face", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "powerEntryPosition", label: "Power entry position", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "wiringType", label: "Wiring type", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  finishes: Object.freeze([
    { fieldKey: "bodyFinish", label: "Body finish", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "diffuserFinish", label: "Diffuser finish", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
    { fieldKey: "trimFinish", label: "Trim finish", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
  ]),
  egressAccessories: Object.freeze([
    { fieldKey: "emergency", label: "Emergency", status: "diagnostic only", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "sensor", label: "Sensor", status: "diagnostic only", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "specialParts", label: "Special parts", status: "diagnostic only", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  runs: Object.freeze([
    { fieldKey: "runCount", label: "Run count", status: "later", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "totalLength", label: "Total length", status: "later", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "segmentStrategy", label: "Segment strategy", status: "later", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  timelineDiagnostics: Object.freeze([
    { fieldKey: "lifecycleStatus", label: "Lifecycle status", status: "diagnostic only" },
    { fieldKey: "requirementDateWindow", label: "Requirement date window", status: "diagnostic only" },
    { fieldKey: "specialPartsPolicy", label: "Special-parts policy", status: "diagnostic only" },
  ]),
  pureReferenceDiagnosticLater: Object.freeze([
    { fieldKey: "labProofStatus", label: "Lab proof status", status: "later" },
    { fieldKey: "pureReferenceState", label: "Pure reference state", status: "later" },
    { fieldKey: "photometryGenerationAllowed", label: "Photometry generation allowed", status: "later" },
  ]),
});

function createFieldContract(sectionId, field) {
  return Object.freeze({
    fieldKey: field.fieldKey,
    label: field.label,
    sectionId,
    status: field.status || "placeholder",
    inputType: SELECTOR_FIELD_OPTIONS[field.fieldKey] ? "select" : "placeholder",
    source: "runtime selector field contract",
    options: SELECTOR_FIELD_OPTIONS[field.fieldKey] ? SELECTOR_FIELD_OPTIONS[field.fieldKey].map((option) => ({ ...option })) : [],
    manualConstraintEligible: field.manualConstraintEligible === true,
    autoConsequenceEligible: field.autoConsequenceEligible === true,
    effectiveSelectionEligible: field.effectiveSelectionEligible === true,
    committedSpecEligible: field.committedSpecEligible === true,
    mutable: true,
    writes: false,
    productDataBound: false,
    resolverBound: false,
    filteringBound: false,
    requiredForSpecGate: field.requiredForSpecGate === true,
    requiredForBuildGate: field.requiredForBuildGate === true,
    value: null,
  });
}

function createSectionFieldContract() {
  return Object.freeze({
    source: "runtime selector field contract",
    sections: Object.freeze(Object.fromEntries(
      Object.keys(DEFAULT_EXPANDER_SECTIONS).map((sectionId) => [
        sectionId,
        Object.freeze({
          sectionId,
          source: "runtime selector field contract",
          status: DEFAULT_PREVIEW_BUCKET_STATUSES[sectionId] || "placeholder",
          fields: Object.freeze((DEFAULT_SECTION_FIELD_DEFINITIONS[sectionId] || []).map((field) => createFieldContract(sectionId, field))),
        }),
      ])
    )),
  });
}

const DEFAULT_SECTION_FIELD_CONTRACT = createSectionFieldContract();

function countManualConstraintEligibleFields(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  const sections = sectionFieldContract?.sections && typeof sectionFieldContract.sections === "object" && !Array.isArray(sectionFieldContract.sections)
    ? sectionFieldContract.sections
    : {};
  return Object.values(sections).reduce((count, section) => {
    const fields = Array.isArray(section.fields) ? section.fields : [];
    return count + fields.filter((field) => field.manualConstraintEligible === true).length;
  }, 0);
}

function createManualConstraintScaffold(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  return {
    source: "module-local selector scaffold",
    eligibleFieldCount: countManualConstraintEligibleFields(sectionFieldContract),
    constraints: {},
    activeManualConstraintCount: 0,
    placeholderActions: ["Set or clear local constraint"],
    actionLabels: {
      setConstraint: "Set local constraint",
      clearConstraint: "Clear local constraint",
    },
    blockedReason: "not blocked — local UI state only",
    constraintInputsActive: true,
    resolverActive: false,
    filteringActive: false,
    specReady: false,
    buildReady: false,
    factoryReady: false,
    writes: false,
  };
}

const SELECTOR_STATE_CONTRACT_TEMPLATE = Object.freeze({
  source: "module-local runtime state",
  freshLoad: true,
  previewDefaultState: true,
  selectorMode: "default-preview",
  specReady: false,
  buildReady: false,
  factoryReady: false,
  specGateComplete: false,
  buildGateComplete: false,
  specSlug: null,
  slugGenerationEnabled: false,
  selectorMutationScope: "local UI state only",
  boardDataMutationEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  payloadGenerationEnabled: false,
  runTableMutationEnabled: false,
  committedSpecExists: false,
  previewDefaults: Object.freeze({}),
  defaultPreviewSelections: Object.freeze({}),
  sectionFieldContract: Object.freeze({}),
  manualConstraints: Object.freeze({}),
  manualConstraintScaffold: Object.freeze({}),
  autoConsequences: Object.freeze({}),
  effectiveSelection: Object.freeze({}),
  compatibilityDiagnostics: Object.freeze({ warnings: Object.freeze([]), blockedIncompatibleFields: Object.freeze([]) }),
  committedSpec: null,
  provenanceMap: Object.freeze({}),
  behaviourFlags: Object.freeze({
    manualSelectionsAreConstraints: true,
    autoSelectionsAreConsequences: true,
    preserveCompatibleSelectionsOnFieldChange: true,
    autoDerivedItemsRemainChangeable: true,
    specSlugRequiresCompleteSpecGate: true,
  }),
  sideEffectGuards: Object.freeze({
    productCardsRendered: false,
    filteringActive: false,
    saveLoadActive: false,
    engineCallsActive: false,
    labCallsActive: false,
    iesCallsActive: false,
    downstreamPayloadActive: false,
    authorityWritesActive: false,
    slugGenerationActive: false,
    specExportActive: false,
    boardDataMutationActive: false,
    runTableMutationActive: false,
    payloadGenerationActive: false,
    rawBoardDataRowsExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
  }),
});

function cloneObjectBucket(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return { ...value };
}

function clonePreviewDefaults(value = DEFAULT_PREVIEW_DEFAULTS) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([sectionId, bucket]) => [
    sectionId,
    { ...bucket },
  ]));
}

function cloneManualConstraintScaffold(value = {}, sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  const fallback = createManualConstraintScaffold(sectionFieldContract);
  const scaffold = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const constraints = cloneObjectBucket(scaffold.constraints);
  const eligibleFieldCount = Number.isFinite(scaffold.eligibleFieldCount)
    ? scaffold.eligibleFieldCount
    : fallback.eligibleFieldCount;
  return {
    ...fallback,
    ...scaffold,
    source: scaffold.source || fallback.source,
    eligibleFieldCount,
    constraints,
    activeManualConstraintCount: Object.keys(constraints).length,
    placeholderActions: Array.isArray(scaffold.placeholderActions) ? [...scaffold.placeholderActions] : [...fallback.placeholderActions],
    actionLabels: {
      ...fallback.actionLabels,
      ...cloneObjectBucket(scaffold.actionLabels),
    },
    blockedReason: scaffold.blockedReason || fallback.blockedReason,
    constraintInputsActive: scaffold.constraintInputsActive === false ? false : fallback.constraintInputsActive,
    resolverActive: false,
    filteringActive: false,
    specReady: false,
    buildReady: false,
    factoryReady: false,
    writes: false,
  };
}

function cloneSectionFieldContract(value = DEFAULT_SECTION_FIELD_CONTRACT) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { source: "runtime selector field contract", sections: {} };
  const sections = value.sections && typeof value.sections === "object" && !Array.isArray(value.sections) ? value.sections : {};
  return {
    ...value,
    source: value.source || "runtime selector field contract",
    sections: Object.fromEntries(Object.entries(sections).map(([sectionId, section]) => [
      sectionId,
      {
        ...section,
        fields: Array.isArray(section.fields) ? section.fields.map((field) => ({
          ...field,
          options: Array.isArray(field.options) ? field.options.map((option) => ({ ...option })) : [],
          value: field.value ?? null,
        })) : [],
      },
    ])),
  };
}

function collectFieldContracts(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  const sections = sectionFieldContract?.sections && typeof sectionFieldContract.sections === "object" && !Array.isArray(sectionFieldContract.sections)
    ? sectionFieldContract.sections
    : {};
  return Object.values(sections).flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
}

function findFieldContract(sectionFieldContract, fieldKey) {
  return collectFieldContracts(sectionFieldContract).find((field) => field.fieldKey === fieldKey) || null;
}

function optionLabel(field = {}, value) {
  const option = Array.isArray(field.options) ? field.options.find((item) => item.value === value) : null;
  return option?.label || String(value || "");
}

function optionExists(field = {}, value) {
  if (!Array.isArray(field.options) || !field.options.length) return true;
  return field.options.some((item) => item.value === value);
}

function createSelectionRecord(field, value, kind, source, reason = "") {
  return {
    fieldKey: field.fieldKey,
    label: field.label || field.fieldKey,
    sectionId: field.sectionId || "unknown",
    value,
    valueLabel: optionLabel(field, value),
    kind,
    source,
    reason,
    selected: true,
    mutable: true,
    manualConstraint: kind === "manual-constraint",
    autoConsequence: kind === "auto-consequence",
    defaultPreview: kind === "default-preview",
    writes: false,
  };
}

function createDefaultPreviewSelections(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  return Object.fromEntries(Object.entries(DEFAULT_PREVIEW_SELECTION_VALUES).map(([fieldKey, value]) => {
    const field = findFieldContract(sectionFieldContract, fieldKey);
    if (!field || !optionExists(field, value)) return null;
    return [fieldKey, createSelectionRecord(
      field,
      value,
      "default-preview",
      "module-local default preview",
      "preamble/default-preview only; not a user-confirmed constraint"
    )];
  }).filter(Boolean));
}

function selectionValue(fieldKey, manualConstraints, defaultPreviewSelections) {
  return manualConstraints[fieldKey]?.value ?? defaultPreviewSelections[fieldKey]?.value ?? "";
}

function putAutoConsequence(output, sectionFieldContract, manualConstraints, fieldKey, value, reason) {
  if (manualConstraints[fieldKey]) return;
  const field = findFieldContract(sectionFieldContract, fieldKey);
  if (!field || !optionExists(field, value)) return;
  output[fieldKey] = createSelectionRecord(
    field,
    value,
    "auto-consequence",
    "module-local selector consequence preview",
    reason
  );
}

function deriveAutoConsequences(manualConstraints, defaultPreviewSelections, sectionFieldContract) {
  const output = {};
  const system = selectionValue("system", manualConstraints, defaultPreviewSelections);
  const controlType = selectionValue("controlType", manualConstraints, defaultPreviewSelections);
  const targetLumensPerMetre = selectionValue("targetLumensPerMetre", manualConstraints, defaultPreviewSelections);
  const ipRating = selectionValue("ipRating", manualConstraints, defaultPreviewSelections);
  const mountStyle = selectionValue("mountStyle", manualConstraints, defaultPreviewSelections);
  const emergency = selectionValue("emergency", manualConstraints, defaultPreviewSelections);
  const sensor = selectionValue("sensor", manualConstraints, defaultPreviewSelections);
  const runCount = selectionValue("runCount", manualConstraints, defaultPreviewSelections);
  const totalLength = selectionValue("totalLength", manualConstraints, defaultPreviewSelections);

  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "variant",
    system === "linear-80" ? "linear-80-core" : "linear-60-core",
    "consequence of the current system selection/default"
  );

  const driverValue = targetLumensPerMetre === "1800"
    ? "high-output-driver"
    : controlType === "non-dim"
      ? "standard-driver"
      : "dali-driver";
  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "driver",
    driverValue,
    "consequence of current control type and lumen target constraints/defaults"
  );

  const specialPartsValue = emergency === "yes" || sensor === "yes"
    ? "emergency-sensor-review"
    : ipRating === "IP65"
      ? "ip65-end-kit"
      : mountStyle === "suspended"
        ? "suspension-kit"
        : "none";
  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "specialParts",
    specialPartsValue,
    "consequence of current IP, mounting, emergency, and sensor constraints/defaults"
  );

  const segmentStrategyValue = totalLength === "long"
    ? "long-run-segment-review"
    : runCount === "multiple" || runCount === "2"
      ? "multi-run-review"
      : "single-preview";
  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "segmentStrategy",
    segmentStrategyValue,
    "consequence of current run count and length constraints/defaults"
  );

  return output;
}

function createCompatibilityWarning(fieldKey, label, value, message, severity = "warning") {
  return {
    fieldKey,
    label,
    value,
    message,
    severity,
    diagnosticOnly: true,
    autoCleared: false,
  };
}

function evaluateCompatibilityDiagnostics(effectiveSelection = {}) {
  const value = (fieldKey) => effectiveSelection[fieldKey]?.value || "";
  const label = (fieldKey) => effectiveSelection[fieldKey]?.label || fieldKey;
  const warnings = [];

  if (value("interiorExterior") === "exterior" && value("ipRating") !== "IP65") {
    warnings.push(createCompatibilityWarning(
      "ipRating",
      label("ipRating"),
      value("ipRating"),
      "Exterior selections are diagnostically incompatible with the current IP rating unless IP65 is selected. The manual selection is preserved for review."
    ));
  }
  if (value("application") === "school" && value("ikRating") !== "IK10") {
    warnings.push(createCompatibilityWarning(
      "ikRating",
      label("ikRating"),
      value("ikRating"),
      "School / education selections should be reviewed against IK10 durability. The current choice is labelled, not silently cleared."
    ));
  }
  if (value("mountStyle") === "recessed" && value("suspension") !== "none") {
    warnings.push(createCompatibilityWarning(
      "suspension",
      label("suspension"),
      value("suspension"),
      "Recessed mounting and suspension are blocked/incompatible as a diagnostic condition. The selected values remain visible."
    ));
  }
  if (value("controlType") === "non-dim" && value("sensor") === "yes") {
    warnings.push(createCompatibilityWarning(
      "controlType",
      label("controlType"),
      value("controlType"),
      "Sensor selection with non-dim control requires driver/control review. Nothing is removed automatically."
    ));
  }
  if (value("emission") === "direct-indirect" && value("mountStyle") === "recessed") {
    warnings.push(createCompatibilityWarning(
      "mountStyle",
      label("mountStyle"),
      value("mountStyle"),
      "Direct / indirect emission is diagnostically incompatible with recessed mounting in this local UI slice."
    ));
  }

  return {
    warnings,
    blockedIncompatibleFields: warnings.map((warning) => ({
      fieldKey: warning.fieldKey,
      label: warning.label,
      value: warning.value,
      reason: warning.message,
      diagnosticOnly: true,
      autoCleared: false,
    })),
  };
}

function createProvenanceMap(effectiveSelection = {}) {
  return Object.fromEntries(Object.entries(effectiveSelection).map(([fieldKey, selection]) => [
    fieldKey,
    {
      kind: selection.kind,
      source: selection.source,
      reason: selection.reason || "none",
      mutable: selection.mutable !== false,
      writes: false,
    },
  ]));
}

function recomputeSelectorStateContract(contract = {}) {
  const sectionFieldContract = cloneSectionFieldContract(contract.sectionFieldContract || DEFAULT_SECTION_FIELD_CONTRACT);
  const manualConstraints = cloneObjectBucket(contract.manualConstraints);
  const defaultPreviewSelections = createDefaultPreviewSelections(sectionFieldContract);
  const autoConsequences = deriveAutoConsequences(manualConstraints, defaultPreviewSelections, sectionFieldContract);
  const effectiveSelection = {
    ...defaultPreviewSelections,
    ...autoConsequences,
    ...manualConstraints,
  };
  const compatibilityDiagnostics = evaluateCompatibilityDiagnostics(effectiveSelection);
  const manualConstraintCount = Object.keys(manualConstraints).length;
  const scaffold = createManualConstraintScaffold(sectionFieldContract);
  const selectorMode = compatibilityDiagnostics.warnings.length
    ? "diagnostic"
    : manualConstraintCount
      ? "manual-constraint-editing"
      : "default-preview";

  return {
    ...SELECTOR_STATE_CONTRACT_TEMPLATE,
    ...contract,
    selectorMode,
    freshLoad: manualConstraintCount === 0,
    previewDefaultState: manualConstraintCount === 0,
    specReady: false,
    buildReady: false,
    factoryReady: false,
    specGateComplete: false,
    buildGateComplete: false,
    specSlug: null,
    slugGenerationEnabled: false,
    selectorMutationScope: "local UI state only",
    boardDataMutationEnabled: false,
    labProofAuthority: false,
    iesGenerationEnabled: false,
    payloadGenerationEnabled: false,
    runTableMutationEnabled: false,
    committedSpecExists: false,
    previewDefaults: clonePreviewDefaults(contract.previewDefaults || DEFAULT_PREVIEW_DEFAULTS),
    defaultPreviewSelections,
    sectionFieldContract,
    manualConstraints,
    manualConstraintScaffold: {
      ...scaffold,
      constraints: manualConstraints,
      activeManualConstraintCount: manualConstraintCount,
      constraintInputsActive: true,
      resolverActive: false,
      filteringActive: false,
      specReady: false,
      buildReady: false,
      factoryReady: false,
      writes: false,
    },
    autoConsequences,
    effectiveSelection,
    compatibilityDiagnostics,
    committedSpec: null,
    provenanceMap: createProvenanceMap(effectiveSelection),
    behaviourFlags: {
      ...SELECTOR_STATE_CONTRACT_TEMPLATE.behaviourFlags,
      ...cloneObjectBucket(contract.behaviourFlags),
    },
    sideEffectGuards: {
      ...SELECTOR_STATE_CONTRACT_TEMPLATE.sideEffectGuards,
      ...cloneObjectBucket(contract.sideEffectGuards),
      productCardsRendered: false,
      filteringActive: false,
      saveLoadActive: false,
      engineCallsActive: false,
      labCallsActive: false,
      iesCallsActive: false,
      downstreamPayloadActive: false,
      authorityWritesActive: false,
      slugGenerationActive: false,
      specExportActive: false,
      boardDataMutationActive: false,
      runTableMutationActive: false,
      payloadGenerationActive: false,
      rawBoardDataRowsExposed: false,
      rawUsersExposed: false,
      rawLabEvidenceExposed: false,
    },
  };
}

function normaliseManualValue(value) {
  return String(value ?? "").trim();
}

const DB_BACKED_CASCADE_CHILDREN_BY_PARENT = Object.freeze({
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
    "directOpticVar1",
    "directOpticVar2",
    "indirectOpticVar1",
    "indirectOpticVar2",
    "ipRating",
    "ikRating",
    "electricalClass",
    "mountStyle",
    "mountSelection",
    "mountParticulars",
    "powerPenetration",
    "powerLocation",
    "flexLength",
    "wiringType",
  ]),
  variantKey: Object.freeze([
    "optic",
    "opticSub",
    "opticIndirect",
    "diffuserVar1",
    "diffuserVar2",
    "directOpticVar1",
    "directOpticVar2",
    "indirectOpticVar1",
    "indirectOpticVar2",
    "ipRating",
    "ikRating",
    "electricalClass",
    "mountStyle",
    "mountSelection",
    "mountParticulars",
  ]),
  optic: Object.freeze(["opticSub", "ipRating", "ikRating"]),
  diffuserVar1: Object.freeze(["diffuserVar2", "ipRating", "ikRating"]),
  directOpticVar1: Object.freeze(["directOpticVar2", "ipRating", "ikRating"]),
  indirectOpticVar1: Object.freeze([]),
  mountStyle: Object.freeze(["mountSelection", "mountParticulars"]),
  mountSelection: Object.freeze(["mountParticulars"]),
  controlType: Object.freeze(["driver", "wiringType"]),
});

function cascadeChildrenForField(fieldKey, seen = new Set()) {
  const key = normaliseManualValue(fieldKey);
  if (!key || seen.has(key)) return [];
  seen.add(key);
  const directChildren = DB_BACKED_CASCADE_CHILDREN_BY_PARENT[key] || [];
  return [...new Set(directChildren.flatMap((child) => [child, ...cascadeChildrenForField(child, seen)]))];
}

export function clearDbBackedSelectorCascadeChildren(manualConstraints = {}, parentFieldKey = "") {
  const nextManualConstraints = cloneObjectBucket(manualConstraints);
  const clearedFields = [];
  for (const childKey of cascadeChildrenForField(parentFieldKey)) {
    if (Object.prototype.hasOwnProperty.call(nextManualConstraints, childKey)) {
      delete nextManualConstraints[childKey];
      clearedFields.push(childKey);
    }
  }
  return { nextManualConstraints, clearedFields };
}

function createInitialSelectorStateContract() {
  const sectionFieldContract = cloneSectionFieldContract(DEFAULT_SECTION_FIELD_CONTRACT);
  return recomputeSelectorStateContract({
    ...SELECTOR_STATE_CONTRACT_TEMPLATE,
    previewDefaults: clonePreviewDefaults(DEFAULT_PREVIEW_DEFAULTS),
    sectionFieldContract,
    manualConstraints: {},
    committedSpec: null,
    behaviourFlags: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.behaviourFlags },
    sideEffectGuards: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.sideEffectGuards },
  });
}

function safeSelectorSourceVersionValue(value = "") {
  const text = normaliseManualValue(value);
  if (!text || text.length > 240) return "";
  if (SELECTOR_TEST_CASE_FORBIDDEN_VALUE_PATTERN.test(text)) return "";
  return text;
}

function cloneSelectorSourceVersionBinding(value = {}) {
  const sourceInputFingerprint = safeSelectorSourceVersionValue(value.sourceInputFingerprint || value.sourceInputFingerprintMetadata?.value || "");
  const boardDataSourceVersion = safeSelectorSourceVersionValue(value.boardDataSourceVersion || value.boardDataSourceVersionMetadata?.value || "");
  const bound = Boolean(sourceInputFingerprint && boardDataSourceVersion);
  return {
    ...(value && typeof value === "object" && !Array.isArray(value) ? value : {}),
    sourceInputFingerprint,
    boardDataSourceVersion,
    bindingStatus: bound ? "source-version-bound" : "source-version-unbound",
    optionSetsBound: bound,
    selectedValuesBound: bound,
    staleRevalidationEnabled: true,
    staleValuesBecomeDiagnosticUnmapped: true,
    staleValuesInsertedIntoOptions: false,
    readOnly: true,
    diagnosticOnly: true,
    writes: false,
    rawRowsExposed: false,
  };
}

function cloneDbBackedConstraintRecord(constraint = {}) {
  const sourceVersionBinding = cloneSelectorSourceVersionBinding(constraint.sourceVersionBinding || constraint);
  return {
    ...constraint,
    sourceInputFingerprint: sourceVersionBinding.sourceInputFingerprint,
    boardDataSourceVersion: sourceVersionBinding.boardDataSourceVersion,
    sourceVersionBinding,
    writes: false,
  };
}

function cloneDbBackedSelectorState(value = {}) {
  const manualConstraints = value.manualConstraints && typeof value.manualConstraints === "object" && !Array.isArray(value.manualConstraints)
    ? Object.fromEntries(Object.entries(value.manualConstraints).map(([fieldKey, constraint]) => [fieldKey, cloneDbBackedConstraintRecord(constraint)]))
    : {};
  const acceptedDefaults = value.acceptedDefaults && typeof value.acceptedDefaults === "object" && !Array.isArray(value.acceptedDefaults)
    ? Object.fromEntries(Object.entries(value.acceptedDefaults).map(([fieldKey, defaultRecord]) => [fieldKey, cloneDbBackedConstraintRecord(defaultRecord)]))
    : {};
  const sourceVersionBinding = cloneSelectorSourceVersionBinding(value.sourceVersionBinding || value);
  return {
    source: "module-local safe DB/reference-backed selector constraints",
    readOnly: true,
    writes: false,
    manualConstraints,
    acceptedDefaults,
    sourceInputFingerprint: sourceVersionBinding.sourceInputFingerprint,
    boardDataSourceVersion: sourceVersionBinding.boardDataSourceVersion,
    sourceVersionBinding,
    lastAction: value.lastAction || "mounted",
  };
}

function cloneSelectorStateContract(contract = {}) {
  const sectionFieldContract = cloneSectionFieldContract(contract.sectionFieldContract);
  const manualConstraints = cloneObjectBucket(contract.manualConstraints);
  const manualConstraintScaffold = cloneManualConstraintScaffold(contract.manualConstraintScaffold, sectionFieldContract);
  return {
    ...contract,
    previewDefaults: clonePreviewDefaults(contract.previewDefaults),
    defaultPreviewSelections: cloneObjectBucket(contract.defaultPreviewSelections),
    sectionFieldContract,
    manualConstraints,
    manualConstraintScaffold: {
      ...manualConstraintScaffold,
      constraints: manualConstraints,
      activeManualConstraintCount: Object.keys(manualConstraints).length,
    },
    autoConsequences: cloneObjectBucket(contract.autoConsequences),
    effectiveSelection: cloneObjectBucket(contract.effectiveSelection),
    compatibilityDiagnostics: {
      warnings: Array.isArray(contract.compatibilityDiagnostics?.warnings) ? contract.compatibilityDiagnostics.warnings.map((warning) => ({ ...warning })) : [],
      blockedIncompatibleFields: Array.isArray(contract.compatibilityDiagnostics?.blockedIncompatibleFields) ? contract.compatibilityDiagnostics.blockedIncompatibleFields.map((field) => ({ ...field })) : [],
    },
    committedSpec: contract.committedSpec ? { ...contract.committedSpec } : null,
    provenanceMap: cloneObjectBucket(contract.provenanceMap),
    behaviourFlags: cloneObjectBucket(contract.behaviourFlags),
    sideEffectGuards: cloneObjectBucket(contract.sideEffectGuards),
  };
}

export function createSelectorState() {
  const state = {
    selectedCategory: "overview",
    expanderSections: { ...DEFAULT_EXPANDER_SECTIONS },
    localDirty: false,
    lastAction: "mounted",
    selectorStateContract: createInitialSelectorStateContract(),
    dbBackedSelector: cloneDbBackedSelectorState(),
    timelineStatusTest: createInitialTimelineStatusTestState(),
    specialPartsUserTest: createInitialSpecialPartsUserTestState(),
    selectorTestCase: createSelectorTestCaseState(),
    runIntake: createInitialSelectorRunIntakeState(),
    runAccessoryPlacement: createInitialSelectorRunAccessoryPlacementState(),
  };

  function snapshot() {
    return {
      ...state,
      expanderSections: { ...state.expanderSections },
      selectorStateContract: cloneSelectorStateContract(state.selectorStateContract),
      dbBackedSelector: cloneDbBackedSelectorState(state.dbBackedSelector),
      timelineStatusTest: cloneTimelineStatusTestState(state.timelineStatusTest),
      specialPartsUserTest: cloneSpecialPartsUserTestState(state.specialPartsUserTest),
      selectorTestCase: cloneSelectorTestCaseState(state.selectorTestCase),
      runIntake: cloneSelectorRunIntakeState(state.runIntake),
      runAccessoryPlacement: cloneSelectorRunAccessoryPlacementState(state.runAccessoryPlacement),
    };
  }

  return {
    getSnapshot() {
      return snapshot();
    },

    setCategory(category) {
      state.selectedCategory = category;
      state.lastAction = `category:${category}`;
      return this.getSnapshot();
    },

    setExpanderSectionOpen(sectionId, open) {
      if (!Object.prototype.hasOwnProperty.call(DEFAULT_EXPANDER_SECTIONS, sectionId)) {
        return this.getSnapshot();
      }
      state.expanderSections[sectionId] = open === true;
      state.lastAction = `expander:${sectionId}:${open === true ? "open" : "closed"}`;
      return this.getSnapshot();
    },

    setSelectorFieldValue(fieldKey, value) {
      const normalisedValue = normaliseManualValue(value);
      if (!normalisedValue) return this.clearSelectorFieldValue(fieldKey);

      const currentContract = state.selectorStateContract;
      const field = findFieldContract(currentContract.sectionFieldContract, fieldKey);
      if (!field || !optionExists(field, normalisedValue)) {
        state.lastAction = `manual-constraint-rejected:${fieldKey}`;
        return this.getSnapshot();
      }

      const previousSelection = currentContract.effectiveSelection?.[fieldKey] || null;
      const cascadeClear = clearDbBackedSelectorCascadeChildren(currentContract.manualConstraints, fieldKey);
      const nextManualConstraints = cascadeClear.nextManualConstraints;
      nextManualConstraints[fieldKey] = {
        ...createSelectionRecord(
          field,
          normalisedValue,
          "manual-constraint",
          "user-selected local UI constraint",
          previousSelection?.kind === "auto-consequence"
            ? "user changed an auto-derived consequence; promoted to manual constraint"
            : previousSelection?.kind === "default-preview"
              ? "user changed a default-preview selection; promoted to manual constraint"
              : "user-selected durable manual constraint"
        ),
        promotedFrom: previousSelection?.kind || "none",
      };

      state.selectorStateContract = recomputeSelectorStateContract({
        ...currentContract,
        manualConstraints: nextManualConstraints,
      });
      state.localDirty = true;
      state.lastAction = `manual-constraint:${fieldKey}`;
      return this.getSnapshot();
    },

    clearSelectorFieldValue(fieldKey) {
      const currentContract = state.selectorStateContract;
      const nextManualConstraints = cloneObjectBucket(currentContract.manualConstraints);
      if (Object.prototype.hasOwnProperty.call(nextManualConstraints, fieldKey)) {
        delete nextManualConstraints[fieldKey];
        state.selectorStateContract = recomputeSelectorStateContract({
          ...currentContract,
          manualConstraints: nextManualConstraints,
        });
        state.localDirty = true;
        state.lastAction = `manual-constraint-cleared:${fieldKey}`;
      }
      return this.getSnapshot();
    },

    setDbBackedSelectorFieldValue(fieldKey, value, label = "", sourceVersionBindingInput = {}) {
      const normalisedValue = normaliseManualValue(value);
      if (!normalisedValue) return this.clearDbBackedSelectorFieldValue(fieldKey);
      const next = cloneDbBackedSelectorState(state.dbBackedSelector);
      const sourceVersionBinding = cloneSelectorSourceVersionBinding(sourceVersionBindingInput);
      if (sourceVersionBinding.sourceInputFingerprint || sourceVersionBinding.boardDataSourceVersion) {
        next.sourceInputFingerprint = sourceVersionBinding.sourceInputFingerprint;
        next.boardDataSourceVersion = sourceVersionBinding.boardDataSourceVersion;
        next.sourceVersionBinding = sourceVersionBinding;
      }
      const cascadeClear = clearDbBackedSelectorCascadeChildren(next.manualConstraints, fieldKey);
      const acceptedCascadeClear = clearDbBackedSelectorCascadeChildren(next.acceptedDefaults, fieldKey);
      next.manualConstraints = cascadeClear.nextManualConstraints;
      next.acceptedDefaults = acceptedCascadeClear.nextManualConstraints;
      delete next.acceptedDefaults[fieldKey];
      next.manualConstraints[fieldKey] = {
        fieldKey,
        value: normalisedValue,
        valueLabel: normaliseManualValue(label) || normalisedValue,
        kind: "manual-constraint",
        source: "module-local UI constraint over safe DB/reference options",
        sourceInputFingerprint: sourceVersionBinding.sourceInputFingerprint,
        boardDataSourceVersion: sourceVersionBinding.boardDataSourceVersion,
        sourceVersionBinding,
        mutable: true,
        writes: false,
      };
      const clearedFields = [...new Set([...cascadeClear.clearedFields, ...acceptedCascadeClear.clearedFields])];
      next.lastAction = clearedFields.length
        ? "db-backed-manual-constraint:" + fieldKey + ":cascade-cleared:" + clearedFields.join("|")
        : "db-backed-manual-constraint:" + fieldKey;
      state.dbBackedSelector = next;
      state.localDirty = true;
      state.lastAction = next.lastAction;
      return this.getSnapshot();
    },

    clearDbBackedSelectorFieldValue(fieldKey) {
      const next = cloneDbBackedSelectorState(state.dbBackedSelector);
      const hadManual = Object.prototype.hasOwnProperty.call(next.manualConstraints, fieldKey);
      const hadAcceptedDefault = Object.prototype.hasOwnProperty.call(next.acceptedDefaults, fieldKey);
      if (hadManual || hadAcceptedDefault) {
        delete next.manualConstraints[fieldKey];
        delete next.acceptedDefaults[fieldKey];
        next.lastAction = hadManual
          ? `db-backed-manual-constraint-cleared:${fieldKey}`
          : `db-backed-accepted-default-cleared:${fieldKey}`;
        state.dbBackedSelector = next;
        state.localDirty = true;
        state.lastAction = next.lastAction;
      }
      return this.getSnapshot();
    },

    acceptDbBackedSelectorDefaults(defaults = []) {
      const next = cloneDbBackedSelectorState(state.dbBackedSelector);
      const accepted = Array.isArray(defaults) ? defaults : [];
      let acceptedCount = 0;
      for (const defaultRecord of accepted) {
        const fieldKey = normaliseManualValue(defaultRecord?.fieldKey);
        const value = normaliseManualValue(defaultRecord?.value);
        if (!fieldKey || !value || Object.prototype.hasOwnProperty.call(next.manualConstraints, fieldKey)) continue;
        const sourceVersionBinding = cloneSelectorSourceVersionBinding(defaultRecord?.sourceVersionBinding || defaultRecord);
        next.acceptedDefaults[fieldKey] = {
          fieldKey,
          label: normaliseManualValue(defaultRecord?.label) || fieldKey,
          value,
          valueLabel: normaliseManualValue(defaultRecord?.valueLabel) || value,
          kind: "accepted-default",
          source: "user-accepted current DB/reference auto-default",
          sourceInputFingerprint: sourceVersionBinding.sourceInputFingerprint,
          boardDataSourceVersion: sourceVersionBinding.boardDataSourceVersion,
          sourceVersionBinding,
          mutable: true,
          writes: false,
        };
        acceptedCount += 1;
      }
      next.lastAction = acceptedCount
        ? `db-backed-accepted-defaults:${acceptedCount}`
        : "db-backed-accepted-defaults:none";
      state.dbBackedSelector = next;
      state.localDirty = acceptedCount > 0 ? true : state.localDirty;
      state.lastAction = next.lastAction;
      return this.getSnapshot();
    },

    setSelectorTimelineTestMode(modeOrEnabled) {
      const mode = modeOrEnabled === true || modeOrEnabled === SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST
        ? SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST
        : SELECTOR_TIMELINE_VISIBILITY_MODES.EXTERNAL_DEFAULT;
      state.timelineStatusTest = cloneTimelineStatusTestState({
        ...state.timelineStatusTest,
        timelineVisibilityMode: mode,
      });
      state.localDirty = true;
      state.lastAction = `timeline-status-test-mode:${mode}`;
      return this.getSnapshot();
    },

    setSelectorTimelineAsOfDate(value) {
      state.timelineStatusTest = cloneTimelineStatusTestState({
        ...state.timelineStatusTest,
        timelineAsOfDate: String(value || "").trim() || isoTodayDate(),
      });
      state.localDirty = true;
      state.lastAction = "timeline-status-test-as-of-date";
      return this.getSnapshot();
    },

    setSelectorTimelineVisibleStatus(status, visible) {
      const canonical = normaliseTimelineStatus(status);
      const current = new Set(normaliseTimelineStatuses(state.timelineStatusTest.timelineVisibleStatuses));
      if (visible === false) current.delete(canonical);
      else current.add(canonical);
      state.timelineStatusTest = cloneTimelineStatusTestState({
        ...state.timelineStatusTest,
        timelineVisibilityMode: SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST,
        timelineVisibleStatuses: Array.from(current),
      });
      state.localDirty = true;
      state.lastAction = `timeline-status-test-visible-status:${canonical}:${visible === false ? "off" : "on"}`;
      return this.getSnapshot();
    },

    setSelectorTimelineVisibleStatuses(statuses = []) {
      state.timelineStatusTest = cloneTimelineStatusTestState({
        ...state.timelineStatusTest,
        timelineVisibilityMode: SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST,
        timelineVisibleStatuses: statuses,
      });
      state.localDirty = true;
      state.lastAction = "timeline-status-test-visible-statuses";
      return this.getSnapshot();
    },

    setSpecialPartsTestPrincipal(value) {
      state.specialPartsUserTest = cloneSpecialPartsUserTestState({
        ...state.specialPartsUserTest,
        testPrincipal: value,
      });
      state.localDirty = true;
      state.lastAction = `special-parts-user-test-principal:${state.specialPartsUserTest.testPrincipal || "external-default"}`;
      return this.getSnapshot();
    },

    setShowEntitlementBackedSpecialParts(enabled) {
      state.specialPartsUserTest = cloneSpecialPartsUserTestState({
        ...state.specialPartsUserTest,
        showEntitlementBackedSpecialParts: enabled === true,
      });
      state.localDirty = true;
      state.lastAction = `special-parts-user-test-show:${enabled === true ? "on" : "off"}`;
      return this.getSnapshot();
    },

    setSpecialPartsUserTestState(value = {}) {
      state.specialPartsUserTest = cloneSpecialPartsUserTestState(value);
      state.localDirty = true;
      state.lastAction = "special-parts-user-test-state";
      return this.getSnapshot();
    },

    captureSelectorTestCase() {
      return buildSelectorTestCaseFromSnapshot(this.getSnapshot());
    },

    setSavedSelectorTestCaseSummary(value = null, status = "") {
      const savedTestCase = value ? sanitiseSelectorTestCase(value) : null;
      state.selectorTestCase = createSelectorTestCaseState({
        savedTestCase,
        status: status || (savedTestCase ? "saved-test-case-available" : "no-saved-test-case"),
      });
      state.lastAction = savedTestCase ? "selector-test-case-summary-loaded" : "selector-test-case-summary-cleared";
      return this.getSnapshot();
    },

    recordSelectorTestCaseSave(value = null) {
      const savedTestCase = sanitiseSelectorTestCase(value || buildSelectorTestCaseFromSnapshot(this.getSnapshot()));
      state.selectorTestCase = createSelectorTestCaseState({
        savedTestCase,
        status: "saved-current-selector-test-case",
      });
      state.lastAction = "selector-test-case-saved";
      return this.getSnapshot();
    },

    recallSelectorTestCase(value = {}) {
      const savedTestCase = sanitiseSelectorTestCase(value);
      state.dbBackedSelector = cloneDbBackedSelectorState({
        manualConstraints: savedTestCase.manualConstraints,
        lastAction: "db-backed-selector-test-case-recalled",
      });
      state.timelineStatusTest = cloneTimelineStatusTestState(savedTestCase.timelineStatusTest);
      state.specialPartsUserTest = cloneSpecialPartsUserTestState(savedTestCase.specialPartsUserTest);
      state.selectorTestCase = createSelectorTestCaseState({
        savedTestCase,
        status: "recalled-selector-test-case",
      });
      state.localDirty = true;
      state.lastAction = "selector-test-case-recalled";
      return this.getSnapshot();
    },

    hydrateSelectorProjectEnvelopeState(value = {}) {
      const validation = validateSelectorProjectEnvelopeState(value);
      if (!validation.valid) {
        state.lastAction = "selector-project-envelope-hydrate-rejected";
        return {
          accepted: false,
          status: "invalid-selector-project-envelope-state",
          reason: validation.reason,
          snapshot: this.getSnapshot(),
        };
      }
      const restoredState = validation.state;
      state.selectedCategory = restoredState.selectedCategory;
      state.expanderSections = { ...restoredState.expanderSections };
      state.dbBackedSelector = cloneDbBackedSelectorState({
        manualConstraints: restoredState.manualConstraints,
        lastAction: "db-backed-selector-project-envelope-restored",
      });
      state.timelineStatusTest = cloneTimelineStatusTestState(restoredState.timelineStatusTest);
      state.specialPartsUserTest = cloneSpecialPartsUserTestState(restoredState.specialPartsUserTest);
      state.localDirty = false;
      state.lastAction = "selector-project-envelope-state-applied";
      return {
        accepted: true,
        status: "selector-project-envelope-state-applied",
        restoredConstraintCount: Object.keys(restoredState.manualConstraints).length,
        snapshot: this.getSnapshot(),
      };
    },

    clearSavedSelectorTestCaseSummary(status = "saved-test-case-cleared") {
      state.selectorTestCase = createSelectorTestCaseState({ status });
      state.lastAction = "selector-test-case-cleared";
      return this.getSnapshot();
    },

    setRunIntakeRows(runs = []) {
      state.runIntake = cloneSelectorRunIntakeState({ runs });
      state.localDirty = true;
      state.lastAction = "run-intake-preview:set-rows";
      return this.getSnapshot();
    },

    updateRunIntakeRun(runId, patch = {}) {
      const current = cloneSelectorRunIntakeState(state.runIntake);
      const wanted = normaliseManualValue(runId);
      const index = current.runs.findIndex((run) => run.id === wanted || String(run.runNumber) === wanted);
      if (index < 0) {
        const runNumber = current.runs.length + 1;
        current.runs.push({ id: wanted || `run-${runNumber}`, runNumber, ...patch });
      } else {
        current.runs[index] = { ...current.runs[index], ...patch };
      }
      state.runIntake = cloneSelectorRunIntakeState(current);
      state.localDirty = true;
      state.lastAction = `run-intake-preview:update:${wanted || "new"}`;
      return this.getSnapshot();
    },

    clearRunIntakeRows() {
      state.runIntake = createInitialSelectorRunIntakeState();
      state.localDirty = true;
      state.lastAction = "run-intake-preview:clear";
      return this.getSnapshot();
    },

    setRunAccessoryPlacementIntents(intents = []) {
      state.runAccessoryPlacement = cloneSelectorRunAccessoryPlacementState({ intents });
      state.localDirty = true;
      state.lastAction = "run-accessory-placement-preview:set-intents";
      return this.getSnapshot();
    },

    updateRunAccessoryPlacementIntent(intentId, patch = {}) {
      const current = cloneSelectorRunAccessoryPlacementState(state.runAccessoryPlacement);
      const wanted = normaliseManualValue(intentId);
      const index = current.intents.findIndex((intent) => intent.intentId === wanted);
      if (index < 0) {
        current.intents.push({ intentId: wanted || `accessory-intent-${current.intents.length + 1}`, ...patch });
      } else {
        current.intents[index] = { ...current.intents[index], ...patch };
      }
      state.runAccessoryPlacement = cloneSelectorRunAccessoryPlacementState(current);
      state.localDirty = true;
      state.lastAction = `run-accessory-placement-preview:update:${wanted || "new"}`;
      return this.getSnapshot();
    },

    clearRunAccessoryPlacementIntents() {
      state.runAccessoryPlacement = createInitialSelectorRunAccessoryPlacementState();
      state.localDirty = true;
      state.lastAction = "run-accessory-placement-preview:clear";
      return this.getSnapshot();
    },

    markLocalDirty(reason = "local-ui-change") {
      state.localDirty = true;
      state.lastAction = reason;
      return this.getSnapshot();
    },

    clearLocalDirty(reason = "local-ui-reset") {
      state.localDirty = false;
      state.lastAction = reason;
      return this.getSnapshot();
    },
  };
}
