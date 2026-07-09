import test from "node:test";
import assert from "node:assert/strict";

import {
  LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_ID,
  LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_VERSION,
  buildLabIesSafeHandoffAdapter,
  buildRuntimeLabIesSafeHandoffAdapter,
} from "../packages/workspace-kernel/labIesSafeHandoffAdapter.js";

const FORBIDDEN_OUTPUT_FIELDS = Object.freeze([
  "ies",
  "iesText",
  "rawIes",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "candela",
  "candelaGrid",
  "candelaArrays",
  "base64",
  "base64Artifacts",
  "filename",
  "fileName",
  "localPath",
  "privatePath",
  "mutationLog",
  "provenance",
  "approval",
  "keywords",
  "vendorData",
  "labRecord",
  "recordBody",
  "rawRecord",
]);

function safeRuntimeHandoff(overrides = {}) {
  return {
    schemaId: "safe-runtime-handoff.v1",
    schemaVersion: 1,
    handoffState: "ready",
    approvalState: "approved_for_runtime_reference",
    oneMmNormalised: true,
    baseLengthM: 0.001,
    sourcePhotometryRef: "opaque-source-photometry-ref:opal-60",
    sourcePhotometryStatus: "reference-ready",
    iesPhotometryReferenceToken: "ies-ref-token:opal-60",
    lumenCurveReferenceToken: "lumen-curve-token:opal-60",
    driverUtilCurveReferenceToken: "driver-util-token:opal-60",
    photometryReferenceFingerprint: "photometry-fp-001",
    sourceInputFingerprint: "source-input-fp-001",
    boardDataSourceVersion: "board-version-2026-07-10",
    selectedFamilySubsetLock: {
      family: "opal",
      subset: "60mm",
    },
    oneMmPolicyLabel: "one-mm-normalised-reference",
    recordFingerprint: "record-fp-001",
    derivedFromFingerprint: "derived-fp-001",
    safeSummaryOnly: true,
    readOnly: true,
    ...overrides,
  };
}

function collectKeys(value, keys = new Set()) {
  if (value === null || typeof value !== "object") return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.add(key);
    collectKeys(child, keys);
  }
  return keys;
}

function assertNoForbiddenOutputFields(value) {
  const keys = collectKeys(value);
  for (const field of FORBIDDEN_OUTPUT_FIELDS) {
    assert.equal(keys.has(field), false, `${field} must not appear in adapter output`);
  }
}

test("adapts ready safe-runtime-handoff into runtime-safe photometry reference projection", () => {
  const output = buildRuntimeLabIesSafeHandoffAdapter({
    safeRuntimeHandoff: safeRuntimeHandoff(),
  });

  assert.equal(output.schemaId, LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_ID);
  assert.equal(output.schemaVersion, LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_VERSION);
  assert.equal(output.ok, true);
  assert.equal(output.blocker, null);
  assert.equal(output.state, "runtime_lab_ies_safe_handoff_ready");
  assert.equal(output.handoffState, "ready");
  assert.equal(output.approvalState, "approved_for_runtime_reference");
  assert.equal(output.readOnly, true);
  assert.equal(output.safeSummaryOnly, true);
  assert.equal(output.opaqueReferenceOnly, true);
  assert.equal(output.sourcePhotometryRef, "opaque-source-photometry-ref:opal-60");
  assert.equal(output.iesPhotometryReferenceToken, "ies-ref-token:opal-60");
  assert.equal(output.photometryReferenceFingerprint, "photometry-fp-001");
  assert.equal(output.sourceInputFingerprint, "source-input-fp-001");
  assert.equal(output.boardDataSourceVersion, "board-version-2026-07-10");
  assert.deepEqual(output.selectedFamilySubsetLock, { family: "opal", subset: "60mm" });
  assert.deepEqual(output.boardOwnedRuntimeFillApplied, []);
  assert.deepEqual(output.boardOwnedRuntimeFillMissing, []);
  assert.equal(output.rawIesContentReturned, false);
  assert.equal(output.rawPhotometryReturned, false);
  assert.equal(output.candelaArraysReturned, false);
  assert.equal(output.base64ArtifactsReturned, false);
  assert.equal(output.filenamesReturned, false);
  assert.equal(output.localPathsReturned, false);
  assert.equal(output.iesGenerationEnabled, false);
  assert.equal(output.iesGenerated, false);
  assert.equal(output.fileOutputEnabled, false);
  assert.equal(output.fileOutputWritten, false);
  assertNoForbiddenOutputFields(output);
});

test("fills board-owned runtime null slots from boardData when present", () => {
  const output = buildRuntimeLabIesSafeHandoffAdapter({
    safeRuntimeHandoff: safeRuntimeHandoff({
      lumenCurveReferenceToken: null,
      driverUtilCurveReferenceToken: null,
      boardDataSourceVersion: null,
      selectedFamilySubsetLock: null,
    }),
    boardData: {
      lumenCurveReferenceToken: "board-lumen-token",
      driverUtilCurveReferenceToken: "board-driver-token",
      boardDataSourceVersion: "board-version-runtime-fill",
      selectedFamilySubsetLock: {
        family: "runtime-family",
        subset: "runtime-subset",
      },
    },
  });

  assert.equal(output.ok, true);
  assert.equal(output.lumenCurveReferenceToken, "board-lumen-token");
  assert.equal(output.driverUtilCurveReferenceToken, "board-driver-token");
  assert.equal(output.boardDataSourceVersion, "board-version-runtime-fill");
  assert.deepEqual(output.selectedFamilySubsetLock, {
    family: "runtime-family",
    subset: "runtime-subset",
  });
  assert.deepEqual(output.boardOwnedRuntimeFillApplied, [
    "lumenCurveReferenceToken",
    "driverUtilCurveReferenceToken",
    "boardDataSourceVersion",
    "selectedFamilySubsetLock",
  ]);
  assert.deepEqual(output.boardOwnedRuntimeFillMissing, []);
});

test("does not fail only because board-owned runtime slots are null", () => {
  const output = buildRuntimeLabIesSafeHandoffAdapter({
    safeRuntimeHandoff: safeRuntimeHandoff({
      lumenCurveReferenceToken: null,
      driverUtilCurveReferenceToken: null,
      boardDataSourceVersion: null,
      selectedFamilySubsetLock: null,
    }),
  });

  assert.equal(output.ok, true);
  assert.equal(output.state, "runtime_lab_ies_safe_handoff_ready");
  assert.equal(output.lumenCurveReferenceToken, null);
  assert.equal(output.driverUtilCurveReferenceToken, null);
  assert.equal(output.boardDataSourceVersion, null);
  assert.equal(output.selectedFamilySubsetLock, null);
  assert.deepEqual(output.boardOwnedRuntimeFillMissing, [
    "lumenCurveReferenceToken",
    "driverUtilCurveReferenceToken",
    "boardDataSourceVersion",
    "selectedFamilySubsetLock",
  ]);
});

test("does not fail when derivedFromFingerprint is null on reference handoff", () => {
  const output = buildRuntimeLabIesSafeHandoffAdapter({
    safeRuntimeHandoff: safeRuntimeHandoff({
      derivedFromFingerprint: null,
    }),
  });

  assert.equal(output.ok, true);
  assert.equal(output.state, "runtime_lab_ies_safe_handoff_ready");
  assert.equal(output.derivedFromFingerprint, null);
});

test("fails closed on raw photometry candela base64 filename path or provenance internals", () => {
  const cases = [
    ["rawPhotometry", { rows: [1, 2, 3] }, "raw-photometry-not-approved"],
    ["candelaGrid", [[1, 2, 3]], "candela-not-approved"],
    ["base64Artifacts", "AAAA", "base64-not-approved"],
    ["filename", "sample.ies", "filename-or-path-not-approved"],
    ["localPath", "C:/ControlStack_Runtime/out/sample.ies", "filename-or-path-not-approved"],
    ["provenance", { internal: true }, "provenance-internals-not-approved"],
  ];

  for (const [field, value, blocker] of cases) {
    const output = buildRuntimeLabIesSafeHandoffAdapter({
      safeRuntimeHandoff: safeRuntimeHandoff({ [field]: value }),
    });

    assert.equal(output.ok, false, field);
    assert.equal(output.state, "runtime_lab_ies_safe_handoff_blocked_fail_closed", field);
    assert.equal(output.blocker, blocker, field);
    assertNoForbiddenOutputFields(output);
  }
});

test("fails closed on wrong schema or non-read-only non-summary handoff", () => {
  assert.equal(
    buildRuntimeLabIesSafeHandoffAdapter({
      safeRuntimeHandoff: safeRuntimeHandoff({ schemaId: "wrong.schema" }),
    }).blocker,
    "invalid-safe-runtime-handoff-schema",
  );

  assert.equal(
    buildRuntimeLabIesSafeHandoffAdapter({
      safeRuntimeHandoff: safeRuntimeHandoff({ readOnly: false }),
    }).blocker,
    "safe-runtime-handoff-not-read-only",
  );

  assert.equal(
    buildRuntimeLabIesSafeHandoffAdapter({
      safeRuntimeHandoff: safeRuntimeHandoff({ safeSummaryOnly: false }),
    }).blocker,
    "safe-runtime-handoff-not-summary-only",
  );
});

test("alias points to runtime adapter builder", () => {
  assert.equal(buildLabIesSafeHandoffAdapter, buildRuntimeLabIesSafeHandoffAdapter);
});
