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

function appendListSection(parent, heading, items) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", heading);
  appendPillList(section, items);
  parent.appendChild(section);
}

export function renderLabProofView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Runtime Lab proof boundary inspector", "cs-shell__eyebrow");
  appendText(intro, "h2", "Lab Proof");
  appendText(intro, "p", "Lab Proof readiness is diagnostic only in this slice.");
  appendText(intro, "p", "This module does not provide production proof authority in this slice.");
  appendText(intro, "p", "No evidence is uploaded, parsed, exposed, approved, or certified here.");
  appendText(intro, "p", "Candidate compatibility, Board Data metadata, and IES candidates are not proof.");
  appendText(intro, "p", "Lab Proof is the production proof authority once an approved Lab authority contract exists.");
  appendText(intro, "p", "PURE_REF_STATE is diagnostic metadata only until a later approved Lab authority contract exists.");
  appendText(intro, "p", "Selector, IES Builder, Board Data, Compliance Matters, Controlled Records, RREG, EGRES, and Coordinated Surfaces must not treat diagnostic metadata as proof.");
  article.appendChild(intro);

  appendSection(article, "Lab Proof endpoint", viewModel.statusRows);
  appendSection(article, "Runtime status flags", viewModel.runtimeStatusFlagRows);
  appendListSection(article, "Proof readiness categories", viewModel.proofReadinessCategories);
  appendListSection(article, "Evidence boundary fields", viewModel.evidenceBoundaryFields);
  appendListSection(article, "Evidence boundary copy", viewModel.boundaryCopy);
  appendSection(article, "Relationship map", viewModel.relationshipMapRows);
  appendSection(article, "Read-only diagnostic boundary", viewModel.boundaryRows);
  appendSection(article, "Source and mutation safety", viewModel.healthRows);
  appendSection(article, "Equipment summary", viewModel.equipmentRows);
  appendSection(article, "Equipment table metadata", viewModel.equipmentTableRows);
  appendSection(article, "Calibration summary", viewModel.calibrationRows);
  appendSection(article, "Calibration table metadata", viewModel.calibrationTableRows);
  appendSection(article, "Reference state summary", viewModel.referenceRows);
  appendSection(article, "Reference state table metadata", viewModel.referenceTableRows);
  appendSection(article, "Export-safe manifest summary", viewModel.exportManifestRows);
  appendSection(article, "Export-safe manifest table metadata", viewModel.exportManifestTableRows);

  const warningSection = document.createElement("section");
  warningSection.className = "cs-selector-proof__section";
  appendText(warningSection, "h3", "Lab Proof warnings");
  appendPillList(warningSection, viewModel.warnings);
  article.appendChild(warningSection);

  appendSection(article, "Module-local load state", [
    ["moduleId", viewModel.moduleId],
    ["label", viewModel.label],
    ["local status", viewModel.localStatus],
    ["loadedAt", viewModel.loadedAt],
    ["lastAction", viewModel.lastAction],
    ["shell route", viewModel.shellRoute],
  ]);

  container.appendChild(article);
}
