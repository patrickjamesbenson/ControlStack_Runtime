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

export function renderEngineFlowView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof cs-engine-flow";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "true";
  article.dataset.diagnosticOnly = "true";
  article.dataset.staticMapOnly = "true";
  article.dataset.engineExecutionEnabled = "false";
  article.dataset.selectorFiringEnabled = "false";
  article.dataset.labProofAuthority = "false";

  const intro = document.createElement("div");
  appendText(intro, "p", "Diagnostic shell module", "cs-shell__eyebrow");
  appendText(intro, "h2", viewModel.label);
  appendText(intro, "p", `${viewModel.group} · ${viewModel.status} · ${viewModel.routePath}`);
  for (const line of viewModel.requiredWording) appendText(intro, "p", line);
  article.appendChild(intro);

  appendSection(article, "Runtime status flags", viewModel.runtimeStatusRows);
  appendList(article, "Role boundary", viewModel.roleBoundary);
  appendList(article, "Manual engineering process map", viewModel.manualEngineeringProcessMap);
  appendList(article, "Runtime candidate-generation process map", viewModel.runtimeCandidateGenerationProcessMap);
  appendList(article, "Confidence labels", viewModel.confidenceLabels);
  appendList(article, "Proof-boundary labels", viewModel.proofBoundaryLabels);
  appendList(article, "Allowed consumers", viewModel.allowedConsumers);
  appendList(article, "Disallowed claims", viewModel.disallowedClaims);
  appendSection(article, "Runtime context", viewModel.contextRows);
  appendSection(article, "No-write guardrails", viewModel.guardrailRows);
  appendList(article, "Module-local state", [
    `section:${viewModel.local.selectedSection}`,
    `readOnly:${viewModel.local.readOnly}`,
    `diagnosticOnly:${viewModel.local.diagnosticOnly}`,
    `staticMapOnly:${viewModel.local.staticMapOnly}`,
    `localDirty:${viewModel.local.localDirty}`,
    `engineExecutionEnabled:${viewModel.local.engineExecutionEnabled}`,
    `selectorFiringEnabled:${viewModel.local.selectorFiringEnabled}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);

  container.appendChild(article);
}
