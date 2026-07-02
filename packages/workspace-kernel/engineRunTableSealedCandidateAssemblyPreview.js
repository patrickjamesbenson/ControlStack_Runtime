import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.sealed-candidate-assembly-preview-summary";
export const ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_STATE =
  "runtime_sealed_candidate_assembly_preview_diagnostic_only";

const SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  selectorSafeSummariesOnly: true,
  engineSealedSummariesOnly: true,
  donorEngineInvoked: false,
  donorEngineInvocationEnabled: false,
  donorEnginePayloadAssemblyEnabled: false,
  rawSelectorPayloadReturned: false,
  rawEnginePayloadReturned: false,
  rawProductRowsReturned: false,
  rawUsersReturned: false,
  rawCrmReturned: false,
  rawContactsReturned: false,
  privatePathsReturned: false,
  credentialsReturned: false,
  runtimeDataMutationEnabled: false,
  selectedResultPersistenceEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  hubSpotWriteEnabled: false,
  projectWriteEnabled: false,
  complianceApprovalEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,440}$/;

const SELECTOR_SELECTION_FIELD_KEYS = Object.freeze({
  system: ["system", "systemKey", "selectedSystem"],
  variant: ["variant", "variantKey", "selectedVariant", "profileVariant"],
  tier: ["tier", "selectedTier", "tierToken"],
  profile: ["profile", "profileToken", "profileKey"],
  optic: ["optic", "opticKey", "diffuserVar1", "directOpticVar1"],
  uplight: ["uplight", "uplightMode", "indirectOpticVar1", "emission"],
});

const ENGINE_REQUIRED_SUMMARIES = Object.freeze([
  {
    key: "accessoryReservationSummary",
    label: "accessory reservation summary",
    missing: "missing-accessory-reservation-summary",
    readyKey: "accessoryReservationReady",
    fingerprintKeys: ["accessoryReservationFingerprint", "reservationFingerprint", "summaryFingerprint"],
  },
  {
    key: "boardFillInputSummary",
    label: "board-fill input summary",
    missing: "missing-board-fill-input-summary",
    fingerprintKeys: ["boardFillInputFingerprint", "summaryFingerprint"],
  },
  {
    key: "boardFillSummary",
    label: "board-fill summary",
    missing: "missing-board-fill-summary",
    fingerprintKeys: ["boardFillFingerprint", "summaryFingerprint"],
  },
  {
    key: "boardElectricalSummary",
    label: "board electrical summary",
    missing: "missing-board-electrical-summary",
    readyKey: "electricalSummaryReady",
    fingerprintKeys: ["summaryFingerprint", "boardElectricalSummaryFingerprint", "boardElectricalFingerprint"],
  },
  {
    key: "driverSizerSummary",
    label: "driver sizer summary",
    missing: "missing-driver-sizer-summary",
    readyKey: "driverSizerReady",
    fingerprintKeys: ["driverSizerFingerprint", "summaryFingerprint"],
  },
  {
    key: "segmentZoneBridgeSummary",
    label: "sealed segment-zone bridge summary",
    missing: "missing-segment-zone-bridge-summary",
    readyKey: "segmentZoneBridgeReady",
    fingerprintKeys: ["segmentZoneBridgeFingerprint", "summaryFingerprint"],
  },
  {
    key: "zoneValidationFootholdSummary",
    label: "zone validation foothold summary",
    missing: "missing-zone-validation-foothold-summary",
    readyKey: "zoneValidationFootholdReady",
    fingerprintKeys: ["zoneValidationFootholdFingerprint", "summaryFingerprint"],
  },
  {
    key: "emergencyZonePickerFootholdSummary",
    label: "emergency zone picker foothold summary",
    missing: "missing-emergency-zone-picker-foothold-summary",
    readyKey: "emergencyZonePickerReady",
    fingerprintKeys: ["emergencyZonePickerFingerprint", "summaryFingerprint"],
  },
  {
    key: "gateDValidationScaffoldSummary",
    label: "Gate D validation scaffold summary",
    missing: "missing-gate-d-validation-scaffold-summary",
    readyKey: "gateDScaffoldReady",
    notReady: "gate-d-validation-scaffold-not-ready",
    fingerprintKeys: ["gateDValidationScaffoldFingerprint", "summaryFingerprint"],
  },
]);

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:rawSelectorPayloadReturned|rawSelectorPayloadExposed|selectorPayloadReturned|selectorPayloadExposed|payloadGenerationEnabled|downstreamPayloadActive)$/i, "raw-selector-payload-not-approved"],
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|enginePayloadIncluded|enginePayloadReady|rawEmergencyPayloadReturned|rawAccessoryPayloadReturned|roughElectricalPayloadAssemblyEnabled)$/i, "raw-engine-payload-not-approved"],
  [/^(?:rawRowsReturned|rawRowsExposed|rawProductRowsReturned|rawProductRowsExposed|rawBoardRowsReturned|rawDriverRowsReturned|rawAccessoryRowsReturned|rawReservationGridReturned|rawComponentRowsReturned|rawCurveRowsReturned|rawProductDataRowsExposed)$/i, "raw-product-rows-not-approved"],
  [/^(?:rawUsersReturned|rawUsersExposed|usersReturned)$/i, "raw-users-not-approved"],
  [/^(?:rawCrmReturned|rawCRMReturned|rawCrmExposed|rawCRMExposed)$/i, "raw-crm-not-approved"],
  [/^(?:rawContactsReturned|rawContactInputReturned|rawContactsExposed)$/i, "raw-contacts-not-approved"],
  [/^(?:privatePathsReturned|privatePathsExposed|privatePathReturned|privatePathExposed)$/i, "private-path-return-not-approved"],
  [/^(?:credentialsReturned|credentialsExposed|credentialReturned|secretReturned|tokenReturned|accessTokenReturned)$/i, "credential-return-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineCallsActive)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAuthority|boardDataMutationEnabled|authorityWritesActive|activeBuildMutationEnabled|buildMutationEnabled)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled|saveLoadActive|hiddenWriteBackEnabled)$/i, "selected-result-persistence-not-approved"],
  [/^(?:runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableMutationEnabled)$/i, "runtable-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled|photometryGenerationAllowed|photometryGenerationEnabled|iesCallsActive)$/i, "ies-generation-not-approved"],
  [/^(?:hubSpotWriteEnabled|hubspotWriteEnabled|hubSpotWriteLive|hubspotWriteLive|hubSpotPushEnabled|hubSpotCrmWriteBackEnabled)$/i, "hubspot-write-not-approved"],
  [/^(?:projectWriteEnabled|projectWritesEnabled|projectWriteLive|controlledRecordWriteEnabled|controlledRecordsWriteEnabled)$/i, "project-write-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded)$/i, "route-or-post-endpoint-not-approved"],
  [/^(?:postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "route-or-post-endpoint-not-approved"],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:selectorPayload|rawSelectorPayload|selectorEnginePayload|payloadDraft)$/i, "raw-selector-payload-not-approved"],
  [/^(?:enginePayload|rawEnginePayload|runEnginePayload|roughElectricalPayload|donorPayload|rawDonorPayload|emergencyPayload|rawEmergencyPayload)$/i, "raw-engine-payload-not-approved"],
  [/^(?:PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|SYSTEM_POLICY|SYSTEM_COMPONENTS|rawRows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|rawComponentRows|productRows|boardRows|driverRows|accessoryRows|componentRows|rawReservationGrid|reservationGrid|reservedGrid|rawCurveRows|curveRows)$/i, "raw-product-rows-not-approved"],
  [/^(?:USERS|rawUsers|userRows|usersRows)$/i, "raw-users-not-approved"],
  [/^(?:CRM|rawCrm|rawCRM|crmRows|hubSpotRows|hubspotRows|hubSpotPayload|hubspotPayload)$/i, "raw-crm-not-approved"],
  [/^(?:CONTACTS|rawContacts|contactRows|crmContacts|hubSpotContacts|hubspotContacts)$/i, "raw-contacts-not-approved"],
  [/^(?:credentials|credential|secret|token|accessToken|apiKey|apikey|password)$/i, "credential-return-not-approved"],
]);
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|filepath|sourcePath|donorPath|runtimeDataPath|privatePath|path)$/i;

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null
    || value === undefined
    || (typeof value === "number" && Number.isNaN(value))
    || (typeof value === "string" && value.trim() === "");
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function safeLabel(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 160) : fallback;
}

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
  return token || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 460);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function toPositiveInteger(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return rounded > 0 ? rounded : null;
  }
  const raw = String(value ?? "").trim().replace(/\s*mm$/i, "");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return rounded > 0 ? rounded : null;
}

function bool(value, defaultValue = false) {
  if (value === true || value === false) return value;
  if (isBlank(value)) return defaultValue;
  const token = safeToken(value, "");
  if (["true", "yes", "y", "1", "ready", "complete", "compatible", "allowed", "pass", "live"].includes(token)) return true;
  if (["false", "no", "n", "0", "blocked", "incompatible", "fail", "not-ready"].includes(token)) return false;
  return defaultValue;
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 9) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "private-path-return-not-approved" : null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const blocker = unsafeBlocker(item, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    for (const [pattern, blocker] of RAW_KEY_BLOCKERS) {
      if (pattern.test(key) && nested !== false && nested !== null && nested !== undefined) return blocker;
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "private-path-return-not-approved";
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function itemForField(summary, fieldKeys = []) {
  if (!isPlainObject(summary)) return null;
  const wanted = new Set(fieldKeys.map(safeToken).filter(Boolean));
  const groups = Array.isArray(summary.groups) ? summary.groups : [];
  for (const group of groups) {
    const items = Array.isArray(group?.items) ? group.items : [];
    for (const item of items) {
      const fieldKey = safeToken(item?.fieldKey, "");
      if (wanted.has(fieldKey)) return item;
    }
  }
  const fields = Array.isArray(summary.fields) ? summary.fields : [];
  for (const field of fields) {
    const fieldKey = safeToken(field?.fieldKey, "");
    if (wanted.has(fieldKey)) return field;
  }
  return null;
}

function selectedValue(summary, key) {
  const keys = SELECTOR_SELECTION_FIELD_KEYS[key] || [key];
  const direct = firstPresent(summary, keys)
    ?? firstPresent(summary?.selectedValues, keys)
    ?? firstPresent(summary?.selection, keys)
    ?? firstPresent(summary?.selected, keys)
    ?? firstPresent(summary?.effectiveSelection, keys);
  if (!isBlank(direct)) {
    if (isPlainObject(direct)) return firstPresent(direct, ["value", "token", "key", "system", "label", "valueLabel"]);
    return direct;
  }
  const item = itemForField(summary, keys);
  return firstPresent(item, ["value", "selectedValue", "effectiveValue", "token", "key", "valueLabel", "selectedLabel", "label"]);
}

function normaliseSelectorSelectionSummary(summary) {
  return {
    diagnosticOnly: true,
    readOnly: summary.readOnly !== false,
    status: safeLabel(firstPresent(summary, ["status", "state"]), "safe-selector-selection-summary"),
    selectedSystemToken: safeToken(selectedValue(summary, "system"), "unresolved"),
    selectedVariantToken: safeToken(selectedValue(summary, "variant"), "unresolved"),
    selectedTierToken: safeToken(selectedValue(summary, "tier"), "unresolved"),
    selectedProfileToken: safeToken(selectedValue(summary, "profile"), "unresolved"),
    selectedOpticToken: safeToken(selectedValue(summary, "optic"), "unresolved"),
    selectedUplightToken: safeToken(selectedValue(summary, "uplight"), "unresolved"),
    blockerCount: Array.isArray(summary.blockers) ? summary.blockers.length : 0,
    missingCount: Array.isArray(summary.missing) ? summary.missing.length : 0,
    rawSelectorPayloadReturned: false,
    rawProductRowsReturned: false,
  };
}

function normaliseFinishField(field) {
  if (!isPlainObject(field)) {
    return {
      value: "unresolved",
      label: "unresolved",
      provenance: "missing",
      resolved: false,
    };
  }
  const mode = safeToken(firstPresent(field, ["mode", "inheritanceStatus", "provenance"]), "manual");
  return {
    value: safeLabel(firstPresent(field, ["value", "selectedValue", "effectiveValue", "inheritedValue", "label"]), "unresolved"),
    label: safeLabel(firstPresent(field, ["label", "selectedLabel", "effectiveLabel", "inheritedLabel", "value"]), "unresolved"),
    provenance: mode === "manual-override" ? "manual" : mode === "inherited" ? "inherited" : safeLabel(mode, "manual"),
    resolved: mode !== "unresolved" && firstPresent(field, ["missing", "inheritedMissing"]) !== true,
  };
}

function normaliseFinishCascade(summary) {
  const fields = isPlainObject(summary.fields) ? summary.fields : {};
  const bodyValue = firstPresent(summary, ["bodyValue", "bodyFinish", "finishDefault"]);
  return {
    diagnosticOnly: true,
    finishCascadeReady: summary.finishCascadeReady !== false,
    body: {
      value: safeLabel(bodyValue, "unresolved"),
      label: safeLabel(firstPresent(summary, ["bodyLabel", "bodyFinishLabel", "finishDefaultLabel"]) ?? bodyValue, "unresolved"),
      provenance: safeLabel(firstPresent(summary, ["bodyProvenance", "source"]), "manual"),
      resolved: !isBlank(bodyValue),
    },
    cover: normaliseFinishField(fields.finishCover ?? summary.finishCover),
    end: normaliseFinishField(fields.finishEnd ?? summary.finishEnd),
    flex: normaliseFinishField(fields.finishFlex ?? summary.finishFlex),
    rawProductRowsReturned: false,
  };
}

function finishCascadeUnresolved(summary) {
  if (!isPlainObject(summary)) return true;
  if (summary.finishCascadeReady === false || summary.unresolved === true) return true;
  if (isPlainObject(summary.fields)) {
    return Object.values(summary.fields).some((field) => isPlainObject(field)
      && (field.mode === "unresolved" || field.missing === true || field.inheritedMissing === true));
  }
  return false;
}

function normaliseTimelineGate(summary) {
  return {
    diagnosticOnly: true,
    timelineGateReady: summary.timelineGateReady !== false && summary.blocked !== true && summary.gateBlocked !== true,
    status: safeLabel(firstPresent(summary, ["status", "timelineStatus", "selectedStatus"]), "unknown"),
    gate: safeLabel(firstPresent(summary, ["gate", "gateState", "state"]), "safe-timeline-gate"),
    reason: safeLabel(firstPresent(summary, ["reason", "blockedReason", "diagnostic"]), "safe-timeline-status-filter"),
    rawProductRowsReturned: false,
  };
}

function timelineBlocked(summary) {
  if (!isPlainObject(summary)) return true;
  if (summary.timelineGateReady === false || summary.ok === false || summary.blocked === true || summary.gateBlocked === true) return true;
  const status = safeToken(firstPresent(summary, ["status", "state", "timelineStatus", "gate"]), "");
  return ["blocked", "hidden", "filtered-out", "not-allowed", "unavailable"].includes(status);
}

function normaliseMountCompatibility(summary) {
  return {
    diagnosticOnly: true,
    mountCompatibilityReady: summary.mountCompatibilityReady !== false && summary.compatible !== false && summary.blocked !== true,
    mountStatus: safeLabel(firstPresent(summary, ["mountStatus", "status", "state"]), summary.compatible === false ? "blocked" : "compatible"),
    opticCompatibilityStatus: safeLabel(firstPresent(summary, ["opticCompatibilityStatus", "opticStatus"]), "compatible"),
    uplightCompatibilityStatus: safeLabel(firstPresent(summary, ["uplightCompatibilityStatus", "uplightStatus", "indirectCompatibilityStatus"]), "not-required"),
    blockedReason: safeLabel(firstPresent(summary, ["blockedReason", "reason"]), "none"),
    rawProductRowsReturned: false,
  };
}

function mountBlocked(summary) {
  if (!isPlainObject(summary)) return true;
  if (summary.mountCompatibilityReady === false || summary.compatible === false || summary.blocked === true || summary.ok === false) return true;
  const status = safeToken(firstPresent(summary, ["status", "state", "mountStatus"]), "compatible");
  return ["blocked", "incompatible", "not-compatible", "fail", "filtered-out"].includes(status);
}

function normaliseRun(summary) {
  return {
    id: safeLabel(firstPresent(summary, ["id", "runId"]), "run"),
    runNumber: toPositiveInteger(firstPresent(summary, ["runNumber", "number"])) ?? 1,
    label: safeLabel(firstPresent(summary, ["label", "runLabel"]), "Run"),
    quantity: toPositiveInteger(firstPresent(summary, ["quantity", "qty"])) ?? 0,
    runLengthMm: toPositiveInteger(firstPresent(summary, ["runLengthMm", "lengthMm"])) ?? 0,
    lengthMode: safeToken(firstPresent(summary, ["lengthMode", "mode"]), "unresolved"),
    safePreviewOnly: summary.safePreviewOnly !== false,
    enginePayloadIncluded: false,
    runTableIncluded: false,
    iesIncluded: false,
  };
}

function normaliseRunIntake(summary) {
  const runs = Array.isArray(summary.safeRunIntentSummaries)
    ? summary.safeRunIntentSummaries
    : Array.isArray(summary.runs) ? summary.runs : [];
  return {
    diagnosticOnly: true,
    runIntakePreviewReady: summary.runIntakePreviewReady === true,
    runCount: toPositiveInteger(summary.runCount) ?? runs.length,
    totalQuantity: toPositiveInteger(summary.totalQuantity) ?? runs.reduce((total, run) => total + (toPositiveInteger(run.quantity) || 0), 0),
    runs: runs.slice(0, 20).map(normaliseRun),
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
  };
}

function normaliseAccessoryIntent(summary) {
  const rows = Array.isArray(summary.safeAccessoryIntentRows)
    ? summary.safeAccessoryIntentRows
    : Array.isArray(summary.intents) ? summary.intents
      : Array.isArray(summary.safeRunAccessoryIntentSummaries) ? summary.safeRunAccessoryIntentSummaries.flatMap((group) => group.intents || [])
        : [];
  return {
    diagnosticOnly: true,
    runAccessoryPlacementPreviewReady: summary.runAccessoryPlacementPreviewReady === true,
    accessoryIntentCount: toPositiveInteger(summary.accessoryIntentCount) ?? rows.length,
    runsWithAccessoryIntentCount: toPositiveInteger(summary.runsWithAccessoryIntentCount) ?? 0,
    unresolvedAccessoryIntentCount: Number.isFinite(Number(summary.unresolvedAccessoryIntentCount)) ? Number(summary.unresolvedAccessoryIntentCount) : 0,
    intents: rows.slice(0, 30).map((row, index) => ({
      intentId: safeLabel(firstPresent(row, ["intentId", "id"]), `accessory-intent-${index + 1}`),
      runLabel: safeLabel(firstPresent(row, ["runLabel", "runReference", "runId"]), "unresolved run"),
      accessoryTypeToken: safeToken(firstPresent(row, ["accessoryTypeToken", "accessoryType", "type"]), "unresolved"),
      quantityReceivingAccessory: toPositiveInteger(firstPresent(row, ["quantityReceivingAccessory", "quantity", "qty"])) ?? 0,
      placementPreference: safeToken(firstPresent(row, ["placementPreference", "placementKind", "placement"]), "unresolved"),
      intentOnly: true,
      physicalPlacementReturned: false,
      rawAccessoryRowsReturned: false,
    })),
    accessoryReservationExecuted: false,
    rawAccessoryRowsReturned: false,
    rawEnginePayloadReturned: false,
  };
}

function normaliseSpecialParts(summary) {
  return {
    diagnosticOnly: true,
    specialPartsEntitlementPreviewReady: summary.specialPartsEntitlementPreviewReady === true,
    entitlementStatus: safeLabel(firstPresent(summary, ["entitlementStatus", "status"]), "none"),
    displayRole: safeLabel(firstPresent(summary, ["displayRole"]), "redacted"),
    redactedEntitlementCount: Number.isFinite(Number(summary.redactedEntitlementCount)) ? Number(summary.redactedEntitlementCount) : 0,
    compatibleRedactedCandidateCount: Number.isFinite(Number(summary.compatibleRedactedCandidateCount)) ? Number(summary.compatibleRedactedCandidateCount) : 0,
    reviewRequiredCount: Number.isFinite(Number(summary.reviewRequiredCount)) ? Number(summary.reviewRequiredCount) : 0,
    rawUsersReturned: false,
    rawContactsReturned: false,
    rawCrmReturned: false,
    rawProductRowsReturned: false,
  };
}

function normaliseEmergencyIntent(summary) {
  const selected = isPlainObject(summary?.selectedZoneIntentSummary) ? summary.selectedZoneIntentSummary : {};
  return {
    diagnosticOnly: true,
    emergencyZonePickerReady: summary?.emergencyZonePickerReady === true,
    zoneAssociationMode: safeLabel(firstPresent(selected, ["zoneAssociationMode"]), "diagnostic-intent-associated-to-sealed-no-cross-zones"),
    emergencyType: safeToken(firstPresent(selected, ["emergencyType", "type"]), "marker-only"),
    selectedZoneCount: Number.isFinite(Number(selected.selectedZoneCount)) ? Number(selected.selectedZoneCount) : (Array.isArray(selected.selectedZoneIndexes) ? selected.selectedZoneIndexes.length : 0),
    selectedZoneIndexes: Array.isArray(selected.selectedZoneIndexes) ? selected.selectedZoneIndexes.map((value) => toPositiveInteger(Number(value) + 1) - 1).filter((value) => Number.isInteger(value) && value >= 0) : [],
    markerOnly: selected.markerOnly === true || safeToken(firstPresent(selected, ["emergencyType", "type"]), "marker-only") === "marker-only",
    physicalPlacementReturned: false,
    rawEmergencyPayloadReturned: false,
  };
}

function summaryFingerprint(summary, spec = {}) {
  if (!isPlainObject(summary)) return null;
  const fingerprint = safeFingerprint(firstPresent(summary, [
    ...(Array.isArray(spec.fingerprintKeys) ? spec.fingerprintKeys : []),
    "sealedCandidateAssemblyPreviewFingerprint",
    "gateDValidationScaffoldFingerprint",
    "emergencyZonePickerFingerprint",
    "zoneValidationFootholdFingerprint",
    "segmentZoneBridgeFingerprint",
    "driverSizerFingerprint",
    "boardFillInputFingerprint",
    "accessoryReservationFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]));
  return fingerprint || null;
}

function policyFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
}

function sourceFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function buildUpstreamFingerprints(source) {
  const result = {};
  for (const spec of ENGINE_REQUIRED_SUMMARIES) {
    result[spec.key] = summaryFingerprint(source[spec.key], spec);
  }
  return result;
}

function perStageReadiness(source, selectorSafeInputSummary = null, engineSafeInputSummary = null) {
  return {
    selectorSelection: {
      present: isPlainObject(source.selectorSelectionSummary),
      ready: isPlainObject(source.selectorSelectionSummary),
      safeSummaryOnly: true,
    },
    timelineGate: {
      present: isPlainObject(source.timelineGateSummary),
      ready: isPlainObject(selectorSafeInputSummary) && selectorSafeInputSummary.timelineGate.timelineGateReady === true,
      safeSummaryOnly: true,
    },
    mountCompatibility: {
      present: isPlainObject(source.mountCompatibilitySummary),
      ready: isPlainObject(selectorSafeInputSummary) && selectorSafeInputSummary.compatibility.mountCompatibilityReady === true,
      safeSummaryOnly: true,
    },
    finishCascade: {
      present: isPlainObject(source.finishCascadeSummary),
      ready: isPlainObject(selectorSafeInputSummary) && selectorSafeInputSummary.finishes.cover.resolved === true
        && selectorSafeInputSummary.finishes.end.resolved === true
        && selectorSafeInputSummary.finishes.flex.resolved === true,
      safeSummaryOnly: true,
    },
    runIntake: {
      present: isPlainObject(source.selectorRunIntakePreviewSummary),
      ready: isPlainObject(selectorSafeInputSummary) && selectorSafeInputSummary.runIntake.runIntakePreviewReady === true,
      safeSummaryOnly: true,
    },
    accessoryPlacementIntent: {
      present: isPlainObject(source.selectorRunAccessoryPlacementPreviewSummary),
      ready: isPlainObject(selectorSafeInputSummary) && selectorSafeInputSummary.accessoryPlacementIntent.runAccessoryPlacementPreviewReady === true,
      intentOnly: true,
    },
    specialPartsEntitlement: {
      present: isPlainObject(source.selectorSpecialPartsEntitlementPreviewSummary),
      ready: isPlainObject(selectorSafeInputSummary) && selectorSafeInputSummary.specialPartsEntitlement.specialPartsEntitlementPreviewReady === true,
      safeSummaryOnly: true,
    },
    engineSealedChain: {
      present: isPlainObject(engineSafeInputSummary) && engineSafeInputSummary.presentSummaryCount === ENGINE_REQUIRED_SUMMARIES.length,
      ready: isPlainObject(engineSafeInputSummary) && engineSafeInputSummary.allEngineSummariesReady === true,
      sealedSummariesOnly: true,
    },
  };
}

function buildBlockedDependencySummary(blocker = null, dependency = null) {
  return {
    blocked: Boolean(blocker),
    blocker,
    dependency: dependency || blocker || null,
    downstreamEnginePayloadAssemblyBlocked: true,
    donorEngineInvocationBlocked: true,
    runTableGenerationBlocked: true,
    iesGenerationBlocked: true,
    selectedResultPersistenceBlocked: true,
  };
}

function baseSummary(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return {
    schemaId: ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok,
    blocker,
    sealedCandidateAssemblyPreviewReady: ok,
    selectorSafeInputSummary: extra.selectorSafeInputSummary || null,
    engineSafeInputSummary: extra.engineSafeInputSummary || null,
    candidateReadinessSummary: extra.candidateReadinessSummary || {
      diagnosticOnly: true,
      readyForFutureCandidateHandoff: false,
      productionEngineExecutionReady: false,
      donorEnginePayloadReady: false,
      runTableReady: false,
      iesReady: false,
      selectedResultPersistenceReady: false,
      reason: blocker || "sealed-candidate-assembly-preview-not-ready",
    },
    perStageReadinessSummary: extra.perStageReadinessSummary || {},
    blockedDependencySummary: extra.blockedDependencySummary || buildBlockedDependencySummary(blocker),
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    upstreamFingerprints: isPlainObject(extra.upstreamFingerprints) ? extra.upstreamFingerprints : {},
    sealedCandidateAssemblyPreviewFingerprint: extra.sealedCandidateAssemblyPreviewFingerprint || null,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    complianceApproved: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseSummary({
    ...extra,
    ok: false,
    blocker,
    blockedDependencySummary: extra.blockedDependencySummary || buildBlockedDependencySummary(blocker, extra.dependency),
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function validateFingerprintPair(source) {
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!policyFingerprint || !sourceFingerprint) {
    return {
      ok: false,
      blocker: "fingerprint-mismatch",
      diagnostic: "Safe policy and source fingerprints are required before sealed candidate assembly preview.",
      policyFingerprint: policyFingerprint || null,
      sourceFingerprint: sourceFingerprint || null,
    };
  }
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function validateSummarySafety(summary, unsafeFallback) {
  const unsafe = unsafeBlocker(summary);
  if (!unsafe) return { ok: true };
  if (unsafe === "private-path-return-not-approved"
    || unsafe === "credential-return-not-approved"
    || unsafe === "raw-selector-payload-not-approved"
    || unsafe === "raw-engine-payload-not-approved"
    || unsafe === "raw-product-rows-not-approved"
    || unsafe === "raw-users-not-approved"
    || unsafe === "raw-crm-not-approved"
    || unsafe === "raw-contacts-not-approved"
    || unsafe.endsWith("-not-approved")) {
    return { ok: false, blocker: unsafe };
  }
  return { ok: false, blocker: unsafeFallback };
}

function validateSelectorSafeInputs(source) {
  const selectorSelectionSummary = source.selectorSelectionSummary;
  if (!isPlainObject(selectorSelectionSummary)) {
    return { ok: false, blocker: "missing-selector-selection-summary", diagnostic: "A safe selector selection summary is required." };
  }
  const selectionSafety = validateSummarySafety(selectorSelectionSummary, "unsafe-selector-selection-summary");
  if (!selectionSafety.ok) return { ok: false, blocker: selectionSafety.blocker, diagnostic: "Selector selection summary contains unsafe raw payload, row, private path, credential, or side-effect markers." };

  const selectorRunIntakePreviewSummary = source.selectorRunIntakePreviewSummary;
  if (!isPlainObject(selectorRunIntakePreviewSummary)) {
    return { ok: false, blocker: "missing-run-intake-preview-summary", diagnostic: "A safe run intake preview summary is required." };
  }
  const intakeSafety = validateSummarySafety(selectorRunIntakePreviewSummary, "upstream-summary-unsafe");
  if (!intakeSafety.ok) return { ok: false, blocker: intakeSafety.blocker, diagnostic: "Run intake preview summary is unsafe." };
  if (selectorRunIntakePreviewSummary.runIntakePreviewReady !== true) {
    return { ok: false, blocker: "run-intake-not-ready", diagnostic: "Run intake preview must be ready before candidate assembly preview." };
  }

  const selectorRunAccessoryPlacementPreviewSummary = source.selectorRunAccessoryPlacementPreviewSummary;
  if (!isPlainObject(selectorRunAccessoryPlacementPreviewSummary)) {
    return { ok: false, blocker: "missing-accessory-placement-preview-summary", diagnostic: "A safe accessory placement preview summary is required." };
  }
  const placementSafety = validateSummarySafety(selectorRunAccessoryPlacementPreviewSummary, "upstream-summary-unsafe");
  if (!placementSafety.ok) return { ok: false, blocker: placementSafety.blocker, diagnostic: "Accessory placement preview summary is unsafe." };
  if (selectorRunAccessoryPlacementPreviewSummary.runAccessoryPlacementPreviewReady !== true) {
    return { ok: false, blocker: "accessory-placement-intent-not-ready", diagnostic: "Run accessory placement intent must be ready before candidate assembly preview." };
  }

  const selectorSpecialPartsEntitlementPreviewSummary = source.selectorSpecialPartsEntitlementPreviewSummary;
  if (!isPlainObject(selectorSpecialPartsEntitlementPreviewSummary)) {
    return { ok: false, blocker: "missing-special-parts-entitlement-preview-summary", diagnostic: "A safe special-parts entitlement preview summary is required." };
  }
  const entitlementSafety = validateSummarySafety(selectorSpecialPartsEntitlementPreviewSummary, "upstream-summary-unsafe");
  if (!entitlementSafety.ok) return { ok: false, blocker: entitlementSafety.blocker, diagnostic: "Special-parts entitlement preview summary is unsafe." };
  if (selectorSpecialPartsEntitlementPreviewSummary.specialPartsEntitlementPreviewReady !== true) {
    return { ok: false, blocker: "special-parts-entitlement-not-ready", diagnostic: "Special-parts entitlement preview must be ready before candidate assembly preview." };
  }

  const timelineGateSummary = source.timelineGateSummary;
  const timelineSafety = validateSummarySafety(timelineGateSummary, "upstream-summary-unsafe");
  if (!timelineSafety.ok) return { ok: false, blocker: timelineSafety.blocker, diagnostic: "Timeline gate summary is unsafe." };
  if (timelineBlocked(timelineGateSummary)) {
    return { ok: false, blocker: "timeline-gate-blocked", diagnostic: "Timeline/status gate is blocked or missing." };
  }

  const mountCompatibilitySummary = source.mountCompatibilitySummary;
  const mountSafety = validateSummarySafety(mountCompatibilitySummary, "upstream-summary-unsafe");
  if (!mountSafety.ok) return { ok: false, blocker: mountSafety.blocker, diagnostic: "Mount compatibility summary is unsafe." };
  if (mountBlocked(mountCompatibilitySummary)) {
    return { ok: false, blocker: "mount-compatibility-blocked", diagnostic: "Mount, optic, or uplight compatibility is blocked or missing." };
  }

  const finishCascadeSummary = source.finishCascadeSummary;
  const finishSafety = validateSummarySafety(finishCascadeSummary, "upstream-summary-unsafe");
  if (!finishSafety.ok) return { ok: false, blocker: finishSafety.blocker, diagnostic: "Finish cascade summary is unsafe." };
  if (finishCascadeUnresolved(finishCascadeSummary)) {
    return { ok: false, blocker: "finish-cascade-unresolved", diagnostic: "Finish cascade must resolve effective body, cover, end, and flex finishes." };
  }

  const selectorSafeInputSummary = {
    diagnosticOnly: true,
    selectorSelection: normaliseSelectorSelectionSummary(selectorSelectionSummary),
    compatibility: normaliseMountCompatibility(mountCompatibilitySummary),
    finishes: normaliseFinishCascade(finishCascadeSummary),
    timelineGate: normaliseTimelineGate(timelineGateSummary),
    runIntake: normaliseRunIntake(selectorRunIntakePreviewSummary),
    accessoryPlacementIntent: normaliseAccessoryIntent(selectorRunAccessoryPlacementPreviewSummary),
    specialPartsEntitlement: normaliseSpecialParts(selectorSpecialPartsEntitlementPreviewSummary),
    rawSelectorPayloadReturned: false,
    rawProductRowsReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
  };

  return { ok: true, selectorSafeInputSummary };
}

function validateEngineSummary(spec, summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} is required.` };
  }
  const safety = validateSummarySafety(summary, "upstream-summary-unsafe");
  if (!safety.ok) return { ok: false, blocker: safety.blocker, diagnostic: `${spec.label} contains unsafe raw payload, row, private path, credential, or side-effect markers.` };
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: "upstream-summary-unsafe", diagnostic: `${spec.label} must be ok, diagnostic-only, and runtime-native.` };
  }
  const ownPolicy = policyFingerprintFrom(summary);
  const ownSource = sourceFingerprintFrom(summary);
  if (!ownPolicy || !ownSource || ownPolicy !== policyFingerprint || ownSource !== sourceFingerprint) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${spec.label} fingerprint does not match the sealed candidate assembly preview fingerprints.` };
  }
  if (spec.readyKey && summary[spec.readyKey] !== true) {
    return { ok: false, blocker: spec.notReady || "upstream-summary-unsafe", diagnostic: `${spec.label} is not ready: ${spec.readyKey} is not true.` };
  }
  return { ok: true };
}

function validateEngineSafeInputs(source, policyFingerprint, sourceFingerprint) {
  const engineStageSummaries = {};
  for (const spec of ENGINE_REQUIRED_SUMMARIES) {
    engineStageSummaries[spec.key] = source[spec.key] || null;
    const validation = validateEngineSummary(spec, source[spec.key], policyFingerprint, sourceFingerprint);
    if (!validation.ok) return validation;
  }

  const engineSafeInputSummary = {
    diagnosticOnly: true,
    sealedSummariesOnly: true,
    presentSummaryCount: ENGINE_REQUIRED_SUMMARIES.length,
    requiredSummaryCount: ENGINE_REQUIRED_SUMMARIES.length,
    allEngineSummariesReady: true,
    gateDScaffoldReady: source.gateDValidationScaffoldSummary.gateDScaffoldReady === true,
    stageReadiness: Object.fromEntries(ENGINE_REQUIRED_SUMMARIES.map((spec) => [
      spec.key,
      {
        present: isPlainObject(source[spec.key]),
        ok: source[spec.key]?.ok === true,
        diagnosticOnly: source[spec.key]?.diagnosticOnly === true,
        nativeRuntimeKernel: source[spec.key]?.nativeRuntimeKernel === true,
        readyKey: spec.readyKey || null,
        ready: spec.readyKey ? source[spec.key]?.[spec.readyKey] === true : source[spec.key]?.ok === true,
        fingerprint: summaryFingerprint(source[spec.key], spec),
      },
    ])),
    emergencyIntent: normaliseEmergencyIntent(source.emergencyZonePickerFootholdSummary),
    gateDReadiness: clonePlain(source.gateDValidationScaffoldSummary.validationReadiness || source.gateDValidationScaffoldSummary.sealedReadinessSummary || {}),
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
  };
  return { ok: true, engineSafeInputSummary, engineStageSummaries };
}

export function buildRuntimeSealedCandidateAssemblyPreviewSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const fingerprints = validateFingerprintPair(source);
  const policyFingerprint = fingerprints.policyFingerprint || safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"])) || null;
  const sourceFingerprint = fingerprints.sourceFingerprint || safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])) || null;
  const upstreamFingerprints = buildUpstreamFingerprints(source);

  const topSafety = validateSummarySafety({
    ...source,
    selectorSelectionSummary: undefined,
    selectorRunIntakePreviewSummary: undefined,
    selectorRunAccessoryPlacementPreviewSummary: undefined,
    selectorSpecialPartsEntitlementPreviewSummary: undefined,
    timelineGateSummary: undefined,
    finishCascadeSummary: undefined,
    mountCompatibilitySummary: undefined,
    accessoryReservationSummary: undefined,
    boardFillInputSummary: undefined,
    boardFillSummary: undefined,
    boardElectricalSummary: undefined,
    driverSizerSummary: undefined,
    segmentZoneBridgeSummary: undefined,
    zoneValidationFootholdSummary: undefined,
    emergencyZonePickerFootholdSummary: undefined,
    gateDValidationScaffoldSummary: undefined,
  }, "upstream-summary-unsafe");
  if (!topSafety.ok) {
    return failClosed(topSafety.blocker, "Top-level sealed candidate assembly preview input contains an unsafe payload, row, private path, credential, or forbidden side-effect marker.", {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  if (!fingerprints.ok) {
    return failClosed(fingerprints.blocker, fingerprints.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  const selectorValidation = validateSelectorSafeInputs(source);
  if (!selectorValidation.ok) {
    return failClosed(selectorValidation.blocker, selectorValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      dependency: "selector-safe-inputs",
      selectorSafeInputSummary: selectorValidation.selectorSafeInputSummary || null,
    });
  }

  const engineValidation = validateEngineSafeInputs(source, policyFingerprint, sourceFingerprint);
  if (!engineValidation.ok) {
    return failClosed(engineValidation.blocker, engineValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      dependency: "engine-sealed-inputs",
      selectorSafeInputSummary: selectorValidation.selectorSafeInputSummary,
    });
  }

  const selectorSafeInputSummary = selectorValidation.selectorSafeInputSummary;
  const engineSafeInputSummary = engineValidation.engineSafeInputSummary;
  const perStageReadinessSummary = perStageReadiness(source, selectorSafeInputSummary, engineSafeInputSummary);
  const candidateReadinessSummary = {
    diagnosticOnly: true,
    readyForFutureCandidateHandoff: true,
    sealedCandidateAssemblyPreviewReady: true,
    selectorSafeInputsReady: true,
    engineSealedInputsReady: true,
    gateDScaffoldReady: true,
    oneSafeCandidatePreserved: true,
    futureDonorEnginePayloadAssemblyReady: false,
    productionEngineExecutionReady: false,
    donorEnginePayloadReady: false,
    runTableReady: false,
    iesReady: false,
    selectedResultPersistenceReady: false,
    complianceApprovalReady: false,
    reason: "sealed-preview-ready-for-future-candidate-handoff-only",
  };
  const fingerprintPayload = {
    schemaId: ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_SEALED_CANDIDATE_ASSEMBLY_PREVIEW_SCHEMA_VERSION,
    policyFingerprint,
    sourceFingerprint,
    selectorSafeInputSummary,
    engineStageFingerprints: upstreamFingerprints,
    candidateReadinessSummary,
  };
  const sealedCandidateAssemblyPreviewFingerprint = `safe-sealed-candidate-assembly-preview:${stableSha1(fingerprintPayload)}`;

  return baseSummary({
    ok: true,
    selectorSafeInputSummary,
    engineSafeInputSummary,
    candidateReadinessSummary,
    perStageReadinessSummary,
    blockedDependencySummary: {
      blocked: false,
      blocker: null,
      dependency: null,
      downstreamEnginePayloadAssemblyBlocked: true,
      donorEngineInvocationBlocked: true,
      runTableGenerationBlocked: true,
      iesGenerationBlocked: true,
      selectedResultPersistenceBlocked: true,
    },
    warnings: [
      "Sealed candidate assembly preview is diagnostic-only and preserves one safe candidate summary for future handoff.",
      "No donor Engine payload is assembled; donor Engine, RunTable, IES, selected-result persistence, routes, POST endpoints, RuntimeData mutation, HubSpot writes, and project writes remain disabled.",
    ],
    failClosedDiagnostics: [],
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    sealedCandidateAssemblyPreviewFingerprint,
  });
}

export const buildRuntimeNativeSealedCandidateAssemblyPreviewSummary = buildRuntimeSealedCandidateAssemblyPreviewSummary;
export const buildEngineRunTableSealedCandidateAssemblyPreviewStatus = buildRuntimeSealedCandidateAssemblyPreviewSummary;
