// Lab IES toolkit — deterministic runtime-facing safe handoff. Pure and browser-safe.
// The rich authority record owns this projection, while the runtime receives only this projection.
import { isOpaqueArtifactReference, validateSha256Hex } from "./iesAuthorityFingerprint.js";

const EXACT_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const DERIVATION_BINDING_RELATION = "cryptographic_derivation_scope";

function safeOpaqueToken(value) {
  return isOpaqueArtifactReference(value) ? value : null;
}

function isExactUtc(value) {
  if (typeof value !== "string" || !EXACT_UTC.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function referenceEngineToken(record) {
  const refs = record?.provenance?.derivationReferences || [];
  const match = refs.find((entry) => entry?.relation === "reference_engine" || entry?.kind === "reference_engine");
  return safeOpaqueToken(match?.referenceId || match?.recordId || match?.artifactRef || null);
}

function sourceBindingReady(record) {
  if (record?.recordKind === "GT" || record?.recordKind === "OPT") {
    return validateSha256Hex(record.originSha256)
      && record.sourceFingerprint === record.originSha256
      && record.origin?.fingerprint === record.originSha256
      && record.derivationSha256 == null
      && safeOpaqueToken(record.origin?.artifactRef) != null;
  }
  if (record?.recordKind === "MERGED") {
    const bindings = Array.isArray(record?.provenance?.derivationReferences)
      ? record.provenance.derivationReferences.filter((entry) => entry?.relation === DERIVATION_BINDING_RELATION)
      : [];
    return record.originSha256 == null
      && record.origin?.fingerprint == null
      && validateSha256Hex(record.derivationSha256)
      && record.sourceFingerprint === record.derivationSha256
      && bindings.length === 1
      && bindings[0]?.artifactSha256 === record.derivationSha256;
  }
  return false;
}

function approvalBindingReady(record) {
  const approval = record?.approval || {};
  return validateSha256Hex(approval.approvalFingerprint)
    && approval.authorityRecordSha256 === record?.authorityRecordSha256
    && isExactUtc(approval.approvedAtUtc)
    && typeof approval.approverId === "string"
    && approval.approverId.trim().length > 0
    && Array.isArray(approval.ratifiedChecks)
    && approval.reopenedAtUtc == null
    && approval.reopenedByMutationOrdinal == null;
}

export function buildSafeHandoff(record) {
  const approvalState = record?.approvalState || "draft";
  const unresolvedFields = Array.isArray(record?.unresolvedFields) ? record.unresolvedFields : [];
  const isReference = approvalState === "reference";
  const authorityReady = isReference
    && record?.oneMmNormalised === true
    && record?.baseLengthM === 0.001
    && Number(record?.photometry?.geometry?.G8) === 0.001
    && record?.revisionState === "current"
    && record?.labProofState === "complete"
    && unresolvedFields.length === 0
    && validateSha256Hex(record?.authorityRecordSha256)
    && record?.recordFingerprint === record?.authorityRecordSha256
    && sourceBindingReady(record)
    && approvalBindingReady(record);
  const sourcePhotometryRef = record?.recordKind === "MERGED"
    ? null
    : safeOpaqueToken(record?.origin?.artifactRef);

  return {
    schemaId: "controlstack.lab.safe-runtime-handoff.v1",
    schemaVersion: 1,
    handoffState: authorityReady ? "ready" : "blocked",
    approvalState,
    sourcePhotometryStatus: authorityReady
      ? "available"
      : (isReference ? "authority-unresolved" : "not-a-reference"),
    oneMmNormalised: record?.oneMmNormalised === true,
    baseLengthM: record?.baseLengthM ?? null,
    oneMmPolicyLabel: record?.photometryMode || "normalise_1mm_candidate",

    // Lab-owned opaque references and future authority fingerprints.
    sourcePhotometryRef,
    iesPhotometryReferenceToken: authorityReady ? record.authorityRecordSha256 : null,
    photometryReferenceFingerprint: authorityReady ? record.authorityRecordSha256 : null,
    sourceInputFingerprint: authorityReady ? record.sourceFingerprint : null,
    recordFingerprint: authorityReady ? record.authorityRecordSha256 : null,
    derivedFromFingerprint: authorityReady && record.recordKind === "MERGED" ? record.derivationSha256 : null,
    recordKind: record?.recordKind || null,
    recordType: record?.recordKind || null,
    referenceEngineToken: referenceEngineToken(record),

    // Runtime/board-owned slots remain unresolved and are never invented by the Lab.
    lumenCurveReferenceToken: null,
    driverUtilCurveReferenceToken: null,
    boardDataSourceVersion: null,
    selectedFamilySubsetLock: null,

    unresolvedCount: unresolvedFields.length,
    safeSummaryOnly: true,
    readOnly: true,
  };
}

export function refreshSafeRuntimeHandoff(record) {
  record.safeRuntimeHandoff = buildSafeHandoff(record);
  return record;
}
