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

const DEFAULT_SECTION_FIELD_DEFINITIONS = Object.freeze({
  projectMetadata: Object.freeze([
    { fieldKey: "projectTitle", label: "Project title", status: "preview only" },
    { fieldKey: "client", label: "Client", status: "preview only" },
    { fieldKey: "site", label: "Site", status: "preview only" },
    { fieldKey: "requirementDate", label: "Requirement date", status: "preview only" },
  ]),
  system: Object.freeze([
    { fieldKey: "system", label: "System", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "variant", label: "Variant", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
    { fieldKey: "emission", label: "Emission", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
  ]),
  environment: Object.freeze([
    { fieldKey: "application", label: "Application", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "interiorExterior", label: "Interior / exterior", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "ipRating", label: "IP rating", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
    { fieldKey: "ikRating", label: "IK rating", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
  ]),
  lightControl: Object.freeze([
    { fieldKey: "targetLumensPerMetre", label: "Target lumens per metre", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "cct", label: "CCT", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "cri", label: "CRI", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
    { fieldKey: "optic", label: "Optic", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "controlType", label: "Control type", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "driver", label: "Driver", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  mounting: Object.freeze([
    { fieldKey: "mountStyle", label: "Mount style", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "suspension", label: "Suspension", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "ceilingType", label: "Ceiling type", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  penetrationsWiring: Object.freeze([
    { fieldKey: "powerEntryFace", label: "Power entry face", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "powerEntryPosition", label: "Power entry position", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "wiringType", label: "Wiring type", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  finishes: Object.freeze([
    { fieldKey: "bodyFinish", label: "Body finish", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForSpecGate: true },
    { fieldKey: "diffuserFinish", label: "Diffuser finish", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
    { fieldKey: "trimFinish", label: "Trim finish", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true },
  ]),
  egressAccessories: Object.freeze([
    { fieldKey: "emergency", label: "Emergency", status: "diagnostic only", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "sensor", label: "Sensor", status: "diagnostic only", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "specialParts", label: "Special parts", status: "diagnostic only", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  runs: Object.freeze([
    { fieldKey: "runCount", label: "Run count", status: "later", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "totalLength", label: "Total length", status: "later", manualConstraintEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
    { fieldKey: "segmentStrategy", label: "Segment strategy", status: "later", autoConsequenceEligible: true, effectiveSelectionEligible: true, committedSpecEligible: true, requiredForBuildGate: true },
  ]),
  timelineDiagnostics: Object.freeze([
    { fieldKey: "lifecycleStatus", label: "Lifecycle status", status: "diagnostic only" },
    { fieldKey: "requirementDateWindow", label: "Requirement date window", status: "diagnostic only" },
    { fieldKey: "specialPartsPolicy", label: "Special-parts policy", status: "diagnostic only" },
  ]),
  pureReferenceDiagnosticLater: Object.freeze([
    { fieldKey: "labProofStatus", label: "Lab proof status", status: "later" },
    { fieldKey: "pureReferenceState", label: "Pure reference state", status: "later" },
    { fieldKey: "photometryGenerationAllowed", label: "Photometry generation allowed", status: "later" },
  ]),
});

function createFieldContract(sectionId, field) {
  return Object.freeze({
    fieldKey: field.fieldKey,
    label: field.label,
    sectionId,
    status: field.status || "placeholder",
    inputType: "placeholder",
    source: "runtime selector field contract",
    manualConstraintEligible: field.manualConstraintEligible === true,
    autoConsequenceEligible: field.autoConsequenceEligible === true,
    effectiveSelectionEligible: field.effectiveSelectionEligible === true,
    committedSpecEligible: field.committedSpecEligible === true,
    mutable: true,
    writes: false,
    productDataBound: false,
    resolverBound: false,
    filteringBound: false,
    requiredForSpecGate: field.requiredForSpecGate === true,
    requiredForBuildGate: field.requiredForBuildGate === true,
    value: null,
  });
}

function createSectionFieldContract() {
  return Object.freeze({
    source: "runtime selector field contract",
    sections: Object.freeze(Object.fromEntries(
      Object.keys(DEFAULT_EXPANDER_SECTIONS).map((sectionId) => [
        sectionId,
        Object.freeze({
          sectionId,
          source: "runtime selector field contract",
          status: DEFAULT_PREVIEW_BUCKET_STATUSES[sectionId] || "placeholder",
          fields: Object.freeze((DEFAULT_SECTION_FIELD_DEFINITIONS[sectionId] || []).map((field) => createFieldContract(sectionId, field))),
        }),
      ])
    )),
  });
}

const DEFAULT_SECTION_FIELD_CONTRACT = createSectionFieldContract();

function countManualConstraintEligibleFields(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  const sections = sectionFieldContract?.sections && typeof sectionFieldContract.sections === "object" && !Array.isArray(sectionFieldContract.sections)
    ? sectionFieldContract.sections
    : {};
  return Object.values(sections).reduce((count, section) => {
    const fields = Array.isArray(section.fields) ? section.fields : [];
    return count + fields.filter((field) => field.manualConstraintEligible === true).length;
  }, 0);
}

function createManualConstraintScaffold(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  return {
    source: "module-local selector scaffold",
    eligibleFieldCount: countManualConstraintEligibleFields(sectionFieldContract),
    constraints: {},
    activeManualConstraintCount: 0,
    placeholderActions: ["Set constraint later"],
    actionLabels: {
      setConstraint: "Set constraint later",
    },
    blockedReason: "constraint inputs not active yet",
    constraintInputsActive: false,
    resolverActive: false,
    filteringActive: false,
    specReady: false,
    buildReady: false,
    writes: false,
  };
}

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
  sectionFieldContract: Object.freeze({}),
  manualConstraints: Object.freeze({}),
  manualConstraintScaffold: Object.freeze({}),
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

function cloneManualConstraintScaffold(value = {}, sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  const fallback = createManualConstraintScaffold(sectionFieldContract);
  const scaffold = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const constraints = cloneObjectBucket(scaffold.constraints);
  const eligibleFieldCount = Number.isFinite(scaffold.eligibleFieldCount)
    ? scaffold.eligibleFieldCount
    : fallback.eligibleFieldCount;
  return {
    ...fallback,
    ...scaffold,
    source: scaffold.source || fallback.source,
    eligibleFieldCount,
    constraints,
    activeManualConstraintCount: Object.keys(constraints).length,
    placeholderActions: Array.isArray(scaffold.placeholderActions) ? [...scaffold.placeholderActions] : [...fallback.placeholderActions],
    actionLabels: {
      ...fallback.actionLabels,
      ...cloneObjectBucket(scaffold.actionLabels),
    },
    blockedReason: scaffold.blockedReason || fallback.blockedReason,
    constraintInputsActive: false,
    resolverActive: false,
    filteringActive: false,
    specReady: false,
    buildReady: false,
    writes: false,
  };
}

function cloneSectionFieldContract(value = DEFAULT_SECTION_FIELD_CONTRACT) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { source: "runtime selector field contract", sections: {} };
  const sections = value.sections && typeof value.sections === "object" && !Array.isArray(value.sections) ? value.sections : {};
  return {
    ...value,
    source: value.source || "runtime selector field contract",
    sections: Object.fromEntries(Object.entries(sections).map(([sectionId, section]) => [
      sectionId,
      {
        ...section,
        fields: Array.isArray(section.fields) ? section.fields.map((field) => ({ ...field, value: field.value ?? null })) : [],
      },
    ])),
  };
}

function createInitialSelectorStateContract() {
  const sectionFieldContract = cloneSectionFieldContract(DEFAULT_SECTION_FIELD_CONTRACT);
  return {
    ...SELECTOR_STATE_CONTRACT_TEMPLATE,
    previewDefaults: clonePreviewDefaults(DEFAULT_PREVIEW_DEFAULTS),
    sectionFieldContract,
    manualConstraints: {},
    manualConstraintScaffold: createManualConstraintScaffold(sectionFieldContract),
    autoConsequences: {},
    effectiveSelection: {},
    committedSpec: null,
    provenanceMap: {},
    behaviourFlags: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.behaviourFlags },
    sideEffectGuards: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.sideEffectGuards },
  };
}

function cloneSelectorStateContract(contract = {}) {
  const sectionFieldContract = cloneSectionFieldContract(contract.sectionFieldContract);
  const manualConstraints = cloneObjectBucket(contract.manualConstraints);
  const manualConstraintScaffold = cloneManualConstraintScaffold(contract.manualConstraintScaffold, sectionFieldContract);
  return {
    ...contract,
    previewDefaults: clonePreviewDefaults(contract.previewDefaults),
    sectionFieldContract,
    manualConstraints,
    manualConstraintScaffold: {
      ...manualConstraintScaffold,
      constraints: manualConstraints,
      activeManualConstraintCount: Object.keys(manualConstraints).length,
    },
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
