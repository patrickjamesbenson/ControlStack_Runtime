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
    startDate,
    startDatePosition: compareDate(startDate),
    dueDate,
    dueDatePosition: compareDate(dueDate),
    updatedAt,
    updatedAtPosition: compareDate(updatedAt),
    comparisonSource: "shell-project-context",
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

export function createTimelinePolicyService({ eventBus } = {}) {
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
      writePolicy: {
        enabled: false,
        reason: "Timeline policy is read-only shell policy. History/review persistence is deferred.",
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