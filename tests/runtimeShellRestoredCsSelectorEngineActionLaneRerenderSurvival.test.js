import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CONTRACT_ID =
  "SHELL-CS-SELECTOR-RESTORED-READONLY-ENGINE-ACTION-LANE-RERENDER-SURVIVAL-1";

function sourceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

async function readRuntimeSources() {
  const [html, shell, styles, selectorView] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/index.html", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/styles.css", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8"),
  ]);
  return { html, shell, styles, selectorView };
}

test("restored Selector Engine action host is a static shell sibling outside the destructive module host", async () => {
  const { html, shell, styles } = await readRuntimeSources();
  const moduleHostIndex = html.indexOf('id="cs-shell-module-host"');
  const stableSurfaceIndex = html.indexOf(
    'id="cs-shell-restored-cs-selector-engine-action-host"',
  );
  const stableLaneIndex = html.indexOf(
    'id="cs-shell-restored-cs-selector-engine-action-lane"',
  );
  const pluginHostIndex = html.indexOf('id="cs-shell-plugin-host"');

  assert.notEqual(moduleHostIndex, -1);
  assert.notEqual(stableSurfaceIndex, -1);
  assert.notEqual(stableLaneIndex, -1);
  assert.notEqual(pluginHostIndex, -1);
  assert.equal(moduleHostIndex < stableSurfaceIndex, true);
  assert.equal(stableSurfaceIndex < stableLaneIndex, true);
  assert.equal(stableLaneIndex < pluginHostIndex, true);
  assert.match(html, new RegExp(`data-shell-contract-id="${CONTRACT_ID}"`));
  assert.match(html, /data-shell-owner="workspace-shell"/);
  assert.match(html, /data-shell-project-engine-action-lane-mirror="cs_selector"/);
  assert.match(html, /cs-shell-restored-cs-selector-engine-action-host[\s\S]*?hidden/);
  assert.match(
    styles,
    /\.cs-shell__restored-selector-engine-action-lane\[hidden\]\s*\{\s*display:\s*none;/,
  );

  const ensureSurfaceSource = sourceBetween(
    shell,
    "function ensureRestoredCsSelectorEngineActionLaneSurface()",
    "function refreshContext(",
  );
  assert.doesNotMatch(ensureSurfaceSource, /moduleHost\.querySelector|moduleHost\.appendChild/);
  assert.doesNotMatch(ensureSurfaceSource, /document\.createElement/);
});

test("Selector rerenders cannot clear the stable shell host and delegated activation is selector-independent", async () => {
  const { shell } = await readRuntimeSources();
  const ensureSurfaceSource = sourceBetween(
    shell,
    "function ensureRestoredCsSelectorEngineActionLaneSurface()",
    "function refreshContext(",
  );
  const eventBindingsSource = sourceBetween(
    shell,
    "  ensureProjectBrowserPanel();\n  projectBrowserSelectedProjectEngineActionLane?.addEventListener(",
    "projectBrowserSelectedProjectEngineReadonlyInvokeActivationStatus =",
  );

  assert.match(shell, /const moduleHost = document\.getElementById\("cs-shell-module-host"\);/);
  assert.match(
    shell,
    /const restoredCsSelectorEngineActionLaneHost = restoredCsSelectorEngineActionLaneSurface\?\.querySelector\([\s\S]*?"\[data-shell-restored-cs-selector-engine-action-lane\]"/,
  );
  assert.match(
    ensureSurfaceSource,
    /restoredCsSelectorEngineActionLaneSurface\.hidden = !isRestoredCsSelectorRoute/,
  );
  assert.match(
    ensureSurfaceSource,
    /if \(!isRestoredCsSelectorRoute \|\| !restoredCsSelectorEngineActionLaneHost\) return;/,
  );
  assert.match(
    shell,
    /mountedModuleApi\?\.update\?\.\(context\);\s*ensureRestoredCsSelectorEngineActionLaneSurface\(\);/,
  );
  assert.match(
    eventBindingsSource,
    /restoredCsSelectorEngineActionLaneHost\?\.addEventListener\(\s*"click",\s*handleProjectBrowserSelectedProjectEngineAction/,
  );
  assert.doesNotMatch(
    eventBindingsSource,
    /moduleHost\?\.addEventListener\(\s*"click",\s*handleProjectBrowserSelectedProjectEngineAction/,
  );
});

test("stable mirror keeps exactly one visible Run Engine control and remains fail-closed until shell eligibility enables it", async () => {
  const { shell } = await readRuntimeSources();
  const rendererSource = sourceBetween(
    shell,
    "function renderProjectBrowserSelectedProjectEngineActionLane(actionLane)",
    "function renderRestoredCsSelectorEngineActionLaneMirror()",
  );
  const mirrorSource = sourceBetween(
    shell,
    "function renderRestoredCsSelectorEngineActionLaneMirror()",
    "function setProjectBrowserSelectedProjectExportsWorkflowDescriptor(",
  );

  assert.equal((rendererSource.match(/document\.createElement\("button"\)/g) || []).length, 1);
  assert.match(rendererSource, /button\.textContent = actionItem\?\.label \|\| "Run Engine";/);
  assert.match(rendererSource, /button\.disabled = actionItem\?\.enabled !== true;/);
  assert.match(mirrorSource, /clearElement\(restoredCsSelectorEngineActionLaneHost\);/);
  assert.match(mirrorSource, /appendChild\(child\.cloneNode\(true\)\)/);
  assert.match(shell, /buildShellProjectBrowserSelectedProjectEngineActionEligibility/);
  assert.match(shell, /selectedProjectServerOwnedRegistration/);
  assert.match(shell, /preEngineEligibilityProjectionFingerprint/);
});

test("run edits still require Save Project and Selector diagnostic production actions remain permanently disabled", async () => {
  const { shell, selectorView } = await readRuntimeSources();
  const saveSource = sourceBetween(
    shell,
    "async function handleProjectBrowserSave()",
    "async function handleProjectBrowserRestore()",
  );

  assert.match(saveSource, /services\.projectBrowser\.saveProject\(context, moduleContributions\)/);
  assert.match(
    saveSource,
    /await services\.selectedProjectServerOwnedRegistration\.registerLocalSave\(result\)/,
  );
  assert.equal((shell.match(/registerLocalSave\(result\)/g) || []).length, 1);
  assert.match(
    shell,
    /projectBrowserSaveButton\.textContent = save\.status === "saving" \? "Saving\.\.\." : "Save Project";/,
  );
  assert.match(selectorView, /appendWorkflowDisabledActions/);
  assert.match(selectorView, /button\.disabled = true/);
  assert.match(selectorView, /donor-engine-invocation-not-approved/);
  assert.doesNotMatch(selectorView, /data-shell-project-engine-action-id/);
});
