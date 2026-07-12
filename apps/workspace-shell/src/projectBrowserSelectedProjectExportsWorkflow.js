import {
  resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary,
} from "../../../packages/modules/ies-builder/iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js";
import {
  prepareIesBuilderProjectIesExportDownloadCapabilityAction,
} from "../../../packages/modules/ies-builder/iesBuilderViewModel.js";

export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_SURFACE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-SURFACE-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-exports-workflow.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.project-ies-export-item.v1";
export const SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_exports_workflow_ready",
  missing: "shell_project_browser_selected_project_exports_workflow_missing",
  blockedFailClosed: "shell_project_browser_selected_project_exports_workflow_blocked_fail_closed",
});

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "label",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectTitle",
  "selectedProjectFound",
  "selectedProjectOnly",
  "exportItemCount",
  "readyExportItemCount",
  "blockedExportItemCount",
  "outputs",
  "readOnly",
  "browserOnly",
  "userGestureRequired",
  "redacted",
  "preparedActionRetainedPrivately",
  "rawIesExposed",
  "blobExposed",
  "objectUrlExposed",
  "filenameExposed",
  "candelaExposed",
  "photometryExposed",
  "governanceExposed",
  "mutationLogExposed",
  "privatePathExposed",
  "base64Exposed",
  "projectEnvelopeExposed",
  "fullReadbackStatusExposed",
  "sourceBoundaryExposed",
  "materialisationBoundaryExposed",
  "preparedActionExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

export const SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "exportId",
  "label",
  "format",
  "extension",
  "actionLabel",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
]);

const PRIVATE_PREPARED_ACTIONS = new WeakMap();
const SAFE_ID_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|data:[^\s]*base64|\bbase64\s*[,=:])/i;

function safeId(value) {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (!token || PRIVATE_VALUE_PATTERN.test(token) || !SAFE_ID_PATTERN.test(token)) return null;
  return token;
}

function safeDisplayText(value, fallback) {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200);
  return text && !PRIVATE_VALUE_PATTERN.test(text) ? text : fallback;
}

function selectedProjectSummary(context) {
  const browser = context?.projectBrowser || {};
  const selectedProjectId = safeId(browser.selectedProjectId)
    || safeId(browser.selectedProjectIesExportResultReadbackDetailSummary?.selectedProjectId);
  const selected = (browser.projects || []).find((project) => (
    project?.envelopeId === selectedProjectId || project?.projectId === selectedProjectId
  ));
  return {
    selectedProjectId,
    selectedProjectTitle: safeDisplayText(
      selected?.title,
      selectedProjectId ? "Selected project" : "Select a saved project",
    ),
    selectedProjectFound: Boolean(selectedProjectId && selected),
  };
}

function orderedObject(fieldOrder, fields) {
  return Object.fromEntries(fieldOrder.map((key) => [key, fields[key]]));
}

function buildExportItem({ ready, blocker }) {
  return Object.freeze(orderedObject(
    SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_FIELD_ORDER,
    {
      schemaId: SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID,
      schemaVersion: SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_VERSION,
      exportId: "project-ies",
      label: "Project IES",
      format: "LM-63",
      extension: ".ies",
      actionLabel: "Download project IES (.ies)",
      state: ready ? "ready" : "blocked",
      readiness: ready ? "ready" : "blocked_fail_closed",
      ready,
      failClosed: !ready,
      blocker: ready ? null : blocker,
    },
  ));
}

function buildWorkflowDescriptor({ context, ready, blocker }) {
  const selected = selectedProjectSummary(context);
  const hasSelection = Boolean(selected.selectedProjectId);
  const state = ready
    ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.ready
    : hasSelection
      ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.blockedFailClosed
      : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.missing;
  const safeBlocker = ready
    ? null
    : safeId(blocker) || (hasSelection
      ? "project-ies-export-download-action-unavailable"
      : "selected-project-missing");
  const output = buildExportItem({ ready, blocker: safeBlocker });
  const descriptor = orderedObject(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_FIELD_ORDER,
    {
      schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID,
      schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_VERSION,
      contractId: SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_SURFACE_CONTRACT_ID,
      owner: "shell",
      surfaceId: "selected-project-exports",
      label: "Project exports",
      state,
      readiness: ready ? "ready" : hasSelection ? "blocked_fail_closed" : "missing",
      ready,
      failClosed: !ready,
      blocker: safeBlocker,
      selectedProjectId: selected.selectedProjectId,
      selectedProjectTitle: selected.selectedProjectTitle,
      selectedProjectFound: selected.selectedProjectFound,
      selectedProjectOnly: true,
      exportItemCount: 1,
      readyExportItemCount: ready ? 1 : 0,
      blockedExportItemCount: ready ? 0 : 1,
      outputs: Object.freeze([output]),
      readOnly: true,
      browserOnly: true,
      userGestureRequired: true,
      redacted: true,
      preparedActionRetainedPrivately: ready,
      rawIesExposed: false,
      blobExposed: false,
      objectUrlExposed: false,
      filenameExposed: false,
      candelaExposed: false,
      photometryExposed: false,
      governanceExposed: false,
      mutationLogExposed: false,
      privatePathExposed: false,
      base64Exposed: false,
      projectEnvelopeExposed: false,
      fullReadbackStatusExposed: false,
      sourceBoundaryExposed: false,
      materialisationBoundaryExposed: false,
      preparedActionExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
      persistenceMutated: false,
      runtimeDataMutated: false,
      filesystemWriteAttempted: false,
    },
  );
  return Object.freeze(descriptor);
}

export async function prepareShellProjectBrowserSelectedProjectExportsWorkflow({
  context = {},
  services = {},
  browserDocument,
  browserUrlApi,
} = {}) {
  let sourceBoundary;
  try {
    sourceBoundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
      context,
      services,
    });
  } catch {
    return buildWorkflowDescriptor({
      context,
      ready: false,
      blocker: "selected-project-ies-export-download-source-resolution-failed",
    });
  }

  if (sourceBoundary?.ready !== true || sourceBoundary?.failClosed !== false) {
    return buildWorkflowDescriptor({
      context,
      ready: false,
      blocker: sourceBoundary?.blocker || "selected-project-ies-export-download-source-not-ready",
    });
  }

  let preparedAction = null;
  try {
    preparedAction = await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
      projectIesExportDownloadSourceBoundary: sourceBoundary,
      services,
      context,
      browserDocument,
      browserUrlApi,
    });
  } catch {
    preparedAction = null;
  }

  const ready = typeof preparedAction === "function";
  const descriptor = buildWorkflowDescriptor({
    context,
    ready,
    blocker: ready ? null : "project-ies-export-download-action-unavailable",
  });
  if (ready) PRIVATE_PREPARED_ACTIONS.set(descriptor, preparedAction);
  return descriptor;
}

export function getShellProjectBrowserSelectedProjectExportAction(workflowDescriptor) {
  return PRIVATE_PREPARED_ACTIONS.get(workflowDescriptor) || null;
}
