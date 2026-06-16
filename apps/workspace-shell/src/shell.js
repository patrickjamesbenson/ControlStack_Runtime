import { createModuleRegistry } from "/packages/workspace-kernel/moduleRegistry.js";
import { resolveWorkspaceRoute } from "/packages/workspace-kernel/route.js";
import { createShellContext, createShellServices } from "/packages/workspace-kernel/services.js";
import { csSelectorModule } from "/packages/modules/cs-selector/index.js";

const statusEl = document.getElementById("cs-shell-status");
const moduleHost = document.getElementById("cs-shell-module-host");
const homePanel = document.getElementById("cs-workspace-home");
const contextSummary = document.getElementById("cs-shell-context-summary");

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function appendDefinitionListRows(list, rows) {
  clearElement(list);
  for (const [label, value] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = String(value);
    list.append(dt, dd);
  }
}

function renderContextSummary(context) {
  if (!contextSummary) return;
  appendDefinitionListRows(contextSummary, [
    ["phase", context.phase],
    ["contract", context.contractVersion || "not-declared"],
    ["module", context.route.moduleId],
    ["project", `${context.project.owner}:${context.project.status}`],
    ["save", `${context.project.save.owner}:${context.project.save.available ? "available" : "deferred"}`],
    ["restore", `${context.project.restore.owner}:${context.project.restore.available ? "available" : "deferred"}`],
    ["handoff", `${context.handoff.owner}:${context.handoff.status}`],
    ["visibility", `${context.visibility.owner}:${context.visibility.status}`],
    ["flags", `${context.flags.owner}:${context.flags.status}`],
  ]);
}

function markActiveLink(moduleId) {
  for (const link of document.querySelectorAll("[data-module-link]")) {
    const active = link.getAttribute("data-module-link") === moduleId;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

function renderUnknownModuleFallback({ route, registry }) {
  if (!moduleHost) return;
  clearElement(moduleHost);

  const article = document.createElement("article");
  article.className = "cs-shell__fallback";

  const eyebrow = document.createElement("p");
  eyebrow.className = "cs-shell__eyebrow";
  eyebrow.textContent = "Safe fallback";

  const heading = document.createElement("h2");
  heading.textContent = "Unknown module";

  const body = document.createElement("p");
  body.textContent = `The shell could not find a registered module named ${route.moduleId}. The workspace remains responsive.`;

  const diagnostics = document.createElement("dl");
  diagnostics.className = "cs-shell__diagnostic-list";
  appendDefinitionListRows(diagnostics, [
    ["Requested module", route.moduleId],
    ["Known modules", registry.list().join(", ") || "none"],
  ]);

  article.append(eyebrow, heading, body, diagnostics);
  moduleHost.append(article);
}

function showHomeIfRequested(moduleId) {
  if (!homePanel) return false;
  const shouldShowHome = moduleId === "workspace_home";
  homePanel.hidden = !shouldShowHome;
  if (shouldShowHome && moduleHost) clearElement(moduleHost);
  return shouldShowHome;
}

function renderMountFailure(route) {
  if (!moduleHost) return;
  clearElement(moduleHost);

  const article = document.createElement("article");
  article.className = "cs-shell__fallback";

  const eyebrow = document.createElement("p");
  eyebrow.className = "cs-shell__eyebrow";
  eyebrow.textContent = "Error isolation";

  const heading = document.createElement("h2");
  heading.textContent = "Module mount failed";

  const body = document.createElement("p");
  body.textContent = `The shell caught an error while mounting ${route.moduleId} and stayed responsive.`;

  article.append(eyebrow, heading, body);
  moduleHost.append(article);
}

function bootWorkspaceShell() {
  if (!moduleHost) {
    setStatus("Shell boot failed: missing module host.");
    return;
  }

  const route = resolveWorkspaceRoute(window.location);
  const services = createShellServices();
  const context = createShellContext({ route, services });
  const registry = createModuleRegistry();

  registry.register("cs_selector", csSelectorModule);

  renderContextSummary(context);
  markActiveLink(route.moduleId);

  if (showHomeIfRequested(route.moduleId)) {
    setStatus("Workspace home mounted. Phase 1B shell is responsive.");
    return;
  }

  const moduleApi = registry.get(route.moduleId);
  if (!moduleApi) {
    renderUnknownModuleFallback({ route, registry });
    setStatus(`Unknown module fallback rendered for ${route.moduleId}.`);
    return;
  }

  try {
    moduleApi.mount({ container: moduleHost, services, context });
    setStatus(`Mounted ${route.moduleId}. Phase 1B shell baseline is running.`);
    services.eventBus.emit("module:mounted", { moduleId: route.moduleId, route });
  } catch (error) {
    console.error("[workspace-shell] module mount failed", error);
    renderMountFailure(route);
    setStatus(`Module mount failed for ${route.moduleId}; shell stayed responsive.`);
  }
}

bootWorkspaceShell();
