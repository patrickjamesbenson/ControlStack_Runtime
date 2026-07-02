import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildSelectorSafeDraftProjectEnvelopePreview,
  SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_FAIL_CLOSED_CODES,
  SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_ID,
  SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_VERSION,
} from "../packages/modules/cs-selector/selectorSafeDraftProjectEnvelopePreview.js";

const FAIL = SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_FAIL_CLOSED_CODES;
const POLICY_FINGERPRINT = "safe-policy:selector-envelope-preview-fixture";
const SOURCE_FINGERPRINT = "safe-source:selector-envelope-preview-fixture";

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

function previewInput(overrides = {}) {
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

function build(overrides = {}) {
  return buildSelectorSafeDraftProjectEnvelopePreview(previewInput(overrides));
}

function blockerFor(overrides = {}) {
  return build(overrides).blocker;
}

test("accepts complete safe Selector preview summaries", () => {
  const result = build();

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_ID);
  assert.equal(result.schemaVersion, SELECTOR_SAFE_DRAFT_PROJECT_ENVELOPE_SCHEMA_VERSION);
  assert.equal(result.previewOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.readOnly, true);
  assert.equal(result.safeDraftProjectEnvelopePreviewReady, true);
  assert.match(result.envelopeFingerprint, /^safe-selector-draft-project-envelope:/);
  assert.equal(result.safeSelectedValuesSummary.selectedValues.system, "linear-60");
  assert.equal(result.runIntakePreviewSummary.runCount, 1);
  assert.equal(result.runAccessoryPlacementIntentPreviewSummary.accessoryIntentCount, 1);
  assert.equal(result.specialPartsEntitlementPreviewSummary.entitlementStatus, "none");
  assert.equal(result.projectIntentSummary.projectRef, "safe-project-intent-001");
});

test("includes sealed candidate assembly fingerprint only, not payload body", () => {
  const result = build();

  assert.equal(result.sealedCandidateAssemblyPreviewFingerprint, "safe-sealed-candidate-assembly-preview:fixture");
  assert.equal(Object.hasOwn(result, "sealedCandidateAssemblyPreviewSummary"), false);
  assert.equal(JSON.stringify(result).includes("candidateReadinessSummary"), false);
  assert.equal(result.unsafeExclusionsVerified.rawEnginePayloadReturned, false);
});

test("selected-result projection is state/fingerprint only, not result body", () => {
  const result = build();

  assert.equal(result.selectedResultProjectionState.state, "no_selected_result");
  assert.equal(result.selectedResultProjectionState.selectedResultProjectionFingerprint, "safe-selected-result-projection:fixture");
  assert.equal(Object.hasOwn(result.selectedResultProjectionState, "selectedResultBody"), false);
  assert.equal(Object.hasOwn(result.selectedResultProjectionState, "selectedResult"), false);
  assert.equal(result.selectedResultProjectionState.selectedResultPersistenceEnabled, false);
});

test("staleState is not_compared_fail_closed", () => {
  const result = build();

  assert.equal(result.staleComparisonEnabled, false);
  assert.equal(result.staleState, "not_compared_fail_closed");
  assert.equal(result.staleComparisonReason, "safe comparison is not implemented in this slice");
  assert.ok(result.failClosedDiagnostics.includes(FAIL.staleComparisonNotImplemented));
});

test("rejects missing required safe summaries", () => {
  assert.equal(blockerFor({ safeSelectedValuesSummary: null }), FAIL.missingSafeSelectedValuesSummary);
  assert.equal(blockerFor({ runIntakePreviewSummary: null }), FAIL.missingRunIntakePreviewSummary);
  assert.equal(blockerFor({ runAccessoryPlacementIntentPreviewSummary: null }), FAIL.missingRunAccessoryPlacementPreviewSummary);
  assert.equal(blockerFor({ specialPartsEntitlementPreviewSummary: null }), FAIL.missingSpecialPartsEntitlementPreviewSummary);
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: null }), FAIL.missingSealedCandidateAssemblyPreviewSummary);
});

test("rejects unsafe-not-ready required safe summaries", () => {
  assert.equal(blockerFor({ runIntakePreviewSummary: runIntakePreviewSummary({ runIntakePreviewReady: false }) }), FAIL.unsafeRunIntakePreviewSummary);
  assert.equal(blockerFor({ runAccessoryPlacementIntentPreviewSummary: runAccessoryPlacementIntentPreviewSummary({ runAccessoryPlacementPreviewReady: false }) }), FAIL.unsafeRunAccessoryPlacementPreviewSummary);
  assert.equal(blockerFor({ specialPartsEntitlementPreviewSummary: specialPartsEntitlementPreviewSummary({ specialPartsEntitlementPreviewReady: false }) }), FAIL.unsafeSpecialPartsEntitlementPreviewSummary);
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ sealedCandidateAssemblyPreviewReady: false }) }), FAIL.unsafeSealedCandidateAssemblyPreviewSummary);
});

test("rejects raw Selector payload", () => {
  assert.equal(blockerFor({ rawSelectorPayloadReturned: true }), FAIL.rawSelectorPayloadNotApproved);
  assert.equal(blockerFor({ safeSelectedValuesSummary: safeSelectedValuesSummary({ selectorPayload: { pass2: {} } }) }), FAIL.rawSelectorPayloadNotApproved);
});

test("rejects raw Engine payload/result/debug", () => {
  assert.equal(blockerFor({ rawEnginePayloadReturned: true }), FAIL.rawEnginePayloadNotApproved);
  assert.equal(blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ rawEngineDebug: { trace: "debug" } }) }), FAIL.rawEnginePayloadNotApproved);
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ engineResult: { ok: true } }) }), FAIL.rawEnginePayloadNotApproved);
});

test("rejects raw product/component/board/driver/accessory rows", () => {
  const cases = [
    { rawProductRowsReturned: true },
    { safeSelectedValuesSummary: safeSelectedValuesSummary({ productRows: [{ id: "p1" }] }) },
    { runIntakePreviewSummary: runIntakePreviewSummary({ boardRows: [{ id: "b1" }] }) },
    { runAccessoryPlacementIntentPreviewSummary: runAccessoryPlacementIntentPreviewSummary({ accessoryRows: [{ id: "a1" }] }) },
    { specialPartsEntitlementPreviewSummary: specialPartsEntitlementPreviewSummary({ componentRows: [{ id: "c1" }] }) },
    { sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ driverRows: [{ id: "d1" }] }) },
  ];
  for (const overrides of cases) {
    assert.equal(blockerFor(overrides), FAIL.rawProductRowsNotApproved);
  }
});

test("rejects raw USERS/CRM/HubSpot/contact/company data", () => {
  assert.equal(blockerFor({ rawUsersReturned: true }), FAIL.rawUsersNotApproved);
  assert.equal(blockerFor({ safeWorkspaceContext: { email: "person@example.com" } }), FAIL.rawContactDataNotApproved);
  assert.equal(blockerFor({ specialPartsEntitlementPreviewSummary: specialPartsEntitlementPreviewSummary({ USERS: [{ id: 1 }] }) }), FAIL.rawUsersNotApproved);
  assert.equal(blockerFor({ projectIntentContext: { hubSpotPayload: { deal: 1 } } }), FAIL.rawCrmNotApproved);
  assert.equal(blockerFor({ projectIntentContext: { companyPayload: { name: "Company" } } }), FAIL.rawCrmNotApproved);
  assert.equal(blockerFor({ projectIntentContext: { contactPayload: { name: "Person" } } }), FAIL.rawContactDataNotApproved);
});

test("rejects private paths", () => {
  assert.equal(blockerFor({ privatePathsReturned: true }), FAIL.privatePathReturnNotApproved);
  assert.equal(blockerFor({ projectIntentContext: { sourcePath: "C:\\Users\\Patrick\\selector.json" } }), FAIL.privatePathReturnNotApproved);
});

test("rejects credentials/tokens/secrets", () => {
  assert.equal(blockerFor({ credentialsReturned: true }), FAIL.credentialReturnNotApproved);
  assert.equal(blockerFor({ safeWorkspaceContext: { accessToken: "secret-token" } }), FAIL.credentialReturnNotApproved);
});

test("rejects generated RunTable", () => {
  assert.equal(blockerFor({ runTableGenerated: true }), FAIL.runtableGenerationNotApproved);
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ generatedRunTable: { rows: [] } }) }), FAIL.runtableGenerationNotApproved);
});

test("rejects generated IES and photometric artefacts", () => {
  assert.equal(blockerFor({ iesGenerated: true }), FAIL.iesGenerationNotApproved);
  assert.equal(blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ generatedIes: "IESNA:LM-63" }) }), FAIL.iesGenerationNotApproved);
  assert.equal(blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ base64Artefact: "abc" }) }), FAIL.iesGenerationNotApproved);
});

test("rejects selected-result persistence flag and selected-result body", () => {
  assert.equal(blockerFor({ selectedResultPersisted: true }), FAIL.selectedResultPersistenceNotApproved);
  assert.equal(blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ selectedResultPersistenceEnabled: true }) }), FAIL.selectedResultPersistenceNotApproved);
  assert.equal(blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ selectedResultBody: { rows: [] } }) }), FAIL.selectedResultBodyNotApproved);
});

test("rejects HubSpot/project/contact write flags", () => {
  assert.equal(blockerFor({ hubSpotWriteEnabled: true }), FAIL.hubspotWriteNotApproved);
  assert.equal(blockerFor({ projectWriteEnabled: true }), FAIL.projectWriteNotApproved);
  assert.equal(blockerFor({ contactCreationEnabled: true }), FAIL.contactCreationNotApproved);
});

test("rejects route/POST endpoint flags", () => {
  assert.equal(blockerFor({ routeCreationEnabled: true }), FAIL.routeOrPostEndpointNotApproved);
  assert.equal(blockerFor({ postEndpointCreationEnabled: true }), FAIL.routeOrPostEndpointNotApproved);
});

test("rejects stale comparison enablement as not implemented", () => {
  assert.equal(blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ staleResultComparisonEnabled: true }) }), FAIL.staleComparisonNotImplemented);
});

test("does not call savedProjectStore write paths, donor Engine, RuntimeData mutation, RunTable, or IES generation", () => {
  const result = build();
  const source = readFileSync(new URL("../packages/modules/cs-selector/selectorSafeDraftProjectEnvelopePreview.js", import.meta.url), "utf8");

  assert.equal(source.includes("savedProjectStore"), false);
  assert.equal(source.includes("run_engine"), false);
  assert.equal(result.writeDisabledSummary.runtimeDataMutationEnabled, false);
  assert.equal(result.writeDisabledSummary.donorEngineInvocationEnabled, false);
  assert.equal(result.writeDisabledSummary.selectedResultPersistenceEnabled, false);
  assert.equal(result.writeDisabledSummary.runTableGenerationEnabled, false);
  assert.equal(result.writeDisabledSummary.iesGenerationEnabled, false);
  assert.equal(result.unsafeExclusionsVerified.donorEngineInvoked, false);
  assert.equal(result.unsafeExclusionsVerified.runtimeDataMutated, false);
  assert.equal(result.unsafeExclusionsVerified.selectedResultPersisted, false);
  assert.equal(result.unsafeExclusionsVerified.runTableGenerated, false);
  assert.equal(result.unsafeExclusionsVerified.iesGenerated, false);
  assert.equal(result.unsafeExclusionsVerified.hubSpotWriteEnabled, false);
  assert.equal(result.unsafeExclusionsVerified.projectWriteEnabled, false);
  assert.equal(result.unsafeExclusionsVerified.contactCreationEnabled, false);
});

test("produces deterministic envelopeFingerprint", () => {
  const first = build();
  const second = build();

  assert.equal(first.envelopeFingerprint, second.envelopeFingerprint);
  assert.match(first.envelopeFingerprint, /^safe-selector-draft-project-envelope:/);
});
