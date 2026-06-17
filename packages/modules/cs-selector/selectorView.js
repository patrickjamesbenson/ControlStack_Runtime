function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function appendText(parent, tagName, text, className = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
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
  appendText(section, "h3", heading);
  appendDefinitionList(section, rows);
  parent.appendChild(section);
}

export function renderSelectorView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Selector migration surface", "cs-shell__eyebrow");
  appendText(intro, "h2", "cs_selector contract consumer");
  appendText(
    intro,
    "p",
    "Phase 3 keeps selector logic narrow: it consumes shell-owned project, visibility, and feature-flag policy while save, restore, handoff, engine, RunTable, and payload work remain deferred.",
  );
  article.appendChild(intro);

  appendSection(article, "Shell-owned project context", [
    ["Project owner", viewModel.project.owner],
    ["Project title", viewModel.project.title],
    ["Project dirty", viewModel.project.dirty],
    ["Metadata source", viewModel.project.metadataSource],
    ["Save status", viewModel.project.saveStatus],
    ["Restore status", viewModel.project.restoreStatus],
  ]);

  appendSection(article, "Shell-owned handoff placeholder", [
    ["Handoff owner", viewModel.handoff.owner],
    ["Handoff status", viewModel.handoff.status],
    ["Handoff available", viewModel.handoff.available],
  ]);

  appendSection(article, "Visibility and feature flags", [
    ["Visibility owner", viewModel.visibility.owner],
    ["Selector visible", viewModel.visibility.selectorVisible],
    ["Visibility rule", viewModel.visibility.rule],
    ["Feature flags owner", viewModel.flags.owner],
    ["Feature migration", viewModel.flags.featureMigrationEnabled],
    ["Project persistence live", viewModel.flags.projectPersistenceLive],
    ["Handoff live", viewModel.flags.handoffLive],
    ["Engine surface", viewModel.flags.engineSurfaceEnabled],
    ["RunTable surface", viewModel.flags.runTableSurfaceEnabled],
    ["Payload surface", viewModel.flags.payloadSurfaceEnabled],
  ]);

  const localSection = document.createElement("section");
  appendText(localSection, "h3", "Selector-local UI state");
  appendPillList(localSection, [
    `category:${viewModel.local.selectedCategory}`,
    `localDirty:${viewModel.local.localDirty}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  article.appendChild(localSection);

  const deferredSection = document.createElement("section");
  appendText(deferredSection, "h3", "Deferred selector actions");
  appendPillList(deferredSection, viewModel.deferredActions);
  article.appendChild(deferredSection);

  container.appendChild(article);
}
