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

function renderProtectedFallback(container, viewModel) {
  const article = document.createElement("article");
  article.className = "cs-admin-dev";

  const header = document.createElement("section");
  header.className = "cs-admin-dev__header";
  appendText(header, "p", viewModel.label, "cs-shell__eyebrow");
  appendText(header, "h2", viewModel.title);
  appendText(header, "p", "This protected shell module requires developer/admin authority. No runtime status endpoints were read for the current user.");
  appendDefinitionList(header, [
    ["module id", viewModel.moduleId],
    ["route", "/workspace?module=admin_dev"],
    ["authority role", viewModel.access.role],
    ["display role", viewModel.access.displayRole],
    ["visibility reason", viewModel.access.reason],
    ["write policy", "disabled"],
  ]);
  article.appendChild(header);

  const notice = document.createElement("section");
  notice.className = "cs-admin-dev__notice cs-admin-dev__notice--warning";
  appendText(notice, "h3", "Protected module");
  appendText(notice, "p", "Admin / Dev is intentionally hidden from normal users and normal workflow use. Ask a developer/admin to use this route for read-only status inspection.");
  article.appendChild(notice);

  container.appendChild(article);
}

export function renderAdminDevView(container, viewModel) {
  clearElement(container);

  if (!viewModel.access.allowed) {
    renderProtectedFallback(container, viewModel);
    return;
  }

  const article = document.createElement("article");
  article.className = "cs-admin-dev";
  article.dataset.module = viewModel.moduleId;
  article.dataset.readOnly = "true";

  const header = document.createElement("section");
  header.className = "cs-admin-dev__header";
  appendText(header, "p", viewModel.label, "cs-shell__eyebrow");
  appendText(header, "h2", viewModel.title);
  appendText(header, "p", "Read-only authority/reference status for developer/admin inspection. AD-1 exposes no sync, restore, edit, HubSpot write, project write, full DB, or full USERS controls.");
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

  const grid = document.createElement("div");
  grid.className = "cs-admin-dev__grid";
  for (const card of viewModel.cards) appendCard(grid, card);
  article.appendChild(grid);

  const endpoints = document.createElement("section");
  endpoints.className = "cs-admin-dev__card";
  appendText(endpoints, "h3", "Approved read endpoints");
  appendText(endpoints, "p", "Every request made by this module is a same-origin GET request. No POST path is called in AD-1.");
  appendEndpointList(endpoints, viewModel.endpoints);
  article.appendChild(endpoints);

  const blockers = document.createElement("section");
  blockers.className = "cs-admin-dev__card";
  appendText(blockers, "h3", "Blockers and guardrails");
  appendText(blockers, "p", "Runtime-reported blockers are shown as status only. The module does not provide actions to clear, edit, sync, or restore anything.");
  appendPillList(blockers, viewModel.blockers);
  article.appendChild(blockers);

  const safety = document.createElement("section");
  safety.className = "cs-admin-dev__notice";
  appendText(safety, "h3", "AD-1 safety contract");
  appendPillList(safety, viewModel.safety);
  article.appendChild(safety);

  container.appendChild(article);
}
