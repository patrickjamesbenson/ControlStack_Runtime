export const SELECTED_RESULT_PROJECTION_SOURCE_LABEL = "future Engine/RunTable selected-result projection";

export const SELECTED_RESULT_PROJECTION_STATES = Object.freeze([
  "no_selected_result",
  "estimated_preview",
  "engine_verified",
  "stale",
  "selected_accepted",
]);

export const SELECTED_RESULT_PROJECTION_STATE_LABELS = Object.freeze({
  no_selected_result: "Estimated preview",
  estimated_preview: "Estimated preview",
  engine_verified: "Engine verified",
  stale: "Run table changed — verify again",
  selected_accepted: "Engine verified",
});

export const SELECTED_RESULT_APPROVED_STATE_LABELS = Object.freeze([
  "Estimated preview",
  "Engine verified",
  "Run table changed — verify again",
]);

export const SELECTED_RESULT_STALE_HISTORICAL_LABEL = "Result stale — run table changed, verify again";

export const SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS = Object.freeze([
  "tierStrategy",
  "system",
  "optic",
  "environment",
  "finishes",
  "controlType",
  "lightTarget",
  "cct",
  "cri",
  "runLength",
  "runQty",
  "runAccessories",
  "emergencyPlacementIntent",
  "accessoryPlacementIntent",
  "selectedBoardFamily",
  "selectedPitchFamily",
  "opticCurrentAssumptions",
  "zoneSplitStrategy",
  "driverFamily",
  "selectorPayloadFingerprint",
  "boardDataSourceVersion",
]);

export const SELECTED_RESULT_PER_RUN_DISPLAY_ROW_SHAPE = Object.freeze({
  runKey: null,
  runLabel: null,
  runNumber: null,
  runLengthMm: null,
  bodyMmRequested: null,
  segmentSummary: null,
  segmentsSummary: null,
  reservedRangesSummary: null,
  boardRunSummary: null,
  boardCount: null,
  boardFamily: null,
  zoneCount: null,
  zonePlanSummary: null,
  zoneTargetSummary: null,
  mechanicalSummary: null,
  suspensionSummary: null,
  clipSummary: null,
  gearTraySummary: null,
  sanitisedWarnings: null,
});

export const SELECTED_RESULT_FAMILY_SUBSET_LOCK_SHAPE = Object.freeze({
  boardFamily: null,
  pitchFamily: null,
  opticCurrentAssumptions: null,
  zoneSplitStrategy: null,
  driverFamily: null,
});

export const SELECTED_RESULT_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  displayOnly: true,
  contractOnly: true,
  sourceAvailable: false,
  engineExecutionEnabled: false,
  engineVerificationEnabled: false,
  selectedResultIngestionEnabled: false,
  selectedResultPersistenceEnabled: false,
  staleResultComparisonEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  iesGenerationEnabled: false,
  drawingGenerationEnabled: false,
  labProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregApprovalEnabled: false,
  rregCustodyTransferEnabled: false,
  hubSpotCrmWriteBackEnabled: false,
  boardDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
  rawSelectedPayloadExposed: false,
  rawEngineDebugPayloadExposed: false,
  rawCandidateAlternativesExposedAsFinalOutputs: false,
  rawBoardDataRowsExposed: false,
  rawBoardDataHeadersExposed: false,
  rawUsersExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  rawLabEvidenceExposed: false,
  rawIesExposed: false,
  rawArtefactsExposed: false,
  rawPdfsExposed: false,
});

export const SELECTED_RESULT_REDACTION_RULES = Object.freeze([
  "Expose a safe selected-result projection only, not the raw selected payload.",
  "Expose sanitised warnings only, not raw engine debug.",
  "Expose one accepted selected result only; keep weighted alternatives out of normal-user final outputs.",
  "Expose no Board Data rows or headers.",
  "Expose no USERS details, credentials, private/local paths, Lab evidence, IES contents, PDFs, or artefacts.",
]);

export const SELECTED_RESULT_BOUNDARY_COPY = Object.freeze([
  "Selected-result projection is read-only and fail-closed in this slice.",
  "No selected Engine/RunTable source is connected here.",
  "Default state is Estimated preview with no accepted selected result.",
  "This contract does not fire the engine, generate RunTable output, ingest results, persist results, or compare stale fingerprints.",
  "Future providers must supply one accepted successful result, normalised per run and locked to one selected subset/family.",
  "Engine-verified display is not Lab Proof. Lab Proof proves later.",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function stateLabelFor(state) {
  return SELECTED_RESULT_PROJECTION_STATE_LABELS[state] || SELECTED_RESULT_PROJECTION_STATE_LABELS.no_selected_result;
}

export function createSelectedResultPerRunDisplayRowShape() {
  return clonePlain(SELECTED_RESULT_PER_RUN_DISPLAY_ROW_SHAPE);
}

export function buildSelectedResultProjectionContract() {
  const state = "no_selected_result";
  const stateLabel = stateLabelFor(state);
  const safetyFlags = clonePlain(SELECTED_RESULT_SAFETY_FLAGS);
  return {
    ok: true,
    source: SELECTED_RESULT_PROJECTION_SOURCE_LABEL,
    sourceAvailable: false,
    sourceState: "no_source",
    readOnly: true,
    displayOnly: true,
    contractOnly: true,
    failClosed: true,
    state,
    stateEnum: [...SELECTED_RESULT_PROJECTION_STATES],
    resultStateLabel: stateLabel,
    approvedStateLabels: [...SELECTED_RESULT_APPROVED_STATE_LABELS],
    staleHistoricalLabel: SELECTED_RESULT_STALE_HISTORICAL_LABEL,
    selectedResultAvailable: false,
    selectedResultUnavailableReason: "no selected Engine/RunTable result source connected",
    estimatedPreviewOnly: true,
    engineVerified: false,
    stale: false,
    accepted: false,
    engineVerificationEnabled: false,
    selectedResultIngestionEnabled: false,
    selectedResultPersistenceEnabled: false,
    staleResultComparisonEnabled: false,
    selectedProfileTier: null,
    selectedFamilySubsetLock: null,
    selectedFamilySubsetLockShape: clonePlain(SELECTED_RESULT_FAMILY_SUBSET_LOCK_SHAPE),
    perRunDisplayRowShape: createSelectedResultPerRunDisplayRowShape(),
    perRunLookupNormalised: false,
    perRunLookupKey: "run id / run number",
    runs: [],
    runsByKey: {},
    staleSensitiveInputKeys: [...SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS],
    redactionRules: [...SELECTED_RESULT_REDACTION_RULES],
    safetyFlags,
    boundaryCopy: [...SELECTED_RESULT_BOUNDARY_COPY],
    rows: [
      ["source", SELECTED_RESULT_PROJECTION_SOURCE_LABEL],
      ["source state", "no_source"],
      ["state", state],
      ["result state label", stateLabel],
      ["selected result available", "false"],
      ["engine verified", "false"],
      ["stale", "false"],
      ["accepted", "false"],
      ["selected family/subset lock", "none"],
      ["per-run lookup", "not available"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}
