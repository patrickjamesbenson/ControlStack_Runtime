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

const SELECTOR_FIELD_OPTIONS = Object.freeze({
  system: Object.freeze([
    Object.freeze({ value: "linear-60", label: "Linear 60 — default-preview" }),
    Object.freeze({ value: "linear-80", label: "Linear 80" }),
  ]),
  variant: Object.freeze([
    Object.freeze({ value: "linear-60-core", label: "Linear 60 core consequence" }),
    Object.freeze({ value: "linear-80-core", label: "Linear 80 core consequence" }),
    Object.freeze({ value: "manual-variant-review", label: "Manual variant review" }),
  ]),
  emission: Object.freeze([
    Object.freeze({ value: "direct", label: "Direct" }),
    Object.freeze({ value: "direct-indirect", label: "Direct / indirect" }),
  ]),
  application: Object.freeze([
    Object.freeze({ value: "office", label: "Office — default-preview" }),
    Object.freeze({ value: "school", label: "School / education" }),
    Object.freeze({ value: "hospital", label: "Hospital / health" }),
    Object.freeze({ value: "exterior-amenity", label: "Exterior amenity" }),
  ]),
  interiorExterior: Object.freeze([
    Object.freeze({ value: "interior", label: "Interior — default-preview" }),
    Object.freeze({ value: "exterior", label: "Exterior" }),
  ]),
  ipRating: Object.freeze([
    Object.freeze({ value: "IP20", label: "IP20 — default-preview" }),
    Object.freeze({ value: "IP44", label: "IP44" }),
    Object.freeze({ value: "IP65", label: "IP65" }),
  ]),
  ikRating: Object.freeze([
    Object.freeze({ value: "IK07", label: "IK07 — default-preview" }),
    Object.freeze({ value: "IK08", label: "IK08" }),
    Object.freeze({ value: "IK10", label: "IK10" }),
  ]),
  targetLumensPerMetre: Object.freeze([
    Object.freeze({ value: "800", label: "800 lm/m" }),
    Object.freeze({ value: "1200", label: "1200 lm/m — default-preview" }),
    Object.freeze({ value: "1800", label: "1800 lm/m" }),
  ]),
  cct: Object.freeze([
    Object.freeze({ value: "3000K", label: "3000K" }),
    Object.freeze({ value: "4000K", label: "4000K — default-preview" }),
    Object.freeze({ value: "tunable-white", label: "Tunable white" }),
  ]),
  cri: Object.freeze([
    Object.freeze({ value: "CRI80", label: "CRI 80 — default-preview" }),
    Object.freeze({ value: "CRI90", label: "CRI 90" }),
  ]),
  optic: Object.freeze([
    Object.freeze({ value: "opal", label: "Opal — default-preview" }),
    Object.freeze({ value: "microprism", label: "Microprism" }),
    Object.freeze({ value: "linear-lens", label: "Linear lens" }),
  ]),
  controlType: Object.freeze([
    Object.freeze({ value: "dali-2", label: "DALI-2 — default-preview" }),
    Object.freeze({ value: "non-dim", label: "Non-dim" }),
    Object.freeze({ value: "phase-dim", label: "Phase dim" }),
  ]),
  driver: Object.freeze([
    Object.freeze({ value: "dali-driver", label: "DALI-2 driver consequence" }),
    Object.freeze({ value: "standard-driver", label: "Standard driver consequence" }),
    Object.freeze({ value: "high-output-driver", label: "High-output driver consequence" }),
    Object.freeze({ value: "manual-driver-review", label: "Manual driver review" }),
  ]),
  mountStyle: Object.freeze([
    Object.freeze({ value: "surface", label: "Surface — default-preview" }),
    Object.freeze({ value: "suspended", label: "Suspended" }),
    Object.freeze({ value: "recessed", label: "Recessed" }),
  ]),
  suspension: Object.freeze([
    Object.freeze({ value: "none", label: "None — default-preview" }),
    Object.freeze({ value: "wire", label: "Wire suspension" }),
    Object.freeze({ value: "rod", label: "Rod suspension" }),
  ]),
  ceilingType: Object.freeze([
    Object.freeze({ value: "plasterboard", label: "Plasterboard — default-preview" }),
    Object.freeze({ value: "exposed", label: "Exposed services" }),
    Object.freeze({ value: "grid", label: "Grid ceiling" }),
  ]),
  powerEntryFace: Object.freeze([
    Object.freeze({ value: "top", label: "Top — default-preview" }),
    Object.freeze({ value: "back", label: "Back" }),
    Object.freeze({ value: "end", label: "End" }),
  ]),
  powerEntryPosition: Object.freeze([
    Object.freeze({ value: "start", label: "Start — default-preview" }),
    Object.freeze({ value: "centre", label: "Centre" }),
    Object.freeze({ value: "end", label: "End" }),
  ]),
  wiringType: Object.freeze([
    Object.freeze({ value: "5-core-dali", label: "5-core DALI — default-preview" }),
    Object.freeze({ value: "3-core-switched", label: "3-core switched" }),
  ]),
  bodyFinish: Object.freeze([
    Object.freeze({ value: "white", label: "White — default-preview" }),
    Object.freeze({ value: "black", label: "Black" }),
    Object.freeze({ value: "custom", label: "Custom / review" }),
  ]),
  diffuserFinish: Object.freeze([
    Object.freeze({ value: "opal", label: "Opal — default-preview" }),
    Object.freeze({ value: "clear", label: "Clear" }),
  ]),
  trimFinish: Object.freeze([
    Object.freeze({ value: "match-body", label: "Match body — default-preview" }),
    Object.freeze({ value: "contrast", label: "Contrast" }),
  ]),
  emergency: Object.freeze([
    Object.freeze({ value: "no", label: "No emergency — default-preview" }),
    Object.freeze({ value: "yes", label: "Emergency required" }),
  ]),
  sensor: Object.freeze([
    Object.freeze({ value: "no", label: "No sensor — default-preview" }),
    Object.freeze({ value: "yes", label: "Sensor required" }),
  ]),
  specialParts: Object.freeze([
    Object.freeze({ value: "none", label: "No special parts consequence" }),
    Object.freeze({ value: "ip65-end-kit", label: "IP65 end kit consequence" }),
    Object.freeze({ value: "suspension-kit", label: "Suspension kit consequence" }),
    Object.freeze({ value: "emergency-sensor-review", label: "Emergency / sensor review consequence" }),
    Object.freeze({ value: "manual-special-parts-review", label: "Manual special parts review" }),
  ]),
  runCount: Object.freeze([
    Object.freeze({ value: "1", label: "1 run — default-preview" }),
    Object.freeze({ value: "2", label: "2 runs" }),
    Object.freeze({ value: "multiple", label: "Multiple runs" }),
  ]),
  totalLength: Object.freeze([
    Object.freeze({ value: "preview-only", label: "Preview length only — default-preview" }),
    Object.freeze({ value: "short", label: "Short run" }),
    Object.freeze({ value: "long", label: "Long run" }),
  ]),
  segmentStrategy: Object.freeze([
    Object.freeze({ value: "single-preview", label: "Single preview consequence" }),
    Object.freeze({ value: "multi-run-review", label: "Multi-run review consequence" }),
    Object.freeze({ value: "long-run-segment-review", label: "Long-run segment review consequence" }),
  ]),
});

const DEFAULT_PREVIEW_SELECTION_VALUES = Object.freeze({
  system: "linear-60",
  emission: "direct",
  application: "office",
  interiorExterior: "interior",
  ipRating: "IP20",
  ikRating: "IK07",
  targetLumensPerMetre: "1200",
  cct: "4000K",
  cri: "CRI80",
  optic: "opal",
  controlType: "dali-2",
  mountStyle: "surface",
  suspension: "none",
  ceilingType: "plasterboard",
  powerEntryFace: "top",
  powerEntryPosition: "start",
  wiringType: "5-core-dali",
  bodyFinish: "white",
  diffuserFinish: "opal",
  trimFinish: "match-body",
  emergency: "no",
  sensor: "no",
  runCount: "1",
  totalLength: "preview-only",
});

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
    inputType: SELECTOR_FIELD_OPTIONS[field.fieldKey] ? "select" : "placeholder",
    source: "runtime selector field contract",
    options: SELECTOR_FIELD_OPTIONS[field.fieldKey] ? SELECTOR_FIELD_OPTIONS[field.fieldKey].map((option) => ({ ...option })) : [],
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
    placeholderActions: ["Set or clear local constraint"],
    actionLabels: {
      setConstraint: "Set local constraint",
      clearConstraint: "Clear local constraint",
    },
    blockedReason: "not blocked — local UI state only",
    constraintInputsActive: true,
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
  selectorMode: "default-preview",
  specReady: false,
  buildReady: false,
  specGateComplete: false,
  buildGateComplete: false,
  specSlug: null,
  slugGenerationEnabled: false,
  selectorMutationScope: "local UI state only",
  boardDataMutationEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  payloadGenerationEnabled: false,
  runTableMutationEnabled: false,
  committedSpecExists: false,
  previewDefaults: Object.freeze({}),
  defaultPreviewSelections: Object.freeze({}),
  sectionFieldContract: Object.freeze({}),
  manualConstraints: Object.freeze({}),
  manualConstraintScaffold: Object.freeze({}),
  autoConsequences: Object.freeze({}),
  effectiveSelection: Object.freeze({}),
  compatibilityDiagnostics: Object.freeze({ warnings: Object.freeze([]), blockedIncompatibleFields: Object.freeze([]) }),
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
    slugGenerationActive: false,
    specExportActive: false,
    boardDataMutationActive: false,
    runTableMutationActive: false,
    payloadGenerationActive: false,
    rawBoardDataRowsExposed: false,
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
    constraintInputsActive: scaffold.constraintInputsActive === false ? false : fallback.constraintInputsActive,
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
        fields: Array.isArray(section.fields) ? section.fields.map((field) => ({
          ...field,
          options: Array.isArray(field.options) ? field.options.map((option) => ({ ...option })) : [],
          value: field.value ?? null,
        })) : [],
      },
    ])),
  };
}

function collectFieldContracts(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  const sections = sectionFieldContract?.sections && typeof sectionFieldContract.sections === "object" && !Array.isArray(sectionFieldContract.sections)
    ? sectionFieldContract.sections
    : {};
  return Object.values(sections).flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
}

function findFieldContract(sectionFieldContract, fieldKey) {
  return collectFieldContracts(sectionFieldContract).find((field) => field.fieldKey === fieldKey) || null;
}

function optionLabel(field = {}, value) {
  const option = Array.isArray(field.options) ? field.options.find((item) => item.value === value) : null;
  return option?.label || String(value || "");
}

function optionExists(field = {}, value) {
  if (!Array.isArray(field.options) || !field.options.length) return true;
  return field.options.some((item) => item.value === value);
}

function createSelectionRecord(field, value, kind, source, reason = "") {
  return {
    fieldKey: field.fieldKey,
    label: field.label || field.fieldKey,
    sectionId: field.sectionId || "unknown",
    value,
    valueLabel: optionLabel(field, value),
    kind,
    source,
    reason,
    selected: true,
    mutable: true,
    manualConstraint: kind === "manual-constraint",
    autoConsequence: kind === "auto-consequence",
    defaultPreview: kind === "default-preview",
    writes: false,
  };
}

function createDefaultPreviewSelections(sectionFieldContract = DEFAULT_SECTION_FIELD_CONTRACT) {
  return Object.fromEntries(Object.entries(DEFAULT_PREVIEW_SELECTION_VALUES).map(([fieldKey, value]) => {
    const field = findFieldContract(sectionFieldContract, fieldKey);
    if (!field || !optionExists(field, value)) return null;
    return [fieldKey, createSelectionRecord(
      field,
      value,
      "default-preview",
      "module-local default preview",
      "preamble/default-preview only; not a user-confirmed constraint"
    )];
  }).filter(Boolean));
}

function selectionValue(fieldKey, manualConstraints, defaultPreviewSelections) {
  return manualConstraints[fieldKey]?.value ?? defaultPreviewSelections[fieldKey]?.value ?? "";
}

function putAutoConsequence(output, sectionFieldContract, manualConstraints, fieldKey, value, reason) {
  if (manualConstraints[fieldKey]) return;
  const field = findFieldContract(sectionFieldContract, fieldKey);
  if (!field || !optionExists(field, value)) return;
  output[fieldKey] = createSelectionRecord(
    field,
    value,
    "auto-consequence",
    "module-local selector consequence preview",
    reason
  );
}

function deriveAutoConsequences(manualConstraints, defaultPreviewSelections, sectionFieldContract) {
  const output = {};
  const system = selectionValue("system", manualConstraints, defaultPreviewSelections);
  const controlType = selectionValue("controlType", manualConstraints, defaultPreviewSelections);
  const targetLumensPerMetre = selectionValue("targetLumensPerMetre", manualConstraints, defaultPreviewSelections);
  const ipRating = selectionValue("ipRating", manualConstraints, defaultPreviewSelections);
  const mountStyle = selectionValue("mountStyle", manualConstraints, defaultPreviewSelections);
  const emergency = selectionValue("emergency", manualConstraints, defaultPreviewSelections);
  const sensor = selectionValue("sensor", manualConstraints, defaultPreviewSelections);
  const runCount = selectionValue("runCount", manualConstraints, defaultPreviewSelections);
  const totalLength = selectionValue("totalLength", manualConstraints, defaultPreviewSelections);

  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "variant",
    system === "linear-80" ? "linear-80-core" : "linear-60-core",
    "consequence of the current system selection/default"
  );

  const driverValue = targetLumensPerMetre === "1800"
    ? "high-output-driver"
    : controlType === "non-dim"
      ? "standard-driver"
      : "dali-driver";
  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "driver",
    driverValue,
    "consequence of current control type and lumen target constraints/defaults"
  );

  const specialPartsValue = emergency === "yes" || sensor === "yes"
    ? "emergency-sensor-review"
    : ipRating === "IP65"
      ? "ip65-end-kit"
      : mountStyle === "suspended"
        ? "suspension-kit"
        : "none";
  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "specialParts",
    specialPartsValue,
    "consequence of current IP, mounting, emergency, and sensor constraints/defaults"
  );

  const segmentStrategyValue = totalLength === "long"
    ? "long-run-segment-review"
    : runCount === "multiple" || runCount === "2"
      ? "multi-run-review"
      : "single-preview";
  putAutoConsequence(
    output,
    sectionFieldContract,
    manualConstraints,
    "segmentStrategy",
    segmentStrategyValue,
    "consequence of current run count and length constraints/defaults"
  );

  return output;
}

function createCompatibilityWarning(fieldKey, label, value, message, severity = "warning") {
  return {
    fieldKey,
    label,
    value,
    message,
    severity,
    diagnosticOnly: true,
    autoCleared: false,
  };
}

function evaluateCompatibilityDiagnostics(effectiveSelection = {}) {
  const value = (fieldKey) => effectiveSelection[fieldKey]?.value || "";
  const label = (fieldKey) => effectiveSelection[fieldKey]?.label || fieldKey;
  const warnings = [];

  if (value("interiorExterior") === "exterior" && value("ipRating") !== "IP65") {
    warnings.push(createCompatibilityWarning(
      "ipRating",
      label("ipRating"),
      value("ipRating"),
      "Exterior selections are diagnostically incompatible with the current IP rating unless IP65 is selected. The manual selection is preserved for review."
    ));
  }
  if (value("application") === "school" && value("ikRating") !== "IK10") {
    warnings.push(createCompatibilityWarning(
      "ikRating",
      label("ikRating"),
      value("ikRating"),
      "School / education selections should be reviewed against IK10 durability. The current choice is labelled, not silently cleared."
    ));
  }
  if (value("mountStyle") === "recessed" && value("suspension") !== "none") {
    warnings.push(createCompatibilityWarning(
      "suspension",
      label("suspension"),
      value("suspension"),
      "Recessed mounting and suspension are blocked/incompatible as a diagnostic condition. The selected values remain visible."
    ));
  }
  if (value("controlType") === "non-dim" && value("sensor") === "yes") {
    warnings.push(createCompatibilityWarning(
      "controlType",
      label("controlType"),
      value("controlType"),
      "Sensor selection with non-dim control requires driver/control review. Nothing is removed automatically."
    ));
  }
  if (value("emission") === "direct-indirect" && value("mountStyle") === "recessed") {
    warnings.push(createCompatibilityWarning(
      "mountStyle",
      label("mountStyle"),
      value("mountStyle"),
      "Direct / indirect emission is diagnostically incompatible with recessed mounting in this local UI slice."
    ));
  }

  return {
    warnings,
    blockedIncompatibleFields: warnings.map((warning) => ({
      fieldKey: warning.fieldKey,
      label: warning.label,
      value: warning.value,
      reason: warning.message,
      diagnosticOnly: true,
      autoCleared: false,
    })),
  };
}

function createProvenanceMap(effectiveSelection = {}) {
  return Object.fromEntries(Object.entries(effectiveSelection).map(([fieldKey, selection]) => [
    fieldKey,
    {
      kind: selection.kind,
      source: selection.source,
      reason: selection.reason || "none",
      mutable: selection.mutable !== false,
      writes: false,
    },
  ]));
}

function recomputeSelectorStateContract(contract = {}) {
  const sectionFieldContract = cloneSectionFieldContract(contract.sectionFieldContract || DEFAULT_SECTION_FIELD_CONTRACT);
  const manualConstraints = cloneObjectBucket(contract.manualConstraints);
  const defaultPreviewSelections = createDefaultPreviewSelections(sectionFieldContract);
  const autoConsequences = deriveAutoConsequences(manualConstraints, defaultPreviewSelections, sectionFieldContract);
  const effectiveSelection = {
    ...defaultPreviewSelections,
    ...autoConsequences,
    ...manualConstraints,
  };
  const compatibilityDiagnostics = evaluateCompatibilityDiagnostics(effectiveSelection);
  const manualConstraintCount = Object.keys(manualConstraints).length;
  const scaffold = createManualConstraintScaffold(sectionFieldContract);
  const selectorMode = compatibilityDiagnostics.warnings.length
    ? "diagnostic"
    : manualConstraintCount
      ? "manual-constraint-editing"
      : "default-preview";

  return {
    ...SELECTOR_STATE_CONTRACT_TEMPLATE,
    ...contract,
    selectorMode,
    freshLoad: manualConstraintCount === 0,
    previewDefaultState: manualConstraintCount === 0,
    specReady: false,
    buildReady: false,
    specGateComplete: false,
    buildGateComplete: false,
    specSlug: null,
    slugGenerationEnabled: false,
    selectorMutationScope: "local UI state only",
    boardDataMutationEnabled: false,
    labProofAuthority: false,
    iesGenerationEnabled: false,
    payloadGenerationEnabled: false,
    runTableMutationEnabled: false,
    committedSpecExists: false,
    previewDefaults: clonePreviewDefaults(contract.previewDefaults || DEFAULT_PREVIEW_DEFAULTS),
    defaultPreviewSelections,
    sectionFieldContract,
    manualConstraints,
    manualConstraintScaffold: {
      ...scaffold,
      constraints: manualConstraints,
      activeManualConstraintCount: manualConstraintCount,
      constraintInputsActive: true,
      resolverActive: false,
      filteringActive: false,
      specReady: false,
      buildReady: false,
      writes: false,
    },
    autoConsequences,
    effectiveSelection,
    compatibilityDiagnostics,
    committedSpec: null,
    provenanceMap: createProvenanceMap(effectiveSelection),
    behaviourFlags: {
      ...SELECTOR_STATE_CONTRACT_TEMPLATE.behaviourFlags,
      ...cloneObjectBucket(contract.behaviourFlags),
    },
    sideEffectGuards: {
      ...SELECTOR_STATE_CONTRACT_TEMPLATE.sideEffectGuards,
      ...cloneObjectBucket(contract.sideEffectGuards),
      productCardsRendered: false,
      filteringActive: false,
      saveLoadActive: false,
      engineCallsActive: false,
      labCallsActive: false,
      iesCallsActive: false,
      downstreamPayloadActive: false,
      authorityWritesActive: false,
      slugGenerationActive: false,
      specExportActive: false,
      boardDataMutationActive: false,
      runTableMutationActive: false,
      payloadGenerationActive: false,
      rawBoardDataRowsExposed: false,
      rawUsersExposed: false,
      rawLabEvidenceExposed: false,
    },
  };
}

function normaliseManualValue(value) {
  return String(value ?? "").trim();
}

function createInitialSelectorStateContract() {
  const sectionFieldContract = cloneSectionFieldContract(DEFAULT_SECTION_FIELD_CONTRACT);
  return recomputeSelectorStateContract({
    ...SELECTOR_STATE_CONTRACT_TEMPLATE,
    previewDefaults: clonePreviewDefaults(DEFAULT_PREVIEW_DEFAULTS),
    sectionFieldContract,
    manualConstraints: {},
    committedSpec: null,
    behaviourFlags: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.behaviourFlags },
    sideEffectGuards: { ...SELECTOR_STATE_CONTRACT_TEMPLATE.sideEffectGuards },
  });
}

function cloneSelectorStateContract(contract = {}) {
  const sectionFieldContract = cloneSectionFieldContract(contract.sectionFieldContract);
  const manualConstraints = cloneObjectBucket(contract.manualConstraints);
  const manualConstraintScaffold = cloneManualConstraintScaffold(contract.manualConstraintScaffold, sectionFieldContract);
  return {
    ...contract,
    previewDefaults: clonePreviewDefaults(contract.previewDefaults),
    defaultPreviewSelections: cloneObjectBucket(contract.defaultPreviewSelections),
    sectionFieldContract,
    manualConstraints,
    manualConstraintScaffold: {
      ...manualConstraintScaffold,
      constraints: manualConstraints,
      activeManualConstraintCount: Object.keys(manualConstraints).length,
    },
    autoConsequences: cloneObjectBucket(contract.autoConsequences),
    effectiveSelection: cloneObjectBucket(contract.effectiveSelection),
    compatibilityDiagnostics: {
      warnings: Array.isArray(contract.compatibilityDiagnostics?.warnings) ? contract.compatibilityDiagnostics.warnings.map((warning) => ({ ...warning })) : [],
      blockedIncompatibleFields: Array.isArray(contract.compatibilityDiagnostics?.blockedIncompatibleFields) ? contract.compatibilityDiagnostics.blockedIncompatibleFields.map((field) => ({ ...field })) : [],
    },
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

    setSelectorFieldValue(fieldKey, value) {
      const normalisedValue = normaliseManualValue(value);
      if (!normalisedValue) return this.clearSelectorFieldValue(fieldKey);

      const currentContract = state.selectorStateContract;
      const field = findFieldContract(currentContract.sectionFieldContract, fieldKey);
      if (!field || !optionExists(field, normalisedValue)) {
        state.lastAction = `manual-constraint-rejected:${fieldKey}`;
        return this.getSnapshot();
      }

      const previousSelection = currentContract.effectiveSelection?.[fieldKey] || null;
      const nextManualConstraints = cloneObjectBucket(currentContract.manualConstraints);
      nextManualConstraints[fieldKey] = {
        ...createSelectionRecord(
          field,
          normalisedValue,
          "manual-constraint",
          "user-selected local UI constraint",
          previousSelection?.kind === "auto-consequence"
            ? "user changed an auto-derived consequence; promoted to manual constraint"
            : previousSelection?.kind === "default-preview"
              ? "user changed a default-preview selection; promoted to manual constraint"
              : "user-selected durable manual constraint"
        ),
        promotedFrom: previousSelection?.kind || "none",
      };

      state.selectorStateContract = recomputeSelectorStateContract({
        ...currentContract,
        manualConstraints: nextManualConstraints,
      });
      state.localDirty = true;
      state.lastAction = `manual-constraint:${fieldKey}`;
      return this.getSnapshot();
    },

    clearSelectorFieldValue(fieldKey) {
      const currentContract = state.selectorStateContract;
      const nextManualConstraints = cloneObjectBucket(currentContract.manualConstraints);
      if (Object.prototype.hasOwnProperty.call(nextManualConstraints, fieldKey)) {
        delete nextManualConstraints[fieldKey];
        state.selectorStateContract = recomputeSelectorStateContract({
          ...currentContract,
          manualConstraints: nextManualConstraints,
        });
        state.localDirty = true;
        state.lastAction = `manual-constraint-cleared:${fieldKey}`;
      }
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
