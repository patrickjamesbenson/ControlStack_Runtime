import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
} from "../../workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js";
import { stableFingerprint } from "../../workspace-kernel/stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_CONTRACT_ID =
  "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-BROWSER-DOWNLOAD-TRIGGER-1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_ID =
  "controlstack.runtime.ies-first-narrow-project-ies-export-browser-download-trigger.v1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_VERSION = 1;

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES = Object.freeze({
  triggered: "ies_first_narrow_project_ies_export_browser_download_triggered",
  blockedFailClosed: "ies_first_narrow_project_ies_export_browser_download_blocked_fail_closed",
});

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "sourceKind",
  "outputKind",
  "browserOnly",
  "userGestureRequired",
  "ephemeral",
  "inMemoryOnly",
  "downloadTriggered",
  "objectUrlCreated",
  "objectUrlRevoked",
  "anchorCreated",
  "anchorAppended",
  "anchorClicked",
  "anchorRemoved",
  "blobReturned",
  "objectUrlReturned",
  "rawIesTextReturned",
  "candelaReturned",
  "governanceReturned",
  "mutationLogReturned",
  "productionProof",
  "labProofAuthority",
  "filesystemWriteAttempted",
  "persistenceWriteAttempted",
  "runtimeDataMutationAttempted",
  "routeOrPostWiringAdded",
  "directLabTransformCalled",
  "downloadMetadata",
  "triggerFingerprint",
]);

const SOURCE_KIND = "ready-project-ies-export-download-materialisation-boundary-only";
const OUTPUT_KIND = "ephemeral-browser-lm63-download-trigger";
const TRIGGER_FINGERPRINT_PREFIX = "safe-ies-first-narrow-project-ies-export-browser-download-trigger";
const CONTENT_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-download-content:[0-9a-f]{40}$/;
const MATERIALISATION_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-download-materialisation:[0-9a-f]{40}$/;
const RESULT_READBACK_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-result-readback-status:[0-9a-f]{40}$/;
const FILENAME_PATTERN = /^controlstack-project-ies-[1-9][0-9]*mm-[0-9a-f]{12}\.ies$/;
const DOWNLOAD_METADATA_FIELDS = Object.freeze([
  "filename",
  "mediaType",
  "extension",
  "byteLength",
  "contentFingerprint",
  "materialisationFingerprint",
  "sourceResultReadbackFingerprint",
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const actualKeys = Object.keys(value);
  return actualKeys.length === expectedKeys.length
    && expectedKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function orderedReceipt(fields) {
  return Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function finaliseReceipt(fields) {
  const fingerprintSource = Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER
      .filter((key) => key !== "triggerFingerprint")
      .map((key) => [key, fields[key]]),
  );
  return Object.freeze(orderedReceipt({
    ...fields,
    triggerFingerprint: stableFingerprint(TRIGGER_FINGERPRINT_PREFIX, fingerprintSource),
  }));
}

function receiptFields({
  triggered = false,
  blocker = null,
  objectUrlCreated = false,
  objectUrlRevoked = false,
  anchorCreated = false,
  anchorAppended = false,
  anchorClicked = false,
  anchorRemoved = false,
  downloadMetadata = null,
} = {}) {
  return {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_CONTRACT_ID,
    state: triggered
      ? RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.triggered
      : RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.blockedFailClosed,
    readiness: triggered ? "triggered" : "blocked_fail_closed",
    ready: triggered,
    failClosed: !triggered,
    blocker: triggered ? null : blocker,
    sourceKind: SOURCE_KIND,
    outputKind: OUTPUT_KIND,
    browserOnly: true,
    userGestureRequired: true,
    ephemeral: true,
    inMemoryOnly: true,
    downloadTriggered: triggered || anchorClicked,
    objectUrlCreated,
    objectUrlRevoked,
    anchorCreated,
    anchorAppended,
    anchorClicked,
    anchorRemoved,
    blobReturned: false,
    objectUrlReturned: false,
    rawIesTextReturned: false,
    candelaReturned: false,
    governanceReturned: false,
    mutationLogReturned: false,
    productionProof: false,
    labProofAuthority: false,
    filesystemWriteAttempted: false,
    persistenceWriteAttempted: false,
    runtimeDataMutationAttempted: false,
    routeOrPostWiringAdded: false,
    directLabTransformCalled: false,
    downloadMetadata: triggered ? downloadMetadata : null,
  };
}

function blockedReceipt(blocker, lifecycle = {}) {
  return finaliseReceipt(receiptFields({
    ...lifecycle,
    blocker: typeof blocker === "string" && blocker ? blocker : "project-ies-browser-download-trigger-blocked",
  }));
}

function validateDownloadMetadata(downloadMetadata, blob) {
  if (!hasExactKeys(downloadMetadata, DOWNLOAD_METADATA_FIELDS)) {
    return "project-ies-download-metadata-shape-invalid";
  }
  if (!Object.isFrozen(downloadMetadata)) return "project-ies-download-metadata-not-frozen";
  if (!FILENAME_PATTERN.test(downloadMetadata.filename)) return "project-ies-download-metadata-filename-invalid";
  if (downloadMetadata.mediaType !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE
    || downloadMetadata.extension !== ".ies") {
    return "project-ies-download-metadata-media-type-or-extension-invalid";
  }
  if (!Number.isSafeInteger(downloadMetadata.byteLength)
    || downloadMetadata.byteLength <= 0
    || blob.size !== downloadMetadata.byteLength
    || blob.type !== downloadMetadata.mediaType) {
    return "project-ies-download-metadata-blob-alignment-invalid";
  }
  if (!CONTENT_FINGERPRINT_PATTERN.test(downloadMetadata.contentFingerprint)
    || !MATERIALISATION_FINGERPRINT_PATTERN.test(downloadMetadata.materialisationFingerprint)
    || !RESULT_READBACK_FINGERPRINT_PATTERN.test(downloadMetadata.sourceResultReadbackFingerprint)) {
    return "project-ies-download-metadata-fingerprint-invalid";
  }
  if (!downloadMetadata.filename.endsWith(`${downloadMetadata.contentFingerprint.slice(-12)}.ies`)) {
    return "project-ies-download-metadata-filename-fingerprint-mismatch";
  }

  const expectedMaterialisationFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-download-materialisation",
    {
      filename: downloadMetadata.filename,
      mediaType: downloadMetadata.mediaType,
      extension: downloadMetadata.extension,
      byteLength: downloadMetadata.byteLength,
      contentFingerprint: downloadMetadata.contentFingerprint,
      sourceResultReadbackFingerprint: downloadMetadata.sourceResultReadbackFingerprint,
    },
  );
  if (downloadMetadata.materialisationFingerprint !== expectedMaterialisationFingerprint) {
    return "project-ies-download-metadata-materialisation-fingerprint-mismatch";
  }
  return null;
}

function validateReadyMaterialisationBoundary(boundary) {
  if (!isPlainObject(boundary) || Object.keys(boundary).length === 0) {
    return "project-ies-download-materialisation-boundary-missing";
  }
  if (!Object.isFrozen(boundary)) return "project-ies-download-materialisation-boundary-not-frozen";
  if (!hasExactKeys(boundary, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER)) {
    return "project-ies-download-materialisation-boundary-shape-invalid";
  }
  if (boundary.schemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID
    || boundary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION
    || boundary.contractId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID) {
    return "project-ies-download-materialisation-boundary-schema-mismatch";
  }
  if (boundary.state !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES.ready
    || boundary.readiness !== "ready"
    || boundary.ready !== true
    || boundary.failClosed !== false
    || boundary.blocker !== null) {
    return "project-ies-download-materialisation-boundary-not-ready";
  }
  if (boundary.sourceKind !== "ready-project-ies-export-result-readback-status-only"
    || boundary.outputKind !== "ephemeral-in-memory-lm63-download-blob"
    || boundary.ephemeral !== true
    || boundary.inMemoryOnly !== true
    || boundary.immutableBlob !== true
    || boundary.sourceTextAccepted !== true
    || boundary.sourceTextDiscarded !== true
    || boundary.materialiserCapabilityInjected !== true
    || boundary.materialiserCapabilityInvoked !== true
    || boundary.materialiserCapabilitySucceeded !== true) {
    return "project-ies-download-materialisation-boundary-ready-flags-invalid";
  }
  if (boundary.filesystemWriteAttempted !== false
    || boundary.persistenceWriteAttempted !== false
    || boundary.runtimeDataMutationAttempted !== false
    || boundary.downloadUrlGenerated !== false
    || boundary.routeOrPostWiringAdded !== false) {
    return "project-ies-download-materialisation-boundary-prohibited-flag-set";
  }
  if (typeof Blob === "undefined"
    || !(boundary.blob instanceof Blob)
    || !Object.isFrozen(boundary.blob)) {
    return "project-ies-download-materialisation-boundary-blob-invalid";
  }
  return validateDownloadMetadata(boundary.downloadMetadata, boundary.blob);
}

function projectDownloadMetadata(downloadMetadata) {
  return Object.freeze(Object.fromEntries(
    DOWNLOAD_METADATA_FIELDS.map((key) => [key, downloadMetadata[key]]),
  ));
}

function validateBrowserCapabilities(browserDocument, browserUrlApi) {
  if (!browserDocument
    || typeof browserDocument.createElement !== "function"
    || !browserDocument.body
    || typeof browserDocument.body.appendChild !== "function") {
    return "project-ies-browser-download-document-capability-missing";
  }
  if (!browserUrlApi
    || typeof browserUrlApi.createObjectURL !== "function"
    || typeof browserUrlApi.revokeObjectURL !== "function") {
    return "project-ies-browser-download-url-capability-missing";
  }
  return null;
}

export function triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload(input = {}) {
  const boundary = input?.iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary;
  const boundaryBlocker = validateReadyMaterialisationBoundary(boundary);
  if (boundaryBlocker) return blockedReceipt(boundaryBlocker);

  const browserDocument = input?.browserDocument ?? globalThis.document;
  const browserUrlApi = input?.browserUrlApi ?? globalThis.URL;
  const capabilityBlocker = validateBrowserCapabilities(browserDocument, browserUrlApi);
  if (capabilityBlocker) return blockedReceipt(capabilityBlocker);

  let blocker = null;
  let cleanupBlocker = null;
  let objectUrl = null;
  let anchor = null;
  let objectUrlCreated = false;
  let objectUrlRevoked = false;
  let anchorCreated = false;
  let anchorAppended = false;
  let anchorClicked = false;
  let anchorRemoved = false;

  try {
    try {
      objectUrl = browserUrlApi.createObjectURL(boundary.blob);
      if (typeof objectUrl !== "string" || !objectUrl) {
        blocker = "project-ies-browser-download-object-url-invalid";
      } else {
        objectUrlCreated = true;
      }
    } catch {
      blocker = "project-ies-browser-download-object-url-create-failed";
    }

    if (!blocker) {
      try {
        anchor = browserDocument.createElement("a");
        if (!anchor || typeof anchor !== "object"
          || typeof anchor.click !== "function"
          || typeof anchor.remove !== "function") {
          blocker = "project-ies-browser-download-anchor-invalid";
        } else {
          anchorCreated = true;
        }
      } catch {
        blocker = "project-ies-browser-download-anchor-create-failed";
      }
    }

    if (!blocker) {
      try {
        anchor.href = objectUrl;
        anchor.download = boundary.downloadMetadata.filename;
        anchor.type = boundary.downloadMetadata.mediaType;
        anchor.rel = "noopener";
        anchor.hidden = true;
      } catch {
        blocker = "project-ies-browser-download-anchor-configure-failed";
      }
    }

    if (!blocker) {
      try {
        browserDocument.body.appendChild(anchor);
        anchorAppended = true;
      } catch {
        blocker = "project-ies-browser-download-anchor-append-failed";
      }
    }

    if (!blocker) {
      try {
        anchor.click();
        anchorClicked = true;
      } catch {
        blocker = "project-ies-browser-download-anchor-click-failed";
      }
    }
  } finally {
    if (anchorCreated) {
      try {
        anchor.remove();
        anchorRemoved = true;
      } catch {
        cleanupBlocker = "project-ies-browser-download-anchor-remove-failed";
      }
      anchor = null;
    }

    if (objectUrlCreated) {
      try {
        browserUrlApi.revokeObjectURL(objectUrl);
        objectUrlRevoked = true;
      } catch {
        cleanupBlocker = "project-ies-browser-download-object-url-revoke-failed";
      }
      objectUrl = null;
    }
  }

  const lifecycle = {
    objectUrlCreated,
    objectUrlRevoked,
    anchorCreated,
    anchorAppended,
    anchorClicked,
    anchorRemoved,
  };
  if (cleanupBlocker || blocker || !anchorClicked || !anchorRemoved || !objectUrlRevoked) {
    return blockedReceipt(
      cleanupBlocker || blocker || "project-ies-browser-download-trigger-incomplete",
      lifecycle,
    );
  }

  return finaliseReceipt(receiptFields({
    triggered: true,
    ...lifecycle,
    downloadMetadata: projectDownloadMetadata(boundary.downloadMetadata),
  }));
}

export const triggerIesFirstNarrowProjectIesExportBrowserDownload =
  triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload;
