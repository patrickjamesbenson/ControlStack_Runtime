import { buildSelectedResultProjectionContract } from "../../workspace-kernel/selectedResultProjectionService.js";
import { buildSelectorSpecialPartsEntitlementPreview } from "./selectorSpecialPartsEntitlementPreview.js";
import { buildSelectorRunAccessoryPlacementPreview } from "./selectorRunAccessoryPlacementPreview.js";
import { buildSelectorRunIntakePreview } from "./selectorRunIntakePreview.js";
import {
  buildSelectorFactoryApprovedInputsSummary,
  deriveSelectorFactoryReadyState,
} from "./selectorFactoryApprovedInputsSummary.js";
import { buildSelectorSafeDraftProjectEnvelopePreview } from "./selectorSafeDraftProjectEnvelopePreview.js";
import { buildSelectorSafeHydrateValidationPreview } from "./selectorSafeHydrateValidationPreview.js";
import { buildRuntimeSealedCandidateAssemblyPreviewSummary } from "../../workspace-kernel/engineRunTableSealedCandidateAssemblyPreview.js";
import { buildRuntimeRunTableDomainOutputScaffoldSummary } from "../../workspace-kernel/engineRunTableRuntimeRunTableDomainOutputScaffold.js";
import { buildRuntimeControlledDonorEngineVerifyBridgeSummary } from "../../workspace-kernel/engineRunTableControlledDonorEngineVerifyBridge.js";
import { buildRuntimeSelectedResultHandoffScaffoldSummary } from "../../workspace-kernel/engineRunTableSelectedResultHandoffScaffold.js";
import { buildRuntimeIesHandoffReadinessScaffoldSummary } from "../../workspace-kernel/engineRunTableIesHandoffReadinessScaffold.js";
import { buildSelectedResultAuthorityReadinessPreflight } from "../../workspace-kernel/selectedResultAuthorityReadinessPreflight.js";
import { buildAcceptedSelectedResultAuthorityGate } from "../../workspace-kernel/acceptedSelectedResultAuthorityGate.js";
import { buildSelectedResultPersistenceBoundaryContract } from "../../workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import { buildSelectedResultOutputReadinessPreflight } from "../../workspace-kernel/selectedResultOutputReadinessPreflight.js";
import { buildSelectedResultPersistenceAuthorityPreflight } from "../../workspace-kernel/selectedResultPersistenceAuthorityPreflight.js";
import { buildSelectorLmTemperatureReadinessPreview } from "../../workspace-kernel/selectorLmTemperatureReadinessPreview.js";
import {
  buildSelectorReadonlyEngineCandidateForInternalSeam,
  buildSelectorReadonlyEngineStep1SafeSummary,
  buildSelectorReadonlyEngineStep2SelectedResultProjection,
  buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard,
} from "../../workspace-kernel/selectorReadonlyEngineCandidateMapper.js";
import { stableFingerprint } from "../../workspace-kernel/stableFingerprint.js";

const SELECTOR_WORKFLOW_POLICY_FINGERPRINT = "safe-policy:selector-workflow-preview";
const SELECTOR_WORKFLOW_SOURCE_FINGERPRINT = "safe-source:selector-workflow-preview";
const SELECTOR_WORKFLOW_REFERENCE_OPTIONS_FINGERPRINT = "safe-reference-options:selector-workflow-preview";
const SELECTOR_WORKFLOW_STATE_FINGERPRINT = "safe-selector-state:selector-workflow-preview";

export const SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_CONTRACT_ID =
  "SHELL-CS-SELECTOR-FIRST-PRE-ENGINE-READONLY-ACTION-ELIGIBILITY-BRIDGE-1";
export const SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_SCHEMA_ID =
  "controlstack.selector.pre-engine-readonly-action-eligibility.v1";
export const SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_SCHEMA_VERSION = 1;
export const SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "state",
  "readiness",
  "ready",
  "blocker",
  "factoryApprovedInputsSummary",
  "committedSelectorConstraints",
  "lmTemperatureReadinessPreview",
  "runIntakePreviewReady",
  "factoryApprovedInputsReady",
  "candidateMapperReady",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "selectorStateFingerprint",
  "referenceOptionsFingerprint",
  "boardDataSourceVersion",
  "candidateFingerprint",
  "committedSelectorConstraintCount",
  "runCount",
  "totalQuantity",
  "accessoryIntentCount",
  "projectionFingerprint",
]);

function cloneAndFreezePreEngineProjectionValue(value) {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map(cloneAndFreezePreEngineProjectionValue));
  }
  if (!value || typeof value !== "object") {
    throw new Error("selector-pre-engine-action-eligibility-value-invalid");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error("selector-pre-engine-action-eligibility-value-non-plain");
  }
  return Object.freeze(Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key,
      cloneAndFreezePreEngineProjectionValue(nested),
    ]),
  ));
}

function orderedSelectorPreEngineEligibility(fields) {
  return Object.fromEntries(
    SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function projectCommittedSelectorConstraint(constraint = {}) {
  return {
    fieldKey: String(constraint.fieldKey || ""),
    value: String(constraint.value || ""),
    valueLabel: String(constraint.valueLabel || constraint.value || ""),
    committedSelectorState: constraint.committedSelectorState === true,
    blocked: constraint.blocked === true,
    authoritySource: String(constraint.authoritySource || "committed-selector-state"),
    provenance: String(constraint.provenance || constraint.authoritySource || "committed-selector-state"),
    kind: String(constraint.kind || "committed-selector-constraint"),
    source: String(constraint.source || "selector-view-model"),
  };
}

function projectFactoryApprovedInputsSummary(summary = {}, candidateInputsReady = false) {
  const run = summary?.committedRunIntakeSummary || {};
  const candidateBlocker = summary.readonlyEngineCandidateInputsBlocker || null;
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    // The persisted pre-Engine envelope has a locked legacy Stage-3-shaped schema.
    // These compatibility booleans carry the dedicated candidate-input readiness only;
    // the full local Stage 2/Stage 3 meanings remain unchanged on the source summary.
    factoryApprovedInputsReady: candidateInputsReady === true,
    ready: candidateInputsReady === true,
    stage3Mode: String(summary.stage3Mode || "blocked"),
    blocker: candidateInputsReady === true ? null : candidateBlocker,
    stage2Ready: candidateInputsReady === true,
    committedSelectorConstraintCount: Number.isSafeInteger(
      summary.committedSelectorConstraintCount,
    ) ? summary.committedSelectorConstraintCount : 0,
    committedRunIntakeSummary: {
      ready: run.ready === true,
      committedRunIntakeReady: run.committedRunIntakeReady === true,
      sourceAuthority: String(run.sourceAuthority || "committed-selector-state"),
      runQuantity: Number.isSafeInteger(run.runQuantity) ? run.runQuantity : 0,
      runLengthMm: Number.isSafeInteger(run.runLengthMm) ? run.runLengthMm : 0,
      writes: false,
      rawRowsExposed: false,
    },
    accessoryReservationRequired: summary.accessoryReservationRequired === true,
    engineOutcomeProven: false,
    engineExecuted: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
  };
}

function projectLmTemperatureReadinessPreview(preview = {}) {
  const projectIntent = (intent = {}) => ({
    ready: intent.ready === true,
    valueLabel: String(intent.valueLabel || ""),
  });
  return {
    targetIntent: {
      direct: projectIntent(preview?.targetIntent?.direct),
      indirect: projectIntent(preview?.targetIntent?.indirect),
    },
    cctCriPairing: {
      direct: projectIntent(preview?.cctCriPairing?.direct),
      indirect: projectIntent(preview?.cctCriPairing?.indirect),
    },
    controlIntent: {
      direct: projectIntent(preview?.controlIntent?.direct),
      indirect: projectIntent(preview?.controlIntent?.indirect),
    },
    fingerprint: preview?.fingerprint || null,
    temperatureAdjustedOutputCalculated: false,
    deliveredLmPerMVerified: false,
    rawRowsReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
  };
}

export function buildSelectorPreEngineReadonlyActionEligibilityProjection({
  specBuildReadinessPreview = {},
  committedSelectorConstraints = [],
  lmTemperatureReadinessPreview = {},
  sourceInputFingerprint = null,
  boardDataSourceVersion = null,
} = {}) {
  const factoryApprovedInputsSummary =
    specBuildReadinessPreview?.factoryApprovedInputsSummary || {};
  const candidateMapperSummary =
    specBuildReadinessPreview?.readonlyEngineCandidateMapperSummary || {};
  const runIntakePreviewSummary =
    factoryApprovedInputsSummary?.runIntakePreviewSummary || {};
  const accessoryPlacementIntentSummary =
    factoryApprovedInputsSummary?.accessoryPlacementIntentSummary || {};
  const runIntakePreviewReady = runIntakePreviewSummary.runIntakePreviewReady === true
    && factoryApprovedInputsSummary?.committedRunIntakeSummary?.ready === true;
  const hasDedicatedCandidateReadiness = Object.prototype.hasOwnProperty.call(
    factoryApprovedInputsSummary,
    "readonlyEngineCandidateInputsReady",
  );
  const readonlyEngineCandidateInputsReady = hasDedicatedCandidateReadiness
    ? factoryApprovedInputsSummary.readonlyEngineCandidateInputsReady === true
    : specBuildReadinessPreview?.factoryApprovedInputsReady === true
      && factoryApprovedInputsSummary?.factoryApprovedInputsReady === true
      && factoryApprovedInputsSummary?.stage2Ready === true;
  const candidateMapperReady =
    specBuildReadinessPreview?.readonlyEngineCandidateReady === true
    && candidateMapperSummary?.readonlyEngineCandidateMapperReady === true
    && candidateMapperSummary?.candidateReadyForHostLocalReadonlySeam === true;
  const ready = runIntakePreviewReady
    && readonlyEngineCandidateInputsReady
    && candidateMapperReady;
  const blocker = ready
    ? null
    : factoryApprovedInputsSummary?.readonlyEngineCandidateInputsBlocker
      || candidateMapperSummary?.blocker
      || (runIntakePreviewReady
        ? "selector-pre-engine-readonly-candidate-inputs-incomplete"
        : "selector-pre-engine-run-intake-not-ready");
  const candidateFingerprint =
    candidateMapperSummary?.candidateShapeSummary?.readonlyEngineCandidateFingerprint || null;
  const projectedFactoryApprovedInputsSummary =
    projectFactoryApprovedInputsSummary(factoryApprovedInputsSummary, readonlyEngineCandidateInputsReady);
  const projectedCommittedSelectorConstraints = (Array.isArray(committedSelectorConstraints)
    ? committedSelectorConstraints
    : []).map(projectCommittedSelectorConstraint);
  const projectedLmTemperatureReadinessPreview =
    projectLmTemperatureReadinessPreview(lmTemperatureReadinessPreview);
  const projectionFields = {
    schemaId: SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_SCHEMA_ID,
    schemaVersion: SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_SCHEMA_VERSION,
    contractId: SELECTOR_PRE_ENGINE_READONLY_ACTION_ELIGIBILITY_CONTRACT_ID,
    state: ready
      ? "selector_pre_engine_readonly_action_eligibility_ready"
      : "selector_pre_engine_readonly_action_eligibility_blocked_fail_closed",
    readiness: ready ? "ready" : "blocked_fail_closed",
    ready,
    blocker,
    factoryApprovedInputsSummary:
      cloneAndFreezePreEngineProjectionValue(projectedFactoryApprovedInputsSummary),
    committedSelectorConstraints:
      cloneAndFreezePreEngineProjectionValue(projectedCommittedSelectorConstraints),
    lmTemperatureReadinessPreview:
      cloneAndFreezePreEngineProjectionValue(projectedLmTemperatureReadinessPreview),
    runIntakePreviewReady,
    factoryApprovedInputsReady: readonlyEngineCandidateInputsReady,
    candidateMapperReady,
    policyFingerprint: SELECTOR_WORKFLOW_POLICY_FINGERPRINT,
    sourceFingerprint: SELECTOR_WORKFLOW_SOURCE_FINGERPRINT,
    sourceInputFingerprint: sourceInputFingerprint || null,
    selectorStateFingerprint: SELECTOR_WORKFLOW_STATE_FINGERPRINT,
    referenceOptionsFingerprint: SELECTOR_WORKFLOW_REFERENCE_OPTIONS_FINGERPRINT,
    boardDataSourceVersion: boardDataSourceVersion || null,
    candidateFingerprint,
    committedSelectorConstraintCount: Array.isArray(committedSelectorConstraints)
      ? committedSelectorConstraints.length
      : 0,
    runCount: Number.isSafeInteger(runIntakePreviewSummary.runCount)
      ? runIntakePreviewSummary.runCount
      : 0,
    totalQuantity: Number.isSafeInteger(runIntakePreviewSummary.totalQuantity)
      ? runIntakePreviewSummary.totalQuantity
      : 0,
    accessoryIntentCount: Number.isSafeInteger(
      accessoryPlacementIntentSummary.accessoryIntentCount,
    )
      ? accessoryPlacementIntentSummary.accessoryIntentCount
      : 0,
  };
  const projectionFingerprint = stableFingerprint(
    "safe-selector-pre-engine-readonly-action-eligibility",
    projectionFields,
  );
  return Object.freeze(orderedSelectorPreEngineEligibility({
    ...projectionFields,
    projectionFingerprint,
  }));
}

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
      ["Spec Ready", "incomplete"],
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

function safeRedactedSpecialPartCandidate(part = {}, index = 0) {
  if (!part || typeof part !== "object" || Array.isArray(part)) {
    return { redactedRef: `redacted-special-part-${index + 1}`, redacted: true };
  }
  return {
    redactedRef: String(part.redactedRef || part.safeComponentId || part.safeRef || part.redactedReference || `redacted-special-part-${index + 1}`),
    redacted: true,
    safeComponentId: String(part.safeComponentId || part.systemComponentId || part.componentId || part.redactedRef || ""),
    safeDescription: String(part.safeDescription || part.description || ""),
    safeCaveats: String(part.safeCaveats || part.caveats || ""),
    system: part.system || "",
    variants_all: part.variants_all || part.variantsAll || "",
    ip_class: part.ip_class || part.ipClass || "",
    effective_to: part.effective_to || part.effectiveTo || "",
    status_date: part.status_date || part.statusDate || "",
    sourceBackedCompatibility: part.sourceBackedCompatibility || part.safeSourceCompatibility || part.sourceCompatibilityStatus || "",
    sourceBackedCompatibilityReason: part.sourceBackedCompatibilityReason || part.safeSourceCompatibilityReason || part.sourceCompatibilityReason || "",
    status: part.status || part.timelineStatus || part.optionStatusClass || "available",
    timelineStatus: part.timelineStatus || part.status || part.optionStatusClass || "available",
    safelyEntitled: part.safelyEntitled !== false,
    previewApproved: part.previewApproved === true || part.approvedForPreview === true || part.safePreviewApproved === true,
  };
}

function safeRedactedEntitlementProjection(specialPartsEntitlement = {}) {
  const entitledParts = readEntitledSpecialParts(specialPartsEntitlement);
  const redactedCandidates = Array.isArray(specialPartsEntitlement.redactedCandidates)
    ? specialPartsEntitlement.redactedCandidates.map(safeRedactedSpecialPartCandidate)
    : entitledParts.map(safeRedactedSpecialPartCandidate);
  const redactedEntitlementCount = Number.isFinite(Number(specialPartsEntitlement.redactedEntitlementCount))
    ? Number(specialPartsEntitlement.redactedEntitlementCount)
    : Number.isFinite(Number(specialPartsEntitlement.entitledCount))
      ? Number(specialPartsEntitlement.entitledCount)
      : Math.max(redactedCandidates.length, listLength(specialPartsEntitlement.userComponentIds));
  return {
    redacted: true,
    source: specialPartsEntitlement.source || "shell-fed-redacted-entitlement-projection",
    status: specialPartsEntitlement.status || "not-live-placeholder",
    identityAuthority: specialPartsEntitlement.identityAuthority || (specialPartsEntitlement.userEmailMatched === true ? "matched-redacted" : "external-anonymous"),
    matchedRedacted: specialPartsEntitlement.matchedRedacted === true || specialPartsEntitlement.userEmailMatched === true,
    identityCandidate: specialPartsEntitlement.identityCandidate === true,
    previewApproved: specialPartsEntitlement.previewApproved === true || specialPartsEntitlement.safePreviewApproved === true,
    redactedEntitlementCount,
    redactedCandidates,
    rawUsersReturned: false,
    rawContactsReturned: false,
    rawCrmReturned: false,
    rawProductRowsReturned: false,
    rawComponentRowsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
  };
}

function emptySpecialPartsUserTestEntitlement(summary = {}) {
  return {
    status: summary.status || "user-test-no-visible-entitlement",
    source: summary.source || "selector-special-parts-user-test-mode",
    entitlementLive: false,
    userEmailMatched: summary.entitlementFound === true,
    matchedRedacted: false,
    identityCandidate: summary.internalTestActive === true,
    redactedEntitlementCount: 0,
    redactedCandidates: [],
    entitledParts: [],
    readOnly: true,
    userTestMode: true,
  };
}

function specialPartsUserTestEntitlementProjection(summary = {}, baseEntitlement = {}) {
  if (summary?.internalTestActive !== true) return baseEntitlement || {};
  if (summary.specialPartsVisible !== true) return emptySpecialPartsUserTestEntitlement(summary);
  const redactedCandidates = Array.isArray(summary.redactedCandidates) ? summary.redactedCandidates : [];
  return {
    status: "matched-redacted",
    source: "selector-special-parts-user-test-mode",
    entitlementLive: false,
    userEmailMatched: true,
    matchedRedacted: true,
    identityAuthority: "matched-redacted",
    identityCandidate: false,
    redactedEntitlementCount: summary.redactedEntitlementCount || summary.entitlementBackedCandidateCount || redactedCandidates.length,
    redactedCandidates,
    entitledParts: redactedCandidates,
    readOnly: true,
    userTestMode: true,
  };
}

function specialPartsUserTestRoleContext(base = {}, summary = {}) {
  if (summary?.internalTestActive !== true) return base;
  return {
    ...base,
    displayRole: "internal_user",
    requestedDisplayRole: "internal_user",
    actualRole: "internal_user",
    roleAuthority: "selector-internal-user-test-mode",
    displayRoleClamped: false,
    source: "selector-special-parts-user-test-mode",
  };
}

function specialPartsUserTestIdentityContext(base = {}, summary = {}) {
  if (summary?.internalTestActive !== true) return base;
  return {
    ...base,
    status: summary.entitlementFound === true ? "matched-redacted" : "no-entitlement-found",
    identityState: summary.entitlementFound === true ? "matched-redacted" : "user-test-unentitled",
    classification: "selector-internal-test-principal",
    authorityStatus: "selector-internal-user-test-mode",
    identityAuthority: summary.entitlementFound === true ? "matched-redacted" : "user-test-no-entitlement",
    matchedRedacted: summary.specialPartsVisible === true,
    candidate: summary.entitlementFound !== true,
  };
}

function safeSelectedBlockedValues(local = {}, selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  const blocked = Array.isArray(payload.blockedItems) ? payload.blockedItems : [];
  return blocked.map((item, index) => ({
    redactedRef: item.redactedRef || item.safeRef || `redacted-selected-blocked-value-${index + 1}`,
    value: item.valueLabel || item.value || item.label || `blocked-${index + 1}`,
  })).concat(Array.isArray(local.selectedBlockedValues) ? local.selectedBlockedValues : []);
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
    ["factory-ready", boolString(contract.factoryReady === true)],
    ["Spec Ready", boolString(contract.specGateComplete === true)],
    ["Build Ready", boolString(contract.buildGateComplete === true)],
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
      ["factory-ready", boolString(contract.factoryReady === true)],
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
      ["required for Spec Ready count", rawFields.filter((field) => field.requiredForSpecGate === "true").length],
      ["required for Build Ready count", rawFields.filter((field) => field.requiredForBuildGate === "true").length],
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
    factoryReady: scaffold.factoryReady === true || contract.factoryReady === true,
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
    ["factoryReady", boolString(scaffold.factoryReady)],
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
    ["spec slug requires Spec Ready", boolString(behaviourFlags.specSlugRequiresCompleteSpecGate === true)],
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

function controlOptionBlocked(option = {}) {
  return option?.blocked === true || option?.status === "blocked";
}

function workflowControlOptions(field = {}) {
  const optionSource = Array.isArray(field.dropdownOptions)
    ? field.dropdownOptions
    : (Array.isArray(field.options) ? field.options : []);
  return optionSource
    .filter((option) => !controlOptionBlocked(option))
    .map((option) => ({ ...option, selected: false, rawRowsExposed: false }));
}

function workflowControlIncompatibleOptions(field = {}) {
  const optionSource = Array.isArray(field.incompatibleOptions)
    ? field.incompatibleOptions
    : (Array.isArray(field.options) ? field.options.filter(controlOptionBlocked) : []);
  return optionSource.map((option) => ({ ...option, rawRowsExposed: false }));
}

function workflowControlSelectedBlocked(field = {}) {
  if (!String(field.selectedValue || "").trim()) return false;
  if (field.selectedValueStatus === "diagnostic_unmapped" || field.selectedOptionBlocked === true || field.displayMode === "warning-chip" || field.status === "blocked") return true;
  const selectedValue = String(field.selectedValue || "").trim();
  const selected = [...workflowControlOptions(field), ...workflowControlIncompatibleOptions(field)]
    .find((option) => optionValuesMatch(option.value, selectedValue) || optionValuesMatch(option.label, selectedValue));
  return controlOptionBlocked(selected || {});
}

function workflowControlFieldVisible(field = {}) {
  if (!field?.fieldKey) return false;
  if (field.disabled === true || field.futureMapped === true) return false;
  if (["disabled-handoff", "hidden-diagnostic", "metadata-chip"].includes(field.displayMode)) return false;
  if (field.manualInput === true && (field.status !== "blocked" || String(field.selectedValue || "").trim())) return true;
  const activeOptions = workflowControlOptions(field);
  if (activeOptions.length) return true;
  return workflowControlIncompatibleOptions(field).some((option) => option.selectedBlockedDiagnostic === true || option.selected === true);
}

function workflowControlField(section = {}, field = {}) {
  const activeOptions = workflowControlOptions(field);
  const incompatibleOptions = workflowControlIncompatibleOptions(field);
  const selectedBlocked = workflowControlSelectedBlocked(field);
  const selectedValue = selectedBlocked ? "" : (field.selectedValue || field.effectiveValue || "");
  const selectedLabel = selectedBlocked ? "Not selected" : (field.selectedLabel || field.effectiveLabel || selectedValue || "none");
  return {
    fieldKey: field.fieldKey,
    label: field.label || field.fieldKey,
    sectionKey: section.sectionKey || "workflow",
    value: selectedValue,
    valueLabel: selectedLabel,
    stateLabel: selectedBlocked
      ? "blocked / incompatible — not selected"
      : field.selectedValue
        ? "manual constraint"
        : field.effectiveValue
          ? "auto consequence / changeable"
          : "unselected",
    selectedKind: selectedBlocked ? "blocked" : (field.provenance || field.displayMode || "unselected"),
    manualConstraint: Boolean(field.selectedValue) && !selectedBlocked,
    autoConsequence: Boolean(!field.selectedValue && field.effectiveValue),
    defaultPreview: false,
    mutable: field.disabled !== true && field.futureMapped !== true,
    manualInput: field.manualInput === true,
    inputKind: field.inputKind || "",
    dropdownSourced: field.dropdownSourced === true ? true : field.manualInput === true ? false : undefined,
    selectedOptionBlocked: selectedBlocked,
    selectedBlockedOptionVisible: false,
    selectedBlockedOptionRetainedForDiagnostics: incompatibleOptions.some((option) => option.selectedBlockedDiagnostic === true || option.selected === true),
    compatibleDropdownOptionCount: activeOptions.length,
    incompatibleOptionCount: incompatibleOptions.length,
    options: activeOptions,
    dropdownOptions: activeOptions,
    incompatibleOptions,
    sourceInputFingerprint: field.sourceInputFingerprint || field.sourceVersionBinding?.sourceInputFingerprint || "",
    boardDataSourceVersion: field.boardDataSourceVersion || field.sourceVersionBinding?.boardDataSourceVersion || "",
    sourceVersionBinding: field.sourceVersionBinding || {},
    source: "selectorSurface.workflowSections",
    writes: false,
    rawRowsExposed: false,
  };
}

function selectorSurfaceControlSections(selectorSurface = {}, selectorState, onLocalStateChange) {
  const workflowSections = Array.isArray(selectorSurface.workflowSections) ? selectorSurface.workflowSections : [];
  return workflowSections.map((section) => {
    const fields = (Array.isArray(section.fields) ? section.fields : [])
      .filter(workflowControlFieldVisible)
      .map((field) => workflowControlField(section, field));
    return {
      sectionId: section.sectionKey || "workflow",
      title: section.title || section.sectionKey || "Selector fields",
      source: "selectorSurface.workflowSections",
      reconciledTruth: true,
      fields,
      setFieldValue(fieldKey, value) {
        const controlField = fields.find((field) => field.fieldKey === fieldKey) || {};
        const selectedOption = controlField.options?.find((option) => optionValuesMatch(option.value, value)) || null;
        const label = selectedOption?.label || "";
        const sourceVersionBinding = selectedOption?.sourceVersionBinding || controlField.sourceVersionBinding || selectorSurface.sourceVersionBinding || {};
        if (value) {
          if (selectorSurface.setFieldValue) selectorSurface.setFieldValue(fieldKey, value);
          else {
            selectorState?.setDbBackedSelectorFieldValue?.(fieldKey, value, label, sourceVersionBinding);
            onLocalStateChange?.();
          }
        } else {
          if (selectorSurface.clearFieldValue) selectorSurface.clearFieldValue(fieldKey);
          else {
            selectorState?.clearDbBackedSelectorFieldValue?.(fieldKey);
            onLocalStateChange?.();
          }
        }
      },
      clearManualConstraint(fieldKey) {
        if (selectorSurface.clearFieldValue) selectorSurface.clearFieldValue(fieldKey);
        else {
          selectorState?.clearDbBackedSelectorFieldValue?.(fieldKey);
          onLocalStateChange?.();
        }
      },
    };
  }).filter((section) => section.fields.length);
}

function setSelectorControlValue(selectorState, fieldKey, value) {
  if (selectorState?.setDbBackedSelectorFieldValue) selectorState.setDbBackedSelectorFieldValue(fieldKey, value);
  else selectorState?.setSelectorFieldValue?.(fieldKey, value);
}

function clearSelectorControlValue(selectorState, fieldKey) {
  if (selectorState?.clearDbBackedSelectorFieldValue) selectorState.clearDbBackedSelectorFieldValue(fieldKey);
  else selectorState?.clearSelectorFieldValue?.(fieldKey);
}

function createSelectionControls(contract = {}, selectorState, onLocalStateChange, selectorSurface = null) {
  if (Array.isArray(selectorSurface?.workflowSections) && selectorSurface.workflowSections.length) {
    return selectorSurfaceControlSections(selectorSurface, selectorState, onLocalStateChange);
  }

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
      source: "selectorStateContract.sectionFieldContract",
      reconciledTruth: false,
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
            writes: false,
            rawRowsExposed: false,
          };
        }),
      setFieldValue(fieldKey, value) {
        setSelectorControlValue(selectorState, fieldKey, value);
        onLocalStateChange?.();
      },
      clearManualConstraint(fieldKey) {
        clearSelectorControlValue(selectorState, fieldKey);
        onLocalStateChange?.();
      },
    };
  }).filter((section) => section.fields.length);
}

function createManualConstraintBehaviour(contract = {}, selectorState, onLocalStateChange, selectorSurface = null) {
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
      ["buildReady", boolString(contract.buildReady === true)],
      ["factoryReady", boolString(contract.factoryReady === true)],
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
    controlSections: createSelectionControls(contract, selectorState, onLocalStateChange, selectorSurface),
  };
}

function stripDirectionSuffix(value = "") {
  return String(value || "").trim().replace(/\|(direct|indirect)$/i, "");
}

function optionValuesMatch(left, right) {
  return stripDirectionSuffix(left).toLowerCase() === stripDirectionSuffix(right).toLowerCase();
}

const SURFACE_MOUNT_DI_BLOCK_POLICY_ID = "SURFACE_MOUNT_DI_BLOCK";
const SURFACE_MOUNT_DI_BLOCK_DEFAULT_REASON = "Surface Mount is blocked for direct-indirect/uplight systems because the ceiling would block the indirect light component.";
const MOUNTING_WALL_TOP_POLICY_IDS = Object.freeze([
  "WALL_BRACKET_TOP_ENTRY_BLOCK",
  "TOP_ENTRY_WALL_BRACKET_BLOCK",
]);
const MOUNTING_CEILING_SIDE_POLICY_IDS = Object.freeze([
  "CEILING_BRACKET_SIDE_ENTRY_BLOCK",
  "SIDE_ENTRY_CEILING_BRACKET_BLOCK",
]);

function canonicalMountStyleValue(label) {
  const text = String(label || "").trim().toLowerCase().replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (/trimless/.test(text)) return "trimless";
  if (/recess/.test(text) && /no flange/.test(text)) return "trimless";
  if (/recess/.test(text) || /with flange/.test(text)) return "recessed";
  if (/surface/.test(text)) return "surface mount";
  if (/suspend/.test(text)) return "suspended";
  if (text.includes("bracket")) return "surface mount";
  return text;
}

function mountStyleValuesMatch(left, right) {
  const leftKey = canonicalMountStyleValue(left);
  const rightKey = canonicalMountStyleValue(right);
  return Boolean(leftKey && rightKey && leftKey === rightKey) || optionValuesMatch(left, right);
}

function mountOrientationText(value = "") {
  return String(value || "").trim().toLowerCase().replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

function mountTextHasCeilingBracket(value = "") {
  const text = mountOrientationText(value);
  return text.includes("ceiling bracket") || text.includes("sealing bracket");
}

function mountTextHasWallBracket(value = "") {
  return mountOrientationText(value).includes("wall bracket");
}

function penetrationTextIsSideWall(value = "") {
  const text = mountOrientationText(value);
  return text.includes("side wall") || (text.includes("side") && text.includes("wall"));
}

function penetrationTextIsTop(value = "") {
  return mountOrientationText(value).includes("top");
}

function optionCodePolicyIds(option = {}) {
  return (Array.isArray(option.codePolicyIds) ? option.codePolicyIds : [option.codePolicyIds]).map((id) => String(id || "").trim()).filter(Boolean);
}

function optionHasCodePolicy(option = {}, policyId = "") {
  const wanted = String(policyId || "").trim().toLowerCase();
  return optionCodePolicyIds(option).some((id) => id.toLowerCase() === wanted);
}

function optionHasAnyCodePolicy(option = {}, policyIds = []) {
  return policyIds.some((policyId) => optionHasCodePolicy(option, policyId));
}

function safeRecordMap(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function dbConstraintMap(local = {}) {
  return safeRecordMap(local.dbBackedSelector?.manualConstraints);
}

function dbAcceptedDefaultMap(local = {}) {
  return safeRecordMap(local.dbBackedSelector?.acceptedDefaults);
}

function dbEffectiveConstraintMap(local = {}) {
  return {
    ...dbAcceptedDefaultMap(local),
    ...dbConstraintMap(local),
  };
}

function recordValueMap(records = {}) {
  return Object.fromEntries(Object.entries(records).map(([fieldKey, record]) => [fieldKey, String(record?.value || "").trim()]).filter(([, value]) => value));
}

function dbConstraintValueMap(local = {}) {
  return recordValueMap(dbConstraintMap(local));
}

function dbAcceptedDefaultValueMap(local = {}) {
  return recordValueMap(dbAcceptedDefaultMap(local));
}

function dbEffectiveConstraintValueMap(local = {}) {
  return recordValueMap(dbEffectiveConstraintMap(local));
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

function dbSourceReadinessPayload(selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  return payload.sourceReadiness || payload.safeSnapshotState || selectorReferenceStatus.sourceReadiness || selectorReferenceStatus.safeSnapshotState || null;
}

function dbReferenceOptionCoverage(selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  const readiness = dbSourceReadinessPayload(selectorReferenceStatus) || {};
  return payload.referenceOptionSourceCoverage || selectorReferenceStatus.referenceOptionSourceCoverage || readiness.referenceOptionSourceCoverage || null;
}

function safeDbSourceVersionValue(value = "") {
  return String(value ?? "").trim();
}

function dbSourceVersionBinding(selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  const binding = payload.sourceVersionBinding || selectorReferenceStatus.sourceVersionBinding || {};
  const sourceInputFingerprint = safeDbSourceVersionValue(payload.sourceInputFingerprint || binding.sourceInputFingerprint || payload.sourceInputFingerprintMetadata?.value || "");
  const boardDataSourceVersion = safeDbSourceVersionValue(payload.boardDataSourceVersion || binding.boardDataSourceVersion || payload.boardDataSourceVersionMetadata?.value || "");
  const bound = Boolean(sourceInputFingerprint && boardDataSourceVersion);
  return {
    ...binding,
    sourceInputFingerprint,
    boardDataSourceVersion,
    bindingStatus: bound ? "source-version-bound" : "source-version-unbound",
    optionSetsBound: bound,
    selectedValuesBound: bound,
    staleRevalidationEnabled: true,
    staleValuesBecomeDiagnosticUnmapped: true,
    staleValuesInsertedIntoOptions: false,
    readOnly: true,
    diagnosticOnly: true,
    writes: false,
    rawRowsExposed: false,
  };
}

function dbOptionSourceVersionBinding(selectorReferenceStatus = {}, fieldKey = "", value = "") {
  const payloadBinding = dbSourceVersionBinding(selectorReferenceStatus);
  const field = dbOptionField(selectorReferenceStatus, fieldKey) || {};
  const option = (Array.isArray(field.options) ? field.options : [])
    .find((item) => optionValuesMatch(item.value, value) || optionValuesMatch(item.label, value));
  return option?.sourceVersionBinding || field.sourceVersionBinding || payloadBinding;
}

function yesNoWord(value) {
  return value === true ? "yes" : "no";
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
  const readiness = surface.sourceReadiness || surface.safeSnapshotState || {};
  const coverage = surface.referenceOptionSourceCoverage || readiness.referenceOptionSourceCoverage || {};
  const sourceVersionBinding = surface.sourceVersionBinding || readiness.sourceVersionBinding || {};
  const missingBlockers = Array.isArray(readiness.missingTableBlockers) ? readiness.missingTableBlockers : [];
  return [
    ["candidate state", summary.state || "default preview"],
    ["source readiness", surface.sourceReady === true ? "ready" : "unavailable"],
    ["source readiness state", readiness.state || (surface.sourceReady === true ? "source-backed-safe-preview" : "fail-closed-source-warning")],
    ["safe snapshot state", readiness.completeEnoughForPreview === true ? "complete enough for read-only preview" : "fail-closed or incomplete"],
    ["active snapshot", `${yesNoWord(readiness.activeSnapshot?.present ?? surface.sourceReady)} present / ${yesNoWord(readiness.activeSnapshot?.readable ?? surface.sourceReady)} readable / ${yesNoWord(readiness.activeSnapshot?.parseable ?? surface.sourceReady)} parseable`],
    ["source input fingerprint", sourceVersionBinding.sourceInputFingerprint || "not provided"],
    ["board data source version", sourceVersionBinding.boardDataSourceVersion || "not provided"],
    ["source-version revalidation", sourceVersionBinding.staleRevalidationEnabled === false ? "disabled" : "enabled"],
    ["materialised snapshot", `${yesNoWord(readiness.materialisedSnapshot?.present)} present / ${yesNoWord(readiness.materialisedSnapshot?.readable)} readable`],
    ["expected tables present", yesNoWord(readiness.expectedTablesPresent)],
    ["missing table blockers", missingBlockers.length ? missingBlockers.map((blocker) => blocker.table).join(", ") : "none"],
    ["source-backed fields", coverage.sourceBackedFieldCount ?? 0],
    ["future-mapped fields", coverage.futureMappedFieldCount ?? 0],
    ["safe redaction", "raw rows, raw headers, USERS identifiers, credentials, provider IDs, and private paths redacted"],
    ["option fields mapped", summary.optionFieldCount ?? 0],
    ["available fields", summary.availableFieldCount ?? 0],
    ["workflow sections", summary.workflowSectionCount ?? 0],
    ["workflow fields mapped", summary.workflowMappedFieldCount ?? 0],
    ["donor fields represented", summary.donorFieldParityCounts?.total ?? 0],
    ["manual constraints", summary.manualConstraintCount ?? 0],
    ["auto consequences", summary.autoConsequenceCount ?? 0],
    ["blocked / missing items", summary.blockedCount ?? 0],
    ["Spec Ready", "incomplete — preview-ready does not mean spec-ready"],
    ["Lab Proof", "not established — Selector preview is not proof authority"],
    ["writes", "disabled"],
  ];
}

function createDbBackedPathRows(surface = {}) {
  const path = Array.isArray(surface.pathToSpecReady) ? surface.pathToSpecReady : [];
  const rows = path.length ? path.map((item, index) => [`step ${index + 1}`, item]) : [["future spec-ready", "requires Spec Ready later"]];
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
  const selectedConstraints = dbEffectiveConstraintValueMap(local);
  const payloadSourceVersionBinding = dbSourceVersionBinding(selectorReferenceStatus);
  return dbOptionsFields(selectorReferenceStatus).map((field) => {
    const selectedValue = selectedConstraints[field.fieldKey] || "";
    const fieldSourceVersionBinding = field.sourceVersionBinding || payloadSourceVersionBinding;
    const options = Array.isArray(field.options) ? field.options.map((option) => {
      const optionSourceVersionBinding = option.sourceVersionBinding || fieldSourceVersionBinding;
      const selected = selectedValue ? (optionValuesMatch(option.value, selectedValue) || (field.fieldKey === "system" && systemOptionMatchesSelection(option, selectedValue))) : false;
      const locallyCompatible = dbOptionLocallyCompatible(field.fieldKey, option, selectedConstraints, selectorReferenceStatus);
      const blocked = option.blocked === true || !locallyCompatible;
      return {
        ...option,
        sourceInputFingerprint: optionSourceVersionBinding.sourceInputFingerprint || "",
        boardDataSourceVersion: optionSourceVersionBinding.boardDataSourceVersion || "",
        sourceVersionBinding: optionSourceVersionBinding,
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
      sourceInputFingerprint: fieldSourceVersionBinding.sourceInputFingerprint || "",
      boardDataSourceVersion: fieldSourceVersionBinding.boardDataSourceVersion || "",
      sourceVersionBinding: fieldSourceVersionBinding,
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

function selectedSystemOptionFromFieldOptions(options = [], selectedValue = "") {
  const selected = String(selectedValue || "").trim();
  if (!selected) return null;
  const exact = options.find((option) => optionValuesMatch(option.value, selected))
    || options.find((option) => optionValuesMatch(option.label, selected));
  if (exact) return exact;
  return options
    .map((option, index) => ({ option, score: systemSelectionMatchScore(option, selected), index }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.option || null;
}

function labelFromWorkflowField(field = {}, value = "") {
  const options = Array.isArray(field.options) ? field.options : [];
  const option = field.fieldKey === "system"
    ? selectedSystemOptionFromFieldOptions(options, value)
    : options.find((item) => optionValuesMatch(item.value, value));
  return option?.label || String(value || "");
}

function systemTokenFromSelection(value = "") {
  return stripDirectionSuffix(value).split("|")[0] || "";
}

function normaliseSystemReferenceAlias(value = "") {
  return String(stripDirectionSuffix(value) || "")
    .trim()
    .toLowerCase()
    .replaceAll("direct/indirect", "di")
    .replaceAll("direct indirect", "di")
    .replaceAll("d/i", "di")
    .replaceAll("d-i", "di")
    .split(/[^a-z0-9|+]+/)
    .filter((token) => token && !["style", "profile"].includes(token))
    .join(" ");
}

function normalisedSelectionTokens(value = "") {
  return new Set(String(value || "").trim().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function normalisedSystemSelectionTokens(value = "") {
  return new Set(normaliseSystemReferenceAlias(value).split(/[^a-z0-9]+/).filter(Boolean));
}

function selectionTokensIncludeAll(haystackTokens, needleTokens) {
  const needles = Array.from(needleTokens || []).filter(Boolean);
  return needles.length > 0 && needles.every((token) => haystackTokens.has(token));
}

function systemOptionVariant(option = {}) {
  return String(option.systemVariantKey || String(option.value || "").split("|").slice(1).join("|")).trim();
}

function systemSelectionMatchScore(option = {}, selectedSystem = "") {
  const selected = String(selectedSystem || "").trim();
  if (!selected) return 0;
  if (optionValuesMatch(option.value, selected)) return 10000;
  if (optionValuesMatch(option.label, selected)) return 9500;

  const systemKey = String(option.systemReferenceKey || systemTokenFromSelection(option.value || "")).trim();
  const variant = systemOptionVariant(option);
  const selectedTokens = normalisedSystemSelectionTokens(selected);
  const selectedParts = selected.split("|").map((item) => item.trim()).filter(Boolean);
  const systemTokenCount = normalisedSystemSelectionTokens(systemKey).size;
  const selectedLooksVariantSpecific = selectedParts.length > 1 || selectedTokens.size > systemTokenCount;
  const selectedIsExactSystemOnly = Boolean(systemKey && optionValuesMatch(systemKey, selected) && !selectedLooksVariantSpecific);

  if (systemKey) {
    const systemTokens = normalisedSystemSelectionTokens(systemKey);
    const exactSystem = optionValuesMatch(systemKey, selected);
    if (!exactSystem && !selectionTokensIncludeAll(selectedTokens, systemTokens)) return 0;
    if (!variant) return exactSystem ? 8000 : 5000;
  }

  if (!variant) return 0;
  const variantTokens = normalisedSystemSelectionTokens(variant);
  const variantPhrase = normaliseSystemReferenceAlias(variant).replace(/[^a-z0-9]+/g, " ").trim();
  const selectedPhrase = normaliseSystemReferenceAlias(selected).replace(/[^a-z0-9]+/g, " ").trim();
  const variantMatched = Boolean(variantPhrase && selectedPhrase.includes(variantPhrase)) || selectionTokensIncludeAll(selectedTokens, variantTokens);
  if (!variantMatched) return selectedIsExactSystemOnly ? 5500 : 0;
  const specificity = Array.from(variantTokens).join("").length + variantTokens.size;
  return selectedLooksVariantSpecific ? 7000 + specificity : 6000 + specificity;
}

function systemOptionMatchesSelection(option = {}, selectedSystem = "") {
  return systemSelectionMatchScore(option, selectedSystem) > 0;
}

function workflowOpticSystemReferenceKeys(workflowSections = []) {
  const keys = new Set();
  const opticFieldKeys = new Set([
    "optic",
    "opticSub",
    "opticIndirect",
    "diffuserVar1",
    "diffuserVar2",
    "directOpticVar1",
    "directOpticVar2",
    "indirectOpticVar1",
    "indirectOpticVar2",
  ]);
  for (const section of workflowSections) {
    for (const field of section.fields || []) {
      if (!opticFieldKeys.has(field.fieldKey)) continue;
      for (const option of field.options || []) {
        const key = String(option.systemReferenceKey || "").trim();
        if (key) keys.add(key.toLowerCase());
      }
      for (const option of field.deferredOptions || []) {
        const key = String(option.systemReferenceKey || "").trim();
        if (key) keys.add(key.toLowerCase());
      }
    }
  }
  return keys;
}

function workflowSystemReferenceKey(workflowSections = [], selectedSystem = "") {
  if (!selectedSystem) return "";
  const opticSystemKeys = workflowOpticSystemReferenceKeys(workflowSections);
  const option = workflowSelectedSystemOption(workflowSections, selectedSystem);
  if (!option) return "";
  const identityKey = [option.systemReferenceKey, option.systemVariantKey].map((item) => String(item || "").trim()).filter(Boolean).join("|");
  const candidates = [
    identityKey,
    option.systemVariantKey,
    option.systemReferenceKey,
    systemTokenFromSelection(option.value || option.label),
  ].map((item) => String(item || "").trim()).filter(Boolean);
  const matchedOpticKey = candidates.find((candidate) => opticSystemKeys.has(candidate.toLowerCase()));
  if (matchedOpticKey) return matchedOpticKey;
  return identityKey || option.systemReferenceKey || systemTokenFromSelection(option.value || option.label);
}

function workflowSelectedSystemOption(workflowSections = [], selectedSystem = "") {
  if (!selectedSystem) return null;
  const scored = [];
  for (const section of workflowSections) {
    const field = (section.fields || []).find((item) => item.fieldKey === "system");
    if (!field) continue;
    for (const option of field.options || []) {
      const score = systemSelectionMatchScore(option, selectedSystem);
      if (score > 0) scored.push({ option, score, index: scored.length });
    }
  }
  return scored.sort((left, right) => right.score - left.score || left.index - right.index)[0]?.option || null;
}

function workflowSystemSupportsDirect(workflowSections = [], selectedSystem = "") {
  return workflowSelectedSystemOption(workflowSections, selectedSystem)?.systemSupportsDirect === true;
}

function workflowSystemSupportsIndirect(workflowSections = [], selectedSystem = "") {
  return workflowSelectedSystemOption(workflowSections, selectedSystem)?.systemSupportsIndirect === true;
}

function diffuserParentConstraintForField(fieldKey = "", selectedConstraints = {}) {
  if (fieldKey === "directOpticVar2") return selectedConstraints.directOpticVar1 || selectedConstraints.diffuserVar1 || "";
  if (fieldKey === "indirectOpticVar2") return "";
  if (["diffuserVar2", "diffuserMaterial", "diffuserSpecCodePreview", "diffuserImageReadiness"].includes(fieldKey)) return selectedConstraints.diffuserVar1 || selectedConstraints.optic || "";
  return "";
}

function localDiffuserRelationshipBlock(fieldKey = "", option = {}, selectedConstraints = {}) {
  const blockers = [];
  const optionValue = String(option.value || "");
  const optionSystem = String(option.systemReferenceKey || systemTokenFromSelection(option.parentValue || optionValue));
  const selectedSystem = String(selectedConstraints.__systemReferenceKey || systemTokenFromSelection(selectedConstraints.system || ""));
  if (["diffuserVar1", "diffuserVar2", "directOpticVar1", "directOpticVar2", "indirectOpticVar1", "indirectOpticVar2", "diffuserMaterial", "diffuserSpecCodePreview", "diffuserImageReadiness"].includes(fieldKey)
    && selectedSystem && optionSystem && !optionValuesMatch(optionSystem, selectedSystem)) {
    blockers.push({
      fieldKey: "system",
      selectedValue: selectedConstraints.system,
      compatibleValues: [option.parentValue || option.value].filter(Boolean),
    });
  }

  const parentConstraint = diffuserParentConstraintForField(fieldKey, selectedConstraints);
  const parentValue = String(option.parentValue || "");
  if (parentConstraint && parentValue && !optionValuesMatch(parentValue, parentConstraint)) {
    blockers.push({
      fieldKey: option.parentFieldKey || "diffuserVar1",
      selectedValue: parentConstraint,
      compatibleValues: [parentValue],
    });
  }

  return {
    blocked: blockers.length > 0,
    blockedBy: blockers,
    reason: blockers.length
      ? "Blocked by current diffuser / optic var 1 or system constraint; shown rather than silently hidden."
      : "",
  };
}

const DIRECT_LIGHT_CONTROL_LANE_FIELDS = Object.freeze(new Set(["targetLmPerM", "cctCri", "controlType"]));
const INDIRECT_LIGHT_CONTROL_LANE_FIELDS = Object.freeze(new Set(["targetLmPerMIndirect", "cctCriIndirect", "controlTypeIndirect", "indirectMatchDirect"]));

const LIGHT_CONTROL_SYSTEM_SCOPED_FIELDS = Object.freeze(new Set([
  "application",
  "interiorExterior",
  "ipRating",
  "ikRating",
  "targetLmPerM",
  "targetLmPerMIndirect",
  "cctCri",
  "cctCriIndirect",
  "controlType",
  "controlTypeIndirect",
  "lexWeight",
  "bodyFinish",
  "finishCover",
  "finishEnd",
  "finishFlex",
]));

function optionSystemReferenceKeys(option = {}) {
  return [
    option.systemReferenceKey,
    ...(Array.isArray(option.systemReferenceKeys) ? option.systemReferenceKeys : []),
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

function selectedSystemReferenceCandidates(selectedConstraints = {}) {
  const selectedSystem = String(selectedConstraints.system || "").trim();
  const selectedParts = selectedSystem.split("|").map((item) => item.trim()).filter(Boolean);
  return [
    selectedSystem,
    selectedConstraints.__systemReferenceKey,
    systemTokenFromSelection(selectedSystem),
    ...selectedParts,
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

function systemReferenceValueIsWildcard(value = "") {
  const raw = String(stripDirectionSuffix(value) || "").trim();
  if (!raw) return false;
  return raw === "*" || raw.split("|").map((item) => item.trim()).filter(Boolean)[0] === "*";
}

function systemReferenceValuesMatch(optionKey = "", selectedKey = "") {
  if (systemReferenceValueIsWildcard(optionKey)) return true;
  if (optionValuesMatch(optionKey, selectedKey)) return true;
  const optionTokens = normalisedSystemSelectionTokens(optionKey);
  const selectedTokens = normalisedSystemSelectionTokens(selectedKey);
  return selectionTokensIncludeAll(optionTokens, selectedTokens) || selectionTokensIncludeAll(selectedTokens, optionTokens);
}

function optionMatchesSelectedSystemReference(option = {}, selectedConstraints = {}) {
  const optionKeys = optionSystemReferenceKeys(option);
  const selectedKeys = selectedSystemReferenceCandidates(selectedConstraints);
  if (!optionKeys.length || !selectedKeys.length) return true;
  return selectedKeys.some((selected) => optionKeys.some((optionKey) => systemReferenceValuesMatch(optionKey, selected)));
}

function driverCompatibleWithSelectedControl(option = {}, selectedControl = "") {
  const control = String(selectedControl || "").trim();
  if (!control) return true;
  const compatibleControlTypes = Array.isArray(option.compatibleControlTypes)
    ? option.compatibleControlTypes.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (!compatibleControlTypes.length) return true;
  return compatibleControlTypes.some((compatibleControlType) => optionValuesMatch(compatibleControlType, control));
}

const ENVIRONMENT_IP_IK_FIELD_KEYS = Object.freeze(new Set(["ipRating", "ikRating"]));

function selectedDirectOpticConstraintValue(selectedConstraints = {}) {
  return selectedConstraints.directOpticVar1 || selectedConstraints.diffuserVar1 || selectedConstraints.optic || "";
}

function optionParentValues(option = {}) {
  return [
    option.parentValue,
    ...(Array.isArray(option.parentValues) ? option.parentValues : []),
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

function localEnvironmentIpIkRelationshipBlock(fieldKey = "", option = {}, selectedConstraints = {}) {
  if (!ENVIRONMENT_IP_IK_FIELD_KEYS.has(fieldKey)) return { blocked: false, blockedBy: [], reason: "" };
  const blockers = [];
  const selectedSystem = String(selectedConstraints.system || "").trim();
  const optionSystemKeys = optionSystemReferenceKeys(option);
  if (selectedSystem && (!optionSystemKeys.length || !optionMatchesSelectedSystemReference(option, selectedConstraints))) {
    blockers.push({
      fieldKey: "system",
      selectedValue: selectedConstraints.system,
      compatibleValues: optionSystemKeys.length ? optionSystemKeys : ["source OPTICS row system mapping required"],
    });
  }

  const selectedOptic = selectedDirectOpticConstraintValue(selectedConstraints);
  const parentValues = optionParentValues(option);
  if (selectedOptic && (!parentValues.length || !parentValues.some((parentValue) => optionValuesMatch(parentValue, selectedOptic)))) {
    blockers.push({
      fieldKey: "directOpticVar1",
      selectedValue: selectedOptic,
      compatibleValues: parentValues.length ? parentValues : ["source OPTICS row optic mapping required"],
    });
  }

  return {
    blocked: blockers.length > 0,
    blockedBy: blockers,
    reason: blockers.length
      ? "IP/IK options are scoped to the selected System plus selected optic/diffuser; unscoped values stay diagnostic-only."
      : "",
  };
}

function localLightControlRelationshipBlock(fieldKey = "", option = {}, selectedConstraints = {}) {
  const blockers = [];
  const strictEnvironmentBlock = localEnvironmentIpIkRelationshipBlock(fieldKey, option, selectedConstraints);

  if (DIRECT_LIGHT_CONTROL_LANE_FIELDS.has(fieldKey) && selectedConstraints.__systemSupportsDirect === false) {
    blockers.push({ fieldKey: "directCapability", selectedValue: "unsupported by current upstream selection", compatibleValues: ["direct-supported"] });
  }
  if (INDIRECT_LIGHT_CONTROL_LANE_FIELDS.has(fieldKey) && selectedConstraints.__systemSupportsIndirect === false) {
    blockers.push({ fieldKey: "indirectCapability", selectedValue: "unsupported by current upstream selection", compatibleValues: ["indirect-supported"] });
  }

  if (!ENVIRONMENT_IP_IK_FIELD_KEYS.has(fieldKey) && LIGHT_CONTROL_SYSTEM_SCOPED_FIELDS.has(fieldKey) && !optionMatchesSelectedSystemReference(option, selectedConstraints)) {
    blockers.push({
      fieldKey: "system",
      selectedValue: selectedConstraints.system,
      compatibleValues: optionSystemReferenceKeys(option),
    });
  }

  if (fieldKey === "driver" && !driverCompatibleWithSelectedControl(option, selectedConstraints.controlType || "")) {
    blockers.push({
      fieldKey: "controlType",
      selectedValue: selectedConstraints.controlType,
      compatibleValues: Array.isArray(option.compatibleControlTypes) ? option.compatibleControlTypes : [],
    });
  }

  return {
    blocked: strictEnvironmentBlock.blocked === true || blockers.length > 0,
    blockedBy: [...strictEnvironmentBlock.blockedBy, ...blockers],
    reason: strictEnvironmentBlock.reason || (blockers.length
      ? "Blocked by current Light & Control manual constraints; shown rather than silently hidden."
      : ""),
  };
}

function optionStrictlyMatchesSelectedSystemReference(option = {}, selectedConstraints = {}) {
  const selectedKeys = selectedSystemReferenceCandidates(selectedConstraints);
  if (!selectedKeys.length) return true;
  const optionKeys = optionSystemReferenceKeys(option);
  if (!optionKeys.length) return false;
  return selectedKeys.some((selected) => optionKeys.some((optionKey) => optionValuesMatch(optionKey, selected)));
}

function localMountingRelationshipBlock(fieldKey = "", option = {}, selectedConstraints = {}) {
  const blockers = [];
  let mountOrientationReason = "";

  if (fieldKey === "mountStyle" && !optionStrictlyMatchesSelectedSystemReference(option, selectedConstraints)) {
    blockers.push({
      fieldKey: "system",
      selectedValue: selectedConstraints.system,
      compatibleValues: optionSystemReferenceKeys(option),
    });
  }

  const optionText = String(option.value || option.label || "");
  if (["mountStyle", "mountSelection", "mountParticulars"].includes(fieldKey)
    && selectedConstraints.__systemSupportsIndirect === true
    && optionHasCodePolicy(option, SURFACE_MOUNT_DI_BLOCK_POLICY_ID)
    && mountTextHasCeilingBracket(optionText)) {
    mountOrientationReason = "Donor mounting rules block ceiling-bracket mounting for direct-indirect/uplight systems while preserving other donor-compatible Surface Mount choices.";
    blockers.push({
      fieldKey: "emission",
      selectedValue: "Both",
      compatibleValues: ["non-ceiling mount selection for direct-indirect/uplight"],
    });
  }

  if (["mountSelection", "mountParticulars"].includes(fieldKey) && selectedConstraints.mountStyle) {
    const parentValues = [
      option.parentValue,
      ...(Array.isArray(option.parentValues) ? option.parentValues : []),
    ].map((item) => String(item || "").trim()).filter(Boolean);
    if (parentValues.length && !parentValues.some((parentValue) => mountStyleValuesMatch(parentValue, selectedConstraints.mountStyle))) {
      blockers.push({
        fieldKey: "mountStyle",
        selectedValue: selectedConstraints.mountStyle,
        compatibleValues: parentValues,
      });
    }
  }

  if (fieldKey === "powerPenetration") {
    const mountContext = [selectedConstraints.mountSelection, selectedConstraints.mountStyle, selectedConstraints.mountParticulars]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(" ");
    if (mountContext && optionHasAnyCodePolicy(option, MOUNTING_WALL_TOP_POLICY_IDS) && mountTextHasWallBracket(mountContext) && penetrationTextIsTop(optionText)) {
      mountOrientationReason = "Donor power-entry rules remove top penetration for wall-bracket/body-orientation mounting.";
      blockers.push({
        fieldKey: "mountSelection",
        selectedValue: selectedConstraints.mountSelection || selectedConstraints.mountStyle || "wall bracket",
        compatibleValues: ["non-top power penetration"],
      });
    }
    if (mountContext && optionHasAnyCodePolicy(option, MOUNTING_CEILING_SIDE_POLICY_IDS) && mountTextHasCeilingBracket(mountContext) && penetrationTextIsSideWall(optionText)) {
      mountOrientationReason = "Donor power-entry rules remove side-wall penetration for ceiling-bracket mounting.";
      blockers.push({
        fieldKey: "mountSelection",
        selectedValue: selectedConstraints.mountSelection || selectedConstraints.mountStyle || "ceiling bracket",
        compatibleValues: ["non-side-wall power penetration"],
      });
    }
  }

  return {
    blocked: blockers.length > 0,
    blockedBy: blockers,
    reason: blockers.length
      ? mountOrientationReason || "Blocked by current Mounting manual constraints; shown rather than silently hidden."
      : "",
  };
}

function mergeLocalRelationshipBlocks(...blocks) {
  const blockedBy = blocks.flatMap((block) => Array.isArray(block.blockedBy) ? block.blockedBy : []);
  return {
    blocked: blocks.some((block) => block.blocked === true),
    blockedBy,
    reason: blocks.find((block) => block.reason)?.reason || "",
  };
}

function localWorkflowRelationshipBlock(fieldKey = "", option = {}, selectedConstraints = {}) {
  return mergeLocalRelationshipBlocks(
    localDiffuserRelationshipBlock(fieldKey, option, selectedConstraints),
    localLightControlRelationshipBlock(fieldKey, option, selectedConstraints),
    localMountingRelationshipBlock(fieldKey, option, selectedConstraints),
  );
}

function enrichDbWorkflowSections(selectorReferenceStatus = {}, local = {}) {
  const workflowSections = dbWorkflowSections(selectorReferenceStatus);
  const selectedConstraints = dbEffectiveConstraintValueMap(local);
  const manualConstraintValues = dbConstraintValueMap(local);
  const acceptedDefaultValues = dbAcceptedDefaultValueMap(local);
  const selectedSystemReferenceKey = workflowSystemReferenceKey(workflowSections, selectedConstraints.system || "");
  const selectedSystemSupportsDirect = workflowSystemSupportsDirect(workflowSections, selectedConstraints.system || "");
  const selectedSystemSupportsIndirect = workflowSystemSupportsIndirect(workflowSections, selectedConstraints.system || "");
  const cascadeConstraints = selectedSystemReferenceKey || selectedSystemSupportsDirect || selectedSystemSupportsIndirect
    ? {
      ...selectedConstraints,
      ...(selectedSystemReferenceKey ? { __systemReferenceKey: selectedSystemReferenceKey } : {}),
      __systemSupportsDirect: selectedSystemSupportsDirect,
      __systemSupportsIndirect: selectedSystemSupportsIndirect,
    }
    : selectedConstraints;
  return workflowSections.map((section) => ({
    ...section,
    fields: (Array.isArray(section.fields) ? section.fields : []).map((field) => {
      const selectedValue = selectedConstraints[field.fieldKey] || "";
      const selectedByManualConstraint = Boolean(selectedValue && manualConstraintValues[field.fieldKey]);
      const selectedByAcceptedDefault = Boolean(selectedValue && !selectedByManualConstraint && acceptedDefaultValues[field.fieldKey]);
      const defaultAcceptanceState = selectedByManualConstraint
        ? "manually-set"
        : selectedByAcceptedDefault
          ? "accepted"
          : selectedValue
            ? "manually-set"
            : "unresolved";
      const manualInputField = field.manualInput === true;
      const upstreamLaneSelected = Boolean(selectedConstraints.system || selectedConstraints.emission);
      const manualLaneSupported = !manualInputField
        || (field.fieldKey === "targetLmPerMIndirect"
          ? selectedSystemSupportsIndirect === true
          : field.fieldKey === "targetLmPerM"
            ? (!upstreamLaneSelected || selectedSystemSupportsDirect === true)
            : true);
      const manualLaneMeta = manualInputField ? {
        status: manualLaneSupported ? "available" : "blocked",
        unavailableReason: manualLaneSupported
          ? "Type target lm/m manually; no BOARDS dropdown, auto-selection, RunTable, IES, or Engine lookup is performed."
          : "This lm/m lane is not required or supported by the current emission selection.",
      } : {};
      const matchDirectActive = !selectedConstraints.indirectMatchDirect || optionValuesMatch(selectedConstraints.indirectMatchDirect, "match-direct");
      const inheritedLaneValue = selectedSystemSupportsIndirect && matchDirectActive && !selectedValue
        ? field.fieldKey === "cctCriIndirect"
          ? selectedConstraints.cctCri || ""
          : field.fieldKey === "controlTypeIndirect"
            ? selectedConstraints.controlType || ""
            : ""
        : "";
      const inheritedLaneMeta = inheritedLaneValue ? {
        status: "available",
        inheritedValue: inheritedLaneValue,
        inheritedLabel: inheritedLaneValue,
        inheritedFrom: "direct light/control preview",
        unavailableReason: "Indirect value matches direct while match-direct is active; clearing/overriding keeps donor-safe source scoping.",
      } : {};
      const optionPayloadProvided = Array.isArray(field.options);
      const baseOptions = optionPayloadProvided ? field.options : [];
      const deferredOptions = Array.isArray(field.deferredOptions) ? field.deferredOptions : [];
      const parentConstraint = diffuserParentConstraintForField(field.fieldKey, selectedConstraints);
      const deferredChildOptionsHydrated = !baseOptions.length && parentConstraint && deferredOptions.length > 0;
      const optionSource = deferredChildOptionsHydrated
        ? deferredOptions.filter((option) => option.parentValue && optionValuesMatch(option.parentValue, parentConstraint))
        : baseOptions;
      const options = optionSource.map((option) => {
        const selected = selectedValue ? (optionValuesMatch(option.value, selectedValue) || (field.fieldKey === "system" && systemOptionMatchesSelection(option, selectedValue))) : false;
        const localBlock = localWorkflowRelationshipBlock(field.fieldKey, option, cascadeConstraints);
        const blocked = option.blocked === true || localBlock.blocked === true;
        const localPolicyBlocked = Array.isArray(localBlock.blockedBy) && localBlock.blockedBy.some((blocker) => blocker.fieldKey === "CODE_POLICY");
        const hydratedStatus = deferredChildOptionsHydrated && !blocked ? "available" : option.status;
        return {
          ...option,
          deferredUntilParentSelected: deferredChildOptionsHydrated ? false : option.deferredUntilParentSelected === true,
          selected,
          status: blocked ? "blocked" : (hydratedStatus || "available"),
          blocked,
          blockedReason: blocked ? option.blockedReason || localBlock.reason || "Blocked by current manual constraints; shown rather than silently hidden." : option.blockedReason || "",
          blockedBy: blocked ? [...(Array.isArray(option.blockedBy) ? option.blockedBy : []), ...localBlock.blockedBy] : (Array.isArray(option.blockedBy) ? option.blockedBy : []),
          relationshipStatus: blocked ? (localPolicyBlocked ? "blocked-by-code-policy" : "blocked-by-diffuser-relationship") : option.relationshipStatus || (deferredChildOptionsHydrated ? "matched-after-parent-selection" : "matched"),
          relationshipMissingReason: blocked ? localBlock.reason : option.relationshipMissingReason || "",
          rawRowsExposed: false,
        };
      });
      return {
        ...field,
        ...manualLaneMeta,
        ...inheritedLaneMeta,
        selectedValue,
        selectedLabel: selectedValue
          ? labelFromWorkflowField({ ...field, options }, selectedValue)
          : presentationIsMetadata(field)
            ? field.selectedLabel || field.effectiveLabel || ""
            : "",
        selectedByManualConstraint,
        selectedByAcceptedDefault,
        defaultAcceptanceState,
        options,
        optionPayloadProvided: optionPayloadProvided || deferredChildOptionsHydrated,
        deferredOptions: deferredOptions.map((option) => ({ ...option, rawRowsExposed: false })),
        deferredChildOptionsHydrated: Boolean(deferredChildOptionsHydrated),
        rawRowsExposed: false,
      };
    }),
    rawRowsExposed: false,
  }));
}

function createDbManualConstraints(selectorReferenceStatus = {}, local = {}) {
  const fields = [
    ...enrichDbOptionFields(selectorReferenceStatus, local),
    ...enrichDbWorkflowSections(selectorReferenceStatus, local).flatMap((section) => Array.isArray(section.fields) ? section.fields : []),
  ];
  return Object.entries(dbConstraintMap(local)).map(([fieldKey, constraint]) => {
    const field = fields.find((item) => item.fieldKey === fieldKey);
    const option = field?.options?.find((item) => optionValuesMatch(item.value, constraint.value));
    const recalledTestCaseConstraint = /test-case recall/i.test(String(constraint.source || ""));
    const optionMissing = Boolean(recalledTestCaseConstraint && String(constraint.value || "").trim() && field && Array.isArray(field.options) && !option);
    const blocked = option?.blocked === true || optionMissing;
    return {
      fieldKey,
      label: field?.label || constraint.label || fieldKey,
      value: constraint.value,
      valueLabel: option?.label || constraint.valueLabel || constraint.value,
      status: blocked ? "blocked" : "manual constraint",
      blocked,
      reason: option?.blockedReason || (optionMissing
        ? "Recalled value is unavailable or incompatible under current source-backed options; preserved for review, not faked valid."
        : "manual selection is treated as a durable constraint"),
      mutable: true,
      writes: false,
    };
  });
}

function createDbCommittedSelectorConstraints(selectorReferenceStatus = {}, local = {}) {
  const fields = [
    ...enrichDbOptionFields(selectorReferenceStatus, local),
    ...enrichDbWorkflowSections(selectorReferenceStatus, local).flatMap((section) => Array.isArray(section.fields) ? section.fields : []),
  ];
  const manualRecords = dbConstraintMap(local);
  const acceptedDefaultRecords = dbAcceptedDefaultMap(local);
  const committedRecords = {
    ...acceptedDefaultRecords,
    ...manualRecords,
  };
  return Object.entries(committedRecords).map(([fieldKey, record]) => {
    const field = fields.find((item) => item.fieldKey === fieldKey);
    const option = field?.options?.find((item) => optionValuesMatch(item.value, record.value));
    const recalledTestCaseConstraint = /test-case recall/i.test(String(record.source || ""));
    const optionMissing = Boolean(recalledTestCaseConstraint && String(record.value || "").trim() && field && Array.isArray(field.options) && !option);
    const blocked = option?.blocked === true || optionMissing;
    const manual = Object.prototype.hasOwnProperty.call(manualRecords, fieldKey);
    const acceptedDefault = !manual && Object.prototype.hasOwnProperty.call(acceptedDefaultRecords, fieldKey);
    return {
      fieldKey,
      label: field?.label || record.label || fieldKey,
      value: record.value,
      valueLabel: option?.label || record.valueLabel || record.value,
      status: blocked ? "blocked" : (acceptedDefault ? "accepted default" : "manual constraint"),
      blocked,
      manualConstraint: manual,
      acceptedDefault,
      committedSelectorState: true,
      authoritySource: manual ? "manualConstraints" : "acceptedDefaults",
      reason: option?.blockedReason || (optionMissing
        ? "Recalled value is unavailable or incompatible under current source-backed options; preserved for review, not faked valid."
        : acceptedDefault
          ? "accepted default is committed selector state"
          : "manual selection is treated as a durable constraint"),
      mutable: true,
      writes: false,
    };
  });
}


const SELECTOR_RUN_INTENT_FIELD_KEYS = Object.freeze(["runQty", "runLength"]);

const SELECTOR_RUN_INTENT_FIELD_LABELS = Object.freeze({
  runQty: "Run quantity",
  runLength: "Run length (mm)",
});

const SELECTOR_RUN_INTENT_DIAGNOSTIC_COPY = Object.freeze({
  "missing-run-quantity": "quantity is required",
  "invalid-run-quantity": "quantity must be a positive integer",
  "missing-run-length": "run length is required",
  "invalid-run-length": "run length must be a positive millimetre value",
  "missing-run-label": "run label is required",
});

function committedSelectorConstraintRecord(committedSelectorConstraints = [], fieldKey) {
  return committedSelectorConstraints.find((constraint) => constraint.fieldKey === fieldKey) || null;
}

function selectorRunIntentConstraintValue(committedSelectorConstraints = [], fieldKey) {
  const record = committedSelectorConstraintRecord(committedSelectorConstraints, fieldKey);
  return record ? String(record.value ?? "").trim() : "";
}

function createSelectorSingleRunIntentCapture({
  committedSelectorConstraints = [],
  local = {},
  selectorState,
  onLocalStateChange,
} = {}) {
  const quantity = selectorRunIntentConstraintValue(committedSelectorConstraints, "runQty");
  const runLengthMm = selectorRunIntentConstraintValue(committedSelectorConstraints, "runLength");
  const committedRunConstraintPresent = SELECTOR_RUN_INTENT_FIELD_KEYS.some((fieldKey) => (
    committedSelectorConstraintRecord(committedSelectorConstraints, fieldKey) !== null
  ));
  const compatibilityRuns = Array.isArray(local.runIntake?.runs) ? local.runIntake.runs : [];
  const derivedRun = {
    id: "run-1",
    runNumber: 1,
    label: "Run 1",
    quantity,
    runLengthMm,
  };
  const compatibilityFallbackUsed = !committedRunConstraintPresent && compatibilityRuns.length > 0;
  const runs = compatibilityFallbackUsed ? compatibilityRuns : [derivedRun];

  return {
    title: "Single-run intent capture",
    source: committedRunConstraintPresent
      ? "committed DB-backed Selector run constraints"
      : compatibilityFallbackUsed
        ? "programmatic local.runIntake.runs compatibility fallback"
        : "empty committed DB-backed Selector run constraints",
    fixedLabel: "Run 1",
    runId: "run-1",
    runNumber: 1,
    quantity,
    runLengthMm,
    committedConstraintsAuthoritative: committedRunConstraintPresent,
    compatibilityFallbackUsed,
    runCountDerived: true,
    multiRunEditingEnabled: false,
    accessoryPlacementControlsEnabled: false,
    engineInvocationEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    drawingGenerationEnabled: false,
    payloadGenerationEnabled: false,
    proofGenerationEnabled: false,
    persistenceEnabled: false,
    writes: false,
    runs,
    setFieldValue(fieldKey, value) {
      if (!SELECTOR_RUN_INTENT_FIELD_KEYS.includes(fieldKey)) return;
      const nextValue = String(value ?? "").trim();
      if (nextValue) {
        selectorState?.setDbBackedSelectorFieldValue?.(
          fieldKey,
          nextValue,
          SELECTOR_RUN_INTENT_FIELD_LABELS[fieldKey] || fieldKey,
          {},
        );
      } else {
        selectorState?.clearDbBackedSelectorFieldValue?.(fieldKey);
      }
      onLocalStateChange?.();
    },
    clearFieldValue(fieldKey) {
      if (!SELECTOR_RUN_INTENT_FIELD_KEYS.includes(fieldKey)) return;
      selectorState?.clearDbBackedSelectorFieldValue?.(fieldKey);
      onLocalStateChange?.();
    },
  };
}

function selectorRunIntentCaptureWithPreview(capture = {}, runIntakePreview = {}) {
  const run = Array.isArray(runIntakePreview.runs) ? runIntakePreview.runs[0] || {} : {};
  const diagnostics = Array.isArray(run.diagnostics) ? run.diagnostics : [];
  const explanationParts = diagnostics.map((diagnostic) => SELECTOR_RUN_INTENT_DIAGNOSTIC_COPY[diagnostic] || diagnostic);
  return {
    ...capture,
    runIntakePreviewReady: runIntakePreview.runIntakePreviewReady === true,
    completedRunCount: runIntakePreview.completedRunCount || 0,
    incompleteRunCount: runIntakePreview.incompleteRunCount || 0,
    runCount: runIntakePreview.runCount || 0,
    completionCopy: `${runIntakePreview.completedRunCount || 0}/${runIntakePreview.runCount || 0} complete`,
    missingOrInvalidDiagnostics: [...diagnostics],
    missingFieldExplanation: explanationParts.length
      ? `Run 1 incomplete: ${explanationParts.join("; ")}.`
      : "Run 1 is complete as safe intent. Production outputs remain disabled.",
  };
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
  const constraints = dbEffectiveConstraintValueMap(local);
  return [
    createDbAvailableConsequence(fields, "driver", constraints),
    createDbAvailableConsequence(fields, "specialParts", constraints),
  ].filter(Boolean);
}

const RUNTIME_PRESENTATION_CLASSIFICATION_NAME = "runtime presentation classification — derived from DB-backed options, manual constraints, and Selector field semantics; not Board Data truth";

const RUNTIME_PRESENTATION_POLICY_DEBT = Object.freeze([
  "Field-key displayMode defaults are local runtime presentation policy for this slice.",
  "The source options remain DB/reference-backed; this policy does not create source truth.",
  "Future Board Data metadata may replace these presentation defaults once approved.",
]);

const RUNTIME_PRESENTATION_PRIMARY_DECISION_FIELDS = Object.freeze(new Set([
  "system",
  "application",
  "interiorExterior",
  "ipRating",
  "ikRating",
  "electricalClass",
  "ambient",
  "targetLmPerM",
  "targetLmPerMIndirect",
  "cctCri",
  "cctCriIndirect",
  "controlType",
  "controlTypeIndirect",
  "indirectMatchDirect",
  "mountStyle",
  "mountSelection",
  "mountParticulars",
  "powerPenetration",
  "powerLocation",
  "flexLength",
  "bodyFinish",
  "finishDefault",
  "egressLight",
  "egressSound",
  "sensor",
  "indirectOpticVar1",
  "runCount",
  "runQty",
  "runLength",
]));

const RUNTIME_PRESENTATION_CONDITIONAL_PRIMARY_FIELDS = Object.freeze(new Set([
  "diffuserVar2",
  "directOpticVar1",
  "directOpticVar2",
]));

const RUNTIME_PRESENTATION_OPTIC_VAR2_PICKER_FIELDS = Object.freeze(new Set([
  "directOpticVar2",
]));

const RUNTIME_PRESENTATION_AUTO_CHIP_FIELDS = Object.freeze(new Set([
  "tier",
  "variantKey",
  "emission",
  "directCapability",
  "indirectCapability",
  "diffuserVar2",
  "directOpticVar1",
  "directOpticVar2",
  "ipRating",
  "ikRating",
  "electricalClass",
  "ambient",
  "targetLmPerM",
  "cctCri",
  "controlType",
  "driver",
  "wiringType",
]));

const RUNTIME_PRESENTATION_MANUAL_ONLY_FIELDS = Object.freeze(new Set([
  "targetLmPerM",
  "targetLmPerMIndirect",
  "accessories",
]));

const RUNTIME_PRESENTATION_INHERITED_FIELDS = Object.freeze(new Set([
  "indirectMatchDirect",
  "cctCriIndirect",
  "controlTypeIndirect",
  "finishCover",
  "finishEnd",
  "finishFlex",
  "inheritedFinishStatus",
]));

const RUNTIME_PRESENTATION_METADATA_FIELDS = Object.freeze(new Set([
  "diffuserMaterial",
  "diffuserSpecCodePreview",
  "diffuserImageReadiness",
  "lexWeight",
]));

const RUNTIME_PRESENTATION_HIDDEN_DIAGNOSTIC_FIELDS = Object.freeze(new Set([
  "indirectOpticVar2",
  "optic",
  "opticSub",
  "opticIndirect",
  "diffuserVar1",
  "specialPartsEntitlement",
  "userEntitlementStatus",
]));

const RUNTIME_PRESENTATION_DISABLED_HANDOFF_FIELDS = Object.freeze(new Set([
  "specialPartsOptIn",
  "runCount",
  "runQty",
  "runLength",
  "runOverrideStatus",
  "runPlacementStatus",
  "runTableGeneration",
  "payloadGeneration",
  "engineVerify",
  "outputNavigation",
  "saveHydrate",
  "hubSpotPush",
  "hubSpotCrmWriteBack",
  "specBuildAuthority",
  "slugSpecGeneration",
  "iesGeneration",
  "payloadRunTableGeneration",
  "drawingGeneration",
  "labProof",
  "controlledRecords",
  "rreg",
  "rregApprovalCustody",
]));

function optionIsUnknownChoice(option = {}) {
  const value = String(option.value || "").trim().toLowerCase();
  const label = String(option.label || "").trim().toLowerCase();
  return value === "unknown" || label === "unknown";
}

function presentationCompatibleOptions(field = {}) {
  if (field.optionPayloadProvided !== true || !Array.isArray(field.options)) return null;
  return field.options.filter((option) => option?.blocked !== true && option?.status !== "blocked" && !optionIsUnknownChoice(option));
}

function presentationSelectedOption(field = {}) {
  const selectedValue = String(field.selectedValue || "").trim();
  const options = Array.isArray(field.options) ? field.options : [];
  if (field.fieldKey === "system" && selectedValue) return selectedSystemOptionFromFieldOptions(options, selectedValue);
  if (["cctCri", "cctCriIndirect"].includes(field.fieldKey) && selectedValue) return options.find((option) => optionValuesMatch(option.value, selectedValue))
    || options.find((option) => option.selected === true)
    || null;
  if (selectedValue) return options.find((option) => optionValuesMatch(option.value, selectedValue))
    || options.find((option) => optionValuesMatch(option.label, selectedValue))
    || options.find((option) => option.selected === true)
    || null;
  return options.find((option) => option.selected === true) || null;
}

function diagnosticUnmappedOptionFromField(field = {}) {
  if (field.selectedValueStatus !== "diagnostic_unmapped") return null;
  const diagnostic = field.selectedValueDiagnostic && typeof field.selectedValueDiagnostic === "object" ? field.selectedValueDiagnostic : {};
  const value = String(diagnostic.value || field.selectedValue || "").trim();
  if (!value) return null;
  return {
    value,
    label: diagnostic.label || value,
    selected: true,
    status: "blocked",
    blocked: true,
    selectedBlockedDiagnostic: true,
    sourceStatus: "diagnostic_unmapped",
    selectedValueStatus: "diagnostic_unmapped",
    blockedReason: diagnostic.reason || field.unavailableReason || "Selected value is not present in canonical source options and is diagnostic only.",
    writes: false,
    rawRowsExposed: false,
  };
}

function presentationSelectedCodePolicyOption(field = {}) {
  const selectedValue = String(field.selectedValue || "").trim();
  if (!selectedValue) return null;
  const options = Array.isArray(field.options) ? field.options : [];
  return options.find((option) => {
    const selected = option.selected === true || optionValuesMatch(option.value, selectedValue);
    if (!selected) return false;
    const hasPolicyId = optionCodePolicyIds(option).length > 0;
    const hasPolicyBlocker = (Array.isArray(option.blockedBy) ? option.blockedBy : [])
      .some((entry) => String(entry.fieldKey || "") === "CODE_POLICY");
    return hasPolicyId || hasPolicyBlocker;
  }) || null;
}

function workflowOptionMatchesSelection(option = {}, field = {}) {
  const selectedValue = String(field.selectedValue || "").trim();
  return option.selected === true || Boolean(selectedValue && optionValuesMatch(option.value, selectedValue));
}

function createDonorShapeDropdownSplit(field = {}) {
  const options = Array.isArray(field.options) ? field.options : [];
  const dropdownOptions = [];
  const diagnosticUnmappedOption = diagnosticUnmappedOptionFromField(field);
  const incompatibleOptions = diagnosticUnmappedOption ? [diagnosticUnmappedOption] : [];
  for (const option of options) {
    if (optionIsUnknownChoice(option)) continue;
    const selected = workflowOptionMatchesSelection(option, field);
    const blocked = option.blocked === true || option.status === "blocked";
    const safeOption = {
      ...option,
      selected,
      rawRowsExposed: false,
    };
    if (blocked) {
      incompatibleOptions.push({
        ...safeOption,
        selectedBlockedDiagnostic: selected === true,
      });
    } else {
      dropdownOptions.push(safeOption);
    }
  }
  return {
    dropdownOptions,
    incompatibleOptions,
    incompatibleOptionCount: incompatibleOptions.length,
    compatibleDropdownOptionCount: dropdownOptions.filter((option) => option.blocked !== true && option.status !== "blocked").length,
    selectedBlockedOptionVisible: false,
    selectedBlockedOptionRetainedForDiagnostics: incompatibleOptions.some((option) => option.selectedBlockedDiagnostic === true),
    rawRowsExposed: false,
  };
}

function finishInheritanceContextFromWorkflow(workflowSections = []) {
  const fields = workflowSections.flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
  const fieldByKey = new Map(fields.map((field) => [field.fieldKey, field]));
  const bodyField = fieldByKey.get("bodyFinish") || fieldByKey.get("finishDefault") || null;
  const bodyValue = String(bodyField?.selectedValue || "").trim();
  const bodyOptions = bodyField ? (presentationCompatibleOptions(bodyField) || []) : [];
  const bodyIndex = bodyValue
    ? bodyOptions.findIndex((option) => optionValuesMatch(option.value, bodyValue) || optionValuesMatch(option.label, bodyValue))
    : -1;
  return { bodyValue, bodyOptions, bodyIndex };
}

function presentationInheritedFinishOption(field = {}, compatibleOptions = [], finishContext = {}) {
  const selected = presentationSelectedOption(field);
  if (selected) return selected;
  const options = Array.isArray(compatibleOptions) ? compatibleOptions : [];
  const inheritedValue = String(field.inheritedValue || "").trim();
  if (inheritedValue) {
    return options.find((option) => optionValuesMatch(option.value, inheritedValue) || optionValuesMatch(option.label, inheritedValue)) || {
      value: inheritedValue,
      label: field.inheritedLabel || inheritedValue,
      status: field.inheritedMissing === true ? "blocked" : "inherited",
      blocked: field.inheritedMissing === true,
      inheritedSelected: true,
      inheritedFrom: field.inheritedFrom || "bodyFinish",
      rawRowsExposed: false,
    };
  }
  const bodyValue = String(finishContext.bodyValue || "").trim();
  if (!["finishCover", "finishEnd", "finishFlex", "inheritedFinishStatus"].includes(field.fieldKey)) return null;
  if (!bodyValue) return null;
  if (field.fieldKey === "finishCover" || field.fieldKey === "finishEnd") {
    return options.find((option) => optionValuesMatch(option.value, bodyValue) || optionValuesMatch(option.label, bodyValue)) || null;
  }
  if (field.fieldKey === "finishFlex") {
    if (!options.length) return null;
    const bodyOption = finishContext.bodyOptions?.find?.((option) => optionValuesMatch(option.value, bodyValue) || optionValuesMatch(option.label, bodyValue));
    if (Number.isInteger(bodyOption?.finishInheritanceIndex)) {
      const orderedMatch = options.find((option) => option.finishInheritanceIndex === bodyOption.finishInheritanceIndex);
      if (orderedMatch) return orderedMatch;
    }
    const index = Number.isInteger(finishContext.bodyIndex) && finishContext.bodyIndex >= 0 ? finishContext.bodyIndex : 0;
    return options[Math.min(index, options.length - 1)] || null;
  }
  return options[0] || null;
}

function presentationFirstEffectiveOption(field = {}, compatibleOptions = [], finishContext = {}) {
  return presentationSelectedOption(field)
    || presentationInheritedFinishOption(field, compatibleOptions, finishContext)
    || (presentationIsInherited(field) ? null : (Array.isArray(compatibleOptions) ? compatibleOptions[0] : null))
    || null;
}

function presentationRole(field = {}) {
  return String(field.role || "").trim();
}

function presentationIsMetadata(field = {}) {
  return field.metadataOnly === true || presentationRole(field) === "metadata-only" || RUNTIME_PRESENTATION_METADATA_FIELDS.has(field.fieldKey);
}

function presentationIsDisabledHandoff(field = {}) {
  const role = presentationRole(field);
  return RUNTIME_PRESENTATION_DISABLED_HANDOFF_FIELDS.has(field.fieldKey)
    || role === "disabled"
    || role === "future-mapped"
    || (field.disabled === true && !presentationIsMetadata(field))
    || (field.futureMapped === true && !presentationIsMetadata(field));
}

function presentationIsHiddenDiagnostic(field = {}) {
  const role = presentationRole(field);
  return RUNTIME_PRESENTATION_HIDDEN_DIAGNOSTIC_FIELDS.has(field.fieldKey)
    || role === "entitlement-gated"
    || role === "diagnostic";
}

function presentationIsInherited(field = {}) {
  if (field.fieldKey === "indirectMatchDirect") return false;
  if (["cctCriIndirect", "controlTypeIndirect"].includes(field.fieldKey) && !field.inheritedValue) return false;
  return RUNTIME_PRESENTATION_INHERITED_FIELDS.has(field.fieldKey) || presentationRole(field) === "inherited-consequence";
}

function presentationPrimaryDecisionAtThisStep(field = {}, compatibleOptionCount, selectedOptionBlocked) {
  const selectedValue = String(field.selectedValue || "").trim();
  if (selectedOptionBlocked === true) return true;
  if (RUNTIME_PRESENTATION_OPTIC_VAR2_PICKER_FIELDS.has(field.fieldKey)) {
    return selectedValue.length > 0 || compatibleOptionCount > 0;
  }
  if (RUNTIME_PRESENTATION_CONDITIONAL_PRIMARY_FIELDS.has(field.fieldKey)) {
    return selectedValue.length > 0 || compatibleOptionCount > 1;
  }
  return RUNTIME_PRESENTATION_PRIMARY_DECISION_FIELDS.has(field.fieldKey);
}

function classifyRuntimePresentationField(field = {}, finishContext = {}) {
  const compatibleOptions = presentationCompatibleOptions(field);
  const compatibleOptionCount = compatibleOptions ? compatibleOptions.length : null;
  const selectedOption = presentationSelectedOption(field);
  const diagnosticUnmappedOption = diagnosticUnmappedOptionFromField(field);
  const selectedOptionBlocked = Boolean(field.selectedValue && (field.selectedValueStatus === "diagnostic_unmapped" || selectedOption?.blocked === true || selectedOption?.status === "blocked"));
  const hasSelectedValue = String(field.selectedValue || "").trim().length > 0;
  const acceptedDefaultSelected = field.defaultAcceptanceState === "accepted" || field.selectedByAcceptedDefault === true;
  const hasManualConstraint = hasSelectedValue && !acceptedDefaultSelected;
  const effectiveOption = presentationFirstEffectiveOption(field, compatibleOptions || [], finishContext);
  const primaryAtStep = presentationPrimaryDecisionAtThisStep(field, compatibleOptionCount, selectedOptionBlocked);
  const optionsComputable = compatibleOptionCount !== null;
  const safeAutoResolve = optionsComputable
    && compatibleOptionCount === 1
    && !hasSelectedValue
    && selectedOptionBlocked !== true
    && primaryAtStep !== true;
  let displayMode = "choice";
  let provenance = hasManualConstraint ? "manual" : acceptedDefaultSelected ? "accepted-default" : "available-choice";
  let primaryDecision = primaryAtStep;
  let effectiveValue = hasSelectedValue ? field.selectedValue : "";
  let effectiveLabel = hasSelectedValue ? field.selectedLabel : "";
  let overrideAvailable = false;
  let classificationReason = "real user decision or unresolved available choice";

  if (selectedOptionBlocked) {
    const selectedPolicyOption = presentationSelectedCodePolicyOption(field);
    displayMode = "warning-chip";
    provenance = hasManualConstraint ? "manual" : "diagnostic";
    primaryDecision = false;
    effectiveValue = "";
    effectiveLabel = "";
    overrideAvailable = true;
    classificationReason = diagnosticUnmappedOption?.blockedReason || selectedPolicyOption?.blockedReason || selectedOption?.blockedReason || field.unavailableReason || "selected value is incompatible but preserved as a blocked constraint, not selected truth";
  } else if (presentationIsHiddenDiagnostic(field)) {
    displayMode = "hidden-diagnostic";
    provenance = "diagnostic";
    primaryDecision = false;
    effectiveValue = field.selectedValue || effectiveOption?.value || "";
    effectiveLabel = field.selectedLabel || effectiveOption?.label || field.unavailableReason || "diagnostic only";
    overrideAvailable = false;
    classificationReason = "diagnostic/alias/internal field hidden from primary workflow";
  } else if (presentationIsDisabledHandoff(field)) {
    displayMode = "disabled-handoff";
    provenance = "disabled";
    primaryDecision = false;
    effectiveValue = field.selectedValue || "disabled";
    effectiveLabel = field.selectedLabel || field.unavailableReason || "disabled — future handoff";
    overrideAvailable = false;
    classificationReason = "disabled future handoff or future-mapped field";
  } else if (presentationIsMetadata(field)) {
    displayMode = "metadata-chip";
    provenance = "metadata";
    primaryDecision = false;
    effectiveValue = field.selectedValue || effectiveOption?.value || "";
    effectiveLabel = field.selectedLabel || effectiveOption?.label || field.unavailableReason || "metadata pending";
    overrideAvailable = false;
    classificationReason = "metadata descriptor, not a primary decision";
  } else if (field.manualInput === true && (field.status !== "blocked" || hasManualConstraint)) {
    displayMode = "manual-input";
    provenance = hasManualConstraint ? "manual" : "manual-input";
    primaryDecision = true;
    effectiveValue = hasManualConstraint ? field.selectedValue : "";
    effectiveLabel = hasManualConstraint ? field.selectedLabel || field.selectedValue : "";
    overrideAvailable = true;
    classificationReason = field.unavailableReason || "typed manual input; no dropdown catalogue or auto-selection is sourced";
  } else if (field.fieldKey === "controlTypeIndirect" && !hasSelectedValue && optionsComputable && compatibleOptionCount > 0) {
    displayMode = "choice";
    provenance = field.inheritedValue ? "inherited" : "available-choice";
    primaryDecision = true;
    effectiveValue = field.inheritedValue || "";
    effectiveLabel = field.inheritedLabel || field.inheritedValue || "";
    overrideAvailable = true;
    classificationReason = field.unavailableReason || "indirect control can match direct or be selected independently; compatible protocol options remain selectable";
  } else if (presentationIsInherited(field) && field.inheritedValue && !hasSelectedValue && !["finishCover", "finishEnd", "finishFlex"].includes(field.fieldKey)) {
    displayMode = "inherited-chip";
    provenance = "inherited";
    primaryDecision = false;
    effectiveValue = field.inheritedValue;
    effectiveLabel = field.inheritedLabel || field.inheritedValue;
    overrideAvailable = optionsComputable && compatibleOptionCount > 0;
    classificationReason = field.unavailableReason || "inherited consequence from direct/default selection";
  } else if (optionsComputable && compatibleOptionCount === 0 && !hasSelectedValue) {
    const blockedByLaneCapability = (Array.isArray(field.options) ? field.options : []).some((option) => (Array.isArray(option.blockedBy) ? option.blockedBy : [])
      .some((blocker) => ["directCapability", "indirectCapability"].includes(blocker.fieldKey)));
    const unsupportedLanePicker = ["targetLmPerM", "cctCri", "controlType", "indirectOpticVar1", "indirectOpticVar2", "opticIndirect", "indirectMatchDirect", "targetLmPerMIndirect", "cctCriIndirect", "controlTypeIndirect"].includes(field.fieldKey)
      && (blockedByLaneCapability || field.status === "blocked" || /lane|emission|direct|indirect|not required|not supported/i.test(String(field.unavailableReason || "")));
    displayMode = primaryAtStep && !unsupportedLanePicker ? "warning-chip" : "hidden-diagnostic";
    provenance = "diagnostic";
    primaryDecision = false;
    effectiveValue = "";
    effectiveLabel = field.unavailableReason || "no compatible options under current constraints";
    overrideAvailable = false;
    classificationReason = "no compatible DB-backed option is available; no dead dropdown or fake consequence is rendered";
  } else if (presentationIsInherited(field) && !hasSelectedValue) {
    const visibleInheritedFinishField = ["finishCover", "finishEnd", "finishFlex"].includes(field.fieldKey);
    const inheritedPreviewValue = field.inheritedValue || (visibleInheritedFinishField ? effectiveOption?.value || "" : "");
    const inheritedPreviewLabel = field.inheritedLabel || (visibleInheritedFinishField ? effectiveOption?.label || "" : "");
    displayMode = visibleInheritedFinishField ? "choice" : "inherited-chip";
    provenance = "inherited";
    primaryDecision = false;
    effectiveValue = inheritedPreviewValue;
    effectiveLabel = inheritedPreviewLabel || field.unavailableReason || "inherits from direct/default selection";
    if (visibleInheritedFinishField && !finishContext.bodyValue && !field.inheritedValue) {
      displayMode = "collapsed-override";
      effectiveValue = "";
      effectiveLabel = "";
      overrideAvailable = false;
      classificationReason = "donor finish inheritance is inactive until body/default finish is selected";
    } else {
      overrideAvailable = optionsComputable && compatibleOptionCount > 0;
      classificationReason = visibleInheritedFinishField
        ? "visible inherited finish control; selecting a value creates a manual override and clearing returns to inherited body/default cascade"
        : "inherited consequence from direct/default selection";
    }
  } else if (safeAutoResolve && (RUNTIME_PRESENTATION_AUTO_CHIP_FIELDS.has(field.fieldKey) || presentationRole(field) === "auto-consequence" || (presentationRole(field) === "manual-constraint" && !RUNTIME_PRESENTATION_MANUAL_ONLY_FIELDS.has(field.fieldKey)))) {
    displayMode = "auto-chip";
    provenance = "auto";
    primaryDecision = false;
    effectiveValue = effectiveOption?.value || "";
    effectiveLabel = effectiveOption?.label || "auto-defaulted consequence";
    overrideAvailable = true;
    classificationReason = "exactly one compatible DB-backed option; shown as provisional auto-default until accepted or manually changed";
  } else if (!primaryAtStep && (RUNTIME_PRESENTATION_AUTO_CHIP_FIELDS.has(field.fieldKey) || presentationRole(field) === "auto-consequence" || presentationIsInherited(field))) {
    displayMode = "collapsed-override";
    provenance = presentationIsInherited(field) ? "inherited" : "auto";
    primaryDecision = false;
    effectiveValue = hasSelectedValue ? field.selectedValue : "";
    effectiveLabel = hasSelectedValue ? field.selectedLabel : (optionsComputable ? "multiple compatible options — override available" : "compatible count not available");
    overrideAvailable = optionsComputable && compatibleOptionCount > 0;
    classificationReason = optionsComputable
      ? "not a primary decision in this slice; kept as collapsed override/details"
      : "compatible option count unavailable; no auto-resolution invented";
  } else {
    displayMode = "choice";
    provenance = hasManualConstraint ? "manual" : acceptedDefaultSelected ? "accepted-default" : "available-choice";
    primaryDecision = true;
    effectiveValue = hasSelectedValue ? field.selectedValue : "";
    effectiveLabel = hasSelectedValue ? field.selectedLabel : "";
    overrideAvailable = true;
  }

  if (!effectiveLabel && effectiveValue) effectiveLabel = labelFromWorkflowField(field, effectiveValue);

  const resolvedAcceptanceState = selectedOptionBlocked
    ? "unresolved"
    : hasManualConstraint
      ? "manually-set"
      : acceptedDefaultSelected
        ? "accepted"
        : (effectiveValue && (displayMode === "auto-chip" || displayMode === "inherited-chip" || provenance === "auto" || provenance === "inherited"))
          ? "auto-defaulted"
          : field.defaultAcceptanceState || "unresolved";
  const provisionalDefault = resolvedAcceptanceState === "auto-defaulted";

  const donorShapeDropdown = createDonorShapeDropdownSplit({
    ...field,
    selectedValue: field.selectedValue || effectiveValue || "",
  });

  return {
    ...field,
    runtimePresentationClassification: RUNTIME_PRESENTATION_CLASSIFICATION_NAME,
    presentationPolicyDebt: [...RUNTIME_PRESENTATION_POLICY_DEBT],
    displayMode,
    provenance,
    primaryDecision,
    primaryControl: primaryDecision === true && (displayMode === "choice" || displayMode === "manual-input"),
    effectiveValue,
    effectiveLabel,
    compatibleOptionCount,
    selectedOptionBlocked,
    selectedByManualConstraint: hasManualConstraint,
    selectedByAcceptedDefault: acceptedDefaultSelected,
    defaultAcceptanceState: resolvedAcceptanceState,
    provisionalDefault,
    overrideAvailable,
    classificationReason,
    compatibleOptionCountComputed: optionsComputable,
    dropdownOptions: donorShapeDropdown.dropdownOptions,
    incompatibleOptions: donorShapeDropdown.incompatibleOptions,
    incompatibleOptionCount: donorShapeDropdown.incompatibleOptionCount,
    compatibleDropdownOptionCount: donorShapeDropdown.compatibleDropdownOptionCount,
    selectedBlockedOptionVisible: donorShapeDropdown.selectedBlockedOptionVisible,
    writes: false,
    rawRowsExposed: false,
  };
}

function applyRuntimePresentationClassificationToWorkflow(workflowSections = []) {
  const finishContext = finishInheritanceContextFromWorkflow(workflowSections);
  return workflowSections.map((section) => ({
    ...section,
    runtimePresentationClassification: RUNTIME_PRESENTATION_CLASSIFICATION_NAME,
    fields: (Array.isArray(section.fields) ? section.fields : []).map((field) => classifyRuntimePresentationField(field, finishContext)),
    rawRowsExposed: false,
  }));
}

function createPresentationClassificationSummary(workflowSections = []) {
  const fields = workflowSections.flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
  const byMode = fields.reduce((acc, field) => {
    const mode = field.displayMode || "unknown";
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});
  const cannotSafelyClassify = fields
    .filter((field) => field.compatibleOptionCountComputed !== true && !["metadata-chip", "hidden-diagnostic", "disabled-handoff"].includes(field.displayMode))
    .map((field) => ({
      fieldKey: field.fieldKey,
      label: field.label || field.fieldKey,
      displayMode: field.displayMode || "unknown",
      reason: "compatibleOptionCount could not be computed from current payload; no auto-resolution invented",
      writes: false,
      rawRowsExposed: false,
    }));
  return {
    name: RUNTIME_PRESENTATION_CLASSIFICATION_NAME,
    policyDebt: [...RUNTIME_PRESENTATION_POLICY_DEBT],
    sourceTruth: "DB/reference-backed option payload remains source; classification is runtime presentation policy only",
    fieldCount: fields.length,
    primaryDecisionCount: fields.filter((field) => field.primaryDecision === true && field.displayMode === "choice").length,
    autoChipCount: byMode["auto-chip"] || 0,
    inheritedChipCount: byMode["inherited-chip"] || 0,
    metadataChipCount: byMode["metadata-chip"] || 0,
    collapsedOverrideCount: byMode["collapsed-override"] || 0,
    warningChipCount: byMode["warning-chip"] || 0,
    hiddenDiagnosticCount: byMode["hidden-diagnostic"] || 0,
    disabledHandoffCount: byMode["disabled-handoff"] || 0,
    byMode,
    cannotSafelyClassify,
    writes: false,
    rawRowsExposed: false,
  };
}

function presentationConsequenceFromField(field = {}) {
  if (!field.effectiveValue || field.displayMode === "choice" || field.displayMode === "warning-chip") return null;
  if (!["auto-chip", "inherited-chip", "metadata-chip", "collapsed-override"].includes(field.displayMode)) return null;
  return {
    fieldKey: field.fieldKey,
    label: field.label || field.fieldKey,
    value: field.effectiveValue,
    valueLabel: field.effectiveLabel || field.effectiveValue,
    kind: field.displayMode === "inherited-chip" ? "inherited-consequence" : field.displayMode === "metadata-chip" ? "source-status" : "auto-consequence",
    status: field.displayMode === "metadata-chip" ? "metadata-only" : field.provenance || field.displayMode,
    source: RUNTIME_PRESENTATION_CLASSIFICATION_NAME,
    reason: field.classificationReason || "runtime presentation consequence",
    mutable: field.overrideAvailable === true,
    writes: false,
    rawRowsExposed: false,
  };
}

function createPresentationAutoConsequences(workflowSections = []) {
  return workflowSections
    .flatMap((section) => Array.isArray(section.fields) ? section.fields : [])
    .map((field) => presentationConsequenceFromField(field))
    .filter(Boolean);
}

const DEFAULT_ACCEPTANCE_USER_DRIVEN_SECTIONS = Object.freeze(new Set(["system", "optics", "lightControl", "egressAccessories"]));
const DEFAULT_ACCEPTANCE_USER_DRIVEN_FIELDS = Object.freeze(new Set([
  "system",
  "optic",
  "opticSub",
  "opticIndirect",
  "diffuserVar1",
  "diffuserVar2",
  "directOpticVar1",
  "directOpticVar2",
  "indirectOpticVar1",
  "indirectOpticVar2",
  "degree",
  "accessories",
]));

function defaultAcceptanceExcludedForUserDrivenField(field = {}) {
  const sectionKey = field.canonicalSectionKey || field.sectionKey || "";
  return DEFAULT_ACCEPTANCE_USER_DRIVEN_FIELDS.has(field.fieldKey) || DEFAULT_ACCEPTANCE_USER_DRIVEN_SECTIONS.has(sectionKey);
}

function defaultAcceptanceRecordFromField(field = {}) {
  if (!field.fieldKey || !field.effectiveValue) return null;
  if (defaultAcceptanceExcludedForUserDrivenField(field)) return null;
  if (field.defaultAcceptanceState !== "auto-defaulted" && field.provisionalDefault !== true) return null;
  if (["metadata-chip", "hidden-diagnostic", "disabled-handoff", "warning-chip"].includes(field.displayMode)) return null;
  return {
    fieldKey: field.fieldKey,
    label: field.label || field.fieldKey,
    value: field.effectiveValue,
    valueLabel: field.effectiveLabel || field.effectiveValue,
    acceptanceState: "auto-defaulted",
    source: RUNTIME_PRESENTATION_CLASSIFICATION_NAME,
    reason: field.classificationReason || "current auto-default can be accepted by the user",
    writes: false,
    rawRowsExposed: false,
  };
}

function createDefaultAcceptanceSummary(workflowSections = []) {
  const eligibleDefaults = workflowSections
    .flatMap((section) => Array.isArray(section.fields) ? section.fields : [])
    .map((field) => defaultAcceptanceRecordFromField(field))
    .filter(Boolean);
  return {
    title: "Default acceptance",
    actionLabel: "Accept current defaults",
    eligibleCount: eligibleDefaults.length,
    eligibleDefaults,
    rows: eligibleDefaults.length
      ? eligibleDefaults.map((item) => [item.label, `${item.valueLabel} — accept required`])
      : [["defaults requiring acceptance", "none"]],
    readOnly: true,
    writes: false,
    rawRowsExposed: false,
  };
}

const SELECTION_TRUTH_SUMMARY_GROUPS = Object.freeze([
  Object.freeze({ groupKey: "project", label: "Project / source" }),
  Object.freeze({ groupKey: "systemOptic", label: "System & optic" }),
  Object.freeze({ groupKey: "environment", label: "Environment" }),
  Object.freeze({ groupKey: "lightControl", label: "Light & Control" }),
  Object.freeze({ groupKey: "wiringPower", label: "Wiring / power" }),
  Object.freeze({ groupKey: "mountingPenetrations", label: "Mounting & penetrations" }),
  Object.freeze({ groupKey: "finishes", label: "Finishes" }),
  Object.freeze({ groupKey: "egressAccessories", label: "Egress & accessories" }),
  Object.freeze({ groupKey: "specialParts", label: "Special Parts" }),
  Object.freeze({ groupKey: "runs", label: "Runs" }),
  Object.freeze({ groupKey: "blockers", label: "Blocked / incompatible" }),
  Object.freeze({ groupKey: "futureHandoffs", label: "Future handoffs" }),
]);

const SELECTION_TRUTH_FIELD_GROUPS = Object.freeze({
  tier: "systemOptic",
  system: "systemOptic",
  variantKey: "systemOptic",
  emission: "systemOptic",
  directCapability: "systemOptic",
  indirectCapability: "systemOptic",
  optic: "systemOptic",
  opticSub: "systemOptic",
  opticIndirect: "systemOptic",
  diffuserVar1: "systemOptic",
  diffuserVar2: "systemOptic",
  diffuserMaterial: "systemOptic",
  diffuserSpecCodePreview: "systemOptic",
  diffuserImageReadiness: "systemOptic",
  directOpticVar1: "systemOptic",
  directOpticVar2: "systemOptic",
  indirectOpticVar1: "systemOptic",
  indirectOpticVar2: "systemOptic",
  application: "environment",
  interiorExterior: "environment",
  ipRating: "environment",
  ikRating: "environment",
  electricalClass: "environment",
  ambient: "environment",
  targetLmPerM: "lightControl",
  cctCri: "lightControl",
  controlType: "lightControl",
  indirectMatchDirect: "lightControl",
  targetLmPerMIndirect: "lightControl",
  cctCriIndirect: "lightControl",
  controlTypeIndirect: "lightControl",
  driver: "lightControl",
  lexWeight: "lightControl",
  powerPenetration: "wiringPower",
  powerLocation: "wiringPower",
  flexLength: "wiringPower",
  wiringType: "wiringPower",
  penetrationNotes: "wiringPower",
  mountStyle: "mountingPenetrations",
  mountSelection: "mountingPenetrations",
  mountParticulars: "mountingPenetrations",
  mountNotes: "mountingPenetrations",
  bodyFinish: "finishes",
  finishCover: "finishes",
  finishEnd: "finishes",
  finishFlex: "finishes",
  inheritedFinishStatus: "finishes",
  emergency: "egressAccessories",
  egressLight: "egressAccessories",
  egressSound: "egressAccessories",
  sensor: "egressAccessories",
  accessories: "egressAccessories",
  specialParts: "specialParts",
  specialPartsEntitlement: "specialParts",
  specialPartsOptIn: "specialParts",
  userEntitlementStatus: "specialParts",
  runCount: "runs",
  runQty: "runs",
  runLength: "runs",
  runOverrideStatus: "runs",
  runPlacementStatus: "runs",
  runTableGeneration: "futureHandoffs",
  payloadGeneration: "futureHandoffs",
  engineVerify: "futureHandoffs",
  outputNavigation: "futureHandoffs",
  saveHydrate: "futureHandoffs",
  hubSpotPush: "futureHandoffs",
  hubSpotCrmWriteBack: "futureHandoffs",
  specBuildAuthority: "futureHandoffs",
  slugSpecGeneration: "futureHandoffs",
  iesGeneration: "futureHandoffs",
  payloadRunTableGeneration: "futureHandoffs",
  drawingGeneration: "futureHandoffs",
  controlledRecords: "futureHandoffs",
  rregApprovalCustody: "futureHandoffs",
});

const SELECTION_TRUTH_DISABLED_HANDOFFS = Object.freeze([
  Object.freeze({ fieldKey: "slugSpecGeneration", label: "Spec / slug generation", valueLabel: "disabled — future Spec Ready state required" }),
  Object.freeze({ fieldKey: "runTableGeneration", label: "RunTable generation", valueLabel: "disabled — RunTable execution later" }),
  Object.freeze({ fieldKey: "payloadGeneration", label: "Payload generation", valueLabel: "disabled — production payload handoff later" }),
  Object.freeze({ fieldKey: "iesGeneration", label: "IES generation", valueLabel: "disabled — IES Builder candidate handoff later" }),
  Object.freeze({ fieldKey: "payloadRunTableGeneration", label: "Payload / RunTable generation", valueLabel: "disabled — legacy combined handoff remains off" }),
  Object.freeze({ fieldKey: "drawingGeneration", label: "Drawing generation", valueLabel: "disabled — drawing generation handoff later" }),
  Object.freeze({ fieldKey: "labProof", label: "Lab Proof", valueLabel: "disabled — Lab proves later" }),
  Object.freeze({ fieldKey: "controlledRecords", label: "Controlled Records", valueLabel: "disabled — provenance records later" }),
  Object.freeze({ fieldKey: "rregApprovalCustody", label: "RREG approval / custody transfer", valueLabel: "disabled — RREG maps responsibility later" }),
  Object.freeze({ fieldKey: "hubSpotCrmWriteBack", label: "HubSpot / CRM write-back", valueLabel: "disabled — no hidden write-back" }),
]);

function selectionTruthGroupForField(fieldKey = "") {
  return SELECTION_TRUTH_FIELD_GROUPS[fieldKey] || "project";
}

function selectionTruthKindFor(item = {}, field = {}) {
  const kind = String(item.kind || "").trim();
  const role = String(item.role || field.role || "").trim();
  const status = String(item.status || "").trim();
  if (item.blocked === true || status === "blocked") return "blocked";
  if (item.defaultAcceptanceState === "accepted" || item.selectedByAcceptedDefault === true || item.provenance === "accepted-default") return "accepted-default";
  if (kind === "accepted-default" || role === "accepted-default" || status === "accepted-default") return "accepted-default";
  if (kind === "inherited-consequence" || role === "inherited-consequence" || status === "inherited") return "inherited-consequence";
  if (kind === "auto-consequence" || role === "auto-consequence" || status === "auto-consequence") return "auto-consequence";
  if (role === "metadata-only" || item.metadataOnly === true || status === "metadata-only") return "source-status";
  if (role === "disabled" || item.disabled === true) return "future-disabled";
  if (role === "future-mapped" || item.futureMapped === true || status === "future-mapped") return "missing";
  return "manual-constraint";
}

function createSelectionTruthItem({
  fieldKey = "unknown",
  label = "Selection",
  value = "",
  valueLabel = "none",
  truthKind = "missing",
  status = "unknown",
  source = "selector view model",
  mutable = true,
  writes = false,
  blockedBy = [],
  rawRowsExposed = false,
} = {}) {
  return {
    fieldKey,
    label,
    value,
    valueLabel: String(valueLabel || value || "none"),
    truthKind,
    status,
    source,
    mutable: mutable !== false,
    writes: writes === true ? false : false,
    blockedBy: Array.isArray(blockedBy) ? blockedBy.map((item) => ({ ...item })) : [],
    rawRowsExposed: rawRowsExposed === true ? false : false,
  };
}

function createSelectionTruthGroups() {
  return SELECTION_TRUTH_SUMMARY_GROUPS.map((group) => ({
    groupKey: group.groupKey,
    label: group.label,
    items: [],
  }));
}

function selectionTruthGroup(groups, groupKey) {
  return groups.find((group) => group.groupKey === groupKey) || groups[0];
}

function addSelectionTruthItem(groups, groupKey, item) {
  const group = selectionTruthGroup(groups, groupKey);
  const key = `${item.fieldKey}:${item.value}:${item.truthKind}:${item.status}`;
  if (group.items.some((existing) => `${existing.fieldKey}:${existing.value}:${existing.truthKind}:${existing.status}` === key)) return;
  group.items.push(item);
}

function flattenedWorkflowFields(workflowSections = []) {
  return workflowSections.flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
}

function createFieldLookup(fields = [], workflowSections = []) {
  const lookup = new Map();
  for (const field of [...flattenedWorkflowFields(workflowSections), ...fields]) {
    if (field?.fieldKey && !lookup.has(field.fieldKey)) lookup.set(field.fieldKey, field);
  }
  return lookup;
}

function createCanonicalWorkflowSections(workflowSections = []) {
  const fieldLocations = {};
  const duplicateFields = [];
  const seen = new Set();
  const sections = workflowSections.map((section) => {
    const sectionKey = section.sectionKey || "unknown";
    const canonicalFields = [];
    for (const field of Array.isArray(section.fields) ? section.fields : []) {
      const fieldKey = field.fieldKey || "unknown";
      if (seen.has(fieldKey)) {
        duplicateFields.push({
          fieldKey,
          label: field.label || fieldKey,
          duplicateSectionKey: sectionKey,
          canonicalSectionKey: fieldLocations[fieldKey]?.sectionKey || "unknown",
          primaryControl: false,
          writes: false,
          rawRowsExposed: false,
        });
        continue;
      }
      seen.add(fieldKey);
      const primaryControl = field.primaryDecision === true && field.displayMode === "choice";
      fieldLocations[fieldKey] = {
        sectionKey,
        sectionTitle: section.title || sectionKey,
        primaryControl,
        displayMode: field.displayMode || "choice",
        provenance: field.provenance || "manual",
        writes: false,
        rawRowsExposed: false,
      };
      const canonicalField = {
        ...field,
        canonicalSectionKey: sectionKey,
        canonicalControl: true,
        primaryControl: true,
        flatFieldFallback: false,
        writes: false,
        rawRowsExposed: false,
      };
      if (!primaryControl) canonicalField.primaryControl = false;
      canonicalFields.push(canonicalField);
    }
    return {
      ...section,
      workflowCanonical: true,
      primaryControlSurface: true,
      flatFieldFallback: false,
      fields: canonicalFields,
      canonicalFieldCount: canonicalFields.length,
      duplicateFieldCount: duplicateFields.filter((item) => item.duplicateSectionKey === sectionKey).length,
      rawRowsExposed: false,
    };
  });

  return {
    sections,
    workflowSectionsCanonical: sections.length > 0,
    flatFieldsPrimary: false,
    flatFieldsDiagnosticOnly: true,
    fieldLocations,
    fieldCount: Object.keys(fieldLocations).length,
    duplicateFields,
  };
}

function createSelectionTruthSummary({
  sourceReady = false,
  status = "unknown",
  fields = [],
  workflowSections = [],
  manualConstraints = [],
  autoConsequences = [],
  blockedItems = [],
  payload = {},
  candidateSummary = {},
} = {}) {
  const groups = createSelectionTruthGroups();
  const fieldLookup = createFieldLookup(fields, workflowSections);
  const sourceStatus = sourceReady ? "source ready" : "source unavailable";
  const blockerItems = [];

  addSelectionTruthItem(groups, "project", createSelectionTruthItem({
    fieldKey: "selectorSourceStatus",
    label: "Selector Reference source",
    value: sourceStatus,
    valueLabel: `${sourceStatus}; ${status || "unknown"}`,
    truthKind: "source-status",
    status: sourceReady ? "available" : "missing",
    source: "safe Selector Reference status",
    mutable: false,
    writes: false,
  }));
  addSelectionTruthItem(groups, "project", createSelectionTruthItem({
    fieldKey: "selectorPreviewBoundary",
    label: "Selector boundary",
    value: "read-only preview",
    valueLabel: "read-only preview — not spec, not proof, no writes",
    truthKind: "source-status",
    status: "read-only",
    source: "runtime Selector boundary",
    mutable: false,
    writes: false,
  }));

  for (const constraint of manualConstraints) {
    const field = fieldLookup.get(constraint.fieldKey) || {};
    const item = createSelectionTruthItem({
      fieldKey: constraint.fieldKey,
      label: constraint.label || field.label || constraint.fieldKey,
      value: constraint.value || "",
      valueLabel: constraint.valueLabel || constraint.value || "none",
      truthKind: constraint.blocked === true || constraint.status === "blocked" ? "blocked" : "manual-constraint",
      status: constraint.status || "manual constraint",
      source: constraint.source || field.sourceStatus || "manual Selector constraint",
      mutable: constraint.mutable !== false,
      writes: false,
      blockedBy: constraint.blockedBy || [],
      rawRowsExposed: false,
    });
    addSelectionTruthItem(groups, selectionTruthGroupForField(constraint.fieldKey), item);
    if (item.truthKind === "blocked") {
      blockerItems.push(item);
      addSelectionTruthItem(groups, "blockers", item);
    }
  }

  for (const consequence of autoConsequences) {
    const field = fieldLookup.get(consequence.fieldKey) || {};
    const truthKind = selectionTruthKindFor(consequence, field);
    const item = createSelectionTruthItem({
      fieldKey: consequence.fieldKey,
      label: consequence.label || field.label || consequence.fieldKey,
      value: consequence.value || "",
      valueLabel: consequence.valueLabel || consequence.value || "none",
      truthKind,
      status: consequence.status || truthKind,
      source: consequence.source || field.sourceStatus || "safe Selector Reference consequence",
      mutable: consequence.mutable !== false,
      writes: false,
      blockedBy: consequence.blockedBy || [],
      rawRowsExposed: false,
    });
    addSelectionTruthItem(groups, selectionTruthGroupForField(consequence.fieldKey), item);
  }

  for (const field of [...fieldLookup.values()]) {
    const selectedValue = field.selectedValue || "";
    if (selectedValue) {
      const selectedOption = presentationSelectedOption(field);
      const selectedBlocked = field.selectedOptionBlocked === true || selectedOption?.blocked === true || selectedOption?.status === "blocked";
      const truthKind = selectedBlocked ? "blocked" : selectionTruthKindFor(field, field);
      const item = createSelectionTruthItem({
        fieldKey: field.fieldKey,
        label: field.label || field.fieldKey,
        value: selectedValue,
        valueLabel: field.selectedLabel || selectedValue,
        truthKind,
        status: selectedBlocked ? "blocked" : field.status || truthKind,
        source: field.sourceStatus || "safe Selector Reference selected value",
        mutable: field.disabled !== true,
        writes: false,
        blockedBy: selectedBlocked ? selectedOption?.blockedBy || field.blockedBy || [] : field.blockedBy || [],
        rawRowsExposed: false,
      });
      addSelectionTruthItem(groups, selectionTruthGroupForField(field.fieldKey), item);
      if (item.truthKind === "blocked") {
        blockerItems.push(item);
        addSelectionTruthItem(groups, "blockers", item);
      }
    }

    if (!selectedValue && (field.futureMapped === true || field.disabled === true || field.status === "future-mapped")) {
      const truthKind = field.disabled === true || field.role === "disabled" ? "future-disabled" : "missing";
      const item = createSelectionTruthItem({
        fieldKey: field.fieldKey,
        label: field.label || field.fieldKey,
        value: truthKind,
        valueLabel: field.unavailableReason || (truthKind === "future-disabled" ? "disabled in this read-only slice" : "future mapped / missing from current source"),
        truthKind,
        status: field.status || truthKind,
        source: field.sourceStatus || "safe Selector Reference field map",
        mutable: false,
        writes: false,
        rawRowsExposed: false,
      });
      addSelectionTruthItem(groups, selectionTruthGroupForField(field.fieldKey), item);
    }
  }

  for (const blocked of blockedItems) {
    const field = fieldLookup.get(blocked.fieldKey) || {};
    const item = createSelectionTruthItem({
      fieldKey: blocked.fieldKey || "blocked",
      label: blocked.label || field.label || blocked.fieldKey || "Blocked selection",
      value: blocked.value || "blocked",
      valueLabel: blocked.valueLabel || blocked.reason || blocked.status || "blocked / incompatible",
      truthKind: "blocked",
      status: blocked.status || "blocked",
      source: blocked.source || field.sourceStatus || "safe Selector compatibility metadata",
      mutable: true,
      writes: false,
      blockedBy: blocked.blockedBy || [],
      rawRowsExposed: false,
    });
    blockerItems.push(item);
    addSelectionTruthItem(groups, "blockers", item);
  }

  const missingItems = groups.flatMap((group) => group.items.filter((item) => item.truthKind === "missing" || item.truthKind === "future-disabled"));
  for (const handoff of SELECTION_TRUTH_DISABLED_HANDOFFS) {
    const item = createSelectionTruthItem({
      fieldKey: handoff.fieldKey,
      label: handoff.label,
      value: "disabled",
      valueLabel: handoff.valueLabel,
      truthKind: "future-disabled",
      status: "disabled",
      source: "runtime Selector boundary",
      mutable: false,
      writes: false,
      rawRowsExposed: false,
    });
    addSelectionTruthItem(groups, "futureHandoffs", item);
  }

  return {
    readOnly: true,
    specGenerationEnabled: false,
    slugGenerationEnabled: false,
    iesGenerationEnabled: false,
    payloadGenerationEnabled: false,
    runTableGenerationEnabled: false,
    labProofAuthority: false,
    controlledRecordWriteEnabled: false,
    rregApprovalEnabled: false,
    hiddenWriteBackEnabled: false,
    rawRowsExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
    status: candidateSummary.state || payload.status || status || "default preview",
    groups: groups.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item })) })),
    blockers: blockerItems.map((item) => ({ ...item })),
    missing: missingItems.map((item) => ({ ...item })),
    disabledHandoffs: SELECTION_TRUTH_DISABLED_HANDOFFS.map((item) => ({ ...item, truthKind: "future-disabled", status: "disabled", writes: false, rawRowsExposed: false })),
  };
}

const DONOR_SHAPE_SELECTED_TILE_DEFINITIONS = Object.freeze([
  Object.freeze({ tileKey: "system", title: "System", fieldKeys: Object.freeze(["system"]) }),
  Object.freeze({ tileKey: "directOpticVar1", title: "Direct optic / diffuser var 1", fieldKeys: Object.freeze(["directOpticVar1"]) }),
  Object.freeze({ tileKey: "directOpticVar2", title: "Direct optic / diffuser var 2", fieldKeys: Object.freeze(["directOpticVar2"]) }),
  Object.freeze({ tileKey: "indirectOpticVar1", title: "Indirect optic / diffuser var 1", fieldKeys: Object.freeze(["indirectOpticVar1"]) }),
  Object.freeze({ tileKey: "indirectOpticVar2", title: "Indirect optic / diffuser var 2", fieldKeys: Object.freeze(["indirectOpticVar2"]) }),
]);

function donorShapeTileField(fieldLookup, fieldKeys = []) {
  const fields = fieldKeys.map((fieldKey) => fieldLookup.get(fieldKey)).filter(Boolean);
  return fields.find((field) => Boolean(field.selectedValue || field.selectedLabel))
    || fields.find((field) => Boolean((field.effectiveValue || field.effectiveLabel) && field.displayMode !== "hidden-diagnostic"))
    || fields.find((field) => field.displayMode === "choice" && field.provenance === "available-choice")
    || fields.find((field) => Boolean(field.effectiveValue || field.effectiveLabel))
    || fields[0]
    || null;
}

function createDonorShapeSelectedTiles({ fields = [], workflowSections = [] } = {}) {
  const fieldLookup = createFieldLookup(fields, workflowSections);
  return DONOR_SHAPE_SELECTED_TILE_DEFINITIONS.map((definition) => {
    const field = donorShapeTileField(fieldLookup, definition.fieldKeys);
    const selectedOption = field ? presentationSelectedOption(field) : null;
    const blocked = Boolean(field?.selectedValue && (field?.selectedOptionBlocked === true || selectedOption?.blocked === true || selectedOption?.status === "blocked"));
    const hiddenDiagnosticEmpty = field?.displayMode === "hidden-diagnostic" && !field?.selectedValue && !field?.effectiveValue;
    const selectedTruthValue = hiddenDiagnosticEmpty ? "" : (field?.selectedValue || field?.effectiveValue || "");
    const value = blocked || hiddenDiagnosticEmpty ? "" : selectedTruthValue;
    const valueLabel = blocked || hiddenDiagnosticEmpty ? "Not selected" : (field?.selectedLabel || field?.effectiveLabel || (selectedTruthValue ? selectedOption?.label : "") || "Not selected");
    const fieldKey = field?.fieldKey || definition.fieldKeys[0];
    return {
      tileKey: definition.tileKey,
      title: definition.title,
      fieldKey,
      value,
      valueLabel,
      status: blocked ? "blocked / incompatible" : value ? (field?.status || field?.displayMode || "selected") : "not selected",
      displayMode: field?.displayMode || "empty",
      provenance: field?.provenance || "safe-view-model",
      blocked,
      changeAvailable: field?.disabled === true || field?.futureMapped === true ? false : true,
      safeLabelOnly: true,
      imageRendered: false,
      writes: false,
      rawRowsExposed: false,
      reason: blocked
        ? selectedOption?.blockedReason || field?.classificationReason || field?.unavailableReason || "Selected value is incompatible but preserved."
        : field?.classificationReason || field?.unavailableReason || "Donor-shape selected tile uses safe Selector view-model labels only.",
    };
  });
}

const PRODUCT_SPINE_EMPTY_VALUE = "—";

const PRODUCT_SPINE_SECTION_DEFINITIONS = Object.freeze([
  Object.freeze({
    sectionKey: "system",
    title: "SYSTEM",
    rows: Object.freeze([
      Object.freeze({ rowKey: "profileSystem", label: "Profile / system", fields: Object.freeze(["system"]) }),
      Object.freeze({ rowKey: "opticDirect", label: "Optic Direct", fields: Object.freeze(["directOpticVar1", "directOpticVar2"]) }),
      Object.freeze({ rowKey: "opticIndirect", label: "Optic Indirect", fields: Object.freeze(["indirectOpticVar1"]), condition: "indirect-supported" }),
    ]),
  }),
  Object.freeze({
    sectionKey: "environment",
    title: "ENVIRONMENT",
    rows: Object.freeze([
      Object.freeze({ rowKey: "application", label: "Application", fields: Object.freeze(["application"]) }),
      Object.freeze({ rowKey: "interiorExterior", label: "Interior / exterior", fields: Object.freeze(["interiorExterior"]) }),
      Object.freeze({ rowKey: "ipIk", label: "IP/IK", fields: Object.freeze(["ipRating", "ikRating"]) }),
      Object.freeze({ rowKey: "ambient", label: "Ambient", fields: Object.freeze(["ambient"]) }),
      Object.freeze({ rowKey: "electricalClass", label: "Electrical class", fields: Object.freeze(["electricalClass"]) }),
    ]),
  }),
  Object.freeze({
    sectionKey: "lightControl",
    title: "LIGHT & CONTROL",
    rows: Object.freeze([
      Object.freeze({ rowKey: "targetLmPerM", label: "Target lm/m", fields: Object.freeze(["targetLmPerM", "targetLumensPerMetre"]) }),
      Object.freeze({ rowKey: "cctCri", label: "CCT/CRI", fields: Object.freeze(["cctCri"]) }),
      Object.freeze({ rowKey: "control", label: "Control", fields: Object.freeze(["controlType", "controlTypeIndirect"]) }),
      Object.freeze({ rowKey: "driver", label: "Driver", fields: Object.freeze(["driver"]) }),
      Object.freeze({ rowKey: "lexWeight", label: "Lex weight", fields: Object.freeze(["lexWeight", "lex_weight", "lex"]) }),
      Object.freeze({ rowKey: "wiringTopology", label: "Wiring topology", fields: Object.freeze(["wiringType"]) }),
      Object.freeze({ rowKey: "topologyConsequence", label: "Topology", fields: Object.freeze(["topologyConsequence"]) }),
      Object.freeze({ rowKey: "coresConsequence", label: "Cores", fields: Object.freeze(["coresConsequence"]) }),
      Object.freeze({ rowKey: "topologyNotes", label: "Notes", fields: Object.freeze(["topologyNotes"]) }),
    ]),
  }),
  Object.freeze({
    sectionKey: "mounting",
    title: "MOUNTING",
    rows: Object.freeze([
      Object.freeze({ rowKey: "mountStyle", label: "Mount style", fields: Object.freeze(["mountStyle"]) }),
      Object.freeze({ rowKey: "mountSelection", label: "Mount selection", fields: Object.freeze(["mountSelection"]) }),
      Object.freeze({ rowKey: "mountParticulars", label: "Mount particulars", fields: Object.freeze(["mountParticulars"]) }),
      Object.freeze({ rowKey: "mountNotes", label: "Mount notes", fields: Object.freeze(["mountNotes", "mountingNotes"]), condition: "value-present" }),
      Object.freeze({ rowKey: "powerPenetration", label: "Power penetration", fields: Object.freeze(["powerPenetration"]) }),
      Object.freeze({ rowKey: "powerLocation", label: "Power location", fields: Object.freeze(["powerLocation"]) }),
      Object.freeze({ rowKey: "flexLength", label: "Flex length", fields: Object.freeze(["flexLength"]) }),
    ]),
  }),
  Object.freeze({
    sectionKey: "finishes",
    title: "FINISHES",
    rows: Object.freeze([
      Object.freeze({ rowKey: "bodyFinish", label: "Body finish", fields: Object.freeze(["bodyFinish", "finishDefault"]) }),
      Object.freeze({ rowKey: "cover", label: "Cover", fields: Object.freeze(["finishCover"]) }),
      Object.freeze({ rowKey: "endPlates", label: "End plates", fields: Object.freeze(["finishEnd"]) }),
      Object.freeze({ rowKey: "flexColour", label: "Flex colour", fields: Object.freeze(["finishFlex"]) }),
    ]),
  }),
  Object.freeze({
    sectionKey: "egressAccessories",
    title: "EGRESS & ACCESSORIES",
    rows: Object.freeze([
      Object.freeze({ rowKey: "egressLight", label: "Egress light", fields: Object.freeze(["egressLight", "emergency"]) }),
      Object.freeze({ rowKey: "egressSound", label: "EWIS/sound", fields: Object.freeze(["egressSound"]) }),
      Object.freeze({ rowKey: "sensors", label: "Sensors", fields: Object.freeze(["sensor"]) }),
      Object.freeze({ rowKey: "accessories", label: "Accessories", fields: Object.freeze(["accessories"]) }),
    ]),
  }),
  Object.freeze({
    sectionKey: "runs",
    title: "RUNS & DISABLED OUTPUTS",
    rows: Object.freeze([
      Object.freeze({ rowKey: "runCount", label: "Run count", fields: Object.freeze(["runCount"]) }),
      Object.freeze({ rowKey: "runQty", label: "Run qty", fields: Object.freeze(["runQty"]) }),
      Object.freeze({ rowKey: "runLength", label: "Run length", fields: Object.freeze(["runLength"]) }),
      Object.freeze({ rowKey: "runPlacementStatus", label: "Run placement", fields: Object.freeze(["runPlacementStatus"]) }),
      Object.freeze({ rowKey: "runOverrideStatus", label: "Override status", fields: Object.freeze(["runOverrideStatus"]) }),
      Object.freeze({ rowKey: "runTableGeneration", label: "RunTable generation", fields: Object.freeze(["runTableGeneration", "payloadRunTableGeneration"]) }),
      Object.freeze({ rowKey: "payloadGeneration", label: "Payload generation", fields: Object.freeze(["payloadGeneration", "payloadRunTableGeneration"]) }),
      Object.freeze({ rowKey: "iesGeneration", label: "IES generation", fields: Object.freeze(["iesGeneration"]) }),
      Object.freeze({ rowKey: "drawingGeneration", label: "Drawing generation", fields: Object.freeze(["drawingGeneration"]) }),
      Object.freeze({ rowKey: "labProof", label: "Lab Proof authority", fields: Object.freeze(["labProof"]) }),
      Object.freeze({ rowKey: "controlledRecords", label: "Controlled Records writes", fields: Object.freeze(["controlledRecords"]) }),
      Object.freeze({ rowKey: "rregApprovalCustody", label: "RREG approval / custody", fields: Object.freeze(["rregApprovalCustody", "rreg"]) }),
      Object.freeze({ rowKey: "hubSpotCrmWriteBack", label: "HubSpot / CRM write-back", fields: Object.freeze(["hubSpotCrmWriteBack", "hubSpotPush"]) }),
    ]),
  }),
  Object.freeze({
    sectionKey: "specGateCandidateReadiness",
    title: "SPEC READY / CANDIDATE READINESS",
    statusOnly: true,
    rows: Object.freeze([
      Object.freeze({ rowKey: "readinessState", label: "Readiness state", statusValue: "spec-gate-readiness-state" }),
      Object.freeze({ rowKey: "specReady", label: "Spec-ready", statusValue: "spec-ready" }),
      Object.freeze({ rowKey: "missingRequirements", label: "Missing requirements", statusValue: "spec-missing-requirements" }),
      Object.freeze({ rowKey: "blockedIncompatibleSelections", label: "Blocked / incompatible selections", statusValue: "spec-blocked-incompatible" }),
      Object.freeze({ rowKey: "manualConstraints", label: "Manual constraints", statusValue: "spec-manual-constraints" }),
      Object.freeze({ rowKey: "autoConsequences", label: "Auto consequences", statusValue: "spec-auto-consequences" }),
      Object.freeze({ rowKey: "sourceReadiness", label: "Source readiness", statusValue: "source-readiness" }),
      Object.freeze({ rowKey: "slugSpecPreview", label: "Slug/spec preview", statusValue: "slug-spec-preview" }),
      Object.freeze({ rowKey: "disabledOutputHandoff", label: "Disabled output handoff", statusValue: "disabled-output-handoff" }),
    ]),
  }),
  Object.freeze({
    sectionKey: "footStatus",
    title: "FOOT / STATUS",
    statusOnly: true,
    rows: Object.freeze([
      Object.freeze({ rowKey: "candidateState", label: "candidate state", statusValue: "candidate-state" }),
      Object.freeze({ rowKey: "missingBlockingReasons", label: "missing/blocking reasons", statusValue: "missing-blocking" }),
      Object.freeze({ rowKey: "sourceReadiness", label: "source readiness", statusValue: "source-readiness" }),
      Object.freeze({ rowKey: "disabledState", label: "proof/generation/write disabled state", statusValue: "disabled-state" }),
    ]),
  }),
]);

function workflowFieldLookup(fields = [], workflowSections = []) {
  const lookup = new Map();
  for (const field of [...flattenedWorkflowFields(workflowSections), ...fields]) {
    if (field?.fieldKey && !lookup.has(field.fieldKey)) lookup.set(field.fieldKey, field);
  }
  return lookup;
}

function spineField(lookup, fieldKeys = []) {
  for (const fieldKey of fieldKeys) {
    const field = lookup.get(fieldKey);
    if (field) return field;
  }
  return null;
}

function spineFieldHasDisplayValue(field = {}) {
  if (!field) return false;
  if (field.selectedOptionBlocked === true || field.status === "blocked" || field.displayMode === "warning-chip") return false;
  if (field.selectedValue || field.selectedLabel) return true;
  if (field.futureMapped === true || field.disabled === true || field.status === "blocked" || field.displayMode === "warning-chip" || field.displayMode === "disabled-handoff") return false;
  if (field.provenance === "available-choice") return false;
  if (field.displayMode === "collapsed-override" && !field.selectedValue && !field.effectiveValue) return false;
  if (["auto-chip", "inherited-chip", "metadata-chip"].includes(field.displayMode)) return Boolean(field.effectiveValue || field.effectiveLabel);
  if (["auto", "inherited", "metadata"].includes(field.provenance)) return Boolean(field.effectiveValue || field.effectiveLabel);
  return false;
}

function spineFieldAcceptanceState(field = {}) {
  if (!field) return "unresolved";
  if (field.selectedOptionBlocked === true || field.status === "blocked" || field.displayMode === "warning-chip") return "unresolved";
  if (field.defaultAcceptanceState === "accepted" || field.selectedByAcceptedDefault === true || field.provenance === "accepted-default") return "accepted";
  if (field.selectedValue || field.selectedLabel) return "manually-set";
  if ((field.displayMode === "auto-chip" || field.displayMode === "inherited-chip" || field.provenance === "auto" || field.provenance === "inherited") && (field.effectiveValue || field.effectiveLabel)) return "auto-defaulted";
  return field.defaultAcceptanceState || "unresolved";
}

function spineFieldProvisionalValue(field = {}) {
  const state = spineFieldAcceptanceState(field);
  if (state !== "auto-defaulted") return null;
  return field.effectiveLabel || field.effectiveValue || null;
}

function spineFieldValue(field = {}) {
  if (!field) return null;
  if (field.selectedOptionBlocked === true || field.status === "blocked" || field.displayMode === "warning-chip") return null;
  if (field.manualInput === true && field.selectedValue) return field.selectedValue;
  if (field.selectedLabel || field.selectedValue) return field.selectedLabel || field.selectedValue;
  if (field.provenance === "available-choice") return null;
  if (field.displayMode === "collapsed-override" && !field.selectedValue && !field.effectiveValue) return null;
  if (field.displayMode === "warning-chip" && !field.selectedValue && !field.effectiveValue) return null;
  if (["auto-chip", "inherited-chip", "metadata-chip", "warning-chip"].includes(field.displayMode)) {
    return field.effectiveLabel || field.effectiveValue || null;
  }
  if (field.provenance === "auto" || field.provenance === "inherited" || field.provenance === "metadata" || field.provenance === "accepted-default") {
    return field.effectiveLabel || field.effectiveValue || null;
  }
  return null;
}

function spineFieldAcceptedValue(field = {}) {
  const acceptanceState = spineFieldAcceptanceState(field);
  if (acceptanceState !== "accepted" && acceptanceState !== "manually-set") return null;
  return field.selectedLabel || field.selectedValue || field.effectiveLabel || field.effectiveValue || null;
}

function spineFieldStatus(field = null) {
  if (!field) return "missing";
  if (field.selectedOptionBlocked === true || field.status === "blocked" || field.displayMode === "warning-chip") return "blocked";
  if (presentationIsMetadata(field) && (field.futureMapped === true || field.status === "future-mapped") && !spineFieldHasDisplayValue(field)) return "missing";
  const acceptanceState = spineFieldAcceptanceState(field);
  if (acceptanceState === "accepted") return "accepted-default";
  if (field.selectedValue) return "manual-constraint";
  if (field.displayMode === "auto-chip" || field.provenance === "auto") return "auto-consequence";
  if (field.displayMode === "inherited-chip" || field.provenance === "inherited") return "inherited-consequence";
  if (field.displayMode === "metadata-chip" || field.provenance === "metadata") return "metadata-only";
  if (field.futureMapped === true || field.status === "future-mapped") return "future-mapped";
  if (field.disabled === true || field.displayMode === "disabled-handoff") return "disabled";
  return "not-selected";
}

function spineFieldIndicator(field = null) {
  const status = spineFieldStatus(field);
  if (status === "manual-constraint") return "manual constraint";
  if (status === "accepted-default") return "accepted default";
  if (status === "auto-consequence") return "auto consequence";
  if (status === "inherited-consequence") return "inherited consequence";
  if (status === "blocked") return "blocked / preserved";
  if (status === "future-mapped") return "future mapped";
  if (status === "disabled") return "disabled";
  if (status === "metadata-only") return "metadata only";
  if (status === "missing") return "missing from current source";
  return "not selected";
}

function spineFieldReason(field = null) {
  if (!field) return "No mapped Selector Reference/options field is available yet; no value is faked.";
  if (presentationIsMetadata(field) && !spineFieldHasDisplayValue(field)) return "No source-backed metadata value is available yet; no value is faked.";
  return field.classificationReason
    || field.unavailableReason
    || field.blockedReason
    || field.sourceStatus
    || "Value is derived from the safe Selector Reference/options surface; no raw row is exposed.";
}

function spineSupportsIndirect(lookup) {
  const systemField = lookup.get("system");
  const selectedSystemOption = presentationSelectedOption(systemField || {});
  if (selectedSystemOption) return selectedSystemOption.systemSupportsIndirect === true;
  return false;
}

const SPEC_GATE_BASE_REQUIREMENTS = Object.freeze([
  Object.freeze({ key: "system", label: "System", fields: Object.freeze(["system"]), gateSection: "System" }),
  Object.freeze({ key: "directOptic", label: "Optic Direct", fields: Object.freeze(["directOpticVar1", "diffuserVar1", "optic"]), gateSection: "System" }),
  Object.freeze({ key: "ipRating", label: "IP rating", fields: Object.freeze(["ipRating"]), gateSection: "Environment" }),
  Object.freeze({ key: "ikRating", label: "IK rating", fields: Object.freeze(["ikRating"]), gateSection: "Environment" }),
  Object.freeze({ key: "electricalClass", label: "Electrical class", fields: Object.freeze(["electricalClass"]), gateSection: "Environment" }),
  Object.freeze({ key: "ambient", label: "Ambient", fields: Object.freeze(["ambient"]), gateSection: "Environment" }),
  Object.freeze({ key: "targetLmPerM", label: "Target lm/m", fields: Object.freeze(["targetLmPerM", "targetLumensPerMetre"]), gateSection: "Light & Control" }),
  Object.freeze({ key: "cctCri", label: "CCT/CRI", fields: Object.freeze(["cctCri"]), gateSection: "Light & Control" }),
  Object.freeze({ key: "controlType", label: "Control", fields: Object.freeze(["controlType"]), gateSection: "Light & Control" }),
]);

const SPEC_GATE_INDIRECT_REQUIREMENTS = Object.freeze([
  Object.freeze({ key: "indirectTargetLmPerM", label: "Indirect target lm/m", fields: Object.freeze(["targetLmPerMIndirect"]), gateSection: "Light & Control" }),
  Object.freeze({ key: "indirectCctCri", label: "Indirect CCT/CRI", fields: Object.freeze(["cctCriIndirect"]), gateSection: "Light & Control" }),
  Object.freeze({ key: "indirectControl", label: "Indirect control", fields: Object.freeze(["controlTypeIndirect", "indirectOpticVar1", "opticIndirect"]), gateSection: "Light & Control" }),
]);

const SPEC_GATE_DISABLED_HANDOFFS = Object.freeze([
  Object.freeze({ key: "specGeneration", label: "spec generation" }),
  Object.freeze({ key: "slugGeneration", label: "slug generation" }),
  Object.freeze({ key: "iesGeneration", label: "IES" }),
  Object.freeze({ key: "payloadGeneration", label: "payload" }),
  Object.freeze({ key: "runTableGeneration", label: "RunTable" }),
  Object.freeze({ key: "drawingGeneration", label: "drawing" }),
  Object.freeze({ key: "labProofAuthority", label: "Lab Proof" }),
  Object.freeze({ key: "controlledRecordsWrites", label: "Controlled Records" }),
  Object.freeze({ key: "rregApprovalCustodyTransfer", label: "RREG" }),
  Object.freeze({ key: "hubSpotCrmWriteBack", label: "HubSpot/CRM write-back" }),
]);

function summarizeReadinessItems(items = [], emptyLabel = PRODUCT_SPINE_EMPTY_VALUE) {
  const rows = (Array.isArray(items) ? items : []).map((item) => {
    const label = item.label || item.fieldKey || item.key || "selection";
    const value = item.valueLabel || item.displayValue || item.value || item.status || "selected";
    return [label, value];
  });
  return {
    rows,
    text: rows.length ? rows.map(([label, value]) => `${label}: ${value}`).join("; ") : emptyLabel,
  };
}

function summarizeReadinessBlockers(blockedItems = [], emptyLabel = PRODUCT_SPINE_EMPTY_VALUE) {
  const rows = (Array.isArray(blockedItems) ? blockedItems : []).map((item) => {
    const label = item.label || item.fieldKey || "selection";
    const value = item.valueLabel || item.value || "blocked";
    const reason = item.reason || item.blockedReason || "blocked or incompatible selection is preserved for review";
    return [label, `${value} — ${reason}`];
  });
  return {
    rows,
    text: rows.length ? rows.map(([label, value]) => `${label}: ${value}`).join("; ") : emptyLabel,
  };
}

function specGateRequirementStatus(definition = {}, lookup) {
  const field = spineField(lookup, definition.fields || []);
  const fieldStatus = spineFieldStatus(field);
  const acceptanceState = spineFieldAcceptanceState(field || {});
  const value = spineFieldAcceptedValue(field || {});
  const provisionalValue = spineFieldProvisionalValue(field || {});
  const blocked = fieldStatus === "blocked";
  const complete = Boolean(value) && !blocked && (acceptanceState === "accepted" || acceptanceState === "manually-set");
  const provisionalDefault = Boolean(!complete && provisionalValue && !blocked);
  return {
    key: definition.key,
    label: definition.label,
    gateSection: definition.gateSection,
    fieldKeys: [...(definition.fields || [])],
    value: value || null,
    displayValue: value || provisionalValue || PRODUCT_SPINE_EMPTY_VALUE,
    status: blocked ? "blocked" : (complete ? "complete" : provisionalDefault ? "auto-defaulted" : "missing"),
    complete,
    blocked,
    provisionalDefault,
    acceptanceState: complete ? acceptanceState : provisionalDefault ? "auto-defaulted" : acceptanceState,
    reason: blocked
      ? spineFieldReason(field)
      : (complete
        ? "Accepted default or manual selection satisfies the Spec Ready requirement."
        : provisionalDefault
          ? "Auto-default is visible but provisional; accept defaults or manually change it before readiness can count it."
          : "Required for Spec Ready; no value is faked."),
    rawRowsExposed: false,
    writes: false,
  };
}

function createSpecGateCandidateReadiness({ lookup, sourceReady = false, summary = {}, manualConstraints = [], autoConsequences = [], blockedItems = [] } = {}) {
  const requirements = [
    ...SPEC_GATE_BASE_REQUIREMENTS,
    ...(spineSupportsIndirect(lookup) ? SPEC_GATE_INDIRECT_REQUIREMENTS : []),
  ].map((requirement) => specGateRequirementStatus(requirement, lookup));
  const missingRequirements = requirements.filter((requirement) => !requirement.complete).map((requirement) => requirement.label);
  const provisionalRequirements = requirements.filter((requirement) => requirement.provisionalDefault === true).map((requirement) => requirement.label);
  const manualBlockedKeys = new Set((Array.isArray(manualConstraints) ? manualConstraints : [])
    .filter((constraint) => constraint.blocked === true)
    .map((constraint) => `${constraint.fieldKey || ""}:${constraint.value || ""}`));
  const selectedBlockedItems = (Array.isArray(blockedItems) ? blockedItems : []).filter((item) => {
    const key = `${item.fieldKey || ""}:${item.value || ""}`;
    return item.selected === true || item.manualConstraint === true || manualBlockedKeys.has(key);
  });
  const blockedSummary = summarizeReadinessBlockers(selectedBlockedItems);
  const manualSummary = summarizeReadinessItems(manualConstraints);
  const autoSummary = summarizeReadinessItems(autoConsequences);
  const blockedCount = selectedBlockedItems.length;
  const manualConstraintCount = Array.isArray(manualConstraints) ? manualConstraints.length : 0;
  const autoConsequenceCount = Array.isArray(autoConsequences) ? autoConsequences.length : 0;
  const specReady = sourceReady === true && missingRequirements.length === 0 && blockedCount === 0;
  const defaultPreview = manualConstraintCount === 0 && (summary.state === "default preview" || !summary.state);
  const readinessState = specReady
    ? "spec-ready read-only state"
    : blockedCount > 0
      ? "blocked/incompatible state — Spec Ready incomplete"
      : defaultPreview
        ? "default preview — not spec-ready"
        : "constrained candidate preview — Spec Ready incomplete";
  const slugSpecPreviewState = specReady
    ? "read-only preview label state only — slug/spec generation disabled"
    : "disabled — donor slug/spec preview appears only after Spec Ready is reached";
  const disabledHandoffRows = SPEC_GATE_DISABLED_HANDOFFS.map((handoff) => [handoff.label, "disabled"]);
  const disabledHandoff = Object.fromEntries(SPEC_GATE_DISABLED_HANDOFFS.map((handoff) => [handoff.key, false]));

  return {
    title: "Spec Ready / Candidate Readiness",
    readOnly: true,
    diagnosticOnly: true,
    previewOnly: true,
    specReady,
    specGateComplete: specReady,
    buildReady: false,
    readinessState,
    defaultPreview,
    candidatePreview: !specReady,
    constrainedSelectionState: manualConstraintCount > 0,
    blockedIncompatibleState: blockedCount > 0,
    missingRequirements,
    provisionalRequirements,
    missingRequirementRows: requirements.map((requirement) => [requirement.label, requirement.status]),
    requirementRows: requirements.map((requirement) => [requirement.label, requirement.displayValue]),
    requirements,
    blockedIncompatibleSelections: blockedSummary.rows,
    blockedIncompatibleSummary: blockedSummary.text,
    manualConstraints: manualSummary.rows,
    manualConstraintsSummary: manualSummary.text,
    autoConsequences: autoSummary.rows,
    autoConsequencesSummary: autoSummary.text,
    sourceReadinessSummary: sourceReady ? "source readable — safe Selector Reference/options surface only" : "source unavailable — Spec Ready fail-closed",
    slugSpecPreviewState,
    disabledHandoff,
    disabledHandoffRows,
    disabledHandoffSummary: disabledHandoffRows.map(([label, status]) => `${label} ${status}`).join("; "),
    boundaryCopy: [
      "Spec Ready / Candidate Readiness is read-only in this slice.",
      "Spec Ready requires System + Environment + Light & Control before the state is reached.",
      "Default preview and candidate preview are not spec-ready.",
      "Manual selections are constraints, not proof.",
      "Auto selections are consequences, not authority.",
      "Spec-ready does not mean Lab Proof or production proof.",
      "Slug/spec, IES, payload, RunTable, drawing, Controlled Records, RREG, and HubSpot/CRM outputs remain disabled.",
    ],
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    privatePathsExposed: false,
    writes: false,
  };
}

function createSpineStatusRow(definition = {}, { sourceReady = false, summary = {}, manualConstraints = [], autoConsequences = [], blockedItems = [], specGateReadiness = null } = {}) {
  const readiness = specGateReadiness || {};
  if (definition.statusValue === "spec-gate-readiness-state") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: readiness.readinessState || "default preview — not spec-ready",
      displayValue: readiness.readinessState || "default preview — not spec-ready",
      status: readiness.specReady ? "spec-ready-read-only" : (readiness.blockedIncompatibleState ? "blocked" : "candidate-preview"),
      indicator: readiness.specReady ? "spec-ready read-only" : "candidate readiness",
      reason: "Derived from Spec Ready requirements; no generation or proof is enabled.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "spec-ready") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: readiness.specReady === true,
      displayValue: readiness.specReady ? "read-only ready" : "disabled",
      status: readiness.specReady ? "spec-ready-read-only" : "disabled",
      indicator: readiness.specReady ? "Spec Ready requirements satisfied" : "not spec-ready",
      reason: readiness.specReady ? "System, Environment, and Light & Control are complete for a read-only readiness label." : "Default/candidate preview must not be treated as spec-ready.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "spec-missing-requirements") {
    const missing = Array.isArray(readiness.missingRequirements) ? readiness.missingRequirements : [];
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: missing,
      displayValue: missing.length ? missing.join(", ") : PRODUCT_SPINE_EMPTY_VALUE,
      status: missing.length ? "missing" : "clear",
      indicator: missing.length ? "missing Spec Ready requirement(s)" : "no missing Spec Ready requirements",
      reason: "Missing requirements are shown explicitly rather than fabricated.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "spec-blocked-incompatible") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: readiness.blockedIncompatibleSelections || [],
      displayValue: readiness.blockedIncompatibleSummary || PRODUCT_SPINE_EMPTY_VALUE,
      status: readiness.blockedIncompatibleState ? "blocked" : "clear",
      indicator: readiness.blockedIncompatibleState ? "blocked / preserved" : "no blocked selections",
      reason: "Blocked or incompatible selections stay visible in readiness blockers and are not silently cleared.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "spec-manual-constraints") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: readiness.manualConstraints || [],
      displayValue: readiness.manualConstraintsSummary || PRODUCT_SPINE_EMPTY_VALUE,
      status: readiness.constrainedSelectionState ? "manual-constraint" : "missing",
      indicator: readiness.constrainedSelectionState ? "manual constraints" : "no manual constraints",
      reason: "Manual selections are constraints, not proof or authority.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "spec-auto-consequences") {
    const hasConsequences = Array.isArray(readiness.autoConsequences) && readiness.autoConsequences.length > 0;
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: readiness.autoConsequences || [],
      displayValue: readiness.autoConsequencesSummary || PRODUCT_SPINE_EMPTY_VALUE,
      status: hasConsequences ? "auto-consequence" : "missing",
      indicator: hasConsequences ? "auto consequences" : "no auto consequences",
      reason: "Auto selections are consequences, not authority, and remain changeable later.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "slug-spec-preview") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: readiness.slugSpecPreviewState || "disabled",
      displayValue: readiness.slugSpecPreviewState || "disabled",
      status: "disabled",
      indicator: "slug/spec generation disabled",
      reason: "Donor supports slug display only after Spec Ready; this runtime slice does not generate or authorise a slug.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "disabled-output-handoff") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: readiness.disabledHandoff || {},
      displayValue: readiness.disabledHandoffSummary || "disabled",
      status: "disabled-safe",
      indicator: "all output handoffs disabled",
      reason: "Spec, slug, IES, payload, RunTable, drawing, Lab Proof, records, RREG, and CRM write-back remain disabled.",
      writes: false,
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "candidate-state") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: summary.state || "default preview",
      displayValue: summary.state || "default preview",
      status: "read-only",
      indicator: "candidate state",
      reason: "Read-only candidate state; not a production payload or proof claim.",
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "missing-blocking") {
    const count = (Array.isArray(blockedItems) ? blockedItems.length : 0) + (summary.blockedCount || 0);
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: count ? `${count} item(s)` : "none",
      displayValue: count ? `${count} item(s)` : "none",
      status: count ? "blocked" : "clear",
      indicator: count ? "blocked / missing" : "no blockers reported",
      reason: "Blocked or missing values stay visible; compatible selections are not silently cleared.",
      rawRowsExposed: false,
    };
  }
  if (definition.statusValue === "source-readiness") {
    return {
      rowKey: definition.rowKey,
      label: definition.label,
      value: sourceReady ? "ready" : "unavailable",
      displayValue: sourceReady ? "ready" : "unavailable",
      status: sourceReady ? "ready" : "missing",
      indicator: "source readiness",
      reason: "Derived from Selector Reference status, not from raw rows.",
      rawRowsExposed: false,
    };
  }
  return {
    rowKey: definition.rowKey,
    label: definition.label,
    value: "readOnly:true; writes:false; generation:false; labProofAuthority:false",
    displayValue: "readOnly true · writes false · generation false · Lab Proof false",
    status: "disabled-safe",
    indicator: "safety flags",
    reason: "All generation, proof, and write paths remain disabled in this slice.",
    rawRowsExposed: false,
  };
}

function createProductSpineRow(definition = {}, lookup, context = {}) {
  const fields = (definition.fields || []).map((key) => lookup.get(key)).filter(Boolean);
  const displayFields = fields.filter((field) => spineFieldHasDisplayValue(field));
  const statusFields = displayFields.length ? displayFields : fields;
  const displayValues = displayFields.map(spineFieldValue).filter(Boolean);
  const firstField = statusFields[0] || null;
  const statuses = statusFields.length ? statusFields.map(spineFieldStatus) : ["missing"];
  const status = statuses.includes("blocked")
    ? "blocked"
    : statuses.includes("manual-constraint")
      ? "manual-constraint"
      : statuses.includes("auto-consequence")
        ? "auto-consequence"
        : statuses.includes("inherited-consequence")
          ? "inherited-consequence"
          : statuses.includes("future-mapped")
            ? "future-mapped"
            : statuses.includes("disabled")
              ? "disabled"
              : fields.length === 0
                ? "missing"
                : displayValues.length
                  ? statuses[0]
                  : statusFields.some((field) => presentationIsMetadata(field))
                    ? "missing"
                    : "not-selected";
  return {
    rowKey: definition.rowKey,
    label: definition.label,
    fieldKeys: [...(definition.fields || [])],
    value: displayValues.length ? displayValues.join(" / ") : null,
    displayValue: displayValues.length ? displayValues.join(" / ") : PRODUCT_SPINE_EMPTY_VALUE,
    status,
    indicator: fields.length ? spineFieldIndicator(firstField) : "missing from current source",
    reason: fields.length ? fields.map(spineFieldReason).filter(Boolean)[0] : "No mapped Selector Reference/options field is available yet; no value is faked.",
    manualConstraint: statuses.includes("manual-constraint"),
    autoConsequence: statuses.includes("auto-consequence") || statuses.includes("inherited-consequence"),
    blocked: statuses.includes("blocked"),
    missing: fields.length === 0 || status === "future-mapped" || status === "missing",
    mutableLater: true,
    writes: false,
    rawRowsExposed: false,
  };
}

function shouldShowProductSpineRow(definition = {}, lookup) {
  if (definition.condition === "indirect-supported") return spineSupportsIndirect(lookup);
  if (definition.condition === "value-present") {
    return (definition.fields || []).some((key) => spineFieldHasDisplayValue(lookup.get(key)));
  }
  return true;
}

function topologySourceValue(lookup, fieldKeys = []) {
  const field = spineField(lookup, fieldKeys);
  return String(spineFieldValue(field || {}) || field?.selectedLabel || field?.selectedValue || "").trim();
}

function topologyMetadataField(fieldKey, label, value, reason, extra = {}) {
  return {
    fieldKey,
    label,
    role: "metadata-only",
    status: "metadata-only",
    sourceStatus: "selection-driven read-only consequence metadata",
    selectedValue: "",
    selectedLabel: "",
    effectiveValue: value,
    effectiveLabel: value,
    displayMode: "metadata-chip",
    provenance: "metadata",
    primaryDecision: false,
    primaryControl: false,
    metadataOnly: true,
    disabled: false,
    futureMapped: false,
    options: [{ value, label: value, status: "metadata-only", blocked: false, metadataOnly: true, writes: false, rawRowsExposed: false }],
    compatibleOptionCount: value ? 1 : 0,
    classificationReason: reason,
    unavailableReason: reason,
    donorDerived: true,
    safePreviewOnly: true,
    exactElectricalInternalsExposed: false,
    ...extra,
    writes: false,
    rawRowsExposed: false,
  };
}

function topologyControlFamily(protocol = "") {
  const key = String(protocol || "").toLowerCase().replace(/[^a-z0-9+]+/g, "");
  if (!key) return "";
  if (key.includes("dali2") || key === "dali" || key.includes("dt6") || key.includes("dt8") || key.includes("d4i")) return "dali";
  if (key.includes("dmx")) return "dmx";
  if (key.includes("wireless") || key.includes("dali+") || key.includes("bluetooth") || key.includes("casambi") || key.includes("zigbee")) return "wireless";
  if (key === "fixed" || key.includes("switch") || key.includes("non") || key.includes("dim")) return "fixed";
  return "unknown";
}

function donorControlCoreTokensForFamily(family = "", isIndirect = false) {
  if (family === "dali") return ["signal-a", "signal-b"];
  if (family === "dmx") return ["signal-a", "signal-b"];
  if (family === "wireless") return [];
  if (family === "fixed") return [isIndirect ? "switched-indirect" : "switched-direct"];
  return [];
}

function topologyElectricalClassRequiresEarth(electricalClass = "") {
  const key = String(electricalClass || "").toLowerCase();
  return !(key.includes("class ii") || key.includes("isolated"));
}

function topologySelectionIsNone(value = "") {
  const key = String(value || "").toLowerCase();
  return !key || key.includes("none") || key.includes("not required") || key.includes("dc mains");
}

function deriveDonorCoreConfigurationPreview(lookup) {
  const directControl = topologySourceValue(lookup, ["controlType"]);
  if (!directControl) {
    return {
      topology: "Select control protocol to derive safe core preview",
      cores: "Core preview pending",
      notes: "Core configuration remains fail-closed until a control protocol is selected; not proof, generation, payload, RunTable, IES, or Board Data mutation.",
      coreCount: null,
      familyDirect: "",
      familyIndirect: "",
    };
  }

  const explicitIndirectControl = topologySourceValue(lookup, ["controlTypeIndirect"]);
  const matchDirect = topologySourceValue(lookup, ["indirectMatchDirect"]) || "match-direct";
  const indirectControl = explicitIndirectControl || (matchDirect ? directControl : "");
  const indirectSelected = Boolean(topologySourceValue(lookup, ["indirectOpticVar1", "opticIndirect"]));
  const hasIndirect = indirectSelected && Boolean(indirectControl);
  const electricalClass = topologySourceValue(lookup, ["electricalClass"]);
  const emergency = topologySourceValue(lookup, ["egressLight", "emergency"]);
  const familyDirect = topologyControlFamily(directControl);
  const familyIndirect = hasIndirect ? topologyControlFamily(indirectControl) : "";
  const directOnlyFixed = familyDirect === "fixed" && !hasIndirect;
  const coreTokens = directOnlyFixed ? ["switched-active", "neutral"] : ["active", "neutral"];
  const notes = [];

  if (directOnlyFixed) notes.push("Fixed direct-only uses a switched-active safe preview.");
  if (topologyElectricalClassRequiresEarth(electricalClass)) {
    coreTokens.push("earth");
    if (electricalClass) notes.push("Earth included by donor electrical-class consequence.");
  } else {
    notes.push("Earth omitted by donor Class II/isolated consequence.");
  }

  const pushControlCores = (family, isIndirect) => {
    if (family === "fixed" && directOnlyFixed) return;
    for (const token of donorControlCoreTokensForFamily(family, isIndirect)) {
      if (!coreTokens.includes(token)) coreTokens.push(token);
    }
    if (family === "dali") notes.push(`DALI-family control signal included${isIndirect ? " for indirect" : ""}.`);
    if (family === "dmx") notes.push(`DMX-family control signal included${isIndirect ? " for indirect" : ""}.`);
    if (family === "wireless") notes.push(`Wireless control${isIndirect ? " for indirect" : ""}: no added control cores.`);
    if (family === "fixed" && hasIndirect) notes.push(`${isIndirect ? "Indirect" : "Direct"} switched-active control included.`);
  };

  pushControlCores(familyDirect, false);
  if (hasIndirect) pushControlCores(familyIndirect, true);

  if (!topologySelectionIsNone(emergency)) {
    coreTokens.push("unswitched-emergency");
    notes.push("Emergency/egress selection adds an unswitched active consequence.");
  }

  const splitDirectIndirect = hasIndirect && familyIndirect && familyDirect !== familyIndirect;
  const topology = splitDirectIndirect
    ? "Split direct/indirect control topology"
    : familyDirect === "dali"
      ? "DALI control bus topology"
      : familyDirect === "dmx"
        ? "DMX signal-pair topology"
        : familyDirect === "wireless"
          ? "Wireless control topology"
          : familyDirect === "fixed"
            ? (hasIndirect ? "Fixed direct/indirect switched topology" : "Fixed direct-only switched topology")
            : "Source-backed topology pending";

  return {
    topology,
    cores: `${coreTokens.length}-core safe preview`,
    notes: `${notes.join(" ")} Read-only donor-derived consequence metadata; not proof, generation, payload, RunTable, IES, or Board Data mutation. Exact electrical internals are not exposed.`,
    coreCount: coreTokens.length,
    familyDirect,
    familyIndirect,
    hasIndirect,
    emergencyApplied: !topologySelectionIsNone(emergency),
    exactCoreTokensExposed: false,
  };
}

function deriveTopologyConsequenceFields(lookup) {
  const preview = deriveDonorCoreConfigurationPreview(lookup);
  const reason = "Derived from donor Selector wiring-topology resolver semantics using visible control, indirect, electrical-class, and emergency selections only; no raw source rows or exact electrical internals are exposed.";
  return [
    topologyMetadataField("topologyConsequence", "Topology", preview.topology, reason, preview),
    topologyMetadataField("coresConsequence", "Cores", preview.cores, reason, preview),
    topologyMetadataField("topologyNotes", "Notes", preview.notes, preview.notes, preview),
  ];
}

function createProductSpine({ fields = [], workflowSections = [], sourceReady = false, summary = {}, manualConstraints = [], autoConsequences = [], blockedItems = [] } = {}) {
  const lookup = workflowFieldLookup(fields, workflowSections);
  for (const topologyField of deriveTopologyConsequenceFields(lookup)) lookup.set(topologyField.fieldKey, topologyField);
  const specGateReadiness = createSpecGateCandidateReadiness({ lookup, sourceReady, summary, manualConstraints, autoConsequences, blockedItems });
  const sections = PRODUCT_SPINE_SECTION_DEFINITIONS.map((section) => ({
    sectionKey: section.sectionKey,
    title: section.title,
    rows: (section.rows || [])
      .filter((row) => section.statusOnly || shouldShowProductSpineRow(row, lookup))
      .map((row) => section.statusOnly
        ? createSpineStatusRow(row, { sourceReady, summary, manualConstraints, autoConsequences, blockedItems, specGateReadiness })
        : createProductSpineRow(row, lookup, { sourceReady, summary, manualConstraints, autoConsequences, blockedItems })),
    readOnly: true,
    writes: false,
    rawRowsExposed: false,
  }));
  return {
    title: "Selector checklist spine",
    status: sourceReady ? "source-backed-preview" : "source-unavailable-preview",
    sections,
    order: sections.map((section) => section.title),
    emptyValue: PRODUCT_SPINE_EMPTY_VALUE,
    source: "safe Selector Reference/options surface",
    readOnly: true,
    writes: false,
    generation: false,
    labProofAuthority: false,
    rawRowsExposed: false,
    specGateCandidateReadiness: specGateReadiness,
  };
}

function payloadFieldValue(lookup, fieldKeys = []) {
  const field = spineField(lookup, fieldKeys);
  const value = spineFieldValue(field || {});
  return value || null;
}

function cctCriProjectionDisplayFromToken(cctToken = "") {
  const safeToken = String(cctToken || "").trim();
  const tunable = safeToken.match(/^TW_(\d{4}K)_(\d{4}K)$/i);
  return tunable ? `TW ${tunable[1]}–${tunable[2]}` : safeToken;
}

function cctCriProjectionFromSelectedOption(field = {}) {
  const selectedOption = presentationSelectedOption(field) || {};
  const token = String(selectedOption.cctCriToken || selectedOption.value || field.selectedValue || field.effectiveValue || "").trim();
  const pair = token.match(/^cct_cri:([^|]+)\|([^|]+)$/i);
  if (!pair) return null;
  const cctToken = selectedOption.cctToken || pair[1];
  const criToken = selectedOption.criToken || pair[2];
  return {
    cctCriToken: token,
    cctToken,
    criToken,
    cctDisplay: selectedOption.cctDisplay || cctCriProjectionDisplayFromToken(cctToken),
    criDisplay: selectedOption.criDisplay || criToken,
    projectionOnly: true,
    authorityFieldKey: "cctCri",
  };
}

function cctCriProjectionFromField(field = {}) {
  return cctCriProjectionFromSelectedOption(field);
}

function payloadProjectSnapshot(project = {}) {
  const currentProject = project.currentProject || {};
  return {
    id: project.metadata?.projectId || currentProject.projectId || null,
    title: project.metadata?.title || currentProject.title || null,
    client: currentProject.client || null,
    site: currentProject.site || null,
    source: project.metadata?.source || project.selection?.source || null,
  };
}

function payloadIdentitySnapshot(identity = {}, authority = {}) {
  return {
    name: identity.currentUser?.name || null,
    email: identity.currentUser?.email || null,
    classification: identity.classification || null,
    identityState: identity.identityState || null,
    authorityStatus: authority.status || null,
    authoritySource: authority.source || null,
  };
}

function createPayloadPreviewSkeleton({ fields = [], workflowSections = [], summary = {}, snapshots = {}, sourceReady = false, manualConstraints = [], autoConsequences = [], blockedItems = [], sourceReadiness = null, referenceOptionSourceCoverage = null } = {}) {
  const lookup = workflowFieldLookup(fields, workflowSections);
  const specGateCandidateReadiness = createSpecGateCandidateReadiness({ lookup, sourceReady, summary, manualConstraints, autoConsequences, blockedItems });
  const safeSourceReadiness = sourceReadiness || {
    title: "Source Readiness / Safe Snapshot State",
    state: sourceReady ? "source-backed-safe-preview" : "fail-closed-source-warning",
    completeEnoughForPreview: sourceReady === true,
    safeForPreview: sourceReady === true,
    readOnlyProductReference: sourceReady === true,
    failClosed: sourceReady !== true,
    safeRedaction: {
      rawRowsExposed: false,
      rawHeadersExposed: false,
      rawUsersExposed: false,
      credentialsExposed: false,
      providerIdsExposed: false,
      privatePathsExposed: false,
    },
  };
  const safeCoverage = referenceOptionSourceCoverage || safeSourceReadiness.referenceOptionSourceCoverage || {};
  const cctCriProjection = cctCriProjectionFromField(lookup.get("cctCri") || {});
  return {
    previewOnly: true,
    productionPayload: false,
    status: summary.state || "default preview",
    source: "safe Selector Reference/options surface",
    sourceReady,
    sourceReadiness: safeSourceReadiness,
    safeSnapshotState: safeSourceReadiness,
    referenceOptionSourceCoverage: safeCoverage,
    futureMappedFieldExplanation: safeSourceReadiness.futureMappedFieldExplanation || safeCoverage.futureMappedExplanation || "Future-mapped fields are visible and not faked.",
    project: payloadProjectSnapshot(snapshots.project || {}),
    identity: payloadIdentitySnapshot(snapshots.identity || {}, snapshots.authority || {}),
    system: {
      system: payloadFieldValue(lookup, ["system"]),
      profile: payloadFieldValue(lookup, ["system"]),
      tier: payloadFieldValue(lookup, ["tier"]),
    },
    profile: payloadFieldValue(lookup, ["system"]),
    tier: payloadFieldValue(lookup, ["tier"]),
    optics: {
      direct: {
        opticVar1: payloadFieldValue(lookup, ["directOpticVar1"]),
        opticVar2: payloadFieldValue(lookup, ["directOpticVar2"]),
      },
      indirect: {
        opticVar1: payloadFieldValue(lookup, ["indirectOpticVar1"]),
        opticVar2: null,
      },
    },
    environment: {
      application: payloadFieldValue(lookup, ["application"]),
      interiorExterior: payloadFieldValue(lookup, ["interiorExterior"]),
      ip: payloadFieldValue(lookup, ["ipRating"]),
      ik: payloadFieldValue(lookup, ["ikRating"]),
      ambient: payloadFieldValue(lookup, ["ambient"]),
      electricalClass: payloadFieldValue(lookup, ["electricalClass"]),
    },
    lightControl: {
      targetLmPerM: payloadFieldValue(lookup, ["targetLmPerM", "targetLumensPerMetre"]),
      cctCri: cctCriProjection?.cctCriToken || null,
      cctCriProjection,
      controlType: payloadFieldValue(lookup, ["controlType"]),
      indirectMatchDirect: payloadFieldValue(lookup, ["indirectMatchDirect"]),
      targetLmPerMIndirect: payloadFieldValue(lookup, ["targetLmPerMIndirect"]),
      cctCriIndirect: payloadFieldValue(lookup, ["cctCriIndirect"]),
      controlTypeIndirect: payloadFieldValue(lookup, ["controlTypeIndirect"]),
      driver: payloadFieldValue(lookup, ["driver"]),
      wiringTopology: payloadFieldValue(lookup, ["wiringType"]),
      lexWeight: payloadFieldValue(lookup, ["lexWeight", "lex_weight", "lex"]),
    },
    mounting: {
      mountStyle: payloadFieldValue(lookup, ["mountStyle"]),
      mountSelection: payloadFieldValue(lookup, ["mountSelection"]),
      mountParticulars: payloadFieldValue(lookup, ["mountParticulars"]),
      mountNotes: payloadFieldValue(lookup, ["mountNotes", "mountingNotes"]),
      powerPenetration: payloadFieldValue(lookup, ["powerPenetration"]),
      powerLocation: payloadFieldValue(lookup, ["powerLocation"]),
      flexLength: payloadFieldValue(lookup, ["flexLength"]),
    },
    finishes: {
      bodyFinish: payloadFieldValue(lookup, ["bodyFinish", "finishDefault"]),
      cover: payloadFieldValue(lookup, ["finishCover"]),
      endPlates: payloadFieldValue(lookup, ["finishEnd"]),
      flexColour: payloadFieldValue(lookup, ["finishFlex"]),
    },
    egress: {
      light: payloadFieldValue(lookup, ["egressLight", "emergency"]),
      sound: payloadFieldValue(lookup, ["egressSound"]),
    },
    sensorsAccessories: {
      sensors: payloadFieldValue(lookup, ["sensor"]),
      accessories: payloadFieldValue(lookup, ["accessories"]),
    },
    runs: {
      runCount: payloadFieldValue(lookup, ["runCount"]),
      qty: payloadFieldValue(lookup, ["runQty"]),
      lengthMm: payloadFieldValue(lookup, ["runLength"]),
      placementStatus: payloadFieldValue(lookup, ["runPlacementStatus"]),
      overrideStatus: payloadFieldValue(lookup, ["runOverrideStatus"]),
      rows: [],
    },
    disabledOutputs: {
      specGeneration: false,
      slugGeneration: false,
      runTableGeneration: false,
      payloadGeneration: false,
      iesGeneration: false,
      drawingGeneration: false,
      labProofAuthority: false,
      controlledRecordsWrites: false,
      rregApprovalCustodyTransfer: false,
      hubSpotCrmWriteBack: false,
      boardDataMutation: false,
    },
    specGateCandidateReadiness,
    safetyFlags: {
      readOnly: true,
      writes: false,
      generation: false,
      specGeneration: false,
      slugGeneration: false,
      runTableGeneration: false,
      payloadGeneration: false,
      iesGeneration: false,
      drawingGeneration: false,
      labProofAuthority: false,
      controlledRecordsWrites: false,
      rregApprovalCustodyTransfer: false,
      hubSpotCrmWriteBack: false,
      boardDataMutation: false,
      rawRowsExposed: false,
      rawHeadersExposed: false,
      rawUsersExposed: false,
      credentialsExposed: false,
      privatePathsExposed: false,
    },
  };
}

const SELECTED_ENGINE_RESULT_REQUIRED_FIELDS = Object.freeze([
  "result state label",
  "selected result availability",
  "engine verified flag",
  "stale result flag placeholder",
  "selected profile/tier placeholder",
  "run identity placeholder",
  "run length placeholder",
  "segment summary placeholder",
  "board count placeholder",
  "board family placeholder",
  "zone count placeholder",
  "zone plan placeholder",
  "mechanical summary placeholder",
  "clip/suspension summary placeholder",
  "gear tray summary placeholder",
  "sanitised warnings placeholder",
]);

const SELECTED_ENGINE_RESULT_BOUNDARY_COPY = Object.freeze([
  "Only a summary-level selected-result projection may be available in this slice.",
  "Selector shows an Estimated preview until a safe read-only Engine/RunTable summary source exists.",
  "Selector does not fire the engine, generate RunTable output, persist a result, or detect stale results here.",
  "A future selected engine result must be one accepted successful result, normalised per run and locked to one selected subset/family.",
  "Weighted alternatives, raw engine debug, and raw selected payload are not normal-user final outputs.",
  "Engine-verified result display is not Lab Proof. Lab Proof proves later.",
  "No IES, payload, drawings, Controlled Records, RREG approval/custody, CRM write-back, Board Data mutation, or hidden write-back is created here.",
]);

function createSelectedEngineResultHandoffScaffold(selectedResultProjection = buildSelectedResultProjectionContract(), authorityGuardSummary = null, safeSelectedResultSourceObjectSummary = null) {
  const projection = selectedResultProjection || buildSelectedResultProjectionContract();
  const guard = authorityGuardSummary || {};
  const projectionSafetyFlags = projection.safetyFlags || {};
  const unavailable = "unavailable — future read-only Engine/RunTable result source required";
  const fieldRows = SELECTED_ENGINE_RESULT_REQUIRED_FIELDS.map((field) => [field, unavailable]);
  const projectionFieldRows = Object.keys(projection.perRunDisplayRowShape || {}).map((field) => [field, unavailable]);
  const safetyFlags = {
    ...projectionSafetyFlags,
    engineExecutionEnabled: projectionSafetyFlags.engineExecutionEnabled === true,
    engineVerificationEnabled: projectionSafetyFlags.engineVerificationEnabled === true,
    selectedResultIngestionEnabled: projectionSafetyFlags.selectedResultIngestionEnabled === true,
    selectedResultPersistenceEnabled: projectionSafetyFlags.selectedResultPersistenceEnabled === true,
    staleResultDetectionEnabled: projectionSafetyFlags.staleResultComparisonEnabled === true,
    staleResultComparisonEnabled: projectionSafetyFlags.staleResultComparisonEnabled === true,
    runTableGenerationEnabled: projectionSafetyFlags.runTableGenerationEnabled === true,
    payloadGenerationEnabled: projectionSafetyFlags.payloadGenerationEnabled === true,
    iesGenerationEnabled: projectionSafetyFlags.iesGenerationEnabled === true,
    drawingGenerationEnabled: projectionSafetyFlags.drawingGenerationEnabled === true,
    labProofAuthority: projectionSafetyFlags.labProofAuthority === true,
    controlledRecordsWriteEnabled: projectionSafetyFlags.controlledRecordsWriteEnabled === true,
    rregApprovalEnabled: projectionSafetyFlags.rregApprovalEnabled === true,
    rregCustodyTransferEnabled: projectionSafetyFlags.rregCustodyTransferEnabled === true,
    hubSpotCrmWriteBackEnabled: projectionSafetyFlags.hubSpotCrmWriteBackEnabled === true,
    boardDataMutationEnabled: projectionSafetyFlags.boardDataMutationEnabled === true,
    hiddenWriteBackEnabled: projectionSafetyFlags.hiddenWriteBackEnabled === true,
    rawSelectedPayloadExposed: projectionSafetyFlags.rawSelectedPayloadExposed === true,
    rawEngineDebugPayloadExposed: projectionSafetyFlags.rawEngineDebugPayloadExposed === true,
    rawCandidateAlternativesExposedAsFinalOutputs: projectionSafetyFlags.rawCandidateAlternativesExposedAsFinalOutputs === true,
    rawRowsExposed: projectionSafetyFlags.rawBoardDataRowsExposed === true,
    rawHeadersExposed: projectionSafetyFlags.rawBoardDataHeadersExposed === true,
    rawUsersExposed: projectionSafetyFlags.rawUsersExposed === true,
    rawLabEvidenceExposed: projectionSafetyFlags.rawLabEvidenceExposed === true,
    rawIesExposed: projectionSafetyFlags.rawIesExposed === true,
    rawPdfsOrArtefactsExposed: projectionSafetyFlags.rawPdfsExposed === true || projectionSafetyFlags.rawArtefactsExposed === true,
    credentialsExposed: projectionSafetyFlags.credentialsExposed === true,
    privatePathsExposed: projectionSafetyFlags.privatePathsExposed === true,
  };
  return {
    title: "Selected engine result handoff",
    readOnly: projection.readOnly === true,
    displayOnly: projection.displayOnly === true,
    scaffoldOnly: true,
    projectionConsumed: true,
    selectedResultProjection: {
      source: projection.source,
      sourceAvailable: projection.sourceAvailable === true,
      selectedResultAvailable: projection.selectedResultAvailable === true,
      sourceState: projection.sourceState || "no_source",
      state: projection.state || "no_selected_result",
      resultState: projection.resultState || projection.state || "no_selected_result",
      resultStateLabel: projection.resultStateLabel || "Estimated preview",
      accepted: projection.accepted === true,
      acceptedSelectedResultAvailable: projection.acceptedSelectedResultAvailable === true,
      engineVerified: projection.engineVerified === true,
      stale: projection.stale === true,
      summaryProjectionOnly: projection.summaryProjectionOnly === true,
      selectedFamilySubsetLock: projection.selectedFamilySubsetLock || null,
      perRunLookupNormalised: projection.perRunLookupNormalised === true,
      oneSuccessfulAcceptedResult: projection.oneSuccessfulAcceptedResult === true,
      selectedResultCandidateCount: projection.selectedResultCandidateCount || projection.acceptedCandidateCount || null,
      sourceInputFingerprint: projection.sourceInputFingerprint || projection.sourceInputFingerprintMetadata?.value || null,
      boardDataSourceVersion: projection.boardDataSourceVersion || projection.boardDataSourceVersionMetadata?.value || null,
      selectedResultPersistenceEnabled: projection.selectedResultPersistenceEnabled === true,
      runTableGenerationEnabled: projection.runTableGenerationEnabled === true,
      iesGenerationEnabled: projection.iesGenerationEnabled === true,
      outputGenerationEnabled: projection.outputGenerationEnabled === true,
      routesAdded: projection.routesAdded === true,
      postEndpointsAdded: projection.postEndpointsAdded === true,
      stateEnum: Array.isArray(projection.stateEnum) ? [...projection.stateEnum] : [],
      approvedStateLabels: Array.isArray(projection.approvedStateLabels) ? [...projection.approvedStateLabels] : [],
      staleHistoricalLabel: projection.staleHistoricalLabel || "Result stale — run table changed, verify again",
      staleSensitiveInputKeys: Array.isArray(projection.staleSensitiveInputKeys) ? [...projection.staleSensitiveInputKeys] : [],
      redactionRuleCount: Array.isArray(projection.redactionRules) ? projection.redactionRules.length : 0,
    },
    selectedResultAuthorityGuard: guard && guard.state ? {
      state: guard.state,
      stale: guard.stale === true,
      failClosed: guard.failClosed !== false,
      reason: guard.reason || "not compared",
      diagnosticOnly: guard.diagnosticOnly === true,
      readOnly: guard.readOnly === true,
      authorityReady: guard.authorityReady === true,
      selectedResultAuthorityGuardReady: guard.selectedResultAuthorityGuardReady === true,
      comparisonAttempted: guard.comparisonAttempted === true,
      comparisonPairs: Array.isArray(guard.comparisonPairs)
        ? guard.comparisonPairs.map((pair) => ({
          label: String(pair.label || "unknown").slice(0, 120),
          comparable: pair.comparable === true,
          stale: pair.stale === true,
          storedPresent: pair.storedPresent === true,
          currentPresent: pair.currentPresent === true,
        }))
        : [],
      selectedResultAuthorityGuardFingerprint: guard.selectedResultAuthorityGuardFingerprint || null,
      fingerprint: guard.selectedResultAuthorityGuardFingerprint || null,
    } : null,
    safeSelectedResultSourceObjectSummary: safeSelectedResultSourceObjectSummary || null,
    selectedResultProjectionSource: projection.source || "future Engine/RunTable selected-result projection",
    selectedResultProjectionState: projection.state || "no_selected_result",
    selectedResultAvailable: projection.selectedResultAvailable === true,
    selectedResultUnavailableReason: projection.selectedResultAvailable === true ? "selected result available" : "no selected engine result available",
    resultStateLabel: projection.resultStateLabel || "Estimated preview",
    estimatedPreviewOnly: projection.estimatedPreviewOnly !== false,
    engineVerified: projection.engineVerified === true,
    summaryProjectionOnly: projection.summaryProjectionOnly === true,
    acceptedSelectedResultAvailable: projection.acceptedSelectedResultAvailable === true,
    runCount: projection.runCount || 0,
    engineVerificationEnabled: projection.engineVerificationEnabled === true,
    selectedResultIngestionEnabled: projection.selectedResultIngestionEnabled === true,
    selectedResultPersistenceEnabled: projection.selectedResultPersistenceEnabled === true,
    stale: projection.stale === true,
    accepted: projection.accepted === true,
    staleResult: projection.stale === true,
    staleResultDetectionEnabled: projection.staleResultComparisonEnabled === true,
    selectedProfileTier: projection.selectedProfileTier || null,
    selectedFamilySubsetLock: projection.selectedFamilySubsetLock || null,
    selectedSubsetFamilyLock: projection.selectedFamilySubsetLock || null,
    perRunLookupNormalised: projection.perRunLookupNormalised === true,
    futureResultSourceRequired: projection.source || "read-only upstream Engine/RunTable selected-result source",
    futureRequiredShape: {
      oneSelectedResultOnly: true,
      successfulAcceptedPayloadRequired: true,
      perRunLookupKey: projection.perRunLookupKey || "run id / run number",
      selectedSubsetFamilyLockRequired: true,
      weightedAlternativesHiddenForNormalUsers: true,
      fields: [...SELECTED_ENGINE_RESULT_REQUIRED_FIELDS],
      perRunDisplayRowShape: projection.perRunDisplayRowShape || {},
      selectedFamilySubsetLockShape: projection.selectedFamilySubsetLockShape || {},
    },
    rows: [
      ["projection source", projection.source || "future Engine/RunTable selected-result projection"],
      ["projection state", projection.state || "no_selected_result"],
      ["result state label", projection.resultStateLabel || "Estimated preview"],
      ["selected result availability", projection.selectedResultAvailable === true ? "selected result available" : "no selected engine result available"],
      ["engine verified", projection.engineVerified === true ? "true" : "false"],
      ["stale", projection.stale === true ? "true" : "false"],
      ["accepted", projection.accepted === true ? "true" : "false"],
      ["summary projection only", projection.summaryProjectionOnly === true ? "true" : "false"],
      ["detailed selected result accepted", projection.acceptedSelectedResultAvailable === true ? "true" : "false"],
      ["engine verification", projection.engineVerificationEnabled === true ? "enabled" : "disabled"],
      ["selected result ingestion", projection.selectedResultIngestionEnabled === true ? "enabled" : "disabled"],
      ["selected result persistence", projection.selectedResultPersistenceEnabled === true ? "enabled" : "disabled"],
      ["authority guard state", guard.state || "not_compared_fail_closed"],
      ["authority guard fail closed", guard.failClosed === false ? "false" : "true"],
      ["authority guard reason", guard.reason || "not compared"],
      ["stale result flag", guard.stale === true || projection.stale === true ? "true" : "placeholder only — false"],
      ["selected subset/family lock", projection.selectedFamilySubsetLock ? "established" : "not established"],
      ["per-run lookup", projection.perRunLookupNormalised === true ? "normalised" : "not available"],
    ],
    fieldRows,
    projectionFieldRows,
    safetyFlags,
    boundaryCopy: [...new Set([...(Array.isArray(projection.boundaryCopy) ? projection.boundaryCopy : []), ...SELECTED_ENGINE_RESULT_BOUNDARY_COPY])],
    writes: projection.writes === true ? true : false,
    generation: projection.generation === true ? true : false,
    proof: projection.proof === true ? true : false,
    routesAdded: projection.routesAdded === true,
    postEndpointsAdded: projection.postEndpointsAdded === true,
  };
}

const PRODUCT_SURFACE_PARITY_ORDER = Object.freeze([
  "selected-truth summary",
  "canonical workflow sections",
  "product spine",
  "payload preview",
  "selected engine-result handoff",
  "source/spec readiness explanation",
  "disabled handoff summary",
  "spec-build readiness preview",
  "collapsed diagnostics",
]);

const PRODUCT_SURFACE_DISABLED_HANDOFFS = Object.freeze([
  Object.freeze({ key: "specGeneration", label: "Spec generation", safetyKey: "specGeneration", disabledKey: "specGeneration" }),
  Object.freeze({ key: "slugGeneration", label: "Slug generation", safetyKey: "slugGeneration", disabledKey: "slugGeneration" }),
  Object.freeze({ key: "iesGeneration", label: "IES generation", safetyKey: "iesGeneration", disabledKey: "iesGeneration" }),
  Object.freeze({ key: "payloadGeneration", label: "Payload generation", safetyKey: "payloadGeneration", disabledKey: "payloadGeneration" }),
  Object.freeze({ key: "runTableGeneration", label: "RunTable generation", safetyKey: "runTableGeneration", disabledKey: "runTableGeneration" }),
  Object.freeze({ key: "drawingGeneration", label: "Drawing generation", safetyKey: "drawingGeneration", disabledKey: "drawingGeneration" }),
  Object.freeze({ key: "labProofAuthority", label: "Lab Proof authority", safetyKey: "labProofAuthority", disabledKey: "labProofAuthority" }),
  Object.freeze({ key: "controlledRecordsWrites", label: "Controlled Records writes", safetyKey: "controlledRecordsWrites", disabledKey: "controlledRecordsWrites" }),
  Object.freeze({ key: "rregApprovalCustodyTransfer", label: "RREG approval / custody transfer", safetyKey: "rregApprovalCustodyTransfer", disabledKey: "rregApprovalCustodyTransfer" }),
  Object.freeze({ key: "hubSpotCrmWriteBack", label: "HubSpot / CRM write-back", safetyKey: "hubSpotCrmWriteBack", disabledKey: "hubSpotCrmWriteBack" }),
  Object.freeze({ key: "boardDataMutation", label: "Board Data mutation", safetyKey: "boardDataMutation", disabledKey: "boardDataMutation" }),
]);

function falseUnlessExplicitTrue(value) {
  return value === true ? true : false;
}

function createSourceSpecReadinessExplanation({
  sourceReady = false,
  sourceReadiness = null,
  referenceOptionSourceCoverage = null,
  productSpine = {},
  payloadPreview = {},
  selectionTruthSummary = {},
  summary = {},
} = {}) {
  const spec = productSpine.specGateCandidateReadiness || payloadPreview.specGateCandidateReadiness || {};
  const safeSource = sourceReadiness || payloadPreview.sourceReadiness || payloadPreview.safeSnapshotState || {};
  const coverage = referenceOptionSourceCoverage || safeSource.referenceOptionSourceCoverage || payloadPreview.referenceOptionSourceCoverage || {};
  const missingRequirements = Array.isArray(spec.missingRequirements) ? [...spec.missingRequirements] : [];
  const blockedItems = Array.isArray(selectionTruthSummary.blockers) ? selectionTruthSummary.blockers : [];
  const missingItems = Array.isArray(selectionTruthSummary.missing) ? selectionTruthSummary.missing : [];
  const sourceState = safeSource.state || (sourceReady ? "source-backed-safe-preview" : "fail-closed-source-warning");
  const readinessState = spec.readinessState || summary.state || "default preview — not spec-ready";
  const sourceReadyBoolean = sourceReady === true;
  const specReady = spec.specReady === true;

  return {
    title: "Source readiness / Spec Ready explanation",
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: false,
    sourceReady: sourceReadyBoolean,
    sourceState,
    completeEnoughForPreview: safeSource.completeEnoughForPreview === true,
    readOnlyProductReference: safeSource.readOnlyProductReference === true || safeSource.safeForPreview === true,
    failClosed: safeSource.failClosed === true || sourceReadyBoolean !== true,
    expectedTablesPresent: safeSource.expectedTablesPresent === true,
    sourceBackedFieldCount: coverage.sourceBackedFieldCount ?? 0,
    futureMappedFieldCount: coverage.futureMappedFieldCount ?? 0,
    specReady,
    specGateComplete: spec.specGateComplete === true,
    readinessState,
    missingRequirements,
    blockedIncompatibleSummary: spec.blockedIncompatibleSummary || PRODUCT_SPINE_EMPTY_VALUE,
    manualConstraintsSummary: spec.manualConstraintsSummary || PRODUCT_SPINE_EMPTY_VALUE,
    autoConsequencesSummary: spec.autoConsequencesSummary || PRODUCT_SPINE_EMPTY_VALUE,
    slugSpecPreviewState: spec.slugSpecPreviewState || "disabled",
    blockedCount: blockedItems.length,
    missingCount: missingItems.length,
    futureMappedFieldExplanation: payloadPreview.futureMappedFieldExplanation || safeSource.futureMappedFieldExplanation || coverage.futureMappedExplanation || "Future-mapped fields are visible and not faked.",
    rows: [
      ["source readiness", sourceReadyBoolean ? "ready" : "unavailable / fail closed"],
      ["source state", sourceState],
      ["complete enough for preview", safeSource.completeEnoughForPreview === true ? "true" : "false"],
      ["read-only product reference", (safeSource.readOnlyProductReference === true || safeSource.safeForPreview === true) ? "true" : "false"],
      ["Spec Ready state", readinessState],
      ["spec-ready", specReady ? "read-only ready" : "disabled"],
      ["missing requirements", missingRequirements.length ? missingRequirements.join(", ") : PRODUCT_SPINE_EMPTY_VALUE],
      ["blocked selections", spec.blockedIncompatibleSummary || PRODUCT_SPINE_EMPTY_VALUE],
      ["manual constraints", spec.manualConstraintsSummary || PRODUCT_SPINE_EMPTY_VALUE],
      ["auto consequences", spec.autoConsequencesSummary || PRODUCT_SPINE_EMPTY_VALUE],
      ["future mapped fields", String(coverage.futureMappedFieldCount ?? 0)],
      ["slug/spec preview", spec.slugSpecPreviewState || "disabled"],
    ],
    boundaryCopy: [
      "Source readiness is reported from safe snapshot/status metadata only.",
      "Spec Ready / Candidate Readiness is read-only and follows the source-backed readiness requirements.",
      "Missing, blocked, future-mapped, and disabled values stay visible without fabricated values.",
      "Spec-ready does not activate generation, proof, records, approvals, or write-back.",
    ],
    agreement: {
      payloadSourceReadyMatchesSurface: payloadPreview.sourceReady === sourceReadyBoolean,
      payloadSpecGateMatchesSurface: (payloadPreview.specGateCandidateReadiness?.readinessState || readinessState) === readinessState,
      selectionTruthBlockersMatchReadiness: blockedItems.length === (summary.blockedCount ?? blockedItems.length),
    },
    writes: false,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
}

function createDisabledHandoffSummary({ payloadPreview = {}, selectionTruthSummary = {}, productSpine = {} } = {}) {
  const safetyFlags = payloadPreview.safetyFlags || {};
  const disabledOutputs = payloadPreview.disabledOutputs || {};
  const handoffs = PRODUCT_SURFACE_DISABLED_HANDOFFS.map((handoff) => {
    const safetyFlag = falseUnlessExplicitTrue(safetyFlags[handoff.safetyKey]);
    const disabledFlag = falseUnlessExplicitTrue(disabledOutputs[handoff.disabledKey]);
    return {
      key: handoff.key,
      label: handoff.label,
      safetyFlag,
      disabledOutputFlag: disabledFlag,
      disabled: safetyFlag === false && disabledFlag === false,
      status: safetyFlag === false && disabledFlag === false ? "disabled" : "unsafe-enabled",
      source: "payload safety flags + disabled output preview",
      writes: false,
      rawRowsExposed: false,
    };
  });
  const specGate = productSpine.specGateCandidateReadiness || payloadPreview.specGateCandidateReadiness || {};
  const truthDisabled = Array.isArray(selectionTruthSummary.disabledHandoffs) ? selectionTruthSummary.disabledHandoffs : [];
  return {
    title: "Disabled output handoff summary",
    readOnly: true,
    allDisabled: handoffs.every((handoff) => handoff.disabled === true),
    handoffs,
    handoffCount: handoffs.length,
    selectionTruthDisabledHandoffCount: truthDisabled.length,
    specGateDisabledHandoffSummary: specGate.disabledHandoffSummary || "disabled",
    summaryText: handoffs.map((handoff) => `${handoff.label}: ${handoff.status}`).join("; "),
    safetyFlags: {
      specGeneration: falseUnlessExplicitTrue(safetyFlags.specGeneration),
      slugGeneration: falseUnlessExplicitTrue(safetyFlags.slugGeneration),
      iesGeneration: falseUnlessExplicitTrue(safetyFlags.iesGeneration),
      payloadGeneration: falseUnlessExplicitTrue(safetyFlags.payloadGeneration),
      runTableGeneration: falseUnlessExplicitTrue(safetyFlags.runTableGeneration),
      drawingGeneration: falseUnlessExplicitTrue(safetyFlags.drawingGeneration),
      labProofAuthority: falseUnlessExplicitTrue(safetyFlags.labProofAuthority),
      controlledRecordsWrites: falseUnlessExplicitTrue(safetyFlags.controlledRecordsWrites),
      rregApprovalCustodyTransfer: falseUnlessExplicitTrue(safetyFlags.rregApprovalCustodyTransfer),
      hubSpotCrmWriteBack: falseUnlessExplicitTrue(safetyFlags.hubSpotCrmWriteBack),
      boardDataMutation: falseUnlessExplicitTrue(safetyFlags.boardDataMutation),
    },
    boundaryCopy: [
      "All output handoffs remain disabled in this slice.",
      "The preview does not generate spec, slug, IES, payload, RunTable, drawing, Lab Proof, Controlled Records, RREG, HubSpot/CRM, or Board Data mutation outputs.",
      "Disabled handoff rows must agree with payload safety flags.",
    ],
    writes: false,
    generation: false,
    proof: false,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
}

const SPEC_BUILD_READINESS_BUILD_REQUIREMENTS = Object.freeze([
  Object.freeze({
    key: "mounting",
    label: "Mounting",
    donorSource: "selectorCompletionState.mountingDone",
    rows: Object.freeze([
      Object.freeze({ sectionKey: "mounting", rowKey: "mountStyle", label: "Mount style" }),
      Object.freeze({ sectionKey: "mounting", rowKey: "mountSelection", label: "Mount selection" }),
    ]),
  }),
  Object.freeze({
    key: "finishes",
    label: "Finishes",
    donorSource: "selectorCompletionState.finishesDone",
    rows: Object.freeze([
      Object.freeze({ sectionKey: "finishes", rowKey: "bodyFinish", label: "Body finish" }),
      Object.freeze({ sectionKey: "finishes", rowKey: "cover", label: "Cover" }),
      Object.freeze({ sectionKey: "finishes", rowKey: "endPlates", label: "End plates" }),
      Object.freeze({ sectionKey: "finishes", rowKey: "flexColour", label: "Flex colour" }),
    ]),
  }),
  Object.freeze({
    key: "runs",
    label: "Runs",
    donorSource: "selectorCompletionState.runsDone plus runtime run/order context preview",
    rows: Object.freeze([
      Object.freeze({ sectionKey: "runs", rowKey: "runQty", label: "Run qty" }),
      Object.freeze({ sectionKey: "runs", rowKey: "runLength", label: "Run length" }),
    ]),
  }),
]);

const SPEC_BUILD_READINESS_DOWNSTREAM_AUTHORITIES = Object.freeze([
  Object.freeze({ key: "selectedResult", label: "Selected-result dependency", status: "blocked/fail-closed — accepted selected Engine/RunTable result required" }),
  Object.freeze({ key: "engineRunTable", label: "Engine / RunTable", status: "disabled — Selector does not execute Engine or generate RunTable" }),
  Object.freeze({ key: "iesBuilder", label: "IES Builder", status: "disabled — future candidate artefact handoff only" }),
  Object.freeze({ key: "labProof", label: "Lab Proof", status: "blocked — Lab Proof remains separate proof authority" }),
  Object.freeze({ key: "compliance", label: "Compliance", status: "blocked — no compliance approval is created" }),
  Object.freeze({ key: "controlledRecords", label: "Controlled Records", status: "disabled — no provenance/disposition record is written" }),
  Object.freeze({ key: "rreg", label: "RREG", status: "disabled — no reviewer, approver, or custody assignment is created" }),
  Object.freeze({ key: "boardData", label: "Board Data", status: "disabled — no Board Data mutation is performed" }),
]);

function productSpineSection(productSpine = {}, sectionKey = "") {
  const sections = Array.isArray(productSpine.sections) ? productSpine.sections : [];
  return sections.find((section) => section.sectionKey === sectionKey) || null;
}

function productSpineRow(productSpine = {}, sectionKey = "", rowKey = "") {
  const section = productSpineSection(productSpine, sectionKey);
  const rows = Array.isArray(section?.rows) ? section.rows : [];
  return rows.find((row) => row.rowKey === rowKey) || null;
}

function readinessDisplayValue(row = {}) {
  return String(row?.displayValue ?? row?.value ?? "").trim();
}

function readinessRowComplete(row = {}) {
  const value = readinessDisplayValue(row);
  if (!value || value === PRODUCT_SPINE_EMPTY_VALUE) return false;
  const status = String(row?.status || "").trim().toLowerCase();
  return !["blocked", "missing", "future-mapped", "disabled", "not-selected"].includes(status);
}

const SLUG_SOURCE_ALLOWED_INPUTS = Object.freeze(["manualConstraints", "acceptedDefaults"]);

const SLUG_SOURCE_IGNORED_INPUTS = Object.freeze([
  "provisional auto-default-only values",
  "inherited-only values",
  "metadata-only display values",
  "product-spine display state",
  "payload preview display state",
]);

function createSlugInputSourceContract({ committedSelectorConstraints = [], specReady = false, buildReady = false } = {}) {
  const committedInputs = (Array.isArray(committedSelectorConstraints) ? committedSelectorConstraints : [])
    .filter((constraint) => constraint && constraint.committedSelectorState === true)
    .map((constraint) => ({
      fieldKey: constraint.fieldKey,
      label: constraint.label || constraint.fieldKey,
      value: constraint.value || null,
      valueLabel: constraint.valueLabel || constraint.value || null,
      authoritySource: constraint.authoritySource === "acceptedDefaults" ? "acceptedDefaults" : "manualConstraints",
      acceptedDefault: constraint.acceptedDefault === true,
      manualConstraint: constraint.manualConstraint === true,
      blocked: constraint.blocked === true,
      status: constraint.blocked === true ? "blocked" : "eligible committed input",
      writes: false,
      rawRowsExposed: false,
    }));
  const eligibleInputs = committedInputs.filter((input) => input.blocked !== true && input.value);
  const blockedInputs = committedInputs.filter((input) => input.blocked === true);
  const productionSlugGenerationSafe = false;
  const sourceState = !specReady
    ? "blocked — Stage 1 Spec Ready is incomplete"
    : !buildReady
      ? "blocked — Stage 2 Proof-of-Concept Buildable is incomplete"
      : "metadata-ready only — production slug generation remains disabled/fail-closed";
  return {
    title: "Slug source-of-truth contract",
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: false,
    sourceAuthority: "committed selector state only: manualConstraints and acceptedDefaults",
    allowedInputSources: [...SLUG_SOURCE_ALLOWED_INPUTS],
    ignoredInputSources: [...SLUG_SOURCE_IGNORED_INPUTS],
    sourceState,
    specReady,
    buildReady,
    committedInputCount: committedInputs.length,
    eligibleCommittedInputCount: eligibleInputs.length,
    blockedCommittedInputCount: blockedInputs.length,
    committedInputRows: committedInputs.map((input) => [input.label, `${input.valueLabel || input.value || PRODUCT_SPINE_EMPTY_VALUE} — ${input.authoritySource}${input.blocked ? " — blocked" : ""}`]),
    blockedInputRows: blockedInputs.length
      ? blockedInputs.map((input) => [input.label, input.valueLabel || input.value || "blocked"])
      : [["blocked committed inputs", "none"]],
    productionSlugGenerationSafe,
    slugGenerationEnabled: false,
    slugGenerated: false,
    generatedSlug: null,
    finalSlugString: null,
    reason: productionSlugGenerationSafe
      ? "Production slug generation may only consume eligible committed inputs."
      : "Production slug generation is not implemented in this slice, so Runtime exposes the input contract and fails closed instead of inventing an unstable slug.",
    boundaryCopy: [
      "Only committed selector state may become future slug identity input.",
      "Committed selector state means manualConstraints plus acceptedDefaults.",
      "Provisional defaults, inherited values, metadata display values, product-spine rows, and payload preview rows are ignored for slug identity.",
      "No slug string is generated until a production slug generator is explicitly approved.",
    ],
    writes: false,
    generation: false,
    rawRowsExposed: false,
  };
}

function createSpecBuildRequirementStatus(requirement = {}, productSpine = {}, committedSelectorConstraints = []) {
  const committedConstraintMap = new Map((Array.isArray(committedSelectorConstraints) ? committedSelectorConstraints : []).map((item) => [item.fieldKey, item]));
  const fields = (Array.isArray(requirement.rows) ? requirement.rows : []).map((definition) => {
    const row = productSpineRow(productSpine, definition.sectionKey, definition.rowKey);
    const candidateFieldKeys = [
      ...(Array.isArray(definition.fieldKeys) ? definition.fieldKeys : []),
      ...(Array.isArray(row?.fieldKeys) ? row.fieldKeys : []),
      definition.rowKey,
    ].filter(Boolean);
    const committedConstraint = candidateFieldKeys.map((fieldKey) => committedConstraintMap.get(fieldKey)).find(Boolean) || null;
    const committedDisplayValue = committedConstraint?.valueLabel || committedConstraint?.value || "";
    const rowComplete = readinessRowComplete(row);
    const committedComplete = Boolean(committedConstraint && committedConstraint.blocked !== true && committedConstraint.value);
    return {
      key: `${definition.sectionKey}.${definition.rowKey}`,
      sectionKey: definition.sectionKey,
      rowKey: definition.rowKey,
      label: definition.label || definition.rowKey,
      displayValue: committedDisplayValue || readinessDisplayValue(row) || PRODUCT_SPINE_EMPTY_VALUE,
      status: committedComplete
        ? (committedConstraint?.status || "committed-selector-state")
        : committedConstraint?.blocked === true
          ? "blocked"
          : "missing",
      complete: committedComplete,
      authoritySource: committedComplete ? (committedConstraint.authoritySource || "committed selector state") : "not-committed",
      displayRowPresent: rowComplete,
      displayRowStatus: row?.status || "missing",
      reason: committedComplete
        ? `${committedConstraint.authoritySource || "committed selector state"} satisfies Stage 2 build/order readiness; product-spine rows remain display only.`
        : committedConstraint?.blocked === true
          ? (committedConstraint.reason || "Committed selector state is blocked or incompatible, so Stage 2 fails closed.")
          : rowComplete
            ? "Product-spine/display value is visible, but Stage 2 requires committed selector state from manualConstraints or acceptedDefaults."
            : (row?.reason || "Required for future build-ready metadata; no committed selector state is present."),
      writes: false,
      rawRowsExposed: false,
    };
  });
  const missingFields = fields.filter((field) => field.complete !== true).map((field) => field.label);
  return {
    key: requirement.key,
    label: requirement.label,
    donorSource: requirement.donorSource,
    complete: missingFields.length === 0,
    missingFields,
    fields,
    status: missingFields.length === 0 ? "complete" : "missing",
    summary: missingFields.length ? `missing ${missingFields.join(", ")}` : "complete",
    authority: "committed selector state only: manualConstraints or acceptedDefaults",
    writes: false,
    rawRowsExposed: false,
  };
}

function selectedResultAcceptedForSpecBuild(handoff = {}) {
  return handoff.accepted === true
    && handoff.selectedResultAvailable === true
    && handoff.selectedResultAuthorityGuard?.state === "engine_verified_selected_result_ready"
    && handoff.selectedResultAuthorityGuard?.failClosed === false;
}

function specBuildCandidateState({ specReady = false, buildReady = false, defaultPreview = false, blockedCount = 0 } = {}) {
  if (defaultPreview) return "fresh/default-preview only";
  if (blockedCount > 0) return "blocked by incompatible manual selections";
  if (!specReady) return "incomplete";
  if (!buildReady) return "spec-ready candidate";
  return "build-ready candidate";
}

function createSpecBuildReadinessPreview({
  sourceReady = false,
  sourceReadiness = null,
  referenceOptionSourceCoverage = null,
  productSpine = {},
  payloadPreview = {},
  selectedEngineResultHandoff = {},
  selectionTruthSummary = {},
  sourceSpecReadinessExplanation = {},
  disabledHandoffSummary = {},
  manualConstraints = [],
  committedSelectorConstraints = null,
  autoConsequences = [],
  blockedItems = [],
  runIntakePreview = {},
  runAccessoryPlacementPreview = {},
  sourceBackedLengthPolicySummary = null,
  lmTemperatureReadinessPreview = {},
  readonlyEngineStep1SafeSummaryOverride = null,
  summary = {},
} = {}) {
  const spec = productSpine.specGateCandidateReadiness || payloadPreview.specGateCandidateReadiness || {};
  const specRequirements = Array.isArray(spec.requirements) ? spec.requirements : [];
  const readonlyEngineCandidateApplicability = {
    directSupported: true,
    indirectRequired: specRequirements.some((requirement) => [
      "indirectTargetLmPerM",
      "indirectCctCri",
      "indirectControl",
    ].includes(requirement?.key)),
  };
  const buildAuthorityConstraints = Array.isArray(committedSelectorConstraints) ? committedSelectorConstraints : manualConstraints;
  const buildRequirements = SPEC_BUILD_READINESS_BUILD_REQUIREMENTS.map((requirement) => createSpecBuildRequirementStatus(requirement, productSpine, buildAuthorityConstraints));
  const missingBuildRequirements = buildRequirements.filter((requirement) => requirement.complete !== true).map((requirement) => requirement.label);
  const missingSpecRequirements = Array.isArray(spec.missingRequirements) ? [...spec.missingRequirements] : [];
  const blockedRows = Array.isArray(spec.blockedIncompatibleSelections) ? spec.blockedIncompatibleSelections : [];
  const blockedCount = blockedRows.length;
  const specReady = spec.specReady === true;
  const buildReady = specReady && missingBuildRequirements.length === 0 && blockedCount === 0;
  const defaultPreview = spec.defaultPreview === true || (manualConstraints.length === 0 && (summary.state === "default preview" || !summary.state));
  const selectedResultAccepted = selectedResultAcceptedForSpecBuild(selectedEngineResultHandoff);
  const downstreamBlocked = selectedResultAccepted !== true;
  const candidateState = specBuildCandidateState({ specReady, buildReady, defaultPreview, blockedCount });
  const slugInputSourceContract = createSlugInputSourceContract({
    committedSelectorConstraints: buildAuthorityConstraints,
    specReady,
    buildReady,
  });
  const factoryApprovedInputsSummary = buildSelectorFactoryApprovedInputsSummary({
    stage2Ready: buildReady,
    committedSelectorConstraints: buildAuthorityConstraints,
    runIntakePreviewSummary: runIntakePreview,
    runAccessoryPlacementPreviewSummary: runAccessoryPlacementPreview,
    sourceBackedLengthPolicySummary,
    readonlyEngineCandidateApplicability,
  });
  const factoryApprovedInputsReady = factoryApprovedInputsSummary.factoryApprovedInputsReady === true;
  const factoryReadyState = deriveSelectorFactoryReadyState({
    specReady,
    buildReady,
    factoryApprovedInputsSummary,
    committedSelectorConstraints: buildAuthorityConstraints,
    missingSpecRequirements,
    missingBuildRequirements,
    blockedIncompatibleSelections: blockedRows,
  });
  const factoryReady = factoryReadyState.factoryReady === true;
  const readonlyEngineCandidateMapperResult = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary,
    committedSelectorConstraints: buildAuthorityConstraints,
    lmTemperatureReadinessPreview,
  });
  const readonlyEngineCandidateMapperSummary = readonlyEngineCandidateMapperResult.summary;
  const readonlyEngineStep1SafeSummary = readonlyEngineStep1SafeSummaryOverride || buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult: readonlyEngineCandidateMapperResult,
    seamResult: null,
  });
  const readonlyEngineStep2SelectedResultSummary = buildSelectorReadonlyEngineStep2SelectedResultProjection({
    readonlyEngineStep1SafeSummary,
  });
  const readonlyEngineStep3AuthorityGuardSummary = buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard({
    readonlyEngineStep2SelectedResultSummary,
    policyFingerprint: SELECTOR_WORKFLOW_POLICY_FINGERPRINT,
    sourceFingerprint: SELECTOR_WORKFLOW_SOURCE_FINGERPRINT,
    currentSelectorStateFingerprint: SELECTOR_WORKFLOW_STATE_FINGERPRINT,
    currentReferenceOptionsFingerprint: SELECTOR_WORKFLOW_REFERENCE_OPTIONS_FINGERPRINT,
  });
  const stageIndicators = [
    { stage: 1, key: "specReady", label: "Stage 1 — Spec Ready", ready: specReady, authority: "committed selector state", sourceAuthority: "manualConstraints or acceptedDefaults only; provisional defaults do not count", failClosed: !specReady },
    { stage: 2, key: "proofOfConceptBuildable", label: "Stage 2 — Proof-of-Concept Buildable", ready: buildReady, authority: "committed selector state only: manualConstraints or acceptedDefaults", sourceAuthority: "manualConstraints or acceptedDefaults only; product-spine/display rows do not count", failClosed: !buildReady },
    { stage: 3, key: "factoryReady", label: "Stage 3 — Factory Approved Inputs", stateLabel: "Factory Ready", ready: factoryReady, authority: "derived readiness over committed selector state and the existing Factory Approved Inputs summary", sourceAuthority: factoryReadyState.sourceAuthority, failClosed: !factoryReady, blocker: factoryReadyState.blocker || null, summary: factoryApprovedInputsSummary },
    { stage: 4, key: "engineOutcomeProven", label: "Stage 4 — Engine Outcome Proven", ready: false, authority: "Engine/RunTable proof remains downstream", sourceAuthority: "not implemented — fail closed", failClosed: true },
    { stage: 5, key: "standaloneProGradeHardening", label: "Stage 5 — Standalone / Pro-grade Hardening", ready: false, authority: "standalone/pro-grade hardening deferred", sourceAuthority: "not implemented — fail closed", failClosed: true },
  ];
  const downstreamBlockers = SPEC_BUILD_READINESS_DOWNSTREAM_AUTHORITIES.map((blocker) => ({
    ...blocker,
    blocked: blocker.key === "selectedResult" ? !selectedResultAccepted : true,
    status: blocker.key === "selectedResult" && selectedResultAccepted
      ? "accepted selected result available — still read-only in Selector"
      : blocker.status,
    writes: false,
    rawRowsExposed: false,
  }));
  const safetyFlags = {
    specGeneration: false,
    slugGeneration: false,
    pdfGeneration: false,
    payloadGeneration: false,
    engineExecution: false,
    runTableGeneration: false,
    iesGeneration: false,
    labProofAuthority: false,
    complianceApproval: false,
    controlledRecordsMutation: false,
    rregApprovalCustodyTransfer: false,
    boardDataMutation: false,
    runtimeDataMutation: false,
    rawBoardDataExposed: false,
    rawSelectedResultPayloadExposed: false,
    rawEnginePayloadExposed: false,
    rawIesExposed: false,
    rawLabEvidenceExposed: false,
    rawUsersExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
    rawDebugExposed: false,
  };
  const coverage = referenceOptionSourceCoverage || sourceReadiness?.referenceOptionSourceCoverage || payloadPreview.referenceOptionSourceCoverage || {};
  const sourceState = sourceReadiness?.state || sourceSpecReadinessExplanation.sourceState || (sourceReady ? "source-backed-safe-preview" : "fail-closed-source-warning");

  return {
    title: "Spec-build readiness preview",
    status: candidateState,
    readOnly: true,
    previewOnly: true,
    productFacing: true,
    diagnosticOnly: false,
    candidateState,
    freshDefaultPreviewOnly: defaultPreview,
    incomplete: !specReady,
    blockedByIncompatibleManualSelections: blockedCount > 0,
    specReady,
    specGateComplete: specReady,
    specGateState: specReady ? "complete enough for future slug/spec input metadata" : "incomplete — missing or blocked spec inputs remain visible",
    buildReady,
    buildGateComplete: buildReady,
    buildGateState: buildReady ? "complete enough for future build slug/spec input metadata" : "incomplete — build/order context still required",
    factoryReady,
    factoryReadyState,
    factoryReadyRows: [
      ["factoryReady", factoryReady ? "true" : "false"],
      ["state", factoryReadyState.state],
      ["blocker", factoryReadyState.blocker || "none"],
      ["factoryApprovedInputsReady", factoryApprovedInputsReady ? "true" : "false"],
      ["diagnostic fallback accepted", "false"],
      ["provider push enabled", "false"],
    ],
    factoryApprovedInputsReady,
    factoryApprovedInputsSummary,
    factoryApprovedInputsRows: factoryApprovedInputsSummary.summaryRows,
    readonlyEngineCandidateInputsReady: factoryApprovedInputsSummary.readonlyEngineCandidateInputsReady === true,
    readonlyEngineCandidateInputsBlocker: factoryApprovedInputsSummary.readonlyEngineCandidateInputsBlocker || null,
    readonlyEngineCandidateApplicability: factoryApprovedInputsSummary.readonlyEngineCandidateApplicability,
    readonlyEngineCandidateReady: readonlyEngineCandidateMapperSummary?.readonlyEngineCandidateMapperReady === true,
    readonlyEngineCandidateMapperSummary,
    readonlyEngineStep1SafeSummary,
    readonlyEngineStep2SelectedResultSummary,
    readonlyEngineStep2Ready: readonlyEngineStep2SelectedResultSummary?.readonlyEngineStep2Ready === true,
    selectedResultSummaryProjectionReady: readonlyEngineStep2SelectedResultSummary?.selectedResultProjectionReady === true,
    readonlyEngineStep3AuthorityGuardSummary,
    readonlyEngineStep3Ready: readonlyEngineStep3AuthorityGuardSummary?.readonlyEngineStep3Ready === true,
    selectedResultAuthorityState: readonlyEngineStep3AuthorityGuardSummary?.selectedResultAuthorityState || "not_compared_fail_closed",
    stageIndicators,
    stageIndicatorRows: stageIndicators.map((stage) => [stage.label, stage.ready ? "true" : "false"]),
    businessStageIndicatorContract: {
      sourceAuthority: "committed selector state for Stage 1/2; Stage 3 Factory Ready derives from those states plus the existing Factory Approved Inputs summary; Stage 4/5 remain fail-closed",
      stages: stageIndicators,
      writes: false,
      rawRowsExposed: false,
    },
    downstreamBlocked,
    selectedResultAccepted,
    manualConstraintCount: manualConstraints.length,
    autoConsequenceCount: autoConsequences.length,
    manualConstraintRows: spec.manualConstraints || [["manual constraints", PRODUCT_SPINE_EMPTY_VALUE]],
    autoConsequenceRows: spec.autoConsequences || [["auto consequences", PRODUCT_SPINE_EMPTY_VALUE]],
    missingSpecRequirements,
    missingSpecRequirementRows: missingSpecRequirements.length
      ? missingSpecRequirements.map((requirement) => [requirement, "missing"])
      : [["spec requirements", "complete"]],
    missingBuildRequirements,
    missingBuildRequirementRows: buildRequirements.map((requirement) => [requirement.label, requirement.summary]),
    buildRequirements,
    blockedIncompatibleSelections: blockedRows,
    blockedIncompatibleRows: blockedRows.length ? blockedRows : [["blocked / incompatible selections", "none"]],
    sourceReadinessState: sourceReady ? "ready" : "unavailable / fail closed",
    sourceRows: [
      ["source readiness", sourceReady ? "ready" : "unavailable / fail closed"],
      ["source state", sourceState],
      ["safe preview only", sourceReadiness?.completeEnoughForPreview === true ? "true" : (sourceReady ? "true" : "false")],
      ["source-backed fields", String(coverage.sourceBackedFieldCount ?? 0)],
      ["future-mapped fields", String(coverage.futureMappedFieldCount ?? 0)],
    ],
    selectedResultDependencyState: selectedResultAccepted
      ? "accepted selected result available — still read-only in Selector"
      : "blocked/fail-closed — accepted selected Engine/RunTable result required",
    selectedResultRows: [
      ["projection state", selectedEngineResultHandoff.selectedResultProjectionState || "no_selected_result"],
      ["selected result available", selectedEngineResultHandoff.selectedResultAvailable === true ? "true" : "false"],
      ["accepted", selectedEngineResultHandoff.accepted === true ? "true" : "false"],
      ["engine verified", selectedEngineResultHandoff.engineVerified === true ? "true" : "false"],
      ["authority guard", selectedEngineResultHandoff.selectedResultAuthorityGuard?.state || "not_compared_fail_closed"],
      ["authority guard fail closed", selectedEngineResultHandoff.selectedResultAuthorityGuard?.failClosed === false ? "false" : "true"],
      ["dependency state", selectedResultAccepted ? "accepted selected result available" : "blocked/fail-closed"],
    ],
    futureSlugSpecDependencyState: buildReady
      ? "future slug/spec input metadata appears ready; no slug or spec is generated here"
      : specReady
        ? "future spec input metadata appears ready; build/order context is still incomplete"
        : "blocked until Spec Ready is reached",
    futureSlugSpecRows: [
      ["future slug/spec state", buildReady ? "metadata-ready only" : specReady ? "spec metadata-ready only" : "blocked"],
      ["slug generated", "false"],
      ["spec generated", "false"],
      ["final slug string", "none"],
      ["slug input authority", slugInputSourceContract.sourceAuthority],
      ["ignored slug sources", slugInputSourceContract.ignoredInputSources.join("; ")],
      ["descriptor source", "donor specBuildDescriptor observed; runtime preview does not call or reproduce it"],
    ],
    slugInputSourceContract,
    downstreamBlockers,
    downstreamBlockerRows: downstreamBlockers.map((blocker) => [blocker.label, blocker.status]),
    summaryRows: [
      ["candidate state", candidateState],
      ["Spec Ready state", specReady ? "ready" : "incomplete"],
      ["Build Ready state", buildReady ? "ready" : "incomplete"],
      ["Factory Ready state", factoryReady ? "ready" : "blocked/fail-closed"],
      ["Factory Ready blocker", factoryReadyState.blocker || "none"],
      ["factory-approved inputs evidence", factoryApprovedInputsReady ? "ready" : "blocked/fail-closed"],
      ["factory-approved evidence blocker", factoryApprovedInputsSummary.blocker || "none"],
      ["Stage 4 Step 1 readonly mapper", readonlyEngineCandidateMapperSummary?.readonlyEngineCandidateMapperReady === true ? "ready" : (readonlyEngineCandidateMapperSummary?.blocker || "blocked/fail-closed")],
      ["Stage 4 Step 1 readonly seam", readonlyEngineStep1SafeSummary?.readonlyEngineStep1Ready === true ? "ready" : (readonlyEngineStep1SafeSummary?.blocker || "host-local-readonly-engine-seam-not-invoked")],
      ["Stage 4 Step 2 selected-result source/projection", readonlyEngineStep2SelectedResultSummary?.readonlyEngineStep2Ready === true ? "summary-ready" : (readonlyEngineStep2SelectedResultSummary?.blocker || "blocked/fail-closed")],
      ["Stage 4 Step 3 selected-result authority guard", readonlyEngineStep3AuthorityGuardSummary?.selectedResultAuthorityState || "not_compared_fail_closed"],
      ["manual constraints", String(manualConstraints.length)],
      ["auto consequences", String(autoConsequences.length)],
      ["missing spec requirements", missingSpecRequirements.length ? missingSpecRequirements.join(", ") : "none"],
      ["missing build requirements", missingBuildRequirements.length ? missingBuildRequirements.join(", ") : "none"],
      ["blocked incompatible selections", blockedCount ? String(blockedCount) : "none"],
      ["selected-result dependency", selectedResultAccepted ? "accepted" : "blocked/fail-closed"],
      ["downstream blocked", downstreamBlocked ? "true" : "false"],
    ],
    safetyFlags,
    safetyRows: Object.entries(safetyFlags).map(([key, value]) => [key, value === true ? "true" : "false"]),
    boundaryCopy: [
      "Selector may preview whether the candidate appears spec-ready or build-ready; it does not generate a slug, spec, PDF, payload, RunTable, IES, proof, approval, record, or custody transfer.",
      "Fresh/default-preview values are not spec authority.",
      "Manual selections are durable constraints and incompatible manual selections stay visible as blocked.",
      "Auto consequences are shown for review and remain changeable; they do not create authority or proof.",
      "Build Ready means donor build/order context appears complete for future metadata only: Mounting, Finishes, and Runs are present after Spec Ready.",
      "Selected-result, Engine/RunTable, IES Builder, Compliance, Controlled Records, RREG, and Lab Proof remain separate downstream authorities and fail closed here.",
    ],
    generatedSlug: null,
    finalSlugString: null,
    specGenerated: false,
    pdfGenerated: false,
    payloadGenerated: false,
    engineExecuted: false,
    runTableGenerated: false,
    iesGenerated: false,
    labProofCreated: false,
    complianceApproved: false,
    controlledRecordMutated: false,
    rregApprovalCreated: false,
    boardDataMutated: false,
    writes: false,
    generation: false,
    proof: false,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    rawBoardDataExposed: false,
    rawSelectedResultPayloadExposed: false,
    rawEnginePayloadExposed: false,
    rawIesExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
    rawDebugExposed: false,
    disabledHandoffAllDisabled: disabledHandoffSummary.allDisabled !== false,
  };
}

function createProductSurfaceParityLock({
  productSpine = {},
  payloadPreview = {},
  selectedEngineResultHandoff = {},
  selectionTruthSummary = {},
  sourceSpecReadinessExplanation = {},
  disabledHandoffSummary = {},
  specBuildReadinessPreview = {},
  workflowSectionsCanonical = true,
  flatFieldsPrimary = false,
} = {}) {
  const spineOrder = Array.isArray(productSpine.order) ? [...productSpine.order] : [];
  return {
    title: "Selector product surface parity lock",
    readOnly: true,
    blockOrder: [...PRODUCT_SURFACE_PARITY_ORDER],
    selectedTruthBeforeProductSpine: true,
    canonicalWorkflowBeforePayloadPreview: true,
    productSpineBeforePayloadPreview: true,
    selectedEngineResultAfterPayloadPreview: true,
    selectedEngineResultBeforeSourceReadiness: true,
    sourceSpecReadinessAfterPayloadPreview: true,
    disabledHandoffAfterReadiness: true,
    specBuildReadinessAfterDisabledHandoff: true,
    specBuildReadinessBeforeCollapsedDiagnostics: true,
    diagnosticsCollapsedBehindProductSurface: true,
    workflowSectionsCanonical: workflowSectionsCanonical !== false,
    flatFieldsPrimary: flatFieldsPrimary === true ? false : false,
    spineOrder,
    payloadShapeKeys: Object.keys(payloadPreview || {}),
    sourceReadinessAgreesWithPayload: sourceSpecReadinessExplanation.agreement?.payloadSourceReadyMatchesSurface !== false,
    specGateAgreesWithPayload: sourceSpecReadinessExplanation.agreement?.payloadSpecGateMatchesSurface !== false,
    disabledHandoffsAgreeWithPayload: disabledHandoffSummary.allDisabled === true,
    specBuildReadinessPreviewPresent: specBuildReadinessPreview.readOnly === true && specBuildReadinessPreview.productFacing === true,
    specBuildReadinessSafetyAgrees: specBuildReadinessPreview.safetyFlags?.specGeneration === false
      && specBuildReadinessPreview.safetyFlags?.slugGeneration === false
      && specBuildReadinessPreview.safetyFlags?.payloadGeneration === false
      && specBuildReadinessPreview.safetyFlags?.engineExecution === false
      && specBuildReadinessPreview.safetyFlags?.runTableGeneration === false
      && specBuildReadinessPreview.safetyFlags?.iesGeneration === false
      && specBuildReadinessPreview.safetyFlags?.labProofAuthority === false
      && specBuildReadinessPreview.safetyFlags?.complianceApproval === false
      && specBuildReadinessPreview.safetyFlags?.controlledRecordsMutation === false
      && specBuildReadinessPreview.safetyFlags?.rregApprovalCustodyTransfer === false
      && specBuildReadinessPreview.safetyFlags?.boardDataMutation === false,
    selectedEngineResultSafetyAgrees: (
      (selectedEngineResultHandoff.selectedResultAvailable === false && selectedEngineResultHandoff.engineVerified === false)
      || (selectedEngineResultHandoff.selectedResultAvailable === true
        && selectedEngineResultHandoff.summaryProjectionOnly === true
        && selectedEngineResultHandoff.accepted === false
        && selectedEngineResultHandoff.acceptedSelectedResultAvailable !== true
        && selectedEngineResultHandoff.engineVerified === true)
    )
      && selectedEngineResultHandoff.engineVerificationEnabled === false
      && selectedEngineResultHandoff.safetyFlags?.engineExecutionEnabled === false
      && selectedEngineResultHandoff.safetyFlags?.runTableGenerationEnabled === false
      && selectedEngineResultHandoff.safetyFlags?.payloadGenerationEnabled === false
      && selectedEngineResultHandoff.safetyFlags?.iesGenerationEnabled === false
      && selectedEngineResultHandoff.safetyFlags?.drawingGenerationEnabled === false
      && selectedEngineResultHandoff.safetyFlags?.labProofAuthority === false
      && selectedEngineResultHandoff.safetyFlags?.rawSelectedPayloadExposed === false
      && selectedEngineResultHandoff.safetyFlags?.rawEngineDebugPayloadExposed === false,
    selectedTruthSafetyAgrees: selectionTruthSummary.specGenerationEnabled === false
      && selectionTruthSummary.payloadGenerationEnabled === false
      && selectionTruthSummary.runTableGenerationEnabled === false
      && selectionTruthSummary.labProofAuthority === false,
    allGenerationProofWriteDisabled: disabledHandoffSummary.allDisabled === true
      && selectedEngineResultHandoff.generation === false
      && selectedEngineResultHandoff.proof === false
      && selectedEngineResultHandoff.writes === false
      && payloadPreview.productionPayload !== true
      && payloadPreview.safetyFlags?.writes !== true
      && payloadPreview.safetyFlags?.generation !== true
      && payloadPreview.safetyFlags?.labProofAuthority !== true,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
    writes: false,
  };
}

function selectorWorkflowString(value, fallback = "none") {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text.replace(/[^0-9A-Za-z _./:-]+/g, " ").replace(/\s+/g, " ").slice(0, 180) || fallback;
}

function selectorWorkflowToken(value, fallback = "unresolved") {
  return selectorWorkflowString(value, fallback)
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function selectorWorkflowCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.round(number);
}

function selectorWorkflowRows(rows = []) {
  return Array.isArray(rows) && rows.length ? rows : [["status", "not available"]];
}

function selectorWorkflowSelectedValuesSummary(local = {}, selectionTruthSummary = {}) {
  const contract = local.selectorStateContract || {};
  const effective = selectionEntries(contract.effectiveSelection || {});
  const selectedValues = effective.slice(0, 40).map((entry) => ({
    fieldKey: selectorWorkflowToken(entry.fieldKey || entry.label, "field"),
    label: selectorWorkflowString(entry.label || entry.fieldKey, "Field"),
    valueToken: selectorWorkflowToken(entry.value || entry.valueLabel, "unresolved"),
    valueLabel: selectorWorkflowString(entry.valueLabel || entry.value, "unresolved"),
    provenance: selectorWorkflowString(entry.provenance || entry.kind || "preview", "preview"),
    safeLabelOnly: true,
    rawRowsReturned: false,
  }));
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    status: selectedValues.length ? "safe-selected-values-visible" : "safe-selected-values-empty",
    selectedValueCount: selectedValues.length,
    referenceValueCount: selectorWorkflowCount(selectionTruthSummary.selectedItemCount ?? selectedValues.length),
    manualConstraintCount: countObjectFields(contract.manualConstraints || {}),
    autoConsequenceCount: countObjectFields(contract.autoConsequences || {}),
    defaultPreviewCount: countObjectFields(contract.defaultPreviewSelections || {}),
    selectedValues,
    rawSelectorPayloadReturned: false,
    rawProductRowsReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
  };
}

function selectorWorkflowReferenceSummary(selectorReferenceStatus = {}, sourceReady = false, referenceOptionSourceCoverage = {}) {
  const fields = dbOptionsFields(selectorReferenceStatus);
  const sections = dbWorkflowSections(selectorReferenceStatus);
  const coverage = referenceOptionSourceCoverage && typeof referenceOptionSourceCoverage === "object" && !Array.isArray(referenceOptionSourceCoverage)
    ? referenceOptionSourceCoverage
    : {};
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    referenceOptionsReady: sourceReady === true,
    sourceReady: sourceReady === true,
    optionFieldCount: fields.length,
    workflowSectionCount: sections.length,
    sourceBackedFieldCount: selectorWorkflowCount(coverage.sourceBackedFieldCount),
    futureMappedFieldCount: selectorWorkflowCount(coverage.futureMappedFieldCount),
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
  };
}

function selectorWorkflowCompatibilitySummary(local = {}, workflowSections = [], blockedItems = []) {
  const diagnostics = local.selectorStateContract?.compatibilityDiagnostics || {};
  const warnings = Array.isArray(diagnostics.warnings) ? diagnostics.warnings : [];
  const blocked = Array.isArray(blockedItems) ? blockedItems : [];
  const hasIndirect = selectionEntries(local.selectorStateContract?.effectiveSelection || {})
    .some((entry) => /indirect|uplight/i.test(String(entry.fieldKey || entry.label || "")) && String(entry.value || "").trim());
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    mountCompatibilityReady: !warnings.length && !blocked.length,
    mountStatus: blocked.length ? "blocked" : warnings.length ? "review-required" : "compatible",
    opticCompatibilityStatus: blocked.length ? "blocked" : "compatible",
    uplightCompatibilityStatus: hasIndirect ? "review-current-selection" : "not-required",
    warningCount: warnings.length,
    blockedCount: blocked.length,
    workflowSectionCount: Array.isArray(workflowSections) ? workflowSections.length : 0,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
  };
}

function selectorWorkflowFinishCascadeSummary(local = {}) {
  const effective = local.selectorStateContract?.effectiveSelection || {};
  const readField = (fieldKey, fallback = "unresolved") => {
    const item = effective[fieldKey] || {};
    return selectorWorkflowString(item.valueLabel || item.value, fallback);
  };
  const body = readField("bodyFinish", "unresolved");
  const cover = readField("diffuserFinish", body);
  const end = readField("trimFinish", body);
  const flex = readField("trimFinish", body);
  const ready = body !== "unresolved" && cover !== "unresolved" && end !== "unresolved" && flex !== "unresolved";
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    finishCascadeReady: ready,
    body: { value: selectorWorkflowToken(body), label: body, provenance: "effective-selection", resolved: body !== "unresolved" },
    cover: { value: selectorWorkflowToken(cover), label: cover, provenance: cover === body ? "inherited" : "effective-selection", resolved: cover !== "unresolved" },
    end: { value: selectorWorkflowToken(end), label: end, provenance: end === body ? "inherited" : "effective-selection", resolved: end !== "unresolved" },
    flex: { value: selectorWorkflowToken(flex), label: flex, provenance: flex === body ? "inherited" : "effective-selection", resolved: flex !== "unresolved" },
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
  };
}

function selectorWorkflowTimelineStatusSummary(timelineFiltering = {}) {
  const filtered = selectorWorkflowCount(timelineFiltering.filteredItemCount);
  const outOfWindow = selectorWorkflowCount(timelineFiltering.outOfWindowItemCount);
  const warnings = Array.isArray(timelineFiltering.warnings) ? timelineFiltering.warnings : [];
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    timelineStatusReady: filtered === 0 && outOfWindow === 0,
    timelineGateReady: filtered === 0 && outOfWindow === 0,
    status: selectorWorkflowString(timelineFiltering.status, "safe-timeline-gate"),
    gate: filtered || outOfWindow ? "blocked" : warnings.length ? "review-required" : "allowed",
    filteredItemCount: filtered,
    outOfWindowItemCount: outOfWindow,
    warningCount: warnings.length,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
  };
}

function selectorWorkflowStage({ id, label, ready = false, blocked = false, reviewRequired = false, blocker = null, reason = "preview-only diagnostic stage", safeCounts = {}, rows = [] }) {
  const status = ready ? "ready" : blocked ? "blocked" : reviewRequired ? "review-required" : "blocked";
  return {
    id,
    label,
    status,
    ready: ready === true,
    blocked: status === "blocked",
    reviewRequired: status === "review-required",
    blocker: blocker || (status === "blocked" ? `${id}-not-ready` : null),
    reason: selectorWorkflowString(reason, "preview-only diagnostic stage"),
    previewOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    safeCounts,
    rows: selectorWorkflowRows(rows),
    rawRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    generated: false,
  };
}

function selectorWorkflowDownstreamStage(id, label, summary = {}, readyKey = "ok") {
  const ready = summary?.[readyKey] === true || (readyKey === "ok" && summary?.ok === true);
  const safetyFlags = summary?.safetyFlags && typeof summary.safetyFlags === "object" ? summary.safetyFlags : {};
  return {
    id,
    label,
    status: ready ? "ready" : "blocked",
    ready,
    blocked: !ready,
    blocker: summary?.blocker || (!ready ? `${id}-not-ready` : null),
    reason: summary?.blocker || summary?.state || "preview-only downstream status",
    previewOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    privateBridgeOnly: summary?.privateBridgeOnly === true || safetyFlags.privateBridgeOnly === true,
    syntheticSafePreviewOnly: summary?.syntheticFixtureOnly === true || safetyFlags.syntheticFixtureOnly === true,
    fingerprint: summary?.sealedCandidateAssemblyPreviewFingerprint
      || summary?.runTableDomainOutputScaffoldFingerprint
      || summary?.bridgeFingerprint
      || summary?.selectedResultHandoffScaffoldFingerprint
      || summary?.selectedResultAuthorityReadinessPreflightFingerprint
      || summary?.acceptedSelectedResultAuthorityGateFingerprint
      || summary?.selectedResultPersistenceBoundaryContractFingerprint
      || summary?.iesHandoffReadinessScaffoldFingerprint
      || summary?.selectedResultOutputReadinessPreflightFingerprint
      || summary?.selectedResultPersistenceAuthorityPreflightFingerprint
      || null,
    safeCounts: summary?.bridgeFingerprint ? {
      privateBridgeOnly: summary?.privateBridgeOnly === true || safetyFlags.privateBridgeOnly === true ? 1 : 0,
      donorEngineInvoked: 0,
      realDonorPayloadAssembled: 0,
      selectedResultPersisted: 0,
      runTableGenerated: 0,
      iesGenerated: 0,
    } : {},
    rows: selectorWorkflowRows([
      ["fingerprint", summary?.bridgeFingerprint || summary?.sealedCandidateAssemblyPreviewFingerprint || summary?.runTableDomainOutputScaffoldFingerprint || summary?.selectedResultHandoffScaffoldFingerprint || summary?.selectedResultAuthorityReadinessPreflightFingerprint || summary?.acceptedSelectedResultAuthorityGateFingerprint || summary?.selectedResultPersistenceBoundaryContractFingerprint || summary?.iesHandoffReadinessScaffoldFingerprint || summary?.selectedResultOutputReadinessPreflightFingerprint || summary?.selectedResultPersistenceAuthorityPreflightFingerprint || "none"],
      ["private bridge only", boolString(summary?.privateBridgeOnly === true || safetyFlags.privateBridgeOnly === true)],
      ["synthetic/safe preview only", boolString(summary?.syntheticFixtureOnly === true || safetyFlags.syntheticFixtureOnly === true)],
      ["donor invocation blocked", boolString((summary?.blocker || "") === "donor-engine-invocation-not-approved" || safetyFlags.donorEngineInvoked !== true)],
      ["no selected-result persistence", boolString(summary?.selectedResultPersisted !== true && safetyFlags.selectedResultPersisted !== true)],
      ["no RunTable generation", boolString(summary?.runTableGenerated !== true && safetyFlags.runTableGenerated !== true && safetyFlags.productionRunTableGenerated !== true)],
      ["no IES generation", boolString(summary?.iesGenerated !== true && safetyFlags.iesGenerated !== true)],
    ]),
    rawRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    exactElectricalValuesReturned: false,
    exactPlacementCoordinatesReturned: false,
    generated: false,
  };
}

function selectorWorkflowProductionActions() {
  return [
    ["runEngine", "Run Engine disabled"],
    ["runTableGeneration", "RunTable generation disabled"],
    ["iesGeneration", "IES generation disabled"],
    ["selectedResultPersistence", "selected-result persistence disabled"],
    ["hubSpotProjectWrites", "HubSpot/project writes disabled"],
  ].map(([id, label]) => ({
    id,
    label,
    enabled: false,
    disabled: true,
    reason: "Selector workflow is preview-only and diagnostic-only in this slice.",
  }));
}

function createSelectorWorkflowPreview({
  local = {},
  selectorReferenceStatus = {},
  sourceReady = false,
  referenceOptionSourceCoverage = {},
  workflowSections = [],
  blockedItems = [],
  selectionTruthSummary = {},
  selectedEngineResultHandoff = {},
  timelineFiltering = {},
  runIntakePreview = {},
  runAccessoryPlacementPreview = {},
  specialPartsEntitlementPreview = {},
  lmTemperatureReadinessPreview = {},
  readonlyEngineStep1SafeSummaryOverride = null,
} = {}) {
  const fingerprints = {
    policyFingerprint: SELECTOR_WORKFLOW_POLICY_FINGERPRINT,
    sourceFingerprint: SELECTOR_WORKFLOW_SOURCE_FINGERPRINT,
  };
  const safeSelectedValuesSummary = selectorWorkflowSelectedValuesSummary(local, selectionTruthSummary);
  const selectorReferenceOptionsSummary = selectorWorkflowReferenceSummary(selectorReferenceStatus, sourceReady, referenceOptionSourceCoverage);
  const mountCompatibilitySummary = selectorWorkflowCompatibilitySummary(local, workflowSections, blockedItems);
  const finishCascadeSummary = selectorWorkflowFinishCascadeSummary(local);
  const timelineStatusSummary = selectorWorkflowTimelineStatusSummary(timelineFiltering);

  const sealedCandidateAssemblyPreviewSummary = buildRuntimeSealedCandidateAssemblyPreviewSummary({
    ...fingerprints,
    selectorSelectionSummary: safeSelectedValuesSummary,
    selectorRunIntakePreviewSummary: runIntakePreview,
    selectorRunAccessoryPlacementPreviewSummary: runAccessoryPlacementPreview,
    selectorSpecialPartsEntitlementPreviewSummary: specialPartsEntitlementPreview,
    timelineGateSummary: timelineStatusSummary,
    finishCascadeSummary,
    mountCompatibilitySummary,
  });
  const safeDraftProjectEnvelopePreviewSummary = buildSelectorSafeDraftProjectEnvelopePreview({
    ...fingerprints,
    safeSelectedValuesSummary,
    selectorReferenceOptionsSummary,
    finishCascadeSummary,
    timelineStatusSummary,
    runIntakePreviewSummary: runIntakePreview,
    runAccessoryPlacementIntentPreviewSummary: runAccessoryPlacementPreview,
    specialPartsEntitlementPreviewSummary: specialPartsEntitlementPreview,
    sealedCandidateAssemblyPreviewSummary,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    projectIntentContext: {
      projectIntentRef: "safe-selector-workflow-preview-project-intent",
      projectLabel: "Selector workflow preview",
      clientLabel: "redacted",
      siteLabel: "redacted",
      status: "draft-intent-preview-only",
    },
    safeWorkspaceContext: {
      displayRole: "redacted",
      identityState: "redacted",
      safeProjectRef: "safe-selector-workflow-preview-project-intent",
    },
  });
  const safeHydrateValidationPreviewSummary = buildSelectorSafeHydrateValidationPreview({
    safeDraftProjectEnvelopePreviewSummary,
    expectedPolicyFingerprint: fingerprints.policyFingerprint,
    expectedSourceFingerprint: fingerprints.sourceFingerprint,
    currentReferenceOptionsFingerprint: SELECTOR_WORKFLOW_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: SELECTOR_WORKFLOW_STATE_FINGERPRINT,
  });
  const runTableDomainOutputScaffoldSummary = buildRuntimeRunTableDomainOutputScaffoldSummary({
    ...fingerprints,
    sealedCandidateAssemblyPreviewSummary,
  });
  const controlledDonorEngineVerifyBridgeSummary = buildRuntimeControlledDonorEngineVerifyBridgeSummary({
    ...fingerprints,
    sealedCandidateAssemblyPreviewSummary,
    runTableDomainOutputScaffoldSummary,
    readonlyEngineStep1SafeSummary: readonlyEngineStep1SafeSummaryOverride,
    privateReadonlySeamBridgeGateApproved: Boolean(readonlyEngineStep1SafeSummaryOverride),
  });
  const selectedResultHandoffScaffoldSummary = buildRuntimeSelectedResultHandoffScaffoldSummary({
    ...fingerprints,
    sealedCandidateAssemblyPreviewSummary,
    runTableDomainOutputScaffoldSummary,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    safeSelectedResultSourceObjectSummary: selectedEngineResultHandoff.safeSelectedResultSourceObjectSummary || null,
    selectedResultAuthorityGuardSummary: selectedEngineResultHandoff.selectedResultAuthorityGuard || null,
  });
  const selectedResultAuthorityReadinessPreflightSummary = buildSelectedResultAuthorityReadinessPreflight({
    ...fingerprints,
    currentSourceInputFingerprint: selectedEngineResultHandoff.selectedResultProjection?.sourceInputFingerprint || null,
    verifiedSummary: readonlyEngineStep1SafeSummaryOverride || null,
    privateVerificationBridgeSummary: controlledDonorEngineVerifyBridgeSummary,
    safeSelectedResultSourceObjectSummary: selectedEngineResultHandoff.safeSelectedResultSourceObjectSummary || null,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    selectedResultAuthorityGuardSummary: selectedEngineResultHandoff.selectedResultAuthorityGuard || null,
    selectedResultHandoffScaffoldSummary,
  });
  const acceptedSelectedResultAuthorityGateSummary = buildAcceptedSelectedResultAuthorityGate({
    ...fingerprints,
    currentSourceInputFingerprint: selectedEngineResultHandoff.selectedResultProjection?.sourceInputFingerprint || null,
    verifiedSummary: readonlyEngineStep1SafeSummaryOverride || null,
    privateVerificationBridgeSummary: controlledDonorEngineVerifyBridgeSummary,
    safeSelectedResultSourceObjectSummary: selectedEngineResultHandoff.safeSelectedResultSourceObjectSummary || null,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    selectedResultAuthorityGuardSummary: selectedEngineResultHandoff.selectedResultAuthorityGuard || null,
    selectedResultAuthorityReadinessPreflightSummary,
  });
  const selectedResultPersistenceBoundaryContractSummary = buildSelectedResultPersistenceBoundaryContract({
    ...fingerprints,
    currentSourceInputFingerprint: selectedEngineResultHandoff.selectedResultProjection?.sourceInputFingerprint || null,
    acceptedSelectedResultAuthorityGateSummary,
    selectedResultAuthorityGuardSummary: selectedEngineResultHandoff.selectedResultAuthorityGuard || null,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    safeSelectedResultSourceObjectSummary: selectedEngineResultHandoff.safeSelectedResultSourceObjectSummary || null,
    selectedResultHandoffScaffoldSummary,
  });
  const iesHandoffReadinessScaffoldSummary = buildRuntimeIesHandoffReadinessScaffoldSummary({
    ...fingerprints,
    selectedResultHandoffScaffoldSummary,
    runTableDomainOutputScaffoldSummary,
    sealedCandidateAssemblyPreviewSummary,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    safeDraftProjectEnvelopePreviewSummary,
  });
  const selectedResultOutputReadinessPreflightSummary = buildSelectedResultOutputReadinessPreflight({
    ...fingerprints,
    currentSourceInputFingerprint: selectedEngineResultHandoff.selectedResultProjection?.sourceInputFingerprint || null,
    acceptedSelectedResultAuthorityGateSummary,
    selectedResultAuthorityReadinessPreflightSummary,
    selectedResultPersistenceBoundaryContractSummary,
    selectedResultAuthorityGuardSummary: selectedEngineResultHandoff.selectedResultAuthorityGuard || null,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    safeSelectedResultSourceObjectSummary: selectedEngineResultHandoff.safeSelectedResultSourceObjectSummary || null,
    selectedResultHandoffScaffoldSummary,
    runTableDomainOutputScaffoldSummary,
    iesHandoffReadinessScaffoldSummary,
  });
  const selectedResultPersistenceAuthorityPreflightSummary = buildSelectedResultPersistenceAuthorityPreflight({
    ...fingerprints,
    currentSourceInputFingerprint: selectedEngineResultHandoff.selectedResultProjection?.sourceInputFingerprint || null,
    acceptedSelectedResultAuthorityGateSummary,
    selectedResultOutputReadinessPreflightSummary,
    selectedResultPersistenceBoundaryContractSummary,
    selectedResultAuthorityGuardSummary: selectedEngineResultHandoff.selectedResultAuthorityGuard || null,
    selectedResultProjectionSummary: selectedEngineResultHandoff.selectedResultProjection || null,
    safeSelectedResultSourceObjectSummary: selectedEngineResultHandoff.safeSelectedResultSourceObjectSummary || null,
    selectedResultHandoffScaffoldSummary,
  });
  const controlledRealSourceEvidenceStatus = {
    id: "controlled-real-source-evidence",
    label: "Controlled real-source evidence status",
    status: "diagnostic-only-available-not-invoked",
    ready: false,
    helperAvailable: true,
    previewOnly: true,
    diagnosticOnly: true,
    runtimeDataRead: false,
    runtimeDataMutated: false,
    donorEngineInvoked: false,
    rawRowsReturned: false,
    rawPayloadsReturned: false,
    reason: "Controlled real-source evidence probe is surfaced as availability status only; Selector UI does not invoke it.",
  };

  const selectedReferenceReady = safeSelectedValuesSummary.selectedValueCount > 0 && selectorReferenceOptionsSummary.referenceOptionsReady === true;
  const stageSummaries = [
    selectorWorkflowStage({
      id: "selected-reference-values",
      label: "Selected/reference values",
      ready: selectedReferenceReady,
      reviewRequired: !selectedReferenceReady,
      reason: selectedReferenceReady ? "safe selected and reference values are available" : "selected values are visible but reference source readiness needs review",
      safeCounts: {
        selectedValueCount: safeSelectedValuesSummary.selectedValueCount,
        optionFieldCount: selectorReferenceOptionsSummary.optionFieldCount,
        workflowSectionCount: selectorReferenceOptionsSummary.workflowSectionCount,
      },
      rows: [["selected values", safeSelectedValuesSummary.selectedValueCount], ["reference options ready", boolString(selectorReferenceOptionsSummary.referenceOptionsReady)]],
    }),
    selectorWorkflowStage({
      id: "lm-temperature-output-readiness",
      label: "Lm/m temperature-output readiness",
      ready: false,
      blocked: true,
      blocker: lmTemperatureReadinessPreview.blocker || "temperature-adjusted-output-requires-future-engine-verification",
      reason: lmTemperatureReadinessPreview.visibleCopy || "Light output is captured as target intent only. Temperature-adjusted output requires future Engine verification.",
      safeCounts: {
        directTargetIntentCount: lmTemperatureReadinessPreview.targetIntent?.direct?.ready === true ? 1 : 0,
        indirectTargetIntentCount: lmTemperatureReadinessPreview.targetIntent?.indirect?.ready === true ? 1 : 0,
        verifiedOutputCount: 0,
      },
      rows: lmTemperatureReadinessPreview.summaryRows,
    }),
    selectorWorkflowStage({
      id: "mount-uplight-compatibility",
      label: "Mount/uplight compatibility",
      ready: mountCompatibilitySummary.mountCompatibilityReady,
      reviewRequired: !mountCompatibilitySummary.mountCompatibilityReady,
      reason: mountCompatibilitySummary.mountStatus,
      safeCounts: { warningCount: mountCompatibilitySummary.warningCount, blockedCount: mountCompatibilitySummary.blockedCount },
      rows: [["mount status", mountCompatibilitySummary.mountStatus], ["uplight status", mountCompatibilitySummary.uplightCompatibilityStatus]],
    }),
    selectorWorkflowStage({
      id: "finish-cascade",
      label: "Finish cascade",
      ready: finishCascadeSummary.finishCascadeReady,
      reviewRequired: !finishCascadeSummary.finishCascadeReady,
      reason: finishCascadeSummary.finishCascadeReady ? "effective finish cascade resolved" : "finish cascade requires review",
      safeCounts: { resolvedFinishCount: [finishCascadeSummary.body, finishCascadeSummary.cover, finishCascadeSummary.end, finishCascadeSummary.flex].filter((item) => item.resolved).length },
      rows: [["body", finishCascadeSummary.body.label], ["cover", finishCascadeSummary.cover.label], ["end", finishCascadeSummary.end.label], ["flex", finishCascadeSummary.flex.label]],
    }),
    selectorWorkflowStage({
      id: "timeline-status-gate",
      label: "Timeline/status gate",
      ready: timelineStatusSummary.timelineGateReady,
      blocked: timelineStatusSummary.gate === "blocked",
      reviewRequired: timelineStatusSummary.gate !== "allowed" && timelineStatusSummary.gate !== "blocked",
      reason: timelineStatusSummary.gate,
      safeCounts: { filteredItemCount: timelineStatusSummary.filteredItemCount, outOfWindowItemCount: timelineStatusSummary.outOfWindowItemCount, warningCount: timelineStatusSummary.warningCount },
      rows: [["status", timelineStatusSummary.status], ["gate", timelineStatusSummary.gate]],
    }),
    selectorWorkflowStage({
      id: "run-intake-preview",
      label: "Run intake preview",
      ready: runIntakePreview.runIntakePreviewReady === true,
      blocked: runIntakePreview.runIntakePreviewReady !== true,
      reason: runIntakePreview.runIntakePreviewReady === true ? "safe run intake captured" : runIntakePreview.blocker || "run intake incomplete",
      safeCounts: { runCount: selectorWorkflowCount(runIntakePreview.runCount), totalQuantity: selectorWorkflowCount(runIntakePreview.totalQuantity), incompleteRunCount: selectorWorkflowCount(runIntakePreview.incompleteRunCount) },
      rows: runIntakePreview.summaryRows,
    }),
    selectorWorkflowStage({
      id: "accessory-placement-intent-preview",
      label: "Accessory placement intent preview",
      ready: runAccessoryPlacementPreview.runAccessoryPlacementPreviewReady === true,
      blocked: runAccessoryPlacementPreview.runAccessoryPlacementPreviewReady !== true,
      reason: runAccessoryPlacementPreview.runAccessoryPlacementPreviewReady === true ? "safe accessory intent captured" : runAccessoryPlacementPreview.blocker || "accessory placement intent incomplete",
      safeCounts: { accessoryIntentCount: selectorWorkflowCount(runAccessoryPlacementPreview.accessoryIntentCount), unresolvedAccessoryIntentCount: selectorWorkflowCount(runAccessoryPlacementPreview.unresolvedAccessoryIntentCount) },
      rows: runAccessoryPlacementPreview.summaryRows,
    }),
    selectorWorkflowStage({
      id: "special-parts-entitlement-preview",
      label: "Special-parts entitlement preview",
      ready: specialPartsEntitlementPreview.specialPartsEntitlementPreviewReady === true,
      reviewRequired: selectorWorkflowCount(specialPartsEntitlementPreview.reviewRequiredCount) > 0,
      reason: specialPartsEntitlementPreview.entitlementStatus || "entitlement preview unavailable",
      safeCounts: { redactedEntitlementCount: selectorWorkflowCount(specialPartsEntitlementPreview.redactedEntitlementCount), reviewRequiredCount: selectorWorkflowCount(specialPartsEntitlementPreview.reviewRequiredCount) },
      rows: specialPartsEntitlementPreview.summaryRows,
    }),
    selectorWorkflowStage({
      id: "safe-draft-project-envelope-preview",
      label: "Safe draft/project envelope preview",
      ready: safeDraftProjectEnvelopePreviewSummary.safeDraftProjectEnvelopePreviewReady === true,
      blocked: safeDraftProjectEnvelopePreviewSummary.safeDraftProjectEnvelopePreviewReady !== true,
      blocker: safeDraftProjectEnvelopePreviewSummary.blocker,
      reason: safeDraftProjectEnvelopePreviewSummary.blocker || "safe draft envelope preview ready",
      safeCounts: { envelopeReady: safeDraftProjectEnvelopePreviewSummary.safeDraftProjectEnvelopePreviewReady === true ? 1 : 0 },
      rows: [["state", safeDraftProjectEnvelopePreviewSummary.state], ["blocker", safeDraftProjectEnvelopePreviewSummary.blocker || "none"]],
    }),
    selectorWorkflowStage({
      id: "safe-hydrate-validation-preview",
      label: "Safe hydrate validation preview",
      ready: safeHydrateValidationPreviewSummary.hydrateValidationPreviewReady === true,
      blocked: safeHydrateValidationPreviewSummary.hydrateValidationPreviewReady !== true,
      blocker: safeHydrateValidationPreviewSummary.blocker,
      reason: safeHydrateValidationPreviewSummary.blocker || "safe hydrate validation ready",
      safeCounts: { hydrateReady: safeHydrateValidationPreviewSummary.hydrateValidationPreviewReady === true ? 1 : 0 },
      rows: [["state", safeHydrateValidationPreviewSummary.state], ["blocker", safeHydrateValidationPreviewSummary.blocker || "none"]],
    }),
  ];

  const downstreamStages = [
    selectorWorkflowDownstreamStage("sealed-candidate-assembly", "Sealed candidate assembly readiness", sealedCandidateAssemblyPreviewSummary, "sealedCandidateAssemblyPreviewReady"),
    selectorWorkflowDownstreamStage("runtable-domain", "RunTable domain readiness", runTableDomainOutputScaffoldSummary, "runTableDomainOutputScaffoldReady"),
    selectorWorkflowDownstreamStage("controlled-donor-engine-verify-bridge", "Controlled donor Engine verify bridge", controlledDonorEngineVerifyBridgeSummary, "bridgeReady"),
    selectorWorkflowDownstreamStage("selected-result-handoff", "Selected-result handoff readiness", selectedResultHandoffScaffoldSummary, "selectedResultHandoffScaffoldReady"),
    selectorWorkflowDownstreamStage("selected-result-authority-preflight", "Accepted selected-result authority readiness preflight", selectedResultAuthorityReadinessPreflightSummary, "acceptedAuthorityReadinessPreflightReady"),
    selectorWorkflowDownstreamStage("accepted-selected-result-authority", "Accepted selected-result authority gate", acceptedSelectedResultAuthorityGateSummary, "acceptedSelectedResultAuthorityReady"),
    selectorWorkflowDownstreamStage("selected-result-persistence-boundary-contract", "Selected-result persistence boundary contract", selectedResultPersistenceBoundaryContractSummary, "selectedResultPersistenceContractReady"),
    selectorWorkflowDownstreamStage("ies-handoff", "IES handoff readiness", iesHandoffReadinessScaffoldSummary, "iesHandoffReadinessScaffoldReady"),
    selectorWorkflowDownstreamStage("selected-result-output-readiness-preflight", "Selected-result persistence/output-readiness preflight", selectedResultOutputReadinessPreflightSummary, "readyForSelectedResultPersistence"),
    selectorWorkflowDownstreamStage("selected-result-persistence-authority-preflight", "Selected-result persistence authority preflight", selectedResultPersistenceAuthorityPreflightSummary, "readyForPersistenceAuthority"),
    controlledRealSourceEvidenceStatus,
  ];
  const blockedStages = stageSummaries.filter((stage) => stage.blocked);
  const reviewStages = stageSummaries.filter((stage) => stage.reviewRequired);
  const disabledProductionActions = selectorWorkflowProductionActions();
  const downstreamReadinessSummary = {
    previewOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    stages: downstreamStages,
    sealedCandidateAssemblyPreviewSummary,
    runTableDomainOutputScaffoldSummary,
    controlledDonorEngineVerifyBridgeSummary,
    selectedResultHandoffScaffoldSummary,
    selectedResultAuthorityReadinessPreflightSummary,
    acceptedSelectedResultAuthorityGateSummary,
    selectedResultPersistenceBoundaryContractSummary,
    iesHandoffReadinessScaffoldSummary,
    selectedResultOutputReadinessPreflightSummary,
    selectedResultPersistenceAuthorityPreflightSummary,
    controlledRealSourceEvidenceStatus,
    productionActions: disabledProductionActions,
    runEngineEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    selectedResultPersistenceEnabled: false,
    hubSpotProjectWritesEnabled: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
  const blockedSummary = {
    blocked: blockedStages.length > 0 || downstreamStages.some((stage) => stage.blocked),
    blockedStageCount: blockedStages.length,
    reviewRequiredStageCount: reviewStages.length,
    downstreamBlockedStageCount: downstreamStages.filter((stage) => stage.blocked).length,
    blockers: [...blockedStages.map((stage) => stage.blocker).filter(Boolean), ...downstreamStages.map((stage) => stage.blocker).filter(Boolean)],
    runEngineDisabled: true,
    runTableGenerationDisabled: true,
    iesGenerationDisabled: true,
    selectedResultPersistenceDisabled: true,
    hubSpotProjectWritesDisabled: true,
  };

  return {
    title: "Selector workflow readiness — preview only",
    status: blockedSummary.blocked ? "blocked" : reviewStages.length ? "review-required" : "ready",
    selectorWorkflowPreviewReady: stageSummaries.every((stage) => stage.ready) && downstreamStages.every((stage) => stage.ready),
    previewOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    policyFingerprint: fingerprints.policyFingerprint,
    sourceFingerprint: fingerprints.sourceFingerprint,
    selectedValuesSummary: safeSelectedValuesSummary,
    selectorReferenceOptionsSummary,
    mountCompatibilitySummary,
    finishCascadeSummary,
    timelineStatusSummary,
    runIntakePreviewSummary: runIntakePreview,
    runAccessoryPlacementPreviewSummary: runAccessoryPlacementPreview,
    specialPartsEntitlementPreviewSummary: specialPartsEntitlementPreview,
    lmTemperatureReadinessPreview,
    lmTemperatureReadinessPreviewReady: false,
    safeDraftProjectEnvelopePreviewSummary,
    safeHydrateValidationPreviewSummary,
    stageSummaries,
    selectorWorkflowStageSummaries: stageSummaries,
    blockedSummary,
    selectorWorkflowBlockedSummary: blockedSummary,
    downstreamReadinessSummary,
    selectorDownstreamReadinessSummary: downstreamReadinessSummary,
    selectedResultAuthorityReadinessPreflightSummary,
    acceptedSelectedResultAuthorityGateSummary,
    selectedResultPersistenceBoundaryContractSummary,
    selectedResultOutputReadinessPreflightSummary,
    selectedResultPersistenceAuthorityPreflightSummary,
    disabledProductionActions,
    markers: ["preview-only", "diagnostic-only", "safe summaries only", "output intent only", "controlled donor bridge blocked", "production actions disabled"],
    unsafeOutputsBlocked: {
      rawRowsPayloadsPrivateDataExposed: false,
      rawProductRowsReturned: false,
      rawSelectorPayloadReturned: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      rawUsersReturned: false,
      rawCrmReturned: false,
      rawContactsReturned: false,
      privatePathsReturned: false,
      credentialsReturned: false,
      exactElectricalValuesReturned: false,
      driveCurrentReturned: false,
      lmPerMAtTempBridgeCalled: false,
      donorLmPerMAtTempCalled: false,
      temperatureAdjustedOutputCalculated: false,
      deliveredLmPerMVerified: false,
      exactPlacementCoordinatesReturned: false,
      realDonorPayloadAssembled: false,
      rawIesContentReturned: false,
      rawPhotometryReturned: false,
      candelaArraysReturned: false,
      base64ArtifactsReturned: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      hubSpotWriteEnabled: false,
      projectWriteEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
  };
}

function createDbBackedSelectorSurface(selectorReferenceStatus = {}, local = {}, selectorState, onLocalStateChange, snapshots = {}, workflowContext = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  const sourceReady = dbOptionsSourceReady(selectorReferenceStatus);
  const sourceReadiness = dbSourceReadinessPayload(selectorReferenceStatus);
  const referenceOptionSourceCoverage = dbReferenceOptionCoverage(selectorReferenceStatus);
  const sourceVersionBinding = dbSourceVersionBinding(selectorReferenceStatus);
  const fields = enrichDbOptionFields(selectorReferenceStatus, local).map((field) => ({
    ...field,
    primaryControl: false,
    flatFieldFallback: true,
    diagnosticOnly: true,
    rawRowsExposed: false,
  }));
  const classifiedWorkflowSections = applyRuntimePresentationClassificationToWorkflow(enrichDbWorkflowSections(selectorReferenceStatus, local));
  const canonicalWorkflow = createCanonicalWorkflowSections(classifiedWorkflowSections);
  const workflowSections = canonicalWorkflow.sections;
  const presentationClassification = createPresentationClassificationSummary(workflowSections);
  const defaultAcceptance = createDefaultAcceptanceSummary(workflowSections);
  const manualConstraints = createDbManualConstraints(selectorReferenceStatus, local);
  const committedSelectorConstraints = createDbCommittedSelectorConstraints(selectorReferenceStatus, local);
  const payloadConsequences = Array.isArray(payload.autoConsequences) ? payload.autoConsequences : [];
  const localConsequences = createDbAutoConsequences(fields, local);
  const presentationConsequences = createPresentationAutoConsequences(workflowSections);
  const consequenceKeys = new Set();
  const autoConsequences = [...payloadConsequences, ...localConsequences, ...presentationConsequences].filter((item) => {
    const key = `${item.fieldKey || ""}:${item.value || ""}:${item.kind || ""}`;
    if (consequenceKeys.has(key)) return false;
    consequenceKeys.add(key);
    return true;
  });
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
  const selectionTruthSummary = createSelectionTruthSummary({
    sourceReady,
    status: payload.status || selectorReferenceStatus.status || "not-requested",
    fields,
    workflowSections,
    manualConstraints,
    autoConsequences,
    blockedItems,
    payload,
    candidateSummary: summary,
  });
  const lmTemperatureReadinessPreview = buildSelectorLmTemperatureReadinessPreview({
    fields,
    workflowSections,
    selectionTruthSummary,
    sourceReady,
  });
  const productSpine = createProductSpine({
    fields,
    workflowSections,
    sourceReady,
    summary,
    manualConstraints,
    autoConsequences,
    blockedItems,
  });
  const payloadPreview = createPayloadPreviewSkeleton({
    fields,
    workflowSections,
    summary,
    snapshots,
    sourceReady,
    manualConstraints,
    autoConsequences,
    blockedItems,
    sourceReadiness,
    referenceOptionSourceCoverage,
  });
  const readonlyEngineStep1SafeSummaryOverride = payload.readonlyEngineStep1SafeSummary
    || payload.selectorReadonlyEngineStep1SafeSummary
    || null;
  const readonlyEngineStep2SelectedResultSummaryForSurface = readonlyEngineStep1SafeSummaryOverride
    ? buildSelectorReadonlyEngineStep2SelectedResultProjection({
      readonlyEngineStep1SafeSummary: readonlyEngineStep1SafeSummaryOverride,
    })
    : null;
  const selectedResultProjection = readonlyEngineStep2SelectedResultSummaryForSurface?.selectedResultProjectionReady === true
    ? readonlyEngineStep2SelectedResultSummaryForSurface.selectedResultProjection
    : buildSelectedResultProjectionContract();
  const readonlyEngineStep3AuthorityGuardSummaryForSurface = buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard({
    readonlyEngineStep2SelectedResultSummary: readonlyEngineStep2SelectedResultSummaryForSurface || {},
    policyFingerprint: SELECTOR_WORKFLOW_POLICY_FINGERPRINT,
    sourceFingerprint: SELECTOR_WORKFLOW_SOURCE_FINGERPRINT,
    currentSelectorStateFingerprint: SELECTOR_WORKFLOW_STATE_FINGERPRINT,
    currentReferenceOptionsFingerprint: SELECTOR_WORKFLOW_REFERENCE_OPTIONS_FINGERPRINT,
  });
  const selectedEngineResultHandoff = createSelectedEngineResultHandoffScaffold(
    selectedResultProjection,
    readonlyEngineStep3AuthorityGuardSummaryForSurface.authorityGuardSummary,
    readonlyEngineStep2SelectedResultSummaryForSurface?.safeSelectedResultSourceObject || null,
  );
  const sourceSpecReadinessExplanation = createSourceSpecReadinessExplanation({
    sourceReady,
    sourceReadiness,
    referenceOptionSourceCoverage,
    productSpine,
    payloadPreview,
    selectionTruthSummary,
    summary,
  });
  const disabledHandoffSummary = createDisabledHandoffSummary({
    payloadPreview,
    selectionTruthSummary,
    productSpine,
  });
  const singleRunIntentCaptureBase = createSelectorSingleRunIntentCapture({
    committedSelectorConstraints,
    local,
    selectorState,
    onLocalStateChange,
  });
  const runIntakePreview = buildSelectorRunIntakePreview(singleRunIntentCaptureBase.runs);
  const singleRunIntentCapture = selectorRunIntentCaptureWithPreview(singleRunIntentCaptureBase, runIntakePreview);
  const runAccessoryPlacementPreview = buildSelectorRunAccessoryPlacementPreview({
    runs: singleRunIntentCaptureBase.runs,
    intents: local.runAccessoryPlacement?.intents || [],
  });
  const selectorWorkflowPreview = createSelectorWorkflowPreview({
    local,
    selectorReferenceStatus,
    sourceReady,
    referenceOptionSourceCoverage,
    workflowSections,
    blockedItems,
    selectionTruthSummary,
    selectedEngineResultHandoff,
    timelineFiltering: workflowContext.timelineFiltering || {},
    specialPartsEntitlementPreview: workflowContext.specialPartsEntitlementPreview || {},
    lmTemperatureReadinessPreview,
    readonlyEngineStep1SafeSummaryOverride,
    runIntakePreview,
    runAccessoryPlacementPreview,
  });
  const specBuildReadinessPreview = createSpecBuildReadinessPreview({
    sourceReady,
    sourceReadiness,
    referenceOptionSourceCoverage,
    productSpine,
    payloadPreview,
    selectedEngineResultHandoff,
    selectionTruthSummary,
    sourceSpecReadinessExplanation,
    disabledHandoffSummary,
    manualConstraints,
    committedSelectorConstraints,
    autoConsequences,
    blockedItems,
    runIntakePreview,
    runAccessoryPlacementPreview,
    sourceBackedLengthPolicySummary: payload.sourceBackedLengthPolicySummary || null,
    lmTemperatureReadinessPreview,
    readonlyEngineStep1SafeSummaryOverride,
    summary,
  });
  const preEngineReadonlyActionEligibilityProjection =
    buildSelectorPreEngineReadonlyActionEligibilityProjection({
      specBuildReadinessPreview,
      committedSelectorConstraints,
      lmTemperatureReadinessPreview,
      sourceInputFingerprint: sourceVersionBinding.sourceInputFingerprint || null,
      boardDataSourceVersion: sourceVersionBinding.boardDataSourceVersion || null,
    });
  const productSurfaceParityLock = createProductSurfaceParityLock({
    productSpine,
    payloadPreview,
    selectedResultProjection: selectedEngineResultHandoff.selectedResultProjection,
    selectedEngineResultHandoff,
    selectionTruthSummary,
    sourceSpecReadinessExplanation,
    disabledHandoffSummary,
    specBuildReadinessPreview,
    workflowSectionsCanonical: canonicalWorkflow.workflowSectionsCanonical,
    flatFieldsPrimary: false,
  });
  const donorShapeSelectedTiles = createDonorShapeSelectedTiles({ fields, workflowSections });
  const timelineStatusTest = createTimelineStatusTestControls(local, selectorState, onLocalStateChange, selectorReferenceStatus);
  const specialPartsUserTest = createSpecialPartsUserTestControls(local, selectorState, onLocalStateChange, selectorReferenceStatus, workflowContext.specialPartsEntitlementPreview || {});
  const selectorTestCase = createSelectorTestCaseControls(local, workflowContext.selectorTestCaseActions || {});
  return {
    title: "CS Selector Preview",
    subtitle: "Read-only DB-backed candidate preview. Manual selections are constraints; auto selections are consequences.",
    sourceReady,
    sourceReadiness,
    safeSnapshotState: sourceReadiness,
    sourceInputFingerprint: sourceVersionBinding.sourceInputFingerprint || "",
    boardDataSourceVersion: sourceVersionBinding.boardDataSourceVersion || "",
    sourceVersionBinding,
    referenceOptionSourceCoverage,
    futureMappedFieldExplanation: (sourceReadiness && sourceReadiness.futureMappedFieldExplanation) || (referenceOptionSourceCoverage && referenceOptionSourceCoverage.futureMappedExplanation) || "Future-mapped fields are visible and not faked.",
    status: payload.status || selectorReferenceStatus.status || "not-requested",
    badges: [
      sourceReady ? "source ready" : "source unavailable",
      summary.state || (manualConstraints.length ? "manual constraints preview" : "default preview"),
      "Spec Ready incomplete",
      "not Lab Proof",
      "writes disabled",
    ],
    requiredSafetyCopy: "Read-only preview. No spec, slug, IES, payload, RunTable, Lab Proof, Controlled Record, RREG approval, custody transfer, Board Data write, or hidden write-back is created here.",
    proofCopy: "Selector previews selection readiness. Lab Proof proves later.",
    workflowSectionsCanonical: canonicalWorkflow.workflowSectionsCanonical,
    flatFieldsPrimary: false,
    flatFieldsDiagnosticOnly: true,
    canonicalWorkflowSummary: {
      workflowSectionsCanonical: canonicalWorkflow.workflowSectionsCanonical,
      flatFieldsPrimary: false,
      flatFieldsDiagnosticOnly: true,
      primaryControlFieldCount: canonicalWorkflow.fieldCount,
      duplicatePrimaryControlCount: canonicalWorkflow.duplicateFields.length,
      duplicateFields: canonicalWorkflow.duplicateFields,
      fieldLocations: canonicalWorkflow.fieldLocations,
      rawRowsExposed: false,
      writes: false,
    },
    fields,
    workflowSections,
    timelineStatusTest,
    specialPartsUserTest,
    selectorTestCase,
    donorFieldParity: payload.donorFieldParity || null,
    specialPartsEntitlementSummary: payload.specialPartsEntitlementSummary || null,
    presentationClassification,
    defaultAcceptance,
    donorShapeSelectedTiles,
    productSpine,
    payloadPreview,
    selectedResultProjection: selectedEngineResultHandoff.selectedResultProjection,
    selectedEngineResultHandoff,
    selectionTruthSummary,
    sourceSpecReadinessExplanation,
    disabledHandoffSummary,
    singleRunIntentCapture,
    runIntakePreview,
    runIntakePreviewReady: runIntakePreview.runIntakePreviewReady,
    runCount: runIntakePreview.runCount,
    totalQuantity: runIntakePreview.totalQuantity,
    completedRunCount: runIntakePreview.completedRunCount,
    incompleteRunCount: runIntakePreview.incompleteRunCount,
    safeRunIntentSummaries: runIntakePreview.safeRunIntentSummaries,
    runAccessoryPlacementPreview,
    runAccessoryPlacementPreviewReady: runAccessoryPlacementPreview.runAccessoryPlacementPreviewReady,
    accessoryIntentCount: runAccessoryPlacementPreview.accessoryIntentCount,
    runsWithAccessoryIntentCount: runAccessoryPlacementPreview.runsWithAccessoryIntentCount,
    unresolvedAccessoryIntentCount: runAccessoryPlacementPreview.unresolvedAccessoryIntentCount,
    safeRunAccessoryIntentSummaries: runAccessoryPlacementPreview.safeRunAccessoryIntentSummaries,
    lmTemperatureReadinessPreview,
    lmTemperatureReadinessPreviewReady: false,
    lightOutputIntentCopy: lmTemperatureReadinessPreview.visibleCopy,
    selectorWorkflowPreview,
    selectorWorkflowPreviewReady: selectorWorkflowPreview.selectorWorkflowPreviewReady,
    selectorWorkflowStageSummaries: selectorWorkflowPreview.stageSummaries,
    selectorWorkflowBlockedSummary: selectorWorkflowPreview.blockedSummary,
    selectorDownstreamReadinessSummary: selectorWorkflowPreview.downstreamReadinessSummary,
    accessoryReservationReady: false,
    enginePayloadReady: false,
    engineVerifyReady: false,
    runTableReady: false,
    iesReady: false,
    specBuildReadinessPreview,
    preEngineReadonlyActionEligibilityProjection,
    productSurfaceParityLock,
    manualConstraints,
    autoConsequences,
    blockedItems,
    candidateSummary: summary,
    candidateSummaryRows: createDbBackedCandidateSummaryRows({ ...payload, sourceReady, sourceReadiness, sourceVersionBinding, referenceOptionSourceCoverage, candidateSummary: summary, blockedItems }),
    manualConstraintRows: dbSelectedConstraintRows({ manualConstraints }),
    autoConsequenceRows: dbAutoConsequenceRows({ autoConsequences }),
    blockedRows: dbBlockedRows({ blockedItems }),
    pathRows: createDbBackedPathRows(payload),
    setFieldValue(fieldKey, value) {
      const label = dbOptionLabel(selectorReferenceStatus, fieldKey, value);
      const binding = dbOptionSourceVersionBinding(selectorReferenceStatus, fieldKey, value);
      selectorState?.setDbBackedSelectorFieldValue?.(fieldKey, value, label, binding);
      onLocalStateChange?.();
    },
    acceptDefaults() {
      selectorState?.acceptDbBackedSelectorDefaults?.(defaultAcceptance.eligibleDefaults || []);
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
  "Spec Ready incomplete",
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
  "Slug generation remains disabled unless an approved future Spec Ready state is reached.",
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
  "Spec Ready incomplete",
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
  "Spec Ready incomplete",
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
      ["spec_gate_summary", specReady ? "spec-ready candidate; production proof still not established" : "Spec Ready incomplete or future-gated; slug/spec generation disabled"],
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
  return "Spec Ready incomplete";
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
  reasons.push("Spec Ready is incomplete in this preview slice.");
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
      ["Spec Ready state", specGateState],
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
      ["Spec Ready incomplete", specReady ? "noted — candidate label only; production spec still disabled here" : "blocked — Spec Ready incomplete"],
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
      ["Spec Ready reached later", specReady ? "candidate-labelled only; not production authority" : "required later — incomplete here"],
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
      category === previewState || (category === "source readable" && sourceStatus.sourceReadableStatus === true) || (category === "Spec Ready incomplete" && !specReady)
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
      ["Spec Ready", fieldValues.spec_gate_status],
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
      title: "Spec Ready diagnostics",
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
        ["Spec Ready incomplete", boolString(!specReady)],
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

function createTimelineStatusTestControls(local = {}, selectorState, onLocalStateChange, selectorReferenceStatus = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  const filtering = payload.timelineStatusFiltering || {};
  const state = local.timelineStatusTest || {};
  const mode = state.timelineVisibilityMode || payload.timelineVisibilityMode || filtering.timelineVisibilityMode || "external-default";
  const asOfDate = state.timelineAsOfDate || payload.timelineAsOfDate || filtering.timelineAsOfDate || "";
  const visibleStatuses = Array.isArray(state.timelineVisibleStatuses) && state.timelineVisibleStatuses.length
    ? state.timelineVisibleStatuses
    : (Array.isArray(payload.timelineVisibleStatuses) ? payload.timelineVisibleStatuses : (Array.isArray(filtering.timelineVisibleStatuses) ? filtering.timelineVisibleStatuses : ["available", "approved"]));
  const statusOptions = Array.isArray(state.timelineVisibleStatusOptions) && state.timelineVisibleStatusOptions.length
    ? state.timelineVisibleStatusOptions
    : (Array.isArray(filtering.timelineVisibleStatusOptions) ? filtering.timelineVisibleStatusOptions : ["available", "approved", "staged", "roadmap", "obsolete", "unknown"]);
  return {
    title: "Internal timeline/status test mode",
    description: "Diagnostic GET-only controls. Future rows can appear for cascade testing only when status is selected and status_date is on/before the as-of date. Production actions remain blocked.",
    timelineVisibilityMode: mode,
    internalAsOfTestMode: mode === "internal-asof-test",
    timelineAsOfDate: asOfDate,
    timelineVisibleStatuses: [...visibleStatuses],
    timelineVisibleStatusOptions: [...statusOptions],
    productionActionsEnabled: false,
    engineEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    selectedResultPersistenceEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    rawRowsExposed: false,
    queryParamsOnly: true,
    setTimelineTestMode(enabled) {
      selectorState?.setSelectorTimelineTestMode?.(enabled === true ? "internal-asof-test" : "external-default");
      onLocalStateChange?.();
    },
    setTimelineAsOfDate(value) {
      selectorState?.setSelectorTimelineAsOfDate?.(value);
      onLocalStateChange?.();
    },
    setTimelineVisibleStatus(status, visible) {
      selectorState?.setSelectorTimelineVisibleStatus?.(status, visible);
      onLocalStateChange?.();
    },
  };
}

function normaliseSpecialPartsPrincipalOption(option) {
  if (option && typeof option === "object" && !Array.isArray(option)) {
    const value = String(option.value || option.email || "").trim();
    const label = String(option.label || value).trim() || value;
    return value ? { value, label } : null;
  }
  const value = String(option || "").trim();
  return value ? { value, label: value } : null;
}

function defaultSpecialPartsPrincipalOptions() {
  const atSign = String.fromCharCode(64);
  const allanEmail = "allan" + atSign + "zencontrol.com";
  const unknownEmail = "unknown" + atSign + "example.test";
  return [
    { value: allanEmail, label: `Allan Organ <${allanEmail}>` },
    { value: unknownEmail, label: `Unknown / unentitled <${unknownEmail}>` },
  ];
}

function specialPartsPrincipalOptions(summary = {}, state = {}) {
  const source = Array.isArray(summary.testPrincipalOptions) && summary.testPrincipalOptions.length
    ? summary.testPrincipalOptions
    : (Array.isArray(state.testPrincipalOptions) && state.testPrincipalOptions.length ? state.testPrincipalOptions : defaultSpecialPartsPrincipalOptions());
  return source.map(normaliseSpecialPartsPrincipalOption).filter(Boolean);
}

function specialPartsPrincipalLabel(options = [], value = "") {
  return options.find((option) => option.value === value)?.label || value;
}

function createSpecialPartsUserTestControls(local = {}, selectorState, onLocalStateChange, selectorReferenceStatus = {}, specialPartsEntitlementPreview = {}) {
  const payload = dbOptionsPayload(selectorReferenceStatus);
  const summary = payload.specialPartsUserTestSummary || selectorReferenceStatus.specialPartsUserTestSummary || {};
  const state = local.specialPartsUserTest || {};
  const testPrincipalOptions = specialPartsPrincipalOptions(summary, state);
  const activeTestPrincipal = state.testPrincipal || summary.activeTestPrincipalEmail || summary.activeTestPrincipal || "";
  const activeTestPrincipalLabel = summary.activeTestPrincipalLabel || specialPartsPrincipalLabel(testPrincipalOptions, activeTestPrincipal);
  const showEntitlementBackedSpecialParts = state.showEntitlementBackedSpecialParts === true || summary.showEntitlementBackedSpecialParts === true;
  const entitlementFound = summary.entitlementFound === true;
  const specialPartsVisible = summary.specialPartsVisible === true && specialPartsEntitlementPreview.entitlementStatus !== "none";
  const identity = summary.safeIdentitySummary || {};
  const safeIdentitySummary = {
    firstName: identity.firstName || "",
    lastName: identity.lastName || "",
    company: identity.company || "",
    entitlementFound,
    specialPartsVisible,
  };
  return {
    title: "Internal special-parts user/principal test mode",
    description: "Diagnostic GET-only control. Selecting a test principal does not create entitlement; special parts appear only when the safe entitlement summary finds entitlement and the toggle is enabled. Production outputs remain blocked.",
    testPrincipalOptions: testPrincipalOptions.map((option) => ({ ...option })),
    activeTestPrincipal,
    activeTestPrincipalEmail: activeTestPrincipal,
    activeTestPrincipalLabel,
    safeIdentitySummary,
    showEntitlementBackedSpecialParts,
    entitlementFound,
    specialPartsVisible,
    status: summary.status || "external-default",
    redactedEntitlementCount: summary.redactedEntitlementCount || 0,
    entitlementBackedCandidateCount: summary.entitlementBackedCandidateCount || 0,
    candidateRows: specialPartsVisible && Array.isArray(specialPartsEntitlementPreview.candidateRows) ? specialPartsEntitlementPreview.candidateRows : [],
    productionActionsEnabled: false,
    engineEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    selectedResultPersistenceEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    rawRowsExposed: false,
    rawUsersExposed: false,
    rawContactsExposed: false,
    rawPayloadsExposed: false,
    queryParamsOnly: true,
    setTestPrincipal(value) {
      selectorState?.setSpecialPartsTestPrincipal?.(value);
      onLocalStateChange?.();
    },
    setShowEntitlementBackedSpecialParts(enabled) {
      selectorState?.setShowEntitlementBackedSpecialParts?.(enabled === true);
      onLocalStateChange?.();
    },
  };
}

function createSelectorTestCaseControls(local = {}, selectorTestCaseActions = {}) {
  const state = local.selectorTestCase || {};
  return {
    title: state.title || "Selector test-case save / recall",
    description: "Local Selector test case only — not a production Project save.",
    storageKey: state.storageKey || "controlstack.cs-selector.local-test-case.v1",
    storageKind: state.storageKind || "browser-local-storage",
    status: state.status || "no-saved-test-case",
    savedTestCasePresent: state.savedTestCasePresent === true,
    savedAt: state.savedAt || "",
    summary: state.summary || null,
    summaryRows: Array.isArray(state.summaryRows) ? state.summaryRows.map((row) => [...row]) : [
      ["saved test case", "none"],
      ["scope", "browser-local Selector test state only"],
      ["production Project save", "false"],
      ["storage", "localStorage only when available"],
    ],
    boundaryCopy: Array.isArray(state.boundaryCopy) ? [...state.boundaryCopy] : [
      "Local Selector test case only — not a production Project save.",
      "Browser-local storage only; no RuntimeData mutation, no server persistence, and no POST endpoint.",
      "Recall rehydrates safe local constraints and reloads source-backed options; compatibility checks still apply.",
      "Blocked or stale recalled values are preserved for review rather than faked as valid.",
    ],
    localStorageOnly: true,
    productionProjectSave: false,
    runtimeDataMutationEnabled: false,
    serverPersistenceEnabled: false,
    postEndpointsEnabled: false,
    selectedResultPersistenceEnabled: false,
    engineReadinessEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    projectExportEnabled: false,
    hubSpotWriteEnabled: false,
    writes: false,
    generation: false,
    proof: false,
    saveCurrentTestCase() {
      selectorTestCaseActions.saveCurrentTestCase?.();
    },
    recallSavedTestCase() {
      selectorTestCaseActions.recallSavedTestCase?.();
    },
    clearSavedTestCase() {
      selectorTestCaseActions.clearSavedTestCase?.();
    },
  };
}

function createSelectorExpanderShell(local = {}, selectorState, onLocalStateChange, selectorReferenceStatus = {}, selectorSurface = null) {
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
    manualConstraintBehaviour: createManualConstraintBehaviour(stateContract, selectorState, onLocalStateChange, selectorSurface),
    timelineStatusTest: selectorSurface?.timelineStatusTest || createTimelineStatusTestControls(local, selectorState, onLocalStateChange, selectorReferenceStatus),
    specialPartsUserTest: selectorSurface?.specialPartsUserTest || createSpecialPartsUserTestControls(local, selectorState, onLocalStateChange, selectorReferenceStatus),
    readinessDiagnostics: createSelectorReadinessDiagnostics(stateContract),
    readonlyResolverPreview,
    setSectionOpen(sectionId, open) {
      selectorState?.setExpanderSectionOpen?.(sectionId, open);
    },
  };
}

export function createSelectorViewModel({ adapter, selectorState, selectorReferenceStatus = {}, onLocalStateChange, selectorTestCaseActions = {} } = {}) {
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
  const selectorReferencePayload = dbOptionsPayload(selectorReferenceStatus);
  const specialPartsUserTestSummary = selectorReferencePayload.specialPartsUserTestSummary || selectorReferenceStatus.specialPartsUserTestSummary || {};
  const effectiveSpecialPartsEntitlement = specialPartsUserTestEntitlementProjection(specialPartsUserTestSummary, specialPartsEntitlement);
  const passiveSelectorSelectionContext = buildPassiveSelectorSelectionContext({ local, timelinePolicy, projectRequirementDate });
  const baseSafeRoleContext = {
    displayRole: shellDisplayRole(authority, identity, snapshots.visibility),
    requestedDisplayRole: shellRequestedDisplayRole(authority, identity, snapshots.visibility),
    actualRole: authorityActualRole(authority, identity),
    roleAuthority: authorityActualRoleSource(authority, identity),
    displayRoleClamped: shellDisplayRoleClamped(authority, identity, snapshots.visibility) === true,
    source: authority.source || "shell-safe-fallback",
  };
  const baseSafeIdentityContext = {
    status: identity.status || "unknown",
    identityState: identity.identityState || "external_anonymous",
    classification: identity.classification || "anonymous",
    authorityStatus: authority.status || "fallback",
    identityAuthority: effectiveSpecialPartsEntitlement.identityAuthority || (effectiveSpecialPartsEntitlement.userEmailMatched === true ? "matched-redacted" : identity.identityState || "external_anonymous"),
    matchedRedacted: effectiveSpecialPartsEntitlement.matchedRedacted === true || effectiveSpecialPartsEntitlement.userEmailMatched === true,
    candidate: effectiveSpecialPartsEntitlement.identityCandidate === true,
  };
  const safeRoleContext = specialPartsUserTestRoleContext(baseSafeRoleContext, specialPartsUserTestSummary);
  const safeIdentityContext = specialPartsUserTestIdentityContext(baseSafeIdentityContext, specialPartsUserTestSummary);
  const specialPartsEntitlementPreview = buildSelectorSpecialPartsEntitlementPreview({
    safeRoleContext,
    safeIdentityContext,
    redactedEntitlementProjection: safeRedactedEntitlementProjection(effectiveSpecialPartsEntitlement),
    specialPartsOptInPreview: specialPartsOptIn,
    selectedBlockedValues: safeSelectedBlockedValues(local, selectorReferenceStatus),
    selectorSelectionContext: passiveSelectorSelectionContext,
    timelineStatusMetadata: {
      status: timelinePolicy.status || "unavailable",
      allowedStatuses: timelinePolicy.statusPolicy?.allowedStatuses || [],
      selectorTimelineStatus: selectorTimelineContext.status || "passive-consumer",
    },
    downstreamWriteFlags: {
      activeBuildMutationEnabled: false,
      hubSpotWriteEnabled: readWriteEnabled(crmWritePolicy) === true,
      contactCreationEnabled: crm.contactCreation?.enabled === true,
    },
  });
  const specialPartsCompatibilityResults = specialPartsEntitlementPreview.safeCompatibilityResults || [];
  const specialPartsCompatibilitySummary = {
    status: specialPartsEntitlementPreview.entitlementStatus === "none" ? "empty" : specialPartsEntitlementPreview.entitlementStatus,
    compatibleCount: specialPartsEntitlementPreview.compatibleRedactedCandidateCount,
    incompatibleCount: specialPartsEntitlementPreview.blockedRedactedCandidateCount,
    unknownCount: specialPartsEntitlementPreview.reviewRequiredCount,
  };
  const timelineFiltering = summarizeTimelineFiltering({
    local,
    selectorDownstream,
    timelinePolicy,
    selectorTimelineContext,
    projectRequirementDate,
    timelineAccess,
  });
  const selectorSurface = createDbBackedSelectorSurface(selectorReferenceStatus, local, selectorState, onLocalStateChange, snapshots, {
    timelineFiltering,
    specialPartsEntitlementPreview,
    specialPartsUserTestSummary,
    selectorTestCaseActions,
  });

  return {
    moduleId: adapter.moduleId,
    phase: snapshots.diagnostics?.phase || "selector-fed-downstream-context-foundation",
    route: snapshots.route,
    local,
    selectorSurface,
    selectorWorkflowPreview: selectorSurface.selectorWorkflowPreview,
    selectorWorkflowPreviewReady: selectorSurface.selectorWorkflowPreviewReady,
    selectorWorkflowStageSummaries: selectorSurface.selectorWorkflowStageSummaries,
    selectorWorkflowBlockedSummary: selectorSurface.selectorWorkflowBlockedSummary,
    selectorDownstreamReadinessSummary: selectorSurface.selectorDownstreamReadinessSummary,
    specialPartsUserTest: selectorSurface.specialPartsUserTest,
    selectorTestCase: selectorSurface.selectorTestCase,
    singleRunIntentCapture: selectorSurface.singleRunIntentCapture,
    runIntakePreview: selectorSurface.runIntakePreview,
    runIntakePreviewReady: selectorSurface.runIntakePreviewReady,
    lmTemperatureReadinessPreview: selectorSurface.lmTemperatureReadinessPreview,
    lmTemperatureReadinessPreviewReady: false,
    selectorControls: createManualConstraintBehaviour(selectorStateContractFromLocal(local), selectorState, onLocalStateChange, selectorSurface),
    selectorDiagnostics: {
      readiness: createSelectorReadinessDiagnostics(selectorStateContractFromLocal(local)),
      readonlyResolverPreview: createSelectorReadonlyResolverPreview(selectorStateContractFromLocal(local), selectorReferenceStatus),
    },
    timelineStatusTest: selectorSurface.timelineStatusTest,
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
      specialPartsEntitledCount: specialPartsEntitlementPreview.redactedEntitlementCount,
      specialPartsReadOnly: stateLabel(specialPartsEntitlement.readOnly !== false),
      specialPartsEntitlementPreviewReady: stateLabel(specialPartsEntitlementPreview.specialPartsEntitlementPreviewReady),
      specialPartsEntitlementPreviewStatus: specialPartsEntitlementPreview.entitlementStatus,
      specialPartsDisplayRole: specialPartsEntitlementPreview.displayRole,
      specialPartsRoleAuthority: specialPartsEntitlementPreview.roleAuthority,
      specialPartsRedactedEntitlementCount: specialPartsEntitlementPreview.redactedEntitlementCount,
      specialPartsCompatibleRedactedCandidateCount: specialPartsEntitlementPreview.compatibleRedactedCandidateCount,
      specialPartsBlockedRedactedCandidateCount: specialPartsEntitlementPreview.blockedRedactedCandidateCount,
      specialPartsReviewRequiredCount: specialPartsEntitlementPreview.reviewRequiredCount,
      specialPartsRawUsersReturned: stateLabel(specialPartsEntitlementPreview.rawUsersReturned),
      specialPartsRawContactsReturned: stateLabel(specialPartsEntitlementPreview.rawContactsReturned),
      specialPartsRawCrmReturned: stateLabel(specialPartsEntitlementPreview.rawCrmReturned),
      specialPartsRawComponentRowsReturned: stateLabel(specialPartsEntitlementPreview.rawComponentRowsReturned),
      specialPartsPrivatePathsReturned: stateLabel(specialPartsEntitlementPreview.privatePathsReturned),
      specialPartsCredentialsReturned: stateLabel(specialPartsEntitlementPreview.credentialsReturned),
      specialPartsTestPrincipal: selectorSurface.specialPartsUserTest?.activeTestPrincipal || "none",
      specialPartsTestEntitlementFound: stateLabel(selectorSurface.specialPartsUserTest?.entitlementFound),
      specialPartsTestVisible: stateLabel(selectorSurface.specialPartsUserTest?.specialPartsVisible),
      specialPartsTestProductionOutputs: selectorSurface.specialPartsUserTest?.productionActionsEnabled === true ? "enabled" : "blocked",
      specialPartsTestRawUsersExposed: stateLabel(selectorSurface.specialPartsUserTest?.rawUsersExposed),
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
    specialPartsEntitlementPreview,
    specialPartsEntitlementPreviewReady: specialPartsEntitlementPreview.specialPartsEntitlementPreviewReady,
    specialPartsEntitlementDiagnostics: specialPartsEntitlementPreview.diagnostics,
    blockedDownstreamWriteFlags: specialPartsEntitlementPreview.blockedDownstreamWriteFlags,
    specialPartsCompatibility: {
      status: specialPartsCompatibilitySummary.status,
      source: "selector-view-model-safe-entitlement-preview",
      live: "passive",
      filteringLive: false,
      optInLive: false,
      buildMutationLive: false,
      entitledCount: specialPartsEntitlementPreview.redactedEntitlementCount,
      redactedEntitlementCount: specialPartsEntitlementPreview.redactedEntitlementCount,
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
      "Save is shell-owned and live through Project Browser",
      "Restore and hydrate are shell-owned and live through Project Browser",
      "Handoff and share remain shell-owned and deferred",
      "CRM and provider writes remain shell-owned and deferred",
      "Timeline filtering and warnings are selector-local active diagnostics",
      "Special-parts compatibility helper is wired passively into the view model only",
      "Special-parts entitlement lookup, opt-in, slug mutation, and build mutation are deferred",
    ],
    responsiveNote: "Selector panel uses module-local sections that can stack inside the shell-owned responsive layout.",
  };
}