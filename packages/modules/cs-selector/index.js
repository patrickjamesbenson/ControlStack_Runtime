import { createSelectorContractAdapter } from "./selectorContractAdapter.js";
import {
  SELECTOR_PROJECT_ENVELOPE_CONTRIBUTION_STATUS,
  SELECTOR_TEST_CASE_STORAGE_KEY,
  createSelectorProjectEnvelopeContribution,
  createSelectorState,
  sanitiseSelectorTestCase,
  validateSelectorProjectEnvelopeState,
} from "./selectorState.js";
import { renderSelectorView } from "./selectorView.js";
import { createSelectorViewModel } from "./selectorViewModel.js";

const SELECTOR_REFERENCE_STATUS_ENDPOINT = "/api/selector-reference/status";
const SELECTOR_REFERENCE_OPTIONS_ENDPOINT = "/api/selector-reference/options";
const SELECTOR_TEST_CASE_LEGACY_STORAGE_KEYS = Object.freeze([
  "controlstack.cs-selector.local-test-case.v1",
]);

const SELECTOR_TIMELINE_VISIBILITY_MODES = Object.freeze({
  EXTERNAL_DEFAULT: "external-default",
  INTERNAL_ASOF_TEST: "internal-asof-test",
});

const SELECTOR_OPTION_CONSTRAINT_KEYS = Object.freeze([
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
  "finishCover",
  "finishEnd",
  "finishFlex",
  "egressLight",
  "egressSound",
  "accessories",
  "specialPartsEntitlement",
  "specialPartsOptIn",
  "userEntitlementStatus",
]);

const SAFE_SELECTOR_REFERENCE_STATUS_BASE = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  sourceStatusReadOnly: true,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  rawLabEvidenceExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  boardDataWriteEnabled: false,
  materialiserWriteEnabled: false,
  materialiserRefreshEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  selectorResolvingEnabled: false,
  activeResolverEnabled: false,
  selectorMutationEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  iesGenerationEnabled: false,
  labProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  runtimeDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
});

function initialSelectorReferenceStatus() {
  return {
    status: "not-requested",
    endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
    ...SAFE_SELECTOR_REFERENCE_STATUS_BASE,
  };
}

function initialSelectorReferenceOptionsStatus() {
  return {
    ok: null,
    status: "not-requested",
    endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
    constraintQuery: "",
    constraintFingerprint: selectorConstraintFingerprintFromQuery(""),
    sourceInputFingerprint: "",
    boardDataSourceVersion: "",
    sourceVersionBinding: {
      sourceInputFingerprint: "",
      boardDataSourceVersion: "",
      bindingStatus: "source-version-unbound",
      optionSetsBound: false,
      selectedValuesBound: false,
      staleRevalidationEnabled: true,
      staleValuesBecomeDiagnosticUnmapped: true,
      staleValuesInsertedIntoOptions: false,
      readOnly: true,
      diagnosticOnly: true,
      writes: false,
      rawRowsExposed: false,
    },
    sourceVersionBindingMatched: true,
    staleSourceVersionBinding: false,
    fields: [],
    workflowSections: [],
    candidateSummary: {
      state: "not requested",
      optionFieldCount: 0,
      availableFieldCount: 0,
      manualConstraintCount: 0,
      autoConsequenceCount: 0,
      blockedCount: 0,
      specGateComplete: false,
      labProof: false,
      writesEnabled: false,
    },
    readOnly: true,
    diagnosticOnly: true,
    optionFilteringReadOnly: true,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
}

let mountedContainer = null;
let mountedServices = null;
let mountedContext = null;
let selectorState = null;
let selectorAdapter = null;
let selectorReferenceStatus = initialSelectorReferenceStatus();
let selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
let latestSelectorViewModel = null;
let selectorReferenceRequestId = 0;
let selectorReferenceOptionsRequestId = 0;

function selectorOptionsPayloadHasUsableStructure(payload = {}) {
  const fields = Array.isArray(payload?.fields) ? payload.fields : [];
  const workflowSections = Array.isArray(payload?.workflowSections) ? payload.workflowSections : [];
  return fields.length > 0
    || workflowSections.some((section) => Array.isArray(section?.fields) && section.fields.length > 0);
}

function selectorOptionsPayloadConstraintFingerprint(payload = {}) {
  const explicitFingerprint = String(payload?.constraintFingerprint || "").trim();
  if (explicitFingerprint) return explicitFingerprint;
  return selectorConstraintFingerprintFromQuery(payload?.constraintQuery || "");
}

function selectorOptionsLoadingProjection(payload = {}, activeSignature = currentSelectorOptionConstraintSignature()) {
  const sourceVersionIdentity = selectorSourceVersionIdentity(payload);
  return resolveSelectorReferenceOptionsStatus(
    payload,
    {
      ok: null,
      status: "loading",
      endpoint: payload?.endpoint || SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
      constraintQuery: activeSignature.constraintQuery,
      constraintFingerprint: activeSignature.constraintFingerprint,
      sourceReady: payload?.sourceReady,
      source: payload?.source,
      sourceReadiness: payload?.sourceReadiness,
      safeSnapshotState: payload?.safeSnapshotState,
      referenceOptionSourceCoverage: payload?.referenceOptionSourceCoverage,
      futureMappedFieldExplanation: payload?.futureMappedFieldExplanation,
      sourceInputFingerprint: sourceVersionIdentity.sourceInputFingerprint,
      boardDataSourceVersion: sourceVersionIdentity.boardDataSourceVersion,
      sourceVersionBinding: payload?.sourceVersionBinding,
      candidateSummary: {
        ...(payload?.candidateSummary || {}),
        state: "loading",
        specGateComplete: false,
        labProof: false,
        writesEnabled: false,
      },
      warnings: ["Selector reference options are loading."],
    },
    activeSignature.constraintFingerprint,
    activeSignature.constraintQuery
  );
}

function activeSelectorOptionsPayload() {
  const activeSignature = currentSelectorOptionConstraintSignature();
  const standalonePayload = selectorReferenceOptionsStatus;
  const statusBackedPayload = selectorReferenceStatus.selectorOptions || null;
  const standaloneUsable = selectorOptionsPayloadHasUsableStructure(standalonePayload);
  const statusBackedUsable = selectorOptionsPayloadHasUsableStructure(statusBackedPayload);

  if (standalonePayload.status === "loading" && !standaloneUsable && statusBackedUsable) {
    return selectorOptionsLoadingProjection(statusBackedPayload, activeSignature);
  }

  const payload = standaloneUsable
    ? standalonePayload
    : statusBackedUsable
      ? statusBackedPayload
      : standalonePayload.status !== "not-requested"
        ? standalonePayload
        : statusBackedPayload || standalonePayload;
  const payloadFingerprint = selectorOptionsPayloadConstraintFingerprint(payload);
  if (payloadFingerprint !== activeSignature.constraintFingerprint) {
    return selectorOptionsLoadingProjection(payload, activeSignature);
  }
  return payload;
}

function selectorViewportElement() {
  return mountedContainer?.closest?.(".cs-shell__main") || document.scrollingElement || document.documentElement;
}

function captureSelectorViewportState() {
  const scroller = selectorViewportElement();
  const active = document.activeElement instanceof HTMLElement && mountedContainer?.contains(document.activeElement)
    ? document.activeElement
    : null;
  return {
    scrollTop: scroller?.scrollTop ?? 0,
    scrollLeft: scroller?.scrollLeft ?? 0,
    activeId: active?.id || "",
    activeFieldKey: active?.dataset?.fieldKey || "",
    activeTagName: active?.tagName || "",
  };
}

function selectorCssEscape(value = "") {
  if (globalThis.CSS && typeof globalThis.CSS.escape === "function") return globalThis.CSS.escape(String(value));
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function restoreSelectorViewportState(state = {}) {
  const scroller = selectorViewportElement();
  if (scroller) {
    scroller.scrollTop = state.scrollTop || 0;
    scroller.scrollLeft = state.scrollLeft || 0;
  }
  const focusTarget = state.activeFieldKey
    ? mountedContainer?.querySelector?.(`[data-field-key="${selectorCssEscape(state.activeFieldKey)}"]`)
    : state.activeId
      ? mountedContainer?.querySelector?.(`#${selectorCssEscape(state.activeId)}`)
      : null;
  if (focusTarget instanceof HTMLElement && typeof focusTarget.focus === "function") {
    try {
      focusTarget.focus({ preventScroll: true });
    } catch {
      focusTarget.focus();
      if (scroller) {
        scroller.scrollTop = state.scrollTop || 0;
        scroller.scrollLeft = state.scrollLeft || 0;
      }
    }
  }
}

function renderCurrentView({ preserveViewport = true } = {}) {
  if (!mountedContainer || !selectorState || !selectorAdapter) return;
  const viewportState = preserveViewport ? captureSelectorViewportState() : null;
  const viewModel = createSelectorViewModel({
    adapter: selectorAdapter,
    selectorState,
    selectorReferenceStatus: {
      ...selectorReferenceStatus,
      selectorOptions: activeSelectorOptionsPayload(),
    },
    onLocalStateChange: handleSelectorLocalStateChange,
    selectorTestCaseActions: {
      saveCurrentTestCase: saveCurrentSelectorTestCase,
      recallSavedTestCase: recallSavedSelectorTestCase,
      clearSavedTestCase: clearSavedSelectorTestCase,
    },
  });
  latestSelectorViewModel = viewModel;
  renderSelectorView(mountedContainer, viewModel);
  if (viewportState) {
    restoreSelectorViewportState(viewportState);
    requestAnimationFrame(() => restoreSelectorViewportState(viewportState));
  }
}

function renderSelectorHydrationFallback(reason = "Selector state could not be restored.") {
  if (!mountedContainer) return;
  while (mountedContainer.firstChild) mountedContainer.removeChild(mountedContainer.firstChild);
  const surface = document.createElement("section");
  surface.className = "cs-selector__hydrate-fallback";
  const heading = document.createElement("h2");
  heading.textContent = "Selector";
  const message = document.createElement("p");
  message.setAttribute("role", "status");
  message.textContent = `${reason} A safe visible Selector surface was retained.`;
  surface.append(heading, message);
  mountedContainer.appendChild(surface);
}

function ensureVisibleSelectorSurface(reason = "Selector hydration failed.") {
  try {
    if (!selectorState) selectorState = createSelectorState();
    if (!selectorAdapter && mountedServices && mountedContext) {
      selectorAdapter = createSelectorContractAdapter({ services: mountedServices, context: mountedContext });
    }
    renderCurrentView({ preserveViewport: false });
    if (!mountedContainer?.firstChild) renderSelectorHydrationFallback(reason);
  } catch (error) {
    renderSelectorHydrationFallback(`${reason} ${error?.message || "Render recovery failed."}`);
  }
}

function selectorHydrationProjectIdentity(context = {}) {
  return {
    projectId: String(context.project?.metadata?.projectId || context.project?.currentProject?.projectId || "").trim(),
    envelopeId: String(context.project?.metadata?.restoredEnvelopeId || context.project?.selection?.restoredEnvelopeId || "").trim(),
  };
}

function validateSelectorHydrationPayload(hydrationPayload = {}, context = {}) {
  if (!hydrationPayload || typeof hydrationPayload !== "object" || Array.isArray(hydrationPayload)) {
    return { valid: false, status: "missing-selector-hydration-payload", reason: "Selector hydration payload is missing." };
  }
  if (hydrationPayload.moduleId !== "cs_selector" || hydrationPayload.payload?.moduleId !== "cs_selector") {
    return { valid: false, status: "selector-module-id-mismatch", reason: "Selector hydration payload moduleId is not cs_selector." };
  }
  if (!hydrationPayload.sourceEnvelopeId || !hydrationPayload.sourceProjectId) {
    return { valid: false, status: "selector-source-identity-missing", reason: "Selector hydration payload source identity is missing." };
  }
  const identity = selectorHydrationProjectIdentity(context);
  if (identity.projectId !== hydrationPayload.sourceProjectId || identity.envelopeId !== hydrationPayload.sourceEnvelopeId) {
    return { valid: false, status: "stale-selector-source-identity", reason: "Selector hydration payload does not match the restored shell project identity." };
  }
  if (hydrationPayload.payloadAvailable !== true
    || hydrationPayload.payload?.status !== SELECTOR_PROJECT_ENVELOPE_CONTRIBUTION_STATUS) {
    return { valid: false, status: "empty-selector-hydration-state", reason: "Selector Project-envelope state is missing or empty." };
  }
  const stateValidation = validateSelectorProjectEnvelopeState(hydrationPayload.payload?.state);
  if (!stateValidation.valid) {
    return { valid: false, status: "invalid-selector-hydration-state", reason: stateValidation.reason };
  }
  return { valid: true, state: stateValidation.state };
}

function selectorRestoredConstraintsValidation(optionsStatus = {}, restoredState = {}) {
  if (optionsStatus?.ok !== true || !Array.isArray(optionsStatus.fields)) {
    return {
      valid: false,
      status: "selector-source-options-unavailable",
      reason: "Current source-backed Selector options could not be loaded for restore validation.",
    };
  }
  const fields = new Map(optionsStatus.fields.map((field) => [String(field?.fieldKey || ""), field]));
  const staleFields = [];
  for (const [fieldKey, constraint] of Object.entries(restoredState.manualConstraints || {})) {
    const field = fields.get(fieldKey);
    const selectedValue = String(field?.selectedValue || "").trim();
    const selectedValueStatus = String(field?.selectedValueStatus || "").trim();
    const optionSelected = Array.isArray(field?.options)
      && field.options.some((option) => option?.value === constraint.value && option?.selected === true);
    if (!field
      || selectedValue !== constraint.value
      || selectedValueStatus === "diagnostic_unmapped"
      || (!selectedValueStatus && !optionSelected)) {
      staleFields.push(fieldKey);
    }
  }
  if (staleFields.length) {
    return {
      valid: false,
      status: "stale-selector-hydration-state",
      reason: `Restored Selector constraints are stale or unavailable: ${staleFields.join(", ")}.`,
      staleFields,
    };
  }
  return { valid: true, staleFields: [] };
}

function failSelectorHydration(status, reason) {
  ensureVisibleSelectorSurface(reason);
  mountedServices?.eventBus?.emit("selector:hydrate-failed", {
    moduleId: "cs_selector",
    status,
    reason,
  });
  return {
    accepted: false,
    moduleId: "cs_selector",
    status,
    reason,
  };
}

function handleSelectorLocalStateChange() {
  loadSelectorReferenceOptions();
}

function selectorTestCaseStorage() {
  try {
    const storage = globalThis.localStorage;
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function" || typeof storage.removeItem !== "function") return null;
    return storage;
  } catch {
    return null;
  }
}

function readStoredSelectorTestCase() {
  const storage = selectorTestCaseStorage();
  if (!storage) return null;
  const raw = storage.getItem(SELECTOR_TEST_CASE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return sanitiseSelectorTestCase(JSON.parse(raw));
  } catch {
    return null;
  }
}

function syncStoredSelectorTestCaseSummary(status = "saved-test-case-available") {
  selectorState?.setSavedSelectorTestCaseSummary?.(readStoredSelectorTestCase(), status);
}

function saveCurrentSelectorTestCase() {
  if (!selectorState) return;
  const testCase = selectorState.captureSelectorTestCase?.() || sanitiseSelectorTestCase({});
  const storage = selectorTestCaseStorage();
  if (storage) storage.setItem(SELECTOR_TEST_CASE_STORAGE_KEY, JSON.stringify(testCase));
  selectorState.recordSelectorTestCaseSave?.(testCase);
  renderCurrentView();
}

function recallSavedSelectorTestCase() {
  if (!selectorState) return;
  const saved = readStoredSelectorTestCase();
  if (!saved) {
    selectorState.setSavedSelectorTestCaseSummary?.(null, "no-saved-test-case");
    renderCurrentView();
    return;
  }
  selectorState.recallSelectorTestCase?.(saved);
  loadSelectorReferenceOptions();
}

function clearSavedSelectorTestCase() {
  const storage = selectorTestCaseStorage();
  if (storage) {
    storage.removeItem(SELECTOR_TEST_CASE_STORAGE_KEY);
    for (const legacyKey of SELECTOR_TEST_CASE_LEGACY_STORAGE_KEYS) {
      storage.removeItem(legacyKey);
    }
  }
  selectorState?.clearSavedSelectorTestCaseSummary?.();
  renderCurrentView();
}

function applySelectorReferenceStatus(nextStatus) {
  selectorReferenceStatus = {
    ...nextStatus,
    endpoint: nextStatus?.endpoint || SELECTOR_REFERENCE_STATUS_ENDPOINT,
    ...SAFE_SELECTOR_REFERENCE_STATUS_BASE,
  };
  renderCurrentView();
}

function safeConstraintValue(record) {
  return String(record?.value || "").trim();
}

function normaliseSelectorConstraintParams(query = "") {
  const rawQuery = String(query || "").trim().replace(/^\?/, "");
  const params = new URLSearchParams(rawQuery);
  const ordered = new URLSearchParams();
  for (const key of SELECTOR_OPTION_CONSTRAINT_KEYS) {
    const value = String(params.get(key) || "").trim();
    if (value) ordered.set(key, value);
  }
  const mode = String(params.get("timelineVisibilityMode") || "").trim();
  if (mode === SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST) {
    ordered.set("timelineVisibilityMode", mode);
    const asOfDate = String(params.get("timelineAsOfDate") || "").trim();
    if (asOfDate) ordered.set("timelineAsOfDate", asOfDate);
    const statuses = [
      ...params.getAll("timelineVisibleStatus"),
      ...String(params.get("timelineVisibleStatuses") || "").split(/[;,|]/),
    ].map((value) => String(value || "").trim()).filter(Boolean);
    if (statuses.length) ordered.set("timelineVisibleStatuses", [...new Set(statuses)].join(","));
  }
  const specialPartsTestPrincipal = String(params.get("specialPartsTestPrincipal") || "").trim();
  if (specialPartsTestPrincipal) {
    ordered.set("specialPartsTestPrincipal", specialPartsTestPrincipal);
    const showSpecialParts = String(params.get("showSpecialParts") || params.get("specialPartsTestShow") || "").trim().toLowerCase();
    if (["1", "true", "yes", "on", "show", "visible"].includes(showSpecialParts)) ordered.set("showSpecialParts", "1");
  }
  return ordered.toString();
}

export function selectorConstraintFingerprintFromQuery(query = "") {
  const normalised = normaliseSelectorConstraintParams(query);
  return normalised ? `selector-options:${normalised}` : "selector-options:unconstrained";
}

export function selectorOptionConstraintQueryFromConstraints(constraints = {}) {
  const params = new URLSearchParams();
  for (const key of SELECTOR_OPTION_CONSTRAINT_KEYS) {
    const value = safeConstraintValue(constraints[key]);
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function appendSelectorTimelineQueryParams(params, timelineStatusTest = {}) {
  if (timelineStatusTest?.timelineVisibilityMode !== SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST) return;
  params.set("timelineVisibilityMode", SELECTOR_TIMELINE_VISIBILITY_MODES.INTERNAL_ASOF_TEST);
  const asOfDate = String(timelineStatusTest.timelineAsOfDate || "").trim();
  if (asOfDate) params.set("timelineAsOfDate", asOfDate);
  const statuses = Array.isArray(timelineStatusTest.timelineVisibleStatuses) ? timelineStatusTest.timelineVisibleStatuses : [];
  if (statuses.length) params.set("timelineVisibleStatuses", [...new Set(statuses.map((status) => String(status || "").trim()).filter(Boolean))].join(","));
}

function appendSelectorSpecialPartsUserTestQueryParams(params, specialPartsUserTest = {}) {
  const principal = String(specialPartsUserTest.testPrincipal || specialPartsUserTest.activeTestPrincipal || "").trim();
  if (!principal) return;
  params.set("specialPartsTestPrincipal", principal);
  if (specialPartsUserTest.showEntitlementBackedSpecialParts === true || specialPartsUserTest.showSpecialParts === true) {
    params.set("showSpecialParts", "1");
  }
}

function selectorOptionQueryFromSnapshot(snapshot = {}) {
  const rawConstraintQuery = selectorOptionConstraintQueryFromConstraints(snapshot.dbBackedSelector?.manualConstraints || {});
  const params = new URLSearchParams(String(rawConstraintQuery || "").replace(/^\?/, ""));
  appendSelectorTimelineQueryParams(params, snapshot.timelineStatusTest || {});
  appendSelectorSpecialPartsUserTestQueryParams(params, snapshot.specialPartsUserTest || {});
  const query = normaliseSelectorConstraintParams(params.toString());
  return query ? `?${query}` : "";
}

function selectorOptionConstraintQuery() {
  const snapshot = selectorState?.getSnapshot?.() || {};
  return selectorOptionQueryFromSnapshot(snapshot);
}

function currentSelectorOptionConstraintSignature() {
  const constraintQuery = selectorOptionConstraintQuery();
  return {
    constraintQuery,
    constraintFingerprint: selectorConstraintFingerprintFromQuery(constraintQuery),
  };
}

function safeSourceVersionIdentityValue(value = "") {
  return String(value ?? "").trim();
}

function selectorSourceVersionIdentity(status = {}) {
  const payload = status?.selectorOptions || status?.options || status || {};
  const binding = payload.sourceVersionBinding || {};
  return {
    sourceInputFingerprint: safeSourceVersionIdentityValue(payload.sourceInputFingerprint || binding.sourceInputFingerprint || payload.sourceInputFingerprintMetadata?.value || ""),
    boardDataSourceVersion: safeSourceVersionIdentityValue(payload.boardDataSourceVersion || binding.boardDataSourceVersion || payload.boardDataSourceVersionMetadata?.value || ""),
  };
}

function selectorSourceVersionIdentityBound(identity = {}) {
  return Boolean(identity.sourceInputFingerprint && identity.boardDataSourceVersion);
}

function selectorSourceVersionsMatch(left = {}, right = {}) {
  const leftBound = selectorSourceVersionIdentityBound(left);
  const rightBound = selectorSourceVersionIdentityBound(right);
  if (!leftBound || !rightBound) return true;
  return left.sourceInputFingerprint === right.sourceInputFingerprint
    && left.boardDataSourceVersion === right.boardDataSourceVersion;
}

function selectorSourceVersionBindingPayload(identity = {}, binding = {}) {
  const sourceInputFingerprint = safeSourceVersionIdentityValue(identity.sourceInputFingerprint || binding.sourceInputFingerprint || "");
  const boardDataSourceVersion = safeSourceVersionIdentityValue(identity.boardDataSourceVersion || binding.boardDataSourceVersion || "");
  const bound = Boolean(sourceInputFingerprint && boardDataSourceVersion);
  return {
    ...binding,
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

export function selectorReferenceOptionsResponseIsCurrent({
  requestId = 0,
  activeRequestId = 0,
  responseConstraintFingerprint = "",
  activeConstraintFingerprint = "",
  responseSourceInputFingerprint = "",
  activeSourceInputFingerprint = "",
  responseBoardDataSourceVersion = "",
  activeBoardDataSourceVersion = "",
  mounted = true,
} = {}) {
  const activeSourceInput = safeSourceVersionIdentityValue(activeSourceInputFingerprint);
  const activeBoardVersion = safeSourceVersionIdentityValue(activeBoardDataSourceVersion);
  const sourceInputMatches = !activeSourceInput || safeSourceVersionIdentityValue(responseSourceInputFingerprint) === activeSourceInput;
  const boardVersionMatches = !activeBoardVersion || safeSourceVersionIdentityValue(responseBoardDataSourceVersion) === activeBoardVersion;
  return mounted === true
    && requestId === activeRequestId
    && String(responseConstraintFingerprint || "") === String(activeConstraintFingerprint || "")
    && sourceInputMatches
    && boardVersionMatches;
}

export function resolveSelectorReferenceOptionsStatus(
  currentStatus = initialSelectorReferenceOptionsStatus(),
  nextStatus = {},
  activeConstraintFingerprint = selectorConstraintFingerprintFromQuery(""),
  activeConstraintQuery = ""
) {
  const base = initialSelectorReferenceOptionsStatus();
  const previousFields = Array.isArray(currentStatus?.fields) ? currentStatus.fields : [];
  const previousWorkflowSections = Array.isArray(currentStatus?.workflowSections) ? currentStatus.workflowSections : [];
  const previousFingerprint = String(currentStatus?.constraintFingerprint || "");
  const incomingFingerprint = String(nextStatus?.constraintFingerprint || activeConstraintFingerprint || selectorConstraintFingerprintFromQuery(activeConstraintQuery));
  const incomingQuery = typeof nextStatus?.constraintQuery === "string" ? nextStatus.constraintQuery : activeConstraintQuery;
  const sameConstraintFingerprint = Boolean(previousFingerprint && incomingFingerprint && previousFingerprint === incomingFingerprint);
  const previousSourceVersionIdentity = selectorSourceVersionIdentity(currentStatus);
  const incomingSourceVersionIdentity = selectorSourceVersionIdentity(nextStatus);
  const sameSourceVersionBinding = selectorSourceVersionsMatch(previousSourceVersionIdentity, incomingSourceVersionIdentity);
  const sameReusablePayload = sameConstraintFingerprint && sameSourceVersionBinding;
  const activeSourceVersionIdentity = incomingSourceVersionIdentity.sourceInputFingerprint || incomingSourceVersionIdentity.boardDataSourceVersion
    ? incomingSourceVersionIdentity
    : sameReusablePayload ? previousSourceVersionIdentity : { sourceInputFingerprint: "", boardDataSourceVersion: "" };
  const activeSourceVersionBinding = selectorSourceVersionBindingPayload(activeSourceVersionIdentity, nextStatus?.sourceVersionBinding || (sameReusablePayload ? currentStatus?.sourceVersionBinding : {}));
  const loadingWithPreviousPayload = nextStatus?.status === "loading" && !Array.isArray(nextStatus?.fields) && previousFields.length > 0;
  const stripSelectedState = (field = {}) => ({
    ...field,
    selectedValue: "",
    selectedLabel: "",
    options: Array.isArray(field.options) ? field.options.map((option) => ({ ...option, selected: false })) : field.options,
    incompatibleOptions: Array.isArray(field.incompatibleOptions) ? field.incompatibleOptions.map((option) => ({ ...option, selected: false })) : field.incompatibleOptions,
  });
  const fieldsFromCurrentPayload = Array.isArray(nextStatus?.fields)
    ? nextStatus.fields
    : loadingWithPreviousPayload
      ? previousFields.map(stripSelectedState)
      : sameReusablePayload
        ? previousFields
        : [];
  const workflowSectionsFromCurrentPayload = Array.isArray(nextStatus?.workflowSections)
    ? nextStatus.workflowSections
    : loadingWithPreviousPayload
      ? previousWorkflowSections.map((section) => ({
        ...section,
        fields: Array.isArray(section.fields) ? section.fields.map(stripSelectedState) : section.fields,
      }))
      : sameReusablePayload
        ? previousWorkflowSections
        : [];
  const stalePreviousFieldsCount = sameReusablePayload ? 0 : previousFields.length;
  const stalePreviousWorkflowSectionCount = sameReusablePayload ? 0 : previousWorkflowSections.length;
  const candidateSummary = nextStatus?.candidateSummary || (nextStatus?.status === "loading"
    ? {
      ...(sameReusablePayload ? currentStatus?.candidateSummary : base.candidateSummary),
      state: "loading",
      specGateComplete: false,
      labProof: false,
      writesEnabled: false,
    }
    : sameReusablePayload ? currentStatus?.candidateSummary : base.candidateSummary);

  return {
    ...base,
    ...nextStatus,
    endpoint: nextStatus?.endpoint || SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
    constraintQuery: incomingQuery || "",
    constraintFingerprint: incomingFingerprint,
    sourceInputFingerprint: activeSourceVersionBinding.sourceInputFingerprint,
    boardDataSourceVersion: activeSourceVersionBinding.boardDataSourceVersion,
    sourceVersionBinding: activeSourceVersionBinding,
    sourceVersionBindingMatched: sameSourceVersionBinding,
    staleSourceVersionBinding: sameConstraintFingerprint && !sameSourceVersionBinding,
    fields: fieldsFromCurrentPayload,
    workflowSections: workflowSectionsFromCurrentPayload,
    candidateSummary,
    previousFieldsReused: !Array.isArray(nextStatus?.fields) && (sameReusablePayload || loadingWithPreviousPayload) && previousFields.length > 0,
    previousWorkflowSectionsReused: !Array.isArray(nextStatus?.workflowSections) && (sameReusablePayload || loadingWithPreviousPayload) && previousWorkflowSections.length > 0,
    loadingPreviousFieldsRetained: loadingWithPreviousPayload,
    stalePreviousFieldsCount,
    stalePreviousWorkflowSectionCount,
    stalePreviousPayloadRetainedForDiagnostics: false,
    readOnly: true,
    diagnosticOnly: true,
    optionFilteringReadOnly: true,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
}

function applySelectorReferenceOptionsStatus(nextStatus, activeSignature = currentSelectorOptionConstraintSignature()) {
  selectorReferenceOptionsStatus = resolveSelectorReferenceOptionsStatus(
    selectorReferenceOptionsStatus,
    nextStatus,
    activeSignature.constraintFingerprint,
    activeSignature.constraintQuery
  );
  renderCurrentView();
}

async function loadSelectorReferenceOptions() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    applySelectorReferenceOptionsStatus({
      ok: false,
      status: "fetch-unavailable",
      endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
      warnings: ["Browser fetch is unavailable; Selector reference options could not be read."],
    });
    return selectorReferenceOptionsStatus;
  }

  const activeSignature = currentSelectorOptionConstraintSignature();
  const requestId = selectorReferenceOptionsRequestId + 1;
  selectorReferenceOptionsRequestId = requestId;
  applySelectorReferenceOptionsStatus({
    ok: null,
    status: "loading",
    endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
    constraintQuery: activeSignature.constraintQuery,
    constraintFingerprint: activeSignature.constraintFingerprint,
    warnings: ["Selector reference options are loading."],
  }, activeSignature);

  try {
    const endpoint = `${SELECTOR_REFERENCE_OPTIONS_ENDPOINT}${activeSignature.constraintQuery}`;
    const response = await fetchImpl(endpoint, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    const currentSignature = currentSelectorOptionConstraintSignature();
    const responseConstraintFingerprint = String(payload?.constraintFingerprint || activeSignature.constraintFingerprint);
    if (!selectorReferenceOptionsResponseIsCurrent({
      requestId,
      activeRequestId: selectorReferenceOptionsRequestId,
      responseConstraintFingerprint,
      activeConstraintFingerprint: currentSignature.constraintFingerprint,
      mounted: Boolean(mountedContainer),
    })) return selectorReferenceOptionsStatus;
    applySelectorReferenceOptionsStatus({
      ...payload,
      ok: response.ok && payload?.ok !== false,
      httpStatus: response.status,
      status: payload?.ok === false ? "unavailable" : payload?.status || "loaded",
      constraintQuery: currentSignature.constraintQuery,
      constraintFingerprint: responseConstraintFingerprint,
    }, currentSignature);
    return selectorReferenceOptionsStatus;
  } catch (error) {
    const currentSignature = currentSelectorOptionConstraintSignature();
    if (!selectorReferenceOptionsResponseIsCurrent({
      requestId,
      activeRequestId: selectorReferenceOptionsRequestId,
      responseConstraintFingerprint: activeSignature.constraintFingerprint,
      activeConstraintFingerprint: currentSignature.constraintFingerprint,
      mounted: Boolean(mountedContainer),
    })) return selectorReferenceOptionsStatus;
    applySelectorReferenceOptionsStatus({
      ok: false,
      status: "fetch-failed",
      endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
      constraintQuery: currentSignature.constraintQuery,
      constraintFingerprint: currentSignature.constraintFingerprint,
      warnings: [`Selector reference options request failed: ${error?.message || "unknown error"}.`],
    }, currentSignature);
    return selectorReferenceOptionsStatus;
  }
}

async function loadSelectorReferenceStatus() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    applySelectorReferenceStatus({
      ok: false,
      status: "fetch-unavailable",
      endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
      warnings: ["Browser fetch is unavailable; Selector reference snapshot status could not be read."],
    });
    return;
  }

  const requestId = selectorReferenceRequestId + 1;
  selectorReferenceRequestId = requestId;
  applySelectorReferenceStatus({
    ok: null,
    status: "loading",
    endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
    warnings: ["Selector reference snapshot status is loading."],
  });

  try {
    const response = await fetchImpl(SELECTOR_REFERENCE_STATUS_ENDPOINT, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    if (requestId !== selectorReferenceRequestId || !mountedContainer) return;
    applySelectorReferenceStatus({
      ...payload,
      ok: response.ok && payload?.ok !== false,
      httpStatus: response.status,
      status: payload?.ok === false ? "unavailable" : "loaded",
    });
  } catch (error) {
    if (requestId !== selectorReferenceRequestId || !mountedContainer) return;
    applySelectorReferenceStatus({
      ok: false,
      status: "fetch-failed",
      endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
      warnings: [`Selector reference snapshot status request failed: ${error?.message || "unknown error"}.`],
    });
  }
}

export const csSelectorModule = {
  moduleId: "cs_selector",

  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("cs_selector requires an HTMLElement container");
    }

    mountedContainer = container;
    mountedServices = services;
    mountedContext = context;
    selectorState = createSelectorState();
    syncStoredSelectorTestCaseSummary();
    selectorAdapter = createSelectorContractAdapter({ services, context });
    selectorReferenceStatus = initialSelectorReferenceStatus();
    selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
    renderCurrentView();
    loadSelectorReferenceStatus();
    loadSelectorReferenceOptions();
    services.eventBus?.emit("selector:mounted", {
      moduleId: "cs_selector",
      phase: "3",
      policyOwner: "shell",
    });
  },

  getProjectEnvelopeContribution() {
    if (!mountedContainer || !selectorState) return null;
    const contribution = createSelectorProjectEnvelopeContribution(selectorState.getSnapshot());
    const projection = latestSelectorViewModel?.selectorSurface?.preEngineReadonlyActionEligibilityProjection;
    return projection
      ? Object.freeze({
        ...contribution,
        preEngineActionEligibilityProjection: projection,
      })
      : contribution;
  },

  async hydrate(hydrationPayload, nextContext = mountedContext) {
    if (!mountedContainer || !selectorState || !selectorAdapter || !nextContext) {
      return failSelectorHydration(
        "selector-not-mounted",
        "The currently mounted module cannot accept Selector hydration.",
      );
    }
    mountedContext = nextContext;
    const validation = validateSelectorHydrationPayload(hydrationPayload, nextContext);
    if (!validation.valid) return failSelectorHydration(validation.status, validation.reason);

    const applyResult = selectorState.hydrateSelectorProjectEnvelopeState(validation.state);
    if (!applyResult.accepted) {
      return failSelectorHydration(applyResult.status, applyResult.reason);
    }

    ensureVisibleSelectorSurface("Selector Project-envelope state was applied before option validation.");
    const optionsStatus = await loadSelectorReferenceOptions();
    const restoredConstraintsValidation = selectorRestoredConstraintsValidation(
      optionsStatus,
      validation.state,
    );
    if (!restoredConstraintsValidation.valid) {
      return failSelectorHydration(
        restoredConstraintsValidation.status,
        restoredConstraintsValidation.reason,
      );
    }

    ensureVisibleSelectorSurface("Selector Project-envelope restore completed.");
    const result = {
      accepted: true,
      moduleId: "cs_selector",
      status: "hydrated",
      reason: "Selector Project-envelope UI state was restored and revalidated against current source-backed options.",
      sourceEnvelopeId: hydrationPayload.sourceEnvelopeId,
      sourceProjectId: hydrationPayload.sourceProjectId,
      restoredConstraintCount: applyResult.restoredConstraintCount,
      staleFields: [],
    };
    mountedServices?.eventBus?.emit("selector:hydrated", {
      ...result,
      report: "cs_selector:hydrated",
    });
    return result;
  },

  update(nextContext) {
    if (!mountedContainer || !selectorAdapter || !nextContext) return;
    mountedContext = nextContext;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "cs_selector";
    selectorAdapter = createSelectorContractAdapter({
      services: selectorAdapter.services,
      context: nextContext,
    });
    renderCurrentView();
  },

  unmount() {
    selectorReferenceRequestId += 1;
    selectorReferenceOptionsRequestId += 1;
    if (mountedContainer) {
      while (mountedContainer.firstChild) {
        mountedContainer.removeChild(mountedContainer.firstChild);
      }
    }
    mountedContainer = null;
    mountedServices = null;
    mountedContext = null;
    selectorState = null;
    selectorAdapter = null;
    latestSelectorViewModel = null;
    selectorReferenceStatus = initialSelectorReferenceStatus();
    selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
  },
};
