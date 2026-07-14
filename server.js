import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { access, copyFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { basename, extname, isAbsolute, join, normalize, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { buildLabProofStatus, LAB_PROOF_STATUS_PATH } from "./packages/workspace-kernel/labProofStatusService.js";
import {
  AUTHORITY_REFERENCE_MATERIALISER_REFRESH_PATH,
  AUTHORITY_REFERENCE_MATERIALISER_STATUS_PATH,
  AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION,
  buildAuthorityReferenceMaterialiserStatus,
  refreshAuthorityReferenceMaterialiser,
} from "./packages/workspace-kernel/authorityReferenceMaterialiserService.js";
import { buildSyncEnvironment, promoteMaterialisedAuthorityReference } from "./scripts/refresh_authority_reference_from_google.js";
import { buildSelectorReferenceStatus, SELECTOR_REFERENCE_STATUS_PATH } from "./packages/workspace-kernel/selectorReferenceService.js";
import { buildSelectorReferenceOptions, SELECTOR_REFERENCE_OPTIONS_PATH } from "./packages/workspace-kernel/selectorReferenceOptionsService.js";

import { buildBoardDataStatus, BOARD_DATA_STATUS_PATH } from "./packages/workspace-kernel/boardDataStatusService.js";
import { buildIesBuilderStatus, IES_BUILDER_STATUS_PATH } from "./packages/workspace-kernel/iesBuilderStatusService.js";
import { createSavedProjectStore } from "./packages/workspace-kernel/savedProjectStore.js";
import {
  createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
} from "./packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js";
import {
  createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
} from "./packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js";

const PORT = Number.parseInt(process.env.CONTROLSTACK_RUNTIME_PORT || "8787", 10);
const HOST = process.env.CONTROLSTACK_RUNTIME_HOST || "127.0.0.1";
const ROOT = resolve(process.cwd());
const SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_PATH = resolve(
  ROOT,
  "tools/runtime/engine_runtable_selected_project_readonly_host_adapter.py",
);
const SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_MAX_OUTPUT_BYTES = 1024 * 1024;
const SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_TIMEOUT_MS = 120000;
const NVB_READ_PATH = "/api/nvb-" + String.fromCharCode(97, 117, 116, 104, 111, 114, 105, 116, 121) + "/read";
const HUBSPOT_READ_PATH = "/api/hubspot/read";
const HUBSPOT_AUTH_STATUS_PATH = "/api/hubspot/auth-status";
const HUBSPOT_DEAL_PREFLIGHT_PATH = "/api/hubspot/deal-writeback/preflight";
const AUTH_REF_STATUS_PATH = "/api/" + "authority-reference" + "/status";
const AUTH_REF_SYNC_PATH = "/api/" + "authority-reference" + "/sync";
const AUTH_REF_SOURCE_MATERIALISATION_PATH = "/api/" + "authority-reference" + "/source-materialisation";
const AUTH_REF_MATERIALISER_STATUS_PATH = AUTHORITY_REFERENCE_MATERIALISER_STATUS_PATH;
const AUTH_REF_MATERIALISER_REFRESH_PATH = AUTHORITY_REFERENCE_MATERIALISER_REFRESH_PATH;
const AUTH_REF_ARCHIVES_PATH = "/api/" + "authority-reference" + "/archives";
const AUTH_REF_DIFF_PATH = "/api/" + "authority-reference" + "/diff";
const AUTH_REF_DIFF_DETAIL_PATH = "/api/" + "authority-reference" + "/diff-detail";
const AUTH_REF_RESTORE_PREVIEW_PATH = "/api/" + "authority-reference" + "/restore/preview";
const AUTH_REF_RESTORE_PATH = "/api/" + "authority-reference" + "/restore";
const CONFIG_STATUS_PATH = "/api/runtime-config/status";
const AUTH_REF_RESTORE_CONFIRMATION_TEXT = "RESTORE";
const AUTH_REF_POST_PATHS = new Set([
  AUTH_REF_SYNC_PATH,
  AUTH_REF_MATERIALISER_REFRESH_PATH,
  AUTH_REF_DIFF_PATH,
  AUTH_REF_DIFF_DETAIL_PATH,
  AUTH_REF_RESTORE_PREVIEW_PATH,
  AUTH_REF_RESTORE_PATH,
]);

const AUTH_REF_DATA_HOME = "C:\\ControlStack_RuntimeData\\authority-reference";
const AUTH_REF_DEFAULT_SNAPSHOT_PATH = join(AUTH_REF_DATA_HOME, "novondb.json");
const AUTH_REF_DEFAULT_MATERIALISED_SOURCE_PATH = join(AUTH_REF_DATA_HOME, "materialised", "novondb.json");
const AUTH_REF_DEFAULT_ARCHIVE_DIR = join(AUTH_REF_DATA_HOME, "archive");
const AUTH_REF_LEGACY_TRANSITIONAL_PATH = "C:\\ControlStack\\data\\novondb.json";

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
]);

const STATIC_DENY_FILENAMES = new Set([".DS_Store", "Thumbs.db"]);
const STATIC_DENY_BASENAME_PATTERN = /(?:\.bak(?:_|$)|\.tmp$|\.temp$|\.orig$|\.rej$|\.patch$|\.diff$|~$)/i;

function isDeniedStaticServedFile(absolutePath) {
  return normalize(String(absolutePath || ""))
    .split(/[\\/]+/)
    .some((part) => STATIC_DENY_FILENAMES.has(part) || STATIC_DENY_BASENAME_PATTERN.test(part));
}

function looksLikeLocalFilesystemPath(value) {
  const text = String(value || "");
  return /^[A-Za-z]:[\\/]/.test(text)
    || /^\\\\/.test(text)
    || text.includes("\\ControlStack")
    || text.includes("/ControlStack_Runtime")
    || text.includes("/ControlStack/");
}

function isPublicLocalPathKey(key) {
  return /(path|root|dir|home)$/i.test(String(key || ""));
}

function shouldRedactPublicLocalPath(key, value) {
  if (typeof value !== "string" || !value) return false;
  if (key === "endpoint" || key === "liveWritePath" || key === "writePath") return false;
  return isPublicLocalPathKey(key) && looksLikeLocalFilesystemPath(value);
}

function redactPublicLocalPathFields(value) {
  if (Array.isArray(value)) return value.map(redactPublicLocalPathFields);
  if (!value || typeof value !== "object") return value;

  let redactedPath = false;
  let redactedRoot = false;
  const result = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    if (shouldRedactPublicLocalPath(key, nestedValue)) {
      result[key] = "redacted";
      redactedPath = true;
      if (/root/i.test(key)) redactedRoot = true;
      continue;
    }
    result[key] = redactPublicLocalPathFields(nestedValue);
  }
  if (redactedPath) {
    result.pathRedacted = true;
    result.localPathExposureEnabled = false;
  }
  if (redactedRoot) {
    result.rootRedacted = true;
  }
  return result;
}

function sendPublicStatusJson(res, status, payload) {
  sendJson(res, status, redactPublicLocalPathFields(payload));
}

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2), "application/json; charset=utf-8");
}

function readBooleanEnv(name, fallback = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(raw).trim().toLowerCase());
}

function readNumberEnv(name, fallback, minimum) {
  const parsed = Number(process.env[name]);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, parsed);
}

function readMethodEnv(name, fallback = "GET") {
  const method = String(process.env[name] || fallback).trim().toUpperCase();
  return method === "POST" ? "POST" : "GET";
}

function readCredentialsEnv(name, fallback = "same-origin") {
  const value = String(process.env[name] || fallback).trim();
  return ["omit", "same-origin", "include"].includes(value) ? value : fallback;
}

const DEFAULT_COMPANY_IDENTITY_OVERRIDE_MAP = Object.freeze({
  "novonlighting.com.au": "Novon Lighting",
});

const DEFAULT_COMPANY_IDENTITY_FREEMAIL_BLOCKLIST = Object.freeze([
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "bigpond.com",
  "bigpond.net.au",
  "optusnet.com.au",
  "tpg.com.au",
  "iinet.net.au",
  "internode.on.net",
]);

const DEFAULT_COMPANY_IDENTITY_PUBLIC_SUFFIXES = Object.freeze([
  ".com.au",
  ".net.au",
  ".org.au",
  ".edu.au",
  ".gov.au",
  ".asn.au",
  ".id.au",
  ".co.nz",
  ".co.uk",
  ".com",
  ".net",
  ".org",
  ".io",
  ".co",
]);

function readJsonObjectEnv(name, fallback = {}) {
  const raw = readTextEnv(name);
  if (!raw) return { ...fallback };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { ...fallback };
    return { ...fallback, ...parsed };
  } catch {
    return { ...fallback };
  }
}

function buildCompanyIdentityConfig() {
  return {
    logoDevPublishableKey: readTextEnv("LOGODEV_PUBLISHABLE_KEY"),
    overrideMap: readJsonObjectEnv("CONTROLSTACK_COMPANY_IDENTITY_OVERRIDE_MAP", DEFAULT_COMPANY_IDENTITY_OVERRIDE_MAP),
    freemailBlocklist: [...DEFAULT_COMPANY_IDENTITY_FREEMAIL_BLOCKLIST],
    publicSuffixes: [...DEFAULT_COMPANY_IDENTITY_PUBLIC_SUFFIXES],
  };
}

function buildRuntimeConfig() {
  const endpoint = String(process.env.CONTROLSTACK_NVB_AUTHORITY_ENDPOINT || NVB_READ_PATH).trim();
  const enabled = readBooleanEnv("CONTROLSTACK_NVB_AUTHORITY_ENABLED", Boolean(endpoint));
  return {
    nvbAuthority: {
      enabled,
      endpoint,
      method: readMethodEnv("CONTROLSTACK_NVB_AUTHORITY_METHOD", "GET"),
      timeoutMs: readNumberEnv("CONTROLSTACK_NVB_AUTHORITY_TIMEOUT_MS", 2500, 250),
      ttlMs: readNumberEnv("CONTROLSTACK_NVB_AUTHORITY_TTL_MS", 30000, 1000),
      credentials: readCredentialsEnv("CONTROLSTACK_NVB_AUTHORITY_CREDENTIALS", "same-origin"),
      emailQueryParam: String(process.env.CONTROLSTACK_NVB_AUTHORITY_EMAIL_QUERY_PARAM || "email").trim() || "email",
      headers: {},
    },
    companyIdentity: buildCompanyIdentityConfig(),
  };
}

function sendRuntimeConfig(res) {
  const config = buildRuntimeConfig();
  const body = `globalThis.__CONTROLSTACK_RUNTIME_CONFIG__ = Object.freeze(${JSON.stringify(config, null, 2)});\n`;
  send(res, 200, body, "text/javascript; charset=utf-8");
}

function normaliseEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function splitCsv(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function truthyFlag(value) {
  return ["1", "true", "yes", "y", "blocked", "active"].includes(String(value || "").trim().toLowerCase());
}

function roleRank(role) {
  return { external_user: 0, internal_user: 10, internal_engineer: 20, developer: 30 }[role] ?? 0;
}

function canonicalRoleForToken(token) {
  const value = String(token || "").trim().toLowerCase();
  const map = {
    developer: "developer",
    internal_engineer: "internal_engineer",
    internal_engineering: "internal_engineer",
    internal_developer_systems: "internal_engineer",
    internal_user: "internal_user",
    management: "internal_user",
    internal_sales: "internal_user",
    internal_sales_bdm: "internal_user",
    external_user: "external_user",
    external_all: "external_user",
  };
  return map[value] || "external_user";
}

function canonicalRoleForRow(row = {}) {
  const tokens = splitCsv(row.contact_roles_assigned || row.cs_role || row.role || row.roles);
  let best = "external_user";
  for (const token of tokens) {
    const role = canonicalRoleForToken(token);
    if (roleRank(role) > roleRank(best)) best = role;
  }
  return best;
}

function readAuthorityReferenceSnapshotPath() {
  return String(
    process.env.CONTROLSTACK_AUTHORITY_REFERENCE_SNAPSHOT_PATH ||
    process.env.NOVONDB_PATH ||
    process.env.CONTROLSTACK_DB_PATH ||
    process.env.CENTRAL_DB_PATH ||
    AUTH_REF_DEFAULT_SNAPSHOT_PATH
  ).trim();
}

function readNovonDbSnapshotPath() {
  return readAuthorityReferenceSnapshotPath();
}

function pickUsersTable(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return [];
  if (Array.isArray(snapshot.USERS)) return snapshot.USERS;
  if (Array.isArray(snapshot.users)) return snapshot.users;
  return [];
}

function findExactUserRow(users, email) {
  const target = normaliseEmail(email);
  if (!target) return null;
  return users.find((row) => {
    if (!row || typeof row !== "object") return false;
    return [row.email_login, row.email, row.email_address].some((candidate) => normaliseEmail(candidate) === target);
  }) || null;
}

function authorityRecordFromUserRow(row, email) {
  const matchedEmail = normaliseEmail(row.email_login || row.email || row.email_address || email);
  const blacklistActive = truthyFlag(row.blocked || row.blacklisted || row.blacklist);
  const caveat = String(row.caveats || row.caveat || "").trim();
  return {
    recordId: `novondb-users:${matchedEmail}`,
    email: matchedEmail,
    actualRole: canonicalRoleForRow(row),
    confidence: "high",
    specialVisibility: [],
    exceptionalEntitlements: splitCsv(row.system_component_ids || row.system_componrent_ids || row.system_component_id),
    restrictions: caveat ? [caveat] : [],
    blacklist: {
      active: blacklistActive,
      reason: blacklistActive ? (caveat || "Blocked in NovonDB USERS row.") : null,
    },
  };
}

async function sendNvbAuthorityRead(res, requestUrl) {
  const email = normaliseEmail(requestUrl.searchParams.get("email"));
  if (!email) {
    sendJson(res, 400, {
      ok: false,
      matched: false,
      reason: "email query parameter is required for read-only NVB authority lookup.",
    });
    return;
  }

  const snapshotPath = readNovonDbSnapshotPath();
  let snapshot;
  try {
    snapshot = JSON.parse(await readFile(snapshotPath, "utf-8"));
  } catch (error) {
    sendJson(res, 503, {
      ok: false,
      matched: false,
      reason: `Local NovonDB snapshot is unavailable. Conservative shell fallback applies.`,
      source: "local-novondb-read",
    });
    return;
  }

  const userRow = findExactUserRow(pickUsersTable(snapshot), email);
  if (!userRow) {
    sendJson(res, 200, {
      ok: true,
      matched: false,
      reason: "No exact NovonDB USERS match for email_login, email, or email_address. Conservative shell fallback applies.",
      source: "local-novondb-read",
    });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    matched: true,
    source: "local-novondb-read",
    reason: "Exact NovonDB USERS row matched from local read-only snapshot.",
    record: authorityRecordFromUserRow(userRow, email),
  });
}

const sendNvbRead = (...args) => sendNvbAuthorityRead(...args);

function readTextEnv(name) {
  return String(process.env[name] || "").trim();
}

function firstConfiguredEnv(names = []) {
  for (const name of names) {
    if (readTextEnv(name)) return name;
  }
  return null;
}

function envStatus({ primary, aliases = [], secret = false, valueKind = "string" }) {
  const names = [primary, ...aliases].filter(Boolean);
  const activeName = firstConfiguredEnv(names);
  return {
    primary,
    aliasesRetained: aliases,
    activeName,
    configured: Boolean(activeName),
    valueKind,
    secret,
    browserVisibleValue: secret ? "redacted" : activeName ? "configured" : "not-configured",
  };
}

function runtimeConfigStatus() {
  return {
    owner: "runtime-server",
    status: "ready",
    source: "white-label-config-boundary-foundation",
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    optionalIntegrationsNonBlocking: true,
    tenantSafeNamingPreferred: true,
    runtime: {
      host: envStatus({ primary: "CONTROLSTACK_RUNTIME_HOST", valueKind: "network-binding" }),
      port: envStatus({ primary: "CONTROLSTACK_RUNTIME_PORT", valueKind: "network-binding" }),
    },
    runtimeConfigBridge: {
      endpoint: "/runtime-config.js",
      browserVisible: true,
      nonSecretOnly: true,
      exposesHeaders: false,
      exposesTokens: false,
      nvbAuthority: {
        endpoint: envStatus({ primary: "CONTROLSTACK_NVB_AUTHORITY_ENDPOINT", valueKind: "same-origin-or-admin-configured-url" }),
        enabled: envStatus({ primary: "CONTROLSTACK_NVB_AUTHORITY_ENABLED", valueKind: "boolean" }),
        method: envStatus({ primary: "CONTROLSTACK_NVB_AUTHORITY_METHOD", valueKind: "http-method" }),
        timeoutMs: envStatus({ primary: "CONTROLSTACK_NVB_AUTHORITY_TIMEOUT_MS", valueKind: "number" }),
        ttlMs: envStatus({ primary: "CONTROLSTACK_NVB_AUTHORITY_TTL_MS", valueKind: "number" }),
        credentials: envStatus({ primary: "CONTROLSTACK_NVB_AUTHORITY_CREDENTIALS", valueKind: "fetch-credentials" }),
        emailQueryParam: envStatus({ primary: "CONTROLSTACK_NVB_AUTHORITY_EMAIL_QUERY_PARAM", valueKind: "query-param-name" }),
      },
    },
    authorityReference: {
      snapshotPath: envStatus({
        primary: "CONTROLSTACK_AUTHORITY_REFERENCE_SNAPSHOT_PATH",
        aliases: ["NOVONDB_PATH", "CONTROLSTACK_DB_PATH", "CENTRAL_DB_PATH"],
        valueKind: "server-file-path",
      }),
      syncEnabled: envStatus({ primary: "CONTROLSTACK_AUTHORITY_REFERENCE_SYNC_ENABLED", valueKind: "boolean" }),
      syncExecutionEnabled: envStatus({ primary: "CONTROLSTACK_AUTHORITY_REFERENCE_SYNC_EXECUTION_ENABLED", valueKind: "boolean" }),
      restoreEnabled: envStatus({ primary: "CONTROLSTACK_AUTHORITY_REFERENCE_RESTORE_ENABLED", valueKind: "boolean" }),
      sourceType: envStatus({ primary: "CONTROLSTACK_AUTHORITY_REFERENCE_SOURCE_TYPE", valueKind: "provider-kind" }),
      googleSheetId: envStatus({ primary: "CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID", secret: true, valueKind: "external-provider-id" }),
      materialisedSourcePath: envStatus({
        primary: "CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISED_SOURCE_PATH",
        aliases: ["CONTROLSTACK_AUTHORITY_REFERENCE_SOURCE_JSON_PATH"],
        valueKind: "server-file-path",
      }),
      archiveDir: envStatus({ primary: "CONTROLSTACK_AUTHORITY_REFERENCE_ARCHIVE_DIR", valueKind: "server-directory-path" }),
      runtimeDataHome: "redacted",
      defaultSnapshotPath: "redacted",
      defaultMaterialisedSourcePath: "redacted",
      defaultArchiveDir: "redacted",
      legacyTransitionalPath: "redacted",
      pathRedacted: true,
      rootRedacted: true,
      localPathExposureEnabled: false,
      transitionalAliasesRetained: ["NOVONDB_PATH", "CONTROLSTACK_DB_PATH", "CENTRAL_DB_PATH"],
    },
    hubspot: {
      authMode: envStatus({ primary: "CONTROLSTACK_HUBSPOT_AUTH_MODE", valueKind: "auth-mode" }),
      staticTokenEnabled: envStatus({ primary: "CONTROLSTACK_HUBSPOT_STATIC_TOKEN_ENABLED", valueKind: "boolean" }),
      oauthToken: envStatus({
        primary: "HUBSPOT_OAUTH_ACCESS_TOKEN",
        aliases: ["HUBSPOT_ACCESS_TOKEN"],
        secret: true,
        valueKind: "oauth-derived-server-bearer-token",
      }),
      staticToken: envStatus({
        primary: "HUBSPOT_STATIC_TOKEN",
        aliases: ["HUBSPOT_PRIVATE_APP_TOKEN", "HUBSPOT_TOKEN"],
        secret: true,
        valueKind: "optional-static-private-token",
      }),
      primaryAuthMode: "oauth-server-bearer",
      optionalStaticTokenModeDefault: "disabled",
    },
  };
}

function authorityReferenceArchiveDir() {
  return readTextEnv("CONTROLSTACK_AUTHORITY_REFERENCE_ARCHIVE_DIR") || AUTH_REF_DEFAULT_ARCHIVE_DIR;
}

function authorityReferenceMaterialisedSourcePath() {
  return readTextEnv("CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISED_SOURCE_PATH")
    || readTextEnv("CONTROLSTACK_AUTHORITY_REFERENCE_SOURCE_JSON_PATH")
    || AUTH_REF_DEFAULT_MATERIALISED_SOURCE_PATH;
}

function archiveStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function archiveDestinationPath(snapshotPath, archiveDir) {
  const safeName = snapshotPath.split(/[\\/]/).pop() || "authority-reference-snapshot.json";
  return resolve(archiveDir, `${archiveStamp()}-${safeName}`);
}

function authorityReferenceRestoreConfig() {
  const enabled = readBooleanEnv("CONTROLSTACK_AUTHORITY_REFERENCE_RESTORE_ENABLED", false);
  return {
    owner: "runtime-server",
    enabled,
    envGate: "CONTROLSTACK_AUTHORITY_REFERENCE_RESTORE_ENABLED",
    requiredValue: "true",
    confirmationText: AUTH_REF_RESTORE_CONFIRMATION_TEXT,
    reason: enabled ? "Archive restore is explicitly enabled for admin action." : "Archive restore live writes are disabled by default.",
  };
}

function authorityReferenceSyncConfig() {
  const enabled = readBooleanEnv("CONTROLSTACK_AUTHORITY_REFERENCE_SYNC_ENABLED", false);
  const executionEnabled = readBooleanEnv("CONTROLSTACK_AUTHORITY_REFERENCE_SYNC_EXECUTION_ENABLED", false);
  const sourceType = readTextEnv("CONTROLSTACK_AUTHORITY_REFERENCE_SOURCE_TYPE") || "google-sheet";
  const sheetConfigured = Boolean(readTextEnv("CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID"));
  const materialisedSourcePath = authorityReferenceMaterialisedSourcePath();
  const sourceConfigured = sheetConfigured || Boolean(materialisedSourcePath);
  return {
    owner: "runtime-server",
    sourceType,
    enabled,
    configured: enabled && sourceConfigured,
    sourceConfigured,
    googleSheetConfigured: sheetConfigured,
    materialisedSourceConfigured: Boolean(materialisedSourcePath),
    materialisedSourcePath: materialisedSourcePath || null,
    executionEnabled,
    executionLive: enabled && executionEnabled && Boolean(materialisedSourcePath),
    dryRunSupported: true,
    normalBootDependency: false,
    reason: enabled
      ? sourceConfigured
        ? executionEnabled
          ? "Authority/reference sync execution is explicitly enabled for admin action."
          : "Authority/reference sync source is configured. Dry-run is available; live execution is gated off."
        : "Authority/reference sync is enabled but source config is incomplete."
      : "Authority/reference sync execution is disabled by default and not part of normal boot.",
  };
}

async function fileStatus(pathValue) {
  if (!pathValue) {
    return { path: null, present: false, readable: false, sizeBytes: null, modifiedAt: null, reason: "not_configured" };
  }
  try {
    const info = await stat(pathValue);
    return {
      path: pathValue,
      present: info.isFile(),
      readable: info.isFile(),
      sizeBytes: info.size,
      modifiedAt: info.mtime?.toISOString?.() || null,
    };
  } catch (error) {
    return {
      path: pathValue,
      present: false,
      readable: false,
      sizeBytes: null,
      modifiedAt: null,
      reason: error?.code || "unavailable",
    };
  }
}

async function authorityReferenceSnapshotStatus() {
  const snapshotPath = readAuthorityReferenceSnapshotPath();
  try {
    const info = await stat(snapshotPath);
    return {
      path: snapshotPath,
      present: info.isFile(),
      readable: info.isFile(),
      sizeBytes: info.size,
      modifiedAt: info.mtime?.toISOString?.() || null,
      source: "external-authority-reference-snapshot",
      transitionalPath: snapshotPath === AUTH_REF_LEGACY_TRANSITIONAL_PATH,
    };
  } catch (error) {
    return {
      path: snapshotPath,
      present: false,
      readable: false,
      sizeBytes: null,
      modifiedAt: null,
      source: "external-authority-reference-snapshot",
      transitionalPath: snapshotPath === AUTH_REF_LEGACY_TRANSITIONAL_PATH,
      reason: error?.code || "unavailable",
    };
  }
}

async function authorityReferenceArchiveStatus() {
  const archiveDir = authorityReferenceArchiveDir();
  if (!archiveDir) {
    return {
      configured: false,
      available: false,
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: false,
      reason: "Archive directory is not configured. Sync execution remains deferred.",
    };
  }
  try {
    const info = await stat(archiveDir);
    return {
      configured: true,
      available: info.isDirectory(),
      path: archiveDir,
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: false,
      reason: info.isDirectory()
        ? "Archive directory exists. Archive-before-write execution is still deferred in this slice."
        : "Configured archive path is not a directory. Sync execution remains deferred.",
    };
  } catch (error) {
    return {
      configured: true,
      available: false,
      path: archiveDir,
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: false,
      reason: error?.code || "Archive directory is unavailable. Sync execution remains deferred.",
    };
  }
}

async function authorityReferenceAdminStatus() {
  const snapshot = await authorityReferenceSnapshotStatus();
  const archive = await authorityReferenceArchiveStatus();
  const sync = authorityReferenceSyncConfig();
  return {
    owner: "runtime-server",
    status: "status-only-foundation",
    source: "authority-reference-admin-status",
    optional: true,
    nonBootCritical: true,
    adminOnly: true,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    normalWorkflowConcern: false,
    snapshot,
    sync,
    archive,
    writePolicy: {
      enabled: sync.executionLive,
      adminOnly: true,
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: false,
      reason: sync.executionLive
        ? "Live sync execution is available only through explicit admin POST and still enforces archive-before-write."
        : "Live sync/materialisation writes are gated off or not fully configured. Dry-run remains available.",
    },
  };
}

function authorityReferenceTableCount(snapshot, names = []) {
  for (const name of names) {
    const table = snapshot?.[name];
    if (Array.isArray(table)) return table.length;
  }
  return 0;
}

function authorityReferenceSourceValidationSummary(text, parsed) {
  const topLevelKeys = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? Object.keys(parsed).slice(0, 25) : [];
  return {
    ok: true,
    byteLength: Buffer.byteLength(text),
    format: "json",
    topLevelKeys,
    tables: {
      users: {
        present: Array.isArray(parsed?.USERS) || Array.isArray(parsed?.users),
        count: authorityReferenceTableCount(parsed, ["USERS", "users"]),
      },
      contacts: {
        present: Array.isArray(parsed?.CONTACTS) || Array.isArray(parsed?.contacts),
        count: authorityReferenceTableCount(parsed, ["CONTACTS", "contacts"]),
      },
      companies: {
        present: Array.isArray(parsed?.COMPANIES) || Array.isArray(parsed?.companies),
        count: authorityReferenceTableCount(parsed, ["COMPANIES", "companies"]),
      },
    },
    browserSecretsExposed: false,
    nonSecretOnly: true,
  };
}

async function validateAuthorityReferenceSource(sourcePath) {
  const text = await readFile(sourcePath, "utf-8");
  const parsed = JSON.parse(text);
  const summary = authorityReferenceSourceValidationSummary(text, parsed);
  return {
    byteLength: summary.byteLength,
    hasUsersTable: summary.tables.users.present,
    tableCounts: summary.tables,
    topLevelKeys: summary.topLevelKeys,
  };
}

async function inspectAuthorityReferenceSource(sourcePath) {
  if (!sourcePath) {
    return {
      ok: false,
      configured: false,
      readable: false,
      reason: "No materialised authority/reference source path is configured.",
      browserSecretsExposed: false,
      nonSecretOnly: true,
    };
  }
  try {
    const text = await readFile(sourcePath, "utf-8");
    const parsed = JSON.parse(text);
    return {
      configured: true,
      readable: true,
      path: sourcePath,
      ...authorityReferenceSourceValidationSummary(text, parsed),
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      readable: false,
      path: sourcePath,
      reason: error?.message || "authority_reference_source_inspection_failed",
      browserSecretsExposed: false,
      nonSecretOnly: true,
    };
  }
}

async function authorityReferenceSourceMaterialisationStatus() {
  const adminStatus = await authorityReferenceAdminStatus();
  const sync = adminStatus.sync;
  const sourceFile = await fileStatus(sync.materialisedSourcePath);
  const sourceInspection = await inspectAuthorityReferenceSource(sync.materialisedSourcePath);
  const plannedArchivePath = adminStatus.archive.path && adminStatus.snapshot.path
    ? archiveDestinationPath(adminStatus.snapshot.path, adminStatus.archive.path)
    : null;
  const materialisationReady = sync.enabled === true && sourceFile.readable === true && sourceInspection.ok === true;
  const liveWriteReady = materialisationReady && sync.executionEnabled === true && adminStatus.archive.available === true;
  return {
    owner: "runtime-server",
    status: materialisationReady ? "source-materialisation-ready" : "source-materialisation-blocked",
    source: "authority-reference-source-materialisation-foundation",
    adminOnly: true,
    optional: true,
    nonBootCritical: true,
    normalWorkflowConcern: false,
    normalBootDependency: false,
    browserSecretsExposed: false,
    nonSecretOnly: true,
    sourceProfile: {
      sourceType: sync.sourceType,
      syncEnabled: sync.enabled === true,
      sourceConfigured: sync.sourceConfigured === true,
      googleSheetConfigured: sync.googleSheetConfigured === true,
      materialisedSourceConfigured: sync.materialisedSourceConfigured === true,
      materialisedSourcePath: sync.materialisedSourcePath,
    },
    sourceFile,
    sourceInspection,
    targetSnapshot: adminStatus.snapshot,
    archive: {
      ...adminStatus.archive,
      plannedArchivePath,
      archiveBeforeWriteRequired: true,
    },
    materialisation: {
      ready: materialisationReady,
      liveWriteReady,
      dryRunSupported: true,
      liveWritePath: sync.executionEnabled === true ? "explicit-admin-sync-post-only" : "disabled",
      steps: [
        "Inspect configured materialised authority/reference source.",
        "Validate source JSON and required authority tables before materialisation.",
        "Report target snapshot and archive readiness without mutating files.",
        "Require explicit admin sync POST for any later live materialisation.",
        "Archive current snapshot before live materialisation when applicable.",
      ],
    },
    writePolicy: {
      enabled: false,
      liveProviderWritesEnabled: false,
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: false,
      reason: "Source/materialisation foundation is status/preflight only. Live materialisation remains behind the existing explicit admin sync POST pathway.",
    },
    blockers: [
      ...(sync.enabled === true ? [] : [{ code: "sync-disabled", severity: "blocking", reason: "Authority/reference sync is disabled." }]),
      ...(sync.materialisedSourceConfigured === true ? [] : [{ code: "materialised-source-missing", severity: "blocking", reason: "Materialised source path is not configured." }]),
      ...(sourceFile.readable === true ? [] : [{ code: "source-unreadable", severity: "blocking", reason: "Materialised source is not readable." }]),
      ...(sourceInspection.ok === true ? [] : [{ code: "source-validation-failed", severity: "blocking", reason: sourceInspection.reason || "Source inspection did not pass." }]),
      { code: "write-policy-disabled", severity: "intentional-block", reason: "No file mutation is performed by this status endpoint." },
    ],
  };
}

async function sendAuthorityReferenceSourceMaterialisation(res) {
  sendPublicStatusJson(res, 200, await authorityReferenceSourceMaterialisationStatus());
}

async function authorityReferenceGoogleSyncEnvironment({ apply = false } = {}) {
  const environment = await buildSyncEnvironment({ args: { apply }, env: process.env });
  return environment.env;
}

async function sendAuthorityReferenceMaterialiserStatus(res) {
  const materialiserEnv = await authorityReferenceGoogleSyncEnvironment({ apply: false });
  sendPublicStatusJson(res, 200, await buildAuthorityReferenceMaterialiserStatus({ env: materialiserEnv }));
}

async function sendAuthorityReferenceMaterialiserRefresh(res, req, requestUrl) {
  const dryRunParam = String(requestUrl.searchParams.get("dryRun") || "true").toLowerCase();
  const dryRun = !["0", "false", "no", "live"].includes(dryRunParam);
  const liveRequested = !dryRun;
  try {
    const body = await requestJson(req);
    const materialiserEnv = await authorityReferenceGoogleSyncEnvironment({ apply: liveRequested });
    const result = await refreshAuthorityReferenceMaterialiser({
      env: materialiserEnv,
      dryRun,
      body: liveRequested ? { confirmation: AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION } : body,
      allowMaterialisedWrite: liveRequested,
    });

    let promotion = null;
    if (liveRequested && result.ok === true && body.promoteActiveSnapshot === true) {
      promotion = await promoteMaterialisedAuthorityReference({ dryRun: false });
    }

    const combinedOk = result.ok === true && (!promotion || promotion.ok === true);
    const httpStatus = dryRun ? 200 : combinedOk ? 200 : 409;
    const { httpStatus: _httpStatus, ...payload } = result;
    sendJson(res, httpStatus, {
      ...payload,
      ok: combinedOk,
      mode: liveRequested && body.promoteActiveSnapshot === true
        ? "google-sheet-to-active-snapshot"
        : liveRequested
          ? "google-sheet-to-materialised"
          : "dry-run-google-sheet-preview",
      promotion,
      activeSnapshotWriteAttempted: promotion ? true : payload.activeSnapshotWriteAttempted,
      activeSnapshotWriteEnabled: promotion?.writePolicy?.activeSnapshotWriteEnabled ?? payload.activeSnapshotWriteEnabled,
    });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      endpoint: AUTH_REF_MATERIALISER_REFRESH_PATH,
      owner: "runtime-server",
      status: "materialiser-refresh-request-rejected",
      dryRun,
      adminOnly: true,
      nonBootCritical: true,
      browserSecretsExposed: false,
      repoLocalSecrets: false,
      rawGoogleResponseExposed: false,
      rawSheetRowsExposed: false,
      rawRowsExposed: false,
      fullMaterialisedJsonExposed: false,
      activeSnapshotWriteAttempted: false,
      materialisedWriteAttempted: false,
      reason: error?.message === "invalid_json_body" ? "invalid_json_body" : "materialiser_refresh_request_failed",
      writePolicy: { materialisedWriteEnabled: false, activeSnapshotWriteEnabled: false },
    });
  }
}

async function authorityReferenceSyncExecution({ dryRun = true } = {}) {
  const status = await authorityReferenceAdminStatus();
  const sync = status.sync;
  const target = status.snapshot;
  const source = await fileStatus(sync.materialisedSourcePath);
  const archive = status.archive;
  const plannedArchivePath = archive.path && target.path ? archiveDestinationPath(target.path, archive.path) : null;
  const preflight = {
    syncEnabled: sync.enabled === true,
    executionEnabled: sync.executionEnabled === true,
    sourceReadable: source.readable === true,
    archiveAvailable: archive.available === true,
    targetPath: target.path,
    sourcePath: source.path,
    plannedArchivePath,
  };
  const steps = [
    "Read external materialised authority/reference source status.",
    "Validate source JSON before write.",
    "Archive current snapshot before any live write when a current snapshot exists.",
    "Copy materialised source to runtime authority/reference snapshot path only for explicit live admin execution.",
  ];
  const executable = preflight.syncEnabled && preflight.executionEnabled && preflight.sourceReadable && preflight.archiveAvailable;

  if (dryRun) {
    let sourceValidation = null;
    if (source.readable) {
      try {
        sourceValidation = await validateAuthorityReferenceSource(source.path);
      } catch (error) {
        sourceValidation = { ok: false, reason: error?.message || "source_validation_failed" };
      }
    }
    return {
      owner: "runtime-server",
      status: executable ? "dry-run-ready" : "dry-run-blocked",
      dryRun: true,
      adminOnly: true,
      nonBootCritical: true,
      browserSecretsExposed: false,
      repoLocalSecrets: false,
      executionLive: false,
      executable,
      preflight,
      source,
      target,
      archive,
      sourceValidation,
      steps,
      writePolicy: {
        enabled: false,
        archiveBeforeWriteRequired: true,
        archiveBeforeWriteLive: false,
        reason: "Dry-run only. No archive or snapshot write was attempted.",
      },
    };
  }

  if (!executable) {
    return {
      owner: "runtime-server",
      status: "live-write-blocked",
      dryRun: false,
      adminOnly: true,
      nonBootCritical: true,
      browserSecretsExposed: false,
      repoLocalSecrets: false,
      executionLive: false,
      executable: false,
      preflight,
      source,
      target,
      archive,
      steps,
      writePolicy: {
        enabled: false,
        archiveBeforeWriteRequired: true,
        archiveBeforeWriteLive: false,
        reason: "Live write blocked. Require sync enabled, execution enabled, readable source, and available archive directory.",
      },
    };
  }

  const sourceValidation = await validateAuthorityReferenceSource(source.path);
  await mkdir(archive.path, { recursive: true });
  let archivedTo = null;
  if (target.present && target.readable) {
    archivedTo = plannedArchivePath;
    await copyFile(target.path, archivedTo);
  }
  await copyFile(source.path, target.path);
  const nextTarget = await authorityReferenceSnapshotStatus();
  return {
    owner: "runtime-server",
    status: "live-write-completed",
    dryRun: false,
    adminOnly: true,
    nonBootCritical: true,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    executionLive: true,
    executable: true,
    preflight,
    source,
    target: nextTarget,
    archive: { ...archive, archivedTo, archiveBeforeWriteLive: true },
    sourceValidation,
    steps,
    writePolicy: {
      enabled: true,
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: true,
      reason: "Live admin sync completed after archive-before-write enforcement.",
    },
  };
}

async function sendAuthorityReferenceStatus(res) {
  sendPublicStatusJson(res, 200, await authorityReferenceAdminStatus());
}

async function sendSelectorReferenceStatus(res) {
  sendPublicStatusJson(res, 200, await buildSelectorReferenceStatus({
    sourcePath: AUTH_REF_DEFAULT_SNAPSHOT_PATH,
  }));
}

const SELECTOR_OPTION_CONSTRAINT_KEYS = Object.freeze([
  "system",
  "application",
  "interiorExterior",
  "cct",
  "optic",
  "controlType",
  "driver",
  "ipRating",
  "ikRating",
  "mountStyle",
  "bodyFinish",
  "emergency",
  "sensor",
  "specialParts",
  "tier",
  "variantKey",
  "emission",
  "directCapability",
  "indirectCapability",
  "opticSub",
  "opticIndirect",
  "diffuserVar1",
  "diffuserVar2",
  "directOpticVar1",
  "directOpticVar2",
  "indirectOpticVar1",
  "indirectOpticVar2",
  "electricalClass",
  "ambient",
  "targetLmPerM",
  "cctCri",
  "indirectMatchDirect",
  "targetLmPerMIndirect",
  "cctCriIndirect",
  "controlTypeIndirect",
  "mountSelection",
  "mountParticulars",
  "powerPenetration",
  "powerLocation",
  "flexLength",
  "wiringType",
  "finishCover",
  "finishEnd",
  "finishFlex",
  "egressLight",
  "egressSound",
  "accessories",
  "specialPartsEntitlement",
  "specialPartsOptIn",
  "userEntitlementStatus",
]);

export function readSelectorOptionConstraints(requestUrl) {
  const constraints = {};
  for (const key of SELECTOR_OPTION_CONSTRAINT_KEYS) {
    const value = String(requestUrl.searchParams.get(key) || "").trim();
    if (value) constraints[key] = value;
  }

  const encoded = String(requestUrl.searchParams.get("constraints") || "").trim();
  if (encoded) {
    try {
      const parsed = JSON.parse(encoded);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const key of SELECTOR_OPTION_CONSTRAINT_KEYS) {
          const value = String(parsed[key] || "").trim();
          if (value) constraints[key] = value;
        }
      }
    } catch {
      constraints.constraintsParseWarning = "ignored";
    }
  }
  delete constraints.constraintsParseWarning;
  return constraints;
}

export function readSelectorTimelineOptions(requestUrl) {
  const timelineVisibilityMode = String(requestUrl.searchParams.get("timelineVisibilityMode") || "").trim();
  const timelineAsOfDate = String(requestUrl.searchParams.get("timelineAsOfDate") || "").trim();
  const repeatedStatuses = requestUrl.searchParams.getAll("timelineVisibleStatus").map((value) => String(value || "").trim()).filter(Boolean);
  const csvStatuses = String(requestUrl.searchParams.get("timelineVisibleStatuses") || "").split(/[;,|]/).map((value) => value.trim()).filter(Boolean);
  return {
    timelineVisibilityMode,
    timelineAsOfDate,
    timelineVisibleStatuses: [...repeatedStatuses, ...csvStatuses],
  };
}

export function readSelectorSpecialPartsUserTestOptions(requestUrl) {
  const specialPartsTestPrincipal = String(requestUrl.searchParams.get("specialPartsTestPrincipal") || "").trim();
  const showSpecialParts = String(requestUrl.searchParams.get("showSpecialParts") || requestUrl.searchParams.get("specialPartsTestShow") || "").trim();
  return {
    specialPartsTestPrincipal,
    showSpecialParts,
  };
}

async function sendSelectorReferenceOptions(res, requestUrl) {
  sendJson(res, 200, await buildSelectorReferenceOptions({
    sourcePath: AUTH_REF_DEFAULT_SNAPSHOT_PATH,
    constraints: readSelectorOptionConstraints(requestUrl),
    ...readSelectorTimelineOptions(requestUrl),
    ...readSelectorSpecialPartsUserTestOptions(requestUrl),
  }));
}

async function sendBoardDataStatus(res) {
  sendPublicStatusJson(res, 200, await buildBoardDataStatus({
    sourcePath: AUTH_REF_DEFAULT_SNAPSHOT_PATH,
  }));
}

async function sendIesBuilderStatus(res) {
  sendPublicStatusJson(res, 200, buildIesBuilderStatus());
}

async function sendLabProofStatus(res) {
  sendPublicStatusJson(res, 200, await buildLabProofStatus({
    sourcePath: AUTH_REF_DEFAULT_SNAPSHOT_PATH,
  }));
}

async function sendAuthorityReferenceSync(res, requestUrl) {
  const dryRunParam = String(requestUrl.searchParams.get("dryRun") || "true").toLowerCase();
  const dryRun = !["0", "false", "no", "live"].includes(dryRunParam);
  try {
    const result = await authorityReferenceSyncExecution({ dryRun });
    sendJson(res, dryRun || result.executable ? 200 : 409, result);
  } catch (error) {
    sendJson(res, 500, {
      owner: "runtime-server",
      status: "sync-execution-failed",
      dryRun,
      adminOnly: true,
      nonBootCritical: true,
      browserSecretsExposed: false,
      repoLocalSecrets: false,
      reason: error?.message || "Authority/reference sync execution failed.",
      writePolicy: { enabled: false, archiveBeforeWriteRequired: true, archiveBeforeWriteLive: false },
    });
  }
}

function requestJson(req, { maxBytes = 32768 } = {}) {
  return new Promise((resolveRequestJson, rejectRequestJson) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        rejectRequestJson(new Error("request_body_too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf-8").trim();
      if (!text) {
        resolveRequestJson({});
        return;
      }
      try {
        const parsed = JSON.parse(text);
        resolveRequestJson(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {});
      } catch (error) {
        rejectRequestJson(new Error("invalid_json_body"));
      }
    });
    req.on("error", rejectRequestJson);
  });
}

function validateArchiveName(rawName) {
  const name = String(rawName || "").trim();
  if (!name) return { ok: false, reason: "archiveName is required." };
  if (name.length > 255) return { ok: false, reason: "archiveName is too long." };
  if (isAbsolute(name)) return { ok: false, reason: "archiveName must be a basename, not an absolute path." };
  if (name !== basename(name) || name.includes("/") || name.includes("\\")) {
    return { ok: false, reason: "archiveName must be a basename only." };
  }
  if (name === "." || name === ".." || name.includes("..")) {
    return { ok: false, reason: "archiveName may not contain path traversal." };
  }
  if (!name.toLowerCase().endsWith(".json")) {
    return { ok: false, reason: "archiveName must reference a JSON archive file." };
  }
  return { ok: true, name };
}

function archivePathForBasename(rawName) {
  const validation = validateArchiveName(rawName);
  if (!validation.ok) return validation;
  const root = resolve(authorityReferenceArchiveDir());
  const filePath = resolve(root, validation.name);
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (filePath === root || !filePath.startsWith(rootPrefix)) {
    return { ok: false, reason: "archiveName resolved outside the archive directory." };
  }
  return { ok: true, name: validation.name, filePath };
}

async function archivePublicMetadata(name) {
  const resolved = archivePathForBasename(name);
  if (!resolved.ok) return null;
  const info = await stat(resolved.filePath);
  if (!info.isFile()) return null;
  return {
    name: resolved.name,
    sizeBytes: info.size,
    modifiedAt: info.mtime?.toISOString?.() || null,
  };
}

async function sendAuthorityReferenceArchives(res) {
  const archiveDir = authorityReferenceArchiveDir();
  try {
    const dirInfo = await stat(archiveDir);
    if (!dirInfo.isDirectory()) {
      sendJson(res, 200, {
        ok: true,
        owner: "runtime-server",
        status: "archive-directory-unavailable",
        adminOnly: true,
        basenameMetadataOnly: true,
        absolutePathsExposed: false,
        rawFileContentExposed: false,
        archives: [],
        count: 0,
        reason: "Configured archive location is not a directory.",
      });
      return;
    }

    const entries = await readdir(archiveDir, { withFileTypes: true });
    const archives = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const validation = validateArchiveName(entry.name);
      if (!validation.ok) continue;
      try {
        const metadata = await archivePublicMetadata(validation.name);
        if (metadata) archives.push(metadata);
      } catch {
        // Skip unreadable archive entries rather than exposing filesystem details.
      }
    }

    archives.sort((a, b) => String(b.modifiedAt || "").localeCompare(String(a.modifiedAt || "")) || a.name.localeCompare(b.name));
    sendJson(res, 200, {
      ok: true,
      owner: "runtime-server",
      status: "archive-list-ready",
      adminOnly: true,
      basenameMetadataOnly: true,
      absolutePathsExposed: false,
      rawFileContentExposed: false,
      archives,
      count: archives.length,
    });
  } catch (error) {
    sendJson(res, 200, {
      ok: true,
      owner: "runtime-server",
      status: "archive-directory-unavailable",
      adminOnly: true,
      basenameMetadataOnly: true,
      absolutePathsExposed: false,
      rawFileContentExposed: false,
      archives: [],
      count: 0,
      reason: error?.code || "archive_directory_unavailable",
    });
  }
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = stableValue(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function compareToken(value) {
  try {
    return JSON.stringify(stableValue(value));
  } catch {
    return String(value);
  }
}

function isSensitiveField(field) {
  return /(token|secret|password|api[_-]?key|bearer|private|credential|auth)/i.test(String(field || ""));
}

function safeDiffValue(value, field) {
  if (isSensitiveField(field)) return "[redacted]";
  if (value === undefined) return "[missing]";
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") {
    return value.length > 300 ? `${value.slice(0, 300)}… (${value.length} chars)` : value;
  }
  if (Array.isArray(value)) {
    return { type: "array", length: value.length, fullValueReturned: false };
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    return { type: "object", keyCount: keys.length, keys: keys.slice(0, 12), fullValueReturned: false };
  }
  return String(value);
}

const TABLE_KEY_FIELDS = Object.freeze([
  "id",
  "ID",
  "recordId",
  "record_id",
  "uuid",
  "key",
  "code",
  "CODE",
  "slug",
  "name",
  "Name",
  "email_login",
  "email",
  "email_address",
  "company_id",
  "companyId",
  "system_component_id",
  "sku",
  "part_number",
]);

function baseInspectKeyForRow(row, index) {
  if (row && typeof row === "object" && !Array.isArray(row)) {
    for (const field of TABLE_KEY_FIELDS) {
      const value = row[field];
      if (value !== null && value !== undefined && String(value).trim()) return `${field}:${String(value).trim()}`;
    }
  }
  return `__index:${index}`;
}

function indexTableRows(rows = []) {
  const seen = new Map();
  const map = new Map();
  rows.forEach((row, index) => {
    const baseKey = baseInspectKeyForRow(row, index);
    const count = (seen.get(baseKey) || 0) + 1;
    seen.set(baseKey, count);
    const inspectKey = count === 1 ? baseKey : `${baseKey}#${count}`;
    map.set(inspectKey, row);
  });
  return map;
}

function changedFieldNames(oldRow = {}, newRow = {}) {
  if (!oldRow || !newRow || typeof oldRow !== "object" || typeof newRow !== "object" || Array.isArray(oldRow) || Array.isArray(newRow)) {
    return compareToken(oldRow) === compareToken(newRow) ? [] : ["value"];
  }
  const fields = new Set([...Object.keys(oldRow), ...Object.keys(newRow)]);
  return [...fields].filter((field) => compareToken(oldRow[field]) !== compareToken(newRow[field])).sort();
}

function limitedChangeKeys(entries, limit) {
  return {
    total: entries.length,
    truncated: entries.length > limit,
    entries: entries.slice(0, limit),
  };
}

function sectionLimit(section) {
  return String(section).toUpperCase() === "USERS" ? 20 : 50;
}

function diffTableSection(section, archiveRows, currentRows) {
  const archiveMap = indexTableRows(Array.isArray(archiveRows) ? archiveRows : []);
  const currentMap = indexTableRows(Array.isArray(currentRows) ? currentRows : []);
  const allKeys = [...new Set([...archiveMap.keys(), ...currentMap.keys()])].sort();
  const added = [];
  const removed = [];
  const changed = [];
  let unchanged = 0;
  for (const inspectKey of allKeys) {
    const oldRow = archiveMap.get(inspectKey);
    const newRow = currentMap.get(inspectKey);
    if (oldRow === undefined) {
      added.push({ inspectKey, displayKey: inspectKey, changeType: "added" });
      continue;
    }
    if (newRow === undefined) {
      removed.push({ inspectKey, displayKey: inspectKey, changeType: "removed" });
      continue;
    }
    const fields = changedFieldNames(oldRow, newRow);
    if (fields.length) {
      changed.push({
        inspectKey,
        displayKey: inspectKey,
        changeType: "changed",
        changedFieldCount: fields.length,
        changedFields: fields.slice(0, 16),
        changedFieldsTruncated: fields.length > 16,
      });
    } else {
      unchanged += 1;
    }
  }
  const limit = sectionLimit(section);
  return {
    section,
    type: "table",
    counts: {
      archiveRows: archiveMap.size,
      currentRows: currentMap.size,
      added: added.length,
      removed: removed.length,
      changed: changed.length,
      unchanged,
    },
    addedKeys: limitedChangeKeys(added, limit),
    removedKeys: limitedChangeKeys(removed, limit),
    changedKeys: limitedChangeKeys(changed, limit),
    fullRowsReturned: false,
  };
}

function diffObjectSection(section, archiveObject = {}, currentObject = {}) {
  const oldObject = archiveObject && typeof archiveObject === "object" && !Array.isArray(archiveObject) ? archiveObject : {};
  const newObject = currentObject && typeof currentObject === "object" && !Array.isArray(currentObject) ? currentObject : {};
  const keys = [...new Set([...Object.keys(oldObject), ...Object.keys(newObject)])].sort();
  const added = [];
  const removed = [];
  const changed = [];
  let unchanged = 0;
  for (const key of keys) {
    if (!(key in oldObject)) added.push({ inspectKey: key, displayKey: key, changeType: "added" });
    else if (!(key in newObject)) removed.push({ inspectKey: key, displayKey: key, changeType: "removed" });
    else if (compareToken(oldObject[key]) !== compareToken(newObject[key])) changed.push({ inspectKey: key, displayKey: key, changeType: "changed", changedFieldCount: 1, changedFields: [key], changedFieldsTruncated: false });
    else unchanged += 1;
  }
  return {
    section,
    type: "object",
    counts: {
      archiveKeys: Object.keys(oldObject).length,
      currentKeys: Object.keys(newObject).length,
      added: added.length,
      removed: removed.length,
      changed: changed.length,
      unchanged,
    },
    addedKeys: limitedChangeKeys(added, 50),
    removedKeys: limitedChangeKeys(removed, 50),
    changedKeys: limitedChangeKeys(changed, 50),
    fullRowsReturned: false,
  };
}

function diffPrimitiveSection(section, archiveValue, currentValue) {
  const changed = compareToken(archiveValue) !== compareToken(currentValue);
  return {
    section,
    type: "value",
    counts: { changed: changed ? 1 : 0, unchanged: changed ? 0 : 1 },
    changedKeys: limitedChangeKeys(changed ? [{ inspectKey: "__section__", displayKey: "section value", changeType: "changed", changedFieldCount: 1, changedFields: ["value"] }] : [], 1),
    addedKeys: limitedChangeKeys([], 1),
    removedKeys: limitedChangeKeys([], 1),
    fullRowsReturned: false,
  };
}

function buildAuthorityReferenceDiffSummary({ archiveName, archiveSnapshot, currentSnapshot, archiveMeta, currentMeta }) {
  const sectionNames = [...new Set([
    ...Object.keys(archiveSnapshot || {}),
    ...Object.keys(currentSnapshot || {}),
  ])].sort();
  const sections = sectionNames.map((section) => {
    const oldValue = archiveSnapshot?.[section];
    const newValue = currentSnapshot?.[section];
    if (Array.isArray(oldValue) || Array.isArray(newValue)) {
      return diffTableSection(section, oldValue, newValue);
    }
    if ((oldValue && typeof oldValue === "object") || (newValue && typeof newValue === "object")) {
      return diffObjectSection(section, oldValue, newValue);
    }
    return diffPrimitiveSection(section, oldValue, newValue);
  });
  const totals = sections.reduce((acc, section) => {
    acc.added += section.counts?.added || 0;
    acc.removed += section.counts?.removed || 0;
    acc.changed += section.counts?.changed || 0;
    return acc;
  }, { added: 0, removed: 0, changed: 0 });
  return {
    ok: true,
    owner: "runtime-server",
    status: "diff-summary-ready",
    adminOnly: true,
    readOnly: true,
    archiveName,
    comparedAt: new Date().toISOString(),
    archive: archiveMeta,
    currentSnapshot: currentMeta,
    totals,
    sections,
    fullDatabaseReturned: false,
    fullUsersReturned: false,
    absolutePathsExposed: false,
  };
}

async function readJsonSnapshot(pathValue) {
  const text = await readFile(pathValue, "utf-8");
  return JSON.parse(text);
}

async function sendAuthorityReferenceDiff(res, req) {
  try {
    const body = await requestJson(req);
    const archiveResolution = archivePathForBasename(body.archiveName);
    if (!archiveResolution.ok) {
      sendJson(res, 400, { ok: false, status: "archive-name-rejected", reason: archiveResolution.reason });
      return;
    }
    const currentPath = readAuthorityReferenceSnapshotPath();
    const [archiveSnapshot, currentSnapshot, archiveMeta, currentInfo] = await Promise.all([
      readJsonSnapshot(archiveResolution.filePath),
      readJsonSnapshot(currentPath),
      archivePublicMetadata(archiveResolution.name),
      stat(currentPath),
    ]);
    const currentMeta = {
      name: "current authority/reference snapshot",
      sizeBytes: currentInfo.size,
      modifiedAt: currentInfo.mtime?.toISOString?.() || null,
    };
    sendJson(res, 200, buildAuthorityReferenceDiffSummary({
      archiveName: archiveResolution.name,
      archiveSnapshot,
      currentSnapshot,
      archiveMeta,
      currentMeta,
    }));
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      owner: "runtime-server",
      status: "diff-summary-failed",
      adminOnly: true,
      readOnly: true,
      reason: error?.message || "authority_reference_diff_failed",
      fullDatabaseReturned: false,
      fullUsersReturned: false,
      absolutePathsExposed: false,
    });
  }
}

function detailForTableSection(section, inspectKey, archiveRows, currentRows) {
  const archiveMap = indexTableRows(Array.isArray(archiveRows) ? archiveRows : []);
  const currentMap = indexTableRows(Array.isArray(currentRows) ? currentRows : []);
  const oldRow = archiveMap.get(inspectKey);
  const newRow = currentMap.get(inspectKey);
  if (oldRow === undefined && newRow === undefined) return { status: "not-found", fields: [] };
  if (oldRow === undefined || newRow === undefined) {
    const row = oldRow === undefined ? newRow : oldRow;
    const fields = row && typeof row === "object" && !Array.isArray(row) ? Object.keys(row).sort() : ["value"];
    return {
      status: oldRow === undefined ? "added" : "removed",
      fields: fields.slice(0, 100).map((field) => ({
        field,
        old: oldRow === undefined ? "[missing]" : "[present]",
        new: newRow === undefined ? "[missing]" : "[present]",
      })),
      truncated: fields.length > 100,
    };
  }
  const fields = changedFieldNames(oldRow, newRow);
  return {
    status: fields.length ? "changed" : "unchanged",
    fields: fields.slice(0, 100).map((field) => ({
      field,
      old: safeDiffValue(oldRow?.[field], field),
      new: safeDiffValue(newRow?.[field], field),
    })),
    truncated: fields.length > 100,
  };
}

function detailForObjectSection(inspectKey, archiveObject, currentObject) {
  const oldObject = archiveObject && typeof archiveObject === "object" && !Array.isArray(archiveObject) ? archiveObject : {};
  const newObject = currentObject && typeof currentObject === "object" && !Array.isArray(currentObject) ? currentObject : {};
  const oldHas = Object.prototype.hasOwnProperty.call(oldObject, inspectKey);
  const newHas = Object.prototype.hasOwnProperty.call(newObject, inspectKey);
  if (!oldHas && !newHas) return { status: "not-found", fields: [] };
  if (!oldHas || !newHas) {
    return {
      status: oldHas ? "removed" : "added",
      fields: [{ field: inspectKey, old: oldHas ? "[present]" : "[missing]", new: newHas ? "[present]" : "[missing]" }],
      truncated: false,
    };
  }
  if (compareToken(oldObject[inspectKey]) === compareToken(newObject[inspectKey])) return { status: "unchanged", fields: [], truncated: false };
  return {
    status: "changed",
    fields: [{ field: inspectKey, old: safeDiffValue(oldObject[inspectKey], inspectKey), new: safeDiffValue(newObject[inspectKey], inspectKey) }],
    truncated: false,
  };
}

async function sendAuthorityReferenceDiffDetail(res, req) {
  try {
    const body = await requestJson(req);
    const archiveResolution = archivePathForBasename(body.archiveName);
    if (!archiveResolution.ok) {
      sendJson(res, 400, { ok: false, status: "archive-name-rejected", reason: archiveResolution.reason });
      return;
    }
    const section = String(body.section || "").trim();
    const inspectKey = String(body.inspectKey || "").trim();
    if (!section || !inspectKey) {
      sendJson(res, 400, { ok: false, status: "diff-detail-rejected", reason: "archiveName, section, and inspectKey are required." });
      return;
    }

    const [archiveSnapshot, currentSnapshot] = await Promise.all([
      readJsonSnapshot(archiveResolution.filePath),
      readJsonSnapshot(readAuthorityReferenceSnapshotPath()),
    ]);
    const oldValue = archiveSnapshot?.[section];
    const newValue = currentSnapshot?.[section];
    let detail;
    if (Array.isArray(oldValue) || Array.isArray(newValue)) detail = detailForTableSection(section, inspectKey, oldValue, newValue);
    else if ((oldValue && typeof oldValue === "object") || (newValue && typeof newValue === "object")) detail = detailForObjectSection(inspectKey, oldValue, newValue);
    else if (inspectKey === "__section__" && compareToken(oldValue) !== compareToken(newValue)) {
      detail = { status: "changed", fields: [{ field: "value", old: safeDiffValue(oldValue, "value"), new: safeDiffValue(newValue, "value") }], truncated: false };
    } else {
      detail = { status: "unchanged", fields: [], truncated: false };
    }

    sendJson(res, 200, {
      ok: true,
      owner: "runtime-server",
      status: "diff-detail-ready",
      adminOnly: true,
      readOnly: true,
      archiveName: archiveResolution.name,
      section,
      inspectKey,
      recordStatus: detail.status,
      fieldCount: detail.fields.length,
      fields: detail.fields,
      truncated: detail.truncated === true,
      comparedAt: new Date().toISOString(),
      fullRowReturned: false,
      fullDatabaseReturned: false,
      fullUsersReturned: false,
      absolutePathsExposed: false,
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      owner: "runtime-server",
      status: "diff-detail-failed",
      adminOnly: true,
      readOnly: true,
      reason: error?.message || "authority_reference_diff_detail_failed",
      fullRowReturned: false,
      fullDatabaseReturned: false,
      fullUsersReturned: false,
      absolutePathsExposed: false,
    });
  }
}

function hasAdminDevModuleAccess(req) {
  return String(req.headers["x-controlstack-admin-dev"] || "") === "admin_dev";
}

function publicMetadataFromStat(name, info, status = "available") {
  return {
    name,
    status,
    present: info?.isFile?.() === true,
    readable: info?.isFile?.() === true,
    sizeBytes: typeof info?.size === "number" ? info.size : null,
    modifiedAt: info?.mtime?.toISOString?.() || null,
  };
}

async function publicSnapshotMetadata(pathValue) {
  const name = basename(String(pathValue || "")) || "novondb.json";
  try {
    const info = await stat(pathValue);
    return publicMetadataFromStat(name, info, info.isFile() ? "available" : "not-a-file");
  } catch (error) {
    return {
      name,
      status: "unavailable",
      present: false,
      readable: false,
      sizeBytes: null,
      modifiedAt: null,
      reason: error?.code || "snapshot_unavailable",
    };
  }
}

async function safeArchiveMetadata(name) {
  try {
    const metadata = await archivePublicMetadata(name);
    return metadata
      ? { ...metadata, status: "available", present: true, readable: true }
      : { name, status: "unavailable", present: false, readable: false, sizeBytes: null, modifiedAt: null };
  } catch (error) {
    return {
      name,
      status: "unavailable",
      present: false,
      readable: false,
      sizeBytes: null,
      modifiedAt: null,
      reason: error?.code || "archive_unavailable",
    };
  }
}

async function jsonValidityForFile(pathValue) {
  try {
    await readJsonSnapshot(pathValue);
    return { validJson: true, reason: null };
  } catch (error) {
    return { validJson: false, reason: error?.code || "invalid_json" };
  }
}

function restoreBlockerRows({ moduleAccessAllowed, archiveResolution, archiveMeta, archiveJson, currentSnapshot, archiveAvailable, restoreConfig, confirmationMatches, requireConfirmation }) {
  const blockers = [];
  if (!moduleAccessAllowed) blockers.push({ code: "admin-dev-module-access-required", severity: "blocking", reason: "Restore preview/live restore must be called from the protected Database Sync module." });
  if (!archiveResolution?.ok) blockers.push({ code: "archive-name-rejected", severity: "blocking", reason: archiveResolution?.reason || "archiveName was rejected." });
  if (archiveResolution?.ok && archiveMeta?.present !== true) blockers.push({ code: "archive-unavailable", severity: "blocking", reason: "Selected archive is not available as a readable JSON file." });
  if (archiveResolution?.ok && archiveJson?.validJson !== true) blockers.push({ code: "archive-json-invalid", severity: "blocking", reason: "Selected archive is not valid JSON." });
  if (currentSnapshot?.present !== true || currentSnapshot?.readable !== true) blockers.push({ code: "current-snapshot-unavailable", severity: "blocking", reason: "Current authority/reference snapshot must be readable so it can be archived before restore." });
  if (archiveAvailable !== true) blockers.push({ code: "archive-directory-unavailable", severity: "blocking", reason: "Archive directory must be available to store the pre-restore snapshot." });
  if (restoreConfig.enabled !== true) blockers.push({ code: "restore-env-disabled", severity: "blocking", reason: "CONTROLSTACK_AUTHORITY_REFERENCE_RESTORE_ENABLED must be true for live restore." });
  if (requireConfirmation && confirmationMatches !== true) blockers.push({ code: "restore-confirmation-required", severity: "blocking", reason: `Confirmation text must exactly equal ${AUTH_REF_RESTORE_CONFIRMATION_TEXT}.` });
  return blockers;
}

async function authorityReferenceRestorePreflight({ archiveName, confirmation = "", moduleAccessAllowed = false, requireConfirmation = false } = {}) {
  const archiveResolution = archivePathForBasename(archiveName);
  const restoreConfig = authorityReferenceRestoreConfig();
  const currentPath = readAuthorityReferenceSnapshotPath();
  const archiveDir = authorityReferenceArchiveDir();
  const archiveStatus = await authorityReferenceArchiveStatus();
  const currentSnapshot = await publicSnapshotMetadata(currentPath);
  const archiveMeta = archiveResolution.ok
    ? await safeArchiveMetadata(archiveResolution.name)
    : { name: String(archiveName || "").trim() || "none", status: "rejected", present: false, readable: false, sizeBytes: null, modifiedAt: null };
  const archiveJson = archiveResolution.ok && archiveMeta.present === true
    ? await jsonValidityForFile(archiveResolution.filePath)
    : { validJson: false, reason: archiveResolution.reason || "archive_unavailable" };
  const plannedPreRestoreArchivePath = currentPath && archiveDir ? archiveDestinationPath(currentPath, archiveDir) : null;
  const plannedPreRestoreArchive = plannedPreRestoreArchivePath
    ? { name: basename(plannedPreRestoreArchivePath), status: "planned", absolutePathExposed: false }
    : { name: null, status: "not-planned", absolutePathExposed: false };
  const confirmationMatches = confirmation === AUTH_REF_RESTORE_CONFIRMATION_TEXT;
  const blockers = restoreBlockerRows({
    moduleAccessAllowed,
    archiveResolution,
    archiveMeta,
    archiveJson,
    currentSnapshot,
    archiveAvailable: archiveStatus.available === true,
    restoreConfig,
    confirmationMatches,
    requireConfirmation,
  });
  const restoreAllowed = blockers.length === 0;
  const payload = {
    ok: archiveResolution.ok === true,
    owner: "runtime-server",
    status: restoreAllowed ? "restore-preview-ready" : "restore-preview-blocked",
    adminOnly: true,
    readOnly: true,
    archiveName: archiveResolution.ok ? archiveResolution.name : null,
    archive: archiveMeta,
    currentSnapshot,
    archiveJsonValid: archiveJson.validJson === true,
    archiveJsonReason: archiveJson.reason,
    restoreWouldBeAllowed: restoreAllowed,
    restoreAllowed,
    plannedPreRestoreArchive,
    blockers,
    mutationAttempted: false,
    fullDatabaseReturned: false,
    fullUsersReturned: false,
    rawUsersReturned: false,
    absolutePathsExposed: false,
    restoreConfig: {
      enabled: restoreConfig.enabled,
      envGate: restoreConfig.envGate,
      requiredValue: restoreConfig.requiredValue,
      confirmationText: restoreConfig.confirmationText,
    },
    checkedAt: new Date().toISOString(),
  };
  return { payload, archiveResolution, currentPath, plannedPreRestoreArchivePath, blockers, restoreAllowed };
}

async function sendAuthorityReferenceRestorePreview(res, req) {
  try {
    const body = await requestJson(req);
    const preflight = await authorityReferenceRestorePreflight({
      archiveName: body.archiveName,
      moduleAccessAllowed: hasAdminDevModuleAccess(req),
      requireConfirmation: false,
    });
    sendJson(res, preflight.archiveResolution.ok ? 200 : 400, preflight.payload);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      owner: "runtime-server",
      status: "restore-preview-failed",
      adminOnly: true,
      readOnly: true,
      reason: error?.code || "authority_reference_restore_preview_failed",
      mutationAttempted: false,
      fullDatabaseReturned: false,
      fullUsersReturned: false,
      rawUsersReturned: false,
      absolutePathsExposed: false,
    });
  }
}

async function sendAuthorityReferenceRestore(res, req) {
  let archiveName = "";
  try {
    const body = await requestJson(req);
    archiveName = body.archiveName;
    const preflight = await authorityReferenceRestorePreflight({
      archiveName,
      confirmation: body.confirmation,
      moduleAccessAllowed: hasAdminDevModuleAccess(req),
      requireConfirmation: true,
    });
    if (!preflight.restoreAllowed) {
      sendJson(res, preflight.archiveResolution.ok ? 409 : 400, {
        ...preflight.payload,
        status: "restore-blocked",
        readOnly: false,
        mutationAttempted: false,
      });
      return;
    }

    await mkdir(authorityReferenceArchiveDir(), { recursive: true });
    await copyFile(preflight.currentPath, preflight.plannedPreRestoreArchivePath);
    const preRestoreArchiveInfo = await stat(preflight.plannedPreRestoreArchivePath);
    const preRestoreArchive = publicMetadataFromStat(basename(preflight.plannedPreRestoreArchivePath), preRestoreArchiveInfo, "created");
    await copyFile(preflight.archiveResolution.filePath, preflight.currentPath);
    const targetSnapshot = await publicSnapshotMetadata(preflight.currentPath);
    sendJson(res, 200, {
      ok: true,
      owner: "runtime-server",
      status: "restore-completed",
      adminOnly: true,
      readOnly: false,
      executionLive: true,
      restoredArchiveName: preflight.archiveResolution.name,
      targetSnapshot,
      preRestoreArchive,
      completedAt: new Date().toISOString(),
      blockers: [],
      failures: [],
      statusRefreshed: true,
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: true,
      fullDatabaseReturned: false,
      fullUsersReturned: false,
      rawUsersReturned: false,
      absolutePathsExposed: false,
    });
  } catch (error) {
    const validation = validateArchiveName(archiveName);
    sendJson(res, 500, {
      ok: false,
      owner: "runtime-server",
      status: "restore-failed",
      adminOnly: true,
      readOnly: false,
      archiveName: validation.ok ? validation.name : null,
      completedAt: new Date().toISOString(),
      blockers: [],
      failures: [{ code: "restore-exception", severity: "blocking", reason: error?.code || "authority_reference_restore_failed" }],
      mutationAttempted: true,
      fullDatabaseReturned: false,
      fullUsersReturned: false,
      rawUsersReturned: false,
      absolutePathsExposed: false,
    });
  }
}

function hubspotTokenSource(candidates) {
  for (const [name, value] of candidates) {
    if (value) return { token: value, tokenSource: `env:${name}` };
  }
  return { token: "", tokenSource: "none" };
}

function hubspotAuthStatus() {
  const requestedMode = String(process.env.CONTROLSTACK_HUBSPOT_AUTH_MODE || "oauth").trim().toLowerCase();
  const staticTokenEnabled = readBooleanEnv("CONTROLSTACK_HUBSPOT_STATIC_TOKEN_ENABLED", false);
  const oauth = hubspotTokenSource([
    ["HUBSPOT_OAUTH_ACCESS_TOKEN", readTextEnv("HUBSPOT_OAUTH_ACCESS_TOKEN")],
    ["HUBSPOT_ACCESS_TOKEN", readTextEnv("HUBSPOT_ACCESS_TOKEN")],
  ]);
  const staticToken = hubspotTokenSource([
    ["HUBSPOT_STATIC_TOKEN", readTextEnv("HUBSPOT_STATIC_TOKEN")],
    ["HUBSPOT_PRIVATE_APP_TOKEN", readTextEnv("HUBSPOT_PRIVATE_APP_TOKEN")],
    ["HUBSPOT_TOKEN", readTextEnv("HUBSPOT_TOKEN")],
  ]);
  const staticRequested = ["static", "static-token", "private", "private-app", "private-app-token"].includes(requestedMode);
  const oauthRequested = requestedMode === "oauth" || requestedMode === "oauth-server-bearer";

  let selected = oauth;
  let mode = "oauth-server-bearer";
  let configured = Boolean(oauth.token);
  let status = configured ? "configured" : "unconfigured";
  let reason = configured
    ? "HubSpot OAuth-derived server-side bearer token is configured through external environment."
    : "HubSpot OAuth-derived server-side bearer token is not configured.";

  if (staticRequested) {
    mode = staticTokenEnabled ? "static-token" : "static-token-disabled";
    selected = staticTokenEnabled ? staticToken : { token: "", tokenSource: "none" };
    configured = staticTokenEnabled && Boolean(staticToken.token);
    status = configured ? "configured" : staticTokenEnabled ? "unconfigured" : "disabled";
    reason = staticTokenEnabled
      ? configured
        ? "Optional HubSpot static/private-token mode is explicitly enabled and configured server-side."
        : "Optional HubSpot static/private-token mode is enabled but no server-side token is configured."
      : "Optional HubSpot static/private-token mode was requested but is disabled by default.";
  } else if (!oauthRequested) {
    selected = { token: "", tokenSource: "none" };
    mode = "invalid-mode";
    configured = false;
    status = "invalid-mode";
    reason = `Unsupported HubSpot auth mode '${requestedMode}'. Use oauth or explicitly gated static-token mode.`;
  }

  return {
    owner: "runtime-server",
    provider: "hubspot",
    status,
    configured,
    available: configured,
    primaryAuthMode: "oauth-server-bearer",
    activeAuthMode: mode,
    requestedAuthMode: requestedMode || "oauth",
    tokenSource: selected.tokenSource,
    tokenPresent: Boolean(selected.token),
    staticTokenMode: {
      enabled: staticTokenEnabled,
      configured: Boolean(staticToken.token),
      requested: staticRequested,
      tokenSource: staticTokenEnabled && staticToken.token ? staticToken.tokenSource : "none",
    },
    readOnly: true,
    nonBootCritical: true,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    streamlit8501AuthShape: false,
    reason,
    writePolicy: { enabled: false, reason: "HubSpot writes and deal sync are disabled." },
    token: selected.token,
  };
}

function publicHubspotAuthStatus(status = hubspotAuthStatus()) {
  const { token, ...safeStatus } = status;
  return safeStatus;
}

function hubspotDealWritebackMappingStatus() {
  const tenantId = envStatus({ primary: "CONTROLSTACK_TENANT_ID", aliases: ["CONTROLSTACK_OCCURRENCE_TENANT_ID"], valueKind: "tenant-id" });
  const occurrenceId = envStatus({ primary: "CONTROLSTACK_OCCURRENCE_ID", valueKind: "occurrence-id" });
  const providerProfile = envStatus({ primary: "CONTROLSTACK_HUBSPOT_PROVIDER_PROFILE_ID", valueKind: "provider-profile-id" });
  const dealMappingProfile = envStatus({ primary: "CONTROLSTACK_HUBSPOT_DEAL_MAPPING_PROFILE_ID", valueKind: "mapping-profile-id" });
  const contactMappingProfile = envStatus({ primary: "CONTROLSTACK_HUBSPOT_CONTACT_MAPPING_PROFILE_ID", valueKind: "mapping-profile-id" });
  const companyMappingProfile = envStatus({ primary: "CONTROLSTACK_HUBSPOT_COMPANY_MAPPING_PROFILE_ID", valueKind: "mapping-profile-id" });
  const pipelineId = envStatus({ primary: "CONTROLSTACK_HUBSPOT_DEAL_PIPELINE_ID", valueKind: "provider-pipeline-id" });
  const defaultStageId = envStatus({ primary: "CONTROLSTACK_HUBSPOT_DEAL_STAGE_ID", valueKind: "provider-stage-id" });
  return {
    owner: "runtime-server",
    provider: "hubspot",
    status: dealMappingProfile.configured ? "mapping-profile-present" : "mapping-profile-missing",
    tenantId,
    occurrenceId,
    providerProfile,
    dealMappingProfile,
    contactMappingProfile,
    companyMappingProfile,
    pipelineId,
    defaultStageId,
    mappingReadyForPreflight: dealMappingProfile.configured === true,
    browserSecretsExposed: false,
    nonSecretOnly: true,
  };
}

function safeQueryValue(requestUrl, name) {
  return cleanText(requestUrl.searchParams.get(name));
}

function hubspotDealWritebackPreflightRequest(requestUrl) {
  const dealId = safeQueryValue(requestUrl, "dealId");
  const requestedAction = safeQueryValue(requestUrl, "action") || (dealId ? "link-existing-deal" : "create-deal");
  const allowedActions = new Set(["create-deal", "link-existing-deal", "update-linked-deal", "no-op"]);
  return {
    action: allowedActions.has(requestedAction) ? requestedAction : "no-op",
    requestedAction,
    projectId: safeQueryValue(requestUrl, "projectId"),
    projectName: safeQueryValue(requestUrl, "projectName"),
    projectStatus: safeQueryValue(requestUrl, "projectStatus"),
    clientName: safeQueryValue(requestUrl, "clientName"),
    siteName: safeQueryValue(requestUrl, "siteName"),
    contactId: safeQueryValue(requestUrl, "contactId"),
    companyId: safeQueryValue(requestUrl, "companyId"),
    dealId,
    associationSource: safeQueryValue(requestUrl, "associationSource") || "none",
  };
}

function hubspotDealWritebackBlockers({ request, authStatus, mapping }) {
  const blockers = [];
  if (!authStatus.configured) {
    blockers.push({ code: "hubspot-auth-unconfigured", severity: "blocking", reason: authStatus.reason });
  }
  if (!mapping.dealMappingProfile.configured) {
    blockers.push({ code: "deal-mapping-profile-missing", severity: "blocking", reason: "No tenant/provider HubSpot deal mapping profile is configured." });
  }
  if (!request.projectId) {
    blockers.push({ code: "project-id-missing", severity: "blocking", reason: "Project id is required for future project-scoped deal writeback." });
  }
  if (!request.projectName) {
    blockers.push({ code: "project-name-missing", severity: "blocking", reason: "Project name is required for future deal naming/mapping." });
  }
  if (!request.contactId && !request.companyId && !request.dealId) {
    blockers.push({ code: "crm-association-missing", severity: "blocking", reason: "At least one contact, company, or existing deal association is required for future writeback." });
  }
  if (["link-existing-deal", "update-linked-deal"].includes(request.action) && !request.dealId) {
    blockers.push({ code: "deal-id-missing", severity: "blocking", reason: "Existing deal id is required for link/update preflight." });
  }
  blockers.push({ code: "write-policy-disabled", severity: "intentional-block", reason: "HubSpot deal writeback is preflight-only. No provider mutation is enabled in this foundation." });
  return blockers;
}

function hubspotDealWritebackPreflight(requestUrl) {
  const authStatus = publicHubspotAuthStatus();
  const mapping = hubspotDealWritebackMappingStatus();
  const request = hubspotDealWritebackPreflightRequest(requestUrl);
  const blockers = hubspotDealWritebackBlockers({ request, authStatus, mapping });
  const hardBlockers = blockers.filter((blocker) => blocker.severity === "blocking");
  return {
    owner: "runtime-server",
    provider: "hubspot",
    status: hardBlockers.length ? "preflight-blocked" : "preflight-ready-but-write-disabled",
    source: "server-hubspot-deal-writeback-preflight-only",
    preflightOnly: true,
    dryRun: true,
    nonBootCritical: true,
    adminToolCandidate: true,
    browserSecretsExposed: false,
    nonSecretOnly: true,
    providerMutationAttempted: false,
    providerCallAttempted: false,
    writePolicy: {
      enabled: false,
      liveProviderWritesEnabled: false,
      reason: "HubSpot deal writeback is disabled. This endpoint only reports safe preflight readiness and intended action.",
    },
    authStatus,
    mapping,
    request,
    intendedAction: {
      action: request.action,
      providerObject: "deal",
      syncDirection: "controlstack-to-hubspot",
      projectScoped: true,
      targetDealId: request.dealId || null,
      linkedContactId: request.contactId || null,
      linkedCompanyId: request.companyId || null,
      canonicalFields: {
        projectId: request.projectId || null,
        projectName: request.projectName || null,
        projectStatus: request.projectStatus || null,
        clientName: request.clientName || null,
        siteName: request.siteName || null,
      },
    },
    readiness: {
      authConfigured: authStatus.configured === true,
      mappingConfigured: mapping.dealMappingProfile.configured === true,
      associationPresent: Boolean(request.contactId || request.companyId || request.dealId),
      projectPresent: Boolean(request.projectId),
      liveWriteAllowed: false,
    },
    blockers,
  };
}

function sendHubspotDealWritebackPreflight(res, requestUrl) {
  sendJson(res, 200, hubspotDealWritebackPreflight(requestUrl));
}

function hubspotAccessToken() {
  return hubspotAuthStatus().token;
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanDomain(value) {
  return cleanText(value).replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
}

function domainFromEmail(email) {
  const value = cleanText(email).toLowerCase();
  return value.includes("@") ? value.split("@").pop() : "";
}

function hubspotObject(result, objectType) {
  if (!result) return null;
  const props = result.properties || {};
  if (objectType === "contacts") {
    const first = cleanText(props.firstname);
    const last = cleanText(props.lastname);
    return {
      found: true,
      contactId: String(result.id || props.hs_object_id || ""),
      email: cleanText(props.email),
      name: [first, last].filter(Boolean).join(" ") || cleanText(props.email),
      firstName: first || null,
      lastName: last || null,
      companyName: cleanText(props.company) || null,
      lifecycleStage: cleanText(props.lifecyclestage) || null,
      leadStatus: cleanText(props.hs_lead_status) || null,
      ownerId: cleanText(props.hubspot_owner_id) || null,
      source: "hubspot-read-only",
    };
  }
  return {
    found: true,
    companyId: String(result.id || props.hs_object_id || ""),
    companyName: cleanText(props.name) || cleanText(props.domain) || "HubSpot company",
    domain: cleanDomain(props.domain) || null,
    website: cleanText(props.website) || null,
    lifecycleStage: cleanText(props.lifecyclestage) || null,
    ownerId: cleanText(props.hubspot_owner_id) || null,
    city: cleanText(props.city) || null,
    state: cleanText(props.state) || null,
    country: cleanText(props.country) || null,
    source: "hubspot-read-only",
  };
}

async function hubspotSearch({ objectType, token, filters, properties, limit = 1 }) {
  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{ filters }],
      properties,
      limit,
    }),
  });
  if (!response.ok) {
    return { ok: false, status: response.status, results: [] };
  }
  const payload = await response.json();
  return { ok: true, status: response.status, results: Array.isArray(payload.results) ? payload.results : [] };
}

async function lookupHubspotContact(token, email) {
  if (!email) return null;
  const page = await hubspotSearch({
    objectType: "contacts",
    token,
    filters: [{ propertyName: "email", operator: "EQ", value: email }],
    properties: ["email", "firstname", "lastname", "company", "lifecyclestage", "hs_lead_status", "hubspot_owner_id"],
  });
  if (!page.ok) return { error: `contact_lookup_http_${page.status}` };
  return hubspotObject(page.results[0], "contacts");
}

async function lookupHubspotCompany(token, { domain, companyName }) {
  const clean = cleanDomain(domain);
  if (clean) {
    const byDomain = await hubspotSearch({
      objectType: "companies",
      token,
      filters: [{ propertyName: "domain", operator: "EQ", value: clean }],
      properties: ["name", "domain", "website", "lifecyclestage", "hubspot_owner_id", "city", "state", "country"],
    });
    if (!byDomain.ok) return { error: `company_lookup_http_${byDomain.status}` };
    if (byDomain.results[0]) return hubspotObject(byDomain.results[0], "companies");
  }
  const name = cleanText(companyName);
  if (name) {
    const byName = await hubspotSearch({
      objectType: "companies",
      token,
      filters: [{ propertyName: "name", operator: "EQ", value: name }],
      properties: ["name", "domain", "website", "lifecyclestage", "hubspot_owner_id", "city", "state", "country"],
    });
    if (!byName.ok) return { error: `company_lookup_http_${byName.status}` };
    if (byName.results[0]) return hubspotObject(byName.results[0], "companies");
  }
  return null;
}

function lookupErrorCode(result) {
  return result?.error || null;
}

function isAuthLookupError(result) {
  return /_http_401$/.test(String(lookupErrorCode(result) || ""));
}

function isScopeLookupError(result) {
  return /_http_403$/.test(String(lookupErrorCode(result) || ""));
}

const PUBLIC_EMAIL_DOMAINS = new Set(["gmail.com", "outlook.com", "hotmail.com", "live.com", "icloud.com", "yahoo.com", "proton.me", "protonmail.com"]);

function normaliseComparableText(value) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function exactContactResult(contact, queryEmail) {
  if (!contact || contact.error) return { found: false, email: queryEmail || null, source: contact?.error || "not_found" };
  if (normaliseEmail(contact.email) !== normaliseEmail(queryEmail)) {
    return {
      found: false,
      email: queryEmail || null,
      returnedEmail: contact.email || null,
      source: "email_mismatch",
      reason: "Returned contact email did not exactly match the queried email.",
    };
  }
  return contact;
}

function trustworthyCompanyResult(company, { domain, companyName, domainWasExplicit }) {
  if (!company || company.error) {
    return { found: false, domain: domain || null, companyName: companyName || null, source: company?.error || "not_found" };
  }
  const queryDomain = cleanDomain(domain);
  const returnedDomain = cleanDomain(company.domain);
  const queryName = normaliseComparableText(companyName);
  const returnedName = normaliseComparableText(company.companyName);
  const domainTrusted = Boolean(domainWasExplicit && queryDomain && !PUBLIC_EMAIL_DOMAINS.has(queryDomain) && returnedDomain === queryDomain);
  const nameTrusted = Boolean(queryName && returnedName === queryName);
  if (!domainTrusted && !nameTrusted) {
    return {
      found: false,
      domain: queryDomain || null,
      companyName: companyName || null,
      returnedDomain: returnedDomain || null,
      returnedCompanyName: company.companyName || null,
      source: "company_mismatch",
      reason: "Returned company did not exactly match an explicit company domain or company name.",
    };
  }
  return company;
}

function hubspotReadStatus({ contact, company }) {
  const contactAuth = isAuthLookupError(contact);
  const companyAuth = isAuthLookupError(company);
  const contactScope = isScopeLookupError(contact);
  const companyScope = isScopeLookupError(company);
  const anyFound = contact?.found === true || company?.found === true;
  if (contactAuth || companyAuth) {
    return {
      ok: false,
      available: false,
      reason: "HubSpot read authentication failed with HTTP 401. Check that the server token is valid/current and matches the donor auth model.",
    };
  }
  if (contactScope || companyScope) {
    return {
      ok: false,
      available: false,
      reason: "HubSpot read authorization failed with HTTP 403. Check read scopes for contacts/companies.",
    };
  }
  return {
    ok: true,
    available: true,
    reason: anyFound ? "HubSpot read-only lookup completed. No writes were attempted." : "HubSpot read-only lookup completed but no matching contact/company was found. No writes were attempted.",
  };
}

async function sendHubspotRead(res, requestUrl) {
  const authStatus = hubspotAuthStatus();
  const token = authStatus.token;
  const email = normaliseEmail(requestUrl.searchParams.get("email"));
  const explicitDomain = cleanDomain(requestUrl.searchParams.get("domain"));
  const domain = explicitDomain || domainFromEmail(email);
  const companyName = cleanText(requestUrl.searchParams.get("companyName"));
  if (!token) {
    sendJson(res, 200, {
      ok: true,
      configured: false,
      available: false,
      readOnly: true,
      source: "server-hubspot-read-only",
      reason: authStatus.reason,
      hubspotAuth: publicHubspotAuthStatus(authStatus),
      contact: { found: false, email: email || null, source: "unconfigured" },
      company: { found: false, domain: domain || null, companyName: companyName || null, source: "unconfigured" },
      writePolicy: { enabled: false, reason: "HubSpot writes are disabled." },
    });
    return;
  }
  try {
    const rawContact = await lookupHubspotContact(token, email);
    const contact = exactContactResult(rawContact, email);
    const rawCompany = await lookupHubspotCompany(token, {
      domain: explicitDomain,
      companyName,
    });
    const company = trustworthyCompanyResult(rawCompany, {
      domain: explicitDomain,
      companyName,
      domainWasExplicit: Boolean(explicitDomain),
    });
    const readStatus = hubspotReadStatus({ contact, company });
    sendJson(res, readStatus.ok ? 200 : 401, {
      ok: readStatus.ok,
      configured: true,
      available: readStatus.available,
      readOnly: true,
      source: "server-hubspot-read-only",
      reason: readStatus.reason,
      hubspotAuth: publicHubspotAuthStatus(authStatus),
      query: { email: email || null, domain: domain || null, companyName: companyName || null },
      contact,
      company,
      writePolicy: { enabled: false, reason: "HubSpot writes are disabled." },
    });
  } catch (error) {
    sendJson(res, 502, {
      ok: false,
      configured: true,
      available: false,
      readOnly: true,
      source: "server-hubspot-read-only",
      reason: `HubSpot read-only lookup failed: ${error?.message || "unknown error"}.`,
      hubspotAuth: publicHubspotAuthStatus(authStatus),
      contact: { found: false, email: email || null, source: "lookup_failed" },
      company: { found: false, domain: domain || null, companyName: companyName || null, source: "lookup_failed" },
      writePolicy: { enabled: false, reason: "HubSpot writes are disabled." },
    });
  }
}

function isInsideRoot(candidate) {
  const relative = normalize(candidate).slice(ROOT.length);
  return candidate === ROOT || (candidate.startsWith(ROOT + sep) && !relative.startsWith(`..${sep}`));
}

function resolveRuntimePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const cleanPath = decoded.replace(/^\/+/, "");
  const absolute = resolve(join(ROOT, cleanPath));
  if (!isInsideRoot(absolute)) {
    return null;
  }
  return absolute;
}

async function serveFile(res, absolutePath) {
  if (!absolutePath || !isInsideRoot(absolutePath)) {
    sendJson(res, 403, { ok: false, error: "path_escape_rejected" });
    return;
  }

  if (isDeniedStaticServedFile(absolutePath)) {
    sendJson(res, 404, { ok: false, error: "not_found", staticArtifactDenied: true });
    return;
  }

  try {
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      sendJson(res, 404, { ok: false, error: "not_found" });
      return;
    }
    await access(absolutePath);
  } catch {
    sendJson(res, 404, { ok: false, error: "not_found" });
    return;
  }

  const contentType = MIME_TYPES.get(extname(absolutePath).toLowerCase()) || "application/octet-stream";
  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  createReadStream(absolutePath).pipe(res);
}

function isLoopbackRemoteAddress(req) {
  const address = String(req.socket?.remoteAddress || "").trim().toLowerCase();
  return address === "127.0.0.1"
    || address === "::1"
    || address === "::ffff:127.0.0.1"
    || address.startsWith("127.");
}

function isSameOriginRequest(req) {
  const origin = String(req.headers?.origin || "").trim();
  if (!origin) return true;
  try {
    const expected = new URL(`http://${req.headers.host || `${HOST}:${PORT}`}`);
    const actual = new URL(origin);
    return actual.protocol === expected.protocol && actual.host === expected.host;
  } catch {
    return false;
  }
}

function invokeRuntimeEngineRunTableSelectedProjectHostLocalReadonlySeam(bridgeRequest) {
  return new Promise((resolveInvocation, rejectInvocation) => {
    const pythonCommand = String(process.env.CONTROLSTACK_PYTHON || "python").trim() || "python";
    const child = spawn(
      pythonCommand,
      [SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_PATH],
      {
        cwd: ROOT,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          CONTROLSTACK_RUNTIME_ROOT: ROOT,
        },
      },
    );
    const stdoutChunks = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;

    const finishReject = (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      rejectInvocation(new Error(code));
    };
    const timeout = setTimeout(() => {
      child.kill();
      finishReject("selected-project-host-seam-timeout");
    }, SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_MAX_OUTPUT_BYTES) {
        child.kill();
        finishReject("selected-project-host-seam-output-too-large");
        return;
      }
      stdoutChunks.push(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderrBytes += chunk.length;
      if (stderrBytes > SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_MAX_OUTPUT_BYTES) {
        child.kill();
        finishReject("selected-project-host-seam-stderr-too-large");
      }
    });
    child.on("error", () => finishReject("selected-project-host-seam-process-unavailable"));
    child.on("close", (code) => {
      if (settled) return;
      if (code !== 0) {
        finishReject("selected-project-host-seam-process-failed");
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(Buffer.concat(stdoutChunks).toString("utf-8"));
      } catch {
        finishReject("selected-project-host-seam-response-invalid");
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolveInvocation(parsed);
    });

    try {
      child.stdin.end(JSON.stringify(bridgeRequest));
    } catch {
      child.kill();
      finishReject("selected-project-host-seam-request-write-failed");
    }
  });
}

const selectedProjectEngineRunHostSavedProjects = createSavedProjectStore();
const selectedProjectServerOwnedRuntimeSavedRegistry =
  createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry({
    savedProjects: selectedProjectEngineRunHostSavedProjects,
  });
const selectedProjectEngineRunHostTransport =
  createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount({
    savedProjects: selectedProjectServerOwnedRuntimeSavedRegistry,
    invokeHostLocalReadonlySeam:
      invokeRuntimeEngineRunTableSelectedProjectHostLocalReadonlySeam,
  });

async function sendSelectedProjectServerOwnedRegistration(res, req) {
  if (!isLoopbackRemoteAddress(req) || !isSameOriginRequest(req)) {
    sendJson(res, 403, {
      ok: false,
      failClosed: true,
      blocker: "selected-project-registration-same-origin-loopback-only",
    });
    return;
  }

  let request;
  try {
    request = await requestJson(req, { maxBytes: 262144 });
  } catch {
    sendJson(res, 400, {
      ok: false,
      failClosed: true,
      blocker: "selected-project-registration-request-json-invalid",
    });
    return;
  }

  const response = await selectedProjectServerOwnedRuntimeSavedRegistry.register(request);
  const status = response.ok === true ? 200 : response.requestAccepted === true ? 422 : 400;
  sendJson(res, status, response);
}

async function sendSelectedProjectEngineRunHostTransport(res, req) {
  if (!isLoopbackRemoteAddress(req)) {
    sendJson(res, 403, {
      ok: false,
      failClosed: true,
      blocker: "selected-project-host-transport-loopback-only",
      readOnly: true,
      selectedProjectOnly: true,
      redactedOutcomeOnly: true,
    });
    return;
  }

  let request;
  try {
    request = await requestJson(req, { maxBytes: 8192 });
  } catch {
    sendJson(res, 400, {
      ok: false,
      failClosed: true,
      blocker: "selected-project-host-transport-request-json-invalid",
      readOnly: true,
      selectedProjectOnly: true,
      redactedOutcomeOnly: true,
    });
    return;
  }

  const response = await selectedProjectEngineRunHostTransport.invoke(request);
  const status = response.ok === true ? 200 : response.requestAccepted === true ? 422 : 400;
  sendJson(res, status, response);
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);

  const isAllowedAuthorityReferencePost = req.method === "POST" && AUTH_REF_POST_PATHS.has(requestUrl.pathname);
  const isAllowedSelectedProjectEngineHostTransportPost =
    req.method === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD
    && requestUrl.pathname
      === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH;
  const isAllowedSelectedProjectRegistrationPost =
    req.method === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD
    && requestUrl.pathname
      === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH;
  if (req.method !== "GET"
    && req.method !== "HEAD"
    && !isAllowedAuthorityReferencePost
    && !isAllowedSelectedProjectEngineHostTransportPost
    && !isAllowedSelectedProjectRegistrationPost) {
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  if (requestUrl.pathname
      === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH) {
    if (req.method !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD) {
      sendJson(res, 405, {
        ok: false,
        error: "method_not_allowed",
        requiredMethod: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
      });
      return;
    }
    await sendSelectedProjectServerOwnedRegistration(res, req);
    return;
  }

  if (requestUrl.pathname
      === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH) {
    if (req.method
        !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD) {
      sendJson(res, 405, {
        ok: false,
        error: "method_not_allowed",
        requiredMethod:
          RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
      });
      return;
    }
    await sendSelectedProjectEngineRunHostTransport(res, req);
    return;
  }

  if (requestUrl.pathname === "/" || requestUrl.pathname === "/health") {
    sendPublicStatusJson(res, 200, {
      ok: true,
      name: "controlstack-runtime-shell",
      phase: "live-nvb-authority-read",
      workspace: "/workspace?module=cs_selector",
      runtimeConfig: "/runtime-config.js",
      hubspotRead: HUBSPOT_READ_PATH,
      hubspotAuthStatus: HUBSPOT_AUTH_STATUS_PATH,
      hubspotDealWritebackPreflight: HUBSPOT_DEAL_PREFLIGHT_PATH,
      hubspotAuth: publicHubspotAuthStatus(),
      hubspotDealWriteback: {
        endpoint: HUBSPOT_DEAL_PREFLIGHT_PATH,
        preflightOnly: true,
        writePolicy: { enabled: false, reason: "HubSpot deal writeback live writes are disabled." },
      },
      authorityReferenceStatus: AUTH_REF_STATUS_PATH,
      selectorReferenceStatus: SELECTOR_REFERENCE_STATUS_PATH,
      selectorReferenceOptions: SELECTOR_REFERENCE_OPTIONS_PATH,
      boardDataStatus: BOARD_DATA_STATUS_PATH,
      iesBuilderStatus: IES_BUILDER_STATUS_PATH,
      labProofStatus: LAB_PROOF_STATUS_PATH,
      authorityReferenceSync: AUTH_REF_SYNC_PATH,
      authorityReferenceSourceMaterialisation: AUTH_REF_SOURCE_MATERIALISATION_PATH,
      authorityReferenceMaterialiserStatus: AUTH_REF_MATERIALISER_STATUS_PATH,
      authorityReferenceMaterialiserRefresh: AUTH_REF_MATERIALISER_REFRESH_PATH,
      authorityReferenceArchives: AUTH_REF_ARCHIVES_PATH,
      authorityReferenceDiff: AUTH_REF_DIFF_PATH,
      authorityReferenceDiffDetail: AUTH_REF_DIFF_DETAIL_PATH,
      authorityReferenceRestorePreview: AUTH_REF_RESTORE_PREVIEW_PATH,
      authorityReferenceRestore: AUTH_REF_RESTORE_PATH,
      configStatus: CONFIG_STATUS_PATH,
      config: runtimeConfigStatus(),
      root: "redacted",
      rootRedacted: true,
      localPathExposureEnabled: false,
    });
    return;
  }

  if (requestUrl.pathname === "/runtime-config.js") {
    sendRuntimeConfig(res);
    return;
  }

  if (requestUrl.pathname === CONFIG_STATUS_PATH) {
    sendPublicStatusJson(res, 200, runtimeConfigStatus());
    return;
  }

  if (requestUrl.pathname === NVB_READ_PATH) {
    await sendNvbRead(res, requestUrl);
    return;
  }

  if (requestUrl.pathname === HUBSPOT_AUTH_STATUS_PATH) {
    sendJson(res, 200, publicHubspotAuthStatus());
    return;
  }

  if (requestUrl.pathname === HUBSPOT_DEAL_PREFLIGHT_PATH) {
    sendHubspotDealWritebackPreflight(res, requestUrl);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_STATUS_PATH) {
    await sendAuthorityReferenceStatus(res);
    return;
  }

  if (requestUrl.pathname === SELECTOR_REFERENCE_STATUS_PATH) {
    await sendSelectorReferenceStatus(res);
    return;
  }

  if (requestUrl.pathname === SELECTOR_REFERENCE_OPTIONS_PATH) {
    await sendSelectorReferenceOptions(res, requestUrl);
    return;
  }

  if (requestUrl.pathname === BOARD_DATA_STATUS_PATH) {
    await sendBoardDataStatus(res);
    return;
  }

  if (requestUrl.pathname === IES_BUILDER_STATUS_PATH) {
    await sendIesBuilderStatus(res);
    return;
  }

  if (requestUrl.pathname === LAB_PROOF_STATUS_PATH) {
    await sendLabProofStatus(res);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_SOURCE_MATERIALISATION_PATH) {
    await sendAuthorityReferenceSourceMaterialisation(res);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_MATERIALISER_STATUS_PATH) {
    if (req.method !== "GET") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "GET" });
      return;
    }
    await sendAuthorityReferenceMaterialiserStatus(res);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_MATERIALISER_REFRESH_PATH) {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "POST" });
      return;
    }
    await sendAuthorityReferenceMaterialiserRefresh(res, req, requestUrl);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_ARCHIVES_PATH) {
    if (req.method !== "GET") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "GET" });
      return;
    }
    await sendAuthorityReferenceArchives(res);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_DIFF_PATH) {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "POST" });
      return;
    }
    await sendAuthorityReferenceDiff(res, req);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_DIFF_DETAIL_PATH) {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "POST" });
      return;
    }
    await sendAuthorityReferenceDiffDetail(res, req);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_RESTORE_PREVIEW_PATH) {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "POST" });
      return;
    }
    await sendAuthorityReferenceRestorePreview(res, req);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_RESTORE_PATH) {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "POST" });
      return;
    }
    await sendAuthorityReferenceRestore(res, req);
    return;
  }

  if (requestUrl.pathname === AUTH_REF_SYNC_PATH) {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "method_not_allowed", requiredMethod: "POST" });
      return;
    }
    await sendAuthorityReferenceSync(res, requestUrl);
    return;
  }

  if (requestUrl.pathname === HUBSPOT_READ_PATH) {
    await sendHubspotRead(res, requestUrl);
    return;
  }

  if (requestUrl.pathname === "/workspace") {
    await serveFile(res, resolve(ROOT, "apps/workspace-shell/index.html"));
    return;
  }

  if (requestUrl.pathname.startsWith("/apps/") || requestUrl.pathname.startsWith("/packages/")) {
    await serveFile(res, resolveRuntimePath(requestUrl.pathname));
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "not_found",
    safeFallback: true,
  });
});

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  server.listen(PORT, HOST, () => {
    console.log(`ControlStack Runtime Shell listening on http://${HOST}:${PORT}/workspace?module=cs_selector`);
  });
}
