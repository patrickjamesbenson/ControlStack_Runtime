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
  "Board Data defines metadata. Selector previews selection readiness. Lab Proof proves later.",
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
  const preview = viewModel.specialPartsEntitlementPreview || {};
  const diagnostics = viewModel.specialPartsEntitlementDiagnostics || preview.diagnostics || {};
  const failClosedReasons = Array.isArray(diagnostics.failClosedReasons) ? diagnostics.failClosedReasons : [];
  return [
    ["Timeline context", selectorTimelineContext.status || timelinePolicy.selectorConsumptionStatus || "passive-consumer"],
    ["Entitlement preview status", preview.entitlementStatus || timelinePolicy.specialPartsEntitlementPreviewStatus || "none"],
    ["Entitlement preview ready", yesNo(preview.specialPartsEntitlementPreviewReady ?? viewModel.specialPartsEntitlementPreviewReady)],
    ["Display role", preview.displayRole || timelinePolicy.specialPartsDisplayRole || "external_user"],
    ["Role authority", preview.roleAuthority || timelinePolicy.specialPartsRoleAuthority || "safe-fallback"],
    ["Redacted entitlement count", preview.redactedEntitlementCount ?? timelinePolicy.specialPartsRedactedEntitlementCount ?? compatibility.redactedEntitlementCount ?? 0],
    ["Compatible redacted candidates", preview.compatibleRedactedCandidateCount ?? timelinePolicy.specialPartsCompatibleRedactedCandidateCount ?? compatibility.compatibleCount ?? 0],
    ["Blocked redacted candidates", preview.blockedRedactedCandidateCount ?? timelinePolicy.specialPartsBlockedRedactedCandidateCount ?? compatibility.incompatibleCount ?? 0],
    ["Review required count", preview.reviewRequiredCount ?? timelinePolicy.specialPartsReviewRequiredCount ?? compatibility.unknownCount ?? 0],
    ["Selected blocked values preserved", yesNo(preview.selectedBlockedValuesPreserved)],
    ["Fail-closed reasons", failClosedReasons.length ? failClosedReasons.join(", ") : "none"],
    ["Special parts compatibility", compatibility.live || timelinePolicy.specialPartsCompatibilityLive || "passive"],
    ["Filtering live", timelinePolicy.specialPartsFilteringLive || "no"],
    ["Opt-in preview enabled", yesNo(preview.specialPartsOptInPreviewEnabled)],
    ["Opt-in active/live", timelinePolicy.specialPartsOptInLive || forcedFalse(preview.specialPartsOptInActiveEnabled)],
    ["Build mutation live", timelinePolicy.specialPartsBuildMutationLive || forcedFalse(preview.activeBuildMutationEnabled)],
    ["HubSpot write enabled", forcedFalse(preview.hubSpotWriteEnabled)],
    ["Contact creation enabled", forcedFalse(preview.contactCreationEnabled)],
    ["raw USERS returned", forcedFalse(preview.rawUsersReturned)],
    ["raw contacts returned", forcedFalse(preview.rawContactsReturned)],
    ["raw CRM returned", forcedFalse(preview.rawCrmReturned)],
    ["raw product rows returned", forcedFalse(preview.rawProductRowsReturned)],
    ["raw component rows returned", forcedFalse(preview.rawComponentRowsReturned)],
    ["private paths returned", forcedFalse(preview.privatePathsReturned)],
    ["credentials returned", forcedFalse(preview.credentialsReturned)],
    ["Display mode", "safe redacted preview diagnostics only"],
  ];
}

function readSpecialPartsEntitlementCandidateRows(viewModel) {
  const preview = viewModel.specialPartsEntitlementPreview || {};
  const rows = Array.isArray(preview.candidateRows) ? preview.candidateRows : [];
  if (!rows.length) return [["redacted candidates", "none"]];
  return rows.map((row) => [
    row.redactedRef || "redacted-special-part",
    `${row.status || "unknown"}; ${row.reason || "safe redacted preview only"}; rawRowsReturned:${forcedFalse(row.rawRowsReturned)}`,
  ]);
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

function safeSnapshotStateRows(state = {}, fallbackReference = {}) {
  const readiness = state || {};
  const coverage = readiness.referenceOptionSourceCoverage || fallbackReference.referenceOptionSourceCoverage || {};
  const redaction = readiness.safeRedaction || fallbackReference.safeRedaction || {};
  const active = readiness.activeSnapshot || fallbackReference.source || fallbackReference.activeSnapshot || {};
  const materialised = readiness.materialisedSnapshot || fallbackReference.materialisedSnapshot || {};
  const blockers = Array.isArray(readiness.missingTableBlockers) ? readiness.missingTableBlockers : [];
  return [
    ["state", readiness.state || (fallbackReference.ok === true ? "source status available" : "fail-closed-source-warning")],
    ["active snapshot", `${yesNo(active.present)} present / ${yesNo(active.readable)} readable / ${yesNo(active.parseable)} parseable`],
    ["materialised snapshot", `${yesNo(materialised.present)} present / ${yesNo(materialised.readable)} readable`],
    ["expected tables present", yesNo(readiness.expectedTablesPresent)],
    ["complete enough for preview", yesNo(readiness.completeEnoughForPreview)],
    ["safe for read-only product reference", yesNo(readiness.readOnlyProductReference)],
    ["fail closed", yesNo(readiness.failClosed)],
    ["missing table blockers", blockers.length ? blockers.map((blocker) => blocker.table).join(", ") : "none"],
    ["source-backed option fields", coverage.sourceBackedFieldCount ?? 0],
    ["future-mapped fields", coverage.futureMappedFieldCount ?? 0],
    ["source-backed explanation", readiness.sourceBackedFieldExplanation || coverage.sourceBackedExplanation || "source-backed fields are counted without raw rows"],
    ["future-mapped explanation", readiness.futureMappedFieldExplanation || coverage.futureMappedExplanation || "future-mapped fields are visible and not faked"],
    ["raw rows exposed", forcedFalse(redaction.rawRowsExposed)],
    ["raw headers exposed", forcedFalse(redaction.rawHeadersExposed)],
    ["USERS identifiers exposed", forcedFalse(redaction.usersPersonalIdentifiersExposed)],
    ["credential paths exposed", forcedFalse(redaction.credentialPathsExposed)],
    ["provider IDs exposed", forcedFalse(redaction.providerIdsExposed)],
    ["private paths exposed", forcedFalse(redaction.privatePathsExposed)],
  ];
}

function selectorReferenceSafeSnapshotRows(reference = {}) {
  return safeSnapshotStateRows(reference.sourceReadiness || reference.safeSnapshotState || {}, reference);
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
  const readiness = reference.sourceReadiness || reference.safeSnapshotState || {};
  const coverage = readiness.referenceOptionSourceCoverage || reference.referenceOptionSourceCoverage || {};
  const blockers = Array.isArray(readiness.missingTableBlockers) ? readiness.missingTableBlockers : [];
  const missingTables = Array.isArray(reference.missingTables) ? reference.missingTables : [];
  return [
    ["source readiness state", readiness.state || (reference.ok === true ? "source status available" : "fail-closed-source-warning")],
    ["complete enough for preview", yesNo(readiness.completeEnoughForPreview)],
    ["safe for read-only product reference", yesNo(readiness.readOnlyProductReference)],
    ["missing table blockers", blockers.length ? blockers.map((blocker) => blocker.table).join(", ") : "none"],
    ["source-backed option fields", coverage.sourceBackedFieldCount ?? 0],
    ["future-mapped fields", coverage.futureMappedFieldCount ?? 0],
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
  appendSection(parent, "Source Readiness / Safe Snapshot State", selectorReferenceSafeSnapshotRows(reference));
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

function fieldSelectedText(field = {}) {
  return field.selectedLabel || field.selectedValue || "none";
}

function fieldOptionCount(field = {}) {
  return Array.isArray(field.options) ? field.options.length : 0;
}

function workflowFieldIsMetadata(field = {}) {
  return field.displayMode === "metadata-chip" || field.metadataOnly === true || field.role === "metadata-only";
}

const PRIMARY_HIDDEN_WORKFLOW_FIELDS = Object.freeze(new Set([
  "optic",
  "opticSub",
  "opticIndirect",
]));

function workflowFieldIsHiddenFromPrimary(field = {}) {
  if (!field) return true;
  if (field.displayMode && !["choice", "warning-chip"].includes(field.displayMode)) return true;
  if (PRIMARY_HIDDEN_WORKFLOW_FIELDS.has(field.fieldKey)) return true;
  if (workflowFieldIsMetadata(field)) return true;
  if (field.disabled === true || field.futureMapped === true) return true;
  return fieldOptionCount(field) === 0;
}

function workflowFieldIsChip(field = {}) {
  return ["auto-chip", "inherited-chip", "metadata-chip"].includes(field.displayMode);
}

function workflowFieldIsCollapsedOverride(field = {}) {
  return field.displayMode === "collapsed-override";
}

function workflowFieldIsSectionHiddenDiagnostic(field = {}) {
  return field.displayMode === "hidden-diagnostic";
}

function workflowFieldIsDisabledHandoff(field = {}) {
  return field.displayMode === "disabled-handoff";
}

function selectedOrPreviewOption(field = {}) {
  const options = Array.isArray(field.options) ? field.options : [];
  return options.find((option) => option.selected === true || String(option.value || "") === String(field.selectedValue || ""))
    || options.find((option) => option.blocked !== true)
    || options[0]
    || {};
}

function fieldDropdownOptions(field = {}) {
  if (Array.isArray(field.dropdownOptions)) return field.dropdownOptions;
  const selectedValue = String(field.selectedValue || "").trim();
  const options = Array.isArray(field.options) ? field.options : [];
  return options.filter((option) => {
    const selected = option.selected === true || Boolean(selectedValue && String(option.value || "") === selectedValue);
    return option.blocked !== true && option.status !== "blocked" || selected;
  });
}

function fieldIncompatibleOptions(field = {}) {
  if (Array.isArray(field.incompatibleOptions)) return field.incompatibleOptions;
  const selectedValue = String(field.selectedValue || "").trim();
  const options = Array.isArray(field.options) ? field.options : [];
  return options.filter((option) => {
    const selected = option.selected === true || Boolean(selectedValue && String(option.value || "") === selectedValue);
    return (option.blocked === true || option.status === "blocked") && !selected;
  });
}

function optionBlockerSummary(option = {}) {
  const blockedBy = Array.isArray(option.blockedBy) && option.blockedBy.length
    ? option.blockedBy.map((entry) => entry.fieldKey || entry.reason || entry.selectedValue || "constraint").join(", ")
    : "current constraints";
  return option.blockedReason || option.relationshipMissingReason || `blocked by ${blockedBy}`;
}

function appendIncompatibleOptionDetails(parent, field = {}) {
  const incompatibleOptions = fieldIncompatibleOptions(field);
  if (!incompatibleOptions.length) return;
  const details = document.createElement("details");
  details.className = "cs-selector-product__incompatible-options";
  details.open = false;
  const summary = document.createElement("summary");
  summary.textContent = `${incompatibleOptions.length} incompatible option(s) hidden from normal dropdown`;
  details.appendChild(summary);
  appendText(details, "p", "Unselected blocked options are separated from the ordinary picker. A currently selected blocked value remains visible in the dropdown and is marked blocked/incompatible.", "cs-selector-product__section-summary");
  appendDefinitionList(details, incompatibleOptions.map((option) => [
    option.label || option.value || "incompatible option",
    optionBlockerSummary(option),
  ]));
  parent.appendChild(details);
}

function appendCompactMetadataLine(parent, label, value) {
  if (!value) return;
  const row = document.createElement("span");
  row.className = "cs-selector-product__metadata-chip";
  row.textContent = `${label}: ${value}`;
  parent.appendChild(row);
}

function appendFieldMetadataDetails(parent, field = {}, selectedOption = {}) {
  const details = document.createElement("details");
  details.className = "cs-selector-product__field-details";
  details.open = false;
  const summary = document.createElement("summary");
  summary.textContent = "Field metadata";
  details.appendChild(summary);
  appendDefinitionList(details, [
    ["source", field.sourceStatus || "unavailable from current source"],
    ["state", field.status || "unknown"],
    ["role", field.role || "manual-constraint"],
    ["selected", field.selectedLabel || "none"],
    ["options", fieldOptionCount(field)],
    ["reason", field.unavailableReason || "DB/reference-backed option labels only; no raw rows exposed"],
    ["diffuser layer", selectedOption.diffuserLayer || "none"],
    ["parent field", selectedOption.parentFieldKey || "none"],
    ["parent value", selectedOption.parentValue || "none"],
    ["diffuser material", selectedOption.diffuserMaterial || "none"],
    ["spec-code preview", selectedOption.specCodePreview || "none"],
    ["spec-code var 2 preview", selectedOption.specCodeVar2Preview || "none"],
    ["spec-code generation", selectedOption.specCodeGenerationEnabled === true ? "true" : "false"],
    ["image readiness", selectedOption.imageReadiness || "not-required"],
    ["image key", selectedOption.imageKey || "none"],
    ["donor image reference known", selectedOption.donorImageReferenceKnown === true ? "true" : "false"],
    ["runtime image available", selectedOption.runtimeImageAvailable === true ? "true" : "false"],
    ["image rendered", "false"],
    ["visual choice", selectedOption.visualChoice === true ? "true" : "false"],
    ["metadata only", field.metadataOnly === true || selectedOption.metadataOnly === true ? "true" : "false"],
    ["writes", "false"],
    ["raw rows exposed", "false"],
  ]);
  parent.appendChild(details);
}

function appendSelectorProductFieldCard(parent, field = {}, surface = {}, idPrefix = "cs-selector-product") {
  const card = document.createElement("article");
  card.className = "cs-selector-product__field";
  card.dataset.fieldKey = field.fieldKey || "unknown";
  card.dataset.fieldStatus = field.status || "unknown";
  card.dataset.displayMode = field.displayMode || "choice";
  card.dataset.provenance = field.provenance || "unknown";

  const label = document.createElement("label");
  label.htmlFor = `${idPrefix}-${field.fieldKey}`;
  label.textContent = field.label || field.fieldKey || "Field";
  card.appendChild(label);

  const dropdownOptions = fieldDropdownOptions(field);
  const incompatibleOptions = fieldIncompatibleOptions(field);
  const select = document.createElement("select");
  select.id = `${idPrefix}-${field.fieldKey}`;
  select.dataset.fieldKey = field.fieldKey || "unknown";
  select.dataset.compatibleOptions = String(dropdownOptions.filter((option) => option.blocked !== true && option.status !== "blocked").length);
  select.dataset.incompatibleOptionsCollapsed = String(incompatibleOptions.length);
  select.disabled = field.disabled === true || field.futureMapped === true || !dropdownOptions.length;

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = field.disabled === true
    ? "Disabled in this read-only slice"
    : field.futureMapped === true
      ? "Unavailable from current source — future mapped"
      : field.provenance === "inherited" && field.effectiveLabel
        ? `Auto / inherit: ${field.effectiveLabel}`
        : "No manual constraint / keep preview consequence";
  select.appendChild(emptyOption);

  for (const option of dropdownOptions) {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    const blocked = option.blocked === true || option.status === "blocked";
    const suffix = blocked ? " — blocked / incompatible" : option.sourceStatus === "db-reference-backed" ? "" : ` — ${option.sourceStatus || "mapped"}`;
    optionElement.textContent = `${option.label || option.value}${suffix}`;
    optionElement.disabled = blocked && option.selected !== true;
    optionElement.dataset.blocked = blocked ? "true" : "false";
    select.appendChild(optionElement);
  }
  select.value = field.selectedValue || "";
  select.addEventListener("change", () => {
    if (select.value) surface.setFieldValue?.(field.fieldKey, select.value);
    else surface.clearFieldValue?.(field.fieldKey);
  });
  card.appendChild(select);

  const selectedOption = selectedOrPreviewOption(field);
  const compactMeta = document.createElement("div");
  compactMeta.className = "cs-selector-product__field-compact-meta";
  appendCompactMetadataLine(compactMeta, field.provenance === "inherited" && !field.selectedValue ? "inherited" : "selected", field.provenance === "inherited" && !field.selectedValue ? field.effectiveLabel || fieldSelectedText(field) : fieldSelectedText(field));
  appendCompactMetadataLine(compactMeta, "options", fieldOptionCount(field));
  if (selectedOption.blocked === true) appendCompactMetadataLine(compactMeta, "blocked", selectedOption.blockedReason || field.unavailableReason || "current constraints");
  if (selectedOption.diffuserMaterial) appendCompactMetadataLine(compactMeta, "material", selectedOption.diffuserMaterial);
  if (selectedOption.specCodePreview) appendCompactMetadataLine(compactMeta, "spec-code preview", selectedOption.specCodePreview);
  if (selectedOption.imageReadiness) appendCompactMetadataLine(compactMeta, "image readiness", selectedOption.imageReadiness);
  card.appendChild(compactMeta);

  if (field.metadataOnly === true || selectedOption.diffuserLayer || field.unavailableReason || selectedOption.blocked === true) {
    card.dataset.diffuserMetadata = selectedOption.diffuserLayer ? "true" : "false";
    appendFieldMetadataDetails(card, field, selectedOption);
  }
  appendIncompatibleOptionDetails(card, field);
  parent.appendChild(card);
}

function workflowSelectedSummary(workflowSection = {}) {
  const selected = (workflowSection.fields || [])
    .filter((field) => field.selectedValue || field.selectedLabel)
    .map((field) => `${field.label || field.fieldKey}: ${fieldSelectedText(field)}`);
  return selected.length ? selected.join(" · ") : "No manual selection in this section yet.";
}

function appendWorkflowMetadataStrip(parent, fields = []) {
  const metadataFields = fields.filter(workflowFieldIsMetadata);
  if (!metadataFields.length) return;
  const strip = document.createElement("div");
  strip.className = "cs-selector-product__metadata-strip";
  for (const field of metadataFields) {
    const option = selectedOrPreviewOption(field);
    const value = field.effectiveLabel || field.selectedLabel || option.label || field.unavailableReason || "metadata pending";
    const chip = document.createElement("span");
    chip.className = "cs-selector-product__metadata-chip";
    chip.dataset.displayMode = field.displayMode || "metadata-chip";
    chip.textContent = `${field.label || field.fieldKey}: ${value}`;
    strip.appendChild(chip);
  }
  parent.appendChild(strip);
}

function workflowChipValue(field = {}) {
  const option = selectedOrPreviewOption(field);
  return field.effectiveLabel
    || field.selectedLabel
    || option.label
    || field.unavailableReason
    || field.classificationReason
    || "pending";
}

function appendWorkflowChipStrip(parent, fields = []) {
  const chipFields = fields.filter(workflowFieldIsChip);
  if (!chipFields.length) return;
  const strip = document.createElement("div");
  strip.className = "cs-selector-product__workflow-chip-strip";
  for (const field of chipFields) {
    const chip = document.createElement("span");
    chip.className = "cs-selector-product__workflow-chip";
    chip.dataset.displayMode = field.displayMode || "chip";
    chip.dataset.provenance = field.provenance || "unknown";
    chip.dataset.fieldKey = field.fieldKey || "unknown";
    chip.textContent = `${field.label || field.fieldKey}: ${workflowChipValue(field)}`;
    strip.appendChild(chip);
  }
  parent.appendChild(strip);
}

function appendCollapsedOverrideDetails(parent, fields = [], surface = {}, idPrefix = "cs-selector-override") {
  const overrideFields = fields.filter(workflowFieldIsCollapsedOverride);
  if (!overrideFields.length) return;
  const details = document.createElement("details");
  details.className = "cs-selector-product__collapsed-overrides";
  details.open = false;
  const summary = document.createElement("summary");
  summary.textContent = `${overrideFields.length} auto/inherited consequence override detail(s)`;
  details.appendChild(summary);
  appendText(details, "p", "These are not primary decisions in this slice. Compatible counts come from the current DB-backed option payload.", "cs-selector-product__section-summary");
  const grid = document.createElement("div");
  grid.className = "cs-selector-product__grid cs-selector-product__grid--collapsed";
  for (const field of overrideFields) appendSelectorProductFieldCard(grid, field, surface, idPrefix);
  details.appendChild(grid);
  parent.appendChild(details);
}

function workflowDisclosureReason(field = {}) {
  if (workflowFieldIsMetadata(field)) return "metadata shown compactly above";
  if (field.futureMapped === true || field.status === "future-mapped") return field.unavailableReason || "future-mapped / missing from current source";
  if (field.disabled === true || workflowFieldIsDisabledHandoff(field)) return field.unavailableReason || "disabled in this read-only slice";
  if (workflowFieldIsSectionHiddenDiagnostic(field)) return field.classificationReason || field.unavailableReason || "hidden from the primary donor-shaped workflow";
  if (fieldIncompatibleOptions(field).length) return `${fieldIncompatibleOptions(field).length} incompatible option(s) separated into collapsed details`;
  return field.unavailableReason || "hidden from primary path until source mapping exists";
}

function workflowSectionDisclosureFields(fields = []) {
  const included = new Set();
  return fields.filter((field) => {
    const include = workflowFieldIsDisabledHandoff(field)
      || workflowFieldIsSectionHiddenDiagnostic(field)
      || workflowFieldIsMetadata(field)
      || field.futureMapped === true
      || field.disabled === true
      || field.status === "future-mapped"
      || fieldIncompatibleOptions(field).length > 0;
    if (!include || included.has(field.fieldKey)) return false;
    included.add(field.fieldKey);
    return true;
  });
}

function appendWorkflowHiddenDetails(parent, workflowSection = {}, hiddenFields = []) {
  if (!hiddenFields.length) return;
  const details = document.createElement("details");
  details.className = "cs-selector-product__workflow-hidden";
  details.open = false;
  const summary = document.createElement("summary");
  const futureCount = hiddenFields.filter((field) => field.futureMapped === true || field.status === "future-mapped").length;
  const disabledCount = hiddenFields.filter((field) => field.disabled === true && field.metadataOnly !== true || workflowFieldIsDisabledHandoff(field)).length;
  const metadataCount = hiddenFields.filter(workflowFieldIsMetadata).length;
  const diagnosticCount = hiddenFields.filter(workflowFieldIsSectionHiddenDiagnostic).length;
  const incompatibleCount = hiddenFields.reduce((count, field) => count + fieldIncompatibleOptions(field).length, 0);
  summary.textContent = `${hiddenFields.length} section disclosure item(s): ${futureCount} future/missing, ${disabledCount} disabled, ${metadataCount} metadata, ${diagnosticCount} hidden, ${incompatibleCount} incompatible`;
  details.appendChild(summary);
  appendDefinitionList(details, hiddenFields.map((field) => [
    field.label || field.fieldKey,
    workflowDisclosureReason(field),
  ]));
  parent.appendChild(details);
}

const LIGHT_CONTROL_ROW_FIELDS = Object.freeze({
  direct: Object.freeze(["targetLmPerM", "cctCri", "controlType"]),
  indirect: Object.freeze(["targetLmPerMIndirect", "cctCriIndirect", "controlTypeIndirect"]),
});

function appendLightControlWorkflowRow(parent, label, rowKey, fieldsByKey, surface, idPrefix) {
  const rowFields = LIGHT_CONTROL_ROW_FIELDS[rowKey] || [];
  const availableFields = rowFields.map((fieldKey) => fieldsByKey.get(fieldKey)).filter(Boolean);
  if (!availableFields.length) return false;
  const row = document.createElement("div");
  row.className = "cs-selector-product__light-control-row";
  row.dataset.csSelectorLightControlRow = rowKey;
  appendText(row, "div", label, "cs-selector-product__light-control-row-label");
  for (const fieldKey of rowFields) {
    const field = fieldsByKey.get(fieldKey);
    if (field) {
      appendSelectorProductFieldCard(row, field, surface, `${idPrefix}-${rowKey}`);
    } else {
      appendText(row, "div", "—", "cs-selector-product__light-control-empty-cell");
    }
  }
  parent.appendChild(row);
  return true;
}

function appendLightControlRowGrid(parent, visibleFields = [], surface = {}, idPrefix = "cs-selector-light-control") {
  const rowFieldKeys = new Set([...LIGHT_CONTROL_ROW_FIELDS.direct, ...LIGHT_CONTROL_ROW_FIELDS.indirect]);
  const fieldsByKey = new Map(visibleFields.map((field) => [field.fieldKey, field]));
  const hasRowField = visibleFields.some((field) => rowFieldKeys.has(field.fieldKey));
  if (!hasRowField) return false;
  const wrapper = document.createElement("div");
  wrapper.className = "cs-selector-product__light-control-grid";
  wrapper.dataset.csSelectorLightControlGrid = "direct-indirect";
  const directRendered = appendLightControlWorkflowRow(wrapper, "Direct", "direct", fieldsByKey, surface, idPrefix);
  const indirectRendered = appendLightControlWorkflowRow(wrapper, "Indirect", "indirect", fieldsByKey, surface, idPrefix);
  if (!directRendered && !indirectRendered) return false;
  parent.appendChild(wrapper);
  const extraFields = visibleFields.filter((field) => !rowFieldKeys.has(field.fieldKey));
  if (extraFields.length) {
    const extraGrid = document.createElement("div");
    extraGrid.className = "cs-selector-product__grid cs-selector-product__grid--light-control-extra";
    for (const field of extraFields) appendSelectorProductFieldCard(extraGrid, field, surface, `${idPrefix}-extra`);
    parent.appendChild(extraGrid);
  }
  return true;
}

function appendSelectorWorkflowSections(parent, surface = {}) {
  const sections = Array.isArray(surface.workflowSections) ? surface.workflowSections : [];
  if (!sections.length) return;
  const wrapper = document.createElement("div");
  wrapper.className = "cs-selector-product__workflow";
  wrapper.dataset.workflowSectionsCanonical = surface.workflowSectionsCanonical === false ? "false" : "true";
  wrapper.dataset.flatFieldsPrimary = surface.flatFieldsPrimary === true ? "true" : "false";
  for (const workflowSection of sections) {
    const allFields = Array.isArray(workflowSection.fields) ? workflowSection.fields : [];
    const visibleFields = allFields.filter((field) => ["choice", "warning-chip"].includes(field.displayMode) && !workflowFieldIsHiddenFromPrimary(field));
    const overrideFields = allFields.filter(workflowFieldIsCollapsedOverride);
    const disclosureFields = workflowSectionDisclosureFields(allFields);
    const diagnosticHiddenCount = allFields.filter(workflowFieldIsSectionHiddenDiagnostic).length;
    const section = document.createElement("section");
    section.className = "cs-selector-product__workflow-section";
    section.dataset.workflowSection = workflowSection.sectionKey || "unknown";
    section.dataset.hiddenDiagnosticCount = String(diagnosticHiddenCount);

    const header = document.createElement("div");
    header.className = "cs-selector-product__workflow-header";
    appendText(header, "h4", workflowSection.title || workflowSection.sectionKey || "Workflow section");
    appendText(header, "span", workflowSection.status || "preview", "cs-selector-product__status-badge");
    section.appendChild(header);
    appendText(section, "p", workflowSelectedSummary(workflowSection), "cs-selector-product__section-summary");

    appendWorkflowChipStrip(section, allFields);
    appendCollapsedOverrideDetails(section, overrideFields, surface, `cs-selector-workflow-${workflowSection.sectionKey}-override`);

    if (visibleFields.length) {
      const renderedLightControlRows = workflowSection.sectionKey === "lightControl"
        ? appendLightControlRowGrid(section, visibleFields, surface, `cs-selector-workflow-${workflowSection.sectionKey}`)
        : false;
      if (!renderedLightControlRows) {
        const grid = document.createElement("div");
        grid.className = workflowSection.sectionKey === "optics"
          ? "cs-selector-product__grid cs-selector-product__grid--diffuser"
          : "cs-selector-product__grid";
        for (const field of visibleFields) appendSelectorProductFieldCard(grid, field, surface, `cs-selector-workflow-${workflowSection.sectionKey}`);
        section.appendChild(grid);
      }
    } else {
      appendText(section, "p", "No active controls in this section yet.", "cs-selector-product__section-empty");
    }

    appendWorkflowHiddenDetails(section, workflowSection, disclosureFields);
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

function allTruthItems(summary = {}) {
  return (Array.isArray(summary.groups) ? summary.groups : []).flatMap((group) => Array.isArray(group.items) ? group.items : []);
}

function truthItem(summary = {}, fieldKeys = []) {
  const keys = Array.isArray(fieldKeys) ? fieldKeys : [fieldKeys];
  return allTruthItems(summary).find((item) => keys.includes(item.fieldKey) && item.valueLabel && item.valueLabel !== "none") || null;
}

function truthCount(summary = {}, truthKinds = []) {
  const kinds = Array.isArray(truthKinds) ? truthKinds : [truthKinds];
  return allTruthItems(summary).filter((item) => kinds.includes(item.truthKind)).length;
}

function appendTruthMetric(parent, label, value) {
  const metric = document.createElement("span");
  metric.className = "cs-selector-truth-summary__metric";
  metric.textContent = `${label}: ${value}`;
  parent.appendChild(metric);
}

function appendCompactDisabledHandoffStrip(parent) {
  const strip = document.createElement("div");
  strip.className = "cs-selector-disabled-handoffs";
  for (const label of ["Spec/slug disabled", "IES disabled", "Payload/RunTable disabled", "Lab Proof disabled", "Controlled Records disabled", "RREG disabled", "HubSpot write-back disabled"]) {
    appendText(strip, "span", label);
  }
  parent.appendChild(strip);
}

function appendSelectorSelectionTruthSummary(parent, summary = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-truth-summary";
  section.dataset.selectorTruthSummary = "read-only";
  section.dataset.compactDefault = "true";
  section.dataset.specGenerationEnabled = summary.specGenerationEnabled === true ? "true" : "false";
  section.dataset.rawRowsExposed = summary.rawRowsExposed === true ? "true" : "false";

  const header = document.createElement("div");
  header.className = "cs-selector-truth-summary__header";
  appendText(header, "p", "Selected truth summary", "cs-shell__eyebrow");
  appendText(header, "h4", "Selected truth summary");
  appendText(header, "p", "Compact read-only rail: manual selections are constraints; auto/default/inherited selections are consequences. Blocked values stay visible without turning the page into a diagnostic report.");
  appendBadgeList(header, ["read-only", "no generation", "not Lab Proof", "writes disabled"]);
  section.appendChild(header);

  const selected = document.createElement("div");
  selected.className = "cs-selector-truth-summary__selected";
  const system = truthItem(summary, "system");
  const var1 = truthItem(summary, ["diffuserVar1", "directOpticVar1", "optic"]);
  const var2 = truthItem(summary, ["diffuserVar2", "directOpticVar2", "opticSub"]);
  appendTruthMetric(selected, "system", system?.valueLabel || "not selected");
  appendTruthMetric(selected, "diffuser var 1", var1?.valueLabel || "not selected");
  appendTruthMetric(selected, "diffuser var 2", var2?.valueLabel || "not selected");
  appendTruthMetric(selected, "auto/inherited", truthCount(summary, ["auto-consequence", "inherited-consequence"]));
  appendTruthMetric(selected, "blockers", Array.isArray(summary.blockers) ? summary.blockers.length : truthCount(summary, "blocked"));
  appendTruthMetric(selected, "missing", Array.isArray(summary.missing) ? summary.missing.filter((item) => item.truthKind === "missing").length : truthCount(summary, "missing"));
  appendTruthMetric(selected, "future disabled", Array.isArray(summary.disabledHandoffs) ? summary.disabledHandoffs.length : truthCount(summary, "future-disabled"));
  section.appendChild(selected);

  appendCompactDisabledHandoffStrip(section);

  const details = document.createElement("details");
  details.className = "cs-selector-truth-summary__details";
  details.open = false;
  const detailsSummary = document.createElement("summary");
  detailsSummary.textContent = "Detailed selected-truth rows and safety flags";
  details.appendChild(detailsSummary);
  appendSection(details, "Selected truth safety gates", [
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
  ]);
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
  details.appendChild(grid);
  section.appendChild(details);

  parent.appendChild(section);
}

function scrollToDonorShapeField(fieldKey = "") {
  if (!fieldKey) return;
  const target = document.querySelector(`.cs-selector-product__field[data-field-key="${fieldKey}"] select`);
  if (!target) return;
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  target.focus?.();
}

function appendDonorShapeSelectedTileStrip(parent, tiles = []) {
  const section = document.createElement("section");
  section.className = "cs-selector-donor-shape-strip";
  section.dataset.selectorDonorShapeStrip = "selected-picker";
  section.dataset.compact = "true";
  section.dataset.rawRowsExposed = "false";

  const header = document.createElement("div");
  header.className = "cs-selector-donor-shape-strip__header";
  appendText(header, "p", "Donor picker shape", "cs-shell__eyebrow");
  appendText(header, "h4", "Selected system / optic tiles");
  appendText(header, "p", "Compact selected-tile rail only. Change buttons focus the existing safe dropdowns; they do not resolve, generate, prove, write, or expose raw data.");
  section.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "cs-selector-donor-shape-strip__tiles";
  const safeTiles = Array.isArray(tiles) ? tiles : [];
  for (const tile of safeTiles) {
    const card = document.createElement("article");
    card.className = "cs-selector-donor-shape-strip__tile";
    card.dataset.donorShapeTile = tile.tileKey || tile.fieldKey || "unknown";
    card.dataset.fieldKey = tile.fieldKey || "unknown";
    card.dataset.blocked = tile.blocked === true ? "true" : "false";
    card.dataset.safeLabelOnly = tile.safeLabelOnly === false ? "false" : "true";
    card.dataset.rawRowsExposed = tile.rawRowsExposed === true ? "true" : "false";
    appendText(card, "h5", tile.title || tile.fieldKey || "Selected tile");
    appendText(card, "p", tile.valueLabel || "Not selected", "cs-selector-donor-shape-strip__value");
    appendText(card, "span", tile.status || (tile.value ? "selected" : "not selected"), "cs-selector-donor-shape-strip__status");
    if (tile.reason) appendText(card, "small", tile.reason);
    if (tile.changeAvailable !== false) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cs-selector-donor-shape-strip__change";
      button.textContent = "Change";
      button.addEventListener("click", () => scrollToDonorShapeField(tile.fieldKey));
      card.appendChild(button);
    }
    grid.appendChild(card);
  }
  section.appendChild(grid);
  parent.appendChild(section);
}

function appendSelectorProductSpine(parent, spine = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-product-spine";
  section.dataset.selectorProductSpine = "checklist";
  section.dataset.readOnly = spine.readOnly === false ? "false" : "true";
  section.dataset.rawRowsExposed = spine.rawRowsExposed === true ? "true" : "false";

  const header = document.createElement("div");
  header.className = "cs-selector-product-spine__header";
  appendText(header, "p", "Selector checklist spine", "cs-shell__eyebrow");
  appendText(header, "h4", spine.title || "Selector checklist spine");
  appendText(header, "p", "Product-facing sidebar/checklist order. Empty values render as em dash; missing or future-mapped values stay visible instead of being faked.");
  appendBadgeList(header, ["read-only", "payload preview only", "no fake options", "no raw rows"]);
  section.appendChild(header);

  const sections = Array.isArray(spine.sections) ? spine.sections : [];
  const wrapper = document.createElement("div");
  wrapper.className = "cs-selector-product-spine__sections";
  sections.forEach((spineSection, index) => {
    const card = document.createElement("section");
    card.className = "cs-selector-product-spine__section";
    card.dataset.spineSection = spineSection.sectionKey || "unknown";
    card.dataset.spineOrder = String(index + 1);
    appendText(card, "h5", spineSection.title || spineSection.sectionKey || "Checklist section");
    const rows = Array.isArray(spineSection.rows) ? spineSection.rows : [];
    const list = document.createElement("dl");
    list.className = "cs-selector-product-spine__rows";
    for (const row of rows) {
      const term = document.createElement("dt");
      term.textContent = row.label || row.rowKey || "Checklist row";
      term.dataset.rowKey = row.rowKey || "unknown";
      list.appendChild(term);

      const value = document.createElement("dd");
      value.dataset.status = row.status || "unknown";
      value.dataset.indicator = row.indicator || "none";
      value.dataset.autoConsequence = row.autoConsequence === true ? "true" : "false";
      value.dataset.manualConstraint = row.manualConstraint === true ? "true" : "false";
      value.dataset.blocked = row.blocked === true ? "true" : "false";
      value.dataset.missing = row.missing === true ? "true" : "false";
      const display = document.createElement("span");
      display.className = "cs-selector-product-spine__value";
      display.textContent = row.displayValue || "—";
      value.appendChild(display);
      appendText(value, "span", row.indicator || "not selected", "cs-selector-product-spine__indicator");
      appendText(value, "small", row.reason || "No raw source row exposed.");
      list.appendChild(value);
    }
    card.appendChild(list);
    wrapper.appendChild(card);
  });
  section.appendChild(wrapper);
  parent.appendChild(section);
}

function appendPayloadPreviewObject(parent, payload = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-payload-preview";
  section.dataset.selectorPayloadPreview = "skeleton";
  section.dataset.productionPayload = payload.productionPayload === true ? "true" : "false";
  section.dataset.readOnly = payload.safetyFlags?.readOnly === false ? "false" : "true";
  section.dataset.rawRowsExposed = payload.safetyFlags?.rawRowsExposed === true ? "true" : "false";

  appendText(section, "h4", "Payload preview skeleton");
  appendText(section, "p", "Stable read-only shape preview only. This is not a production payload and does not generate spec, IES, RunTable, Lab Proof, records, approvals, or writes.");

  appendSection(section, "Payload preview safety flags", [
    ["previewOnly", payload.previewOnly === false ? "false" : "true"],
    ["productionPayload", payload.productionPayload === true ? "true" : "false"],
    ["readOnly", payload.safetyFlags?.readOnly === false ? "false" : "true"],
    ["writes", payload.safetyFlags?.writes === true ? "true" : "false"],
    ["generation", payload.safetyFlags?.generation === true ? "true" : "false"],
    ["labProofAuthority", payload.safetyFlags?.labProofAuthority === true ? "true" : "false"],
    ["rawRowsExposed", payload.safetyFlags?.rawRowsExposed === true ? "true" : "false"],
    ["rawHeadersExposed", payload.safetyFlags?.rawHeadersExposed === true ? "true" : "false"],
    ["rawUsersExposed", payload.safetyFlags?.rawUsersExposed === true ? "true" : "false"],
    ["credentialsExposed", payload.safetyFlags?.credentialsExposed === true ? "true" : "false"],
    ["privatePathsExposed", payload.safetyFlags?.privatePathsExposed === true ? "true" : "false"],
  ]);

  appendSection(section, "Payload preview source readiness", safeSnapshotStateRows(payload.sourceReadiness || payload.safeSnapshotState || {}, payload));

  const shapeRows = [
    ["project", Object.keys(payload.project || {}).join(", ") || "present"],
    ["identity", Object.keys(payload.identity || {}).join(", ") || "present"],
    ["system", Object.keys(payload.system || {}).join(", ") || "present"],
    ["optics.direct", Object.keys(payload.optics?.direct || {}).join(", ") || "present"],
    ["optics.indirect", Object.keys(payload.optics?.indirect || {}).join(", ") || "present"],
    ["environment", Object.keys(payload.environment || {}).join(", ") || "present"],
    ["lightControl", Object.keys(payload.lightControl || {}).join(", ") || "present"],
    ["mounting", Object.keys(payload.mounting || {}).join(", ") || "present"],
    ["finishes", Object.keys(payload.finishes || {}).join(", ") || "present"],
    ["egress", Object.keys(payload.egress || {}).join(", ") || "present"],
    ["sensorsAccessories", Object.keys(payload.sensorsAccessories || {}).join(", ") || "present"],
    ["runs", Object.keys(payload.runs || {}).join(", ") || "present"],
    ["safetyFlags", Object.keys(payload.safetyFlags || {}).join(", ") || "present"],
  ];
  appendSection(section, "Payload preview shape", shapeRows);

  appendText(section, "p", "Payload values are held in the view model for tests and future wiring, but this UI exposes only the safe shape and safety flags in this slice.", "cs-selector-payload-preview__redaction-note");

  parent.appendChild(section);
}

function appendSelectedEngineResultHandoff(parent, handoff = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-selected-engine-result";
  section.dataset.selectorSelectedEngineResult = "read-only";
  section.dataset.resultState = handoff.resultStateLabel || "Estimated preview";
  section.dataset.selectedResultAvailable = handoff.selectedResultAvailable === true ? "true" : "false";
  section.dataset.engineVerified = handoff.engineVerified === true ? "true" : "false";
  section.dataset.stale = handoff.stale === true ? "true" : "false";
  section.dataset.accepted = handoff.accepted === true ? "true" : "false";
  section.dataset.selectedResultProjectionState = handoff.selectedResultProjectionState || "no_selected_result";
  section.dataset.engineVerificationEnabled = handoff.engineVerificationEnabled === true ? "true" : "false";
  section.dataset.rawSelectedPayloadExposed = handoff.safetyFlags?.rawSelectedPayloadExposed === true ? "true" : "false";
  section.dataset.rawEngineDebugPayloadExposed = handoff.safetyFlags?.rawEngineDebugPayloadExposed === true ? "true" : "false";

  appendText(section, "h4", handoff.title || "Selected engine result handoff");
  appendText(section, "p", "No selected engine result is available yet. Runtime Selector consumes the fail-closed workspace-kernel projection contract and remains in Estimated preview state.");
  appendSection(section, "Selected engine-result state", handoff.rows || [["result state label", "Estimated preview"], ["selected result availability", "no selected engine result available"]]);
  appendSection(section, "Future selected-result shape", handoff.fieldRows || [["selected result fields", "unavailable — future read-only Engine/RunTable result source required"]]);
  appendSection(section, "Projection per-run display row shape", handoff.projectionFieldRows || [["projection fields", "unavailable — future read-only Engine/RunTable result source required"]]);
  appendSection(section, "Selected engine-result safety flags", [
    ["engineExecutionEnabled", handoff.safetyFlags?.engineExecutionEnabled === true ? "true" : "false"],
    ["engineVerificationEnabled", handoff.safetyFlags?.engineVerificationEnabled === true ? "true" : "false"],
    ["selectedResultIngestionEnabled", handoff.safetyFlags?.selectedResultIngestionEnabled === true ? "true" : "false"],
    ["selectedResultPersistenceEnabled", handoff.safetyFlags?.selectedResultPersistenceEnabled === true ? "true" : "false"],
    ["staleResultDetectionEnabled", handoff.safetyFlags?.staleResultDetectionEnabled === true ? "true" : "false"],
    ["runTableGenerationEnabled", handoff.safetyFlags?.runTableGenerationEnabled === true ? "true" : "false"],
    ["payloadGenerationEnabled", handoff.safetyFlags?.payloadGenerationEnabled === true ? "true" : "false"],
    ["iesGenerationEnabled", handoff.safetyFlags?.iesGenerationEnabled === true ? "true" : "false"],
    ["drawingGenerationEnabled", handoff.safetyFlags?.drawingGenerationEnabled === true ? "true" : "false"],
    ["labProofAuthority", handoff.safetyFlags?.labProofAuthority === true ? "true" : "false"],
    ["controlledRecordsWriteEnabled", handoff.safetyFlags?.controlledRecordsWriteEnabled === true ? "true" : "false"],
    ["rregApprovalEnabled", handoff.safetyFlags?.rregApprovalEnabled === true ? "true" : "false"],
    ["rregCustodyTransferEnabled", handoff.safetyFlags?.rregCustodyTransferEnabled === true ? "true" : "false"],
    ["hubSpotCrmWriteBackEnabled", handoff.safetyFlags?.hubSpotCrmWriteBackEnabled === true ? "true" : "false"],
    ["boardDataMutationEnabled", handoff.safetyFlags?.boardDataMutationEnabled === true ? "true" : "false"],
    ["hiddenWriteBackEnabled", handoff.safetyFlags?.hiddenWriteBackEnabled === true ? "true" : "false"],
    ["rawSelectedPayloadExposed", handoff.safetyFlags?.rawSelectedPayloadExposed === true ? "true" : "false"],
    ["rawEngineDebugPayloadExposed", handoff.safetyFlags?.rawEngineDebugPayloadExposed === true ? "true" : "false"],
    ["rawCandidateAlternativesExposedAsFinalOutputs", handoff.safetyFlags?.rawCandidateAlternativesExposedAsFinalOutputs === true ? "true" : "false"],
    ["rawRowsExposed", handoff.safetyFlags?.rawRowsExposed === true ? "true" : "false"],
    ["rawLabEvidenceExposed", handoff.safetyFlags?.rawLabEvidenceExposed === true ? "true" : "false"],
    ["rawIesExposed", handoff.safetyFlags?.rawIesExposed === true ? "true" : "false"],
    ["credentialsExposed", handoff.safetyFlags?.credentialsExposed === true ? "true" : "false"],
    ["privatePathsExposed", handoff.safetyFlags?.privatePathsExposed === true ? "true" : "false"],
  ]);
  appendPillList(section, handoff.boundaryCopy || ["Selected engine-result display is read-only and unavailable in this slice."]);

  parent.appendChild(section);
}

function appendSelectorSourceSpecReadinessExplanation(parent, readiness = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-readiness-lock";
  section.dataset.selectorSourceSpecReadiness = "read-only";
  section.dataset.readOnly = readiness.readOnly === false ? "false" : "true";
  section.dataset.specReady = readiness.specReady === true ? "true" : "false";
  section.dataset.rawRowsExposed = readiness.rawRowsExposed === true ? "true" : "false";

  appendText(section, "h4", readiness.title || "Source readiness / spec gate explanation");
  appendText(section, "p", "Source readiness, candidate readiness, missing requirements, blockers, and future-mapped state are repeated here so the summary, spine, and payload preview agree without exposing raw source data.");
  appendSection(section, "Source/spec readiness", readiness.rows || [["source readiness", "unavailable / fail closed"]]);
  appendPillList(section, readiness.boundaryCopy || ["Read-only source/spec readiness explanation."]);

  parent.appendChild(section);
}

function appendSelectorDisabledHandoffSummary(parent, summary = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-disabled-handoff-summary";
  section.dataset.selectorDisabledHandoffSummary = "read-only";
  section.dataset.allDisabled = summary.allDisabled === false ? "false" : "true";
  section.dataset.generation = summary.generation === true ? "true" : "false";
  section.dataset.rawRowsExposed = summary.rawRowsExposed === true ? "true" : "false";

  appendText(section, "h4", summary.title || "Disabled output handoff summary");
  appendText(section, "p", "Every downstream output handoff is locked off. These rows mirror the payload preview safety flags and do not create generation, proof, records, approval, CRM, or Board Data mutation paths.");
  const handoffRows = (Array.isArray(summary.handoffs) ? summary.handoffs : []).map((handoff) => [
    handoff.label || handoff.key || "handoff",
    handoff.status || (handoff.disabled === false ? "unsafe-enabled" : "disabled"),
  ]);
  appendSection(section, "Disabled handoffs", handoffRows.length ? handoffRows : [["handoffs", "disabled"]]);
  appendSection(section, "Disabled handoff safety flags", [
    ["allDisabled", summary.allDisabled === false ? "false" : "true"],
    ["writes", summary.writes === true ? "true" : "false"],
    ["generation", summary.generation === true ? "true" : "false"],
    ["proof", summary.proof === true ? "true" : "false"],
    ["rawRowsExposed", summary.rawRowsExposed === true ? "true" : "false"],
  ]);
  appendPillList(section, summary.boundaryCopy || ["All downstream handoffs remain disabled."]);

  parent.appendChild(section);
}

function runIntentRows(preview = {}) {
  const intents = Array.isArray(preview.safeRunIntentSummaries) ? preview.safeRunIntentSummaries : [];
  if (!intents.length) return [["run intents", "none captured yet"]];
  return intents.map((intent) => [
    intent.label || intent.id || "run",
    `qty:${intent.quantity}; length:${intent.runLengthMm}mm; mode:${intent.lengthMode || "none"}; complete:${intent.status || "unknown"}; sameLengthIntent:${intent.sameLengthQuantityIntent === true ? "true" : "false"}`,
  ]);
}

function appendSelectorRunIntakePreview(parent, preview = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section cs-selector-proof__section--nested cs-selector-run-intake-preview";
  section.dataset.selectorRunIntakePreview = "read-only";
  section.dataset.previewReady = preview.runIntakePreviewReady === true ? "true" : "false";
  section.dataset.enginePayloadReady = "false";
  section.dataset.engineVerifyReady = "false";
  section.dataset.runTableReady = "false";
  section.dataset.iesReady = "false";
  section.dataset.rawEnginePayloadExposed = "false";
  section.dataset.donorEngineInvoked = "false";
  section.dataset.runtimeDataMutated = "false";

  appendText(section, "h4", preview.title || "Selector run intake preview");
  appendText(section, "p", "Run label, quantity, length, and length mode are previewed as local safe intent only. This panel does not expose raw Engine payload, call Engine, generate RunTable or IES, persist selected results, mutate RuntimeData, add routes, or add POST actions.");
  appendPillList(section, preview.boundaryCopy || [
    "Run intake is safe local intent only.",
    "Engine verify, RunTable, and IES remain disabled.",
  ]);
  appendSection(section, "Run intake readiness", preview.summaryRows || [["runIntakePreviewReady", "false"]]);
  appendSection(section, "Safe run intent summaries", runIntentRows(preview));
  appendSection(section, "Run intake diagnostics", (Array.isArray(preview.diagnostics) && preview.diagnostics.length ? preview.diagnostics : ["no run intake captured yet"]).map((item, index) => [`diagnostic ${index + 1}`, item]));
  appendSection(section, "Blocked downstream behaviour", preview.safetyRows || [["rawEnginePayloadExposed", "false"], ["donorEngineInvoked", "false"], ["runTableGenerated", "false"], ["iesGenerated", "false"]]);

  parent.appendChild(section);
}

function accessoryIntentRows(preview = {}) {
  const groups = Array.isArray(preview.safeRunAccessoryIntentSummaries) ? preview.safeRunAccessoryIntentSummaries : [];
  if (!groups.length) return [["accessory intents", "none captured yet"]];
  return groups.map((group) => {
    const intents = Array.isArray(group.intents) ? group.intents : [];
    const summary = intents.map((intent) => {
      const placement = intent.placementPreference === "specific-mm" ? `${intent.placementPreference}:${intent.placementMm ?? "missing"}mm` : intent.placementPreference || "none";
      const width = intent.reservationWidthMm ? `; widthIntent:${intent.reservationWidthMm}mm` : "";
      const band = intent.reservationIntentBand ? `; band:${intent.reservationIntentBand}` : "";
      return `${intent.accessoryTypeToken || "missing-type"} qty:${intent.quantityReceivingAccessory}; place:${placement}; status:${intent.status || "draft"}; complete:${intent.complete === true ? "true" : "false"}${width}${band}`;
    }).join(" | ");
    return [
      group.runLabel || group.runReference || "run",
      summary || `intentCount:${group.intentCount || 0}; unresolved:${group.unresolvedIntentCount || 0}`,
    ];
  });
}

function appendSelectorRunAccessoryPlacementPreview(parent, preview = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section cs-selector-proof__section--nested cs-selector-run-accessory-placement-preview";
  section.dataset.selectorRunAccessoryPlacementPreview = "read-only";
  section.dataset.previewReady = preview.runAccessoryPlacementPreviewReady === true ? "true" : "false";
  section.dataset.accessoryReservationReady = "false";
  section.dataset.enginePayloadReady = "false";
  section.dataset.engineVerifyReady = "false";
  section.dataset.runTableReady = "false";
  section.dataset.iesReady = "false";
  section.dataset.rawAccessoryRowsExposed = "false";
  section.dataset.rawEnginePayloadExposed = "false";
  section.dataset.donorEngineInvoked = "false";
  section.dataset.runtimeDataMutated = "false";

  appendText(section, "h4", preview.title || "Selector run accessory placement preview");
  appendText(section, "p", "Run accessory placement is previewed as safe local intent only. It captures run reference, accessory type token, quantity, placement preference, optional specific millimetre intent, optional width/band intent, status, and display notes without computing reservations, coordinates, covers, holes, zones, Engine payload, RunTable, or IES.");
  appendPillList(section, preview.boundaryCopy || [
    "Accessory placement is safe local intent only.",
    "Accessory reservation, Engine verify, RunTable, and IES remain disabled.",
  ]);
  appendSection(section, "Run accessory placement readiness", preview.summaryRows || [["runAccessoryPlacementPreviewReady", "false"]]);
  appendSection(section, "Safe accessory intent rows grouped by run", accessoryIntentRows(preview));
  appendSection(section, "Unresolved / fail-closed diagnostics", (Array.isArray(preview.diagnostics) && preview.diagnostics.length ? preview.diagnostics : ["no run accessory placement intent captured yet"]).map((item, index) => [`diagnostic ${index + 1}`, item]));
  appendSection(section, "Blocked downstream behaviour", preview.safetyRows || [["rawAccessoryRowsExposed", "false"], ["rawEnginePayloadExposed", "false"], ["accessoryReservationExecuted", "false"], ["runTableGenerated", "false"], ["iesGenerated", "false"]]);

  parent.appendChild(section);
}

function appendSelectorSpecBuildReadinessPreview(parent, preview = {}) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section cs-selector-proof__section--nested cs-selector-spec-build-readiness-preview";
  section.dataset.selectorSpecBuildReadinessPreview = "read-only";
  section.dataset.productFacing = preview.productFacing === false ? "false" : "true";
  section.dataset.specReady = preview.specReady === true ? "true" : "false";
  section.dataset.buildReady = preview.buildReady === true ? "true" : "false";
  section.dataset.downstreamBlocked = preview.downstreamBlocked === false ? "false" : "true";
  section.dataset.rawRowsExposed = preview.rawRowsExposed === true ? "true" : "false";

  appendText(section, "h4", preview.title || "Spec-build readiness preview");
  appendText(section, "p", "Product-facing readiness preview only. It explains whether the current Selector candidate appears ready for future slug/spec input or future build input, without generating any slug, spec, payload, IES, proof, approval, record, or write.");
  appendPillList(section, preview.boundaryCopy || [
    "Selector readiness is metadata only.",
    "No slug/spec/PDF/payload/RunTable/IES/proof/approval/record/write is generated.",
    "Downstream authorities remain separate and fail closed.",
  ]);
  appendSection(section, "Readiness status", preview.summaryRows || [["candidate state", preview.candidateState || "fresh/default-preview only"]]);
  appendSection(section, "Manual constraints summary", preview.manualConstraintRows || [["manual constraints", "—"]]);
  appendSection(section, "Auto consequences summary", preview.autoConsequenceRows || [["auto consequences", "—"]]);
  appendSection(section, "Missing spec requirements", preview.missingSpecRequirementRows || [["spec requirements", "missing"]]);
  appendSection(section, "Missing build/order requirements", preview.missingBuildRequirementRows || [["build requirements", "missing"]]);
  appendSection(section, "Blocked incompatible selections", preview.blockedIncompatibleRows || [["blocked / incompatible selections", "none"]]);
  appendSection(section, "Source readiness", preview.sourceRows || [["source readiness", "unavailable / fail closed"]]);
  appendSection(section, "Selected-result dependency", preview.selectedResultRows || [["selected-result dependency", "blocked/fail-closed"]]);
  appendSection(section, "Future slug/spec dependency", preview.futureSlugSpecRows || [["future slug/spec state", "blocked"]]);
  appendSection(section, "Downstream blockers", preview.downstreamBlockerRows || [["downstream blockers", "disabled"]]);
  appendSection(section, "Generation/proof/write safety flags", preview.safetyRows || [["generation", "false"], ["proof", "false"], ["writes", "false"]]);

  parent.appendChild(section);
}

function workflowStatusLabel(stage = {}) {
  if (stage.blocked === true || stage.status === "blocked") return "blocked";
  if (stage.reviewRequired === true || stage.status === "review-required") return "review-required";
  if (stage.ready === true || stage.status === "ready") return "ready";
  return stage.status || "review-required";
}

function workflowStatusCopy(status = "") {
  return String(status || "unknown").replace(/-/g, " ");
}

function workflowStageRows(stages = []) {
  if (!Array.isArray(stages) || !stages.length) return [["stages", "none"]];
  return stages.map((stage) => [
    stage.label || stage.id || "stage",
    `${workflowStatusLabel(stage)}; ready:${stage.ready === true ? "true" : "false"}; preview-only:${stage.previewOnly === false ? "false" : "true"}; diagnostic-only:${stage.diagnosticOnly === false ? "false" : "true"}; blocker:${stage.blocker || "none"}`,
  ]);
}

function workflowActionRows(actions = []) {
  if (!Array.isArray(actions) || !actions.length) return [["production actions", "disabled"]];
  return actions.map((action) => [action.label || action.id || "action", action.enabled === true ? "enabled" : "disabled"]);
}

function workflowStageSafeCountRows(stage = {}) {
  const counts = stage.safeCounts && typeof stage.safeCounts === "object" ? stage.safeCounts : {};
  const rows = Object.entries(counts).map(([key, value]) => [key, value]);
  return rows.length ? rows : [["safe count", "none"]];
}

function workflowStageDetailRows(stage = {}) {
  const rows = Array.isArray(stage.rows) ? stage.rows : [];
  return rows.length ? rows : [["details", stage.reason || stage.blocker || "safe summary only"]];
}

function appendWorkflowStageCard(parent, stage = {}, index = 0, { compact = false } = {}) {
  const status = workflowStatusLabel(stage);
  const card = document.createElement("article");
  card.className = compact ? "cs-selector-workflow-preview__stage-card cs-selector-workflow-preview__stage-card--compact" : "cs-selector-workflow-preview__stage-card";
  card.dataset.workflowStage = stage.id || `stage-${index + 1}`;
  card.dataset.workflowStageStatus = status;
  card.dataset.previewOnly = stage.previewOnly === false ? "false" : "true";
  card.dataset.diagnosticOnly = stage.diagnosticOnly === false ? "false" : "true";
  card.dataset.ready = stage.ready === true ? "true" : "false";
  card.dataset.blocked = stage.blocked === true ? "true" : "false";
  card.dataset.reviewRequired = stage.reviewRequired === true ? "true" : "false";
  if (stage.id === "controlled-real-source-evidence") card.dataset.evidenceStatusOnly = "true";

  const header = document.createElement("div");
  header.className = "cs-selector-workflow-preview__stage-head";
  appendText(header, "span", String(index + 1).padStart(2, "0"), "cs-selector-workflow-preview__stage-index");
  appendText(header, "h5", stage.label || stage.id || "Workflow stage");
  appendText(header, "span", workflowStatusCopy(status), "cs-selector-workflow-preview__status-pill");
  card.appendChild(header);

  appendText(card, "p", stage.reason || stage.blocker || "Safe summary only.", "cs-selector-workflow-preview__stage-reason");
  appendDefinitionList(card, [
    ["ready", stage.ready === true ? "true" : "false"],
    ["preview-only", stage.previewOnly === false ? "false" : "true"],
    ["diagnostic-only", stage.diagnosticOnly === false ? "false" : "true"],
    ["blocker", stage.blocker || "none"],
  ]);
  appendDefinitionList(card, workflowStageSafeCountRows(stage));

  const details = document.createElement("details");
  details.className = "cs-selector-workflow-preview__stage-details";
  details.open = false;
  const summary = document.createElement("summary");
  summary.textContent = "Safe stage rows";
  details.appendChild(summary);
  appendDefinitionList(details, workflowStageDetailRows(stage));
  card.appendChild(details);

  parent.appendChild(card);
}

function appendWorkflowStageCardGrid(parent, heading, intro, stages = [], options = {}) {
  const group = document.createElement("section");
  group.className = options.compact ? "cs-selector-workflow-preview__group cs-selector-workflow-preview__group--compact" : "cs-selector-workflow-preview__group";
  appendText(group, "h5", heading, "cs-selector-workflow-preview__group-title");
  appendText(group, "p", intro, "cs-selector-workflow-preview__group-copy");
  const grid = document.createElement("div");
  grid.className = "cs-selector-workflow-preview__stage-grid";
  const safeStages = Array.isArray(stages) ? stages : [];
  if (safeStages.length) {
    safeStages.forEach((stage, index) => appendWorkflowStageCard(grid, stage, index, options));
  } else {
    appendText(grid, "p", "No workflow stages reported.", "cs-selector-workflow-preview__empty");
  }
  group.appendChild(grid);
  parent.appendChild(group);
}

function appendWorkflowDisabledActions(parent, actions = []) {
  const group = document.createElement("section");
  group.className = "cs-selector-workflow-preview__group cs-selector-workflow-preview__group--locked-actions";
  group.dataset.productionActions = "disabled";
  appendText(group, "h5", "Disabled production actions", "cs-selector-workflow-preview__group-title");
  appendText(group, "p", "Production handoffs are deliberately visible and locked. These controls are display-only and do not call Engine, create RunTable, create IES, persist selected results, or write HubSpot/project records.", "cs-selector-workflow-preview__group-copy");
  const list = document.createElement("div");
  list.className = "cs-selector-workflow-preview__action-grid";
  const safeActions = Array.isArray(actions) ? actions : [];
  for (const action of safeActions.length ? safeActions : [{ id: "production-actions", label: "Production actions disabled", enabled: false, reason: "No production actions are enabled in this slice." }]) {
    const item = document.createElement("article");
    item.className = "cs-selector-workflow-preview__action-card";
    item.dataset.productionAction = action.id || "action";
    item.dataset.enabled = action.enabled === true ? "true" : "false";
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = true;
    button.textContent = action.label || action.id || "Production action disabled";
    item.appendChild(button);
    appendText(item, "small", action.reason || "Preview-only Selector workflow; production action disabled.");
    list.appendChild(item);
  }
  group.appendChild(list);
  parent.appendChild(group);
}

function appendWorkflowEvidenceStatus(parent, evidence = {}) {
  const group = document.createElement("section");
  group.className = "cs-selector-workflow-preview__evidence-status";
  group.dataset.controlledRealSourceEvidence = "status-only";
  group.dataset.evidenceInvokedByUi = "false";
  appendText(group, "h5", evidence.label || "Controlled real-source evidence status", "cs-selector-workflow-preview__group-title");
  appendText(group, "p", evidence.reason || "Controlled real-source evidence is status-only and not invoked by the UI.", "cs-selector-workflow-preview__group-copy");
  appendBadgeList(group, ["status-only", "not invoked by UI", "RuntimeData not mutated", "donor Engine not invoked"]);
  appendDefinitionList(group, [
    ["status", evidence.status || "diagnostic-only-available-not-invoked"],
    ["helper available", evidence.helperAvailable === true ? "true" : "false"],
    ["runtime data read", evidence.runtimeDataRead === true ? "true" : "false"],
    ["runtime data mutated", evidence.runtimeDataMutated === true ? "true" : "false"],
    ["donor Engine invoked", evidence.donorEngineInvoked === true ? "true" : "false"],
    ["raw rows returned", evidence.rawRowsReturned === true ? "true" : "false"],
    ["raw payloads returned", evidence.rawPayloadsReturned === true ? "true" : "false"],
  ]);
  parent.appendChild(group);
}

function appendWorkflowDonorBridgeStatus(parent, bridge = {}) {
  const flags = bridge.safetyFlags && typeof bridge.safetyFlags === "object" ? bridge.safetyFlags : {};
  const group = document.createElement("section");
  group.className = "cs-selector-workflow-preview__evidence-status";
  group.dataset.controlledDonorEngineVerifyBridge = "status-only";
  group.dataset.donorEngineInvoked = bridge.donorEngineInvoked === true || flags.donorEngineInvoked === true ? "true" : "false";
  group.dataset.realDonorPayloadAssembled = bridge.realDonorPayloadAssembled === true || flags.realDonorPayloadAssembled === true ? "true" : "false";
  appendText(group, "h5", "Controlled donor Engine verify bridge", "cs-selector-workflow-preview__group-title");
  appendText(group, "p", "Private bridge only: synthetic/safe preview status is surfaced while donor invocation remains blocked. No selected-result persistence, RunTable generation, or IES generation is enabled.", "cs-selector-workflow-preview__group-copy");
  appendBadgeList(group, ["private bridge only", "synthetic/safe preview only", "donor invocation blocked", "no selected-result persistence", "no RunTable generation", "no IES generation"]);
  appendDefinitionList(group, [
    ["status", bridge.bridgeReady === true ? "ready" : "blocked"],
    ["blocker", bridge.blocker || "donor-engine-invocation-not-approved"],
    ["private bridge only", bridge.privateBridgeOnly === true || flags.privateBridgeOnly === true ? "true" : "false"],
    ["diagnostic only", bridge.diagnosticOnly === true || flags.diagnosticOnly === true ? "true" : "false"],
    ["safe summary only", bridge.safeSummaryOnly === true || flags.safeSummaryOnly === true ? "true" : "false"],
    ["synthetic fixture only", bridge.syntheticFixtureOnly === true || flags.syntheticFixtureOnly === true ? "true" : "false"],
    ["bridge fingerprint", bridge.bridgeFingerprint || "none"],
    ["donor Engine invoked", bridge.donorEngineInvoked === true || flags.donorEngineInvoked === true ? "true" : "false"],
    ["real donor payload assembled", bridge.realDonorPayloadAssembled === true || flags.realDonorPayloadAssembled === true ? "true" : "false"],
    ["selected result persisted", bridge.selectedResultPersisted === true || flags.selectedResultPersisted === true ? "true" : "false"],
    ["RunTable generated", bridge.runTableGenerated === true || flags.runTableGenerated === true ? "true" : "false"],
    ["IES generated", bridge.iesGenerated === true || flags.iesGenerated === true ? "true" : "false"],
    ["routes added", bridge.routesAdded === true || flags.routesAdded === true ? "true" : "false"],
    ["POST endpoints added", bridge.postEndpointsAdded === true || flags.postEndpointsAdded === true ? "true" : "false"],
  ]);
  parent.appendChild(group);
}

function appendSelectorWorkflowPreview(parent, workflow = {}) {
  const downstream = workflow.downstreamReadinessSummary || {};
  const blocked = workflow.blockedSummary || {};
  const unsafe = workflow.unsafeOutputsBlocked || {};
  const section = document.createElement("section");
  section.className = "cs-selector-workflow-preview";
  section.dataset.selectorWorkflowPreview = "read-only";
  section.dataset.previewReady = workflow.selectorWorkflowPreviewReady === true ? "true" : "false";
  section.dataset.previewOnly = workflow.previewOnly === false ? "false" : "true";
  section.dataset.diagnosticOnly = workflow.diagnosticOnly === false ? "false" : "true";
  section.dataset.runEngineEnabled = downstream.runEngineEnabled === true ? "true" : "false";
  section.dataset.runTableGenerationEnabled = downstream.runTableGenerationEnabled === true ? "true" : "false";
  section.dataset.iesGenerationEnabled = downstream.iesGenerationEnabled === true ? "true" : "false";
  section.dataset.selectedResultPersistenceEnabled = downstream.selectedResultPersistenceEnabled === true ? "true" : "false";
  section.dataset.hubSpotProjectWritesEnabled = downstream.hubSpotProjectWritesEnabled === true ? "true" : "false";
  section.dataset.rawRowsPayloadsPrivateDataExposed = unsafe.rawRowsPayloadsPrivateDataExposed === true ? "true" : "false";

  const header = document.createElement("div");
  header.className = "cs-selector-workflow-preview__header";
  appendText(header, "p", "Workflow readiness", "cs-shell__eyebrow");
  appendText(header, "h4", workflow.title || "Selector workflow readiness — preview only");
  appendText(header, "p", "Safe workflow cards show selected/reference values, compatibility, timeline, run intent, accessory intent, entitlement, draft/hydrate readiness, and downstream Engine/RunTable/IES state without exposing raw payloads or enabling production actions.");
  appendBadgeList(header, workflow.markers || ["preview-only", "diagnostic-only", "safe summaries only", "production actions disabled"]);
  section.appendChild(header);

  const summary = document.createElement("div");
  summary.className = "cs-selector-workflow-preview__summary-strip";
  appendTruthMetric(summary, "status", workflow.status || "blocked");
  appendTruthMetric(summary, "workflow ready", workflow.selectorWorkflowPreviewReady === true ? "true" : "false");
  appendTruthMetric(summary, "blocked", blocked.blockedStageCount ?? 0);
  appendTruthMetric(summary, "review required", blocked.reviewRequiredStageCount ?? 0);
  appendTruthMetric(summary, "downstream blocked", blocked.downstreamBlockedStageCount ?? 0);
  section.appendChild(summary);

  appendWorkflowStageCardGrid(
    section,
    "Selector workflow stages",
    "Readable stage cards use ready, blocked, and review-required labels while keeping every value as a safe count, label, or status.",
    workflow.stageSummaries || workflow.selectorWorkflowStageSummaries,
  );
  appendWorkflowStageCardGrid(
    section,
    "Downstream readiness group",
    "Engine, RunTable, selected-result, IES, and controlled evidence readiness are shown as preview-only downstream status, not production execution.",
    downstream.stages,
    { compact: true },
  );
  appendWorkflowDisabledActions(section, workflow.disabledProductionActions || downstream.productionActions);
  appendWorkflowEvidenceStatus(section, downstream.controlledRealSourceEvidenceStatus || {});
  appendWorkflowDonorBridgeStatus(section, downstream.controlledDonorEngineVerifyBridgeSummary || {});

  appendSection(section, "Blocked production outputs", [
    ["Run Engine disabled", downstream.runEngineEnabled === true ? "false" : "true"],
    ["RunTable generation disabled", downstream.runTableGenerationEnabled === true ? "false" : "true"],
    ["IES generation disabled", downstream.iesGenerationEnabled === true ? "false" : "true"],
    ["selected-result persistence disabled", downstream.selectedResultPersistenceEnabled === true ? "false" : "true"],
    ["HubSpot/project writes disabled", downstream.hubSpotProjectWritesEnabled === true ? "false" : "true"],
  ]);
  appendSection(section, "Unsafe output guards", [
    ["raw rows/payloads/private data exposed", unsafe.rawRowsPayloadsPrivateDataExposed === true ? "true" : "false"],
    ["raw Selector payload returned", unsafe.rawSelectorPayloadReturned === true ? "true" : "false"],
    ["raw Engine payload returned", unsafe.rawEnginePayloadReturned === true ? "true" : "false"],
    ["raw Engine result returned", unsafe.rawEngineResultReturned === true ? "true" : "false"],
    ["USERS/CRM/contact/private data returned", unsafe.rawUsersReturned === true || unsafe.rawCrmReturned === true || unsafe.rawContactsReturned === true || unsafe.privatePathsReturned === true ? "true" : "false"],
    ["exact electrical values returned", unsafe.exactElectricalValuesReturned === true ? "true" : "false"],
    ["exact placement coordinates returned", unsafe.exactPlacementCoordinatesReturned === true ? "true" : "false"],
    ["real donor payload assembled", unsafe.realDonorPayloadAssembled === true ? "true" : "false"],
    ["IES/candela/base64 artefacts returned", unsafe.rawIesContentReturned === true || unsafe.candelaArraysReturned === true || unsafe.base64ArtifactsReturned === true ? "true" : "false"],
    ["donor Engine invoked", unsafe.donorEngineInvoked === true ? "true" : "false"],
    ["RuntimeData mutated", unsafe.runtimeDataMutated === true ? "true" : "false"],
    ["selected result persisted", unsafe.selectedResultPersisted === true ? "true" : "false"],
    ["RunTable generated", unsafe.runTableGenerated === true ? "true" : "false"],
    ["IES generated", unsafe.iesGenerated === true ? "true" : "false"],
    ["routes added", unsafe.routesAdded === true ? "true" : "false"],
    ["POST endpoints added", unsafe.postEndpointsAdded === true ? "true" : "false"],
  ]);

  parent.appendChild(section);
}

function appendSelectorProductCompactStatus(parent, surface = {}) {
  const summary = surface.candidateSummary || {};
  const status = document.createElement("section");
  status.className = "cs-selector-product__compact-status";
  appendTruthMetric(status, "state", summary.state || "default preview");
  appendTruthMetric(status, "manual", summary.manualConstraintCount ?? 0);
  appendTruthMetric(status, "auto", summary.autoConsequenceCount ?? 0);
  appendTruthMetric(status, "blocked/missing", summary.blockedCount ?? 0);
  appendTruthMetric(status, "mapped workflow fields", summary.workflowMappedFieldCount ?? 0);
  parent.appendChild(status);

  const details = document.createElement("details");
  details.className = "cs-selector-product__diagnostic-details";
  details.open = false;
  const detailsSummary = document.createElement("summary");
  detailsSummary.textContent = "Candidate, blockers, and path details";
  details.appendChild(detailsSummary);
  appendSection(details, "Current candidate summary", surface.candidateSummaryRows || [["candidate state", "default preview"]]);
  appendSection(details, "Manual constraints", surface.manualConstraintRows || [["manual constraints", "none yet"]]);
  appendSection(details, "Auto consequences", surface.autoConsequenceRows || [["auto consequences", "none mapped"]]);
  appendSection(details, "Blocked / missing / incompatible items", surface.blockedRows || [["blocked / missing", "none"]]);
  appendSection(details, "Path to spec-ready later", surface.pathRows || [["future spec-ready", "requires complete spec gate later"]]);
  const presentation = surface.presentationClassification || {};
  appendSection(details, "Runtime presentation classification", [
    ["classification", presentation.name || "runtime presentation classification"],
    ["source truth", presentation.sourceTruth || "DB/reference-backed options remain source truth"],
    ["primary choices", presentation.primaryDecisionCount ?? 0],
    ["auto chips", presentation.autoChipCount ?? 0],
    ["inherited chips", presentation.inheritedChipCount ?? 0],
    ["metadata chips", presentation.metadataChipCount ?? 0],
    ["collapsed overrides", presentation.collapsedOverrideCount ?? 0],
    ["warning chips", presentation.warningChipCount ?? 0],
    ["hidden diagnostics", presentation.hiddenDiagnosticCount ?? 0],
    ["disabled handoffs", presentation.disabledHandoffCount ?? 0],
    ["cannot safely classify", Array.isArray(presentation.cannotSafelyClassify) && presentation.cannotSafelyClassify.length ? presentation.cannotSafelyClassify.map((field) => field.fieldKey).join(", ") : "none"],
    ["writes", presentation.writes === true ? "true" : "false"],
    ["raw rows exposed", presentation.rawRowsExposed === true ? "true" : "false"],
  ]);
  parent.appendChild(details);
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

  appendText(section, "p", "Read-only preview. No spec, slug, IES, payload, RunTable, Lab Proof, Controlled Record, RREG approval, custody transfer, Board Data write, or hidden write-back is created here.", "cs-selector-product__safety");
  appendText(section, "p", surface.proofCopy || "Selector previews selection readiness. Lab Proof proves later.", "cs-selector-product__safety");

  appendSelectorSelectionTruthSummary(section, surface.selectionTruthSummary || {});
  appendDonorShapeSelectedTileStrip(section, surface.donorShapeSelectedTiles || []);
  appendSelectorWorkflowPreview(section, surface.selectorWorkflowPreview || {});

  appendSelectorWorkflowSections(section, surface);

  appendSelectorProductSpine(section, surface.productSpine || {});
  appendPayloadPreviewObject(section, surface.payloadPreview || {});
  appendSelectedEngineResultHandoff(section, surface.selectedEngineResultHandoff || {});
  appendSelectorSourceSpecReadinessExplanation(section, surface.sourceSpecReadinessExplanation || {});
  appendSelectorDisabledHandoffSummary(section, surface.disabledHandoffSummary || {});
  appendSelectorRunIntakePreview(section, surface.runIntakePreview || {});
  appendSelectorRunAccessoryPlacementPreview(section, surface.runAccessoryPlacementPreview || {});
  appendSelectorSpecBuildReadinessPreview(section, surface.specBuildReadinessPreview || {});

  appendSelectorProductCompactStatus(section, surface);

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
  appendSection(diagnostics, "Special-parts entitlement preview candidates", readSpecialPartsEntitlementCandidateRows(viewModel));

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
