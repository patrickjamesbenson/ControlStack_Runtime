import { createModuleRegistry } from "/packages/workspace-kernel/moduleRegistry.js";
import { createPluginRegistry } from "/packages/workspace-kernel/pluginRegistry.js";
import { resolveWorkspaceRoute } from "/packages/workspace-kernel/route.js";
import { createShellContext, createShellServices } from "/packages/workspace-kernel/services.js";
import { csSelectorModule } from "/packages/modules/cs-selector/index.js";
import { emergenceModule } from "/packages/modules/emergence/index.js";
import { sceneBuilderModule } from "/packages/modules/scene-builder/index.js";

const statusEl = document.getElementById("cs-shell-status");
const moduleHost = document.getElementById("cs-shell-module-host");
const pluginHost = document.getElementById("cs-shell-plugin-host");
const homePanel = document.getElementById("cs-workspace-home");
const contextSummary = document.getElementById("cs-shell-context-summary");
const projectSelect = document.getElementById("cs-shell-project-select");
const projectSummary = document.getElementById("cs-shell-project-summary");
const authUserSelect = document.getElementById("cs-shell-auth-user-select");
const authSummary = document.getElementById("cs-shell-auth-summary");
const signInButton = document.getElementById("cs-shell-sign-in-button");
const signOutButton = document.getElementById("cs-shell-sign-out-button");
const useAuthIdentityButton = document.getElementById("cs-shell-use-auth-identity-button");
const identitySelect = document.getElementById("cs-shell-identity-select");
const resolvedIdentitySummary = document.getElementById("cs-shell-resolved-identity-summary");
const roleOverrideToggle = document.getElementById("cs-shell-role-override-toggle");
const roleOverrideSelect = document.getElementById("cs-shell-role-override-select");
const displayRoleSelect = document.getElementById("cs-shell-display-role-select");
const projectModeSelect = document.getElementById("cs-shell-project-mode-select");
const visibilitySummary = document.getElementById("cs-shell-visibility-summary");

let projectBrowserPanel = null;
let projectBrowserSummary = null;
let projectBrowserList = null;
let projectBrowserSaveButton = null;
let projectBrowserRestoreButton = null;
let projectBrowserHandoffButton = null;

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

function appendProjectBrowserLine(parent, text, tagName = "span") {
  const element = document.createElement(tagName);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function ensureModuleNavLink(moduleId, label) {
  const nav = document.querySelector(".cs-shell__sidebar nav");
  if (!nav || document.querySelector(`[data-module-link="${moduleId}"]`)) return;
  const link = document.createElement("a");
  link.href = `/workspace?module=${moduleId}`;
  link.dataset.moduleLink = moduleId;
  link.textContent = label;
  nav.appendChild(link);
}

function ensureProjectBrowserPanel() {
  if (projectBrowserPanel) return;
  const projectCard = document.querySelector(".cs-shell__project-card");
  if (!projectCard) return;

  projectBrowserPanel = document.createElement("section");
  projectBrowserPanel.className = "cs-shell__project-browser-card";
  projectBrowserPanel.setAttribute("aria-label", "Project Browser handoff share foundation");

  const heading = document.createElement("h3");
  heading.textContent = "Project Browser";
  const note = document.createElement("p");
  note.textContent = "P4 handoff/share: package preparation is shell-owned. External delivery, email, and HubSpot writes are not live.";
  projectBrowserSaveButton = document.createElement("button");
  projectBrowserSaveButton.type = "button";
  projectBrowserSaveButton.className = "cs-shell__project-browser-save";
  projectBrowserSaveButton.textContent = "Save Project";
  projectBrowserRestoreButton = document.createElement("button");
  projectBrowserRestoreButton.type = "button";
  projectBrowserRestoreButton.className = "cs-shell__project-browser-restore";
  projectBrowserRestoreButton.textContent = "Restore / Open Project";
  projectBrowserHandoffButton = document.createElement("button");
  projectBrowserHandoffButton.type = "button";
  projectBrowserHandoffButton.className = "cs-shell__project-browser-handoff";
  projectBrowserHandoffButton.textContent = "Prepare Handoff / Share";
  projectBrowserSummary = document.createElement("dl");
  projectBrowserSummary.id = "cs-shell-project-browser-summary";
  projectBrowserList = document.createElement("ul");
  projectBrowserList.id = "cs-shell-project-browser-list";
  projectBrowserList.className = "cs-shell__project-browser-list";

  projectBrowserPanel.append(heading, note, projectBrowserSaveButton, projectBrowserRestoreButton, projectBrowserHandoffButton, projectBrowserSummary, projectBrowserList);
  projectCard.insertAdjacentElement("afterend", projectBrowserPanel);
}

function readProjectTitle(project) {
  return project?.metadata?.title || project?.currentProject?.title || "No project loaded";
}

function selectedProjectSummary(browser) {
  return (browser.projects || []).find((project) => project.envelopeId === browser.selectedProjectId || project.projectId === browser.selectedProjectId) || null;
}

function renderAuthControls({ services, context }) {
  if (!authUserSelect || !authSummary) return;
  const users = services.auth.getAvailableAuthUsers?.() || [];
  clearElement(authUserSelect);
  for (const user of users) {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.label} · ${user.email}`;
    authUserSelect.appendChild(option);
  }
  if (context.auth.session?.userId) authUserSelect.value = context.auth.session.userId;
  const signedIn = context.auth.session?.authenticated === true;
  appendDefinitionListRows(authSummary, [
    ["auth status", context.auth.status || "signed-out"],
    ["signed in", signedIn ? "yes" : "no"],
    ["user", context.auth.session?.name || context.auth.user?.name || "Anonymous visitor"],
    ["email", context.auth.session?.email || "none"],
    ["provider", context.auth.session?.provider || "none"],
    ["session id", context.auth.session?.sessionId || "none"],
    ["identity source", context.identity.lookup?.identitySource || "unknown"],
    ["developer fixture", context.identity.lookup?.usingDeveloperFixture ? "active" : "off"],
    ["OAuth/provider", "deferred"],
    ["password storage", "excluded"],
    ["MFA", "deferred"],
  ]);
  if (signInButton) signInButton.disabled = false;
  if (signOutButton) signOutButton.disabled = false;
  if (useAuthIdentityButton) useAuthIdentityButton.disabled = !signedIn;
}

function renderContextSummary(context) {
  appendDefinitionListRows(contextSummary, [
    ["phase", context.phase],
    ["contract", context.contractVersion || "not-declared"],
    ["module", context.route.moduleId],
    ["auth", `${context.auth.owner}:${context.auth.status}`],
    ["auth user", context.auth.session?.email || context.auth.user?.name || "anonymous"],
    ["identity", `${context.identity.identityState}:${context.identity.displayRole}`],
    ["identity source", context.identity.lookup?.identitySource || "unknown"],
    ["actual role", context.identity.actualRole],
    ["project", `${context.project.owner}:${context.project.status}`],
    ["current", readProjectTitle(context.project)],
    ["browser", `${context.projectBrowser.owner}:${context.projectBrowser.status}`],
    ["visibility", `${context.visibility.owner}:${context.visibility.status}`],
    ["save", `${context.project.save.owner}:${context.project.save.available ? "live" : "deferred"}`],
    ["restore", `${context.project.restore.owner}:${context.project.restore.available ? "live" : "deferred"}`],
    ["hydrate", `${context.project.hydrate?.owner || "shell"}:${context.project.hydrate?.available ? "live" : "deferred"}`],
    ["handoff/share", `${context.handoff.owner}:${context.handoff.packagePreparationOnly ? "package-only" : context.handoff.status}`],
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
  projectSelect.value = projects.some((project) => project.projectId === selectedProjectId) ? selectedProjectId : "";
  appendDefinitionListRows(projectSummary, [
    ["owner", context.project.owner],
    ["status", context.project.status],
    ["project", readProjectTitle(context.project)],
    ["id", selectedProjectId || "none"],
    ["readiness", context.project.metadata?.readiness || "not-ready"],
    ["source", context.project.selection?.source || context.project.metadata?.source || "unknown"],
    ["restored envelope", context.project.metadata?.restoredEnvelopeId || "none"],
    ["restored at", context.project.metadata?.restoredAt || "none"],
    ["save", context.project.save?.status || "deferred"],
    ["restore", context.project.restore?.status || "deferred"],
    ["hydrate", context.project.hydrate?.status || "idle"],
    ["handoff/share", context.project.handoff?.status || "ready"],
    ["last package", context.project.handoff?.lastPreparedPackageId || "none"],
    ["delivery", context.project.handoff?.externalDelivery ? "live" : "deferred"],
  ]);
}

function renderProjectBrowser({ context }) {
  ensureProjectBrowserPanel();
  if (!projectBrowserSummary || !projectBrowserList) return;
  const browser = context.projectBrowser;
  const save = browser.save || {};
  const restore = browser.restore || {};
  const hydrate = browser.hydrate || {};
  const handoffShare = browser.handoffShare || {};
  const packageSummary = handoffShare.packageSummary || {};
  const selected = selectedProjectSummary(browser);
  appendDefinitionListRows(projectBrowserSummary, [
    ["owner", browser.owner],
    ["status", browser.status],
    ["browser read only", browser.readOnly ? "yes" : "no"],
    ["current", browser.currentProject?.title || "No project loaded"],
    ["current id", browser.currentProject?.projectId || "none"],
    ["restored source", browser.currentProject?.source || "none"],
    ["selected envelope", browser.selectedProjectId || "none"],
    ["selected restore", selected?.restoreEligible ? "enabled" : "disabled"],
    ["runtime saved count", browser.savedCount || 0],
    ["fixture count", browser.fixtureCount || 0],
    ["save", browser.capabilities?.save ? "live" : "deferred"],
    ["save status", save.status || "ready"],
    ["restore", browser.capabilities?.restore ? "live" : "deferred"],
    ["restore status", restore.status || "ready"],
    ["last restored", restore.lastRestoredAt || "none"],
    ["last restored envelope", restore.lastRestoredEnvelopeId || "none"],
    ["hydrate", browser.capabilities?.hydrate ? "live" : "deferred"],
    ["hydrate status", hydrate.status || "idle"],
    ["hydrated modules", (hydrate.lastHydratedModules || []).join(", ") || "none"],
    ["handoff/share", browser.capabilities?.handoff || browser.capabilities?.share ? "package live" : "deferred"],
    ["package status", handoffShare.status || "ready"],
    ["last package", handoffShare.lastPreparedPackageId || "none"],
    ["package envelope", handoffShare.lastPreparedEnvelopeId || packageSummary.envelopeId || "none"],
    ["package prepared", handoffShare.lastPreparedAt || "none"],
    ["delivery", handoffShare.delivery?.externalDelivery ? "live" : "deferred"],
    ["email", handoffShare.delivery?.emailSend ? "live" : "deferred"],
    ["HubSpot", handoffShare.delivery?.hubspotWrite ? "live" : "deferred"],
  ]);
  if (projectBrowserSaveButton) {
    projectBrowserSaveButton.disabled = browser.capabilities?.save !== true;
    projectBrowserSaveButton.textContent = save.status === "saving" ? "Saving..." : "Save Project";
  }
  if (projectBrowserRestoreButton) {
    projectBrowserRestoreButton.disabled = browser.capabilities?.restore !== true || selected?.restoreEligible !== true;
    projectBrowserRestoreButton.textContent = restore.status === "restoring" ? "Restoring..." : "Restore / Open Project";
    projectBrowserRestoreButton.title = selected?.restoreEligible ? "Restore selected runtime-saved envelope" : selected?.restoreDisabledReason || "Select a runtime-saved envelope first.";
  }
  if (projectBrowserHandoffButton) {
    projectBrowserHandoffButton.disabled = browser.capabilities?.prepareHandoff !== true && browser.capabilities?.handoff !== true;
    projectBrowserHandoffButton.textContent = handoffShare.status === "preparing" ? "Preparing..." : "Prepare Handoff / Share";
    projectBrowserHandoffButton.title = "Prepare package only. External delivery, email, and HubSpot writes remain deferred.";
  }

  clearElement(projectBrowserList);
  const projects = browser.projects || [];
  if (projects.length === 0) {
    const item = document.createElement("li");
    item.textContent = browser.emptyStateMessage || "No saved projects found. Save is ready.";
    projectBrowserList.appendChild(item);
    return;
  }
  for (const project of projects) {
    const item = document.createElement("li");
    const isSelected = project.envelopeId === browser.selectedProjectId || project.projectId === browser.selectedProjectId;
    item.className = project.readOnly ? "cs-shell__project-browser-item is-fixture" : "cs-shell__project-browser-item is-runtime-save";
    if (isSelected) item.classList.add("is-selected");
    item.dataset.envelopeId = project.envelopeId || project.projectId;
    item.tabIndex = 0;
    appendProjectBrowserLine(item, project.title, "strong");
    appendProjectBrowserLine(item, `${project.client} · ${project.site}`);
    appendProjectBrowserLine(item, `${project.readOnly ? "fixture/read-only" : "runtime save"} · ${project.lifecycleStatus} · ${project.savedAt || project.updatedAt}`);
    appendProjectBrowserLine(item, `restore: ${project.restoreEligible ? "enabled" : "disabled"}`);
    appendProjectBrowserLine(item, project.restoreDisabledReason || "Runtime saved envelope can be restored.");
    appendProjectBrowserLine(item, `handoff/share: ${packageSummary.envelopeId === project.envelopeId ? `prepared ${packageSummary.packageId}` : "package not prepared"}`);
    appendProjectBrowserLine(item, `saved by ${project.savedBy} · modules: ${(project.moduleIds || []).join(", ") || "none"}`);
    appendProjectBrowserLine(item, `envelope: ${project.envelopeId || project.projectId}`);
    projectBrowserList.appendChild(item);
  }
}

function fillRoleSelect(select, roles, value) {
  clearElement(select);
  for (const role of roles) {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role;
    select.appendChild(option);
  }
  select.value = value || "external_user";
}

function renderIdentityVisibilityControls({ services, context }) {
  if (!identitySelect || !roleOverrideToggle || !roleOverrideSelect || !displayRoleSelect || !projectModeSelect || !visibilitySummary) return;
  const identities = services.identity.getAvailableIdentities?.() || [];
  const roles = services.identity.getRoleOptions?.() || [];

  clearElement(identitySelect);
  const noFixtureOption = document.createElement("option");
  noFixtureOption.value = "";
  noFixtureOption.textContent = "No fixture active — use auth/anonymous source";
  identitySelect.appendChild(noFixtureOption);
  for (const identity of identities) {
    const option = document.createElement("option");
    option.value = identity.id;
    option.textContent = identity.label;
    identitySelect.appendChild(option);
  }
  identitySelect.value = context.identity.lookup?.selectedIdentityId || "";

  appendDefinitionListRows(resolvedIdentitySummary, [
    ["identity state", context.identity.identityState],
    ["classification", context.identity.classification],
    ["identity source", context.identity.lookup?.identitySource || "unknown"],
    ["developer fixture", context.identity.lookup?.usingDeveloperFixture ? "active" : "off"],
    ["actual role", context.identity.actualRole],
    ["derived role", context.identity.derivedActualRole || context.identity.actualRole],
    ["actual role source", context.identity.actualRoleSource],
    ["override active", context.identity.actualRoleOverrideEnabled ? "yes" : "no"],
    ["display preview", context.identity.displayRole],
    ["preview clamped", context.identity.displayRoleClamped ? "yes" : "no"],
  ]);

  roleOverrideToggle.checked = context.identity.actualRoleOverrideEnabled === true;
  fillRoleSelect(roleOverrideSelect, roles, context.identity.actualRoleOverride || context.identity.derivedActualRole || context.identity.actualRole);
  roleOverrideSelect.disabled = !roleOverrideToggle.checked;
  roleOverrideSelect.hidden = !roleOverrideToggle.checked;
  fillRoleSelect(displayRoleSelect, roles, context.identity.displayRole || "external_user");
  projectModeSelect.value = context.visibility.inputs?.projectMode || services.visibility.getProjectMode?.() || "auto";

  const visible = context.visibility.visibleModules.join(", ") || "none";
  const hidden = context.visibility.hiddenModules.join(", ") || "none";
  const currentDecision = context.visibility.moduleReasons[context.route.moduleId];
  appendDefinitionListRows(visibilitySummary, [
    ["mode", "auth-derived identity / developer visibility support"],
    ["real auth", context.auth.live ? "yes" : "no"],
    ["authenticated", context.auth.session?.authenticated ? "yes" : "no"],
    ["display role", context.identity.displayRole],
    ["display preview only", "yes"],
    ["display clamped", context.identity.displayRoleClamped ? "yes" : "no"],
    ["override label", context.identity.resolver?.overrideLabel || "developer/test actual-role override"],
    ["project input", context.visibility.inputs?.projectMode || "auto"],
    ["project present", context.visibility.inputs?.projectPresent ? "yes" : "no"],
    ["visible", visible],
    ["hidden", hidden],
    ["route reason", currentDecision?.reason || "not_registered"],
  ]);
}

function markActiveLink(moduleId) {
  for (const link of document.querySelectorAll("[data-module-link]")) {
    const linkModuleId = link.getAttribute("data-module-link");
    const decision = window.__csLatestShellContext?.visibility?.moduleReasons?.[linkModuleId];
    if (decision && !decision.visible) {
      link.setAttribute("aria-disabled", "true");
      link.dataset.visibilityReason = decision.reason;
      link.title = `Hidden in current visibility preview: ${decision.reason}`;
    } else {
      link.removeAttribute("aria-disabled");
      delete link.dataset.visibilityReason;
      link.removeAttribute("title");
    }
    if (linkModuleId === moduleId) link.setAttribute("aria-current", "page");
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
    window.__csLatestShellContext = context;
    renderAuthControls({ services, context });
    renderContextSummary(context);
    renderProjectSelection({ services, context });
    renderProjectBrowser({ context });
    renderIdentityVisibilityControls({ services, context });
    markActiveLink(route.moduleId);
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

  function handleAuthSignIn() {
    const result = services.auth.signIn(authUserSelect?.value || undefined, "real-login-auth-ui-sign-in");
    services.identity.useAuthenticatedIdentity("real-login-auth-ui-sign-in-sync");
    const nextContext = refreshContext("auth-sign-in");
    if (!result.accepted) {
      setStatus(`Sign in failed: ${result.reason || result.status}`);
      return;
    }
    setStatus(`Signed in as ${nextContext.auth.session.name}. Actual role derives from authenticated identity.`);
  }

  function handleAuthSignOut() {
    services.auth.signOut("real-login-auth-ui-sign-out");
    services.identity.syncFromAuth("real-login-auth-ui-sign-out-sync");
    const nextContext = refreshContext("auth-sign-out");
    setStatus(`${nextContext.auth.reason || "Signed out."} Shell is using safe anonymous fallback.`);
  }

  function handleUseAuthenticatedIdentity() {
    services.identity.useAuthenticatedIdentity("real-login-auth-ui-use-authenticated-identity");
    const nextContext = refreshContext("use-authenticated-identity");
    setStatus(`Using authenticated identity source: ${nextContext.identity.currentUser.name}.`);
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

  function handleProjectBrowserSave() {
    const result = services.projectBrowser.saveProject(context);
    const nextContext = refreshContext("project-save-envelope");
    if (!result.accepted) {
      setStatus(`Save failed: ${result.reason || result.status}`);
      return;
    }
    setStatus(`Saved ${readProjectTitle(nextContext.project)}. Restore/hydrate and handoff/share package preparation are live.`);
  }

  function handleProjectBrowserRestore() {
    const envelopeId = context.projectBrowser.selectedProjectId;
    const result = services.projectBrowser.restoreProject(envelopeId, context);
    const nextContext = refreshContext("project-restore-hydrate");
    if (!result.accepted) {
      setStatus(`Restore skipped: ${result.reason || result.status}`);
      return;
    }
    const hydrated = result.hydratedModules?.map((item) => `${item.moduleId}:${item.status}`).join(", ") || "none";
    setStatus(`Restored ${readProjectTitle(nextContext.project)}. Module hydration payloads prepared (${hydrated}).`);
  }

  function handleProjectBrowserHandoffShare() {
    const result = services.projectBrowser.prepareHandoffShare(context);
    const nextContext = refreshContext("project-handoff-share-package");
    if (!result.accepted) {
      setStatus(`Handoff/share package failed: ${result.reason || result.status}`);
      return;
    }
    setStatus(`Prepared handoff/share package for ${readProjectTitle(nextContext.project)}. External delivery, email, and HubSpot writes remain deferred.`);
  }

  function handleProjectBrowserListClick(event) {
    const item = event.target.closest?.("[data-envelope-id]");
    if (!item) return;
    const result = services.projectBrowser.inspectProject(item.dataset.envelopeId, context);
    refreshContext("project-browser-select-envelope");
    if (!result.accepted) setStatus(`Envelope selection failed: ${result.reason}`);
    else setStatus(`Selected envelope ${result.envelopeId}. Restore is ${result.restoreEligible ? "enabled" : "disabled"}.`);
  }

  function handleIdentityChange(event) {
    const result = services.identity.setIdentityById(event.target.value, "developer-fixture-identity-selection-change");
    if (!result.accepted) {
      setStatus(`Developer fixture lookup failed: ${result.reason}`);
      return;
    }
    const nextContext = refreshContext("developer-fixture-identity-change");
    setStatus(`Developer fixture identity active: ${nextContext.identity.currentUser.name}. This is not real auth.`);
  }

  function handleRoleOverrideToggle(event) {
    const result = services.identity.setActualRoleOverrideEnabled(event.target.checked, "developer-test-actual-role-override-toggle");
    const nextContext = refreshContext("actual-role-override-toggle");
    const stateText = nextContext.identity.actualRoleOverrideEnabled ? "enabled" : "off";
    const clampText = result.clamped ? " Display role was clamped to actual authority." : "";
    setStatus(`Developer/test actual-role override ${stateText}.${clampText}`);
  }

  function handleRoleOverrideChange(event) {
    const result = services.identity.setActualRoleOverride(event.target.value, "developer-test-actual-role-override-change");
    const nextContext = refreshContext("actual-role-override-change");
    const clampText = result.clamped ? " Display role was clamped to actual authority." : "";
    setStatus(`Developer/test override role: ${nextContext.identity.actualRole}.${clampText}`);
  }

  function handleDisplayRoleChange(event) {
    const result = services.identity.setDisplayRole(event.target.value, "display-role-preview-change");
    const nextContext = refreshContext("display-role-change");
    const clampText = result.clamped ? " Requested role was clamped to actual authority." : "";
    setStatus(`Display role preview only: ${nextContext.identity.displayRole}.${clampText}`);
  }

  function handleProjectModeChange(event) {
    services.visibility.setProjectMode(event.target.value, context, "real-login-auth-project-visibility-mode-change");
    const nextContext = refreshContext("project-visibility-mode-change");
    setStatus(`Visibility project input: ${nextContext.visibility.inputs.projectMode}.`);
  }

  registry.register("cs_selector", csSelectorModule);
  registry.register("emergence", emergenceModule);
  registry.register("scene_builder", sceneBuilderModule);
  ensureModuleNavLink("scene_builder", "Scene Builder");

  refreshContext("initial-render");
  signInButton?.addEventListener("click", handleAuthSignIn);
  signOutButton?.addEventListener("click", handleAuthSignOut);
  useAuthIdentityButton?.addEventListener("click", handleUseAuthenticatedIdentity);
  projectBrowserSaveButton?.addEventListener("click", handleProjectBrowserSave);
  projectBrowserRestoreButton?.addEventListener("click", handleProjectBrowserRestore);
  projectBrowserHandoffButton?.addEventListener("click", handleProjectBrowserHandoffShare);
  projectBrowserList?.addEventListener("click", handleProjectBrowserListClick);
  projectSelect?.addEventListener("change", handleProjectSelectionChange);
  identitySelect?.addEventListener("change", handleIdentityChange);
  roleOverrideToggle?.addEventListener("change", handleRoleOverrideToggle);
  roleOverrideSelect?.addEventListener("change", handleRoleOverrideChange);
  displayRoleSelect?.addEventListener("change", handleDisplayRoleChange);
  projectModeSelect?.addEventListener("change", handleProjectModeChange);

  if (showHomeIfRequested(route.moduleId)) {
    setStatus("Workspace home mounted. Auth/session is live and shell-owned; developer controls are support only.");
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
    setStatus(`Mounted ${route.moduleId}. Auth/session is live and shell-owned; project lifecycle remains intact.`);
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
