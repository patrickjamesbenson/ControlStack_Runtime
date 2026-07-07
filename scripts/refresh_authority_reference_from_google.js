#!/usr/bin/env node

import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { basename, join, win32 as pathWin32 } from "node:path";
import { pathToFileURL } from "node:url";

import {
  AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
  AUTHORITY_REFERENCE_ARCHIVE_ROOT,
  AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION,
  AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
  refreshAuthorityReferenceMaterialiser,
  validateMaterialisedAuthorityReferenceObject,
} from "../packages/workspace-kernel/authorityReferenceMaterialiserService.js";

export const DEFAULT_CONTROLSTACK_SECRET_ROOT = "C:\\_secrets\\ControlStack";
export const DEFAULT_GOOGLE_CREDENTIALS_PATH = pathWin32.join(DEFAULT_CONTROLSTACK_SECRET_ROOT, "novon_db_key.json");

export const GOOGLE_SHEET_ID_ENV_ALIASES = Object.freeze([
  "CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID",
  "GSHEETS_SPREADSHEET_ID",
  "NOVONDB_SPREADSHEET_ID",
  "CONTROLSTACK_NOVONDB_SPREADSHEET_ID",
]);

export const DEFAULT_GOOGLE_SHEET_ID_FILES = Object.freeze([
  pathWin32.join(DEFAULT_CONTROLSTACK_SECRET_ROOT, "novondb_google_sheet_id.txt"),
  pathWin32.join(DEFAULT_CONTROLSTACK_SECRET_ROOT, "novon_db_google_sheet_id.txt"),
  pathWin32.join(DEFAULT_CONTROLSTACK_SECRET_ROOT, "google_sheet_id.txt"),
  pathWin32.join(DEFAULT_CONTROLSTACK_SECRET_ROOT, "novondb.env"),
  pathWin32.join(DEFAULT_CONTROLSTACK_SECRET_ROOT, "google.env"),
  pathWin32.join(DEFAULT_CONTROLSTACK_SECRET_ROOT, "google.env.bat"),
]);

const MATERIALISER_ENABLED_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_ENABLED";
const MATERIALISER_EXECUTION_ENABLED_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_EXECUTION_ENABLED";
const GOOGLE_CREDENTIALS_ENV = "GOOGLE_APPLICATION_CREDENTIALS";
const PRIMARY_GOOGLE_SHEET_ID_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID";

function printUsage() {
  console.log(`Manual authority/reference Google sync helper

Usage:
  node scripts\\refresh_authority_reference_from_google.js --dry-run
  node scripts\\refresh_authority_reference_from_google.js --apply
  node scripts\\refresh_authority_reference_from_google.js --apply --promote

Optional:
  --sheet-id=<google spreadsheet id>
  --credentials=C:\\_secrets\\ControlStack\\novon_db_key.json

Safety:
  --dry-run writes nothing.
  --apply writes only C:\\ControlStack_RuntimeData\\authority-reference\\materialised\\novondb.json.
  --apply --promote archives the active snapshot first, then promotes the new materialised JSON.
  Credentials and sheet IDs are never printed.
`);
}

export function parseSyncArgs(argv = []) {
  const result = {
    dryRun: true,
    apply: false,
    promote: false,
    help: false,
    sheetId: "",
    credentials: "",
  };

  for (const rawArg of argv) {
    const arg = String(rawArg || "").trim();
    if (!arg) continue;
    if (arg === "--help" || arg === "-h" || arg === "/?") {
      result.help = true;
      continue;
    }
    if (arg === "--dry-run" || arg === "--dryRun") {
      result.dryRun = true;
      result.apply = false;
      continue;
    }
    if (arg === "--apply" || arg === "--live") {
      result.dryRun = false;
      result.apply = true;
      continue;
    }
    if (arg === "--promote") {
      result.promote = true;
      continue;
    }
    if (arg.startsWith("--sheet-id=")) {
      result.sheetId = arg.slice("--sheet-id=".length).trim();
      continue;
    }
    if (arg.startsWith("--sheetId=")) {
      result.sheetId = arg.slice("--sheetId=".length).trim();
      continue;
    }
    if (arg.startsWith("--credentials=")) {
      result.credentials = arg.slice("--credentials=".length).trim();
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return result;
}

function readTextEnv(env, name) {
  return String(env?.[name] || "").trim();
}

async function fileExists(pathValue) {
  if (!pathValue) return false;
  try {
    const info = await stat(pathValue);
    return Boolean(info?.isFile?.());
  } catch {
    return false;
  }
}

function parseSheetIdFromText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("rem ") && !line.startsWith("REM "));

  if (lines.length === 1 && !lines[0].includes("=")) {
    return lines[0].replace(/^['\"]|['\"]$/g, "").trim();
  }

  for (const line of lines) {
    const cleaned = line.replace(/^set\s+/i, "").replace(/^\$env:/i, "");
    const match = cleaned.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/i);
    if (!match) continue;
    const key = match[1].trim().toUpperCase();
    if (!GOOGLE_SHEET_ID_ENV_ALIASES.includes(key)) continue;
    return match[2].replace(/^['\"]|['\"]$/g, "").trim();
  }

  return "";
}

async function readSheetIdFromFiles(paths = DEFAULT_GOOGLE_SHEET_ID_FILES) {
  for (const pathValue of paths) {
    try {
      const text = await readFile(pathValue, "utf-8");
      const sheetId = parseSheetIdFromText(text);
      if (sheetId) return { sheetId, source: "local-secret-config-file" };
    } catch {
      // Keep this helper fail-closed and quiet about local secret/config paths.
    }
  }
  return { sheetId: "", source: "not-configured" };
}

export async function buildSyncEnvironment({ args = {}, env = process.env } = {}) {
  const nextEnv = { ...env };

  const configuredCredentials = String(args.credentials || readTextEnv(nextEnv, GOOGLE_CREDENTIALS_ENV)).trim();
  if (configuredCredentials) {
    nextEnv[GOOGLE_CREDENTIALS_ENV] = configuredCredentials;
  } else if (await fileExists(DEFAULT_GOOGLE_CREDENTIALS_PATH)) {
    nextEnv[GOOGLE_CREDENTIALS_ENV] = DEFAULT_GOOGLE_CREDENTIALS_PATH;
  }

  let sheetId = String(args.sheetId || "").trim();
  let sheetIdSource = sheetId ? "cli-argument" : "not-configured";
  if (!sheetId) {
    for (const alias of GOOGLE_SHEET_ID_ENV_ALIASES) {
      const value = readTextEnv(nextEnv, alias);
      if (value) {
        sheetId = value;
        sheetIdSource = alias === PRIMARY_GOOGLE_SHEET_ID_ENV ? "primary-env" : "alias-env";
        break;
      }
    }
  }
  if (!sheetId) {
    const fromFile = await readSheetIdFromFiles();
    sheetId = fromFile.sheetId;
    sheetIdSource = fromFile.source;
  }
  if (sheetId) nextEnv[PRIMARY_GOOGLE_SHEET_ID_ENV] = sheetId;

  if (args.apply) {
    nextEnv[MATERIALISER_ENABLED_ENV] = "true";
    nextEnv[MATERIALISER_EXECUTION_ENABLED_ENV] = "true";
  }

  return {
    env: nextEnv,
    sheetIdConfigured: Boolean(sheetId),
    sheetIdSource,
    credentialsConfigured: Boolean(nextEnv[GOOGLE_CREDENTIALS_ENV]),
    defaultCredentialsPathUsed: nextEnv[GOOGLE_CREDENTIALS_ENV] === DEFAULT_GOOGLE_CREDENTIALS_PATH,
    secretsRoot: DEFAULT_CONTROLSTACK_SECRET_ROOT,
    credentialPathReturned: false,
    sheetIdReturned: false,
  };
}

function safeArchiveStamp(now = new Date()) {
  return now.toISOString().replace(/[:.]/g, "-");
}

async function readableFileStatus(pathValue) {
  try {
    const info = await stat(pathValue);
    return {
      present: Boolean(info?.isFile?.()),
      readable: Boolean(info?.isFile?.()),
      sizeBytes: Number.isFinite(info?.size) ? info.size : null,
      modifiedAt: info?.mtime?.toISOString?.() || null,
    };
  } catch (error) {
    return {
      present: false,
      readable: false,
      sizeBytes: null,
      modifiedAt: null,
      reason: error?.code || "unavailable",
    };
  }
}

export async function promoteMaterialisedAuthorityReference({
  dryRun = true,
  now = new Date(),
  materialisedPath = AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
  activeSnapshotPath = AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
  archiveRoot = AUTHORITY_REFERENCE_ARCHIVE_ROOT,
} = {}) {
  const materialisedStatus = await readableFileStatus(materialisedPath);
  const activeStatus = await readableFileStatus(activeSnapshotPath);
  const plannedArchiveName = `${safeArchiveStamp(now)}-${basename(activeSnapshotPath) || "novondb.json"}`;
  const plannedArchivePath = join(archiveRoot, plannedArchiveName);

  const blockers = [];
  if (!materialisedStatus.readable) {
    blockers.push({ code: "materialised-source-unreadable", severity: "blocking", reason: "Materialised authority/reference JSON is not readable." });
  }

  let validation = null;
  if (materialisedStatus.readable) {
    try {
      const parsed = JSON.parse(await readFile(materialisedPath, "utf-8"));
      validation = validateMaterialisedAuthorityReferenceObject(parsed);
      blockers.push(...validation.blockers.map((item) => ({ ...item, severity: "blocking" })));
    } catch {
      blockers.push({ code: "materialised-source-invalid-json", severity: "blocking", reason: "Materialised authority/reference JSON could not be parsed." });
    }
  }

  const canPromote = blockers.length === 0 && !dryRun;
  let archivedTo = null;
  if (canPromote) {
    await mkdir(archiveRoot, { recursive: true });
    if (activeStatus.readable) {
      archivedTo = plannedArchivePath;
      await copyFile(activeSnapshotPath, archivedTo);
    }
    await copyFile(materialisedPath, activeSnapshotPath);
  }

  return {
    ok: dryRun ? blockers.length === 0 : canPromote,
    status: dryRun ? (blockers.length === 0 ? "promotion-dry-run-ready" : "promotion-dry-run-blocked") : (canPromote ? "promotion-completed" : "promotion-blocked"),
    dryRun,
    adminOnly: true,
    nonBootCritical: true,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    rawRowsExposed: false,
    rawGoogleResponseExposed: false,
    fullMaterialisedJsonExposed: false,
    materialisedSource: materialisedStatus,
    activeSnapshotBefore: activeStatus,
    archive: {
      archiveBeforeWriteRequired: true,
      archiveBeforeWriteLive: canPromote && activeStatus.readable,
      archivedTo: archivedTo ? "created" : null,
      plannedArchiveName,
      absoluteArchivePathReturned: false,
    },
    validation: validation
      ? { ok: validation.ok, summary: validation.summary, blockers: validation.blockers }
      : null,
    blockers,
    writePolicy: {
      activeSnapshotWriteEnabled: canPromote,
      dryRunWritesNothing: dryRun,
      reason: dryRun
        ? "Dry-run only. No archive or active snapshot write was attempted."
        : canPromote
          ? "Active snapshot was promoted only after materialised JSON validation and archive-before-write."
          : "Promotion blocked before active snapshot write.",
    },
  };
}

function publicRunSummary({ args, environment, materialiserResult, promotionResult = null }) {
  return {
    ok: materialiserResult.ok === true && (!promotionResult || promotionResult.ok === true),
    mode: args.apply ? (args.promote ? "apply-and-promote" : "apply-materialised-only") : "dry-run",
    adminOnly: true,
    nonBootCritical: true,
    normalBootDependency: false,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    credentialPathReturned: false,
    credentialValueReturned: false,
    credentialContentsReturned: false,
    sheetIdReturned: false,
    rawGoogleResponseExposed: false,
    rawSheetRowsExposed: false,
    fullMaterialisedJsonExposed: false,
    localSecretRoot: environment.secretsRoot,
    defaultCredentialsPathUsed: environment.defaultCredentialsPathUsed,
    sheetIdConfigured: environment.sheetIdConfigured,
    sheetIdSource: environment.sheetIdSource,
    materialiser: {
      ok: materialiserResult.ok,
      status: materialiserResult.status,
      dryRun: materialiserResult.dryRun,
      googleNetworkCallAttempted: materialiserResult.googleNetworkCallAttempted,
      materialisedWriteAttempted: materialiserResult.materialisedWriteAttempted,
      activeSnapshotWriteAttempted: materialiserResult.activeSnapshotWriteAttempted,
      validation: materialiserResult.validation,
      blockers: materialiserResult.blockers,
      writePolicy: materialiserResult.writePolicy,
    },
    promotion: promotionResult,
  };
}

export async function runAuthorityReferenceGoogleSyncCli(argv = process.argv.slice(2), baseEnv = process.env) {
  const args = parseSyncArgs(argv);
  if (args.help) {
    printUsage();
    return { exitCode: 0, printed: true };
  }

  const environment = await buildSyncEnvironment({ args, env: baseEnv });
  const materialiserResult = await refreshAuthorityReferenceMaterialiser({
    env: environment.env,
    dryRun: !args.apply,
    body: args.apply ? { confirmation: AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION } : {},
    allowMaterialisedWrite: args.apply,
  });

  let promotionResult = null;
  if (args.promote) {
    promotionResult = await promoteMaterialisedAuthorityReference({ dryRun: !args.apply });
  }

  const summary = publicRunSummary({ args, environment, materialiserResult, promotionResult });
  console.log(JSON.stringify(summary, null, 2));
  return { exitCode: summary.ok ? 0 : 1, summary };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) {
  runAuthorityReferenceGoogleSyncCli()
    .then(({ exitCode }) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(JSON.stringify({
        ok: false,
        status: "authority-reference-google-sync-cli-failed",
        reason: error?.message || "unknown_error",
        browserSecretsExposed: false,
        repoLocalSecrets: false,
        credentialContentsReturned: false,
        sheetIdReturned: false,
        rawGoogleResponseExposed: false,
        rawSheetRowsExposed: false,
        fullMaterialisedJsonExposed: false,
      }, null, 2));
      process.exitCode = 1;
    });
}
