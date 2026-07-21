function stateLabel(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === null || value === undefined) return "none";
  return String(value);
}

function readProjectTitle(project) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function decisionFor(visibility, moduleId) {
  return visibility.moduleReasons?.[moduleId] || { visible: false, reason: "not_registered" };
}

function consumerSummary(consumers = {}) {
  return Object.entries(consumers).map(([id, consumer]) => `${id}:${consumer.status}`).join(", ") || "none";
}

export function createSceneBuilderViewModel({ adapter, sceneBuilderState }) {
  const snapshots = adapter.readSnapshots();
  const local = sceneBuilderState.getSnapshot();
  const identity = snapshots.identity || {};
  const project = snapshots.project || {};
  const currentProject = project.currentProject || snapshots.currentProject || {};
  const visibility = snapshots.visibility || {};
  const downstream = snapshots.downstream || {};
  const selector = downstream.selector || {};
  const decision = adapter.getModuleDecision() || decisionFor(visibility, "scene_builder");
  const constraints = downstream.constraints || {};

  return {
    moduleId: adapter.moduleId,
    phase: "scene-builder-structural-module",
    route: snapshots.route,
    local,
    structural: {
      status: "mounted",
      contractOnly: "yes",
      featureRestoration: "not-restored",
      readsSelectorInternals: "no",
      donorCodeCopied: stateLabel(constraints.donorCodeCopied),
    },
    identity: {
      owner: identity.owner || "shell",
      status: identity.status || "unknown",
      identityState: identity.identityState || "external_anonymous",
      classification: identity.classification || "anonymous",
      actualRole: identity.actualRole || "external_user",
      derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
      displayRole: identity.displayRole || identity.role || "external_user",
      displayRoleClamped: stateLabel(identity.displayRoleClamped),
    },
    project: {
      owner: project.owner || "shell",
      status: project.status || "unknown",
      title: readProjectTitle(project),
      projectId: project.metadata?.projectId || currentProject.projectId || "none",
      readiness: project.metadata?.readiness || currentProject.readiness || "not-ready",
      source: project.selection?.source || project.metadata?.source || "unknown",
      client: currentProject.client || "none",
      site: currentProject.site || "none",
    },
    visibility: {
      owner: visibility.owner || "shell",
      status: visibility.status || "unknown",
      moduleVisible: stateLabel(decision.visible),
      reason: decision.reason || "not_registered",
      visibleModules: visibility.visibleModules?.join(", ") || "none",
      hiddenModules: visibility.hiddenModules?.join(", ") || "none",
      projectPresent: stateLabel(visibility.inputs?.projectPresent),
      projectMode: visibility.inputs?.projectMode || "auto",
    },
    selectorContext: {
      owner: selector.owner || "cs_selector",
      status: selector.status || "foundation-placeholder",
      source: selector.source || "selector-fed-downstream-context-foundation",
      runRefs: selector.runRefs?.length || 0,
      areaRefs: selector.areaRefs?.length || 0,
      fittingRefs: selector.fittingRefs?.length || 0,
      optionRefs: selector.optionRefs?.length || 0,
      sceneBuilderCandidates: selector.sceneBuilderCandidates?.length || 0,
      emergencyCandidates: selector.emergencyCandidates?.length || 0,
      readiness: selector.readiness?.sceneBuilder || "contract-only",
      consumers: consumerSummary(downstream.consumers),
    },
    guardrails: {
      sceneComposition: "not-restored",
      scheduleEditor: "not-restored",
      bindingsLogic: "not-restored",
      areaDesign: "not-restored",
      calculationSurfaceRestored: stateLabel(constraints.engineRestored),
      runTableRestored: stateLabel(constraints.runTableRestored),
      packageOutputRestored: stateLabel(constraints.payloadRestored),
      saveRestoreHydrateLive: "yes — shell-owned through Project Browser",
      handoffShareLive: "no — shell-owned and deferred",
    },
    deferredActions: [
      "Scene Builder structural module only",
      "Reads shell-owned downstream context",
      "Does not reach into selector internals",
      "Scene composition is not restored",
      "Schedule editor is not restored",
      "Bindings logic is not restored",
      "Area design is not restored",
      "Save / restore / hydrate are shell-owned and live through Project Browser",
      "Handoff / share remain shell-owned and deferred",
      "Donor bridge code was not copied",
    ],
    responsiveNote: "Scene Builder structural sections stack inside the shell-owned responsive layout.",
  };
}
