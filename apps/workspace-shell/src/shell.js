import { createModuleRegistry } from "/packages/workspace-kernel/moduleRegistry.js";
import { createPluginRegistry } from "/packages/workspace-kernel/pluginRegistry.js";
import { resolveWorkspaceRoute } from "/packages/workspace-kernel/route.js";
import { createShellContext, createShellServices } from "/packages/workspace-kernel/services.js";
import { csSelectorModule } from "/packages/modules/cs-selector/index.js";
import { emergenceModule } from "/packages/modules/emergence/index.js";

const statusEl = document.getElementById("cs-shell-status");
const moduleHost = document.getElementById("cs-shell-module-host");
const pluginHost = document.getElementById("cs-shell-plugin-host");
const homePanel = document.getElementById("cs-workspace-home");
const contextSummary = document.getElementById("cs-shell-context-summary");
const projectSelect = document.getElementById("cs-shell-project-select");
const projectSummary = document.getElementById("cs-shell-project-summary");

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function clearElement(element) {
  while (element?.firstChild) element.removeChild(element.firstChild);
}

function appendDefinitionListRows(list, rows) {
  if (!list) return;
  clearElement(list);
  for (const [label, value] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = String(value);
    list.append(dt, dd);
  }
}

function readProjectTitle(project) {
  return project?.metadata?.title || project?.currentProject?.title || "No project loaded";
}

function renderContextSummary(context) {
  appendDefinitionListRows(contextSummary, [
    ["phase", context.phase],
    ["contract", context.contractVersion || "not-declared"],
    ["module", context.route.moduleId],
    ["project", `${context.project.owner}:${context.project.status}`],
    ["current", readProjectTitle(context.project)],
    ["save", `${context.project.save.owner}:${context.project.save.available ? "available" : "deferred"}`],
    ["restore", `${context.project.restore.owner}:${context.project.restore.available ? "available" : "deferred"}`],
    ["handoff", `${context.handoff.owner}:${context.handoff.status}`],
    ["visibility", `${context.visibility.owner}:${context.visibility.status}`],
    ["flags", `${context.flags.owner}:${context.flags.status}`],
  ]);
}

function renderProjectSelection({ services, context }) {
  if (!projectSelect || !projectSummary) return;
  const projects = services.project.getAvailableProjects?.() || [];
  const selectedProjectId = context.project.selection?.selectedProjectId || context.project.currentProject?.projectId || "";
  clearElement(projectSelect);
  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.projectId;
    option.textContent = project.title;
    projectSelect.appendChild(option);
  }
  projectSelect.value = selectedProjectId;
  appendDefinitionListRows(projectSummary, [
    ["owner", context.project.owner],
    ["status", context.project.status],
    ["project", readProjectTitle(context.project)],
    ["id", selectedProjectId || "none"],
    ["readiness", context.project.metadata?.readiness || "not-ready"],
    ["source", context.project.selection?.source || context.project.metadata?.source || "unknown"],
    ["save", context.project.save?.status || "deferred"],
    ["restore", context.project.restore?.status || "deferred"],
    ["handoff", context.handoff?.status || "deferred"],
  ]);
}

function markActiveLink(moduleId) {
  for (const link of document.querySelectorAll("[data-module-link]")) {
    if (link.getAttribute("data-module-link") === moduleId) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

function renderUnknownModuleFallback({ route, registry }) {
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
  const shouldShowHome = moduleId === "workspace_home";
  if (homePanel) homePanel.hidden = !shouldShowHome;
  if (shouldShowHome) clearElement(moduleHost);
  return shouldShowHome;
}

function renderMountFailure(route) {
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

function renderPluginFailure({ pluginId, error }) {
  if (!pluginHost) return;
  pluginHost.hidden = false;
  clearElement(pluginHost);
  const article = document.createElement("article");
  article.className = "cs-shell__plugin-fallback";
  const eyebrow = document.createElement("p");
  eyebrow.className = "cs-shell__eyebrow";
  eyebrow.textContent = "Optional plugin isolated";
  const heading = document.createElement("h2");
  heading.textContent = "Diagnostics unavailable";
  const body = document.createElement("p");
  body.textContent = `${pluginId} failed to load, but the shell and route module stayed responsive.`;
  const detail = document.createElement("p");
  detail.textContent = error?.message || String(error || "Unknown plugin failure");
  article.append(eyebrow, heading, body, detail);
  pluginHost.append(article);
}

function buildPluginContext({ pluginRegistry, registry, route }) {
  return {
    owner: "shell",
    optional: true,
    postRender: true,
    routeModuleId: route.moduleId,
    registeredModules: registry.list(),
    pluginStatus: pluginRegistry.getStatusSnapshot(),
  };
}

function scheduleOptionalDiagnosticsPlugin({ services, getContext, registry, onPluginReady }) {
  if (!pluginHost) return;
  const pluginRegistry = createPluginRegistry();
  const pluginId = "diagnostics";
  setTimeout(async () => {
    try {
      pluginHost.hidden = false;
      pluginRegistry.markLoading(pluginId);
      const { diagnosticsPlugin } = await import("/packages/plugins/diagnostics/index.js");
      pluginRegistry.register(pluginId, diagnosticsPlugin);
      const context = getContext();
      diagnosticsPlugin.mount({
        container: pluginHost,
        services,
        context,
        pluginContext: buildPluginContext({ pluginRegistry, registry, route: context.route }),
      });
      pluginRegistry.markMounted(pluginId);
      diagnosticsPlugin.update?.({
        context: getContext(),
        pluginContext: buildPluginContext({ pluginRegistry, registry, route: getContext().route }),
      });
      onPluginReady?.({ diagnosticsPlugin, pluginRegistry });
      services.eventBus.emit("plugin:mounted", { pluginId, optional: true, postRender: true });
    } catch (error) {
      console.warn("[workspace-shell] optional diagnostics plugin failed", error);
      pluginRegistry.markFailed(pluginId, error);
      renderPluginFailure({ pluginId, error });
      services.eventBus.emit("plugin:failed", { pluginId, optional: true, postRender: true, error });
    }
  }, 0);
}

function bootWorkspaceShell() {
  if (!moduleHost) {
    setStatus("Shell boot failed: missing module host.");
    return;
  }

  const route = resolveWorkspaceRoute(window.location);
  const services = createShellServices();
  const registry = createModuleRegistry();
  let context = createShellContext({ route, services });
  let mountedModuleApi = null;
  let diagnosticsPluginApi = null;
  let diagnosticsPluginRegistry = null;

  function refreshContext(reason = "context-refresh") {
    context = createShellContext({ route, services, mountedModuleId: route.moduleId });
    renderContextSummary(context);
    renderProjectSelection({ services, context });
    mountedModuleApi?.update?.(context);
    if (diagnosticsPluginApi && diagnosticsPluginRegistry) {
      diagnosticsPluginApi.update?.({
        context,
        pluginContext: buildPluginContext({ pluginRegistry: diagnosticsPluginRegistry, registry, route }),
      });
    }
    services.eventBus.emit("shell:context-updated", { reason, context });
    return context;
  }

  function rememberDiagnosticsPlugin({ diagnosticsPlugin, pluginRegistry }) {
    diagnosticsPluginApi = diagnosticsPlugin;
    diagnosticsPluginRegistry = pluginRegistry;
  }

  function handleProjectSelectionChange(event) {
    const result = services.project.selectProject(event.target.value, "shell-project-selector-change");
    if (!result.accepted) {
      setStatus(`Project switch failed: ${result.reason}`);
      return;
    }
    const nextContext = refreshContext("project-switch");
    setStatus(`Selected ${readProjectTitle(nextContext.project)}. Project context updated.`);
  }

  registry.register("cs_selector", csSelectorModule);
  registry.register("emergence", emergenceModule);

  renderContextSummary(context);
  renderProjectSelection({ services, context });
  projectSelect?.addEventListener("change", handleProjectSelectionChange);
  markActiveLink(route.moduleId);

  if (showHomeIfRequested(route.moduleId)) {
    setStatus("Workspace home mounted. Shell project selection is ready.");
    scheduleOptionalDiagnosticsPlugin({ services, getContext: () => context, registry, onPluginReady: rememberDiagnosticsPlugin });
    return;
  }

  const moduleApi = registry.get(route.moduleId);
  if (!moduleApi) {
    renderUnknownModuleFallback({ route, registry });
    setStatus(`Unknown module fallback rendered for ${route.moduleId}.`);
    scheduleOptionalDiagnosticsPlugin({ services, getContext: () => context, registry, onPluginReady: rememberDiagnosticsPlugin });
    return;
  }

  try {
    mountedModuleApi = moduleApi;
    moduleApi.mount({ container: moduleHost, services, context });
    setStatus(`Mounted ${route.moduleId}. Shell project selection is ready.`);
    services.eventBus.emit("module:mounted", { moduleId: route.moduleId, route });
    scheduleOptionalDiagnosticsPlugin({ services, getContext: () => context, registry, onPluginReady: rememberDiagnosticsPlugin });
  } catch (error) {
    console.error("[workspace-shell] module mount failed", error);
    renderMountFailure(route);
    setStatus(`Module mount failed for ${route.moduleId}; shell stayed responsive.`);
    scheduleOptionalDiagnosticsPlugin({ services, getContext: () => context, registry, onPluginReady: rememberDiagnosticsPlugin });
  }
}

bootWorkspaceShell();
