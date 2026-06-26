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

export function renderLioraCockpitView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof cs-liora-cockpit";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "true";
  article.dataset.diagnosticOnly = "true";
  article.dataset.activeMessageIngestionEnabled = "false";
  article.dataset.chatAgentEnabled = "false";
  article.dataset.draftCreationEnabled = "false";
  article.dataset.sendEnabled = "false";
  article.dataset.hiddenWriteBackEnabled = "false";

  const intro = document.createElement("div");
  appendText(intro, "p", "Diagnostic shell module", "cs-shell__eyebrow");
  appendText(intro, "h2", viewModel.label);
  appendText(intro, "p", `${viewModel.group} · ${viewModel.status} · ${viewModel.routePath}`);
  for (const line of viewModel.requiredWording) appendText(intro, "p", line);
  article.appendChild(intro);

  appendSection(article, "Runtime status flags", viewModel.runtimeStatusRows);
  appendList(article, "Role boundary", viewModel.roleBoundary);
  appendList(article, "Future Liora intake lifecycle", viewModel.intakeLifecycle);
  appendList(article, "Future provenance model", viewModel.provenanceModel);
  appendSection(article, "Relationship map", viewModel.relationshipRows);
  appendSection(article, "Future allowed actions — disabled in this slice", viewModel.futureAllowedActionRows);
  appendList(article, "Forbidden actions", viewModel.forbiddenActions);
  appendSection(article, "Runtime context", viewModel.contextRows);
  appendSection(article, "No-write guardrails", viewModel.guardrailRows);
  appendList(article, "Module-local state", [
    `section:${viewModel.local.selectedSection}`,
    `readOnly:${viewModel.local.readOnly}`,
    `diagnosticOnly:${viewModel.local.diagnosticOnly}`,
    `localDirty:${viewModel.local.localDirty}`,
    `activeMessageIngestionEnabled:${viewModel.local.activeMessageIngestionEnabled}`,
    `chatAgentEnabled:${viewModel.local.chatAgentEnabled}`,
    `draftCreationEnabled:${viewModel.local.draftCreationEnabled}`,
    `sendEnabled:${viewModel.local.sendEnabled}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);

  container.appendChild(article);
}
