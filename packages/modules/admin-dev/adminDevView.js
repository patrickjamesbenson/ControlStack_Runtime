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
  for (const [label, value] of rows || []) {
    appendText(list, "dt", label);
    appendText(list, "dd", value ?? "none");
  }
  parent.appendChild(list);
  return list;
}

function appendPillList(parent, items) {
  const list = document.createElement("ul");
  list.className = "cs-admin-dev__pill-row";
  for (const item of items || []) appendText(list, "li", item);
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
  for (const endpoint of endpoints || []) {
    const item = document.createElement("li");
    appendText(item, "strong", endpoint.endpoint);
    appendText(item, "span", `${endpoint.status} · ${endpoint.note}`);
    list.appendChild(item);
  }
  parent.appendChild(list);
}

function appendActionButton(parent, label, { disabled = false, onClick = null, variant = "secondary" } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `cs-admin-dev__button cs-admin-dev__button--${variant}`;
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

function appendDisclosure(parent, title, description, className = "cs-admin-dev__diagnostics", key = "") {
  const details = document.createElement("details");
  details.className = className;
  const summary = document.createElement("summary");
  summary.className = "cs-admin-dev__diagnostics-toggle";
  if (key) appendText(summary, "span", key, "cs-admin-dev__diagnostics-key");
  appendText(summary, "span", title);
  details.appendChild(summary);
  const body = document.createElement("div");
  body.className = "cs-admin-dev__diagnostics-body";
  if (description) appendText(body, "p", description);
  details.appendChild(body);
  parent.appendChild(details);
  return body;
}

function rowValue(rows = [], label, fallback = "not reported") {
  const row = (rows || []).find(([rowLabel]) => rowLabel === label);
  return row ? row[1] : fallback;
}

function pickRows(rows = [], labels = []) {
  return labels.map((label) => [label, rowValue(rows, label)]);
}

function filterRows(rows = [], hiddenLabels = []) {
  const hidden = new Set(hiddenLabels);
  return (rows || []).filter(([label]) => !hidden.has(label));
}

function findCard(viewModel, title) {
  return (viewModel.cards || []).find((card) => card.title === title) || { rows: [] };
}

function fileLabel(value) {
  const text = String(value || "").trim();
  if (!text || text === "not configured" || text === "not planned" || text === "not planned/reported" || text === "not reported") return text || "not reported";
  const parts = text.split(/[\\/]+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : text;
}

function uniqueItems(items = []) {
  const seen = new Set();
  const result = [];
  for (const item of items || []) {
    const key = String(item || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result;
}

function isRealItem(item) {
  const text = String(item || "").toLowerCase();
  if (!text) return false;
  if (text.startsWith("no blockers reported")) return false;
  if (text.startsWith("run dry-run")) return false;
  if (text.startsWith("run restore preview")) return false;
  return true;
}

function isSetupItem(item) {
  const text = String(item || "").toLowerCase();
  return text.includes("sync-disabled")
    || text.includes("execution-disabled")
    || text.includes("source-unreadable")
    || text.includes("materialised-source-missing")
    || text.includes("source-validation-failed")
    || text.includes("archive-unavailable")
    || text.includes("archive directory")
    || text.includes("source path is not configured")
    || text.includes("materialised source")
    || text.includes("write-policy-disabled");
}

function actionableItems(items = []) {
  return uniqueItems((items || []).filter(isRealItem));
}

function syncBlockers(syncWorkflow) {
  return actionableItems([...(syncWorkflow.dryRun?.blockers || []), ...(syncWorkflow.live?.blockers || [])]);
}

function setupBlockers(syncWorkflow) {
  return syncBlockers(syncWorkflow).filter(isSetupItem);
}

function syncSetupIncomplete(syncWorkflow) {
  const dryRows = syncWorkflow.dryRun?.rows || [];
  const liveAllowed = String(rowValue(dryRows, "live sync currently allowed", "unknown")).toLowerCase();
  return setupBlockers(syncWorkflow).length > 0 || liveAllowed === "no" || liveAllowed === "false";
}

function syncCanRun(syncWorkflow) {
  return syncWorkflow.dryRun?.completed === true && !syncSetupIncomplete(syncWorkflow);
}

function statusLabel(viewModel) {
  const status = viewModel.status?.value || "idle";
  if (status === "loading") return { label: "Checking", tone: "loading" };
  if (viewModel.status?.failedReads) return { label: "Needs attention", tone: "warning" };
  if (status === "partial") return { label: "Needs attention", tone: "warning" };
  if (status === "ready") return { label: "Ready", tone: "ready" };
  return { label: "Not loaded", tone: "idle" };
}

function appendStatusBadge(parent, badge) {
  const element = appendText(parent, "span", badge.label, `cs-admin-dev__status-badge cs-admin-dev__status-badge--${badge.tone}`);
  element.setAttribute("aria-label", `Module state: ${badge.label}`);
  return element;
}

function appendInfoHint(parent, label, helpText) {
  const hint = document.createElement("button");
  hint.type = "button";
  hint.className = "cs-admin-dev__info-hint";
  hint.textContent = "i";
  hint.title = helpText;
  hint.setAttribute("aria-label", label);
  parent.appendChild(hint);
  return hint;
}

function syncAttemptStarted(syncWorkflow = {}) {
  return Boolean(
    syncWorkflow.dryRun?.running
    || syncWorkflow.dryRun?.completed
    || syncWorkflow.dryRun?.errors?.length
    || syncWorkflow.live?.running
    || syncWorkflow.live?.attempted
    || syncWorkflow.live?.errors?.length
  );
}

function lastSyncLabel(syncWorkflow = {}) {
  if (syncWorkflow.live?.status === "complete") return syncWorkflow.live.loadedAt || "not reported";
  return "not yet";
}

function syncResultLabel(syncWorkflow = {}) {
  if (syncWorkflow.live?.running) return "Promoting";
  if (syncWorkflow.dryRun?.running) return "Checking";
  if (syncWorkflow.live?.status === "complete") return "Promoted";
  if (syncWorkflow.live?.attempted && syncWorkflow.live?.status !== "complete") return "Promotion blocked";
  if (syncWorkflow.dryRun?.completed && syncSetupIncomplete(syncWorkflow)) return "Promotion locked";
  if (syncWorkflow.dryRun?.completed) return "Ready to promote";
  return "Not checked";
}

function syncNextStep(syncWorkflow) {
  if (syncWorkflow.dryRun?.running) return "Promotion preview is running.";
  if (syncWorkflow.live?.running) return "Promotion is running.";
  if (syncSetupIncomplete(syncWorkflow)) return "Promotion setup is incomplete. Configure the materialised source, archive folder, and promotion gates, then preview again.";
  if (syncWorkflow.live?.attempted) return "Review the archive and promotion evidence below.";
  if (syncWorkflow.dryRun?.completed) return "Preview complete. Type SYNC and press Promote when ready.";
  return "Press Check promotion readiness. It checks the already-materialised source and writes nothing.";
}

function setupRows(syncWorkflow) {
  const dryRows = syncWorkflow.dryRun?.rows || [];
  return [
    ["Source JSON", fileLabel(rowValue(dryRows, "source path", "not configured"))],
    ["Archive before promotion", fileLabel(rowValue(dryRows, "planned archive path", "not planned/reported"))],
    ["Active-snapshot promotion gate", rowValue(dryRows, "live sync currently allowed", "no")],
    ["Validation", rowValue(dryRows, "validation result", "not run")],
  ];
}

function appendSetupIncomplete(parent, syncWorkflow) {
  if (!syncSetupIncomplete(syncWorkflow)) return;
  const section = document.createElement("section");
  section.className = "cs-admin-dev__notice cs-admin-dev__notice--warning cs-admin-dev__setup-card";
  appendText(section, "h3", "Promotion setup incomplete");
  appendText(section, "p", "This is a backend setup issue, not an operator action. The runtime needs a materialised source JSON file, an archive folder, and active-snapshot promotion gates enabled before promotion can run.");
  appendDefinitionList(section, setupRows(syncWorkflow), "cs-admin-dev__meta cs-admin-dev__meta--operator");
  const body = appendDisclosure(section, "Setup details", "Technical blockers reported by the runtime.", "cs-admin-dev__diagnostics cs-admin-dev__setup-details", "");
  appendPillList(body, setupBlockers(syncWorkflow));
  parent.appendChild(section);
}

function appendHeader(parent, viewModel) {
  const header = document.createElement("section");
  header.className = "cs-admin-dev__header cs-admin-dev__operator-header";

  const titleRow = document.createElement("div");
  titleRow.className = "cs-admin-dev__title-row";
  const copy = document.createElement("div");
  appendText(copy, "p", "Admin / Dev", "cs-shell__eyebrow");
  const headingRow = document.createElement("div");
  headingRow.className = "cs-admin-dev__heading-row";
  appendText(headingRow, "h2", "Authority/reference data");
  appendInfoHint(headingRow, "About authority/reference data", "Refresh the materialised source as a dry-run-only foundation check, then use the separate promotion workflow to promote the already-materialised source to the active snapshot when server gates allow it.");
  copy.appendChild(headingRow);
  titleRow.appendChild(copy);
  appendStatusBadge(titleRow, statusLabel(viewModel));
  header.appendChild(titleRow);

  appendDefinitionList(header, [
    ["Last checked", viewModel.status.loadedAt],
    ["Last active-snapshot promotion", lastSyncLabel(viewModel.syncWorkflow)],
  ], "cs-admin-dev__meta cs-admin-dev__meta--operator cs-admin-dev__meta--compact");
  parent.appendChild(header);
}

function appendMaterialiserFoundation(parent, materialiser = {}, actions = {}) {
  const section = document.createElement("section");
  section.className = "cs-admin-dev__card cs-admin-dev__operator-card cs-admin-dev__materialiser-card";

  appendText(section, "p", "Authority Materialiser", "cs-shell__eyebrow");
  appendText(section, "h3", materialiser.title || "Authority Materialiser");
  appendText(section, "p", materialiser.description || "Runtime-native materialiser foundation status.");

  const actionsRow = document.createElement("div");
  actionsRow.className = "cs-admin-dev__operator-actions";
  appendActionButton(actionsRow, materialiser.running ? "Refreshing dry-run…" : (materialiser.buttonLabel || "Refresh materialised source from Google Sheet"), {
    disabled: materialiser.running,
    onClick: actions.onRunMaterialiserDryRun,
    variant: "primary",
  });
  appendActionButton(actionsRow, materialiser.liveRefresh?.label || "Live materialiser refresh", {
    disabled: true,
    onClick: null,
    variant: "secondary",
  });
  appendInfoHint(actionsRow, "About materialiser refresh", materialiser.buttonNote || "Dry-run only. This does not call dryRun=false, write files, or promote the active snapshot.");
  section.appendChild(actionsRow);

  appendDefinitionList(section, materialiser.statusRows || [], "cs-admin-dev__meta cs-admin-dev__meta--operator");

  const refreshPanel = document.createElement("section");
  refreshPanel.className = "cs-admin-dev__sync-result";
  appendText(refreshPanel, "h4", "Refresh materialised source from Google Sheet");
  appendText(refreshPanel, "p", materialiser.buttonNote || "Dry-run only in this slice — no active snapshot promotion and no file write.");
  appendDefinitionList(refreshPanel, materialiser.refreshRows || [], "cs-admin-dev__meta cs-admin-dev__meta--operator");
  appendErrors(refreshPanel, "Materialiser refresh error", materialiser.errors || []);
  section.appendChild(refreshPanel);

  const blockers = actionableItems(materialiser.blockers || []);
  if (blockers.length) {
    const blockerPanel = document.createElement("section");
    blockerPanel.className = "cs-admin-dev__notice cs-admin-dev__notice--warning";
    appendText(blockerPanel, "h4", "Materialiser blockers");
    appendPillList(blockerPanel, blockers);
    section.appendChild(blockerPanel);
  }

  const reminder = document.createElement("section");
  reminder.className = "cs-admin-dev__notice";
  appendText(reminder, "h4", "Separate promotion action");
  appendText(reminder, "p", materialiser.promoteReminder || "Promote materialised source to active snapshot remains separate.");
  if (materialiser.liveRefresh?.note) appendText(reminder, "p", materialiser.liveRefresh.note);
  section.appendChild(reminder);

  parent.appendChild(section);
}

function appendOperatorSync(parent, syncWorkflow, actions = {}) {
  const section = document.createElement("section");
  section.className = "cs-admin-dev__card cs-admin-dev__operator-card cs-admin-dev__sync-card";

  const dryRows = syncWorkflow.dryRun.rows || [];
  const liveRows = syncWorkflow.live.rows || [];
  const canRunSync = syncCanRun(syncWorkflow);
  const hasAttempt = syncAttemptStarted(syncWorkflow);
  const sourceLabel = fileLabel(rowValue(dryRows, "source path", "not checked"));
  const validationLabel = rowValue(dryRows, "validation result", "not checked");
  const syncStatus = syncResultLabel(syncWorkflow);

  const actionsRow = document.createElement("div");
  actionsRow.className = "cs-admin-dev__operator-actions cs-admin-dev__operator-actions--single";
  const promotionLabel = syncWorkflow.live.running
    ? "Promoting…"
    : syncWorkflow.dryRun.running
      ? "Checking promotion…"
      : canRunSync
        ? "Promote materialised source to active snapshot"
        : "Check active snapshot promotion readiness";
  appendActionButton(actionsRow, promotionLabel, {
    disabled: syncWorkflow.dryRun.running || syncWorkflow.live.running,
    onClick: canRunSync
      ? () => {
          actions.onConfirmationInput?.(syncWorkflow.live.requiredConfirmation || "SYNC");
          actions.onRunLiveSync?.();
        }
      : actions.onRunDryRunSync,
    variant: "primary",
  });
  appendInfoHint(actionsRow, "About active snapshot promotion", "This uses the existing authority/reference sync path to promote the already-materialised source to the active snapshot. It does not pull directly from Google.");
  section.appendChild(actionsRow);

  appendDefinitionList(section, [
    ["Source", sourceLabel],
    ["Status", syncStatus],
    ["Last check", syncWorkflow.dryRun.loadedAt || "not yet"],
  ], "cs-admin-dev__meta cs-admin-dev__meta--operator cs-admin-dev__meta--compact");

  if (hasAttempt) {
    const result = document.createElement("section");
    result.className = syncSetupIncomplete(syncWorkflow)
      ? "cs-admin-dev__sync-result cs-admin-dev__sync-result--locked"
      : "cs-admin-dev__sync-result";
    appendText(result, "h3", syncSetupIncomplete(syncWorkflow) ? "Checked — materialised source is ready" : syncStatus);
    appendText(result, "p", syncSetupIncomplete(syncWorkflow)
      ? "The materialised source passed validation. Active-snapshot promotion is still waiting on the runtime write gate."
      : "Promotion result reported by the runtime.");
    appendDefinitionList(result, syncSetupIncomplete(syncWorkflow) ? [
      ["Source", sourceLabel],
      ["Validation", validationLabel],
      ["Active snapshot promotion", "waiting for runtime gate"],
      ["Checked", syncWorkflow.dryRun.loadedAt || "not reported"],
    ] : [
      ["Source", sourceLabel],
      ["Validation", validationLabel],
      ["Archive before sync", fileLabel(rowValue(liveRows, "archive path", rowValue(dryRows, "planned archive path", "not created")))],
      ["Snapshot", fileLabel(rowValue(liveRows, "target snapshot path", rowValue(dryRows, "target snapshot path", "not updated")))],
      ["Completed", syncWorkflow.live.loadedAt || syncWorkflow.dryRun.loadedAt || "not reported"],
    ], "cs-admin-dev__meta cs-admin-dev__meta--operator");

    const blockers = setupBlockers(syncWorkflow);
    if (blockers.length) {
      const body = appendDisclosure(result, "Details", "Technical sync blockers reported by the runtime.", "cs-admin-dev__diagnostics cs-admin-dev__setup-details", "");
      appendPillList(body, blockers);
    }

    appendErrors(result, "Check error", syncWorkflow.dryRun.errors);
    appendErrors(result, "Sync error", syncWorkflow.live.errors);
    section.appendChild(result);
  }

  parent.appendChild(section);
}

function appendSyncEvidence(parent, syncWorkflow) {
  const dryRows = syncWorkflow.dryRun.rows || [];
  const liveRows = syncWorkflow.live.rows || [];
  const postRows = syncWorkflow.postSyncProof?.rows || [];
  const status = rowValue(liveRows, "sync result status", syncWorkflow.live.status || "not run");
  const completed = status === "live-write-completed";
  const archivePlanned = rowValue(liveRows, "planned archive path", rowValue(dryRows, "planned archive path", "shown after preview"));
  const archivePath = rowValue(liveRows, "archive path", "shown after sync");
  const syncedPath = rowValue(liveRows, "target snapshot path", rowValue(dryRows, "target snapshot path", "shown after preview"));
  const modified = rowValue(liveRows, "snapshot modified time", rowValue(postRows, "snapshot modified time", "shown after sync"));
  const refreshed = rowValue(liveRows, "loaded/refreshed timestamp", rowValue(postRows, "loaded/refreshed timestamp", "shown after sync"));

  const section = document.createElement("section");
  section.className = "cs-admin-dev__card cs-admin-dev__evidence-card";
  appendText(section, "h3", "Sync evidence");
  appendText(section, "p", completed ? "The runtime reports that live sync completed." : "No live sync has completed yet. Evidence will update after setup is ready and Sync now succeeds.");
  appendDefinitionList(section, [
    ["Preview completed", syncWorkflow.dryRun.completed ? syncWorkflow.dryRun.loadedAt : "not yet"],
    ["Live sync result", completed ? "Completed" : status],
    ["Archive before sync", completed ? fileLabel(archivePath || archivePlanned) : "not created"],
    ["Synced snapshot", completed ? fileLabel(syncedPath) : "not updated"],
    ["Snapshot modified", completed ? modified : "not updated"],
    ["Status refreshed", refreshed],
  ], "cs-admin-dev__meta cs-admin-dev__meta--operator");
  parent.appendChild(section);
}

function appendArchiveList(parent, archiveInspection, actions = {}) {
  const panel = document.createElement("section");
  panel.className = "cs-admin-dev__sync-panel";
  appendText(panel, "h4", "Archive list");
  appendText(panel, "p", "Use this only when you need to compare or preview a restore.");
  appendDefinitionList(panel, pickRows(archiveInspection.list.rows, ["status", "archive count", "reason"]), "cs-admin-dev__meta cs-admin-dev__meta--user");

  const archives = archiveInspection.list.archives || [];
  if (!archives.length) {
    appendText(panel, "p", "No archives are available yet.", "cs-admin-dev__empty");
    parent.appendChild(panel);
    return;
  }

  const list = document.createElement("ul");
  list.className = "cs-admin-dev__endpoint-list cs-admin-dev__archive-list";
  for (const archive of archives) {
    const item = document.createElement("li");
    appendText(item, "strong", archive.name);
    appendText(item, "span", `${archive.size} · modified ${archive.modifiedAt}`);
    const actionsRow = document.createElement("div");
    actionsRow.className = "cs-admin-dev__actions";
    appendActionButton(actionsRow, archiveInspection.diff.running && archiveInspection.diff.selectedArchiveName === archive.name ? "Comparing…" : "Compare", {
      disabled: archiveInspection.diff.running,
      onClick: () => actions.onRunArchiveDiff?.(archive.name),
      variant: "secondary",
    });
    appendActionButton(actionsRow, archiveInspection.restore?.preview?.running && archiveInspection.restore?.preview?.selectedArchiveName === archive.name ? "Previewing…" : "Preview restore", {
      disabled: archiveInspection.restore?.preview?.running || archiveInspection.restore?.live?.running,
      onClick: () => actions.onRunRestorePreview?.(archive.name),
      variant: "secondary",
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
      appendActionButton(actionsRow, "Review fields", {
        disabled: false,
        onClick: () => actions.onRunArchiveDiffDetail?.({ archiveName, section, inspectKey: entry.inspectKey }),
        variant: "secondary",
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
  appendText(panel, "h4", "Compare result");
  appendText(panel, "p", "Summary only. Field detail is loaded only when requested.");
  appendDefinitionList(panel, pickRows(archiveInspection.diff.totalsRows, [
    "selected archive",
    "status",
    "added",
    "removed",
    "changed",
    "loaded at",
  ]), "cs-admin-dev__meta cs-admin-dev__meta--user");
  if (archiveInspection.diff.error) appendErrors(panel, "Compare error", [archiveInspection.diff.error]);

  const archiveName = archiveInspection.diff.selectedArchiveName;
  const sections = archiveInspection.diff.sections || [];
  if (!sections.length) {
    appendText(panel, "p", archiveInspection.diff.status === "complete" ? "No section changes were returned." : "Choose an archive and select Compare.", "cs-admin-dev__empty");
    parent.appendChild(panel);
    return;
  }

  for (const sectionModel of sections) {
    const sectionBlock = document.createElement("section");
    sectionBlock.className = "cs-admin-dev__card cs-admin-dev__nested-card";
    appendText(sectionBlock, "h5", sectionModel.section);
    appendDefinitionList(sectionBlock, filterRows(sectionModel.rows, [
      "section",
      "type",
      "archive rows/keys",
      "current rows/keys",
      "full rows returned",
    ]), "cs-admin-dev__meta cs-admin-dev__meta--user");
    appendDiffKeyEntries(sectionBlock, "Changed", sectionModel.changed, { archiveName, section: sectionModel.section, inspectable: true }, actions);
    appendDiffKeyEntries(sectionBlock, "Added", sectionModel.added, { archiveName, section: sectionModel.section, inspectable: false }, actions);
    appendDiffKeyEntries(sectionBlock, "Removed", sectionModel.removed, { archiveName, section: sectionModel.section, inspectable: false }, actions);
    panel.appendChild(sectionBlock);
  }

  parent.appendChild(panel);
}

function appendFieldLevelDetail(parent, archiveInspection) {
  const panel = document.createElement("section");
  panel.className = "cs-admin-dev__sync-panel";
  appendText(panel, "h4", "Field review");
  appendText(panel, "p", "Only shown after selecting Review fields from a changed item.");
  appendDefinitionList(panel, pickRows(archiveInspection.detail.rows, ["status", "record status", "section", "field count", "loaded at"]), "cs-admin-dev__meta cs-admin-dev__meta--user");
  if (archiveInspection.detail.error) appendErrors(panel, "Field review error", [archiveInspection.detail.error]);
  if (archiveInspection.detail.fieldRows?.length) {
    appendText(panel, "h5", "Changed fields");
    appendDefinitionList(panel, archiveInspection.detail.fieldRows, "cs-admin-dev__meta cs-admin-dev__meta--user");
  } else {
    appendText(panel, "p", archiveInspection.detail.status === "complete" ? "No changed fields returned for this key." : "No field selected.", "cs-admin-dev__empty");
  }
  parent.appendChild(panel);
}

function appendArchiveRestore(parent, archiveInspection, actions = {}) {
  const restore = archiveInspection.restore || {};
  const preview = restore.preview || {};
  const live = restore.live || {};
  const proof = restore.postRestoreProof || {};

  const panel = document.createElement("section");
  panel.className = "cs-admin-dev__sync-panel cs-admin-dev__sync-panel--danger";
  appendText(panel, "h4", "Restore preview / restore");
  appendText(panel, "p", "Rare use only. Restore remains preview-first, typed-confirmation gated, and server-gated.", "cs-admin-dev__danger-copy");

  const previewActions = document.createElement("div");
  previewActions.className = "cs-admin-dev__actions";
  appendActionButton(previewActions, preview.running ? "Running restore preview…" : "Preview restore", {
    disabled: preview.running || live.running || !preview.selectedArchiveName,
    onClick: () => actions.onRunRestorePreview?.(preview.selectedArchiveName),
    variant: "secondary",
  });
  panel.appendChild(previewActions);

  appendDefinitionList(panel, pickRows(preview.rows || [], [
    "selected archive",
    "status",
    "archive modified",
    "current modified",
    "planned pre-restore archive",
    "restore would be allowed",
    "loaded at",
  ]), "cs-admin-dev__meta cs-admin-dev__meta--user");

  const previewBlockers = actionableItems(preview.blockers || []);
  if (previewBlockers.length) {
    appendText(panel, "h5", "Needs attention");
    appendPillList(panel, previewBlockers);
  }
  appendErrors(panel, "Restore preview error", preview.errors || []);

  const confirmField = document.createElement("label");
  confirmField.className = "cs-admin-dev__confirm";
  appendText(confirmField, "span", "Type RESTORE to enable confirmed restore");
  const confirmInput = document.createElement("input");
  confirmInput.type = "text";
  confirmInput.autocomplete = "off";
  confirmInput.spellcheck = false;
  confirmInput.placeholder = live.requiredConfirmation || "RESTORE";
  confirmInput.value = live.confirmationValue || "";
  confirmField.appendChild(confirmInput);
  panel.appendChild(confirmField);

  const liveActions = document.createElement("div");
  liveActions.className = "cs-admin-dev__actions";
  const liveButton = appendActionButton(liveActions, live.running ? "Running restore…" : "Run restore", {
    disabled: live.disabled,
    onClick: actions.onRunConfirmedRestore,
    variant: "danger",
  });
  confirmInput.addEventListener("input", () => {
    actions.onRestoreConfirmationInput?.(confirmInput.value);
    liveButton.disabled = !(live.previewCompleted && live.archiveSelected && live.serverRestoreAllowed && confirmInput.value === live.requiredConfirmation) || live.running;
  });
  panel.appendChild(liveActions);

  appendDefinitionList(panel, pickRows(live.rows || [], [
    "restore result status",
    "restored archive",
    "target modified",
    "pre-restore archive",
    "status refreshed",
    "loaded at",
  ]), "cs-admin-dev__meta cs-admin-dev__meta--user");

  const restoreIssues = actionableItems([...(live.blockers || []), ...(live.failures || [])]);
  if (restoreIssues.length) {
    appendText(panel, "h5", "Restore blockers / failures");
    appendPillList(panel, restoreIssues);
  }
  appendErrors(panel, "Restore error", live.errors || []);

  if (proof.visible) {
    const proofPanel = document.createElement("section");
    proofPanel.className = "cs-admin-dev__notice";
    appendText(proofPanel, "h4", "Restore result");
    appendDefinitionList(proofPanel, filterRows(proof.rows || [], ["blockers/failures"]), "cs-admin-dev__meta cs-admin-dev__meta--user");
    panel.appendChild(proofPanel);
  }

  parent.appendChild(panel);
}

function appendArchiveTools(parent, archiveInspection, actions = {}) {
  const body = appendDisclosure(parent, "Archive tools", "Compare and restore are rare operations. They stay collapsed unless needed.", "cs-admin-dev__diagnostics cs-admin-dev__archive-tools", "");
  const grid = document.createElement("div");
  grid.className = "cs-admin-dev__sync-grid";
  appendArchiveList(grid, archiveInspection, actions);
  appendDiffSummary(grid, archiveInspection, actions);
  appendFieldLevelDetail(grid, archiveInspection);
  appendArchiveRestore(grid, archiveInspection, actions);
  body.appendChild(grid);
}

function isOperatorNoiseItem(item) {
  const text = String(item || "").toLowerCase();
  return isSetupItem(item)
    || text.includes("legacy transitional novondb path")
    || text.includes("read endpoint")
    || text.includes("module remained isolated")
    || text.includes("write-policy-disabled");
}

function appendAttention(parent, viewModel) {
  const items = actionableItems([...(viewModel.warnings || []), ...(viewModel.blockers || [])]).filter((item) => !isOperatorNoiseItem(item));
  if (!items.length) return;
  const section = document.createElement("section");
  section.className = "cs-admin-dev__card cs-admin-dev__attention-card";
  appendText(section, "h3", "Needs attention");
  appendPillList(section, items);
  parent.appendChild(section);
}

function appendDiagnosticsContent(parent, viewModel) {
  const identity = document.createElement("section");
  identity.className = "cs-admin-dev__card";
  appendText(identity, "h3", "Module and access");
  appendDefinitionList(identity, viewModel.headerRows);
  appendDefinitionList(identity, [
    ["loaded at", viewModel.status.loadedAt],
    ["approved endpoints", viewModel.status.endpointCount],
    ["failed reads", viewModel.status.failedReads],
  ]);
  parent.appendChild(identity);

  const grid = document.createElement("div");
  grid.className = "cs-admin-dev__grid";
  for (const card of viewModel.cards || []) appendCard(grid, card);
  parent.appendChild(grid);

  const endpoints = document.createElement("section");
  endpoints.className = "cs-admin-dev__card";
  appendText(endpoints, "h3", "Approved endpoints");
  appendEndpointList(endpoints, viewModel.endpoints);
  parent.appendChild(endpoints);

  const safety = document.createElement("section");
  safety.className = "cs-admin-dev__notice";
  appendText(safety, "h3", "Safety contract");
  appendPillList(safety, viewModel.safety);
  parent.appendChild(safety);
}

function appendMoreTools(parent, viewModel, actions = {}) {
  const body = appendDisclosure(parent, "More tools", "Archive comparison and restore preview are available here when needed.", "cs-admin-dev__diagnostics cs-admin-dev__more-tools", "");

  appendText(body, "h3", "Archive tools");
  const archiveGrid = document.createElement("div");
  archiveGrid.className = "cs-admin-dev__sync-grid";
  appendArchiveList(archiveGrid, viewModel.archiveInspection, actions);
  appendDiffSummary(archiveGrid, viewModel.archiveInspection, actions);
  appendFieldLevelDetail(archiveGrid, viewModel.archiveInspection);
  appendArchiveRestore(archiveGrid, viewModel.archiveInspection, actions);
  body.appendChild(archiveGrid);
}

function appendDiagnostics(parent, viewModel) {
  const body = appendDisclosure(parent, "Diagnostics", "Developer diagnostics, endpoints, policies, and safety proof.", "cs-admin-dev__diagnostics cs-admin-dev__developer-diagnostics", "");
  appendDiagnosticsContent(body, viewModel);
}

function renderProtectedFallback(container, viewModel) {
  const article = document.createElement("article");
  article.className = "cs-admin-dev";

  const header = document.createElement("section");
  header.className = "cs-admin-dev__header";
  appendText(header, "p", viewModel.label, "cs-shell__eyebrow");
  appendText(header, "h2", "Sync reference data");
  appendText(header, "p", "This module is available only to developer/admin users.");
  article.appendChild(header);

  const notice = document.createElement("section");
  notice.className = "cs-admin-dev__notice cs-admin-dev__notice--warning";
  appendText(notice, "h3", "Requires approval");
  appendText(notice, "p", "Ask a developer/admin to run sync previews, confirmed sync, archive comparison, or restore inspection.");
  article.appendChild(notice);

  const body = appendDisclosure(article, "Access diagnostics", "Authority and visibility details for this protected module.");
  const diagnosticBody = document.createElement("section");
  diagnosticBody.className = "cs-admin-dev__card";
  appendDefinitionList(diagnosticBody, [
    ["module id", viewModel.moduleId],
    ["route", "/workspace?module=admin_dev"],
    ["authority role", viewModel.access.role],
    ["display role", viewModel.access.displayRole],
    ["visibility reason", viewModel.access.reason],
    ["write policy", "not available"],
  ]);
  body.appendChild(diagnosticBody);

  container.appendChild(article);
}

export function renderAdminDevView(container, viewModel, actions = {}) {
  clearElement(container);

  if (!viewModel.access.allowed) {
    renderProtectedFallback(container, viewModel);
    return;
  }

  const article = document.createElement("article");
  article.className = "cs-admin-dev cs-admin-dev--operator";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "false";

  appendHeader(article, viewModel);
  appendMaterialiserFoundation(article, viewModel.materialiser, actions);
  appendOperatorSync(article, viewModel.syncWorkflow, actions);
  appendAttention(article, viewModel);
  appendMoreTools(article, viewModel, actions);
  appendDiagnostics(article, viewModel);

  container.appendChild(article);
}
