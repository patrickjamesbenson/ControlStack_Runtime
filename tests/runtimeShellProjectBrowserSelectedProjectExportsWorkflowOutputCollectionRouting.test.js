import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getShellProjectBrowserSelectedProjectExportAction,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_OUTPUT_COLLECTION_ROUTING_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

test("output collection routing contract keeps the existing public schemas and exactly one real project-ies output", async () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_OUTPUT_COLLECTION_ROUTING_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-OUTPUT-COLLECTION-ROUTING-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-exports-workflow.v1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.project-ies-export-item.v1",
  );

  const workflowDescriptor = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: { projectBrowser: { selectedProjectId: null, projects: [] } },
    services: {},
  });

  assert.equal(Object.isFrozen(workflowDescriptor), true);
  assert.equal(Object.isFrozen(workflowDescriptor.outputs), true);
  assert.equal(workflowDescriptor.exportItemCount, 1);
  assert.equal(workflowDescriptor.outputs.length, 1);
  assert.deepEqual(
    workflowDescriptor.outputs.map((output) => output.exportId),
    ["project-ies"],
  );
  assert.equal(
    getShellProjectBrowserSelectedProjectExportAction(workflowDescriptor, "project-ies"),
    null,
  );
  assert.equal(
    getShellProjectBrowserSelectedProjectExportAction(workflowDescriptor, "project-ies-extra"),
    null,
  );
});

test("prepared actions are retained privately by descriptor and exact exportId", async () => {
  const workflowSource = await readFile(
    new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    workflowSource,
    /SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_OUTPUT_COLLECTION_ROUTING_CONTRACT_ID/,
  );
  assert.match(workflowSource, /function buildProjectIesExportItem\s*\(/);
  assert.doesNotMatch(workflowSource, /function buildExportItem\s*\(/);
  assert.match(
    workflowSource,
    /PRIVATE_PREPARED_ACTIONS\.set\(\s*descriptor,\s*new Map\(\[\["project-ies", preparedAction\]\]\),\s*\)/s,
  );
  assert.match(
    workflowSource,
    /getShellProjectBrowserSelectedProjectExportAction\(\s*workflowDescriptor,\s*exportId = "project-ies",\s*\)/s,
  );
  assert.match(
    workflowSource,
    /PRIVATE_PREPARED_ACTIONS\.get\(workflowDescriptor\)\?\.get\(exportId\) \|\| null/,
  );
  assert.doesNotMatch(
    workflowSource,
    /PRIVATE_PREPARED_ACTIONS\.set\(descriptor, preparedAction\)/,
  );
});

test("shell renders the descriptor output collection and routes delegated actions by exact exportId", async () => {
  const [shellSource, styleSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/styles.css", import.meta.url), "utf8"),
  ]);

  for (const symbol of [
    "projectBrowserSelectedProjectExportControls",
    "projectBrowserSelectedProjectExportOutcomeStates",
    "renderProjectBrowserSelectedProjectExportItems(workflowDescriptor)",
    "renderProjectBrowserSelectedProjectExportItem(workflowDescriptor, output)",
    "renderProjectBrowserSelectedProjectExportOutcome(",
    "handleProjectBrowserSelectedProjectExportAction(event)",
  ]) {
    assert.equal(shellSource.includes(symbol), true, symbol);
  }

  assert.match(
    shellSource,
    /for \(const output of outputs\) \{\s*renderProjectBrowserSelectedProjectExportItem\(workflowDescriptor, output\);\s*\}/s,
  );
  assert.match(
    shellSource,
    /const exportId = button\?\.dataset\?\.shellExportId;/,
  );
  assert.match(
    shellSource,
    /candidate\?\.exportId === exportId/,
  );
  assert.match(
    shellSource,
    /projectBrowserSelectedProjectExportControls\.get\(exportId\)/,
  );
  assert.match(
    shellSource,
    /projectBrowserSelectedProjectExportOutcomeStates\.get\(exportId\)/,
  );
  assert.match(
    shellSource,
    /getShellProjectBrowserSelectedProjectExportAction\(\s*projectBrowserSelectedProjectExportsWorkflow,\s*exportId,\s*\)/s,
  );
  assert.match(
    shellSource,
    /projectBrowserSelectedProjectExportsItems\?\.addEventListener\(\s*"click",\s*handleProjectBrowserSelectedProjectExportAction,\s*\)/s,
  );

  assert.doesNotMatch(shellSource, /outputs\?\.\[0\]|outputs\[0\]/);
  assert.equal(shellSource.includes("projectBrowserProjectIesExportDownloadButton"), false);
  assert.doesNotMatch(shellSource, /const exportsItem\s*=\s*document\.createElement/);
  assert.match(styleSource, /\.cs-shell__project-browser-export-items\s*\{/);
  assert.match(styleSource, /\.cs-shell__project-browser-export-item-main\s*\{/);

  for (const prohibited of [
    "Download PDF",
    "Download CSV",
    "Download JSON",
    "Download ZIP",
    "Evidence bundle",
    "Batch export",
    "Export all",
    "Handoff export package",
  ]) {
    assert.equal(shellSource.includes(prohibited), false, prohibited);
  }
});
