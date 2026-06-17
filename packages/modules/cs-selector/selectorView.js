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

export function renderSelectorView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Selector migration surface", "cs-shell__eyebrow");
  appendText(intro, "h2", "cs_selector shell context consumer");
  appendText(
    intro,
    "p",
    "Phase 7 keeps current project selection shell-owned. The selector displays read-only identity, company, CRM, and selected current-project context while save, restore, handoff, engine, RunTable, payload, and HubSpot writes remain deferred.",
  );
  article.appendChild(intro);

  appendSection(article, "Shell-owned identity context", [
    ["Identity owner", viewModel.identity.owner],
    ["Identity status", viewModel.identity.status],
    ["Identity source", viewModel.identity.source],
    ["User", viewModel.identity.name],
    ["Email", viewModel.identity.email],
    ["Role", viewModel.identity.role],
    ["Selector capability", viewModel.identity.canViewSelector],
  ]);

  appendSection(article, "Shell-owned current project", [
    ["Project owner", viewModel.project.owner],
    ["Project status", viewModel.project.status],
    ["Project title", viewModel.project.title],
    ["Project ID", viewModel.project.projectId],
    ["Readiness", viewModel.project.readiness],
    ["Project source", viewModel.project.source],
    ["Selected at", viewModel.project.selectedAt],
    ["Client", viewModel.project.client],
    ["Site", viewModel.project.site],
    ["Project dirty", viewModel.project.dirty],
    ["Save status", viewModel.project.saveStatus],
    ["Restore status", viewModel.project.restoreStatus],
  ]);

  appendSection(article, "Shell-owned company context", [
    ["Company owner", viewModel.company.owner],
    ["Company status", viewModel.company.status],
    ["Company source", viewModel.company.source],
    ["Company", viewModel.company.companyName],
    ["Company ID", viewModel.company.companyId],
    ["Website", viewModel.company.website],
    ["Lifecycle stage", viewModel.company.lifecycleStage],
    ["Owner", viewModel.company.ownerName],
    ["Associated deal", viewModel.company.associatedDealId],
    ["Associated contact", viewModel.company.associatedContactId],
  ]);

  appendSection(article, "CRM / HubSpot write policy", [
    ["CRM owner", viewModel.crm.owner],
    ["CRM status", viewModel.crm.status],
    ["CRM source", viewModel.crm.source],
    ["HubSpot status", viewModel.crm.hubspotStatus],
    ["HubSpot available", viewModel.crm.hubspotAvailable],
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
  localSection.className = "cs-selector-proof__section";
  appendText(localSection, "h3", "Selector-local UI state");
  appendPillList(localSection, [
    `category:${viewModel.local.selectedCategory}`,
    `localDirty:${viewModel.local.localDirty}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  article.appendChild(localSection);

  const deferredSection = document.createElement("section");
  deferredSection.className = "cs-selector-proof__section";
  appendText(deferredSection, "h3", "Deferred selector actions");
  appendPillList(deferredSection, viewModel.deferredActions);
  article.appendChild(deferredSection);

  appendText(article, "p", viewModel.responsiveNote, "cs-shell__eyebrow");

  container.appendChild(article);
}
