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
  appendText(intro, "p", "Selector now shows a shell-owned downstream context foundation. This is contract-only: Scene Builder, EGRES, Compliance Matters, Ceiling, engine, RunTable, and payload remain out of scope.");
  article.appendChild(intro);

  appendSection(article, "Identity and derived role", [
    ["owner", viewModel.identity.owner],
    ["status", viewModel.identity.status],
    ["user", viewModel.identity.name],
    ["email", viewModel.identity.email],
    ["identity state", viewModel.identity.identityState],
    ["classification", viewModel.identity.classification],
    ["derived actual role", viewModel.identity.derivedActualRole],
    ["effective actual role", viewModel.identity.actualRole],
    ["actual role source", viewModel.identity.actualRoleSource],
    ["override active", viewModel.identity.actualRoleOverrideEnabled],
    ["display role", viewModel.identity.displayRole],
    ["display clamped", viewModel.identity.displayRoleClamped],
    ["selector capability", viewModel.identity.canViewSelector],
  ]);

  appendSection(article, "Current project", [
    ["owner", viewModel.project.owner],
    ["status", viewModel.project.status],
    ["title", viewModel.project.title],
    ["project id", viewModel.project.projectId],
    ["readiness", viewModel.project.readiness],
    ["source", viewModel.project.source],
    ["client", viewModel.project.client],
    ["site", viewModel.project.site],
    ["save", viewModel.project.saveStatus],
    ["restore", viewModel.project.restoreStatus],
  ]);

  appendSection(article, "Visibility", [
    ["owner", viewModel.visibility.owner],
    ["status", viewModel.visibility.status],
    ["selector visible", viewModel.visibility.selectorVisible],
    ["reason", viewModel.visibility.selectorReason],
    ["project input", viewModel.visibility.projectMode],
    ["project present", viewModel.visibility.projectPresent],
    ["visible modules", viewModel.visibility.visibleModules],
    ["hidden modules", viewModel.visibility.hiddenModules],
  ]);

  appendSection(article, "Timeline policy consumer", [
    ["owner", viewModel.timelinePolicy.owner],
    ["status", viewModel.timelinePolicy.status],
    ["source", viewModel.timelinePolicy.source],
    ["consumed from", viewModel.timelinePolicy.consumedFrom],
    ["selector authoritative", viewModel.timelinePolicy.selectorAuthoritative],
    ["lane", viewModel.timelinePolicy.lane],
    ["actual role source", viewModel.timelinePolicy.actualRoleSource],
    ["allowed statuses", viewModel.timelinePolicy.allowedStatuses],
    ["controls visible", viewModel.timelinePolicy.controlsVisible],
    ["controls reason", viewModel.timelinePolicy.controlsReason],
    ["diagnostics visible", viewModel.timelinePolicy.diagnosticsVisible],
    ["gate", viewModel.timelinePolicy.gateMode],
    ["selector may override", viewModel.timelinePolicy.selectorMayOverride],
    ["selector owns status rules", viewModel.timelinePolicy.selectorOwnsStatusRules],
    ["default window", viewModel.timelinePolicy.defaultWindow],
    ["project stage", viewModel.timelinePolicy.projectStage],
    ["due date position", viewModel.timelinePolicy.dueDatePosition],
    ["persistence live", viewModel.timelinePolicy.persistenceLive],
    ["write enabled", viewModel.timelinePolicy.writeEnabled],
    ["local timeline refs", viewModel.timelinePolicy.itemRefs],
  ]);

  appendSection(article, "Downstream context foundation", [
    ["owner", viewModel.downstream.owner],
    ["status", viewModel.downstream.status],
    ["source", viewModel.downstream.source],
    ["selector status", viewModel.downstream.selectorStatus],
    ["run refs", viewModel.downstream.runRefs],
    ["area refs", viewModel.downstream.areaRefs],
    ["fitting refs", viewModel.downstream.fittingRefs],
    ["option refs", viewModel.downstream.optionRefs],
    ["emergency candidates", viewModel.downstream.emergencyCandidates],
    ["scene candidates", viewModel.downstream.sceneBuilderCandidates],
    ["compliance candidates", viewModel.downstream.complianceCandidates],
    ["ceiling candidates", viewModel.downstream.ceilingCandidates],
    ["planned consumers", viewModel.downstream.consumers],
  ]);

  appendSection(article, "Downstream readiness", [
    ["Scene Builder", viewModel.downstream.sceneBuilderReadiness],
    ["Emergency / EGRES", viewModel.downstream.egresReadiness],
    ["Compliance Matters", viewModel.downstream.complianceReadiness],
    ["Ceiling / Coordinated Surfaces", viewModel.downstream.ceilingReadiness],
    ["engine restored", viewModel.downstream.constraints.engineRestored],
    ["RunTable restored", viewModel.downstream.constraints.runTableRestored],
    ["payload restored", viewModel.downstream.constraints.payloadRestored],
  ]);

  appendSection(article, "Shared actions", [
    ["handoff", viewModel.handoff.status],
    ["crm", viewModel.crm.status],
    ["crm writes", viewModel.crm.writeFlowsEnabled],
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
  appendText(deferredSection, "h3", "Deferred actions");
  appendPillList(deferredSection, viewModel.deferredActions);
  article.appendChild(deferredSection);
  appendText(article, "p", viewModel.responsiveNote, "cs-shell__eyebrow");
  container.appendChild(article);
}
