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

export function renderIesBuilderView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Runtime IES candidate-output contract/status diagnostics", "cs-shell__eyebrow");
  appendText(intro, "h2", "IES Builder / Photometry");
  for (const statement of viewModel.boundaryStatements) {
    appendText(intro, "p", statement);
  }
  article.appendChild(intro);

  appendSection(article, "IES Builder status", viewModel.statusRows);
  appendSection(article, "IES candidate-output contract schema", viewModel.candidateContractRows);
  appendSection(article, "IES candidate state", viewModel.candidateStateRows);
  appendSection(article, "IES candidate readiness blockers", viewModel.readinessBlockerRows);
  appendSection(article, "IES candidate source refs", viewModel.sourceRefRows);
  appendSection(article, "Selected family/subset lock placeholder", viewModel.selectedFamilySubsetLockRows);
  appendSection(article, "Product intent summary", viewModel.productIntentRows);
  appendSection(article, "Actual build geometry ownership policy", viewModel.geometryPolicyRows);
  appendSection(article, "1mm candidate photometry policy metadata", viewModel.oneMmPolicyRows);
  appendSection(article, "Run summary shape", viewModel.runSummaryShapeRows);
  appendSection(article, "Photometry metadata shape", viewModel.photometryMetadataShapeRows);
  appendSection(article, "Opaque candidate artefact refs", viewModel.candidateArtefactRefRows);
  appendSection(article, "IES candidate redaction flags", viewModel.redactionFlagRows);
  appendSection(article, "IES selected-result handoff contract", viewModel.handoffContractRows);
  appendSection(article, "IES selected-result handoff blockers", viewModel.handoffBlockerRows);
  appendSection(article, "Selected result state summary", viewModel.selectedResultStateSummaryRows);
  appendSection(article, "Selected family/subset lock readiness", viewModel.selectedFamilySubsetLockReadinessRows);
  appendSection(article, "Per-run lookup readiness", viewModel.perRunLookupReadinessRows);
  appendSection(article, "Board Data source-version readiness", viewModel.boardDataSourceVersionReadinessRows);
  appendSection(article, "Source-input fingerprint readiness", viewModel.sourceInputFingerprintReadinessRows);
  appendSection(article, "Source photometry ref readiness", viewModel.sourcePhotometryRefReadinessRows);
  appendSection(article, "IES handoff 1mm policy metadata", viewModel.handoffOneMmPolicyRows);
  appendSection(article, "IES candidate readiness runtime status flags", viewModel.candidateReadinessFlagRows);
  appendListSection(article, "IES candidate readiness requirements", viewModel.candidateReadinessRequirements);
  appendListSection(article, "IES candidate states", viewModel.candidateStates);
  appendSection(article, "IES Builder relationship map", viewModel.relationshipRows);
  appendListSection(article, "Candidate output contract boundary copy", viewModel.contractBoundaryCopy);
  appendListSection(article, "Candidate readiness boundary copy", viewModel.boundaryStatements);
  appendSection(article, "Fixture/parser diagnostics", viewModel.fixtureParserDiagnosticRows);
  appendSection(article, "Fixture/parser diagnostic safety flags", viewModel.safetyRows);
  appendSection(article, "Additional disabled runtime surfaces", viewModel.lockRows);
  appendSection(article, "Runtime write and proof boundary", viewModel.boundaryRows);

  const warningSection = document.createElement("section");
  warningSection.className = "cs-selector-proof__section";
  appendText(warningSection, "h3", "IES Builder boundary warnings");
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
