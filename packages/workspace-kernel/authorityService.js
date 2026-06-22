import { createNvbAuthorityAdapter } from "./nvbAuthorityAdapter.js";

const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);
const MODULES = Object.freeze(["workspace_home", "cs_selector", "emergence", "scene_builder"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSubscriptionSet() {
  const listeners = new Set();
  return {
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    notify(snapshot) {
      for (const handler of listeners) handler(snapshot);
    },
  };
}

function roleRank(role) {
  const index = ROLE_ORDER.indexOf(role);
  return index < 0 ? 0 : index;
}

function normaliseRole(role, fallback = "external_user") {
  return ROLE_ORDER.includes(role) ? role : fallback;
}

function isInternalClassifier(identity = {}, auth = {}) {
  const classification = identity.classification || auth.user?.classification || "anonymous";
  const email = auth.session?.email || identity.currentUser?.email || "";
  return classification === "internal"
    || classification === "developer"
    || classification === "admin"
    || /@controlstack\.local$/i.test(email)
    || /@controlstack\./i.test(email)
    || /@novonlighting\.com\.au$/i.test(email);
}

function fallbackRole() {
  return "external_user";
}

function moduleEntitlementsFor(role, restrictions = [], blacklistActive = false) {
  if (blacklistActive) {
    return Object.fromEntries(MODULES.map((moduleId) => [moduleId, false]));
  }
  const rank = roleRank(role);
  const blockedModules = new Set(restrictions.filter((item) => item.startsWith("module:")).map((item) => item.replace("module:", "")));
  const entitlements = {
    workspace_home: true,
    cs_selector: rank >= roleRank("external_user"),
    emergence: rank >= roleRank("internal_user"),
    scene_builder: rank >= roleRank("internal_user"),
  };
  for (const moduleId of blockedModules) {
    if (Object.prototype.hasOwnProperty.call(entitlements, moduleId)) entitlements[moduleId] = false;
  }
  return entitlements;
}

function privilegeCapabilities(role, specialVisibility = []) {
  const rank = roleRank(role);
  const capabilities = ["workspace:view", "module:cs_selector:view"];
  if (rank >= roleRank("internal_user")) capabilities.push("module:emergence:view", "module:scene_builder:view");
  if (rank >= roleRank("internal_engineer")) capabilities.push("workspace:visibility:test");
  if (rank >= roleRank("developer")) capabilities.push("workspace:developer-preview");
  if (rank >= roleRank("admin")) capabilities.push("workspace:admin-preview");
  return [...new Set([...capabilities, ...specialVisibility])];
}

function fallbackReasonFor(nvb) {
  return nvb.reason || "Live NVB authority did not return a matched record; conservative shell fallback used.";
}

function deriveAuthority({ auth = {}, identity = {}, crm = {} }, adapter) {
  const nvb = adapter.resolveAuthority({ auth, identity, crm });
  const internalClassifier = isInternalClassifier(identity, auth);
  const fallback = fallbackRole(identity, auth);
  const record = nvb.record || null;
  const nvbRole = record && nvb.matched ? normaliseRole(record.actualRole, fallback) : null;
  const actualRole = nvbRole || fallback;
  const restrictions = record?.restrictions || [];
  const blacklist = {
    active: record?.blacklist?.active === true,
    reason: record?.blacklist?.reason || null,
    source: record ? "nvb" : "none",
  };
  const status = blacklist.active ? "blacklisted" : nvb.matched ? "resolved" : "fallback";
  const source = nvb.matched ? "nvb-authority" : "shell-safe-fallback";
  const actualRoleSource = nvb.matched ? "nvb" : "safe-fallback";
  return {
    owner: "shell",
    status,
    source,
    live: true,
    readOnly: true,
    subject: {
      authUserId: auth.session?.userId || identity.currentUser?.id || null,
      email: auth.session?.email || identity.currentUser?.email || null,
      identityClassification: identity.classification || "anonymous",
      identityState: identity.identityState || "external_anonymous",
      identitySource: identity.lookup?.identitySource || "unknown",
      internalClassifier,
      classifierOnly: true,
      note: "Internal email/domain and identity classification are classifiers only. NVB authority or conservative shell fallback determines final actual role.",
    },
    nvb: {
      available: nvb.available === true,
      checked: nvb.checked === true,
      matched: nvb.matched === true,
      source: nvb.source,
      recordId: nvb.recordId,
      resolvedAt: nvb.resolvedAt,
      confidence: nvb.confidence,
      reason: nvb.reason,
      liveReadStatus: nvb.liveReadStatus || "live-read-unavailable",
      liveReadConfigured: nvb.liveReadConfigured === true,
      nonBootCritical: nvb.nonBootCritical !== false,
      timeoutMs: nvb.timeoutMs || null,
    },
    actualRole: {
      value: blacklist.active ? "external_user" : actualRole,
      nominalValue: actualRole,
      source: actualRoleSource,
      derivedFromNvb: nvb.matched === true,
      internalDomainUsedAsClassifierOnly: true,
      fallbackApplied: nvb.matched !== true,
      fallbackReason: nvb.matched ? null : fallbackReasonFor(nvb),
    },
    privileges: {
      specialVisibility: record?.specialVisibility || [],
      capabilities: privilegeCapabilities(blacklist.active ? "external_user" : actualRole, record?.specialVisibility || []),
      moduleEntitlements: moduleEntitlementsFor(blacklist.active ? "external_user" : actualRole, restrictions, blacklist.active),
      exceptionalEntitlements: record?.exceptionalEntitlements || [],
      restrictions,
      blacklist,
    },
    companyAuthority: {
      status: "not-authority",
      source: crm.company?.source || "none",
      companyName: crm.company?.companyName || "No company linked",
      note: "HubSpot/company context is CRM enrichment only, not visibility authority.",
    },
    developerSupport: {
      displayRolePreview: true,
      actualRoleOverride: true,
      overrideActive: identity.actualRoleOverrideEnabled === true,
      overrideRole: identity.actualRoleOverride || null,
      overrideLabel: "Developer/test only. Not NVB authority.",
    },
    writePolicy: {
      enabled: false,
      reason: "Authority resolution is read-only. NVB writes, role administration, privilege editing, and blacklist editing are excluded.",
    },
  };
}

export function createAuthorityService({ eventBus, nvbAdapter } = {}) {
  const subscriptions = createSubscriptionSet();
  const authorityAdapter = nvbAdapter || createNvbAuthorityAdapter({ eventBus });
  const state = {
    owner: "shell",
    status: "ready",
    source: "live-nvb-authority-resolution",
    lastContext: {},
    lastSnapshot: null,
  };

  function rememberContext(context = {}) {
    if (context.auth || context.identity || context.crm) state.lastContext = context;
    return (context.auth || context.identity || context.crm) ? context : state.lastContext;
  }

  function snapshot(context = {}) {
    const effectiveContext = rememberContext(context);
    const next = deriveAuthority(effectiveContext, authorityAdapter);
    state.lastSnapshot = next;
    return clone(next);
  }

  function notify(reason, context = {}) {
    const nextSnapshot = snapshot(context);
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("authority:changed", { reason, authority: nextSnapshot });
    return nextSnapshot;
  }

  eventBus?.on?.("authority:live-read-completed", ({ reason } = {}) => {
    if (state.lastContext) notify(reason || "authority-live-read-completed", state.lastContext);
  });

  return {
    owner: state.owner,
    status: state.status,
    getAuthoritySnapshot: snapshot,
    refreshAuthority(context = {}, reason = "shell-authority-refresh") {
      return {
        accepted: true,
        authority: notify(reason, context),
      };
    },
    getRoleOptions() {
      return [...ROLE_ORDER];
    },
    subscribe: subscriptions.subscribe,
  };
}
