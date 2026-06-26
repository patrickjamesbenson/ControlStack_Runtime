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

export function renderCanonicalLanguageView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof cs-canonical-language";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "true";
  article.dataset.diagnosticOnly = "true";
  article.dataset.vocabularyReferenceOnly = "true";
  article.dataset.clxWriteEnabled = "false";
  article.dataset.glossaryMutationEnabled = "false";
  article.dataset.synonymAutoCorrectionEnabled = "false";
  article.dataset.hiddenWriteBackEnabled = "false";

  const intro = document.createElement("div");
  appendText(intro, "p", "Diagnostic shell module", "cs-shell__eyebrow");
  appendText(intro, "h2", viewModel.label);
  appendText(intro, "p", viewModel.internalLabel);
  appendText(intro, "p", `${viewModel.group} · ${viewModel.status} · ${viewModel.routePath}`);
  for (const line of viewModel.requiredWording) appendText(intro, "p", line);
  article.appendChild(intro);

  appendSection(article, "Runtime status flags", viewModel.runtimeStatusRows);
  appendList(article, "Role boundary", viewModel.roleBoundary);
  appendList(article, "Proposed canonical term fields", viewModel.proposedCanonicalTermFields);
  appendList(article, "Language relationship map", viewModel.languageRelationshipMap);
  appendList(article, "Future diagnostics", viewModel.futureDiagnostics);
  appendSection(article, "Runtime context", viewModel.contextRows);
  appendSection(article, "No-write guardrails", viewModel.guardrailRows);
  appendList(article, "Module-local state", [
    `section:${viewModel.local.selectedSection}`,
    `readOnly:${viewModel.local.readOnly}`,
    `diagnosticOnly:${viewModel.local.diagnosticOnly}`,
    `localDirty:${viewModel.local.localDirty}`,
    `vocabularyReferenceOnly:${viewModel.local.vocabularyReferenceOnly}`,
    `clxWriteEnabled:${viewModel.local.clxWriteEnabled}`,
    `glossaryMutationEnabled:${viewModel.local.glossaryMutationEnabled}`,
    `synonymAutoCorrectionEnabled:${viewModel.local.synonymAutoCorrectionEnabled}`,
    `hiddenWriteBackEnabled:${viewModel.local.hiddenWriteBackEnabled}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  appendSection(article, "Internal guardrail snapshot", objectRows(viewModel.guardrails));

  container.appendChild(article);
}
