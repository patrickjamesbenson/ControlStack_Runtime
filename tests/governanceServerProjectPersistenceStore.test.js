import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, rename, mkdir, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildWorkspaceSavedProjectRecord,
  WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID,
} from "../packages/workspace-kernel/governance/projectPersistenceContract.js";
import {
  createServerProjectPersistenceStore,
} from "../packages/workspace-kernel/governance/serverProjectPersistenceStore.js";

function envelope(projectId = "project-one", savedAt = "2026-07-21T12:00:00.000Z") {
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

async function withTempDirectory(fn) {
  const root = await mkdtemp(join(tmpdir(), "controlstack-governance-persistence-"));
  try {
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("server JSON survives store recreation and keeps one file per stable project", async () => {
  await withTempDirectory(async (root) => {
    const directory = join(root, "projects");
    const env = { CS_SESSION_PROJECT_DIR: directory };
    const record = buildWorkspaceSavedProjectRecord({
      envelope: envelope(),
      hubspotDealId: "deal-123",
    });
    const first = createServerProjectPersistenceStore({ rootDirectory: root, env });
    const saved = await first.saveProject({ projectId: "project-one", record });
    assert.equal(saved.ok, true);
    assert.equal(saved.atomicReplacement, true);

    const restarted = createServerProjectPersistenceStore({ rootDirectory: root, env });
    const read = await restarted.readProject("project-one");
    assert.equal(read.ok, true);
    assert.deepEqual(read.record, record);

    const files = await readdir(directory);
    assert.deepEqual(files, ["project-one.json"]);
  });
});

test("atomic replacement failure preserves the previous authoritative file", async () => {
  await withTempDirectory(async (root) => {
    const directory = join(root, "projects");
    const env = { CS_SESSION_PROJECT_DIR: directory };
    const initial = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
    const store = createServerProjectPersistenceStore({ rootDirectory: root, env });
    await store.saveProject({ projectId: "project-one", record: initial });
    const target = join(directory, "project-one.json");
    const before = await readFile(target, "utf8");

    const updatedEnvelope = envelope("project-one", "2026-07-21T13:00:00.000Z");
    updatedEnvelope.envelopeId = "env-project-one-two";
    const updated = buildWorkspaceSavedProjectRecord({ envelope: updatedEnvelope });
    const failing = createServerProjectPersistenceStore({
      rootDirectory: root,
      env,
      fs: {
        mkdir,
        readFile,
        readdir,
        writeFile,
        rm,
        async rename() {
          throw new Error("simulated-atomic-replacement-failure");
        },
      },
    });
    await assert.rejects(
      () => failing.saveProject({ projectId: "project-one", record: updated }),
      /simulated-atomic-replacement-failure/,
    );
    assert.equal(await readFile(target, "utf8"), before);
    const files = await readdir(directory);
    assert.deepEqual(files, ["project-one.json"]);
  });
});

test("unsafe identity and path traversal are rejected before filesystem access", async () => {
  await withTempDirectory(async (root) => {
    const store = createServerProjectPersistenceStore({ rootDirectory: root });
    for (const projectId of ["../escape", "project/escape", "Project-One", "saved-alpha"]) {
      assert.throws(() => store.projectFile(projectId), TypeError, projectId);
      await assert.rejects(
        () => store.saveProject({ projectId, record: {} }),
        TypeError,
      );
    }
  });
});

test("read-all isolates malformed records and preserves valid projects", async () => {
  await withTempDirectory(async (root) => {
    const directory = join(root, "projects");
    const env = { CS_SESSION_PROJECT_DIR: directory };
    const store = createServerProjectPersistenceStore({ rootDirectory: root, env });
    await store.saveProject({
      projectId: "project-one",
      record: buildWorkspaceSavedProjectRecord({ envelope: envelope() }),
    });
    await writeFile(join(directory, "project-bad.json"), "{not-json", "utf8");
    await writeFile(join(directory, "../ignored.txt"), "ignored", "utf8");

    const result = await store.readAllProjects();
    assert.equal(result.ok, true);
    assert.deepEqual(result.records.map((record) => record.projectId), ["project-one"]);
    assert.deepEqual(result.skipped, [
      { projectId: "project-bad", blocker: "project-record-malformed" },
    ]);
  });
});

test("missing project and missing directory fail closed without creating data", async () => {
  await withTempDirectory(async (root) => {
    const store = createServerProjectPersistenceStore({
      rootDirectory: root,
      env: { CS_SESSION_PROJECT_DIR: join(root, "missing") },
    });
    const one = await store.readProject("project-one");
    assert.equal(one.ok, false);
    assert.equal(one.found, false);
    assert.equal(one.blocker, "project-not-found");
    const all = await store.readAllProjects();
    assert.equal(all.ok, true);
    assert.deepEqual(all.records, []);
  });
});
