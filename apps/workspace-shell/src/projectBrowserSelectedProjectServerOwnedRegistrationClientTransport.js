import {
  PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES,
} from "../../../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js";
import { validateCsSelectorPreEngineActionEligibilityProjection } from "../../../packages/workspace-kernel/projectEnvelope.js";
import { buildSelectorReadonlyEngineCandidateForInternalSeam } from "../../../packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js";
import { buildSelectorPreEngineReadonlyActionEligibilityProjection } from "../../../packages/modules/cs-selector/selectorViewModel.js";

export const SHELL_PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_CLIENT_TRANSPORT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SERVER-OWNED-RUNTIME-SAVED-SELECTED-PROJECT-REGISTRATION-CLIENT-TRANSPORT-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-server-owned-registration-client.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES =
  Object.freeze({
    registered:
      "shell_project_browser_selected_project_server_owned_registration_client_registered",
    unavailable:
      "shell_project_browser_selected_project_server_owned_registration_client_unavailable",
    blockedFailClosed:
      "shell_project_browser_selected_project_server_owned_registration_client_blocked_fail_closed",
  });

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_REQUEST_FIELD_ORDER =
  Object.freeze([
    "localSave",
    "registrationSessionId",
    "clientSaveOrdinal",
    "localRevisionId",
  ]);

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "owner",
    "state",
    "readiness",
    "ok",
    "failClosed",
    "blocker",
    "projectId",
    "localEnvelopeId",
    "localSavedAt",
    "localRevisionId",
    "serverEnvelopeId",
    "serverRevisionId",
    "supersededServerRevisionId",
    "requestValidated",
    "requestDispatched",
    "responseReceived",
    "responseValidated",
    "httpStatus",
    "serverRequestAccepted",
    "preEngineActionSourceReady",
    "candidateReconstructionPreflightEligible",
    "preEngineEligibilityProjectionFingerprint",
    "serverOwned",
    "envelopeConstructedServerSide",
    "envelopeValidated",
    "retainedInProcessMemory",
    "activeRevision",
    "sameOrigin",
    "scalarAcknowledgementOnly",
    "projectEnvelopeSent",
    "projectEnvelopeReturned",
    "enginePayloadSent",
    "enginePayloadReturned",
    "privateCandidateSent",
    "privateCandidateReturned",
    "databasePathSent",
    "databasePathReturned",
    "filePathSent",
    "filePathReturned",
    "sourcePathSent",
    "sourcePathReturned",
    "engineOptionsSent",
    "engineOptionsReturned",
    "filesystemPersistenceEnabled",
  ]);

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:@+-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const FORBIDDEN_SOURCE_KEY_PATTERN =
  /^(?:projectEnvelope|completedEnvelope|enginePayload|rawEnginePayload|rawEngineResult|privateCandidate|candidatePayload|database|databasePath|dbPath|filePath|sourcePath|privatePath|runtimeData|engineOptions|options)$/i;
const LEGACY_STAGE3_ACTION_SOURCE_KEYS = Object.freeze([
  "factoryApprovedInputsSummary",
  "committedSelectorConstraints",
  "lmTemperatureReadinessPreview",
]);
const LEGACY_STAGE3_REQUIRED_FALSE_FLAGS = Object.freeze([
  "engineExecuted",
  "donorEngineInvoked",
  "runTableGenerated",
  "iesGenerated",
  "selectedResultPersisted",
  "runtimeDataMutated",
  "rawRowsExposed",
  "rawEnginePayloadExposed",
  "routesAdded",
  "postEndpointsAdded",
]);
const CLIENT_TIER_CONSTRAINT_KEYS = Object.freeze(new Set([
  "tier",
  "selectedtier",
  "tiertoken",
]));
const TIER_ONLY_ELIGIBILITY_BLOCKERS = Object.freeze(new Set([
  "missing-readonly-engine-candidate-input-tier",
  "missing-candidate-field-tier",
]));
const REQUIRED_SERVER_TRUE_FLAGS = Object.freeze([
  "requestAccepted",
  "preEngineActionSourceReady",
  "candidateReconstructionPreflightEligible",
  "serverOwned",
  "envelopeConstructedServerSide",
  "envelopeValidated",
  "retainedInProcessMemory",
  "activeRevision",
]);
const REQUIRED_SERVER_FALSE_FLAGS = Object.freeze([
  "filesystemPersistenceEnabled",
  "projectEnvelopeReturned",
  "enginePayloadReturned",
  "privateCandidateReturned",
  "databasePathReturned",
  "filePathReturned",
  "sourcePathReturned",
  "engineOptionsReturned",
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length === expectedKeys.length
    && expectedKeys.every((key, index) => keys[index] === key);
}

function hasExactKeySet(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return keys.length === expected.length
    && keys.every((key, index) => key === expected[index]);
}

function safeToken(value, fallback = null) {
  if (typeof value !== "string") return fallback;
  if (!value || value !== value.trim() || !SAFE_TOKEN_PATTERN.test(value)) return fallback;
  return value;
}

function isSafeScalar(value) {
  return value === null
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isSafeInteger(value))
    || (typeof value === "string"
      && value.length <= 1000
      && !PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value));
}

function orderedObject(order, fields) {
  return Object.fromEntries(order.map((key) => [key, fields[key]]));
}

function clonePlain(value, depth = 0) {
  if (depth > 40) throw new Error("selected-project-registration-client-source-depth-invalid");
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => clonePlain(item, depth + 1));
  if (!isPlainObject(value)) {
    throw new Error("selected-project-registration-client-source-non-plain");
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, clonePlain(nested, depth + 1)]),
  );
}

function inspectSourceValue(value, depth = 0, seen = new Set()) {
  if (depth > 40) return "selected-project-registration-client-source-depth-invalid";
  if (typeof value === "string") {
    if (value.length > 8000) return "selected-project-registration-client-source-string-too-long";
    return PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value)
      ? "selected-project-registration-client-source-private-or-output-value-refused"
      : null;
  }
  if (value === null || typeof value === "boolean") return null;
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? null
      : "selected-project-registration-client-source-number-invalid";
  }
  if (typeof value !== "object") {
    return "selected-project-registration-client-source-type-invalid";
  }
  if (seen.has(value)) return "selected-project-registration-client-source-cycle-refused";
  seen.add(value);
  if (Array.isArray(value)) {
    for (const nested of value) {
      const blocker = inspectSourceValue(nested, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return "selected-project-registration-client-source-non-plain";
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_SOURCE_KEY_PATTERN.test(key)) {
      return `selected-project-registration-client-source-forbidden-key-${key}`;
    }
    const blocker = inspectSourceValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function projectProjection(envelope) {
  const project = isPlainObject(envelope?.project) ? envelope.project : {};
  const metadata = isPlainObject(project.metadata) ? project.metadata : {};
  const currentProject = isPlainObject(project.currentProject) ? project.currentProject : {};
  const selection = isPlainObject(project.selection) ? project.selection : {};
  return orderedObject(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
    {
      metadata: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
        {
          projectId: metadata.projectId ?? envelope?.projectId ?? null,
          title: metadata.title ?? envelope?.title ?? "Untitled project",
          readiness: metadata.readiness ?? "not-ready",
          source: metadata.source ?? "unknown",
          browserReady: metadata.browserReady === true,
          browserStatus: metadata.browserStatus ?? "unknown",
          restoredFromEnvelope: metadata.restoredFromEnvelope === true,
          restoredAt: metadata.restoredAt ?? null,
          restoredEnvelopeId: metadata.restoredEnvelopeId ?? null,
        },
      ),
      currentProject: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
        {
          projectId: currentProject.projectId ?? envelope?.projectId ?? null,
          title: currentProject.title ?? envelope?.title ?? "Untitled project",
          client: currentProject.client ?? envelope?.client ?? "No client loaded",
          site: currentProject.site ?? envelope?.site ?? "No site loaded",
          readiness: currentProject.readiness ?? "not-ready",
          source: currentProject.source ?? "unknown",
        },
      ),
      selection: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
        {
          owner: selection.owner ?? "shell",
          selectedProjectId: selection.selectedProjectId ?? envelope?.projectId ?? null,
          selectedAt: selection.selectedAt ?? null,
          source: selection.source ?? "unknown",
          restoredEnvelopeId: selection.restoredEnvelopeId ?? null,
        },
      ),
    },
  );
}

function savedByProjection(envelope) {
  const savedBy = isPlainObject(envelope?.savedBy) ? envelope.savedBy : {};
  return orderedObject(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
    {
      identityState: savedBy.identityState ?? "external_anonymous",
      classification: savedBy.classification ?? "anonymous",
      actualRole: savedBy.actualRole ?? "external_user",
      derivedActualRole: savedBy.derivedActualRole ?? savedBy.actualRole ?? "external_user",
      actualRoleSource: savedBy.actualRoleSource ?? "unknown",
      displayRole: savedBy.displayRole ?? "external_user",
      displayRoleClamped: savedBy.displayRoleClamped === true,
      name: savedBy.name ?? "Workspace User",
      email: savedBy.email ?? null,
    },
  );
}

function normalisedConstraintKey(value) {
  return safeToken(String(value || ""), "")?.toLowerCase().replace(/[^0-9a-z]/g, "") || "";
}

function withoutClientTierConstraints(constraints = []) {
  return (Array.isArray(constraints) ? constraints : [])
    .filter((constraint) => !CLIENT_TIER_CONSTRAINT_KEYS.has(
      normalisedConstraintKey(constraint?.fieldKey),
    ));
}

function isTierOnlyEligibilityBlocker(value) {
  return TIER_ONLY_ELIGIBILITY_BLOCKERS.has(safeToken(value, ""));
}

function normaliseFactoryForServerOwnedTier(factory = {}, committedSelectorConstraints = []) {
  const tierOnlyBlocked = isTierOnlyEligibilityBlocker(
    factory?.readonlyEngineCandidateInputsBlocker || factory?.blocker,
  );
  const alreadyReady = factory?.factoryApprovedInputsReady === true
    && factory?.stage2Ready === true
    && factory?.blocker === null;
  if (!alreadyReady && !tierOnlyBlocked) {
    return { ok: false, blocker: safeToken(factory?.blocker, "selector-pre-engine-candidate-inputs-not-ready"), factory: null };
  }
  return {
    ok: true,
    blocker: null,
    factory: {
      ...factory,
      factoryApprovedInputsReady: true,
      ready: true,
      stage2Ready: true,
      blocker: null,
      committedSelectorConstraintCount: committedSelectorConstraints.length,
    },
  };
}

function rebuildTierNeutralEligibilityProjection({
  factoryApprovedInputsSummary = {},
  committedSelectorConstraints = [],
  lmTemperatureReadinessPreview = {},
  sourceInputFingerprint = null,
  boardDataSourceVersion = null,
  runCount = null,
  totalQuantity = null,
  accessoryIntentCount = null,
} = {}) {
  const tierNeutralConstraints = withoutClientTierConstraints(committedSelectorConstraints);
  const normalisedFactory = normaliseFactoryForServerOwnedTier(
    factoryApprovedInputsSummary,
    tierNeutralConstraints,
  );
  if (!normalisedFactory.ok) {
    return { blocker: normalisedFactory.blocker, projection: null };
  }
  const mapper = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary: normalisedFactory.factory,
    committedSelectorConstraints: tierNeutralConstraints,
    lmTemperatureReadinessPreview,
  });
  if (mapper?.ok !== true) {
    return {
      blocker: safeToken(mapper?.summary?.blocker, "selected-project-registration-client-candidate-preflight-ineligible"),
      projection: null,
    };
  }
  const run = normalisedFactory.factory.committedRunIntakeSummary || {};
  const projectedFactory = {
    ...normalisedFactory.factory,
    runIntakePreviewSummary: {
      runIntakePreviewReady: true,
      runCount: Number.isSafeInteger(runCount) ? runCount : 1,
      totalQuantity: Number.isSafeInteger(totalQuantity) ? totalQuantity : Number(run.runQuantity || 0),
    },
    accessoryPlacementIntentSummary: {
      accessoryIntentCount: Number.isSafeInteger(accessoryIntentCount) ? accessoryIntentCount : 0,
    },
    accessoryReservationRequired: false,
    engineOutcomeProven: false,
  };
  const projection = buildSelectorPreEngineReadonlyActionEligibilityProjection({
    specBuildReadinessPreview: {
      factoryApprovedInputsReady: true,
      factoryApprovedInputsSummary: projectedFactory,
      readonlyEngineCandidateReady: true,
      readonlyEngineCandidateMapperSummary: mapper.summary,
    },
    committedSelectorConstraints: tierNeutralConstraints,
    lmTemperatureReadinessPreview,
    sourceInputFingerprint,
    boardDataSourceVersion,
  });
  const validation = validateCsSelectorPreEngineActionEligibilityProjection(
    projection,
    { requireReady: true, requireFrozen: true },
  );
  return validation.valid === true
    ? { blocker: null, projection }
    : {
      blocker: safeToken(projection?.blocker, "selected-project-registration-client-tier-neutral-projection-invalid"),
      projection: null,
    };
}

function buildLegacyStage3PreEngineProjection(envelope) {
  const selectorModule = envelope?.modules?.cs_selector;
  const source = selectorModule?.state?.engineRunActionSource;
  if (!hasExactKeySet(source, LEGACY_STAGE3_ACTION_SOURCE_KEYS)) {
    return {
      blocker: "selected-project-registration-client-legacy-stage3-source-invalid",
      projection: null,
    };
  }
  const sourceBlocker = inspectSourceValue(source);
  if (sourceBlocker) return { blocker: sourceBlocker, projection: null };

  const factory = source.factoryApprovedInputsSummary;
  const run = factory?.committedRunIntakeSummary;
  const constraints = source.committedSelectorConstraints;
  const lmPreview = source.lmTemperatureReadinessPreview;
  const factoryReadyOrTierOnlyBlocked = factory?.factoryApprovedInputsReady === true
    || isTierOnlyEligibilityBlocker(
      factory?.readonlyEngineCandidateInputsBlocker || factory?.blocker,
    );
  const legacySourceReady = isPlainObject(factory)
    && isPlainObject(run)
    && Array.isArray(constraints)
    && constraints.length > 0
    && constraints.length <= 256
    && isPlainObject(lmPreview)
    && factory.readOnly === true
    && factory.diagnosticOnly === true
    && factory.safeSummaryOnly === true
    && factoryReadyOrTierOnlyBlocked
    && factory.stage3Mode === "simple-run-stage3a-zero-accessory"
    && LEGACY_STAGE3_REQUIRED_FALSE_FLAGS.every((key) => factory[key] === false)
    && run.ready === true
    && run.committedRunIntakeReady === true
    && typeof run.sourceAuthority === "string"
    && run.sourceAuthority.length > 0
    && Number.isSafeInteger(run.runQuantity)
    && run.runQuantity > 0
    && Number.isSafeInteger(run.runLengthMm)
    && run.runLengthMm > 0
    && typeof run.lengthMode === "string"
    && run.lengthMode.length > 0
    && constraints.every((constraint) => (
      isPlainObject(constraint)
      && constraint.committedSelectorState === true
      && constraint.blocked !== true
      && typeof constraint.fieldKey === "string"
      && constraint.fieldKey.length > 0
      && typeof (constraint.value || constraint.valueLabel) === "string"
      && String(constraint.value || constraint.valueLabel).length > 0
    ));
  if (!legacySourceReady) {
    return {
      blocker: safeToken(
        factory?.readonlyEngineCandidateInputsBlocker || factory?.blocker,
        "selected-project-registration-client-legacy-stage3-source-not-ready",
      ),
      projection: null,
    };
  }

  return rebuildTierNeutralEligibilityProjection({
    factoryApprovedInputsSummary: factory,
    committedSelectorConstraints: constraints,
    lmTemperatureReadinessPreview: lmPreview,
    runCount: 1,
    totalQuantity: run.runQuantity,
    accessoryIntentCount: 0,
  });
}

function buildSourceProjection(envelope) {
  const downstream = envelope?.modules?.cs_selector?.downstreamContext;
  const declaredProjection = downstream?.preEngineActionEligibilityProjection;
  let tierNeutralProjection;

  if (declaredProjection === null || declaredProjection === undefined) {
    const legacyProjection = buildLegacyStage3PreEngineProjection(envelope);
    if (legacyProjection.blocker) {
      return { blocker: legacyProjection.blocker, sourceProjection: null };
    }
    tierNeutralProjection = legacyProjection.projection;
  } else {
    const declaredBlocker = inspectSourceValue(declaredProjection);
    if (declaredBlocker) {
      return { blocker: declaredBlocker, sourceProjection: null };
    }
    const declaredValidation = validateCsSelectorPreEngineActionEligibilityProjection(
      declaredProjection,
      { requireReady: false },
    );
    if (declaredValidation.valid !== true) {
      return {
        blocker: "selected-project-registration-client-pre-engine-eligibility-shape-invalid",
        sourceProjection: null,
      };
    }
    if (declaredProjection.ready !== true
      && !isTierOnlyEligibilityBlocker(declaredProjection.blocker)
      && !isTierOnlyEligibilityBlocker(
        declaredProjection.factoryApprovedInputsSummary?.blocker,
      )) {
      return {
        blocker: safeToken(
          declaredProjection.blocker,
          "selected-project-registration-client-pre-engine-eligibility-not-ready",
        ),
        sourceProjection: null,
      };
    }
    const rebuilt = rebuildTierNeutralEligibilityProjection({
      factoryApprovedInputsSummary: declaredProjection.factoryApprovedInputsSummary,
      committedSelectorConstraints: declaredProjection.committedSelectorConstraints,
      lmTemperatureReadinessPreview: declaredProjection.lmTemperatureReadinessPreview,
      sourceInputFingerprint: declaredProjection.sourceInputFingerprint,
      boardDataSourceVersion: declaredProjection.boardDataSourceVersion,
      runCount: declaredProjection.runCount,
      totalQuantity: declaredProjection.totalQuantity,
      accessoryIntentCount: declaredProjection.accessoryIntentCount,
    });
    if (rebuilt.blocker) {
      return { blocker: rebuilt.blocker, sourceProjection: null };
    }
    tierNeutralProjection = rebuilt.projection;
  }

  const sourceProjection = orderedObject(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
    {
      project: projectProjection(envelope),
      savedBy: savedByProjection(envelope),
      contractVersion: envelope?.shell?.contractVersion ?? "not-declared",
      selectorModule: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
        {
          status: envelope?.modules?.cs_selector?.status ?? "saved-ui-state",
          preEngineActionEligibilityProjection: clonePlain(tierNeutralProjection),
          selectedResultSummary: null,
          runTableFirstNarrowOutputSummary: null,
        },
      ),
    },
  );
  const blocker = inspectSourceValue(sourceProjection);
  return { blocker, sourceProjection: blocker ? null : sourceProjection };
}

function orderedResult(fields) {
  return Object.freeze(Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function clientResult({
  state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
    .blockedFailClosed,
  blocker = "selected-project-registration-client-blocked",
  projectId = null,
  localEnvelopeId = null,
  localSavedAt = null,
  localRevisionId = null,
  serverEnvelopeId = null,
  serverRevisionId = null,
  supersededServerRevisionId = null,
  requestValidated = false,
  requestDispatched = false,
  responseReceived = false,
  responseValidated = false,
  httpStatus = null,
  serverRequestAccepted = false,
  preEngineActionSourceReady = false,
  candidateReconstructionPreflightEligible = false,
  preEngineEligibilityProjectionFingerprint = null,
  envelopeConstructedServerSide = false,
  envelopeValidated = false,
  activeRevision = false,
} = {}) {
  const registered = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES.registered
    && preEngineActionSourceReady
    && candidateReconstructionPreflightEligible;
  return orderedResult({
    schemaId:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_ID,
    schemaVersion:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_VERSION,
    contractId:
      SHELL_PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_CLIENT_TRANSPORT_ID,
    owner: "shell-browser-client",
    state,
    readiness: registered
      ? "registered"
      : state
          === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .unavailable
        ? "unavailable"
        : "blocked_fail_closed",
    ok: registered,
    failClosed: !registered,
    blocker: registered ? null : safeToken(blocker, "selected-project-registration-client-blocked"),
    projectId: safeToken(projectId),
    localEnvelopeId: safeToken(localEnvelopeId),
    localSavedAt: typeof localSavedAt === "string" ? localSavedAt : null,
    localRevisionId: safeToken(localRevisionId),
    serverEnvelopeId: safeToken(serverEnvelopeId),
    serverRevisionId: safeToken(serverRevisionId),
    supersededServerRevisionId: safeToken(supersededServerRevisionId),
    requestValidated,
    requestDispatched,
    responseReceived,
    responseValidated,
    httpStatus: Number.isSafeInteger(httpStatus) ? httpStatus : null,
    serverRequestAccepted,
    preEngineActionSourceReady: registered,
    candidateReconstructionPreflightEligible: registered,
    preEngineEligibilityProjectionFingerprint: registered
      ? safeToken(preEngineEligibilityProjectionFingerprint)
      : null,
    serverOwned: registered,
    envelopeConstructedServerSide,
    envelopeValidated,
    retainedInProcessMemory: registered,
    activeRevision,
    sameOrigin: true,
    scalarAcknowledgementOnly: true,
    projectEnvelopeSent: false,
    projectEnvelopeReturned: false,
    enginePayloadSent: false,
    enginePayloadReturned: false,
    privateCandidateSent: false,
    privateCandidateReturned: false,
    databasePathSent: false,
    databasePathReturned: false,
    filePathSent: false,
    filePathReturned: false,
    sourcePathSent: false,
    sourcePathReturned: false,
    engineOptionsSent: false,
    engineOptionsReturned: false,
    filesystemPersistenceEnabled: false,
  });
}

function validateClientRequest(request) {
  if (!hasExactKeys(
    request,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_REQUEST_FIELD_ORDER,
  )) return "selected-project-registration-client-request-shape-invalid";
  if (!isPlainObject(request.localSave)
    || !isPlainObject(request.localSave.envelope)
    || request.localSave.accepted !== true) {
    return "selected-project-registration-client-local-save-invalid";
  }
  const envelope = request.localSave.envelope;
  if (safeToken(envelope.projectId) !== envelope.projectId
    || safeToken(envelope.envelopeId) !== envelope.envelopeId
    || typeof envelope.savedAt !== "string"
    || envelope.source !== "p2-shell-save-envelope"
    || envelope.readOnly === true
    || envelope.browserOnly === true) {
    return "selected-project-registration-client-local-envelope-invalid";
  }
  if (safeToken(request.registrationSessionId) !== request.registrationSessionId
    || !Number.isSafeInteger(request.clientSaveOrdinal)
    || request.clientSaveOrdinal < 1
    || safeToken(request.localRevisionId) !== request.localRevisionId) {
    return "selected-project-registration-client-revision-identity-invalid";
  }
  return null;
}

function buildTransportRequest(request, sourceProjection) {
  const envelope = request.localSave.envelope;
  const fields = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
    schemaVersion:
      PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
    contractId:
      PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
    requestKind: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
    registrationSessionId: request.registrationSessionId,
    clientSaveOrdinal: request.clientSaveOrdinal,
    localRevisionId: request.localRevisionId,
    localProjectId: envelope.projectId,
    localEnvelopeId: envelope.envelopeId,
    localSavedAt: envelope.savedAt,
    sourceProjection,
  };
  return Object.freeze(Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function validateResponseBody(body, request) {
  if (!hasExactKeys(
    body,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  ) || !Object.values(body).every(isSafeScalar)) {
    return "selected-project-registration-client-response-shape-invalid";
  }
  if (body.schemaId !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID
    || body.schemaVersion
      !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION
    || body.contractId
      !== PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID) {
    return "selected-project-registration-client-response-schema-mismatch";
  }
  const envelope = request.localSave.envelope;
  if (body.projectId !== envelope.projectId
    || body.localEnvelopeId !== envelope.envelopeId
    || body.localSavedAt !== envelope.savedAt
    || body.localRevisionId !== request.localRevisionId) {
    return "selected-project-registration-client-response-local-revision-mismatch";
  }
  const registered = body.state
    === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered;
  const unavailable = body.state
    === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.unavailable;
  if (!registered && !unavailable && body.state
      !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.blockedFailClosed) {
    return "selected-project-registration-client-response-state-invalid";
  }
  if (registered) {
    for (const key of REQUIRED_SERVER_TRUE_FLAGS) {
      if (body[key] !== true) {
        return `selected-project-registration-client-response-required-flag-not-true-${key}`;
      }
    }
    for (const key of REQUIRED_SERVER_FALSE_FLAGS) {
      if (body[key] !== false) {
        return `selected-project-registration-client-response-required-flag-not-false-${key}`;
      }
    }
    if (body.readiness !== "registered"
      || body.ok !== true
      || body.failClosed !== false
      || body.blocker !== null
      || safeToken(body.serverEnvelopeId) === null
      || safeToken(body.serverRevisionId) === null
      || safeToken(body.preEngineEligibilityProjectionFingerprint) === null) {
      return "selected-project-registration-client-response-registered-contract-invalid";
    }
    return null;
  }
  if (body.ok !== false
    || body.failClosed !== true
    || safeToken(body.blocker) === null
    || body.activeRevision !== false) {
    return "selected-project-registration-client-response-fail-closed-contract-invalid";
  }
  return null;
}

export function createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
  fetchImpl = null,
} = {}) {
  return async function registerRuntimeSavedSelectedProject(request = null) {
    const requestBlocker = validateClientRequest(request);
    const envelope = request?.localSave?.envelope;
    if (requestBlocker) {
      return clientResult({
        blocker: requestBlocker,
        projectId: envelope?.projectId,
        localEnvelopeId: envelope?.envelopeId,
        localSavedAt: envelope?.savedAt,
        localRevisionId: request?.localRevisionId,
      });
    }

    const projection = buildSourceProjection(envelope);
    if (projection.blocker) {
      return clientResult({
        blocker: projection.blocker,
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
      });
    }

    const browserFetch = typeof fetchImpl === "function" ? fetchImpl : globalThis.fetch;
    if (typeof browserFetch !== "function") {
      return clientResult({
        state:
          SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .unavailable,
        blocker: "selected-project-registration-client-fetch-unavailable",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
      });
    }

    const transportRequest = buildTransportRequest(request, projection.sourceProjection);
    let httpResponse;
    try {
      httpResponse = await browserFetch(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
        {
          method: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
          headers: Object.freeze({
            Accept: "application/json",
            "Content-Type": "application/json",
          }),
          credentials: "same-origin",
          cache: "no-store",
          redirect: "error",
          body: JSON.stringify(transportRequest),
        },
      );
    } catch {
      return clientResult({
        blocker: "selected-project-registration-client-request-failed",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
      });
    }

    const httpStatus = Number.isSafeInteger(httpResponse?.status)
      ? httpResponse.status
      : null;
    const contentType = typeof httpResponse?.headers?.get === "function"
      ? httpResponse.headers.get("content-type")
      : null;
    if (httpResponse?.redirected === true
      || typeof httpResponse?.json !== "function"
      || typeof contentType !== "string"
      || !/^application\/json(?:;|$)/i.test(contentType.trim())) {
      return clientResult({
        blocker: "selected-project-registration-client-http-response-invalid",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    let body;
    try {
      body = await httpResponse.json();
    } catch {
      return clientResult({
        blocker: "selected-project-registration-client-response-json-invalid",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    const responseBlocker = validateResponseBody(body, request);
    if (responseBlocker) {
      return clientResult({
        blocker: responseBlocker,
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }
    const registered = body.state
      === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered;
    const expectedStatus = registered ? 200 : 422;
    if (httpStatus !== expectedStatus) {
      return clientResult({
        blocker: "selected-project-registration-client-http-status-mismatch",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        responseValidated: true,
        httpStatus,
      });
    }

    return clientResult({
      state: registered
        ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
          .registered
        : body.state
            === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.unavailable
          ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .unavailable
          : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .blockedFailClosed,
      blocker: body.blocker,
      projectId: body.projectId,
      localEnvelopeId: body.localEnvelopeId,
      localSavedAt: body.localSavedAt,
      localRevisionId: body.localRevisionId,
      serverEnvelopeId: body.serverEnvelopeId,
      serverRevisionId: body.serverRevisionId,
      supersededServerRevisionId: body.supersededServerRevisionId,
      requestValidated: true,
      requestDispatched: true,
      responseReceived: true,
      responseValidated: true,
      httpStatus,
      serverRequestAccepted: body.requestAccepted === true,
      preEngineActionSourceReady: body.preEngineActionSourceReady === true,
      candidateReconstructionPreflightEligible:
        body.candidateReconstructionPreflightEligible === true,
      preEngineEligibilityProjectionFingerprint:
        body.preEngineEligibilityProjectionFingerprint,
      envelopeConstructedServerSide: body.envelopeConstructedServerSide === true,
      envelopeValidated: body.envelopeValidated === true,
      activeRevision: body.activeRevision === true,
    });
  };
}
