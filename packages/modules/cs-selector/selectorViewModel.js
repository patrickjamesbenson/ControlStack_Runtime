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
    ["default-preview buckets", objectFieldCount(contract.previewDefaults)],
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

function createDefaultPreviewBucketDiagnostics(contract = {}) {
  const previewDefaults = contract.previewDefaults || {};
  const requiredSections = SELECTOR_EXPANDER_SECTIONS.map((section) => section.id);
  const missingSections = requiredSections.filter((sectionId) => !previewDefaults[sectionId]);
  const bucketDiagnostics = SELECTOR_EXPANDER_SECTIONS.map((section) => {
    const bucket = previewDefaults[section.id] || {};
    return {
      id: section.id,
      title: section.title,
      status: bucket.status || section.status || "not started",
      rows: [
        ["bucket id", section.id],
        ["status", bucket.status || section.status || "not started"],
        ["source", bucket.source || "module-local default preview"],
        ["manualConstraintCount", bucket.manualConstraintCount ?? 0],
        ["autoConsequenceCount", bucket.autoConsequenceCount ?? 0],
        ["effectiveFieldCount", bucket.effectiveFieldCount ?? 0],
        ["committed", boolString(bucket.committed === true)],
        ["mutable", boolString(bucket.mutable !== false)],
        ["writes", boolString(bucket.writes === true)],
      ],
    };
  });

  return {
    summaryRows: [
      ["default-preview buckets", objectFieldCount(previewDefaults)],
      ["required preview/default buckets", requiredSections.length],
      ["every section has a preview/default bucket", boolString(missingSections.length === 0)],
      ["missing preview/default buckets", missingSections.length ? missingSections.join(", ") : "none"],
      ["manual constraints", objectFieldCount(contract.manualConstraints)],
      ["auto consequences", objectFieldCount(contract.autoConsequences)],
      ["effective selection fields", objectFieldCount(contract.effectiveSelection)],
      ["committed spec exists", boolString(contract.committedSpecExists === true)],
      ["spec-ready", boolString(contract.specReady === true)],
      ["build-ready", boolString(contract.buildReady === true)],
      ["spec slug", contract.specSlug || ""],
      ["committed spec", contract.committedSpec ? "present" : "empty/null"],
      ["provenance entries", objectFieldCount(contract.provenanceMap)],
    ],
    bucketDiagnostics,
  };
}

function readSectionFieldContract(contract = {}) {
  return contract.sectionFieldContract || { source: "runtime selector field contract", sections: {} };
}

function fieldValueLabel(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return String(value);
}

function createFieldContractRows(field = {}) {
  return [
    ["fieldKey", field.fieldKey || "unknown"],
    ["label", field.label || "unknown"],
    ["sectionId", field.sectionId || "unknown"],
    ["status", field.status || "placeholder"],
    ["inputType", field.inputType || "placeholder"],
    ["source", field.source || "runtime selector field contract"],
    ["manualConstraintEligible", boolString(field.manualConstraintEligible === true)],
    ["autoConsequenceEligible", boolString(field.autoConsequenceEligible === true)],
    ["effectiveSelectionEligible", boolString(field.effectiveSelectionEligible === true)],
    ["committedSpecEligible", boolString(field.committedSpecEligible === true)],
    ["mutable", boolString(field.mutable !== false)],
    ["writes", boolString(field.writes === true)],
    ["productDataBound", boolString(field.productDataBound === true)],
    ["resolverBound", boolString(field.resolverBound === true)],
    ["filteringBound", boolString(field.filteringBound === true)],
    ["requiredForSpecGate", boolString(field.requiredForSpecGate === true)],
    ["requiredForBuildGate", boolString(field.requiredForBuildGate === true)],
    ["value", fieldValueLabel(field.value)],
  ];
}

function createSelectorFieldContractDiagnostics(contract = {}) {
  const sectionFieldContract = readSectionFieldContract(contract);
  const source = sectionFieldContract.source || "runtime selector field contract";
  const rawSections = sectionFieldContract.sections || {};
  const sectionDiagnostics = SELECTOR_EXPANDER_SECTIONS.map((section) => {
    const sectionContract = rawSections[section.id] || {};
    const fields = Array.isArray(sectionContract.fields) ? sectionContract.fields : [];
    return {
      sectionId: section.id,
      title: section.title,
      status: sectionContract.status || section.status || "placeholder",
      source: sectionContract.source || source,
      fieldCount: fields.length,
      fields: fields.map((field) => ({
        fieldKey: field.fieldKey || "unknown",
        label: field.label || field.fieldKey || "unknown",
        status: field.status || "placeholder",
        rows: createFieldContractRows(field),
      })),
    };
  });
  const fields = sectionDiagnostics.flatMap((section) => section.fields.flatMap((field) => field.rows.length ? [field] : []));
  const rawFields = sectionDiagnostics.flatMap((section) => section.fields.map((field) => Object.fromEntries(field.rows.map(([key, value]) => [key, value]))));

  return {
    summaryRows: [
      ["field contract source", source],
      ["section count", sectionDiagnostics.length],
      ["field count", fields.length],
      ["manual constraint eligible fields", rawFields.filter((field) => field.manualConstraintEligible === "true").length],
      ["auto consequence eligible fields", rawFields.filter((field) => field.autoConsequenceEligible === "true").length],
      ["required for spec gate count", rawFields.filter((field) => field.requiredForSpecGate === "true").length],
      ["required for build gate count", rawFields.filter((field) => field.requiredForBuildGate === "true").length],
      ["product data bound", boolString(rawFields.some((field) => field.productDataBound === "true"))],
      ["resolver bound", boolString(rawFields.some((field) => field.resolverBound === "true"))],
      ["filtering bound", boolString(rawFields.some((field) => field.filteringBound === "true"))],
      ["writes", boolString(rawFields.some((field) => field.writes === "true"))],
    ],
    sectionDiagnostics,
  };
}

function countManualConstraintEligibleFields(sectionFieldContract = {}) {
  const sections = sectionFieldContract.sections && typeof sectionFieldContract.sections === "object" && !Array.isArray(sectionFieldContract.sections)
    ? sectionFieldContract.sections
    : {};
  return Object.values(sections).reduce((count, section) => {
    const fields = Array.isArray(section.fields) ? section.fields : [];
    return count + fields.filter((field) => field.manualConstraintEligible === true).length;
  }, 0);
}

function readManualConstraintScaffold(contract = {}) {
  const sectionFieldContract = readSectionFieldContract(contract);
  const scaffold = contract.manualConstraintScaffold && typeof contract.manualConstraintScaffold === "object" && !Array.isArray(contract.manualConstraintScaffold)
    ? contract.manualConstraintScaffold
    : {};
  const manualConstraints = contract.manualConstraints && typeof contract.manualConstraints === "object" && !Array.isArray(contract.manualConstraints)
    ? contract.manualConstraints
    : {};
  const scaffoldConstraints = scaffold.constraints && typeof scaffold.constraints === "object" && !Array.isArray(scaffold.constraints)
    ? scaffold.constraints
    : manualConstraints;
  return {
    source: scaffold.source || "module-local selector scaffold",
    eligibleFieldCount: Number.isFinite(scaffold.eligibleFieldCount)
      ? scaffold.eligibleFieldCount
      : countManualConstraintEligibleFields(sectionFieldContract),
    activeManualConstraintCount: Object.keys(scaffoldConstraints).length,
    placeholderActions: Array.isArray(scaffold.placeholderActions) ? scaffold.placeholderActions : ["Set constraint later"],
    blockedReason: scaffold.blockedReason || "constraint inputs not active yet",
    constraintInputsActive: scaffold.constraintInputsActive === true,
    resolverActive: scaffold.resolverActive === true,
    filteringActive: scaffold.filteringActive === true,
    specReady: scaffold.specReady === true || contract.specReady === true,
    buildReady: scaffold.buildReady === true || contract.buildReady === true,
    writes: scaffold.writes === true,
  };
}

function createManualConstraintScaffoldRows(contract = {}) {
  const scaffold = readManualConstraintScaffold(contract);
  return [
    ["source", scaffold.source],
    ["manual constraint eligible fields count", scaffold.eligibleFieldCount],
    ["active manual constraints", scaffold.activeManualConstraintCount],
    ["constraint inputs active", boolString(scaffold.constraintInputsActive)],
    ["resolver active", boolString(scaffold.resolverActive)],
    ["filtering active", boolString(scaffold.filteringActive)],
    ["specReady", boolString(scaffold.specReady)],
    ["buildReady", boolString(scaffold.buildReady)],
    ["writes", boolString(scaffold.writes)],
    ["placeholder action", scaffold.placeholderActions.join(", ") || "Set constraint later"],
    ["blocked reason", scaffold.blockedReason],
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

function selectionEntries(bucket = {}) {
  if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) return [];
  return Object.values(bucket).sort((left, right) => String(left.label || left.fieldKey).localeCompare(String(right.label || right.fieldKey)));
}

function selectionListText(bucket = {}, emptyLabel = "none") {
  const entries = selectionEntries(bucket);
  return entries.length
    ? entries.map((entry) => `${entry.label || entry.fieldKey}: ${entry.valueLabel || entry.value || "none"}`).join("; ")
    : emptyLabel;
}

function selectionRows(bucket = {}, emptyLabel = "none") {
  const entries = selectionEntries(bucket);
  if (!entries.length) return [[emptyLabel, "none"]];
  return entries.map((entry) => [
    entry.label || entry.fieldKey,
    `${entry.valueLabel || entry.value || "none"} — ${entry.kind || "unknown"}; mutable:${boolString(entry.mutable !== false)}`,
  ]);
}

function compatibilityWarningRows(diagnostics = {}) {
  const warnings = Array.isArray(diagnostics.warnings) ? diagnostics.warnings : [];
  if (!warnings.length) return [["compatibility warnings", "none"]];
  return warnings.map((warning) => [
    warning.label || warning.fieldKey || "field",
    `${warning.message || "diagnostic warning"} autoCleared:${boolString(warning.autoCleared === true)}`,
  ]);
}

function blockedFieldRows(diagnostics = {}) {
  const fields = Array.isArray(diagnostics.blockedIncompatibleFields) ? diagnostics.blockedIncompatibleFields : [];
  if (!fields.length) return [["blocked/incompatible fields", "none"]];
  return fields.map((field) => [
    field.label || field.fieldKey || "field",
    `${field.reason || "diagnostic only"} autoCleared:${boolString(field.autoCleared === true)}`,
  ]);
}

function createSelectionControls(contract = {}, selectorState, onLocalStateChange) {
  const sectionFieldContract = readSectionFieldContract(contract);
  const manualConstraints = contract.manualConstraints || {};
  const autoConsequences = contract.autoConsequences || {};
  const defaultPreviewSelections = contract.defaultPreviewSelections || {};
  const effectiveSelection = contract.effectiveSelection || {};

  return SELECTOR_EXPANDER_SECTIONS.map((section) => {
    const sectionContract = sectionFieldContract.sections?.[section.id] || {};
    const fields = Array.isArray(sectionContract.fields) ? sectionContract.fields : [];
    return {
      sectionId: section.id,
      title: section.title,
      fields: fields
        .filter((field) => field.effectiveSelectionEligible === true && Array.isArray(field.options) && field.options.length)
        .map((field) => {
          const current = effectiveSelection[field.fieldKey] || defaultPreviewSelections[field.fieldKey] || autoConsequences[field.fieldKey] || null;
          const isManual = Boolean(manualConstraints[field.fieldKey]);
          const isAuto = Boolean(autoConsequences[field.fieldKey]) && !isManual;
          const isDefault = Boolean(defaultPreviewSelections[field.fieldKey]) && !isManual && !isAuto;
          return {
            fieldKey: field.fieldKey,
            label: field.label || field.fieldKey,
            value: current?.value || "",
            valueLabel: current?.valueLabel || "none",
            stateLabel: isManual ? "manual constraint" : isAuto ? "auto consequence / changeable" : isDefault ? "default-preview / preamble" : "unselected",
            selectedKind: current?.kind || "unselected",
            manualConstraint: isManual,
            autoConsequence: isAuto,
            defaultPreview: isDefault,
            mutable: true,
            options: field.options.map((option) => ({ ...option })),
          };
        }),
      setFieldValue(fieldKey, value) {
        selectorState?.setSelectorFieldValue?.(fieldKey, value);
        onLocalStateChange?.();
      },
      clearManualConstraint(fieldKey) {
        selectorState?.clearSelectorFieldValue?.(fieldKey);
        onLocalStateChange?.();
      },
    };
  }).filter((section) => section.fields.length);
}

function createManualConstraintBehaviour(contract = {}, selectorState, onLocalStateChange) {
  const diagnostics = contract.compatibilityDiagnostics || {};
  return {
    requiredWording: [
      "Manual selections are constraints.",
      "Auto selections are consequences.",
      "Compatible manual selections are preserved when other fields change.",
      "Auto-derived selections may appear selected, but remain changeable.",
      "Fresh load is default-preview / preamble state, not spec-ready.",
      "No spec-ready slug is generated in this slice.",
      "Selector does not provide Lab proof.",
    ],
    summaryRows: [
      ["current mode", contract.selectorMode || "default-preview"],
      ["selected fields", selectionListText(contract.effectiveSelection, "none")],
      ["manual constraints list", selectionListText(contract.manualConstraints, "none")],
      ["auto consequences list", selectionListText(contract.autoConsequences, "none")],
      ["default-preview selections list", selectionListText(contract.defaultPreviewSelections, "none")],
      ["compatibility warnings", Array.isArray(diagnostics.warnings) && diagnostics.warnings.length ? diagnostics.warnings.map((warning) => warning.message).join(" | ") : "none"],
      ["blocked/incompatible fields", Array.isArray(diagnostics.blockedIncompatibleFields) && diagnostics.blockedIncompatibleFields.length ? diagnostics.blockedIncompatibleFields.map((field) => `${field.label || field.fieldKey}: ${field.reason}`).join(" | ") : "none"],
      ["specReady", boolString(contract.specReady === true)],
      ["slugGenerationEnabled", boolString(contract.slugGenerationEnabled === true)],
      ["selectorMutationScope", contract.selectorMutationScope || "local UI state only"],
      ["boardDataMutationEnabled", boolString(contract.boardDataMutationEnabled === true)],
      ["labProofAuthority", boolString(contract.labProofAuthority === true)],
      ["iesGenerationEnabled", boolString(contract.iesGenerationEnabled === true)],
      ["payloadGenerationEnabled", boolString(contract.payloadGenerationEnabled === true)],
      ["runTableMutationEnabled", boolString(contract.runTableMutationEnabled === true)],
    ],
    manualConstraintRows: selectionRows(contract.manualConstraints, "manual constraints"),
    autoConsequenceRows: selectionRows(contract.autoConsequences, "auto consequences"),
    defaultPreviewRows: selectionRows(contract.defaultPreviewSelections, "default-preview selections"),
    compatibilityWarningRows: compatibilityWarningRows(diagnostics),
    blockedFieldRows: blockedFieldRows(diagnostics),
    controlSections: createSelectionControls(contract, selectorState, onLocalStateChange),
  };
}

function optionValuesMatch(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

function dbConstraintMap(local = {}) {
  const constraints = local.dbBackedSelector?.manualConstraints;
  if (!constraints || typeof constraints !== "object" || Array.isArray(constraints)) return {};
  return constraints;
}

function dbConstraintValueMap(local = {}) {
  return Object.fromEntries(Object.entries(dbConstraintMap(local)).map(([fieldKey, record]) => [fieldKey, String(record?.value || "").trim()]).filter(([, value]) => value));
}

function dbOptionsPayload(selectorReferenceStatus = {}) {
  return selectorReferenceStatus.selectorOptions || selectorReferenceStatus.options || selectorReferenceStatus;
}

function dbOptionsFields(selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  return Array.isArray(payload.fields) ? payload.fields : [];
}

function dbOptionField(selectorReferenceStatus = {}, fieldKey) {
  return dbOptionsFields(selectorReferenceStatus).find((field) => field.fieldKey === fieldKey) || null;
}

function dbOptionFieldOptions(selectorReferenceStatus = {}, fieldKey) {
  const field = dbOptionField(selectorReferenceStatus, fieldKey);
  return Array.isArray(field?.options) ? field.options : [];
}

function dbOptionLabel(selectorReferenceStatus = {}, fieldKey, value) {
  const option = dbOptionFieldOptions(selectorReferenceStatus, fieldKey).find((item) => optionValuesMatch(item.value, value));
  return option?.label || String(value || "");
}

function dbOptionsSourceReady(selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  if (payload.sourceReady === true) return true;
  const source = payload.source || selectorReferenceStatus.source || {};
  return selectorReferenceStatus.ok === true && source.present !== false && source.readable !== false && source.parseable !== false;
}

function dbSelectedConstraintRows(surface = {}) {
  const constraints = Array.isArray(surface.manualConstraints) ? surface.manualConstraints : [];
  if (!constraints.length) return [["manual constraints", "none yet"]];
  return constraints.map((constraint) => [constraint.label || constraint.fieldKey, `${constraint.valueLabel || constraint.value} — ${constraint.status || "manual constraint"}`]);
}

function dbAutoConsequenceRows(surface = {}) {
  const consequences = Array.isArray(surface.autoConsequences) ? surface.autoConsequences : [];
  if (!consequences.length) return [["auto consequences", "none mapped from current source"]];
  return consequences.map((consequence) => [consequence.label || consequence.fieldKey, `${consequence.valueLabel || consequence.value} — ${consequence.reason || "auto consequence"}`]);
}

function dbBlockedRows(surface = {}) {
  const blocked = Array.isArray(surface.blockedItems) ? surface.blockedItems : [];
  if (!blocked.length) return [["blocked / missing", "none"]];
  return blocked.map((item) => [item.label || item.fieldKey || "field", item.reason || item.status || "blocked"]);
}

function createDbBackedCandidateSummaryRows(surface = {}) {
  const summary = surface.candidateSummary || {};
  return [
    ["candidate state", summary.state || "default preview"],
    ["source readiness", surface.sourceReady === true ? "ready" : "unavailable"],
    ["option fields mapped", summary.optionFieldCount ?? 0],
    ["available fields", summary.availableFieldCount ?? 0],
    ["workflow sections", summary.workflowSectionCount ?? 0],
    ["workflow fields mapped", summary.workflowMappedFieldCount ?? 0],
    ["donor fields represented", summary.donorFieldParityCounts?.total ?? 0],
    ["manual constraints", summary.manualConstraintCount ?? 0],
    ["auto consequences", summary.autoConsequenceCount ?? 0],
    ["blocked / missing items", summary.blockedCount ?? 0],
    ["spec gate", "incomplete — preview-ready does not mean spec-ready"],
    ["Lab Proof", "not established — Selector preview is not proof authority"],
    ["writes", "disabled"],
  ];
}

function createDbBackedPathRows(surface = {}) {
  const path = Array.isArray(surface.pathToSpecReady) ? surface.pathToSpecReady : [];
  const rows = path.length ? path.map((item, index) => [`step ${index + 1}`, item]) : [["future spec-ready", "requires complete spec gate later"]];
  rows.push(["Selector boundary", "Selector previews selection readiness. Lab Proof proves later."]);
  return rows;
}

function dbOptionSearchText(option = {}) {
  return String(`${option.value || ""} ${option.label || ""}`).trim().toLowerCase();
}

function dbConstraintSearchText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function dbOptionLocallyCompatible(fieldKey, option = {}, constraints = {}, selectorReferenceStatus = {}) {
  const text = dbOptionSearchText(option);
  const system = dbConstraintSearchText(constraints.system);
  const systemLabel = constraints.system ? dbConstraintSearchText(dbOptionLabel(selectorReferenceStatus, "system", constraints.system)) : "";
  if (fieldKey === "optic" && system) {
    const tokens = [system, ...system.split("|"), systemLabel, ...systemLabel.split("|")]
      .map((item) => item.trim())
      .filter((item) => item.length > 1);
    if (tokens.some((token) => text.includes(token))) return true;
    return false;
  }

  const io = dbConstraintSearchText(constraints.interiorExterior);
  if (fieldKey === "ipRating" && (io.includes("exterior") || io.includes("outdoor"))) return text.includes("ip65") || text.includes("ip66") || text.includes("ip67");

  const application = dbConstraintSearchText(constraints.application);
  if (fieldKey === "ikRating" && (application.includes("school") || application.includes("education"))) return text.includes("ik10");

  const control = dbConstraintSearchText(constraints.controlType);
  if (fieldKey === "driver" && control) {
    if (control.includes("dali")) return text.includes("dali") || text.includes("dt8");
    if (control.includes("non") || control.includes("switch")) return text.includes("non") || text.includes("switch") || text.includes("standard");
  }

  if (fieldKey === "specialParts") {
    const ip = dbConstraintSearchText(constraints.ipRating);
    const mount = dbConstraintSearchText(constraints.mountStyle);
    const emergency = dbConstraintSearchText(constraints.emergency);
    const sensor = dbConstraintSearchText(constraints.sensor);
    if (emergency && !(text.includes("emergency") || text.includes("egress"))) return false;
    if (sensor && !(text.includes("sensor") || text.includes("pir") || text.includes("occupancy") || text.includes("microwave"))) return false;
    if (ip.includes("ip65") && !(text.includes("ip65") || text.includes("kit") || text.includes("end"))) return false;
    if (mount.includes("suspend") && !(text.includes("suspend") || text.includes("wire") || text.includes("kit"))) return false;
  }

  return true;
}

function enrichDbOptionFields(selectorReferenceStatus = {}, local = {}) {
  const selectedConstraints = dbConstraintValueMap(local);
  return dbOptionsFields(selectorReferenceStatus).map((field) => {
    const selectedValue = selectedConstraints[field.fieldKey] || "";
    const options = Array.isArray(field.options) ? field.options.map((option) => {
      const selected = selectedValue ? optionValuesMatch(option.value, selectedValue) : option.selected === true;
      const locallyCompatible = dbOptionLocallyCompatible(field.fieldKey, option, selectedConstraints, selectorReferenceStatus);
      const blocked = option.blocked === true || !locallyCompatible;
      return {
        ...option,
        selected,
        status: blocked ? "blocked" : (option.status || "available"),
        blocked,
        blockedReason: blocked
          ? option.blockedReason || "Blocked by current manual constraints; shown rather than silently hidden."
          : option.blockedReason || "",
      };
    }) : [];
    return {
      ...field,
      status: options.some((option) => option.status === "available") ? field.status || "available" : field.futureMapped ? "future-mapped" : "blocked",
      selectedValue,
      selectedLabel: selectedValue ? dbOptionLabel(selectorReferenceStatus, field.fieldKey, selectedValue) : "",
      options,
    };
  });
}

function dbWorkflowSections(selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  return Array.isArray(payload.workflowSections) ? payload.workflowSections : [];
}

function labelFromWorkflowField(field = {}, value = "") {
  const option = (Array.isArray(field.options) ? field.options : []).find((item) => optionValuesMatch(item.value, value));
  return option?.label || String(value || "");
}

function enrichDbWorkflowSections(selectorReferenceStatus = {}, local = {}) {
  const selectedConstraints = dbConstraintValueMap(local);
  return dbWorkflowSections(selectorReferenceStatus).map((section) => ({
    ...section,
    fields: (Array.isArray(section.fields) ? section.fields : []).map((field) => {
      const selectedValue = selectedConstraints[field.fieldKey] || "";
      const options = Array.isArray(field.options) ? field.options.map((option) => {
        const selected = selectedValue ? optionValuesMatch(option.value, selectedValue) : option.selected === true;
        return {
          ...option,
          selected,
          rawRowsExposed: false,
        };
      }) : [];
      return {
        ...field,
        selectedValue,
        selectedLabel: selectedValue ? labelFromWorkflowField({ ...field, options }, selectedValue) : field.selectedLabel || "",
        options,
        rawRowsExposed: false,
      };
    }),
    rawRowsExposed: false,
  }));
}

function createDbManualConstraints(selectorReferenceStatus = {}, local = {}) {
  const fields = enrichDbOptionFields(selectorReferenceStatus, local);
  return Object.entries(dbConstraintMap(local)).map(([fieldKey, constraint]) => {
    const field = fields.find((item) => item.fieldKey === fieldKey);
    const option = field?.options?.find((item) => optionValuesMatch(item.value, constraint.value));
    return {
      fieldKey,
      label: field?.label || constraint.label || fieldKey,
      value: constraint.value,
      valueLabel: option?.label || constraint.valueLabel || constraint.value,
      status: option?.blocked ? "blocked" : "manual constraint",
      blocked: option?.blocked === true,
      reason: option?.blockedReason || "manual selection is treated as a durable constraint",
      mutable: true,
      writes: false,
    };
  });
}

function createDbAvailableConsequence(fields = [], fieldKey, constraints = {}) {
  const field = fields.find((item) => item.fieldKey === fieldKey);
  if (!field || constraints[fieldKey]) return null;
  const option = (field.options || []).find((item) => item.status === "available") || null;
  if (!option) return null;
  return {
    fieldKey,
    label: field.label || fieldKey,
    value: option.value,
    valueLabel: option.label,
    kind: "auto-consequence",
    source: "safe Selector Reference option state",
    reason: fieldKey === "driver"
      ? "consequence of current control/system option state where mapped"
      : "consequence of current IP, mounting, emergency, and sensor option state where mapped",
    mutable: true,
    writes: false,
  };
}

function createDbAutoConsequences(fields = [], local = {}) {
  const constraints = dbConstraintValueMap(local);
  return [
    createDbAvailableConsequence(fields, "driver", constraints),
    createDbAvailableConsequence(fields, "specialParts", constraints),
  ].filter(Boolean);
}

function createDbBackedSelectorSurface(selectorReferenceStatus = {}, local = {}, selectorState, onLocalStateChange) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  const sourceReady = dbOptionsSourceReady(selectorReferenceStatus);
  const fields = enrichDbOptionFields(selectorReferenceStatus, local);
  const workflowSections = enrichDbWorkflowSections(selectorReferenceStatus, local);
  const manualConstraints = createDbManualConstraints(selectorReferenceStatus, local);
  const autoConsequences = createDbAutoConsequences(fields, local);
  const blockedItems = [
    ...(Array.isArray(payload.blockedItems) ? payload.blockedItems : []),
    ...manualConstraints.filter((constraint) => constraint.blocked).map((constraint) => ({
      fieldKey: constraint.fieldKey,
      label: constraint.label,
      value: constraint.value,
      valueLabel: constraint.valueLabel,
      status: "blocked",
      reason: constraint.reason,
    })),
  ];
  const summary = {
    ...(payload.candidateSummary || {}),
    manualConstraintCount: manualConstraints.length,
    autoConsequenceCount: autoConsequences.length,
    blockedCount: blockedItems.length,
  };
  return {
    title: "CS Selector Preview",
    subtitle: "Read-only DB-backed candidate preview. Manual selections are constraints; auto selections are consequences.",
    sourceReady,
    status: payload.status || selectorReferenceStatus.status || "not-requested",
    badges: [
      sourceReady ? "source ready" : "source unavailable",
      summary.state || (manualConstraints.length ? "manual constraints preview" : "default preview"),
      "spec gate incomplete",
      "not Lab Proof",
      "writes disabled",
    ],
    requiredSafetyCopy: "Read-only preview. No spec, slug, IES, payload, RunTable, Lab Proof, Controlled Record, RREG approval, custody transfer, Board Data write, or hidden write-back is created here.",
    proofCopy: "Selector previews selection readiness. Lab Proof proves later.",
    fields,
    workflowSections,
    donorFieldParity: payload.donorFieldParity || null,
    specialPartsEntitlementSummary: payload.specialPartsEntitlementSummary || null,
    manualConstraints,
    autoConsequences,
    blockedItems,
    candidateSummary: summary,
    candidateSummaryRows: createDbBackedCandidateSummaryRows({ ...payload, sourceReady, candidateSummary: summary, blockedItems }),
    manualConstraintRows: dbSelectedConstraintRows({ manualConstraints }),
    autoConsequenceRows: dbAutoConsequenceRows({ autoConsequences }),
    blockedRows: dbBlockedRows({ blockedItems }),
    pathRows: createDbBackedPathRows(payload),
    setFieldValue(fieldKey, value) {
      const label = dbOptionLabel(selectorReferenceStatus, fieldKey, value);
      selectorState?.setDbBackedSelectorFieldValue?.(fieldKey, value, label);
      onLocalStateChange?.();
    },
    clearFieldValue(fieldKey) {
      selectorState?.clearDbBackedSelectorFieldValue?.(fieldKey);
      onLocalStateChange?.();
    },
  };
}

const COMPATIBILITY_RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  compatibilityExplanationOnly: true,
  activeResolverEnabled: false,
  autoSelectionMutationEnabled: false,
  manualConstraintMutationEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  boardDataWriteEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  engineExecutionEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  drawingGenerationEnabled: false,
  hiddenWriteBackEnabled: false,
});

const SPEC_GATE_RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  specGateExplanationOnly: true,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  activeResolverEnabled: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  iesGenerationEnabled: false,
  engineExecutionEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  drawingGenerationEnabled: false,
  labProofAuthority: false,
  hiddenWriteBackEnabled: false,
});

const COMPATIBILITY_DIMENSIONS = Object.freeze([
  "product family",
  "body/profile",
  "board",
  "optic",
  "diffuser/lens",
  "driver",
  "electrical operating window",
  "physical fit",
  "IP / IK / environment",
  "emergency / EGRES dependency",
  "compliance dependency",
  "special parts dependency",
  "IES candidate readiness",
  "Lab Proof mapping",
  "missing metadata",
]);

const COMPATIBILITY_REASON_STATES = Object.freeze([
  "compatible",
  "incompatible",
  "unknown",
  "missing metadata",
  "blocked by policy",
  "candidate only",
  "requires review",
  "requires Lab Proof",
]);

const SPEC_GATE_STATES = Object.freeze([
  "preamble / default preview",
  "manually constrained",
  "auto consequences visible",
  "candidate-ready",
  "spec-gate incomplete",
  "spec-ready",
  "blocked / requires review",
]);

const SPEC_GATE_REQUIREMENTS = Object.freeze([
  "product family selected",
  "system/body selected",
  "board candidate resolved",
  "optic/diffuser intent resolved",
  "driver/electrical readiness resolved",
  "accessory/special-parts policy checked",
  "IES candidate readiness checked",
  "compliance/EGRES dependencies checked",
  "Board Data reference present",
  "Lab Proof status clearly separated",
  "required review warnings surfaced",
]);

const SPEC_GATE_MISSING_BLOCKED_REASON_CATEGORIES = Object.freeze([
  "missing manual constraint",
  "unresolved auto consequence",
  "missing Board Data reference",
  "missing IES candidate",
  "missing Lab Proof mapping",
  "policy warning",
  "requires human review",
  "future-gated downstream artefact",
  "unsafe authority claim",
]);

const SELECTOR_READINESS_BOUNDARY_COPY = Object.freeze([
  "Selector readiness diagnostics are read-only in this slice.",
  "Compatibility is not proof.",
  "Spec-ready does not mean production-proven.",
  "Slug generation remains disabled unless an approved future spec gate is complete.",
  "A candidate may be compatible without being Lab proven.",
  "Board Data defines metadata. Selector resolves. Lab proves.",
  "IES Builder may create candidate photometric artefacts later.",
  "Engine Flow explains the confidence path; it does not execute it.",
]);

const SELECTOR_READINESS_RELATIONSHIP_MAP = Object.freeze([
  Object.freeze({ system: "Board Data", role: "metadata authority" }),
  Object.freeze({ system: "Selector", role: "selection and readiness reasoning" }),
  Object.freeze({ system: "IES Builder", role: "future candidate photometric artefacts" }),
  Object.freeze({ system: "Engine Flow", role: "confidence path explanation" }),
  Object.freeze({ system: "Lab Proof", role: "production proof authority" }),
  Object.freeze({ system: "Controlled Records", role: "future approval/provenance trail" }),
]);

const CANDIDATE_STATE_RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  candidateStateExplanationOnly: true,
  activeResolverEnabled: false,
  selectorMutationEnabled: false,
  compatibleSelectionClearingEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  iesGenerationEnabled: false,
  labProofAuthority: false,
  controlledRecordWriteEnabled: false,
  rregApprovalEnabled: false,
  rregCustodyTransferEnabled: false,
  boardDataWriteEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenWriteBackEnabled: false,
});

const CANDIDATE_STATE_CATEGORIES = Object.freeze([
  "default preview",
  "manually constrained candidate",
  "auto-consequence candidate",
  "compatibility-explained candidate",
  "candidate-ready",
  "spec-gate incomplete",
  "spec-ready candidate",
  "downstream artefacts disabled",
  "proof not established",
  "review/provenance future-gated",
]);

const CANDIDATE_EXPLAINER_FIELDS = Object.freeze([
  "candidate_state",
  "manual_constraints",
  "auto_consequences",
  "effective_selection",
  "compatibility_summary",
  "spec_gate_summary",
  "ies_candidate_readiness",
  "lab_proof_readiness",
  "controlled_record_expectation",
  "rreg_review_expectation",
  "downstream_outputs_disabled",
  "proof_boundary",
  "unsafe_claims_blocked",
]);

const CANDIDATE_READINESS_CHAIN_MAP = Object.freeze([
  Object.freeze({ system: "Selector readiness", role: "selection/candidate reasoning" }),
  Object.freeze({ system: "IES Builder readiness", role: "candidate artefact readiness later" }),
  Object.freeze({ system: "Lab Proof readiness", role: "proof boundary, not active proof authority in this slice" }),
  Object.freeze({ system: "Controlled Records", role: "future provenance/disposition trail" }),
  Object.freeze({ system: "RREG", role: "future reviewer/approver/custody mapping" }),
  Object.freeze({ system: "Engine Flow", role: "confidence path explanation, not execution" }),
]);

const CANDIDATE_STATE_BOUNDARY_COPY = Object.freeze([
  "Selector candidate state is read-only and diagnostic in this slice.",
  "A candidate is not a production specification.",
  "A compatible candidate is not Lab proven.",
  "Spec-ready does not mean production-proven.",
  "Selector does not generate IES, create Controlled Records, invoke RREG, or claim Lab Proof here.",
  "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
  "Controlled Records records provenance later. RREG maps review and custody later.",
]);

const SELECTOR_RESOLVER_PREVIEW_RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  resolverPreviewOnly: true,
  previewResultSummaryOnly: true,
  committedSelectorResult: false,
  productionSpecification: false,
  downstreamArtefactCreated: false,
  activeResolverEnabled: false,
  selectorMutationEnabled: false,
  compatibleSelectionClearingEnabled: false,
  boardDataWriteEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  slugAuthorityEnabled: false,
  iesGenerationEnabled: false,
  payloadGenerationEnabled: false,
  runTableGenerationEnabled: false,
  drawingGenerationEnabled: false,
  labProofAuthority: false,
  proofAuthority: false,
  controlledRecordWriteEnabled: false,
  controlledRecordCreated: false,
  rregAssignmentEnabled: false,
  rregAssignmentCreated: false,
  rregApprovalEnabled: false,
  rregCustodyTransferEnabled: false,
  runtimeDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
  writeBackCreated: false,
  rawRowsExposed: false,
  rawUsersExposed: false,
  rawLabEvidenceExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
});

const SELECTOR_RESOLVER_PREVIEW_CATEGORIES = Object.freeze([
  "default preview",
  "source unavailable",
  "source readable",
  "source missing required tables",
  "manually constrained preview",
  "auto consequence preview",
  "compatibility explained preview",
  "preview candidate ready",
  "spec gate incomplete",
  "downstream outputs disabled",
  "proof not established",
  "review/provenance future-gated",
]);

const SELECTOR_RESOLVER_PREVIEW_FIELD_NAMES = Object.freeze([
  "preview_state",
  "source_status",
  "source_tables_ready",
  "missing_tables",
  "manual_constraints",
  "auto_consequences",
  "effective_selection",
  "compatibility_summary",
  "unresolved_reasons",
  "spec_gate_status",
  "slug_preview_status",
  "ies_generation_status",
  "lab_proof_status",
  "controlled_records_status",
  "rreg_status",
  "downstream_outputs_disabled",
  "unsafe_claims_blocked",
]);

const SELECTOR_RESOLVER_PREVIEW_BOUNDARY_COPY = Object.freeze([
  "Preview result is explanatory only.",
  "This is not a committed Selector result.",
  "This is not a production specification.",
  "This is not a slug authority.",
  "This is not Lab Proof.",
  "No downstream artefact, record, approval, custody transfer, or write is created here.",
  "Manual selections remain constraints. Auto selections remain consequences.",
  "Compatible selections are not cleared by this preview.",
  "Preview-ready does not mean spec-ready.",
  "Spec-ready does not mean Lab proven.",
  "Board Data defines metadata. Selector previews resolution. IES Builder may generate candidate artefacts later. Lab proves later.",
]);

const SELECTOR_RESOLVER_PREVIEW_RELATIONSHIP_MAP = Object.freeze([
  Object.freeze({ system: "Board Data / Selector Reference", role: "safe source-readiness metadata" }),
  Object.freeze({ system: "Selector", role: "read-only preview of candidate resolution" }),
  Object.freeze({ system: "IES Builder", role: "downstream candidate artefact generation later" }),
  Object.freeze({ system: "Lab Proof", role: "future proof boundary" }),
  Object.freeze({ system: "Controlled Records", role: "future provenance/disposition trail" }),
  Object.freeze({ system: "RREG", role: "future review/custody mapping" }),
  Object.freeze({ system: "Engine Flow", role: "confidence path explanation only" }),
]);

function statusFlagRows(flags = {}) {
  return Object.entries(flags).map(([key, value]) => [key, boolString(value === true)]);
}

function countObjectFields(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  return Object.keys(value).length;
}

function compatibilityDimensionRows(diagnostics = {}) {
  const hasWarnings = Array.isArray(diagnostics.warnings) && diagnostics.warnings.length > 0;
  return COMPATIBILITY_DIMENSIONS.map((dimension) => {
    if (dimension === "Lab Proof mapping") return [dimension, "requires Lab Proof — Selector does not prove"];
    if (dimension === "IES candidate readiness") return [dimension, "candidate only — IES generation disabled"];
    if (dimension === "missing metadata") return [dimension, "missing metadata remains an explicit reason state"];
    if (hasWarnings && ["IP / IK / environment", "physical fit", "driver", "electrical operating window"].includes(dimension)) {
      return [dimension, "requires review — diagnostic only; no selection cleared"];
    }
    return [dimension, "unknown / candidate only — explanation matrix only"];
  });
}

function deriveCandidateStateLabel({ manualConstraintCount = 0, autoConsequenceCount = 0, effectiveSelectionCount = 0, warningCount = 0, blockedCount = 0, specReady = false, freshLoad = false } = {}) {
  if (freshLoad && manualConstraintCount === 0) return "default preview";
  if (specReady) return "spec-ready candidate";
  if (warningCount > 0 || blockedCount > 0) return "compatibility-explained candidate";
  if (effectiveSelectionCount > 0 && manualConstraintCount > 0) return "manually constrained candidate";
  if (effectiveSelectionCount > 0 && autoConsequenceCount > 0) return "auto-consequence candidate";
  if (effectiveSelectionCount > 0) return "candidate-ready";
  return "default preview";
}

function createSelectorCandidateStateExplainer(contract = {}, counts = {}) {
  const {
    manualConstraintCount = countObjectFields(contract.manualConstraints),
    autoConsequenceCount = countObjectFields(contract.autoConsequences),
    effectiveSelectionCount = countObjectFields(contract.effectiveSelection),
    warningCount = 0,
    blockedCount = 0,
    specReady = false,
    freshLoad = contract.freshLoad === true,
  } = counts;
  const candidateState = deriveCandidateStateLabel({
    manualConstraintCount,
    autoConsequenceCount,
    effectiveSelectionCount,
    warningCount,
    blockedCount,
    specReady,
    freshLoad,
  });
  const reviewNeeded = warningCount > 0 || blockedCount > 0;

  return {
    title: "Selector candidate-state explainer",
    status: "read-only candidate-state explanation over readiness chain",
    runtimeStatusFlags: { ...CANDIDATE_STATE_RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: statusFlagRows(CANDIDATE_STATE_RUNTIME_STATUS_FLAGS),
    categories: [...CANDIDATE_STATE_CATEGORIES],
    categoryRows: CANDIDATE_STATE_CATEGORIES.map((category) => [
      category,
      category === candidateState ? "current diagnostic candidate state" : "available diagnostic category",
    ]),
    fields: [...CANDIDATE_EXPLAINER_FIELDS],
    fieldRows: [
      ["candidate_state", candidateState],
      ["manual_constraints", manualConstraintCount],
      ["auto_consequences", autoConsequenceCount],
      ["effective_selection", effectiveSelectionCount],
      ["compatibility_summary", reviewNeeded ? `${warningCount} warning(s), ${blockedCount} blocked/incompatible diagnostic(s)` : "candidate compatibility has no current warnings; not proof"],
      ["spec_gate_summary", specReady ? "spec-ready candidate; production proof still not established" : "spec-gate incomplete or future-gated; slug/spec generation disabled"],
      ["ies_candidate_readiness", "future-gated candidate artefact readiness; IES generation disabled here"],
      ["lab_proof_readiness", "not established by Selector; Lab Proof remains the proof boundary"],
      ["controlled_record_expectation", "future provenance/disposition trail only; no Controlled Records write"],
      ["rreg_review_expectation", "future reviewer/approver/custody mapping only; no approval or custody transfer"],
      ["downstream_outputs_disabled", "IES, payload, RunTable, drawings, records, RREG approvals, and proof are disabled"],
      ["proof_boundary", "candidate/spec-ready is not production-proven and is not Lab Proof"],
      ["unsafe_claims_blocked", "Lab Proof, Controlled Records, RREG approval, custody transfer, and hidden write-back claims are blocked"],
    ],
    readinessChainMap: CANDIDATE_READINESS_CHAIN_MAP.map((entry) => ({ ...entry })),
    readinessChainRows: CANDIDATE_READINESS_CHAIN_MAP.map((entry) => [entry.system, entry.role]),
    boundaryCopy: [...CANDIDATE_STATE_BOUNDARY_COPY],
  };
}

function selectorReferenceExpectedTables(reference = {}) {
  return Array.isArray(reference.expectedTables) && reference.expectedTables.length
    ? reference.expectedTables
    : (Array.isArray(reference.selectorCriticalTables) ? reference.selectorCriticalTables : []);
}

function selectorReferencePresentTables(reference = {}) {
  if (Array.isArray(reference.presentTables)) return reference.presentTables;
  return (Array.isArray(reference.tableSummary) ? reference.tableSummary : [])
    .filter((table) => table.present === true)
    .map((table) => table.table)
    .filter(Boolean);
}

function selectorReferenceMissingTables(reference = {}) {
  if (Array.isArray(reference.missingTables)) return reference.missingTables;
  const expected = selectorReferenceExpectedTables(reference);
  const present = new Set(selectorReferencePresentTables(reference));
  return expected.filter((table) => !present.has(table));
}

function readSelectorReferenceSourceStatus(reference = {}) {
  const source = reference.source || reference.activeSnapshot || {};
  const status = String(reference.status || "not-requested");
  const sourcePresent = source.present === true || reference.sourcePresent === true;
  const sourceReadable = source.readable === true || reference.sourceReadable === true;
  const sourceParseable = source.parseable === true || reference.sourceParseable === true;

  if (["not-requested", "loading"].includes(status)) {
    return {
      status,
      sourcePresent,
      sourceReadable,
      sourceParseable,
      sourceUnavailable: true,
      sourceReadableStatus: false,
    };
  }
  if (!sourcePresent || !sourceReadable) {
    return {
      status: "source unavailable",
      sourcePresent,
      sourceReadable,
      sourceParseable,
      sourceUnavailable: true,
      sourceReadableStatus: false,
    };
  }
  if (!sourceParseable) {
    return {
      status: "source readable but not parseable",
      sourcePresent,
      sourceReadable,
      sourceParseable,
      sourceUnavailable: false,
      sourceReadableStatus: true,
    };
  }
  return {
    status: "source readable",
    sourcePresent,
    sourceReadable,
    sourceParseable,
    sourceUnavailable: false,
    sourceReadableStatus: true,
  };
}

function createResolverPreviewCompatibilitySummary({ warningCount = 0, blockedCount = 0 } = {}) {
  return warningCount > 0 || blockedCount > 0
    ? `${warningCount} warning(s), ${blockedCount} blocked/incompatible diagnostic(s); compatible selections are not cleared`
    : "no current compatibility warnings; this is candidate readiness only, not proof";
}

function deriveResolverPreviewState({
  sourceStatus = {},
  sourceTablesReady = false,
  missingTables = [],
  manualConstraintCount = 0,
  autoConsequenceCount = 0,
  effectiveSelectionCount = 0,
  warningCount = 0,
  blockedCount = 0,
  freshLoad = false,
} = {}) {
  if (sourceStatus.sourceUnavailable) return "source unavailable";
  if (missingTables.length || !sourceTablesReady) return "source missing required tables";
  if (warningCount > 0 || blockedCount > 0) return "compatibility explained preview";
  if (freshLoad && manualConstraintCount === 0) return "default preview";
  if (manualConstraintCount > 0) return "manually constrained preview";
  if (autoConsequenceCount > 0) return "auto consequence preview";
  if (effectiveSelectionCount > 0) return "preview candidate ready";
  return "spec gate incomplete";
}

function createResolverPreviewUnresolvedReasons({
  sourceStatus = {},
  missingTables = [],
  manualConstraintCount = 0,
  warningCount = 0,
  blockedCount = 0,
} = {}) {
  const reasons = [];
  if (!sourceStatus.sourcePresent) reasons.push("Selector Reference source is not present.");
  if (sourceStatus.sourcePresent && !sourceStatus.sourceReadable) reasons.push("Selector Reference source is not readable.");
  if (sourceStatus.sourceReadable && !sourceStatus.sourceParseable) reasons.push("Selector Reference source is not parseable.");
  if (missingTables.length) reasons.push(`Missing Selector Reference table blocker(s): ${missingTables.join(", ")}.`);
  if (manualConstraintCount === 0) reasons.push("No manual constraints have been applied; current selections remain default-preview/consequence state.");
  if (warningCount > 0 || blockedCount > 0) reasons.push("Compatibility diagnostics require review; values are labelled and preserved, not cleared.");
  reasons.push("Spec gate is incomplete in this preview slice.");
  reasons.push("Lab Proof is not established by Selector resolver preview.");
  reasons.push("Controlled Records provenance/disposition and RREG review/custody mapping are future-gated.");
  return reasons;
}

function createPreviewResultSummary({
  previewState = "default preview",
  sourceStatus = {},
  sourceTablesReady = false,
  missingTables = [],
  manualConstraintCount = 0,
  autoConsequenceCount = 0,
  effectiveSelectionCount = 0,
  manualConstraintText = "none",
  autoConsequenceText = "none",
  effectiveSelectionText = "none",
  compatibilitySummary = "candidate readiness only",
  warningCount = 0,
  blockedCount = 0,
  specReady = false,
  unresolvedReasons = [],
} = {}) {
  const flags = {
    previewResultSummaryOnly: true,
    committedSelectorResult: false,
    productionSpecification: false,
    slugAuthorityEnabled: false,
    downstreamArtefactCreated: false,
    proofAuthority: false,
    controlledRecordCreated: false,
    rregAssignmentCreated: false,
    writeBackCreated: false,
  };
  const specGateState = specReady
    ? "candidate-labelled only — production specification and Lab Proof are still not established"
    : "incomplete — preview-ready does not mean spec-ready";
  const tableReadiness = sourceTablesReady
    ? "ready for preview summary — required tables are reported present"
    : "not ready — source/table readiness is incomplete or missing";
  const proofState = "not established — this is not Lab Proof";
  const missingTableText = missingTables.length ? missingTables.join(", ") : "none";
  const sourceHealthy = sourceStatus.sourcePresent === true && sourceStatus.sourceReadable === true && sourceStatus.sourceParseable === true;
  const constraintsReviewed = manualConstraintCount > 0 ? "manual constraints present for later validation" : "missing — no manual constraints yet";
  const autoConsequencesReviewed = autoConsequenceCount > 0 ? "review required — auto consequences followed the current constraints" : "none yet — no auto consequences to review";
  const compatibilityBlockersResolved = warningCount > 0 || blockedCount > 0
    ? `${warningCount} warning(s) and ${blockedCount} blocked/incompatible diagnostic(s) require resolution`
    : "no current warnings; still not proof";

  return {
    title: "Preview result summary",
    status: "Preview result is explanatory only.",
    boundaryCopy: [...SELECTOR_RESOLVER_PREVIEW_BOUNDARY_COPY],
    flags,
    flagRows: statusFlagRows(flags),
    candidateSummaryRows: [
      ["candidate state", previewState],
      ["source state", sourceStatus.status || "source unavailable"],
      ["table readiness", tableReadiness],
      ["manual constraint count", manualConstraintCount],
      ["auto consequence count", autoConsequenceCount],
      ["effective selection count", effectiveSelectionCount],
      ["compatibility state", compatibilitySummary],
      ["spec gate state", specGateState],
      ["proof state", proofState],
    ],
    whyRows: [
      ["manual constraints", manualConstraintCount > 0 ? manualConstraintText : "none yet — current candidate remains default-preview/consequence shaped"],
      ["auto consequences", autoConsequenceCount > 0 ? autoConsequenceText : "none yet — no committed consequence is produced here"],
      ["effective selection", effectiveSelectionCount > 0 ? effectiveSelectionText : "none yet — no committed Selector result exists"],
      ["source readiness", sourceHealthy ? "source is present, readable, and parseable for safe metadata preview" : sourceStatus.status || "source unavailable"],
      ["compatibility diagnostics", compatibilitySummary],
    ],
    blockedMissingRows: [
      ["source unavailable", sourceStatus.sourceUnavailable === true ? "blocked — Selector Reference source is unavailable" : "clear — source availability reported"],
      ["source not readable", sourceStatus.sourceReadable === true ? "clear — source readable" : "blocked — source is not readable"],
      ["source not parseable", sourceStatus.sourceParseable === true ? "clear — source parseable" : "blocked — source is not parseable"],
      ["missing required tables", missingTables.length ? `blocked — ${missingTableText}` : "none"],
      ["no manual constraints yet", manualConstraintCount === 0 ? "missing — no manual constraints have shaped this candidate" : "clear — manual constraints are present"],
      ["compatibility warnings", warningCount > 0 ? `${warningCount} warning(s) require review` : "none"],
      ["blocked/incompatible diagnostics", blockedCount > 0 ? `${blockedCount} blocked/incompatible diagnostic(s) require resolution` : "none"],
      ["spec gate incomplete", specReady ? "noted — candidate label only; production spec still disabled here" : "blocked — spec gate incomplete"],
      ["proof not established", proofState],
      ["Controlled Records future-gated", "future-gated — no provenance, disposition, audit trail, or record write is created here"],
      ["RREG future-gated", "future-gated — no assignment, approval, review decision, or custody transfer is created here"],
    ],
    specReadyPathRows: [
      ["source present/readable/parseable", sourceHealthy ? "ready for preview" : "required before spec-ready later"],
      ["required tables present", sourceTablesReady ? "ready for preview" : `required before spec-ready later; missing: ${missingTableText}`],
      ["manual constraints valid", constraintsReviewed],
      ["auto consequences reviewed", autoConsequencesReviewed],
      ["compatibility blockers resolved", compatibilityBlockersResolved],
      ["spec gate completed later", specReady ? "candidate-labelled only; not production authority" : "required later — incomplete here"],
      ["slug/spec generation approved later", "future approval required — disabled here"],
      ["Lab Proof still required later", "required later — not established here"],
    ],
    downstreamDisabledRows: [
      ["slug/spec generation", "disabled"],
      ["IES generation", "disabled"],
      ["payload generation", "disabled"],
      ["RunTable generation", "disabled"],
      ["drawing generation", "disabled"],
      ["Lab Proof", "disabled"],
      ["Controlled Records write", "disabled"],
      ["RREG assignment/approval/custody transfer", "disabled"],
      ["runtime data mutation", "disabled"],
      ["hidden write-back", "disabled"],
    ],
    unresolvedReasonRows: unresolvedReasons.map((reason, index) => [`reason ${index + 1}`, reason]),
  };
}

function createSelectorReadonlyResolverPreview(contract = {}, selectorReferenceStatus = {}) {
  const diagnostics = contract.compatibilityDiagnostics || {};
  const warningCount = Array.isArray(diagnostics.warnings) ? diagnostics.warnings.length : 0;
  const blockedCount = Array.isArray(diagnostics.blockedIncompatibleFields) ? diagnostics.blockedIncompatibleFields.length : 0;
  const manualConstraintCount = countObjectFields(contract.manualConstraints);
  const autoConsequenceCount = countObjectFields(contract.autoConsequences);
  const effectiveSelectionCount = countObjectFields(contract.effectiveSelection);
  const expectedTables = selectorReferenceExpectedTables(selectorReferenceStatus);
  const presentTables = selectorReferencePresentTables(selectorReferenceStatus);
  const missingTables = selectorReferenceMissingTables(selectorReferenceStatus);
  const sourceStatus = readSelectorReferenceSourceStatus(selectorReferenceStatus);
  const sourceTablesReady = sourceStatus.sourceReadableStatus === true
    && sourceStatus.sourceParseable === true
    && expectedTables.length > 0
    && missingTables.length === 0;
  const specReady = contract.specReady === true && contract.specGateComplete === true;
  const previewState = deriveResolverPreviewState({
    sourceStatus,
    sourceTablesReady,
    missingTables,
    manualConstraintCount,
    autoConsequenceCount,
    effectiveSelectionCount,
    warningCount,
    blockedCount,
    freshLoad: contract.freshLoad === true,
  });
  const unresolvedReasons = createResolverPreviewUnresolvedReasons({
    sourceStatus,
    missingTables,
    manualConstraintCount,
    warningCount,
    blockedCount,
  });
  const compatibilitySummary = createResolverPreviewCompatibilitySummary({ warningCount, blockedCount });
  const manualConstraintText = selectionListText(contract.manualConstraints, "none");
  const autoConsequenceText = selectionListText(contract.autoConsequences, "none");
  const effectiveSelectionText = selectionListText(contract.effectiveSelection, "none");
  const fieldValues = {
    preview_state: previewState,
    source_status: sourceStatus.status,
    source_tables_ready: boolString(sourceTablesReady),
    missing_tables: missingTables.length ? missingTables.join(", ") : "none",
    manual_constraints: manualConstraintText,
    auto_consequences: autoConsequenceText,
    effective_selection: effectiveSelectionText,
    compatibility_summary: compatibilitySummary,
    unresolved_reasons: unresolvedReasons.join(" | "),
    spec_gate_status: specReady ? "spec-ready candidate label only; Lab Proof still not established" : "incomplete — preview-ready does not mean spec-ready",
    slug_preview_status: "disabled — no slug generated, committed, or treated as authority",
    ies_generation_status: "disabled — IES Builder may generate candidate artefacts later only",
    lab_proof_status: "not established — Selector preview is not production proof authority",
    controlled_records_status: "future-gated — no provenance, disposition, audit, or record write created here",
    rreg_status: "future-gated — no assignment, approval, or custody transfer created here",
    downstream_outputs_disabled: "true — IES, payload, RunTable, drawings, records, RREG, proof, and runtime writes are disabled",
    unsafe_claims_blocked: "slug/spec authority, IES generation, payload generation, RunTable generation, drawings, Lab Proof, Controlled Record, RREG approval, custody transfer, raw data exposure, and hidden write-back are blocked",
  };
  const previewResultSummary = createPreviewResultSummary({
    previewState,
    sourceStatus,
    sourceTablesReady,
    missingTables,
    manualConstraintCount,
    autoConsequenceCount,
    effectiveSelectionCount,
    manualConstraintText,
    autoConsequenceText,
    effectiveSelectionText,
    compatibilitySummary,
    warningCount,
    blockedCount,
    specReady,
    unresolvedReasons,
  });

  return {
    title: "Selector read-only resolver preview",
    status: "preview-only candidate readiness over safe Selector Reference metadata",
    readOnly: true,
    diagnosticOnly: true,
    resolverPreviewOnly: true,
    runtimeStatusFlags: { ...SELECTOR_RESOLVER_PREVIEW_RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: statusFlagRows(SELECTOR_RESOLVER_PREVIEW_RUNTIME_STATUS_FLAGS),
    previewResultSummary,
    categories: [...SELECTOR_RESOLVER_PREVIEW_CATEGORIES],
    categoryRows: SELECTOR_RESOLVER_PREVIEW_CATEGORIES.map((category) => [
      category,
      category === previewState || (category === "source readable" && sourceStatus.sourceReadableStatus === true) || (category === "spec gate incomplete" && !specReady)
        ? "current resolver-preview condition"
        : "available resolver-preview category",
    ]),
    fieldNames: [...SELECTOR_RESOLVER_PREVIEW_FIELD_NAMES],
    fields: fieldValues,
    fieldRows: SELECTOR_RESOLVER_PREVIEW_FIELD_NAMES.map((fieldName) => [fieldName, fieldValues[fieldName]]),
    sourceRows: [
      ["source_status", sourceStatus.status],
      ["source present", boolString(sourceStatus.sourcePresent === true)],
      ["source readable", boolString(sourceStatus.sourceReadable === true)],
      ["source parseable", boolString(sourceStatus.sourceParseable === true)],
      ["selector reference ok", selectorReferenceStatus.ok === true ? "true" : "false"],
      ["raw rows exposed", boolString(false)],
      ["raw USERS exposed", boolString(false)],
      ["raw Lab evidence exposed", boolString(false)],
      ["credentials exposed", boolString(false)],
      ["private paths exposed", boolString(false)],
    ],
    tableRows: [
      ["expected tables", expectedTables.join(", ") || "none reported"],
      ["present tables", presentTables.join(", ") || "none reported"],
      ["missing tables", missingTables.length ? missingTables.join(", ") : "none"],
      ["source_tables_ready", boolString(sourceTablesReady)],
      ["missing table blockers", missingTables.length ? missingTables.join(", ") : "none"],
    ],
    manualConstraintRows: selectionRows(contract.manualConstraints, "manual constraints"),
    autoConsequenceRows: selectionRows(contract.autoConsequences, "auto consequences"),
    effectiveSelectionRows: selectionRows(contract.effectiveSelection, "effective selection"),
    compatibilityRows: [
      ["compatibility_summary", compatibilitySummary],
      ["compatibility warnings", warningCount],
      ["blocked/incompatible diagnostics", blockedCount],
      ["compatible selections cleared by preview", "false"],
    ],
    unresolvedReasonRows: unresolvedReasons.map((reason, index) => [`reason ${index + 1}`, reason]),
    downstreamRows: [
      ["spec gate", fieldValues.spec_gate_status],
      ["slug preview", fieldValues.slug_preview_status],
      ["IES generation", fieldValues.ies_generation_status],
      ["Lab Proof", fieldValues.lab_proof_status],
      ["Controlled Records", fieldValues.controlled_records_status],
      ["RREG", fieldValues.rreg_status],
      ["downstream outputs disabled", fieldValues.downstream_outputs_disabled],
      ["unsafe claims blocked", fieldValues.unsafe_claims_blocked],
    ],
    relationshipMap: SELECTOR_RESOLVER_PREVIEW_RELATIONSHIP_MAP.map((entry) => ({ ...entry })),
    relationshipRows: SELECTOR_RESOLVER_PREVIEW_RELATIONSHIP_MAP.map((entry) => [entry.system, entry.role]),
    boundaryCopy: [...SELECTOR_RESOLVER_PREVIEW_BOUNDARY_COPY],
  };
}

function createSelectorReadinessDiagnostics(contract = {}) {
  const diagnostics = contract.compatibilityDiagnostics || {};
  const warningCount = Array.isArray(diagnostics.warnings) ? diagnostics.warnings.length : 0;
  const blockedCount = Array.isArray(diagnostics.blockedIncompatibleFields) ? diagnostics.blockedIncompatibleFields.length : 0;
  const manualConstraintCount = countObjectFields(contract.manualConstraints);
  const autoConsequenceCount = countObjectFields(contract.autoConsequences);
  const effectiveSelectionCount = countObjectFields(contract.effectiveSelection);
  const specReady = contract.specReady === true && contract.specGateComplete === true;
  const candidateState = createSelectorCandidateStateExplainer(contract, {
    manualConstraintCount,
    autoConsequenceCount,
    effectiveSelectionCount,
    warningCount,
    blockedCount,
    specReady,
  });

  return {
    title: "Selector readiness diagnostics",
    status: "read-only diagnostic foundation",
    readOnly: true,
    diagnosticOnly: true,
    candidateState,
    requiredBoundaryCopy: [...SELECTOR_READINESS_BOUNDARY_COPY],
    relationshipMap: SELECTOR_READINESS_RELATIONSHIP_MAP.map((entry) => ({ ...entry })),
    manualVsAuto: [
      "Manual selections are constraints.",
      "Auto selections are consequences.",
      "Compatible selections must not be cleared just because another field changes.",
      "Auto-derived items may appear selected but must remain changeable.",
      "Fresh load is preamble/default-preview state, not spec-ready state.",
    ],
    compatibility: {
      title: "Compatibility diagnostics",
      runtimeStatusFlags: { ...COMPATIBILITY_RUNTIME_STATUS_FLAGS },
      runtimeStatusRows: statusFlagRows(COMPATIBILITY_RUNTIME_STATUS_FLAGS),
      dimensions: [...COMPATIBILITY_DIMENSIONS],
      dimensionRows: compatibilityDimensionRows(diagnostics),
      reasonStates: [...COMPATIBILITY_REASON_STATES],
      reasonStateRows: COMPATIBILITY_REASON_STATES.map((state) => [state, "available diagnostic reason state"]),
      summaryRows: [
        ["mode", "compatibility explanation matrix only"],
        ["manual constraints", manualConstraintCount],
        ["auto consequences", autoConsequenceCount],
        ["effective selection fields", effectiveSelectionCount],
        ["compatibility warnings", warningCount],
        ["blocked/incompatible diagnostics", blockedCount],
        ["compatible selections auto-cleared", "false"],
        ["compatibility proof claim", "false"],
        ["Lab Proof claim", "false"],
      ],
      warningRows: compatibilityWarningRows(diagnostics),
      blockedFieldRows: blockedFieldRows(diagnostics),
    },
    specGate: {
      title: "Spec-gate readiness diagnostics",
      runtimeStatusFlags: { ...SPEC_GATE_RUNTIME_STATUS_FLAGS },
      runtimeStatusRows: statusFlagRows(SPEC_GATE_RUNTIME_STATUS_FLAGS),
      gateStates: [...SPEC_GATE_STATES],
      gateStateRows: SPEC_GATE_STATES.map((state) => [state, "tracked as readiness explanation only"]),
      gateRequirements: [...SPEC_GATE_REQUIREMENTS],
      gateRequirementRows: SPEC_GATE_REQUIREMENTS.map((requirement) => [requirement, "diagnostic requirement; no slug/spec generation"]),
      missingBlockedReasonCategories: [...SPEC_GATE_MISSING_BLOCKED_REASON_CATEGORIES],
      missingBlockedReasonRows: SPEC_GATE_MISSING_BLOCKED_REASON_CATEGORIES.map((category) => [category, "safe fail-closed reason category"]),
      readinessRows: [
        ["current selector mode", contract.selectorMode || "default-preview"],
        ["fresh load preamble/default preview", boolString(contract.freshLoad === true || manualConstraintCount === 0)],
        ["manually constrained", boolString(manualConstraintCount > 0)],
        ["auto consequences visible", boolString(autoConsequenceCount > 0)],
        ["candidate-ready", boolString(effectiveSelectionCount > 0 && warningCount === 0)],
        ["spec-gate incomplete", boolString(!specReady)],
        ["spec-ready", boolString(specReady)],
        ["blocked / requires review", boolString(warningCount > 0 || blockedCount > 0)],
        ["required review warnings", warningCount || "none"],
        ["spec slug", contract.specSlug || "disabled"],
        ["slug generation", "disabled"],
        ["spec generation", "disabled"],
        ["Lab Proof status", "separated — not asserted by Selector"],
      ],
    },
  };
}

function createSelectorExpanderShell(local = {}, selectorState, onLocalStateChange, selectorReferenceStatus = {}) {
  const stateContract = selectorStateContractFromLocal(local);
  const defaultPreviewBuckets = createDefaultPreviewBucketDiagnostics(stateContract);
  const fieldContractDiagnostics = createSelectorFieldContractDiagnostics(stateContract);
  const readonlyResolverPreview = createSelectorReadonlyResolverPreview(stateContract, selectorReferenceStatus);
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
    defaultPreviewSummaryRows: defaultPreviewBuckets.summaryRows,
    defaultPreviewBucketDiagnostics: defaultPreviewBuckets.bucketDiagnostics,
    fieldContractSummaryRows: fieldContractDiagnostics.summaryRows,
    sectionFieldContractDiagnostics: fieldContractDiagnostics.sectionDiagnostics,
    manualConstraintScaffoldRows: createManualConstraintScaffoldRows(stateContract),
    behaviourContractRows: createBehaviourContractRows(stateContract),
    manualConstraintBehaviour: createManualConstraintBehaviour(stateContract, selectorState, onLocalStateChange),
    readinessDiagnostics: createSelectorReadinessDiagnostics(stateContract),
    readonlyResolverPreview,
    setSectionOpen(sectionId, open) {
      selectorState?.setExpanderSectionOpen?.(sectionId, open);
    },
  };
}

export function createSelectorViewModel({ adapter, selectorState, selectorReferenceStatus = {}, onLocalStateChange } = {}) {
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
    selectorSurface: createDbBackedSelectorSurface(selectorReferenceStatus, local, selectorState, onLocalStateChange),
    expanderShell: createSelectorExpanderShell(local, selectorState, onLocalStateChange, selectorReferenceStatus),
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
