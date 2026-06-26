function stateLabel(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === null || value === undefined) return "none";
  return String(value);
}

function boolLabel(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  return stateLabel(value);
}

function arrayCount(value) {
  return Array.isArray(value) ? value.length : 0;
}

function readProjectTitle(project) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function readCompanyName(company) {
  return company?.companyName || "No company loaded";
}

function readWriteEnabled(policy) {
  if (policy.enabled !== undefined) return policy.enabled;
  if (policy.writeFlowsEnabled !== undefined) return policy.writeFlowsEnabled;
  return false;
}

function decisionFor(visibility = {}, moduleId) {
  return visibility.moduleReasons?.[moduleId] || { visible: false, reason: "not_registered" };
}

function readEvidenceFlag(source) {
  if (!source || typeof source !== "object") return false;
  if (source.present === true || source.exists === true || source.available === true) return true;
  if (source.evidencePresent === true || source.packagePresent === true) return true;
  return false;
}

function collectEvidenceSummaries(downstream = {}, selector = {}) {
  return [
    downstream.egresPackageEvidence,
    downstream.egres?.packageEvidence,
    downstream.egres?.evidencePackage,
    selector.egresPackageEvidence,
    selector.egresPackage,
    selector.emergencyPackageEvidence,
  ].filter((source) => source && typeof source === "object" && !Array.isArray(source));
}

function hasEgresPackageEvidence({ downstream = {}, selector = {} } = {}) {
  return collectEvidenceSummaries(downstream, selector).some(readEvidenceFlag);
}

function packageEvidenceReadiness({ downstream = {}, selector = {} } = {}) {
  const evidenceSummaries = collectEvidenceSummaries(downstream, selector);
  if (evidenceSummaries.some(readEvidenceFlag)) return "diagnostic-present";
  if (
    evidenceSummaries.length > 0 ||
    downstream.egres ||
    downstream.consumers?.egres ||
    selector.readiness?.egres ||
    selector.status ||
    downstream.status
  ) {
    return "waiting";
  }
  return "absent";
}

function consumerStatus(consumers = {}, id, fallbackStatus) {
  const consumer = consumers[id] || {};
  return consumer.status || fallbackStatus;
}

function warningList({ packageReadiness, evidencePresent, selector = {}, downstream = {} }) {
  const warnings = [
    "Emergency / EGRES package diagnostics are read-only in this slice.",
    "Package evidence readiness is diagnostic only.",
    "Compliance Matters may depend on EGRES package evidence, but this module does not approve that evidence.",
  ];

  if (!evidencePresent) warnings.push("waiting for EGRES package evidence");
  if (packageReadiness === "absent") warnings.push("no safe EGRES package evidence flag is available in the shell context");
  if (!selector.status && !downstream.status) warnings.push("downstream context status is unavailable");
  return warnings;
}

export function createEmergenceViewModel({ adapter, emergenceState }) {
  const snapshots = adapter.readSnapshots();
  const local = emergenceState.getSnapshot();
  const flags = snapshots.flags.values || {};
  const identity = snapshots.identity;
  const project = snapshots.project;
  const currentProject = project.currentProject || {};
  const company = snapshots.company || snapshots.crm?.company || {};
  const crm = snapshots.crm || {};
  const crmWritePolicy = crm.writePolicy || company.diagnostics || {};
  const handoff = snapshots.handoff;
  const emergenceDecision = decisionFor(snapshots.visibility, "emergence");
  const downstream = snapshots.downstream || {};
  const selector = downstream.selector || {};
  const readiness = selector.readiness || {};
  const evidenceSummaries = collectEvidenceSummaries(downstream, selector);
  const evidencePresent = hasEgresPackageEvidence({ downstream, selector });
  const evidenceReadiness = packageEvidenceReadiness({ downstream, selector });

  return {
    moduleId: adapter.moduleId,
    phase: snapshots.diagnostics?.phase || "egres-read-only-package-diagnostics",
    route: snapshots.route,
    local,
    requiredWording: [
      "Emergency / EGRES package diagnostics are read-only in this slice.",
      "This does not restore EGRES row/tag workflow.",
      "This does not provide AS2293 certification, commissioning signoff, emergency compliance approval, project approval, or authority approval.",
      "Package evidence readiness is diagnostic only.",
      "Compliance Matters may depend on EGRES package evidence, but this module does not approve that evidence.",
      "Lab Proof remains the boundary for proof authority, and this slice does not create proof authority.",
    ],
    packageDiagnostics: {
      runtimeModuleId: "emergence",
      downstreamLane: "egres",
      diagnosticOnly: true,
      readOnly: true,
      packageEvidenceReadiness: evidenceReadiness,
      packageAcceptanceEnabled: false,
      rowTagWorkflowRestored: false,
      as2293CertificationAuthority: false,
      commissioningSignoffEnabled: false,
      emergencyComplianceApprovalAuthority: false,
      complianceMutationEnabled: false,
      selectorMutationEnabled: false,
      sceneBuilderMutationEnabled: false,
      coordinatedSurfacesMutationEnabled: false,
      labProofAuthority: false,
      donorCodeMounted: false,
      serverEndpointAdded: false,
      rawEvidenceExposed: false,
      rawRowsExposed: false,
      rawPdfsExposed: false,
      rawIesExposed: false,
    },
    safeSummary: {
      downstreamStatus: downstream.status || "unavailable",
      downstreamSource: downstream.source || selector.source || "unavailable",
      egresLaneStatus: consumerStatus(downstream.consumers, "egres", readiness.egres || downstream.egres?.status || "waiting"),
      readinessStatus: readiness.egres || "waiting-for-package-evidence",
      safeEgresPackageEvidenceFlagExists: evidenceSummaries.length > 0,
      safeEgresPackageEvidencePresent: evidencePresent,
      selectorStatus: selector.status || "unavailable",
      selectorLastUpdatedAt: selector.lastUpdatedAt || "none",
    },
    candidateCounts: {
      runRefs: arrayCount(selector.runRefs),
      areaRefs: arrayCount(selector.areaRefs),
      fittingRefs: arrayCount(selector.fittingRefs),
      optionRefs: arrayCount(selector.optionRefs),
      emergencyCandidates: arrayCount(selector.emergencyCandidates),
      sceneBuilderCandidates: arrayCount(selector.sceneBuilderCandidates),
      complianceCandidates: arrayCount(selector.complianceCandidates),
      ceilingCandidates: arrayCount(selector.ceilingCandidates),
    },
    warnings: warningList({ packageReadiness: evidenceReadiness, evidencePresent, selector, downstream }),
    identity: {
      owner: identity.owner,
      status: identity.status,
      source: identity.source || "phase-8a-shell-owned-identity-resolver",
      name: identity.currentUser?.name || "Workspace User",
      email: identity.currentUser?.email || "No email loaded",
      identityState: identity.identityState || "external_anonymous",
      classification: identity.classification || "anonymous",
      derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
      actualRole: identity.actualRole || "external_user",
      actualRoleSource: identity.actualRoleSource || "unknown",
      actualRoleDerived: stateLabel(identity.actualRoleDerived),
      actualRoleOverrideEnabled: stateLabel(identity.actualRoleOverrideEnabled),
      actualRoleOverride: identity.actualRoleOverride || "none",
      displayRole: identity.displayRole || identity.role || "external_user",
      displayRoleRequested: identity.displayRoleRequested || identity.displayRole || "external_user",
      displayRoleClamped: stateLabel(identity.displayRoleClamped),
      canViewEmergence: stateLabel(adapter.hasCapability("module:emergence:view")),
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
      associatedDealId: company.associatedDealId || "none",
      associatedContactId: company.associatedContactId || "none",
    },
    crm: {
      owner: crm.owner || "shell",
      status: crm.status || "placeholder",
      writeFlowsEnabled: stateLabel(readWriteEnabled(crmWritePolicy)),
      writeReason: crmWritePolicy.reason || "Phase 8A project selection does not enable CRM writes.",
      hubspotStatus: crm.hubspot?.status || "placeholder",
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
      moduleVisible: stateLabel(emergenceDecision.visible),
      moduleReason: emergenceDecision.reason,
      projectMode: snapshots.visibility.inputs?.projectMode || "auto",
      projectPresent: stateLabel(snapshots.visibility.inputs?.projectPresent),
      visibleModules: snapshots.visibility.visibleModules?.join(", ") || "none",
      hiddenModules: snapshots.visibility.hiddenModules?.join(", ") || "none",
      rule: snapshots.visibility.rule,
    },
    flags: {
      owner: snapshots.flags.owner,
      featureMigrationEnabled: stateLabel(adapter.isFlagEnabled("featureMigrationEnabled")),
      projectPersistenceLive: stateLabel(flags.projectPersistenceLive),
      handoffLive: stateLabel(flags.handoffLive),
      crmLive: stateLabel(flags.crmLive),
      engineSurfaceEnabled: stateLabel(flags.engineSurfaceEnabled),
      runTableSurfaceEnabled: stateLabel(flags.runTableSurfaceEnabled),
      payloadSurfaceEnabled: stateLabel(flags.payloadSurfaceEnabled),
    },
    diagnosticRows: Object.entries({
      "runtime module id": "emergence",
      "downstream lane": "egres",
      diagnosticOnly: boolLabel(true),
      readOnly: boolLabel(true),
      packageEvidenceReadiness: evidenceReadiness,
      packageAcceptanceEnabled: boolLabel(false),
      rowTagWorkflowRestored: boolLabel(false),
      as2293CertificationAuthority: boolLabel(false),
      commissioningSignoffEnabled: boolLabel(false),
      emergencyComplianceApprovalAuthority: boolLabel(false),
      complianceMutationEnabled: boolLabel(false),
      selectorMutationEnabled: boolLabel(false),
      sceneBuilderMutationEnabled: boolLabel(false),
      coordinatedSurfacesMutationEnabled: boolLabel(false),
      labProofAuthority: boolLabel(false),
      donorCodeMounted: boolLabel(false),
      serverEndpointAdded: boolLabel(false),
      rawEvidenceExposed: boolLabel(false),
      rawRowsExposed: boolLabel(false),
      rawPdfsExposed: boolLabel(false),
      rawIesExposed: boolLabel(false),
    }),
    safeSummaryRows: Object.entries({
      "downstream egres lane status": consumerStatus(downstream.consumers, "egres", readiness.egres || downstream.egres?.status || "waiting"),
      "readiness status": readiness.egres || "waiting-for-package-evidence",
      "safe EGRES package evidence flag exists": boolLabel(evidenceSummaries.length > 0),
      "safe EGRES package evidence present": boolLabel(evidencePresent),
      "downstream status": downstream.status || "unavailable",
      "downstream source": downstream.source || selector.source || "unavailable",
      "selector status": selector.status || "unavailable",
      "selector last updated": selector.lastUpdatedAt || "none",
    }),
    candidateCountRows: Object.entries({
      runRefs: arrayCount(selector.runRefs),
      areaRefs: arrayCount(selector.areaRefs),
      fittingRefs: arrayCount(selector.fittingRefs),
      optionRefs: arrayCount(selector.optionRefs),
      emergencyCandidates: arrayCount(selector.emergencyCandidates),
      sceneBuilderCandidates: arrayCount(selector.sceneBuilderCandidates),
      complianceCandidates: arrayCount(selector.complianceCandidates),
      ceilingCandidates: arrayCount(selector.ceilingCandidates),
    }).map(([label, value]) => [label, String(value)]),
    deferredActions: [
      "Actual role is resolved from identity lookup by default",
      "Developer actual-role override is temporary and off by default",
      "Display role is preview-only and clamped",
      "This is not real auth",
      "Project selection is shell-owned",
      "Save is shell-owned and deferred",
      "Restore is shell-owned and deferred",
      "Handoff is shell-owned and deferred",
      "CRM writes are shell-owned and deferred",
      "Engine / RunTable / payload work is out of scope",
      "EGRES row/tag workflow is not restored",
      "Package evidence readiness is diagnostic only",
    ],
    responsiveNote: "Emergence uses module-local sections that can stack inside the shell-owned responsive workspace layout.",
  };
}
