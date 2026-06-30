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

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function firstDefined(values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function textLooksUnsafe(value) {
  const text = String(value || "");
  return /[A-Za-z]:\\/.test(text)
    || text.includes("\\")
    || text.includes("/ControlStack")
    || text.includes("ControlStack\\")
    || text.includes("data:")
    || text.includes("base64")
    || /\.pdf\b/i.test(text)
    || /\.ies\b/i.test(text)
    || /password|credential|secret|token/i.test(text)
    || /users\b/i.test(text)
    || /raw package|raw json|candela|photometric grid|lab evidence/i.test(text);
}

function safeText(value, fallback = "absent", maxLength = 120) {
  if (value === undefined || value === null || value === "") return fallback;
  if (Array.isArray(value)) return value.length ? `${value.length} metadata item(s)` : fallback;
  if (isRecord(value)) {
    const candidate = firstDefined([value.label, value.value, value.status, value.state, value.summary]);
    if (candidate !== undefined && candidate !== null && candidate !== "") return safeText(candidate, "metadata present", maxLength);
    return "metadata present";
  }
  const raw = String(value).trim();
  if (!raw || textLooksUnsafe(raw)) return fallback;
  return raw.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) || fallback;
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

const EGRES_PACKAGE_EVIDENCE_READINESS_CONTRACT = "controlstack.egres.package_evidence_readiness_map.v1";

const EGRES_PACKAGE_EVIDENCE_SAFE_STATES = Object.freeze([
  "absent",
  "waiting_for_selected_result",
  "waiting_for_ies_candidate",
  "waiting_for_lab_proof",
  "waiting_for_compliance_review",
  "metadata_present_unreviewed",
  "blocked_no_proof_authority",
]);

const ENGINE_RUNTABLE_BLOCKED_FIELDS = Object.freeze([
  "resolved emergency placement",
  "resolved accessory placement",
  "reserved ranges",
  "zones",
  "board runs",
  "driver/control topology",
  "wiring impacts",
  "selected result acceptance",
  "source fingerprint",
  "Board Data source version",
]);

const REDACTION_FLAGS = Object.freeze({
  rawEvidenceExposed: false,
  rawIesExposed: false,
  rawPdfExposed: false,
  rawPdfsExposed: false,
  rawArtefactsExposed: false,
  rawPackageJsonExposed: false,
  rawRowsExposed: false,
  rawPackageRowsExposed: false,
  localPathsExposed: false,
  credentialsExposed: false,
  usersExposed: false,
  privateDetailsExposed: false,
});

function readSelectorIntentRows(selector = {}) {
  const payload = selector.payloadPreview || {};
  const egress = payload.egress || {};
  const sensorsAccessories = payload.sensorsAccessories || {};
  const intent = selector.intent || selector.egressIntent || selector.emergencyIntent || {};
  const preferences = selector.preferences || selector.manualConstraints || selector.constraints || {};

  const fields = [
    [
      "egress light preference",
      firstDefined([
        selector.egressLight,
        selector.egress_light,
        preferences.egressLight,
        preferences.egress_light,
        intent.egressLight,
        intent.egress_light,
        egress.light,
      ]),
      "intent only; Selector does not own resolved emergency placement",
    ],
    [
      "egress sound / EWIS preference",
      firstDefined([
        selector.egressSound,
        selector.egress_sound,
        selector.ewisSound,
        preferences.egressSound,
        preferences.egress_sound,
        intent.egressSound,
        intent.egress_sound,
        intent.ewisSound,
        egress.sound,
      ]),
      "intent only; Selector does not own EWIS zone placement authority",
    ],
    [
      "sensor preference",
      firstDefined([
        selector.sensor,
        selector.sensorPreference,
        preferences.sensor,
        preferences.sensorPreference,
        intent.sensor,
        intent.sensorPreference,
        sensorsAccessories.sensors,
      ]),
      "intent only; Selector does not own resolved accessory placement",
    ],
    [
      "emergency / accessory intent",
      firstDefined([
        selector.emergencyAccessoryIntent,
        selector.emergencyIntent,
        selector.accessoryIntent,
        intent.emergencyAccessoryIntent,
        intent.emergencyIntent,
        intent.accessoryIntent,
        sensorsAccessories.accessories,
        selector.emergencyCandidates,
      ]),
      "intent only; downstream placement remains unresolved",
    ],
    [
      "run-level placement intent",
      firstDefined([
        selector.runLevelPlacementIntent,
        selector.runPlacementIntent,
        selector.runAccessoryPlacementIntent,
        intent.runLevelPlacementIntent,
        intent.runPlacementIntent,
        intent.runAccessoryPlacementIntent,
      ]),
      "unresolved input only; Engine/RunTable must resolve placement later",
    ],
  ];

  const rows = fields.map(([label, value, note]) => {
    const safeValue = safeText(value, "absent");
    return [label, `${safeValue} — ${note}`];
  });

  return {
    present: rows.some(([, value]) => !value.startsWith("absent —")),
    rows,
  };
}

function readSelectedResultCandidate(downstream = {}, selector = {}) {
  return [
    downstream.selectedResultProjection,
    downstream.selectedResult,
    downstream.engineRunTableSelectedResult,
    downstream.engineRunTable?.selectedResult,
    downstream.runTable?.selectedResult,
    selector.selectedResultProjection,
    selector.selectedResult,
    selector.engineRunTableSelectedResult,
  ].find(isRecord) || null;
}

function selectedResultMetadata(candidate) {
  const present = isRecord(candidate);
  const selectedResultAvailable = candidate?.selectedResultAvailable === true || candidate?.available === true;
  const accepted = candidate?.accepted === true || candidate?.oneSuccessfulAcceptedResult === true;
  const engineVerified = candidate?.engineVerified === true;
  const stale = candidate?.stale === true;
  const selectedFamilySubsetLock = isRecord(candidate?.selectedFamilySubsetLock);
  const perRunLookupNormalised = candidate?.perRunLookupNormalised === true;
  const sourceInputFingerprint = Boolean(candidate?.sourceInputFingerprint);
  const boardDataSourceVersion = Boolean(candidate?.boardDataSourceVersion);
  const safe = Boolean(
    present
    && selectedResultAvailable
    && accepted
    && engineVerified
    && !stale
    && selectedFamilySubsetLock
    && perRunLookupNormalised
    && sourceInputFingerprint
    && boardDataSourceVersion
  );

  return {
    present,
    safe,
    state: safe ? "metadata_present_unreviewed" : "waiting_for_selected_result",
    selectedResultAvailable,
    accepted,
    engineVerified,
    stale,
    selectedFamilySubsetLock,
    perRunLookupNormalised,
    sourceInputFingerprint,
    boardDataSourceVersion,
  };
}

function readIesCandidateMetadata(downstream = {}, selector = {}) {
  const candidate = [
    downstream.iesBuilderCandidate,
    downstream.iesBuilder?.candidate,
    downstream.iesBuilder?.candidateOutput,
    selector.iesBuilderCandidate,
    selector.iesCandidate,
  ].find(isRecord);

  const present = Boolean(candidate?.metadataPresent === true || candidate?.candidateOutputOnly === true || candidate?.available === true);
  return {
    present,
    state: present ? "metadata_present_unreviewed" : "waiting_for_ies_candidate",
    candidateOutputOnly: true,
  };
}

function overallReadinessState({ evidencePresent, selectedResult, iesCandidate } = {}) {
  if (!evidencePresent) return "absent";
  if (!selectedResult.safe) return "waiting_for_selected_result";
  if (!iesCandidate.present) return "waiting_for_ies_candidate";
  return "blocked_no_proof_authority";
}

function buildEngineRunTableBlockedFieldRows(selectedResult) {
  return ENGINE_RUNTABLE_BLOCKED_FIELDS.map((field) => {
    if (field === "selected result acceptance") {
      return [field, selectedResult.safe ? "metadata present; still not proof or placement authority" : "blocked; accepted selected Engine/RunTable result required"];
    }
    if (field === "source fingerprint") {
      return [field, selectedResult.sourceInputFingerprint ? "metadata present; raw fingerprint not exposed" : "blocked; source fingerprint required later"];
    }
    if (field === "Board Data source version") {
      return [field, selectedResult.boardDataSourceVersion ? "metadata present; raw Board Data rows not exposed" : "blocked; Board Data source version required later"];
    }
    return [field, "blocked; future Engine/RunTable selected-result source must resolve this; not Selector authority"];
  });
}

function buildEgresPackageEvidenceReadinessMap({ downstream = {}, selector = {}, evidencePresent = false } = {}) {
  const selectedResult = selectedResultMetadata(readSelectedResultCandidate(downstream, selector));
  const iesCandidate = readIesCandidateMetadata(downstream, selector);
  const selectorIntent = readSelectorIntentRows(selector);
  const packageEvidenceState = evidencePresent ? "metadata_present_unreviewed" : "absent";
  const overallState = overallReadinessState({ evidencePresent, selectedResult, iesCandidate });

  return {
    schema: EGRES_PACKAGE_EVIDENCE_READINESS_CONTRACT,
    contractName: EGRES_PACKAGE_EVIDENCE_READINESS_CONTRACT,
    safeStates: [...EGRES_PACKAGE_EVIDENCE_SAFE_STATES],
    readOnly: true,
    diagnosticOnly: true,
    packageEvidenceState,
    overallReadinessState: overallState,
    selectorIntentPresent: selectorIntent.present,
    selectorIntentStatus: selectorIntent.present ? "metadata_present_unreviewed" : "absent",
    selectedEngineResultRequired: true,
    selectedEngineResultState: selectedResult.state,
    selectedEngineResultMetadataPresent: selectedResult.safe,
    iesCandidateRequired: true,
    iesCandidateState: selectedResult.safe ? iesCandidate.state : "waiting_for_selected_result",
    iesCandidateOutputOnly: true,
    labProofRequired: true,
    labProofState: selectedResult.safe && iesCandidate.present ? "waiting_for_lab_proof" : "blocked_no_proof_authority",
    complianceReviewRequired: true,
    complianceReviewState: "waiting_for_compliance_review",
    controlledRecordRequired: true,
    controlledRecordState: "metadata_present_unreviewed",
    rregMappingRequired: true,
    rregMappingState: "metadata_present_unreviewed",
    productionClaimAllowed: false,
    certificationAuthority: false,
    commissioningSignoffEnabled: false,
    as2293CertificationEnabled: false,
    as2293CertificationAuthority: false,
    emergencyComplianceApprovalAuthority: false,
    redactionFlags: { ...REDACTION_FLAGS },
    selectorIntentRows: selectorIntent.rows,
    engineRunTableBlockedFieldRows: buildEngineRunTableBlockedFieldRows(selectedResult),
    dependencyRows: [
      ["selected Engine/RunTable result dependency", selectedResult.state],
      ["IES Builder candidate dependency", selectedResult.safe ? `${iesCandidate.state}; candidate-output-only` : "waiting_for_selected_result; candidate-output-only"],
      ["Lab Proof dependency", "blocked_no_proof_authority; approved Lab authority contract required"],
      ["Compliance review dependency", "waiting_for_compliance_review; review-only, not certification"],
      ["Controlled Records provenance dependency", "provenance/disposition record required later; no write here"],
      ["RREG responsibility/reviewer/approver/custody dependency", "mapping required later; no approval or custody transfer here"],
    ],
    productionClaimRows: [
      ["production claim blocked state", "blocked_no_proof_authority"],
      ["productionClaimAllowed", "false"],
      ["emergency design proof", "false"],
      ["AS/NZS 2293 certification", "false"],
      ["commissioning signoff", "false"],
      ["Compliance approval", "false"],
    ],
  };
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
  const packageEvidenceMap = buildEgresPackageEvidenceReadinessMap({ downstream, selector, evidencePresent });

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
      "Selector emergency/egress fields are intent only; Engine/RunTable must resolve placement before downstream reliance.",
    ],
    packageDiagnostics: {
      runtimeModuleId: "emergence",
      downstreamLane: "egres",
      diagnosticOnly: true,
      readOnly: true,
      packageEvidenceReadiness: evidenceReadiness,
      packageEvidenceState: packageEvidenceMap.packageEvidenceState,
      packageAcceptanceEnabled: false,
      rowTagWorkflowRestored: false,
      as2293CertificationAuthority: false,
      as2293CertificationEnabled: false,
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
      rawPdfExposed: false,
      rawPdfsExposed: false,
      rawIesExposed: false,
      rawArtefactsExposed: false,
      rawPackageJsonExposed: false,
    },
    egresPackageEvidenceReadinessMap: packageEvidenceMap,
    egresPackageEvidenceReadinessRows: Object.entries({
      "schema / contract name": packageEvidenceMap.schema,
      readOnly: boolLabel(packageEvidenceMap.readOnly),
      diagnosticOnly: boolLabel(packageEvidenceMap.diagnosticOnly),
      packageEvidenceState: packageEvidenceMap.packageEvidenceState,
      selectorIntentPresent: boolLabel(packageEvidenceMap.selectorIntentPresent),
      selectedEngineResultRequired: boolLabel(packageEvidenceMap.selectedEngineResultRequired),
      iesCandidateRequired: boolLabel(packageEvidenceMap.iesCandidateRequired),
      labProofRequired: boolLabel(packageEvidenceMap.labProofRequired),
      complianceReviewRequired: boolLabel(packageEvidenceMap.complianceReviewRequired),
      controlledRecordRequired: boolLabel(packageEvidenceMap.controlledRecordRequired),
      rregMappingRequired: boolLabel(packageEvidenceMap.rregMappingRequired),
      productionClaimAllowed: boolLabel(packageEvidenceMap.productionClaimAllowed),
      rawEvidenceExposed: boolLabel(packageEvidenceMap.redactionFlags.rawEvidenceExposed),
      rawIesExposed: boolLabel(packageEvidenceMap.redactionFlags.rawIesExposed),
      rawPdfExposed: boolLabel(packageEvidenceMap.redactionFlags.rawPdfExposed),
      rawArtefactsExposed: boolLabel(packageEvidenceMap.redactionFlags.rawArtefactsExposed),
      certificationAuthority: boolLabel(packageEvidenceMap.certificationAuthority),
      commissioningSignoffEnabled: boolLabel(packageEvidenceMap.commissioningSignoffEnabled),
      as2293CertificationEnabled: boolLabel(packageEvidenceMap.as2293CertificationEnabled),
    }),
    selectorIntentRows: packageEvidenceMap.selectorIntentRows,
    engineRunTableBlockedFieldRows: packageEvidenceMap.engineRunTableBlockedFieldRows,
    egresDependencyRows: packageEvidenceMap.dependencyRows,
    egresRedactionRows: Object.entries({
      rawEvidenceExposed: boolLabel(packageEvidenceMap.redactionFlags.rawEvidenceExposed),
      rawIesExposed: boolLabel(packageEvidenceMap.redactionFlags.rawIesExposed),
      rawPdfExposed: boolLabel(packageEvidenceMap.redactionFlags.rawPdfExposed),
      rawArtefactsExposed: boolLabel(packageEvidenceMap.redactionFlags.rawArtefactsExposed),
      rawPackageJsonExposed: boolLabel(packageEvidenceMap.redactionFlags.rawPackageJsonExposed),
      rawRowsExposed: boolLabel(packageEvidenceMap.redactionFlags.rawRowsExposed),
      localPathsExposed: boolLabel(packageEvidenceMap.redactionFlags.localPathsExposed),
      credentialsExposed: boolLabel(packageEvidenceMap.redactionFlags.credentialsExposed),
      usersExposed: boolLabel(packageEvidenceMap.redactionFlags.usersExposed),
      privateDetailsExposed: boolLabel(packageEvidenceMap.redactionFlags.privateDetailsExposed),
    }),
    egresProductionClaimRows: packageEvidenceMap.productionClaimRows,
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
      packageEvidenceState: packageEvidenceMap.packageEvidenceState,
      packageAcceptanceEnabled: boolLabel(false),
      rowTagWorkflowRestored: boolLabel(false),
      as2293CertificationAuthority: boolLabel(false),
      as2293CertificationEnabled: boolLabel(false),
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
      rawPdfExposed: boolLabel(false),
      rawPdfsExposed: boolLabel(false),
      rawIesExposed: boolLabel(false),
      rawArtefactsExposed: boolLabel(false),
      rawPackageJsonExposed: boolLabel(false),
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
      "EGRES package evidence map does not expose raw evidence or enable production claims",
    ],
    responsiveNote: "Emergence uses module-local sections that can stack inside the shell-owned responsive workspace layout.",
  };
}
