import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS,
  adaptRunTableDomainOutputToPerRunDisplay,
  buildRunTableDomainPreviewProjection,
  normalizeReservedRanges,
  normalizeRunBodyGapContext,
  packGreedyBoardRun,
} from "../packages/workspace-kernel/engineRunTableDomain.js";
import { createSelectedResultPerRunDisplayRowShape } from "../packages/workspace-kernel/selectedResultProjectionService.js";
import {
  enrichSelectedProjectReadonlyEngineBridgeRequest,
  resolveSelectedProjectSourceBackedOpticEfficiency,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectSourceBackedOpticEfficiency.js";
import {
  bindSelectedProjectSourceBackedTier,
  resolveSelectedProjectSourceBackedTier,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectSourceBackedTier.js";

const domainSourceUrl = new URL("../packages/workspace-kernel/engineRunTableDomain.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function assertGenerationProofWriteDisabled(flags) {
  assert.equal(flags.engineExecutionEnabled, false);
  assert.equal(flags.engineVerificationEnabled, false);
  assert.equal(flags.selectedResultIngestionEnabled, false);
  assert.equal(flags.selectedResultPersistenceEnabled, false);
  assert.equal(flags.staleResultComparisonEnabled, false);
  assert.equal(flags.runTableGenerationEnabled, false);
  assert.equal(flags.payloadGenerationEnabled, false);
  assert.equal(flags.iesGenerationEnabled, false);
  assert.equal(flags.drawingGenerationEnabled, false);
  assert.equal(flags.labProofAuthority, false);
  assert.equal(flags.complianceProofAuthority, false);
  assert.equal(flags.controlledRecordsWriteEnabled, false);
  assert.equal(flags.rregApprovalEnabled, false);
  assert.equal(flags.rregCustodyTransferEnabled, false);
  assert.equal(flags.hubSpotCrmWriteBackEnabled, false);
  assert.equal(flags.boardDataMutationEnabled, false);
  assert.equal(flags.hiddenWriteBackEnabled, false);
}

function assertRawExposureDisabled(flags) {
  assert.equal(flags.rawSelectedPayloadExposed, false);
  assert.equal(flags.rawEngineDebugPayloadExposed, false);
  assert.equal(flags.rawCandidateAlternativesExposedAsFinalOutputs, false);
  assert.equal(flags.rawBoardDataRowsExposed, false);
  assert.equal(flags.rawBoardDataHeadersExposed, false);
  assert.equal(flags.rawUsersExposed, false);
  assert.equal(flags.credentialsExposed, false);
  assert.equal(flags.privatePathsExposed, false);
  assert.equal(flags.rawLabEvidenceExposed, false);
  assert.equal(flags.rawIesExposed, false);
  assert.equal(flags.rawArtefactsExposed, false);
  assert.equal(flags.rawPdfsExposed, false);
}

test("body/gap context normalises safe run and body values", () => {
  const ctx = normalizeRunBodyGapContext({
    runLengthMm: "1200",
    gapMode: "N+1",
    startGapMm: "25",
    endGapMm: "35",
    toleranceMm: "2",
  });

  assert.equal(ctx.ok, true);
  assert.equal(ctx.runLengthMm, 1200);
  assert.equal(ctx.bodyMmRequested, 1140);
  assert.equal(ctx.gapMode, "N+1");
  assert.equal(ctx.startGapMm, 25);
  assert.equal(ctx.endGapMm, 35);
  assert.deepEqual(ctx.gapSummary, {
    mode: "N+1",
    startGapMm: 25,
    endGapMm: 35,
    totalGapMm: 60,
    toleranceMm: 2,
    bodyStartMm: 25,
    bodyEndMm: 1165,
    bodyMmRequested: 1140,
  });
  assert.deepEqual(ctx.sanitisedWarnings, []);
  assert.equal(ctx.safetyFlags.engineExecutionEnabled, false);
});

test("N-1 body/gap context forces start and end gaps to zero safely", () => {
  const ctx = normalizeRunBodyGapContext({
    run_length_mm: 900,
    gap_mode: "N-1",
    start_board_gap_mm: 12,
    end_board_gap_mm: 18,
  });

  assert.equal(ctx.bodyMmRequested, 900);
  assert.equal(ctx.startGapMm, 0);
  assert.equal(ctx.endGapMm, 0);
  assert.equal(ctx.gapSummary.bodyStartMm, 0);
  assert.equal(ctx.gapSummary.bodyEndMm, 900);
  assert.ok(ctx.sanitisedWarnings.includes("N-1 gap mode forces start and end gaps to 0mm."));
});

test("reserved ranges sort, clip, and merge deterministically without raw metadata", () => {
  const reserved = normalizeReservedRanges([
    { start_mm: 300, end_mm: 450, kind: "sensor", private_note: "do not expose" },
    { start: 100, end: 200, type: "accessory", localPath: "C:\\ControlStack\\secret" },
    { start: 180, end: 260, type: "driver" },
    { start: -20, end: 20, type: "sensor" },
    { start: 900, end: 1100, type: "C:\\private" },
  ], { bodyMmRequested: 1000 });

  assert.deepEqual(reserved.reservedRanges, [
    { rangeIndex: 1, startMm: 0, endMm: 20, lengthMm: 20, type: "sensor" },
    { rangeIndex: 2, startMm: 100, endMm: 260, lengthMm: 160, type: "reserved" },
    { rangeIndex: 3, startMm: 300, endMm: 450, lengthMm: 150, type: "sensor" },
    { rangeIndex: 4, startMm: 900, endMm: 1000, lengthMm: 100, type: "reserved" },
  ]);
  assert.equal(reserved.reservedRangesSummary.count, 4);
  assert.equal(reserved.reservedRangesSummary.totalReservedMm, 430);
  assert.equal(reserved.reservedRangesSummary.availableBodyMm, 570);
  assert.equal(reserved.reservedRangesSummary.rawMetadataExposed, false);

  const payloadText = JSON.stringify(reserved);
  assert.equal(payloadText.includes("do not expose"), false);
  assert.equal(payloadText.includes("ControlStack"), false);
  assert.equal(payloadText.includes("localPath"), false);
});

test("greedy board-run packing selects a deterministic board sequence from sanitized inputs", () => {
  const packed = packGreedyBoardRun({
    runLengthMm: 1150,
    gapMode: "N+1",
    startGapMm: 15,
    endGapMm: 15,
    boardLengthCandidatesMm: [140, 560, 280, 560, 0, "bad"],
    boardFamilyLabel: "Linear Board 560/280/140",
  });

  assert.deepEqual(packed.boardLengthCandidatesMm, [560, 280, 140]);
  assert.deepEqual(packed.boardLengthSequenceMm, [560, 560]);
  assert.equal(packed.bodyMmRequested, 1120);
  assert.equal(packed.boardCount, 2);
  assert.equal(packed.boardFamily, "Linear Board 560 280 140");
  assert.equal(packed.usedLengthMm, 1120);
  assert.equal(packed.remainderMm, 0);
  assert.equal(packed.slackMm, 0);
  assert.equal(packed.boardRunSummary.strategy, "greedy_largest_first");
  assert.equal(packed.boardRunSummary.exactFill, true);
  assert.equal(packed.boardRunSummary.engineVerified, false);
  assert.equal(packed.boardRunSummary.accepted, false);
  assert.ok(packed.sanitisedWarnings.includes("A board length candidate was ignored because it was not a positive number."));
});

test("board-run packing accounts for reserved ranges, max usable span, remainder, and warnings", () => {
  const packed = packGreedyBoardRun({
    runLengthMm: 1000,
    gapMode: "N-1",
    reservedRanges: [
      { startMm: 100, endMm: 200, type: "sensor" },
      { startMm: 250, endMm: 320, type: "emergency" },
    ],
    board_family_lengths_sorted_desc: [300, 120],
    board_family_label: "DNX-safe-family",
    maxUsableSpanMm: 700,
    minUsableSpanMm: 720,
  });

  assert.equal(packed.bodyMmRequested, 1000);
  assert.equal(packed.reservedRangesSummary.totalReservedMm, 170);
  assert.equal(packed.reservedRangesSummary.availableBodyMm, 830);
  assert.equal(packed.boardRunSummary.targetUsableMm, 700);
  assert.deepEqual(packed.boardLengthSequenceMm, [300, 300]);
  assert.equal(packed.usedLengthMm, 600);
  assert.equal(packed.remainderMm, 100);
  assert.equal(packed.slackMm, 230);
  assert.equal(packed.boardRunSummary.generationEnabled, false);
  assert.ok(packed.sanitisedWarnings.includes("Usable board span was capped by maxUsableSpanMm."));
  assert.ok(packed.sanitisedWarnings.includes("Usable board span is below minUsableSpanMm."));
  assert.ok(packed.sanitisedWarnings.includes("Greedy board packing left a positive remainder."));
});

test("board-run packing does not enable filesystem, source, write, generation, proof, or raw exposure flags", async () => {
  const domainSource = await readFile(domainSourceUrl, "utf-8");
  const packed = packGreedyBoardRun({
    runLengthMm: 560,
    boardLengthCandidatesMm: [560],
  });

  assert.equal(domainSource.includes("node:fs"), false);
  assert.equal(domainSource.includes("node:path"), false);
  assert.equal(domainSource.includes("run_engine.py"), false);
  assert.equal(domainSource.includes("/api/engine/run"), false);
  assert.equal(domainSource.includes("/api/selector/run"), false);
  assert.equal(domainSource.includes("fetch("), false);
  assertGenerationProofWriteDisabled(ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS);
  assertRawExposureDisabled(ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS);
  assertGenerationProofWriteDisabled(packed.safetyFlags);
  assertRawExposureDisabled(packed.safetyFlags);
  assert.equal(packed.safetyFlags.sourceAvailable, false);
  assert.equal(packed.safetyFlags.selectedResultAvailable, false);
  assert.equal(packed.safetyFlags.routesAdded, false);
  assert.equal(packed.safetyFlags.postEndpointsAdded, false);
});

test("safe per-run projection adapter emits only selected-result display vocabulary", () => {
  const packed = packGreedyBoardRun({
    runLengthMm: 840,
    boardLengthCandidatesMm: [560, 280],
    boardFamilyLabel: "Safe Family",
  });
  const row = adaptRunTableDomainOutputToPerRunDisplay(packed, {
    runKey: "run-A",
    runLabel: "Run A",
    runNumber: 1,
  });

  assert.deepEqual(Object.keys(row).sort(), Object.keys(createSelectedResultPerRunDisplayRowShape()).sort());
  assert.equal(row.runKey, "run-A");
  assert.equal(row.runLabel, "Run A");
  assert.equal(row.runNumber, 1);
  assert.equal(row.runLengthMm, 840);
  assert.equal(row.bodyMmRequested, 840);
  assert.equal(row.boardCount, 2);
  assert.equal(row.boardFamily, "Safe Family");
  assert.equal(row.boardRunSummary.engineVerified, false);
  assert.equal(row.boardRunSummary.accepted, false);
  assert.equal(row.zoneCount, null);
  assert.equal(row.zonePlanSummary.generationEnabled, false);
  assert.equal(row.mechanicalSummary.generationEnabled, false);

  const payloadText = JSON.stringify(row);
  assert.equal(payloadText.includes("raw"), false);
  assert.equal(payloadText.includes("rough_electrical_payload"), false);
  assert.equal(payloadText.includes("Board Data"), false);
  assert.equal(payloadText.includes("Lab evidence"), false);
});

test("domain output can be shaped toward selected-result projection without making the source available", () => {
  const packed = packGreedyBoardRun({
    runLengthMm: 840,
    boardLengthCandidatesMm: [560, 280],
    boardFamilyLabel: "Preview Family",
  });
  const projection = buildRunTableDomainPreviewProjection(packed, { runNumber: 2 });

  assert.equal(projection.domainKernelPreview, true);
  assert.equal(projection.sourceAvailable, false);
  assert.equal(projection.selectedResultAvailable, false);
  assert.equal(projection.selectedResultUnavailableReason, "pure Engine RunTable domain kernel preview only; no selected result source connected");
  assert.equal(projection.engineVerified, false);
  assert.equal(projection.accepted, false);
  assert.equal(projection.stale, false);
  assert.equal(projection.selectedFamilySubsetLock, null);
  assert.equal(projection.perRunLookupNormalised, false);
  assert.deepEqual(projection.runs, []);
  assert.deepEqual(projection.runsByKey, {});
  assert.equal(projection.domainPreviewRuns.length, 1);
  assert.equal(projection.domainPreviewRun.runLabel, "Run 2");
  assertGenerationProofWriteDisabled(projection.safetyFlags);
  assertRawExposureDisabled(projection.safetyFlags);
});

test("selected-project bridge enriches only one exact source-backed optic efficiency", () => {
  const bridgeRequest = {
    schemaId: "controlstack.runtime.engine-runtable.selected-project-host-seam-bridge.v1",
    schemaVersion: 1,
    selectorPayload: {
      tier: "First",
      runs: [{ qty: 1, run_length_mm: 1200 }],
      optic: { key: "Inlay" },
      lighting: {
        target_lm_per_m: "2000",
        cct: "4000",
        cri: "80",
        optic_key: "Inlay",
        control_type: "Fixed Output",
      },
      control_type: "Fixed Output",
      electrical: {},
    },
    execute: true,
    filesystemWriteGuardRequired: true,
    bytecodeWritingDisabled: true,
  };
  const snapshot = {
    OPTICS: [{ system: "80", optic: "Inlay", optical_eff: "0.8", private_note: "not-returned" }],
  };

  const result = enrichSelectedProjectReadonlyEngineBridgeRequest({ bridgeRequest, snapshot });

  assert.equal(result.ok, true);
  assert.equal(result.enriched, true);
  assert.equal(result.sourceResolution.efficiency, 0.8);
  assert.deepEqual(Object.keys(result.bridgeRequest), Object.keys(bridgeRequest));
  assert.equal(result.bridgeRequest.selectorPayload.lighting.eff_optical, 0.8);
  assert.equal(result.bridgeRequest.selectorPayload.lighting.optical_eff, 0.8);
  assert.equal(result.bridgeRequest.selectorPayload.lighting.optical_efficiency, 0.8);
  assert.equal(bridgeRequest.selectorPayload.lighting.optical_eff, undefined);
  assert.equal(JSON.stringify(result).includes("not-returned"), false);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawValuesReturned, false);
  assert.equal(result.fallbackUsed, false);
});

test("selected-project Tier binding derives exactly one valid source Tier and ignores stale client Tier", () => {
  const bridgeRequest = {
    schemaId: "controlstack.runtime.engine-runtable.selected-project-host-seam-bridge.v1",
    schemaVersion: 1,
    selectorPayload: {
      tier: "Stale Browser Tier",
      selectedTier: "Cached Tier",
      tier_strategy: {
        mode: "manual",
        selected_tier: "Default Tier",
        candidate_tiers: ["Default Tier"],
      },
      runs: [{ qty: 1, run_length_mm: 1200 }],
      lighting: { target_lm_per_m: "2000" },
    },
    execute: true,
    filesystemWriteGuardRequired: true,
    bytecodeWritingDisabled: true,
  };
  const snapshot = {
    SYSTEM_POLICY: [
      { item: "led_current_headroom_max_pct", Business: "10" },
      { item: "led_headroom_watts_multi", Business: "1.1" },
      { item: "segment_max_length_mm", Economy: "2800" },
    ],
  };

  const result = bindSelectedProjectSourceBackedTier({ bridgeRequest, snapshot });

  assert.equal(result.ok, true);
  assert.equal(result.bound, true);
  assert.equal(result.sourceResolution.validTierCount, 1);
  assert.equal(result.clientTierPresent, true);
  assert.equal(result.clientTierAuthorityAccepted, false);
  assert.equal(result.bridgeRequest.selectorPayload.tier, "Business");
  assert.deepEqual(result.bridgeRequest.selectorPayload.tier_strategy, {
    mode: "manual",
    selected_tier: "Business",
    candidate_tiers: ["Business"],
    optimisation_intent: "locked_manual",
  });
  assert.equal(Object.prototype.hasOwnProperty.call(result.bridgeRequest.selectorPayload, "selectedTier"), false);
  assert.equal(bridgeRequest.selectorPayload.tier, "Stale Browser Tier");
  assert.equal(result.fallbackUsed, false);
  assert.equal(result.defaultUsed, false);
  assert.equal(result.guessed, false);
});

test("selected-project Tier derivation fails closed when source authority is unavailable or ambiguous", () => {
  const unavailable = resolveSelectedProjectSourceBackedTier({
    snapshot: {
      SYSTEM_POLICY: [
        { item: "led_current_headroom_max_pct", Business: "10" },
      ],
    },
  });
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.blocker, "selected-project-source-backed-tier-derivation-unavailable");
  assert.equal(unavailable.validTierCount, 0);
  assert.equal(unavailable.fallbackUsed, false);

  const ambiguous = resolveSelectedProjectSourceBackedTier({
    snapshot: {
      SYSTEM_POLICY: [
        { item: "led_current_headroom_max_pct", Business: "10", First: "8" },
        { item: "led_headroom_watts_multi", Business: "1.1", First: "1.05" },
      ],
    },
  });
  assert.equal(ambiguous.ok, false);
  assert.equal(ambiguous.blocker, "selected-project-source-backed-tier-derivation-ambiguous");
  assert.equal(ambiguous.validTierCount, 2);
  assert.equal(ambiguous.tier, null);
  assert.equal(ambiguous.fallbackUsed, false);
});

test("selected-project optic efficiency enrichment fails closed on conflicts and percent-like values", () => {
  const selectorPayload = {
    optic: { key: "Inlay" },
    lighting: { optic_key: "Inlay" },
    electrical: {},
  };
  const conflict = resolveSelectedProjectSourceBackedOpticEfficiency({
    selectorPayload,
    snapshot: {
      OPTICS: [
        { optic: "Inlay", optical_eff: 0.8 },
        { optic: "Inlay", optical_eff: 0.75 },
      ],
    },
  });
  assert.equal(conflict.ok, false);
  assert.equal(conflict.blocker, "selected-project-source-backed-optic-efficiency-conflict");
  assert.equal(conflict.efficiency, null);
  assert.equal(conflict.fallbackUsed, false);

  const percentLike = resolveSelectedProjectSourceBackedOpticEfficiency({
    selectorPayload,
    snapshot: { OPTICS: [{ optic: "Inlay", optical_eff: "80%" }] },
  });
  assert.equal(percentLike.ok, false);
  assert.equal(percentLike.blocker, "selected-project-source-backed-optic-efficiency-unavailable");
  assert.equal(percentLike.efficiency, null);
  assert.equal(percentLike.fallbackUsed, false);
});

test("domain slice adds no Engine route, Selector run route, POST endpoint, or generation/proof/write flag", async () => {
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const domainText = await readFile(domainSourceUrl, "utf-8");

  assert.match(serverText, /enrichSelectedProjectReadonlyEngineBridgeRequest/);
  assert.match(serverText, /bindSelectedProjectSourceBackedTier/);
  assert.match(serverText, /selected-project-source-backed-tier-derivation-unavailable/);
  assert.match(serverText, /readJsonSnapshot\(readAuthorityReferenceSnapshotPath\(\)\)/);
  assert.match(serverText, /JSON\.stringify\(preparedBridgeRequest\)/);
  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
  assert.equal(serverText.includes("selected-result"), false);
  assert.equal(domainText.includes("POST"), false);
  assert.equal(domainText.includes("rough_electrical_payload"), false);
  assert.equal(domainText.includes("rawEngineDebugPayloadExposed: true"), false);
  assert.equal(domainText.includes("rawBoardDataRowsExposed: true"), false);
  assert.equal(domainText.includes("labProofAuthority: true"), false);
  assert.equal(domainText.includes("boardDataMutationEnabled: true"), false);
});
