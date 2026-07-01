import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.board-electrical-summary";
export const ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_STATE =
  "runtime_board_electrical_summary_diagnostic_only";

export const ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  exactElectricalValuesExposed: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  boardDataMakerImported: false,
  donorEngineInvoked: false,
  productionEngineExecutionEnabled: false,
  fullEnginePortEnabled: false,
  driverSelectionEnabled: false,
  driverUtilisationLookupEnabled: false,
  electricalZoneBuildingEnabled: false,
  gateDValidationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawBoardRowsReturned: false,
  rawDriverRowsReturned: false,
  rawCurveRowsReturned: false,
  rawUsersReturned: false,
  rawEnginePayloadReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe-[0-9A-Za-z_.:-]{4,200}$/;
const UNSAFE_RAW_KEY_PATTERN = /^(?:BOARDS|DRIVERS|USERS|VF_CURVES|SYSTEM_POLICY|novondb|rawRows|rawBoardRows|rawDriverRows|rawCurveRows|boardRows|driverRows|curveRows|payload|rawPayload|enginePayload|absolutePath|localPath|filePath|sourcePath|secret|token|email)$/i;
const UNSAFE_TRUE_FLAG_PATTERN = /^(?:rawRowsReturned|rawBoardRowsReturned|rawDriverRowsReturned|rawCurveRowsReturned|rawUsersReturned|rawEnginePayloadReturned|donorEngineInvoked|runtimeDataMutated|selectedResultPersisted|iesGenerated|runTableGenerated|routesAdded|postEndpointsAdded)$/i;

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null
    || value === undefined
    || (typeof value === "number" && Number.isNaN(value))
    || (typeof value === "string" && value.trim() === "");
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function safeLabel(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 96) : fallback;
}

function toFiniteNumber(value) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const source = String(value ?? "").trim();
  if (!source) return null;
  const parsed = Number(source);
  if (Number.isFinite(parsed)) return parsed;
  const match = source.replace(/–/g, "-").match(/[-+]?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function toPositiveInteger(value) {
  const parsed = toFiniteNumber(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return Number.isInteger(rounded) && rounded > 0 ? rounded : null;
}

function toPositiveFinite(value) {
  const parsed = toFiniteNumber(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 220);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function resolveSafeFingerprint(input, boardFillSummary, boardElectricalSummary, keys) {
  const parts = [
    safeFingerprint(firstPresent(input, keys)),
    safeFingerprint(firstPresent(boardElectricalSummary, keys)),
    safeFingerprint(firstPresent(boardFillSummary, keys)),
  ].filter(Boolean);

  if (parts.length > 1) return `${parts[0].split(":")[0]}:${stableSha1(parts)}`;
  return parts[0] || "";
}

function hasUnsafeRawShape(value, depth = 0) {
  if (depth > 6) return false;
  if (Array.isArray(value)) return true;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value);
  if (!isPlainObject(value)) return false;

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_TRUE_FLAG_PATTERN.test(key) && nested === true) return true;
    if (UNSAFE_RAW_KEY_PATTERN.test(key)) return true;
    if (typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) return true;
    if (Array.isArray(nested) && /(?:raw|row|rows|BOARDS|DRIVERS|USERS|curve|payload)/i.test(key)) return true;
    if (isPlainObject(nested) && hasUnsafeRawShape(nested, depth + 1)) return true;
  }
  return false;
}

function resolveBoardFillSummary(input) {
  const direct = firstPresent(input, [
    "boardFillSummary",
    "safeBoardFillSummary",
    "runtimeBoardFillSummary",
    "runtimeNativeBoardFillSummary",
  ]);
  return isPlainObject(direct) ? direct : null;
}

function resolveBoardElectricalSummary(input) {
  const direct = firstPresent(input, [
    "sourceBackedBoardElectricalSummary",
    "boardElectricalSummary",
    "safeBoardElectricalSummary",
    "selectedBoardElectricalSummary",
  ]);
  return isPlainObject(direct) ? direct : null;
}

function safetyBase(extra = {}) {
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_STATE,
    sourceKind: extra.sourceKind || "safe-source-backed-board-electrical-fixture",
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    selectedBoardFamily: extra.selectedBoardFamily || null,
    boardCount: extra.boardCount ?? 0,
    boardLengthMm: extra.boardLengthMm ?? null,
    boardUsedLengthMm: extra.boardUsedLengthMm ?? 0,
    selectedCurrentMa: extra.selectedCurrentMa ?? null,
    boardVoltageClass: extra.boardVoltageClass || null,
    boardVoltageStatus: extra.boardVoltageStatus || "unresolved",
    boardPowerClass: extra.boardPowerClass || null,
    boardPowerStatus: extra.boardPowerStatus || "unresolved",
    electricalSummaryReady: extra.electricalSummaryReady ?? false,
    driverSizerReady: false,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    summaryFingerprint: extra.summaryFingerprint || null,
    exactElectricalValuesExposed: false,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawCurveRowsReturned: false,
    rawUsersReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    iesGenerated: false,
    runTableGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    electricalSummaryReady: false,
    failClosedDiagnostics: [diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function buildBoardFillContext(boardFillSummary) {
  return {
    selectedBoardFamily: safeLabel(firstPresent(boardFillSummary, ["selectedBoardFamily", "boardFamily"]), ""),
    boardCount: toPositiveInteger(firstPresent(boardFillSummary, ["boardCount", "boardsCount"])),
    boardLengthMm: toPositiveInteger(firstPresent(boardFillSummary, ["boardLengthMm", "board_length_mm"])),
    boardUsedLengthMm: toPositiveInteger(firstPresent(boardFillSummary, ["boardUsedLengthMm", "board_used_length_mm"])),
  };
}

function validateBoardFillSummary(boardFillSummary) {
  if (!isPlainObject(boardFillSummary)) {
    return { ok: false, blocker: "missing-board-fill-summary", diagnostic: "Safe board-fill summary is required before board electrical diagnostics." };
  }
  if (boardFillSummary.diagnosticOnly !== true || boardFillSummary.ok !== true) {
    return { ok: false, blocker: "unsafe-board-fill-summary", diagnostic: "Board-fill input must be an ok diagnostic-only safe summary." };
  }
  if (hasUnsafeRawShape(boardFillSummary)) {
    return { ok: false, blocker: "unsafe-board-fill-summary", diagnostic: "Board-fill summary contains unsafe raw-row, path, payload, or mutation markers." };
  }

  const context = buildBoardFillContext(boardFillSummary);
  if (!context.selectedBoardFamily || !context.boardCount || !context.boardLengthMm || !context.boardUsedLengthMm) {
    return { ok: false, blocker: "missing-board-fill-dimensions", diagnostic: "Board count, board length, used length, and selected board family are required." };
  }
  return { ok: true, context };
}

function resolveCurrentMa(input, boardElectricalSummary) {
  return toPositiveInteger(firstPresent(input, [
    "selectedCurrentMa",
    "selectedCurrentMA",
    "selectedCurrent_mA",
    "currentMa",
    "current_ma",
  ]) ?? firstPresent(boardElectricalSummary, [
    "selectedCurrentMa",
    "currentMa",
    "current_ma",
  ]));
}

function resolveElectricalValues(boardElectricalSummary) {
  const boardVoltageV = toPositiveFinite(firstPresent(boardElectricalSummary, [
    "boardVoltageV",
    "boardVfV",
    "vfAtCurrentV",
    "vfPerBoardV",
    "voltageAtCurrentV",
    "voltageV",
  ]));
  const boardPowerW = toPositiveFinite(firstPresent(boardElectricalSummary, [
    "boardPowerW",
    "wattsPerBoardW",
    "wattAtCurrentW",
    "wattsAtCurrentW",
    "powerAtCurrentW",
    "powerW",
  ]));
  return { boardVoltageV, boardPowerW };
}

function voltageClassFor(value) {
  if (value <= 24) return "safe-band:board-vf-0-24v";
  if (value <= 48) return "safe-band:board-vf-24-48v";
  if (value <= 60) return "safe-band:board-vf-48-60v";
  return "safe-band:board-vf-above-60v-review-required";
}

function powerClassFor(value) {
  if (value <= 5) return "safe-band:board-power-0-5w";
  if (value <= 20) return "safe-band:board-power-5-20w";
  if (value <= 50) return "safe-band:board-power-20-50w";
  return "safe-band:board-power-above-50w-review-required";
}

function exactExposureRequested(input, boardElectricalSummary) {
  return input.requestExactElectricalValues === true
    || input.exposeExactElectricalValues === true
    || input.exactElectricalValues === true
    || boardElectricalSummary?.requestExactElectricalValues === true
    || boardElectricalSummary?.exposeExactElectricalValues === true
    || boardElectricalSummary?.exactElectricalValues === true;
}

export function buildRuntimeBoardElectricalSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const boardFillSummary = resolveBoardFillSummary(source);
  const boardElectricalSummary = resolveBoardElectricalSummary(source);

  const fillValidation = validateBoardFillSummary(boardFillSummary);
  if (!fillValidation.ok) {
    return failClosed(fillValidation.blocker, fillValidation.diagnostic);
  }
  const fillContext = fillValidation.context;

  if (!boardElectricalSummary) {
    return failClosed("missing-board-electrical-summary", "Safe source-backed board electrical fixture summary is required.", fillContext);
  }
  if (hasUnsafeRawShape(boardElectricalSummary)) {
    return failClosed("unsafe-raw-board-electrical-input", "Board electrical input must be a sealed safe summary, not raw BOARDS, DRIVERS, curve rows, users, paths, or payloads.", fillContext);
  }
  if (exactExposureRequested(source, boardElectricalSummary)) {
    return failClosed("unsupported-exact-electrical-exposure", "Exact electrical value exposure is not approved for this diagnostic scaffold; safe bands only are allowed.", fillContext);
  }

  const policyFingerprint = resolveSafeFingerprint(source, boardFillSummary, boardElectricalSummary, ["policyFingerprint", "safePolicyFingerprint"]);
  const sourceFingerprint = resolveSafeFingerprint(source, boardFillSummary, boardElectricalSummary, ["sourceFingerprint", "safeSourceFingerprint"]);
  if (!policyFingerprint) {
    return failClosed("missing-policy-fingerprint", "A safe policy fingerprint is required before board electrical diagnostics.", fillContext);
  }
  if (!sourceFingerprint) {
    return failClosed("missing-source-fingerprint", "A safe source fingerprint is required before board electrical diagnostics.", {
      ...fillContext,
      policyFingerprint,
    });
  }

  const selectedCurrentMa = resolveCurrentMa(source, boardElectricalSummary);
  if (!selectedCurrentMa) {
    return failClosed("missing-current", "A positive selected current_ma is required before board electrical diagnostics.", {
      ...fillContext,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const { boardVoltageV, boardPowerW } = resolveElectricalValues(boardElectricalSummary);
  if (boardVoltageV === null || boardPowerW === null) {
    return failClosed("missing-board-electrical-fields", "Positive board voltage and board power fields are required before board electrical diagnostics.", {
      ...fillContext,
      selectedCurrentMa,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const boardVoltageClass = voltageClassFor(boardVoltageV);
  const boardPowerClass = powerClassFor(boardPowerW);
  const warnings = [
    "Exact board voltage and power values are intentionally suppressed; safe bands only are returned.",
    "Runtime-native driver sizing remains disabled for this scaffold.",
  ];
  if (boardVoltageClass.includes("review-required")) {
    warnings.push("Board voltage band is above the low-voltage diagnostic band and requires future electrical validation.");
  }
  if (boardPowerClass.includes("review-required")) {
    warnings.push("Board power band is above the normal diagnostic band and requires future electrical validation.");
  }

  const summaryFingerprint = `safe-board-electrical:${stableSha1([
    fillContext.selectedBoardFamily,
    fillContext.boardCount,
    fillContext.boardLengthMm,
    fillContext.boardUsedLengthMm,
    selectedCurrentMa,
    boardVoltageClass,
    boardPowerClass,
    policyFingerprint,
    sourceFingerprint,
  ])}`;

  return safetyBase({
    ok: true,
    ...fillContext,
    selectedCurrentMa,
    boardVoltageClass,
    boardVoltageStatus: "banded-only-exact-values-suppressed",
    boardPowerClass,
    boardPowerStatus: "banded-only-exact-values-suppressed",
    electricalSummaryReady: true,
    policyFingerprint,
    sourceFingerprint,
    summaryFingerprint,
    warnings,
  });
}

export const buildRuntimeBoardElectricalSummaryScaffold = buildRuntimeBoardElectricalSummary;
export const buildEngineRunTableRuntimeBoardElectricalSummary = buildRuntimeBoardElectricalSummary;
