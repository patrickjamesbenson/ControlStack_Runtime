import test from "node:test";
import assert from "node:assert/strict";

import {
  SELECTOR_CRITICAL_TABLES,
  SELECTOR_REFERENCE_STATUS_PATH,
  buildSelectorReferenceStatus,
} from "../packages/workspace-kernel/selectorReferenceService.js";

function fakeStat({ isFile = true, size = 789, mtime = new Date("2026-06-26T00:00:00.000Z") } = {}) {
  return {
    isFile: () => isFile,
    size,
    mtime,
  };
}

function fakeFs({ snapshot, statOk = true, readable = true, materialisedStatOk = true } = {}) {
  return {
    stat: async (pathValue = "") => {
      const pathText = String(pathValue);
      if (pathText.includes("materialised") && !materialisedStatOk) {
        const error = new Error("ENOENT");
        error.code = "ENOENT";
        throw error;
      }
      if (!pathText.includes("materialised") && !statOk) {
        const error = new Error("ENOENT");
        error.code = "ENOENT";
        throw error;
      }
      return fakeStat();
    },
    readFile: async () => {
      if (!readable) {
        const error = new Error("EACCES");
        error.code = "EACCES";
        throw error;
      }
      return JSON.stringify(snapshot || {});
    },
  };
}

const validSnapshot = Object.freeze({
  SYSTEM: [{ system_id: "sys-1" }],
  OPTICS: [{ optic_id: "optic-1", baseline_slug: "metadata-only", board_secret_header: "do-not-return" }],
  ACCESSORIES: [],
  SPEC_CODES: [],
  BOARDS: [{ board_id: "board-1", hidden_raw_field: "raw board value" }],
  DRIVERS: [{ driver_id: "driver-1", util_curve_file: "metadata-only" }],
  PURE_REF_STATE: [{ pure_ref_id: "not-proof", board_lm_measured: 123 }],
  SYSTEM_COMPONENTS: [],
  SYSTEM_BOM_DEFAULTS: [],
  SYSTEM_POLICY: [],
  FIELD_EDITABILITY: [],
  ROLES_AND_LANES: [],
  CODE_POLICY: [],
  MESSAGES: [],
  USERS: [{ email_login: "secret.user@example.com", role: "developer", capabilities: "selector" }],
});

test("Selector Reference status reports active and materialised snapshot readiness safely", async () => {
  const status = await buildSelectorReferenceStatus({
    sourcePath: "C:\\Private\\authority-reference\\novondb.json",
    materialisedSnapshotPath: "C:\\Private\\authority-reference\\materialised\\novondb.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  assert.equal(status.ok, true);
  assert.equal(status.endpoint, SELECTOR_REFERENCE_STATUS_PATH);
  assert.equal(status.owner, "runtime-server");
  assert.equal(status.source.label, "runtime-authority-reference-active-snapshot");
  assert.equal(status.source.present, true);
  assert.equal(status.source.readable, true);
  assert.equal(status.source.parseable, true);
  assert.deepEqual(status.activeSnapshot, status.source);
  assert.equal(status.materialisedSnapshot.label, "runtime-authority-reference-materialised-novondb");
  assert.equal(status.materialisedSnapshot.present, true);
  assert.equal(status.materialisedSnapshot.readable, true);
  assert.deepEqual(status.expectedTables, [...SELECTOR_CRITICAL_TABLES]);
  assert.ok(status.presentTables.includes("SYSTEM"));
  assert.ok(status.presentTables.includes("USERS"));
  assert.deepEqual(status.missingTables, []);
});

test("Selector Reference status flags fail closed for writes, resolving, generation, proof, credentials, and paths", async () => {
  const status = await buildSelectorReferenceStatus({
    sourcePath: "C:\\Private\\authority-reference\\novondb.json",
    materialisedSnapshotPath: "C:\\Private\\authority-reference\\materialised\\novondb.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  assert.equal(status.readOnly, true);
  assert.equal(status.diagnosticOnly, true);
  assert.equal(status.sourceStatusReadOnly, true);
  assert.equal(status.activeSnapshotWriteEnabled, false);
  assert.equal(status.activeSnapshotPromotionEnabled, false);
  assert.equal(status.materialisedSnapshotWriteEnabled, false);
  assert.equal(status.materialiserWriteEnabled, false);
  assert.equal(status.materialiserRefreshEnabled, false);
  assert.equal(status.boardDataWriteEnabled, false);
  assert.equal(status.selectorResolvingEnabled, false);
  assert.equal(status.activeResolverEnabled, false);
  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.specGenerationEnabled, false);
  assert.equal(status.slugGenerationEnabled, false);
  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.controlledRecordsWriteEnabled, false);
  assert.equal(status.rregAssignmentEnabled, false);
  assert.equal(status.runtimeDataMutationEnabled, false);
  assert.equal(status.hiddenWriteBackEnabled, false);
  assert.equal(status.rawRowsExposed, false);
  assert.equal(status.rawHeadersExposed, false);
  assert.equal(status.rawUsersExposed, false);
  assert.equal(status.rawUserHeadersExposed, false);
  assert.equal(status.rawLabEvidenceExposed, false);
  assert.equal(status.credentialsExposed, false);
  assert.equal(status.privatePathsExposed, false);
});

test("Selector Reference status does not expose raw rows, raw headers, USERS details, credentials, or private paths", async () => {
  const status = await buildSelectorReferenceStatus({
    sourcePath: "C:\\Private\\authority-reference\\novondb.json",
    materialisedSnapshotPath: "C:\\Private\\authority-reference\\materialised\\novondb.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  const text = JSON.stringify(status);
  assert.equal(status.tableSummary.every((table) => table.rawRowsExposed === false), true);
  assert.equal(status.tableSummary.every((table) => table.rawHeadersExposed === false), true);
  assert.equal(status.tableSummary.every((table) => table.headersReturned === false), true);
  assert.equal(status.usersRedactionStatus.present, true);
  assert.equal(status.usersRedactionStatus.count, 1);
  assert.equal(status.usersRedactionStatus.rawRowsExposed, false);
  assert.equal(status.usersRedactionStatus.rawHeadersExposed, false);
  assert.equal(status.usersRedactionStatus.personalIdentifiersExposed, false);
  assert.equal(status.usersRedactionStatus.credentialsExposed, false);
  assert.equal(text.includes("secret.user@example.com"), false);
  assert.equal(text.includes("email_login"), false);
  assert.equal(text.includes("raw board value"), false);
  assert.equal(text.includes("board_secret_header"), false);
  assert.equal(text.includes("C:\\Private"), false);
  assert.equal(text.includes("novondb.json"), false);
});

test("Selector Reference status reports missing active snapshot safely without private path exposure", async () => {
  const status = await buildSelectorReferenceStatus({
    sourcePath: "C:\\Private\\authority-reference\\missing.json",
    materialisedSnapshotPath: "C:\\Private\\authority-reference\\materialised\\novondb.json",
    fsApi: fakeFs({ statOk: false, snapshot: validSnapshot }),
  });

  const text = JSON.stringify(status);
  assert.equal(status.ok, false);
  assert.equal(status.source.present, false);
  assert.equal(status.source.readable, false);
  assert.equal(status.source.parseable, false);
  assert.equal(status.materialisedSnapshot.present, true);
  assert.equal(status.readOnly, true);
  assert.equal(status.rawRowsExposed, false);
  assert.equal(status.privatePathsExposed, false);
  assert.deepEqual(status.missingTables, [...SELECTOR_CRITICAL_TABLES]);
  assert.equal(text.includes("C:\\Private"), false);
  assert.equal(text.includes("missing.json"), false);
});
