import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
  AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
  buildAuthorityReferenceMaterialiserStatus,
  refreshAuthorityReferenceMaterialiser,
  validateMaterialiserTargetPath,
} from "../packages/workspace-kernel/authorityReferenceMaterialiserService.js";

function fakeStat({ isFile = true, size = 123, mtime = new Date("2026-06-26T00:00:00.000Z") } = {}) {
  return {
    isFile: () => isFile,
    size,
    mtime,
  };
}

function fakeFs({ readablePaths = new Set(), writes = [] } = {}) {
  return {
    stat: async (pathValue) => {
      if (readablePaths.has(pathValue)) return fakeStat();
      const error = new Error("ENOENT");
      error.code = "ENOENT";
      throw error;
    },
    mkdir: async () => {},
    writeFile: async (...args) => {
      writes.push(args);
    },
  };
}

const minimalValidMaterialised = Object.freeze({
  USERS: [{ id: "u1", email_login: "user@example.com", contact_roles_assigned: "internal_user" }],
  SYSTEM: [],
  OPTICS: [],
  ACCESSORIES: [],
  SPEC_CODES: [],
  BOARDS: [],
  DRIVERS: [],
  PURE_REF_STATE: [],
  SYSTEM_COMPONENTS: [],
  SYSTEM_BOM_DEFAULTS: [],
  SYSTEM_POLICY: [],
  FIELD_EDITABILITY: [],
  ROLES_AND_LANES: [],
  CODE_POLICY: [],
  MESSAGES: [],
});

function fakeReader(value = minimalValidMaterialised) {
  return {
    fake: true,
    read: async () => value,
  };
}

test("normal status does not require Google env", async () => {
  const status = await buildAuthorityReferenceMaterialiserStatus({
    env: {},
    fsApi: fakeFs(),
    now: new Date("2026-06-26T01:00:00.000Z"),
  });

  assert.equal(status.ok, true);
  assert.equal(status.normalBootDependency, false);
  assert.equal(status.gates.materialiserEnabled, false);
  assert.equal(status.gates.materialiserExecutionEnabled, false);
  assert.equal(status.google.googleSheetConfigured, false);
  assert.equal(status.google.googleCredentialsConfigured, false);
  assert.equal(status.google.googleCredentialsReadable, false);
});

test("status exposes no configured credential path or provider id", async () => {
  const configuredCredPath = "C:\\configured-only\\creds.json";
  const configuredSheetId = "configured-provider-id";
  const status = await buildAuthorityReferenceMaterialiserStatus({
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: configuredCredPath,
      CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID: configuredSheetId,
    },
    fsApi: fakeFs({ readablePaths: new Set([configuredCredPath]) }),
  });

  const text = JSON.stringify(status);
  assert.equal(status.google.googleCredentialsConfigured, true);
  assert.equal(status.google.googleCredentialsReadable, true);
  assert.equal(status.google.credentialValueReturned, false);
  assert.equal(status.google.credentialContentsReturned, false);
  assert.equal(text.includes(configuredCredPath), false);
  assert.equal(text.includes(configuredSheetId), false);
});

test("dry-run refresh writes nothing and does not expose raw rows", async () => {
  const writes = [];
  const result = await refreshAuthorityReferenceMaterialiser({
    dryRun: true,
    env: {},
    fsApi: fakeFs({ writes }),
    reader: fakeReader(),
    body: {},
  });

  const text = JSON.stringify(result);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.dryRun, true);
  assert.equal(writes.length, 0);
  assert.equal(result.rawRowsExposed, false);
  assert.equal(result.validation.summary.users.count, 1);
  assert.equal(result.validation.summary.users.userEmailsExposed, false);
  assert.equal(text.includes("user@example.com"), false);
  assert.equal(text.includes("email_login"), false);
});

test("live refresh blocks without gates", async () => {
  const result = await refreshAuthorityReferenceMaterialiser({
    dryRun: false,
    env: {},
    fsApi: fakeFs(),
    reader: fakeReader(),
    body: { confirmation: "REFRESH_MATERIALISED_SOURCE" },
  });

  assert.equal(result.httpStatus, 409);
  assert.equal(result.status, "live-refresh-blocked");
  assert.equal(result.activeSnapshotWriteAttempted, false);
  assert.ok(result.blockers.some((item) => item.code === "materialiser-disabled"));
  assert.ok(result.blockers.some((item) => item.code === "materialiser-execution-disabled"));
});

test("live refresh blocks without exact confirmation", async () => {
  const result = await refreshAuthorityReferenceMaterialiser({
    dryRun: false,
    env: {
      CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_ENABLED: "true",
      CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_EXECUTION_ENABLED: "true",
    },
    fsApi: fakeFs(),
    reader: fakeReader(),
    body: { confirmation: "WRONG", extra: true },
  });

  assert.equal(result.httpStatus, 409);
  assert.ok(result.blockers.some((item) => item.code === "confirmation-required"));
});

test("active snapshot path is rejected as materialiser target", () => {
  const validation = validateMaterialiserTargetPath(AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH);
  assert.equal(validation.ok, false);
  assert.equal(validation.code, "active-snapshot-target-rejected");
});

test("donor path is rejected as materialiser target", () => {
  const validation = validateMaterialiserTargetPath("C:\\ControlStack\\data\\novondb.json");
  assert.equal(validation.ok, false);
  assert.equal(validation.code, "donor-path-target-rejected");
});

test("arbitrary target outside materialised root is rejected", () => {
  const validation = validateMaterialiserTargetPath("C:\\temp\\novondb.json");
  assert.equal(validation.ok, false);
  assert.equal(validation.code, "target-outside-materialised-root");
});

test("approved materialised target is accepted", () => {
  const validation = validateMaterialiserTargetPath(AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH);
  assert.equal(validation.ok, true);
  assert.equal(validation.code, "target-confined");
});

test("raw provider response shape is not accepted or returned", async () => {
  const result = await refreshAuthorityReferenceMaterialiser({
    dryRun: true,
    env: {},
    fsApi: fakeFs(),
    reader: fakeReader({ range: "Sheet1!A1:B2", majorDimension: "ROWS", values: [["USERS"], ["hidden@example.com"]] }),
    body: {},
  });

  const text = JSON.stringify(result);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.validation.ok, false);
  assert.ok(result.validation.blockers.some((item) => item.code === "raw-google-response-detected"));
  assert.equal(text.includes("hidden@example.com"), false);
  assert.equal(result.rawGoogleResponseExposed, false);
});
