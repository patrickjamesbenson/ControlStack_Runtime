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
  list.className = "cs-diagnostics__meta";
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
  section.className = "cs-diagnostics__section";
  appendText(section, "h3", heading);
  appendDefinitionList(section, rows);
  parent.appendChild(section);
}

function decisionText(decision) {
  return `${decision.moduleId}:${decision.visible ? "visible" : "hidden"}:${decision.reason}`;
}

function consumerText(consumer) {
  return `${consumer.id}:${consumer.status}:${consumer.registered ? "registered" : "not-registered"}`;
}

export function renderDiagnosticsView(container, viewModel) {
  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-diagnostics";
  article.dataset.plugin = viewModel.pluginId;

  const intro = document.createElement("div");
  appendText(intro, "p", "Optional plugin", "cs-shell__eyebrow");
  appendText(intro, "h2", "Diagnostics panel");
  appendText(intro, "p", "Diagnostics reads shell-owned snapshots, including NVB-backed authority and read-safe CRM/company context.");
  article.appendChild(intro);

  appendSection(article, "Route and shell", [
    ["Route module", viewModel.route.moduleId],
    ["Route path", viewModel.route.path],
    ["Shell phase", viewModel.shell.phase],
    ["Contract", viewModel.shell.contractVersion],
    ["Responsive requirement", viewModel.shell.responsiveRequirement],
    ["Registered modules", viewModel.shell.registeredModules],
  ]);

  appendSection(article, "Auth / session", [
    ["owner", viewModel.auth.owner],
    ["status", viewModel.auth.status],
    ["live", viewModel.auth.live],
    ["source", viewModel.auth.source],
    ["authenticated", viewModel.auth.authenticated],
    ["session id", viewModel.auth.sessionId],
    ["user id", viewModel.auth.userId],
    ["name", viewModel.auth.name],
    ["email", viewModel.auth.email],
    ["provider", viewModel.auth.provider],
    ["auth source", viewModel.auth.authSource],
    ["sign in", viewModel.auth.signIn],
    ["sign out", viewModel.auth.signOut],
    ["session restore", viewModel.auth.restoreSession],
    ["OAuth/provider", viewModel.auth.oauthProvider],
    ["password storage", viewModel.auth.passwordStorage],
    ["MFA", viewModel.auth.mfa],
  ]);

  appendSection(article, "Authority / privileges", [
    ["Authority owner", viewModel.authority.owner],
    ["Authority status", viewModel.authority.status],
    ["Authority source", viewModel.authority.source],
    ["Read only", viewModel.authority.readOnly],
    ["Actual role", viewModel.authority.actualRole],
    ["Nominal role", viewModel.authority.nominalRole],
    ["Actual role source", viewModel.authority.actualRoleSource],
    ["Derived from NVB", viewModel.authority.derivedFromNvb],
    ["Fallback applied", viewModel.authority.fallbackApplied],
    ["Fallback reason", viewModel.authority.fallbackReason],
    ["NVB available", viewModel.authority.nvbAvailable],
    ["NVB checked", viewModel.authority.nvbChecked],
    ["NVB matched", viewModel.authority.nvbMatched],
    ["NVB source", viewModel.authority.nvbSource],
    ["NVB record", viewModel.authority.nvbRecordId],
    ["NVB confidence", viewModel.authority.nvbConfidence],
    ["Live read status", viewModel.authority.nvbLiveReadStatus],
    ["Live read configured", viewModel.authority.nvbLiveReadConfigured],
    ["Non-boot-critical", viewModel.authority.nvbNonBootCritical],
    ["Timeout ms", viewModel.authority.nvbTimeoutMs],
    ["NVB reason", viewModel.authority.nvbReason],
    ["Subject email", viewModel.authority.subjectEmail],
    ["Subject classification", viewModel.authority.subjectClassification],
    ["Identity source", viewModel.authority.identitySource],
    ["Internal classifier", viewModel.authority.internalClassifier],
    ["Classifier only", viewModel.authority.classifierOnly],
    ["Special visibility", viewModel.authority.specialVisibility],
    ["Exceptional entitlements", viewModel.authority.exceptionalEntitlements],
    ["Restrictions", viewModel.authority.restrictions],
    ["Blacklist active", viewModel.authority.blacklistActive],
    ["Blacklist reason", viewModel.authority.blacklistReason],
    ["Blacklist source", viewModel.authority.blacklistSource],
    ["Company authority", viewModel.authority.companyAuthority],
    ["Company authority note", viewModel.authority.companyAuthorityNote],
    ["Developer override", viewModel.authority.developerOverride],
    ["Developer override label", viewModel.authority.developerOverrideLabel],
    ["Authority writes enabled", viewModel.authority.writeEnabled],
    ["Write policy", viewModel.authority.writeReason],
  ]);

  const authorityCapabilities = document.createElement("section");
  authorityCapabilities.className = "cs-diagnostics__section";
  appendText(authorityCapabilities, "h3", "Authority capabilities");
  appendPillList(authorityCapabilities, viewModel.authority.capabilities === "none" ? ["none"] : viewModel.authority.capabilities.split(", "));
  article.appendChild(authorityCapabilities);

  appendSection(article, "Company / CRM context", [
    ["Company owner", viewModel.company.owner],
    ["Company status", viewModel.company.status],
    ["Company source", viewModel.company.source],
    ["Company ID", viewModel.company.id],
    ["Company", viewModel.company.name],
    ["Domain", viewModel.company.domain],
    ["Website", viewModel.company.website],
    ["Lifecycle", viewModel.company.lifecycleStage],
    ["Linked project", viewModel.company.linkedProjectId],
    ["Linked at", viewModel.company.linkedAt],
    ["Owner", viewModel.company.ownerName],
    ["Company write enabled", viewModel.company.writeEnabled],
    ["CRM owner", viewModel.crm.owner],
    ["CRM status", viewModel.crm.status],
    ["CRM source", viewModel.crm.source],
    ["Read only", viewModel.crm.readOnly],
    ["Selected company", viewModel.crm.selectedCompanyId],
    ["Project fallback", viewModel.crm.projectFallback],
    ["HubSpot status", viewModel.crm.hubspotStatus],
    ["HubSpot available", viewModel.crm.hubspotAvailable],
    ["CRM writes enabled", viewModel.crm.writeFlowsEnabled],
    ["Write policy", viewModel.crm.writeReason],
    ["Contact status", viewModel.crm.contactStatus],
    ["Contact email", viewModel.crm.contactEmail],
    ["Deal status", viewModel.crm.dealStatus],
  ]);

  const companyFixturesSection = document.createElement("section");
  companyFixturesSection.className = "cs-diagnostics__section";
  appendText(companyFixturesSection, "h3", "Available company fixtures");
  appendPillList(companyFixturesSection, viewModel.crm.availableCompanies.length ? viewModel.crm.availableCompanies : ["none"]);
  article.appendChild(companyFixturesSection);

  appendSection(article, "Project Browser", [
    ["owner", viewModel.projectBrowser.owner],
    ["status", viewModel.projectBrowser.status],
    ["browser read only", viewModel.projectBrowser.readOnly],
    ["non-boot-critical", viewModel.projectBrowser.nonBootCritical],
    ["current project", viewModel.projectBrowser.currentProject],
    ["current project id", viewModel.projectBrowser.currentProjectId],
    ["selected envelope", viewModel.projectBrowser.selectedProjectId],
    ["runtime saved count", viewModel.projectBrowser.savedCount],
    ["fixture count", viewModel.projectBrowser.fixtureCount],
    ["total count", viewModel.projectBrowser.totalCount],
    ["safe empty", viewModel.projectBrowser.safeEmpty],
    ["save", viewModel.projectBrowser.save],
    ["restore", viewModel.projectBrowser.restore],
    ["hydrate", viewModel.projectBrowser.hydrate],
    ["handoff", viewModel.projectBrowser.handoff],
    ["share", viewModel.projectBrowser.share],
  ]);

  appendSection(article, "Save envelope", [
    ["owner", viewModel.saveEnvelope.owner],
    ["status", viewModel.saveEnvelope.status],
    ["live", viewModel.saveEnvelope.live],
    ["source", viewModel.saveEnvelope.source],
    ["last envelope", viewModel.saveEnvelope.lastSavedEnvelopeId],
    ["last project", viewModel.saveEnvelope.lastSavedProjectId],
    ["last saved", viewModel.saveEnvelope.lastSavedAt],
    ["last error", viewModel.saveEnvelope.lastError],
    ["update existing", viewModel.saveEnvelope.updateExistingEnvelope],
    ["restore live", viewModel.saveEnvelope.restoreLive],
    ["hydrate live", viewModel.saveEnvelope.hydrateLive],
    ["handoff/share live", viewModel.saveEnvelope.handoffShareLive],
    ["external delivery live", viewModel.saveEnvelope.externalDeliveryLive],
    ["email send live", viewModel.saveEnvelope.emailSendLive],
    ["HubSpot write live", viewModel.saveEnvelope.hubspotWriteLive],
  ]);

  appendSection(article, "Restore / hydrate", [
    ["restore owner", viewModel.restoreHydrate.restoreOwner],
    ["restore status", viewModel.restoreHydrate.restoreStatus],
    ["restore live", viewModel.restoreHydrate.restoreLive],
    ["restore source", viewModel.restoreHydrate.restoreSource],
    ["last restored envelope", viewModel.restoreHydrate.lastRestoredEnvelopeId],
    ["last restored project", viewModel.restoreHydrate.lastRestoredProjectId],
    ["last restored", viewModel.restoreHydrate.lastRestoredAt],
    ["last error", viewModel.restoreHydrate.lastError],
    ["validation", viewModel.restoreHydrate.validation],
    ["hydrate owner", viewModel.restoreHydrate.hydrateOwner],
    ["hydrate status", viewModel.restoreHydrate.hydrateStatus],
    ["hydrate live", viewModel.restoreHydrate.hydrateLive],
    ["last hydrated envelope", viewModel.restoreHydrate.lastHydratedEnvelopeId],
    ["last hydrated modules", viewModel.restoreHydrate.lastHydratedModules],
    ["ownership unchanged", viewModel.restoreHydrate.ownershipUnchanged],
  ]);

  appendSection(article, "Handoff / share package", [
    ["owner", viewModel.handoffShare.owner],
    ["status", viewModel.handoffShare.status],
    ["live", viewModel.handoffShare.live],
    ["source", viewModel.handoffShare.source],
    ["package preparation only", viewModel.handoffShare.packagePreparationOnly],
    ["last package", viewModel.handoffShare.lastPreparedPackageId],
    ["last envelope", viewModel.handoffShare.lastPreparedEnvelopeId],
    ["last project", viewModel.handoffShare.lastPreparedProjectId],
    ["last prepared", viewModel.handoffShare.lastPreparedAt],
    ["last error", viewModel.handoffShare.lastError],
    ["package summary", viewModel.handoffShare.packageSummary],
    ["module summaries", viewModel.handoffShare.moduleSummaries],
    ["external delivery live", viewModel.handoffShare.externalDeliveryLive],
    ["email send live", viewModel.handoffShare.emailSendLive],
    ["HubSpot write live", viewModel.handoffShare.hubspotWriteLive],
  ]);

  const hydrateSection = document.createElement("section");
  hydrateSection.className = "cs-diagnostics__section";
  appendText(hydrateSection, "h3", "Module hydrate results");
  appendPillList(hydrateSection, viewModel.restoreHydrate.moduleResults.length ? viewModel.restoreHydrate.moduleResults : ["none"]);
  article.appendChild(hydrateSection);

  const browserSection = document.createElement("section");
  browserSection.className = "cs-diagnostics__section";
  appendText(browserSection, "h3", "Browser saved projects");
  appendPillList(browserSection, viewModel.projectBrowser.projects.length ? viewModel.projectBrowser.projects : ["safe-empty:no saved projects"]);
  article.appendChild(browserSection);

  appendSection(article, "Scene Builder structural registration", [
    ["registered", viewModel.sceneBuilder.structuralRegistered],
    ["route status", viewModel.sceneBuilder.routeStatus],
    ["visible", viewModel.sceneBuilder.visible],
    ["reason", viewModel.sceneBuilder.reason],
    ["feature restoration", viewModel.sceneBuilder.featureRestoration],
    ["reads downstream context", viewModel.sceneBuilder.readsDownstreamContext],
  ]);

  appendSection(article, "Identity lookup and derived role", [
    ["Identity owner", viewModel.identity.owner],
    ["Identity status", viewModel.identity.status],
    ["Identity source", viewModel.identity.source],
    ["User", viewModel.identity.user],
    ["Email", viewModel.identity.email],
    ["Identity state", viewModel.identity.state],
    ["Classification", viewModel.identity.classification],
    ["Identity source mode", viewModel.identity.identitySource],
    ["Developer fixture", viewModel.identity.developerFixture],
    ["Classified role", viewModel.identity.derivedActualRole],
    ["Identity support role", viewModel.identity.identityActualRole],
    ["Authority actual role", viewModel.identity.authorityActualRole],
    ["Actual role source", viewModel.identity.actualRoleSource],
    ["Actual role derived", viewModel.identity.actualRoleDerived],
    ["Override active", viewModel.identity.actualRoleOverrideEnabled],
    ["Display role", viewModel.identity.displayRole],
    ["Display role preview only", viewModel.identity.displayRolePreviewOnly],
    ["Display clamped", viewModel.identity.displayRoleClamped],
    ["Real auth", viewModel.identity.realAuth],
  ]);

  appendSection(article, "Current project", [
    ["Project owner", viewModel.project.owner],
    ["Project status", viewModel.project.status],
    ["Project title", viewModel.project.title],
    ["Project ID", viewModel.project.projectId],
    ["Readiness", viewModel.project.readiness],
    ["Project source", viewModel.project.source],
    ["Client", viewModel.project.client],
    ["Site", viewModel.project.site],
    ["Company", viewModel.project.companyName],
    ["Company source", viewModel.project.companySource],
    ["Authority role", viewModel.project.authorityRole],
    ["Authority source", viewModel.project.authoritySource],
    ["Restored from envelope", viewModel.project.restoredFromEnvelope],
    ["Restored envelope", viewModel.project.restoredEnvelopeId],
    ["Restored at", viewModel.project.restoredAt],
    ["Save status", viewModel.project.saveStatus],
    ["Restore status", viewModel.project.restoreStatus],
    ["Hydrate status", viewModel.project.hydrateStatus],
    ["Handoff/share status", viewModel.project.handoffStatus],
    ["Last package", viewModel.project.lastPackageId],
  ]);

  appendSection(article, "Visibility policy", [
    ["Visibility owner", viewModel.visibility.owner],
    ["Visibility status", viewModel.visibility.status],
    ["Visibility source", viewModel.visibility.source],
    ["Authenticated", viewModel.visibility.authenticated],
    ["Authority status", viewModel.visibility.authorityStatus],
    ["Authority source", viewModel.visibility.authoritySource],
    ["Authority role", viewModel.visibility.authorityRole],
    ["Authority confidence", viewModel.visibility.authorityConfidence],
    ["Live read status", viewModel.visibility.liveReadStatus],
    ["Blacklist active", viewModel.visibility.blacklistActive],
    ["Restrictions", viewModel.visibility.restrictions],
    ["Exceptional entitlements", viewModel.visibility.exceptionalEntitlements],
    ["Display role preview only", viewModel.visibility.displayRolePreviewOnly],
    ["Developer fixture active", viewModel.visibility.developerFixtureActive],
    ["Visible modules", viewModel.visibility.visibleModules],
    ["Hidden modules", viewModel.visibility.hiddenModules],
    ["Visibility rule", viewModel.visibility.rule],
  ]);

  const registeredSection = document.createElement("section");
  registeredSection.className = "cs-diagnostics__section";
  appendText(registeredSection, "h3", "Registered module decisions");
  appendPillList(registeredSection, viewModel.visibility.registeredModules.map(decisionText));
  article.appendChild(registeredSection);

  const plannedSection = document.createElement("section");
  plannedSection.className = "cs-diagnostics__section";
  appendText(plannedSection, "h3", "Planned module decisions");
  appendPillList(plannedSection, viewModel.visibility.plannedModules.map(decisionText));
  article.appendChild(plannedSection);

  appendSection(article, "Selector-fed downstream context", [
    ["Downstream owner", viewModel.downstream.owner],
    ["Downstream status", viewModel.downstream.status],
    ["Selector status", viewModel.downstream.selectorStatus],
    ["Run refs", viewModel.downstream.runRefs],
    ["Area refs", viewModel.downstream.areaRefs],
    ["Scene candidates", viewModel.downstream.sceneBuilderCandidates],
  ]);

  const consumerSection = document.createElement("section");
  consumerSection.className = "cs-diagnostics__section";
  appendText(consumerSection, "h3", "Planned downstream consumers");
  appendPillList(consumerSection, viewModel.downstream.consumerRows.map(consumerText));
  article.appendChild(consumerSection);

  appendSection(article, "Handoff", [
    ["Handoff owner", viewModel.handoff.owner],
    ["Handoff status", viewModel.handoff.status],
    ["Handoff available", viewModel.handoff.available],
    ["Package preparation only", viewModel.handoff.packagePreparationOnly],
    ["External delivery", viewModel.handoff.externalDelivery],
    ["Email send", viewModel.handoff.emailSend],
    ["HubSpot write", viewModel.handoff.hubspotWrite],
  ]);

  const statusSection = document.createElement("section");
  statusSection.className = "cs-diagnostics__section";
  appendText(statusSection, "h3", "Optional plugin statuses");
  appendPillList(statusSection, viewModel.plugin.statuses.map((status) => `${status.pluginId}:${status.status}`));
  article.appendChild(statusSection);

  const constraintsSection = document.createElement("section");
  constraintsSection.className = "cs-diagnostics__section";
  appendText(constraintsSection, "h3", "Authority constraints");
  appendPillList(constraintsSection, viewModel.constraints);
  article.appendChild(constraintsSection);

  container.appendChild(article);
}
