import {
  SELECTED_RESULT_FAMILY_SUBSET_LOCK_SHAPE,
  SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS,
  buildSelectedResultProjectionContract,
  createSelectedResultPerRunDisplayRowShape,
} from "./selectedResultProjectionService.js";
import {
  RUNTABLE_SELECTED_RESULT_PER_RUN_LOOKUP_KEY,
  RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL,
  RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP,
} from "./runTableSelectedResultSourceContract.js";

export const ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE = "read-only Engine/RunTable selected-result adapter";

export const ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_STATES = Object.freeze({
  failClosed: "adapter_fail_closed",
  selectedResultAvailable: "adapter_selected_result_available",
});

export const ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REQUIRED_FIELDS = Object.freeze([
  "oneSuccessfulAcceptedResult",
  "accepted",
  "engineVerified",
  "resultStateLabel",
  "selectedTierOrProfile",
  "selectedReason",
  "perRunLookupByRunIdOrNumber",
  "selectedFamilySubsetLock",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "runs",
]);

export const ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_RUN_REQUIRED_FIELDS = Object.freeze([
  "runKey or runNumber",
  "runLengthMm",
  "bodyMmRequested",
  "segments or segmentsSummary",
  "reservedRanges or reservedRangesSummary",
  "boardRun or boardRunSummary",
  "boardCount",
  "boardFamily",
  "sanitisedWarnings",
]);

export const ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REDACTION_BOUNDARY = Object.freeze([
  "Adapter input is dependency-injected and already selected; this adapter does not execute Engine or generate RunTable output.",
  "Adapter output is allow-listed to selected-result projection fields and safe summaries only.",
  "Adapter output must not expose upstream internals, comparison bundles, source tables, private paths, credentials, Lab evidence, photometric grids, PDFs, artefacts, or file contents.",
  "Per-run lookup is reported as normalised status and safe display rows only; raw lookup structures are not emitted.",
  "Stale comparison remains unimplemented; stale-sensitive keys are metadata only.",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

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

function asNonNegativeInteger(value, fallback = null) {
  if (!isPresent(value) || typeof value === "boolean") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.round(parsed);
}

function asBoolean(value) {
  return value === true;
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
    || /candela|photometric grid|lab evidence/i.test(value);
}

function safeText(value, fallback = null, maxLength = 160) {
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

function safeToken(value, fallback = null) {
  const text = safeText(value, fallback, 120);
  if (!text) return fallback;
  const cleaned = text
    .replace(/[^0-9A-Za-z_.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function unique(values) {
  return [...new Set(values.filter((value) => isPresent(value)))];
}

function safeWarnings(value) {
  if (!Array.isArray(value)) return null;
  return unique(value.map((entry) => safeText(entry, null, 220))).slice(0, 12);
}

function summaryFromCountedSource(summary, sourceList, label) {
  if (isRecord(summary)) {
    return {
      state: safeText(firstPresent(summary, ["state", "status"]), "summary_available", 80),
      [label]: asNonNegativeInteger(firstPresent(summary, [label, "count", "length"]), Array.isArray(sourceList) ? sourceList.length : 0),
      generationEnabled: false,
      rawSourceExposed: false,
    };
  }
  if (Array.isArray(sourceList)) {
    return {
      state: "summary_available",
      [label]: sourceList.length,
      generationEnabled: false,
      rawSourceExposed: false,
    };
  }
  return null;
}

function normaliseSegmentsSummary(run) {
  const summary = firstPresent(run, ["segmentsSummary", "segmentSummary", "segments_summary", "segment_summary"]);
  const segments = firstPresent(run, ["segments", "segment_list"]);
  const normalised = summaryFromCountedSource(summary, segments, "segmentCount");
  if (!normalised) return null;
  return {
    segmentCount: normalised.segmentCount,
    state: normalised.state,
    generationEnabled: false,
    rawSourceExposed: false,
  };
}

function normaliseReservedRangesSummary(run, bodyMmRequested) {
  const summary = firstPresent(run, ["reservedRangesSummary", "reserved_ranges_summary"]);
  const ranges = firstPresent(run, ["reservedRanges", "reserved_ranges"]);
  if (!isRecord(summary) && !Array.isArray(ranges)) return null;
  return {
    count: asNonNegativeInteger(firstPresent(summary, ["count", "rangeCount"]), Array.isArray(ranges) ? ranges.length : 0),
    totalReservedMm: asNonNegativeInteger(firstPresent(summary, ["totalReservedMm", "total_reserved_mm"]), 0),
    availableBodyMm: asNonNegativeInteger(firstPresent(summary, ["availableBodyMm", "available_body_mm"]), bodyMmRequested),
    bodyMmRequested,
    clippedToBody: firstPresent(summary, ["clippedToBody", "clipped_to_body"]) === true,
    sortedAndMerged: firstPresent(summary, ["sortedAndMerged", "sorted_and_merged"]) === true,
    coordinateSpace: safeText(firstPresent(summary, ["coordinateSpace", "coordinate_space"]), "body_mm_half_open", 80),
    rawSourceExposed: false,
  };
}

function normaliseBoardRunSummary(run, boardCount, boardFamily) {
  const summary = firstPresent(run, ["boardRunSummary", "board_run_summary"]);
  const boardRun = firstPresent(run, ["boardRun", "board_run"]);
  if (!isRecord(summary) && !isRecord(boardRun)) return null;
  const source = isRecord(summary) ? summary : boardRun;
  return {
    strategy: safeText(firstPresent(source, ["strategy", "mode"]), "summary_available", 80),
    boardFamily,
    boardCount,
    usedLengthMm: asNonNegativeInteger(firstPresent(source, ["usedLengthMm", "used_length_mm"]), null),
    remainderMm: asNonNegativeInteger(firstPresent(source, ["remainderMm", "remainder_mm"]), null),
    slackMm: asNonNegativeInteger(firstPresent(source, ["slackMm", "slack_mm"]), null),
    exactFill: firstPresent(source, ["exactFill", "exact_fill"]) === true,
    reservedRangeCount: asNonNegativeInteger(firstPresent(source, ["reservedRangeCount", "reserved_range_count"]), null),
    generationEnabled: false,
    engineVerified: true,
    accepted: true,
    rawSourceExposed: false,
  };
}

function normaliseSafeOptionalSummary(value) {
  if (!isRecord(value)) return null;
  return {
    state: safeText(firstPresent(value, ["state", "status", "label"]), "summary_available", 100),
    generationEnabled: false,
    rawSourceExposed: false,
  };
}

function normaliseFamilySubsetLock(value) {
  if (!isRecord(value)) return null;
  const shape = clonePlain(SELECTED_RESULT_FAMILY_SUBSET_LOCK_SHAPE);
  for (const key of Object.keys(shape)) {
    shape[key] = safeText(value[key], null, 120);
  }
  return Object.values(shape).some((entry) => entry) ? shape : null;
}

function lookupValueFor(lookup, mode, key) {
  if (!isRecord(lookup) || !isPresent(key)) return undefined;
  const textKey = String(key);
  if (mode === "runId") {
    return lookup[textKey] ?? lookup.byRunId?.[textKey] ?? lookup.by_run_id?.[textKey];
  }
  if (mode === "runNumber") {
    return lookup[textKey] ?? lookup.byRunNumber?.[textKey] ?? lookup.by_run_number?.[textKey];
  }
  if (mode === "runKey") {
    return lookup[textKey] ?? lookup.byRunKey?.[textKey] ?? lookup.by_run_key?.[textKey];
  }
  return undefined;
}

function normaliseRun(run, index, lookup) {
  if (!isRecord(run)) return { ok: false, reason: `run ${index + 1} is not an object` };

  const runNumber = asNonNegativeInteger(firstPresent(run, ["runNumber", "run_number", "number", "Run"]), null);
  const runId = safeToken(firstPresent(run, ["runId", "run_id", "id"]), null);
  const fallbackKey = runNumber !== null ? `run-${runNumber}` : runId;
  const runKey = safeToken(firstPresent(run, ["runKey", "run_key", "key", "id"]), fallbackKey);
  if (!runKey && runNumber === null) return { ok: false, reason: `run ${index + 1} is missing run identity` };

  const runLengthMm = asNonNegativeInteger(firstPresent(run, ["runLengthMm", "run_length_mm", "lengthMm", "length_mm"]), null);
  const bodyMmRequested = asNonNegativeInteger(firstPresent(run, ["bodyMmRequested", "body_mm_requested", "bodyLengthMm", "body_length_mm"]), null);
  if (runLengthMm === null || runLengthMm <= 0) return { ok: false, reason: `${runKey || `run ${index + 1}`} is missing safe runLengthMm` };
  if (bodyMmRequested === null || bodyMmRequested <= 0) return { ok: false, reason: `${runKey || `run ${index + 1}`} is missing safe bodyMmRequested` };

  const segmentsSummary = normaliseSegmentsSummary(run);
  if (!segmentsSummary) return { ok: false, reason: `${runKey} is missing segments summary` };

  const reservedRangesSummary = normaliseReservedRangesSummary(run, bodyMmRequested);
  if (!reservedRangesSummary) return { ok: false, reason: `${runKey} is missing reserved ranges summary` };

  const boardCount = asNonNegativeInteger(firstPresent(run, ["boardCount", "board_count"]), null);
  const boardFamily = safeText(firstPresent(run, ["boardFamily", "board_family", "diagnosticBoardFamily", "diagnostic_board_family"]), null, 120);
  if (boardCount === null) return { ok: false, reason: `${runKey} is missing boardCount` };
  if (!boardFamily) return { ok: false, reason: `${runKey} is missing boardFamily` };

  const boardRunSummary = normaliseBoardRunSummary(run, boardCount, boardFamily);
  if (!boardRunSummary) return { ok: false, reason: `${runKey} is missing board run summary` };

  const sanitisedWarnings = safeWarnings(firstPresent(run, ["sanitisedWarnings", "sanitizedWarnings", "warnings"]));
  if (!sanitisedWarnings) return { ok: false, reason: `${runKey} is missing sanitisedWarnings array` };

  const lookupByRunId = lookupValueFor(lookup, "runId", runId) !== undefined;
  const lookupByRunNumber = lookupValueFor(lookup, "runNumber", runNumber) !== undefined;
  const lookupByRunKey = lookupValueFor(lookup, "runKey", runKey) !== undefined;
  if (!lookupByRunId && !lookupByRunNumber && !lookupByRunKey) {
    return { ok: false, reason: `${runKey} is missing normalisable per-run lookup entry` };
  }

  const row = {
    ...createSelectedResultPerRunDisplayRowShape(),
    runKey,
    runLabel: safeText(firstPresent(run, ["runLabel", "run_label", "label"]), runNumber === null ? runKey : `Run ${runNumber}`, 120),
    runNumber,
    runLengthMm,
    bodyMmRequested,
    segmentSummary: segmentsSummary,
    segmentsSummary,
    reservedRangesSummary,
    boardRunSummary,
    boardCount,
    boardFamily,
    zoneCount: asNonNegativeInteger(firstPresent(run, ["zoneCount", "zone_count"]), null),
    zonePlanSummary: normaliseSafeOptionalSummary(firstPresent(run, ["zonePlanSummary", "zone_plan_summary"])),
    zoneTargetSummary: normaliseSafeOptionalSummary(firstPresent(run, ["zoneTargetSummary", "zone_target_summary"])),
    mechanicalSummary: normaliseSafeOptionalSummary(firstPresent(run, ["mechanicalSummary", "mechanical_summary"])),
    suspensionSummary: normaliseSafeOptionalSummary(firstPresent(run, ["suspensionSummary", "suspension_summary"])),
    clipSummary: normaliseSafeOptionalSummary(firstPresent(run, ["clipSummary", "clip_summary"])),
    gearTraySummary: normaliseSafeOptionalSummary(firstPresent(run, ["gearTraySummary", "gear_tray_summary"])),
    sanitisedWarnings,
  };

  return {
    ok: true,
    row,
    lookupStatus: {
      runId: lookupByRunId,
      runNumber: lookupByRunNumber,
      runKey: lookupByRunKey,
    },
  };
}

function selectedResultFrom(input) {
  if (!isRecord(input)) return { ok: false, reason: "missing selected-result adapter input" };

  const selectedCollections = [
    firstPresent(input, ["selectedResults", "selected_results"]),
    firstPresent(input, ["acceptedResults", "accepted_results"]),
    firstPresent(input, ["results"]),
  ].filter(Array.isArray);
  for (const collection of selectedCollections) {
    const accepted = collection.filter((entry) => isRecord(entry) && entry.accepted === true);
    if (accepted.length !== 1) return { ok: false, reason: "expected exactly one accepted selected result" };
  }

  const embedded = firstPresent(input, ["oneSuccessfulAcceptedResult"]);
  if (isRecord(embedded)) return { ok: true, selected: embedded, container: input };

  const selected = firstPresent(input, ["selectedResult", "selected_result"]);
  if (isRecord(selected)) return { ok: true, selected, container: input };

  if (selectedCollections.length > 0) {
    const accepted = selectedCollections[0].filter((entry) => isRecord(entry) && entry.accepted === true);
    return { ok: true, selected: accepted[0], container: input };
  }

  return { ok: true, selected: input, container: input };
}

function readSelectedField(selected, container, keys) {
  const direct = firstPresent(selected, keys);
  if (isPresent(direct)) return direct;
  return firstPresent(container, keys);
}

function donorBackedVerificationAllowed(selected, container) {
  const state = safeToken(readSelectedField(selected, container, ["engineVerifiedState", "donorBackedEngineVerifiedState"]), null);
  return state === "donor-selected-solution" || state === "donor-backed-selected-solution";
}

function failClosedProjection(reason, options = {}) {
  const projection = buildSelectedResultProjectionContract();
  const stale = options.stale === true;
  const state = stale ? "stale" : "no_selected_result";
  const resultStateLabel = stale ? "Run table changed — verify again" : "Estimated preview";
  const safetyFlags = {
    ...projection.safetyFlags,
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
    complianceProofAuthority: false,
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
  };

  return {
    ...projection,
    source: ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE,
    sourceAvailable: false,
    sourceState: ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_STATES.failClosed,
    selectedResultAvailable: false,
    selectedResultUnavailableReason: safeText(reason, "selected-result adapter failed closed", 220),
    estimatedPreviewOnly: true,
    state,
    resultState: state,
    resultStateLabel,
    accepted: false,
    engineVerified: false,
    stale,
    selectedProfileTier: null,
    selectedTierOrProfile: null,
    selectedReason: null,
    selectedFamilySubsetLock: null,
    perRunLookupNormalised: false,
    perRunLookupSummary: {
      available: false,
      rawLookupExposed: false,
      lookupKey: RUNTABLE_SELECTED_RESULT_PER_RUN_LOOKUP_KEY,
    },
    sourceInputFingerprint: null,
    sourceInputFingerprintMetadata: {
      present: false,
      staleComparisonImplemented: false,
    },
    boardDataSourceVersion: null,
    boardDataSourceVersionMetadata: {
      present: false,
    },
    runs: [],
    runsByKey: {},
    sanitisedWarnings: [],
    adapterConsumed: true,
    adapterContractOnly: true,
    futureSourceRequiredFields: [...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REQUIRED_FIELDS],
    futureRunRequiredFields: [...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_RUN_REQUIRED_FIELDS],
    staleSensitiveInputKeys: [...SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS],
    staleSensitiveInputOwnership: [...RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP],
    staleComparisonMetadataOnly: true,
    staleResultComparisonAttempted: false,
    redactionRules: [...new Set([...(projection.redactionRules || []), ...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REDACTION_BOUNDARY])],
    safetyFlags,
    rows: [
      ...(Array.isArray(projection.rows) ? projection.rows : []),
      ["adapter", ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE],
      ["adapter state", ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_STATES.failClosed],
      ["selected result available", "false"],
      ["fail closed reason", safeText(reason, "selected-result adapter failed closed", 220)],
      ["engine verified", "false"],
      ["accepted", "false"],
      ["stale", stale ? "true" : "false"],
      ["per-run lookup", "not normalised"],
      ["stale comparison", "not implemented"],
      ["routes added", "false"],
      ["post endpoints added", "false"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
    engineExecutionAttempted: false,
    runTableGenerationAttempted: false,
    selectedResultPersistenceAttempted: false,
  };
}

export function adaptEngineRunTableSelectedResultToProjection(input = null) {
  const extracted = selectedResultFrom(input);
  if (!extracted.ok) return failClosedProjection(extracted.reason);

  const { selected, container } = extracted;
  if (readSelectedField(selected, container, ["oneSuccessfulAcceptedResult"]) !== true) {
    return failClosedProjection("oneSuccessfulAcceptedResult is required");
  }
  if (asBoolean(readSelectedField(selected, container, ["accepted"])) !== true) {
    return failClosedProjection("selected result is not accepted");
  }

  const stale = readSelectedField(selected, container, ["stale", "staleResult"]) === true;
  if (stale) return failClosedProjection("selected result is stale", { stale: true });

  const engineVerified = readSelectedField(selected, container, ["engineVerified", "engine_verified"]) === true
    || donorBackedVerificationAllowed(selected, container);
  if (!engineVerified) return failClosedProjection("selected result is not engine verified");

  const resultStateLabel = safeText(readSelectedField(selected, container, ["resultStateLabel", "result_state_label"]), null, 120);
  if (!resultStateLabel) return failClosedProjection("resultStateLabel is required");
  if (resultStateLabel !== "Engine verified") return failClosedProjection("resultStateLabel is not an accepted verified label");

  const selectedTierOrProfile = safeText(readSelectedField(selected, container, ["selectedTierOrProfile", "selected_tier_or_profile", "selectedTier", "selected_tier", "tier"]), null, 120);
  if (!selectedTierOrProfile) return failClosedProjection("selectedTierOrProfile is required");

  const selectedReason = safeText(readSelectedField(selected, container, ["selectedReason", "selected_reason", "reason"]), null, 220);
  if (!selectedReason) return failClosedProjection("selectedReason is required");

  const selectedFamilySubsetLock = normaliseFamilySubsetLock(readSelectedField(selected, container, ["selectedFamilySubsetLock", "selected_family_subset_lock"]));
  if (!selectedFamilySubsetLock) return failClosedProjection("selectedFamilySubsetLock is required");

  const sourceInputFingerprint = safeToken(readSelectedField(selected, container, ["sourceInputFingerprint", "source_input_fingerprint", "selectorPayloadFingerprint"]), null);
  if (!sourceInputFingerprint) return failClosedProjection("sourceInputFingerprint is required");

  const boardDataSourceVersion = safeToken(readSelectedField(selected, container, ["boardDataSourceVersion", "board_data_source_version"]), null);
  if (!boardDataSourceVersion) return failClosedProjection("boardDataSourceVersion is required");

  const lookup = readSelectedField(selected, container, ["perRunLookupByRunIdOrNumber", "per_run_lookup_by_run_id_or_number"]);
  if (!isRecord(lookup)) return failClosedProjection("perRunLookupByRunIdOrNumber is required");

  const runsInput = readSelectedField(selected, container, ["runs", "safeRuns", "safe_runs"]);
  if (!Array.isArray(runsInput) || runsInput.length < 1) return failClosedProjection("at least one safe run row is required");

  const runResults = runsInput.map((run, index) => normaliseRun(run, index, lookup));
  const failedRun = runResults.find((result) => result.ok !== true);
  if (failedRun) return failClosedProjection(failedRun.reason);

  const runs = runResults.map((result) => result.row);
  const lookupModes = runResults.reduce((summary, result) => ({
    runId: summary.runId || result.lookupStatus.runId,
    runNumber: summary.runNumber || result.lookupStatus.runNumber,
    runKey: summary.runKey || result.lookupStatus.runKey,
  }), { runId: false, runNumber: false, runKey: false });

  const warnings = unique(runs.flatMap((run) => run.sanitisedWarnings || []));
  const runsByKey = Object.fromEntries(runs.map((run) => [run.runKey, run]));
  const projection = buildSelectedResultProjectionContract();
  const safetyFlags = {
    ...projection.safetyFlags,
    sourceAvailable: true,
    selectedResultAvailable: true,
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
    complianceProofAuthority: false,
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
  };

  return {
    ...projection,
    source: ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE,
    sourceOwnerLabel: RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL,
    sourceAvailable: true,
    sourceState: ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_STATES.selectedResultAvailable,
    selectedResultAvailable: true,
    selectedResultUnavailableReason: null,
    estimatedPreviewOnly: false,
    state: "selected_accepted",
    resultState: "selected_accepted",
    resultStateLabel,
    accepted: true,
    engineVerified: true,
    stale: false,
    selectedProfileTier: selectedTierOrProfile,
    selectedTierOrProfile,
    selectedReason,
    selectedFamilySubsetLock,
    perRunLookupNormalised: true,
    perRunLookupSummary: {
      available: true,
      lookupKey: "run id / run number / run key",
      normalisedBy: lookupModes,
      runCount: runs.length,
      rawLookupExposed: false,
    },
    sourceInputFingerprint,
    sourceInputFingerprintMetadata: {
      present: true,
      value: sourceInputFingerprint,
      staleComparisonImplemented: false,
    },
    boardDataSourceVersion,
    boardDataSourceVersionMetadata: {
      present: true,
      value: boardDataSourceVersion,
    },
    runs,
    runsByKey,
    sanitisedWarnings: warnings,
    adapterConsumed: true,
    adapterContractOnly: true,
    futureSourceRequiredFields: [...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REQUIRED_FIELDS],
    futureRunRequiredFields: [...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_RUN_REQUIRED_FIELDS],
    staleSensitiveInputKeys: [...SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS],
    staleSensitiveInputOwnership: [...RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP],
    staleComparisonMetadataOnly: true,
    staleResultComparisonAttempted: false,
    redactionRules: [...new Set([...(projection.redactionRules || []), ...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REDACTION_BOUNDARY])],
    safetyFlags,
    rows: [
      ...(Array.isArray(projection.rows) ? projection.rows : []),
      ["adapter", ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE],
      ["adapter state", ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_STATES.selectedResultAvailable],
      ["selected result available", "true"],
      ["result state label", resultStateLabel],
      ["engine verified", "true"],
      ["accepted", "true"],
      ["stale", "false"],
      ["selected tier/profile", selectedTierOrProfile],
      ["selected family/subset lock", "established"],
      ["per-run lookup", "normalised"],
      ["raw per-run lookup exposed", "false"],
      ["run count", String(runs.length)],
      ["stale comparison", "not implemented"],
      ["routes added", "false"],
      ["post endpoints added", "false"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
    engineExecutionAttempted: false,
    runTableGenerationAttempted: false,
    selectedResultPersistenceAttempted: false,
  };
}

export function adaptSafeSelectedResultSourceObjectToSummaryProjection(sourceObject = null) {
  if (!isRecord(sourceObject) || sourceObject.ok !== true || sourceObject.readOnly !== true) {
    return failClosedProjection("safe selected-result source object is not ready");
  }

  const selectedTierOrProfile = safeText(sourceObject.selectedTierOrProfile, null, 120);
  if (!selectedTierOrProfile) return failClosedProjection("safe selected-result source tier/profile is missing");

  const runCount = asNonNegativeInteger(sourceObject.runCount, Array.isArray(sourceObject.runs) ? sourceObject.runs.length : null);
  if (runCount === null || runCount < 1) return failClosedProjection("safe selected-result source run count is missing");

  const sourceInputFingerprint = safeToken(sourceObject.sourceInputFingerprint, null);
  if (!sourceInputFingerprint) return failClosedProjection("safe selected-result source fingerprint is missing");

  const boardDataSourceVersion = safeToken(sourceObject.sourceVersionMarker, "readonly-engine-safe-summary");
  const summaryRuns = Array.isArray(sourceObject.runs)
    ? sourceObject.runs.slice(0, 50).map((run, index) => ({
      runKey: safeToken(run?.runKey, `safe-engine-run-${index + 1}`),
      runIndex: asNonNegativeInteger(run?.runIndex, index),
      boardCount: asNonNegativeInteger(run?.boardCount, null),
      segmentCount: asNonNegativeInteger(run?.segmentCount, null),
      zoneCount: asNonNegativeInteger(run?.zoneCount, null),
      clipPointsCount: asNonNegativeInteger(run?.clipPointsCount, null),
      suspensionPointsCount: asNonNegativeInteger(run?.suspensionPointsCount, null),
      gearTrayPlanCount: asNonNegativeInteger(run?.gearTrayPlanCount, null),
      reservedRangesCount: asNonNegativeInteger(run?.reservedRangesCount, 0),
      safeSummaryOnly: true,
      rawRunReturned: false,
    }))
    : [];
  if (summaryRuns.length !== runCount) return failClosedProjection("safe selected-result source run summaries do not match run count");

  const projection = buildSelectedResultProjectionContract();
  const safetyFlags = {
    ...projection.safetyFlags,
    sourceAvailable: true,
    selectedResultAvailable: true,
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
    complianceProofAuthority: false,
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
  };

  return {
    ...projection,
    source: ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE,
    sourceOwnerLabel: RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL,
    sourceAvailable: true,
    sourceState: "adapter_safe_summary_projection_available",
    selectedResultAvailable: true,
    selectedResultUnavailableReason: null,
    estimatedPreviewOnly: false,
    state: "engine_verified",
    resultState: "engine_verified",
    resultStateLabel: "Engine verified",
    accepted: false,
    acceptedSelectedResultAvailable: false,
    engineVerified: true,
    stale: false,
    selectedProfileTier: selectedTierOrProfile,
    selectedTierOrProfile,
    selectedReason: "Readonly engine seam safe summary projected; detailed selected-result acceptance remains disabled.",
    selectedFamilySubsetLock: null,
    perRunLookupNormalised: false,
    perRunLookupSummary: {
      available: false,
      summaryOnly: true,
      runCount,
      rawLookupExposed: false,
      lookupKey: RUNTABLE_SELECTED_RESULT_PER_RUN_LOOKUP_KEY,
    },
    sourceInputFingerprint,
    sourceInputFingerprintMetadata: {
      present: true,
      value: sourceInputFingerprint,
      staleComparisonImplemented: false,
    },
    boardDataSourceVersion,
    boardDataSourceVersionMetadata: {
      present: true,
      value: boardDataSourceVersion,
    },
    runCount,
    summaryProjectionOnly: true,
    summaryCounts: {
      boardCount: asNonNegativeInteger(sourceObject.boardCount, null),
      segmentCount: asNonNegativeInteger(sourceObject.segmentCount, null),
      zoneCount: asNonNegativeInteger(sourceObject.zoneCount, null),
      clipPointsCount: asNonNegativeInteger(sourceObject.clipPointsCount, null),
      suspensionPointsCount: asNonNegativeInteger(sourceObject.suspensionPointsCount, null),
      gearTrayPlanCount: asNonNegativeInteger(sourceObject.gearTrayPlanCount, null),
      rawSourceExposed: false,
    },
    summaryRuns,
    runs: [],
    runsByKey: {},
    sanitisedWarnings: [],
    adapterConsumed: true,
    adapterContractOnly: true,
    futureSourceRequiredFields: [...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REQUIRED_FIELDS],
    futureRunRequiredFields: [...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_RUN_REQUIRED_FIELDS],
    staleSensitiveInputKeys: [...SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS],
    staleSensitiveInputOwnership: [...RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP],
    staleComparisonMetadataOnly: true,
    staleResultComparisonAttempted: false,
    redactionRules: [...new Set([...(projection.redactionRules || []), ...ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_REDACTION_BOUNDARY])],
    safetyFlags,
    rows: [
      ...(Array.isArray(projection.rows) ? projection.rows : []),
      ["adapter", ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE],
      ["adapter state", "adapter_safe_summary_projection_available"],
      ["selected result available", "true"],
      ["summary projection only", "true"],
      ["result state label", "Engine verified"],
      ["engine verified", "true"],
      ["accepted", "false"],
      ["detailed selected result accepted", "false"],
      ["stale", "false"],
      ["selected tier/profile", selectedTierOrProfile],
      ["per-run lookup", "summary-only not normalised"],
      ["raw per-run lookup exposed", "false"],
      ["run count", String(runCount)],
      ["stale comparison", "not implemented"],
      ["routes added", "false"],
      ["post endpoints added", "false"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
    engineExecutionAttempted: false,
    runTableGenerationAttempted: false,
    selectedResultPersistenceAttempted: false,
  };
}

export function buildFailClosedEngineRunTableSelectedResultAdapterProjection(reason = "selected-result adapter failed closed") {
  return failClosedProjection(reason);
}
