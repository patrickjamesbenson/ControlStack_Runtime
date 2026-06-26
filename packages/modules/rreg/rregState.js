export function createRregState() {
  const state = {
    selectedSection: "review-responsibility-map",
    readOnly: true,
    diagnosticOnly: true,
    localDirty: false,
    responsibilityMappingOnly: true,
    reviewResponsibilityMapOnly: true,
    peopleAssignmentEnabled: false,
    permissionControlEnabled: false,
    permissionEnforcementEnabled: false,
    approvalAutomationEnabled: false,
    custodyTransferEnabled: false,
    activeRoutingEnabled: false,
    controlledRecordWriteEnabled: false,
    labProofAuthority: false,
    evidenceIngestionEnabled: false,
    runtimeDataWriteEnabled: false,
    hiddenWriteBackEnabled: false,
    seedScriptEnabled: false,
    lastAction: "mounted-read-only-review-responsibility-map",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
