import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { win32 as pathWin32 } from "node:path";

import { AUTHORITY_REFERENCE_RUNTIME_DATA_HOME } from "./authorityReferenceMaterialiserService.js";

export const RUNTIME_LUMEN_CURVE_DATA_HOME = pathWin32.join(
  AUTHORITY_REFERENCE_RUNTIME_DATA_HOME,
  "lumen_curves",
);
export const RUNTIME_LUMEN_CURVE_MANIFEST_PATH = pathWin32.join(
  AUTHORITY_REFERENCE_RUNTIME_DATA_HOME,
  "lumen_curves_manifest.json",
);

export const RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_ID =
  "controlstack.runtime.authority-reference.lumen-curves-manifest";
export const RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_VERSION = 1;
export const RUNTIME_LUMEN_CURVE_SOURCE_KIND = "lumen_curve_csv_static_mirror";
export const RUNTIME_LUMEN_CURVE_SOURCE_ROOT_CLASSIFICATION = "runtime-authority-reference";
export const RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION = "donor-static-mirror";
export const RUNTIME_LUMEN_CURVE_HOME_LABEL = "runtime-authority-reference-lumen-curves";
export const RUNTIME_LUMEN_CURVE_MANIFEST_LABEL = "runtime-authority-reference-lumen-curves-manifest";

const DEFAULT_FS_API = Object.freeze({ stat, readdir, readFile });
const CSV_EXTENSION_PATTERN = /\.csv$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function safeTimestamp(now = Date.now()) {
  if (now instanceof Date) return now.toISOString();
  const parsed = new Date(now);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function safeBasename(value) {
  return pathWin32.basename(String(value || "").trim());
}

function isCsvFilename(value) {
  return CSV_EXTENSION_PATTERN.test(safeBasename(value));
}

function normaliseRelativePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return Buffer.from(String(value || ""));
}

function sha256Hex(value) {
  return createHash("sha256").update(toBuffer(value)).digest("hex");
}

function statIsFile(info) {
  return Boolean(info?.isFile?.());
}

function statIsDirectory(info) {
  return Boolean(info?.isDirectory?.());
}

function publicStatMetadata(info, expectedKind) {
  const isDirectory = statIsDirectory(info);
  const isFile = statIsFile(info);
  const expectedPresent = expectedKind === "directory" ? isDirectory : isFile;

  return {
    exists: Boolean(info),
    readable: expectedPresent,
    kind: expectedKind,
    sizeBytes: Number.isFinite(info?.size) ? info.size : null,
    modifiedAt: info?.mtime?.toISOString?.() || null,
    localPathReturned: false,
  };
}

async function safeStat(pathValue, expectedKind, fsApi = DEFAULT_FS_API) {
  try {
    const info = await fsApi.stat(pathValue);
    return publicStatMetadata(info, expectedKind);
  } catch (error) {
    return {
      exists: false,
      readable: false,
      kind: expectedKind,
      sizeBytes: null,
      modifiedAt: null,
      reason: error?.code || "unavailable",
      localPathReturned: false,
    };
  }
}

function entryName(entry) {
  return safeBasename(typeof entry === "string" ? entry : entry?.name);
}

function entryIsFile(entry) {
  if (typeof entry === "string") return true;
  if (typeof entry?.isFile === "function") return entry.isFile();
  return false;
}

async function listCurveCsvFilenames(curveHome = RUNTIME_LUMEN_CURVE_DATA_HOME, fsApi = DEFAULT_FS_API) {
  try {
    const entries = await fsApi.readdir(curveHome, { withFileTypes: true });
    return {
      ok: true,
      filenames: entries
        .filter((entry) => entryIsFile(entry))
        .map((entry) => entryName(entry))
        .filter((name) => isCsvFilename(name))
        .sort((left, right) => left.localeCompare(right)),
      rawCurvePayloadsExposed: false,
    };
  } catch (error) {
    return {
      ok: false,
      filenames: [],
      reason: error?.code || "unavailable",
      rawCurvePayloadsExposed: false,
    };
  }
}

function normaliseManifestEntry(file) {
  const filename = safeBasename(file?.filename || file?.name);
  const relativePath = normaliseRelativePath(file?.relative_path || file?.relativePath || pathWin32.join("lumen_curves", filename));
  const sha256 = String(file?.sha256 || "").trim().toLowerCase();

  return {
    filename,
    relative_path: relativePath,
    size_bytes: Number.isFinite(file?.size_bytes) ? file.size_bytes : Number(file?.sizeBytes || 0),
    sha256,
    source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
    raw_payload_in_manifest: false,
  };
}

export function buildRuntimeLumenCurveManifest({ files = [], generatedAt = Date.now() } = {}) {
  const manifestFiles = files
    .map((file) => normaliseManifestEntry(file))
    .filter((file) => Boolean(file.filename) && isCsvFilename(file.filename))
    .sort((left, right) => left.filename.localeCompare(right.filename));

  return {
    schema_id: RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_ID,
    schema_version: RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_VERSION,
    source_kind: RUNTIME_LUMEN_CURVE_SOURCE_KIND,
    source_root_classification: RUNTIME_LUMEN_CURVE_SOURCE_ROOT_CLASSIFICATION,
    generated_at: safeTimestamp(generatedAt),
    file_count: manifestFiles.length,
    files: manifestFiles,
    raw_curve_rows_included: false,
    active_snapshot_mutated: false,
    board_data_maker_imported: false,
  };
}

export async function buildRuntimeLumenCurveManifestFromHome({
  curveHome = RUNTIME_LUMEN_CURVE_DATA_HOME,
  fsApi = DEFAULT_FS_API,
  generatedAt = Date.now(),
} = {}) {
  const homeStatus = await safeStat(curveHome, "directory", fsApi);
  if (!homeStatus.readable) {
    return {
      ok: false,
      blocker: "runtime-lumen-curve-home-unavailable",
      reason: homeStatus.reason || "Runtime lumen curve home is not available as a readable directory.",
      rawCurvePayloadsExposed: false,
      activeSnapshotMutated: false,
      boardDataMakerImported: false,
    };
  }

  const listing = await listCurveCsvFilenames(curveHome, fsApi);
  if (!listing.ok) {
    return {
      ok: false,
      blocker: "runtime-lumen-curve-home-not-listable",
      reason: listing.reason || "Runtime lumen curve home could not be listed.",
      rawCurvePayloadsExposed: false,
      activeSnapshotMutated: false,
      boardDataMakerImported: false,
    };
  }

  const files = [];
  for (const filename of listing.filenames) {
    const filePath = pathWin32.join(curveHome, filename);
    const payload = await fsApi.readFile(filePath);
    const buffer = toBuffer(payload);
    files.push({
      filename,
      relative_path: normaliseRelativePath(pathWin32.join("lumen_curves", filename)),
      size_bytes: buffer.length,
      sha256: sha256Hex(buffer),
      source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
      raw_payload_in_manifest: false,
    });
  }

  return {
    ok: true,
    manifest: buildRuntimeLumenCurveManifest({ files, generatedAt }),
    checksumCoverageCount: files.filter((file) => SHA256_PATTERN.test(file.sha256)).length,
    rawCurvePayloadsExposed: false,
    activeSnapshotMutated: false,
    boardDataMakerImported: false,
  };
}

function parseManifest(text) {
  try {
    const parsed = JSON.parse(String(text || ""));
    return { ok: true, manifest: parsed };
  } catch (error) {
    return { ok: false, reason: error?.name || "manifest-parse-failed" };
  }
}

function manifestFiles(manifest) {
  return Array.isArray(manifest?.files) ? manifest.files : [];
}

function checksumCoverageCount(manifest) {
  return manifestFiles(manifest).filter((file) => SHA256_PATTERN.test(String(file?.sha256 || ""))).length;
}

function manifestRawPayloadSafe(manifest) {
  if (manifest?.raw_curve_rows_included !== false) return false;
  return manifestFiles(manifest).every((file) => file?.raw_payload_in_manifest === false);
}

function manifestShapeValid(manifest) {
  if (!manifest || typeof manifest !== "object") return false;
  if (manifest.schema_id !== RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_ID) return false;
  if (manifest.schema_version !== RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_VERSION) return false;
  if (manifest.source_kind !== RUNTIME_LUMEN_CURVE_SOURCE_KIND) return false;
  if (manifest.source_root_classification !== RUNTIME_LUMEN_CURVE_SOURCE_ROOT_CLASSIFICATION) return false;
  if (manifest.active_snapshot_mutated !== false) return false;
  if (manifest.board_data_maker_imported !== false) return false;
  if (!manifestRawPayloadSafe(manifest)) return false;
  return Number(manifest.file_count) === manifestFiles(manifest).length;
}

async function readManifestStatus(manifestPath = RUNTIME_LUMEN_CURVE_MANIFEST_PATH, fsApi = DEFAULT_FS_API) {
  const statStatus = await safeStat(manifestPath, "file", fsApi);
  if (!statStatus.readable) {
    return {
      ...statStatus,
      valid: false,
      fileCount: 0,
      checksumCoverageCount: 0,
      rawCurveRowsIncluded: false,
      rawCurvePayloadsExposed: false,
    };
  }

  try {
    const parsed = parseManifest(await fsApi.readFile(manifestPath, "utf-8"));
    if (!parsed.ok) {
      return {
        ...statStatus,
        valid: false,
        fileCount: 0,
        checksumCoverageCount: 0,
        rawCurveRowsIncluded: false,
        rawCurvePayloadsExposed: false,
        reason: parsed.reason,
      };
    }

    return {
      ...statStatus,
      valid: manifestShapeValid(parsed.manifest),
      fileCount: manifestFiles(parsed.manifest).length,
      declaredFileCount: Number.isFinite(parsed.manifest?.file_count) ? parsed.manifest.file_count : null,
      checksumCoverageCount: checksumCoverageCount(parsed.manifest),
      rawCurveRowsIncluded: parsed.manifest?.raw_curve_rows_included === true,
      rawCurvePayloadsExposed: false,
    };
  } catch (error) {
    return {
      ...statStatus,
      valid: false,
      fileCount: 0,
      checksumCoverageCount: 0,
      rawCurveRowsIncluded: false,
      rawCurvePayloadsExposed: false,
      reason: error?.code || "manifest-unreadable",
    };
  }
}

export async function buildRuntimeLumenCurveDataHomeStatus({
  curveHome = RUNTIME_LUMEN_CURVE_DATA_HOME,
  manifestPath = RUNTIME_LUMEN_CURVE_MANIFEST_PATH,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const home = await safeStat(curveHome, "directory", fsApi);
  const listing = home.readable ? await listCurveCsvFilenames(curveHome, fsApi) : { ok: false, filenames: [], reason: home.reason };
  const manifest = await readManifestStatus(manifestPath, fsApi);

  return {
    status_id: "runtime-lumen-curve-data-home-status",
    source_kind: RUNTIME_LUMEN_CURVE_SOURCE_KIND,
    source_root_classification: RUNTIME_LUMEN_CURVE_SOURCE_ROOT_CLASSIFICATION,
    runtime_curve_home: {
      label: RUNTIME_LUMEN_CURVE_HOME_LABEL,
      exists: home.exists,
      readable: home.readable,
      curveFileCount: listing.filenames.length,
      localPathReturned: false,
    },
    manifest: {
      label: RUNTIME_LUMEN_CURVE_MANIFEST_LABEL,
      exists: manifest.exists,
      readable: manifest.readable,
      valid: manifest.valid,
      fileCount: manifest.fileCount,
      declaredFileCount: manifest.declaredFileCount ?? null,
      checksumCoverageCount: manifest.checksumCoverageCount,
      rawCurveRowsIncluded: manifest.rawCurveRowsIncluded,
      rawCurvePayloadsExposed: false,
      localPathReturned: false,
    },
    safetyFlags: {
      rawCurvePayloadsExposed: false,
      rawCurveRowsIncluded: false,
      activeSnapshotMutated: false,
      boardDataMakerImported: false,
      donorFilesMutated: false,
      runtimeDataMutationEnabled: false,
      publicRouteAdded: false,
      postEndpointAdded: false,
    },
  };
}
