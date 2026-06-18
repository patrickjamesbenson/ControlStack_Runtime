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

export function renderSceneBuilderView(container, viewModel) {
  clearElement(container);
  const article = document.createElement("article");
  article.className = "cs-selector-proof cs-scene-builder";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Structural module", "cs-shell__eyebrow");
  appendText(intro, "h2", "Scene Builder structural module");
  appendText(intro, "p", "This route proves Scene Builder can mount through the shell and read selector-fed downstream context. It is structural and contract-only; feature logic remains deferred.");
  article.appendChild(intro);

  appendSection(article, "Structural status", [
    ["status", viewModel.structural.status],
    ["contract only", viewModel.structural.contractOnly],
    ["feature restoration", viewModel.structural.featureRestoration],
    ["reads selector internals", viewModel.structural.readsSelectorInternals],
    ["donor code copied", viewModel.structural.donorCodeCopied],
  ]);

  appendSection(article, "Shell-owned project", [
    ["owner", viewModel.project.owner],
    ["status", viewModel.project.status],
    ["title", viewModel.project.title],
    ["project id", viewModel.project.projectId],
    ["readiness", viewModel.project.readiness],
    ["source", viewModel.project.source],
    ["client", viewModel.project.client],
    ["site", viewModel.project.site],
  ]);

  appendSection(article, "Identity and role", [
    ["owner", viewModel.identity.owner],
    ["status", viewModel.identity.status],
    ["identity state", viewModel.identity.identityState],
    ["classification", viewModel.identity.classification],
    ["derived actual role", viewModel.identity.derivedActualRole],
    ["effective actual role", viewModel.identity.actualRole],
    ["display role", viewModel.identity.displayRole],
    ["display clamped", viewModel.identity.displayRoleClamped],
  ]);

  appendSection(article, "Scene Builder visibility", [
    ["owner", viewModel.visibility.owner],
    ["status", viewModel.visibility.status],
    ["scene_builder visible", viewModel.visibility.moduleVisible],
    ["reason", viewModel.visibility.reason],
    ["project input", viewModel.visibility.projectMode],
    ["project present", viewModel.visibility.projectPresent],
    ["visible modules", viewModel.visibility.visibleModules],
    ["hidden modules", viewModel.visibility.hiddenModules],
  ]);

  appendSection(article, "Selector-fed inputs", [
    ["selector owner", viewModel.selectorContext.owner],
    ["selector status", viewModel.selectorContext.status],
    ["selector source", viewModel.selectorContext.source],
    ["run refs", viewModel.selectorContext.runRefs],
    ["area refs", viewModel.selectorContext.areaRefs],
    ["fitting refs", viewModel.selectorContext.fittingRefs],
    ["option refs", viewModel.selectorContext.optionRefs],
    ["scene candidates", viewModel.selectorContext.sceneBuilderCandidates],
    ["emergency candidates", viewModel.selectorContext.emergencyCandidates],
    ["scene readiness", viewModel.selectorContext.readiness],
    ["planned consumers", viewModel.selectorContext.consumers],
  ]);

  appendSection(article, "Deferred future work", [
    ["scene composition", viewModel.guardrails.sceneComposition],
    ["schedule editor", viewModel.guardrails.scheduleEditor],
    ["bindings logic", viewModel.guardrails.bindingsLogic],
    ["area design", viewModel.guardrails.areaDesign],
    ["calculation surface", viewModel.guardrails.calculationSurfaceRestored],
    ["RunTable", viewModel.guardrails.runTableRestored],
    ["package output", viewModel.guardrails.packageOutputRestored],
    ["save / restore / handoff", viewModel.guardrails.saveRestoreHandoffLive],
  ]);

  const localSection = document.createElement("section");
  appendText(localSection, "h3", "Scene Builder-local UI state");
  appendPillList(localSection, [
    `section:${viewModel.local.selectedSection}`,
    `localDirty:${viewModel.local.localDirty}`,
    `lastAction:${viewModel.local.lastAction}`,
  ]);
  article.appendChild(localSection);

  const deferredSection = document.createElement("section");
  appendText(deferredSection, "h3", "Structural guardrails");
  appendPillList(deferredSection, viewModel.deferredActions);
  article.appendChild(deferredSection);
  appendText(article, "p", viewModel.responsiveNote, "cs-shell__eyebrow");
  container.appendChild(article);
}
