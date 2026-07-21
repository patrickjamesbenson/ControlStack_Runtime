import {
  ENGINE_SELECTED_RESULT_RUN_SCHEMA_ID,
  ENGINE_SELECTED_RESULT_RUN_SCHEMA_VERSION,
  ENGINE_SELECTED_RESULT_SCHEMA_ID,
  ENGINE_SELECTED_RESULT_SCHEMA_VERSION,
  ENGINE_SELECTED_RESULT_STATES,
} from "./runtimeEngineSelectedResultContractV1.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const ENGINE_SELECTION_SET_SCHEMA_ID = "controlstack.engine.selection-set.v1";
export const ENGINE_SELECTION_SET_SCHEMA_VERSION = 1;
export const ENGINE_OUTPUT_SCHEMA_ID = "controlstack.engine.output.v1";
export const ENGINE_OUTPUT_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_ROW_SCHEMA_ID = "controlstack.engine.runtable-row.v1";
export const ENGINE_RUNTABLE_ROW_SCHEMA_VERSION = 1;

export const ENGINE_OUTPUT_STATES = Object.freeze({
  complete: "complete",
  blockedFailClosed: "blocked_fail_closed",
});

export const ENGINE_RUNTABLE_ROW_FIELD_SET = Object.freeze([
  "schemaId",
  "schemaVersion",
  "rowKey",
  "runKey",
  "runIndex",
  "rowOrdinal",
  "rowKind",
  "state",
  "accepted",
  "engineVerified",
  "hasBodyRequested",
  "boardCount",
  "segmentCount",
  "zoneCount",
  "clipPointsCount",
  "suspensionPointsCount",
  "gearTrayPlanCount",
  "reservedRangesCount",
  "requestFingerprint",
  "sourceVersionFingerprint",
  "policyFingerprint",
  "resultId",
  "readOnly",
  "rawPayloadReturned",
]);

const REQUEST_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "selectionSet",
  "requestFingerprint",
]);
const INPUT_REQUIRED_KEYS = Object.freeze([
  "selectionRequest",
  "internalSelectedResult",
  "policyFingerprint",
  "evidenceFingerprints",
]);
const INPUT_OPTIONAL_KEYS = Object.freeze(["traceabilityEnvelope"]);
const INTERNAL_RESULT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "accepted",
  "failClosed",
  "resultId",
  "sourceIdentity",
  "technicalProvenance",
  "selectedResult",
  "runs",
  "runCount",
  "blockers",
  "warnings",
  "readOnly",
  "nonPersistent",
  "stabilityState",
  "safetyFlags",
]);
const INTERNAL_SOURCE_IDENTITY_KEYS = Object.freeze([
  "sourceKind",
  "sourceInputFingerprint",
  "sourceVersionMarker",
]);
const INTERNAL_PROVENANCE_KEYS = Object.freeze([
  "selectedOpticKey",
  "opticBomId",
  "evidenceRef",
  "programValidationState",
  "selectedTierOrProfile",
]);
const INTERNAL_RUN_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "rowKey",
  "runKey",
  "runIndex",
  "rowOrdinal",
  "accepted",
  "engineVerified",
  "safeSummaryOnly",
  "hasBodyRequested",
  "boardCount",
  "segmentCount",
  "zoneCount",
  "clipPointsCount",
  "suspensionPointsCount",
  "gearTrayPlanCount",
  "reservedRangesCount",
  "rawRunReturned",
]);
const INTERNAL_SAFETY_KEYS = Object.freeze([
  "readOnly",
  "nonPersistent",
  "safeSummaryOnly",
  "donorEngineInvoked",
  "curveParserInvoked",
  "thermalRecalculated",
  "selectedResultPersisted",
  "runtimeDataMutated",
  "runTablePersisted",
  "iesGenerated",
  "outputArtifactGenerated",
  "publicRouteAdded",
  "postEndpointAdded",
  "rawPayloadReturned",
  "rawSourceRowsReturned",
  "privatePathsReturned",
]);
const THERMAL_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "selectedOpticKey",
  "opticBomId",
  "sourceRevision",
  "evidenceRef",
  "programValidationState",
  "selectedRoomTaC",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
  "derivedInternalTaC",
  "curveLookupTaC",
  "effectiveCurveTaC",
  "temperatureMode",
  "requestedCurrentMa",
  "currentMode",
  "verifiedLmPerM",
  "curveFilename",
  "curveChecksumVerified",
  "opticRiseAppliedCount",
  "readOnly",
  "safetyFlags",
]);
const THERMAL_SAFETY_KEYS = Object.freeze([
  "donorEngineInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "runTableGenerated",
  "iesGenerated",
  "outputGenerated",
  "rawCurveRowsReturned",
  "rawCurvePayloadReturned",
  "publicRouteAdded",
  "postEndpointAdded",
]);
const GOVERNANCE_KEYS = Object.freeze(new Set([
  "user",
  "userid",
  "customer",
  "customerid",
  "company",
  "companyid",
  "project",
  "projectid",
  "deal",
  "dealid",
  "quote",
  "quoteid",
  "owner",
  "ownerid",
  "timeline",
  "handoff",
  "entitlement",
  "registration",
  "registrationstate",
  "activerevision",
  "savedproject",
  "selectedproject",
  "persistence",
  "persistenceacknowledgement",
  "tier",
  "selectedtier",
  "tierstrategy",
  "governanceapproval",
  "eligibilityapproval",
]));
const CALLER_DERIVED_KEYS = Object.freeze(new Set([
  "candidate",
  "candidates",
  "score",
  "scores",
  "selectedresult",
  "resultid",
  "runtable",
  "derivedinternalta",
  "derivedinternaltac",
  "curvelookupta",
  "curvelookuptac",
  "boardtemperature",
  "boardtemperaturetac",
  "verifiedlmperm",
  "verifiedoutput",
  "deliveredlmperm",
]));
const FINGERPRINT_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{7,255}$/;
const BLOCKER_PATTERN = /^[a-z][a-z0-9_-]{0,127}$/;
const PRIVATE_TEXT_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|password|credential|secret|bearer\s+|api[_-]?key)/i;

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function validInputKeys(value) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  const allowed = new Set([...INPUT_REQUIRED_KEYS, ...INPUT_OPTIONAL_KEYS]);
  return INPUT_REQUIRED_KEYS.every((key) => keys.includes(key))
    && keys.every((key) => allowed.has(key));
}

function normalizedKey(value) {
  return String(value ?? "").replace(/[^0-9a-z]/gi, "").toLowerCase();
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? (Object.is(value, -0) ? 0 : value)
    : null;
}

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function boundedText(value, maximum = 256) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > maximum
    || /[\u0000-\u001f\u007f]/.test(value)
    || PRIVATE_TEXT_PATTERN.test(value)
  ) return null;
  return value;
}

function fingerprint(value) {
  return typeof value === "string" && FINGERPRINT_PATTERN.test(value) ? value : null;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function stableSelectionValue(value, seen = new Set()) {
  if (value === null || typeof value === "boolean") return { ok: true, value };
  if (typeof value === "number") {
    const numeric = finiteNumber(value);
    return numeric === null
      ? { ok: false, blocker: "selection-set-non-finite-number" }
      : { ok: true, value: numeric };
  }
  if (typeof value === "string") {
    if (!boundedText(value, 512)) return { ok: false, blocker: "selection-set-unsafe-text" };
    return { ok: true, value };
  }
  if (!value || typeof value !== "object") {
    return { ok: false, blocker: "selection-set-unsupported-value" };
  }
  if (seen.has(value)) return { ok: false, blocker: "selection-set-cycle-rejected" };
  seen.add(value);

  if (Array.isArray(value)) {
    if (value.length > 256) return { ok: false, blocker: "selection-set-array-too-large" };
    const output = [];
    for (const entry of value) {
      const child = stableSelectionValue(entry, seen);
      if (!child.ok) return child;
      output.push(child.value);
    }
    seen.delete(value);
    return { ok: true, value: output };
  }
  if (!isPlainObject(value)) return { ok: false, blocker: "selection-set-plain-data-required" };
  const keys = Object.keys(value).sort();
  if (keys.length > 256) return { ok: false, blocker: "selection-set-object-too-large" };

  const output = {};
  for (const key of keys) {
    const token = normalizedKey(key);
    if (GOVERNANCE_KEYS.has(token)) {
      return { ok: false, blocker: `selection-set-governance-field-rejected-${token}` };
    }
    if (CALLER_DERIVED_KEYS.has(token)) {
      return { ok: false, blocker: `selection-set-derived-field-rejected-${token}` };
    }
    const child = stableSelectionValue(value[key], seen);
    if (!child.ok) return child;
    output[key] = child.value;
  }
  seen.delete(value);
  return { ok: true, value: output };
}

function requestFingerprintFor(selectionSet) {
  return stableFingerprint("engine-selection-set-v1", selectionSet);
}

function validateRequest(value) {
  if (!exactKeys(value, REQUEST_KEYS)) return { ok: false, blocker: "selection-request-invalid-shape" };
  if (
    value.schemaId !== ENGINE_SELECTION_SET_SCHEMA_ID
    || value.schemaVersion !== ENGINE_SELECTION_SET_SCHEMA_VERSION
  ) return { ok: false, blocker: "selection-request-schema-unsupported" };
  const selected = stableSelectionValue(value.selectionSet);
  if (!selected.ok) return selected;
  if (!isPlainObject(selected.value) || Object.keys(selected.value).length === 0) {
    return { ok: false, blocker: "selection-set-empty" };
  }
  const expectedFingerprint = requestFingerprintFor(selected.value);
  if (value.requestFingerprint !== expectedFingerprint) {
    return { ok: false, blocker: "selection-request-fingerprint-mismatch" };
  }
  return { ok: true, request: { ...value, selectionSet: selected.value } };
}

function validateEvidenceFingerprints(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 64) {
    return { ok: false, blocker: "evidence-fingerprints-invalid" };
  }
  const seen = new Set();
  const output = [];
  for (const entry of value) {
    const token = fingerprint(entry);
    if (!token || seen.has(token)) return { ok: false, blocker: "evidence-fingerprints-invalid" };
    seen.add(token);
    output.push(token);
  }
  return { ok: true, value: output };
}

function allFalse(value, keys) {
  return exactKeys(value, keys) && keys.every((key) => value[key] === false);
}

function validateThermal(value, provenance) {
  if (!exactKeys(value, THERMAL_KEYS)) return { ok: false, blocker: "internal-thermal-invalid-shape" };
  if (
    value.readOnly !== true
    || value.curveChecksumVerified !== true
    || value.opticRiseAppliedCount !== 1
    || !allFalse(value.safetyFlags, THERMAL_SAFETY_KEYS)
  ) return { ok: false, blocker: "internal-thermal-not-accepted" };
  if (
    boundedText(value.selectedOpticKey, 180) !== provenance.selectedOpticKey
    || boundedText(value.opticBomId, 256) !== provenance.opticBomId
    || boundedText(value.evidenceRef, 256) !== provenance.evidenceRef
    || boundedText(value.programValidationState, 128) !== provenance.programValidationState
  ) return { ok: false, blocker: "internal-thermal-provenance-mismatch" };
  for (const key of [
    "selectedRoomTaC",
    "referenceRoomTaC",
    "referenceInternalTaC",
    "opticThermalRiseTaC",
    "derivedInternalTaC",
    "curveLookupTaC",
    "effectiveCurveTaC",
    "requestedCurrentMa",
    "verifiedLmPerM",
  ]) {
    if (finiteNumber(value[key]) === null) return { ok: false, blocker: "internal-thermal-number-invalid" };
  }
  if (value.requestedCurrentMa < 0) return { ok: false, blocker: "internal-thermal-current-invalid" };
  if (value.curveLookupTaC !== value.derivedInternalTaC) {
    return { ok: false, blocker: "internal-thermal-lookup-mismatch" };
  }
  if (
    !boundedText(value.sourceRevision, 256)
    || !boundedText(value.temperatureMode, 64)
    || !boundedText(value.currentMode, 64)
    || !boundedText(value.curveFilename, 180)
    || /[\\/]/.test(value.curveFilename)
  ) return { ok: false, blocker: "internal-thermal-text-invalid" };
  return { ok: true, value: clonePlain(value) };
}

function validateInternalRun(value, index) {
  if (!exactKeys(value, INTERNAL_RUN_KEYS)) return { ok: false, blocker: "internal-run-invalid-shape" };
  if (
    value.schemaId !== ENGINE_SELECTED_RESULT_RUN_SCHEMA_ID
    || value.schemaVersion !== ENGINE_SELECTED_RESULT_RUN_SCHEMA_VERSION
    || value.accepted !== true
    || value.engineVerified !== true
    || value.safeSummaryOnly !== true
    || value.rawRunReturned !== false
    || value.rowOrdinal !== index + 1
    || typeof value.hasBodyRequested !== "boolean"
    || !boundedText(value.rowKey, 180)
    || !boundedText(value.runKey, 180)
    || nonNegativeInteger(value.runIndex) === null
  ) return { ok: false, blocker: "internal-run-not-accepted" };
  const counts = {};
  for (const key of [
    "boardCount",
    "segmentCount",
    "zoneCount",
    "clipPointsCount",
    "suspensionPointsCount",
    "gearTrayPlanCount",
    "reservedRangesCount",
  ]) {
    const count = nonNegativeInteger(value[key]);
    if (count === null) return { ok: false, blocker: "internal-run-count-invalid" };
    counts[key] = count;
  }
  return {
    ok: true,
    value: {
      runKey: value.runKey,
      runIndex: value.runIndex,
      hasBodyRequested: value.hasBodyRequested,
      ...counts,
    },
  };
}

function validateInternalSelectedResult(value) {
  if (!exactKeys(value, INTERNAL_RESULT_KEYS)) return { ok: false, blocker: "internal-selected-result-invalid-shape" };
  if (
    value.schemaId !== ENGINE_SELECTED_RESULT_SCHEMA_ID
    || value.schemaVersion !== ENGINE_SELECTED_RESULT_SCHEMA_VERSION
    || value.state !== ENGINE_SELECTED_RESULT_STATES.accepted
    || value.accepted !== true
    || value.failClosed !== false
    || value.readOnly !== true
    || value.nonPersistent !== true
    || value.stabilityState !== "producer_contract_only_not_stable"
    || !boundedText(value.resultId, 180)
    || !Array.isArray(value.blockers)
    || value.blockers.length !== 0
    || !Array.isArray(value.warnings)
  ) return { ok: false, blocker: "internal-selected-result-not-accepted" };
  if (!exactKeys(value.sourceIdentity, INTERNAL_SOURCE_IDENTITY_KEYS)) {
    return { ok: false, blocker: "internal-source-identity-invalid-shape" };
  }
  const sourceInputFingerprint = fingerprint(value.sourceIdentity.sourceInputFingerprint);
  const sourceVersionMarker = fingerprint(value.sourceIdentity.sourceVersionMarker);
  const sourceKind = boundedText(value.sourceIdentity.sourceKind, 180);
  if (!sourceInputFingerprint || !sourceVersionMarker || !sourceKind) {
    return { ok: false, blocker: "internal-source-identity-invalid" };
  }
  if (!exactKeys(value.technicalProvenance, INTERNAL_PROVENANCE_KEYS)) {
    return { ok: false, blocker: "internal-provenance-invalid-shape" };
  }
  const provenance = {
    selectedOpticKey: boundedText(value.technicalProvenance.selectedOpticKey, 180),
    opticBomId: boundedText(value.technicalProvenance.opticBomId, 256),
    evidenceRef: boundedText(value.technicalProvenance.evidenceRef, 256),
    programValidationState: boundedText(value.technicalProvenance.programValidationState, 128),
    selectedTierOrProfile: boundedText(value.technicalProvenance.selectedTierOrProfile, 120),
  };
  if (Object.values(provenance).some((entry) => !entry)) {
    return { ok: false, blocker: "internal-provenance-invalid" };
  }
  const thermal = validateThermal(value.selectedResult, provenance);
  if (!thermal.ok) return thermal;
  if (thermal.value.sourceRevision !== sourceVersionMarker) {
    return { ok: false, blocker: "internal-source-revision-mismatch" };
  }
  if (!Array.isArray(value.runs) || nonNegativeInteger(value.runCount) === null || value.runCount < 1) {
    return { ok: false, blocker: "internal-runs-invalid" };
  }
  if (value.runs.length !== value.runCount) return { ok: false, blocker: "internal-run-count-mismatch" };
  const runs = [];
  for (let index = 0; index < value.runs.length; index += 1) {
    const run = validateInternalRun(value.runs[index], index);
    if (!run.ok) return run;
    runs.push(run.value);
  }
  if (new Set(runs.map((run) => run.runKey)).size !== runs.length) {
    return { ok: false, blocker: "internal-run-key-duplicate" };
  }
  const expectedComponentResultId = stableFingerprint("engine-selected-result-v1", {
    schemaId: value.schemaId,
    schemaVersion: value.schemaVersion,
    sourceIdentity: value.sourceIdentity,
    technicalProvenance: value.technicalProvenance,
    selectedResult: value.selectedResult,
    runs: value.runs,
  });
  if (value.resultId !== expectedComponentResultId) {
    return { ok: false, blocker: "internal-selected-result-fingerprint-mismatch" };
  }
  if (!exactKeys(value.safetyFlags, INTERNAL_SAFETY_KEYS)) {
    return { ok: false, blocker: "internal-safety-invalid-shape" };
  }
  if (
    value.safetyFlags.readOnly !== true
    || value.safetyFlags.nonPersistent !== true
    || value.safetyFlags.safeSummaryOnly !== true
  ) return { ok: false, blocker: "internal-safety-not-accepted" };
  for (const key of INTERNAL_SAFETY_KEYS.filter((key) => !["readOnly", "nonPersistent", "safeSummaryOnly"].includes(key))) {
    if (value.safetyFlags[key] !== false) return { ok: false, blocker: "internal-safety-not-accepted" };
  }
  return {
    ok: true,
    value: {
      componentResultId: value.resultId,
      sourceKind,
      sourceInputFingerprint,
      sourceVersionMarker,
      provenance,
      thermal: thermal.value,
      runs,
    },
  };
}

function sourceVersionFingerprintFor(internal) {
  return stableFingerprint("engine-source-version-v1", {
    sourceKind: internal.sourceKind,
    sourceVersionMarker: internal.sourceVersionMarker,
    selectedOpticKey: internal.provenance.selectedOpticKey,
    opticBomId: internal.provenance.opticBomId,
  });
}

function resultIdFor({ requestFingerprint, sourceVersionFingerprint, policyFingerprint, evidenceFingerprints, internal }) {
  return stableFingerprint("engine-output-v1", {
    schemaId: ENGINE_OUTPUT_SCHEMA_ID,
    schemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    requestFingerprint,
    sourceVersionFingerprint,
    policyFingerprint,
    evidenceFingerprints,
    internalResultId: internal.componentResultId,
    thermal: {
      derivedInternalTaC: internal.thermal.derivedInternalTaC,
      curveLookupTaC: internal.thermal.curveLookupTaC,
      requestedCurrentMa: internal.thermal.requestedCurrentMa,
      verifiedLmPerM: internal.thermal.verifiedLmPerM,
    },
    runs: internal.runs,
  });
}

function safetyFlags(contractRowsBuilt) {
  return {
    readOnly: true,
    nonPersistent: true,
    governanceEnvelopeIgnored: true,
    contractRowsBuilt,
    engineInvoked: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    iesGenerated: false,
    downstreamActivated: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
    rawEnginePayloadReturned: false,
    rawSourceRowsReturned: false,
    privatePathsReturned: false,
    exactPrivateElectricalValuesReturned: false,
  };
}

function canonicalBlocker(value) {
  return typeof value === "string" && BLOCKER_PATTERN.test(value)
    ? value
    : "engine-output-contract-blocked";
}

function blockedOutput(blocker, context = {}) {
  const requestFingerprint = fingerprint(context.requestFingerprint) || null;
  const policyFingerprint = fingerprint(context.policyFingerprint) || null;
  return deepFreeze({
    schemaId: ENGINE_OUTPUT_SCHEMA_ID,
    schemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    state: ENGINE_OUTPUT_STATES.blockedFailClosed,
    resultId: null,
    requestFingerprint,
    sourceVersionFingerprint: null,
    policyFingerprint,
    evidenceFingerprints: [],
    selectedResult: null,
    runTable: null,
    blockers: [canonicalBlocker(blocker)],
    warnings: [],
    replay: {
      requestFingerprint,
      sourceVersionFingerprint: null,
      policyFingerprint,
      evidenceFingerprints: [],
      outputSchemaId: ENGINE_OUTPUT_SCHEMA_ID,
      outputSchemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    },
    safetyFlags: safetyFlags(false),
  });
}

function buildRows(runs, identity) {
  return runs.map((run, index) => deepFreeze({
    schemaId: ENGINE_RUNTABLE_ROW_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
    rowKey: stableFingerprint("engine-runtable-row-v1", {
      resultId: identity.resultId,
      runKey: run.runKey,
      runIndex: run.runIndex,
    }),
    runKey: run.runKey,
    runIndex: run.runIndex,
    rowOrdinal: index + 1,
    rowKind: "run_summary",
    state: ENGINE_OUTPUT_STATES.complete,
    accepted: true,
    engineVerified: true,
    hasBodyRequested: run.hasBodyRequested,
    boardCount: run.boardCount,
    segmentCount: run.segmentCount,
    zoneCount: run.zoneCount,
    clipPointsCount: run.clipPointsCount,
    suspensionPointsCount: run.suspensionPointsCount,
    gearTrayPlanCount: run.gearTrayPlanCount,
    reservedRangesCount: run.reservedRangesCount,
    requestFingerprint: identity.requestFingerprint,
    sourceVersionFingerprint: identity.sourceVersionFingerprint,
    policyFingerprint: identity.policyFingerprint,
    resultId: identity.resultId,
    readOnly: true,
    rawPayloadReturned: false,
  }));
}

export function createEngineSelectionSetRequestV1(selectionSet = {}) {
  const selection = stableSelectionValue(selectionSet);
  if (!selection.ok) return deepFreeze({ ok: false, request: null, blocker: selection.blocker });
  if (!isPlainObject(selection.value) || Object.keys(selection.value).length === 0) {
    return deepFreeze({ ok: false, request: null, blocker: "selection-set-empty" });
  }
  const request = deepFreeze({
    schemaId: ENGINE_SELECTION_SET_SCHEMA_ID,
    schemaVersion: ENGINE_SELECTION_SET_SCHEMA_VERSION,
    selectionSet: selection.value,
    requestFingerprint: requestFingerprintFor(selection.value),
  });
  return deepFreeze({ ok: true, request, blocker: null });
}

export function buildRuntimeEngineOutputContractV1(input = {}) {
  if (!validInputKeys(input)) return blockedOutput("engine-output-input-invalid-shape");
  const request = validateRequest(input.selectionRequest);
  if (!request.ok) return blockedOutput(request.blocker);
  const requestFingerprint = request.request.requestFingerprint;

  const policyFingerprint = fingerprint(input.policyFingerprint);
  if (!policyFingerprint) return blockedOutput("policy-fingerprint-invalid", { requestFingerprint });
  const evidence = validateEvidenceFingerprints(input.evidenceFingerprints);
  if (!evidence.ok) return blockedOutput(evidence.blocker, { requestFingerprint, policyFingerprint });

  const internal = validateInternalSelectedResult(input.internalSelectedResult);
  if (!internal.ok) return blockedOutput(internal.blocker, { requestFingerprint, policyFingerprint });
  const expectedEvidenceFingerprint = stableFingerprint("engine-evidence-v1", {
    selectedOpticKey: internal.value.provenance.selectedOpticKey,
    opticBomId: internal.value.provenance.opticBomId,
    evidenceRef: internal.value.provenance.evidenceRef,
    programValidationState: internal.value.provenance.programValidationState,
  });
  if (!evidence.value.includes(expectedEvidenceFingerprint)) {
    return blockedOutput("evidence-fingerprint-mismatch", {
      requestFingerprint,
      policyFingerprint,
    });
  }
  const sourceVersionFingerprint = sourceVersionFingerprintFor(internal.value);
  const resultId = resultIdFor({
    requestFingerprint,
    sourceVersionFingerprint,
    policyFingerprint,
    evidenceFingerprints: evidence.value,
    internal: internal.value,
  });
  const identity = { requestFingerprint, sourceVersionFingerprint, policyFingerprint, resultId };
  const rows = buildRows(internal.value.runs, identity);

  return deepFreeze({
    schemaId: ENGINE_OUTPUT_SCHEMA_ID,
    schemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    state: ENGINE_OUTPUT_STATES.complete,
    resultId,
    requestFingerprint,
    sourceVersionFingerprint,
    policyFingerprint,
    evidenceFingerprints: [...evidence.value],
    selectedResult: {
      resultId,
      accepted: true,
      engineVerified: true,
      selectedProfile: internal.value.provenance.selectedTierOrProfile,
      sourceKind: internal.value.sourceKind,
      sourceInputFingerprint: internal.value.sourceInputFingerprint,
      sourceVersionMarker: internal.value.sourceVersionMarker,
      internalComponentResultId: internal.value.componentResultId,
      technicalProvenance: clonePlain(internal.value.provenance),
      thermal: clonePlain(internal.value.thermal),
      runCount: rows.length,
      readOnly: true,
    },
    runTable: {
      rowSchemaId: ENGINE_RUNTABLE_ROW_SCHEMA_ID,
      rowSchemaVersion: ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
      rowCount: rows.length,
      rows,
      nonPersistent: true,
      readOnly: true,
    },
    blockers: [],
    warnings: [],
    replay: {
      requestFingerprint,
      sourceVersionFingerprint,
      policyFingerprint,
      evidenceFingerprints: [...evidence.value],
      outputSchemaId: ENGINE_OUTPUT_SCHEMA_ID,
      outputSchemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    },
    safetyFlags: safetyFlags(true),
  });
}
