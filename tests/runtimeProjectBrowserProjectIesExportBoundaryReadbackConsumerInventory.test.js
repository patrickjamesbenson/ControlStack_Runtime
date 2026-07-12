import test from "node:test";
import assert from "node:assert/strict";

import {
  createProjectBrowserService,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_CONSUMER_INVENTORY,
} from "../packages/workspace-kernel/projectBrowserService.js";

const BOUNDARY_PAIR = Object.freeze([
  "projectIesExportBoundaryReadbackSummary",
  "selectedProjectIesExportBoundaryReadbackDetailSummary",
]);

const RESULT_PAIR = Object.freeze([
  "projectIesExportResultReadbackSummary",
  "selectedProjectIesExportResultReadbackDetailSummary",
]);

const CONTRACT_TESTS = Object.freeze([
  "tests/runtimeProjectBrowserProjectIesExportBoundaryReadbackConsumer.test.js",
  "tests/runtimeProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailConsumer.test.js",
  "tests/runtimeProjectBrowserProjectIesExportReadbackSurfaceClassification.test.js",
  "tests/runtimeProjectBrowserProjectIesExportBoundaryReadbackStagedRemovalPlan.test.js",
  "tests/runtimeIesFirstNarrowProjectIesExportCrossLayerContractLock.test.js",
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

test("project browser exposes a frozen declarative consumer inventory for the legacy boundary-readback pair", () => {
  const service = createProjectBrowserService({ savedProjectStore: fakeStore() });
  const firstSnapshot = service.getProjectBrowserSnapshot({});
  const secondSnapshot = service.getProjectBrowserSnapshot({});
  const inventory = firstSnapshot.projectIesExportBoundaryReadbackConsumerInventory;

  assert.strictEqual(
    inventory,
    PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_CONSUMER_INVENTORY,
  );
  assert.strictEqual(
    secondSnapshot.projectIesExportBoundaryReadbackConsumerInventory,
    inventory,
  );

  assert.deepEqual(inventory, {
    schemaId: "controlstack.runtime.project-browser.project-ies-export-boundary-readback-consumer-inventory.v1",
    schemaVersion: 1,
    inventoryScope: "tracked-runtime-source-and-contract-tests",
    inventoryState: "repository_consumers_inventoried_removal_not_authorised",
    inventoriedBoundaryReadbackPair: BOUNDARY_PAIR,
    replacementResultReadbackPair: RESULT_PAIR,
    directFieldSpecificRuntimeConsumers: [
      {
        consumerId: "selected-project-boundary-readback-detail-derivation",
        sourceFile: "packages/workspace-kernel/projectBrowserService.js",
        sourceSurface: "projectIesExportBoundaryReadbackSummary",
        consumerFunction: "buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary",
        outputSurface: "selectedProjectIesExportBoundaryReadbackDetailSummary",
        replacementSourceSurface: "projectIesExportResultReadbackSummary",
        replacementConsumerFunction: "buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary",
        replacementOutputSurface: "selectedProjectIesExportResultReadbackDetailSummary",
        compatibilityOnly: true,
        featureConsumer: false,
        replacementPresent: true,
        migratedToReplacement: false,
      },
    ],
    wholeSnapshotCarriers: [
      {
        carrierId: "shell-context-project-browser-snapshot",
        sourceFile: "packages/workspace-kernel/context.js",
        functionName: "createShellContext",
        fieldSpecificRead: false,
      },
      {
        carrierId: "diagnostics-project-browser-snapshot",
        sourceFile: "packages/plugins/diagnostics/diagnosticsViewModel.js",
        functionName: "readProjectBrowser",
        fieldSpecificRead: false,
      },
    ],
    knownFeatureConsumers: [],
    compatibilityContractTests: CONTRACT_TESTS,
    trackedRepositoryInventoryComplete: true,
    consumerFree: false,
    externalConsumerAbsenceProven: false,
    migrationEvidenceComplete: false,
    removalAuthorised: false,
    readOnly: true,
    declarative: true,
    deterministic: true,
  });

  assert.equal(Object.isFrozen(inventory), true);
  assert.equal(Object.isFrozen(inventory.inventoriedBoundaryReadbackPair), true);
  assert.equal(Object.isFrozen(inventory.replacementResultReadbackPair), true);
  assert.equal(Object.isFrozen(inventory.directFieldSpecificRuntimeConsumers), true);
  assert.equal(Object.isFrozen(inventory.directFieldSpecificRuntimeConsumers[0]), true);
  assert.equal(Object.isFrozen(inventory.wholeSnapshotCarriers), true);
  assert.equal(Object.isFrozen(inventory.wholeSnapshotCarriers[0]), true);
  assert.equal(Object.isFrozen(inventory.wholeSnapshotCarriers[1]), true);
  assert.equal(Object.isFrozen(inventory.knownFeatureConsumers), true);
  assert.equal(Object.isFrozen(inventory.compatibilityContractTests), true);

  assert.deepEqual(inventory.inventoriedBoundaryReadbackPair, BOUNDARY_PAIR);
  assert.deepEqual(inventory.replacementResultReadbackPair, RESULT_PAIR);
  assert.equal(inventory.directFieldSpecificRuntimeConsumers.length, 1);
  assert.equal(inventory.wholeSnapshotCarriers.length, 2);
  assert.deepEqual(inventory.knownFeatureConsumers, []);
  assert.equal(inventory.consumerFree, false);
  assert.equal(inventory.externalConsumerAbsenceProven, false);
  assert.equal(inventory.migrationEvidenceComplete, false);
  assert.equal(inventory.removalAuthorised, false);

  for (const field of [...BOUNDARY_PAIR, ...RESULT_PAIR]) {
    assert.equal(Object.prototype.hasOwnProperty.call(firstSnapshot, field), true, field);
    assert.equal(Object.prototype.hasOwnProperty.call(secondSnapshot, field), true, field);
    assert.deepEqual(secondSnapshot[field], firstSnapshot[field], field);
    assert.equal(
      Object.prototype.hasOwnProperty.call(firstSnapshot[field], "projectIesExportBoundaryReadbackConsumerInventory"),
      false,
      field,
    );
  }

  const serialised = JSON.stringify(inventory);
  for (const prohibitedKey of [
    "projectIesText",
    "rawIesText",
    "candela",
    "governancePayload",
    "mutationLog",
    "filename",
    "filePath",
    "privatePath",
    "base64",
    "projectEnvelope",
    "resultBody",
  ]) {
    assert.equal(serialised.includes(prohibitedKey), false, prohibitedKey);
  }
});
