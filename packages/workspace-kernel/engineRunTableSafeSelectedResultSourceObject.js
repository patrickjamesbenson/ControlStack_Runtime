export const SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID = "controlstack.engine_runtable.safe_selected_result_source_object.v1";
export const SAFE_SELECTED_RESULT_SOURCE_SCHEMA_VERSION = 1;
export const SAFE_SELECTED_RESULT_SOURCE_KIND = "host_local_real_engine_safe_summary";

export const SAFE_SELECTED_RESULT_REQUIRED_FIELDS = Object.freeze([
  "safeEngineSummary.success",
  "safeEngineSummary.selected_tier or selectedTierOrProfile",
  "safeEngineSummary.run_count",
  "safeEngineSummary.runs[]",
  "sourceInputFingerprint",
  "controlledIntentMarkers",
  "sourceBackedDataMarkers",
]);

export const SAFE_SELECTED_RESULT_EXCLUDED_FIELD_CLASSES = Object.freeze([
  "raw Engine payload",
  "raw rough electrical payload",
  "raw Engine debug",
  "raw Engine result",
  "raw RunTable rows",
  "raw selected payload",
  "raw source DB rows",
  "raw USERS data",
  "raw candela",
  "IES content or files",
  "PDFs",
  "base64 artefacts",
  "private paths",
]);

const UNSAFE_PAYLOAD_KEYS = Object.freeze([
  "db",
  "snapshot",
  "selector_payload",
  "rawPayload",
  "raw_payload",
  "rawEnginePayload",
  "raw_engine_payload",
  "engineResult",
  "engine_result",
  "rawEngineResult",
  "raw_engine_result",
  "debug",
  "rawEngineDebug",
  "raw_engine_debug",
  "rough_electrical_payload",
  "rawRoughElectricalPayload",
  "raw_rough_electrical_payload",
  "runTableRows",
  "run_table_rows",
  "rawRunTableRows",
  "raw_run_table_rows",
  "selectedPayload",
  "selected_payload",
  "rawSelectedPayload",
  "raw_selected_payload",
  "rows",
  "rawRows",
  "raw_rows",
  "USERS",
  "usersRows",
  "users_rows",
  "rawUsers",
  "raw_users",
  "candela",
  "candelaGrid",
  "rawCandelaGrid",
  "raw_candela_grid",
  "ies",
  "iesText",
  "rawIesText",
  "raw_ies_text",
  "pdf",
  "pdfRef",
  "pdf_ref",
  "base64",
  "base64Artefact",
  "base64Artifact",
  "base64PolarPlot",
  "privatePath",
  "private_path",
  "localPath",
  "local_path",
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
    if (hasOwn(source, key)) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "" && value !== false) return value;
    }
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

function textLooksUnsafe(text) {
  const value = String(text || "");
  return /[A-Za-z]:\\/.test(value)
    || value.includes("\\")
    || value.includes("/ControlStack")
    || value.includes("ControlStack/")
    || value.includes("ControlStack\\")
    || value.includes("data:")
    || value.includes("base64")
    || /\.pdf\b/i.test(value)
    || /\.ies\b/i.test(value)
    || /password|credential|secret|token/i.test(value)
    || /users\b/i.test(value)
    || /candela|photometric grid|lab evidence/i.test(value);
}

function safeText(value, fallback = null, maxLength = 180) {
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

function safeToken(value, fallback = null, maxLength = 180) {
  const text = safeText(value, fallback, maxLength);
  if (!text) return fallback;
  const cleaned = text
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function sourceFingerprintFrom(sourceSummary) {
  if (!isRecord(sourceSummary)) return null;
  const nestedSource = sourceSummary.source;
  const fingerprint = firstPresent(sourceSummary, ["sourceInputFingerprint", "source_input_fingerprint", "source_fingerprint"])
    || (isRecord(nestedSource) ? firstPresent(nestedSource, ["source_fingerprint", "fingerprint"]) : undefined);
  const token = safeToken(fingerprint, null, 160);
  if (!token) return null;
  return /^[0-9a-f]{64}$/i.test(token) ? `sha256:${token}` : token;
}

function collectUnsafePayloadPaths(value, path = "input", results = []) {
  if (!isRecord(value) && !Array.isArray(value)) return results;
  if (Array.isArray(value)) {
    value.slice(0, 25).forEach((entry, index) => collectUnsafePayloadPaths(entry, `${path}[${index}]`, results));
    return results;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_PAYLOAD_KEYS.includes(key)) {
      results.push(`${path}.${key}`);
      continue;
    }
    collectUnsafePayloadPaths(nested, `${path}.${key}`, results);
  }
  return results;
}

function sourceInputFingerprintFrom(input, redactedMetadata, sourceSummary) {
  return safeToken(firstPresent(input, ["sourceInputFingerprint", "source_input_fingerprint"]), null, 180)
    || safeToken(firstPresent(redactedMetadata, ["sourceInputFingerprint", "source_input_fingerprint"]), null, 180)
    || sourceFingerprintFrom(sourceSummary);
}

function selectedTierFrom(input, summary, redactedMetadata) {
  return safeText(
    firstPresent(input, ["selectedTierOrProfile", "selected_tier_or_profile", "selected_tier", "tier"])
      || firstPresent(summary, ["selectedTierOrProfile", "selected_tier_or_profile", "selected_tier", "tier"])
      || firstPresent(redactedMetadata, ["selectedTierOrProfile", "selected_tier_or_profile", "selected_tier", "tier"]),
    null,
    120,
  );
}

function safeRunSummaryList(summary) {
  if (!isRecord(summary)) return [];
  if (Array.isArray(summary.runs)) return summary.runs;
  if (Array.isArray(summary.safeRunSummaries)) return summary.safeRunSummaries;
  if (Array.isArray(summary.safe_run_summaries)) return summary.safe_run_summaries;
  return [];
}

function runCountFrom(summary) {
  const safeRuns = safeRunSummaryList(summary);
  return asNonNegativeInteger(firstPresent(summary, ["run_count", "runCount"]), safeRuns.length ? safeRuns.length : null);
}

function countFromRun(run, keys, fallback = null) {
  return asNonNegativeInteger(firstPresent(run, keys), fallback);
}

function runSourceSummary(summary) {
  const runs = safeRunSummaryList(summary);
  return runs.map((run, index) => {
    const runRecord = isRecord(run) ? run : {};
    const runIndex = asNonNegativeInteger(firstPresent(runRecord, ["index", "runIndex", "run_index"]), index);
    return {
      runKey: `safe-engine-run-${runIndex + 1}`,
      runIndex,
      accepted: true,
      engineVerified: true,
      safeSummaryOnly: true,
      hasBodyRequested: firstPresent(runRecord, ["has_body_requested", "hasBodyRequested"]) === true,
      boardCount: countFromRun(runRecord, ["boards_count", "boardCount", "board_count"]),
      segmentCount: countFromRun(runRecord, ["segments_count", "segmentCount", "segment_count"]),
      zoneCount: countFromRun(runRecord, ["zone_count", "zoneCount"]),
      clipPointsCount: countFromRun(runRecord, ["clip_points_count", "clipPointsCount", "clip_count"]),
      suspensionPointsCount: countFromRun(runRecord, ["suspension_points_count", "suspensionPointsCount", "suspension_count"]),
      gearTrayPlanCount: countFromRun(runRecord, ["gear_tray_plan_count", "gearTrayPlanCount", "gear_tray_count"]),
      reservedRangesCount: countFromRun(runRecord, ["reserved_ranges_count", "reservedRangesCount", "reserved_range_count"], 0),
      rawRunReturned: false,
    };
  });
}

function firstTopLevelOrRunCount(summary, runs, topLevelKeys, runKey) {
  const topLevel = asNonNegativeInteger(firstPresent(summary, topLevelKeys), null);
  if (topLevel !== null) return topLevel;
  const values = runs.map((run) => asNonNegativeInteger(run[runKey], null));
  if (values.some((value) => value === null)) return null;
  return values.reduce((total, value) => total + value, 0);
}

function safeMarkerObject(value, allowedKeys) {
  if (!isRecord(value)) return null;
  const output = {};
  for (const key of allowedKeys) {
    if (!hasOwn(value, key)) continue;
    const raw = value[key];
    if (typeof raw === "boolean") {
      output[key] = raw;
    } else if (typeof raw === "number" && Number.isFinite(raw)) {
      output[key] = raw;
    } else if (Array.isArray(raw)) {
      output[key] = raw.map((entry) => safeToken(entry, null, 120)).filter(Boolean).slice(0, 20);
    } else {
      const token = safeToken(raw, null, 180);
      if (token) output[key] = token;
    }
  }
  return Object.keys(output).length > 0 ? output : null;
}

function controlledIntentMarkersFrom(redactedMetadata) {
  const markers = [];
  const controlledGeometry = safeMarkerObject(
    firstPresent(redactedMetadata, ["controlledGeometry", "controlled_geometry", "controlled_geometry_attempted"]),
    [
      "classification",
      "length_class",
      "length_mm",
      "qty",
      "length_policy_source",
      "accessory_length_policy_source",
      "not_product_data",
      "not_source_backed_board_data",
    ],
  );
  if (controlledGeometry) markers.push({ kind: "controlled_geometry", ...controlledGeometry });

  const tierStrategy = safeMarkerObject(
    firstPresent(redactedMetadata, ["tierStrategy", "tier_strategy"]),
    [
      "classification",
      "tier_strategy_mode",
      "top_level_tier_passed",
      "tier_strategy_selected_tier_passed",
      "tier_strategy_candidate_tiers_passed",
    ],
  );
  if (tierStrategy) markers.push({ kind: "tier_strategy", ...tierStrategy });

  const fieldSourceMap = firstPresent(redactedMetadata, ["fieldSourceMap", "field_source_map"]);
  if (Array.isArray(fieldSourceMap)) {
    for (const entry of fieldSourceMap.slice(0, 50)) {
      if (!isRecord(entry)) continue;
      const classification = safeToken(entry.classification, null, 160);
      if (!classification || !classification.includes("controlled")) continue;
      markers.push({
        kind: "controlled_field_source_marker",
        field: safeToken(entry.field, null, 120),
        classification,
        present: entry.present === true,
        rawRowReturned: false,
        rawValueReturned: false,
      });
    }
  }

  return markers;
}

function sourceBackedMarkersFrom(redactedMetadata, sourceSummary, fingerprint) {
  const markers = [];
  if (isRecord(sourceSummary)) {
    markers.push({
      kind: "runtime_active_source_summary",
      ok: sourceSummary.ok === true,
      activeSourceDbLoadedReadOnly: sourceSummary.active_source_db_loaded_read_only === true
        || sourceSummary.activeSourceDbLoadedReadOnly === true,
      sourceFingerprintAvailable: sourceSummary.source_fingerprint_available === true
        || sourceSummary.sourceFingerprintAvailable === true
        || Boolean(fingerprint),
      presentTables: Array.isArray(sourceSummary.present_tables)
        ? sourceSummary.present_tables.map((entry) => safeToken(entry, null, 80)).filter(Boolean).slice(0, 20)
        : [],
      missingTables: Array.isArray(sourceSummary.missing_tables)
        ? sourceSummary.missing_tables.map((entry) => safeToken(entry, null, 80)).filter(Boolean).slice(0, 20)
        : [],
      rawRowsExposed: false,
      rawHeadersExposed: false,
      rawUsersExposed: false,
      privatePathsExposed: false,
    });
  }

  const fieldSourceMap = firstPresent(redactedMetadata, ["fieldSourceMap", "field_source_map"]);
  if (Array.isArray(fieldSourceMap)) {
    for (const entry of fieldSourceMap.slice(0, 80)) {
      if (!isRecord(entry)) continue;
      const classification = safeToken(entry.classification, null, 160);
      if (!classification || !classification.includes("source-backed")) continue;
      markers.push({
        kind: "source_backed_field_marker",
        field: safeToken(entry.field, null, 120),
        classification,
        present: entry.present === true,
        rawRowReturned: false,
        rawValueReturned: false,
      });
    }
  }

  return markers;
}

function baseSafetyFlags() {
  return {
    readOnly: true,
    nonPersistent: true,
    diagnosticOnly: true,
    sourceObjectOnly: true,
    failClosed: true,
    engineExecutionEnabled: false,
    engineVerificationEnabled: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersistenceAttempted: false,
    selectedResultIngestionEnabled: false,
    staleResultComparisonEnabled: false,
    runTableGenerationEnabled: false,
    payloadGenerationEnabled: false,
    iesGenerationEnabled: false,
    iesHandoffEnabled: false,
    drawingGenerationEnabled: false,
    labProofAuthority: false,
    complianceProofAuthority: false,
    controlledRecordsWriteEnabled: false,
    rregApprovalEnabled: false,
    rregCustodyTransferEnabled: false,
    hubSpotCrmWriteBackEnabled: false,
    boardDataMutationEnabled: false,
    runtimeDataMutationEnabled: false,
    donorMutationEnabled: false,
    hiddenWriteBackEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}

function baseRedactionFlags() {
  return {
    rawEnginePayloadExposed: false,
    rawRoughElectricalPayloadExposed: false,
    rawEngineDebugExposed: false,
    rawEngineResultExposed: false,
    rawRunTableRowsExposed: false,
    rawSelectedPayloadExposed: false,
    rawSourceDbRowsExposed: false,
    rawBoardDataRowsExposed: false,
    rawBoardDataHeadersExposed: false,
    rawUsersExposed: false,
    rawCandelaExposed: false,
    rawIesExposed: false,
    rawPdfsExposed: false,
    base64ArtefactsExposed: false,
    privatePathsExposed: false,
    credentialsExposed: false,
    providerDetailsExposed: false,
    filenamesExposed: false,
  };
}

function failClosed(reason, extra = {}) {
  return {
    ok: false,
    schemaId: SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID,
    schemaVersion: SAFE_SELECTED_RESULT_SOURCE_SCHEMA_VERSION,
    sourceKind: SAFE_SELECTED_RESULT_SOURCE_KIND,
    readOnly: true,
    nonPersistent: true,
    diagnosticOnly: true,
    accepted: false,
    engineVerified: false,
    selectedTierOrProfile: null,
    runCount: 0,
    runs: [],
    boardCount: null,
    segmentCount: null,
    zoneCount: null,
    clipPointsCount: null,
    suspensionPointsCount: null,
    gearTrayPlanCount: null,
    controlledIntentMarkers: [],
    sourceBackedDataMarkers: [],
    sourceInputFingerprint: null,
    sourceVersionMarker: null,
    persistenceStatus: {
      selectedResultPersisted: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersistenceAttempted: false,
      nonPersistent: true,
    },
    downstreamReadinessFlags: {
      selectedResultSourceObjectAvailable: false,
      selectedResultProjectionReady: false,
      iesHandoffReady: false,
      iesHandoffBlocked: true,
      candidateOutputReady: false,
      labProofReady: false,
    },
    redactionFlags: baseRedactionFlags(),
    safetyFlags: baseSafetyFlags(),
    excludedUnsafeFieldClasses: [...SAFE_SELECTED_RESULT_EXCLUDED_FIELD_CLASSES],
    requiredFields: [...SAFE_SELECTED_RESULT_REQUIRED_FIELDS],
    blockers: [
      {
        code: "safe-selected-result-source-object-failed-closed",
        severity: "blocking",
        reason: safeText(reason, "required safe selected-result source fields were unavailable", 240),
      },
      ...(Array.isArray(extra.blockers) ? extra.blockers : []),
    ],
    unsafeInputRejected: extra.unsafeInputRejected === true,
  };
}

export function buildSafeEngineRunTableSelectedResultSourceObject(input = {}) {
  if (!isRecord(input)) {
    return failClosed("input must be an object");
  }

  const unsafePaths = collectUnsafePayloadPaths(input);
  if (unsafePaths.length > 0) {
    return failClosed("unsafe raw payload keys were supplied to the safe source-object builder", {
      unsafeInputRejected: true,
      blockers: unsafePaths.slice(0, 12).map((path) => ({
        code: "unsafe-raw-input-key-rejected",
        severity: "blocking",
        reason: safeText(`Rejected ${path}`, "unsafe input key rejected", 180),
      })),
    });
  }

  const safeEngineSummary = firstPresent(input, ["safeEngineSummary", "safe_engine_summary"]);
  const summary = isRecord(safeEngineSummary) ? safeEngineSummary : input;
  const redactedMetadata = isRecord(firstPresent(input, ["redactedMetadata", "redacted_metadata", "candidateDerivation", "candidate_derivation"]))
    ? firstPresent(input, ["redactedMetadata", "redacted_metadata", "candidateDerivation", "candidate_derivation"])
    : {};
  const sourceSummary = isRecord(firstPresent(input, ["sourceSummary", "source_summary"]))
    ? firstPresent(input, ["sourceSummary", "source_summary"])
    : isRecord(redactedMetadata.source_summary)
      ? redactedMetadata.source_summary
      : {};

  const success = firstPresent(summary, ["success", "ok"]) === true;
  if (!success) return failClosed("safe Engine summary is not successful");

  const selectedTierOrProfile = selectedTierFrom(input, summary, redactedMetadata);
  if (!selectedTierOrProfile) return failClosed("selected tier/profile is required from safe summary metadata");

  const runCount = runCountFrom(summary);
  if (runCount === null || runCount < 1) return failClosed("safe summary run count is required");

  const runs = runSourceSummary(summary);
  if (runs.length !== runCount) return failClosed("safe summary runs must match run count");

  const requiredRunCountFields = [
    "boardCount",
    "segmentCount",
    "zoneCount",
    "clipPointsCount",
    "suspensionPointsCount",
    "gearTrayPlanCount",
  ];
  const missingRunField = runs.find((run) => requiredRunCountFields.some((field) => run[field] === null));
  if (missingRunField) return failClosed("all safe run summary counts are required");

  const sourceInputFingerprint = sourceInputFingerprintFrom(input, redactedMetadata, sourceSummary);
  if (!sourceInputFingerprint) return failClosed("opaque source input fingerprint is required");

  const controlledIntentMarkers = controlledIntentMarkersFrom(redactedMetadata);
  if (controlledIntentMarkers.length < 1) return failClosed("controlled intent markers are required");

  const sourceBackedDataMarkers = sourceBackedMarkersFrom(redactedMetadata, sourceSummary, sourceInputFingerprint);
  if (sourceBackedDataMarkers.length < 1) return failClosed("source-backed data markers are required");

  const boardCount = firstTopLevelOrRunCount(summary, runs, ["boards_count", "boardCount", "board_count"], "boardCount");
  const segmentCount = firstTopLevelOrRunCount(summary, runs, ["segments_count", "segmentCount", "segment_count"], "segmentCount");
  const zoneCount = firstTopLevelOrRunCount(summary, runs, ["zone_count", "zoneCount"], "zoneCount");
  const clipPointsCount = firstTopLevelOrRunCount(summary, runs, ["clip_points_count", "clipPointsCount"], "clipPointsCount");
  const suspensionPointsCount = firstTopLevelOrRunCount(summary, runs, ["suspension_points_count", "suspensionPointsCount"], "suspensionPointsCount");
  const gearTrayPlanCount = firstTopLevelOrRunCount(summary, runs, ["gear_tray_plan_count", "gearTrayPlanCount"], "gearTrayPlanCount");

  const sourceVersionMarker = safeToken(
    firstPresent(input, ["sourceVersionMarker", "source_version_marker", "boardDataSourceVersion", "board_data_source_version"])
      || firstPresent(redactedMetadata, ["sourceVersionMarker", "source_version_marker", "boardDataSourceVersion", "board_data_source_version"])
      || `runtime-active-source:${sourceInputFingerprint.slice(0, 24)}`,
    null,
    180,
  );

  return {
    ok: true,
    schemaId: SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID,
    schemaVersion: SAFE_SELECTED_RESULT_SOURCE_SCHEMA_VERSION,
    sourceKind: SAFE_SELECTED_RESULT_SOURCE_KIND,
    readOnly: true,
    nonPersistent: true,
    diagnosticOnly: true,
    accepted: true,
    engineVerified: true,
    selectedTierOrProfile,
    resultStateLabel: "Engine verified",
    runCount,
    runs,
    boardCount,
    segmentCount,
    zoneCount,
    clipPointsCount,
    suspensionPointsCount,
    gearTrayPlanCount,
    controlledIntentMarkers: clonePlain(controlledIntentMarkers),
    sourceBackedDataMarkers: clonePlain(sourceBackedDataMarkers),
    sourceInputFingerprint,
    sourceVersionMarker,
    persistenceStatus: {
      selectedResultPersisted: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersistenceAttempted: false,
      nonPersistent: true,
    },
    downstreamReadinessFlags: {
      selectedResultSourceObjectAvailable: true,
      selectedResultProjectionReady: false,
      iesHandoffReady: false,
      iesHandoffBlocked: true,
      candidateOutputReady: false,
      labProofReady: false,
    },
    redactionFlags: baseRedactionFlags(),
    safetyFlags: baseSafetyFlags(),
    excludedUnsafeFieldClasses: [...SAFE_SELECTED_RESULT_EXCLUDED_FIELD_CLASSES],
    requiredFields: [...SAFE_SELECTED_RESULT_REQUIRED_FIELDS],
    blockers: [],
  };
}