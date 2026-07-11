import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createIesBuilderViewModel,
  prepareIesBuilderProjectIesExportDownloadCapabilityAction,
} from "../packages/modules/ies-builder/iesBuilderViewModel.js";
import {
  resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary,
} from "../packages/modules/ies-builder/iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js";
import {
  buildProjectBrowserProjectIesExportResultReadbackSummary,
  buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES,
} from "../packages/modules/ies-builder/iesFirstNarrowProjectIesExportBrowserDownloadTrigger.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const BUNDLE_REF = `safe-ies-first-narrow-candidate-output-bundle-boundary:${"a".repeat(40)}`;
const PROJECT_BOUNDARY_REF = `safe-ies-first-narrow-project-ies-export-boundary:${"b".repeat(40)}`;
const BOUNDARY_SUMMARY_FINGERPRINT =
  `safe-ies-first-narrow-project-ies-export-boundary-summary:${"c".repeat(40)}`;
const BUNDLE_SUMMARY_FINGERPRINT =
  `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"d".repeat(40)}`;
const BUILDER_REDUCTION_FINGERPRINT =
  `safe-ies-first-narrow-project-ies-export-builder-output-reduction:${"e".repeat(40)}`;
const JOB_FINGERPRINT =
  `safe-ies-first-narrow-project-ies-export-boundary-job:${"f".repeat(40)}`;

const VALID_LM63 = [
  "IESNA:LM-63-2002",
  "[TEST] IES-BUILDER-CAPABILITY-WIRING",
  "[MANUFAC] CONTROLSTACK-RUNTIME",
  "TILT=NONE",
  "1 1000 1 3 1 1 2 0.1 1.2 0.05",
  "1 1 12",
  "0 90 180",
  "0",
  "100 50 0",
  "",
].join("\r\n");

function readyBoundaryReadbackStatus() {
  const status = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
    state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    reason: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    summaryPresent: true,
    summarySchemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    summarySchemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    summaryContractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    summaryState: "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    summaryFingerprint: BOUNDARY_SUMMARY_FINGERPRINT,
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    exportBoundaryOnly: true,
    projectIesExportBoundaryOnly: true,
    bundleBoundaryOnly: true,
    builderCallBoundaryOnly: true,
    productionProof: false,
    labProofAuthority: false,
    approvedReferenceGatePassed: true,
    resolvedRunLengthGatePassed: true,
    fingerprintAlignmentGatePassed: true,
    builderBoundaryCallAllowed: true,
    builderBoundaryCallAttempted: true,
    builderBoundaryCallSucceeded: true,
    builderOutputReduced: true,
    approvedReferenceReady: true,
    projectIesExportApproved: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    bundleBoundaryReady: true,
    opaqueBundleBoundaryRef: BUNDLE_REF,
    opaqueProjectIesExportBoundaryRef: PROJECT_BOUNDARY_REF,
    runLengthMm: 1200,
    builderOutputKind: "project-ies-lm63",
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 2,
    builderOutputRedactedPayloadMarkerCount: 3,
    policyFingerprint: "safe-policy:ies-builder-capability-wiring-fixture",
    sourceFingerprint: "safe-source:ies-builder-capability-wiring-fixture",
    sourceInputFingerprint: "safe-source-input:ies-builder-capability-wiring-fixture",
    boardDataSourceVersion: "safe-board-data-source-version:ies-builder-capability-wiring-fixture",
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint: JOB_FINGERPRINT,
    builderOutputReductionFingerprint: BUILDER_REDUCTION_FINGERPRINT,
    candidateOutputBundleBoundarySummaryFingerprint: BUNDLE_SUMMARY_FINGERPRINT,
    ...Object.fromEntries(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS
        .map((key) => [key, false]),
    ),
  };
  status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
    status,
  );
  return status;
}

function readyResultReadbackStatus() {
  const summary = buildRuntimeIesFirstNarrowProjectIesExportResultSummary({
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: readyBoundaryReadbackStatus(),
  });
  return buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummary: summary,
        },
      },
    },
  });
}

async function readySourceBoundary(status = readyResultReadbackStatus()) {
  const project = {
    projectId: "selected-project",
    envelopeId: "env-selected-project",
    iesFirstNarrowProjectIesExportResultReadbackStatus: status,
  };
  const summary = buildProjectBrowserProjectIesExportResultReadbackSummary([project]);
  const detail = buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
    summary,
    project.envelopeId,
  );
  const boundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectIesExportResultReadbackDetailSummary: detail,
      },
    },
    services: {
      savedProjects: {
        getIesFirstNarrowProjectIesExportResultReadbackStatus() {
          return status;
        },
      },
    },
  });
  assert.equal(boundary.ready, true);
  return boundary;
}

function browserHarness() {
  const calls = [];
  const anchor = {
    click() { calls.push("click"); },
    remove() { calls.push("remove"); },
  };
  return {
    calls,
    browserDocument: {
      createElement(tagName) {
        calls.push(`createElement:${tagName}`);
        return anchor;
      },
      body: {
        appendChild(received) {
          assert.equal(received, anchor);
          calls.push("append");
        },
      },
    },
    browserUrlApi: {
      createObjectURL(blob) {
        assert.equal(blob instanceof Blob, true);
        calls.push("createObjectURL");
        return "blob:ies-builder-capability-wiring";
      },
      revokeObjectURL(value) {
        assert.equal(value, "blob:ies-builder-capability-wiring");
        calls.push("revokeObjectURL");
      },
    },
  };
}

function assertSafeViewModel(viewModel) {
  for (const key of [
    "iesFirstNarrowProjectIesExportResultReadbackStatus",
    "projectIesExportDownloadMaterialisationBoundary",
    "materialisationBoundary",
    "blob",
    "rawIesText",
    "candela",
    "governance",
    "filename",
    "filePath",
    "base64",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(viewModel, key), false, key);
  }
}

test("service capability is preferred over context, materialised once, and exposed only as a synchronous zero-argument action", async () => {
  const sourceBoundary = await readySourceBoundary();
  const harness = browserHarness();
  let serviceCalls = 0;
  let contextCalls = 0;
  let capabilityInput = null;
  const services = {
    materialiseProjectIesDownload(input) {
      assert.equal(this, services);
      serviceCalls += 1;
      capabilityInput = input;
      return VALID_LM63;
    },
  };
  const context = {
    materialiseProjectIesDownload() {
      contextCalls += 1;
      return VALID_LM63;
    },
  };

  const action = await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
    projectIesExportDownloadSourceBoundary: sourceBoundary,
    services,
    context,
    browserDocument: harness.browserDocument,
    browserUrlApi: harness.browserUrlApi,
  });

  assert.equal(typeof action, "function");
  assert.equal(serviceCalls, 1);
  assert.equal(contextCalls, 0);
  assert.equal(Object.isFrozen(capabilityInput), true);
  assert.equal(Object.values(capabilityInput).every(
    (value) => ["string", "number", "boolean"].includes(typeof value),
  ), true);
  assert.equal("rawIesText" in capabilityInput, false);
  assert.equal("candela" in capabilityInput, false);
  assert.equal("governance" in capabilityInput, false);
  assert.equal("filename" in capabilityInput, false);
  assert.equal("filePath" in capabilityInput, false);

  const viewModel = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
    projectIesExportDownloadSourceBoundary: sourceBoundary,
    projectIesExportDownloadControlAction: action,
  });
  assert.equal(viewModel.projectIesExportDownloadControl.enabled, true);
  assert.equal(viewModel.projectIesExportDownloadControl.failClosed, false);
  assert.equal(viewModel.projectIesExportDownloadControl.blocker, null);
  assert.equal(viewModel.projectIesExportDownloadAction, action);
  assertSafeViewModel(viewModel);

  const receipt = action();
  assert.equal(receipt instanceof Promise, false);
  assert.equal(
    receipt.state,
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.triggered,
  );
  assert.equal(receipt.downloadTriggered, true);
  assert.deepEqual(harness.calls, [
    "createObjectURL",
    "createElement:a",
    "append",
    "click",
    "remove",
    "revokeObjectURL",
  ]);
});

test("context capability is used only when services do not provide one", async () => {
  const sourceBoundary = await readySourceBoundary();
  const harness = browserHarness();
  let calls = 0;
  const context = {
    materialiseProjectIesDownload() {
      assert.equal(this, context);
      calls += 1;
      return VALID_LM63;
    },
  };

  const action = await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
    projectIesExportDownloadSourceBoundary: sourceBoundary,
    services: {},
    context,
    browserDocument: harness.browserDocument,
    browserUrlApi: harness.browserUrlApi,
  });

  assert.equal(typeof action, "function");
  assert.equal(calls, 1);
  const receipt = action();
  assert.equal(receipt.downloadTriggered, true);
});

test("missing capability, unretained source input, or failed materialisation keeps the visible control disabled fail-closed", async () => {
  const sourceBoundary = await readySourceBoundary();
  let calls = 0;
  const absent = await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
    projectIesExportDownloadSourceBoundary: sourceBoundary,
  });
  const unretained = await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
    projectIesExportDownloadSourceBoundary: Object.freeze({ ready: true }),
    services: {
      materialiseProjectIesDownload() {
        calls += 1;
        return VALID_LM63;
      },
    },
  });
  const invalid = await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
    projectIesExportDownloadSourceBoundary: sourceBoundary,
    services: {
      materialiseProjectIesDownload() {
        calls += 1;
        return "not lm63";
      },
    },
  });

  assert.equal(absent, null);
  assert.equal(unretained, null);
  assert.equal(invalid, null);
  assert.equal(calls, 1);

  for (const action of [absent, unretained, invalid]) {
    const viewModel = createIesBuilderViewModel({
      context: { route: { moduleId: "ies_builder" } },
      local: {},
      status: {},
      projectIesExportDownloadSourceBoundary: sourceBoundary,
      projectIesExportDownloadControlAction: action,
    });
    assert.equal(viewModel.projectIesExportDownloadControl.enabled, false);
    assert.equal(viewModel.projectIesExportDownloadControl.failClosed, true);
    assert.equal(
      viewModel.projectIesExportDownloadControl.blocker,
      "project-ies-download-materialiser-capability-not-wired",
    );
    assertSafeViewModel(viewModel);
  }
});

test("module wiring stays local, prepares through the landed source boundary, and adds no backend or mutation path", async () => {
  const [viewModelSource, indexSource, viewSource] = await Promise.all([
    readFile(new URL("../packages/modules/ies-builder/iesBuilderViewModel.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/index.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/iesBuilderView.js", import.meta.url), "utf8"),
  ]);
  const helperStart = viewModelSource.indexOf(
    "export async function prepareIesBuilderProjectIesExportDownloadCapabilityAction",
  );
  const helperSource = viewModelSource.slice(helperStart);
  const refreshStart = indexSource.indexOf(
    "async function refreshSelectedProjectIesExportDownloadSourceBoundary",
  );
  const refreshEnd = indexSource.indexOf("function applyIesBuilderStatus", refreshStart);
  const refreshSource = indexSource.slice(refreshStart, refreshEnd);

  assert.notEqual(helperStart, -1);
  assert.notEqual(refreshStart, -1);
  assert.notEqual(refreshEnd, -1);
  assert.match(
    helperSource,
    /getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput/,
  );
  assert.match(
    helperSource,
    /buildRuntimeIesFirstNarrowProjectIesExportDownloadMaterialisationBoundary/,
  );
  assert.match(helperSource, /triggerIesBuilderProjectIesExportDownloadAction/);
  assert.match(refreshSource, /prepareIesBuilderProjectIesExportDownloadCapabilityAction/);
  assert.match(refreshSource, /context: mountedContext/);
  assert.match(refreshSource, /services: mountedServices/);
  assert.match(indexSource, /projectIesExportDownloadControlAction: iesBuilderDownloadCapabilityAction/);
  assert.equal(viewSource.includes("materialiseProjectIesDownload"), false);
  assert.doesNotMatch(
    helperSource,
    /fetch\(|XMLHttpRequest|\/api\/|POST|savedProjectStore|getProjectEnvelope|RuntimeData|node:fs|writeFile|localStorage|sessionStorage|webhook/,
  );
  assert.doesNotMatch(
    refreshSource,
    /fetch\(|XMLHttpRequest|\/api\/|POST|getProjectEnvelope|RuntimeData|node:fs|writeFile|localStorage|sessionStorage|webhook/,
  );
});
