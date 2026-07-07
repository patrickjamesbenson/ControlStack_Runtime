import { freezeForHash, stableSha1 } from "./stableFingerprint.js";

export { freezeForHash, stableSha1 };

export const ENGINE_RUNTABLE_RUNTIME_POLICY_INDEX_KERNEL_STATE = "runtime_policy_index_scaffold_only";

export const SEGMENT_MAX_LENGTH_MM_OVERRIDE = 3650;

export const RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  runtimeNative: true,
  policyIndexScaffoldOnly: true,
  sourceSnapshotAlreadyLoadedOnly: true,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  boardDataMakerImported: false,
  donorEngineInvoked: false,
  productionEngineExecutionEnabled: false,
  runEngineMigrationEnabled: false,
  boardCurrentDerivationEnabled: false,
  driverSizingEnabled: false,
  zonePlanningEnabled: false,
  mechanicalPlanningEnabled: false,
  selectedResultPersistenceEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawRowsReturned: false,
  rawTableHeadersReturned: false,
  rawUsersReturned: false,
  privatePathsReturned: false,
});

const EXPLICIT_FINGERPRINT_KEYS = ["_fingerprint", "fingerprint", "_snapshot_id", "snapshot_id"];

const POLICY_TYPES = Object.freeze({
  driver_util_target_pct: "float",
  driver_util_max_pct: "float",
  eff_optical: "float",
  pitch_tolerance_mm: "float",
  max_board_gap_mm: "int",
  segment_max_board_split_qty: "int",
  end_plate_std_mm: "int",
  end_plate_ip_mm: "int",
  min_body_mm: "int",
  start_board_gap: "int",
  end_board_gap: "int",
  secondary_no_cross_max_extra_drivers_abs: "int",
  electrical_zone_mode: "string",
  secondary_across_segment: "string",
  length_pref: "string",
  gap_mode: "string",
  greedy_tie_break_mode: "string",
  board_selection_prefer_recent: "bool",
  board_cross_segment_join: "bool",
  diffuser_cross_segment_join: "bool",
  do_not_bridge_join: "bool",
  do_not_bridge_segment_join: "bool",
});

const POLICY_VALIDATION = Object.freeze({
  driver_util_max_pct: { min: 0.0, max: 1.0 },
  driver_util_target_pct: { min: 0.0, max: 1.0 },
  end_plate_std_mm: { min: 0 },
  end_plate_ip_mm: { min: 0 },
  min_body_mm: { min: 1 },
  start_board_gap: { min: 0 },
  end_board_gap: { min: 0 },
  electrical_zone_mode: { values: ["start_run_as_one_zone", "start_segment_as_one_zone"] },
  secondary_across_segment: { values: ["allow", "forbid", "compare"] },
  length_pref: { values: ["exact", "longer", "nearest", "shorter"] },
  gap_mode: { values: ["N+1", "N-1"] },
});

const LENGTH_POLICY_KEYS = Object.freeze([
  "segment_max_length_mm",
  "segment_min_aesthetic_length_mm",
  "segment_max_board_split_qty",
  "segment_split_mode_2piece",
  "segment_split_mode_3piece",
  "segment_split_mode_multi",
  "segment_short_piece_position_2piece",
  "segment_short_piece_position_3piece",
  "segment_short_piece_position_multi",
  "end_plate_std_mm",
  "end_plate_ip_mm",
  "min_body_mm",
  "start_board_gap",
  "end_board_gap",
  "pitch_tolerance_mm",
  "max_board_gap_mm",
  "length_pref",
  "gap_mode",
  "greedy_tie_break_mode",
  "board_selection_prefer_recent",
]);

const JOIN_POLICY_KEYS = Object.freeze([
  "board_cross_segment_join",
  "diffuser_cross_segment_join",
  "secondary_across_segment",
  "do_not_bridge_join",
  "do_not_bridge_segment_join",
]);

const PRIVATE_TABLE_NAME_PATTERN = /^(USERS?|USER_|ACCOUNTS?|AUTH|CREDENTIALS?|SECRETS?|TOKENS?|PASSWORDS?|PRIVATE)(_|$)/i;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_TABLE_NAME_PATTERN = /^[A-Z0-9_ -]{1,80}$/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null
    || value === undefined
    || (typeof value === "number" && Number.isNaN(value))
    || (typeof value === "string" && value.trim() === "");
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function safeDiagnosticToken(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw.replace(/[^0-9A-Za-z _./:-]+/g, " ").replace(/[\\/]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 96) : fallback;
}

function safeTableName(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || PRIVATE_TABLE_NAME_PATTERN.test(raw)) return null;
  if (!SAFE_TABLE_NAME_PATTERN.test(raw)) return null;
  return raw.slice(0, 80);
}

function sanitizePolicyString(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (PRIVATE_PATH_PATTERN.test(raw)) return "[redacted-private-value]";
  return raw.slice(0, 240);
}

function getTableRows(snapshot, tableName) {
  if (!isPlainObject(snapshot)) return [];
  const rows = snapshot[tableName];
  return Array.isArray(rows) ? rows.filter((row) => isPlainObject(row)) : [];
}

function resolveSelectedTier(input) {
  if (typeof input === "string") return input.trim();
  if (!isPlainObject(input)) return "";
  for (const key of ["tier", "selectedTier", "selected_tier", "profile", "selectedProfile", "tier_selected"]) {
    const value = input[key];
    if (!isBlank(value)) return String(value).trim();
  }
  return "";
}

function resolveTierColumnValue(row, tier) {
  if (!isPlainObject(row)) return undefined;
  if (Object.prototype.hasOwnProperty.call(row, tier)) return row[tier];
  const lowered = tier.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(row, lowered)) return row[lowered];
  const foundKey = Object.keys(row).find((key) => key.toLowerCase() === lowered);
  return foundKey ? row[foundKey] : undefined;
}

function truthy(value) {
  return new Set(["TRUE", "YES", "1", "Y", "T"]).has(String(value).trim().toUpperCase());
}

function toFloat(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  const source = String(value ?? "").trim();
  if (!source) throw new Error("blank");
  const match = source.replace(/–/g, "-").match(/[-+]?\d+(\.\d+)?/);
  if (!match) throw new Error(`cannot parse float from ${JSON.stringify(source)}`);
  return Number(match[0]);
}

function toInt(value) {
  return Math.round(toFloat(value));
}

function convertPolicyValue(item, rawValue) {
  const targetType = POLICY_TYPES[item];
  if (!targetType) return sanitizePolicyString(rawValue);
  if (targetType === "string") return sanitizePolicyString(rawValue);
  if (targetType === "int") return toInt(rawValue);
  if (targetType === "float") return toFloat(rawValue);
  if (targetType === "bool") return truthy(rawValue);
  return sanitizePolicyString(rawValue);
}

function validatePolicyValue(item, value, tier) {
  const rules = POLICY_VALIDATION[item];
  if (!rules) return null;
  if (Array.isArray(rules.values)) {
    const allowed = new Set(rules.values.map(String));
    if (!allowed.has(String(value))) {
      return `Invalid value for ${item}: expected one of ${rules.values.join(", ")} for tier ${safeDiagnosticToken(tier)}.`;
    }
  }
  if (Object.prototype.hasOwnProperty.call(rules, "min") || Object.prototype.hasOwnProperty.call(rules, "max")) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return `Invalid numeric value for ${item} for tier ${safeDiagnosticToken(tier)}.`;
    if (Object.prototype.hasOwnProperty.call(rules, "min") && numericValue < Number(rules.min) - 1e-12) {
      return `Invalid value for ${item}: expected >= ${rules.min} for tier ${safeDiagnosticToken(tier)}.`;
    }
    if (Object.prototype.hasOwnProperty.call(rules, "max") && numericValue > Number(rules.max) + 1e-12) {
      return `Invalid value for ${item}: expected <= ${rules.max} for tier ${safeDiagnosticToken(tier)}.`;
    }
  }
  return null;
}

function buildPolicyIndex(snapshot) {
  const rows = getTableRows(snapshot, "SYSTEM_POLICY");
  const byItem = new Map();
  for (const row of rows) {
    const item = typeof row.item === "string" ? row.item.trim() : "";
    if (item) byItem.set(item, row);
  }
  return { rows, byItem };
}

function availableItemsPreview(byItem) {
  return [...byItem.keys()].sort().slice(0, 40).map((item) => safeDiagnosticToken(item, "redacted-policy"));
}

export function getRuntimePolicyOverrideContract() {
  return {
    ok: true,
    state: ENGINE_RUNTABLE_RUNTIME_POLICY_INDEX_KERNEL_STATE,
    contract: "tier-policy-overrides",
    segment_max_length_mm: SEGMENT_MAX_LENGTH_MM_OVERRIDE,
    appliesToAllTiers: true,
    sourceBehaviour: "donor-novondb-overrides-pinned-runtime-behaviour",
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
  };
}

export function applyRuntimeTierPolicyOverrides(policies = {}, { tier = "" } = {}) {
  const out = isPlainObject(policies) ? { ...policies } : {};
  out.segment_max_length_mm = SEGMENT_MAX_LENGTH_MM_OVERRIDE;
  return {
    ok: true,
    tier: safeDiagnosticToken(tier, "unresolved"),
    policies: out,
    overrideContract: getRuntimePolicyOverrideContract(),
    overrideApplied: true,
    segmentMaxLengthMm: SEGMENT_MAX_LENGTH_MM_OVERRIDE,
  };
}

export function buildSafeSourceFingerprintMarker(snapshot = {}) {
  const source = isPlainObject(snapshot) ? snapshot : {};
  for (const key of EXPLICIT_FINGERPRINT_KEYS) {
    const value = source[key];
    if (!isBlank(value)) {
      return {
        ok: true,
        marker: `safe-${key}:${stableSha1(value)}`,
        basis: "explicit-snapshot-metadata",
        metadataKey: key,
        rawMetadataValueReturned: false,
        rawRowsReturned: false,
        rawTableHeadersReturned: false,
        rawUsersReturned: false,
        privatePathsReturned: false,
        safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
      };
    }
  }

  const parts = [];
  for (const [tableName, value] of Object.entries(source)) {
    if (Array.isArray(value)) parts.push([String(tableName), value.length]);
  }
  parts.sort((left, right) => left[0].localeCompare(right[0]));
  return {
    ok: true,
    marker: `safe-db:${stableSha1(parts)}`,
    basis: "table-row-counts",
    tableCount: parts.length,
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
  };
}

export function buildSafeTablePresenceSummary(snapshot = {}) {
  const source = isPlainObject(snapshot) ? snapshot : {};
  const tables = [];
  let redactedPrivateTableCount = 0;
  let redactedUnsafeTableNameCount = 0;

  for (const [tableName, value] of Object.entries(source)) {
    if (!Array.isArray(value)) continue;
    const safeName = safeTableName(tableName);
    if (!safeName) {
      if (PRIVATE_TABLE_NAME_PATTERN.test(String(tableName))) redactedPrivateTableCount += 1;
      else redactedUnsafeTableNameCount += 1;
      continue;
    }
    tables.push({
      tableName: safeName,
      present: true,
      rowCount: value.filter((row) => isPlainObject(row)).length,
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
    });
  }

  tables.sort((left, right) => left.tableName.localeCompare(right.tableName));
  return {
    ok: true,
    state: ENGINE_RUNTABLE_RUNTIME_POLICY_INDEX_KERNEL_STATE,
    tableCount: tables.length,
    tables,
    redactedPrivateTableCount,
    redactedUnsafeTableNameCount,
    sourceHasSystemPolicy: tables.some((entry) => entry.tableName === "SYSTEM_POLICY"),
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
  };
}

export function resolveRuntimeTierPolicyValue(snapshot = {}, options = {}) {
  const tier = resolveSelectedTier(options);
  const policyName = String(options.policyName ?? options.item ?? "").trim();
  const { byItem } = buildPolicyIndex(snapshot);

  if (!tier) {
    return {
      ok: false,
      blocker: "missing-tier",
      diagnostic: "Tier/profile is required before policy lookup.",
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }
  if (!policyName) {
    return {
      ok: false,
      blocker: "missing-policy-name",
      diagnostic: "Policy item name is required before policy lookup.",
      tier: safeDiagnosticToken(tier),
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }

  const row = byItem.get(policyName);
  if (!row) {
    return {
      ok: false,
      blocker: "missing-policy",
      diagnostic: `Policy ${safeDiagnosticToken(policyName, "redacted-policy")} is not present in SYSTEM_POLICY for tier ${safeDiagnosticToken(tier)}.`,
      tier: safeDiagnosticToken(tier),
      policyName: safeDiagnosticToken(policyName, "redacted-policy"),
      availablePolicyCount: byItem.size,
      availableItemsPreview: availableItemsPreview(byItem),
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }

  const rawValue = resolveTierColumnValue(row, tier);
  if (isBlank(rawValue)) {
    return {
      ok: false,
      blocker: "missing-tier-policy-value",
      diagnostic: `Policy ${safeDiagnosticToken(policyName, "redacted-policy")} has no source-backed value for tier ${safeDiagnosticToken(tier)}.`,
      tier: safeDiagnosticToken(tier),
      policyName: safeDiagnosticToken(policyName, "redacted-policy"),
      availablePolicyCount: byItem.size,
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }

  let value;
  try {
    value = convertPolicyValue(policyName, rawValue);
  } catch (error) {
    return {
      ok: false,
      blocker: "policy-conversion-failed",
      diagnostic: `Policy ${safeDiagnosticToken(policyName, "redacted-policy")} could not be converted for tier ${safeDiagnosticToken(tier)}.`,
      tier: safeDiagnosticToken(tier),
      policyName: safeDiagnosticToken(policyName, "redacted-policy"),
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }

  const validationError = validatePolicyValue(policyName, value, tier);
  if (validationError) {
    return {
      ok: false,
      blocker: "policy-validation-failed",
      diagnostic: validationError,
      tier: safeDiagnosticToken(tier),
      policyName: safeDiagnosticToken(policyName, "redacted-policy"),
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }

  return {
    ok: true,
    tier: safeDiagnosticToken(tier),
    policyName: safeDiagnosticToken(policyName, "redacted-policy"),
    value,
    source: "SYSTEM_POLICY",
    rawValueReturned: false,
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
  };
}

export function resolveRuntimeTierPolicies(snapshot = {}, options = {}) {
  const tier = resolveSelectedTier(options);
  const { rows, byItem } = buildPolicyIndex(snapshot);
  if (!tier) {
    return {
      ok: false,
      blocker: "missing-tier",
      diagnostic: "Tier/profile is required before tier policy resolution.",
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }
  if (rows.length === 0 || byItem.size === 0) {
    return {
      ok: false,
      blocker: "missing-system-policy",
      diagnostic: "SYSTEM_POLICY table is required before runtime tier policy resolution.",
      tier: safeDiagnosticToken(tier),
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }

  const policies = {};
  const diagnostics = [];
  for (const item of [...byItem.keys()].sort()) {
    const result = resolveRuntimeTierPolicyValue(snapshot, { tier, policyName: item });
    if (result.ok) {
      policies[item] = result.value;
    } else if (result.blocker === "policy-conversion-failed" || result.blocker === "policy-validation-failed") {
      return result;
    } else if (result.blocker === "missing-tier-policy-value") {
      diagnostics.push(result.diagnostic);
    }
  }

  if (Object.keys(policies).length === 0) {
    return {
      ok: false,
      blocker: "missing-tier-policy-values",
      diagnostic: `No source-backed SYSTEM_POLICY values are available for tier ${safeDiagnosticToken(tier)}.`,
      tier: safeDiagnosticToken(tier),
      availablePolicyCount: byItem.size,
      availableItemsPreview: availableItemsPreview(byItem),
      rawRowsReturned: false,
      rawTableHeadersReturned: false,
      rawUsersReturned: false,
      privatePathsReturned: false,
      safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
    };
  }

  const withOverrides = applyRuntimeTierPolicyOverrides(policies, { tier });
  return {
    ok: true,
    state: ENGINE_RUNTABLE_RUNTIME_POLICY_INDEX_KERNEL_STATE,
    tier: safeDiagnosticToken(tier),
    policies: withOverrides.policies,
    policyCount: Object.keys(withOverrides.policies).length,
    availablePolicyCount: byItem.size,
    missingTierValueDiagnostics: diagnostics.slice(0, 20),
    overrideContract: withOverrides.overrideContract,
    overrideApplied: true,
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
  };
}

function maybeNumericMm(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  try {
    return toInt(value);
  } catch (_error) {
    return null;
  }
}

function safePolicySummaryValue(value) {
  return typeof value === "string" ? sanitizePolicyString(value) : value;
}

function pickSafePolicySubset(policies = {}, keys = []) {
  const out = {};
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(policies, key)) continue;
    out[key] = safePolicySummaryValue(policies[key]);
  }
  return out;
}

export function buildSourceBackedLengthPolicySummary(snapshot = {}, options = {}) {
  const tierPolicies = resolveRuntimeTierPolicies(snapshot, options);
  if (!tierPolicies.ok) {
    return {
      ...tierPolicies,
      summaryAvailable: false,
      summaryType: "source-backed-length-policy",
    };
  }

  const policies = {};
  const numericMm = {};
  for (const key of LENGTH_POLICY_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(tierPolicies.policies, key)) continue;
    const value = tierPolicies.policies[key];
    policies[key] = safePolicySummaryValue(value);
    if (/_mm$/.test(key) || ["start_board_gap", "end_board_gap"].includes(key)) {
      const parsed = maybeNumericMm(value);
      if (parsed !== null) numericMm[key] = parsed;
    }
  }
  const joinPolicies = pickSafePolicySubset(tierPolicies.policies, JOIN_POLICY_KEYS);

  return {
    ok: true,
    state: ENGINE_RUNTABLE_RUNTIME_POLICY_INDEX_KERNEL_STATE,
    summaryType: "source-backed-length-policy",
    tier: tierPolicies.tier,
    lengthPolicies: policies,
    joinPolicies,
    joinPolicyNames: Object.keys(joinPolicies).sort(),
    numericMm,
    segmentMaxLengthMm: SEGMENT_MAX_LENGTH_MM_OVERRIDE,
    segmentMaxLengthOverrideApplied: true,
    overrideContract: getRuntimePolicyOverrideContract(),
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
  };
}

export function buildRuntimePolicyIndexKernelStatus(snapshot = {}, options = {}) {
  const fingerprint = buildSafeSourceFingerprintMarker(snapshot);
  const tablePresence = buildSafeTablePresenceSummary(snapshot);
  const tierPolicies = resolveRuntimeTierPolicies(snapshot, options);
  const lengthPolicySummary = buildSourceBackedLengthPolicySummary(snapshot, options);

  return {
    ok: tablePresence.ok && tierPolicies.ok && lengthPolicySummary.ok,
    state: ENGINE_RUNTABLE_RUNTIME_POLICY_INDEX_KERNEL_STATE,
    fingerprint,
    tablePresence,
    tierPolicies,
    lengthPolicySummary,
    overrideContract: getRuntimePolicyOverrideContract(),
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
    rawUsersReturned: false,
    privatePathsReturned: false,
    donorEngineInvoked: false,
    safetyFlags: clonePlain(RUNTIME_POLICY_INDEX_KERNEL_SAFETY_FLAGS),
  };
}
