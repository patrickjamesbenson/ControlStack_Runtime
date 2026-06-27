function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function appendText(parent, tagName, text, className = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function appendDefinitionList(parent, rows) {
  const list = document.createElement("dl");
  list.className = "cs-selector-proof__meta";
  for (const [label, value] of rows) {
    appendText(list, "dt", label);
    appendText(list, "dd", value);
  }
  parent.appendChild(list);
}

function appendPillList(parent, items) {
  const list = document.createElement("ul");
  list.className = "cs-shell__pill-list";
  for (const item of items) appendText(list, "li", item);
  parent.appendChild(list);
}

const LIVE_STATUS_COPY = Object.freeze([
  "Board Data / Selector Reference live status is read-only in this slice.",
  "This status bridge reports source presence, table readiness, and redaction safety only.",
  "Raw rows, raw USERS, raw Lab evidence, credentials, private paths, and secret values are not exposed.",
  "Active authoritative Selector resolving remains disabled; this page may show a read-only resolver preview only.",
  "Board Data defines metadata. Selector previews resolution. Lab proves later.",
]);

function appendSection(parent, heading, rows) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", heading);
  appendDefinitionList(section, rows);
  parent.appendChild(section);
}

function readSpecialPartsDiagnosticsRows(viewModel) {
  const timelinePolicy = viewModel.timelinePolicy || {};
  const selectorTimelineContext = viewModel.selectorTimelineContext || {};
  const compatibility = viewModel.specialPartsCompatibility || {};
  return [
    ["Timeline context", selectorTimelineContext.status || timelinePolicy.selectorConsumptionStatus || "passive-consumer"],
    ["Special parts compatibility", compatibility.live || timelinePolicy.specialPartsCompatibilityLive || "passive"],
    ["Entitled parts count", compatibility.entitledCount ?? timelinePolicy.specialPartsEntitledCount ?? 0],
    ["Compatible count", compatibility.compatibleCount ?? timelinePolicy.specialPartsCompatibleCount ?? 0],
    ["Incompatible count", compatibility.incompatibleCount ?? timelinePolicy.specialPartsIncompatibleCount ?? 0],
    ["Unknown count", compatibility.unknownCount ?? timelinePolicy.specialPartsUnknownCount ?? 0],
    ["Filtering live", timelinePolicy.specialPartsFilteringLive || "no"],
    ["Opt-in live", timelinePolicy.specialPartsOptInLive || "no"],
    ["Build mutation live", timelinePolicy.specialPartsBuildMutationLive || "no"],
    ["Display mode", "developer diagnostics only"],
  ];
}

function readTimelineFilteringRows(viewModel) {
  const policy = viewModel.timelinePolicy || {};
  const filtering = viewModel.timelineFiltering || {};
  return [
    ["Timeline policy evaluation live", policy.timelineFilterEvaluationLive === true ? "yes" : policy.timelineFilterEvaluationLive || "no"],
    ["Timeline warnings live", policy.timelineWarningsLive === true ? "yes" : policy.timelineWarningsLive || "no"],
    ["Actual product-card filtering live", policy.timelineProductCardFilteringLive === true ? "yes" : policy.timelineProductCardFilteringLive || "no"],
    ["Filter status", policy.timelineFilterStatus || filtering.status || "unknown"],
    ["Allowed lifecycle statuses", policy.timelineAllowedStatusKeys || (filtering.allowedStatusKeys || []).join(", ") || "live"],
    ["Project requirement date", policy.timelineRequirementDate || filtering.requirementDate || "not set"],
    ["Timeline access", policy.timelineAccessState || filtering.accessState || "not-enabled-placeholder"],
    ["Filtered item count", policy.timelineFilteredItemCount ?? filtering.filteredItemCount ?? 0],
    ["Out-of-window item count", policy.timelineOutOfWindowItemCount ?? filtering.outOfWindowItemCount ?? 0],
    ["Affected selections", policy.timelineAffectedSelections || "none"],
    ["Slug/build mutation", "no"],
  ];
}

function appendTimelineWarnings(parent, viewModel) {
  const warnings = viewModel.timelineFiltering?.warnings || [];
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", "Timeline warnings");
  appendPillList(section, warnings.length ? warnings : ["No Timeline warnings reported."]);
  parent.appendChild(section);
}

function yesNo(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === null || value === undefined) return "unknown";
  return String(value);
}

function forcedFalse(value) {
  return value === true ? "true" : "false";
}

function valueOrNone(value) {
  if (value === null || value === undefined || value === "") return "none";
  return String(value);
}

function selectorReferenceSourceRows(reference = {}) {
  const source = reference.source || reference.activeSnapshot || {};
  const materialised = reference.materialisedSnapshot || {};
  return [
    ["endpoint", reference.endpoint || "/api/selector-reference/status"],
    ["status", reference.status || (reference.ok === true ? "loaded" : "unknown")],
    ["ok", yesNo(reference.ok)],
    ["active snapshot label", source.label || "runtime-authority-reference-active-snapshot"],
    ["active snapshot present", yesNo(source.present)],
    ["active snapshot readable", yesNo(source.readable)],
    ["active snapshot parseable", yesNo(source.parseable)],
    ["active snapshot modified", valueOrNone(source.modifiedTime)],
    ["active snapshot file size", source.fileSize === undefined || source.fileSize === null ? "none" : `${source.fileSize} bytes`],
    ["materialised snapshot label", materialised.label || "runtime-authority-reference-materialised-novondb"],
    ["materialised snapshot present", yesNo(materialised.present)],
    ["materialised snapshot readable", yesNo(materialised.readable)],
    ["materialised snapshot modified", valueOrNone(materialised.modifiedTime)],
    ["materialised snapshot file size", materialised.fileSize === undefined || materialised.fileSize === null ? "none" : `${materialised.fileSize} bytes`],
    ["read only", yesNo(reference.readOnly)],
    ["raw rows exposed", forcedFalse(reference.rawRowsExposed)],
    ["raw headers exposed", forcedFalse(reference.rawHeadersExposed)],
    ["raw Lab evidence exposed", forcedFalse(reference.rawLabEvidenceExposed)],
    ["credentials exposed", forcedFalse(reference.credentialsExposed)],
    ["private paths exposed", forcedFalse(reference.privatePathsExposed)],
  ];
}

function selectorReferenceTableRows(reference = {}) {
  const tables = Array.isArray(reference.tableSummary) ? reference.tableSummary : [];
  if (!tables.length) return [["tables", "loading or unavailable"]];
  return tables.map((table) => [
    table.table || "unknown",
    `present:${yesNo(table.present)}; count:${table.present ? table.rowCount : 0}; rawRowsExposed:${forcedFalse(table.rawRowsExposed)}; rawHeadersExposed:${forcedFalse(table.rawHeadersExposed)}; headersReturned:${forcedFalse(table.headersReturned)}`,
  ]);
}

function selectorExpectedTables(reference = {}) {
  return Array.isArray(reference.expectedTables) && reference.expectedTables.length
    ? reference.expectedTables
    : (Array.isArray(reference.selectorCriticalTables) ? reference.selectorCriticalTables : []);
}

function selectorPresentTables(reference = {}) {
  if (Array.isArray(reference.presentTables)) return reference.presentTables;
  return (Array.isArray(reference.tableSummary) ? reference.tableSummary : [])
    .filter((table) => table.present)
    .map((table) => table.table);
}

function selectorReferenceBridgeRows(reference = {}) {
  const source = reference.source || reference.activeSnapshot || {};
  const materialised = reference.materialisedSnapshot || {};
  const users = reference.usersRedactionStatus || {};
  const missingTables = Array.isArray(reference.missingTables) ? reference.missingTables : [];
  return [
    ["active snapshot present", yesNo(source.present)],
    ["active snapshot readable", yesNo(source.readable)],
    ["active snapshot parseable", yesNo(source.parseable)],
    ["materialised snapshot present", yesNo(materialised.present)],
    ["materialised snapshot readable", yesNo(materialised.readable)],
    ["expected tables", selectorExpectedTables(reference).join(", ") || "none reported"],
    ["present tables", selectorPresentTables(reference).join(", ") || "none reported"],
    ["missing tables", missingTables.length ? missingTables.join(", ") : "none reported"],
    ["safe table counts visible", "true"],
    ["USERS present", yesNo(users.present)],
    ["USERS count only", users.count ?? 0],
    ["USERS raw rows exposed", forcedFalse(users.rawRowsExposed)],
    ["USERS raw headers exposed", forcedFalse(users.rawHeadersExposed)],
    ["raw rows exposed", forcedFalse(reference.rawRowsExposed)],
    ["raw headers exposed", forcedFalse(reference.rawHeadersExposed)],
    ["raw Lab evidence exposed", forcedFalse(reference.rawLabEvidenceExposed)],
    ["credentials exposed", forcedFalse(reference.credentialsExposed)],
    ["private paths exposed", forcedFalse(reference.privatePathsExposed)],
    ["source status read-only", "true"],
    ["Board Data write enabled", forcedFalse(reference.boardDataWriteEnabled)],
    ["materialiser write enabled", forcedFalse(reference.materialiserWriteEnabled)],
    ["Selector resolving enabled", forcedFalse(reference.selectorResolvingEnabled ?? reference.activeResolverEnabled)],
    ["spec generation enabled", forcedFalse(reference.specGenerationEnabled)],
    ["Lab proof authority", forcedFalse(reference.labProofAuthority)],
  ];
}

function selectorReferenceProofWarnings(reference = {}) {
  const requiredWarnings = [
    "No approved Lab pure reference state found for this selection.",
    "Photometry blocked. Selector resolved metadata only. PURE_REF_STATE, baseline_slug, pure_ref_lm, optic_lumen_measured, eff_optical, and driver util_curve_file are not approved photometric proof. No arbitrary IES, generic optic file, nearest-looking photometry, default photometry, or efficiency fallback may be used.",
  ];
  const loadedWarnings = Array.isArray(reference.warnings) ? reference.warnings : [];
  return [...new Set([...loadedWarnings, ...requiredWarnings])];
}

function appendSelectorFieldContractDiagnostic(parent, shell = {}) {
  appendSection(parent, "Selector field contract diagnostic", shell.fieldContractSummaryRows || [
    ["field contract source", "runtime selector field contract"],
    ["section count", 0],
    ["field count", 0],
    ["manual constraint eligible fields", 0],
    ["auto consequence eligible fields", 0],
    ["required for spec gate count", 0],
    ["required for build gate count", 0],
    ["product data bound", "false"],
    ["resolver bound", "false"],
    ["filtering bound", "false"],
    ["writes", "false"],
  ]);

  const sectionDiagnostics = Array.isArray(shell.sectionFieldContractDiagnostics) ? shell.sectionFieldContractDiagnostics : [];
  for (const section of sectionDiagnostics) {
    const sectionDetails = document.createElement("details");
    sectionDetails.className = "cs-selector-proof__section";
    sectionDetails.open = true;

    const sectionSummary = document.createElement("summary");
    sectionSummary.textContent = `${section.title || section.sectionId} field contracts — ${section.fieldCount ?? 0} fields`;
    sectionDetails.appendChild(sectionSummary);

    appendDefinitionList(sectionDetails, [
      ["sectionId", section.sectionId || "unknown"],
      ["status", section.status || "placeholder"],
      ["source", section.source || "runtime selector field contract"],
      ["field count", section.fieldCount ?? 0],
    ]);

    const fields = Array.isArray(section.fields) ? section.fields : [];
    for (const field of fields) {
      const fieldDetails = document.createElement("details");
      fieldDetails.className = "cs-selector-proof__section";
      fieldDetails.open = true;
      const fieldSummary = document.createElement("summary");
      fieldSummary.textContent = `${field.label || field.fieldKey} — ${field.status || "placeholder"}`;
      fieldDetails.appendChild(fieldSummary);
      appendDefinitionList(fieldDetails, field.rows || [["fieldKey", field.fieldKey || "unknown"]]);
      sectionDetails.appendChild(fieldDetails);
    }

    parent.appendChild(sectionDetails);
  }
}

function appendSelectorManualConstraintBehaviour(parent, shell = {}) {
  const behaviour = shell.manualConstraintBehaviour || {};
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", "Manual constraints and auto consequences");
  appendPillList(section, behaviour.requiredWording || [
    "Manual selections are constraints.",
    "Auto selections are consequences.",
    "Compatible manual selections are preserved when other fields change.",
    "Auto-derived selections may appear selected, but remain changeable.",
    "Fresh load is default-preview / preamble state, not spec-ready.",
    "No spec-ready slug is generated in this slice.",
    "Selector does not provide Lab proof.",
  ]);

  appendSection(section, "Diagnostic/manual constraint panel", behaviour.summaryRows || [
    ["current mode", "default-preview"],
    ["selected fields", "none"],
    ["manual constraints list", "none"],
    ["auto consequences list", "none"],
    ["default-preview selections list", "none"],
    ["compatibility warnings", "none"],
    ["blocked/incompatible fields", "none"],
    ["specReady", "false"],
    ["slugGenerationEnabled", "false"],
    ["selectorMutationScope", "local UI state only"],
    ["boardDataMutationEnabled", "false"],
    ["labProofAuthority", "false"],
    ["iesGenerationEnabled", "false"],
    ["payloadGenerationEnabled", "false"],
    ["runTableMutationEnabled", "false"],
  ]);
  appendSection(section, "Manual constraints list", behaviour.manualConstraintRows || [["manual constraints", "none"]]);
  appendSection(section, "Auto consequences list", behaviour.autoConsequenceRows || [["auto consequences", "none"]]);
  appendSection(section, "Default-preview selections list", behaviour.defaultPreviewRows || [["default-preview selections", "none"]]);
  appendSection(section, "Compatibility warnings", behaviour.compatibilityWarningRows || [["compatibility warnings", "none"]]);
  appendSection(section, "Blocked/incompatible fields", behaviour.blockedFieldRows || [["blocked/incompatible fields", "none"]]);

  const controlSections = Array.isArray(behaviour.controlSections) ? behaviour.controlSections : [];
  const controls = document.createElement("section");
  controls.className = "cs-selector-proof__section";
  appendText(controls, "h3", "Local selector controls — manual constraints only");
  appendText(controls, "p", "Changing any displayed field records a local manual constraint. Auto-derived and default-preview selections remain changeable. No backend write, slug, export, payload, RunTable, IES, Board Data mutation, or Lab proof is produced.");

  for (const group of controlSections) {
    const details = document.createElement("details");
    details.className = "cs-selector-proof__section";
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = group.title || group.sectionId || "Selector fields";
    details.appendChild(summary);

    for (const field of group.fields || []) {
      const row = document.createElement("div");
      row.className = "cs-selector-proof__section";
      const label = document.createElement("label");
      label.textContent = `${field.label || field.fieldKey} — ${field.stateLabel || "changeable"}`;
      label.htmlFor = `cs-selector-${field.fieldKey}`;
      row.appendChild(label);

      const select = document.createElement("select");
      select.id = `cs-selector-${field.fieldKey}`;
      select.dataset.fieldKey = field.fieldKey;
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "Clear manual constraint / return to preview consequence";
      select.appendChild(emptyOption);
      for (const option of field.options || []) {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label || option.value;
        select.appendChild(optionElement);
      }
      select.value = field.value || "";
      select.addEventListener("change", () => {
        group.setFieldValue?.(field.fieldKey, select.value);
      });
      row.appendChild(select);

      appendDefinitionList(row, [
        ["state", field.stateLabel || "changeable"],
        ["selected kind", field.selectedKind || "unselected"],
        ["value", field.valueLabel || field.value || "none"],
        ["mutable", field.mutable === false ? "false" : "true"],
      ]);

      if (field.manualConstraint) {
        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.textContent = "Clear manual constraint";
        clearButton.addEventListener("click", () => {
          group.clearManualConstraint?.(field.fieldKey);
        });
        row.appendChild(clearButton);
      }

      details.appendChild(row);
    }
    controls.appendChild(details);
  }

  section.appendChild(controls);
  parent.appendChild(section);
}

function appendRelationshipMap(parent, relationshipMap = []) {
  const rows = Array.isArray(relationshipMap) && relationshipMap.length
    ? relationshipMap.map((entry) => [entry.system || "unknown", entry.role || "not specified"])
    : [["Board Data", "metadata authority"], ["Selector", "selection and readiness reasoning"], ["Lab Proof", "production proof authority"]];
  appendSection(parent, "Relationship map", rows);
}

function appendSelectorCandidateStateExplainer(parent, candidateState = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", candidateState.title || "Selector candidate-state explainer");
  appendText(section, "p", candidateState.status || "read-only candidate-state explanation over readiness chain");
  appendPillList(section, candidateState.boundaryCopy || [
    "Selector candidate state is read-only and diagnostic in this slice.",
    "A candidate is not a production specification.",
    "A compatible candidate is not Lab proven.",
    "Spec-ready does not mean production-proven.",
    "Selector does not generate IES, create Controlled Records, invoke RREG, or claim Lab Proof here.",
    "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
    "Controlled Records records provenance later. RREG maps review and custody later.",
  ]);
  appendSection(section, "Candidate-state runtime status flags", candidateState.runtimeStatusRows || [
    ["readOnly", "true"],
    ["diagnosticOnly", "true"],
    ["candidateStateExplanationOnly", "true"],
    ["activeResolverEnabled", "false"],
    ["selectorMutationEnabled", "false"],
    ["compatibleSelectionClearingEnabled", "false"],
    ["specGenerationEnabled", "false"],
    ["slugGenerationEnabled", "false"],
    ["iesGenerationEnabled", "false"],
    ["labProofAuthority", "false"],
    ["controlledRecordWriteEnabled", "false"],
    ["rregApprovalEnabled", "false"],
    ["rregCustodyTransferEnabled", "false"],
    ["boardDataWriteEnabled", "false"],
    ["runtimeDataWriteEnabled", "false"],
    ["hiddenWriteBackEnabled", "false"],
  ]);
  appendSection(section, "Candidate state categories", candidateState.categoryRows || [["default preview", "available diagnostic category"]]);
  appendSection(section, "Candidate explainer fields", candidateState.fieldRows || [["candidate_state", "default preview"]]);
  appendSection(section, "Readiness chain map", candidateState.readinessChainRows || [
    ["Selector readiness", "selection/candidate reasoning"],
    ["IES Builder readiness", "candidate artefact readiness later"],
    ["Lab Proof readiness", "proof boundary, not active proof authority in this slice"],
    ["Controlled Records", "future provenance/disposition trail"],
    ["RREG", "future reviewer/approver/custody mapping"],
    ["Engine Flow", "confidence path explanation, not execution"],
  ]);
  parent.appendChild(section);
}

function appendPreviewResultSummary(parent, summary = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section cs-selector-proof__section--nested";
  appendText(section, "h4", summary.title || "Preview result summary");
  appendText(section, "p", summary.status || "Preview result is explanatory only.");
  appendPillList(section, summary.boundaryCopy || [
    "Preview result is explanatory only.",
    "This is not a committed Selector result.",
    "This is not a production specification.",
    "This is not a slug authority.",
    "This is not Lab Proof.",
    "No downstream artefact, record, approval, custody transfer, or write is created here.",
  ]);
  appendSection(section, "Preview result required flags", summary.flagRows || [
    ["previewResultSummaryOnly", "true"],
    ["committedSelectorResult", "false"],
    ["productionSpecification", "false"],
    ["slugAuthorityEnabled", "false"],
    ["downstreamArtefactCreated", "false"],
    ["proofAuthority", "false"],
    ["controlledRecordCreated", "false"],
    ["rregAssignmentCreated", "false"],
    ["writeBackCreated", "false"],
  ]);
  appendSection(section, "Candidate summary", summary.candidateSummaryRows || [["candidate state", "default preview"]]);
  appendSection(section, "Why this candidate exists", summary.whyRows || [["manual constraints", "none yet"]]);
  appendSection(section, "Blocked / missing reasons", summary.blockedMissingRows || [["spec gate incomplete", "blocked"]]);
  appendSection(section, "Path to spec-ready later", summary.specReadyPathRows || [["spec gate completed later", "required later"]]);
  appendSection(section, "Downstream disabled status", summary.downstreamDisabledRows || [["slug/spec generation", "disabled"]]);
  parent.appendChild(section);
}

function appendSelectorReadonlyResolverPreview(parent, preview = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", preview.title || "Selector read-only resolver preview");
  appendText(section, "p", preview.status || "preview-only candidate readiness over safe Selector Reference metadata");
  appendPillList(section, preview.boundaryCopy || [
    "Preview result is explanatory only.",
    "This is not a committed Selector result.",
    "This is not a production specification.",
    "This is not a slug authority.",
    "This is not Lab Proof.",
    "No downstream artefact, record, approval, custody transfer, or write is created here.",
    "Manual selections remain constraints. Auto selections remain consequences.",
    "Compatible selections are not cleared by this preview.",
    "Preview-ready does not mean spec-ready.",
    "Spec-ready does not mean Lab proven.",
    "Board Data defines metadata. Selector previews resolution. IES Builder may generate candidate artefacts later. Lab proves later.",
  ]);

  appendPreviewResultSummary(section, preview.previewResultSummary || {});

  appendSection(section, "Resolver-preview runtime status flags", preview.runtimeStatusRows || [
    ["readOnly", "true"],
    ["diagnosticOnly", "true"],
    ["resolverPreviewOnly", "true"],
    ["activeResolverEnabled", "false"],
    ["selectorMutationEnabled", "false"],
    ["compatibleSelectionClearingEnabled", "false"],
    ["boardDataWriteEnabled", "false"],
    ["specGenerationEnabled", "false"],
    ["slugGenerationEnabled", "false"],
    ["slugAuthorityEnabled", "false"],
    ["iesGenerationEnabled", "false"],
    ["payloadGenerationEnabled", "false"],
    ["runTableGenerationEnabled", "false"],
    ["drawingGenerationEnabled", "false"],
    ["labProofAuthority", "false"],
    ["controlledRecordWriteEnabled", "false"],
    ["rregAssignmentEnabled", "false"],
    ["rregApprovalEnabled", "false"],
    ["rregCustodyTransferEnabled", "false"],
    ["runtimeDataMutationEnabled", "false"],
    ["hiddenWriteBackEnabled", "false"],
    ["rawRowsExposed", "false"],
    ["rawUsersExposed", "false"],
    ["rawLabEvidenceExposed", "false"],
    ["credentialsExposed", "false"],
    ["privatePathsExposed", "false"],
  ]);
  appendSection(section, "Resolver-preview categories", preview.categoryRows || [["default preview", "available resolver-preview category"]]);
  appendSection(section, "Resolver-preview required fields", preview.fieldRows || [["preview_state", "default preview"]]);
  appendSection(section, "Source readiness", preview.sourceRows || [["source_status", "source unavailable"]]);
  appendSection(section, "Expected table readiness", preview.tableRows || [["source_tables_ready", "false"]]);
  appendSection(section, "Current manual constraints", preview.manualConstraintRows || [["manual constraints", "none"]]);
  appendSection(section, "Current auto consequences", preview.autoConsequenceRows || [["auto consequences", "none"]]);
  appendSection(section, "Current effective selection", preview.effectiveSelectionRows || [["effective selection", "none"]]);
  appendSection(section, "Compatibility summary", preview.compatibilityRows || [["compatibility_summary", "candidate readiness only"]]);
  appendSection(section, "Unresolved / missing reasons", preview.unresolvedReasonRows || [["reason", "spec gate is incomplete"]]);
  appendSection(section, "Downstream disabled states", preview.downstreamRows || [["downstream outputs disabled", "true"]]);
  appendSection(section, "Resolver-preview relationship map", preview.relationshipRows || [
    ["Board Data / Selector Reference", "safe source-readiness metadata"],
    ["Selector", "read-only preview of candidate resolution"],
    ["IES Builder", "downstream candidate artefact generation later"],
    ["Lab Proof", "future proof boundary"],
    ["Controlled Records", "future provenance/disposition trail"],
    ["RREG", "future review/custody mapping"],
    ["Engine Flow", "confidence path explanation only"],
  ]);
  parent.appendChild(section);
}

function appendSelectorReadinessDiagnostics(parent, shell = {}) {
  const diagnostics = shell.readinessDiagnostics || {};
  const compatibility = diagnostics.compatibility || {};
  const specGate = diagnostics.specGate || {};

  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", diagnostics.title || "Selector readiness diagnostics");
  appendText(section, "p", diagnostics.status || "read-only diagnostic foundation");
  appendPillList(section, diagnostics.requiredBoundaryCopy || [
    "Selector readiness diagnostics are read-only in this slice.",
    "Compatibility is not proof.",
    "Spec-ready does not mean production-proven.",
    "Slug generation remains disabled unless an approved future spec gate is complete.",
    "A candidate may be compatible without being Lab proven.",
    "Board Data defines metadata. Selector resolves. Lab proves.",
    "IES Builder may create candidate photometric artefacts later.",
    "Engine Flow explains the confidence path; it does not execute it.",
  ]);
  appendPillList(section, diagnostics.manualVsAuto || [
    "Manual selections are constraints.",
    "Auto selections are consequences.",
    "Compatible selections must not be cleared just because another field changes.",
    "Auto-derived items may appear selected but must remain changeable.",
    "Fresh load is preamble/default-preview state, not spec-ready state.",
  ]);
  appendRelationshipMap(section, diagnostics.relationshipMap);
  appendSelectorCandidateStateExplainer(section, diagnostics.candidateState);

  appendSection(section, compatibility.title || "Compatibility diagnostics", compatibility.summaryRows || [
    ["mode", "compatibility explanation matrix only"],
    ["compatible selections auto-cleared", "false"],
    ["compatibility proof claim", "false"],
    ["Lab Proof claim", "false"],
  ]);
  appendSection(section, "Compatibility runtime status flags", compatibility.runtimeStatusRows || [
    ["readOnly", "true"],
    ["diagnosticOnly", "true"],
    ["compatibilityExplanationOnly", "true"],
    ["activeResolverEnabled", "false"],
    ["autoSelectionMutationEnabled", "false"],
    ["manualConstraintMutationEnabled", "false"],
    ["specGenerationEnabled", "false"],
    ["slugGenerationEnabled", "false"],
    ["boardDataWriteEnabled", "false"],
    ["labProofAuthority", "false"],
    ["iesGenerationEnabled", "false"],
    ["engineExecutionEnabled", "false"],
    ["runTableGenerationEnabled", "false"],
    ["payloadGenerationEnabled", "false"],
    ["drawingGenerationEnabled", "false"],
    ["hiddenWriteBackEnabled", "false"],
  ]);
  appendSection(section, "Compatibility dimensions", compatibility.dimensionRows || [["product family", "unknown / candidate only"]]);
  appendSection(section, "Compatibility reason states", compatibility.reasonStateRows || [["compatible", "available diagnostic reason state"]]);
  appendSection(section, "Compatibility warnings", compatibility.warningRows || [["compatibility warnings", "none"]]);
  appendSection(section, "Blocked/incompatible compatibility reasons", compatibility.blockedFieldRows || [["blocked/incompatible fields", "none"]]);

  appendSection(section, specGate.title || "Spec-gate readiness diagnostics", specGate.readinessRows || [
    ["current selector mode", "default-preview"],
    ["spec-gate incomplete", "true"],
    ["spec-ready", "false"],
    ["slug generation", "disabled"],
    ["spec generation", "disabled"],
    ["Lab Proof status", "separated — not asserted by Selector"],
  ]);
  appendSection(section, "Spec-gate runtime status flags", specGate.runtimeStatusRows || [
    ["readOnly", "true"],
    ["diagnosticOnly", "true"],
    ["specGateExplanationOnly", "true"],
    ["specGenerationEnabled", "false"],
    ["slugGenerationEnabled", "false"],
    ["activeResolverEnabled", "false"],
    ["boardDataWriteEnabled", "false"],
    ["selectorMutationEnabled", "false"],
    ["iesGenerationEnabled", "false"],
    ["engineExecutionEnabled", "false"],
    ["runTableGenerationEnabled", "false"],
    ["payloadGenerationEnabled", "false"],
    ["drawingGenerationEnabled", "false"],
    ["labProofAuthority", "false"],
    ["hiddenWriteBackEnabled", "false"],
  ]);
  appendSection(section, "Spec-gate states", specGate.gateStateRows || [["preamble / default preview", "tracked as readiness explanation only"]]);
  appendSection(section, "Spec-gate requirements", specGate.gateRequirementRows || [["product family selected", "diagnostic requirement; no slug/spec generation"]]);
  appendSection(section, "Missing/blocked reason categories", specGate.missingBlockedReasonRows || [["missing manual constraint", "safe fail-closed reason category"]]);

  parent.appendChild(section);
}

function appendSelectorExpanderShell(parent, viewModel) {
  const shell = viewModel.expanderShell || {};
  const shellSection = document.createElement("section");
  shellSection.className = "cs-selector-proof__section";
  appendText(shellSection, "h3", shell.title || "Runtime-native CS Selector single-page expander shell");
  appendText(shellSection, "p", shell.status || "UI/state scaffold only");
  appendText(shellSection, "p", shell.warning || "Fresh load is preamble/default-preview state only, not spec-ready state.");

  appendSection(shellSection, "State contract diagnostic", shell.stateContractRows || [
    ["preview/default state exists conceptually", "true"],
    ["effective selection state exists conceptually", "true"],
    ["committed spec state exists conceptually", "true"],
    ["fresh load is spec-ready", "false"],
    ["spec-ready", "false"],
    ["build-ready", "false"],
  ]);
  appendSection(shellSection, "Default-preview bucket diagnostic", shell.defaultPreviewSummaryRows || [
    ["default-preview buckets", 0],
    ["every section has a preview/default bucket", "false"],
    ["manual constraints", 0],
    ["auto consequences", 0],
    ["effective selection fields", 0],
    ["committed spec exists", "false"],
    ["spec-ready", "false"],
    ["build-ready", "false"],
  ]);

  const bucketDiagnostics = Array.isArray(shell.defaultPreviewBucketDiagnostics) ? shell.defaultPreviewBucketDiagnostics : [];
  for (const bucket of bucketDiagnostics) {
    const bucketDetails = document.createElement("details");
    bucketDetails.className = "cs-selector-proof__section";
    bucketDetails.open = true;
    const bucketSummary = document.createElement("summary");
    bucketSummary.textContent = `${bucket.title || bucket.id} default-preview bucket — ${bucket.status || "not started"}`;
    bucketDetails.appendChild(bucketSummary);
    appendDefinitionList(bucketDetails, bucket.rows || [["status", bucket.status || "not started"]]);
    shellSection.appendChild(bucketDetails);
  }

  appendSelectorFieldContractDiagnostic(shellSection, shell);

  appendSection(shellSection, "Manual constraint scaffold", shell.manualConstraintScaffoldRows || [
    ["source", "module-local selector scaffold"],
    ["manual constraint eligible fields count", 0],
    ["active manual constraints", 0],
    ["constraint inputs active", "false"],
    ["resolver active", "false"],
    ["filtering active", "false"],
    ["specReady", "false"],
    ["buildReady", "false"],
    ["writes", "false"],
  ]);

  appendSection(shellSection, "Selector behaviour contract", shell.behaviourContractRows || [
    ["manual selections", "constraints"],
    ["auto selections", "consequences"],
    ["compatible selections cleared just because another field changes", "false"],
    ["auto-derived items changeable", "true"],
  ]);

  appendSelectorManualConstraintBehaviour(shellSection, shell);
  appendSelectorReadinessDiagnostics(shellSection, shell);
  appendSelectorReadonlyResolverPreview(shellSection, shell.readonlyResolverPreview);

  const sections = Array.isArray(shell.sections) ? shell.sections : [];
  for (const section of sections) {
    const details = document.createElement("details");
    details.className = "cs-selector-proof__section";
    details.open = section.open !== false;
    details.addEventListener("toggle", () => {
      shell.setSectionOpen?.(section.id, details.open);
    });

    const summary = document.createElement("summary");
    summary.textContent = `${section.title} — ${section.status || "not started"}`;
    details.appendChild(summary);

    if (section.description) appendText(details, "p", section.description);
    appendDefinitionList(details, section.rows || [["status", section.status || "not started"]]);
    shellSection.appendChild(details);
  }

  parent.appendChild(shellSection);
}

function appendSelectorReferencePanel(parent, viewModel) {
  const reference = viewModel.selectorReference || {};

  const bridgeSection = document.createElement("section");
  bridgeSection.className = "cs-selector-proof__section";
  appendText(bridgeSection, "h3", "Board Data / Selector Reference live status bridge");
  appendPillList(bridgeSection, LIVE_STATUS_COPY);
  parent.appendChild(bridgeSection);

  appendSection(parent, "Selector Reference live source/data readiness bridge", selectorReferenceBridgeRows(reference));
  appendSection(parent, "Runtime Selector reference snapshot", selectorReferenceSourceRows(reference));
  appendSection(parent, "Selector-critical table counts", selectorReferenceTableRows(reference));

  const missingTables = Array.isArray(reference.missingTables) ? reference.missingTables : [];
  const users = reference.usersRedactionStatus || {};
  const pureRef = reference.pureRefStateStatus || {};
  const userSummary = users.derivedAuthorityCapabilitySummary || {};
  const fieldCoverage = userSummary.fieldCoverage || {};
  appendSection(parent, "Reference safety gates", [
    ["missing tables", missingTables.length ? missingTables.join(", ") : "none reported"],
    ["USERS present", yesNo(users.present)],
    ["USERS count", users.count ?? 0],
    ["USERS raw rows exposed", forcedFalse(users.rawRowsExposed)],
    ["USERS raw headers exposed", forcedFalse(users.rawHeadersExposed)],
    ["USERS safe derived uses", Array.isArray(users.safeDerivedUses) ? users.safeDerivedUses.join("; ") : "redacted status only"],
    ["USERS authority role rows", fieldCoverage.roleRows ?? 0],
    ["USERS capability rows", fieldCoverage.capabilityRows ?? 0],
    ["USERS special-parts entitlement rows", fieldCoverage.specialPartEntitlementRows ?? 0],
    ["PURE_REF_STATE present", yesNo(pureRef.present)],
    ["PURE_REF_STATE count", pureRef.count ?? 0],
    ["PURE_REF_STATE diagnostic only", yesNo(pureRef.diagnosticOnly)],
    ["PURE_REF_STATE production proof", yesNo(pureRef.productionProof)],
    ["raw rows exposed", forcedFalse(reference.rawRowsExposed)],
    ["raw headers exposed", forcedFalse(reference.rawHeadersExposed)],
    ["raw Lab evidence exposed", forcedFalse(reference.rawLabEvidenceExposed)],
    ["credentials exposed", forcedFalse(reference.credentialsExposed)],
    ["private paths exposed", forcedFalse(reference.privatePathsExposed)],
    ["Board Data write enabled", forcedFalse(reference.boardDataWriteEnabled)],
    ["materialiser write enabled", forcedFalse(reference.materialiserWriteEnabled)],
    ["Selector resolving enabled", forcedFalse(reference.selectorResolvingEnabled ?? reference.activeResolverEnabled)],
    ["spec generation enabled", forcedFalse(reference.specGenerationEnabled)],
    ["slug generation enabled", forcedFalse(reference.slugGenerationEnabled)],
    ["Lab proof authority", forcedFalse(reference.labProofAuthority)],
  ]);

  const riskFields = Array.isArray(reference.fallbackRiskFields) ? reference.fallbackRiskFields : [];
  const riskSection = document.createElement("section");
  riskSection.className = "cs-selector-proof__section";
  appendText(riskSection, "h3", "Fake-proof / fallback-risk fields");
  appendPillList(
    riskSection,
    riskFields.length
      ? riskFields.map((field) => `${field.table}.${field.field}: ${field.present === true ? "present" : "not present"}; ${field.proofStatus || "metadata_only"} — ${field.reason || "metadata only"}`)
      : ["No fallback-risk field metadata has loaded yet."]
  );
  parent.appendChild(riskSection);

  const warningSection = document.createElement("section");
  warningSection.className = "cs-selector-proof__section";
  appendText(warningSection, "h3", "Photometry proof warning");
  appendPillList(warningSection, selectorReferenceProofWarnings(reference));
  parent.appendChild(warningSection);
}

function appendBadgeList(parent, badges = []) {
  const list = document.createElement("ul");
  list.className = "cs-selector-product__badges";
  for (const badge of badges) appendText(list, "li", badge);
  parent.appendChild(list);
}

function appendSelectorProductFieldCard(parent, field = {}, surface = {}, idPrefix = "cs-selector-product") {
  const card = document.createElement("article");
  card.className = "cs-selector-product__field";
  card.dataset.fieldKey = field.fieldKey || "unknown";
  card.dataset.fieldStatus = field.status || "unknown";

  const label = document.createElement("label");
  label.htmlFor = `${idPrefix}-${field.fieldKey}`;
  label.textContent = field.label || field.fieldKey || "Field";
  card.appendChild(label);

  const select = document.createElement("select");
  select.id = `${idPrefix}-${field.fieldKey}`;
  select.dataset.fieldKey = field.fieldKey || "unknown";
  select.disabled = field.disabled === true || field.futureMapped === true || !(field.options || []).length;

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = field.disabled === true
    ? "Disabled in this read-only slice"
    : field.futureMapped === true
      ? "Unavailable from current source — future mapped"
      : "No manual constraint / keep preview consequence";
  select.appendChild(emptyOption);

  for (const option of field.options || []) {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    const suffix = option.blocked ? " — blocked / missing" : option.sourceStatus === "db-reference-backed" ? "" : ` — ${option.sourceStatus || "mapped"}`;
    optionElement.textContent = `${option.label || option.value}${suffix}`;
    optionElement.disabled = option.blocked === true && option.selected !== true;
    select.appendChild(optionElement);
  }
  select.value = field.selectedValue || "";
  select.addEventListener("change", () => {
    if (select.value) surface.setFieldValue?.(field.fieldKey, select.value);
    else surface.clearFieldValue?.(field.fieldKey);
  });
  card.appendChild(select);

  appendDefinitionList(card, [
    ["source", field.sourceStatus || "unavailable from current source"],
    ["state", field.status || "unknown"],
    ["role", field.role || "manual-constraint"],
    ["selected", field.selectedLabel || "none"],
    ["options", Array.isArray(field.options) ? field.options.length : 0],
    ["reason", field.unavailableReason || "DB/reference-backed option labels only; no raw rows exposed"],
  ]);
  parent.appendChild(card);
}

function appendSelectorWorkflowSections(parent, surface = {}) {
  const sections = Array.isArray(surface.workflowSections) ? surface.workflowSections : [];
  if (!sections.length) return;
  const wrapper = document.createElement("div");
  wrapper.className = "cs-selector-product__workflow";
  wrapper.dataset.workflowSectionsCanonical = surface.workflowSectionsCanonical === false ? "false" : "true";
  wrapper.dataset.flatFieldsPrimary = surface.flatFieldsPrimary === true ? "true" : "false";
  for (const workflowSection of sections) {
    const section = document.createElement("section");
    section.className = "cs-selector-product__workflow-section";
    section.dataset.workflowSection = workflowSection.sectionKey || "unknown";
    appendText(section, "h4", workflowSection.title || workflowSection.sectionKey || "Workflow section");
    appendDefinitionList(section, [
      ["status", workflowSection.status || "preview"],
      ["canonical primary controls", workflowSection.primaryControlSurface === false ? "false" : "true"],
      ["canonical field count", workflowSection.canonicalFieldCount ?? (workflowSection.fields || []).length],
      ["duplicate primary controls", workflowSection.duplicateFieldCount ?? 0],
      ["mapped", workflowSection.mappedCount ?? 0],
      ["future mapped", workflowSection.futureMappedCount ?? 0],
      ["disabled", workflowSection.disabledCount ?? 0],
    ]);
    const grid = document.createElement("div");
    grid.className = "cs-selector-product__grid";
    for (const field of workflowSection.fields || []) appendSelectorProductFieldCard(grid, field, surface, `cs-selector-workflow-${workflowSection.sectionKey}`);
    section.appendChild(grid);
    wrapper.appendChild(section);
  }
  parent.appendChild(wrapper);
}

function truthKindLabel(kind = "") {
  return String(kind || "unknown").replace(/-/g, " ");
}

function appendSelectionTruthSummaryItems(parent, items = []) {
  if (!items.length) {
    appendText(parent, "p", "No selected truth rows in this group yet.", "cs-selector-truth-summary__empty");
    return;
  }
  const list = document.createElement("div");
  list.className = "cs-selector-truth-summary__items";
  for (const item of items) {
    const row = document.createElement("article");
    row.className = "cs-selector-truth-summary__item";
    row.dataset.truthKind = item.truthKind || "unknown";
    row.dataset.fieldKey = item.fieldKey || "unknown";

    const title = document.createElement("div");
    title.className = "cs-selector-truth-summary__item-title";
    appendText(title, "strong", item.label || item.fieldKey || "Selection");
    const badge = appendText(title, "span", truthKindLabel(item.truthKind), "cs-selector-truth-summary__kind");
    badge.dataset.truthKind = item.truthKind || "unknown";
    row.appendChild(title);

    appendText(row, "p", item.valueLabel || item.value || "none", "cs-selector-truth-summary__value");
    appendDefinitionList(row, [
      ["status", item.status || "unknown"],
      ["source", item.source || "selector summary"],
      ["mutable", item.mutable === false ? "false" : "true"],
      ["writes", item.writes === true ? "true" : "false"],
      ["raw rows exposed", item.rawRowsExposed === true ? "true" : "false"],
      ["blocked by", Array.isArray(item.blockedBy) && item.blockedBy.length ? item.blockedBy.map((entry) => entry.fieldKey || entry.reason || "constraint").join(", ") : "none"],
    ]);
    list.appendChild(row);
  }
  parent.appendChild(list);
}

function appendSelectorSelectionTruthSummary(parent, summary = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-truth-summary";
  section.dataset.selectorTruthSummary = "read-only";
  section.dataset.specGenerationEnabled = summary.specGenerationEnabled === true ? "true" : "false";
  section.dataset.rawRowsExposed = summary.rawRowsExposed === true ? "true" : "false";

  const header = document.createElement("div");
  header.className = "cs-selector-truth-summary__header";
  appendText(header, "p", "Selected truth summary", "cs-shell__eyebrow");
  appendText(header, "h4", "Selected truth summary");
  appendText(header, "p", "Read-only rail: manual selections are constraints; auto/default/inherited selections are consequences. Blocked values stay visible and no spec, proof, generation, record, approval, or write-back is created here.");
  appendBadgeList(header, [
    summary.readOnly === false ? "read-only missing" : "read-only",
    summary.specGenerationEnabled === true ? "spec generation enabled" : "spec generation disabled",
    summary.labProofAuthority === true ? "Lab Proof authority" : "not Lab Proof",
    summary.controlledRecordWriteEnabled === true ? "records write enabled" : "records disabled",
    summary.rregApprovalEnabled === true ? "RREG approval enabled" : "RREG disabled",
    summary.hiddenWriteBackEnabled === true ? "write-back enabled" : "write-back disabled",
  ]);
  section.appendChild(header);

  const statusRows = [
    ["readOnly", summary.readOnly === false ? "false" : "true"],
    ["specGenerationEnabled", summary.specGenerationEnabled === true ? "true" : "false"],
    ["slugGenerationEnabled", summary.slugGenerationEnabled === true ? "true" : "false"],
    ["iesGenerationEnabled", summary.iesGenerationEnabled === true ? "true" : "false"],
    ["payloadGenerationEnabled", summary.payloadGenerationEnabled === true ? "true" : "false"],
    ["runTableGenerationEnabled", summary.runTableGenerationEnabled === true ? "true" : "false"],
    ["labProofAuthority", summary.labProofAuthority === true ? "true" : "false"],
    ["controlledRecordWriteEnabled", summary.controlledRecordWriteEnabled === true ? "true" : "false"],
    ["rregApprovalEnabled", summary.rregApprovalEnabled === true ? "true" : "false"],
    ["hiddenWriteBackEnabled", summary.hiddenWriteBackEnabled === true ? "true" : "false"],
    ["rawRowsExposed", summary.rawRowsExposed === true ? "true" : "false"],
    ["rawUsersExposed", summary.rawUsersExposed === true ? "true" : "false"],
    ["rawLabEvidenceExposed", summary.rawLabEvidenceExposed === true ? "true" : "false"],
  ];
  appendSection(section, "Selected truth safety gates", statusRows);

  const groups = Array.isArray(summary.groups) ? summary.groups : [];
  const grid = document.createElement("div");
  grid.className = "cs-selector-truth-summary__groups";
  for (const group of groups) {
    const card = document.createElement("section");
    card.className = "cs-selector-truth-summary__group";
    card.dataset.truthGroup = group.groupKey || "unknown";
    appendText(card, "h5", group.label || group.groupKey || "Summary group");
    appendSelectionTruthSummaryItems(card, Array.isArray(group.items) ? group.items : []);
    grid.appendChild(card);
  }
  section.appendChild(grid);

  parent.appendChild(section);
}

function appendSelectorProductSurface(parent, surface = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-product";
  section.dataset.selectorSurface = "db-backed-preview";

  const header = document.createElement("div");
  header.className = "cs-selector-product__header";
  appendText(header, "h3", surface.title || "CS Selector Preview");
  appendText(header, "p", surface.subtitle || "Read-only DB-backed candidate preview. Manual selections are constraints; auto selections are consequences.");
  appendBadgeList(header, surface.badges || ["source pending", "spec gate incomplete", "not Lab Proof", "writes disabled"]);
  section.appendChild(header);

  appendText(section, "p", surface.requiredSafetyCopy || "Read-only preview. No spec, slug, IES, payload, RunTable, Lab Proof, Controlled Record, RREG approval, custody transfer, Board Data write, or hidden write-back is created here.", "cs-selector-product__safety");
  appendText(section, "p", surface.proofCopy || "Selector previews selection readiness. Lab Proof proves later.", "cs-selector-product__proof");

  appendSelectorSelectionTruthSummary(section, surface.selectionTruthSummary || {});

  appendSelectorWorkflowSections(section, surface);

  appendSection(section, "Current candidate summary", surface.candidateSummaryRows || [["candidate state", "default preview"]]);
  appendSection(section, "Manual constraints", surface.manualConstraintRows || [["manual constraints", "none yet"]]);
  appendSection(section, "Auto consequences", surface.autoConsequenceRows || [["auto consequences", "none mapped"]]);
  appendSection(section, "Blocked / missing / incompatible items", surface.blockedRows || [["blocked / missing", "none"]]);
  appendSection(section, "Path to spec-ready later", surface.pathRows || [["future spec-ready", "requires complete spec gate later"]]);

  parent.appendChild(section);
}

function appendSelectorCompatibilityFieldList(parent, surface = {}) {
  const fields = Array.isArray(surface.fields) ? surface.fields : [];
  const details = document.createElement("details");
  details.className = "cs-selector-compatibility-fields";
  details.open = false;
  const summary = document.createElement("summary");
  summary.textContent = "Compatibility field list — diagnostic fallback only";
  details.appendChild(summary);

  appendText(details, "p", "Flat fields remain available as non-primary diagnostic metadata only. The canonical visible controls live in workflow sections, so this list does not render duplicate primary controls.");
  appendDefinitionList(details, [
    ["workflowSectionsCanonical", surface.workflowSectionsCanonical === false ? "false" : "true"],
    ["flatFieldsPrimary", surface.flatFieldsPrimary === true ? "true" : "false"],
    ["flatFieldsDiagnosticOnly", surface.flatFieldsDiagnosticOnly === false ? "false" : "true"],
    ["flat field count", fields.length],
    ["duplicate primary controls", surface.canonicalWorkflowSummary?.duplicatePrimaryControlCount ?? 0],
    ["writes", "false"],
    ["raw rows exposed", "false"],
  ]);

  for (const field of fields) {
    const fieldDetails = document.createElement("details");
    fieldDetails.className = "cs-selector-proof__section";
    fieldDetails.open = false;
    const fieldSummary = document.createElement("summary");
    fieldSummary.textContent = `${field.label || field.fieldKey || "field"} — ${field.status || "diagnostic"}`;
    fieldDetails.appendChild(fieldSummary);
    appendDefinitionList(fieldDetails, [
      ["fieldKey", field.fieldKey || "unknown"],
      ["canonical primary control", "false"],
      ["diagnostic only", "true"],
      ["source", field.sourceStatus || "flat compatibility field"],
      ["role", field.role || "manual-constraint"],
      ["selected", field.selectedLabel || "none"],
      ["options", Array.isArray(field.options) ? field.options.length : 0],
      ["future mapped", field.futureMapped === true ? "true" : "false"],
      ["disabled", field.disabled === true ? "true" : "false"],
      ["writes", "false"],
      ["raw rows exposed", "false"],
    ]);
    fieldDetails.dataset.flatFieldPrimary = "false";
    details.appendChild(fieldDetails);
  }

  parent.appendChild(details);
}

export function renderSelectorView(container, viewModel) {
  clearElement(container);
  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Runtime-native Selector surface", "cs-shell__eyebrow");
  appendText(intro, "h2", "CS Selector Preview");
  appendText(intro, "p", "Read-only DB-backed candidate preview. Manual selections are constraints; auto selections are consequences.");
  article.appendChild(intro);

  appendSelectorProductSurface(article, viewModel.selectorSurface || {});

  const diagnosticsDetails = document.createElement("details");
  diagnosticsDetails.className = "cs-selector-diagnostics";
  diagnosticsDetails.open = false;
  const diagnosticsSummary = document.createElement("summary");
  diagnosticsSummary.textContent = "Diagnostics";
  diagnosticsDetails.appendChild(diagnosticsSummary);
  const diagnostics = document.createElement("div");
  diagnostics.className = "cs-selector-diagnostics__body";
  diagnosticsDetails.appendChild(diagnostics);
  article.appendChild(diagnosticsDetails);

  appendSelectorExpanderShell(diagnostics, viewModel);
  appendSelectorReferencePanel(diagnostics, viewModel);
  appendSelectorCompatibilityFieldList(diagnostics, viewModel.selectorSurface || {});

  appendSection(diagnostics, "Identity and shell authority", [
    ["identity owner", viewModel.identity.owner],
    ["identity status", viewModel.identity.status],
    ["user", viewModel.identity.name],
    ["email", viewModel.identity.email],
    ["identity state", viewModel.identity.identityState],
    ["classification", viewModel.identity.classification],
    ["authority owner", viewModel.identity.authorityOwner],
    ["authority status", viewModel.identity.authorityStatus],
    ["authority source", viewModel.identity.authoritySource],
    ["authority actual role", viewModel.identity.authorityActualRole],
    ["authority nominal role", viewModel.identity.authorityNominalRole],
    ["actual role source", viewModel.identity.authorityActualRoleSource],
    ["actual role derived", viewModel.identity.actualRoleDerived],
    ["override active", viewModel.identity.actualRoleOverrideEnabled],
    ["display role preview", viewModel.identity.displayRole],
    ["display preview only", viewModel.identity.displayRolePreviewOnly],
    ["display clamped", viewModel.identity.displayRoleClamped],
    ["selector visible", viewModel.identity.canViewSelector],
  ]);

  appendSection(diagnostics, "Current project", [
    ["owner", viewModel.project.owner],
    ["status", viewModel.project.status],
    ["title", viewModel.project.title],
    ["project id", viewModel.project.projectId],
    ["readiness", viewModel.project.readiness],
    ["source", viewModel.project.source],
    ["client", viewModel.project.client],
    ["site", viewModel.project.site],
    ["save", viewModel.project.saveStatus],
    ["restore", viewModel.project.restoreStatus],
  ]);

  appendSection(diagnostics, "Visibility", [
    ["owner", viewModel.visibility.owner],
    ["status", viewModel.visibility.status],
    ["selector visible", viewModel.visibility.selectorVisible],
    ["reason", viewModel.visibility.selectorReason],
    ["project input", viewModel.visibility.projectMode],
    ["project present", viewModel.visibility.projectPresent],
    ["visible modules", viewModel.visibility.visibleModules],
    ["hidden modules", viewModel.visibility.hiddenModules],
  ]);

  appendSection(diagnostics, "Timeline policy consumer", [
    ["owner", viewModel.timelinePolicy.owner],
    ["status", viewModel.timelinePolicy.status],
    ["source", viewModel.timelinePolicy.source],
    ["consumed from", viewModel.timelinePolicy.consumedFrom],
    ["selector authoritative", viewModel.timelinePolicy.selectorAuthoritative],
    ["lane", viewModel.timelinePolicy.lane],
    ["actual role source", viewModel.timelinePolicy.actualRoleSource],
    ["allowed statuses", viewModel.timelinePolicy.allowedStatuses],
    ["controls visible", viewModel.timelinePolicy.controlsVisible],
    ["controls reason", viewModel.timelinePolicy.controlsReason],
    ["diagnostics visible", viewModel.timelinePolicy.diagnosticsVisible],
    ["gate", viewModel.timelinePolicy.gateMode],
    ["selector may override", viewModel.timelinePolicy.selectorMayOverride],
    ["selector owns status rules", viewModel.timelinePolicy.selectorOwnsStatusRules],
    ["default window", viewModel.timelinePolicy.defaultWindow],
    ["project stage", viewModel.timelinePolicy.projectStage],
    ["due date position", viewModel.timelinePolicy.dueDatePosition],
    ["persistence live", viewModel.timelinePolicy.persistenceLive],
    ["write enabled", viewModel.timelinePolicy.writeEnabled],
    ["local timeline refs", viewModel.timelinePolicy.itemRefs],
  ]);

  appendSection(diagnostics, "Active Timeline filter diagnostics", readTimelineFilteringRows(viewModel));
  appendTimelineWarnings(diagnostics, viewModel);
  appendSection(diagnostics, "Developer diagnostics: Timeline / Special Parts", readSpecialPartsDiagnosticsRows(viewModel));

  appendSection(diagnostics, "Downstream context foundation", [
    ["owner", viewModel.downstream.owner],
    ["status", viewModel.downstream.status],
    ["source", viewModel.downstream.source],
    ["selector status", viewModel.downstream.selectorStatus],
    ["run refs", viewModel.downstream.runRefs],
    ["area refs", viewModel.downstream.areaRefs],
    ["fitting refs", viewModel.downstream.fittingRefs],
    ["option refs", viewModel.downstream.optionRefs],
    ["emergency candidates", viewModel.downstream.emergencyCandidates],
    ["scene candidates", viewModel.downstream.sceneBuilderCandidates],
    ["compliance candidates", viewModel.downstream.complianceCandidates],
    ["ceiling candidates", viewModel.downstream.ceilingCandidates],
    ["planned consumers", viewModel.downstream.consumers],
  ]);

  appendSection(diagnostics, "Downstream readiness", [
    ["Scene Builder", viewModel.downstream.sceneBuilderReadiness],
    ["Emergency / EGRES", viewModel.downstream.egresReadiness],
    ["Compliance Matters", viewModel.downstream.complianceReadiness],
    ["Ceiling / Coordinated Surfaces", viewModel.downstream.ceilingReadiness],
    ["engine restored", viewModel.downstream.constraints.engineRestored],
    ["RunTable restored", viewModel.downstream.constraints.runTableRestored],
    ["payload restored", viewModel.downstream.constraints.payloadRestored],
  ]);

  appendSection(diagnostics, "Shared actions", [
    ["handoff", viewModel.handoff.status],
    ["crm", viewModel.crm.status],
    ["crm writes", viewModel.crm.writeFlowsEnabled],
  ]);

  const localSection = document.createElement("section");
  appendText(localSection, "h3", "Selector-local UI state");
  appendPillList(localSection, [
    `category:${viewModel.local.selectedCategory}`,
    `openSections:${Object.entries(viewModel.local.expanderSections || {}).filter(([, open]) => open !== false).map(([id]) => id).join(",") || "none"}`,
    `localDirty:${viewModel.local.localDirty}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  diagnostics.appendChild(localSection);

  const deferredSection = document.createElement("section");
  appendText(deferredSection, "h3", "Deferred actions");
  appendPillList(deferredSection, viewModel.deferredActions);
  diagnostics.appendChild(deferredSection);
  appendText(diagnostics, "p", viewModel.responsiveNote, "cs-shell__eyebrow");
  container.appendChild(article);
}
