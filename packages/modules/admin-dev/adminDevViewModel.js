const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);
const LIVE_CONFIRMATION_TEXT = "SYNC";

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

export function createAdminDevViewModel({ context = {}, endpoints = {}, syncEndpoints = {}, state = {} } = {}) {
  const authorityStatus = payloadBody(state, "authorityStatus");
  const sourceMaterialisation = payloadBody(state, "sourceMaterialisation");
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
      ["read policy", "GET status reads only"],
      ["write policy", "dry-run first; live sync requires SYNC confirmation and server approval"],
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
        description: "Archive status only. No archive listing, diff, restore, or file mutation is available here outside the approved sync endpoint.",
        rows: [
          ["configured", asText(archive.configured, "unknown")],
          ["available", asText(archive.available, "unknown")],
          ["path", archive.path || "not configured"],
          ["planned archive", archive.plannedArchivePath || "not planned"],
          ["archive before write", asText(archive.archiveBeforeWriteRequired, "yes")],
          ["archive write live", asText(archive.archiveBeforeWriteLive, "no")],
          ["reason", archive.reason || "none"],
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
          ["snapshot env", runtimeConfig.authorityReference?.snapshotPath?.status || "unknown"],
          ["archive env", runtimeConfig.authorityReference?.archiveDir?.status || "unknown"],
          ["transitional fallback", runtimeConfig.authorityReference?.transitionalFallbackPath || "none"],
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
    endpoints: endpointStatusRows,
    blockers: blockerItems(sourceMaterialisation),
    safety: [
      "Only approved sync POSTs are exposed: dry-run=true and dryRun=false",
      "Live sync is disabled until a dry-run completes in the current page session",
      "Live sync requires exact SYNC confirmation text",
      "Server/env write gates are never bypassed",
      "No restore or archive restore",
      "No row editing or correction workflow",
      "No full DB dump or full USERS exposure",
      "No HubSpot writes",
      "No project writes",
      "No selector or Timeline changes",
    ],
    warnings: [
      ...(snapshot.transitionalPath ? ["Authority/reference snapshot is still using the transitional NovonDB path."] : []),
      ...(failedReads ? [`${failedReads} read endpoint(s) failed; module remained isolated from normal workflow.`] : []),
    ],
  };
}