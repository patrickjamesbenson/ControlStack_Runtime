import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { win32 as pathWin32 } from "node:path";

import { RUNTIME_LUMEN_CURVE_DATA_HOME } from "./runtimeLumenCurveDataHomeStatusService.js";
import { normaliseRuntimeLumenCurveFilename } from "./runtimeLumenCurveLookupContract.js";

export const RUNTIME_LUMEN_CURVE_PARSE_INTERPOLATION_CONTRACT_ID =
  "controlstack.runtime.lumen-curve.parse-interpolation-contract";
export const RUNTIME_LUMEN_CURVE_PARSE_INTERPOLATION_CONTRACT_VERSION = 1;

const DEFAULT_FS_API = Object.freeze({ readFile, stat });
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const TEMP_LOW_C = 25.0;
const TEMP_HIGH_C = 65.0;

const CURRENT_COLUMN_ALIASES = new Set(["ma", "current_ma", "currentma", "current_ma"]);
const LUMEN_25C_COLUMN_ALIASES = new Set(["c1_lm_per_m_25c", "lm_per_m_25c", "lm_per_m_25"]);
const LUMEN_65C_COLUMN_ALIASES = new Set(["c1_lm_per_m_65c", "lm_per_m_65c", "lm_per_m_65"]);

function immutableSafetyFlags(extra = {}) {
  return {
    raw_payload_returned: false,
    raw_curve_rows_returned: false,
    full_curve_returned: false,
    rawCurvePayloadsExposed: false,
    rawCurveRowsReturned: false,
    fullCurveReturned: false,
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

function safeSummaryBase(extra = {}) {
  return {
    contract_id: RUNTIME_LUMEN_CURVE_PARSE_INTERPOLATION_CONTRACT_ID,
    contract_version: RUNTIME_LUMEN_CURVE_PARSE_INTERPOLATION_CONTRACT_VERSION,
    raw_payload_returned: false,
    raw_curve_rows_returned: false,
    full_curve_returned: false,
    safetyFlags: immutableSafetyFlags(),
    ...extra,
  };
}

function failClosed(blocker, reason, extra = {}) {
  return safeSummaryBase({
    ok: false,
    blocker,
    reason,
    filename: extra.filename || null,
    point_count: 0,
    column_classification: extra.column_classification || null,
    interpolation_supported: false,
    checksum_verified: false,
    ...extra,
  });
}

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return Buffer.from(String(value || ""));
}

function sha256Hex(value) {
  return createHash("sha256").update(toBuffer(value)).digest("hex");
}

function normaliseHeaderKey(value) {
  return String(value || "")
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(cell.trim());
      cell = "";
      continue;
    }
    cell += char;
  }

  cells.push(cell.trim());
  return cells;
}

function classifyColumns(headerColumns = []) {
  const columns = headerColumns.map((sourceName, index) => ({
    index,
    sourceName: String(sourceName || "").trim().replace(/^\uFEFF/, ""),
    normalised: normaliseHeaderKey(sourceName),
  }));

  const currentCandidates = columns.filter((column) => CURRENT_COLUMN_ALIASES.has(column.normalised));
  const lumen25Candidates = columns.filter((column) => LUMEN_25C_COLUMN_ALIASES.has(column.normalised));
  const lumen65Candidates = columns.filter((column) => LUMEN_65C_COLUMN_ALIASES.has(column.normalised));

  const classification = {
    current_column: currentCandidates.length === 1 ? currentCandidates[0].sourceName : null,
    lumen_25c_column: lumen25Candidates.length === 1 ? lumen25Candidates[0].sourceName : null,
    lumen_65c_column: lumen65Candidates.length === 1 ? lumen65Candidates[0].sourceName : null,
    current_column_count: currentCandidates.length,
    lumen_25c_column_count: lumen25Candidates.length,
    lumen_65c_column_count: lumen65Candidates.length,
    ignored_column_count:
      columns.length - currentCandidates.length - lumen25Candidates.length - lumen65Candidates.length,
    supported: currentCandidates.length === 1 && lumen25Candidates.length === 1 && lumen65Candidates.length === 1,
  };

  return {
    classification,
    currentIndex: currentCandidates.length === 1 ? currentCandidates[0].index : -1,
    lumen25Index: lumen25Candidates.length === 1 ? lumen25Candidates[0].index : -1,
    lumen65Index: lumen65Candidates.length === 1 ? lumen65Candidates[0].index : -1,
  };
}

function parseCommentMetadataNames(lines = []) {
  const names = [];
  const seen = new Set();
  for (const line of lines) {
    if (!line.startsWith("#")) break;
    const match = line.match(/^#\s*([\w]+)\s*:/);
    const prefixedMatch = line.match(/^#\s*characteristics_([\w]+)\s*:/);
    const name = String((prefixedMatch || match || [])[1] || "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names.sort((left, right) => left.localeCompare(right));
}

function numericCell(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCurvePoints(text) {
  const lines = String(text || "").split(/\r?\n/);
  const metadata_fields_present = parseCommentMetadataNames(lines);
  const dataLines = lines.filter((line) => line.trim() && !line.trimStart().startsWith("#"));
  if (dataLines.length === 0) {
    return { ok: false, blocker: "empty-curve", reason: "curve CSV has no header or data rows" };
  }

  const headerColumns = parseCsvLine(dataLines[0]);
  const classified = classifyColumns(headerColumns);
  const column_classification = {
    ...classified.classification,
    metadata_fields_present,
    comment_header_present: metadata_fields_present.length > 0,
  };

  if (
    classified.classification.current_column_count > 1 ||
    classified.classification.lumen_25c_column_count > 1 ||
    classified.classification.lumen_65c_column_count > 1
  ) {
    return {
      ok: false,
      blocker: "ambiguous-columns",
      reason: "curve CSV has ambiguous current or lumen columns",
      column_classification,
    };
  }

  if (!classified.classification.supported) {
    return {
      ok: false,
      blocker: "unsupported-headers",
      reason: "curve CSV does not expose one current column plus 25C and 65C lm/m columns",
      column_classification,
    };
  }

  const points = [];
  for (let rowIndex = 1; rowIndex < dataLines.length; rowIndex += 1) {
    const cells = parseCsvLine(dataLines[rowIndex]);
    if (cells.every((cell) => !String(cell || "").trim())) continue;

    const currentMa = numericCell(cells[classified.currentIndex]);
    const lm25 = numericCell(cells[classified.lumen25Index]);
    const lm65 = numericCell(cells[classified.lumen65Index]);

    if (currentMa === null || lm25 === null || lm65 === null || currentMa < 0) {
      return {
        ok: false,
        blocker: "non-numeric-curve-values",
        reason: "curve CSV contains a non-numeric current or lumen value",
        column_classification,
      };
    }

    points.push({ current_ma: currentMa, lm_per_m_25c: lm25, lm_per_m_65c: lm65 });
  }

  if (points.length === 0) {
    return { ok: false, blocker: "empty-curve", reason: "curve CSV has no numeric curve points", column_classification };
  }

  points.sort((left, right) => left.current_ma - right.current_ma);
  return { ok: true, points, column_classification };
}

function interpolationAlpha(tempC) {
  const t = Number(tempC);
  if (t <= TEMP_LOW_C) return { alpha: 0.0, temperature_mode: "clamped-low" };
  if (t >= TEMP_HIGH_C) return { alpha: 1.0, temperature_mode: "clamped-high" };
  return { alpha: (t - TEMP_LOW_C) / (TEMP_HIGH_C - TEMP_LOW_C), temperature_mode: "interpolated" };
}

function blendedPointValue(point, alpha) {
  return point.lm_per_m_25c + alpha * (point.lm_per_m_65c - point.lm_per_m_25c);
}

function interpolatePoints(points, { current_ma, temp_c }) {
  const currentMa = Number(current_ma);
  const tempC = Number(temp_c);
  if (!Number.isFinite(currentMa) || !Number.isFinite(tempC)) {
    return { ok: false, blocker: "invalid-interpolation-request", reason: "current_ma and temp_c must be finite numbers" };
  }

  const { alpha, temperature_mode } = interpolationAlpha(tempC);
  const first = points[0];
  const last = points[points.length - 1];

  if (currentMa <= first.current_ma) {
    return {
      ok: true,
      interpolation: {
        requested: true,
        current_ma: currentMa,
        temp_c: tempC,
        lm_per_m: blendedPointValue(first, alpha),
        temperature_mode,
        current_mode: "clamped-low",
      },
    };
  }

  if (currentMa >= last.current_ma) {
    return {
      ok: true,
      interpolation: {
        requested: true,
        current_ma: currentMa,
        temp_c: tempC,
        lm_per_m: blendedPointValue(last, alpha),
        temperature_mode,
        current_mode: "clamped-high",
      },
    };
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index];
    const p1 = points[index + 1];
    if (p0.current_ma <= currentMa && currentMa <= p1.current_ma) {
      if (p1.current_ma === p0.current_ma) {
        return {
          ok: true,
          interpolation: {
            requested: true,
            current_ma: currentMa,
            temp_c: tempC,
            lm_per_m: blendedPointValue(p0, alpha),
            temperature_mode,
            current_mode: "exact",
          },
        };
      }
      const currentFraction = (currentMa - p0.current_ma) / (p1.current_ma - p0.current_ma);
      const v0 = blendedPointValue(p0, alpha);
      const v1 = blendedPointValue(p1, alpha);
      return {
        ok: true,
        interpolation: {
          requested: true,
          current_ma: currentMa,
          temp_c: tempC,
          lm_per_m: v0 + currentFraction * (v1 - v0),
          temperature_mode,
          current_mode: currentFraction === 0 || currentFraction === 1 ? "exact" : "interpolated",
        },
      };
    }
  }

  return {
    ok: true,
    interpolation: {
      requested: true,
      current_ma: currentMa,
      temp_c: tempC,
      lm_per_m: blendedPointValue(last, alpha),
      temperature_mode,
      current_mode: "clamped-high",
    },
  };
}

function verifySafeCurveMetadata(curve) {
  if (!curve || typeof curve !== "object" || Array.isArray(curve)) {
    return { ok: false, blocker: "unsafe-curve-metadata", reason: "curve metadata is required" };
  }

  const safe = normaliseRuntimeLumenCurveFilename(curve.filename);
  if (!safe.ok) return safe;

  const checksum = String(curve.sha256 || "").trim().toLowerCase();
  if (!SHA256_PATTERN.test(checksum)) {
    return { ok: false, blocker: "unsafe-curve-metadata", reason: "curve metadata must include a sha256 checksum" };
  }

  if (curve.raw_payload_returned !== false || curve.raw_curve_rows_returned !== false) {
    return {
      ok: false,
      blocker: "unsafe-curve-metadata",
      reason: "curve metadata must be the safe lookup metadata shape",
    };
  }

  return {
    ok: true,
    filename: safe.filename,
    sha256: checksum,
    size_bytes: Number.isInteger(curve.size_bytes) && curve.size_bytes >= 0 ? curve.size_bytes : null,
  };
}

async function verifyAndReadCurveFile({ filename, sha256, size_bytes }, curveHome, fsApi = DEFAULT_FS_API) {
  const filePath = pathWin32.join(curveHome, filename);
  try {
    const info = await fsApi.stat(filePath);
    if (!info?.isFile?.()) {
      return { ok: false, blocker: "missing-file", reason: "curve file is not a readable file" };
    }
    if (Number.isInteger(size_bytes) && Number(info.size) !== Number(size_bytes)) {
      return { ok: false, blocker: "checksum-mismatch", reason: "curve file size does not match verified metadata" };
    }
  } catch (error) {
    return { ok: false, blocker: "missing-file", reason: error?.code || "curve file is missing" };
  }

  try {
    const payload = await fsApi.readFile(filePath);
    const checksum = sha256Hex(payload);
    if (checksum !== sha256) {
      return { ok: false, blocker: "checksum-mismatch", reason: "curve file sha256 does not match verified metadata" };
    }
    return { ok: true, text: String(toBuffer(payload).toString("utf-8")) };
  } catch (error) {
    return { ok: false, blocker: "missing-file", reason: error?.code || "curve file could not be read" };
  }
}

export async function buildRuntimeLumenCurveParseInterpolationContract({
  curve = null,
  curveHome = RUNTIME_LUMEN_CURVE_DATA_HOME,
  interpolationRequest = null,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const metadata = verifySafeCurveMetadata(curve);
  if (!metadata.ok) {
    return failClosed(metadata.blocker, metadata.reason, {
      filename: metadata.filename || curve?.filename || null,
    });
  }

  const readResult = await verifyAndReadCurveFile(metadata, curveHome, fsApi);
  if (!readResult.ok) {
    return failClosed(readResult.blocker, readResult.reason, { filename: metadata.filename });
  }

  const parsed = parseCurvePoints(readResult.text);
  if (!parsed.ok) {
    return failClosed(parsed.blocker, parsed.reason, {
      filename: metadata.filename,
      column_classification: parsed.column_classification || null,
    });
  }

  const summary = safeSummaryBase({
    ok: true,
    filename: metadata.filename,
    point_count: parsed.points.length,
    column_classification: parsed.column_classification,
    interpolation_supported: true,
    checksum_verified: true,
  });

  if (interpolationRequest) {
    const interpolated = interpolatePoints(parsed.points, interpolationRequest);
    if (!interpolated.ok) {
      return failClosed(interpolated.blocker, interpolated.reason, {
        filename: metadata.filename,
        point_count: parsed.points.length,
        column_classification: parsed.column_classification,
        checksum_verified: true,
      });
    }
    return {
      ...summary,
      interpolation: interpolated.interpolation,
    };
  }

  return summary;
}
