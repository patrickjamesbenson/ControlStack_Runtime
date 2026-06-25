const DEFAULT_EXPANDER_SECTIONS = Object.freeze({
  projectMetadata: true,
  system: true,
  environment: true,
  lightControl: true,
  mounting: true,
  penetrationsWiring: true,
  finishes: true,
  egressAccessories: true,
  runs: true,
  timelineDiagnostics: true,
  pureReferenceDiagnosticLater: true,
});

const DEFAULT_PREVIEW_BUCKET_TEMPLATE = Object.freeze({
  source: "module-local default preview",
  manualConstraintCount: 0,
  autoConsequenceCount: 0,
  effectiveFieldCount: 0,
  committed: false,
  mutable: true,
  writes: false,
});

const DEFAULT_PREVIEW_BUCKET_STATUSES = Object.freeze({
  projectMetadata: "preview only",
  system: "preview only",
  environment: "not started",
  lightControl: "not started",
  mounting: "not started",
  penetrationsWiring: "not started",
  finishes: "not started",
  egressAccessories: "diagnostic only",
  runs: "later",
  timelineDiagnostics: "diagnostic only",
  pureReferenceDiagnosticLater: "later",
});

const DEFAULT_PREVIEW_DEFAULTS = Object.freeze(Object.fromEntries(
  Object.keys(DEFAULT_EXPANDER_SECTIONS).map((sectionId) => [
    sectionId,
    Object.freeze({
      status: DEFAULT_PREVIEW_BUCKET_STATUSES[sectionId] || "not started",
      ...DEFAULT_PREVIEW_BUCKET_TEMPLATE,
    }),
  ])
));

const SELECTOR_STATE_CONTRACT_TEMPLATE = Object.freeze({
  source: "module-local runtime state",
  freshLoad: true,
  previewDefaultState: true,
  specReady: false,
  buildReady: false,
  specGateComplete: false,
  buildGateComplete: false,
  specSlug: null,
  committedSpecExists: false,
  previewDefaults: Object.freeze({}),
  manualConstraints: Object.freeze({}),
  autoConsequences: Object.freeze({}),
  effectiveSelection: Object.freeze({}),
  committedSpec: null,
  provenanceMap: Object.freeze({}),
  behaviourFlags: Object.freeze({
    manualSelectionsAreConstraints: true,
    autoSelectionsAreConsequences: true,
    preserveCompatibleSelectionsOnFieldChange: true,
    autoDerivedItemsRemainChangeable: true,
    specSlugRequiresCompleteSpecGate: true,
  }),
  sideEffectGuards: Object.freeze({
    productCardsRendered: false,
    filteringActive: false,
    saveLoadActive: false,
    engineCallsActive: false,
    labCallsActive: false,
    iesCallsActive: false,
    downstreamPayloadActive: false,
    authorityWritesActive: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
  }),
});

function cloneObjectBucket(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return { ...value };
}

function clonePreviewDefaults(value = DEFAULT_PREVIEW_DEFAULTS) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([sectionId, bucket]) => [
    sectionId,
    { ...bucket },
  ]));
}

function createInitialSelectorStateContract() {
  return {
    ...SELECTOR_STATE_CONTRACT_TEMPLATE,
    previewDefaults: clonePreviewDefaults(DEFAULT_PREVIEW_DEFAULTS),
    manualConstraints: {},
    autoConsequences: {},
    effectiveSelection: {},
    committedSpec: null,
    provenanceMap: {},
    behaviourFlags: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.behaviourFlags },
    sideEffectGuards: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.sideEffectGuards },
  };
}

function cloneSelectorStateContract(contract = {}) {
  return {
    ...contract,
    previewDefaults: clonePreviewDefaults(contract.previewDefaults),
    manualConstraints: cloneObjectBucket(contract.manualConstraints),
    autoConsequences: cloneObjectBucket(contract.autoConsequences),
    effectiveSelection: cloneObjectBucket(contract.effectiveSelection),
    committedSpec: contract.committedSpec ? { ...contract.committedSpec } : null,
    provenanceMap: cloneObjectBucket(contract.provenanceMap),
    behaviourFlags: cloneObjectBucket(contract.behaviourFlags),
    sideEffectGuards: cloneObjectBucket(contract.sideEffectGuards),
  };
}

export function createSelectorState() {
  const state = {
    selectedCategory: "overview",
    expanderSections: { ...DEFAULT_EXPANDER_SECTIONS },
    localDirty: false,
    lastAction: "mounted",
    selectorStateContract: createInitialSelectorStateContract(),
  };

  function snapshot() {
    return {
      ...state,
      expanderSections: { ...state.expanderSections },
      selectorStateContract: cloneSelectorStateContract(state.selectorStateContract),
    };
  }

  return {
    getSnapshot() {
      return snapshot();
    },

    setCategory(category) {
      state.selectedCategory = category;
      state.lastAction = `category:${category}`;
      return this.getSnapshot();
    },

    setExpanderSectionOpen(sectionId, open) {
      if (!Object.prototype.hasOwnProperty.call(DEFAULT_EXPANDER_SECTIONS, sectionId)) {
        return this.getSnapshot();
      }
      state.expanderSections[sectionId] = open === true;
      state.lastAction = `expander:${sectionId}:${open === true ? "open" : "closed"}`;
      return this.getSnapshot();
    },

    markLocalDirty(reason = "local-ui-change") {
      state.localDirty = true;
      state.lastAction = reason;
      return this.getSnapshot();
    },

    clearLocalDirty(reason = "local-ui-reset") {
      state.localDirty = false;
      state.lastAction = reason;
      return this.getSnapshot();
    },
  };
}
