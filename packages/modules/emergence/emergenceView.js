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
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", heading);
  appendDefinitionList(section, rows);
  parent.appendChild(section);
}

export function renderEmergenceView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Module expansion proof", "cs-shell__eyebrow");
  appendText(intro, "h2", "emergence contract consumer");
  appendText(
    intro,
    "p",
    "Phase 5 proves a second runtime module can mount cleanly and consume shell-owned services without restoring engine, RunTable, payload, HubSpot writes, optional plugins, or donor parity code.",
  );
  article.appendChild(intro);

  appendSection(article, "Shell-owned identity context", [
    ["Identity owner", viewModel.identity.owner],
    ["Identity status", viewModel.identity.status],
    ["User", viewModel.identity.name],
    ["Email", viewModel.identity.email],
    ["Role", viewModel.identity.role],
    ["Emergence capability", viewModel.identity.canViewEmergence],
  ]);

  appendSection(article, "Shell-owned project context", [
    ["Project owner", viewModel.project.owner],
    ["Project title", viewModel.project.title],
    ["Project dirty", viewModel.project.dirty],
    ["Metadata source", viewModel.project.metadataSource],
    ["Save status", viewModel.project.saveStatus],
    ["Restore status", viewModel.project.restoreStatus],
  ]);

  appendSection(article, "Shell-owned company / CRM context", [
    ["Company owner", viewModel.company.owner],
    ["Company status", viewModel.company.status],
    ["Company source", viewModel.company.source],
    ["Company", viewModel.company.companyName],
    ["Associated deal", viewModel.company.associatedDealId],
    ["Associated contact", viewModel.company.associatedContactId],
    ["CRM owner", viewModel.crm.owner],
    ["CRM status", viewModel.crm.status],
    ["HubSpot status", viewModel.crm.hubspotStatus],
    ["Write flows enabled", viewModel.crm.writeFlowsEnabled],
    ["Write policy", viewModel.crm.writeReason],
  ]);

  appendSection(article, "Shell-owned handoff placeholder", [
    ["Handoff owner", viewModel.handoff.owner],
    ["Handoff status", viewModel.handoff.status],
    ["Handoff available", viewModel.handoff.available],
  ]);

  appendSection(article, "Visibility and feature flags", [
    ["Visibility owner", viewModel.visibility.owner],
    ["Emergence visible", viewModel.visibility.moduleVisible],
    ["Visibility rule", viewModel.visibility.rule],
    ["Feature flags owner", viewModel.flags.owner],
    ["Feature migration", viewModel.flags.featureMigrationEnabled],
    ["Project persistence live", viewModel.flags.projectPersistenceLive],
    ["Handoff live", viewModel.flags.handoffLive],
    ["CRM live", viewModel.flags.crmLive],
    ["Engine surface", viewModel.flags.engineSurfaceEnabled],
    ["RunTable surface", viewModel.flags.runTableSurfaceEnabled],
    ["Payload surface", viewModel.flags.payloadSurfaceEnabled],
  ]);

  const localSection = document.createElement("section");
  localSection.className = "cs-selector-proof__section";
  appendText(localSection, "h3", "Emergence-local UI state");
  appendPillList(localSection, [
    `section:${viewModel.local.selectedSection}`,
    `localDirty:${viewModel.local.localDirty}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  article.appendChild(localSection);

  const deferredSection = document.createElement("section");
  deferredSection.className = "cs-selector-proof__section";
  appendText(deferredSection, "h3", "Deferred module actions");
  appendPillList(deferredSection, viewModel.deferredActions);
  article.appendChild(deferredSection);

  appendText(article, "p", viewModel.responsiveNote, "cs-shell__eyebrow");

  container.appendChild(article);
}
