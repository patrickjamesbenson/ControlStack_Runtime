import test from "node:test";
import assert from "node:assert/strict";

import { createBoardDataViewModel } from "../packages/modules/board-data/boardDataViewModel.js";

const safeStatus = Object.freeze({
  ok: true,
  endpoint: "/api/board-data/status",
  readOnly: true,
  diagnosticOnly: true,
  productDataAuthority: true,
  writeEnabled: false,
  selectorMutationEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  materialiserRefreshEnabled: false,
  activeSnapshotPromotionEnabled: false,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawGoogleRowsExposed: false,
  rawLabEvidenceExposed: false,
  donorCodeMounted: false,
  source: {
    present: true,
    readable: true,
    parseable: true,
  },
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
  assert.equal(flags.selectorMutationEnabled, "false");
  assert.equal(flags.labProofAuthority, "false");
  assert.equal(flags.iesGenerationEnabled, "false");
  assert.equal(flags.materialiserRefreshEnabled, "false");
  assert.equal(flags.activeSnapshotPromotionEnabled, "false");
  assert.equal(flags.donorCodeMounted, "false");
});

