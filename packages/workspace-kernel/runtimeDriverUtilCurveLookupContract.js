import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { win32 as pathWin32 } from "node:path";

import { AUTHORITY_REFERENCE_RUNTIME_DATA_HOME } from "./authorityReferenceMaterialiserService.js";

export const RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_ID =
  "controlstack.runtime.driver-util-curve.lookup-contract";
export const RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_VERSION = 1;

export const RUNTIME_DRIVER_UTIL_CURVE_DATA_HOME = pathWin32.join(
  AUTHORITY_REFERENCE_RUNTIME_DATA_HOME,
  "driver_util_curves",
);
export const RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_PATH = pathWin32.join(
  AUTHORITY_REFERENCE_RUNTIME_DATA_HOME,
  "driver_util_curves_manifest.json",
);

export const RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_ID =
  "controlstack.runtime.authority-reference.driver-util-curves-manifest";
export const RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_VERSION = 1;
export const RUNTIME_DRIVER_UTIL_CURVE_SOURCE_KIND = "driver_util_curve_json_static_mirror";
export const RUNTIME_DRIVER_UTIL_CURVE_SOURCE_ROOT_CLASSIFICATION = "donor-static-driver-util-source";
export const RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION = "donor-static-driver-util-mirror";

const DEFAULT_FS_API = Object.freeze({ stat, readdir, readFile });
const JSON_EXTENSION_PATTERN = /\.json$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SAFE_TOKEN_PATTERN = /^[A-Za-z0-9._\-\s]+$/;
const UNSAFE_FILENAME_PATTERN = /[<>:"/\\|?*\x00]/;

function immutableSafetyFlags(extra = {}) {
  return {
    raw_payload_returned: false,
    raw_curve_points_returned: false,
    rawDriverUtilPayloadsExposed: false,
    rawCurvePointsReturned: false,
    activeSnapshotMutated: false,
    runtimeDataMutated: false,
    donorFilesMutated: false,
    boardDataMakerImported: false,
    donorEngineInvoked: false,
    driverSizingImplemented: false,
    driverSelectionPerformed: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
    ...extra,
  };
}

function failClosed(blocker, reason, extra = {}) {
  return {
    ok: false,
    contract_id: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_VERSION,
    blocker,
    reason,
    raw_payload_returned: false,
    raw_curve_points_returned: false,
    safetyFlags: immutableSafetyFlags(),
    ...extra,
  };
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

function safeBasename(value) {
  return pathWin32.basename(String(value || "").trim());
}

export function normaliseRuntimeDriverUtilCurveFilename(value) {
  const original = String(value || "").trim();
  const filename = safeBasename(original);

  if (!original || original === "." || original === "..") {
    return { ok: false, blocker: "unsafe-filename", reason: "filename is empty or traversal-only" };
  }
  if (filename !== original) {
    return { ok: false, blocker: "unsafe-filename", reason: "filename must be a basename only" };
  }
  if (pathWin32.isAbsolute(original) || /^[A-Za-z]:/.test(original)) {
    return { ok: false, blocker: "unsafe-filename", reason: "filename must not be absolute" };
  }
  if (UNSAFE_FILENAME_PATTERN.test(original)) {
    return { ok: false, blocker: "unsafe-filename", reason: "filename contains reserved path characters" };
  }
  if (original.includes("..")) {
    return { ok: false, blocker: "unsafe-filename", reason: "filename must not contain traversal markers" };
  }
  if (!JSON_EXTENSION_PATTERN.test(filename)) {
    return { ok: false, blocker: "unsafe-filename", reason: "filename must end in .json" };
  }
  return { ok: true, filename };
}

function normaliseSafeToken(value, name) {
  const token = String(value || "").trim();
  if (!token) return { ok: true, token: "" };
  if (pathWin32.basename(token) !== token || pathWin32.isAbsolute(token) || /^[A-Za-z]:/.test(token)) {
    return { ok: false, blocker: "unsafe-filename", reason: `${name} token must not contain a path` };
  }
  if (token.includes("..") || /[<>:"/\\|?*\x00]/.test(token)) {
    return { ok: false, blocker: "unsafe-filename", reason: `${name} token contains unsafe characters` };
  }
  if (!SAFE_TOKEN_PATTERN.test(token)) {
    return { ok: false, blocker: "unsafe-filename", reason: `${name} token is outside the safe token contract` };
  }
  return { ok: true, token };
}

function sanitiseDriverModelToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function stripDriverUtilFilename(value) {
  const safe = normaliseRuntimeDriverUtilCurveFilename(value);
  if (!safe.ok) return null;
  return safe.filename.replace(/^driver_util_/i, "").replace(/\.json$/i, "").toLowerCase();
}

function normaliseCandidateLookup(candidate = {}) {
  const source = typeof candidate === "string" ? { token: candidate } : { ...candidate };
  const filename = source.filename || source.curve_filename || source.curveFilename || source.driver_util_filename || "";
  if (filename) {
    const safeFilename = normaliseRuntimeDriverUtilCurveFilename(filename);
    if (!safeFilename.ok) return safeFilename;
    return { ok: true, filename: safeFilename.filename, token: "" };
  }

  const rawToken =
    source.driver_model ||
    source.driverModel ||
    source.model ||
    source.driver ||
    source.token ||
    source.driver_util_token ||
    "";
  const safeToken = normaliseSafeToken(rawToken, "driver model");
  if (!safeToken.ok) return safeToken;
  if (!safeToken.token) {
    return {
      ok: false,
      blocker: "unsafe-filename",
      reason: "lookup requires a safe filename or driver model/token",
    };
  }

  if (JSON_EXTENSION_PATTERN.test(safeToken.token)) {
    const safeFilename = normaliseRuntimeDriverUtilCurveFilename(safeToken.token);
    if (!safeFilename.ok) return safeFilename;
    return { ok: true, filename: safeFilename.filename, token: "" };
  }

  const token = sanitiseDriverModelToken(safeToken.token);
  if (!token) {
    return {
      ok: false,
      blocker: "unsafe-filename",
      reason: "driver model/token normalised to an empty lookup token",
    };
  }
  return { ok: true, filename: "", token };
}

function manifestEntryRawSafe(entry) {
  return entry?.raw_payload_in_manifest === false;
}

function validateManifestEntry(entry, index) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return { ok: false, blocker: "invalid-manifest", reason: `manifest file entry ${index} is not an object` };
  }

  const safe = normaliseRuntimeDriverUtilCurveFilename(entry.filename);
  if (!safe.ok) return { ...safe, reason: `manifest file entry ${index}: ${safe.reason}` };

  const expectedRelativePath = `driver_util_curves/${safe.filename}`;
  if (String(entry.relative_path || "").replace(/\\/g, "/") !== expectedRelativePath) {
    return {
      ok: false,
      blocker: "invalid-manifest",
      reason: `manifest file entry ${index} has an invalid relative_path`,
    };
  }

  if (!Number.isInteger(entry.size_bytes) || entry.size_bytes < 0) {
    return {
      ok: false,
      blocker: "invalid-manifest",
      reason: `manifest file entry ${index} has an invalid size_bytes`,
    };
  }

  const checksum = String(entry.sha256 || "").trim().toLowerCase();
  if (!SHA256_PATTERN.test(checksum)) {
    return {
      ok: false,
      blocker: "invalid-manifest",
      reason: `manifest file entry ${index} has an invalid sha256`,
    };
  }

  if (entry.source_classification !== RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION) {
    return {
      ok: false,
      blocker: "invalid-manifest",
      reason: `manifest file entry ${index} has an invalid source_classification`,
    };
  }

  if (!manifestEntryRawSafe(entry)) {
    return {
      ok: false,
      blocker: "invalid-manifest",
      reason: `manifest file entry ${index} includes or permits raw payload`,
    };
  }

  return {
    ok: true,
    entry: {
      filename: safe.filename,
      relative_path: expectedRelativePath,
      size_bytes: entry.size_bytes,
      sha256: checksum,
      source_classification: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION,
      raw_payload_in_manifest: false,
      driver_model_slug: stripDriverUtilFilename(safe.filename),
    },
  };
}

export function validateRuntimeDriverUtilCurveLookupManifest(manifest) {
  const diagnostics = [];

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return failClosed("invalid-manifest", "manifest is not an object", { diagnostics, entries: [] });
  }
  if (manifest.schema_id !== RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_ID) {
    diagnostics.push("schema_id");
  }
  if (manifest.schema_version !== RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_VERSION) {
    diagnostics.push("schema_version");
  }
  if (manifest.source_kind !== RUNTIME_DRIVER_UTIL_CURVE_SOURCE_KIND) {
    diagnostics.push("source_kind");
  }
  if (manifest.source_root_classification !== RUNTIME_DRIVER_UTIL_CURVE_SOURCE_ROOT_CLASSIFICATION) {
    diagnostics.push("source_root_classification");
  }
  if (manifest.raw_driver_util_payloads_included !== false) {
    diagnostics.push("raw_driver_util_payloads_included");
  }
  if (manifest.active_snapshot_mutated !== false) {
    diagnostics.push("active_snapshot_mutated");
  }
  if (manifest.board_data_maker_imported !== false) {
    diagnostics.push("board_data_maker_imported");
  }
  if (manifest.donor_files_mutated !== false) {
    diagnostics.push("donor_files_mutated");
  }
  if (!Array.isArray(manifest.files)) {
    diagnostics.push("files");
  }
  if (Number(manifest.file_count) !== (Array.isArray(manifest.files) ? manifest.files.length : -1)) {
    diagnostics.push("file_count");
  }

  if (diagnostics.length > 0) {
    return failClosed("invalid-manifest", "manifest schema fields failed validation", {
      diagnostics,
      entries: [],
    });
  }

  const entries = [];
  const seen = new Set();
  for (const [index, entry] of manifest.files.entries()) {
    const valid = validateManifestEntry(entry, index);
    if (!valid.ok) return failClosed(valid.blocker, valid.reason, { diagnostics, entries: [] });
    const duplicateKey = valid.entry.filename.toLowerCase();
    if (seen.has(duplicateKey)) {
      return failClosed("invalid-manifest", `manifest duplicate filename: ${valid.entry.filename}`, {
        diagnostics: ["duplicate-filename"],
        entries: [],
      });
    }
    seen.add(duplicateKey);
    entries.push(valid.entry);
  }

  return {
    ok: true,
    contract_id: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_VERSION,
    manifest: {
      valid: true,
      fileCount: entries.length,
      declaredFileCount: manifest.file_count,
      checksumCoverageCount: entries.filter((entry) => SHA256_PATTERN.test(entry.sha256)).length,
      rawDriverUtilPayloadsIncluded: false,
      raw_payload_returned: false,
      raw_curve_points_returned: false,
    },
    entries,
    diagnostics,
    safetyFlags: immutableSafetyFlags(),
  };
}

async function safeStat(pathValue, expectedKind, fsApi = DEFAULT_FS_API) {
  try {
    const info = await fsApi.stat(pathValue);
    const readable = expectedKind === "directory" ? statIsDirectory(info) : statIsFile(info);
    return {
      exists: Boolean(info),
      readable,
      kind: expectedKind,
      size_bytes: Number.isFinite(info?.size) ? info.size : null,
      localPathReturned: false,
    };
  } catch (error) {
    return {
      exists: false,
      readable: false,
      kind: expectedKind,
      size_bytes: null,
      reason: error?.code || "unavailable",
      localPathReturned: false,
    };
  }
}

async function countDriverUtilJsonFiles(curveHome, fsApi = DEFAULT_FS_API) {
  try {
    const entries = await fsApi.readdir(curveHome, { withFileTypes: true });
    const filenames = entries
      .filter((entry) => (typeof entry === "string" ? true : entry?.isFile?.()))
      .map((entry) => safeBasename(typeof entry === "string" ? entry : entry.name))
      .filter((name) => JSON_EXTENSION_PATTERN.test(name));
    return { ok: true, count: filenames.length, raw_payload_returned: false, raw_curve_points_returned: false };
  } catch (error) {
    return {
      ok: false,
      count: 0,
      blocker: "missing-curve-home",
      reason: error?.code || "runtime driver util curve home could not be listed",
      raw_payload_returned: false,
      raw_curve_points_returned: false,
    };
  }
}

async function loadManifest(manifestPath, fsApi = DEFAULT_FS_API) {
  const manifestStatus = await safeStat(manifestPath, "file", fsApi);
  if (!manifestStatus.readable) {
    return failClosed("missing-manifest", manifestStatus.reason || "runtime driver util curve manifest is missing", {
      manifest: { exists: manifestStatus.exists, readable: false, localPathReturned: false },
    });
  }

  try {
    const parsed = JSON.parse(String(await fsApi.readFile(manifestPath, "utf-8") || ""));
    return { ok: true, manifest: parsed };
  } catch (error) {
    return failClosed("invalid-manifest", error?.name || "manifest parse failed", {
      manifest: { exists: true, readable: true, valid: false, localPathReturned: false },
    });
  }
}

export async function buildRuntimeDriverUtilCurveLookupContractStatus({
  curveHome = RUNTIME_DRIVER_UTIL_CURVE_DATA_HOME,
  manifestPath = RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_PATH,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const homeStatus = await safeStat(curveHome, "directory", fsApi);
  if (!homeStatus.readable) {
    return failClosed("missing-curve-home", homeStatus.reason || "runtime driver util curve home is missing", {
      runtime_driver_util_curve_home: {
        exists: homeStatus.exists,
        readable: false,
        curveFileCount: 0,
        localPathReturned: false,
      },
      manifest: { exists: false, readable: false, valid: false, fileCount: 0, localPathReturned: false },
    });
  }

  const listing = await countDriverUtilJsonFiles(curveHome, fsApi);
  if (!listing.ok) {
    return failClosed(listing.blocker, listing.reason, {
      runtime_driver_util_curve_home: {
        exists: true,
        readable: false,
        curveFileCount: 0,
        localPathReturned: false,
      },
    });
  }

  const loaded = await loadManifest(manifestPath, fsApi);
  if (!loaded.ok) {
    return {
      ...loaded,
      runtime_driver_util_curve_home: {
        exists: true,
        readable: true,
        curveFileCount: listing.count,
        localPathReturned: false,
      },
    };
  }

  const validated = validateRuntimeDriverUtilCurveLookupManifest(loaded.manifest);
  if (!validated.ok) {
    return {
      ...validated,
      runtime_driver_util_curve_home: {
        exists: true,
        readable: true,
        curveFileCount: listing.count,
        localPathReturned: false,
      },
      manifest: {
        exists: true,
        readable: true,
        valid: false,
        fileCount: 0,
        checksumCoverageCount: 0,
        rawDriverUtilPayloadsIncluded: false,
        raw_payload_returned: false,
        raw_curve_points_returned: false,
        localPathReturned: false,
      },
    };
  }

  return {
    ok: true,
    contract_id: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_VERSION,
    source_kind: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_KIND,
    source_root_classification: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_ROOT_CLASSIFICATION,
    runtime_driver_util_curve_home: {
      exists: true,
      readable: true,
      curveFileCount: listing.count,
      localPathReturned: false,
    },
    manifest: {
      exists: true,
      readable: true,
      valid: true,
      fileCount: validated.entries.length,
      declaredFileCount: loaded.manifest.file_count,
      checksumCoverageCount: validated.entries.length,
      rawDriverUtilPayloadsIncluded: false,
      raw_payload_returned: false,
      raw_curve_points_returned: false,
      localPathReturned: false,
    },
    diagnostics: [],
    safetyFlags: immutableSafetyFlags(),
  };
}

function resolveManifestMatches(candidate, entries) {
  const normalised = normaliseCandidateLookup(candidate);
  if (!normalised.ok) return normalised;

  if (normalised.filename) {
    return {
      ok: true,
      lookup_method: "exact-filename",
      matches: entries.filter((entry) => entry.filename.toLowerCase() === normalised.filename.toLowerCase()),
    };
  }

  return {
    ok: true,
    lookup_method: "safe-driver-model-token",
    matches: entries.filter((entry) => {
      const slug = entry.driver_model_slug || stripDriverUtilFilename(entry.filename) || "";
      return slug === normalised.token || slug.includes(normalised.token);
    }),
  };
}

async function verifyManifestEntryFile(entry, curveHome, fsApi = DEFAULT_FS_API) {
  const filePath = pathWin32.join(curveHome, entry.filename);
  const fileStatus = await safeStat(filePath, "file", fsApi);
  if (!fileStatus.readable) {
    return failClosed("missing-file", fileStatus.reason || "manifest driver util curve file is missing", {
      filename: entry.filename,
    });
  }
  if (Number(fileStatus.size_bytes) !== Number(entry.size_bytes)) {
    return failClosed("checksum-mismatch", "driver util curve file size does not match manifest", {
      filename: entry.filename,
    });
  }

  try {
    const payload = await fsApi.readFile(filePath);
    const checksum = sha256Hex(payload);
    if (checksum !== entry.sha256) {
      return failClosed("checksum-mismatch", "driver util curve file sha256 does not match manifest", {
        filename: entry.filename,
      });
    }
  } catch (error) {
    return failClosed("missing-file", error?.code || "manifest driver util curve file could not be read", {
      filename: entry.filename,
    });
  }

  return {
    ok: true,
    metadata: {
      filename: entry.filename,
      size_bytes: entry.size_bytes,
      sha256: entry.sha256,
      source_classification: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION,
      raw_payload_returned: false,
      raw_curve_points_returned: false,
    },
  };
}

export async function resolveRuntimeDriverUtilCurveLookup({
  candidate = {},
  curveHome = RUNTIME_DRIVER_UTIL_CURVE_DATA_HOME,
  manifestPath = RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_PATH,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const status = await buildRuntimeDriverUtilCurveLookupContractStatus({ curveHome, manifestPath, fsApi });
  if (!status.ok) return status;

  const loaded = await loadManifest(manifestPath, fsApi);
  if (!loaded.ok) return loaded;
  const validated = validateRuntimeDriverUtilCurveLookupManifest(loaded.manifest);
  if (!validated.ok) return validated;

  const resolved = resolveManifestMatches(candidate, validated.entries);
  if (!resolved.ok) return failClosed(resolved.blocker, resolved.reason);

  if (resolved.matches.length === 0) {
    return failClosed("missing-file", "no manifest driver util curve entry matched the safe lookup contract", {
      lookup_method: resolved.lookup_method,
      match_count: 0,
    });
  }
  if (resolved.matches.length > 1) {
    return failClosed("ambiguous-match", "safe lookup contract matched more than one driver util curve file", {
      lookup_method: resolved.lookup_method,
      match_count: resolved.matches.length,
    });
  }

  const verified = await verifyManifestEntryFile(resolved.matches[0], curveHome, fsApi);
  if (!verified.ok) {
    return {
      ...verified,
      lookup_method: resolved.lookup_method,
      match_count: 1,
    };
  }

  return {
    ok: true,
    contract_id: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_DRIVER_UTIL_CURVE_LOOKUP_CONTRACT_VERSION,
    lookup_method: resolved.lookup_method,
    match_count: 1,
    curve: verified.metadata,
    raw_payload_returned: false,
    raw_curve_points_returned: false,
    safetyFlags: immutableSafetyFlags(),
  };
}
