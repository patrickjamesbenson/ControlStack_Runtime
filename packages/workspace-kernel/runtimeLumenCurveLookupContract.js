import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { win32 as pathWin32 } from "node:path";

import {
  RUNTIME_LUMEN_CURVE_DATA_HOME,
  RUNTIME_LUMEN_CURVE_MANIFEST_PATH,
  RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_ID,
  RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_VERSION,
  RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
  RUNTIME_LUMEN_CURVE_SOURCE_KIND,
  RUNTIME_LUMEN_CURVE_SOURCE_ROOT_CLASSIFICATION,
} from "./runtimeLumenCurveDataHomeStatusService.js";

export const RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_ID =
  "controlstack.runtime.lumen-curve.lookup-contract";
export const RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_VERSION = 1;

const DEFAULT_FS_API = Object.freeze({ stat, readdir, readFile });
const CSV_EXTENSION_PATTERN = /\.csv$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SAFE_TOKEN_PATTERN = /^[A-Za-z0-9._-]+$/;
const UNSAFE_FILENAME_PATTERN = /[<>:"/\\|?*\x00]/;

function immutableSafetyFlags(extra = {}) {
  return {
    raw_payload_returned: false,
    raw_curve_rows_returned: false,
    rawCurvePayloadsExposed: false,
    rawCurveRowsReturned: false,
    activeSnapshotMutated: false,
    runtimeDataMutated: false,
    donorFilesMutated: false,
    boardDataMakerImported: false,
    donorEngineInvoked: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
    ...extra,
  };
}

function failClosed(blocker, reason, extra = {}) {
  return {
    ok: false,
    contract_id: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_VERSION,
    blocker,
    reason,
    raw_payload_returned: false,
    raw_curve_rows_returned: false,
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

export function normaliseRuntimeLumenCurveFilename(value) {
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
  if (!CSV_EXTENSION_PATTERN.test(filename)) {
    return { ok: false, blocker: "unsafe-filename", reason: "filename must end in .csv" };
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

function normalisePartNumber(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-z]/g, "");
}

function normalisePitchToken(value) {
  return String(value || "").trim().replace(/\./g, "p");
}

function normaliseLengthToken(value) {
  const token = String(value || "").trim();
  if (!token) return "";
  const parsed = Number(token);
  return Number.isFinite(parsed) ? String(Math.trunc(parsed)) : token;
}

function normaliseCandidateTokenFields(candidate = {}) {
  const source = typeof candidate === "string" ? { filename: candidate } : { ...candidate };
  const fieldPairs = [
    ["chip", source.chip || source.led_chip],
    ["cct", source.cct || source.c1_cct],
    ["pitch", source.pitch || source.pitch_mm],
    ["length_mm", source.length_mm || source.board_length_mm],
    ["architecture_id", source.architecture_id || source.arch_id],
    ["part_number", source.part_number || source.pn],
  ];

  const fields = {};
  for (const [name, value] of fieldPairs) {
    const safe = normaliseSafeToken(value, name);
    if (!safe.ok) return safe;
    fields[name] = safe.token;
  }

  return {
    ok: true,
    filename: source.filename || source.curve_filename || source.curveFilename || "",
    fields: {
      chip: fields.chip,
      cct: fields.cct,
      pitch: normalisePitchToken(fields.pitch),
      length_mm: normaliseLengthToken(fields.length_mm),
      architecture_id: fields.architecture_id,
      part_number: fields.part_number,
      part_number_norm: normalisePartNumber(fields.part_number),
    },
  };
}

function parseCurveFilenameConvention(filename) {
  const safe = normaliseRuntimeLumenCurveFilename(filename);
  if (!safe.ok) return null;

  const match = safe.filename.match(/^([^_]+)_([^_]+)_([^_]+)_([0-9]+)_([^_]+)__PN_(.+)\.csv$/i);
  if (!match) return null;

  return {
    filename: safe.filename,
    chip: match[1],
    cct: match[2],
    pitch: match[3],
    length_mm: match[4],
    architecture_id: match[5],
    part_number: match[6],
    part_number_norm: normalisePartNumber(match[6]),
  };
}

function manifestEntryRawSafe(entry) {
  return entry?.raw_payload_in_manifest === false;
}

function validateManifestEntry(entry, index) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return { ok: false, blocker: "invalid-manifest", reason: `manifest file entry ${index} is not an object` };
  }

  const safe = normaliseRuntimeLumenCurveFilename(entry.filename);
  if (!safe.ok) return { ...safe, reason: `manifest file entry ${index}: ${safe.reason}` };

  const expectedRelativePath = `lumen_curves/${safe.filename}`;
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

  if (entry.source_classification !== RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION) {
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
      source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
      raw_payload_in_manifest: false,
      convention: parseCurveFilenameConvention(safe.filename),
    },
  };
}

export function validateRuntimeLumenCurveLookupManifest(manifest) {
  const diagnostics = [];

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return failClosed("invalid-manifest", "manifest is not an object", { diagnostics, entries: [] });
  }
  if (manifest.schema_id !== RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_ID) {
    diagnostics.push("schema_id");
  }
  if (manifest.schema_version !== RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_VERSION) {
    diagnostics.push("schema_version");
  }
  if (manifest.source_kind !== RUNTIME_LUMEN_CURVE_SOURCE_KIND) {
    diagnostics.push("source_kind");
  }
  if (manifest.source_root_classification !== RUNTIME_LUMEN_CURVE_SOURCE_ROOT_CLASSIFICATION) {
    diagnostics.push("source_root_classification");
  }
  if (manifest.raw_curve_rows_included !== false) {
    diagnostics.push("raw_curve_rows_included");
  }
  if (manifest.active_snapshot_mutated !== false) {
    diagnostics.push("active_snapshot_mutated");
  }
  if (manifest.board_data_maker_imported !== false) {
    diagnostics.push("board_data_maker_imported");
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
    contract_id: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_VERSION,
    manifest: {
      valid: true,
      fileCount: entries.length,
      declaredFileCount: manifest.file_count,
      checksumCoverageCount: entries.filter((entry) => SHA256_PATTERN.test(entry.sha256)).length,
      rawCurveRowsIncluded: false,
      raw_payload_returned: false,
      raw_curve_rows_returned: false,
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

async function countCurveCsvFiles(curveHome, fsApi = DEFAULT_FS_API) {
  try {
    const entries = await fsApi.readdir(curveHome, { withFileTypes: true });
    const filenames = entries
      .filter((entry) => (typeof entry === "string" ? true : entry?.isFile?.()))
      .map((entry) => safeBasename(typeof entry === "string" ? entry : entry.name))
      .filter((name) => CSV_EXTENSION_PATTERN.test(name));
    return { ok: true, count: filenames.length, raw_payload_returned: false, raw_curve_rows_returned: false };
  } catch (error) {
    return {
      ok: false,
      count: 0,
      blocker: "missing-curve-home",
      reason: error?.code || "runtime curve home could not be listed",
      raw_payload_returned: false,
      raw_curve_rows_returned: false,
    };
  }
}

async function loadManifest(manifestPath, fsApi = DEFAULT_FS_API) {
  const manifestStatus = await safeStat(manifestPath, "file", fsApi);
  if (!manifestStatus.readable) {
    return failClosed("missing-manifest", manifestStatus.reason || "runtime lumen curve manifest is missing", {
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

export async function buildRuntimeLumenCurveLookupContractStatus({
  curveHome = RUNTIME_LUMEN_CURVE_DATA_HOME,
  manifestPath = RUNTIME_LUMEN_CURVE_MANIFEST_PATH,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const homeStatus = await safeStat(curveHome, "directory", fsApi);
  if (!homeStatus.readable) {
    return failClosed("missing-curve-home", homeStatus.reason || "runtime lumen curve home is missing", {
      runtime_curve_home: {
        exists: homeStatus.exists,
        readable: false,
        curveFileCount: 0,
        localPathReturned: false,
      },
      manifest: { exists: false, readable: false, valid: false, fileCount: 0, localPathReturned: false },
    });
  }

  const listing = await countCurveCsvFiles(curveHome, fsApi);
  if (!listing.ok) {
    return failClosed(listing.blocker, listing.reason, {
      runtime_curve_home: {
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
      runtime_curve_home: {
        exists: true,
        readable: true,
        curveFileCount: listing.count,
        localPathReturned: false,
      },
    };
  }

  const validated = validateRuntimeLumenCurveLookupManifest(loaded.manifest);
  if (!validated.ok) {
    return {
      ...validated,
      runtime_curve_home: {
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
        rawCurveRowsIncluded: false,
        raw_payload_returned: false,
        raw_curve_rows_returned: false,
        localPathReturned: false,
      },
    };
  }

  return {
    ok: true,
    contract_id: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_VERSION,
    source_kind: RUNTIME_LUMEN_CURVE_SOURCE_KIND,
    source_root_classification: RUNTIME_LUMEN_CURVE_SOURCE_ROOT_CLASSIFICATION,
    runtime_curve_home: {
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
      rawCurveRowsIncluded: false,
      raw_payload_returned: false,
      raw_curve_rows_returned: false,
      localPathReturned: false,
    },
    diagnostics: [],
    safetyFlags: immutableSafetyFlags(),
  };
}

function candidateMatchesEntry(candidateFields, entry) {
  const convention = entry.convention || parseCurveFilenameConvention(entry.filename);
  if (!convention) {
    if (candidateFields.part_number_norm) {
      return normalisePartNumber(entry.filename).includes(candidateFields.part_number_norm);
    }
    return false;
  }

  const checks = [
    [candidateFields.chip, convention.chip],
    [candidateFields.cct, convention.cct],
    [candidateFields.pitch, convention.pitch],
    [candidateFields.length_mm, convention.length_mm],
    [candidateFields.architecture_id, convention.architecture_id],
  ];

  for (const [wanted, actual] of checks) {
    if (wanted && String(wanted).toLowerCase() !== String(actual || "").toLowerCase()) return false;
  }
  if (candidateFields.part_number_norm && candidateFields.part_number_norm !== convention.part_number_norm) {
    return false;
  }

  return checks.some(([wanted]) => Boolean(wanted)) || Boolean(candidateFields.part_number_norm);
}

function resolveManifestMatches(candidate, entries) {
  const normalised = normaliseCandidateTokenFields(candidate);
  if (!normalised.ok) return normalised;

  if (normalised.filename) {
    const safeFilename = normaliseRuntimeLumenCurveFilename(normalised.filename);
    if (!safeFilename.ok) return safeFilename;
    return {
      ok: true,
      lookup_method: "exact-filename",
      matches: entries.filter((entry) => entry.filename.toLowerCase() === safeFilename.filename.toLowerCase()),
    };
  }

  const tokenCount = Object.entries(normalised.fields).filter(
    ([key, value]) => key !== "part_number_norm" && Boolean(value),
  ).length;
  if (!normalised.fields.part_number_norm && tokenCount === 0) {
    return {
      ok: false,
      blocker: "unsafe-filename",
      reason: "lookup requires a safe filename or at least one safe identifying token",
    };
  }

  return {
    ok: true,
    lookup_method: "safe-token-contract",
    matches: entries.filter((entry) => candidateMatchesEntry(normalised.fields, entry)),
  };
}

async function verifyManifestEntryFile(entry, curveHome, fsApi = DEFAULT_FS_API) {
  const filePath = pathWin32.join(curveHome, entry.filename);
  const fileStatus = await safeStat(filePath, "file", fsApi);
  if (!fileStatus.readable) {
    return failClosed("missing-file", fileStatus.reason || "manifest curve file is missing", {
      filename: entry.filename,
    });
  }
  if (Number(fileStatus.size_bytes) !== Number(entry.size_bytes)) {
    return failClosed("checksum-mismatch", "curve file size does not match manifest", {
      filename: entry.filename,
    });
  }

  try {
    const payload = await fsApi.readFile(filePath);
    const checksum = sha256Hex(payload);
    if (checksum !== entry.sha256) {
      return failClosed("checksum-mismatch", "curve file sha256 does not match manifest", {
        filename: entry.filename,
      });
    }
  } catch (error) {
    return failClosed("missing-file", error?.code || "manifest curve file could not be read", {
      filename: entry.filename,
    });
  }

  return {
    ok: true,
    metadata: {
      filename: entry.filename,
      size_bytes: entry.size_bytes,
      sha256: entry.sha256,
      source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
      raw_payload_returned: false,
      raw_curve_rows_returned: false,
    },
  };
}

export async function resolveRuntimeLumenCurveLookup({
  candidate = {},
  curveHome = RUNTIME_LUMEN_CURVE_DATA_HOME,
  manifestPath = RUNTIME_LUMEN_CURVE_MANIFEST_PATH,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const status = await buildRuntimeLumenCurveLookupContractStatus({ curveHome, manifestPath, fsApi });
  if (!status.ok) return status;

  const loaded = await loadManifest(manifestPath, fsApi);
  if (!loaded.ok) return loaded;
  const validated = validateRuntimeLumenCurveLookupManifest(loaded.manifest);
  if (!validated.ok) return validated;

  const resolved = resolveManifestMatches(candidate, validated.entries);
  if (!resolved.ok) return failClosed(resolved.blocker, resolved.reason);

  if (resolved.matches.length === 0) {
    return failClosed("missing-file", "no manifest curve entry matched the safe lookup contract", {
      lookup_method: resolved.lookup_method,
      match_count: 0,
    });
  }
  if (resolved.matches.length > 1) {
    return failClosed("ambiguous-match", "safe lookup contract matched more than one curve file", {
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
    contract_id: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_ID,
    contract_version: RUNTIME_LUMEN_CURVE_LOOKUP_CONTRACT_VERSION,
    lookup_method: resolved.lookup_method,
    match_count: 1,
    curve: verified.metadata,
    raw_payload_returned: false,
    raw_curve_rows_returned: false,
    safetyFlags: immutableSafetyFlags(),
  };
}
