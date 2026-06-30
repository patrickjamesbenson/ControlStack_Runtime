export const IES_BUILDER_STATUS_PATH = "/api/ies-builder/status";

export const IES_BUILDER_CANDIDATE_OUTPUT_SCHEMA = Object.freeze({
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

const IES_BUILDER_WARNINGS = Object.freeze([
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

const READINESS_BLOCKERS = Object.freeze([
  Object.freeze({
    code: "selected-engine-runtable-result-required",
    severity: "blocking",
    label: "Selected Engine/RunTable result required",
    reason: "IES Builder waits for one accepted selected Engine/RunTable result before any real IES candidate can be generated.",
    owner: "Engine/RunTable selected-result source",
  }),
]);

const CANDIDATE_STATE = Object.freeze({
  state: "waiting_for_selected_engine_runtable_result",
  label: "Waiting for selected Engine/RunTable result",
  ready: false,
  selectedResultRequired: true,
  selectedResultAvailable: false,
  candidateOutputOnly: true,
  generationDisabled: true,
  proofStatus: "not_proof_authority",
});

const SOURCE_REFS = Object.freeze({
  selectorSelectedResultProjectionRef: "future-selected-result-projection-ref",
  runTableSelectedResultSourceRef: "future-engine-runtable-selected-result-ref",
  boardDataRef: "future-board-data-metadata-ref",
  labProofRef: "future-lab-proof-authority-ref",
  controlledRecordRef: "future-controlled-record-ref",
  refsAreOpaque: true,
  rawRefsExposed: false,
});

const SELECTED_FAMILY_SUBSET_LOCK_PLACEHOLDER = Object.freeze({
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

const PRODUCT_INTENT_SUMMARY = Object.freeze({
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

const GEOMETRY_POLICY = Object.freeze({
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

const RUN_SUMMARY_SHAPE = Object.freeze({
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

const PHOTOMETRY_METADATA_SHAPE = Object.freeze({
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

const CANDIDATE_ARTEFACT_REFS = Object.freeze({
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

const REDACTION_FLAGS = Object.freeze({
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

const CANDIDATE_CONTRACT_BOUNDARY_COPY = Object.freeze([
  "IES Builder is candidate-output-only in this slice.",
  "IES Builder does not own actual build geometry.",
  "Engine/RunTable owns run length, segments, board runs, zones, driver/control topology, and selected family/subset locks.",
  "The main readiness blocker is the missing selected Engine/RunTable result.",
  "1mm policy is metadata only: oneMmNormalised true, baseLengthM 0.001, and photometryMode normalise_1mm_candidate.",
  "Lab Proof proves later; IES Builder does not claim proof authority.",
  "Raw artefacts are hidden and only opaque future refs may be displayed.",
]);

const REDACTION_RULES = Object.freeze([
  "Expose contract/status metadata only, not raw candidate artefacts.",
  "Expose no raw IES text, raw candela grid, raw photometry payload, or raw Engine payload.",
  "Expose no raw Board Data rows or headers.",
  "Expose no Lab evidence, PDFs, artefact payloads, or base64 polar plots.",
  "Expose no local paths, repo paths, filenames, credentials, USERS details, or provider details.",
]);

const SAFE_IES_BUILDER_STATUS = Object.freeze({
  ok: true,
  endpoint: IES_BUILDER_STATUS_PATH,
  owner: "runtime-server",
  moduleId: "ies_builder",
  label: "IES Builder / Photometry",
  readOnly: true,
  diagnosticOnly: true,
  candidateReadinessExplanationOnly: true,
  contractOnly: true,
  candidateOutputOnly: true,
  productionProof: false,
  productionProofAuthority: false,
  labApprovalRequired: true,
  labProofAuthority: false,
  selectorMutationEnabled: false,
  boardDataWritesEnabled: false,
  boardDataMutationEnabled: false,
  iesGenerationEnabled: false,
  uploadEnabled: false,
  parseEnabled: false,
  parseUploadEnabled: false,
  exportEnabled: false,
  polarPreviewEnabled: false,
  engineExecutionEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  proofClaimsEmitted: false,
  rawIesExposed: false,
  rawCandelaGridExposed: false,
  rawPhotometryPayloadExposed: false,
  rawEnginePayloadExposed: false,
  rawSelectedEnginePayloadExposed: false,
  rawBoardDataRowsExposed: false,
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
  donorPythonMounted: false,
  donorCodeMounted: false,
  largeDependenciesAdded: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  noWritesAttempted: true,
  postEndpointsEnabled: false,
  proofStatus: "not_proof_authority",
  currentStatusSummary: "Read-only IES candidate-output contract/status metadata is available; real generation waits for a selected Engine/RunTable result.",
  parserCapabilityStatus: "safe_summary_only_no_raw_ies",
  fixtureSampleReadinessStatus: "metadata_only_no_upload_enabled",
  candidateBoundary: "candidate_output_only_not_approved_proof",
  proofBoundarySummary: "Lab Proof remains the boundary for proof authority.",
  selectedResultRequired: true,
  selectedResultAvailable: false,
  mainReadinessBlocker: "selected-engine-runtable-result-required",
});

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

export function buildIesBuilderStatus() {
  return {
    ...SAFE_IES_BUILDER_STATUS,
    schema: clonePlain(IES_BUILDER_CANDIDATE_OUTPUT_SCHEMA),
    candidateState: clonePlain(CANDIDATE_STATE),
    readinessBlockers: clonePlain(READINESS_BLOCKERS),
    sourceRefs: clonePlain(SOURCE_REFS),
    selectedFamilySubsetLockPlaceholder: clonePlain(SELECTED_FAMILY_SUBSET_LOCK_PLACEHOLDER),
    productIntentSummary: clonePlain(PRODUCT_INTENT_SUMMARY),
    geometryPolicy: clonePlain(GEOMETRY_POLICY),
    runSummaryShape: clonePlain(RUN_SUMMARY_SHAPE),
    photometryMetadataShape: clonePlain(PHOTOMETRY_METADATA_SHAPE),
    candidateArtefactRefs: clonePlain(CANDIDATE_ARTEFACT_REFS),
    redactionFlags: clonePlain(REDACTION_FLAGS),
    redactionRules: [...REDACTION_RULES],
    contractBoundaryCopy: [...CANDIDATE_CONTRACT_BOUNDARY_COPY],
    blockedActions: [...BLOCKED_ACTIONS],
    warnings: [...IES_BUILDER_WARNINGS],
  };
}
