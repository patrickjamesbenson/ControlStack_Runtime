import { stableSha1 } from "./stableFingerprint.js";

export const LAB_EVIDENCE_ATOM_SCHEMA_ID = "controlstack.lab.evidence-atom.v1";
export const LAB_EVIDENCE_ATOM_SCHEMA_VERSION = 1;
export const LAB_EVIDENCE_ATOM_SUCCESS_STATE = "lab_evidence_atom_contract_diagnostic";
export const LAB_EVIDENCE_ATOM_FAILURE_STATE = "lab_evidence_atom_contract_fail_closed";

export const LAB_EVIDENCE_ATOM_ALLOWED_EVIDENCE_KINDS = Object.freeze([
  "original_ies",
  "lab_photometry_report",
  "one_mm_transform_record",
  "orientation_declaration",
  "mutation_history",
  "emergency_photometry",
  "thermal_test_report",
  "ip_test_report",
  "ik_test_report",
  "driver_temperature_report",
  "installation_instruction",
  "human_lab_approval",
]);

export const LAB_EVIDENCE_ATOM_ALLOWED_SUBJECT_KINDS = Object.freeze([
  "optic_reference",
  "candidate_pure_reference",
  "approved_lab_reference",
  "system",
  "system_family",
  "system_optic_mapping",
  "project_export",
  "emergency_use",
  "thermal_inheritance",
]);

export const LAB_EVIDENCE_ATOM_ALLOWED_REVIEW_STATUSES = Object.freeze([
  "pending",
  "accepted",
  "rejected",
  "needs_clarification",
  "superseded",
]);

export const LAB_EVIDENCE_ATOM_ALLOWED_APPROVAL_STATUSES = Object.freeze([
  "not_approved",
  "approved_for_candidate_use",
  "approved_for_selector_use",
  "approved_for_project_ies_export",
  "approved_for_emergency_use",
  "approved_for_thermal_inheritance",
  "blocked",
]);

export const LAB_EVIDENCE_ATOM_ALLOWED_VISIBILITY = Object.freeze([
  "safe_summary",
  "internal",
  "restricted",
]);

export const LAB_EVIDENCE_ATOM_ALLOWED_OUTPUT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "ok",
  "readOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "labOwned",
  "blocker",
  "blockers",
  "evidence_id",
  "evidence_kind",
  "subject_kind",
  "subject_id",
  "uploaded_at",
  "uploaded_by_ref",
  "source_date",
  "file_hash",
  "evidence_fingerprint",
  "classification_ai_suggested",
  "classification_human_approved",
  "human_reviewer_ref",
  "review_status",
  "approval_status",
  "effective_from",
  "expires_at",
  "supersedes_evidence_id",
  "superseded_by_evidence_id",
  "visibility",
  "raw_content_returned",
  "reviewSummary",
  "approvalSummary",
  "unsafeInputsBlocked",
  "safetyFlags",
  "warnings",
  "failClosedDiagnostics",
]);

export const LAB_EVIDENCE_ATOM_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  labOwned: true,
  uploadPerformed: false,
  fileUploaded: false,
  realFileHashingPerformed: false,
  aiClassificationInvoked: false,
  aiClassificationApprovalPerformed: false,
  evidenceApprovalPerformed: false,
  evidenceRecordCreated: false,
  runtimeDataMutated: false,
  donorMutated: false,
  donorEngineInvoked: false,
  donorPhotometryInvoked: false,
  selectedResultPersisted: false,
  productionRunTableGenerated: false,
  runTableGenerated: false,
  iesGenerated: false,
  rawIesReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  rawRowsReturned: false,
  rawEvidenceBodyReturned: false,
  privatePathsReturned: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

const EVIDENCE_KIND_SET = new Set(LAB_EVIDENCE_ATOM_ALLOWED_EVIDENCE_KINDS);
const SUBJECT_KIND_SET = new Set(LAB_EVIDENCE_ATOM_ALLOWED_SUBJECT_KINDS);
const REVIEW_STATUS_SET = new Set(LAB_EVIDENCE_ATOM_ALLOWED_REVIEW_STATUSES);
const APPROVAL_STATUS_SET = new Set(LAB_EVIDENCE_ATOM_ALLOWED_APPROVAL_STATUSES);
const VISIBILITY_SET = new Set(LAB_EVIDENCE_ATOM_ALLOWED_VISIBILITY);
const APPROVED_STATUS_SET = new Set([
  "approved_for_candidate_use",
  "approved_for_selector_use",
  "approved_for_project_ies_export",
  "approved_for_emergency_use",
  "approved_for_thermal_inheritance",
]);

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|\bControlStack(?:_Runtime|_RuntimeData)?[\\/])/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT\s*=|\bLM-63\b|\[[A-Z0-9_ -]{2,}\]\s+[^\n]+\n\s*TILT\s*=)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s]+;base64|\bbase64\s*[,=:]/i;

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:uploadPerformed|fileUploaded|evidenceUploaded|uploadAttempted|writePerformed|writeAttempted|evidenceRecordCreated|evidenceRecordPersisted)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAttempted|authorityWritesActive)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:donorMutated|donorMutationEnabled|donorMutationAttempted)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|donorEngineInvocationAttempted|engineExecutionAttempted)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:donorPhotometryInvoked|donorPhotometryGenerationInvoked|photometryGenerationInvoked)$/i, "ies-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled|iesGenerationAttempted|projectIesGenerated|projectIESGenerated|lm63Generated)$/i, "ies-generation-not-approved"],
  [/^(?:productionRunTableGenerated|runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableGenerationAttempted)$/i, "runtable-generation-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|apiRouteAdded|postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "post-endpoint-not-approved"],
  [/^(?:rawIesReturned|rawIESReturned|rawIesExposed|rawIESTextReturned|iesTextReturned|rawContentReturned|raw_content_returned)$/i, "raw-ies-not-approved"],
  [/^(?:rawPhotometryReturned|rawPhotometryExposed|photometryReturned|candelaArraysReturned|candelaReturned|rawRowsReturned)$/i, "raw-photometry-not-approved"],
  [/^(?:base64ArtifactsReturned|base64ArtifactReturned|base64Returned|fileArtifactsReturned)$/i, "raw-photometry-not-approved"],
  [/^(?:aiClassificationInvoked|aiClassifierInvoked|aiInvocationAttempted)$/i, "ai-classification-not-human-approved"],
  [/^(?:evidenceApprovalPerformed|approvalPerformed|approvalWritePerformed)$/i, "approval-without-human-review"],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:rawIes|rawIES|iesText|rawIesText|rawIESText|iesContent|rawIesContent|rawIESContent|lm63|lm63Text|originalIesBody|originalIESBody)$/i, "raw-ies-not-approved"],
  [/^(?:photometry|rawPhotometry|photometryGrid|photometricGrid|rawPhotometricGrid|candela|candelaGrid|candelaArray|candelaArrays|rawCandela|rawCandelaGrid)$/i, "raw-photometry-not-approved"],
  [/^(?:base64|base64Artifact|base64Artifacts|fileArtifact|fileArtifacts|pdf|pdfBody|imageData|plotImage)$/i, "raw-photometry-not-approved"],
  [/^(?:rawRows|rawRow|rows|sourceRows|sheetRows|tableRows)$/i, "unsafe-raw-evidence-content"],
  [/^(?:evidenceBody|rawEvidenceBody|body|rawBody|content|rawContent|documentText|reportBody|sourceText|ocrText|extractedText)$/i, "unsafe-raw-evidence-content"],
  [/^(?:path|filePath|sourcePath|localPath|absolutePath|privatePath|uploadPath|artifactPath|evidencePath|sourceFilePath)$/i, "unsafe-private-path-input"],
  [/^(?:selectedResultBody|selected_result_body|selectedResultPayload|rawSelectedPayload|selectedResult|rawSelectedResult)$/i, "unsafe-raw-evidence-content"],
  [/^(?:enginePayload|rawEnginePayload|engineResult|rawEngineResult|rawDonorPayload|donorPayload)$/i, "donor-engine-invocation-not-approved"],
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
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

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 12 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "unsafe-private-path-input";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "raw-ies-not-approved";
    if (DATA_BASE64_PATTERN.test(value)) return "raw-photometry-not-approved";
    return null;
  }
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
      if (pattern.test(key) && !isBlank(nested) && nested !== false) return blocker;
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function safeLabel(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:@-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 180) : fallback;
}

function safeToken(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^0-9a-z_.:]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 180);
  return token || fallback;
}

function safeNullableLabel(value) {
  if (isBlank(value)) return null;
  return safeLabel(value, null);
}

function boolFrom(value) {
  return value === true;
}

function approvalRequiresHumanReview(approvalStatus) {
  return APPROVED_STATUS_SET.has(approvalStatus);
}

function buildUnsafeInputsBlocked() {
  return {
    uploadBlocked: true,
    writeBlocked: true,
    realFileHashingBlocked: true,
    aiInvocationBlocked: true,
    approvalWriteBlocked: true,
    rawIesBlocked: true,
    rawPhotometryBlocked: true,
    candelaArraysBlocked: true,
    base64ArtifactsBlocked: true,
    rawRowsBlocked: true,
    rawEvidenceBodyBlocked: true,
    privatePathBlocked: true,
    runtimeDataMutationBlocked: true,
    donorMutationBlocked: true,
    donorEngineInvocationBlocked: true,
    donorPhotometryInvocationBlocked: true,
    selectedResultPersistenceBlocked: true,
    iesGenerationBlocked: true,
    runTableGenerationBlocked: true,
    routesBlocked: true,
    postEndpointsBlocked: true,
  };
}

function buildReviewSummary(extra = {}) {
  return {
    diagnosticOnly: true,
    safeSummaryOnly: true,
    review_status: extra.review_status || null,
    classification_ai_suggested: extra.classification_ai_suggested === true,
    classification_human_approved: extra.classification_human_approved === true,
    human_reviewer_ref: extra.human_reviewer_ref || null,
    human_review_date: extra.human_review_date || null,
    aiSuggestionIsNotApproval: true,
    rawEvidenceBodyReturned: false,
  };
}

function buildApprovalSummary(extra = {}) {
  return {
    diagnosticOnly: true,
    safeSummaryOnly: true,
    approval_status: extra.approval_status || "not_approved",
    approvalAllowedFromSummary: false,
    approvalWritePerformed: false,
    humanApprovalRequiredForApprovedUse: true,
    approvedForCandidateUse: extra.approval_status === "approved_for_candidate_use",
    approvedForSelectorUse: extra.approval_status === "approved_for_selector_use",
    approvedForProjectIesExport: extra.approval_status === "approved_for_project_ies_export",
    approvedForEmergencyUse: extra.approval_status === "approved_for_emergency_use",
    approvedForThermalInheritance: extra.approval_status === "approved_for_thermal_inheritance",
  };
}

function baseSummary(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  const approvalStatus = extra.approval_status || "not_approved";
  return Object.freeze({
    schemaId: LAB_EVIDENCE_ATOM_SCHEMA_ID,
    schemaVersion: LAB_EVIDENCE_ATOM_SCHEMA_VERSION,
    state: ok ? LAB_EVIDENCE_ATOM_SUCCESS_STATE : LAB_EVIDENCE_ATOM_FAILURE_STATE,
    ok,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    labOwned: true,
    blocker,
    blockers: blocker ? [blocker] : [],
    evidence_id: extra.evidence_id || null,
    evidence_kind: extra.evidence_kind || null,
    subject_kind: extra.subject_kind || null,
    subject_id: extra.subject_id || null,
    uploaded_at: extra.uploaded_at || null,
    uploaded_by_ref: extra.uploaded_by_ref || null,
    source_date: extra.source_date || null,
    file_hash: extra.file_hash || null,
    evidence_fingerprint: extra.evidence_fingerprint || null,
    classification_ai_suggested: extra.classification_ai_suggested === true,
    classification_human_approved: extra.classification_human_approved === true,
    human_reviewer_ref: extra.human_reviewer_ref || null,
    review_status: extra.review_status || null,
    approval_status: approvalStatus,
    effective_from: extra.effective_from || null,
    expires_at: extra.expires_at || null,
    supersedes_evidence_id: extra.supersedes_evidence_id || null,
    superseded_by_evidence_id: extra.superseded_by_evidence_id || null,
    visibility: extra.visibility || "safe_summary",
    raw_content_returned: false,
    reviewSummary: extra.reviewSummary || buildReviewSummary(extra),
    approvalSummary: extra.approvalSummary || buildApprovalSummary({ approval_status: approvalStatus }),
    unsafeInputsBlocked: buildUnsafeInputsBlocked(),
    safetyFlags: clonePlain(LAB_EVIDENCE_ATOM_SAFETY_FLAGS),
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
  });
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseSummary({
    ...extra,
    ok: false,
    blocker,
    evidence_fingerprint: null,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function safeInputSkeleton(source) {
  return {
    evidence_id: safeNullableLabel(firstPresent(source, ["evidence_id", "evidenceId"])),
    evidence_kind: safeToken(firstPresent(source, ["evidence_kind", "evidenceKind"]), ""),
    subject_kind: safeToken(firstPresent(source, ["subject_kind", "subjectKind"]), ""),
    subject_id: safeNullableLabel(firstPresent(source, ["subject_id", "subjectId"])),
    uploaded_at: safeNullableLabel(firstPresent(source, ["uploaded_at", "uploadedAt"])),
    uploaded_by_ref: safeNullableLabel(firstPresent(source, ["uploaded_by_ref", "uploadedByRef", "uploaded_by", "uploadedBy"])),
    source_date: safeNullableLabel(firstPresent(source, ["source_date", "sourceDate"]) ?? firstPresent(source, ["uploaded_at", "uploadedAt"])),
    file_hash: safeNullableLabel(firstPresent(source, ["file_hash", "fileHash", "safeFileHash"])),
    classification_ai_suggested: boolFrom(firstPresent(source, ["classification_ai_suggested", "classificationAiSuggested"])),
    classification_human_approved: boolFrom(firstPresent(source, ["classification_human_approved", "classificationHumanApproved"])),
    human_reviewer_ref: safeNullableLabel(firstPresent(source, ["human_reviewer_ref", "humanReviewerRef", "reviewer_ref", "reviewerRef"])),
    review_status: safeToken(firstPresent(source, ["review_status", "reviewStatus"]), ""),
    approval_status: safeToken(firstPresent(source, ["approval_status", "approvalStatus"]), "not_approved"),
    effective_from: safeNullableLabel(firstPresent(source, ["effective_from", "effectiveFrom", "human_reviewed_at", "humanReviewedAt", "reviewed_at", "reviewedAt"])),
    expires_at: safeNullableLabel(firstPresent(source, ["expires_at", "expiresAt"])),
    supersedes_evidence_id: safeNullableLabel(firstPresent(source, ["supersedes_evidence_id", "supersedesEvidenceId"])),
    superseded_by_evidence_id: safeNullableLabel(firstPresent(source, ["superseded_by_evidence_id", "supersededByEvidenceId"])),
    visibility: safeToken(firstPresent(source, ["visibility"]), "safe_summary"),
  };
}

function firstMissingRequiredField(fields) {
  if (!fields.evidence_id) return "missing-evidence-id";
  if (!fields.evidence_kind) return "missing-evidence-kind";
  if (!EVIDENCE_KIND_SET.has(fields.evidence_kind)) return "unsupported-evidence-kind";
  if (!fields.subject_kind) return "missing-subject-kind";
  if (!SUBJECT_KIND_SET.has(fields.subject_kind)) return "unsupported-subject-kind";
  if (!fields.subject_id) return "missing-subject-id";
  if (!fields.uploaded_at) return "missing-uploaded-at";
  if (!fields.uploaded_by_ref) return "missing-uploaded-by";
  if (!fields.file_hash) return "missing-file-hash";
  if (!fields.review_status) return "missing-review-status";
  if (!REVIEW_STATUS_SET.has(fields.review_status)) return "unsupported-review-status";
  if (!APPROVAL_STATUS_SET.has(fields.approval_status)) return "unsupported-approval-status";
  return null;
}

function fingerprintFor(fields) {
  return `safe-lab-evidence-atom:${stableSha1({
    schemaId: LAB_EVIDENCE_ATOM_SCHEMA_ID,
    schemaVersion: LAB_EVIDENCE_ATOM_SCHEMA_VERSION,
    evidence_id: fields.evidence_id,
    evidence_kind: fields.evidence_kind,
    subject_kind: fields.subject_kind,
    subject_id: fields.subject_id,
    uploaded_at: fields.uploaded_at,
    uploaded_by_ref: fields.uploaded_by_ref,
    source_date: fields.source_date,
    file_hash: fields.file_hash,
    classification_ai_suggested: fields.classification_ai_suggested,
    classification_human_approved: fields.classification_human_approved,
    human_reviewer_ref: fields.human_reviewer_ref,
    review_status: fields.review_status,
    approval_status: fields.approval_status,
    effective_from: fields.effective_from,
    expires_at: fields.expires_at,
    supersedes_evidence_id: fields.supersedes_evidence_id,
    superseded_by_evidence_id: fields.superseded_by_evidence_id,
    visibility: fields.visibility,
  })}`;
}

export function buildLabEvidenceAtomContract(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const unsafe = unsafeBlocker(source);
  if (unsafe) {
    return failClosed(unsafe, "Lab evidence atom input contained raw evidence content, raw IES, raw photometry, private paths, mutation, generation, upload, route, POST, donor, AI invocation, or approval-write markers.");
  }

  const fields = safeInputSkeleton(source);
  const missingOrUnsupported = firstMissingRequiredField(fields);
  if (missingOrUnsupported) {
    return failClosed(missingOrUnsupported, "Lab evidence atom is missing required identity, hash, subject, or review fields, or includes an unsupported controlled vocabulary value.", fields);
  }

  if (!VISIBILITY_SET.has(fields.visibility)) {
    fields.visibility = "safe_summary";
  }

  const approvedUseRequested = approvalRequiresHumanReview(fields.approval_status);
  if (approvedUseRequested && fields.classification_ai_suggested && !fields.classification_human_approved) {
    return failClosed("ai-classification-not-human-approved", "AI classification suggestion is diagnostic only and cannot approve evidence without human approval.", fields);
  }

  if ((approvedUseRequested || fields.classification_human_approved) && (!fields.classification_human_approved || !fields.human_reviewer_ref || !fields.effective_from)) {
    return failClosed("approval-without-human-review", "Human approval requires classification_human_approved true plus a human reviewer reference and review/effective date.", fields);
  }

  const evidenceFingerprint = fingerprintFor(fields);
  return baseSummary({
    ...fields,
    ok: true,
    evidence_fingerprint: evidenceFingerprint,
    reviewSummary: buildReviewSummary({
      review_status: fields.review_status,
      classification_ai_suggested: fields.classification_ai_suggested,
      classification_human_approved: fields.classification_human_approved,
      human_reviewer_ref: fields.human_reviewer_ref,
      human_review_date: fields.effective_from,
    }),
    approvalSummary: buildApprovalSummary({ approval_status: fields.approval_status }),
    warnings: [
      "Diagnostic-only Lab evidence atom: this helper does not upload files, hash real files, invoke AI, approve evidence, create evidence records, mutate RuntimeData or donor, generate IES/RunTable, or add routes/POST endpoints.",
      "Raw IES, raw photometry/candela/base64, raw rows, raw evidence bodies, and private paths remain blocked and are never returned.",
    ],
    failClosedDiagnostics: [],
  });
}

export const buildRuntimeLabEvidenceAtomContract = buildLabEvidenceAtomContract;
export const buildLabEvidenceAtomSummary = buildLabEvidenceAtomContract;
export const buildRuntimeNativeLabEvidenceAtomContract = buildLabEvidenceAtomContract;
