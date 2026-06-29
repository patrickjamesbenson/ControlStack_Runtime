import { buildSelectedResultProjectionContract } from "./selectedResultProjectionService.js";

export const RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL = "future RunTable / Engine Result source";

export const RUNTABLE_SELECTED_RESULT_SOURCE_STATE = "source_unavailable";

export const RUNTABLE_SELECTED_RESULT_PER_RUN_LOOKUP_KEY = "run id / run number";

export const RUNTABLE_SELECTED_RESULT_FUTURE_SOURCE_REQUIRED_FIELDS = Object.freeze([
  "oneSuccessfulAcceptedResult",
  "resultStateLabel",
  "tierEvaluationSummary",
  "selectedTierOrProfile",
  "selectedReason",
  "perRunLookupByRunIdOrNumber",
  "runLengthMm",
  "bodyMmRequested",
  "segments",
  "reservedRanges",
  "boardRun",
  "zonePlan",
  "mechanical",
  "boards",
  "diagnosticBoardFamily",
  "diagnosticZoneCount",
  "diagnosticZoneTargetsMm",
  "suspensionPointsMm",
  "clipPointsMm",
  "gearTrayPlan",
  "sanitisedWarnings",
  "selectedFamilySubsetLock",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
]);

export const RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP = Object.freeze([
  "tierStrategy: Selector owns human profile strategy intent",
  "system: Selector owns selected system/profile intent",
  "optic: Selector owns direct and indirect optic intent",
  "environment: Selector owns IP/IK/application/electrical environment intent",
  "finishes: Selector owns finish intent where it affects build/manufacturing",
  "controlType: Selector owns control/driver intent",
  "lightTarget: Selector owns target lm/m intent",
  "cct: Selector owns CCT intent",
  "cri: Selector owns CRI intent",
  "runLength: RunTable owns entered run lengths",
  "runQty: RunTable owns entered run quantities",
  "runAccessories: RunTable owns run accessory and placement intent",
  "emergencyPlacementIntent: RunTable owns emergency/accessory placement intent",
  "selectedBoardFamily: future selected source owns accepted board-family lock",
  "selectedPitchFamily: future selected source owns accepted pitch-family lock",
  "opticCurrentAssumptions: future selected source owns accepted optical/current assumptions",
  "zoneSplitStrategy: future selected source owns accepted zone/split strategy",
  "driverFamily: future selected source owns accepted driver-family lock",
  "selectorPayloadFingerprint: future selected source owns source-input fingerprint comparison input",
  "boardDataSourceVersion: Board Data owns product/component metadata source version",
]);

export const RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  displayOnly: true,
  contractOnly: true,
  failClosed: true,
  sourceAvailable: false,
  selectedResultAvailable: false,
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
  rawAlternativesAsFinalOutputs: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

export const RUNTABLE_SELECTED_RESULT_REDACTION_RULES = Object.freeze([
  "Expose source-owner readiness only until a selected result source is explicitly connected.",
  "Do not expose the raw selected payload.",
  "Do not expose raw engine debug details.",
  "Do not expose weighted alternatives as normal-user final outputs.",
  "Future normal-user display must show one accepted selected result only.",
]);

export const RUNTABLE_SELECTED_RESULT_BOUNDARY_COPY = Object.freeze([
  "RunTable / Engine Result source contract is read-only and fail-closed in this slice.",
  "No future source is connected by default.",
  "No selected result is ingested, persisted, normalised, generated, verified, or compared here.",
  "No engine, Selector, RunTable, payload, IES, drawing, Lab Proof, Controlled Records, RREG, CRM, or Board Data write path is exposed here.",
  "Future source integration must provide one successful accepted result and a per-run lookup keyed by run id / run number before projection can show Engine verified state.",
  "Any stale-result comparison remains a future contract requirement, not an implementation in this slice.",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function sourceContractRows(contract) {
  return [
    ["source owner", contract.sourceOwnerLabel],
    ["source state", contract.sourceState],
    ["source available", String(contract.sourceAvailable)],
    ["selected result available", String(contract.selectedResultAvailable)],
    ["engine verified", String(contract.engineVerified)],
    ["accepted", String(contract.accepted)],
    ["stale", String(contract.stale)],
    ["selected family/subset lock", contract.selectedFamilySubsetLock ? "established" : "none"],
    ["per-run lookup", contract.perRunLookupNormalised ? "normalised" : "not normalised"],
    ["per-run lookup key", contract.perRunLookupKey],
    ["future required field count", String(contract.futureSourceRequiredFields.length)],
    ["stale-sensitive input ownership count", String(contract.staleSensitiveInputOwnership.length)],
    ["raw selected payload exposed", String(contract.safetyFlags.rawSelectedPayloadExposed)],
    ["raw engine debug exposed", String(contract.safetyFlags.rawEngineDebugPayloadExposed)],
    ["raw alternatives as final outputs", String(contract.safetyFlags.rawAlternativesAsFinalOutputs)],
    ["routes added", String(contract.routesAdded)],
    ["post endpoints added", String(contract.postEndpointsAdded)],
  ];
}

function sourceContractSummary(contract) {
  return {
    sourceOwnerLabel: contract.sourceOwnerLabel,
    sourceState: contract.sourceState,
    sourceAvailable: contract.sourceAvailable === true,
    selectedResultAvailable: contract.selectedResultAvailable === true,
    readOnly: contract.readOnly === true,
    displayOnly: contract.displayOnly === true,
    failClosed: contract.failClosed === true,
    accepted: contract.accepted === true,
    engineVerified: contract.engineVerified === true,
    stale: contract.stale === true,
    selectedFamilySubsetLock: null,
    perRunLookupNormalised: false,
    futureSourceRequiredFields: [...contract.futureSourceRequiredFields],
    staleSensitiveInputOwnership: [...contract.staleSensitiveInputOwnership],
    redactionRules: [...contract.redactionRules],
    safetyFlags: clonePlain(contract.safetyFlags),
  };
}

export function buildRunTableSelectedResultSourceContract() {
  const safetyFlags = clonePlain(RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS);
  const contract = {
    ok: true,
    sourceOwnerLabel: RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL,
    sourceOwner: "future-run-table-engine-result-source",
    sourceState: RUNTABLE_SELECTED_RESULT_SOURCE_STATE,
    sourceAvailable: false,
    selectedResultAvailable: false,
    selectedResultUnavailableReason: "future RunTable / Engine Result source is not connected",
    readOnly: true,
    displayOnly: true,
    contractOnly: true,
    failClosed: true,
    accepted: false,
    engineVerified: false,
    stale: false,
    selectedFamilySubsetLock: null,
    perRunLookupNormalised: false,
    perRunLookupKey: RUNTABLE_SELECTED_RESULT_PER_RUN_LOOKUP_KEY,
    futureSourceRequiredFields: [...RUNTABLE_SELECTED_RESULT_FUTURE_SOURCE_REQUIRED_FIELDS],
    staleSensitiveInputOwnership: [...RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP],
    redactionRules: [...RUNTABLE_SELECTED_RESULT_REDACTION_RULES],
    boundaryCopy: [...RUNTABLE_SELECTED_RESULT_BOUNDARY_COPY],
    safetyFlags,
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
    engineExecutionAttempted: false,
    runTableGenerationAttempted: false,
    selectedResultIngestionAttempted: false,
    selectedResultPersistenceAttempted: false,
    staleResultComparisonAttempted: false,
  };
  return {
    ...contract,
    rows: sourceContractRows(contract),
  };
}

export function adaptRunTableSelectedResultSourceContractToSelectedResultProjection(
  sourceContract = buildRunTableSelectedResultSourceContract(),
) {
  const projection = buildSelectedResultProjectionContract();
  const contract = sourceContract && typeof sourceContract === "object"
    ? { ...buildRunTableSelectedResultSourceContract(), ...sourceContract }
    : buildRunTableSelectedResultSourceContract();
  const safetyFlags = {
    ...projection.safetyFlags,
    ...clonePlain(RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS),
  };

  return {
    ...projection,
    sourceAvailable: false,
    sourceState: RUNTABLE_SELECTED_RESULT_SOURCE_STATE,
    selectedResultAvailable: false,
    selectedResultUnavailableReason: contract.selectedResultUnavailableReason || "future RunTable / Engine Result source is not connected",
    estimatedPreviewOnly: true,
    engineVerified: false,
    accepted: false,
    stale: false,
    selectedFamilySubsetLock: null,
    perRunLookupNormalised: false,
    sourceOwnerLabel: RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL,
    sourceContractConsumed: true,
    futureRunTableSelectedResultSourceContract: sourceContractSummary(contract),
    futureSourceRequiredFields: [...RUNTABLE_SELECTED_RESULT_FUTURE_SOURCE_REQUIRED_FIELDS],
    staleSensitiveInputOwnership: [...RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP],
    redactionRules: [...new Set([...(projection.redactionRules || []), ...RUNTABLE_SELECTED_RESULT_REDACTION_RULES])],
    safetyFlags,
    boundaryCopy: [...new Set([...(projection.boundaryCopy || []), ...RUNTABLE_SELECTED_RESULT_BOUNDARY_COPY])],
    rows: [
      ...(Array.isArray(projection.rows) ? projection.rows : []),
      ["source owner contract", RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL],
      ["source owner state", RUNTABLE_SELECTED_RESULT_SOURCE_STATE],
      ["source contract consumed", "true"],
      ["selected result available", "false"],
      ["engine verified", "false"],
      ["accepted", "false"],
      ["stale", "false"],
      ["per-run lookup", "not normalised"],
      ["routes added", "false"],
      ["post endpoints added", "false"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}
