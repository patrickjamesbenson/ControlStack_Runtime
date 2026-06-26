const MODULE_ID = "coordinated_surfaces";

function boolText(value) {
  return value ? "true" : "false";
}

function arrayCount(value) {
  return Array.isArray(value) ? value.length : 0;
}

function readProjectTitle(project = {}) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function consumerStatus(consumers = {}, consumerId, fallback) {
  const consumer = consumers?.[consumerId];
  if (!consumer) return fallback;
  return consumer.status || fallback;
}

function decisionFor(visibility = {}, moduleId) {
  return visibility.moduleReasons?.[moduleId] || { visible: false, reason: "not_registered" };
}

export function createCoordinatedSurfacesViewModel({ adapter, coordinatedSurfacesState }) {
  const snapshots = adapter.readSnapshots();
  const local = coordinatedSurfacesState.getSnapshot();
  const project = snapshots.project || {};
  const currentProject = project.currentProject || snapshots.currentProject || {};
  const visibility = snapshots.visibility || {};
  const downstream = snapshots.downstream || {};
  const selector = downstream.selector || {};
  const constraints = downstream.constraints || {};
  const decision = adapter.getModuleDecision() || decisionFor(visibility, MODULE_ID);

  const warnings = [
    "Coordinated Surfaces / Ceiling is read-only and diagnostic in this slice.",
    "It does not generate ceiling setouts.",
    "It does not resolve clashes.",
    "It does not mutate Selector, engine geometry, RunTable, payload, or drawings.",
    "It does not provide drawing, setout, installation, or coordination signoff authority.",
    "No donor Ceiling / Coordination code is mounted.",
  ];

  return {
    moduleId: MODULE_ID,
    label: "Coordinated Surfaces / Ceiling",
    phase: "coordinated-surfaces-runtime-readonly-1",
    route: snapshots.route,
    local,
    status: {
      moduleStatus: "diagnostic-only",
      readOnly: boolText(true),
      coordinationAuthority: boolText(false),
      drawingAuthority: boolText(false),
      setoutAuthority: boolText(false),
      clashResolutionAuthority: boolText(false),
      selectorMutationEnabled: boolText(false),
      engineMutationEnabled: boolText(false),
      runTableMutationEnabled: boolText(false),
      payloadMutationEnabled: boolText(false),
      drawingMutationEnabled: boolText(false),
      donorCodeMounted: boolText(false),
    },
    namingContract: {
      runtimeId: MODULE_ID,
      selectorDownstreamLane: "ceiling",
      donorLegacyKey: "ceiling_coord",
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
      moduleVisible: boolText(Boolean(decision.visible)),
      reason: decision.reason || "not_registered",
      visibleModules: visibility.visibleModules?.join(", ") || "none",
      hiddenModules: visibility.hiddenModules?.join(", ") || "none",
    },
    downstream: {
      owner: downstream.owner || "shell",
      status: downstream.status || "foundation-ready",
      source: downstream.source || "selector-fed-downstream-context-foundation",
      selectorStatus: selector.status || "foundation-placeholder",
      selectorSource: selector.source || "selector-fed-downstream-context-foundation",
      selectorCeilingReadiness: selector.readiness?.ceiling || "contract-only",
      sceneBuilder: "contract-only / diagnostic",
      egres: "contract-only / diagnostic",
      complianceMatters: "diagnostic/read-only if mounted, otherwise referenced only",
      coordinatedSurfaces: "diagnostic mounted in this slice",
      sceneConsumerLane: consumerStatus(downstream.consumers, "scene_builder", "contract-only / diagnostic"),
      egresConsumerLane: consumerStatus(downstream.consumers, "egres", "contract-only / diagnostic"),
      complianceConsumerLane: consumerStatus(downstream.consumers, "compliance_matters", "diagnostic/read-only if mounted, otherwise referenced only"),
      ceilingConsumerLane: consumerStatus(downstream.consumers, "ceiling", "diagnostic mounted in this slice"),
    },
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
    futureLabelsOnly: [
      "ceiling intent",
      "ceiling type",
      "integrated services",
      "constraints",
      "risks",
      "compliance touchpoints",
    ],
    constraints: {
      engineRestored: boolText(Boolean(constraints.engineRestored)),
      runTableRestored: boolText(Boolean(constraints.runTableRestored)),
      payloadRestored: boolText(Boolean(constraints.payloadRestored)),
      sceneBuilderImplemented: boolText(Boolean(constraints.sceneBuilderImplemented)),
      egresImplemented: boolText(Boolean(constraints.egresImplemented)),
      complianceImplemented: boolText(Boolean(constraints.complianceImplemented)),
      ceilingImplemented: boolText(Boolean(constraints.ceilingImplemented)),
      donorCodeCopied: boolText(Boolean(constraints.donorCodeCopied)),
    },
    requiredWording: [
      "Coordinated Surfaces / Ceiling is read-only and diagnostic in this slice.",
      "It identifies coordination context, naming alignment, and future ceiling/surface considerations.",
      "It does not generate ceiling setouts.",
      "It does not resolve clashes.",
      "It does not mutate Selector, engine geometry, RunTable, payload, or drawings.",
      "It does not provide drawing, setout, installation, or coordination signoff authority.",
    ],
    warnings,
  };
}
