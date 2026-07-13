import { createModuleRegistry } from "/packages/workspace-kernel/moduleRegistry.js";
import { createPluginRegistry } from "/packages/workspace-kernel/pluginRegistry.js";
import { resolveWorkspaceRoute } from "/packages/workspace-kernel/route.js";
import { createShellContext, createShellServices } from "/packages/workspace-kernel/services.js";
import { csSelectorModule } from "/packages/modules/cs-selector/index.js";
import { emergenceModule } from "/packages/modules/emergence/index.js";
import { sceneBuilderModule } from "/packages/modules/scene-builder/index.js";
import { adminDevModule } from "/packages/modules/admin-dev/index.js";
import { boardDataModule } from "/packages/modules/board-data/index.js";
import { iesBuilderModule } from "/packages/modules/ies-builder/index.js";
import { complianceMattersModule } from "/packages/modules/compliance-matters/index.js";
import { coordinatedSurfacesModule } from "/packages/modules/coordinated-surfaces/index.js";
import { labProofModule } from "/packages/modules/lab-proof/index.js";
import { knowledgeSpineModule } from "/packages/modules/knowledge-spine/index.js";
import { knowledgeBaseModule } from "/packages/modules/knowledge-base/index.js";
import { canonicalLanguageModule } from "/packages/modules/canonical-language/index.js";
import { controlledRecordsModule } from "/packages/modules/controlled-records/index.js";
import { rregModule } from "/packages/modules/rreg/index.js";
import { lioraCockpitModule } from "/packages/modules/liora-cockpit/index.js";
import { engineFlowModule } from "/packages/modules/engine-flow/index.js";
import {
  MODULE_STATUS_REGISTRY,
  moduleStatusFor,
  moduleStatusRows,
  moduleStatusTooltip,
} from "./moduleStatusRegistry.js";
import {
  createShellProjectBrowserProjectIesExportDownloadOutcomeState,
  getShellProjectBrowserSelectedProjectExportAction,
  getShellProjectBrowserSelectedProjectExportDetailPreview,
  getShellProjectBrowserSelectedProjectExportManifestPreview,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
} from "./projectBrowserSelectedProjectExportsWorkflow.js";
import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
} from "./projectBrowserSelectedProjectEngineRunPreview.js";
import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
} from "./projectBrowserSelectedProjectEngineActionLane.js";

const MODULE_ROUTE_ALIASES = Object.freeze({
  egres: "emergence",
});

function canonicalModuleId(moduleId) {
  return MODULE_ROUTE_ALIASES[moduleId] || moduleId;
}

function isSameModuleRoute(linkModuleId, routeModuleId) {
  return canonicalModuleId(linkModuleId) === canonicalModuleId(routeModuleId);
}

const shellRoot = document.getElementById("cs-shell-root");
const statusEl = document.getElementById("cs-shell-status");
const moduleHost = document.getElementById("cs-shell-module-host");
const pluginHost = document.getElementById("cs-shell-plugin-host");
const homePanel = document.getElementById("cs-workspace-home");
const contextSummary = document.getElementById("cs-shell-context-summary");
const projectSelect = document.getElementById("cs-shell-project-select");
const projectSummary = document.getElementById("cs-shell-project-summary");
const companySelect = document.getElementById("cs-shell-company-select");
const companySummary = document.getElementById("cs-shell-company-summary");
const companyLinkButton = document.getElementById("cs-shell-company-link-button");
const companyProjectButton = document.getElementById("cs-shell-company-project-button");
const companyClearButton = document.getElementById("cs-shell-company-clear-button");
const authUserSelect = document.getElementById("cs-shell-auth-user-select");
const accountSummary = document.getElementById("cs-shell-account-summary");
const authSummary = document.getElementById("cs-shell-auth-summary");
const authoritySummary = document.getElementById("cs-shell-authority-summary");
const signInButton = document.getElementById("cs-shell-sign-in-button");
const signOutButton = document.getElementById("cs-shell-sign-out-button");
const useAuthIdentityButton = document.getElementById("cs-shell-use-auth-identity-button");
const userMenuButton = document.getElementById("cs-shell-user-menu-button");
const userMenuPanel = document.getElementById("cs-shell-user-menu-panel");
const userAvatar = document.getElementById("cs-shell-user-avatar");
const userName = document.getElementById("cs-shell-user-name");
const userMeta = document.getElementById("cs-shell-user-meta");
const userCompanyLogo = document.getElementById("cs-shell-user-company-logo");
const userCompanyName = document.getElementById("cs-shell-user-company-name");
const shellSearchButton = document.getElementById("cs-shell-search-button");
const shellSearchPanel = document.getElementById("cs-shell-search-panel");
const shellSearchInput = document.getElementById("cs-shell-find-ask");
const shellSearchClose = document.getElementById("cs-shell-search-close");
const developerDiagnosticsDetails = document.getElementById("shell_developer_diagnostics");
const identitySelect = document.getElementById("cs-shell-identity-select");
const resolvedIdentitySummary = document.getElementById("cs-shell-resolved-identity-summary");
const roleOverrideToggle = document.getElementById("cs-shell-role-override-toggle");
const roleOverrideSelect = document.getElementById("cs-shell-role-override-select");
const displayRoleSelect = document.getElementById("cs-shell-display-role-select");
const projectModeSelect = document.getElementById("cs-shell-project-mode-select");
const visibilitySummary = document.getElementById("cs-shell-visibility-summary");
const timelineChip = document.getElementById("cs-shell-timeline-chip");
const timelinePopout = document.getElementById("cs-shell-timeline-popout");
const projectChip = document.getElementById("cs-shell-project-chip");
const projectChipLabel = document.getElementById("cs-shell-project-chip-label");
const projectPopout = document.getElementById("cs-shell-project-popout");
const projectPopoutTitle = document.getElementById("cs-shell-project-popout-title");
const projectPopoutList = document.getElementById("cs-shell-project-popout-list");
const projectPopoutActions = document.getElementById("cs-shell-project-popout-actions");
const companyChip = document.getElementById("cs-shell-company-chip");
const companyChipLabel = document.getElementById("cs-shell-company-chip-label");
const companyPopout = document.getElementById("cs-shell-company-popout");
const companyPopoutList = document.getElementById("cs-shell-company-popout-list");
const companyPopoutActions = document.getElementById("cs-shell-company-popout-actions");
const viewChipWrap = document.getElementById("cs-shell-view-chip-wrap");
const viewChip = document.getElementById("cs-shell-view-chip");
const viewChipLabel = document.getElementById("cs-shell-view-chip-label");
const viewPopout = document.getElementById("cs-shell-view-popout");
const viewPopoutList = document.getElementById("cs-shell-view-popout-list");
const startPanel = document.getElementById("cs-shell-start-panel");
const startAccountButton = document.getElementById("cs-shell-start-account-button");
const startProjectButton = document.getElementById("cs-shell-start-project-button");
const contextInspectorButton = document.getElementById("cs-shell-context-inspector-button");
const contextInspector = document.getElementById("cs-shell-context-inspector");
const contextInspectorClose = document.getElementById("cs-shell-context-inspector-close");
const contextInspectorContent = document.getElementById("cs-shell-context-inspector-content");
const assistiveEmailInput = document.getElementById("cs-shell-assist-email-input");
const assistiveCompanyPill = document.getElementById("cs-shell-assist-company-pill");
const assistiveCompanyNameInput = document.getElementById("cs-shell-assist-company-name-input");
const assistiveCompanyLogoButton = document.getElementById("cs-shell-assist-company-logo-button");
const assistiveCompanyLogoImage = document.getElementById("cs-shell-assist-company-logo-image");
const assistiveCompanyStatus = document.getElementById("cs-shell-assist-company-status");
const moduleStatusPanel = document.getElementById("cs-shell-module-status-panel");

const SHELL_ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);
const NOVON_WEBSITE_MODULE_ID = "novon_website";
const NOVON_WEBSITE_URL = "https://www.novonlighting.com.au/";
const SHELL_DEVELOPER_DIAGNOSTICS_CONTRACT = Object.freeze({
  heading: "DEV ORIENTATION",
  module: "Workspace Shell",
  itemType: "section",
  fieldKey: "developer_diagnostics",
  sectionId: "shell_developer_diagnostics",
  sectionLabel: "Developer / Diagnostics",
  contactRolesView: Object.freeze(["developer"]),
  contactRolesEdit: Object.freeze(["developer"]),
  workflowModesAllowed: "*",
  stagesAllowed: "*",
  requires: "none",
  helperTextInternal: "Developer-only shell diagnostics entry point",
  notes: "Controls D affordance and diagnostics disclosure in the shell account area",
  identityStatesView: Object.freeze(["developer"]),
});

let projectBrowserPanel = null;
let projectBrowserSummary = null;
let projectBrowserList = null;
let projectBrowserSaveButton = null;
let projectBrowserRestoreButton = null;
let projectBrowserHandoffButton = null;
let projectBrowserSelectedProjectExportsPanel = null;
let projectBrowserSelectedProjectExportsTitle = null;
let projectBrowserSelectedProjectExportsItems = null;
let projectBrowserSelectedProjectExportManifestPreview = null;
let projectBrowserSelectedProjectExportDetailPreview = null;
let projectBrowserSelectedProjectEngineRunPreview = null;
let projectBrowserSelectedProjectEngineActionLane = null;
let projectBrowserSelectedProjectExportsWorkflow = null;
const projectBrowserSelectedProjectExportControls = new Map();
const projectBrowserSelectedProjectExportOutcomeStates = new Map();
const projectBrowserProjectIesExportDownloadOutcomeState = Object.freeze({
  reset() {
    for (const outcomeState of projectBrowserSelectedProjectExportOutcomeStates.values()) {
      outcomeState.reset();
    }
  },
});
let projectBrowserSelectedProjectExportsRefreshSequence = 0;
let shellTopbarBound = false;

const companyIdentityState = {
  debounceId: null,
  companyNameSource: "empty",
  userLocked: false,
  currentDomain: null,
  currentLogoUrl: "",
  currentLogoDomain: "",
  logoRequestId: 0,
  derivedNameCache: new Map(),
  logoCache: new Map(),
};

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

function moduleStatusAriaLabel(status) {
  return `${status.label}: ${status.badge}. Contract: ${status.contract}. Runtime: ${status.runtime}. Authority: ${status.authority}. UI evidence: ${status.uiEvidence}. Next step: ${status.nextStep}.`;
}

function renderModuleStatusRail() {
  for (const item of document.querySelectorAll(".cs-shell__rail-item")) {
    if (item.dataset.shellStatusRail === "false" || item.dataset.shellUtilityLink === "true") {
      delete item.dataset.moduleStatus;
      item.querySelector(":scope > .cs-shell__module-status-badge")?.remove();
      continue;
    }

    const statusId = item.dataset.moduleStatusKey || item.dataset.moduleLink || "";
    const status = moduleStatusFor(statusId);
    if (!status) continue;

    const tooltip = moduleStatusTooltip(status);
    item.dataset.moduleStatus = status.badge;
    item.setAttribute("title", tooltip);
    item.setAttribute("aria-label", moduleStatusAriaLabel(status));

    item.querySelector(":scope > .cs-shell__module-status-badge")?.remove();
  }
}

function renderModuleStatusRegistryPanel() {
  if (!moduleStatusPanel) return;
  clearElement(moduleStatusPanel);

  const headingRow = document.createElement("div");
  headingRow.className = "cs-shell__module-status-heading";
  const headingText = document.createElement("div");
  const kicker = document.createElement("p");
  kicker.className = "cs-shell__section-kicker";
  kicker.textContent = "Build lifecycle";
  const heading = document.createElement("h3");
  heading.textContent = "Module maturity status";
  headingText.append(kicker, heading);
  const note = document.createElement("p");
  note.textContent = "Read-only shell registry. It does not call Google, write data, mutate Selector, or imply proof, certification, legal approval, engineering signoff, or authority approval.";
  headingRow.append(headingText, note);
  moduleStatusPanel.appendChild(headingRow);

  const list = document.createElement("div");
  list.className = "cs-shell__module-status-list";
  for (const status of MODULE_STATUS_REGISTRY) {
    if (["workspace_home", "novon_website", "hubspot_project_context"].includes(status.id)) continue;
    const card = document.createElement("article");
    card.className = "cs-shell__module-status-card";
    card.dataset.moduleStatus = status.badge;

    const cardHeader = document.createElement("header");
    const title = document.createElement("h4");
    title.textContent = status.label;
    const badge = document.createElement("span");
    badge.className = "cs-shell__module-status-chip";
    badge.textContent = status.badge;
    cardHeader.append(title, badge);

    const rows = document.createElement("dl");
    rows.className = "cs-shell__module-status-rows";
    appendDefinitionListRows(rows, moduleStatusRows(status));
    card.append(cardHeader, rows);
    list.appendChild(card);
  }
  moduleStatusPanel.appendChild(list);
}

function railGroupControls(group) {
  return Array.from(group.querySelectorAll(":scope > .cs-shell__rail-group-items a, :scope > .cs-shell__rail-group-items button"));
}

function isDisabledRailControl(control) {
  return control?.disabled === true || control?.getAttribute?.("aria-disabled") === "true";
}

function setRailGroupExpanded(group, expanded) {
  if (!group) return;
  const defaultExpanded = group.dataset.shellNavDefault === "expanded";
  const isExpanded = defaultExpanded || Boolean(expanded);
  group.dataset.shellNavExpanded = isExpanded ? "true" : "false";
  const trigger = group.querySelector(":scope > .cs-shell__rail-group-title");
  if (trigger) trigger.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  const items = group.querySelector(":scope > .cs-shell__rail-group-items");
  if (items) items.setAttribute("aria-hidden", isExpanded ? "false" : "true");

  for (const control of railGroupControls(group)) {
    if (isExpanded) {
      if (control.dataset.shellNavOriginalTabindex) {
        control.setAttribute("tabindex", control.dataset.shellNavOriginalTabindex);
        delete control.dataset.shellNavOriginalTabindex;
      } else {
        control.removeAttribute("tabindex");
      }
    } else {
      if (control.hasAttribute("tabindex") && !control.dataset.shellNavOriginalTabindex) {
        control.dataset.shellNavOriginalTabindex = control.getAttribute("tabindex") || "";
      }
      control.setAttribute("tabindex", "-1");
    }
  }
}

const railGroupCloseTimers = new WeakMap();

function clearRailGroupCloseTimer(group) {
  const timerId = railGroupCloseTimers.get(group);
  if (!timerId) return;
  window.clearTimeout(timerId);
  railGroupCloseTimers.delete(group);
}

function scheduleRailGroupClose(group) {
  if (!group || group.dataset.shellNavDefault === "expanded") return;
  clearRailGroupCloseTimer(group);
  const timerId = window.setTimeout(() => {
    railGroupCloseTimers.delete(group);
    if (group.matches(":hover") || group.matches(":focus-within")) return;
    setRailGroupExpanded(group, false);
  }, 260);
  railGroupCloseTimers.set(group, timerId);
}

function markRailFlyoutHover(group, control) {
  for (const item of railGroupControls(group)) {
    const isHovered = item === control;
    item.classList.toggle("is-hovered", isHovered);
    if (isHovered) item.setAttribute("aria-selected", "true");
    else item.removeAttribute("aria-selected");
  }
}

function clearRailFlyoutHover(group) {
  for (const item of railGroupControls(group)) {
    item.classList.remove("is-hovered");
    item.removeAttribute("aria-selected");
  }
}

function closeTransientRailGroups() {
  for (const group of document.querySelectorAll('.cs-shell__rail-group[data-shell-nav-default="collapsed"]')) {
    clearRailGroupCloseTimer(group);
    clearRailFlyoutHover(group);
    setRailGroupExpanded(group, false);
  }
}

function bindGroupedRailNavigation() {
  for (const group of document.querySelectorAll(".cs-shell__rail-group")) {
    if (group.dataset.shellNavBound === "true") continue;
    group.dataset.shellNavBound = "true";
    const trigger = group.querySelector(":scope > .cs-shell__rail-group-title");
    const controls = railGroupControls(group);
    setRailGroupExpanded(group, group.dataset.shellNavDefault === "expanded");
    group.addEventListener("mouseenter", () => {
      clearRailGroupCloseTimer(group);
      setRailGroupExpanded(group, true);
    });
    group.addEventListener("focusin", () => {
      clearRailGroupCloseTimer(group);
      setRailGroupExpanded(group, true);
    });
    trigger?.addEventListener("click", () => {
      if (group.dataset.shellNavDefault === "expanded") return;
      clearRailGroupCloseTimer(group);
      setRailGroupExpanded(group, true);
    });
    for (const control of controls) {
      control.addEventListener("click", (event) => {
        if (!isDisabledRailControl(control)) return;
        event.preventDefault();
        event.stopPropagation();
      });
      control.addEventListener("mouseenter", () => markRailFlyoutHover(group, control));
      control.addEventListener("focus", () => markRailFlyoutHover(group, control));
    }
    group.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      clearRailGroupCloseTimer(group);
      clearRailFlyoutHover(group);
      setRailGroupExpanded(group, false);
      trigger?.focus({ preventScroll: true });
    });
    group.addEventListener("mouseleave", () => {
      if (!group.matches(":focus-within")) {
        clearRailFlyoutHover(group);
        scheduleRailGroupClose(group);
      }
    });
    group.addEventListener("focusout", (event) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget && group.contains(nextTarget)) return;
      clearRailFlyoutHover(group);
      scheduleRailGroupClose(group);
    });
  }
}

function appendProjectBrowserLine(parent, text, tagName = "span") {
  const element = document.createElement(tagName);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function initialsFor(name = "Workspace User") {
  return String(name || "Workspace User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CS";
}

function roleRank(role) {
  const index = SHELL_ROLE_ORDER.indexOf(role);
  return index < 0 ? 0 : index;
}

function actualShellRole(context) {
  return context.authority?.actualRole?.value || context.identity?.actualRole || "external_user";
}

function displayShellRole(context) {
  return context.visibility?.inputs?.displayRole || context.identity?.displayRole || actualShellRole(context);
}

function shellRoleAbbreviation(role) {
  const labels = {
    external_user: "Ext.",
    internal_user: "Int",
    internal_engineer: "Adm",
    admin: "Adm",
    developer: "Dev",
  };
  return labels[role] || String(role || "Ext.").replace(/_/g, " ");
}

function canViewShellContractSection(contract, context) {
  const role = actualShellRole(context);
  const identityState = context.identity?.identityState || "external_anonymous";
  return contract.contactRolesView.includes(role) || contract.identityStatesView.includes(identityState);
}

function canViewDeveloperDetails(context) {
  const actualRole = actualShellRole(context);
  const hasDeveloperAuthority = actualRole === "developer" || actualRole === "admin";
  return hasDeveloperAuthority && displayShellRole(context) === "developer";
}

function canViewModeToggle(context) {
  return roleRank(actualShellRole(context)) >= roleRank("internal_user");
}

function currentProjectId(context) {
  return context.project?.selection?.selectedProjectId || context.project?.currentProject?.projectId || "";
}

function currentProjectTitle(context) {
  return context.project?.metadata?.title || context.project?.currentProject?.title || "Enter project";
}

function hasProject(context) {
  return Boolean(currentProjectId(context));
}

function isSignedIn(context) {
  return context.auth?.session?.authenticated === true;
}

function setPopout(button, popout, open) {
  if (!button || !popout) return;
  popout.hidden = !open;
  button.setAttribute("aria-expanded", open ? "true" : "false");
}

function closeTopbarPopouts(except = null) {
  for (const [button, popout] of [
    [timelineChip, timelinePopout],
    [projectChip, projectPopout],
    [companyChip, companyPopout],
    [viewChip, viewPopout],
  ]) {
    if (popout !== except) setPopout(button, popout, false);
  }
}

function setShellSearchOpen(open, options = {}) {
  if (!shellSearchButton || !shellSearchPanel) return;
  shellSearchPanel.hidden = !open;
  shellSearchButton.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    closeTopbarPopouts(null);
    if (options.focusInput !== false) window.requestAnimationFrame(() => shellSearchInput?.focus?.());
  } else if (document.activeElement === shellSearchInput && options.restoreFocus !== false) {
    shellSearchButton.focus();
  }
}

function toggleTopbarPopout(button, popout) {
  if (!button || !popout) return;
  const open = button.getAttribute("aria-expanded") !== "true";
  setShellSearchOpen(false, { restoreFocus: false });
  closeTopbarPopouts(popout);
  setPopout(button, popout, open);
}

function createShellButton(label, className = "cs-shell__popout-button") {
  const item = document.createElement("button");
  item.type = "button";
  item.className = className;
  item.textContent = label;
  return item;
}

function dispatchLegacyChange(select, value) {
  if (!select) return;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function resolvedUserEmail(context = {}) {
  return context.auth?.session?.email || context.auth?.user?.email || context.identity?.currentUser?.email || "";
}

function hubSpotUserCompanyName(context = {}) {
  const readCompany = context.crm?.crmRead?.company;
  if (readCompany?.found && readCompany.companyName) return String(readCompany.companyName).trim();
  const crmCompany = context.crm?.company;
  if (crmCompany?.source === "crm-read-only" && crmCompany.companyName) return String(crmCompany.companyName).trim();
  return "";
}

function currentUserCompanyName(context = {}) {
  const manualValue = assistiveCompanyNameInput?.value?.trim() || "";
  if (companyIdentityState.companyNameSource === "user" && manualValue) return manualValue;
  const hubSpotName = hubSpotUserCompanyName(context);
  if (hubSpotName) {
    if (assistiveCompanyNameInput && companyIdentityState.companyNameSource !== "user") {
      assistiveCompanyNameInput.value = hubSpotName;
      companyIdentityState.companyNameSource = "hubspot";
    }
    return hubSpotName;
  }
  const domain = parseEmailDomain(resolvedUserEmail(context) || assistiveEmailInput?.value || "");
  if (!domain) return "";
  const { freemailBlocklist } = companyIdentityRuntimeSets();
  if (freemailBlocklist.has(domain)) return "";
  return deriveCompanyNameFromDomain(domain);
}

function renderUserCompanyIdentity(context = {}) {
  const companyName = currentUserCompanyName(context);
  const hasCompanyName = Boolean(companyName);
  if (userCompanyName) {
    userCompanyName.textContent = companyName;
    userCompanyName.hidden = !hasCompanyName;
  }
  if (userMeta) userMeta.hidden = !hasCompanyName;
  if (!userCompanyLogo) return;
  if (hasCompanyName && companyIdentityState.currentLogoUrl) {
    userCompanyLogo.src = companyIdentityState.currentLogoUrl;
    userCompanyLogo.alt = companyName;
    userCompanyLogo.hidden = false;
  } else {
    userCompanyLogo.removeAttribute("src");
    userCompanyLogo.alt = "";
    userCompanyLogo.hidden = true;
  }
}

function syncUserCompanyLogoLookup(context = {}) {
  const email = resolvedUserEmail(context);
  if (assistiveEmailInput && email && !assistiveEmailInput.value) assistiveEmailInput.value = email;
  const domain = parseEmailDomain(email || assistiveEmailInput?.value || "");
  if (!domain) {
    renderUserCompanyIdentity(context);
    return;
  }
  const { freemailBlocklist } = companyIdentityRuntimeSets();
  if (freemailBlocklist.has(domain)) {
    companyIdentityState.currentDomain = domain;
    companyIdentityState.currentLogoUrl = "";
    companyIdentityState.currentLogoDomain = "";
    renderUserCompanyIdentity(context);
    return;
  }
  if (companyIdentityState.currentDomain !== domain) {
    companyIdentityState.currentDomain = domain;
    companyIdentityState.logoRequestId += 1;
  }
  renderUserCompanyIdentity(context);
  lookupCompanyLogo(domain);
}

function companyIdentityConfig() {
  return globalThis.__CONTROLSTACK_RUNTIME_CONFIG__?.companyIdentity || {};
}

function companyIdentityRuntimeSets() {
  const config = companyIdentityConfig();
  return {
    overrideMap: config.overrideMap && typeof config.overrideMap === "object" ? config.overrideMap : {},
    freemailBlocklist: new Set(Array.isArray(config.freemailBlocklist) ? config.freemailBlocklist.map((item) => String(item).toLowerCase()) : []),
    publicSuffixes: Array.isArray(config.publicSuffixes) ? [...config.publicSuffixes].map(String).sort((a, b) => b.length - a.length) : [],
    logoDevPublishableKey: String(config.logoDevPublishableKey || "").trim(),
  };
}

function parseEmailDomain(value) {
  const email = String(value || "").trim().toLowerCase();
  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === email.length - 1) return null;
  let domain = email.slice(atIndex + 1).trim().replace(/\s+/g, "");
  if (!domain || !domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return null;
  for (const prefix of ["mail.", "smtp.", "mx."]) {
    if (domain.startsWith(prefix)) domain = domain.slice(prefix.length);
  }
  return domain || null;
}

function splitCompanyLabel(label) {
  return String(label || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\-_\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function titleCaseCompanyWords(words) {
  return words.map((word) => {
    const lower = word.toLowerCase();
    if (lower.length <= 3 && /^[a-z0-9]+$/i.test(word)) return lower.toUpperCase();
    return lower.slice(0, 1).toUpperCase() + lower.slice(1);
  }).join(" ");
}

function deriveCompanyNameFromDomain(domain) {
  if (companyIdentityState.derivedNameCache.has(domain)) return companyIdentityState.derivedNameCache.get(domain);
  const { overrideMap, publicSuffixes } = companyIdentityRuntimeSets();
  const override = overrideMap[domain];
  if (override) {
    companyIdentityState.derivedNameCache.set(domain, override);
    return override;
  }
  const suffix = publicSuffixes.find((candidate) => domain.endsWith(candidate)) || "";
  if (!suffix) {
    companyIdentityState.derivedNameCache.set(domain, "");
    return "";
  }
  const base = domain.slice(0, -suffix.length);
  const label = (base.split(".").filter(Boolean).pop() || "").trim();
  const suggestion = titleCaseCompanyWords(splitCompanyLabel(label));
  companyIdentityState.derivedNameCache.set(domain, suggestion);
  return suggestion;
}

function setAssistiveCompanyStatus(message) {
  if (assistiveCompanyStatus) assistiveCompanyStatus.textContent = message;
}

function setAssistiveCompanyTextMode({ focus = false } = {}) {
  if (assistiveCompanyPill) assistiveCompanyPill.dataset.mode = "text-input";
  if (assistiveCompanyNameInput) assistiveCompanyNameInput.hidden = false;
  if (assistiveCompanyLogoButton) assistiveCompanyLogoButton.hidden = true;
  if (focus) assistiveCompanyNameInput?.focus?.();
}

function setAssistiveCompanyLogoMode(domain, url) {
  if (!assistiveCompanyLogoImage || !assistiveCompanyLogoButton || !assistiveCompanyNameInput) return;
  const logoAlt = currentUserCompanyName(window.__csLatestShellContext || {}) || assistiveCompanyNameInput.value.trim() || domain;
  companyIdentityState.currentLogoUrl = url;
  companyIdentityState.currentLogoDomain = domain;
  assistiveCompanyLogoImage.src = url;
  assistiveCompanyLogoImage.alt = logoAlt;
  assistiveCompanyNameInput.hidden = true;
  assistiveCompanyLogoButton.hidden = false;
  if (assistiveCompanyPill) assistiveCompanyPill.dataset.mode = "logo";
  renderUserCompanyIdentity(window.__csLatestShellContext || {});
  setAssistiveCompanyStatus("Logo found. This is a visual hint only; click the logo to edit the company name.");
}

function writeAssistiveCompanySuggestion(suggestion) {
  if (!assistiveCompanyNameInput || !suggestion) return;
  if (companyIdentityState.userLocked) return;
  if (!["empty", "suggested"].includes(companyIdentityState.companyNameSource)) return;
  assistiveCompanyNameInput.value = suggestion;
  companyIdentityState.companyNameSource = "suggested";
}

function lookupCompanyLogo(domain) {
  const { logoDevPublishableKey } = companyIdentityRuntimeSets();
  if (!logoDevPublishableKey) return;
  if (companyIdentityState.logoCache.has(domain)) {
    const cached = companyIdentityState.logoCache.get(domain);
    if (cached?.found) setAssistiveCompanyLogoMode(domain, cached.url);
    return;
  }
  const requestId = ++companyIdentityState.logoRequestId;
  const url = `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(logoDevPublishableKey)}&fallback=404`;
  const image = new Image();
  image.onload = () => {
    companyIdentityState.logoCache.set(domain, { found: true, url });
    if (requestId !== companyIdentityState.logoRequestId) return;
    if (companyIdentityState.currentDomain !== domain) return;
    setAssistiveCompanyLogoMode(domain, url);
  };
  image.onerror = () => {
    companyIdentityState.logoCache.set(domain, { found: false, url: null });
    if (requestId !== companyIdentityState.logoRequestId) return;
    if (companyIdentityState.currentDomain !== domain) return;
    companyIdentityState.currentLogoUrl = "";
    companyIdentityState.currentLogoDomain = "";
    setAssistiveCompanyTextMode();
    renderUserCompanyIdentity(window.__csLatestShellContext || {});
    setAssistiveCompanyStatus("No logo was found. You can continue with the editable company name.");
  };
  image.src = url;
}

function handleAssistiveEmailDomainChange() {
  const domain = parseEmailDomain(assistiveEmailInput?.value);
  if (!domain) return;
  const { freemailBlocklist } = companyIdentityRuntimeSets();
  companyIdentityState.currentDomain = domain;
  companyIdentityState.logoRequestId += 1;
  if (freemailBlocklist.has(domain)) {
    companyIdentityState.currentLogoUrl = "";
    companyIdentityState.currentLogoDomain = "";
    setAssistiveCompanyTextMode();
    renderUserCompanyIdentity(window.__csLatestShellContext || {});
    setAssistiveCompanyStatus("Personal or ISP email detected. No company suggestion or logo lookup was run.");
    return;
  }
  const cachedLogo = companyIdentityState.logoCache.get(domain);
  if (!cachedLogo?.found) setAssistiveCompanyTextMode();
  setAssistiveCompanyStatus(`Checking company logo for ${domain}. Company name remains manual or HubSpot-derived only.`);
  lookupCompanyLogo(domain);
}

function scheduleAssistiveEmailDomainChange() {
  window.clearTimeout(companyIdentityState.debounceId);
  companyIdentityState.debounceId = window.setTimeout(handleAssistiveEmailDomainChange, 400);
}

function handleAssistiveCompanyNameInput() {
  const value = assistiveCompanyNameInput?.value?.trim() || "";
  companyIdentityState.userLocked = Boolean(value);
  companyIdentityState.companyNameSource = value ? "user" : "empty";
  setAssistiveCompanyTextMode();
  renderUserCompanyIdentity(window.__csLatestShellContext || {});
  setAssistiveCompanyStatus(value
    ? "Company name is user-entered. HubSpot will not overwrite it unless cleared."
    : "Company helper cleared. Auto mode is active; HubSpot email lookup may repopulate the company name.");
}

function handleAssistiveCompanyLogoOverride() {
  const value = assistiveCompanyNameInput?.value?.trim() || "";
  companyIdentityState.userLocked = true;
  companyIdentityState.companyNameSource = value ? "user" : "empty";
  companyIdentityState.logoRequestId += 1;
  setAssistiveCompanyTextMode({ focus: true });
  setAssistiveCompanyStatus("Logo hidden. Edit the company name text directly. Email-domain suggestions will not overwrite it this session.");
}

function bindAssistiveCompanyIdentityHelper() {
  assistiveEmailInput?.addEventListener("input", scheduleAssistiveEmailDomainChange);
  assistiveCompanyNameInput?.addEventListener("input", handleAssistiveCompanyNameInput);
  assistiveCompanyLogoButton?.addEventListener("click", handleAssistiveCompanyLogoOverride);
}

function clickLegacy(selector) {
  document.querySelector(selector)?.click?.();
}

function createLocalDeveloperSummary(label) {
  const summary = document.createElement("summary");
  summary.className = "cs-shell__local-dev-toggle";
  summary.title = label;
  summary.setAttribute("aria-label", label);
  const marker = document.createElement("span");
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = "d";
  const text = document.createElement("span");
  text.className = "cs-shell__sr-only";
  text.textContent = label;
  summary.append(marker, text);
  return summary;
}

function ensureLocalDeveloperDetails(anchor, id, label) {
  if (!anchor) return null;
  let details = document.getElementById(id);
  if (!details) {
    details = document.createElement("details");
    details.id = id;
    details.className = "cs-shell__local-dev-details";
    details.dataset.fieldKey = id;
    details.appendChild(createLocalDeveloperSummary(label));
    const body = document.createElement("div");
    body.className = "cs-shell__local-dev-body";
    details.appendChild(body);
    anchor.insertAdjacentElement("afterend", details);
  }
  return details;
}

function renderLocalDeveloperRows({ anchor, context, id, label, rows }) {
  const details = ensureLocalDeveloperDetails(anchor, id, label);
  if (!details) return;
  const visible = canViewDeveloperDetails(context);
  details.hidden = !visible;
  if (!visible) details.open = false;
  const body = details.querySelector(".cs-shell__local-dev-body");
  if (!body) return;
  clearElement(body);
  const list = document.createElement("dl");
  list.className = "cs-shell__local-dev-list";
  appendDefinitionListRows(list, rows);
  body.appendChild(list);
}

function renderDeveloperDiagnosticsAccess(context) {
  if (!developerDiagnosticsDetails) return;
  const visible = canViewDeveloperDetails(context);
  developerDiagnosticsDetails.hidden = !visible;
  developerDiagnosticsDetails.dataset.contractHeading = SHELL_DEVELOPER_DIAGNOSTICS_CONTRACT.heading;
  developerDiagnosticsDetails.dataset.contactRolesView = SHELL_DEVELOPER_DIAGNOSTICS_CONTRACT.contactRolesView.join(",");
  developerDiagnosticsDetails.dataset.identityStatesView = SHELL_DEVELOPER_DIAGNOSTICS_CONTRACT.identityStatesView.join(",");
  if (!visible) developerDiagnosticsDetails.open = false;
}

function ensureDeveloperButton(container, label) {
  let button = container.querySelector(":scope > .cs-shell__local-dev-button");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "cs-shell__local-dev-button";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.textContent = "d";
    button.addEventListener("click", () => {
      const isOpen = container.dataset.devOpen === "true";
      container.dataset.devOpen = isOpen ? "false" : "true";
      button.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
    container.prepend(button);
  }
  return button;
}

function renderDeveloperOnlyContainer(container, context, label) {
  if (!container) return;
  const visible = canViewDeveloperDetails(context);
  container.dataset.shellDeveloperOnly = "true";
  container.hidden = !visible;
  if (!visible) {
    container.dataset.devOpen = "false";
    return;
  }
  if (!container.dataset.devOpen) container.dataset.devOpen = "false";
  const button = ensureDeveloperButton(container, label);
  button.setAttribute("aria-expanded", container.dataset.devOpen === "true" ? "true" : "false");
}

function setUserMenuOpen(isOpen) {
  if (!userMenuPanel || !userMenuButton) return;
  userMenuPanel.hidden = !isOpen;
  userMenuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function ensureModuleNavLink(moduleId, label) {
  const nav = document.querySelector(".cs-shell__workflow-nav") || document.querySelector(".cs-shell__sidebar nav");
  if (!nav || document.querySelector(`[data-module-link="${moduleId}"]`)) return;
  const link = document.createElement("a");
  link.href = `/workspace?module=${moduleId}`;
  link.className = "cs-shell__rail-item";
  link.dataset.moduleLink = moduleId;
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  link.appendChild(labelElement);
  nav.appendChild(link);
}

function ensureProjectBrowserPanel() {
  if (projectBrowserPanel) return;
  const companyCard = document.querySelector(".cs-shell__company-card");
  const projectCard = document.querySelector(".cs-shell__project-card");
  const anchor = companyCard || projectCard;
  if (!anchor) return;

  projectBrowserPanel = document.createElement("section");
  projectBrowserPanel.className = "cs-shell__project-browser-card cs-shell__sidebar-section";
  projectBrowserPanel.setAttribute("aria-label", "Project Browser lifecycle actions");

  const kicker = document.createElement("p");
  kicker.className = "cs-shell__section-kicker";
  kicker.textContent = "Project actions";
  const heading = document.createElement("h3");
  heading.textContent = "Project Browser";
  const note = document.createElement("p");
  note.textContent = "Save, restore, and prepare handoff/share packages for the current project.";
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

  projectBrowserSelectedProjectExportsPanel = document.createElement("section");
  projectBrowserSelectedProjectExportsPanel.className = "cs-shell__project-browser-exports";
  projectBrowserSelectedProjectExportsPanel.setAttribute("aria-label", "Selected project exports");
  const exportsHeading = document.createElement("h4");
  exportsHeading.textContent = "Project exports";
  projectBrowserSelectedProjectExportsTitle = document.createElement("p");
  projectBrowserSelectedProjectExportsTitle.className = "cs-shell__project-browser-exports-project";
  projectBrowserSelectedProjectExportsTitle.textContent = "Select a saved project";
  projectBrowserSelectedProjectExportsItems = document.createElement("div");
  projectBrowserSelectedProjectExportsItems.className = "cs-shell__project-browser-export-items";
  projectBrowserSelectedProjectExportsItems.setAttribute("aria-live", "polite");

  const exportManifestPreviewSection = document.createElement("section");
  exportManifestPreviewSection.className = "cs-shell__project-browser-export-manifest-preview";
  exportManifestPreviewSection.setAttribute("aria-label", "Export contents");
  const exportManifestPreviewHeading = document.createElement("h5");
  exportManifestPreviewHeading.textContent = "Export contents";
  projectBrowserSelectedProjectExportManifestPreview = document.createElement("div");
  projectBrowserSelectedProjectExportManifestPreview.className =
    "cs-shell__project-browser-export-manifest-preview-body";
  projectBrowserSelectedProjectExportManifestPreview.setAttribute("aria-live", "polite");
  exportManifestPreviewSection.append(
    exportManifestPreviewHeading,
    projectBrowserSelectedProjectExportManifestPreview,
  );

  const exportDetailPreviewSection = document.createElement("section");
  exportDetailPreviewSection.className = "cs-shell__project-browser-export-detail-preview";
  exportDetailPreviewSection.setAttribute("aria-label", "Export details");
  const exportDetailPreviewHeading = document.createElement("h5");
  exportDetailPreviewHeading.textContent = "Export details";
  projectBrowserSelectedProjectExportDetailPreview = document.createElement("div");
  projectBrowserSelectedProjectExportDetailPreview.className =
    "cs-shell__project-browser-export-detail-preview-body";
  projectBrowserSelectedProjectExportDetailPreview.setAttribute("aria-live", "polite");
  exportDetailPreviewSection.append(
    exportDetailPreviewHeading,
    projectBrowserSelectedProjectExportDetailPreview,
  );

  projectBrowserSelectedProjectExportsPanel.append(
    exportsHeading,
    projectBrowserSelectedProjectExportsTitle,
    projectBrowserSelectedProjectExportsItems,
    exportManifestPreviewSection,
    exportDetailPreviewSection,
  );

  const engineRunPreviewSection = document.createElement("section");
  engineRunPreviewSection.className = "cs-shell__project-browser-engine-run-preview";
  engineRunPreviewSection.setAttribute("aria-label", "Engine run readiness");
  const engineRunPreviewHeading = document.createElement("h4");
  engineRunPreviewHeading.textContent = "Engine run readiness";
  projectBrowserSelectedProjectEngineRunPreview = document.createElement("div");
  projectBrowserSelectedProjectEngineRunPreview.className =
    "cs-shell__project-browser-engine-run-preview-body";
  projectBrowserSelectedProjectEngineRunPreview.setAttribute("aria-live", "polite");
  engineRunPreviewSection.append(
    engineRunPreviewHeading,
    projectBrowserSelectedProjectEngineRunPreview,
  );

  const engineActionLaneSection = document.createElement("section");
  engineActionLaneSection.className = "cs-shell__project-browser-engine-action-lane";
  engineActionLaneSection.setAttribute("aria-label", "Engine actions");
  const engineActionLaneHeading = document.createElement("h4");
  engineActionLaneHeading.textContent = "Engine actions";
  projectBrowserSelectedProjectEngineActionLane = document.createElement("div");
  projectBrowserSelectedProjectEngineActionLane.className =
    "cs-shell__project-browser-engine-action-lane-body";
  projectBrowserSelectedProjectEngineActionLane.setAttribute("aria-live", "polite");
  engineActionLaneSection.append(
    engineActionLaneHeading,
    projectBrowserSelectedProjectEngineActionLane,
  );

  projectBrowserPanel.append(kicker, heading, note, projectBrowserSaveButton, projectBrowserRestoreButton, projectBrowserHandoffButton, projectBrowserSummary, projectBrowserSelectedProjectExportsPanel, engineRunPreviewSection, engineActionLaneSection, projectBrowserList);
  anchor.insertAdjacentElement("afterend", projectBrowserPanel);
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
    option.textContent = `${user.label} Â· ${user.email}`;
    authUserSelect.appendChild(option);
  }
  if (context.auth.session?.userId) authUserSelect.value = context.auth.session.userId;
  const signedIn = context.auth.session?.authenticated === true;
  const activeName = context.auth.session?.name || context.identity.currentUser?.name || "Anonymous visitor";
  const authorityRole = context.authority?.actualRole?.value || context.identity.actualRole || "external_user";
  const authoritySource = context.authority?.actualRole?.source || context.identity.actualRoleSource || "safe-fallback";
  if (userAvatar) userAvatar.textContent = initialsFor(activeName);
  if (userName) userName.textContent = activeName;
  syncUserCompanyLogoLookup(context);
  appendDefinitionListRows(authSummary, [
    ["auth status", context.auth.status || "signed-out"],
    ["signed in", signedIn ? "yes" : "no"],
    ["user", activeName],
    ["email", context.auth.session?.email || "none"],
    ["provider", context.auth.session?.provider || "none"],
    ["session id", context.auth.session?.sessionId || "none"],
    ["identity source", context.identity.lookup?.identitySource || "unknown"],
    ["classifier only", context.authority?.subject?.classifierOnly ? "yes" : "no"],
    ["authority", `${authorityRole}:${authoritySource}`],
    ["developer fixture", context.identity.lookup?.usingDeveloperFixture ? "active" : "off"],
    ["OAuth/provider", "deferred"],
    ["password storage", "excluded"],
    ["MFA", "deferred"],
  ]);
  if (signInButton) signInButton.disabled = false;
  if (signOutButton) signOutButton.disabled = false;
  if (useAuthIdentityButton) useAuthIdentityButton.disabled = !signedIn;
}

function renderAccountOverview(context) {
  if (!accountSummary) return;
  const activeName = context.auth.session?.name || context.identity.currentUser?.name || "Anonymous visitor";
  const activeEmail = context.auth.session?.email || context.auth.user?.email || "none";
  const authorityRole = context.authority?.actualRole?.value || context.identity.actualRole || "external_user";
  appendDefinitionListRows(accountSummary, [
    ["identity", `${activeName}${activeEmail !== "none" ? ` Â· ${activeEmail}` : ""}`],
    ["role", authorityRole],
    ["company", context.company.companyName || "No company linked"],
  ]);
}

function renderAuthorityControls({ context }) {
  if (!authoritySummary) return;
  const authority = context.authority || {};
  appendDefinitionListRows(authoritySummary, [
    ["owner", authority.owner || "shell"],
    ["status", authority.status || "fallback"],
    ["source", authority.source || "shell-safe-fallback"],
    ["actual role", authority.actualRole?.value || "external_user"],
    ["role source", authority.actualRole?.source || "safe-fallback"],
    ["live read", authority.nvb?.liveReadStatus || "live-read-unavailable"],
    ["configured", authority.nvb?.liveReadConfigured ? "yes" : "no"],
    ["non-boot-critical", authority.nvb?.nonBootCritical === false ? "no" : "yes"],
    ["NVB matched", authority.nvb?.matched ? "yes" : "no"],
    ["confidence", authority.nvb?.confidence || "none"],
    ["classifier only", authority.subject?.classifierOnly ? "yes" : "no"],
    ["internal classifier", authority.subject?.internalClassifier ? "yes" : "no"],
    ["blacklist", authority.privileges?.blacklist?.active ? "active" : "none"],
    ["restrictions", (authority.privileges?.restrictions || []).join(", ") || "none"],
    ["special visibility", (authority.privileges?.specialVisibility || []).join(", ") || "none"],
    ["exceptional", (authority.privileges?.exceptionalEntitlements || []).join(", ") || "none"],
    ["company authority", authority.companyAuthority?.status || "not-authority"],
    ["developer override", authority.developerSupport?.overrideActive ? "support active" : "off"],
    ["writes", authority.writePolicy?.enabled ? "enabled" : "disabled"],
  ]);
}

function renderCompanyControls({ services, context }) {
  if (!companySelect || !companySummary) return;
  const companies = services.crm.getAvailableCompanies?.() || [];
  clearElement(companySelect);
  const projectOption = document.createElement("option");
  projectOption.value = "";
  projectOption.textContent = "Use current project company context";
  companySelect.appendChild(projectOption);
  for (const company of companies) {
    const option = document.createElement("option");
    option.value = company.companyId;
    option.textContent = `${company.companyName} Â· ${company.domain}`;
    companySelect.appendChild(option);
  }
  companySelect.value = context.crm.selectedCompanyId || "";
  appendDefinitionListRows(companySummary, [
    ["company", context.company.companyName || "No company linked"],
    ["domain", context.company.domain || "none"],
    ["contact", context.crm.contact?.email || "none"],
    ["project", context.company.linkedProjectId || "none"],
  ]);
  renderLocalDeveloperRows({
    anchor: companySummary,
    context,
    id: "cs-shell-company-dev-details",
    label: "Company context details",
    rows: [
      ["owner", context.company.owner || "shell"],
      ["status", context.company.status || "no-company"],
      ["company", context.company.companyName || "No company linked"],
      ["id", context.company.companyId || "none"],
      ["source", context.company.source || "fallback"],
      ["authority", context.authority?.companyAuthority?.status || "not-authority"],
      ["project", context.company.linkedProjectId || "none"],
      ["domain", context.company.domain || "none"],
      ["contact", context.crm.contact?.email || "none"],
      ["association", `${context.crm.association?.status || "none"}:${context.crm.association?.source || "none"}`],
      ["assoc contact", context.crm.association?.contact?.contactId || "none"],
      ["assoc company", context.crm.association?.company?.companyId || "none"],
      ["assoc deal", context.crm.association?.deal?.dealId || "none"],
      ["crm read", `${context.crm.hubspot?.status || "not-run"}:${context.crm.hubspot?.readOnly === false ? "write-risk" : "read-only"}`],
      ["writes", context.crm.writePolicy?.enabled ? "enabled" : "disabled"],
    ],
  });
  if (companyLinkButton) companyLinkButton.disabled = !companySelect.value;
  if (companyProjectButton) companyProjectButton.disabled = false;
  if (companyClearButton) companyClearButton.disabled = false;
}

function renderContextSummary(context) {
  appendDefinitionListRows(contextSummary, [
    ["phase", context.phase],
    ["contract", context.contractVersion || "not-declared"],
    ["module", context.route.moduleId],
    ["auth", `${context.auth.owner}:${context.auth.status}`],
    ["auth user", context.auth.session?.email || context.auth.user?.name || "anonymous"],
    ["classifier identity", context.identity.identityState || "external_anonymous"],
    ["effective role", `${context.identity.actualRole || context.authority.actualRole?.value || "external_user"}:${context.identity.actualRoleSource || context.authority.actualRole?.source || "safe-fallback"}`],
    ["display preview", `${context.identity.displayRole || "external_user"}:preview-only`],
    ["identity source", context.identity.lookup?.identitySource || "unknown"],
    ["authority", `${context.authority.owner}:${context.authority.status}:${context.authority.actualRole?.value}`],
    ["authority source", context.authority.actualRole?.source || "safe-fallback"],
    ["classifier only", context.authority.subject?.classifierOnly ? "yes" : "no"],
    ["project", `${context.project.owner}:${context.project.status}`],
    ["current", readProjectTitle(context.project)],
    ["company", `${context.company.owner}:${context.company.status}:${context.company.companyName}`],
    ["crm writes", context.crm.writePolicy?.enabled ? "enabled" : "disabled"],
    ["browser", `${context.projectBrowser.owner}:${context.projectBrowser.status}`],
    ["visibility", `${context.visibility.owner}:${context.visibility.status}`],
    ["timeline policy", `${context.timelinePolicy?.owner || "shell"}:${context.timelinePolicy?.status || "unavailable"}`],
    ["timeline lane", `${context.timelinePolicy?.rolePolicy?.displayLane || "external"}:${context.timelinePolicy?.rolePolicy?.actualRole || "external_user"}`],
    ["timeline controls", context.timelinePolicy?.controls?.visible ? "visible" : "hidden"],
    ["timeline gate", context.timelinePolicy?.gates?.mode || "unknown"],
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
  const selectedProjectId = currentProjectId(context);
  const currentProject = context.project.currentProject || {};
  clearElement(projectSelect);
  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.projectId;
    option.textContent = project.title;
    projectSelect.appendChild(option);
  }
  projectSelect.value = projects.some((project) => project.projectId === selectedProjectId) ? selectedProjectId : "";
  appendDefinitionListRows(projectSummary, [
    ["project", readProjectTitle(context.project)],
    ["client", currentProject.client || "No client loaded"],
    ["site", currentProject.site || "No site loaded"],
  ]);
  renderLocalDeveloperRows({
    anchor: projectSummary,
    context,
    id: "cs-shell-project-dev-details",
    label: "Project details",
    rows: [
      ["owner", context.project.owner],
      ["status", context.project.status],
      ["project", readProjectTitle(context.project)],
      ["id", selectedProjectId || "none"],
      ["readiness", context.project.metadata?.readiness || "not-ready"],
      ["source", context.project.selection?.source || context.project.metadata?.source || "unknown"],
      ["company", context.company.companyName || "No company linked"],
      ["company source", context.company.source || "fallback"],
      ["authority role", context.authority.actualRole?.value || "external_user"],
      ["restored envelope", context.project.metadata?.restoredEnvelopeId || "none"],
      ["restored at", context.project.metadata?.restoredAt || "none"],
      ["save", context.project.save?.status || "deferred"],
      ["restore", context.project.restore?.status || "deferred"],
      ["hydrate", context.project.hydrate?.status || "idle"],
      ["handoff/share", context.project.handoff?.status || "ready"],
      ["last package", context.project.handoff?.lastPreparedPackageId || "none"],
      ["delivery", context.project.handoff?.externalDelivery ? "live" : "deferred"],
    ],
  });
}

function appendProjectBrowserSelectedProjectEngineRunPreviewField(list, label, value) {
  const term = document.createElement("dt");
  term.textContent = label;
  const detail = document.createElement("dd");
  detail.textContent = String(value);
  list.append(term, detail);
}

function renderProjectBrowserSelectedProjectEngineRunPreview(preview) {
  if (!projectBrowserSelectedProjectEngineRunPreview) return;
  clearElement(projectBrowserSelectedProjectEngineRunPreview);

  const status = document.createElement("p");
  status.className = "cs-shell__project-browser-engine-run-preview-status";
  status.dataset.shellProjectEngineRunPreviewState = preview?.state || "missing";
  status.textContent = preview?.ready === true
    ? "Redacted selected-project engine-run readiness summary."
    : preview?.readiness === "missing"
      ? "No selected-project engine-run readiness preview is available."
      : "Engine-run readiness preview is blocked fail-closed.";
  projectBrowserSelectedProjectEngineRunPreview.appendChild(status);

  if (preview?.ready === true) {
    const fields = document.createElement("dl");
    fields.className = "cs-shell__project-browser-engine-run-preview-fields";
    appendProjectBrowserSelectedProjectEngineRunPreviewField(
      fields,
      "Selected result available",
      preview.selectedResultAvailable,
    );
    appendProjectBrowserSelectedProjectEngineRunPreviewField(
      fields,
      "Selected result accepted",
      preview.selectedResultAccepted,
    );
    appendProjectBrowserSelectedProjectEngineRunPreviewField(
      fields,
      "Engine verified",
      preview.engineVerified,
    );
    appendProjectBrowserSelectedProjectEngineRunPreviewField(
      fields,
      "Runs",
      preview.runCount,
    );
    appendProjectBrowserSelectedProjectEngineRunPreviewField(
      fields,
      "Accepted runs",
      preview.acceptedRunCount,
    );
    appendProjectBrowserSelectedProjectEngineRunPreviewField(
      fields,
      "Engine-verified runs",
      preview.engineVerifiedRunCount,
    );
    projectBrowserSelectedProjectEngineRunPreview.appendChild(fields);
  }

  const note = document.createElement("p");
  note.className = "cs-shell__project-browser-engine-run-preview-note";
  note.textContent =
    "Preview only, redacted, selected-project-only, diagnostic, and non-interactive. No Engine action is available from this surface.";
  projectBrowserSelectedProjectEngineRunPreview.appendChild(note);
}

/* Landed preview contract-lock source shape retained for source inspection:
renderProjectBrowserSelectedProjectEngineRunPreview(
  buildShellProjectBrowserSelectedProjectEngineRunPreview(
    browser.selectedProjectEngineRunReadinessReadbackSummary,
    browser.selectedProjectId,
  ),
);
*/
function renderProjectBrowser({ context }) {
  ensureProjectBrowserPanel();
  if (!projectBrowserSummary || !projectBrowserList) return;
  const browser = context.projectBrowser;
  const save = browser.save || {};
  const restore = browser.restore || {};
  const hydrate = browser.hydrate || {};
  const handoffShare = browser.handoffShare || {};
  const selected = selectedProjectSummary(browser);
  const engineRunPreview =
    buildShellProjectBrowserSelectedProjectEngineRunPreview(
      browser.selectedProjectEngineRunReadinessReadbackSummary,
      browser.selectedProjectId,
    );

  renderProjectBrowserSelectedProjectEngineRunPreview(engineRunPreview);
  renderProjectBrowserSelectedProjectEngineActionLane(
    buildShellProjectBrowserSelectedProjectEngineActionLane(engineRunPreview),
  );
  appendDefinitionListRows(projectBrowserSummary, [
    ["current", browser.currentProject?.title || "No project loaded"],
    ["saved projects", browser.savedCount || 0],
    ["selected", selected?.title || "Select a saved project"],
    ["handoff/share", handoffShare.lastPreparedPackageId || "Ready"],
  ]);
  renderLocalDeveloperRows({
    anchor: projectBrowserSummary,
    context,
    id: "cs-shell-project-actions-dev-details",
    label: "Project action details",
    rows: [
      ["current", browser.currentProject?.title || "No project loaded"],
      ["company", context.company.companyName || "No company linked"],
      ["authority", `${context.authority.actualRole?.value || "external_user"}:${context.authority.actualRole?.source || "safe-fallback"}`],
      ["selected envelope", browser.selectedProjectId || "none"],
      ["selected restore", selected?.restoreEligible ? "enabled" : "disabled"],
      ["runtime saved", browser.savedCount || 0],
      ["fixtures", browser.fixtureCount || 0],
      ["save", save.status || "ready"],
      ["restore", restore.status || "ready"],
      ["hydrate", hydrate.status || "idle"],
      ["handoff/share", handoffShare.status || "ready"],
      ["last package", handoffShare.lastPreparedPackageId || "none"],
      ["delivery", handoffShare.delivery?.externalDelivery ? "live" : "deferred"],
    ],
  });
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
    appendProjectBrowserLine(item, `${project.client} Â· ${project.site}`);
    appendProjectBrowserLine(item, project.restoreEligible ? "Ready to open" : "Reference only");
    projectBrowserList.appendChild(item);
  }
}

function renderProjectBrowserSelectedProjectEngineActionLane(actionLane) {
  if (!projectBrowserSelectedProjectEngineActionLane) return;
  clearElement(projectBrowserSelectedProjectEngineActionLane);

  const status = document.createElement("p");
  status.className = "cs-shell__project-browser-engine-action-lane-status";
  status.dataset.shellProjectEngineActionLaneState = actionLane?.state || "missing";
  status.textContent = actionLane?.sourcePreviewReady === true
    ? "Engine readiness is confirmed, but no selected-project Engine execution capability is mounted."
    : actionLane?.readiness === "missing"
      ? "Select a project with an Engine-run readiness preview."
      : "Engine actions are blocked because the selected-project readiness preview failed closed.";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "cs-shell__project-browser-engine-action-lane-button";
  button.textContent = actionLane?.actions?.[0]?.label || "Run Engine";
  button.disabled = true;

  const note = document.createElement("p");
  note.className = "cs-shell__project-browser-engine-action-lane-note";
  note.textContent =
    "This lane does not execute Engine, generate RunTable output, or persist a selected result.";

  projectBrowserSelectedProjectEngineActionLane.append(status, button, note);
}

function setProjectBrowserSelectedProjectExportsWorkflowDescriptor(workflowDescriptor) {
  const descriptorChanged = projectBrowserSelectedProjectExportsWorkflow !== workflowDescriptor;
  projectBrowserSelectedProjectExportsWorkflow = workflowDescriptor;
  if (descriptorChanged) projectBrowserProjectIesExportDownloadOutcomeState.reset();
  if (descriptorChanged) projectBrowserSelectedProjectExportOutcomeStates.clear();
  return descriptorChanged;
}

function getProjectBrowserSelectedProjectExportOutcomeState(exportId) {
  if (!projectBrowserSelectedProjectExportOutcomeStates.has(exportId)) {
    projectBrowserSelectedProjectExportOutcomeStates.set(
      exportId,
      createShellProjectBrowserProjectIesExportDownloadOutcomeState(),
    );
  }
  return projectBrowserSelectedProjectExportOutcomeStates.get(exportId);
}

function renderProjectBrowserSelectedProjectExportOutcome(
  exportId,
  outcomeSnapshot,
  output,
) {
  const controls = projectBrowserSelectedProjectExportControls.get(exportId);
  if (!controls?.status) return;
  controls.status.dataset.shellProjectIesExportDownloadOutcomeState = outcomeSnapshot.state;
  controls.status.dataset.shellExportId = exportId;

  if (outcomeSnapshot.state
    === SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started) {
    controls.status.textContent =
      `Download started: ${outcomeSnapshot.filename} (${outcomeSnapshot.byteLength} bytes).`;
    return;
  }
  if (outcomeSnapshot.state
    === SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked) {
    controls.status.textContent =
      `${output?.label || "Export"} download blocked: ${outcomeSnapshot.blocker}.`;
    return;
  }

  controls.status.textContent = output?.ready === true
    ? `${output.label} is ready to download.`
    : projectBrowserSelectedProjectExportsWorkflow?.readiness === "missing"
      ? "Select a saved project to check export readiness."
      : `${output?.label || "Export"} is not ready for the selected project.`;
}

function renderProjectBrowserSelectedProjectExportItem(workflowDescriptor, output) {
  const exportId = typeof output?.exportId === "string" ? output.exportId : null;
  if (!projectBrowserSelectedProjectExportsItems || !exportId) return null;

  const item = document.createElement("div");
  item.className = "cs-shell__project-browser-export-item";
  item.dataset.shellExportId = exportId;
  const itemMain = document.createElement("div");
  itemMain.className = "cs-shell__project-browser-export-item-main";
  const itemCopy = document.createElement("div");
  const itemLabel = document.createElement("strong");
  itemLabel.textContent = output.label || "Project export";
  const itemMeta = document.createElement("span");
  itemMeta.textContent = [output.format, output.extension].filter(Boolean).join(" · ")
    || "LM-63 · .ies";
  itemCopy.append(itemLabel, itemMeta);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "cs-shell__project-browser-export-download";
  button.dataset.shellExportId = exportId;
  button.textContent = output.actionLabel || "Download project IES (.ies)";
  button.disabled = output.ready !== true;
  button.title = output.ready === true
    ? `Download the selected project's prepared ${output.format || "export"} output.`
    : `${output.label || "Project export"} is unavailable until the selected project export is ready.`;

  const status = document.createElement("p");
  status.className = "cs-shell__project-browser-export-status";
  itemMain.append(itemCopy, button);
  item.append(itemMain, status);
  projectBrowserSelectedProjectExportsItems.appendChild(item);
  projectBrowserSelectedProjectExportControls.set(
    exportId,
    Object.freeze({ item, button, status }),
  );

  const outcomeState = getProjectBrowserSelectedProjectExportOutcomeState(exportId);
  renderProjectBrowserSelectedProjectExportOutcome(
    exportId,
    outcomeState.getSnapshot(),
    output,
  );
  return item;
}

function renderProjectBrowserSelectedProjectExportItems(workflowDescriptor) {
  if (!projectBrowserSelectedProjectExportsItems) return;
  clearElement(projectBrowserSelectedProjectExportsItems);
  projectBrowserSelectedProjectExportControls.clear();
  const outputs = Array.isArray(workflowDescriptor?.outputs)
    ? workflowDescriptor.outputs
    : [];
  for (const output of outputs) {
    renderProjectBrowserSelectedProjectExportItem(workflowDescriptor, output);
  }
}

function appendProjectBrowserSelectedProjectExportManifestPreviewField(list, label, value) {
  const term = document.createElement("dt");
  term.textContent = label;
  const detail = document.createElement("dd");
  detail.textContent = String(value);
  list.append(term, detail);
}

function renderProjectBrowserSelectedProjectExportManifestPreview(preview) {
  if (!projectBrowserSelectedProjectExportManifestPreview) return;
  clearElement(projectBrowserSelectedProjectExportManifestPreview);

  const status = document.createElement("p");
  status.className = "cs-shell__project-browser-export-manifest-preview-status";
  status.dataset.shellExportManifestPreviewState = preview?.state || "missing";
  status.textContent = preview?.ready === true
    ? "Redacted selected-project export contents summary."
    : preview?.readiness === "missing"
      ? "No selected-project export contents preview is available."
      : "Export contents preview is blocked fail-closed.";
  projectBrowserSelectedProjectExportManifestPreview.appendChild(status);

  if (preview?.ready === true) {
    const fields = document.createElement("dl");
    fields.className = "cs-shell__project-browser-export-manifest-preview-fields";
    appendProjectBrowserSelectedProjectExportManifestPreviewField(
      fields,
      "Run-table rows",
      preview.runTableRowCount,
    );
    appendProjectBrowserSelectedProjectExportManifestPreviewField(
      fields,
      "Candidate outputs",
      preview.candidateOutputRecordCount,
    );
    appendProjectBrowserSelectedProjectExportManifestPreviewField(
      fields,
      "Manifest records",
      preview.manifestRecordCount,
    );
    appendProjectBrowserSelectedProjectExportManifestPreviewField(
      fields,
      "Manifest entries",
      preview.manifestEntryCount,
    );
    appendProjectBrowserSelectedProjectExportManifestPreviewField(
      fields,
      "First output kind",
      preview.firstCandidateOutputKind || "Not reported",
    );
    projectBrowserSelectedProjectExportManifestPreview.appendChild(fields);
  }

  const note = document.createElement("p");
  note.className = "cs-shell__project-browser-export-manifest-preview-note";
  note.textContent =
    "Preview only, redacted, selected-project-only, diagnostic, and non-downloadable. No manifest file is created or exposed.";
  projectBrowserSelectedProjectExportManifestPreview.appendChild(note);
}

function appendProjectBrowserSelectedProjectExportDetailPreviewField(list, label, value) {
  const term = document.createElement("dt");
  term.textContent = label;
  const detail = document.createElement("dd");
  detail.textContent = String(value);
  list.append(term, detail);
}

function renderProjectBrowserSelectedProjectExportDetailPreview(preview) {
  if (!projectBrowserSelectedProjectExportDetailPreview) return;
  clearElement(projectBrowserSelectedProjectExportDetailPreview);

  const status = document.createElement("p");
  status.className = "cs-shell__project-browser-export-detail-preview-status";
  status.dataset.shellExportDetailPreviewState = preview?.state || "missing";
  status.textContent = preview?.ready === true
    ? "Redacted selected-project export details summary."
    : preview?.readiness === "missing"
      ? "No selected-project export details preview is available."
      : "Export details preview is blocked fail-closed.";
  projectBrowserSelectedProjectExportDetailPreview.appendChild(status);

  if (preview?.ready === true) {
    const fields = document.createElement("dl");
    fields.className = "cs-shell__project-browser-export-detail-preview-fields";
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Run-table rows",
      preview.runTableRowCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Candidate outputs",
      preview.candidateOutputRecordCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Manifest records",
      preview.manifestRecordCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Detail records",
      preview.detailRecordCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Detail entries",
      preview.detailEntryCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "First detail kind",
      preview.firstDetailEntryKind || "Not reported",
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "First output kind",
      preview.firstCandidateOutputKind || "Not reported",
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "First manifest kind",
      preview.firstManifestEntryKind || "Not reported",
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "First row kind",
      preview.firstRowKind || "Not reported",
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "First run index",
      preview.firstRunIndex ?? "Not reported",
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "First row accepted",
      preview.firstRowAccepted,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "First row engine verified",
      preview.firstRowEngineVerified,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Boards",
      preview.firstRowBoardCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Segments",
      preview.firstRowSegmentCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Zones",
      preview.firstRowZoneCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Clip points",
      preview.firstRowClipPointsCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Suspension points",
      preview.firstRowSuspensionPointsCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Gear tray plans",
      preview.firstRowGearTrayPlanCount,
    );
    appendProjectBrowserSelectedProjectExportDetailPreviewField(
      fields,
      "Reserved ranges",
      preview.firstRowReservedRangesCount,
    );
    projectBrowserSelectedProjectExportDetailPreview.appendChild(fields);
  }

  const note = document.createElement("p");
  note.className = "cs-shell__project-browser-export-detail-preview-note";
  note.textContent =
    "Preview only, redacted, selected-project-only, diagnostic, detail-only, and non-downloadable. No detail file is created or exposed.";
  projectBrowserSelectedProjectExportDetailPreview.appendChild(note);
}

function renderProjectBrowserSelectedProjectExportsWorkflow(workflowDescriptor) {
  if (!projectBrowserSelectedProjectExportsPanel
    || !projectBrowserSelectedProjectExportsTitle
    || !projectBrowserSelectedProjectExportsItems
    || !projectBrowserSelectedProjectExportManifestPreview
    || !projectBrowserSelectedProjectExportDetailPreview) return;

  setProjectBrowserSelectedProjectExportsWorkflowDescriptor(workflowDescriptor);
  projectBrowserSelectedProjectExportsTitle.textContent =
    workflowDescriptor?.selectedProjectTitle || "Select a saved project";
  renderProjectBrowserSelectedProjectExportItems(workflowDescriptor);
  renderProjectBrowserSelectedProjectExportManifestPreview(
    getShellProjectBrowserSelectedProjectExportManifestPreview(workflowDescriptor),
  );
  renderProjectBrowserSelectedProjectExportDetailPreview(
    getShellProjectBrowserSelectedProjectExportDetailPreview(workflowDescriptor),
  );
}

async function refreshProjectBrowserSelectedProjectExportsWorkflow({ services, context }) {
  const refreshSequence = ++projectBrowserSelectedProjectExportsRefreshSequence;
  setProjectBrowserSelectedProjectExportsWorkflowDescriptor(null);
  for (const controls of projectBrowserSelectedProjectExportControls.values()) {
    controls.button.disabled = true;
  }
  projectBrowserSelectedProjectExportControls.clear();
  if (projectBrowserSelectedProjectExportsItems) {
    clearElement(projectBrowserSelectedProjectExportsItems);
    const checking = document.createElement("p");
    checking.className = "cs-shell__project-browser-export-status";
    checking.textContent = "Checking project IES export readiness...";
    projectBrowserSelectedProjectExportsItems.appendChild(checking);
  }
  if (projectBrowserSelectedProjectExportManifestPreview) {
    clearElement(projectBrowserSelectedProjectExportManifestPreview);
    const checking = document.createElement("p");
    checking.className = "cs-shell__project-browser-export-manifest-preview-status";
    checking.textContent = "Checking selected-project export contents...";
    projectBrowserSelectedProjectExportManifestPreview.appendChild(checking);
  }
  if (projectBrowserSelectedProjectExportDetailPreview) {
    clearElement(projectBrowserSelectedProjectExportDetailPreview);
    const checking = document.createElement("p");
    checking.className = "cs-shell__project-browser-export-detail-preview-status";
    checking.textContent = "Checking selected-project export details...";
    projectBrowserSelectedProjectExportDetailPreview.appendChild(checking);
  }

  const workflowDescriptor =
    await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
      context,
      services,
      browserDocument: globalThis.document,
      browserUrlApi: globalThis.URL,
    });
  if (refreshSequence !== projectBrowserSelectedProjectExportsRefreshSequence) return;
  renderProjectBrowserSelectedProjectExportsWorkflow(workflowDescriptor);
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
  noFixtureOption.textContent = "No fixture active â€” use auth/anonymous source";
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
    ["classifier only", context.authority.subject?.classifierOnly ? "yes" : "no"],
    ["identity source", context.identity.lookup?.identitySource || "unknown"],
    ["developer fixture", context.identity.lookup?.usingDeveloperFixture ? "active" : "off"],
    ["authority role", context.authority.actualRole?.value || "external_user"],
    ["role source", context.authority.actualRole?.source || "safe-fallback"],
    ["override active", context.identity.actualRoleOverrideEnabled ? "yes" : "no"],
    ["display preview", context.visibility.inputs?.displayRole || context.identity.displayRole],
    ["preview clamped", context.visibility.inputs?.displayRoleClamped ? "yes" : "no"],
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
    ["mode", "NVB-backed authority / developer visibility support"],
    ["authenticated", context.auth.session?.authenticated ? "yes" : "no"],
    ["authority", `${context.authority.actualRole?.value || "external_user"}:${context.authority.actualRole?.source || "safe-fallback"}`],
    ["display role", context.visibility.inputs?.displayRole || context.identity.displayRole],
    ["preview only", "yes"],
    ["blacklist", context.authority.privileges?.blacklist?.active ? "active" : "none"],
    ["restrictions", (context.authority.privileges?.restrictions || []).join(", ") || "none"],
    ["project input", context.visibility.inputs?.projectMode || "auto"],
    ["visible", visible],
    ["hidden", hidden],
    ["route reason", currentDecision?.reason || "not_registered"],
  ]);
}

function renderProjectTopbarPopout(context) {
  if (!projectPopoutList || !projectPopoutActions) return;
  clearElement(projectPopoutList);
  clearElement(projectPopoutActions);
  const selectedProjectId = currentProjectId(context);
  if (projectPopoutTitle) projectPopoutTitle.textContent = currentProjectTitle(context);
  for (const option of Array.from(projectSelect?.options || [])) {
    const item = createShellButton(option.textContent, "cs-shell__popout-row");
    item.dataset.projectId = option.value;
    if (option.value === selectedProjectId) item.classList.add("is-selected");
    item.addEventListener("click", () => {
      dispatchLegacyChange(projectSelect, option.value);
      setPopout(projectChip, projectPopout, false);
    });
    projectPopoutList.appendChild(item);
  }
  const newProject = createShellButton("New project later", "cs-shell__popout-button cs-shell__popout-button--disabled");
  newProject.disabled = true;
  const save = createShellButton("Save project");
  save.addEventListener("click", () => clickLegacy(".cs-shell__project-browser-save"));
  const restore = createShellButton("Restore / open project");
  restore.addEventListener("click", () => clickLegacy(".cs-shell__project-browser-restore"));
  const handoff = createShellButton("Prepare handoff/share");
  handoff.addEventListener("click", () => clickLegacy(".cs-shell__project-browser-handoff"));
  projectPopoutActions.append(newProject, save, restore, handoff);
}

function renderCompanyTopbarPopout(context) {
  if (!companyPopoutList || !companyPopoutActions) return;
  clearElement(companyPopoutList);
  clearElement(companyPopoutActions);
  const selectedCompanyId = context.crm?.selectedCompanyId || "";
  for (const option of Array.from(companySelect?.options || [])) {
    const item = createShellButton(option.textContent, "cs-shell__popout-row");
    item.dataset.companyId = option.value;
    if (option.value === selectedCompanyId) item.classList.add("is-selected");
    item.addEventListener("click", () => {
      dispatchLegacyChange(companySelect, option.value);
      if (option.value) companyLinkButton?.click?.();
      setPopout(companyChip, companyPopout, false);
    });
    companyPopoutList.appendChild(item);
  }
  const useProject = createShellButton("Use project company");
  useProject.addEventListener("click", () => companyProjectButton?.click?.());
  const clearCompany = createShellButton("Clear company", "cs-shell__popout-button cs-shell__popout-button--secondary");
  clearCompany.addEventListener("click", () => companyClearButton?.click?.());
  companyPopoutActions.append(useProject, clearCompany);
}

function appendTimelineText(parent, text, tagName = "p") {
  const element = document.createElement(tagName);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function appendTimelineDefinitionRows(parent, rows) {
  const list = document.createElement("dl");
  list.className = "cs-shell__inline-summary";
  appendDefinitionListRows(list, rows);
  parent.appendChild(list);
  return list;
}

function renderTimelineTopbarPopout(context) {
  if (!timelinePopout) return;
  clearElement(timelinePopout);
  const timeline = context.timelinePolicy || {};
  const model = timeline.timelineModel || {};
  const requirement = model.projectRequirementDate || {};
  const requirementLabel = requirement.label || timeline.projectDateContext?.projectRequirementDateLabel || "Not set";

  const kicker = document.createElement("p");
  kicker.className = "cs-shell__section-kicker";
  kicker.textContent = "Timeline";
  const heading = document.createElement("h3");
  heading.textContent = model.defaultLane?.label || "Today / Live";
  timelinePopout.append(kicker, heading);

  appendTimelineDefinitionRows(timelinePopout, [
    ["Project requirement date", requirementLabel === "not set" ? "Not set" : requirementLabel],
    ["Future product access", "Contact your rep"],
    ["Special parts", "No special parts are active for this project yet"],
  ]);
  appendTimelineText(timelinePopout, "Live products are available today. Future products and special parts will use the project requirement date when access is enabled.");

  const chipRow = document.createElement("div");
  chipRow.className = "cs-shell__chip-row";
  chipRow.setAttribute("aria-label", "Timeline summary");
  for (const label of ["Today / Live", `Requirement date: ${requirementLabel === "not set" ? "Not set" : requirementLabel}`, "Future product access: Contact your rep", "Special parts: none active"]) {
    const chip = document.createElement("span");
    chip.className = label === "Today / Live" ? "cs-shell__filter-chip is-selected" : "cs-shell__filter-chip";
    chip.textContent = label;
    chipRow.appendChild(chip);
  }
  timelinePopout.appendChild(chipRow);
}

function renderViewTopbarPopout(context) {
  if (!viewPopoutList) return;
  clearElement(viewPopoutList);
  if (!canViewModeToggle(context)) {
    setPopout(viewChip, viewPopout, false);
    return;
  }
  const selected = displayShellRole(context);
  const authority = actualShellRole(context);
  for (const option of Array.from(displayRoleSelect?.options || [])) {
    if (roleRank(option.value) > roleRank(authority)) continue;
    const item = createShellButton(option.textContent, "cs-shell__popout-row");
    item.dataset.viewRole = option.value;
    if (option.value === selected) item.classList.add("is-selected");
    if (option.value === authority) item.classList.add("is-default-view");
    item.addEventListener("click", () => {
      dispatchLegacyChange(displayRoleSelect, option.value);
      setPopout(viewChip, viewPopout, false);
    });
    viewPopoutList.appendChild(item);
  }
}

function appendInspectorRows(list, rows) {
  for (const [label, value] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = String(value ?? "none");
    list.append(dt, dd);
  }
}

function createInspectorSection(title, rows) {
  const section = document.createElement("section");
  section.className = "cs-shell__context-inspector-section";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const list = document.createElement("dl");
  appendInspectorRows(list, rows);
  section.append(heading, list);
  return section;
}

function renderShellContextInspector(context) {
  if (!contextInspectorContent) return;
  clearElement(contextInspectorContent);
  const project = context.project || {};
  const company = context.company || {};
  const crm = context.crm || {};
  const browser = context.projectBrowser || {};
  const authority = context.authority || {};
  const timeline = context.timelinePolicy || {};
  const visibility = context.visibility || {};
  const specialParts = authority.privileges?.specialVisibility || [];
  contextInspectorContent.append(
    createInspectorSection("Current Project", [
      ["selected project id", currentProjectId(context) || "none"],
      ["project title", currentProjectTitle(context)],
      ["project source", project.selection?.source || project.metadata?.source || project.source || "unknown"],
      ["project status", project.status || "unknown"],
      ["readiness", project.metadata?.readiness || project.currentProject?.readiness || "not-ready"],
      ["restored envelope id", project.metadata?.restoredEnvelopeId || project.selection?.restoredEnvelopeId || "none"],
      ["restored at", project.metadata?.restoredAt || "none"],
      ["selected metadata", JSON.stringify(project.metadata || {})],
    ]),
    createInspectorSection("Company Context", [
      ["company name", company.companyName || "No company linked"],
      ["company id", company.companyId || "none"],
      ["domain", company.domain || "none"],
      ["source", company.source || "fallback"],
      ["CRM/HubSpot match", crm.hubspot?.status || crm.status || "not-run"],
      ["contact email", crm.contact?.email || "none"],
      ["association status", `${crm.association?.status || "none"}:${crm.association?.source || "none"}`],
      ["associated contact id", crm.association?.contact?.contactId || "none"],
      ["associated company id", crm.association?.company?.companyId || "none"],
      ["associated deal id", crm.association?.deal?.dealId || "none"],
      ["read/write policy", crm.writePolicy?.enabled ? "writes enabled" : "read-only / writes disabled"],
    ]),
    createInspectorSection("Project Actions", [
      ["save state", project.save?.status || browser.save?.status || "unknown"],
      ["restore state", project.restore?.status || browser.restore?.status || "unknown"],
      ["hydrate state", project.hydrate?.status || browser.hydrate?.status || "unknown"],
      ["handoff/share state", project.handoff?.status || browser.handoffShare?.status || "unknown"],
      ["last package id", project.handoff?.lastPreparedPackageId || browser.handoffShare?.lastPreparedPackageId || "none"],
      ["external/deferred delivery", project.handoff?.externalDelivery || browser.handoffShare?.delivery?.externalDelivery ? "live" : "deferred"],
      ["selected envelope", browser.selectedProjectId || "none"],
      ["saved count", browser.savedCount || 0],
      ["fixture count", browser.fixtureCount || 0],
    ]),
    createInspectorSection("Timeline Context", [
      ["model question", timeline.timelineModel?.question || "not configured"],
      ["active lane", timeline.timelineModel?.defaultLane?.label || "Today / Live"],
      ["project requirement date", timeline.timelineModel?.projectRequirementDate?.label || timeline.projectDateContext?.projectRequirementDateLabel || "not set"],
      ["timeline access", timeline.timelineModel?.timelineAccess?.label || "not enabled / placeholder"],
      ["future products", timeline.timelineModel?.futureProducts?.status || "contact-rep"],
      ["special parts", timeline.timelineModel?.specialParts?.status || "entitlement-check-later"],
      ["lifecycle compatibility", timeline.timelineModel?.lifecycleCompatibility?.status || "staged/scheduled supported"],
      ["selector filtering", timeline.timelineModel?.implementation?.selectorFiltering ? "live" : "not implemented"],
      ["external/internal restrictions", timeline.gates?.mode || "shell placeholder"],
      ["controls visible", timeline.controls?.visible ? "yes" : "no"],
    ]),
    createInspectorSection("View Mode / Authority", [
      ["actual authority role", actualShellRole(context)],
      ["display/preview role", displayShellRole(context)],
      ["source of authority", authority.actualRole?.source || context.identity?.actualRoleSource || "safe-fallback"],
      ["current view default", displayShellRole(context) === actualShellRole(context) ? "yes" : "no"],
      ["preview mode active", displayShellRole(context) === actualShellRole(context) ? "no" : "yes"],
      ["visibility status", visibility.status || "unknown"],
    ]),
    createInspectorSection("Special Parts", [
      ["entitlement source", specialParts.length ? "authority privilege placeholder" : "none available in shell context"],
      ["available special parts", specialParts.join(", ") || "none"],
      ["selected special parts", "not implemented in Slice 1A"],
      ["skipped/dismissed state", "not implemented in Slice 1A"],
      ["opt-in timestamp/state", "not implemented in Slice 1A"],
    ]),
    createInspectorSection("CRM / NVB / Source Details", [
      ["NVB lookup state", authority.nvb?.liveReadStatus || "live-read-unavailable"],
      ["NVB configured", authority.nvb?.liveReadConfigured ? "yes" : "no"],
      ["NVB matched", authority.nvb?.matched ? "yes" : "no"],
      ["CRM lookup state", crm.hubspot?.status || crm.status || "not-run"],
      ["company/domain inference", `${company.source || "fallback"}:${company.domain || "no-domain"}`],
      ["fallback/safe-default state", `${authority.status || "fallback"}:${authority.source || "shell-safe-fallback"}`],
    ])
  );
}

function renderShellTopbarContext(context) {
  if (projectChipLabel) projectChipLabel.textContent = currentProjectTitle(context);
  const companyChipWrap = companyChip?.closest?.(".cs-shell__topbar-chip-wrap");
  if (companyChipWrap) companyChipWrap.hidden = true;
  if (companyPopout) companyPopout.hidden = true;
  const viewToggleVisible = canViewModeToggle(context);
  if (viewChipWrap) viewChipWrap.hidden = !viewToggleVisible;
  if (!viewToggleVisible) setPopout(viewChip, viewPopout, false);
  if (viewChipLabel) {
    const viewRole = displayShellRole(context);
    const isDefaultView = viewRole === actualShellRole(context);
    clearElement(viewChipLabel);
    const roleText = document.createElement("span");
    roleText.textContent = shellRoleAbbreviation(viewRole);
    viewChipLabel.appendChild(roleText);
    if (isDefaultView) {
      const defaultDot = document.createElement("span");
      defaultDot.className = "cs-shell__view-default-dot";
      defaultDot.setAttribute("aria-label", "Current view");
      defaultDot.title = "Current view";
      viewChipLabel.appendChild(defaultDot);
    } else {
      const previewText = document.createElement("span");
      previewText.className = "cs-shell__view-preview-label";
      previewText.textContent = "preview";
      viewChipLabel.appendChild(previewText);
    }
  }
  if (startPanel) startPanel.hidden = isSignedIn(context) && hasProject(context);
  const developerVisible = canViewDeveloperDetails(context);
  if (contextInspectorButton) contextInspectorButton.hidden = !developerVisible;
  if (!developerVisible && contextInspector) {
    contextInspector.hidden = true;
    contextInspectorButton?.setAttribute("aria-expanded", "false");
  }
  renderTimelineTopbarPopout(context);
  renderProjectTopbarPopout(context);
  renderCompanyTopbarPopout(context);
  renderViewTopbarPopout(context);
  renderShellContextInspector(context);
}

function bindShellTopbarControls() {
  if (shellTopbarBound) return;
  shellTopbarBound = true;
  shellSearchButton?.addEventListener("click", () => {
    const open = shellSearchButton.getAttribute("aria-expanded") !== "true";
    setShellSearchOpen(open, { focusInput: true });
  });
  shellSearchClose?.addEventListener("click", () => setShellSearchOpen(false, { restoreFocus: true }));
  shellSearchInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    setShellSearchOpen(false, { restoreFocus: true });
  });
  timelineChip?.addEventListener("click", () => toggleTopbarPopout(timelineChip, timelinePopout));
  projectChip?.addEventListener("click", () => toggleTopbarPopout(projectChip, projectPopout));
  companyChip?.addEventListener("click", () => toggleTopbarPopout(companyChip, companyPopout));
  viewChip?.addEventListener("click", () => toggleTopbarPopout(viewChip, viewPopout));
  contextInspectorButton?.addEventListener("click", () => {
    const context = window.__csLatestShellContext;
    if (!context || !canViewDeveloperDetails(context)) return;
    const open = contextInspector?.hidden !== false;
    if (contextInspector) contextInspector.hidden = !open;
    contextInspectorButton.setAttribute("aria-expanded", open ? "true" : "false");
    renderShellContextInspector(context);
  });
  contextInspectorClose?.addEventListener("click", () => {
    if (contextInspector) contextInspector.hidden = true;
    contextInspectorButton?.setAttribute("aria-expanded", "false");
  });
  startAccountButton?.addEventListener("click", () => userMenuButton?.click?.());
  startProjectButton?.addEventListener("click", () => toggleTopbarPopout(projectChip, projectPopout));
  document.addEventListener("click", (event) => {
    const insideSearch = event.target.closest?.(".cs-shell__topbar-search");
    const insideTopbarPopout = event.target.closest?.(".cs-shell__topbar-chip-wrap");
    const clickedInspector = event.target.closest?.("#cs-shell-context-inspector, #cs-shell-context-inspector-button");
    const insideUserMenu = event.target.closest?.(".cs-shell__user-menu");
    if (!insideSearch) setShellSearchOpen(false, { restoreFocus: false });
    if (!insideTopbarPopout && !clickedInspector) closeTopbarPopouts(null);
    if (!insideUserMenu) setUserMenuOpen(false);
  });
  authUserSelect?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    setUserMenuOpen(false);
  });
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setShellSearchOpen(true, { focusInput: true });
      return;
    }
    if (event.key !== "Escape") return;
    setShellSearchOpen(false, { restoreFocus: false });
    closeTopbarPopouts(null);
    closeTransientRailGroups();
    if (contextInspector) contextInspector.hidden = true;
    contextInspectorButton?.setAttribute("aria-expanded", "false");
  });
}

function markActiveLink(moduleId) {
  for (const link of document.querySelectorAll("[data-module-link]")) {
    const linkModuleId = link.getAttribute("data-module-link");
    const decision = window.__csLatestShellContext?.visibility?.moduleReasons?.[linkModuleId];
    const protectedModule = link.dataset.shellProtectedModule === "true";
    const hiddenByVisibility = decision && !decision.visible;
    if (protectedModule) link.hidden = Boolean(hiddenByVisibility);
    if (hiddenByVisibility) {
      link.setAttribute("aria-disabled", "true");
      link.dataset.visibilityReason = decision.reason;
      link.title = `Hidden in current visibility preview: ${decision.reason}`;
    } else {
      link.removeAttribute("aria-disabled");
      delete link.dataset.visibilityReason;
      link.removeAttribute("title");
    }
    if (isSameModuleRoute(linkModuleId, moduleId)) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }

  for (const group of document.querySelectorAll(".cs-shell__rail-group")) {
    const hasActiveChild = Boolean(group.querySelector(':scope > .cs-shell__rail-group-items [aria-current="page"]'));
    if (hasActiveChild) group.dataset.shellNavActive = "true";
    else delete group.dataset.shellNavActive;
  }
}

function moduleLabel(moduleId) {
  const labels = {
    cs_selector: "Selector",
    scene_builder: "Scene Builder",
    emergence: "Emergency / EGRES",
    egres: "Emergency / EGRES",
    admin_dev: "Database Sync",
    board_data: "Board Data",
    ies_builder: "IES Builder / Photometry",
    compliance_matters: "Compliance Matters",
    knowledge_base: "Knowledge Base",
    knowledge_spine: "Knowledge Spine",
    canonical_language: "Canonical Language",
    controlled_records: "Controlled Records / Ledger",
    workspace_home: "Home",
    novon_website: "Novon website",
  };
  return labels[moduleId] || moduleId;
}

function renderModuleDeveloperSurface(context) {
  if (!moduleHost) return;
  const debugSurface = moduleHost.querySelector(":scope > .cs-selector-proof");
  if (!debugSurface || debugSurface.closest(".cs-shell__local-dev-body")) return;

  let userSurface = moduleHost.querySelector(":scope > .cs-shell__module-user-surface");
  if (!userSurface) {
    userSurface = document.createElement("article");
    userSurface.className = "cs-shell__module-user-surface";
    const eyebrow = document.createElement("p");
    eyebrow.className = "cs-shell__eyebrow";
    eyebrow.textContent = moduleLabel(context.route.moduleId);
    const heading = document.createElement("h2");
    heading.textContent = `${moduleLabel(context.route.moduleId)} workspace`;
    const body = document.createElement("p");
    body.textContent = "The shell has mounted this module. User-facing module controls will replace the migration surface as the module is reimplemented.";
    userSurface.append(eyebrow, heading, body);
    debugSurface.insertAdjacentElement("beforebegin", userSurface);
  }

  const details = ensureLocalDeveloperDetails(userSurface, `cs-shell-${context.route.moduleId}-module-dev-details`, "Module implementation details");
  if (!details) return;
  const visible = canViewDeveloperDetails(context);
  details.hidden = !visible;
  if (!visible) details.open = false;
  const body = details.querySelector(".cs-shell__local-dev-body");
  if (!body) return;
  clearElement(body);
  body.appendChild(debugSurface);
}

function renderUnknownModuleFallback({ route, registry }) {
  if (moduleHost) moduleHost.hidden = false;
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

function renderNovonWebsiteView() {
  if (!moduleHost) return;
  shellRoot?.setAttribute("data-shell-special-view", NOVON_WEBSITE_MODULE_ID);
  moduleHost.classList.add("cs-shell__module-host--website-viewer");
  clearElement(moduleHost);
  const article = document.createElement("article");
  article.className = "cs-shell__website-viewer";
  article.innerHTML = `
    <div class="cs-shell__website-frame-wrap">
      <iframe class="cs-shell__website-frame" title="Novon website" src="${NOVON_WEBSITE_URL}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </div>
  `;
  moduleHost.append(article);
}

function showHomeIfRequested(moduleId) {
  const shouldShowHome = moduleId === "workspace_home";
  if (homePanel) homePanel.hidden = !shouldShowHome;
  if (moduleHost) moduleHost.hidden = shouldShowHome;
  if (shouldShowHome) clearElement(moduleHost);
  return shouldShowHome;
}

function renderMountFailure(route) {
  if (moduleHost) moduleHost.hidden = false;
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
      pluginHost.hidden = true;
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
      renderDeveloperOnlyContainer(pluginHost, getContext(), "Optional diagnostics panel");
      onPluginReady?.({ diagnosticsPlugin, pluginRegistry });
      services.eventBus.emit("plugin:mounted", { pluginId, optional: true, postRender: true });
    } catch (error) {
      console.warn("[workspace-shell] optional diagnostics plugin failed", error);
      pluginRegistry.markFailed(pluginId, error);
      renderPluginFailure({ pluginId, error });
      renderDeveloperOnlyContainer(pluginHost, getContext(), "Optional diagnostics panel");
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
    renderAccountOverview(context);
    renderDeveloperDiagnosticsAccess(context);
    renderAuthorityControls({ context });
    renderCompanyControls({ services, context });
    renderContextSummary(context);
    renderProjectSelection({ services, context });
    renderProjectBrowser({ context });
    void refreshProjectBrowserSelectedProjectExportsWorkflow({ services, context }).catch((error) => {
      console.error("[workspace-shell] selected-project exports workflow failed", error);
      setProjectBrowserSelectedProjectExportsWorkflowDescriptor(null);
      for (const controls of projectBrowserSelectedProjectExportControls.values()) {
        controls.button.disabled = true;
      }
      projectBrowserSelectedProjectExportControls.clear();
      if (projectBrowserSelectedProjectExportsItems) {
        clearElement(projectBrowserSelectedProjectExportsItems);
        const blocked = document.createElement("p");
        blocked.className = "cs-shell__project-browser-export-status";
        blocked.textContent = "Project IES is not ready for the selected project.";
        projectBrowserSelectedProjectExportsItems.appendChild(blocked);
      }
      renderProjectBrowserSelectedProjectExportManifestPreview(null);
      renderProjectBrowserSelectedProjectExportDetailPreview(null);
    });
    renderIdentityVisibilityControls({ services, context });
    renderShellTopbarContext(context);
    renderModuleStatusRegistryPanel();
    renderDeveloperOnlyContainer(pluginHost, context, "Optional diagnostics panel");
    markActiveLink(route.moduleId);
    renderModuleStatusRail();
    mountedModuleApi?.update?.(context);
    renderModuleDeveloperSurface(context);
    if (diagnosticsPluginApi && diagnosticsPluginRegistry) {
      diagnosticsPluginApi.update?.({
        context,
        pluginContext: buildPluginContext({ pluginRegistry: diagnosticsPluginRegistry, registry, route }),
      });
      renderDeveloperOnlyContainer(pluginHost, context, "Optional diagnostics panel");
    }
    services.eventBus.emit("shell:context-updated", { reason, context });
    return context;
  }

  function refreshContextSafely(reason = "context-refresh") {
    try {
      return refreshContext(reason);
    } catch (error) {
      console.error("[workspace-shell] context render failed", error);
      setStatus(`Shell render recovered after ${reason}; interactions remain bound.`);
      services.eventBus.emit("shell:context-render-failed", { reason, error });
      return context;
    }
  }

  function rememberDiagnosticsPlugin({ diagnosticsPlugin, pluginRegistry }) {
    diagnosticsPluginApi = diagnosticsPlugin;
    diagnosticsPluginRegistry = pluginRegistry;
  }

  function handleUserMenuToggle() {
    const isOpen = userMenuButton?.getAttribute("aria-expanded") !== "true";
    setUserMenuOpen(isOpen);
  }

  function handleAuthSignIn() {
    const result = services.auth.signIn(authUserSelect?.value || undefined, "real-login-auth-ui-sign-in");
    services.identity.useAuthenticatedIdentity("real-login-auth-ui-sign-in-sync");
    const nextContext = refreshContext("auth-sign-in");
    if (!result.accepted) {
      setStatus(`Sign in failed: ${result.reason || result.status}`);
      return;
    }
    setUserMenuOpen(false);
    setStatus(`Signed in as ${nextContext.auth.session.name}. Actual role source: ${nextContext.authority.actualRole?.source}.`);
  }

  function handleAuthSignOut() {
    services.auth.signOut("real-login-auth-ui-sign-out");
    services.identity.syncFromAuth("real-login-auth-ui-sign-out-sync");
    const nextContext = refreshContext("auth-sign-out");
    setUserMenuOpen(false);
    setStatus(`${nextContext.auth.reason || "Signed out."} Authority is ${nextContext.authority.actualRole?.source}; shell is using safe anonymous fallback.`);
  }

  function handleUseAuthenticatedIdentity() {
    services.identity.useAuthenticatedIdentity("real-login-auth-ui-use-authenticated-identity");
    const nextContext = refreshContext("use-authenticated-identity");
    setStatus(`Using authenticated identity source: ${nextContext.identity.currentUser.name}. Authority source: ${nextContext.authority.actualRole?.source}.`);
  }

  function handleCompanyLink() {
    const result = services.crm.linkCompanyToCurrentProject(companySelect?.value, context, "shell-company-fixture-linked");
    const nextContext = refreshContext("company-context-linked");
    if (!result.accepted) {
      setStatus(`Company context link failed: ${result.reason || result.status}`);
      return;
    }
    setStatus(`Company context linked: ${nextContext.company.companyName}. Company context remains CRM enrichment only.`);
  }

  function handleCompanyProjectFallback() {
    const result = services.crm.useProjectCompanyContext(context, "shell-company-project-context-selected");
    const nextContext = refreshContext("company-context-project-linked");
    if (!result.accepted) {
      setStatus(`Project company context failed: ${result.reason || result.status}`);
      return;
    }
    setStatus(`Using project-linked company context: ${nextContext.company.companyName}. CRM writes remain disabled.`);
  }

  function handleCompanyClear() {
    services.crm.clearCompanyContext(context, "shell-company-context-cleared");
    const nextContext = refreshContext("company-context-cleared");
    setStatus(`${nextContext.company.companyName}. CRM writes remain disabled.`);
  }

  function handleProjectSelectionChange(event) {
    const result = services.project.selectProject(event.target.value, "shell-project-selector-change");
    if (!result.accepted) {
      setStatus(`Project switch failed: ${result.reason}`);
      return;
    }
    const nextContext = refreshContext("project-switch");
    setStatus(`Selected ${readProjectTitle(nextContext.project)}. Authority source: ${nextContext.authority.actualRole?.source}.`);
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

  function handleProjectBrowserSelectedProjectExportAction(event) {
    const button = event.target.closest?.("button[data-shell-export-id]");
    const exportId = button?.dataset?.shellExportId;
    if (!exportId) return;

    const output = projectBrowserSelectedProjectExportsWorkflow?.outputs?.find(
      (candidate) => candidate?.exportId === exportId,
    );
    const control = projectBrowserSelectedProjectExportControls.get(exportId);
    const outcomeState = projectBrowserSelectedProjectExportOutcomeStates.get(exportId);
    if (!output || !control || !outcomeState || control.button !== button) return;

    handleProjectBrowserProjectIesExportDownload({
      exportId,
      output,
      control,
      outcomeState,
      preparedAction: getShellProjectBrowserSelectedProjectExportAction(
        projectBrowserSelectedProjectExportsWorkflow,
        exportId,
      ),
    });
  }

  function handleProjectBrowserProjectIesExportDownload() {
    const {
      exportId,
      output,
      control,
      outcomeState,
      preparedAction,
    } = arguments[0] || {};
    if (typeof preparedAction !== "function") {
      const outcomeSnapshot = outcomeState.recordBlocked(
        "project-ies-export-download-action-unavailable",
      );
      renderProjectBrowserSelectedProjectExportOutcome(exportId, outcomeSnapshot, output);
      setStatus(`${output?.label || "Project export"} is not ready for the selected project.`);
      return;
    }

    control.button.disabled = true;
    try {
      const receipt = preparedAction();
      const outcomeSnapshot = outcomeState.recordReceipt(receipt);
      renderProjectBrowserSelectedProjectExportOutcome(exportId, outcomeSnapshot, output);
      setStatus(outcomeSnapshot.state
        === SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started
        ? `${output.label} download started.`
        : `${output.label} download was blocked safely.`);
    } catch {
      const outcomeSnapshot = outcomeState.recordBlocked(
        "project-ies-export-download-action-failed",
      );
      renderProjectBrowserSelectedProjectExportOutcome(exportId, outcomeSnapshot, output);
      setStatus(`${output?.label || "Project export"} download was blocked safely.`);
    } finally {
      control.button.disabled = output?.ready !== true;
    }
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
    if (!event.target.value) {
      services.identity.useAuthenticatedIdentity("developer-fixture-cleared-use-auth-or-anonymous");
      const nextContext = refreshContext("developer-fixture-cleared");
      setStatus(`Developer fixture cleared. Current identity source: ${nextContext.identity.lookup?.identitySource || "anonymous-fallback"}.`);
      return;
    }
    const result = services.identity.setIdentityById(event.target.value, "developer-fixture-identity-selection-change");
    if (!result.accepted) {
      setStatus(`Developer fixture lookup failed: ${result.reason}`);
      return;
    }
    const nextContext = refreshContext("developer-fixture-identity-change");
    setStatus(`Developer fixture identity active: ${nextContext.identity.currentUser.name}. This is not NVB authority.`);
  }

  function handleRoleOverrideToggle(event) {
    const result = services.identity.setActualRoleOverrideEnabled(event.target.checked, "developer-test-actual-role-override-toggle");
    const nextContext = refreshContext("actual-role-override-toggle");
    const stateText = nextContext.identity.actualRoleOverrideEnabled ? "enabled" : "off";
    const clampText = result.clamped ? " Display role was clamped to authority." : "";
    setStatus(`Developer/test actual-role override ${stateText}. NVB authority remains ${nextContext.authority.actualRole?.source}.${clampText}`);
  }

  function handleRoleOverrideChange(event) {
    const result = services.identity.setActualRoleOverride(event.target.value, "developer-test-actual-role-override-change");
    const nextContext = refreshContext("actual-role-override-change");
    const clampText = result.clamped ? " Display role was clamped to authority." : "";
    setStatus(`Developer/test override support role: ${nextContext.identity.actualRole}. NVB authority remains ${nextContext.authority.actualRole?.value}.${clampText}`);
  }

  function handleDisplayRoleChange(event) {
    const result = services.identity.setDisplayRole(event.target.value, "display-role-preview-change");
    const nextContext = refreshContext("display-role-change");
    const clampText = result.clamped || nextContext.visibility.inputs?.displayRoleClamped ? " Requested role was clamped to authority." : "";
    setStatus(`Display role preview only: ${nextContext.visibility.inputs?.displayRole || nextContext.identity.displayRole}.${clampText}`);
  }

  function handleProjectModeChange(event) {
    services.visibility.setProjectMode(event.target.value, context, "nvb-authority-project-visibility-mode-change");
    const nextContext = refreshContext("project-visibility-mode-change");
    setStatus(`Visibility project input: ${nextContext.visibility.inputs.projectMode}.`);
  }

  registry.register("cs_selector", csSelectorModule);
  registry.register("emergence", emergenceModule);
  registry.register("egres", emergenceModule);
  registry.register("scene_builder", sceneBuilderModule);
  registry.register("admin_dev", adminDevModule);
  registry.register("board_data", boardDataModule);
  registry.register("ies_builder", iesBuilderModule);
  registry.register("compliance_matters", complianceMattersModule);
  registry.register("coordinated_surfaces", coordinatedSurfacesModule);
  registry.register("lab_proof", labProofModule);
  registry.register("knowledge_base", knowledgeBaseModule);
  registry.register("knowledge_spine", knowledgeSpineModule);
  registry.register("canonical_language", canonicalLanguageModule);
  registry.register("controlled_records", controlledRecordsModule);
  registry.register("rreg", rregModule);
  registry.register("liora_cockpit", lioraCockpitModule);
  registry.register("engine_flow", engineFlowModule);
  ensureModuleNavLink("scene_builder", "Scene Builder");
  ensureModuleNavLink("ies_builder", "IES Builder");
  ensureModuleNavLink("lab_proof", "Lab Proof");
  ensureModuleNavLink("knowledge_base", "Knowledge Base");
  ensureModuleNavLink("canonical_language", "Canonical Language");
  ensureModuleNavLink("controlled_records", "Controlled Ledger");
  ensureModuleNavLink("rreg", "Roles & Responsibilities");
  ensureModuleNavLink("liora_cockpit", "Liora Cockpit");
  ensureModuleNavLink("engine_flow", "Engine Flow");
  bindGroupedRailNavigation();
  bindShellTopbarControls();
  bindAssistiveCompanyIdentityHelper();

  refreshContextSafely("initial-render");
  userMenuButton?.addEventListener("click", handleUserMenuToggle);
  signInButton?.addEventListener("click", handleAuthSignIn);
  signOutButton?.addEventListener("click", handleAuthSignOut);
  useAuthIdentityButton?.addEventListener("click", handleUseAuthenticatedIdentity);
  companyLinkButton?.addEventListener("click", handleCompanyLink);
  companyProjectButton?.addEventListener("click", handleCompanyProjectFallback);
  companyClearButton?.addEventListener("click", handleCompanyClear);
  companySelect?.addEventListener("change", () => {
    if (companyLinkButton) companyLinkButton.disabled = !companySelect.value;
  });
  projectBrowserSaveButton?.addEventListener("click", handleProjectBrowserSave);
  projectBrowserRestoreButton?.addEventListener("click", handleProjectBrowserRestore);
  projectBrowserHandoffButton?.addEventListener("click", handleProjectBrowserHandoffShare);
  projectBrowserSelectedProjectExportsItems?.addEventListener(
    "click",
    handleProjectBrowserSelectedProjectExportAction,
  );
  projectBrowserList?.addEventListener("click", handleProjectBrowserListClick);
  projectSelect?.addEventListener("change", handleProjectSelectionChange);
  identitySelect?.addEventListener("change", handleIdentityChange);
  roleOverrideToggle?.addEventListener("change", handleRoleOverrideToggle);
  roleOverrideSelect?.addEventListener("change", handleRoleOverrideChange);
  displayRoleSelect?.addEventListener("change", handleDisplayRoleChange);
  projectModeSelect?.addEventListener("change", handleProjectModeChange);
  services.eventBus.on?.("authority:live-read-completed", ({ result } = {}) => {
    const nextContext = refreshContext("authority-live-read-completed");
    setStatus(`Live NVB authority read ${result?.liveReadStatus || nextContext.authority.nvb?.liveReadStatus || "updated"}. Authority source: ${nextContext.authority.actualRole?.source}.`);
  });
  services.eventBus.on?.("crm:read-completed", ({ crmRead } = {}) => {
    const nextContext = refreshContext("crm-read-completed");
    setStatus(`CRM read ${crmRead?.status || nextContext.crm?.hubspot?.status || "updated"}. Writes remain ${nextContext.crm.writePolicy?.enabled ? "enabled" : "disabled"}.`);
  });

  if (route.moduleId === NOVON_WEBSITE_MODULE_ID) {
    if (homePanel) homePanel.hidden = true;
    if (moduleHost) moduleHost.hidden = false;
    renderNovonWebsiteView();
    setStatus("Novon website mounted as a shell-owned special view. Authority is shell-owned and read-only; NVB is used when available.");
    scheduleOptionalDiagnosticsPlugin({ services, getContext: () => context, registry, onPluginReady: rememberDiagnosticsPlugin });
    return;
  }

  if (showHomeIfRequested(route.moduleId)) {
    setStatus("Workspace home mounted. Authority is shell-owned and read-only; NVB is used when available.");
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
    if (moduleHost) moduleHost.hidden = false;
    mountedModuleApi = moduleApi;
    moduleApi.mount({ container: moduleHost, services, context });
    renderModuleDeveloperSurface(context);
    setStatus(`Mounted ${route.moduleId}. Authority is shell-owned and read-only; NVB is used when available.`);
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

