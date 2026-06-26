const LAB_PROOF_STATUS_ENDPOINT = "/api/lab-proof/status";

const DEFAULT_WARNINGS = Object.freeze([
  "Diagnostic-only Lab proof boundary status. This inspector is not production proof authority.",
  "No proof claims, production proof verdicts, raw artefacts, raw ledger, PDF contents, IES contents, or raw Lab evidence are emitted.",
  "PURE_REF_STATE is diagnostic metadata only until a later approved Lab authority contract exists.",
  "Selector, IES Builder, Board Data, Compliance, EGRES, and Coordinated Surfaces must not treat diagnostic metadata as proof.",
]);

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function safeTableSummary(tables) {
  return arrayOrEmpty(tables).map((table) => ({
    table: table?.table || "unknown",
    present: table?.present === true,
    count: Number.isFinite(table?.count) ? table.count : 0,
    rawRowsExposed: false,
    rawHeadersExposed: false,
  }));
}

function safeSummary(summary = {}, extra = {}) {
  return {
    diagnosticOnly: true,
    proofStatus: summary?.proofStatus || "metadata_only",
    tables: safeTableSummary(summary?.tables),
    totalRows: Number.isFinite(summary?.totalRows) ? summary.totalRows : 0,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    ...extra,
  };
}

function safeReferenceStateSummary(summary = {}) {
  const pureRefState = summary?.pureRefState || {};
  return {
    diagnosticOnly: true,
    productionProof: false,
    proofStatus: summary?.proofStatus || "metadata_only",
    proofClaimsEmitted: false,
    pureRefState: {
      present: pureRefState?.present === true,
      count: Number.isFinite(pureRefState?.count) ? pureRefState.count : 0,
      diagnosticOnly: true,
      productionProof: false,
      rawRowsExposed: false,
      rawHeadersExposed: false,
    },
    tables: safeTableSummary(summary?.tables),
    rawRowsExposed: false,
    rawHeadersExposed: false,
  };
}

function safeHealthSummary(summary = {}) {
  const source = summary?.source || {};
  return {
    endpoint: LAB_PROOF_STATUS_ENDPOINT,
    source: {
      configured: source?.configured !== false,
      present: source?.present === true,
      readable: source?.readable === true,
      parseable: source?.parseable === true,
      modifiedTime: source?.modifiedTime || null,
      fileSize: Number.isFinite(source?.fileSize) ? source.fileSize : null,
    },
    readOnly: true,
    diagnosticOnly: true,
    productionProofAuthority: false,
    noWritesAttempted: true,
    selectorMutations: false,
    boardDataWrites: false,
    iesGeneration: false,
    engineResultsEmitted: false,
  };
}

function safeWarnings(payloadWarnings) {
  const warnings = arrayOrEmpty(payloadWarnings).map((warning) => String(warning)).filter(Boolean);
  return warnings.length ? warnings : [...DEFAULT_WARNINGS];
}

export function createSafeLabProofStatus(payload = {}) {
  return {
    ...payload,
    ok: payload?.ok ?? null,
    endpoint: LAB_PROOF_STATUS_ENDPOINT,
    owner: payload?.owner || "runtime-server",
    moduleId: "lab_proof",
    label: "Lab Proof",
    readOnly: true,
    diagnosticOnly: true,
    productionProofAuthority: false,
    proofClaimsEmitted: false,
    rawLabEvidenceExposed: false,
    rawArtefactsExposed: false,
    rawLedgerExposed: false,
    rawPdfsExposed: false,
    rawIesExposed: false,
    postEndpointsEnabled: false,
    uploadEnabled: false,
    exportEnabled: false,
    localStorageWritesEnabled: false,
    proofStatus: "metadata_only",
    equipmentSummary: safeSummary(payload?.equipmentSummary, {
      rawEquipmentRecordsExposed: false,
    }),
    calibrationSummary: safeSummary(payload?.calibrationSummary, {
      rawCalibrationRecordsExposed: false,
    }),
    referenceStateSummary: safeReferenceStateSummary(payload?.referenceStateSummary),
    exportSafeManifestSummary: safeSummary(payload?.exportSafeManifestSummary, {
      manifestOnly: true,
      rawLabEvidenceExposed: false,
      rawArtefactsExposed: false,
      rawLedgerExposed: false,
      rawPdfsExposed: false,
      rawIesExposed: false,
      productionProofVerdictsEmitted: false,
    }),
    healthSummary: safeHealthSummary(payload?.healthSummary),
    warnings: safeWarnings(payload?.warnings),
  };
}

export function createUnavailableLabProofStatus(message = "Lab Proof status is unavailable.") {
  return createSafeLabProofStatus({
    ok: false,
    status: "unavailable",
    owner: "runtime-shell",
    healthSummary: {
      source: {
        configured: true,
        present: false,
        readable: false,
        parseable: false,
        modifiedTime: null,
        fileSize: null,
      },
    },
    warnings: [
      message,
      ...DEFAULT_WARNINGS,
    ],
  });
}

export { LAB_PROOF_STATUS_ENDPOINT };
