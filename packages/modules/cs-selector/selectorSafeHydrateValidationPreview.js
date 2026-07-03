import { stableSha1 } from "../../workspace-kernel/stableFingerprint.js";
import {
  SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_ID,
  SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_VERSION,
} from "./selectorSafeDraftProjectEnvelopePreview.js";

export const SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_ID = "selector_safe_hydrate_validation_preview.v1-runtime";
export const SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_VERSION = 1;

export const SELECTOR_SAFE_HYDRATE_VALIDATION_FAIL_CLOSED_CODES = Object.freeze({
  missingSafeDraftProjectEnvelopePreviewSummary: "missing-safe-draft-project-envelope-preview-summary",
  invalidEnvelopeSchema: "invalid-envelope-schema",
  unsafeEnvelopeSummary: "unsafe-envelope-summary",
  envelopeNotReady: "envelope-not-ready",
  staleComparisonNotImplemented: "stale-comparison-not-implemented",
  fingerprintMismatch: "fingerprint-mismatch",
  sealedCandidateBodyNotApproved: "sealed-candidate-body-not-approved",
  selectedResultBodyNotApproved: "selected-result-body-not-approved",
  selectedResultRestoreNotApproved: "selected-result-restore-not-approved",
  selectedResultPersistenceNotApproved: "selected-result-persistence-not-approved",
  selectorStateMutationNotApproved: "selector-state-mutation-not-approved",
  savedProjectStoreInvocationNotApproved: "saved-project-store-invocation-not-approved",
  rawSelectorPayloadNotApproved: "raw-selector-payload-not-approved",
  rawEnginePayloadNotApproved: "raw-engine-payload-not-approved",
  rawEngineResultNotApproved: "raw-engine-result-not-approved",
  rawProductRowsNotApproved: "raw-product-rows-not-approved",
  rawUsersNotApproved: "raw-users-not-approved",
  rawCrmNotApproved: "raw-crm-not-approved",
  rawContactDataNotApproved: "raw-contact-data-not-approved",
  privatePathReturnNotApproved: "private-path-return-not-approved",
  credentialReturnNotApproved: "credential-return-not-approved",
  runtableGenerationNotApproved: "runtable-generation-not-approved",
  iesGenerationNotApproved: "ies-generation-not-approved",
  hubspotWriteNotApproved: "hubspot-write-not-approved",
  projectWriteNotApproved: "project-write-not-approved",
  routeOrPostEndpointNotApproved: "route-or-post-endpoint-not-approved",
});

const FAIL = SELECTOR_SAFE_HYDRATE_VALIDATION_FAIL_CLOSED_CODES;

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|\bControlStack(?:_Runtime|_RuntimeData)?[\\/])/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const RAW_ARTEFACT_TEXT_PATTERN = /(?:data:[^\s]+;base64|\bbase64\b|\.pdf\b|\.ies\b|candela|photometry|photometric|polar\s*plot|IESNA:LM-63)/i;
const SAFE_FINGERPRINT_PATTERN = /^(?:safe|sha1|sha256)[-:][0-9A-Za-z_.:-]{4,560}$/;

const TRUE_TOKENS = new Set(["true", "yes", "1", "enabled", "active", "live", "invoked", "mutated", "generated", "restored", "persisted", "exposed", "returned"]);

const WRITE_DISABLED_SUMMARY = Object.freeze({
  selectorStateMutationEnabled: false,
  savedProjectStoreInvocationEnabled: false,
  selectedResultRestoreEnabled: false,
  selectedResultPersistenceEnabled: false,
  donorEngineInvocationEnabled: false,
  runtimeDataMutationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  hubSpotWriteEnabled: false,
  projectWriteEnabled: false,
  routeCreationEnabled: false,
  postEndpointCreationEnabled: false,
});

const TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:selectorStateMutated|selectorStateMutationEnabled|selectorStateRestoreEnabled|selectorHydrationEnabled|hydrateSelectorState|stateRestored|stateRestoreEnabled|restoreStateEnabled)$/i, FAIL.selectorStateMutationNotApproved],
  [/^(?:savedProjectStoreInvoked|savedProjectStoreReadInvoked|savedProjectStoreWriteInvoked|savedProjectStoreInvocationEnabled|savedProjectStoreRestoreInvoked|saveLoadActive|getProjectEnvelopeInvoked|restoreProjectEnvelopeInvoked)$/i, FAIL.savedProjectStoreInvocationNotApproved],
  [/^(?:selectedResultRestored|selectedResultRestoreEnabled|selectedResultRestoreAttempted|selectedResultHydrationEnabled|restoreSelectedResultEnabled)$/i, FAIL.selectedResultRestoreNotApproved],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled|selectedResultPersistenceAttempted|selectedResultIngestionEnabled|hiddenWriteBackEnabled)$/i, FAIL.selectedResultPersistenceNotApproved],
  [/^(?:rawSelectorPayloadReturned|rawSelectorPayloadExposed|selectorPayloadReturned|selectorPayloadExposed|payloadGenerationEnabled|downstreamPayloadActive|selectorPayloadReady|fullSelectorStateReturned|passStateReturned)$/i, FAIL.rawSelectorPayloadNotApproved],
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|enginePayloadIncluded|enginePayloadReady|donorPayloadReturned|runEnginePayloadReturned)$/i, FAIL.rawEnginePayloadNotApproved],
  [/^(?:rawEngineResultReturned|rawEngineResultExposed|engineResultReturned|engineResultIncluded|rawEngineDebugReturned|engineDebugReturned|debugPayloadReturned|donorDebugReturned)$/i, FAIL.rawEngineResultNotApproved],
  [/^(?:rawRowsReturned|rawRowsExposed|rawProductRowsReturned|rawProductRowsExposed|rawBoardRowsReturned|rawDriverRowsReturned|rawAccessoryRowsReturned|rawComponentRowsReturned|rawReservationGridReturned|rawCurveRowsReturned|rawSourceDbRowsReturned|rawBoardDataRowsExposed|rawProductDataRowsExposed)$/i, FAIL.rawProductRowsNotApproved],
  [/^(?:rawUsersReturned|rawUsersExposed|usersReturned|userRowsReturned|rawUserRowsReturned)$/i, FAIL.rawUsersNotApproved],
  [/^(?:rawCrmReturned|rawCRMReturned|rawCrmExposed|rawCRMExposed|rawHubSpotReturned|rawHubspotReturned|hubSpotPayloadReturned|hubspotPayloadReturned|rawCompanyReturned|companyPayloadReturned)$/i, FAIL.rawCrmNotApproved],
  [/^(?:rawContactsReturned|rawContactReturned|rawContactInputReturned|rawContactsExposed|contactPayloadReturned|rawContactDataReturned)$/i, FAIL.rawContactDataNotApproved],
  [/^(?:privatePathsReturned|privatePathsExposed|privatePathReturned|privatePathExposed|filenamesExposed|localPathsReturned)$/i, FAIL.privatePathReturnNotApproved],
  [/^(?:credentialsReturned|credentialsExposed|credentialReturned|secretReturned|tokenReturned|accessTokenReturned|apiKeyReturned)$/i, FAIL.credentialReturnNotApproved],
  [/^(?:selectedResultBodyReturned|selectedResultBodyExposed|selectedEngineResultReturned|rawSelectedPayloadExposed|rawSelectedPayloadReturned|rawSelectedResultReturned)$/i, FAIL.selectedResultBodyNotApproved],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineCallsActive|engineExecutionEnabled|engineVerificationEnabled)$/i, FAIL.rawEnginePayloadNotApproved],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAuthority|boardDataMutationEnabled|authorityWritesActive|activeBuildMutationEnabled|buildMutationEnabled)$/i, FAIL.rawProductRowsNotApproved],
  [/^(?:runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableMutationEnabled|runTableIncluded|runTableReady)$/i, FAIL.runtableGenerationNotApproved],
  [/^(?:iesGenerated|iesGenerationEnabled|iesIncluded|iesReady|photometryGenerationAllowed|photometryGenerationEnabled|iesCallsActive)$/i, FAIL.iesGenerationNotApproved],
  [/^(?:hubSpotWriteEnabled|hubspotWriteEnabled|hubSpotWriteLive|hubspotWriteLive|hubSpotPushEnabled|hubSpotCrmWriteBackEnabled|hubspotCrmWriteBackEnabled)$/i, FAIL.hubspotWriteNotApproved],
  [/^(?:projectWriteEnabled|projectWritesEnabled|projectWriteLive|projectMutationEnabled|controlledRecordWriteEnabled|controlledRecordsWriteEnabled)$/i, FAIL.projectWriteNotApproved],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|routeCreationEnabled)$/i, FAIL.routeOrPostEndpointNotApproved],
  [/^(?:postEndpointsAdded|postEndpointAdded|postEndpointEnabled|postEndpointCreationEnabled)$/i, FAIL.routeOrPostEndpointNotApproved],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:selectorPayload|rawSelectorPayload|selectorEnginePayload|payloadDraft|fullSelectorState|selectorStateDump|donorSpec|fullDonorSpec|specBody|pass2|pass3|pass4|pass5|provenance)$/i, FAIL.rawSelectorPayloadNotApproved],
  [/^(?:enginePayload|rawEnginePayload|runEnginePayload|roughElectricalPayload|rawRoughElectricalPayload|donorPayload|rawDonorPayload)$/i, FAIL.rawEnginePayloadNotApproved],
  [/^(?:engineResult|rawEngineResult|engineDebug|rawEngineDebug|debug|rawDebug|donorDebug)$/i, FAIL.rawEngineResultNotApproved],
  [/^(?:PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|SYSTEM_POLICY|SYSTEM_COMPONENTS|rawRows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|rawComponentRows|productRows|boardRows|driverRows|accessoryRows|componentRows|rawReservationGrid|reservationGrid|reservedGrid|rawCurveRows|curveRows|sourceDbRows|boardDataRows)$/i, FAIL.rawProductRowsNotApproved],
  [/^(?:USERS|rawUsers|userRows|usersRows|rawUserRows)$/i, FAIL.rawUsersNotApproved],
  [/^(?:CRM|rawCrm|rawCRM|crmRows|hubSpotRows|hubspotRows|hubSpotPayload|hubspotPayload|hubSpotCompany|hubspotCompany|companyPayload|companyRows)$/i, FAIL.rawCrmNotApproved],
  [/^(?:CONTACTS|rawContacts|rawContact|contactRows|contactPayload|crmContacts|hubSpotContacts|hubspotContacts|hubspotContact|hubSpotContact)$/i, FAIL.rawContactDataNotApproved],
  [/^(?:credentials|credential|secret|secrets|token|tokens|accessToken|apiKey|apikey|password)$/i, FAIL.credentialReturnNotApproved],
  [/^(?:sealedCandidateAssemblyPreviewSummary|sealedCandidateBody|sealedCandidatePayload|sealedCandidateAssemblyBody|candidateReadinessSummary|candidateBody|candidatePayload)$/i, FAIL.sealedCandidateBodyNotApproved],
  [/^(?:selectedResultBody|selectedResult|selectedEngineResult|selectedRunTableResult|acceptedEngineResult|acceptedSelectedResult|rawSelectedPayload|selectedPayload|rawSelectedResult)$/i, FAIL.selectedResultBodyNotApproved],
  [/^(?:generatedRunTable|runTable|runTableRows|runtableRows|rawRunTableRows|productionRunTable)$/i, FAIL.runtableGenerationNotApproved],
  [/^(?:generatedIes|ies|iesText|rawIesText|iesFile|photometry|photometryFile|candela|candelaGrid|rawCandelaGrid|pdf|pdfRef|base64|base64Artefact|base64Artifact|polarPlot)$/i, FAIL.iesGenerationNotApproved],
  [/^(?:hubSpotWriteback|hubspotWriteback|hubSpotWriteBackObject|hubspotWriteBackObject)$/i, FAIL.hubspotWriteNotApproved],
  [/^(?:projectWriteback|projectWriteBackObject|projectMutation|controlledRecordWriteback)$/i, FAIL.projectWriteNotApproved],
  [/^(?:routeDefinitions|postEndpointDefinitions|endpointDefinitions|backendRoutes)$/i, FAIL.routeOrPostEndpointNotApproved],
]);

const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|filepath|sourcePath|donorPath|runtimeDataPath|privatePath|path|filename|fileName)$/i;
const CONTACT_KEY_PATTERN = /(?:email|hubspotContactId|hubSpotContactId|contactId|phone|mobile|crmContact)$/i;

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

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || EMAIL_PATTERN.test(raw) || RAW_ARTEFACT_TEXT_PATTERN.test(raw)) return fallback;
  return raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180) || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || EMAIL_PATTERN.test(raw) || RAW_ARTEFACT_TEXT_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 620);
  if (SAFE_FINGERPRINT_PATTERN.test(cleaned)) return cleaned;
  if (/^(?:sha1|sha256):[0-9a-f]{12,80}$/i.test(cleaned)) return cleaned;
  return "";
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const value = source[key];
    if (!isBlank(value) && value !== false) return value;
  }
  return undefined;
}

function enabledLike(value) {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  if (typeof value === "number") return value === 1;
  if (typeof value !== "string") return false;
  return TRUE_TOKENS.has(safeToken(value, ""));
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 12) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return FAIL.privatePathReturnNotApproved;
    if (EMAIL_PATTERN.test(value)) return FAIL.rawContactDataNotApproved;
    if (RAW_ARTEFACT_TEXT_PATTERN.test(value)) return FAIL.iesGenerationNotApproved;
    return null;
  }
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
    for (const [pattern, blocker] of TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && enabledLike(nested)) return blocker;
    }
    for (const [pattern, blocker] of RAW_KEY_BLOCKERS) {
      if (pattern.test(key) && nested !== false && nested !== null && nested !== undefined) return blocker;
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return FAIL.privatePathReturnNotApproved;
    }
    if (CONTACT_KEY_PATTERN.test(key) && typeof nested === "string" && EMAIL_PATTERN.test(nested)) {
      return FAIL.rawContactDataNotApproved;
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function unsafeExclusionsSummary() {
  return {
    verified: true,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    sealedCandidateBodyReturned: false,
    selectedResultBodyReturned: false,
    selectorStateMutated: false,
    savedProjectStoreInvoked: false,
    selectedResultRestored: false,
    selectedResultPersisted: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    runTableGenerated: false,
    iesGenerated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}

function selectedResultProjectionFingerprint(summary = {}) {
  const projection = isPlainObject(summary.selectedResultProjectionState) ? summary.selectedResultProjectionState : {};
  return safeFingerprint(firstPresent(projection, [
    "selectedResultProjectionFingerprint",
    "projectionFingerprint",
    "fingerprint",
  ]));
}

function selectedResultProjectionState(summary = {}) {
  const projection = isPlainObject(summary.selectedResultProjectionState) ? summary.selectedResultProjectionState : {};
  return safeToken(firstPresent(projection, ["state", "sourceState", "resultState"]), "no-selected-result").replace(/-/g, "_");
}

function readStaleToken(summary = {}) {
  const projection = isPlainObject(summary.selectedResultProjectionState) ? summary.selectedResultProjectionState : {};
  if (projection.stale === true) return "stale";
  return safeToken(firstPresent(summary, ["staleState", "staleStatus", "staleComparisonState"]), "not-compared-fail-closed").replace(/-/g, "_");
}

function safeStaleState(summary, source) {
  const state = readStaleToken(summary);
  const failClosedDiagnostics = Array.isArray(summary.failClosedDiagnostics) ? summary.failClosedDiagnostics : [];
  const safeComparisonExists = [
    "safe_comparison_not_required",
    "comparison_not_required",
    "current",
    "fresh",
    "not_stale",
    "no_selected_result",
  ].includes(state);
  const failClosed = !safeComparisonExists
    || state.includes("fail_closed")
    || state.includes("not_compared")
    || state === "stale"
    || failClosedDiagnostics.includes(FAIL.staleComparisonNotImplemented);
  return {
    state,
    safeComparisonExists,
    failClosed,
    reason: failClosed ? "safe stale comparison is not implemented for this hydrate validation preview" : "no stale blocker active for safe validation preview",
    currentReferenceOptionsFingerprint: safeFingerprint(source.currentReferenceOptionsFingerprint) || null,
    currentSelectorStateFingerprint: safeFingerprint(source.currentSelectorStateFingerprint) || null,
  };
}

function buildSafeHydrateIntentSummary(summary = {}) {
  return {
    previewOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    validateOnly: true,
    hydrateStateAllowed: false,
    sourceEnvelopeSchemaId: summary.schemaId || null,
    sourceEnvelopeSchemaVersion: summary.schemaVersion ?? null,
    sourceEnvelopeState: safeToken(summary.state, "unknown"),
    sourceEnvelopePreviewReady: summary.safeDraftProjectEnvelopePreviewReady === true,
    sourceEnvelopeFingerprint: safeFingerprint(summary.envelopeFingerprint) || null,
    policyFingerprint: safeFingerprint(summary.policyFingerprint) || null,
    sourceFingerprint: safeFingerprint(summary.sourceFingerprint) || null,
    sealedCandidateAssemblyPreviewFingerprint: safeFingerprint(summary.sealedCandidateAssemblyPreviewFingerprint) || null,
    selectedResultProjectionState: selectedResultProjectionState(summary),
    selectedResultProjectionFingerprint: selectedResultProjectionFingerprint(summary) || null,
    selectorStateMutated: false,
    savedProjectStoreInvoked: false,
    selectedResultRestored: false,
    selectedResultPersisted: false,
  };
}

function buildFingerprintValidationSummary(summary = {}, source = {}) {
  const actualPolicyFingerprint = safeFingerprint(summary.policyFingerprint);
  const actualSourceFingerprint = safeFingerprint(summary.sourceFingerprint);
  const expectedPolicyFingerprint = safeFingerprint(source.expectedPolicyFingerprint);
  const expectedSourceFingerprint = safeFingerprint(source.expectedSourceFingerprint);
  return {
    fingerprintOnly: true,
    expectedPolicyFingerprint: expectedPolicyFingerprint || null,
    actualPolicyFingerprint: actualPolicyFingerprint || null,
    policyFingerprintMatches: Boolean(expectedPolicyFingerprint && actualPolicyFingerprint && expectedPolicyFingerprint === actualPolicyFingerprint),
    expectedSourceFingerprint: expectedSourceFingerprint || null,
    actualSourceFingerprint: actualSourceFingerprint || null,
    sourceFingerprintMatches: Boolean(expectedSourceFingerprint && actualSourceFingerprint && expectedSourceFingerprint === actualSourceFingerprint),
    currentReferenceOptionsFingerprint: safeFingerprint(source.currentReferenceOptionsFingerprint) || null,
    currentSelectorStateFingerprint: safeFingerprint(source.currentSelectorStateFingerprint) || null,
    sourceEnvelopeFingerprint: safeFingerprint(summary.envelopeFingerprint) || null,
    sealedCandidateAssemblyPreviewFingerprint: safeFingerprint(summary.sealedCandidateAssemblyPreviewFingerprint) || null,
    selectedResultProjectionFingerprint: selectedResultProjectionFingerprint(summary) || null,
  };
}

function basePreview(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return {
    schemaId: SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_ID,
    schemaVersion: SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_VERSION,
    state: ok ? "selector_safe_hydrate_validation_preview_ready" : "selector_safe_hydrate_validation_preview_fail_closed",
    previewOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    ok,
    blocker,
    hydrateValidationPreviewReady: ok,
    safeHydrateIntentSummary: extra.safeHydrateIntentSummary || null,
    fingerprintValidationSummary: extra.fingerprintValidationSummary || null,
    staleState: extra.staleState || {
      state: "not_compared_fail_closed",
      safeComparisonExists: false,
      failClosed: true,
      reason: "safe stale comparison is not implemented for this hydrate validation preview",
      currentReferenceOptionsFingerprint: null,
      currentSelectorStateFingerprint: null,
    },
    writeDisabledSummary: clonePlain(WRITE_DISABLED_SUMMARY),
    unsafeExclusionsVerified: unsafeExclusionsSummary(),
    warnings: Array.isArray(extra.warnings) ? [...extra.warnings] : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics) ? [...extra.failClosedDiagnostics] : [],
    hydrateValidationPreviewFingerprint: extra.hydrateValidationPreviewFingerprint || null,
    selectorStateMutated: false,
    savedProjectStoreInvoked: false,
    selectedResultRestored: false,
    selectedResultPersisted: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    runTableGenerated: false,
    iesGenerated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return basePreview({
    ...extra,
    ok: false,
    blocker,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function validateEnvelopeSchema(summary) {
  if (summary.schemaId !== SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_ID) return false;
  if (summary.schemaVersion !== SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_VERSION) return false;
  return true;
}

function validateEnvelopeSafetyFlags(summary) {
  return summary.previewOnly === true
    && summary.diagnosticOnly === true
    && summary.readOnly === true;
}

function validateEnvelopeReady(summary) {
  return summary.safeDraftProjectEnvelopePreviewReady === true || summary.envelopePreviewReady === true;
}

function buildHydrateValidationPreviewFingerprint(summary, source, staleState, fingerprintValidationSummary) {
  return `safe-selector-hydrate-validation-preview:${stableSha1({
    schemaId: SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_ID,
    schemaVersion: SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_VERSION,
    sourceEnvelopeFingerprint: safeFingerprint(summary.envelopeFingerprint),
    policyFingerprint: fingerprintValidationSummary.actualPolicyFingerprint,
    sourceFingerprint: fingerprintValidationSummary.actualSourceFingerprint,
    currentReferenceOptionsFingerprint: safeFingerprint(source.currentReferenceOptionsFingerprint) || null,
    currentSelectorStateFingerprint: safeFingerprint(source.currentSelectorStateFingerprint) || null,
    sealedCandidateAssemblyPreviewFingerprint: safeFingerprint(summary.sealedCandidateAssemblyPreviewFingerprint) || null,
    selectedResultProjectionFingerprint: selectedResultProjectionFingerprint(summary) || null,
    selectedResultProjectionState: selectedResultProjectionState(summary),
    staleState,
    writeDisabledSummary: WRITE_DISABLED_SUMMARY,
  })}`;
}

export function buildSelectorSafeHydrateValidationPreview(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const summary = source.safeDraftProjectEnvelopePreviewSummary;
  const topLevelSafety = unsafeBlocker({ ...source, safeDraftProjectEnvelopePreviewSummary: undefined });
  if (topLevelSafety) {
    return failClosed(topLevelSafety, "Top-level hydrate validation preview input contains forbidden unsafe markers.");
  }

  if (!isPlainObject(summary)) {
    return failClosed(FAIL.missingSafeDraftProjectEnvelopePreviewSummary, "safeDraftProjectEnvelopePreviewSummary is required as a safe summary object.");
  }

  const summarySafety = unsafeBlocker(summary);
  const safeHydrateIntentSummary = buildSafeHydrateIntentSummary(summary);
  const fingerprintValidationSummary = buildFingerprintValidationSummary(summary, source);
  const staleState = safeStaleState(summary, source);

  if (summarySafety) {
    return failClosed(summarySafety, "Safe draft project envelope preview summary contains forbidden raw body, state, payload, row, path, credential, write, restore, or generation markers.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  if (!validateEnvelopeSchema(summary)) {
    return failClosed(FAIL.invalidEnvelopeSchema, "Safe draft project envelope preview summary schema is not approved for hydrate validation preview.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  if (!validateEnvelopeSafetyFlags(summary)) {
    return failClosed(FAIL.unsafeEnvelopeSummary, "Safe draft project envelope preview summary must remain previewOnly, diagnosticOnly, and readOnly.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  if (!validateEnvelopeReady(summary)) {
    return failClosed(FAIL.envelopeNotReady, "Safe draft project envelope preview summary is not ready for read-back validation.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  if (!safeFingerprint(summary.sealedCandidateAssemblyPreviewFingerprint)) {
    return failClosed(FAIL.sealedCandidateBodyNotApproved, "Sealed candidate assembly must be represented by a safe fingerprint only.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  if (!isPlainObject(summary.selectedResultProjectionState)) {
    return failClosed(FAIL.selectedResultBodyNotApproved, "Selected-result projection must be represented by safe state and fingerprint metadata only.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  if (!fingerprintValidationSummary.policyFingerprintMatches || !fingerprintValidationSummary.sourceFingerprintMatches) {
    return failClosed(FAIL.fingerprintMismatch, "Policy/source fingerprints must match the expected safe read-back values.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  if (staleState.failClosed) {
    return failClosed(FAIL.staleComparisonNotImplemented, "Stale state cannot be resolved because safe comparison is not implemented in this validation preview.", {
      safeHydrateIntentSummary,
      fingerprintValidationSummary,
      staleState,
    });
  }

  const hydrateValidationPreviewFingerprint = buildHydrateValidationPreviewFingerprint(summary, source, staleState, fingerprintValidationSummary);

  return basePreview({
    ok: true,
    safeHydrateIntentSummary,
    fingerprintValidationSummary,
    staleState,
    warnings: [],
    failClosedDiagnostics: [],
    hydrateValidationPreviewFingerprint,
  });
}
