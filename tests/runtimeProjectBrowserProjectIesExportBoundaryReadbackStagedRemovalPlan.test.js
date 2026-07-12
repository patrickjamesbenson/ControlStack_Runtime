import test from "node:test";
import assert from "node:assert/strict";

import {
  createProjectBrowserService,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STAGED_REMOVAL_PLAN,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION,
} from "../packages/workspace-kernel/projectBrowserService.js";

const BOUNDARY_PAIR = Object.freeze([
  "projectIesExportBoundaryReadbackSummary",
  "selectedProjectIesExportBoundaryReadbackDetailSummary",
]);

const RESULT_PAIR = Object.freeze([
  "projectIesExportResultReadbackSummary",
  "selectedProjectIesExportResultReadbackDetailSummary",
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

test("project browser exposes a frozen boundary-readback staged-removal plan without changing the four compatibility projections", () => {
  const service = createProjectBrowserService({ savedProjectStore: fakeStore() });

  const firstSnapshot = service.getProjectBrowserSnapshot({});
  const secondSnapshot = service.getProjectBrowserSnapshot({});
  const plan = firstSnapshot.projectIesExportBoundaryReadbackStagedRemovalPlan;

  assert.strictEqual(
    plan,
    PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STAGED_REMOVAL_PLAN,
  );
  assert.strictEqual(
    secondSnapshot.projectIesExportBoundaryReadbackStagedRemovalPlan,
    plan,
  );
  assert.notStrictEqual(
    plan,
    PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION,
  );
  assert.equal(Object.isFrozen(plan), true);
  assert.equal(Object.isFrozen(plan.frozenBoundaryReadbackPair), true);
  assert.equal(Object.isFrozen(plan.soleReplacementResultReadbackPair), true);

  assert.deepEqual(plan, {
    schemaId: "controlstack.runtime.project-browser.project-ies-export-boundary-readback-staged-removal-plan.v1",
    schemaVersion: 1,
    currentStage: "freeze-and-retain",
    frozenBoundaryReadbackPair: BOUNDARY_PAIR,
    soleReplacementResultReadbackPair: RESULT_PAIR,
    newFeatureWorkProhibited: true,
    newConsumerAdoptionProhibited: true,
    compatibilityPresenceMandatory: true,
    compatibilityShapeMandatory: true,
    explicitConsumerInventoryRequiredBeforeRemoval: true,
    explicitConsumerMigrationEvidenceRequiredBeforeRemoval: true,
    removalAuthorised: false,
    readOnly: true,
    declarative: true,
    deterministic: true,
  });

  assert.deepEqual(plan.frozenBoundaryReadbackPair, BOUNDARY_PAIR);
  assert.deepEqual(plan.soleReplacementResultReadbackPair, RESULT_PAIR);
  assert.equal(plan.newFeatureWorkProhibited, true);
  assert.equal(plan.newConsumerAdoptionProhibited, true);
  assert.equal(plan.compatibilityPresenceMandatory, true);
  assert.equal(plan.compatibilityShapeMandatory, true);
  assert.equal(plan.explicitConsumerInventoryRequiredBeforeRemoval, true);
  assert.equal(plan.explicitConsumerMigrationEvidenceRequiredBeforeRemoval, true);
  assert.equal(plan.removalAuthorised, false);

  for (const field of [...BOUNDARY_PAIR, ...RESULT_PAIR]) {
    assert.equal(Object.prototype.hasOwnProperty.call(firstSnapshot, field), true, field);
    assert.equal(Object.prototype.hasOwnProperty.call(secondSnapshot, field), true, field);
    assert.equal(typeof firstSnapshot[field], "object", field);
    assert.notEqual(firstSnapshot[field], null, field);
    assert.deepEqual(secondSnapshot[field], firstSnapshot[field], field);
  }

  assert.deepEqual(
    firstSnapshot.projectIesExportReadbackSurfaceClassification,
    {
      schemaId: "controlstack.runtime.project-browser.project-ies-export-readback-surface-classification.v1",
      schemaVersion: 1,
      solePrimaryBrowserReadinessPair: RESULT_PAIR,
      frozenLegacyButKeptCompatibilityDiagnostics: BOUNDARY_PAIR,
      deletionProhibitedUntilSeparateStagedRemovalPlanExists: true,
      readOnly: true,
      summaryOnly: true,
      redacted: true,
      deterministic: true,
    },
  );
});
