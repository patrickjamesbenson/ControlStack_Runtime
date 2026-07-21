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

test("top Project surface shows real project context, persisted projects, and read-only references", async () => {
  const [htmlSource, shellSource] = await readSurfaceSources();

  for (const token of [
    "Current project context",
    "No fabricated project is selected by default.",
    "Persisted projects",
    "Server-owned JSON is authoritative.",
    "Browser storage is a cache updated only after successful server save or read",
    "Read-only Project Browser references",
    "Reference records may be inspected but cannot be restored unless they are persisted.",
    "cs-shell-project-popout-list",
    "cs-shell-project-popout-saved-list",
    "cs-shell-project-popout-reference-list",
    "cs-shell-project-popout-selection-summary",
    "cs-shell-project-popout-restore-reason",
    "cs-shell-project-popout-outcome",
  ]) {
    assert.equal(htmlSource.includes(token), true, token);
  }
  for (const prohibited of ["Alpha, Bravo, and Charlie", "Current workspace fixtures", "Durable project persistence is unavailable"] ) {
    assert.equal(htmlSource.includes(prohibited), false, prohibited);
  }

  for (const token of [
    CONTRACT_ID,
    "Active restored project",
    "Persisted project",
    "Read-only reference",
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

test("Restore remains fail-closed without a persisted selection and Save/Restore outcomes stay explicit", async () => {
  const [htmlSource, shellSource] = await readSurfaceSources();

  assert.match(
    shellSource,
    /restore\.disabled = browser\.capabilities\?\.restore !== true \|\| selectedEnvelope\?\.restoreEligible !== true/,
  );
  for (const token of [
    "Restore disabled: Project Browser restore capability is unavailable.",
    "Restore disabled: select a persisted project first.",
    "Restore disabled: ${selected.restoreDisabledReason",
    "Persisted project saved:",
    "Memory-only project envelope saved:",
    "Optional in-process registration acknowledged.",
    "Optional in-process registration pending.",
    "Optional in-process registration blocked or unavailable:",
    "Server-owned JSON is authoritative; browser storage was updated after server success.",
    "Persisted project restored:",
    "Hydration payloads prepared:",
    "Restore used the server-authoritative persisted envelope loaded into Project Browser.",
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
  assert.match(saveSource, /await projectPersistenceClient\.saveRecord\(record\)/);
  assert.match(saveSource, /restorePersistenceRollback\(persistenceRollback\)/);
  assert.match(saveSource, /project-save-durable-persistence-complete/);
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

test("truthful Save/Open surface uses only the approved persistence client and adds no Engine or provider widening", async () => {
  const [, shellSource] = await readSurfaceSources();
  const truthfulSurfaceSource = sourceSlice(
    shellSource,
    "function setProjectTopbarActionOutcome(outcome = {})",
    "function renderCompanyTopbarPopout(context)",
  );

  assert.doesNotMatch(
    truthfulSurfaceSource,
    /XMLHttpRequest|WebSocket|writeFile|appendFile|mkdir|unlink|createServer|listen\s*\(/,
  );
  assert.doesNotMatch(
    truthfulSurfaceSource,
    /invokeSelectedProjectReadonlyEngine|Run Engine|engineExecutionEnabled|engineExecutionAttempted|hubspot\.com|api\.hubapi\.com|priceAmount/,
  );
  assert.match(shellSource, /projectPersistenceLive/);
  assert.match(shellSource, /projectPersistenceClient\.saveRecord/);
  assert.match(truthfulSurfaceSource, /Server-owned JSON is authoritative/);
  assert.match(truthfulSurfaceSource, /Persistence rollback mode is active/);
});
