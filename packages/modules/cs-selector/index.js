import { createSelectorContractAdapter } from "./selectorContractAdapter.js";
import { SELECTOR_TEST_CASE_STORAGE_KEY, createSelectorState, sanitiseSelectorTestCase } from "./selectorState.js";
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
  "cct",
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
let selectorState = null;
let selectorAdapter = null;
let selectorReferenceStatus = initialSelectorReferenceStatus();
let selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
let selectorReferenceRequestId = 0;
let selectorReferenceOptionsRequestId = 0;

function activeSelectorOptionsPayload() {
  const payload = selectorReferenceOptionsStatus.status !== "not-requested" || selectorReferenceOptionsStatus.fields?.length
    ? selectorReferenceOptionsStatus
    : selectorReferenceStatus.selectorOptions || selectorReferenceOptionsStatus;
  const activeSignature = currentSelectorOptionConstraintSignature();
  const payloadFingerprint = String(payload?.constraintFingerprint || "");
  if (payloadFingerprint && payloadFingerprint !== activeSignature.constraintFingerprint) {
    return resolveSelectorReferenceOptionsStatus(
      payload,
      {
        ok: null,
        status: "loading",
        endpoint: payload?.endpoint || SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
        constraintQuery: activeSignature.constraintQuery,
        constraintFingerprint: activeSignature.constraintFingerprint,
        fields: [],
        workflowSections: [],
        warnings: ["Selector reference options are loading."],
      },
      activeSignature.constraintFingerprint,
      activeSignature.constraintQuery
    );
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
  renderSelectorView(mountedContainer, viewModel);
  if (viewportState) {
    restoreSelectorViewportState(viewportState);
    requestAnimationFrame(() => restoreSelectorViewportState(viewportState));
  }
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

export function selectorReferenceOptionsResponseIsCurrent({
  requestId = 0,
  activeRequestId = 0,
  responseConstraintFingerprint = "",
  activeConstraintFingerprint = "",
  mounted = true,
} = {}) {
  return mounted === true
    && requestId === activeRequestId
    && String(responseConstraintFingerprint || "") === String(activeConstraintFingerprint || "");
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
  const fieldsFromCurrentPayload = Array.isArray(nextStatus?.fields)
    ? nextStatus.fields
    : sameConstraintFingerprint
      ? previousFields
      : [];
  const workflowSectionsFromCurrentPayload = Array.isArray(nextStatus?.workflowSections)
    ? nextStatus.workflowSections
    : sameConstraintFingerprint
      ? previousWorkflowSections
      : [];
  const stalePreviousFieldsCount = sameConstraintFingerprint ? 0 : previousFields.length;
  const stalePreviousWorkflowSectionCount = sameConstraintFingerprint ? 0 : previousWorkflowSections.length;

  return {
    ...base,
    ...nextStatus,
    endpoint: nextStatus?.endpoint || SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
    constraintQuery: incomingQuery || "",
    constraintFingerprint: incomingFingerprint,
    fields: fieldsFromCurrentPayload,
    workflowSections: workflowSectionsFromCurrentPayload,
    candidateSummary: nextStatus?.candidateSummary || (sameConstraintFingerprint ? currentStatus?.candidateSummary : base.candidateSummary),
    previousFieldsReused: !Array.isArray(nextStatus?.fields) && sameConstraintFingerprint && previousFields.length > 0,
    previousWorkflowSectionsReused: !Array.isArray(nextStatus?.workflowSections) && sameConstraintFingerprint && previousWorkflowSections.length > 0,
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
    return;
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
    fields: [],
    workflowSections: [],
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
    })) return;
    applySelectorReferenceOptionsStatus({
      ...payload,
      ok: response.ok && payload?.ok !== false,
      httpStatus: response.status,
      status: payload?.ok === false ? "unavailable" : payload?.status || "loaded",
      constraintQuery: currentSignature.constraintQuery,
      constraintFingerprint: responseConstraintFingerprint,
    }, currentSignature);
  } catch (error) {
    const currentSignature = currentSelectorOptionConstraintSignature();
    if (!selectorReferenceOptionsResponseIsCurrent({
      requestId,
      activeRequestId: selectorReferenceOptionsRequestId,
      responseConstraintFingerprint: activeSignature.constraintFingerprint,
      activeConstraintFingerprint: currentSignature.constraintFingerprint,
      mounted: Boolean(mountedContainer),
    })) return;
    applySelectorReferenceOptionsStatus({
      ok: false,
      status: "fetch-failed",
      endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
      constraintQuery: currentSignature.constraintQuery,
      constraintFingerprint: currentSignature.constraintFingerprint,
      warnings: [`Selector reference options request failed: ${error?.message || "unknown error"}.`],
    }, currentSignature);
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
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("cs_selector requires an HTMLElement container");
    }

    mountedContainer = container;
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

  update(nextContext) {
    if (!mountedContainer || !selectorAdapter || !nextContext) return;
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
    selectorState = null;
    selectorAdapter = null;
    selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
  },
};
