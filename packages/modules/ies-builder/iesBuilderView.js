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

export function renderIesBuilderView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Runtime photometry status inspector", "cs-shell__eyebrow");
  appendText(intro, "h2", "IES Builder / Photometry");
  appendText(intro, "p", "IES Builder will generate candidate photometry only.");
  appendText(intro, "p", "Lab approval is required before any output can be treated as proof.");
  appendText(intro, "p", "Selector mutation is disabled. Board Data writes are disabled.");
  appendText(intro, "p", "Upload, parse, export, and polar preview are disabled in this first slice.");
  appendText(intro, "p", "Raw IES contents are not exposed.");
  article.appendChild(intro);

  appendSection(article, "IES Builder status", viewModel.statusRows);
  appendSection(article, "IES Builder safety flags", viewModel.safetyRows);
  appendSection(article, "Runtime write and proof boundary", viewModel.boundaryRows);

  const warningSection = document.createElement("section");
  warningSection.className = "cs-selector-proof__section";
  appendText(warningSection, "h3", "IES Builder boundary warning");
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
