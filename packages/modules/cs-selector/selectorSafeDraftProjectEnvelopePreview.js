import { stableSha1 } from "../../workspace-kernel/stableFingerprint.js";

export const SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_ID = "selector_safe_draft_project_intent_envelope.v1-runtime";
export const SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_VERSION = 1;

export const SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_FAIL_CLOSED_CODES = Object.freeze({
  missingSafeSelectedValuesSummary: "missing-safe-selected-values-summary",
  unsafeSelectedValuesSummary: "unsafe-selected-values-summary",
  missingRunIntakePreviewSummary: "missing-run-intake-preview-summary",
  unsafeRunIntakePreviewSummary: "unsafe-run-intake-preview-summary",
  missingRunAccessoryPlacementPreviewSummary: "missing-run-accessory-placement-preview-summary",
  unsafeRunAccessoryPlacementPreviewSummary: "unsafe-run-accessory-placement-preview-summary",
  missingSpecialPartsEntitlementPreviewSummary: "missing-special-parts-entitlement-preview-summary",
  unsafeSpecialPartsEntitlementPreviewSummary: "unsafe-special-parts-entitlement-preview-summary",
  missingSealedCandidateAssemblyPreviewSummary: "missing-sealed-candidate-assembly-preview-summary",
  unsafeSealedCandidateAssemblyPreviewSummary: "unsafe-sealed-candidate-assembly-preview-summary",
  rawSelectorPayloadNotApproved: "raw-selector-payload-not-approved",
  rawEnginePayloadNotApproved: "raw-engine-payload-not-approved",
  rawProductRowsNotApproved: "raw-product-rows-not-approved",
  rawUsersNotApproved: "raw-users-not-approved",
  rawCrmNotApproved: "raw-crm-not-approved",
  rawContactDataNotApproved: "raw-contact-data-not-approved",
  privatePathReturnNotApproved: "private-path-return-not-approved",
  credentialReturnNotApproved: "credential-return-not-approved",
  selectedResultBodyNotApproved: "selected-result-body-not-approved",
  selectedResultPersistenceNotApproved: "selected-result-persistence-not-approved",
  runtimeDataMutationNotApproved: "runtime-data-mutation-not-approved",
  donorEngineInvocationNotApproved: "donor-engine-invocation-not-approved",
  runtableGenerationNotApproved: "runtable-generation-not-approved",
  iesGenerationNotApproved: "ies-generation-not-approved",
  hubspotWriteNotApproved: "hubspot-write-not-approved",
  projectWriteNotApproved: "project-write-not-approved",
  contactCreationNotApproved: "contact-creation-not-approved",
  routeOrPostEndpointNotApproved: "route-or-post-endpoint-not-approved",
  staleComparisonNotImplemented: "stale-comparison-not-implemented",
});

const FAIL = SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_FAIL_CLOSED_CODES;

const WRITE_DISABLED_SUMMARY = Object.freeze({
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  donorEngineInvocationEnabled: false,
  selectedResultPersistenceEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  routeCreationEnabled: false,
  postEndpointCreationEnabled: false,
  hubSpotWriteEnabled: false,
  projectWriteEnabled: false,
  contactCreationEnabled: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|\bControlStack(?:_Runtime|_RuntimeData)?[\\/])/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,520}$/;
const RAW_ARTEFACT_TEXT_PATTERN = /(?:data:[^\s]+;base64|\bbase64\b|\.pdf\b|\.ies\b|candela|photometry|photometric|polar\s*plot)/i;

const TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:rawSelectorPayloadReturned|rawSelectorPayloadExposed|selectorPayloadReturned|selectorPayloadExposed|payloadGenerationEnabled|downstreamPayloadActive|selectorPayloadReady|fullSelectorStateReturned)$/i, FAIL.rawSelectorPayloadNotApproved],
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|enginePayloadIncluded|enginePayloadReady|rawEngineResultReturned|rawEngineDebugReturned|engineResultReturned|debugPayloadReturned|donorDebugReturned)$/i, FAIL.rawEnginePayloadNotApproved],
  [/^(?:rawRowsReturned|rawRowsExposed|rawProductRowsReturned|rawProductRowsExposed|rawBoardRowsReturned|rawDriverRowsReturned|rawAccessoryRowsReturned|rawComponentRowsReturned|rawReservationGridReturned|rawCurveRowsReturned|rawSourceDbRowsReturned|rawBoardDataRowsExposed|rawProductDataRowsExposed)$/i, FAIL.rawProductRowsNotApproved],
  [/^(?:rawUsersReturned|rawUsersExposed|usersReturned|userRowsReturned|rawUserRowsReturned)$/i, FAIL.rawUsersNotApproved],
  [/^(?:rawCrmReturned|rawCRMReturned|rawCrmExposed|rawCRMExposed|rawHubSpotReturned|rawHubspotReturned|hubSpotPayloadReturned|hubspotPayloadReturned|rawCompanyReturned|companyPayloadReturned)$/i, FAIL.rawCrmNotApproved],
  [/^(?:rawContactsReturned|rawContactReturned|rawContactInputReturned|rawContactsExposed|contactPayloadReturned|rawContactDataReturned)$/i, FAIL.rawContactDataNotApproved],
  [/^(?:privatePathsReturned|privatePathsExposed|privatePathReturned|privatePathExposed|filenamesExposed|localPathsReturned)$/i, FAIL.privatePathReturnNotApproved],
  [/^(?:credentialsReturned|credentialsExposed|credentialReturned|secretReturned|tokenReturned|accessTokenReturned|apiKeyReturned)$/i, FAIL.credentialReturnNotApproved],
  [/^(?:selectedResultBodyReturned|selectedResultBodyExposed|selectedEngineResultReturned|rawSelectedPayloadExposed|rawSelectedPayloadReturned|rawSelectedResultReturned)$/i, FAIL.selectedResultBodyNotApproved],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled|selectedResultPersistenceAttempted|selectedResultIngestionEnabled|saveLoadActive|hiddenWriteBackEnabled)$/i, FAIL.selectedResultPersistenceNotApproved],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAuthority|boardDataMutationEnabled|authorityWritesActive|activeBuildMutationEnabled|buildMutationEnabled)$/i, FAIL.runtimeDataMutationNotApproved],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineCallsActive|engineExecutionEnabled|engineVerificationEnabled)$/i, FAIL.donorEngineInvocationNotApproved],
  [/^(?:runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableMutationEnabled|runTableIncluded|runTableReady)$/i, FAIL.runtableGenerationNotApproved],
  [/^(?:iesGenerated|iesGenerationEnabled|iesIncluded|iesReady|photometryGenerationAllowed|photometryGenerationEnabled|iesCallsActive)$/i, FAIL.iesGenerationNotApproved],
  [/^(?:hubSpotWriteEnabled|hubspotWriteEnabled|hubSpotWriteLive|hubspotWriteLive|hubSpotPushEnabled|hubSpotCrmWriteBackEnabled|hubspotCrmWriteBackEnabled)$/i, FAIL.hubspotWriteNotApproved],
  [/^(?:projectWriteEnabled|projectWritesEnabled|projectWriteLive|projectMutationEnabled|controlledRecordWriteEnabled|controlledRecordsWriteEnabled)$/i, FAIL.projectWriteNotApproved],
  [/^(?:contactCreationEnabled|contactCreationLive|createContactEnabled|contactWriteEnabled)$/i, FAIL.contactCreationNotApproved],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|routeCreationEnabled)$/i, FAIL.routeOrPostEndpointNotApproved],
  [/^(?:postEndpointsAdded|postEndpointAdded|postEndpointEnabled|postEndpointCreationEnabled)$/i, FAIL.routeOrPostEndpointNotApproved],
  [/^(?:staleComparisonEnabled|staleResultComparisonEnabled)$/i, FAIL.staleComparisonNotImplemented],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:selectorPayload|rawSelectorPayload|selectorEnginePayload|payloadDraft|fullSelectorState|selectorStateDump|donorSpec|fullDonorSpec|specBody|pass2|pass3|pass4|pass5|provenance)$/i, FAIL.rawSelectorPayloadNotApproved],
  [/^(?:enginePayload|rawEnginePayload|runEnginePayload|roughElectricalPayload|rawRoughElectricalPayload|donorPayload|rawDonorPayload|engineResult|rawEngineResult|engineDebug|rawEngineDebug|debug|rawDebug)$/i, FAIL.rawEnginePayloadNotApproved],
  [/^(?:PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|SYSTEM_POLICY|SYSTEM_COMPONENTS|rawRows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|rawComponentRows|productRows|boardRows|driverRows|accessoryRows|componentRows|rawReservationGrid|reservationGrid|reservedGrid|rawCurveRows|curveRows|sourceDbRows|boardDataRows)$/i, FAIL.rawProductRowsNotApproved],
  [/^(?:USERS|rawUsers|userRows|usersRows|rawUserRows)$/i, FAIL.rawUsersNotApproved],
  [/^(?:CRM|rawCrm|rawCRM|crmRows|hubSpotRows|hubspotRows|hubSpotPayload|hubspotPayload|hubSpotCompany|hubspotCompany|companyPayload|companyRows)$/i, FAIL.rawCrmNotApproved],
  [/^(?:CONTACTS|rawContacts|rawContact|contactRows|contactPayload|crmContacts|hubSpotContacts|hubspotContacts|hubspotContact|hubSpotContact)$/i, FAIL.rawContactDataNotApproved],
  [/^(?:credentials|credential|secret|secrets|token|tokens|accessToken|apiKey|apikey|password)$/i, FAIL.credentialReturnNotApproved],
  [/^(?:selectedResultBody|selectedResult|selectedEngineResult|selectedRunTableResult|acceptedEngineResult|acceptedSelectedResult|rawSelectedPayload|selectedPayload|rawSelectedResult)$/i, FAIL.selectedResultBodyNotApproved],
  [/^(?:generatedRunTable|runTable|runTableRows|runtableRows|rawRunTableRows|productionRunTable)$/i, FAIL.runtableGenerationNotApproved],
  [/^(?:generatedIes|ies|iesText|rawIesText|iesFile|photometry|photometryFile|candela|candelaGrid|rawCandelaGrid|pdf|pdfRef|base64|base64Artefact|base64Artifact|polarPlot)$/i, FAIL.iesGenerationNotApproved],
  [/^(?:hubSpotWriteback|hubspotWriteback|hubSpotWriteBackObject|hubspotWriteBackObject)$/i, FAIL.hubspotWriteNotApproved],
  [/^(?:projectWriteback|projectWriteBackObject|projectMutation|controlledRecordWriteback)$/i, FAIL.projectWriteNotApproved],
  [/^(?:contactCreation|contactWriteback|contactWriteBackObject)$/i, FAIL.contactCreationNotApproved],
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

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const value = source[key];
    if (!isBlank(value) && value !== false) return value;
  }
  return undefined;
}

function safeLabel(value, fallback = "redacted") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || EMAIL_PATTERN.test(raw) || RAW_ARTEFACT_TEXT_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 180) : fallback;
}

function safeToken(value, fallback = "") {
  const label = safeLabel(value, fallback);
  if (!label || label === fallback) return fallback;
  const token = label
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return token || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || EMAIL_PATTERN.test(raw) || RAW_ARTEFACT_TEXT_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 560);
  if (SAFE_FINGERPRINT_PATTERN.test(cleaned)) return cleaned;
  if (/^(?:sha1|sha256):[0-9a-f]{12,80}$/i.test(cleaned)) return cleaned;
  return "";
}

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function booleanValue(value, fallback = false) {
  if (value === true || value === false) return value;
  if (isBlank(value)) return fallback;
  const token = safeToken(value, "");
  if (["true", "yes", "1", "ready", "complete", "accepted", "available", "verified"].includes(token)) return true;
  if (["false", "no", "0", "blocked", "missing", "none", "not-ready"].includes(token)) return false;
  return fallback;
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return FAIL.privatePathReturnNotApproved;
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
      if (pattern.test(key) && nested === true) return blocker;
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

function sanitisePreviewValue(value, depth = 0) {
  if (depth > 5) return "redacted-depth-limit";
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") return safeLabel(value, "redacted");
  if (Array.isArray(value)) return value.slice(0, 40).map((entry) => sanitisePreviewValue(entry, depth + 1));
  if (!isPlainObject(value)) return null;

  const output = {};
  for (const [key, nested] of Object.entries(value).slice(0, 80)) {
    for (const [pattern] of RAW_KEY_BLOCKERS) {
      if (pattern.test(key)) {
        output[`${safeToken(key, "redacted") || "redacted"}Excluded`] = true;
        continue;
      }
    }
    output[key] = sanitisePreviewValue(nested, depth + 1);
  }
  return output;
}

function summaryFingerprint(summary, keys = []) {
  return safeFingerprint(firstPresent(summary, [
    ...keys,
    "sealedCandidateAssemblyPreviewFingerprint",
    "selectedResultProjectionFingerprint",
    "projectionFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ])) || null;
}

function validateSafeSummary(source, key, missingCode, unsafeCode, readyKey = null, fingerprintRequired = false) {
  const summary = source[key];
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: missingCode, diagnostic: `${key} is required as a safe summary object.` };
  }
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: `${key} contains forbidden raw payload, row, path, credential, write, or artefact markers.` };
  if (readyKey && summary[readyKey] !== true) {
    return { ok: false, blocker: unsafeCode, diagnostic: `${key}.${readyKey} must be true for safe envelope preview.` };
  }
  if (fingerprintRequired && !summaryFingerprint(summary, ["sealedCandidateAssemblyPreviewFingerprint"])) {
    return { ok: false, blocker: unsafeCode, diagnostic: `${key} must provide only a safe sealed candidate assembly preview fingerprint.` };
  }
  return { ok: true, summary };
}

function buildProjectIntentSummary(projectIntentContext = {}, safeWorkspaceContext = {}) {
  const project = isPlainObject(projectIntentContext) ? projectIntentContext : {};
  const workspace = isPlainObject(safeWorkspaceContext) ? safeWorkspaceContext : {};
  const projectRef = firstPresent(project, ["projectIntentRef", "safeProjectRef", "projectRef", "projectId"])
    ?? firstPresent(workspace, ["projectIntentRef", "safeProjectRef", "projectRef"]);
  return {
    previewOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    projectIntentStatus: safeToken(firstPresent(project, ["status", "state", "intentStatus"]), "draft-intent"),
    projectRef: safeToken(projectRef, "redacted-project-intent"),
    projectLabel: safeLabel(firstPresent(project, ["projectLabel", "titleLabel", "nameLabel"]), "redacted project"),
    clientLabel: safeLabel(firstPresent(project, ["clientLabel", "accountLabel", "customerLabel"]), "redacted client"),
    siteLabel: safeLabel(firstPresent(project, ["siteLabel", "locationLabel"]), "redacted site"),
    workspaceRole: safeToken(firstPresent(workspace, ["displayRole", "safeDisplayRole", "role"]), "external-user"),
    workspaceIdentityState: safeToken(firstPresent(workspace, ["identityState", "status"]), "redacted-identity"),
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    contactCreationEnabled: false,
  };
}

function normaliseSelectedValuesSummary(summary) {
  const selectedValues = isPlainObject(summary.selectedValues)
    ? summary.selectedValues
    : isPlainObject(summary.selection) ? summary.selection
      : isPlainObject(summary.effectiveSelection) ? summary.effectiveSelection
        : summary;
  const safeValues = {};
  for (const [key, value] of Object.entries(selectedValues).slice(0, 40)) {
    if (isPlainObject(value)) {
      safeValues[safeToken(key, "field")] = {
        value: safeLabel(firstPresent(value, ["value", "token", "key", "label", "valueLabel"]), "redacted"),
        provenance: safeToken(firstPresent(value, ["provenance", "source", "kind"]), "safe-summary"),
      };
    } else if (!["rawSelectorPayloadReturned", "rawProductRowsReturned", "rawUsersReturned"].includes(key)) {
      safeValues[safeToken(key, "field")] = safeLabel(value, "redacted");
    }
  }
  return {
    diagnosticOnly: true,
    readOnly: summary.readOnly !== false,
    previewOnly: summary.previewOnly !== false,
    status: safeToken(firstPresent(summary, ["status", "state"]), "safe-selected-values-summary"),
    selectedValueCount: Object.keys(safeValues).length,
    selectedValues: safeValues,
    provenancePreserved: isPlainObject(summary.provenanceSummary) || isPlainObject(summary.provenance) || Array.isArray(summary.provenanceRows),
    rawSelectorPayloadReturned: false,
    rawProductRowsReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
  };
}

function normaliseSelectedResultProjectionState(summary = {}) {
  const projection = isPlainObject(summary) ? summary : {};
  const state = safeToken(firstPresent(projection, ["state", "sourceState", "resultState"]), "no-selected-result").replace(/-/g, "_");
  return {
    diagnosticOnly: true,
    readOnly: true,
    displayOnly: true,
    state: state || "no_selected_result",
    sourceState: safeToken(firstPresent(projection, ["sourceState"]), "no-source").replace(/-/g, "_"),
    resultStateLabel: safeLabel(firstPresent(projection, ["resultStateLabel", "label"]), "Estimated preview"),
    selectedResultAvailable: booleanValue(firstPresent(projection, ["selectedResultAvailable", "available"]), false),
    engineVerified: booleanValue(firstPresent(projection, ["engineVerified"]), false),
    stale: booleanValue(firstPresent(projection, ["stale"]), false),
    accepted: booleanValue(firstPresent(projection, ["accepted"]), false),
    selectedResultProjectionFingerprint: summaryFingerprint(projection, ["selectedResultProjectionFingerprint", "projectionFingerprint"]),
    selectedResultBodyReturned: false,
    selectedResultPersistenceEnabled: false,
    rawSelectedPayloadReturned: false,
  };
}

function unsafeExclusionsVerified() {
  return {
    verified: true,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    selectedResultBodyReturned: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    contactCreationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}

function baseEnvelope(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return {
    schemaId: SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_ID,
    schemaVersion: SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_VERSION,
    state: ok ? "selector_safe_draft_project_intent_envelope_preview_ready" : "selector_safe_draft_project_intent_envelope_fail_closed",
    previewOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    ok,
    blocker,
    safeDraftProjectEnvelopePreviewReady: ok,
    envelopeFingerprint: extra.envelopeFingerprint || null,
    projectIntentSummary: extra.projectIntentSummary || null,
    safeSelectedValuesSummary: extra.safeSelectedValuesSummary || null,
    runIntakePreviewSummary: extra.runIntakePreviewSummary || null,
    runAccessoryPlacementIntentPreviewSummary: extra.runAccessoryPlacementIntentPreviewSummary || null,
    finishCascadeSummary: extra.finishCascadeSummary || null,
    timelineStatusSummary: extra.timelineStatusSummary || null,
    specialPartsEntitlementPreviewSummary: extra.specialPartsEntitlementPreviewSummary || null,
    sealedCandidateAssemblyPreviewFingerprint: extra.sealedCandidateAssemblyPreviewFingerprint || null,
    selectedResultProjectionState: extra.selectedResultProjectionState || null,
    staleComparisonEnabled: false,
    staleState: "not_compared_fail_closed",
    staleComparisonReason: "safe comparison is not implemented in this slice",
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    writeDisabledSummary: clonePlain(WRITE_DISABLED_SUMMARY),
    unsafeExclusionsVerified: unsafeExclusionsVerified(),
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics) ? [...extra.failClosedDiagnostics] : [],
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseEnvelope({
    ...extra,
    ok: false,
    blocker,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function policyFingerprintFrom(source) {
  return safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"])) || null;
}

function sourceFingerprintFrom(source) {
  return safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])) || null;
}

export function buildSelectorSafeDraftProjectEnvelopePreview(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const topSafety = unsafeBlocker({
    ...source,
    safeSelectedValuesSummary: undefined,
    selectorReferenceOptionsSummary: undefined,
    finishCascadeSummary: undefined,
    timelineStatusSummary: undefined,
    runIntakePreviewSummary: undefined,
    runAccessoryPlacementIntentPreviewSummary: undefined,
    specialPartsEntitlementPreviewSummary: undefined,
    sealedCandidateAssemblyPreviewSummary: undefined,
    selectedResultProjectionSummary: undefined,
    projectIntentContext: undefined,
    safeWorkspaceContext: undefined,
  });
  const policyFingerprint = policyFingerprintFrom(source);
  const sourceFingerprint = sourceFingerprintFrom(source);
  if (topSafety) {
    return failClosed(topSafety, "Top-level safe Selector draft/project envelope preview input contains forbidden unsafe markers.", {
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const selectedValidation = validateSafeSummary(
    source,
    "safeSelectedValuesSummary",
    FAIL.missingSafeSelectedValuesSummary,
    FAIL.unsafeSelectedValuesSummary,
  );
  if (!selectedValidation.ok) return failClosed(selectedValidation.blocker, selectedValidation.diagnostic, { policyFingerprint, sourceFingerprint });

  const runIntakeValidation = validateSafeSummary(
    source,
    "runIntakePreviewSummary",
    FAIL.missingRunIntakePreviewSummary,
    FAIL.unsafeRunIntakePreviewSummary,
    "runIntakePreviewReady",
  );
  if (!runIntakeValidation.ok) return failClosed(runIntakeValidation.blocker, runIntakeValidation.diagnostic, { policyFingerprint, sourceFingerprint });

  const accessoryValidation = validateSafeSummary(
    source,
    "runAccessoryPlacementIntentPreviewSummary",
    FAIL.missingRunAccessoryPlacementPreviewSummary,
    FAIL.unsafeRunAccessoryPlacementPreviewSummary,
    "runAccessoryPlacementPreviewReady",
  );
  if (!accessoryValidation.ok) return failClosed(accessoryValidation.blocker, accessoryValidation.diagnostic, { policyFingerprint, sourceFingerprint });

  const entitlementValidation = validateSafeSummary(
    source,
    "specialPartsEntitlementPreviewSummary",
    FAIL.missingSpecialPartsEntitlementPreviewSummary,
    FAIL.unsafeSpecialPartsEntitlementPreviewSummary,
    "specialPartsEntitlementPreviewReady",
  );
  if (!entitlementValidation.ok) return failClosed(entitlementValidation.blocker, entitlementValidation.diagnostic, { policyFingerprint, sourceFingerprint });

  const sealedValidation = validateSafeSummary(
    source,
    "sealedCandidateAssemblyPreviewSummary",
    FAIL.missingSealedCandidateAssemblyPreviewSummary,
    FAIL.unsafeSealedCandidateAssemblyPreviewSummary,
    "sealedCandidateAssemblyPreviewReady",
    true,
  );
  if (!sealedValidation.ok) return failClosed(sealedValidation.blocker, sealedValidation.diagnostic, { policyFingerprint, sourceFingerprint });

  for (const optionalKey of [
    "selectorReferenceOptionsSummary",
    "finishCascadeSummary",
    "timelineStatusSummary",
    "selectedResultProjectionSummary",
    "projectIntentContext",
    "safeWorkspaceContext",
  ]) {
    const value = source[optionalKey];
    if (value === undefined || value === null) continue;
    const unsafe = unsafeBlocker(value);
    if (unsafe) {
      return failClosed(unsafe, `${optionalKey} contains forbidden unsafe markers.`, { policyFingerprint, sourceFingerprint });
    }
  }

  const selectedResultProjectionState = normaliseSelectedResultProjectionState(source.selectedResultProjectionSummary);
  const sealedCandidateAssemblyPreviewFingerprint = summaryFingerprint(
    source.sealedCandidateAssemblyPreviewSummary,
    ["sealedCandidateAssemblyPreviewFingerprint"],
  );

  const projectIntentSummary = buildProjectIntentSummary(source.projectIntentContext, source.safeWorkspaceContext);
  const safeSelectedValuesSummary = normaliseSelectedValuesSummary(source.safeSelectedValuesSummary);
  const runIntakePreviewSummary = sanitisePreviewValue(source.runIntakePreviewSummary);
  const runAccessoryPlacementIntentPreviewSummary = sanitisePreviewValue(source.runAccessoryPlacementIntentPreviewSummary);
  const finishCascadeSummary = source.finishCascadeSummary ? sanitisePreviewValue(source.finishCascadeSummary) : null;
  const timelineStatusSummary = source.timelineStatusSummary ? sanitisePreviewValue(source.timelineStatusSummary) : null;
  const specialPartsEntitlementPreviewSummary = sanitisePreviewValue(source.specialPartsEntitlementPreviewSummary);

  const envelopeFingerprint = `safe-selector-draft-project-envelope:${stableSha1({
    schemaId: SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_ID,
    schemaVersion: SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_VERSION,
    policyFingerprint,
    sourceFingerprint,
    projectIntentSummary,
    safeSelectedValuesSummary,
    runCount: runIntakePreviewSummary?.runCount ?? null,
    accessoryIntentCount: runAccessoryPlacementIntentPreviewSummary?.accessoryIntentCount ?? null,
    specialPartsEntitlementStatus: specialPartsEntitlementPreviewSummary?.entitlementStatus ?? null,
    sealedCandidateAssemblyPreviewFingerprint,
    selectedResultProjectionState,
    staleState: "not_compared_fail_closed",
    writeDisabledSummary: WRITE_DISABLED_SUMMARY,
  })}`;

  return baseEnvelope({
    ok: true,
    envelopeFingerprint,
    projectIntentSummary,
    safeSelectedValuesSummary,
    runIntakePreviewSummary,
    runAccessoryPlacementIntentPreviewSummary,
    finishCascadeSummary,
    timelineStatusSummary,
    specialPartsEntitlementPreviewSummary,
    sealedCandidateAssemblyPreviewFingerprint,
    selectedResultProjectionState,
    policyFingerprint,
    sourceFingerprint,
    failClosedDiagnostics: [FAIL.staleComparisonNotImplemented],
  });
}
