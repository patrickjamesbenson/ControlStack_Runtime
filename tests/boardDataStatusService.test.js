import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  BOARD_DATA_EXPECTED_TABLES,
  BOARD_DATA_STATUS_PATH,
  buildBoardDataStatus,
} from "../packages/workspace-kernel/boardDataStatusService.js";

function fakeStat({ isFile = true, size = 456, mtime = new Date("2026-06-26T00:00:00.000Z") } = {}) {
  return {
    isFile: () => isFile,
    size,
    mtime,
  };
}

function fakeFs({ snapshot, readable = true, statOk = true, writes = [] } = {}) {
  return {
    stat: async () => {
      if (!statOk) {
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
    writeFile: async (...args) => {
      writes.push(args);
      throw new Error("write should not be called by Board Data status service");
    },
  };
}

const validSnapshot = Object.freeze({
  BOARDS: [{ board_id: "b1", hidden_raw_field: "board raw row value" }],
  DRIVERS: [{ driver_id: "d1" }, { driver_id: "d2" }],
  OPTICS: [{ optic_id: "o1" }],
  SYSTEM: [{ system_id: "s1" }],
  SYSTEM_COMPONENTS: [{ component_id: "c1" }],
  SYSTEM_POLICY: [{ policy_id: "p1" }],
  SYSTEM_BOM_DEFAULTS: [],
  ACCESSORIES: [],
  PURE_REF_STATE: [{ pure_ref_id: "proof-looking-but-metadata-only" }],
  USERS: [{ id: "u1", email_login: "secret.user@example.com", role: "developer" }],
});

test("status can be generated from a valid synthetic active snapshot", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "C:\\ControlStack_RuntimeData\\authority-reference\\novondb.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  assert.equal(status.ok, true);
  assert.equal(status.endpoint, BOARD_DATA_STATUS_PATH);
  assert.equal(status.owner, "runtime-server");
  assert.equal(status.moduleId, "board_data");
  assert.equal(status.label, "Board Data");
  assert.equal(status.source.present, true);
  assert.equal(status.source.readable, true);
  assert.equal(status.source.parseable, true);
  assert.equal(status.source.label, "runtime-authority-reference-active-snapshot");
  assert.deepEqual(status.activeSnapshot, status.source);
  assert.equal(status.materialisedSnapshot.label, "runtime-authority-reference-materialised-novondb");
  assert.equal(status.materialisedSnapshot.present, true);
  assert.equal(status.materialisedSnapshot.readable, true);
  assert.deepEqual(status.expectedTables, [...BOARD_DATA_EXPECTED_TABLES]);
  assert.ok(status.presentTables.includes("BOARDS"));
  assert.deepEqual(status.missingTables, []);
});

test("required Board Data boundary flags are present and safe", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "fixture.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  assert.equal(status.readOnly, true);
  assert.equal(status.diagnosticOnly, true);
  assert.equal(status.sourceStatusReadOnly, true);
  assert.equal(status.productDataAuthority, true);
  assert.equal(status.writeEnabled, false);
  assert.equal(status.boardDataWriteEnabled, false);
  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.selectorResolvingEnabled, false);
  assert.equal(status.activeResolverEnabled, false);
  assert.equal(status.specGenerationEnabled, false);
  assert.equal(status.slugGenerationEnabled, false);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.googleSyncEnabled, false);
  assert.equal(status.googleSheetsWriteEnabled, false);
  assert.equal(status.materialiserWriteEnabled, false);
  assert.equal(status.materialiserRefreshEnabled, false);
  assert.equal(status.activeSnapshotWriteEnabled, false);
  assert.equal(status.activeSnapshotPromotionEnabled, false);
  assert.equal(status.materialisedSnapshotWriteEnabled, false);
  assert.equal(status.controlledRecordsWriteEnabled, false);
  assert.equal(status.rregAssignmentEnabled, false);
  assert.equal(status.runtimeDataMutationEnabled, false);
  assert.equal(status.rawRowsExposed, false);
  assert.equal(status.rawHeadersExposed, false);
  assert.equal(status.rawUsersExposed, false);
  assert.equal(status.rawUserHeadersExposed, false);
  assert.equal(status.rawGoogleRowsExposed, false);
  assert.equal(status.rawLabEvidenceExposed, false);
  assert.equal(status.credentialsExposed, false);
  assert.equal(status.privatePathsExposed, false);
  assert.equal(status.hiddenWriteBackEnabled, false);
  assert.equal(status.candidateEditMode, false);
  assert.equal(status.approvedDataSource, "active authority-reference snapshot");
  assert.deepEqual(status.proofBoundary, {
    labRequiredForProof: true,
    metadataOnlyFields: true,
    productionProofClaimsEmitted: false,
  });
});

test("BOARDS, DRIVERS, OPTICS, and SYSTEM counts are reported", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "fixture.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  assert.equal(status.counts.BOARDS, 1);
  assert.equal(status.counts.DRIVERS, 2);
  assert.equal(status.counts.OPTICS, 1);
  assert.equal(status.counts.SYSTEM, 1);
  assert.equal(status.counts.SYSTEM_COMPONENTS, 1);
  assert.equal(status.counts.SYSTEM_POLICY, 1);
});

test("missing expected tables are reported safely", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "fixture.json",
    fsApi: fakeFs({ snapshot: { BOARDS: [], USERS: [] } }),
  });

  assert.equal(status.ok, true);
  assert.ok(status.missingExpectedTables.includes("DRIVERS"));
  assert.ok(status.missingExpectedTables.includes("OPTICS"));
  assert.ok(status.missingExpectedTables.includes("SYSTEM"));
  assert.ok(status.warnings.some((warning) => warning.includes("Missing Board Data expected table: DRIVERS")));
});

test("USERS rows and headers are not returned", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "fixture.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  const text = JSON.stringify(status);
  assert.equal(status.usersRedactionStatus.present, true);
  assert.equal(status.usersRedactionStatus.count, 1);
  assert.equal(status.usersRedactionStatus.rawRowsExposed, false);
  assert.equal(status.usersRedactionStatus.rawHeadersExposed, false);
  assert.equal(text.includes("secret.user@example.com"), false);
  assert.equal(text.includes("email_login"), false);
  assert.equal(text.includes("role"), false);
});

test("raw table rows are not returned", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "fixture.json",
    fsApi: fakeFs({ snapshot: validSnapshot }),
  });

  const text = JSON.stringify(status);
  assert.equal(status.rawRowsExposed, false);
  assert.equal(status.rawHeadersExposed, false);
  assert.equal(status.tableSummary.every((table) => table.rawRowsExposed === false), true);
  assert.equal(status.tableSummary.every((table) => table.rawHeadersExposed === false), true);
  assert.equal(status.tableSummary.every((table) => table.headersReturned === false), true);
  assert.equal(text.includes("board raw row value"), false);
  assert.equal(text.includes("proof-looking-but-metadata-only"), false);
  assert.equal(text.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(text.includes("fixture.json"), false);
});

test("missing snapshot returns safe warning shape", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "missing.json",
    fsApi: fakeFs({ statOk: false }),
  });

  assert.equal(status.ok, false);
  assert.equal(status.source.present, false);
  assert.equal(status.source.readable, false);
  assert.equal(status.source.parseable, false);
  assert.equal(status.readOnly, true);
  assert.equal(status.writeEnabled, false);
  assert.equal(status.rawRowsExposed, false);
  assert.ok(status.missingExpectedTables.includes("BOARDS"));
  assert.ok(status.warnings.length > 0);
});

test("unreadable snapshot returns safe warning shape", async () => {
  const status = await buildBoardDataStatus({
    sourcePath: "unreadable.json",
    fsApi: fakeFs({ readable: false }),
  });

  assert.equal(status.ok, false);
  assert.equal(status.source.present, true);
  assert.equal(status.source.readable, false);
  assert.equal(status.source.parseable, false);
  assert.equal(status.readOnly, true);
  assert.equal(status.writeEnabled, false);
  assert.equal(status.rawUsersExposed, false);
  assert.ok(status.warnings.some((warning) => warning.includes("not readable")));
});

test("no write attempt is made", async () => {
  const writes = [];
  const status = await buildBoardDataStatus({
    sourcePath: "fixture.json",
    fsApi: fakeFs({ snapshot: validSnapshot, writes }),
  });

  assert.equal(status.ok, true);
  assert.equal(writes.length, 0);
});

test("no POST Board Data endpoint is added", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");
  assert.equal(serverText.includes("BOARD_DATA_POST"), false);
  assert.equal(/POST[\s\S]{0,120}BOARD_DATA_STATUS_PATH/.test(serverText), false);
  assert.equal(/AUTH_REF_POST_PATHS[\s\S]{0,500}BOARD_DATA_STATUS_PATH/.test(serverText), false);
});
