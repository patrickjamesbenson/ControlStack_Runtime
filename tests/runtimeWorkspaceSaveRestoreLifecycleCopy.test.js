import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  SHELL_OWNERSHIP,
  SHELL_PROJECT_LIFECYCLE_IMPLEMENTATIONS,
  PHASE_4_DEFERRED_IMPLEMENTATIONS,
  createContractDiagnostics,
} from "../packages/workspace-kernel/contracts.js";

const sourceUrls = Object.freeze({
  selector: new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url),
  emergence: new URL("../packages/modules/emergence/emergenceViewModel.js", import.meta.url),
  sceneBuilder: new URL("../packages/modules/scene-builder/sceneBuilderViewModel.js", import.meta.url),
  shell: new URL("../apps/workspace-shell/src/shell.js", import.meta.url),
});

async function sources() {
  return Object.fromEntries(await Promise.all(Object.entries(sourceUrls).map(async ([key, url]) => [
    key,
    await readFile(url, "utf8"),
  ])));
}

test("workspace contract classifies save, restore and hydrate as live shell-owned Project Browser lifecycle", () => {
  assert.equal(SHELL_OWNERSHIP.saveRestore, "shell");
  assert.deepEqual(SHELL_PROJECT_LIFECYCLE_IMPLEMENTATIONS, {
    save: "live-through-project-browser",
    restore: "live-through-project-browser",
    hydrate: "live-through-project-browser",
    ownership: "shell",
    moduleLocalProjectMutation: "prohibited",
  });
  assert.equal(Object.hasOwn(PHASE_4_DEFERRED_IMPLEMENTATIONS, "saveRestore"), false);
  assert.equal(PHASE_4_DEFERRED_IMPLEMENTATIONS.handoff, "deferred-real-implementation");
  assert.equal(PHASE_4_DEFERRED_IMPLEMENTATIONS.hubspotWrites, "deferred-real-implementation");

  const diagnostics = createContractDiagnostics();
  assert.equal(diagnostics.shellOwnership.saveRestore, "shell");
  assert.equal(diagnostics.projectLifecycle.save, "live-through-project-browser");
  assert.equal(diagnostics.projectLifecycle.restore, "live-through-project-browser");
  assert.equal(diagnostics.projectLifecycle.hydrate, "live-through-project-browser");
  assert.equal(diagnostics.projectLifecycle.moduleLocalProjectMutation, "prohibited");
  assert.equal(Object.hasOwn(diagnostics.deferred, "saveRestore"), false);
});

test("Selector and Emergence state live save/restore/hydrate truth while keeping handoff and provider writes deferred", async () => {
  const { selector, emergence } = await sources();
  for (const source of [selector, emergence]) {
    assert.match(source, /Save is shell-owned and live through Project Browser/);
    assert.match(source, /Restore and hydrate are shell-owned and live through Project Browser/);
    assert.match(source, /Handoff and share remain shell-owned and deferred/);
    assert.match(source, /CRM and provider writes remain shell-owned and deferred/);
    assert.doesNotMatch(source, /Save is shell-owned and deferred|Restore is shell-owned and deferred/i);
  }
});

test("Scene Builder separates live shell lifecycle from deferred handoff/share", async () => {
  const { sceneBuilder } = await sources();
  assert.match(sceneBuilder, /saveRestoreHydrateLive:\s*"yes — shell-owned through Project Browser"/);
  assert.match(sceneBuilder, /handoffShareLive:\s*"no — shell-owned and deferred"/);
  assert.match(sceneBuilder, /Save \/ restore \/ hydrate are shell-owned and live through Project Browser/);
  assert.match(sceneBuilder, /Handoff \/ share remain shell-owned and deferred/);
  assert.doesNotMatch(sceneBuilder, /saveRestoreHandoffLive|Save \/ restore \/ handoff remain deferred/i);
});

test("Project Browser remains the actual save, restore and hydrate owner; modules add no lifecycle implementation", async () => {
  const { selector, emergence, sceneBuilder, shell } = await sources();
  assert.match(shell, /heading\.textContent = "Project Browser"/);
  assert.match(shell, /services\.projectBrowser\.saveProject\(/);
  assert.match(shell, /services\.projectBrowser\.restoreProject\(/);
  assert.match(shell, /mountedModuleApi\.hydrate\(/);

  const moduleSources = [selector, emergence, sceneBuilder].join("\n");
  assert.doesNotMatch(moduleSources, /services\.projectBrowser\.(?:saveProject|restoreProject)\(/);
  assert.doesNotMatch(moduleSources, /create.*(?:save|restore|hydrate).*route|postEndpointsAdded:\s*true|provider.*write.*true/i);
});

test("no stale save/restore-deferred phrase remains across the four governed live surfaces", async () => {
  const { selector, emergence, sceneBuilder } = await sources();
  const governed = [
    selector,
    emergence,
    sceneBuilder,
    await readFile(new URL("../packages/workspace-kernel/contracts.js", import.meta.url), "utf8"),
  ].join("\n");

  assert.doesNotMatch(governed, /Save is shell-owned and deferred|Restore is shell-owned and deferred|Save \/ restore \/ handoff remain deferred|saveRestore:\s*"deferred-real-implementation"/i);
});
