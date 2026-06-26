function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function appendText(parent, tagName, text, className = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = String(text);
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

function appendSection(parent, heading, rows) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", heading);
  appendDefinitionList(section, rows);
  parent.appendChild(section);
}

function appendList(parent, heading, items) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", heading);
  const list = document.createElement("ul");
  list.className = "cs-shell__pill-list";
  for (const item of items) appendText(list, "li", item);
  section.appendChild(list);
  parent.appendChild(section);
}

function objectRows(object) {
  return Object.entries(object || {}).map(([label, value]) => [label, String(value)]);
}

export function renderControlledRecordsView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof cs-controlled-records";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "true";
  article.dataset.diagnosticOnly = "true";
  article.dataset.provenanceMapOnly = "true";
  article.dataset.recordCreationEnabled = "false";
  article.dataset.recordMutationEnabled = "false";
  article.dataset.evidenceIngestionEnabled = "false";
  article.dataset.artefactUploadEnabled = "false";
  article.dataset.approvalAutomationEnabled = "false";
  article.dataset.dispositionWriteEnabled = "false";
  article.dataset.runtimeDataWriteEnabled = "false";
  article.dataset.labProofAuthority = "false";
  article.dataset.rregAuthorityEnabled = "false";

  const intro = document.createElement("div");
  appendText(intro, "p", "Diagnostic shell module", "cs-shell__eyebrow");
  appendText(intro, "h2", viewModel.title || viewModel.label);
  appendText(intro, "p", `${viewModel.group} · ${viewModel.status} · ${viewModel.routePath}`);
  for (const line of viewModel.boundaryCopy) appendText(intro, "p", line);
  appendText(intro, "p", viewModel.derivedActionPolicy);
  article.appendChild(intro);

  appendSection(article, "Runtime status flags", viewModel.runtimeStatusRows);
  appendList(article, "Future controlled record types", viewModel.futureControlledRecordTypes);
  appendList(article, "Provenance fields", viewModel.provenanceFields);
  appendList(article, "Lifecycle map", viewModel.lifecycleMap);
  appendSection(article, "Relationship map", viewModel.relationshipMapRows);
  appendList(article, "Controlled Records diagnostic continuity", viewModel.legacyDiagnosticContext);
  appendSection(article, "Legacy disabled workflow flags", viewModel.legacyDiagnosticFlagRows);
  appendList(article, "Ledger Health diagnostic model", viewModel.ledgerHealthChecks);
  appendSection(article, "Runtime context", viewModel.contextRows);
  appendSection(article, "No-write guardrails", viewModel.guardrailRows);
  appendList(article, "Module-local state", [
    `section:${viewModel.local.selectedSection}`,
    `readOnly:${viewModel.local.readOnly}`,
    `diagnosticOnly:${viewModel.local.diagnosticOnly}`,
    `provenanceMapOnly:${viewModel.local.provenanceMapOnly}`,
    `localDirty:${viewModel.local.localDirty}`,
    `recordCreationEnabled:${viewModel.local.recordCreationEnabled}`,
    `recordMutationEnabled:${viewModel.local.recordMutationEnabled}`,
    `evidenceIngestionEnabled:${viewModel.local.evidenceIngestionEnabled}`,
    `artefactUploadEnabled:${viewModel.local.artefactUploadEnabled}`,
    `approvalAutomationEnabled:${viewModel.local.approvalAutomationEnabled}`,
    `dispositionWriteEnabled:${viewModel.local.dispositionWriteEnabled}`,
    `runtimeDataWriteEnabled:${viewModel.local.runtimeDataWriteEnabled}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  appendSection(article, "Internal guardrail snapshot", objectRows(viewModel.guardrails));

  container.appendChild(article);
}
