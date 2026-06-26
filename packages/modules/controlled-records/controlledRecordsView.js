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
  article.dataset.activeIntakeEnabled = "false";
  article.dataset.recordWriteEnabled = "false";
  article.dataset.ledgerWriteEnabled = "false";

  const intro = document.createElement("div");
  appendText(intro, "p", "Diagnostic shell module", "cs-shell__eyebrow");
  appendText(intro, "h2", viewModel.label);
  appendText(intro, "p", `${viewModel.group} · ${viewModel.status} · ${viewModel.routePath}`);
  for (const line of viewModel.requiredWording) appendText(intro, "p", line);
  appendText(intro, "p", viewModel.derivedActionPolicy);
  article.appendChild(intro);

  appendSection(article, "Runtime status flags", viewModel.runtimeStatusRows);
  appendList(article, "Controlled record lifecycle", viewModel.lifecycle);
  appendList(article, "Proposed record types", viewModel.proposedRecordTypes);
  appendList(article, "Proposed base record schema", viewModel.baseRecordSchemaFields);
  appendSection(article, "Old concept mapping", viewModel.oldConceptMappingRows);
  appendList(article, "Ledger Health diagnostic model", viewModel.ledgerHealthChecks);
  appendSection(article, "Runtime context", viewModel.contextRows);
  appendSection(article, "No-write guardrails", viewModel.guardrailRows);
  appendList(article, "Module-local state", [
    `section:${viewModel.local.selectedSection}`,
    `readOnly:${viewModel.local.readOnly}`,
    `diagnosticOnly:${viewModel.local.diagnosticOnly}`,
    `localDirty:${viewModel.local.localDirty}`,
    `activeIntakeEnabled:${viewModel.local.activeIntakeEnabled}`,
    `recordWriteEnabled:${viewModel.local.recordWriteEnabled}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  appendSection(article, "Internal guardrail snapshot", objectRows(viewModel.guardrails));

  container.appendChild(article);
}
