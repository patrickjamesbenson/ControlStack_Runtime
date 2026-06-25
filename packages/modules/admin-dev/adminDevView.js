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

function appendArchiveList(parent, archiveInspection, actions = {}) {
  const panel = document.createElement("section");
  panel.className = "cs-admin-dev__sync-panel";
  appendText(panel, "h4", "Archive list");
  appendText(panel, "p", "Basename metadata only. Entries expose name, size, and modified time; no absolute paths or raw file content are returned.");
  appendDefinitionList(panel, archiveInspection.list.rows);

  const archives = archiveInspection.list.archives || [];
  if (!archives.length) {
    appendText(panel, "p", "No archive files are currently available in the runtime archive location.");
    parent.appendChild(panel);
    return;
  }

  const list = document.createElement("ul");
  list.className = "cs-admin-dev__endpoint-list";
  for (const archive of archives) {
    const item = document.createElement("li");
    appendText(item, "strong", archive.name);
    appendText(item, "span", `${archive.size} · modified ${archive.modifiedAt}`);
    const actionsRow = document.createElement("div");
    actionsRow.className = "cs-admin-dev__actions";
    appendActionButton(actionsRow, archiveInspection.diff.running && archiveInspection.diff.selectedArchiveName === archive.name ? "Computing diff…" : "Compute diff summary", {
      disabled: archiveInspection.diff.running,
      onClick: () => actions.onRunArchiveDiff?.(archive.name),
    });
    item.appendChild(actionsRow);
    list.appendChild(item);
  }
  panel.appendChild(list);
  parent.appendChild(panel);
}

function appendDiffKeyEntries(parent, title, summary, { archiveName, section, inspectable = false } = {}, actions = {}) {
  const block = document.createElement("div");
  block.className = "cs-admin-dev__notice";
  appendText(block, "h5", `${title} (${summary.total || 0}${summary.truncated ? "+ truncated" : ""})`);
  const entries = summary.entries || [];
  if (!entries.length) {
    appendText(block, "p", "None reported.");
    parent.appendChild(block);
    return;
  }

  const list = document.createElement("ul");
  list.className = "cs-admin-dev__endpoint-list";
  for (const entry of entries) {
    const item = document.createElement("li");
    appendText(item, "strong", entry.displayKey || entry.inspectKey || "key");
    const fieldSummary = entry.changedFields?.length
      ? `fields: ${entry.changedFields.join(", ")}${entry.changedFieldsTruncated ? ", …" : ""}`
      : entry.changeType || "change";
    appendText(item, "span", fieldSummary);
    if (inspectable && entry.inspectKey) {
      const actionsRow = document.createElement("div");
      actionsRow.className = "cs-admin-dev__actions";
      appendActionButton(actionsRow, "Show field-level diff", {
        disabled: false,
        onClick: () => actions.onRunArchiveDiffDetail?.({ archiveName, section, inspectKey: entry.inspectKey }),
      });
      item.appendChild(actionsRow);
    }
    list.appendChild(item);
  }
  block.appendChild(list);
  parent.appendChild(block);
}

function appendDiffSummary(parent, archiveInspection, actions = {}) {
  const panel = document.createElement("section");
  panel.className = "cs-admin-dev__sync-panel";
  appendText(panel, "h4", "Diff summary");
  appendText(panel, "p", "Compares the selected archive against the current authority/reference snapshot. Summary is section/table-level and never returns full DB JSON.");
  appendDefinitionList(panel, archiveInspection.diff.totalsRows);
  if (archiveInspection.diff.error) appendErrors(panel, "Diff summary endpoint error", [archiveInspection.diff.error]);

  const archiveName = archiveInspection.diff.selectedArchiveName;
  const sections = archiveInspection.diff.sections || [];
  if (!sections.length) {
    appendText(panel, "p", archiveInspection.diff.status === "complete" ? "No section diffs were returned." : "Select an archive to compute a diff summary.");
    parent.appendChild(panel);
    return;
  }

  for (const sectionModel of sections) {
    const sectionBlock = document.createElement("section");
    sectionBlock.className = "cs-admin-dev__card";
    appendText(sectionBlock, "h5", sectionModel.section);
    appendDefinitionList(sectionBlock, sectionModel.rows);
    appendDiffKeyEntries(sectionBlock, "Changed keys", sectionModel.changed, {
      archiveName,
      section: sectionModel.section,
      inspectable: true,
    }, actions);
    appendDiffKeyEntries(sectionBlock, "Added keys", sectionModel.added, {
      archiveName,
      section: sectionModel.section,
      inspectable: false,
    }, actions);
    appendDiffKeyEntries(sectionBlock, "Removed keys", sectionModel.removed, {
      archiveName,
      section: sectionModel.section,
      inspectable: false,
    }, actions);
    panel.appendChild(sectionBlock);
  }

  parent.appendChild(panel);
}

function appendFieldLevelDetail(parent, archiveInspection) {
  const panel = document.createElement("section");
  panel.className = "cs-admin-dev__sync-panel";
  appendText(panel, "h4", "Field-level diff detail");
  appendText(panel, "p", "On-demand changed-field inspection only. This panel shows changed fields as old/new pairs and confirms no full row was returned.");
  appendDefinitionList(panel, archiveInspection.detail.rows);
  if (archiveInspection.detail.error) appendErrors(panel, "Field-level diff endpoint error", [archiveInspection.detail.error]);
  if (archiveInspection.detail.fieldRows?.length) {
    appendText(panel, "h5", "Changed fields");
    appendDefinitionList(panel, archiveInspection.detail.fieldRows);
  } else {
    appendText(panel, "p", archiveInspection.detail.status === "complete" ? "No changed fields returned for this key." : "Choose a changed key from the diff summary to inspect field-level differences.");
  }
  parent.appendChild(panel);
}

function appendArchiveInspection(parent, archiveInspection, actions = {}) {
  const section = document.createElement("section");
  section.className = "cs-admin-dev__card cs-admin-dev__sync";
  appendText(section, "h3", archiveInspection.title);
  appendText(section, "p", archiveInspection.description);

  const grid = document.createElement("div");
  grid.className = "cs-admin-dev__sync-grid";
  appendArchiveList(grid, archiveInspection, actions);
  appendDiffSummary(grid, archiveInspection, actions);
  appendFieldLevelDetail(grid, archiveInspection);
  section.appendChild(grid);
  parent.appendChild(section);
}

function renderProtectedFallback(container, viewModel) {
  const article = document.createElement("article");
  article.className = "cs-admin-dev";

  const header = document.createElement("section");
  header.className = "cs-admin-dev__header";
  appendText(header, "p", viewModel.label, "cs-shell__eyebrow");
  appendText(header, "h2", viewModel.title);
  appendText(header, "p", "This protected shell module requires developer/admin authority. No runtime status endpoints were read for the current user, and no sync/archive controls are shown.");
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
  appendText(notice, "p", "Admin / Dev is intentionally hidden from normal users and normal workflow use. Ask a developer/admin to use this route for authority/reference status, sync, and archive diff inspection.");
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
  appendText(header, "p", "Protected authority/reference status, sync workflow, and read-only archive diff inspection for developer/admin use. Restore, restore preview, row editing, and raw DB browsing are not present.");
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
  appendArchiveInspection(article, viewModel.archiveInspection, actions);

  const grid = document.createElement("div");
  grid.className = "cs-admin-dev__grid";
  for (const card of viewModel.cards) appendCard(grid, card);
  article.appendChild(grid);

  const endpoints = document.createElement("section");
  endpoints.className = "cs-admin-dev__card";
  appendText(endpoints, "h3", "Approved status endpoints");
  appendText(endpoints, "p", "Status refreshes use same-origin GET requests. Archive diff/detail and sync actions are limited to the approved authority/reference endpoints only.");
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
