import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeActivation.js";
import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary.js";
import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js";
import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";
import {
  createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js";
import { createSavedProjectEnvelope } from "../packages/workspace-kernel/projectEnvelope.js";
import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runTableFirstNarrowOutputHandoffContract.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const CONTRACT_LOCK_ID =
  "SELECTED-PROJECT-ENGINE-RUN-FIRST-LIVE-DATA-VALIDATION-CONTRACT-LOCK-1";
const PROJECT_ID = "first-live-data-validation-project";
const LOCAL_REVISION_ID = "local-revision-first-live-validation-1";
const runtimeRoot = fileURLToPath(new URL("../", import.meta.url));

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

function stage3Inputs() {
  return {
    factoryApprovedInputsSummary: {
      readOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      factoryApprovedInputsReady: true,
      stage3Mode: "simple-run-stage3a-zero-accessory",
      blocker: null,
      committedRunIntakeSummary: {
        ready: true,
        committedRunIntakeReady: true,
        sourceAuthority: "committed selector state only",
        runQuantity: 1,
        runLengthMm: 3500,
        
      },
      engineExecuted: false,
      donorEngineInvoked: false,
      runTableGenerated: false,
      iesGenerated: false,
      selectedResultPersisted: false,
      runtimeDataMutated: false,
      rawRowsExposed: false,
      rawEnginePayloadExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    committedSelectorConstraints: [
      {
        fieldKey: "tier",
        value: "Business",
        valueLabel: "Business",
        committedSelectorState: true,
        authoritySource: "acceptedDefaults",
      },
      {
        fieldKey: "directOpticVar1",
        value: "80|Inlay",
        valueLabel: "Inlay",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "targetLmPerM",
        value: "1200",
        valueLabel: "1200",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "cctCri",
        value: "4000K / CRI90",
        valueLabel: "4000K / CRI90",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "controlType",
        value: "DALI-2",
        valueLabel: "DALI-2",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
    ],
    lmTemperatureReadinessPreview: {
      previewOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      targetIntent: { direct: { ready: true, valueLabel: "1200", intentOnly: true } },
      cctCriPairing: {
        direct: { ready: true, valueLabel: "4000K / CRI90", boardBacked: true },
      },
      controlIntent: {
        direct: { ready: true, valueLabel: "DALI-2", sourceBacked: true },
      },
      fingerprint: "safe-live-validation-preview",
      donorEngineInvoked: false,
      rawRowsReturned: false,
      rawEnginePayloadReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
  };
}

function selectedResultSummary() {
  return {
    schemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    slotSchemaId: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
    slotSchemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_selected_result_summary_persisted",
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    ...AUTHORITY_STATES,
    selectedResultAuthorityGuardState: "engine_verified_selected_result_ready",
    selectedResultProjectionState: "selected_accepted",
    safeSelectedResultSourceState: "safe_selected_result_source_ready",
    selectedResultHandoffScaffoldState: "runtime_selected_result_handoff_scaffold_ready",
    policyFingerprint: "safe-policy:first-live-validation",
    sourceFingerprint: "safe-source:first-live-validation",
    sourceInputFingerprint: "safe-source-input:first-live-validation",
    sourceVersionFingerprint: "safe-source-version:first-live-validation",
    acceptedSelectedResultAuthorityGateFingerprint: "safe-authority-gate:first-live-validation",
    selectedResultPersistenceAuthorityPreflightFingerprint:
      "safe-persistence-preflight:first-live-validation",
    selectedResultPersistenceBoundaryContractFingerprint:
      "safe-persistence-boundary:first-live-validation",
    selectedResultOutputReadinessPreflightFingerprint:
      "safe-output-preflight:first-live-validation",
    selectedResultAuthorityGuardFingerprint: "safe-authority-guard:first-live-validation",
    selectedResultProjectionFingerprint: "safe-projection:first-live-validation",
    safeSelectedResultSourceObjectFingerprint: "safe-source-object:first-live-validation",
    selectedResultHandoffScaffoldFingerprint: "safe-handoff:first-live-validation",
    ...Object.fromEntries(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function runTableSummary(selectedResult) {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_runtable_first_narrow_output_summary_persisted",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceKind: "persisted-selected-result-summary",
    futureOutputKind: "runtable-first-narrow-output",
    rowsIncluded: false,
    rowCount: 0,
    generated: false,
    generationEnabled: false,
    persisted: false,
    routeAdded: false,
    postEndpointAdded: false,
    runTableFirstNarrowOutputHandoffContractState:
      "runtable_first_narrow_output_handoff_contract_ready",
    runTableFirstNarrowOutputHandoffContractReady: true,
    ...AUTHORITY_STATES,
    policyFingerprint: selectedResult.policyFingerprint,
    sourceFingerprint: selectedResult.sourceFingerprint,
    sourceInputFingerprint: selectedResult.sourceInputFingerprint,
    sourceVersionFingerprint: selectedResult.sourceVersionFingerprint,
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResult,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      "safe-selected-result-slot:first-live-validation",
    runTableFirstNarrowOutputHandoffContractFingerprint:
      "safe-runtable-handoff:first-live-validation",
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function localSave() {
  const result = selectedResultSummary();
  const base = createSavedProjectEnvelope({
    project: {
      metadata: {
        projectId: PROJECT_ID,
        title: "First Live Validation Project",
        readiness: "ready",
        source: "runtime-live-validation",
        browserReady: true,
        browserStatus: "ready",
        restoredFromEnvelope: false,
        restoredAt: null,
        restoredEnvelopeId: null,
      },
      currentProject: {
        projectId: PROJECT_ID,
        title: "First Live Validation Project",
        client: "Runtime validation",
        site: "Sydney",
        readiness: "ready",
        source: "runtime-live-validation",
      },
      selection: {
        owner: "shell",
        selectedProjectId: PROJECT_ID,
        selectedAt: "2026-07-14T04:00:00.000Z",
        source: "runtime-live-validation",
        restoredEnvelopeId: null,
      },
    },
    identity: {
      identityState: "internal_authenticated",
      classification: "internal",
      actualRole: "developer",
      derivedActualRole: "developer",
      actualRoleSource: "runtime-live-validation",
      displayRole: "developer",
      displayRoleClamped: false,
      currentUser: { name: "Runtime Validation", email: "runtime@example.com" },
    },
    contractVersion: "workspace-contract-first-live-validation",
    moduleContributions: {
      cs_selector: {
        status: "ready",
        state: { engineRunActionSource: stage3Inputs() },
      },
    },
    source: "p2-shell-save-envelope",
  });
  const envelope = {
    ...base,
    modules: {
      ...base.modules,
      cs_selector: {
        ...base.modules.cs_selector,
        downstreamContext: {
          selectedResultSummary: result,
          runTableFirstNarrowOutputSummary: runTableSummary(result),
        },
      },
    },
  };
  return { accepted: true, envelope };
}

function sameOriginFetch(baseUrl) {
  return (path, options = {}) => fetch(new URL(path, baseUrl), {
    ...options,
    headers: {
      ...(options.headers || {}),
      Origin: baseUrl,
    },
  });
}

async function waitForServer(baseUrl, child) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`live-server-exited-${child.exitCode}`);
    try {
      const response = await fetch(new URL("/health", baseUrl));
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("live-server-start-timeout");
}

test("real shell transports and real server accept one enabled gesture and return only a redacted scalar live outcome", async () => {
  assert.equal(CONTRACT_LOCK_ID,
    "SELECTED-PROJECT-ENGINE-RUN-FIRST-LIVE-DATA-VALIDATION-CONTRACT-LOCK-1");
  const port = 26000 + (process.pid % 12000);
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: runtimeRoot,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      CONTROLSTACK_RUNTIME_HOST: "127.0.0.1",
      CONTROLSTACK_RUNTIME_PORT: String(port),
      PYTHONDONTWRITEBYTECODE: "1",
    },
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  try {
    await waitForServer(baseUrl, child);
    const fetchImpl = sameOriginFetch(baseUrl);
    const save = localSave();
    const registrationTransport =
      createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
        fetchImpl,
      });
    const registration = await registrationTransport({
      localSave: save,
      registrationSessionId: `live-validation-session-${process.pid}`,
      clientSaveOrdinal: 1,
      localRevisionId: LOCAL_REVISION_ID,
    });
    assert.equal(registration.ok, true);
    assert.equal(registration.activeRevision, true);
    assert.equal(registration.serverOwned, true);
    assert.equal(registration.projectEnvelopeSent, false);
    assert.equal(registration.filesystemPersistenceEnabled, false);

    const readiness = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
      save.envelope,
      save.envelope.envelopeId,
    );
    const preview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
      readiness,
      save.envelope.envelopeId,
    );
    assert.equal(preview.ready, true);

    const clientTransport =
      createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({ fetchImpl });
    const clientMount = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount({
      invokeSelectedProjectReadonlyEngineClientTransport: clientTransport,
    });
    const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
      invokeSelectedProjectReadonlyEngineClientTransport:
        clientMount.invokeSelectedProjectReadonlyEngine,
    });
    controller.setDelegatedListenerMounted(true);
    const context = {
      projectBrowser: {
        selectedProjectId: save.envelope.envelopeId,
        selectedProjectServerOwnedRegistration: registration,
      },
    };
    const ready = controller.refresh({ context, engineRunPreview: preview });
    assert.equal(ready.actionEnabled, true);

    const outcome = await controller.activate();
    assert.equal(outcome.state,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
        .blockedFailClosed);
    assert.equal(outcome.responseReceived, true);
    assert.equal(outcome.responseAccepted, true);
    assert.equal(outcome.outcomeReadiness, "blocked_fail_closed");
    assert.equal(outcome.outcomeBlocker, "direct-run-engine-no-success");
    assert.doesNotMatch(outcome.outcomeBlocker,
      /selected-result-summary-missing|runtable-first-narrow-output-summary-missing/i);
    assert.equal(outcome.revisionConsumed, true);
    assert.equal(outcome.actionEnabled, false);
    assert.equal(outcome.runtimeDataMutated, false);
    assert.equal(outcome.selectedResultPersisted, false);
    assert.equal(outcome.runTableGenerated, false);
    assert.equal(outcome.iesGenerated, false);
    assert.equal(outcome.outputGenerated, false);
    assert.equal(outcome.filesystemWriteAttempted, false);
    assert.doesNotMatch(JSON.stringify(outcome),
      /run_length_mm|target_lm_per_m|selectorPayload|projectEnvelope\":\{|[A-Za-z]:[\\/]|IESNA:LM-63|TILT=/i);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("close", resolve));
  }
  assert.equal(stderr.includes("EADDRINUSE"), false, stderr);
});