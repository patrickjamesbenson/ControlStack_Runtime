export function createControlledRecordsState() {
  const state = {
    selectedSection: "runtime-status-flags",
    readOnly: true,
    diagnosticOnly: true,
    localDirty: false,
    activeIntakeEnabled: false,
    recordWriteEnabled: false,
    lastAction: "mounted-read-only-diagnostic",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
