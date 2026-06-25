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

function appendDefinitionList(parent, rows, className = "cs-admin-dev__meta") {
  const list = document.createElement("dl");
  list.className = className;
  for (const [label, value] of rows) {
    appendText(list, "dt", label);
    appendText(list, "dd", value ?? "none");
  }
  parent.appendChild(list);
  return list;
}

function appendPillList(parent, items) {
  const list = document.createElement("ul");
  list.className = "cs-admin-dev__pill-row";
  for (const item of items) appendText(list, "li", item);
  parent.appendChild(list);
  return list;
}

function appendCard(parent, card) {
  const section = document.createElement("section");
  section.className = "cs-admin-dev__card";
  appendText(section, "h3", card.title);
  if (card.description) appendText(section, "p", card.description);
  appendDefinitionList(section, card.rows || []);
  parent.appendChild(section);
}

function appendEndpointList(parent, endpoints) {
  const list = document.createElement("ul");
  list.className = "cs-admin-dev__endpoint-list";
  for (const endpoint of endpoints) {
    const item = document.createElement("li");
    appendText(item, "strong", endpoint.endpoint);
    appendText(item, "span", `${endpoint.status} · ${endpoint.note}`);
    list.appendChild(item);
  }
  parent.appendChild(list);
}

function appendActionButton(parent, label, { disabled = false, onClick = null } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cs-admin-dev__button";
  button.textContent = label;
  button.disabled = disabled;
  if (onClick) button.addEventListener("click", onClick);
  parent.appendChild(button);
  return button;
}

function appendErrors(parent, title, errors) {
  if (!errors?.length) return;
  const notice = document.createElement("div");
  notice.className = "cs-admin-dev__notice cs-admin-dev__notice--warning";
  appendText(notice, "h4", title);
  appendPillList(notice, errors);
  parent.appendChild(notice);
}

function appendSyncWorkflow(parent, syncWorkflow, actions = {}) {
  const section = document.createElement("section");
  section.className = "cs-admin-dev__card cs-admin-dev__sync";
  appendText(section, "h3", syncWorkflow.title);
  appendText(section, "p", syncWorkflow.description);

  const grid = document.createElement("div");
  grid.className = "cs-admin-dev__sync-grid";

  const dryRunPanel = document.createElement("section");
  dryRunPanel.className = "cs-admin-dev__sync-panel";
  appendText(dryRunPanel, "h4", "Dry-run preview");
  appendText(dryRunPanel, "p", "Dry-run only — no files written. This previews source readability, validation, blockers, target snapshot, and planned archive path.");
  const dryRunActions = document.createElement("div");
  dryRunActions.className = "cs-admin-dev__actions";
  appendActionButton(dryRunActions, syncWorkflow.dryRun.running ? "Running dry-run sync preview…" : syncWorkflow.dryRun.buttonLabel, {
    disabled: syncWorkflow.dryRun.running,
    onClick: actions.onRunDryRunSync,
  });
  dryRunPanel.appendChild(dryRunActions);
  appendDefinitionList(dryRunPanel, syncWorkflow.dryRun.rows);
  appendText(dryRunPanel, "h5", "Dry-run blockers");
  appendPillList(dryRunPanel, syncWorkflow.dryRun.blockers);
  appendErrors(dryRunPanel, "Dry-run endpoint error", syncWorkflow.dryRun.errors);
  grid.appendChild(dryRunPanel);

  const livePanel = document.createElement("section");
  livePanel.className = "cs-admin-dev__sync-panel";
  appendText(livePanel, "h4", "Confirmed live sync");
  appendText(livePanel, "p", syncWorkflow.live.warning, "cs-admin-dev__danger-copy");

  const confirmField = document.createElement("label");
  confirmField.className = "cs-admin-dev__confirm";
  appendText(confirmField, "span", "Type SYNC to enable live sync");
  const confirmInput = document.createElement("input");
  confirmInput.type = "text";
  confirmInput.autocomplete = "off";
  confirmInput.spellcheck = false;
  confirmInput.placeholder = syncWorkflow.live.requiredConfirmation;
  confirmInput.value = syncWorkflow.live.confirmationValue;
  confirmField.appendChild(confirmInput);
  livePanel.appendChild(confirmField);

  const liveActions = document.createElement("div");
  liveActions.className = "cs-admin-dev__actions";
  const liveButton = appendActionButton(liveActions, syncWorkflow.live.running ? "Running confirmed live sync…" : syncWorkflow.live.buttonLabel, {
    disabled: syncWorkflow.live.disabled,
    onClick: actions.onRunLiveSync,
  });
  confirmInput.addEventListener("input", () => {
    actions.onConfirmationInput?.(confirmInput.value);
    liveButton.disabled = !(syncWorkflow.live.dryRunCompleted && confirmInput.value === syncWorkflow.live.requiredConfirmation) || syncWorkflow.live.running;
  });
  livePanel.appendChild(liveActions);

  appendDefinitionList(livePanel, syncWorkflow.live.rows);
  appendText(livePanel, "h5", "Live-sync blockers / failures");
  appendPillList(livePanel, syncWorkflow.live.blockers);
  appendErrors(livePanel, "Live sync endpoint error", syncWorkflow.live.errors);
  grid.appendChild(livePanel);

  section.appendChild(grid);

  if (syncWorkflow.postSyncProof.visible) {
    const proof = document.createElement("section");
    proof.className = "cs-admin-dev__notice";
    appendText(proof, "h3", syncWorkflow.postSyncProof.title);
    appendText(proof, "p", syncWorkflow.postSyncProof.description);
    appendDefinitionList(proof, syncWorkflow.postSyncProof.rows);
    section.appendChild(proof);
  }

  parent.appendChild(section);
}

function renderProtectedFallback(container, viewModel) {
  const article = document.createElement("article");
  article.className = "cs-admin-dev";

  const header = document.createElement("section");
  header.className = "cs-admin-dev__header";
  appendText(header, "p", viewModel.label, "cs-shell__eyebrow");
  appendText(header, "h2", viewModel.title);
  appendText(header, "p", "This protected shell module requires developer/admin authority. No runtime status endpoints were read for the current user, and no sync controls are shown.");
  appendDefinitionList(header, [
    ["module id", viewModel.moduleId],
    ["route", "/workspace?module=admin_dev"],
    ["authority role", viewModel.access.role],
    ["display role", viewModel.access.displayRole],
    ["visibility reason", viewModel.access.reason],
    ["write policy", "not available"],
  ]);
  article.appendChild(header);

  const notice = document.createElement("section");
  notice.className = "cs-admin-dev__notice cs-admin-dev__notice--warning";
  appendText(notice, "h3", "Protected module");
  appendText(notice, "p", "Admin / Dev is intentionally hidden from normal users and normal workflow use. Ask a developer/admin to use this route for authority/reference status and sync inspection.");
  article.appendChild(notice);

  container.appendChild(article);
}

export function renderAdminDevView(container, viewModel, actions = {}) {
  clearElement(container);

  if (!viewModel.access.allowed) {
    renderProtectedFallback(container, viewModel);
    return;
  }

  const article = document.createElement("article");
  article.className = "cs-admin-dev";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "false";

  const header = document.createElement("section");
  header.className = "cs-admin-dev__header";
  appendText(header, "p", viewModel.label, "cs-shell__eyebrow");
  appendText(header, "h2", viewModel.title);
  appendText(header, "p", "Protected authority/reference status and sync workflow for developer/admin inspection. The only write-capable action is the explicit SYNC-confirmed authority/reference sync POST.");
  appendDefinitionList(header, viewModel.headerRows);
  article.appendChild(header);

  const statusNotice = document.createElement("section");
  statusNotice.className = viewModel.warnings.length
    ? "cs-admin-dev__notice cs-admin-dev__notice--warning"
    : "cs-admin-dev__notice";
  appendText(statusNotice, "h3", `Read status: ${viewModel.status.value}`);
  appendDefinitionList(statusNotice, [
    ["loaded at", viewModel.status.loadedAt],
    ["approved endpoints", viewModel.status.endpointCount],
    ["failed reads", viewModel.status.failedReads],
  ]);
  if (viewModel.warnings.length) appendPillList(statusNotice, viewModel.warnings);
  article.appendChild(statusNotice);

  appendSyncWorkflow(article, viewModel.syncWorkflow, actions);

  const grid = document.createElement("div");
  grid.className = "cs-admin-dev__grid";
  for (const card of viewModel.cards) appendCard(grid, card);
  article.appendChild(grid);

  const endpoints = document.createElement("section");
  endpoints.className = "cs-admin-dev__card";
  appendText(endpoints, "h3", "Approved status endpoints");
  appendText(endpoints, "p", "Status refreshes use same-origin GET requests. The sync workflow above is the only place this module may call the approved authority/reference sync POST endpoints.");
  appendEndpointList(endpoints, viewModel.endpoints);
  article.appendChild(endpoints);

  const blockers = document.createElement("section");
  blockers.className = "cs-admin-dev__card";
  appendText(blockers, "h3", "Blockers and guardrails");
  appendText(blockers, "p", "Runtime-reported blockers are shown as status only. The module does not provide actions to clear, edit, restore, or expose raw authority/reference data.");
  appendPillList(blockers, viewModel.blockers);
  article.appendChild(blockers);

  const safety = document.createElement("section");
  safety.className = "cs-admin-dev__notice";
  appendText(safety, "h3", "Admin / Dev safety contract");
  appendPillList(safety, viewModel.safety);
  article.appendChild(safety);

  container.appendChild(article);
}