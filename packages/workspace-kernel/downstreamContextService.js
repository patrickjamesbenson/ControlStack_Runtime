const CONSUMER_LANES = Object.freeze({
  scene_builder: Object.freeze({
    label: "Scene Builder",
    registered: false,
    status: "not-implemented",
    receives: Object.freeze(["project", "identity", "selector.runRefs", "selector.areaRefs", "selector.sceneBuilderCandidates"]),
  }),
  egres: Object.freeze({
    label: "Emergency / EGRES",
    registered: false,
    status: "not-implemented",
    receives: Object.freeze(["project", "identity", "selector.emergencyCandidates"]),
  }),
  compliance_matters: Object.freeze({
    label: "Compliance Matters",
    registered: false,
    status: "not-implemented",
    receives: Object.freeze(["selector context after EGRES package exists"]),
  }),
  ceiling: Object.freeze({
    label: "Ceiling / Coordinated Surfaces",
    registered: false,
    status: "not-implemented",
    receives: Object.freeze(["project", "selector.areaRefs", "selector.fittingRefs", "selector.ceilingCandidates"]),
  }),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readProject(project = {}) {
  const current = project.currentProject || {};
  const metadata = project.metadata || {};
  return {
    projectId: metadata.projectId || current.projectId || null,
    title: metadata.title || current.title || "No project loaded",
    readiness: metadata.readiness || current.readiness || "not-ready",
    source: project.selection?.source || metadata.source || "unknown",
  };
}

function readIdentity(identity = {}) {
  return {
    identityState: identity.identityState || "external_anonymous",
    classification: identity.classification || "anonymous",
    actualRole: identity.actualRole || "external_user",
    derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
    displayRole: identity.displayRole || identity.role || "external_user",
  };
}

function readVisibility(visibility = {}) {
  return {
    visibleModules: visibility.visibleModules || [],
    hiddenModules: visibility.hiddenModules || [],
    reasons: visibility.moduleReasons || {},
  };
}

function createSelectorFoundation({ project = {}, identity = {}, visibility = {}, selectorContribution = {} } = {}) {
  const projectSummary = readProject(project);
  const identitySummary = readIdentity(identity);
  const visibilitySummary = readVisibility(visibility);
  const now = new Date().toISOString();

  const baseSelector = {
    owner: "cs_selector",
    status: "foundation-placeholder",
    source: "selector-fed-downstream-context-foundation",
    lastUpdatedAt: selectorContribution.lastUpdatedAt || now,
    project: projectSummary,
    identity: identitySummary,
    visibility: visibilitySummary,
    runRefs: [],
    areaRefs: [],
    fittingRefs: [],
    optionRefs: [],
    emergencyCandidates: [],
    sceneBuilderCandidates: [],
    complianceCandidates: [],
    ceilingCandidates: [],
    readiness: {
      sceneBuilder: "contract-only",
      egres: "contract-only",
      compliance: "blocked-until-egres-package",
      ceiling: "contract-only",
    },
  };

  return {
    ...baseSelector,
    ...selectorContribution,
    project: projectSummary,
    identity: identitySummary,
    visibility: visibilitySummary,
    readiness: {
      ...baseSelector.readiness,
      ...(selectorContribution.readiness || {}),
    },
  };
}

function createSnapshot({ selectorContribution, context } = {}) {
  const project = context?.project || {};
  const identity = context?.identity || {};
  const visibility = context?.visibility || {};
  const selector = createSelectorFoundation({ project, identity, visibility, selectorContribution });
  return {
    owner: "shell",
    status: "foundation-ready",
    source: "selector-fed-downstream-context-foundation",
    phase: "selector-fed-downstream-context-foundation",
    project: readProject(project),
    identity: readIdentity(identity),
    visibility: readVisibility(visibility),
    selector,
    consumers: clone(CONSUMER_LANES),
    constraints: {
      engineRestored: false,
      runTableRestored: false,
      payloadRestored: false,
      sceneBuilderImplemented: false,
      egresImplemented: false,
      complianceImplemented: false,
      ceilingImplemented: false,
      donorCodeCopied: false,
    },
  };
}

export function createDownstreamContextService({ eventBus } = {}) {
  const state = {
    owner: "shell",
    selectorContribution: {},
  };

  function getDownstreamContextSnapshot(context = {}) {
    return createSnapshot({ selectorContribution: state.selectorContribution, context });
  }

  function publishSelectorContext(selectorContribution = {}, reason = "selector-context-foundation-update") {
    state.selectorContribution = {
      ...state.selectorContribution,
      ...selectorContribution,
      owner: "cs_selector",
      status: selectorContribution.status || "foundation-placeholder",
      source: "selector-fed-downstream-context-foundation",
      lastUpdatedAt: new Date().toISOString(),
    };
    const snapshot = getDownstreamContextSnapshot(selectorContribution.context || {});
    eventBus?.emit("downstream:selector-context-updated", { reason, downstream: snapshot });
    return snapshot;
  }

  return {
    owner: state.owner,
    status: "foundation-ready",
    getDownstreamContextSnapshot,
    publishSelectorContext,
    getConsumerLanes() {
      return clone(CONSUMER_LANES);
    },
  };
}
