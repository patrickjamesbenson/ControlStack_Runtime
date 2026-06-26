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

function appendStatementSection(parent, statements, heading = "Board Data authority boundary") {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", heading);
  appendPillList(section, statements);
  parent.appendChild(section);
}

function appendDetailInspector(parent, categories) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", "Redacted detail inspector");
  appendText(section, "p", "Safe summaries only: presence, counts, readability, redaction status, proof boundary status, and warnings.");

  for (const category of categories) {
    const card = document.createElement("article");
    card.className = "cs-selector-proof__section";
    card.dataset.boardDataCategory = category.key;
    appendText(card, "h4", category.label);
    appendDefinitionList(card, category.rows);
    section.appendChild(card);
  }

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
  appendText(intro, "p", "Board Data / Selector Reference live status is read-only in this slice.");
  appendText(intro, "p", "This status bridge reports source presence, table readiness, and redaction safety only.");
  appendText(intro, "p", "Raw rows, raw USERS, raw Lab evidence, credentials, private paths, and secret values are not exposed.");
  appendText(intro, "p", "Selector resolving remains disabled until a later approved resolver-preview slice.");
  appendText(intro, "p", "Board Data defines metadata. Selector resolves later. Lab proves later.");
  appendText(intro, "p", "Board Data is read-only in this slice.");
  appendText(intro, "p", "Board Data defines product/component metadata.");
  appendText(intro, "p", "This inspector shows redacted summaries only.");
  appendText(intro, "p", "No raw table rows are exposed.");
  appendText(intro, "p", "No USERS rows, USERS headers, email addresses, credentials, Google rows, or raw Lab evidence are exposed.");
  appendText(intro, "p", "Board Data does not provide Lab proof.");
  appendText(intro, "p", "Board Data does not mutate Selector.");
  appendText(intro, "p", "Board Data does not generate IES files.");
  appendText(intro, "p", "Materialiser refresh and active snapshot promotion remain separate controlled workflows.");
  article.appendChild(intro);

  appendStatementSection(article, viewModel.liveStatusCopy, "Board Data / Selector Reference live status bridge");
  appendStatementSection(article, viewModel.requiredBoundaryStatements);
  appendSection(article, "Live source/data readiness bridge", viewModel.liveStatusRows);
  appendSection(article, "Board Data source", viewModel.sourceRows);
  appendSection(article, "Board Data safety flags", viewModel.safetyRows);
  appendDetailInspector(article, viewModel.redactedDetailCategories);
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
