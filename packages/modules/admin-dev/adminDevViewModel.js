const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);
const LIVE_CONFIRMATION_TEXT = "SYNC";
const RESTORE_CONFIRMATION_TEXT = "RESTORE";

function roleRank(role) {
  const index = ROLE_ORDER.indexOf(role);
  return index < 0 ? 0 : index;
}

function actualRole(context = {}) {
  return context.authority?.actualRole?.value || context.identity?.actualRole || "external_user";
}

function displayRole(context = {}) {
  return context.visibility?.inputs?.displayRole || context.identity?.displayRole || actualRole(context);
}

function decisionFor(context = {}) {
  return context.visibility?.moduleReasons?.admin_dev || null;
}

export function canViewAdminDev(context = {}) {
  const role = actualRole(context);
  const decision = decisionFor(context);
  return roleRank(role) >= roleRank("developer") && decision?.visible !== false;
}

function asText(value, fallback = "none") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function bytesLabel(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "unknown";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function payloadBody(state, key) {
  return state?.payloads?.[key]?.body || {};
}

function endpointRows(endpoints, state) {
  return Object.entries(endpoints || {}).map(([key, endpoint]) => {
    const result = state?.payloads?.[key];
    const error = (state?.errors || []).find((item) => item.key === key);
    return {
      key,
      endpoint,
      status: error ? "read failed" : result ? `HTTP ${result.httpStatus || "ok"}` : "pending",
      note: error?.message || "GET status / no mutation",
    };
  });
}

function blockerItems(sourceMaterialisation) {
  const blockers = Array.isArray(sourceMaterialisation?.blockers) ? sourceMaterialisation.blockers : [];
  if (!blockers.length) return ["No blockers reported by source materialisation endpoint."];
  return blockers.map((item) => `${item.code || "blocker"}: ${item.reason || item.severity || "reported"}`);
}

function tableCountRows(sourceMaterialisation) {
  const tables = sourceMaterialisation?.sourceInspection?.tables || {};
  return [
    ["users table", `${asText(tables.users?.present, "no")} · ${asText(tables.users?.count, "0")} rows`],
    ["contacts table", `${asText(tables.contacts?.present, "no")} · ${asText(tables.contacts?.count, "0")} rows`],
    ["companies table", `${asText(tables.companies?.present, "no")} · ${asText(tables.companies?.count, "0")} rows`],
  ];
}

function pathRows(snapshot = {}) {
  return [
    ["path", snapshot.path || "not configured"],
    ["present", asText(snapshot.present, "unknown")],
    ["readable", asText(snapshot.readable, "unknown")],
    ["size", bytesLabel(snapshot.sizeBytes)],
    ["modified", snapshot.modifiedAt || "unknown"],
    ["transitional path", asText(snapshot.transitionalPath, "no")],
    ["reason", snapshot.reason || "none"],
  ];
}

function syncResultBody(result) {
  return result?.body && typeof result.body === "object" ? result.body : null;
}

function endpointResultText(result, error) {
  if (error) return error;
  if (!result) return "not called";
  const status = result.body?.status || result.body?.error || "no server status";
  return `HTTP ${result.httpStatus || "unknown"} · ${status}`;
}

function sourceConfiguredFrom(body, sourceMaterialisation) {
  const configured = body?.preflight?.sourcePath
    || body?.source?.path
    || sourceMaterialisation?.sourceProfile?.sourceConfigured
    || sourceMaterialisation?.sourceProfile?.materialisedSourceConfigured;
  return asText(Boolean(configured), "unknown");
}

function sourceReadableFrom(body, sourceMaterialisation) {
  const value = body?.preflight?.sourceReadable ?? body?.source?.readable ?? sourceMaterialisation?.sourceFile?.readable;
  return asText(value, "unknown");
}

function sourcePathFrom(body, sourceMaterialisation) {
  return body?.preflight?.sourcePath
    || body?.source?.path
    || sourceMaterialisation?.sourceProfile?.materialisedSourcePath
    || "not configured";
}

function targetPathFrom(body, authorityStatus, sourceMaterialisation) {
  return body?.target?.path
    || body?.preflight?.targetPath
    || authorityStatus?.snapshot?.path
    || sourceMaterialisation?.targetSnapshot?.path
    || "not configured";
}

function targetModifiedFrom(body, authorityStatus, sourceMaterialisation) {
  return body?.target?.modifiedAt
    || sourceMaterialisation?.targetSnapshot?.modifiedAt
    || authorityStatus?.snapshot?.modifiedAt
    || "unknown";
}

function archivePathFrom(body, authorityStatus, sourceMaterialisation) {
  return body?.archive?.archivedTo
    || body?.archive?.path
    || sourceMaterialisation?.archive?.path
    || authorityStatus?.archive?.path
    || "not configured";
}

function plannedArchivePathFrom(body, sourceMaterialisation) {
  return body?.preflight?.plannedArchivePath
    || body?.archive?.plannedArchivePath
    || sourceMaterialisation?.archive?.plannedArchivePath
    || "not planned/reported";
}

function validationResult(sourceValidation, sourceMaterialisation) {
  if (!sourceValidation) {
    if (sourceMaterialisation?.sourceInspection?.ok === true) return "status endpoint reports valid source";
    if (sourceMaterialisation?.sourceInspection?.ok === false) return `status endpoint reports invalid source: ${sourceMaterialisation.sourceInspection.reason || "reason not reported"}`;
    return "not run";
  }
  if (sourceValidation.ok === false) return `failed: ${sourceValidation.reason || "source validation failed"}`;
  const users = sourceValidation.hasUsersTable === true ? "USERS table present" : "USERS table not confirmed";
  const bytes = typeof sourceValidation.byteLength === "number" ? `${sourceValidation.byteLength} bytes` : "size unknown";
  return `passed · ${users} · ${bytes}`;
}

function deriveSyncBlockers(body) {
  if (!body) return ["Run dry-run sync preview to ask the sync endpoint for current blockers."];

  const blockers = Array.isArray(body.blockers) ? body.blockers.map((item) => `${item.code || "blocker"}: ${item.reason || item.severity || "reported"}`) : [];
  const preflight = body.preflight || {};
  if (preflight.syncEnabled === false) blockers.push("sync-disabled: Authority/reference sync is disabled by server/env config.");
  if (preflight.executionEnabled === false) blockers.push("execution-disabled: Live sync execution is disabled by server/env config.");
  if (preflight.sourceReadable === false) blockers.push("source-unreadable: Materialised source is not readable.");
  if (preflight.archiveAvailable === false) blockers.push("archive-unavailable: Archive directory is not available.");
  if (body.sourceValidation?.ok === false) blockers.push(`source-validation-failed: ${body.sourceValidation.reason || "Source validation failed."}`);
  if (String(body.status || "").includes("blocked") && !blockers.length) blockers.push(`${body.status}: Endpoint reported a blocked sync state.`);
  if (String(body.status || "").includes("failed") && !blockers.length) blockers.push(`${body.status}: Endpoint reported a failed sync state.`);
  return blockers.length ? blockers : ["No blockers reported by sync endpoint."];
}

function createDryRunModel({ syncState, syncEndpoints, authorityStatus, sourceMaterialisation }) {
  const result = syncState.dryRunResult;
  const body = syncResultBody(result);
  const endpointError = endpointResultText(result, syncState.dryRunError);
  const liveAllowed = body?.executable ?? sourceMaterialisation?.materialisation?.liveWriteReady ?? false;

  return {
    buttonLabel: "Run dry-run sync preview",
    endpoint: syncEndpoints.dryRun,
    running: syncState.dryRunStatus === "running",
    completed: syncState.dryRunCompleted === true,
    status: syncState.dryRunStatus || "idle",
    loadedAt: syncState.dryRunLoadedAt || "not run",
    rows: [
      ["mode", "Dry-run only — no files written"],
      ["endpoint", syncEndpoints.dryRun],
      ["sync result status", body?.status || syncState.dryRunStatus || "not run"],
      ["source configured", sourceConfiguredFrom(body, sourceMaterialisation)],
      ["source readable", sourceReadableFrom(body, sourceMaterialisation)],
      ["source path", sourcePathFrom(body, sourceMaterialisation)],
      ["validation result", validationResult(body?.sourceValidation, sourceMaterialisation)],
      ["target snapshot path", targetPathFrom(body, authorityStatus, sourceMaterialisation)],
      ["planned archive path", plannedArchivePathFrom(body, sourceMaterialisation)],
      ["live sync currently allowed", asText(liveAllowed, "no")],
      ["endpoint result", endpointError],
      ["loaded at", syncState.dryRunLoadedAt || "not run"],
    ],
    blockers: deriveSyncBlockers(body),
    errors: syncState.dryRunError ? [syncState.dryRunError] : [],
  };
}

function createLiveModel({ syncState, syncEndpoints, authorityStatus, sourceMaterialisation, loadedAt }) {
  const result = syncState.liveResult;
  const body = syncResultBody(result);
  const endpointError = endpointResultText(result, syncState.liveError);
  const dryRunComplete = syncState.dryRunCompleted === true;
  const confirmationMatches = syncState.confirmation === LIVE_CONFIRMATION_TEXT;
  const running = syncState.liveStatus === "running";

  return {
    buttonLabel: "Run confirmed live sync",
    endpoint: syncEndpoints.live,
    requiredConfirmation: LIVE_CONFIRMATION_TEXT,
    confirmationValue: syncState.confirmation || "",
    dryRunCompleted: dryRunComplete,
    running,
    disabled: !(dryRunComplete && confirmationMatches) || running,
    status: syncState.liveStatus || "idle",
    attempted: syncState.liveAttempted === true,
    loadedAt: syncState.liveLoadedAt || "not run",
    warning: "This writes/materialises the authority/reference JSON snapshot.",
    rows: [
      ["write warning", "This writes/materialises the authority/reference JSON snapshot."],
      ["endpoint", syncEndpoints.live],
      ["dry-run completed this session", asText(dryRunComplete, "no")],
      ["confirmation required", LIVE_CONFIRMATION_TEXT],
      ["sync result status", body?.status || syncState.liveStatus || "not run"],
      ["target snapshot path", targetPathFrom(body, authorityStatus, sourceMaterialisation)],
      ["snapshot modified time", targetModifiedFrom(body, authorityStatus, sourceMaterialisation)],
      ["archive path", archivePathFrom(body, authorityStatus, sourceMaterialisation)],
      ["planned archive path", plannedArchivePathFrom(body, sourceMaterialisation)],
      ["endpoint result", endpointError],
      ["loaded/refreshed timestamp", loadedAt || "not refreshed after sync"],
    ],
    blockers: deriveSyncBlockers(body),
    errors: syncState.liveError ? [syncState.liveError] : [],
  };
}

function createPostSyncProof({ syncState, authorityStatus, sourceMaterialisation, loadedAt }) {
  const body = syncResultBody(syncState.liveResult);
  return {
    visible: syncState.liveAttempted === true,
    title: "Post-sync proof",
    description: "Status endpoints are refreshed after each live sync attempt. This proof stays limited to status, paths, modified time, and blockers/failures.",
    rows: [
      ["sync result status", body?.status || syncState.liveStatus || "not attempted"],
      ["target snapshot path", targetPathFrom(body, authorityStatus, sourceMaterialisation)],
      ["snapshot modified time", targetModifiedFrom(body, authorityStatus, sourceMaterialisation)],
      ["archive path", archivePathFrom(body, authorityStatus, sourceMaterialisation)],
      ["planned archive path", plannedArchivePathFrom(body, sourceMaterialisation)],
      ["blockers/failures", deriveSyncBlockers(body).join(" · ")],
      ["loaded/refreshed timestamp", loadedAt || "not refreshed"],
    ],
  };
}

function createSyncWorkflowModel({ syncState = {}, syncEndpoints = {}, authorityStatus = {}, sourceMaterialisation = {}, loadedAt }) {
  const normalisedSyncState = {
    dryRunStatus: "idle",
    dryRunResult: null,
    dryRunError: null,
    dryRunLoadedAt: null,
    dryRunCompleted: false,
    liveStatus: "idle",
    liveResult: null,
    liveError: null,
    liveLoadedAt: null,
    liveAttempted: false,
    confirmation: "",
    ...syncState,
  };

  return {
    title: "Authority/reference sync workflow",
    description: "Restores the old NovonDB source sync core as a protected dry-run-first workflow. The UI never bypasses server/env gates.",
    dryRun: createDryRunModel({ syncState: normalisedSyncState, syncEndpoints, authorityStatus, sourceMaterialisation }),
    live: createLiveModel({ syncState: normalisedSyncState, syncEndpoints, authorityStatus, sourceMaterialisation, loadedAt }),
    postSyncProof: createPostSyncProof({ syncState: normalisedSyncState, authorityStatus, sourceMaterialisation, loadedAt }),
  };
}

function archiveListRows(archiveList = {}) {
  const archives = Array.isArray(archiveList.archives) ? archiveList.archives : [];
  return archives.map((archive) => ({
    name: archive.name,
    size: bytesLabel(archive.sizeBytes),
    sizeBytes: archive.sizeBytes,
    modifiedAt: archive.modifiedAt || "unknown",
  }));
}

function diffSectionRows(section = {}) {
  const counts = section.counts || {};
  return [
    ["section", section.section || "unknown"],
    ["type", section.type || "unknown"],
    ["archive rows/keys", asText(counts.archiveRows ?? counts.archiveKeys, "n/a")],
    ["current rows/keys", asText(counts.currentRows ?? counts.currentKeys, "n/a")],
    ["added", asText(counts.added, "0")],
    ["removed", asText(counts.removed, "0")],
    ["changed", asText(counts.changed, "0")],
    ["unchanged", asText(counts.unchanged, "0")],
    ["full rows returned", asText(section.fullRowsReturned, "no")],
  ];
}

function limitedEntries(list = {}) {
  const entries = Array.isArray(list.entries) ? list.entries : [];
  return {
    total: list.total || entries.length,
    truncated: list.truncated === true,
    entries,
  };
}

function createDiffSectionModel(section = {}) {
  const changed = limitedEntries(section.changedKeys);
  const added = limitedEntries(section.addedKeys);
  const removed = limitedEntries(section.removedKeys);
  return {
    section: section.section || "unknown",
    type: section.type || "unknown",
    rows: diffSectionRows(section),
    changed,
    added,
    removed,
  };
}

function formatDiffValue(value) {
  if (value === null || value === undefined) return "none";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function createDetailFieldRows(detailBody = {}) {
  const fields = Array.isArray(detailBody?.fields) ? detailBody.fields : [];
  return fields.map((item) => [
    item.field || "field",
    `old: ${formatDiffValue(item.old)} → new: ${formatDiffValue(item.new)}`,
  ]);
}

function restoreBlockers(body) {
  const blockers = Array.isArray(body?.blockers) ? body.blockers.map((item) => `${item.code || "blocker"}: ${item.reason || item.severity || "reported"}`) : [];
  if (!body) return ["Run restore preview for a selected archive to ask the server for restore blockers."];
  if (body.restoreAllowed === false && !blockers.length) blockers.push(`${body.status || "restore-blocked"}: Server did not allow restore.`);
  return blockers.length ? blockers : ["No blockers reported by restore endpoint."];
}

function restoreFailureRows(body) {
  const failures = Array.isArray(body?.failures) ? body.failures : [];
  return failures.map((item) => `${item.code || "failure"}: ${item.reason || item.severity || "reported"}`);
}

function createRestorePreviewModel({ archiveState = {}, archiveEndpoints = {} }) {
  const body = syncResultBody(archiveState.restorePreviewResult);
  const selectedArchiveName = archiveState.selectedArchiveName || archiveState.restorePreviewArchiveName || "";
  return {
    endpoint: archiveEndpoints.restorePreview,
    selectedArchiveName,
    status: archiveState.restorePreviewStatus || "idle",
    running: archiveState.restorePreviewStatus === "running",
    completed: archiveState.restorePreviewCompleted === true,
    loadedAt: archiveState.restorePreviewLoadedAt || "not run",
    error: archiveState.restorePreviewError || null,
    resultText: endpointResultText(archiveState.restorePreviewResult, archiveState.restorePreviewError),
    serverRestoreAllowed: body?.restoreAllowed === true,
    plannedPreRestoreArchiveName: body?.plannedPreRestoreArchive?.name || "not planned",
    rows: [
      ["selected archive", selectedArchiveName || "none selected"],
      ["endpoint", archiveEndpoints.restorePreview || "not configured"],
      ["status", body?.status || archiveState.restorePreviewStatus || "idle"],
      ["archive valid JSON", asText(body?.archiveJsonValid, "unknown")],
      ["archive name", body?.archive?.name || "not checked"],
      ["archive size", bytesLabel(body?.archive?.sizeBytes)],
      ["archive modified", body?.archive?.modifiedAt || "unknown"],
      ["current snapshot", body?.currentSnapshot?.name || "not checked"],
      ["current status", body?.currentSnapshot?.status || "unknown"],
      ["current size", bytesLabel(body?.currentSnapshot?.sizeBytes)],
      ["current modified", body?.currentSnapshot?.modifiedAt || "unknown"],
      ["planned pre-restore archive", body?.plannedPreRestoreArchive?.name || "not planned"],
      ["server restore gate", body?.restoreConfig?.enabled === true ? "enabled" : "disabled"],
      ["restore would be allowed", asText(body?.restoreAllowed, "no")],
      ["absolute paths exposed", asText(body?.absolutePathsExposed, "no")],
      ["full DB returned", asText(body?.fullDatabaseReturned, "no")],
      ["full USERS returned", asText(body?.fullUsersReturned, "no")],
      ["mutation attempted", asText(body?.mutationAttempted, "no")],
      ["loaded at", archiveState.restorePreviewLoadedAt || "not run"],
      ["endpoint result", endpointResultText(archiveState.restorePreviewResult, archiveState.restorePreviewError)],
    ],
    blockers: restoreBlockers(body),
    errors: archiveState.restorePreviewError ? [archiveState.restorePreviewError] : [],
  };
}

function createRestoreLiveModel({ archiveState = {}, archiveEndpoints = {}, previewModel = {} }) {
  const body = syncResultBody(archiveState.restoreResult);
  const confirmationMatches = archiveState.restoreConfirmation === RESTORE_CONFIRMATION_TEXT;
  const previewCompleted = archiveState.restorePreviewCompleted === true;
  const archiveSelected = Boolean(archiveState.restorePreviewArchiveName || archiveState.selectedArchiveName);
  const serverRestoreAllowed = previewModel.serverRestoreAllowed === true;
  const running = archiveState.restoreStatus === "running";
  return {
    endpoint: archiveEndpoints.restore,
    requiredConfirmation: RESTORE_CONFIRMATION_TEXT,
    confirmationValue: archiveState.restoreConfirmation || "",
    previewCompleted,
    archiveSelected,
    serverRestoreAllowed,
    running,
    disabled: !(previewCompleted && archiveSelected && confirmationMatches && serverRestoreAllowed) || running,
    status: archiveState.restoreStatus || "idle",
    attempted: archiveState.restoreAttempted === true,
    loadedAt: archiveState.restoreLoadedAt || "not run",
    warning: "This overwrites the current authority/reference snapshot from the selected archive.",
    rows: [
      ["write warning", "This overwrites the current authority/reference snapshot from the selected archive."],
      ["endpoint", archiveEndpoints.restore || "not configured"],
      ["selected archive", archiveState.restorePreviewArchiveName || archiveState.selectedArchiveName || "none selected"],
      ["preview completed this session", asText(previewCompleted, "no")],
      ["server restore allowed", asText(serverRestoreAllowed, "no")],
      ["confirmation required", RESTORE_CONFIRMATION_TEXT],
      ["restore result status", body?.status || archiveState.restoreStatus || "not run"],
      ["restored archive", body?.restoredArchiveName || "not restored"],
      ["target snapshot", body?.targetSnapshot?.name || "not reported"],
      ["target modified", body?.targetSnapshot?.modifiedAt || "unknown"],
      ["pre-restore archive", body?.preRestoreArchive?.name || previewModel.plannedPreRestoreArchiveName || "not reported"],
      ["status refreshed", asText(body?.statusRefreshed, "not reported")],
      ["absolute paths exposed", asText(body?.absolutePathsExposed, "no")],
      ["full DB returned", asText(body?.fullDatabaseReturned, "no")],
      ["full USERS returned", asText(body?.fullUsersReturned, "no")],
      ["loaded at", archiveState.restoreLoadedAt || "not run"],
      ["endpoint result", endpointResultText(archiveState.restoreResult, archiveState.restoreError)],
    ],
    blockers: restoreBlockers(body),
    failures: restoreFailureRows(body),
    errors: archiveState.restoreError ? [archiveState.restoreError] : [],
  };
}

function createPostRestoreProof({ archiveState = {}, loadedAt }) {
  const body = syncResultBody(archiveState.restoreResult);
  return {
    visible: archiveState.restoreAttempted === true,
    title: "Post-restore proof",
    description: "Status is refreshed after each restore attempt. The proof stays limited to metadata, blocker/failure status, and archive names only.",
    rows: [
      ["restore result status", body?.status || archiveState.restoreStatus || "not attempted"],
      ["restored archive", body?.restoredArchiveName || "not restored"],
      ["target snapshot", body?.targetSnapshot?.name || "not reported"],
      ["target modified", body?.targetSnapshot?.modifiedAt || "unknown"],
      ["pre-restore archive", body?.preRestoreArchive?.name || "not reported"],
      ["blockers/failures", [...restoreBlockers(body), ...restoreFailureRows(body)].join(" · ")],
      ["loaded/refreshed timestamp", loadedAt || "not refreshed"],
    ],
  };
}

function createArchiveInspectionModel({ archiveState = {}, archiveEndpoints = {}, archiveList = {}, loadedAt }) {
  const archives = archiveListRows(archiveList);
  const diffBody = syncResultBody(archiveState.diffResult);
  const detailBody = syncResultBody(archiveState.detailResult);
  const diffSections = Array.isArray(diffBody?.sections) ? diffBody.sections.map(createDiffSectionModel) : [];
  const selectedArchiveName = archiveState.selectedArchiveName || "";
  const restorePreview = createRestorePreviewModel({ archiveState, archiveEndpoints });
  const restoreLive = createRestoreLiveModel({ archiveState, archiveEndpoints, previewModel: restorePreview });
  return {
    title: "Archive diff and restore inspection",
    description: "Archive entries expose basename metadata only. Diff detail is fetched on demand; restore is preview-first and never returns full rows or full database JSON.",
    endpoints: archiveEndpoints,
    list: {
      endpoint: archiveEndpoints.list,
      status: archiveList.status || "unknown",
      count: archiveList.count ?? archives.length,
      basenameMetadataOnly: archiveList.basenameMetadataOnly === true,
      absolutePathsExposed: archiveList.absolutePathsExposed === true,
      rawFileContentExposed: archiveList.rawFileContentExposed === true,
      archives,
      rows: [
        ["endpoint", archiveEndpoints.list || "not configured"],
        ["status", archiveList.status || "unknown"],
        ["archive count", asText(archiveList.count ?? archives.length, "0")],
        ["basename metadata only", asText(archiveList.basenameMetadataOnly, "yes")],
        ["absolute paths exposed", asText(archiveList.absolutePathsExposed, "no")],
        ["raw file content exposed", asText(archiveList.rawFileContentExposed, "no")],
        ["reason", archiveList.reason || "none"],
      ],
    },
    diff: {
      endpoint: archiveEndpoints.diff,
      selectedArchiveName,
      status: archiveState.diffStatus || "idle",
      running: archiveState.diffStatus === "running",
      loadedAt: archiveState.diffLoadedAt || "not run",
      error: archiveState.diffError || null,
      resultText: endpointResultText(archiveState.diffResult, archiveState.diffError),
      totalsRows: [
        ["selected archive", selectedArchiveName || "none selected"],
        ["endpoint", archiveEndpoints.diff || "not configured"],
        ["status", diffBody?.status || archiveState.diffStatus || "idle"],
        ["added", asText(diffBody?.totals?.added, "0")],
        ["removed", asText(diffBody?.totals?.removed, "0")],
        ["changed", asText(diffBody?.totals?.changed, "0")],
        ["full database returned", asText(diffBody?.fullDatabaseReturned, "no")],
        ["full USERS returned", asText(diffBody?.fullUsersReturned, "no")],
        ["absolute paths exposed", asText(diffBody?.absolutePathsExposed, "no")],
        ["loaded at", archiveState.diffLoadedAt || "not run"],
        ["endpoint result", endpointResultText(archiveState.diffResult, archiveState.diffError)],
      ],
      sections: diffSections,
    },
    detail: {
      endpoint: archiveEndpoints.diffDetail,
      status: archiveState.detailStatus || "idle",
      running: archiveState.detailStatus === "running",
      loadedAt: archiveState.detailLoadedAt || "not run",
      error: archiveState.detailError || null,
      selectedDetail: archiveState.selectedDetail || null,
      rows: [
        ["endpoint", archiveEndpoints.diffDetail || "not configured"],
        ["status", detailBody?.status || archiveState.detailStatus || "idle"],
        ["record status", detailBody?.recordStatus || "not inspected"],
        ["section", detailBody?.section || archiveState.selectedDetail?.section || "none"],
        ["inspect key", detailBody?.inspectKey || archiveState.selectedDetail?.inspectKey || "none"],
        ["field count", asText(detailBody?.fieldCount, "0")],
        ["truncated", asText(detailBody?.truncated, "no")],
        ["full row returned", asText(detailBody?.fullRowReturned, "no")],
        ["full database returned", asText(detailBody?.fullDatabaseReturned, "no")],
        ["full USERS returned", asText(detailBody?.fullUsersReturned, "no")],
        ["loaded at", archiveState.detailLoadedAt || "not run"],
        ["endpoint result", endpointResultText(archiveState.detailResult, archiveState.detailError)],
      ],
      fieldRows: createDetailFieldRows(detailBody),
    },
    restore: {
      preview: restorePreview,
      live: restoreLive,
      postRestoreProof: createPostRestoreProof({ archiveState, loadedAt }),
    },
  };
}

export function createAdminDevViewModel({ context = {}, endpoints = {}, syncEndpoints = {}, archiveEndpoints = {}, state = {} } = {}) {
  const authorityStatus = payloadBody(state, "authorityStatus");
  const sourceMaterialisation = payloadBody(state, "sourceMaterialisation");
  const archiveList = payloadBody(state, "archiveList");
  const runtimeConfig = payloadBody(state, "runtimeConfig");
  const health = payloadBody(state, "health");
  const decision = decisionFor(context);
  const role = actualRole(context);
  const allowed = canViewAdminDev(context);
  const endpointStatusRows = endpointRows(endpoints, state);
  const failedReads = state.errors?.length || 0;
  const snapshot = authorityStatus.snapshot || sourceMaterialisation.targetSnapshot || {};
  const archive = authorityStatus.archive || sourceMaterialisation.archive || {};
  const sync = authorityStatus.sync || {};
  const writePolicy = authorityStatus.writePolicy || sourceMaterialisation.writePolicy || {};

  return {
    moduleId: "admin_dev",
    label: "Admin / Dev",
    title: "Data Admin / Authority Reference",
    access: {
      allowed,
      role,
      displayRole: displayRole(context),
      reason: decision?.reason || (allowed ? "allowed" : "developer_or_admin_required"),
      decisionVisible: decision?.visible === true,
    },
    status: {
      value: state.status || "idle",
      loadedAt: state.loadedAt || "not loaded",
      failedReads,
      endpointCount: endpointStatusRows.length,
    },
    headerRows: [
      ["module id", "admin_dev"],
      ["route", "/workspace?module=admin_dev"],
      ["visible label", "Admin / Dev"],
      ["authority role", role],
      ["display role", displayRole(context)],
      ["visibility", decision?.reason || "unknown"],
      ["read policy", "GET status/archive reads only"],
      ["write policy", "dry-run first; live sync requires SYNC confirmation and server approval"],
      ["archive policy", "list/diff/detail plus preview-first RESTORE workflow behind server env gate"],
    ],
    cards: [
      {
        title: "Authority/reference snapshot",
        description: "Target snapshot status only. No full database payload is fetched or rendered.",
        rows: pathRows(snapshot),
      },
      {
        title: "Source materialisation",
        description: "Source/materialisation readiness from the runtime status endpoint.",
        rows: [
          ["status", sourceMaterialisation.status || "unknown"],
          ["source type", sourceMaterialisation.sourceProfile?.sourceType || sync.sourceType || "unknown"],
          ["sync enabled", asText(sourceMaterialisation.sourceProfile?.syncEnabled ?? sync.enabled, "unknown")],
          ["source configured", asText(sourceMaterialisation.sourceProfile?.sourceConfigured ?? sync.sourceConfigured, "unknown")],
          ["materialised source", sourceMaterialisation.sourceProfile?.materialisedSourcePath || sync.materialisedSourcePath || "not configured"],
          ["source readable", asText(sourceMaterialisation.sourceFile?.readable, "unknown")],
          ["source valid", asText(sourceMaterialisation.sourceInspection?.ok, "unknown")],
          ["materialisation ready", asText(sourceMaterialisation.materialisation?.ready, "unknown")],
          ["live write ready", asText(sourceMaterialisation.materialisation?.liveWriteReady, "no")],
        ],
      },
      {
        title: "Authority table counts",
        description: "Counts only. This module does not expose full USERS, contacts, companies, or raw DB rows.",
        rows: tableCountRows(sourceMaterialisation),
      },
      {
        title: "Archive readiness",
        description: "Archive status plus list/diff/detail inspection and a gated restore workflow. Restore remains preview-first, confirmation-gated, and server/env-gated.",
        rows: [
          ["configured", asText(archive.configured, "unknown")],
          ["available", asText(archive.available, "unknown")],
          ["path", archive.path || "not configured"],
          ["planned archive", archive.plannedArchivePath || "not planned"],
          ["archive list count", asText(archiveList.count, "0")],
          ["archive entries basename-only", asText(archiveList.basenameMetadataOnly, "yes")],
          ["archive before write", asText(archive.archiveBeforeWriteRequired, "yes")],
          ["archive write live", asText(archive.archiveBeforeWriteLive, "no")],
          ["reason", archive.reason || archiveList.reason || "none"],
        ],
      },
      {
        title: "Runtime config boundary",
        description: "Configuration status with secret values redacted by the runtime server.",
        rows: [
          ["status", runtimeConfig.status || "unknown"],
          ["source", runtimeConfig.source || "unknown"],
          ["browser secrets exposed", asText(runtimeConfig.browserSecretsExposed, "no")],
          ["repo local secrets", asText(runtimeConfig.repoLocalSecrets, "no")],
          ["optional integrations", runtimeConfig.optionalIntegrationsNonBlocking ? "non-blocking" : "unknown"],
          ["runtime data home", runtimeConfig.authorityReference?.runtimeDataHome || "not reported"],
          ["snapshot env", runtimeConfig.authorityReference?.snapshotPath?.status || "unknown"],
          ["archive env", runtimeConfig.authorityReference?.archiveDir?.status || "unknown"],
          ["restore env", runtimeConfig.authorityReference?.restoreEnabled?.status || "unknown"],
          ["legacy transitional path", runtimeConfig.authorityReference?.legacyTransitionalPath || "none"],
        ],
      },
      {
        title: "Write policy",
        description: "Live materialisation is available only through the approved server sync POST and only when server/env gates allow it.",
        rows: [
          ["enabled", asText(writePolicy.enabled, "no")],
          ["admin only", asText(writePolicy.adminOnly, "yes")],
          ["archive before write", asText(writePolicy.archiveBeforeWriteRequired, "yes")],
          ["archive write live", asText(writePolicy.archiveBeforeWriteLive, "no")],
          ["reason", writePolicy.reason || "Writes remain server-gated and confirmation-gated."],
        ],
      },
      {
        title: "Runtime health",
        description: "Optional runtime health read. Included only as a GET status surface.",
        rows: [
          ["status", health.status || "unknown"],
          ["owner", health.owner || "runtime-server"],
          ["root", health.root || "not reported"],
          ["normal workflow", health.normalWorkflowConcern === false ? "not a normal workflow dependency" : "unknown"],
        ],
      },
    ],
    syncWorkflow: createSyncWorkflowModel({
      syncState: state.sync,
      syncEndpoints,
      authorityStatus,
      sourceMaterialisation,
      loadedAt: state.loadedAt,
    }),
    archiveInspection: createArchiveInspectionModel({
      archiveState: state.archiveInspection,
      archiveEndpoints,
      archiveList,
      loadedAt: state.loadedAt,
    }),
    endpoints: endpointStatusRows,
    blockers: blockerItems(sourceMaterialisation),
    safety: [
      "Archive list returns basename metadata only: name, sizeBytes, modifiedAt",
      "Archive diff accepts basename archiveName only and rejects path traversal/absolute paths",
      "Diff summary returns section/table counts and changed-key handles only",
      "Field-level diff is on-demand only and returns changed fields only as old/new pairs",
      "Restore preview returns metadata/blockers only and performs no file mutation",
      "Live restore requires selected archive, preview in this page session, exact RESTORE text, and server env gate",
      "Live restore archives the current snapshot before overwriting it from the selected archive",
      "Complex or sensitive field values are summarised/redacted instead of dumping rows",
      "Only approved sync POSTs are exposed: dry-run=true and dryRun=false",
      "Live sync is disabled until a dry-run completes in the current page session",
      "Live sync requires exact SYNC confirmation text",
      "Server/env write gates are never bypassed",
      "No archive deletion",
      "No row editing or correction workflow",
      "No full DB dump or full USERS exposure",
      "No HubSpot writes",
      "No project writes",
      "No selector or Timeline changes",
    ],
    warnings: [
      ...(snapshot.transitionalPath ? ["Authority/reference snapshot is using the legacy transitional NovonDB path through an env override/alias."] : []),
      ...(failedReads ? [`${failedReads} read endpoint(s) failed; module remained isolated from normal workflow.`] : []),
    ],
  };
}
