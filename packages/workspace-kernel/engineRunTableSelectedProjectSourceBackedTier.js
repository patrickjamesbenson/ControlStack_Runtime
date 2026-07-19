const REQUIRED_TIER_POLICY_ITEMS = Object.freeze([
  "led_current_headroom_max_pct",
  "led_headroom_watts_multi",
]);

const POLICY_METADATA_FIELDS = Object.freeze(new Set([
  "item",
  "policy",
  "policy_item",
  "policy_name",
  "name",
  "label",
  "notes",
  "note",
  "description",
  "source",
  "owner",
  "status",
  "category",
]));

const CLIENT_TIER_KEYS = Object.freeze(new Set([
  "tier",
  "tier_name",
  "selectedtier",
  "selected_tier",
  "tiertoken",
  "tier_token",
  "candidate_tiers",
  "candidatetiers",
  "tier_strategy",
  "tierstrategy",
  "cachedtier",
  "cached_tier",
  "defaulttier",
  "default_tier",
]));

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function safeText(value) {
  return String(value ?? "").trim();
}

function normaliseKey(value) {
  return safeText(value)
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function safeTierName(value) {
  const text = safeText(value);
  if (!text || text.length > 80) return "";
  if (!/^[0-9A-Za-z][0-9A-Za-z _.:-]*$/.test(text)) return "";
  return text;
}

function policyItem(row) {
  if (!isPlainObject(row)) return "";
  for (const key of ["item", "policy", "policy_item", "policy_name", "name"]) {
    const value = normaliseKey(row[key]);
    if (value) return value;
  }
  return "";
}

function authorityCellPresent(value) {
  if (value === null || value === undefined || value === false || value === true) return false;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

function systemPolicyRows(snapshot) {
  if (Array.isArray(snapshot?.SYSTEM_POLICY)) return snapshot.SYSTEM_POLICY;
  if (Array.isArray(snapshot?.system_policy)) return snapshot.system_policy;
  if (Array.isArray(snapshot?.tables?.SYSTEM_POLICY)) return snapshot.tables.SYSTEM_POLICY;
  return [];
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function selectorPayloadFrom(bridgeRequest) {
  return isPlainObject(bridgeRequest?.selectorPayload) ? bridgeRequest.selectorPayload : {};
}

function hasClientTierValue(selectorPayload) {
  return Object.keys(selectorPayload).some((key) => CLIENT_TIER_KEYS.has(normaliseKey(key)));
}

function tierNeutralSelectorPayload(selectorPayload) {
  return Object.fromEntries(
    Object.entries(isPlainObject(selectorPayload) ? selectorPayload : {})
      .filter(([key]) => !CLIENT_TIER_KEYS.has(normaliseKey(key))),
  );
}

export function resolveSelectedProjectSourceBackedTier({ snapshot = {} } = {}) {
  const rows = systemPolicyRows(snapshot);
  const candidatePolicyItems = new Map();

  for (const row of rows) {
    if (!isPlainObject(row)) continue;
    const item = policyItem(row);
    if (!item) continue;
    for (const [rawKey, value] of Object.entries(row)) {
      const key = normaliseKey(rawKey);
      if (!key || POLICY_METADATA_FIELDS.has(key) || key.startsWith("_")) continue;
      const tier = safeTierName(rawKey);
      if (!tier || !authorityCellPresent(value)) continue;
      if (!candidatePolicyItems.has(tier)) candidatePolicyItems.set(tier, new Set());
      candidatePolicyItems.get(tier).add(item);
    }
  }

  const validTiers = [...candidatePolicyItems.entries()]
    .filter(([, items]) => REQUIRED_TIER_POLICY_ITEMS.every((item) => items.has(item)))
    .map(([tier]) => tier);
  const ready = validTiers.length === 1;
  const ambiguous = validTiers.length > 1;

  return Object.freeze({
    ok: ready,
    state: ready
      ? "selected_project_source_backed_tier_derivation_ready"
      : ambiguous
        ? "selected_project_source_backed_tier_derivation_ambiguous"
        : "selected_project_source_backed_tier_derivation_unavailable",
    blocker: ready
      ? null
      : ambiguous
        ? "selected-project-source-backed-tier-derivation-ambiguous"
        : "selected-project-source-backed-tier-derivation-unavailable",
    tier: ready ? validTiers[0] : null,
    validTierCount: validTiers.length,
    requiredPolicyItemCount: REQUIRED_TIER_POLICY_ITEMS.length,
    sourceTable: "SYSTEM_POLICY",
    sourceBacked: ready,
    clientTierAuthorityAccepted: false,
    fallbackUsed: false,
    defaultUsed: false,
    guessed: false,
    rawRowsReturned: false,
    rawValuesReturned: false,
    candidateTierValuesReturned: false,
  });
}

export function bindSelectedProjectSourceBackedTier({
  bridgeRequest = {},
  snapshot = {},
} = {}) {
  const selectorPayload = selectorPayloadFrom(bridgeRequest);
  const clientTierPresent = hasClientTierValue(selectorPayload);
  const sourceResolution = resolveSelectedProjectSourceBackedTier({ snapshot });
  if (!sourceResolution.ok) {
    const tierNeutralRequest = cloneJson(bridgeRequest);
    tierNeutralRequest.selectorPayload = tierNeutralSelectorPayload(selectorPayload);
    return Object.freeze({
      ok: false,
      bound: false,
      state: "selected_project_engine_candidate_tier_binding_blocked",
      blocker: sourceResolution.blocker,
      bridgeRequest: tierNeutralRequest,
      sourceResolution,
      clientTierPresent,
      clientTierAuthorityAccepted: false,
      rawRowsReturned: false,
      rawValuesReturned: false,
      fallbackUsed: false,
      defaultUsed: false,
      guessed: false,
    });
  }

  const enrichedRequest = cloneJson(bridgeRequest);
  const tier = sourceResolution.tier;
  enrichedRequest.selectorPayload = {
    ...tierNeutralSelectorPayload(selectorPayload),
    tier,
    tier_strategy: {
      mode: "manual",
      selected_tier: tier,
      candidate_tiers: [tier],
      optimisation_intent: "locked_manual",
    },
  };

  return Object.freeze({
    ok: true,
    bound: true,
    state: "selected_project_engine_candidate_tier_bound_source_backed",
    blocker: null,
    bridgeRequest: enrichedRequest,
    sourceResolution,
    clientTierPresent,
    clientTierAuthorityAccepted: false,
    bindingOwner: "server-owned-engine-lex-boundary",
    donorCompatibleTierShapePreserved: true,
    downstreamTierResultContractChanged: false,
    rawRowsReturned: false,
    rawValuesReturned: false,
    fallbackUsed: false,
    defaultUsed: false,
    guessed: false,
  });
}
