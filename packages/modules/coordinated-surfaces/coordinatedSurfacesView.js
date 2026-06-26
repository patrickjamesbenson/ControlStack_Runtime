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

function appendSection(parent, heading, rows) {
  const section = document.createElement("section");
  section.className = "cs-selector-proof__section";
  appendText(section, "h3", heading);
  appendDefinitionList(section, rows);
  parent.appendChild(section);
}

function appendPillList(parent, items) {
  const list = document.createElement("ul");
  list.className = "cs-shell__pill-list";
  for (const item of items) appendText(list, "li", item);
  parent.appendChild(list);
}

export function renderCoordinatedSurfacesView(container, viewModel) {
  clearElement(container);
  const article = document.createElement("article");
  article.className = "cs-selector-proof cs-coordinated-surfaces";
  article.dataset.module = viewModel.moduleId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Diagnostic shell module", "cs-shell__eyebrow");
  appendText(intro, "h2", viewModel.label);
  for (const line of viewModel.requiredWording) appendText(intro, "p", line);
  article.appendChild(intro);

  appendSection(article, "Diagnostic status", [
    ["module status", viewModel.status.moduleStatus],
    ["readOnly", viewModel.status.readOnly],
    ["coordinationAuthority", viewModel.status.coordinationAuthority],
    ["drawingAuthority", viewModel.status.drawingAuthority],
    ["setoutAuthority", viewModel.status.setoutAuthority],
    ["clashResolutionAuthority", viewModel.status.clashResolutionAuthority],
    ["selectorMutationEnabled", viewModel.status.selectorMutationEnabled],
    ["engineMutationEnabled", viewModel.status.engineMutationEnabled],
    ["runTableMutationEnabled", viewModel.status.runTableMutationEnabled],
    ["payloadMutationEnabled", viewModel.status.payloadMutationEnabled],
    ["drawingMutationEnabled", viewModel.status.drawingMutationEnabled],
    ["donorCodeMounted", viewModel.status.donorCodeMounted],
  ]);

  appendSection(article, "Route / id contract status", [
    ["UI/runtime id", viewModel.namingContract.runtimeId],
    ["Selector downstream lane", viewModel.namingContract.selectorDownstreamLane],
    ["donor legacy key", viewModel.namingContract.donorLegacyKey],
  ]);

  appendSection(article, "Downstream readiness summary", [
    ["Scene Builder", viewModel.downstream.sceneBuilder],
    ["EGRES", viewModel.downstream.egres],
    ["Compliance Matters", viewModel.downstream.complianceMatters],
    ["Ceiling / Coordinated Surfaces", viewModel.downstream.coordinatedSurfaces],
    ["Selector ceiling readiness", viewModel.downstream.selectorCeilingReadiness],
  ]);

  appendSection(article, "Candidate counts from shell/downstream context", [
    ["run refs", viewModel.candidateCounts.runRefs],
    ["area refs", viewModel.candidateCounts.areaRefs],
    ["fitting refs", viewModel.candidateCounts.fittingRefs],
    ["option refs", viewModel.candidateCounts.optionRefs],
    ["scene candidates", viewModel.candidateCounts.sceneBuilderCandidates],
    ["emergency candidates", viewModel.candidateCounts.emergencyCandidates],
    ["compliance candidates", viewModel.candidateCounts.complianceCandidates],
    ["ceiling candidates", viewModel.candidateCounts.ceilingCandidates],
  ]);

  appendSection(article, "Shell-owned project context", [
    ["owner", viewModel.project.owner],
    ["status", viewModel.project.status],
    ["title", viewModel.project.title],
    ["project id", viewModel.project.projectId],
    ["readiness", viewModel.project.readiness],
    ["source", viewModel.project.source],
  ]);

  appendSection(article, "Visibility snapshot", [
    ["owner", viewModel.visibility.owner],
    ["status", viewModel.visibility.status],
    ["coordinated_surfaces visible", viewModel.visibility.moduleVisible],
    ["reason", viewModel.visibility.reason],
    ["visible modules", viewModel.visibility.visibleModules],
    ["hidden modules", viewModel.visibility.hiddenModules],
  ]);

  appendSection(article, "Downstream lane diagnostics", [
    ["downstream owner", viewModel.downstream.owner],
    ["downstream status", viewModel.downstream.status],
    ["downstream source", viewModel.downstream.source],
    ["selector status", viewModel.downstream.selectorStatus],
    ["selector source", viewModel.downstream.selectorSource],
    ["scene consumer lane", viewModel.downstream.sceneConsumerLane],
    ["egres consumer lane", viewModel.downstream.egresConsumerLane],
    ["compliance consumer lane", viewModel.downstream.complianceConsumerLane],
    ["ceiling consumer lane", viewModel.downstream.ceilingConsumerLane],
  ]);

  appendSection(article, "Mutation and implementation constraints", [
    ["engine restored", viewModel.constraints.engineRestored],
    ["RunTable restored", viewModel.constraints.runTableRestored],
    ["payload restored", viewModel.constraints.payloadRestored],
    ["Scene Builder implemented", viewModel.constraints.sceneBuilderImplemented],
    ["EGRES implemented", viewModel.constraints.egresImplemented],
    ["Compliance implemented", viewModel.constraints.complianceImplemented],
    ["Ceiling implemented", viewModel.constraints.ceilingImplemented],
    ["donor code copied", viewModel.constraints.donorCodeCopied],
  ]);

  const labelsSection = document.createElement("section");
  appendText(labelsSection, "h3", "Future labels only");
  appendPillList(labelsSection, viewModel.futureLabelsOnly);
  article.appendChild(labelsSection);

  const warningsSection = document.createElement("section");
  appendText(warningsSection, "h3", "Warnings");
  appendPillList(warningsSection, viewModel.warnings);
  article.appendChild(warningsSection);

  appendText(article, "p", `local:${viewModel.local.lastAction}; readOnly:${viewModel.local.readOnly}; diagnosticOnly:${viewModel.local.diagnosticOnly}`, "cs-shell__eyebrow");
  container.appendChild(article);
}
