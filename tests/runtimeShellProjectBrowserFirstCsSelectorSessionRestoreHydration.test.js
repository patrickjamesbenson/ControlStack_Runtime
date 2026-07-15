import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createSelectorProjectEnvelopeContribution,
  createSelectorState,
  validateSelectorProjectEnvelopeState,
} from "../packages/modules/cs-selector/selectorState.js";
import {
  createHydrationPayloadsFromEnvelope,
  createHydrationResultsFromEnvelope,
  createSavedProjectEnvelope,
} from "../packages/workspace-kernel/projectEnvelope.js";
import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";

const CONTRACT_ID = "SHELL-PROJECT-BROWSER-FIRST-CS-SELECTOR-SESSION-RESTORE-HYDRATION-1";

function runtimeContext() {
  return {
    contractVersion: CONTRACT_ID,
    project: {
      metadata: {
        projectId: "project-alpha",
        title: "Alpha Linear Workspace",
      },
      currentProject: {
        projectId: "project-alpha",
        title: "Alpha Linear Workspace",
        client: "Alpha Client",
        site: "Sydney",
      },
      selection: {
        selectedProjectId: "project-alpha",
      },
    },
    identity: {
      currentUser: {
        name: "Workspace User",
        email: "workspace@example.test",
      },
    },
    visibility: {},
    flags: {},
    downstream: {},
  };
}

function safeSelectorContribution() {
  const selectorState = createSelectorState();
  selectorState.setCategory("system");
  selectorState.setExpanderSectionOpen("environment", false);
  selectorState.setDbBackedSelectorFieldValue("system", "DNX|60", "DNX 60");
  selectorState.setSelectorTimelineTestMode(true);
  selectorState.setSelectorTimelineVisibleStatuses(["available", "approved"]);
  return createSelectorProjectEnvelopeContribution(selectorState.getSnapshot());
}

function sourceSlice(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start);
  assert.ok(start >= 0, `missing start token: ${startToken}`);
  assert.ok(end > start, `missing end token: ${endToken}`);
  return source.slice(start, end);
}

test("Selector contributes only approved serialisable Project-envelope UI state", () => {
  const contribution = safeSelectorContribution();
  const validation = validateSelectorProjectEnvelopeState(contribution.state);
  const serialised = JSON.stringify(contribution);

  assert.equal(contribution.moduleId, "cs_selector");
  assert.equal(contribution.status, "saved-ui-state");
  assert.equal(validation.valid, true);
  assert.equal(contribution.state.selectedCategory, "system");
  assert.equal(contribution.state.expanderSections.environment, false);
  assert.equal(contribution.state.manualConstraints.system.value, "DNX|60");
  assert.equal(contribution.state.safety.serialisableUiStateOnly, true);

  for (const forbidden of [
    "rawOptionRows",
    "sourceRows",
    "engineCandidates",
    "selectedResult",
    "engineResult",
    "runTableRows",
    "generatedOutputs",
    "rawIes",
    "candela",
  ]) {
    assert.equal(serialised.includes(`"${forbidden}":`), false, forbidden);
  }
});

test("Selector state hydration is dedicated, strict, and separate from browser-local test-case recall", () => {
  const contribution = safeSelectorContribution();
  const targetState = createSelectorState();
  const applied = targetState.hydrateSelectorProjectEnvelopeState(contribution.state);

  assert.equal(applied.accepted, true);
  assert.equal(applied.status, "selector-project-envelope-state-applied");
  assert.equal(applied.snapshot.selectedCategory, "system");
  assert.equal(applied.snapshot.expanderSections.environment, false);
  assert.equal(applied.snapshot.dbBackedSelector.manualConstraints.system.value, "DNX|60");
  assert.notEqual(applied.snapshot.selectorTestCase.status, "recalled-selector-test-case");

  const missing = targetState.hydrateSelectorProjectEnvelopeState({});
  assert.equal(missing.accepted, false);
  assert.equal(missing.status, "invalid-selector-project-envelope-state");

  const invalid = structuredClone(contribution.state);
  invalid.rawOptionRows = [{ unsafe: true }];
  const rejected = targetState.hydrateSelectorProjectEnvelopeState(invalid);
  assert.equal(rejected.accepted, false);
  assert.match(rejected.reason, /unapproved fields/);
});

test("Project envelope prepares only cs_selector for mounted hydration and keeps other modules no-handler", () => {
  const context = runtimeContext();
  const contribution = safeSelectorContribution();
  const envelope = createSavedProjectEnvelope({
    project: context.project,
    identity: context.identity,
    visibility: context.visibility,
    flags: context.flags,
    downstream: context.downstream,
    contractVersion: context.contractVersion,
    moduleContributions: { cs_selector: contribution },
    source: "p2-shell-save-envelope",
  });
  const payloads = createHydrationPayloadsFromEnvelope(envelope);
  const results = createHydrationResultsFromEnvelope(envelope);

  assert.equal(envelope.modules.cs_selector.status, "saved-ui-state");
  assert.equal(envelope.modules.cs_selector.downstreamContext, null);
  assert.equal(payloads.cs_selector.moduleId, "cs_selector");
  assert.equal(payloads.cs_selector.sourceEnvelopeId, envelope.envelopeId);
  assert.equal(payloads.cs_selector.sourceProjectId, envelope.projectId);
  assert.equal(payloads.cs_selector.payloadAvailable, true);
  assert.equal(results.cs_selector.status, "prepared");
  assert.equal(results.scene_builder.status, "no-handler");
  assert.equal(results.emergence.status, "no-handler");
});

test("Project-envelope allow-list rejects forged nested Selector state without changing landed legacy contributions", () => {
  const context = runtimeContext();
  const forgedContribution = safeSelectorContribution();
  forgedContribution.state.timelineStatusTest.rawOptionRows = [{ unsafe: true }];
  const forgedEnvelope = createSavedProjectEnvelope({
    project: context.project,
    identity: context.identity,
    visibility: context.visibility,
    flags: context.flags,
    downstream: context.downstream,
    contractVersion: context.contractVersion,
    moduleContributions: { cs_selector: forgedContribution },
    source: "p2-shell-save-envelope",
  });
  assert.equal(forgedEnvelope.modules.cs_selector.status, "empty");
  assert.deepEqual(forgedEnvelope.modules.cs_selector.state, {});
  assert.equal(forgedEnvelope.modules.cs_selector.downstreamContext, null);

  const legacyState = { engineRunActionSource: { status: "ready" } };
  const legacyDownstream = { selectedResultSummary: { status: "ready" } };
  const legacyEnvelope = createSavedProjectEnvelope({
    project: context.project,
    identity: context.identity,
    visibility: context.visibility,
    flags: context.flags,
    downstream: context.downstream,
    contractVersion: context.contractVersion,
    moduleContributions: {
      cs_selector: {
        status: "ready",
        state: legacyState,
        downstreamContext: legacyDownstream,
      },
    },
    source: "p2-shell-save-envelope",
  });
  assert.equal(legacyEnvelope.modules.cs_selector.status, "ready");
  assert.deepEqual(legacyEnvelope.modules.cs_selector.state, legacyState);
  assert.deepEqual(legacyEnvelope.modules.cs_selector.downstreamContext, legacyDownstream);
});

test("Saved Project store reports cs_selector:hydrated only after a successful callback result", () => {
  const context = runtimeContext();
  const contribution = safeSelectorContribution();
  const store = createSavedProjectStore();
  const saved = store.saveCurrentProjectEnvelope(context, { cs_selector: contribution });
  const restored = store.restoreProjectEnvelope(saved.envelopeId, context);

  assert.equal(saved.accepted, true);
  assert.equal(restored.accepted, true);
  assert.equal(restored.hydrate.moduleResults.cs_selector.status, "prepared");
  assert.equal(restored.hydrate.moduleResults.scene_builder.status, "no-handler");
  assert.equal(restored.hydrate.moduleResults.emergence.status, "no-handler");

  const failed = store.recordModuleHydrationResult(saved.envelopeId, "cs_selector", {
    accepted: false,
    status: "stale-selector-hydration-state",
    reason: "Restored constraint is stale.",
  });
  assert.equal(failed.moduleHydrated, false);
  assert.equal(failed.moduleResult.status, "stale-selector-hydration-state");
  assert.equal(failed.moduleResult.callbackSucceeded, false);

  const hydrated = store.recordModuleHydrationResult(saved.envelopeId, "cs_selector", {
    accepted: true,
    status: "hydrated",
    reason: "Current source-backed options accepted the restored constraints.",
  });
  assert.equal(hydrated.moduleHydrated, true);
  assert.equal(hydrated.moduleResult.status, "hydrated");
  assert.equal(hydrated.moduleResult.callbackSucceeded, true);
  assert.equal(hydrated.hydrate.moduleResults.scene_builder.status, "no-handler");
  assert.equal(hydrated.hydrate.moduleResults.emergence.status, "no-handler");
});

test("shell dispatches only the matching mounted cs_selector payload and preserves the visible product surface", async () => {
  const [shellSource, selectorModuleSource, selectorViewSource, projectBrowserServiceSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/index.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/projectBrowserService.js", import.meta.url), "utf8"),
  ]);

  const saveSource = sourceSlice(
    shellSource,
    "async function handleProjectBrowserSave()",
    "async function handleProjectBrowserRestore()",
  );
  assert.match(saveSource, /mountedModuleApi\?\.moduleId === "cs_selector"/);
  assert.match(saveSource, /getProjectEnvelopeContribution\(\)/);
  assert.match(selectorModuleSource, /preEngineActionEligibilityProjection/);
  assert.match(selectorModuleSource, /latestSelectorViewModel/);
  assert.match(saveSource, /selectorContribution\.status !== "saved-ui-state"/);
  assert.match(saveSource, /saveProject\(context, moduleContributions\)/);

  const restoreSource = sourceSlice(
    shellSource,
    "async function handleProjectBrowserRestore()",
    "function handleProjectBrowserHandoffShare()",
  );
  assert.match(restoreSource, /result\.hydrate\?\.modulePayloads\?\.cs_selector/);
  assert.match(restoreSource, /route\.moduleId === "cs_selector"/);
  assert.match(restoreSource, /mountedModuleApi\?\.moduleId === "cs_selector"/);
  assert.match(restoreSource, /selectorPayload\?\.moduleId === "cs_selector"/);
  assert.match(restoreSource, /await mountedModuleApi\.hydrate\(selectorPayload, nextContext\)/);
  assert.match(restoreSource, /recordModuleHydrationResult\(\s*result\.envelopeId,\s*"cs_selector"/);
  assert.match(restoreSource, /refreshContextSafely\("project-restore-hydrate-result-recorded"\)/);
  assert.ok(restoreSource.includes('`${item.moduleId}:${item.status}`'));
  assert.doesNotMatch(restoreSource, /modulePayloads\?\.scene_builder|modulePayloads\?\.emergence/);

  const hydrationDispatchIndex = restoreSource.indexOf("await mountedModuleApi.hydrate(selectorPayload, nextContext)");
  const hydrationRecordIndex = restoreSource.indexOf("services.projectBrowser.recordModuleHydrationResult(");
  const finalRefreshIndex = restoreSource.indexOf('refreshContextSafely("project-restore-hydrate-result-recorded")');
  assert.ok(hydrationDispatchIndex >= 0);
  assert.ok(hydrationRecordIndex > hydrationDispatchIndex);
  assert.ok(finalRefreshIndex > hydrationRecordIndex);

  const mountSource = sourceSlice(
    shellSource,
    "  const moduleApi = registry.get(route.moduleId);",
    "  } catch (error) {",
  );
  assert.match(mountSource, /mountedModuleApi = moduleApi/);
  assert.match(mountSource, /moduleApi\.mount\(\{ container: moduleHost, services, context \}\)/);
  assert.match(mountSource, /renderModuleDeveloperSurface\(context\)/);

  const refreshSource = sourceSlice(
    shellSource,
    "  function refreshContext(reason",
    "  function refreshContextSafely",
  );
  const projectBrowserRenderIndex = refreshSource.indexOf("renderProjectBrowser({ context });");
  const moduleUpdateIndex = refreshSource.indexOf("mountedModuleApi?.update?.(context);");
  const modulePresentationIndex = refreshSource.indexOf("renderModuleDeveloperSurface(context);");
  assert.ok(projectBrowserRenderIndex >= 0);
  assert.ok(moduleUpdateIndex > projectBrowserRenderIndex);
  assert.ok(modulePresentationIndex > moduleUpdateIndex);

  const developerSurfaceSource = sourceSlice(
    shellSource,
    "function renderModuleDeveloperSurface(context)",
    "function renderUnknownModuleFallback",
  );
  const selectorTakeoverSource = sourceSlice(
    developerSurfaceSource,
    "  const selectorProductSurface =",
    "  const debugSurface =",
  );
  assert.match(selectorTakeoverSource, /:scope > \.cs-selector-proof\[data-module="cs_selector"\]/);
  assert.match(selectorTakeoverSource, /context\.route\.moduleId === "cs_selector" && selectorProductSurface/);
  assert.match(selectorTakeoverSource, /:scope > \.cs-shell__module-user-surface/);
  assert.match(selectorTakeoverSource, /\.remove\(\)/);
  assert.match(selectorTakeoverSource, /return;/);
  assert.doesNotMatch(
    selectorTakeoverSource,
    /document\.createElement|ensureLocalDeveloperDetails|insertAdjacentElement|local-dev-body|appendChild\(selectorProductSurface\)|Project Browser|selectedProject|Engine|exports/i,
  );
  assert.ok(
    developerSurfaceSource.indexOf("const selectorProductSurface")
      < developerSurfaceSource.indexOf("const debugSurface"),
  );
  assert.match(developerSurfaceSource, /userSurface\.className = "cs-shell__module-user-surface"/);
  assert.ok(developerSurfaceSource.includes("${moduleLabel(context.route.moduleId)} workspace"));
  assert.match(developerSurfaceSource, /body\.appendChild\(debugSurface\)/);

  assert.match(selectorViewSource, /article\.className = "cs-selector-proof"/);
  assert.match(selectorViewSource, /article\.dataset\.module = viewModel\.moduleId/);
  assert.match(selectorViewSource, /appendText\(intro, "h2", "CS Selector Preview"\)/);
  assert.match(selectorViewSource, /diagnosticsDetails\.className = "cs-selector-diagnostics cs-selector-dev-drawer"/);
  assert.match(selectorViewSource, /container\.appendChild\(article\)/);

  const hydrateSource = sourceSlice(
    selectorModuleSource,
    "  async hydrate(hydrationPayload, nextContext = mountedContext)",
    "  update(nextContext)",
  );
  assert.match(hydrateSource, /validateSelectorHydrationPayload/);
  assert.match(hydrateSource, /hydrateSelectorProjectEnvelopeState/);
  assert.match(hydrateSource, /await loadSelectorReferenceOptions\(\)/);
  assert.match(hydrateSource, /selectorRestoredConstraintsValidation/);
  assert.match(hydrateSource, /ensureVisibleSelectorSurface/);
  assert.match(hydrateSource, /status: "hydrated"/);
  assert.match(hydrateSource, /report: "cs_selector:hydrated"/);

  assert.match(shellSource, /ensureRestoredCsSelectorEngineActionLaneSurface/);
  assert.match(shellSource, /data-shell-restored-cs-selector-engine-action-lane/);
  assert.match(shellSource, /Shell-owned readonly action lane/);
  assert.match(shellSource, /moduleHost\?\.addEventListener/);
  assert.match(projectBrowserServiceSource, /selectedProjectPreEngineActionEligibility/);
  assert.match(projectBrowserServiceSource, /function recordModuleHydrationResult\(/);
  assert.match(projectBrowserServiceSource, /savedProjectStore\.recordModuleHydrationResult\?\./);
});

test("session restore hydration adds no Engine, RunTable, IES, route, POST, filesystem, database, or RuntimeData widening", async () => {
  const [selectorStateSource, selectorModuleSource, envelopeSource, storeSource] = await Promise.all([
    readFile(new URL("../packages/modules/cs-selector/selectorState.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/index.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/projectEnvelope.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/savedProjectStore.js", import.meta.url), "utf8"),
  ]);
  const stateSource = sourceSlice(
    selectorStateSource,
    "function selectorProjectEnvelopePlainObject",
    "const DEFAULT_PREVIEW_DEFAULTS",
  );
  const moduleHydrateSource = sourceSlice(
    selectorModuleSource,
    "function renderSelectorHydrationFallback",
    "function handleSelectorLocalStateChange",
  ) + sourceSlice(
    selectorModuleSource,
    "  getProjectEnvelopeContribution()",
    "  update(nextContext)",
  );
  const envelopeContributionSource = sourceSlice(
    envelopeSource,
    "const CS_SELECTOR_PROJECT_ENVELOPE_STATE_KEYS",
    "export function validateSavedProjectEnvelope",
  );
  const storeHydrationSource = sourceSlice(
    storeSource,
    "  function recordModuleHydrationResult",
    "  function resolvePackageEnvelope",
  );
  const boundedSource = [stateSource, moduleHydrateSource, envelopeContributionSource, storeHydrationSource].join("\n");

  assert.doesNotMatch(
    boundedSource,
    /invokeSelectedProjectReadonlyEngine|invoke\w*DonorEngine|generateRunTable\s*\(|generateIes\s*\(|rawIes\s*:|writeFile|appendFile|mkdir|unlink|createServer|listen\s*\(|method\s*:\s*["']POST["']|RuntimeData\s*=|databasePath\s*:|dbPath\s*:/i,
  );
});
