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
  appendText(intro, "p", "Emergency / EGRES package diagnostics", "cs-shell__eyebrow");
  appendText(intro, "h2", "Emergency / EGRES diagnostic module");
  appendText(intro, "p", "Emergency / EGRES package diagnostics are read-only in this slice.");
  article.appendChild(intro);

  const wordingSection = document.createElement("section");
  wordingSection.className = "cs-selector-proof__section";
  appendText(wordingSection, "h3", "Required read-only wording");
  for (const wording of viewModel.requiredWording) appendText(wordingSection, "p", wording);
  article.appendChild(wordingSection);

  appendSection(article, "Package/evidence readiness diagnostics", viewModel.diagnosticRows);

  appendSection(article, "Safe downstream summary", viewModel.safeSummaryRows);

  appendSection(article, "Safe candidate counts", viewModel.candidateCountRows);

  appendSection(article, "Naming and route contract", [
    ["Runtime route currently mounted", "emergence"],
    ["Display label", "Emergency / EGRES"],
    ["Downstream lane name", "egres"],
    ["Donor/source vocabulary", "EGRES / Emergency"],
    ["Current authority", "diagnostic-only"],
    ["Route alias", "egres routes to this same diagnostic module only; emergence remains the runtime mount id"],
  ]);

  appendSection(article, "Explicit non-authority", [
    ["Workflow", "This slice does not restore EGRES row/tag workflow."],
    ["Certification", "This slice does not provide AS2293 certification, commissioning signoff, emergency compliance approval, project approval, or authority approval."],
    ["Package readiness", "Package evidence readiness is diagnostic only."],
    ["Compliance dependency", "Compliance Matters may depend on EGRES package evidence, but this module does not approve that evidence."],
    ["Proof authority", "Lab Proof remains the boundary for proof authority, and this slice does not create proof authority."],
    ["Donor code", "No donor code is mounted."],
    ["Server endpoint", "No server endpoint is added."],
  ]);

  const warningSection = document.createElement("section");
  warningSection.className = "cs-selector-proof__section";
  appendText(warningSection, "h3", "Warnings / missing items");
  appendPillList(warningSection, viewModel.warnings);
  article.appendChild(warningSection);

  appendText(article, "p", "Runtime currently mounts this module as `emergence`.");
  appendText(article, "p", "Selector/downstream language may refer to this lane as `egres`.");

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
    ["actual role derived", viewModel.identity.actualRoleDerived],
    ["override active", viewModel.identity.actualRoleOverrideEnabled],
    ["override role", viewModel.identity.actualRoleOverride],
    ["display role", viewModel.identity.displayRole],
    ["display requested", viewModel.identity.displayRoleRequested],
    ["display clamped", viewModel.identity.displayRoleClamped],
    ["emergence capability", viewModel.identity.canViewEmergence],
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
    ["test mode", viewModel.visibility.testMode],
    ["emergence visible", viewModel.visibility.moduleVisible],
    ["reason", viewModel.visibility.moduleReason],
    ["project input", viewModel.visibility.projectMode],
    ["project present", viewModel.visibility.projectPresent],
    ["visible modules", viewModel.visibility.visibleModules],
    ["hidden modules", viewModel.visibility.hiddenModules],
  ]);

  appendSection(article, "Shared actions", [
    ["handoff", viewModel.handoff.status],
    ["crm", viewModel.crm.status],
    ["crm writes", viewModel.crm.writeFlowsEnabled],
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
  appendText(deferredSection, "h3", "Deferred actions");
  appendPillList(deferredSection, viewModel.deferredActions);
  article.appendChild(deferredSection);
  appendText(article, "p", viewModel.responsiveNote, "cs-shell__eyebrow");
  container.appendChild(article);
}
