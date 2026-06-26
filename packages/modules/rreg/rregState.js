export function createRregState() {
  const state = {
    selectedSection: "runtime-status-flags",
    readOnly: true,
    diagnosticOnly: true,
    localDirty: false,
    responsibilityMappingOnly: true,
    custodyTransferEnabled: false,
    approvalAutomationEnabled: false,
    permissionEnforcementEnabled: false,
    peopleAssignmentEnabled: false,
    seedScriptEnabled: false,
    lastAction: "mounted-read-only-diagnostic",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
