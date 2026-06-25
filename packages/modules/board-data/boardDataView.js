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

export function renderBoardDataView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Runtime product data inspector", "cs-shell__eyebrow");
  appendText(intro, "h2", "Board Data");
  appendText(intro, "p", "Board Data defines product/component metadata.");
  appendText(intro, "p", "Lab approval is required for proof. Selector mutation is disabled. Google/materialiser writes are disabled. Raw rows are not exposed in this first slice.");
  article.appendChild(intro);

  appendSection(article, "Board Data source", viewModel.sourceRows);
  appendSection(article, "Board Data safety flags", viewModel.safetyRows);
  appendSection(article, "Product/component table counts", viewModel.countRows);
  appendSection(article, "Boundary and redaction status", viewModel.boundaryRows);
  appendSection(article, "Expected table summary", viewModel.tableRows);

  const warningSection = document.createElement("section");
  warningSection.className = "cs-selector-proof__section";
  appendText(warningSection, "h3", "Board Data boundary warning");
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
