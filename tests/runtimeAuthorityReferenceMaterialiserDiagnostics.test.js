import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTHORITY_REFERENCE_GOOGLE_EXPECTED_TABLES,
  createGoogleSheetsAuthorityReferenceReader,
  refreshAuthorityReferenceMaterialiser,
} from "../packages/workspace-kernel/authorityReferenceMaterialiserService.js";

function fakeStat({ isFile = true, size = 123, mtime = new Date("2026-07-19T00:00:00.000Z") } = {}) {
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

function configuredInputs({ writes = [] } = {}) {
  const credentialPath = "C:\\configured-only\\reader.json";
  return {
    credentialPath,
    writes,
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: credentialPath,
      CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID: "configured-provider-id",
    },
    fsApi: fakeFs({ readablePaths: new Set([credentialPath]), writes }),
  };
}

function googleModule({
  authConstructorError = null,
  getClient = null,
  metadataGet = null,
  batchGet = null,
  sheetsFactory = null,
} = {}) {
  class GoogleAuth {
    constructor() {
      if (authConstructorError) throw authConstructorError;
    }

    async getClient() {
      return getClient ? getClient() : { safe: true };
    }
  }

  return {
    google: {
      auth: { GoogleAuth },
      sheets: sheetsFactory || (() => ({
        spreadsheets: {
          get: metadataGet || (async () => ({
            data: {
              sheets: AUTHORITY_REFERENCE_GOOGLE_EXPECTED_TABLES.map((title) => ({ properties: { title } })),
            },
          })),
          values: {
            batchGet: batchGet || (async () => ({
              data: {
                valueRanges: AUTHORITY_REFERENCE_GOOGLE_EXPECTED_TABLES.map((title) => ({
                  values: [["id"], [`${title.toLowerCase()}-1`]],
                })),
              },
            })),
          },
        },
      })),
    },
  };
}

async function refreshWithModule(module) {
  const { env, fsApi } = configuredInputs();
  return refreshAuthorityReferenceMaterialiser({
    dryRun: true,
    env,
    fsApi,
    googleApiModule: module,
    body: {},
  });
}

function assertSafeFailure(result, code) {
  assert.equal(result.httpStatus, 200);
  assert.equal(result.status, "dry-run-reader-blocked");
  assert.equal(result.failureCategory, code);
  assert.equal(result.google.readerFailureCode, code);
  assert.ok(result.blockers.some((item) => item.code === code));
  assert.equal(result.currentSourceShape, null);
  assert.equal(result.materialisedWriteAttempted, false);
  assert.equal(result.activeSnapshotWriteAttempted, false);
  assert.equal(result.writePolicy.dryRunWritesNothing, true);
}

const minimalValidMaterialised = Object.freeze({
  USERS: [{ id: "u1", email_login: "private-user@example.com" }],
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

test("Google API module and authentication-client failures return stable safe codes", async () => {
  assertSafeFailure(await refreshWithModule({}), "googleapis-unavailable");

  const authConstructorResult = await refreshWithModule(googleModule({
    authConstructorError: new Error("PRIVATE_AUTH_CONSTRUCTOR_MESSAGE"),
  }));
  assertSafeFailure(authConstructorResult, "google-auth-client-failed");

  const authClientResult = await refreshWithModule(googleModule({
    getClient: async () => { throw new Error("PRIVATE_AUTH_CLIENT_MESSAGE"); },
  }));
  assertSafeFailure(authClientResult, "google-auth-client-failed");

  const text = JSON.stringify([authConstructorResult, authClientResult]);
  assert.equal(text.includes("PRIVATE_AUTH_CONSTRUCTOR_MESSAGE"), false);
  assert.equal(text.includes("PRIVATE_AUTH_CLIENT_MESSAGE"), false);
});

test("metadata, access-denied, and not-found failures are safely distinguished", async () => {
  const metadataResult = await refreshWithModule(googleModule({
    metadataGet: async () => { throw new Error("PRIVATE_METADATA_MESSAGE"); },
  }));
  assertSafeFailure(metadataResult, "google-spreadsheet-metadata-request-failed");

  const deniedError = new Error("PRIVATE_DENIED_MESSAGE");
  deniedError.response = {
    status: 403,
    headers: { authorization: "PRIVATE_HEADER_TOKEN" },
    config: { url: "https://sheets.googleapis.com/private-denied" },
  };
  const deniedResult = await refreshWithModule(googleModule({
    metadataGet: async () => { throw deniedError; },
  }));
  assertSafeFailure(deniedResult, "google-spreadsheet-access-denied");

  const notFoundError = new Error("PRIVATE_NOT_FOUND_MESSAGE");
  notFoundError.status = 404;
  const notFoundResult = await refreshWithModule(googleModule({
    metadataGet: async () => { throw notFoundError; },
  }));
  assertSafeFailure(notFoundResult, "google-spreadsheet-not-found");

  const text = JSON.stringify([metadataResult, deniedResult, notFoundResult]);
  for (const forbidden of [
    "PRIVATE_METADATA_MESSAGE",
    "PRIVATE_DENIED_MESSAGE",
    "PRIVATE_NOT_FOUND_MESSAGE",
    "PRIVATE_HEADER_TOKEN",
    "private-denied",
  ]) {
    assert.equal(text.includes(forbidden), false);
  }
});

test("missing tabs, values request failure, and invalid value-range shape remain distinct", async () => {
  const missingTabsResult = await refreshWithModule(googleModule({
    metadataGet: async () => ({ data: { sheets: [{ properties: { title: "SYSTEM" } }] } }),
  }));
  assertSafeFailure(missingTabsResult, "google-expected-tabs-missing");

  const valuesFailureResult = await refreshWithModule(googleModule({
    batchGet: async () => { throw new Error("PRIVATE_VALUES_MESSAGE"); },
  }));
  assertSafeFailure(valuesFailureResult, "google-values-request-failed");

  const invalidShapeResult = await refreshWithModule(googleModule({
    batchGet: async () => ({ data: { valueRanges: [{ values: "not-an-array" }] } }),
  }));
  assertSafeFailure(invalidShapeResult, "google-values-response-invalid");
  assert.equal(JSON.stringify(valuesFailureResult).includes("PRIVATE_VALUES_MESSAGE"), false);
});

test("unknown provider exceptions reveal no message, stack, URL, headers, token, or identity", async () => {
  const privateUrl = "https://sheets.googleapis.com/private-sheet";
  const privateIdentity = "service-account@example.com";
  const privateToken = "PRIVATE_AUTHORIZATION_TOKEN";
  const privateMessage = "PRIVATE_UNKNOWN_PROVIDER_MESSAGE";
  const privateStack = "PRIVATE_PROVIDER_STACK";
  const result = await refreshWithModule(googleModule({
    sheetsFactory: () => {
      const error = new Error(`${privateMessage} ${privateUrl} ${privateIdentity}`);
      error.stack = privateStack;
      error.response = {
        headers: { authorization: privateToken },
        config: { url: privateUrl },
      };
      throw error;
    },
  }));

  assertSafeFailure(result, "google-reader-unknown-failure");
  const text = JSON.stringify(result);
  for (const forbidden of [privateUrl, privateIdentity, privateToken, privateMessage, privateStack, "authorization"]) {
    assert.equal(text.includes(forbidden), false);
  }
});

test("preflight failure remains distinct and does not attempt Google network access", async () => {
  const result = await refreshAuthorityReferenceMaterialiser({
    dryRun: true,
    env: {},
    fsApi: fakeFs(),
    body: {},
  });

  assert.equal(result.status, "dry-run-configuration-blocked");
  assert.equal(result.failureCategory, "google-reader-preflight-blocked");
  assert.equal(result.google.readerFailureCode, "google-reader-preflight-blocked");
  assert.equal(result.googleNetworkCallAttempted, false);
  assert.equal(result.materialisedWriteAttempted, false);
  assert.equal(result.activeSnapshotWriteAttempted, false);
});

test("successful Google read still materialises every expected table", async () => {
  const { env, fsApi } = configuredInputs();
  const reader = createGoogleSheetsAuthorityReferenceReader({
    env,
    fsApi,
    googleApiModule: googleModule(),
  });
  const materialised = await reader.read();

  assert.deepEqual(Object.keys(materialised), AUTHORITY_REFERENCE_GOOGLE_EXPECTED_TABLES);
  assert.equal(materialised.SYSTEM[0].id, "system-1");
  assert.equal(materialised.DRIVERS[0].id, "drivers-1");
  assert.equal(materialised.USERS[0].id, "users-1");
});

test("materialised validation failure has its own stable category", async () => {
  const result = await refreshAuthorityReferenceMaterialiser({
    dryRun: true,
    env: {},
    fsApi: fakeFs(),
    reader: fakeReader({ USERS: [] }),
  });

  assert.equal(result.status, "dry-run-validation-blocked");
  assert.equal(result.failureCategory, "materialised-authority-validation-failed");
  assert.equal(result.validation.failureCategory, "materialised-authority-validation-failed");
  assert.equal(result.materialisedWriteAttempted, false);
  assert.equal(result.activeSnapshotWriteAttempted, false);
});

test("source-shape summary counts genuine unsuffixed authority and preserves BOARDS pairing evidence", async () => {
  const writes = [];
  const source = {
    ...minimalValidMaterialised,
    USERS: [{ id: "u1", email_login: "shape-private@example.com" }],
    DRIVERS: [
      { native_control_type: true, native_control_type__2: "DALI-2 DT6" },
      { native_control_type: "false", native_control_type__2: "Fixed (On/Off)" },
      { native_control_type: "DALI-2 DT8", native_control_type__2: "" },
      { native_control_type: "DALI", native_control_type__2: "" },
    ],
    BOARDS: [
      {
        control_type_options: "DALI-2 DT6; DALI-2 DT8; DALI-2 DT8",
        control_type_labels: "DT6; DT8",
      },
      {
        control_type_options: "DALI; Fixed (On/Off)",
        control_type_labels: "DALI; Fixed (On/Off)",
      },
      {
        control_type_options: "PWM",
        control_type_labels: "",
      },
    ],
  };
  const result = await refreshAuthorityReferenceMaterialiser({
    dryRun: true,
    env: {},
    fsApi: fakeFs({ writes }),
    reader: fakeReader(source),
  });

  const shape = result.currentSourceShape;
  const text = JSON.stringify(result);
  assert.equal(result.status, "dry-run-ready");
  assert.equal(result.failureCategory, null);
  assert.equal(writes.length, 0);
  assert.equal(shape.drivers.tablePresent, true);
  assert.equal(shape.drivers.rowCount, 4);
  assert.equal(shape.drivers.nativeControlType.existsInMaterialisedRows, true);
  assert.equal(shape.drivers.nativeControlType.populatedRowCount, 4);
  assert.equal(shape.drivers.nativeControlType.booleanLikeValueCount, 2);
  assert.equal(shape.drivers.nativeControlType.protocolAuthorityRowCount, 2);
  assert.deepEqual(shape.drivers.nativeControlType.protocolFamilies, ["DALI-2 DT8", "DALI-2"]);
  assert.equal(shape.drivers.nativeControlTypeDuplicate.existsInMaterialisedRows, true);
  assert.equal(shape.drivers.nativeControlTypeDuplicate.populatedRowCount, 2);
  assert.equal(shape.drivers.nativeControlTypeDuplicate.authorityAssessment, "appears-protocol-authoritative");
  assert.equal(shape.boards.tablePresent, true);
  assert.equal(shape.boards.rowCount, 3);
  assert.equal(shape.boards.controlTypeOptionsPopulatedRowCount, 3);
  assert.equal(shape.boards.controlTypeLabelsPopulatedRowCount, 2);
  assert.equal(shape.boards.pairLengthMatchRowCount, 1);
  assert.equal(shape.boards.pairLengthMismatchRowCount, 2);
  assert.equal(shape.boards.optionDuplicatesWouldChangeRowCount, 1);
  assert.equal(shape.boards.labelDuplicatesWouldChangeRowCount, 0);
  assert.equal(shape.boards.independentDuplicateRemovalWouldChange, true);
  assert.equal(shape.boards.sourceOrderRetained, true);
  assert.equal(shape.boards.independentDuplicateRemovalApplied, false);
  assert.deepEqual(shape.protocolAgreement.boardsAuthority, [
    "DALI-2 DT6",
    "DALI-2 DT8",
    "DALI-2",
    "Fixed/On-Off",
    "PWM",
  ]);
  assert.deepEqual(shape.protocolAgreement.driversUnsuffixedAuthority, ["DALI-2 DT8", "DALI-2"]);
  assert.deepEqual(shape.protocolAgreement.intersection, ["DALI-2 DT8", "DALI-2"]);
  assert.deepEqual(shape.protocolAgreement.genericDali, {
    boards: true,
    driversUnsuffixed: true,
    intersection: true,
  });
  assert.equal(shape.protocolAgreement.intersection.includes("DALI-2 DT6"), false);
  assert.equal(shape.usersRowsExposed, false);
  assert.equal(shape.credentialValuesExposed, false);
  assert.equal(shape.sheetIdExposed, false);
  assert.equal(shape.fullMaterialisedJsonExposed, false);
  for (const forbidden of ["shape-private@example.com", "email_login", "configured-provider-id", "reader.json"]) {
    assert.equal(text.includes(forbidden), false);
  }
});

test("dry-run never writes and live materialisation gates remain unchanged", async () => {
  const dryWrites = [];
  const dryResult = await refreshAuthorityReferenceMaterialiser({
    dryRun: true,
    env: {},
    fsApi: fakeFs({ writes: dryWrites }),
    reader: fakeReader(),
  });
  assert.equal(dryResult.status, "dry-run-ready");
  assert.equal(dryWrites.length, 0);
  assert.equal(dryResult.materialisedWriteAttempted, false);
  assert.equal(dryResult.activeSnapshotWriteAttempted, false);

  const liveWrites = [];
  const { env, fsApi } = configuredInputs({ writes: liveWrites });
  const liveResult = await refreshAuthorityReferenceMaterialiser({
    dryRun: false,
    env,
    fsApi,
    reader: fakeReader(),
    body: { confirmation: "REFRESH_MATERIALISED_SOURCE" },
  });
  assert.equal(liveResult.status, "live-refresh-blocked");
  assert.ok(liveResult.blockers.some((item) => item.code === "materialiser-disabled"));
  assert.ok(liveResult.blockers.some((item) => item.code === "materialiser-execution-disabled"));
  assert.equal(liveWrites.length, 0);
  assert.equal(liveResult.materialisedWriteAttempted, false);
  assert.equal(liveResult.activeSnapshotWriteAttempted, false);
});
