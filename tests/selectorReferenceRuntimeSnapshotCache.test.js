import test from "node:test";
import assert from "node:assert/strict";

import {
  createSelectorReferenceRuntimeSnapshotCache,
} from "../packages/workspace-kernel/selectorReferenceRuntimeSnapshotCache.js";
import {
  buildSelectorReferenceOptions,
  SELECTOR_REFERENCE_OPTIONS_PATH,
} from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import {
  buildSelectorReferenceStatus,
  SELECTOR_CRITICAL_TABLES,
  SELECTOR_REFERENCE_STATUS_PATH,
} from "../packages/workspace-kernel/selectorReferenceService.js";

function sourceStat(version = 1, size = 1000) {
  return {
    isFile: () => true,
    mtimeMs: version,
    mtime: new Date(`2026-07-${String(version).padStart(2, "0")}T00:00:00.000Z`),
    size,
  };
}

function selectorSnapshot() {
  const snapshot = Object.fromEntries(SELECTOR_CRITICAL_TABLES.map((table) => [table, []]));
  snapshot.SYSTEM = [{
    system: "DNX",
    system_variant_1: "60",
    label: "DNX 60",
    approved: "yes",
    status: "available",
  }];
  snapshot.BOARDS = [{
    board_id: "BOARD-DALI",
    selector_system_reference: "DNX",
    native_control_type: "DALI-2 DT6",
    control_type_labels: "DALI-2 DT6",
    cct: "4000K",
    cri: "CRI90",
  }];
  snapshot.DRIVERS = [{
    driver_id: "DRIVER-DALI",
    selector_system_reference: "DNX",
    native_control_type: "DALI-2 DT6",
  }];
  snapshot.sourceInputFingerprint = "source-fingerprint-1";
  snapshot.boardDataSourceVersion = "board-version-1";
  return snapshot;
}

function field(payload, fieldKey) {
  return payload.fields.find((item) => item.fieldKey === fieldKey);
}

test("runtime snapshot cache shares concurrent snapshot/index work and reuses the settled result", async () => {
  let readCount = 0;
  let snapshotLoadCount = 0;
  let indexBuildCount = 0;
  let releaseRead;
  const readGate = new Promise((resolve) => { releaseRead = resolve; });
  const fsApi = {
    async stat() {
      return sourceStat(1);
    },
    async readFile() {
      readCount += 1;
      await readGate;
      return JSON.stringify({ SYSTEM: [] });
    },
  };
  const cache = createSelectorReferenceRuntimeSnapshotCache({
    onSnapshotLoad: () => { snapshotLoadCount += 1; },
    onIndexBuild: () => { indexBuildCount += 1; },
  });
  const buildIndex = (snapshot) => ({ systemCount: snapshot.SYSTEM.length });

  const first = cache.getIndex({ sourcePath: "C:/private/active.json", fsApi, indexKey: "default", buildIndex });
  const second = cache.getIndex({ sourcePath: "C:/private/active.json", fsApi, indexKey: "default", buildIndex });
  releaseRead();

  const [firstResult, secondResult] = await Promise.all([first, second]);
  assert.strictEqual(firstResult.snapshot, secondResult.snapshot);
  assert.strictEqual(firstResult.index, secondResult.index);
  assert.equal(readCount, 1);
  assert.equal(snapshotLoadCount, 1);
  assert.equal(indexBuildCount, 1);

  const reused = await cache.getIndex({ sourcePath: "C:/private/active.json", fsApi, indexKey: "default", buildIndex });
  assert.strictEqual(reused.snapshot, firstResult.snapshot);
  assert.strictEqual(reused.index, firstResult.index);
  assert.equal(readCount, 1);
  assert.equal(snapshotLoadCount, 1);
  assert.equal(indexBuildCount, 1);
});

test("runtime snapshot cache invalidates on effective fingerprint or active source path change", async () => {
  let version = 1;
  let readCount = 0;
  let indexBuildCount = 0;
  const fsApi = {
    async stat() {
      return sourceStat(version, 1000 + version);
    },
    async readFile(pathValue) {
      readCount += 1;
      return JSON.stringify({ pathValue, version });
    },
  };
  const cache = createSelectorReferenceRuntimeSnapshotCache({
    onIndexBuild: () => { indexBuildCount += 1; },
  });
  const buildIndex = (snapshot) => ({ version: snapshot.version, pathValue: snapshot.pathValue });

  const first = await cache.getIndex({ sourcePath: "C:/private/active-a.json", fsApi, indexKey: "default", buildIndex });
  const reused = await cache.getIndex({ sourcePath: "C:/private/active-a.json", fsApi, indexKey: "default", buildIndex });
  assert.strictEqual(reused.index, first.index);

  version = 2;
  const fingerprintChanged = await cache.getIndex({ sourcePath: "C:/private/active-a.json", fsApi, indexKey: "default", buildIndex });
  assert.notStrictEqual(fingerprintChanged.index, first.index);
  assert.equal(fingerprintChanged.index.version, 2);

  const pathChanged = await cache.getIndex({ sourcePath: "C:/private/active-b.json", fsApi, indexKey: "default", buildIndex });
  assert.notStrictEqual(pathChanged.index, fingerprintChanged.index);
  assert.equal(pathChanged.index.pathValue, "C:/private/active-b.json");
  assert.equal(readCount, 3);
  assert.equal(indexBuildCount, 3);
});

test("status and options share one source-backed runtime snapshot/index without widening write or redaction boundaries", async () => {
  const activePath = "C:/private/authority-reference/active.json";
  const materialisedPath = "C:/private/authority-reference/materialised.json";
  const calls = [];
  let sourceReadCount = 0;
  let snapshotLoadCount = 0;
  let indexBuildCount = 0;
  let releaseRead;
  const readGate = new Promise((resolve) => { releaseRead = resolve; });
  const snapshotText = JSON.stringify(selectorSnapshot());
  const fsApi = {
    async stat(pathValue) {
      calls.push({ method: "stat", pathValue });
      return pathValue === materialisedPath ? sourceStat(1, 500) : sourceStat(1, snapshotText.length);
    },
    async readFile(pathValue) {
      calls.push({ method: "readFile", pathValue });
      assert.equal(pathValue, activePath);
      sourceReadCount += 1;
      await readGate;
      return snapshotText;
    },
  };
  const cache = createSelectorReferenceRuntimeSnapshotCache({
    onSnapshotLoad: () => { snapshotLoadCount += 1; },
    onIndexBuild: () => { indexBuildCount += 1; },
  });

  const statusPromise = buildSelectorReferenceStatus({
    sourcePath: activePath,
    materialisedSnapshotPath: materialisedPath,
    fsApi,
    runtimeSnapshotCache: cache,
  });
  const optionsPromise = buildSelectorReferenceOptions({
    sourcePath: activePath,
    fsApi,
    runtimeSnapshotCache: cache,
  });
  releaseRead();

  const [status, options] = await Promise.all([statusPromise, optionsPromise]);
  assert.equal(status.ok, true);
  assert.equal(status.endpoint, SELECTOR_REFERENCE_STATUS_PATH);
  assert.equal(options.ok, true);
  assert.equal(options.endpoint, SELECTOR_REFERENCE_OPTIONS_PATH);
  assert.deepEqual(status.selectorOptions, options);
  assert.equal(sourceReadCount, 1);
  assert.equal(snapshotLoadCount, 1);
  assert.equal(indexBuildCount, 1);
  assert.equal(field(options, "controlType").options.some((option) => option.value === "DALI-2 DT6"), true);

  const reused = await buildSelectorReferenceOptions({
    sourcePath: activePath,
    fsApi,
    runtimeSnapshotCache: cache,
    constraints: { system: "DNX|60" },
  });
  assert.equal(reused.ok, true);
  assert.equal(sourceReadCount, 1);
  assert.equal(snapshotLoadCount, 1);
  assert.equal(indexBuildCount, 1);

  for (const payload of [status, options, reused]) {
    const serialised = JSON.stringify(payload);
    assert.equal(payload.readOnly, true);
    assert.equal(payload.runtimeDataMutationEnabled, false);
    assert.equal(payload.rawRowsExposed, false);
    assert.equal(payload.credentialsExposed, false);
    assert.equal(payload.privatePathsExposed, false);
    assert.equal(serialised.includes(activePath), false);
    assert.equal(serialised.includes(materialisedPath), false);
  }
  assert.deepEqual([...new Set(calls.map((call) => call.method))].sort(), ["readFile", "stat"]);
});
