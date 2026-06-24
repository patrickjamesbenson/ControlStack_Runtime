const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);

const STATUS_POLICIES = Object.freeze({
  external_user: Object.freeze(["concept", "submitted", "customer_review"]),
  internal_user: Object.freeze(["concept", "submitted", "customer_review", "internal_review", "approved"]),
  internal_engineer: Object.freeze(["concept", "submitted", "customer_review", "internal_review", "engineering_review", "approved", "on_hold"]),
  developer: Object.freeze(["concept", "submitted", "customer_review", "internal_review", "engineering_review", "approved", "on_hold", "archived"]),
  admin: Object.freeze(["concept", "submitted", "customer_review", "internal_review", "engineering_review", "approved", "on_hold", "archived"]),
});

const TIMELINE_LIFECYCLE_STATUS_ALIASES = Object.freeze({
  business_case: "business_case",
  "business-case": "business_case",
  "business case": "business_case",
  roadmap: "roadmap",
  staged: "scheduled",
  scheduled: "scheduled",
  available: "live",
  approved: "live",
  live: "live",
});

const TIMELINE_LIFECYCLE_STATUS_LABELS = Object.freeze({
  business_case: "Business Case",
  roadmap: "Roadmap",
  scheduled: "Scheduled",
  live: "Live",
});

const TIMELINE_LIFECYCLE_CANONICAL_STATUSES = Object.freeze(["business_case", "roadmap", "scheduled", "live"]);
const TIMELINE_LIFECYCLE_COMPATIBILITY_KEYS = Object.freeze(["staged", "scheduled", "available", "approved", "live"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normaliseStatusKey(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
}

export function normaliseTimelineLifecycleStatus(value, fallback = "business_case") {
  const compactKey = String(value || "").trim().toLowerCase();
  const spacedKey = normaliseStatusKey(value);
  return TIMELINE_LIFECYCLE_STATUS_ALIASES[compactKey]
    || TIMELINE_LIFECYCLE_STATUS_ALIASES[spacedKey]
    || fallback;
}

export function timelineLifecycleStatusLabel(value, fallback = "Business Case") {
  const canonical = normaliseTimelineLifecycleStatus(value, "");
  return TIMELINE_LIFECYCLE_STATUS_LABELS[canonical] || fallback;
}

export function getTimelineLifecycleStatusPolicy() {
  return {
    canonicalStatuses: [...TIMELINE_LIFECYCLE_CANONICAL_STATUSES],
    labels: { ...TIMELINE_LIFECYCLE_STATUS_LABELS },
    aliases: { ...TIMELINE_LIFECYCLE_STATUS_ALIASES },
    compatibility: {
      staged: "scheduled",
      scheduled: "scheduled",
      available: "live",
      approved: "live",
      live: "live",
    },
    preferredUserLabels: {
      staged: "Scheduled",
      scheduled: "Scheduled",
      available: "Live",
      approved: "Live",
      live: "Live",
    },
    source: "timeline-lifecycle-status-compatibility-foundation",
    writeEnabled: false,
  };
}

function roleRank(role) {
  const rank = ROLE_ORDER.indexOf(role);
  return rank >= 0 ? rank : 0;
}

function safeRole(value) {
  return ROLE_ORDER.includes(value) ? value : "external_user";
}

function stageFromProject(project = {}) {
  const current = project.currentProject || {};
  const metadata = project.metadata || {};
  return current.stage || metadata.stage || current.readiness || metadata.readiness || "unknown";
}

function explicitLifecycleStatusFromProject(project = {}) {
  const current = project.currentProject || {};
  const metadata = project.metadata || {};
  return current.lifecycleStatus
    || metadata.lifecycleStatus
    || current.productLifecycleStatus
    || metadata.productLifecycleStatus
    || current.timelineLifecycleStatus
    || metadata.timelineLifecycleStatus
    || "";
}

function lifecycleStatusFromProject(project = {}) {
  const rawStatus = explicitLifecycleStatusFromProject(project);
  if (!rawStatus) {
    return {
      rawStatus: "",
      canonicalStatus: "",
      label: "Not set",
      compatibilityApplied: false,
    };
  }

  const normalisedRawStatus = String(rawStatus).trim().toLowerCase();
  const canonicalStatus = normaliseTimelineLifecycleStatus(rawStatus, "");
  return {
    rawStatus,
    canonicalStatus,
    label: timelineLifecycleStatusLabel(canonicalStatus, "Not set"),
    compatibilityApplied: TIMELINE_LIFECYCLE_COMPATIBILITY_KEYS.includes(normalisedRawStatus),
  };
}

function dateValue(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : null;
}

function compareDate(value, now = Date.now()) {
  const timestamp = dateValue(value);
  if (timestamp === null) return "unknown";
  if (timestamp < now) return "past";
  if (timestamp === now) return "today";
  return "future";
}

function projectDateContext(project = {}) {
  const current = project.currentProject || {};
  const metadata = project.metadata || {};
  const startDate = current.startDate || metadata.startDate || null;
  const dueDate = current.dueDate || metadata.dueDate || metadata.requiredBy || null;
  const updatedAt = current.updatedAt || metadata.restoredAt || metadata.selectedAt || null;
  const lifecycleStatus = lifecycleStatusFromProject(project);
  return {
    stage: stageFromProject(project),
    lifecycleStatus,
    lifecycleStatusLabel: lifecycleStatus.label,
    projectRequirementDate: dueDate,
    projectRequirementDateLabel: dueDate || "not set",
    startDate,
    startDatePosition: compareDate(startDate),
    dueDate,
    dueDatePosition: compareDate(dueDate),
    updatedAt,
    updatedAtPosition: compareDate(updatedAt),
    comparisonSource: "shell-project-context",
  };
}

function projectRequirementDateContract(projectDates = {}) {
  return {
    value: projectDates.projectRequirementDate || null,
    label: projectDates.projectRequirementDateLabel || "not set",
    source: "shell-project-context",
    requiredForFutureProducts: true,
  };
}

function timelineAccessContract() {
  return {
    status: "not-enabled-placeholder",
    label: "not enabled / placeholder",
    contactRepRequired: true,
    source: "shell-placeholder",
    writeEnabled: false,
  };
}

function specialPartsEntitlementContract() {
  return {
    status: "not-live-placeholder",
    source: "shell-placeholder",
    entitlementLive: false,
    userEmailMatched: false,
    userComponentIds: [],
    entitledParts: [],
    readOnly: true,
  };
}

function hasReferenceSnapshotTables(referenceSnapshot) {
  if (!referenceSnapshot || typeof referenceSnapshot !== "object" || Array.isArray(referenceSnapshot)) return false;
  return Array.isArray(referenceSnapshot.USERS)
    || Array.isArray(referenceSnapshot.users)
    || Array.isArray(referenceSnapshot.SYSTEM_COMPONENTS)
    || Array.isArray(referenceSnapshot.system_components);
}

function explicitReferenceSnapshotFrom({ auth = {}, identity = {}, authority = {}, visibility = {}, project = {} } = {}) {
  const candidates = [
    auth.referenceSnapshot,
    identity.referenceSnapshot,
    authority.referenceSnapshot,
    visibility.referenceSnapshot,
    project.referenceSnapshot,
  ];
  return candidates.find(hasReferenceSnapshotTables) || null;
}

function specialPartsEntitlementFor({ specialPartsPolicy, auth, identity, authority, visibility, project }) {
  const referenceSnapshot = explicitReferenceSnapshotFrom({ auth, identity, authority, visibility, project });
  if (!referenceSnapshot || typeof specialPartsPolicy?.getSpecialPartsEntitlementSnapshot !== "function") {
    return specialPartsEntitlementContract();
  }
  try {
    return specialPartsPolicy.getSpecialPartsEntitlementSnapshot({ identity, authority, referenceSnapshot });
  } catch {
    return specialPartsEntitlementContract();
  }
}

function specialPartsOptInContract() {
  return {
    owner: "shell",
    status: "not-live-placeholder",
    source: "shell-project-context-placeholder",
    projectScoped: true,
    selectedPartIds: [],
    dismissedPartIds: [],
    writeEnabled: false,
  };
}

function moduleConsumptionContract() {
  return {
    csSelector: {
      consumesTimelineContext: true,
      ownsSelectionCompatibility: true,
      filteringLive: false,
      warningsLive: false,
    },
    futureModules: {
      consumeTimelineContext: true,
      ownModuleSpecificCompatibility: true,
    },
  };
}

function timelineModelFor({
  actualRole,
  projectRequirementDate,
  timelineAccess,
  specialPartsEntitlement,
  specialPartsOptIn,
  moduleConsumption,
}) {
  const canSeeInternalHints = roleRank(actualRole) >= roleRank("internal_user");
  const lifecyclePolicy = getTimelineLifecycleStatusPolicy();
  return {
    owner: "shell",
    status: "foundation-only",
    source: "shell-project-timeline-model-stage-3a-contract",
    question: "Can this user/project use this product or special part by the project requirement date?",
    defaultLane: {
      id: "today-live",
      label: "Today / Live",
      description: "Live products are available today by default where normal module/product rules allow them.",
    },
    projectRequirementDate,
    futureProducts: {
      status: "contact-rep",
      label: "Future products require Timeline access",
      requirement: "Project requirement date is required before future product availability can be assessed.",
      contactRepFlow: "To register for future product access, contact your rep.",
      matchingLive: false,
    },
    specialParts: {
      status: specialPartsEntitlement.status,
      label: "Special parts may be available to entitled users",
      entitlementLive: specialPartsEntitlement.entitlementLive,
      optInLive: specialPartsOptIn.writeEnabled,
    },
    timelineAccess,
    lifecycleCompatibility: {
      status: "supported-internally",
      stagedMapsTo: lifecyclePolicy.compatibility.staged,
      scheduledMapsTo: lifecyclePolicy.compatibility.scheduled,
      preferredScheduledLabel: lifecyclePolicy.preferredUserLabels.scheduled,
      availableApprovedLiveMapTo: "live",
      writeEnabled: false,
    },
    moduleConsumption,
    internalHints: canSeeInternalHints
      ? [
          "Shell owns identity, project context, project requirement date, Timeline access state, lifecycle status compatibility, special-parts entitlement, and later special-parts project opt-in state.",
          "CS Selector will consume shell Timeline/special-parts context later but keeps selection compatibility checks module-local.",
          "No CS Selector filtering, warning UI, special-parts entitlement lookup, or project write is active in this contract stage.",
          "NVB may still store staged; runtime compatibility presents this as Scheduled.",
        ]
      : [],
    implementation: {
      realNvbSync: false,
      realFutureProductMatching: false,
      realSpecialPartEntitlement: specialPartsEntitlement.entitlementLive === true,
      realProjectWrite: false,
      selectorFiltering: false,
      backendRoutes: false,
      authorityWriteback: false,
      moduleBehaviourChanges: false,
    },
  };
}

function defaultWindowForRole(role) {
  const rank = roleRank(role);
  if (rank >= roleRank("developer")) {
    return { pastDays: 90, futureDays: 180, source: "role-policy:developer" };
  }
  if (rank >= roleRank("internal_user")) {
    return { pastDays: 45, futureDays: 120, source: "role-policy:internal" };
  }
  return { pastDays: 14, futureDays: 60, source: "role-policy:external" };
}

function controlsVisibleFor({ role, project }) {
  const hasProject = Boolean(project?.currentProject?.projectId || project?.metadata?.projectId);
  return hasProject && roleRank(role) >= roleRank("internal_user");
}

function diagnosticsVisibleFor({ role, visibility }) {
  const diagnosticsVisible = visibility?.moduleReasons?.diagnostics?.visible;
  return diagnosticsVisible === true || roleRank(role) >= roleRank("internal_engineer");
}

function gateBehaviorFor({ authority, visibility, project }) {
  const restricted = authority?.privileges?.blacklist?.active === true;
  const hasProject = Boolean(project?.currentProject?.projectId || project?.metadata?.projectId);
  return {
    mode: restricted ? "restricted" : hasProject ? "project-bound" : "read-only-empty-project",
    restrictionStopsTimeline: restricted,
    requiresProject: true,
    missingProjectBehavior: "read-only-no-project",
    visibilitySource: visibility?.source || "shell-visibility-policy",
    policyOwner: "shell",
    selectorMayOverride: false,
  };
}

export function createTimelinePolicyService({ eventBus, specialPartsPolicy } = {}) {
  const state = {
    owner: "shell",
    status: "ready",
    source: "shell-owned-timeline-policy-foundation",
    readOnly: true,
  };

  function getTimelinePolicySnapshot({ auth = {}, identity = {}, authority = {}, visibility = {}, project = {} } = {}) {
    const actualRole = safeRole(authority.actualRole?.value || identity.actualRole || "external_user");
    const displayRole = safeRole(identity.displayRole || actualRole);
    const lane = roleRank(actualRole) >= roleRank("internal_user") ? "internal" : "external";
    const allowedStatuses = STATUS_POLICIES[actualRole] || STATUS_POLICIES.external_user;
    const controlsVisible = controlsVisibleFor({ role: actualRole, project });
    const diagnosticsVisible = diagnosticsVisibleFor({ role: actualRole, visibility });
    const defaultWindow = defaultWindowForRole(actualRole);
    const projectDates = projectDateContext(project);
    const projectRequirementDate = projectRequirementDateContract(projectDates);
    const timelineAccess = timelineAccessContract();
    const specialPartsEntitlement = specialPartsEntitlementFor({ specialPartsPolicy, auth, identity, authority, visibility, project });
    const specialPartsOptIn = specialPartsOptInContract();
    const moduleConsumption = moduleConsumptionContract();
    const timelineModel = timelineModelFor({
      actualRole,
      projectRequirementDate,
      timelineAccess,
      specialPartsEntitlement,
      specialPartsOptIn,
      moduleConsumption,
    });
    const gateBehavior = gateBehaviorFor({ authority, visibility, project });
    const snapshot = {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: state.readOnly,
      nonBootCritical: true,
      identityPolicy: {
        signedIn: auth.session?.authenticated === true,
        subjectEmail: auth.session?.email || auth.user?.email || authority.subject?.email || null,
        identityState: identity.identityState || "external_anonymous",
        classification: identity.classification || authority.subject?.identityClassification || "anonymous",
        classifierOnly: authority.subject?.classifierOnly !== false,
      },
      rolePolicy: {
        actualRole,
        actualRoleSource: authority.actualRole?.source || identity.actualRoleSource || "safe-fallback",
        displayRole,
        displayLane: lane,
        displayPreviewOnly: true,
      },
      visibilityPolicy: {
        owner: visibility.owner || "shell",
        status: visibility.status || "unknown",
        source: visibility.source || "shell-visibility-policy",
        visibleModules: visibility.visibleModules || [],
        hiddenModules: visibility.hiddenModules || [],
      },
      statusPolicy: {
        allowedStatuses: [...allowedStatuses],
        source: `role-policy:${actualRole}`,
        selectorOwnsStatusRules: false,
      },
      lifecycleStatusPolicy: getTimelineLifecycleStatusPolicy(),
      projectRequirementDate,
      timelineAccess,
      specialPartsEntitlement,
      specialPartsOptIn,
      moduleConsumption,
      timelineModel,
      controls: {
        visible: controlsVisible,
        reason: controlsVisible ? "project-and-role-allow-controls" : "controls-hidden-by-shell-policy",
      },
      diagnostics: {
        visible: diagnosticsVisible,
        nonBootCritical: true,
        reason: diagnosticsVisible ? "role-or-shell-policy-allows-diagnostics" : "diagnostics-hidden-by-shell-policy",
      },
      defaultWindow,
      projectDateContext: projectDates,
      gates: gateBehavior,
      persistence: {
        reviewHistoryLive: false,
        selectorPersistenceOwner: false,
        saveRestoreOwner: "shell-project-services",
      },
      ownership: {
        shellOwns: [
          "identity",
          "project-context",
          "project-requirement-date",
          "timeline-access",
          "special-parts-entitlement",
          "special-parts-project-opt-in",
          "lifecycle-status-compatibility",
        ],
        csSelectorOwnsLater: [
          "part-applies-to-selected-system",
          "variant-compatibility",
          "ip-class-compatibility",
          "warning-compatibility-display",
          "clear-or-keep-anyway-ui",
        ],
      },
      writePolicy: {
        enabled: false,
        reason: "Timeline and special-parts context contract is read-only. Entitlement lookup, opt-in persistence, filtering, and project writes are deferred.",
      },
    };
    eventBus?.emit?.("timeline-policy:read", { timelinePolicy: clone(snapshot) });
    return snapshot;
  }

  return {
    owner: state.owner,
    status: state.status,
    getTimelinePolicySnapshot,
  };
}
