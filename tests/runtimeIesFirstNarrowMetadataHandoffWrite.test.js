import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildIesFirstNarrowMetadataHandoffSummary,
  buildRuntimeIesFirstNarrowMetadataHandoffSummary,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowMetadataHandoffSummary.js";

const POLICY_FINGERPRINT = "safe-policy:ies-first-narrow-metadata-handoff-fixture";
const SOURCE_FINGERPRINT = "safe-source:ies-first-narrow-metadata-handoff-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:ies-first-narrow-metadata-handoff-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:ies-first-narrow-metadata-handoff-fixture";
const SOURCE_PHOTOMETRY_REF = `safe-source-photometry-ref:${"a".repeat(40)}`;

const BLOCKED_FLAG_KEYS = Object.freeze([
  "slugGenerationEnabled",
  "slugGenerated",
  "productionSlugGenerated",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "photometryGenerationEnabled",
  "outputGenerationEnabled",
  "outputGenerationAttempted",
  "outputGenerated",
  "artifactGenerationEnabled",
  "artefactGenerationEnabled",
  "routesAdded",
  "routeAdded",
  "publicRoutesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
  "postEndpointsEnabled",
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "persistenceEnabled",
  "persisted",
  "mutationEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
  "boardDataMutated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "productionRunTableGenerated",
]);

function context(projectId = "ies-first-narrow-metadata-handoff-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "IES first narrow metadata handoff project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "IES first narrow metadata handoff project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      selection: {},
    },
    identity: {
      identityState: "internal_identified",
      classification: "internal",
      actualRole: "internal_user",
      currentUser: {
        name: "Runtime User",
        email: "runtime@controlstack.local",
      },
    },
    downstream: {
      selector: {},
    },
    contractVersion: "ies-first-narrow-metadata-handoff-test",
  };
}

function readySourcePhotometryRefHandoffSummary(overrides = {}) {
  return {
    contractId: "RUNTIME-IES-SOURCE-PHOTOMETRY-REF-HANDOFF-1",
    schemaId: "controlstack.runtime.ies-source-photometry-ref-handoff-summary",
    schemaVersion: 1,
    state: "runtime_ies_source_photometry_ref_handoff_diagnostic_only",
    ok: true,
    blocker: null,
    handoffReady: true,
    sourcePhotometryStatus: "real_source_ref_ready",
    sourcePhotometryRef: SOURCE_PHOTOMETRY_REF,
    readOnly: true,
    deterministicOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    opaqueReferenceOnly: true,
    sourceAnchorOnly: true,
    sourceBacked: true,
    sourceFingerprint: SOURCE_FINGERPRINT,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    photometryReferenceFingerprint: "safe-photometry-reference:ies-first-narrow-metadata-handoff-fixture",
    oneMmPolicyLabel: "one-mm-length-policy-summary-only",
    iesPhotometryReferenceToken: "safe-ies-photometry-reference:ies-first-narrow-metadata-handoff-fixture",
    lumenCurveReferenceToken: "safe-lumen-curve-reference:ies-first-narrow-metadata-handoff-fixture",
    driverUtilCurveReferenceToken: "safe-driver-util-curve-reference:ies-first-narrow-metadata-handoff-fixture",
    selectedResultHandoffState: "metadata_ready_for_future_candidate_output",
    selectedResultHandoffReady: true,
    readyForFutureCandidateOutput: true,
    slugGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutationEnabled: false,
    ...overrides,
  };
}

function writeContribution(options = {}) {
  const { downstream = {}, directWrite = {} } = options;
  const source = Object.prototype.hasOwnProperty.call(options, "source")
    ? options.source
    : readySourcePhotometryRefHandoffSummary();
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        ...(source === undefined ? {} : { sourcePhotometryRefHandoffSummary: source }),
        iesFirstNarrowMetadataHandoffSummaryWrite: {
          writeRequested: true,
          ...directWrite,
        },
        ...downstream,
      },
    },
  };
}

function assertSummaryShape(summary) {
  assert.deepEqual(Object.keys(summary), RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER);
  assert.equal(summary.schemaId, RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.contractId, RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.targetKind, "project-envelope-module-downstream-context-summary-slot");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.consumerModuleId, "ies_builder");
  assert.equal(summary.state, "redacted_ies_first_narrow_metadata_handoff_summary_persisted");
  assert.equal(summary.sourceKind, "ies-source-photometry-ref-handoff-summary");
  assert.equal(summary.futureOutputKind, "ies-first-narrow-metadata-handoff");
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.deterministicOnly, true);
  assert.equal(summary.candidateOutputOnly, true);
  assert.equal(summary.productionProof, false);
  assert.equal(summary.labProofAuthority, false);
  assert.equal(summary.sourceBacked, true);
  assert.equal(summary.sourceAnchorOnly, true);
  assert.equal(summary.opaqueReferenceOnly, true);
  assert.equal(summary.sourcePhotometryStatus, "real_source_ref_ready");
  assert.equal(summary.sourcePhotometryRef, SOURCE_PHOTOMETRY_REF);
  assert.equal(summary.selectedResultHandoffState, "metadata_ready_for_future_candidate_output");
  assert.equal(summary.selectedResultHandoffReady, true);
  assert.equal(summary.readyForFutureCandidateOutput, true);
  assert.equal(summary.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(summary.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(summary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(summary.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.equal(summary.photometryReferenceFingerprint, "safe-photometry-reference:ies-first-narrow-metadata-handoff-fixture");
  assert.equal(summary.oneMmPolicyLabel, "one-mm-length-policy-summary-only");
  assert.equal(summary.iesPhotometryReferenceToken, "safe-ies-photometry-reference:ies-first-narrow-metadata-handoff-fixture");
  assert.equal(summary.lumenCurveReferenceToken, "safe-lumen-curve-reference:ies-first-narrow-metadata-handoff-fixture");
  assert.equal(summary.driverUtilCurveReferenceToken, "safe-driver-util-curve-reference:ies-first-narrow-metadata-handoff-fixture");
  assert.equal(summary.iesSourcePhotometryRefHandoffContractId, "RUNTIME-IES-SOURCE-PHOTOMETRY-REF-HANDOFF-1");
  assert.equal(summary.iesSourcePhotometryRefHandoffSchemaId, "controlstack.runtime.ies-source-photometry-ref-handoff-summary");
  assert.equal(summary.iesSourcePhotometryRefHandoffSchemaVersion, 1);
  assert.equal(summary.iesSourcePhotometryRefHandoffState, "runtime_ies_source_photometry_ref_handoff_diagnostic_only");
  assert.equal(summary.iesSourcePhotometryRefHandoffReady, true);
  assert.match(summary.iesFirstNarrowMetadataHandoffSummaryFingerprint, /^safe-ies-first-narrow-metadata-handoff-summary:[0-9a-f]{40}$/);

  for (const key of BLOCKED_FLAG_KEYS) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, key), false, `${key} must not be persisted`);
  }
}

test("builder creates the exact allow-listed IES first narrow metadata handoff summary", () => {
  const first = buildRuntimeIesFirstNarrowMetadataHandoffSummary({
    sourcePhotometryRefHandoffSummary: readySourcePhotometryRefHandoffSummary(),
  });
  const second = buildIesFirstNarrowMetadataHandoffSummary({
    iesSourcePhotometryRefHandoffSummary: readySourcePhotometryRefHandoffSummary(),
  });

  assertSummaryShape(first);
  assert.deepEqual(first, second);
});

test("writes the IES first narrow metadata handoff summary only to the shell-owned envelope slot", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context("ies-metadata-slot-project"), writeContribution());

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.iesFirstNarrowMetadataHandoffSummaryWritten, true);
  assert.equal(result.iesFirstNarrowMetadataHandoffSummaryTarget, RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_TARGET);
  assert.equal(result.selectedResultPersistedSummaryWritten, false);
  assert.equal(result.runTableFirstNarrowOutputSummaryWritten, false);

  const envelope = result.envelope;
  const downstream = envelope.modules.cs_selector.downstreamContext;
  assert.deepEqual(Object.keys(downstream), ["iesFirstNarrowMetadataHandoffSummary"]);
  assert.equal(envelope.iesFirstNarrowMetadataHandoffSummary, undefined);
  assert.equal(envelope.project.iesFirstNarrowMetadataHandoffSummary, undefined);
  assert.equal(envelope.project.metadata.iesFirstNarrowMetadataHandoffSummary, undefined);
  assert.equal(envelope.project.currentProject.iesFirstNarrowMetadataHandoffSummary, undefined);
  assert.equal(envelope.project.selection.iesFirstNarrowMetadataHandoffSummary, undefined);
  assert.equal(envelope.shell.downstream.selector.iesFirstNarrowMetadataHandoffSummary, undefined);
  assert.equal(envelope.modules.cs_selector.state.iesFirstNarrowMetadataHandoffSummary, undefined);
  assertSummaryShape(downstream.iesFirstNarrowMetadataHandoffSummary);
});

test("fails closed on missing or not-ready source photometry ref handoff", () => {
  const missingStore = createSavedProjectStore();
  const missing = missingStore.saveCurrentProjectEnvelope(
    context("ies-metadata-missing-source-project"),
    writeContribution({ source: undefined }),
  );
  assert.equal(missing.accepted, false);
  assert.match(missing.reason, /missing-source-photometry-ref-handoff-summary|source-photometry-ref-handoff-not-ready/);
  assert.equal(missingStore.getProjectEnvelope("ies-metadata-missing-source-project"), null);

  const notReadyStore = createSavedProjectStore();
  const notReady = notReadyStore.saveCurrentProjectEnvelope(
    context("ies-metadata-not-ready-source-project"),
    writeContribution({
      source: readySourcePhotometryRefHandoffSummary({ ok: false, handoffReady: false, sourcePhotometryStatus: "real_source_ref_blocked" }),
    }),
  );
  assert.equal(notReady.accepted, false);
  assert.match(notReady.reason, /source-photometry-ref-handoff-not-ready/);
  assert.equal(notReadyStore.getProjectEnvelope("ies-metadata-not-ready-source-project"), null);
});

test("fails closed on raw IES, candela, photometry, base64, filename, and local path input", () => {
  const cases = [
    ["rawIesText", { rawIesText: "IESNA:LM-63-2002\nTILT=NONE" }],
    ["rawPhotometry", { rawPhotometry: { payload: true } }],
    ["candelaGrid", { candelaGrid: [[1, 2, 3]] }],
    ["base64", { base64: "data:application/pdf;base64,AAAA" }],
    ["filename", { filename: "candidate.ies" }],
    ["localPath", { localPath: "C:\\ControlStack_RuntimeData\\private\\candidate.ies" }],
  ];

  for (const [label, payload] of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-metadata-unsafe-${label}`),
      writeContribution({
        downstream: {
          iesFirstNarrowMetadataHandoffSummaryCandidate: payload,
        },
      }),
    );
    assert.equal(result.accepted, false, label);
    assert.match(result.reason, /blocked-raw-field|unsafe-string|not-approved|unsafe-true-flag/, label);
  }
});

test("fails closed on slug, IES generation, output generation, route, POST, persistence, and mutation flags", () => {
  const cases = [
    "slugGenerationEnabled",
    "iesGenerationEnabled",
    "outputGenerationEnabled",
    "routesAdded",
    "postEndpointsAdded",
    "selectedResultPersistenceEnabled",
    "runtimeDataMutationEnabled",
  ];

  for (const flag of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-metadata-unsafe-flag-${flag}`),
      writeContribution({
        directWrite: {
          [flag]: true,
        },
      }),
    );
    assert.equal(result.accepted, false, flag);
    assert.match(result.reason, new RegExp(`unsafe-true-flag-${flag}`));
  }
});

test("rolls back an existing project update on IES metadata handoff summary write failure", () => {
  const store = createSavedProjectStore();
  const first = store.saveCurrentProjectEnvelope(context("ies-metadata-rollback-project"), writeContribution());
  assert.equal(first.accepted, true, first.reason);
  const before = first.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowMetadataHandoffSummary;

  const failed = store.saveCurrentProjectEnvelope(
    context("ies-metadata-rollback-project"),
    writeContribution({
      downstream: {
        iesFirstNarrowMetadataHandoffSummaryCandidate: {
          rawPhotometryPayload: { unsafe: true },
        },
      },
    }),
  );

  assert.equal(failed.accepted, false);
  const afterEnvelope = store.getProjectEnvelope("ies-metadata-rollback-project");
  assert.deepEqual(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowMetadataHandoffSummary, before);
  assert.equal(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowMetadataHandoffSummary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
});

test("keeps real IES generation, slug generation, output files, routes, POST endpoints, RunTable generation, selected-result persistence, and mutation blocked", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context("ies-metadata-blocked-flags-project"), writeContribution());
  const summary = result.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowMetadataHandoffSummary;

  assert.equal(result.accepted, true, result.reason);
  assert.equal(summary.productionProof, false);
  assert.equal(summary.labProofAuthority, false);
  assertSummaryShape(summary);

  const text = JSON.stringify(summary);
  for (const marker of [
    "IESNA:",
    "TILT=",
    "candelaGrid",
    "rawPhotometry",
    "base64",
    "candidate.ies",
    "C:\\ControlStack",
  ]) {
    assert.equal(text.includes(marker), false, marker);
  }
});
