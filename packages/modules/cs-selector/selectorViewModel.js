import { evaluateSpecialPartsCompatibility } from "./selectorSpecialPartsCompatibility.js";

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

export function createSelectorViewModel({ adapter, selectorState }) {
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

  return {
    moduleId: adapter.moduleId,
    phase: snapshots.diagnostics?.phase || "selector-fed-downstream-context-foundation",
    route: snapshots.route,
    local,
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
      filteringLive: stateLabel(csSelectorConsumption.filteringLive || selectorTimelineImplementation.filteringLive),
      warningsLive: stateLabel(csSelectorConsumption.warningsLive || selectorTimelineImplementation.warningsLive),
      entitlementLookupLive: stateLabel(selectorTimelineImplementation.entitlementLookupLive),
      optInLive: stateLabel(selectorTimelineImplementation.optInLive),
      projectWritesLive: stateLabel(selectorTimelineImplementation.projectWritesLive),
      backendRoutesLive: stateLabel(selectorTimelineImplementation.backendRoutesLive),
      slugMutationLive: stateLabel(selectorTimelineImplementation.slugMutationLive),
      buildMutationLive: stateLabel(selectorTimelineImplementation.buildMutationLive),
    },
    selectorTimelineContext,
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
      "Timeline and special-parts context are consumed passively only",
      "Special-parts compatibility helper is wired passively into the view model only",
      "Selector filtering, entitlement lookup, opt-in, slug mutation, and build mutation are deferred",
    ],
    responsiveNote: "Selector panel uses module-local sections that can stack inside the shell-owned responsive layout.",
  };
}
