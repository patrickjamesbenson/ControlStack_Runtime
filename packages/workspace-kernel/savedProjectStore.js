import { createHandoffSharePackage, summariseHandoffSharePackage } from "./handoffSharePackage.js";
import { createHydrationPayloadsFromEnvelope, createHydrationResultsFromEnvelope, createSavedProjectEnvelope, summariseProjectEnvelope, validateSavedProjectEnvelope } from "./projectEnvelope.js";
import {
  buildSelectedResultPersistedSummarySlotContract,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET,
} from "./selectedResultPersistedSummarySlotContract.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

const SELECTED_RESULT_SUMMARY_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

const SELECTED_RESULT_SUMMARY_WRITE_SOURCE_KEYS = Object.freeze([
  "selectedResultSummary",
  "selectedResultSummaryCandidate",
  "selectedResultPersistedSummaryCandidate",
  "selectedResultPersistedSummaryWrite",
  "selectedResultSummaryWrite",
  "selectedResultSummaryWriteRequest",
  "selectedResultPersistenceAuthorityPreflightSummary",
  "persistenceAuthorityPreflightSummary",
  "selectedResultPersistenceBoundaryContractSummary",
  "persistenceBoundaryContractSummary",
  "selectedResultPersistedSummarySlotContractSummary",
  "persistedSummarySlotContractSummary",
  "acceptedSelectedResultAuthorityGateSummary",
  "selectedResultAuthorityGuardSummary",
  "selectedResultProjectionSummary",
  "safeSelectedResultSourceObjectSummary",
  "selectedResultHandoffScaffoldSummary",
  "selectedResultOutputReadinessPreflightSummary",
]);

const SELECTED_RESULT_SUMMARY_RAW_BODY_KEYS = Object.freeze([
  "body",
  "resultBody",
  "selectedResultBody",
  "selected_result_body",
  "selectedResultObject",
  "selected_result_object",
  "selectedResultPayload",
  "rawSelectedPayload",
  "selectedPayload",
  "enginePayload",
  "rawEnginePayload",
  "raw_engine_payload",
  "engineResult",
  "rawEngineResult",
  "raw_engine_result",
  "selectorPayload",
  "rawSelectorPayload",
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawProductRows",
  "rawBoardRows",
  "rawDriverRows",
  "rawAccessoryRows",
  "sourceRows",
  "rawSourceRows",
  "ies",
  "iesText",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "candela",
  "candelaGrid",
  "rawCandelaGrid",
  "base64",
  "base64Artifacts",
  "artifactBase64",
  "credentials",
  "secrets",
  "filename",
  "fileName",
  "privatePath",
  "localPath",
]);

const SELECTED_RESULT_SUMMARY_UNSAFE_TRUE_KEYS = Object.freeze([
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "selectedResultPersistenceImplementationAllowed",
  "selectedResultPersistenceWriteHookAdded",
  "selectedResultStorageEnabled",
  "saveLoadActive",
  "projectWriteEnabled",
  "projectWritesEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "runtimeDataMutationAuthority",
  "boardDataMutationEnabled",
  "boardDataMutated",
  "donorMutationEnabled",
  "donorEngineInvoked",
  "donorEngineInvocationEnabled",
  "donorEnginePayloadAssemblyEnabled",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "runTableGenerated",
  "productionRunTableGenerated",
  "productionRunTableGenerationEnabled",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "outputGenerationEnabled",
  "drawingGenerationEnabled",
  "photometryGenerationEnabled",
  "routesAdded",
  "publicRoutesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawEngineResultReturned",
  "rawEngineResultExposed",
  "rawSelectorPayloadReturned",
  "rawSelectorPayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawRowsReturned",
  "rawRowsExposed",
  "rawIesContentReturned",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "exactElectricalValuesExposed",
  "privatePathsReturned",
  "privatePathsExposed",
  "filenamesReturned",
  "filenamesExposed",
  "credentialsReturned",
  "credentialsExposed",
]);

const SELECTED_RESULT_SUMMARY_PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SELECTED_RESULT_SUMMARY_SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,640}$|^[0-9a-f]{32,128}$/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneMaybe(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function selectedSummarySafeToken(value, fallback = "", maxLength = 180) {
  const raw = String(value ?? "").trim();
  if (!raw || SELECTED_RESULT_SUMMARY_PRIVATE_VALUE_PATTERN.test(raw)) return fallback;
  const token = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return token || fallback;
}

function selectedSummarySafeFingerprint(value) {
  const token = selectedSummarySafeToken(value, "", 700);
  if (!token) return null;
  return SELECTED_RESULT_SUMMARY_SAFE_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function selectedSummaryFirstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function selectedSummaryFirstPlain(sources, keys) {
  for (const source of sources) {
    if (!isPlainObject(source)) continue;
    for (const key of keys) {
      if (isPlainObject(source[key])) return source[key];
    }
  }
  return {};
}

function selectedSummaryFirstValue(sources, keys) {
  for (const source of sources) {
    const value = selectedSummaryFirstPresent(source, keys);
    if (!isBlank(value)) return value;
  }
  return undefined;
}

function hasOwnPlainKey(source, key) {
  return isPlainObject(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function selectedResultPersistedSummaryWriteFailure(reason) {
  throw new Error(`selected-result persisted summary write rejected: ${reason}`);
}

function findUnsafeSelectedResultSummaryInput(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    return SELECTED_RESULT_SUMMARY_PRIVATE_VALUE_PATTERN.test(value) ? "private-path-or-filename-not-approved" : null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = findUnsafeSelectedResultSummaryInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (SELECTED_RESULT_SUMMARY_RAW_BODY_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) {
      return `blocked-raw-field-${selectedSummarySafeToken(key, "unsafe")}`;
    }
    if (SELECTED_RESULT_SUMMARY_UNSAFE_TRUE_KEYS.includes(key) && nested === true) {
      return `unsafe-true-flag-${selectedSummarySafeToken(key, "flag")}`;
    }
    const child = findUnsafeSelectedResultSummaryInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function removeSelectedResultSummaryWriteSourceKeys(value) {
  if (!isPlainObject(value)) return value;
  const copy = cloneMaybe(value) || {};
  for (const key of SELECTED_RESULT_SUMMARY_WRITE_SOURCE_KEYS) delete copy[key];
  return copy;
}

function sanitiseSelectedResultSummaryContext(context = {}) {
  const safeContext = removeSelectedResultSummaryWriteSourceKeys(cloneMaybe(context) || {});
  for (const key of ["metadata", "currentProject", "selection"]) {
    if (isPlainObject(safeContext.project?.[key])) {
      safeContext.project[key] = removeSelectedResultSummaryWriteSourceKeys(safeContext.project[key]);
    }
  }
  if (isPlainObject(safeContext.downstream?.selector)) {
    safeContext.downstream.selector = removeSelectedResultSummaryWriteSourceKeys(safeContext.downstream.selector);
  }
  return safeContext;
}

function sanitiseSelectedResultSummaryModuleContributions(moduleContributions = {}) {
  const safeContributions = cloneMaybe(moduleContributions) || {};
  if (isPlainObject(safeContributions.cs_selector)) {
    safeContributions.cs_selector = removeSelectedResultSummaryWriteSourceKeys(safeContributions.cs_selector);
  }
  if (isPlainObject(safeContributions.cs_selector?.state)) {
    safeContributions.cs_selector.state = removeSelectedResultSummaryWriteSourceKeys(safeContributions.cs_selector.state);
  }
  if (isPlainObject(safeContributions.cs_selector?.downstreamContext)) {
    safeContributions.cs_selector.downstreamContext = removeSelectedResultSummaryWriteSourceKeys(safeContributions.cs_selector.downstreamContext);
  }
  return safeContributions;
}

function resolveSelectedResultPersistedSummaryWrite(context = {}, moduleContributions = {}) {
  const selectorContribution = isPlainObject(moduleContributions.cs_selector) ? moduleContributions.cs_selector : {};
  const contributionDownstream = isPlainObject(selectorContribution.downstreamContext) ? selectorContribution.downstreamContext : {};
  const contextSelectorDownstream = isPlainObject(context.downstream?.selector) ? context.downstream.selector : {};
  const directWrite = selectedSummaryFirstPlain(
    [selectorContribution, contributionDownstream, contextSelectorDownstream, context],
    ["selectedResultPersistedSummaryWrite", "selectedResultSummaryWrite", "selectedResultSummaryWriteRequest"],
  );
  const sources = [directWrite, selectorContribution, contributionDownstream, contextSelectorDownstream, context];
  const requested = directWrite.writeRequested === true
    || directWrite.enabled === true
    || directWrite.persist === true
    || selectorContribution.selectedResultPersistedSummaryWriteRequested === true
    || contributionDownstream.selectedResultPersistedSummaryWriteRequested === true
    || contextSelectorDownstream.selectedResultPersistedSummaryWriteRequested === true
    || hasOwnPlainKey(contributionDownstream, "selectedResultSummary")
    || hasOwnPlainKey(contextSelectorDownstream, "selectedResultSummary")
    || hasOwnPlainKey(directWrite, "selectedResultSummary")
    || hasOwnPlainKey(directWrite, "selectedResultSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "selectedResultSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "selectedResultSummaryCandidate")
    || hasOwnPlainKey(directWrite, "selectedResultPersistedSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "selectedResultPersistedSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "selectedResultPersistedSummaryCandidate");

  if (!requested) {
    return {
      requested: false,
      context,
      moduleContributions,
    };
  }

  const targetPath = selectedSummaryFirstValue(sources, [
    "targetPath",
    "targetLocation",
    "writeTarget",
    "slot",
    "envelopeSlot",
  ]) || SELECTED_RESULT_SUMMARY_TARGET;

  return {
    requested: true,
    targetPath: selectedSummarySafeToken(targetPath, ""),
    authorityPreflightSummary: selectedSummaryFirstPlain(sources, [
      "selectedResultPersistenceAuthorityPreflightSummary",
      "persistenceAuthorityPreflightSummary",
    ]),
    boundaryContractSummary: selectedSummaryFirstPlain(sources, [
      "selectedResultPersistenceBoundaryContractSummary",
      "persistenceBoundaryContractSummary",
    ]),
    slotContractSummary: selectedSummaryFirstPlain(sources, [
      "selectedResultPersistedSummarySlotContractSummary",
      "persistedSummarySlotContractSummary",
    ]),
    sourceFingerprints: {
      policyFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])),
      sourceFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])),
      sourceInputFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceInputFingerprint", "currentSourceInputFingerprint"])),
      sourceVersionFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceVersionFingerprint", "sourceVersionMarker", "boardDataSourceVersion"])),
    },
    rawInputForSafetyScan: {
      directWrite,
      selectedResultSummary: directWrite.selectedResultSummary || contributionDownstream.selectedResultSummary || contextSelectorDownstream.selectedResultSummary || null,
      selectedResultSummaryCandidate: directWrite.selectedResultSummaryCandidate || contributionDownstream.selectedResultSummaryCandidate || contextSelectorDownstream.selectedResultSummaryCandidate || null,
      selectedResultPersistedSummaryCandidate: directWrite.selectedResultPersistedSummaryCandidate || contributionDownstream.selectedResultPersistedSummaryCandidate || contextSelectorDownstream.selectedResultPersistedSummaryCandidate || null,
    },
    context: sanitiseSelectedResultSummaryContext(context),
    moduleContributions: sanitiseSelectedResultSummaryModuleContributions(moduleContributions),
  };
}

function resolveSelectedResultPersistedSummarySlotContract(writeRequest) {
  if (isPlainObject(writeRequest.slotContractSummary) && Object.keys(writeRequest.slotContractSummary).length > 0) {
    return writeRequest.slotContractSummary;
  }

  return buildSelectedResultPersistedSummarySlotContract({
    policyFingerprint: writeRequest.sourceFingerprints.policyFingerprint,
    sourceFingerprint: writeRequest.sourceFingerprints.sourceFingerprint,
    sourceInputFingerprint: writeRequest.sourceFingerprints.sourceInputFingerprint,
    sourceVersionFingerprint: writeRequest.sourceFingerprints.sourceVersionFingerprint,
    selectedResultPersistenceAuthorityPreflightSummary: writeRequest.authorityPreflightSummary,
    selectedResultPersistenceBoundaryContractSummary: writeRequest.boundaryContractSummary,
  });
}

function validateSelectedResultPersistedSummaryTarget(writeRequest, slotContract) {
  if (writeRequest.targetPath !== SELECTED_RESULT_SUMMARY_TARGET) {
    selectedResultPersistedSummaryWriteFailure(`target path drifted from shell slot: ${writeRequest.targetPath || "missing"}`);
  }
  if (SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetLocation !== SELECTED_RESULT_SUMMARY_TARGET) {
    selectedResultPersistedSummaryWriteFailure("compiled slot target does not match selectedResultSummary shell slot");
  }
  const target = isPlainObject(slotContract.slotTarget) ? slotContract.slotTarget : isPlainObject(slotContract.writeTarget) ? slotContract.writeTarget : {};
  if (target.targetLocation !== SELECTED_RESULT_SUMMARY_TARGET) {
    selectedResultPersistedSummaryWriteFailure("slot contract target does not match selectedResultSummary shell slot");
  }
  if (target.owner !== "shell" || target.slotOwner !== "shell" || target.moduleId !== "cs_selector") {
    selectedResultPersistedSummaryWriteFailure("slot contract target owner/module is not shell-owned cs_selector");
  }
  for (const key of ["runtimeDataTarget", "boardDataTarget", "donorDataTarget", "runTableTarget", "iesTarget", "outputTarget", "routeTarget", "postEndpointTarget"]) {
    if (target[key] === true || slotContract[key] === true) {
      selectedResultPersistedSummaryWriteFailure(`slot contract attempted blocked target ${key}`);
    }
  }
}

function validateSelectedResultPersistedSummaryAuthority(slotContract) {
  if (slotContract.state !== SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.contractReady
    || slotContract.selectedResultPersistedSummarySlotContractReady !== true
    || slotContract.failClosed === true) {
    selectedResultPersistedSummaryWriteFailure(slotContract.blocker || "persisted-summary-slot-contract-not-ready");
  }

  const requirements = isPlainObject(slotContract.requirements) ? slotContract.requirements : {};
  for (const key of [
    "accepted-selected-result-authority-ready",
    "selected-result-persistence-authority-preflight-ready",
    "selected-result-persistence-boundary-contract-ready",
    "selected-result-output-readiness-preflight-ready-for-persistence",
    "selected-result-authority-guard-clean",
    "stale-comparison-clean",
    "no-fingerprint-mismatch",
    "shell-project-envelope-slot-target-defined",
    "policy-fingerprint-present",
    "source-fingerprint-present",
    "source-input-fingerprint-present",
    "source-version-fingerprint-present",
    "persistence-authority-preflight-fingerprint-present",
    "persistence-boundary-contract-fingerprint-present",
    "persistence-authority-and-boundary-fingerprints-aligned",
  ]) {
    if (requirements[key] !== true) selectedResultPersistedSummaryWriteFailure(key);
  }

  if (slotContract.acceptedSelectedResultAuthorityState !== "accepted_selected_result_authority") {
    selectedResultPersistedSummaryWriteFailure("accepted-selected-result-authority-state-not-ready");
  }
  if (slotContract.selectedResultPersistenceAuthorityPreflightState !== "ready_for_persistence_authority") {
    selectedResultPersistedSummaryWriteFailure("persistence-authority-preflight-state-not-ready");
  }
  if (slotContract.selectedResultPersistenceBoundaryState !== "selected_result_persistence_boundary_contract_ready") {
    selectedResultPersistedSummaryWriteFailure("persistence-boundary-contract-state-not-ready");
  }
}

function summaryFingerprint(slotContract, key) {
  return selectedSummarySafeFingerprint(slotContract.summaryFingerprints?.[key])
    || selectedSummarySafeFingerprint(slotContract.fingerprints?.[key])
    || selectedSummarySafeFingerprint(slotContract[key]);
}

function buildRedactedSelectedResultPersistedSummary(slotContract) {
  const fingerprints = isPlainObject(slotContract.fingerprints) ? slotContract.fingerprints : {};
  const summary = {
    schemaId: slotContract.persistedSummarySchemaId,
    schemaVersion: slotContract.persistedSummarySchemaVersion,
    slotSchemaId: slotContract.slotSchemaId,
    slotSchemaVersion: slotContract.slotSchemaVersion,
    owner: "shell",
    slotOwner: "shell",
    targetKind: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetKind,
    moduleId: "cs_selector",
    state: "redacted_selected_result_summary_persisted",
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    acceptedSelectedResultAuthorityState: selectedSummarySafeToken(slotContract.acceptedSelectedResultAuthorityState, "accepted_selected_result_authority"),
    selectedResultPersistenceAuthorityPreflightState: selectedSummarySafeToken(slotContract.selectedResultPersistenceAuthorityPreflightState, "ready_for_persistence_authority"),
    selectedResultPersistenceBoundaryState: selectedSummarySafeToken(slotContract.selectedResultPersistenceBoundaryState, "selected_result_persistence_boundary_contract_ready"),
    selectedResultOutputReadinessPreflightState: selectedSummarySafeToken(slotContract.selectedResultOutputReadinessPreflightState, "selected_result_output_readiness_ready_for_persistence"),
    selectedResultAuthorityGuardState: selectedSummarySafeToken(slotContract.selectedResultAuthorityGuardState, "engine_verified_selected_result_ready"),
    selectedResultProjectionState: selectedSummarySafeToken(slotContract.selectedResultProjectionState, "selected_accepted"),
    safeSelectedResultSourceState: selectedSummarySafeToken(slotContract.safeSelectedResultSourceState, "safe_selected_result_source_ready"),
    selectedResultHandoffScaffoldState: selectedSummarySafeToken(slotContract.selectedResultHandoffScaffoldState, "runtime_selected_result_handoff_scaffold_ready"),
    policyFingerprint: selectedSummarySafeFingerprint(fingerprints.policyFingerprint),
    sourceFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceFingerprint),
    sourceInputFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceInputFingerprint),
    sourceVersionFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceVersionFingerprint),
    acceptedSelectedResultAuthorityGateFingerprint: summaryFingerprint(slotContract, "acceptedSelectedResultAuthorityGate"),
    selectedResultPersistenceAuthorityPreflightFingerprint: summaryFingerprint(slotContract, "selectedResultPersistenceAuthorityPreflight"),
    selectedResultPersistenceBoundaryContractFingerprint: summaryFingerprint(slotContract, "selectedResultPersistenceBoundaryContract"),
    selectedResultOutputReadinessPreflightFingerprint: summaryFingerprint(slotContract, "selectedResultOutputReadinessPreflight"),
    selectedResultAuthorityGuardFingerprint: summaryFingerprint(slotContract, "selectedResultAuthorityGuard"),
    selectedResultProjectionFingerprint: summaryFingerprint(slotContract, "selectedResultProjection"),
    safeSelectedResultSourceObjectFingerprint: summaryFingerprint(slotContract, "safeSelectedResultSourceObject"),
    selectedResultHandoffScaffoldFingerprint: summaryFingerprint(slotContract, "selectedResultHandoffScaffold"),
  };

  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    summary[key] = false;
  }

  const allowed = new Set(SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET);
  return Object.fromEntries(Object.entries(summary).filter(([key]) => allowed.has(key)));
}

function validateRedactedSelectedResultPersistedSummary(summary, slotContract) {
  const allowed = new Set(slotContract.eligiblePersistedSummaryFieldSet || SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET);
  for (const key of Object.keys(summary)) {
    if (!allowed.has(key)) selectedResultPersistedSummaryWriteFailure(`summary field not allow-listed: ${key}`);
  }
  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS) {
    if (isBlank(summary[key])) selectedResultPersistedSummaryWriteFailure(`required summary field missing: ${key}`);
  }
  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) selectedResultPersistedSummaryWriteFailure(`required false summary flag not false: ${key}`);
  }
  if (summary.owner !== "shell" || summary.slotOwner !== "shell" || summary.moduleId !== "cs_selector") {
    selectedResultPersistedSummaryWriteFailure("summary owner/module is not shell-owned cs_selector");
  }
  if (summary.summaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) {
    selectedResultPersistedSummaryWriteFailure("summary is not marked summary-only, redacted, and machine-value-safe");
  }
  const unsafe = findUnsafeSelectedResultSummaryInput(summary);
  if (unsafe) selectedResultPersistedSummaryWriteFailure(unsafe);
}

function prepareSelectedResultPersistedSummaryWrite(context = {}, moduleContributions = {}) {
  const writeRequest = resolveSelectedResultPersistedSummaryWrite(context, moduleContributions);
  if (!writeRequest.requested) return writeRequest;

  const unsafe = findUnsafeSelectedResultSummaryInput(writeRequest.rawInputForSafetyScan);
  if (unsafe) selectedResultPersistedSummaryWriteFailure(unsafe);

  const slotContract = resolveSelectedResultPersistedSummarySlotContract(writeRequest);
  const contractUnsafe = findUnsafeSelectedResultSummaryInput(slotContract);
  if (contractUnsafe) selectedResultPersistedSummaryWriteFailure(contractUnsafe);
  validateSelectedResultPersistedSummaryTarget(writeRequest, slotContract);
  validateSelectedResultPersistedSummaryAuthority(slotContract);

  const summary = buildRedactedSelectedResultPersistedSummary(slotContract);
  validateRedactedSelectedResultPersistedSummary(summary, slotContract);

  return {
    ...writeRequest,
    slotContract,
    summary,
  };
}

function writeSelectedResultPersistedSummaryToEnvelope(envelope, summary) {
  if (!isPlainObject(envelope?.modules?.cs_selector)) {
    selectedResultPersistedSummaryWriteFailure("candidate envelope missing cs_selector module slot");
  }
  if (!isPlainObject(envelope.modules.cs_selector.downstreamContext)) {
    envelope.modules.cs_selector.downstreamContext = {};
  }
  envelope.modules.cs_selector.downstreamContext.selectedResultSummary = clone(summary);
  return envelope;
}

function createFixtureEnvelope({ projectId, title, client, site, savedByName, savedByEmail, lifecycleStatus = "draft" }) {
  const now = new Date().toISOString();
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p1-project-browser-fixture",
    browserOnly: true,
    readOnly: true,
    envelopeId: `fixture-${projectId}`,
    projectId,
    title,
    client,
    site,
    createdAt: now,
    updatedAt: now,
    savedAt: now,
    savedBy: {
      identityState: "internal_identified",
      classification: "internal",
      actualRole: "internal_user",
      derivedActualRole: "internal_user",
      actualRoleSource: "p1-project-browser-fixture",
      displayRole: "internal_user",
      displayRoleClamped: false,
      name: savedByName,
      email: savedByEmail,
    },
    project: {
      metadata: {
        projectId,
        title,
        readiness: "browser-fixture",
        source: "p1-project-browser-fixture",
      },
      currentProject: {
        projectId,
        title,
        client,
        site,
        readiness: "browser-fixture",
      },
      selection: {},
    },
    shell: {
      phase: "p1-project-browser-read-only-foundation",
      contractVersion: "fixture",
      visibility: {},
      flags: {},
      downstream: {},
    },
    modules: {
      cs_selector: {
        owner: "cs_selector",
        moduleId: "cs_selector",
        status: "empty",
        state: {},
        downstreamContext: null,
      },
      scene_builder: {
        owner: "scene_builder",
        moduleId: "scene_builder",
        status: "empty",
        state: {},
        downstreamContext: null,
      },
    },
    lifecycle: {
      owner: "shell",
      status: lifecycleStatus,
      custody: {
        ownerName: savedByName,
        ownerEmail: savedByEmail,
      },
      handoff: {
        status: "not-live",
        available: false,
        reason: "P2 save envelope does not enable handoff/share.",
      },
    },
    restore: {
      status: "not-live",
      available: false,
      reason: "Restore/hydrate deferred to P3.",
    },
  };
}

const FIXTURE_ENVELOPES = Object.freeze([
  createFixtureEnvelope({
    projectId: "saved-alpha",
    title: "Saved Alpha project",
    client: "Alpha Client",
    site: "Sydney",
    savedByName: "Workspace User",
    savedByEmail: "internal@controlstack.local",
    lifecycleStatus: "draft",
  }),
  createFixtureEnvelope({
    projectId: "saved-bravo",
    title: "Saved Bravo project",
    client: "Bravo Client",
    site: "Parramatta",
    savedByName: "Internal Engineer",
    savedByEmail: "engineer@controlstack.local",
    lifecycleStatus: "draft",
  }),
]);

export function createSavedProjectStore({ eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "handoff-share-ready",
    source: "p4-shell-handoff-share",
    fixtureEnvelopes: FIXTURE_ENVELOPES.map(clone),
    savedEnvelopes: [],
    save: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p2-shell-save-envelope",
      lastSavedEnvelopeId: null,
      lastSavedProjectId: null,
      lastSavedAt: null,
      lastError: null,
    },
    restore: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p3-shell-restore-hydrate",
      lastRestoredEnvelopeId: null,
      lastRestoredProjectId: null,
      lastRestoredAt: null,
      lastError: null,
      validation: "not-run",
    },
    hydrate: {
      owner: "shell",
      status: "idle",
      live: true,
      source: "p3-shell-restore-hydrate",
      lastHydratedEnvelopeId: null,
      lastHydratedModules: [],
      modulePayloads: {},
      moduleResults: {},
    },
    handoffShare: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p4-shell-handoff-share",
      packagePreparationOnly: true,
      lastPreparedPackageId: null,
      lastPreparedEnvelopeId: null,
      lastPreparedProjectId: null,
      lastPreparedAt: null,
      lastError: null,
      package: null,
      delivery: {
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    },
  };

  function allEnvelopes() {
    return [...state.savedEnvelopes, ...state.fixtureEnvelopes];
  }

  function listProjectSummaries() {
    return allEnvelopes().map((envelope) => summariseProjectEnvelope(envelope));
  }

  function getProjectEnvelope(projectIdOrEnvelopeId) {
    const envelope = allEnvelopes().find((item) => item.projectId === projectIdOrEnvelopeId || item.envelopeId === projectIdOrEnvelopeId);
    return envelope ? clone(envelope) : null;
  }

  function createCurrentProjectPreviewEnvelope(context = {}) {
    return createSavedProjectEnvelope({
      project: context.project,
      identity: context.identity,
      visibility: context.visibility,
      flags: context.flags,
      downstream: context.downstream,
      contractVersion: context.contractVersion,
      source: "p1-current-project-preview-envelope",
    });
  }

  function getSaveSnapshot() {
    return {
      ...state.save,
      capabilities: {
        save: true,
        updateExistingEnvelope: true,
        list: true,
        inspect: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getRestoreSnapshot() {
    return {
      ...state.restore,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getHydrateSnapshot() {
    return clone(state.hydrate);
  }

  function getHandoffShareSnapshot() {
    return {
      ...clone(state.handoffShare),
      packageSummary: summariseHandoffSharePackage(state.handoffShare.package),
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        prepareHandoff: true,
        prepareShare: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getStoreSnapshot(context = {}) {
    const currentProjectPreview = createCurrentProjectPreviewEnvelope(context);
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: false,
      browserOnly: false,
      schema: "workspace_saved_project.v2-runtime",
      projects: listProjectSummaries(),
      count: allEnvelopes().length,
      savedCount: state.savedEnvelopes.length,
      fixtureCount: state.fixtureEnvelopes.length,
      safeEmpty: allEnvelopes().length === 0,
      currentProjectPreview: summariseProjectEnvelope(currentProjectPreview),
      save: getSaveSnapshot(),
      restore: getRestoreSnapshot(),
      hydrate: getHydrateSnapshot(),
      handoffShare: getHandoffShareSnapshot(),
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function saveCurrentProjectEnvelope(context = {}, moduleContributions = {}) {
    const savedEnvelopeRollback = state.savedEnvelopes.map(clone);
    let browserContext = context;
    try {
      state.save.status = "saving";
      state.save.lastError = null;

      const selectedResultSummaryWrite = prepareSelectedResultPersistedSummaryWrite(context, moduleContributions);
      const saveContext = selectedResultSummaryWrite.requested ? selectedResultSummaryWrite.context : context;
      const saveModuleContributions = selectedResultSummaryWrite.requested ? selectedResultSummaryWrite.moduleContributions : moduleContributions;
      browserContext = saveContext;

      const projectId = saveContext.project?.metadata?.projectId || saveContext.project?.currentProject?.projectId || "runtime-project";
      const existingIndex = state.savedEnvelopes.findIndex((item) => item.projectId === projectId);
      const previousEnvelope = existingIndex >= 0 ? state.savedEnvelopes[existingIndex] : null;
      const envelope = createSavedProjectEnvelope({
        project: saveContext.project,
        identity: saveContext.identity,
        visibility: saveContext.visibility,
        flags: saveContext.flags,
        downstream: saveContext.downstream,
        contractVersion: saveContext.contractVersion,
        moduleContributions: saveModuleContributions,
        source: "p2-shell-save-envelope",
        previousEnvelope,
      });

      if (selectedResultSummaryWrite.requested) {
        writeSelectedResultPersistedSummaryToEnvelope(envelope, selectedResultSummaryWrite.summary);
      }

      if (existingIndex >= 0) state.savedEnvelopes[existingIndex] = envelope;
      else state.savedEnvelopes.unshift(envelope);
      state.save.status = "saved";
      state.save.lastSavedEnvelopeId = envelope.envelopeId;
      state.save.lastSavedProjectId = envelope.projectId;
      state.save.lastSavedAt = envelope.savedAt;
      const result = {
        accepted: true,
        status: "saved",
        envelopeId: envelope.envelopeId,
        projectId: envelope.projectId,
        savedAt: envelope.savedAt,
        updatedExisting: existingIndex >= 0,
        selectedResultPersistedSummaryWritten: selectedResultSummaryWrite.requested === true,
        selectedResultPersistedSummaryTarget: selectedResultSummaryWrite.requested ? SELECTED_RESULT_SUMMARY_TARGET : null,
        envelope: clone(envelope),
        browser: getStoreSnapshot(saveContext),
      };
      eventBus?.emit("saved-project-store:saved", result);
      return result;
    } catch (error) {
      state.savedEnvelopes = savedEnvelopeRollback;
      state.save.status = "failed";
      state.save.lastError = error?.message || String(error || "Unknown save error");
      const result = {
        accepted: false,
        status: "failed",
        reason: state.save.lastError,
        browser: getStoreSnapshot(browserContext),
      };
      eventBus?.emit("saved-project-store:save-failed", result);
      return result;
    }
  }

  function restoreProjectEnvelope(projectIdOrEnvelopeId, context = {}) {
    const restoredAt = nowIso();
    const envelope = getProjectEnvelope(projectIdOrEnvelopeId);
    if (!envelope) {
      state.restore.status = "failed";
      state.restore.lastError = `Saved project not found: ${projectIdOrEnvelopeId}`;
      state.restore.validation = "missing";
      return {
        accepted: false,
        status: "failed",
        reason: state.restore.lastError,
        browser: getStoreSnapshot(context),
      };
    }

    const validation = validateSavedProjectEnvelope(envelope);
    if (!validation.valid) {
      state.restore.status = "failed";
      state.restore.lastError = validation.reason;
      state.restore.validation = "failed";
      return {
        accepted: false,
        status: "failed",
        reason: validation.reason,
        envelope,
        browser: getStoreSnapshot(context),
      };
    }

    if (envelope.readOnly === true || envelope.browserOnly === true) {
      state.restore.status = "rejected";
      state.restore.lastError = "Fixture/read-only envelopes cannot be restored in P3. Save a runtime envelope first.";
      state.restore.validation = "read-only-rejected";
      return {
        accepted: false,
        status: "rejected",
        reason: state.restore.lastError,
        envelope,
        browser: getStoreSnapshot(context),
      };
    }

    state.restore.status = "restoring";
    state.restore.lastError = null;
    state.restore.validation = "passed";
    const modulePayloads = createHydrationPayloadsFromEnvelope(envelope);
    const moduleResults = createHydrationResultsFromEnvelope(envelope);
    const lastHydratedModules = Object.keys(moduleResults);
    state.restore.status = "restored";
    state.restore.lastRestoredEnvelopeId = envelope.envelopeId;
    state.restore.lastRestoredProjectId = envelope.projectId;
    state.restore.lastRestoredAt = restoredAt;
    state.hydrate.status = "prepared";
    state.hydrate.lastHydratedEnvelopeId = envelope.envelopeId;
    state.hydrate.lastHydratedModules = lastHydratedModules;
    state.hydrate.modulePayloads = modulePayloads;
    state.hydrate.moduleResults = moduleResults;
    const result = {
      accepted: true,
      status: "restored",
      envelopeId: envelope.envelopeId,
      projectId: envelope.projectId,
      restoredAt,
      shellProjectUpdated: true,
      envelope,
      hydrate: getHydrateSnapshot(),
      hydratedModules: Object.values(moduleResults),
      browser: getStoreSnapshot(context),
    };
    eventBus?.emit("saved-project-store:restored", result);
    return result;
  }

  function resolvePackageEnvelope(context = {}) {
    const envelopeId = context.project?.metadata?.restoredEnvelopeId || state.restore.lastRestoredEnvelopeId || state.save.lastSavedEnvelopeId || context.projectBrowser?.selectedProjectId || null;
    return envelopeId ? getProjectEnvelope(envelopeId) : null;
  }

  function prepareHandoffSharePackage(context = {}) {
    try {
      state.handoffShare.status = "preparing";
      state.handoffShare.lastError = null;
      const envelope = resolvePackageEnvelope(context);
      const pkg = createHandoffSharePackage({
        context,
        envelope,
        save: getSaveSnapshot(),
        restore: getRestoreSnapshot(),
        hydrate: getHydrateSnapshot(),
      });
      state.handoffShare.status = "prepared";
      state.handoffShare.package = pkg;
      state.handoffShare.lastPreparedPackageId = pkg.packageId;
      state.handoffShare.lastPreparedEnvelopeId = pkg.envelopeId;
      state.handoffShare.lastPreparedProjectId = pkg.projectId;
      state.handoffShare.lastPreparedAt = pkg.preparedAt;
      const result = {
        accepted: true,
        status: "prepared",
        packageId: pkg.packageId,
        projectId: pkg.projectId,
        envelopeId: pkg.envelopeId,
        preparedAt: pkg.preparedAt,
        package: clone(pkg),
        delivery: clone(pkg.delivery),
        browser: getStoreSnapshot(context),
      };
      eventBus?.emit("saved-project-store:handoff-share-prepared", result);
      return result;
    } catch (error) {
      state.handoffShare.status = "failed";
      state.handoffShare.lastError = error?.message || String(error || "Unknown handoff/share preparation error");
      return {
        accepted: false,
        status: "failed",
        reason: state.handoffShare.lastError,
        browser: getStoreSnapshot(context),
      };
    }
  }

  return {
    owner: state.owner,
    status: state.status,
    listProjectSummaries,
    getProjectEnvelope,
    getStoreSnapshot,
    getSaveSnapshot,
    getRestoreSnapshot,
    getHydrateSnapshot,
    getHandoffShareSnapshot,
    createCurrentProjectPreviewEnvelope,
    saveCurrentProjectEnvelope,
    saveProjectEnvelope(context = {}, moduleContributions = {}) {
      return saveCurrentProjectEnvelope(context, moduleContributions);
    },
    restoreProjectEnvelope,
    prepareHandoffSharePackage,
    requestHandoff(context = {}) {
      return prepareHandoffSharePackage(context);
    },
  };
}
