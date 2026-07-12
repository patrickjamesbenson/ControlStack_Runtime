import test from "node:test";
import assert from "node:assert/strict";

import {
  createProjectBrowserService,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION,
} from "../packages/workspace-kernel/projectBrowserService.js";

const PRIMARY_PAIR = Object.freeze([
  "projectIesExportResultReadbackSummary",
  "selectedProjectIesExportResultReadbackDetailSummary",
]);

const LEGACY_DIAGNOSTIC_PAIR = Object.freeze([
  "projectIesExportBoundaryReadbackSummary",
  "selectedProjectIesExportBoundaryReadbackDetailSummary",
]);

function fakeStore() {
  return {
    getStoreSnapshot() {
      return {
        projects: [],
        count: 0,
        savedCount: 0,
        fixtureCount: 0,
        safeEmpty: true,
        save: {},
        restore: {},
        hydrate: {},
        handoffShare: {},
      };
    },
  };
}

test("project browser classifies result readback as the sole primary pair while retaining frozen boundary diagnostics", () => {
  const service = createProjectBrowserService({ savedProjectStore: fakeStore() });

  const firstSnapshot = service.getProjectBrowserSnapshot({});
  const secondSnapshot = service.getProjectBrowserSnapshot({});
  const classification = firstSnapshot.projectIesExportReadbackSurfaceClassification;

  assert.strictEqual(
    classification,
    PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION,
  );
  assert.strictEqual(
    secondSnapshot.projectIesExportReadbackSurfaceClassification,
    classification,
  );
  assert.equal(Object.isFrozen(classification), true);
  assert.equal(Object.isFrozen(classification.solePrimaryBrowserReadinessPair), true);
  assert.equal(Object.isFrozen(classification.frozenLegacyButKeptCompatibilityDiagnostics), true);
  assert.deepEqual(classification, {
    schemaId: "controlstack.runtime.project-browser.project-ies-export-readback-surface-classification.v1",
    schemaVersion: 1,
    solePrimaryBrowserReadinessPair: PRIMARY_PAIR,
    frozenLegacyButKeptCompatibilityDiagnostics: LEGACY_DIAGNOSTIC_PAIR,
    deletionProhibitedUntilSeparateStagedRemovalPlanExists: true,
    readOnly: true,
    summaryOnly: true,
    redacted: true,
    deterministic: true,
  });

  for (const field of [...PRIMARY_PAIR, ...LEGACY_DIAGNOSTIC_PAIR]) {
    assert.equal(Object.prototype.hasOwnProperty.call(firstSnapshot, field), true, field);
    assert.equal(typeof firstSnapshot[field], "object", field);
    assert.notEqual(firstSnapshot[field], null, field);
  }

  assert.deepEqual(
    classification.solePrimaryBrowserReadinessPair,
    PRIMARY_PAIR,
  );
  assert.deepEqual(
    classification.frozenLegacyButKeptCompatibilityDiagnostics,
    LEGACY_DIAGNOSTIC_PAIR,
  );
  assert.equal(
    classification.deletionProhibitedUntilSeparateStagedRemovalPlanExists,
    true,
  );
});
