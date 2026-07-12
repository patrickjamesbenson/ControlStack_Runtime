import { triggerIesFirstNarrowProjectIesExportBrowserDownload } from "./iesFirstNarrowProjectIesExportBrowserDownloadTrigger.js";
import {
  getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput,
} from "./iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportDownloadMaterialisationBoundary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
} from "../../workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js";

const STATUS_ENDPOINT = "/api/ies-builder/status";

export const IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_CONTRACT_ID =
  "IES-BUILDER-FIRST-VISIBLE-PROJECT-IES-EXPORT-DOWNLOAD-CONTROL-1";
export const IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_ID =
  "controlstack.runtime.ies-builder.first-visible-project-ies-export-download-control.v1";
export const IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_VERSION = 1;

export const IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID =
  "IES-BUILDER-FIRST-PROJECT-IES-EXPORT-DOWNLOAD-OUTCOME-STATE-1";
export const IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID =
  "controlstack.runtime.ies-builder.first-project-ies-export-download-outcome-state.v1";
export const IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION = 1;

export const IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES = Object.freeze({
  idle: "ies_builder_project_ies_export_download_idle",
  started: "ies_builder_project_ies_export_download_started",
  blocked: "ies_builder_project_ies_export_download_blocked",
});

export const IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER = Object.freeze([
  "state",
  "filename",
  "mediaType",
  "extension",
  "byteLength",
  "blocker",
]);

export const IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES = Object.freeze({
  actionAvailable: "ies_builder_project_ies_export_download_action_available",
  blockedFailClosed: "ies_builder_project_ies_export_download_blocked_fail_closed",
});

export const IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "controlId",
  "label",
  "state",
  "visible",
  "enabled",
  "failClosed",
  "blocker",
  "browserOnly",
  "userGestureRequired",
  "ephemeral",
  "inMemoryOnly",
]);

const PROJECT_IES_EXPORT_DOWNLOAD_FILENAME_PATTERN =
  /^controlstack-project-ies-[1-9][0-9]*mm-[0-9a-f]{12}\.ies$/;
const PROJECT_IES_EXPORT_DOWNLOAD_LEGACY_MEDIA_TYPE = "application/octet-stream";
const PROJECT_IES_EXPORT_DOWNLOAD_BLOCKER_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;

const REQUIRED_BOUNDARY_STATEMENTS = Object.freeze([
  "IES Builder is read-only and diagnostic in this slice.",
  "IES Builder is candidate-output-only and does not provide production proof.",
  "IES Builder must wait for a selected Engine/RunTable result before real candidate generation.",
  "IES Builder does not own actual build geometry; Engine/RunTable owns run length, segments, board runs, zones, driver/control topology, and accepted family/subset locks.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
  "Raw IES text, raw candela grids, raw photometry payloads, raw Engine payloads, raw Board Data rows, Lab evidence, PDFs, artefacts, and base64 polar plots stay hidden.",
]);

const CANDIDATE_READINESS_BOUNDARY_STATEMENTS = Object.freeze([
  "IES Builder candidate readiness is diagnostic only in this slice.",
  "No IES file is generated, parsed, uploaded, previewed, or exported here.",
  "An IES candidate is not Lab Proof.",
  "Photometric candidate output must not be treated as production proof.",
  "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
]);

const CANDIDATE_OUTPUT_CONTRACT_BOUNDARY_COPY = Object.freeze([
  "IES Builder is candidate-output-only in this slice.",
  "IES Builder does not own actual build geometry.",
  "Engine/RunTable owns run length, segments, board runs, zones, driver/control topology, and selected family/subset locks.",
  "The main readiness blocker is the missing selected Engine/RunTable result.",
  "1mm policy is metadata only: oneMmNormalised true, baseLengthM 0.001, and photometryMode normalise_1mm_candidate.",
  "Lab Proof proves later; IES Builder does not claim proof authority.",
  "Raw artefacts are hidden and only opaque future refs may be displayed.",
]);

const CANDIDATE_READINESS_REQUIREMENTS = Object.freeze([
  "Selector candidate state present",
  "selected Engine/RunTable result present",
  "selected family/subset lock available",
  "product/body intent resolved",
  "run summary shape available",
  "board run and zone summary available",
  "driver/control topology resolved",
  "photometric template/source identified as opaque ref",
  "Board Data reference present as opaque metadata ref",
  "1mm normalisation policy identified",
  "beam direction / mirror / regrid / scale policies labelled only",
  "Lab Proof boundary clearly separated",
  "human review warning surfaced",
]);

const CANDIDATE_STATES = Object.freeze([
  "waiting_for_selected_engine_runtable_result",
  "not ready",
  "missing selector candidate",
  "missing selected Engine/RunTable result",
  "missing selected family/subset lock",
  "missing board data reference",
  "missing photometric source",
  "candidate input ready",
  "candidate-only output possible later",
  "requires review",
  "requires Lab Proof before production claim",
]);

const RELATIONSHIP_MAP = Object.freeze([
  { label: "Selector", role: "selection/candidate source" },
  { label: "Engine/RunTable", role: "selected result source and actual build geometry owner" },
  { label: "Board Data", role: "metadata source" },
  { label: "IES Builder", role: "future candidate artefact generator; not proof authority" },
  { label: "Lab Proof", role: "production proof authority later" },
  { label: "Controlled Records", role: "future provenance/review trail" },
]);

const BLOCKED_ACTIONS = Object.freeze([
  "IES upload",
  "upload parsing",
  "IES export",
  "IES generation",
  "polar preview",
  "raw candela display",
  "raw photometry payload display",
  "raw Engine payload display",
  "Selector mutation",
  "Board Data mutation",
  "Lab proof claim",
  "raw IES exposure",
  "raw Lab evidence exposure",
  "PDF or artefact exposure",
  "donor Python mounting",
  "donor code mounting",
]);

const SCHEMA_FALLBACK = Object.freeze({
  schemaId: "controlstack.ies_builder.candidate_output_contract.v1",
  schemaVersion: "v1",
  surface: "read_only_candidate_output_status",
  description: "Safe metadata contract for future IES candidate output after a selected Engine/RunTable result exists.",
  fields: Object.freeze([
    "schema",
    "candidateState",
    "candidateOutputOnly",
    "productionProof",
    "labProofAuthority",
    "sourceRefs",
    "selectedFamilySubsetLockPlaceholder",
    "productIntentSummary",
    "geometryPolicy",
    "runSummaryShape",
    "photometryMetadataShape",
    "candidateArtefactRefs",
    "redactionFlags",
  ]),
});

const CANDIDATE_STATE_FALLBACK = Object.freeze({
  state: "waiting_for_selected_engine_runtable_result",
  label: "Waiting for selected Engine/RunTable result",
  ready: false,
  selectedResultRequired: true,
  selectedResultAvailable: false,
  candidateOutputOnly: true,
  generationDisabled: true,
  proofStatus: "not_proof_authority",
});

const READINESS_BLOCKERS_FALLBACK = Object.freeze([
  Object.freeze({
    code: "selected-engine-runtable-result-required",
    severity: "blocking",
    label: "Selected Engine/RunTable result required",
    reason: "IES Builder waits for one accepted selected Engine/RunTable result before any real IES candidate can be generated.",
    owner: "Engine/RunTable selected-result source",
  }),
]);

const SOURCE_REFS_FALLBACK = Object.freeze({
  selectorSelectedResultProjectionRef: "future-selected-result-projection-ref",
  runTableSelectedResultSourceRef: "future-engine-runtable-selected-result-ref",
  boardDataRef: "future-board-data-metadata-ref",
  labProofRef: "future-lab-proof-authority-ref",
  controlledRecordRef: "future-controlled-record-ref",
  refsAreOpaque: true,
  rawRefsExposed: false,
});

const SELECTED_FAMILY_SUBSET_LOCK_FALLBACK = Object.freeze({
  status: "not_locked_until_selected_result",
  selectedFamily: null,
  selectedSubset: null,
  boardFamily: null,
  pitchFamily: null,
  opticCurrentAssumptions: null,
  zoneSplitStrategy: null,
  driverFamily: null,
  sourceRequired: "selected Engine/RunTable result",
});

const PRODUCT_INTENT_SUMMARY_FALLBACK = Object.freeze({
  status: "placeholder_pending_selected_result",
  safeIntentFields: Object.freeze([
    "selected family/subset lock",
    "system/profile intent",
    "direct/indirect optic intent",
    "environment intent",
    "light/control intent",
    "mounting intent",
    "finishes intent",
    "egress/accessory intent",
    "target output intent",
  ]),
  rawSelectorStateExposed: false,
  rawBoardDataRowsExposed: false,
});

const GEOMETRY_POLICY_FALLBACK = Object.freeze({
  owner: "Engine/RunTable selected result",
  iesBuilderOwnsActualBuildGeometry: false,
  engineRunTableOwns: Object.freeze([
    "run length",
    "segments",
    "board runs",
    "zones",
    "driver/control topology",
    "mechanical placement",
    "selected family/subset lock",
  ]),
  acceptedGeometryRequired: true,
  oneMmNormalised: true,
  baseLengthM: 0.001,
  photometryMode: "normalise_1mm_candidate",
  beamDirection: "placeholder_pending_selected_result",
  mirrorPolicy: "policy_label_only_pending_selected_result",
  regridPolicy: "policy_label_only_pending_selected_result",
  scalePolicy: "scale_to_1mm_metadata_only_no_raw_grid",
  rawCandelaGridExposed: false,
  rawIesContentExposed: false,
});

const RUN_SUMMARY_SHAPE_FALLBACK = Object.freeze({
  runKey: null,
  runLabel: null,
  runNumber: null,
  runLengthMm: null,
  bodyMmRequested: null,
  segmentSummary: null,
  boardRunSummary: null,
  zonePlanSummary: null,
  driverControlTopologySummary: null,
  mechanicalSummary: null,
  sanitisedWarnings: null,
});

const PHOTOMETRY_METADATA_SHAPE_FALLBACK = Object.freeze({
  sourcePhotometryRef: null,
  sourcePhotometryStatus: "opaque_ref_required_later",
  oneMmNormalised: true,
  baseLengthM: 0.001,
  photometryMode: "normalise_1mm_candidate",
  beamDirection: "placeholder_pending_selected_result",
  mirrorPolicy: "policy_label_only",
  regridPolicy: "policy_label_only",
  scalePolicy: "scale_to_1mm_metadata_only",
  angleGridSummary: null,
  fluxSummary: null,
  lmPerM: null,
  wattsPerM: null,
  rawCandelaGridExposed: false,
  rawPhotometryPayloadExposed: false,
});

const CANDIDATE_ARTEFACT_REFS_FALLBACK = Object.freeze({
  opaqueRefsOnly: true,
  iesCandidateRef: null,
  photometryMetadataRef: null,
  candidateManifestRef: null,
  polarPreviewRef: null,
  pdfRef: null,
  rawIesTextExposed: false,
  rawArtefactPayloadExposed: false,
  base64PolarPlotsExposed: false,
});

const REDACTION_FLAGS_FALLBACK = Object.freeze({
  rawIesExposed: false,
  rawCandelaGridExposed: false,
  rawPhotometryPayloadExposed: false,
  rawEnginePayloadExposed: false,
  rawSelectedEnginePayloadExposed: false,
  rawBoardDataRowsExposed: false,
  rawBoardDataHeadersExposed: false,
  rawLabEvidenceExposed: false,
  rawArtefactsExposed: false,
  rawPdfsExposed: false,
  base64PolarPlotsExposed: false,
  localPathsExposed: false,
  repoPathsExposed: false,
  filenamesExposed: false,
  credentialsExposed: false,
  usersExposed: false,
  providerDetailsExposed: false,
});

const HANDOFF_CONTRACT_FALLBACK = Object.freeze({
  schemaId: "controlstack.ies_builder.selected_result_handoff_contract.v1",
  schemaVersion: "v1",
  readOnly: true,
  candidateOutputOnly: true,
  productionProof: false,
  labProofAuthority: false,
  handoffState: "waiting_for_selected_engine_runtable_result",
  ready: false,
});

function yesNo(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  if (value === null || value === undefined) return "unknown";
  return String(value);
}

function valueOrNone(value) {
  if (value === null || value === undefined || value === "") return "none";
  return String(value);
}

function valueToText(value) {
  if (Array.isArray(value)) return value.length ? value.map(valueToText).join(", ") : "none";
  if (value === null || value === undefined || value === "") return "none";
  if (typeof value === "boolean") return yesNo(value);
  if (typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => `${key}: ${valueToText(item)}`);
    return entries.length ? entries.join("; ") : "none";
  }
  return String(value);
}

function safeList(value, fallback = []) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function safeObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function safeScalarBoundary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Object.isFrozen(value)) return null;
  return Object.values(value).every((item) => (
    item === null || ["string", "number", "boolean"].includes(typeof item)
  )) ? value : null;
}

function objectRows(value = {}, fallback = {}) {
  const object = safeObject(value, fallback);
  return Object.entries(object).map(([key, item]) => [key, valueToText(item)]);
}

function flagValue(status, key, fallback, aliases = []) {
  if (Object.prototype.hasOwnProperty.call(status, key)) return status[key];
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(status, alias)) return status[alias];
  }
  return fallback;
}

function statusRows(status = {}) {
  const schema = safeObject(status.schema, SCHEMA_FALLBACK);
  const candidateState = safeObject(status.candidateState, CANDIDATE_STATE_FALLBACK);
  return [
    ["endpoint", status.endpoint || STATUS_ENDPOINT],
    ["ok", yesNo(status.ok)],
    ["owner", valueOrNone(status.owner)],
    ["moduleId", status.moduleId || "ies_builder"],
    ["label", status.label || "IES Builder / Photometry"],
    ["schema", schema.schemaId || SCHEMA_FALLBACK.schemaId],
    ["candidate state", candidateState.state || CANDIDATE_STATE_FALLBACK.state],
    ["selected result required", yesNo(flagValue(status, "selectedResultRequired", true))],
    ["selected result available", yesNo(flagValue(status, "selectedResultAvailable", false))],
    ["proofStatus", status.proofStatus || "not_proof_authority"],
  ];
}

function fixtureParserDiagnosticRows(status = {}) {
  const blockedActions = safeList(status.blockedActions, BLOCKED_ACTIONS).join(", ");

  return [
    ["endpoint", status.endpoint || STATUS_ENDPOINT],
    ["current status summary", status.currentStatusSummary || "Read-only IES candidate-output contract/status metadata is available; real generation waits for a selected Engine/RunTable result."],
    ["parser capability status", status.parserCapabilityStatus || "safe_summary_only_no_raw_ies"],
    ["fixture/sample readiness status", status.fixtureSampleReadinessStatus || "metadata_only_no_upload_enabled"],
    ["candidate-only boundary", status.candidateBoundary || "candidate_output_only_not_approved_proof"],
    ["proof boundary summary", status.proofBoundarySummary || "Lab Proof remains the boundary for proof authority."],
    ["blocked actions", blockedActions],
  ];
}

function candidateReadinessFlagRows(status = {}) {
  return [
    ["readOnly", yesNo(flagValue(status, "readOnly", true))],
    ["diagnosticOnly", yesNo(flagValue(status, "diagnosticOnly", true))],
    ["candidateReadinessExplanationOnly", yesNo(flagValue(status, "candidateReadinessExplanationOnly", true))],
    ["candidateOutputOnly", yesNo(flagValue(status, "candidateOutputOnly", true))],
    ["productionProof", yesNo(flagValue(status, "productionProof", false, ["productionProofAuthority"]))],
    ["labProofAuthority", yesNo(flagValue(status, "labProofAuthority", false))],
    ["selectedResultRequired", yesNo(flagValue(status, "selectedResultRequired", true))],
    ["selectedResultAvailable", yesNo(flagValue(status, "selectedResultAvailable", false))],
    ["iesGenerationEnabled", yesNo(flagValue(status, "iesGenerationEnabled", false))],
    ["iesUploadEnabled", yesNo(flagValue(status, "iesUploadEnabled", false, ["uploadEnabled"]))],
    ["iesParseEnabled", yesNo(flagValue(status, "iesParseEnabled", false, ["parseEnabled", "parseUploadEnabled"]))],
    ["iesExportEnabled", yesNo(flagValue(status, "iesExportEnabled", false, ["exportEnabled"]))],
    ["polarPreviewEnabled", yesNo(flagValue(status, "polarPreviewEnabled", false))],
    ["selectorMutationEnabled", yesNo(flagValue(status, "selectorMutationEnabled", false))],
    ["boardDataWriteEnabled", yesNo(flagValue(status, "boardDataWriteEnabled", false, ["boardDataWritesEnabled", "boardDataMutationEnabled"]))],
    ["engineExecutionEnabled", yesNo(flagValue(status, "engineExecutionEnabled", false))],
    ["runTableGenerationEnabled", yesNo(flagValue(status, "runTableGenerationEnabled", false))],
    ["payloadGenerationEnabled", yesNo(flagValue(status, "payloadGenerationEnabled", false))],
    ["drawingGenerationEnabled", yesNo(flagValue(status, "drawingGenerationEnabled", false))],
    ["hiddenWriteBackEnabled", yesNo(flagValue(status, "hiddenWriteBackEnabled", false))],
  ];
}

function safetyRows(status = {}) {
  return [
    ["readOnly", yesNo(status.readOnly)],
    ["diagnosticOnly", yesNo(status.diagnosticOnly)],
    ["candidateOutputOnly", yesNo(status.candidateOutputOnly)],
    ["productionProof", yesNo(flagValue(status, "productionProof", false, ["productionProofAuthority"]))],
    ["productionProofAuthority", yesNo(status.productionProofAuthority)],
    ["proofClaimsEmitted", yesNo(status.proofClaimsEmitted)],
    ["uploadEnabled", yesNo(status.uploadEnabled)],
    ["parseUploadEnabled", yesNo(status.parseUploadEnabled)],
    ["exportEnabled", yesNo(status.exportEnabled)],
    ["iesGenerationEnabled", yesNo(status.iesGenerationEnabled)],
    ["selectorMutationEnabled", yesNo(status.selectorMutationEnabled)],
    ["boardDataMutationEnabled", yesNo(status.boardDataMutationEnabled)],
    ["labProofAuthority", yesNo(status.labProofAuthority)],
    ["rawIesExposed", yesNo(status.rawIesExposed)],
    ["rawCandelaGridExposed", yesNo(flagValue(status, "rawCandelaGridExposed", false))],
    ["rawPhotometryPayloadExposed", yesNo(flagValue(status, "rawPhotometryPayloadExposed", false))],
    ["rawEnginePayloadExposed", yesNo(flagValue(status, "rawEnginePayloadExposed", false))],
    ["rawBoardDataRowsExposed", yesNo(flagValue(status, "rawBoardDataRowsExposed", false))],
    ["rawLabEvidenceExposed", yesNo(status.rawLabEvidenceExposed)],
    ["donorPythonMounted", yesNo(status.donorPythonMounted)],
    ["donorCodeMounted", yesNo(status.donorCodeMounted)],
  ];
}

function lockRows(status = {}) {
  return [
    ["labApprovalRequired", yesNo(status.labApprovalRequired)],
    ["boardDataWritesEnabled", yesNo(status.boardDataWritesEnabled)],
    ["parseEnabled", yesNo(status.parseEnabled)],
    ["polarPreviewEnabled", yesNo(status.polarPreviewEnabled)],
    ["rawArtefactsExposed", yesNo(status.rawArtefactsExposed)],
    ["rawPdfsExposed", yesNo(status.rawPdfsExposed)],
    ["base64PolarPlotsExposed", yesNo(flagValue(status, "base64PolarPlotsExposed", false))],
    ["localPathsExposed", yesNo(flagValue(status, "localPathsExposed", false))],
    ["repoPathsExposed", yesNo(flagValue(status, "repoPathsExposed", false))],
    ["filenamesExposed", yesNo(flagValue(status, "filenamesExposed", false))],
    ["credentialsExposed", yesNo(flagValue(status, "credentialsExposed", false))],
    ["usersExposed", yesNo(flagValue(status, "usersExposed", false))],
    ["providerDetailsExposed", yesNo(flagValue(status, "providerDetailsExposed", false))],
    ["largeDependenciesAdded", yesNo(status.largeDependenciesAdded)],
    ["googleSyncEnabled", yesNo(status.googleSyncEnabled)],
    ["activeSnapshotWriteEnabled", yesNo(status.activeSnapshotWriteEnabled)],
    ["materialisedSnapshotWriteEnabled", yesNo(status.materialisedSnapshotWriteEnabled)],
  ];
}

function boundaryRows(status = {}) {
  return [
    ["noWritesAttempted", yesNo(status.noWritesAttempted)],
    ["postEndpointsEnabled", yesNo(status.postEndpointsEnabled)],
    ["main readiness blocker", status.mainReadinessBlocker || "selected-engine-runtable-result-required"],
    ["raw IES contents", status.rawIesExposed ? "exposed" : "not exposed"],
    ["raw candela grid", flagValue(status, "rawCandelaGridExposed", false) ? "exposed" : "not exposed"],
    ["raw photometry payload", flagValue(status, "rawPhotometryPayloadExposed", false) ? "exposed" : "not exposed"],
    ["raw Engine payload", flagValue(status, "rawEnginePayloadExposed", false) ? "exposed" : "not exposed"],
    ["Lab proof claim", status.proofClaimsEmitted ? "emitted" : "not emitted"],
    ["candidate authority", status.candidateOutputOnly ? "candidate output only" : "unknown"],
  ];
}

function relationshipRows(relationshipMap = RELATIONSHIP_MAP) {
  return safeList(relationshipMap, RELATIONSHIP_MAP).map((item) => {
    if (typeof item === "string") return [item, "diagnostic relationship"];
    return [item.label || item.system || "unknown", item.role || item.description || "diagnostic relationship"];
  });
}

function readinessBlockerRows(blockers = READINESS_BLOCKERS_FALLBACK) {
  return safeList(blockers, READINESS_BLOCKERS_FALLBACK).map((blocker) => [
    blocker.code || blocker.label || "readiness-blocker",
    `${blocker.severity || "blocking"}: ${blocker.reason || "Selected Engine/RunTable result is required."}`,
  ]);
}

function oneMmPolicyRows(status = {}) {
  const geometryPolicy = safeObject(status.geometryPolicy, GEOMETRY_POLICY_FALLBACK);
  const photometryMetadataShape = safeObject(status.photometryMetadataShape, PHOTOMETRY_METADATA_SHAPE_FALLBACK);
  return [
    ["oneMmNormalised", yesNo(geometryPolicy.oneMmNormalised ?? photometryMetadataShape.oneMmNormalised)],
    ["baseLengthM", valueOrNone(geometryPolicy.baseLengthM ?? photometryMetadataShape.baseLengthM)],
    ["photometryMode", valueOrNone(geometryPolicy.photometryMode ?? photometryMetadataShape.photometryMode)],
    ["beamDirection", valueOrNone(geometryPolicy.beamDirection ?? photometryMetadataShape.beamDirection)],
    ["mirrorPolicy", valueOrNone(geometryPolicy.mirrorPolicy ?? photometryMetadataShape.mirrorPolicy)],
    ["regridPolicy", valueOrNone(geometryPolicy.regridPolicy ?? photometryMetadataShape.regridPolicy)],
    ["scalePolicy", valueOrNone(geometryPolicy.scalePolicy ?? photometryMetadataShape.scalePolicy)],
    ["rawCandelaGridExposed", yesNo(geometryPolicy.rawCandelaGridExposed ?? photometryMetadataShape.rawCandelaGridExposed)],
    ["rawIesContentExposed", yesNo(geometryPolicy.rawIesContentExposed ?? false)],
  ];
}

function createIesBuilderProjectIesExportDownloadOutcomeSnapshot({
  state = IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.idle,
  filename = null,
  mediaType = null,
  extension = null,
  byteLength = null,
  blocker = null,
} = {}) {
  const fields = {
    state,
    filename,
    mediaType,
    extension,
    byteLength,
    blocker,
  };

  return Object.freeze(Object.fromEntries(
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function safeProjectIesExportDownloadBlocker(
  blocker,
  fallback = "project-ies-export-download-action-blocked",
) {
  return typeof blocker === "string" && PROJECT_IES_EXPORT_DOWNLOAD_BLOCKER_PATTERN.test(blocker)
    ? blocker
    : fallback;
}

function safeProjectIesExportDownloadStartedMetadata(receipt) {
  const metadata = receipt?.downloadMetadata;
  if (receipt?.downloadTriggered !== true
    || receipt?.failClosed === true
    || !metadata
    || !PROJECT_IES_EXPORT_DOWNLOAD_FILENAME_PATTERN.test(String(metadata.filename || ""))
    || (metadata.mediaType !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE
      && metadata.mediaType !== PROJECT_IES_EXPORT_DOWNLOAD_LEGACY_MEDIA_TYPE)
    || metadata.extension !== ".ies"
    || !Number.isSafeInteger(metadata.byteLength)
    || metadata.byteLength <= 0) {
    return null;
  }

  return {
    filename: metadata.filename,
    mediaType: metadata.mediaType,
    extension: metadata.extension,
    byteLength: metadata.byteLength,
  };
}

export function createIesBuilderProjectIesExportDownloadOutcomeState() {
  let snapshot = createIesBuilderProjectIesExportDownloadOutcomeSnapshot();

  return Object.freeze({
    getSnapshot() {
      return snapshot;
    },

    recordReceipt(receipt = {}) {
      const metadata = safeProjectIesExportDownloadStartedMetadata(receipt);
      if (metadata) {
        snapshot = createIesBuilderProjectIesExportDownloadOutcomeSnapshot({
          state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started,
          ...metadata,
        });
        return snapshot;
      }

      snapshot = createIesBuilderProjectIesExportDownloadOutcomeSnapshot({
        state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
        blocker: safeProjectIesExportDownloadBlocker(receipt?.blocker),
      });
      return snapshot;
    },

    recordBlocked(blocker = "project-ies-export-download-action-failed") {
      snapshot = createIesBuilderProjectIesExportDownloadOutcomeSnapshot({
        state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
        blocker: safeProjectIesExportDownloadBlocker(
          blocker,
          "project-ies-export-download-action-failed",
        ),
      });
      return snapshot;
    },
  });
}

export function createIesBuilderProjectIesExportDownloadControl(
  action,
  { unavailableBlocker = "project-ies-export-download-action-seam-unavailable" } = {},
) {
  const actionAvailable = typeof action === "function";
  const fields = {
    schemaId: IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_ID,
    schemaVersion: IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_VERSION,
    contractId: IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_CONTRACT_ID,
    controlId: "project-ies-export-download",
    label: "Download project IES (.ies)",
    state: actionAvailable
      ? IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES.actionAvailable
      : IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES.blockedFailClosed,
    visible: true,
    enabled: actionAvailable,
    failClosed: !actionAvailable,
    blocker: actionAvailable ? null : unavailableBlocker,
    browserOnly: true,
    userGestureRequired: true,
    ephemeral: true,
    inMemoryOnly: true,
  };

  return Object.freeze(Object.fromEntries(
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

export function triggerIesBuilderProjectIesExportDownloadAction(input = {}) {
  return triggerIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary:
      input?.iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary,
    browserDocument: input?.browserDocument,
    browserUrlApi: input?.browserUrlApi,
  });
}

export function createIesBuilderViewModel({
  context,
  local = {},
  status = {},
  projectIesExportDownloadSourceBoundary = null,
  projectIesExportDownloadControlAction = null,
}) {
  const fallbackWarnings = [
    ...CANDIDATE_READINESS_BOUNDARY_STATEMENTS,
    ...CANDIDATE_OUTPUT_CONTRACT_BOUNDARY_COPY,
    ...REQUIRED_BOUNDARY_STATEMENTS,
  ];

  const schema = safeObject(status.schema, SCHEMA_FALLBACK);
  const candidateState = safeObject(status.candidateState, CANDIDATE_STATE_FALLBACK);
  const sourceRefs = safeObject(status.sourceRefs, SOURCE_REFS_FALLBACK);
  const selectedFamilySubsetLock = safeObject(status.selectedFamilySubsetLockPlaceholder, SELECTED_FAMILY_SUBSET_LOCK_FALLBACK);
  const productIntentSummary = safeObject(status.productIntentSummary, PRODUCT_INTENT_SUMMARY_FALLBACK);
  const geometryPolicy = safeObject(status.geometryPolicy, GEOMETRY_POLICY_FALLBACK);
  const runSummaryShape = safeObject(status.runSummaryShape, RUN_SUMMARY_SHAPE_FALLBACK);
  const photometryMetadataShape = safeObject(status.photometryMetadataShape, PHOTOMETRY_METADATA_SHAPE_FALLBACK);
  const candidateArtefactRefs = safeObject(status.candidateArtefactRefs, CANDIDATE_ARTEFACT_REFS_FALLBACK);
  const redactionFlags = safeObject(status.redactionFlags, REDACTION_FLAGS_FALLBACK);
  const handoffContract = safeObject(status.handoffContract, HANDOFF_CONTRACT_FALLBACK);
  const selectedResultStateSummary = safeObject(status.selectedResultStateSummary || handoffContract.selectedResultStateSummary, {});
  const selectedFamilySubsetLockReadiness = safeObject(status.selectedFamilySubsetLockReadiness || handoffContract.selectedFamilySubsetLockReadiness, {});
  const perRunLookupReadiness = safeObject(status.perRunLookupReadiness || handoffContract.perRunLookupReadiness, {});
  const boardDataSourceVersionReadiness = safeObject(status.boardDataSourceVersionReadiness || handoffContract.boardDataSourceVersionReadiness, {});
  const sourceInputFingerprintReadiness = safeObject(status.sourceInputFingerprintReadiness || handoffContract.sourceInputFingerprintReadiness, {});
  const sourcePhotometryRefReadiness = safeObject(status.sourcePhotometryRefReadiness || handoffContract.sourcePhotometryRefReadiness, {});
  const oneMmPolicy = safeObject(status.oneMmPolicy || handoffContract.oneMmPolicy, {});
  const contractBoundaryCopy = safeList(status.contractBoundaryCopy, CANDIDATE_OUTPUT_CONTRACT_BOUNDARY_COPY);
  const boundaryStatements = [
    ...CANDIDATE_READINESS_BOUNDARY_STATEMENTS,
    ...contractBoundaryCopy,
  ];
  const selectedProjectDownloadSourceBoundary = safeScalarBoundary(
    projectIesExportDownloadSourceBoundary,
  );
  const selectedProjectDownloadSourceReady = selectedProjectDownloadSourceBoundary?.ready === true
    && selectedProjectDownloadSourceBoundary?.readiness === "ready"
    && selectedProjectDownloadSourceBoundary?.failClosed === false;
  const selectedProjectDownloadControlAction = selectedProjectDownloadSourceReady
    && typeof projectIesExportDownloadControlAction === "function"
    ? projectIesExportDownloadControlAction
    : null;
  const selectedProjectDownloadAction = selectedProjectDownloadControlAction
    || triggerIesBuilderProjectIesExportDownloadAction;
  const projectIesExportDownloadOutcomeState =
    createIesBuilderProjectIesExportDownloadOutcomeState();

  return {
    moduleId: "ies_builder",
    label: "IES Builder / Photometry",
    localStatus: local.status || "not-requested",
    loadedAt: local.loadedAt || "none",
    lastAction: local.lastAction || "mounted",
    shellRoute: context?.route?.moduleId || "ies_builder",
    projectIesExportDownloadSourceBoundary: selectedProjectDownloadSourceBoundary,
    projectIesExportDownloadAction: selectedProjectDownloadAction,
    projectIesExportDownloadOutcomeState,
    projectIesExportDownloadControl: createIesBuilderProjectIesExportDownloadControl(
      selectedProjectDownloadControlAction,
      { unavailableBlocker: "project-ies-download-materialiser-capability-not-wired" },
    ),
    status,
    statusRows: statusRows(status),
    candidateContractRows: objectRows(schema, SCHEMA_FALLBACK),
    candidateStateRows: objectRows(candidateState, CANDIDATE_STATE_FALLBACK),
    readinessBlockerRows: readinessBlockerRows(status.readinessBlockers),
    sourceRefRows: objectRows(sourceRefs, SOURCE_REFS_FALLBACK),
    selectedFamilySubsetLockRows: objectRows(selectedFamilySubsetLock, SELECTED_FAMILY_SUBSET_LOCK_FALLBACK),
    productIntentRows: objectRows(productIntentSummary, PRODUCT_INTENT_SUMMARY_FALLBACK),
    geometryPolicyRows: objectRows(geometryPolicy, GEOMETRY_POLICY_FALLBACK),
    oneMmPolicyRows: oneMmPolicyRows(status),
    runSummaryShapeRows: objectRows(runSummaryShape, RUN_SUMMARY_SHAPE_FALLBACK),
    photometryMetadataShapeRows: objectRows(photometryMetadataShape, PHOTOMETRY_METADATA_SHAPE_FALLBACK),
    candidateArtefactRefRows: objectRows(candidateArtefactRefs, CANDIDATE_ARTEFACT_REFS_FALLBACK),
    redactionFlagRows: objectRows(redactionFlags, REDACTION_FLAGS_FALLBACK),
    handoffContractRows: objectRows(handoffContract, HANDOFF_CONTRACT_FALLBACK),
    handoffBlockerRows: readinessBlockerRows(handoffContract.blockers || status.handoffBlockers),
    selectedResultStateSummaryRows: objectRows(selectedResultStateSummary),
    selectedFamilySubsetLockReadinessRows: objectRows(selectedFamilySubsetLockReadiness),
    perRunLookupReadinessRows: objectRows(perRunLookupReadiness),
    boardDataSourceVersionReadinessRows: objectRows(boardDataSourceVersionReadiness),
    sourceInputFingerprintReadinessRows: objectRows(sourceInputFingerprintReadiness),
    sourcePhotometryRefReadinessRows: objectRows(sourcePhotometryRefReadiness),
    handoffOneMmPolicyRows: objectRows(oneMmPolicy),
    fixtureParserDiagnosticRows: fixtureParserDiagnosticRows(status),
    candidateReadinessFlagRows: candidateReadinessFlagRows(status),
    candidateReadinessRequirements: [...safeList(status.candidateReadinessRequirements, CANDIDATE_READINESS_REQUIREMENTS)],
    candidateStates: [...safeList(status.candidateStates, CANDIDATE_STATES)],
    relationshipRows: relationshipRows(status.relationshipMap),
    safetyRows: safetyRows(status),
    lockRows: lockRows(status),
    boundaryRows: boundaryRows(status),
    boundaryStatements,
    contractBoundaryCopy: [...contractBoundaryCopy],
    warnings: safeList(status.warnings, fallbackWarnings),
  };
}

function resolveIesBuilderProjectIesExportDownloadCapability({ services = {}, context = {} } = {}) {
  const serviceCapability = services?.materialiseProjectIesDownload;
  if (typeof serviceCapability === "function") return serviceCapability.bind(services);

  const nestedServiceCapability = services?.iesBuilder?.materialiseProjectIesDownload;
  if (typeof nestedServiceCapability === "function") {
    return nestedServiceCapability.bind(services.iesBuilder);
  }

  const contextCapability = context?.materialiseProjectIesDownload;
  if (typeof contextCapability === "function") return contextCapability.bind(context);

  const nestedContextCapability = context?.iesBuilder?.materialiseProjectIesDownload;
  if (typeof nestedContextCapability === "function") {
    return nestedContextCapability.bind(context.iesBuilder);
  }

  return null;
}

export async function prepareIesBuilderProjectIesExportDownloadCapabilityAction({
  projectIesExportDownloadSourceBoundary = null,
  services = {},
  context = {},
  browserDocument,
  browserUrlApi,
} = {}) {
  const materialiseProjectIesDownload = resolveIesBuilderProjectIesExportDownloadCapability({
    services,
    context,
  });
  if (typeof materialiseProjectIesDownload !== "function") return null;

  const readbackStatus =
    getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(
      projectIesExportDownloadSourceBoundary,
    );
  if (!readbackStatus) return null;

  let materialisationBoundary;
  try {
    materialisationBoundary =
      await buildRuntimeIesFirstNarrowProjectIesExportDownloadMaterialisationBoundary({
        iesFirstNarrowProjectIesExportResultReadbackStatus: readbackStatus,
        materialiseProjectIesDownload,
      });
  } catch {
    return null;
  }

  if (materialisationBoundary?.ready !== true
    || materialisationBoundary?.failClosed !== false) return null;

  return function triggerPreparedIesBuilderProjectIesExportDownload() {
    return triggerIesBuilderProjectIesExportDownloadAction({
      iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: materialisationBoundary,
      browserDocument: browserDocument || globalThis.document,
      browserUrlApi: browserUrlApi || globalThis.URL,
    });
  };
}
