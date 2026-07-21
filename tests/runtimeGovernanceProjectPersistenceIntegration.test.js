import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createProjectService } from "../packages/workspace-kernel/projectService.js";
import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildWorkspaceSavedProjectRecord,
  WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID,
} from "../packages/workspace-kernel/governance/projectPersistenceContract.js";

function envelope(projectId = "project-one") {
  const savedAt = "2026-07-21T12:00:00.000Z";
  return {
    schema: WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID,
    owner: "shell",
    source: "test",
    browserOnly: false,
    readOnly: false,
    envelopeId: `env-${projectId}-one`,
    projectId,
    title: "Project One",
    client: "Client One",
    site: "Sydney",
    createdAt: savedAt,
    updatedAt: savedAt,
    savedAt,
    savedBy: {},
    project: {
      metadata: { projectId, title: "Project One" },
      currentProject: { projectId, title: "Project One", client: "Client One", site: "Sydney" },
      selection: {},
    },
    shell: { phase: "test", contractVersion: "test", visibility: {}, flags: {}, downstream: {} },
    modules: {},
    lifecycle: { owner: "shell", status: "draft", custody: {}, handoff: {} },
    restore: {},
  };
}

test("project service starts without fabricated Alpha, Bravo or Charlie truth", () => {
  const service = createProjectService();
  const snapshot = service.getProjectSnapshot();
  assert.equal(snapshot.currentProject.projectId, null);
  assert.equal(snapshot.currentProject.title, "No project selected");
  assert.equal(snapshot.metadata.readiness, "project-required");
  assert.deepEqual(snapshot.selection.availableProjects, []);
  assert.deepEqual(service.getAvailableProjects(), []);
  assert.equal(service.selectProject("project-alpha").accepted, false);
});

test("saved-project owner imports canonical records, preserves passive links and rolls back exactly", () => {
  const store = createSavedProjectStore();
  assert.deepEqual(store.listProjectSummaries(), []);
  const record = buildWorkspaceSavedProjectRecord({
    envelope: envelope(),
    hubspotDealId: "deal-123",
    hubspotContactId: "contact-456",
    hubspotCompanyId: "company-789",
  });
  const imported = store.replacePersistedProjectRecords([record]);
  assert.equal(imported.accepted, true);
  assert.deepEqual(imported.importedProjectIds, ["project-one"]);
  assert.equal(store.listProjectSummaries().length, 1);
  assert.deepEqual(store.getPersistenceRecord("project-one"), record);
  assert.deepEqual(store.listPersistenceRecords(), [record]);

  const rollback = store.capturePersistenceRollback();
  store.replacePersistedProjectRecords([]);
  assert.deepEqual(store.listProjectSummaries(), []);
  assert.equal(store.restorePersistenceRollback(rollback).accepted, true);
  assert.deepEqual(store.getPersistenceRecord("project-one"), record);
});

test("malformed persisted records are isolated inside the existing saved-project owner", () => {
  const store = createSavedProjectStore();
  const valid = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
  const result = store.replacePersistedProjectRecords([
    valid,
    { ...valid, projectId: "project-two" },
  ]);
  assert.equal(result.accepted, true);
  assert.deepEqual(result.importedProjectIds, ["project-one"]);
  assert.equal(result.skipped.length, 1);
  assert.deepEqual(store.listProjectSummaries().map((item) => item.projectId), ["project-one"]);
});

test("server owns exactly the two approved persistence routes", async () => {
  const serverSource = await readFile(new URL("../server.js", import.meta.url), "utf8");
  const sessionRoutes = [...serverSource.matchAll(/"(\/api\/session\/[a-z-]+)"/g)]
    .map((match) => match[1]);
  assert.deepEqual([...new Set(sessionRoutes)].sort(), [
    "/api/session/read",
    "/api/session/save",
  ]);
  assert.match(serverSource, /createServerProjectPersistenceStore\(\{ rootDirectory: ROOT \}\)/);
  assert.match(serverSource, /isAllowedProjectPersistencePost/);
  assert.match(serverSource, /sendProjectPersistenceSave/);
  assert.match(serverSource, /sendProjectPersistenceRead/);
  assert.doesNotMatch(serverSource, /\/api\/session\/(?:share|handoff|email|token|cleanup|crm|deliver|download)/);
});

test("shell persistence is server-first, cache-after-success and Engine-independent", async () => {
  const [shellSource, clientSource, storeSource, engineSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/projectPersistenceClient.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/governance/serverProjectPersistenceStore.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/engineRunTableDomain.js", import.meta.url), "utf8"),
  ]);

  assert.match(shellSource, /projectPersistenceLive/);
  assert.match(shellSource, /capturePersistenceRollback\(\)/);
  assert.match(shellSource, /await projectPersistenceClient\.saveRecord\(record\)/);
  assert.match(shellSource, /restorePersistenceRollback\(persistenceRollback\)/);
  assert.match(shellSource, /void hydratePersistedProjectsOnBoot\(\)/);
  assert.match(clientSource, /const payload = await post\(PROJECT_PERSISTENCE_SAVE_PATH/);
  assert.match(clientSource, /writeCacheRecord\(storage, saved\)/);
  assert.equal(
    clientSource.indexOf("const payload = await post(PROJECT_PERSISTENCE_SAVE_PATH" )
      < clientSource.indexOf("writeCacheRecord(storage, saved)"),
    true,
  );
  assert.match(storeSource, /owner: "governance-shell"/);
  assert.match(storeSource, /authority: "server-json"/);
  for (const forbidden of [
    "workspace_saved_project.v2",
    "hubspotDealId",
    "hubspotContactId",
    "hubspotCompanyId",
    "projectPersistenceLive",
    "/api/session/save",
    "/api/session/read",
  ]) {
    assert.equal(engineSource.includes(forbidden), false, forbidden);
  }
});

test("project persistence sources contain no provider call, price or delivery activation", async () => {
  const sources = await Promise.all([
    readFile(new URL("../packages/workspace-kernel/governance/projectPersistenceContract.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/governance/serverProjectPersistenceStore.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/projectPersistenceClient.js", import.meta.url), "utf8"),
  ]);
  const combined = sources.join("\n");
  for (const prohibited of [
    "hubspot.com",
    "api.hubapi.com",
    "fetchHubspot",
    "writeHubspot",
    "priceAmount",
    "downloadEnabled: true",
    "deliveryEnabled: true",
    "emailSend: true",
  ]) {
    assert.equal(combined.includes(prohibited), false, prohibited);
  }
});
