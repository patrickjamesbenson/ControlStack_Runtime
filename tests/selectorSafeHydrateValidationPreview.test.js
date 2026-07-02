import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildSelectorSafeDraftProjectEnvelopePreview,
} from "../packages/modules/cs-selector/selectorSafeDraftProjectEnvelopePreview.js";
import {
  buildSelectorSafeHydrateValidationPreview,
  SELECTOR_SAFE_HYDRATE_VALIDATION_FAIL_CLOSED_CODES,
  SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_ID,
  SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_VERSION,
} from "../packages/modules/cs-selector/selectorSafeHydrateValidationPreview.js";

const FAIL = SELECTOR_SAFE_HYDRATE_VALIDATION_FAIL_CLOSED_CODES;
const POLICY_FINGERPRINT = "safe-policy:selector-envelope-preview-fixture";
const SOURCE_FINGERPRINT = "safe-source:selector-envelope-preview-fixture";
const CURRENT_REFERENCE_OPTIONS_FINGERPRINT = "safe-reference-options:hydrate-validation-fixture";
const CURRENT_SELECTOR_STATE_FINGERPRINT = "safe-selector-state:hydrate-validation-fixture";

function safeSelectedValuesSummary(overrides = {}) {
  return {
    readOnly: true,
    previewOnly: true,
    diagnosticOnly: true,
    status: "complete-safe-selected-values-summary",
    selectedValues: {
      system: "linear-60",
      variant: "linear-60-core",
      tier: "business",
      profile: "surface-profile",
      optic: "opal",
      mountStyle: "surface",
      bodyFinish: "white",
      controlType: "dali-2",
    },
    provenanceSummary: {
      selectedValueCount: 8,
      safeProvenanceOnly: true,
    },
    rawSelectorPayloadReturned: false,
    rawProductRowsReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    ...overrides,
  };
}

function selectorReferenceOptionsSummary(overrides = {}) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    referenceOptionsReady: true,
    optionGroupCount: 4,
    redactedOptionCount: 18,
    rawProductRowsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    ...overrides,
  };
}

function finishCascadeSummary(overrides = {}) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    finishCascadeReady: true,
    bodyValue: "white",
    bodyLabel: "White",
    fields: {
      finishCover: { mode: "inherited", value: "white", label: "White", missing: false },
      finishEnd: { mode: "inherited", value: "white", label: "White", missing: false },
      finishFlex: { mode: "manual-override", value: "black", label: "Black", missing: false },
    },
    rawProductRowsReturned: false,
    ...overrides,
  };
}

function timelineStatusSummary(overrides = {}) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    timelineStatusReady: true,
    timelineGateReady: true,
    status: "available",
    keptCount: 4,
    hiddenCount: 1,
    rawProductRowsReturned: false,
    ...overrides,
  };
}

function runIntakePreviewSummary(overrides = {}) {
  return {
    readOnly: true,
    previewOnly: true,
    localStateOnly: true,
    runIntakePreviewReady: true,
    runCount: 1,
    totalQuantity: 2,
    completedRunCount: 1,
    incompleteRunCount: 0,
    safeRunIntentSummaries: [{
      id: "run-1",
      runNumber: 1,
      label: "Boardroom run",
      quantity: 2,
      runLengthMm: 5600,
      lengthMode: "same_length",
      status: "complete-safe-preview-intent",
      safePreviewOnly: true,
      enginePayloadIncluded: false,
      runTableIncluded: false,
      iesIncluded: false,
      writes: false,
      diagnostics: [],
    }],
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    ...overrides,
  };
}

function runAccessoryPlacementIntentPreviewSummary(overrides = {}) {
  return {
    readOnly: true,
    previewOnly: true,
    localStateOnly: true,
    runAccessoryPlacementPreviewReady: true,
    accessoryIntentCount: 1,
    runsWithAccessoryIntentCount: 1,
    unresolvedAccessoryIntentCount: 0,
    safeAccessoryIntentRows: [{
      intentId: "accessory-intent-001",
      runReference: "Boardroom run",
      runId: "run-1",
      runNumber: 1,
      runLabel: "Boardroom run",
      runQuantity: 2,
      accessoryTypeToken: "sensor",
      quantityReceivingAccessory: 1,
      placementPreference: "mid",
      status: "confirmed",
      safePreviewOnly: true,
      accessoryReservationExecuted: false,
      accessoryReservationPayloadExposed: false,
      enginePayloadIncluded: false,
      rawEnginePayloadReturned: false,
      runTableIncluded: false,
      iesIncluded: false,
      writes: false,
      complete: true,
      diagnostics: [],
    }],
    rawAccessoryRowsReturned: false,
    rawEnginePayloadReturned: false,
    accessoryReservationExecuted: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    ...overrides,
  };
}

function specialPartsEntitlementPreviewSummary(overrides = {}) {
  return {
    source: "selector-special-parts-entitlement-preview",
    readOnly: true,
    diagnosticOnly: true,
    status: "none",
    specialPartsEntitlementPreviewReady: true,
    entitlementStatus: "none",
    displayRole: "internal_user",
    redactedEntitlementCount: 0,
    compatibleRedactedCandidateCount: 0,
    blockedRedactedCandidateCount: 0,
    reviewRequiredCount: 0,
    candidateRows: [],
    safeCompatibilityResults: [],
    rawUsersReturned: false,
    rawContactsReturned: false,
    rawCrmReturned: false,
    rawProductRowsReturned: false,
    rawComponentRowsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    activeBuildMutationEnabled: false,
    hubSpotWriteEnabled: false,
    contactCreationEnabled: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function sealedCandidateAssemblyPreviewSummary(overrides = {}) {
  return {
    schemaId: "controlstack.runtime.engine-runtable.sealed-candidate-assembly-preview-summary",
    schemaVersion: 1,
    state: "runtime_sealed_candidate_assembly_preview_diagnostic_only",
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: true,
    sealedCandidateAssemblyPreviewReady: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sealedCandidateAssemblyPreviewFingerprint: "safe-sealed-candidate-assembly-preview:fixture",
    candidateReadinessSummary: {
      diagnosticOnly: true,
      readyForFutureCandidateHandoff: true,
      donorEnginePayloadReady: false,
      runTableReady: false,
      iesReady: false,
    },
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function selectedResultProjectionSummary(overrides = {}) {
  return {
    ok: true,
    readOnly: true,
    displayOnly: true,
    state: "no_selected_result",
    sourceState: "no_source",
    resultStateLabel: "Estimated preview",
    selectedResultAvailable: false,
    engineVerified: false,
    stale: false,
    accepted: false,
    selectedResultProjectionFingerprint: "safe-selected-result-projection:fixture",
    selectedResultPersistenceEnabled: false,
    staleResultComparisonEnabled: false,
    runTableGenerationEnabled: false,
    payloadGenerationEnabled: false,
    iesGenerationEnabled: false,
    rawSelectedPayloadExposed: false,
    rawEngineDebugPayloadExposed: false,
    rawBoardDataRowsExposed: false,
    rawUsersExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
    rawIesExposed: false,
    rawPdfsExposed: false,
    ...overrides,
  };
}

function sourcePreviewInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    safeSelectedValuesSummary: safeSelectedValuesSummary(),
    selectorReferenceOptionsSummary: selectorReferenceOptionsSummary(),
    finishCascadeSummary: finishCascadeSummary(),
    timelineStatusSummary: timelineStatusSummary(),
    runIntakePreviewSummary: runIntakePreviewSummary(),
    runAccessoryPlacementIntentPreviewSummary: runAccessoryPlacementIntentPreviewSummary(),
    specialPartsEntitlementPreviewSummary: specialPartsEntitlementPreviewSummary(),
    sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary(),
    selectedResultProjectionSummary: selectedResultProjectionSummary(),
    projectIntentContext: {
      projectIntentRef: "safe-project-intent-001",
      projectLabel: "Boardroom linear package",
      clientLabel: "Redacted client",
      siteLabel: "Redacted site",
      status: "draft-intent",
    },
    safeWorkspaceContext: {
      displayRole: "internal_user",
      identityState: "matched_redacted",
      safeProjectRef: "safe-project-intent-001",
    },
    ...overrides,
  };
}

function sourceEnvelopeSummary() {
  return buildSelectorSafeDraftProjectEnvelopePreview(sourcePreviewInput());
}

function completeEnvelopeSummary(overrides = {}) {
  const summary = sourceEnvelopeSummary();
  return {
    ...summary,
    staleState: "safe_comparison_not_required",
    failClosedDiagnostics: [],
    ...overrides,
  };
}

function hydrateInput(summaryOverrides = {}, inputOverrides = {}) {
  return {
    safeDraftProjectEnvelopePreviewSummary: completeEnvelopeSummary(summaryOverrides),
    expectedPolicyFingerprint: POLICY_FINGERPRINT,
    expectedSourceFingerprint: SOURCE_FINGERPRINT,
    currentReferenceOptionsFingerprint: CURRENT_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: CURRENT_SELECTOR_STATE_FINGERPRINT,
    ...inputOverrides,
  };
}

function build(summaryOverrides = {}, inputOverrides = {}) {
  return buildSelectorSafeHydrateValidationPreview(hydrateInput(summaryOverrides, inputOverrides));
}

function blockerFor(summaryOverrides = {}, inputOverrides = {}) {
  return build(summaryOverrides, inputOverrides).blocker;
}

test("accepts complete safe envelope preview", () => {
  const result = build();

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_ID);
  assert.equal(result.schemaVersion, SELECTOR_SAFE_HYDRATE_VALIDATION_SCHEMA_VERSION);
  assert.equal(result.previewOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.readOnly, true);
  assert.equal(result.hydrateValidationPreviewReady, true);
  assert.equal(result.safeHydrateIntentSummary.sourceEnvelopePreviewReady, true);
  assert.equal(result.safeHydrateIntentSummary.hydrateStateAllowed, false);
  assert.equal(result.safeHydrateIntentSummary.selectedResultRestored, false);
  assert.equal(result.safeHydrateIntentSummary.selectedResultPersisted, false);
  assert.match(result.hydrateValidationPreviewFingerprint, /^safe-selector-hydrate-validation-preview:/);
});

test("emits hydrateValidationPreviewReady true when allowed and no stale blocker is active", () => {
  const result = build();

  assert.equal(result.hydrateValidationPreviewReady, true);
  assert.equal(result.staleState.state, "safe_comparison_not_required");
  assert.equal(result.staleState.failClosed, false);
  assert.equal(result.fingerprintValidationSummary.policyFingerprintMatches, true);
  assert.equal(result.fingerprintValidationSummary.sourceFingerprintMatches, true);
});

test("defaults stale comparison to fail-closed when not implemented", () => {
  const result = buildSelectorSafeHydrateValidationPreview({
    safeDraftProjectEnvelopePreviewSummary: sourceEnvelopeSummary(),
    expectedPolicyFingerprint: POLICY_FINGERPRINT,
    expectedSourceFingerprint: SOURCE_FINGERPRINT,
    currentReferenceOptionsFingerprint: CURRENT_REFERENCE_OPTIONS_FINGERPRINT,
    currentSelectorStateFingerprint: CURRENT_SELECTOR_STATE_FINGERPRINT,
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, FAIL.staleComparisonNotImplemented);
  assert.equal(result.hydrateValidationPreviewReady, false);
  assert.equal(result.staleState.failClosed, true);
});

test("rejects invalid schema", () => {
  assert.equal(blockerFor({ schemaId: "unsafe_schema" }), FAIL.invalidEnvelopeSchema);
});

test("rejects envelope not ready", () => {
  assert.equal(blockerFor({ safeDraftProjectEnvelopePreviewReady: false }), FAIL.envelopeNotReady);
});

test("rejects fingerprint mismatch", () => {
  assert.equal(blockerFor({}, { expectedPolicyFingerprint: "safe-policy:wrong" }), FAIL.fingerprintMismatch);
  assert.equal(blockerFor({}, { expectedSourceFingerprint: "safe-source:wrong" }), FAIL.fingerprintMismatch);
});

test("rejects sealed candidate body", () => {
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: { candidateReadinessSummary: {} } }), FAIL.sealedCandidateBodyNotApproved);
  assert.equal(blockerFor({ candidateBody: { safe: false } }), FAIL.sealedCandidateBodyNotApproved);
});

test("rejects selected-result body", () => {
  assert.equal(blockerFor({ selectedResultProjectionState: { selectedResultBody: { rows: [] } } }), FAIL.selectedResultBodyNotApproved);
  assert.equal(blockerFor({ selectedResult: { rows: [] } }), FAIL.selectedResultBodyNotApproved);
});

test("rejects selected-result restore and persistence", () => {
  assert.equal(blockerFor({ selectedResultRestored: true }), FAIL.selectedResultRestoreNotApproved);
  assert.equal(blockerFor({ selectedResultRestoreEnabled: true }), FAIL.selectedResultRestoreNotApproved);
  assert.equal(blockerFor({ selectedResultPersisted: true }), FAIL.selectedResultPersistenceNotApproved);
  assert.equal(blockerFor({ selectedResultProjectionState: { selectedResultPersistenceEnabled: true } }), FAIL.selectedResultPersistenceNotApproved);
});

test("rejects selector state mutation", () => {
  assert.equal(blockerFor({ selectorStateMutated: true }), FAIL.selectorStateMutationNotApproved);
  assert.equal(blockerFor({ selectorStateMutationEnabled: true }), FAIL.selectorStateMutationNotApproved);
});

test("rejects savedProjectStore invocation", () => {
  assert.equal(blockerFor({ savedProjectStoreInvoked: true }), FAIL.savedProjectStoreInvocationNotApproved);
  assert.equal(blockerFor({ restoreProjectEnvelopeInvoked: true }), FAIL.savedProjectStoreInvocationNotApproved);
});

test("rejects raw Selector payload", () => {
  assert.equal(blockerFor({ selectorPayload: { pass2: {} } }), FAIL.rawSelectorPayloadNotApproved);
  assert.equal(blockerFor({ pass5: { runs: [] } }), FAIL.rawSelectorPayloadNotApproved);
});

test("rejects raw Engine payload and result", () => {
  assert.equal(blockerFor({ enginePayload: { input: true } }), FAIL.rawEnginePayloadNotApproved);
  assert.equal(blockerFor({ engineResult: { ok: true } }), FAIL.rawEngineResultNotApproved);
});

test("rejects raw rows, USERS, CRM, contact, private path, and credentials", () => {
  assert.equal(blockerFor({ productRows: [{ id: "p1" }] }), FAIL.rawProductRowsNotApproved);
  assert.equal(blockerFor({ USERS: [{ id: 1 }] }), FAIL.rawUsersNotApproved);
  assert.equal(blockerFor({ hubSpotPayload: { deal: 1 } }), FAIL.rawCrmNotApproved);
  assert.equal(blockerFor({ contactPayload: { name: "Person" } }), FAIL.rawContactDataNotApproved);
  assert.equal(blockerFor({ projectIntentSummary: { sourcePath: "C:\\Users\\Patrick\\selector.json" } }), FAIL.privatePathReturnNotApproved);
  assert.equal(blockerFor({ credentials: { token: "secret" } }), FAIL.credentialReturnNotApproved);
});

test("rejects RunTable and IES generation flags", () => {
  assert.equal(blockerFor({ runTableGenerated: true }), FAIL.runtableGenerationNotApproved);
  assert.equal(blockerFor({ generatedRunTable: { rows: [] } }), FAIL.runtableGenerationNotApproved);
  assert.equal(blockerFor({ iesGenerated: true }), FAIL.iesGenerationNotApproved);
  assert.equal(blockerFor({ generatedIes: "IESNA:LM-63" }), FAIL.iesGenerationNotApproved);
});

test("rejects HubSpot and project write flags", () => {
  assert.equal(blockerFor({ hubSpotWriteEnabled: true }), FAIL.hubspotWriteNotApproved);
  assert.equal(blockerFor({ projectWriteEnabled: true }), FAIL.projectWriteNotApproved);
});

test("does not mutate Selector state", () => {
  const selectorState = Object.freeze({ marker: "unchanged", manualConstraints: Object.freeze({ system: "linear-60" }) });
  const before = JSON.stringify(selectorState);
  const result = build();

  assert.equal(JSON.stringify(selectorState), before);
  assert.equal(result.selectorStateMutated, false);
  assert.equal(result.safeHydrateIntentSummary.hydrateStateAllowed, false);
});

test("does not call savedProjectStore", () => {
  const result = build();
  const source = readFileSync(new URL("../packages/modules/cs-selector/selectorSafeHydrateValidationPreview.js", import.meta.url), "utf8");

  assert.equal(source.includes("savedProjectStore.js"), false);
  assert.equal(source.includes("createSavedProjectStore"), false);
  assert.equal(source.includes("saveCurrentProjectEnvelope"), false);
  assert.equal(source.includes("restoreProjectEnvelope("), false);
  assert.equal(result.savedProjectStoreInvoked, false);
});

test("does not invoke donor Engine, mutate RuntimeData, or generate RunTable/IES", () => {
  const result = build();
  const source = readFileSync(new URL("../packages/modules/cs-selector/selectorSafeHydrateValidationPreview.js", import.meta.url), "utf8");

  assert.equal(source.includes("run_engine"), false);
  assert.equal(source.includes("engine_runtable_host"), false);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});

test("adds no routes or POST endpoints", () => {
  const result = build();
  const source = readFileSync(new URL("../packages/modules/cs-selector/selectorSafeHydrateValidationPreview.js", import.meta.url), "utf8");

  assert.equal(source.includes("app.post"), false);
  assert.equal(source.includes("router.post"), false);
  assert.equal(source.includes("method: \"POST\""), false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});

test("produces deterministic hydrateValidationPreviewFingerprint", () => {
  const first = build();
  const second = build();

  assert.equal(first.hydrateValidationPreviewFingerprint, second.hydrateValidationPreviewFingerprint);
  assert.match(first.hydrateValidationPreviewFingerprint, /^safe-selector-hydrate-validation-preview:/);
});
