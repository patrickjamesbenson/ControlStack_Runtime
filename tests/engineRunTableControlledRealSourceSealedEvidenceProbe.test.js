import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildControlledRealSourceSealedEvidenceProbeSummary,
  runControlledRealSourceSealedEvidenceProbe,
} from "../packages/workspace-kernel/engineRunTableControlledRealSourceSealedEvidenceProbe.js";
import { AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH } from "../packages/workspace-kernel/authorityReferenceMaterialiserService.js";

function fakeStat({ isFile = true, size = 789, mtime = new Date("2026-07-02T00:00:00.000Z") } = {}) {
  return {
    isFile: () => isFile,
    size,
    mtime,
  };
}

function fakeFs({ snapshot, statOk = true, readable = true, writes = [] } = {}) {
  return {
    async stat() {
      if (!statOk) {
        const error = new Error("missing");
        error.code = "ENOENT";
        throw error;
      }
      return fakeStat();
    },
    async readFile() {
      if (!readable) {
        const error = new Error("blocked");
        error.code = "EACCES";
        throw error;
      }
      return typeof snapshot === "string" ? snapshot : JSON.stringify(snapshot);
    },
    async writeFile() {
      writes.push("writeFile");
    },
    async mkdir() {
      writes.push("mkdir");
    },
  };
}

function validSnapshot(overrides = {}) {
  return {
    SYSTEM: [{ system: "raw-system-value-redacted-by-probe" }],
    OPTICS: [{ optic: "raw-optic-value-redacted-by-probe" }],
    ACCESSORIES: [{ accessory: "raw-accessory-value-redacted-by-probe" }],
    SPEC_CODES: [{ code: "raw-spec-code-value-redacted-by-probe" }],
    BOARDS: [
      {
        board_family: "raw-board-value-redacted-by-probe",
        length_mm: 1400,
        pitch_mm: 70,
        approved: "TRUE",
        light_direction: "Direct",
        control_type: "DALI-2",
        c1_vmax_v: 22.4,
        c1_pmax_w: 11.2,
      },
    ],
    DRIVERS: [
      {
        model: "raw-driver-value-redacted-by-probe",
        supply: "cc",
        iout_min_mA: 250,
        iout_max_mA: 700,
        vout_min_v: 12,
        vout_max_v: 54,
        pout_min_w: 5,
        pout_max_w: 60,
        native_control_type: "DALI-2",
        approved: "TRUE",
        driver_util_filename: "driver_util_raw_driver_value_redacted_by_probe.json",
      },
    ],
    PURE_REF_STATE: [{ pure: "raw-pure-value-redacted-by-probe" }],
    SYSTEM_COMPONENTS: [{ component: "raw-component-value-redacted-by-probe" }],
    SYSTEM_BOM_DEFAULTS: [{ bom: "raw-bom-value-redacted-by-probe" }],
    SYSTEM_POLICY: [{ policy: "raw-policy-value-redacted-by-probe" }],
    FIELD_EDITABILITY: [{ field: "raw-field-value-redacted-by-probe" }],
    ROLES_AND_LANES: [{ lane: "raw-role-value-redacted-by-probe" }],
    CODE_POLICY: [{ policy: "raw-code-policy-value-redacted-by-probe" }],
    MESSAGES: [{ message: "raw-message-value-redacted-by-probe" }],
    USERS: [{ email_login: "secret.user@example.com", role: "developer" }],
    ...overrides,
  };
}

const EXPECTED_STAGE_NAMES = Object.freeze([
  "selector-run-intake-preview",
  "selector-accessory-placement-intent-preview",
  "selector-special-parts-entitlement-preview",
  "runtime-accessory-reservation",
  "runtime-board-fill-input",
  "runtime-board-fill",
  "runtime-board-electrical",
  "runtime-driver-sizer",
  "runtime-sealed-segment-zone-bridge",
  "runtime-zone-validation-foothold",
  "runtime-emergency-zone-picker-marker-only",
  "runtime-gate-d-validation-scaffold",
  "runtime-sealed-candidate-assembly-preview",
  "runtime-runtable-domain-output-scaffold",
  "runtime-selected-result-handoff-scaffold",
  "selector-safe-draft-project-envelope-preview",
  "selector-safe-hydrate-validation-preview",
  "runtime-ies-handoff-readiness-scaffold",
]);

const FALSE_FLAGS = Object.freeze([
  "rawProductRowsReturned",
  "rawBoardRowsReturned",
  "rawDriverRowsReturned",
  "rawAccessoryRowsReturned",
  "rawRuntimeDataRowsReturned",
  "rawSelectorPayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "rawUsersReturned",
  "rawCrmReturned",
  "rawContactsReturned",
  "privatePathsReturned",
  "credentialsReturned",
  "donorEngineInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "productionRunTableGenerated",
  "runTableGenerated",
  "iesGenerated",
  "hubSpotWriteEnabled",
  "projectWriteEnabled",
  "routesAdded",
  "postEndpointsAdded",
]);

function assertNoUnsafeEvidence(summary) {
  for (const key of FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
  }

  const serialised = JSON.stringify(summary);
  assert.equal(serialised.includes("raw-board-value-redacted-by-probe"), false);
  assert.equal(serialised.includes("raw-driver-value-redacted-by-probe"), false);
  assert.equal(serialised.includes("raw-accessory-value-redacted-by-probe"), false);
  assert.equal(serialised.includes("secret.user@example.com"), false);
  assert.equal(serialised.includes("email_login"), false);
  assert.equal(serialised.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serialised.includes("C:\\ControlStack"), false);
  assert.equal(serialised.includes("IESNA:"), false);
  assert.equal(serialised.includes("candelaGrid"), false);
}

test("controlled real-source sealed evidence probe reaches safe sealed stages and fails closed before selected-result source", async () => {
  const writes = [];
  const summary = await runControlledRealSourceSealedEvidenceProbe({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: validSnapshot(), writes }),
  });

  assert.equal(summary.schemaId, "controlstack.engine-runtable.controlled-real-source-sealed-evidence-probe");
  assert.equal(summary.schemaVersion, 1);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.controlledEvidenceOnly, true);
  assert.equal(summary.ok, false);
  assert.equal(summary.realSourceSealedEvidenceReady, false);
  assert.equal(summary.blocker, "donor-engine-invocation-not-approved");
  assert.match(summary.policyFingerprint, /^safe-policy:/);
  assert.match(summary.sourceFingerprint, /^safe-board-fill:/);
  assert.match(summary.safeCandidateSourceSummary.sourceFingerprint, /^safe-source:runtime-active-/);
  assert.match(summary.evidenceFingerprint, /^safe-evidence:/);

  assert.equal(summary.safeCandidateSourceSummary.activeSourceDbLoadedReadOnly, true);
  assert.equal(summary.safeCandidateSourceSummary.usersRedacted, true);
  assert.equal(summary.safeSelectorTokenSummary.rawSelectorPayloadReturned, false);
  assert.equal(summary.boardFamilyProjectionSummary.sourceBacked, true);
  assert.equal(summary.boardFamilyProjectionSummary.boardFamilyProjectionReady, true);
  assert.match(summary.boardFamilyProjectionSummary.boardFamilyProjectionFingerprint, /^safe-board-family-projection:/);
  assert.equal(summary.boardFamilyProjectionSummary.rawBoardRowsReturned, false);
  assert.equal(summary.safeBoardFamilySummary.sourceBacked, true);
  assert.match(summary.safeBoardFamilySummary.boardFamilyProjectionFingerprint, /^safe-board-family-projection:/);
  assert.equal(summary.safeBoardFamilySummary.rawBoardRowsReturned, false);
  assert.equal(summary.driverCandidateProjectionSummary.sourceBacked, true);
  assert.equal(summary.driverCandidateProjectionSummary.driverCandidateProjectionReady, true);
  assert.match(summary.driverCandidateProjectionSummary.driverCandidateProjectionFingerprint, /^safe-driver-candidate-projection:/);
  assert.equal(summary.driverCandidateProjectionSummary.rawDriverRowsReturned, false);
  assert.equal(summary.driverCandidateProjectionSummary.rawCurveRowsReturned, false);
  assert.equal(summary.driverCandidateProjectionSummary.exactElectricalValuesReturned, false);
  assert.equal(summary.safeAccessoryPolicySummary.rawAccessoryRowsReturned, false);
  assert.equal(summary.safeDriverCandidateProjectionSummary.sourceBacked, true);
  assert.match(summary.safeDriverCandidateProjectionSummary.driverCandidateProjectionFingerprint, /^safe-driver-candidate-projection:/);
  assert.equal(summary.safeDriverCandidateProjectionSummary.rawDriverRowsReturned, false);
  assert.equal(summary.safeDriverCandidateProjectionSummary.rawCurveRowsReturned, false);
  assert.equal(summary.safeDriverCandidateProjectionSummary.exactElectricalValuesReturned, false);
  assert.equal(summary.safeCurveReferenceSummary.rawIesContentReturned, false);
  assert.equal(summary.safePhysicalPlacementRequirementSummary.rawCoordinatesReturned, false);

  const stageNames = summary.stageReadinessSummary.map((stage) => stage.stage);
  assert.deepEqual(stageNames, [...EXPECTED_STAGE_NAMES]);
  const readyStages = summary.stageReadinessSummary.slice(0, 14);
  const blockedStages = summary.stageReadinessSummary.slice(14);
  for (const stage of readyStages) {
    assert.equal(stage.reached, true, stage.stage);
    assert.equal(stage.ready, true, stage.stage);
    assert.equal(stage.rawRowsReturned, false, stage.stage);
    assert.equal(stage.rawPayloadReturned, false, stage.stage);
    assert.equal(stage.generated, false, stage.stage);
  }
  for (const stage of blockedStages) {
    assert.equal(stage.reached, false, stage.stage);
    assert.equal(stage.ready, false, stage.stage);
    assert.equal(stage.blocker, "donor-engine-invocation-not-approved", stage.stage);
    assert.equal(stage.rawRowsReturned, false, stage.stage);
    assert.equal(stage.rawPayloadReturned, false, stage.stage);
    assert.equal(stage.generated, false, stage.stage);
  }

  assert.equal(summary.sealedChainReadinessSummary.chainComposed, false);
  assert.equal(summary.sealedChainReadinessSummary.readyStageCount, 14);
  assert.equal(summary.sealedChainReadinessSummary.selectedResultSourceBodyAvailable, false);
  assert.equal(summary.sealedChainReadinessSummary.selectedResultSourceBodyBlocker, "donor-engine-invocation-not-approved");
  assert.equal(summary.sealedChainReadinessSummary.productionRunTableReady, false);
  assert.equal(summary.sealedChainReadinessSummary.iesGenerationReady, false);
  assert.equal(summary.sealedChainReadinessSummary.donorEngineReady, false);

  assert.deepEqual(writes, []);
  assertNoUnsafeEvidence(summary);
});

test("controlled real-source sealed evidence probe fingerprint is deterministic", async () => {
  const first = await runControlledRealSourceSealedEvidenceProbe({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: validSnapshot() }),
  });
  const second = await runControlledRealSourceSealedEvidenceProbe({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: validSnapshot() }),
  });

  assert.equal(first.ok, false);
  assert.equal(first.blocker, "donor-engine-invocation-not-approved");
  assert.equal(first.evidenceFingerprint, second.evidenceFingerprint);
  assert.equal(first.sourceFingerprint, second.sourceFingerprint);
  assert.equal(first.policyFingerprint, second.policyFingerprint);
  assert.equal(first.boardFamilyProjectionSummary.boardFamilyProjectionFingerprint, second.boardFamilyProjectionSummary.boardFamilyProjectionFingerprint);
  assert.equal(first.driverCandidateProjectionSummary.driverCandidateProjectionFingerprint, second.driverCandidateProjectionSummary.driverCandidateProjectionFingerprint);
  assert.deepEqual(first.stageReadinessSummary, second.stageReadinessSummary);
});

test("controlled real-source sealed evidence probe fails closed without a safe board-family projection", async () => {
  const summary = await runControlledRealSourceSealedEvidenceProbe({
    sourcePath: AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
    fsApi: fakeFs({ snapshot: validSnapshot({ BOARDS: undefined }) }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.realSourceSealedEvidenceReady, false);
  assert.equal(summary.blocker, "missing-safe-board-family-projection");
  assert.match(summary.evidenceFingerprint, /^safe-evidence:/);
  assert.equal(summary.donorEngineInvoked, false);
  assert.equal(summary.runtimeDataMutated, false);
  assert.equal(summary.selectedResultPersisted, false);
  assert.equal(summary.runTableGenerated, false);
  assert.equal(summary.iesGenerated, false);
  assertNoUnsafeEvidence(summary);
});

test("controlled real-source sealed evidence probe fails closed without a safe source fingerprint", () => {
  const summary = buildControlledRealSourceSealedEvidenceProbeSummary({
    sourceAccessSummary: {
      ok: true,
      activeSourceDbLoadedReadOnly: true,
      source: { sourceFingerprint: null, pathReturned: false },
      tableSummary: [
        { table: "SYSTEM", present: true, rowCount: 1 },
        { table: "OPTICS", present: true, rowCount: 1 },
        { table: "ACCESSORIES", present: true, rowCount: 1 },
        { table: "BOARDS", present: true, rowCount: 1 },
        { table: "DRIVERS", present: true, rowCount: 1 },
        { table: "SYSTEM_POLICY", present: true, rowCount: 1 },
      ],
    },
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "missing-safe-source-fingerprint");
  assert.equal(summary.donorEngineInvoked, false);
  assert.equal(summary.runtimeDataMutated, false);
  assert.equal(summary.selectedResultPersisted, false);
  assert.equal(summary.runTableGenerated, false);
  assert.equal(summary.iesGenerated, false);
});

test("controlled real-source sealed evidence probe adds no public route or POST endpoint", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");
  assert.equal(serverText.includes("controlled-real-source-sealed-evidence"), false);
  assert.equal(serverText.includes("engineRunTableControlledRealSourceSealedEvidenceProbe"), false);
  assert.equal(serverText.includes("/api/engine-runtable"), false);
});
