import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.selected-result-handoff-scaffold-summary";
export const ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_STATE =
  "runtime_selected_result_handoff_scaffold_diagnostic_only";

export const ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  sealedCandidateAssemblyPreviewRequired: true,
  runTableDomainOutputScaffoldRequired: true,
  gateDValidationScaffoldRequired: true,
  selectedResultProjectionRequired: true,
  safeSelectedResultSourceObjectRequired: true,
  selectedResultHandoffScaffoldOnly: true,
  selectedResultPersistenceEnabled: false,
  selectedResultPersistenceAttempted: false,
  donorEngineInvoked: false,
  donorEngineInvocationEnabled: false,
  donorEnginePayloadAssemblyEnabled: false,
  rawEngineResultReturned: false,
  rawEnginePayloadReturned: false,
  rawSelectorPayloadReturned: false,
  rawProductRowsReturned: false,
  exactElectricalValuesReturned: false,
  productionRunTableGenerationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  hubSpotWriteEnabled: false,
  projectWriteEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  staleResultComparisonEnabled: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,480}$/;

const REQUIRED_SUMMARIES = Object.freeze([
  {
    key: "sealedCandidateAssemblyPreviewSummary",
    label: "sealed candidate assembly preview summary",
    missing: "missing-sealed-candidate-assembly-preview-summary",
    notReady: "sealed-candidate-assembly-preview-not-ready",
    readyKey: "sealedCandidateAssemblyPreviewReady",
    fingerprintKeys: ["sealedCandidateAssemblyPreviewFingerprint"],
  },
  {
    key: "runTableDomainOutputScaffoldSummary",
    label: "RunTable domain output scaffold summary",
    missing: "missing-runtable-domain-output-scaffold-summary",
    notReady: "runtable-domain-output-scaffold-not-ready",
    readyKey: "runTableDomainOutputScaffoldReady",
    fingerprintKeys: ["runTableDomainOutputScaffoldFingerprint"],
  },
  {
    key: "gateDValidationScaffoldSummary",
    label: "Gate D validation scaffold summary",
    missing: "missing-gate-d-validation-scaffold-summary",
    notReady: "gate-d-validation-scaffold-not-ready",
    readyKey: "gateDScaffoldReady",
    fingerprintKeys: ["gateDValidationScaffoldFingerprint"],
  },
]);

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled|selectedResultPersistenceAttempted|selectedResultStorageEnabled|saveLoadActive|hiddenWriteBackEnabled)$/i, "selected-result-persistence-not-approved"],
  [/^(?:rawEngineResultReturned|rawEngineResultExposed|engineResultReturned|engineResultExposed|rawResultReturned|raw_result_returned)$/i, "raw-engine-result-not-approved"],
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|enginePayloadReturned|enginePayloadExposed|enginePayloadIncluded|rawRoughElectricalPayloadReturned|rawRoughElectricalPayloadExposed|roughElectricalPayloadReturned|roughElectricalPayloadAssemblyEnabled|donorEnginePayloadAssemblyEnabled)$/i, "raw-engine-payload-not-approved"],
  [/^(?:rawSelectorPayloadReturned|rawSelectorPayloadExposed|selectorPayloadReturned|selectorPayloadExposed|payloadGenerationEnabled|downstreamPayloadActive)$/i, "raw-selector-payload-not-approved"],
  [/^(?:rawProductRowsReturned|rawProductRowsExposed|rawProductDataRowsExposed|rawRowsReturned|rawRowsExposed|rawBoardRowsReturned|rawDriverRowsReturned|rawAccessoryRowsReturned|rawComponentRowsReturned|rawSourceDbRowsExposed|rawBoardDataRowsExposed)$/i, "raw-product-rows-not-approved"],
  [/^(?:exactElectricalValuesReturned|exactElectricalValuesExposed|exactVoltageReturned|exactPowerReturned|exactCurrentReturned|exactVfReturned|exactWattsReturned)$/i, "exact-electrical-values-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineExecutionAttempted|engineCallsActive)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAuthority|boardDataMutationEnabled|authorityWritesActive|activeBuildMutationEnabled|buildMutationEnabled)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:productionRunTableGenerated|productionRunTableGenerationEnabled|runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableGenerationAttempted|runTableMutationEnabled)$/i, "production-runtable-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled|iesHandoffEnabled|photometryGenerationAllowed|photometryGenerationEnabled|iesCallsActive)$/i, "ies-generation-not-approved"],
  [/^(?:hubSpotWriteEnabled|hubspotWriteEnabled|hubSpotWriteLive|hubspotWriteLive|hubSpotPushEnabled|hubSpotCrmWriteBackEnabled)$/i, "hubspot-write-not-approved"],
  [/^(?:projectWriteEnabled|projectWritesEnabled|projectWriteLive|controlledRecordWriteEnabled|controlledRecordsWriteEnabled)$/i, "project-write-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "route-or-post-endpoint-not-approved"],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:engineResult|engine_result|rawEngineResult|raw_engine_result|rawResult|raw_result|resultBody|selectedResultBody|selected_result_body|selectedResultPayload|rawSelectedPayload|raw_selected_payload)$/i, "raw-engine-result-not-approved"],
  [/^(?:enginePayload|rawEnginePayload|runEnginePayload|roughElectricalPayload|rawRoughElectricalPayload|donorPayload|rawDonorPayload|emergencyPayload|rawEmergencyPayload)$/i, "raw-engine-payload-not-approved"],
  [/^(?:selectorPayload|rawSelectorPayload|selectorEnginePayload|payloadDraft)$/i, "raw-selector-payload-not-approved"],
  [/^(?:PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|SYSTEM_POLICY|SYSTEM_COMPONENTS|rawRows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|rawComponentRows|productRows|boardRows|driverRows|accessoryRows|sourceRows|rawSourceRows|rawSourceDbRows)$/i, "raw-product-rows-not-approved"],
  [/^(?:electricalValues|exactElectricalValues|exactVoltage|exactPower|exactCurrent|exactVf|exactWatts)$/i, "exact-electrical-values-not-approved"],
]);

const BODY_KEY_PATTERN = /^(?:body|resultBody|selectedResultBody|selected_result_body|result_body|selectedResultObject|selected_result_object)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|filepath|sourcePath|donorPath|runtimeDataPath|privatePath|path)$/i;

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null
    || value === undefined
    || (typeof value === "number" && Number.isNaN(value))
    || (typeof value === "string" && value.trim() === "");
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function safeLabel(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 180) : fallback;
}

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return token || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 500);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function policyFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
}

function sourceFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function summaryFingerprint(summary, spec = {}) {
  if (!isPlainObject(summary)) return null;
  const fingerprint = safeFingerprint(firstPresent(summary, [
    ...(Array.isArray(spec.fingerprintKeys) ? spec.fingerprintKeys : []),
    "selectedResultHandoffScaffoldFingerprint",
    "runTableDomainOutputScaffoldFingerprint",
    "sealedCandidateAssemblyPreviewFingerprint",
    "gateDValidationScaffoldFingerprint",
    "selectedResultProjectionFingerprint",
    "safeSelectedResultSourceObjectFingerprint",
    "sourceInputFingerprint",
    "source_input_fingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]));
  return fingerprint || null;
}

function selectedProjectionFingerprint(summary) {
  if (!isPlainObject(summary)) return null;
  const value = safeFingerprint(firstPresent(summary, [
    "selectedResultProjectionFingerprint",
    "sourceInputFingerprint",
    "source_input_fingerprint",
    "selectorPayloadFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]) ?? firstPresent(summary.sourceInputFingerprintMetadata, ["value", "fingerprint"]));
  return value || null;
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 9) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "route-or-post-endpoint-not-approved" : null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeBlocker(entry, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    for (const [pattern, blocker] of RAW_KEY_BLOCKERS) {
      if (pattern.test(key) && nested !== false && nested !== null && nested !== undefined) return blocker;
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "route-or-post-endpoint-not-approved";
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function selectedBodyBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 7) return null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = selectedBodyBlocker(entry, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (BODY_KEY_PATTERN.test(key) && nested !== false && nested !== null && nested !== undefined) {
      return "selected-result-body-not-approved";
    }
    const blocker = selectedBodyBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function buildUpstreamFingerprints(source) {
  const summaryFingerprints = Object.fromEntries(REQUIRED_SUMMARIES.map((spec) => [
    spec.key,
    summaryFingerprint(source[spec.key], spec),
  ]));
  return {
    ...summaryFingerprints,
    selectedResultProjectionSummary: selectedProjectionFingerprint(source.selectedResultProjectionSummary),
    safeSelectedResultSourceObjectSummary: summaryFingerprint(source.safeSelectedResultSourceObjectSummary),
  };
}

function resolveFingerprints(source) {
  const sealed = source.sealedCandidateAssemblyPreviewSummary;
  const domain = source.runTableDomainOutputScaffoldSummary;
  const gate = source.gateDValidationScaffoldSummary;
  const projection = source.selectedResultProjectionSummary;
  const safeSource = source.safeSelectedResultSourceObjectSummary;
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || policyFingerprintFrom(sealed)
    || policyFingerprintFrom(domain)
    || policyFingerprintFrom(gate)
    || policyFingerprintFrom(projection)
    || policyFingerprintFrom(safeSource);
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || sourceFingerprintFrom(sealed)
    || sourceFingerprintFrom(domain)
    || sourceFingerprintFrom(gate)
    || sourceFingerprintFrom(projection)
    || sourceFingerprintFrom(safeSource);

  if (!policyFingerprint || !sourceFingerprint) {
    return {
      ok: false,
      blocker: "fingerprint-mismatch",
      diagnostic: "Safe policy and source fingerprints are required before selected-result handoff readiness diagnostics.",
      policyFingerprint: policyFingerprint || null,
      sourceFingerprint: sourceFingerprint || null,
    };
  }
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function validateFingerprintMatch(summary, policyFingerprint, sourceFingerprint, label) {
  const ownPolicy = policyFingerprintFrom(summary);
  const ownSource = sourceFingerprintFrom(summary);
  if ((ownPolicy && ownPolicy !== policyFingerprint) || (ownSource && ownSource !== sourceFingerprint)) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${label} fingerprint does not match the selected-result handoff scaffold fingerprints.` };
  }
  if (ownPolicy && !ownSource) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${label} has a policy fingerprint without a matching source fingerprint.` };
  }
  if (ownSource && !ownPolicy) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${label} has a source fingerprint without a matching policy fingerprint.` };
  }
  return { ok: true };
}

function validateRequiredSummary(spec, summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} is required.` };
  }
  const unsafe = unsafeBlocker(summary);
  if (unsafe) {
    return { ok: false, blocker: unsafe, diagnostic: `${spec.label} contains an unsafe raw result, raw payload, raw row, exact electrical, donor Engine, persistence, generation, route, endpoint, write, or mutation marker.` };
  }
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: spec.notReady, diagnostic: `${spec.label} must be an ok runtime-native diagnostic-only safe summary.` };
  }
  const fingerprintCheck = validateFingerprintMatch(summary, policyFingerprint, sourceFingerprint, spec.label);
  if (!fingerprintCheck.ok) return fingerprintCheck;
  if (summary[spec.readyKey] !== true) {
    return { ok: false, blocker: spec.notReady, diagnostic: `${spec.label} is not ready: ${spec.readyKey} is not true.` };
  }
  return { ok: true };
}

function projectionState(summary) {
  return safeToken(firstPresent(summary, ["state", "resultState", "sourceState"]), "unknown");
}

function validateSelectedResultProjectionSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "missing-selected-result-projection-summary", diagnostic: "A safe selected-result projection summary is required." };
  }
  const body = selectedBodyBlocker(summary);
  if (body) return { ok: false, blocker: body, diagnostic: "Selected-result projection summary contains a selected-result body/object, which is not approved in this scaffold." };
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: "Selected-result projection summary contains unsafe raw result, raw payload, row, exact electrical, persistence, generation, route, endpoint, write, or mutation markers." };

  const flags = isPlainObject(summary.safetyFlags) ? summary.safetyFlags : {};
  const readOnly = summary.readOnly !== false && flags.readOnly !== false;
  const displayOnly = summary.displayOnly !== false && flags.displayOnly !== false;
  const writesDisabled = summary.writes !== true && summary.generation !== true && summary.proof !== true;
  const selectedResultAvailable = summary.selectedResultAvailable === true || summary.sourceAvailable === true;
  const state = projectionState(summary);
  const stateLooksSafe = [
    "selected-accepted",
    "adapter-selected-result-available",
    "selected_accepted",
    "estimated-preview",
    "no-selected-result",
    "no_selected_result",
  ].includes(state);
  const fingerprint = selectedProjectionFingerprint(summary);
  const fingerprintCheck = validateFingerprintMatch(summary, policyFingerprint, sourceFingerprint, "selected-result projection summary");
  if (!fingerprintCheck.ok) return fingerprintCheck;
  if (!readOnly || !displayOnly || !writesDisabled || !stateLooksSafe || !fingerprint) {
    return { ok: false, blocker: "unsafe-selected-result-projection-summary", diagnostic: "Selected-result projection summary must be read-only, display-only, write-disabled, safely stated, and fingerprint-bearing." };
  }
  return {
    ok: true,
    state,
    selectedResultAvailable,
    fingerprint,
  };
}

function validateSafeSelectedResultSourceObjectSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "selected-result-body-not-approved", diagnostic: "A safe selected-result source object summary is required before handoff readiness can be reported." };
  }
  const body = selectedBodyBlocker(summary);
  if (body) return { ok: false, blocker: body, diagnostic: "Safe selected-result source object summary contains a result body/object, which is not approved in this scaffold." };
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: "Safe selected-result source object summary contains unsafe raw result, raw payload, row, exact electrical, persistence, generation, route, endpoint, write, or mutation markers." };
  const fingerprintCheck = validateFingerprintMatch(summary, policyFingerprint, sourceFingerprint, "safe selected-result source object summary");
  if (!fingerprintCheck.ok) return fingerprintCheck;
  if (summary.persistenceStatus?.selectedResultPersisted === true
    || summary.persistenceStatus?.selectedResultPersistenceEnabled === true
    || summary.safetyFlags?.selectedResultPersistenceEnabled === true) {
    return { ok: false, blocker: "selected-result-persistence-not-approved", diagnostic: "Safe selected-result source object summary attempted or enabled selected-result persistence." };
  }
  return {
    ok: true,
    state: summary.ok === true ? "safe-source-object-summary-ready" : "safe-source-object-summary-not-ready",
    fingerprint: summaryFingerprint(summary),
  };
}

function handoffReadinessSummary(extra = {}) {
  return {
    diagnosticOnly: true,
    selectedResultHandoffScaffoldReady: extra.ready === true,
    sealedCandidateAssemblyPreviewReady: extra.sealedCandidateAssemblyPreviewReady === true,
    runTableDomainOutputScaffoldReady: extra.runTableDomainOutputScaffoldReady === true,
    gateDScaffoldReady: extra.gateDScaffoldReady === true,
    selectedResultProjectionReady: extra.selectedResultProjectionReady === true,
    safeSelectedResultSourceObjectReady: extra.safeSelectedResultSourceObjectReady === true,
    selectedResultProjectionState: extra.selectedResultProjectionState || "unknown",
    safeSelectedResultSourceState: extra.safeSelectedResultSourceState || "unknown",
    staleComparisonReady: false,
    staleComparisonBlocker: "stale-comparison-not-implemented",
    selectedResultPersistenceReady: false,
    productionRunTableReady: false,
    runTableReady: false,
    iesReady: false,
    donorEngineReady: false,
    rawOutputReady: false,
    reason: extra.reason || (extra.ready === true
      ? "selected-result-handoff-readiness-summary-only-persistence-and-generation-blocked"
      : "selected-result-handoff-scaffold-not-ready"),
  };
}

function baseSummary(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return {
    schemaId: ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok,
    blocker,
    selectedResultHandoffScaffoldReady: ok,
    selectedResultProjectionState: extra.selectedResultProjectionState || "unknown",
    safeSelectedResultSourceState: extra.safeSelectedResultSourceState || "unknown",
    handoffReadinessSummary: extra.handoffReadinessSummary || handoffReadinessSummary({ reason: blocker || null }),
    staleState: extra.staleState || "not_compared_fail_closed",
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    upstreamFingerprints: isPlainObject(extra.upstreamFingerprints) ? extra.upstreamFingerprints : {},
    selectedResultHandoffScaffoldFingerprint: extra.selectedResultHandoffScaffoldFingerprint || null,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    exactElectricalValuesReturned: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseSummary({
    ...extra,
    ok: false,
    blocker,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

export function buildRuntimeSelectedResultHandoffScaffoldSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const fingerprintValidation = resolveFingerprints(source);
  const policyFingerprint = fingerprintValidation.policyFingerprint
    || safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || null;
  const sourceFingerprint = fingerprintValidation.sourceFingerprint
    || safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || null;
  const upstreamFingerprints = buildUpstreamFingerprints(source);

  const topLevelUnsafe = unsafeBlocker({
    ...source,
    sealedCandidateAssemblyPreviewSummary: undefined,
    runTableDomainOutputScaffoldSummary: undefined,
    gateDValidationScaffoldSummary: undefined,
    selectedResultProjectionSummary: undefined,
    safeSelectedResultSourceObjectSummary: undefined,
  });
  if (topLevelUnsafe) {
    return failClosed(topLevelUnsafe, "Selected-result handoff scaffold input contains unsafe top-level raw result, raw payload, row, exact electrical, donor Engine, persistence, generation, route, endpoint, write, or mutation markers.", {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  if (!fingerprintValidation.ok) {
    return failClosed(fingerprintValidation.blocker, fingerprintValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  const requiredReadiness = {};
  for (const spec of REQUIRED_SUMMARIES) {
    const validation = validateRequiredSummary(spec, source[spec.key], policyFingerprint, sourceFingerprint);
    requiredReadiness[spec.key] = validation.ok === true;
    if (!validation.ok) {
      return failClosed(validation.blocker, validation.diagnostic, {
        policyFingerprint,
        sourceFingerprint,
        upstreamFingerprints,
        handoffReadinessSummary: handoffReadinessSummary({
          reason: validation.blocker,
          sealedCandidateAssemblyPreviewReady: source.sealedCandidateAssemblyPreviewSummary?.sealedCandidateAssemblyPreviewReady === true,
          runTableDomainOutputScaffoldReady: source.runTableDomainOutputScaffoldSummary?.runTableDomainOutputScaffoldReady === true,
          gateDScaffoldReady: source.gateDValidationScaffoldSummary?.gateDScaffoldReady === true,
        }),
      });
    }
  }

  const projectionValidation = validateSelectedResultProjectionSummary(
    source.selectedResultProjectionSummary,
    policyFingerprint,
    sourceFingerprint,
  );
  if (!projectionValidation.ok) {
    return failClosed(projectionValidation.blocker, projectionValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      selectedResultProjectionState: projectionState(source.selectedResultProjectionSummary),
      handoffReadinessSummary: handoffReadinessSummary({
        reason: projectionValidation.blocker,
        sealedCandidateAssemblyPreviewReady: true,
        runTableDomainOutputScaffoldReady: true,
        gateDScaffoldReady: true,
      }),
    });
  }

  const sourceObjectValidation = validateSafeSelectedResultSourceObjectSummary(
    source.safeSelectedResultSourceObjectSummary,
    policyFingerprint,
    sourceFingerprint,
  );
  if (!sourceObjectValidation.ok) {
    return failClosed(sourceObjectValidation.blocker, sourceObjectValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      selectedResultProjectionState: projectionValidation.state,
      safeSelectedResultSourceState: sourceObjectValidation.state || "safe-source-object-summary-failed-closed",
      handoffReadinessSummary: handoffReadinessSummary({
        reason: sourceObjectValidation.blocker,
        sealedCandidateAssemblyPreviewReady: true,
        runTableDomainOutputScaffoldReady: true,
        gateDScaffoldReady: true,
        selectedResultProjectionReady: true,
      }),
    });
  }

  const selectedResultProjectionState = projectionValidation.state;
  const safeSelectedResultSourceState = sourceObjectValidation.state;
  const readiness = handoffReadinessSummary({
    ready: true,
    sealedCandidateAssemblyPreviewReady: true,
    runTableDomainOutputScaffoldReady: true,
    gateDScaffoldReady: true,
    selectedResultProjectionReady: true,
    safeSelectedResultSourceObjectReady: true,
    selectedResultProjectionState,
    safeSelectedResultSourceState,
  });
  const fingerprintPayload = {
    schemaId: ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_VERSION,
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    selectedResultProjectionState,
    safeSelectedResultSourceState,
    handoffReadinessSummary: readiness,
    staleState: "not_compared_fail_closed",
  };
  const selectedResultHandoffScaffoldFingerprint = `safe-selected-result-handoff-scaffold:${stableSha1(fingerprintPayload)}`;

  return baseSummary({
    ok: true,
    selectedResultProjectionState,
    safeSelectedResultSourceState,
    handoffReadinessSummary: readiness,
    staleState: "not_compared_fail_closed",
    warnings: [
      "Diagnostic-only selected-result handoff scaffold: safe selected-result handoff readiness was emitted, but selected-result persistence remains disabled.",
      "Stale comparison is not implemented; staleState is not_compared_fail_closed until a future safe comparison exists.",
      "No donor Engine result is adapted; donor Engine invocation, raw result/payload exposure, production RunTable generation, IES generation, routes, POST endpoints, RuntimeData mutation, HubSpot writes, and project writes remain disabled.",
    ],
    failClosedDiagnostics: ["stale-comparison-not-implemented"],
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    selectedResultHandoffScaffoldFingerprint,
  });
}

export const buildRuntimeNativeSelectedResultHandoffScaffoldSummary = buildRuntimeSelectedResultHandoffScaffoldSummary;
export const buildEngineRunTableSelectedResultHandoffScaffoldStatus = buildRuntimeSelectedResultHandoffScaffoldSummary;
