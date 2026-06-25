import { evaluateSpecialPartsCompatibility } from "./selectorSpecialPartsCompatibility.js";

const TIMELINE_STATUS_ALIASES = Object.freeze({
  available: "live",
  approved: "live",
  live: "live",
  staged: "scheduled",
  scheduled: "scheduled",
  roadmap: "roadmap",
  business_case: "business_case",
  "business-case": "business_case",
  "business case": "business_case",
});

const TIMELINE_STATUS_LABELS = Object.freeze({
  live: "Live",
  scheduled: "Scheduled",
  roadmap: "Roadmap",
  business_case: "Business Case",
});

const SELECTOR_EXPANDER_SECTIONS = Object.freeze([
  {
    id: "projectMetadata",
    title: "Project / metadata",
    status: "preview only",
    description: "Shell-owned project context is shown as preamble/default preview only. This scaffold does not save, restore, or mutate project data.",
    rows: [
      ["state", "preamble/default-preview"],
      ["spec gate", "incomplete"],
      ["writes", "none"],
    ],
  },
  {
    id: "system",
    title: "System",
    status: "preview only",
    description: "Future manual system choices will become constraints. No real system selection, resolver, candidates, or filtering are active in this scaffold.",
    rows: [
      ["manual selections", "constraints later"],
      ["auto selections", "consequences later"],
      ["compatible selections cleared on field change", "no"],
    ],
  },
  {
    id: "environment",
    title: "Environment",
    status: "not started",
    description: "Environment inputs are reserved for the runtime-native selector flow. No IP, IK, interior/exterior, or application filtering is active.",
    rows: [
      ["controls", "placeholder only"],
      ["filtering", "inactive"],
      ["product cards", "none"],
    ],
  },
  {
    id: "lightControl",
    title: "Light & control",
    status: "not started",
    description: "Light output, optic, colour, driver, dimming, sensor, and control choices are placeholders only.",
    rows: [
      ["real selections", "none"],
      ["resolver logic", "not active"],
      ["engine / IES calls", "none"],
    ],
  },
  {
    id: "mounting",
    title: "Mounting",
    status: "not started",
    description: "Mounting mode and suspension details are reserved for later runtime-native controls.",
    rows: [
      ["controls", "placeholder only"],
      ["candidate logic", "not active"],
      ["downstream payload", "none"],
    ],
  },
  {
    id: "penetrationsWiring",
    title: "Penetrations / wiring",
    status: "not started",
    description: "Power entry, cable, wiring, and penetration fields are shell placeholders only.",
    rows: [
      ["controls", "placeholder only"],
      ["mutation", "none"],
      ["build-ready impact", "none"],
    ],
  },
  {
    id: "finishes",
    title: "Finishes",
    status: "not started",
    description: "Finish and colour options are not connected to product data yet.",
    rows: [
      ["controls", "placeholder only"],
      ["filtering", "inactive"],
      ["real product data", "not read"],
    ],
  },
  {
    id: "egressAccessories",
    title: "Egress & accessories",
    status: "diagnostic only",
    description: "Emergency, egress, special parts, and accessory concepts remain diagnostic-only. Auto-derived items may appear selected later but must remain changeable.",
    rows: [
      ["EGRES call", "none"],
      ["Lab call", "none"],
      ["auto-derived items", "changeable later"],
    ],
  },
  {
    id: "runs",
    title: "Runs",
    status: "later",
    description: "Run lengths, segments, accessories, and build outputs are deferred. The scaffold does not call engine, RunTable, Lab, IES, or payload builders.",
    rows: [
      ["run rows", "none"],
      ["engine call", "none"],
      ["build-ready", "false"],
    ],
  },
  {
    id: "timelineDiagnostics",
    title: "Timeline / diagnostics",
    status: "diagnostic only",
    description: "Timeline and special-parts policy diagnostics remain metadata-only. No product-card filtering or slug/build mutation is activated here.",
    rows: [
      ["diagnostic mode", "metadata only"],
      ["filtering active", "no"],
      ["slug/build mutation", "no"],
    ],
  },
  {
    id: "pureReferenceDiagnosticLater",
    title: "Pure Reference diagnostic later",
    status: "later",
    description: "Pure reference proof is not approved for this scaffold. Photometry remains blocked unless an approved Lab pure reference state is introduced later.",
    rows: [
      ["approved Lab pure reference state", "not found"],
      ["warning", "No approved Lab pure reference state found for this selection."],
      ["proof status", "metadata_only"],
      ["diagnostic only", "true"],
      ["production proof", "false"],
    ],
  },
]);

function stateLabel(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === null || value === undefined) return "none";
  return String(value);
}

function readProjectTitle(project) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function readUserName(identity) {
  return identity.currentUser?.name || "Workspace User";
}

function readUserEmail(identity) {
  return identity.currentUser?.email || "No email loaded";
}

function readCompanyName(company) {
  return company?.companyName || "No company loaded";
}

function readWriteEnabled(policy) {
  if (policy.enabled !== undefined) return policy.enabled;
  if (policy.writeFlowsEnabled !== undefined) return policy.writeFlowsEnabled;
  return false;
}

function decisionFor(visibility, moduleId) {
  return visibility.moduleReasons?.[moduleId] || { visible: false, reason: "not_registered" };
}

function readDownstream(adapter, snapshots) {
  return adapter.services.downstream?.getDownstreamContextSnapshot?.({
    identity: snapshots.identity,
    project: snapshots.project,
    visibility: snapshots.visibility,
  }) || {
    owner: "shell",
    status: "unavailable",
    selector: { readiness: {}, runRefs: [], areaRefs: [], fittingRefs: [], emergencyCandidates: [] },
    consumers: {},
    constraints: {},
  };
}

function consumerSummary(consumers = {}) {
  return Object.entries(consumers).map(([id, consumer]) => `${id}:${consumer.status}`).join(", ") || "none";
}

function statusList(policy = {}) {
  return (policy.statusPolicy?.allowedStatuses || []).join(", ") || "none";
}

function timelineWindow(policy = {}) {
  const window = policy.defaultWindow || {};
  return `${window.pastDays || 0}d back / ${window.futureDays || 0}d forward`;
}

function timelineRefs({ local = {}, project = {}, selectorDownstream = {} }) {
  return [
    `project:${project.metadata?.projectId || project.currentProject?.projectId || "none"}`,
    `category:${local.selectedCategory || "none"}`,
    `runs:${selectorDownstream.runRefs?.length || 0}`,
    `areas:${selectorDownstream.areaRefs?.length || 0}`,
    `fittings:${selectorDownstream.fittingRefs?.length || 0}`,
  ].join(", ");
}

function listLength(value) {
  return Array.isArray(value) ? value.length : 0;
}

function compactList(values = []) {
  return values.map((value) => String(value || "").trim()).filter(Boolean);
}

function normaliseTimelineStatus(value) {
  const compactKey = String(value || "").trim().toLowerCase();
  const spacedKey = compactKey.replace(/_/g, " ").replace(/\s+/g, " ");
  return TIMELINE_STATUS_ALIASES[compactKey] || TIMELINE_STATUS_ALIASES[spacedKey] || "live";
}

function timelineStatusLabel(value) {
  return TIMELINE_STATUS_LABELS[normaliseTimelineStatus(value)] || "Live";
}

function parseTimelineDate(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "today" || raw.toLowerCase() === "not set" || raw.toLowerCase() === "none") {
    return { raw, timestamp: null, valid: false };
  }
  const timestamp = Date.parse(raw);
  return { raw, timestamp: Number.isFinite(timestamp) ? timestamp : null, valid: Number.isFinite(timestamp) };
}

function timelineAccessAllowsFuture(timelineAccess = {}) {
  const status = String(timelineAccess.status || "").trim().toLowerCase();
  if (timelineAccess.writeEnabled === true || timelineAccess.enabled === true || timelineAccess.accessEnabled === true) return true;
  return ["enabled", "active", "available", "approved", "live", "granted", "access-granted"].includes(status);
}

function readRequirementDate(projectRequirementDate = {}, timelinePolicy = {}) {
  return projectRequirementDate.value
    || timelinePolicy.projectRequirementDate?.value
    || timelinePolicy.projectDateContext?.projectRequirementDate
    || null;
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

function normaliseTimelineItem(rawItem, index, source) {
  if (!rawItem) return null;
  if (typeof rawItem !== "object") {
    return {
      source,
      kind: source,
      key: String(rawItem),
      label: String(rawItem),
      status: "live",
      statusLabel: "Live",
      statusDate: "",
      effectiveTo: "",
      selected: false,
      raw: rawItem,
    };
  }
  const rawStatus = firstValue(rawItem.status, rawItem.lifecycleStatus, rawItem.productLifecycleStatus, rawItem.timelineLifecycleStatus, rawItem.availabilityStatus);
  const canonicalStatus = normaliseTimelineStatus(rawStatus);
  const key = firstValue(rawItem.key, rawItem.id, rawItem.ref, rawItem.value, rawItem.slug, rawItem.code, `${source}-${index}`);
  const label = firstValue(rawItem.label, rawItem.name, rawItem.description, rawItem.title, key);
  return {
    source,
    kind: firstValue(rawItem.kind, rawItem.type, source),
    key: String(key),
    label: String(label),
    status: canonicalStatus,
    statusLabel: timelineStatusLabel(canonicalStatus),
    rawStatus: rawStatus || "live",
    statusDate: firstValue(rawItem.status_date, rawItem.statusDate, rawItem.availableFrom, rawItem.available_from, rawItem.effective_from),
    effectiveTo: firstValue(rawItem.effective_to, rawItem.effectiveTo, rawItem.expiresAt, rawItem.expiryDate),
    selected: rawItem.selected === true || rawItem.current === true || rawItem.active === true,
    raw: rawItem,
  };
}

function collectTimelineArrayItems(items, source) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => normaliseTimelineItem(item, index, source)).filter(Boolean);
}

function collectSelectorTimelineItems({ local = {}, selectorDownstream = {} } = {}) {
  return [
    ...collectTimelineArrayItems(local.timelineItems, "local.timelineItems"),
    ...collectTimelineArrayItems(local.currentTimelineItems, "local.currentTimelineItems"),
    ...collectTimelineArrayItems(local.selectionItems, "local.selectionItems"),
    ...collectTimelineArrayItems(local.currentSelections, "local.currentSelections"),
    ...collectTimelineArrayItems(local.optionRefs, "local.optionRefs"),
    ...collectTimelineArrayItems(selectorDownstream.optionRefs, "downstream.optionRefs"),
    ...collectTimelineArrayItems(selectorDownstream.fittingRefs, "downstream.fittingRefs"),
    ...collectTimelineArrayItems(selectorDownstream.runRefs, "downstream.runRefs"),
    ...collectTimelineArrayItems(selectorDownstream.emergencyCandidates, "downstream.emergencyCandidates"),
    ...collectTimelineArrayItems(selectorDownstream.sceneBuilderCandidates, "downstream.sceneBuilderCandidates"),
    ...collectTimelineArrayItems(selectorDownstream.complianceCandidates, "downstream.complianceCandidates"),
    ...collectTimelineArrayItems(selectorDownstream.ceilingCandidates, "downstream.ceilingCandidates"),
  ];
}

function evaluateTimelineItem(item, { requirementDate, timelineAccess } = {}) {
  const reasons = [];
  const requirement = parseTimelineDate(requirementDate);
  const statusDate = parseTimelineDate(item.statusDate);
  const effectiveTo = parseTimelineDate(item.effectiveTo);
  const futureAccess = timelineAccessAllowsFuture(timelineAccess);
  const status = normaliseTimelineStatus(item.status);
  let allowed = true;
  let outOfWindow = false;

  if (status === "live") {
    allowed = true;
  } else if (status === "scheduled") {
    if (!requirement.valid) {
      allowed = false;
      reasons.push("scheduled-requires-project-requirement-date");
    }
    if (!futureAccess) {
      allowed = false;
      reasons.push("scheduled-requires-timeline-access");
    }
    if (requirement.valid && statusDate.valid && statusDate.timestamp > requirement.timestamp) {
      allowed = false;
      outOfWindow = true;
      reasons.push("scheduled-after-project-requirement-date");
    }
  } else if (status === "roadmap") {
    allowed = false;
    reasons.push("roadmap-restricted-by-shell-timeline-policy");
  } else if (status === "business_case") {
    allowed = false;
    reasons.push("business-case-restricted-by-shell-timeline-policy");
  }

  if (effectiveTo.valid && effectiveTo.timestamp < Date.now()) {
    allowed = false;
    outOfWindow = true;
    reasons.push("item-effective-date-expired");
  }

  return {
    ...item,
    status,
    statusLabel: timelineStatusLabel(status),
    allowed,
    outOfWindow,
    reasons,
  };
}

function summarizeTimelineFiltering({ local = {}, selectorDownstream = {}, timelinePolicy = {}, selectorTimelineContext = {}, projectRequirementDate = {}, timelineAccess = {} } = {}) {
  const requirementDate = readRequirementDate(projectRequirementDate, timelinePolicy);
  const requirement = parseTimelineDate(requirementDate);
  const items = collectSelectorTimelineItems({ local, selectorDownstream });
  const evaluatedItems = items.map((item) => evaluateTimelineItem(item, { requirementDate, timelineAccess }));
  const filteredItems = evaluatedItems.filter((item) => item.allowed !== true);
  const outOfWindowItems = evaluatedItems.filter((item) => item.outOfWindow === true);
  const affectedSelections = filteredItems.filter((item) => item.selected === true);
  const allowedStatusKeys = ["live"];
  if (requirement.valid && timelineAccessAllowsFuture(timelineAccess)) allowedStatusKeys.push("scheduled");
  const warnings = [];

  if (!items.length) warnings.push("No selector Timeline item rows are available yet; active policy is armed but has no product rows to filter.");
  if (!requirement.valid) warnings.push("No project requirement date is set; live/current products remain usable and future products stay restricted.");
  if (!timelineAccessAllowsFuture(timelineAccess)) warnings.push("Timeline access is not enabled; future products remain restricted by shell policy.");
  if (affectedSelections.length) warnings.push(`Timeline filter affects current selection: ${affectedSelections.map((item) => item.label).join(", ")}.`);

  return {
    status: items.length ? "active-evaluated" : "active-no-items",
    source: "selector-view-model-stage-t1-active-timeline-filter",
    live: true,
    requirementDate: requirementDate || "not set",
    requirementDateValid: requirement.valid,
    accessState: timelineAccess.status || "not-enabled-placeholder",
    accessAllowsFuture: timelineAccessAllowsFuture(timelineAccess),
    allowedStatusKeys,
    filteredItemCount: filteredItems.length,
    outOfWindowItemCount: outOfWindowItems.length,
    warningCount: warnings.length,
    warnings,
    affectedSelections: affectedSelections.map((item) => ({
      label: item.label,
      key: item.key,
      status: item.status,
      reasons: [...item.reasons],
    })),
    evaluatedItems,
    policyQuestion: selectorTimelineContext.modelQuestion || "Can this user/project use this product or special part by the project requirement date?",
  };
}

function readSelectorTimelineContext(adapter, snapshots, timelinePolicy) {
  return snapshots.selectorTimelineContext || adapter.createSelectorTimelineContext?.(timelinePolicy) || {
    owner: "cs_selector",
    status: "passive-consumer-fallback",
    source: "selector-view-model-fallback",
    consumedFrom: "shell-context.timelinePolicy",
    readOnly: true,
    selectorAuthoritative: false,
    projectRequirementDate: {
      value: null,
      label: "not set",
      source: "shell-project-context",
      requiredForFutureProducts: true,
    },
    timelineAccess: {
      status: "not-enabled-placeholder",
      label: "not enabled / placeholder",
      contactRepRequired: true,
      source: "shell-placeholder",
      writeEnabled: false,
    },
    specialPartsEntitlement: {
      status: "not-live-placeholder",
      source: "shell-placeholder",
      entitlementLive: false,
      userEmailMatched: false,
      userComponentIds: [],
      entitledParts: [],
      readOnly: true,
    },
    specialPartsOptIn: {
      owner: "shell",
      status: "not-live-placeholder",
      source: "shell-project-context-placeholder",
      projectScoped: true,
      selectedPartIds: [],
      dismissedPartIds: [],
      writeEnabled: false,
    },
    moduleConsumption: {
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
    },
    implementation: {
      filteringLive: false,
      warningsLive: false,
      entitlementLookupLive: false,
      optInLive: false,
      projectWritesLive: false,
      backendRoutesLive: false,
      slugMutationLive: false,
      buildMutationLive: false,
    },
  };
}

function readEntitledSpecialParts(specialPartsEntitlement = {}) {
  return Array.isArray(specialPartsEntitlement.entitledParts) ? specialPartsEntitlement.entitledParts : [];
}

function buildPassiveSelectorSelectionContext({ local = {}, timelinePolicy = {}, projectRequirementDate = {} } = {}) {
  return {
    selectedSystem: {
      system: local.selectedSystem?.system || local.system || "",
      variantKey: local.selectedSystem?.variantKey || local.variantKey || "",
    },
    selectedVariant: {
      key: local.selectedVariant?.key || local.variantKey || local.selectedVariant || "",
    },
    environment: {
      ipClass: local.environment?.ipClass || local.environment?.ip || local.ipClass || "",
    },
    timeline: {
      projectRequirementDate: projectRequirementDate.value || timelinePolicy.projectRequirementDate?.value || null,
      today: timelinePolicy.today || timelinePolicy.timelineModel?.today || "",
    },
    buildContext: {
      selectedCategory: local.selectedCategory || "overview",
      slug: "not-read-stage-3e-passive",
    },
  };
}

function hasUnknownCheck(compatibility = {}) {
  return Object.values(compatibility.checks || {}).includes("unknown");
}

function summarizeSpecialPartsCompatibility(results = []) {
  if (!results.length) {
    return {
      status: "empty",
      compatibleCount: 0,
      incompatibleCount: 0,
      unknownCount: 0,
    };
  }
  let compatibleCount = 0;
  let incompatibleCount = 0;
  let unknownCount = 0;
  for (const result of results) {
    const compatibility = result.compatibility || {};
    if (compatibility.applies === true) {
      compatibleCount += 1;
    } else if (hasUnknownCheck(compatibility)) {
      unknownCount += 1;
    } else {
      incompatibleCount += 1;
    }
  }
  return {
    status: "passive-evaluated",
    compatibleCount,
    incompatibleCount,
    unknownCount,
  };
}

function authorityActualRole(authority = {}, identity = {}) {
  return authority.actualRole?.value || identity.actualRole || "external_user";
}

function authorityActualRoleSource(authority = {}, identity = {}) {
  return authority.actualRole?.source || identity.actualRoleSource || "safe-fallback";
}

function authorityNominalRole(authority = {}, identity = {}) {
  return authority.actualRole?.nominalValue || authorityActualRole(authority, identity);
}

function shellDisplayRole(authority = {}, identity = {}, visibility = {}) {
  return visibility.inputs?.displayRole || authority.displayRole?.value || authorityActualRole(authority, identity);
}

function shellRequestedDisplayRole(authority = {}, identity = {}, visibility = {}) {
  return visibility.inputs?.requestedDisplayRole || authority.displayRole?.requested || identity.displayRoleRequested || shellDisplayRole(authority, identity, visibility);
}

function shellDisplayRoleClamped(authority = {}, identity = {}, visibility = {}) {
  if (visibility.inputs?.displayRoleClamped !== undefined) return visibility.inputs.displayRoleClamped;
  if (authority.displayRole?.clamped !== undefined) return authority.displayRole.clamped;
  return identity.displayRoleClamped;
}

function readExpanderOpen(local = {}, sectionId) {
  const openState = local.expanderSections || {};
  if (openState[sectionId] === undefined) return true;
  return openState[sectionId] !== false;
}

function boolString(value) {
  return value === true ? "true" : "false";
}

function objectFieldCount(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  return Object.keys(value).length;
}

function selectorStateContractFromLocal(local = {}) {
  return local.selectorStateContract || {};
}

function createStateContractRows(contract = {}) {
  const sideEffectGuards = contract.sideEffectGuards || {};
  return [
    ["selector state contract source", contract.source || "module-local runtime state"],
    ["fresh load is preamble/default-preview only", boolString(contract.freshLoad === true && contract.previewDefaultState === true)],
    ["spec-ready", boolString(contract.specReady === true)],
    ["build-ready", boolString(contract.buildReady === true)],
    ["spec gate complete", boolString(contract.specGateComplete === true)],
    ["build gate complete", boolString(contract.buildGateComplete === true)],
    ["spec slug", contract.specSlug || ""],
    ["committed spec exists", boolString(contract.committedSpecExists === true)],
    ["preview defaults", objectFieldCount(contract.previewDefaults)],
    ["manual constraints", objectFieldCount(contract.manualConstraints)],
    ["auto consequences", objectFieldCount(contract.autoConsequences)],
    ["effective selection fields", objectFieldCount(contract.effectiveSelection)],
    ["committed spec", contract.committedSpec ? "present" : "empty/null"],
    ["provenance entries", objectFieldCount(contract.provenanceMap)],
    ["product cards rendered", boolString(sideEffectGuards.productCardsRendered === true)],
    ["filtering active", boolString(sideEffectGuards.filteringActive === true)],
    ["save/load active", boolString(sideEffectGuards.saveLoadActive === true)],
    ["engine calls active", boolString(sideEffectGuards.engineCallsActive === true)],
    ["Lab calls active", boolString(sideEffectGuards.labCallsActive === true)],
    ["IES calls active", boolString(sideEffectGuards.iesCallsActive === true)],
    ["downstream payload active", boolString(sideEffectGuards.downstreamPayloadActive === true)],
    ["authority writes active", boolString(sideEffectGuards.authorityWritesActive === true)],
    ["raw USERS exposed", boolString(sideEffectGuards.rawUsersExposed === true)],
    ["raw Lab evidence exposed", boolString(sideEffectGuards.rawLabEvidenceExposed === true)],
  ];
}

function createBehaviourContractRows(contract = {}) {
  const behaviourFlags = contract.behaviourFlags || {};
  return [
    ["manual selections are constraints", boolString(behaviourFlags.manualSelectionsAreConstraints === true)],
    ["auto selections are consequences", boolString(behaviourFlags.autoSelectionsAreConsequences === true)],
    ["preserve compatible selections on field change", boolString(behaviourFlags.preserveCompatibleSelectionsOnFieldChange === true)],
    ["auto-derived items remain changeable", boolString(behaviourFlags.autoDerivedItemsRemainChangeable === true)],
    ["spec slug requires complete spec gate", boolString(behaviourFlags.specSlugRequiresCompleteSpecGate === true)],
  ];
}

function createSelectorExpanderShell(local = {}, selectorState) {
  const stateContract = selectorStateContractFromLocal(local);
  return {
    title: "Runtime-native CS Selector single-page expander shell",
    status: "UI/state scaffold only",
    mode: "single-page expander",
    warning: "Fresh load is preamble/default-preview state only, not spec-ready state.",
    stateContract,
    sections: SELECTOR_EXPANDER_SECTIONS.map((section) => ({
      ...section,
      open: readExpanderOpen(local, section.id),
    })),
    stateContractRows: createStateContractRows(stateContract),
    behaviourContractRows: createBehaviourContractRows(stateContract),
    setSectionOpen(sectionId, open) {
      selectorState?.setExpanderSectionOpen?.(sectionId, open);
    },
  };
}

export function createSelectorViewModel({ adapter, selectorState, selectorReferenceStatus = {} }) {
  const snapshots = adapter.readSnapshots();
  const local = selectorState.getSnapshot();
  const flags = snapshots.flags.values || {};
  const project = snapshots.project;
  const currentProject = project.currentProject || {};
  const handoff = snapshots.handoff;
  const identity = snapshots.identity;
  const authority = snapshots.authority || {};
  const company = snapshots.company || snapshots.crm?.company || {};
  const crm = snapshots.crm || {};
  const crmWritePolicy = crm.writePolicy || company.diagnostics || {};
  const selectorDecision = decisionFor(snapshots.visibility, "cs_selector");
  const downstream = readDownstream(adapter, snapshots);
  const selectorDownstream = downstream.selector || {};
  const timelinePolicy = snapshots.timelinePolicy || {};
  const selectorTimelineContext = readSelectorTimelineContext(adapter, snapshots, timelinePolicy);
  const projectRequirementDate = selectorTimelineContext.projectRequirementDate || {};
  const timelineAccess = selectorTimelineContext.timelineAccess || {};
  const specialPartsEntitlement = selectorTimelineContext.specialPartsEntitlement || {};
  const specialPartsOptIn = selectorTimelineContext.specialPartsOptIn || {};
  const moduleConsumption = selectorTimelineContext.moduleConsumption || {};
  const csSelectorConsumption = moduleConsumption.csSelector || {};
  const selectorTimelineImplementation = selectorTimelineContext.implementation || {};
  const entitledSpecialParts = readEntitledSpecialParts(specialPartsEntitlement);
  const passiveSelectorSelectionContext = buildPassiveSelectorSelectionContext({ local, timelinePolicy, projectRequirementDate });
  const specialPartsCompatibilityResults = evaluateSpecialPartsCompatibility(entitledSpecialParts, passiveSelectorSelectionContext);
  const specialPartsCompatibilitySummary = summarizeSpecialPartsCompatibility(specialPartsCompatibilityResults);
  const timelineFiltering = summarizeTimelineFiltering({
    local,
    selectorDownstream,
    timelinePolicy,
    selectorTimelineContext,
    projectRequirementDate,
    timelineAccess,
  });

  return {
    moduleId: adapter.moduleId,
    phase: snapshots.diagnostics?.phase || "selector-fed-downstream-context-foundation",
    route: snapshots.route,
    local,
    expanderShell: createSelectorExpanderShell(local, selectorState),
    identity: {
      owner: identity.owner,
      status: identity.status,
      source: identity.source || "phase-8a-shell-owned-identity-resolver",
      name: readUserName(identity),
      email: readUserEmail(identity),
      identityState: identity.identityState || "external_anonymous",
      classification: identity.classification || "anonymous",
      authorityOwner: authority.owner || "shell",
      authorityStatus: authority.status || "fallback",
      authoritySource: authority.source || "shell-safe-fallback",
      authorityActualRole: authorityActualRole(authority, identity),
      authorityNominalRole: authorityNominalRole(authority, identity),
      authorityActualRoleSource: authorityActualRoleSource(authority, identity),
      derivedActualRole: authorityActualRole(authority, identity),
      actualRole: authorityActualRole(authority, identity),
      actualRoleSource: authorityActualRoleSource(authority, identity),
      actualRoleDerived: stateLabel(authority.actualRole?.derivedFromNvb || authority.actualRole?.fallbackApplied),
      actualRoleOverrideEnabled: stateLabel(authority.actualRole?.overrideEnabled ?? identity.actualRoleOverrideEnabled),
      actualRoleOverride: authority.actualRole?.override || identity.actualRoleOverride || "none",
      displayRole: shellDisplayRole(authority, identity, snapshots.visibility),
      displayRoleRequested: shellRequestedDisplayRole(authority, identity, snapshots.visibility),
      displayRoleClamped: stateLabel(shellDisplayRoleClamped(authority, identity, snapshots.visibility)),
      displayRolePreviewOnly: "yes",
      capabilities: authority.capabilities || identity.capabilities || [],
      canViewSelector: stateLabel(selectorDecision.visible),
    },
    project: {
      owner: project.owner,
      status: project.status,
      title: readProjectTitle(project),
      projectId: project.metadata?.projectId || currentProject.projectId || "none",
      readiness: project.metadata?.readiness || currentProject.readiness || "not-ready",
      source: project.selection?.source || project.metadata?.source || "unknown",
      selectedAt: project.selection?.selectedAt || project.metadata?.selectedAt || "none",
      client: currentProject.client || "none",
      site: currentProject.site || "none",
      dirty: stateLabel(project.dirty || local.localDirty),
      metadataSource: project.metadata?.source || "unknown",
      saveStatus: project.save?.status || project.saveState?.status || "deferred",
      restoreStatus: project.restore?.status || project.restoreState?.status || "deferred",
    },
    company: {
      owner: company.owner || "shell",
      status: company.status || "placeholder",
      source: company.source || "phase-4-placeholder",
      companyName: readCompanyName(company),
      companyId: company.companyId || "none",
      website: company.website || "none",
      lifecycleStage: company.lifecycleStage || "none",
      ownerName: company.ownerName || "none",
      associatedDealId: company.associatedDealId || "none",
      associatedContactId: company.associatedContactId || "none",
    },
    crm: {
      owner: crm.owner || "shell",
      status: crm.status || "placeholder",
      source: crm.source || "phase-4-placeholder",
      writeFlowsEnabled: stateLabel(readWriteEnabled(crmWritePolicy)),
      writeReason: crmWritePolicy.reason || "CRM write flows are deferred.",
      hubspotStatus: crm.hubspot?.status || "placeholder",
      hubspotAvailable: stateLabel(crm.hubspot?.available),
    },
    handoff: {
      owner: handoff.owner,
      status: handoff.status,
      available: stateLabel(handoff.available),
    },
    visibility: {
      owner: snapshots.visibility.owner,
      status: snapshots.visibility.status,
      testMode: stateLabel(snapshots.visibility.testMode),
      selectorVisible: stateLabel(selectorDecision.visible),
      selectorReason: selectorDecision.reason,
      projectMode: snapshots.visibility.inputs?.projectMode || "auto",
      projectPresent: stateLabel(snapshots.visibility.inputs?.projectPresent),
      visibleModules: snapshots.visibility.visibleModules?.join(", ") || "none",
      hiddenModules: snapshots.visibility.hiddenModules?.join(", ") || "none",
      rule: snapshots.visibility.rule,
    },
    timelinePolicy: {
      owner: timelinePolicy.owner || "shell",
      status: timelinePolicy.status || "unavailable",
      source: timelinePolicy.source || "timeline-policy-fallback",
      consumedFrom: selectorTimelineContext.consumedFrom || "shell-context",
      selectorAuthoritative: stateLabel(selectorTimelineContext.selectorAuthoritative === true),
      lane: `${timelinePolicy.rolePolicy?.displayLane || "external"}:${timelinePolicy.rolePolicy?.actualRole || "external_user"}`,
      actualRoleSource: timelinePolicy.rolePolicy?.actualRoleSource || "safe-fallback",
      allowedStatuses: statusList(timelinePolicy),
      controlsVisible: stateLabel(timelinePolicy.controls?.visible),
      controlsReason: timelinePolicy.controls?.reason || "not-provided",
      diagnosticsVisible: stateLabel(timelinePolicy.diagnostics?.visible),
      gateMode: timelinePolicy.gates?.mode || "unknown",
      selectorMayOverride: stateLabel(timelinePolicy.gates?.selectorMayOverride),
      selectorOwnsStatusRules: stateLabel(timelinePolicy.statusPolicy?.selectorOwnsStatusRules),
      defaultWindow: timelineWindow(timelinePolicy),
      projectStage: timelinePolicy.projectDateContext?.stage || "unknown",
      dueDatePosition: timelinePolicy.projectDateContext?.dueDatePosition || "unknown",
      persistenceLive: stateLabel(timelinePolicy.persistence?.reviewHistoryLive),
      writeEnabled: stateLabel(timelinePolicy.writePolicy?.enabled),
      itemRefs: timelineRefs({ local, project, selectorDownstream }),
      selectorConsumptionStatus: selectorTimelineContext.status || "passive-consumer",
      selectorConsumptionSource: selectorTimelineContext.source || "selector-contract-adapter-stage-3c",
      contractQuestion: selectorTimelineContext.modelQuestion || "Can this user/project use this product or special part by the project requirement date?",
      projectRequirementDate: projectRequirementDate.label || "not set",
      projectRequirementDateValue: projectRequirementDate.value || "none",
      projectRequirementDateSource: projectRequirementDate.source || "shell-project-context",
      requiredForFutureProducts: stateLabel(projectRequirementDate.requiredForFutureProducts),
      timelineAccessStatus: timelineAccess.status || "not-enabled-placeholder",
      timelineAccessLabel: timelineAccess.label || "not enabled / placeholder",
      timelineAccessContactRepRequired: stateLabel(timelineAccess.contactRepRequired),
      timelineAccessWriteEnabled: stateLabel(timelineAccess.writeEnabled),
      timelineFilterEvaluationLive: true,
      timelineWarningsLive: true,
      timelineProductCardFilteringLive: false,
      timelineFilteringLive: false,
      timelineFilterStatus: timelineFiltering.status,
      timelineAllowedStatusKeys: timelineFiltering.allowedStatusKeys.join(", "),
      timelineFilteredItemCount: timelineFiltering.filteredItemCount,
      timelineOutOfWindowItemCount: timelineFiltering.outOfWindowItemCount,
      timelineWarnings: timelineFiltering.warnings.join(" | ") || "none",
      timelineAffectedSelections: timelineFiltering.affectedSelections.map((item) => item.label).join(", ") || "none",
      timelineRequirementDate: timelineFiltering.requirementDate,
      timelineAccessState: timelineFiltering.accessState,
      specialPartsEntitlementStatus: specialPartsEntitlement.status || "not-live-placeholder",
      specialPartsEntitlementSource: specialPartsEntitlement.source || "shell-placeholder",
      specialPartsEntitlementLive: stateLabel(specialPartsEntitlement.entitlementLive),
      specialPartsUserEmailMatched: stateLabel(specialPartsEntitlement.userEmailMatched),
      specialPartsComponentIds: listLength(specialPartsEntitlement.userComponentIds),
      specialPartsEntitledCount: listLength(specialPartsEntitlement.entitledParts),
      specialPartsReadOnly: stateLabel(specialPartsEntitlement.readOnly),
      specialPartsOptInOwner: specialPartsOptIn.owner || "shell",
      specialPartsOptInStatus: specialPartsOptIn.status || "not-live-placeholder",
      specialPartsOptInSource: specialPartsOptIn.source || "shell-project-context-placeholder",
      specialPartsOptInProjectScoped: stateLabel(specialPartsOptIn.projectScoped),
      specialPartsSelectedCount: listLength(specialPartsOptIn.selectedPartIds),
      specialPartsDismissedCount: listLength(specialPartsOptIn.dismissedPartIds),
      specialPartsOptInWriteEnabled: stateLabel(specialPartsOptIn.writeEnabled),
      specialPartsCompatibilityStatus: specialPartsCompatibilitySummary.status,
      specialPartsCompatibleCount: specialPartsCompatibilitySummary.compatibleCount,
      specialPartsIncompatibleCount: specialPartsCompatibilitySummary.incompatibleCount,
      specialPartsUnknownCount: specialPartsCompatibilitySummary.unknownCount,
      specialPartsCompatibilityLive: "passive",
      specialPartsFilteringLive: stateLabel(false),
      specialPartsOptInLive: stateLabel(false),
      specialPartsBuildMutationLive: stateLabel(false),
      csSelectorConsumesTimelineContext: stateLabel(csSelectorConsumption.consumesTimelineContext),
      csSelectorOwnsSelectionCompatibility: stateLabel(csSelectorConsumption.ownsSelectionCompatibility),
      filteringLive: stateLabel(false),
      warningsLive: stateLabel(true),
      entitlementLookupLive: stateLabel(selectorTimelineImplementation.entitlementLookupLive),
      optInLive: stateLabel(selectorTimelineImplementation.optInLive),
      projectWritesLive: stateLabel(selectorTimelineImplementation.projectWritesLive),
      backendRoutesLive: stateLabel(selectorTimelineImplementation.backendRoutesLive),
      slugMutationLive: stateLabel(selectorTimelineImplementation.slugMutationLive),
      buildMutationLive: stateLabel(selectorTimelineImplementation.buildMutationLive),
    },
    selectorTimelineContext,
    timelineFiltering,
    selectorReference: selectorReferenceStatus,
    specialPartsCompatibility: {
      status: specialPartsCompatibilitySummary.status,
      source: "selector-view-model-stage-3e-passive-helper-wiring",
      live: "passive",
      filteringLive: false,
      optInLive: false,
      buildMutationLive: false,
      entitledCount: entitledSpecialParts.length,
      compatibleCount: specialPartsCompatibilitySummary.compatibleCount,
      incompatibleCount: specialPartsCompatibilitySummary.incompatibleCount,
      unknownCount: specialPartsCompatibilitySummary.unknownCount,
      results: specialPartsCompatibilityResults,
    },
    downstream: {
      owner: downstream.owner,
      status: downstream.status,
      source: downstream.source,
      selectorStatus: selectorDownstream.status || "foundation-placeholder",
      selectorSource: selectorDownstream.source || "selector-fed-downstream-context-foundation",
      runRefs: selectorDownstream.runRefs?.length || 0,
      areaRefs: selectorDownstream.areaRefs?.length || 0,
      fittingRefs: selectorDownstream.fittingRefs?.length || 0,
      optionRefs: selectorDownstream.optionRefs?.length || 0,
      emergencyCandidates: selectorDownstream.emergencyCandidates?.length || 0,
      sceneBuilderCandidates: selectorDownstream.sceneBuilderCandidates?.length || 0,
      complianceCandidates: selectorDownstream.complianceCandidates?.length || 0,
      ceilingCandidates: selectorDownstream.ceilingCandidates?.length || 0,
      sceneBuilderReadiness: selectorDownstream.readiness?.sceneBuilder || "contract-only",
      egresReadiness: selectorDownstream.readiness?.egres || "contract-only",
      complianceReadiness: selectorDownstream.readiness?.compliance || "blocked-until-egres-package",
      ceilingReadiness: selectorDownstream.readiness?.ceiling || "contract-only",
      consumers: consumerSummary(downstream.consumers),
      constraints: downstream.constraints || {},
    },
    flags: {
      owner: snapshots.flags.owner,
      featureMigrationEnabled: stateLabel(adapter.isFlagEnabled("featureMigrationEnabled")),
      projectPersistenceLive: stateLabel(flags.projectPersistenceLive),
      handoffLive: stateLabel(flags.handoffLive),
      engineSurfaceEnabled: stateLabel(flags.engineSurfaceEnabled),
      runTableSurfaceEnabled: stateLabel(flags.runTableSurfaceEnabled),
      payloadSurfaceEnabled: stateLabel(flags.payloadSurfaceEnabled),
    },
    deferredActions: [
      "Downstream context is foundation-only",
      "Scene Builder is not implemented",
      "EGRES is not implemented",
      "Compliance Matters is not implemented",
      "Ceiling / Coordinated Surfaces is not implemented",
      "Engine / RunTable / payload are out of scope",
      "Actual role is resolved from identity lookup by default",
      "Developer actual-role override is temporary and off by default",
      "Display role is preview-only and clamped",
      "This is not real auth",
      "Project selection is shell-owned",
      "Save is shell-owned and deferred",
      "Restore is shell-owned and deferred",
      "Handoff is shell-owned and deferred",
      "CRM writes are shell-owned and deferred",
      "Timeline filtering and warnings are selector-local active diagnostics",
      "Special-parts compatibility helper is wired passively into the view model only",
      "Special-parts entitlement lookup, opt-in, slug mutation, and build mutation are deferred",
    ],
    responsiveNote: "Selector panel uses module-local sections that can stack inside the shell-owned responsive layout.",
  };
}
