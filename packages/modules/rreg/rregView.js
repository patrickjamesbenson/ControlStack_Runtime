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

export function renderRregView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof cs-rreg";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "true";
  article.dataset.diagnosticOnly = "true";
  article.dataset.responsibilityMappingOnly = "true";
  article.dataset.custodyTransferEnabled = "false";
  article.dataset.approvalAutomationEnabled = "false";
  article.dataset.permissionEnforcementEnabled = "false";
  article.dataset.peopleAssignmentEnabled = "false";
  article.dataset.seedScriptEnabled = "false";

  const intro = document.createElement("div");
  appendText(intro, "p", "Diagnostic shell module", "cs-shell__eyebrow");
  appendText(intro, "h2", viewModel.label);
  appendText(intro, "p", viewModel.internalLabel);
  appendText(intro, "p", `${viewModel.group} · ${viewModel.status} · ${viewModel.routePath}`);
  for (const line of viewModel.requiredWording) appendText(intro, "p", line);
  article.appendChild(intro);

  appendSection(article, "Runtime status flags", viewModel.runtimeStatusRows);
  appendList(article, "Role boundary", viewModel.roleBoundary);
  appendList(article, "Responsibility concepts", viewModel.responsibilityConcepts);
  appendList(article, "Custody concepts", viewModel.custodyConcepts);
  appendList(article, "Approval mapping concepts", viewModel.approvalMappingConcepts);
  appendList(article, "Proposed responsibility record schema", viewModel.proposedResponsibilitySchemaFields);
  appendList(article, "Relationship map", viewModel.relationshipMap);
  appendList(article, "Future diagnostics", viewModel.futureDiagnostics);
  appendSection(article, "Runtime context", viewModel.contextRows);
  appendSection(article, "No-write guardrails", viewModel.guardrailRows);
  appendList(article, "Module-local state", [
    `section:${viewModel.local.selectedSection}`,
    `readOnly:${viewModel.local.readOnly}`,
    `diagnosticOnly:${viewModel.local.diagnosticOnly}`,
    `localDirty:${viewModel.local.localDirty}`,
    `responsibilityMappingOnly:${viewModel.local.responsibilityMappingOnly}`,
    `custodyTransferEnabled:${viewModel.local.custodyTransferEnabled}`,
    `approvalAutomationEnabled:${viewModel.local.approvalAutomationEnabled}`,
    `permissionEnforcementEnabled:${viewModel.local.permissionEnforcementEnabled}`,
    `peopleAssignmentEnabled:${viewModel.local.peopleAssignmentEnabled}`,
    `seedScriptEnabled:${viewModel.local.seedScriptEnabled}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  appendSection(article, "Internal guardrail snapshot", objectRows(viewModel.guardrails));

  container.appendChild(article);
}
