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

function valueOrNone(value) {
  if (value === null || value === undefined || value === "") return "none";
  return String(value);
}

function selectorReferenceSourceRows(reference = {}) {
  const source = reference.source || {};
  return [
    ["endpoint", reference.endpoint || "/api/selector-reference/status"],
    ["status", reference.status || (reference.ok === true ? "loaded" : "unknown")],
    ["ok", yesNo(reference.ok)],
    ["source label", source.label || "runtime-authority-reference-active-snapshot"],
    ["source path label", source.pathLabel || "C:\\ControlStack_RuntimeData\\authority-reference\\novondb.json"],
    ["source present", yesNo(source.present)],
    ["source readable", yesNo(source.readable)],
    ["modified", valueOrNone(source.modifiedTime)],
    ["file size", source.fileSize === undefined || source.fileSize === null ? "none" : `${source.fileSize} bytes`],
    ["read only", yesNo(reference.readOnly)],
    ["raw rows exposed", yesNo(reference.rawRowsExposed)],
    ["raw Lab evidence exposed", yesNo(reference.rawLabEvidenceExposed)],
  ];
}

function selectorReferenceTableRows(reference = {}) {
  const tables = Array.isArray(reference.tableSummary) ? reference.tableSummary : [];
  if (!tables.length) return [["tables", "loading or unavailable"]];
  return tables.map((table) => {
    const headers = table.headersRedacted
      ? "redacted"
      : (Array.isArray(table.headers) && table.headers.length ? table.headers.join(", ") : "none");
    return [
      table.table || "unknown",
      `${table.present ? table.rowCount : "missing"}${table.present ? " rows" : ""}; headers: ${headers}`,
    ];
  });
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
  appendSection(parent, "Runtime Selector reference snapshot", selectorReferenceSourceRows(reference));
  appendSection(parent, "Selector-critical table counts and headers", selectorReferenceTableRows(reference));

  const missingTables = Array.isArray(reference.missingTables) ? reference.missingTables : [];
  const users = reference.usersRedactionStatus || {};
  const pureRef = reference.pureRefStateStatus || {};
  const userSummary = users.derivedAuthorityCapabilitySummary || {};
  const fieldCoverage = userSummary.fieldCoverage || {};
  appendSection(parent, "Reference safety gates", [
    ["missing tables", missingTables.length ? missingTables.join(", ") : "none reported"],
    ["USERS present", yesNo(users.present)],
    ["USERS count", users.count ?? 0],
    ["USERS raw rows exposed", yesNo(users.rawRowsExposed)],
    ["USERS raw headers exposed", yesNo(users.rawHeadersExposed)],
    ["USERS safe derived uses", Array.isArray(users.safeDerivedUses) ? users.safeDerivedUses.join("; ") : "redacted status only"],
    ["USERS authority role rows", fieldCoverage.roleRows ?? 0],
    ["USERS capability rows", fieldCoverage.capabilityRows ?? 0],
    ["USERS special-parts entitlement rows", fieldCoverage.specialPartEntitlementRows ?? 0],
    ["PURE_REF_STATE present", yesNo(pureRef.present)],
    ["PURE_REF_STATE count", pureRef.count ?? 0],
    ["PURE_REF_STATE diagnostic only", yesNo(pureRef.diagnosticOnly)],
    ["PURE_REF_STATE production proof", yesNo(pureRef.productionProof)],
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

export function renderSelectorView(container, viewModel) {
  clearElement(container);
  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Selector migration surface", "cs-shell__eyebrow");
  appendText(intro, "h2", "cs_selector shell context consumer");
  appendText(intro, "p", "Selector now shows a shell-owned downstream context foundation. This is contract-only: Scene Builder, EGRES, Compliance Matters, Ceiling, engine, RunTable, and payload remain out of scope.");
  article.appendChild(intro);

  appendSelectorExpanderShell(article, viewModel);
  appendSelectorReferencePanel(article, viewModel);

  appendSection(article, "Identity and shell authority", [
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

  appendSection(article, "Current project", [
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

  appendSection(article, "Visibility", [
    ["owner", viewModel.visibility.owner],
    ["status", viewModel.visibility.status],
    ["selector visible", viewModel.visibility.selectorVisible],
    ["reason", viewModel.visibility.selectorReason],
    ["project input", viewModel.visibility.projectMode],
    ["project present", viewModel.visibility.projectPresent],
    ["visible modules", viewModel.visibility.visibleModules],
    ["hidden modules", viewModel.visibility.hiddenModules],
  ]);

  appendSection(article, "Timeline policy consumer", [
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

  appendSection(article, "Active Timeline filter diagnostics", readTimelineFilteringRows(viewModel));
  appendTimelineWarnings(article, viewModel);
  appendSection(article, "Developer diagnostics: Timeline / Special Parts", readSpecialPartsDiagnosticsRows(viewModel));

  appendSection(article, "Downstream context foundation", [
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

  appendSection(article, "Downstream readiness", [
    ["Scene Builder", viewModel.downstream.sceneBuilderReadiness],
    ["Emergency / EGRES", viewModel.downstream.egresReadiness],
    ["Compliance Matters", viewModel.downstream.complianceReadiness],
    ["Ceiling / Coordinated Surfaces", viewModel.downstream.ceilingReadiness],
    ["engine restored", viewModel.downstream.constraints.engineRestored],
    ["RunTable restored", viewModel.downstream.constraints.runTableRestored],
    ["payload restored", viewModel.downstream.constraints.payloadRestored],
  ]);

  appendSection(article, "Shared actions", [
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
  article.appendChild(localSection);

  const deferredSection = document.createElement("section");
  appendText(deferredSection, "h3", "Deferred actions");
  appendPillList(deferredSection, viewModel.deferredActions);
  article.appendChild(deferredSection);
  appendText(article, "p", viewModel.responsiveNote, "cs-shell__eyebrow");
  container.appendChild(article);
}
