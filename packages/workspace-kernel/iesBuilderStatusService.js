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
    "handoffContract",
    "handoffState",
    "handoffBlockers",
    "selectedResultStateSummary",
    "selectedFamilySubsetLockReadiness",
    "perRunLookupReadiness",
    "boardDataSourceVersionReadiness",
    "sourceInputFingerprintReadiness",
    "sourcePhotometryRefReadiness",
    "oneMmPolicy",
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

export const IES_BUILDER_SELECTED_RESULT_HANDOFF_SCHEMA = Object.freeze({
  schemaId: "controlstack.ies_builder.selected_result_handoff_contract.v1",
  schemaVersion: "v1",
  surface: "read_only_selected_result_handoff_status",
  description: "Read-only scaffold that lets IES Builder decide whether safe selected-result metadata is ready for future candidate output.",
  fields: Object.freeze([
    "schemaId",
    "readOnly",
    "candidateOutputOnly",
    "productionProof",
    "labProofAuthority",
    "handoffState",
    "blockers",
    "selectorSafeIntentSummaryPlaceholder",
    "selectedResultStateSummary",
    "selectedFamilySubsetLockReadiness",
    "perRunLookupReadiness",
    "boardDataSourceVersionReadiness",
    "sourceInputFingerprintReadiness",
    "sourcePhotometryRefReadiness",
    "oneMmPolicy",
    "candidateArtefactRefs",
    "redactionFlags",
  ]),
});

export const IES_BUILDER_HANDOFF_STATES = Object.freeze([
  "waiting_for_selected_engine_runtable_result",
  "blocked_selected_result_unavailable",
  "blocked_selected_result_stale",
  "blocked_missing_family_subset_lock",
  "blocked_missing_source_photometry_ref",
  "metadata_ready_for_future_candidate_output",
]);

const HANDOFF_BLOCKER_DEFINITIONS = Object.freeze({
  waitingForSelectedEngineRunTableResult: Object.freeze({
    code: "waiting-for-selected-engine-runtable-result",
    severity: "blocking",
    label: "Waiting for selected Engine/RunTable result",
    reason: "IES Builder cannot receive candidate metadata until one accepted selected Engine/RunTable result exists.",
    owner: "Engine/RunTable selected-result source",
  }),
  selectedResultUnavailable: Object.freeze({
    code: "selected-result-unavailable",
    severity: "blocking",
    label: "Selected result unavailable",
    reason: "The selected-result projection is not accepted, not engine verified, or not available.",
    owner: "Engine/RunTable selected-result adapter",
  }),
  selectedResultStale: Object.freeze({
    code: "selected-result-stale",
    severity: "blocking",
    label: "Selected result stale",
    reason: "The selected result is stale and must be verified again before IES Builder can receive metadata.",
    owner: "Engine/RunTable selected-result adapter",
  }),
  missingFamilySubsetLock: Object.freeze({
    code: "missing-selected-family-subset-lock",
    severity: "blocking",
    label: "Missing selected family/subset lock",
    reason: "The accepted selected result must lock board family, pitch family, optical/current assumptions, zone split strategy, and driver family before IES handoff.",
    owner: "Engine/RunTable selected-result adapter",
  }),
  missingPerRunLookup: Object.freeze({
    code: "missing-per-run-lookup-normalised",
    severity: "blocking",
    label: "Missing normalised per-run lookup",
    reason: "IES Builder requires the safe per-run lookup summary produced by the selected-result adapter.",
    owner: "Engine/RunTable selected-result adapter",
  }),
  missingBoardDataSourceVersion: Object.freeze({
    code: "missing-board-data-source-version",
    severity: "blocking",
    label: "Missing Board Data source version",
    reason: "IES Builder needs an opaque Board Data source-version readiness marker before future candidate metadata handoff.",
    owner: "Board Data / selected-result adapter",
  }),
  missingSourceInputFingerprint: Object.freeze({
    code: "missing-source-input-fingerprint",
    severity: "blocking",
    label: "Missing source-input fingerprint",
    reason: "IES Builder needs a source-input fingerprint readiness marker; stale comparison remains metadata-only in this slice.",
    owner: "Selector / selected-result adapter",
  }),
  missingSourcePhotometryRef: Object.freeze({
    code: "missing-source-photometry-ref",
    severity: "blocking",
    label: "Missing source photometry ref",
    reason: "IES Builder needs only an opaque source photometry ref placeholder before future candidate output metadata can be ready.",
    owner: "future IES Builder / Board Data photometry metadata",
  }),
});

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(source, key) {
  return isRecord(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function firstPresent(source, keys) {
  if (!isRecord(source)) return undefined;
  for (const key of keys) {
    if (hasOwn(source, key)) return source[key];
  }
  return undefined;
}

function isPresent(value) {
  return value !== undefined && value !== null && value !== "";
}

function asNonNegativeInteger(value, fallback = 0) {
  if (!isPresent(value) || typeof value === "boolean") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.round(parsed);
}

function textLooksUnsafe(text) {
  const value = String(text || "");
  return /[A-Za-z]:\\/.test(value)
    || value.includes("\\")
    || value.includes("/ControlStack")
    || value.includes("ControlStack\\")
    || value.includes("data:")
    || value.includes("base64")
    || /\.pdf\b/i.test(value)
    || /\.ies\b/i.test(value)
    || /password|credential|secret|token/i.test(value)
    || /users\b/i.test(value)
    || /raw|candela|photometric grid|lab evidence/i.test(value);
}

function safeText(value, fallback = null, maxLength = 140) {
  if (!isPresent(value)) return fallback;
  const raw = String(value).trim();
  if (!raw || textLooksUnsafe(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function blocker(key) {
  return clonePlain(HANDOFF_BLOCKER_DEFINITIONS[key]);
}

function lockFieldsPresent(lock) {
  if (!isRecord(lock)) return [];
  return ["boardFamily", "pitchFamily", "opticCurrentAssumptions", "zoneSplitStrategy", "driverFamily"]
    .filter((key) => isPresent(lock[key]));
}

function sourcePhotometryRefFrom(projection) {
  return firstPresent(projection, ["sourcePhotometryRef", "source_photometry_ref"])
    ?? firstPresent(projection.photometryMetadataShape, ["sourcePhotometryRef", "source_photometry_ref"])
    ?? firstPresent(projection.photometryMetadata, ["sourcePhotometryRef", "source_photometry_ref"])
    ?? firstPresent(projection.sourceRefs, ["sourcePhotometryRef", "photometryRef", "photometryMetadataRef"]);
}

function buildSelectedResultStateSummary(projection) {
  const runs = Array.isArray(projection.runs) ? projection.runs : [];
  const runCount = asNonNegativeInteger(firstPresent(projection.perRunLookupSummary, ["runCount", "count"]), runs.length);
  return {
    sourceAvailable: projection.sourceAvailable === true,
    selectedResultAvailable: projection.selectedResultAvailable === true,
    selectedResultUnavailableReason: safeText(projection.selectedResultUnavailableReason, null, 220),
    accepted: projection.accepted === true,
    engineVerified: projection.engineVerified === true,
    stale: projection.stale === true || projection.state === "stale" || projection.resultState === "stale",
    state: safeText(projection.state || projection.resultState, "no_selected_result", 80),
    resultState: safeText(projection.resultState || projection.state, "no_selected_result", 80),
    resultStateLabel: safeText(projection.resultStateLabel, "Estimated preview", 120),
    selectedTierOrProfile: safeText(projection.selectedTierOrProfile || projection.selectedProfileTier, null, 120),
    estimatedPreviewOnly: projection.estimatedPreviewOnly !== false,
    runCount,
    rawSelectedPayloadExposed: false,
    rawEnginePayloadExposed: false,
    rawEngineDebugPayloadExposed: false,
  };
}

function buildLockReadiness(projection) {
  const lock = isRecord(projection.selectedFamilySubsetLock) ? projection.selectedFamilySubsetLock : null;
  const fieldsPresent = lockFieldsPresent(lock);
  return {
    ready: fieldsPresent.length === 5,
    required: true,
    status: fieldsPresent.length === 5 ? "ready" : "missing",
    fieldsRequired: ["boardFamily", "pitchFamily", "opticCurrentAssumptions", "zoneSplitStrategy", "driverFamily"],
    fieldsPresent,
    rawLockExposed: false,
  };
}

function buildPerRunLookupReadiness(projection) {
  const runs = Array.isArray(projection.runs) ? projection.runs : [];
  const runCount = asNonNegativeInteger(firstPresent(projection.perRunLookupSummary, ["runCount", "count"]), runs.length);
  return {
    ready: projection.perRunLookupNormalised === true && runCount > 0,
    required: true,
    status: projection.perRunLookupNormalised === true && runCount > 0 ? "ready" : "missing",
    normalised: projection.perRunLookupNormalised === true,
    lookupKey: safeText(firstPresent(projection.perRunLookupSummary, ["lookupKey"]) || projection.perRunLookupKey, "run id / run number / run key", 120),
    runCount,
    rawLookupExposed: false,
  };
}

function buildBoardDataSourceVersionReadiness(projection) {
  const present = isPresent(projection.boardDataSourceVersion)
    || firstPresent(projection.boardDataSourceVersionMetadata, ["present"]) === true;
  return {
    ready: present,
    required: true,
    status: present ? "ready" : "missing",
    opaqueVersionRef: present ? "opaque-board-data-source-version-present" : null,
    rawVersionExposed: false,
  };
}

function buildSourceInputFingerprintReadiness(projection) {
  const present = isPresent(projection.sourceInputFingerprint)
    || firstPresent(projection.sourceInputFingerprintMetadata, ["present"]) === true;
  return {
    ready: present,
    required: true,
    status: present ? "ready" : "missing",
    opaqueFingerprintRef: present ? "opaque-source-input-fingerprint-present" : null,
    staleComparisonImplemented: false,
    staleResultComparisonAttempted: false,
    rawFingerprintExposed: false,
  };
}

function buildSourcePhotometryRefReadiness(projection) {
  const present = isPresent(sourcePhotometryRefFrom(projection));
  return {
    ready: present,
    required: true,
    status: present ? "opaque_placeholder_ready" : "missing",
    sourcePhotometryRef: present ? "opaque-source-photometry-ref-present" : null,
    opaquePlaceholderOnly: true,
    rawPhotometryRefExposed: false,
    rawPhotometryPayloadExposed: false,
    filenamesExposed: false,
    localPathsExposed: false,
  };
}

function buildOneMmPolicyMetadata() {
  return {
    oneMmNormalised: true,
    baseLengthM: 0.001,
    photometryMode: "normalise_1mm_candidate",
    beamDirection: "metadata_only_pending_candidate_output",
    mirrorPolicy: "policy_label_only",
    regridPolicy: "policy_label_only",
    scalePolicy: "scale_to_1mm_metadata_only",
    rawCandelaGridExposed: false,
    rawIesContentExposed: false,
    rawPhotometryPayloadExposed: false,
  };
}

export function buildIesBuilderSelectedResultHandoffContract(selectedResultProjection = null) {
  const projection = isRecord(selectedResultProjection) ? selectedResultProjection : {};
  const hasProjection = isRecord(selectedResultProjection);
  const selectedResultStateSummary = buildSelectedResultStateSummary(projection);
  const selectedFamilySubsetLockReadiness = buildLockReadiness(projection);
  const perRunLookupReadiness = buildPerRunLookupReadiness(projection);
  const boardDataSourceVersionReadiness = buildBoardDataSourceVersionReadiness(projection);
  const sourceInputFingerprintReadiness = buildSourceInputFingerprintReadiness(projection);
  const sourcePhotometryRefReadiness = buildSourcePhotometryRefReadiness(projection);
  const blockers = [];

  let handoffState = "metadata_ready_for_future_candidate_output";
  if (!hasProjection) {
    handoffState = "waiting_for_selected_engine_runtable_result";
    blockers.push(blocker("waitingForSelectedEngineRunTableResult"));
  } else if (selectedResultStateSummary.stale) {
    handoffState = "blocked_selected_result_stale";
    blockers.push(blocker("selectedResultStale"));
  } else if (
    selectedResultStateSummary.selectedResultAvailable !== true
    || selectedResultStateSummary.accepted !== true
    || selectedResultStateSummary.engineVerified !== true
  ) {
    handoffState = "blocked_selected_result_unavailable";
    blockers.push(blocker("selectedResultUnavailable"));
  }

  if (hasProjection && selectedResultStateSummary.stale !== true) {
    if (!selectedFamilySubsetLockReadiness.ready) {
      if (handoffState === "metadata_ready_for_future_candidate_output") handoffState = "blocked_missing_family_subset_lock";
      blockers.push(blocker("missingFamilySubsetLock"));
    }
    if (!perRunLookupReadiness.ready) {
      if (handoffState === "metadata_ready_for_future_candidate_output") handoffState = "blocked_selected_result_unavailable";
      blockers.push(blocker("missingPerRunLookup"));
    }
    if (!boardDataSourceVersionReadiness.ready) {
      if (handoffState === "metadata_ready_for_future_candidate_output") handoffState = "blocked_selected_result_unavailable";
      blockers.push(blocker("missingBoardDataSourceVersion"));
    }
    if (!sourceInputFingerprintReadiness.ready) {
      if (handoffState === "metadata_ready_for_future_candidate_output") handoffState = "blocked_selected_result_unavailable";
      blockers.push(blocker("missingSourceInputFingerprint"));
    }
    if (!sourcePhotometryRefReadiness.ready) {
      if (handoffState === "metadata_ready_for_future_candidate_output") handoffState = "blocked_missing_source_photometry_ref";
      blockers.push(blocker("missingSourcePhotometryRef"));
    }
  }

  const redactionFlags = {
    ...clonePlain(REDACTION_FLAGS),
    rawRoughElectricalPayloadExposed: false,
    rawEngineDebugPayloadExposed: false,
    rawPhotometryRefExposed: false,
    rawSourceInputFingerprintExposed: false,
    rawBoardDataSourceVersionExposed: false,
    rawSelectedResultProjectionExposed: false,
  };

  return {
    schema: clonePlain(IES_BUILDER_SELECTED_RESULT_HANDOFF_SCHEMA),
    schemaId: IES_BUILDER_SELECTED_RESULT_HANDOFF_SCHEMA.schemaId,
    schemaVersion: IES_BUILDER_SELECTED_RESULT_HANDOFF_SCHEMA.schemaVersion,
    readOnly: true,
    diagnosticOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    handoffState,
    handoffStates: [...IES_BUILDER_HANDOFF_STATES],
    ready: handoffState === "metadata_ready_for_future_candidate_output",
    blockers,
    selectorSafeIntentSummaryPlaceholder: clonePlain(PRODUCT_INTENT_SUMMARY),
    selectedResultStateSummary,
    selectedFamilySubsetLockReadiness,
    perRunLookupReadiness,
    boardDataSourceVersionReadiness,
    sourceInputFingerprintReadiness,
    sourcePhotometryRefReadiness,
    oneMmPolicy: buildOneMmPolicyMetadata(),
    candidateArtefactRefs: clonePlain(CANDIDATE_ARTEFACT_REFS),
    redactionFlags,
    safetyFlags: {
      readOnly: true,
      candidateOutputOnly: true,
      productionProof: false,
      labProofAuthority: false,
      iesUploadEnabled: false,
      iesParseEnabled: false,
      iesExportEnabled: false,
      iesGenerationEnabled: false,
      polarPreviewEnabled: false,
      engineExecutionEnabled: false,
      runTableGenerationEnabled: false,
      payloadGenerationEnabled: false,
      selectorMutationEnabled: false,
      boardDataMutationEnabled: false,
      labProofMutationEnabled: false,
      complianceApprovalEnabled: false,
      rawExposureEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
  };
}

export function buildIesBuilderStatus(options = {}) {
  const handoffContract = buildIesBuilderSelectedResultHandoffContract(
    isRecord(options) ? (options.selectedResultProjection || options.selectedResultAdapterProjection || null) : null,
  );

  return {
    ...SAFE_IES_BUILDER_STATUS,
    selectedResultAvailable: handoffContract.selectedResultStateSummary.selectedResultAvailable,
    handoffState: handoffContract.handoffState,
    handoffBlockers: clonePlain(handoffContract.blockers),
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
    handoffContract,
    selectedResultStateSummary: clonePlain(handoffContract.selectedResultStateSummary),
    selectedFamilySubsetLockReadiness: clonePlain(handoffContract.selectedFamilySubsetLockReadiness),
    perRunLookupReadiness: clonePlain(handoffContract.perRunLookupReadiness),
    boardDataSourceVersionReadiness: clonePlain(handoffContract.boardDataSourceVersionReadiness),
    sourceInputFingerprintReadiness: clonePlain(handoffContract.sourceInputFingerprintReadiness),
    sourcePhotometryRefReadiness: clonePlain(handoffContract.sourcePhotometryRefReadiness),
    oneMmPolicy: clonePlain(handoffContract.oneMmPolicy),
    redactionFlags: clonePlain(REDACTION_FLAGS),
    redactionRules: [...REDACTION_RULES],
    contractBoundaryCopy: [...CANDIDATE_CONTRACT_BOUNDARY_COPY],
    blockedActions: [...BLOCKED_ACTIONS],
    warnings: [...IES_BUILDER_WARNINGS],
  };
}
