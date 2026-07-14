import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CONTRACT_ID = "SHELL-PROJECT-BROWSER-FIRST-TRUTHFUL-SAVE-OPEN-SURFACE-1";

async function readSurfaceSources() {
  return Promise.all([
    readFile(new URL("../apps/workspace-shell/index.html", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
  ]);
}

function sourceSlice(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start);
  assert.ok(start >= 0, `missing start token: ${startToken}`);
  assert.ok(end > start, `missing end token: ${endToken}`);
  return source.slice(start, end);
}

test("top Project surface truthfully separates current workspace fixtures, runtime-session saves, and read-only references", async () => {
  const [htmlSource, shellSource] = await readSurfaceSources();

  for (const token of [
    "Current workspace fixtures",
    "Alpha, Bravo, and Charlie are current-project selection fixtures / reference workspaces. They are not saved projects.",
    "Runtime-session saved projects",
    "These envelopes exist only in the current browser/runtime session",
    "Read-only Project Browser references",
    "These are reference fixtures from Project Browser data. They can be inspected but cannot be restored.",
    "Durable project persistence is unavailable.",
    "cs-shell-project-popout-list",
    "cs-shell-project-popout-saved-list",
    "cs-shell-project-popout-reference-list",
    "cs-shell-project-popout-selection-summary",
    "cs-shell-project-popout-restore-reason",
    "cs-shell-project-popout-outcome",
  ]) {
    assert.equal(htmlSource.includes(token), true, token);
  }

  for (const token of [
    CONTRACT_ID,
    "Current workspace fixture · Not a saved project",
    "Runtime-session save",
    "Read-only reference fixture",
    "Selected envelope",
  ]) {
    assert.equal(shellSource.includes(token), true, token);
  }
});

test("top Project surface sources saved-envelope rows directly from context.projectBrowser.projects and uses the existing inspection path", async () => {
  const [, shellSource] = await readSurfaceSources();
  const rendererSource = sourceSlice(
    shellSource,
    "function renderProjectTopbarPopout(context)",
    "function renderCompanyTopbarPopout(context)",
  );

  assert.match(
    rendererSource,
    /const browser = context\.projectBrowser \|\| \{\};/,
  );
  assert.match(
    rendererSource,
    /const browserProjects = Array\.isArray\(browser\.projects\) \? browser\.projects : \[\];/,
  );
  assert.match(
    rendererSource,
    /project\.readOnly !== true && project\.browserOnly !== true/,
  );
  assert.match(
    rendererSource,
    /project\.readOnly === true \|\| project\.browserOnly === true/,
  );
  assert.match(rendererSource, /createProjectTopbarEnvelopeButton\(project, "runtime"/);
  assert.match(rendererSource, /createProjectTopbarEnvelopeButton\(project, "reference"/);
  assert.match(rendererSource, /selectedProjectSummary\(browser\)/);
  assert.match(rendererSource, /selectedEnvelope\?\.restoreEligible !== true/);

  const selectionSource = sourceSlice(
    shellSource,
    "function handleProjectBrowserEnvelopeSelection(envelopeId)",
    "function handleProjectBrowserListClick(event)",
  );
  assert.match(
    selectionSource,
    /services\.projectBrowser\.inspectProject\(envelopeId, context\)/,
  );
  assert.match(selectionSource, /refreshContext\("project-browser-select-envelope"\)/);
});

test("top and sidebar Save, Restore, Handoff, and saved-envelope selection share stable handlers without clickLegacy bridging", async () => {
  const [, shellSource] = await readSurfaceSources();

  assert.equal(shellSource.includes("clickLegacy"), false);
  assert.match(
    shellSource,
    /projectBrowserSharedActionHandlers = Object\.freeze\(\{\s*save: handleProjectBrowserSave,\s*restore: handleProjectBrowserRestore,\s*handoff: handleProjectBrowserHandoffShare,\s*selectEnvelope: handleProjectBrowserEnvelopeSelection,\s*\}\);/,
  );
  assert.match(
    shellSource,
    /projectBrowserSaveButton\?\.addEventListener\("click", projectBrowserSharedActionHandlers\.save\)/,
  );
  assert.match(
    shellSource,
    /projectBrowserRestoreButton\?\.addEventListener\("click", projectBrowserSharedActionHandlers\.restore\)/,
  );
  assert.match(
    shellSource,
    /projectBrowserHandoffButton\?\.addEventListener\("click", projectBrowserSharedActionHandlers\.handoff\)/,
  );
  assert.match(
    shellSource,
    /projectPopout\?\.addEventListener\("click", handleProjectTopbarInteraction\)/,
  );
  const interactionSource = sourceSlice(
    shellSource,
    "function handleProjectTopbarInteraction(event)",
    "function renderProjectTopbarPopout(context)",
  );
  assert.equal((interactionSource.match(/event\.stopPropagation\(\)/g) || []).length, 2);
  assert.match(shellSource, /save\.dataset\.projectBrowserAction = "save"/);
  assert.match(shellSource, /restore\.dataset\.projectBrowserAction = "restore"/);
  assert.match(shellSource, /handoff\.dataset\.projectBrowserAction = "handoff"/);
  assert.match(
    shellSource,
    /handler\(envelopeButton\.dataset\.projectBrowserEnvelopeId, event\)/,
  );

  const rendererSource = sourceSlice(
    shellSource,
    "function renderProjectTopbarPopout(context)",
    "function renderCompanyTopbarPopout(context)",
  );
  assert.doesNotMatch(rendererSource, /\.cs-shell__project-browser-(?:save|restore|handoff)/);
  assert.doesNotMatch(rendererSource, /\.click\?\.\(|\.click\(\)/);
});

test("Restore remains disabled with an exact visible reason and Save/Restore outcomes remain explicit across rerenders", async () => {
  const [htmlSource, shellSource] = await readSurfaceSources();

  assert.match(
    shellSource,
    /restore\.disabled = browser\.capabilities\?\.restore !== true \|\| selectedEnvelope\?\.restoreEligible !== true/,
  );
  for (const token of [
    "Restore disabled: Project Browser restore capability is unavailable.",
    "Restore disabled: select a runtime-session saved envelope first.",
    "Restore disabled: ${selected.restoreDisabledReason",
    "Browser-session envelope saved:",
    "Server in-process registration acknowledged:",
    "Server in-process registration pending:",
    "Server in-process registration blocked or unavailable:",
    "Durable persistence unavailable: this envelope exists only in the current browser/runtime session.",
    "Session envelope restored:",
    "Hydration payloads prepared:",
    "Durable persistence remains unavailable; restore used the current runtime-session envelope.",
  ]) {
    assert.equal(shellSource.includes(token), true, token);
  }
  assert.match(htmlSource, /id="cs-shell-project-popout-restore-reason" role="status"/);
  assert.match(htmlSource, /id="cs-shell-project-popout-outcome" aria-live="polite"/);

  const saveSource = sourceSlice(
    shellSource,
    "async function handleProjectBrowserSave()",
    "function handleProjectBrowserRestore()",
  );
  assert.match(saveSource, /setProjectTopbarActionOutcome\(/);
  assert.match(saveSource, /refreshContext\("project-save-envelope-browser-session"\)/);
  assert.match(saveSource, /refreshContext\("project-save-envelope-server-in-process-registration"\)/);
  assert.doesNotMatch(saveSource, /setPopout\(projectChip, projectPopout, false\)/);

  const restoreSource = sourceSlice(
    shellSource,
    "async function handleProjectBrowserRestore()",
    "function handleProjectBrowserHandoffShare()",
  );
  assert.match(restoreSource, /setProjectTopbarActionOutcome\(/);
  assert.match(restoreSource, /refreshContextSafely\("project-restore-hydrate"\)/);
  assert.match(restoreSource, /mountedModuleApi\.hydrate\(selectorPayload, nextContext\)/);
  assert.match(restoreSource, /recordModuleHydrationResult\(/);
  assert.doesNotMatch(restoreSource, /setPopout\(projectChip, projectPopout, false\)/);
});

test("truthful Save/Open surface adds no persistence, server route, POST endpoint, or Engine execution widening", async () => {
  const [, shellSource] = await readSurfaceSources();
  const truthfulSurfaceSource = sourceSlice(
    shellSource,
    "function setProjectTopbarActionOutcome(outcome = {})",
    "function renderCompanyTopbarPopout(context)",
  );

  assert.doesNotMatch(
    truthfulSurfaceSource,
    /\bfetch\s*\(|XMLHttpRequest|WebSocket|writeFile|appendFile|mkdir|unlink|method\s*:\s*["']POST["']|createServer|listen\s*\(/,
  );
  assert.doesNotMatch(
    truthfulSurfaceSource,
    /invokeSelectedProjectReadonlyEngine|Run Engine|engineExecutionEnabled|engineExecutionAttempted/,
  );
  assert.match(
    truthfulSurfaceSource,
    /Durable persistence unavailable/,
  );
  assert.match(
    truthfulSurfaceSource,
    /no filesystem, database, RuntimeData, or server persistence was added/,
  );
});
