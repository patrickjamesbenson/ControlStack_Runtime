import { createIesBuilderState } from "./iesBuilderState.js";
import { renderIesBuilderView } from "./iesBuilderView.js";
import {
  createIesBuilderViewModel,
  prepareIesBuilderProjectIesExportDownloadCapabilityAction,
} from "./iesBuilderViewModel.js";
import { resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary } from "./iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js";

const IES_BUILDER_STATUS_ENDPOINT = "/api/ies-builder/status";

const SAFE_WARNINGS = Object.freeze([
  "IES Builder candidate readiness is diagnostic only in this slice.",
  "No IES file is generated, parsed, uploaded, previewed, or exported here.",
  "An IES candidate is not Lab Proof.",
  "Photometric candidate output must not be treated as production proof.",
  "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
  "IES Builder is read-only and diagnostic in this slice.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
]);

const CANDIDATE_READINESS_REQUIREMENTS = Object.freeze([
  "Selector candidate state present",
  "product/body intent resolved",
  "board candidate resolved",
  "optic/diffuser intent resolved",
  "electrical/driver context resolved",
  "photometric template/source identified",
  "Board Data reference present",
  "length/scaling policy identified",
  "emergency/EGRES dependency checked",
  "compliance dependency checked",
  "Lab Proof boundary clearly separated",
  "human review warning surfaced",
]);

const CANDIDATE_STATES = Object.freeze([
  "not ready",
  "missing selector candidate",
  "missing board data reference",
  "missing photometric source",
  "candidate input ready",
  "candidate-only output possible later",
  "requires review",
  "requires Lab Proof before production claim",
]);

const RELATIONSHIP_MAP = Object.freeze([
  { label: "Selector", role: "selection/candidate source" },
  { label: "Board Data", role: "metadata source" },
  { label: "IES Builder", role: "future candidate artefact generator" },
  { label: "Engine Flow", role: "confidence path explanation" },
  { label: "Lab Proof", role: "production proof authority" },
  { label: "Controlled Records", role: "future provenance/review trail" },
]);

const BLOCKED_ACTIONS = Object.freeze([
  "IES upload",
  "upload parsing",
  "IES export",
  "IES generation",
  "Selector mutation",
  "Board Data mutation",
  "Lab proof claim",
  "raw IES exposure",
  "raw Lab evidence exposure",
  "donor Python mounting",
  "donor code mounting",
]);

let mountedContainer = null;
let mountedContext = null;
let mountedServices = null;
let iesBuilderState = null;
let iesBuilderRequestId = 0;
let iesBuilderDownloadSourceRequestId = 0;
let iesBuilderSelectedProjectIesExportDownloadSourceBoundary = null;
let iesBuilderDownloadCapabilityAction = null;

const INITIAL_STATUS = Object.freeze({
  ok: null,
  endpoint: IES_BUILDER_STATUS_ENDPOINT,
  owner: "runtime-shell",
  moduleId: "ies_builder",
  label: "IES Builder / Photometry",
  readOnly: true,
  diagnosticOnly: true,
  candidateReadinessExplanationOnly: true,
  candidateOutputOnly: true,
  productionProofAuthority: false,
  labApprovalRequired: true,
  labProofAuthority: false,
  selectorMutationEnabled: false,
  boardDataWriteEnabled: false,
  boardDataWritesEnabled: false,
  boardDataMutationEnabled: false,
  iesGenerationEnabled: false,
  iesUploadEnabled: false,
  uploadEnabled: false,
  iesParseEnabled: false,
  parseEnabled: false,
  parseUploadEnabled: false,
  iesExportEnabled: false,
  exportEnabled: false,
  polarPreviewEnabled: false,
  engineExecutionEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  drawingGenerationEnabled: false,
  hiddenWriteBackEnabled: false,
  proofClaimsEmitted: false,
  rawIesExposed: false,
  rawLabEvidenceExposed: false,
  rawArtefactsExposed: false,
  rawPdfsExposed: false,
  donorPythonMounted: false,
  donorCodeMounted: false,
  largeDependenciesAdded: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  noWritesAttempted: true,
  postEndpointsEnabled: false,
  proofStatus: "not_proof_authority",
  currentStatusSummary: "IES Builder status is loading from the read-only runtime endpoint.",
  parserCapabilityStatus: "safe_summary_pending",
  fixtureSampleReadinessStatus: "safe_summary_pending",
  candidateBoundary: "candidate_only_not_approved_proof",
  proofBoundarySummary: "Lab Proof remains the boundary for proof authority.",
  candidateReadinessRequirements: [...CANDIDATE_READINESS_REQUIREMENTS],
  candidateStates: [...CANDIDATE_STATES],
  relationshipMap: [...RELATIONSHIP_MAP],
  blockedActions: [...BLOCKED_ACTIONS],
  warnings: [...SAFE_WARNINGS],
});

function safeStatus(payload = {}) {
  const warnings = Array.isArray(payload?.warnings) && payload.warnings.length
    ? payload.warnings
    : [...SAFE_WARNINGS];
  const blockedActions = Array.isArray(payload?.blockedActions) && payload.blockedActions.length
    ? payload.blockedActions
    : [...BLOCKED_ACTIONS];
  const candidateReadinessRequirements = Array.isArray(payload?.candidateReadinessRequirements)
    && payload.candidateReadinessRequirements.length
    ? payload.candidateReadinessRequirements
    : [...CANDIDATE_READINESS_REQUIREMENTS];
  const candidateStates = Array.isArray(payload?.candidateStates) && payload.candidateStates.length
    ? payload.candidateStates
    : [...CANDIDATE_STATES];
  const relationshipMap = Array.isArray(payload?.relationshipMap) && payload.relationshipMap.length
    ? payload.relationshipMap
    : [...RELATIONSHIP_MAP];

  return {
    ...payload,
    endpoint: payload?.endpoint || IES_BUILDER_STATUS_ENDPOINT,
    owner: payload?.owner || "runtime-server",
    moduleId: "ies_builder",
    label: "IES Builder / Photometry",
    readOnly: true,
    diagnosticOnly: true,
    candidateReadinessExplanationOnly: true,
    candidateOutputOnly: true,
    productionProofAuthority: false,
    labApprovalRequired: true,
    labProofAuthority: false,
    selectorMutationEnabled: false,
    boardDataWriteEnabled: false,
    boardDataWritesEnabled: false,
    boardDataMutationEnabled: false,
    iesGenerationEnabled: false,
    iesUploadEnabled: false,
    uploadEnabled: false,
    iesParseEnabled: false,
    parseEnabled: false,
    parseUploadEnabled: false,
    iesExportEnabled: false,
    exportEnabled: false,
    polarPreviewEnabled: false,
    engineExecutionEnabled: false,
    runTableGenerationEnabled: false,
    payloadGenerationEnabled: false,
    drawingGenerationEnabled: false,
    hiddenWriteBackEnabled: false,
    proofClaimsEmitted: false,
    rawIesExposed: false,
    rawLabEvidenceExposed: false,
    rawArtefactsExposed: false,
    rawPdfsExposed: false,
    donorPythonMounted: false,
    donorCodeMounted: false,
    largeDependenciesAdded: false,
    googleSyncEnabled: false,
    activeSnapshotWriteEnabled: false,
    materialisedSnapshotWriteEnabled: false,
    noWritesAttempted: true,
    postEndpointsEnabled: false,
    proofStatus: "not_proof_authority",
    currentStatusSummary: payload?.currentStatusSummary || "Read-only fixture/parser diagnostics are available from safe runtime metadata only.",
    parserCapabilityStatus: payload?.parserCapabilityStatus || "safe_summary_only_no_raw_ies",
    fixtureSampleReadinessStatus: payload?.fixtureSampleReadinessStatus || "metadata_only_no_upload_enabled",
    candidateBoundary: payload?.candidateBoundary || "candidate_only_not_approved_proof",
    proofBoundarySummary: payload?.proofBoundarySummary || "Lab Proof remains the boundary for proof authority.",
    candidateReadinessRequirements,
    candidateStates,
    relationshipMap,
    blockedActions,
    warnings,
  };
}

function currentStatus() {
  return iesBuilderState?.getSnapshot?.().statusPayload || INITIAL_STATUS;
}

function renderCurrentView() {
  if (!mountedContainer || !iesBuilderState) return;
  const local = iesBuilderState.getSnapshot();
  const viewModel = createIesBuilderViewModel({
    context: mountedContext,
    local,
    status: currentStatus(),
    projectIesExportDownloadSourceBoundary:
      iesBuilderSelectedProjectIesExportDownloadSourceBoundary,
    projectIesExportDownloadControlAction: iesBuilderDownloadCapabilityAction,
  });
  renderIesBuilderView(mountedContainer, viewModel);
}

async function refreshSelectedProjectIesExportDownloadSourceBoundary() {
  const requestId = iesBuilderDownloadSourceRequestId + 1;
  iesBuilderDownloadSourceRequestId = requestId;
  const boundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
    context: mountedContext,
    services: mountedServices,
  });
  const capabilityAction = await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
    projectIesExportDownloadSourceBoundary: boundary,
    context: mountedContext,
    services: mountedServices,
  });
  if (requestId !== iesBuilderDownloadSourceRequestId || !mountedContainer) return;
  iesBuilderSelectedProjectIesExportDownloadSourceBoundary = boundary;
  iesBuilderDownloadCapabilityAction = capabilityAction;
  renderCurrentView();
}

function applyIesBuilderStatus(payload) {
  if (!iesBuilderState) return;
  iesBuilderState.setStatusPayload(safeStatus(payload));
  renderCurrentView();
}

async function loadIesBuilderStatus() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    iesBuilderState?.setFailure("Browser fetch is unavailable; IES Builder status could not be read.");
    renderCurrentView();
    return;
  }

  const requestId = iesBuilderRequestId + 1;
  iesBuilderRequestId = requestId;
  iesBuilderState?.setLoading();
  renderCurrentView();

  try {
    const response = await fetchImpl(IES_BUILDER_STATUS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    if (requestId !== iesBuilderRequestId || !mountedContainer) return;
    applyIesBuilderStatus({
      ...payload,
      httpStatus: response.status,
      status: payload?.ok === false ? "warning" : "loaded",
    });
  } catch (error) {
    if (requestId !== iesBuilderRequestId || !mountedContainer) return;
    iesBuilderState?.setFailure(`IES Builder status request failed: ${error?.message || "unknown error"}.`);
    renderCurrentView();
  }
}

export const iesBuilderModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("ies_builder requires an HTMLElement container");
    }

    mountedContainer = container;
    mountedContext = context;
    mountedServices = services;
    iesBuilderState = createIesBuilderState();
    iesBuilderSelectedProjectIesExportDownloadSourceBoundary = null;
    iesBuilderDownloadCapabilityAction = null;
    renderCurrentView();
    void refreshSelectedProjectIesExportDownloadSourceBoundary();
    loadIesBuilderStatus();
    services.eventBus?.emit("ies-builder:mounted", {
      moduleId: "ies_builder",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      candidateReadinessExplanationOnly: true,
      productionProofAuthority: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !nextContext) return;
    mountedContext = nextContext;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "ies_builder";
    iesBuilderSelectedProjectIesExportDownloadSourceBoundary = null;
    iesBuilderDownloadCapabilityAction = null;
    renderCurrentView();
    void refreshSelectedProjectIesExportDownloadSourceBoundary();
  },

  unmount() {
    iesBuilderRequestId += 1;
    iesBuilderDownloadSourceRequestId += 1;
    if (mountedContainer) {
      while (mountedContainer.firstChild) {
        mountedContainer.removeChild(mountedContainer.firstChild);
      }
    }
    mountedContainer = null;
    mountedContext = null;
    mountedServices = null;
    iesBuilderState = null;
    iesBuilderSelectedProjectIesExportDownloadSourceBoundary = null;
    iesBuilderDownloadCapabilityAction = null;
  },
};
