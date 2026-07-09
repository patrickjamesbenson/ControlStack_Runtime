// Lab IES toolkit — runtime-facing safe handoff. Pure, browser-safe.
// Emits CP's blessed safe-runtime-handoff.v1 field set. Lab-owned refs are populated; board/runtime-owned
// tokens (lumen curve, driver-util, board-data version, family-subset lock) are null slots the RUNTIME fills.
// Never exposes candela, keywords, mutation log, or proprietary data (leak-tested).
export function buildSafeHandoff(record){
  const isReference = record.approvalState === "reference";
  return {
    schemaId: "controlstack.lab.safe-runtime-handoff.v1",
    schemaVersion: 1,
    handoffState: isReference ? "ready" : "blocked",
    approvalState: record.approvalState || "draft",
    sourcePhotometryStatus: isReference ? "available" : "not-a-reference",
    oneMmNormalised: !!record.oneMmNormalised,
    baseLengthM: record.baseLengthM ?? null,
    oneMmPolicyLabel: record.photometryMode || "normalise_1mm_candidate",
    // lab-owned opaque refs / fingerprints
    sourcePhotometryRef: record.origin?.fingerprint || null,
    iesPhotometryReferenceToken: record.recordFingerprint || null,
    photometryReferenceFingerprint: record.recordFingerprint || null,
    sourceInputFingerprint: record.sourceFingerprint || null,
    recordFingerprint: record.recordFingerprint || null,
    derivedFromFingerprint: record.derivedFromFingerprint || null, // null for a reference; set on derived project IES
    recordType: record.recordType || null,
    referenceEngineToken: record.referenceEngineId || null,
    // runtime/board-owned slots — lab leaves null; the runtime populates from board data
    lumenCurveReferenceToken: null,
    driverUtilCurveReferenceToken: null,
    boardDataSourceVersion: null,
    selectedFamilySubsetLock: null,
    // readiness + safety
    unresolvedCount: (record.unresolvedFields || []).length,
    safeSummaryOnly: true,
    readOnly: true,
    rawExposed: { iesText: false, candela: false, keywords: false, filenames: false, localPaths: false, proprietaryMetadata: false, mutationLog: false },
  };
}
