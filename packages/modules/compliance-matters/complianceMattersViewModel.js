function stateLabel(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  if (value === null || value === undefined) return "none";
  return String(value);
}

function arrayCount(value) {
  return Array.isArray(value) ? value.length : 0;
}

function readProjectTitle(project = {}) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function consumerState(consumers = {}, id, fallbackStatus) {
  const consumer = consumers[id] || {};
  return `${consumer.label || id}: ${consumer.status || fallbackStatus}`;
}

function readEvidenceFlag(source) {
  if (!source || typeof source !== "object") return false;
  if (source.present === true || source.exists === true || source.available === true) return true;
  if (source.evidencePresent === true || source.packagePresent === true) return true;
  return false;
}

function hasEgresPackageEvidence({ downstream = {}, selector = {} } = {}) {
  return Boolean(
    readEvidenceFlag(downstream.egresPackageEvidence) ||
    readEvidenceFlag(downstream.egres?.packageEvidence) ||
    readEvidenceFlag(downstream.egres?.evidencePackage) ||
    readEvidenceFlag(selector.egresPackageEvidence) ||
    readEvidenceFlag(selector.egresPackage) ||
    readEvidenceFlag(selector.emergencyPackageEvidence)
  );
}

export function createComplianceMattersViewModel({ adapter, complianceMattersState }) {
  const snapshots = adapter.readSnapshots();
  const local = complianceMattersState.getSnapshot();
  const project = snapshots.project || {};
  const currentProject = project.currentProject || {};
  const visibility = snapshots.visibility || {};
  const downstream = snapshots.downstream || {};
  const selector = downstream.selector || {};
  const constraints = downstream.constraints || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.compliance_matters || null;
  const egresEvidencePresent = hasEgresPackageEvidence({ downstream, selector });
  const readiness = selector.readiness || {};

  const warnings = [
    "Compliance Matters is read-only and diagnostic in this slice.",
    "EGRES package evidence is required before compliance readiness can progress.",
    "Scene Builder, EGRES, and Coordinated Surfaces remain diagnostic/context inputs unless separately proven.",
  ];

  if (!egresEvidencePresent) warnings.push("waiting for EGRES package");
  if ((readiness.compliance || "blocked-until-egres-package") === "blocked-until-egres-package") {
    warnings.push("Compliance readiness is blocked until EGRES package evidence exists.");
  }

  return {
    moduleId: adapter.moduleId,
    route: snapshots.route,
    phase: "compliance-matters-read-only-diagnostic-shell-module",
    local,
    requiredWording: [
      "Compliance Matters is read-only and diagnostic in this slice.",
      "It identifies evidence, risk, and review requirements.",
      "It does not certify compliance.",
      "It does not provide legal/code approval, NCC/BCA approval, AS/NZS approval, engineering signoff, project approval, or authority approval.",
      "EGRES package evidence is required before compliance readiness can progress.",
      "Scene Builder, EGRES, and Coordinated Surfaces remain diagnostic/context inputs unless separately proven.",
    ],
    diagnosticStatus: {
      "module status": "diagnostic-only",
      readOnly: true,
      certificationAuthority: false,
      signOffEnabled: false,
      liveVerificationEnabled: false,
      exportScorecardEnabled: false,
      selectorMutationEnabled: false,
      egresMutationEnabled: false,
      sceneBuilderMutationEnabled: false,
      coordinatedSurfacesMutationEnabled: false,
      engineMutationEnabled: false,
      runTableMutationEnabled: false,
      payloadMutationEnabled: false,
      drawingMutationEnabled: false,
      donorCodeMounted: false,
    },
    downstreamReadiness: {
      sceneBuilder: readiness.sceneBuilder || "contract-only / diagnostic",
      egres: readiness.egres || "contract-only / diagnostic",
      compliance: readiness.compliance || "blocked-until-egres-package",
      ceiling: readiness.ceiling || "contract-only / not mounted",
    },
    downstreamSummary: [
      ["Scene Builder", "contract-only / diagnostic"],
      ["EGRES", "contract-only / diagnostic"],
      ["Compliance", readiness.compliance || "blocked-until-egres-package"],
      ["Ceiling / Coordinated Surfaces", "contract-only / not mounted"],
    ],
    candidateCounts: {
      runRefs: arrayCount(selector.runRefs),
      areaRefs: arrayCount(selector.areaRefs),
      fittingRefs: arrayCount(selector.fittingRefs),
      optionRefs: arrayCount(selector.optionRefs),
      sceneBuilderCandidates: arrayCount(selector.sceneBuilderCandidates),
      emergencyCandidates: arrayCount(selector.emergencyCandidates),
      complianceCandidates: arrayCount(selector.complianceCandidates),
      ceilingCandidates: arrayCount(selector.ceilingCandidates),
    },
    evidenceMap: {
      egresPackageEvidencePresent: egresEvidencePresent,
      egresPackageStatus: egresEvidencePresent ? "evidence-present" : "waiting for EGRES package",
      source: downstream.source || selector.source || "selector-fed-downstream-context-foundation",
      downstreamStatus: downstream.status || "foundation-ready",
      selectorStatus: selector.status || "foundation-placeholder",
      selectorLastUpdatedAt: selector.lastUpdatedAt || "none",
    },
    riskMap: {
      readinessGate: egresEvidencePresent ? "evidence-review-required" : "blocked-until-egres-package",
      reviewRequirement: "evidence/risk/review map only",
      projectReview: "requires separate competent review before any external reliance",
      scopeBoundary: "not certification, approval, signoff, or authority outcome",
    },
    project: {
      owner: project.owner || "shell",
      status: project.status || "unknown",
      title: readProjectTitle(project),
      projectId: project.metadata?.projectId || currentProject.projectId || "none",
      readiness: project.metadata?.readiness || currentProject.readiness || "not-ready",
      source: project.selection?.source || project.metadata?.source || "unknown",
    },
    visibility: {
      owner: visibility.owner || "shell",
      status: visibility.status || "unknown",
      decision: decision?.reason || "registered-by-shell-diagnostic-slice",
      shellDecisionVisible: stateLabel(decision?.visible),
      visibleModules: visibility.visibleModules?.join(", ") || "none",
      hiddenModules: visibility.hiddenModules?.join(", ") || "none",
    },
    consumerStatus: [
      consumerState(downstream.consumers, "scene_builder", "contract-only / diagnostic"),
      consumerState(downstream.consumers, "egres", "contract-only / diagnostic"),
      consumerState(downstream.consumers, "compliance_matters", "blocked-until-egres-package"),
      consumerState(downstream.consumers, "ceiling", "contract-only / not mounted"),
    ],
    guardrails: {
      engineRestored: stateLabel(constraints.engineRestored),
      runTableRestored: stateLabel(constraints.runTableRestored),
      payloadRestored: stateLabel(constraints.payloadRestored),
      donorCodeCopied: stateLabel(constraints.donorCodeCopied),
      complianceImplemented: stateLabel(constraints.complianceImplemented),
      sceneBuilderImplemented: stateLabel(constraints.sceneBuilderImplemented),
      egresImplemented: stateLabel(constraints.egresImplemented),
      ceilingImplemented: stateLabel(constraints.ceilingImplemented),
    },
    warnings,
  };
}
