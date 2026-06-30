import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
  AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
} from "../packages/workspace-kernel/authorityReferenceMaterialiserService.js";
import {
  loadRuntimeDataReadOnlySource,
  validateRuntimeDataReadOnlySourcePath,
} from "../packages/workspace-kernel/runtimeDataReadOnlySourceAccessService.js";

function fakeStat({ isFile = true, size = 789, mtime = new Date("2026-06-30T00:00:00.000Z") } = {}) {
  return {
    isFile: () => isFile,
    size,
    mtime,
  };
}

function fakeFs({ snapshot, statOk = true, readable = true, writes = [] } = {}) {
  return {
    async stat() {
      if (!statOk) {
        const error = new Error("missing");
        error.code = "ENOENT";
        throw error;
      }
      return fakeStat();
    },
    async readFile() {
      if (!readable) {
        const error = new Error("blocked");
        error.code = "EACCES";
        throw error;
      }
      return typeof snapshot === "string" ? snapshot : JSON.stringify(snapshot);
    },
    async writeFile() {
      writes.push("writeFile");
    },
    async mkdir() {
      writes.push("mkdir");
    },
  };
}

const validSnapshot = Object.freeze({
  SYSTEM: [{ system: "raw-system-row-value" }],
  OPTICS: [{ optic: "raw-optic-row-value" }],
  ACCESSORIES: [{ accessory: "raw-accessory-row-value" }],
  SPEC_CODES: [{ code: "raw-spec-code-row-value" }],
  BOARDS: [{ board: "raw-board-row-value" }],
  DRIVERS: [{ driver: "raw-driver-row-value" }],
  PURE_REF_STATE: [{ pure: "raw-pure-row-value" }],
  SYSTEM_COMPONENTS: [{ component: "raw-component-row-value" }],
  SYSTEM_BOM_DEFAULTS: [{ bom: "raw-bom-row-value" }],
  SYSTEM_POLICY: [{ policy: "raw-policy-row-value" }],
  FIELD_EDITABILITY: [{ field: "raw-field-editability-row-value" }],
  ROLES_AND_LANES: [{ lane: "raw-role-row-value" }],
  CODE_POLICY: [{ policy: "raw-code-policy-row-value" }],
  MESSAGES: [{ message: "raw-message-row-value" }],
  USERS: [{ email_login: "secret.user@example.com", role: "developer" }],
});

test("RuntimeData active source path validation is exact and confined", () => {
  const approved = validateRuntimeDataReadOnlySourcePath(AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH);
  const materialised = validateRuntimeDataReadOnlySourcePath(AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH);
  const donor = validateRuntimeDataReadOnlySourcePath("C:\\ControlStack\\data\\novondb.json");
  const traversal = validateRuntimeDataReadOnlySourcePath("C:\\ControlStack_RuntimeData\\authority-reference\\..\\archive\\novondb.json");

  assert.equal(approved.ok, true);
  assert.equal(approved.pathReturned, false);
  assert.equal(materialised.ok, false);
  assert.equal(materialised.code, "runtime-data-source-path-not-active-snapshot");
  assert.equal(donor.ok, false);
  assert.equal(donor.code, "runtime-data-source-path-outside-authority-reference-root");
  assert.equal(traversal.ok, false);
});

test("RuntimeData read-only loader loads internal snapshot without serialising raw rows", async () => {
  const writes = [];
  const access = await loadRuntimeDataReadOnlySource({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: validSnapshot, writes }),
  });

  assert.equal(access.ok, true);
  assert.equal(access.activeSourceDbLoadedReadOnly, true);
  assert.equal(access.snapshotAvailableForInternalProbe, true);
  assert.equal(Object.prototype.propertyIsEnumerable.call(access, "snapshot"), false);
  assert.equal(Object.isFrozen(access.snapshot), true);
  assert.equal(Array.isArray(access.snapshot.SYSTEM), true);
  assert.equal(access.snapshot.SYSTEM[0].system, "raw-system-row-value");

  assert.equal(access.safetyFlags.readOnly, true);
  assert.equal(access.safetyFlags.internalOnly, true);
  assert.equal(access.safetyFlags.rawRowsExposed, false);
  assert.equal(access.safetyFlags.rawUsersExposed, false);
  assert.equal(access.safetyFlags.runtimeDataMutationEnabled, false);
  assert.equal(access.safetyFlags.engineExecutionEnabled, false);
  assert.equal(access.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(access.safetyFlags.selectedResultPersistenceEnabled, false);
  assert.equal(access.safetyFlags.postEndpointAdded, false);
  assert.equal(access.safetyFlags.publicRouteAdded, false);
  assert.equal(access.accessPolicy.pathReturned, false);
  assert.equal(access.source.pathReturned, false);
  assert.equal(access.source.localPathExposureEnabled, false);
  assert.equal(typeof access.source.sourceFingerprint, "string");
  assert.equal(access.source.sourceFingerprint.length, 64);
  assert.equal(access.usersRedactionStatus.present, true);
  assert.equal(access.usersRedactionStatus.count, 1);
  assert.equal(access.usersRedactionStatus.personalIdentifiersExposed, false);
  assert.equal(access.tableSummary.find((table) => table.table === "SYSTEM").rowCount, 1);
  assert.deepEqual(writes, []);

  const serialised = JSON.stringify(access);
  assert.equal(serialised.includes("raw-system-row-value"), false);
  assert.equal(serialised.includes("raw-board-row-value"), false);
  assert.equal(serialised.includes("secret.user@example.com"), false);
  assert.equal(serialised.includes("email_login"), false);
  assert.equal(serialised.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serialised.includes("C:\\ControlStack"), false);
});

test("RuntimeData read-only loader fails closed on missing, unreadable, and invalid snapshots", async () => {
  const missing = await loadRuntimeDataReadOnlySource({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ statOk: false }),
  });
  const unreadable = await loadRuntimeDataReadOnlySource({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: validSnapshot, readable: false }),
  });
  const invalidJson = await loadRuntimeDataReadOnlySource({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: "not-json" }),
  });
  const notObject = await loadRuntimeDataReadOnlySource({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: "[]" }),
  });

  assert.equal(missing.ok, false);
  assert.equal(missing.blockers[0].code, "runtime-data-active-source-unavailable");
  assert.equal(unreadable.ok, false);
  assert.equal(unreadable.blockers[0].code, "runtime-data-active-source-not-readable");
  assert.equal(invalidJson.ok, false);
  assert.equal(invalidJson.blockers[0].code, "runtime-data-active-source-not-json");
  assert.equal(notObject.ok, false);
  assert.equal(notObject.blockers[0].code, "runtime-data-active-source-not-table-object");

  for (const result of [missing, unreadable, invalidJson, notObject]) {
    assert.equal(Object.prototype.propertyIsEnumerable.call(result, "snapshot"), false);
    assert.equal(JSON.stringify(result).includes("raw-system-row-value"), false);
    assert.equal(JSON.stringify(result).includes("secret.user@example.com"), false);
    assert.equal(result.safetyFlags.rawRowsExposed, false);
    assert.equal(result.safetyFlags.rawUsersExposed, false);
    assert.equal(result.safetyFlags.runtimeDataMutationEnabled, false);
  }
});

test("RuntimeData read-only source access adds no public route or POST endpoint", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");
  assert.equal(serverText.includes("/api/runtime-data"), false);
  assert.equal(serverText.includes("RUNTIMEDATA_READONLY_SOURCE_ACCESS"), false);
  assert.equal(serverText.includes("loadRuntimeDataReadOnlySource"), false);
});
