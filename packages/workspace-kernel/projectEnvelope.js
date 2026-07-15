import { stableFingerprint } from "./stableFingerprint.js";

export const SAVED_PROJECT_SCHEMA = "workspace_saved_project.v2-runtime";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoNow() {
  return new Date().toISOString();
}

function safeId(value, fallback = "runtime-project") {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function readProjectTitle(project = {}) {
  return project.metadata?.title || project.currentProject?.title || "Untitled project";
}

function readProjectId(project = {}) {
  return project.metadata?.projectId || project.currentProject?.projectId || "runtime-project";
}

function readClient(project = {}) {
  return project.currentProject?.client || project.metadata?.client || "No client loaded";
}

function readSite(project = {}) {
  return project.currentProject?.site || project.metadata?.site || "No site loaded";
}

function readSavedBy(identity = {}) {
  return {
    identityState: identity.identityState || "external_anonymous",
    classification: identity.classification || "anonymous",
    actualRole: identity.actualRole || "external_user",
    derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
    actualRoleSource: identity.actualRoleSource || "unknown",
    displayRole: identity.displayRole || identity.role || "external_user",
    displayRoleClamped: identity.displayRoleClamped === true,
    name: identity.currentUser?.name || "Workspace User",
    email: identity.currentUser?.email || null,
  };
}

const CS_SELECTOR_PROJECT_ENVELOPE_STATE_KEYS = Object.freeze([
  "kind",
  "version",
  "selectedCategory",
  "expanderSections",
  "manualConstraints",
  "timelineStatusTest",
  "specialPartsUserTest",
  "safety",
]);

const CS_SELECTOR_PROJECT_ENVELOPE_EXPANDER_KEYS = Object.freeze([
  "projectMetadata",
  "system",
  "environment",
  "lightControl",
  "mounting",
  "penetrationsWiring",
  "finishes",
  "egressAccessories",
  "runs",
  "timelineDiagnostics",
  "pureReferenceDiagnosticLater",
]);

const CS_SELECTOR_PROJECT_ENVELOPE_MANUAL_CONSTRAINT_KEYS = Object.freeze(new Set([
  "system",
  "application",
  "interiorExterior",
  "optic",
  "controlType",
  "driver",
  "ipRating",
  "ikRating",
  "mountStyle",
  "bodyFinish",
  "emergency",
  "sensor",
  "specialParts",
  "tier",
  "variantKey",
  "emission",
  "directCapability",
  "indirectCapability",
  "opticSub",
  "opticIndirect",
  "diffuserVar1",
  "diffuserVar2",
  "directOpticVar1",
  "directOpticVar2",
  "indirectOpticVar1",
  "indirectOpticVar2",
  "electricalClass",
  "ambient",
  "targetLmPerM",
  "cctCri",
  "indirectMatchDirect",
  "targetLmPerMIndirect",
  "cctCriIndirect",
  "controlTypeIndirect",
  "mountSelection",
  "mountParticulars",
  "powerPenetration",
  "powerLocation",
  "flexLength",
  "wiringType",
  "finishDefault",
  "finishCover",
  "finishEnd",
  "finishFlex",
  "egressLight",
  "egressSound",
  "accessories",
  "specialPartsEntitlement",
  "specialPartsOptIn",
  "userEntitlementStatus",
]));

const CS_SELECTOR_PROJECT_ENVELOPE_CONSTRAINT_KEYS = Object.freeze([
  "fieldKey",
  "value",
  "valueLabel",
  "kind",
  "source",
  "mutable",
  "writes",
]);

const CS_SELECTOR_PROJECT_ENVELOPE_TIMELINE_KEYS = Object.freeze([
  "timelineVisibilityMode",
  "timelineAsOfDate",
  "timelineVisibleStatuses",
  "readOnly",
  "diagnosticOnly",
  "queryParamsOnly",
  "productionActionsEnabled",
]);

const CS_SELECTOR_PROJECT_ENVELOPE_SPECIAL_PARTS_KEYS = Object.freeze([
  "testPrincipal",
  "showEntitlementBackedSpecialParts",
  "readOnly",
  "diagnosticOnly",
  "queryParamsOnly",
  "productionActionsEnabled",
]);

const CS_SELECTOR_PROJECT_ENVELOPE_SAFETY_KEYS = Object.freeze([
  "serialisableUiStateOnly",
  "rawOptionRowsIncluded",
  "sourceRowsIncluded",
  "engineCandidatesIncluded",
  "resultsIncluded",
  "generatedOutputsIncluded",
  "runtimeDataMutationEnabled",
  "serverPersistenceEnabled",
  "writes",
]);

const CS_SELECTOR_PROJECT_ENVELOPE_TIMELINE_STATUSES = Object.freeze(new Set([
  "available",
  "approved",
  "staged",
  "roadmap",
  "obsolete",
  "unknown",
]));

export const CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_CONTRACT_ID =
  "SHELL-CS-SELECTOR-FIRST-PRE-ENGINE-READONLY-ACTION-ELIGIBILITY-BRIDGE-1";
export const CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID =
  "controlstack.selector.pre-engine-readonly-action-eligibility.v1";
export const CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION = 1;
export const CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER = Object.freeze([
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

const CS_SELECTOR_PRE_ENGINE_FACTORY_SUMMARY_KEYS = Object.freeze([
  "readOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "factoryApprovedInputsReady",
  "ready",
  "stage3Mode",
  "blocker",
  "stage2Ready",
  "committedSelectorConstraintCount",
  "committedRunIntakeSummary",
  "accessoryReservationRequired",
  "engineOutcomeProven",
  "engineExecuted",
  "donorEngineInvoked",
  "runTableGenerated",
  "iesGenerated",
  "selectedResultPersisted",
  "runtimeDataMutated",
]);
const CS_SELECTOR_PRE_ENGINE_RUN_SUMMARY_KEYS = Object.freeze([
  "ready",
  "committedRunIntakeReady",
  "sourceAuthority",
  "runQuantity",
  "runLengthMm",
  "lengthMode",
  "writes",
  "rawRowsExposed",
]);
const CS_SELECTOR_PRE_ENGINE_CONSTRAINT_KEYS = Object.freeze([
  "fieldKey",
  "value",
  "valueLabel",
  "committedSelectorState",
  "blocked",
  "authoritySource",
  "provenance",
  "kind",
  "source",
]);
const CS_SELECTOR_PRE_ENGINE_LM_PREVIEW_KEYS = Object.freeze([
  "targetIntent",
  "cctCriPairing",
  "controlIntent",
  "fingerprint",
  "temperatureAdjustedOutputCalculated",
  "deliveredLmPerMVerified",
  "rawRowsReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
]);
const CS_SELECTOR_PRE_ENGINE_INTENT_PAIR_KEYS = Object.freeze(["direct", "indirect"]);
const CS_SELECTOR_PRE_ENGINE_INTENT_KEYS = Object.freeze(["ready", "valueLabel"]);
const CS_SELECTOR_PRE_ENGINE_CANDIDATE_FINGERPRINT_PATTERN =
  /^safe-selector-readonly-engine-candidate:[0-9a-f]{40}$/;
const CS_SELECTOR_PRE_ENGINE_PROJECTION_FINGERPRINT_PATTERN =
  /^safe-selector-pre-engine-readonly-action-eligibility:[0-9a-f]{40}$/;
const CS_SELECTOR_PRE_ENGINE_REGISTRATION_STATUS = "pre-engine-action-source-ready";
const CS_SELECTOR_PRE_ENGINE_REGISTRATION_CONTRIBUTION_KEYS = Object.freeze([
  "moduleId",
  "status",
  "state",
  "preEngineActionEligibilityProjection",
  "selectedResultSummary",
  "runTableFirstNarrowOutputSummary",
]);

const CS_SELECTOR_PROJECT_ENVELOPE_FORBIDDEN_VALUE_PATTERN = /(?:C:\\|\\ControlStack|\/mnt\/|novondb|raw_rows|rawRows|rawPayload|selectedResult|engineResult|credential|secret|apiKey)/i;

function plainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function exactKeys(value, allowedKeys) {
  if (!plainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...allowedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function safeSelectorEnvelopeString(value, { maxLength = 512, pattern = null } = {}) {
  if (typeof value !== "string" || value.length > maxLength) return false;
  if (pattern && !pattern.test(value)) return false;
  return !CS_SELECTOR_PROJECT_ENVELOPE_FORBIDDEN_VALUE_PATTERN.test(value);
}

function safeNullableSelectorEnvelopeString(value, options = {}) {
  return value === null || safeSelectorEnvelopeString(value, options);
}

function approvedPreEngineIntent(intent) {
  return exactKeys(intent, CS_SELECTOR_PRE_ENGINE_INTENT_KEYS)
    && typeof intent.ready === "boolean"
    && safeSelectorEnvelopeString(intent.valueLabel, { maxLength: 512 });
}

function approvedPreEngineIntentPair(pair) {
  return exactKeys(pair, CS_SELECTOR_PRE_ENGINE_INTENT_PAIR_KEYS)
    && approvedPreEngineIntent(pair.direct)
    && approvedPreEngineIntent(pair.indirect);
}

function projectionFingerprintSource(projection) {
  return Object.fromEntries(
    CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER
      .filter((key) => key !== "projectionFingerprint")
      .map((key) => [key, projection[key]]),
  );
}

export function validateCsSelectorPreEngineActionEligibilityProjection(
  projection,
  { requireReady = false, requireFrozen = false } = {},
) {
  if (!exactKeys(projection, CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER)) {
    return { valid: false, reason: "Selector pre-Engine eligibility projection shape is invalid." };
  }
  if (requireFrozen && !Object.isFrozen(projection)) {
    return { valid: false, reason: "Selector pre-Engine eligibility projection is not frozen." };
  }
  if (projection.schemaId !== CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID
    || projection.schemaVersion !== CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION
    || projection.contractId !== CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_CONTRACT_ID) {
    return { valid: false, reason: "Selector pre-Engine eligibility projection schema is invalid." };
  }
  const ready = projection.state === "selector_pre_engine_readonly_action_eligibility_ready"
    && projection.readiness === "ready"
    && projection.ready === true
    && projection.blocker === null;
  const blocked = projection.state
      === "selector_pre_engine_readonly_action_eligibility_blocked_fail_closed"
    && projection.readiness === "blocked_fail_closed"
    && projection.ready === false
    && safeSelectorEnvelopeString(projection.blocker || "", { maxLength: 760 });
  if (!ready && !blocked) {
    return { valid: false, reason: "Selector pre-Engine eligibility state is inconsistent." };
  }
  if (requireReady && !ready) {
    return { valid: false, reason: projection.blocker || "Selector pre-Engine eligibility is not ready." };
  }
  const factory = projection.factoryApprovedInputsSummary;
  const run = factory?.committedRunIntakeSummary;
  if (!exactKeys(factory, CS_SELECTOR_PRE_ENGINE_FACTORY_SUMMARY_KEYS)
    || !exactKeys(run, CS_SELECTOR_PRE_ENGINE_RUN_SUMMARY_KEYS)
    || factory.readOnly !== true
    || factory.diagnosticOnly !== true
    || factory.safeSummaryOnly !== true
    || !safeSelectorEnvelopeString(factory.stage3Mode, { maxLength: 120 })
    || !safeNullableSelectorEnvelopeString(factory.blocker, { maxLength: 760 })
    || !Number.isSafeInteger(factory.committedSelectorConstraintCount)
    || factory.committedSelectorConstraintCount < 0
    || typeof factory.accessoryReservationRequired !== "boolean"
    || factory.engineOutcomeProven !== false
    || factory.engineExecuted !== false
    || factory.donorEngineInvoked !== false
    || factory.runTableGenerated !== false
    || factory.iesGenerated !== false
    || factory.selectedResultPersisted !== false
    || factory.runtimeDataMutated !== false
    || !safeSelectorEnvelopeString(run.sourceAuthority, { maxLength: 760 })
    || !Number.isSafeInteger(run.runQuantity)
    || run.runQuantity < 0
    || !Number.isSafeInteger(run.runLengthMm)
    || run.runLengthMm < 0
    || !safeSelectorEnvelopeString(run.lengthMode, { maxLength: 120 })
    || run.writes !== false
    || run.rawRowsExposed !== false) {
    return { valid: false, reason: "Selector pre-Engine factory-approved input summary is invalid." };
  }
  if (!Array.isArray(projection.committedSelectorConstraints)
    || projection.committedSelectorConstraints.length > 256
    || projection.committedSelectorConstraints.some((constraint) => (
      !exactKeys(constraint, CS_SELECTOR_PRE_ENGINE_CONSTRAINT_KEYS)
      || !safeSelectorEnvelopeString(constraint.fieldKey, { maxLength: 120 })
      || !safeSelectorEnvelopeString(constraint.value, { maxLength: 512 })
      || !safeSelectorEnvelopeString(constraint.valueLabel, { maxLength: 512 })
      || constraint.committedSelectorState !== true
      || constraint.blocked !== false
      || !safeSelectorEnvelopeString(constraint.authoritySource, { maxLength: 760 })
      || !safeSelectorEnvelopeString(constraint.provenance, { maxLength: 760 })
      || !safeSelectorEnvelopeString(constraint.kind, { maxLength: 120 })
      || !safeSelectorEnvelopeString(constraint.source, { maxLength: 760 })
    ))) {
    return { valid: false, reason: "Selector pre-Engine committed constraints are invalid." };
  }
  const lmPreview = projection.lmTemperatureReadinessPreview;
  if (!exactKeys(lmPreview, CS_SELECTOR_PRE_ENGINE_LM_PREVIEW_KEYS)
    || !approvedPreEngineIntentPair(lmPreview.targetIntent)
    || !approvedPreEngineIntentPair(lmPreview.cctCriPairing)
    || !approvedPreEngineIntentPair(lmPreview.controlIntent)
    || !safeNullableSelectorEnvelopeString(lmPreview.fingerprint, { maxLength: 760 })
    || lmPreview.temperatureAdjustedOutputCalculated !== false
    || lmPreview.deliveredLmPerMVerified !== false
    || lmPreview.rawRowsReturned !== false
    || lmPreview.rawEnginePayloadReturned !== false
    || lmPreview.rawEngineResultReturned !== false) {
    return { valid: false, reason: "Selector pre-Engine light-intent preview is invalid." };
  }
  for (const value of [
    projection.policyFingerprint,
    projection.sourceFingerprint,
    projection.selectorStateFingerprint,
    projection.referenceOptionsFingerprint,
  ]) {
    if (!safeSelectorEnvelopeString(value, { maxLength: 760 })) {
      return { valid: false, reason: "Selector pre-Engine identity fingerprint is invalid." };
    }
  }
  if (!safeNullableSelectorEnvelopeString(projection.sourceInputFingerprint, { maxLength: 760 })
    || !safeNullableSelectorEnvelopeString(projection.boardDataSourceVersion, { maxLength: 760 })
    || !Number.isSafeInteger(projection.committedSelectorConstraintCount)
    || projection.committedSelectorConstraintCount !== projection.committedSelectorConstraints.length
    || !Number.isSafeInteger(projection.runCount)
    || projection.runCount < 0
    || !Number.isSafeInteger(projection.totalQuantity)
    || projection.totalQuantity < 0
    || !Number.isSafeInteger(projection.accessoryIntentCount)
    || projection.accessoryIntentCount < 0) {
    return { valid: false, reason: "Selector pre-Engine identity or count fields are invalid." };
  }
  if (ready && (projection.runIntakePreviewReady !== true
    || projection.factoryApprovedInputsReady !== true
    || projection.candidateMapperReady !== true
    || factory.factoryApprovedInputsReady !== true
    || factory.ready !== true
    || factory.stage2Ready !== true
    || run.ready !== true
    || run.committedRunIntakeReady !== true
    || !CS_SELECTOR_PRE_ENGINE_CANDIDATE_FINGERPRINT_PATTERN.test(
      String(projection.candidateFingerprint || ""),
    ))) {
    return { valid: false, reason: "Selector pre-Engine Stage-3 authority is incomplete." };
  }
  if (!ready && projection.candidateFingerprint !== null
    && !CS_SELECTOR_PRE_ENGINE_CANDIDATE_FINGERPRINT_PATTERN.test(
      String(projection.candidateFingerprint),
    )) {
    return { valid: false, reason: "Selector pre-Engine candidate fingerprint is invalid." };
  }
  if (!CS_SELECTOR_PRE_ENGINE_PROJECTION_FINGERPRINT_PATTERN.test(
    String(projection.projectionFingerprint || ""),
  ) || projection.projectionFingerprint !== stableFingerprint(
    "safe-selector-pre-engine-readonly-action-eligibility",
    projectionFingerprintSource(projection),
  )) {
    return { valid: false, reason: "Selector pre-Engine projection fingerprint is invalid." };
  }
  try {
    if (JSON.stringify(projection).length > 65536) {
      return { valid: false, reason: "Selector pre-Engine eligibility projection is too large." };
    }
  } catch {
    return { valid: false, reason: "Selector pre-Engine eligibility projection is not serialisable." };
  }
  return { valid: true, ready, reason: ready ? null : projection.blocker };
}

function approvedSelectorEnvelopeConstraint(fieldKey, constraint) {
  return CS_SELECTOR_PROJECT_ENVELOPE_MANUAL_CONSTRAINT_KEYS.has(fieldKey)
    && exactKeys(constraint, CS_SELECTOR_PROJECT_ENVELOPE_CONSTRAINT_KEYS)
    && constraint.fieldKey === fieldKey
    && safeSelectorEnvelopeString(constraint.value)
    && safeSelectorEnvelopeString(constraint.valueLabel)
    && constraint.kind === "manual-constraint"
    && constraint.source === "Selector Project-envelope restored UI constraint"
    && constraint.mutable === true
    && constraint.writes === false;
}

function approvedSelectorEnvelopeTimeline(value) {
  return exactKeys(value, CS_SELECTOR_PROJECT_ENVELOPE_TIMELINE_KEYS)
    && ["external-default", "internal-asof-test"].includes(value.timelineVisibilityMode)
    && safeSelectorEnvelopeString(value.timelineAsOfDate, {
      maxLength: 10,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    })
    && Array.isArray(value.timelineVisibleStatuses)
    && value.timelineVisibleStatuses.length > 0
    && value.timelineVisibleStatuses.length <= CS_SELECTOR_PROJECT_ENVELOPE_TIMELINE_STATUSES.size
    && new Set(value.timelineVisibleStatuses).size === value.timelineVisibleStatuses.length
    && value.timelineVisibleStatuses.every((status) => CS_SELECTOR_PROJECT_ENVELOPE_TIMELINE_STATUSES.has(status))
    && value.readOnly === true
    && value.diagnosticOnly === true
    && value.queryParamsOnly === true
    && value.productionActionsEnabled === false;
}

function approvedSelectorEnvelopeSpecialParts(value) {
  return exactKeys(value, CS_SELECTOR_PROJECT_ENVELOPE_SPECIAL_PARTS_KEYS)
    && safeSelectorEnvelopeString(value.testPrincipal, { maxLength: 254 })
    && typeof value.showEntitlementBackedSpecialParts === "boolean"
    && value.readOnly === true
    && value.diagnosticOnly === true
    && value.queryParamsOnly === true
    && value.productionActionsEnabled === false;
}

function approvedSelectorEnvelopeSafety(value) {
  return exactKeys(value, CS_SELECTOR_PROJECT_ENVELOPE_SAFETY_KEYS)
    && value.serialisableUiStateOnly === true
    && value.rawOptionRowsIncluded === false
    && value.sourceRowsIncluded === false
    && value.engineCandidatesIncluded === false
    && value.resultsIncluded === false
    && value.generatedOutputsIncluded === false
    && value.runtimeDataMutationEnabled === false
    && value.serverPersistenceEnabled === false
    && value.writes === false;
}

function approvedCsSelectorProjectState(state) {
  if (!exactKeys(state, CS_SELECTOR_PROJECT_ENVELOPE_STATE_KEYS)) return false;
  if (state.kind !== "cs-selector-project-envelope-ui-state" || state.version !== 1) return false;
  if (!safeSelectorEnvelopeString(state.selectedCategory, {
    maxLength: 64,
    pattern: /^[a-z0-9_-]+$/,
  })) return false;
  if (!exactKeys(state.expanderSections, CS_SELECTOR_PROJECT_ENVELOPE_EXPANDER_KEYS)
    || Object.values(state.expanderSections).some((open) => typeof open !== "boolean")) return false;
  if (!plainObject(state.manualConstraints)
    || Object.entries(state.manualConstraints).some(([fieldKey, constraint]) => !approvedSelectorEnvelopeConstraint(fieldKey, constraint))) return false;
  if (!approvedSelectorEnvelopeTimeline(state.timelineStatusTest)) return false;
  if (!approvedSelectorEnvelopeSpecialParts(state.specialPartsUserTest)) return false;
  if (!approvedSelectorEnvelopeSafety(state.safety)) return false;
  try {
    return JSON.stringify(state).length <= 32768;
  } catch {
    return false;
  }
}

function approvedCsSelectorPreEngineRegistrationContribution(contribution) {
  if (!exactKeys(
    contribution,
    CS_SELECTOR_PRE_ENGINE_REGISTRATION_CONTRIBUTION_KEYS,
  )) return { valid: false, reason: "Selector pre-Engine registration contribution shape is invalid." };
  if (contribution.moduleId !== "cs_selector"
    || contribution.status !== CS_SELECTOR_PRE_ENGINE_REGISTRATION_STATUS
    || !plainObject(contribution.state)
    || Object.keys(contribution.state).length !== 0
    || !plainObject(contribution.selectedResultSummary)
    || Object.keys(contribution.selectedResultSummary).length !== 0
    || !plainObject(contribution.runTableFirstNarrowOutputSummary)
    || Object.keys(contribution.runTableFirstNarrowOutputSummary).length !== 0) {
    return {
      valid: false,
      reason: "Selector pre-Engine registration contribution must contain empty UI and post-Engine placeholders.",
    };
  }
  return validateCsSelectorPreEngineActionEligibilityProjection(
    contribution.preEngineActionEligibilityProjection,
    { requireReady: true, requireFrozen: true },
  );
}

function createModuleEnvelope({ moduleId, owner = moduleId, status = "empty", state = {}, downstreamContext = null, reason = "Module save contributor not implemented yet." } = {}) {
  return {
    owner,
    moduleId,
    status,
    state: clone(state || {}),
    downstreamContext: downstreamContext ? clone(downstreamContext) : null,
    savedAt: isoNow(),
    reason: status === "empty" ? reason : null,
  };
}

function createModuleEnvelopeSet({ downstream = {}, moduleContributions = {} } = {}) {
  const selectorContribution = moduleContributions.cs_selector || {};
  const sceneBuilderContribution = moduleContributions.scene_builder || {};
  const emergenceContribution = moduleContributions.emergence || {};
  const selectorUiStateContribution = selectorContribution.status === "saved-ui-state";
  const selectorPreEngineRegistrationContribution =
    selectorContribution.status === CS_SELECTOR_PRE_ENGINE_REGISTRATION_STATUS;
  const selectorProjectionProvided = Object.prototype.hasOwnProperty.call(
    selectorContribution,
    "preEngineActionEligibilityProjection",
  );
  const selectorProjectionValidation = selectorProjectionProvided
    ? validateCsSelectorPreEngineActionEligibilityProjection(
      selectorContribution.preEngineActionEligibilityProjection,
      { requireFrozen: true },
    )
    : { valid: true, ready: false, reason: null };
  const selectorUiStateContributionApproved = selectorContribution.moduleId === "cs_selector"
    && selectorContribution.status === "saved-ui-state"
    && approvedCsSelectorProjectState(selectorContribution.state)
    && selectorProjectionValidation.valid === true;
  const selectorPreEngineRegistrationValidation = selectorPreEngineRegistrationContribution
    ? approvedCsSelectorPreEngineRegistrationContribution(selectorContribution)
    : { valid: false, reason: null };
  const selectorPreEngineRegistrationApproved =
    selectorPreEngineRegistrationValidation.valid === true;
  const selectorStatus = selectorUiStateContribution
    ? selectorUiStateContributionApproved ? "saved-ui-state" : "empty"
    : selectorPreEngineRegistrationContribution
      ? selectorPreEngineRegistrationApproved
        ? CS_SELECTOR_PRE_ENGINE_REGISTRATION_STATUS
        : "empty"
      : selectorContribution.status || "empty";
  const selectorState = selectorUiStateContribution
    ? selectorUiStateContributionApproved ? selectorContribution.state : {}
    : selectorPreEngineRegistrationContribution
      ? {}
      : selectorContribution.state || {};
  const selectorDownstreamContext = selectorUiStateContribution
    ? selectorUiStateContributionApproved && selectorProjectionProvided
      ? {
        preEngineActionEligibilityProjection:
          selectorContribution.preEngineActionEligibilityProjection,
      }
      : null
    : selectorPreEngineRegistrationContribution
      ? selectorPreEngineRegistrationApproved
        ? {
          preEngineActionEligibilityProjection:
            selectorContribution.preEngineActionEligibilityProjection,
          selectedResultSummary: {},
          runTableFirstNarrowOutputSummary: {},
        }
        : null
      : selectorContribution.downstreamContext || downstream.selector || null;
  const selectorReason = selectorUiStateContribution
    ? selectorUiStateContributionApproved
      ? null
      : selectorProjectionValidation.valid !== true
        ? selectorProjectionValidation.reason
        : "Selector Project-envelope contribution was missing, empty, or outside the approved serialisable UI-state shape."
    : selectorPreEngineRegistrationContribution
      ? selectorPreEngineRegistrationApproved
        ? null
        : selectorPreEngineRegistrationValidation.reason
      : selectorContribution.reason || "Selector contribution placeholder saved by shell envelope.";
  return {
    cs_selector: createModuleEnvelope({
      moduleId: "cs_selector",
      status: selectorStatus,
      state: selectorState,
      downstreamContext: selectorDownstreamContext,
      reason: selectorReason,
    }),
    scene_builder: createModuleEnvelope({
      moduleId: "scene_builder",
      status: sceneBuilderContribution.status || "empty",
      state: sceneBuilderContribution.state || {},
      downstreamContext: sceneBuilderContribution.downstreamContext || null,
      reason: sceneBuilderContribution.reason || "Scene Builder structural contribution placeholder saved by shell envelope.",
    }),
    emergence: createModuleEnvelope({
      moduleId: "emergence",
      status: emergenceContribution.status || "empty",
      state: emergenceContribution.state || {},
      downstreamContext: emergenceContribution.downstreamContext || null,
      reason: emergenceContribution.reason || "Emergence contribution placeholder saved by shell envelope.",
    }),
  };
}

export function validateSavedProjectEnvelope(envelope) {
  if (!envelope || typeof envelope !== "object") {
    return { valid: false, reason: "Envelope is missing or not an object." };
  }
  if (envelope.schema !== SAVED_PROJECT_SCHEMA) {
    return { valid: false, reason: `Unsupported envelope schema: ${envelope.schema || "none"}` };
  }
  if (envelope.owner !== "shell") {
    return { valid: false, reason: `Envelope owner is not shell: ${envelope.owner || "none"}` };
  }
  if (!envelope.envelopeId || !envelope.projectId) {
    return { valid: false, reason: "Envelope is missing envelopeId or projectId." };
  }
  if (!envelope.project || typeof envelope.project !== "object") {
    return { valid: false, reason: "Envelope is missing project block." };
  }
  if (!envelope.project.currentProject && !envelope.project.metadata) {
    return { valid: false, reason: "Envelope project block has no currentProject or metadata." };
  }
  if (!envelope.modules || typeof envelope.modules !== "object") {
    return { valid: false, reason: "Envelope is missing modules block." };
  }
  return { valid: true, reason: "Envelope is valid." };
}

export function createSavedProjectEnvelope({ project = {}, identity = {}, visibility = {}, flags = {}, downstream = {}, contractVersion = "not-declared", moduleContributions = {}, source = "project-browser-fixture", previousEnvelope = null } = {}) {
  const now = isoNow();
  const projectId = readProjectId(project);
  const envelopeId = previousEnvelope?.envelopeId || `env-${safeId(projectId)}-${Date.now()}`;
  const createdAt = previousEnvelope?.createdAt || now;
  const browserOnly = source !== "p2-shell-save-envelope";
  const readOnly = source !== "p2-shell-save-envelope";
  return {
    schema: SAVED_PROJECT_SCHEMA,
    owner: "shell",
    source,
    browserOnly,
    readOnly,
    envelopeId,
    projectId,
    title: readProjectTitle(project),
    client: readClient(project),
    site: readSite(project),
    createdAt,
    updatedAt: now,
    savedAt: now,
    savedBy: readSavedBy(identity),
    project: {
      metadata: clone(project.metadata || {}),
      currentProject: clone(project.currentProject || {}),
      selection: clone(project.selection || {}),
    },
    shell: {
      phase: "p2-save-envelope",
      contractVersion,
      visibility: clone(visibility || {}),
      flags: clone(flags || {}),
      downstream: clone(downstream || {}),
    },
    modules: createModuleEnvelopeSet({ downstream, moduleContributions }),
    lifecycle: {
      owner: "shell",
      status: "draft",
      custody: {
        ownerName: identity.currentUser?.name || "Workspace User",
        ownerEmail: identity.currentUser?.email || null,
      },
      handoff: {
        status: "not-live",
        available: false,
        reason: "P2 save envelope does not enable handoff/share.",
      },
    },
    restore: {
      status: "not-live",
      available: false,
      reason: "Restore/hydrate deferred to P3.",
    },
  };
}

export function createHydrationPayloadsFromEnvelope(envelope) {
  const modules = envelope?.modules || {};
  return Object.fromEntries(Object.entries(modules).map(([moduleId, moduleEnvelope]) => [
    moduleId,
    {
      owner: "shell",
      moduleId,
      sourceEnvelopeId: envelope.envelopeId,
      sourceProjectId: envelope.projectId,
      payloadAvailable: moduleEnvelope?.status !== "empty",
      payload: clone(moduleEnvelope || {}),
    },
  ]));
}

export function createHydrationResultsFromEnvelope(envelope) {
  const modules = envelope?.modules || {};
  return Object.fromEntries(Object.entries(modules).map(([moduleId, moduleEnvelope]) => {
    const payloadAvailable = moduleEnvelope?.status !== "empty";
    if (moduleId === "cs_selector") {
      return [
        moduleId,
        {
          moduleId,
          status: payloadAvailable ? "prepared" : "empty-state",
          payloadAvailable,
          reason: payloadAvailable
            ? "Selector hydration payload is prepared for the currently mounted cs_selector handler."
            : "Selector Project-envelope state is missing or empty.",
          sourceStatus: moduleEnvelope?.status || "empty",
        },
      ];
    }
    return [
      moduleId,
      {
        moduleId,
        status: "no-handler",
        payloadAvailable,
        reason: `Module hydrate handler not implemented yet for ${moduleId}.`,
        sourceStatus: moduleEnvelope?.status || "empty",
      },
    ];
  }));
}

export function summariseProjectEnvelope(envelope) {
  const validation = validateSavedProjectEnvelope(envelope);
  return {
    schema: envelope.schema,
    owner: envelope.owner,
    source: envelope.source || "unknown",
    readOnly: envelope.readOnly === true,
    browserOnly: envelope.browserOnly === true,
    restoreEligible: validation.valid && envelope.readOnly !== true && envelope.browserOnly !== true,
    restoreDisabledReason: validation.valid && envelope.readOnly !== true && envelope.browserOnly !== true ? null : "Fixture/read-only envelopes are not restored in P3. Save a runtime envelope first.",
    envelopeId: envelope.envelopeId || envelope.projectId,
    projectId: envelope.projectId,
    title: envelope.title,
    client: envelope.client,
    site: envelope.site,
    updatedAt: envelope.updatedAt,
    savedAt: envelope.savedAt || envelope.updatedAt,
    savedBy: envelope.savedBy?.name || "Unknown",
    lifecycleStatus: envelope.lifecycle?.status || "draft",
    moduleIds: Object.keys(envelope.modules || {}),
    moduleStatuses: Object.fromEntries(Object.entries(envelope.modules || {}).map(([moduleId, value]) => [moduleId, value.status || "empty"])),
  };
}
