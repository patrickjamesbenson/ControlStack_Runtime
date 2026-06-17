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
  list.className = "cs-diagnostics__meta";
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
  section.className = "cs-diagnostics__section";
  appendText(section, "h3", heading);
  appendDefinitionList(section, rows);
  parent.appendChild(section);
}

export function renderDiagnosticsView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-diagnostics";
  article.dataset.plugin = viewModel.pluginId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Optional plugin", "cs-shell__eyebrow");
  appendText(intro, "h2", "Diagnostics panel");
  appendText(
    intro,
    "p",
    "This plugin loads after the shell and route module have rendered. It reads shell-owned snapshots only and is not boot-critical.",
  );
  article.appendChild(intro);

  appendSection(article, "Route and shell", [
    ["Route module", viewModel.route.moduleId],
    ["Route path", viewModel.route.path],
    ["Shell phase", viewModel.shell.phase],
    ["Contract", viewModel.shell.contractVersion],
    ["Responsive requirement", viewModel.shell.responsiveRequirement],
  ]);

  appendSection(article, "Identity and project", [
    ["Identity owner", viewModel.identity.owner],
    ["Identity status", viewModel.identity.status],
    ["User", viewModel.identity.user],
    ["Role", viewModel.identity.role],
    ["Project owner", viewModel.project.owner],
    ["Project status", viewModel.project.status],
    ["Project title", viewModel.project.title],
    ["Save status", viewModel.project.saveStatus],
    ["Restore status", viewModel.project.restoreStatus],
  ]);

  appendSection(article, "Company, CRM, and handoff", [
    ["Company owner", viewModel.company.owner],
    ["Company status", viewModel.company.status],
    ["Company", viewModel.company.name],
    ["CRM owner", viewModel.crm.owner],
    ["CRM status", viewModel.crm.status],
    ["HubSpot status", viewModel.crm.hubspotStatus],
    ["CRM writes enabled", viewModel.crm.writeFlowsEnabled],
    ["CRM write policy", viewModel.crm.writeReason],
    ["Handoff owner", viewModel.handoff.owner],
    ["Handoff status", viewModel.handoff.status],
    ["Handoff available", viewModel.handoff.available],
  ]);

  appendSection(article, "Visibility, flags, and plugins", [
    ["Visibility owner", viewModel.visibility.owner],
    ["Visibility status", viewModel.visibility.status],
    ["Known modules", viewModel.visibility.knownModules],
    ["Flags owner", viewModel.flags.owner],
    ["Flags status", viewModel.flags.status],
    ["Engine surface", viewModel.flags.engineSurfaceEnabled],
    ["RunTable surface", viewModel.flags.runTableSurfaceEnabled],
    ["Payload surface", viewModel.flags.payloadSurfaceEnabled],
    ["Plugin registry owner", viewModel.plugin.owner],
    ["Plugins boot-critical", viewModel.plugin.optionalPluginsBootCritical],
  ]);

  const statusSection = document.createElement("section");
  statusSection.className = "cs-diagnostics__section";
  appendText(statusSection, "h3", "Optional plugin statuses");
  appendPillList(
    statusSection,
    viewModel.plugin.statuses.map((status) => `${status.pluginId}:${status.status}`),
  );
  article.appendChild(statusSection);

  const constraintsSection = document.createElement("section");
  constraintsSection.className = "cs-diagnostics__section";
  appendText(constraintsSection, "h3", "Phase 6 constraints");
  appendPillList(constraintsSection, viewModel.constraints);
  article.appendChild(constraintsSection);

  container.appendChild(article);
}
