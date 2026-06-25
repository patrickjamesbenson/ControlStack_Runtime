const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);

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
      note: error?.message || "GET only / no mutation",
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

export function createAdminDevViewModel({ context = {}, endpoints = {}, state = {} } = {}) {
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
      ["read policy", "GET-only status reads"],
      ["write policy", "disabled in AD-1"],
    ],
    cards: [
      {
        title: "Authority/reference snapshot",
        description: "Target snapshot status only. No full database payload is fetched or rendered.",
        rows: pathRows(snapshot),
      },
      {
        title: "Source materialisation",
        description: "Read-only source/materialisation readiness from the runtime status endpoint.",
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
        description: "Counts only. AD-1 does not expose full USERS, contacts, companies, or raw DB rows.",
        rows: tableCountRows(sourceMaterialisation),
      },
      {
        title: "Archive readiness",
        description: "Archive status only. No archive listing, diff, restore, or file mutation is available here.",
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
        description: "AD-1 is read-only. This panel reports write gates only and exposes no mutation controls.",
        rows: [
          ["enabled", asText(writePolicy.enabled, "no")],
          ["admin only", asText(writePolicy.adminOnly, "yes")],
          ["archive before write", asText(writePolicy.archiveBeforeWriteRequired, "yes")],
          ["archive write live", asText(writePolicy.archiveBeforeWriteLive, "no")],
          ["reason", writePolicy.reason || "Writes are disabled in this module."],
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
    endpoints: endpointStatusRows,
    blockers: blockerItems(sourceMaterialisation),
    safety: [
      "No POST calls",
      "No sync execution",
      "No restore",
      "No row editing",
      "No full DB dump",
      "No full USERS exposure",
      "No HubSpot writes",
      "No project writes",
      "No selector or Timeline changes",
    ],
    warnings: [
      ...(snapshot.transitionalPath ? ["Authority/reference snapshot is still using the transitional NovonDB path."] : []),
      ...(failedReads ? [`${failedReads} read endpoint(s) failed; module remained isolated and read-only.`] : []),
    ],
  };
}
