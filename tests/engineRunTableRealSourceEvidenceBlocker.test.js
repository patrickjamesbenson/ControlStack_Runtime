import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import {
  adaptRunTableSelectedResultSourceContractToSelectedResultProjection,
  buildRunTableSelectedResultSourceContract,
} from "../packages/workspace-kernel/runTableSelectedResultSourceContract.js";
import { buildIesBuilderSelectedResultHandoffContract, buildIesBuilderStatus } from "../packages/workspace-kernel/iesBuilderStatusService.js";

const serverSourceUrl = new URL("../server.js", import.meta.url);
const removedSmokeTestUrl = new URL("./engineRunTableResultEvidenceSmoke.test.js", import.meta.url);
const removedSmokeFixtureUrl = new URL("./fixtures/engineRunTableResultEvidenceSmokeFixture.js", import.meta.url);

const BLOCKERS = Object.freeze([
  "real-source-candidate-not-established",
  "real-engine-result-not-produced",
  "selected-family-subset-lock-unavailable",
  "board-data-source-version-unavailable",
  "source-input-fingerprint-unavailable",
  "source-photometry-ref-unavailable",
]);

async function exists(url) {
  try {
    await access(url);
    return true;
  } catch {
    return false;
  }
}

const blockerCodes = (contract) => contract.blockers.map((entry) => entry.code);

test("synthetic Engine RunTable smoke files are removed", async () => {
  assert.equal(await exists(removedSmokeTestUrl), false);
  assert.equal(await exists(removedSmokeFixtureUrl), false);
});

test("real-source evidence remains blocked instead of simulating selected-result success", () => {
  const sourceContract = buildRunTableSelectedResultSourceContract();
  const projection = adaptRunTableSelectedResultSourceContractToSelectedResultProjection(sourceContract);
  const waitingHandoff = buildIesBuilderSelectedResultHandoffContract();
  const projectionHandoff = buildIesBuilderSelectedResultHandoffContract(projection);
  const status = buildIesBuilderStatus();

  assert.deepEqual(BLOCKERS, [
    "real-source-candidate-not-established",
    "real-engine-result-not-produced",
    "selected-family-subset-lock-unavailable",
    "board-data-source-version-unavailable",
    "source-input-fingerprint-unavailable",
    "source-photometry-ref-unavailable",
  ]);

  assert.equal(sourceContract.sourceAvailable, false);
  assert.equal(sourceContract.selectedResultAvailable, false);
  assert.equal(sourceContract.accepted, false);
  assert.equal(sourceContract.engineVerified, false);
  assert.equal(sourceContract.perRunLookupNormalised, false);
  assert.equal(sourceContract.engineExecutionAttempted, false);
  assert.equal(sourceContract.runTableGenerationAttempted, false);
  assert.equal(sourceContract.selectedResultIngestionAttempted, false);
  assert.equal(sourceContract.selectedResultPersistenceAttempted, false);

  assert.equal(projection.selectedResultAvailable, false);
  assert.equal(projection.accepted, false);
  assert.equal(projection.engineVerified, false);
  assert.equal(projection.perRunLookupNormalised, false);
  assert.deepEqual(projection.runs, []);
  assert.deepEqual(projection.runsByKey, {});
  assert.equal(projection.routesAdded, false);
  assert.equal(projection.postEndpointsAdded, false);
  assert.equal(projection.safetyFlags.rawSelectedPayloadExposed, false);
  assert.equal(projection.safetyFlags.rawEngineDebugPayloadExposed, false);
  assert.equal(projection.safetyFlags.rawBoardDataRowsExposed, false);
  assert.equal(projection.safetyFlags.rawUsersExposed, false);
  assert.equal(projection.safetyFlags.privatePathsExposed, false);
  assert.equal(projection.safetyFlags.rawIesExposed, false);
  assert.equal(projection.safetyFlags.rawLabEvidenceExposed, false);
  assert.equal(projection.safetyFlags.rawPdfsExposed, false);

  assert.equal(waitingHandoff.handoffState, "waiting_for_selected_engine_runtable_result");
  assert.deepEqual(blockerCodes(waitingHandoff), ["waiting-for-selected-engine-runtable-result"]);
  assert.equal(waitingHandoff.ready, false);
  assert.equal(waitingHandoff.productionProof, false);
  assert.equal(waitingHandoff.labProofAuthority, false);
  assert.equal(waitingHandoff.candidateOutputOnly, true);

  assert.equal(projectionHandoff.handoffState, "blocked_selected_result_unavailable");
  assert.deepEqual(blockerCodes(projectionHandoff), [
    "selected-result-unavailable",
    "missing-selected-family-subset-lock",
    "missing-per-run-lookup-normalised",
    "missing-board-data-source-version",
    "missing-source-input-fingerprint",
    "missing-source-photometry-ref",
  ]);
  assert.equal(projectionHandoff.ready, false);
  assert.equal(projectionHandoff.redactionFlags.rawEnginePayloadExposed, false);
  assert.equal(projectionHandoff.redactionFlags.rawBoardDataRowsExposed, false);
  assert.equal(projectionHandoff.redactionFlags.rawIesExposed, false);
  assert.equal(projectionHandoff.redactionFlags.rawCandelaGridExposed, false);
  assert.equal(projectionHandoff.redactionFlags.rawLabEvidenceExposed, false);
  assert.equal(projectionHandoff.redactionFlags.rawPdfsExposed, false);
  assert.equal(projectionHandoff.redactionFlags.base64PolarPlotsExposed, false);

  assert.equal(status.selectedResultAvailable, false);
  assert.equal(status.handoffState, "waiting_for_selected_engine_runtable_result");
  assert.equal(status.productionProof, false);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.iesGenerationEnabled, false);
});

test("real-source blocker coverage adds no active route, endpoint, persistence, generation, or proof path", async () => {
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const sourceContract = buildRunTableSelectedResultSourceContract();
  const projection = adaptRunTableSelectedResultSourceContractToSelectedResultProjection(sourceContract);
  const handoff = buildIesBuilderSelectedResultHandoffContract(projection);

  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
  assert.equal(serverText.includes("/api/selected-result"), false);
  assert.equal(serverText.includes("ENGINE_RUNTABLE_REAL_SOURCE_EVIDENCE_WRITE"), false);
  assert.equal(serverText.includes("SELECTOR_RUN_WRITE"), false);
  assert.equal(serverText.includes("SELECTED_RESULT_WRITE"), false);

  assert.equal(sourceContract.engineExecutionAttempted, false);
  assert.equal(sourceContract.runTableGenerationAttempted, false);
  assert.equal(sourceContract.selectedResultIngestionAttempted, false);
  assert.equal(sourceContract.selectedResultPersistenceAttempted, false);
  assert.equal(projection.safetyFlags.selectedResultPersistenceEnabled, false);
  assert.equal(projection.safetyFlags.staleResultComparisonEnabled, false);
  assert.equal(projection.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(projection.safetyFlags.payloadGenerationEnabled, false);
  assert.equal(projection.safetyFlags.iesGenerationEnabled, false);
  assert.equal(projection.safetyFlags.labProofAuthority, false);
  assert.equal(handoff.safetyFlags.routesAdded, false);
  assert.equal(handoff.safetyFlags.postEndpointsAdded, false);
  assert.equal(handoff.safetyFlags.engineExecutionEnabled, false);
  assert.equal(handoff.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(handoff.safetyFlags.iesGenerationEnabled, false);
  assert.equal(handoff.safetyFlags.complianceApprovalEnabled, false);
});
