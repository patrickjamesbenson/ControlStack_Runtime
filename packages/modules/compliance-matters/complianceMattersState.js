export function createComplianceMattersState() {
  const state = {
    selectedSection: "diagnostic-status",
    readOnly: true,
    localDirty: false,
    lastAction: "mounted-read-only-diagnostic",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
