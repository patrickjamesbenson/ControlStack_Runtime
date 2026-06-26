export function createControlledRecordsState() {
  const state = {
    selectedSection: "evidence-provenance-link-map",
    readOnly: true,
    diagnosticOnly: true,
    provenanceMapOnly: true,
    localDirty: false,
    recordCreationEnabled: false,
    recordMutationEnabled: false,
    evidenceIngestionEnabled: false,
    artefactUploadEnabled: false,
    approvalAutomationEnabled: false,
    dispositionWriteEnabled: false,
    labProofAuthority: false,
    rregAuthorityEnabled: false,
    kcWriteEnabled: false,
    clxWriteEnabled: false,
    runtimeDataWriteEnabled: false,
    hiddenWriteBackEnabled: false,
    activeIntakeEnabled: false,
    recordWriteEnabled: false,
    ledgerWriteEnabled: false,
    lastAction: "mounted-controlled-records-evidence-provenance-map-read-only",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
