import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTOR_LM_TEMPERATURE_READINESS_PREVIEW_SCHEMA_ID =
  "controlstack.runtime.selector.lm-temperature-readiness-preview.v1";
export const SELECTOR_LM_TEMPERATURE_READINESS_PREVIEW_SCHEMA_VERSION = 1;
export const SELECTOR_LM_TEMPERATURE_READINESS_VISIBLE_COPY =
  "Light output is captured as target intent only. Temperature-adjusted output requires future Engine verification.";

const FIELD_KEYS = Object.freeze({
  directLm: "targetLmPerM",
  indirectLm: "targetLmPerMIndirect",
  directCctCri: "cctCri",
  indirectCctCri: "cctCriIndirect",
  directControl: "controlType",
  indirectControl: "controlTypeIndirect",
  ambient: "ambient",
  indirectMatchDirect: "indirectMatchDirect",
});

const SAFE_FLAGS = Object.freeze({
  readOnly: true,
  previewOnly: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  targetIntentOnly: true,
  verifiedOutput: false,
  deliveredLmPerMVerified: false,
  temperatureAdjustedOutputCalculated: false,
  lmPerMAtTempBridgeCalled: false,
  donorLmPerMAtTempCalled: false,
  donorEngineInvoked: false,
  donorPhotometryInvoked: false,
  verifyOpened: false,
  verifyEnabled: false,
  runtimeDataMutated: false,
  donorMutated: false,
  rawRowsReturned: false,
  rawSelectorPayloadReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  selectedBoardReferenceReturned: false,
  unsafeBoardReferenceExposed: false,
  exactElectricalValuesReturned: false,
  driveCurrentReturned: false,
  voltageReturned: false,
  wattageReturned: false,
  runTableGenerated: false,
  iesGenerated: false,
  selectedResultPersisted: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeString(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cloneSafeFlags(extra = {}) {
  return { ...SAFE_FLAGS, ...extra };
}

function collectFields(fields = [], workflowSections = []) {
  const lookup = new Map();
  for (const field of Array.isArray(fields) ? fields : []) {
    if (field?.fieldKey && !lookup.has(field.fieldKey)) lookup.set(field.fieldKey, field);
  }
  for (const section of Array.isArray(workflowSections) ? workflowSections : []) {
    for (const field of Array.isArray(section?.fields) ? section.fields : []) {
      if (field?.fieldKey) lookup.set(field.fieldKey, field);
    }
  }
  return lookup;
}

function sourceTablesFrom(value = {}) {
  const tables = [];
  const add = (entry) => {
    if (!entry) return;
    if (Array.isArray(entry)) {
      for (const item of entry) add(item);
      return;
    }
    const text = safeString(entry).toUpperCase();
    if (text) tables.push(text);
  };
  add(value.sourceTables);
  add(value.sourceTable);
  add(value.table);
  add(value.source);
  return tables;
}

function fieldBackedBy(field = {}, tableName = "BOARDS") {
  const expected = safeString(tableName).toUpperCase();
  if (!field || !expected) return false;
  if (sourceTablesFrom(field).includes(expected)) return true;
  for (const option of Array.isArray(field.options) ? field.options : []) {
    if (sourceTablesFrom(option).includes(expected)) return true;
  }
  return false;
}

function selectedOption(field = {}) {
  return (Array.isArray(field.options) ? field.options : []).find((option) => option?.selected === true) || null;
}

function fieldRejectsIntent(field = {}) {
  return !field
    || field.selectedOptionBlocked === true
    || field.futureMapped === true
    || field.disabled === true
    || ["blocked", "disabled", "future-mapped"].includes(safeString(field.status).toLowerCase())
    || ["hidden-diagnostic", "warning-chip", "disabled-handoff", "metadata-chip"].includes(safeString(field.displayMode).toLowerCase())
    || ["diagnostic", "disabled", "metadata"].includes(safeString(field.provenance).toLowerCase());
}

function optionCarriesSelectedIntent(option = null) {
  return Boolean(option)
    && option.blocked !== true
    && !["blocked", "disabled"].includes(safeString(option.status).toLowerCase());
}

function fieldDisplayValue(field = {}) {
  if (fieldRejectsIntent(field)) return "";

  const option = selectedOption(field);
  if (optionCarriesSelectedIntent(option)) {
    return safeString(field.selectedLabel || option.label || field.selectedValue || option.value);
  }

  const selectedValue = safeString(field.selectedValue);
  const explicitManualValue = selectedValue
    && field.selectedValueStatus !== "diagnostic_unmapped"
    && (field.manualInput === true
      || field.selectedByManualConstraint === true
      || field.provenance === "manual"
      || field.provenance === "accepted-default");
  if (explicitManualValue) return safeString(field.selectedLabel || selectedValue);

  const inheritedValue = safeString(field.inheritedValue || field.effectiveValue);
  const validInheritedValue = inheritedValue
    && field.provenance === "inherited"
    && ["choice", "inherited-chip"].includes(safeString(field.displayMode).toLowerCase());
  if (validInheritedValue) return safeString(field.inheritedLabel || field.effectiveLabel || inheritedValue);

  return "";
}

function optionCount(field = {}) {
  return Array.isArray(field.options) ? field.options.length : 0;
}

function intentFieldSummary(fieldKey, label, field = null, { boardRequired = false, matchDirectAllowed = false } = {}) {
  const valueLabel = fieldDisplayValue(field || {});
  const boardBacked = fieldBackedBy(field || {}, "BOARDS");
  const captured = Boolean(field && valueLabel);
  const missingBlocker = !field
    ? `${fieldKey}-field-missing`
    : !captured
      ? `${fieldKey}-intent-not-selected`
      : boardRequired && !boardBacked
        ? `${fieldKey}-not-board-backed`
        : null;
  return {
    fieldKey,
    label,
    status: missingBlocker ? "blocked" : "intent-captured",
    ready: !missingBlocker,
    blocker: missingBlocker,
    valueLabel: valueLabel || "not selected",
    intentOnly: true,
    verifiedOutput: false,
    deliveredOutputVerified: false,
    temperatureAdjustedOutputCalculated: false,
    boardBacked,
    boardRequired,
    sourceBacked: fieldBackedBy(field || {}, "BOARDS")
      || fieldBackedBy(field || {}, "DRIVERS")
      || fieldBackedBy(field || {}, "SYSTEM_POLICY")
      || fieldBackedBy(field || {}, "OPTICS"),
    optionCount: optionCount(field || {}),
    matchDirectAllowed,
    rawRowsReturned: false,
    exactElectricalValuesReturned: false,
  };
}

function inheritedToggleActive(field = {}) {
  const value = `${fieldDisplayValue(field)} ${field?.selectedValue || ""} ${field?.effectiveValue || ""}`.toLowerCase();
  return /^(?:true|yes|match|matched|direct|inherit|same)|\b(?:match|matched|inherit|same as direct)\b/.test(value);
}

function unique(values = []) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const text = safeString(value);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
}

function buildBlockers(summaries = [], extra = []) {
  return unique([
    ...summaries.map((summary) => summary.blocker).filter(Boolean),
    ...extra,
    "temperature-adjusted-output-requires-future-engine-verification",
  ]);
}

function safeRowsFromPreview(preview = {}) {
  return [
    ["visible copy", preview.visibleCopy],
    ["direct lm/m", preview.targetIntent?.direct?.valueLabel || "not selected"],
    ["indirect lm/m", preview.targetIntent?.indirect?.valueLabel || "not selected"],
    ["direct CCT/CRI", preview.cctCriPairing?.direct?.valueLabel || "not selected"],
    ["indirect CCT/CRI", preview.cctCriPairing?.indirect?.valueLabel || "not selected"],
    ["control intent", preview.controlIntent?.direct?.valueLabel || "not selected"],
    ["ambient intent", preview.ambientIntent?.valueLabel || "not selected"],
    ["verified delivered lm/m", "false"],
    ["temperature-adjusted output calculated", "false"],
    ["Verify enabled", "false"],
  ];
}

export function buildSelectorLmTemperatureReadinessPreview({
  fields = [],
  workflowSections = [],
  selectionTruthSummary = {},
  sourceReady = false,
} = {}) {
  const lookup = collectFields(fields, workflowSections);
  const directLm = intentFieldSummary(FIELD_KEYS.directLm, "Direct target lm/m", lookup.get(FIELD_KEYS.directLm), { boardRequired: true });
  const indirectLm = intentFieldSummary(FIELD_KEYS.indirectLm, "Indirect target lm/m", lookup.get(FIELD_KEYS.indirectLm), { boardRequired: true, matchDirectAllowed: false });
  const directCctCri = intentFieldSummary(FIELD_KEYS.directCctCri, "Direct paired CCT/CRI", lookup.get(FIELD_KEYS.directCctCri), { boardRequired: true, matchDirectAllowed: true });
  const indirectCctCri = intentFieldSummary(FIELD_KEYS.indirectCctCri, "Indirect paired CCT/CRI", lookup.get(FIELD_KEYS.indirectCctCri), { boardRequired: true, matchDirectAllowed: true });
  const directControl = intentFieldSummary(FIELD_KEYS.directControl, "Direct control intent", lookup.get(FIELD_KEYS.directControl), { matchDirectAllowed: true });
  const indirectControl = intentFieldSummary(FIELD_KEYS.indirectControl, "Indirect control intent", lookup.get(FIELD_KEYS.indirectControl), { matchDirectAllowed: true });
  const ambientIntent = intentFieldSummary(FIELD_KEYS.ambient, "Ambient intent", lookup.get(FIELD_KEYS.ambient));
  const matchDirectField = lookup.get(FIELD_KEYS.indirectMatchDirect) || null;
  const indirectMatchDirectActive = inheritedToggleActive(matchDirectField || {});

  const cctControlSummaries = [directCctCri, indirectCctCri, directControl, indirectControl];
  const intentSummaries = [directLm, indirectLm, ...cctControlSummaries, ambientIntent];
  const blockers = buildBlockers(intentSummaries);
  const cctCriBoardBacked = directCctCri.boardBacked && indirectCctCri.boardBacked;
  const cctCriPaired = Boolean(lookup.get(FIELD_KEYS.directCctCri)) && Boolean(lookup.get(FIELD_KEYS.indirectCctCri));
  const fingerprintInput = {
    sourceReady: sourceReady === true,
    selectedValueCount: selectionTruthSummary?.selectedValueCount || 0,
    directLm: directLm.valueLabel,
    indirectLm: indirectLm.valueLabel,
    directCctCri: directCctCri.valueLabel,
    indirectCctCri: indirectCctCri.valueLabel,
    directControl: directControl.valueLabel,
    indirectControl: indirectControl.valueLabel,
    ambient: ambientIntent.valueLabel,
    blockers,
  };

  const preview = {
    schemaId: SELECTOR_LM_TEMPERATURE_READINESS_PREVIEW_SCHEMA_ID,
    schemaVersion: SELECTOR_LM_TEMPERATURE_READINESS_PREVIEW_SCHEMA_VERSION,
    title: "Lm/m temperature-output readiness — preview only",
    status: "blocked",
    ready: false,
    lmTemperatureReadinessPreviewReady: false,
    previewOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    targetIntentOnly: true,
    visibleCopy: SELECTOR_LM_TEMPERATURE_READINESS_VISIBLE_COPY,
    mainUiCopy: SELECTOR_LM_TEMPERATURE_READINESS_VISIBLE_COPY,
    proofCopy: "Target lm/m is selector intent only, not verified delivered output.",
    blocker: "temperature-adjusted-output-requires-future-engine-verification",
    blockers,
    targetIntent: {
      direct: directLm,
      indirect: {
        ...indirectLm,
        inheritedFromDirect: false,
        matchDirectIgnoredForLmPerM: true,
      },
      verifiedDeliveredLmPerM: false,
      deliveredLmPerMVerified: false,
      temperatureAdjustedOutputCalculated: false,
    },
    cctCriPairing: {
      direct: { ...directCctCri, paired: true },
      indirect: { ...indirectCctCri, paired: true, inheritedFromDirect: indirectMatchDirectActive },
      paired: cctCriPaired,
      boardBacked: cctCriBoardBacked,
      remainsPairedAndBoardBacked: cctCriPaired && cctCriBoardBacked,
    },
    controlIntent: {
      direct: directControl,
      indirect: { ...indirectControl, inheritedFromDirect: indirectMatchDirectActive },
      matchDirectAllowed: true,
    },
    ambientIntent,
    indirectMatchDirectScope: {
      active: indirectMatchDirectActive,
      appliesTo: ["cctCriIndirect", "controlTypeIndirect"],
      excludedFrom: ["targetLmPerMIndirect"],
      lmPerMInherited: false,
      indirectLmPerMIndependent: true,
    },
    engineVerification: {
      required: true,
      available: false,
      verifyEnabled: false,
      verifyOpened: false,
      donorEngineInvoked: false,
      donorPhotometryInvoked: false,
      bridgeCalled: false,
    },
    unsafeOutputsBlocked: cloneSafeFlags(),
    safetyFlags: cloneSafeFlags(),
    rawRowsReturned: false,
    exactElectricalValuesReturned: false,
    exactElectricalValuesExposed: false,
    driveCurrentReturned: false,
    selectedBoardReferenceReturned: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };

  return {
    ...preview,
    summaryRows: safeRowsFromPreview(preview),
    fingerprint: stableFingerprint("safe-selector-lm-temp-readiness-preview", fingerprintInput),
  };
}

export function selectorLmTemperatureReadinessPreviewRows(preview = {}) {
  if (!isPlainObject(preview)) return [];
  return safeRowsFromPreview(preview);
}
