import test from "node:test";
import assert from "node:assert/strict";

import { createProjectPersistenceClient } from "../apps/workspace-shell/src/projectPersistenceClient.js";
import {
  buildWorkspaceSavedProjectRecord,
  workspaceSavedProjectCacheKey,
  WORKSPACE_SAVED_PROJECT_BROWSER_INDEX_KEY,
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

function storageHarness() {
  const values = new Map();
  const calls = [];
  return {
    calls,
    values,
    storage: {
      getItem(key) {
        calls.push(`get:${key}`);
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        calls.push(`set:${key}`);
        values.set(key, value);
      },
    },
  };
}

function response(payload, ok = true) {
  return {
    ok,
    async json() {
      return payload;
    },
  };
}

test("successful server save precedes every browser cache write", async () => {
  const record = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
  const harness = storageHarness();
  const order = [];
  const client = createProjectPersistenceClient({
    enabled: true,
    storage: {
      ...harness.storage,
      setItem(key, value) {
        order.push(`cache:${key}`);
        harness.storage.setItem(key, value);
      },
    },
    async fetchImpl(path, request) {
      order.push(`server:${path}`);
      assert.equal(harness.values.size, 0);
      assert.equal(request.method, "POST");
      assert.deepEqual(JSON.parse(request.body), { projectId: "project-one", record });
      return response({ ok: true, record });
    },
  });

  const saved = await client.saveRecord(record);
  assert.equal(saved.ok, true);
  assert.equal(order[0], "server:/api/session/save");
  assert.equal(order.slice(1).every((item) => item.startsWith("cache:")), true);
  assert.deepEqual(
    JSON.parse(harness.values.get(workspaceSavedProjectCacheKey("project-one"))),
    record,
  );
  assert.deepEqual(
    JSON.parse(harness.values.get(WORKSPACE_SAVED_PROJECT_BROWSER_INDEX_KEY)),
    ["project-one"],
  );
});

test("server failure leaves browser cache untouched", async () => {
  const record = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
  const harness = storageHarness();
  const client = createProjectPersistenceClient({
    enabled: true,
    storage: harness.storage,
    async fetchImpl() {
      return response({ ok: false, blocker: "server-save-failed" }, false);
    },
  });
  await assert.rejects(() => client.saveRecord(record), /server-save-failed/);
  assert.equal(harness.values.size, 0);
  assert.equal(harness.calls.some((call) => call.startsWith("set:")), false);
});

test("read-all caches only validated server records in deterministic order", async () => {
  const first = buildWorkspaceSavedProjectRecord({ envelope: envelope("project-a") });
  const second = buildWorkspaceSavedProjectRecord({ envelope: envelope("project-b") });
  const harness = storageHarness();
  const client = createProjectPersistenceClient({
    enabled: true,
    storage: harness.storage,
    async fetchImpl(path, request) {
      assert.equal(path, "/api/session/read");
      assert.deepEqual(JSON.parse(request.body), { all: true });
      return response({ ok: true, records: [second, first], skipped: [{ projectId: "bad", blocker: "malformed" }] });
    },
  });
  const result = await client.readAllProjects();
  assert.deepEqual(result.records.map((record) => record.projectId), ["project-a", "project-b"]);
  assert.deepEqual(JSON.parse(harness.values.get(WORKSPACE_SAVED_PROJECT_BROWSER_INDEX_KEY)), ["project-a", "project-b"]);
  assert.deepEqual(result.skipped, [{ projectId: "bad", blocker: "malformed" }]);
});

test("explicit migration is idempotent and retains one untouched backup", async () => {
  const harness = storageHarness();
  const saved = [];
  const client = createProjectPersistenceClient({
    enabled: true,
    storage: harness.storage,
    async fetchImpl(_path, request) {
      const body = JSON.parse(request.body);
      saved.push(body.record.projectId);
      return response({ ok: true, record: body.record });
    },
  });
  const legacy = [{
    schemaId: "workspace_saved_project.v1",
    version: 1,
    job_id: "project-one",
    untouched: "legacy-source",
  }];
  const options = {
    sourceKey: "legacy-projects",
    createEnvelopeFromDonorV1(_row, projectId) {
      return envelope(projectId);
    },
  };
  const first = await client.migrateExplicitRecords(legacy, options);
  const backupKey = "workspace_saved_project.v2:backup:legacy-projects";
  const backup = harness.values.get(backupKey);
  const second = await client.migrateExplicitRecords(legacy, options);
  assert.deepEqual(first.migrated, ["project-one"]);
  assert.deepEqual(second.migrated, ["project-one"]);
  assert.equal(harness.values.get(backupKey), backup);
  assert.deepEqual(JSON.parse(backup), legacy);
  assert.deepEqual(saved, ["project-one", "project-one"]);
});

test("explicit live-memory flush reuses canonical migration without deleting source records", async () => {
  const record = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
  const harness = storageHarness();
  const sent = [];
  const client = createProjectPersistenceClient({
    enabled: true,
    storage: harness.storage,
    async fetchImpl(_path, request) {
      const body = JSON.parse(request.body);
      sent.push(body.record.projectId);
      return response({ ok: true, record: body.record });
    },
  });
  const source = [record];
  const result = await client.flushLiveMemoryRecords(source);
  assert.deepEqual(result.migrated, ["project-one"]);
  assert.deepEqual(source, [record]);
  assert.deepEqual(sent, ["project-one"]);
  assert.deepEqual(
    JSON.parse(harness.values.get("workspace_saved_project.v2:backup:live-memory-flush")),
    source,
  );
});

test("rollback mode performs no server or cache work", async () => {
  const record = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
  const harness = storageHarness();
  let fetchCalls = 0;
  const client = createProjectPersistenceClient({
    enabled: false,
    storage: harness.storage,
    async fetchImpl() {
      fetchCalls += 1;
      throw new Error("must-not-run");
    },
  });
  const save = await client.saveRecord(record);
  const read = await client.readAllProjects();
  assert.equal(save.memoryOnly, true);
  assert.equal(read.memoryOnly, true);
  assert.equal(fetchCalls, 0);
  assert.equal(harness.values.size, 0);
});
