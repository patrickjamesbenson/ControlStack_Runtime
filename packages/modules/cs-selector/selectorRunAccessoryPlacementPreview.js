import { evaluateSelectorRunIntakeRun } from "./selectorRunIntakePreview.js";

const SUPPORTED_SELECTOR_RUN_ACCESSORY_TYPES = Object.freeze([
  "sensor",
  "pir",
  "microwave",
  "daylight-sensor",
  "egress-light",
  "ewis-speaker",
  "speaker",
  "emergency",
  "driver",
  "power-feed",
  "blank-cover",
  "custom-review",
]);

const SUPPORTED_SELECTOR_RUN_ACCESSORY_PLACEMENT_PREFERENCES = Object.freeze([
  "start",
  "mid",
  "end",
  "specific-mm",
  "unresolved",
]);

const ACCESSORY_TYPE_ALIASES = Object.freeze({
  daylight: "daylight-sensor",
  "daylight sensor": "daylight-sensor",
  "daylight-sensor": "daylight-sensor",
  egress: "egress-light",
  "egress light": "egress-light",
  "egress-light": "egress-light",
  ewis: "ewis-speaker",
  "ewis speaker": "ewis-speaker",
  "ewis-speaker": "ewis-speaker",
  "power entry": "power-feed",
  "power-entry": "power-feed",
  "power feed": "power-feed",
  "power-feed": "power-feed",
  "blank cover": "blank-cover",
  "blank-cover": "blank-cover",
  custom: "custom-review",
  "custom review": "custom-review",
  "custom-review": "custom-review",
});

const PLACEMENT_PREFERENCE_ALIASES = Object.freeze({
  middle: "mid",
  centre: "mid",
  center: "mid",
  approximate: "specific-mm",
  approx: "specific-mm",
  "approx-mm": "specific-mm",
  approx_mm: "specific-mm",
  mm: "specific-mm",
  specific_mm: "specific-mm",
  specific: "specific-mm",
  engine: "unresolved",
  intent: "unresolved",
  engine_resolve: "unresolved",
  pending: "unresolved",
});

const STATUS_ALIASES = Object.freeze({
  pending: "draft",
  proposed: "draft",
  confirm: "confirmed",
  complete: "confirmed",
  incomplete: "unresolved",
  pending_resolution: "unresolved",
});

const DOWNSTREAM_BLOCKING_DIAGNOSTICS = Object.freeze([
  "accessory-reservation-not-approved",
  "engine-verify-not-approved",
  "runtable-generation-not-approved",
  "ies-generation-not-approved",
]);

function text(value) {
  return String(value ?? "").trim();
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function safeDisplayText(value, maxLength = 240) {
  return text(value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, maxLength)
    .trim();
}

function safeToken(value) {
  const raw = text(value).toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!raw) return "";
  const aliasKey = raw.replace(/-/g, " ");
  return ACCESSORY_TYPE_ALIASES[raw] || ACCESSORY_TYPE_ALIASES[aliasKey] || raw;
}

function parsePositiveInteger(value) {
  if (typeof value === "number") return Number.isInteger(value) && value > 0 ? value : null;
  const raw = text(value);
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePositiveMm(value) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  const raw = text(value).replace(/\s*mm$/i, "");
  if (!raw || !/^\d+(?:\.\d+)?$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalisePlacementPreference(value) {
  const raw = text(value).toLowerCase().replace(/\s+/g, "-");
  if (!raw) return "";
  return PLACEMENT_PREFERENCE_ALIASES[raw] || PLACEMENT_PREFERENCE_ALIASES[raw.replace(/-/g, "_")] || raw;
}

function normaliseStatus(value, confirmed, placementPreference) {
  const raw = text(value).toLowerCase().replace(/\s+/g, "_");
  if (!raw) {
    if (placementPreference === "unresolved") return "unresolved";
    return confirmed === true ? "confirmed" : "draft";
  }
  const status = STATUS_ALIASES[raw] || raw;
  return ["draft", "confirmed", "unresolved"].includes(status) ? status : "unresolved";
}

function runLookupKey(value) {
  return text(value).toLowerCase();
}

function buildRunLookup(runs = []) {
  const evaluatedRuns = Array.isArray(runs) ? runs.map(evaluateSelectorRunIntakeRun) : [];
  const lookup = new Map();
  for (const run of evaluatedRuns) {
    for (const key of [run.id, run.runNumber, run.label]) {
      const lookupKey = runLookupKey(key);
      if (lookupKey && !lookup.has(lookupKey)) lookup.set(lookupKey, run);
    }
  }
  return { evaluatedRuns, lookup };
}

function matchedRunFor(reference, lookup) {
  const lookupKey = runLookupKey(reference);
  return lookupKey ? lookup.get(lookupKey) || null : null;
}

export function normaliseSelectorRunAccessoryPlacementIntent(intent = {}, index = 0) {
  const source = intent && typeof intent === "object" && !Array.isArray(intent) ? intent : {};
  const runReference = safeDisplayText(firstDefined(
    source.runReference,
    source.runRef,
    source.runId,
    source.runLabel,
    source.runNumber,
  ), 120);
  const accessoryTypeToken = safeToken(firstDefined(
    source.accessoryTypeToken,
    source.accessoryType,
    source.type,
    source.accessoryId,
  ));
  const quantityReceivingAccessory = text(firstDefined(
    source.quantityReceivingAccessory,
    source.accessoryQuantity,
    source.quantity,
    source.qtyCount,
    source.qty,
  ));
  const placementPreference = normalisePlacementPreference(firstDefined(
    source.placementPreference,
    source.preference,
    source.placementKind,
    source.placement,
  ));
  const placementMm = text(firstDefined(source.placementMm, source.approxMm, source.posMm));
  const reservationWidthMm = text(firstDefined(
    source.reservationWidthMm,
    source.reservationIntentWidthMm,
    source.reservationBandWidthMm,
    source.widthMm,
  ));
  const reservationIntentBand = safeDisplayText(firstDefined(source.reservationIntentBand, source.intentBand, source.widthIntentBand), 120);
  const status = normaliseStatus(firstDefined(source.status, source.confirmationStatus), source.confirmed, placementPreference);

  return {
    intentId: safeDisplayText(firstDefined(source.intentId, source.id), 120) || `accessory-intent-${String(index + 1).padStart(3, "0")}`,
    runReference,
    accessoryTypeToken,
    quantityReceivingAccessory,
    placementPreference,
    placementMm,
    reservationWidthMm,
    reservationIntentBand,
    status,
    notes: safeDisplayText(firstDefined(source.notes, source.note), 240),
  };
}

export function createInitialSelectorRunAccessoryPlacementState() {
  return {
    source: "module-local Selector run accessory placement preview state",
    previewOnly: true,
    readOnlyDownstream: true,
    writes: false,
    intents: [],
  };
}

export function cloneSelectorRunAccessoryPlacementState(value = {}) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    source: source.source || "module-local Selector run accessory placement preview state",
    previewOnly: true,
    readOnlyDownstream: true,
    writes: false,
    intents: Array.isArray(source.intents) ? source.intents.map(normaliseSelectorRunAccessoryPlacementIntent) : [],
  };
}

function evaluateIntentWithLookup(intent, lookup, index = 0) {
  const normalised = normaliseSelectorRunAccessoryPlacementIntent(intent, index);
  const run = matchedRunFor(normalised.runReference, lookup);
  const quantity = parsePositiveInteger(normalised.quantityReceivingAccessory);
  const placementMm = parsePositiveMm(normalised.placementMm);
  const reservationWidthMm = normalised.reservationWidthMm ? parsePositiveMm(normalised.reservationWidthMm) : null;
  const diagnostics = [];

  if (!normalised.runReference) diagnostics.push("missing-run-reference");
  else if (!run) diagnostics.push("unknown-run-reference");

  if (!normalised.accessoryTypeToken) diagnostics.push("missing-accessory-type");
  else if (!SUPPORTED_SELECTOR_RUN_ACCESSORY_TYPES.includes(normalised.accessoryTypeToken)) diagnostics.push("unsupported-accessory-type");

  if (!text(normalised.quantityReceivingAccessory)) diagnostics.push("missing-accessory-quantity");
  else if (quantity === null) diagnostics.push("invalid-accessory-quantity");
  else if (run && quantity > (run.quantityValue || 0)) diagnostics.push("accessory-quantity-exceeds-run-quantity");

  if (!normalised.placementPreference) diagnostics.push("missing-placement-preference");
  else if (!SUPPORTED_SELECTOR_RUN_ACCESSORY_PLACEMENT_PREFERENCES.includes(normalised.placementPreference)) diagnostics.push("unsupported-placement-preference");
  else if (normalised.placementPreference === "specific-mm") {
    if (!text(normalised.placementMm)) diagnostics.push("missing-placement-mm");
    else if (placementMm === null) diagnostics.push("invalid-placement-mm");
  } else if (normalised.placementPreference === "unresolved") {
    diagnostics.push("placement-unresolved");
  }

  if (normalised.reservationWidthMm && reservationWidthMm === null) diagnostics.push("invalid-reservation-width-mm");
  if (normalised.status === "unresolved" && !diagnostics.includes("placement-unresolved")) diagnostics.push("placement-unresolved");

  const complete = diagnostics.length === 0;
  const runQuantity = run?.quantityValue || 0;
  const summary = {
    intentId: normalised.intentId,
    runReference: normalised.runReference,
    runId: run?.id || "",
    runNumber: run?.runNumber || 0,
    runLabel: run?.label || normalised.runReference || "unresolved run",
    runQuantity,
    accessoryTypeToken: normalised.accessoryTypeToken,
    quantityReceivingAccessory: quantity || 0,
    placementPreference: normalised.placementPreference,
    placementMm: normalised.placementPreference === "specific-mm" && placementMm !== null ? placementMm : null,
    reservationWidthMm: reservationWidthMm || null,
    reservationIntentBand: normalised.reservationIntentBand,
    status: normalised.status,
    notes: normalised.notes,
    sameLengthRunIntentOnly: run?.lengthMode === "same_length" && quantity !== null && quantity <= runQuantity,
    safePreviewOnly: true,
    accessoryReservationExecuted: false,
    accessoryReservationPayloadExposed: false,
    enginePayloadIncluded: false,
    rawEnginePayloadExposed: false,
    runTableIncluded: false,
    iesIncluded: false,
    writes: false,
    complete,
    diagnostics: [...diagnostics],
  };

  return {
    ...normalised,
    run,
    quantityValue: quantity,
    placementMmValue: placementMm,
    reservationWidthMmValue: reservationWidthMm,
    complete,
    unresolved: diagnostics.includes("placement-unresolved"),
    diagnostics,
    safeIntent: summary,
  };
}

function groupIntentSummaries(evaluatedIntents = []) {
  const groups = new Map();
  for (const item of evaluatedIntents) {
    const key = item.run?.id || item.runReference || "unresolved-run-reference";
    if (!groups.has(key)) {
      groups.set(key, {
        runReference: item.runReference || "",
        runId: item.run?.id || "",
        runNumber: item.run?.runNumber || 0,
        runLabel: item.run?.label || item.runReference || "unresolved run",
        runQuantity: item.run?.quantityValue || 0,
        intentCount: 0,
        unresolvedIntentCount: 0,
        diagnostics: [],
        intents: [],
      });
    }
    const group = groups.get(key);
    group.intentCount += 1;
    if (item.unresolved) group.unresolvedIntentCount += 1;
    group.diagnostics.push(...item.diagnostics.map((diagnostic) => `${item.intentId}:${diagnostic}`));
    group.intents.push({ ...item.safeIntent });
  }
  return Array.from(groups.values()).map((group) => ({
    ...group,
    diagnostics: [...group.diagnostics],
    intents: group.intents.map((intent) => ({ ...intent })),
  }));
}

export function buildSelectorRunAccessoryPlacementPreview(input = {}, maybeIntents = undefined) {
  const runs = Array.isArray(input) ? input : input.runs || [];
  const intents = Array.isArray(input) ? maybeIntents || [] : input.intents || input.accessoryIntents || [];
  const { lookup } = buildRunLookup(runs);
  const evaluatedIntents = Array.isArray(intents) ? intents.map((intent, index) => evaluateIntentWithLookup(intent, lookup, index)) : [];
  const accessoryIntentCount = evaluatedIntents.length;
  const unresolvedAccessoryIntentCount = evaluatedIntents.filter((intent) => intent.unresolved).length;
  const runsWithAccessoryIntentCount = new Set(evaluatedIntents.filter((intent) => intent.run).map((intent) => intent.run.id)).size;
  const intentDiagnostics = evaluatedIntents.flatMap((intent) => intent.diagnostics.map((diagnostic) => `${intent.intentId}:${diagnostic}`));
  const downstreamDiagnostics = [...DOWNSTREAM_BLOCKING_DIAGNOSTICS];
  const runAccessoryPlacementPreviewReady = accessoryIntentCount > 0 && intentDiagnostics.length === 0;
  const safeRunAccessoryIntentSummaries = groupIntentSummaries(evaluatedIntents);

  return {
    title: "Selector run accessory placement preview",
    source: "runtime Selector run accessory placement intent scaffold",
    readOnly: true,
    previewOnly: true,
    localStateOnly: true,
    runAccessoryPlacementPreviewReady,
    accessoryIntentCount,
    runsWithAccessoryIntentCount,
    unresolvedAccessoryIntentCount,
    safeRunAccessoryIntentSummaries,
    safeAccessoryIntentRows: evaluatedIntents.map((intent) => ({ ...intent.safeIntent })),
    diagnostics: [...intentDiagnostics, ...downstreamDiagnostics],
    missingOrInvalidDiagnostics: intentDiagnostics,
    failClosedDiagnostics: downstreamDiagnostics,
    supportedAccessoryTypeTokens: [...SUPPORTED_SELECTOR_RUN_ACCESSORY_TYPES],
    supportedPlacementPreferences: [...SUPPORTED_SELECTOR_RUN_ACCESSORY_PLACEMENT_PREFERENCES],
    accessoryReservationReady: false,
    accessoryReservationExecuted: false,
    accessoryReservationPayloadExposed: false,
    enginePayloadReady: false,
    engineVerifyReady: false,
    runTableReady: false,
    iesReady: false,
    rawAccessoryRowsExposed: false,
    rawEnginePayloadExposed: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    generation: false,
    proof: false,
    boundaryCopy: [
      "Run accessory placement is captured as safe local intent only: run reference, accessory type token, quantity, placement preference, optional specific millimetre intent, optional width/band intent, status, and display notes.",
      "Specific millimetre placement remains intent only; no physical coordinates, accessory covers, segment holes, zones, board reservations, Engine payload, RunTable, or IES are computed.",
      "Accessory reservation, Engine verify, RunTable generation, IES generation, selected-result persistence, routes, POST endpoints, raw accessory rows, raw Engine payload, and RuntimeData mutation remain disabled.",
    ],
    summaryRows: [
      ["runAccessoryPlacementPreviewReady", runAccessoryPlacementPreviewReady ? "true" : "false"],
      ["accessoryIntentCount", String(accessoryIntentCount)],
      ["runsWithAccessoryIntentCount", String(runsWithAccessoryIntentCount)],
      ["unresolvedAccessoryIntentCount", String(unresolvedAccessoryIntentCount)],
      ["accessoryReservationReady", "false"],
      ["enginePayloadReady", "false"],
      ["engineVerifyReady", "false"],
      ["runTableReady", "false"],
      ["iesReady", "false"],
    ],
    safetyRows: [
      ["rawAccessoryRowsExposed", "false"],
      ["rawEnginePayloadExposed", "false"],
      ["accessoryReservationExecuted", "false"],
      ["donorEngineInvoked", "false"],
      ["runtimeDataMutated", "false"],
      ["selectedResultPersisted", "false"],
      ["runTableGenerated", "false"],
      ["iesGenerated", "false"],
      ["routesAdded", "false"],
      ["postEndpointsAdded", "false"],
    ],
  };
}

export {
  SUPPORTED_SELECTOR_RUN_ACCESSORY_TYPES,
  SUPPORTED_SELECTOR_RUN_ACCESSORY_PLACEMENT_PREFERENCES,
};
