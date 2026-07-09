// Lab IES toolkit — runtime-facing safe handoff. Pure, browser-safe.
// The runtime receives ONLY: opaque refs, safe fingerprints, safe descriptors, readiness state.
// It NEVER receives: raw IES text, candela arrays, filenames, local paths, proprietary metadata, or the mutation log.
// Matches CP's blessed safeRuntimeHandoff field set.
export function buildSafeHandoff(record){
  const isReference = record.approvalState === "reference";
  return {
    schemaId: "controlstack.lab.safe-runtime-handoff.v1",
    schemaVersion: 1,
    // opaque reference tokens / fingerprints (tokens, never the underlying data)
    sourcePhotometryRef: record.origin?.fingerprint || null,
    photometryReferenceFingerprint: record.recordFingerprint || null,
    sourceInputFingerprint: record.sourceFingerprint || null,
    // safe descriptors
    recordType: record.recordType || null,
    referenceEngineToken: record.referenceEngineId || null,
    oneMmPolicyLabel: record.photometryMode || "normalise_1mm_candidate",
    oneMmNormalised: !!record.oneMmNormalised,
    baseLengthM: record.baseLengthM ?? null,
    // readiness only
    handoffState: isReference ? "ready" : "blocked",
    approvalState: record.approvalState || "draft",
    sourcePhotometryStatus: isReference ? "available" : "not-a-reference",
    unresolvedCount: (record.unresolvedFields || []).length,
    // explicit safety flags — everything raw stays lab-side
    rawExposed: { iesText: false, candela: false, keywords: false, filenames: false, localPaths: false, proprietaryMetadata: false, mutationLog: false },
  };
}
