import test from "node:test";
import assert from "node:assert/strict";

import { createBoardDataViewModel } from "../packages/modules/board-data/boardDataViewModel.js";

const safeStatus = Object.freeze({
  ok: true,
  endpoint: "/api/board-data/status",
  readOnly: true,
  diagnosticOnly: true,
  sourceStatusReadOnly: true,
  productDataAuthority: true,
  writeEnabled: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  selectorResolvingEnabled: false,
  activeResolverEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  googleSyncEnabled: false,
  googleSheetsWriteEnabled: false,
  materialiserWriteEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  materialiserRefreshEnabled: false,
  activeSnapshotPromotionEnabled: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  runtimeDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawGoogleRowsExposed: false,
  rawLabEvidenceExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  donorCodeMounted: false,
  source: {
    label: "runtime-authority-reference-active-snapshot",
    present: true,
    readable: true,
    parseable: true,
  },
  materialisedSnapshot: {
    label: "runtime-authority-reference-materialised-novondb",
    present: true,
    readable: true,
  },
  expectedTables: [
    "SYSTEM",
    "BOARDS",
    "DRIVERS",
    "OPTICS",
    "ACCESSORIES",
    "SYSTEM_COMPONENTS",
    "SYSTEM_POLICY",
    "SYSTEM_BOM_DEFAULTS",
    "PURE_REF_STATE",
  ],
  presentTables: [
    "SYSTEM",
    "BOARDS",
    "DRIVERS",
    "OPTICS",
    "ACCESSORIES",
    "SYSTEM_COMPONENTS",
    "SYSTEM_POLICY",
    "SYSTEM_BOM_DEFAULTS",
    "PURE_REF_STATE",
  ],
  counts: {
    SYSTEM: 1,
    BOARDS: 2,
    DRIVERS: 3,
    OPTICS: 4,
    ACCESSORIES: 5,
    SYSTEM_COMPONENTS: 6,
    SYSTEM_POLICY: 7,
    SYSTEM_BOM_DEFAULTS: 8,
    PURE_REF_STATE: 9,
  },
  tableSummary: [
    { table: "SYSTEM", present: true, rowCount: 1, rawRowsExposed: false },
    { table: "BOARDS", present: true, rowCount: 2, rawRowsExposed: false },
    { table: "DRIVERS", present: true, rowCount: 3, rawRowsExposed: false },
    { table: "OPTICS", present: true, rowCount: 4, rawRowsExposed: false },
    { table: "ACCESSORIES", present: true, rowCount: 5, rawRowsExposed: false },
    { table: "SYSTEM_COMPONENTS", present: true, rowCount: 6, rawRowsExposed: false },
    { table: "SYSTEM_POLICY", present: true, rowCount: 7, rawRowsExposed: false },
    { table: "SYSTEM_BOM_DEFAULTS", present: true, rowCount: 8, rawRowsExposed: false },
    { table: "PURE_REF_STATE", present: true, rowCount: 9, rawRowsExposed: false },
  ],
  usersRedactionStatus: {
    present: true,
    count: 1,
    rawRowsExposed: false,
    rawHeadersExposed: false,
  },
  proofBoundary: {
    labRequiredForProof: true,
    metadataOnlyFields: true,
    productionProofClaimsEmitted: false,
  },
  missingExpectedTables: [],
  warnings: ["Board Data defines product/component metadata."],
});

test("Board Data view model includes the required read-only boundary statements", () => {
  const model = createBoardDataViewModel({ status: safeStatus });

  assert.deepEqual(model.liveStatusCopy, [
    "Board Data / Selector Reference live status is read-only in this slice.",
    "This status bridge reports source presence, table readiness, and redaction safety only.",
    "Raw rows, raw USERS, raw Lab evidence, credentials, private paths, and secret values are not exposed.",
    "Selector resolving remains disabled until a later approved resolver-preview slice.",
    "Board Data defines metadata. Selector resolves later. Lab proves later.",
  ]);

  assert.deepEqual(model.requiredBoundaryStatements, [
    "Board Data is read-only in this slice.",
    "Board Data defines product/component metadata.",
    "This inspector shows redacted summaries only.",
    "No raw table rows are exposed.",
    "No USERS rows, USERS headers, email addresses, credentials, Google rows, or raw Lab evidence are exposed.",
    "Board Data does not provide Lab proof.",
    "Board Data does not mutate Selector.",
    "Board Data does not generate IES files.",
    "Materialiser refresh and active snapshot promotion remain separate controlled workflows.",
  ]);
});

test("Board Data redacted detail inspector exposes only safe category summaries", () => {
  const model = createBoardDataViewModel({ status: safeStatus });

  assert.deepEqual(
    model.redactedDetailCategories.map((category) => category.key),
    [
      "SYSTEM",
      "BOARDS",
      "DRIVERS",
      "OPTICS",
      "ACCESSORIES",
      "SYSTEM_COMPONENTS",
      "SYSTEM_POLICY",
      "SYSTEM_BOM_DEFAULTS",
      "PURE_REF_STATE",
    ]
  );

  const text = JSON.stringify(model.redactedDetailCategories);
  assert.equal(text.includes("rawRowsExposed:false"), true);
  assert.equal(text.includes("rawHeadersExposed:false"), true);
  assert.equal(text.includes("rawUsersExposed:false"), true);
  assert.equal(text.includes("rawGoogleRowsExposed:false"), true);
  assert.equal(text.includes("rawLabEvidenceExposed:false"), true);
  assert.equal(text.includes("diagnostic metadata only"), true);
});

test("Board Data live status bridge rows show source readiness and redaction safety only", () => {
  const model = createBoardDataViewModel({ status: safeStatus });
  const rows = Object.fromEntries(model.liveStatusRows);

  assert.equal(rows["active snapshot present"], "true");
  assert.equal(rows["active snapshot readable"], "true");
  assert.equal(rows["active snapshot parseable"], "true");
  assert.equal(rows["materialised snapshot present"], "true");
  assert.equal(rows["materialised snapshot readable"], "true");
  assert.match(rows["expected tables"], /SYSTEM/);
  assert.match(rows["present tables"], /BOARDS/);
  assert.equal(rows["missing tables"], "none reported");
  assert.equal(rows["safe table counts visible"], "true");
  assert.equal(rows["USERS present"], "true");
  assert.equal(rows["USERS count only"], 1);
  assert.equal(rows["USERS raw rows exposed"], "false");
  assert.equal(rows["raw rows exposed"], "false");
  assert.equal(rows["raw headers exposed"], "false");
  assert.equal(rows["raw Lab evidence exposed"], "false");
  assert.equal(rows["credentials exposed"], "false");
  assert.equal(rows["private paths exposed"], "false");
});

test("Board Data safety flags fail closed when status fields are unavailable", () => {
  const model = createBoardDataViewModel({ status: { ok: false } });
  const flags = Object.fromEntries(model.safetyRows);

  assert.equal(flags.readOnly, "true");
  assert.equal(flags.diagnosticOnly, "true");
  assert.equal(flags.rawRowsExposed, "false");
  assert.equal(flags.rawHeadersExposed, "false");
  assert.equal(flags.rawUsersExposed, "false");
  assert.equal(flags.rawGoogleRowsExposed, "false");
  assert.equal(flags.rawLabEvidenceExposed, "false");
  assert.equal(flags.credentialsExposed, "false");
  assert.equal(flags.privatePathsExposed, "false");
  assert.equal(flags["Board Data write enabled"], "false");
  assert.equal(flags["materialiser write enabled"], "false");
  assert.equal(flags["materialiser refresh enabled"], "false");
  assert.equal(flags["active snapshot promotion enabled"], "false");
  assert.equal(flags["Selector resolving enabled"], "false");
  assert.equal(flags.selectorMutationEnabled, "false");
  assert.equal(flags["spec generation enabled"], "false");
  assert.equal(flags["slug generation enabled"], "false");
  assert.equal(flags["Lab proof authority"], "false");
  assert.equal(flags["IES generation enabled"], "false");
  assert.equal(flags["Controlled Records write enabled"], "false");
  assert.equal(flags["RREG assignment enabled"], "false");
  assert.equal(flags["runtime data mutation enabled"], "false");
  assert.equal(flags["hidden write-back enabled"], "false");
  assert.equal(flags.donorCodeMounted, "false");
});

